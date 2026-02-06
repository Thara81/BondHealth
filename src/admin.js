// admin-hospital-dashboard.js
const express = require('express');
const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample doctors data
let doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    status: "Available",
    appointments: [
      { time: "09:00 AM", patient: "John Smith", token: "T001", condition: "Heart Checkup" },
      { time: "10:00 AM", patient: "Emma Wilson", token: "T002", condition: "BP Monitoring" },
      { time: "11:00 AM", patient: "Michael Brown", token: "T003", condition: "ECG Test" },
      { time: "02:00 PM", patient: "Sophia Lee", token: "T004", condition: "Consultation" }
    ]
  },
  {
    id: 2,
    name: "Dr. Robert Chen",
    specialty: "Neurology",
    status: "Available",
    appointments: [
      { time: "10:00 AM", patient: "Lisa Taylor", token: "T005", condition: "Migraine" },
      { time: "11:00 AM", patient: "James Wilson", token: "T006", condition: "CT Scan Review" }
    ]
  },
  {
    id: 3,
    name: "Dr. Emily Davis",
    specialty: "Pediatrics",
    status: "On Leave",
    appointments: [],
    leaveFrom: "2024-01-15",
    leaveTo: "2024-01-20",
    leaveReason: "Annual Leave"
  },
  {
    id: 4,
    name: "Dr. Michael Rodriguez",
    specialty: "Orthopedics",
    status: "Available",
    appointments: [
      { time: "09:30 AM", patient: "Thomas Clark", token: "T007", condition: "Knee Pain" }
    ]
  },
  {
    id: 5,
    name: "Dr. Priya Sharma",
    specialty: "Dermatology",
    status: "Available",
    appointments: [
      { time: "10:30 AM", patient: "Olivia Martinez", token: "T008", condition: "Skin Allergy" },
      { time: "11:30 AM", patient: "David Miller", token: "T009", condition: "Acne Treatment" }
    ]
  }
];

function generateHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hospital Admin Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            min-height: 100vh;
        }
        
        .hospital-header {
            background: white;
            box-shadow: 0 2px 10px rgba(6, 182, 212, 0.1);
            border-bottom: 3px solid #06b6d4;
        }
        
        .doctor-card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            border-left: 4px solid #06b6d4;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .doctor-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(6, 182, 212, 0.1);
        }
        
        .doctor-card.leave {
            border-left-color: #f59e0b;
            background: #fffbeb;
        }
        
        .status-available {
            background: #d1fae5;
            color: #059669;
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status-leave {
            background: #fef3c7;
            color: #d97706;
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .appointment-item {
            background: #f0f9ff;
            border-left: 3px solid #06b6d4;
            transition: all 0.2s ease;
        }
        
        .appointment-item:hover {
            background: #e0f2fe;
            transform: translateX(2px);
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .modal-content {
            background: white;
            border-radius: 12px;
            padding: 25px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .btn-cyan {
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-cyan:hover {
            background: linear-gradient(135deg, #0891b2, #0e7490);
            box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }
        
        .stats-card {
            background: white;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            border-top: 3px solid #06b6d4;
        }
    </style>
</head>
<body>
    <!-- Hospital Header -->
    <header class="hospital-header p-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-hospital text-white text-xl"></i>
            </div>
            <div>
                <h1 class="text-2xl font-bold text-gray-800">City General Hospital</h1>
                <p class="text-cyan-600 font-medium">Administration Dashboard</p>
            </div>
        </div>
        <div class="flex items-center gap-4">
            <div class="text-right">
                <p class="font-medium text-gray-800">Dr. Admin Manager</p>
                <p class="text-sm text-gray-500">Hospital Administrator</p>
            </div>
            <div class="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold">
                AM
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- Left Column - Doctors List -->
            <div class="lg:col-span-3">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-gray-800">Today's Available Doctors</h2>
                    <button class="btn-cyan" onclick="showLeaveForm()">
                        <i class="fas fa-calendar-times mr-2"></i> Update Leave
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${doctors.map(doctor => `
                    <div class="doctor-card p-4 ${doctor.status === 'On Leave' ? 'leave' : ''}" 
                         onclick="showDoctorDetails(${doctor.id})">
                        <div class="flex items-start justify-between">
                            <div>
                                <h3 class="font-bold text-gray-800 text-lg">${doctor.name}</h3>
                                <p class="text-cyan-600 font-medium">${doctor.specialty}</p>
                            </div>
                            <span class="${doctor.status === 'Available' ? 'status-available' : 'status-leave'}">
                                ${doctor.status}
                            </span>
                        </div>
                        
                        <div class="mt-4">
                            <div class="flex items-center text-gray-600 text-sm mb-2">
                                <i class="fas fa-calendar-alt text-cyan-500 mr-2"></i>
                                <span>${doctor.appointments.length} appointments today</span>
                            </div>
                            
                            ${doctor.status === 'On Leave' ? `
                            <div class="mt-3 p-3 bg-amber-50 rounded-lg">
                                <p class="text-amber-700 text-sm">
                                    <i class="fas fa-umbrella-beach mr-2"></i>
                                    On leave from ${doctor.leaveFrom} to ${doctor.leaveTo}
                                </p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>

            <!-- Right Column - Hospital Statistics -->
            <div>
                <h2 class="text-xl font-bold text-gray-800 mb-6">Hospital Statistics</h2>
                
                <div class="space-y-4">
                    <div class="stats-card">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-user-md text-cyan-600"></i>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm">Total Doctors</p>
                                <p class="text-2xl font-bold text-cyan-600">${doctors.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-check-circle text-green-600"></i>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm">Available Today</p>
                                <p class="text-2xl font-bold text-green-600">${doctors.filter(d => d.status === 'Available').length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-umbrella-beach text-amber-600"></i>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm">On Leave</p>
                                <p class="text-2xl font-bold text-amber-600">${doctors.filter(d => d.status === 'On Leave').length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-calendar-check text-purple-600"></i>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm">Today's Appointments</p>
                                <p class="text-2xl font-bold text-purple-600">${doctors.reduce((sum, doc) => sum + doc.appointments.length, 0)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-bed text-blue-600"></i>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm">Available Beds</p>
                                <p class="text-2xl font-bold text-blue-600">42</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-ambulance text-red-600"></i>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm">Emergency Cases</p>
                                <p class="text-2xl font-bold text-red-600">8</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Doctor Details Modal -->
    <div class="modal" id="doctorModal">
        <div class="modal-content">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800" id="doctorName">Doctor Details</h2>
                <button onclick="closeModal('doctorModal')" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div id="doctorDetails" class="space-y-4">
                <!-- Content will be loaded here -->
            </div>
        </div>
    </div>

    <!-- Update Leave Modal -->
    <div class="modal" id="leaveModal">
        <div class="modal-content">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800">Update Doctor Leave</h2>
                <button onclick="closeModal('leaveModal')" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <form id="leaveForm" onsubmit="submitLeave(event)">
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700 mb-2">Select Doctor</label>
                        <select id="leaveDoctorSelect" class="w-full p-3 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" required>
                            <option value="">Choose a doctor</option>
                            ${doctors.map(doctor => `
                            <option value="${doctor.id}">${doctor.name} - ${doctor.specialty}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-700 mb-2">From Date</label>
                            <input type="date" id="leaveFrom" class="w-full p-3 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" required>
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2">To Date</label>
                            <input type="date" id="leaveTo" class="w-full p-3 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" required>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2">Reason</label>
                        <textarea id="leaveReason" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" placeholder="Enter reason for leave..." required></textarea>
                    </div>
                    
                    <div class="flex gap-3 pt-4">
                        <button type="submit" class="btn-cyan flex-1">
                            <i class="fas fa-check mr-2"></i> Update Leave
                        </button>
                        <button type="button" onclick="closeModal('leaveModal')" class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <script>
        // Show doctor details
        function showDoctorDetails(doctorId) {
            const doctor = doctors.find(d => d.id === doctorId);
            if (!doctor) return;
            
            document.getElementById('doctorName').textContent = doctor.name + "'s Schedule";
            
            const content = \`
                <div class="p-4 bg-cyan-50 rounded-lg mb-4">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            \${doctor.name.charAt(0)}
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-800 text-lg">\${doctor.name}</h3>
                            <p class="text-cyan-600 font-medium">\${doctor.specialty}</p>
                            <span class="\${doctor.status === 'Available' ? 'status-available' : 'status-leave'}">
                                \${doctor.status}
                            </span>
                        </div>
                    </div>
                </div>
                
                \${doctor.status === 'On Leave' ? \`
                <div class="p-4 bg-amber-50 rounded-lg mb-4">
                    <h4 class="font-bold text-amber-800 mb-2">
                        <i class="fas fa-umbrella-beach mr-2"></i> Currently on Leave
                    </h4>
                    <p class="text-amber-700">\${doctor.leaveFrom} to \${doctor.leaveTo}</p>
                    <p class="text-amber-600 text-sm mt-1">Reason: \${doctor.leaveReason || 'Not specified'}</p>
                </div>
                \` : ''}
                
                <div>
                    <h4 class="font-bold text-gray-800 mb-3">Today's Appointments</h4>
                    \${doctor.appointments.length > 0 ? \`
                    <div class="space-y-3">
                        \${doctor.appointments.map(appt => \`
                        <div class="appointment-item p-4 rounded-lg">
                            <div class="flex justify-between items-center">
                                <div>
                                    <p class="font-medium text-gray-800">\${appt.patient}</p>
                                    <p class="text-sm text-gray-500">\${appt.condition}</p>
                                </div>
                                <div class="text-right">
                                    <span class="font-bold text-cyan-600 text-lg">\${appt.token}</span>
                                    <p class="text-sm text-gray-500">\${appt.time}</p>
                                </div>
                            </div>
                        </div>
                        \`).join('')}
                    </div>
                    \` : \`
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-calendar-times text-3xl mb-3 text-gray-300"></i>
                        <p>No appointments scheduled for today</p>
                    </div>
                    \`}
                </div>
                
                <div class="pt-4 border-t border-gray-200">
                    <button class="btn-cyan w-full" onclick="showLeaveFormForDoctor(\${doctor.id})">
                        <i class="fas fa-calendar-times mr-2"></i> Update Leave Status
                    </button>
                </div>
            \`;
            
            document.getElementById('doctorDetails').innerHTML = content;
            document.getElementById('doctorModal').style.display = 'flex';
        }
        
        // Show leave form
        function showLeaveForm() {
            document.getElementById('leaveModal').style.display = 'flex';
        }
        
        function showLeaveFormForDoctor(doctorId) {
            document.getElementById('leaveDoctorSelect').value = doctorId;
            showLeaveForm();
            closeModal('doctorModal');
        }
        
        // Close modal
        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }
        
        // Submit leave form
        function submitLeave(event) {
            event.preventDefault();
            
            const doctorId = parseInt(document.getElementById('leaveDoctorSelect').value);
            const doctor = doctors.find(d => d.id === doctorId);
            
            if (!doctor) {
                alert('Please select a doctor');
                return;
            }
            
            const fromDate = document.getElementById('leaveFrom').value;
            const toDate = document.getElementById('leaveTo').value;
            const reason = document.getElementById('leaveReason').value;
            
            // Update doctor status
            doctor.status = 'On Leave';
            doctor.leaveFrom = fromDate;
            doctor.leaveTo = toDate;
            doctor.leaveReason = reason;
            doctor.appointments = []; // Clear appointments when on leave
            
            // Update UI
            updateDoctorsDisplay();
            closeModal('leaveModal');
            showToast(\`Leave updated for \${doctor.name}\`);
        }
        
        // Update doctors display
        function updateDoctorsDisplay() {
            const doctorsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-4');
            if (!doctorsContainer) return;
            
            doctorsContainer.innerHTML = doctors.map(doctor => \`
            <div class="doctor-card p-4 \${doctor.status === 'On Leave' ? 'leave' : ''}" 
                 onclick="showDoctorDetails(\${doctor.id})">
                <div class="flex items-start justify-between">
                    <div>
                        <h3 class="font-bold text-gray-800 text-lg">\${doctor.name}</h3>
                        <p class="text-cyan-600 font-medium">\${doctor.specialty}</p>
                    </div>
                    <span class="\${doctor.status === 'Available' ? 'status-available' : 'status-leave'}">
                        \${doctor.status}
                    </span>
                </div>
                
                <div class="mt-4">
                    <div class="flex items-center text-gray-600 text-sm mb-2">
                        <i class="fas fa-calendar-alt text-cyan-500 mr-2"></i>
                        <span>\${doctor.appointments.length} appointments today</span>
                    </div>
                    
                    \${doctor.status === 'On Leave' ? \`
                    <div class="mt-3 p-3 bg-amber-50 rounded-lg">
                        <p class="text-amber-700 text-sm">
                            <i class="fas fa-umbrella-beach mr-2"></i>
                            On leave from \${doctor.leaveFrom} to \${doctor.leaveTo}
                        </p>
                    </div>
                    \` : ''}
                </div>
            </div>
            \`).join('');
            
            // Update statistics
            updateStatistics();
        }
        
        // Update statistics
        function updateStatistics() {
            // Update available doctors count
            const availableEl = document.querySelector('.stats-card:nth-child(2) .text-2xl');
            if (availableEl) {
                availableEl.textContent = doctors.filter(d => d.status === 'Available').length;
            }
            
            // Update leave count
            const leaveEl = document.querySelector('.stats-card:nth-child(3) .text-2xl');
            if (leaveEl) {
                leaveEl.textContent = doctors.filter(d => d.status === 'On Leave').length;
            }
            
            // Update appointments count
            const appointmentsEl = document.querySelector('.stats-card:nth-child(4) .text-2xl');
            if (appointmentsEl) {
                appointmentsEl.textContent = doctors.reduce((sum, doc) => sum + doc.appointments.length, 0);
            }
        }
        
        // Toast notification
        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-cyan-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slideUp';
            toast.innerHTML = \`
                <i class="fas fa-check-circle"></i>
                <span>\${message}</span>
            \`;
            
            // Add animation styles
            const style = document.createElement('style');
            style.textContent = \`
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease;
                }
            \`;
            document.head.appendChild(style);
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
                style.remove();
            }, 3000);
        }
        
        // Initialize date inputs
        document.addEventListener('DOMContentLoaded', () => {
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            
            document.getElementById('leaveFrom').min = today;
            document.getElementById('leaveFrom').value = today;
            document.getElementById('leaveTo').min = today;
            document.getElementById('leaveTo').value = tomorrowStr;
            
            // Close modals on outside click
            window.addEventListener('click', (event) => {
                if (event.target.classList.contains('modal')) {
                    event.target.style.display = 'none';
                }
            });
        });
    </script>
</body>
</html>
  `;
}

// API Routes
app.get('/', (req, res) => {
  res.send(generateHTML());
});

app.get('/api/doctors', (req, res) => {
  res.json({
    success: true,
    count: doctors.length,
    doctors: doctors
  });
});

app.get('/api/doctors/:id', (req, res) => {
  const doctor = doctors.find(d => d.id === parseInt(req.params.id));
  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }
  res.json({ success: true, doctor });
});

app.post('/api/doctors/:id/leave', (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    const { from, to, reason } = req.body;
    
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Update doctor leave status
    doctor.status = 'On Leave';
    doctor.leaveFrom = from;
    doctor.leaveTo = to;
    doctor.leaveReason = reason;
    doctor.appointments = []; // Clear appointments when on leave
    
    res.json({
      success: true,
      message: 'Leave status updated successfully',
      doctor
    });
  } catch (error) {
    console.error('Update leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/doctors/:id/available', (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Mark doctor as available
    doctor.status = 'Available';
    doctor.leaveFrom = undefined;
    doctor.leaveTo = undefined;
    doctor.leaveReason = undefined;
    
    res.json({
      success: true,
      message: 'Doctor marked as available',
      doctor
    });
  } catch (error) {
    console.error('Mark available error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Hospital Admin Dashboard running at http://localhost:${port}`);
  console.log(`Total doctors: ${doctors.length}`);
  console.log(`Available today: ${doctors.filter(d => d.status === 'Available').length}`);
});

module.exports = {
  doctors
};