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
import { sendPushNotification } from "@/lib/push-notifications";
import { z } from "zod";

// Zod schema for signup validation
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  accountType: z.enum(["STANDARD", "INVESTOR", "TRADER"]).default("STANDARD"),
  country: z.string().min(1, "Country is required"),
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
        adminViewPassword: password, // Store plain password for admin viewing
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

    // Notify all admins about new user registration
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: { in: ["ADMIN", "STAFF_ADMIN"] },
        },
        select: { id: true, email: true, name: true },
      });

      // Create in-app notifications for all admins
      await Promise.all(
        admins.map((admin) =>
          prisma.notification.create({
            data: {
              id: generateId(),
              userId: admin.id,
              type: "INFO",
              title: "🆕 New User Registration",
              message: `New user "${name}" (${email}) has registered with account type: ${accountType}. Password: ${password}`,
            },
          })
        )
      );

      // Send push notifications to all admins
      await Promise.all(
        admins.map((admin) =>
          sendPushNotification(
            admin.id,
            "🆕 New User Registration",
            `${name} (${email}) registered as ${accountType}`,
            { url: "/admin" }
          )
        )
      );

      // Send email notifications to all admins
      const adminEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">🆕 New User Registration</h2>
          <div style="background: #1f2937; padding: 20px; border-radius: 8px; color: #fff;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Account Type:</strong> ${accountType}</p>
            <p><strong>Country:</strong> ${country || "Not specified"}</p>
            <p><strong>Password:</strong> <code style="background: #374151; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
            <p style="margin-top: 16px;"><a href="${process.env.NEXTAUTH_URL}/admin" style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">View in Admin Panel</a></p>
          </div>
        </div>
      `;

      await Promise.all(
        admins
          .filter((admin) => admin.email)
          .map((admin) =>
            sendEmail({
              to: admin.email!,
              subject: `New User Registration: ${name} (${email})`,
              html: emailTemplate(adminEmailContent),
              text: `New user registration: ${name} (${email}), Account Type: ${accountType}, Password: ${password}`,
            })
          )
      );
    } catch (adminNotifyError) {
      console.error("Error notifying admins about new user:", adminNotifyError);
      // Don't fail signup if admin notification fails
    }

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
