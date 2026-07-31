---
name: p2p
description: |
  Binance P2P trading assistant for natural-language queries about P2P/C2C market ads, the user's own P2P order history, order detail & appeal tracking, and advertisement publish & management.

  Use when the user asks about P2P prices, searching/choosing ads, comparing payment methods, reviewing P2P order history, checking order detail/appeal status, querying complaints, publishing/updating/managing P2P advertisements, or viewing merchant profiles.

  Do NOT use for spot/futures prices, exchange trading, deposits/withdrawals, on-chain transfers, or anything unrelated to P2P/C2C.
---

# Binance P2P Trading Skill

Help users interact with **Binance P2P (C2C)** via natural-language queries.

## When to Use / When NOT to Use

### Use this skill when the user wants to:
- Check **P2P** buy/sell quotes for a crypto/fiat pair (e.g., USDT/CNY).
- Search **P2P advertisements** and filter by payment method(s), limits, merchant quality.
- Compare prices across payment methods (e.g., Alipay vs bank transfer).
- View **their own P2P order history / summary** (requires API key).
- Query **order detail** and view full order timeline (requires API key).
- Check **appeal/complaint status** and view complaint history (requires API key).
- **Submit evidence** for an existing appeal (upload files + submit description) (requires API key).
- **View complaint process timeline** (flow of actions, CS notes, evidence) (requires API key).
- **Cancel an existing appeal** (withdraw complaint, irreversible) (requires API key).
- **View available complaint reasons** for an order (requires API key).
- **Publish, update, or manage P2P advertisements** (requires API key + merchant permission).
- View **merchant profiles** and their ad listings (requires API key).
- Query **supported digital and fiat currencies** (requires API key).

### Do NOT use this skill when the user asks about:
- Spot/Convert prices, futures/derivatives, margin, trading bots.
- Deposits/withdrawals, wallet transfers, on-chain transactions.
- Creating/cancelling orders, releasing coins (trading operations). Cancelling **appeals** (complaints) IS supported.
- Initiating new appeals (submit-complaint is deferred; evidence supplement for existing appeals IS supported).
- Sending chat messages in order conversations.

### Ask clarifying questions (do not guess) if any key inputs are missing:
- `fiat` (e.g., CNY)
- `asset` (e.g., USDT)
- user intent: **buy crypto** or **sell crypto**
- preferred payment method(s)
- target amount (optional but recommended for ad filtering)

## Core Concepts

### `tradeType` mapping (avoid ambiguity)
- User wants to **buy crypto** (pay fiat, receive USDT/BTC) → `tradeType=BUY`
- User wants to **sell crypto** (receive fiat, pay USDT/BTC) → `tradeType=SELL`

Always reflect this mapping in responses when the user's wording is ambiguous.

## Capabilities

### Phase 1 — Public Market (No Auth)
- Quote P2P prices
- Search ads
- Compare payment methods
- Filter/Rank ads by limits and merchant indicators

### Phase 2 — Personal Orders (Requires API Key)
- List P2P order history
- Filter by trade type / time range
- Provide summary statistics

### Phase 3 — Order & Appeal + Ad Publish & Management (Requires API Key)
- Query order detail by order number
- List orders with rich filters (status, trade type, asset, date range)
- View order timeline (creation → payment → release → completion)
- Detect appeal status and show appeal details
- Query complaint/appeal records with filters
- Get market reference prices for pricing decisions
- Upload appeal evidence files (S3 presigned URL + submit)
- View complaint process timeline / flow details
- Cancel an existing appeal / withdraw complaint
- Get available complaint reasons for an order
- Search and analyze market ad distribution
- Get available ad categories for current user
- Get user's configured payment methods
- List all system trade methods
- Publish new advertisements (with confirmation)
- Update existing ad parameters (with confirmation)
- Update ad status: online / offline / close (with confirmation)
- View merchant profile and ad listings
- List all supported digital currencies
- List all supported fiat currencies

## Environment Configuration

### Base URLs (production)

| Logical Name | URL |
|-------------|-----|
| `SAPI_BASE` | `https://api.binance.com` |
| `MGS_BASE` | `https://www.binance.com` |
| `C2C_WEB` | `https://c2c.binance.com` |

### Implementation hint (for code generation)

When the skill generates curl / Python / JS code, use these fixed base URLs:

```python
import os

SAPI_BASE = "https://api.binance.com"
MGS_BASE  = "https://www.binance.com"
C2C_WEB   = "https://c2c.binance.com"

def common_headers(api_key: str) -> dict:
    return {
        "X-MBX-APIKEY": api_key,
        "User-Agent": "binance-wallet/1.0.0 (Skill)",
    }

# Usage:
# f"{SAPI_BASE}/sapi/v1/c2c/agent/orderMatch/getUserOrderDetail"
# f"{MGS_BASE}/bapi/c2c/v1/public/c2c/agent/quote-price"
# f"{C2C_WEB}/en/adv?code={advNo}"
# headers = common_headers(os.getenv("BINANCE_API_KEY"))
```

```bash
# Bash equivalent:
SAPI_BASE="https://api.binance.com"
MGS_BASE="https://www.binance.com"
C2C_WEB="https://c2c.binance.com"
```

> **Note:** SAPI signing uses HMAC SHA256, no param sorting required.

## Security & Privacy Rules

### Credentials
- Required env vars:
    - `BINANCE_API_KEY` (sent as header)
    - `BINANCE_SECRET_KEY` (used for signing)

### Never display full secrets
- API Key: show **first 5 + last 4** characters: `abc12...z789`
- Secret Key: always mask; show **only last 5**: `***...c123`

