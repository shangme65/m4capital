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
import {
  roleUpdateTemplate,
  roleUpdateTextTemplate,
  adminRoleNotificationTemplate,
  adminRoleNotificationTextTemplate,
} from "@/lib/email-templates";

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

    // **CRITICAL: Invalidate user's session by updating updatedAt**
    // This forces the user to re-authenticate with their new role
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });

    // Send notification based on role change
    if (role === "USER" && userBefore.role !== "USER") {
      // User was demoted to USER - send notification
      const wasStaffAdmin = userBefore.role === "STAFF_ADMIN";

      try {
        if (userBefore.email) {
          await sendEmail({
            to: userBefore.email,
            subject: "Account Role Updated - M4 Capital",
            html: roleUpdateTemplate(userBefore.name || "User", "Standard User", false),
            text: roleUpdateTextTemplate(userBefore.name || "User", "Standard User", false),
          });
        }

        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: userBefore.id,
            type: "INFO",
            title: "Account Role Updated",
            message: `Your account role has been updated to Standard User. Your interface will refresh automatically.`,
          },
        });

        // If user was demoted from STAFF_ADMIN, notify origin admin
        if (wasStaffAdmin) {
          try {
            const originAdmin = await prisma.user.findFirst({
              where: {
                role: "ADMIN",
                isOriginAdmin: true,
                isDeleted: false,
              },
              select: { id: true, email: true, name: true },
            });

            if (originAdmin && originAdmin.email) {
              await sendEmail({
                to: originAdmin.email,
                subject: "Staff Administrator Demoted - M4 Capital",
                html: adminRoleNotificationTemplate(
                  userBefore.name || "User",
                  userBefore.email || "",
                  userBefore.id,
                  "Staff Administrator",
                  "Standard User",
                  false
                ),
                text: adminRoleNotificationTextTemplate(
                  userBefore.name || "User",
                  userBefore.email || "",
                  "Staff Administrator",
                  "Standard User",
                  false
                ),
              });

              console.log(
                `✅ Admin demotion notification email sent to ${originAdmin.email}`
              );

              // Create push notification for origin admin
              await prisma.notification.create({
                data: {
                  id: generateId(),
                  userId: originAdmin.id,
                  type: "INFO",
                  title: "Staff Administrator Demoted",
                  message: `${userBefore.name} has been demoted from Staff Administrator to Standard User.`,
                },
              });
            }
          } catch (adminNotifError) {
            console.error(
              "Failed to notify origin admin of demotion:",
              adminNotifError
            );
          }
        }
      } catch (error) {
        console.error("Failed to send demotion notification:", error);
      }
    }

    // If user was promoted to STAFF_ADMIN, send notifications
    if (role === "STAFF_ADMIN" && userBefore.role !== "STAFF_ADMIN") {
      // 1. Send email notification to the promoted user
      try {
        if (userBefore.email) {
          await sendEmail({
            to: userBefore.email,
            subject: "You've Been Promoted to Staff Administrator - M4 Capital",
            html: roleUpdateTemplate(userBefore.name || "User", "Staff Administrator", true),
            text: roleUpdateTextTemplate(userBefore.name || "User", "Staff Administrator", true),
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
            title: "Promoted to Staff Administrator",
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
          if (originAdmin.email) {
            await sendEmail({
              to: originAdmin.email,
              subject: "New Staff Administrator Promoted - M4 Capital",
              html: adminRoleNotificationTemplate(
                userBefore.name || "User",
                userBefore.email || "",
                userBefore.id,
                userBefore.role || "User",
                "Staff Administrator",
                true
              ),
              text: adminRoleNotificationTextTemplate(
                userBefore.name || "User",
                userBefore.email || "",
                userBefore.role || "User",
                "Staff Administrator",
                true
              ),
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
      {
        user: updatedUser,
        sessionInvalidated: false,
        autoRefresh: true,
        message:
          "User role updated. Changes will be applied automatically within 5 seconds.",
      },
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
