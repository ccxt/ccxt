Every endpoint in `whitebit`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/whitebit) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `webGetV1Healthcheck`); the snake_case alias (`web_get_v1_healthcheck`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`WebGetV1Healthcheck`). Switch tabs for the call in each language:

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
| `webGetV1Healthcheck` | GET | `v1/healthcheck` |  |

## v1

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v1PublicGetMarkets` | GET | `markets` |  |
| `v1PublicGetTickers` | GET | `tickers` |  |
| `v1PublicGetTicker` | GET | `ticker` |  |
| `v1PublicGetSymbols` | GET | `symbols` |  |
| `v1PublicGetDepthResult` | GET | `depth/result` |  |
| `v1PublicGetHistory` | GET | `history` |  |
| `v1PublicGetKline` | GET | `kline` |  |
| `v1PrivatePostAccountBalance` | POST | `account/balance` |  |
| `v1PrivatePostOrderNew` | POST | `order/new` |  |
| `v1PrivatePostOrderCancel` | POST | `order/cancel` |  |
| `v1PrivatePostOrders` | POST | `orders` |  |
| `v1PrivatePostAccountOrderHistory` | POST | `account/order_history` |  |
| `v1PrivatePostAccountExecutedHistory` | POST | `account/executed_history` |  |
| `v1PrivatePostAccountExecutedHistoryAll` | POST | `account/executed_history/all` |  |
| `v1PrivatePostAccountOrder` | POST | `account/order` |  |

## v2

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PublicGetMarkets` | GET | `markets` |  |
| `v2PublicGetTicker` | GET | `ticker` |  |
| `v2PublicGetAssets` | GET | `assets` |  |
| `v2PublicGetFee` | GET | `fee` |  |
| `v2PublicGetDepthMarket` | GET | `depth/{market}` |  |
| `v2PublicGetTradesMarket` | GET | `trades/{market}` |  |

