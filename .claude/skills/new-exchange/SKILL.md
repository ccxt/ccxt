---
name: new-exchange
description: Scaffold a new CCXT exchange integration in TypeScript, following the certified-exchange template. Walks through describe(), required unified methods, parsers, capability flags, sandbox setup, and static fixtures. Use when adding support for an exchange that does not exist yet under ts/src/.
---

# New Exchange Integration

Scaffold a new exchange in `ts/src/<id>.ts` (REST) and optionally `ts/src/pro/<id>.ts` (WebSocket).

> **Read first:** `wiki/Requirements.md` (mandatory unified methods) and `CONTRIBUTING.md` (transpiler rules). The CCXT root `CLAUDE.md` is the contributor guide.

## Inputs
- `<id>`: lowercase exchange id, no separators (e.g. `mynewex`)
- `<Name>`: human-readable name (e.g. `My New Exchange`)
- API docs URL(s)
- Whether the exchange has a testnet/sandbox

## Step 1 — Pick a reference exchange

Don't write from scratch. Copy a similar exchange that's already certified and adapt it.

| Style | Reference |
|---|---|
| Spot + futures, signed REST | `ts/src/binance.ts`, `ts/src/okx.ts` |
| Spot only | `ts/src/kraken.ts`, `ts/src/coinbase.ts` |
| Derivatives focus | `ts/src/bybit.ts`, `ts/src/bitmex.ts` |
| Decentralised / on-chain signing | `ts/src/hyperliquid.ts`, `ts/src/dydx.ts` |
| WebSocket reference | `ts/src/pro/binance.ts`, `ts/src/pro/okx.ts` |

Open the reference next to your new file and pattern-match — never invent new conventions.

## Step 2 — Create `ts/src/<id>.ts`

Skeleton:

```ts
import Exchange from './abstract/<id>.js';
import { /* errors needed */ } from './base/errors.js';
import { Precise } from './base/Precise.js';
import type { /* types needed */ } from './base/types.js';

export default class <id> extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': '<id>',
            'name': '<Name>',
            'countries': [ 'XX' ],
            'rateLimit': 1000,        // ms between requests
            'version': 'v1',
            'certified': false,
            'pro': false,             // flip to true when pro/<id>.ts exists
            'has': {
                // start everything false; flip to true as you implement
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchOHLCV': false,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchOrders': false,
                'fetchClosedOrders': false,
                'fetchMyTrades': true,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://...',
                'api': {
                    'public': 'https://api.<id>.com',
                    'private': 'https://api.<id>.com',
                },
                'test': {                              // OPTIONAL — only if testnet exists
                    'public': 'https://testnet.<id>.com',
                    'private': 'https://testnet.<id>.com',
                },
                'www': 'https://<id>.com',
                'doc': [ 'https://docs.<id>.com' ],
                'fees': 'https://<id>.com/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'symbols',
                        'ticker/{pair}',
                        'orderbook/{pair}',
                    ],
                },
                'private': {
                    'get': [ 'account', 'orders' ],
                    'post': [ 'order' ],
                    'delete': [ 'order/{id}' ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                // 'password': true,        // for passphrase-based exchanges
                // 'walletAddress': true,   // for on-chain
                // 'privateKey': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.001,
                    'taker': 0.001,
                },
            },
            'precisionMode': /* TICK_SIZE | DECIMAL_PLACES | SIGNIFICANT_DIGITS */,
            'options': {
                // exchange-specific defaults
            },
            'exceptions': {
                'exact': {
                    // 'ERROR_CODE': BadRequest,
                },
                'broad': {
                    // 'invalid signature': AuthenticationError,
                },
            },
        });
    }

    // implement the unified methods you flipped on in `has`
    async fetchMarkets (params = {}): Promise<Market[]> { /* ... */ }
    parseMarket (market: Dict): Market { /* ... */ }
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> { /* ... */ }
    parseTicker (ticker: Dict, market: Market = undefined): Ticker { /* ... */ }
    // ...

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // build URL, sign request — use this.hmac, this.jwt, this.ecdsa, never external libs
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        // throw the right exception based on response
    }
}
```

## Step 3 — Define implicit API methods

URLs in the `api` block become methods automatically:
- `'symbols'` → `this.publicGetSymbols(params)`
- `'ticker/{pair}'` → `this.publicGetTickerPair({ pair: market['id'] })`
- `'orders'` under `private.get` → `this.privateGetOrders(params)`

Don't write explicit HTTP wrappers. After listing the URL in `api`, run `npm run emitAPITs` to regenerate `ts/src/abstract/<id>.ts` (the auto-typed declarations).

## Step 4 — Docstrings on every public method

Every public method needs a JSDoc block. The transpilers convert it to native docstrings in Python/PHP/C#/Go, and `npm run build-docs` produces wiki entries from them. Pattern:

```ts
/**
 * @method
 * @name <id>#fetchMyTrades
 * @description fetches all completed trades made by the user
 * @see https://docs.<id>.com/api/trades                 // spot
 * @see https://docs.<id>.com/api/derivatives/trades     // swap
 * @param {string} symbol unified market symbol
 * @param {int} [since] earliest timestamp in ms
 * @param {int} [limit] maximum number of trades to return
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @param {int} [params.until] latest timestamp in ms
 * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
 */
async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
    // ...
}
```

Rules: lowercase `@description`, `@param {object} [params]` always present, document every `params.<key>` you read in the body, link `@returns` to the manual structure. See CLAUDE.md §7 for the full ruleset.

