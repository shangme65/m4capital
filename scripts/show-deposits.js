#!/usr/bin/env node

/**
 * Show Latest Deposits
 * Quick view of all recent deposits and their status
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("\n📊 Latest Deposits\n");
  console.log(
    "═══════════════════════════════════════════════════════════════════════════════\n"
  );

  try {
    const deposits = await prisma.deposit.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            email: true,
            balance: true,
          },
        },
      },
    });

    if (deposits.length === 0) {
      console.log("No deposits found!\n");
      console.log("💡 Create a payment in your app first:");
      console.log("   1. Go to http://localhost:3000/dashboard");
      console.log('   2. Click "Deposit Funds"');
      console.log("   3. Select Bitcoin and enter an amount\n");
      process.exit(0);
    }

    deposits.forEach((deposit, index) => {
      const statusEmoji =
        {
          PENDING: "⏳",
          PROCESSING: "🔄",
          COMPLETED: "✅",
          FAILED: "❌",
        }[deposit.status] || "❓";

      console.log(`${index + 1}. ${statusEmoji} ${deposit.status}`);
      console.log(`   ID: ${deposit.id}`);
      console.log(`   Amount: $${deposit.amount} ${deposit.currency}`);
      console.log(`   Method: ${deposit.method}`);
      console.log(`   User: ${deposit.user.email}`);
      console.log(`   User Balance: $${deposit.user.balance}`);

      if (deposit.paymentAddress) {
        console.log(`   BTC Address: ${deposit.paymentAddress}`);
      }
      if (deposit.paymentAmount) {
        console.log(`   BTC Amount: ${deposit.paymentAmount}`);
      }
      if (deposit.paymentId) {
        console.log(`   Payment ID: ${deposit.paymentId}`);
      }
      if (deposit.paymentStatus) {
        console.log(`   Payment Status: ${deposit.paymentStatus}`);
      }

      console.log(`   Created: ${deposit.createdAt.toLocaleString()}`);
      console.log(`   Updated: ${deposit.updatedAt.toLocaleString()}`);
      console.log("");
    });

    console.log(
      "═══════════════════════════════════════════════════════════════════════════════\n"
    );

    // Show statistics
    const stats = {
      total: deposits.length,
      pending: deposits.filter((d) => d.status === "PENDING").length,
      processing: deposits.filter((d) => d.status === "PROCESSING").length,
      completed: deposits.filter((d) => d.status === "COMPLETED").length,
      failed: deposits.filter((d) => d.status === "FAILED").length,
    };

    console.log("📈 Statistics:");
    console.log(`   Total: ${stats.total}`);
    console.log(`   ⏳ Pending: ${stats.pending}`);
    console.log(`   🔄 Processing: ${stats.processing}`);
    console.log(`   ✅ Completed: ${stats.completed}`);
    console.log(`   ❌ Failed: ${stats.failed}`);
    console.log("");

    // Show quick test command if there are pending deposits
    const pendingDeposit = deposits.find((d) => d.status === "PENDING");
    if (pendingDeposit) {
      console.log("🧪 Quick Test:");
      console.log(`   node scripts/test-payment-quick.js`);
      console.log(
        "   (This will simulate a successful payment for the latest pending deposit)\n"
      );
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await prisma.$disconnect();
  }
}

main();
