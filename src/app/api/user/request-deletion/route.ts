import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reason } = await req.json();

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "Deletion reason is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create a notification for admin
    await prisma.notification.create({
      data: {
        id: `del-req-${user.id}-${Date.now()}`,
        userId: user.id,
        type: "WARNING",
        title: "Account Deletion Request",
        message: `User ${user.name || user.email} has requested account deletion. Reason: ${reason}`,
        amount: 0,
        asset: "ADMIN_NOTIFICATION",
      },
    });

    // Send email to support (you'll need to implement email service)
    // For now, we'll just create a notification
    // TODO: Implement email sending to support email

    // You can also store the deletion request in a separate table if needed
    // For now, we're using notifications

    return NextResponse.json(
      {
        message:
          "Account deletion request submitted successfully. Our team will review your request.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting deletion request:", error);
    return NextResponse.json(
      { error: "Failed to submit deletion request" },
      { status: 500 }
    );
  }
}
