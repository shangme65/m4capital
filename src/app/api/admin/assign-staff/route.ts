import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ORIGIN ADMIN can assign users to staff admins
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, isOriginAdmin: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN" || !adminUser.isOriginAdmin) {
      return NextResponse.json(
        { error: "Only origin admin can assign users to staff admins" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, staffAdminId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify staff admin exists and has STAFF_ADMIN role
    if (staffAdminId) {
      const staffAdmin = await prisma.user.findUnique({
        where: { id: staffAdminId },
        select: { role: true, email: true, name: true },
      });

      if (!staffAdmin || staffAdmin.role !== "STAFF_ADMIN") {
        return NextResponse.json(
          { error: "Invalid staff admin" },
          { status: 400 }
        );
      }

      // Update user with assigned staff admin
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { assignedStaffId: staffAdminId },
        select: {
          id: true,
          email: true,
          name: true,
          assignedStaffId: true,
        },
      });

      // Send in-app notification to staff admin
      await prisma.notification.create({
        data: {
          id: generateId(),
          userId: staffAdminId,
          type: "INFO",
          title: "New User Assigned",
          message: `User ${
            updatedUser.name || updatedUser.email
          } has been assigned to you for management.`,
          metadata: {
            assignedUserId: updatedUser.id,
            assignedUserEmail: updatedUser.email,
          },
        },
      });

      // Send email notification to staff admin
      // TODO: Integrate with email service
      console.log(`Email notification should be sent to ${staffAdmin.email}`);

      return NextResponse.json({
        success: true,
        message: "User assigned to staff admin successfully",
        user: updatedUser,
      });
    } else {
      // Unassign user from staff admin
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { assignedStaffId: null },
        select: {
          id: true,
          email: true,
          name: true,
          assignedStaffId: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "User unassigned from staff admin",
        user: updatedUser,
      });
    }
  } catch (error) {
    console.error("Error assigning user to staff admin:", error);
    return NextResponse.json(
      { error: "Failed to assign user to staff admin" },
      { status: 500 }
    );
  }
}
