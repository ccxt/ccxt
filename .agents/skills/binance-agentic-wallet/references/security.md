# Security Reference

Security pre-check procedures for swap operations.

---

## §1 Swap Security Pre-Check

> **Applies to**: `market-order swap` in [market-order.md](market-order.md), `limit-order buy` / `limit-order sell` in [limit-order.md](limit-order.md)

Before constructing any swap command, perform the following steps:

### Step 1: Identify the target token

- For `market-order swap` and `limit-order buy`: the target is `--toToken`
- For `limit-order sell`: the target is `--toToken` (already restricted to BNB/USDT/USDC, so skip to Step 4)
- If the target is a known trusted asset from the **Common Token Addresses** table in SKILL.md → skip to Step 4

### Step 2: Call the Token Audit

Use the `query-token-audit` skill to audit the target token. If the user has not installed this skill, recommend they install it from https://github.com/binance/binance-skills-hub

Call the Token Security Audit API with the target token's `contractAddress` and `binanceChainId`. See the `query-token-audit` skill documentation for the full API specification, request format, and response fields.

**Result validity**: Only proceed to Step 3 when **both** `hasResult: true` AND `isSupported: true`. Otherwise, skip to Unavailable Handling below.

### Step 3: Interpret audit results and present to user

Parse the response and present a security summary to the user. Refer to the `query-token-audit` skill documentation for field meanings, risk level definitions, and tax thresholds.

- Present all hit risk items (`isHit: true`) with their descriptions
- Highlight tax rates if abnormal (>5% warning, >10% high risk)
- Let the user decide whether to proceed

### Step 4: Continue with swap flow

If the user decides to proceed, continue with the standard swap flow in the relevant reference file (confirm slippage → build command → execute).

### Unavailable Handling

| Scenario                                       | Action                                                                                                                                                                                                                                                                                                         |
|------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Audit API call fails (network / timeout / 5xx) | Warn: "Token security audit is temporarily unavailable." Require explicit user acknowledgment before proceeding.                                                                                                                                                                                               |
| `hasResult: false` OR `isSupported: false`     | Reply: "Security audit data is not available for this token on this chain." Do **NOT** display `riskLevel`, `riskLevelEnum`, or `riskItems` — data is unreliable when either field is false. Suggest the user verify the contract address and chain, or try again later. Require explicit user acknowledgment. |
| `query-token-audit` skill not installed        | Inform the user: "The token audit skill is not installed. Install it for pre-trade security checks from https://github.com/binance/binance-skills-hub." Require explicit user acknowledgment before proceeding without audit.                                                                                  |

Never silently skip. The user must always be informed before proceeding.