### Permission minimization
- Binance API permissions: **Enable Reading** only (Phase 1/2).
- Phase 3 ad management additionally needs write permissions.
- Do NOT request/encourage withdrawal or modification permissions beyond what's needed.

### Storage guidance
- Prefer environment injection (session/runtime env vars) over writing to disk.
- Only write to `.env` if the user explicitly agrees.
- Ensure `.env` is in `.gitignore` before saving.

## ⚠️ CRITICAL: SAPI Signing (Different from Standard Binance API)

### Parameter ordering
- **DO NOT sort parameters** for SAPI requests.
- Keep original insertion order when building the query string.

Example:
```py
# ✅ Correct for SAPI: keep insertion order
params = {"page": 1, "rows": 20, "timestamp": 1710460800000}
query_string = urlencode(params)  # NO sorting

# ❌ Wrong (standard Binance API only): sorted
query_string = urlencode(sorted(params.items()))
```

### Signing details
See: `references/authentication.md` for:
- RFC 3986 percent-encoding
- HMAC SHA256 signing process
- Required headers (incl. User-Agent)
- SAPI-specific parameter ordering

## API Overview

### Public Queries (MGS C2C Agent API — No Auth)
Base URL: `https://www.binance.com`

| Endpoint | Method | Params | Usage |
|----------|--------|--------|-------|
| `/bapi/c2c/v1/public/c2c/agent/quote-price` | GET | fiat, asset, tradeType | Quick price quote |
| `/bapi/c2c/v1/public/c2c/agent/ad-list` | GET | fiat, asset, tradeType, limit, order, tradeMethodIdentifiers | Search ads |
| `/bapi/c2c/v1/public/c2c/agent/trade-methods` | GET | fiat | Payment methods |

Parameter notes:
- `tradeType`: `BUY` or `SELL` (treat as case-insensitive)
- `limit`: 1–20 (default 10)
- `tradeMethodIdentifiers`: pass as a **plain string** (not JSON array) — e.g. `tradeMethodIdentifiers=BANK` or `tradeMethodIdentifiers=WECHAT`. Values **must** use the `identifier` field returned by the `trade-methods` endpoint (see workflow below). ⚠️ Do NOT use JSON array syntax like `["BANK"]` — it will return empty results.

### Workflow: Compare Prices by Payment Method

When the user wants to compare prices across payment methods (e.g., "Alipay vs WeChat"), follow this two-step flow:

**Step 1** — Call `trade-methods` to get the correct identifiers for the target fiat:
```
GET /bapi/c2c/v1/public/c2c/agent/trade-methods?fiat=CNY
→ [{"identifier":"ALIPAY",...}, {"identifier":"WECHAT",...}, {"identifier":"BANK",...}]
```

**Step 2** — Pass the identifier as a plain string into `ad-list` via `tradeMethodIdentifiers`, one payment method per request, then compare:
```
GET /bapi/c2c/v1/public/c2c/agent/ad-list?fiat=CNY&asset=USDT&tradeType=BUY&limit=5&tradeMethodIdentifiers=ALIPAY&tradeMethodIdentifiers=WECHAT
```
Compare the best price from each result set.

> **Important:** Do not hardcode identifier values like `"Alipay"` or `"BANK"`. Always call `trade-methods` first to get the exact `identifier` strings for the given fiat currency.

### Personal Orders (Binance SAPI — Requires Auth)
Base URL: `https://api.binance.com`

| Endpoint | Method | Auth | Usage |
|----------|--------|------|-------|
| `/sapi/v1/c2c/orderMatch/listUserOrderHistory` | GET | Yes | Order history |
| `/sapi/v1/c2c/orderMatch/getUserOrderSummary` | GET | Yes | User statistics |

Authentication requirements:
- Header: `X-MBX-APIKEY`
- Query: `timestamp` + `signature`
- Header: `User-Agent: binance-wallet/1.0.0 (Skill)`

## Output Format Guidelines

### Price quote
- Show both sides when available (best buy / best sell).
- Use fiat symbol and 2-decimal formatting.

Example:
```
USDT/CNY (P2P)
- Buy USDT (you buy crypto): ¥7.20
- Sell USDT (you sell crypto): ¥7.18
```

### Ad list
Return **Top N** items with a stable schema:
1) adNo (ad number / identifier)
2) price (fiat)
3) merchant name
4) completion rate
5) limits
6) payment methods (identifiers)

Avoid generating parameterized external URLs unless the API returns them.

**Placing orders (when user requests):**
- This skill does NOT support automated order placement.
- When user wants to place an order, provide a direct link to the specific ad using the adNo:
  ```
  https://c2c.binance.com/en/adv?code={adNo}
  ```
    - `{adNo}`: the ad number/identifier from the ad list result

  Example: `https://c2c.binance.com/en/adv?code=123`
- This opens the specific ad detail page where user can place order directly with the selected advertisement.

### Personal orders
- Time format: `YYYY-MM-DD HH:mm (UTC+0)` — always display in UTC timezone
- Include: type, asset/fiat, amount, total, status
- Provide a brief summary line (count + totals) when filtering

