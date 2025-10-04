"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function TradePage() {
  // Initialize the ticker and simple interactions after DOM is ready
  useEffect(() => {
    // No-op for now; most UI is static. Chart is handled by ECharts init below.
  }, []);

  return (
    <div className="bg-gray-900 text-white overflow-x-hidden">
      {/* Head-like scripts and styles */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.5.0/echarts.min.js"
        strategy="beforeInteractive"
      />

      {/* Top bar with balances */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-white">m4capital</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <span className="text-white font-medium">Trade</span>
                <span className="text-gray-300">Markets</span>
                <span className="text-gray-300">Analysis</span>
                <span className="text-gray-300">Education</span>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Balance:</span>
                  <span className="text-green-400 font-semibold">
                    $125,847.32
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Equity:</span>
                  <span className="text-white font-semibold">$127,234.18</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">P&L:</span>
                  <span className="text-green-400 font-semibold">
                    +$1,386.86
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm">U</span>
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  John Mitchell
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Price ticker */}
      <div className="bg-gray-800 border-b border-gray-700 overflow-hidden">
        <div className="animate-[scroll-left_30s_linear_infinite] flex items-center gap-8 py-2 whitespace-nowrap text-sm">
          {[
            "EUR/USD 1.0845 +0.0012",
            "GBP/USD 1.2634 -0.0023",
            "USD/JPY 149.82 +0.45",
            "AUD/USD 0.6789 -0.0015",
            "USD/CAD 1.3456 +0.0008",
            "NZD/USD 0.6123 -0.0009",
            "EUR/GBP 0.8589 +0.0007",
          ].map((t, i) => {
            const [pair, price, change] = t.split(" ");
            const positive = change?.startsWith("+") ?? false;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gray-400">{pair}</span>
                <span
                  className={`${
                    positive ? "text-green-400" : "text-red-400"
                  } font-semibold`}
                >
                  {price}
                </span>
                <span className={positive ? "text-green-400" : "text-red-400"}>
                  {change}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex h-[calc(100vh-6rem)]">
        {/* Left sidebar: pairs */}
        <aside className="w-80 bg-gray-800 border-r border-gray-700 hidden xl:flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Currency Pairs</h2>
              <button className="text-gray-400 hover:text-white">★</button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search pairs..."
                className="w-full bg-gray-700 border border-gray-600 rounded-[8px] px-3 py-2 text-sm pl-10"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔎</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Major pairs */}
            <section>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Major Pairs
              </h3>
              <div className="space-y-2">
                {[
                  {
                    p: "EUR/USD",
                    name: "Euro / US Dollar",
                    px: "1.0845",
                    chg: "+0.11%",
                    up: true,
                  },
                  {
                    p: "GBP/USD",
                    name: "British Pound / US Dollar",
                    px: "1.2634",
                    chg: "-0.18%",
                    up: false,
                  },
                  {
                    p: "USD/JPY",
                    name: "US Dollar / Japanese Yen",
                    px: "149.82",
                    chg: "+0.30%",
                    up: true,
                  },
                  {
                    p: "USD/CHF",
                    name: "US Dollar / Swiss Franc",
                    px: "0.8923",
                    chg: "-0.13%",
                    up: false,
                  },
                ].map((r) => (
                  <div
                    key={r.p}
                    className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-[8px] cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{r.p}</div>
                      <div className="text-xs text-gray-400">{r.name}</div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`${
                          r.up ? "text-green-400" : "text-red-400"
                        } font-semibold`}
                      >
                        {r.px}
                      </div>
                      <div
                        className={`text-xs ${
                          r.up ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {r.chg}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Minor pairs */}
            <section>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Minor Pairs
              </h3>
              <div className="space-y-2">
                {[
                  {
                    p: "EUR/GBP",
                    name: "Euro / British Pound",
                    px: "0.8589",
                    chg: "+0.08%",
                    up: true,
                  },
                  {
                    p: "EUR/JPY",
                    name: "Euro / Japanese Yen",
                    px: "162.45",
                    chg: "-0.07%",
                    up: false,
                  },
                  {
                    p: "GBP/JPY",
                    name: "British Pound / Japanese Yen",
                    px: "189.23",
                    chg: "+0.12%",
                    up: true,
                  },
                ].map((r) => (
                  <div
                    key={r.p}
                    className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-[8px] cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{r.p}</div>
                      <div className="text-xs text-gray-400">{r.name}</div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`${
                          r.up ? "text-green-400" : "text-red-400"
                        } font-semibold`}
                      >
                        {r.px}
                      </div>
                      <div
                        className={`text-xs ${
                          r.up ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {r.chg}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Exotic pairs */}
            <section>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Exotic Pairs
              </h3>
              <div className="space-y-2">
                {[
                  {
                    p: "USD/TRY",
                    name: "US Dollar / Turkish Lira",
                    px: "28.45",
                    chg: "-0.25%",
                    up: false,
                  },
                  {
                    p: "EUR/SEK",
                    name: "Euro / Swedish Krona",
                    px: "11.67",
                    chg: "+0.15%",
                    up: true,
                  },
                ].map((r) => (
                  <div
                    key={r.p}
                    className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-[8px] cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{r.p}</div>
                      <div className="text-xs text-gray-400">{r.name}</div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`${
                          r.up ? "text-green-400" : "text-red-400"
                        } font-semibold`}
                      >
                        {r.px}
                      </div>
                      <div
                        className={`text-xs ${
                          r.up ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {r.chg}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col">
          {/* Pair header and timeframe pills */}
          <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">EUR/USD</h1>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-400">
                  1.0845
                </span>
                <span className="text-green-400 text-sm">+0.0012 (+0.11%)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {["1M", "5M", "15M", "1H", "4H", "1D"].map((tf) => (
                <button
                  key={tf}
                  className={`px-3 py-1 ${
                    tf === "15M"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-700 hover:bg-gray-600"
                  } rounded-[8px] text-xs whitespace-nowrap`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 p-4">
            <div className="bg-gray-800 rounded-[8px] h-96 mb-4">
              <div id="trading-chart" className="w-full h-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Order panel */}
              <div className="bg-gray-800 rounded-[8px] p-4">
                <h3 className="text-lg font-semibold mb-4">Place Order</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-[8px] py-2 text-sm font-medium whitespace-nowrap">
                      Market Order
                    </button>
                    <button className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-[8px] py-2 text-sm font-medium whitespace-nowrap">
                      Pending Order
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Volume
                      </label>
                      <input
                        type="number"
                        defaultValue={0.1}
                        step={0.01}
                        className="w-full bg-gray-700 border border-gray-600 rounded-[8px] px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Leverage
                      </label>
                      <select className="w-full bg-gray-700 border border-gray-600 rounded-[8px] px-3 py-2 text-sm pr-8">
                        <option>1:100</option>
                        <option>1:200</option>
                        <option>1:500</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Stop Loss
                      </label>
                      <input
                        type="number"
                        placeholder="1.0800"
                        step={0.0001}
                        className="w-full bg-gray-700 border border-gray-600 rounded-[8px] px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Take Profit
                      </label>
                      <input
                        type="number"
                        placeholder="1.0900"
                        step={0.0001}
                        className="w-full bg-gray-700 border border-gray-600 rounded-[8px] px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="bg-green-600 hover:bg-green-700 rounded-[8px] py-3 font-semibold whitespace-nowrap">
                      BUY 1.0845
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 rounded-[8px] py-3 font-semibold whitespace-nowrap">
                      SELL 1.0843
                    </button>
                  </div>
                </div>
              </div>

              {/* Indicators panel */}
              <div className="bg-gray-800 rounded-[8px] p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Technical Indicators
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      name: "RSI (14)",
                      value: "65.2",
                      color: "text-yellow-400",
                      on: true,
                    },
                    {
                      name: "MACD",
                      value: "Bullish",
                      color: "text-green-400",
                      on: true,
                    },
                    {
                      name: "Moving Average (20)",
                      value: "1.0834",
                      color: "text-blue-400",
                      on: false,
                    },
                    {
                      name: "Bollinger Bands",
                      value: "Active",
                      color: "text-purple-400",
                      on: false,
                    },
                  ].map((ind) => (
                    <div
                      key={ind.name}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{ind.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`${ind.color} text-sm`}>
                          {ind.value}
                        </span>
                        <label className="relative inline-block w-11 h-6">
                          <input
                            type="checkbox"
                            defaultChecked={ind.on}
                            className="sr-only peer"
                          />
                          <span className="absolute inset-0 bg-gray-700 rounded-full transition peer-checked:bg-blue-600" />
                          <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom table */}
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <div className="flex items-center gap-4 mb-4">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-[8px] text-sm font-medium whitespace-nowrap">
                Open Positions
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-[8px] text-sm font-medium whitespace-nowrap">
                Pending Orders
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-[8px] text-sm font-medium whitespace-nowrap">
                Order History
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-[8px] text-xs font-medium whitespace-nowrap">
                  Close All Positions
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-2">Symbol</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Volume</th>
                    <th className="text-left py-2">Open Price</th>
                    <th className="text-left py-2">Current Price</th>
                    <th className="text-left py-2">S/L</th>
                    <th className="text-left py-2">T/P</th>
                    <th className="text-left py-2">Profit</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      sym: "EUR/USD",
                      type: "Buy",
                      vol: "0.50",
                      open: "1.0823",
                      cur: "1.0845",
                      sl: "1.0800",
                      tp: "1.0900",
                      p: "+110.00",
                      up: true,
                    },
                    {
                      sym: "GBP/USD",
                      type: "Sell",
                      vol: "0.30",
                      open: "1.2650",
                      cur: "1.2634",
                      sl: "1.2680",
                      tp: "1.2600",
                      p: "+48.00",
                      up: true,
                    },
                    {
                      sym: "USD/JPY",
                      type: "Buy",
                      vol: "0.25",
                      open: "149.45",
                      cur: "149.82",
                      sl: "149.00",
                      tp: "150.50",
                      p: "+62.00",
                      up: true,
                    },
                  ].map((row) => (
                    <tr key={row.sym} className="border-b border-gray-700">
                      <td className="py-3">{row.sym}</td>
                      <td className="py-3">
                        <span
                          className={
                            row.type === "Buy"
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {row.type}
                        </span>
                      </td>
                      <td className="py-3">{row.vol}</td>
                      <td className="py-3">{row.open}</td>
                      <td className="py-3">{row.cur}</td>
                      <td className="py-3">{row.sl}</td>
                      <td className="py-3">{row.tp}</td>
                      <td
                        className={`py-3 ${
                          row.up ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        ${row.p}
                      </td>
                      <td className="py-3">
                        <button className="text-red-400 hover:text-red-300">
                          ✖
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Right sidebar: news */}
        <aside className="w-80 bg-gray-800 border-l border-gray-700 hidden lg:flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">Market News</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {[
              {
                level: "High",
                color: "bg-red-500",
                title: "ECB Interest Rate Decision",
                time: "2 min ago",
                desc: "European Central Bank maintains rates at 4.50%, signaling cautious approach to monetary policy.",
              },
              {
                level: "Medium",
                color: "bg-yellow-500",
                title: "US Employment Data",
                time: "15 min ago",
                desc: "Non-farm payrolls exceed expectations with 250K jobs added in September.",
              },
              {
                level: "Low",
                color: "bg-green-500",
                title: "German Manufacturing PMI",
                time: "1 hour ago",
                desc: "Manufacturing activity shows signs of recovery with PMI rising to 48.2.",
              },
              {
                level: "High",
                color: "bg-red-500",
                title: "Fed Chair Powell Speech",
                time: "2 hours ago",
                desc: "Powell emphasizes data-dependent approach to future rate decisions.",
              },
            ].map((n, i) => (
              <div key={i} className="bg-gray-700 rounded-[8px] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 ${n.color} rounded-full`} />
                  <span className="text-xs text-gray-400">
                    {n.level} Impact
                  </span>
                  <span className="text-xs text-gray-400">{n.time}</span>
                </div>
                <h4 className="font-medium mb-1">{n.title}</h4>
                <p className="text-sm text-gray-300">{n.desc}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ECharts init */}
      <Script id="echarts-init" strategy="afterInteractive">
        {`
          const chartDom = document.getElementById('trading-chart');
          if (chartDom && window.echarts) {
            const myChart = window.echarts.init(chartDom);
            const dates = [];
            const data = [];
            const basePrice = 1.0845;
            for (let i = 0; i < 100; i++) {
              const date = new Date();
              date.setMinutes(date.getMinutes() - (100 - i) * 15);
              dates.push(date.toLocaleTimeString());
              const open = basePrice + (Math.random() - 0.5) * 0.01;
              const close = open + (Math.random() - 0.5) * 0.005;
              const high = Math.max(open, close) + Math.random() * 0.003;
              const low = Math.min(open, close) - Math.random() * 0.003;
              data.push([open.toFixed(4), close.toFixed(4), low.toFixed(4), high.toFixed(4)]);
            }
            const option = {
              animation: false,
              grid: { left: 0, right: 0, top: 20, bottom: 0, containLabel: true },
              xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: '#6b7280' } }, axisLabel: { color: '#9ca3af', fontSize: 10 } },
              yAxis: { type: 'value', scale: true, axisLine: { lineStyle: { color: '#6b7280' } }, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { lineStyle: { color: '#374151' } } },
              series: [{ type: 'candlestick', data: data, itemStyle: { color: '#10b981', color0: '#ef4444', borderColor: '#10b981', borderColor0: '#ef4444' } }],
              tooltip: { trigger: 'axis', backgroundColor: 'rgba(31,41,55,0.9)', borderColor: '#6b7280', textStyle: { color: '#f9fafb' } }
            };
            myChart.setOption(option);
            setInterval(() => {
              const lastData = data[data.length - 1];
              const newOpen = parseFloat(lastData[1]);
              const newClose = newOpen + (Math.random() - 0.5) * 0.002;
              const newHigh = Math.max(newOpen, newClose) + Math.random() * 0.001;
              const newLow = Math.min(newOpen, newClose) - Math.random() * 0.001;
              data.shift();
              dates.shift();
              const newDate = new Date();
              dates.push(newDate.toLocaleTimeString());
              data.push([newOpen.toFixed(4), newClose.toFixed(4), newLow.toFixed(4), newHigh.toFixed(4)]);
              myChart.setOption({ xAxis: { data: dates }, series: [{ data: data }] });
            }, 3000);
          }
        `}
      </Script>
    </div>
  );
}
