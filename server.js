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

app.get('/health', (req, res) => {
  res.send('ok');
});

wss.on('connection', (ws, req) => {
  console.log('WebSocket 연결됨:', req.url);
  clients.push(ws);
  
  ws.on('message', (msg) => {
    console.log('메시지 수신:', msg.toString());
    clients.forEach(c => {
      if (c !== ws && c.readyState === WebSocket.OPEN) {
        c.send(msg.toString());
      }
    });
  });
  
  ws.on('close', () => {
    console.log('클라이언트 연결 끊김');
    clients = clients.filter(c => c !== ws);
  });

  ws.on('error', (err) => {
    console.log('WebSocket 에러:', err);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('서버 실행중 포트:' + PORT));
