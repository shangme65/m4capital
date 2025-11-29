"use client";

import { useEffect, useRef, useState, memo } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CurrencyAwareChartProps {
  symbol: string;
  interval?: "1H" | "1D" | "1W" | "1M" | "1Y" | "All";
  height?: number;
}

// Currency symbol mapping
const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    NGN: "₦",
    ZAR: "R",
    KES: "KSh",
    GHS: "₵",
    JPY: "¥",
    CNY: "¥",
    INR: "₹",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF",
    BRL: "R$",
  };
  return symbols[currency] || "$";
};

// Map interval to Binance kline interval
const getKlineInterval = (
  interval: string
): { binanceInterval: string; limit: number } => {
  switch (interval) {
    case "1H":
      return { binanceInterval: "1m", limit: 60 }; // 60 minutes
    case "1D":
      return { binanceInterval: "15m", limit: 96 }; // 15-min candles for 24h
    case "1W":
      return { binanceInterval: "1h", limit: 168 }; // 1-hour candles for 7 days
    case "1M":
      return { binanceInterval: "4h", limit: 180 }; // 4-hour candles for 30 days
    case "1Y":
      return { binanceInterval: "1d", limit: 365 }; // Daily candles for 1 year
    case "All":
      return { binanceInterval: "1w", limit: 200 }; // Weekly candles
    default:
      return { binanceInterval: "15m", limit: 96 };
  }
};

