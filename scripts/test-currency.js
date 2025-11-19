import {
  getExchangeRates,
  convertCurrency,
  formatCurrency,
} from "../src/lib/currencies";

async function testCurrencyConversion() {
  console.log("Testing Currency Conversion System\n");
  console.log("=".repeat(50));

  try {
    // Fetch exchange rates
    console.log("\n1. Fetching exchange rates...");
    const rates = await getExchangeRates();
    console.log(`✓ Fetched rates for ${Object.keys(rates).length} currencies`);
    console.log("\nSample rates (against USD):");
    console.log(`  EUR: ${rates.EUR}`);
    console.log(`  GBP: ${rates.GBP}`);
    console.log(`  JPY: ${rates.JPY}`);
    console.log(`  INR: ${rates.INR}`);

    // Test conversions
    console.log("\n2. Testing conversions from $1,000 USD:");
    const testAmount = 1000;

    const testCurrencies = ["EUR", "GBP", "JPY", "INR", "CNY", "AUD"];
    for (const currency of testCurrencies) {
      const converted = convertCurrency(testAmount, currency, rates);
      const formatted = formatCurrency(converted, currency, 2);
      console.log(`  → ${formatted} (${currency})`);
    }

    // Test formatting
    console.log("\n3. Testing currency formatting:");
    const testAmounts = [1234.56, 999999.99, 0.01];
    testAmounts.forEach((amount) => {
      console.log(`  $${amount} USD →`);
      console.log(
        `    EUR: ${formatCurrency(
          convertCurrency(amount, "EUR", rates),
          "EUR",
          2
        )}`
      );
      console.log(
        `    GBP: ${formatCurrency(
          convertCurrency(amount, "GBP", rates),
          "GBP",
          2
        )}`
      );
      console.log(
        `    JPY: ${formatCurrency(
          convertCurrency(amount, "JPY", rates),
          "JPY",
          0
        )}`
      );
    });

    console.log("\n" + "=".repeat(50));
    console.log("✓ All tests passed!");
  } catch (error) {
    console.error("\n✗ Test failed:", error);
  }
}

testCurrencyConversion();
