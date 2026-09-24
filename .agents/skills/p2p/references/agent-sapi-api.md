# Agent SAPI API Reference

Complete API reference for all C2C Agent SAPI endpoints used by the P2P Skill (Phase 3).

All endpoints require authentication (API Key + HMAC SHA256 signature).
See `authentication.md` for signing details.

**Base URL:** `https://api.binance.com`

**Common Headers:**
```
X-MBX-APIKEY: {your_api_key}
User-Agent: binance-wallet/1.0.0 (Skill)
```

**Common Response Wrapper:**
```json
{
  "code": "000000",
  "message": null,
  "data": { ... },
  "success": true
}
```

**Paginated Response Wrapper:**
```json
{
  "code": "000000",
  "data": [ ... ],
  "total": 100,
  "success": true
}
```

---

## 1. Order Match APIs

### 1.1 Get Order Detail

Get detailed information for a specific order.

```
POST /sapi/v1/c2c/agent/orderMatch/getUserOrderDetail
```

**Request Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| orderNumber | String | Yes | Order number to query |

**Response (AgentOrderDetailResp):**

| Field | Type | Description |
|-------|------|-------------|
| orderNumber | String | Order number |
| advOrderNumber | String | Advertisement order number |
| tradeType | String | BUY / SELL |
| orderStatus | Integer | 1=Unpaid, 2=Paid, 3=Appealing, 4=Completed, 6=Cancelled, 7=CancelledBySystem |
| asset | String | Crypto asset (e.g. USDT) |
| amount | BigDecimal | Crypto amount |
| price | BigDecimal | Unit price |
| totalPrice | BigDecimal | Total fiat amount |
| fiatUnit | String | Fiat currency code |
| fiatSymbol | String | Fiat symbol (e.g. ¥) |
| buyerNickname | String | Buyer nickname (not masked) |
| sellerNickname | String | Seller nickname (not masked) |
| createTime | Date | Order creation time |
| notifyPayTime | Date | Buyer marked paid time |
| confirmPayTime | Date | Seller confirmed time |
| cancelTime | Date | Order cancel time |
| notifyPayEndTime | Date | Payment deadline |
| confirmPayEndTime | Date | Release deadline |
| isComplaintAllowed | Boolean | Whether complaint is allowed |
| complaintStatus | Integer | Complaint status |
| commissionRate | BigDecimal | Maker commission rate |
| commission | BigDecimal | Maker commission amount |
| takerCommissionRate | BigDecimal | Taker commission rate |
| takerCommission | BigDecimal | Taker commission amount |
| takerAmount | BigDecimal | Taker net amount |

**Example:**
```bash
curl -X POST "https://api.binance.com/sapi/v1/c2c/agent/orderMatch/getUserOrderDetail?timestamp=${TIMESTAMP}&signature=${SIGNATURE}" \
  -H "X-MBX-APIKEY: ${API_KEY}" \
  -H "User-Agent: binance-wallet/1.0.0 (Skill)" \
  -H "Content-Type: application/json" \
  -d '{"orderNumber": "20260315123456789"}'
```

> **Note:** See `authentication.md` for the complete Bash signing setup.

---

### 1.2 List Orders

List orders with rich filters and pagination.

```
POST /sapi/v1/c2c/agent/orderMatch/listOrders
```

**Request Body (JSON):**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| advNo | String | No | — | Filter by advertisement number |
| asset | String | No | — | Filter by crypto asset |
| orderStatus | Integer | No | — | Filter by single status |
| tradeType | String | No | — | 0=BUY, 1=SELL |
| payType | Integer | No | — | Filter by payment method type |
| orderStatusList | List\<Integer\> | No | — | Filter by multiple statuses |
| startDate | Long | No | — | Start timestamp (ms) |
| endDate | Long | No | — | End timestamp (ms) |
| page | Integer | No | 1 | Page number |
| rows | Integer | No | 20 | Page size (max 20) |

**Response (Paginated List of AgentOrderListResp):**

