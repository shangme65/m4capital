import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Test NOWPayments API connection and credentials
 */
export async function GET() {
  try {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    const isSandbox = process.env.NOWPAYMENTS_SANDBOX === "true";
    const baseUrl = isSandbox
      ? "https://api-sandbox.nowpayments.io/v1"
      : "https://api.nowpayments.io/v1";

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "NOWPAYMENTS_API_KEY is not configured in .env file",
          configured: false,
        },
        { status: 500 }
      );
    }

    // Test 1: Get API status
    const statusResponse = await fetch(`${baseUrl}/status`, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    const statusData = await statusResponse.json();

    if (!statusResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "API Key validation failed",
          statusCode: statusResponse.status,
          details: statusData,
          apiKey: `${apiKey.substring(0, 4)}...${apiKey.substring(
            apiKey.length - 4
          )}`,
          sandbox: isSandbox,
          baseUrl: baseUrl,
        },
        { status: 401 }
      );
    }

    // Test 2: Get available currencies
    const currenciesResponse = await fetch(`${baseUrl}/currencies`, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    const currencies = await currenciesResponse.json();

    // Test 3: Get minimum amount for BTC
    const minAmountResponse = await fetch(
      `${baseUrl}/min-amount?currency_from=btc&currency_to=btc`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    const minAmount = await minAmountResponse.json();

    return NextResponse.json({
      success: true,
      message: "NOWPayments API is working correctly",
      config: {
        sandbox: isSandbox,
        baseUrl: baseUrl,
        apiKey: `${apiKey.substring(0, 4)}...${apiKey.substring(
          apiKey.length - 4
        )}`,
      },
      tests: {
        status: statusData,
        availableCurrencies: currencies.currencies?.slice(0, 10) || [],
        totalCurrencies: currencies.currencies?.length || 0,
        btcMinAmount: minAmount,
      },
    });
  } catch (error) {
    console.error("NOWPayments test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