**Time field conversion (for `createTime` in `listUserOrderHistory`):**
- The `createTime` field returns a Unix timestamp in **milliseconds** (13 digits).
- Convert to human-readable format in **UTC+0 timezone**:
  ```
  # Python example
  from datetime import datetime, timezone
  readable_time = datetime.fromtimestamp(createTime / 1000, tz=timezone.utc).strftime('%Y-%m-%d %H:%M (UTC+0)')
  
  # JavaScript example
  const readableTime = new Date(createTime).toISOString().replace('T', ' ').slice(0, 16) + ' (UTC+0)';
  // Or more explicitly:
  const date = new Date(createTime);
  const readableTime = date.getUTCFullYear() + '-' +
    String(date.getUTCMonth() + 1).padStart(2, '0') + '-' +
    String(date.getUTCDate()).padStart(2, '0') + ' ' +
    String(date.getUTCHours()).padStart(2, '0') + ':' +
    String(date.getUTCMinutes()).padStart(2, '0') + ' (UTC+0)';
  ```
- Always display the converted time to users with timezone info, not the raw timestamp.

## Error Handling (User-Facing)

- Invalid API key (-2015): prompt to verify `.env` / API Management.
- Signature failed (-1022): warn about wrong secret, sorted params, or stale timestamp.
- Timestamp invalid (-1021): advise time sync / regenerate timestamp.
- Rate limit: ask to retry later.

## Limitations (By Design)

This skill does NOT:
- Place/cancel orders
- Mark as paid / release coins
- Initiate new appeals / submit-complaint (only evidence supplement for existing appeals is supported)
- Post/modify advertisements (Phase 1/2 only — Phase 3 adds ad management for merchants)
- Expose sensitive order-detail endpoints beyond what's needed for history/summary

For in-app actions, guide users to the official P2P orders page (only as a general entry point).

## Developer Notes

### Version Check (First Invocation per Conversation)
On the first invocation of this skill per conversation, call:

- `GET /bapi/c2c/v1/public/c2c/agent/check-version?version=2.0.0` (Base: `https://www.binance.com`)

Behavior:
- If `needUpdate=true`: show: `New version of P2P Skill is available (current: {clientVersion}, latest: {latestVersion}), update recommended.`
- Else / on failure: proceed silently.

### Client-side operations
- Asset filtering: if API doesn't support it, fetch then filter locally.
- Aggregations: compute totals client-side when summary endpoint is insufficient.

---

# Phase 3 — Order & Appeal + Ad Publish & Management

Phase 3 extends the skill from read-only market/order queries to **write operations** (ad management) and **advanced order workflows** (order detail, appeal/complaint tracking).

## Phase 3 Design Constraints

| Constraint | Details |
|-----------|---------|
| Authentication | All Phase 3 features require API Key + Secret Key |
| Write-op confirmation | Any write operation (publish ad, update ad, change status) **must show an operation summary and get explicit user confirmation** before executing |
| API Key permissions | Phase 1 only needed "Enable Reading"; Phase 3 additionally needs write permissions for ad management |
| Privacy masking | Never display counterparty sensitive info (bank card, Alipay account, phone, email, real name) or internal IDs (`payId`). Even if the API returns these fields, **filter them out in user-facing output**. For payment methods, show only `tradeMethodName` (e.g. "支付宝") |

---

## Scene 1: Order Query & Appeal Handling

### 1.1 Query Order Detail

**Trigger examples:**
- "查看订单 20260315123456 的详情"
- "我最近那笔 USDT 买入订单怎么样了？"
- "帮我查一下这个订单号"
- "Show me the details of order 20260315123456"

**Behavior:**
1. If user provides an order number → call `getUserOrderDetail`
2. If user describes an order vaguely → call `listOrders` with filters, then let user pick
3. Based on order status, branch:

**Status branch handling:**

| Status | Action |
|--------|--------|
| Completed (4) | Show full timeline (create → pay → confirm → complete), finish |
| Cancelled (6) / Expired (7) | Show cancel reason (timeout / manual / system), finish |
| In Progress (1=Unpaid, 2=Paid, 3=Releasing) | Show current step + countdown timers |
| In Appeal (5) | Auto-enter 1.2 — show appeal status |

**Output format (Order Detail):**
```
📋 Order No: {orderNumber}
├─ Type: {tradeType} {asset}
├─ Amount: {amount} {asset} @ {price} {fiatUnit}
├─ Total: {fiatSymbol}{totalPrice}
├─ Status: {orderStatus description}
├─ Counterparty: {buyerNickname / sellerNickname}
├─ Created: {createTime in UTC+0}
│
├─ Timeline:
│  ├─ Created:     {createTime}
│  ├─ Paid:        {notifyPayTime or "—"}
│  ├─ Confirmed:   {confirmPayTime or "—"}
│  └─ Cancelled:   {cancelTime or "—"}
│
├─ Commission: maker {commissionRate}% = {commission} {asset}
│              taker {takerCommissionRate}% = {takerCommission} {asset}
└─ Complaint: {isComplaintAllowed ? "Allowed" : "Not Allowed"} | Status: {complaintStatus or "None"}
```

**Countdown display (for in-progress orders):**
- If status=1 (Unpaid): show "Payment deadline: {notifyPayEndTime}" with remaining time
- If status=2 (Paid): show "Release deadline: {confirmPayEndTime}" with remaining time

### 1.2 View Appeal / Complaint Status

**Trigger:**
- Automatically when order status = In Appeal (5)
- "这个申诉进展到哪了？"
- "订单 20260315123456 的申诉怎么样了？"
- "What's the appeal status?"

**Behavior:**
1. Call `query-complaints` with the order number
2. Display complaint info in structured format

**Output format:**
```
⚠️ Appeal Status for Order {orderNo}
├─ Complaint No: {complaintNo}
├─ Status: {complaintStatus description}
├─ Role: {roleIdentity} (COMPLAINANT / RESPONDENT)
├─ Reason: {reason}
├─ Created: {complaintCreateTime}
├─ Order Asset: {orderAsset} | Fiat: {orderFiat}
├─ Order Amount: {orderAmount} ({fiatSymbol})
├─ Amount in USDT: {orderAmountInUsdt}
└─ Dispute Amount: {disputeAmount}
```

