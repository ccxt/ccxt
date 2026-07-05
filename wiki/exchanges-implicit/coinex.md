Every endpoint in `coinex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/coinex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `v1PublicGetAmmMarket`); the snake_case alias (`v1_public_get_amm_market`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`V1PublicGetAmmMarket`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const coinex = new ccxt.coinex ();
const response = await coinex.v1PublicGetAmmMarket (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const coinex = new ccxt.coinex ();
const response = await coinex.v1PublicGetAmmMarket (params);
```

#### **Python**

```python
import ccxt
coinex = ccxt.coinex()
response = coinex.v1_public_get_amm_market(params)
```

#### **PHP**

```php
$coinex = new \ccxt\coinex();
$response = $coinex->v1_public_get_amm_market($params);
```

#### **C#**

```csharp
using ccxt;
var coinex = new Coinex();
var response = await coinex.v1PublicGetAmmMarket(parameters);
```

#### **Go**

```go
coinex := ccxt.NewCoinex(nil)
response := <-coinex.V1PublicGetAmmMarket(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official coinex API documentation:** [docs.coinex.com](https://docs.coinex.com/api/v2)

> 251 implicit endpoints across 2 access groups.

## v1

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v1PublicGetAmmMarket` | GET | `amm/market` | 1 |
| `v1PublicGetCommonCurrencyRate` | GET | `common/currency/rate` | 1 |
| `v1PublicGetCommonAssetConfig` | GET | `common/asset/config` | 1 |
| `v1PublicGetCommonMaintainInfo` | GET | `common/maintain/info` | 1 |
| `v1PublicGetCommonTempMaintainInfo` | GET | `common/temp-maintain/info` | 1 |
| `v1PublicGetMarginMarket` | GET | `margin/market` | 1 |
| `v1PublicGetMarketInfo` | GET | `market/info` | 1 |
| `v1PublicGetMarketList` | GET | `market/list` | 1 |
| `v1PublicGetMarketTicker` | GET | `market/ticker` | 1 |
| `v1PublicGetMarketTickerAll` | GET | `market/ticker/all` | 1 |
| `v1PublicGetMarketDepth` | GET | `market/depth` | 1 |
| `v1PublicGetMarketDeals` | GET | `market/deals` | 1 |
| `v1PublicGetMarketKline` | GET | `market/kline` | 1 |
| `v1PublicGetMarketDetail` | GET | `market/detail` | 1 |
| `v1PrivateGetAccountAmmBalance` | GET | `account/amm/balance` | 40 |
| `v1PrivateGetAccountInvestmentBalance` | GET | `account/investment/balance` | 40 |
| `v1PrivateGetAccountBalanceHistory` | GET | `account/balance/history` | 40 |
| `v1PrivateGetAccountMarketFee` | GET | `account/market/fee` | 40 |
| `v1PrivateGetBalanceCoinDeposit` | GET | `balance/coin/deposit` | 40 |
| `v1PrivateGetBalanceCoinWithdraw` | GET | `balance/coin/withdraw` | 40 |
| `v1PrivateGetBalanceInfo` | GET | `balance/info` | 40 |
| `v1PrivateGetBalanceDepositAddressCoinType` | GET | `balance/deposit/address/{coin_type}` | 40 |
| `v1PrivateGetContractTransferHistory` | GET | `contract/transfer/history` | 40 |
| `v1PrivateGetCreditInfo` | GET | `credit/info` | 40 |
| `v1PrivateGetCreditBalance` | GET | `credit/balance` | 40 |
| `v1PrivateGetInvestmentTransferHistory` | GET | `investment/transfer/history` | 40 |
| `v1PrivateGetMarginAccount` | GET | `margin/account` | 1 |
| `v1PrivateGetMarginConfig` | GET | `margin/config` | 1 |
| `v1PrivateGetMarginLoanHistory` | GET | `margin/loan/history` | 40 |
| `v1PrivateGetMarginTransferHistory` | GET | `margin/transfer/history` | 40 |
| `v1PrivateGetOrderDeals` | GET | `order/deals` | 40 |
| `v1PrivateGetOrderFinished` | GET | `order/finished` | 40 |
| `v1PrivateGetOrderPending` | GET | `order/pending` | 8 |
| `v1PrivateGetOrderStatus` | GET | `order/status` | 8 |
| `v1PrivateGetOrderStatusBatch` | GET | `order/status/batch` | 8 |
| `v1PrivateGetOrderUserDeals` | GET | `order/user/deals` | 40 |
| `v1PrivateGetOrderStopFinished` | GET | `order/stop/finished` | 40 |
| `v1PrivateGetOrderStopPending` | GET | `order/stop/pending` | 8 |
| `v1PrivateGetOrderUserTradeFee` | GET | `order/user/trade/fee` | 1 |
| `v1PrivateGetOrderMarketTradeInfo` | GET | `order/market/trade/info` | 1 |
| `v1PrivateGetSubAccountBalance` | GET | `sub_account/balance` | 1 |
| `v1PrivateGetSubAccountTransferHistory` | GET | `sub_account/transfer/history` | 40 |
| `v1PrivateGetSubAccountAuthApi` | GET | `sub_account/auth/api` | 40 |
| `v1PrivateGetSubAccountAuthApiUserAuthId` | GET | `sub_account/auth/api/{user_auth_id}` | 40 |
| `v1PrivatePostBalanceCoinWithdraw` | POST | `balance/coin/withdraw` | 40 |
| `v1PrivatePostContractBalanceTransfer` | POST | `contract/balance/transfer` | 40 |
| `v1PrivatePostMarginFlat` | POST | `margin/flat` | 40 |
| `v1PrivatePostMarginLoan` | POST | `margin/loan` | 40 |
| `v1PrivatePostMarginTransfer` | POST | `margin/transfer` | 40 |
| `v1PrivatePostOrderLimitBatch` | POST | `order/limit/batch` | 40 |
| `v1PrivatePostOrderIoc` | POST | `order/ioc` | 13.334 |
| `v1PrivatePostOrderLimit` | POST | `order/limit` | 13.334 |
| `v1PrivatePostOrderMarket` | POST | `order/market` | 13.334 |
| `v1PrivatePostOrderModify` | POST | `order/modify` | 13.334 |
| `v1PrivatePostOrderStopLimit` | POST | `order/stop/limit` | 13.334 |
| `v1PrivatePostOrderStopMarket` | POST | `order/stop/market` | 13.334 |
| `v1PrivatePostOrderStopModify` | POST | `order/stop/modify` | 13.334 |
| `v1PrivatePostSubAccountTransfer` | POST | `sub_account/transfer` | 40 |
| `v1PrivatePostSubAccountRegister` | POST | `sub_account/register` | 1 |
| `v1PrivatePostSubAccountUnfrozen` | POST | `sub_account/unfrozen` | 40 |
| `v1PrivatePostSubAccountFrozen` | POST | `sub_account/frozen` | 40 |
| `v1PrivatePostSubAccountAuthApi` | POST | `sub_account/auth/api` | 40 |
| `v1PrivatePutBalanceDepositAddressCoinType` | PUT | `balance/deposit/address/{coin_type}` | 40 |
| `v1PrivatePutSubAccountUnfrozen` | PUT | `sub_account/unfrozen` | 40 |
| `v1PrivatePutSubAccountFrozen` | PUT | `sub_account/frozen` | 40 |
| `v1PrivatePutSubAccountAuthApiUserAuthId` | PUT | `sub_account/auth/api/{user_auth_id}` | 40 |
| `v1PrivatePutV1AccountSettings` | PUT | `v1/account/settings` | 40 |
| `v1PrivateDeleteBalanceCoinWithdraw` | DELETE | `balance/coin/withdraw` | 40 |
| `v1PrivateDeleteOrderPendingBatch` | DELETE | `order/pending/batch` | 40 |
| `v1PrivateDeleteOrderPending` | DELETE | `order/pending` | 13.334 |
| `v1PrivateDeleteOrderStopPending` | DELETE | `order/stop/pending` | 40 |
| `v1PrivateDeleteOrderStopPendingId` | DELETE | `order/stop/pending/{id}` | 13.334 |
| `v1PrivateDeleteOrderPendingByClientId` | DELETE | `order/pending/by_client_id` | 40 |
| `v1PrivateDeleteOrderStopPendingByClientId` | DELETE | `order/stop/pending/by_client_id` | 40 |
| `v1PrivateDeleteSubAccountAuthApiUserAuthId` | DELETE | `sub_account/auth/api/{user_auth_id}` | 40 |
| `v1PrivateDeleteSubAccountAuthorizeId` | DELETE | `sub_account/authorize/{id}` | 40 |
| `v1PerpetualPublicGetPing` | GET | `ping` | 1 |
| `v1PerpetualPublicGetTime` | GET | `time` | 1 |
| `v1PerpetualPublicGetMarketList` | GET | `market/list` | 1 |
| `v1PerpetualPublicGetMarketLimitConfig` | GET | `market/limit_config` | 1 |
| `v1PerpetualPublicGetMarketTicker` | GET | `market/ticker` | 1 |
| `v1PerpetualPublicGetMarketTickerAll` | GET | `market/ticker/all` | 1 |
| `v1PerpetualPublicGetMarketDepth` | GET | `market/depth` | 1 |
| `v1PerpetualPublicGetMarketDeals` | GET | `market/deals` | 1 |
| `v1PerpetualPublicGetMarketFundingHistory` | GET | `market/funding_history` | 1 |
| `v1PerpetualPublicGetMarketKline` | GET | `market/kline` | 1 |
| `v1PerpetualPrivateGetMarketUserDeals` | GET | `market/user_deals` | 1 |
| `v1PerpetualPrivateGetAssetQuery` | GET | `asset/query` | 40 |
| `v1PerpetualPrivateGetOrderPending` | GET | `order/pending` | 8 |
| `v1PerpetualPrivateGetOrderFinished` | GET | `order/finished` | 40 |
| `v1PerpetualPrivateGetOrderStopFinished` | GET | `order/stop_finished` | 40 |
| `v1PerpetualPrivateGetOrderStopPending` | GET | `order/stop_pending` | 8 |
| `v1PerpetualPrivateGetOrderStatus` | GET | `order/status` | 8 |
| `v1PerpetualPrivateGetOrderStopStatus` | GET | `order/stop_status` | 8 |
| `v1PerpetualPrivateGetPositionFinished` | GET | `position/finished` | 40 |
| `v1PerpetualPrivateGetPositionPending` | GET | `position/pending` | 40 |
| `v1PerpetualPrivateGetPositionFunding` | GET | `position/funding` | 40 |
| `v1PerpetualPrivateGetPositionAdlHistory` | GET | `position/adl_history` | 40 |
| `v1PerpetualPrivateGetMarketPreference` | GET | `market/preference` | 40 |
| `v1PerpetualPrivateGetPositionMarginHistory` | GET | `position/margin_history` | 40 |
| `v1PerpetualPrivateGetPositionSettleHistory` | GET | `position/settle_history` | 40 |
| `v1PerpetualPrivatePostMarketAdjustLeverage` | POST | `market/adjust_leverage` | 1 |
| `v1PerpetualPrivatePostMarketPositionExpect` | POST | `market/position_expect` | 1 |
| `v1PerpetualPrivatePostOrderPutLimit` | POST | `order/put_limit` | 20 |
| `v1PerpetualPrivatePostOrderPutMarket` | POST | `order/put_market` | 20 |
| `v1PerpetualPrivatePostOrderPutStopLimit` | POST | `order/put_stop_limit` | 20 |
| `v1PerpetualPrivatePostOrderPutStopMarket` | POST | `order/put_stop_market` | 20 |
| `v1PerpetualPrivatePostOrderModify` | POST | `order/modify` | 20 |
| `v1PerpetualPrivatePostOrderModifyStop` | POST | `order/modify_stop` | 20 |
| `v1PerpetualPrivatePostOrderCancel` | POST | `order/cancel` | 20 |
| `v1PerpetualPrivatePostOrderCancelAll` | POST | `order/cancel_all` | 40 |
| `v1PerpetualPrivatePostOrderCancelBatch` | POST | `order/cancel_batch` | 40 |
| `v1PerpetualPrivatePostOrderCancelStop` | POST | `order/cancel_stop` | 20 |
| `v1PerpetualPrivatePostOrderCancelStopAll` | POST | `order/cancel_stop_all` | 40 |
| `v1PerpetualPrivatePostOrderCloseLimit` | POST | `order/close_limit` | 20 |
| `v1PerpetualPrivatePostOrderCloseMarket` | POST | `order/close_market` | 20 |
| `v1PerpetualPrivatePostPositionAdjustMargin` | POST | `position/adjust_margin` | 20 |
| `v1PerpetualPrivatePostPositionStopLoss` | POST | `position/stop_loss` | 20 |
| `v1PerpetualPrivatePostPositionTakeProfit` | POST | `position/take_profit` | 20 |
| `v1PerpetualPrivatePostPositionMarketClose` | POST | `position/market_close` | 20 |
| `v1PerpetualPrivatePostOrderCancelByClientId` | POST | `order/cancel/by_client_id` | 20 |
| `v1PerpetualPrivatePostOrderCancelStopByClientId` | POST | `order/cancel_stop/by_client_id` | 20 |
| `v1PerpetualPrivatePostMarketPreference` | POST | `market/preference` | 20 |

