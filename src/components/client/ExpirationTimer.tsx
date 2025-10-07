"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ExpirationTimerProps {
  expirationTime: number; // in seconds
  onExpire?: () => void;
}

export default function ExpirationTimer({
  expirationTime,
  onExpire,
}: ExpirationTimerProps) {
  const [timeLeft, setTimeLeft] = useState(expirationTime);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (isExpired) return "text-gray-500";
    if (timeLeft <= 10) return "text-red-400";
    if (timeLeft <= 30) return "text-yellow-400";
    return "text-green-400";
  };

  const getBackgroundColor = () => {
    if (isExpired) return "bg-gray-700";
    if (timeLeft <= 10) return "bg-red-900/50";
    if (timeLeft <= 30) return "bg-yellow-900/50";
    return "bg-green-900/50";
  };

  const progressPercentage = (timeLeft / expirationTime) * 100;

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Timer Display */}
      <motion.div
        className={`relative flex items-center justify-center w-20 h-20 rounded-full border-4 ${
          isExpired
            ? "border-gray-500"
            : timeLeft <= 10
            ? "border-red-400"
            : timeLeft <= 30
            ? "border-yellow-400"
            : "border-green-400"
        } ${getBackgroundColor()}`}
        animate={{
          scale: timeLeft <= 10 && !isExpired ? [1, 1.1, 1] : 1,
          rotate: isExpired ? 360 : 0,
        }}
        transition={{
          scale: {
            duration: 0.5,
            repeat: timeLeft <= 10 && !isExpired ? Infinity : 0,
          },
          rotate: { duration: 1 },
        }}
      >
        {/* Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-gray-700"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className={getTimerColor()}
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            initial={{ strokeDashoffset: 0 }}
            animate={{
              strokeDashoffset: `${
                2 * Math.PI * 45 * (1 - progressPercentage / 100)
              }`,
            }}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* Timer Text */}
        <span className={`text-lg font-mono font-bold ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </span>
      </motion.div>

      {/* Expiration Label */}
      <div className="text-center">
        <div className="text-xs text-gray-400 mb-1">Expiration</div>
        <div className={`text-sm font-semibold ${getTimerColor()}`}>
          {isExpired ? "EXPIRED" : `${timeLeft}s remaining`}
        </div>
      </div>

      {/* Quick Time Selector */}
      <div className="flex space-x-2">
        {[30, 60, 300, 900].map((seconds) => (
          <button
            key={seconds}
            onClick={() => {
              setTimeLeft(seconds);
              setIsExpired(false);
            }}
            className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 border border-gray-600"
            disabled={isExpired}
          >
            {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
          </button>
        ))}
      </div>

      {/* Status Indicator */}
      {isExpired && (
        <motion.div
          className="flex items-center space-x-2 px-3 py-1 bg-red-900/50 border border-red-500 rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          <span className="text-red-400 text-xs font-semibold">
            TRADE EXPIRED
          </span>
        </motion.div>
      )}
    </div>
  );
}
