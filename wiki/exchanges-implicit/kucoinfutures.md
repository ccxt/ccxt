Every endpoint in `kucoinfutures`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/kucoinfutures) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetCurrencies`); the snake_case alias (`public_get_currencies`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetCurrencies`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const kucoinfutures = new ccxt.kucoinfutures ();
const response = await kucoinfutures.publicGetCurrencies (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const kucoinfutures = new ccxt.kucoinfutures ();
const response = await kucoinfutures.publicGetCurrencies (params);
```

#### **Python**

```python
import ccxt
kucoinfutures = ccxt.kucoinfutures()
response = kucoinfutures.public_get_currencies(params)
```

#### **PHP**

```php
$kucoinfutures = new \ccxt\kucoinfutures();
$response = $kucoinfutures->public_get_currencies($params);
```

#### **C#**

```csharp
using ccxt;
var kucoinfutures = new Kucoinfutures();
var response = await kucoinfutures.publicGetCurrencies(parameters);
```

#### **Go**

```go
kucoinfutures := ccxt.NewKucoinfutures(nil)
response := <-kucoinfutures.PublicGetCurrencies(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official kucoinfutures API documentation:** [docs.kucoin.com](https://docs.kucoin.com)

> 351 implicit endpoints across 9 access groups.

## public

**Base URL**: `https://api.kucoin.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetCurrencies` | GET | `currencies` | 3 |
| `publicGetCurrenciesCurrency` | GET | `currencies/{currency}` | 3 |
| `publicGetSymbols` | GET | `symbols` | 4 |
| `publicGetMarketOrderbookLevel1` | GET | `market/orderbook/level1` | 2 |
| `publicGetMarketAllTickers` | GET | `market/allTickers` | 15 |
| `publicGetMarketStats` | GET | `market/stats` | 15 |
| `publicGetMarkets` | GET | `markets` | 3 |
| `publicGetMarketOrderbookLevelLevelLimit` | GET | `market/orderbook/level{level}_{limit}` | 4 |
| `publicGetMarketOrderbookLevel220` | GET | `market/orderbook/level2_20` | 2 |
| `publicGetMarketOrderbookLevel2100` | GET | `market/orderbook/level2_100` | 4 |
| `publicGetMarketHistories` | GET | `market/histories` | 3 |
| `publicGetMarketCandles` | GET | `market/candles` | 3 |
| `publicGetPrices` | GET | `prices` | 3 |
| `publicGetTimestamp` | GET | `timestamp` | 3 |
| `publicGetStatus` | GET | `status` | 3 |
| `publicGetMarkPriceSymbolCurrent` | GET | `mark-price/{symbol}/current` | 2 |
| `publicGetMarkPriceAllSymbols` | GET | `mark-price/all-symbols` | 10 |
| `publicGetMarginConfig` | GET | `margin/config` | 25 |
| `publicGetAnnouncements` | GET | `announcements` | 20 |
| `publicGetMarginCollateralRatio` | GET | `margin/collateralRatio` | 10 |
| `publicGetConvertSymbol` | GET | `convert/symbol` | 5 |
| `publicGetConvertCurrencies` | GET | `convert/currencies` | 5 |
| `publicPostBulletPublic` | POST | `bullet-public` | 10 |

## private

**Base URL**: `https://api.kucoin.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetUserInfo` | GET | `user-info` | 20 |
| `privateGetUserApiKey` | GET | `user/api-key` | 20 |
| `privateGetAccounts` | GET | `accounts` | 5 |
| `privateGetAccountsAccountId` | GET | `accounts/{accountId}` | 5 |
| `privateGetAccountsLedgers` | GET | `accounts/ledgers` | 2 |
| `privateGetHfAccountsLedgers` | GET | `hf/accounts/ledgers` | 2 |
| `privateGetHfMarginAccountLedgers` | GET | `hf/margin/account/ledgers` | 2 |
| `privateGetTransactionHistory` | GET | `transaction-history` | 2 |
| `privateGetSubUser` | GET | `sub/user` | 20 |
| `privateGetSubAccountsSubUserId` | GET | `sub-accounts/{subUserId}` | 15 |
| `privateGetSubAccounts` | GET | `sub-accounts` | 20 |
| `privateGetSubApiKey` | GET | `sub/api-key` | 20 |
| `privateGetMarginAccount` | GET | `margin/account` | 40 |
| `privateGetMarginAccounts` | GET | `margin/accounts` | 15 |
| `privateGetIsolatedAccounts` | GET | `isolated/accounts` | 15 |
| `privateGetDepositAddresses` | GET | `deposit-addresses` | 5 |
| `privateGetDeposits` | GET | `deposits` | 5 |
| `privateGetHistDeposits` | GET | `hist-deposits` | 5 |
| `privateGetWithdrawals` | GET | `withdrawals` | 20 |
| `privateGetHistWithdrawals` | GET | `hist-withdrawals` | 20 |
| `privateGetWithdrawalsQuotas` | GET | `withdrawals/quotas` | 20 |
| `privateGetAccountsTransferable` | GET | `accounts/transferable` | 20 |
| `privateGetTransferList` | GET | `transfer-list` | 20 |
| `privateGetBaseFee` | GET | `base-fee` | 3 |
| `privateGetTradeFees` | GET | `trade-fees` | 3 |
| `privateGetMarketOrderbookLevelLevel` | GET | `market/orderbook/level{level}` | 3 |
| `privateGetMarketOrderbookLevel2` | GET | `market/orderbook/level2` | 3 |
| `privateGetMarketOrderbookLevel3` | GET | `market/orderbook/level3` | 3 |
| `privateGetHfAccountsOpened` | GET | `hf/accounts/opened` | 2 |
| `privateGetHfOrdersActive` | GET | `hf/orders/active` | 2 |
| `privateGetHfOrdersActiveSymbols` | GET | `hf/orders/active/symbols` | 2 |
| `privateGetHfMarginOrderActiveSymbols` | GET | `hf/margin/order/active/symbols` | 2 |
| `privateGetHfOrdersDone` | GET | `hf/orders/done` | 2 |
| `privateGetHfOrdersOrderId` | GET | `hf/orders/{orderId}` | 2 |
| `privateGetHfOrdersClientOrderClientOid` | GET | `hf/orders/client-order/{clientOid}` | 2 |
| `privateGetHfOrdersDeadCancelAllQuery` | GET | `hf/orders/dead-cancel-all/query` | 2 |
| `privateGetHfFills` | GET | `hf/fills` | 2 |
| `privateGetOrders` | GET | `orders` | 2 |
| `privateGetLimitOrders` | GET | `limit/orders` | 3 |
| `privateGetOrdersOrderId` | GET | `orders/{orderId}` | 2 |
| `privateGetOrderClientOrderClientOid` | GET | `order/client-order/{clientOid}` | 2 |
| `privateGetFills` | GET | `fills` | 10 |
| `privateGetLimitFills` | GET | `limit/fills` | 20 |
| `privateGetStopOrder` | GET | `stop-order` | 8 |
| `privateGetStopOrderOrderId` | GET | `stop-order/{orderId}` | 3 |
| `privateGetStopOrderQueryOrderByClientOid` | GET | `stop-order/queryOrderByClientOid` | 3 |
| `privateGetOcoOrderOrderId` | GET | `oco/order/{orderId}` | 2 |
| `privateGetOcoOrderDetailsOrderId` | GET | `oco/order/details/{orderId}` | 2 |
| `privateGetOcoClientOrderClientOid` | GET | `oco/client-order/{clientOid}` | 2 |
| `privateGetOcoOrders` | GET | `oco/orders` | 2 |
| `privateGetHfMarginOrdersActive` | GET | `hf/margin/orders/active` | 4 |
| `privateGetHfMarginOrdersDone` | GET | `hf/margin/orders/done` | 10 |
| `privateGetHfMarginOrdersOrderId` | GET | `hf/margin/orders/{orderId}` | 4 |
| `privateGetHfMarginOrdersClientOrderClientOid` | GET | `hf/margin/orders/client-order/{clientOid}` | 5 |
| `privateGetHfMarginFills` | GET | `hf/margin/fills` | 5 |
| `privateGetHfMarginStopOrders` | GET | `hf/margin/stop-orders` | 8 |
| `privateGetHfMarginStopOrderOrderId` | GET | `hf/margin/stop-order/orderId` | 3 |
| `privateGetHfMarginStopOrderClientOid` | GET | `hf/margin/stop-order/clientOid` | 3 |
| `privateGetHfMarginOcoOrderOrderId` | GET | `hf/margin/oco-order/orderId` | 2 |
| `privateGetHfMarginOcoOrderClientOid` | GET | `hf/margin/oco-order/clientOid` | 2 |
| `privateGetHfMarginOcoOrderDetailOrderId` | GET | `hf/margin/oco-order/detail/orderId` | 2 |
| `privateGetHfMarginOcoOrders` | GET | `hf/margin/oco-orders` | 2 |
| `privateGetEtfInfo` | GET | `etf/info` | 25 |
| `privateGetMarginCurrencies` | GET | `margin/currencies` | 20 |
| `privateGetRiskLimitStrategy` | GET | `risk/limit/strategy` | 20 |
| `privateGetIsolatedSymbols` | GET | `isolated/symbols` | 3 |
| `privateGetMarginSymbols` | GET | `margin/symbols` | 3 |
| `privateGetIsolatedAccountSymbol` | GET | `isolated/account/{symbol}` | 50 |
| `privateGetMarginBorrow` | GET | `margin/borrow` | 15 |
| `privateGetMarginRepay` | GET | `margin/repay` | 15 |
| `privateGetMarginInterest` | GET | `margin/interest` | 20 |
| `privateGetProjectList` | GET | `project/list` | 10 |
| `privateGetProjectMarketInterestRate` | GET | `project/marketInterestRate` | 5 |
| `privateGetRedeemOrders` | GET | `redeem/orders` | 10 |
| `privateGetPurchaseOrders` | GET | `purchase/orders` | 10 |
| `privateGetBrokerApiRebaseDownload` | GET | `broker/api/rebase/download` | 3 |
| `privateGetBrokerQueryMyCommission` | GET | `broker/queryMyCommission` | 3 |
| `privateGetBrokerQueryUser` | GET | `broker/queryUser` | 3 |
| `privateGetBrokerQueryDetailByUid` | GET | `broker/queryDetailByUid` | 3 |
| `privateGetMigrateUserAccountStatus` | GET | `migrate/user/account/status` | 3 |
| `privateGetConvertQuote` | GET | `convert/quote` | 20 |
| `privateGetConvertOrderDetail` | GET | `convert/order/detail` | 5 |
| `privateGetConvertOrderHistory` | GET | `convert/order/history` | 5 |
| `privateGetConvertLimitQuote` | GET | `convert/limit/quote` | 20 |
| `privateGetConvertLimitOrderDetail` | GET | `convert/limit/order/detail` | 5 |
| `privateGetConvertLimitOrders` | GET | `convert/limit/orders` | 5 |
| `privateGetAffiliateInviterStatistics` | GET | `affiliate/inviter/statistics` | 30 |
| `privatePostSubUserCreated` | POST | `sub/user/created` | 15 |
| `privatePostSubApiKey` | POST | `sub/api-key` | 20 |
| `privatePostSubApiKeyUpdate` | POST | `sub/api-key/update` | 30 |
| `privatePostDepositAddresses` | POST | `deposit-addresses` | 20 |
| `privatePostWithdrawals` | POST | `withdrawals` | 5 |
| `privatePostAccountsUniversalTransfer` | POST | `accounts/universal-transfer` | 4 |
| `privatePostAccountsSubTransfer` | POST | `accounts/sub-transfer` | 30 |
| `privatePostAccountsInnerTransfer` | POST | `accounts/inner-transfer` | 15 |
| `privatePostTransferOut` | POST | `transfer-out` | 20 |
| `privatePostTransferIn` | POST | `transfer-in` | 20 |
| `privatePostHfOrders` | POST | `hf/orders` | 1 |
| `privatePostHfOrdersTest` | POST | `hf/orders/test` | 1 |
| `privatePostHfOrdersSync` | POST | `hf/orders/sync` | 1 |
| `privatePostHfOrdersMulti` | POST | `hf/orders/multi` | 1 |
| `privatePostHfOrdersMultiSync` | POST | `hf/orders/multi/sync` | 1 |
| `privatePostHfOrdersAlter` | POST | `hf/orders/alter` | 1 |
| `privatePostHfOrdersDeadCancelAll` | POST | `hf/orders/dead-cancel-all` | 2 |
| `privatePostOrders` | POST | `orders` | 2 |
| `privatePostOrdersTest` | POST | `orders/test` | 2 |
| `privatePostOrdersMulti` | POST | `orders/multi` | 3 |
| `privatePostStopOrder` | POST | `stop-order` | 2 |
| `privatePostOcoOrder` | POST | `oco/order` | 2 |
| `privatePostHfMarginOrder` | POST | `hf/margin/order` | 2 |
| `privatePostHfMarginOrderTest` | POST | `hf/margin/order/test` | 2 |
| `privatePostHfMarginStopOrder` | POST | `hf/margin/stop-order` | 3 |
| `privatePostMarginOrder` | POST | `margin/order` | 5 |
| `privatePostMarginOrderTest` | POST | `margin/order/test` | 5 |
| `privatePostHfMarginOcoOrder` | POST | `hf/margin/oco-order` | 2 |
| `privatePostMarginBorrow` | POST | `margin/borrow` | 15 |
| `privatePostMarginRepay` | POST | `margin/repay` | 10 |
| `privatePostPurchase` | POST | `purchase` | 15 |
| `privatePostRedeem` | POST | `redeem` | 15 |
| `privatePostLendPurchaseUpdate` | POST | `lend/purchase/update` | 10 |
| `privatePostConvertOrder` | POST | `convert/order` | 20 |
| `privatePostConvertLimitOrder` | POST | `convert/limit/order` | 20 |
| `privatePostBulletPrivate` | POST | `bullet-private` | 10 |
| `privatePostPositionUpdateUserLeverage` | POST | `position/update-user-leverage` | 5 |
| `privatePostDepositAddressCreate` | POST | `deposit-address/create` | 20 |
| `privateDeleteSubApiKey` | DELETE | `sub/api-key` | 30 |
| `privateDeleteWithdrawalsWithdrawalId` | DELETE | `withdrawals/{withdrawalId}` | 20 |
| `privateDeleteHfOrdersOrderId` | DELETE | `hf/orders/{orderId}` | 1 |
| `privateDeleteHfOrdersSyncOrderId` | DELETE | `hf/orders/sync/{orderId}` | 1 |
| `privateDeleteHfOrdersClientOrderClientOid` | DELETE | `hf/orders/client-order/{clientOid}` | 1 |
| `privateDeleteHfOrdersSyncClientOrderClientOid` | DELETE | `hf/orders/sync/client-order/{clientOid}` | 1 |
| `privateDeleteHfOrdersCancelOrderId` | DELETE | `hf/orders/cancel/{orderId}` | 1 |
| `privateDeleteHfOrders` | DELETE | `hf/orders` | 2 |
| `privateDeleteHfOrdersCancelAll` | DELETE | `hf/orders/cancelAll` | 30 |
| `privateDeleteOrdersOrderId` | DELETE | `orders/{orderId}` | 3 |
| `privateDeleteOrderClientOrderClientOid` | DELETE | `order/client-order/{clientOid}` | 5 |
| `privateDeleteOrders` | DELETE | `orders` | 20 |
| `privateDeleteStopOrderOrderId` | DELETE | `stop-order/{orderId}` | 3 |
| `privateDeleteStopOrderCancelOrderByClientOid` | DELETE | `stop-order/cancelOrderByClientOid` | 5 |
| `privateDeleteStopOrderCancel` | DELETE | `stop-order/cancel` | 3 |
| `privateDeleteOcoOrderOrderId` | DELETE | `oco/order/{orderId}` | 3 |
| `privateDeleteOcoClientOrderClientOid` | DELETE | `oco/client-order/{clientOid}` | 3 |
| `privateDeleteOcoOrders` | DELETE | `oco/orders` | 3 |
| `privateDeleteHfMarginOrdersOrderId` | DELETE | `hf/margin/orders/{orderId}` | 2 |
| `privateDeleteHfMarginOrdersClientOrderClientOid` | DELETE | `hf/margin/orders/client-order/{clientOid}` | 2 |
| `privateDeleteHfMarginOrders` | DELETE | `hf/margin/orders` | 5 |
| `privateDeleteHfMarginStopOrderCancelById` | DELETE | `hf/margin/stop-order/cancel-by-id` | 3 |
| `privateDeleteHfMarginStopOrderCancelByClientOid` | DELETE | `hf/margin/stop-order/cancel-by-clientOid` | 5 |
| `privateDeleteHfMarginStopOrderCancel` | DELETE | `hf/margin/stop-order/cancel` | 3 |
| `privateDeleteHfMarginOcoOrderCancelById` | DELETE | `hf/margin/oco-order/cancel-by-id` | 3 |
| `privateDeleteHfMarginOcoOrderCancelByClientOid` | DELETE | `hf/margin/oco-order/cancel-by-clientOid` | 3 |
| `privateDeleteHfMarginOcoOrderCancel` | DELETE | `hf/margin/oco-order/cancel` | 3 |
| `privateDeleteConvertLimitOrderCancel` | DELETE | `convert/limit/order/cancel` | 5 |

## futuresPublic

**Base URL**: `https://api-futures.kucoin.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `futuresPublicGetContractsActive` | GET | `contracts/active` | 6 |
| `futuresPublicGetContractsSymbol` | GET | `contracts/{symbol}` | 6 |
| `futuresPublicGetTicker` | GET | `ticker` | 4 |
| `futuresPublicGetAllTickers` | GET | `allTickers` | 10 |
| `futuresPublicGetLevel2Snapshot` | GET | `level2/snapshot` | 6 |
| `futuresPublicGetLevel2Depth20` | GET | `level2/depth20` | 10 |
| `futuresPublicGetLevel2Depth100` | GET | `level2/depth100` | 20 |
| `futuresPublicGetTradeHistory` | GET | `trade/history` | 10 |
| `futuresPublicGetKlineQuery` | GET | `kline/query` | 6 |
| `futuresPublicGetInterestQuery` | GET | `interest/query` | 10 |
| `futuresPublicGetIndexQuery` | GET | `index/query` | 4 |
| `futuresPublicGetMarkPriceSymbolCurrent` | GET | `mark-price/{symbol}/current` | 6 |
| `futuresPublicGetPremiumQuery` | GET | `premium/query` | 6 |
| `futuresPublicGetTradeStatistics` | GET | `trade-statistics` | 6 |
| `futuresPublicGetFundingRateSymbolCurrent` | GET | `funding-rate/{symbol}/current` | 4 |
| `futuresPublicGetContractFundingRates` | GET | `contract/funding-rates` | 10 |
| `futuresPublicGetTimestamp` | GET | `timestamp` | 4 |
| `futuresPublicGetStatus` | GET | `status` | 8 |
| `futuresPublicGetLevel2MessageQuery` | GET | `level2/message/query` | 1.3953 |
| `futuresPublicGetContractsRiskLimitSymbol` | GET | `contracts/risk-limit/{symbol}` | 3 |
| `futuresPublicGetLevel3MessageQuery` | GET | `level3/message/query` | 3 |
| `futuresPublicGetLevel3Snapshot` | GET | `level3/snapshot` | 3 |
| `futuresPublicPostBulletPublic` | POST | `bullet-public` | 20 |

## futuresPrivate

**Base URL**: `https://api-futures.kucoin.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `futuresPrivateGetTransactionHistory` | GET | `transaction-history` | 4 |
| `futuresPrivateGetAccountOverview` | GET | `account-overview` | 10 |
| `futuresPrivateGetAccountOverviewAll` | GET | `account-overview-all` | 12 |
| `futuresPrivateGetTransferList` | GET | `transfer-list` | 20 |
| `futuresPrivateGetOrders` | GET | `orders` | 4 |
| `futuresPrivateGetStopOrders` | GET | `stopOrders` | 12 |
| `futuresPrivateGetRecentDoneOrders` | GET | `recentDoneOrders` | 10 |
| `futuresPrivateGetOrdersOrderId` | GET | `orders/{orderId}` | 10 |
| `futuresPrivateGetOrdersByClientOid` | GET | `orders/byClientOid` | 10 |
| `futuresPrivateGetFills` | GET | `fills` | 10 |
| `futuresPrivateGetRecentFills` | GET | `recentFills` | 6 |
| `futuresPrivateGetTradeFees` | GET | `trade-fees` | 6 |
| `futuresPrivateGetOpenOrderStatistics` | GET | `openOrderStatistics` | 20 |
| `futuresPrivateGetPosition` | GET | `position` | 4 |
| `futuresPrivateGetPositions` | GET | `positions` | 4 |
| `futuresPrivateGetMarginMaxWithdrawMargin` | GET | `margin/maxWithdrawMargin` | 20 |
| `futuresPrivateGetContractsRiskLimitSymbol` | GET | `contracts/risk-limit/{symbol}` | 10 |
| `futuresPrivateGetFundingHistory` | GET | `funding-history` | 10 |
| `futuresPrivateGetCopyTradeFuturesGetMaxOpenSize` | GET | `copy-trade/futures/get-max-open-size` | 8 |
| `futuresPrivateGetCopyTradeFuturesPositionMarginMaxWithdrawMargin` | GET | `copy-trade/futures/position/margin/max-withdraw-margin` | 20 |
| `futuresPrivateGetHistoryPositions` | GET | `history-positions` | 4 |
| `futuresPrivateGetPositionGetMarginMode` | GET | `position/getMarginMode` | 4 |
| `futuresPrivateGetPositionGetPositionMode` | GET | `position/getPositionMode` | 4 |
| `futuresPrivateGetDepositAddress` | GET | `deposit-address` | 4 |
| `futuresPrivateGetDepositList` | GET | `deposit-list` | 4 |
| `futuresPrivateGetWithdrawalsQuotas` | GET | `withdrawals/quotas` | 4 |
| `futuresPrivateGetWithdrawalList` | GET | `withdrawal-list` | 4 |
| `futuresPrivateGetSubApiKey` | GET | `sub/api-key` | 4 |
| `futuresPrivateGetTradeStatistics` | GET | `trade-statistics` | 4 |
| `futuresPrivateGetGetMaxOpenSize` | GET | `getMaxOpenSize` | 4 |
| `futuresPrivateGetGetCrossUserLeverage` | GET | `getCrossUserLeverage` | 4 |
| `futuresPrivatePostTransferOut` | POST | `transfer-out` | 20 |
| `futuresPrivatePostTransferIn` | POST | `transfer-in` | 20 |
| `futuresPrivatePostOrders` | POST | `orders` | 4 |
| `futuresPrivatePostStOrders` | POST | `st-orders` | 4 |
| `futuresPrivatePostOrdersTest` | POST | `orders/test` | 4 |
| `futuresPrivatePostOrdersMulti` | POST | `orders/multi` | 6 |
| `futuresPrivatePostPositionMarginAutoDepositStatus` | POST | `position/margin/auto-deposit-status` | 8 |
| `futuresPrivatePostMarginWithdrawMargin` | POST | `margin/withdrawMargin` | 10 |
| `futuresPrivatePostPositionMarginDepositMargin` | POST | `position/margin/deposit-margin` | 8 |
| `futuresPrivatePostPositionRiskLimitLevelChange` | POST | `position/risk-limit-level/change` | 8 |
| `futuresPrivatePostCopyTradeFuturesOrders` | POST | `copy-trade/futures/orders` | 4 |
| `futuresPrivatePostCopyTradeFuturesOrdersTest` | POST | `copy-trade/futures/orders/test` | 4 |
| `futuresPrivatePostCopyTradeFuturesStOrders` | POST | `copy-trade/futures/st-orders` | 4 |
| `futuresPrivatePostCopyTradeFuturesPositionMarginDepositMargin` | POST | `copy-trade/futures/position/margin/deposit-margin` | 8 |
| `futuresPrivatePostCopyTradeFuturesPositionMarginWithdrawMargin` | POST | `copy-trade/futures/position/margin/withdraw-margin` | 20 |
| `futuresPrivatePostCopyTradeFuturesPositionRiskLimitLevelChange` | POST | `copy-trade/futures/position/risk-limit-level/change` | 4 |
| `futuresPrivatePostCopyTradeFuturesPositionMarginAutoDepositStatus` | POST | `copy-trade/futures/position/margin/auto-deposit-status` | 8 |
| `futuresPrivatePostCopyTradeFuturesPositionChangeMarginMode` | POST | `copy-trade/futures/position/changeMarginMode` | 4 |
| `futuresPrivatePostCopyTradeFuturesPositionChangeCrossUserLeverage` | POST | `copy-trade/futures/position/changeCrossUserLeverage` | 4 |
| `futuresPrivatePostCopyTradeGetCrossModeMarginRequirement` | POST | `copy-trade/getCrossModeMarginRequirement` | 6 |
| `futuresPrivatePostCopyTradePositionSwitchPositionMode` | POST | `copy-trade/position/switchPositionMode` | 4 |
| `futuresPrivatePostChangeCrossUserLeverage` | POST | `changeCrossUserLeverage` | 4 |
| `futuresPrivatePostWithdrawals` | POST | `withdrawals` | 4 |
| `futuresPrivatePostSubApiKey` | POST | `sub/api-key` | 4 |
| `futuresPrivatePostSubApiKeyUpdate` | POST | `sub/api-key/update` | 4 |
| `futuresPrivatePostPositionChangeMarginMode` | POST | `position/changeMarginMode` | 4 |
| `futuresPrivatePostPositionSwitchPositionMode` | POST | `position/switchPositionMode` | 4 |
| `futuresPrivatePostBulletPrivate` | POST | `bullet-private` | 20 |
| `futuresPrivateDeleteOrdersOrderId` | DELETE | `orders/{orderId}` | 2 |
| `futuresPrivateDeleteOrdersClientOrderClientOid` | DELETE | `orders/client-order/{clientOid}` | 2 |
| `futuresPrivateDeleteOrders` | DELETE | `orders` | 20 |
| `futuresPrivateDeleteStopOrders` | DELETE | `stopOrders` | 30 |
| `futuresPrivateDeleteCopyTradeFuturesOrders` | DELETE | `copy-trade/futures/orders` | 1.5 |
| `futuresPrivateDeleteCopyTradeFuturesOrdersClientOrder` | DELETE | `copy-trade/futures/orders/client-order` | 1.5 |
| `futuresPrivateDeleteOrdersMultiCancel` | DELETE | `orders/multi-cancel` | 40 |
| `futuresPrivateDeleteWithdrawalsWithdrawalId` | DELETE | `withdrawals/{withdrawalId}` | 10 |
| `futuresPrivateDeleteCancelTransferOut` | DELETE | `cancel/transfer-out` | 10 |
| `futuresPrivateDeleteSubApiKey` | DELETE | `sub/api-key` | 10 |

## webExchange

**Base URL**: `https://kucoin.com/_api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `webExchangeGetCurrencyCurrencyChainInfo` | GET | `currency/currency/chain-info` | 1 |
| `webExchangeGetContractSymbolFundingRates` | GET | `contract/{symbol}/funding-rates` | 2 |

## broker

**Base URL**: `https://api-broker.kucoin.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `brokerGetBrokerNdInfo` | GET | `broker/nd/info` | 4 |
| `brokerGetBrokerNdAccount` | GET | `broker/nd/account` | 4 |
| `brokerGetBrokerNdAccountApikey` | GET | `broker/nd/account/apikey` | 4 |
| `brokerGetBrokerNdRebaseDownload` | GET | `broker/nd/rebase/download` | 4 |
| `brokerGetAssetNdbrokerDepositList` | GET | `asset/ndbroker/deposit/list` | 2 |
| `brokerGetBrokerNdTransferDetail` | GET | `broker/nd/transfer/detail` | 2 |
| `brokerGetBrokerNdDepositDetail` | GET | `broker/nd/deposit/detail` | 2 |
| `brokerGetBrokerNdWithdrawDetail` | GET | `broker/nd/withdraw/detail` | 2 |
| `brokerPostBrokerNdTransfer` | POST | `broker/nd/transfer` | 2 |
| `brokerPostBrokerNdAccount` | POST | `broker/nd/account` | 6 |
| `brokerPostBrokerNdAccountApikey` | POST | `broker/nd/account/apikey` | 6 |
| `brokerPostBrokerNdAccountUpdateApikey` | POST | `broker/nd/account/update-apikey` | 6 |
| `brokerDeleteBrokerNdAccountApikey` | DELETE | `broker/nd/account/apikey` | 6 |

## earn

**Base URL**: `https://api.kucoin.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `earnGetOtcLoanDiscountRateConfigs` | GET | `otc-loan/discount-rate-configs` | 20 |
| `earnGetOtcLoanLoan` | GET | `otc-loan/loan` | 2 |
| `earnGetOtcLoanAccounts` | GET | `otc-loan/accounts` | 2 |
| `earnGetEarnRedeemPreview` | GET | `earn/redeem-preview` | 10 |
| `earnGetEarnSavingProducts` | GET | `earn/saving/products` | 10 |
| `earnGetEarnHoldAssets` | GET | `earn/hold-assets` | 10 |
| `earnGetEarnPromotionProducts` | GET | `earn/promotion/products` | 10 |
| `earnGetEarnKcsStakingProducts` | GET | `earn/kcs-staking/products` | 10 |
| `earnGetEarnStakingProducts` | GET | `earn/staking/products` | 10 |
| `earnGetEarnEthStakingProducts` | GET | `earn/eth-staking/products` | 10 |
| `earnGetStructEarnDualProducts` | GET | `struct-earn/dual/products` | 6 |
| `earnGetStructEarnOrders` | GET | `struct-earn/orders` | 10 |
| `earnPostEarnOrders` | POST | `earn/orders` | 10 |
| `earnPostStructEarnOrders` | POST | `struct-earn/orders` | 10 |
| `earnDeleteEarnOrders` | DELETE | `earn/orders` | 10 |

## uta

**Base URL**: `https://api.kucoin.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `utaGetMarketAnnouncement` | GET | `market/announcement` | 40 |
| `utaGetMarketCurrency` | GET | `market/currency` | 6 |
| `utaGetAssetCurrencies` | GET | `asset/currencies` | 6 |
| `utaGetMarketInstrument` | GET | `market/instrument` | 8 |
| `utaGetMarketTicker` | GET | `market/ticker` | 30 |
| `utaGetMarketTrade` | GET | `market/trade` | 6 |
| `utaGetMarketKline` | GET | `market/kline` | 6 |
| `utaGetMarketFundingRate` | GET | `market/funding-rate` | 4 |
| `utaGetMarketFundingRateHistory` | GET | `market/funding-rate-history` | 10 |
| `utaGetMarketCrossConfig` | GET | `market/cross-config` | 50 |
| `utaGetMarketCollateralDiscountRatio` | GET | `market/collateral-discount-ratio` | 20 |
| `utaGetMarketIndexPrice` | GET | `market/index-price` | 20 |
| `utaGetMarketPositionTiers` | GET | `market/position-tiers` | 40 |
| `utaGetMarketOpenInterest` | GET | `market/open-interest` | 20 |
| `utaGetServerStatus` | GET | `server/status` | 6 |
| `utaGetMarketBorrowableCurrency` | GET | `market/borrowable-currency` | 30 |
| `utaGetUserMyIp` | GET | `user/my-ip` | 20 |
| `utaGetMarketFiatPrice` | GET | `market/fiat-price` | 6 |

## utaPrivate

**Base URL**: `https://api.kucoin.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `utaPrivateGetMarketOrderbook` | GET | `market/orderbook` | 6 |
| `utaPrivateGetAccountBalance` | GET | `account/balance` | 10 |
| `utaPrivateGetAccountTransferQuota` | GET | `account/transfer-quota` | 40 |
| `utaPrivateGetAccountMode` | GET | `account/mode` | 60 |
| `utaPrivateGetAccountLedger` | GET | `account/ledger` | 4 |
| `utaPrivateGetAccountInterestHistory` | GET | `account/interest-history` | 30 |
| `utaPrivateGetAssetDepositAddress` | GET | `asset/deposit/address` | 10 |
| `utaPrivateGetAccountDepositAddress` | GET | `account/deposit/address` | 5 |
| `utaPrivateGetAccountModeAccountBalance` | GET | `{accountMode}/account/balance` | 10 |
| `utaPrivateGetAccountModeAccountOverview` | GET | `{accountMode}/account/overview` | 10 |
| `utaPrivateGetAccountModeOrderDetail` | GET | `{accountMode}/order/detail` | 8 |
| `utaPrivateGetAccountModeOrderOpenList` | GET | `{accountMode}/order/open-list` | 8 |
| `utaPrivateGetAccountModeOrderHistory` | GET | `{accountMode}/order/history` | 8 |
| `utaPrivateGetAccountModeOrderExecution` | GET | `{accountMode}/order/execution` | 8 |
| `utaPrivateGetAccountModePositionOpenList` | GET | `{accountMode}/position/open-list` | 6 |
| `utaPrivateGetAccountModePositionHistory` | GET | `{accountMode}/position/history` | 4 |
| `utaPrivateGetPositionHistory` | GET | `position/history` | 4 |
| `utaPrivateGetAccountModePositionTiers` | GET | `{accountMode}/position/tiers` | 40 |
| `utaPrivateGetSubAccountBalance` | GET | `sub-account/balance` | 10 |
| `utaPrivateGetUserFeeRate` | GET | `user/fee-rate` | 6 |
| `utaPrivateGetDcpQuery` | GET | `dcp/query` | 4 |
| `utaPrivateGetUnifiedAccountLeverage` | GET | `unified/account/leverage` | 20 |
| `utaPrivateGetPositionFundingHistory` | GET | `position/funding-history` | 30 |
| `utaPrivateGetAccountInterestLimits` | GET | `account/interest-limits` | 20 |
| `utaPrivatePostAccountTransfer` | POST | `account/transfer` | 8 |
| `utaPrivatePostAccountMode` | POST | `account/mode` | 60 |
| `utaPrivatePostAccountModeAccountModifyLeverage` | POST | `{accountMode}/account/modify-leverage` | 40 |
| `utaPrivatePostAccountModeOrderPlace` | POST | `{accountMode}/order/place` | 2 |
| `utaPrivatePostAccountModeOrderPlaceBatch` | POST | `{accountMode}/order/place-batch` | 8 |
| `utaPrivatePostAccountModeOrderCancel` | POST | `{accountMode}/order/cancel` | 2 |
| `utaPrivatePostAccountModeOrderCancelBatch` | POST | `{accountMode}/order/cancel-batch` | 8 |
| `utaPrivatePostAccountModeOrderCancelAll` | POST | `{accountMode}/order/cancel-all` | 40 |
| `utaPrivatePostSubAccountCanTransferOut` | POST | `sub-account/canTransferOut` | 10 |
| `utaPrivatePostDcpSet` | POST | `dcp/set` | 4 |
| `utaPrivatePostAccountModeAccountModifyLeverageMarginCross` | POST | `{accountMode}/account/modify-leverage-margin-cross` | 40 |

