// hospital-admin-dashboard.js
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
    email: "sarah.j@hospital.com",
    phone: "+1 (555) 123-4567",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop",
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
    email: "robert.c@hospital.com",
    phone: "+1 (555) 234-5678",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop",
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
    email: "emily.d@hospital.com",
    phone: "+1 (555) 345-6789",
    photo: "https://images.unsplash.com/photo-1594824434340-7e7dfc37cabb?w=200&h=200&fit=crop",
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
    email: "michael.r@hospital.com",
    phone: "+1 (555) 456-7890",
    photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop",
    status: "Available",
    appointments: [
      { time: "09:30 AM", patient: "Thomas Clark", token: "T007", condition: "Knee Pain" }
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
        :root {
            --primary-color: #06b6d4;
            --primary-light: #ecfeff;
            --primary-dark: #0891b2;
        }
        
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: #f8fafc;
            margin: 0;
            padding: 0;
        }
        
        .sidebar {
            background: white;
            border-right: 1px solid #e2e8f0;
            height: 100vh;
            position: fixed;
            width: 260px;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
        }
        
        .main-content {
            margin-left: 260px;
            min-height: 100vh;
        }
        
        .header {
            background: white;
            border-bottom: 1px solid #e2e8f0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .nav-item {
            padding: 12px 20px;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s;
            border-left: 3px solid transparent;
        }
        
        .nav-item:hover {
            background: #f0f9ff;
            color: #06b6d4;
        }
        
        .nav-item.active {
            background: #f0f9ff;
            color: #06b6d4;
            border-left: 3px solid #06b6d4;
        }
        
        .doctor-card {
            background: white;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s;
            cursor: pointer;
        }
        
        .doctor-card:hover {
            border-color: #06b6d4;
            box-shadow: 0 4px 12px rgba(6, 182, 212, 0.1);
            transform: translateY(-2px);
        }
        
        .doctor-card.leave {
            border-left: 4px solid #f59e0b;
            background: #fffbeb;
        }
        
        .doctor-card.available {
            border-left: 4px solid #10b981;
        }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status-available {
            background: #d1fae5;
            color: #059669;
        }
        
        .status-leave {
            background: #fef3c7;
            color: #d97706;
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
        }
        
        .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 700px;
            max-height: 80vh;
            overflow-y: auto;
            animation: modalSlideIn 0.3s ease;
        }
        
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .appointment-item {
            background: #f0f9ff;
            border-left: 3px solid #06b6d4;
            border-radius: 8px;
            transition: all 0.2s;
        }
        
        .appointment-item:hover {
            background: #e0f2fe;
        }
        
        .stats-card {
            background: white;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s;
        }
        
        .stats-card:hover {
            border-color: #06b6d4;
            box-shadow: 0 4px 12px rgba(6, 182, 212, 0.1);
        }
        
        .schedule-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .schedule-table th {
            background: #f0f9ff;
            padding: 12px;
            text-align: left;
            color: #06b6d4;
            font-weight: 600;
            border-bottom: 2px solid #06b6d4;
        }
        
        .schedule-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .schedule-table tr:hover {
            background: #f0f9ff;
        }
        
        .token-badge {
            background: #06b6d4;
            color: white;
            padding: 4px 10px;
            border-radius: 15px;
            font-weight: 600;
            font-size: 12px;
        }
        
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
                z-index: 1000;
            }
            .sidebar.active {
                transform: translateX(0);
            }
            .main-content {
                margin-left: 0;
            }
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <div class="sidebar p-6" id="sidebar">
        <!-- Hospital Logo -->
        <div class="flex items-center gap-3 mb-8">
            <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-hospital text-white text-xl"></i>
            </div>
            <div>
                <h1 class="font-bold text-xl text-gray-800">City General Hospital</h1>
                <p class="text-sm text-cyan-600">Admin Dashboard</p>
            </div>
        </div>
        
        <!-- Navigation -->
        <div class="space-y-1 mb-8">
            <div class="nav-item active" onclick="showSection('dashboard')">
                <i class="fas fa-tachometer-alt mr-3"></i>
                Dashboard
            </div>
            <div class="nav-item" onclick="showSection('doctors')">
                <i class="fas fa-user-md mr-3"></i>
                All Doctors
            </div>
            <div class="nav-item" onclick="showSection('schedule')">
                <i class="fas fa-calendar-alt mr-3"></i>
                Today's Schedule
            </div>
            <div class="nav-item" onclick="showLeaveModal()">
                <i class="fas fa-calendar-times mr-3"></i>
                Update Leave
            </div>
            <div class="nav-item" onclick="window.location.href='http://localhost:3001'">
                <i class="fas fa-user-plus mr-3"></i>
                Register Doctor
            </div>
        </div>
        
        <!-- Statistics -->
        <div class="pt-6 border-t border-gray-200">
            <h3 class="font-semibold text-gray-700 mb-4">Quick Stats</h3>
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">Total Doctors</span>
                    <span class="font-bold text-cyan-600">${doctors.length}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">Available Today</span>
                    <span class="font-bold text-green-600">${doctors.filter(d => d.status === 'Available').length}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">On Leave</span>
                    <span class="font-bold text-amber-600">${doctors.filter(d => d.status === 'On Leave').length}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">Total Appointments</span>
                    <span class="font-bold text-purple-600">${doctors.reduce((sum, doc) => sum + doc.appointments.length, 0)}</span>
                </div>
            </div>
        </div>
        
        <!-- Admin Profile -->
        <div class="absolute bottom-6 left-6 right-6">
            <div class="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                <div class="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-user-cog text-cyan-600"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-800">Admin Manager</p>
                    <p class="text-sm text-gray-500">Hospital Administrator</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        <!-- Top Header -->
        <header class="header p-6 flex justify-between items-center">
            <div>
                <h2 id="pageTitle" class="text-xl font-bold text-gray-800">Dashboard Overview</h2>
                <p id="pageSubtitle" class="text-gray-500">Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="flex items-center gap-4">
                <button class="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2" onclick="showLeaveModal()">
                    <i class="fas fa-calendar-plus"></i>
                    Update Leave
                </button>
                <div class="relative">
                    <i class="fas fa-bell text-gray-500 text-xl cursor-pointer"></i>
                    <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                </div>
            </div>
        </header>

        <!-- Dashboard Content -->
        <div class="p-6">
            <!-- Dashboard Section -->
            <div id="dashboardSection">
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="stats-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500">Available Doctors</p>
                                <h3 class="text-2xl font-bold text-cyan-600">${doctors.filter(d => d.status === 'Available').length}</h3>
                            </div>
                            <div class="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-user-md text-cyan-600 text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500">Today's Appointments</p>
                                <h3 class="text-2xl font-bold text-purple-600">${doctors.reduce((sum, doc) => sum + doc.appointments.length, 0)}</h3>
                            </div>
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-calendar-check text-purple-600 text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500">Doctors on Leave</p>
                                <h3 class="text-2xl font-bold text-amber-600">${doctors.filter(d => d.status === 'On Leave').length}</h3>
                            </div>
                            <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-umbrella-beach text-amber-600 text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500">Emergency Cases</p>
                                <h3 class="text-2xl font-bold text-red-600">3</h3>
                            </div>
                            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-ambulance text-red-600 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Available Doctors -->
                <div class="mb-8">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-bold text-gray-800">Available Doctors Today</h3>
                        <button class="text-cyan-600 hover:text-cyan-700 font-medium" onclick="showSection('doctors')">
                            View All →
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="availableDoctorsList">
                        ${doctors.filter(d => d.status === 'Available').map(doctor => `
                        <div class="doctor-card available p-6" onclick="showDoctorSchedule(${doctor.id})">
                            <div class="flex items-center gap-4">
                                <img src="${doctor.photo}" 
                                     alt="${doctor.name}" 
                                     class="w-16 h-16 rounded-full object-cover border-2 border-cyan-200">
                                <div class="flex-1">
                                    <h4 class="font-bold text-gray-800">${doctor.name}</h4>
                                    <p class="text-cyan-600 text-sm font-medium">${doctor.specialty}</p>
                                    <div class="mt-2">
                                        <span class="status-badge status-available">Available</span>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-4 pt-4 border-t border-gray-100">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600 text-sm">
                                        <i class="fas fa-calendar-alt mr-1"></i>
                                        ${doctor.appointments.length} appointments
                                    </span>
                                    <button class="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                                        View Schedule →
                                    </button>
                                </div>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Today's Schedule Preview -->
                <div>
                    <h3 class="text-lg font-bold text-gray-800 mb-6">Today's Appointments</h3>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white rounded-lg border border-gray-200 p-6">
                            <h4 class="font-bold text-gray-800 mb-4">Upcoming Appointments</h4>
                            <div class="space-y-3" id="upcomingAppointments">
                                ${getUpcomingAppointments()}
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg border border-gray-200 p-6">
                            <h4 class="font-bold text-gray-800 mb-4">Doctors on Leave</h4>
                            <div class="space-y-3">
                                ${doctors.filter(d => d.status === 'On Leave').map(doctor => `
                                <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div class="flex items-center gap-3">
                                        <img src="${doctor.photo}" 
                                             alt="${doctor.name}" 
                                             class="w-10 h-10 rounded-full object-cover">
                                        <div class="flex-1">
                                            <p class="font-medium text-gray-800">${doctor.name}</p>
                                            <p class="text-amber-600 text-sm">${doctor.leaveFrom} to ${doctor.leaveTo}</p>
                                        </div>
                                        <span class="status-badge status-leave">On Leave</span>
                                    </div>
                                </div>
                                `).join('')}
                                ${doctors.filter(d => d.status === 'On Leave').length === 0 ? `
                                <div class="text-center py-8 text-gray-500">
                                    <i class="fas fa-check-circle text-3xl mb-3 text-gray-300"></i>
                                    <p>No doctors on leave today</p>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- All Doctors Section -->
            <div id="doctorsSection" class="hidden">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-gray-800">All Doctors</h3>
                    <button class="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center gap-2" 
                            onclick="window.location.href='http://localhost:3001'">
                        <i class="fas fa-plus"></i>
                        Add New Doctor
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="allDoctorsList">
                    ${doctors.map(doctor => `
                    <div class="doctor-card ${doctor.status === 'Available' ? 'available' : 'leave'} p-6" onclick="showDoctorSchedule(${doctor.id})">
                        <div class="flex items-center gap-4">
                            <img src="${doctor.photo}" 
                                 alt="${doctor.name}" 
                                 class="w-16 h-16 rounded-full object-cover border-2 ${doctor.status === 'Available' ? 'border-cyan-200' : 'border-amber-200'}">
                            <div class="flex-1">
                                <h4 class="font-bold text-gray-800">${doctor.name}</h4>
                                <p class="text-cyan-600 text-sm font-medium">${doctor.specialty}</p>
                                <div class="mt-2">
                                    <span class="status-badge ${doctor.status === 'Available' ? 'status-available' : 'status-leave'}">
                                        ${doctor.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4 pt-4 border-t border-gray-100">
                            <div class="space-y-2">
                                <p class="text-gray-600 text-sm">
                                    <i class="fas fa-envelope mr-2"></i>${doctor.email}
                                </p>
                                <p class="text-gray-600 text-sm">
                                    <i class="fas fa-phone-alt mr-2"></i>${doctor.phone}
                                </p>
                                <div class="flex justify-between items-center mt-2">
                                    <span class="text-gray-600 text-sm">
                                        <i class="fas fa-calendar mr-1"></i>
                                        ${doctor.appointments.length} appointments
                                    </span>
                                    <button class="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                                        View Schedule →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>

            <!-- Schedule Section -->
            <div id="scheduleSection" class="hidden">
                <h3 class="text-lg font-bold text-gray-800 mb-6">Today's Complete Schedule</h3>
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table class="schedule-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Doctor</th>
                                <th>Patient</th>
                                <th>Token</th>
                                <th>Condition</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getAllAppointments().map(appt => `
                            <tr onclick="showDoctorSchedule(${appt.doctorId})" style="cursor: pointer;">
                                <td class="font-medium">${appt.time}</td>
                                <td>
                                    <div class="flex items-center gap-2">
                                        <img src="${appt.doctorPhoto}" 
                                             alt="${appt.doctorName}" 
                                             class="w-8 h-8 rounded-full object-cover">
                                        <span>${appt.doctorName}</span>
                                    </div>
                                </td>
                                <td>${appt.patient}</td>
                                <td><span class="token-badge">${appt.token}</span></td>
                                <td class="text-gray-600">${appt.condition}</td>
                            </tr>
                            `).join('')}
                            ${getAllAppointments().length === 0 ? `
                            <tr>
                                <td colspan="5" class="text-center py-8 text-gray-500">
                                    <i class="fas fa-calendar-times text-3xl mb-3 text-gray-300"></i>
                                    <p>No appointments scheduled for today</p>
                                </td>
                            </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Doctor Schedule Modal -->
    <div class="modal" id="scheduleModal">
        <div class="modal-content">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-gray-800" id="scheduleDoctorName"></h2>
                    <button onclick="closeModal('scheduleModal')" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div id="scheduleContent">
                    <!-- Content loaded by JavaScript -->
                </div>
            </div>
        </div>
    </div>

    <!-- Update Leave Modal -->
    <div class="modal" id="leaveModal">
        <div class="modal-content">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-gray-800">Update Doctor Leave</h2>
                    <button onclick="closeModal('leaveModal')" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="leaveForm" onsubmit="submitLeaveForm(event)">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-700 mb-2">Select Doctor</label>
                            <select id="leaveDoctor" class="w-full p-3 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" required>
                                <option value="">Choose a doctor</option>
                                ${doctors.map(doctor => `
                                <option value="${doctor.id}">${doctor.name} - ${doctor.specialty}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-700 mb-2">From Date</label>
                                <input type="date" id="leaveFromDate" class="w-full p-3 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" required>
                            </div>
                            <div>
                                <label class="block text-gray-700 mb-2">To Date</label>
                                <input type="date" id="leaveToDate" class="w-full p-3 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" required>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-gray-700 mb-2">Reason</label>
                            <textarea id="leaveReason" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" placeholder="Enter reason for leave..." required></textarea>
                        </div>
                        
                        <div class="flex gap-3 pt-4">
                            <button type="submit" class="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 flex-1 flex items-center justify-center gap-2">
                                <i class="fas fa-check"></i>
                                Update Leave Status
                            </button>
                            <button type="button" onclick="closeModal('leaveModal')" class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Make doctors data available globally
        const doctorsData = ${JSON.stringify(doctors)};
        
        // Navigation
        function showSection(sectionId) {
            // Hide all sections
            document.getElementById('dashboardSection').classList.add('hidden');
            document.getElementById('doctorsSection').classList.add('hidden');
            document.getElementById('scheduleSection').classList.add('hidden');
            
            // Remove active from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Show selected section
            document.getElementById(sectionId + 'Section').classList.remove('hidden');
            
            // Set active nav item
            const navItems = {
                dashboard: 0,
                doctors: 1,
                schedule: 2
            };
            document.querySelectorAll('.nav-item')[navItems[sectionId]]?.classList.add('active');
            
            // Update page title
            const titles = {
                dashboard: 'Dashboard Overview',
                doctors: 'All Doctors',
                schedule: "Today's Schedule"
            };
            document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';
        }
        
        // Show doctor schedule modal
        function showDoctorSchedule(doctorId) {
            const doctor = doctorsData.find(d => d.id === doctorId);
            if (!doctor) return;
            
            document.getElementById('scheduleDoctorName').textContent = doctor.name + "'s Schedule";
            
            const content = \`
                <div class="space-y-6">
                    <div class="flex items-center gap-6 p-4 bg-cyan-50 rounded-lg">
                        <img src="\${doctor.photo}" 
                             alt="\${doctor.name}" 
                             class="w-20 h-20 rounded-full object-cover border-4 \${doctor.status === 'Available' ? 'border-cyan-200' : 'border-amber-200'}">
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">\${doctor.name}</h3>
                            <p class="text-cyan-600 font-medium">\${doctor.specialty}</p>
                            <div class="mt-2">
                                <span class="status-badge \${doctor.status === 'Available' ? 'status-available' : 'status-leave'}">
                                    \${doctor.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    \${doctor.status === 'On Leave' ? \`
                    <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h4 class="font-bold text-amber-800 mb-2">
                            <i class="fas fa-umbrella-beach mr-2"></i> On Leave
                        </h4>
                        <p class="text-amber-700">From \${doctor.leaveFrom} to \${doctor.leaveTo}</p>
                        <p class="text-amber-600 text-sm mt-1">\${doctor.leaveReason || 'Not specified'}</p>
                    </div>
                    \` : ''}
                    
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-bold text-gray-800">Today's Appointments Schedule</h4>
                        <span class="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                            \${doctor.appointments.length} appointments
                        </span>
                    </div>
                    
                    \${doctor.appointments.length > 0 ? \`
                    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table class="w-full">
                            <thead>
                                <tr class="bg-gray-50">
                                    <th class="text-left p-3 text-gray-600 font-medium">Time</th>
                                    <th class="text-left p-3 text-gray-600 font-medium">Patient</th>
                                    <th class="text-left p-3 text-gray-600 font-medium">Token</th>
                                    <th class="text-left p-3 text-gray-600 font-medium">Condition</th>
                                </tr>
                            </thead>
                            <tbody>
                                \${doctor.appointments.map(appt => \`
                                <tr class="border-t border-gray-100 hover:bg-gray-50">
                                    <td class="p-3 font-medium">\${appt.time}</td>
                                    <td class="p-3">\${appt.patient}</td>
                                    <td class="p-3">
                                        <span class="token-badge">\${appt.token}</span>
                                    </td>
                                    <td class="p-3 text-gray-600">\${appt.condition}</td>
                                </tr>
                                \`).join('')}
                            </tbody>
                        </table>
                    </div>
                    \` : \`
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-calendar-times text-3xl mb-3 text-gray-300"></i>
                        <p>No appointments scheduled for today</p>
                    </div>
                    \`}
                    
                    <div class="pt-4 border-t border-gray-200">
                        <button class="bg-cyan-600 text-white w-full py-3 rounded-lg hover:bg-cyan-700 flex items-center justify-center gap-2" 
                                onclick="showLeaveModalForDoctor(\${doctor.id})">
                            <i class="fas fa-calendar-times"></i>
                            Update Leave Status
                        </button>
                    </div>
                </div>
            \`;
            
            document.getElementById('scheduleContent').innerHTML = content;
            document.getElementById('scheduleModal').style.display = 'flex';
        }
        
        // Show leave modal
        function showLeaveModal() {
            document.getElementById('leaveModal').style.display = 'flex';
        }
        
        function showLeaveModalForDoctor(doctorId) {
            document.getElementById('leaveDoctor').value = doctorId;
            showLeaveModal();
            closeModal('scheduleModal');
        }
        
        // Close modal
        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }
        
        // Submit leave form
        function submitLeaveForm(event) {
            event.preventDefault();
            
            const doctorId = parseInt(document.getElementById('leaveDoctor').value);
            const doctor = doctorsData.find(d => d.id === doctorId);
            
            if (!doctor) {
                alert('Please select a doctor');
                return;
            }
            
            const fromDate = document.getElementById('leaveFromDate').value;
            const toDate = document.getElementById('leaveToDate').value;
            const reason = document.getElementById('leaveReason').value;
            
            // Send to server
            fetch(\`/api/doctors/\${doctorId}/leave\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: fromDate,
                    to: toDate,
                    reason: reason
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update local data
                    doctor.status = 'On Leave';
                    doctor.leaveFrom = fromDate;
                    doctor.leaveTo = toDate;
                    doctor.leaveReason = reason;
                    doctor.appointments = [];
                    
                    // Update UI
                    updateDoctorsDisplay();
                    closeModal('leaveModal');
                    showToast(\`Leave updated for \${doctor.name}\`);
                    
                    // Reload page to reflect changes
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    alert('Failed to update leave: ' + (data.message || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update leave. Please try again.');
            });
        }
        
        // Update doctors display
        function updateDoctorsDisplay() {
            // This function will be called after server response
            // The page reload handles the UI update
        }
        
        // Toast notification
        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-cyan-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50';
            toast.innerHTML = \`
                <i class="fas fa-check-circle"></i>
                <span>\${message}</span>
            \`;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Set today's date for leave form
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            
            document.getElementById('leaveFromDate').min = today;
            document.getElementById('leaveFromDate').value = today;
            document.getElementById('leaveToDate').min = today;
            document.getElementById('leaveToDate').value = tomorrowStr;
            
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

// Helper functions
function getUpcomingAppointments() {
  let allAppointments = [];
  doctors.forEach(doctor => {
    doctor.appointments.forEach(appt => {
      allAppointments.push({
        ...appt,
        doctorName: doctor.name,
        doctorPhoto: doctor.photo
      });
    });
  });
  
  // Sort by time and take first 3
  allAppointments.sort((a, b) => {
    const timeA = convertTimeToNumber(a.time);
    const timeB = convertTimeToNumber(b.time);
    return timeA - timeB;
  });
  
  return allAppointments.slice(0, 3).map(appt => `
    <div class="appointment-item p-4">
      <div class="flex justify-between items-center">
        <div>
          <p class="font-medium text-gray-800">${appt.patient}</p>
          <p class="text-sm text-gray-500">${appt.doctorName}</p>
        </div>
        <div class="text-right">
          <span class="font-bold text-cyan-600">${appt.token}</span>
          <p class="text-sm text-gray-500">${appt.time}</p>
        </div>
      </div>
    </div>
  `).join('') || `
    <div class="text-center py-8 text-gray-500">
      <i class="fas fa-calendar-times text-3xl mb-3 text-gray-300"></i>
      <p>No appointments scheduled for today</p>
    </div>
  `;
}

function getAllAppointments() {
  let allAppointments = [];
  doctors.forEach(doctor => {
    doctor.appointments.forEach(appt => {
      allAppointments.push({
        ...appt,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorPhoto: doctor.photo,
        specialty: doctor.specialty
      });
    });
  });
  
  // Sort by time
  allAppointments.sort((a, b) => {
    const timeA = convertTimeToNumber(a.time);
    const timeB = convertTimeToNumber(b.time);
    return timeA - timeB;
  });
  
  return allAppointments;
}

function convertTimeToNumber(timeStr) {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hour = hours;
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour * 60 + minutes;
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
    
    doctor.status = 'On Leave';
    doctor.leaveFrom = from;
    doctor.leaveTo = to;
    doctor.leaveReason = reason;
    doctor.appointments = [];
    
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

// Start server
app.listen(port, () => {
  console.log(`Hospital Admin Dashboard running at http://localhost:${port}`);
  console.log(`Total doctors: ${doctors.length}`);
  console.log(`Available today: ${doctors.filter(d => d.status === 'Available').length}`);
});

module.exports = {
  doctors
};