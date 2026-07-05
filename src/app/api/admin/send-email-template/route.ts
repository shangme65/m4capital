import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { emailTemplate } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

// Inline template builder so we avoid importing heavy server modules client-side
function buildBonusExpirationHtml(
  userName: string,
  expiryDate: string,
  daysLeft: number,
  bonusPercent: number,
): string {
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.m4capital.online";
  const urgencyColor = daysLeft <= 2 ? "#ef4444" : "#f59e0b";
  const urgencyLabel =
    daysLeft === 0
      ? "⚠️ TODAY IS YOUR LAST CHANCE"
      : daysLeft === 1
        ? "⚠️ EXPIRES TOMORROW"
        : `⏳ ${daysLeft} DAYS LEFT`;

  const locationLine = `<p>📍 Bonus expires: <strong>${expiryDate}</strong></p>`;

  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 0;">
      <tr>
        <td align="center" style="background: ${urgencyColor}22; border: 1px solid ${urgencyColor}44; border-radius: 10px 10px 0 0; padding: 10px 16px;">
          <p style="margin: 0; color: ${urgencyColor}; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">${urgencyLabel}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
      <tr>
        <td align="center" style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ea580c 100%); border-radius: 0 0 10px 10px; padding: 28px 20px;">
          <p style="margin: 0 0 4px; color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">Limited-Time Welcome Offer</p>
          <p style="margin: 0 0 8px; color: #ffffff; font-size: 52px; font-weight: 900; line-height: 1; letter-spacing: -2px;">${bonusPercent}%</p>
          <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 17px; font-weight: 600;">First Deposit Bonus</p>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.75); font-size: 12px;">Deposit any amount — we double your start with a ${bonusPercent}% match, credited instantly.</p>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 20px; color: #ffffff; font-size: 17px; font-weight: 500;">Hi ${userName},</p>

    <p style="margin: 0 0 16px; color: #e2e8f0; font-size: 15px; line-height: 1.7;">
      Your exclusive <strong style="color: ${urgencyColor};">${bonusPercent}% Welcome Deposit Bonus</strong> is reserved for your account — but it <strong style="color: ${urgencyColor};">expires on ${expiryDate}</strong>. Once it's gone, it cannot be reinstated or extended.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td style="background: rgba(245,158,11,0.15); border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px 20px;">
          <p style="margin: 0; color: #f59e0b; font-size: 14px; line-height: 1.5;">
            Make your first deposit before <strong>${expiryDate}</strong> and receive an instant <strong>${bonusPercent}% bonus</strong> on the full deposited amount — automatically credited to your trading balance.
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 12px 0;">
      <tr>
        <td style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 14px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 12px; color: #ffffff; font-size: 15px; font-weight: 700;">💡 How It Works</p>
          <p style="margin: 0 0 8px; color: #e2e8f0; font-size: 13px; line-height: 1.5;">① Make your first deposit of any amount via Bitcoin, Ethereum, USDT, or 100+ other assets.</p>
          <p style="margin: 0 0 8px; color: #e2e8f0; font-size: 13px; line-height: 1.5;">② Your <strong style="color: #ffffff;">${bonusPercent}% bonus is credited instantly</strong> — no codes, no waiting, no hidden steps.</p>
          <p style="margin: 0; color: #e2e8f0; font-size: 13px; line-height: 1.5;">③ Start trading crypto, forex, and copy-trading strategies immediately with your boosted balance.</p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 12px 0; background: rgba(0,0,0,0.3); border-radius: 10px; overflow: hidden;">
      <tr>
        <td style="padding: 10px 14px; color: #94a3b8; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">Your Deposit</td>
        <td align="right" style="padding: 10px 14px; color: #ffffff; font-size: 13px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.05);">$500.00</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; color: #94a3b8; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">${bonusPercent}% Welcome Bonus</td>
        <td align="right" style="padding: 10px 14px; color: #10b981; font-size: 13px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.05);">+$250.00</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; color: #94a3b8; font-size: 12px;">Total Trading Balance</td>
        <td align="right" style="padding: 10px 14px; color: #10b981; font-size: 15px; font-weight: 700;">$750.00</td>
      </tr>
    </table>
    <p style="margin: -6px 0 16px; color: #64748b; font-size: 11px; text-align: center;">Example shown for illustrative purposes only.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 12px 0;">
      <tr>
        <td style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 14px;">
          <p style="margin: 0 0 12px; color: #ffffff; font-size: 15px; font-weight: 700;">📈 Why Start Investing Today</p>
          <p style="margin: 0 0 8px; color: #e2e8f0; font-size: 13px; line-height: 1.5;">• 🌍 Access global markets — crypto, forex, stocks, and commodities — 24/7 from anywhere in the world.</p>
          <p style="margin: 0 0 8px; color: #e2e8f0; font-size: 13px; line-height: 1.5;">• 🤖 Copy top-performing traders automatically. No experience required — let proven strategies work for you.</p>
          <p style="margin: 0 0 8px; color: #e2e8f0; font-size: 13px; line-height: 1.5;">• 🔒 Regulated environment with multi-layer security. Your funds are protected and your data is encrypted.</p>
          <p style="margin: 0 0 8px; color: #e2e8f0; font-size: 13px; line-height: 1.5;">• 💸 Transparent fee structure with no hidden charges. Withdraw profits at any time with no lock-in periods.</p>
          <p style="margin: 0; color: #e2e8f0; font-size: 13px; line-height: 1.5;">• 📊 Real-time analytics and AI-powered signals to help you make informed, data-driven decisions.</p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0 8px;">
      <tr>
        <td align="center">
          <a href="${baseUrl}/dashboard/deposit" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.5);">
            🚀 Claim My ${bonusPercent}% Bonus Now
          </a>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 10px 0;">
      <tr>
        <td align="center">
          <a href="${baseUrl}/dashboard" style="display: inline-block; padding: 10px 24px; background: transparent; border: 2px solid #6366f1; color: #6366f1; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 12px;">
            Learn How It Works
          </a>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
      <tr><td style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);"></td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
      <tr>
        <td style="background: rgba(0,0,0,0.25); border-radius: 8px; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.06);">
          <p style="margin: 0 0 8px; color: #e2e8f0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Important — Bonus Terms &amp; Risk Disclosure</p>
          <p style="margin: 0 0 6px; color: #64748b; font-size: 11px; line-height: 1.6;">
            The ${bonusPercent}% Welcome Deposit Bonus is a one-time promotional offer available exclusively on your first deposit and must be claimed before <strong style="color: #94a3b8;">${expiryDate}</strong>. The bonus is subject to M4 Capital's standard bonus terms, including applicable trading volume requirements before withdrawal eligibility. Full bonus terms are available at <a href="${baseUrl}/terms" style="color: #94a3b8; text-decoration: underline;">${baseUrl}/terms</a>.
          </p>
          <p style="margin: 0; color: #64748b; font-size: 11px; line-height: 1.6;">
            <strong style="color: #94a3b8;">Risk Warning:</strong> Trading financial instruments involves a significant risk of loss and is not suitable for all investors. Past performance is not indicative of future results. You should only invest capital you can afford to lose. M4 Capital does not provide personalised investment advice. Please read our full <a href="${baseUrl}/terms" style="color: #94a3b8; text-decoration: underline;">Terms of Service</a> and <a href="${baseUrl}/privacy" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a> before depositing.
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
      <tr><td style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);"></td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <p style="margin: 0 0 4px; color: #e2e8f0; font-size: 14px;">Best regards,</p>
          <p style="margin: 0; color: #ffffff; font-size: 15px; font-weight: 600;">The M4 Capital Team</p>
        </td>
      </tr>
    </table>
  `;

  return emailTemplate(content);
}

function buildBonusExpirationText(
  userName: string,
  expiryDate: string,
  daysLeft: number,
  bonusPercent: number,
): string {
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.m4capital.online";
  return `Hi ${userName},

