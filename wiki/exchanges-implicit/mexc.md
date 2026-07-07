Every endpoint in `mexc`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/mexc) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `spotPublicGetPing`); the snake_case alias (`spot_public_get_ping`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`SpotPublicGetPing`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const mexc = new ccxt.mexc ();
const response = await mexc.spotPublicGetPing (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const mexc = new ccxt.mexc ();
const response = await mexc.spotPublicGetPing (params);
```

#### **Python**

```python
import ccxt
mexc = ccxt.mexc()
response = mexc.spot_public_get_ping(params)
```

#### **PHP**

```php
$mexc = new \ccxt\mexc();
$response = $mexc->spot_public_get_ping($params);
```

#### **C#**

```csharp
using ccxt;
var mexc = new Mexc();
var response = await mexc.spotPublicGetPing(parameters);
```

#### **Go**

```go
mexc := ccxt.NewMexc(nil)
response := <-mexc.SpotPublicGetPing(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official mexc API documentation:** [mexcdevelop.github.io](https://mexcdevelop.github.io/apidocs/)

> 234 implicit endpoints across 4 access groups.

## spot

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `spotPublicGetPing` | GET | `ping` | 1 |
| `spotPublicGetTime` | GET | `time` | 1 |
| `spotPublicGetDefaultSymbols` | GET | `defaultSymbols` | 1 |
| `spotPublicGetSymbolOffline` | GET | `symbol/offline` | 10 |
| `spotPublicGetExchangeInfo` | GET | `exchangeInfo` | 10 |
| `spotPublicGetDepth` | GET | `depth` | 1 |
| `spotPublicGetTrades` | GET | `trades` | 5 |
| `spotPublicGetHistoricalTrades` | GET | `historicalTrades` | 1 |
| `spotPublicGetAggTrades` | GET | `aggTrades` | 1 |
| `spotPublicGetKlines` | GET | `klines` | 1 |
| `spotPublicGetAvgPrice` | GET | `avgPrice` | 1 |
| `spotPublicGetTicker24hr` | GET | `ticker/24hr` | 1 |
| `spotPublicGetTickerPrice` | GET | `ticker/price` | 1 |
| `spotPublicGetTickerBookTicker` | GET | `ticker/bookTicker` | 1 |
| `spotPublicGetEtfInfo` | GET | `etf/info` | 1 |
| `spotPrivateGetKycStatus` | GET | `kyc/status` | 1 |
| `spotPrivateGetUid` | GET | `uid` | 1 |
| `spotPrivateGetOrder` | GET | `order` | 2 |
| `spotPrivateGetOpenOrders` | GET | `openOrders` | 3 |
| `spotPrivateGetAllOrders` | GET | `allOrders` | 10 |
| `spotPrivateGetAccount` | GET | `account` | 10 |
| `spotPrivateGetMyTrades` | GET | `myTrades` | 10 |
| `spotPrivateGetStrategyGroup` | GET | `strategy/group` | 20 |
| `spotPrivateGetStrategyGroupUid` | GET | `strategy/group/uid` | 20 |
| `spotPrivateGetTradeFee` | GET | `tradeFee` | 10 |
| `spotPrivateGetSubAccountList` | GET | `sub-account/list` | 1 |
| `spotPrivateGetSubAccountApiKey` | GET | `sub-account/apiKey` | 1 |
| `spotPrivateGetSubAccountAsset` | GET | `sub-account/asset` | 1 |
| `spotPrivateGetCapitalConfigGetall` | GET | `capital/config/getall` | 10 |
| `spotPrivateGetCapitalDepositHisrec` | GET | `capital/deposit/hisrec` | 1 |
| `spotPrivateGetCapitalWithdrawHistory` | GET | `capital/withdraw/history` | 1 |
| `spotPrivateGetCapitalWithdrawAddress` | GET | `capital/withdraw/address` | 10 |
| `spotPrivateGetCapitalDepositAddress` | GET | `capital/deposit/address` | 10 |
| `spotPrivateGetCapitalTransfer` | GET | `capital/transfer` | 1 |
| `spotPrivateGetCapitalTransferTranId` | GET | `capital/transfer/tranId` | 1 |
| `spotPrivateGetCapitalTransferInternal` | GET | `capital/transfer/internal` | 1 |
| `spotPrivateGetCapitalSubAccountUniversalTransfer` | GET | `capital/sub-account/universalTransfer` | 1 |
| `spotPrivateGetCapitalConvert` | GET | `capital/convert` | 1 |
| `spotPrivateGetCapitalConvertList` | GET | `capital/convert/list` | 1 |
| `spotPrivateGetMarginLoan` | GET | `margin/loan` | 1 |
| `spotPrivateGetMarginAllOrders` | GET | `margin/allOrders` | 1 |
| `spotPrivateGetMarginMyTrades` | GET | `margin/myTrades` | 1 |
| `spotPrivateGetMarginOpenOrders` | GET | `margin/openOrders` | 1 |
| `spotPrivateGetMarginMaxTransferable` | GET | `margin/maxTransferable` | 1 |
| `spotPrivateGetMarginPriceIndex` | GET | `margin/priceIndex` | 1 |
| `spotPrivateGetMarginOrder` | GET | `margin/order` | 1 |
| `spotPrivateGetMarginIsolatedAccount` | GET | `margin/isolated/account` | 1 |
| `spotPrivateGetMarginMaxBorrowable` | GET | `margin/maxBorrowable` | 1 |
| `spotPrivateGetMarginRepay` | GET | `margin/repay` | 1 |
| `spotPrivateGetMarginIsolatedPair` | GET | `margin/isolated/pair` | 1 |
| `spotPrivateGetMarginForceLiquidationRec` | GET | `margin/forceLiquidationRec` | 1 |
| `spotPrivateGetMarginIsolatedMarginData` | GET | `margin/isolatedMarginData` | 1 |
| `spotPrivateGetMarginIsolatedMarginTier` | GET | `margin/isolatedMarginTier` | 1 |
| `spotPrivateGetRebateTaxQuery` | GET | `rebate/taxQuery` | 1 |
| `spotPrivateGetRebateDetail` | GET | `rebate/detail` | 1 |
| `spotPrivateGetRebateDetailKickback` | GET | `rebate/detail/kickback` | 1 |
| `spotPrivateGetRebateReferCode` | GET | `rebate/referCode` | 1 |
| `spotPrivateGetRebateAffiliateCommission` | GET | `rebate/affiliate/commission` | 1 |
| `spotPrivateGetRebateAffiliateWithdraw` | GET | `rebate/affiliate/withdraw` | 1 |
| `spotPrivateGetRebateAffiliateCommissionDetail` | GET | `rebate/affiliate/commission/detail` | 1 |
| `spotPrivateGetRebateAffiliateCampaign` | GET | `rebate/affiliate/campaign` | 1 |
| `spotPrivateGetRebateAffiliateReferral` | GET | `rebate/affiliate/referral` | 1 |
| `spotPrivateGetRebateAffiliateSubaffiliates` | GET | `rebate/affiliate/subaffiliates` | 1 |
| `spotPrivateGetMxDeductEnable` | GET | `mxDeduct/enable` | 1 |
| `spotPrivateGetUserDataStream` | GET | `userDataStream` | 1 |
| `spotPrivateGetSelfSymbols` | GET | `selfSymbols` | 1 |
| `spotPrivateGetAssetInternalTransferRecord` | GET | `asset/internal/transfer/record` | 10 |
| `spotPrivatePostOrder` | POST | `order` | 1 |
| `spotPrivatePostOrderTest` | POST | `order/test` | 1 |
| `spotPrivatePostSubAccountVirtualSubAccount` | POST | `sub-account/virtualSubAccount` | 1 |
| `spotPrivatePostSubAccountApiKey` | POST | `sub-account/apiKey` | 1 |
| `spotPrivatePostSubAccountFutures` | POST | `sub-account/futures` | 1 |
| `spotPrivatePostSubAccountMargin` | POST | `sub-account/margin` | 1 |
| `spotPrivatePostBatchOrders` | POST | `batchOrders` | 10 |
| `spotPrivatePostStrategyGroup` | POST | `strategy/group` | 20 |
| `spotPrivatePostCapitalWithdrawApply` | POST | `capital/withdraw/apply` | 1 |
| `spotPrivatePostCapitalWithdraw` | POST | `capital/withdraw` | 1 |
| `spotPrivatePostCapitalTransfer` | POST | `capital/transfer` | 1 |
| `spotPrivatePostCapitalTransferInternal` | POST | `capital/transfer/internal` | 1 |
| `spotPrivatePostCapitalDepositAddress` | POST | `capital/deposit/address` | 1 |
| `spotPrivatePostCapitalSubAccountUniversalTransfer` | POST | `capital/sub-account/universalTransfer` | 1 |
| `spotPrivatePostCapitalConvert` | POST | `capital/convert` | 10 |
| `spotPrivatePostMxDeductEnable` | POST | `mxDeduct/enable` | 1 |
| `spotPrivatePostUserDataStream` | POST | `userDataStream` | 1 |
| `spotPrivatePutUserDataStream` | PUT | `userDataStream` | 1 |
| `spotPrivateDeleteOrder` | DELETE | `order` | 1 |
| `spotPrivateDeleteOpenOrders` | DELETE | `openOrders` | 1 |
| `spotPrivateDeleteSubAccountApiKey` | DELETE | `sub-account/apiKey` | 1 |
| `spotPrivateDeleteStrategyGroup` | DELETE | `strategy/group` | 1 |
| `spotPrivateDeleteStrategyGroupUid` | DELETE | `strategy/group/uid` | 1 |
| `spotPrivateDeleteMarginOrder` | DELETE | `margin/order` | 1 |
| `spotPrivateDeleteMarginOpenOrders` | DELETE | `margin/openOrders` | 1 |
| `spotPrivateDeleteUserDataStream` | DELETE | `userDataStream` | 1 |
| `spotPrivateDeleteCapitalWithdraw` | DELETE | `capital/withdraw` | 1 |

## contract

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `contractPublicGetPing` | GET | `ping` | 2 |
| `contractPublicGetDetail` | GET | `detail` | 100 |
| `contractPublicGetSupportCurrencies` | GET | `support_currencies` | 2 |
| `contractPublicGetDepthSymbol` | GET | `depth/{symbol}` | 2 |
| `contractPublicGetDepthCommitsSymbolLimit` | GET | `depth_commits/{symbol}/{limit}` | 2 |
| `contractPublicGetIndexPriceSymbol` | GET | `index_price/{symbol}` | 2 |
| `contractPublicGetFairPriceSymbol` | GET | `fair_price/{symbol}` | 2 |
| `contractPublicGetFundingRateSymbol` | GET | `funding_rate/{symbol}` | 2 |
| `contractPublicGetKlineSymbol` | GET | `kline/{symbol}` | 2 |
| `contractPublicGetKlineIndexPriceSymbol` | GET | `kline/index_price/{symbol}` | 2 |
| `contractPublicGetKlineFairPriceSymbol` | GET | `kline/fair_price/{symbol}` | 2 |
| `contractPublicGetDealsSymbol` | GET | `deals/{symbol}` | 2 |
| `contractPublicGetTicker` | GET | `ticker` | 2 |
| `contractPublicGetRiskReverse` | GET | `risk_reverse` | 2 |
| `contractPublicGetRiskReverseHistory` | GET | `risk_reverse/history` | 2 |
| `contractPublicGetFundingRateHistory` | GET | `funding_rate/history` | 2 |
| `contractPrivateGetAccountAssets` | GET | `account/assets` | 2 |
| `contractPrivateGetAccountAssetCurrency` | GET | `account/asset/{currency}` | 2 |
| `contractPrivateGetAccountTransferRecord` | GET | `account/transfer_record` | 2 |
| `contractPrivateGetAccountProfitRateType` | GET | `account/profit_rate/{type}` | 2 |
| `contractPrivateGetAccountAssetAnalysisType` | GET | `account/asset/analysis/{type}` | 2 |
| `contractPrivateGetAccountFeeDeductConfigs` | GET | `account/feeDeductConfigs` | 2 |
| `contractPrivateGetAccountAssetAnalysisYesterdayPnl` | GET | `account/asset/analysis/yesterday_pnl` | 2 |
| `contractPrivateGetAccountAssetAnalysisTodayPnl` | GET | `account/asset/analysis/today_pnl` | 2 |
| `contractPrivateGetAccountConfigContractFeeDiscountConfig` | GET | `account/config/contractFeeDiscountConfig` | 2 |
| `contractPrivateGetOrderFeeDetails` | GET | `order/fee_details` | 2 |
| `contractPrivateGetAccountDiscountType` | GET | `account/discountType` | 2 |
| `contractPrivateGetAccountAssetAnalysisExport` | GET | `account/asset/analysis/export` | 2 |
| `contractPrivateGetAccountAssetBookOrderDealFeeTotal` | GET | `account/asset_book/order_deal_fee/total` | 2 |
| `contractPrivateGetAccountContractFeeRate` | GET | `account/contract/fee_rate` | 2 |
| `contractPrivateGetAccountContractZeroFeeRate` | GET | `account/contract/zero_fee_rate` | 2 |
| `contractPrivateGetPositionListHistoryPositions` | GET | `position/list/history_positions` | 2 |
| `contractPrivateGetPositionOpenPositions` | GET | `position/open_positions` | 2 |
| `contractPrivateGetPositionFundingRecords` | GET | `position/funding_records` | 2 |
| `contractPrivateGetPositionPositionMode` | GET | `position/position_mode` | 2 |
| `contractPrivateGetOrderListOpenOrdersSymbol` | GET | `order/list/open_orders/{symbol}` | 2 |
| `contractPrivateGetOrderListOpenOrders` | GET | `order/list/open_orders` | 2 |
| `contractPrivateGetOrderListHistoryOrders` | GET | `order/list/history_orders` | 2 |
| `contractPrivateGetOrderListOrderDealsV3` | GET | `order/list/order_deals/v3` | 2 |
| `contractPrivateGetOrderExternalSymbolExternalOid` | GET | `order/external/{symbol}/{external_oid}` | 2 |
| `contractPrivateGetOrderGetOrderId` | GET | `order/get/{order_id}` | 2 |
| `contractPrivateGetOrderBatchQuery` | GET | `order/batch_query` | 8 |
| `contractPrivateGetOrderDealDetailsOrderId` | GET | `order/deal_details/{order_id}` | 2 |
| `contractPrivateGetOrderListOrderDeals` | GET | `order/list/order_deals` | 2 |
| `contractPrivateGetOrderListCloseOrders` | GET | `order/list/close_orders` | 2 |
| `contractPrivateGetPlanorderListOrders` | GET | `planorder/list/orders` | 2 |
| `contractPrivateGetStoporderListOrders` | GET | `stoporder/list/orders` | 2 |
| `contractPrivateGetStoporderOpenOrders` | GET | `stoporder/open_orders` | 2 |
| `contractPrivateGetStoporderOrderDetailsStopOrderId` | GET | `stoporder/order_details/{stop_order_id}` | 2 |
| `contractPrivateGetAccountRiskLimit` | GET | `account/risk_limit` | 2 |
| `contractPrivateGetAccountTieredFeeRate` | GET | `account/tiered_fee_rate` | 2 |
| `contractPrivateGetPositionLeverage` | GET | `position/leverage` | 2 |
| `contractPrivateGetAccountTieredFeeRateV2` | GET | `account/tiered_fee_rate/v2` | 2 |
| `contractPrivateGetTrackorderListOrders` | GET | `trackorder/list/orders` | 2 |
| `contractPrivateGetMarketMakerSelfTradeBlacklist` | GET | `market_maker/self_trade/blacklist` | 2 |
| `contractPrivateGetMarketMakerSelfTradeBlacklistSearch` | GET | `market_maker/self_trade/blacklist/search` | 2 |
| `contractPrivatePostAccountAssetAnalysisV3` | POST | `account/asset/analysis/v3` | 2 |
| `contractPrivatePostAccountAssetAnalysisCalendarDailyV3` | POST | `account/asset/analysis/calendar/daily/v3` | 2 |
| `contractPrivatePostAccountAssetAnalysisCalendarMonthlyV3` | POST | `account/asset/analysis/calendar/monthly/v3` | 2 |
| `contractPrivatePostAccountAssetAnalysisRecentV3` | POST | `account/asset/analysis/recent/v3` | 2 |
| `contractPrivatePostPositionChangeMargin` | POST | `position/change_margin` | 2 |
| `contractPrivatePostPositionChangeAutoAddIm` | POST | `position/change_auto_add_im` | 2 |
| `contractPrivatePostPositionChangeLeverage` | POST | `position/change_leverage` | 2 |
| `contractPrivatePostPositionChangePositionMode` | POST | `position/change_position_mode` | 2 |
| `contractPrivatePostPositionReverse` | POST | `position/reverse` | 2 |
| `contractPrivatePostPositionCloseAll` | POST | `position/close_all` | 2 |
| `contractPrivatePostOrderCreate` | POST | `order/create` | 2 |
| `contractPrivatePostOrderSubmit` | POST | `order/submit` | 2 |
| `contractPrivatePostOrderSubmitBatch` | POST | `order/submit_batch` | 40 |
| `contractPrivatePostOrderChaseLimitOrder` | POST | `order/chase_limit_order` | 40 |
| `contractPrivatePostOrderChangeLimitOrder` | POST | `order/change_limit_order` | 40 |
| `contractPrivatePostOrderCancel` | POST | `order/cancel` | 2 |
| `contractPrivatePostOrderBatchCancelWithExternal` | POST | `order/batch_cancel_with_external` | 2 |
| `contractPrivatePostOrderCancelWithExternal` | POST | `order/cancel_with_external` | 2 |
| `contractPrivatePostOrderCancelAll` | POST | `order/cancel_all` | 2 |
| `contractPrivatePostOrderOpenOrderTotalCount` | POST | `order/open_order_total_count` | 2 |
| `contractPrivatePostOrderBatchQueryWithExternal` | POST | `order/batch_query_with_external` | 2 |
| `contractPrivatePostAccountChangeRiskLevel` | POST | `account/change_risk_level` | 2 |
| `contractPrivatePostPlanorderPlace` | POST | `planorder/place` | 2 |
| `contractPrivatePostPlanorderPlaceV2` | POST | `planorder/place/v2` | 2 |
| `contractPrivatePostPlanorderCancel` | POST | `planorder/cancel` | 2 |
| `contractPrivatePostPlanorderCancelAll` | POST | `planorder/cancel_all` | 2 |
| `contractPrivatePostPlanorderChangeStopOrder` | POST | `planorder/change_stop_order` | 2 |
| `contractPrivatePostStoporderPlace` | POST | `stoporder/place` | 2 |
| `contractPrivatePostStoporderCancel` | POST | `stoporder/cancel` | 2 |
| `contractPrivatePostStoporderCancelAll` | POST | `stoporder/cancel_all` | 2 |
| `contractPrivatePostStoporderChangePrice` | POST | `stoporder/change_price` | 2 |
| `contractPrivatePostStoporderChangePlanPrice` | POST | `stoporder/change_plan_price` | 2 |
| `contractPrivatePostTrackorderPlace` | POST | `trackorder/place` | 2 |
| `contractPrivatePostTrackorderCancel` | POST | `trackorder/cancel` | 2 |
| `contractPrivatePostTrackorderChangeOrder` | POST | `trackorder/change_order` | 2 |
| `contractPrivatePostMarketMakerSelfTradeBlacklistCreate` | POST | `market_maker/self_trade/blacklist/create` | 2 |
| `contractPrivatePostMarketMakerSelfTradeBlacklistUpdate` | POST | `market_maker/self_trade/blacklist/update` | 2 |
| `contractPrivatePostMarketMakerSelfTradeBlacklistDelete` | POST | `market_maker/self_trade/blacklist/delete` | 2 |

## spot2

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `spot2PublicGetMarketSymbols` | GET | `market/symbols` | 1 |
| `spot2PublicGetMarketCoinList` | GET | `market/coin/list` | 2 |
| `spot2PublicGetCommonTimestamp` | GET | `common/timestamp` | 1 |
| `spot2PublicGetCommonPing` | GET | `common/ping` | 2 |
| `spot2PublicGetMarketTicker` | GET | `market/ticker` | 1 |
| `spot2PublicGetMarketDepth` | GET | `market/depth` | 1 |
| `spot2PublicGetMarketDeals` | GET | `market/deals` | 1 |
| `spot2PublicGetMarketKline` | GET | `market/kline` | 1 |
| `spot2PublicGetMarketApiDefaultSymbols` | GET | `market/api_default_symbols` | 2 |
| `spot2PrivateGetAccountInfo` | GET | `account/info` | 1 |
| `spot2PrivateGetOrderOpenOrders` | GET | `order/open_orders` | 1 |
| `spot2PrivateGetOrderList` | GET | `order/list` | 1 |
| `spot2PrivateGetOrderQuery` | GET | `order/query` | 1 |
| `spot2PrivateGetOrderDeals` | GET | `order/deals` | 1 |
| `spot2PrivateGetOrderDealDetail` | GET | `order/deal_detail` | 1 |
| `spot2PrivateGetAssetDepositAddressList` | GET | `asset/deposit/address/list` | 2 |
| `spot2PrivateGetAssetDepositList` | GET | `asset/deposit/list` | 2 |
| `spot2PrivateGetAssetAddressList` | GET | `asset/address/list` | 2 |
| `spot2PrivateGetAssetWithdrawList` | GET | `asset/withdraw/list` | 2 |
| `spot2PrivateGetAssetInternalTransferRecord` | GET | `asset/internal/transfer/record` | 10 |
| `spot2PrivateGetAccountBalance` | GET | `account/balance` | 10 |
| `spot2PrivateGetAssetInternalTransferInfo` | GET | `asset/internal/transfer/info` | 10 |
| `spot2PrivateGetMarketApiSymbols` | GET | `market/api_symbols` | 2 |
| `spot2PrivatePostOrderPlace` | POST | `order/place` | 1 |
| `spot2PrivatePostOrderPlaceBatch` | POST | `order/place_batch` | 1 |
| `spot2PrivatePostOrderAdvancedPlaceBatch` | POST | `order/advanced/place_batch` | 1 |
| `spot2PrivatePostAssetWithdraw` | POST | `asset/withdraw` | 2 |
| `spot2PrivatePostAssetInternalTransfer` | POST | `asset/internal/transfer` | 10 |
| `spot2PrivateDeleteOrderCancel` | DELETE | `order/cancel` | 1 |
| `spot2PrivateDeleteOrderCancelBySymbol` | DELETE | `order/cancel_by_symbol` | 1 |
| `spot2PrivateDeleteAssetWithdraw` | DELETE | `asset/withdraw` | 2 |

## broker

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `brokerPrivateGetSubAccountUniversalTransfer` | GET | `sub-account/universalTransfer` | 1 |
| `brokerPrivateGetSubAccountList` | GET | `sub-account/list` | 1 |
| `brokerPrivateGetSubAccountStatus` | GET | `sub-account/status` | 1 |
| `brokerPrivateGetSubAccountApiKey` | GET | `sub-account/apiKey` | 1 |
| `brokerPrivateGetCapitalDepositSubAddress` | GET | `capital/deposit/subAddress` | 1 |
| `brokerPrivateGetCapitalDepositSubHisrec` | GET | `capital/deposit/subHisrec` | 1 |
| `brokerPrivateGetCapitalDepositSubHisrecGetall` | GET | `capital/deposit/subHisrec/getall` | 1 |
| `brokerPrivateGetRebateTaxQuery` | GET | `rebate/taxQuery` | 1 |
| `brokerPrivatePostSubAccountVirtualSubAccount` | POST | `sub-account/virtualSubAccount` | 1 |
| `brokerPrivatePostSubAccountApiKey` | POST | `sub-account/apiKey` | 1 |
| `brokerPrivatePostCapitalDepositSubAddress` | POST | `capital/deposit/subAddress` | 1 |
| `brokerPrivatePostCapitalWithdrawApply` | POST | `capital/withdraw/apply` | 1 |
| `brokerPrivatePostSubAccountUniversalTransfer` | POST | `sub-account/universalTransfer` | 1 |
| `brokerPrivatePostSubAccountFutures` | POST | `sub-account/futures` | 1 |
| `brokerPrivateDeleteSubAccountApiKey` | DELETE | `sub-account/apiKey` | 1 |

