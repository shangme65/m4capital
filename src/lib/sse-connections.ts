/**
 * SSE Connection Registry
 *
 * In-memory store for active Server-Sent Events connections.
 * Works correctly in single-process Node.js deployments (Docker / self-hosted).
 */

type SseController = ReadableStreamDefaultController<Uint8Array>;

// userId → set of active SSE controllers
const connections = new Map<string, Set<SseController>>();

export function registerSseConnection(
  userId: string,
  controller: SseController,
) {
  if (!connections.has(userId)) {
    connections.set(userId, new Set());
  }
  connections.get(userId)!.add(controller);
}

export function unregisterSseConnection(
  userId: string,
  controller: SseController,
) {
  const userConns = connections.get(userId);
  if (userConns) {
    userConns.delete(controller);
    if (userConns.size === 0) {
      connections.delete(userId);
    }
  }
}

/**
 * Push a balance update to all open SSE connections for a given user.
 * The event payload is: { traderoomBalance: number }
 */
export function pushTraderoomBalanceUpdate(
  userId: string,
  traderoomBalance: number,
) {
  const userConns = connections.get(userId);
  if (!userConns || userConns.size === 0) return;

  const encoder = new TextEncoder();
  const message = encoder.encode(
    `data: ${JSON.stringify({ traderoomBalance })}\n\n`,
  );

  for (const controller of [...userConns]) {
    try {
      controller.enqueue(message);
    } catch {
      // Stale connection – remove it
      userConns.delete(controller);
    }
  }

  if (userConns.size === 0) {
    connections.delete(userId);
  }
}
