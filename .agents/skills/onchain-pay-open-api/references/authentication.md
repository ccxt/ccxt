# Binance Onchain-Pay Open API Authentication

## Signing Process

All Onchain-Pay Open API requests use **RSA SHA256** signature with a PEM private key.

### Step 1: Build the Signing Payload

```
payload = JSON_BODY + TIMESTAMP
```

- `JSON_BODY`: The raw JSON request body string (compact, no trailing newline). If no body is needed, use empty string.
- `TIMESTAMP`: Current Unix timestamp in **milliseconds** (e.g., `1709654400000`)

Example:
```
{"fiatCurrency":"USD","cryptoCurrency":"BTC","totalAmount":100,"amountType":1}1709654400000
```

### Step 2: Sign with RSA SHA256

```bash
signature=$(echo -n "$payload" \
  | openssl dgst -sha256 -sign "$PRIVATE_KEY_PATH" \
  | openssl enc -base64 -A)
```

- Uses the RSA private key in PEM format
- SHA256 digest
- Base64 encoded (single line, no wrapping)

### Step 3: Send Request with Headers

All requests are **POST** with these headers:

| Header | Value |
|--------|-------|
| `X-Tesla-ClientId` | Your client ID (e.g., `your-client-id`) |
| `X-Tesla-SignAccessToken` | Your API key |
| `X-Tesla-Signature` | The RSA signature from Step 2 |
| `X-Tesla-Timestamp` | The timestamp used in signing |
| `Content-Type` | `application/json` |
| `x-trace-id` | (Optional) Trace ID for debugging |

### Complete Example

```bash
# Generate timestamp in milliseconds (cross-platform compatible)
timestamp=$(($(date +%s) * 1000))
api_params='{"fiatCurrency":"USD","cryptoCurrency":"BTC","totalAmount":100,"amountType":1}'
payload="${api_params}${timestamp}"

signature=$(echo -n "$payload" \
  | openssl dgst -sha256 -sign "test.pem" \
  | openssl enc -base64 -A)

curl --location --request POST "https://api.commonservice.io/papi/v1/ramp/connect/buy/payment-method-list" \
  --header "X-Tesla-ClientId: your-client-id" \
  --header "X-Tesla-SignAccessToken: your-api-key" \
  --header "X-Tesla-Signature: $signature" \
  --header "X-Tesla-Timestamp: $timestamp" \
  --header "Content-Type: application/json" \
  --data-raw "$api_params"
```

### Important: Cross-platform Timestamp Generation

**Correct (works on macOS, Linux, BSD):**
```bash
timestamp=$(($(date +%s) * 1000))
```

**Incorrect (do not use):**
```bash
# ❌ Doesn't work on macOS - outputs literal 'N'
timestamp=$(date +%s%3N)

# ❌ Just appends '000', not true milliseconds
timestamp=$(date +%s000)
```

On macOS, `date` doesn't support `%N` (nanoseconds), which causes `date +%s%3N` to output something like `1773744478N`. This breaks JSON parsing with error:
```
Unexpected character ('N' (code 78)): was expecting comma to separate Object entries
```

## Security Notes

- Never expose the PEM private key content
- Never display the full API key; show first 5 + last 4 characters only (e.g., `2zefb...06h`)
- The PEM file path should be absolute or relative to the working directory
