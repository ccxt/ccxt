# DarkPool API Integration Guide

This document provides a complete integration guide for third-party developers to integrate with the DarkPool API.

---

## 1\. Overview

### 1.1 System Introduction

DarkPool provides two core services:

- **Trading Service**: Provides token swap quotes and trade execution functionality  
- **Market Data Service**: Provides trading pair information, prices, K-line data, and other market data

### 1.2 Service Endpoints

| Environment | Base URL | Product Frontend URL |
| :---- | :---- | :---- |
| Production | `https://rfq-api.deluthium.ai` | `https://rfq-api.deluthium.ai` |
|  |  |  |

The specific addresses will be provided by the deployment party.

### 1.3 General Conventions

#### Content-Type

- Request: `Content-Type: application/json`  
- Response: `application/json`

#### JSON Field Naming Convention

- All request and response fields use **snake\_case** (underscore style)  
- Examples: `src_chain_id`, `token_in`, `amount_in`

#### Amount and Precision

- All `amount_*` fields are **integers in wei units**, represented as **decimal strings**  
- Decimal points are not allowed (e.g., `"1.23"` is invalid)

#### Unified Response Structure

All endpoints return the following JSON structure:

{

  "code": 10000,

  "message": "Success",

  "data": {}

}

- **code**: Business status code (success is always `10000`)  
- **message**: Status description  
- **data**: Business data

Note: Endpoints typically return HTTP 200 even on failure, with `code != 10000` indicating business failure.

---

## 2\. Security Authentication

DarkPool API uses **JWT (JSON Web Token)** for authentication. All authenticated endpoints require a valid JWT token in the request header.

### 2.1 Authentication Method

#### Required HTTP Headers

