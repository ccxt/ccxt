Every endpoint in `indodax`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/indodax) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetApiServerTime`); the snake_case alias (`public_get_api_server_time`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetApiServerTime`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const indodax = new ccxt.indodax ();
const response = await indodax.publicGetApiServerTime (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const indodax = new ccxt.indodax ();
const response = await indodax.publicGetApiServerTime (params);
```

#### **Python**

```python
import ccxt
indodax = ccxt.indodax()
response = indodax.public_get_api_server_time(params)
```

#### **PHP**

```php
$indodax = new \ccxt\indodax();
$response = $indodax->public_get_api_server_time($params);
```

#### **C#**

```csharp
using ccxt;
var indodax = new Indodax();
var response = await indodax.publicGetApiServerTime(parameters);
```

#### **Go**

```go
indodax := ccxt.NewIndodax(nil)
response := <-indodax.PublicGetApiServerTime(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official indodax API documentation:** [github.com](https://github.com/btcid/indodax-official-api-docs)

> 22 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://indodax.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetApiServerTime` | GET | `api/server_time` | 5 |
| `publicGetApiPairs` | GET | `api/pairs` | 5 |
| `publicGetApiPriceIncrements` | GET | `api/price_increments` | 5 |
| `publicGetApiSummaries` | GET | `api/summaries` | 5 |
| `publicGetApiTickerPair` | GET | `api/ticker/{pair}` | 5 |
| `publicGetApiTickerAll` | GET | `api/ticker_all` | 5 |
| `publicGetApiTradesPair` | GET | `api/trades/{pair}` | 5 |
| `publicGetApiDepthPair` | GET | `api/depth/{pair}` | 5 |
| `publicGetTradingviewHistoryV2` | GET | `tradingview/history_v2` | 5 |

## private

**Base URL**: `https://indodax.com/tapi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostGetInfo` | POST | `getInfo` | 4 |
| `privatePostTransHistory` | POST | `transHistory` | 4 |
| `privatePostTrade` | POST | `trade` | 1 |
| `privatePostTradeHistory` | POST | `tradeHistory` | 4 |
| `privatePostOpenOrders` | POST | `openOrders` | 4 |
| `privatePostOrderHistory` | POST | `orderHistory` | 4 |
| `privatePostGetOrder` | POST | `getOrder` | 4 |
| `privatePostCancelOrder` | POST | `cancelOrder` | 4 |
| `privatePostWithdrawFee` | POST | `withdrawFee` | 4 |
| `privatePostWithdrawCoin` | POST | `withdrawCoin` | 4 |
| `privatePostListDownline` | POST | `listDownline` | 4 |
| `privatePostCheckDownline` | POST | `checkDownline` | 4 |
| `privatePostCreateVoucher` | POST | `createVoucher` | 4 |

