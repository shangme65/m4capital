import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone number format (basic E.164 check)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s-]/g, ''))) {
      return NextResponse.json(
        { error: "Please enter a valid phone number with country code (e.g., +1234567890)" },
        { status: 400 }
      );
    }

    // Check if phone number is already verified by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        phoneNumber,
        phoneVerified: true,
        NOT: {
          id: session.user.id,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This phone number is already verified by another account" },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing unverified codes for this phone number
    await prisma.phoneVerification.deleteMany({
      where: {
        phoneNumber,
        verified: false,
      },
    });

    // Create new verification record
    await prisma.phoneVerification.create({
      data: {
        phoneNumber,
        code,
        userId: session.user.id,
        expiresAt,
      },
    });

    const isDevelopment = process.env.NODE_ENV === "development";

    // Send SMS via Twilio
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !twilioPhoneNumber) {
        console.warn("⚠️ Twilio credentials not configured. SMS will not be sent.");
        
        // In development, return code in response
        if (isDevelopment) {
          console.log(`📱 Verification code for ${phoneNumber}: ${code}`);
          return NextResponse.json({
            success: true,
            message: "Verification code generated (SMS not configured)",
            devCode: code,
          });
        }

        return NextResponse.json(
          { error: "SMS service not configured. Please contact support." },
          { status: 500 }
        );
      }

      // Import and initialize Twilio client
      const twilio = require("twilio");
      const client = twilio(accountSid, authToken);

      // Send SMS
      await client.messages.create({
        body: `Your M4Capital verification code is: ${code}. Valid for 10 minutes.`,
        to: phoneNumber,
        from: twilioPhoneNumber,
      });

      console.log(`✅ SMS sent successfully to ${phoneNumber}`);

      // Return code in development for testing
      if (isDevelopment) {
        return NextResponse.json({
          success: true,
          message: "Verification code sent",
          devCode: code,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent to your phone number",
      });
    } catch (smsError: any) {
      console.error("SMS sending error:", smsError);

      // In development, still return the code even if SMS fails
      if (isDevelopment) {
        console.log(`📱 Verification code for ${phoneNumber}: ${code}`);
        return NextResponse.json({
          success: true,
          message: "SMS failed but code generated (development mode)",
          devCode: code,
          smsError: smsError.message,
        });
      }

      return NextResponse.json(
        { error: "Failed to send SMS. Please try again or contact support." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Phone verification send error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
