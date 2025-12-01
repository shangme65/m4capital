import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/push/vapid-public-key
 * Return the VAPID public key for push notifications
 */
export async function GET() {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

  if (!vapidPublicKey) {
    console.error("VAPID_PUBLIC_KEY not configured");
    return NextResponse.json(
      { error: "Push notifications not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    publicKey: vapidPublicKey,
  });
}
