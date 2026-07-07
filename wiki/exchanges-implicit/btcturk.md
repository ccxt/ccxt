Every endpoint in `btcturk`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/btcturk) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetOrderbook`); the snake_case alias (`public_get_orderbook`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetOrderbook`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const btcturk = new ccxt.btcturk ();
const response = await btcturk.publicGetOrderbook (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const btcturk = new ccxt.btcturk ();
const response = await btcturk.publicGetOrderbook (params);
```

#### **Python**

```python
import ccxt
btcturk = ccxt.btcturk()
response = btcturk.public_get_orderbook(params)
```

#### **PHP**

```php
$btcturk = new \ccxt\btcturk();
$response = $btcturk->public_get_orderbook($params);
```

#### **C#**

```csharp
using ccxt;
var btcturk = new Btcturk();
var response = await btcturk.publicGetOrderbook(parameters);
```

#### **Go**

```go
btcturk := ccxt.NewBtcturk(nil)
response := <-btcturk.PublicGetOrderbook(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official btcturk API documentation:** [github.com](https://github.com/BTCTrader/broker-api-docs)

> 16 implicit endpoints across 3 access groups.

## public

**Base URL**: `https://api.btcturk.com/api/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetOrderbook` | GET | `orderbook` | 1 |
| `publicGetTicker` | GET | `ticker` | 0.1 |
| `publicGetTrades` | GET | `trades` | 1 |
| `publicGetOhlc` | GET | `ohlc` | 1 |
| `publicGetServerExchangeinfo` | GET | `server/exchangeinfo` | 1 |

## private

**Base URL**: `https://api.btcturk.com/api/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetUsersBalances` | GET | `users/balances` | 1 |
| `privateGetOpenOrders` | GET | `openOrders` | 1 |
| `privateGetAllOrders` | GET | `allOrders` | 1 |
| `privateGetUsersTransactionsTrade` | GET | `users/transactions/trade` | 1 |
| `privatePostUsersTransactionsCrypto` | POST | `users/transactions/crypto` | 1 |
| `privatePostUsersTransactionsFiat` | POST | `users/transactions/fiat` | 1 |
| `privatePostOrder` | POST | `order` | 1 |
| `privatePostCancelOrder` | POST | `cancelOrder` | 1 |
| `privateDeleteOrder` | DELETE | `order` | 1 |

## graph

**Base URL**: `https://graph-api.btcturk.com/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `graphGetOhlcs` | GET | `ohlcs` | 1 |
| `graphGetKlinesHistory` | GET | `klines/history` | 1 |

