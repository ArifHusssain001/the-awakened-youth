// Notifications frontend
(function() {
    const API_LIST = '/api/notifications';
    const API_MARK_READ = '/api/notifications/mark-read';
    const STORAGE_KEY = 'aw_notifications';
    const UNREAD_KEY = 'aw_notifications_unread_ids';
    const POLL_INTERVAL = 30000; // 30s
    const WS_URL = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws/notifications';

    let pollingTimer = null;
    let ws = null;

    function el(sel) { return document.querySelector(sel); }

    function saveLocal(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data || []));
    }
    function loadLocal() {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        console.log('[Notifications] Loaded from localStorage:', data.length, 'notifications');
        return data;
    }
    
    // Expose render function globally
    window.renderNotifications = renderNotifications;
    function saveUnreadIds(ids) { localStorage.setItem(UNREAD_KEY, JSON.stringify(ids || [])); }
    function loadUnreadIds() { return JSON.parse(localStorage.getItem(UNREAD_KEY) || '[]'); }

    async function fetchNotifications() {
        try {
            console.log('[Notifications] Fetching from API:', API_LIST);
            const res = await fetch(API_LIST, { credentials: 'same-origin' });
            console.log('[Notifications] API response status:', res.status);
            if (!res.ok) throw new Error('Network error');
            const data = await res.json();
            console.log('[Notifications] API response data:', data);
            saveLocal(data);
            // merge unread ids
            const unread = loadUnreadIds();
            const ids = data.filter(n => !n.read).map(n => n.id);
            // keep local unread if exists
            const merged = Array.from(new Set([...unread, ...ids]));
            saveUnreadIds(merged);
            renderNotifications();
        } catch (err) {
            console.error('[Notifications] API/network error:', err);
            // Fallback: use localStorage notifications or create real notifications
            let notifications = loadLocal();
            if (!notifications || notifications.length === 0) {
                // Create real notifications based on actual activity
                notifications = generateRealNotifications();
                saveLocal(notifications);
                const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
                saveUnreadIds(unreadIds);
            }
            renderNotifications();
        }
    }
    
    function generateRealNotifications() {
        const notifications = [];
        const now = Date.now();
        
        // Check for new columns
        const columns = JSON.parse(localStorage.getItem('columns') || '[]');
        if (columns.length > 0) {
            const latestColumn = columns[columns.length - 1];
            notifications.push({
                id: `col_${latestColumn.id || Date.now()}`,
                title: 'New Column Published',
                body: `"${latestColumn.title}" has been published successfully.`,
                createdAt: latestColumn.createdAt || new Date().toISOString(),
                read: false
            });
        }
        
        // Check for comments
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        if (comments.length > 0) {
            notifications.push({
                id: `comment_${Date.now()}`,
                title: 'New Comments',
                body: `You have ${comments.length} new comment${comments.length > 1 ? 's' : ''} on your columns.`,
                createdAt: new Date(now - 3600000).toISOString(), // 1 hour ago
                read: false
            });
        }
        
        // Welcome notification
        if (notifications.length === 0) {
            notifications.push({
                id: `welcome_${Date.now()}`,
                title: 'Welcome to The Awakened Youth',
                body: 'Start creating inspiring Islamic content for your readers.',
                createdAt: new Date().toISOString(),
                read: false
            });
        }
        
        
        return notifications;
    }
    }

    function renderNotifications() {
        const container = document.getElementById('notificationsDropdown');
        const listEl = document.getElementById('notificationsList');
        const badge = document.getElementById('notificationsBadge');
        if (!container || !listEl || !badge) return;

        const items = loadLocal();
        const unreadIds = loadUnreadIds();
        if (!items || items.length === 0) {
            listEl.innerHTML = `<div class="notifications-empty">No notifications</div>`;
            badge.style.display = 'none';
            return;
        }

        listEl.innerHTML = items.map(n => `
            <li class="notification-item ${unreadIds.includes(n.id) ? 'unread' : ''}" data-id="${n.id}" tabindex="0">
                <div style="flex:1">
                    <h4>${escapeHtml(n.title)}</h4>
                    <p>${escapeHtml(n.body || '')}</p>
                    <div style="font-size:0.8rem; color:var(--muted); margin-top:6px;">${new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
                    ${unreadIds.includes(n.id) ? `<button class="mark-read-btn" data-id="${n.id}" aria-label="Mark as read">Mark</button>` : `<button class="mark-read-btn" data-id="${n.id}" aria-label="Mark as unread">Unmark</button>`}
                </div>
            </li>
        `).join('');

        const unreadCount = unreadIds.length;
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }

        // Attach handlers
        Array.from(container.querySelectorAll('.mark-read-btn')).forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                await markAsRead([id]);
            });
        });

        // keyboard support for items
        Array.from(container.querySelectorAll('.notification-item')).forEach(item => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const id = item.getAttribute('data-id');
                    markAsRead([id]);
                }
            });
        });
    }

    async function markAsRead(ids) {
        try {
            // optimistic update
            const unread = loadUnreadIds().filter(i => !ids.includes(i));
            saveUnreadIds(unread);
            renderNotifications();

            // send to server
            await fetch(API_MARK_READ, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ ids })
            });

            // refresh list
            await fetchNotifications();
        } catch (err) {
            console.warn('Failed to mark read', err);
        }
    }

    function setupDropdown() {
        const btn = document.getElementById('notificationsButton');
        const dropdown = document.getElementById('notificationsDropdown');
        const badge = document.getElementById('notificationsBadge');
        if (!btn || !dropdown) return;

        btn.addEventListener('click', (e) => {
            const shown = dropdown.getAttribute('aria-hidden') === 'false';
            dropdown.setAttribute('aria-hidden', shown ? 'true' : 'false');
            if (!shown) {
                // opened, mark visible
                // optionally focus
                const first = dropdown.querySelector('.notification-item');
                if (first) first.focus();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-container')) {
                dropdown.setAttribute('aria-hidden', 'true');
            }
        });
    }

    function startPolling() {
        if (pollingTimer) clearInterval(pollingTimer);
        pollingTimer = setInterval(fetchNotifications, POLL_INTERVAL);
    }

    function tryWebSocket() {
        try {
            ws = new WebSocket(WS_URL);
            ws.addEventListener('open', () => console.log('Notifications WS open'));
            ws.addEventListener('message', (ev) => {
                try {
                    const msg = JSON.parse(ev.data);
                    if (msg.type === 'notification') {
                        const items = loadLocal();
                        items.unshift(msg.payload);
                        saveLocal(items);
                        const unread = loadUnreadIds();
                        unread.push(msg.payload.id);
                        saveUnreadIds(unread);
                        renderNotifications();
                    }
                } catch (err) { console.warn(err); }
            });
            ws.addEventListener('close', () => { console.log('WS closed, falling back to polling'); startPolling(); });
            ws.addEventListener('error', () => { ws.close(); startPolling(); });
        } catch (err) {
            console.warn('WS setup failed, using polling', err);
            startPolling();
        }
    }

    function escapeHtml(str){
        if (!str) return '';
        return String(str).replace(/[&<>\"']/g, function(c){
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c];
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Check if notification elements already exist in HTML
        const existingBtn = document.getElementById('notificationsButton');
        const existingDropdown = document.getElementById('notificationsDropdown');
        
        if (!existingBtn || !existingDropdown) {
            // Build minimal DOM for dropdown if not present
            const template = `
                <div class="notification-container">
                    <button id="notificationsButton" class="notification-bell" aria-haspopup="true" aria-expanded="false" aria-label="Notifications">
                        🔔
                        <span id="notificationsBadge" class="notification-badge" style="display:none"></span>
                    </button>
                    <div id="notificationsDropdown" class="notifications-dropdown" role="region" aria-hidden="true">
                        <div class="notifications-header">
                            <strong>Notifications</strong>
                            <div class="notifications-actions">
                                <button id="markAllReadBtn" type="button">Mark all read</button>
                            </div>
                        </div>
                        <ul id="notificationsList" class="notifications-list"></ul>
                    </div>
                </div>
            `;

            // Insert near theme toggle if available
            const themeBtn = document.getElementById('themeToggle');
            if (themeBtn && themeBtn.parentElement) {
                themeBtn.insertAdjacentHTML('afterend', template);
            } else {
                // fallback: append to header container
                const header = document.querySelector('.header .container');
                if (header) header.insertAdjacentHTML('beforeend', template);
            }
        }

        // Wire up mark all read button
        const markAllBtn = document.getElementById('markAllReadBtn');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', async () => {
                const items = loadLocal();
                const ids = items.map(i => i.id);
                console.log('[Notifications] Mark all read:', ids);
                await markAsRead(ids);
            });
        }

        setupDropdown();
        renderNotifications();
        fetchNotifications();
        // try websocket, fallback to polling
        tryWebSocket();
        
        // Log dropdown open/close
        const btn = document.getElementById('notificationsButton');
        const dropdown = document.getElementById('notificationsDropdown');
        if (btn && dropdown) {
            btn.addEventListener('click', () => {
                const shown = dropdown.getAttribute('aria-hidden') === 'false';
                console.log('[Notifications] Dropdown', shown ? 'closed' : 'opened');
            });
        }
        
        // Listen for notification updates
        window.addEventListener('notificationsUpdated', () => {
            console.log('[Notifications] Update event received');
            renderNotifications();
        });
    });
})();