## Step 5 — Required parsers

For every fetch method, write a matching parser. The parser is what makes output uniform across all exchanges:

| Fetch method | Parser | Validator (test) |
|---|---|---|
| `fetchMarkets` | `parseMarket` | `ts/src/test/Exchange/base/test.market.ts` |
| `fetchCurrencies` | `parseCurrency` | `test.currency.ts` |
| `fetchTicker` | `parseTicker` | `test.ticker.ts` |
| `fetchOrderBook` | base `parseOrderBook` | `test.orderBook.ts` |
| `fetchTrades`, `fetchMyTrades` | `parseTrade` | `test.trade.ts` |
| `fetchOHLCV` | `parseOHLCV` | `test.ohlcv.ts` |
| `fetchBalance` | `parseBalance` | `test.balance.ts` |
| `createOrder`, `fetchOrder`, `fetchOpenOrders` | `parseOrder` | `test.order.ts` |
| `fetchPositions` | `parsePosition` | `test.position.ts` |

**Parsing rules** (also in CLAUDE.md §7):
- Always `safeString` first, parse with `Precise` for math, finalise with `parseNumber` only at the return.
- Symbol resolution: `this.safeSymbol(marketId, market)` — never put exchange-specific ids into unified output.
- Time: convert seconds → ms using `safeTimestamp`; everything in unified output is ms.

## Step 6 — Static fixtures (TDD)

Capture a request/response fixture as soon as a method works once. Re-run on every change.

```bash
# request fixture (URL/body assertion) — NO HTTP
node cli.js <id> fetchTicker BTC/USDT --report
# response fixture (parser assertion) — NO HTTP
node cli.js <id> fetchTicker BTC/USDT --response
```

Paste each `methods.<methodName>` entry into `ts/src/test/static/request/<id>.json` or `ts/src/test/static/response/<id>.json`. Then run:

```bash
npm run request-tests
npm run response-tests
```

These tests run in all five languages and are your primary regression net.

## Step 7 — Verify in all languages

A new exchange means thousands of new lines in Python, PHP, C# and Go. The transpilers must like all of it.

```bash
npm run lint
npm run tsBuild
npm run transpile          # → Python, PHP
npm run transpileCS        # → C#
npm run buildCS
npm run transpileGO        # → Go
npm run buildGO
npm run check-python-syntax
npm run check-php-syntax
npm run id-tests
npm run request-tests
npm run response-tests
```

Then a live smoke test on at least one public method per language:

```bash
npm run cli.ts -- <id> fetchTicker BTC/USDT --verbose
npm run cli.py -- <id> fetchTicker BTC/USDT --verbose
npm run cli.php -- <id> fetchTicker BTC/USDT --verbose
npm run cli.cs -- <id> fetchTicker BTC/USDT --verbose
npm run cli.go -- <id> fetchTicker BTC/USDT --verbose
```

## Step 8 — WebSocket support (optional)

If the exchange has WS, create `ts/src/pro/<id>.ts`. It must `extends <id>Rest` and add `watch*` methods. Reference: `ts/src/pro/binance.ts`. Flip `'pro': true` in REST `describe()`.

## Step 9 — Update user-facing docs

A new exchange means new public surface area. Update the touchpoints listed in CLAUDE.md §8:

- `wiki/Manual.md` doesn't usually list per-exchange specifics, but add a section if your exchange introduces a new pattern (e.g. a new auth scheme, new params).
- Verify `examples/ts/<id>-example.ts` has at least one runnable snippet (transpiled to other languages by `npm run tsBuildExamples`).
- The end-user skills under `.claude/skills/ccxt-{typescript,python,php,csharp,go}/` mention "all 100+ exchanges" — usually no edit needed unless your exchange has unique credential requirements (e.g. wallet/private key) worth calling out.
- `npm run build-docs` regenerates wiki entries from your JSDoc — run it once and inspect the output.

## Step 10 — PR

Title: `feat(<id>): add <Name> integration`. Description follows the template in CLAUDE.md §11 — list every test you ran with results, and reference any related issue/PR.

## Output checklist

- [ ] `ts/src/<id>.ts` written (uses Precise, safeString*, safeSymbol)
- [ ] **Every public method has a JSDoc block** (CLAUDE.md §7)
- [ ] `'has'` flags accurately reflect implemented methods
- [ ] `'urls.test'` set if exchange has a testnet
- [ ] `'requiredCredentials'` matches what `sign()` actually uses
- [ ] All required parsers (`parseMarket`, `parseTicker`, `parseTrade`, `parseOrder`, …)
- [ ] `handleErrors` maps exchange error codes to CCXT exception classes
- [ ] `ts/src/abstract/<id>.ts` regenerated via `npm run emitAPITs`
- [ ] Static request + response fixtures for every implemented method
- [ ] `npm run lint && npm run tsBuild && npm run transpile && npm run transpileCS && npm run transpileGO` all pass
- [ ] `npm run id-tests && npm run request-tests && npm run response-tests` all pass
- [ ] Live smoke tested in TS + at least one transpiled language (`cli.py`, `cli.cs`, `cli.go`, …) with `--verbose`
- [ ] `npm run build-docs` ran, generated wiki entries look correct
- [ ] User-facing docs reviewed (CLAUDE.md §8) — Manual.md / examples / language skills if anything is non-standard
- [ ] PR title follows `feat(<id>): ...`; description fills CLAUDE.md §11 template