| Field | Type | Description |
|-------|------|-------------|
| orderNumber | String | Order number |
| advNo | String | Advertisement number |
| tradeType | String | Trade type |
| asset | String | Crypto asset |
| fiat | String | Fiat currency |
| fiatSymbol | String | Fiat symbol |
| amount | String | Crypto amount |
| totalPrice | String | Total fiat amount |
| orderStatus | Integer | Status code |
| createTime | Date | Creation time |
| confirmPayEndTime | Date | Release deadline |
| notifyPayEndTime | Date | Payment deadline |
| buyerNickname | String | Buyer nickname |
| sellerNickname | String | Seller nickname |
| commissionRate | BigDecimal | Maker commission rate |
| commission | BigDecimal | Maker commission |
| takerCommissionRate | BigDecimal | Taker commission rate |
| takerCommission | BigDecimal | Taker commission |
| takerAmount | BigDecimal | Taker net amount |

---

### 1.3 List User Order History

List historical orders with pagination.

```
GET /sapi/v1/c2c/agent/orderMatch/listUserOrderHistory
```

**Query Parameters:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| startTimestamp | Long | No | 30 days ago | Start timestamp (ms) |
| endTimestamp | Long | No | now | End timestamp (ms) |
| tradeType | String | No | — | BUY / SELL |
| page | Integer | No | 1 | Page number (min 1) |
| rows | Integer | No | 100 | Page size (min 1, max 100) |

**Response (Paginated List of AgentOrderHistoryResp):**

| Field | Type | Description |
|-------|------|-------------|
| orderNumber | String | Order number |
| advNo | String | Advertisement number |
| tradeType | String | Trade type |
| asset | String | Crypto asset |
| fiat | String | Fiat currency |
| fiatSymbol | String | Fiat symbol |
| amount | String | Crypto amount |
| totalPrice | String | Total fiat amount |
| unitPrice | BigDecimal | Unit price |
| orderStatus | String | Status name (e.g. COMPLETED) |
| createTime | Date | Creation time |
| commission | BigDecimal | Commission |
| takerCommissionRate | BigDecimal | Taker commission rate |
| takerCommission | BigDecimal | Taker commission |
| takerAmount | BigDecimal | Taker net amount |
| counterPartNickName | String | Counterparty nickname (not masked) |
| payMethodName | String | Payment method name |
| advertisementRole | String | MAKER / TAKER |

---

## 2. Complaint APIs

### 2.1 Query Complaints

Query complaint/appeal records with filters and pagination.

```
POST /sapi/v1/c2c/agent/complaint/query-complaints
```

**Request Body (JSON):**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| roleIdentity | String | No | — | COMPLAINANT or RESPONDENT |
| orderNoList | List\<String\> | No | — | Filter by order numbers |
| complaintStatusList | List\<Integer\> | No | — | Filter by complaint statuses |
| orderStatusListWhenInitiate | List\<Integer\> | No | — | Filter by order status at complaint time |
| startTime | Date | No | 90 days ago | Query start time |
| endTime | Date | No | now | Query end time |
| page | Integer | No | 1 | Page number |
| rows | Integer | No | 20 | Page size |

**Response (Paginated List of AgentComplaintQueryResp):**

| Field | Type | Description |
|-------|------|-------------|
| orderNo | String | Order number |
| complaintNo | Long | Complaint number |
| complaintStatus | Integer | Complaint status |
| orderStatusWhenInitiate | Integer | Order status when complaint was filed |
| complaintCreateTime | Date | Complaint creation time |
| reason | String | Complaint reason |
| roleIdentity | String | COMPLAINANT / RESPONDENT |
| orderFiat | String | Order fiat currency |
| orderAsset | String | Order crypto asset |
| orderAmount | BigDecimal | Order amount |
| orderAmountInUsdt | BigDecimal | Order amount in USDT |
| disputeAmount | BigDecimal | Dispute amount |

---

## 3. Ads APIs

### 3.1 Get Ad Detail By Number

```
POST /sapi/v1/c2c/agent/ads/getDetailByNo?advNo={advNo}
```

**Query Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| advNo | String | Yes | Advertisement number |

> **Note:** This endpoint only returns ads owned by the authenticated user. Querying another user's ad will return error `-1002`.

**Response (AgentAdDetailResp):**

