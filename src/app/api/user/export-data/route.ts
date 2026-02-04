import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        Portfolio: true,
        Deposit: true,
        Trade: true,
        KycVerification: true,
        TelegramLinkCode: true,
        Notification: true,
        Session: true,
        SentTransfers: true,
        ReceivedTransfers: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive data
    const exportData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        preferredCurrency: user.preferredCurrency,
        preferredLanguage: user.preferredLanguage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      portfolio: user.Portfolio
        ? {
            balance: user.Portfolio.balance,
            balanceCurrency: user.Portfolio.balanceCurrency,
            assets: user.Portfolio.assets,
          }
        : null,
      deposits: user.Deposit,
      trades: user.Trade,
      p2pTransfers: {
        sent: user.SentTransfers,
        received: user.ReceivedTransfers,
      },
      kycData: user.KycVerification
        ? {
            id: user.KycVerification.id,
            status: user.KycVerification.status,
            firstName: user.KycVerification.firstName,
            lastName: user.KycVerification.lastName,
            dateOfBirth: user.KycVerification.dateOfBirth,
            nationality: user.KycVerification.nationality,
            phoneNumber: user.KycVerification.phoneNumber,
            address: user.KycVerification.address,
            city: user.KycVerification.city,
            postalCode: user.KycVerification.postalCode,
            country: user.KycVerification.country,
            createdAt: user.KycVerification.submittedAt,
            updatedAt: user.KycVerification.updatedAt,
          }
        : null,
      telegramLink: user.TelegramLinkCode
        ? {
            code: user.TelegramLinkCode.code,
            createdAt: user.TelegramLinkCode.createdAt,
            expiresAt: user.TelegramLinkCode.expiresAt,
          }
        : null,
      notifications: user.Notification,
      exportedAt: new Date().toISOString(),
      exportVersion: "1.0",
    };

    // Convert to JSON string
    const jsonData = JSON.stringify(exportData, null, 2);

    // Return as downloadable file
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="m4capital-data-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
