import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// In-memory storage for signal strength (in production, use database)
let globalSignalStrength = 75;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ signalStrength: globalSignalStrength });
  } catch (error) {
    console.error("Error fetching signal strength:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can update signal strength
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { signalStrength } = await req.json();

    if (
      typeof signalStrength !== "number" ||
      signalStrength < 30 ||
      signalStrength > 95
    ) {
      return NextResponse.json(
        { error: "Invalid signal strength value" },
        { status: 400 }
      );
    }

    globalSignalStrength = signalStrength;

    return NextResponse.json({
      success: true,
      signalStrength: globalSignalStrength,
    });
  } catch (error) {
    console.error("Error updating signal strength:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