| Field | Type | Description |
|-------|------|-------------|
| advNo | String | Advertisement number |
| classify | String | mass / profession / block / cash |
| tradeType | String | BUY / SELL |
| asset | String | Crypto asset |
| fiatUnit | String | Fiat currency code |
| advStatus | Integer | 1=Online, 3=Offline, 4=Closed |
| priceType | Integer | 1=Fixed, 2=Floating |
| priceFloatingRatio | BigDecimal | Floating ratio % |
| price | BigDecimal | Unit price |
| initAmount | BigDecimal | Initial amount |
| surplusAmount | BigDecimal | Remaining amount |
| tradableQuantity | BigDecimal | Tradable quantity |
| maxSingleTransAmount | BigDecimal | Max fiat per order |
| minSingleTransAmount | BigDecimal | Min fiat per order |
| payTimeLimit | Integer | Payment time limit (min) |
| remarks | String | Remarks |
| autoReplyMsg | String | Auto reply message |
| createTime | Date | Creation time |
| tradeMethods | List\<AgentTradeMethodResp\> | Payment methods |
| commissionRate | BigDecimal | Commission rate |
| buyerKycLimit | Integer | Buyer KYC required |
| buyerRegDaysLimit | Integer | Buyer min reg days |
| buyerBtcPositionLimit | BigDecimal | Buyer min BTC |
| takerAdditionalKycRequired | Integer | Extra verification |

**AgentTradeMethodResp:**

| Field | Type | Description |
|-------|------|-------------|
| identifier | String | Method identifier (e.g. ALIPAY) |
| tradeMethodName | String | Display name |
| iconUrlColor | String | Icon URL |

---

### 3.2 List Ads With Pagination

List current user's own advertisements.

```
POST /sapi/v1/c2c/agent/ads/listWithPagination
```

**Request Body (JSON):**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | Integer | No | 1 | Page number |
| rows | Integer | No | 20 | Page size |

**Response:** Paginated list of `AgentAdDetailResp` (same schema as 3.1).

---

### 3.3 Search Ads

Search market ads with rich filters.

```
POST /sapi/v1/c2c/agent/ads/search
```

**Request Body (JSON):**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| publisherType | String | No | — | "user" or "merchant" |
| fiat | String | Yes | — | Fiat currency |
| asset | String | Yes | — | Crypto asset |
| tradeType | String | Yes | — | BUY / SELL |
| payTypes | List\<String\> | No | — | Payment method filters |
| transAmount | BigDecimal | No | — | Transaction amount filter |
| countries | List\<String\> | No | — | Country filters |
| classifies | List\<String\> | No | auto | Ad classifies filter |
| page | Integer | No | 1 | Page number |
| rows | Integer | No | 20 | Page size |

**Response (Paginated List of AgentAdSearchResp):**

| Field | Type | Description |
|-------|------|-------------|
| adv | AgentAdDetailResp | Ad detail (see 3.1) |
| advertiser | AgentAdvertiserResp | Advertiser info |

**AgentAdvertiserResp:**

| Field | Type | Description |
|-------|------|-------------|
| userNo | String | User number |
| nickName | String | Nickname (not masked) |
| orderCount | Integer | Total order count |
| monthOrderCount | Integer | 30-day orders |
| monthFinishRate | BigDecimal | 30-day completion rate |
| advConfirmTime | Integer | Avg release time (seconds) |
| userType | String | user / merchant |
| tagIconUrls | List\<String\> | Tag icon URLs |

---

### 3.4 Get Reference Price

Get market reference prices for pricing decisions.

```
POST /sapi/v1/c2c/agent/ads/getReferencePrice
```

**Request Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| assets | List\<String\> | No | Crypto assets (max 3), e.g. ["BTC","ETH","USDT"] |
| fiatCurrency | String | Yes | Fiat currency |
| tradeType | String | Yes | BUY or SELL |
| payType | String | No | Payment method filter |

**Response (List of AgentAdReferencePriceResp):**

| Field | Type | Description |
|-------|------|-------------|
| asset | String | Crypto asset |
| currency | String | Fiat currency |
| currencyScale | Integer | Fiat decimal scale |
| currencySymbol | String | Fiat symbol |
| referencePrice | BigDecimal | Reference exchange rate |
| assetScale | Integer | Asset decimal scale |
| priceScale | Integer | Price decimal scale |

---

### 3.5 Get Available Ads Category

Get ad categories the current user can publish.

```
GET /sapi/v1/c2c/agent/ads/getAvailableAdsCategory
```

**No request body.**

**Response (AgentAdsCategoryResp):**

| Field | Type | Description |
|-------|------|-------------|
| advClassifies | List\<String\> | Available classifies: mass, profession, block, cash |

