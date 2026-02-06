const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const patientData = {
  id: 'PT-2024-0847',
  name: 'Alex Johnson',
  age: 32,
  gender: 'Male',
  bloodType: 'O+',
  email: 'alex.johnson@email.com',
  contact: '+1 (555) 123-4567',
  address: '123 Health Street, Medical City',
  emergencyContact: 'Jane Johnson (Wife) +1 (555) 987-6543',
  conditions: ['Hypertension', 'Asthma'],
  allergies: ['Penicillin'],
  lastVisit: '2024-11-15',
  nextAppointment: '2024-12-20'
};

const appointments = [
  {
    id: 'APT-001',
    doctor: 'Dr. Sarah Chen',
    specialization: 'Cardiology',
    date: '2024-12-20',
    time: '10:30 AM',
    location: 'Room 304',
    status: 'confirmed',
    reason: 'Routine heart checkup',
    notes: 'Bring previous test reports'
  }
];

const doctors = [
  { id: 1, name: 'Dr. Sarah Chen', specialization: 'Cardiology', available: true },
  { id: 2, name: 'Dr. Michael Rodriguez', specialization: 'Neurology', available: true },
  { id: 3, name: 'Dr. Emily Brown', specialization: 'Dermatology', available: false },
  { id: 4, name: 'Dr. James Wilson', specialization: 'Orthopedics', available: true }
];

const reports = [
  { id: 'RPT-001', name: 'Blood Test Results', date: '2024-11-10', type: 'lab' },
  { id: 'RPT-002', name: 'ECG Report', date: '2024-11-05', type: 'ecg' },
  { id: 'RPT-003', name: 'X-Ray Chest', date: '2024-10-28', type: 'xray' }
];

const prescriptions = [
  { id: 'RX-001', medicine: 'Metoprolol', dosage: '50mg', frequency: 'Once daily', validUntil: '2025-03-15' },
  { id: 'RX-002', medicine: 'Atorvastatin', dosage: '20mg', frequency: 'At bedtime', validUntil: '2025-03-15' }
];

app.get('/api/patient', (req, res) => {
  res.json(patientData);
});

app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

app.get('/api/reports', (req, res) => {
  res.json(reports);
});

app.get('/api/prescriptions', (req, res) => {
  res.json(prescriptions);
});