Your exclusive ${bonusPercent}% Welcome Deposit Bonus expires on ${expiryDate} (${daysLeft} day${daysLeft === 1 ? "" : "s"} left).

Make your first deposit before this date and receive an instant ${bonusPercent}% bonus on the full amount — credited automatically to your trading balance.

EXAMPLE: Deposit $500 → Get $250 bonus → Start with $750.

WHY INVEST NOW?
• Access global crypto, forex, and stock markets 24/7
• Copy top traders automatically — no experience needed
• Real-time analytics and AI trading signals
• Withdraw profits any time with no lock-in periods
• Multi-layer security and regulated environment

Claim your bonus: ${baseUrl}/dashboard/deposit

--- Bonus Terms & Risk Disclosure ---
The ${bonusPercent}% Welcome Bonus is valid on your first deposit only and expires on ${expiryDate}. Trading involves substantial risk of loss. Only invest funds you can afford to lose. Past performance is not indicative of future results. Full terms: ${baseUrl}/terms

The M4 Capital Team
${baseUrl}
`;
}

export async function POST(req: NextRequest) {
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

  const body = await req.json();
  const {
    templateId,
    subject,
    sendTarget, // "single" | "all_no_deposit"
    userId,
    templateData,
  } = body as {
    templateId: string;
    subject: string;
    sendTarget: "single" | "all_no_deposit";
    userId?: string;
    templateData: {
      expiryDate: string;
      daysLeft: number;
      bonusPercent: number;
    };
  };

  if (templateId !== "bonus-expiration") {
    return NextResponse.json({ error: "Unknown template" }, { status: 400 });
  }
  if (!subject || !templateData?.expiryDate) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // Collect recipients
  let recipients: { id: string; name: string | null; email: string | null }[] =
    [];

  if (sendTarget === "single") {
    if (!userId) {
      return NextResponse.json(
        { error: "userId required for single send" },
        { status: 400 },
      );
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    if (!user || !user.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    recipients = [user];
  } else {
    // All users who have NOT claimed their first deposit bonus
    recipients = await prisma.user.findMany({
      where: {
        role: "USER",
        hasClaimedFirstDepositBonus: false,
        email: { not: null },
      },
      select: { id: true, name: true, email: true },
    });
  }

  if (recipients.length === 0) {
    return NextResponse.json(
      { message: "No eligible recipients found.", sent: 0 },
      { status: 200 },
    );
  }

  let sent = 0;
  const errors: string[] = [];

  for (const recipient of recipients) {
    if (!recipient.email) continue;
    const displayName = recipient.name || "Valued Investor";
    try {
      await sendEmail({
        to: recipient.email,
        subject,
        html: buildBonusExpirationHtml(
          displayName,
          templateData.expiryDate,
          templateData.daysLeft,
          templateData.bonusPercent,
        ),
        text: buildBonusExpirationText(
          displayName,
          templateData.expiryDate,
          templateData.daysLeft,
          templateData.bonusPercent,
        ),
      });
      sent++;
    } catch (err) {
      errors.push(recipient.email);
    }
  }

  return NextResponse.json({
    message:
      errors.length === 0
        ? `Email sent successfully to ${sent} recipient${sent === 1 ? "" : "s"}.`
        : `Sent to ${sent} recipients. Failed: ${errors.join(", ")}`,
    sent,
    failed: errors.length,
  });
}
