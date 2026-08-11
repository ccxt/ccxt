---
name: binance-tokenized-securities-info
description: |
  Query Ondo tokenized US stock data on Binance Web3.
  Covers: supported stock token list, RWA metadata (company info, attestation reports),
  market and per-asset trading status (with corporate action codes for earnings, dividends, splits),
  real-time on-chain data (token price, holders, circulating supply, market cap),
  US stock fundamentals (P/E, dividend yield, 52-week range), and token K-Line/candlestick charts.

  Use this skill when users ask about:
  - Tokenized stock price, holders, or on-chain data for specific tickers
  - Whether a stock token is tradable, paused, or halted
  - Ondo RWA token list or which US stocks are available on-chain
  - Corporate actions affecting a token (dividends, stock splits, earnings halt)
  - Stock token K-Line or candlestick chart data
  - Comparing on-chain token price vs US stock price

  NOT for general crypto tokens (BTC, ETH, SOL, etc.) — use query-token-info for those.
metadata:
  author: binance-web3-team
  version: "1.1"
---

# Binance Tokenized Securities Info Skill

## Overview

| API                 | Function                  | Use Case                                                        |
|---------------------|---------------------------|-----------------------------------------------------------------|
| Token Symbol List   | List all tokenized stocks | Browse Ondo supported tickers, filter by type                   |
| RWA Meta            | Tokenized stock metadata  | Company info, concepts, attestation reports                     |
| Market Status       | Overall market open/close | Check if Ondo market is currently trading                       |
| Asset Market Status | Per-asset trading status  | Detect corporate actions (earnings, dividends, splits, mergers) |
| RWA Dynamic V2      | Full real-time data       | On-chain price, holders, US stock fundamentals, order limits    |
| Token K-Line        | Candlestick charts        | OHLC data for on-chain token price technical analysis           |

## Recommended Workflows

| Scenario                                         | Steps                                                                      |
|--------------------------------------------------|----------------------------------------------------------------------------|
| Look up a stock's fundamentals and on-chain data | API 1 (get `chainId` + `contractAddress` by ticker) → API 5 (dynamic data) |
| Check if a stock token is tradable               | API 3 (overall market status) → API 4 (per-asset status with reason code)  |
| Research a tokenized stock                       | API 1 (find token) → API 2 (company metadata + attestation reports)        |
| Get K-Line chart data                            | API 1 (find token) → API 6 (K-Line with interval)                          |

## Use Cases

1. **List Supported Stocks**: Get all Ondo tokenized tickers with chain and contract info
2. **Company Research**: Get company metadata, CEO, industry, concept tags, and attestation reports
3. **Market Status Check**: Determine if the Ondo market is open, closed, or in pre/post-market session
4. **Corporate Action Detection**: Check if a specific asset is paused or limited due to earnings, dividends, stock splits, mergers, or maintenance
5. **Real-Time Data**: Get on-chain price, holder count, circulating supply, US stock P/E, dividend yield, 52-week range, and order limits
6. **Technical Analysis**: Fetch token K-Line (candlestick) data with configurable intervals and time ranges

## Key Concept: Token ≠ Share

Each token represents `multiplier` shares of the underlying stock, **not exactly 1 share**. Most tokens have a multiplier near 1.0 (cumulative dividend adjustment), but stock-split tokens can be 5.0 or 10.0 (e.g. multiplier = 10.0 means 1 token = 10 shares).

```
referencePrice = tokenInfo.price ÷ sharesMultiplier
```

See Notes §6 for common multiplier categories.

## Supported Chains

| Chain    | chainId |
|----------|---------|
| Ethereum | 1       |
| BSC      | 56      |

---

## API 1: Token Symbol List

### Method: GET

**URL**:
```
https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/stock/detail/list/ai
```

**Request Parameters**:

| Parameter | Type    | Required | Description                                                                                                                                                                  |
|-----------|---------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type      | integer | No       | Filter by platform: `1` = Ondo Finance (currently the only supported tokenized stock provider). Omit to return all platforms. **Use `type=1` to retrieve only Ondo tokens.** |

**Headers**: `Accept-Encoding: identity`

**Example**:
```bash
curl 'https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/stock/detail/list/ai' \
  -H 'Accept-Encoding: identity' \
  -H 'User-Agent: binance-web3/1.1 (Skill)'
```

**Response**:

