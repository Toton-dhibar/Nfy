export default async (req, context) => {
  const upgradeHeader = req.headers.get("Upgrade");
  
  if (upgradeHeader !== "Websocket") {
    return new Response("Expected WebSocket upgrade", { 
      status: 426,
      headers: {
        "Upgrade": "Websocket"
      }
    });
  }

  // Backend WebSocket URL
  const backendUrl = "wss://zz.sdbuild.me/wsvm";
  
  // Create WebSocket connection to backend
  const [client, server] = Object.values(new WebSocketPair());
  
  server.accept();
  
  const backendSocket = new WebSocket(backendUrl);
  
  // Forward messages from client to backend
  server.addEventListener("message", (event) => {
    if (backendSocket.readyState === WebSocket.READY_STATE_OPEN) {
      backendSocket.send(event.data);
    }
  });
  
  // Forward messages from backend to client
  backendSocket.addEventListener("message", (event) => {
    if (server.readyState === WebSocket.READY_STATE_OPEN) {
      server.send(event.data);
    }
  });
  
  // Handle connection close
  backendSocket.addEventListener("close", () => {
    server.close();
  });
  
  server.addEventListener("close", () => {
    backendSocket.close();
  });
  
  return new Response(null, {
    status: 101,
    webSocket: client,
  });
};

export const config = {
  path: "/ray"
};
