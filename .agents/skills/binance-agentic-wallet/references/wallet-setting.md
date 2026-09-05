# Wallet Settings

View the wallet's current security configuration and daily quota. Settings can only be changed in the Binance App — this command is read-only.

## `wallet settings`

### Syntax

```bash
baw wallet settings --json
```

### Parameters

No command-specific parameters.

### Example

```bash
baw wallet settings --json
```

### Response

```json
{
  "success": true,
  "data": {
    "maxSigninDuration": "48h",
    "inactiveSignoutDuration": "24h",
    "dailyLimit": 50000,
    "abnormalTxnHandling": "AutoReject",
    "tradeAllTokens": false,
    "predictionEnabled": true,
    "predictionDailyLimit": 50000,
    "predictionQuotaUsed": 0,
    "predictionQuotaLeft": 50000,
    "predictionQuotaDate": "2026-04-03",
    "defiDailyLimit": 5000,
    "defiQuotaUsed": 0,
    "defiQuotaLeft": 5000,
    "defiQuotaDate": "2026-04-03",
    "x402DailyLimit": 20,
    "x402QuotaUsed": 0,
    "x402QuotaLeft": 20,
    "x402QuotaDate": "2026-04-03",
    "quotaUsed": 0,
    "quotaLeft": 50000,
    "quotaDate": "2026-04-03",
    "inactiveSignOutTime": "2026-04-04T06:32:05+08:00",
    "sessionExpireTime": "2026-04-04T06:32:05+08:00"
  }
}
```

Returns the current security settings:
- **maxSigninDuration** — The maximum time the Agentic Wallet can stay signed in before the Agent is automatically signed out.
- **inactiveSignoutDuration** — The Agent will be signed out after this period of inactivity, regardless of the Max Sign-In Duration. Currently fixed at 24 hours and not user-configurable.
- **dailyLimit** — maximum total transaction value allowed in a 24-hour period.
- **abnormalTxnHandling** — How the wallet handles transactions flagged as high-risk or with abnormal price impact. Only two values are possible:
    - `AutoReject` — automatically block abnormal transactions without prompting the user.
    - `NeedConfirmation` — send a double-confirm request to the Binance App and wait for the user to approve or reject.
- **tradeAllTokens** — whether the wallet can trade any token or only those on the allowed list.
- **predictionEnabled** — whether prediction-market trading (see [`prediction`](./prediction.md) commands) is enabled for this wallet. When `false`, `prediction trade *` calls will be rejected by policy.
- **predictionDailyLimit** — maximum total prediction-trade value (in USD) allowed in a 24-hour period. **Independent from `dailyLimit`**: prediction trades only consume `predictionQuotaUsed`.
- **defiDailyLimit** — maximum total DeFi-operation value (in USD) allowed in a 24-hour period. **Independent from `dailyLimit`** (and prediction): DeFi `deposit` / `lp-add` only consume `defiQuotaUsed`.
- **x402DailyLimit** — maximum total x402 payment value (in USD) allowed in a 24-hour period. **Independent from `dailyLimit` and `predictionDailyLimit`**: x402 payments only consume `x402QuotaUsed`.

The response also includes current status information:
- **quotaUsed** — how much of the daily limit (in USD) has been consumed so far today.
- **quotaLeft** — remaining daily limit (in USD) available for transactions today.
- **quotaDate** — the date these quota figures apply to.
- **predictionQuotaUsed** — how much of `predictionDailyLimit` has been consumed by prediction trades today.
- **predictionQuotaLeft** — remaining prediction-trade quota available today.
- **predictionQuotaDate** — the date these prediction-quota figures apply to.
- **defiQuotaUsed** — how much of `defiDailyLimit` has been consumed by DeFi operations (`defi deposit` / `defi lp-add`) today.
- **defiQuotaLeft** — remaining DeFi quota available today; use this when answering "how much DeFi can I still do today".
- **defiQuotaDate** — the date these DeFi-quota figures apply to.
- **x402QuotaUsed** — how much of the x402 daily limit (in USD) has been consumed so far today.
- **x402QuotaLeft** — remaining x402 daily limit (in USD) available for x402 payments today.
- **x402QuotaDate** — the date these x402 quota figures apply to.
- **inactiveSignOutTime** - when the agent will sign out due to the inactive signout duration settings.
- **sessionExpireTime** — when the current session will expire and the wallet will automatically sign out.

### Changing Settings

Settings cannot be changed via the CLI. To update them, follow these steps in the Binance App:

1. Open the **Binance Wallet App**.
2. Navigate to the **Agentic Wallet** management page.
3. Tap the **settings icon** in the top-right corner to enter wallet Settings.
4. Adjust the desired security settings.

When a transaction is rejected because of a security policy (e.g., token not on the allowed list, daily limit exceeded, x402 daily limit exceeded, prediction disabled, prediction daily limit exceeded, defi daily limit exceeded), use `wallet settings` to explain the restriction and guide the user to the App to make adjustments.