app.post('/api/appointments', (req, res) => {
  const newAppointment = {
    id: `APT-${Date.now()}`,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

app.put('/api/patient', (req, res) => {
  Object.assign(patientData, req.body);
  res.json(patientData);
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BondHealth - Patient Portal</title>
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
          background: linear-gradient(135deg, #ffffff 0%, #f7feff 100%);
          overflow-x: hidden;
        }
        
        .cyan-bg {
          background: #00ffff;
        }
        
        .cyan-light {
          background: rgba(0, 229, 255, 0.06);
        }
        
        .cyan-dark {
          background: #00ffff;
        }
        
        .cyan-text {
          color: #00bcd4;
        }
        
        .cyan-border {
          border-color: #00ffff;
        }
        
        .white-card {
          background: white;
          box-shadow: 0 10px 40px rgba(0, 255, 255, 0.1);
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
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 255, 255, 0.1));
          animation: float 20s infinite linear;
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
          animation-delay: -5s;
        }
        
        .floating-circle:nth-child(3) {
          width: 150px;
          height: 150px;
          bottom: -50px;
          left: 30%;
          animation-delay: -10s;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(50px, 50px) rotate(90deg);
          }
          50% {
            transform: translate(0, 100px) rotate(180deg);
          }
          75% {
            transform: translate(-50px, 50px) rotate(270deg);
          }
        }
        
        .wave-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100px;
          background: linear-gradient(90deg, 
            rgba(0, 255, 255, 0.2) 0%, 
            rgba(0, 204, 204, 0.3) 25%, 
            rgba(0, 128, 128, 0.2) 50%, 
            rgba(0, 102, 102, 0.3) 75%, 
            rgba(0, 255, 255, 0.2) 100%);
          opacity: 0.3;
          animation: wave 10s infinite ease-in-out;
        }
        
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(50px); }
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
          box-shadow: 0 20px 40px rgba(0, 255, 255, 0.15);
        }
        
        .menu-item {
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
        }
        
        .menu-item:hover {
          border-left-color: #00ffff;
          background: rgba(0, 255, 255, 0.05);
        }
        
        .menu-item.active {
          border-left-color: #00ffff;
          background: rgba(0, 255, 255, 0.1);
        }
        
        .btn-cyan {
          background: #00e5ff;
          color: #00363a;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-cyan:hover {
          background: #00c8e0;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 229, 255, 0.4);
        }
        
        .btn-white {
          background: white;
          color: #00bcd4;
          border: 2px solid #00e5ff;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-white:hover {
          background: #00e5ff;
          color: #00363a;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid;
          box-shadow: 0 8px 32px;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #00ffff;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #00ffff;
        }
        
        .text-cyan-gradient {
          background: linear-gradient(135deg, #00ffff, #00ffff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .modal-backdrop {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(5px);
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
        <div class="white-card rounded-2xl p-6 mb-6 fade-in">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="flex items-center space-x-4 mb-4 md:mb-0">
              <div class="w-16 h-16 cyan-bg rounded-full flex items-center justify-center text-2xl font-bold text-white">
                ${patientData.name.charAt(0)}
              </div>
              <div>
                <h1 class="text-3xl font-bold cyan-text">Welcome back, <span class="text-gray-800">${patientData.name}</span></h1>
                <p class="text-gray-600">Your health, our priority</p>
              </div>
            </div>
            
            <div class="flex space-x-4">
              <div class="cyan-light rounded-xl p-4 min-w-[120px] text-center">
                <p class="text-sm cyan-text font-medium">Patient ID</p>
                <p class="text-xl font-bold cyan-text">${patientData.id}</p>
              </div>
              <div class="cyan-light rounded-xl p-4 min-w-[120px] text-center">
                <p class="text-sm cyan-text font-medium">Age</p>
                <p class="text-xl font-bold cyan-text">${patientData.age} years</p>
              </div>
              <div class="cyan-light rounded-xl p-4 min-w-[120px] text-center relative">
                <p class="text-sm cyan-text font-medium">Next Visit</p>
                <p class="text-xl font-bold cyan-text">
                  ${patientData.nextAppointment ? new Date(patientData.nextAppointment).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : 'N/A'}
                </p>
                <div class="absolute -top-2 -right-2 w-4 h-4 cyan-bg rounded-full pulse-dot"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-6 opacity-30"></div>
        
        <div class="flex flex-col lg:flex-row gap-6">
          <div class="lg:w-1/4">
            <div class="white-card rounded-2xl p-6 mb-6 slide-in">
              <button id="profileBtn" class="w-full cyan-light rounded-xl p-4 mb-6 flex items-center justify-between space-x-3 hover-lift">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 cyan-bg rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-xl text-white"></i>
                  </div>
                  <div class="text-left">
                    <p class="font-semibold cyan-text">View Profile</p>
                    <p class="text-sm cyan-text opacity-75">Personal details & settings</p>
                  </div>
                </div>
                <i class="fas fa-chevron-right cyan-text"></i>
              </button>
              
              <div class="space-y-2">
                <button class="menu-item active w-full text-left p-4 rounded-xl flex items-center space-x-4" data-section="appointments">
                  <div class="w-12 h-12 cyan-bg rounded-xl flex items-center justify-center">
                    <i class="fas fa-calendar-check text-xl text-white"></i>
                  </div>
                  <div>
                    <p class="font-semibold cyan-text">Current Appointments</p>
                    <p class="text-sm cyan-text opacity-75">View & manage visits</p>
                  </div>
                  <span class="ml-auto cyan-bg text-white text-xs px-2 py-1 rounded-full">${appointments.length}</span>
                </button>
                
                <button class="menu-item w-full text-left p-4 rounded-xl flex items-center space-x-4" data-section="book">
                  <div class="w-12 h-12 cyan-light rounded-xl flex items-center justify-center">
                    <i class="fas fa-calendar-plus text-xl cyan-text"></i>
                  </div>
                  <div>
                    <p class="font-semibold cyan-text">Book Appointment</p>
                    <p class="text-sm cyan-text opacity-75">Schedule new visit</p>
                  </div>
                  <i class="fas fa-plus ml-auto cyan-text"></i>
                </button>
                
                <button class="menu-item w-full text-left p-4 rounded-xl flex items-center space-x-4" data-section="reports">
                  <div class="w-12 h-12 cyan-light rounded-xl flex items-center justify-center">
                    <i class="fas fa-file-medical text-xl cyan-text"></i>
                  </div>
                  <div>
                    <p class="font-semibold cyan-text">Medical Reports</p>
                    <p class="text-sm cyan-text opacity-75">Test results & history</p>
                  </div>
                  <span class="ml-auto cyan-dark text-white text-xs px-2 py-1 rounded-full">${reports.length}</span>
                </button>
                
                <button class="menu-item w-full text-left p-4 rounded-xl flex items-center space-x-4" data-section="prescriptions">
                  <div class="w-12 h-12 cyan-light rounded-xl flex items-center justify-center">
                    <i class="fas fa-pills text-xl cyan-text"></i>
                  </div>
                  <div>
                    <p class="font-semibold cyan-text">Prescriptions</p>
                    <p class="text-sm cyan-text opacity-75">Medications & refills</p>
                  </div>
                  <span class="ml-auto cyan-bg text-white text-xs px-2 py-1 rounded-full">${prescriptions.length}</span>
                </button>
              </div>
              
              <div class="mt-8 pt-6 border-t border-gray-200">
                <p class="text-sm font-semibold cyan-text mb-4">Quick Actions</p>
                <div class="grid grid-cols-2 gap-3">
                  <button class="cyan-light rounded-lg p-3 text-center hover:bg-cyan-100 transition-colors">
                    <i class="fas fa-download cyan-text mb-1"></i>
                    <p class="text-xs cyan-text">Download Records</p>
                  </button>
                  <button class="cyan-light rounded-lg p-3 text-center hover:bg-cyan-100 transition-colors">
                    <i class="fas fa-bell cyan-text mb-1"></i>
                    <p class="text-xs cyan-text">Notifications</p>
                  </button>
                  <button class="cyan-light rounded-lg p-3 text-center hover:bg-cyan-100 transition-colors">
                    <i class="fas fa-question-circle cyan-text mb-1"></i>
                    <p class="text-xs cyan-text">Help Center</p>
                  </button>
                  <button class="cyan-light rounded-lg p-3 text-center hover:bg-cyan-100 transition-colors">
                    <i class="fas fa-cog cyan-text mb-1"></i>
                    <p class="text-xs cyan-text">Settings</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="lg:w-3/4">
            <div id="contentArea" class="white-card rounded-2xl p-6 min-h-[600px] fade-in">
              <div id="appointmentsContent">
                <h2 class="text-2xl font-bold mb-6 cyan-text">Current Appointments</h2>
                <div class="grid gap-6">
                  ${appointments.map(apt => `
                    <div class="cyan-light rounded-xl p-6 hover-lift">
                      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <div>
                          <div class="flex items-center space-x-3 mb-2">
                            <div class="w-12 h-12 cyan-bg rounded-full flex items-center justify-center">
                              <i class="fas fa-user-md text-white"></i>
                            </div>
                            <div>
                              <h3 class="text-xl font-bold cyan-text">${apt.doctor}</h3>
                              <h3 class="text-xl font-bold text-gray-800">${apt.doctor}</h3>
                            </div>
                          </div>
                          <p class="text-gray-700 mt-2"><i class="fas fa-stethoscope mr-2 cyan-text"></i>${apt.reason}</p>
                        </div>
                        <div class="flex items-center space-x-3 mt-4 md:mt-0">
                          <span class="px-3 py-1 bg-cyan-500 text-white rounded-full text-sm font-semibold">
                            ${apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </span>
                          <button class="px-4 py-2 btn-cyan rounded-lg reschedule-btn" data-id="${apt.id}">
                            Reschedule
                          </button>
                          <button class="px-4 py-2 btn-white rounded-lg cancel-btn" data-id="${apt.id}">
                            Cancel
                          </button>
                        </div>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                        <div class="text-center">
                          <p class="text-sm cyan-text">Date</p>
                          <p class="font-semibold">${new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div class="text-center">
                          <p class="text-sm cyan-text">Time</p>
                          <p class="font-semibold">${apt.time}</p>
                        </div>
                        <div class="text-center">
                          <p class="text-sm cyan-text">Location</p>
                          <p class="font-semibold">${apt.location}</p>
                        </div>
                      </div>
                      ${apt.notes ? `
                        <div class="mt-4 p-3 cyan-light rounded-lg border cyan-border">
                          <p class="text-sm cyan-text"><i class="fas fa-info-circle mr-2"></i>Note: ${apt.notes}</p>
                        </div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div id="bookContent" class="hidden"></div>
              <div id="reportsContent" class="hidden"></div>
              <div id="prescriptionsContent" class="hidden"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="profileModal" class="fixed inset-0 bg-white/90 flex items-center justify-center z-50 hidden p-4 modal-backdrop">
        <div class="white-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold cyan-text">Patient Profile</h2>
            <button id="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            ${Object.entries({
              'Full Name': patientData.name,
              'Patient ID': patientData.id,
              'Age': `${patientData.age} years`,
              'Gender': patientData.gender,
              'Blood Type': patientData.bloodType,
              'Contact': patientData.contact,
              'Email': patientData.email,
              'Last Visit': patientData.lastVisit ? new Date(patientData.lastVisit).toLocaleDateString() : 'N/A'
            }).map(([key, value]) => `
              <div class="cyan-light p-4 rounded-xl">
                <p class="text-sm cyan-text">${key}</p>
                <p class="font-semibold">${value}</p>
              </div>
            `).join('')}
          </div>
          
          <div class="cyan-light p-6 rounded-xl mb-6">
            <h3 class="text-lg font-semibold cyan-text mb-4">Medical Information</h3>
            <div class="space-y-4">
              <div>
                <p class="text-sm text-gray-500">Medical Conditions</p>
                <div class="flex flex-wrap gap-2 mt-2">
                  ${patientData.conditions.map(cond => `
                    <span class="px-3 py-1 cyan-bg text-white rounded-full text-sm">${cond}</span>
                  `).join('')}
                </div>
              </div>
              <div>
                <p class="text-sm cyan-text">Allergies</p>
                <div class="flex flex-wrap gap-2 mt-2">
                  ${patientData.allergies.map(allergy => `
                    <span class="px-3 py-1 cyan-dark text-white rounded-full text-sm">${allergy}</span>
                  `).join('')}
                </div>
              </div>
              <div>
                <p class="text-sm cyan-text">Emergency Contact</p>
                <p class="font-semibold">${patientData.emergencyContact}</p>
              </div>
              <div>
                <p class="text-sm cyan-text">Address</p>
                <p class="font-semibold">${patientData.address}</p>
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
      
      <div id="toast" class="fixed bottom-4 right-4 white-card rounded-lg p-4 max-w-sm hidden z-50">
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
            book: document.getElementById('bookContent'),
            reports: document.getElementById('reportsContent'),
            prescriptions: document.getElementById('prescriptionsContent')
          };
          
          loadBookContent();
          loadReportsContent();
          loadPrescriptionsContent();
          
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
            showToast('Edit Profile', 'Profile editing feature coming soon!', 'info');
          });
          
          document.addEventListener('click', function(e) {
            if (e.target.classList.contains('reschedule-btn')) {
              const appointmentId = e.target.dataset.id;
              showToast('Reschedule', \`Opening reschedule options for appointment \${appointmentId}\`, 'info');
            }
            
            if (e.target.classList.contains('cancel-btn')) {
              const appointmentId = e.target.dataset.id;
              if (confirm('Are you sure you want to cancel this appointment?')) {
                showToast('Cancelled', \`Appointment \${appointmentId} has been cancelled\`, 'success');
              }
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
            showToast('Welcome', 'Your patient portal is ready!', 'success');
          }, 1000);
        });
        
        async function loadBookContent() {
          const response = await fetch('/api/doctors');
          const doctors = await response.json();
          
          const bookContent = document.getElementById('bookContent');
          bookContent.innerHTML = \`
            <h2 class="text-2xl font-bold mb-6 cyan-text">Book New Appointment</h2>
            <div class="cyan-light rounded-xl p-6 mb-6">
              <form id="bookingForm" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm cyan-text mb-2">Select Doctor</label>
                    <select class="w-full white-card p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" required>
                      <option value="">Choose a doctor</option>
                      \${doctors.filter(d => d.available).map(doc => \`
                        <option value="\${doc.id}">\${doc.name} - \${doc.specialization}</option>
                      \`).join('')}
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm cyan-text mb-2">Appointment Date</label>
                    <input type="date" class="w-full white-card p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" min="\${new Date().toISOString().split('T')[0]}" required>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm cyan-text mb-2">Preferred Time</label>
                    <select class="w-full white-card p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" required>
                      <option value="">Select time</option>
                      <option>9:00 AM</option>
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>2:00 PM</option>
                      <option>3:00 PM</option>
                      <option>4:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm cyan-text mb-2">Reason for Visit</label>
                    <input type="text" class="w-full white-card p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="e.g., Routine checkup, Specific symptoms..." required>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm cyan-text mb-2">Additional Notes (Optional)</label>
                  <textarea class="w-full white-card p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" rows="3" placeholder="Any specific concerns or questions for the doctor..."></textarea>
                </div>
                
                <div class="flex justify-end space-x-4">
                  <button type="button" class="px-6 py-3 btn-white rounded-lg" onclick="document.querySelector('[data-section=\\"appointments\\"]').click()">
                    Cancel
                  </button>
                  <button type="submit" class="px-6 py-3 btn-cyan rounded-lg">
                    <i class="fas fa-calendar-plus mr-2"></i>
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
            
            <div class="cyan-light rounded-xl p-6">
              <h3 class="text-lg font-semibold cyan-text mb-4">Available Doctors</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                \${doctors.map(doc => \`
                  <div class="white-card p-4 rounded-xl hover-lift">
                    <div class="flex items-center space-x-3 mb-3">
                      <div class="w-10 h-10 cyan-bg rounded-full flex items-center justify-center">
                        <i class="fas fa-user-md text-white"></i>
                      </div>
                      <div>
                        <h4 class="font-semibold cyan-text">\${doc.name}</h4>
                        <p class="text-sm cyan-text opacity-75">\${doc.specialization}</p>
                      </div>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm \${doc.available ? 'text-green-600' : 'text-red-600'}">
                        <i class="fas fa-circle text-xs mr-1"></i>
                        \${doc.available ? 'Available' : 'Not Available'}
                      </span>
                      <button class="text-sm cyan-bg text-white px-3 py-1 rounded transition-colors" \${!doc.available ? 'disabled' : ''}>
                        Select
                      </button>
                    </div>
                  </div>
                \`).join('')}
              </div>
            </div>
          \`;
          
          document.getElementById('bookingForm')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            showToast('Appointment Booked', 'Your appointment request has been submitted!', 'success');
            setTimeout(() => {
              document.querySelector('[data-section="appointments"]').click();
            }, 2000);
          });
        }
        
        async function loadReportsContent() {
          const response = await fetch('/api/reports');
          const reports = await response.json();
          
          const reportsContent = document.getElementById('reportsContent');
          reportsContent.innerHTML = \`
            <h2 class="text-2xl font-bold mb-6 cyan-text">Medical Reports</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              \${reports.map(report => \`
                <div class="white-card rounded-xl p-6 hover-lift">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 cyan-light rounded-xl flex items-center justify-center">
                      <i class="fas \${report.type === 'lab' ? 'fa-vial' : report.type === 'ecg' ? 'fa-heartbeat' : 'fa-x-ray'} cyan-text"></i>
                    </div>
                    <span class="text-xs cyan-bg text-white px-2 py-1 rounded-full">\${report.type.toUpperCase()}</span>
                  </div>
                  <h3 class="text-lg font-semibold cyan-text mb-2">\${report.name}</h3>
                  <p class="text-sm cyan-text opacity-75 mb-4">Date: \${new Date(report.date).toLocaleDateString()}</p>
                  <div class="flex justify-between">
                    <button class="text-sm cyan-bg text-white px-4 py-2 rounded-lg">
                      <i class="fas fa-eye mr-2"></i>View
                    </button>
                    <button class="text-sm btn-white px-4 py-2 rounded-lg">
                      <i class="fas fa-download mr-2"></i>Download
                    </button>
                  </div>
                </div>
              \`).join('')}
            </div>
            
            <div class="mt-8 cyan-light rounded-xl p-6">
              <h3 class="text-lg font-semibold cyan-text mb-4">Upload New Report</h3>
              <div class="border-2 border-dashed cyan-border rounded-xl p-8 text-center">
                <i class="fas fa-cloud-upload-alt text-4xl cyan-text mb-4"></i>
                <p class="cyan-text mb-2">Drag & drop your report files here</p>
                <p class="text-sm text-gray-600 mb-4">or</p>
                <button class="px-6 py-3 btn-cyan rounded-lg">
                  <i class="fas fa-folder-open mr-2"></i>Browse Files
                </button>
                <p class="text-xs text-gray-500 mt-4">Supports: PDF, JPG, PNG (Max 10MB)</p>
              </div>
            </div>
          \`;
        }
        
        async function loadPrescriptionsContent() {
          const response = await fetch('/api/prescriptions');
          const prescriptions = await response.json();
          
          const prescriptionsContent = document.getElementById('prescriptionsContent');
          prescriptionsContent.innerHTML = \`
            <h2 class="text-2xl font-bold mb-6 cyan-text">Active Prescriptions</h2>
            <div class="space-y-6">
              \${prescriptions.map(rx => \`
                <div class="cyan-light rounded-xl p-6 hover-lift">
                  <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div class="flex items-center space-x-4 mb-4 md:mb-0">
                      <div class="w-12 h-12 cyan-bg rounded-xl flex items-center justify-center">
                        <i class="fas fa-pills text-white"></i>
                      </div>
                      <div>
                        <h3 class="text-xl font-bold cyan-text">\${rx.medicine}</h3>
                        <p class="cyan-text opacity-75">\${rx.dosage} • \${rx.frequency}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-3">
                      <span class="px-3 py-1 cyan-dark text-white rounded-full text-sm">
                        <i class="fas fa-check-circle mr-1"></i>Active
                      </span>
                      <button class="px-4 py-2 btn-cyan rounded-lg refill-btn" data-id="\${rx.id}">
                        <i class="fas fa-sync-alt mr-2"></i>Refill
                      </button>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p class="text-sm cyan-text">Prescription ID</p>
                      <p class="font-semibold">\${rx.id}</p>
                    </div>
                    <div>
                      <p class="text-sm cyan-text">Valid Until</p>
                      <p class="font-semibold">\${new Date(rx.validUntil).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p class="text-sm cyan-text">Days Remaining</p>
                      <p class="font-semibold">\${Math.ceil((new Date(rx.validUntil) - new Date()) / (1000 * 60 * 60 * 24))} days</p>
                    </div>
                  </div>
                  
                  <div class="mt-4 flex justify-end space-x-3">
                    <button class="text-sm btn-white px-4 py-2 rounded-lg">
                      <i class="fas fa-info-circle mr-2"></i>Details
                    </button>
                    <button class="text-sm btn-white px-4 py-2 rounded-lg">
                      <i class="fas fa-history mr-2"></i>History
                    </button>
                  </div>
                </div>
              \`).join('')}
            </div>
            
            <div class="mt-8 cyan-light rounded-xl p-6">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-semibold cyan-text">Pharmacy Services</h3>
                <button class="px-6 py-3 btn-cyan rounded-lg">
                  <i class="fas fa-shopping-cart mr-2"></i>Order Medicines
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="white-card p-4 rounded-xl text-center hover-lift">
                  <i class="fas fa-truck text-2xl cyan-text mb-3"></i>
                  <p class="font-semibold cyan-text">Home Delivery</p>
                  <p class="text-sm cyan-text opacity-75 mt-1">Free delivery on orders above $50</p>
                </div>
                <div class="white-card p-4 rounded-xl text-center hover-lift">
                  <i class="fas fa-clock text-2xl cyan-text mb-3"></i>
                  <p class="font-semibold cyan-text">24/7 Support</p>
                  <p class="text-sm cyan-text opacity-75 mt-1">Pharmacist support available anytime</p>
                </div>
                <div class="white-card p-4 rounded-xl text-center hover-lift">
                  <i class="fas fa-shield-alt text-2xl cyan-text mb-3"></i>
                  <p class="font-semibold cyan-text">Verified Medicines</p>
                  <p class="text-sm cyan-text opacity-75 mt-1">100% authentic medicines guaranteed</p>
                </div>
              </div>
            </div>
          \`;
          
          document.querySelectorAll('.refill-btn').forEach(btn => {
            btn.addEventListener('click', function() {
              const prescriptionId = this.dataset.id;
              showToast('Refill Requested', \`Refill request sent for prescription \${prescriptionId}\`, 'success');
            });
          });
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`BondHealth Patient Portal running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});