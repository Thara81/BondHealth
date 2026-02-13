const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const doctorData = {
  id: 'DR-2024-0567',
  name: 'Dr. Sarah Chen',
  designation: 'Senior Cardiologist',
  specialization: 'Cardiology',
  experience: '12 years',
  qualification: 'MD, DM Cardiology',
  email: 'sarah.chen@bondhealth.com',
  contact: '+1 (555) 234-5678',
  address: '456 Medical Center, Cardiology Wing',
  consultationFee: '$150',
  availableDays: ['Mon', 'Wed', 'Fri'],
  availableTime: '9:00 AM - 5:00 PM'
};

const todaysAppointments = [
  {
    id: 'APT-001',
    patientName: 'Alex Johnson',
    patientId: 'PT-2024-0847',
    time: '10:30 AM',
    reason: 'Routine heart checkup',
    status: 'confirmed',
    type: 'in-person'
  },
  {
    id: 'APT-002',
    patientName: 'Michael Brown',
    patientId: 'PT-2024-0923',
    time: '11:45 AM',
    reason: 'Chest pain evaluation',
    status: 'confirmed',
    type: 'in-person'
  },
  {
    id: 'APT-003',
    patientName: 'Emily Davis',
    patientId: 'PT-2024-0789',
    time: '2:30 PM',
    reason: 'Follow-up consultation',
    status: 'pending',
    type: 'online'
  },
  {
    id: 'APT-004',
    patientName: 'Robert Wilson',
    patientId: 'PT-2024-1012',
    time: '3:45 PM',
    reason: 'ECG review',
    status: 'confirmed',
    type: 'in-person'
  }
];

const labReports = [
  {
    id: 'LAB-001',
    patientName: 'Alex Johnson',
    patientId: 'PT-2024-0847',
    testName: 'Complete Blood Count',
    date: '2024-12-10',
    status: 'reviewed',
    findings: 'Normal ranges, no abnormalities detected'
  },
  {
    id: 'LAB-002',
    patientName: 'Michael Brown',
    patientId: 'PT-2024-0923',
    testName: 'ECG Report',
    date: '2024-12-09',
    status: 'pending',
    findings: 'Awaiting review'
  },
  {
    id: 'LAB-003',
    patientName: 'Sarah Miller',
    patientId: 'PT-2024-0567',
    testName: 'Lipid Profile',
    date: '2024-12-08',
    status: 'reviewed',
    findings: 'Slightly elevated cholesterol levels'
  }
];

const patients = [
  {
    id: 'PT-2024-0847',
    name: 'Alex Johnson',
    age: 32,
    gender: 'Male',
    lastVisit: '2024-11-15',
    nextAppointment: '2024-12-20',
    condition: 'Hypertension',
    status: 'active'
  },
  {
    id: 'PT-2024-0923',
    name: 'Michael Brown',
    age: 45,
    gender: 'Male',
    lastVisit: '2024-12-01',
    nextAppointment: '2024-12-28',
    condition: 'Cardiac Arrhythmia',
    status: 'active'
  },
  {
    id: 'PT-2024-0789',
    name: 'Emily Davis',
    age: 28,
    gender: 'Female',
    lastVisit: '2024-11-25',
    nextAppointment: '2025-01-05',
    condition: 'Heart Murmur',
    status: 'active'
  },
  {
    id: 'PT-2024-1012',
    name: 'Robert Wilson',
    age: 60,
    gender: 'Male',
    lastVisit: '2024-12-05',
    nextAppointment: '2024-12-22',
    condition: 'Coronary Artery Disease',
    status: 'active'
  },
  {
    id: 'PT-2024-0678',
    name: 'Jennifer Lee',
    age: 38,
    gender: 'Female',
    lastVisit: '2024-10-30',
    nextAppointment: '2025-01-15',
    condition: 'Hypertension',
    status: 'follow-up'
  }
];

app.get('/api/doctor', (req, res) => {
  res.json(doctorData);
});

app.get('/api/appointments/today', (req, res) => {
  res.json(todaysAppointments);
});

app.get('/api/lab-reports', (req, res) => {
  res.json(labReports);
});

app.get('/api/patients', (req, res) => {
  res.json(patients);
});

app.put('/api/doctor', (req, res) => {
  Object.assign(doctorData, req.body);
  res.json(doctorData);
});

