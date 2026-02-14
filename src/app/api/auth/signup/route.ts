import { generateId } from "@/lib/generate-id";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createVerificationToken } from "@/lib/verification";
import { sendEmail } from "@/lib/email";
import { emailTemplate, verificationCodeTemplate } from "@/lib/email-templates";
import { COUNTRY_CURRENCY_MAP } from "@/lib/country-currencies";
import { countries } from "@/lib/countries";
import { generateAccountNumber } from "@/lib/p2p-transfer-utils";
import { z } from "zod";

// Zod schema for signup validation
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  accountType: z.enum(["STANDARD", "INVESTOR", "TRADER"]).default("STANDARD"),
  country: z.string().optional(),
});

// Force dynamic to ensure fresh data on each request
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate with Zod
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        {
          success: false,
          message: errors[0]?.message || "Validation failed",
          errors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, accountType, country } = validation.data;

    const exist = await prisma.user.findUnique({
      where: {
        email: email, // Already normalized by Zod
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
    let preferredLanguage = "en"; // Default
    if (country) {
      const countryData = countries.find((c) => c.name === country);
      if (countryData) {
        if (COUNTRY_CURRENCY_MAP[countryData.code]) {
          preferredCurrency = COUNTRY_CURRENCY_MAP[countryData.code];
        }
      }
    }

    const user = await prisma.user.create({
      data: {
        id: generateId(),
        name,
        email: email, // Already normalized by Zod
        password: hashedPassword,
        role: "USER", // Explicitly set role
        accountType: accountType,
        country: country || undefined,
        preferredCurrency,
        preferredLanguage,
        accountNumber: generateAccountNumber(),
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
        title: "Welcome to M4Capital! \uD83C\uDFE6",
        message:
          "To unlock the full potential of your account, please complete your KYC verification and make your first deposit. Once set up, you'll have access to our full suite of investment tools and start earning right away.",
      },
    });

    // Generate and send verification code
    try {
      const verificationCode = await createVerificationToken(email);
      const emailContent = verificationCodeTemplate(name, verificationCode);

      await sendEmail({
        to: email,
        subject: "Verify Your Email - M4 Capital",
        html: emailTemplate(emailContent),
        text: `Your M4 Capital verification code is: ${verificationCode}. This code will expire in 15 minutes.`,
      });
      console.log(`Verification code sent to ${email}`);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Don't fail signup if email fails - user can request resend
    }

    return NextResponse.json({
      success: true,
      message:
        "Account created successfully. Please check your email for the verification code.",
      email: email,
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