```json
{
  "code": "000000",
  "data": [
    {
      "chainId": "1",
      "contractAddress": "<CONTRACT_ADDRESS>",
      "symbol": "<TOKEN_SYMBOL_ON>",
      "ticker": "<UNDERLYING_TICKER>",
      "type": 1,
      "multiplier": "1.021663864228987186"
    },
    {
      "chainId": "56",
      "contractAddress": "<CONTRACT_ADDRESS>",
      "symbol": "<TOKEN_SYMBOL_ON>",
      "ticker": "<UNDERLYING_TICKER>",
      "type": 1,
      "multiplier": "1.010063782256545489"
    }
  ],
  "success": true
}
```

**Response Fields** (each item in `data`):

| Field           | Type    | Description                                                   |
|-----------------|---------|---------------------------------------------------------------|
| chainId         | string  | Chain ID (`1` = Ethereum, `56` = BSC)                         |
| contractAddress | string  | Token contract address                                        |
| symbol          | string  | Token symbol (ticker + `on` suffix, e.g. `<TOKEN_SYMBOL_ON>`) |
| ticker          | string  | Underlying US stock ticker                                    |
| type            | integer | Platform type: `1` = Ondo                                     |
| multiplier      | string  | Shares multiplier (see Key Concept above, Notes §6)           |

---

## API 2: RWA Meta

### Method: GET

**URL**:
```
https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/meta/ai
```

**Request Parameters**:

| Parameter       | Type   | Required | Description                                    |
|-----------------|--------|----------|------------------------------------------------|
| chainId         | string | Yes      | Chain ID (e.g. `56` for BSC, `1` for Ethereum) |
| contractAddress | string | Yes      | Token contract address                         |

**Headers**: `Accept-Encoding: identity`

**Example**:
```bash
curl 'https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/meta/ai?chainId=56&contractAddress=<CONTRACT_ADDRESS>' \
  -H 'Accept-Encoding: identity' \
  -H 'User-Agent: binance-web3/1.1 (Skill)'
```

**Response**:

```json
{
  "code": "000000",
  "data": {
    "tokenId": "<TOKEN_ID>",
    "name": "<TOKEN_DISPLAY_NAME>",
    "symbol": "<TOKEN_SYMBOL_ON>",
    "ticker": "<UNDERLYING_TICKER>",
    "icon": "/images/web3-data/public/token/logos/<TOKEN_ID>.png",
    "dailyAttestationReports": "/images/web3-data/public/token/ondo/pdf/daily-<DATE>.pdf",
    "monthlyAttestationReports": "/images/web3-data/public/token/ondo/pdf/monthly-<MONTH>.pdf",
    "companyInfo": {
      "companyName": "<COMPANY_NAME_EN>",
      "companyNameZh": "<公司名称>",
      "homepageUrl": "",
      "description": "<COMPANY_DESCRIPTION_EN>",
      "descriptionZh": "<COMPANY_DESCRIPTION_CN>",
      "ceo": "<CEO_NAME>",
      "industry": "<INDUSTRY>",
      "industryKey": "<INDUSTRY_KEY>",
      "conceptsCn": ["概念标签A", "概念标签B", "概念标签C"],
      "conceptsEn": ["Concept Tag A", "Concept Tag B", "Concept Tag C"]
    },
    "decimals": 18
  },
  "success": true
}
```

**Response Fields** (`data`):

| Field                     | Type    | Description                                                                                                                                                                  |
|---------------------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| tokenId                   | string  | Token unique ID                                                                                                                                                              |
| name                      | string  | Full token name (e.g. `<TOKEN_DISPLAY_NAME>`)                                                                                                                                |
| symbol                    | string  | Token symbol (e.g. `<TOKEN_SYMBOL_ON>`)                                                                                                                                      |
| ticker                    | string  | Underlying stock ticker (e.g. `<UNDERLYING_TICKER>`)                                                                                                                         |
| icon                      | string  | Icon image **relative path**. To get the full URL, prepend `https://bin.bnbstatic.com` (e.g. `https://bin.bnbstatic.com/images/web3-data/public/token/logos/<TOKEN_ID>.png`) |
| dailyAttestationReports   | string  | Daily attestation report **relative path**. Prepend `https://bin.bnbstatic.com` to get the full URL                                                                          |
| monthlyAttestationReports | string  | Monthly attestation report **relative path**. Prepend `https://bin.bnbstatic.com` to get the full URL                                                                        |
| companyInfo               | object  | Company details (see below)                                                                                                                                                  |
| decimals                  | integer | Token decimals (typically `18`)                                                                                                                                              |

