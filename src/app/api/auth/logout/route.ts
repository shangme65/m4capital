import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    // Cookie deletion options for production (secure) vs development
    const cookieOptions = {
      path: "/",
      domain: isProduction ? undefined : undefined, // Let NextAuth handle domain automatically
      secure: isProduction,
      sameSite: "lax" as const,
    };

    // Delete all NextAuth cookies with proper options
    if (isProduction) {
      // Production uses __Secure- prefix for HTTPS
      cookieStore.delete({
        name: "__Secure-next-auth.session-token",
        ...cookieOptions,
      });
      cookieStore.delete({
        name: "__Host-next-auth.csrf-token",
        path: "/",
        secure: true,
      });
      cookieStore.delete({
        name: "__Secure-next-auth.callback-url",
        ...cookieOptions,
      });
    } else {
      // Development uses regular prefix for HTTP
      cookieStore.delete({
        name: "next-auth.session-token",
        path: "/",
      });
      cookieStore.delete({
        name: "next-auth.csrf-token",
        path: "/",
      });
      cookieStore.delete({
        name: "next-auth.callback-url",
        path: "/",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
