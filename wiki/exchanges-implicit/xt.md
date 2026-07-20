Every endpoint in `xt`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/xt) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicSpotGetCurrencies`); the snake_case alias (`public_spot_get_currencies`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicSpotGetCurrencies`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const xt = new ccxt.xt ();
const response = await xt.publicSpotGetCurrencies (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const xt = new ccxt.xt ();
const response = await xt.publicSpotGetCurrencies (params);
```

#### **Python**

```python
import ccxt
xt = ccxt.xt()
response = xt.public_spot_get_currencies(params)
```

#### **PHP**

```php
$xt = new \ccxt\xt();
$response = $xt->public_spot_get_currencies($params);
```

#### **C#**

```csharp
using ccxt;
var xt = new Xt();
var response = await xt.publicSpotGetCurrencies(parameters);
```

#### **Go**

```go
xt := ccxt.NewXt(nil)
response := <-xt.PublicSpotGetCurrencies(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official xt API documentation:** [doc.xt.com](https://doc.xt.com/) · [github.com](https://github.com/xtpub/api-doc)

> 153 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicSpotGetCurrencies` | GET | `currencies` | 1 |
| `publicSpotGetDepth` | GET | `depth` | 10 |
| `publicSpotGetKline` | GET | `kline` | 1 |
| `publicSpotGetSymbol` | GET | `symbol` | 1 |
| `publicSpotGetTicker` | GET | `ticker` | 1 |
| `publicSpotGetTickerBook` | GET | `ticker/book` | 1 |
| `publicSpotGetTickerPrice` | GET | `ticker/price` | 1 |
| `publicSpotGetTicker24h` | GET | `ticker/24h` | 1 |
| `publicSpotGetTime` | GET | `time` | 1 |
| `publicSpotGetTradeHistory` | GET | `trade/history` | 1 |
| `publicSpotGetTradeRecent` | GET | `trade/recent` | 1 |
| `publicSpotGetWalletSupportCurrency` | GET | `wallet/support/currency` | 1 |
| `publicLinearGetFutureMarketV1PublicContractRiskBalance` | GET | `future/market/v1/public/contract/risk-balance` | 1 |
| `publicLinearGetFutureMarketV1PublicContractOpenInterest` | GET | `future/market/v1/public/contract/open-interest` | 1 |
| `publicLinearGetFutureMarketV1PublicLeverageBracketDetail` | GET | `future/market/v1/public/leverage/bracket/detail` | 1 |
| `publicLinearGetFutureMarketV1PublicLeverageBracketList` | GET | `future/market/v1/public/leverage/bracket/list` | 1 |
| `publicLinearGetFutureMarketV1PublicQAggTicker` | GET | `future/market/v1/public/q/agg-ticker` | 1 |
| `publicLinearGetFutureMarketV1PublicQAggTickers` | GET | `future/market/v1/public/q/agg-tickers` | 1 |
| `publicLinearGetFutureMarketV1PublicQDeal` | GET | `future/market/v1/public/q/deal` | 1 |
| `publicLinearGetFutureMarketV1PublicQDepth` | GET | `future/market/v1/public/q/depth` | 1 |
| `publicLinearGetFutureMarketV1PublicQFundingRate` | GET | `future/market/v1/public/q/funding-rate` | 1 |
| `publicLinearGetFutureMarketV1PublicQFundingRateRecord` | GET | `future/market/v1/public/q/funding-rate-record` | 1 |
| `publicLinearGetFutureMarketV1PublicQIndexPrice` | GET | `future/market/v1/public/q/index-price` | 1 |
| `publicLinearGetFutureMarketV1PublicQKline` | GET | `future/market/v1/public/q/kline` | 1 |
| `publicLinearGetFutureMarketV1PublicQMarkPrice` | GET | `future/market/v1/public/q/mark-price` | 1 |
| `publicLinearGetFutureMarketV1PublicQSymbolIndexPrice` | GET | `future/market/v1/public/q/symbol-index-price` | 1 |
| `publicLinearGetFutureMarketV1PublicQSymbolMarkPrice` | GET | `future/market/v1/public/q/symbol-mark-price` | 1 |
| `publicLinearGetFutureMarketV1PublicQTicker` | GET | `future/market/v1/public/q/ticker` | 1 |
| `publicLinearGetFutureMarketV1PublicQTickers` | GET | `future/market/v1/public/q/tickers` | 1 |
| `publicLinearGetFutureMarketV1PublicSymbolCoins` | GET | `future/market/v1/public/symbol/coins` | 3.33 |
| `publicLinearGetFutureMarketV1PublicSymbolDetail` | GET | `future/market/v1/public/symbol/detail` | 3.33 |
| `publicLinearGetFutureMarketV1PublicSymbolList` | GET | `future/market/v1/public/symbol/list` | 1 |
| `publicInverseGetFutureMarketV1PublicContractRiskBalance` | GET | `future/market/v1/public/contract/risk-balance` | 1 |
| `publicInverseGetFutureMarketV1PublicContractOpenInterest` | GET | `future/market/v1/public/contract/open-interest` | 1 |
| `publicInverseGetFutureMarketV1PublicLeverageBracketDetail` | GET | `future/market/v1/public/leverage/bracket/detail` | 1 |
| `publicInverseGetFutureMarketV1PublicLeverageBracketList` | GET | `future/market/v1/public/leverage/bracket/list` | 1 |
| `publicInverseGetFutureMarketV1PublicQAggTicker` | GET | `future/market/v1/public/q/agg-ticker` | 1 |
| `publicInverseGetFutureMarketV1PublicQAggTickers` | GET | `future/market/v1/public/q/agg-tickers` | 1 |
| `publicInverseGetFutureMarketV1PublicQDeal` | GET | `future/market/v1/public/q/deal` | 1 |
| `publicInverseGetFutureMarketV1PublicQDepth` | GET | `future/market/v1/public/q/depth` | 1 |
| `publicInverseGetFutureMarketV1PublicQFundingRate` | GET | `future/market/v1/public/q/funding-rate` | 1 |
| `publicInverseGetFutureMarketV1PublicQFundingRateRecord` | GET | `future/market/v1/public/q/funding-rate-record` | 1 |
| `publicInverseGetFutureMarketV1PublicQIndexPrice` | GET | `future/market/v1/public/q/index-price` | 1 |
| `publicInverseGetFutureMarketV1PublicQKline` | GET | `future/market/v1/public/q/kline` | 1 |
| `publicInverseGetFutureMarketV1PublicQMarkPrice` | GET | `future/market/v1/public/q/mark-price` | 1 |
| `publicInverseGetFutureMarketV1PublicQSymbolIndexPrice` | GET | `future/market/v1/public/q/symbol-index-price` | 1 |
| `publicInverseGetFutureMarketV1PublicQSymbolMarkPrice` | GET | `future/market/v1/public/q/symbol-mark-price` | 1 |
| `publicInverseGetFutureMarketV1PublicQTicker` | GET | `future/market/v1/public/q/ticker` | 1 |
| `publicInverseGetFutureMarketV1PublicQTickers` | GET | `future/market/v1/public/q/tickers` | 1 |
| `publicInverseGetFutureMarketV1PublicSymbolCoins` | GET | `future/market/v1/public/symbol/coins` | 3.33 |
| `publicInverseGetFutureMarketV1PublicSymbolDetail` | GET | `future/market/v1/public/symbol/detail` | 3.33 |
| `publicInverseGetFutureMarketV1PublicSymbolList` | GET | `future/market/v1/public/symbol/list` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateSpotGetBalance` | GET | `balance` | 1 |
| `privateSpotGetBalances` | GET | `balances` | 1 |
| `privateSpotGetBatchOrder` | GET | `batch-order` | 1 |
| `privateSpotGetDepositAddress` | GET | `deposit/address` | 1 |
| `privateSpotGetDepositHistory` | GET | `deposit/history` | 1 |
| `privateSpotGetHistoryOrder` | GET | `history-order` | 1 |
| `privateSpotGetOpenOrder` | GET | `open-order` | 1 |
| `privateSpotGetOrder` | GET | `order` | 1 |
| `privateSpotGetOrderOrderId` | GET | `order/{orderId}` | 1 |
| `privateSpotGetTrade` | GET | `trade` | 1 |
| `privateSpotGetWithdrawHistory` | GET | `withdraw/history` | 1 |
| `privateSpotPostOrder` | POST | `order` | 0.2 |
| `privateSpotPostWithdraw` | POST | `withdraw` | 10 |
| `privateSpotPostBalanceTransfer` | POST | `balance/transfer` | 1 |
| `privateSpotPostBalanceAccountTransfer` | POST | `balance/account/transfer` | 1 |
| `privateSpotPostWsToken` | POST | `ws-token` | 1 |
| `privateSpotDeleteBatchOrder` | DELETE | `batch-order` | 1 |
| `privateSpotDeleteOpenOrder` | DELETE | `open-order` | 1 |
| `privateSpotDeleteOrderOrderId` | DELETE | `order/{orderId}` | 1 |
| `privateSpotPutOrderOrderId` | PUT | `order/{orderId}` | 1 |
| `privateLinearGetFutureTradeV1EntrustPlanDetail` | GET | `future/trade/v1/entrust/plan-detail` | 1 |
| `privateLinearGetFutureTradeV1EntrustPlanList` | GET | `future/trade/v1/entrust/plan-list` | 1 |
| `privateLinearGetFutureTradeV1EntrustPlanListHistory` | GET | `future/trade/v1/entrust/plan-list-history` | 1 |
| `privateLinearGetFutureTradeV1EntrustProfitDetail` | GET | `future/trade/v1/entrust/profit-detail` | 1 |
| `privateLinearGetFutureTradeV1EntrustProfitList` | GET | `future/trade/v1/entrust/profit-list` | 1 |
| `privateLinearGetFutureTradeV1OrderDetail` | GET | `future/trade/v1/order/detail` | 1 |
| `privateLinearGetFutureTradeV1OrderList` | GET | `future/trade/v1/order/list` | 1 |
| `privateLinearGetFutureTradeV1OrderListHistory` | GET | `future/trade/v1/order/list-history` | 1 |
| `privateLinearGetFutureTradeV1OrderTradeList` | GET | `future/trade/v1/order/trade-list` | 1 |
| `privateLinearGetFutureUserV1AccountInfo` | GET | `future/user/v1/account/info` | 1 |
| `privateLinearGetFutureUserV1BalanceBills` | GET | `future/user/v1/balance/bills` | 1 |
| `privateLinearGetFutureUserV1BalanceDetail` | GET | `future/user/v1/balance/detail` | 1 |
| `privateLinearGetFutureUserV1BalanceFundingRateList` | GET | `future/user/v1/balance/funding-rate-list` | 1 |
| `privateLinearGetFutureUserV1BalanceList` | GET | `future/user/v1/balance/list` | 1 |
| `privateLinearGetFutureUserV1PositionAdl` | GET | `future/user/v1/position/adl` | 1 |
| `privateLinearGetFutureUserV1PositionList` | GET | `future/user/v1/position/list` | 1 |
| `privateLinearGetFutureUserV1UserCollectionList` | GET | `future/user/v1/user/collection/list` | 1 |
| `privateLinearGetFutureUserV1UserListenKey` | GET | `future/user/v1/user/listen-key` | 1 |
| `privateLinearPostFutureTradeV1EntrustCancelAllPlan` | POST | `future/trade/v1/entrust/cancel-all-plan` | 1 |
| `privateLinearPostFutureTradeV1EntrustCancelAllProfitStop` | POST | `future/trade/v1/entrust/cancel-all-profit-stop` | 1 |
| `privateLinearPostFutureTradeV1EntrustCancelPlan` | POST | `future/trade/v1/entrust/cancel-plan` | 1 |
| `privateLinearPostFutureTradeV1EntrustCancelProfitStop` | POST | `future/trade/v1/entrust/cancel-profit-stop` | 1 |
| `privateLinearPostFutureTradeV1EntrustCreatePlan` | POST | `future/trade/v1/entrust/create-plan` | 1 |
| `privateLinearPostFutureTradeV1EntrustCreateProfit` | POST | `future/trade/v1/entrust/create-profit` | 1 |
| `privateLinearPostFutureTradeV1EntrustUpdateProfitStop` | POST | `future/trade/v1/entrust/update-profit-stop` | 1 |
| `privateLinearPostFutureTradeV1OrderCancel` | POST | `future/trade/v1/order/cancel` | 1 |
| `privateLinearPostFutureTradeV1OrderCancelAll` | POST | `future/trade/v1/order/cancel-all` | 1 |
| `privateLinearPostFutureTradeV1OrderCreate` | POST | `future/trade/v1/order/create` | 1 |
| `privateLinearPostFutureTradeV1OrderCreateBatch` | POST | `future/trade/v1/order/create-batch` | 1 |
| `privateLinearPostFutureTradeV1OrderUpdate` | POST | `future/trade/v1/order/update` | 1 |
| `privateLinearPostFutureUserV1AccountOpen` | POST | `future/user/v1/account/open` | 1 |
| `privateLinearPostFutureUserV1PositionAdjustLeverage` | POST | `future/user/v1/position/adjust-leverage` | 1 |
| `privateLinearPostFutureUserV1PositionAutoMargin` | POST | `future/user/v1/position/auto-margin` | 1 |
| `privateLinearPostFutureUserV1PositionCloseAll` | POST | `future/user/v1/position/close-all` | 1 |
| `privateLinearPostFutureUserV1PositionMargin` | POST | `future/user/v1/position/margin` | 1 |
| `privateLinearPostFutureUserV1UserCollectionAdd` | POST | `future/user/v1/user/collection/add` | 1 |
| `privateLinearPostFutureUserV1UserCollectionCancel` | POST | `future/user/v1/user/collection/cancel` | 1 |
| `privateLinearPostFutureUserV1PositionChangeType` | POST | `future/user/v1/position/change-type` | 1 |
| `privateInverseGetFutureTradeV1EntrustPlanDetail` | GET | `future/trade/v1/entrust/plan-detail` | 1 |
| `privateInverseGetFutureTradeV1EntrustPlanList` | GET | `future/trade/v1/entrust/plan-list` | 1 |
| `privateInverseGetFutureTradeV1EntrustPlanListHistory` | GET | `future/trade/v1/entrust/plan-list-history` | 1 |
| `privateInverseGetFutureTradeV1EntrustProfitDetail` | GET | `future/trade/v1/entrust/profit-detail` | 1 |
| `privateInverseGetFutureTradeV1EntrustProfitList` | GET | `future/trade/v1/entrust/profit-list` | 1 |
| `privateInverseGetFutureTradeV1OrderDetail` | GET | `future/trade/v1/order/detail` | 1 |
| `privateInverseGetFutureTradeV1OrderList` | GET | `future/trade/v1/order/list` | 1 |
| `privateInverseGetFutureTradeV1OrderListHistory` | GET | `future/trade/v1/order/list-history` | 1 |
| `privateInverseGetFutureTradeV1OrderTradeList` | GET | `future/trade/v1/order/trade-list` | 1 |
| `privateInverseGetFutureUserV1AccountInfo` | GET | `future/user/v1/account/info` | 1 |
| `privateInverseGetFutureUserV1BalanceBills` | GET | `future/user/v1/balance/bills` | 1 |
| `privateInverseGetFutureUserV1BalanceDetail` | GET | `future/user/v1/balance/detail` | 1 |
| `privateInverseGetFutureUserV1BalanceFundingRateList` | GET | `future/user/v1/balance/funding-rate-list` | 1 |
| `privateInverseGetFutureUserV1BalanceList` | GET | `future/user/v1/balance/list` | 1 |
| `privateInverseGetFutureUserV1PositionAdl` | GET | `future/user/v1/position/adl` | 1 |
| `privateInverseGetFutureUserV1PositionList` | GET | `future/user/v1/position/list` | 1 |
| `privateInverseGetFutureUserV1UserCollectionList` | GET | `future/user/v1/user/collection/list` | 1 |
| `privateInverseGetFutureUserV1UserListenKey` | GET | `future/user/v1/user/listen-key` | 1 |
| `privateInversePostFutureTradeV1EntrustCancelAllPlan` | POST | `future/trade/v1/entrust/cancel-all-plan` | 1 |
| `privateInversePostFutureTradeV1EntrustCancelAllProfitStop` | POST | `future/trade/v1/entrust/cancel-all-profit-stop` | 1 |
| `privateInversePostFutureTradeV1EntrustCancelPlan` | POST | `future/trade/v1/entrust/cancel-plan` | 1 |
| `privateInversePostFutureTradeV1EntrustCancelProfitStop` | POST | `future/trade/v1/entrust/cancel-profit-stop` | 1 |
| `privateInversePostFutureTradeV1EntrustCreatePlan` | POST | `future/trade/v1/entrust/create-plan` | 1 |
| `privateInversePostFutureTradeV1EntrustCreateProfit` | POST | `future/trade/v1/entrust/create-profit` | 1 |
| `privateInversePostFutureTradeV1EntrustUpdateProfitStop` | POST | `future/trade/v1/entrust/update-profit-stop` | 1 |
| `privateInversePostFutureTradeV1OrderCancel` | POST | `future/trade/v1/order/cancel` | 1 |
| `privateInversePostFutureTradeV1OrderCancelAll` | POST | `future/trade/v1/order/cancel-all` | 1 |
| `privateInversePostFutureTradeV1OrderCreate` | POST | `future/trade/v1/order/create` | 1 |
| `privateInversePostFutureTradeV1OrderCreateBatch` | POST | `future/trade/v1/order/create-batch` | 1 |
| `privateInversePostFutureTradeV1OrderUpdate` | POST | `future/trade/v1/order/update` | 1 |
| `privateInversePostFutureUserV1AccountOpen` | POST | `future/user/v1/account/open` | 1 |
| `privateInversePostFutureUserV1PositionAdjustLeverage` | POST | `future/user/v1/position/adjust-leverage` | 1 |
| `privateInversePostFutureUserV1PositionAutoMargin` | POST | `future/user/v1/position/auto-margin` | 1 |
| `privateInversePostFutureUserV1PositionCloseAll` | POST | `future/user/v1/position/close-all` | 1 |
| `privateInversePostFutureUserV1PositionMargin` | POST | `future/user/v1/position/margin` | 1 |
| `privateInversePostFutureUserV1UserCollectionAdd` | POST | `future/user/v1/user/collection/add` | 1 |
| `privateInversePostFutureUserV1UserCollectionCancel` | POST | `future/user/v1/user/collection/cancel` | 1 |
| `privateUserGetUserAccount` | GET | `user/account` | 1 |
| `privateUserGetUserAccountApiKey` | GET | `user/account/api-key` | 1 |
| `privateUserPostUserAccount` | POST | `user/account` | 1 |
| `privateUserPostUserAccountApiKey` | POST | `user/account/api-key` | 1 |
| `privateUserPutUserAccountApiKey` | PUT | `user/account/api-key` | 1 |
| `privateUserDeleteUserAccountApiKeyId` | DELETE | `user/account/{apiKeyId}` | 1 |

