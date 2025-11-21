import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/notifications/send-email
 * Send email notification for crypto purchases
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      title,
      message,
      amount,
      asset,
      toAsset,
      currency = "USD",
    } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has email notifications enabled
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        name: true,
        emailNotifications: true,
        preferredCurrency: true,
      },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Check if email notifications are enabled
    const emailNotificationsEnabled = user.emailNotifications ?? true;

    if (!emailNotificationsEnabled) {
      return NextResponse.json({
        success: true,
        message: "Email notifications disabled for this user",
      });
    }

    // Store email notification in database
    const notification = await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.user.id,
        type: "TRANSACTION" as any,
        title,
        message,
        amount: amount ? parseFloat(amount.toString()) : null,
        asset: asset || null,
        read: false,
      },
    });

    // Use user's preferred currency or fallback to passed currency
    const userCurrency = user.preferredCurrency || currency;
    const currencySymbol =
      userCurrency === "EUR" ? "€" : userCurrency === "GBP" ? "£" : "$";

    // Format email content with professional M4Capital branding
    const emailSubject = `${title} - M4Capital`;
    const emailBody = generateProfessionalEmailTemplate({
      userName: user.name || "Valued Client",
      title,
      message,
      type,
      amount,
      asset,
      toAsset,
      currency: userCurrency,
      currencySymbol,
    });

    // Send actual email using Nodemailer
    const { sendEmail } = await import("@/lib/email");
    const emailResult = await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailBody,
      text: message,
    });

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      // Don't fail the request if email fails, just log it
    } else {
      console.log("Email notification sent successfully to:", user.email);
    }

    return NextResponse.json({
      success: true,
      message: "Email notification sent successfully",
      notification,
    });
  } catch (error) {
    console.error("Error sending email notification:", error);
    return NextResponse.json(
      { error: "Failed to send email notification" },
      { status: 500 }
    );
  }
}

function generateProfessionalEmailTemplate({
  userName,
  title,
  message,
  type,
  amount,
  asset,
  toAsset,
  currency,
  currencySymbol,
}: {
  userName: string;
  title: string;
  message: string;
  type: string;
  amount?: number;
  asset?: string;
  toAsset?: string;
  currency: string;
  currencySymbol: string;
}) {
  const brandColor = "#10b981"; // M4Capital green
  const darkBg = "#1f1f1f";
  const lightBg = "#2a2a2a";

  let transactionIcon = "";
  let transactionColor = brandColor;

  switch (type) {
    case "crypto_purchase":
      transactionIcon = "↗";
      transactionColor = "#10b981";
      break;
    case "crypto_sale":
      transactionIcon = "↙";
      transactionColor = "#ef4444";
      break;
    case "crypto_conversion":
      transactionIcon = "↔";
      transactionColor = "#a855f7";
      break;
    default:
      transactionIcon = "✓";
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: ${darkBg}; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${brandColor} 0%, #059669 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                M4Capital
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">
                Premium Digital Asset Management
              </p>
            </td>
          </tr>

          <!-- Transaction Status Icon -->
          <tr>
            <td align="center" style="padding: 30px 40px 0;">
              <div style="width: 80px; height: 80px; background: ${transactionColor}20; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 40px; color: ${transactionColor};">${transactionIcon}</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 24px; font-weight: 600; text-align: center;">
                ${title}
              </h2>
              
              <p style="margin: 0 0 24px; color: #9ca3af; font-size: 16px; line-height: 1.6; text-align: center;">
                Hello ${userName},
              </p>
              
              <p style="margin: 0 0 32px; color: #e5e7eb; font-size: 16px; line-height: 1.6; text-align: center;">
                ${message}
              </p>

              <!-- Transaction Details Card -->
              ${
                amount && asset
                  ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${lightBg}; border-radius: 12px; border: 1px solid #374151; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px; color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Transaction Details
                    </h3>
                    
                    ${
                      type === "crypto_conversion" && toAsset
                        ? `
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">From:</td>
                        <td align="right" style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">
                          ${amount.toFixed(8)} ${asset}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">To:</td>
                        <td align="right" style="padding: 8px 0; color: ${transactionColor}; font-size: 14px; font-weight: 600;">
                          ${toAsset}
                        </td>
                      </tr>
                    </table>
                    `
                        : `
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Asset:</td>
                        <td align="right" style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">
                          ${asset}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Amount:</td>
                        <td align="right" style="padding: 8px 0; color: ${transactionColor}; font-size: 18px; font-weight: 700;">
                          ${currencySymbol}${amount.toFixed(2)} ${currency}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Status:</td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="background-color: ${brandColor}20; color: ${brandColor}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            COMPLETED
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Date:</td>
                        <td align="right" style="padding: 8px 0; color: #e5e7eb; font-size: 14px;">
                          ${new Date().toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    </table>
                    `
                    }
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="https://m4capital.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, ${brandColor} 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px ${brandColor}40;">
                      View Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1e3a8a20; border-left: 4px solid #3b82f6; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; color: #93c5fd; font-size: 13px; line-height: 1.5;">
                      <strong style="color: #60a5fa;">🔒 Security Reminder:</strong><br/>
                      M4Capital will never ask for your password or private keys via email. Always verify URLs before entering credentials.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #111111; padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 12px; color: #6b7280; font-size: 13px; line-height: 1.6;">
                This is an automated notification from M4Capital.<br/>
                You can manage your notification preferences in your <a href="https://m4capital.com/settings" style="color: ${brandColor}; text-decoration: none;">account settings</a>.
              </p>
              
              <div style="margin: 20px 0; padding-top: 20px; border-top: 1px solid #374151;">
                <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
                  © ${new Date().getFullYear()} M4Capital. All rights reserved.
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 11px;">
                  Premium Digital Asset Management Platform
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