app.put('/api/appointments/:id', (req, res) => {
  const appointmentId = req.params.id;
  const appointment = todaysAppointments.find(apt => apt.id === appointmentId);
  if (appointment) {
    Object.assign(appointment, req.body);
    res.json(appointment);
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

// ============================================
// FUNCTION TO GENERATE HTML
// ============================================
function generateDoctorHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BondHealth - Doctor Portal</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif;
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
          overflow-x: hidden;
        }
        
        .cyan-bg {
          background: linear-gradient(135deg, #00bcd4 0%, #00acc1 100%);
        }
        
        .cyan-light {
          background: #e0f7fa;
        }
        
        .cyan-dark {
          background: #00838f;
        }
        
        .cyan-text {
          color: #006064;
        }
        
        .cyan-border {
          border-color: #00bcd4;
        }
        
        .white-card {
          background: white;
          box-shadow: 0 10px 40px rgba(0, 188, 212, 0.1);
        }
        
        .background-animation {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }
        
        .floating-circle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(0, 188, 212, 0.1), rgba(255, 255, 255, 0.1));
          animation: float 25s infinite linear;
        }
        
        .floating-circle:nth-child(1) {
          width: 300px;
          height: 300px;
          top: -100px;
          left: -100px;
        }
        
        .floating-circle:nth-child(2) {
          width: 200px;
          height: 200px;
          top: 50%;
          right: -50px;
          animation-delay: -8s;
        }
        
        .floating-circle:nth-child(3) {
          width: 150px;
          height: 150px;
          bottom: -50px;
          left: 30%;
          animation-delay: -15s;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(40px, 40px) rotate(90deg);
          }
          50% {
            transform: translate(0, 80px) rotate(180deg);
          }
          75% {
            transform: translate(-40px, 40px) rotate(270deg);
          }
        }
        
        .wave-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100px;
          background: linear-gradient(90deg, 
            rgba(0, 188, 212, 0.2) 0%, 
            rgba(0, 172, 193, 0.3) 25%, 
            rgba(0, 131, 143, 0.2) 50%, 
            rgba(0, 96, 100, 0.3) 75%, 
            rgba(0, 188, 212, 0.2) 100%);
          opacity: 0.3;
          animation: wave 12s infinite ease-in-out;
        }
        
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(60px); }
        }
        
        .pulse-dot {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        .slide-in {
          animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 188, 212, 0.15);
        }
        
        .menu-item {
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
        }
        
        .menu-item:hover {
          border-left-color: #00bcd4;
          background: rgba(0, 188, 212, 0.05);
        }
        
        .menu-item.active {
          border-left-color: #00bcd4;
          background: rgba(0, 188, 212, 0.1);
          box-shadow: 0 4px 12px rgba(0, 188, 212, 0.1);
        }
        
        .btn-cyan {
          background: linear-gradient(135deg, #00bcd4, #00acc1);
          color: white;
          transition: all 0.3s ease;
        }
        
        .btn-cyan:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 188, 212, 0.3);
        }
        
        .btn-white {
          background: white;
          color: #006064;
          border: 2px solid #00bcd4;
          transition: all 0.3s ease;
        }
        
        .btn-white:hover {
          background: #00bcd4;
          color: white;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 188, 212, 0.1);
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #00bcd4;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #00acc1;
        }
        
        .text-cyan-gradient {
          background: linear-gradient(135deg, #00bcd4, #006064);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .modal-backdrop {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(5px);
        }
        
        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        
        .shine-effect::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to bottom right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(30deg);
          animation: shine 3s infinite;
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(30deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(30deg); }
        }
        
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .status-confirmed {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        .status-reviewed {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .status-active {
          background: #dcfce7;
          color: #166534;
        }
        
        .chat-bubble {
          position: absolute;
          width: 40px;
          height: 40px;
          background: #00bcd4;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .ripple-effect {
          position: relative;
          overflow: hidden;
        }
        
        .ripple-effect::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 5px;
          height: 5px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 0;
          border-radius: 100%;
          transform: scale(1, 1) translate(-50%);
          transform-origin: 50% 50%;
        }
        
        .ripple-effect:focus:not(:active)::after {
          animation: ripple 1s ease-out;
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0, 0);
            opacity: 0.5;
          }
          100% {
            transform: scale(20, 20);
            opacity: 0;
          }
        }
        
        @media (max-width: 768px) {
          .responsive-stack {
            flex-direction: column;
          }
          
          .responsive-text {
            font-size: 0.9rem;
          }
          
          .responsive-padding {
            padding: 1rem;
          }
          
          .doctor-header {
            flex-direction: column;
            text-align: center;
          }
          
          .doctor-avatar {
            margin: 0 auto 1rem auto;
          }
        }
      </style>
    </head>
    <body class="text-gray-800">
      <div class="background-animation">
        <div class="floating-circle"></div>
        <div class="floating-circle"></div>
        <div class="floating-circle"></div>
        <div class="wave-line"></div>
      </div>
      
      <div class="container mx-auto px-4 py-6">
        <div class="white-card rounded-2xl p-6 mb-6 fade-in shine-effect">
          <div class="flex doctor-header items-start md:items-center justify-between">
            <div class="flex items-center space-x-4 mb-4 md:mb-0">
              <button id="profileBtn" class="doctor-avatar w-20 h-20 cyan-bg rounded-full flex items-center justify-center text-2xl font-bold text-white hover-lift ripple-effect">
                ${doctorData.name.split(' ').map(n => n[0]).join('')}
              </button>
            </div>
            
            <div class="text-right">
              <h1 class="text-4xl font-bold cyan-text">${doctorData.name}</h1>
              <div class="flex flex-col md:flex-row md:items-center md:space-x-6 mt-2">
                <p class="text-lg cyan-text opacity-80">ID: ${doctorData.id}</p>
                <p class="text-xl font-semibold cyan-text">${doctorData.designation}</p>
              </div>
              <p class="text-gray-600 mt-2">${doctorData.specialization} • ${doctorData.experience} experience</p>
            </div>
          </div>
        </div>
        
        <div class="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-6 opacity-30"></div>
        
        <div class="flex flex-col lg:flex-row gap-6">
          <div class="lg:w-1/4">
            <div class="white-card rounded-2xl p-6 mb-6 slide-in">
              <div class="space-y-2">
                <button class="menu-item active w-full text-left p-4 rounded-xl flex items-center space-x-4" data-section="appointments">
                  <div class="w-12 h-12 cyan-bg rounded-xl flex items-center justify-center">
                    <i class="fas fa-calendar-day text-xl text-white"></i>
                  </div>
                  <div>
                    <p class="font-semibold cyan-text">Today's Appointments</p>
                    <p class="text-sm cyan-text opacity-75">View daily schedule</p>
                  </div>
                  <span class="ml-auto cyan-bg text-white text-xs px-2 py-1 rounded-full">${todaysAppointments.length}</span>
                </button>
                
                <button class="menu-item w-full text-left p-4 rounded-xl flex items-center space-x-4" data-section="lab-reports">
                  <div class="w-12 h-12 cyan-light rounded-xl flex items-center justify-center">
                    <i class="fas fa-file-medical-alt text-xl cyan-text"></i>
                  </div>
                  <div>
                    <p class="font-semibold cyan-text">Lab Reports</p>
                    <p class="text-sm cyan-text opacity-75">Review test results</p>
                  </div>
                  <span class="ml-auto cyan-dark text-white text-xs px-2 py-1 rounded-full">${labReports.length}</span>
                </button>
                
                <button class="menu-item w-full text-left p-4 rounded-xl flex items-center space-x-4" data-section="patients">
                  <div class="w-12 h-12 cyan-light rounded-xl flex items-center justify-center">
                    <i class="fas fa-user-friends text-xl cyan-text"></i>
                  </div>
                  <div>
                    <p class="font-semibold cyan-text">Patients</p>
                    <p class="text-sm cyan-text opacity-75">Manage patient list</p>
                  </div>
                  <span class="ml-auto cyan-bg text-white text-xs px-2 py-1 rounded-full">${patients.length}</span>
                </button>
              </div>
              
              <div class="mt-8 pt-6 border-t border-gray-200">
                <p class="text-sm font-semibold cyan-text mb-4">Quick Actions</p>
                <div class="grid grid-cols-2 gap-3">
                  <button class="cyan-light rounded-lg p-3 text-center hover:bg-cyan-100 transition-colors">
                    <i class="fas fa-video cyan-text mb-1"></i>
                    <p class="text-xs cyan-text">Online Consult</p>
                  </button>
                  <button class="cyan-light rounded-lg p-3 text-center hover:bg-cyan-100 transition-colors">
                    <i class="fas fa-prescription cyan-text mb-1"></i>
                    <p class="text-xs cyan-text">Write Prescription</p>
                  </button>
                  <button class="cyan-light rounded-lg p-3 text-center hover:bg-cyan-100 transition-colors">
                    <i class="fas fa-chart-line cyan-text mb-1"></i>
                    <p class="text-xs cyan-text">Analytics</p>
                  </button>
                  <button class="cyan-light rounded-lg p-3 text-center hover:bg-cyan-100 transition-colors">
                    <i class="fas fa-cog cyan-text mb-1"></i>
                    <p class="text-xs cyan-text">Settings</p>
                  </button>
                </div>
              </div>
              
              <div class="mt-6 p-4 cyan-light rounded-xl">
                <p class="text-sm font-semibold cyan-text mb-2">Today's Stats</p>
                <div class="flex justify-between">
                  <div class="text-center">
                    <p class="text-2xl font-bold cyan-text">${todaysAppointments.length}</p>
                    <p class="text-xs cyan-text opacity-75">Appointments</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold cyan-text">${labReports.filter(r => r.status === 'pending').length}</p>
                    <p class="text-xs cyan-text opacity-75">Pending Reports</p>
                  </div>
                  <div class="text-center">
                    <p class="text-2xl font-bold cyan-text">${patients.length}</p>
                    <p class="text-xs cyan-text opacity-75">Patients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="lg:w-3/4">
            <div id="contentArea" class="white-card rounded-2xl p-6 min-h-[600px] fade-in scrollbar-thin">
              <div id="appointmentsContent">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-2xl font-bold cyan-text">Today's Appointments</h2>
                  <div class="flex space-x-3">
                    <button class="px-4 py-2 cyan-light rounded-lg text-sm cyan-text font-medium">
                      <i class="fas fa-filter mr-2"></i>Filter
                    </button>
                    <button class="px-4 py-2 btn-cyan rounded-lg text-sm">
                      <i class="fas fa-plus mr-2"></i>Add Slot
                    </button>
                  </div>
                </div>
                
                <div class="grid gap-6">
                  ${todaysAppointments.map(apt => `
                    <div class="cyan-light rounded-xl p-6 hover-lift">
                      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <div class="flex items-center space-x-4 mb-4 md:mb-0">
                          <div class="w-16 h-16 cyan-bg rounded-full flex items-center justify-center">
                            <i class="fas fa-user-injured text-xl text-white"></i>
                          </div>
                          <div>
                            <h3 class="text-xl font-bold cyan-text">${apt.patientName}</h3>
                            <p class="text-gray-600">ID: ${apt.patientId}</p>
                            <p class="text-gray-700 mt-1"><i class="fas fa-stethoscope mr-2 cyan-text"></i>${apt.reason}</p>
                          </div>
                        </div>
                        <div class="flex flex-col md:items-end space-y-3">
                          <div class="flex items-center space-x-4">
                            <span class="status-badge ${apt.status === 'confirmed' ? 'status-confirmed' : 'status-pending'}">
                              ${apt.status}
                            </span>
                            <span class="text-lg font-bold cyan-text">${apt.time}</span>
                          </div>
                          <div class="flex space-x-3">
                            <button class="px-4 py-2 btn-cyan rounded-lg start-consult-btn" data-id="${apt.id}" data-patient="${apt.patientName}">
                              <i class="fas fa-play-circle mr-2"></i>Start Consult
                            </button>
                            <button class="px-4 py-2 btn-white rounded-lg reschedule-btn" data-id="${apt.id}">
                              Reschedule
                            </button>
                            ${apt.type === 'online' ? `
                              <button class="px-4 py-2 cyan-light rounded-lg cyan-text video-btn" data-id="${apt.id}">
                                <i class="fas fa-video mr-2"></i>Video Call
                              </button>
                            ` : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div class="flex items-center space-x-4">
                          <span class="text-sm cyan-text">
                            <i class="fas fa-calendar-alt mr-1"></i>
                            Today • ${apt.type === 'online' ? 'Online Consultation' : 'In-person Visit'}
                          </span>
                        </div>
                        <div class="flex space-x-2">
                          <button class="text-sm cyan-bg text-white px-3 py-1 rounded">
                            <i class="fas fa-file-medical mr-1"></i>View History
                          </button>
                          <button class="text-sm btn-white px-3 py-1 rounded">
                            <i class="fas fa-comment-medical mr-1"></i>Message
                          </button>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
                
                <div class="mt-8 cyan-light rounded-xl p-6">
                  <h3 class="text-lg font-semibold cyan-text mb-4">Schedule Summary</h3>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="white-card p-4 rounded-xl text-center">
                      <p class="text-3xl font-bold cyan-text">${todaysAppointments.filter(a => a.status === 'confirmed').length}</p>
                      <p class="text-sm cyan-text opacity-75">Confirmed Appointments</p>
                    </div>
                    <div class="white-card p-4 rounded-xl text-center">
                      <p class="text-3xl font-bold cyan-text">${todaysAppointments.filter(a => a.type === 'online').length}</p>
                      <p class="text-sm cyan-text opacity-75">Online Consults</p>
                    </div>
                    <div class="white-card p-4 rounded-xl text-center">
                      <p class="text-3xl font-bold cyan-text">${todaysAppointments.filter(a => a.type === 'in-person').length}</p>
                      <p class="text-sm cyan-text opacity-75">In-person Visits</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div id="labReportsContent" class="hidden"></div>
              <div id="patientsContent" class="hidden"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="profileModal" class="fixed inset-0 bg-white/95 flex items-center justify-center z-50 hidden p-4 modal-backdrop">
        <div class="white-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold cyan-text">Doctor Profile</h2>
            <button id="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <div class="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <div class="w-32 h-32 cyan-bg rounded-full flex items-center justify-center text-4xl font-bold text-white">
              ${doctorData.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div class="flex-1">
              <h3 class="text-3xl font-bold cyan-text">${doctorData.name}</h3>
              <p class="text-xl cyan-text opacity-80 mt-1">${doctorData.designation}</p>
              <p class="text-gray-600 mt-2">${doctorData.qualification}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            ${Object.entries({
              'Doctor ID': doctorData.id,
              'Specialization': doctorData.specialization,
              'Experience': doctorData.experience,
              'Consultation Fee': doctorData.consultationFee,
              'Available Days': doctorData.availableDays.join(', '),
              'Available Time': doctorData.availableTime,
              'Email': doctorData.email,
              'Contact': doctorData.contact
            }).map(([key, value]) => `
              <div class="cyan-light p-4 rounded-xl">
                <p class="text-sm cyan-text">${key}</p>
                <p class="font-semibold">${value}</p>
              </div>
            `).join('')}
          </div>
          
          <div class="cyan-light p-6 rounded-xl mb-6">
            <h3 class="text-lg font-semibold cyan-text mb-4">Clinic Information</h3>
            <div class="space-y-4">
              <div>
                <p class="text-sm cyan-text">Clinic Address</p>
                <p class="font-semibold">${doctorData.address}</p>
              </div>
              <div>
                <p class="text-sm cyan-text">Consultation Hours</p>
                <p class="font-semibold">${doctorData.availableTime} (${doctorData.availableDays.join(', ')})</p>
              </div>
              <div>
                <p class="text-sm cyan-text">Services Offered</p>
                <div class="flex flex-wrap gap-2 mt-2">
                  <span class="px-3 py-1 cyan-bg text-white rounded-full text-sm">Cardiac Consultation</span>
                  <span class="px-3 py-1 cyan-bg text-white rounded-full text-sm">ECG Interpretation</span>
                  <span class="px-3 py-1 cyan-bg text-white rounded-full text-sm">Stress Testing</span>
                  <span class="px-3 py-1 cyan-bg text-white rounded-full text-sm">Holter Monitoring</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-4">
            <button id="editProfileBtn" class="px-6 py-3 btn-cyan rounded-lg">
              <i class="fas fa-edit mr-2"></i>Edit Profile
            </button>
            <button id="closeModalBtn" class="px-6 py-3 btn-white rounded-lg">
              Close
            </button>
          </div>
        </div>
      </div>
      
      <div id="toast" class="fixed bottom-4 right-4 white-card rounded-lg p-4 max-w-sm hidden z-50 fade-in">
        <div class="flex items-center">
          <i id="toastIcon" class="fas fa-info-circle cyan-text mr-3"></i>
          <div>
            <p id="toastTitle" class="font-semibold cyan-text"></p>
            <p id="toastMessage" class="text-sm text-gray-600"></p>
          </div>
          <button id="closeToast" class="ml-auto text-gray-400 hover:text-gray-600">&times;</button>
        </div>
      </div>
      
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const menuItems = document.querySelectorAll('.menu-item');
          const contentSections = {
            appointments: document.getElementById('appointmentsContent'),
            'lab-reports': document.getElementById('labReportsContent'),
            patients: document.getElementById('patientsContent')
          };
          
          loadLabReportsContent();
          loadPatientsContent();
          
          menuItems.forEach(item => {
            item.addEventListener('click', function() {
              const section = this.dataset.section;
              
              menuItems.forEach(i => i.classList.remove('active'));
              this.classList.add('active');
              
              Object.values(contentSections).forEach(sec => sec.classList.add('hidden'));
              contentSections[section].classList.remove('hidden');
              contentSections[section].classList.add('fade-in');
              
              setTimeout(() => {
                contentSections[section].classList.remove('fade-in');
              }, 600);
              
              const sectionName = this.querySelector('.font-semibold').textContent;
              showToast('Section Changed', \`Viewing \${sectionName}\`);
            });
          });
          
          const profileModal = document.getElementById('profileModal');
          const profileBtn = document.getElementById('profileBtn');
          const closeModalBtns = document.querySelectorAll('#closeModal, #closeModalBtn');
          
          profileBtn.addEventListener('click', () => {
            profileModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
          });
          
          closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
              profileModal.classList.add('hidden');
              document.body.style.overflow = '';
            });
          });
          
          profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
              profileModal.classList.add('hidden');
              document.body.style.overflow = '';
            }
          });
          
          document.getElementById('editProfileBtn').addEventListener('click', () => {
            showToast('Edit Profile', 'Profile editing feature is available now!', 'success');
            setTimeout(() => {
              profileModal.classList.add('hidden');
              document.body.style.overflow = '';
            }, 1000);
          });
          
          document.addEventListener('click', function(e) {
            if (e.target.classList.contains('start-consult-btn')) {
              const appointmentId = e.target.dataset.id;
              const patientName = e.target.dataset.patient;
              showToast('Consultation Started', \`Starting consultation with \${patientName}\`, 'success');
            }
            
            if (e.target.classList.contains('reschedule-btn')) {
              const appointmentId = e.target.dataset.id;
              showToast('Reschedule', \`Opening reschedule options for appointment \${appointmentId}\`, 'info');
            }
            
            if (e.target.classList.contains('video-btn')) {
              const appointmentId = e.target.dataset.id;
              showToast('Video Call', 'Initiating video consultation...', 'info');
            }
          });
          
          const toast = document.getElementById('toast');
          const toastTitle = document.getElementById('toastTitle');
          const toastMessage = document.getElementById('toastMessage');
          const toastIcon = document.getElementById('toastIcon');
          
          window.showToast = function(title, message, type = 'info') {
            toastTitle.textContent = title;
            toastMessage.textContent = message;
            
            const icons = {
              'success': 'fa-check-circle',
              'error': 'fa-exclamation-circle',
              'warning': 'fa-exclamation-triangle',
              'info': 'fa-info-circle'
            };
            
            ['fa-check-circle', 'fa-exclamation-circle', 'fa-exclamation-triangle', 'fa-info-circle']
              .forEach(cls => toastIcon.classList.remove(cls));
            
            toastIcon.classList.add(icons[type] || 'fa-info-circle');
            
            toastIcon.className = toastIcon.className.replace(/text-\\S+/g, '');
            toastIcon.classList.add('cyan-text');
            
            toast.classList.remove('hidden');
            toast.classList.add('fade-in');
            
            setTimeout(() => {
              toast.classList.add('hidden');
              toast.classList.remove('fade-in');
            }, 4000);
          };
          
          document.getElementById('closeToast').addEventListener('click', () => {
            toast.classList.add('hidden');
            toast.classList.remove('fade-in');
          });
          
          setTimeout(() => {
            showToast('Welcome Doctor', 'Your dashboard is ready! Have a productive day.', 'success');
          }, 1000);
          
          const floatingCircles = document.querySelectorAll('.floating-circle');
          floatingCircles.forEach(circle => {
            circle.addEventListener('mouseenter', () => {
              circle.style.animationPlayState = 'paused';
            });
            
            circle.addEventListener('mouseleave', () => {
              circle.style.animationPlayState = 'running';
            });
          });
        });
        
        async function loadLabReportsContent() {
          const response = await fetch('/api/lab-reports');
          const reports = await response.json();
          
          const labReportsContent = document.getElementById('labReportsContent');
          labReportsContent.innerHTML = \`
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold cyan-text">Lab Reports</h2>
              <div class="flex space-x-3">
                <button class="px-4 py-2 cyan-light rounded-lg text-sm cyan-text font-medium">
                  <i class="fas fa-filter mr-2"></i>Filter
                </button>
                <button class="px-4 py-2 btn-cyan rounded-lg text-sm">
                  <i class="fas fa-file-upload mr-2"></i>Upload Report
                </button>
              </div>
            </div>
            
            <div class="grid gap-6">
              \${reports.map(report => \`
                <div class="cyan-light rounded-xl p-6 hover-lift">
                  <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div class="flex items-center space-x-4 mb-4 md:mb-0">
                      <div class="w-16 h-16 \${report.status === 'reviewed' ? 'cyan-bg' : 'cyan-dark'} rounded-full flex items-center justify-center">
                        <i class="fas \${report.testName.includes('ECG') ? 'fa-heartbeat' : 'fa-vial'} text-xl text-white"></i>
                      </div>
                      <div>
                        <h3 class="text-xl font-bold cyan-text">\${report.patientName}</h3>
                        <p class="text-gray-600">ID: \${report.patientId}</p>
                        <p class="text-gray-700 mt-1"><i class="fas fa-flask mr-2 cyan-text"></i>\${report.testName}</p>
                      </div>
                    </div>
                    <div class="flex flex-col md:items-end space-y-3">
                      <div class="flex items-center space-x-4">
                        <span class="status-badge \${report.status === 'reviewed' ? 'status-reviewed' : 'status-pending'}">
                          \${report.status}
                        </span>
                        <span class="text-sm cyan-text">\${new Date(report.date).toLocaleDateString()}</span>
                      </div>
                      <div class="flex space-x-3">
                        <button class="px-4 py-2 btn-cyan rounded-lg view-report-btn" data-id="\${report.id}">
                          <i class="fas fa-eye mr-2"></i>View Report
                        </button>
                        <button class="px-4 py-2 btn-white rounded-lg write-findings-btn" data-id="\${report.id}">
                          <i class="fas fa-edit mr-2"></i>\${report.status === 'reviewed' ? 'Update' : 'Add Findings'}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  \${report.findings ? \`
                    <div class="mt-4 p-4 white-card rounded-lg border cyan-border">
                      <p class="text-sm cyan-text font-medium mb-2">Findings:</p>
                      <p class="text-gray-700">\${report.findings}</p>
                    </div>
                  \` : ''}
                  
                  <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div class="flex items-center space-x-4">
                      <button class="text-sm cyan-bg text-white px-3 py-1 rounded">
                        <i class="fas fa-download mr-1"></i>Download PDF
                      </button>
                      <button class="text-sm btn-white px-3 py-1 rounded">
                        <i class="fas fa-share-alt mr-1"></i>Share
                      </button>
                    </div>
                    <button class="text-sm cyan-dark text-white px-3 py-1 rounded print-report-btn" data-id="\${report.id}">
                      <i class="fas fa-print mr-1"></i>Print
                    </button>
                  </div>
                </div>
              \`).join('')}
            </div>
            
            <div class="mt-8 cyan-light rounded-xl p-6">
              <h3 class="text-lg font-semibold cyan-text mb-4">Reports Overview</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="white-card p-4 rounded-xl text-center">
                  <p class="text-3xl font-bold cyan-text">\${reports.length}</p>
                  <p class="text-sm cyan-text opacity-75">Total Reports</p>
                </div>
                <div class="white-card p-4 rounded-xl text-center">
                  <p class="text-3xl font-bold cyan-text">\${reports.filter(r => r.status === 'reviewed').length}</p>
                  <p class="text-sm cyan-text opacity-75">Reviewed</p>
                </div>
                <div class="white-card p-4 rounded-xl text-center">
                  <p class="text-3xl font-bold cyan-text">\${reports.filter(r => r.status === 'pending').length}</p>
                  <p class="text-sm cyan-text opacity-75">Pending Review</p>
                </div>
              </div>
            </div>
          \`;
          
          document.querySelectorAll('.view-report-btn').forEach(btn => {
            btn.addEventListener('click', function() {
              const reportId = this.dataset.id;
              showToast('View Report', \`Opening report \${reportId}\`, 'info');
            });
          });
          
          document.querySelectorAll('.write-findings-btn').forEach(btn => {
            btn.addEventListener('click', function() {
              const reportId = this.dataset.id;
              showToast('Add Findings', \`Opening editor for report \${reportId}\`, 'success');
            });
          });
        }
        
        async function loadPatientsContent() {
          const response = await fetch('/api/patients');
          const patients = await response.json();
          
          const patientsContent = document.getElementById('patientsContent');
          patientsContent.innerHTML = \`
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold cyan-text">Patients</h2>
              <div class="flex space-x-3">
                <div class="relative">
                  <input type="text" placeholder="Search patients..." class="pl-10 pr-4 py-2 cyan-light rounded-lg text-sm cyan-text focus:outline-none focus:ring-2 focus:ring-cyan-400">
                  <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
                <button class="px-4 py-2 btn-cyan rounded-lg text-sm">
                  <i class="fas fa-user-plus mr-2"></i>Add Patient
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              \${patients.map(patient => \`
                <div class="cyan-light rounded-xl p-6 hover-lift relative">
                  <div class="chat-bubble" style="top: -20px; right: -20px; display: none;">
                    <i class="fas fa-comment"></i>
                  </div>
                  
                  <div class="flex items-center space-x-4 mb-4">
                    <div class="w-16 h-16 cyan-bg rounded-full flex items-center justify-center">
                      <i class="fas fa-user-injured text-2xl text-white"></i>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold cyan-text">\${patient.name}</h3>
                      <p class="text-gray-600">ID: \${patient.id}</p>
                      <p class="text-sm cyan-text">\${patient.age} years • \${patient.gender}</p>
                    </div>
                  </div>
                  
                  <div class="space-y-3 mb-4">
                    <div class="flex justify-between">
                      <span class="text-sm cyan-text opacity-75">Condition:</span>
                      <span class="text-sm font-medium cyan-text">\${patient.condition}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm cyan-text opacity-75">Last Visit:</span>
                      <span class="text-sm cyan-text">\${new Date(patient.lastVisit).toLocaleDateString()}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm cyan-text opacity-75">Next Appointment:</span>
                      <span class="text-sm cyan-text font-semibold">\${new Date(patient.nextAppointment).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span class="status-badge status-active">
                      \${patient.status}
                    </span>
                    <div class="flex space-x-2">
                      <button class="w-10 h-10 cyan-bg rounded-full flex items-center justify-center text-white chat-btn" data-patient="\${patient.id}" title="Chat">
                        <i class="fas fa-comment"></i>
                      </button>
                      <button class="w-10 h-10 cyan-dark rounded-full flex items-center justify-center text-white video-consult-btn" data-patient="\${patient.id}" title="Video Consult">
                        <i class="fas fa-video"></i>
                      </button>
                      <button class="w-10 h-10 btn-white rounded-full flex items-center justify-center cyan-text view-profile-btn" data-patient="\${patient.id}" title="View Profile">
                        <i class="fas fa-user-md"></i>
                      </button>
                    </div>
                  </div>
                </div>
              \`).join('')}
            </div>
            
            <div class="cyan-light rounded-xl p-6">
              <h3 class="text-lg font-semibold cyan-text mb-4">Patient Statistics</h3>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="white-card p-4 rounded-xl text-center">
                  <p class="text-3xl font-bold cyan-text">\${patients.length}</p>
                  <p class="text-sm cyan-text opacity-75">Total Patients</p>
                </div>
                <div class="white-card p-4 rounded-xl text-center">
                  <p class="text-3xl font-bold cyan-text">\${patients.filter(p => p.age < 40).length}</p>
                  <p class="text-sm cyan-text opacity-75">Under 40</p>
                </div>
                <div class="white-card p-4 rounded-xl text-center">
                  <p class="text-3xl font-bold cyan-text">\${patients.filter(p => p.gender === 'Male').length}</p>
                  <p class="text-sm cyan-text opacity-75">Male</p>
                </div>
                <div class="white-card p-4 rounded-xl text-center">
                  <p class="text-3xl font-bold cyan-text">\${patients.filter(p => p.gender === 'Female').length}</p>
                  <p class="text-sm cyan-text opacity-75">Female</p>
                </div>
              </div>
            </div>
          \`;
          
          document.querySelectorAll('.chat-btn').forEach(btn => {
            btn.addEventListener('click', function() {
              const patientId = this.dataset.patient;
              const chatBubble = this.closest('.cyan-light').querySelector('.chat-bubble');
              chatBubble.style.display = 'flex';
              showToast('Chat Initiated', \`Opening chat with patient \${patientId}\`, 'info');
              setTimeout(() => {
                chatBubble.style.display = 'none';
              }, 3000);
            });
          });
          
          document.querySelectorAll('.video-consult-btn').forEach(btn => {
            btn.addEventListener('click', function() {
              const patientId = this.dataset.patient;
              showToast('Video Consultation', \`Starting video consultation with patient \${patientId}\`, 'success');
            });
          });
          
          document.querySelectorAll('.view-profile-btn').forEach(btn => {
            btn.addEventListener('click', function() {
              const patientId = this.dataset.patient;
              showToast('Patient Profile', \`Opening profile of patient \${patientId}\`, 'info');
            });
          });
        }
      </script>
    </body>
    </html>
  `;
}

// ============================================
// ROUTES - Use the generateDoctorHTML function
// ============================================
app.get('/', (req, res) => {
  res.send(generateDoctorHTML());
});

// ============================================
// START SERVER - ONLY when run directly
// ============================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`BondHealth Doctor Portal running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
}

// ============================================
// EXPORT for signin.js
// ============================================
module.exports = function renderDoctorDashboard() {
  return generateDoctorHTML();
};