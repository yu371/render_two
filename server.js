// import com.google.gson.Gson;

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(express.static('public'));
let idcounter = 2; 
const socketMap = new Map()
// app.post('/reset-id', (req, res) => {
//   idcounter = 1;
//   console.log('🔄 IDカウンターを1にリセットしました');
//   res.json({ message: 'ID counter reset to 1' });
// });
wss.on('connection', (socket) => {
  console.log("✅ Client connected");
  
  const id = idcounter++;
  socketMap.set(socket, id);
  if(id === 1)
  {
    return;
  }
  // そのクライアントにだけ ID を送信
  socket.send(JSON.stringify({ id }));
  for (const [client, id] of socketMap.entries()) {
        if (id === 1 && client.readyState === WebSocket.OPEN) {
          client.send(id);
        }
      }
  socket.on('message', (msg) => {
    const txt = msg.toString();
    console.log("🎮 Received:", txt);

    if (txt === "start") {
      idcounter = 1;
      return;
    }

    let data;
    try {
      data = JSON.parse(txt);
    } catch (err) {
      console.error("❌ JSON parse error:", err);
      return;
    }

    // const senderId = socketMap.get(socket);
    
    // ish === 1 → 全員に中継（ホスト以外のクライアントにも）
    // if (data.ish === 1) {
    //   for (const client of socketMap.keys()) {
    //     if (client !== socket && client.readyState === WebSocket.OPEN) {
    //       client.send(txt);
    //     }
    //   }
    // }
    // ish === 0 → ホスト（IDが1）にだけ送信
    if (data.ish === 0) {
      for (const [client, id] of socketMap.entries()) {
        if (id === 1 && client.readyState === WebSocket.OPEN) {
          client.send(txt);
        }
      }
    }
  });

  socket.on('close', () => {
    const closedId = socketMap.get(socket);
    console.log(`❌ Client disconnected (id: ${closedId})`);
    socketMap.delete(socket);

    for (const [client, _] of socketMap) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ txt: "disconnect", id: closedId }));
      }
    }
  });
});

app.get("/", (req, res) => {
  res.send("🌐 WebSocket server is running");
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT} http://localhost:8000/`);
});