**Follow-up guidance (append after the status block, based on complaintStatus):**

| complaintStatus | Guidance to show |
|----------------|------------------|
| 0 (Respondent Processing) | "Waiting for the counterparty to respond. You will be notified when there is an update." |
| 1 (Complainant Processing) | "⚡ Action needed — you need to provide evidence or respond. Say **\"submit evidence for order {orderNo}\"** to upload proof now." |
| 2 (CS Processing) | "💡 Both parties may still submit evidence at this stage. You can submit evidence directly through this skill — say **\"submit evidence for order {orderNo}\"** or **\"提交证据\"** to upload payment proof, screenshots, or other supporting documents." |
| 3 (Completed) | "This appeal has been resolved." |
| 4 (Cancelled) | "This appeal has been cancelled." |

> **MUST follow:** When `complaintStatus` is 0, 1, or 2 (appeal still active), NEVER tell the user to "go to the app" or "head to the dispute center". Always guide them to use this skill to submit evidence. The skill supports the full evidence upload flow (Scene 1.5).

**Complaint status mapping:**

| Status Code | Display Name | Description |
|------------|-------------|-------------|
| 0 | Respondent Processing (被申诉人处理中) | Complaint initiated, waiting for counterparty to respond |
| 1 | Complainant Processing (申诉人处理中) | Waiting for complainant to provide evidence or take action |
| 2 | CS Processing (客服处理中) | Customer service reviewing; both parties may submit evidence |
| 3 | Completed (已完成) | Appeal resolved |
| 4 | Complaint Cancelled (申诉取消) | Appeal withdrawn |

> **Important:** Do NOT confuse these with `orderStatus` codes — they are separate enums.
> When `complaintStatus=2` (CS Processing), the user should be guided to submit evidence if needed; do NOT tell them to "wait for counterparty".

### 1.3 Complaint History Query

**Trigger:**
- "查看我的所有申诉记录"
- "最近3个月有哪些申诉？"
- "List my complaints as complainant"

**Behavior:**
1. Call `query-complaints` with optional filters (roleIdentity, status, date range)
2. Default: last 90 days if no date specified
3. Show paginated results

**Output format:**
```
📋 Complaint Records (Total: {total})
┌───────────┬──────────────┬──────────┬────────┬───────────────┐
│ Order No  │ Complaint No │ Status   │ Role   │ Created       │
├───────────┼──────────────┼──────────┼────────┼───────────────┤
│ {orderNo} │ {no}         │ {status} │ {role} │ {time UTC+0}  │
└───────────┴──────────────┴──────────┴────────┴───────────────┘
```

### 1.4 Order List & History

**Trigger:**
- "查看我的订单列表"
- "最近的 USDT 买入订单"
- "Show my completed orders this week"

**Behavior:**
- For active/recent orders → use `listOrders` (richer filter: advNo, status, payType)
- For historical orders → use `listUserOrderHistory` (supports tradeType, date range)

**Output format (Order List):**
```
📋 Orders (Page {page}, Total: {total})
┌──────────────┬──────┬───────┬──────────────┬────────┬───────────────┐
│ Order No     │ Type │ Asset │ Total        │ Status │ Created       │
├──────────────┼──────┼───────┼──────────────┼────────┼───────────────┤
│ {orderNo}    │ BUY  │ USDT  │ ¥{totalPrice}│ 已完成  │ {time UTC+0}  │
└──────────────┴──────┴───────┴──────────────┴────────┴───────────────┘
```

**Order status code mapping:**

| Code | Name | Chinese |
|------|------|---------|
| 0 | Pending | 处理中 |
| 1 | Unpaid | 未付款 |
| 2 | Paid (Unconfirmed) | 已付款 |
| 3 | Releasing | 放币处理中 |
| 4 | Completed | 已完成 |
| 5 | In Appeal | 申诉中 |
| 6 | Cancelled | 已取消 |
| 7 | Expired (System Cancel) | 超时取消 |

### 1.5 Submit Appeal Evidence

**Trigger:**
- "帮我上传这个截图作为申诉证据"
- "我要提交付款凭证"
- "Submit evidence for order 228..."
- "Upload proof of payment for my appeal"
- Automatically suggested when order is in Appeal (status=5) and `complaintStatus=2` (CS Processing)

**Behavior (3-step flow):**

**Step 1 — Get presigned upload URL:**
```
GET /sapi/v1/c2c/agent/file-upload/get-s3-presigned-url?fileName=proof.jpg&scenario=complaint
→ { "uploadUrl": "https://s3...presigned...", "filePath": "/client_upload/c2c/complaint/..." }
```

**Step 2 — Upload file to S3:**
```bash
curl -X PUT -T /path/to/local/file.jpg "{uploadUrl}"
```
> The presigned URL is valid for **5 minutes**. Upload must complete within this window.

**Step 3 — Submit evidence to SAPI:**
```
POST /sapi/v1/c2c/agent/complaint/submit-evidence
Body: { "orderNo": "228...", "description": "付款截图", "fileUrls": ["/client_upload/c2c/complaint/..."] }
→ { "data": true }
```

**Supported file types:**
`txt, doc, xls, docx, xlsx, jpg, jpeg, png, pdf, mp3, mp4, avi, rm, rmvb, mov, wmv`