**Company Info Fields** (`data.companyInfo`):

| Field         | Type     | Description                                                           |
|---------------|----------|-----------------------------------------------------------------------|
| companyName   | string   | Company name in English                                               |
| companyNameZh | string   | Company name in Chinese                                               |
| homepageUrl   | string   | Company homepage URL                                                  |
| description   | string   | Company description (English)                                         |
| descriptionZh | string   | Company description (Chinese)                                         |
| ceo           | string   | CEO name                                                              |
| industry      | string   | Industry classification                                               |
| industryKey   | string   | Industry i18n key                                                     |
| conceptsCn    | string[] | Concept/theme tags in Chinese                                         |
| conceptsEn    | string[] | Concept/theme tags in English (e.g. `Concept Tag A`, `Concept Tag B`) |

---

## API 3: Market Status

### Method: GET

**URL**:
```
https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/market/status/ai
```

**Request Parameters**: None

**Headers**: `Accept-Encoding: identity`

**Example**:
```bash
curl 'https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/market/status/ai' \
  -H 'Accept-Encoding: identity' \
  -H 'User-Agent: binance-web3/1.1 (Skill)'
```

**Response**:

```json
{
  "code": "000000",
  "data": {
    "openState": false,
    "reasonCode": "MARKET_PAUSED",
    "reasonMsg": "Paused for session transition",
    "nextOpen": "2026-03-23T08:01:00Z",
    "nextClose": "2026-03-23T13:29:00Z",
    "nextOpenTime": 1774252860000,
    "nextCloseTime": 1774272540000
  },
  "success": true
}
```

> **Note**: The sample above is captured with `openState=false` (market closed/paused), so `nextOpen` is earlier than `nextClose`.

**Response Fields** (`data`):

| Field         | Type         | Description                                                             |
|---------------|--------------|-------------------------------------------------------------------------|
| openState     | boolean      | Whether the Ondo market is currently open for trading                   |
| reasonCode    | string\|null | Reason code if market is not in normal trading state (see Reason Codes) |
| reasonMsg     | string\|null | Human-readable reason message                                           |
| nextOpen      | string       | Next market open time from current state (ISO 8601 UTC)                 |
| nextClose     | string       | Next market close time from current state (ISO 8601 UTC)                |
| nextOpenTime  | number       | Next market open time from current state (Unix timestamp in ms)         |
| nextCloseTime | number       | Next market close time from current state (Unix timestamp in ms)        |

> **Interpretation**: These fields are state-dependent. When `openState=true`, `nextClose` is expected to be earlier than `nextOpen` (market closes before the next open). When `openState=false`, `nextOpen` is expected to be earlier than `nextClose` (market opens before the next close).

---

## API 4: Asset Market Status

### Method: GET

**URL**:
```
https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/asset/market/status/ai
```

**Request Parameters**:

| Parameter       | Type   | Required | Description            |
|-----------------|--------|----------|------------------------|
| chainId         | string | Yes      | Chain ID               |
| contractAddress | string | Yes      | Token contract address |

**Headers**: `Accept-Encoding: identity`

**Example**:
```bash
curl 'https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/asset/market/status/ai?chainId=56&contractAddress=<CONTRACT_ADDRESS>' \
  -H 'Accept-Encoding: identity' \
  -H 'User-Agent: binance-web3/1.1 (Skill)'
```

**Response**:

```json
{
  "code": "000000",
  "data": {
    "openState": false,
    "marketStatus": "closed",
    "reasonCode": "MARKET_CLOSED",
    "reasonMsg": null,
    "nextOpenTime": 1774252860000,
    "nextCloseTime": 1774272540000
  },
  "success": true
}
```

**Response Fields** (`data`):

| Field         | Type         | Description                                                                           |
|---------------|--------------|---------------------------------------------------------------------------------------|
| openState     | boolean      | Whether this specific asset is available for trading                                  |
| marketStatus  | string       | Current session: `premarket`, `regular`, `postmarket`, `overnight`, `closed`, `pause` |
| reasonCode    | string       | Status reason code (see Reason Codes below)                                           |
| reasonMsg     | string\|null | Human-readable reason message (populated when paused/limited)                         |
| nextOpenTime  | number       | Next open time (Unix timestamp in ms)                                                 |
| nextCloseTime | number       | Next close time (Unix timestamp in ms)                                                |

