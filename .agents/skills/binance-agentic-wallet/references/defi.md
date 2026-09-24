# DeFi Commands

Query DeFi protocols, investment opportunities, and the user's DeFi positions. Execute DeFi transactions (deposit, redeem, LP, claim).

> **Sign-in required**: All DeFi commands require an active Agentic Wallet session. If the user is not signed in, ask them to sign in first (`auth signin`) before running any `defi` command.

> **Always preview before executing**: Before running any state-changing command (`deposit`, `redeem`, `lp-add`, `lp-remove`, `claim`), call `defi preview --action <action> ...` with the same parameters first. Show the user the estimated fee, balance changes, and any warnings. Only proceed after the user confirms.

## Post-trade verification

After a successful state-changing call (`deposit` / `redeem` / `lp-add` / `lp-remove` / `claim`), backend data is **not** immediately consistent — there is a delay before the change reflects in subsequent reads. Follow these rules when the user asks to verify the result:

1. **Set expectations on submit.** A returned `txHash` only means the transaction was **submitted** — it may still be pending in the mempool, and it could still fail on-chain (revert, run out of gas, be dropped). Tell the user something like "submitted; not yet confirmed on-chain. Data may take a moment to update, ask any time to check." Do NOT claim the deposit / redeem / claim is complete, and do NOT call any verification query immediately after — it will just show stale data.

2. **First verification = normal query, no `--refresh`.** When the user asks to check, call `defi position` without `--refresh`. Most of the time data is already updated.

3. **If the data still doesn't look updated** after the normal query, you MAY call `defi position --refresh` once. Do NOT chain multiple `--refresh` calls back-to-back — `--refresh` is **server-side rate-limited**, and refreshes should be spaced **at least several minutes apart**. This is the only sanctioned exception to the "don't pass `--refresh` by default" rule.

4. **On rate-limit errors** from `--refresh`:
   - Do NOT surface the raw error to the user.
   - Fall back to a regular query (no `--refresh`) and present whatever data is available.
   - Tell the user data may still be syncing and to retry **after a few minutes**.

5. **Never claim "transaction failed" based on a stale read.** A `txHash` is only proof that the tx was **submitted** — it does NOT prove it succeeded on-chain. Backend position queries also lag behind the chain, so a stale read is not evidence of failure either. If verification queries still show no change, the answer is "syncing — check the block explorer for the tx's on-chain status", not "it failed".

## Display Rules (apply to ALL `defi` commands)

When summarizing or rendering any field below to the user, format to **exactly 2 decimal places** (round half-up). Do not drop trailing zeros, do not switch to scientific notation, do not omit the unit.

| Field kind                          | Examples in JSON                                                        | Render as                            |
|-------------------------------------|-------------------------------------------------------------------------|--------------------------------------|
| APY / APR (always decimal)          | `apy: "0.0432"`, `apy: "2.12"`                                          | `4.32%`, `212.00%`                   |
| TVL (USD)                           | `tvl: "1187356864"`, `tvl: "2851031.25"`                                | `$1,187,356,864.00`, `$2,851,031.25` |
| USD values                          | `tokenValue`, `protocolTotalValue`, `deFiTotalValue`, `fdv`, `valueUsd` | `$57.40`, `$1,807.99`                |
| Health factor                       | `healthRate: "1.85"`                                                    | `1.85`                               |
| Ratios / shares (0–1)               | `ratio: "0.5"`                                                          | `50.00%`                             |
| Slippage (basis points)             | `slippageBps: "100"`                                                    | `1.00%`                              |

Notes for the model:
- **`apy` is ALWAYS a decimal fraction** — multiply by `100` to get the percentage. `"0.04"` → `4.00%`, `"2.12"` → `212.00%`. Values can exceed 1.0 (>100% APY is normal for some LP pools). Never display raw decimal to user.
- **`apy` is base APY only** — it does NOT include earn campaign / promotional APY. Numbers may differ from values shown on the protocol's official website. Mention this if the user asks why the number differs.
- **At the protocol level (`defi protocol-list` / `defi protocol-info`), `apy` is the MAX APY across all the protocol's pools / investments** — not every pool yields this rate. When presenting to the user, call it "max APY" or "up to X%" so they don't assume every position under this protocol earns that same rate. To see the per-investment APY, use `defi investment-list --defiProtocolId <id>`.
- Token amounts (`tokenAmount`) keep their original precision (8+ decimals); do **not** force them to 2 decimals.
- Numeric IDs (`nftId`, `tickLower`, `tickUpper`, `unlockTime`, chain IDs) are integers; never reformat.

