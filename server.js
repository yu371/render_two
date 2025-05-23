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
let s = null;

wss.on('connection', (socket) => {
  console.log("✅ Client connected");
  
  const id = idcounter++;
  socketMap.set(socket, id);
  console.log(id);
  // そのクライアントにだけ ID を送信
  socket.send(JSON.stringify({ id }));
  for (const [client, id] of socketMap.entries()) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(id);
        }
      }
  socket.on('message', (msg) => {
    const txt = msg.toString();

    if (txt === "start") {
      idcounter = 2;
      console.log("id = 2");
    }
    else
    {
    if(txt === "close"){
      socket.close();
    }

    let data;
    try {
      data = JSON.parse(txt);
    } catch (err) {
      console.error("❌ JSON parse error:", err);
      return;
    }

    // const senderId = socketMap.get(socket);
    if (data.ish === 1) {
      s = socket;
    }
    if (data.ish === 0) {
      if(s !== null)
      {
        console.log("hs:",txt);
        s.send(txt);
      }
      // for (const [client, id] of socketMap.entries()) {
      //   console.log(id);
      //   if (client.readyState === WebSocket.OPEN) {
      //     if(id === 1)
      //     {
      //     console.log("hostsend",txt)
      //     s.send(txt);
      //     }
      //   }
      // }
    }
  }
  });

  socket.on('close', () => {
    const closedId = socketMap.get(socket);
    console.log(`❌ Client disconnected (id: ${closedId})`);

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
  console.log(` ${PORT} or http://localhost:8000/`);
});
