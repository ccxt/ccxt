Every endpoint in `p2b`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/p2b) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetMarkets`); the snake_case alias (`public_get_markets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetMarkets`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const p2b = new ccxt.p2b ();
const response = await p2b.publicGetMarkets (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const p2b = new ccxt.p2b ();
const response = await p2b.publicGetMarkets (params);
```

#### **Python**

```python
import ccxt
p2b = ccxt.p2b()
response = p2b.public_get_markets(params)
```

#### **PHP**

```php
$p2b = new \ccxt\p2b();
$response = $p2b->public_get_markets($params);
```

#### **C#**

```csharp
using ccxt;
var p2b = new P2b();
var response = await p2b.publicGetMarkets(parameters);
```

#### **Go**

```go
p2b := ccxt.NewP2b(nil)
response := <-p2b.PublicGetMarkets(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official p2b API documentation:** [github.com](https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md)

> 18 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.p2pb2b.com/api/v2/public`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetMarkets` | GET | `markets` | 1 |
| `publicGetMarket` | GET | `market` | 1 |
| `publicGetTickers` | GET | `tickers` | 1 |
| `publicGetTicker` | GET | `ticker` | 1 |
| `publicGetBook` | GET | `book` | 1 |
| `publicGetHistory` | GET | `history` | 1 |
| `publicGetDepthResult` | GET | `depth/result` | 1 |
| `publicGetMarketKline` | GET | `market/kline` | 1 |

## private

**Base URL**: `https://api.p2pb2b.com/api/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostAccountBalances` | POST | `account/balances` | 1 |
| `privatePostAccountBalance` | POST | `account/balance` | 1 |
| `privatePostOrderNew` | POST | `order/new` | 1 |
| `privatePostOrderCancel` | POST | `order/cancel` | 1 |
| `privatePostOrders` | POST | `orders` | 1 |
| `privatePostAccountMarketOrderHistory` | POST | `account/market_order_history` | 1 |
| `privatePostAccountMarketDealHistory` | POST | `account/market_deal_history` | 1 |
| `privatePostAccountOrder` | POST | `account/order` | 1 |
| `privatePostAccountOrderHistory` | POST | `account/order_history` | 1 |
| `privatePostAccountExecutedHistory` | POST | `account/executed_history` | 1 |