---

### 3.6 Get User Payment Methods

Get current user's configured payment methods (agent-safe: no account details).

```
GET /sapi/v1/c2c/agent/ads/getPayMethodByUserId
```

**No request body.**

**Response (List of AgentPayMethodResp):**

| Field | Type | Description |
|-------|------|-------------|
| payId | Long | Payment method ID (needed for SELL ads) |
| identifier | String | Method identifier (e.g. ALIPAY) |
| tradeMethodName | String | Display name |

> **Note:** For SELL ads, use `payId` in tradeMethods. For BUY ads, use `identifier` from system trade methods.

---

### 3.7 List All System Trade Methods

List all available trade methods in the system.

```
POST /sapi/v1/c2c/agent/ads/listAllTradeMethods
```

**No request body.**

**Response (List of TradeMethodBaseInfoVO):**

| Field | Type | Description |
|-------|------|-------------|
| identifier | String | Trade method identifier |
| tradeMethodName | String | Display name |
| (other fields) | — | Additional method info |

---

### 3.8 Post Ad (Write Operation)

Publish a new advertisement. **Requires merchant permission.**

```
POST /sapi/v1/c2c/agent/ads/post
```

**Request Body (JSON):**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| classify | String | Yes | "mass" | Ad category |
| tradeType | String | Yes | — | 0=BUY, 1=SELL |
| asset | String | Yes | — | Crypto asset |
| fiatUnit | String | Yes | — | Fiat currency |
| priceType | Integer | Yes | — | 1=Fixed, 2=Floating |
| priceFloatingRatio | BigDecimal | Conditional | — | Required if priceType=2 |
| rateFloatingRatio | BigDecimal | No | — | Exchange rate floating |
| price | BigDecimal | Conditional | — | Required if priceType=1 |
| initAmount | BigDecimal | Yes | — | Total crypto amount |
| maxSingleTransAmount | BigDecimal | Yes | — | Max fiat per order |
| minSingleTransAmount | BigDecimal | Yes | — | Min fiat per order |
| buyerKycLimit | Integer | Yes | — | 0=No, 1=Yes |
| buyerRegDaysLimit | Integer | No | — | Min buyer reg days |
| buyerBtcPositionLimit | BigDecimal | No | — | Min buyer BTC |
| remarks | String | No | — | Max 1000 chars |
| autoReplyMsg | String | No | — | Max 1000 chars |
| onlineNow | Boolean | No | — | Go online immediately |
| payTimeLimit | Integer | No | — | Payment time limit (min) |
| tradeMethods | List\<TradeMethod\> | Yes | — | Payment methods |
| takerAdditionalKycRequired | Integer | No | — | 0=No, 1=Yes |
| launchCountry | List\<String\> | No | — | Target countries |

**TradeMethod object:**

| Field | Type | Description |
|-------|------|-------------|
| payId | Long | User's payment method ID (for SELL ads) |
| payType | String | Payment type |
| identifier | String | Trade method identifier (for BUY ads) |

**Response:** `CommonRet<String>` where data is the new ad number (advNo).

---

### 3.9 Update Ad (Write Operation)

Update an existing advertisement. **Requires merchant permission.**

> **Important — full-object update:** The downstream service validates the complete ad object, not just the changed fields. Sending only `advNo` + one field (e.g. `price`) will result in error `-9000`. The recommended workflow is:
> 1. Call `getDetailByNo?advNo={advNo}` to fetch the current ad.
> 2. Merge your changes into the full response object.
> 3. Submit the merged object to this endpoint.

```
POST /sapi/v1/c2c/agent/ads/update
```

