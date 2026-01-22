import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Allow both ADMIN and STAFF_ADMIN to access admin routes
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF_ADMIN") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