## v2

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PublicGetMaintainInfo` | GET | `maintain/info` | 1 |
| `v2PublicGetPing` | GET | `ping` | 1 |
| `v2PublicGetTime` | GET | `time` | 1 |
| `v2PublicGetSpotMarket` | GET | `spot/market` | 1 |
| `v2PublicGetSpotTicker` | GET | `spot/ticker` | 1 |
| `v2PublicGetSpotDepth` | GET | `spot/depth` | 1 |
| `v2PublicGetSpotDeals` | GET | `spot/deals` | 1 |
| `v2PublicGetSpotKline` | GET | `spot/kline` | 1 |
| `v2PublicGetSpotIndex` | GET | `spot/index` | 1 |
| `v2PublicGetFuturesMarket` | GET | `futures/market` | 1 |
| `v2PublicGetFuturesTicker` | GET | `futures/ticker` | 1 |
| `v2PublicGetFuturesDepth` | GET | `futures/depth` | 1 |
| `v2PublicGetFuturesDeals` | GET | `futures/deals` | 1 |
| `v2PublicGetFuturesKline` | GET | `futures/kline` | 1 |
| `v2PublicGetFuturesIndex` | GET | `futures/index` | 1 |
| `v2PublicGetFuturesFundingRate` | GET | `futures/funding-rate` | 1 |
| `v2PublicGetFuturesFundingRateHistory` | GET | `futures/funding-rate-history` | 1 |
| `v2PublicGetFuturesPremiumIndexHistory` | GET | `futures/premium-index-history` | 1 |
| `v2PublicGetFuturesPositionLevel` | GET | `futures/position-level` | 1 |
| `v2PublicGetFuturesLiquidationHistory` | GET | `futures/liquidation-history` | 1 |
| `v2PublicGetFuturesBasisHistory` | GET | `futures/basis-history` | 1 |
| `v2PublicGetAssetsDepositWithdrawConfig` | GET | `assets/deposit-withdraw-config` | 1 |
| `v2PublicGetAssetsAllDepositWithdrawConfig` | GET | `assets/all-deposit-withdraw-config` | 1 |
| `v2PrivateGetAccountSubs` | GET | `account/subs` | 1 |
| `v2PrivateGetAccountSubsApiDetail` | GET | `account/subs/api-detail` | 40 |
| `v2PrivateGetAccountSubsInfo` | GET | `account/subs/info` | 1 |
| `v2PrivateGetAccountSubsApi` | GET | `account/subs/api` | 40 |
| `v2PrivateGetAccountSubsTransferHistory` | GET | `account/subs/transfer-history` | 40 |
| `v2PrivateGetAccountSubsBalance` | GET | `account/subs/balance` | 1 |
| `v2PrivateGetAccountSubsSpotBalance` | GET | `account/subs/spot-balance` | 1 |
| `v2PrivateGetAccountTradeFeeRate` | GET | `account/trade-fee-rate` | 40 |
| `v2PrivateGetAccountFuturesMarketSettings` | GET | `account/futures-market-settings` | 1 |
| `v2PrivateGetAccountInfo` | GET | `account/info` | 1 |
| `v2PrivateGetAssetsSpotBalance` | GET | `assets/spot/balance` | 40 |
| `v2PrivateGetAssetsFuturesBalance` | GET | `assets/futures/balance` | 40 |
| `v2PrivateGetAssetsMarginBalance` | GET | `assets/margin/balance` | 1 |
| `v2PrivateGetAssetsFinancialBalance` | GET | `assets/financial/balance` | 40 |
| `v2PrivateGetAssetsAmmLiquidity` | GET | `assets/amm/liquidity` | 40 |
| `v2PrivateGetAssetsCreditInfo` | GET | `assets/credit/info` | 40 |
| `v2PrivateGetAssetsSpotTranscationHistory` | GET | `assets/spot/transcation-history` | 1 |
| `v2PrivateGetAssetsMarginBorrowHistory` | GET | `assets/margin/borrow-history` | 40 |
| `v2PrivateGetAssetsMarginInterestLimit` | GET | `assets/margin/interest-limit` | 1 |
| `v2PrivateGetAssetsDepositAddress` | GET | `assets/deposit-address` | 40 |
| `v2PrivateGetAssetsDepositHistory` | GET | `assets/deposit-history` | 40 |
| `v2PrivateGetAssetsWithdraw` | GET | `assets/withdraw` | 40 |
| `v2PrivateGetAssetsTransferHistory` | GET | `assets/transfer-history` | 40 |
| `v2PrivateGetAssetsAmmLiquidityPool` | GET | `assets/amm/liquidity-pool` | 40 |
| `v2PrivateGetAssetsAmmIncomeHistory` | GET | `assets/amm/income-history` | 40 |
| `v2PrivateGetSpotOrderStatus` | GET | `spot/order-status` | 8 |
| `v2PrivateGetSpotBatchOrderStatus` | GET | `spot/batch-order-status` | 8 |
| `v2PrivateGetSpotPendingOrder` | GET | `spot/pending-order` | 8 |
| `v2PrivateGetSpotFinishedOrder` | GET | `spot/finished-order` | 40 |
| `v2PrivateGetSpotPendingStopOrder` | GET | `spot/pending-stop-order` | 8 |
| `v2PrivateGetSpotFinishedStopOrder` | GET | `spot/finished-stop-order` | 40 |
| `v2PrivateGetSpotUserDeals` | GET | `spot/user-deals` | 40 |
| `v2PrivateGetSpotOrderDeals` | GET | `spot/order-deals` | 40 |
| `v2PrivateGetFuturesOrderStatus` | GET | `futures/order-status` | 8 |
| `v2PrivateGetFuturesBatchOrderStatus` | GET | `futures/batch-order-status` | 1 |
| `v2PrivateGetFuturesPendingOrder` | GET | `futures/pending-order` | 8 |
| `v2PrivateGetFuturesFinishedOrder` | GET | `futures/finished-order` | 40 |
| `v2PrivateGetFuturesPendingStopOrder` | GET | `futures/pending-stop-order` | 8 |
| `v2PrivateGetFuturesFinishedStopOrder` | GET | `futures/finished-stop-order` | 40 |
| `v2PrivateGetFuturesUserDeals` | GET | `futures/user-deals` | 1 |
| `v2PrivateGetFuturesOrderDeals` | GET | `futures/order-deals` | 1 |
| `v2PrivateGetFuturesPendingPosition` | GET | `futures/pending-position` | 40 |
| `v2PrivateGetFuturesFinishedPosition` | GET | `futures/finished-position` | 1 |
| `v2PrivateGetFuturesPositionMarginHistory` | GET | `futures/position-margin-history` | 1 |
| `v2PrivateGetFuturesPositionFundingHistory` | GET | `futures/position-funding-history` | 40 |
| `v2PrivateGetFuturesPositionAdlHistory` | GET | `futures/position-adl-history` | 1 |
| `v2PrivateGetFuturesPositionSettleHistory` | GET | `futures/position-settle-history` | 1 |
| `v2PrivateGetReferReferee` | GET | `refer/referee` | 1 |
| `v2PrivateGetReferRefereeRebateRecord` | GET | `refer/referee-rebate/record` | 1 |
| `v2PrivateGetReferRefereeRebateDetail` | GET | `refer/referee-rebate/detail` | 1 |
| `v2PrivateGetReferAgentReferee` | GET | `refer/agent-referee` | 1 |
| `v2PrivateGetReferAgentRebateRecord` | GET | `refer/agent-rebate/record` | 1 |
| `v2PrivateGetReferAgentRebateDetail` | GET | `refer/agent-rebate/detail` | 1 |
| `v2PrivatePostAccountSubs` | POST | `account/subs` | 40 |
| `v2PrivatePostAccountSubsFrozen` | POST | `account/subs/frozen` | 40 |
| `v2PrivatePostAccountSubsUnfrozen` | POST | `account/subs/unfrozen` | 40 |
| `v2PrivatePostAccountSubsApi` | POST | `account/subs/api` | 40 |
| `v2PrivatePostAccountSubsEditApi` | POST | `account/subs/edit-api` | 40 |
| `v2PrivatePostAccountSubsDeleteApi` | POST | `account/subs/delete-api` | 40 |
| `v2PrivatePostAccountSubsTransfer` | POST | `account/subs/transfer` | 40 |
| `v2PrivatePostAccountSettings` | POST | `account/settings` | 40 |
| `v2PrivatePostAccountFuturesMarketSettings` | POST | `account/futures-market-settings` | 40 |
| `v2PrivatePostAssetsMarginBorrow` | POST | `assets/margin/borrow` | 40 |
| `v2PrivatePostAssetsMarginRepay` | POST | `assets/margin/repay` | 40 |
| `v2PrivatePostAssetsRenewalDepositAddress` | POST | `assets/renewal-deposit-address` | 40 |
| `v2PrivatePostAssetsWithdraw` | POST | `assets/withdraw` | 40 |
| `v2PrivatePostAssetsCancelWithdraw` | POST | `assets/cancel-withdraw` | 40 |
| `v2PrivatePostAssetsTransfer` | POST | `assets/transfer` | 40 |
| `v2PrivatePostAssetsAmmAddLiquidity` | POST | `assets/amm/add-liquidity` | 1 |
| `v2PrivatePostAssetsAmmRemoveLiquidity` | POST | `assets/amm/remove-liquidity` | 1 |
| `v2PrivatePostSpotOrder` | POST | `spot/order` | 13.334 |
| `v2PrivatePostSpotStopOrder` | POST | `spot/stop-order` | 13.334 |
| `v2PrivatePostSpotBatchOrder` | POST | `spot/batch-order` | 40 |
| `v2PrivatePostSpotBatchStopOrder` | POST | `spot/batch-stop-order` | 1 |
| `v2PrivatePostSpotModifyOrder` | POST | `spot/modify-order` | 13.334 |
| `v2PrivatePostSpotModifyStopOrder` | POST | `spot/modify-stop-order` | 13.334 |
| `v2PrivatePostSpotBatchModifyOrder` | POST | `spot/batch-modify-order` | 13.334 |
| `v2PrivatePostSpotCancelAllOrder` | POST | `spot/cancel-all-order` | 1 |
| `v2PrivatePostSpotCancelOrder` | POST | `spot/cancel-order` | 6.667 |
| `v2PrivatePostSpotCancelStopOrder` | POST | `spot/cancel-stop-order` | 6.667 |
| `v2PrivatePostSpotCancelBatchOrder` | POST | `spot/cancel-batch-order` | 10 |
| `v2PrivatePostSpotCancelBatchStopOrder` | POST | `spot/cancel-batch-stop-order` | 10 |
| `v2PrivatePostSpotCancelOrderByClientId` | POST | `spot/cancel-order-by-client-id` | 1 |
| `v2PrivatePostSpotCancelStopOrderByClientId` | POST | `spot/cancel-stop-order-by-client-id` | 1 |
| `v2PrivatePostFuturesOrder` | POST | `futures/order` | 20 |
| `v2PrivatePostFuturesStopOrder` | POST | `futures/stop-order` | 20 |
| `v2PrivatePostFuturesBatchOrder` | POST | `futures/batch-order` | 1 |
| `v2PrivatePostFuturesBatchStopOrder` | POST | `futures/batch-stop-order` | 1 |
| `v2PrivatePostFuturesCancelPositionStopLoss` | POST | `futures/cancel-position-stop-loss` | 20 |
| `v2PrivatePostFuturesCancelPositionTakeProfit` | POST | `futures/cancel-position-take-profit` | 20 |
| `v2PrivatePostFuturesModifyOrder` | POST | `futures/modify-order` | 20 |
| `v2PrivatePostFuturesModifyStopOrder` | POST | `futures/modify-stop-order` | 20 |
| `v2PrivatePostFuturesBatchModifyOrder` | POST | `futures/batch-modify-order` | 20 |
| `v2PrivatePostFuturesCancelAllOrder` | POST | `futures/cancel-all-order` | 1 |
| `v2PrivatePostFuturesCancelOrder` | POST | `futures/cancel-order` | 10 |
| `v2PrivatePostFuturesCancelStopOrder` | POST | `futures/cancel-stop-order` | 10 |
| `v2PrivatePostFuturesCancelBatchOrder` | POST | `futures/cancel-batch-order` | 20 |
| `v2PrivatePostFuturesCancelBatchStopOrder` | POST | `futures/cancel-batch-stop-order` | 20 |
| `v2PrivatePostFuturesCancelOrderByClientId` | POST | `futures/cancel-order-by-client-id` | 1 |
| `v2PrivatePostFuturesCancelStopOrderByClientId` | POST | `futures/cancel-stop-order-by-client-id` | 1 |
| `v2PrivatePostFuturesClosePosition` | POST | `futures/close-position` | 20 |
| `v2PrivatePostFuturesAdjustPositionMargin` | POST | `futures/adjust-position-margin` | 20 |
| `v2PrivatePostFuturesAdjustPositionLeverage` | POST | `futures/adjust-position-leverage` | 20 |
| `v2PrivatePostFuturesSetPositionStopLoss` | POST | `futures/set-position-stop-loss` | 20 |
| `v2PrivatePostFuturesSetPositionTakeProfit` | POST | `futures/set-position-take-profit` | 20 |

