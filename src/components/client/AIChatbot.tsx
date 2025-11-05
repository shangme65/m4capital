"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm M4Capital AI Assistant. How can I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "How to get started?",
    "Trading guide",
    "Contact support",
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: messages.slice(-6), // Last 3 exchanges
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting. Please try again or email support@m4capital.online",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 flex items-center gap-2"
        aria-label="Open AI Chatbot"
      >
        <Sparkles className="w-6 h-6" />
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-gray-900 rounded-lg shadow-2xl flex flex-col border border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">M4Capital AI Assistant</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded-full p-1 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-100"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {suggestions.length > 0 && !isLoading && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
