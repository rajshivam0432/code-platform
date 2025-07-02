const http = require("http");
const WebSocket = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils.js"); // ⬅️ DESTRUCTURE the function

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("🟢 Yjs WebSocket Server is running");
});

const wss = new WebSocket.Server({ server });

// wss.on("connection", (conn, req) => {
//   setupWSConnection(conn, req);
// });
wss.on("connection", (conn, req) => {
  console.log("✅ Client connected");
  setupWSConnection(conn, req);
});

const port = 1234;
server.listen(port, () => {
  console.log(`✅ Yjs WebSocket Server running at ws://localhost:${port}`);
});