**Output format (Upload Progress):**
```
📤 Evidence Upload for Order {orderNo}
├─ Step 1/3: Getting upload URL... ✅
├─ Step 2/3: Uploading file "{fileName}"... ✅
├─ Step 3/3: Submitting evidence...
│  ├─ Description: {description}
│  └─ Files: {n} file(s)
└─ Result: ✅ Evidence submitted successfully

💡 Tip: You can submit additional evidence by saying "再上传一个文件"
```

**Output format (Failure):**
```
❌ Evidence Upload Failed
├─ Step: {which step failed}
├─ Error: {error message}
└─ Suggestion: {actionable fix}
```

**Common errors:**
- `Unsupported file type` → Check file extension; see supported types above
- `Presigned URL expired` → Re-request upload URL (Step 1)
- `Order not in appeal` → Evidence can only be submitted for orders with active complaints
- `File too large` → Reduce file size or split into multiple files

**Write-op confirmation rule:**
Evidence submission follows the same confirmation protocol as Scene 2 write operations:
1. Show a summary of what will be submitted (file name, description, order number)
2. Wait for user to confirm before executing Step 3

**Confirmation format:**
```
📋 Evidence Submission Summary
├─ Order: {orderNo}
├─ Description: {description}
├─ Files to submit:
│  1. {fileName1} ({fileType}, uploaded ✅)
│  2. {fileName2} ({fileType}, uploaded ✅)
└─ ⚠️ Confirm submission? (reply "确认" or "confirm")
```

### 1.6 View Complaint Process Timeline

**Trigger:**
- "查看申诉的处理流程"
- "这个申诉经历了哪些步骤？"
- "Show complaint timeline for order 228..."
- "What happened in the appeal process?"

**Behavior:**
1. Call `get-complaint-flows` with orderNo (and optionally complaintNo)
2. Display chronological timeline of all process steps

**Output format:**
```
📜 Complaint Timeline: Order {orderNo} (Complaint #{complaintNo})
│
├─ [{createTime}] {creatorNickName}
│  ├─ Type: {infoType description}
│  ├─ Description: {description}
│  ├─ Evidence: {fileUrls count} file(s) attached
│  └─ Source: {source}
│
├─ [{createTime}] {operatorName or creatorNickName}
│  ├─ Type: {infoType description}
│  ├─ Remark: {remark}
│  └─ Evidence: {fileUrls or "None"}
│
└─ ... (chronological order)

💡 Actions: "提交证据" to submit evidence | "刷新" to check for updates
```

**Info type mapping (for display):**

| infoType | Description |
|----------|-------------|
| 1 | Complaint Initiated |
| 2 | Evidence Submitted |
| 3 | CS Review Note |
| 4 | Resolution / Decision |

> **Note:** `fileUrls` in the response are CDN-assembled URLs that can be directly accessed.
> `remarkHtml` takes precedence over `remark` when available for rendering.

### 1.7 Cancel Complaint / Appeal

**Trigger:**
- "取消这个申诉"
- "我不想继续申诉了"
- "Cancel my appeal for order 228..."
- "Withdraw my complaint"

**⚠️ This is a DESTRUCTIVE action — mandatory confirmation required!**

Cancelling an appeal is **irreversible**. The user forfeits their dispute and the order proceeds to its normal resolution. The agent MUST follow this strict confirmation protocol:

**Behavior:**
1. When user expresses intent to cancel, FIRST show a clear warning
2. Wait for explicit confirmation ("确认取消" / "confirm cancel" / "yes")
3. Only then call `cancel-complaint` with the orderNo
4. Display the result

**Warning format (MUST show before executing):**
```
⚠️ Cancel Appeal Confirmation
├─ Order: {orderNo}
├─ Current complaint status: {status from previous query if available}
│
╔══════════════════════════════════════════════╗
║  WARNING: This action CANNOT be undone!      ║
║  - Your appeal will be permanently withdrawn ║
║  - You will lose the right to dispute this   ║
║    order through the appeal process          ║
║  - The order will proceed to normal          ║
║    resolution without CS intervention        ║
╚══════════════════════════════════════════════╝
│
└─ Reply "确认取消" or "confirm cancel" to proceed
```

**On success:**
```
✅ Appeal Cancelled
├─ Order: {orderNo}
├─ Status: Appeal withdrawn
└─ The order will now proceed to normal resolution.
```

**On failure:**
```
❌ Cancel Failed
├─ Order: {orderNo}
├─ Reason: {error message}
└─ Possible causes: no active appeal, order already resolved, or insufficient permissions.
```

**MUST-follow rules:**
- NEVER cancel without showing the warning and receiving explicit confirmation
- If user says anything ambiguous (like "算了" / "never mind" in a conversation about something else), do NOT interpret it as cancel intent — ask to clarify
- If the complaint status is already resolved/closed, inform user instead of attempting the API call

### 1.8 Get Complaint Reasons

**Trigger:**
- "我可以用什么理由申诉？"
- "What reasons can I use to appeal?"
- "Show available complaint reasons for this order"
- "申诉理由有哪些？"

**Behavior:**
1. Call `get-complaint-reasons` with orderNo
2. Display the list of available reason codes and descriptions

**Output format:**
```
📋 Available Complaint Reasons for Order {orderNo}
│
├─ [{reasonCode}] {reasonDesc}
├─ [{reasonCode}] {reasonDesc}
├─ [{reasonCode}] {reasonDesc}
└─ ...

💡 Note: These are the reasons you can use when initiating an appeal.
   This skill does NOT support initiating appeals — only viewing reasons.
```

> **Note:** This is a read-only informational query. The skill does NOT support actually submitting a new complaint (that requires the user to use the App).

---

## Scene 2: Ad Publish & Management

