// Simple notifications stub server
// Run: npm install express ws cors && node notifications_stub.js

const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

let notifications = [
  { id: 'n1', title: 'Welcome!', body: 'Thanks for trying notifications.', createdAt: new Date().toISOString(), read: false },
  { id: 'n2', title: 'New comment', body: 'Someone commented on your latest column.', createdAt: new Date().toISOString(), read: false }
];

app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.post('/api/notifications/mark-read', (req, res) => {
  const ids = req.body.ids || [];
  notifications = notifications.map(n => ids.includes(n.id) ? { ...n, read: true } : n);
  res.json({ ok: true });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws/notifications' });

wss.on('connection', (ws) => {
  console.log('WS client connected');
  ws.send(JSON.stringify({ type: 'welcome', payload: { message: 'Connected to notifications stub' } }));
});

// Broadcast a new notification every 60s for demo
setInterval(() => {
  const id = 'n' + Math.floor(Math.random()*100000);
  const note = { id, title: 'Demo Notification', body: 'This is a demo notification.', createdAt: new Date().toISOString(), read: false };
  notifications.unshift(note);
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify({ type: 'notification', payload: note }));
    }
  });
  console.log('Broadcasted demo notification', id);
}, 60000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Notifications stub running on http://localhost:${PORT}`);
  console.log('GET /api/notifications  POST /api/notifications/mark-read  WS /ws/notifications');
});