## `defi protocol-list`

List DeFi protocols with TVL and APY metrics.

### Syntax

```bash
baw defi protocol-list [--binanceChainId <binanceChainId>] [--investType <investType>] [--sortField <sortField>] [--sortDirection <sortDirection>] [--page <page>] [--size <size>] --json
```

### Parameters

| Parameter          | Required | Default | Description                             |
|--------------------|----------|---------|-----------------------------------------|
| `--binanceChainId` | No       | —       | Filter by chain ID (e.g., `56` for BSC) |
| `--investType`     | No       | —       | `Earn` or `LiquidityPool`               |
| `--sortField`      | No       | `tvl`   | Sort by `apy` or `tvl`                  |
| `--sortDirection`  | No       | `DESC`  | `ASC` or `DESC`                         |
| `--page`           | No       | `1`     | Page number                             |
| `--size`           | No       | `200`   | Results per page (max `200`)            |

### Example

```bash
baw defi protocol-list --binanceChainId 56 --investType Earn --json
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 2,
    "list": [
      {
        "defiProtocolId": "protocol_abc",
        "protocolName": "Protocol ABC",
        "description": "...",
        "protocolLogo": "https://...",
        "tvl": "1187356864",
        "apy": "0.29",
        "investType": ["Earn"],
        "supportedChains": ["56"]
      }
    ]
  }
}
```

---

## `defi protocol-info`

Get detailed information about a specific DeFi protocol.

### Syntax

```bash
baw defi protocol-info --defiProtocolId <defiProtocolId> --json
```

### Parameters

| Parameter          | Required | Description                        |
|--------------------|----------|------------------------------------|
| `--defiProtocolId` | Yes      | Protocol ID (e.g., `protocol_abc`) |

### Example

```bash
baw defi protocol-info --defiProtocolId protocol_abc --json
```

### Response

```json
{
  "success": true,
  "data": {
    "defiProtocolId": "protocol_abc",
    "protocolName": "Protocol ABC",
    "protocolLogo": "https://...",
    "description": "...",
    "websiteUrl": "https://...",
    "investType": ["Earn"],
    "supportedChains": ["56"],
    "tvl": "1187356864",
    "tags": ["DeFi", "Lending"],
    "founded": "2020",
    "fdv": "83304822.86",
    "totalFunding": null,
    "socialLinks": { "x": "...", "discord": null, "github": null, "linkedin": null },
    "team": [ { "name": "...", "role": "...", "twitter": "...", "linkedin": "...", "bio": "..." } ],
    "fundRaising": [ { "round": "Seed", "amount": "...", "date": "...", "investors": ["..."] } ],
    "securityScore": "85",
    "dimensionScores": { "codeSecurity": "...", "fundamentalHealth": "..." },
    "highlights": ["..."],
    "faq": [ { "title": "...", "answer": "..." } ]
  }
}
```

---

## `defi investment-list`

List DeFi investment opportunities. `investType` is required.

### Syntax

```bash
baw defi investment-list --investType <investType> [--defiProtocolId <defiProtocolId>] [--contractAddresses <addresses>] [--binanceChainId <binanceChainId>] [--sortField <sortField>] [--sortDirection <sortDirection>] [--page <page>] [--size <size>] --json
```

### Parameters

| Parameter             | Required | Default | Description                                                 |
|-----------------------|----------|---------|-------------------------------------------------------------|
| `--investType`        | Yes      | —       | `Earn` or `LiquidityPool`                                   |
| `--defiProtocolId`    | No       | —       | Filter by protocol ID                                       |
| `--contractAddresses` | No       | —       | Filter by token contract addresses (comma-separated, max 2) |
| `--binanceChainId`    | No       | —       | Filter by chain ID                                          |
| `--sortField`         | No       | `apy`   | Sort by `apy` or `tvl`                                      |
| `--sortDirection`     | No       | `DESC`  | `ASC` or `DESC`                                             |
| `--page`              | No       | `1`     | Page number                                                 |
| `--size`              | No       | `20`    | Results per page (max `100`)                                |

