/**
 * WebSocket React Hook for Real-Time Trading
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
}

interface TradeExecution {
  tradeId: string;
  symbol: string;
  side: string;
  price: number;
  quantity: number;
  profit?: number;
  timestamp: number;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isAuthenticating: boolean;
  error: string | null;
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
  sendMessage: (message: WebSocketMessage) => void;
  lastPriceUpdate: PriceUpdate | null;
  lastTradeExecution: TradeExecution | null;
  subscribedSymbols: Set<string>;
}

export function useWebSocket(
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;

  const { data: session } = useSession();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const messageQueueRef = useRef<WebSocketMessage[]>([]);

  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<PriceUpdate | null>(
    null
  );
  const [lastTradeExecution, setLastTradeExecution] =
    useState<TradeExecution | null>(null);
  const [subscribedSymbols, setSubscribedSymbols] = useState<Set<string>>(
    new Set()
  );

  const connect = useCallback(() => {
    if (!session?.user?.id) {
      console.log("⏸️ WebSocket: No session, skipping connection");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("✅ WebSocket: Already connected");
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log("🔌 Connecting to WebSocket:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Authenticate
        setIsAuthenticating(true);
        ws.send(
          JSON.stringify({
            type: "authenticate",
            userId: session.user.id,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;

          switch (message.type) {
            case "authenticated":
              console.log("✅ WebSocket authenticated");
              setIsAuthenticating(false);
              setIsConnected(true);

              // Send queued messages
              while (messageQueueRef.current.length > 0) {
                const queuedMessage = messageQueueRef.current.shift();
                if (queuedMessage) {
                  ws.send(JSON.stringify(queuedMessage));
                }
              }
              break;

            case "error":
              console.error("❌ WebSocket error:", message.message);
              setError(message.message || "Unknown error");
              break;

            case "priceUpdate":
              setLastPriceUpdate({
                symbol: message.symbol,
                price: message.price,
                change24h: message.change24h,
                volume24h: message.volume24h,
                timestamp: message.timestamp,
              });
              break;

            case "tradeExecuted":
              setLastTradeExecution({
                tradeId: message.tradeId,
                symbol: message.symbol,
                side: message.side,
                price: message.price,
                quantity: message.quantity,
                profit: message.profit,
                timestamp: message.timestamp,
              });
              break;

            case "pong":
              // Heartbeat response
              break;

            default:
              console.log("📨 WebSocket message:", message.type);
          }
        } catch (err) {
          console.error("❌ Failed to parse WebSocket message:", err);
        }
      };

      ws.onerror = (event) => {
        console.error("❌ WebSocket error event:", event);
        setError("WebSocket connection error");
      };

      ws.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);
        setIsConnected(false);
        setIsAuthenticating(false);
        wsRef.current = null;

        // Attempt reconnect
        if (
          autoConnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          console.log(
            `🔄 Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError("Max reconnect attempts reached");
        }
      };
    } catch (err) {
      console.error("❌ Failed to create WebSocket:", err);
      setError("Failed to establish connection");
    }
  }, [session, autoConnect, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsAuthenticating(false);
  }, []);

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (wsRef.current?.readyState === WebSocket.OPEN && isConnected) {
        wsRef.current.send(JSON.stringify(message));
      } else {
        // Queue message for when connection is established
        messageQueueRef.current.push(message);
      }
    },
    [isConnected]
  );

  const subscribe = useCallback(
    (symbol: string) => {
      setSubscribedSymbols((prev) => new Set(prev).add(symbol));
      sendMessage({ type: "subscribe", symbol });
    },
    [sendMessage]
  );

  const unsubscribe = useCallback(
    (symbol: string) => {
      setSubscribedSymbols((prev) => {
        const next = new Set(prev);
        next.delete(symbol);
        return next;
      });
      sendMessage({ type: "unsubscribe", symbol });
    },
    [sendMessage]
  );

  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (autoConnect && session?.user?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [session?.user?.id, autoConnect, connect, disconnect]);

  // Heartbeat ping
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: "ping" });
    }, 30000); // Every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected, sendMessage]);

  return {
    isConnected,
    isAuthenticating,
    error,
    subscribe,
    unsubscribe,
    sendMessage,
    lastPriceUpdate,
    lastTradeExecution,
    subscribedSymbols,
  };
}
