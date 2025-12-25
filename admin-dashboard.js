// Admin Dashboard - Real-Time Data Management
// Updates stats with actual current data from localStorage

// ============================================
// INITIALIZE DASHBOARD
// ============================================
function initAdminDashboard() {
    updateDashboardStats();
    updateActivityFeed();
    
    // Update stats every 30 seconds
    setInterval(updateDashboardStats, 30000);
}

// ============================================
// UPDATE DASHBOARD STATISTICS
// ============================================
function updateDashboardStats() {
    // Get real data from localStorage
    const columns = JSON.parse(localStorage.getItem('columns') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const views = JSON.parse(localStorage.getItem('totalViews') || '0');
    
    // Calculate stats
    const totalColumns = columns.length;
    const publishedColumns = columns.filter(c => c.status === 'published').length;
    const draftColumns = columns.filter(c => c.status === 'draft').length;
    const totalUsers = users.length;
    const totalComments = comments.length;
    const totalViews = parseInt(views);
    
    // Update UI with animation
    animateCounter('totalViews', totalViews);
    animateCounter('totalPosts', totalColumns);
    animateCounter('totalUsers', totalUsers);
    animateCounter('totalComments', totalComments);
    
    // Update detailed stats
    document.getElementById('totalColumns').textContent = totalColumns;
    document.getElementById('publishedCount').textContent = publishedColumns;
    document.getElementById('draftCount').textContent = draftColumns;
    
    // Update pending submissions
    const pendingSubmissions = columns.filter(c => c.status === 'pending').length;
    document.getElementById('pendingSubmissionsCount').textContent = `${pendingSubmissions} Pending`;
}

// ============================================
// ANIMATE COUNTER
// ============================================
function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const increment = Math.ceil((targetValue - currentValue) / 20);
    
    if (currentValue === targetValue) return;
    
    let current = currentValue;
    const timer = setInterval(() => {
        current += increment;
        
        if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
            current = targetValue;
            clearInterval(timer);
        }
        
        element.textContent = current.toLocaleString();
    }, 50);
}

// ============================================
// UPDATE ACTIVITY FEED
// ============================================
function updateActivityFeed() {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const activityFeed = document.querySelector('.activity-feed');
    
    if (!activityFeed || activities.length === 0) {
        // Show default activities if no data
        return;
    }
    
    // Clear existing activities except header
    const header = activityFeed.querySelector('h3');
    activityFeed.innerHTML = '';
    activityFeed.appendChild(header);
    
    // Show last 5 activities
    activities.slice(-5).reverse().forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">${getActivityIcon(activity.type)}</div>
            <div class="activity-content">
                <strong>${activity.message}</strong>
                <div class="activity-time">${getTimeAgo(activity.timestamp)}</div>
            </div>
        `;
        activityFeed.appendChild(activityItem);
    });
}

// ============================================
// GET ACTIVITY ICON
// ============================================
function getActivityIcon(type) {
    const icons = {
        'column': '✍️',
        'user': '👤',
        'comment': '💬',
        'rating': '⭐',
        'edit': '✏️',
        'delete': '🗑️',
        'publish': '📢'
    };
    return icons[type] || '📋';
}

// ============================================
// GET TIME AGO
// ============================================
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// ============================================
// LOG ACTIVITY
// ============================================
function logActivity(type, message) {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    
    activities.push({
        type: type,
        message: message,
        timestamp: Date.now()
    });
    
    // Keep only last 50 activities
    if (activities.length > 50) {
        activities.shift();
    }
    
    localStorage.setItem('activities', JSON.stringify(activities));
    updateActivityFeed();
}

// ============================================
// TRACK PAGE VIEW
// ============================================
function trackPageView() {
    const views = parseInt(localStorage.getItem('totalViews') || '0');
    localStorage.setItem('totalViews', views + 1);
}

// ============================================
// INITIALIZE ON LOAD
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Check if on admin page
    if (document.getElementById('adminDashboard')) {
        initAdminDashboard();
    }
    
    // Track page view on all pages
    trackPageView();
});

// ============================================
// EXPORT FUNCTIONS FOR USE IN OTHER SCRIPTS
// ============================================
window.adminDashboard = {
    updateStats: updateDashboardStats,
    logActivity: logActivity,
    trackView: trackPageView
};
