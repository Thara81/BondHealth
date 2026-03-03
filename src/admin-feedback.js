// admin-feedback.js
const { query } = require('./db/config');

async function renderAdminFeedback(userId) {
  try {
    // Get all private feedback
    const result = await query(
      `SELECT 
        f.*,
        p.full_name as patient_name,
        TO_CHAR(f.created_at, 'YYYY-MM-DD HH24:MI') as formatted_date
       FROM feedback f
       LEFT JOIN patients p ON f.patient_id = p.patient_id
       ORDER BY f.created_at DESC`,
      []
    );
    
    const unreadCount = result.rows.filter(f => !f.is_read).length;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Private Feedback - BondHealth Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .transition-all { transition: all 0.2s ease; }
  </style>
</head>
<body class="bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Private Feedback</h1>
        <p class="text-gray-600 mt-1">Messages from users about the website</p>
      </div>
      <div class="flex gap-3">
        <span class="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium">
          ${unreadCount} Unread
        </span>
        <a href="/admin-dashboard" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all">
          ← Back to Dashboard
        </a>
      </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 class="font-semibold text-gray-700">All Feedback Messages</h2>
      </div>
      
      <div class="divide-y divide-gray-200">
        ${result.rows.length === 0 ? `
          <div class="p-12 text-center text-gray-500">
            No feedback messages yet.
          </div>
        ` : result.rows.map(item => `
          <div class="p-6 ${!item.is_read ? 'bg-yellow-50' : ''}" data-id="${item.feedback_id}">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="font-semibold text-gray-900">${item.name || 'Anonymous'}</span>
                  ${item.patient_name ? `
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Patient: ${item.patient_name}
                    </span>
                  ` : ''}
                  ${!item.is_read ? `
                    <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      New
                    </span>
                  ` : ''}
                </div>
                
                <p class="text-gray-700 mb-3">${item.message}</p>
                
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  ${item.email ? `<span>📧 ${item.email}</span>` : ''}
                  <span>📅 ${item.formatted_date}</span>
                  ${item.rating ? `<span>⭐ ${item.rating}/5</span>` : ''}
                </div>
              </div>
              
              <div class="flex gap-2 ml-4">
                ${!item.is_read ? `
                  <button onclick="markAsRead('${item.feedback_id}')" 
                          class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all text-sm font-medium">
                    Mark Read
                  </button>
                ` : ''}
                <button onclick="deleteFeedback('${item.feedback_id}')" 
                        class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-all text-sm font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
  
  <script>
    async function markAsRead(id) {
      try {
        const response = await fetch('/api/admin/feedback/' + id + '/read', {
          method: 'PUT'
        });
        
        if (response.ok) {
          location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to mark as read');
      }
    }
    
    async function deleteFeedback(id) {
      if (!confirm('Delete this feedback message?')) return;
      
      try {
        const response = await fetch('/api/admin/feedback/' + id, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete');
      }
    }
  </script>
</body>
</html>
    `;
  } catch (error) {
    console.error('Error rendering admin feedback:', error);
    return `<h1>Error: ${error.message}</h1>`;
  }
}

module.exports = renderAdminFeedback;