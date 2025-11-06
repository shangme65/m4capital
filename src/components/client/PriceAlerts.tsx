"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Bell } from "lucide-react";

interface PriceAlertProps {
  symbol: string;
  currentPrice: number;
  previousPrice?: number;
}

interface PriceAlert {
  id: string;
  symbol: string;
  type: "up" | "down";
  change: number;
  changePercent: number;
  timestamp: number;
}

export function PriceChangeIndicator({
  symbol,
  currentPrice,
  previousPrice,
}: PriceAlertProps) {
  const [priceChange, setPriceChange] = useState<"up" | "down" | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const prevPriceRef = useRef<number>(previousPrice || currentPrice);

  useEffect(() => {
    if (prevPriceRef.current !== currentPrice) {
      const change = currentPrice > prevPriceRef.current ? "up" : "down";
      setPriceChange(change);
      setShowFlash(true);

      // Reset flash after animation
      const timer = setTimeout(() => {
        setShowFlash(false);
        setPriceChange(null);
      }, 1000);

      prevPriceRef.current = currentPrice;

      return () => clearTimeout(timer);
    }
  }, [currentPrice]);

  return (
    <AnimatePresence>
      {showFlash && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`absolute inset-0 pointer-events-none ${
            priceChange === "up"
              ? "bg-green-500/10 border-2 border-green-500/30"
              : "bg-red-500/10 border-2 border-red-500/30"
          } rounded-lg`}
        />
      )}
    </AnimatePresence>
  );
}

export function PriceAlertSystem() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play notification sound
  const playSound = (type: "up" | "down") => {
    if (!soundEnabled) return;

    // Using Web Audio API for simple beep
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for up/down
    oscillator.frequency.value = type === "up" ? 800 : 400;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // Add new alert
  const addAlert = (
    symbol: string,
    currentPrice: number,
    previousPrice: number
  ) => {
    const change = currentPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;

    // Only create alert for significant changes (> 1%)
    if (Math.abs(changePercent) < 1) return;

    const newAlert: PriceAlert = {
      id: `${symbol}-${Date.now()}`,
      symbol,
      type: change > 0 ? "up" : "down",
      change,
      changePercent,
      timestamp: Date.now(),
    };

    setAlerts((prev) => [...prev, newAlert]);
    playSound(newAlert.type);

    // Auto-remove alert after 5 seconds
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== newAlert.id));
    }, 5000);
  };

  // Remove specific alert
  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className={`absolute -top-12 right-0 p-2 rounded-lg transition-colors ${
          soundEnabled
            ? "bg-orange-500/20 text-orange-400"
            : "bg-[#2a2522] text-[#9e9aa7]"
        }`}
        title={soundEnabled ? "Mute alerts" : "Enable alerts"}
      >
        <Bell size={16} />
      </button>

      {/* Alert notifications */}
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`p-4 rounded-lg shadow-xl backdrop-blur-sm border ${
              alert.type === "up"
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {alert.type === "up" ? (
                  <TrendingUp className="text-green-400" size={20} />
                ) : (
                  <TrendingDown className="text-red-400" size={20} />
                )}
                <div>
                  <div className="font-semibold text-white">{alert.symbol}</div>
                  <div
                    className={`text-sm ${
                      alert.type === "up" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {alert.changePercent > 0 ? "+" : ""}
                    {alert.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-[#9e9aa7] hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook to monitor price changes
export function usePriceMonitor(prices: Record<string, number>) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const previousPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    Object.entries(prices).forEach(([symbol, price]) => {
      const previousPrice = previousPrices.current[symbol];

      if (previousPrice && previousPrice !== price) {
        const change = price - previousPrice;
        const changePercent = (change / previousPrice) * 100;

        // Create alert for significant changes (> 1%)
        if (Math.abs(changePercent) >= 1) {
          const newAlert: PriceAlert = {
            id: `${symbol}-${Date.now()}`,
            symbol,
            type: change > 0 ? "up" : "down",
            change,
            changePercent,
            timestamp: Date.now(),
          };

          setAlerts((prev) => [...prev, newAlert]);

          // Auto-remove after 5 seconds
          setTimeout(() => {
            setAlerts((prev) => prev.filter((a) => a.id !== newAlert.id));
          }, 5000);
        }
      }

      previousPrices.current[symbol] = price;
    });
  }, [prices]);

  return alerts;
}
