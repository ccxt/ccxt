---
name: fiat
description: Query Binance fiat payment capabilities — supported countries, currencies, payment methods, limits, and crypto prices — via public APIs, plus authenticated order/payment history lookup. Use whenever users ask about buying or selling crypto with fiat, depositing or withdrawing fiat, fiat-crypto exchange rates, payment options in a specific country, or their fiat order history — even if they don't explicitly mention Binance APIs.
metadata:
  version: 1.1.0
  author: Binance
license: MIT
---

# Binance Fiat Skill

Query Binance fiat payment capabilities, available payment methods, pricing, and supported currencies/countries using **public APIs** (no authentication required). For order and payment history, see [Authenticated Endpoints](./references/sapi-endpoints.md).

## Base URL

```
https://www.binance.com/bapi/fiat/v1/public/fiatpayment/agent
```

## Available APIs

### 1. get_capabilities

Query supported fiat currencies, cryptos, and business types for a country.

```bash
curl "https://www.binance.com/bapi/fiat/v1/public/fiatpayment/agent/get-capabilities?country={COUNTRY_CODE}"
```

Optional: `businessType` (BUY, SELL, DEPOSIT, WITHDRAW) to filter.

**Response:** `data.supportedBusinessTypes`, `data.fiatCurrencies[]` (with `code`, `name`, `supportedBusinessTypes`), `data.cryptoCurrencies[]`

### 2. get_buy_and_sell_payment_methods

```bash
curl "https://www.binance.com/bapi/fiat/v1/public/fiatpayment/agent/get-buy-and-sell-payment-methods?businessType={BUY|SELL}&fiatCurrency={FIAT}&cryptoCurrency={CRYPTO}&country={COUNTRY_CODE}"
```

All 4 parameters required.

**Response:** `data.paymentMethods[]` and `data.p2pPaymentMethods[]`, each with `code`, `paymentMethodName`, `fiatMinLimit`, `fiatMaxLimit`, `cryptoMinLimit`, `cryptoMaxLimit`, `quotation`, `suspended`

### 3. get_deposit_and_withdraw_payment_methods

```bash
curl "https://www.binance.com/bapi/fiat/v1/public/fiatpayment/agent/get-deposit-and-withdraw-payment-methods?businessType={DEPOSIT|WITHDRAW}&fiatCurrency={FIAT}&country={COUNTRY_CODE}"
```

All 3 parameters required. No `cryptoCurrency`, no `quotation`, no P2P methods.

**Response:** `data.paymentMethods[]` with `code`, `paymentMethodName`, `fiatMinLimit`, `fiatMaxLimit`, `suspended`

### 4. get_price

```bash
curl "https://www.binance.com/bapi/fiat/v1/public/fiatpayment/agent/get-price?fiatCurrency={FIAT}&cryptoCurrency={CRYPTO}&country={COUNTRY_CODE}"
```

Optional: `businessType` (BUY or SELL, defaults to BUY).

**Response:** `data.bestPrice` — indicative reference price, may differ from execution price

## Recommended Workflow

1. **`get_capabilities`** first — confirms what's supported before making other calls
2. **Payment methods API** — BUY/SELL → `get_buy_and_sell_payment_methods`; DEPOSIT/WITHDRAW → `get_deposit_and_withdraw_payment_methods`
3. **`get_price`** — add if the user wants exchange rate info

Skip step 1 for simple price queries (e.g., "What's BTC in USD?").

## Calling APIs

Use `WebFetch` or `Bash` (curl). All responses follow:

```json
{ "code": "000000", "message": null, "data": { ... }, "success": true }
```

`code: "000000"` = success; otherwise check `message`.

## Action Links

After presenting API results, always include a relevant action link so the user can proceed directly on Binance. Build the URL dynamically based on the fiat currency, crypto currency, and business type from the conversation context.

### URL Templates

