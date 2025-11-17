import { generateId } from "@/lib/generate-id";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createVerificationToken } from "@/lib/verification";
import { sendEmail } from "@/lib/email";
import { emailTemplate, verificationCodeTemplate } from "@/lib/email-templates";
import { COUNTRY_CURRENCY_MAP } from "@/lib/country-currencies";
import { countries } from "@/lib/countries";

// Force dynamic to ensure fresh data on each request
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name, email, password, accountType, country } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine preferred currency based on country
    // Find the country code from the country name
    let preferredCurrency = "USD"; // Default
    if (country) {
      const countryData = countries.find((c) => c.name === country);
      if (countryData && COUNTRY_CURRENCY_MAP[countryData.code]) {
        preferredCurrency = COUNTRY_CURRENCY_MAP[countryData.code];
      }
    }

    const user = await prisma.user.create({
      data: {
        id: generateId(),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        accountType: normalizedAccountType,
        country: country || undefined,
        preferredCurrency,
        isEmailVerified: false,
        updatedAt: new Date(),
        Portfolio: {
          create: {
            id: generateId(),
          },
        },
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        id: generateId(),
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
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
