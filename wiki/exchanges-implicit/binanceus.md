Every endpoint in `binanceus`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/binanceus) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `sapiGetCopyTradingFuturesUserStatus`); the snake_case alias (`sapi_get_copytrading_futures_userstatus`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`SapiGetCopyTradingFuturesUserStatus`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const binanceus = new ccxt.binanceus ();
const response = await binanceus.sapiGetCopyTradingFuturesUserStatus (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const binanceus = new ccxt.binanceus ();
const response = await binanceus.sapiGetCopyTradingFuturesUserStatus (params);
```

#### **Python**

```python
import ccxt
binanceus = ccxt.binanceus()
response = binanceus.sapi_get_copytrading_futures_userstatus(params)
```

#### **PHP**

```php
$binanceus = new \ccxt\binanceus();
$response = $binanceus->sapi_get_copytrading_futures_userstatus($params);
```

#### **C#**

```csharp
using ccxt;
var binanceus = new Binanceus();
var response = await binanceus.sapiGetCopyTradingFuturesUserStatus(parameters);
```

#### **Go**

```go
binanceus := ccxt.NewBinanceus(nil)
response := <-binanceus.SapiGetCopyTradingFuturesUserStatus(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official binanceus API documentation:** [github.com](https://github.com/binance-us/binance-official-api-docs)

> 844 implicit endpoints across 20 access groups.

## sapi

**Base URL**: `https://api.binance.us/sapi/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `sapiGetCopyTradingFuturesUserStatus` | GET | `copyTrading/futures/userStatus` | 2 |
| `sapiGetCopyTradingFuturesLeadSymbol` | GET | `copyTrading/futures/leadSymbol` | 2 |
| `sapiGetSystemStatus` | GET | `system/status` | 1 |
| `sapiGetAccountSnapshot` | GET | `accountSnapshot` | 240 |
| `sapiGetAccountInfo` | GET | `account/info` | 0.1 |
| `sapiGetMarginAsset` | GET | `margin/asset` | 1 |
| `sapiGetMarginPair` | GET | `margin/pair` | 1 |
| `sapiGetMarginAllAssets` | GET | `margin/allAssets` | 0.1 |
| `sapiGetMarginAllPairs` | GET | `margin/allPairs` | 0.1 |
| `sapiGetMarginPriceIndex` | GET | `margin/priceIndex` | 1 |
| `sapiGetSpotDelistSchedule` | GET | `spot/delist-schedule` | 10 |
| `sapiGetAssetAssetDividend` | GET | `asset/assetDividend` | 1 |
| `sapiGetAssetDribblet` | GET | `asset/dribblet` | 0.1 |
| `sapiGetAssetTransfer` | GET | `asset/transfer` | 0.1 |
| `sapiGetAssetAssetDetail` | GET | `asset/assetDetail` | 0.1 |
| `sapiGetAssetTradeFee` | GET | `asset/tradeFee` | 0.1 |
| `sapiGetAssetLedgerTransferCloudMiningQueryByPage` | GET | `asset/ledger-transfer/cloud-mining/queryByPage` | 4.0002 |
| `sapiGetAssetConvertTransferQueryByPage` | GET | `asset/convert-transfer/queryByPage` | 0.033335 |
| `sapiGetAssetWalletBalance` | GET | `asset/wallet/balance` | 6 |
| `sapiGetAssetCustodyTransferHistory` | GET | `asset/custody/transfer-history` | 6 |
| `sapiGetMarginBorrowRepay` | GET | `margin/borrow-repay` | 1 |
| `sapiGetMarginLoan` | GET | `margin/loan` | 1 |
| `sapiGetMarginRepay` | GET | `margin/repay` | 1 |
| `sapiGetMarginAccount` | GET | `margin/account` | 1 |
| `sapiGetMarginTransfer` | GET | `margin/transfer` | 0.1 |
| `sapiGetMarginInterestHistory` | GET | `margin/interestHistory` | 0.1 |
| `sapiGetMarginForceLiquidationRec` | GET | `margin/forceLiquidationRec` | 0.1 |
| `sapiGetMarginOrder` | GET | `margin/order` | 1 |
| `sapiGetMarginOpenOrders` | GET | `margin/openOrders` | 1 |
| `sapiGetMarginAllOrders` | GET | `margin/allOrders` | 20 |
| `sapiGetMarginMyTrades` | GET | `margin/myTrades` | 1 |
| `sapiGetMarginMaxBorrowable` | GET | `margin/maxBorrowable` | 5 |
| `sapiGetMarginMaxTransferable` | GET | `margin/maxTransferable` | 5 |
| `sapiGetMarginTradeCoeff` | GET | `margin/tradeCoeff` | 1 |
| `sapiGetMarginIsolatedTransfer` | GET | `margin/isolated/transfer` | 0.1 |
| `sapiGetMarginIsolatedAccount` | GET | `margin/isolated/account` | 1 |
| `sapiGetMarginIsolatedPair` | GET | `margin/isolated/pair` | 1 |
| `sapiGetMarginIsolatedAllPairs` | GET | `margin/isolated/allPairs` | 1 |
| `sapiGetMarginIsolatedAccountLimit` | GET | `margin/isolated/accountLimit` | 0.1 |
| `sapiGetMarginInterestRateHistory` | GET | `margin/interestRateHistory` | 0.1 |
| `sapiGetMarginOrderList` | GET | `margin/orderList` | 1 |
| `sapiGetMarginAllOrderList` | GET | `margin/allOrderList` | 20 |
| `sapiGetMarginOpenOrderList` | GET | `margin/openOrderList` | 1 |
| `sapiGetMarginCrossMarginData` | GET | `margin/crossMarginData` | 0.1 |
| `sapiGetMarginIsolatedMarginData` | GET | `margin/isolatedMarginData` | 0.1 |
| `sapiGetMarginIsolatedMarginTier` | GET | `margin/isolatedMarginTier` | 0.1 |
| `sapiGetMarginRateLimitOrder` | GET | `margin/rateLimit/order` | 2 |
| `sapiGetMarginDribblet` | GET | `margin/dribblet` | 0.1 |
| `sapiGetMarginDust` | GET | `margin/dust` | 20.001 |
| `sapiGetMarginCrossMarginCollateralRatio` | GET | `margin/crossMarginCollateralRatio` | 10 |
| `sapiGetMarginExchangeSmallLiability` | GET | `margin/exchange-small-liability` | 0.6667 |
| `sapiGetMarginExchangeSmallLiabilityHistory` | GET | `margin/exchange-small-liability-history` | 0.6667 |
| `sapiGetMarginNextHourlyInterestRate` | GET | `margin/next-hourly-interest-rate` | 0.6667 |
| `sapiGetMarginCapitalFlow` | GET | `margin/capital-flow` | 10 |
| `sapiGetMarginDelistSchedule` | GET | `margin/delist-schedule` | 10 |
| `sapiGetMarginAvailableInventory` | GET | `margin/available-inventory` | 0.3334 |
| `sapiGetMarginLeverageBracket` | GET | `margin/leverageBracket` | 0.1 |
| `sapiGetLoanVipLoanableData` | GET | `loan/vip/loanable/data` | 40 |
| `sapiGetLoanVipCollateralData` | GET | `loan/vip/collateral/data` | 40 |
| `sapiGetLoanVipRequestData` | GET | `loan/vip/request/data` | 2.6668 |
| `sapiGetLoanVipRequestInterestRate` | GET | `loan/vip/request/interestRate` | 2.6668 |
| `sapiGetLoanIncome` | GET | `loan/income` | 40.002 |
| `sapiGetLoanOngoingOrders` | GET | `loan/ongoing/orders` | 40 |
| `sapiGetLoanLtvAdjustmentHistory` | GET | `loan/ltv/adjustment/history` | 40 |
| `sapiGetLoanBorrowHistory` | GET | `loan/borrow/history` | 40 |
| `sapiGetLoanRepayHistory` | GET | `loan/repay/history` | 40 |
| `sapiGetLoanLoanableData` | GET | `loan/loanable/data` | 40 |
| `sapiGetLoanCollateralData` | GET | `loan/collateral/data` | 40 |
| `sapiGetLoanRepayCollateralRate` | GET | `loan/repay/collateral/rate` | 600 |
| `sapiGetLoanFlexibleOngoingOrders` | GET | `loan/flexible/ongoing/orders` | 30 |
| `sapiGetLoanFlexibleBorrowHistory` | GET | `loan/flexible/borrow/history` | 40 |
| `sapiGetLoanFlexibleRepayHistory` | GET | `loan/flexible/repay/history` | 40 |
| `sapiGetLoanFlexibleLtvAdjustmentHistory` | GET | `loan/flexible/ltv/adjustment/history` | 40 |
| `sapiGetLoanVipOngoingOrders` | GET | `loan/vip/ongoing/orders` | 40 |
| `sapiGetLoanVipRepayHistory` | GET | `loan/vip/repay/history` | 40 |
| `sapiGetLoanVipCollateralAccount` | GET | `loan/vip/collateral/account` | 600 |
| `sapiGetFiatOrders` | GET | `fiat/orders` | 600.03 |
| `sapiGetFiatPayments` | GET | `fiat/payments` | 0.1 |
| `sapiGetFuturesTransfer` | GET | `futures/transfer` | 1 |
| `sapiGetFuturesHistDataLink` | GET | `futures/histDataLink` | 0.1 |
| `sapiGetRebateTaxQuery` | GET | `rebate/taxQuery` | 80.004 |
| `sapiGetCapitalConfigGetall` | GET | `capital/config/getall` | 1 |
| `sapiGetCapitalDepositAddress` | GET | `capital/deposit/address` | 1 |
| `sapiGetCapitalDepositAddressList` | GET | `capital/deposit/address/list` | 1 |
| `sapiGetCapitalDepositHisrec` | GET | `capital/deposit/hisrec` | 1 |
| `sapiGetCapitalDepositSubAddress` | GET | `capital/deposit/subAddress` | 0.1 |
| `sapiGetCapitalDepositSubHisrec` | GET | `capital/deposit/subHisrec` | 0.1 |
| `sapiGetCapitalWithdrawHistory` | GET | `capital/withdraw/history` | 1 |
| `sapiGetCapitalWithdrawAddressList` | GET | `capital/withdraw/address/list` | 10 |
| `sapiGetCapitalContractConvertibleCoins` | GET | `capital/contract/convertible-coins` | 4.0002 |
| `sapiGetConvertTradeFlow` | GET | `convert/tradeFlow` | 20.001 |
| `sapiGetConvertExchangeInfo` | GET | `convert/exchangeInfo` | 50 |
| `sapiGetConvertAssetInfo` | GET | `convert/assetInfo` | 10 |
| `sapiGetConvertOrderStatus` | GET | `convert/orderStatus` | 0.6667 |
| `sapiGetConvertLimitQueryOpenOrders` | GET | `convert/limit/queryOpenOrders` | 20.001 |
| `sapiGetAccountStatus` | GET | `account/status` | 0.1 |
| `sapiGetAccountApiTradingStatus` | GET | `account/apiTradingStatus` | 0.1 |
| `sapiGetAccountApiRestrictionsIpRestriction` | GET | `account/apiRestrictions/ipRestriction` | 0.1 |
| `sapiGetBnbBurn` | GET | `bnbBurn` | 0.1 |
| `sapiGetSubAccountFuturesAccount` | GET | `sub-account/futures/account` | 1 |
| `sapiGetSubAccountFuturesAccountSummary` | GET | `sub-account/futures/accountSummary` | 0.1 |
| `sapiGetSubAccountFuturesPositionRisk` | GET | `sub-account/futures/positionRisk` | 1 |
| `sapiGetSubAccountFuturesInternalTransfer` | GET | `sub-account/futures/internalTransfer` | 0.1 |
| `sapiGetSubAccountList` | GET | `sub-account/list` | 0.1 |
| `sapiGetSubAccountMarginAccount` | GET | `sub-account/margin/account` | 1 |
| `sapiGetSubAccountMarginAccountSummary` | GET | `sub-account/margin/accountSummary` | 1 |
| `sapiGetSubAccountSpotSummary` | GET | `sub-account/spotSummary` | 1 |
| `sapiGetSubAccountStatus` | GET | `sub-account/status` | 1 |
| `sapiGetSubAccountSubTransferHistory` | GET | `sub-account/sub/transfer/history` | 0.1 |
| `sapiGetSubAccountTransferSubUserHistory` | GET | `sub-account/transfer/subUserHistory` | 0.1 |
| `sapiGetSubAccountUniversalTransfer` | GET | `sub-account/universalTransfer` | 0.1 |
| `sapiGetSubAccountApiRestrictionsIpRestrictionThirdPartyList` | GET | `sub-account/apiRestrictions/ipRestriction/thirdPartyList` | 1 |
| `sapiGetSubAccountTransactionStatistics` | GET | `sub-account/transaction-statistics` | 0.40002 |
| `sapiGetSubAccountSubAccountApiIpRestriction` | GET | `sub-account/subAccountApi/ipRestriction` | 20.001 |
| `sapiGetManagedSubaccountAsset` | GET | `managed-subaccount/asset` | 0.1 |
| `sapiGetManagedSubaccountAccountSnapshot` | GET | `managed-subaccount/accountSnapshot` | 240 |
| `sapiGetManagedSubaccountQueryTransLogForInvestor` | GET | `managed-subaccount/queryTransLogForInvestor` | 0.1 |
| `sapiGetManagedSubaccountQueryTransLogForTradeParent` | GET | `managed-subaccount/queryTransLogForTradeParent` | 0.40002 |
| `sapiGetManagedSubaccountFetchFutureAsset` | GET | `managed-subaccount/fetch-future-asset` | 0.40002 |
| `sapiGetManagedSubaccountMarginAsset` | GET | `managed-subaccount/marginAsset` | 0.1 |
| `sapiGetManagedSubaccountInfo` | GET | `managed-subaccount/info` | 0.40002 |
| `sapiGetManagedSubaccountDepositAddress` | GET | `managed-subaccount/deposit/address` | 0.006667 |
| `sapiGetManagedSubaccountQueryTransLog` | GET | `managed-subaccount/query-trans-log` | 0.40002 |
| `sapiGetLendingDailyProductList` | GET | `lending/daily/product/list` | 0.1 |
| `sapiGetLendingDailyUserLeftQuota` | GET | `lending/daily/userLeftQuota` | 0.1 |
| `sapiGetLendingDailyUserRedemptionQuota` | GET | `lending/daily/userRedemptionQuota` | 0.1 |
| `sapiGetLendingDailyTokenPosition` | GET | `lending/daily/token/position` | 0.1 |
| `sapiGetLendingUnionAccount` | GET | `lending/union/account` | 0.1 |
| `sapiGetLendingUnionPurchaseRecord` | GET | `lending/union/purchaseRecord` | 0.1 |
| `sapiGetLendingUnionRedemptionRecord` | GET | `lending/union/redemptionRecord` | 0.1 |
| `sapiGetLendingUnionInterestHistory` | GET | `lending/union/interestHistory` | 0.1 |
| `sapiGetLendingProjectList` | GET | `lending/project/list` | 0.1 |
| `sapiGetLendingProjectPositionList` | GET | `lending/project/position/list` | 0.1 |
| `sapiGetEthStakingEthHistoryStakingHistory` | GET | `eth-staking/eth/history/stakingHistory` | 15 |
| `sapiGetEthStakingEthHistoryRedemptionHistory` | GET | `eth-staking/eth/history/redemptionHistory` | 15 |
| `sapiGetEthStakingEthHistoryRewardsHistory` | GET | `eth-staking/eth/history/rewardsHistory` | 15 |
| `sapiGetEthStakingEthQuota` | GET | `eth-staking/eth/quota` | 15 |
| `sapiGetEthStakingEthHistoryRateHistory` | GET | `eth-staking/eth/history/rateHistory` | 15 |
| `sapiGetEthStakingAccount` | GET | `eth-staking/account` | 15 |
| `sapiGetEthStakingWbethHistoryWrapHistory` | GET | `eth-staking/wbeth/history/wrapHistory` | 15 |
| `sapiGetEthStakingWbethHistoryUnwrapHistory` | GET | `eth-staking/wbeth/history/unwrapHistory` | 15 |
| `sapiGetEthStakingEthHistoryWbethRewardsHistory` | GET | `eth-staking/eth/history/wbethRewardsHistory` | 15 |
| `sapiGetSolStakingSolHistoryStakingHistory` | GET | `sol-staking/sol/history/stakingHistory` | 15 |
| `sapiGetSolStakingSolHistoryRedemptionHistory` | GET | `sol-staking/sol/history/redemptionHistory` | 15 |
| `sapiGetSolStakingSolHistoryBnsolRewardsHistory` | GET | `sol-staking/sol/history/bnsolRewardsHistory` | 15 |
| `sapiGetSolStakingSolHistoryRateHistory` | GET | `sol-staking/sol/history/rateHistory` | 15 |
| `sapiGetSolStakingAccount` | GET | `sol-staking/account` | 15 |
| `sapiGetSolStakingSolQuota` | GET | `sol-staking/sol/quota` | 15 |
| `sapiGetMiningPubAlgoList` | GET | `mining/pub/algoList` | 0.1 |
| `sapiGetMiningPubCoinList` | GET | `mining/pub/coinList` | 0.1 |
| `sapiGetMiningWorkerDetail` | GET | `mining/worker/detail` | 0.5 |
| `sapiGetMiningWorkerList` | GET | `mining/worker/list` | 0.5 |
| `sapiGetMiningPaymentList` | GET | `mining/payment/list` | 0.5 |
| `sapiGetMiningStatisticsUserStatus` | GET | `mining/statistics/user/status` | 0.5 |
| `sapiGetMiningStatisticsUserList` | GET | `mining/statistics/user/list` | 0.5 |
| `sapiGetMiningPaymentUid` | GET | `mining/payment/uid` | 0.5 |
| `sapiGetBswapPools` | GET | `bswap/pools` | 0.1 |
| `sapiGetBswapLiquidity` | GET | `bswap/liquidity` | 0.1 |
| `sapiGetBswapLiquidityOps` | GET | `bswap/liquidityOps` | 20.001 |
| `sapiGetBswapQuote` | GET | `bswap/quote` | 1.00005 |
| `sapiGetBswapSwap` | GET | `bswap/swap` | 20.001 |
| `sapiGetBswapPoolConfigure` | GET | `bswap/poolConfigure` | 1.00005 |
| `sapiGetBswapAddLiquidityPreview` | GET | `bswap/addLiquidityPreview` | 1.00005 |
| `sapiGetBswapRemoveLiquidityPreview` | GET | `bswap/removeLiquidityPreview` | 1.00005 |
| `sapiGetBswapUnclaimedRewards` | GET | `bswap/unclaimedRewards` | 6.667 |
| `sapiGetBswapClaimedHistory` | GET | `bswap/claimedHistory` | 6.667 |
| `sapiGetBlvtTokenInfo` | GET | `blvt/tokenInfo` | 0.1 |
| `sapiGetBlvtSubscribeRecord` | GET | `blvt/subscribe/record` | 0.1 |
| `sapiGetBlvtRedeemRecord` | GET | `blvt/redeem/record` | 0.1 |
| `sapiGetBlvtUserLimit` | GET | `blvt/userLimit` | 0.1 |
| `sapiGetApiReferralIfNewUser` | GET | `apiReferral/ifNewUser` | 1 |
| `sapiGetApiReferralCustomization` | GET | `apiReferral/customization` | 1 |
| `sapiGetApiReferralUserCustomization` | GET | `apiReferral/userCustomization` | 1 |
| `sapiGetApiReferralRebateRecentRecord` | GET | `apiReferral/rebate/recentRecord` | 1 |
| `sapiGetApiReferralRebateHistoricalRecord` | GET | `apiReferral/rebate/historicalRecord` | 1 |
| `sapiGetApiReferralKickbackRecentRecord` | GET | `apiReferral/kickback/recentRecord` | 1 |
| `sapiGetApiReferralKickbackHistoricalRecord` | GET | `apiReferral/kickback/historicalRecord` | 1 |
| `sapiGetBrokerSubAccountApi` | GET | `broker/subAccountApi` | 1 |
| `sapiGetBrokerSubAccount` | GET | `broker/subAccount` | 1 |
| `sapiGetBrokerSubAccountApiCommissionFutures` | GET | `broker/subAccountApi/commission/futures` | 1 |
| `sapiGetBrokerSubAccountApiCommissionCoinFutures` | GET | `broker/subAccountApi/commission/coinFutures` | 1 |
| `sapiGetBrokerInfo` | GET | `broker/info` | 1 |
| `sapiGetBrokerTransfer` | GET | `broker/transfer` | 1 |
| `sapiGetBrokerTransferFutures` | GET | `broker/transfer/futures` | 1 |
| `sapiGetBrokerRebateRecentRecord` | GET | `broker/rebate/recentRecord` | 1 |
| `sapiGetBrokerRebateHistoricalRecord` | GET | `broker/rebate/historicalRecord` | 1 |
| `sapiGetBrokerSubAccountBnbBurnStatus` | GET | `broker/subAccount/bnbBurn/status` | 1 |
| `sapiGetBrokerSubAccountDepositHist` | GET | `broker/subAccount/depositHist` | 1 |
| `sapiGetBrokerSubAccountSpotSummary` | GET | `broker/subAccount/spotSummary` | 1 |
| `sapiGetBrokerSubAccountMarginSummary` | GET | `broker/subAccount/marginSummary` | 1 |
| `sapiGetBrokerSubAccountFuturesSummary` | GET | `broker/subAccount/futuresSummary` | 1 |
| `sapiGetBrokerRebateFuturesRecentRecord` | GET | `broker/rebate/futures/recentRecord` | 1 |
| `sapiGetBrokerSubAccountApiIpRestriction` | GET | `broker/subAccountApi/ipRestriction` | 1 |
| `sapiGetBrokerUniversalTransfer` | GET | `broker/universalTransfer` | 1 |
| `sapiGetAccountApiRestrictions` | GET | `account/apiRestrictions` | 0.1 |
| `sapiGetC2cOrderMatchListUserOrderHistory` | GET | `c2c/orderMatch/listUserOrderHistory` | 0.1 |
| `sapiGetNftHistoryTransactions` | GET | `nft/history/transactions` | 20.001 |
| `sapiGetNftHistoryDeposit` | GET | `nft/history/deposit` | 20.001 |
| `sapiGetNftHistoryWithdraw` | GET | `nft/history/withdraw` | 20.001 |
| `sapiGetNftUserGetAsset` | GET | `nft/user/getAsset` | 20.001 |
| `sapiGetPayTransactions` | GET | `pay/transactions` | 20.001 |
| `sapiGetGiftcardVerify` | GET | `giftcard/verify` | 0.1 |
| `sapiGetGiftcardCryptographyRsaPublicKey` | GET | `giftcard/cryptography/rsa-public-key` | 0.1 |
| `sapiGetGiftcardBuyCodeTokenLimit` | GET | `giftcard/buyCode/token-limit` | 0.1 |
| `sapiGetAlgoSpotOpenOrders` | GET | `algo/spot/openOrders` | 0.1 |
| `sapiGetAlgoSpotHistoricalOrders` | GET | `algo/spot/historicalOrders` | 0.1 |
| `sapiGetAlgoSpotSubOrders` | GET | `algo/spot/subOrders` | 0.1 |
| `sapiGetAlgoFuturesOpenOrders` | GET | `algo/futures/openOrders` | 0.1 |
| `sapiGetAlgoFuturesHistoricalOrders` | GET | `algo/futures/historicalOrders` | 0.1 |
| `sapiGetAlgoFuturesSubOrders` | GET | `algo/futures/subOrders` | 0.1 |
| `sapiGetPortfolioAccount` | GET | `portfolio/account` | 0.1 |
| `sapiGetPortfolioCollateralRate` | GET | `portfolio/collateralRate` | 5 |
| `sapiGetPortfolioPmLoan` | GET | `portfolio/pmLoan` | 3.3335 |
| `sapiGetPortfolioInterestHistory` | GET | `portfolio/interest-history` | 0.6667 |
| `sapiGetPortfolioAssetIndexPrice` | GET | `portfolio/asset-index-price` | 0.1 |
| `sapiGetPortfolioRepayFuturesSwitch` | GET | `portfolio/repay-futures-switch` | 3 |
| `sapiGetPortfolioMarginAssetLeverage` | GET | `portfolio/margin-asset-leverage` | 5 |
| `sapiGetPortfolioBalance` | GET | `portfolio/balance` | 2 |
| `sapiGetPortfolioNegativeBalanceExchangeRecord` | GET | `portfolio/negative-balance-exchange-record` | 2 |
| `sapiGetPortfolioPmloanHistory` | GET | `portfolio/pmloan-history` | 5 |
| `sapiGetPortfolioEarnAssetBalance` | GET | `portfolio/earn-asset-balance` | 150 |
| `sapiGetPortfolioDeltaMode` | GET | `portfolio/delta-mode` | 150 |
| `sapiGetStakingProductList` | GET | `staking/productList` | 0.1 |
| `sapiGetStakingPosition` | GET | `staking/position` | 0.1 |
| `sapiGetStakingStakingRecord` | GET | `staking/stakingRecord` | 0.1 |
| `sapiGetStakingPersonalLeftQuota` | GET | `staking/personalLeftQuota` | 0.1 |
| `sapiGetLendingAutoInvestTargetAssetList` | GET | `lending/auto-invest/target-asset/list` | 0.1 |
| `sapiGetLendingAutoInvestTargetAssetRoiList` | GET | `lending/auto-invest/target-asset/roi/list` | 0.1 |
| `sapiGetLendingAutoInvestAllAsset` | GET | `lending/auto-invest/all/asset` | 0.1 |
| `sapiGetLendingAutoInvestSourceAssetList` | GET | `lending/auto-invest/source-asset/list` | 0.1 |
| `sapiGetLendingAutoInvestPlanList` | GET | `lending/auto-invest/plan/list` | 0.1 |
| `sapiGetLendingAutoInvestPlanId` | GET | `lending/auto-invest/plan/id` | 0.1 |
| `sapiGetLendingAutoInvestHistoryList` | GET | `lending/auto-invest/history/list` | 0.1 |
| `sapiGetLendingAutoInvestIndexInfo` | GET | `lending/auto-invest/index/info` | 0.1 |
| `sapiGetLendingAutoInvestIndexUserSummary` | GET | `lending/auto-invest/index/user-summary` | 0.1 |
| `sapiGetLendingAutoInvestOneOffStatus` | GET | `lending/auto-invest/one-off/status` | 0.1 |
| `sapiGetLendingAutoInvestRedeemHistory` | GET | `lending/auto-invest/redeem/history` | 0.1 |
| `sapiGetLendingAutoInvestRebalanceHistory` | GET | `lending/auto-invest/rebalance/history` | 0.1 |
| `sapiGetSimpleEarnFlexibleList` | GET | `simple-earn/flexible/list` | 15 |
| `sapiGetSimpleEarnLockedList` | GET | `simple-earn/locked/list` | 15 |
| `sapiGetSimpleEarnFlexiblePersonalLeftQuota` | GET | `simple-earn/flexible/personalLeftQuota` | 15 |
| `sapiGetSimpleEarnLockedPersonalLeftQuota` | GET | `simple-earn/locked/personalLeftQuota` | 15 |
| `sapiGetSimpleEarnFlexibleSubscriptionPreview` | GET | `simple-earn/flexible/subscriptionPreview` | 15 |
| `sapiGetSimpleEarnLockedSubscriptionPreview` | GET | `simple-earn/locked/subscriptionPreview` | 15 |
| `sapiGetSimpleEarnFlexibleHistoryRateHistory` | GET | `simple-earn/flexible/history/rateHistory` | 15 |
| `sapiGetSimpleEarnFlexiblePosition` | GET | `simple-earn/flexible/position` | 15 |
| `sapiGetSimpleEarnLockedPosition` | GET | `simple-earn/locked/position` | 15 |
| `sapiGetSimpleEarnAccount` | GET | `simple-earn/account` | 15 |
| `sapiGetSimpleEarnFlexibleHistorySubscriptionRecord` | GET | `simple-earn/flexible/history/subscriptionRecord` | 15 |
| `sapiGetSimpleEarnLockedHistorySubscriptionRecord` | GET | `simple-earn/locked/history/subscriptionRecord` | 15 |
| `sapiGetSimpleEarnFlexibleHistoryRedemptionRecord` | GET | `simple-earn/flexible/history/redemptionRecord` | 15 |
| `sapiGetSimpleEarnLockedHistoryRedemptionRecord` | GET | `simple-earn/locked/history/redemptionRecord` | 15 |
| `sapiGetSimpleEarnFlexibleHistoryRewardsRecord` | GET | `simple-earn/flexible/history/rewardsRecord` | 15 |
| `sapiGetSimpleEarnLockedHistoryRewardsRecord` | GET | `simple-earn/locked/history/rewardsRecord` | 15 |
| `sapiGetSimpleEarnFlexibleHistoryCollateralRecord` | GET | `simple-earn/flexible/history/collateralRecord` | 0.1 |
| `sapiGetDciProductList` | GET | `dci/product/list` | 0.1 |
| `sapiGetDciProductPositions` | GET | `dci/product/positions` | 0.1 |
| `sapiGetDciProductAccounts` | GET | `dci/product/accounts` | 0.1 |
| `sapiGetAccumulatorProductList` | GET | `accumulator/product/list` | 0.1 |
| `sapiGetAccumulatorProductPositionList` | GET | `accumulator/product/position/list` | 0.1 |
| `sapiGetAccumulatorProductSumHolding` | GET | `accumulator/product/sum-holding` | 0.1 |
| `sapiGetAssetAssetDistributionHistory` | GET | `asset/assetDistributionHistory` | 1 |
| `sapiGetAssetQueryTradingFee` | GET | `asset/query/trading-fee` | 1 |
| `sapiGetAssetQueryTradingVolume` | GET | `asset/query/trading-volume` | 1 |
| `sapiGetOtcCoinPairs` | GET | `otc/coinPairs` | 1 |
| `sapiGetOtcOrdersOrderId` | GET | `otc/orders/{orderId}` | 1 |
| `sapiGetOtcOrders` | GET | `otc/orders` | 1 |
| `sapiGetOcbsOrders` | GET | `ocbs/orders` | 1 |
| `sapiGetFiatpaymentQueryWithdrawHistory` | GET | `fiatpayment/query/withdraw/history` | 1 |
| `sapiGetFiatpaymentQueryDepositHistory` | GET | `fiatpayment/query/deposit/history` | 1 |
| `sapiGetCapitalSubAccountDepositAddress` | GET | `capital/sub-account/deposit/address` | 1 |
| `sapiGetCapitalSubAccountDepositHistory` | GET | `capital/sub-account/deposit/history` | 1 |
| `sapiGetAssetQueryDustLogs` | GET | `asset/query/dust-logs` | 1 |
| `sapiGetAssetQueryDustAssets` | GET | `asset/query/dust-assets` | 1 |
| `sapiGetMarketingReferralRewardHistory` | GET | `marketing/referral/reward/history` | 1 |
| `sapiGetStakingAsset` | GET | `staking/asset` | 1 |
| `sapiGetStakingStakingBalance` | GET | `staking/stakingBalance` | 1 |
| `sapiGetStakingHistory` | GET | `staking/history` | 1 |
| `sapiGetStakingStakingRewardsHistory` | GET | `staking/stakingRewardsHistory` | 1 |
| `sapiGetCustodianBalance` | GET | `custodian/balance` | 1 |
| `sapiGetCustodianSupportedAssetList` | GET | `custodian/supportedAssetList` | 1 |
| `sapiGetCustodianWalletTransferHistory` | GET | `custodian/walletTransferHistory` | 1 |
| `sapiGetCustodianCustodianTransferHistory` | GET | `custodian/custodianTransferHistory` | 1 |
| `sapiGetCustodianOpenOrders` | GET | `custodian/openOrders` | 1 |
| `sapiGetCustodianOrder` | GET | `custodian/order` | 1 |
| `sapiGetCustodianOrderHistory` | GET | `custodian/orderHistory` | 1 |
| `sapiGetCustodianTradeHistory` | GET | `custodian/tradeHistory` | 1 |
| `sapiGetCustodianSettlementSetting` | GET | `custodian/settlementSetting` | 1 |
| `sapiGetCustodianSettlementHistory` | GET | `custodian/settlementHistory` | 1 |
| `sapiGetClTransferHistory` | GET | `cl/transferHistory` | 1 |
| `sapiGetApipartnerCheckEligibility` | GET | `apipartner/checkEligibility` | 1 |
| `sapiGetApipartnerRebateHistory` | GET | `apipartner/rebateHistory` | 1 |
| `sapiPostAssetDust` | POST | `asset/dust` | 10 |
| `sapiPostAssetDustBtc` | POST | `asset/dust-btc` | 0.1 |
| `sapiPostAssetTransfer` | POST | `asset/transfer` | 6.0003 |
| `sapiPostAssetGetFundingAsset` | POST | `asset/get-funding-asset` | 0.1 |
| `sapiPostAssetConvertTransfer` | POST | `asset/convert-transfer` | 0.033335 |
| `sapiPostAccountDisableFastWithdrawSwitch` | POST | `account/disableFastWithdrawSwitch` | 0.1 |
| `sapiPostAccountEnableFastWithdrawSwitch` | POST | `account/enableFastWithdrawSwitch` | 0.1 |
| `sapiPostCapitalWithdrawApply` | POST | `capital/withdraw/apply` | 1 |
| `sapiPostCapitalContractConvertibleCoins` | POST | `capital/contract/convertible-coins` | 4.0002 |
| `sapiPostCapitalDepositCreditApply` | POST | `capital/deposit/credit-apply` | 0.1 |
| `sapiPostMarginBorrowRepay` | POST | `margin/borrow-repay` | 20.001 |
| `sapiPostMarginTransfer` | POST | `margin/transfer` | 4.0002 |
| `sapiPostMarginLoan` | POST | `margin/loan` | 20.001 |
| `sapiPostMarginRepay` | POST | `margin/repay` | 20.001 |
| `sapiPostMarginOrder` | POST | `margin/order` | 0.040002 |
| `sapiPostMarginOrderOco` | POST | `margin/order/oco` | 0.040002 |
| `sapiPostMarginDust` | POST | `margin/dust` | 20.001 |
| `sapiPostMarginExchangeSmallLiability` | POST | `margin/exchange-small-liability` | 20.001 |
| `sapiPostMarginIsolatedTransfer` | POST | `margin/isolated/transfer` | 4.0002 |
| `sapiPostMarginIsolatedAccount` | POST | `margin/isolated/account` | 2.0001 |
| `sapiPostMarginMaxLeverage` | POST | `margin/max-leverage` | 300 |
| `sapiPostBnbBurn` | POST | `bnbBurn` | 0.1 |
| `sapiPostSubAccountVirtualSubAccount` | POST | `sub-account/virtualSubAccount` | 0.1 |
| `sapiPostSubAccountMarginTransfer` | POST | `sub-account/margin/transfer` | 4.0002 |
| `sapiPostSubAccountMarginEnable` | POST | `sub-account/margin/enable` | 0.1 |
| `sapiPostSubAccountFuturesEnable` | POST | `sub-account/futures/enable` | 0.1 |
| `sapiPostSubAccountFuturesTransfer` | POST | `sub-account/futures/transfer` | 0.1 |
| `sapiPostSubAccountFuturesInternalTransfer` | POST | `sub-account/futures/internalTransfer` | 0.1 |
| `sapiPostSubAccountTransferSubToSub` | POST | `sub-account/transfer/subToSub` | 0.1 |
| `sapiPostSubAccountTransferSubToMaster` | POST | `sub-account/transfer/subToMaster` | 0.1 |
| `sapiPostSubAccountUniversalTransfer` | POST | `sub-account/universalTransfer` | 0.1 |
| `sapiPostSubAccountOptionsEnable` | POST | `sub-account/options/enable` | 0.1 |
| `sapiPostManagedSubaccountDeposit` | POST | `managed-subaccount/deposit` | 0.1 |
| `sapiPostManagedSubaccountWithdraw` | POST | `managed-subaccount/withdraw` | 0.1 |
| `sapiPostUserDataStream` | POST | `userDataStream` | 0.1 |
| `sapiPostUserDataStreamIsolated` | POST | `userDataStream/isolated` | 0.1 |
| `sapiPostUserListenToken` | POST | `userListenToken` | 0.1 |
| `sapiPostFuturesTransfer` | POST | `futures/transfer` | 0.1 |
| `sapiPostLendingCustomizedFixedPurchase` | POST | `lending/customizedFixed/purchase` | 0.1 |
| `sapiPostLendingDailyPurchase` | POST | `lending/daily/purchase` | 0.1 |
| `sapiPostLendingDailyRedeem` | POST | `lending/daily/redeem` | 0.1 |
| `sapiPostBswapLiquidityAdd` | POST | `bswap/liquidityAdd` | 60 |
| `sapiPostBswapLiquidityRemove` | POST | `bswap/liquidityRemove` | 60 |
| `sapiPostBswapSwap` | POST | `bswap/swap` | 60 |
| `sapiPostBswapClaimRewards` | POST | `bswap/claimRewards` | 6.667 |
| `sapiPostBlvtSubscribe` | POST | `blvt/subscribe` | 0.1 |
| `sapiPostBlvtRedeem` | POST | `blvt/redeem` | 0.1 |
| `sapiPostApiReferralCustomization` | POST | `apiReferral/customization` | 1 |
| `sapiPostApiReferralUserCustomization` | POST | `apiReferral/userCustomization` | 1 |
| `sapiPostApiReferralRebateHistoricalRecord` | POST | `apiReferral/rebate/historicalRecord` | 1 |
| `sapiPostApiReferralKickbackHistoricalRecord` | POST | `apiReferral/kickback/historicalRecord` | 1 |
| `sapiPostBrokerSubAccount` | POST | `broker/subAccount` | 1 |
| `sapiPostBrokerSubAccountMargin` | POST | `broker/subAccount/margin` | 1 |
| `sapiPostBrokerSubAccountFutures` | POST | `broker/subAccount/futures` | 1 |
| `sapiPostBrokerSubAccountApi` | POST | `broker/subAccountApi` | 1 |
| `sapiPostBrokerSubAccountApiPermission` | POST | `broker/subAccountApi/permission` | 1 |
| `sapiPostBrokerSubAccountApiCommission` | POST | `broker/subAccountApi/commission` | 1 |
| `sapiPostBrokerSubAccountApiCommissionFutures` | POST | `broker/subAccountApi/commission/futures` | 1 |
| `sapiPostBrokerSubAccountApiCommissionCoinFutures` | POST | `broker/subAccountApi/commission/coinFutures` | 1 |
| `sapiPostBrokerTransfer` | POST | `broker/transfer` | 1 |
| `sapiPostBrokerTransferFutures` | POST | `broker/transfer/futures` | 1 |
| `sapiPostBrokerRebateHistoricalRecord` | POST | `broker/rebate/historicalRecord` | 1 |
| `sapiPostBrokerSubAccountBnbBurnSpot` | POST | `broker/subAccount/bnbBurn/spot` | 1 |
| `sapiPostBrokerSubAccountBnbBurnMarginInterest` | POST | `broker/subAccount/bnbBurn/marginInterest` | 1 |
| `sapiPostBrokerSubAccountBlvt` | POST | `broker/subAccount/blvt` | 1 |
| `sapiPostBrokerSubAccountApiIpRestriction` | POST | `broker/subAccountApi/ipRestriction` | 1 |
| `sapiPostBrokerSubAccountApiIpRestrictionIpList` | POST | `broker/subAccountApi/ipRestriction/ipList` | 1 |
| `sapiPostBrokerUniversalTransfer` | POST | `broker/universalTransfer` | 1 |
| `sapiPostBrokerSubAccountApiPermissionUniversalTransfer` | POST | `broker/subAccountApi/permission/universalTransfer` | 1 |
| `sapiPostBrokerSubAccountApiPermissionVanillaOptions` | POST | `broker/subAccountApi/permission/vanillaOptions` | 1 |
| `sapiPostGiftcardCreateCode` | POST | `giftcard/createCode` | 0.1 |
| `sapiPostGiftcardRedeemCode` | POST | `giftcard/redeemCode` | 0.1 |
| `sapiPostGiftcardBuyCode` | POST | `giftcard/buyCode` | 0.1 |
| `sapiPostAlgoSpotNewOrderTwap` | POST | `algo/spot/newOrderTwap` | 20.001 |
| `sapiPostAlgoFuturesNewOrderVp` | POST | `algo/futures/newOrderVp` | 20.001 |
| `sapiPostAlgoFuturesNewOrderTwap` | POST | `algo/futures/newOrderTwap` | 20.001 |
| `sapiPostStakingPurchase` | POST | `staking/purchase` | 0.1 |
| `sapiPostStakingRedeem` | POST | `staking/redeem` | 0.1 |
| `sapiPostStakingSetAutoStaking` | POST | `staking/setAutoStaking` | 0.1 |
| `sapiPostEthStakingEthStake` | POST | `eth-staking/eth/stake` | 15 |
| `sapiPostEthStakingEthRedeem` | POST | `eth-staking/eth/redeem` | 15 |
| `sapiPostEthStakingWbethWrap` | POST | `eth-staking/wbeth/wrap` | 15 |
| `sapiPostSolStakingSolStake` | POST | `sol-staking/sol/stake` | 15 |
| `sapiPostSolStakingSolRedeem` | POST | `sol-staking/sol/redeem` | 15 |
| `sapiPostMiningHashTransferConfig` | POST | `mining/hash-transfer/config` | 0.5 |
| `sapiPostMiningHashTransferConfigCancel` | POST | `mining/hash-transfer/config/cancel` | 0.5 |
| `sapiPostPortfolioRepay` | POST | `portfolio/repay` | 20.001 |
| `sapiPostLoanVipRenew` | POST | `loan/vip/renew` | 40.002 |
| `sapiPostLoanVipBorrow` | POST | `loan/vip/borrow` | 40.002 |
| `sapiPostLoanBorrow` | POST | `loan/borrow` | 40.002 |
| `sapiPostLoanRepay` | POST | `loan/repay` | 40.002 |
| `sapiPostLoanAdjustLtv` | POST | `loan/adjust/ltv` | 40.002 |
| `sapiPostLoanCustomizeMarginCall` | POST | `loan/customize/margin_call` | 40.002 |
| `sapiPostLoanFlexibleRepay` | POST | `loan/flexible/repay` | 40.002 |
| `sapiPostLoanFlexibleAdjustLtv` | POST | `loan/flexible/adjust/ltv` | 40.002 |
| `sapiPostLoanVipRepay` | POST | `loan/vip/repay` | 40.002 |
| `sapiPostConvertGetQuote` | POST | `convert/getQuote` | 1.3334 |
| `sapiPostConvertAcceptQuote` | POST | `convert/acceptQuote` | 3.3335 |
| `sapiPostConvertLimitPlaceOrder` | POST | `convert/limit/placeOrder` | 3.3335 |
| `sapiPostConvertLimitCancelOrder` | POST | `convert/limit/cancelOrder` | 1.3334 |
| `sapiPostPortfolioAutoCollection` | POST | `portfolio/auto-collection` | 150 |
| `sapiPostPortfolioAssetCollection` | POST | `portfolio/asset-collection` | 6 |
| `sapiPostPortfolioBnbTransfer` | POST | `portfolio/bnb-transfer` | 150 |
| `sapiPostPortfolioRepayFuturesSwitch` | POST | `portfolio/repay-futures-switch` | 150 |
| `sapiPostPortfolioRepayFuturesNegativeBalance` | POST | `portfolio/repay-futures-negative-balance` | 150 |
| `sapiPostPortfolioMint` | POST | `portfolio/mint` | 20 |
| `sapiPostPortfolioRedeem` | POST | `portfolio/redeem` | 20 |
| `sapiPostPortfolioEarnAssetTransfer` | POST | `portfolio/earn-asset-transfer` | 150 |
| `sapiPostPortfolioDeltaMode` | POST | `portfolio/delta-mode` | 150 |
| `sapiPostLendingAutoInvestPlanAdd` | POST | `lending/auto-invest/plan/add` | 0.1 |
| `sapiPostLendingAutoInvestPlanEdit` | POST | `lending/auto-invest/plan/edit` | 0.1 |
| `sapiPostLendingAutoInvestPlanEditStatus` | POST | `lending/auto-invest/plan/edit-status` | 0.1 |
| `sapiPostLendingAutoInvestOneOff` | POST | `lending/auto-invest/one-off` | 0.1 |
| `sapiPostLendingAutoInvestRedeem` | POST | `lending/auto-invest/redeem` | 0.1 |
| `sapiPostSimpleEarnFlexibleSubscribe` | POST | `simple-earn/flexible/subscribe` | 0.1 |
| `sapiPostSimpleEarnLockedSubscribe` | POST | `simple-earn/locked/subscribe` | 0.1 |
| `sapiPostSimpleEarnFlexibleRedeem` | POST | `simple-earn/flexible/redeem` | 0.1 |
| `sapiPostSimpleEarnLockedRedeem` | POST | `simple-earn/locked/redeem` | 0.1 |
| `sapiPostSimpleEarnFlexibleSetAutoSubscribe` | POST | `simple-earn/flexible/setAutoSubscribe` | 15 |
| `sapiPostSimpleEarnLockedSetAutoSubscribe` | POST | `simple-earn/locked/setAutoSubscribe` | 15 |
| `sapiPostSimpleEarnLockedSetRedeemOption` | POST | `simple-earn/locked/setRedeemOption` | 5 |
| `sapiPostDciProductSubscribe` | POST | `dci/product/subscribe` | 0.1 |
| `sapiPostDciProductAutoCompoundEdit` | POST | `dci/product/auto_compound/edit` | 0.1 |
| `sapiPostAccumulatorProductSubscribe` | POST | `accumulator/product/subscribe` | 0.1 |
| `sapiPostOtcQuotes` | POST | `otc/quotes` | 1 |
| `sapiPostOtcOrders` | POST | `otc/orders` | 1 |
| `sapiPostFiatpaymentWithdrawApply` | POST | `fiatpayment/withdraw/apply` | 1 |
| `sapiPostStakingStake` | POST | `staking/stake` | 1 |
| `sapiPostStakingUnstake` | POST | `staking/unstake` | 1 |
| `sapiPostCustodianWalletTransfer` | POST | `custodian/walletTransfer` | 1 |
| `sapiPostCustodianCustodianTransfer` | POST | `custodian/custodianTransfer` | 1 |
| `sapiPostCustodianUndoTransfer` | POST | `custodian/undoTransfer` | 1 |
| `sapiPostCustodianOrder` | POST | `custodian/order` | 1 |
| `sapiPostCustodianOcoOrder` | POST | `custodian/ocoOrder` | 1 |
| `sapiPostClTransfer` | POST | `cl/transfer` | 1 |
| `sapiPutUserDataStream` | PUT | `userDataStream` | 0.1 |
| `sapiPutUserDataStreamIsolated` | PUT | `userDataStream/isolated` | 0.1 |
| `sapiDeleteMarginOpenOrders` | DELETE | `margin/openOrders` | 0.1 |
| `sapiDeleteMarginOrder` | DELETE | `margin/order` | 0.006667 |
| `sapiDeleteMarginOrderList` | DELETE | `margin/orderList` | 0.006667 |
| `sapiDeleteMarginIsolatedAccount` | DELETE | `margin/isolated/account` | 2.0001 |
| `sapiDeleteUserDataStream` | DELETE | `userDataStream` | 0.1 |
| `sapiDeleteUserDataStreamIsolated` | DELETE | `userDataStream/isolated` | 0.1 |
| `sapiDeleteBrokerSubAccountApi` | DELETE | `broker/subAccountApi` | 1 |
| `sapiDeleteBrokerSubAccountApiIpRestrictionIpList` | DELETE | `broker/subAccountApi/ipRestriction/ipList` | 1 |
| `sapiDeleteAlgoSpotOrder` | DELETE | `algo/spot/order` | 0.1 |
| `sapiDeleteAlgoFuturesOrder` | DELETE | `algo/futures/order` | 0.1 |
| `sapiDeleteSubAccountSubAccountApiIpRestrictionIpList` | DELETE | `sub-account/subAccountApi/ipRestriction/ipList` | 20.001 |
| `sapiDeleteCustodianCancelOrder` | DELETE | `custodian/cancelOrder` | 1 |
| `sapiDeleteCustodianCancelOrdersBySymbol` | DELETE | `custodian/cancelOrdersBySymbol` | 1 |
| `sapiDeleteCustodianCancelOcoOrder` | DELETE | `custodian/cancelOcoOrder` | 1 |

## sapiV2

**Base URL**: `https://api.binance.us/sapi/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `sapiV2GetEthStakingAccount` | GET | `eth-staking/account` | 15 |
| `sapiV2GetSubAccountFuturesAccount` | GET | `sub-account/futures/account` | 0.1 |
| `sapiV2GetSubAccountFuturesAccountSummary` | GET | `sub-account/futures/accountSummary` | 1 |
| `sapiV2GetSubAccountFuturesPositionRisk` | GET | `sub-account/futures/positionRisk` | 0.1 |
| `sapiV2GetLoanFlexibleOngoingOrders` | GET | `loan/flexible/ongoing/orders` | 30 |
| `sapiV2GetLoanFlexibleBorrowHistory` | GET | `loan/flexible/borrow/history` | 40 |
| `sapiV2GetLoanFlexibleRepayHistory` | GET | `loan/flexible/repay/history` | 40 |
| `sapiV2GetLoanFlexibleLtvAdjustmentHistory` | GET | `loan/flexible/ltv/adjustment/history` | 40 |
| `sapiV2GetLoanFlexibleLoanableData` | GET | `loan/flexible/loanable/data` | 40 |
| `sapiV2GetLoanFlexibleCollateralData` | GET | `loan/flexible/collateral/data` | 40 |
| `sapiV2GetPortfolioAccount` | GET | `portfolio/account` | 2 |
| `sapiV2GetClAccount` | GET | `cl/account` | 10 |
| `sapiV2GetClAlertHistory` | GET | `cl/alertHistory` | 1 |
| `sapiV2PostEthStakingEthStake` | POST | `eth-staking/eth/stake` | 15 |
| `sapiV2PostSubAccountSubAccountApiIpRestriction` | POST | `sub-account/subAccountApi/ipRestriction` | 20.001 |
| `sapiV2PostLoanFlexibleBorrow` | POST | `loan/flexible/borrow` | 40.002 |
| `sapiV2PostLoanFlexibleRepay` | POST | `loan/flexible/repay` | 40.002 |
| `sapiV2PostLoanFlexibleAdjustLtv` | POST | `loan/flexible/adjust/ltv` | 40.002 |

## sapiV3

**Base URL**: `https://api.binance.us/sapi/v3`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `sapiV3GetSubAccountAssets` | GET | `sub-account/assets` | 1 |
| `sapiV3GetAccountStatus` | GET | `accountStatus` | 1 |
| `sapiV3GetApiTradingStatus` | GET | `apiTradingStatus` | 1 |
| `sapiV3GetSubAccountList` | GET | `sub-account/list` | 1 |
| `sapiV3GetSubAccountTransferHistory` | GET | `sub-account/transfer/history` | 1 |
| `sapiV3PostAssetGetUserAsset` | POST | `asset/getUserAsset` | 0.5 |
| `sapiV3PostSubAccountTransfer` | POST | `sub-account/transfer` | 1 |

## sapiV4

**Base URL**: `https://api.binance.com/sapi/v4`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `sapiV4GetSubAccountAssets` | GET | `sub-account/assets` | 0.40002 |

## dapiPublic

**Base URL**: `https://dapi.binance.com/dapi/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `dapiPublicGetPing` | GET | `ping` | 1 |
| `dapiPublicGetTime` | GET | `time` | 1 |
| `dapiPublicGetExchangeInfo` | GET | `exchangeInfo` | 1 |
| `dapiPublicGetDepth` | GET | `depth` | 2 |
| `dapiPublicGetTrades` | GET | `trades` | 5 |
| `dapiPublicGetHistoricalTrades` | GET | `historicalTrades` | 20 |
| `dapiPublicGetAggTrades` | GET | `aggTrades` | 20 |
| `dapiPublicGetPremiumIndex` | GET | `premiumIndex` | 10 |
| `dapiPublicGetFundingRate` | GET | `fundingRate` | 1 |
| `dapiPublicGetKlines` | GET | `klines` | 1 |
| `dapiPublicGetContinuousKlines` | GET | `continuousKlines` | 1 |
| `dapiPublicGetIndexPriceKlines` | GET | `indexPriceKlines` | 1 |
| `dapiPublicGetMarkPriceKlines` | GET | `markPriceKlines` | 1 |
| `dapiPublicGetPremiumIndexKlines` | GET | `premiumIndexKlines` | 1 |
| `dapiPublicGetTicker24hr` | GET | `ticker/24hr` | 1 |
| `dapiPublicGetTickerPrice` | GET | `ticker/price` | 1 |
| `dapiPublicGetTickerBookTicker` | GET | `ticker/bookTicker` | 2 |
| `dapiPublicGetConstituents` | GET | `constituents` | 2 |
| `dapiPublicGetOpenInterest` | GET | `openInterest` | 1 |
| `dapiPublicGetFundingInfo` | GET | `fundingInfo` | 1 |

## dapiData

**Base URL**: `https://dapi.binance.com/futures/data`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `dapiDataGetDeliveryPrice` | GET | `delivery-price` | 1 |
| `dapiDataGetOpenInterestHist` | GET | `openInterestHist` | 1 |
| `dapiDataGetTopLongShortAccountRatio` | GET | `topLongShortAccountRatio` | 1 |
| `dapiDataGetTopLongShortPositionRatio` | GET | `topLongShortPositionRatio` | 1 |
| `dapiDataGetGlobalLongShortAccountRatio` | GET | `globalLongShortAccountRatio` | 1 |
| `dapiDataGetTakerBuySellVol` | GET | `takerBuySellVol` | 1 |
| `dapiDataGetBasis` | GET | `basis` | 1 |

## dapiPrivate

**Base URL**: `https://dapi.binance.com/dapi/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `dapiPrivateGetPositionSideDual` | GET | `positionSide/dual` | 30 |
| `dapiPrivateGetOrderAmendment` | GET | `orderAmendment` | 1 |
| `dapiPrivateGetOrder` | GET | `order` | 1 |
| `dapiPrivateGetOpenOrder` | GET | `openOrder` | 1 |
| `dapiPrivateGetOpenOrders` | GET | `openOrders` | 1 |
| `dapiPrivateGetOpenAlgoOrders` | GET | `openAlgoOrders` | 1 |
| `dapiPrivateGetAllOrders` | GET | `allOrders` | 5 |
| `dapiPrivateGetBalance` | GET | `balance` | 1 |
| `dapiPrivateGetAccount` | GET | `account` | 5 |
| `dapiPrivateGetPositionMarginHistory` | GET | `positionMargin/history` | 1 |
| `dapiPrivateGetPositionRisk` | GET | `positionRisk` | 1 |
| `dapiPrivateGetUserTrades` | GET | `userTrades` | 5 |
| `dapiPrivateGetIncome` | GET | `income` | 20 |
| `dapiPrivateGetLeverageBracket` | GET | `leverageBracket` | 2 |
| `dapiPrivateGetForceOrders` | GET | `forceOrders` | 20 |
| `dapiPrivateGetAdlQuantile` | GET | `adlQuantile` | 5 |
| `dapiPrivateGetCommissionRate` | GET | `commissionRate` | 20 |
| `dapiPrivateGetIncomeAsyn` | GET | `income/asyn` | 5 |
| `dapiPrivateGetIncomeAsynId` | GET | `income/asyn/id` | 5 |
| `dapiPrivateGetTradeAsyn` | GET | `trade/asyn` | 0.5 |
| `dapiPrivateGetTradeAsynId` | GET | `trade/asyn/id` | 0.5 |
| `dapiPrivateGetOrderAsyn` | GET | `order/asyn` | 0.5 |
| `dapiPrivateGetOrderAsynId` | GET | `order/asyn/id` | 0.5 |
| `dapiPrivateGetPmExchangeInfo` | GET | `pmExchangeInfo` | 0.5 |
| `dapiPrivateGetPmAccountInfo` | GET | `pmAccountInfo` | 0.5 |
| `dapiPrivatePostPositionSideDual` | POST | `positionSide/dual` | 1 |
| `dapiPrivatePostOrder` | POST | `order` | 4 |
| `dapiPrivatePostAlgoOrder` | POST | `algoOrder` | 1 |
| `dapiPrivatePostBatchOrders` | POST | `batchOrders` | 5 |
| `dapiPrivatePostCountdownCancelAll` | POST | `countdownCancelAll` | 10 |
| `dapiPrivatePostLeverage` | POST | `leverage` | 1 |
| `dapiPrivatePostMarginType` | POST | `marginType` | 1 |
| `dapiPrivatePostPositionMargin` | POST | `positionMargin` | 1 |
| `dapiPrivatePostListenKey` | POST | `listenKey` | 1 |
| `dapiPrivatePutListenKey` | PUT | `listenKey` | 1 |
| `dapiPrivatePutOrder` | PUT | `order` | 1 |
| `dapiPrivatePutBatchOrders` | PUT | `batchOrders` | 5 |
| `dapiPrivateDeleteOrder` | DELETE | `order` | 1 |
| `dapiPrivateDeleteAlgoOrder` | DELETE | `algoOrder` | 1 |
| `dapiPrivateDeleteAllOpenOrders` | DELETE | `allOpenOrders` | 1 |
| `dapiPrivateDeleteBatchOrders` | DELETE | `batchOrders` | 5 |
| `dapiPrivateDeleteListenKey` | DELETE | `listenKey` | 1 |

## dapiPrivateV2

**Base URL**: `https://dapi.binance.com/dapi/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `dapiPrivateV2GetLeverageBracket` | GET | `leverageBracket` | 1 |

## fapiPublic

**Base URL**: `https://fapi.binance.com/fapi/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `fapiPublicGetPing` | GET | `ping` | 1 |
| `fapiPublicGetTime` | GET | `time` | 1 |
| `fapiPublicGetExchangeInfo` | GET | `exchangeInfo` | 1 |
| `fapiPublicGetDepth` | GET | `depth` | 2 |
| `fapiPublicGetRpiDepth` | GET | `rpiDepth` | 20 |
| `fapiPublicGetTrades` | GET | `trades` | 5 |
| `fapiPublicGetHistoricalTrades` | GET | `historicalTrades` | 20 |
| `fapiPublicGetAggTrades` | GET | `aggTrades` | 20 |
| `fapiPublicGetKlines` | GET | `klines` | 1 |
| `fapiPublicGetContinuousKlines` | GET | `continuousKlines` | 1 |
| `fapiPublicGetMarkPriceKlines` | GET | `markPriceKlines` | 1 |
| `fapiPublicGetIndexPriceKlines` | GET | `indexPriceKlines` | 1 |
| `fapiPublicGetPremiumIndexKlines` | GET | `premiumIndexKlines` | 1 |
| `fapiPublicGetFundingRate` | GET | `fundingRate` | 1 |
| `fapiPublicGetFundingInfo` | GET | `fundingInfo` | 1 |
| `fapiPublicGetPremiumIndex` | GET | `premiumIndex` | 1 |
| `fapiPublicGetTicker24hr` | GET | `ticker/24hr` | 1 |
| `fapiPublicGetTickerPrice` | GET | `ticker/price` | 1 |
| `fapiPublicGetTickerBookTicker` | GET | `ticker/bookTicker` | 1 |
| `fapiPublicGetOpenInterest` | GET | `openInterest` | 1 |
| `fapiPublicGetIndexInfo` | GET | `indexInfo` | 1 |
| `fapiPublicGetAssetIndex` | GET | `assetIndex` | 1 |
| `fapiPublicGetConstituents` | GET | `constituents` | 2 |
| `fapiPublicGetApiTradingStatus` | GET | `apiTradingStatus` | 1 |
| `fapiPublicGetLvtKlines` | GET | `lvtKlines` | 1 |
| `fapiPublicGetConvertExchangeInfo` | GET | `convert/exchangeInfo` | 4 |
| `fapiPublicGetInsuranceBalance` | GET | `insuranceBalance` | 1 |
| `fapiPublicGetSymbolAdlRisk` | GET | `symbolAdlRisk` | 1 |
| `fapiPublicGetTradingSchedule` | GET | `tradingSchedule` | 5 |

## fapiData

**Base URL**: `https://fapi.binance.com/futures/data`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `fapiDataGetDeliveryPrice` | GET | `delivery-price` | 1 |
| `fapiDataGetOpenInterestHist` | GET | `openInterestHist` | 1 |
| `fapiDataGetTopLongShortAccountRatio` | GET | `topLongShortAccountRatio` | 1 |
| `fapiDataGetTopLongShortPositionRatio` | GET | `topLongShortPositionRatio` | 1 |
| `fapiDataGetGlobalLongShortAccountRatio` | GET | `globalLongShortAccountRatio` | 1 |
| `fapiDataGetTakerlongshortRatio` | GET | `takerlongshortRatio` | 1 |
| `fapiDataGetBasis` | GET | `basis` | 1 |

## fapiPrivate

**Base URL**: `https://fapi.binance.com/fapi/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `fapiPrivateGetForceOrders` | GET | `forceOrders` | 20 |
| `fapiPrivateGetAllOrders` | GET | `allOrders` | 5 |
| `fapiPrivateGetOpenOrder` | GET | `openOrder` | 1 |
| `fapiPrivateGetOpenOrders` | GET | `openOrders` | 1 |
| `fapiPrivateGetOrder` | GET | `order` | 1 |
| `fapiPrivateGetAccount` | GET | `account` | 5 |
| `fapiPrivateGetBalance` | GET | `balance` | 5 |
| `fapiPrivateGetLeverageBracket` | GET | `leverageBracket` | 1 |
| `fapiPrivateGetPositionMarginHistory` | GET | `positionMargin/history` | 1 |
| `fapiPrivateGetPositionRisk` | GET | `positionRisk` | 5 |
| `fapiPrivateGetPositionSideDual` | GET | `positionSide/dual` | 30 |
| `fapiPrivateGetUserTrades` | GET | `userTrades` | 5 |
| `fapiPrivateGetIncome` | GET | `income` | 30 |
| `fapiPrivateGetCommissionRate` | GET | `commissionRate` | 20 |
| `fapiPrivateGetRateLimitOrder` | GET | `rateLimit/order` | 1 |
| `fapiPrivateGetApiTradingStatus` | GET | `apiTradingStatus` | 1 |
| `fapiPrivateGetMultiAssetsMargin` | GET | `multiAssetsMargin` | 30 |
| `fapiPrivateGetApiReferralIfNewUser` | GET | `apiReferral/ifNewUser` | 1 |
| `fapiPrivateGetApiReferralCustomization` | GET | `apiReferral/customization` | 1 |
| `fapiPrivateGetApiReferralUserCustomization` | GET | `apiReferral/userCustomization` | 1 |
| `fapiPrivateGetApiReferralTraderNum` | GET | `apiReferral/traderNum` | 1 |
| `fapiPrivateGetApiReferralOverview` | GET | `apiReferral/overview` | 1 |
| `fapiPrivateGetApiReferralTradeVol` | GET | `apiReferral/tradeVol` | 1 |
| `fapiPrivateGetApiReferralRebateVol` | GET | `apiReferral/rebateVol` | 1 |
| `fapiPrivateGetApiReferralTraderSummary` | GET | `apiReferral/traderSummary` | 1 |
| `fapiPrivateGetAdlQuantile` | GET | `adlQuantile` | 5 |
| `fapiPrivateGetPmAccountInfo` | GET | `pmAccountInfo` | 5 |
| `fapiPrivateGetOrderAmendment` | GET | `orderAmendment` | 1 |
| `fapiPrivateGetIncomeAsyn` | GET | `income/asyn` | 1000 |
| `fapiPrivateGetIncomeAsynId` | GET | `income/asyn/id` | 10 |
| `fapiPrivateGetOrderAsyn` | GET | `order/asyn` | 1000 |
| `fapiPrivateGetOrderAsynId` | GET | `order/asyn/id` | 10 |
| `fapiPrivateGetTradeAsyn` | GET | `trade/asyn` | 1000 |
| `fapiPrivateGetTradeAsynId` | GET | `trade/asyn/id` | 10 |
| `fapiPrivateGetFeeBurn` | GET | `feeBurn` | 1 |
| `fapiPrivateGetSymbolConfig` | GET | `symbolConfig` | 5 |
| `fapiPrivateGetAccountConfig` | GET | `accountConfig` | 5 |
| `fapiPrivateGetConvertOrderStatus` | GET | `convert/orderStatus` | 5 |
| `fapiPrivateGetAlgoOrder` | GET | `algoOrder` | 1 |
| `fapiPrivateGetOpenAlgoOrders` | GET | `openAlgoOrders` | 1 |
| `fapiPrivateGetAllAlgoOrders` | GET | `allAlgoOrders` | 5 |
| `fapiPrivateGetStockContract` | GET | `stock/contract` | 50 |
| `fapiPrivatePostBatchOrders` | POST | `batchOrders` | 5 |
| `fapiPrivatePostPositionSideDual` | POST | `positionSide/dual` | 1 |
| `fapiPrivatePostPositionMargin` | POST | `positionMargin` | 1 |
| `fapiPrivatePostMarginType` | POST | `marginType` | 1 |
| `fapiPrivatePostOrder` | POST | `order` | 4 |
| `fapiPrivatePostOrderTest` | POST | `order/test` | 1 |
| `fapiPrivatePostLeverage` | POST | `leverage` | 1 |
| `fapiPrivatePostListenKey` | POST | `listenKey` | 1 |
| `fapiPrivatePostCountdownCancelAll` | POST | `countdownCancelAll` | 10 |
| `fapiPrivatePostMultiAssetsMargin` | POST | `multiAssetsMargin` | 1 |
| `fapiPrivatePostApiReferralCustomization` | POST | `apiReferral/customization` | 1 |
| `fapiPrivatePostApiReferralUserCustomization` | POST | `apiReferral/userCustomization` | 1 |
| `fapiPrivatePostFeeBurn` | POST | `feeBurn` | 1 |
| `fapiPrivatePostConvertGetQuote` | POST | `convert/getQuote` | 200 |
| `fapiPrivatePostConvertAcceptQuote` | POST | `convert/acceptQuote` | 20 |
| `fapiPrivatePostAlgoOrder` | POST | `algoOrder` | 1 |
| `fapiPrivatePutListenKey` | PUT | `listenKey` | 1 |
| `fapiPrivatePutOrder` | PUT | `order` | 1 |
| `fapiPrivatePutBatchOrders` | PUT | `batchOrders` | 5 |
| `fapiPrivateDeleteBatchOrders` | DELETE | `batchOrders` | 1 |
| `fapiPrivateDeleteOrder` | DELETE | `order` | 1 |
| `fapiPrivateDeleteAllOpenOrders` | DELETE | `allOpenOrders` | 1 |
| `fapiPrivateDeleteListenKey` | DELETE | `listenKey` | 1 |
| `fapiPrivateDeleteAlgoOrder` | DELETE | `algoOrder` | 1 |
| `fapiPrivateDeleteAlgoOpenOrders` | DELETE | `algoOpenOrders` | 1 |

## fapiPublicV2

**Base URL**: `https://fapi.binance.com/fapi/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `fapiPublicV2GetTickerPrice` | GET | `ticker/price` | 0 |

## fapiPrivateV2

**Base URL**: `https://fapi.binance.com/fapi/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `fapiPrivateV2GetAccount` | GET | `account` | 1 |
| `fapiPrivateV2GetBalance` | GET | `balance` | 1 |
| `fapiPrivateV2GetPositionRisk` | GET | `positionRisk` | 1 |

## fapiPrivateV3

**Base URL**: `https://fapi.binance.com/fapi/v3`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `fapiPrivateV3GetAccount` | GET | `account` | 1 |
| `fapiPrivateV3GetBalance` | GET | `balance` | 1 |
| `fapiPrivateV3GetPositionRisk` | GET | `positionRisk` | 1 |

## eapiPublic

**Base URL**: `https://eapi.binance.com/eapi/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `eapiPublicGetPing` | GET | `ping` | 1 |
| `eapiPublicGetTime` | GET | `time` | 1 |
| `eapiPublicGetExchangeInfo` | GET | `exchangeInfo` | 1 |
| `eapiPublicGetIndex` | GET | `index` | 1 |
| `eapiPublicGetTicker` | GET | `ticker` | 5 |
| `eapiPublicGetMark` | GET | `mark` | 5 |
| `eapiPublicGetDepth` | GET | `depth` | 1 |
| `eapiPublicGetKlines` | GET | `klines` | 1 |
| `eapiPublicGetTrades` | GET | `trades` | 5 |
| `eapiPublicGetHistoricalTrades` | GET | `historicalTrades` | 20 |
| `eapiPublicGetExerciseHistory` | GET | `exerciseHistory` | 3 |
| `eapiPublicGetOpenInterest` | GET | `openInterest` | 3 |

## eapiPrivate

**Base URL**: `https://eapi.binance.com/eapi/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `eapiPrivateGetAccount` | GET | `account` | 3 |
| `eapiPrivateGetPosition` | GET | `position` | 5 |
| `eapiPrivateGetOpenOrders` | GET | `openOrders` | 1 |
| `eapiPrivateGetHistoryOrders` | GET | `historyOrders` | 3 |
| `eapiPrivateGetUserTrades` | GET | `userTrades` | 5 |
| `eapiPrivateGetExerciseRecord` | GET | `exerciseRecord` | 5 |
| `eapiPrivateGetBill` | GET | `bill` | 1 |
| `eapiPrivateGetIncomeAsyn` | GET | `income/asyn` | 5 |
| `eapiPrivateGetIncomeAsynId` | GET | `income/asyn/id` | 5 |
| `eapiPrivateGetMarginAccount` | GET | `marginAccount` | 3 |
| `eapiPrivateGetMmp` | GET | `mmp` | 1 |
| `eapiPrivateGetCountdownCancelAll` | GET | `countdownCancelAll` | 1 |
| `eapiPrivateGetOrder` | GET | `order` | 1 |
| `eapiPrivateGetBlockOrderOrders` | GET | `block/order/orders` | 5 |
| `eapiPrivateGetBlockOrderExecute` | GET | `block/order/execute` | 5 |
| `eapiPrivateGetBlockUserTrades` | GET | `block/user-trades` | 5 |
| `eapiPrivateGetBlockTrades` | GET | `blockTrades` | 5 |
| `eapiPrivateGetComission` | GET | `comission` | 5 |
| `eapiPrivatePostOrder` | POST | `order` | 1 |
| `eapiPrivatePostBatchOrders` | POST | `batchOrders` | 5 |
| `eapiPrivatePostListenKey` | POST | `listenKey` | 1 |
| `eapiPrivatePostMmpSet` | POST | `mmpSet` | 1 |
| `eapiPrivatePostMmpReset` | POST | `mmpReset` | 1 |
| `eapiPrivatePostCountdownCancelAll` | POST | `countdownCancelAll` | 1 |
| `eapiPrivatePostCountdownCancelAllHeartBeat` | POST | `countdownCancelAllHeartBeat` | 10 |
| `eapiPrivatePostBlockOrderCreate` | POST | `block/order/create` | 5 |
| `eapiPrivatePostBlockOrderExecute` | POST | `block/order/execute` | 5 |
| `eapiPrivatePutListenKey` | PUT | `listenKey` | 1 |
| `eapiPrivatePutBlockOrderCreate` | PUT | `block/order/create` | 5 |
| `eapiPrivateDeleteOrder` | DELETE | `order` | 1 |
| `eapiPrivateDeleteBatchOrders` | DELETE | `batchOrders` | 1 |
| `eapiPrivateDeleteAllOpenOrders` | DELETE | `allOpenOrders` | 1 |
| `eapiPrivateDeleteAllOpenOrdersByUnderlying` | DELETE | `allOpenOrdersByUnderlying` | 1 |
| `eapiPrivateDeleteListenKey` | DELETE | `listenKey` | 1 |
| `eapiPrivateDeleteBlockOrderCreate` | DELETE | `block/order/create` | 5 |

## public

**Base URL**: `https://api.binance.us/api/v3`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetPing` | GET | `ping` | 1 |
| `publicGetTime` | GET | `time` | 1 |
| `publicGetDepth` | GET | `depth` | 1 |
| `publicGetTrades` | GET | `trades` | 1 |
| `publicGetAggTrades` | GET | `aggTrades` | 1 |
| `publicGetHistoricalTrades` | GET | `historicalTrades` | 5 |
| `publicGetKlines` | GET | `klines` | 1 |
| `publicGetUiKlines` | GET | `uiKlines` | 0.4 |
| `publicGetTicker24hr` | GET | `ticker/24hr` | 1 |
| `publicGetTicker` | GET | `ticker` | 2 |
| `publicGetTickerTradingDay` | GET | `ticker/tradingDay` | 0.8 |
| `publicGetTickerPrice` | GET | `ticker/price` | 1 |
| `publicGetTickerBookTicker` | GET | `ticker/bookTicker` | 1 |
| `publicGetExchangeInfo` | GET | `exchangeInfo` | 10 |
| `publicGetAvgPrice` | GET | `avgPrice` | 1 |
| `publicPutUserDataStream` | PUT | `userDataStream` | 0.4 |
| `publicPostUserDataStream` | POST | `userDataStream` | 0.4 |
| `publicDeleteUserDataStream` | DELETE | `userDataStream` | 0.4 |

## private

**Base URL**: `https://api.binance.us/api/v3`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAllOrderList` | GET | `allOrderList` | 10 |
| `privateGetOpenOrderList` | GET | `openOrderList` | 3 |
| `privateGetOrderList` | GET | `orderList` | 2 |
| `privateGetOrder` | GET | `order` | 2 |
| `privateGetOpenOrders` | GET | `openOrders` | 3 |
| `privateGetAllOrders` | GET | `allOrders` | 10 |
| `privateGetAccount` | GET | `account` | 10 |
| `privateGetMyTrades` | GET | `myTrades` | 10 |
| `privateGetRateLimitOrder` | GET | `rateLimit/order` | 20 |
| `privateGetMyPreventedMatches` | GET | `myPreventedMatches` | 10 |
| `privateGetMyAllocations` | GET | `myAllocations` | 4 |
| `privateGetAccountCommission` | GET | `account/commission` | 4 |
| `privatePostOrderOco` | POST | `order/oco` | 1 |
| `privatePostOrderListOco` | POST | `orderList/oco` | 0.2 |
| `privatePostOrderListOto` | POST | `orderList/oto` | 0.2 |
| `privatePostOrderListOtoco` | POST | `orderList/otoco` | 0.2 |
| `privatePostOrderListOpo` | POST | `orderList/opo` | 0.2 |
| `privatePostOrderListOpoco` | POST | `orderList/opoco` | 0.2 |
| `privatePostSorOrder` | POST | `sor/order` | 0.2 |
| `privatePostSorOrderTest` | POST | `sor/order/test` | 0.2 |
| `privatePostOrder` | POST | `order` | 1 |
| `privatePostOrderCancelReplace` | POST | `order/cancelReplace` | 1 |
| `privatePostOrderTest` | POST | `order/test` | 1 |
| `privateDeleteOpenOrders` | DELETE | `openOrders` | 1 |
| `privateDeleteOrderList` | DELETE | `orderList` | 1 |
| `privateDeleteOrder` | DELETE | `order` | 1 |

## papi

**Base URL**: `https://papi.binance.com/papi/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `papiGetPing` | GET | `ping` | 0.2 |
| `papiGetUmOrder` | GET | `um/order` | 1 |
| `papiGetUmOpenOrder` | GET | `um/openOrder` | 1 |
| `papiGetUmOpenOrders` | GET | `um/openOrders` | 1 |
| `papiGetUmAllOrders` | GET | `um/allOrders` | 5 |
| `papiGetCmOrder` | GET | `cm/order` | 1 |
| `papiGetCmOpenOrder` | GET | `cm/openOrder` | 1 |
| `papiGetCmOpenOrders` | GET | `cm/openOrders` | 1 |
| `papiGetCmAllOrders` | GET | `cm/allOrders` | 20 |
| `papiGetUmConditionalOpenOrder` | GET | `um/conditional/openOrder` | 1 |
| `papiGetUmConditionalOpenOrders` | GET | `um/conditional/openOrders` | 1 |
| `papiGetUmConditionalOrderHistory` | GET | `um/conditional/orderHistory` | 1 |
| `papiGetUmConditionalAllOrders` | GET | `um/conditional/allOrders` | 1 |
| `papiGetCmConditionalOpenOrder` | GET | `cm/conditional/openOrder` | 1 |
| `papiGetCmConditionalOpenOrders` | GET | `cm/conditional/openOrders` | 1 |
| `papiGetCmConditionalOrderHistory` | GET | `cm/conditional/orderHistory` | 1 |
| `papiGetCmConditionalAllOrders` | GET | `cm/conditional/allOrders` | 40 |
| `papiGetMarginOrder` | GET | `margin/order` | 10 |
| `papiGetMarginOpenOrders` | GET | `margin/openOrders` | 5 |
| `papiGetMarginAllOrders` | GET | `margin/allOrders` | 100 |
| `papiGetMarginOrderList` | GET | `margin/orderList` | 5 |
| `papiGetMarginAllOrderList` | GET | `margin/allOrderList` | 100 |
| `papiGetMarginOpenOrderList` | GET | `margin/openOrderList` | 5 |
| `papiGetMarginMyTrades` | GET | `margin/myTrades` | 5 |
| `papiGetBalance` | GET | `balance` | 4 |
| `papiGetAccount` | GET | `account` | 4 |
| `papiGetMarginMaxBorrowable` | GET | `margin/maxBorrowable` | 1 |
| `papiGetMarginMaxWithdraw` | GET | `margin/maxWithdraw` | 1 |
| `papiGetUmPositionRisk` | GET | `um/positionRisk` | 1 |
| `papiGetCmPositionRisk` | GET | `cm/positionRisk` | 0.2 |
| `papiGetUmPositionSideDual` | GET | `um/positionSide/dual` | 6 |
| `papiGetCmPositionSideDual` | GET | `cm/positionSide/dual` | 6 |
| `papiGetUmUserTrades` | GET | `um/userTrades` | 5 |
| `papiGetCmUserTrades` | GET | `cm/userTrades` | 20 |
| `papiGetUmLeverageBracket` | GET | `um/leverageBracket` | 0.2 |
| `papiGetCmLeverageBracket` | GET | `cm/leverageBracket` | 0.2 |
| `papiGetMarginForceOrders` | GET | `margin/forceOrders` | 1 |
| `papiGetUmForceOrders` | GET | `um/forceOrders` | 20 |
| `papiGetCmForceOrders` | GET | `cm/forceOrders` | 20 |
| `papiGetUmApiTradingStatus` | GET | `um/apiTradingStatus` | 0.2 |
| `papiGetUmCommissionRate` | GET | `um/commissionRate` | 4 |
| `papiGetCmCommissionRate` | GET | `cm/commissionRate` | 4 |
| `papiGetMarginMarginLoan` | GET | `margin/marginLoan` | 2 |
| `papiGetMarginRepayLoan` | GET | `margin/repayLoan` | 2 |
| `papiGetMarginMarginInterestHistory` | GET | `margin/marginInterestHistory` | 0.2 |
| `papiGetPortfolioInterestHistory` | GET | `portfolio/interest-history` | 10 |
| `papiGetUmIncome` | GET | `um/income` | 6 |
| `papiGetCmIncome` | GET | `cm/income` | 6 |
| `papiGetUmAccount` | GET | `um/account` | 1 |
| `papiGetCmAccount` | GET | `cm/account` | 1 |
| `papiGetRepayFuturesSwitch` | GET | `repay-futures-switch` | 6 |
| `papiGetUmAdlQuantile` | GET | `um/adlQuantile` | 5 |
| `papiGetCmAdlQuantile` | GET | `cm/adlQuantile` | 5 |
| `papiGetUmTradeAsyn` | GET | `um/trade/asyn` | 300 |
| `papiGetUmTradeAsynId` | GET | `um/trade/asyn/id` | 2 |
| `papiGetUmOrderAsyn` | GET | `um/order/asyn` | 300 |
| `papiGetUmOrderAsynId` | GET | `um/order/asyn/id` | 2 |
| `papiGetUmIncomeAsyn` | GET | `um/income/asyn` | 300 |
| `papiGetUmIncomeAsynId` | GET | `um/income/asyn/id` | 2 |
| `papiGetUmOrderAmendment` | GET | `um/orderAmendment` | 1 |
| `papiGetCmOrderAmendment` | GET | `cm/orderAmendment` | 1 |
| `papiGetUmFeeBurn` | GET | `um/feeBurn` | 30 |
| `papiGetUmAccountConfig` | GET | `um/accountConfig` | 1 |
| `papiGetUmSymbolConfig` | GET | `um/symbolConfig` | 1 |
| `papiGetCmAccountConfig` | GET | `cm/accountConfig` | 1 |
| `papiGetCmSymbolConfig` | GET | `cm/symbolConfig` | 1 |
| `papiGetRateLimitOrder` | GET | `rateLimit/order` | 1 |
| `papiPostUmOrder` | POST | `um/order` | 1 |
| `papiPostUmConditionalOrder` | POST | `um/conditional/order` | 1 |
| `papiPostCmOrder` | POST | `cm/order` | 1 |
| `papiPostCmConditionalOrder` | POST | `cm/conditional/order` | 1 |
| `papiPostMarginOrder` | POST | `margin/order` | 1 |
| `papiPostMarginLoan` | POST | `marginLoan` | 100 |
| `papiPostRepayLoan` | POST | `repayLoan` | 100 |
| `papiPostMarginOrderOco` | POST | `margin/order/oco` | 1 |
| `papiPostUmLeverage` | POST | `um/leverage` | 0.2 |
| `papiPostCmLeverage` | POST | `cm/leverage` | 0.2 |
| `papiPostUmPositionSideDual` | POST | `um/positionSide/dual` | 0.2 |
| `papiPostCmPositionSideDual` | POST | `cm/positionSide/dual` | 0.2 |
| `papiPostAutoCollection` | POST | `auto-collection` | 150 |
| `papiPostBnbTransfer` | POST | `bnb-transfer` | 150 |
| `papiPostRepayFuturesSwitch` | POST | `repay-futures-switch` | 150 |
| `papiPostRepayFuturesNegativeBalance` | POST | `repay-futures-negative-balance` | 150 |
| `papiPostListenKey` | POST | `listenKey` | 0.2 |
| `papiPostAssetCollection` | POST | `asset-collection` | 6 |
| `papiPostMarginRepayDebt` | POST | `margin/repay-debt` | 3000 |
| `papiPostUmFeeBurn` | POST | `um/feeBurn` | 1 |
| `papiPostUmStockContract` | POST | `um/stock/contract` | 1 |
| `papiPutListenKey` | PUT | `listenKey` | 0.2 |
| `papiPutUmOrder` | PUT | `um/order` | 1 |
| `papiPutCmOrder` | PUT | `cm/order` | 1 |
| `papiDeleteUmOrder` | DELETE | `um/order` | 1 |
| `papiDeleteUmConditionalOrder` | DELETE | `um/conditional/order` | 1 |
| `papiDeleteUmAllOpenOrders` | DELETE | `um/allOpenOrders` | 1 |
| `papiDeleteUmConditionalAllOpenOrders` | DELETE | `um/conditional/allOpenOrders` | 1 |
| `papiDeleteCmOrder` | DELETE | `cm/order` | 1 |
| `papiDeleteCmConditionalOrder` | DELETE | `cm/conditional/order` | 1 |
| `papiDeleteCmAllOpenOrders` | DELETE | `cm/allOpenOrders` | 1 |
| `papiDeleteCmConditionalAllOpenOrders` | DELETE | `cm/conditional/allOpenOrders` | 1 |
| `papiDeleteMarginOrder` | DELETE | `margin/order` | 2 |
| `papiDeleteMarginAllOpenOrders` | DELETE | `margin/allOpenOrders` | 5 |
| `papiDeleteMarginOrderList` | DELETE | `margin/orderList` | 2 |
| `papiDeleteListenKey` | DELETE | `listenKey` | 0.2 |

## papiV2

**Base URL**: `https://papi.binance.com/papi/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `papiV2GetUmAccount` | GET | `um/account` | 1 |

