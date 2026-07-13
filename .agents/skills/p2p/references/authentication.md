# Binance P2P Authentication

All P2P personal order endpoints (SAPI) require HMAC SHA256 signed requests.

## Base URL

`https://api.binance.com`

## Required Headers

* `X-MBX-APIKEY`: your_api_key
* `User-Agent`: binance-wallet/1.0.0 (Skill)

## ⚠️ CRITICAL: SAPI-Specific Behavior

**DO NOT sort parameters** - SAPI keeps original insertion order (different from standard Binance API).

**Correct approach for SAPI:**
- Keep parameter insertion order when building query string
- Example: `page=1&rows=20&recvWindow=60000&timestamp=1710460800000`

**Wrong approach (standard Binance API only):**
- Sorting parameters alphabetically will cause signature verification failure
- SAPI does NOT sort parameters like standard REST API

## Signing Process

### Step 1: Build Query String

Include all parameters plus `timestamp` (current Unix time in milliseconds):
`timestamp=1234567890123`

**Optional:** Add `recvWindow` (default 60000ms for P2P endpoints) for timestamp tolerance.

### Step 2: Percent-Encode Parameters

Before generating the signature, **percent-encode all parameter names and values using UTF-8 encoding according to RFC 3986.**
Unreserved characters that must not be encoded: `A-Z a-z 0-9 - _ . ~`

- Chinese characters example:
  `symbol=这是测试币456`

Percent-encoded:
`symbol=%E8%BF%99%E6%98%AF%E6%B5%8B%E8%AF%95%E5%B8%81456`

**Important:**
The exact encoded query string must be used for both signing and the HTTP request.

### Step 3: Generate Signature

Generate the HMAC SHA256 signature from the encoded query string using your secret key:

```bash
# Example using openssl
echo -n "page=1&rows=20&recvWindow=60000&timestamp=1234567890123" | \
  openssl dgst -sha256 -hmac "your_secret_key"
```

### Step 4: Append Signature

Add signature parameter to the query string:
`page=1&rows=20&recvWindow=60000&timestamp=1234567890123&signature=abc123...`

### Step 5: Add Headers

Include required headers:
- `X-MBX-APIKEY`: Your API key
- `User-Agent`: `binance-wallet/1.0.0 (Skill)`

## Complete Bash Example

```bash
#!/bin/bash
API_KEY="your_api_key"
SECRET_KEY="your_secret_key"
BASE_URL="https://api.binance.com"

# Get current timestamp
TIMESTAMP=$(date +%s000)

# Build query string (without signature)
# CRITICAL: Keep parameter order, do NOT sort
QUERY="page=1&rows=20&recvWindow=60000&timestamp=${TIMESTAMP}"

# Generate signature
SIGNATURE=$(echo -n "$QUERY" | openssl dgst -sha256 -hmac "$SECRET_KEY" | cut -d' ' -f2)

# Make request
curl -X GET \
  "${BASE_URL}/sapi/v1/c2c/orderMatch/listUserOrderHistory?${QUERY}&signature=${SIGNATURE}" \
  -H "X-MBX-APIKEY: ${API_KEY}" \
  -H "User-Agent: binance-wallet/1.0.0 (Skill)"
```

## Security Notes

* Never share your secret key
* Use IP whitelist in Binance API settings
* Enable only required permissions (Enable Reading for P2P order history)
* Store credentials securely in .env file (add to .gitignore)