| Header Name | Description | Example |
| :---- | :---- | :---- |
| `Authorization` | Bearer Token authentication | `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `Content-Type` | Content type | `application/json` |

#### Request Example

curl \-X POST 'https://rfq-api.deluthium.ai.io/v1/quote/indicative' \\

  \-H 'Content-Type: application/json' \\

  \-H 'Authorization: Bearer YOUR\_JWT\_TOKEN' \\

  \-d '{

    "src\_chain\_id": 97,

    "dst\_chain\_id": 97,

    "token\_in": "0x0000000000000000000000000000000000000000",

    "token\_out": "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",

    "amount\_in": "1000000000000000000"

  }'

### 2.2 Obtaining JWT Token

#### Application Process

1. **Contact the service provider**: Apply for integration with the DarkPool service provider  
2. **Provide company information**: Provide company name, business identifier, and other information  
3. **Obtain JWT Token**: The service provider will generate a dedicated JWT token for you  
4. **Configure Token**: Configure the token in your application

#### JWT Token Characteristics

- **Uniqueness**: Each enterprise client has a unique JWT token  
- **Security**: Token contains a signature and cannot be forged or tampered with

### 2.3 JWT Token Structure

A JWT token consists of three parts, separated by `.`:

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJyZnEtbWFuYWdlciIsInN1YiI6IjM4MjMwMzQzNjI2MDM1NyIsImV4cCI6MTgwMDM0NDAwMSwiaWF0IjoxNzY4ODA4MDAxLCJ0eXBlIjoiYnVzaW5lc3MiLCJlbnRlcnByaXNlX3VzZXIiOiJZb3VyQ29tcGFueSIsImJ1c2luZXNzX3N5bWJvbCI6IllPVVJDT01QQU5ZIn0.vFj0Eeziwn3s4cDqozAxKM\_bQtpe6qUZPnwGRb7fPMo

**Components**:

1. **Header**: Contains the algorithm and token type  
2. **Payload**: Contains company information and expiration time  
3. **Signature**: Used to verify token integrity

### 2.4 Authentication Error Handling

#### Common Authentication Errors

| HTTP Status Code | Error Message | Description | Solution |
| :---- | :---- | :---- | :---- |
| 401 | `missing api key` | Authorization header not provided | Add `Authorization: Bearer <token>` header |
| 401 | `Token format invalid or signature error` | Token format error or invalid signature | Check if token is complete and not tampered with |
| 401 | `Token has expired` | Token has expired | Contact service provider for a new token |
| 401 | `Account is disabled` | Account has been disabled | Contact service provider to understand the reason |

#### Error Response Example

{

  "code": 401,

  "message": "Token format invalid or signature error"

}

---

## 3\. Trading Endpoints

### 3.1 POST `/v1/quote/indicative` — Indicative Quote (ready for integration)

Get an indicative quote for displaying estimated prices on the frontend. Does not include signature information.

**Authentication Required**: JWT Token

#### Request Body

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| src\_chain\_id | uint64 | Yes | Source chain ID |
| dst\_chain\_id | uint64 | Yes | Destination chain ID |
| token\_in | string | Yes | Input token address (0x..., can be 0 address for Native Token) |
| token\_out | string | Yes | Output token address (0x..., can be 0 address for Native Token) |
| amount\_in | string | Yes | Input amount (wei integer, decimal string) |

#### Request Example

curl \-X POST 'https://rfq-api.deluthium.ai.io/v1/quote/indicative' \\

  \-H 'Content-Type: application/json' \\

  \-H 'Authorization: Bearer YOUR\_JWT\_TOKEN' \\

  \-d '{

    "src\_chain\_id": 97,

    "dst\_chain\_id": 97,

    "token\_in": "0x0000000000000000000000000000000000000000",

    "token\_out": "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",

    "amount\_in": "1000000000000000000"

  }'

#### Response Body

| Field | Type | Description |
| :---- | :---- | :---- |
| src\_chain\_id | uint64 | Source chain ID |
| token\_in | string | Input token address (echoed) |
| token\_out | string | Output token address (echoed) |
| amount\_in | string | Input amount (echoed) |
| amount\_out | string | Expected output amount (wei) |
| fee\_rate | uint64 | Fee rate (bps, 1 bps \= 1/10000) |
| fee\_amount | string | Fee amount (wei) |

#### Response Example

{

  "src\_chain\_id": 97,

  "token\_in": "0x0000000000000000000000000000000000000000",

  "token\_out": "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",

  "amount\_in": "1000000000000000000",

  "amount\_out": "250000000000000000000",

  "fee\_rate": 0,

  "fee\_amount": "0"

}

---

### 3.2 POST `/v1/quote/firm` — Firm Quote (ready for integration)

Get a firm quote with calldata that can be directly submitted on-chain.

**Authentication Required**: JWT Token

#### Request Body

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| src\_chain\_id | uint64 | Yes | Source chain ID |
| dst\_chain\_id | uint64 | Yes | Destination chain ID |
| from\_address | string | Yes | User's sending address (for signature context) |
| to\_address | string | Yes | User's receiving address (for signature context) |
| token\_in | string | Yes | Input token address (can be 0 address for Native Token) |
| token\_out | string | Yes | Output token address (can be 0 address for Native Token) |
| amount\_in | string | Yes | Input amount (wei integer) |
| indicative\_amount\_out | string | No | Expected output amount (wei units), for slippage validation |
| slippage | double | Yes | Slippage tolerance (percentage), range \[0,100\]; e.g., 0.5 means 0.5% |
| expiry\_time\_sec | uint64 | Yes | Quote expiry time (seconds), recommended 60 |

#### Request Example

curl \-X POST 'https://rfq-api.deluthium.ai.io/v1/quote/firm' \\

  \-H 'Content-Type: application/json' \\

  \-H 'Authorization: Bearer YOUR\_JWT\_TOKEN' \\

  \-d '{

    "src\_chain\_id": 97,

    "dst\_chain\_id": 97,

    "from\_address": "0x742d35Cc6634C0532925a3b8D1e4D1F4D6ee2D7e",

    "to\_address": "0x742d35Cc6634C0532925a3b8D1e4D1F4D6ee2D7e",

    "token\_in": "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",

    "token\_out": "0x0000000000000000000000000000000000000000",

    "amount\_in": "1000000000000000000",

    "slippage": 0.5,

    "expiry\_time\_sec": 60

  }'

#### Response Body

| Field | Type | Description |
| :---- | :---- | :---- |
| quote\_id | string | Quote ID |
| src\_chain\_id | uint64 | Source chain ID |
| calldata | string | `router.swap(SwapQuote)` calldata (0x prefix, can be directly submitted on-chain) |
| router\_address | string | Router contract address |
| from\_address | string | Transaction sender address |
| to\_address | string | Transaction receiver address |
| token\_in | string | Input token address (echoed) |
| token\_out | string | Output token address (echoed) |
| amount\_in | string | Input amount (wei; totalIn, charged on-chain according to `fee_rate`) |
| amount\_out | string | Expected output amount (wei) |
| fee\_rate | uint64 | Fee rate (bps) |
| fee\_amount | string | Fee amount (wei) |
| deadline | uint64 | Quote expiry timestamp (Unix seconds) |

#### Response Example

{

  "quote\_id": "550e8400-e29b-41d4-a716-446655440000",

  "src\_chain\_id": 97,

  "calldata": "0x...",

  "router\_address": "0xd3b38cDD1EFE6DD1d0f1B0CD3e33dA87b92320c7",

  "from\_address": "0x742d35Cc6634C0532925a3b8D1e4D1F4D6ee2D7e",

  "to\_address": "0x742d35Cc6634C0532925a3b8D1e4D1F4D6ee2D7e",

  "token\_in": "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",

  "token\_out": "0x0000000000000000000000000000000000000000",

  "amount\_in": "1000000000000000000",

  "amount\_out": "990000000000000000",

  "fee\_rate": 0,

  "fee\_amount": "0",

  "deadline": 1730000000

}

---

### 3.3 GET `/v1/listing/pairs` — Supported Trading Pairs (ready for integration)

Get the list of supported trading pairs.

**Authentication Required**: JWT Token

#### Query Parameters

| Parameter | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| chain\_id | uint64 | No | Filter by chain; 0 or not passed means all chains |

#### Request Example

curl 'https://rfq-api.deluthium.ai.io/v1/listing/pairs?chain\_id=97' \\

  \-H 'Authorization: Bearer YOUR\_JWT\_TOKEN'

#### Response Body

`pairs[]` array, each element contains:

| Field | Type | Description |
| :---- | :---- | :---- |
| pair\_id | string | Trading pair ID |
| chain\_id | uint64 | Chain ID |
| pair\_symbol | string | Trading pair symbol (e.g., `WBNB-USDT`) |
| base\_token | TokenInfo | Base token information |
| quote\_token | TokenInfo | Quote token information |
| is\_enabled | bool | Whether enabled |
| fee\_rate | uint64 | Fee rate (bps) |
| fee\_to | string | Fee collection address (empty means no fee) |

---

### 3.4 GET `/v1/listing/tokens` — Supported Tokens (ready for integration)

Get the list of supported tokens.

**Authentication Required**: JWT Token

#### Query Parameters

| Parameter | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| chain\_id | uint64 | No | Filter by chain; 0 or not passed means all chains |
| token\_address | string | No | If provided, returns all tokens paired with this token (only from enabled pairs) |

#### Request Examples

curl 'https://rfq-api.deluthium.ai.io/v1/listing/tokens?chain\_id=97' \\

  \-H 'Authorization: Bearer YOUR\_JWT\_TOKEN'

curl 'https://rfq-api.deluthium.ai.io/v1/listing/tokens?chain\_id=97\&token\_address=0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd' \\

  \-H 'Authorization: Bearer YOUR\_JWT\_TOKEN'

#### Response Body

`tokens[]` array (TokenInfo), each element contains:

| Field | Type | Description |
| :---- | :---- | :---- |
| token\_address | string | Token contract address (`0x0000...0000` represents native coin) |
| token\_symbol | string | Token symbol |
| token\_name | string | Token full name |
| decimals | uint8 | Precision |
| logo\_url | string | Logo URL |
| total\_supply | string | Total supply (string) |
| wrapped\_token | string | Associated wrapped token address (may be empty for regular tokens) |
| chain\_id | uint64 | Chain ID |

---

## 4\. Market Data Endpoints

### 4.1 GET `/v1/market/pair` — Single Pair Overview **(QA Ready)**

Get overview data for a single trading pair (price, 24h change, 24h volume, FDV, etc.).

#### Query Parameters

| Parameter | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| chainId | int | Yes | Chain ID |
| pairId | int | Recommended | Trading pair ID; if provided, ignores `base/quote` |
| base | string | Optional | Used in compatibility mode (passed with `quote`) |
| quote | string | Optional | Used in compatibility mode (passed with `base`) |
| interval | string | Optional | Default `1h`, used for calculating 24h statistics/price lookback granularity |

#### Request Examples

\# Recommended method (using pairId)

curl 'https://{rfq-host}/v1/market/pair?chainId=56\&pairId=123\&interval=1h'

\# Compatibility method (using base/quote)

curl 'https://{rfq-host}/v1/market/pair?chainId=56\&base=0xabc...\&quote=0xdef...'

#### Response Data

`PairOverview` object:

| Field | Type | Description |
| :---- | :---- | :---- |
| chain\_id | int | Chain ID |
| pair\_id | int | Trading pair ID |
| base | string | Base token address |
| quote | string | Quote token address |
| pair\_name | string | Trading pair name |
| price | string | Price in quote currency |
| price\_usd | string | USD price |
| price\_source | string | Price source: `kline` (K-line) or `swap_indicative` (fallback) |
| change\_24h | string | 24h change (e.g., `0.1234` means \+12.34%) |
| volume\_base\_24h | string | 24h base token volume |
| volume\_quote\_24h | string | 24h quote token volume |
| volume\_usd\_24h | string | 24h USD volume |
| fdv\_usd | string | Fully Diluted Valuation (USD) |

---

### 4.2 GET `/v1/market/klines` — K-line Data **(QA Ready)**

Get K-line sequence data for a specified trading pair.

#### Query Parameters

| Parameter | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| chainId | int | Yes | Chain ID |
| interval | string | Yes | K-line period, see available values below |
| pairId | int | Recommended | Trading pair ID; if provided, ignores `base/quote` |
| base | string | Optional | Used in compatibility mode (passed with `quote`) |
| quote | string | Optional | Used in compatibility mode (passed with `base`) |
| start | int64 | Optional | `open_time` start (Unix seconds) |
| end | int64 | Optional | `open_time` end (Unix seconds) |
| limit | int | Optional | Maximum number of records to return, default 500 |

#### Behavior Notes

- **Without `start/end`**: Returns the most recent `limit` K-lines  
- **With `start` or `end`**: Query by condition, returns at most `limit` records

#### Request Examples

\# Most recent 200 K-lines

curl 'https://{rfq-host}/v1/market/klines?chainId=56\&pairId=123\&interval=1m\&limit=200'

\# Specified time range

curl 'https://{rfq-host}/v1/market/klines?chainId=56\&pairId=123\&interval=1h\&start=1734316800\&end=1734403200\&limit=500'

**Request Parameter Recommendation:** `chainId=56&pairId=123&interval=1h&start=1734316800&end=1734403200&limit=500` Query logic should be based on `end=1734403200`, returning data in descending time order from `end` back to `start=1734316800`, returning at most `limit=500` records.

#### Response Data

`KlineDTO[]` array, each element contains:

| Field | Type | Description |
| :---- | :---- | :---- |
| chain\_id | int | Chain ID |
| base | string | Base token address |
| quote | string | Quote token address |
| interval | string | K-line period |
| open\_time | int64 | Open time (Unix seconds) |
| open | string | Open price |
| high | string | High price |
| low | string | Low price |
| close | string | Close price |
| volume\_base | string | Base token volume |
| volume\_quote | string | Quote token volume |
| volume\_usd | string | USD volume |

#### Available Interval Values

1m / 3m / 5m / 15m / 30m / 1h / 2h / 4h / 8h / 12h / 1d / 3d / 1w / 1M

---

## 5\. Error Handling

### 5.1 Trading Service Error Codes

Trading service error response format:

{

  "code": "INVALID\_INPUT",

  "message": "token addresses cannot be empty"

}

#### Input Validation Errors (typically 4xx)

| Error Code | Description |
| :---- | :---- |
| INVALID\_INPUT | Request field missing/format error |
| INVALID\_TOKEN | Token address invalid/not supported |
| INVALID\_AMOUNT | Amount invalid (non-positive/non-integer wei/format error) |
| INVALID\_PAIR | Trading pair not supported/does not exist |
| INVALID\_DEADLINE | deadline/expiry parameter invalid |

#### Business Errors (typically 4xx)

| Error Code | Description |
| :---- | :---- |
| QUOTE\_EXPIRED | Quote has expired |
| INSUFFICIENT\_LIQUIDITY | Insufficient liquidity |
| MM\_NOT\_AVAILABLE | Market maker not available |
| NO\_QUOTES | No quotes available |
| SLIPPAGE\_EXCEEDED | Slippage validation failed |

#### System Errors (typically 5xx)

| Error Code | Description |
| :---- | :---- |
| INTERNAL\_ERROR | Internal error |
| DATABASE\_ERROR | Database error |
| REDIS\_ERROR | Redis error |
| KAFKA\_ERROR | Kafka error |
| SIGNING\_ERROR | Signature-related error |
| MM\_REQUEST\_ERROR | Market maker request failed |
| TIMEOUT\_ERROR | Timeout |
| MM\_SIGNATURE\_ERROR | Market maker signature validation failed |
| MM\_NOT\_FOUND | Market maker does not exist/not connected |

---

### 5.2 Market Data Service Error Codes

| code | Description |
| :---- | :---- |
| 10000 | Success |
| 10095 | Invalid parameters |
| 20003 | Internal service error |
| 20004 | Not found, e.g., `pair not found` |

---

## Appendix

### A. TypeScript Usage Examples

#### Basic Request Examples

// 1\. Get indicative quote

async function getIndicativeQuote(jwtToken: string) {

  const requestBody \= {

    src\_chain\_id: 97,

    dst\_chain\_id: 97,

    token\_in: '0x0000000000000000000000000000000000000000',

    token\_out: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',

    amount\_in: '1000000000000000000',

  };

  const response \= await fetch('https://rfq-api.deluthium.ai.io/v1/quote/indicative', {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json',

      'Authorization': \`Bearer ${jwtToken}\`,

    },

    body: JSON.stringify(requestBody),

  });

  return response.json();

}

// 2\. Get firm quote

async function getFirmQuote(jwtToken: string) {

  const requestBody \= {

    src\_chain\_id: 97,

    dst\_chain\_id: 97,

    from\_address: '0x742d35Cc6634C0532925a3b8D1e4D1F4D6ee2D7e',

    to\_address: '0x742d35Cc6634C0532925a3b8D1e4D1F4D6ee2D7e',

    token\_in: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',

    token\_out: '0x0000000000000000000000000000000000000000',

    amount\_in: '1000000000000000000',

    slippage: 0.5,

    expiry\_time\_sec: 60,

  };

  const response \= await fetch('https://rfq-api.deluthium.ai.io/v1/quote/firm', {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json',

      'Authorization': \`Bearer ${jwtToken}\`,

    },

    body: JSON.stringify(requestBody),

  });

  return response.json();

}

// 3\. Get supported trading pairs

async function getListingPairs(jwtToken: string, chainId?: number) {

  const params \= new URLSearchParams();

  if (chainId) params.append('chain\_id', chainId.toString());

  const response \= await fetch(

    \`https://rfq-api.deluthium.ai.io/v1/listing/pairs?${params.toString()}\`,

    {

      headers: {

        'Authorization': \`Bearer ${jwtToken}\`,

      },

    }

  );

  return response.json();

}

#### Error Handling Example

async function callApiWithErrorHandling(jwtToken: string) {

  try {

    const response \= await fetch('https://rfq-api.deluthium.ai.io/v1/listing/pairs', {

      headers: {

        'Authorization': \`Bearer ${jwtToken}\`,

      },

    });

    const data \= await response.json();

    // Check business status code

    if (data.code \!== 10000\) {

      if (data.code \=== 401\) {

        // Authentication failed

        console.error('Authentication failed:', data.message);

        // May need to obtain a new JWT token

      } else {

        // Other business errors

        console.error('Business error:', data.message);

      }

      throw new Error(data.message);

    }

    return data.data;

  } catch (error) {

    console.error('API call failed:', error);

    throw error;

  }

}

---

### B. Frequently Asked Questions (FAQ)

#### Q1: How do I obtain a JWT Token?

Contact the DarkPool service provider to apply for integration. After providing company information, the service provider will generate a dedicated JWT token for you.

#### Q2: What should I do if my JWT Token expires?

JWT tokens have a default expiration period. If it expires, please contact the service provider to apply for a new token.

#### Q3: How do I troubleshoot authentication failures (401 errors)?

1. **Check Authorization header format**: Must be `Authorization: Bearer <token>`, note the space after "Bearer"  
2. **Check if token is complete**: JWT token consists of three parts separated by `.`, ensure it hasn't been truncated  
3. **Check if token has been tampered with**: Ensure token matches exactly what the service provider provided  
4. **Check account status**: Contact service provider to confirm if account has been disabled

## Security Considerations

1. **JWT Token Protection**: JWT tokens should not be hardcoded in frontend code or exposed in browser environments. It's recommended to proxy API calls through a backend service  
2. **HTTPS**: All requests in production environments must use HTTPS transmission  
3. **Token Storage**: Avoid storing JWT tokens in easily stolen locations (such as localStorage). It's recommended to use httpOnly cookies or server-side sessions  
4. **Token Rotation**: Regularly contact the service provider to replace JWT tokens to ensure security  
5. **Error Handling**: Do not expose sensitive token information in error messages  
6. **Access Control**: Ensure only authorized services and personnel can access JWT tokens

