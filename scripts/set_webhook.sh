#!/usr/bin/env bash
# set_webhook.sh
# Usage (run locally once after Vercel deploy):
# 1) export TELEGRAM_TOKEN="your-telegram-token"
# 2) export VERCEL_DOMAIN="your-app.vercel.app"
# 3) export TELEGRAM_SECRET_TOKEN="your-telegram-secret-token"
# 4) bash ./scripts/set_webhook.sh
#
# This will register Telegram webhook and verify getMe.
set -e

: "${TELEGRAM_TOKEN:?Need to set TELEGRAM_TOKEN env var}"
: "${VERCEL_DOMAIN:?Need to set VERCEL_DOMAIN env var}"
: "${TELEGRAM_SECRET_TOKEN:?Need to set TELEGRAM_SECRET_TOKEN env var}"

WEBHOOK_URL="https://${VERCEL_DOMAIN}/api/telegram-webhook"

echo "Setting webhook to: $WEBHOOK_URL"
curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook" \
  -d "url=${WEBHOOK_URL}" \
  -d "secret_token=${TELEGRAM_SECRET_TOKEN}" \
  -d 'allowed_updates=["message","edited_message"]' | jq .

echo ""
echo "Calling getMe to validate token (local check):"
curl -s "https://api.telegram.org/bot${TELEGRAM_TOKEN}/getMe" | jq .
echo ""
echo "Done. Now send a message to your bot in Telegram and check Vercel logs for the function execution."