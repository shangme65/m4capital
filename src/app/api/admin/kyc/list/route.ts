import { NextRequest, NextResponse } from "next/server";

// KYC feature not yet implemented - KycVerification model does not exist in schema
// TODO: Add KycVerification model to prisma/schema.prisma before enabling this feature
export async function GET(req: NextRequest) {
  return NextResponse.json(
    { error: "KYC verification feature not yet implemented" },
    { status: 501 }
  );
}