**Request Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| advNo | String | Yes | Ad number to update |
| tradeType | String | No | 0=BUY, 1=SELL |
| asset | String | No | Crypto asset |
| fiatUnit | String | No | Fiat currency |
| priceType | Integer | No | 1=Fixed, 2=Floating |
| priceFloatingRatio | BigDecimal | No | Floating ratio |
| rateFloatingRatio | BigDecimal | No | Rate floating |
| price | BigDecimal | No | Fixed price |
| initAmount | BigDecimal | No | Total amount |
| maxSingleTransAmount | BigDecimal | No | Max fiat per order |
| minSingleTransAmount | BigDecimal | No | Min fiat per order |
| buyerKycLimit | Integer | No | 0=No, 1=Yes |
| buyerRegDaysLimit | Integer | No | Min reg days |
| buyerBtcPositionLimit | BigDecimal | No | Min BTC |
| remarks | String | No | Remarks |
| autoReplyMsg | String | No | Auto reply |
| payTimeLimit | Integer | No | Payment time limit |
| tradeMethods | List\<TradeMethod\> | No | Payment methods |
| advStatus | Integer | No | 1=Online, 3=Offline, 4=Closed |
| takerAdditionalKycRequired | Integer | No | 0=No, 1=Yes |
| launchCountry | List\<String\> | No | Countries |

**Response:** `CommonRet<Boolean>` — true if update succeeded.

---

### 3.10 Update Ad Status (Write Operation)

Batch update advertisement status (online/offline/close).

```
POST /sapi/v1/c2c/agent/ads/updateStatus
```

**Request Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| advNos | List\<String\> | Yes | Ad numbers to update (min 1) |
| advStatus | Integer | Yes | 1=Online, 3=Offline, 4=Closed |

**Response (AgentAdUpdateStatusResp):**

| Field | Type | Description |
|-------|------|-------------|
| status | Boolean | Overall success/failure |
| failList | List\<StatusUpdateResult\> | Failed items (if any) |

**StatusUpdateResult:**

| Field | Type | Description |
|-------|------|-------------|
| advNo | String | Failed ad number |
| errorCode | String | Error code |
| errorMessage | String | Error description |

---

## 4. Merchant APIs

### 4.1 Get Merchant Ad Details

Get merchant public profile with buy/sell ad listings.

```
GET /sapi/v1/c2c/agent/merchant/getAdDetails?merchantNo={merchantNo}
```

**Query Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| merchantNo | String | Yes | Merchant number |

**Response (AgentMerchantAdsDetailResp):**

| Field | Type | Description |
|-------|------|-------------|
| merchant | AgentMerchantDetailResp | Merchant profile |
| buyList | List\<AgentAdDetailResp\> | Buy advertisements |
| sellList | List\<AgentAdDetailResp\> | Sell advertisements |

**AgentMerchantDetailResp:**

| Field | Type | Description |
|-------|------|-------------|
| merchantNo | String | Merchant number |
| userType | String | user / merchant |
| nickName | String | Nickname (not masked) |
| orderCount | Integer | Total order count |
| monthOrderCount | Integer | 30-day orders |
| monthFinishRate | BigDecimal | 30-day completion rate |
| advConfirmTime | Integer | Avg release time (s) |
| onlineStatus | String | 0=Offline, 1=Online |
| registerDays | Integer | Registration days |
| firstOrderDays | Integer | Days since first order |
| avgReleaseTimeOfLatest30day | Double | 30-day avg release (s) |
| avgPayTimeOfLatest30day | Double | 30-day avg payment (s) |
| completedOrderNumOfLatest30day | Long | 30-day completed orders |

---

## 5. Support APIs

### 5.1 List Digital Currencies

```
POST /sapi/v1/c2c/agent/digitalCurrency/list
```

**No request body.**

**Response:** `List<DigitalCurrencyResponse>` — all supported digital currencies.

---

### 5.2 List Fiat Currencies

```
POST /sapi/v1/c2c/agent/fiatCurrency/list
```

**No request body.**

**Response:** `List<FiatCurrencyResponse>` — all supported fiat currencies.

---

## Authentication Notes

All Agent SAPI endpoints share the same authentication mechanism:

1. All requests require `timestamp` and `signature` query parameters
2. **SAPI signing: DO NOT sort parameters** — keep insertion order
3. Required headers: `X-MBX-APIKEY` + `User-Agent`
4. See `authentication.md` for complete signing process

## Privacy & Security

All Agent SAPI responses are **pre-filtered** at the DTO level:
- **Excluded:** real names, phone numbers, emails, bank accounts, payment details, KYC info
- **Included:** nicknames (not masked), order/ad data, trade statistics
- The Agent field filter (`AgentFieldFilter`) handles any runtime masking needed

## 6. File Upload (AgentFileUploadController)

Base path: `/sapi/v1/c2c/agent/file-upload`

### 6.1 Get S3 Presigned URL

```
GET /sapi/v1/c2c/agent/file-upload/get-s3-presigned-url
```

