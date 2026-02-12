const http = require('http');
const PORT = process.env.PORT || 3002;

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lab Technician Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: #f5f9fc;
            color: #333;
            min-height: 100vh;
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, #0066cc 0%, #004d99 100%);
            color: white;
            padding: 20px 30px;
            box-shadow: 0 4px 12px rgba(0, 51, 102, 0.15);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo-icon {
            font-size: 32px;
            background: rgba(255, 255, 255, 0.2);
            width: 50px;
            height: 50px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        }

        .logo-text h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .logo-text p {
            font-size: 13px;
            opacity: 0.9;
        }

        .user-info {
            text-align: right;
        }

        .user-id {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .user-role {
            font-size: 13px;
            opacity: 0.9;
            background: rgba(255, 255, 255, 0.15);
            padding: 4px 12px;
            border-radius: 20px;
            display: inline-block;
        }

        /* Main Container */
        .container {
            display: flex;
            min-height: calc(100vh - 90px);
        }

        /* Sidebar */
        .sidebar {
            width: 250px;
            background: white;
            box-shadow: 4px 0 12px rgba(0, 0, 0, 0.05);
            padding: 25px 0;
            display: flex;
            flex-direction: column;
        }

        .nav-item {
            padding: 16px 25px;
            display: flex;
            align-items: center;
            gap: 15px;
            color: #555;
            text-decoration: none;
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
            cursor: pointer;
        }

        .nav-item:hover {
            background: #f0f7ff;
            color: #0066cc;
        }

        .nav-item.active {
            background: #e6f2ff;
            color: #0066cc;
            border-left: 4px solid #0066cc;
            font-weight: 600;
        }

        .nav-icon {
            font-size: 20px;
            width: 24px;
            text-align: center;
        }

        .nav-text {
            font-size: 15px;
        }

        /* Main Content */
        .main-content {
            flex: 1;
            padding: 30px;
            overflow-y: auto;
        }

        /* Dashboard Stats */
        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
            font-size: 32px;
            margin-bottom: 15px;
            color: #0066cc;
        }

        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #0066cc;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Form Container */
        .form-container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            margin-bottom: 30px;
        }

        .form-title {
            font-size: 22px;
            font-weight: 600;
            color: #0066cc;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f7ff;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #444;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .form-input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e6ed;
            border-radius: 8px;
            font-size: 15px;
            transition: all 0.3s ease;
            background: white;
        }

        .form-input:focus {
            outline: none;
            border-color: #0066cc;
            box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }

        .form-input[readonly] {
            background: #f8fafc;
            color: #666;
            cursor: not-allowed;
        }

        .radio-group {
            display: flex;
            gap: 20px;
            margin-top: 10px;
        }

        .radio-label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 14px;
            color: #555;
        }

        .radio-label input[type="radio"] {
            width: 18px;
            height: 18px;
        }

        .file-upload {
            border: 2px dashed #e0e6ed;
            border-radius: 8px;
            padding: 40px 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .file-upload:hover {
            border-color: #0066cc;
            background: #f8fafc;
        }

        .file-upload-icon {
            font-size: 48px;
            color: #0066cc;
            margin-bottom: 15px;
        }

        .file-upload-text {
            font-size: 16px;
            color: #666;
            margin-bottom: 10px;
        }

        .file-upload-subtext {
            font-size: 13px;
            color: #999;
        }

        #fileInput {
            display: none;
        }

        .textarea {
            min-height: 120px;
            resize: vertical;
        }

        .submit-btn {
            background: linear-gradient(135deg, #0066cc 0%, #004d99 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 15px 40px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 30px auto 0;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 102, 204, 0.3);
        }

        .submit-btn:active {
            transform: translateY(0);
        }

        /* Patients Table */
        .table-container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }

        .search-box {
            display: flex;
            align-items: center;
            background: #f8fafc;
            border: 2px solid #e0e6ed;
            border-radius: 8px;
            padding: 10px 15px;
            width: 300px;
        }

        .search-input {
            border: none;
            background: none;
            outline: none;
            flex: 1;
            padding: 0 10px;
            font-size: 14px;
        }

        .search-icon {
            color: #999;
            font-size: 18px;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
        }

        .table th {
            background: #f0f7ff;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #0066cc;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #e0e6ed;
        }

        .table td {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
        }

        .table tr:hover {
            background: #f8fafc;
        }

        .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-pending {
            background: #fff3cd;
            color: #856404;
        }

        .status-completed {
            background: #d4edda;
            color: #155724;
        }

        .status-urgent {
            background: #f8d7da;
            color: #721c24;
        }

        .action-btn {
            padding: 6px 12px;
            border: 1px solid #e0e6ed;
            border-radius: 6px;
            background: white;
            color: #555;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-right: 5px;
        }

        .action-btn:hover {
            background: #f0f7ff;
            color: #0066cc;
            border-color: #0066cc;
        }

        /* Success Message */
        .success-message {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #d4edda;
            color: #155724;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 1000;
            transform: translateX(150%);
            transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .success-message.show {
            transform: translateX(0);
        }

        .success-icon {
            font-size: 24px;
        }

        /* Hidden Content */
        .hidden {
            display: none;
        }

        /* Add back button style */
        .logout-btn {
            padding: 8px 20px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
            margin-left: 20px;
        }

        .logout-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }

        .user-controls {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
            .container {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
                flex-direction: row;
                overflow-x: auto;
                padding: 15px;
            }
            
            .nav-item {
                flex-direction: column;
                padding: 10px 15px;
                min-width: 100px;
                border-left: none;
                border-bottom: 4px solid transparent;
            }
            
            .nav-item.active {
                border-left: none;
                border-bottom: 4px solid #0066cc;
            }
        }

        @media (max-width: 768px) {
            .stats-container {
                grid-template-columns: 1fr;
            }
            
            .form-grid {
                grid-template-columns: 1fr;
            }
            
            .table-header {
                flex-direction: column;
                gap: 15px;
            }
            
            .search-box {
                width: 100%;
            }
            
            .table {
                display: block;
                overflow-x: auto;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="logo">
            <div class="logo-icon">🔬</div>
            <div class="logo-text">
                <h1>Bond Health Labs</h1>
                <p>Laboratory Management System</p>
            </div>
        </div>
        <div class="user-info">
            <div class="user-controls">
                <div class="user-details">
                    <div class="user-id" id="loggedInUser">Technician ID: Loading...</div>
                    <div class="user-role">Lab Technician</div>
                </div>
                <button class="logout-btn" onclick="logout()">← Sign Out</button>
            </div>
        </div>
    </div>

    <!-- Main Container -->
    <div class="container">
        <!-- Sidebar Navigation -->
        <div class="sidebar">
            <div class="nav-item active" data-tab="send">
                <div class="nav-icon">📤</div>
                <div class="nav-text">Send Report</div>
            </div>
            <div class="nav-item" data-tab="patients">
                <div class="nav-icon">👥</div>
                <div class="nav-text">Patient History</div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Dashboard Stats -->
            <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">47</div>
                    <div class="stat-label">Today's Tests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏳</div>
                    <div class="stat-value">8</div>
                    <div class="stat-label">Pending Reports</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">39</div>
                    <div class="stat-label">Completed Today</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🚨</div>
                    <div class="stat-value">2</div>
                    <div class="stat-label">Urgent Cases</div>
                </div>
            </div>

            <!-- Send Report Form (Default Active) -->
            <div id="sendTab" class="form-container">
                <div class="form-title">
                    <span>📋</span> Send Lab Report
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Patient ID (PID)</label>
                        <input type="text" class="form-input" id="pid" placeholder="Enter Patient ID" required>
                        <div class="recent-patients" style="margin-top: 10px; font-size: 13px; color: #666;">
                            Recent: <span class="patient-suggestion" style="color: #0066cc; cursor: pointer; margin: 0 5px;">P-1001</span>
                            <span class="patient-suggestion" style="color: #0066cc; cursor: pointer; margin: 0 5px;">P-1005</span>
                            <span class="patient-suggestion" style="color: #0066cc; cursor: pointer; margin: 0 5px;">P-1012</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Doctor ID</label>
                        <input type="text" class="form-input" id="docId" placeholder="Enter Doctor ID" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Technician ID</label>
                        <input type="text" class="form-input" id="techId" value="LAB-2024-8473" readonly>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Test Type</label>
                        <select class="form-input" id="testType" required>
                            <option value="">Select Test Type</option>
                            <option value="blood">Blood Test</option>
                            <option value="xray">X-Ray</option>
                            <option value="mri">MRI Scan</option>
                            <option value="urine">Urine Analysis</option>
                            <option value="ecg">ECG</option>
                            <option value="ultrasound">Ultrasound</option>
                            <option value="biopsy">Biopsy</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Priority Level</label>
                        <select class="form-input" id="priority" required>
                            <option value="normal">Normal</option>
                            <option value="urgent">Urgent</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Send Report To</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="sendTo" value="doctor" checked>
                                Doctor Only
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="sendTo" value="patient">
                                Patient Only
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="sendTo" value="both">
                                Both
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Test Results</label>
                    <textarea class="form-input textarea" id="testResults" placeholder="Enter detailed test results and observations..." required></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Upload Lab Report</label>
                    <div class="file-upload" onclick="document.getElementById('fileInput').click()">
                        <div class="file-upload-icon">📎</div>
                        <div class="file-upload-text">Click to upload lab report file</div>
                        <div class="file-upload-subtext">Supports PDF, JPG, PNG (Max 10MB)</div>
                        <input type="file" id="fileInput" accept=".pdf,.jpg,.jpeg,.png">
                    </div>
                    <div id="fileName" style="margin-top: 10px; font-size: 14px; color: #666;"></div>
                </div>
                
                <button class="submit-btn" id="submitReport">
                    <span>📤</span> Send Report
                </button>
            </div>

            <!-- Patient History Table (Hidden by Default) -->
            <div id="patientsTab" class="table-container hidden">
                <div class="table-header">
                    <div class="form-title">
                        <span>📋</span> Patient History
                    </div>
                    <div class="search-box">
                        <span class="search-icon">🔍</span>
                        <input type="text" class="search-input" id="searchPatients" placeholder="Search patients...">
                    </div>
                </div>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th>Patient ID</th>
                            <th>Name</th>
                            <th>Test Type</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="patientsTable">
                        <!-- Table rows will be populated by JavaScript -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Success Message -->
    <div class="success-message" id="successMessage">
        <div class="success-icon">✅</div>
        <div class="success-text">Report sent successfully!</div>
    </div>

    <script>
        // Tab Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                // Remove active class from all tabs
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Hide all content
                document.getElementById('sendTab').classList.add('hidden');
                document.getElementById('patientsTab').classList.add('hidden');
                
                // Show selected content
                const tab = this.dataset.tab;
                document.getElementById(tab + 'Tab').classList.remove('hidden');
                
                // If patients tab is selected, populate the table
                if (tab === 'patients') {
                    populatePatientsTable();
                }
            });
        });

        // File Upload Display
        document.getElementById('fileInput').addEventListener('change', function(e) {
            const fileName = e.target.files[0] ? e.target.files[0].name : 'No file chosen';
            document.getElementById('fileName').textContent = 'Selected file: ' + fileName;
        });

        // Recent Patient Suggestions
        document.querySelectorAll('.patient-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                document.getElementById('pid').value = this.textContent;
            });
        });

        // Form Submission
        document.getElementById('submitReport').addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get form values
            const pid = document.getElementById('pid').value;
            const docId = document.getElementById('docId').value;
            const testType = document.getElementById('testType').value;
            const priority = document.getElementById('priority').value;
            const testResults = document.getElementById('testResults').value;
            const sendTo = document.querySelector('input[name="sendTo"]:checked').value;
            
            // Basic validation
            if (!pid || !docId || !testType || !testResults) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Show success message
            const successMessage = document.getElementById('successMessage');
            let recipientText = '';
            if (sendTo === 'doctor') recipientText = 'Doctor';
            else if (sendTo === 'patient') recipientText = 'Patient';
            else recipientText = 'Doctor & Patient';
            
            successMessage.querySelector('.success-text').textContent = 
                'Report for Patient ' + pid + ' sent to ' + recipientText;
            successMessage.classList.add('show');
            
            // Reset form
            document.getElementById('pid').value = '';
            document.getElementById('docId').value = '';
            document.getElementById('testType').value = '';
            document.getElementById('priority').value = 'normal';
            document.getElementById('testResults').value = '';
            document.getElementById('fileName').textContent = '';
            document.getElementById('fileInput').value = '';
            
            // Hide success message after 3 seconds
            setTimeout(function() {
                successMessage.classList.remove('show');
            }, 3000);
            
            // Update stats
            updateStats();
        });

        // Sample patient data
        const samplePatients = [
            { id: 'P-1001', name: 'John Smith', testType: 'Blood Test', date: '2024-12-15', status: 'completed' },
            { id: 'P-1002', name: 'Emma Johnson', testType: 'X-Ray', date: '2024-12-15', status: 'pending' },
            { id: 'P-1003', name: 'Michael Brown', testType: 'MRI Scan', date: '2024-12-14', status: 'completed' },
            { id: 'P-1004', name: 'Sarah Davis', testType: 'Urine Analysis', date: '2024-12-14', status: 'urgent' },
            { id: 'P-1005', name: 'Robert Wilson', testType: 'ECG', date: '2024-12-13', status: 'completed' },
            { id: 'P-1006', name: 'Lisa Miller', testType: 'Ultrasound', date: '2024-12-13', status: 'pending' },
            { id: 'P-1007', name: 'David Taylor', testType: 'Blood Test', date: '2024-12-12', status: 'completed' },
            { id: 'P-1008', name: 'Jennifer Lee', testType: 'X-Ray', date: '2024-12-12', status: 'completed' }
        ];

        // Populate patients table
        function populatePatientsTable() {
            const tableBody = document.getElementById('patientsTable');
            tableBody.innerHTML = '';
            
            samplePatients.forEach(function(patient) {
                const row = document.createElement('tr');
                
                // Status badge class
                let statusClass = 'status-completed';
                let statusText = 'Completed';
                if (patient.status === 'pending') {
                    statusClass = 'status-pending';
                    statusText = 'Pending';
                } else if (patient.status === 'urgent') {
                    statusClass = 'status-urgent';
                    statusText = 'Urgent';
                }
                
                row.innerHTML = 
                    '<td>' + patient.id + '</td>' +
                    '<td>' + patient.name + '</td>' +
                    '<td>' + patient.testType + '</td>' +
                    '<td>' + patient.date + '</td>' +
                    '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                    '<td>' +
                        '<button class="action-btn view-btn" data-id="' + patient.id + '">View</button>' +
                        '<button class="action-btn download-btn" data-id="' + patient.id + '">Download</button>' +
                    '</td>';
                
                tableBody.appendChild(row);
            });
            
            // Add event listeners to action buttons
            document.querySelectorAll('.view-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const patientId = this.getAttribute('data-id');
                    alert('Viewing details for ' + patientId);
                });
            });
            
            document.querySelectorAll('.download-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const patientId = this.getAttribute('data-id');
                    alert('Downloading report for ' + patientId);
                });
            });
        }

        // Search functionality
        document.getElementById('searchPatients').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#patientsTable tr');
            
            rows.forEach(function(row) {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });

        // Update stats after submission
        function updateStats() {
            const todayTests = document.querySelector('.stat-card:nth-child(1) .stat-value');
            const pendingReports = document.querySelector('.stat-card:nth-child(2) .stat-value');
            const completedToday = document.querySelector('.stat-card:nth-child(3) .stat-value');
            
            // Increase today's tests
            todayTests.textContent = parseInt(todayTests.textContent) + 1;
            
            // Increase pending reports
            pendingReports.textContent = parseInt(pendingReports.textContent) + 1;
            
            // Animate the update
            [todayTests, pendingReports].forEach(function(el) {
                el.style.transform = 'scale(1.2)';
                setTimeout(function() {
                    el.style.transform = 'scale(1)';
                }, 300);
            });
        }

        // Auto-suggest for Doctor ID
        document.getElementById('docId').addEventListener('input', function(e) {
            const value = e.target.value;
            if (value.length > 2) {
                // In real app, this would be an API call
                console.log('Searching for doctor with ID:', value);
            }
        });

        // Logout function
        function logout() {
            if (confirm('Are you sure you want to sign out?')) {
                window.location.href = 'http://localhost:3001/';
            }
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // Populate initial patient suggestions
            populatePatientsTable();
            
            // Set current date for new reports
            const now = new Date();
            document.getElementById('testResults').placeholder = 
                'Test conducted on ' + now.toLocaleDateString() + '\\nEnter detailed test results and observations...';
            
            // Show logged in user
            const loggedInUser = document.getElementById('loggedInUser');
            loggedInUser.textContent = 'Technician ID: LAB-2024-8473';
        });
    </script>
