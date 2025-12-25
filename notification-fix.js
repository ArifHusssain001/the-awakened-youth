// Simple Notification System Fix
// Ensures bell icon works properly

(function() {
    'use strict';
    
    console.log('🔔 Notification Fix Script Loading...');
    
    // Wait for DOM to be ready
    function init() {
        const bell = document.getElementById('notificationsButton');
        const dropdown = document.getElementById('notificationsDropdown');
        const badge = document.getElementById('notificationsBadge');
        
        if (!bell || !dropdown) {
            console.error('❌ Notification elements not found!');
            return;
        }
        
        console.log('✅ Notification elements found');
        
        // Make sure bell is visible
        bell.style.display = 'flex';
        bell.style.cursor = 'pointer';
        
        // Click handler for bell
        bell.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🔔 Bell clicked!');
            
            const isHidden = dropdown.getAttribute('aria-hidden') === 'true';
            dropdown.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
            
            console.log('Dropdown', isHidden ? 'opened' : 'closed');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Load and display notifications
        loadNotifications();
        
        // Update every 5 seconds
        setInterval(loadNotifications, 5000);
        
        console.log('✅ Notification system initialized');
    }
    
    function loadNotifications() {
        const notifications = JSON.parse(localStorage.getItem('aw_notifications') || '[]');
        const unreadIds = JSON.parse(localStorage.getItem('aw_notifications_unread_ids') || '[]');
        const badge = document.getElementById('notificationsBadge');
        const list = document.getElementById('notificationsList');
        
        if (!list) return;
        
        // Update badge
        if (badge) {
            if (unreadIds.length > 0) {
                badge.textContent = unreadIds.length > 99 ? '99+' : unreadIds.length;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
        
        // Update list
        if (notifications.length === 0) {
            list.innerHTML = '<div class="notifications-empty">No notifications yet</div>';
            return;
        }
        
        list.innerHTML = notifications.map(n => {
            // Extract column ID from notification if it's a column-related notification
            const columnMatch = n.body ? n.body.match(/column-id:(\w+)/) : null;
            const columnId = columnMatch ? columnMatch[1] : null;
            
            // Get icon based on notification type
            const icon = getNotificationIcon(n.type || 'info');
            const cleanBody = escapeHtml(n.body || '').replace(/column-id:\w+/g, '').trim();
            
            return `
            <li class="notification-item ${unreadIds.includes(n.id) ? 'unread' : ''}" 
                data-id="${n.id}" 
                data-column-id="${columnId || ''}"
                onclick="handleNotificationClick('${n.id}', '${columnId || ''}', '${n.type || ''}')"
                style="cursor: pointer; transition: all 0.3s ease;">
                <div class="notification-icon-wrapper" style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #7B68EE, #9370DB);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    flex-shrink: 0;
                ">
                    ${icon}
                </div>
                <div style="flex:1; min-width: 0;">
                    <h4 style="
                        margin: 0 0 4px 0;
                        font-size: 0.95rem;
                        font-weight: 600;
                        color: var(--primary);
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    ">${escapeHtml(n.title)}</h4>
                    <p style="
                        margin: 0 0 6px 0;
                        font-size: 0.85rem;
                        color: var(--text);
                        line-height: 1.4;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                    ">${cleanBody}</p>
                    <div style="
                        font-size: 0.75rem;
                        color: var(--muted);
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    ">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                        </svg>
                        ${formatTime(n.createdAt)}
                    </div>
                </div>
                <button class="mark-read-btn" data-id="${n.id}" 
                        onclick="event.stopPropagation(); markAsRead('${n.id}')"
                        style="
                            padding: 6px 12px;
                            border: 1px solid var(--border);
                            background: ${unreadIds.includes(n.id) ? 'var(--accent)' : 'transparent'};
                            color: ${unreadIds.includes(n.id) ? 'white' : 'var(--text)'};
                            border-radius: 6px;
                            font-size: 0.75rem;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            flex-shrink: 0;
                        ">
                    ${unreadIds.includes(n.id) ? '✓ Read' : 'Mark'}
                </button>
            </li>
        `;
        }).join('');
    }
    
    function getNotificationIcon(type) {
        const icons = {
            'column': '📝',
            'publish': '📢',
            'edit': '✏️',
            'delete': '🗑️',
            'comment': '💬',
            'prayer': '🕌',
            'user': '👤',
            'rating': '⭐',
            'info': 'ℹ️'
        };
        return icons[type] || '📋';
    }
    
    function formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    // Handle notification click - open related column
    window.handleNotificationClick = function(notificationId, columnId, type) {
        console.log('📌 Notification clicked:', notificationId, 'Column ID:', columnId, 'Type:', type);
        
        // Mark as read
        const unreadIds = JSON.parse(localStorage.getItem('aw_notifications_unread_ids') || '[]');
        const index = unreadIds.indexOf(notificationId);
        if (index > -1) {
            unreadIds.splice(index, 1);
            localStorage.setItem('aw_notifications_unread_ids', JSON.stringify(unreadIds));
        }
        
        // Close dropdown
        const dropdown = document.getElementById('notificationsDropdown');
        if (dropdown) {
            dropdown.setAttribute('aria-hidden', 'true');
        }
        
        // Navigate based on notification type
        if (type === 'column' || type === 'publish' || type === 'edit') {
            // If we have a column ID, go to that column
            if (columnId && columnId !== 'null' && columnId !== '') {
                window.location.href = `column.html?id=${columnId}`;
            } else {
                // Otherwise go to columns page
                window.location.href = 'columns.html';
            }
        } else if (type === 'comment') {
            // Go to feedback page for comments
            window.location.href = 'feedback.html';
        } else {
            // Default: go to homepage
            window.location.href = 'index.html';
        }
        
        loadNotifications();
    };
    
    // Make markAsRead global
    window.markAsRead = function(id) {
        const unreadIds = JSON.parse(localStorage.getItem('aw_notifications_unread_ids') || '[]');
        const index = unreadIds.indexOf(id);
        
        if (index > -1) {
            unreadIds.splice(index, 1);
        } else {
            unreadIds.push(id);
        }
        
        localStorage.setItem('aw_notifications_unread_ids', JSON.stringify(unreadIds));
        loadNotifications();
    };
    
    // Mark all as read
    const markAllBtn = document.getElementById('markAllReadBtn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', function() {
            localStorage.setItem('aw_notifications_unread_ids', '[]');
            loadNotifications();
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