### ⚠️ Write Operation Safety Rules

**ALL write operations** in Scene 2 MUST follow this protocol:

1. **Pre-check**: Verify user has merchant permission (the API itself checks, but inform user clearly on 403/Permission denied)
2. **Show summary**: Before executing any write API, display a complete operation summary
3. **Explicit confirmation**: Wait for user to say "确认" / "confirm" / "发布" / "yes" before proceeding
4. **Never auto-execute**: Even if user says "just do it" in the initial request, still show summary first

### 2.1 Market Analysis & Reference Pricing

**Trigger:**
- "我想发一个 USDT/CNY 的卖单广告"
- "帮我挂一个 BTC 买单"
- "当前市场参考价是多少？"
- "What's the reference price for USDT/CNY?"

**Behavior:**
1. Call `getReferencePrice` to get market reference prices
2. Call `search` to analyze current market ad distribution
3. Present pricing intelligence to help user decide

**Output format (Reference Price):**
```
📊 Market Reference Price
├─ Asset: {asset} / {fiatCurrency}
├─ Reference Price: {currencySymbol}{referencePrice}
├─ Price Scale: {priceScale} decimals
└─ Asset Scale: {assetScale} decimals
```

**Output format (Market Analysis):**
```
📊 Market Ad Analysis: {asset}/{fiat} ({tradeType})
├─ Total Active Ads: {total}
├─ Price Range: {min} ~ {max}
├─ Top 5 Ads:
│  1. {advNo} | {price} | {surplusAmount} {asset} | Limit: {min}~{max} | {merchantNick}
│     └─ Terms: {remarks or "—"}
│  2. ...
└─ Recommended Price: {suggestion based on reference + market}
```

### 2.2 Ad Configuration

**Trigger:**
- "用浮动价格，溢价 0.5%"
- "加上支付宝"
- "就按推荐的来"
- "单价改成 6.99，限额改到 1000-100000"

**Pre-publish preparation workflow:**

**Step 1** — Get available categories:
```
GET /sapi/v1/c2c/agent/ads/getAvailableAdsCategory
→ {"advClassifies": ["mass", "profession", ...]}
```

**Step 2** — Get user's payment methods (for SELL ads, need payId):
```
GET /sapi/v1/c2c/agent/ads/getPayMethodByUserId
→ [{"payId": 123, "identifier": "ALIPAY", "tradeMethodName": "支付宝"}]
```
> **Display rule:** Only show `tradeMethodName` (e.g. "支付宝", "WeChat", "Bank Transfer") to the user.
> `payId` is an internal identifier used only in the API request body — **never expose payId values in user-facing output**.

**Step 3** — Get all system trade methods (for BUY ads, need identifier):
```
POST /sapi/v1/c2c/agent/ads/listAllTradeMethods
→ [{"identifier": "ALIPAY", "tradeMethodName": "支付宝", ...}]
```

**Ad parameter reference:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| classify | Y | Ad category: mass / profession / block / cash (default: mass) |
| tradeType | Y | 0 = BUY, 1 = SELL |
| asset | Y | Crypto: BTC, ETH, USDT, BNB |
| fiatUnit | Y | Fiat: CNY, USD, etc. |
| priceType | Y | 1 = Fixed price, 2 = Floating price |
| price | Conditional | Fixed price value (required if priceType=1) |
| priceFloatingRatio | Conditional | Floating ratio % (required if priceType=2) |
| initAmount | Y | Total crypto quantity |
| maxSingleTransAmount | Y | Max per-order fiat amount |
| minSingleTransAmount | Y | Min per-order fiat amount |
| buyerKycLimit | Y | Require buyer KYC: 0=No, 1=Yes |
| tradeMethods | Y | Payment methods: [{payId, identifier}] |
| payTimeLimit | N | Payment time limit in minutes (default 15) |
| onlineNow | N | Go online immediately (default true) |
| remarks | N | Ad trading terms / conditions (max 1000 chars, no crypto-related words) |
| autoReplyMsg | N | Auto-reply message on order creation (max 1000 chars) |
| buyerRegDaysLimit | N | Min buyer registration days |
| buyerBtcPositionLimit | N | Min buyer BTC holding |
| takerAdditionalKycRequired | N | Require extra verification: 0=No, 1=Yes |
| launchCountry | N | Target countries (default: all regions) |

**Confirmation summary format:**
```
📋 Ad Configuration Summary
┌────────────────────────────────────┐
│ Trade Direction: {SELL/BUY} {asset}│
│ Fiat Currency:   {fiatUnit}        │
│ Price Type:      {Fixed/Floating}  │
│ Price:           {price or ratio%} │
│ Total Quantity:  {initAmount} {asset}│
│ Order Limit:     {min} ~ {max} {fiat}│
│ Payment Methods: {method1, method2}│
│ Payment Timeout: {payTimeLimit} min│
│ Status:          {Online/Offline}  │
├────────────────────────────────────┤
│ Advanced Settings:                 │
│  Buyer KYC: {Yes/No}              │
│  Min Reg Days: {days or "—"}      │
│  Min BTC: {amount or "—"}         │
│  Extra Verify: {Yes/No}           │
│  Regions: {countries or "All"}    │
│  Remarks: {text or "—"}           │
│  Auto Reply: {text or "—"}        │
└────────────────────────────────────┘

⚠️ Please confirm to publish (reply "确认" or "confirm")
```

### 2.3 Publish Ad

**Trigger:**
- "确认" / "confirm" / "发布" (after 2.2 summary)

**Behavior:**
1. User confirms → call `POST /sapi/v1/c2c/agent/ads/post`
2. Return result

