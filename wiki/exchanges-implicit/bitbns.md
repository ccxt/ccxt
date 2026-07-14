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
| `wwwGetOrderFetchMarkets` | GET | `order/fetchMarkets` |  |
| `wwwGetOrderFetchTickers` | GET | `order/fetchTickers` |  |
| `wwwGetOrderFetchOrderbook` | GET | `order/fetchOrderbook` |  |
| `wwwGetOrderGetTickerWithVolume` | GET | `order/getTickerWithVolume` |  |
| `wwwGetExchangeDataOhlc` | GET | `exchangeData/ohlc` |  |
| `wwwGetExchangeDataOrderBook` | GET | `exchangeData/orderBook` |  |
| `wwwGetExchangeDataTradedetails` | GET | `exchangeData/tradedetails` |  |

## v1

**Base URL**: `https://api.{hostname}/api/trade/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v1GetPlatformStatus` | GET | `platform/status` |  |
| `v1GetTickers` | GET | `tickers` |  |
| `v1GetOrderbookSellSymbol` | GET | `orderbook/sell/{symbol}` |  |
| `v1GetOrderbookBuySymbol` | GET | `orderbook/buy/{symbol}` |  |
| `v1PostCurrentCoinBalanceEVERYTHING` | POST | `currentCoinBalance/EVERYTHING` |  |
| `v1PostGetApiUsageStatusUSAGE` | POST | `getApiUsageStatus/USAGE` |  |
| `v1PostGetOrderSocketTokenUSAGE` | POST | `getOrderSocketToken/USAGE` |  |
| `v1PostCurrentCoinBalanceSymbol` | POST | `currentCoinBalance/{symbol}` |  |
| `v1PostOrderStatusSymbol` | POST | `orderStatus/{symbol}` |  |
| `v1PostDepositHistorySymbol` | POST | `depositHistory/{symbol}` |  |
| `v1PostWithdrawHistorySymbol` | POST | `withdrawHistory/{symbol}` |  |
| `v1PostWithdrawHistoryAllSymbol` | POST | `withdrawHistoryAll/{symbol}` |  |
| `v1PostDepositHistoryAllSymbol` | POST | `depositHistoryAll/{symbol}` |  |
| `v1PostListOpenOrdersSymbol` | POST | `listOpenOrders/{symbol}` |  |
| `v1PostListOpenStopOrdersSymbol` | POST | `listOpenStopOrders/{symbol}` |  |
| `v1PostGetCoinAddressSymbol` | POST | `getCoinAddress/{symbol}` |  |
| `v1PostPlaceSellOrderSymbol` | POST | `placeSellOrder/{symbol}` |  |
| `v1PostPlaceBuyOrderSymbol` | POST | `placeBuyOrder/{symbol}` |  |
| `v1PostBuyStopLossSymbol` | POST | `buyStopLoss/{symbol}` |  |
| `v1PostSellStopLossSymbol` | POST | `sellStopLoss/{symbol}` |  |
| `v1PostCancelOrderSymbol` | POST | `cancelOrder/{symbol}` |  |
| `v1PostCancelStopLossOrderSymbol` | POST | `cancelStopLossOrder/{symbol}` |  |
| `v1PostListExecutedOrdersSymbol` | POST | `listExecutedOrders/{symbol}` |  |
| `v1PostPlaceMarketOrderSymbol` | POST | `placeMarketOrder/{symbol}` |  |
| `v1PostPlaceMarketOrderQntySymbol` | POST | `placeMarketOrderQnty/{symbol}` |  |

## v2

**Base URL**: `https://api.{hostname}/api/trade/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PostOrders` | POST | `orders` |  |
| `v2PostCancel` | POST | `cancel` |  |
| `v2PostGetordersnew` | POST | `getordersnew` |  |
| `v2PostMarginOrders` | POST | `marginOrders` |  |

