"use client";

import { useEffect, useRef, useState, memo } from "react";
import { createChart, ColorType, LineSeries } from "lightweight-charts";
import { useCurrency } from "@/contexts/CurrencyContext";

interface LightweightChartProps {
  symbol: string;
  interval?: "1H" | "1D" | "1W" | "1M" | "1Y" | "All";
  height?: number;
}

// Map symbol to CoinGecko ID
const getCoinGeckoId = (symbol: string): string => {
  const upperSymbol = symbol.toUpperCase();
  const idMap: Record<string, string> = {
    BTC: "bitcoin",
    ETH: "ethereum",
    XRP: "ripple",
    TRX: "tron",
    TON: "the-open-network",
    LTC: "litecoin",
    BCH: "bitcoin-cash",
    ETC: "ethereum-classic",
    USDC: "usd-coin",
    USDT: "tether",
  };
  return idMap[upperSymbol] || upperSymbol.toLowerCase();
};

// Map interval to days for CoinGecko API
const getIntervalDays = (interval: string): number => {
  switch (interval) {
    case "1H":
      return 1;
    case "1D":
      return 1;
    case "1W":
      return 7;
    case "1M":
      return 30;
    case "1Y":
      return 365;
    case "All":
      return 1825; // ~5 years
    default:
      return 1;
  }
};

function LightweightChart({
  symbol,
  interval = "1D",
  height = 320,
}: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { preferredCurrency, convertAmount } = useCurrency();

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "rgba(55, 65, 81, 0.3)" },
        horzLines: { color: "rgba(55, 65, 81, 0.3)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      rightPriceScale: {
        borderColor: "rgba(55, 65, 81, 0.5)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(55, 65, 81, 0.5)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: "#f97316",
          width: 1,
          style: 2,
          labelBackgroundColor: "#f97316",
        },
        horzLine: {
          color: "#f97316",
          width: 1,
          style: 2,
          labelBackgroundColor: "#f97316",
        },
      },
    });

    chartRef.current = chart;

    // Create line series
    try {
      const series = chart.addSeries(LineSeries, {
        color: "#22c55e",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false, // Hide last value to avoid price mismatch with modal header
        crosshairMarkerVisible: true,
      });
      seriesRef.current = series;
    } catch (e) {
      console.error("Failed to create chart series:", e);
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [height]);

  // Fetch chart data from CoinGecko
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!seriesRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        const coinId = getCoinGeckoId(symbol);
        const days = getIntervalDays(interval);

        // Get currency code for CoinGecko (lowercase)
        const vsCurrency = preferredCurrency.toLowerCase();

        // CoinGecko free API - no key needed
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch chart data");
        }

        const data = await response.json();

        if (mounted && data.prices && seriesRef.current) {
          const lineData = data.prices.map((point: [number, number]) => ({
            time: Math.floor(point[0] / 1000) as any,
            value: point[1],
          }));

          // Determine price direction
          if (lineData.length >= 2) {
            const firstPrice = lineData[0].value;
            const lastPrice = lineData[lineData.length - 1].value;
            const isUp = lastPrice >= firstPrice;

            seriesRef.current.applyOptions({
              color: isUp ? "#22c55e" : "#ef4444",
            });
          }

          seriesRef.current.setData(lineData);

          if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
          }
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

    // Refresh every 60 seconds (CoinGecko rate limit friendly)
    const refreshInterval = setInterval(fetchData, 60000);

    return () => {
      mounted = false;
      clearInterval(refreshInterval);
    };
  }, [symbol, interval, preferredCurrency]);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        height: `${height}px`,
        background:
          "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
      }}
    >
      {/* Chart container */}
      <div ref={chartContainerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-xl">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm text-gray-400">Loading chart...</div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-xl">
          <div className="text-center">
            <div className="text-red-400 mb-2">⚠️</div>
            <div className="text-sm text-gray-400">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(LightweightChart);
