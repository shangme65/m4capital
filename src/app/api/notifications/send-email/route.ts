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
  const accentGlow = "rgba(16, 185, 129, 0.3)";

  let transactionIcon = "";
  let transactionColor = brandColor;
  let transactionGradient = "linear-gradient(135deg, #10b981 0%, #059669 100%)";

  switch (type) {
    case "crypto_purchase":
      transactionIcon = "↗";
      transactionColor = "#10b981";
      transactionGradient = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      break;
    case "crypto_sale":
      transactionIcon = "↙";
      transactionColor = "#ef4444";
      transactionGradient = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
      break;
    case "crypto_conversion":
      transactionIcon = "↔";
      transactionColor = "#a855f7";
      transactionGradient = "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
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
  <style>
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px ${accentGlow}, 0 0 40px ${accentGlow}; }
      50% { box-shadow: 0 0 30px ${accentGlow}, 0 0 60px ${accentGlow}; }
    }
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    .float-animation {
      animation: float 3s ease-in-out infinite;
    }
    .glow-animation {
      animation: glow 2s ease-in-out infinite;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container with 3D Effect -->
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(145deg, ${darkBg} 0%, #262626 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(16, 185, 129, 0.1); border: 1px solid rgba(255, 255, 255, 0.05);">
          
          <!-- Logo Header -->
          <tr>
            <td style="text-align: center; padding: 24px 20px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <img src="https://www.m4capital.online/m4capitallogo1.png" alt="M4Capital" width="140" style="display: inline-block; max-width: 140px; height: auto;" />
            </td>
          </tr>
          
          <!-- 3D Header with Gradient Overlay -->
          <tr>
            <td style="position: relative; background: ${transactionGradient}; padding: 40px 40px 30px; text-align: center; box-shadow: inset 0 -2px 20px rgba(0, 0, 0, 0.2);">
              <!-- Animated Background Pattern -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px);"></div>
              
              <!-- Title with Badge -->
              <div style="position: relative; z-index: 2;">
                <div style="margin-top: 12px; padding: 8px 20px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border-radius: 20px; display: inline-block; border: 1px solid rgba(255, 255, 255, 0.2);">
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.95); font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
                    PREMIUM DIGITAL ASSET MANAGEMENT
                  </p>
                </div>
              </div>
            </td>
          </tr>

          <!-- 3D Floating Transaction Icon -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px; background: linear-gradient(180deg, ${darkBg} 0%, #1a1a1a 100%);">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td>
                    <!-- Outer Glow Ring -->
                    <div style="position: relative; width: 120px; height: 120px; border-radius: 50%; background: ${transactionGradient}; padding: 3px; box-shadow: 0 0 60px ${transactionColor}40, 0 20px 40px rgba(0, 0, 0, 0.4);">
                      <!-- Middle Glass Layer -->
                      <div style="width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); backdrop-filter: blur(10px); padding: 3px; border: 1px solid rgba(255,255,255,0.1);">
                        <!-- Inner Icon Container -->
                        <div style="width: 100%; height: 100%; border-radius: 50%; background: ${transactionColor}15; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 4px 20px rgba(0, 0, 0, 0.2);">
                          <span style="font-size: 50px; color: ${transactionColor}; text-shadow: 0 0 20px ${transactionColor}80;">${transactionIcon}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section with Glassmorphism -->
          <tr>
            <td style="padding: 20px 40px 40px; background: linear-gradient(180deg, #1a1a1a 0%, ${darkBg} 100%);">
              <h2 style="margin: 0 0 12px; color: #ffffff; font-size: 28px; font-weight: 700; text-align: center; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);">
                ${title}
              </h2>
              
              <p style="margin: 0 0 20px; color: #9ca3af; font-size: 15px; line-height: 1.6; text-align: center;">
                Hello <span style="color: ${brandColor}; font-weight: 600;">${userName}</span>,
              </p>
              
              <p style="margin: 0 0 35px; color: #d1d5db; font-size: 16px; line-height: 1.7; text-align: center;">
                ${message}
              </p>

              <!-- 3D Transaction Card -->
              ${
                amount && asset
                  ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(145deg, ${lightBg}, #252525); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 35px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);">
                <tr>
                  <td style="padding: 28px 24px;">
                    <!-- Card Header with Gradient -->
                    <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                      <h3 style="margin: 0; background: ${transactionGradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px;">
                        ✦ Transaction Details
                      </h3>
                    </div>
                    
                    ${
                      type === "crypto_conversion" && toAsset
                        ? `
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 12px 0; color: #9ca3af; font-size: 14px; font-weight: 500;">From:</td>
                        <td align="right" style="padding: 12px 0;">
                          <div style="background: rgba(255, 255, 255, 0.03); padding: 8px 16px; border-radius: 8px; display: inline-block; border: 1px solid rgba(255, 255, 255, 0.05);">
                            <span style="color: #ffffff; font-size: 15px; font-weight: 700;">${amount.toFixed(
                              8
                            )}</span>
                            <span style="color: ${transactionColor}; font-size: 14px; font-weight: 600; margin-left: 6px;">${asset}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" align="center" style="padding: 8px 0;">
                          <div style="color: ${transactionColor}; font-size: 24px;">⟱</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #9ca3af; font-size: 14px; font-weight: 500;">To:</td>
                        <td align="right" style="padding: 12px 0;">
                          <div style="background: ${transactionGradient}; padding: 10px 18px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 15px ${transactionColor}30;">
                            <span style="color: #ffffff; font-size: 16px; font-weight: 700;">${toAsset}</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                    `
                        : `
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 12px 0; color: #9ca3af; font-size: 14px; font-weight: 500;">Asset</td>
                        <td align="right" style="padding: 12px 0;">
                          <div style="background: rgba(255, 255, 255, 0.03); padding: 6px 14px; border-radius: 6px; display: inline-block; border: 1px solid rgba(255, 255, 255, 0.05);">
                            <span style="color: #ffffff; font-size: 14px; font-weight: 700;">${asset}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; color: #9ca3af; font-size: 14px; font-weight: 500;">Amount</td>
                        <td align="right" style="padding: 16px 0;">
                          <div style="background: ${transactionGradient}; padding: 12px 20px; border-radius: 10px; display: inline-block; box-shadow: 0 6px 20px ${transactionColor}35, inset 0 1px 0 rgba(255, 255, 255, 0.2);">
                            <span style="color: #ffffff; font-size: 22px; font-weight: 800; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                              ${currencySymbol}${amount.toFixed(2)}
                            </span>
                            <span style="color: rgba(255, 255, 255, 0.85); font-size: 15px; font-weight: 600; margin-left: 6px;">${currency}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #9ca3af; font-size: 14px; font-weight: 500;">Status</td>
                        <td align="right" style="padding: 12px 0;">
                          <div style="background: ${brandColor}18; padding: 6px 16px; border-radius: 20px; display: inline-block; border: 1.5px solid ${brandColor}40;">
                            <span style="color: ${brandColor}; font-size: 11px; font-weight: 700; letter-spacing: 0.8px;">● COMPLETED</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #9ca3af; font-size: 14px; font-weight: 500;">Timestamp</td>
                        <td align="right" style="padding: 12px 0; color: #e5e7eb; font-size: 14px; font-weight: 600;">
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

              <!-- 3D Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 35px;">
                    <a href="https://m4capital.com/dashboard" style="display: inline-block; background: ${transactionGradient}; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 8px 25px ${transactionColor}40, 0 4px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);">
                      🚀 View Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 3D Security Notice -->
          <tr>
            <td style="padding: 0 40px 35px; background: ${darkBg};">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e3a8a15, #1e40af15); border-left: 4px solid #3b82f6; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); border: 1px solid rgba(59, 130, 246, 0.2); border-left: 4px solid #3b82f6;">
                <tr>
                  <td style="padding: 18px 22px;">
                    <p style="margin: 0; color: #93c5fd; font-size: 13px; line-height: 1.6; font-weight: 500;">
                      <strong style="color: #60a5fa; font-size: 14px;">🔒 Security Reminder</strong><br/>
                      <span style="color: #bfdbfe;">M4Capital will never ask for your password or private keys via email. Always verify URLs before entering credentials.</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Premium Footer with Depth -->
          <tr>
            <td style="background: linear-gradient(180deg, #0a0a0a 0%, #000000 100%); padding: 35px 40px; text-align: center; box-shadow: inset 0 2px 20px rgba(0, 0, 0, 0.5);">
              <p style="margin: 0 0 15px; color: #6b7280; font-size: 13px; line-height: 1.7; font-weight: 500;">
                This is an automated notification from M4Capital.<br/>
                Manage your preferences in <a href="https://m4capital.com/settings" style="color: ${brandColor}; text-decoration: none; font-weight: 600; border-bottom: 1px solid ${brandColor}40;">account settings</a>.
              </p>
              
              <div style="margin: 25px 0 0; padding-top: 25px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                <!-- Social Links -->
                <div style="margin-bottom: 20px;">
                  <a href="#" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none; font-size: 20px;">𝕏</a>
                  <a href="#" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none; font-size: 20px;">◉</a>
                  <a href="#" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none; font-size: 20px;">⚡</a>
                </div>
                
                <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px; font-weight: 600;">
                  © ${new Date().getFullYear()} M4Capital. All rights reserved.
                </p>
                <p style="margin: 0; background: ${transactionGradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 10px; font-weight: 700; letter-spacing: 1px;">
                  PREMIUM DIGITAL ASSET MANAGEMENT PLATFORM
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
