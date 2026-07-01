Every endpoint in `bybiteu`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bybiteu) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetSpotV3PublicSymbols`); the snake_case alias (`public_get_spot_v3_public_symbols`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetSpotV3PublicSymbols`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bybiteu = new ccxt.bybiteu ();
const response = await bybiteu.publicGetSpotV3PublicSymbols (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bybiteu = new ccxt.bybiteu ();
const response = await bybiteu.publicGetSpotV3PublicSymbols (params);
```

#### **Python**

```python
import ccxt
bybiteu = ccxt.bybiteu()
response = bybiteu.public_get_spot_v3_public_symbols(params)
```

#### **PHP**

```php
$bybiteu = new \ccxt\bybiteu();
$response = $bybiteu->public_get_spot_v3_public_symbols($params);
```

#### **C#**

```csharp
using ccxt;
var bybiteu = new Bybiteu();
var response = await bybiteu.publicGetSpotV3PublicSymbols(parameters);
```

#### **Go**

```go
bybiteu := ccxt.NewBybiteu(nil)
response := <-bybiteu.PublicGetSpotV3PublicSymbols(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bybiteu API documentation:** [bybit-exchange.github.io](https://bybit-exchange.github.io/docs/inverse/) · [bybit-exchange.github.io](https://bybit-exchange.github.io/docs/linear/) · [github.com](https://github.com/bybit-exchange)

> 403 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetSpotV3PublicSymbols` | GET | `spot/v3/public/symbols` | 1 |
| `publicGetSpotV3PublicQuoteDepth` | GET | `spot/v3/public/quote/depth` | 1 |
| `publicGetSpotV3PublicQuoteDepthMerged` | GET | `spot/v3/public/quote/depth/merged` | 1 |
| `publicGetSpotV3PublicQuoteTrades` | GET | `spot/v3/public/quote/trades` | 1 |
| `publicGetSpotV3PublicQuoteKline` | GET | `spot/v3/public/quote/kline` | 1 |
| `publicGetSpotV3PublicQuoteTicker24hr` | GET | `spot/v3/public/quote/ticker/24hr` | 1 |
| `publicGetSpotV3PublicQuoteTickerPrice` | GET | `spot/v3/public/quote/ticker/price` | 1 |
| `publicGetSpotV3PublicQuoteTickerBookTicker` | GET | `spot/v3/public/quote/ticker/bookTicker` | 1 |
| `publicGetSpotV3PublicServerTime` | GET | `spot/v3/public/server-time` | 1 |
| `publicGetSpotV3PublicInfos` | GET | `spot/v3/public/infos` | 1 |
| `publicGetSpotV3PublicMarginProductInfos` | GET | `spot/v3/public/margin-product-infos` | 1 |
| `publicGetSpotV3PublicMarginEnsureTokens` | GET | `spot/v3/public/margin-ensure-tokens` | 1 |
| `publicGetV3PublicTime` | GET | `v3/public/time` | 1 |
| `publicGetContractV3PublicCopytradingSymbolList` | GET | `contract/v3/public/copytrading/symbol/list` | 1 |
| `publicGetDerivativesV3PublicOrderBookL2` | GET | `derivatives/v3/public/order-book/L2` | 1 |
| `publicGetDerivativesV3PublicKline` | GET | `derivatives/v3/public/kline` | 1 |
| `publicGetDerivativesV3PublicTickers` | GET | `derivatives/v3/public/tickers` | 1 |
| `publicGetDerivativesV3PublicInstrumentsInfo` | GET | `derivatives/v3/public/instruments-info` | 1 |
| `publicGetDerivativesV3PublicMarkPriceKline` | GET | `derivatives/v3/public/mark-price-kline` | 1 |
| `publicGetDerivativesV3PublicIndexPriceKline` | GET | `derivatives/v3/public/index-price-kline` | 1 |
| `publicGetDerivativesV3PublicFundingHistoryFundingRate` | GET | `derivatives/v3/public/funding/history-funding-rate` | 1 |
| `publicGetDerivativesV3PublicRiskLimitList` | GET | `derivatives/v3/public/risk-limit/list` | 1 |
| `publicGetDerivativesV3PublicDeliveryPrice` | GET | `derivatives/v3/public/delivery-price` | 1 |
| `publicGetDerivativesV3PublicRecentTrade` | GET | `derivatives/v3/public/recent-trade` | 1 |
| `publicGetDerivativesV3PublicOpenInterest` | GET | `derivatives/v3/public/open-interest` | 1 |
| `publicGetDerivativesV3PublicInsurance` | GET | `derivatives/v3/public/insurance` | 1 |
| `publicGetV5AnnouncementsIndex` | GET | `v5/announcements/index` | 5 |
| `publicGetV5SystemStatus` | GET | `v5/system/status` | 5 |
| `publicGetV5MarketTime` | GET | `v5/market/time` | 5 |
| `publicGetV5MarketKline` | GET | `v5/market/kline` | 5 |
| `publicGetV5MarketMarkPriceKline` | GET | `v5/market/mark-price-kline` | 5 |
| `publicGetV5MarketIndexPriceKline` | GET | `v5/market/index-price-kline` | 5 |
| `publicGetV5MarketPremiumIndexPriceKline` | GET | `v5/market/premium-index-price-kline` | 5 |
| `publicGetV5MarketInstrumentsInfo` | GET | `v5/market/instruments-info` | 5 |
| `publicGetV5MarketOrderbook` | GET | `v5/market/orderbook` | 5 |
| `publicGetV5MarketRpiOrderbook` | GET | `v5/market/rpi_orderbook` | 5 |
| `publicGetV5MarketFullOrderbook` | GET | `v5/market/full_orderbook` | 5 |
| `publicGetV5MarketTickers` | GET | `v5/market/tickers` | 5 |
| `publicGetV5MarketFundingHistory` | GET | `v5/market/funding/history` | 5 |
| `publicGetV5MarketRecentTrade` | GET | `v5/market/recent-trade` | 5 |
| `publicGetV5MarketOpenInterest` | GET | `v5/market/open-interest` | 5 |
| `publicGetV5MarketHistoricalVolatility` | GET | `v5/market/historical-volatility` | 5 |
| `publicGetV5MarketInsurance` | GET | `v5/market/insurance` | 5 |
| `publicGetV5MarketRiskLimit` | GET | `v5/market/risk-limit` | 5 |
| `publicGetV5MarketDeliveryPrice` | GET | `v5/market/delivery-price` | 5 |
| `publicGetV5MarketNewDeliveryPrice` | GET | `v5/market/new-delivery-price` | 5 |
| `publicGetV5MarketAccountRatio` | GET | `v5/market/account-ratio` | 5 |
| `publicGetV5MarketIndexPriceComponents` | GET | `v5/market/index-price-components` | 5 |
| `publicGetV5MarketPriceLimit` | GET | `v5/market/price-limit` | 5 |
| `publicGetV5MarketAdlAlert` | GET | `v5/market/adlAlert` | 5 |
| `publicGetV5MarketFeeGroupInfo` | GET | `v5/market/fee-group-info` | 5 |
| `publicGetV5SpotLeverTokenInfo` | GET | `v5/spot-lever-token/info` | 5 |
| `publicGetV5SpotLeverTokenReference` | GET | `v5/spot-lever-token/reference` | 5 |
| `publicGetV5SpotMarginTradeData` | GET | `v5/spot-margin-trade/data` | 5 |
| `publicGetV5SpotMarginTradeCollateral` | GET | `v5/spot-margin-trade/collateral` | 5 |
| `publicGetV5SpotCrossMarginTradeData` | GET | `v5/spot-cross-margin-trade/data` | 5 |
| `publicGetV5SpotCrossMarginTradePledgeToken` | GET | `v5/spot-cross-margin-trade/pledge-token` | 5 |
| `publicGetV5SpotCrossMarginTradeBorrowToken` | GET | `v5/spot-cross-margin-trade/borrow-token` | 5 |
| `publicGetV5CryptoLoanCollateralData` | GET | `v5/crypto-loan/collateral-data` | 5 |
| `publicGetV5CryptoLoanLoanableData` | GET | `v5/crypto-loan/loanable-data` | 5 |
| `publicGetV5CryptoLoanCommonLoanableData` | GET | `v5/crypto-loan-common/loanable-data` | 5 |
| `publicGetV5CryptoLoanCommonCollateralData` | GET | `v5/crypto-loan-common/collateral-data` | 5 |
| `publicGetV5CryptoLoanFixedSupplyOrderQuote` | GET | `v5/crypto-loan-fixed/supply-order-quote` | 5 |
| `publicGetV5CryptoLoanFixedBorrowOrderQuote` | GET | `v5/crypto-loan-fixed/borrow-order-quote` | 5 |
| `publicGetV5InsLoanProductInfos` | GET | `v5/ins-loan/product-infos` | 5 |
| `publicGetV5InsLoanEnsureTokensConvert` | GET | `v5/ins-loan/ensure-tokens-convert` | 5 |
| `publicGetV5EarnProduct` | GET | `v5/earn/product` | 5 |

## private

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetV5MarketInstrumentsInfo` | GET | `v5/market/instruments-info` | 5 |
| `privateGetV2PrivateWalletFundRecords` | GET | `v2/private/wallet/fund/records` | 25 |
| `privateGetSpotV3PrivateOrder` | GET | `spot/v3/private/order` | 2.5 |
| `privateGetSpotV3PrivateOpenOrders` | GET | `spot/v3/private/open-orders` | 2.5 |
| `privateGetSpotV3PrivateHistoryOrders` | GET | `spot/v3/private/history-orders` | 2.5 |
| `privateGetSpotV3PrivateMyTrades` | GET | `spot/v3/private/my-trades` | 2.5 |
| `privateGetSpotV3PrivateAccount` | GET | `spot/v3/private/account` | 2.5 |
| `privateGetSpotV3PrivateReference` | GET | `spot/v3/private/reference` | 2.5 |
| `privateGetSpotV3PrivateRecord` | GET | `spot/v3/private/record` | 2.5 |
| `privateGetSpotV3PrivateCrossMarginOrders` | GET | `spot/v3/private/cross-margin-orders` | 10 |
| `privateGetSpotV3PrivateCrossMarginAccount` | GET | `spot/v3/private/cross-margin-account` | 10 |
| `privateGetSpotV3PrivateCrossMarginLoanInfo` | GET | `spot/v3/private/cross-margin-loan-info` | 10 |
| `privateGetSpotV3PrivateCrossMarginRepayHistory` | GET | `spot/v3/private/cross-margin-repay-history` | 10 |
| `privateGetSpotV3PrivateMarginLoanInfos` | GET | `spot/v3/private/margin-loan-infos` | 10 |
| `privateGetSpotV3PrivateMarginRepaidInfos` | GET | `spot/v3/private/margin-repaid-infos` | 10 |
| `privateGetSpotV3PrivateMarginLtv` | GET | `spot/v3/private/margin-ltv` | 10 |
| `privateGetAssetV3PrivateTransferInterTransferListQuery` | GET | `asset/v3/private/transfer/inter-transfer/list/query` | 50 |
| `privateGetAssetV3PrivateTransferSubMemberListQuery` | GET | `asset/v3/private/transfer/sub-member/list/query` | 50 |
| `privateGetAssetV3PrivateTransferSubMemberTransferListQuery` | GET | `asset/v3/private/transfer/sub-member-transfer/list/query` | 50 |
| `privateGetAssetV3PrivateTransferUniversalTransferListQuery` | GET | `asset/v3/private/transfer/universal-transfer/list/query` | 25 |
| `privateGetAssetV3PrivateCoinInfoQuery` | GET | `asset/v3/private/coin-info/query` | 25 |
| `privateGetAssetV3PrivateDepositAddressQuery` | GET | `asset/v3/private/deposit/address/query` | 10 |
| `privateGetContractV3PrivateCopytradingOrderList` | GET | `contract/v3/private/copytrading/order/list` | 30 |
| `privateGetContractV3PrivateCopytradingPositionList` | GET | `contract/v3/private/copytrading/position/list` | 40 |
| `privateGetContractV3PrivateCopytradingWalletBalance` | GET | `contract/v3/private/copytrading/wallet/balance` | 25 |
| `privateGetContractV3PrivatePositionLimitInfo` | GET | `contract/v3/private/position/limit-info` | 25 |
| `privateGetContractV3PrivateOrderUnfilledOrders` | GET | `contract/v3/private/order/unfilled-orders` | 1 |
| `privateGetContractV3PrivateOrderList` | GET | `contract/v3/private/order/list` | 1 |
| `privateGetContractV3PrivatePositionList` | GET | `contract/v3/private/position/list` | 1 |
| `privateGetContractV3PrivateExecutionList` | GET | `contract/v3/private/execution/list` | 1 |
| `privateGetContractV3PrivatePositionClosedPnl` | GET | `contract/v3/private/position/closed-pnl` | 1 |
| `privateGetContractV3PrivateAccountWalletBalance` | GET | `contract/v3/private/account/wallet/balance` | 1 |
| `privateGetContractV3PrivateAccountFeeRate` | GET | `contract/v3/private/account/fee-rate` | 1 |
| `privateGetContractV3PrivateAccountWalletFundRecords` | GET | `contract/v3/private/account/wallet/fund-records` | 1 |
| `privateGetUnifiedV3PrivateOrderUnfilledOrders` | GET | `unified/v3/private/order/unfilled-orders` | 1 |
| `privateGetUnifiedV3PrivateOrderList` | GET | `unified/v3/private/order/list` | 1 |
| `privateGetUnifiedV3PrivatePositionList` | GET | `unified/v3/private/position/list` | 1 |
| `privateGetUnifiedV3PrivateExecutionList` | GET | `unified/v3/private/execution/list` | 1 |
| `privateGetUnifiedV3PrivateDeliveryRecord` | GET | `unified/v3/private/delivery-record` | 1 |
| `privateGetUnifiedV3PrivateSettlementRecord` | GET | `unified/v3/private/settlement-record` | 1 |
| `privateGetUnifiedV3PrivateAccountWalletBalance` | GET | `unified/v3/private/account/wallet/balance` | 1 |
| `privateGetUnifiedV3PrivateAccountTransactionLog` | GET | `unified/v3/private/account/transaction-log` | 1 |
| `privateGetUnifiedV3PrivateAccountBorrowHistory` | GET | `unified/v3/private/account/borrow-history` | 1 |
| `privateGetUnifiedV3PrivateAccountBorrowRate` | GET | `unified/v3/private/account/borrow-rate` | 1 |
| `privateGetUnifiedV3PrivateAccountInfo` | GET | `unified/v3/private/account/info` | 1 |
| `privateGetUserV3PrivateFrozenSubMember` | GET | `user/v3/private/frozen-sub-member` | 10 |
| `privateGetUserV3PrivateQuerySubMembers` | GET | `user/v3/private/query-sub-members` | 5 |
| `privateGetUserV3PrivateQueryApi` | GET | `user/v3/private/query-api` | 5 |
| `privateGetUserV3PrivateGetMemberType` | GET | `user/v3/private/get-member-type` | 1 |
| `privateGetAssetV3PrivateTransferTransferCoinListQuery` | GET | `asset/v3/private/transfer/transfer-coin/list/query` | 50 |
| `privateGetAssetV3PrivateTransferAccountCoinBalanceQuery` | GET | `asset/v3/private/transfer/account-coin/balance/query` | 50 |
| `privateGetAssetV3PrivateTransferAccountCoinsBalanceQuery` | GET | `asset/v3/private/transfer/account-coins/balance/query` | 25 |
| `privateGetAssetV3PrivateTransferAssetInfoQuery` | GET | `asset/v3/private/transfer/asset-info/query` | 50 |
| `privateGetAssetV3PublicDepositAllowedDepositListQuery` | GET | `asset/v3/public/deposit/allowed-deposit-list/query` | 0.17 |
| `privateGetAssetV3PrivateDepositRecordQuery` | GET | `asset/v3/private/deposit/record/query` | 10 |
| `privateGetAssetV3PrivateWithdrawRecordQuery` | GET | `asset/v3/private/withdraw/record/query` | 10 |
| `privateGetV5OrderRealtime` | GET | `v5/order/realtime` | 5 |
| `privateGetV5OrderHistory` | GET | `v5/order/history` | 5 |
| `privateGetV5OrderSpotBorrowCheck` | GET | `v5/order/spot-borrow-check` | 1 |
| `privateGetV5PositionList` | GET | `v5/position/list` | 5 |
| `privateGetV5ExecutionList` | GET | `v5/execution/list` | 5 |
| `privateGetV5PositionClosedPnl` | GET | `v5/position/closed-pnl` | 5 |
| `privateGetV5PositionGetClosedPositions` | GET | `v5/position/get-closed-positions` | 5 |
| `privateGetV5PositionMoveHistory` | GET | `v5/position/move-history` | 5 |
| `privateGetV5PositionSymbolInfo` | GET | `v5/position/symbol-info` | 5 |
| `privateGetV5PreUpgradeOrderHistory` | GET | `v5/pre-upgrade/order/history` | 5 |
| `privateGetV5PreUpgradeExecutionList` | GET | `v5/pre-upgrade/execution/list` | 5 |
| `privateGetV5PreUpgradePositionClosedPnl` | GET | `v5/pre-upgrade/position/closed-pnl` | 5 |
| `privateGetV5PreUpgradeAccountTransactionLog` | GET | `v5/pre-upgrade/account/transaction-log` | 5 |
| `privateGetV5PreUpgradeAssetDeliveryRecord` | GET | `v5/pre-upgrade/asset/delivery-record` | 5 |
| `privateGetV5PreUpgradeAssetSettlementRecord` | GET | `v5/pre-upgrade/asset/settlement-record` | 5 |
| `privateGetV5AccountWalletBalance` | GET | `v5/account/wallet-balance` | 1 |
| `privateGetV5AccountBorrowHistory` | GET | `v5/account/borrow-history` | 1 |
| `privateGetV5AccountInstrumentsInfo` | GET | `v5/account/instruments-info` | 1 |
| `privateGetV5AccountCollateralInfo` | GET | `v5/account/collateral-info` | 1 |
| `privateGetV5AccountOptionAssetInfo` | GET | `v5/account/option-asset-info` | 1 |
| `privateGetV5AssetCoinGreeks` | GET | `v5/asset/coin-greeks` | 1 |
| `privateGetV5AccountFeeRate` | GET | `v5/account/fee-rate` | 10 |
| `privateGetV5AccountInfo` | GET | `v5/account/info` | 5 |
| `privateGetV5AccountTransactionLog` | GET | `v5/account/transaction-log` | 1.66 |
| `privateGetV5AccountContractTransactionLog` | GET | `v5/account/contract-transaction-log` | 1 |
| `privateGetV5AccountQueryDcpInfo` | GET | `v5/account/query-dcp-info` | 5 |
| `privateGetV5AccountUserSettingConfig` | GET | `v5/account/user-setting-config` | 5 |
| `privateGetV5AccountPayInfo` | GET | `v5/account/pay-info` | 5 |
| `privateGetV5AccountTradeInfoForAnalysis` | GET | `v5/account/trade-info-for-analysis` | 5 |
| `privateGetV5AccountSmpGroup` | GET | `v5/account/smp-group` | 1 |
| `privateGetV5AccountMmpState` | GET | `v5/account/mmp-state` | 5 |
| `privateGetV5AccountWithdrawal` | GET | `v5/account/withdrawal` | 5 |
| `privateGetV5AssetAssetOverview` | GET | `v5/asset/asset-overview` | 5 |
| `privateGetV5AssetExchangeQueryCoinList` | GET | `v5/asset/exchange/query-coin-list` | 0.5 |
| `privateGetV5AssetExchangeConvertResultQuery` | GET | `v5/asset/exchange/convert-result-query` | 0.5 |
| `privateGetV5AssetExchangeQueryConvertHistory` | GET | `v5/asset/exchange/query-convert-history` | 0.5 |
| `privateGetV5AssetExchangeOrderRecord` | GET | `v5/asset/exchange/order-record` | 5 |
| `privateGetV5AssetFundinghistory` | GET | `v5/asset/fundinghistory` | 5 |
| `privateGetV5AssetPortfolioMargin` | GET | `v5/asset/portfolio-margin` | 5 |
| `privateGetV5AssetTotalMembersAssets` | GET | `v5/asset/total-members-assets` | 5 |
| `privateGetV5AssetDeliveryRecord` | GET | `v5/asset/delivery-record` | 5 |
| `privateGetV5AssetSettlementRecord` | GET | `v5/asset/settlement-record` | 5 |
| `privateGetV5AssetTransferQueryAssetInfo` | GET | `v5/asset/transfer/query-asset-info` | 50 |
| `privateGetV5AssetTransferQueryAccountCoinsBalance` | GET | `v5/asset/transfer/query-account-coins-balance` | 25 |
| `privateGetV5AssetTransferQueryAccountCoinBalance` | GET | `v5/asset/transfer/query-account-coin-balance` | 50 |
| `privateGetV5AssetTransferQueryTransferCoinList` | GET | `v5/asset/transfer/query-transfer-coin-list` | 50 |
| `privateGetV5AssetTransferQueryInterTransferList` | GET | `v5/asset/transfer/query-inter-transfer-list` | 50 |
| `privateGetV5AssetTransferQuerySubMemberList` | GET | `v5/asset/transfer/query-sub-member-list` | 50 |
| `privateGetV5AssetTransferQueryUniversalTransferList` | GET | `v5/asset/transfer/query-universal-transfer-list` | 25 |
| `privateGetV5AssetDepositQueryAllowedList` | GET | `v5/asset/deposit/query-allowed-list` | 5 |
| `privateGetV5AssetDepositQueryRecord` | GET | `v5/asset/deposit/query-record` | 10 |
| `privateGetV5AssetDepositQuerySubMemberRecord` | GET | `v5/asset/deposit/query-sub-member-record` | 10 |
| `privateGetV5AssetDepositQueryInternalRecord` | GET | `v5/asset/deposit/query-internal-record` | 5 |
| `privateGetV5AssetDepositQueryAddress` | GET | `v5/asset/deposit/query-address` | 10 |
| `privateGetV5AssetDepositQuerySubMemberAddress` | GET | `v5/asset/deposit/query-sub-member-address` | 10 |
| `privateGetV5AssetCoinQueryInfo` | GET | `v5/asset/coin/query-info` | 28 |
| `privateGetV5AssetWithdrawQueryAddress` | GET | `v5/asset/withdraw/query-address` | 10 |
| `privateGetV5AssetWithdrawQueryRecord` | GET | `v5/asset/withdraw/query-record` | 10 |
| `privateGetV5AssetWithdrawWithdrawableAmount` | GET | `v5/asset/withdraw/withdrawable-amount` | 5 |
| `privateGetV5AssetWithdrawVaspList` | GET | `v5/asset/withdraw/vasp/list` | 5 |
| `privateGetV5AssetCovertSmallBalanceList` | GET | `v5/asset/covert/small-balance-list` | 5 |
| `privateGetV5AssetCovertSmallBalanceHistory` | GET | `v5/asset/covert/small-balance-history` | 5 |
| `privateGetV5AssetConvertSmallBalanceList` | GET | `v5/asset/convert/small-balance-list` | 5 |
| `privateGetV5AssetConvertSmallBalanceHistory` | GET | `v5/asset/convert/small-balance-history` | 5 |
| `privateGetV5FiatQueryCoinList` | GET | `v5/fiat/query-coin-list` | 5 |
| `privateGetV5FiatReferencePrice` | GET | `v5/fiat/reference-price` | 5 |
| `privateGetV5FiatTradeQuery` | GET | `v5/fiat/trade-query` | 5 |
| `privateGetV5FiatQueryTradeHistory` | GET | `v5/fiat/query-trade-history` | 5 |
| `privateGetV5FiatBalanceQuery` | GET | `v5/fiat/balance-query` | 5 |
| `privateGetV5UserQuerySubMembers` | GET | `v5/user/query-sub-members` | 5 |
| `privateGetV5UserQueryApi` | GET | `v5/user/query-api` | 5 |
| `privateGetV5UserSubApikeys` | GET | `v5/user/sub-apikeys` | 5 |
| `privateGetV5UserGetMemberType` | GET | `v5/user/get-member-type` | 5 |
| `privateGetV5UserAffCustomerInfo` | GET | `v5/user/aff-customer-info` | 5 |
| `privateGetV5UserDelSubmember` | GET | `v5/user/del-submember` | 5 |
| `privateGetV5UserSubmembers` | GET | `v5/user/submembers` | 5 |
| `privateGetV5UserEscrowSubMembers` | GET | `v5/user/escrow_sub_members` | 5 |
| `privateGetV5UserInvitationReferrals` | GET | `v5/user/invitation/referrals` | 5 |
| `privateGetV5AffiliateAffUserList` | GET | `v5/affiliate/aff-user-list` | 5 |
| `privateGetV5AffiliateAffiliateSubList` | GET | `v5/affiliate/affiliate-sub-list` | 5 |
| `privateGetV5SpotLeverTokenOrderRecord` | GET | `v5/spot-lever-token/order-record` | 1 |
| `privateGetV5SpotMarginTradeInterestRateHistory` | GET | `v5/spot-margin-trade/interest-rate-history` | 5 |
| `privateGetV5SpotMarginTradeState` | GET | `v5/spot-margin-trade/state` | 5 |
| `privateGetV5SpotMarginTradeMaxBorrowable` | GET | `v5/spot-margin-trade/max-borrowable` | 5 |
| `privateGetV5SpotMarginTradePositionTiers` | GET | `v5/spot-margin-trade/position-tiers` | 5 |
| `privateGetV5SpotMarginTradeCoinstate` | GET | `v5/spot-margin-trade/coinstate` | 5 |
| `privateGetV5SpotMarginTradeCurrencyData` | GET | `v5/spot-margin-trade/currency-data` | 5 |
| `privateGetV5SpotMarginTradeFixedborrowContractInfo` | GET | `v5/spot-margin-trade/fixedborrow-contract-info` | 5 |
| `privateGetV5SpotMarginTradeFixedborrowOrderInfo` | GET | `v5/spot-margin-trade/fixedborrow-order-info` | 5 |
| `privateGetV5SpotMarginTradeFixedborrowOrderQuote` | GET | `v5/spot-margin-trade/fixedborrow-order-quote` | 5 |
| `privateGetV5SpotMarginTradeLiability` | GET | `v5/spot-margin-trade/liability` | 5 |
| `privateGetV5SpotMarginTradeRepaymentAvailableAmount` | GET | `v5/spot-margin-trade/repayment-available-amount` | 5 |
| `privateGetV5SpotMarginTradeGetAutoRepayMode` | GET | `v5/spot-margin-trade/get-auto-repay-mode` | 5 |
| `privateGetV5SpotCrossMarginTradeLoanInfo` | GET | `v5/spot-cross-margin-trade/loan-info` | 1 |
| `privateGetV5SpotCrossMarginTradeAccount` | GET | `v5/spot-cross-margin-trade/account` | 1 |
| `privateGetV5SpotCrossMarginTradeOrders` | GET | `v5/spot-cross-margin-trade/orders` | 1 |
| `privateGetV5SpotCrossMarginTradeRepayHistory` | GET | `v5/spot-cross-margin-trade/repay-history` | 1 |
| `privateGetV5CryptoLoanBorrowableCollateralisableNumber` | GET | `v5/crypto-loan/borrowable-collateralisable-number` | 5 |
| `privateGetV5CryptoLoanOngoingOrders` | GET | `v5/crypto-loan/ongoing-orders` | 5 |
| `privateGetV5CryptoLoanRepaymentHistory` | GET | `v5/crypto-loan/repayment-history` | 5 |
| `privateGetV5CryptoLoanBorrowHistory` | GET | `v5/crypto-loan/borrow-history` | 5 |
| `privateGetV5CryptoLoanMaxCollateralAmount` | GET | `v5/crypto-loan/max-collateral-amount` | 5 |
| `privateGetV5CryptoLoanAdjustmentHistory` | GET | `v5/crypto-loan/adjustment-history` | 5 |
| `privateGetV5CryptoLoanCommonMaxCollateralAmount` | GET | `v5/crypto-loan-common/max-collateral-amount` | 10 |
| `privateGetV5CryptoLoanCommonAdjustmentHistory` | GET | `v5/crypto-loan-common/adjustment-history` | 10 |
| `privateGetV5CryptoLoanCommonPosition` | GET | `v5/crypto-loan-common/position` | 10 |
| `privateGetV5CryptoLoanFlexibleOngoingCoin` | GET | `v5/crypto-loan-flexible/ongoing-coin` | 10 |
| `privateGetV5CryptoLoanFlexibleBorrowHistory` | GET | `v5/crypto-loan-flexible/borrow-history` | 10 |
| `privateGetV5CryptoLoanFlexibleRepaymentHistory` | GET | `v5/crypto-loan-flexible/repayment-history` | 10 |
| `privateGetV5CryptoLoanFixedBorrowContractInfo` | GET | `v5/crypto-loan-fixed/borrow-contract-info` | 10 |
| `privateGetV5CryptoLoanFixedSupplyContractInfo` | GET | `v5/crypto-loan-fixed/supply-contract-info` | 10 |
| `privateGetV5CryptoLoanFixedBorrowOrderInfo` | GET | `v5/crypto-loan-fixed/borrow-order-info` | 10 |
| `privateGetV5CryptoLoanFixedRenewInfo` | GET | `v5/crypto-loan-fixed/renew-info` | 10 |
| `privateGetV5CryptoLoanFixedSupplyOrderInfo` | GET | `v5/crypto-loan-fixed/supply-order-info` | 10 |
| `privateGetV5CryptoLoanFixedRepaymentHistory` | GET | `v5/crypto-loan-fixed/repayment-history` | 10 |
| `privateGetV5InsLoanProductInfos` | GET | `v5/ins-loan/product-infos` | 5 |
| `privateGetV5InsLoanEnsureTokens` | GET | `v5/ins-loan/ensure-tokens` | 5 |
| `privateGetV5InsLoanEnsureTokensConvert` | GET | `v5/ins-loan/ensure-tokens-convert` | 5 |
| `privateGetV5InsLoanLoanOrder` | GET | `v5/ins-loan/loan-order` | 5 |
| `privateGetV5InsLoanRepaidHistory` | GET | `v5/ins-loan/repaid-history` | 5 |
| `privateGetV5InsLoanLtv` | GET | `v5/ins-loan/ltv` | 5 |
| `privateGetV5InsLoanLtvConvert` | GET | `v5/ins-loan/ltv-convert` | 5 |
| `privateGetV5InsLoanCoinDeltaAmount` | GET | `v5/ins-loan/coin-delta-amount` | 5 |
| `privateGetV5LendingInfo` | GET | `v5/lending/info` | 5 |
| `privateGetV5LendingHistoryOrder` | GET | `v5/lending/history-order` | 5 |
| `privateGetV5LendingAccount` | GET | `v5/lending/account` | 5 |
| `privateGetV5BrokerEarningRecord` | GET | `v5/broker/earning-record` | 5 |
| `privateGetV5BrokerEarningsInfo` | GET | `v5/broker/earnings-info` | 5 |
| `privateGetV5BrokerAccountInfo` | GET | `v5/broker/account-info` | 5 |
| `privateGetV5BrokerAssetQuerySubMemberDepositRecord` | GET | `v5/broker/asset/query-sub-member-deposit-record` | 10 |
| `privateGetV5EarnProduct` | GET | `v5/earn/product` | 5 |
| `privateGetV5EarnOrder` | GET | `v5/earn/order` | 5 |
| `privateGetV5EarnPosition` | GET | `v5/earn/position` | 5 |
| `privateGetV5EarnYield` | GET | `v5/earn/yield` | 5 |
| `privateGetV5EarnHourlyYield` | GET | `v5/earn/hourly-yield` | 5 |
| `privatePostSpotV3PrivateOrder` | POST | `spot/v3/private/order` | 2.5 |
| `privatePostSpotV3PrivateCancelOrder` | POST | `spot/v3/private/cancel-order` | 2.5 |
| `privatePostSpotV3PrivateCancelOrders` | POST | `spot/v3/private/cancel-orders` | 2.5 |
| `privatePostSpotV3PrivateCancelOrdersByIds` | POST | `spot/v3/private/cancel-orders-by-ids` | 2.5 |
| `privatePostSpotV3PrivatePurchase` | POST | `spot/v3/private/purchase` | 2.5 |
| `privatePostSpotV3PrivateRedeem` | POST | `spot/v3/private/redeem` | 2.5 |
| `privatePostSpotV3PrivateCrossMarginLoan` | POST | `spot/v3/private/cross-margin-loan` | 10 |
| `privatePostSpotV3PrivateCrossMarginRepay` | POST | `spot/v3/private/cross-margin-repay` | 10 |
| `privatePostAssetV3PrivateTransferInterTransfer` | POST | `asset/v3/private/transfer/inter-transfer` | 150 |
| `privatePostAssetV3PrivateWithdrawCreate` | POST | `asset/v3/private/withdraw/create` | 300 |
| `privatePostAssetV3PrivateWithdrawCancel` | POST | `asset/v3/private/withdraw/cancel` | 50 |
| `privatePostAssetV3PrivateTransferSubMemberTransfer` | POST | `asset/v3/private/transfer/sub-member-transfer` | 150 |
| `privatePostAssetV3PrivateTransferTransferSubMemberSave` | POST | `asset/v3/private/transfer/transfer-sub-member-save` | 150 |
| `privatePostAssetV3PrivateTransferUniversalTransfer` | POST | `asset/v3/private/transfer/universal-transfer` | 10 |
| `privatePostUserV3PrivateCreateSubMember` | POST | `user/v3/private/create-sub-member` | 10 |
| `privatePostUserV3PrivateCreateSubApi` | POST | `user/v3/private/create-sub-api` | 10 |
| `privatePostUserV3PrivateUpdateApi` | POST | `user/v3/private/update-api` | 10 |
| `privatePostUserV3PrivateDeleteApi` | POST | `user/v3/private/delete-api` | 10 |
| `privatePostUserV3PrivateUpdateSubApi` | POST | `user/v3/private/update-sub-api` | 10 |
| `privatePostUserV3PrivateDeleteSubApi` | POST | `user/v3/private/delete-sub-api` | 10 |
| `privatePostContractV3PrivateCopytradingOrderCreate` | POST | `contract/v3/private/copytrading/order/create` | 30 |
| `privatePostContractV3PrivateCopytradingOrderCancel` | POST | `contract/v3/private/copytrading/order/cancel` | 30 |
| `privatePostContractV3PrivateCopytradingOrderClose` | POST | `contract/v3/private/copytrading/order/close` | 30 |
| `privatePostContractV3PrivateCopytradingPositionClose` | POST | `contract/v3/private/copytrading/position/close` | 40 |
| `privatePostContractV3PrivateCopytradingPositionSetLeverage` | POST | `contract/v3/private/copytrading/position/set-leverage` | 40 |
| `privatePostContractV3PrivateCopytradingWalletTransfer` | POST | `contract/v3/private/copytrading/wallet/transfer` | 25 |
| `privatePostContractV3PrivateCopytradingOrderTradingStop` | POST | `contract/v3/private/copytrading/order/trading-stop` | 2.5 |
| `privatePostContractV3PrivateOrderCreate` | POST | `contract/v3/private/order/create` | 1 |
| `privatePostContractV3PrivateOrderCancel` | POST | `contract/v3/private/order/cancel` | 1 |
| `privatePostContractV3PrivateOrderCancelAll` | POST | `contract/v3/private/order/cancel-all` | 1 |
| `privatePostContractV3PrivateOrderReplace` | POST | `contract/v3/private/order/replace` | 1 |
| `privatePostContractV3PrivatePositionSetAutoAddMargin` | POST | `contract/v3/private/position/set-auto-add-margin` | 1 |
| `privatePostContractV3PrivatePositionSwitchIsolated` | POST | `contract/v3/private/position/switch-isolated` | 1 |
| `privatePostContractV3PrivatePositionSwitchMode` | POST | `contract/v3/private/position/switch-mode` | 1 |
| `privatePostContractV3PrivatePositionSwitchTpslMode` | POST | `contract/v3/private/position/switch-tpsl-mode` | 1 |
| `privatePostContractV3PrivatePositionSetLeverage` | POST | `contract/v3/private/position/set-leverage` | 1 |
| `privatePostContractV3PrivatePositionTradingStop` | POST | `contract/v3/private/position/trading-stop` | 1 |
| `privatePostContractV3PrivatePositionSetRiskLimit` | POST | `contract/v3/private/position/set-risk-limit` | 1 |
| `privatePostContractV3PrivateAccountSetMarginMode` | POST | `contract/v3/private/account/setMarginMode` | 1 |
| `privatePostUnifiedV3PrivateOrderCreate` | POST | `unified/v3/private/order/create` | 30 |
| `privatePostUnifiedV3PrivateOrderReplace` | POST | `unified/v3/private/order/replace` | 30 |
| `privatePostUnifiedV3PrivateOrderCancel` | POST | `unified/v3/private/order/cancel` | 30 |
| `privatePostUnifiedV3PrivateOrderCreateBatch` | POST | `unified/v3/private/order/create-batch` | 30 |
| `privatePostUnifiedV3PrivateOrderReplaceBatch` | POST | `unified/v3/private/order/replace-batch` | 30 |
| `privatePostUnifiedV3PrivateOrderCancelBatch` | POST | `unified/v3/private/order/cancel-batch` | 30 |
| `privatePostUnifiedV3PrivateOrderCancelAll` | POST | `unified/v3/private/order/cancel-all` | 30 |
| `privatePostUnifiedV3PrivatePositionSetLeverage` | POST | `unified/v3/private/position/set-leverage` | 2.5 |
| `privatePostUnifiedV3PrivatePositionTpslSwitchMode` | POST | `unified/v3/private/position/tpsl/switch-mode` | 2.5 |
| `privatePostUnifiedV3PrivatePositionSetRiskLimit` | POST | `unified/v3/private/position/set-risk-limit` | 2.5 |
| `privatePostUnifiedV3PrivatePositionTradingStop` | POST | `unified/v3/private/position/trading-stop` | 2.5 |
| `privatePostUnifiedV3PrivateAccountUpgradeUnifiedAccount` | POST | `unified/v3/private/account/upgrade-unified-account` | 2.5 |
| `privatePostUnifiedV3PrivateAccountSetMarginMode` | POST | `unified/v3/private/account/setMarginMode` | 2.5 |
| `privatePostFhtComplianceTaxV3PrivateRegistertime` | POST | `fht/compliance/tax/v3/private/registertime` | 50 |
| `privatePostFhtComplianceTaxV3PrivateCreate` | POST | `fht/compliance/tax/v3/private/create` | 50 |
| `privatePostFhtComplianceTaxV3PrivateStatus` | POST | `fht/compliance/tax/v3/private/status` | 50 |
| `privatePostFhtComplianceTaxV3PrivateUrl` | POST | `fht/compliance/tax/v3/private/url` | 50 |
| `privatePostV5OrderCreate` | POST | `v5/order/create` | 2.5 |
| `privatePostV5OrderAmend` | POST | `v5/order/amend` | 5 |
| `privatePostV5OrderCancel` | POST | `v5/order/cancel` | 2.5 |
| `privatePostV5OrderCancelAll` | POST | `v5/order/cancel-all` | 50 |
| `privatePostV5OrderCreateBatch` | POST | `v5/order/create-batch` | 5 |
| `privatePostV5OrderAmendBatch` | POST | `v5/order/amend-batch` | 5 |
| `privatePostV5OrderCancelBatch` | POST | `v5/order/cancel-batch` | 5 |
| `privatePostV5OrderDisconnectedCancelAll` | POST | `v5/order/disconnected-cancel-all` | 5 |
| `privatePostV5OrderPreCheck` | POST | `v5/order/pre-check` | 5 |
| `privatePostV5PositionSetLeverage` | POST | `v5/position/set-leverage` | 5 |
| `privatePostV5PositionSwitchIsolated` | POST | `v5/position/switch-isolated` | 5 |
| `privatePostV5PositionSetTpslMode` | POST | `v5/position/set-tpsl-mode` | 5 |
| `privatePostV5PositionSwitchMode` | POST | `v5/position/switch-mode` | 5 |
| `privatePostV5PositionSetRiskLimit` | POST | `v5/position/set-risk-limit` | 5 |
| `privatePostV5PositionTradingStop` | POST | `v5/position/trading-stop` | 5 |
| `privatePostV5PositionSetAutoAddMargin` | POST | `v5/position/set-auto-add-margin` | 5 |
| `privatePostV5PositionAddMargin` | POST | `v5/position/add-margin` | 5 |
| `privatePostV5PositionMovePositions` | POST | `v5/position/move-positions` | 5 |
| `privatePostV5PositionConfirmPendingMmr` | POST | `v5/position/confirm-pending-mmr` | 5 |
| `privatePostV5AccountUpgradeToUta` | POST | `v5/account/upgrade-to-uta` | 5 |
| `privatePostV5AccountQuickRepayment` | POST | `v5/account/quick-repayment` | 5 |
| `privatePostV5AccountSetMarginMode` | POST | `v5/account/set-margin-mode` | 5 |
| `privatePostV5AccountSetHedgingMode` | POST | `v5/account/set-hedging-mode` | 5 |
| `privatePostV5AccountMmpModify` | POST | `v5/account/mmp-modify` | 5 |
| `privatePostV5AccountMmpReset` | POST | `v5/account/mmp-reset` | 5 |
| `privatePostV5AccountBorrow` | POST | `v5/account/borrow` | 5 |
| `privatePostV5AccountRepay` | POST | `v5/account/repay` | 5 |
| `privatePostV5AccountNoConvertRepay` | POST | `v5/account/no-convert-repay` | 5 |
| `privatePostV5AccountSetLimitPxAction` | POST | `v5/account/set-limit-px-action` | 5 |
| `privatePostV5AccountSetDeltaMode` | POST | `v5/account/set-delta-mode` | 5 |
| `privatePostV5AssetExchangeQuoteApply` | POST | `v5/asset/exchange/quote-apply` | 1 |
| `privatePostV5AssetExchangeConvertExecute` | POST | `v5/asset/exchange/convert-execute` | 1 |
| `privatePostV5AssetTransferInterTransfer` | POST | `v5/asset/transfer/inter-transfer` | 50 |
| `privatePostV5AssetTransferSaveTransferSubMember` | POST | `v5/asset/transfer/save-transfer-sub-member` | 150 |
| `privatePostV5AssetTransferUniversalTransfer` | POST | `v5/asset/transfer/universal-transfer` | 10 |
| `privatePostV5AssetDepositDepositToAccount` | POST | `v5/asset/deposit/deposit-to-account` | 5 |
| `privatePostV5AssetTravelRuleDepositSubmit` | POST | `v5/asset/travel-rule/deposit/submit` | 5 |
| `privatePostV5AssetWithdrawCreate` | POST | `v5/asset/withdraw/create` | 50 |
| `privatePostV5AssetWithdrawCancel` | POST | `v5/asset/withdraw/cancel` | 50 |
| `privatePostV5AssetCovertGetQuote` | POST | `v5/asset/covert/get-quote` | 10 |
| `privatePostV5AssetCovertSmallBalanceExecute` | POST | `v5/asset/covert/small-balance-execute` | 10 |
| `privatePostV5FiatQuoteApply` | POST | `v5/fiat/quote-apply` | 10 |
| `privatePostV5FiatTradeExecute` | POST | `v5/fiat/trade-execute` | 10 |
| `privatePostV5UserCreateSubMember` | POST | `v5/user/create-sub-member` | 10 |
| `privatePostV5UserCreateSubApi` | POST | `v5/user/create-sub-api` | 10 |
| `privatePostV5UserFrozenSubMember` | POST | `v5/user/frozen-sub-member` | 10 |
| `privatePostV5UserUpdateApi` | POST | `v5/user/update-api` | 10 |
| `privatePostV5UserUpdateSubApi` | POST | `v5/user/update-sub-api` | 10 |
| `privatePostV5UserDeleteApi` | POST | `v5/user/delete-api` | 10 |
| `privatePostV5UserDeleteSubApi` | POST | `v5/user/delete-sub-api` | 10 |
| `privatePostV5UserAgreement` | POST | `v5/user/agreement` | 10 |
| `privatePostV5UserCreateDemoMember` | POST | `v5/user/create-demo-member` | 10 |
| `privatePostV5SpotLeverTokenPurchase` | POST | `v5/spot-lever-token/purchase` | 2.5 |
| `privatePostV5SpotLeverTokenRedeem` | POST | `v5/spot-lever-token/redeem` | 2.5 |
| `privatePostV5SpotMarginTradeSwitchMode` | POST | `v5/spot-margin-trade/switch-mode` | 5 |
| `privatePostV5SpotMarginTradeSetLeverage` | POST | `v5/spot-margin-trade/set-leverage` | 5 |
| `privatePostV5SpotMarginTradeSetAutoRepayMode` | POST | `v5/spot-margin-trade/set-auto-repay-mode` | 5 |
| `privatePostV5SpotMarginTradeFixedborrow` | POST | `v5/spot-margin-trade/fixedborrow` | 5 |
| `privatePostV5SpotMarginTradeFixedborrowRenew` | POST | `v5/spot-margin-trade/fixedborrow-renew` | 5 |
| `privatePostV5SpotCrossMarginTradeLoan` | POST | `v5/spot-cross-margin-trade/loan` | 2.5 |
| `privatePostV5SpotCrossMarginTradeRepay` | POST | `v5/spot-cross-margin-trade/repay` | 2.5 |
| `privatePostV5SpotCrossMarginTradeSwitch` | POST | `v5/spot-cross-margin-trade/switch` | 2.5 |
| `privatePostV5CryptoLoanBorrow` | POST | `v5/crypto-loan/borrow` | 5 |
| `privatePostV5CryptoLoanRepay` | POST | `v5/crypto-loan/repay` | 5 |
| `privatePostV5CryptoLoanAdjustLtv` | POST | `v5/crypto-loan/adjust-ltv` | 5 |
| `privatePostV5CryptoLoanCommonAdjustLtv` | POST | `v5/crypto-loan-common/adjust-ltv` | 50 |
| `privatePostV5CryptoLoanCommonMaxLoan` | POST | `v5/crypto-loan-common/max-loan` | 10 |
| `privatePostV5CryptoLoanFlexibleBorrow` | POST | `v5/crypto-loan-flexible/borrow` | 50 |
| `privatePostV5CryptoLoanFlexibleRepay` | POST | `v5/crypto-loan-flexible/repay` | 50 |
| `privatePostV5CryptoLoanFlexibleRepayCollateral` | POST | `v5/crypto-loan-flexible/repay-collateral` | 50 |
| `privatePostV5CryptoLoanFixedBorrow` | POST | `v5/crypto-loan-fixed/borrow` | 50 |
| `privatePostV5CryptoLoanFixedRenew` | POST | `v5/crypto-loan-fixed/renew` | 50 |
| `privatePostV5CryptoLoanFixedSupply` | POST | `v5/crypto-loan-fixed/supply` | 50 |
| `privatePostV5CryptoLoanFixedBorrowOrderCancel` | POST | `v5/crypto-loan-fixed/borrow-order-cancel` | 50 |
| `privatePostV5CryptoLoanFixedSupplyOrderCancel` | POST | `v5/crypto-loan-fixed/supply-order-cancel` | 50 |
| `privatePostV5CryptoLoanFixedFullyRepay` | POST | `v5/crypto-loan-fixed/fully-repay` | 50 |
| `privatePostV5CryptoLoanFixedRepayCollateral` | POST | `v5/crypto-loan-fixed/repay-collateral` | 50 |
| `privatePostV5InsLoanAssociationUid` | POST | `v5/ins-loan/association-uid` | 5 |
| `privatePostV5InsLoanRepayLoan` | POST | `v5/ins-loan/repay-loan` | 5 |
| `privatePostV5LendingPurchase` | POST | `v5/lending/purchase` | 5 |
| `privatePostV5LendingRedeem` | POST | `v5/lending/redeem` | 5 |
| `privatePostV5LendingRedeemCancel` | POST | `v5/lending/redeem-cancel` | 5 |
| `privatePostV5AccountSetCollateralSwitch` | POST | `v5/account/set-collateral-switch` | 5 |
| `privatePostV5AccountSetCollateralSwitchBatch` | POST | `v5/account/set-collateral-switch-batch` | 5 |
| `privatePostV5AccountDemoApplyMoney` | POST | `v5/account/demo-apply-money` | 5 |
| `privatePostV5BrokerAwardInfo` | POST | `v5/broker/award/info` | 5 |
| `privatePostV5BrokerAwardDistributeAward` | POST | `v5/broker/award/distribute-award` | 5 |
| `privatePostV5BrokerAwardDistributionRecord` | POST | `v5/broker/award/distribution-record` | 5 |
| `privatePostV5EarnPlaceOrder` | POST | `v5/earn/place-order` | 5 |

