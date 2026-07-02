Every endpoint in `digifinex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/digifinex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicSpotGetMarketSymbols`); the snake_case alias (`public_spot_get_market_symbols`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicSpotGetMarketSymbols`). Switch tabs for the call in each language:

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
| `publicSpotGetMarketSymbols` | GET | `{market}/symbols` |  |
| `publicSpotGetKline` | GET | `kline` |  |
| `publicSpotGetMarginCurrencies` | GET | `margin/currencies` |  |
| `publicSpotGetMarginSymbols` | GET | `margin/symbols` |  |
| `publicSpotGetMarkets` | GET | `markets` |  |
| `publicSpotGetOrderBook` | GET | `order_book` |  |
| `publicSpotGetPing` | GET | `ping` |  |
| `publicSpotGetSpotSymbols` | GET | `spot/symbols` |  |
| `publicSpotGetTime` | GET | `time` |  |
| `publicSpotGetTrades` | GET | `trades` |  |
| `publicSpotGetTradesSymbols` | GET | `trades/symbols` |  |
| `publicSpotGetTicker` | GET | `ticker` |  |
| `publicSpotGetCurrencies` | GET | `currencies` |  |
| `publicSwapGetPublicApiWeight` | GET | `public/api_weight` |  |
| `publicSwapGetPublicCandles` | GET | `public/candles` |  |
| `publicSwapGetPublicCandlesHistory` | GET | `public/candles_history` |  |
| `publicSwapGetPublicDepth` | GET | `public/depth` |  |
| `publicSwapGetPublicFundingRate` | GET | `public/funding_rate` |  |
| `publicSwapGetPublicFundingRateHistory` | GET | `public/funding_rate_history` |  |
| `publicSwapGetPublicInstrument` | GET | `public/instrument` |  |
| `publicSwapGetPublicInstruments` | GET | `public/instruments` |  |
| `publicSwapGetPublicTicker` | GET | `public/ticker` |  |
| `publicSwapGetPublicTickers` | GET | `public/tickers` |  |
| `publicSwapGetPublicTime` | GET | `public/time` |  |
| `publicSwapGetPublicTrades` | GET | `public/trades` |  |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateSpotGetMarketFinancelog` | GET | `{market}/financelog` |  |
| `privateSpotGetMarketMytrades` | GET | `{market}/mytrades` |  |
| `privateSpotGetMarketOrder` | GET | `{market}/order` |  |
| `privateSpotGetMarketOrderDetail` | GET | `{market}/order/detail` |  |
| `privateSpotGetMarketOrderCurrent` | GET | `{market}/order/current` |  |
| `privateSpotGetMarketOrderHistory` | GET | `{market}/order/history` |  |
| `privateSpotGetMarginAssets` | GET | `margin/assets` |  |
| `privateSpotGetMarginFinancelog` | GET | `margin/financelog` |  |
| `privateSpotGetMarginMytrades` | GET | `margin/mytrades` |  |
| `privateSpotGetMarginOrder` | GET | `margin/order` |  |
| `privateSpotGetMarginOrderCurrent` | GET | `margin/order/current` |  |
| `privateSpotGetMarginOrderHistory` | GET | `margin/order/history` |  |
| `privateSpotGetMarginPositions` | GET | `margin/positions` |  |
| `privateSpotGetOtcFinancelog` | GET | `otc/financelog` |  |
| `privateSpotGetSpotAssets` | GET | `spot/assets` |  |
| `privateSpotGetSpotFinancelog` | GET | `spot/financelog` |  |
| `privateSpotGetSpotMytrades` | GET | `spot/mytrades` |  |
| `privateSpotGetSpotOrder` | GET | `spot/order` |  |
| `privateSpotGetSpotOrderCurrent` | GET | `spot/order/current` |  |
| `privateSpotGetSpotOrderHistory` | GET | `spot/order/history` |  |
| `privateSpotGetDepositAddress` | GET | `deposit/address` |  |
| `privateSpotGetDepositHistory` | GET | `deposit/history` |  |
| `privateSpotGetWithdrawHistory` | GET | `withdraw/history` |  |
| `privateSpotPostMarketOrderCancel` | POST | `{market}/order/cancel` |  |
| `privateSpotPostMarketOrderNew` | POST | `{market}/order/new` |  |
| `privateSpotPostMarketOrderBatchNew` | POST | `{market}/order/batch_new` |  |
| `privateSpotPostMarginOrderCancel` | POST | `margin/order/cancel` |  |
| `privateSpotPostMarginOrderNew` | POST | `margin/order/new` |  |
| `privateSpotPostMarginPositionClose` | POST | `margin/position/close` |  |
| `privateSpotPostSpotOrderCancel` | POST | `spot/order/cancel` |  |
| `privateSpotPostSpotOrderNew` | POST | `spot/order/new` |  |
| `privateSpotPostTransfer` | POST | `transfer` |  |
| `privateSpotPostWithdrawNew` | POST | `withdraw/new` |  |
| `privateSpotPostWithdrawCancel` | POST | `withdraw/cancel` |  |
| `privateSwapGetAccountBalance` | GET | `account/balance` |  |
| `privateSwapGetAccountPositions` | GET | `account/positions` |  |
| `privateSwapGetAccountFinanceRecord` | GET | `account/finance_record` |  |
| `privateSwapGetAccountTradingFeeRate` | GET | `account/trading_fee_rate` |  |
| `privateSwapGetAccountTransferRecord` | GET | `account/transfer_record` |  |
| `privateSwapGetAccountFundingFee` | GET | `account/funding_fee` |  |
| `privateSwapGetTradeHistoryOrders` | GET | `trade/history_orders` |  |
| `privateSwapGetTradeHistoryTrades` | GET | `trade/history_trades` |  |
| `privateSwapGetTradeOpenOrders` | GET | `trade/open_orders` |  |
| `privateSwapGetTradeOrderInfo` | GET | `trade/order_info` |  |
| `privateSwapPostAccountTransfer` | POST | `account/transfer` |  |
| `privateSwapPostAccountLeverage` | POST | `account/leverage` |  |
| `privateSwapPostAccountPositionMode` | POST | `account/position_mode` |  |
| `privateSwapPostAccountPositionMargin` | POST | `account/position_margin` |  |
| `privateSwapPostTradeBatchCancelOrder` | POST | `trade/batch_cancel_order` |  |
| `privateSwapPostTradeBatchOrder` | POST | `trade/batch_order` |  |
| `privateSwapPostTradeCancelOrder` | POST | `trade/cancel_order` |  |
| `privateSwapPostTradeOrderPlace` | POST | `trade/order_place` |  |
| `privateSwapPostFollowSponsorOrder` | POST | `follow/sponsor_order` |  |
| `privateSwapPostFollowCloseOrder` | POST | `follow/close_order` |  |
| `privateSwapPostFollowCancelOrder` | POST | `follow/cancel_order` |  |
| `privateSwapPostFollowUserCenterCurrent` | POST | `follow/user_center_current` |  |
| `privateSwapPostFollowUserCenterHistory` | POST | `follow/user_center_history` |  |
| `privateSwapPostFollowExpertCurrentOpenOrder` | POST | `follow/expert_current_open_order` |  |
| `privateSwapPostFollowAddAlgo` | POST | `follow/add_algo` |  |
| `privateSwapPostFollowCancelAlgo` | POST | `follow/cancel_algo` |  |
| `privateSwapPostFollowAccountAvailable` | POST | `follow/account_available` |  |
| `privateSwapPostFollowPlanTask` | POST | `follow/plan_task` |  |
| `privateSwapPostFollowInstrumentList` | POST | `follow/instrument_list` |  |

