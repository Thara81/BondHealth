const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { query, getClient } = require('./db/config');
const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
// ============================================
// PATIENT API ROUTES - Copied from Patient.js
// ============================================

// ============================================
// IN-MEMORY USER DATABASE (Replace with PostgreSQL later)
// ============================================

// Track active sessions
let activeSessions = new Map();

// ============================================
// JWT HELPER FUNCTIONS
// ============================================
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username, 
            role: user.role 
        }, 
        process.env.JWT_SECRET || 'fallback_secret', 
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    } catch (error) {
        return null;
    }
};

// ============================================
// AUTH MIDDLEWARE
// ============================================
const authenticate = (req, res, next) => {
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    if (!activeSessions.has(decoded.id)) {
        return res.status(401).json({ success: false, message: 'Session expired' });
    }

    req.user = decoded;
    next();
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        next();
    };
};

const requireAuth = (role) => {
    return (req, res, next) => {
        const token = req.cookies.token;
        if (!token) return res.redirect('/signin');

        const decoded = verifyToken(token);
        if (!decoded || !activeSessions.has(decoded.id)) {
            return res.redirect('/signin');
        }

        if (role && decoded.role !== role) {
            return res.status(403).send(`
                <h1>403 - Access Denied</h1>
                <p>You don't have permission to access this page.</p>
                <a href="/">Go to Home</a>
            `);
        }

        req.user = decoded;
        next();
    };
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    
    const { username, email, password, role, ...profile } = req.body;
    
    // Check if user exists
    const existing = await client.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'User exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const userResult = await client.query(
      `INSERT INTO users (username, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) RETURNING user_id, username, email, role`,
      [username, email, hashedPassword, role || 'patient']
    );
    
    const user = userResult.rows[0];

    // If patient, create patient profile
    if (role === 'patient' || !role) {
      await client.query(
        `INSERT INTO patients (
          user_id, full_name, email, phone, address, 
          emergency_contact_name, emergency_contact_phone, date_of_birth, gender
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          user.user_id, profile.name, email, profile.phone, profile.address,
          profile.emergencyContact, profile.emergencyPhone, profile.dob, profile.gender
        ]
      );
    }

    await client.query('COMMIT');

    const token = generateToken({ id: user.user_id, username, role: user.role });
    activeSessions.set(user.user_id, { token, loginTime: new Date().toISOString() });

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    res.json({
      success: true,
      token,
      user: { id: user.user_id, username, email, role: user.role }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    const result = await query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username || '', email || '']
    );
    
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: 'Wrong role' });
    }

    // Update last login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [user.user_id]);

    const token = generateToken({ 
      id: user.user_id, 
      username: user.username, 
      role: user.role 
    });
    
    activeSessions.set(user.user_id, { token, loginTime: new Date().toISOString() });

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    res.json({
      success: true,
      token,
      user: { id: user.user_id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        const decoded = verifyToken(token);
        if (decoded) activeSessions.delete(decoded.id);
    }
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out' });
});

// Get current user
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.user_id, u.username, u.email, u.role, u.created_at,
              CASE 
                WHEN u.role = 'patient' THEN row_to_json(p.*)
                WHEN u.role = 'doctor' THEN row_to_json(d.*)
                WHEN u.role = 'lab' THEN row_to_json(l.*)
                WHEN u.role = 'admin' THEN row_to_json(a.*)
              END as profile
       FROM users u
       LEFT JOIN patients p ON u.user_id = p.user_id
       LEFT JOIN doctors d ON u.user_id = d.user_id
       LEFT JOIN lab_technicians l ON u.user_id = l.user_id
       LEFT JOIN hospital_admins a ON u.user_id = a.user_id
       WHERE u.user_id = $1`,
      [req.user.id]
    );
    
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Patient API Routes
app.get('/api/patient', authenticate, authorize('patient'), async (req, res) => {
  try {
    const result = await query(
      `SELECT p.* FROM patients p
       JOIN users u ON p.user_id = u.user_id
       WHERE u.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/appointments', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'patient') {
      result = await query(
        `SELECT a.*, d.full_name as doctor_name, d.specialization 
         FROM appointments a
         JOIN doctors d ON a.doctor_id = d.doctor_id
         JOIN patients p ON a.patient_id = p.patient_id
         JOIN users u ON p.user_id = u.user_id
         WHERE u.user_id = $1
         ORDER BY a.appointment_date DESC`,
        [req.user.id]
      );
    } else if (req.user.role === 'doctor') {
      result = await query(
        `SELECT a.*, p.full_name as patient_name 
         FROM appointments a
         JOIN patients p ON a.patient_id = p.patient_id
         JOIN doctors d ON a.doctor_id = d.doctor_id
         JOIN users u ON d.user_id = u.user_id
         WHERE u.user_id = $1 AND a.appointment_date = CURRENT_DATE
         ORDER BY a.appointment_time`,
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/doctors', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT d.*, h.name as hospital_name 
       FROM doctors d
       JOIN hospitals h ON d.hospital_id = h.hospital_id
       WHERE d.status = 'Available'
       ORDER BY d.full_name`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/hospitals', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM hospitals ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'patient') {
      result = await query(
        `SELECT r.* FROM lab_reports r
         JOIN patients p ON r.patient_id = p.patient_id
         JOIN users u ON p.user_id = u.user_id
         WHERE u.user_id = $1
         ORDER BY r.created_at DESC`,
        [req.user.id]
      );
    } else {
      result = await query(
        `SELECT r.*, p.full_name as patient_name 
         FROM lab_reports r
         JOIN patients p ON r.patient_id = p.patient_id
         ORDER BY r.created_at DESC`
      );
    }
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/prescriptions', authenticate, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'patient') {
      result = await query(
        `SELECT p.* FROM prescriptions p
         JOIN patients pt ON p.patient_id = pt.patient_id
         JOIN users u ON pt.user_id = u.user_id
         WHERE u.user_id = $1 AND p.status = 'active'
         ORDER BY p.created_at DESC`,
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for signin (used by signin.js)
app.post('/api/signin', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const result = await query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );
    
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: 'Wrong role' });
    }

    // Update last login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [user.user_id]);

    const token = generateToken({ 
      id: user.user_id, 
      username: user.username, 
      role: user.role 
    });
    
    activeSessions.set(user.user_id, { token, loginTime: new Date().toISOString() });

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    // Determine redirect URL
    let redirectUrl = null;
    if (user.role === 'admin') {
        redirectUrl = '/admin-dashboard';
    } else if (user.role === 'doctor') {
        redirectUrl = '/doctor-dashboard';
    } else if (user.role === 'lab') {
        redirectUrl = '/lab-dashboard';
    } else if (user.role === 'patient') {
        redirectUrl = '/patient-dashboard';
    }
    
    res.json({
      success: true,
      message: 'Sign in successful!',
      user: { 
        id: user.user_id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
      redirectTo: redirectUrl
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/appointments', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { doctor_id, appointment_date, appointment_time, reason, type, location } = req.body;
    
    // Get patient_id from user
    const patientResult = await query(
      'SELECT patient_id FROM patients WHERE user_id = $1',
      [req.user.id]
    );
    
    const result = await query(
      `INSERT INTO appointments (
        patient_id, doctor_id, hospital_id, appointment_date,
        appointment_time, reason, type, location, status
      ) VALUES (
        $1, $2, (SELECT hospital_id FROM doctors WHERE doctor_id = $2),
        $3, $4, $5, $6, $7, 'pending'
      ) RETURNING *`,
      [patientResult.rows[0].patient_id, doctor_id, appointment_date, 
       appointment_time, reason, type, location]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/patient', authenticate, authorize('patient'), async (req, res) => {
  try {
    const result = await query(
      `UPDATE patients 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           emergency_contact_name = COALESCE($4, emergency_contact_name),
           emergency_contact_phone = COALESCE($5, emergency_contact_phone)
       WHERE user_id = $6
       RETURNING *`,
      [
        req.body.full_name,
        req.body.phone,
        req.body.address,
        req.body.emergency_contact_name,
        req.body.emergency_contact_phone,
        req.user.id
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SERVE PATIENT SIGNUP
// SERVE PATIENT SIGNUP - Add this near your other route definitions
// SERVE PATIENT SIGNUP - EXACT copy from signup_patient.js
// SERVE PATIENT SIGNUP - Using external file
app.get('/patient-signup', (req, res) => {
    try {
        const renderPatientSignup = require('./signup_patient.js');
        const html = renderPatientSignup();
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        console.error('Error loading signup_patient.js:', err);
        res.status(500).send(`
            <h1>500 - Patient Signup not found</h1>
            <p>Make sure signup_patient.js is in the same directory and exports the render function.</p>
            <a href="/">← Back to Home</a>
        `);
    }
});

// Serve the main HTML page
app.get('/', (req, res) => {
    const html = generateHTML();
    res.send(html);
});

// Serve signin page
// Add this route to your main Express app
// Serve signin page - Using external file
app.get('/signin', (req, res) => {
    try {
        const renderSignInPage = require('./signin.js');
        const html = renderSignInPage();
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        console.error('Error loading signin.js:', err);
        res.status(500).send(`
            <h1>500 - Sign In page not found</h1>
            <p>Make sure signin.js is in the same directory and exports the render function.</p>
            <a href="/">← Back to Home</a>
        `);
    }
});
// ============================================
// DOCTOR API ROUTES - Copied from Doctor.js
// ============================================

// Doctor API Routes
app.get('/api/doctor', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const result = await query(
      `SELECT d.*, h.name as hospital_name 
       FROM doctors d
       JOIN hospitals h ON d.hospital_id = h.hospital_id
       WHERE d.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/appointments/today', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const result = await query(
      `SELECT a.*, p.full_name as patient_name 
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       JOIN doctors d ON a.doctor_id = d.doctor_id
       WHERE d.user_id = $1 AND a.appointment_date = CURRENT_DATE
       ORDER BY a.appointment_time`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.get('/api/lab-reports', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, p.full_name as patient_name 
       FROM lab_reports r
       JOIN patients p ON r.patient_id = p.patient_id
       JOIN doctors d ON r.doctor_id = d.doctor_id
       WHERE d.user_id = $1 AND r.status = 'pending'
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/patients', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT p.* 
       FROM patients p
       JOIN appointments a ON p.patient_id = a.patient_id
       JOIN doctors d ON a.doctor_id = d.doctor_id
       WHERE d.user_id = $1
       ORDER BY p.full_name`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SERVE HOSPITAL DASHBOARD - Using Hospital.js
app.get('/hospital-dashboard', requireAuth('admin'), async (req, res) => {
    try {
        // Get hospital data for the logged-in admin
        const hospitalResult = await query(
            `SELECT h.* FROM hospitals h
             JOIN hospital_admins ha ON h.hospital_id = ha.hospital_id
             WHERE ha.user_id = $1`,
            [req.user.id]
        );
        
        // Get dashboard statistics
        const statsResult = await query(
            `SELECT 
                (SELECT COUNT(*) FROM doctors WHERE hospital_id = $1) as total_doctors,
                (SELECT COUNT(*) FROM appointments WHERE hospital_id = $1 AND appointment_date >= CURRENT_DATE) as upcoming_appointments,
                (SELECT COUNT(*) FROM medicines WHERE hospital_id = $1) as total_medicines,
                (SELECT COUNT(*) FROM lab_technicians WHERE hospital_id = $1) as total_labs`,
            [hospitalResult.rows[0]?.hospital_id || null]
        );
        
        // Get recent activity
        const recentResult = await query(
            `SELECT 'appointment' as type, a.appointment_date as date, 
                    p.full_name as patient_name, d.full_name as doctor_name
             FROM appointments a
             JOIN patients p ON a.patient_id = p.patient_id
             JOIN doctors d ON a.doctor_id = d.doctor_id
             WHERE a.hospital_id = $1
             ORDER BY a.created_at DESC
             LIMIT 10`,
            [hospitalResult.rows[0]?.hospital_id || null]
        );
        
        // Require and render the dashboard
        const renderHospitalDashboard = require('./Hospital.js');
        
        // Pass data to the render function
        const html = renderHospitalDashboard({
            hospital: hospitalResult.rows[0] || null,
            stats: statsResult.rows[0] || {},
            recentActivity: recentResult.rows || []
        });
        
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        console.error('Error loading Hospital.js:', err);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error - Hospital Dashboard</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; text-align: center; }
                    .error-container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h1 { color: #e53e3e; }
                    .back-btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4299e1; color: white; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>500 - Hospital Dashboard Error</h1>
                    <p>${err.message}</p>
                    <p>Make sure Hospital.js is in the same directory.</p>
                    <a href="/signin" class="back-btn">← Back to Sign In</a>
                </div>
            </body>
            </html>
        `);
    }
});

app.put('/api/doctor', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const result = await query(
      `UPDATE doctors 
       SET full_name = COALESCE($1, full_name),
           designation = COALESCE($2, designation),
           consultation_fee = COALESCE($3, consultation_fee),
           available_days = COALESCE($4, available_days),
           available_time = COALESCE($5, available_time),
           phone = COALESCE($6, phone),
           address = COALESCE($7, address)
       WHERE user_id = $8
       RETURNING *`,
      [
        req.body.full_name,
        req.body.designation,
        req.body.consultation_fee,
        req.body.available_days,
        req.body.available_time,
        req.body.phone,
        req.body.address,
        req.user.id
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/appointments/:id', authenticate, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const result = await query(
      `UPDATE appointments 
       SET status = COALESCE($1, status),
           appointment_time = COALESCE($2, appointment_time),
           reason = COALESCE($3, reason),
           notes = COALESCE($4, notes)
       WHERE appointment_id = $5
       RETURNING *`,
      [
        req.body.status,
        req.body.appointment_time,
        req.body.reason,
        req.body.notes,
        req.params.id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// API endpoint for feedback submission
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await query(
      'INSERT INTO feedback (name, email, message) VALUES ($1, $2, $3)',
      [name, email, message]
    );
    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint for signin
//app.post('/api/signin', (req, res) => {
  //  console.log('Sign in attempt:', req.body);
    // In real app: validate credentials against database
    //res.json({
      //  success: true,
        //message: 'Sign in successful!',
        //user: { name: req.body.email.split('@')[0] }
    //});
//});

// Serve static SDK files (simulated)
app.get('/_sdk/element_sdk.js', (req, res) => {
    res.send(`
        // Mock SDK
        window.elementSdk = {
            init: function(config) {
                console.log('SDK initialized', config);
                return this;
            },
            setConfig: function(config) {
                console.log('Config updated', config);
            }
        };
    `);
});

app.get('/_sdk/data_sdk.js', (req, res) => {
    res.send(`
        // Mock Data SDK
        console.log('Data SDK loaded');
    `);
});

function generateHTML() {
    return `
<!doctype html>
<html lang="en" class="h-full">
 <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BondHealth - Unifying Care, Strengthening Lives</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="/_sdk/element_sdk.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&amp;display=swap" rel="stylesheet">
  <style>
    body {
      box-sizing: border-box;
    }
    * {
      font-family: 'Poppins', sans-serif;
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes countUp {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }
    
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 30px rgba(0, 200, 255, 0.5); }
      50% { box-shadow: 0 0 60px rgba(0, 200, 255, 0.8); }
    }
    
    @keyframes drift {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(20px, -20px); }
      50% { transform: translate(-20px, 20px); }
      75% { transform: translate(20px, 10px); }
    }
    
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes bounce-subtle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    
    .animate-slide-up {
      animation: slideUp 0.8s ease-out forwards;
    }
    
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    
    .animate-pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }
    
    .stat-card {
      animation: countUp 0.6s ease-out forwards;
    }
    
    .stat-card:nth-child(1) { animation-delay: 0.1s; }
    .stat-card:nth-child(2) { animation-delay: 0.2s; }
    .stat-card:nth-child(3) { animation-delay: 0.3s; }
    .stat-card:nth-child(4) { animation-delay: 0.4s; }
    
    .review-bubble {
      position: relative;
    }
    
    .review-bubble::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 30px;
      border-width: 10px;
      border-style: solid;
      border-color: white transparent transparent transparent;
    }
    
    .gradient-text {
      background: linear-gradient(135deg, #00c8ff, #10ebebdc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .hero-gradient {
      background: linear-gradient(135deg, #53f8f8 0%, #ffffff 50%, #e0ffff 100%);
    }
    
    .floating-shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.15;
      animation: drift 15s infinite ease-in-out;
    }
    
    .rotating-ring {
      animation: spin-slow 20s linear infinite;
    }
    
    .card-hover {
      transition: all 0.3s ease;
    }
    
    .card-hover:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 86, 179, 0.15);
    }
    
    .slider-track {
      display: flex;
      animation: slide 20s linear infinite;
    }
    
    @keyframes slide {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    
    .reviews-container {
      max-height: 400px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: #0056b3 #e6f2ff;
    }
    
    .reviews-container::-webkit-scrollbar {
      width: 6px;
    }
    
    .reviews-container::-webkit-scrollbar-track {
      background: #e6f2ff;
      border-radius: 3px;
    }
    
    .reviews-container::-webkit-scrollbar-thumb {
      background: #0056b3;
      border-radius: 3px;
    }
  </style>
  <style>@view-transition { navigation: auto; }</style>
  <script src="/_sdk/data_sdk.js" type="text/javascript"></script>
 </head>
 <body class="h-full bg-white">
  <div id="app-wrapper" class="w-full h-full overflow-auto"><!-- Header -->
   <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     <div class="flex justify-between items-center py-4">
      <div class="flex items-center gap-2">
       <!-- Changed circle colors from #00c8ff to darker #0088cc for better contrast -->
       <svg class="w-10 h-10" viewbox="0 0 50 50" fill="none">
        <circle cx="25" cy="25" r="23" fill="#0088cc" opacity="0.2" />
        <path d="M25 8C15.6 8 8 15.6 8 25s7.6 17 17 17 17-7.6 17-17S34.4 8 25 8z" stroke="#0088cc" stroke-width="2" fill="none" />
        <path d="M25 15v20M15 25h20" stroke="#0088cc" stroke-width="3" stroke-linecap="round" />
        <circle cx="25" cy="25" r="6" fill="#00aadd" opacity="0.4" />
       </svg>
       <span class="text-2xl font-bold text-[#006d77]">Bond<span class="text-[#00c8ff]">Health</span></span>
      </div>
      <nav class="hidden md:flex items-center gap-8">
        <a href="#about" class="text-gray-600 hover:text-[#00c8ff] transition-all font-medium hover:scale-110">About</a>
        <a href="#network" class="text-gray-600 hover:text-[#00c8ff] transition-all font-medium hover:scale-110">Network</a>
        <a href="#hospitals" class="text-gray-600 hover:text-[#00c8ff] transition-all font-medium hover:scale-110">Hospitals</a>
        <a href="#reviews" class="text-gray-600 hover:text-[#00c8ff] transition-all font-medium hover:scale-110">Reviews</a>
      </nav>
      <!-- Sign In button now links to signin.html -->
      <button onclick="window.location.href='/signin'" class="bg-gradient-to-r from-[#00c8ff] to-[#00ffff] hover:from-[#00b0e0] hover:to-[#00e0e0] text-white px-6 py-2.5 rounded-full font-medium transition-all hover:shadow-lg hover:shadow-cyan-300 hover:scale-105"> Sign In </button>
     </div>
    </div>
   </header><!-- Hero Section -->
   <section class="hero-gradient py-20 lg:py-28 relative overflow-hidden">
    <!-- Changed floating shape colors for better contrast -->
    <div class="floating-shape top-20 right-10 w-64 h-64 bg-[#0088cc]" style="animation-delay: 0s;"></div>
    <div class="floating-shape bottom-10 left-10 w-96 h-96 bg-[#00aadd]" style="animation-delay: 2s;"></div>
    <div class="floating-shape top-40 left-1/4 w-48 h-48 bg-[#0099cc]" style="animation-delay: 4s;"></div>
    <div class="floating-shape bottom-40 right-1/3 w-72 h-72 bg-[#66ccff]" style="animation-delay: 6s;"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
     <div class="grid lg:grid-cols-2 gap-12 items-center">
      <div class="animate-slide-up">
       <h1 id="tagline" class="text-4xl md:text-5xl lg:text-6xl font-bold text-[#006d77] leading-tight mb-6 animate-slide-up">Unifying Care,<br><span class="gradient-text">Strengthening Lives.</span></h1>
       <p id="about-text" class="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">BondHealth is a state-wide digital ecosystem that bridges the gap between you and your medical providers. We securely centralize your health records, ensuring that your medical history, appointments, and lab results are accessible at every hospital you visit.</p>
       <div class="flex flex-wrap gap-4">
         <!-- Get Started button now links to signin.html -->
         <button onclick="window.location.href='/signin'" class="bg-gradient-to-r from-[#00c8ff] to-[#00ffff] hover:from-[#00b0e0] hover:to-[#00e0e0] text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:shadow-xl hover:shadow-cyan-300 animate-pulse-glow hover:scale-105"> Get Started Free </button>
         <button class="border-2 border-[#00c8ff] text-[#00c8ff] hover:bg-[#00c8ff] hover:text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:scale-105 hover:shadow-lg"> Learn More </button>
       </div>
      </div>
      <div class="relative hidden lg:block">
       <!-- Changed SVG circle colors for better contrast -->
       <svg class="w-full max-w-lg mx-auto" viewbox="0 0 400 350" fill="none">
        <!-- Central hub with rotating ring - changed colors -->
        <circle class="rotating-ring" cx="200" cy="175" r="60" fill="#0088cc" opacity="0.1" />
        <circle cx="200" cy="175" r="45" fill="#0088cc" opacity="0.2" style="animation: pulse-glow 3s ease-in-out infinite;" />
        <circle cx="200" cy="175" r="30" fill="url(#cyan-gradient)" />
        <path d="M200 155v40M180 175h40" stroke="white" stroke-width="4" stroke-linecap="round" />
        
        <!-- Gradient definition -->
        <defs>
          <lineargradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0088cc;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00aadd;stop-opacity:1" />
          </lineargradient>
        </defs>
        
        <!-- Connected nodes with animation - changed colors -->
        <circle cx="80" cy="100" r="25" fill="#0088cc" opacity="0.9" style="animation: bounce-subtle 2s ease-in-out infinite;">
          <animate attributename="r" values="25;28;25" dur="2s" repeatcount="indefinite" />
        </circle>
        <text x="80" y="105" text-anchor="middle" fill="white" font-size="20">🏥</text>
        <line x1="105" y1="115" x2="160" y2="155" stroke="#0088cc" stroke-width="2" stroke-dasharray="5,5" opacity="0.6">
          <animate attributename="stroke-dashoffset" values="0;-10" dur="1s" repeatcount="indefinite" />
        </line>
        
        <circle cx="320" cy="100" r="25" fill="#0099cc" opacity="0.9" style="animation: bounce-subtle 2s ease-in-out infinite; animation-delay: 0.5s;">
          <animate attributename="r" values="25;28;25" dur="2s" repeatcount="indefinite" begin="0.5s" />
        </circle>
        <text x="320" y="105" text-anchor="middle" fill="white" font-size="20">👨‍⚕️</text>
        <line x1="295" y1="115" x2="240" y2="155" stroke="#0099cc" stroke-width="2" stroke-dasharray="5,5" opacity="0.6">
          <animate attributename="stroke-dashoffset" values="0;-10" dur="1s" repeatcount="indefinite" />
        </line>
        
        <circle cx="80" cy="250" r="25" fill="#00aadd" opacity="0.9" style="animation: bounce-subtle 2s ease-in-out infinite; animation-delay: 1s;">
          <animate attributename="r" values="25;28;25" dur="2s" repeatcount="indefinite" begin="1s" />
        </circle>
        <text x="80" y="255" text-anchor="middle" fill="white" font-size="20">🔬</text>
        <line x1="105" y1="235" x2="160" y2="195" stroke="#00aadd" stroke-width="2" stroke-dasharray="5,5" opacity="0.6">
          <animate attributename="stroke-dashoffset" values="0;-10" dur="1s" repeatcount="indefinite" />
        </line>
        
        <circle cx="320" cy="250" r="25" fill="#66ccff" opacity="0.9" style="animation: bounce-subtle 2s ease-in-out infinite; animation-delay: 1.5s;">
          <animate attributename="r" values="25;28;25" dur="2s" repeatcount="indefinite" begin="1.5s" />
        </circle>
        <text x="320" y="255" text-anchor="middle" fill="white" font-size="20">👥</text>
        <line x1="295" y1="235" x2="240" y2="195" stroke="#66ccff" stroke-width="2" stroke-dasharray="5,5" opacity="0.6">
          <animate attributename="stroke-dashoffset" values="0;-10" dur="1s" repeatcount="indefinite" />
        </line>
       </svg>
      </div>
     </div>
    </div>
   </section><!-- Impact Slider Section -->
   <section id="network" class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">The Bond Network</h2>
      <p class="text-gray-600 max-w-2xl mx-auto">Our growing ecosystem connects healthcare providers across the state</p>
     </div>
     <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Changed stat card colors for better contrast -->
      <div class="stat-card bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg border border-blue-100 card-hover text-center hover:shadow-blue-200">
       <div class="text-4xl mb-3 animate-bounce-subtle" style="animation-duration: 3s;">🏥</div>
       <div class="text-3xl md:text-4xl font-bold text-[#0088cc] mb-1" data-count="120">120+</div>
       <div class="text-sm text-gray-600 font-medium">Partner Hospitals</div>
       <div class="text-xs text-gray-400 mt-1">Across the State</div>
      </div>
      <div class="stat-card bg-gradient-to-br from-cyan-50 to-white p-6 rounded-2xl shadow-lg border border-cyan-100 card-hover text-center hover:shadow-cyan-200">
       <div class="text-4xl mb-3 animate-bounce-subtle" style="animation-duration: 3.2s; animation-delay: 0.2s;">👥</div>
       <div class="text-3xl md:text-4xl font-bold text-[#0099cc] mb-1" data-count="50000">50,000+</div>
       <div class="text-sm text-gray-600 font-medium">Active Users</div>
       <div class="text-xs text-gray-400 mt-1">Lives Connected</div>
      </div>
      <div class="stat-card bg-gradient-to-br from-teal-50 to-white p-6 rounded-2xl shadow-lg border border-teal-100 card-hover text-center hover:shadow-teal-200">
       <div class="text-4xl mb-3 animate-bounce-subtle" style="animation-duration: 3.4s; animation-delay: 0.4s;">👨‍⚕️</div>
       <div class="text-3xl md:text-4xl font-bold text-[#00aadd] mb-1" data-count="1500">1,500+</div>
       <div class="text-sm text-gray-600 font-medium">Verified Doctors</div>
       <div class="text-xs text-gray-400 mt-1">Specialists On-call</div>
      </div>
      <div class="stat-card bg-gradient-to-br from-sky-50 to-white p-6 rounded-2xl shadow-lg border border-sky-100 card-hover text-center hover:shadow-sky-200">
       <div class="text-4xl mb-3 animate-bounce-subtle" style="animation-duration: 3.6s; animation-delay: 0.6s;">🔬</div>
       <div class="text-3xl md:text-4xl font-bold text-[#66ccff] mb-1" data-count="300">300+</div>
       <div class="text-sm text-gray-600 font-medium">Diagnostic Labs</div>
       <div class="text-xs text-gray-400 mt-1">Instant Results</div>
      </div>
     </div>
    </div>
   </section><!-- Hospitals Gallery -->
   <section id="hospitals" class="py-20 bg-gradient-to-b from-gray-50 to-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">Frequently Visited Hospitals</h2>
      <p class="text-gray-600 max-w-2xl mx-auto">Find and book appointments at our partner facilities</p>
     </div>
     <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Changed hospital card gradient colors -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden card-hover hover:shadow-blue-200">
       <div class="aspect-video bg-gradient-to-br from-[#0088cc] to-[#00aadd] flex items-center justify-center relative overflow-hidden">
        <div class="absolute inset-0 bg-white opacity-20" style="animation: drift 10s infinite ease-in-out;"></div>
        <svg class="w-20 h-20 text-white opacity-90 relative z-10" viewbox="0 0 24 24" fill="currentColor" style="animation: bounce-subtle 3s infinite;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" /></svg>
       </div>
       <div class="p-5">
        <h3 class="font-bold text-[#006d77] text-lg">City General Hospital</h3>
        <p class="text-gray-500 text-sm mb-4">Downtown Branch</p>
        <button class="w-full bg-gradient-to-r from-[#0088cc] to-[#00aadd] hover:from-[#0077bb] hover:to-[#0099cc] text-white py-2.5 rounded-lg font-medium transition-all text-sm hover:shadow-lg hover:scale-105"> Select Facility </button>
       </div>
      </div>
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden card-hover hover:shadow-cyan-200">
       <div class="aspect-video bg-gradient-to-br from-[#0099cc] to-[#66ccff] flex items-center justify-center relative overflow-hidden">
        <div class="absolute inset-0 bg-white opacity-20" style="animation: drift 12s infinite ease-in-out;"></div>
        <svg class="w-20 h-20 text-white opacity-90 relative z-10" viewbox="0 0 24 24" fill="currentColor" style="animation: bounce-subtle 3.2s infinite;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" /></svg>
       </div>
       <div class="p-5">
        <h3 class="font-bold text-[#006d77] text-lg">St. Mary's Medical</h3>
        <p class="text-gray-500 text-sm mb-4">Westside Campus</p>
        <button class="w-full bg-gradient-to-r from-[#0099cc] to-[#66ccff] hover:from-[#0088bb] hover:to-[#55bbee] text-white py-2.5 rounded-lg font-medium transition-all text-sm hover:shadow-lg hover:scale-105"> Select Facility </button>
       </div>
      </div>
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden card-hover hover:shadow-teal-200">
       <div class="aspect-video bg-gradient-to-br from-[#00aadd] to-[#00aadd] flex items-center justify-center relative overflow-hidden">
        <div class="absolute inset-0 bg-white opacity-20" style="animation: drift 14s infinite ease-in-out;"></div>
        <svg class="w-20 h-20 text-white opacity-90 relative z-10" viewbox="0 0 24 24" fill="currentColor" style="animation: bounce-subtle 3.4s infinite;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" /></svg>
       </div>
       <div class="p-5">
        <h3 class="font-bold text-[#006d77] text-lg">Regional Health Center</h3>
        <p class="text-gray-500 text-sm mb-4">North District</p>
        <button class="w-full bg-gradient-to-r from-[#00aadd] to-[#00aadd] hover:from-[#0099cc] hover:to-[#0099cc] text-white py-2.5 rounded-lg font-medium transition-all text-sm hover:shadow-lg hover:scale-105"> Select Facility </button>
       </div>
      </div>
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden card-hover hover:shadow-sky-200">
       <div class="aspect-video bg-gradient-to-br from-[#66ccff] to-[#99ddff] flex items-center justify-center relative overflow-hidden">
        <div class="absolute inset-0 bg-white opacity-20" style="animation: drift 16s infinite ease-in-out;"></div>
        <svg class="w-20 h-20 text-white opacity-90 relative z-10" viewbox="0 0 24 24" fill="currentColor" style="animation: bounce-subtle 3.6s infinite;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" /></svg>
       </div>
       <div class="p-5">
        <h3 class="font-bold text-[#006d77] text-lg">Unity Care Hospital</h3>
        <p class="text-gray-500 text-sm mb-4">East End Location</p>
        <button class="w-full bg-gradient-to-r from-[#66ccff] to-[#99ddff] hover:from-[#55bbee] hover:to-[#88ccee] text-white py-2.5 rounded-lg font-medium transition-all text-sm hover:shadow-lg hover:scale-105"> Book Now </button>
       </div>
      </div>
     </div>
    </div>
   </section><!-- Reviews Section -->
   <section id="reviews" class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">What Our Users Say</h2>
      <p class="text-gray-600 max-w-2xl mx-auto">Real experiences from patients across the state</p>
     </div>
     <div class="reviews-container space-y-6 pr-2">
      <div class="review-bubble bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
       <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#0056b3] to-[#0088cc] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">SJ</div>
        <div class="flex-1">
         <div class="flex items-center gap-2 mb-2"><span class="font-semibold text-[#1a365d]">Sarah Johnson</span><div class="flex text-yellow-400 text-sm">★★★★★</div></div>
         <p class="text-gray-600 text-sm leading-relaxed">"BondHealth made my hospital transfers seamless. All my records were instantly available when I switched to a new specialist. No more carrying folders of paperwork!"</p><span class="text-xs text-gray-400 mt-2 block">2 days ago</span>
        </div>
       </div>
      </div>
      <div class="review-bubble bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
       <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#14b8a6] to-[#0099cc] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">MR</div>
        <div class="flex-1">
         <div class="flex items-center gap-2 mb-2"><span class="font-semibold text-[#1a365d]">Michael Rodriguez</span><div class="flex text-yellow-400 text-sm">★★★★★</div></div>
         <p class="text-gray-600 text-sm leading-relaxed">"As someone with chronic conditions, having all my lab results and prescriptions in one place is a game-changer. My doctors can now collaborate effectively."</p><span class="text-xs text-gray-400 mt-2 block">1 week ago</span>
        </div>
       </div>
      </div>
      <div class="review-bubble bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
       <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#00aadd] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">EP</div>
        <div class="flex-1">
         <div class="flex items-center gap-2 mb-2"><span class="font-semibold text-[#1a365d]">Emily Patel</span><div class="flex text-yellow-400 text-sm">★★★★☆</div></div>
         <p class="text-gray-600 text-sm leading-relaxed">"The appointment booking feature saved me hours of phone calls. I can now see availability across multiple hospitals and choose what works for me."</p><span class="text-xs text-gray-400 mt-2 block">2 weeks ago</span>
        </div>
       </div>
      </div>
      <div class="review-bubble bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
       <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#66ccff] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">DW</div>
        <div class="flex-1">
         <div class="flex items-center gap-2 mb-2"><span class="font-semibold text-[#1a365d]">David Williams</span><div class="flex text-yellow-400 text-sm">★★★★★</div></div>
         <p class="text-gray-600 text-sm leading-relaxed">"Emergency room visits used to be stressful with all the paperwork. Now they have my complete history instantly. It literally saved my life during my last visit."</p><span class="text-xs text-gray-400 mt-2 block">3 weeks ago</span>
        </div>
       </div>
      </div>
      <div class="review-bubble bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
       <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#ec4899] to-[#99ddff] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">LT</div>
        <div class="flex-1">
         <div class="flex items-center gap-2 mb-2"><span class="font-semibold text-[#1a365d]">Lisa Thompson</span><div class="flex text-yellow-400 text-sm">★★★★★</div></div>
         <p class="text-gray-600 text-sm leading-relaxed">"Managing my elderly parents' healthcare has never been easier. I can track their appointments, medications, and test results all from my phone."</p><span class="text-xs text-gray-400 mt-2 block">1 month ago</span>
        </div>
       </div>
      </div>
     </div>
    </div>
   </section><!-- Footer -->
   <footer class="bg-gradient-to-br from-[#006d77] to-[#004d55] text-white py-16 relative overflow-hidden">
    <!-- Changed footer floating shape colors -->
    <div class="floating-shape top-10 right-20 w-64 h-64 bg-[#0088cc]" style="animation-delay: 0s; opacity: 0.1;"></div>
    <div class="floating-shape bottom-10 left-20 w-80 h-80 bg-[#00aadd]" style="animation-delay: 3s; opacity: 0.1;"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
     <div class="grid md:grid-cols-4 gap-10">
      <div class="md:col-span-2">
       <div class="flex items-center gap-2 mb-4">
        <!-- Changed footer logo colors -->
        <svg class="w-10 h-10" viewbox="0 0 50 50" fill="none">
          <circle cx="25" cy="25" r="23" fill="#0088cc" opacity="0.2" />
          <path d="M25 8C15.6 8 8 15.6 8 25s7.6 17 17 17 17-7.6 17-17S34.4 8 25 8z" stroke="#00aadd" stroke-width="2" fill="none" />
          <path d="M25 15v20M15 25h20" stroke="#00aadd" stroke-width="3" stroke-linecap="round" />
        </svg>
        <span class="text-2xl font-bold">BondHealth <span class="text-[#00aadd]">Connect</span></span>
       </div>
       <p class="text-gray-400 mb-6 max-w-md">Unifying healthcare across the state. Your health journey, simplified and secured.</p>
       <div class="space-y-2">
        <p class="flex items-center gap-3"><span class="text-[#00aadd]">📧</span> <a id="support-email" href="mailto:support@bondhealth.com" class="hover:text-[#00aadd] transition-colors">support@bondhealth.com</a></p>
        <p class="flex items-center gap-3"><span class="text-[#00aadd]">📞</span> <span id="helpline">1-800-BOND-HLTH</span> <span class="text-xs bg-[#00aadd] text-white px-2 py-0.5 rounded-full">24/7</span></p>
       </div>
      </div>
      <div>
       <h4 class="font-semibold text-lg mb-4">Quick Links</h4>
       <ul class="space-y-3">
        
        <li><a href="#" class="text-cyan-100 hover:text-[#00aadd] transition-all hover:translate-x-1 inline-block">Patient Privacy Rights</a></li>
        <li><a href="#" class="text-cyan-100 hover:text-[#00aadd] transition-all hover:translate-x-1 inline-block">Terms of Service</a></li>
        <li><a href="#" class="text-cyan-100 hover:text-[#00aadd] transition-all hover:translate-x-1 inline-block">Help Center</a></li>
       </ul>
      </div>
      <div>
       <h4 class="font-semibold text-lg mb-4">Stay Connected</h4>
       <div class="flex gap-3">
        <a href="#" class="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#0088cc] hover:to-[#00aadd] rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-300">
          <svg class="w-5 h-5" fill="currentColor" viewbox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
        </a>
        <a href="#" class="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#0088cc] hover:to-[#00aadd] rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-300">
          <svg class="w-5 h-5" fill="currentColor" viewbox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
        </a>
        <a href="#" class="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#0088cc] hover:to-[#00aadd] rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-300">
          <svg class="w-5 h-5" fill="currentColor" viewbox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
        </a>
       </div>
      </div>
     </div>
     <div class="border-t border-white/10 mt-12 pt-8 text-center text-gray-400 text-sm">
      <p>© 2024 BondHealth. All rights reserved. | HIPAA Compliant | SOC 2 Certified</p>
     </div>
    </div>
   </footer><!-- Floating Feedback Button -->
   <button id="feedback-btn" class="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#0088cc] to-[#00aadd] hover:from-[#0077bb] hover:to-[#0099cc] text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-2xl animate-pulse-glow hover:scale-110 z-50"> 💬 </button>
   
   <!-- Feedback Modal -->
   <div id="feedback-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden">
    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all">
     <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-[#1a365d]">Send Feedback</h3>
      <button id="close-modal" class="text-gray-400 hover:text-gray-600 text-2xl">×</button>
     </div>
     <form id="feedback-form" class="space-y-4">
      <div><label for="feedback-name" class="block text-sm font-medium text-gray-700 mb-1">Name</label> <input type="text" id="feedback-name" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088cc] focus:border-transparent outline-none" placeholder="Your name"></div>
      <div><label for="feedback-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label> <input type="email" id="feedback-email" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088cc] focus:border-transparent outline-none" placeholder="your@email.com"></div>
      <div><label for="feedback-message" class="block text-sm font-medium text-gray-700 mb-1">Message</label> <textarea id="feedback-message" rows="4" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088cc] focus:border-transparent outline-none resize-none" placeholder="Tell us what you think..."></textarea></div>
      <button type="submit" class="w-full bg-gradient-to-r from-[#0088cc] to-[#00aadd] hover:from-[#0077bb] hover:to-[#0099cc] text-white py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:scale-105"> Send Feedback </button>
     </form>
     <div id="feedback-success" class="hidden text-center py-8">
      <div class="text-5xl mb-4">✅</div>
      <h4 class="text-xl font-bold text-[#1a365d] mb-2">Thank You!</h4>
      <p class="text-gray-600">Your feedback has been received.</p>
     </div>
    </div>
   </div>
  </div>
  <script>
    const defaultConfig = {
      tagline: "Unifying Care, Strengthening Lives.",
      about_title: "About BondHealth",
      about_text: "BondHealth is a state-wide digital ecosystem that bridges the gap between you and your medical providers. We securely centralize your health records, ensuring that your medical history, appointments, and lab results are accessible at every hospital you visit.",
      support_email: "support@bondhealth.com",
      helpline: "1-800-BOND-HLTH",
      primary_color: "#0088cc",
      secondary_color: "#00aadd",
      background_color: "#ffffff",
      text_color: "#006d77",
      surface_color: "#e0ffff",
      font_family: "Poppins",
      font_size: 16
    };

    let config = { ...defaultConfig };

    async function onConfigChange(newConfig) {
      config = { ...config, ...newConfig };
      
      const taglineEl = document.getElementById('tagline');
      if (taglineEl) {
        const taglineText = config.tagline || defaultConfig.tagline;
        const parts = taglineText.split(',');
        if (parts.length > 1) {
          taglineEl.innerHTML = \`\${parts[0]},<br><span class="gradient-text">\${parts.slice(1).join(',').trim()}</span>\`;
        } else {
          taglineEl.textContent = taglineText;
        }
      }
      
      const aboutTextEl = document.getElementById('about-text');
      if (aboutTextEl) {
        aboutTextEl.textContent = config.about_text || defaultConfig.about_text;
      }
      
      const supportEmailEl = document.getElementById('support-email');
      if (supportEmailEl) {
        const email = config.support_email || defaultConfig.support_email;
        supportEmailEl.href = \`mailto:\${email}\`;
        supportEmailEl.textContent = email;
      }
      
      const helplineEl = document.getElementById('helpline');
      if (helplineEl) {
        helplineEl.textContent = config.helpline || defaultConfig.helpline;
      }
      
      const fontFamily = config.font_family || defaultConfig.font_family;
      document.body.style.fontFamily = \`\${fontFamily}, sans-serif\`;
      
      const baseSize = config.font_size || defaultConfig.font_size;
      document.documentElement.style.fontSize = \`\${baseSize}px\`;
    }

    function mapToCapabilities(config) {
      return {
        recolorables: [
          {
            get: () => config.background_color || defaultConfig.background_color,
            set: (value) => {
              config.background_color = value;
              if (window.elementSdk) window.elementSdk.setConfig({ background_color: value });
            }
          },
          {
            get: () => config.surface_color || defaultConfig.surface_color,
            set: (value) => {
              config.surface_color = value;
              if (window.elementSdk) window.elementSdk.setConfig({ surface_color: value });
            }
          },
          {
            get: () => config.text_color || defaultConfig.text_color,
            set: (value) => {
              config.text_color = value;
              if (window.elementSdk) window.elementSdk.setConfig({ text_color: value });
            }
          },
          {
            get: () => config.primary_color || defaultConfig.primary_color,
            set: (value) => {
              config.primary_color = value;
              if (window.elementSdk) window.elementSdk.setConfig({ primary_color: value });
            }
          },
          {
            get: () => config.secondary_color || defaultConfig.secondary_color,
            set: (value) => {
              config.secondary_color = value;
              if (window.elementSdk) window.elementSdk.setConfig({ secondary_color: value });
            }
          }
        ],
        borderables: [],
        fontEditable: {
          get: () => config.font_family || defaultConfig.font_family,
          set: (value) => {
            config.font_family = value;
            if (window.elementSdk) window.elementSdk.setConfig({ font_family: value });
          }
        },
        fontSizeable: {
          get: () => config.font_size || defaultConfig.font_size,
          set: (value) => {
            config.font_size = value;
            if (window.elementSdk) window.elementSdk.setConfig({ font_size: value });
          }
        }
      };
    }

    function mapToEditPanelValues(config) {
      return new Map([
        ["tagline", config.tagline || defaultConfig.tagline],
        ["about_title", config.about_title || defaultConfig.about_title],
        ["about_text", config.about_text || defaultConfig.about_text],
        ["support_email", config.support_email || defaultConfig.support_email],
        ["helpline", config.helpline || defaultConfig.helpline]
      ]);
    }

    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange,
        mapToCapabilities,
        mapToEditPanelValues
      });
    }

    // Feedback modal functionality
    const feedbackBtn = document.getElementById('feedback-btn');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeModal = document.getElementById('close-modal');
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackSuccess = document.getElementById('feedback-success');

    feedbackBtn.addEventListener('click', () => {
      feedbackModal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => {
      feedbackModal.classList.add('hidden');
      feedbackForm.classList.remove('hidden');
      feedbackSuccess.classList.add('hidden');
      feedbackForm.reset();
    });

    feedbackModal.addEventListener('click', (e) => {
      if (e.target === feedbackModal) {
        feedbackModal.classList.add('hidden');
        feedbackForm.classList.remove('hidden');
        feedbackSuccess.classList.add('hidden');
        feedbackForm.reset();
      }
    });

    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        name: document.getElementById('feedback-name').value,
        email: document.getElementById('feedback-email').value,
        message: document.getElementById('feedback-message').value,
        timestamp: new Date().toISOString()
      };
      
      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          feedbackForm.classList.add('hidden');
          feedbackSuccess.classList.remove('hidden');
          setTimeout(() => {
            feedbackModal.classList.add('hidden');
            feedbackForm.classList.remove('hidden');
            feedbackSuccess.classList.add('hidden');
            feedbackForm.reset();
          }, 2000);
        } else {
          alert('Failed to submit feedback. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Network error. Please try again.');
      }
    });

    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    onConfigChange(config);
  </script>
 </body>
</html>`;
}


// ============================================
// DASHBOARD PROTECTION MIDDLEWARE
// ============================================


// ============================================
// DASHBOARD ROUTES (Copied from signin.js)
// ============================================

// SERVE LAB DASHBOARD - Simple extraction, no data needed
// SERVE LAB DASHBOARD
app.get('/lab-dashboard', requireAuth('lab'), async (req, res) => {
    try {
        const renderLabDashboard = require('./labs.js');
        // Pass the actual user ID from the authenticated user
        const html = await renderLabDashboard(req.user.id);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        console.error('Error loading labs.js:', err);
        res.status(500).send(`
            <h1>500 - Lab Dashboard not found</h1>
            <p>Make sure labs.js is in the same directory and exports the render function</p>
            <a href="/signin">← Back to Sign In</a>
        `);
    }
});


// SERVE PATIENT DASHBOARD - Auto-extract everything from Patient.js
// SERVE PATIENT DASHBOARD
app.get('/patient-dashboard', requireAuth('patient'), async(req, res) => {
    try {
        const renderPatientDashboard = require('./Patient.js');
        const html = await renderPatientDashboard(req.user.id); // Pass user ID
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        console.error('Error loading Patient.js:', err);
        res.status(500).send(`
            <h1>500 - Patient Dashboard not found</h1>
            <p>Make sure Patient.js is in the same directory and exports the render function</p>
            <a href="/signin">← Back to Sign In</a>
        `);
    }
});

app.get('/admin-dashboard', requireAuth('admin'), async (req, res) => {
    try {
        const renderAdminDashboard = require('./admin.js');
        const html = await renderAdminDashboard(req.user.id); // Pass user ID
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        console.error('Error loading admin.js:', err);
        res.status(500).send(`
            <h1>500 - Admin Dashboard not found</h1>
            <p>Make sure admin.js is in the same directory and exports the render function</p>
            <a href="/signin">← Back to Sign In</a>
        `);
    }
});


// SERVE DOCTOR DASHBOARD - USING EXPORTED FUNCTION FROM Doctor.js
// SERVE DOCTOR DASHBOARD
app.get('/doctor-dashboard', requireAuth('doctor'), async(req, res) => {
    try {
        const renderDoctorDashboard = require('./Doctor.js');
        const html = await renderDoctorDashboard(req.user.id); // Pass user ID
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        console.error('Error loading Doctor.js:', err);
        res.status(500).send(`
            <h1>500 - Doctor Dashboard not found</h1>
            <p>Make sure Doctor.js is in the same directory and exports the render function</p>
            <a href="/signin">← Back to Sign In</a>
        `);
    }
});

// SERVE ADMIN SIGNUP
// SERVE HOSPITAL/ADMIN REGISTRATION
// SERVE ADMIN/HOSPITAL REGISTRATION - Complete version from HospitalRegistration.js
// SERVE HOSPITAL/ADMIN REGISTRATION - Using external file
app.get('/admin-signup', (req, res) => {
    try {
        const renderHospitalRegistration = require('./HospitalRegistration.js');
        const html = renderHospitalRegistration();
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        console.error('Error loading HospitalRegistration.js:', err);
        res.status(500).send(`
            <h1>500 - Hospital Registration not found</h1>
            <p>Make sure HospitalRegistration.js is in the same directory.</p>
            <a href="/signin">← Back to Sign In</a>
        `);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Sign In page: http://localhost:${PORT}/signin.js`);
    console.log(`Press Ctrl+C to stop the server`);
});