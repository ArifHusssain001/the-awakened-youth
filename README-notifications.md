Notifications Feature - README

Overview
- Adds a notification bell in the header that shows unread count and a dropdown of recent notifications.
- Frontend fetches from `/api/notifications` and marks read via `POST /api/notifications/mark-read`.
- Supports realtime via WebSocket at `/ws/notifications`, with a polling fallback every 30s.
- Notifications are stored locally in `localStorage` for offline persistence and performance.

Files added/modified
- `styles.css` - notification styles
- `js/notifications.js` - frontend logic for fetching, rendering, mark-as-read, WS/polling
- HTML pages - include `js/notifications.js` (deferred); theme toggle was preserved
- `server_stub/notifications_stub.js` - optional Node.js stub server for local testing

Quick start (frontend)
1. Start your existing static server (you already run `python -m http.server 8000`).
2. Open the site: http://127.0.0.1:8000
3. The notifications bell appears in the header (near theme toggle). Click it to open the list.

Quick start (backend stub for local testing)
1. Ensure Node.js (>=14) is installed.
2. From project root, install dependencies and run:

```powershell
cd "e:\vs new wek\the aw\server_stub"
npm init -y
npm install express ws cors
node notifications_stub.js
```

3. The stub listens on port 3000 by default. The frontend running on `http://127.0.0.1:8000` will fetch notifications from `http://127.0.0.1:3000/api/notifications` only if you run the stub and configure CORS/proxy. If you use the stub on same host but different port, the browser will allow cross-origin if CORS enabled in stub (it is).

Development notes
- The frontend attempts a WebSocket connection to `ws://<host>/ws/notifications`. If your static server is separate, run the stub on the same host/port (or update `js/notifications.js` API URLs to point to the stub host:port).
- The frontend stores notifications in `localStorage` keys: `aw_notifications` and `aw_notifications_unread_ids`.

Security note
- This is a demo client-only implementation. In production, notifications and mark-read endpoints should authenticate requests (cookies/JWT) and validate input.

Files created/changed summary
- `js/notifications.js` (new)
- `styles.css` (modified)
- Several HTML pages updated to include the script and the theme toggle area (bell inserted dynamically)
- `server_stub/notifications_stub.js` (new)

Footer integration
- `partials/footer.html` (new) — HTML fragment you can copy into any page just above `</body>`.
- `js/footer.js` (new) — small JS injector that appends the footer when loaded. To add the footer site-wide, include this script near your other `defer` scripts:

```html
<script defer src="js/footer.js"></script>
```

Or copy the contents of `partials/footer.html` into each page where you want the footer.

If you want me to insert the script tag into every HTML file in the project, tell me and I'll apply that change.

Contact
- If you want I can wire the frontend to a different API base URL, add authentication, or improve the UI/UX further.
