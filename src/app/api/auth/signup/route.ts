import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // For development without Prisma, we'll simulate the signup process
    console.log('📝 Simulating user signup for:', email);
    
    /*
    // Production implementation with Prisma:
    const exist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (exist) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user without emailVerified (will be set when they verify)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null, // Will be set when email is verified
        portfolio: {
          create: {},
        },
      },
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;
    await sendVerificationEmail({
      to: email,
      userName: name,
      verificationUrl,
    });
    */

    // For development, simulate the process
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a sample verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;
    
    // Simulate sending verification email
    await sendVerificationEmail({
      to: email,
      userName: name,
      verificationUrl,
    });

    console.log('✅ User signup simulated successfully');
    console.log('🔗 Verification URL (for testing):', verificationUrl);

    return NextResponse.json({ 
      message: "User created successfully. Please check your email to verify your account.",
      verificationUrl: verificationUrl // Remove this in production
    });
  } catch (error) {
    console.error("SIGNUP_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