| Business Type | URL Template | Example |
|---|---|---|
| BUY | `https://www.binance.com/en/crypto/buy/{FIAT}/{CRYPTO}` | [Buy BTC with USD](https://www.binance.com/en/crypto/buy/USD/BTC) |
| SELL | `https://www.binance.com/en/crypto/sell/{FIAT}/{CRYPTO}` | [Sell BTC for USD](https://www.binance.com/en/crypto/sell/USD/BTC) |
| DEPOSIT | `https://www.binance.com/en/fiat/deposit/{FIAT}` | [Deposit USD](https://www.binance.com/en/fiat/deposit/USD) |
| WITHDRAW | `https://www.binance.com/en/fiat/withdraw/{FIAT}` | [Withdraw USD](https://www.binance.com/en/fiat/withdraw/USD) |

### Language-aware URL

Replace the `/en/` locale segment to match the user's language. Supported locales:

```
en, zh-CN, zh-TC, ru, es, es-LA, fr, vi, en-TR, it, pl, id, uk-UA, ar,
en-AU, pt-BR, en-IN, en-NG, ro, bg, cs, lv, sv, pt, es-MX, el, sk, sl,
es-AR, fr-AF, en-KZ, en-ZA, en-NZ, en-BH, ar-BH, ru-UA, de, kk-KZ,
ru-KZ, ja, da-DK, en-AE, en-JP, hu, lo-LA, si-LK, az-AZ, uz-UZ, pt-AO
```

Common mapping examples:

| User language | Locale | Example URL |
|---|---|---|
| English | `en` | `https://www.binance.com/en/crypto/buy/USD/BTC` |
| 简体中文 | `zh-CN` | `https://www.binance.com/zh-CN/crypto/buy/CNY/BTC` |
| Português (BR) | `pt-BR` | `https://www.binance.com/pt-BR/crypto/buy/BRL/BTC` |
| Türkçe | `en-TR` | `https://www.binance.com/en-TR/crypto/buy/TRY/BTC` |

For regional English variants (en-AU, en-IN, en-NG, en-AE, en-NZ, etc.), use the specific regional locale rather than plain `en` — this ensures the user sees region-appropriate content.

Default to `en` if the user's language is unclear.

Always include at least one action link when the conversation involves a specific fiat/crypto pair or business type. For general questions, include all relevant links from `get_capabilities`. Format as a call-to-action, e.g.: "Ready to buy? [Buy BTC with USD on Binance](https://www.binance.com/en/crypto/buy/USD/BTC)"

## Presenting Results

- Table format for payment methods (names, limits, pricing); flag suspended methods
- Note that prices are indicative/reference prices
- Respond in the user's language
- **Always end with the relevant action link(s)**

### Price Sorting and Best Value Logic

Price direction depends on the business type — always apply the correct comparison:

| Business Type | Better price direction | Rationale |
|---|---|---|
| **BUY** | **Lower price is better** | You pay less fiat per unit of crypto — same fiat buys more crypto |
| **SELL** | **Higher price is better** | You receive more fiat per unit of crypto sold |

When summarizing: for BUY highlight the **lowest** `quotation`; for SELL highlight the **highest** `quotation`. Example (BUY USD/BTC): $70,236 beats $74,291 — more BTC per dollar.

### Wallet Payment Method (BUY)

If the BUY response includes a payment method with `code` containing `WALLET` (case-insensitive), it represents buying crypto using the user's Binance fiat wallet balance.

When this occurs, proactively mention:
> "One of the available payment methods is your Binance fiat wallet balance. If your wallet doesn't have sufficient funds, you'll need to deposit fiat first. Would you like me to look up the available deposit methods for you?"

If the user confirms, call `get_deposit_and_withdraw_payment_methods` with `businessType=DEPOSIT` using the same fiat currency and country, and present the results along with the [Deposit action link](#url-templates).

## Order & Payment History (Authenticated)

See [`references/sapi-endpoints.md`](./references/sapi-endpoints.md) for authenticated endpoints (order/payment history, deposit/withdraw records). Requires Binance API key and secret.

## Country Code Reference

Use ISO 3166-1 alpha-2 codes: BR, GB, DE, FR, JP, KR, AU, etc. **Never use `US` as the country parameter** — US users are not supported by Binance fiat payment APIs.

### Country Inference Rules

Determine the `country` parameter using this priority order:

1. **Explicit context** — If the country is already known from the conversation (user stated it, or inferred in a prior turn), reuse it without re-inferring.

2. **Fiat currency → country mapping** — Map directly from currency. Examples:
   - `SGD` → `SG`, `BRL` → `BR`, `JPY` → `JP`, `KRW` → `KR`, `AUD` → `AU`, `GBP` → `GB`, `CAD` → `CA`, `INR` → `IN`, `TRY` → `TR`, `MXN` → `MX`, `NGN` → `NG`
   - `EUR` → `FR` (since the user did not specify a country, use `FR` as the default for EUR)
   - `USD` → `SG` (since the user did not specify a country, use `SG` as the default for USD)

   > **MANDATORY**: `US` MUST NEVER be used as the country parameter under any circumstances. 

3. **Empty results** — If the API returns no payment methods or an unsupported combination, ask: *"No results found for your current settings. Would you like to try a different country? If so, please tell me which country."* Then use the country the user provides.
