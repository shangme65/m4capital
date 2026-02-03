import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCode } from "@/lib/verification";
import { sendEmail } from "@/lib/email";
import { emailTemplate, welcomeEmailTemplate } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Email and code are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { success: false, error: "Email already verified" },
        { status: 400 }
      );
    }

    // Verify the code
    const verification = await verifyCode(normalizedEmail, code);

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 400 }
      );
    }

    // Mark user as verified
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        isEmailVerified: true,
        emailVerified: new Date(),
      },
    });

    // Send welcome email
    try {
      const emailContent = welcomeEmailTemplate(user.name || "User");
      await sendEmail({
        to: normalizedEmail,
        subject: "Welcome to M4 Capital!",
        html: emailContent,
        text: `Welcome to M4 Capital! Your email has been successfully verified.`,
      });
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't fail verification if welcome email fails
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now sign in.",
    });
  } catch (error) {
    console.error("VERIFY_CODE_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
