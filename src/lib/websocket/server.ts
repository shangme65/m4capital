import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";

// Types for WebSocket messages
export interface WSMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

export interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
  subscribedSymbols?: Set<string>;
}

// WebSocket server instance
let wss: WebSocketServer | null = null;

// Store active connections
const clients = new Set<AuthenticatedWebSocket>();

/**
 * Initialize WebSocket server
 */
export function initWebSocketServer(server: any) {
  if (wss) {
    console.log("⚠️ WebSocket server already initialized");
    return wss;
  }

  wss = new WebSocketServer({ server, path: "/ws" });

  console.log("🚀 WebSocket server initialized on /ws");

  // Handle new connections
  wss.on("connection", (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
    console.log("🔌 New WebSocket connection");

    ws.isAlive = true;
    ws.subscribedSymbols = new Set();
    clients.add(ws);

    // Send welcome message
    sendMessage(ws, {
      type: "connected",
      data: { message: "Connected to M4Capital WebSocket" },
      timestamp: Date.now(),
    });

    // Handle incoming messages
    ws.on("message", (message: string) => {
      try {
        const data: WSMessage = JSON.parse(message.toString());
        handleMessage(ws, data);
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
        sendMessage(ws, {
          type: "error",
          data: { message: "Invalid message format" },
          timestamp: Date.now(),
        });
      }
    });

    // Handle pong messages for heartbeat
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    // Handle disconnection
    ws.on("close", () => {
      console.log("🔌 Client disconnected");
      clients.delete(ws);
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
      clients.delete(ws);
    });
  });

  // Heartbeat mechanism to detect dead connections
  const heartbeatInterval = setInterval(() => {
    clients.forEach((ws) => {
      if (ws.isAlive === false) {
        console.log("💀 Terminating dead connection");
        clients.delete(ws);
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // Every 30 seconds

  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  return wss;
}

/**
 * Handle incoming WebSocket messages
 */
function handleMessage(ws: AuthenticatedWebSocket, message: WSMessage) {
  console.log("📨 Received message:", message.type);

  switch (message.type) {
    case "authenticate":
      handleAuthentication(ws, message.data);
      break;

    case "subscribe":
      handleSubscribe(ws, message.data);
      break;

    case "unsubscribe":
      handleUnsubscribe(ws, message.data);
      break;

    case "ping":
      sendMessage(ws, { type: "pong", timestamp: Date.now() });
      break;

    case "trade":
      handleTradeMessage(ws, message.data);
      break;

    default:
      sendMessage(ws, {
        type: "error",
        data: { message: `Unknown message type: ${message.type}` },
        timestamp: Date.now(),
      });
  }
}

/**
 * Handle user authentication
 */
function handleAuthentication(ws: AuthenticatedWebSocket, data: any) {
  // Verify token/session here
  // For now, simple implementation
  if (data?.userId) {
    ws.userId = data.userId;
    sendMessage(ws, {
      type: "authenticated",
      data: { userId: data.userId },
      timestamp: Date.now(),
    });
    console.log(`✅ User authenticated: ${data.userId}`);
  } else {
    sendMessage(ws, {
      type: "error",
      data: { message: "Authentication failed" },
      timestamp: Date.now(),
    });
  }
}

/**
 * Handle symbol subscription
 */
function handleSubscribe(ws: AuthenticatedWebSocket, data: any) {
  const { symbols } = data;

  if (Array.isArray(symbols)) {
    symbols.forEach((symbol) => ws.subscribedSymbols?.add(symbol));
    sendMessage(ws, {
      type: "subscribed",
      data: { symbols },
      timestamp: Date.now(),
    });
    console.log(`📊 Subscribed to symbols:`, symbols);
  }
}

/**
 * Handle symbol unsubscription
 */
function handleUnsubscribe(ws: AuthenticatedWebSocket, data: any) {
  const { symbols } = data;

  if (Array.isArray(symbols)) {
    symbols.forEach((symbol) => ws.subscribedSymbols?.delete(symbol));
    sendMessage(ws, {
      type: "unsubscribed",
      data: { symbols },
      timestamp: Date.now(),
    });
    console.log(`📊 Unsubscribed from symbols:`, symbols);
  }
}

/**
 * Handle trade execution messages
 */
function handleTradeMessage(ws: AuthenticatedWebSocket, data: any) {
  if (!ws.userId) {
    sendMessage(ws, {
      type: "error",
      data: { message: "Authentication required for trading" },
      timestamp: Date.now(),
    });
    return;
  }

  // Process trade (integrate with your trading logic)
  console.log("💰 Trade message received:", data);

  sendMessage(ws, {
    type: "trade_ack",
    data: { tradeId: Date.now(), status: "received" },
    timestamp: Date.now(),
  });
}

/**
 * Send message to a specific client
 */
export function sendMessage(ws: WebSocket, message: WSMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * Broadcast message to all clients
 */
export function broadcast(
  message: WSMessage,
  filter?: (ws: AuthenticatedWebSocket) => boolean
) {
  clients.forEach((ws) => {
    if (filter && !filter(ws)) return;
    sendMessage(ws, message);
  });
}

/**
 * Broadcast price update to subscribed clients
 */
export function broadcastPriceUpdate(symbol: string, priceData: any) {
  broadcast(
    {
      type: "price_update",
      data: { symbol, ...priceData },
      timestamp: Date.now(),
    },
    (ws) => ws.subscribedSymbols?.has(symbol) || false
  );
}

/**
 * Broadcast trade execution to user
 */
export function broadcastTradeExecution(userId: string, tradeData: any) {
  broadcast(
    {
      type: "trade_executed",
      data: tradeData,
      timestamp: Date.now(),
    },
    (ws) => ws.userId === userId
  );
}

/**
 * Get server instance
 */
export function getWebSocketServer() {
  return wss;
}

/**
 * Get connected clients count
 */
export function getConnectedClients() {
  return clients.size;
}
