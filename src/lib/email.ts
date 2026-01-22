import nodemailer from "nodemailer";

// Check if using SendGrid
const isSendGrid = process.env.SMTP_HOST?.includes("sendgrid");

// Create reusable transporter object using SMTP transport (fallback)
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send email via SendGrid Web API (more reliable than SMTP)
async function sendViaSendGrid({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: true; messageId: string | null }> {
  const apiKey = process.env.SMTP_PASS; // SendGrid API key
  const fromEmail = process.env.SMTP_FROM || "noreply@m4capital.online";
  const fromName = process.env.SMTP_FROM_NAME || "M4 Capital";

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail, name: fromName },
      subject,
      content: [
        ...(text ? [{ type: "text/plain", value: text }] : []),
        { type: "text/html", value: html },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
  }

  return { success: true as const, messageId: response.headers.get("x-message-id") };
}

// Verify connection configuration
export async function verifyEmailConnection() {
  if (isSendGrid) {
    console.log("Using SendGrid Web API for emails");
    return true;
  }
  try {
    await transporter.verify();
    console.log("Email server is ready to send messages");
    return true;
  } catch (error) {
    console.error("Email server connection error:", error);
    return false;
  }
}

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<
  | { success: true; messageId: string | null }
  | { success: false; error: unknown }
> {
  try {
    // Use SendGrid Web API if configured (more reliable than SMTP)
    if (isSendGrid) {
      const result = await sendViaSendGrid({ to, subject, html, text });
      console.log("Email sent via SendGrid API:", result.messageId);
      return result;
    }

    // Fallback to SMTP
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "M4 Capital"}" <${
        process.env.SMTP_FROM || process.env.SMTP_USER
      }>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