## v4

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v4PublicGetAssets` | GET | `assets` |  |
| `v4PublicGetCollateralMarkets` | GET | `collateral/markets` |  |
| `v4PublicGetFee` | GET | `fee` |  |
| `v4PublicGetFundingHistoryMarket` | GET | `funding-history/{market}` |  |
| `v4PublicGetOrderbookDepthMarket` | GET | `orderbook/depth/{market}` |  |
| `v4PublicGetOrderbookMarket` | GET | `orderbook/{market}` |  |
| `v4PublicGetTicker` | GET | `ticker` |  |
| `v4PublicGetTradesMarket` | GET | `trades/{market}` |  |
| `v4PublicGetTime` | GET | `time` |  |
| `v4PublicGetPing` | GET | `ping` |  |
| `v4PublicGetMarkets` | GET | `markets` |  |
| `v4PublicGetFutures` | GET | `futures` |  |
| `v4PublicGetPlatformStatus` | GET | `platform/status` |  |
| `v4PublicGetMiningPool` | GET | `mining-pool` |  |
| `v4PrivatePostCollateralAccountBalance` | POST | `collateral-account/balance` |  |
| `v4PrivatePostCollateralAccountBalanceSummary` | POST | `collateral-account/balance-summary` |  |
| `v4PrivatePostCollateralAccountPositionsHistory` | POST | `collateral-account/positions/history` |  |
| `v4PrivatePostCollateralAccountLeverage` | POST | `collateral-account/leverage` |  |
| `v4PrivatePostCollateralAccountPositionsOpen` | POST | `collateral-account/positions/open` |  |
| `v4PrivatePostCollateralAccountSummary` | POST | `collateral-account/summary` |  |
| `v4PrivatePostCollateralAccountFundingHistory` | POST | `collateral-account/funding-history` |  |
| `v4PrivatePostMainAccountAddress` | POST | `main-account/address` |  |
| `v4PrivatePostMainAccountBalance` | POST | `main-account/balance` |  |
| `v4PrivatePostMainAccountCreateNewAddress` | POST | `main-account/create-new-address` |  |
| `v4PrivatePostMainAccountCodes` | POST | `main-account/codes` |  |
| `v4PrivatePostMainAccountCodesApply` | POST | `main-account/codes/apply` |  |
| `v4PrivatePostMainAccountCodesMy` | POST | `main-account/codes/my` |  |
| `v4PrivatePostMainAccountCodesHistory` | POST | `main-account/codes/history` |  |
| `v4PrivatePostMainAccountFiatDepositUrl` | POST | `main-account/fiat-deposit-url` |  |
| `v4PrivatePostMainAccountHistory` | POST | `main-account/history` |  |
| `v4PrivatePostMainAccountWithdraw` | POST | `main-account/withdraw` |  |
| `v4PrivatePostMainAccountWithdrawPay` | POST | `main-account/withdraw-pay` |  |
| `v4PrivatePostMainAccountTransfer` | POST | `main-account/transfer` |  |
| `v4PrivatePostMainAccountSmartPlans` | POST | `main-account/smart/plans` |  |
| `v4PrivatePostMainAccountSmartInvestment` | POST | `main-account/smart/investment` |  |
| `v4PrivatePostMainAccountSmartInvestmentClose` | POST | `main-account/smart/investment/close` |  |
| `v4PrivatePostMainAccountSmartInvestments` | POST | `main-account/smart/investments` |  |
| `v4PrivatePostMainAccountFee` | POST | `main-account/fee` |  |
| `v4PrivatePostMainAccountSmartInterestPaymentHistory` | POST | `main-account/smart/interest-payment-history` |  |
| `v4PrivatePostTradeAccountBalance` | POST | `trade-account/balance` |  |
| `v4PrivatePostTradeAccountExecutedHistory` | POST | `trade-account/executed-history` |  |
| `v4PrivatePostTradeAccountOrderHistory` | POST | `trade-account/order/history` |  |
| `v4PrivatePostTradeAccountOrder` | POST | `trade-account/order` |  |
| `v4PrivatePostOrderCollateralLimit` | POST | `order/collateral/limit` |  |
| `v4PrivatePostOrderCollateralMarket` | POST | `order/collateral/market` |  |
| `v4PrivatePostOrderCollateralStopLimit` | POST | `order/collateral/stop-limit` |  |
| `v4PrivatePostOrderCollateralTriggerMarket` | POST | `order/collateral/trigger-market` |  |
| `v4PrivatePostOrderCollateralBulk` | POST | `order/collateral/bulk` |  |
| `v4PrivatePostOrderNew` | POST | `order/new` |  |
| `v4PrivatePostOrderMarket` | POST | `order/market` |  |
| `v4PrivatePostOrderStockMarket` | POST | `order/stock_market` |  |
| `v4PrivatePostOrderStopLimit` | POST | `order/stop_limit` |  |
| `v4PrivatePostOrderStopMarket` | POST | `order/stop_market` |  |
| `v4PrivatePostOrderCancel` | POST | `order/cancel` |  |
| `v4PrivatePostOrderCancelAll` | POST | `order/cancel/all` |  |
| `v4PrivatePostOrderKillSwitch` | POST | `order/kill-switch` |  |
| `v4PrivatePostOrderKillSwitchStatus` | POST | `order/kill-switch/status` |  |
| `v4PrivatePostOrderBulk` | POST | `order/bulk` |  |
| `v4PrivatePostOrderModify` | POST | `order/modify` |  |
| `v4PrivatePostOrderConditionalCancel` | POST | `order/conditional-cancel` |  |
| `v4PrivatePostOrders` | POST | `orders` |  |
| `v4PrivatePostOcoOrders` | POST | `oco-orders` |  |
| `v4PrivatePostOrderCollateralOco` | POST | `order/collateral/oco` |  |
| `v4PrivatePostOrderOcoCancel` | POST | `order/oco-cancel` |  |
| `v4PrivatePostOrderOtoCancel` | POST | `order/oto-cancel` |  |
| `v4PrivatePostProfileWebsocketToken` | POST | `profile/websocket_token` |  |
| `v4PrivatePostConvertEstimate` | POST | `convert/estimate` |  |
| `v4PrivatePostConvertConfirm` | POST | `convert/confirm` |  |
| `v4PrivatePostConvertHistory` | POST | `convert/history` |  |
| `v4PrivatePostSubAccountCreate` | POST | `sub-account/create` |  |
| `v4PrivatePostSubAccountDelete` | POST | `sub-account/delete` |  |
| `v4PrivatePostSubAccountEdit` | POST | `sub-account/edit` |  |
| `v4PrivatePostSubAccountList` | POST | `sub-account/list` |  |
| `v4PrivatePostSubAccountTransfer` | POST | `sub-account/transfer` |  |
| `v4PrivatePostSubAccountBlock` | POST | `sub-account/block` |  |
| `v4PrivatePostSubAccountUnblock` | POST | `sub-account/unblock` |  |
| `v4PrivatePostSubAccountBalances` | POST | `sub-account/balances` |  |
| `v4PrivatePostSubAccountTransferHistory` | POST | `sub-account/transfer/history` |  |
| `v4PrivatePostSubAccountApiKeyCreate` | POST | `sub-account/api-key/create` |  |
| `v4PrivatePostSubAccountApiKeyEdit` | POST | `sub-account/api-key/edit` |  |
| `v4PrivatePostSubAccountApiKeyDelete` | POST | `sub-account/api-key/delete` |  |
| `v4PrivatePostSubAccountApiKeyList` | POST | `sub-account/api-key/list` |  |
| `v4PrivatePostSubAccountApiKeyReset` | POST | `sub-account/api-key/reset` |  |
| `v4PrivatePostSubAccountApiKeyIpAddressList` | POST | `sub-account/api-key/ip-address/list` |  |
| `v4PrivatePostSubAccountApiKeyIpAddressCreate` | POST | `sub-account/api-key/ip-address/create` |  |
| `v4PrivatePostSubAccountApiKeyIpAddressDelete` | POST | `sub-account/api-key/ip-address/delete` |  |
| `v4PrivatePostMiningRewards` | POST | `mining/rewards` |  |
| `v4PrivatePostMarketFee` | POST | `market/fee` |  |
| `v4PrivatePostConditionalOrders` | POST | `conditional-orders` |  |

