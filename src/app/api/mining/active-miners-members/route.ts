import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (dbUser?.role !== "ADMIN" && dbUser?.role !== "STAFF_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const members = await prisma.user.findMany({
      where: {
        isDeleted: false,
        role: "USER",
        MiningContract: {
          some: {
            status: "ACTIVE",
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        country: true,
        lastSeenAt: true,
        MiningContract: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            planName: true,
            hashrateValue: true,
            hashrateUnit: true,
          },
        },
      },
      orderBy: [{ lastSeenAt: { sort: "desc", nulls: "last" } }],
    });

    const mappedMembers = members.map((member) => {
      const totalHashrate = member.MiningContract.reduce(
        (sum, c) => sum + Number(c.hashrateValue),
        0,
      );
      const hashrateUnit = member.MiningContract[0]?.hashrateUnit ?? "TH/s";

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        image: member.image,
        country: member.country,
        lastSeenAt: member.lastSeenAt,
        activeContracts: member.MiningContract.length,
        totalHashrate,
        hashrateUnit,
      };
    });

    return NextResponse.json({
      members: mappedMembers,
      total: mappedMembers.length,
    });
  } catch (error) {
    console.error("[mining/active-miners-members GET] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