### Reason Codes

| reasonCode           | Description                                                                |
|----------------------|----------------------------------------------------------------------------|
| `TRADING`            | Normal trading                                                             |
| `MARKET_CLOSED`      | Market is closed (outside trading hours)                                   |
| `MARKET_PAUSED`      | Market-wide trading halt                                                   |
| `ASSET_PAUSED`       | This specific asset is paused (see Corporate Actions below)                |
| `ASSET_LIMITED`      | This specific asset has trading restrictions (see Corporate Actions below) |
| `UNSUPPORTED`        | Asset is not supported                                                     |
| `MARKET_MAINTENANCE` | System maintenance                                                         |

### Corporate Actions (when `ASSET_PAUSED` or `ASSET_LIMITED`)

When an asset is paused or limited, the `reasonMsg` field indicates the specific corporate action:

| reasonCode      | reasonMsg          | Description                                                |
|-----------------|--------------------|------------------------------------------------------------|
| `ASSET_PAUSED`  | `cash_dividend`    | Cash dividend distribution                                 |
| `ASSET_PAUSED`  | `stock_dividend`   | Stock dividend distribution                                |
| `ASSET_PAUSED`  | `stock_split`      | Stock split                                                |
| `ASSET_PAUSED`  | `merger`           | Company merger                                             |
| `ASSET_PAUSED`  | `acquisition`      | Company acquisition                                        |
| `ASSET_PAUSED`  | `spinoff`          | Corporate spinoff                                          |
| `ASSET_PAUSED`  | `maintenance`      | Asset-level maintenance                                    |
| `ASSET_PAUSED`  | `corporate action` | Other corporate action                                     |
| `ASSET_LIMITED` | `earnings`         | Earnings release — trading restricted but not fully paused |

---

## API 5: RWA Dynamic V2

### Method: GET

**URL**:
```
https://www.binance.com/bapi/defi/v2/public/wallet-direct/buw/wallet/market/token/rwa/dynamic/ai
```

**Request Parameters**:

| Parameter       | Type   | Required | Description            |
|-----------------|--------|----------|------------------------|
| chainId         | string | Yes      | Chain ID               |
| contractAddress | string | Yes      | Token contract address |

**Headers**: `Accept-Encoding: identity`

**Example**:
```bash
curl 'https://www.binance.com/bapi/defi/v2/public/wallet-direct/buw/wallet/market/token/rwa/dynamic/ai?chainId=56&contractAddress=<CONTRACT_ADDRESS>' \
  -H 'Accept-Encoding: identity' \
  -H 'User-Agent: binance-web3/1.1 (Skill)'
```

**Response**:

```json
{
  "code": "000000",
  "data": {
    "symbol": "<TOKEN_SYMBOL_ON>",
    "ticker": "<UNDERLYING_TICKER>",
    "tokenInfo": {
      "price": "310.384196924055952519",
      "priceChange24h": "1.09518626611014170",
      "priceChangePct24h": "0.354098021064624509",
      "totalHolders": "1023",
      "sharesMultiplier": "1.001084338309087472",
      "volume24h": "8202859508.959922580629343392",
      "marketCap": "7116321.021286604958613714702150000306622972",
      "fdv": "7116321.021286604958613714702150000306622972",
      "circulatingSupply": "22927.459232171569002788",
      "maxSupply": "22927.459232171569002788"
    },
    "stockInfo": {
      "price": null,
      "priceHigh52w": "328.83",
      "priceLow52w": "140.53",
      "volume": "26429618",
      "averageVolume": "36255295",
      "sharesOutstanding": "5818000000",
      "marketCap": "1805815257704.157531755542",
      "turnoverRate": "0.4543",
      "amplitude": null,
      "priceToEarnings": "29.93",
      "dividendYield": "0.27",
      "priceToBook": null,
      "lastCashAmount": null
    },
    "statusInfo": {
      "openState": null,
      "marketStatus": null,
      "reasonCode": null,
      "reasonMsg": null,
      "nextOpenTime": null,
      "nextCloseTime": null
    },
    "limitInfo": {
      "maxAttestationCount": "1500",
      "maxActiveNotionalValue": "450000"
    }
  },
  "success": true
}
```

