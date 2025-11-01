import { sendEmail } from "./email";
import {
  kycSubmissionTemplate,
  kycSubmissionTextTemplate,
  kycApprovedTemplate,
  kycApprovedTextTemplate,
  kycRejectedTemplate,
  kycRejectedTextTemplate,
  kycAdminNotificationTemplate,
  kycAdminNotificationTextTemplate,
} from "./email-templates";
import { prisma } from "./prisma";

// Send KYC submission confirmation to user
export async function sendKycSubmissionEmail(
  userEmail: string,
  userName: string
) {
  // Check user email preferences
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { emailNotifications: true, kycNotifications: true },
  });

  if (!user?.emailNotifications || !user?.kycNotifications) {
    console.log(
      `KYC submission email skipped for ${userEmail} - notifications disabled`
    );
    return { success: false, error: "User has disabled email notifications" };
  }

  return await sendEmail({
    to: userEmail,
    subject: "KYC Verification Submitted - M4 Capital",
    html: kycSubmissionTemplate(userName),
    text: kycSubmissionTextTemplate(userName),
  });
}

// Send KYC approval notification to user
export async function sendKycApprovedEmail(
  userEmail: string,
  userName: string
) {
  // Check user email preferences
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { emailNotifications: true, kycNotifications: true },
  });

  if (!user?.emailNotifications || !user?.kycNotifications) {
    console.log(
      `KYC approval email skipped for ${userEmail} - notifications disabled`
    );
    return { success: false, error: "User has disabled email notifications" };
  }

  return await sendEmail({
    to: userEmail,
    subject: "🎉 KYC Verification Approved - M4 Capital",
    html: kycApprovedTemplate(userName),
    text: kycApprovedTextTemplate(userName),
  });
}

// Send KYC rejection notification to user
export async function sendKycRejectedEmail(
  userEmail: string,
  userName: string,
  reason: string
) {
  // Check user email preferences
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { emailNotifications: true, kycNotifications: true },
  });

  if (!user?.emailNotifications || !user?.kycNotifications) {
    console.log(
      `KYC rejection email skipped for ${userEmail} - notifications disabled`
    );
    return { success: false, error: "User has disabled email notifications" };
  }

  return await sendEmail({
    to: userEmail,
    subject: "KYC Verification Requires Attention - M4 Capital",
    html: kycRejectedTemplate(userName, reason),
    text: kycRejectedTextTemplate(userName, reason),
  });
}

// Send new KYC submission notification to all admins
export async function sendKycAdminNotification(
  userName: string,
  userEmail: string,
  userId: string,
  kycId: string
) {
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        email: true,
        name: true,
      },
    });

    if (admins.length === 0) {
      console.log("No admin users found to send KYC notification");
      return { success: false, error: "No admin users found" };
    }

    // Send email to all admins (filter out any without emails)
    const emailPromises = admins
      .filter((admin) => admin.email)
      .map((admin) =>
        sendEmail({
          to: admin.email!,
          subject: "🔔 New KYC Submission - M4 Capital Admin",
          html: kycAdminNotificationTemplate(
            userName,
            userEmail,
            userId,
            kycId
          ),
          text: kycAdminNotificationTextTemplate(
            userName,
            userEmail,
            userId,
            kycId
          ),
        })
      );

    const results = await Promise.allSettled(emailPromises);

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failureCount = results.filter((r) => r.status === "rejected").length;

    console.log(
      `KYC admin notifications sent: ${successCount} success, ${failureCount} failed`
    );

    return {
      success: successCount > 0,
      successCount,
      failureCount,
      totalAdmins: admins.length,
    };
  } catch (error) {
    console.error("Error sending KYC admin notification:", error);
    return { success: false, error };
  }
}

// Send KYC status update email based on status
export async function sendKycStatusUpdateEmail(
  userEmail: string,
  userName: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string
) {
  if (status === "APPROVED") {
    return await sendKycApprovedEmail(userEmail, userName);
  } else if (status === "REJECTED" && rejectionReason) {
    return await sendKycRejectedEmail(userEmail, userName, rejectionReason);
  }

  return {
    success: false,
    error: "Invalid status or missing rejection reason",
  };
}
