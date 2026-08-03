Every endpoint in `hollaex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/hollaex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetHealth`); the snake_case alias (`public_get_health`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetHealth`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const hollaex = new ccxt.hollaex ();
const response = await hollaex.publicGetHealth (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const hollaex = new ccxt.hollaex ();
const response = await hollaex.publicGetHealth (params);
```

#### **Python**

```python
import ccxt
hollaex = ccxt.hollaex()
response = hollaex.public_get_health(params)
```

#### **PHP**

```php
$hollaex = new \ccxt\hollaex();
$response = $hollaex->public_get_health($params);
```

#### **C#**

```csharp
using ccxt;
var hollaex = new Hollaex();
var response = await hollaex.publicGetHealth(parameters);
```

#### **Go**

```go
hollaex := ccxt.NewHollaex(nil)
response := <-hollaex.PublicGetHealth(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official hollaex API documentation:** [apidocs.hollaex.com](https://apidocs.hollaex.com)

> 29 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetHealth` | GET | `health` | 1 |
| `publicGetConstants` | GET | `constants` | 1 |
| `publicGetKit` | GET | `kit` | 1 |
| `publicGetTiers` | GET | `tiers` | 1 |
| `publicGetTicker` | GET | `ticker` | 1 |
| `publicGetTickers` | GET | `tickers` | 1 |
| `publicGetOrderbook` | GET | `orderbook` | 1 |
| `publicGetOrderbooks` | GET | `orderbooks` | 1 |
| `publicGetTrades` | GET | `trades` | 1 |
| `publicGetChart` | GET | `chart` | 1 |
| `publicGetCharts` | GET | `charts` | 1 |
| `publicGetMinicharts` | GET | `minicharts` | 1 |
| `publicGetOraclePrices` | GET | `oracle/prices` | 1 |
| `publicGetQuickTrade` | GET | `quick-trade` | 1 |
| `publicGetUdfConfig` | GET | `udf/config` | 1 |
| `publicGetUdfHistory` | GET | `udf/history` | 1 |
| `publicGetUdfSymbols` | GET | `udf/symbols` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetUser` | GET | `user` | 1 |
| `privateGetUserBalance` | GET | `user/balance` | 1 |
| `privateGetUserDeposits` | GET | `user/deposits` | 1 |
| `privateGetUserWithdrawals` | GET | `user/withdrawals` | 1 |
| `privateGetUserWithdrawalFee` | GET | `user/withdrawal/fee` | 1 |
| `privateGetUserTrades` | GET | `user/trades` | 1 |
| `privateGetOrders` | GET | `orders` | 1 |
| `privateGetOrder` | GET | `order` | 1 |
| `privatePostUserWithdrawal` | POST | `user/withdrawal` | 1 |
| `privatePostOrder` | POST | `order` | 1 |
| `privateDeleteOrderAll` | DELETE | `order/all` | 1 |
| `privateDeleteOrder` | DELETE | `order` | 1 |

