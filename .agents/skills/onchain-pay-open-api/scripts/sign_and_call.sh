#!/usr/bin/env bash
set -euo pipefail

# Binance Onchain-Pay Open API - Sign & Call
# Usage: sign_and_call.sh <base_url> <api_path> <client_id> <api_key> <pem_path> <json_body>
#
# Example:
#   sign_and_call.sh "https://api.commonservice.io" \
#     "papi/v1/ramp/connect/buy/payment-method-list" \
#     "your-client-id" \
#     "your-api-key" \
#     "/path/to/private.pem" \
#     '{"fiatCurrency":"USD","cryptoCurrency":"BTC","totalAmount":100,"amountType":1}'

BASE_URL="$1"
API_PATH="$2"
CLIENT_ID="$3"
API_KEY="$4"
PEM_PATH="$5"
JSON_BODY="${6:-}"

# Generate timestamp (milliseconds) - cross-platform compatible
# Using arithmetic expansion works on macOS, Linux, and BSD
timestamp=$(($(date +%s) * 1000))

# Build signing payload: JSON body + timestamp
payload="${JSON_BODY}${timestamp}"

# RSA SHA256 sign with PEM private key, base64 encode
signature=$(echo -n "$payload" \
  | openssl dgst -sha256 -sign "$PEM_PATH" \
  | openssl enc -base64 -A)

# Build curl command
curl_args=(
  --silent
  --location
  --request POST "${BASE_URL}/${API_PATH}"
  --header "X-Tesla-ClientId: ${CLIENT_ID}"
  --header "X-Tesla-SignAccessToken: ${API_KEY}"
  --header "X-Tesla-Signature: ${signature}"
  --header "X-Tesla-Timestamp: ${timestamp}"
  --header "Content-Type: application/json"
  --header "x-trace-id: skill_${timestamp}"
  --header "User-Agent: onchain-pay-open-api/0.1.2 (Skill)"
)

if [ -n "$JSON_BODY" ]; then
  curl_args+=(--data-raw "$JSON_BODY")
fi

curl "${curl_args[@]}" | python3 -m json.tool 2>/dev/null || curl "${curl_args[@]}"