### Response Fields

**Top-level** (`data`):

| Field      | Type   | Description                                          |
|------------|--------|------------------------------------------------------|
| symbol     | string | Token symbol (e.g. `<TOKEN_SYMBOL_ON>`)              |
| ticker     | string | Underlying stock ticker (e.g. `<UNDERLYING_TICKER>`) |
| tokenInfo  | object | On-chain token data                                  |
| stockInfo  | object | US stock fundamentals                                |
| statusInfo | object | Market/asset trading status (same schema as API 4)   |
| limitInfo  | object | Order limit information                              |

**Token Info** (`data.tokenInfo`):

| Field             | Type   | Description                                                                            |
|-------------------|--------|----------------------------------------------------------------------------------------|
| price             | string | On-chain token price (USD) — per-token, not per-share (see Key Concept above)          |
| priceChange24h    | string | 24h price change (USD)                                                                 |
| priceChangePct24h | string | 24h price change (%)                                                                   |
| totalHolders      | string | Number of on-chain holders                                                             |
| sharesMultiplier  | string | Same as `multiplier` in API 1 (see Key Concept above, Notes §6)                        |
| volume24h         | string | ⚠️ **Misleading**: This is the US stock trading volume in USD, NOT on-chain DEX volume |
| marketCap         | string | On-chain market cap (USD) = `circulatingSupply × price`                                |
| fdv               | string | Fully diluted valuation (USD)                                                          |
| circulatingSupply | string | Circulating supply (token units)                                                       |
| maxSupply         | string | Maximum supply (token units)                                                           |

**Stock Info** (`data.stockInfo`):

| Field             | Type         | Description                                                                      |
|-------------------|--------------|----------------------------------------------------------------------------------|
| price             | string\|null | US stock price (USD). May be `null` outside trading hours                        |
| priceHigh52w      | string       | 52-week high price (USD)                                                         |
| priceLow52w       | string       | 52-week low price (USD)                                                          |
| volume            | string       | ⚠️ US stock volume in **shares** (not USD). Multiply by `price` to get USD value |
| averageVolume     | string       | Average daily volume (shares)                                                    |
| sharesOutstanding | string       | Total shares outstanding                                                         |
| marketCap         | string       | US stock total market cap (USD)                                                  |
| turnoverRate      | string       | Turnover rate (%)                                                                |
| amplitude         | string\|null | Intraday amplitude (%)                                                           |
| priceToEarnings   | string       | P/E ratio (TTM)                                                                  |
| dividendYield     | string       | Dividend yield (TTM, percentage value: `0.27` means 0.27%)                       |
| priceToBook       | string\|null | P/B ratio                                                                        |
| lastCashAmount    | string\|null | Most recent cash dividend amount per share (USD)                                 |

**Status Info** (`data.statusInfo`):

