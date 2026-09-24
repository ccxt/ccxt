Every endpoint in `btcmarkets`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/btcmarkets) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetMarkets`); the snake_case alias (`public_get_markets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetMarkets`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const btcmarkets = new ccxt.btcmarkets ();
const response = await btcmarkets.publicGetMarkets (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const btcmarkets = new ccxt.btcmarkets ();
const response = await btcmarkets.publicGetMarkets (params);
```

#### **Python**

```python
import ccxt
btcmarkets = ccxt.btcmarkets()
response = btcmarkets.public_get_markets(params)
```

#### **PHP**

```php
$btcmarkets = new \ccxt\btcmarkets();
$response = $btcmarkets->public_get_markets($params);
```

#### **C#**

```csharp
using ccxt;
var btcmarkets = new Btcmarkets();
var response = await btcmarkets.publicGetMarkets(parameters);
```

#### **Go**

```go
btcmarkets := ccxt.NewBtcmarkets(nil)
response := <-btcmarkets.PublicGetMarkets(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official btcmarkets API documentation:** [api.btcmarkets.net](https://api.btcmarkets.net/doc/v3) · [github.com](https://github.com/BTCMarkets/API)

> 35 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.btcmarkets.net`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetMarkets` | GET | `markets` | 1 |
| `publicGetMarketsMarketIdTicker` | GET | `markets/{marketId}/ticker` | 1 |
| `publicGetMarketsMarketIdTrades` | GET | `markets/{marketId}/trades` | 1 |
| `publicGetMarketsMarketIdOrderbook` | GET | `markets/{marketId}/orderbook` | 1 |
| `publicGetMarketsMarketIdCandles` | GET | `markets/{marketId}/candles` | 1 |
| `publicGetMarketsTickers` | GET | `markets/tickers` | 1 |
| `publicGetMarketsOrderbooks` | GET | `markets/orderbooks` | 1 |
| `publicGetTime` | GET | `time` | 1 |

## private

**Base URL**: `https://api.btcmarkets.net`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetOrders` | GET | `orders` | 1 |
| `privateGetOrdersId` | GET | `orders/{id}` | 1 |
| `privateGetBatchordersIds` | GET | `batchorders/{ids}` | 1 |
| `privateGetTrades` | GET | `trades` | 1 |
| `privateGetTradesId` | GET | `trades/{id}` | 1 |
| `privateGetWithdrawals` | GET | `withdrawals` | 1 |
| `privateGetWithdrawalsId` | GET | `withdrawals/{id}` | 1 |
| `privateGetDeposits` | GET | `deposits` | 1 |
| `privateGetDepositsId` | GET | `deposits/{id}` | 1 |
| `privateGetTransfers` | GET | `transfers` | 1 |
| `privateGetTransfersId` | GET | `transfers/{id}` | 1 |
| `privateGetAddresses` | GET | `addresses` | 1 |
| `privateGetWithdrawalFees` | GET | `withdrawal-fees` | 1 |
| `privateGetAssets` | GET | `assets` | 1 |
| `privateGetAccountsMeTradingFees` | GET | `accounts/me/trading-fees` | 1 |
| `privateGetAccountsMeWithdrawalLimits` | GET | `accounts/me/withdrawal-limits` | 1 |
| `privateGetAccountsMeBalances` | GET | `accounts/me/balances` | 1 |
| `privateGetAccountsMeTransactions` | GET | `accounts/me/transactions` | 1 |
| `privateGetReportsId` | GET | `reports/{id}` | 1 |
| `privatePostOrders` | POST | `orders` | 1 |
| `privatePostBatchorders` | POST | `batchorders` | 1 |
| `privatePostWithdrawals` | POST | `withdrawals` | 1 |
| `privatePostReports` | POST | `reports` | 1 |
| `privateDeleteOrders` | DELETE | `orders` | 1 |
| `privateDeleteOrdersId` | DELETE | `orders/{id}` | 1 |
| `privateDeleteBatchordersIds` | DELETE | `batchorders/{ids}` | 1 |
| `privatePutOrdersId` | PUT | `orders/{id}` | 1 |

