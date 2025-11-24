import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendTelegramMessage,
  sendInlineKeyboard,
  getUserByTelegramId,
  trackTelegramActivity,
} from "@/lib/telegram-bot-helper";
import { generateTransactionReference } from "@/lib/p2p-transfer-utils";
import { generateId } from "@/lib/generate-id";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/commands/send
 * Handle P2P transfer via Telegram
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegramId, chatId, command } = body;

    if (!telegramId || !chatId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user by Telegram ID
    const user = await getUserByTelegramId(BigInt(telegramId));

    if (!user) {
      await sendTelegramMessage(
        chatId,
        "⚠️ *Account Not Linked*\n\nPlease link your M4Capital account first using the `/link` command."
      );
      return NextResponse.json({ success: true });
    }

    // Parse command - format: /send @username or /send email@example.com or /send 1234567890 (account number)
    const parts = command.trim().split(/\s+/);

    if (parts.length < 3) {
      await sendTelegramMessage(
        chatId,
        `💸 *Send Money to Another User*\n\nUsage:\n\`/send @username AMOUNT\`\n\`/send email@example.com AMOUNT\`\n\`/send accountnumber AMOUNT\`\n\nExamples:\n\`/send @victor 100\`\n\`/send victor@example.com 50.50\`\n\`/send 1234567890 25\`\n\n*Note:* Amount will be sent in your preferred currency (${
          user.preferredCurrency || "USD"
        })`
      );
      return NextResponse.json({ success: true });
    }

    let receiverIdentifier = parts[1];
    const amount = parseFloat(parts[2]);
    const description = parts.slice(3).join(" ") || undefined;

    // Remove @ if present
    if (receiverIdentifier.startsWith("@")) {
      receiverIdentifier = receiverIdentifier.substring(1);
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      await sendTelegramMessage(
        chatId,
        "❌ *Invalid Amount*\n\nPlease enter a valid positive number."
      );
      return NextResponse.json({ success: true });
    }

    // Check sender balance
    if (!user.Portfolio) {
      await sendTelegramMessage(
        chatId,
        "⚠️ *No Portfolio Found*\n\nPlease contact support."
      );
      return NextResponse.json({ success: true });
    }

    const senderBalance = parseFloat(user.Portfolio.balance.toString());
    if (senderBalance < amount) {
      await sendTelegramMessage(
        chatId,
        `❌ *Insufficient Balance*\n\nYour balance: ${senderBalance.toFixed(
          2
        )} ${user.preferredCurrency || "USD"}\nRequired: ${amount.toFixed(2)} ${
          user.preferredCurrency || "USD"
        }`
      );
      return NextResponse.json({ success: true });
    }

    // Look up receiver by username, email, or account number
    let receiver = await prisma.user.findFirst({
      where: {
        OR: [
          { linkedTelegramUsername: receiverIdentifier },
          { email: receiverIdentifier },
          { accountNumber: receiverIdentifier },
        ],
        isDeleted: false,
        id: { not: user.id },
      },
      include: { Portfolio: true },
    });

    // If not found by username, try case-insensitive email
    if (!receiver) {
      receiver = await prisma.user.findFirst({
        where: {
          email: {
            equals: receiverIdentifier,
            mode: "insensitive",
          },
          isDeleted: false,
          id: { not: user.id },
        },
        include: { Portfolio: true },
      });
    }

    if (!receiver) {
      await sendTelegramMessage(
        chatId,
        `❌ *User Not Found*\n\nCouldn't find a user with: \`${receiverIdentifier}\`\n\nMake sure:\n• They have linked their Telegram account\n• The username/email/account number is correct\n• They are not the same as you`
      );
      return NextResponse.json({ success: true });
    }

    if (!receiver.Portfolio) {
      await sendTelegramMessage(
        chatId,
        "❌ *Receiver's portfolio not found*\n\nThe recipient's account isn't fully set up."
      );
      return NextResponse.json({ success: true });
    }

    if (!receiver.accountNumber) {
      await sendTelegramMessage(
        chatId,
        "❌ *Receiver's account incomplete*\n\nThe recipient hasn't completed their account setup."
      );
      return NextResponse.json({ success: true });
    }

    if (!user.accountNumber) {
      await sendTelegramMessage(
        chatId,
        "❌ *Your account incomplete*\n\nPlease complete your account setup on the website first."
      );
      return NextResponse.json({ success: true });
    }

    // Generate transaction reference
    const transactionReference = generateTransactionReference();

    // Perform the transfer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from sender
      await tx.portfolio.update({
        where: { id: user.Portfolio!.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // Add to receiver
      await tx.portfolio.update({
        where: { id: receiver!.Portfolio!.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // Create transfer record
      const transfer = await tx.p2PTransfer.create({
        data: {
          id: transactionReference,
          senderId: user.id,
          receiverId: receiver!.id,
          amount: amount,
          currency: user.preferredCurrency || "USD",
          status: "COMPLETED",
          description: description || `Transfer via Telegram`,
          senderAccountNumber: user.accountNumber!,
          receiverAccountNumber: receiver!.accountNumber!,
          receiverEmail: receiver!.email!,
          receiverName: receiver!.name || "Unknown",
          transactionReference,
          processedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create notifications for both users
      await tx.notification.createMany({
        data: [
          {
            id: generateId(),
            userId: user.id,
            type: "TRANSACTION",
            title: "Transfer Sent",
            message: `You sent ${amount.toFixed(2)} ${
              user.preferredCurrency || "USD"
            } to ${receiver!.name || receiver!.email} via Telegram`,
            amount: amount,
            asset: user.preferredCurrency || "USD",
            read: false,
          },
          {
            id: generateId(),
            userId: receiver!.id,
            type: "TRANSACTION",
            title: "Money Received",
            message: `You received ${amount.toFixed(2)} ${
              user.preferredCurrency || "USD"
            } from ${user.name || user.email} via Telegram`,
            amount: amount,
            asset: user.preferredCurrency || "USD",
            read: false,
          },
        ],
      });

      return transfer;
    });

    // Send success message to sender
    await sendTelegramMessage(
      chatId,
      `✅ *Transfer Successful!*\n\n💸 *Amount:* ${amount.toFixed(2)} ${
        user.preferredCurrency || "USD"
      }\n👤 *To:* ${receiver.name || receiver.email}\n📧 *Email:* ${
        receiver.email
      }\n🔢 *Reference:* \`${transactionReference}\`\n\n${
        description ? `📝 *Note:* ${description}\n\n` : ""
      }_Transfer completed via Telegram_`
    );

    // Send notification to receiver if they have Telegram linked
    if (receiver.linkedTelegramId) {
      await sendTelegramMessage(
        Number(receiver.linkedTelegramId),
        `💰 *Money Received!*\n\n✅ You received ${amount.toFixed(2)} ${
          user.preferredCurrency || "USD"
        } from ${user.name || user.email}\n\n${
          description ? `📝 Note: ${description}\n\n` : ""
        }🔢 Reference: \`${transactionReference}\`\n\nUse /balance to check your updated balance.`
      );
    }

    // Track activity
    await trackTelegramActivity(user.id, "/send", {
      telegramId: telegramId.toString(),
      amount,
      receiver: receiver.email,
      currency: user.preferredCurrency || "USD",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling /send command:", error);

    // Try to notify user of error
    try {
      const { chatId } = await req.json();
      await sendTelegramMessage(
        chatId,
        "❌ Transfer failed. Please try again or contact support."
      );
    } catch {}

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
