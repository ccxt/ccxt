# Authentication Strategies in CCXT

## Overview

This document provides a comprehensive analysis of authentication strategies used in CCXT, focusing on how the `sign()` method works and what components are needed for the EDL compiler to generate authentication code.

## Table of Contents

1. [CCXT Authentication Overview](#ccxt-authentication-overview)
2. [The sign() Method](#the-sign-method)
3. [Authentication Strategy Types](#authentication-strategy-types)
4. [Signature Components](#signature-components)
5. [Exchange-Specific Patterns](#exchange-specific-patterns)
6. [EDL Schema Requirements](#edl-schema-requirements)

---

## CCXT Authentication Overview

### Base Exchange Class

The base `Exchange` class in CCXT provides a minimal `sign()` method that is overridden by each exchange:

```typescript
sign (path, api: any = 'public', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
    return {};
}
```

### The sign() Method Contract

Every exchange implementation must override `sign()` to return an object with:

```typescript
{
    url: string,      // Full request URL
    method: string,   // HTTP method (GET, POST, PUT, DELETE, PATCH)
    body: any,        // Request body (typically JSON or urlencoded)
    headers: any      // HTTP headers including authentication
}
```

This method is called by `fetch2()` before making every API request:

```typescript
const request = this.sign (path, api, method, params, headers, body);
```

### Authentication Flow

1. User calls a CCXT method (e.g., `createOrder()`)
2. Method calls `fetch2()` with endpoint details
3. `fetch2()` calls `sign()` to add authentication
4. `sign()` constructs signature and headers
5. Request is sent with authenticated headers/body

---

## The sign() Method

### Method Signature

```typescript
sign(
    path: string,        // API endpoint path (e.g., "order", "api/v3/account")
    api: any,           // API category (e.g., "public", "private", "sapi")
    method: string,     // HTTP method
    params: object,     // Query/body parameters
    headers: any,       // Initial headers (usually undefined)
    body: any          // Initial body (usually undefined)
): {
    url: string,
    method: string,
    body: any,
    headers: any
}
```

### Common Patterns

All `sign()` implementations follow this general pattern:

1. **Build URL** - Construct the full URL from base URL + path
2. **Check if authentication is needed** - Public endpoints skip auth
3. **Generate timestamp/nonce** - Create unique request identifier
4. **Build signature payload** - Combine components to sign
5. **Create signature** - Use HMAC/RSA/EdDSA with secret
6. **Add auth headers** - Include API key, signature, timestamp
7. **Return request object** - Return URL, method, body, headers

---

## Authentication Strategy Types

### 1. HMAC (Most Common)

HMAC (Hash-based Message Authentication Code) is the most widely used authentication method.

#### Variants

- **HMAC-SHA256** - Most common (Binance, Coinbase)
- **HMAC-SHA384** - Less common
- **HMAC-SHA512** - Used by Kraken
- **HMAC-SHA1** - Legacy systems
- **HMAC-MD5** - Rare, deprecated

#### Example: Binance (HMAC-SHA256)

```typescript
// Signature payload: query string
const query = 'symbol=BTCUSDT&timestamp=1234567890000';

// Generate signature
const signature = this.hmac(
    this.encode(query),           // Message to sign
    this.encode(this.secret),     // Secret key
    sha256                        // Hash algorithm
);

// Add to query string
query += '&signature=' + signature;

// Headers
headers = {
    'X-MBX-APIKEY': this.apiKey,
};
```

**Signature String Format:**
```
symbol=BTCUSDT&timestamp=1234567890000
```

#### Example: Kraken (HMAC-SHA512)

```typescript
// Build signature components
const nonce = this.nonce().toString();
const body = this.urlencodeNested({ nonce: nonce, ...params });

// First hash: nonce + body
const auth = this.encode(nonce + body);
const hash = this.hash(auth, sha256, 'binary');

// Second part: path + hash
const binary = this.encode(url);
const binhash = this.binaryConcat(binary, hash);

// Final signature
const secret = this.base64ToBinary(this.secret);
const signature = this.hmac(binhash, secret, sha512, 'base64');

// Headers
headers = {
    'API-Key': this.apiKey,
    'API-Sign': signature,
};
```

**Signature String Format:**
```
<binary: /0/private/AddOrder + sha256(nonce + body)>
```

#### Example: Coinbase International (HMAC-SHA256)

```typescript
const nonce = this.nonce().toString();
let payload = '';
if (method !== 'GET') {
    body = this.json(query);
    payload = body;
}

// Signature format: timestamp + method + path + body
const auth = nonce + method + savedPath + payload;
const signature = this.hmac(
    this.encode(auth),
    this.base64ToBinary(this.secret),
    sha256,
    'base64'
);

headers = {
    'CB-ACCESS-TIMESTAMP': nonce,
    'CB-ACCESS-SIGN': signature,
    'CB-ACCESS-PASSPHRASE': this.password,
    'CB-ACCESS-KEY': this.apiKey,
};
```

**Signature String Format:**
```
1234567890000POST/api/v1/orders{"symbol":"BTC-USDC","side":"buy"}
```

---

### 2. RSA Signatures

RSA signatures use public-key cryptography for authentication.

#### Example: Binance (RSA variant)

```typescript
// When apiKey starts with 'SPOT'
if (this.apiKey.startsWith('SPOT')) {
    signature = this.encodeURIComponent(
        rsa(query, this.secret, sha256)
    );
}
```

**Key Format:**
- Private key in PEM format
- Typically RSA-2048 or RSA-4096
- Signature encoded and URL-encoded

**Algorithms:**
- RS256 (RSA with SHA-256)
- RS384 (RSA with SHA-384)
- RS512 (RSA with SHA-512)

---

### 3. EdDSA (Ed25519)

EdDSA using the Ed25519 curve for signatures.

#### Example: Backpack

```typescript
const ts = this.nonce().toString();
const recvWindow = '5000';
const instruction = 'orderExecute';

// Build payload
let payload = 'instruction=' + instruction + '&';
payload += queryString;
payload += 'timestamp=' + ts + '&window=' + recvWindow;

// Sign with Ed25519
const secretBytes = this.base64ToBinary(this.secret);
const seed = this.arraySlice(secretBytes, 0, 32);
const signature = eddsa(this.encode(payload), seed, ed25519);

headers = {
    'X-Timestamp': ts,
    'X-Window': recvWindow,
    'X-API-Key': this.apiKey,
    'X-Signature': signature,
};
```

**Signature String Format:**
```
instruction=orderExecute&symbol=BTC_USDC&side=buy&timestamp=1234567890000&window=5000
```

#### Example: Binance (EdDSA variant)

```typescript
// When apiKey doesn't start with 'SPOT' and EdDSA is enabled
signature = this.encodeURIComponent(
    eddsa(this.encode(query), this.secret, ed25519)
);
```

---

### 4. API Key Only (Header-based)

Some endpoints only require an API key in headers without signatures.

#### Example: Binance Historical Trades

```typescript
if (path === 'historicalTrades') {
    if (this.apiKey) {
        headers = {
            'X-MBX-APIKEY': this.apiKey,
        };
    }
}
```

---

### 5. JWT (JSON Web Tokens)

Bearer token authentication using JWT.

#### Example: CoinMetro

```typescript
if (api === 'private') {
    if (url === 'https://api.coinmetro.com/jwt') {
        // Login endpoint - get JWT
        headers['X-Device-Id'] = 'bypass';
        if (this.twofa !== undefined) {
            headers['X-OTP'] = this.twofa;
        }
    } else {
        // Use JWT for authenticated requests
        headers['Authorization'] = 'Bearer ' + this.token;
        headers['X-Device-Id'] = this.uid;
    }
}
```

---

### 6. OAuth Flows

OAuth 2.0 authentication (less common in crypto exchanges).

**Pattern:**
1. Obtain access token via OAuth flow
2. Include token in Authorization header
3. Refresh token when expired

---

## Signature Components

### Timestamp/Nonce

#### Timestamp (Milliseconds)

Most common, used by Binance, Coinbase, etc.

```typescript
const timestamp = this.milliseconds();
// Example: 1640000000000
```

#### Timestamp (Seconds)

Less common, but used by some exchanges.

```typescript
const timestamp = this.seconds();
// Example: 1640000000
```

#### Timestamp (Microseconds)

Rare, but provides higher precision.

```typescript
const timestamp = this.microseconds();
// Example: 1640000000000000
```

#### Nonce (Incrementing)

Kraken uses milliseconds adjusted for time difference:

```typescript
nonce() {
    return this.milliseconds() - this.options['timeDifference'];
}
```

#### UUID

Rare, some exchanges use UUIDs as nonces:

```typescript
const nonce = this.uuid();
```

---

### Signature String Components

Common components that make up the data to be signed:

#### 1. HTTP Method

```typescript
// Example: "POST"
const method = 'POST';
```

#### 2. Request Path

```typescript
// Example: "/api/v3/order"
const path = '/api/v3/order';
```

#### 3. Timestamp/Nonce

```typescript
const timestamp = this.nonce().toString();
```

#### 4. Query String

```typescript
// Sorted alphabetically (some exchanges require this)
const query = this.urlencode(this.keysort(params));
// Example: "side=buy&symbol=BTCUSDT&timestamp=1234567890000&type=LIMIT"
```

#### 5. Request Body

```typescript
// JSON body
const body = this.json(params);

// URL-encoded body
const body = this.urlencode(params);

// Hashed body (some exchanges)
const bodyHash = this.hash(body, sha256, 'hex');
```

#### 6. Host/Domain

```typescript
const host = 'api.exchange.com';
```

---

### Component Ordering

The order in which components are concatenated varies by exchange:

#### Binance Pattern
```
<query_string>&signature=<signature>
```

#### Kraken Pattern
```
<path_binary> + sha256(<nonce> + <body>)
```

#### Coinbase Pattern
```
<timestamp> + <method> + <path> + <body>
```

#### Backpack Pattern
```
instruction=<instruction>&<query_string>&timestamp=<timestamp>&window=<window>
```

---

### Encoding Formats

#### Hex Encoding

Most common for HMAC signatures:

```typescript
const signature = this.hmac(message, secret, sha256, 'hex');
// Example: "a1b2c3d4e5f6..."
```

#### Base64 Encoding

Used by Kraken, Coinbase, and others:

```typescript
const signature = this.hmac(message, secret, sha256, 'base64');
// Example: "YTFiMmMzZDRlNWY2..."
```

#### Base64URL Encoding

URL-safe variant of Base64:

```typescript
const signature = base64url.encode(signatureBytes);
```

#### Binary Encoding

Raw binary data:

```typescript
const hash = this.hash(message, sha256, 'binary');
```

---

## Exchange-Specific Patterns

### Binance

**Authentication Type:** HMAC-SHA256 (default), RSA-SHA256, EdDSA (Ed25519)

**Signature Components:**
- Query string (sorted parameters)
- Timestamp in milliseconds
- Optional: recvWindow parameter

**Signature Format:**
```
symbol=BTCUSDT&side=BUY&type=LIMIT&quantity=1&price=50000&timestamp=1640000000000
```

**Signature Placement:** Query parameter `signature=...`

**Headers:**
```typescript
{
    'X-MBX-APIKEY': apiKey,
    'Content-Type': 'application/x-www-form-urlencoded'
}
```

**Special Cases:**
- RSA: When API key starts with 'SPOT'
- EdDSA: When API key doesn't start with 'SPOT' and EdDSA enabled
- User Data Stream: API key only, no signature

**Timestamp Unit:** milliseconds

**Nonce Type:** timestamp

---

### Kraken

**Authentication Type:** HMAC-SHA512

**Signature Components:**
1. Nonce (milliseconds)
2. POST body (URL-encoded)
3. Request path
4. Two-stage hashing

**Signature Format:**
```
Binary concatenation of:
  encode(path) + sha256(nonce + urlencoded_body)
```

**Signature Placement:** Header `API-Sign`

**Headers:**
```typescript
{
    'API-Key': apiKey,
    'API-Sign': signature,
    'Content-Type': 'application/x-www-form-urlencoded'
}
```

**Timestamp Unit:** milliseconds (adjusted for time difference)

**Nonce Type:** timestamp (incrementing)

**Encoding:** Base64

---

### Coinbase International

**Authentication Type:** HMAC-SHA256

**Signature Components:**
- Timestamp (nonce)
- HTTP method
- Request path (including /api)
- Request body (JSON)

**Signature Format:**
```
<timestamp><method><path><body>
Example: 1640000000000POST/api/v1/orders{"symbol":"BTC-USDC"}
```

**Signature Placement:** Header `CB-ACCESS-SIGN`

**Headers:**
```typescript
{
    'CB-ACCESS-TIMESTAMP': timestamp,
    'CB-ACCESS-SIGN': signature,
    'CB-ACCESS-PASSPHRASE': password,
    'CB-ACCESS-KEY': apiKey
}
```

**Timestamp Unit:** milliseconds

**Nonce Type:** timestamp

**Encoding:** Base64

**Special Requirements:** Requires password/passphrase

---

### Backpack

**Authentication Type:** EdDSA (Ed25519)

**Signature Components:**
- Instruction string
- Query parameters (sorted)
- Timestamp
- Receive window

**Signature Format:**
```
instruction=<instruction>&<params>&timestamp=<timestamp>&window=<window>
Example: instruction=orderExecute&side=buy&symbol=BTC_USDC&timestamp=1640000000000&window=5000
```

**Signature Placement:** Header `X-Signature`

**Headers:**
```typescript
{
    'X-Timestamp': timestamp,
    'X-Window': recvWindow,
    'X-API-Key': apiKey,
    'X-Signature': signature,
    'X-Broker-Id': '1400'
}
```

**Timestamp Unit:** milliseconds (adjusted for time difference)

**Nonce Type:** timestamp

**Encoding:** Base64

**Special Requirements:**
- Secret must be base64-encoded Ed25519 private key
- First 32 bytes used as seed
- Instruction parameter required

---

### CoinMetro

**Authentication Type:** JWT (Bearer Token)

**Authentication Flow:**
1. Login to obtain JWT token
2. Use token for subsequent requests

**Headers (Login):**
```typescript
{
    'X-Device-Id': 'bypass',
    'X-OTP': twofa  // If 2FA enabled
}
```

**Headers (Authenticated):**
```typescript
{
    'Authorization': 'Bearer ' + token,
    'X-Device-Id': uid
}
```

**Special Requirements:**
- Must obtain JWT token first
- Token stored in `this.token`
- Device ID required

---

## EDL Schema Requirements

### Current Schema Support

The current EDL schema (as of schema version 1.0.0) supports:

```json
{
  "auth": {
    "type": "hmac|jwt|rsa|eddsa|apikey|custom",
    "algorithm": "sha256|sha384|sha512|md5|sha1|ES256|...",
    "encoding": "base64|base64url|hex|binary",
    "timestampUnit": "seconds|milliseconds|microseconds|nanoseconds",
    "nonceType": "timestamp|incrementing|uuid",
    "signature": {
      "components": ["path", "method", "timestamp", "nonce", "body", ...]
    },
    "headers": { ... },
    "body": { ... },
    "query": { ... }
  }
}
```

---

### Gaps in Current Schema

#### 1. Signature Component Ordering

**Problem:** No way to specify the order of signature components.

**Example:** Coinbase needs `timestamp + method + path + body`, but schema only lists components.

**Proposed Solution:**
```json
{
  "signature": {
    "components": ["timestamp", "method", "path", "body"],
    "order": "sequential",  // or "template"
    "template": "{timestamp}{method}{path}{body}"
  }
}
```

---

#### 2. Multi-Stage Hashing

**Problem:** No support for complex hashing like Kraken's two-stage process.

**Example:** Kraken: `hmac(path + sha256(nonce + body), secret, sha512)`

**Proposed Solution:**
```json
{
  "signature": {
    "stages": [
      {
        "name": "inner_hash",
        "algorithm": "sha256",
        "components": ["nonce", "body"],
        "encoding": "binary"
      },
      {
        "name": "outer_signature",
        "algorithm": "sha512",
        "components": ["path", "inner_hash"],
        "encoding": "base64",
        "type": "hmac"
      }
    ]
  }
}
```

---

#### 3. Secret Key Transformations

**Problem:** Some exchanges require secret to be decoded (base64, hex, etc.)

**Example:**
- Kraken: `base64ToBinary(this.secret)`
- Backpack: `base64ToBinary(this.secret).slice(0, 32)`

**Proposed Solution:**
```json
{
  "auth": {
    "secretTransform": "base64ToBinary",
    "secretSlice": { "start": 0, "end": 32 }
  }
}
```

---

#### 4. Conditional Auth Strategies

**Problem:** Some exchanges use different auth based on API key or endpoint.

**Example:** Binance uses HMAC, RSA, or EdDSA based on API key prefix.

**Proposed Solution:**
```json
{
  "auth": {
    "variants": [
      {
        "condition": "apiKey.startsWith('SPOT')",
        "type": "rsa",
        "algorithm": "sha256"
      },
      {
        "condition": "!apiKey.startsWith('SPOT')",
        "type": "eddsa",
        "algorithm": "ed25519"
      },
      {
        "default": true,
        "type": "hmac",
        "algorithm": "sha256"
      }
    ]
  }
}
```

---

#### 5. Custom Header Names

**Problem:** Limited flexibility in header naming and structure.

**Current:**
```json
{
  "headers": {
    "apiKey": "X-API-Key",
    "signature": "X-Signature"
  }
}
```

**Enhanced:**
```json
{
  "headers": {
    "static": {
      "Content-Type": "application/json",
      "X-Broker-Id": "1400"
    },
    "dynamic": {
      "apiKey": {
        "name": "X-API-Key",
        "value": "{apiKey}"
      },
      "signature": {
        "name": "X-Signature",
        "value": "{signature}"
      },
      "timestamp": {
        "name": "X-Timestamp",
        "value": "{timestamp}"
      },
      "window": {
        "name": "X-Window",
        "value": "{recvWindow}",
        "default": "5000"
      }
    }
  }
}
```

---

#### 6. Signature Placement

**Problem:** Signatures can be in query params, headers, or body.

**Current:** Implicit based on auth type.

**Proposed:**
```json
{
  "signature": {
    "placement": "query|header|body",
    "paramName": "signature",  // For query/body
    "headerName": "X-Signature"  // For header
  }
}
```

---

#### 7. Parameter Sorting

**Problem:** Some exchanges require alphabetically sorted parameters.

**Proposed:**
```json
{
  "signature": {
    "sortParams": true,
    "sortOrder": "alphabetical"
  }
}
```

---

#### 8. Receive Window / Timestamp Validity

**Problem:** No way to specify request validity window.

**Example:** Binance recvWindow, Backpack window parameter

**Proposed:**
```json
{
  "auth": {
    "recvWindow": {
      "enabled": true,
      "default": 5000,
      "location": "query|header",
      "paramName": "recvWindow"
    }
  }
}
```

---

#### 9. Password/Passphrase Field

**Problem:** Some exchanges require additional password field.

**Example:** Coinbase requires passphrase in headers

**Current:** Can use `requiredCredentials.password`

**Enhancement:**
```json
{
  "auth": {
    "headers": {
      "passphrase": {
        "name": "CB-ACCESS-PASSPHRASE",
        "credential": "password",
        "required": true
      }
    }
  }
}
```

---

#### 10. Instruction/Command Field

**Problem:** Some exchanges require instruction parameter.

**Example:** Backpack requires `instruction=orderExecute`

**Proposed:**
```json
{
  "signature": {
    "prefix": {
      "type": "instruction",
      "value": "orderExecute",  // or "{instruction}"
      "separator": "&"
    }
  }
}
```

---

### Recommendations for Schema Extensions

#### Priority 1 (Critical for Compiler)

1. **Signature component ordering** - Essential for correct signature generation
2. **Secret transformations** - Needed for exchanges like Kraken, Backpack
3. **Signature placement** - Query vs header vs body
4. **Header structure** - Complete header configuration

#### Priority 2 (Important for Coverage)

5. **Multi-stage hashing** - For complex patterns like Kraken
6. **Parameter sorting** - Required by many exchanges
7. **Receive window** - Common pattern for timestamp validation

#### Priority 3 (Nice to Have)

8. **Conditional auth** - For exchanges with multiple auth methods
9. **Instruction fields** - For specialized exchanges
10. **Password/passphrase** - Already partially supported

---

### Example Enhanced Schema

```json
{
  "auth": {
    "type": "hmac",
    "algorithm": "sha256",
    "encoding": "hex",
    "timestampUnit": "milliseconds",
    "nonceType": "timestamp",

    "secretTransform": {
      "decode": "none|base64|hex",
      "slice": { "start": 0, "end": 32 }
    },

    "signature": {
      "components": ["timestamp", "method", "path", "body"],
      "template": "{timestamp}{method}{path}{body}",
      "sortParams": true,
      "placement": "query",
      "paramName": "signature",

      "stages": [
        {
          "name": "hash",
          "algorithm": "sha256",
          "components": ["nonce", "body"],
          "encoding": "binary"
        },
        {
          "name": "signature",
          "type": "hmac",
          "algorithm": "sha512",
          "components": ["path", "hash"],
          "encoding": "base64"
        }
      ]
    },

    "headers": {
      "static": {
        "Content-Type": "application/json"
      },
      "dynamic": {
        "apiKey": {
          "name": "X-API-Key",
          "value": "{apiKey}"
        },
        "signature": {
          "name": "X-Signature",
          "value": "{signature}"
        },
        "timestamp": {
          "name": "X-Timestamp",
          "value": "{timestamp}"
        }
      }
    },

    "recvWindow": {
      "enabled": true,
      "default": 5000,
      "location": "query",
      "paramName": "recvWindow"
    }
  }
}
```

---

## Compiler Generation Strategy

### Code Generation Approach

The EDL compiler should generate a `sign()` method that follows this template:

```typescript
sign(path, api, method, params, headers, body) {
    // 1. Build base URL
    let url = this.urls['api'][api] + '/' + path;

    // 2. Check if private endpoint
    if (api === 'private') {
        this.checkRequiredCredentials();

        // 3. Generate timestamp/nonce
        const timestamp = this.{timestampUnit}();

        // 4. Apply secret transformations
        const secret = this.{secretTransform}(this.secret);

        // 5. Build signature components
        const components = {
            timestamp,
            method,
            path,
            body: this.{bodyFormat}(params),
            // ... other components
        };

        // 6. Create signature string
        const signatureString = this.buildSignatureString(components);

        // 7. Generate signature
        const signature = this.{authType}(
            signatureString,
            secret,
            {algorithm}
        );

        // 8. Add auth headers
        headers = {
            ...this.staticHeaders,
            [this.{apiKeyHeader}]: this.apiKey,
            [this.{signatureHeader}]: signature,
            [this.{timestampHeader}]: timestamp,
        };

        // 9. Add signature to request
        if (signaturePlacement === 'query') {
            url += '?{paramName}=' + signature;
        }
    }

    return { url, method, body, headers };
}
```

### Helper Methods to Generate

1. `buildSignatureString(components)` - Concatenate components per template
2. `sortParams(params)` - Alphabetically sort parameters
3. `formatTimestamp(unit)` - Convert timestamp to required unit
4. `transformSecret(transform)` - Apply secret transformations
5. `applyMultiStageHash(stages, components)` - Handle complex hashing

---

## Summary

### Key Findings

1. **HMAC-SHA256 is the dominant pattern** - Used by most major exchanges
2. **Signature components vary significantly** - No universal standard
3. **Component ordering is critical** - Must match exchange expectations exactly
4. **Secret transformations are common** - Many exchanges decode the secret key
5. **Header naming is diverse** - Each exchange uses different header names
6. **Multi-stage hashing exists** - Kraken's pattern requires special handling

### Schema Priorities

For the EDL compiler to successfully generate authentication code, the schema must support:

1. **Flexible component ordering** - Via templates or ordered arrays
2. **Secret transformations** - Decode, slice operations
3. **Signature placement** - Query, header, or body
4. **Complete header configuration** - Static and dynamic headers
5. **Multi-stage operations** - For complex patterns

### Next Steps

1. Extend EDL schema with priority 1 enhancements
2. Implement signature string builder in compiler
3. Create helper functions for common transformations
4. Test against real exchange implementations
5. Document exchange-specific quirks and edge cases
