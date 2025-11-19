import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/notifications/send-email
 * Send email notification for crypto purchases
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, message, amount, asset } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has email notifications enabled
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        name: true,
        emailNotifications: true,
      },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Check if email notifications are enabled
    const emailNotificationsEnabled = user.emailNotifications ?? true;

    if (!emailNotificationsEnabled) {
      return NextResponse.json({
        success: true,
        message: "Email notifications disabled for this user",
      });
    }

    // Store email notification in database
    const notification = await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.user.id,
        type: "TRANSACTION" as any,
        title,
        message,
        amount: amount ? parseFloat(amount.toString()) : null,
        asset: asset || null,
        read: false,
      },
    });

    // Format email content
    const emailSubject = title;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${title}</h2>
        <p>${message}</p>
        ${
          amount && asset
            ? `<p><strong>Amount:</strong> ${amount.toFixed(
                2
              )} USD (${asset})</p>`
            : ""
        }
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          This is an automated notification from M4Capital. 
          You can manage notification preferences in your account settings.
        </p>
      </div>
    `;

    // Send actual email using Nodemailer
    const { sendEmail } = await import("@/lib/email");
    const emailResult = await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailBody,
      text: message,
    });

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      // Don't fail the request if email fails, just log it
    } else {
      console.log("Email notification sent successfully to:", user.email);
    }

    return NextResponse.json({
      success: true,
      message: "Email notification sent successfully",
      notification,
    });
  } catch (error) {
    console.error("Error sending email notification:", error);
    return NextResponse.json(
      { error: "Failed to send email notification" },
      { status: 500 }
    );
  }
}
