import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Delete all NextAuth cookies
    cookieStore.delete("next-auth.session-token");
    cookieStore.delete("__Secure-next-auth.session-token");
    cookieStore.delete("next-auth.csrf-token");
    cookieStore.delete("__Host-next-auth.csrf-token");
    cookieStore.delete("next-auth.callback-url");
    cookieStore.delete("__Secure-next-auth.callback-url");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
