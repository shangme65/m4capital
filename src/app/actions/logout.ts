"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  // Delete all NextAuth cookies
  const cookieStore = cookies();

  // Delete session token cookie
  cookieStore.delete("next-auth.session-token");
  cookieStore.delete("__Secure-next-auth.session-token");

  // Delete CSRF token cookie
  cookieStore.delete("next-auth.csrf-token");
  cookieStore.delete("__Host-next-auth.csrf-token");

  // Delete callback URL cookie
  cookieStore.delete("next-auth.callback-url");
  cookieStore.delete("__Secure-next-auth.callback-url");

  // Redirect to homepage
  redirect("/");
}