function CurrencyAwareChart({
  symbol,
  interval = "1D",
  height = 320,
}: CurrencyAwareChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    data: ChartDataPoint;
  } | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const { preferredCurrency, convertAmount, formatAmount } = useCurrency();
  const currencySymbol = getCurrencySymbol(preferredCurrency);

  // Track container size changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setContainerWidth(width);
        }
      }
    });

    resizeObserver.observe(container);

    // Initial size with retry for delayed rendering
    const checkWidth = () => {
      const width = container.getBoundingClientRect().width;
      if (width > 0) {
        setContainerWidth(width);
      }
    };

    checkWidth();
    // Retry after a short delay in case container isn't ready
    const retryTimeout = setTimeout(checkWidth, 100);
    const retryTimeout2 = setTimeout(checkWidth, 300);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(retryTimeout);
      clearTimeout(retryTimeout2);
    };
  }, []);

  // Fetch kline data from Binance
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const binanceSymbol = symbol.toUpperCase().includes("USDT")
          ? symbol.toUpperCase()
          : `${symbol.toUpperCase()}USDT`;

        const { binanceInterval, limit } = getKlineInterval(interval);

        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch chart data");
        }

        const data = await response.json();

        if (mounted && Array.isArray(data)) {
          const chartPoints: ChartDataPoint[] = data.map((kline: any[]) => ({
            timestamp: kline[0],
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            close: parseFloat(kline[4]),
          }));
          setChartData(chartPoints);
        }
      } catch (err) {
        console.error("Chart data fetch error:", err);
        if (mounted) {
          setError("Failed to load chart");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Refresh every 30 seconds
    const refreshInterval = setInterval(fetchData, 30000);

    return () => {
      mounted = false;
      clearInterval(refreshInterval);
    };
  }, [symbol, interval]);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || chartData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    // Use containerWidth state if rect.width is 0 (fallback)
    const effectiveWidth = rect.width > 0 ? rect.width : containerWidth;

    // Skip if container has no width yet (not rendered)
    if (effectiveWidth === 0) return;

    canvas.width = effectiveWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${effectiveWidth}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const width = effectiveWidth;
    const chartHeight = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, chartHeight);

    // Convert prices to user's preferred currency
    const convertedData = chartData.map((d) => ({
      ...d,
      open: convertAmount(d.open),
      high: convertAmount(d.high),
      low: convertAmount(d.low),
      close: convertAmount(d.close),
    }));

    // Calculate price range
    const allPrices = convertedData.flatMap((d) => [d.high, d.low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1;
    const padding = priceRange * 0.1;
    const adjustedMin = minPrice - padding;
    const adjustedMax = maxPrice + padding;
    const adjustedRange = adjustedMax - adjustedMin;

    // Chart margins
    const marginLeft = 10;
    const marginRight = 70;
    const marginTop = 20;
    const marginBottom = 30;
    const chartWidth = width - marginLeft - marginRight;
    const drawHeight = chartHeight - marginTop - marginBottom;

    // Helper functions
    const priceToY = (price: number) => {
      return (
        marginTop +
        drawHeight -
        ((price - adjustedMin) / adjustedRange) * drawHeight
      );
    };

    const indexToX = (index: number) => {
      return marginLeft + (index / (convertedData.length - 1)) * chartWidth;
    };

    // Draw 3D effect background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
    bgGradient.addColorStop(0, "rgba(17, 24, 39, 0.95)");
    bgGradient.addColorStop(0.5, "rgba(15, 23, 42, 0.98)");
    bgGradient.addColorStop(1, "rgba(17, 24, 39, 0.95)");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, chartHeight);

    // Draw subtle grid lines
    ctx.strokeStyle = "rgba(55, 65, 81, 0.3)";
    ctx.lineWidth = 0.5;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = marginTop + (i / gridLines) * drawHeight;
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(width - marginRight, y);
      ctx.stroke();
    }

    // Draw price labels on right side
    ctx.fillStyle = "rgba(156, 163, 175, 0.8)";
    ctx.font = "11px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= gridLines; i++) {
      const y = marginTop + (i / gridLines) * drawHeight;
      const price = adjustedMax - (i / gridLines) * adjustedRange;

      // Format price based on magnitude
      let formattedPrice: string;
      if (price >= 1000) {
        formattedPrice = `${currencySymbol}${price.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`;
      } else if (price >= 1) {
        formattedPrice = `${currencySymbol}${price.toFixed(2)}`;
      } else {
        formattedPrice = `${currencySymbol}${price.toFixed(4)}`;
      }

      ctx.fillText(formattedPrice, width - 8, y + 4);
    }

    // Determine if overall trend is up or down
    const isUpTrend =
      convertedData[convertedData.length - 1].close >= convertedData[0].open;
    const lineColor = isUpTrend ? "#22c55e" : "#ef4444";
    const glowColor = isUpTrend
      ? "rgba(34, 197, 94, 0.5)"
      : "rgba(239, 68, 68, 0.5)";

    // Draw area fill with 3D gradient effect
    const areaGradient = ctx.createLinearGradient(
      0,
      marginTop,
      0,
      chartHeight - marginBottom
    );
    if (isUpTrend) {
      areaGradient.addColorStop(0, "rgba(34, 197, 94, 0.4)");
      areaGradient.addColorStop(0.5, "rgba(34, 197, 94, 0.15)");
      areaGradient.addColorStop(1, "rgba(34, 197, 94, 0.02)");
    } else {
      areaGradient.addColorStop(0, "rgba(239, 68, 68, 0.4)");
      areaGradient.addColorStop(0.5, "rgba(239, 68, 68, 0.15)");
      areaGradient.addColorStop(1, "rgba(239, 68, 68, 0.02)");
    }

    ctx.beginPath();
    ctx.moveTo(indexToX(0), priceToY(convertedData[0].close));
    for (let i = 1; i < convertedData.length; i++) {
      ctx.lineTo(indexToX(i), priceToY(convertedData[i].close));
    }
    ctx.lineTo(indexToX(convertedData.length - 1), chartHeight - marginBottom);
    ctx.lineTo(indexToX(0), chartHeight - marginBottom);
    ctx.closePath();
    ctx.fillStyle = areaGradient;
    ctx.fill();

    // Draw glow effect for the line (3D effect)
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw the main price line
    ctx.beginPath();
    ctx.moveTo(indexToX(0), priceToY(convertedData[0].close));
    for (let i = 1; i < convertedData.length; i++) {
      // Smooth curve using quadratic bezier
      const prevX = indexToX(i - 1);
      const prevY = priceToY(convertedData[i - 1].close);
      const currX = indexToX(i);
      const currY = priceToY(convertedData[i].close);
      const cpX = (prevX + currX) / 2;
      ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + currY) / 2);
    }
    // Final point
    const lastX = indexToX(convertedData.length - 1);
    const lastY = priceToY(convertedData[convertedData.length - 1].close);
    ctx.lineTo(lastX, lastY);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Draw current price indicator (glowing dot at the end)
    const dotGradient = ctx.createRadialGradient(
      lastX,
      lastY,
      0,
      lastX,
      lastY,
      12
    );
    dotGradient.addColorStop(0, lineColor);
    dotGradient.addColorStop(0.3, lineColor);
    dotGradient.addColorStop(1, "transparent");
    ctx.fillStyle = dotGradient;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright dot
    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw current price line (dashed)
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "rgba(156, 163, 175, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginLeft, lastY);
    ctx.lineTo(width - marginRight, lastY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw current price box
    const currentPrice = convertedData[convertedData.length - 1].close;
    let priceText: string;
    if (currentPrice >= 1000) {
      priceText = `${currencySymbol}${currentPrice.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } else if (currentPrice >= 1) {
      priceText = `${currencySymbol}${currentPrice.toFixed(2)}`;
    } else {
      priceText = `${currencySymbol}${currentPrice.toFixed(4)}`;
    }

    const boxWidth = ctx.measureText(priceText).width + 16;
    const boxHeight = 22;
    const boxX = width - marginRight + 5;
    const boxY = lastY - boxHeight / 2;

    // 3D price box
    ctx.fillStyle = isUpTrend ? "#22c55e" : "#ef4444";
    ctx.shadowColor = isUpTrend
      ? "rgba(34, 197, 94, 0.5)"
      : "rgba(239, 68, 68, 0.5)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(priceText, boxX + 8, boxY + 15);
  }, [
    chartData,
    height,
    convertAmount,
    currencySymbol,
    preferredCurrency,
    containerWidth,
  ]);

  // Handle mouse move for tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (chartData.length === 0) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    const marginLeft = 10;
    const marginRight = 70;
    const chartWidth = width - marginLeft - marginRight;

    const dataIndex = Math.round(
      ((x - marginLeft) / chartWidth) * (chartData.length - 1)
    );
    const clampedIndex = Math.max(0, Math.min(chartData.length - 1, dataIndex));

    if (clampedIndex >= 0 && clampedIndex < chartData.length) {
      const data = chartData[clampedIndex];
      const pointX =
        marginLeft + (clampedIndex / (chartData.length - 1)) * chartWidth;

      // Calculate Y position
      const allPrices = chartData.flatMap((d) => [d.high, d.low]);
      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);
      const priceRange = maxPrice - minPrice || 1;
      const padding = priceRange * 0.1;
      const adjustedMin = minPrice - padding;
      const adjustedMax = maxPrice + padding;
      const adjustedRange = adjustedMax - adjustedMin;
      const marginTop = 20;
      const marginBottom = 30;
      const drawHeight = height - marginTop - marginBottom;
      const pointY =
        marginTop +
        drawHeight -
        ((convertAmount(data.close) - convertAmount(adjustedMin)) /
          convertAmount(adjustedRange)) *
          drawHeight;

      setHoveredPoint({ x: pointX, y: pointY, data });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        height: `${height}px`,
        background:
          "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
        boxShadow:
          "0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 10px 20px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* 3D highlight effect */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% -20%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)",
        }}
      />

      {/* Chart canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            left: hoveredPoint.x,
            top: hoveredPoint.y - 70,
            transform: "translateX(-50%)",
          }}
        >
          <div
            className="px-3 py-2 rounded-lg text-xs"
            style={{
              background: "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
              boxShadow:
                "0 8px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="text-gray-400 text-[10px] mb-1">
              {new Date(hoveredPoint.data.timestamp).toLocaleDateString(
                undefined,
                {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </div>
            <div className="text-white font-semibold">
              {formatAmount(hoveredPoint.data.close, 2)}
            </div>
          </div>
          {/* Tooltip arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              bottom: "-6px",
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #1f2937",
            }}
          />
        </div>
      )}

      {/* Vertical line on hover */}
      {hoveredPoint && (
        <div
          className="absolute top-5 bottom-8 w-px pointer-events-none"
          style={{
            left: hoveredPoint.x,
            background:
              "linear-gradient(to bottom, transparent, rgba(156, 163, 175, 0.4), transparent)",
          }}
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm text-gray-400">Loading chart...</div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <div className="text-center">
            <div className="text-red-400 mb-2">⚠️</div>
            <div className="text-sm text-gray-400">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(CurrencyAwareChart);