### Example

```bash
baw defi investment-list --investType Earn --defiProtocolId protocol_abc --json
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 21,
    "list": [
      {
        "binanceChainId": "56",
        "defiProtocolId": "protocol_abc",
        "protocolName": "Protocol ABC",
        "investmentId": "0e82...",
        "investmentName": "TOKEN_A",
        "investType": "Earn",
        "apyType": "APY",
        "apy": "0.04",
        "tvl": "2851031.25"
      }
    ]
  }
}
```

---

## `defi investment-info`

Get full details for a single investment.

### Syntax

```bash
baw defi investment-info --investmentId <investmentId> --json
```

### Parameters

| Parameter        | Required | Description     |
|------------------|----------|-----------------|
| `--investmentId` | Yes      | Investment ID   |

### Example

```bash
baw defi investment-info --investmentId 0e82... --json
```

### Response

```json
{
  "success": true,
  "data": {
    "binanceChainId": "56",
    "defiProtocolId": "protocol_abc",
    "protocolName": "Protocol ABC",
    "protocolLogo": "https://...",
    "investmentId": "...",
    "investmentName": "TOKEN_A",
    "investType": "Earn",
    "investable": true,
    "apy": "0.04",
    "apyType": "APY",
    "tvl": "2851031.25",
    "poolAddress": null,
    "feeRate": null,
    "assetTokenList": [ { "tokenAddress": "0x4bd1...", "tokenName": "Token A", "tokenSymbol": "TKA" } ],
    "rewardTokenList": [ { "tokenAddress": "0x...", "tokenName": "...", "tokenSymbol": "RWD" } ],
    "lpTokenList": null,
    "borrowTokenList": null
  }
}
```

### Field notes

| Field        | Meaning                                                                                                                                                                                                                   |
|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `investable` | Boolean. `true` → all operations allowed. `false` → product is delisted; agent MUST refuse new `deposit` / `lp-add` requests and tell the user the product is delisted; only redeem / lp-remove / claim remain available. |

---

## `defi position`

Query the user's DeFi positions across all supported protocols. Returns a hierarchical structure: **Protocol → Pool → PositionCollection → Position → Token**.

### Syntax

```bash
baw defi position [--address <address>] [--binanceChainId <binanceChainId>] [--defiProtocolId <defiProtocolId>] [--refresh] --json
```

### Parameters

| Parameter          | Required | Description                                                                                                                                                                                                                                                                                                                       |
|--------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--address`        | No       | Query by a specific address (defaults to user's wallet address)                                                                                                                                                                                                                                                                   |
| `--binanceChainId` | No       | Filter results by chain ID                                                                                                                                                                                                                                                                                                        |
| `--defiProtocolId` | No       | Filter by DeFi protocol ID (e.g., `protocol_abc`, `protocol_xyz`)                                                                                                                                                                                                                                                                 |
| `--refresh`        | No       | Force-refresh positions (skip cache; server rate-limited, refreshes should be spaced several minutes apart). **Do NOT pass this by default — only include it when the user explicitly asks to refresh / sync / reload / get the latest on-chain positions, OR per the [Post-trade verification](#post-trade-verification) flow.** |

### Example

```bash
# All positions for the connected wallet
baw defi position --json

# Filter by a specific protocol
baw defi position --defiProtocolId protocol_abc --json

# Force refresh — only when the user explicitly asks to refresh / sync / reload positions
baw defi position --refresh --json
```

### Response Structure (4-Layer Hierarchy)

```
Response
└── deFiTotalValue  (USD total across all protocols)
└── deFiProtocolVOList[]                       ← Protocol layer
    ├── binanceChainId / protocolId / defiProtocolId / protocolName
    ├── protocolTotalValue
    ├── healthRiskThresholds  (JSON string with health-factor color thresholds for Lending)
    └── poolList[]                              ← Pool layer
        ├── bnPoolId / poolCa / poolType / poolTemplateCode
        ├── poolDetail  (feeTier, spokeName, vaultName, etc — varies by poolType)
        └── positionCollectionList[]            ← PositionCollection layer
            ├── positionCollectionId / positionCollectionTotalValue
            ├── positionCollectionDetail  (healthRate for Lending, collectionDisplayName)
            └── positionList[]                   ← Position layer
                ├── positionId / underlyingAssetName / underlyingAssetId
                ├── assetType  (null / "locked" / "farming")
                ├── investmentIds[]
                ├── positionDetail  (nftId, tickLower, tickUpper, unlockTime, ...)
                └── tokenList                    ← Token layer (grouped by type)
                    ├── supply: TokenVO[]
                    ├── borrow: TokenVO[]
                    └── reward: TokenVO[]
