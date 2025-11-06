#!/usr/bin/env node

/**
 * Simple Webhook Tester
 * Finds the latest deposit and simulates a successful payment
 */

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const http = require("http");

const prisma = new PrismaClient();

const IPN_SECRET = "wLsFwNdB4ImHMZGbRekRr9WxhCXOln77"; // From your .env

async function main() {
  console.log("\n🔍 Finding latest deposit...\n");

  try {
    // Get the most recent pending deposit
    const deposit = await prisma.deposit.findFirst({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });

    if (!deposit) {
      console.log("❌ No pending deposits found!");
      console.log("\n💡 Create a payment in your app first:");
      console.log("1. Go to http://localhost:3000/dashboard");
      console.log('2. Click "Deposit Funds"');
      console.log("3. Select Bitcoin and enter an amount");
      console.log("4. Wait for the QR code to appear");
      console.log("5. Then run this script again\n");
      process.exit(0);
    }

    console.log("✅ Found deposit:");
    console.log("   ID:", deposit.id);
    console.log("   Amount:", `$${deposit.amount}`);
    console.log("   User:", deposit.user.email);
    console.log("   Created:", deposit.createdAt);
    console.log("   Payment Address:", deposit.paymentAddress || "N/A");
    console.log("   Bitcoin Amount:", deposit.paymentAmount || "N/A");
    console.log("\n");

    // Create webhook payload
    const payload = {
      payment_id: `test-payment-${Date.now()}`,
      payment_status: "finished",
      pay_address: deposit.paymentAddress || "test-address",
      price_amount: parseFloat(deposit.amount.toString()),
      price_currency: "usd",
      pay_amount: deposit.paymentAmount
        ? parseFloat(deposit.paymentAmount.toString())
        : 0.001,
      pay_currency: "btc",
      order_id: deposit.id,
      order_description: "Test Deposit",
      actually_paid: deposit.paymentAmount
        ? parseFloat(deposit.paymentAmount.toString())
        : 0.001,
      outcome_amount: parseFloat(deposit.amount.toString()),
      outcome_currency: "usd",
    };

    // Generate signature
    const sortedPayload = JSON.stringify(payload, Object.keys(payload).sort());
    const signature = crypto
      .createHmac("sha512", IPN_SECRET)
      .update(sortedPayload)
      .digest("hex");
    const payloadString = JSON.stringify(payload);

    console.log("🔐 Generated webhook signature");
    console.log("\n📤 Sending webhook to localhost:3000...\n");

    // Send webhook
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/payment/webhook",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payloadString),
        "x-nowpayments-sig": signature,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", async () => {
        console.log("📊 Response:", res.statusCode);
        console.log("📄 Data:", data);

        if (res.statusCode === 200) {
          console.log("\n✅ Webhook sent successfully!\n");

          // Check the updated deposit
          const updatedDeposit = await prisma.deposit.findUnique({
            where: { id: deposit.id },
            include: { user: true },
          });

          console.log("📋 Updated Deposit Status:");
          console.log("   Status:", updatedDeposit?.status);
          console.log("   Payment Status:", updatedDeposit?.paymentStatus);
          console.log("\n💰 User Balance:");
          console.log("   Balance:", `$${updatedDeposit?.user.balance || 0}`);
          console.log("\n🎉 Payment simulation complete!");
          console.log("\n💡 Next steps:");
          console.log(
            "1. Open your browser to http://localhost:3000/dashboard"
          );
          console.log("2. The payment page should show success");
          console.log("3. Check your balance - it should be increased");
          console.log("4. Check transaction history\n");
        } else {
          console.log("\n❌ Webhook failed!");
          console.log("💡 Make sure your dev server is running: npm run dev\n");
        }

        await prisma.$disconnect();
      });
    });

    req.on("error", (e) => {
      console.log(`\n❌ Error: ${e.message}`);
      console.log("💡 Make sure your server is running: npm run dev\n");
      prisma.$disconnect();
    });

    req.write(payloadString);
    req.end();
  } catch (error) {
    console.error("❌ Error:", error);
    await prisma.$disconnect();
  }
}

main();
