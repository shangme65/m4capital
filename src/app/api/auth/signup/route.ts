import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createVerificationToken } from "@/lib/verification";
import { sendEmail } from "@/lib/email";
import { emailTemplate, verificationCodeTemplate } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const { name, email, password, accountType, country } = await req.json();

    if (!name || !email || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const normalizedAccountType =
      accountType && ["INVESTOR", "TRADER"].includes(accountType)
        ? accountType
        : "INVESTOR"; // default

    const normalizedEmail = (email as string).toLowerCase().trim();

    const exist = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (exist) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        accountType: normalizedAccountType,
        country: country || undefined,
        isEmailVerified: false,
        portfolio: {
          create: {},
        },
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "INFO",
        title: "Welcome to M4Capital",
        message:
          "Your account has been successfully created. Start trading now!",
      },
    });

    // Generate and send verification code
    try {
      const verificationCode = await createVerificationToken(normalizedEmail);
      const emailContent = verificationCodeTemplate(name, verificationCode);

      await sendEmail({
        to: normalizedEmail,
        subject: "Verify Your Email - M4 Capital",
        html: emailTemplate(emailContent),
        text: `Your M4 Capital verification code is: ${verificationCode}. This code will expire in 15 minutes.`,
      });
      console.log(`Verification code sent to ${normalizedEmail}`);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Don't fail signup if email fails - user can request resend
    }

    return NextResponse.json({
      success: true,
      message:
        "Account created successfully. Please check your email for the verification code.",
      email: normalizedEmail,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("SIGNUP_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
