import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

    return NextResponse.json({
      success: true,
      message: "Account created successfully. You can now sign in.",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("SIGNUP_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
