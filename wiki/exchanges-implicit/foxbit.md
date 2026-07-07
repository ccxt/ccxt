Every endpoint in `foxbit`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/foxbit) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `v3PublicGetCurrencies`); the snake_case alias (`v3_public_get_currencies`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`V3PublicGetCurrencies`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const foxbit = new ccxt.foxbit ();
const response = await foxbit.v3PublicGetCurrencies (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const foxbit = new ccxt.foxbit ();
const response = await foxbit.v3PublicGetCurrencies (params);
```

#### **Python**

```python
import ccxt
foxbit = ccxt.foxbit()
response = foxbit.v3_public_get_currencies(params)
```

#### **PHP**

```php
$foxbit = new \ccxt\foxbit();
$response = $foxbit->v3_public_get_currencies($params);
```

#### **C#**

```csharp
using ccxt;
var foxbit = new Foxbit();
var response = await foxbit.v3PublicGetCurrencies(parameters);
```

#### **Go**

```go
foxbit := ccxt.NewFoxbit(nil)
response := <-foxbit.V3PublicGetCurrencies(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official foxbit API documentation:** [docs.foxbit.com.br](https://docs.foxbit.com.br)

> 22 implicit endpoints across 2 access groups.

## v3

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v3PublicGetCurrencies` | GET | `currencies` | 5 |
| `v3PublicGetMarkets` | GET | `markets` | 5 |
| `v3PublicGetMarketsTicker24hr` | GET | `markets/ticker/24hr` | 60 |
| `v3PublicGetMarketsMarketOrderbook` | GET | `markets/{market}/orderbook` | 6 |
| `v3PublicGetMarketsMarketCandlesticks` | GET | `markets/{market}/candlesticks` | 12 |
| `v3PublicGetMarketsMarketTradesHistory` | GET | `markets/{market}/trades/history` | 12 |
| `v3PublicGetMarketsMarketTicker24hr` | GET | `markets/{market}/ticker/24hr` | 15 |
| `v3PrivateGetAccounts` | GET | `accounts` | 2 |
| `v3PrivateGetAccountsSymbolTransactions` | GET | `accounts/{symbol}/transactions` | 60 |
| `v3PrivateGetOrders` | GET | `orders` | 2 |
| `v3PrivateGetOrdersByOrderIdId` | GET | `orders/by-order-id/{id}` | 2 |
| `v3PrivateGetTrades` | GET | `trades` | 6 |
| `v3PrivateGetDepositsAddress` | GET | `deposits/address` | 10 |
| `v3PrivateGetDeposits` | GET | `deposits` | 10 |
| `v3PrivateGetWithdrawals` | GET | `withdrawals` | 10 |
| `v3PrivateGetMeFeesTrading` | GET | `me/fees/trading` | 60 |
| `v3PrivatePostOrders` | POST | `orders` | 2 |
| `v3PrivatePostOrdersBatch` | POST | `orders/batch` | 7.5 |
| `v3PrivatePostOrdersCancelReplace` | POST | `orders/cancel-replace` | 3 |
| `v3PrivatePostWithdrawals` | POST | `withdrawals` | 10 |
| `v3PrivatePutOrdersCancel` | PUT | `orders/cancel` | 2 |

## status

**Base URL**: `https://metadata-v2.foxbit.com.br/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `statusPublicGetStatus` | GET | `status` | 30 |

