const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/display', (req, res) => {
  res.sendFile(__dirname + '/views/display.html');
});

wss.on('connection', (ws) => {
  clients.push(ws);
  ws.on('message', (msg) => {
    clients.forEach(c => {
      if (c !== ws && c.readyState === WebSocket.OPEN) c.send(msg);
    });
  });
  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});

server.listen(3000, () => console.log('서버 실행중'));