Get a presigned S3 URL for uploading complaint evidence files. The URL is valid for 5 minutes.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fileName | String | Yes | File name with extension, e.g. `proof.jpg` |
| scenario | String | No | Upload scenario. Default: `complaint`. Agent only supports `complaint`. |

**Response:** `S3FileUrlInfo`

| Field | Type | Description |
|-------|------|-------------|
| uploadUrl | String | S3 presigned upload URL (PUT to this URL with file binary) |
| filePath | String | Final file path in S3 (use this in submit-evidence `fileUrls`) |

**Supported file types (complaint scenario):**
`txt, doc, xls, docx, xlsx, jpg, jpeg, png, pdf, mp3, mp4, avi, rm, rmvb, mov, wmv`

**Upload flow:**
1. Call this endpoint to get `uploadUrl` and `filePath`
2. `PUT` the file binary to `uploadUrl` (must complete within 5 minutes)
3. Use `filePath` in the `submit-evidence` request

---

## 7. Complaint Operations (AgentComplaintController — Extended)

These endpoints extend the existing complaint controller (Section 2).

### 7.1 Submit Appeal Evidence

```
POST /sapi/v1/c2c/agent/complaint/submit-evidence
```

Submit supplementary evidence for an existing complaint/appeal.

**Request Body:** `AgentComplaintSupplementReq`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| orderNo | String | Yes | Order number |
| description | String | Yes | Evidence description (1-500 chars) |
| fileUrls | List\<String\> | No | List of S3 file paths from presigned upload |

**Response:** `Boolean` — `true` if evidence submitted successfully.

**Error cases:**
- Order not found / not in appeal → error response
- No active complaint for order → error response
- File URLs not from valid S3 upload → may fail validation

---

### 7.2 Get Complaint Flows (Timeline)

```
POST /sapi/v1/c2c/agent/complaint/get-complaint-flows
```

Get the chronological timeline of a complaint process, including all actions, evidence submissions, and CS reviews.

**Request Body:** `AgentComplaintFlowQueryReq`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| orderNo | String | Yes | Order number |
| complaintNo | Long | No | Specific complaint number (optional; narrows to specific complaint) |

**Response:** `List<AgentComplaintFlowResp>`

| Field | Type | Description |
|-------|------|-------------|
| complaintNo | Long | Complaint number |
| orderNo | String | Order number |
| infoType | Integer | Flow info type (1=Initiated, 2=Evidence, 3=CS Note, 4=Resolution) |
| description | String | Flow entry description |
| fileUrls | List\<String\> | Evidence file URLs (CDN-assembled, directly accessible) |
| creatorNickName | String | Creator nickname |
| operatorName | String | Operator name (CS agent if applicable) |
| remark | String | Remark (plain text) |
| remarkHtml | String | Remark (HTML version; takes precedence over `remark` when available) |
| createTime | Date | Flow entry creation time |
| source | String | Flow info source |

---

### 7.3 Cancel Complaint

```
POST /sapi/v1/c2c/agent/complaint/cancel-complaint
```

Cancel (withdraw) an existing complaint/appeal for an order. This is an irreversible action.

**Request Body:** `AgentComplaintCancelReq`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| orderNo | String | Yes | Order number of the complaint to cancel |

**Response:** `Boolean` — `true` if the complaint was successfully cancelled.

**Error cases:**
- Order not found → error response
- No active complaint for order → error response
- Complaint already resolved/closed → error response
- User not the complaint initiator → error response

**Important:** The agent MUST confirm with the user before calling this endpoint, as cancelling an appeal is irreversible and the user forfeits their dispute rights.

---

### 7.4 Get Complaint Reasons

```
POST /sapi/v1/c2c/agent/complaint/get-complaint-reasons
```

Get available complaint/appeal reasons for a given order. Returns localized reason descriptions.

**Request Body:** `AgentComplaintCancelReq` (reused — only needs `orderNo`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| orderNo | String | Yes | Order number to get complaint reasons for |

**Response:** `List<AgentComplaintReasonResp>`

| Field | Type | Description |
|-------|------|-------------|
| reasonCode | Integer | Reason code identifier |
| reasonDesc | String | Localized reason description |

**Error cases:**
- Order not found → error response
- Order not in a state where complaints are applicable → error response