**Output format (Success):**
```
✅ Ad Published Successfully!
├─ Ad Number: {advNo}
├─ Status: Online
├─ View: https://c2c.binance.com/en/adv?code={advNo}
└─ Manage: say "查看我的广告" to see all your ads
```

**Output format (Failure):**
```
❌ Ad Publish Failed
├─ Error: {error message}
└─ Suggestion: {actionable fix}
```

**Common errors:**
- `Permission denied` → User is not a verified merchant
- `FIAT_ASSET_ILLEGAL` → BIDR can only pair with IDR
- Insufficient balance → Check asset balance before publishing

### 2.4 Manage Existing Ads

**Trigger:**
- "查看我的广告" / "List my ads"
- "把第 1 条广告下架" / "Take the first ad offline"
- "修改我那条 USDT 卖单的价格" / "Update price for my USDT sell ad"

#### List My Ads
Call `POST /sapi/v1/c2c/agent/ads/listWithPagination`

**Output format:**
```
📋 My Advertisements (Total: {total})
┌────┬──────────────┬──────┬───────┬──────────┬─────────────┬──────────┬────────┐
│ #  │ Ad No        │ Type │ Asset │ Price    │ Remaining   │ Limit    │ Status │
├────┼──────────────┼──────┼───────┼──────────┼─────────────┼──────────┼────────┤
│ 1  │ {advNo}      │ SELL │ USDT  │ ¥{price} │ {surplus}   │ {min}~{max}│ Online │
│ 2  │ {advNo}      │ BUY  │ BTC   │ ¥{price} │ {surplus}   │ {min}~{max}│ Offline│
└────┴──────────────┴──────┴───────┴──────────┴─────────────┴──────────┴────────┘

# If any ad has remarks or autoReplyMsg, show below the table:
Ad Terms:
  #1: {remarks or "—"} | Auto-reply: {autoReplyMsg or "—"}
  #2: {remarks or "—"} | Auto-reply: {autoReplyMsg or "—"}

Actions: "修改第1条广告价格" | "下架第2条" | "查看详情 {advNo}"
```

#### View Ad Detail
Call `POST /sapi/v1/c2c/agent/ads/getDetailByNo`

**Trigger:** "查看详情 {advNo}" / "Show ad detail"

**Output format:**
```
📄 Ad Detail: {advNo}
├─ Type: {tradeType} {asset}/{fiatUnit}
├─ Price: {currencySymbol}{price} ({priceType: Fixed/Floating})
├─ Remaining: {surplusAmount} / {initAmount} {asset}
├─ Limit: {minSingleTransAmount} ~ {maxSingleTransAmount} {fiatUnit}
├─ Payment Methods: {tradeMethodName1, tradeMethodName2}
├─ Status: {status}
├─ Payment Timeout: {payTimeLimit} min
│
├─ Trading Terms:
│  {remarks or "No terms set"}
│
├─ Auto-Reply Message:
│  {autoReplyMsg or "No auto-reply set"}
│
└─ Advanced:
   ├─ Buyer KYC: {Yes/No}
   ├─ Min Reg Days: {buyerRegDaysLimit or "—"}
   └─ Extra Verify: {takerAdditionalKycRequired ? "Yes" : "No"}
```

> **Display rule for `remarks` and `autoReplyMsg`:** These fields are returned by `getDetailByNo`, `listWithPagination`, and `search`. When present and non-empty, always show them. When null/empty, show "—" or a placeholder like "No terms set". Never omit the section silently — the user should know whether terms exist.

**Ad status code mapping:**

| Code | Display | Chinese |
|------|---------|---------|
| 1 | Online | 在线 |
| 2 | Offline | 离线 |
| 4 | Closed | 已关闭 |

#### Update Ad

