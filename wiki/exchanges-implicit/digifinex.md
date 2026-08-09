Every endpoint in `digifinex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/digifinex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicSpotGetMarketSymbols`); the snake_case alias (`public_spot_get_market_symbols`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicSpotGetMarketSymbols`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const digifinex = new ccxt.digifinex ();
const response = await digifinex.publicSpotGetMarketSymbols (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const digifinex = new ccxt.digifinex ();
const response = await digifinex.publicSpotGetMarketSymbols (params);
```

#### **Python**

```python
import ccxt
digifinex = ccxt.digifinex()
response = digifinex.public_spot_get_market_symbols(params)
```

#### **PHP**

```php
$digifinex = new \ccxt\digifinex();
$response = $digifinex->public_spot_get_market_symbols($params);
```

#### **C#**

```csharp
using ccxt;
var digifinex = new Digifinex();
var response = await digifinex.publicSpotGetMarketSymbols(parameters);
```

#### **Go**

```go
digifinex := ccxt.NewDigifinex(nil)
response := <-digifinex.PublicSpotGetMarketSymbols(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official digifinex API documentation:** [docs.digifinex.com](https://docs.digifinex.com)

> 88 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicSpotGetMarketSymbols` | GET | `{market}/symbols` | 1 |
| `publicSpotGetKline` | GET | `kline` | 1 |
| `publicSpotGetMarginCurrencies` | GET | `margin/currencies` | 1 |
| `publicSpotGetMarginSymbols` | GET | `margin/symbols` | 1 |
| `publicSpotGetMarkets` | GET | `markets` | 1 |
| `publicSpotGetOrderBook` | GET | `order_book` | 1 |
| `publicSpotGetPing` | GET | `ping` | 1 |
| `publicSpotGetSpotSymbols` | GET | `spot/symbols` | 1 |
| `publicSpotGetTime` | GET | `time` | 1 |
| `publicSpotGetTrades` | GET | `trades` | 1 |
| `publicSpotGetTradesSymbols` | GET | `trades/symbols` | 1 |
| `publicSpotGetTicker` | GET | `ticker` | 1 |
| `publicSpotGetCurrencies` | GET | `currencies` | 1 |
| `publicSwapGetPublicApiWeight` | GET | `public/api_weight` | 1 |
| `publicSwapGetPublicCandles` | GET | `public/candles` | 1 |
| `publicSwapGetPublicCandlesHistory` | GET | `public/candles_history` | 1 |
| `publicSwapGetPublicDepth` | GET | `public/depth` | 1 |
| `publicSwapGetPublicFundingRate` | GET | `public/funding_rate` | 1 |
| `publicSwapGetPublicFundingRateHistory` | GET | `public/funding_rate_history` | 1 |
| `publicSwapGetPublicInstrument` | GET | `public/instrument` | 1 |
| `publicSwapGetPublicInstruments` | GET | `public/instruments` | 1 |
| `publicSwapGetPublicTicker` | GET | `public/ticker` | 1 |
| `publicSwapGetPublicTickers` | GET | `public/tickers` | 1 |
| `publicSwapGetPublicTime` | GET | `public/time` | 1 |
| `publicSwapGetPublicTrades` | GET | `public/trades` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateSpotGetMarketFinancelog` | GET | `{market}/financelog` | 1 |
| `privateSpotGetMarketMytrades` | GET | `{market}/mytrades` | 1 |
| `privateSpotGetMarketOrder` | GET | `{market}/order` | 1 |
| `privateSpotGetMarketOrderDetail` | GET | `{market}/order/detail` | 1 |
| `privateSpotGetMarketOrderCurrent` | GET | `{market}/order/current` | 1 |
| `privateSpotGetMarketOrderHistory` | GET | `{market}/order/history` | 1 |
| `privateSpotGetMarginAssets` | GET | `margin/assets` | 1 |
| `privateSpotGetMarginFinancelog` | GET | `margin/financelog` | 1 |
| `privateSpotGetMarginMytrades` | GET | `margin/mytrades` | 1 |
| `privateSpotGetMarginOrder` | GET | `margin/order` | 1 |
| `privateSpotGetMarginOrderCurrent` | GET | `margin/order/current` | 1 |
| `privateSpotGetMarginOrderHistory` | GET | `margin/order/history` | 1 |
| `privateSpotGetMarginPositions` | GET | `margin/positions` | 1 |
| `privateSpotGetOtcFinancelog` | GET | `otc/financelog` | 1 |
| `privateSpotGetSpotAssets` | GET | `spot/assets` | 1 |
| `privateSpotGetSpotFinancelog` | GET | `spot/financelog` | 1 |
| `privateSpotGetSpotMytrades` | GET | `spot/mytrades` | 1 |
| `privateSpotGetSpotOrder` | GET | `spot/order` | 1 |
| `privateSpotGetSpotOrderCurrent` | GET | `spot/order/current` | 1 |
| `privateSpotGetSpotOrderHistory` | GET | `spot/order/history` | 1 |
| `privateSpotGetDepositAddress` | GET | `deposit/address` | 1 |
| `privateSpotGetDepositHistory` | GET | `deposit/history` | 1 |
| `privateSpotGetWithdrawHistory` | GET | `withdraw/history` | 1 |
| `privateSpotPostMarketOrderCancel` | POST | `{market}/order/cancel` | 1 |
| `privateSpotPostMarketOrderNew` | POST | `{market}/order/new` | 1 |
| `privateSpotPostMarketOrderBatchNew` | POST | `{market}/order/batch_new` | 1 |
| `privateSpotPostMarginOrderCancel` | POST | `margin/order/cancel` | 1 |
| `privateSpotPostMarginOrderNew` | POST | `margin/order/new` | 1 |
| `privateSpotPostMarginPositionClose` | POST | `margin/position/close` | 1 |
| `privateSpotPostSpotOrderCancel` | POST | `spot/order/cancel` | 1 |
| `privateSpotPostSpotOrderNew` | POST | `spot/order/new` | 1 |
| `privateSpotPostTransfer` | POST | `transfer` | 1 |
| `privateSpotPostWithdrawNew` | POST | `withdraw/new` | 1 |
| `privateSpotPostWithdrawCancel` | POST | `withdraw/cancel` | 1 |
| `privateSwapGetAccountBalance` | GET | `account/balance` | 1 |
| `privateSwapGetAccountPositions` | GET | `account/positions` | 1 |
| `privateSwapGetAccountFinanceRecord` | GET | `account/finance_record` | 1 |
| `privateSwapGetAccountTradingFeeRate` | GET | `account/trading_fee_rate` | 1 |
| `privateSwapGetAccountTransferRecord` | GET | `account/transfer_record` | 1 |
| `privateSwapGetAccountFundingFee` | GET | `account/funding_fee` | 1 |
| `privateSwapGetTradeHistoryOrders` | GET | `trade/history_orders` | 1 |
| `privateSwapGetTradeHistoryTrades` | GET | `trade/history_trades` | 1 |
| `privateSwapGetTradeOpenOrders` | GET | `trade/open_orders` | 1 |
| `privateSwapGetTradeOrderInfo` | GET | `trade/order_info` | 1 |
| `privateSwapPostAccountTransfer` | POST | `account/transfer` | 1 |
| `privateSwapPostAccountLeverage` | POST | `account/leverage` | 1 |
| `privateSwapPostAccountPositionMode` | POST | `account/position_mode` | 1 |
| `privateSwapPostAccountPositionMargin` | POST | `account/position_margin` | 1 |
| `privateSwapPostTradeBatchCancelOrder` | POST | `trade/batch_cancel_order` | 1 |
| `privateSwapPostTradeBatchOrder` | POST | `trade/batch_order` | 1 |
| `privateSwapPostTradeCancelOrder` | POST | `trade/cancel_order` | 1 |
| `privateSwapPostTradeOrderPlace` | POST | `trade/order_place` | 1 |
| `privateSwapPostFollowSponsorOrder` | POST | `follow/sponsor_order` | 1 |
| `privateSwapPostFollowCloseOrder` | POST | `follow/close_order` | 1 |
| `privateSwapPostFollowCancelOrder` | POST | `follow/cancel_order` | 1 |
| `privateSwapPostFollowUserCenterCurrent` | POST | `follow/user_center_current` | 1 |
| `privateSwapPostFollowUserCenterHistory` | POST | `follow/user_center_history` | 1 |
| `privateSwapPostFollowExpertCurrentOpenOrder` | POST | `follow/expert_current_open_order` | 1 |
| `privateSwapPostFollowAddAlgo` | POST | `follow/add_algo` | 1 |
| `privateSwapPostFollowCancelAlgo` | POST | `follow/cancel_algo` | 1 |
| `privateSwapPostFollowAccountAvailable` | POST | `follow/account_available` | 1 |
| `privateSwapPostFollowPlanTask` | POST | `follow/plan_task` | 1 |
| `privateSwapPostFollowInstrumentList` | POST | `follow/instrument_list` | 1 |

