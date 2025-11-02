import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Force dynamic for API routes that use headers
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      userId,
      amount,
      paymentMethod,
      paymentDetails,
      adminNote,
      processedBy,
    } = await req.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid user ID or amount" },
        { status: 400 }
      );
    }

    // Find user with portfolio
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { portfolio: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create portfolio if it doesn't exist
    let portfolio;
    if (!user.portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: userId,
          balance: amount,
        },
      });
    } else {
      // Update portfolio balance
      portfolio = await prisma.portfolio.update({
        where: { userId: userId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });
    }

    // Create deposit transaction record
    const deposit = await prisma.deposit.create({
      data: {
        portfolioId: portfolio.id,
        amount: amount,
        currency: "USD",
        status: "COMPLETED",
        type: paymentMethod || "ADMIN_TOPUP",
        transactionId: `ADMIN-${Date.now()}`,
        metadata: {
          paymentDetails: paymentDetails || {},
          adminNote: adminNote || `Manual top-up by ${processedBy}`,
          processedBy: processedBy || session.user.email,
          processedAt: new Date().toISOString(),
        },
      },
    });

    // Send email notification to user
    if (user.email && user.isEmailVerified) {
      try {
        await sendEmail({
          to: user.email,
          subject: "Account Balance Updated",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Account Balance Updated</h2>
              <p>Hello ${user.name || "User"},</p>
              <p>Your account balance has been updated by an administrator.</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Amount Added:</strong> $${amount.toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>New Balance:</strong> $${portfolio.balance.toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${
                  paymentMethod || "Manual"
                }</p>
                <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${
                  deposit.transactionId
                }</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              ${adminNote ? `<p><strong>Note:</strong> ${adminNote}</p>` : ""}
              <p>If you have any questions, please contact our support team.</p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Continue even if email fails
      }
    }

    // Get updated user with portfolio
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { portfolio: true },
    });

    return NextResponse.json({
      message: "Balance updated successfully",
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        balance: updatedUser!.portfolio?.balance || 0,
      },
      transaction: {
        id: deposit.id,
        amount: deposit.amount,
        transactionId: deposit.transactionId,
        status: deposit.status,
        createdAt: deposit.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