**Behavior:**
1. Identify which ad to update (by # in list or advNo)
2. Show diff: old value → new value
3. Wait for confirmation
4. Call `POST /sapi/v1/c2c/agent/ads/update`

**Confirmation format:**
```
📝 Update Ad: {advNo}
┌──────────────┬─────────────┬─────────────┐
│ Field        │ Current     │ New         │
├──────────────┼─────────────┼─────────────┤
│ Price        │ ¥7.20       │ ¥6.99       │
│ Max Limit    │ ¥50,000     │ ¥100,000    │
└──────────────┴─────────────┴─────────────┘

⚠️ Confirm update? (reply "确认" or "confirm")
```

#### Update Ad Status (Online / Offline / Close)

**Behavior:**
1. Identify target ad(s) — supports batch operation
2. Show confirmation
3. Call `POST /sapi/v1/c2c/agent/ads/updateStatus`

**Confirmation format:**
```
🔄 Status Update
├─ Ads: {advNo1}, {advNo2}
├─ Action: {Online → Offline}
└─ ⚠️ Confirm? (reply "确认" or "confirm")
```

**Result format:**
```
✅ Status updated: {n} ad(s) → {status}
# Or if partial failure:
⚠️ Partial success: {n} updated, {m} failed
Failed:
├─ {advNo}: {errorMessage}
```

---

## Scene 2 Supplement: Merchant & Currency Queries

### View Merchant Profile

**Trigger:**
- "查看商家 {merchantNo} 的信息"
- "Show me merchant details"

**Behavior:** Call `GET /sapi/v1/c2c/agent/merchant/getAdDetails?merchantNo={merchantNo}`

**Output format:**
```
👤 Merchant: {nickName}
├─ Type: {userType}
├─ Total Orders: {orderCount}
├─ 30-Day Orders: {monthOrderCount}
├─ 30-Day Completion: {monthFinishRate}%
├─ Avg Release Time: {advConfirmTime}s
├─ Online: {onlineStatus}
├─ Registered: {registerDays} days
│
├─ 30-Day Stats:
│  ├─ Avg Release: {avgReleaseTimeOfLatest30day}s
│  ├─ Avg Payment: {avgPayTimeOfLatest30day}s
│  └─ Completed: {completedOrderNumOfLatest30day}
│
├─ Buy Ads ({n}):
│  1. {advNo} | {asset}/{fiat} | {price} | {surplus} remaining
│     └─ Terms: {remarks or "—"}
│
└─ Sell Ads ({n}):
   1. {advNo} | {asset}/{fiat} | {price} | {surplus} remaining
      └─ Terms: {remarks or "—"}
```

### List Supported Currencies

**Trigger:**
- "P2P支持哪些币种？"
- "What fiat currencies are supported?"

**Behavior:**
- Digital currencies: `POST /sapi/v1/c2c/agent/digitalCurrency/list`
- Fiat currencies: `POST /sapi/v1/c2c/agent/fiatCurrency/list`

---

## Phase 3 API Overview

### Order & Appeal (SAPI Agent — Requires Auth)
Base URL: `https://api.binance.com`

| Endpoint | Method | Auth | Usage |
|----------|--------|------|-------|
| `/sapi/v1/c2c/agent/orderMatch/getUserOrderDetail` | POST | Yes | Get order detail by order number |
| `/sapi/v1/c2c/agent/orderMatch/listOrders` | POST | Yes | List orders with filters |
| `/sapi/v1/c2c/agent/orderMatch/listUserOrderHistory` | GET | Yes | List order history (paginated) |
| `/sapi/v1/c2c/agent/complaint/query-complaints` | POST | Yes | Query complaint/appeal records |
| `/sapi/v1/c2c/agent/complaint/submit-evidence` | POST | Yes | Submit appeal evidence (**write**) |
| `/sapi/v1/c2c/agent/complaint/get-complaint-flows` | POST | Yes | Get complaint process timeline |
| `/sapi/v1/c2c/agent/complaint/cancel-complaint` | POST | Yes | Cancel/withdraw appeal (**write**, irreversible) |
| `/sapi/v1/c2c/agent/complaint/get-complaint-reasons` | POST | Yes | Get available complaint reasons |
| `/sapi/v1/c2c/agent/file-upload/get-s3-presigned-url` | GET | Yes | Get S3 presigned URL for evidence upload |

### Ad Management (SAPI Agent — Requires Auth)
Base URL: `https://api.binance.com`

| Endpoint | Method | Auth | Usage |
|----------|--------|------|-------|
| `/sapi/v1/c2c/agent/ads/getDetailByNo` | POST | Yes | Get ad detail by ad number |
| `/sapi/v1/c2c/agent/ads/listWithPagination` | POST | Yes | List user's own ads (paginated) |
| `/sapi/v1/c2c/agent/ads/search` | POST | Yes | Search market ads with filters |
| `/sapi/v1/c2c/agent/ads/getReferencePrice` | POST | Yes | Get reference price for asset/fiat |
| `/sapi/v1/c2c/agent/ads/getAvailableAdsCategory` | GET | Yes | Get publishable ad categories |
| `/sapi/v1/c2c/agent/ads/getPayMethodByUserId` | GET | Yes | Get user's payment methods |
| `/sapi/v1/c2c/agent/ads/listAllTradeMethods` | POST | Yes | List all system trade methods |
| `/sapi/v1/c2c/agent/ads/post` | POST | Yes | Publish a new ad (**write**) |
| `/sapi/v1/c2c/agent/ads/update` | POST | Yes | Update an existing ad (**write**) |
| `/sapi/v1/c2c/agent/ads/updateStatus` | POST | Yes | Batch update ad status (**write**) |

### Merchant (SAPI Agent — Requires Auth)
Base URL: `https://api.binance.com`

| Endpoint | Method | Auth | Usage |
|----------|--------|------|-------|
| `/sapi/v1/c2c/agent/merchant/getAdDetails` | GET | Yes | Get merchant profile + ad listings |

### Support (SAPI Agent — Requires Auth)
Base URL: `https://api.binance.com`

| Endpoint | Method | Auth | Usage |
|----------|--------|------|-------|
| `/sapi/v1/c2c/agent/digitalCurrency/list` | POST | Yes | List supported digital currencies |
| `/sapi/v1/c2c/agent/fiatCurrency/list` | POST | Yes | List supported fiat currencies |

> **Full API reference** with request/response schemas: see `references/agent-sapi-api.md`

## Phase 3 Error Handling (Additional)

| Error | Cause | User Action |
|-------|-------|-------------|
| Permission denied | User is not a verified merchant | Guide to merchant verification page |
| FIAT_ASSET_ILLEGAL | BIDR paired with non-IDR fiat | Use IDR as fiat for BIDR |
| ILLEGAL_PARAMETERS | Missing or invalid fields | Re-check required parameters |
| Ad not found | Invalid advNo | Verify ad number via list |
| Status update partial failure | Some ads can't change status | Check individual error codes in failList |

## Phase 3 Limitations

This skill does NOT (in Phase 3):
- Initiate new appeals / submit-complaint (only evidence supplement for existing appeals is supported)
- Auto-monitor appeal status changes (polling not supported in skill)
- Place orders on behalf of user (guide to ad detail page instead)
- Access chat messages or send messages in order chat
- Modify payment method configurations (only read)
- Access KYC/verification status details

For appeal initiation and real-time appeal monitoring, guide users to the official P2P dispute center.
