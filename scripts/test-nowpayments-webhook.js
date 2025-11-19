#!/usr/bin/env node

/**
 * Test NowPayments Webhook Locally
 *
 * This script simulates a NowPayments webhook call to test your payment flow
 * without needing to make a real Bitcoin transaction.
 *
 * Usage:
 * 1. Create a payment in your app and note the deposit ID
 * 2. Run: node scripts/test-nowpayments-webhook.js <DEPOSIT_ID>
 */

const crypto = require("crypto");
const https = require("https");
require("dotenv").config();

// Get deposit ID from command line
const depositId = process.argv[2];

if (!depositId) {
  console.error("❌ Error: Please provide a deposit ID");
  console.log("\nUsage: node scripts/test-nowpayments-webhook.js <DEPOSIT_ID>");
  console.log("\nTo find your deposit ID:");
  console.log("1. Create a payment in the app");
  console.log("2. Check browser console or run: npx prisma studio");
  console.log("3. Look in the Deposit table for the latest entry\n");
  process.exit(1);
}

// Your IPN secret from .env
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

if (!IPN_SECRET) {
  console.error("❌ Error: NOWPAYMENTS_IPN_SECRET not found in .env file");
  process.exit(1);
}

// Test webhook payload - simulates a successful payment
const payload = {
  payment_id: `test-payment-${Date.now()}`,
  payment_status: "finished", // Change to 'confirming', 'waiting', 'failed', etc. to test different statuses
  pay_address: "30jJZVK7wBYDCFRLXSFvYE6nFPVNLxHeHe",
  price_amount: 50,
  price_currency: "usd",
  pay_amount: 0.00047916,
  pay_currency: "btc",
  order_id: depositId,
  order_description: "Test Deposit",
  actually_paid: 0.00047916,
  outcome_amount: 50,
  outcome_currency: "usd",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Generate signature (NowPayments uses HMAC-SHA512)
function generateSignature(payload, secret) {
  // Sort the payload keys alphabetically as NowPayments does
  const sortedPayload = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto
    .createHmac("sha512", secret)
    .update(sortedPayload)
    .digest("hex");
}

const signature = generateSignature(payload, IPN_SECRET);
const payloadString = JSON.stringify(payload);

console.log("\n🔐 Generated Webhook Signature");
console.log("═══════════════════════════════════════════════════════════\n");
console.log("Deposit ID:", depositId);
console.log("Payment Status:", payload.payment_status);
console.log("Signature:", signature);
console.log("\n═══════════════════════════════════════════════════════════\n");

// Test different server locations
const servers = [
  { name: "localhost:3000", hostname: "localhost", port: 3000 },
  { name: "localhost:3001", hostname: "localhost", port: 3001 },
];

console.log("🚀 Testing webhook endpoint...\n");

// Function to test a server
function testServer(server) {
  return new Promise((resolve) => {
    const options = {
      hostname: server.hostname,
      port: server.port,
      path: "/api/payment/webhook",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payloadString),
        "x-nowpayments-sig": signature,
      },
    };

    console.log(`Testing ${server.name}...`);

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${server.name}: SUCCESS (${res.statusCode})`);
          console.log("   Response:", data.substring(0, 100));
        } else {
          console.log(`⚠️  ${server.name}: ${res.statusCode}`);
          console.log("   Response:", data.substring(0, 100));
        }
        resolve();
      });
    });

    req.on("error", (e) => {
      console.log(`❌ ${server.name}: ${e.message}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`⏱️  ${server.name}: Timeout`);
      req.destroy();
      resolve();
    });

    req.write(payloadString);
    req.end();
  });
}

// Test localhost with http (development)
function testLocalhost() {
  const http = require("http");

  return new Promise((resolve) => {
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

    console.log(`Testing localhost:3000 (HTTP)...`);

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("\n📊 Webhook Response");
        console.log(
          "═══════════════════════════════════════════════════════════"
        );
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data}`);
        console.log(
          "═══════════════════════════════════════════════════════════\n"
        );

        if (res.statusCode === 200) {
          console.log("✅ Webhook test successful!");
          console.log("\n💡 Next steps:");
          console.log("1. Check your browser - the payment should update");
          console.log("2. Check Prisma Studio: npx prisma studio");
          console.log(
            "3. Look at the Deposit table - status should be COMPLETED"
          );
          console.log(
            "4. Check the User table - balance should be increased\n"
          );
        } else {
          console.log("❌ Webhook test failed");
          console.log("\n💡 Troubleshooting:");
          console.log("1. Make sure your dev server is running: npm run dev");
          console.log("2. Check the deposit ID is correct");
          console.log("3. Check server logs for errors");
          console.log("4. Verify IPN_SECRET matches your .env file\n");
        }
        resolve();
      });
    });

    req.on("error", (e) => {
      console.log(`\n❌ Connection failed: ${e.message}`);
      console.log("\n💡 Make sure your Next.js server is running:");
      console.log("   npm run dev\n");
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`\n⏱️  Request timeout`);
      console.log("Server might not be running or is slow to respond\n");
      req.destroy();
      resolve();
    });

    req.write(payloadString);
    req.end();
  });
}

// Main execution
(async () => {
  console.log("📋 Webhook Payload:");
  console.log(JSON.stringify(payload, null, 2));
  console.log("\n");

  await testLocalhost();
})();
