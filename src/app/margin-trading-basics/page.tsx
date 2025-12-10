"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronUp } from "lucide-react";

export default function MarginTradingBasicsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section with Purple Gradient */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Purple gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #7c3aed 0%, #6d28d9 30%, #5b21b6 60%, #4c1d95 100%)",
          }}
        />

        {/* Chart pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='100' viewBox='0 0 200 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,80 L30,60 L60,70 L90,40 L120,55 L150,30 L180,45 L200,20' stroke='%23ffffff' fill='none' stroke-width='2'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              The Basics of Margin Trading
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Phone Mockup Section - Margin Definition */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            {/* Phone Mockup */}
            <div className="relative">
              {/* Phone Frame */}
              <div className="mx-auto w-72 bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10"></div>

                {/* Screen */}
                <div className="bg-gray-800 rounded-[2.5rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-6 py-2 text-white text-xs">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="px-4 pb-6">
                    {/* Balance */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-400 text-sm">
                        Real account
                      </span>
                      <span className="text-green-400 text-sm">Deposit</span>
                    </div>
                    <div className="text-white text-xl font-bold mb-4">
                      $1215.50
                    </div>

                    {/* Currency Pair */}
                    <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇪🇺🇺🇸</span>
                          <div>
                            <div className="text-white font-medium">EURUSD</div>
                            <div className="text-green-400 text-xs">
                              ▲ Buy • Forex
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">1.07975</div>
                          <div className="text-green-400 text-xs">
                            +1.04 (+0.48%)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trading Parameters */}
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">TIME</span>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-1 bg-gray-600 rounded-full relative">
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full"></div>
                          </div>
                          <span className="text-white">5 min</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">QUANTITY</span>
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 bg-gray-700 rounded text-white">
                            −
                          </button>
                          <span className="text-white px-2">0.001</span>
                          <button className="w-8 h-8 bg-gray-700 rounded text-white">
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">
                          PIP VALUE <span className="text-blue-400">ⓘ</span>
                        </span>
                        <span className="text-white">$0.01</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">
                          MARGIN <span className="text-blue-400">ⓘ</span>
                        </span>
                        <span className="text-white">$0.22</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">LEVERAGE</span>
                        <span className="text-white">1:500</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">EXPIRATION TIME</span>
                        <span className="text-white">15:40</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">COST OF SPREAD</span>
                        <span className="text-white">$0.21</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">
                          SWAP <span className="text-blue-400">ⓘ</span>
                        </span>
                        <span className="text-white">−$0.24</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-white">Buy in 1-click</span>
                        <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Confirm Button */}
                    <button className="w-full mt-4 py-3 bg-green-500 text-white font-bold rounded-lg">
                      Confirm BUY
                    </button>
                  </div>

                  {/* Home Indicator */}
                  <div className="flex justify-center pb-2">
                    <div className="w-32 h-1 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Annotation Circles */}
              <div className="absolute left-0 top-[35%] flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-orange-500 bg-transparent"></div>
              </div>
              <div className="absolute left-0 top-[42%] flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-orange-500 bg-transparent"></div>
              </div>
              <div className="absolute left-0 top-[58%] flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-orange-500 bg-transparent"></div>
              </div>
              <div className="absolute left-0 top-[72%] flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-orange-500 bg-transparent"></div>
              </div>

              {/* Tooltip */}
              <div className="absolute left-4 top-[48%] bg-gray-800/95 text-white p-4 rounded-lg max-w-xs shadow-lg">
                <p className="text-sm">
                  <span className="font-bold">Margin</span> is the amount of a
                  trader&apos;s funds required to open a leveraged position,
                  calculated in the base currency.
                </p>
                <Link
                  href="#margin-section"
                  className="text-orange-500 text-sm mt-2 inline-block"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spreads Section */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Spreads</h2>

            <p className="text-gray-700 mb-4">
              A spread is the difference between the bid price and the ask
              price. Spreads differ from broker to broker.
            </p>
            <p className="text-gray-700 mb-6">
              The following formula is used to calculate the spread on the
              M4Capital platform:
            </p>

            {/* Formula Box */}
            <div className="bg-gray-100 rounded-lg p-6 mb-8">
              <p className="text-center text-gray-800">
                <span className="font-bold">Cost of spread</span> = Lot size ×
                Contract size × Spread
              </p>
            </div>

            {/* Example */}
            <h3 className="font-bold text-gray-900 mb-4">Example</h3>
            <div className="space-y-2 text-gray-700">
              <p>EUR/USD Ask: 1.13462 Bid: 1.13455</p>
              <p>Spread: 1.13462 - 1.13455 = 0.00007</p>
              <p>Trade size: 2 lots</p>
              <p>
                Contract size: 100.000 units of the base currency (=200,000 EUR)
              </p>
              <p className="font-bold">
                EUR/USD cost of spread = (1.13462 - 1.13455) × 2 × 100.000 = 14
                USD
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Swaps Section */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Swaps</h2>

            <p className="text-gray-700 mb-4">
              A swap is an interest charge that a trader must pay to a broker
              for holding positions overnight.
            </p>
            <p className="text-gray-700 mb-4">
              Swaps arise from the difference in interest rates of currencies
              plus the broker&apos;s administrative fee. In forex trading, you
              borrow one currency in order to buy another. A swap depends on
              whether you buy a currency with a higher or lower interest rate
              compared to that of the currency you borrow.
            </p>
            <p className="text-gray-700 mb-4">
              Swaps can be both positive and negative.
            </p>
            <p className="text-gray-700 mb-6">
              If you buy a currency with a higher interest rate than the one you
              are borrowing, you will get a positive swap. Let&apos;s consider
              the following example.
            </p>

            {/* Example */}
            <h3 className="font-bold text-gray-900 mb-4">Example</h3>
            <div className="space-y-2 text-gray-700 mb-4">
              <p>The American interest rate is 1.75%.</p>
              <p>Australia&apos;s interest rate is 0.75%.</p>
              <p>The administrative fee is 0.25%.</p>
            </div>
            <p className="text-gray-700 mb-4">
              If you open a long position on the USD/AUD pair,{" "}
              <span className="font-bold">
                a swap of 0.75% will be credited to your account
              </span>
              , as the currency you buy (USD) has a higher interest rate than
              the currency you borrow (AUD).
            </p>
            <p className="text-gray-700">
              If you open a short position on the same currency pair,{" "}
              <span className="font-bold">
                a swap of 1.25% will be debited from your account
              </span>{" "}
              because the currency you borrow (USD) has a higher interest rate
              than the currency you buy (AUD).
            </p>
          </div>
        </div>
      </section>

      {/* Margin Section */}
      <section
        id="margin-section"
        className="py-12 bg-white border-t border-gray-100"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Margin</h2>

            <p className="text-gray-700 mb-4">
              Margin is the amount of a trader&apos;s funds required to open a
              leveraged position. Margin allows you to trade with leverage,
              which is essentially using borrowed funds from a broker in order
              to increase the size of your trades.
            </p>
            <p className="text-gray-700 mb-6">
              To calculate a margin on the M4Capital platform, use the following
              formula:
            </p>

            {/* Formula Box */}
            <div className="bg-gray-100 rounded-lg p-6 mb-8">
              <p className="text-center text-gray-800">
                <span className="font-bold">Margin</span> = Lot size × Contract
                size / Leverage
              </p>
            </div>

            {/* Example */}
            <h3 className="font-bold text-gray-900 mb-4">Example</h3>
            <p className="text-gray-700 mb-4">
              You intend to buy 0.001 lots (1,000 units) of the EUR/USD currency
              pair with a 1:500 leverage. The margin required to open this
              trading position is 0.2 EUR. Check out the detailed calculations
              below:
            </p>
            <div className="space-y-2 text-gray-700 mb-4">
              <p>Currency pair: EUR/USD</p>
              <p>Lot size: 0.001 lot</p>
              <p>Leverage: 1:500</p>
              <p>Contract size: 100,000 units of the base currency</p>
              <p className="font-bold">
                Margin = 0.001 × 100,000 / 500 = 0.2 EUR
              </p>
            </div>
            <p className="text-gray-700">
              <span className="font-bold">Please note</span> that conversion may
              occur if your account currency is different from the base
              currency.
            </p>
          </div>
        </div>
      </section>

      {/* Leverage Section */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Leverage</h2>

            <p className="text-gray-700 mb-6">
              Leverage allows you to trade positions larger than the amount of
              capital you have. Leverage maximizes profits, but it also
              maximizes losses.
            </p>

            {/* Example */}
            <h3 className="font-bold text-gray-900 mb-4">Example</h3>
            <p className="text-gray-700 mb-4">
              Let&apos;s assume you have deposited $1,000 into your account and
              are using a 1:500 leverage. In this case, your buying power will
              increase by 500 times, to $500,000, which means you can place a
              trade with a value of $500,000.
            </p>
            <p className="text-gray-700 mb-4">
              Please note that leverage varies for different assets.
            </p>
            <p className="text-gray-700">
              <Link
                href="/trading-specifications"
                className="text-orange-500 hover:underline"
              >
                Check out maximum leverage and margin requirements
              </Link>{" "}
              on the M4Capital platform.
            </p>
          </div>
        </div>
      </section>

      {/* Currency Conversion Section */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-700 mb-6">
              In some cases, currency conversion rates may apply. This is due to
              the fact that each parameter of a trade is denominated in either
              the base currency or the quote currency. The contract size and
              margin are denominated in the base currency, while the payout is
              always calculated in the quote currency. Therefore, currency
              conversion rates may apply to the calculation of margin and
              payouts. If your account currency differs from the quote currency,
              conversions will apply. Let&apos;s look at the following examples
              to understand when currency conversions may be required.
            </p>

            {/* Example 1 */}
            <h3 className="font-bold text-gray-900 mb-4">
              Example 1: Base Currency = Account Currency
            </h3>
            <p className="text-gray-700 mb-6">
              Let&apos;s say your account currency is USD and you are trading
              the USD/JPY currency pair. Conversion does not apply to the margin
              calculation because the base currency (USD) is the same as the
              account currency (USD). Conversion is applied when calculating the
              payout: it is first calculated in JPY, the quote currency, and
              then converted to USD, the account currency.
            </p>

            {/* Example 2 */}
            <h3 className="font-bold text-gray-900 mb-4">
              Example 2: Quote Currency = Account Currency
            </h3>
            <p className="text-gray-700 mb-6">
              Let&apos;s say your account currency is USD and you are trading
              the EUR/USD currency pair. Conversion will be applied to the
              margin calculation because the base currency (EUR) is different
              from the account currency (USD). Conversion doesn&apos;t apply to
              the calculation of payouts because the quote currency (USD) is the
              same as the account currency (USD).
            </p>

            {/* Example 3 */}
            <h3 className="font-bold text-gray-900 mb-4">
              Example 3: No matches
            </h3>
            <p className="text-gray-700">
              Let&apos;s say your account currency is GBP and you are trading
              the AUD/CHF currency pair. Conversion will be applied to the
              margin calculation because the account currency (GBP) is different
              from the base currency (AUD). Conversion is also applied when
              calculating payouts: they are first calculated in CHF, the quote
              currency, and then converted to GBP, the account currency.
            </p>
          </div>
        </div>
      </section>

      {/* Margin Level Section */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Margin level
            </h2>

            <p className="text-gray-700 mb-4">
              The margin level helps you monitor your account health: it shows
              whether everything is going well or not and suggests when you
              should close positions that are not profitable.
            </p>
            <p className="text-gray-700 mb-6">
              To calculate your margin level, use the following formula:
            </p>

            {/* Formula Box */}
            <div className="bg-gray-100 rounded-lg p-6 mb-8">
              <p className="text-center text-gray-800">
                <span className="font-bold">Margin level</span> = Equity /
                Margin × 100%
              </p>
            </div>

            <p className="text-gray-700 mb-8">
              Everything is indicated in the account currency.
            </p>

            {/* Phone Mockup - Account Details */}
            <div className="relative max-w-sm mx-auto mb-8">
              {/* Phone Frame */}
              <div className="mx-auto w-72 bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10"></div>

                {/* Screen */}
                <div className="bg-gray-800 rounded-[2.5rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-6 py-2 text-white text-xs">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="px-4 pb-6">
                    {/* Balance */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-400 text-sm">
                        Real account
                      </span>
                      <span className="text-green-400 text-sm">Deposit</span>
                    </div>
                    <div className="text-white text-xl font-bold mb-4">
                      $1215.50
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto">
                      <span className="text-gray-400 text-lg">+</span>
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded">
                        <span className="text-sm">🇪🇺🇺🇸</span>
                        <span className="text-white text-xs">EUR/USD</span>
                        <span className="text-gray-400">×</span>
                      </div>
                    </div>

                    {/* Account Stats */}
                    <div className="space-y-3 text-sm bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">EQUITY</span>
                        <span className="text-white font-bold">$10,440.50</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">BALANCE</span>
                        <span className="text-white">9,840.50</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">MARGIN</span>
                        <span className="text-white">$2,200.10</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">
                          P/L <span className="text-blue-400">ⓘ</span>
                        </span>
                        <span className="text-green-400">+$1,000.10</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">AVAILABLE</span>
                        <span className="text-green-400">+$7,640.40</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2 mt-4">
                      <button className="flex-1 py-2 bg-gray-700 text-white rounded-lg text-sm">
                        Withdraw
                      </button>
                      <button className="flex-1 py-2 bg-transparent border border-green-500 text-green-500 rounded-lg text-sm">
                        Deposit
                      </button>
                    </div>

                    {/* Practice Account */}
                    <div className="mt-4 text-sm">
                      <span className="text-gray-400">Practice account</span>
                      <span className="text-orange-500 ml-2">$1,300.20</span>
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="flex justify-center pb-2">
                    <div className="w-32 h-1 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Annotation Circles */}
              <div className="absolute left-0 top-[45%] flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-orange-500 bg-transparent"></div>
              </div>
              <div className="absolute left-0 top-[55%] flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-orange-500 bg-transparent"></div>
              </div>
              <div className="absolute left-0 top-[65%] flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-orange-500 bg-transparent"></div>
              </div>

              {/* Tooltip */}
              <div className="absolute left-4 top-[50%] bg-gray-800/95 text-white p-4 rounded-lg max-w-xs shadow-lg">
                <p className="text-sm">
                  <span className="font-bold">Equity</span> = Balance +
                  Unrealized P/L + Swaps
                </p>
                <p className="text-sm mt-2">
                  Here: $8,840.40 + $1,000.10 + $0 = $9,840.50
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Margin Call and Stop Out Section */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Margin call and Stop out
            </h2>

            <h3 className="font-bold text-gray-900 mb-4">Margin Call</h3>
            <p className="text-gray-700 mb-6">
              When a trader&apos;s margin level falls below 100%, the broker
              initiates a procedure known as a margin call. In the event of a
              margin call, the trader is required to either deposit more money
              into his/her account or close losing positions. If the margin
              level falls below 50%, losing positions will be forcibly closed by
              the company.
            </p>

            <h3 className="font-bold text-gray-900 mb-4">Maintenance margin</h3>
            <p className="text-gray-700 mb-6">
              Maintenance margin is the minimum amount of capital a trader must
              have in his or her account in order to keep a leveraged position
              open.
            </p>

            <h3 className="font-bold text-gray-900 mb-4">Stop Out</h3>
            <p className="text-gray-700">
              A stop out is an event that occurs when a trader&apos;s equity is
              not sufficient to maintain open positions; hence they get forcibly
              closed by the broker.
            </p>
          </div>
        </div>
      </section>

      {/* Payment Partners Section */}
      <section className="py-8 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-2xl font-bold text-purple-600">Skrill</div>
            <div className="text-2xl font-bold text-gray-700">volet</div>
            <div className="text-2xl font-bold text-green-600">NETELLER</div>
          </div>
          {/* Pagination dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === 0 ? "bg-orange-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="py-4 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-orange-500">
                Home
              </Link>
              <span className="text-orange-500">▸</span>
              <span className="text-gray-700">
                The Basics of Margin Trading
              </span>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="p-2 border border-orange-500 rounded-full text-orange-500 hover:bg-orange-50 transition-colors"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Risk Warning Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Links */}
            <div className="flex items-center justify-center gap-4 flex-wrap mb-6 text-sm">
              <Link
                href="/terms"
                className="text-gray-600 hover:text-orange-500"
              >
                Terms & Conditions
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="#" className="text-gray-600 hover:text-orange-500">
                Affiliate Program
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-orange-500"
              >
                Contact Us
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/news"
                className="text-gray-600 hover:text-orange-500"
              >
                Our Blog
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="#"
                className="text-gray-600 hover:text-orange-500 flex items-center gap-1"
              >
                <span className="text-yellow-500">👑</span> VIP
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="#" className="text-gray-600 hover:text-orange-500">
                Sitemap
              </Link>
            </div>

            {/* Risk Warning Box */}
            <div className="border border-gray-300 rounded-lg p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-700 rounded-full"></span>
                RISK WARNING:
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The Financial Products offered by the company include Contracts
                for Difference (&apos;CFDs&apos;) and other complex financial
                products. Trading CFDs carries a high level of risk, since
                leverage can work both to your advantage and disadvantage. As a
                result, CFDs may not be suitable for all investors because it is
                possible to lose all of your invested capital. You should never
                invest money that you cannot afford to lose. Before trading in
                the complex financial products offered, please ensure you
                understand the risks involved.
              </p>
            </div>

            <p className="text-gray-500 text-sm mt-6 text-center">
              You are granted limited non-exclusive non-transferable rights to
              use the IP provided on this website for personal and
              non-commercial purposes in relation to the services offered on the
              Website only.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
