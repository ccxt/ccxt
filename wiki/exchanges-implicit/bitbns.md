Every endpoint in `bitbns`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitbns) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `wwwGetOrderFetchMarkets`); the snake_case alias (`www_get_order_fetchmarkets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`WwwGetOrderFetchMarkets`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bitbns = new ccxt.bitbns ();
const response = await bitbns.wwwGetOrderFetchMarkets (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bitbns = new ccxt.bitbns ();
const response = await bitbns.wwwGetOrderFetchMarkets (params);
```

#### **Python**

```python
import ccxt
bitbns = ccxt.bitbns()
response = bitbns.www_get_order_fetchmarkets(params)
```

#### **PHP**

```php
$bitbns = new \ccxt\bitbns();
$response = $bitbns->www_get_order_fetchmarkets($params);
```

#### **C#**

```csharp
using ccxt;
var bitbns = new Bitbns();
var response = await bitbns.wwwGetOrderFetchMarkets(parameters);
```

#### **Go**

```go
bitbns := ccxt.NewBitbns(nil)
response := <-bitbns.WwwGetOrderFetchMarkets(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bitbns API documentation:** [bitbns.com](https://bitbns.com/trade/#/api-trading/)

> 36 implicit endpoints across 3 access groups.

## www

**Base URL**: `https://{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `wwwGetOrderFetchMarkets` | GET | `order/fetchMarkets` | 1 |
| `wwwGetOrderFetchTickers` | GET | `order/fetchTickers` | 1 |
| `wwwGetOrderFetchOrderbook` | GET | `order/fetchOrderbook` | 1 |
| `wwwGetOrderGetTickerWithVolume` | GET | `order/getTickerWithVolume` | 1 |
| `wwwGetExchangeDataOhlc` | GET | `exchangeData/ohlc` | 1 |
| `wwwGetExchangeDataOrderBook` | GET | `exchangeData/orderBook` | 1 |
| `wwwGetExchangeDataTradedetails` | GET | `exchangeData/tradedetails` | 1 |

## v1

**Base URL**: `https://api.{hostname}/api/trade/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v1GetPlatformStatus` | GET | `platform/status` | 1 |
| `v1GetTickers` | GET | `tickers` | 1 |
| `v1GetOrderbookSellSymbol` | GET | `orderbook/sell/{symbol}` | 1 |
| `v1GetOrderbookBuySymbol` | GET | `orderbook/buy/{symbol}` | 1 |
| `v1PostCurrentCoinBalanceEVERYTHING` | POST | `currentCoinBalance/EVERYTHING` | 1 |
| `v1PostGetApiUsageStatusUSAGE` | POST | `getApiUsageStatus/USAGE` | 1 |
| `v1PostGetOrderSocketTokenUSAGE` | POST | `getOrderSocketToken/USAGE` | 1 |
| `v1PostCurrentCoinBalanceSymbol` | POST | `currentCoinBalance/{symbol}` | 1 |
| `v1PostOrderStatusSymbol` | POST | `orderStatus/{symbol}` | 1 |
| `v1PostDepositHistorySymbol` | POST | `depositHistory/{symbol}` | 1 |
| `v1PostWithdrawHistorySymbol` | POST | `withdrawHistory/{symbol}` | 1 |
| `v1PostWithdrawHistoryAllSymbol` | POST | `withdrawHistoryAll/{symbol}` | 1 |
| `v1PostDepositHistoryAllSymbol` | POST | `depositHistoryAll/{symbol}` | 1 |
| `v1PostListOpenOrdersSymbol` | POST | `listOpenOrders/{symbol}` | 1 |
| `v1PostListOpenStopOrdersSymbol` | POST | `listOpenStopOrders/{symbol}` | 1 |
| `v1PostGetCoinAddressSymbol` | POST | `getCoinAddress/{symbol}` | 1 |
| `v1PostPlaceSellOrderSymbol` | POST | `placeSellOrder/{symbol}` | 1 |
| `v1PostPlaceBuyOrderSymbol` | POST | `placeBuyOrder/{symbol}` | 1 |
| `v1PostBuyStopLossSymbol` | POST | `buyStopLoss/{symbol}` | 1 |
| `v1PostSellStopLossSymbol` | POST | `sellStopLoss/{symbol}` | 1 |
| `v1PostCancelOrderSymbol` | POST | `cancelOrder/{symbol}` | 1 |
| `v1PostCancelStopLossOrderSymbol` | POST | `cancelStopLossOrder/{symbol}` | 1 |
| `v1PostListExecutedOrdersSymbol` | POST | `listExecutedOrders/{symbol}` | 1 |
| `v1PostPlaceMarketOrderSymbol` | POST | `placeMarketOrder/{symbol}` | 1 |
| `v1PostPlaceMarketOrderQntySymbol` | POST | `placeMarketOrderQnty/{symbol}` | 1 |

## v2

**Base URL**: `https://api.{hostname}/api/trade/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PostOrders` | POST | `orders` | 1 |
| `v2PostCancel` | POST | `cancel` | 1 |
| `v2PostGetordersnew` | POST | `getordersnew` | 1 |
| `v2PostMarginOrders` | POST | `marginOrders` | 1 |

