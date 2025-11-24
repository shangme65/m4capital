import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { rateLimiters } from "@/lib/middleware/ratelimit";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/errorHandler";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/generate-id";
import { sendEmail } from "@/lib/email";
import { emailTemplate } from "@/lib/email-templates";

// PATCH: Update user data (admin only)
export async function PATCH(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimiters.admin(req);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  // Check admin authentication
  const { error, session } = await requireAdmin(req);
  if (error) return error;

  const { userId, data } = await req.json();
  if (!userId || !data) {
    return createErrorResponse(
      "Invalid input",
      "Missing userId or data",
      undefined,
      400
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return createSuccessResponse(
      { user: updatedUser },
      "User updated successfully"
    );
  } catch (error) {
    console.error("Update user error:", error);
    return createErrorResponse(
      "Update failed",
      "Failed to update user",
      error,
      500
    );
  }
}

// PUT: Update user role specifically (admin only)
export async function PUT(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimiters.admin(req);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  // Check admin authentication
  const { error, session } = await requireAdmin(req);
  if (error) return error;

  const { userId, role } = await req.json();
  if (!userId || !role) {
    return createErrorResponse(
      "Invalid input",
      "Missing userId or role",
      undefined,
      400
    );
  }

  // Validate role
  if (!["USER", "ADMIN", "STAFF_ADMIN"].includes(role)) {
    return createErrorResponse(
      "Invalid role",
      "Role must be USER, ADMIN, or STAFF_ADMIN",
      undefined,
      400
    );
  }

  try {
    // Get the user before update to check previous role
    const userBefore = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!userBefore) {
      return createErrorResponse(
        "User not found",
        "User does not exist",
        undefined,
        404
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // If user was promoted to STAFF_ADMIN, send notifications
    if (role === "STAFF_ADMIN" && userBefore.role !== "STAFF_ADMIN") {
      // 1. Send email notification to the promoted user
      try {
        const userEmailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">🎉 Congratulations, ${
              userBefore.name
            }!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              You have been promoted to <strong>Staff Administrator</strong> at M4 Capital.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              You now have access to administrative features including:
            </p>
            <ul style="font-size: 14px; line-height: 1.8; color: #555;">
              <li>User management and verification</li>
              <li>Transaction monitoring</li>
              <li>KYC review and approval</li>
              <li>Analytics dashboard</li>
              <li>And more...</li>
            </ul>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Log in to your dashboard to access your new administrative privileges.
            </p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${
                process.env.NEXTAUTH_URL || "https://m4capital.com"
              }/dashboard" 
                 style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            <p style="font-size: 14px; color: #888; margin-top: 20px;">
              Best regards,<br>
              The M4 Capital Team
            </p>
          </div>
        `;

        if (userBefore.email) {
          await sendEmail({
            to: userBefore.email,
            subject: "You've Been Promoted to Staff Administrator - M4 Capital",
            html: emailTemplate(userEmailContent),
            text: `Congratulations ${userBefore.name}! You have been promoted to Staff Administrator at M4 Capital. You now have access to administrative features. Log in to your dashboard to get started.`,
          });
        }

        console.log(`✅ Promotion email sent to ${userBefore.email}`);
      } catch (emailError) {
        console.error("Failed to send promotion email:", emailError);
      }

      // 2. Create push notification for the promoted user
      try {
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: userBefore.id,
            type: "INFO",
            title: "🎉 Promoted to Staff Administrator",
            message: `Congratulations! You have been promoted to Staff Administrator. You now have access to administrative features in your dashboard.`,
          },
        });
      } catch (notifError) {
        console.error("Failed to create user notification:", notifError);
      }

      // 3. Get origin admin and send notification
      try {
        const originAdmin = await prisma.user.findFirst({
          where: {
            role: "ADMIN",
            isOriginAdmin: true,
            isDeleted: false,
          },
          select: { id: true, email: true, name: true },
        });

        if (originAdmin) {
          // Send email to origin admin
          const adminEmailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Staff Administrator Promotion</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                A user has been promoted to Staff Administrator.
              </p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Name:</strong> ${userBefore.name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${userBefore.email}</p>
                <p style="margin: 5px 0;"><strong>User ID:</strong> ${userBefore.id}</p>
                <p style="margin: 5px 0;"><strong>New Role:</strong> Staff Administrator</p>
              </div>
              <p style="font-size: 14px; color: #888; margin-top: 20px;">
                This is an automated notification from M4 Capital.
              </p>
            </div>
          `;

          if (originAdmin.email) {
            await sendEmail({
              to: originAdmin.email,
              subject: "New Staff Administrator Promoted - M4 Capital",
              html: emailTemplate(adminEmailContent),
              text: `A user has been promoted to Staff Administrator: ${userBefore.name} (${userBefore.email}).`,
            });
          }

          console.log(
            `✅ Admin notification email sent to ${originAdmin.email}`
          );

          // Create push notification for origin admin
          await prisma.notification.create({
            data: {
              id: generateId(),
              userId: originAdmin.id,
              type: "INFO",
              title: "New Staff Administrator",
              message: `${userBefore.name} has been promoted to Staff Administrator.`,
            },
          });
        }
      } catch (adminNotifError) {
        console.error("Failed to notify origin admin:", adminNotifError);
      }
    }

    return createSuccessResponse(
      { user: updatedUser },
      "User role updated successfully"
    );
  } catch (error) {
    console.error("Update user role error:", error);
    return createErrorResponse(
      "Update failed",
      "Failed to update user role",
      error,
      500
    );
  }
}
