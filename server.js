const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/display', (req, res) => {
  res.sendFile(__dirname + '/views/display.html');
});

wss.on('connection', (ws) => {
  let roomCode = null;

  ws.on('message', (msg) => {
    const data = JSON.parse(msg.toString());

    if (data.type === 'join') {
      roomCode = data.code;
      if (!rooms[roomCode]) rooms[roomCode] = [];
      rooms[roomCode].push(ws);
      console.log('방 참가:', roomCode, '인원:', rooms[roomCode].length);
      return;
    }

    if (data.type === 'speech' && roomCode && rooms[roomCode]) {
      rooms[roomCode].forEach(c => {
        if (c !== ws && c.readyState === WebSocket.OPEN) {
          c.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on('close', () => {
    if (roomCode && rooms[roomCode]) {
      rooms[roomCode] = rooms[roomCode].filter(c => c !== ws);
      if (rooms[roomCode].length === 0) delete rooms[roomCode];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('서버 실행중 포트:' + PORT));
