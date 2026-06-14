# Authentication Strategy Reference

## Quick Reference Table

| Strategy | Hash | Encoding | Requires Secret | Requires PrivateKey | Timestamp | Examples |
|----------|------|----------|-----------------|---------------------|-----------|----------|
| **HMAC_SHA256** | SHA256 | hex | ✅ | ❌ | ✅ | Binance, OKX, Bybit, Bitget |
| **HMAC_SHA512** | SHA512 | hex | ✅ | ❌ | ✅ | Kraken, Gate.io, Poloniex |
| **HMAC_SHA384** | SHA384 | hex | ✅ | ❌ | ✅ | Gemini, Bitfinex |
| **HMAC_SHA1** | SHA1 | hex | ✅ | ❌ | ❌ | Legacy exchanges |
| **JWT_HS256** | SHA256 | base64url | ✅ | ❌ | ❌ | JWT with HMAC |
| **JWT_RS256** | SHA256 | base64url | ❌ | ✅ | ❌ | Coinbase Cloud, OceanEx |
| **JWT_ES256** | SHA256 | base64url | ❌ | ✅ | ❌ | Upbit |
| **EDDSA_ED25519** | - | hex | ❌ | ✅ | ✅ | Backpack, WooFi Pro |
| **ECDSA_SECP256K1** | SHA256 | hex | ❌ | ✅ | ❌ | Hyperliquid, Paradex |
| **RSA_SHA256** | SHA256 | base64 | ❌ | ✅ | ❌ | Binance (PEM keys) |
| **API_KEY_ONLY** | - | - | ❌ | ❌ | ❌ | Public endpoints |
| **BASIC_AUTH** | - | base64 | ❌ | ❌ | ❌ | HTTP Basic |
| **BEARER_TOKEN** | - | - | ❌ | ❌ | ❌ | OAuth 2.0 |

## Strategy Families

### HMAC Family (Secret Key Based)
Most common authentication method in cryptocurrency exchanges.

```typescript
// Required credentials
{
  apiKey: true,
  secret: true
}

// Typical flow
1. Concatenate request data (path, params, timestamp)
2. HMAC-hash with secret key
3. Encode to hex/base64
4. Add to headers
```

**Strategies:**
- `HMAC_SHA256` - Most common (50+ exchanges)
- `HMAC_SHA512` - Strong security (Kraken, Gate.io)
- `HMAC_SHA384` - Medium security (Gemini, Bitfinex)
- `HMAC_SHA1` - Legacy only

### JWT Family (Token Based)
JWT (JSON Web Token) with various signature algorithms.

#### HMAC-signed JWT (HS family)
```typescript
// Required credentials
{
  apiKey: true,
  secret: true
}

// Token structure: header.payload.signature
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Strategies:**
- `JWT_HS256` - JWT with HMAC-SHA256
- `JWT_HS384` - JWT with HMAC-SHA384
- `JWT_HS512` - JWT with HMAC-SHA512

#### RSA-signed JWT (RS family)
```typescript
// Required credentials
{
  apiKey: true,
  privateKey: true  // PEM format
}

// Token structure: header.payload.signature
{
  "alg": "RS256",
  "typ": "JWT"
}
```

**Strategies:**
- `JWT_RS256` - Coinbase Cloud, OceanEx
- `JWT_RS384` - RSA with SHA384
- `JWT_RS512` - RSA with SHA512

#### ECDSA-signed JWT (ES family)
```typescript
// Required credentials
{
  apiKey: true,
  privateKey: true  // P-256/P-384/P-521 curve
}

// Token structure: header.payload.signature
{
  "alg": "ES256",
  "typ": "JWT"
}
```

**Strategies:**
- `JWT_ES256` - Upbit (P-256 curve)
- `JWT_ES384` - P-384 curve
- `JWT_ES512` - P-521 curve

### EdDSA Family (Ed25519 Curve)
Modern elliptic curve signatures using Ed25519.

```typescript
// Required credentials
{
  apiKey: true,
  privateKey: true  // Ed25519 private key
}

// Signature flow
1. Create message from request data
2. Sign with Ed25519 private key
3. Encode signature (hex or base58)
4. Add to headers
```

**Strategies:**
- `EDDSA_ED25519` - Backpack, WooFi Pro, Waves Exchange
- `JWT_EDDSA` - JWT with EdDSA signing

**Examples:**
- **Backpack**: Ed25519 signature in `X-Signature` header
- **WooFi Pro**: Ed25519 signature for request signing
- **Waves Exchange**: Ed25519 with base58 encoding

### ECDSA Family (Ethereum-style)
ECDSA signatures using secp256k1 curve (Ethereum standard).

```typescript
// Required credentials
{
  apiKey: true,
  privateKey: true  // secp256k1 private key (Ethereum wallet)
}

