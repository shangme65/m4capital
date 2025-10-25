"use client";

import { useState } from "react";

export default function TelegramSetup() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [webhookInfo, setWebhookInfo] = useState<any>(null);

  const setupWebhook = async () => {
    setLoading(true);
    setStatus("Setting up webhook...");
    try {
      const response = await fetch("/api/telegram-webhook/setup");
      const data = await response.json();
      
      if (data.success) {
        setStatus("✅ Webhook setup successful!");
        console.log("Setup response:", data);
      } else {
        setStatus(`❌ Failed: ${data.error || "Unknown error"}`);
        console.error("Setup failed:", data);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
      console.error("Setup error:", error);
    }
    setLoading(false);
  };

  const getWebhookInfo = async () => {
    setLoading(true);
    setStatus("Getting webhook info...");
    try {
      const response = await fetch("/api/telegram-webhook/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "info" }),
      });
      const data = await response.json();
      
      if (data.success) {
        setWebhookInfo(data.webhook_info);
        setStatus("✅ Webhook info retrieved!");
      } else {
        setStatus(`❌ Failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
    setLoading(false);
  };

  const deleteWebhook = async () => {
    setLoading(true);
    setStatus("Deleting webhook...");
    try {
      const response = await fetch("/api/telegram-webhook/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });
      const data = await response.json();
      
      if (data.success) {
        setStatus("✅ Webhook deleted!");
        setWebhookInfo(null);
      } else {
        setStatus(`❌ Failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-blue-500/20">
          <h1 className="text-4xl font-bold text-white mb-2">
            Telegram Bot Setup
          </h1>
          <p className="text-gray-400 mb-8">
            M4Capital Bot Configuration Panel
          </p>

          <div className="space-y-4">
            {/* Setup Webhook Button */}
            <button
              onClick={setupWebhook}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
            >
              {loading ? "Processing..." : "🚀 Setup Webhook"}
            </button>

            {/* Get Info Button */}
            <button
              onClick={getWebhookInfo}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/50"
            >
              {loading ? "Processing..." : "ℹ️ Get Webhook Info"}
            </button>

            {/* Delete Webhook Button */}
            <button
              onClick={deleteWebhook}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/50"
            >
              {loading ? "Processing..." : "🗑️ Delete Webhook"}
            </button>
          </div>

          {/* Status Message */}
          {status && (
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <p className="text-white font-medium">{status}</p>
            </div>
          )}

          {/* Webhook Info Display */}
          {webhookInfo && (
            <div className="mt-6 p-6 bg-gray-900/50 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">
                Current Webhook Info
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">URL:</span>
                  <span className="text-white font-mono break-all ml-4">
                    {webhookInfo.url || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Has Custom Certificate:</span>
                  <span className="text-white">
                    {webhookInfo.has_custom_certificate ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pending Update Count:</span>
                  <span className="text-white">
                    {webhookInfo.pending_update_count}
                  </span>
                </div>
                {webhookInfo.last_error_date && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Error Date:</span>
                      <span className="text-red-400">
                        {new Date(
                          webhookInfo.last_error_date * 1000
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Error Message:</span>
                      <span className="text-red-400 break-all ml-4">
                        {webhookInfo.last_error_message}
                      </span>
                    </div>
                  </>
                )}
                {webhookInfo.last_synchronization_error_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Sync Error:</span>
                    <span className="text-red-400">
                      {new Date(
                        webhookInfo.last_synchronization_error_date * 1000
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Connections:</span>
                  <span className="text-white">
                    {webhookInfo.max_connections || 40}
                  </span>
                </div>
                {webhookInfo.allowed_updates && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Allowed Updates:</span>
                    <span className="text-white">
                      {webhookInfo.allowed_updates.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <h3 className="text-lg font-bold text-white mb-3">
              📋 Setup Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
              <li>Make sure your environment variables are set in Vercel:
                <ul className="list-disc list-inside ml-6 mt-1 text-gray-400">
                  <li>TELEGRAM_BOT_TOKEN</li>
                  <li>TELEGRAM_SECRET_TOKEN</li>
                  <li>OPENAI_API_KEY</li>
                </ul>
              </li>
              <li>Click "Setup Webhook" to register your bot with Telegram</li>
              <li>Click "Get Webhook Info" to verify the setup</li>
              <li>Test your bot by sending a message to @m4capital_bot</li>
              <li>If issues persist, click "Delete Webhook" and try setup again</li>
            </ol>
          </div>

          {/* Bot Info */}
          <div className="mt-6 p-6 bg-green-900/20 rounded-lg border border-green-500/30">
            <h3 className="text-lg font-bold text-white mb-3">
              🤖 Bot Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
              <div>✅ ChatGPT AI Conversations</div>
              <div>✅ Multi-language Support (8 languages)</div>
              <div>✅ Crypto Price Tracking</div>
              <div>✅ Personal Watchlist</div>
              <div>✅ Price Alerts</div>
              <div>✅ DALL-E 3 Image Generation</div>
              <div>✅ Voice Message Transcription</div>
              <div>✅ Crypto News Updates</div>
              <div>✅ AI-Powered Moderation</div>
              <div>✅ Group Chat Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
