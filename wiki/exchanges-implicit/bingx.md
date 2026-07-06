Every endpoint in `bingx`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bingx) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `fundV1PrivateGetAccountBalance`); the snake_case alias (`fund_v1_private_get_account_balance`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`FundV1PrivateGetAccountBalance`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bingx = new ccxt.bingx ();
const response = await bingx.fundV1PrivateGetAccountBalance (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bingx = new ccxt.bingx ();
const response = await bingx.fundV1PrivateGetAccountBalance (params);
```

#### **Python**

```python
import ccxt
bingx = ccxt.bingx()
response = bingx.fund_v1_private_get_account_balance(params)
```

#### **PHP**

```php
$bingx = new \ccxt\bingx();
$response = $bingx->fund_v1_private_get_account_balance($params);
```

#### **C#**

```csharp
using ccxt;
var bingx = new Bingx();
var response = await bingx.fundV1PrivateGetAccountBalance(parameters);
```

#### **Go**

```go
bingx := ccxt.NewBingx(nil)
response := <-bingx.FundV1PrivateGetAccountBalance(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bingx API documentation:** [bingx-api.github.io](https://bingx-api.github.io/docs/)

> 187 implicit endpoints across 12 access groups.

## fund

**Base URL**: `https://open-api.{hostname}/openApi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `fundV1PrivateGetAccountBalance` | GET | `account/balance` | 1 |

## spot

**Base URL**: `https://open-api.{hostname}/openApi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `spotV1PublicGetServerTime` | GET | `server/time` | 1 |
| `spotV1PublicGetCommonSymbols` | GET | `common/symbols` | 1 |
| `spotV1PublicGetMarketTrades` | GET | `market/trades` | 1 |
| `spotV1PublicGetMarketDepth` | GET | `market/depth` | 1 |
| `spotV1PublicGetMarketKline` | GET | `market/kline` | 1 |
| `spotV1PublicGetTicker24hr` | GET | `ticker/24hr` | 1 |
| `spotV1PublicGetTickerPrice` | GET | `ticker/price` | 1 |
| `spotV1PublicGetTickerBookTicker` | GET | `ticker/bookTicker` | 1 |
| `spotV1PrivateGetTradeQuery` | GET | `trade/query` | 1 |
| `spotV1PrivateGetTradeOpenOrders` | GET | `trade/openOrders` | 1 |
| `spotV1PrivateGetTradeHistoryOrders` | GET | `trade/historyOrders` | 1 |
| `spotV1PrivateGetTradeMyTrades` | GET | `trade/myTrades` | 2 |
| `spotV1PrivateGetUserCommissionRate` | GET | `user/commissionRate` | 5 |
| `spotV1PrivateGetAccountBalance` | GET | `account/balance` | 2 |
| `spotV1PrivateGetOcoOrderList` | GET | `oco/orderList` | 5 |
| `spotV1PrivateGetOcoOpenOrderList` | GET | `oco/openOrderList` | 5 |
| `spotV1PrivateGetOcoHistoryOrderList` | GET | `oco/historyOrderList` | 5 |
| `spotV1PrivatePostTradeOrder` | POST | `trade/order` | 2 |
| `spotV1PrivatePostTradeCancel` | POST | `trade/cancel` | 2 |
| `spotV1PrivatePostTradeBatchOrders` | POST | `trade/batchOrders` | 5 |
| `spotV1PrivatePostTradeOrderCancelReplace` | POST | `trade/order/cancelReplace` | 5 |
| `spotV1PrivatePostTradeCancelOrders` | POST | `trade/cancelOrders` | 5 |
| `spotV1PrivatePostTradeCancelOpenOrders` | POST | `trade/cancelOpenOrders` | 5 |
| `spotV1PrivatePostTradeCancelAllAfter` | POST | `trade/cancelAllAfter` | 5 |
| `spotV1PrivatePostOcoOrder` | POST | `oco/order` | 5 |
| `spotV1PrivatePostOcoCancel` | POST | `oco/cancel` | 5 |
| `spotV2PublicGetMarketDepth` | GET | `market/depth` | 1 |
| `spotV2PublicGetMarketKline` | GET | `market/kline` | 1 |
| `spotV2PublicGetTickerPrice` | GET | `ticker/price` | 1 |
| `spotV3PrivateGetGetAssetTransfer` | GET | `get/asset/transfer` | 1 |
| `spotV3PrivateGetAssetTransfer` | GET | `asset/transfer` | 1 |
| `spotV3PrivateGetCapitalDepositHisrec` | GET | `capital/deposit/hisrec` | 1 |
| `spotV3PrivateGetCapitalWithdrawHistory` | GET | `capital/withdraw/history` | 1 |
| `spotV3PrivatePostPostAssetTransfer` | POST | `post/asset/transfer` | 5 |

## swap

**Base URL**: `https://open-api.{hostname}/openApi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `swapV1PublicGetTickerPrice` | GET | `ticker/price` | 1 |
| `swapV1PublicGetMarketHistoricalTrades` | GET | `market/historicalTrades` | 1 |
| `swapV1PublicGetMarketMarkPriceKlines` | GET | `market/markPriceKlines` | 1 |
| `swapV1PublicGetTradeMultiAssetsRules` | GET | `trade/multiAssetsRules` | 1 |
| `swapV1PublicGetTradingRules` | GET | `tradingRules` | 1 |
| `swapV1PrivateGetPositionSideDual` | GET | `positionSide/dual` | 5 |
| `swapV1PrivateGetTradeBatchCancelReplace` | GET | `trade/batchCancelReplace` | 5 |
| `swapV1PrivateGetTradeFullOrder` | GET | `trade/fullOrder` | 2 |
| `swapV1PrivateGetMaintMarginRatio` | GET | `maintMarginRatio` | 2 |
| `swapV1PrivateGetTradePositionHistory` | GET | `trade/positionHistory` | 2 |
| `swapV1PrivateGetPositionMarginHistory` | GET | `positionMargin/history` | 2 |
| `swapV1PrivateGetTwapOpenOrders` | GET | `twap/openOrders` | 5 |
| `swapV1PrivateGetTwapHistoryOrders` | GET | `twap/historyOrders` | 5 |
| `swapV1PrivateGetTwapOrderDetail` | GET | `twap/orderDetail` | 5 |
| `swapV1PrivateGetTradeAssetMode` | GET | `trade/assetMode` | 5 |
| `swapV1PrivateGetUserMarginAssets` | GET | `user/marginAssets` | 5 |
| `swapV1PrivatePostTradeAmend` | POST | `trade/amend` | 2 |
| `swapV1PrivatePostTradeCancelReplace` | POST | `trade/cancelReplace` | 2 |
| `swapV1PrivatePostPositionSideDual` | POST | `positionSide/dual` | 5 |
| `swapV1PrivatePostTradeBatchCancelReplace` | POST | `trade/batchCancelReplace` | 5 |
| `swapV1PrivatePostTradeClosePosition` | POST | `trade/closePosition` | 2 |
| `swapV1PrivatePostTradeGetVst` | POST | `trade/getVst` | 5 |
| `swapV1PrivatePostTwapOrder` | POST | `twap/order` | 5 |
| `swapV1PrivatePostTwapCancelOrder` | POST | `twap/cancelOrder` | 5 |
| `swapV1PrivatePostTradeAssetMode` | POST | `trade/assetMode` | 5 |
| `swapV1PrivatePostTradeReverse` | POST | `trade/reverse` | 5 |
| `swapV1PrivatePostTradeAutoAddMargin` | POST | `trade/autoAddMargin` | 5 |
| `swapV2PublicGetServerTime` | GET | `server/time` | 1 |
| `swapV2PublicGetQuoteContracts` | GET | `quote/contracts` | 1 |
| `swapV2PublicGetQuotePrice` | GET | `quote/price` | 1 |
| `swapV2PublicGetQuoteDepth` | GET | `quote/depth` | 1 |
| `swapV2PublicGetQuoteTrades` | GET | `quote/trades` | 1 |
| `swapV2PublicGetQuotePremiumIndex` | GET | `quote/premiumIndex` | 1 |
| `swapV2PublicGetQuoteFundingRate` | GET | `quote/fundingRate` | 1 |
| `swapV2PublicGetQuoteKlines` | GET | `quote/klines` | 1 |
| `swapV2PublicGetQuoteOpenInterest` | GET | `quote/openInterest` | 1 |
| `swapV2PublicGetQuoteTicker` | GET | `quote/ticker` | 1 |
| `swapV2PublicGetQuoteBookTicker` | GET | `quote/bookTicker` | 1 |
| `swapV2PrivateGetUserBalance` | GET | `user/balance` | 2 |
| `swapV2PrivateGetUserPositions` | GET | `user/positions` | 2 |
| `swapV2PrivateGetUserIncome` | GET | `user/income` | 2 |
| `swapV2PrivateGetTradeOpenOrders` | GET | `trade/openOrders` | 2 |
| `swapV2PrivateGetTradeOpenOrder` | GET | `trade/openOrder` | 2 |
| `swapV2PrivateGetTradeOrder` | GET | `trade/order` | 2 |
| `swapV2PrivateGetTradeMarginType` | GET | `trade/marginType` | 5 |
| `swapV2PrivateGetTradeLeverage` | GET | `trade/leverage` | 2 |
| `swapV2PrivateGetTradeForceOrders` | GET | `trade/forceOrders` | 1 |
| `swapV2PrivateGetTradeAllOrders` | GET | `trade/allOrders` | 2 |
| `swapV2PrivateGetTradeAllFillOrders` | GET | `trade/allFillOrders` | 2 |
| `swapV2PrivateGetTradeFillHistory` | GET | `trade/fillHistory` | 2 |
| `swapV2PrivateGetUserIncomeExport` | GET | `user/income/export` | 2 |
| `swapV2PrivateGetUserCommissionRate` | GET | `user/commissionRate` | 2 |
| `swapV2PrivateGetQuoteBookTicker` | GET | `quote/bookTicker` | 1 |
| `swapV2PrivatePostTradeGetVst` | POST | `trade/getVst` | 5 |
| `swapV2PrivatePostTradeOrder` | POST | `trade/order` | 2 |
| `swapV2PrivatePostTradeBatchOrders` | POST | `trade/batchOrders` | 2 |
| `swapV2PrivatePostTradeCloseAllPositions` | POST | `trade/closeAllPositions` | 2 |
| `swapV2PrivatePostTradeCancelAllAfter` | POST | `trade/cancelAllAfter` | 5 |
| `swapV2PrivatePostTradeMarginType` | POST | `trade/marginType` | 5 |
| `swapV2PrivatePostTradeLeverage` | POST | `trade/leverage` | 5 |
| `swapV2PrivatePostTradePositionMargin` | POST | `trade/positionMargin` | 5 |
| `swapV2PrivatePostTradeOrderTest` | POST | `trade/order/test` | 2 |
| `swapV2PrivateDeleteTradeOrder` | DELETE | `trade/order` | 2 |
| `swapV2PrivateDeleteTradeBatchOrders` | DELETE | `trade/batchOrders` | 2 |
| `swapV2PrivateDeleteTradeAllOpenOrders` | DELETE | `trade/allOpenOrders` | 2 |
| `swapV3PublicGetQuoteKlines` | GET | `quote/klines` | 1 |
| `swapV3PrivateGetUserBalance` | GET | `user/balance` | 2 |

## cswap

**Base URL**: `https://open-api.{hostname}/openApi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `cswapV1PublicGetMarketContracts` | GET | `market/contracts` | 1 |
| `cswapV1PublicGetMarketPremiumIndex` | GET | `market/premiumIndex` | 1 |
| `cswapV1PublicGetMarketOpenInterest` | GET | `market/openInterest` | 1 |
| `cswapV1PublicGetMarketKlines` | GET | `market/klines` | 1 |
| `cswapV1PublicGetMarketDepth` | GET | `market/depth` | 1 |
| `cswapV1PublicGetMarketTicker` | GET | `market/ticker` | 1 |
| `cswapV1PrivateGetTradeLeverage` | GET | `trade/leverage` | 2 |
| `cswapV1PrivateGetTradeForceOrders` | GET | `trade/forceOrders` | 2 |
| `cswapV1PrivateGetTradeAllFillOrders` | GET | `trade/allFillOrders` | 2 |
| `cswapV1PrivateGetTradeOpenOrders` | GET | `trade/openOrders` | 2 |
| `cswapV1PrivateGetTradeOrderDetail` | GET | `trade/orderDetail` | 2 |
| `cswapV1PrivateGetTradeOrderHistory` | GET | `trade/orderHistory` | 2 |
| `cswapV1PrivateGetTradeMarginType` | GET | `trade/marginType` | 2 |
| `cswapV1PrivateGetUserCommissionRate` | GET | `user/commissionRate` | 2 |
| `cswapV1PrivateGetUserPositions` | GET | `user/positions` | 2 |
| `cswapV1PrivateGetUserBalance` | GET | `user/balance` | 2 |
| `cswapV1PrivatePostTradeOrder` | POST | `trade/order` | 2 |
| `cswapV1PrivatePostTradeLeverage` | POST | `trade/leverage` | 2 |
| `cswapV1PrivatePostTradeAllOpenOrders` | POST | `trade/allOpenOrders` | 2 |
| `cswapV1PrivatePostTradeCloseAllPositions` | POST | `trade/closeAllPositions` | 2 |
| `cswapV1PrivatePostTradeMarginType` | POST | `trade/marginType` | 2 |
| `cswapV1PrivatePostTradePositionMargin` | POST | `trade/positionMargin` | 2 |
| `cswapV1PrivateDeleteTradeAllOpenOrders` | DELETE | `trade/allOpenOrders` | 2 |
| `cswapV1PrivateDeleteTradeCancelOrder` | DELETE | `trade/cancelOrder` | 2 |

## contract

**Base URL**: `https://open-api.{hostname}/openApi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `contractV1PrivateGetAllPosition` | GET | `allPosition` | 2 |
| `contractV1PrivateGetAllOrders` | GET | `allOrders` | 2 |
| `contractV1PrivateGetBalance` | GET | `balance` | 2 |

## wallets

**Base URL**: `https://open-api.{hostname}/openApi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `walletsV1PrivateGetCapitalConfigGetall` | GET | `capital/config/getall` | 5 |
| `walletsV1PrivateGetCapitalDepositAddress` | GET | `capital/deposit/address` | 5 |
| `walletsV1PrivateGetCapitalInnerTransferRecords` | GET | `capital/innerTransfer/records` | 1 |
| `walletsV1PrivateGetCapitalSubAccountDepositAddress` | GET | `capital/subAccount/deposit/address` | 5 |
| `walletsV1PrivateGetCapitalDepositSubHisrec` | GET | `capital/deposit/subHisrec` | 2 |
| `walletsV1PrivateGetCapitalSubAccountInnerTransferRecords` | GET | `capital/subAccount/innerTransfer/records` | 1 |
| `walletsV1PrivateGetCapitalDepositRiskRecords` | GET | `capital/deposit/riskRecords` | 5 |
| `walletsV1PrivatePostCapitalWithdrawApply` | POST | `capital/withdraw/apply` | 5 |
| `walletsV1PrivatePostCapitalInnerTransferApply` | POST | `capital/innerTransfer/apply` | 5 |
| `walletsV1PrivatePostCapitalSubAccountInnerTransferApply` | POST | `capital/subAccountInnerTransfer/apply` | 2 |
| `walletsV1PrivatePostCapitalDepositCreateSubAddress` | POST | `capital/deposit/createSubAddress` | 2 |

## subAccount

**Base URL**: `https://open-api.{hostname}/openApi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `subAccountV1PrivateGetList` | GET | `list` | 10 |
| `subAccountV1PrivateGetAssets` | GET | `assets` | 2 |
| `subAccountV1PrivateGetAllAccountBalance` | GET | `allAccountBalance` | 2 |
| `subAccountV1PrivatePostCreate` | POST | `create` | 10 |
| `subAccountV1PrivatePostApiKeyCreate` | POST | `apiKey/create` | 2 |
| `subAccountV1PrivatePostApiKeyEdit` | POST | `apiKey/edit` | 2 |
| `subAccountV1PrivatePostApiKeyDel` | POST | `apiKey/del` | 2 |
| `subAccountV1PrivatePostUpdateStatus` | POST | `updateStatus` | 10 |

## account

**Base URL**: `https://open-api.{hostname}/openApi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `accountV1PrivateGetUid` | GET | `uid` | 1 |
| `accountV1PrivateGetApiKeyQuery` | GET | `apiKey/query` | 2 |
| `accountV1PrivateGetAccountApiPermissions` | GET | `account/apiPermissions` | 5 |
| `accountV1PrivateGetAllAccountBalance` | GET | `allAccountBalance` | 2 |
| `accountV1PrivatePostInnerTransferAuthorizeSubAccount` | POST | `innerTransfer/authorizeSubAccount` | 1 |
| `accountTransferV1PrivateGetSubAccountAssetTransferHistory` | GET | `subAccount/asset/transferHistory` | 1 |
| `accountTransferV1PrivatePostSubAccountTransferAssetSupportCoins` | POST | `subAccount/transferAsset/supportCoins` | 1 |
| `accountTransferV1PrivatePostSubAccountTransferAsset` | POST | `subAccount/transferAsset` | 1 |

## user

**Base URL**: `https://open-api.{hostname}/openApi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `userAuthPrivatePostUserDataStream` | POST | `userDataStream` | 2 |
| `userAuthPrivatePutUserDataStream` | PUT | `userDataStream` | 2 |
| `userAuthPrivateDeleteUserDataStream` | DELETE | `userDataStream` | 2 |

## copyTrading

**Base URL**: `https://open-api.{hostname}/openApi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `copyTradingV1PrivateGetSwapTraceCurrentTrack` | GET | `swap/trace/currentTrack` | 2 |
| `copyTradingV1PrivateGetPFuturesTraderDetail` | GET | `PFutures/traderDetail` | 2 |
| `copyTradingV1PrivateGetPFuturesProfitHistorySummarys` | GET | `PFutures/profitHistorySummarys` | 2 |
| `copyTradingV1PrivateGetPFuturesProfitDetail` | GET | `PFutures/profitDetail` | 2 |
| `copyTradingV1PrivateGetPFuturesTradingPairs` | GET | `PFutures/tradingPairs` | 2 |
| `copyTradingV1PrivateGetSpotTraderDetail` | GET | `spot/traderDetail` | 2 |
| `copyTradingV1PrivateGetSpotProfitHistorySummarys` | GET | `spot/profitHistorySummarys` | 2 |
| `copyTradingV1PrivateGetSpotProfitDetail` | GET | `spot/profitDetail` | 2 |
| `copyTradingV1PrivateGetSpotHistoryOrder` | GET | `spot/historyOrder` | 2 |
| `copyTradingV1PrivatePostSwapTraceCloseTrackOrder` | POST | `swap/trace/closeTrackOrder` | 2 |
| `copyTradingV1PrivatePostSwapTraceSetTPSL` | POST | `swap/trace/setTPSL` | 2 |
| `copyTradingV1PrivatePostPFuturesSetCommission` | POST | `PFutures/setCommission` | 2 |
| `copyTradingV1PrivatePostSpotTraderSellOrder` | POST | `spot/trader/sellOrder` | 10 |

## api

**Base URL**: `https://open-api.{hostname}/openApi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `apiV3PrivateGetAssetTransfer` | GET | `asset/transfer` | 1 |
| `apiV3PrivateGetAssetTransferRecord` | GET | `asset/transferRecord` | 5 |
| `apiV3PrivateGetCapitalDepositHisrec` | GET | `capital/deposit/hisrec` | 1 |
| `apiV3PrivateGetCapitalWithdrawHistory` | GET | `capital/withdraw/history` | 1 |
| `apiV3PrivatePostPostAssetTransfer` | POST | `post/asset/transfer` | 1 |
| `apiAssetV1PrivatePostTransfer` | POST | `transfer` | 5 |
| `apiAssetV1PublicGetTransferSupportCoins` | GET | `transfer/supportCoins` | 5 |

## agent

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `agentV1PrivateGetAccountInviteAccountList` | GET | `account/inviteAccountList` | 5 |
| `agentV1PrivateGetRewardCommissionDataList` | GET | `reward/commissionDataList` | 5 |
| `agentV1PrivateGetAccountInviteRelationCheck` | GET | `account/inviteRelationCheck` | 5 |
| `agentV1PrivateGetAssetDepositDetailList` | GET | `asset/depositDetailList` | 5 |
| `agentV1PrivateGetRewardThirdCommissionDataList` | GET | `reward/third/commissionDataList` | 5 |
| `agentV1PrivateGetAssetPartnerData` | GET | `asset/partnerData` | 5 |
| `agentV1PrivateGetCommissionDataListReferralCode` | GET | `commissionDataList/referralCode` | 5 |
| `agentV1PrivateGetAccountSuperiorCheck` | GET | `account/superiorCheck` | 5 |

