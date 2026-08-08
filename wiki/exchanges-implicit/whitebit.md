Every endpoint in `whitebit`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/whitebit) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `webGetV1Healthcheck`); the snake_case alias (`web_get_v1_healthcheck`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`WebGetV1Healthcheck`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const whitebit = new ccxt.whitebit ();
const response = await whitebit.webGetV1Healthcheck (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const whitebit = new ccxt.whitebit ();
const response = await whitebit.webGetV1Healthcheck (params);
```

#### **Python**

```python
import ccxt
whitebit = ccxt.whitebit()
response = whitebit.web_get_v1_healthcheck(params)
```

#### **PHP**

```php
$whitebit = new \ccxt\whitebit();
$response = $whitebit->web_get_v1_healthcheck($params);
```

#### **C#**

```csharp
using ccxt;
var whitebit = new Whitebit();
var response = await whitebit.webGetV1Healthcheck(parameters);
```

#### **Go**

```go
whitebit := ccxt.NewWhitebit(nil)
response := <-whitebit.WebGetV1Healthcheck(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official whitebit API documentation:** [github.com](https://github.com/whitebit-exchange/api-docs)

> 111 implicit endpoints across 4 access groups.

## web

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `webGetV1Healthcheck` | GET | `v1/healthcheck` | 1 |

## v1

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v1PublicGetMarkets` | GET | `markets` | 1 |
| `v1PublicGetTickers` | GET | `tickers` | 1 |
| `v1PublicGetTicker` | GET | `ticker` | 1 |
| `v1PublicGetSymbols` | GET | `symbols` | 1 |
| `v1PublicGetDepthResult` | GET | `depth/result` | 1 |
| `v1PublicGetHistory` | GET | `history` | 1 |
| `v1PublicGetKline` | GET | `kline` | 1 |
| `v1PrivatePostAccountBalance` | POST | `account/balance` | 1 |
| `v1PrivatePostOrderNew` | POST | `order/new` | 1 |
| `v1PrivatePostOrderCancel` | POST | `order/cancel` | 1 |
| `v1PrivatePostOrders` | POST | `orders` | 1 |
| `v1PrivatePostAccountOrderHistory` | POST | `account/order_history` | 1 |
| `v1PrivatePostAccountExecutedHistory` | POST | `account/executed_history` | 1 |
| `v1PrivatePostAccountExecutedHistoryAll` | POST | `account/executed_history/all` | 1 |
| `v1PrivatePostAccountOrder` | POST | `account/order` | 1 |

## v2

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PublicGetMarkets` | GET | `markets` | 1 |
| `v2PublicGetTicker` | GET | `ticker` | 1 |
| `v2PublicGetAssets` | GET | `assets` | 1 |
| `v2PublicGetFee` | GET | `fee` | 1 |
| `v2PublicGetDepthMarket` | GET | `depth/{market}` | 1 |
| `v2PublicGetTradesMarket` | GET | `trades/{market}` | 1 |

## v4

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v4PublicGetAssets` | GET | `assets` | 1 |
| `v4PublicGetCollateralMarkets` | GET | `collateral/markets` | 1 |
| `v4PublicGetFee` | GET | `fee` | 1 |
| `v4PublicGetFundingHistoryMarket` | GET | `funding-history/{market}` | 1 |
| `v4PublicGetOrderbookDepthMarket` | GET | `orderbook/depth/{market}` | 1 |
| `v4PublicGetOrderbookMarket` | GET | `orderbook/{market}` | 1 |
| `v4PublicGetTicker` | GET | `ticker` | 1 |
| `v4PublicGetTradesMarket` | GET | `trades/{market}` | 1 |
| `v4PublicGetTime` | GET | `time` | 1 |
| `v4PublicGetPing` | GET | `ping` | 1 |
| `v4PublicGetMarkets` | GET | `markets` | 1 |
| `v4PublicGetFutures` | GET | `futures` | 1 |
| `v4PublicGetPlatformStatus` | GET | `platform/status` | 1 |
| `v4PublicGetMiningPool` | GET | `mining-pool` | 1 |
| `v4PrivatePostCollateralAccountBalance` | POST | `collateral-account/balance` | 1 |
| `v4PrivatePostCollateralAccountBalanceSummary` | POST | `collateral-account/balance-summary` | 1 |
| `v4PrivatePostCollateralAccountPositionsHistory` | POST | `collateral-account/positions/history` | 1 |
| `v4PrivatePostCollateralAccountLeverage` | POST | `collateral-account/leverage` | 1 |
| `v4PrivatePostCollateralAccountPositionsOpen` | POST | `collateral-account/positions/open` | 1 |
| `v4PrivatePostCollateralAccountSummary` | POST | `collateral-account/summary` | 1 |
| `v4PrivatePostCollateralAccountFundingHistory` | POST | `collateral-account/funding-history` | 1 |
| `v4PrivatePostMainAccountAddress` | POST | `main-account/address` | 1 |
| `v4PrivatePostMainAccountBalance` | POST | `main-account/balance` | 1 |
| `v4PrivatePostMainAccountCreateNewAddress` | POST | `main-account/create-new-address` | 1 |
| `v4PrivatePostMainAccountCodes` | POST | `main-account/codes` | 1 |
| `v4PrivatePostMainAccountCodesApply` | POST | `main-account/codes/apply` | 1 |
| `v4PrivatePostMainAccountCodesMy` | POST | `main-account/codes/my` | 1 |
| `v4PrivatePostMainAccountCodesHistory` | POST | `main-account/codes/history` | 1 |
| `v4PrivatePostMainAccountFiatDepositUrl` | POST | `main-account/fiat-deposit-url` | 1 |
| `v4PrivatePostMainAccountHistory` | POST | `main-account/history` | 1 |
| `v4PrivatePostMainAccountWithdraw` | POST | `main-account/withdraw` | 1 |
| `v4PrivatePostMainAccountWithdrawPay` | POST | `main-account/withdraw-pay` | 1 |
| `v4PrivatePostMainAccountTransfer` | POST | `main-account/transfer` | 1 |
| `v4PrivatePostMainAccountSmartPlans` | POST | `main-account/smart/plans` | 1 |
| `v4PrivatePostMainAccountSmartInvestment` | POST | `main-account/smart/investment` | 1 |
| `v4PrivatePostMainAccountSmartInvestmentClose` | POST | `main-account/smart/investment/close` | 1 |
| `v4PrivatePostMainAccountSmartInvestments` | POST | `main-account/smart/investments` | 1 |
| `v4PrivatePostMainAccountFee` | POST | `main-account/fee` | 1 |
| `v4PrivatePostMainAccountSmartInterestPaymentHistory` | POST | `main-account/smart/interest-payment-history` | 1 |
| `v4PrivatePostTradeAccountBalance` | POST | `trade-account/balance` | 1 |
| `v4PrivatePostTradeAccountExecutedHistory` | POST | `trade-account/executed-history` | 1 |
| `v4PrivatePostTradeAccountOrderHistory` | POST | `trade-account/order/history` | 1 |
| `v4PrivatePostTradeAccountOrder` | POST | `trade-account/order` | 1 |
| `v4PrivatePostOrderCollateralLimit` | POST | `order/collateral/limit` | 1 |
| `v4PrivatePostOrderCollateralMarket` | POST | `order/collateral/market` | 1 |
| `v4PrivatePostOrderCollateralStopLimit` | POST | `order/collateral/stop-limit` | 1 |
| `v4PrivatePostOrderCollateralTriggerMarket` | POST | `order/collateral/trigger-market` | 1 |
| `v4PrivatePostOrderCollateralBulk` | POST | `order/collateral/bulk` | 1 |
| `v4PrivatePostOrderNew` | POST | `order/new` | 1 |
| `v4PrivatePostOrderMarket` | POST | `order/market` | 1 |
| `v4PrivatePostOrderStockMarket` | POST | `order/stock_market` | 1 |
| `v4PrivatePostOrderStopLimit` | POST | `order/stop_limit` | 1 |
| `v4PrivatePostOrderStopMarket` | POST | `order/stop_market` | 1 |
| `v4PrivatePostOrderCancel` | POST | `order/cancel` | 1 |
| `v4PrivatePostOrderCancelAll` | POST | `order/cancel/all` | 1 |
| `v4PrivatePostOrderKillSwitch` | POST | `order/kill-switch` | 1 |
| `v4PrivatePostOrderKillSwitchStatus` | POST | `order/kill-switch/status` | 1 |
| `v4PrivatePostOrderBulk` | POST | `order/bulk` | 1 |
| `v4PrivatePostOrderModify` | POST | `order/modify` | 1 |
| `v4PrivatePostOrderConditionalCancel` | POST | `order/conditional-cancel` | 1 |
| `v4PrivatePostOrders` | POST | `orders` | 1 |
| `v4PrivatePostOcoOrders` | POST | `oco-orders` | 1 |
| `v4PrivatePostOrderCollateralOco` | POST | `order/collateral/oco` | 1 |
| `v4PrivatePostOrderOcoCancel` | POST | `order/oco-cancel` | 1 |
| `v4PrivatePostOrderOtoCancel` | POST | `order/oto-cancel` | 1 |
| `v4PrivatePostProfileWebsocketToken` | POST | `profile/websocket_token` | 1 |
| `v4PrivatePostConvertEstimate` | POST | `convert/estimate` | 1 |
| `v4PrivatePostConvertConfirm` | POST | `convert/confirm` | 1 |
| `v4PrivatePostConvertHistory` | POST | `convert/history` | 1 |
| `v4PrivatePostSubAccountCreate` | POST | `sub-account/create` | 1 |
| `v4PrivatePostSubAccountDelete` | POST | `sub-account/delete` | 1 |
| `v4PrivatePostSubAccountEdit` | POST | `sub-account/edit` | 1 |
| `v4PrivatePostSubAccountList` | POST | `sub-account/list` | 1 |
| `v4PrivatePostSubAccountTransfer` | POST | `sub-account/transfer` | 1 |
| `v4PrivatePostSubAccountBlock` | POST | `sub-account/block` | 1 |
| `v4PrivatePostSubAccountUnblock` | POST | `sub-account/unblock` | 1 |
| `v4PrivatePostSubAccountBalances` | POST | `sub-account/balances` | 1 |
| `v4PrivatePostSubAccountTransferHistory` | POST | `sub-account/transfer/history` | 1 |
| `v4PrivatePostSubAccountApiKeyCreate` | POST | `sub-account/api-key/create` | 1 |
| `v4PrivatePostSubAccountApiKeyEdit` | POST | `sub-account/api-key/edit` | 1 |
| `v4PrivatePostSubAccountApiKeyDelete` | POST | `sub-account/api-key/delete` | 1 |
| `v4PrivatePostSubAccountApiKeyList` | POST | `sub-account/api-key/list` | 1 |
| `v4PrivatePostSubAccountApiKeyReset` | POST | `sub-account/api-key/reset` | 1 |
| `v4PrivatePostSubAccountApiKeyIpAddressList` | POST | `sub-account/api-key/ip-address/list` | 1 |
| `v4PrivatePostSubAccountApiKeyIpAddressCreate` | POST | `sub-account/api-key/ip-address/create` | 1 |
| `v4PrivatePostSubAccountApiKeyIpAddressDelete` | POST | `sub-account/api-key/ip-address/delete` | 1 |
| `v4PrivatePostMiningRewards` | POST | `mining/rewards` | 1 |
| `v4PrivatePostMarketFee` | POST | `market/fee` | 1 |
| `v4PrivatePostConditionalOrders` | POST | `conditional-orders` | 1 |