```

### Field Reference Guide

| Layer              | Key fields                               | What they mean                                                                                                          |
|--------------------|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| Protocol           | `protocolId`                             | Chain + version unique (e.g., `bsc_protocol_abc`, `bsc_protocol_xyz`)                                                   |
| Protocol           | `defiProtocolId`                         | Cross-chain protocol group (e.g., `protocol_abc`, `protocol_xyz`)                                                       |
| Pool               | `poolType`                               | `Lending` / `Liquidity Pool` / `Farming` / `Locked` / `Yield` / etc.                                                    |
| Pool               | `poolTemplateCode`                       | Drives client rendering (e.g., `Concentrated_Liquidity_V3`, `Lending_Hub_Spoke`)                                        |
| PositionCollection | `positionCollectionDetail.healthRate`    | Lending account health factor (only present for `poolType=Lending`)                                                     |
| Position           | `assetType`                              | `null` for normal, `"locked"`, or `"farming"`                                                                           |
| Position           | `tokenList.supply` / `borrow` / `reward` | Tokens grouped by direction                                                                                             |
| Position           | `positionDetail.tickLower/tickUpper`     | LP V3/V4 price range as raw ticks (no auto-conversion)                                                                  |
| Position           | `positionDetail.unlockTime`              | Lock-end timestamp (seconds) for `Staked_Locked` pools                                                                  |
| Position           | `positionDetail.unlockTimeReached`       | Boolean; whether `unlockTime` has passed (computed server-side). Use it directly — do not re-compute from current time. |
| Position           | `positionDetail.nftId`                   | NFT-based LP position ID                                                                                                |

### How to Read the Response (AI Guide)

Different user questions need different layers:

| User question                                   | Where to look                                                                                                                                                     |
|-------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| "What's my total DeFi value?"                   | `deFiTotalValue`                                                                                                                                                  |
| "Which protocols do I use?"                     | `deFiProtocolVOList[].protocolName` + `protocolTotalValue`                                                                                                        |
| "What's my lending health factor?"              | Find protocol with `poolType=Lending` → `positionCollectionDetail.healthRate`. Health < 1.5 = high risk.                                                          |
| "Show me my LP positions"                       | Filter pools by `poolType="Liquidity Pool"`. `positionDetail.nftId` is the NFT ID.                                                                                |
| "Are any of my LPs out of range?"               | `positionDetail.active`. `false` means current price is outside `tickLower..tickUpper`.                                                                           |
| "What can I claim?"                             | `tokenList.reward[]` shows unclaimed rewards / fees                                                                                                               |
| "What am I borrowing?"                          | `tokenList.borrow[]` (only present for `Lending` positions)                                                                                                       |
| "Is this protocol supported by Binance Wallet?" | See Derived insights → protocol support. Reuse prior `defi protocol-list` results from the conversation; if none, ask the user to run `defi protocol-list` first. |
| "Any redemptions in progress?"                  | See Derived insights → redemption in progress.                                                                                                                    |
| "Anything I can claim from redemptions?"        | See Derived insights → claimable redemption. Suggest `defi claim --claimType REDEMPTION ...`.                                                                     |

### Derived insights (compute at render time, not in the response)

Some user-facing concepts are NOT returned directly by `defi position` — derive them by inspecting the response:

| Concept                              | How to derive                                                                                                                                                                                                                                                                                                                                                                                  |
|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Protocol supported by Binance Wallet | Reuse `defi protocol-list` results **already in the current conversation context** — a position's `defiProtocolId` ∈ those results → supported. **Do NOT auto-invoke `defi protocol-list` just to check this.** If the user has not run `defi protocol-list` in this session and explicitly asks "is this protocol supported", suggest they run `defi protocol-list` to get the supported set. |
| Redemption in progress               | `poolType="Staked"` AND `assetType="locked"` AND `positionDetail.unlockTime` is set AND `positionDetail.unlockTimeReached=false`. Show `unlockTime` so the user knows when funds will be claimable.                                                                                                                                                                                            |
| Claimable redemption                 | `poolType="Staked"` AND `assetType="locked"` AND `positionDetail.unlockTime` is set AND `positionDetail.unlockTimeReached=true`. Tell user they can call `defi claim --claimType REDEMPTION ...`.                                                                                                                                                                                              |

### Display Rules (position-specific)

- **Always show contract addresses** alongside token symbols (token symbols can be spoofed).
- **Group by `protocolName`** when summarizing — same `defiProtocolId` may span multiple `protocolId`s.
- **Highlight risk**: if any `Lending` collection has `healthRate < 1.5`, surface a warning. Don't auto-act.
- **Don't fabricate price-range conversions**: `tickLower/tickUpper` are raw ticks. Only convert to USD price if the user explicitly asks.
- For numeric formatting (USD values, APY/APR, health factor, ratios) follow the global **Display Rules** at the top of this document.

### Example (Abbreviated)

```json
{
  "success": true,
  "data": {
    "deFiTotalValue": "1807.99",
    "deFiProtocolVOList": [
      {
        "binanceChainId": "56",
        "protocolId": "bsc_protocol_abc",
        "defiProtocolId": "protocol_abc",
        "protocolName": "Protocol ABC",
        "protocolTotalValue": "57.40",
        "healthRiskThresholds": "{...}",
        "poolList": [
          {
            "poolType": "Lending",
            "poolTemplateCode": "Lending_Hub_Spoke",
            "poolDetail": { "spokeName": "Main Market" },
            "positionCollectionList": [
              {
                "positionCollectionDetail": { "healthRate": "1.85" },
                "positionList": [
                  {
                    "underlyingAssetName": "USDT",
                    "tokenList": {
                      "supply": [
                        { "tokenSymbol": "USDT", "tokenAddress": "0x55d3...", "tokenAmount": "100", "tokenValue": "100.00" }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## `defi deposit`

Deposit / stake / supply assets to a DeFi protocol.

### Syntax

```bash
baw defi deposit --investmentId <investmentId> --tokenAddress <tokenAddress> --amount <amount> [--gasLevel <gasLevel>] --json
```

### Parameters

| Parameter        | Required | Default  | Description                                    |
|------------------|----------|----------|------------------------------------------------|
| `--investmentId` | Yes      | —        | Investment product ID (from `investment-list`) |
| `--tokenAddress` | Yes      | —        | Token contract address to deposit              |
| `--amount`       | Yes      | —        | Amount in human-readable units (e.g., `1.5`)   |
| `--gasLevel`     | No       | `MEDIUM` | `LOW` / `MEDIUM` / `HIGH`                      |

### Example

```bash
baw defi deposit --investmentId 0e82... --tokenAddress 0x55d398326f99059fF775485246999027B3197955 --amount 1.5 --json
```

### Response

```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123..."
  }
}
```

---

## `defi redeem`

Redeem / unstake / withdraw assets from a DeFi protocol.

### Syntax

```bash
baw defi redeem --investmentId <investmentId> --tokenAddress <tokenAddress> [--amount <amount>] [--ratio <ratio>] [--gasLevel <gasLevel>] --json
```

### Parameters

| Parameter        | Required | Default  | Description                                                                      |
|------------------|----------|----------|----------------------------------------------------------------------------------|
| `--investmentId` | Yes      | —        | Investment product ID                                                            |
| `--tokenAddress` | Yes      | —        | Token contract address to redeem                                                 |
| `--amount`       | No*      | —        | Amount in human-readable units (e.g., `1.5`) (mutually exclusive with `--ratio`) |
| `--ratio`        | No*      | —        | Ratio `(0, 1]` (mutually exclusive with `--amount`)                              |
| `--gasLevel`     | No       | `MEDIUM` | `LOW` / `MEDIUM` / `HIGH`                                                        |

> *Either `--amount` or `--ratio` must be provided.

### Response

```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "redeemDelayDays": ["7", "15"]
  }
}
```

### Field notes

| Field             | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `redeemDelayDays` | Optional `List<String>`. When empty / absent, the redeem is one-shot — funds credit as soon as the tx confirms. When present and non-empty, the protocol requires a lock-up before funds are claimable. A single value or repeated values mean a fixed wait (e.g. a staking protocol `["7", "7"]` = funds mature 7 days after the redeem is submitted); two distinct values are a range (e.g. `["7", "15"]` = funds mature somewhere between 7 and 15 days after submission). Tell the user funds will be claimable after that delay, and they must call `defi claim --claimType REDEMPTION --redemptionId <id> ...` later to actually withdraw. |

### Two-phase redemption flow

For protocols with non-empty `redeemDelayDays` (e.g. a staking protocol 7-day unstake):

1. **Phase 1 — submit redeem**: user calls `defi redeem ...`. Returns a `txHash` and `redeemDelayDays`. The position enters a redemption-in-progress state — see [Derived insights → redemption in progress](#derived-insights-compute-at-render-time-not-in-the-response) in `defi position`.
2. **Phase 2 — claim matured redemption**: after the delay elapses, the position becomes [claimable](#derived-insights-compute-at-render-time-not-in-the-response). User must explicitly call `defi claim --claimType REDEMPTION --redemptionId <id> ...` to actually receive the unstaked funds.

For protocols with no delay, redeem is single-step — no Phase 2 needed.

---

## `defi lp-add`

Add liquidity to an LP position (create new or top up existing).

> **Single-token input only — no auto-swap.** An LP position requires both pool tokens, but `lp-add` only takes **one** `--tokenAddress` + `--amount`. The wallet does **not** swap the input into the paired token; the user must already hold both tokens in the correct ratio for the chosen price range.

### Syntax

```bash
baw defi lp-add --investmentId <investmentId> --tokenAddress <tokenAddress> --amount <amount> [--nftId <nftId>] [--priceRange <percent>] [--tickLower <tickLower>] [--tickUpper <tickUpper>] [--slippageBps <slippageBps>] [--gasLevel <gasLevel>] --json
```

### Parameters

| Parameter        | Required | Default  | Description                                                                                          |
|------------------|----------|----------|------------------------------------------------------------------------------------------------------|
| `--investmentId` | Yes      | —        | LP investment product ID                                                                             |
| `--tokenAddress` | Yes      | —        | Token contract address                                                                               |
| `--amount`       | Yes      | —        | Amount in human-readable units (e.g., `1.5`)                                                         |
| `--nftId`        | No*      | —        | Position source: top up existing V3/V4 LP NFT tokenId                                                |
| `--priceRange`   | No*      | —        | Position source: new position centered on current pool price; percent, e.g. `5` = ±5%                |
| `--tickLower`    | No*      | —        | Position source: new position lower tick (raw int24, aligned to pool tickSpacing)                    |
| `--tickUpper`    | No*      | —        | Position source: new position upper tick (raw int24, aligned to pool tickSpacing)                    |
| `--slippageBps`  | No       | `auto`   | Slippage tolerance in basis points (e.g. `500` = 5%), integer `1`–`4999`; `"auto"` uses 1% (100 bps) |
| `--gasLevel`     | No       | `MEDIUM` | `LOW` / `MEDIUM` / `HIGH`                                                                            |

> *Provide exactly one position source: `--nftId`, `--priceRange`, or `--tickLower`+`--tickUpper`.

### Response

```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123..."
  }
}
```

---

## `defi lp-remove`

Remove liquidity from an LP position.

### Syntax

```bash
baw defi lp-remove --investmentId <investmentId> --nftId <nftId> --ratio <ratio> [--slippageBps <slippageBps>] [--gasLevel <gasLevel>] --json
```

### Parameters

| Parameter        | Required | Default  | Description                                                                                          |
|------------------|----------|----------|------------------------------------------------------------------------------------------------------|
| `--investmentId` | Yes      | —        | LP investment product ID                                                                             |
| `--nftId`        | Yes      | —        | LP NFT tokenId                                                                                       |
| `--ratio`        | Yes      | —        | Removal ratio `(0, 1]`; `"1"` removes full position                                                  |
| `--slippageBps`  | No       | `auto`   | Slippage tolerance in basis points (e.g. `500` = 5%), integer `1`–`4999`; `"auto"` uses 1% (100 bps) |
| `--gasLevel`     | No       | `MEDIUM` | `LOW` / `MEDIUM` / `HIGH`                                                                            |

### Response

```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123..."
  }
}
```

---

## `defi claim`

Claim LP fees, protocol/investment rewards, or matured redemptions.

### Syntax

```bash
baw defi claim --claimType <claimType> [--investmentId <investmentId>] [--defiProtocolId <defiProtocolId>] [--nftId <nftId>] [--redemptionId <redemptionId>] [--tokenAddress <tokenAddress>] [--gasLevel <gasLevel>] [--binanceChainId <binanceChainId>] --json
```

### Parameters

| Parameter          | Required | Default  | Description                                                                                                              |
|--------------------|----------|----------|--------------------------------------------------------------------------------------------------------------------------|
| `--claimType`      | Yes      | —        | `REWARD_PROTOCOL` / `REWARD_INVESTMENT` / `LP_FEE` / `REDEMPTION`                                                        |
| `--investmentId`   | No*      | —        | Investment product ID (required for `REWARD_INVESTMENT`, `LP_FEE` and `REDEMPTION`)                                      |
| `--defiProtocolId` | No*      | —        | DeFi protocol ID (required for `REWARD_PROTOCOL`)                                                                        |
| `--nftId`          | No*      | —        | LP NFT tokenId (required for `LP_FEE`)                                                                                   |
| `--redemptionId`   | No*      | —        | Redemption record ID (required for `REDEMPTION`); this is the `positionDetail.positionIndex` returned by `defi position` |
| `--tokenAddress`   | No       | —        | Optional: limit claim to a specific token                                                                                |
| `--gasLevel`       | No       | `MEDIUM` | `LOW` / `MEDIUM` / `HIGH`                                                                                                |
| `--binanceChainId` | No       | `56`     | Chain ID; only needed when `--investmentId` is absent (i.e. `REWARD_PROTOCOL`)                                           |

> *Required params depend on `--claimType`.

### Response

```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123..."
  }
}
```

---

## `defi preview`

Preview a DeFi transaction without broadcasting. Returns estimated gas, balance changes, and warnings.

### Syntax

```bash
baw defi preview --action <action> [--investmentId <investmentId>] [--tokenAddress <tokenAddress>] [--amount <amount>] [--ratio <ratio>] [--nftId <nftId>] [--priceRange <percent>] [--tickLower <tickLower>] [--tickUpper <tickUpper>] [--slippageBps <slippageBps>] [--claimType <claimType>] [--defiProtocolId <defiProtocolId>] [--gasLevel <gasLevel>] [--binanceChainId <binanceChainId>] --json
```

### Parameters

| Parameter    | Required | Default | Description                                              |
|--------------|----------|---------|----------------------------------------------------------|
| `--action`   | Yes      | —       | `DEPOSIT` / `REDEEM` / `LP-ADD` / `LP-REMOVE` / `CLAIM`. |
| other params | —        | —       | Same as the corresponding action command above           |

### Example

```bash
baw defi preview --action DEPOSIT --investmentId 0e82... --tokenAddress 0x55d3... --amount 1.5 --json
```

### Response

```json
{
  "success": true,
  "data": {
    "balanceChange": [
      { "tokenSymbol": "USDT",  "tokenAddress": "0x55d398...", "amount": "-1.5", "valueUsd": "1.50" },
      { "tokenSymbol": "vUSDT", "tokenAddress": "0xfd5840...", "amount": "1.5",  "valueUsd": "1.50" }
    ],
    "feeAndContract": {
      "estimatedNetworkFee": { "amount": "0.00012", "tokenSymbol": "BNB", "valueUsd": "0.07" },
      "interactWith":        { "address": "0xfD36..." }
    },
    "warnings": []
  }
}
```

### Field notes

| Field                                 | Meaning                                                                                                                                                                                                                                              |
|---------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `balanceChange[]`                     | Per-token expected balance changes after this tx. `amount` is signed — **positive = inflow** to the user, **negative = outflow**. `valueUsd` is the **absolute** USD value (always non-negative). Render to the user as before/after balance impact. |
| `feeAndContract.estimatedNetworkFee`  | Estimated network gas. `amount` is in the chain's native gas token (`tokenSymbol`, e.g. BNB).                                                                                                                                                        |
| `feeAndContract.interactWith.address` | Address of the smart contract the main tx will call. Show this for transparency.                                                                                                                                                                     |
| `warnings[]`                          | Non-blocking pre-flight warnings (e.g. health factor warning). **Surface ALL warnings to the user before they confirm.**                                                                                                                             |
