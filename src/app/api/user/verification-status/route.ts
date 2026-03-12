import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ isVerified: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isVerified: true, role: true },
    });

    // Admin and Staff Admin accounts are always considered verified
    const isAdmin = user?.role === "ADMIN" || user?.role === "STAFF_ADMIN";

    return NextResponse.json({ 
      isVerified: isAdmin || user?.isVerified || false 
    });
  } catch (error) {
    console.error("Error fetching verification status:", error);
    return NextResponse.json({ isVerified: false }, { status: 500 });
  }
}