// Signature flow
1. Hash message with SHA256
2. Sign hash with ECDSA (secp256k1)
3. Get r, s, v values
4. Format as signature
```

**Strategies:**
- `ECDSA_SECP256K1` - Hyperliquid, Paradex
- `ECDSA_P256` - NIST P-256 curve

**Example - Hyperliquid:**
```typescript
// EIP-712 typed data signing
signature = ecdsa_sign(
  keccak256(typed_data),
  ethereum_private_key
)
```

### RSA Family (PEM Key Based)
Traditional RSA signatures with various hash algorithms.

```typescript
// Required credentials
{
  apiKey: true,
  privateKey: true  // PEM format RSA key
}

// Typical flow
1. Create signing payload
2. Hash with SHA256/384/512
3. RSA sign the hash
4. Base64 encode
```

**Strategies:**
- `RSA_SHA256` - Binance (with PEM keys)
- `RSA_SHA384` - RSA with SHA384
- `RSA_SHA512` - RSA with SHA512

### Simple Strategies
No cryptographic signatures required.

**API_KEY_ONLY**
```typescript
// Headers only
{
  "X-API-KEY": "your-api-key"
}
```

**BASIC_AUTH**
```typescript
// HTTP Basic: base64(username:password)
{
  "Authorization": "Basic dXNlcm5hbWU6cGFzc3dvcmQ="
}
```

**BEARER_TOKEN**
```typescript
// OAuth 2.0 Bearer Token
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
}
```

## Signature Placement

### Header Placement (Most Common)
```typescript
{
  "X-API-KEY": "api-key",
  "X-SIGNATURE": "signature",
  "X-TIMESTAMP": "timestamp"
}
```

**Examples:**
- Binance: `X-MBX-APIKEY`, `signature` in query
- OKX: `OK-ACCESS-KEY`, `OK-ACCESS-SIGN`, `OK-ACCESS-TIMESTAMP`
- KuCoin: `KC-API-KEY`, `KC-API-SIGN`, `KC-API-TIMESTAMP`, `KC-API-PASSPHRASE`

### Query Placement
```http
GET /api/v3/order?symbol=BTCUSDT&timestamp=1234567890&signature=abc123
```

**Examples:**
- Binance: Signature in URL query string
- Some public endpoints: API key in query

### Body Placement
```json
{
  "order": {...},
  "signature": {
    "r": "...",
    "s": "...",
    "v": 27
  }
}
```

**Examples:**
- Hyperliquid: ECDSA signature in request body
- dYdX: Ethereum signature in body

## Credential Requirements

### Standard Credentials
```typescript
interface CredentialRequirements {
  apiKey?: boolean;        // API key
  secret?: boolean;        // Secret key (for HMAC)
  privateKey?: boolean;    // Private key (PEM/hex)
  password?: boolean;      // Passphrase (KuCoin, OKX)
  uid?: boolean;           // User ID (some exchanges)
  login?: boolean;         // Username (HTTP Basic)
  token?: boolean;         // Bearer token (OAuth)
  walletAddress?: boolean; // Wallet address (Ethereum-based)
}
```

### By Strategy Type
```typescript
// HMAC strategies
{ apiKey: true, secret: true }

// JWT with RSA/ECDSA
{ apiKey: true, privateKey: true }

// EdDSA
{ apiKey: true, privateKey: true }

// ECDSA
{ apiKey: true, privateKey: true }

// With Passphrase (KuCoin style)
{ apiKey: true, secret: true, password: true }

// API Key Only
{ apiKey: true }

// Basic Auth
{ login: true, password: true }

// Bearer Token
{ token: true }
```

## Common Header Names by Exchange

### Binance
```typescript
headers: {
  apiKey: 'X-MBX-APIKEY',
  // signature in query string
}
strategy: 'HMAC_SHA256'
```

### OKX
```typescript
headers: {
  apiKey: 'OK-ACCESS-KEY',
  signature: 'OK-ACCESS-SIGN',
  timestamp: 'OK-ACCESS-TIMESTAMP',
  passphrase: 'OK-ACCESS-PASSPHRASE'
}
strategy: 'HMAC_SHA256'
```

### KuCoin
```typescript
headers: {
  apiKey: 'KC-API-KEY',
  signature: 'KC-API-SIGN',
  timestamp: 'KC-API-TIMESTAMP',
  passphrase: 'KC-API-PASSPHRASE'
}
strategy: 'HMAC_SHA256'
```

### Kraken
```typescript
headers: {
  apiKey: 'API-Key',
  signature: 'API-Sign'
}
strategy: 'HMAC_SHA512'
// Special: base64(path) + nonce + postdata
```

### Backpack
```typescript
headers: {
  apiKey: 'X-API-KEY',
  signature: 'X-SIGNATURE',
  timestamp: 'X-TIMESTAMP'
}
strategy: 'EDDSA_ED25519'
```

### Upbit
```typescript
headers: {
  authorization: 'Bearer <jwt-token>'
}
strategy: 'JWT_ES256'
// ES256 = ECDSA P-256 + SHA256
```

### Hyperliquid
```typescript
// Signature in request body
strategy: 'ECDSA_SECP256K1'
// EIP-712 typed data signing
```

## Usage in EDL Definitions

### Example 1: Binance-style HMAC
```typescript
{
  mode: 'signature',
  strategy: 'HMAC_SHA256',
  headers: {
    apiKey: 'X-MBX-APIKEY'
  }
}
```

### Example 2: Kraken-style HMAC-SHA512
```typescript
{
  mode: 'signature',
  strategy: 'HMAC_SHA512',
  headers: {
    apiKey: 'API-Key',
    signature: 'API-Sign'
  }
}
```

### Example 3: EdDSA (Backpack)
```typescript
{
  mode: 'signature',
  strategy: 'EDDSA_ED25519',
  credentials: {
    apiKey: true,
    privateKey: true
  }
}
```

### Example 4: JWT (Upbit)
```typescript
{
  mode: 'oauth',
  strategy: 'JWT_ES256',
  credentials: {
    apiKey: true,
    privateKey: true
  }
}
```

### Example 5: ECDSA (Hyperliquid)
```typescript
{
  mode: 'signature',
  strategy: 'ECDSA_SECP256K1',
  placement: ['body'],
  credentials: {
    privateKey: true,
    walletAddress: true
  }
}
```

## Helper Functions

### Strategy Lookup
```typescript
import { findAuthStrategy } from './schemas/auth-modes.js';

