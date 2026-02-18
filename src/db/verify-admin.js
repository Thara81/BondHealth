const { query } = require('./config');

async function verifyAdminData() {
  console.log('🔍 Checking admin dashboard data...\n');
  
  // Check doctors
  const doctors = await query(`
    SELECT d.doctor_id, d.full_name, d.specialization, d.status, 
           h.name as hospital_name
    FROM doctors d
    JOIN hospitals h ON d.hospital_id = h.hospital_id
  `);
  console.log(`👨‍⚕️ Doctors found: ${doctors.rows.length}`);
  console.log(doctors.rows);
  
  // Check today's appointments
  const today = new Date().toISOString().split('T')[0];
  const appointments = await query(`
    SELECT a.*, p.full_name as patient_name, d.full_name as doctor_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.patient_id
    JOIN doctors d ON a.doctor_id = d.doctor_id
    WHERE a.appointment_date = CURRENT_DATE
  `);
  console.log(`\n📅 Today's appointments: ${appointments.rows.length}`);
  console.log(appointments.rows);
  
  // Check if any appointments exist at all
  const allAppointments = await query(`
    SELECT COUNT(*) FROM appointments
  `);
  console.log(`\n📊 Total appointments in database: ${allAppointments.rows[0].count}`);
}

verifyAdminData();