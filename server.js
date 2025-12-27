const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('VoiceChat Server OK');
});

const wss = new WebSocket.Server({ server });
const users = new Map();

wss.on('connection', (ws) => {
  let oderId = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      
      if (msg.type === 'register' && msg.userId) {
        oderId = msg.userId visita;
        users.set(oderId, ws);
        ws.send(JSON.stringify({ type: 'registered', oderId }));
        broadcast({ type: 'user-status', oderId, status: 'online' }, oderId);
      }
      
      if (msg.type === 'check-status') {
        const statuses = {};
        (msg.userIds || []).forEach(id => statuses[id] = users.has(id) ? 'online' : 'offline');
        ws.send(JSON.stringify({ type: 'status-update', statuses }));
      }
      
      if (msg.to && users.has(msg.to)) {
        users.get(msg.to).send(JSON.stringify(msg));
      }
    } catch (e) {
      console.error('Error:', e);
    }
  });

  ws.on('close', () => {
    if (oderId) {
      users.delete(oderId);
      broadcast({ type: 'user-status', userId: oderId, status: 'offline' }, oderId);
    }
  });
});

function broadcast(msg, exclude) {
  const data = JSON.stringify(msg);
  users.forEach((ws, id) => { if (id !== exclude) ws.send(data); });
}

server.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port', process.env.PORT || 3000);
});
