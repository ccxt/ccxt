Every endpoint in `btcmarkets`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/btcmarkets) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetMarkets`); the snake_case alias (`public_get_markets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetMarkets`). Switch tabs for the call in each language:

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
| `publicGetMarkets` | GET | `markets` |  |
| `publicGetMarketsMarketIdTicker` | GET | `markets/{marketId}/ticker` |  |
| `publicGetMarketsMarketIdTrades` | GET | `markets/{marketId}/trades` |  |
| `publicGetMarketsMarketIdOrderbook` | GET | `markets/{marketId}/orderbook` |  |
| `publicGetMarketsMarketIdCandles` | GET | `markets/{marketId}/candles` |  |
| `publicGetMarketsTickers` | GET | `markets/tickers` |  |
| `publicGetMarketsOrderbooks` | GET | `markets/orderbooks` |  |
| `publicGetTime` | GET | `time` |  |

## private

**Base URL**: `https://api.btcmarkets.net`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetOrders` | GET | `orders` |  |
| `privateGetOrdersId` | GET | `orders/{id}` |  |
| `privateGetBatchordersIds` | GET | `batchorders/{ids}` |  |
| `privateGetTrades` | GET | `trades` |  |
| `privateGetTradesId` | GET | `trades/{id}` |  |
| `privateGetWithdrawals` | GET | `withdrawals` |  |
| `privateGetWithdrawalsId` | GET | `withdrawals/{id}` |  |
| `privateGetDeposits` | GET | `deposits` |  |
| `privateGetDepositsId` | GET | `deposits/{id}` |  |
| `privateGetTransfers` | GET | `transfers` |  |
| `privateGetTransfersId` | GET | `transfers/{id}` |  |
| `privateGetAddresses` | GET | `addresses` |  |
| `privateGetWithdrawalFees` | GET | `withdrawal-fees` |  |
| `privateGetAssets` | GET | `assets` |  |
| `privateGetAccountsMeTradingFees` | GET | `accounts/me/trading-fees` |  |
| `privateGetAccountsMeWithdrawalLimits` | GET | `accounts/me/withdrawal-limits` |  |
| `privateGetAccountsMeBalances` | GET | `accounts/me/balances` |  |
| `privateGetAccountsMeTransactions` | GET | `accounts/me/transactions` |  |
| `privateGetReportsId` | GET | `reports/{id}` |  |
| `privatePostOrders` | POST | `orders` |  |
| `privatePostBatchorders` | POST | `batchorders` |  |
| `privatePostWithdrawals` | POST | `withdrawals` |  |
| `privatePostReports` | POST | `reports` |  |
| `privateDeleteOrders` | DELETE | `orders` |  |
| `privateDeleteOrdersId` | DELETE | `orders/{id}` |  |
| `privateDeleteBatchordersIds` | DELETE | `batchorders/{ids}` |  |
| `privatePutOrdersId` | PUT | `orders/{id}` |  |