// Case-insensitive lookup
const strategy = findAuthStrategy('hmac-sha256'); // 'HMAC_SHA256'
```

### Get Configuration
```typescript
import { getAuthStrategyConfig } from './schemas/auth-modes.js';

const config = getAuthStrategyConfig('HMAC_SHA256');
// Returns full configuration with hash, encoding, placement, etc.
```

### Mode Mapping
```typescript
import { strategyToMode, getStrategiesForMode } from './schemas/auth-modes.js';

// Strategy → Mode
const mode = strategyToMode('HMAC_SHA256'); // 'signature'

// Mode → Strategies
const strategies = getStrategiesForMode('signature');
// ['HMAC_SHA256', 'HMAC_SHA512', 'HMAC_SHA384', ...]
```

### Credential Analysis
```typescript
import {
  strategyRequiresSecret,
  strategyRequiresPrivateKey,
  getStrategyCredentials
} from './schemas/auth-modes.js';

// Check requirements
strategyRequiresSecret('HMAC_SHA256');      // true
strategyRequiresPrivateKey('HMAC_SHA256');  // false

// Get all credentials
const creds = getStrategyCredentials('HMAC_SHA256');
// { apiKey: true, secret: true }
```

### Compatibility Check
```typescript
import { isStrategyCompatibleWithMode } from './schemas/auth-modes.js';

isStrategyCompatibleWithMode('HMAC_SHA256', 'signature'); // true
isStrategyCompatibleWithMode('HMAC_SHA256', 'oauth');     // false
```

## Implementation Notes

### Timestamp Handling
- **HMAC strategies**: Usually require timestamp in signature
- **JWT strategies**: Timestamp in token payload (iat, exp claims)
- **EdDSA strategies**: Timestamp in request data

### Nonce vs Timestamp
- **Nonce**: Sequential number (Kraken, some exchanges)
- **Timestamp**: Unix milliseconds (most exchanges)
- Some exchanges support both

### Passphrase/Password
- **KuCoin**: Passphrase is HMAC(password, secret)
- **OKX**: Similar passphrase requirement
- **Coinbase**: Passphrase separate from secret

### Key Formats
- **HMAC secret**: Usually hex string or base64
- **RSA private key**: PEM format (-----BEGIN RSA PRIVATE KEY-----)
- **EdDSA private key**: Hex or base64
- **ECDSA private key**: Hex (Ethereum wallet format)

## Security Considerations

### Key Storage
- Never hardcode credentials
- Use environment variables or secure vaults
- Rotate keys regularly

### Signature Algorithms
- **SHA256/512**: Industry standard
- **SHA1**: Deprecated, legacy only
- **Ed25519**: Modern, fast, secure
- **secp256k1**: Ethereum ecosystem standard

### Best Practices
1. Always use HTTPS
2. Include timestamp to prevent replay attacks
3. Validate signatures on both sides
4. Use appropriate key sizes (2048+ for RSA, 256+ for ECC)
5. Handle nonce/timestamp windows properly
6. Log authentication failures
7. Rate limit authentication attempts

## References

- [CCXT Exchange Implementations](https://github.com/ccxt/ccxt/tree/master/ts/src)
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)
- [EdDSA RFC 8032](https://tools.ietf.org/html/rfc8032)
- [ECDSA NIST Standard](https://csrc.nist.gov/publications/detail/fips/186/4/final)
- [Ethereum EIP-712](https://eips.ethereum.org/EIPS/eip-712)
