const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve the appointments page
app.get('/appointments', (req, res) => {
    const html = generateAppointmentsHTML();
    res.send(html);
});

// API endpoint for booking appointments
app.post('/api/book-appointment', (req, res) => {
    console.log('Appointment booking:', req.body);
    // In real app: save to database
    res.json({
        success: true,
        message: 'Appointment booked successfully!',
        appointment: req.body
    });
});

// Mock SDK endpoints
app.get('/_sdk/element_sdk.js', (req, res) => {
    res.send(`
        // Mock Element SDK
        window.elementSdk = {
            init: function(config) {
                console.log('Element SDK initialized', config);
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
        window.dataSdk = {
            init: async function(handler) {
                console.log('Data SDK initialized');
                // Simulate loading existing appointments
                setTimeout(() => {
                    if (handler.onDataChanged) {
                        handler.onDataChanged([]); // Start with empty appointments
                    }
                }, 100);
                return { isOk: true };
            },
            create: async function(data) {
                console.log('Creating record:', data);
                // Simulate successful creation
                return { isOk: true, data };
            }
        };
    `);
});

function generateAppointmentsHTML() {
    return `
<!doctype html>
<html lang="en" class="h-full">
 <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book Appointment</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="/_sdk/element_sdk.js"></script>
  <script src="/_sdk/data_sdk.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
  <style>
    body {
      box-sizing: border-box;
      font-family: 'DM Sans', sans-serif;
    }
    .gradient-bg {
      background: linear-gradient(135deg, #53f8f8 0%, #1edbf4 50%, #a5e9fc 100%);
      position: relative;
      overflow: hidden;
    }
    .moving-line {
      position: absolute;
      height: 2px;
      background: rgba(255, 255, 255, 0.3);
      animation: moveLine 3s linear infinite;
    }
    @keyframes moveLine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100vw); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }
    .pulse-dot {
      animation: pulse 2s ease-in-out infinite;
    }
    .card-hover {
      transition: all 0.3s ease;
    }
    .card-hover:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .book-btn {
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
      transition: all 0.3s ease;
    }
    .book-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 10px 30px rgba(8, 145, 178, 0.4);
    }
    .filter-chip {
      transition: all 0.2s ease;
    }
    .filter-chip:hover {
      background: #06b6d4;
      color: white;
      transform: translateY(-1px);
    }
    .filter-chip.active {
      background: #06b6d4;
      color: white;
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    }
    .modal-overlay {
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-up {
      animation: slideUp 0.3s ease forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in {
      animation: fadeIn 0.5s ease forwards;
    }
    .time-slot {
      transition: all 0.2s ease;
    }
    .time-slot:hover {
      transform: scale(1.05);
    }
    .time-slot.selected {
      background: #06b6d4;
      color: white;
      border-color: #06b6d4;
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    }
    .hospital-card {
      transition: all 0.3s ease;
    }
    .hospital-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .doctor-card {
      transition: all 0.3s ease;
    }
    .doctor-card:hover {
      border-color: #06b6d4;
      box-shadow: 0 15px 35px rgba(0,0,0,0.08);
    }
  </style>
  <style>@view-transition { navigation: auto; }</style>
 </head>
 <body class="h-full bg-gray-50">
  <div id="app" class="h-full overflow-auto">
   <!-- Enhanced Header -->
   <div class="gradient-bg text-white px-6 py-12">
    <!-- Animated moving lines -->
    <div class="moving-line top-1/4 w-20" style="animation-delay: 0s;"></div>
    <div class="moving-line top-1/2 w-32" style="animation-delay: 0.5s;"></div>
    <div class="moving-line top-3/4 w-24" style="animation-delay: 1s;"></div>
    
    <!-- Pulsing dots -->
    <div class="absolute top-6 right-12 w-4 h-4 bg-white rounded-full pulse-dot"></div>
    <div class="absolute bottom-8 left-10 w-3 h-3 bg-white rounded-full pulse-dot" style="animation-delay: 1s;"></div>
    
    <div class="max-w-6xl mx-auto relative z-10">
     <div class="flex items-center gap-4 mb-8">
      <div class="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
       <svg class="w-10 h-10" fill="none" stroke="currentColor" viewbox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
       </svg>
      </div>
      <div>
       <h1 id="page-title" class="text-3xl md:text-4xl font-bold mb-2" style="text-shadow: 0 6px 12px rgba(42, 157, 245, 0.6), 0 10px 30px rgba(27, 198, 250, 0.4);">
        Find & Book Appointments
        </h1>
       <p class="text-white/80 text-lg">Connect with top specialists across partner hospitals</p>
      </div>
     </div>
     
     <!-- Search Bar -->
     <div class="relative max-w-2xl">
      <svg class="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewbox="0 0 24 24">
       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input type="text" id="search-input" placeholder="Search by doctor, hospital, or department..." class="w-full pl-14 pr-6 py-5 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl bg-white/95 backdrop-blur-sm text-lg">
     </div>
    </div>
   </div>
   
   <!-- Filter Chips -->
   <div class="px-6 py-6 bg-white/90 backdrop-blur-sm border-b sticky top-0 z-20">
    <div class="max-w-6xl mx-auto">
     <p class="text-gray-600 mb-4 font-medium">Specialties</p>
     <div class="flex gap-3 overflow-x-auto pb-3">
      <button class="filter-chip active px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[100px] text-center" data-filter="all"> All Specialties </button>
      <button class="filter-chip px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[100px] text-center" data-filter="pediatrics"> Pediatrics </button>
      <button class="filter-chip px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[100px] text-center" data-filter="gynecology"> Gynecology </button>
      <button class="filter-chip px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[100px] text-center" data-filter="cardiology"> Cardiology </button>
      <button class="filter-chip px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[100px] text-center" data-filter="orthopedics"> Orthopedics </button>
      <button class="filter-chip px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[100px] text-center" data-filter="dermatology"> Dermatology </button>
      <button class="filter-chip px-5 py-3 rounded-xl text-sm font-medium bg-gray-100 whitespace-nowrap min-w-[100px] text-center" data-filter="neurology"> Neurology </button>
     </div>
    </div>
   </div>
   
   <!-- Main Content -->
   <div class="max-w-6xl mx-auto px-6 py-8">
    <!-- Available Doctors -->
    <div class="mb-12">
     <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">Available Doctors</h2>
      <span class="text-sm text-gray-500" id="doctor-count">9 doctors available</span>
     </div>
     <div id="doctors-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Doctor cards will be rendered here -->
     </div>
    </div>
    
    <!-- Divider -->
    <div class="border-t border-gray-200 my-10"></div>
    
    <!-- Previously Visited Section -->
    <div class="mb-12">
     <div class="flex items-center gap-3 mb-6">
      <div class="bg-cyan-100 p-2 rounded-xl">
       <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewbox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
       </svg>
      </div>
      <div>
       <h2 class="text-xl font-bold text-gray-800">Previously Visited Hospitals</h2>
       <p class="text-gray-500 text-sm">Quick access to your frequently visited facilities</p>
      </div>
     </div>
     <div id="visited-hospitals" class="grid grid-cols-2 md:grid-cols-4 gap-5">
      <!-- Visited hospital cards will be rendered here -->
     </div>
    </div>
   </div>
   
   <!-- Booking Modal -->
   <div id="booking-modal" class="fixed inset-0 modal-overlay z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-up">
     <div class="p-8">
      <div class="flex justify-between items-center mb-8">
       <h3 class="text-2xl font-bold text-gray-800">Book Appointment</h3>
       <button id="close-modal" class="p-2 hover:bg-gray-100 rounded-full transition">
        <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewbox="0 0 24 24">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
       </button>
      </div>
      
      <div id="modal-doctor-info" class="flex items-center gap-5 p-5 bg-cyan-50 rounded-2xl mb-8 border border-cyan-100">
       <!-- Doctor info will be populated here -->
      </div>
      
      <form id="booking-form">
       <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
        <input type="date" id="appointment-date" required class="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-lg">
       </div>
       
       <div class="mb-8">
        <label class="block text-sm font-medium text-gray-700 mb-3">Select Time Slot</label>
        <div id="time-slots" class="grid grid-cols-3 gap-3">
         <button type="button" class="time-slot px-4 py-3 text-sm border border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition" data-time="09:00 AM">09:00 AM</button>
         <button type="button" class="time-slot px-4 py-3 text-sm border border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition" data-time="10:00 AM">10:00 AM</button>
         <button type="button" class="time-slot px-4 py-3 text-sm border border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition" data-time="11:00 AM">11:00 AM</button>
         <button type="button" class="time-slot px-4 py-3 text-sm border border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition" data-time="02:00 PM">02:00 PM</button>
         <button type="button" class="time-slot px-4 py-3 text-sm border border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition" data-time="03:00 PM">03:00 PM</button>
         <button type="button" class="time-slot px-4 py-3 text-sm border border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition" data-time="04:00 PM">04:00 PM</button>
        </div>
       </div>
       
       <button type="submit" id="confirm-booking" class="w-full book-btn text-white font-semibold py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300" disabled>
        Confirm Booking
       </button>
      </form>
     </div>
    </div>
   </div>
   
   <!-- Success Toast -->
   <div id="success-toast" class="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl hidden transform transition-all duration-300 translate-y-4 opacity-0 z-50">
    <div class="flex items-center gap-4">
     <div class="bg-white/20 p-2 rounded-full">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewbox="0 0 24 24">
       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
     </div>
     <span class="font-medium">Appointment booked successfully!</span>
    </div>
   </div>
  </div>
  
  <script>
    // Reference Data - Doctors
    const doctors = [
      { id: 'd1', name: 'Dr. Sarah Johnson', specialty: 'Pediatrics', department: 'pediatrics', hospital: "St Mary's Hospital", hospitalId: 'h1', avatar: '👩‍⚕️', rating: 4.9, experience: '15 years' },
      { id: 'd2', name: 'Dr. Emily Chen', specialty: 'Gynecology', department: 'gynecology', hospital: 'Aster Medical Center', hospitalId: 'h2', avatar: '👩‍⚕️', rating: 4.8, experience: '12 years' },
      { id: 'd3', name: 'Dr. Michael Roberts', specialty: 'Cardiology', department: 'cardiology', hospital: "St Mary's Hospital", hospitalId: 'h1', avatar: '👨‍⚕️', rating: 4.9, experience: '20 years' },
      { id: 'd4', name: 'Dr. Priya Sharma', specialty: 'Pediatrics', department: 'pediatrics', hospital: 'Apollo Hospital', hospitalId: 'h3', avatar: '👩‍⚕️', rating: 4.7, experience: '10 years' },
      { id: 'd5', name: 'Dr. James Wilson', specialty: 'Orthopedics', department: 'orthopedics', hospital: 'Aster Medical Center', hospitalId: 'h2', avatar: '👨‍⚕️', rating: 4.8, experience: '18 years' },
      { id: 'd6', name: 'Dr. Lisa Anderson', specialty: 'Dermatology', department: 'dermatology', hospital: 'City General Hospital', hospitalId: 'h4', avatar: '👩‍⚕️', rating: 4.6, experience: '8 years' },
      { id: 'd7', name: 'Dr. David Kim', specialty: 'Neurology', department: 'neurology', hospital: "St Mary's Hospital", hospitalId: 'h1', avatar: '👨‍⚕️', rating: 4.9, experience: '22 years' },
      { id: 'd8', name: 'Dr. Rachel Green', specialty: 'Gynecology', department: 'gynecology', hospital: 'Apollo Hospital', hospitalId: 'h3', avatar: '👩‍⚕️', rating: 4.7, experience: '14 years' },
      { id: 'd9', name: 'Dr. Alex Martinez', specialty: 'Cardiology', department: 'cardiology', hospital: 'City General Hospital', hospitalId: 'h4', avatar: '👨‍⚕️', rating: 4.8, experience: '16 years' }
    ];

    // Reference Data - Hospitals
    const hospitals = [
      { id: 'h1', name: "St Mary's Hospital", image: '🏥', color: '#06b6d4' },
      { id: 'h2', name: 'Aster Medical Center', image: '🏨', color: '#0891b2' },
      { id: 'h3', name: 'Apollo Hospital', image: '🏥', color: '#0e7490' },
      { id: 'h4', name: 'City General Hospital', image: '🏨', color: '#22d3ee' }
    ];

    // State
    let currentFilter = 'all';
    let searchQuery = '';
    let selectedDoctor = null;
    let selectedDate = '';
    let selectedTime = '';
    let appointments = [];
    let recordCount = 0;

    // Default config
    const defaultConfig = {
      page_title: 'Find & Book Appointments',
      search_placeholder: 'Search by doctor, hospital, or department...',
      primary_color: '#06b6d4',
      secondary_color: '#0891b2',
      text_color: '#1f2937',
      background_color: '#ffffff',
      accent_color: '#22d3ee'
    };

    // Data Handler
    const dataHandler = {
      onDataChanged(data) {
        appointments = data;
        recordCount = data.length;
        renderVisitedHospitals();
      }
    };

    // Initialize SDKs
    async function initApp() {
      // Initialize Element SDK
      if (window.elementSdk) {
        window.elementSdk.init({
          defaultConfig,
          onConfigChange: async (config) => {
            document.getElementById('page-title').textContent = config.page_title || defaultConfig.page_title;
            document.getElementById('search-input').placeholder = config.search_placeholder || defaultConfig.search_placeholder;
          },
          mapToCapabilities: (config) => ({
            recolorables: [
              {
                get: () => config.background_color || defaultConfig.background_color,
                set: (value) => window.elementSdk.setConfig({ background_color: value })
              },
              {
                get: () => config.primary_color || defaultConfig.primary_color,
                set: (value) => window.elementSdk.setConfig({ primary_color: value })
              },
              {
                get: () => config.text_color || defaultConfig.text_color,
                set: (value) => window.elementSdk.setConfig({ text_color: value })
              },
              {
                get: () => config.secondary_color || defaultConfig.secondary_color,
                set: (value) => window.elementSdk.setConfig({ secondary_color: value })
              },
              {
                get: () => config.accent_color || defaultConfig.accent_color,
                set: (value) => window.elementSdk.setConfig({ accent_color: value })
              }
            ],
            borderables: [],
            fontEditable: undefined,
            fontSizeable: undefined
          }),
          mapToEditPanelValues: (config) => new Map([
            ['page_title', config.page_title || defaultConfig.page_title],
            ['search_placeholder', config.search_placeholder || defaultConfig.search_placeholder]
          ])
        });
      }

      // Initialize Data SDK
      if (window.dataSdk) {
        const result = await window.dataSdk.init(dataHandler);
        if (!result.isOk) {
          console.error('Failed to initialize Data SDK');
        }
      }

      renderDoctors();
      renderVisitedHospitals();
      setupEventListeners();
      updateDoctorCount();
    }

    // Render doctors
    function renderDoctors() {
      const grid = document.getElementById('doctors-grid');
      const filtered = doctors.filter(doc => {
        const matchesFilter = currentFilter === 'all' || doc.department === currentFilter;
        const matchesSearch = searchQuery === '' || 
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      });

      updateDoctorCount(filtered.length);

      grid.innerHTML = filtered.map((doc, index) => \`
        <div class="doctor-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-cyan-200 fade-in" style="animation-delay: \${index * 0.1}s">
          <div class="flex gap-5 mb-5">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 border-2 border-cyan-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              <svg class="w-12 h-12 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-gray-800 text-lg mb-1">\${doc.name}</h3>
              <p class="text-cyan-600 font-medium mb-2">\${doc.specialty}</p>
              <div class="flex items-center text-gray-500 text-sm">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <span>\${doc.hospital}</span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-between pt-5 border-t border-gray-100">
            <div class="flex items-center gap-4 text-sm text-gray-600">
              <span class="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
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

    // Update doctor count
    function updateDoctorCount(count) {
      const filteredCount = count || doctors.filter(doc => {
        const matchesFilter = currentFilter === 'all' || doc.department === currentFilter;
        const matchesSearch = searchQuery === '' || 
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      }).length;
      
      document.getElementById('doctor-count').textContent = \`\${filteredCount} \${filteredCount === 1 ? 'doctor' : 'doctors'} available\`;
    }

    // Render visited hospitals
    function renderVisitedHospitals() {
      const container = document.getElementById('visited-hospitals');
      
      // Get unique hospitals from appointments
      const visitedHospitalIds = [...new Set(appointments.map(a => {
        const doc = doctors.find(d => d.id === a.doctor_id);
        return doc ? doc.hospitalId : null;
      }).filter(Boolean))];

      const visitedHospitals = visitedHospitalIds.length > 0 
        ? hospitals.filter(h => visitedHospitalIds.includes(h.id))
        : hospitals.slice(0, 4); // Show sample hospitals if no visits yet

      container.innerHTML = visitedHospitals.map((hospital, index) => \`
        <div class="hospital-card bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer fade-in" onclick="filterByHospital('\${hospital.name}')" style="animation-delay: \${index * 0.1}s">
          <div class="w-full h-28 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 overflow-hidden">
            <svg class="w-16 h-16 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-800 text-center mb-2">\${hospital.name}</p>
          \${appointments.filter(a => {
            const doc = doctors.find(d => d.id === a.doctor_id);
            return doc && doc.hospitalId === hospital.id;
          }).length > 0 ? \`
            <p class="text-xs text-cyan-600 text-center font-medium">
              \${appointments.filter(a => {
                const doc = doctors.find(d => d.id === a.doctor_id);
                return doc && doc.hospitalId === hospital.id;
              }).length} visit\${appointments.filter(a => {
                const doc = doctors.find(d => d.id === a.doctor_id);
                return doc && doc.hospitalId === hospital.id;
              }).length > 1 ? 's' : ''}
            </p>
          \` : '<p class="text-xs text-gray-400 text-center">Top rated facility</p>'}
        </div>
      \`).join('');
    }

    // Filter by hospital
    function filterByHospital(hospitalName) {
      searchQuery = hospitalName;
      document.getElementById('search-input').value = hospitalName;
      renderDoctors();
    }

    // Open booking modal
    function openBookingModal(doctorId) {
      selectedDoctor = doctors.find(d => d.id === doctorId);
      if (!selectedDoctor) return;

      const modal = document.getElementById('booking-modal');
      const doctorInfo = document.getElementById('modal-doctor-info');
      
      doctorInfo.innerHTML = \`
        <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 border-2 border-cyan-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          <svg class="w-10 h-10 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="font-bold text-gray-800 text-lg">\${selectedDoctor.name}</h4>
          <p class="text-cyan-600 font-medium">\${selectedDoctor.specialty}</p>
          <div class="flex items-center text-gray-500 text-sm mt-1">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>\${selectedDoctor.hospital}</span>
          </div>
        </div>
      \`;

      // Set min date to today
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('appointment-date').min = today;
      document.getElementById('appointment-date').value = '';
      
      // Reset selections
      selectedDate = '';
      selectedTime = '';
      document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
      });
      document.getElementById('confirm-booking').disabled = true;

      modal.classList.remove('hidden');
    }

    // Setup event listeners
    function setupEventListeners() {
      // Search
      document.getElementById('search-input').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderDoctors();
      });

      // Filter chips
      document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          currentFilter = chip.dataset.filter;
          renderDoctors();
        });
      });

      // Close modal
      document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('booking-modal').classList.add('hidden');
      });

      document.getElementById('booking-modal').addEventListener('click', (e) => {
        if (e.target.id === 'booking-modal') {
          document.getElementById('booking-modal').classList.add('hidden');
        }
      });

      // Date selection
      document.getElementById('appointment-date').addEventListener('change', (e) => {
        selectedDate = e.target.value;
        updateConfirmButton();
      });

      // Time slot selection
      document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', () => {
          document.querySelectorAll('.time-slot').forEach(s => {
            s.classList.remove('selected');
          });
          slot.classList.add('selected');
          selectedTime = slot.dataset.time;
          updateConfirmButton();
        });
      });

      // Booking form
      document.getElementById('booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await bookAppointment();
      });
    }

    // Update confirm button state
    function updateConfirmButton() {
      const btn = document.getElementById('confirm-booking');
      btn.disabled = !selectedDate || !selectedTime;
    }

    // Book appointment
    async function bookAppointment() {
      if (!selectedDoctor || !selectedDate || !selectedTime) return;

      if (recordCount >= 999) {
        showToast('Maximum appointments reached. Please cancel some appointments first.', 'error');
        return;
      }

      const btn = document.getElementById('confirm-booking');
      btn.disabled = true;
      btn.textContent = 'Booking...';

      try {
        const response = await fetch('/api/book-appointment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: 'patient_001',
            doctor_id: selectedDoctor.id,
            doctor_name: selectedDoctor.name,
            hospital_name: selectedDoctor.hospital,
            department: selectedDoctor.department,
            appointment_date: selectedDate,
            appointment_time: selectedTime,
            status: 'confirmed',
            created_at: new Date().toISOString()
          })
        });

        if (response.ok) {
          const data = await response.json();
          // Add to local state
          appointments.push(data.appointment);
          recordCount++;
          
          document.getElementById('booking-modal').classList.add('hidden');
          renderVisitedHospitals();
          showToast('Appointment booked successfully!', 'success');
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

    // Show toast
    function showToast(message, type) {
      const toast = document.getElementById('success-toast');
      toast.querySelector('span').textContent = message;
      toast.className = \`fixed bottom-8 right-8 \${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-300 z-50\`;
      
      setTimeout(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
      }, 10);

      setTimeout(() => {
        toast.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => toast.classList.add('hidden'), 300);
      }, 3000);
    }

    // Make functions globally available
    window.openBookingModal = openBookingModal;
    window.filterByHospital = filterByHospital;

    // Initialize app
    initApp();
  </script>
 </body>
</html>`;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Appointments server running on http://localhost:${PORT}`);
    console.log(`Appointments page: http://localhost:${PORT}/appointments`);
    console.log(`Press Ctrl+C to stop the server`);
});