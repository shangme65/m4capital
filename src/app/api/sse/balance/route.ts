import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  registerSseConnection,
  unregisterSseConnection,
} from "@/lib/sse-connections";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  let controller: ReadableStreamDefaultController<Uint8Array>;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
      registerSseConnection(userId, controller);

      // Initial "connected" ping so the client knows the stream is live
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`),
      );
    },
    cancel() {
      unregisterSseConnection(userId, controller);
    },
  });

  // Also clean up if the HTTP request is aborted (tab closed, navigation, etc.)
  req.signal.addEventListener("abort", () => {
    try {
      unregisterSseConnection(userId, controller);
    } catch {
      // ignore
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
