Every endpoint in `zebpay`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/zebpay) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicSpotGetV2SystemTime`); the snake_case alias (`public_spot_get_v2_system_time`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicSpotGetV2SystemTime`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const zebpay = new ccxt.zebpay ();
const response = await zebpay.publicSpotGetV2SystemTime (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const zebpay = new ccxt.zebpay ();
const response = await zebpay.publicSpotGetV2SystemTime (params);
```

#### **Python**

```python
import ccxt
zebpay = ccxt.zebpay()
response = zebpay.public_spot_get_v2_system_time(params)
```

#### **PHP**

```php
$zebpay = new \ccxt\zebpay();
$response = $zebpay->public_spot_get_v2_system_time($params);
```

#### **C#**

```csharp
using ccxt;
var zebpay = new Zebpay();
var response = await zebpay.publicSpotGetV2SystemTime(parameters);
```

#### **Go**

```go
zebpay := ccxt.NewZebpay(nil)
response := <-zebpay.PublicSpotGetV2SystemTime(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official zebpay API documentation:** [github.com](https://github.com/zebpay/zebpay-api-references)

> 42 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicSpotGetV2SystemTime` | GET | `v2/system/time` | 10 |
| `publicSpotGetV2SystemStatus` | GET | `v2/system/status` | 10 |
| `publicSpotGetV2MarketOrderbook` | GET | `v2/market/orderbook` | 10 |
| `publicSpotGetV2MarketTrades` | GET | `v2/market/trades` | 10 |
| `publicSpotGetV2MarketTicker` | GET | `v2/market/ticker` | 10 |
| `publicSpotGetV2MarketAllTickers` | GET | `v2/market/allTickers` | 10 |
| `publicSpotGetV2ExExchangeInfo` | GET | `v2/ex/exchangeInfo` | 10 |
| `publicSpotGetV2ExCurrencies` | GET | `v2/ex/currencies` | 10 |
| `publicSpotGetV2MarketKlines` | GET | `v2/market/klines` | 10 |
| `publicSpotGetV2ExTradefees` | GET | `v2/ex/tradefees` | 10 |
| `publicSwapGetV1SystemTime` | GET | `v1/system/time` | 10 |
| `publicSwapGetV1SystemStatus` | GET | `v1/system/status` | 10 |
| `publicSwapGetV1ExchangeTradefee` | GET | `v1/exchange/tradefee` | 10 |
| `publicSwapGetV1ExchangeTradefees` | GET | `v1/exchange/tradefees` | 10 |
| `publicSwapGetV1MarketOrderBook` | GET | `v1/market/orderBook` | 10 |
| `publicSwapGetV1MarketTicker24Hr` | GET | `v1/market/ticker24Hr` | 10 |
| `publicSwapGetV1MarketMarkets` | GET | `v1/market/markets` | 10 |
| `publicSwapGetV1MarketAggTrade` | GET | `v1/market/aggTrade` | 10 |
| `publicSwapPostV1MarketKlines` | POST | `v1/market/klines` | 10 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateSpotPostV2ExOrders` | POST | `v2/ex/orders` | 10 |
| `privateSpotGetV2ExOrders` | GET | `v2/ex/orders` | 10 |
| `privateSpotGetV2AccountBalance` | GET | `v2/account/balance` | 10 |
| `privateSpotGetV2ExTradefee` | GET | `v2/ex/tradefee` | 10 |
| `privateSpotGetV2ExOrder` | GET | `v2/ex/order` | 10 |
| `privateSpotGetV2ExOrderFills` | GET | `v2/ex/order/fills` | 10 |
| `privateSpotDeleteV2ExOrder` | DELETE | `v2/ex/order` | 10 |
| `privateSpotDeleteV2ExOrders` | DELETE | `v2/ex/orders` | 10 |
| `privateSpotDeleteV2ExOrdersCancelAll` | DELETE | `v2/ex/orders/cancelAll` | 10 |
| `privateSwapGetV1WalletBalance` | GET | `v1/wallet/balance` | 10 |
| `privateSwapGetV1TradeOrder` | GET | `v1/trade/order` | 10 |
| `privateSwapGetV1TradeOrderOpenOrders` | GET | `v1/trade/order/open-orders` | 10 |
| `privateSwapGetV1TradeUserLeverages` | GET | `v1/trade/userLeverages` | 10 |
| `privateSwapGetV1TradeUserLeverage` | GET | `v1/trade/userLeverage` | 10 |
| `privateSwapGetV1TradePositions` | GET | `v1/trade/positions` | 10 |
| `privateSwapGetV1TradeHistory` | GET | `v1/trade/history` | 10 |
| `privateSwapPostV1TradeOrder` | POST | `v1/trade/order` | 10 |
| `privateSwapPostV1TradeOrderAddTPSL` | POST | `v1/trade/order/addTPSL` | 10 |
| `privateSwapPostV1TradeAddMargin` | POST | `v1/trade/addMargin` | 10 |
| `privateSwapPostV1TradeReduceMargin` | POST | `v1/trade/reduceMargin` | 10 |
| `privateSwapPostV1TradePositionClose` | POST | `v1/trade/position/close` | 10 |
| `privateSwapPostV1TradeUpdateUserLeverage` | POST | `v1/trade/update/userLeverage` | 10 |
| `privateSwapDeleteV1TradeOrder` | DELETE | `v1/trade/order` | 10 |

