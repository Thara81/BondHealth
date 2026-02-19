const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const { query } = require('./db/config');

const patient = {};

const appointments = [];

// Enhanced doctors data
const doctors = [];

const hospitals = [];

const reports = [];

const prescriptions = [];


/*
app.get('/api/patient', (req, res) => {
  res.json(patient);
});

app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

app.get('/api/hospitals', (req, res) => {
  res.json(hospitals);
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
*/
app.put('/api/patient', (req, res) => {
  Object.assign(patient, req.body);
  res.json(patient);
});

// ============================================
// FUNCTION TO GENERATE HTML - MOVED OUT OF app.get()
// ============================================
function generatePatientHTML(patientData = null, appointmentsData = [], reportsData = [], prescriptionsData = []) {
    // Map database fields to the format expected by the template
    console.log('🎯 generatePatientHTML called with:', {
        patientData: patientData ? 'Data present' : 'No data',
        appointmentsCount: appointmentsData.length,
        reportsCount: reportsData.length,
        prescriptionsCount: prescriptionsData.length
    });
    
    let patient = patientData ? {
        id: patientData.patient_uuid || 'PT-2024-0847',
        name: patientData.full_name || 'Alex Johnson',
        age: patientData.date_of_birth ? calculateAge(patientData.date_of_birth) : 32,
        gender: patientData.gender || 'Male',
        bloodType: patientData.blood_type || 'O+',
        email: patientData.email || 'alex.johnson@email.com',
        contact: patientData.phone || '+1 (555) 123-4567',
        address: patientData.address || '123 Health Street, Medical City',
        emergencyContact: patientData.emergency_contact_name ? 
            `${patientData.emergency_contact_name} ${patientData.emergency_contact_phone || ''}` : 
            'Jane Johnson (Wife) +1 (555) 987-6543',
        conditions: patientData.medical_conditions || ['Hypertension', 'Asthma'],
        allergies: patientData.allergies || ['Penicillin'],
        lastVisit: patientData.last_visit || '2024-11-15',
        nextAppointment: patientData.next_appointment || '2024-12-20'
    } : {
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

    // Helper function to calculate age from date of birth
    function calculateAge(dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Map appointments data
    const appointments = appointmentsData.map(apt => ({
        id: apt.appointment_uuid || apt.id,
        doctor: apt.doctor || 'Dr. Sarah Chen',
        specialization: apt.specialization || 'Cardiology',
        reason: apt.reason || 'Regular checkup',
        status: apt.status || 'confirmed',
        date: apt.appointment_date || new Date().toISOString().split('T')[0],
        time: apt.appointment_time || '10:30 AM',
        location: apt.location || 'Room 304, Cardiology Wing',
        notes: apt.notes || ''
    }));

    // Map reports data
    const reports = reportsData.map(rep => ({
        id: rep.report_uuid || rep.id,
        name: rep.test_type || 'Medical Report',
        type: rep.test_type?.toLowerCase().includes('blood') ? 'lab' : 'general',
        date: rep.test_date || rep.created_at || new Date().toISOString().split('T')[0]
    }));

    // Map prescriptions data
    const prescriptions = prescriptionsData.map(rx => ({
        id: rx.prescription_uuid || rx.id,
        medicine: rx.medicine_name || 'Medication',
        dosage: rx.dosage || 'As prescribed',
        frequency: rx.frequency || 'Daily',
        validUntil: rx.valid_until || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    }));
  return `
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
          background: #28b8b8;
        }
        
        .cyan-light {
          background: rgba(0, 229, 255, 0.06);
        }
        
        .cyan-dark {
          background: #1ebce8;
        }
        
        .cyan-text {
          color: #159eb0;
        }
        
        .cyan-border {
          border-color: #0f9ec6;
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
          border-left-color: #11b1dd;
          background: rgba(0, 255, 255, 0.05);
        }
        
        .menu-item.active {
          border-left-color: #19a9d1;
          background: rgba(0, 255, 255, 0.1);
        }
        
        .btn-cyan {
          background: #0099cc;
          color: #00363a;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-cyan:hover {
          background: #0c818f;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 229, 255, 0.4);
        }
        
        .btn-white {
          background: white;
          color: #10a6ba;
          border: 2px solid #0099cc;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-white:hover {
          background: #0099cc;
          color: #00363a;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid;
          box-shadow: 0 8px 32px;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(0, 229, 255, 0.1);
          border-radius: 10px;
          margin: 8px 0; 
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #1ebce8;
          border-radius: 10px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #159eb0;;
        }
        
        .text-cyan-gradient {
          background: linear-gradient(135deg, #0e95ba, #1599be);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .modal-backdrop {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(5px);
        }
        
        .filter-chip {
          transition: all 0.3s ease;
        }
        
        .filter-chip:hover {
          background: #13a0c7;
          color: white;
          transform: translateY(-1px);
        }
        
        .filter-chip.active {
          background: #1492b5;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 229, 255, 0.3);
        }
        
        .book-btn {
          background: linear-gradient(135deg, #118bad 0%, #0099cc 100%);
          transition: all 0.3s ease;
        }
        
        .book-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(0, 229, 255, 0.4);
        }
        
        .time-slot {
          transition: all 0.3s ease;
        }
        
        .time-slot:hover {
          transform: scale(1.05);
          border-color: #18a0c6;
          background: rgba(0, 229, 255, 0.1);
        }
        
        .time-slot.selected {
          background: #15aed8;
          color: white;
          border-color: #1e9dc0;
          box-shadow: 0 4px 12px rgba(0, 229, 255, 0.3);
        }
        
        .doctor-card {
          transition: all 0.3s ease;
        }
        
        .doctor-card:hover {
          border-color: #179abf;
          box-shadow: 0 15px 35px rgba(0, 229, 255, 0.1);
        }
        
        .hospital-card {
          transition: all 0.3s ease;
        }
        
        .hospital-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 229, 255, 0.1);
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease forwards;
        }
        
        .modal-overlay {
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
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
          
          .carousel-card {
            width: 100% !important;
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
                ${patient.name.charAt(0)}
              </div>
              <div>
                <h1 class="text-3xl font-bold cyan-text">Welcome back, <span class="text-gray-800">${patient.name}</span></h1>
                <p class="text-gray-600">Your health, our priority</p>
              </div>
            </div>
            
            <div class="flex space-x-4">
              <div class="cyan-light rounded-xl p-4 min-w-[120px] text-center">
                <p class="text-sm cyan-text font-medium">Patient ID</p>
                <p class="text-xl font-bold cyan-text">${patient.id}</p>
              </div>
              <div class="cyan-light rounded-xl p-4 min-w-[120px] text-center">
                <p class="text-sm cyan-text font-medium">Age</p>
                <p class="text-xl font-bold cyan-text">${patient.age} years</p>
              </div>
              <div class="cyan-light rounded-xl p-4 min-w-[120px] text-center relative">
                <p class="text-sm cyan-text font-medium">Next Visit</p>
                <p class="text-xl font-bold cyan-text">
                  ${patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : 'N/A'}
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
                  <div class="w-12 h-12 cyan-dark rounded-full flex items-center justify-center">
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
                  <div class="w-12 h-12 cyan-dark rounded-xl flex items-center justify-center">
                    <i class="fas fa-calendar-check text-xl text-white"></i>
                  </div>
                  <div>
                    <p class="font-semibold cyan-text">Current Appointments</p>
                    <p class="text-sm cyan-text opacity-75">View & manage visits</p>
                  </div>
                  <span class="ml-auto cyan-dark text-white text-xs px-2 py-1 rounded-full">${appointments.length}</span>
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
                  <span class="ml-auto cyan-dark text-white text-xs px-2 py-1 rounded-full">${prescriptions.length}</span>
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
                            <div class="w-12 h-12 cyan-dark rounded-full flex items-center justify-center">
                              <i class="fas fa-user-md text-white"></i>
                            </div>
                            <div>
                              <h3 class="text-xl font-bold cyan-text">${apt.doctor}</h3>
                              <p class="text-gray-700"><i class="fas fa-stethoscope mr-2 cyan-text"></i>${apt.specialization}</p>
                            </div>
                          </div>
                          <p class="text-gray-700 mt-2"><i class="fas fa-notes-medical mr-2 cyan-text"></i>${apt.reason}</p>
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
              'Full Name': patient.name,
              'Patient ID': patient.id,
              'Age': `${patient.age} years`,
              'Gender': patient.gender,
              'Blood Type': patient.bloodType,
              'Contact': patient.contact,
              'Email': patient.email,
              'Last Visit': patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'
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
                  ${patient.conditions.map(cond => `
                    <span class="px-3 py-1 cyan-bg text-white rounded-full text-sm">${cond}</span>
                  `).join('')}
                </div>
              </div>
              <div>
                <p class="text-sm cyan-text">Allergies</p>
                <div class="flex flex-wrap gap-2 mt-2">
                  ${patient.allergies.map(allergy => `
                    <span class="px-3 py-1 cyan-dark text-white rounded-full text-sm">${allergy}</span>
                  `).join('')}
                </div>
              </div>
              <div>
                <p class="text-sm cyan-text">Emergency Contact</p>
                <p class="font-semibold">${patient.emergencyContact}</p>
              </div>
              <div>
                <p class="text-sm cyan-text">Address</p>
                <p class="font-semibold">${patient.address}</p>
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
      
      <!-- Booking Modal -->
      <div id="bookingModal" class="fixed inset-0 modal-overlay z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto animate-slide-up scrollbar-thin">
          <div class="p-8">
            <div class="flex justify-between items-center mb-8">
              <h3 class="text-2xl font-bold cyan-text">Book Appointment</h3>
              <button id="closeBookingModal" class="p-2 hover:bg-gray-100 rounded-full transition">
                <i class="fas fa-times text-gray-500"></i>
              </button>
            </div>
            
            <div id="modalDoctorInfo" class="flex items-center gap-5 p-5 cyan-light rounded-2xl mb-8 border cyan-border">
              <!-- Doctor info will be populated here -->
            </div>
            
            <form id="bookingForm">
              <div class="mb-6">
                <label class="block text-sm font-medium cyan-text mb-3">Select Date</label>
                <input type="date" id="appointmentDate" required class="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-lg">
              </div>
              
              <div class="mb-8">
                <label class="block text-sm font-medium cyan-text mb-3">Select Time Slot</label>
                <div id="timeSlots" class="grid grid-cols-3 gap-3">
                  <button type="button" class="time-slot px-4 py-3 text-sm border border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition" data-time="09:00 AM">09:00 AM</button>
                  <button type="button" class="time-slot px-4 py-3 text-sm border border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition" data-time="10:00 AM">10:00 AM</button>
                  <button type="button" class="time-slot px-4 py-3 text-sm border border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition" data-time="11:00 AM">11:00 AM</button>
                  <button type="button" class="time-slot px-4 py-3 text-sm border border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition" data-time="02:00 PM">02:00 PM</button>
                  <button type="button" class="time-slot px-4 py-3 text-sm border border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition" data-time="03:00 PM">03:00 PM</button>
                  <button type="button" class="time-slot px-4 py-3 text-sm border border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition" data-time="04:00 PM">04:00 PM</button>
                </div>
              </div>
              
              <div class="mb-6">
                <label class="block text-sm font-medium cyan-text mb-3">Reason for Visit</label>
                <textarea id="visitReason" class="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-lg" placeholder="Describe your symptoms or reason for visit..."></textarea>
              </div>
              
              <button type="submit" id="confirmBooking" class="w-full book-btn text-white font-semibold py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300" disabled>
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Success Toast -->
      <div id="successToast" class="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl hidden transform transition-all duration-300 translate-y-4 opacity-0 z-50">
        <div class="flex items-center gap-4">
          <div class="bg-white/20 p-2 rounded-full">
            <i class="fas fa-check"></i>
          </div>
          <span class="font-medium">Appointment booked successfully!</span>
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
          
          // Setup booking modal event listeners
          document.getElementById('closeBookingModal').addEventListener('click', () => {
            document.getElementById('bookingModal').classList.add('hidden');
          });
          
          document.getElementById('bookingModal').addEventListener('click', (e) => {
            if (e.target.id === 'bookingModal') {
              document.getElementById('bookingModal').classList.add('hidden');
            }
          });
          
          // Time slot selection
          document.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', () => {
              document.querySelectorAll('.time-slot').forEach(s => {
                s.classList.remove('selected');
              });
              slot.classList.add('selected');
              updateConfirmButton();
            });
          });
          
          // Date selection
          document.getElementById('appointmentDate').addEventListener('change', updateConfirmButton);
          
          // Booking form submission
          document.getElementById('bookingForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            await bookAppointment();
          });
        });
        
        // State for appointment booking
        let selectedDoctor = null;
        let selectedDate = '';
        let selectedTime = '';
        let currentFilter = 'all';
        let searchQuery = '';
        
        async function loadBookContent() {
          const response = await fetch('/api/doctors');
          const doctors = await response.json();
          const hospitals = await fetch('/api/hospitals').then(res => res.json());
          
          const bookContent = document.getElementById('bookContent');
          bookContent.innerHTML = \`
            <div class="fade-in">
              <div class="flex items-center gap-4 mb-8">
                <div class="cyan-bg p-3 rounded-2xl">
                  <i class="fas fa-search-plus text-xl text-white"></i>
                </div>
                <div>
                  <h2 class="text-2xl font-bold cyan-text">Find & Book Appointments</h2>
                  <p class="cyan-text opacity-75">Connect with top specialists across partner hospitals</p>
                </div>
              </div>
              
              <!-- Search Bar -->
              <div class="relative mb-8">
                <div class="absolute left-5 top-1/2 -translate-y-1/2">
                  <i class="fas fa-search text-gray-400"></i>
                </div>
                <input type="text" id="searchInput" placeholder="Search by doctor, hospital, or department..." 
                       class="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-lg shadow-sm">
              </div>
              
              <!-- Filter Chips -->
              <div class="mb-8">
                <p class="cyan-text font-medium mb-4">Specialties</p>
                <div class="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
                  <button class="filter-chip active px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[120px] text-center" data-filter="all"> 
                    All Specialties 
                  </button>
                  <button class="filter-chip px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[120px] text-center" data-filter="cardiology"> 
                    Cardiology 
                  </button>
                  <button class="filter-chip px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[120px] text-center" data-filter="neurology"> 
                    Neurology 
                  </button>
                  <button class="filter-chip px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[120px] text-center" data-filter="dermatology"> 
                    Dermatology 
                  </button>
                  <button class="filter-chip px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[120px] text-center" data-filter="orthopedics"> 
                    Orthopedics 
                  </button>
                  <button class="filter-chip px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[120px] text-center" data-filter="pediatrics"> 
                    Pediatrics 
                  </button>
                  <button class="filter-chip px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[120px] text-center" data-filter="gynecology"> 
                    Gynecology 
                  </button>
                </div>
              </div>
              
              <!-- Available Doctors -->
              <div class="mb-12">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-xl font-bold cyan-text">Available Doctors</h3>
                  <span class="text-sm cyan-text opacity-75" id="doctorCount">\${doctors.length} doctors available</span>
                </div>
                
                <div id="doctorsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <!-- Doctor cards will be rendered here -->
                </div>
              </div>
              
              <!-- Divider -->
              <div class="border-t border-gray-200 my-8"></div>
              
              <!-- Partner Hospitals -->
              <div class="mb-12">
                <div class="flex items-center gap-3 mb-6">
                  <div class="cyan-light p-2 rounded-xl">
                    <i class="fas fa-hospital text-xl cyan-text"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold cyan-text">Partner Hospitals</h3>
                    <p class="cyan-text opacity-75 text-sm">Top-rated healthcare facilities</p>
                  </div>
                </div>
                
                <div id="hospitalsGrid" class="grid grid-cols-2 md:grid-cols-4 gap-5">
                  \${hospitals.map(hospital => \`
                    <div class="hospital-card white-card rounded-2xl p-5 cursor-pointer hover-lift" onclick="filterByHospital('\${hospital.name}')">
                      <div class="w-full h-28 rounded-xl flex items-center justify-center mb-4 cyan-light border-2 cyan-border">
                        <i class="fas fa-hospital-alt text-4xl cyan-text"></i>
                      </div>
                      <p class="text-sm font-semibold cyan-text text-center mb-2">\${hospital.name}</p>
                      <p class="text-xs cyan-text opacity-75 text-center">Premium Healthcare</p>
                    </div>
                  \`).join('')}
                </div>
              </div>
            </div>
          \`;
          
          renderDoctors(doctors);
          setupBookingEventListeners();
        }
        
        function renderDoctors(doctorsData) {
          const filtered = doctorsData.filter(doc => {
            const matchesFilter = currentFilter === 'all' || doc.department === currentFilter;
            const matchesSearch = searchQuery === '' || 
              doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              doc.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
              doc.specialization.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch && doc.available;
          });
          
          document.getElementById('doctorCount').textContent = \`\${filtered.length} \${filtered.length === 1 ? 'doctor' : 'doctors'} available\`;
          
          const doctorsGrid = document.getElementById('doctorsGrid');
          doctorsGrid.innerHTML = filtered.map((doc, index) => \`
            <div class="doctor-card white-card rounded-2xl p-6 hover-lift fade-in" style="animation-delay: \${index * 0.1}s">
              <div class="flex gap-5 mb-5">
                <div class="w-20 h-20 rounded-2xl cyan-light border-2 cyan-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  <i class="fas fa-user-md text-3xl cyan-text"></i>
                </div>
                <div class="flex-1">
                  <h3 class="font-bold cyan-text text-lg mb-1">\${doc.name}</h3>
                  <p class="cyan-text font-medium mb-2">\${doc.specialization}</p>
                  <div class="flex items-center cyan-text opacity-75 text-sm">
                    <i class="fas fa-hospital mr-2"></i>
                    <span>\${doc.hospital}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center justify-between pt-5 border-t border-gray-100">
                <div class="flex items-center gap-4 text-sm cyan-text opacity-75">
                  <span class="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                    <i class="fas fa-star text-yellow-500"></i>
                    <span class="font-semibold">\${doc.rating}</span>
                  </span>
                  <span class="bg-gray-100 px-3 py-1 rounded-full">\${doc.experience}</span>
                </div>
                <button class="book-btn px-5 py-2.5 rounded-xl text-white font-medium hover:shadow-lg transition-all duration-300" onclick="openBookingModal('\${doc.id}')">
                  Book Now
                </button>
              </div>
            </div>
          \`).join('');
        }
        
        function setupBookingEventListeners() {
          // Search functionality
          document.getElementById('searchInput')?.addEventListener('input', async (e) => {
            searchQuery = e.target.value;
            const doctors = await fetch('/api/doctors').then(res => res.json());
            renderDoctors(doctors);
          });
          
          // Filter chips
          document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', async () => {
              document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
              chip.classList.add('active');
              currentFilter = chip.dataset.filter;
              const doctors = await fetch('/api/doctors').then(res => res.json());
              renderDoctors(doctors);
            });
          });
        }
        
        async function openBookingModal(doctorId) {
          const doctors = await fetch('/api/doctors').then(res => res.json());
          selectedDoctor = doctors.find(d => d.id === doctorId);
          if (!selectedDoctor) return;
          
          const modal = document.getElementById('bookingModal');
          const doctorInfo = document.getElementById('modalDoctorInfo');
          
          doctorInfo.innerHTML = \`
            <div class="w-16 h-16 rounded-xl cyan-light border-2 cyan-border flex items-center justify-center overflow-hidden flex-shrink-0">
              <i class="fas fa-user-md text-2xl cyan-text"></i>
            </div>
            <div class="flex-1">
              <h4 class="font-bold cyan-text text-lg">\${selectedDoctor.name}</h4>
              <p class="cyan-text font-medium">\${selectedDoctor.specialization}</p>
              <div class="flex items-center cyan-text opacity-75 text-sm mt-1">
                <i class="fas fa-hospital mr-2"></i>
                <span>\${selectedDoctor.hospital}</span>
              </div>
            </div>
          \`;
          
          // Set min date to today
          const today = new Date().toISOString().split('T')[0];
          document.getElementById('appointmentDate').min = today;
          document.getElementById('appointmentDate').value = '';
          
          // Reset selections
          selectedDate = '';
          selectedTime = '';
          document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
          });
          document.getElementById('visitReason').value = '';
          document.getElementById('confirmBooking').disabled = true;
          
          modal.classList.remove('hidden');
        }
        
        window.openBookingModal = openBookingModal;
        
        function filterByHospital(hospitalName) {
          searchQuery = hospitalName;
          const searchInput = document.getElementById('searchInput');
          if (searchInput) {
            searchInput.value = hospitalName;
          }
          loadBookContent();
        }
        
        window.filterByHospital = filterByHospital;
        
        function updateConfirmButton() {
          const dateInput = document.getElementById('appointmentDate');
          const timeSlot = document.querySelector('.time-slot.selected');
          const btn = document.getElementById('confirmBooking');
          
          selectedDate = dateInput.value;
          selectedTime = timeSlot ? timeSlot.dataset.time : '';
          
          btn.disabled = !selectedDate || !selectedTime;
        }
        
        async function bookAppointment() {
          if (!selectedDoctor || !selectedDate || !selectedTime) return;
          
          const btn = document.getElementById('confirmBooking');
          const reason = document.getElementById('visitReason').value;
          
          btn.disabled = true;
          btn.textContent = 'Booking...';
          
          try {
            const response = await fetch('/api/appointments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                doctor: selectedDoctor.name,
                specialization: selectedDoctor.specialization,
                hospital: selectedDoctor.hospital,
                date: selectedDate,
                time: selectedTime,
                reason: reason || 'General consultation',
                status: 'pending',
                location: 'To be assigned',
                notes: 'New appointment booked through patient portal'
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              
              document.getElementById('bookingModal').classList.add('hidden');
              showBookingSuccessToast();
              
              // Switch back to appointments section
              setTimeout(() => {
                document.querySelector('[data-section="appointments"]').click();
              }, 2000);
            } else {
              showToast('Failed to book appointment. Please try again.', 'error');
            }
          } catch (error) {
            console.error('Error booking appointment:', error);
            showToast('Network error. Please try again.', 'error');
          }
          
          btn.disabled = false;
          btn.textContent = 'Confirm Booking';
        }
        
        function showBookingSuccessToast() {
          const toast = document.getElementById('successToast');
          toast.classList.remove('hidden', 'translate-y-4', 'opacity-0');
          
          setTimeout(() => {
            toast.classList.add('translate-y-4', 'opacity-0');
            setTimeout(() => toast.classList.add('hidden'), 300);
          }, 3000);
        }
        
        async function loadReportsContent() {
          const reports = window.patientData?.reports || [];
          
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
                    <span class="text-xs cyan-dark text-white px-2 py-1 rounded-full">\${report.type.toUpperCase()}</span>
                  </div>
                  <h3 class="text-lg font-semibold cyan-text mb-2">\${report.name}</h3>
                  <p class="text-sm cyan-text opacity-75 mb-4">Date: \${new Date(report.date).toLocaleDateString()}</p>
                  <div class="flex justify-between">
                    <button class="text-sm cyan-dark text-white px-4 py-2 rounded-lg">
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
          const prescriptions = window.patientData?.prescriptions || [];
          
          const prescriptionsContent = document.getElementById('prescriptionsContent');
          prescriptionsContent.innerHTML = \`
            <h2 class="text-2xl font-bold mb-6 cyan-text">Active Prescriptions</h2>
            <div class="space-y-6">
              \${prescriptions.map(rx => \`
                <div class="cyan-light rounded-xl p-6 hover-lift">
                  <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div class="flex items-center space-x-4 mb-4 md:mb-0">
                      <div class="w-12 h-12 cyan-dark rounded-xl flex items-center justify-center">
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
        window.viewReport = function(reportId) {
            alert('Viewing report: ' + reportId);
            // In a real app, this would open the report
        };

        window.downloadReport = function(reportId) {
            alert('Downloading report: ' + reportId);
            // In a real app, this would download the report
        };
        window.patientData = {
          reports: ${JSON.stringify(reports)},
          prescriptions: ${JSON.stringify(prescriptions)},
          appointments: ${JSON.stringify(appointments)}
        };
      </script>
    </body>
    </html>
  `;
}

// ============================================
// ROUTES - Use the generatePatientHTML function
// ============================================


// ============================================
// START SERVER - ONLY when run directly
// ============================================


// ============================================
// EXPORT for signin.js
// ============================================
module.exports = async function renderPatientDashboard() {
  try {
    console.log('🔍 Starting renderPatientDashboard...');
    
    console.log('📊 Fetching patient data for PT-2024-0847...');
    const patientResult = await query(
      `SELECT * FROM patients WHERE patient_uuid = 'PT-2024-0847'`
    );
    
    console.log('📋 Patient query result:', {
      rowCount: patientResult.rows.length,
      patientData: patientResult.rows[0] || 'No patient found'
    });
    
    if (!patientResult.rows[0]) {
      console.log('⚠️ No patient found, using default data');
    }
    
    const patientId = patientResult.rows[0]?.patient_id;
    console.log('🆔 Patient ID:', patientId);
    
    const appointmentsResult = await query(
      `SELECT a.*, d.full_name as doctor, d.specialization 
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.doctor_id
       WHERE a.patient_id = $1`,
      [patientId]
    );
    console.log('📅 Appointments found:', appointmentsResult.rows.length);
    
    const reportsResult = await query(
      `SELECT * FROM lab_reports WHERE patient_id = $1`,
      [patientId]
    );
    console.log('📄 Reports found:', reportsResult.rows.length);
    
    const prescriptionsResult = await query(
      `SELECT * FROM prescriptions WHERE patient_id = $1 AND status = 'active'`,
      [patientId]
    );
    console.log('💊 Prescriptions found:', prescriptionsResult.rows.length);
    
    console.log('🎨 Generating HTML...');
    const html = generatePatientHTML(
      patientResult.rows[0] || null,
      appointmentsResult.rows || [],
      reportsResult.rows || [],
      prescriptionsResult.rows || []
    );
    
    console.log('✅ HTML generated successfully');
    return html;
    
  } catch (error) {
    console.error('❌ Error loading patient dashboard:', error);
    return '<h1>Error loading dashboard</h1><p>Please try again later.</p>';
  }
};