Same schema as API 4 response. See [Asset Market Status](#api-4-asset-market-status) for field details and reason codes.

**Limit Info** (`data.limitInfo`):

| Field                  | Type   | Description                                    |
|------------------------|--------|------------------------------------------------|
| maxAttestationCount    | string | Maximum attestation count for orders           |
| maxActiveNotionalValue | string | Maximum active notional value for orders (USD) |

---

## API 6: Token K-Line

### Method: GET

**URL**:
```
https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/dex/market/token/kline/ai
```

**Request Parameters**:

| Parameter       | Type    | Required | Default | Description                                             |
|-----------------|---------|----------|---------|---------------------------------------------------------|
| chainId         | string  | Yes      | -       | Chain ID (e.g. `56` for BSC, `1` for Ethereum)          |
| contractAddress | string  | Yes      | -       | Token contract address                                  |
| interval        | string  | Yes      | -       | K-Line interval (see Interval Reference)                |
| limit           | integer | No       | 300     | Number of candles to return (max 300)                   |
| startTime       | long    | No       | -       | Start timestamp (ms), based on candle open time         |
| endTime         | long    | No       | -       | End timestamp (ms), based on candle open time minus 1ms |

> **Note on `startTime` / `endTime`**: Both reference the candle's open time. If omitted, returns the latest candles. When both are provided, `endTime` should be the target candle's open time minus 1ms.

**Interval Reference**:

| Interval | Description |
|----------|-------------|
| 1m       | 1 minute    |
| 5m       | 5 minutes   |
| 15m      | 15 minutes  |
| 1h       | 1 hour      |
| 4h       | 4 hours     |
| 12h      | 12 hours    |
| 1d       | 1 day       |

**Headers**: `Accept-Encoding: identity`

**Example**:
```bash
curl 'https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/dex/market/token/kline/ai?chainId=56&contractAddress=<CONTRACT_ADDRESS>&interval=1d&limit=5' \
  -H 'Accept-Encoding: identity' \
  -H 'User-Agent: binance-web3/1.1 (Skill)'
```

**Response**:

```json
{
  "code": "000000",
  "data": {
    "klineInfos": [
      [1773619200000, "302.935406291919976543", "306.960384694362870577", "302.25959298411397863", "305.249336787737745037", "0", 1773705599999],
      [1773705600000, "305.644964527245747627", "311.890874865402466994", "303.302517784917770672", "311.028506552196415779", "0", 1773791999999]
    ],
    "decimals": 5
  },
  "success": true
}
```

**Candle Array Format** (each element in `data.klineInfos[]`):

| Index | Field     | Type   | Description                 |
|-------|-----------|--------|-----------------------------|
| 0     | openTime  | number | Candle open timestamp (ms)  |
| 1     | open      | string | Open price (USD)            |
| 2     | high      | string | High price (USD)            |
| 3     | low       | string | Low price (USD)             |
| 4     | close     | string | Close price (USD)           |
| 5     | -         | string | Reserved field              |
| 6     | closeTime | number | Candle close timestamp (ms) |

**Response Fields**:

| Field      | Type    | Description                               |
|------------|---------|-------------------------------------------|
| klineInfos | array   | Array of candle arrays (see format above) |
| decimals   | integer | Price decimal precision hint              |

---

## User Agent Header

Include `User-Agent` header with the following string: `binance-web3/1.1 (Skill)`

## Notes

1. **`volume24h` in tokenInfo is misleading**: `tokenInfo.volume24h` from the RWA Dynamic API returns the **US stock daily trading volume in USD**, not the on-chain DEX trading volume. For actual on-chain buy/sell volume, use the Binance on-chain dynamic API (`/market/token/dynamic/info`) with `volume24hBuy` + `volume24hSell` fields instead.

2. **`dividendYield` is a percentage value, not a raw decimal**: A value of `0.27` means 0.27% dividend yield.

3. **Icon and report URLs are relative paths — prepend domain to use**: The API returns relative paths for `icon`, `dailyAttestationReports`, and `monthlyAttestationReports` (e.g. `/images/web3-data/public/token/logos/...`). To construct the full URL, prepend `https://bin.bnbstatic.com`. Example: `/images/web3-data/public/token/logos/<TOKEN_ID>.png` → `https://bin.bnbstatic.com/images/web3-data/public/token/logos/<TOKEN_ID>.png`.

4. **No API key required**: All endpoints are public APIs. No authentication needed.

5. **Multi-chain deployments**: Each supported stock may be deployed on multiple chains (e.g. both Ethereum and BSC). `stockInfo` and `tokenInfo.price` are identical across chains. `tokenInfo.totalHolders` is aggregated cross-chain. `tokenInfo.circulatingSupply` and `tokenInfo.marketCap` are chain-specific.

6. **`multiplier` / `sharesMultiplier` — critical for price comparison**: Each token represents `multiplier` shares of the underlying stock, not exactly 1 share. The multiplier starts at 1.0 and increases over time as cash dividends are reinvested (cumulative dividend adjustment). Some tokens also reflect stock splits (e.g. multiplier = 10.0 means 1 token = 10 shares).

   **Formula**:
   ```
   referencePrice = tokenInfo.price ÷ sharesMultiplier
   ```

   > `tokenInfo.price` and `stockInfo.price` come from different sources (on-chain oracle vs stock feed) and update at different frequencies, so a small premium/discount (typically within ±0.1%) is normal.

   **Common multiplier categories**:

   | Multiplier         | Cause                                                   |
   |--------------------|---------------------------------------------------------|
   | Exactly 1.0        | No dividends paid yet, or newly listed                  |
   | Slightly above 1.0 | Cumulative cash dividend reinvestment (grows over time) |
   | 5.0, 10.0          | Stock split reflected in token structure                |

   > The exact multiplier value changes over time as dividends accumulate. Always read it from the API at query time — never hardcode.
