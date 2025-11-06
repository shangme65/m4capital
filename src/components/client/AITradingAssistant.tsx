"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { useCryptoMarket } from "./CryptoMarketProvider";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function AITradingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI trading assistant. I can help you with market analysis, trading strategies, technical indicators, and risk management. How can I assist you today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { cryptoPrices } = useCryptoMarket();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare market context
      const context = {
        prices: cryptoPrices,
        timestamp: Date.now(),
      };

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          history: messages.slice(-5), // Send last 5 messages for context
          context,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content:
          data.response ||
          data.message ||
          "I apologize, I couldn't process that request.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);

      const errorMessage: Message = {
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    "What's the best strategy for BTC right now?",
    "Explain RSI indicator",
    "How should I manage risk?",
    "Analyze current market trends",
  ];

  return (
    <>
      {/* Floating chat button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all hover:scale-110"
          >
            <MessageCircle className="text-white" size={24} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "60px" : "600px",
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-96 bg-[#1b1817] border border-[#38312e] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#38312e] bg-gradient-to-r from-orange-500/10 to-orange-600/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="text-white" size={20} />
                </div>
                <div>
                  <div className="font-semibold text-white">
                    AI Trading Assistant
                  </div>
                  <div className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-[#2a2522] rounded-lg transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="text-[#9e9aa7]" size={16} />
                  ) : (
                    <Minimize2 className="text-[#9e9aa7]" size={16} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-[#2a2522] rounded-lg transition-colors"
                >
                  <X className="text-[#9e9aa7]" size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                            : "bg-[#2a2522] text-[#e8e6e3]"
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            message.role === "user"
                              ? "text-orange-100"
                              : "text-[#9e9aa7]"
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#2a2522] rounded-2xl px-4 py-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></span>
                          <span
                            className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></span>
                          <span
                            className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick actions */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2">
                    <div className="text-xs text-[#9e9aa7] mb-2">
                      Quick questions:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(action)}
                          className="text-xs px-3 py-1 bg-[#2a2522] text-[#9e9aa7] rounded-full hover:bg-[#38312e] transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-[#38312e]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about trading strategies..."
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-[#2a2522] border border-[#38312e] rounded-xl text-white placeholder-[#9e9aa7] focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || isLoading}
                      className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="text-white" size={20} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