</body>
</html>`;

// Create HTTP server
const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/lab-dashboard') {
        res.writeHead(200, { 
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
        });
        res.end(HTML_TEMPLATE);
    } else if (req.url === '/api/send-report' && req.method === 'POST') {
        let body = '';
        req.on('data', function(chunk) {
            body += chunk.toString();
        });
        req.on('end', function() {
            try {
                const data = JSON.parse(body);
                console.log('Lab Report Submission:', {
                    timestamp: new Date().toISOString(),
                    patientId: data.pid,
                    doctorId: data.docId,
                    testType: data.testType,
                    priority: data.priority,
                    sentTo: data.sendTo
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Lab report submitted successfully',
                    reportId: 'REP-' + Date.now(),
                    timestamp: new Date().toISOString()
                }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: 'Invalid request format' 
                }));
            }
        });
    } else if (req.url === '/api/patient-history') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([
            { id: 'P-1001', name: 'John Smith', testType: 'Blood Test', date: '2024-12-15', status: 'completed' },
            { id: 'P-1002', name: 'Emma Johnson', testType: 'X-Ray', date: '2024-12-15', status: 'pending' },
            { id: 'P-1003', name: 'Michael Brown', testType: 'MRI Scan', date: '2024-12-14', status: 'completed' },
            { id: 'P-1004', name: 'Sarah Davis', testType: 'Urine Analysis', date: '2024-12-14', status: 'urgent' }
        ]));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Page Not Found');
    }
});

// Start server
server.listen(PORT, function() {
    console.log('🔬 Lab Technician Dashboard running at:');
    console.log('   🌐 http://localhost:' + PORT + '/lab-dashboard');
    console.log('   📊 Stats: Real-time updates');
    console.log('   📤 Send reports & view patient history');
    console.log('   🚀 Ready for lab operations!');
    console.log('   🔗 Sign Out returns to: http://localhost:3001/');
});