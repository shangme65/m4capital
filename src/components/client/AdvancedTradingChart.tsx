"use client";

import { useState, useEffect, useRef } from "react";

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TechnicalIndicator {
  rsi: number;
  volume: number;
  trend: "bullish" | "bearish" | "neutral";
}

export default function AdvancedTradingChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicator>({
    rsi: 65.4,
    volume: 1397535,
    trend: "bullish",
  });
  const [currentPrice, setCurrentPrice] = useState(1.39735);
  const [priceChange, setPriceChange] = useState(0.00045);

  // Generate realistic candlestick data
  useEffect(() => {
    const generateCandleData = () => {
      const data: CandleData[] = [];
      let basePrice = 1.3969;
      const now = Date.now();

      for (let i = 0; i < 50; i++) {
        const time = now - (50 - i) * 60000; // 1-minute intervals
        const volatility = 0.0002;

        const open = basePrice + (Math.random() - 0.5) * volatility;
        const close = open + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        const volume = Math.floor(Math.random() * 50000) + 10000;

        data.push({ time, open, high, low, close, volume });
        basePrice = close;
      }

      return data;
    };

    setCandleData(generateCandleData());

    // Update data every 5 seconds to simulate real-time
    const interval = setInterval(() => {
      setCandleData((prev) => {
        const newData = [...prev];
        const lastCandle = newData[newData.length - 1];
        const volatility = 0.0002;

        // Update last candle or add new one
        const newClose = lastCandle.close + (Math.random() - 0.5) * volatility;
        newData[newData.length - 1] = {
          ...lastCandle,
          close: newClose,
          high: Math.max(lastCandle.high, newClose),
          low: Math.min(lastCandle.low, newClose),
          volume: lastCandle.volume + Math.floor(Math.random() * 1000),
        };

        setCurrentPrice(newClose);
        setPriceChange(newClose - lastCandle.open);

        // Update technical indicators
        setIndicators((prev) => ({
          ...prev,
          rsi: Math.max(0, Math.min(100, prev.rsi + (Math.random() - 0.5) * 2)),
          volume: prev.volume + Math.floor(Math.random() * 1000),
          trend: newClose > lastCandle.open ? "bullish" : "bearish",
        }));

        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Draw the chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candleData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Chart dimensions
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding - 100; // Reserve space for volume

    // Price range
    const prices = candleData.flatMap((d) => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Volume range
    const volumes = candleData.map((d) => d.volume);
    const maxVolume = Math.max(...volumes);

    // Draw grid
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = padding + (chartHeight * i) / 10;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (chartWidth * i) / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - 100);
      ctx.stroke();
    }

    // Draw candlesticks
    const candleWidth = (chartWidth / candleData.length) * 0.8;

    candleData.forEach((candle, index) => {
      const x = padding + (index * chartWidth) / candleData.length;
      const openY =
        padding + ((maxPrice - candle.open) / priceRange) * chartHeight;
      const closeY =
        padding + ((maxPrice - candle.close) / priceRange) * chartHeight;
      const highY =
        padding + ((maxPrice - candle.high) / priceRange) * chartHeight;
      const lowY =
        padding + ((maxPrice - candle.low) / priceRange) * chartHeight;

      const isGreen = candle.close > candle.open;

      // Draw wick
      ctx.strokeStyle = isGreen ? "#10B981" : "#EF4444";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = isGreen ? "#10B981" : "#EF4444";
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      ctx.fillRect(x, bodyY, candleWidth, bodyHeight || 1);

      // Draw volume bars
      const volumeHeight = (candle.volume / maxVolume) * 80;
      const volumeY = height - 90;
      ctx.fillStyle = isGreen ? "#10B98140" : "#EF444440";
      ctx.fillRect(x, volumeY - volumeHeight, candleWidth, volumeHeight);
    });

    // Draw price labels
    ctx.fillStyle = "#D1D5DB";
    ctx.font = "12px monospace";
    ctx.textAlign = "right";

    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * i) / 5;
      const y = height - 100 - (chartHeight * i) / 5;
      ctx.fillText(price.toFixed(5), padding - 5, y + 4);
    }

    // Draw current price line
    const currentPriceY =
      padding + ((maxPrice - currentPrice) / priceRange) * chartHeight;
    ctx.strokeStyle = priceChange >= 0 ? "#10B981" : "#EF4444";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, currentPriceY);
    ctx.lineTo(width - padding, currentPriceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw current price label
    ctx.fillStyle = priceChange >= 0 ? "#10B981" : "#EF4444";
    ctx.fillRect(width - padding - 80, currentPriceY - 10, 75, 20);
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(
      currentPrice.toFixed(5),
      width - padding - 42.5,
      currentPriceY + 4
    );
  }, [candleData, currentPrice, priceChange]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">$</span>
            </div>
            <select className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1">
              <option>USD/CAD (OTC)</option>
              <option>EUR/USD</option>
              <option>GBP/JPY</option>
              <option>BTC/USD</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-400">Price:</span>
            <span
              className={`font-mono ${
                priceChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {currentPrice.toFixed(5)}
            </span>
            <span
              className={`font-mono text-sm ${
                priceChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {priceChange >= 0 ? "+" : ""}
              {(priceChange * 100).toFixed(3)}%
            </span>
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">RSI(14):</span>
            <span
              className={`font-mono ${
                indicators.rsi > 70
                  ? "text-red-400"
                  : indicators.rsi < 30
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {indicators.rsi.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Volume:</span>
            <span className="font-mono text-blue-400">
              {indicators.volume.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Trend:</span>
            <div
              className={`w-3 h-3 rounded-full ${
                indicators.trend === "bullish"
                  ? "bg-green-400"
                  : indicators.trend === "bearish"
                  ? "bg-red-400"
                  : "bg-yellow-400"
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full"
          style={{ background: "#111827" }}
        />

        {/* Chart Controls */}
        <div className="absolute bottom-4 left-4 flex space-x-2">
          {["1m", "5m", "15m", "1h", "4h", "1d"].map((timeframe) => (
            <button
              key={timeframe}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700 border border-gray-600"
            >
              {timeframe}
            </button>
          ))}
        </div>

        {/* RSI Indicator */}
        <div className="absolute bottom-4 right-4 bg-gray-800/90 rounded-lg p-3 border border-gray-600">
          <div className="text-xs text-gray-400 mb-2">RSI (14)</div>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-gray-700 rounded">
              <div
                className={`h-full rounded ${
                  indicators.rsi > 70
                    ? "bg-red-400"
                    : indicators.rsi < 30
                    ? "bg-green-400"
                    : "bg-yellow-400"
                }`}
                style={{ width: `${indicators.rsi}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono text-white">
              {indicators.rsi.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
