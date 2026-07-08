Every endpoint in `okxus`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/okxus) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetMarketTickers`); the snake_case alias (`public_get_market_tickers`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetMarketTickers`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const okxus = new ccxt.okxus ();
const response = await okxus.publicGetMarketTickers (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const okxus = new ccxt.okxus ();
const response = await okxus.publicGetMarketTickers (params);
```

#### **Python**

```python
import ccxt
okxus = ccxt.okxus()
response = okxus.public_get_market_tickers(params)
```

#### **PHP**

```php
$okxus = new \ccxt\okxus();
$response = $okxus->public_get_market_tickers($params);
```

#### **C#**

```csharp
using ccxt;
var okxus = new Okxus();
var response = await okxus.publicGetMarketTickers(parameters);
```

#### **Go**

```go
okxus := ccxt.NewOkxus(nil)
response := <-okxus.PublicGetMarketTickers(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official okxus API documentation:** [app.okx.com](https://app.okx.com/docs-v5/en/#overview)

> 433 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetMarketTickers` | GET | `market/tickers` | 1 |
| `publicGetMarketTicker` | GET | `market/ticker` | 1 |
| `publicGetMarketBooks` | GET | `market/books` | 0.5 |
| `publicGetMarketBooksFull` | GET | `market/books-full` | 2 |
| `publicGetMarketCandles` | GET | `market/candles` | 0.5 |
| `publicGetMarketHistoryCandles` | GET | `market/history-candles` | 1 |
| `publicGetMarketTrades` | GET | `market/trades` | 0.2 |
| `publicGetMarketHistoryTrades` | GET | `market/history-trades` | 2 |
| `publicGetMarketOptionInstrumentFamilyTrades` | GET | `market/option/instrument-family-trades` | 1 |
| `publicGetMarketPlatform24Volume` | GET | `market/platform-24-volume` | 10 |
| `publicGetMarketCallAuctionDetail` | GET | `market/call-auction-detail` | 1 |
| `publicGetMarketCallAuctionDetails` | GET | `market/call-auction-details` | 1 |
| `publicGetMarketBooksSbe` | GET | `market/books-sbe` | 10 |
| `publicGetMarketBlockTickers` | GET | `market/block-tickers` | 1 |
| `publicGetMarketBlockTicker` | GET | `market/block-ticker` | 1 |
| `publicGetMarketSprdTicker` | GET | `market/sprd-ticker` | 1 |
| `publicGetMarketSprdCandles` | GET | `market/sprd-candles` | 0.5 |
| `publicGetMarketSprdHistoryCandles` | GET | `market/sprd-history-candles` | 1 |
| `publicGetMarketIndexTickers` | GET | `market/index-tickers` | 1 |
| `publicGetMarketIndexCandles` | GET | `market/index-candles` | 1 |
| `publicGetMarketHistoryIndexCandles` | GET | `market/history-index-candles` | 2 |
| `publicGetMarketMarkPriceCandles` | GET | `market/mark-price-candles` | 1 |
| `publicGetMarketHistoryMarkPriceCandles` | GET | `market/history-mark-price-candles` | 1 |
| `publicGetMarketExchangeRate` | GET | `market/exchange-rate` | 20 |
| `publicGetMarketIndexComponents` | GET | `market/index-components` | 1 |
| `publicGetMarketOpenOracle` | GET | `market/open-oracle` | 50 |
| `publicGetMarketBooksLite` | GET | `market/books-lite` | 1.6666666666666667 |
| `publicGetPublicOptionTrades` | GET | `public/option-trades` | 1 |
| `publicGetPublicBlockTrades` | GET | `public/block-trades` | 1 |
| `publicGetPublicInstruments` | GET | `public/instruments` | 1 |
| `publicGetPublicEstimatedPrice` | GET | `public/estimated-price` | 2 |
| `publicGetPublicDeliveryExerciseHistory` | GET | `public/delivery-exercise-history` | 0.5 |
| `publicGetPublicEstimatedSettlementInfo` | GET | `public/estimated-settlement-info` | 2 |
| `publicGetPublicSettlementHistory` | GET | `public/settlement-history` | 0.5 |
| `publicGetPublicFundingRate` | GET | `public/funding-rate` | 2 |
| `publicGetPublicFundingRateHistory` | GET | `public/funding-rate-history` | 2 |
| `publicGetPublicOpenInterest` | GET | `public/open-interest` | 1 |
| `publicGetPublicPriceLimit` | GET | `public/price-limit` | 1 |
| `publicGetPublicOptSummary` | GET | `public/opt-summary` | 1 |
| `publicGetPublicDiscountRateInterestFreeQuota` | GET | `public/discount-rate-interest-free-quota` | 10 |
| `publicGetPublicTime` | GET | `public/time` | 2 |
| `publicGetPublicMarkPrice` | GET | `public/mark-price` | 2 |
| `publicGetPublicPositionTiers` | GET | `public/position-tiers` | 2 |
| `publicGetPublicInterestRateLoanQuota` | GET | `public/interest-rate-loan-quota` | 10 |
| `publicGetPublicUnderlying` | GET | `public/underlying` | 1 |
| `publicGetPublicInsuranceFund` | GET | `public/insurance-fund` | 2 |
| `publicGetPublicConvertContractCoin` | GET | `public/convert-contract-coin` | 2 |
| `publicGetPublicInstrumentTickBands` | GET | `public/instrument-tick-bands` | 4 |
| `publicGetPublicPremiumHistory` | GET | `public/premium-history` | 1 |
| `publicGetPublicEconomicCalendar` | GET | `public/economic-calendar` | 50 |
| `publicGetPublicMarketDataHistory` | GET | `public/market-data-history` | 4 |
| `publicGetPublicEventContractEvents` | GET | `public/event-contract/events` | 1 |
| `publicGetPublicEventContractMarkets` | GET | `public/event-contract/markets` | 1 |
| `publicGetPublicEventContractSeries` | GET | `public/event-contract/series` | 1 |
| `publicGetPublicVipInterestRateLoanQuota` | GET | `public/vip-interest-rate-loan-quota` | 10 |
| `publicGetRubikStatTradingDataSupportCoin` | GET | `rubik/stat/trading-data/support-coin` | 4 |
| `publicGetRubikStatContractsOpenInterestHistory` | GET | `rubik/stat/contracts/open-interest-history` | 2 |
| `publicGetRubikStatTakerVolume` | GET | `rubik/stat/taker-volume` | 4 |
| `publicGetRubikStatTakerVolumeContract` | GET | `rubik/stat/taker-volume-contract` | 4 |
| `publicGetRubikStatMarginLoanRatio` | GET | `rubik/stat/margin/loan-ratio` | 4 |
| `publicGetRubikStatContractsLongShortAccountRatioContractTopTrader` | GET | `rubik/stat/contracts/long-short-account-ratio-contract-top-trader` | 4 |
| `publicGetRubikStatContractsLongShortPositionRatioContractTopTrader` | GET | `rubik/stat/contracts/long-short-position-ratio-contract-top-trader` | 4 |
| `publicGetRubikStatContractsLongShortAccountRatioContract` | GET | `rubik/stat/contracts/long-short-account-ratio-contract` | 4 |
| `publicGetRubikStatContractsLongShortAccountRatio` | GET | `rubik/stat/contracts/long-short-account-ratio` | 4 |
| `publicGetRubikStatContractsOpenInterestVolume` | GET | `rubik/stat/contracts/open-interest-volume` | 4 |
| `publicGetRubikStatOptionOpenInterestVolume` | GET | `rubik/stat/option/open-interest-volume` | 4 |
| `publicGetRubikStatOptionOpenInterestVolumeRatio` | GET | `rubik/stat/option/open-interest-volume-ratio` | 4 |
| `publicGetRubikStatOptionOpenInterestVolumeExpiry` | GET | `rubik/stat/option/open-interest-volume-expiry` | 4 |
| `publicGetRubikStatOptionOpenInterestVolumeStrike` | GET | `rubik/stat/option/open-interest-volume-strike` | 4 |
| `publicGetRubikStatOptionTakerBlockVolume` | GET | `rubik/stat/option/taker-block-volume` | 4 |
| `publicGetSystemStatus` | GET | `system/status` | 50 |
| `publicGetSprdSpreads` | GET | `sprd/spreads` | 1 |
| `publicGetSprdBooks` | GET | `sprd/books` | 1 |
| `publicGetSprdPublicTrades` | GET | `sprd/public-trades` | 1 |
| `publicGetSprdTicker` | GET | `sprd/ticker` | 1 |
| `publicGetTradingBotGridAiParam` | GET | `tradingBot/grid/ai-param` | 1 |
| `publicGetTradingBotGridMinInvestment` | GET | `tradingBot/grid/min-investment` | 1 |
| `publicGetTradingBotPublicRsiBackTesting` | GET | `tradingBot/public/rsi-back-testing` | 1 |
| `publicGetTradingBotGridGridQuantity` | GET | `tradingBot/grid/grid-quantity` | 4 |
| `publicGetAssetExchangeList` | GET | `asset/exchange-list` | 1.6666666666666667 |
| `publicGetFinanceStakingDefiEthApyHistory` | GET | `finance/staking-defi/eth/apy-history` | 1.6666666666666667 |
| `publicGetFinanceStakingDefiSolApyHistory` | GET | `finance/staking-defi/sol/apy-history` | 1.6666666666666667 |
| `publicGetFinanceSavingsLendingRateSummary` | GET | `finance/savings/lending-rate-summary` | 1.6666666666666667 |
| `publicGetFinanceSavingsLendingRateHistory` | GET | `finance/savings/lending-rate-history` | 1.6666666666666667 |
| `publicGetFinanceFixedLoanLendingOffers` | GET | `finance/fixed-loan/lending-offers` | 3.3333333333333335 |
| `publicGetFinanceFixedLoanLendingApyHistory` | GET | `finance/fixed-loan/lending-apy-history` | 3.3333333333333335 |
| `publicGetFinanceFixedLoanPendingLendingVolume` | GET | `finance/fixed-loan/pending-lending-volume` | 3.3333333333333335 |
| `publicGetFinanceSfpDcdProducts` | GET | `finance/sfp/dcd/products` | 0.6666666666666666 |
| `publicGetCopytradingPublicConfig` | GET | `copytrading/public-config` | 4 |
| `publicGetCopytradingPublicLeadTraders` | GET | `copytrading/public-lead-traders` | 4 |
| `publicGetCopytradingPublicWeeklyPnl` | GET | `copytrading/public-weekly-pnl` | 4 |
| `publicGetCopytradingPublicPnl` | GET | `copytrading/public-pnl` | 4 |
| `publicGetCopytradingPublicStats` | GET | `copytrading/public-stats` | 4 |
| `publicGetCopytradingPublicPreferenceCurrency` | GET | `copytrading/public-preference-currency` | 4 |
| `publicGetCopytradingPublicCurrentSubpositions` | GET | `copytrading/public-current-subpositions` | 4 |
| `publicGetCopytradingPublicSubpositionsHistory` | GET | `copytrading/public-subpositions-history` | 4 |
| `publicGetCopytradingPublicCopyTraders` | GET | `copytrading/public-copy-traders` | 4 |
| `publicGetSupportAnnouncements` | GET | `support/announcements` | 4 |
| `publicGetSupportAnnouncementsTypes` | GET | `support/announcements-types` | 20 |
| `publicGetSupportAnnouncementTypes` | GET | `support/announcement-types` | 20 |
| `publicPostTradingBotGridMinInvestment` | POST | `tradingBot/grid/min-investment` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetRfqCounterparties` | GET | `rfq/counterparties` | 4 |
| `privateGetRfqMakerInstrumentSettings` | GET | `rfq/maker-instrument-settings` | 4 |
| `privateGetRfqMmpConfig` | GET | `rfq/mmp-config` | 4 |
| `privateGetRfqRfqs` | GET | `rfq/rfqs` | 10 |
| `privateGetRfqQuotes` | GET | `rfq/quotes` | 10 |
| `privateGetRfqTrades` | GET | `rfq/trades` | 4 |
| `privateGetRfqPublicTrades` | GET | `rfq/public-trades` | 4 |
| `privateGetSprdOrder` | GET | `sprd/order` | 1 |
| `privateGetSprdOrdersPending` | GET | `sprd/orders-pending` | 2 |
| `privateGetSprdOrdersHistory` | GET | `sprd/orders-history` | 1 |
| `privateGetSprdOrdersHistoryArchive` | GET | `sprd/orders-history-archive` | 1 |
| `privateGetSprdTrades` | GET | `sprd/trades` | 1 |
| `privateGetTradeOrder` | GET | `trade/order` | 0.3333333333333333 |
| `privateGetTradeOrdersPending` | GET | `trade/orders-pending` | 0.3333333333333333 |
| `privateGetTradeOrdersHistory` | GET | `trade/orders-history` | 0.5 |
| `privateGetTradeOrdersHistoryArchive` | GET | `trade/orders-history-archive` | 1 |
| `privateGetTradeFills` | GET | `trade/fills` | 0.3333333333333333 |
| `privateGetTradeFillsHistory` | GET | `trade/fills-history` | 2 |
| `privateGetTradeFillsArchive` | GET | `trade/fills-archive` | 2 |
| `privateGetTradeOrderAlgo` | GET | `trade/order-algo` | 1 |
| `privateGetTradeOrdersAlgoPending` | GET | `trade/orders-algo-pending` | 1 |
| `privateGetTradeOrdersAlgoHistory` | GET | `trade/orders-algo-history` | 1 |
| `privateGetTradeEasyConvertCurrencyList` | GET | `trade/easy-convert-currency-list` | 20 |
| `privateGetTradeEasyConvertHistory` | GET | `trade/easy-convert-history` | 20 |
| `privateGetTradeOneClickRepayCurrencyList` | GET | `trade/one-click-repay-currency-list` | 20 |
| `privateGetTradeOneClickRepayCurrencyListV2` | GET | `trade/one-click-repay-currency-list-v2` | 20 |
| `privateGetTradeOneClickRepayHistory` | GET | `trade/one-click-repay-history` | 20 |
| `privateGetTradeOneClickRepayHistoryV2` | GET | `trade/one-click-repay-history-v2` | 20 |
| `privateGetTradeAccountRateLimit` | GET | `trade/account-rate-limit` | 1 |
| `privateGetAssetCurrencies` | GET | `asset/currencies` | 1.6666666666666667 |
| `privateGetAssetBalances` | GET | `asset/balances` | 1.6666666666666667 |
| `privateGetAssetNonTradableAssets` | GET | `asset/non-tradable-assets` | 1.6666666666666667 |
| `privateGetAssetAssetValuation` | GET | `asset/asset-valuation` | 10 |
| `privateGetAssetTransferState` | GET | `asset/transfer-state` | 1 |
| `privateGetAssetBills` | GET | `asset/bills` | 1.6666666666666667 |
| `privateGetAssetBillsHistory` | GET | `asset/bills-history` | 10 |
| `privateGetAssetDepositLightning` | GET | `asset/deposit-lightning` | 5 |
| `privateGetAssetDepositAddress` | GET | `asset/deposit-address` | 1.6666666666666667 |
| `privateGetAssetDepositHistory` | GET | `asset/deposit-history` | 1.6666666666666667 |
| `privateGetAssetWithdrawalHistory` | GET | `asset/withdrawal-history` | 1.6666666666666667 |
| `privateGetAssetDepositWithdrawStatus` | GET | `asset/deposit-withdraw-status` | 20 |
| `privateGetAssetMonthlyStatement` | GET | `asset/monthly-statement` | 2 |
| `privateGetAssetConvertCurrencies` | GET | `asset/convert/currencies` | 1.6666666666666667 |
| `privateGetAssetConvertCurrencyPair` | GET | `asset/convert/currency-pair` | 1.6666666666666667 |
| `privateGetAssetConvertHistory` | GET | `asset/convert/history` | 1.6666666666666667 |
| `privateGetAccountInstruments` | GET | `account/instruments` | 1 |
| `privateGetAccountBalance` | GET | `account/balance` | 2 |
| `privateGetAccountPositions` | GET | `account/positions` | 2 |
| `privateGetAccountPositionsHistory` | GET | `account/positions-history` | 2 |
| `privateGetAccountAccountPositionRisk` | GET | `account/account-position-risk` | 2 |
| `privateGetAccountBills` | GET | `account/bills` | 2 |
| `privateGetAccountBillsArchive` | GET | `account/bills-archive` | 4 |
| `privateGetAccountBillsHistoryArchive` | GET | `account/bills-history-archive` | 2 |
| `privateGetAccountConfig` | GET | `account/config` | 4 |
| `privateGetAccountSubtypes` | GET | `account/subtypes` | 4 |
| `privateGetAccountMaxSize` | GET | `account/max-size` | 1 |
| `privateGetAccountMaxAvailSize` | GET | `account/max-avail-size` | 1 |
| `privateGetAccountLeverageInfo` | GET | `account/leverage-info` | 1 |
| `privateGetAccountAdjustLeverageInfo` | GET | `account/adjust-leverage-info` | 4 |
| `privateGetAccountMaxLoan` | GET | `account/max-loan` | 1 |
| `privateGetAccountTradeFee` | GET | `account/trade-fee` | 4 |
| `privateGetAccountInterestAccrued` | GET | `account/interest-accrued` | 4 |
| `privateGetAccountInterestRate` | GET | `account/interest-rate` | 4 |
| `privateGetAccountMaxWithdrawal` | GET | `account/max-withdrawal` | 1 |
| `privateGetAccountRiskState` | GET | `account/risk-state` | 2 |
| `privateGetAccountInterestLimits` | GET | `account/interest-limits` | 4 |
| `privateGetAccountSpotBorrowRepayHistory` | GET | `account/spot-borrow-repay-history` | 4 |
| `privateGetAccountGreeks` | GET | `account/greeks` | 2 |
| `privateGetAccountPositionTiers` | GET | `account/position-tiers` | 2 |
| `privateGetAccountSetAccountSwitchPrecheck` | GET | `account/set-account-switch-precheck` | 4 |
| `privateGetAccountCollateralAssets` | GET | `account/collateral-assets` | 4 |
| `privateGetAccountMmpConfig` | GET | `account/mmp-config` | 4 |
| `privateGetAccountMovePositionsHistory` | GET | `account/move-positions-history` | 10 |
| `privateGetAccountPrecheckSetDeltaNeutral` | GET | `account/precheck-set-delta-neutral` | 20 |
| `privateGetAccountQuickMarginBorrowRepayHistory` | GET | `account/quick-margin-borrow-repay-history` | 4 |
| `privateGetAccountBorrowRepayHistory` | GET | `account/borrow-repay-history` | 4 |
| `privateGetAccountVipInterestAccrued` | GET | `account/vip-interest-accrued` | 4 |
| `privateGetAccountVipInterestDeducted` | GET | `account/vip-interest-deducted` | 4 |
| `privateGetAccountVipLoanOrderList` | GET | `account/vip-loan-order-list` | 4 |
| `privateGetAccountVipLoanOrderDetail` | GET | `account/vip-loan-order-detail` | 4 |
| `privateGetAccountFixedLoanBorrowingLimit` | GET | `account/fixed-loan/borrowing-limit` | 4 |
| `privateGetAccountFixedLoanBorrowingQuote` | GET | `account/fixed-loan/borrowing-quote` | 5 |
| `privateGetAccountFixedLoanBorrowingOrdersList` | GET | `account/fixed-loan/borrowing-orders-list` | 5 |
| `privateGetAccountSpotManualBorrowRepay` | GET | `account/spot-manual-borrow-repay` | 30 |
| `privateGetAccountSetAutoRepay` | GET | `account/set-auto-repay` | 4 |
| `privateGetUsersSubaccountList` | GET | `users/subaccount/list` | 10 |
| `privateGetAccountSubaccountBalances` | GET | `account/subaccount/balances` | 3.3333333333333335 |
| `privateGetAssetSubaccountBalances` | GET | `asset/subaccount/balances` | 3.3333333333333335 |
| `privateGetAccountSubaccountMaxWithdrawal` | GET | `account/subaccount/max-withdrawal` | 1 |
| `privateGetAssetSubaccountBills` | GET | `asset/subaccount/bills` | 1.6666666666666667 |
| `privateGetAssetSubaccountManagedSubaccountBills` | GET | `asset/subaccount/managed-subaccount-bills` | 1.6666666666666667 |
| `privateGetUsersEntrustSubaccountList` | GET | `users/entrust-subaccount-list` | 10 |
| `privateGetAccountSubaccountInterestLimits` | GET | `account/subaccount/interest-limits` | 4 |
| `privateGetUsersSubaccountApikey` | GET | `users/subaccount/apikey` | 10 |
| `privateGetTradingBotGridOrdersAlgoPending` | GET | `tradingBot/grid/orders-algo-pending` | 1 |
| `privateGetTradingBotGridOrdersAlgoHistory` | GET | `tradingBot/grid/orders-algo-history` | 1 |
| `privateGetTradingBotGridOrdersAlgoDetails` | GET | `tradingBot/grid/orders-algo-details` | 1 |
| `privateGetTradingBotGridSubOrders` | GET | `tradingBot/grid/sub-orders` | 1 |
| `privateGetTradingBotGridPositions` | GET | `tradingBot/grid/positions` | 1 |
| `privateGetTradingBotGridAiParam` | GET | `tradingBot/grid/ai-param` | 1 |
| `privateGetTradingBotSignalSignals` | GET | `tradingBot/signal/signals` | 1 |
| `privateGetTradingBotSignalOrdersAlgoDetails` | GET | `tradingBot/signal/orders-algo-details` | 1 |
| `privateGetTradingBotSignalOrdersAlgoPending` | GET | `tradingBot/signal/orders-algo-pending` | 1 |
| `privateGetTradingBotSignalOrdersAlgoHistory` | GET | `tradingBot/signal/orders-algo-history` | 1 |
| `privateGetTradingBotSignalPositions` | GET | `tradingBot/signal/positions` | 1 |
| `privateGetTradingBotSignalPositionsHistory` | GET | `tradingBot/signal/positions-history` | 2 |
| `privateGetTradingBotSignalSubOrders` | GET | `tradingBot/signal/sub-orders` | 1 |
| `privateGetTradingBotSignalEventHistory` | GET | `tradingBot/signal/event-history` | 1 |
| `privateGetTradingBotRecurringOrdersAlgoPending` | GET | `tradingBot/recurring/orders-algo-pending` | 1 |
| `privateGetTradingBotRecurringOrdersAlgoHistory` | GET | `tradingBot/recurring/orders-algo-history` | 1 |
| `privateGetTradingBotRecurringOrdersAlgoDetails` | GET | `tradingBot/recurring/orders-algo-details` | 1 |
| `privateGetTradingBotRecurringSubOrders` | GET | `tradingBot/recurring/sub-orders` | 1 |
| `privateGetTradingBotDcaOngoingList` | GET | `tradingBot/dca/ongoing-list` | 1 |
| `privateGetTradingBotDcaHistoryList` | GET | `tradingBot/dca/history-list` | 1 |
| `privateGetTradingBotDcaOrders` | GET | `tradingBot/dca/orders` | 1 |
| `privateGetTradingBotDcaPositionDetails` | GET | `tradingBot/dca/position-details` | 1 |
| `privateGetTradingBotDcaCycleList` | GET | `tradingBot/dca/cycle-list` | 1 |
| `privateGetFinanceSavingsBalance` | GET | `finance/savings/balance` | 1.6666666666666667 |
| `privateGetFinanceSavingsLendingHistory` | GET | `finance/savings/lending-history` | 1.6666666666666667 |
| `privateGetFinanceStakingDefiOffers` | GET | `finance/staking-defi/offers` | 3.3333333333333335 |
| `privateGetFinanceStakingDefiOrdersActive` | GET | `finance/staking-defi/orders-active` | 3.3333333333333335 |
| `privateGetFinanceStakingDefiOrdersHistory` | GET | `finance/staking-defi/orders-history` | 3.3333333333333335 |
| `privateGetFinanceStakingDefiEthProductInfo` | GET | `finance/staking-defi/eth/product-info` | 3.3333333333333335 |
| `privateGetFinanceStakingDefiEthBalance` | GET | `finance/staking-defi/eth/balance` | 1.6666666666666667 |
| `privateGetFinanceStakingDefiEthPurchaseRedeemHistory` | GET | `finance/staking-defi/eth/purchase-redeem-history` | 1.6666666666666667 |
| `privateGetFinanceStakingDefiSolProductInfo` | GET | `finance/staking-defi/sol/product-info` | 3.3333333333333335 |
| `privateGetFinanceStakingDefiSolBalance` | GET | `finance/staking-defi/sol/balance` | 1.6666666666666667 |
| `privateGetFinanceStakingDefiSolPurchaseRedeemHistory` | GET | `finance/staking-defi/sol/purchase-redeem-history` | 1.6666666666666667 |
| `privateGetFinanceFlexibleLoanBorrowCurrencies` | GET | `finance/flexible-loan/borrow-currencies` | 4 |
| `privateGetFinanceFlexibleLoanCollateralAssets` | GET | `finance/flexible-loan/collateral-assets` | 4 |
| `privateGetFinanceFlexibleLoanMaxCollateralRedeemAmount` | GET | `finance/flexible-loan/max-collateral-redeem-amount` | 4 |
| `privateGetFinanceFlexibleLoanLoanInfo` | GET | `finance/flexible-loan/loan-info` | 4 |
| `privateGetFinanceFlexibleLoanLoanHistory` | GET | `finance/flexible-loan/loan-history` | 4 |
| `privateGetFinanceFlexibleLoanInterestAccrued` | GET | `finance/flexible-loan/interest-accrued` | 4 |
| `privateGetCopytradingCurrentSubpositions` | GET | `copytrading/current-subpositions` | 1 |
| `privateGetCopytradingSubpositionsHistory` | GET | `copytrading/subpositions-history` | 1 |
| `privateGetCopytradingInstruments` | GET | `copytrading/instruments` | 4 |
| `privateGetCopytradingProfitSharingDetails` | GET | `copytrading/profit-sharing-details` | 4 |
| `privateGetCopytradingTotalProfitSharing` | GET | `copytrading/total-profit-sharing` | 4 |
| `privateGetCopytradingUnrealizedProfitSharingDetails` | GET | `copytrading/unrealized-profit-sharing-details` | 4 |
| `privateGetCopytradingTotalUnrealizedProfitSharing` | GET | `copytrading/total-unrealized-profit-sharing` | 4 |
| `privateGetCopytradingConfig` | GET | `copytrading/config` | 4 |
| `privateGetCopytradingCopySettings` | GET | `copytrading/copy-settings` | 4 |
| `privateGetCopytradingCurrentLeadTraders` | GET | `copytrading/current-lead-traders` | 4 |
| `privateGetCopytradingBatchLeverageInfo` | GET | `copytrading/batch-leverage-info` | 4 |
| `privateGetCopytradingLeadTradersHistory` | GET | `copytrading/lead-traders-history` | 4 |
| `privateGetBrokerDmaSubaccountInfo` | GET | `broker/dma/subaccount-info` | 2 |
| `privateGetBrokerDmaSubaccountTradeFee` | GET | `broker/dma/subaccount-trade-fee` | 10 |
| `privateGetBrokerDmaSubaccountApikey` | GET | `broker/dma/subaccount/apikey` | 10 |
| `privateGetBrokerDmaRebatePerOrders` | GET | `broker/dma/rebate-per-orders` | 300 |
| `privateGetBrokerFdRebatePerOrders` | GET | `broker/fd/rebate-per-orders` | 300 |
| `privateGetBrokerFdIfRebate` | GET | `broker/fd/if-rebate` | 5 |
| `privateGetBrokerNdInfo` | GET | `broker/nd/info` | 10 |
| `privateGetBrokerNdSubaccountInfo` | GET | `broker/nd/subaccount-info` | 10 |
| `privateGetBrokerNdSubaccountApikey` | GET | `broker/nd/subaccount/apikey` | 10 |
| `privateGetAssetBrokerNdSubaccountDepositAddress` | GET | `asset/broker/nd/subaccount-deposit-address` | 1.6666666666666667 |
| `privateGetAssetBrokerNdSubaccountDepositHistory` | GET | `asset/broker/nd/subaccount-deposit-history` | 4 |
| `privateGetAssetBrokerNdSubaccountWithdrawalHistory` | GET | `asset/broker/nd/subaccount-withdrawal-history` | 4 |
| `privateGetBrokerNdRebateDaily` | GET | `broker/nd/rebate-daily` | 100 |
| `privateGetBrokerNdRebatePerOrders` | GET | `broker/nd/rebate-per-orders` | 300 |
| `privateGetFinanceSfpDcdOrder` | GET | `finance/sfp/dcd/order` | 2 |
| `privateGetFinanceSfpDcdOrders` | GET | `finance/sfp/dcd/orders` | 2 |
| `privateGetFinanceSfpDcdCurrencyPair` | GET | `finance/sfp/dcd/currency-pair` | 2 |
| `privateGetFinanceSfpDcdOrderStatus` | GET | `finance/sfp/dcd/order-status` | 2 |
| `privateGetFinanceSfpDcdOrderHistory` | GET | `finance/sfp/dcd/order-history` | 2 |
| `privateGetAffiliateInviteeDetail` | GET | `affiliate/invitee/detail` | 1 |
| `privateGetUsersPartnerIfRebate` | GET | `users/partner/if-rebate` | 1 |
| `privateGetSupportAnnouncements` | GET | `support/announcements` | 4 |
| `privatePostRfqCreateRfq` | POST | `rfq/create-rfq` | 4 |
| `privatePostRfqCancelRfq` | POST | `rfq/cancel-rfq` | 4 |
| `privatePostRfqCancelBatchRfqs` | POST | `rfq/cancel-batch-rfqs` | 10 |
| `privatePostRfqCancelAllRfqs` | POST | `rfq/cancel-all-rfqs` | 10 |
| `privatePostRfqExecuteQuote` | POST | `rfq/execute-quote` | 15 |
| `privatePostRfqMakerInstrumentSettings` | POST | `rfq/maker-instrument-settings` | 4 |
| `privatePostRfqMmpReset` | POST | `rfq/mmp-reset` | 4 |
| `privatePostRfqMmpConfig` | POST | `rfq/mmp-config` | 100 |
| `privatePostRfqCreateQuote` | POST | `rfq/create-quote` | 0.4 |
| `privatePostRfqCancelQuote` | POST | `rfq/cancel-quote` | 0.4 |
| `privatePostRfqCancelBatchQuotes` | POST | `rfq/cancel-batch-quotes` | 10 |
| `privatePostRfqCancelAllQuotes` | POST | `rfq/cancel-all-quotes` | 10 |
| `privatePostRfqCancelAllAfter` | POST | `rfq/cancel-all-after` | 10 |
| `privatePostSprdOrder` | POST | `sprd/order` | 1 |
| `privatePostSprdCancelOrder` | POST | `sprd/cancel-order` | 1 |
| `privatePostSprdMassCancel` | POST | `sprd/mass-cancel` | 1 |
| `privatePostSprdAmendOrder` | POST | `sprd/amend-order` | 1 |
| `privatePostSprdCancelAllAfter` | POST | `sprd/cancel-all-after` | 10 |
| `privatePostTradeOrder` | POST | `trade/order` | 0.3333333333333333 |
| `privatePostTradeBatchOrders` | POST | `trade/batch-orders` | 0.06666666666666667 |
| `privatePostTradeCancelOrder` | POST | `trade/cancel-order` | 0.3333333333333333 |
| `privatePostTradeCancelBatchOrders` | POST | `trade/cancel-batch-orders` | 0.06666666666666667 |
| `privatePostTradeAmendOrder` | POST | `trade/amend-order` | 0.3333333333333333 |
| `privatePostTradeAmendBatchOrders` | POST | `trade/amend-batch-orders` | 0.006666666666666667 |
| `privatePostTradeClosePosition` | POST | `trade/close-position` | 1 |
| `privatePostTradeFillsArchive` | POST | `trade/fills-archive` | 172800 |
| `privatePostTradeCancelAdvanceAlgos` | POST | `trade/cancel-advance-algos` | 1 |
| `privatePostTradeEasyConvert` | POST | `trade/easy-convert` | 20 |
| `privatePostTradeOneClickRepay` | POST | `trade/one-click-repay` | 20 |
| `privatePostTradeOneClickRepayV2` | POST | `trade/one-click-repay-v2` | 20 |
| `privatePostTradeMassCancel` | POST | `trade/mass-cancel` | 4 |
| `privatePostTradeCancelAllAfter` | POST | `trade/cancel-all-after` | 10 |
| `privatePostTradeOrderPrecheck` | POST | `trade/order-precheck` | 4 |
| `privatePostTradeOrderAlgo` | POST | `trade/order-algo` | 1 |
| `privatePostTradeCancelAlgos` | POST | `trade/cancel-algos` | 1 |
| `privatePostTradeAmendAlgos` | POST | `trade/amend-algos` | 1 |
| `privatePostAssetTransfer` | POST | `asset/transfer` | 5 |
| `privatePostAssetWithdrawal` | POST | `asset/withdrawal` | 1.6666666666666667 |
| `privatePostAssetWithdrawalLightning` | POST | `asset/withdrawal-lightning` | 5 |
| `privatePostAssetCancelWithdrawal` | POST | `asset/cancel-withdrawal` | 1.6666666666666667 |
| `privatePostAssetConvertDustAssets` | POST | `asset/convert-dust-assets` | 10 |
| `privatePostAssetMonthlyStatement` | POST | `asset/monthly-statement` | 1296000 |
| `privatePostAssetConvertEstimateQuote` | POST | `asset/convert/estimate-quote` | 50 |
| `privatePostAssetConvertTrade` | POST | `asset/convert/trade` | 1 |
| `privatePostAccountBillsHistoryArchive` | POST | `account/bills-history-archive` | 72000 |
| `privatePostAccountSetPositionMode` | POST | `account/set-position-mode` | 4 |
| `privatePostAccountSetLeverage` | POST | `account/set-leverage` | 1 |
| `privatePostAccountPositionMarginBalance` | POST | `account/position/margin-balance` | 1 |
| `privatePostAccountSetFeeType` | POST | `account/set-fee-type` | 4 |
| `privatePostAccountSetGreeks` | POST | `account/set-greeks` | 4 |
| `privatePostAccountSetIsolatedMode` | POST | `account/set-isolated-mode` | 4 |
| `privatePostAccountSpotManualBorrowRepay` | POST | `account/spot-manual-borrow-repay` | 30 |
| `privatePostAccountSetAutoRepay` | POST | `account/set-auto-repay` | 4 |
| `privatePostAccountQuickMarginBorrowRepay` | POST | `account/quick-margin-borrow-repay` | 4 |
| `privatePostAccountBorrowRepay` | POST | `account/borrow-repay` | 1.6666666666666667 |
| `privatePostAccountSimulatedMargin` | POST | `account/simulated_margin` | 10 |
| `privatePostAccountPositionBuilder` | POST | `account/position-builder` | 10 |
| `privatePostAccountPositionBuilderGraph` | POST | `account/position-builder-graph` | 50 |
| `privatePostAccountSetRiskOffsetType` | POST | `account/set-riskOffset-type` | 2 |
| `privatePostAccountSetRiskOffsetAmt` | POST | `account/set-riskOffset-amt` | 2 |
| `privatePostAccountActivateOption` | POST | `account/activate-option` | 4 |
| `privatePostAccountSetAutoLoan` | POST | `account/set-auto-loan` | 4 |
| `privatePostAccountAccountLevelSwitchPreset` | POST | `account/account-level-switch-preset` | 4 |
| `privatePostAccountSetAccountLevel` | POST | `account/set-account-level` | 4 |
| `privatePostAccountSetCollateralAssets` | POST | `account/set-collateral-assets` | 4 |
| `privatePostAccountMmpReset` | POST | `account/mmp-reset` | 4 |
| `privatePostAccountMmpConfig` | POST | `account/mmp-config` | 50 |
| `privatePostAccountFixedLoanBorrowingOrder` | POST | `account/fixed-loan/borrowing-order` | 5 |
| `privatePostAccountFixedLoanAmendBorrowingOrder` | POST | `account/fixed-loan/amend-borrowing-order` | 5 |
| `privatePostAccountFixedLoanManualReborrow` | POST | `account/fixed-loan/manual-reborrow` | 5 |
| `privatePostAccountFixedLoanRepayBorrowingOrder` | POST | `account/fixed-loan/repay-borrowing-order` | 5 |
| `privatePostAccountMovePositions` | POST | `account/move-positions` | 10 |
| `privatePostAccountSetAutoEarn` | POST | `account/set-auto-earn` | 10 |
| `privatePostAccountSetSettleCurrency` | POST | `account/set-settle-currency` | 1 |
| `privatePostAccountSetTradingConfig` | POST | `account/set-trading-config` | 20 |
| `privatePostAccountDemoAdjustBalance` | POST | `account/demo-adjust-balance` | 20 |
| `privatePostAssetSubaccountTransfer` | POST | `asset/subaccount/transfer` | 10 |
| `privatePostAccountSubaccountSetLoanAllocation` | POST | `account/subaccount/set-loan-allocation` | 4 |
| `privatePostUsersSubaccountCreateSubaccount` | POST | `users/subaccount/create-subaccount` | 10 |
| `privatePostUsersSubaccountApikey` | POST | `users/subaccount/apikey` | 10 |
| `privatePostUsersSubaccountModifyApikey` | POST | `users/subaccount/modify-apikey` | 10 |
| `privatePostUsersSubaccountSubaccountApikey` | POST | `users/subaccount/subaccount-apikey` | 10 |
| `privatePostUsersSubaccountDeleteApikey` | POST | `users/subaccount/delete-apikey` | 10 |
| `privatePostUsersSubaccountSetTransferOut` | POST | `users/subaccount/set-transfer-out` | 10 |
| `privatePostTradingBotGridOrderAlgo` | POST | `tradingBot/grid/order-algo` | 1 |
| `privatePostTradingBotGridCopyOrderAlgo` | POST | `tradingBot/grid/copy-order-algo` | 1 |
| `privatePostTradingBotGridAmendAlgoBasicParam` | POST | `tradingBot/grid/amend-algo-basic-param` | 1 |
| `privatePostTradingBotGridAmendOrderAlgo` | POST | `tradingBot/grid/amend-order-algo` | 1 |
| `privatePostTradingBotGridStopOrderAlgo` | POST | `tradingBot/grid/stop-order-algo` | 1 |
| `privatePostTradingBotGridClosePosition` | POST | `tradingBot/grid/close-position` | 1 |
| `privatePostTradingBotGridCancelCloseOrder` | POST | `tradingBot/grid/cancel-close-order` | 1 |
| `privatePostTradingBotGridOrderInstantTrigger` | POST | `tradingBot/grid/order-instant-trigger` | 1 |
| `privatePostTradingBotGridWithdrawIncome` | POST | `tradingBot/grid/withdraw-income` | 1 |
| `privatePostTradingBotGridComputeMarginBalance` | POST | `tradingBot/grid/compute-margin-balance` | 1 |
| `privatePostTradingBotGridMarginBalance` | POST | `tradingBot/grid/margin-balance` | 1 |
| `privatePostTradingBotGridMinInvestment` | POST | `tradingBot/grid/min-investment` | 1 |
| `privatePostTradingBotGridAdjustInvestment` | POST | `tradingBot/grid/adjust-investment` | 1 |
| `privatePostTradingBotSignalCreateSignal` | POST | `tradingBot/signal/create-signal` | 1 |
| `privatePostTradingBotSignalOrderAlgo` | POST | `tradingBot/signal/order-algo` | 1 |
| `privatePostTradingBotSignalStopOrderAlgo` | POST | `tradingBot/signal/stop-order-algo` | 1 |
| `privatePostTradingBotSignalMarginBalance` | POST | `tradingBot/signal/margin-balance` | 1 |
| `privatePostTradingBotSignalAmendTPSL` | POST | `tradingBot/signal/amendTPSL` | 1 |
| `privatePostTradingBotSignalSetInstruments` | POST | `tradingBot/signal/set-instruments` | 1 |
| `privatePostTradingBotSignalClosePosition` | POST | `tradingBot/signal/close-position` | 1 |
| `privatePostTradingBotSignalSubOrder` | POST | `tradingBot/signal/sub-order` | 1 |
| `privatePostTradingBotSignalCancelSubOrder` | POST | `tradingBot/signal/cancel-sub-order` | 1 |
| `privatePostTradingBotRecurringOrderAlgo` | POST | `tradingBot/recurring/order-algo` | 1 |
| `privatePostTradingBotRecurringAmendOrderAlgo` | POST | `tradingBot/recurring/amend-order-algo` | 1 |
| `privatePostTradingBotRecurringStopOrderAlgo` | POST | `tradingBot/recurring/stop-order-algo` | 1 |
| `privatePostTradingBotDcaCreate` | POST | `tradingBot/dca/create` | 1 |
| `privatePostTradingBotDcaAmendOrderAlgo` | POST | `tradingBot/dca/amend-order-algo` | 1 |
| `privatePostTradingBotDcaStop` | POST | `tradingBot/dca/stop` | 1 |
| `privatePostTradingBotDcaOrdersManualBuy` | POST | `tradingBot/dca/orders/manual-buy` | 1 |
| `privatePostTradingBotDcaSettingsReinvestment` | POST | `tradingBot/dca/settings/reinvestment` | 1 |
| `privatePostTradingBotDcaSettingsTakeProfit` | POST | `tradingBot/dca/settings/take-profit` | 1 |
| `privatePostTradingBotDcaMarginAdd` | POST | `tradingBot/dca/margin/add` | 1 |
| `privatePostTradingBotDcaMarginReduce` | POST | `tradingBot/dca/margin/reduce` | 1 |
| `privatePostTradingBotRecurringAddInvestment` | POST | `tradingBot/recurring/add-investment` | 1 |
| `privatePostTradingBotRecurringAmendPriceRange` | POST | `tradingBot/recurring/amend-price-range` | 1 |
| `privatePostTradingBotRecurringAmendRecurringAmount` | POST | `tradingBot/recurring/amend-recurring-amount` | 1 |
| `privatePostTradingBotRecurringAmendRecurringTime` | POST | `tradingBot/recurring/amend-recurring-time` | 1 |
| `privatePostTradingBotRecurringPause` | POST | `tradingBot/recurring/pause` | 1 |
| `privatePostTradingBotRecurringRestart` | POST | `tradingBot/recurring/restart` | 1 |
| `privatePostFinanceSavingsPurchaseRedempt` | POST | `finance/savings/purchase-redempt` | 1.6666666666666667 |
| `privatePostFinanceSavingsSetLendingRate` | POST | `finance/savings/set-lending-rate` | 1.6666666666666667 |
| `privatePostFinanceStakingDefiPurchase` | POST | `finance/staking-defi/purchase` | 5 |
| `privatePostFinanceStakingDefiRedeem` | POST | `finance/staking-defi/redeem` | 5 |
| `privatePostFinanceStakingDefiCancel` | POST | `finance/staking-defi/cancel` | 5 |
| `privatePostFinanceStakingDefiEthPurchase` | POST | `finance/staking-defi/eth/purchase` | 5 |
| `privatePostFinanceStakingDefiEthRedeem` | POST | `finance/staking-defi/eth/redeem` | 5 |
| `privatePostFinanceStakingDefiEthCancelRedeem` | POST | `finance/staking-defi/eth/cancel-redeem` | 5 |
| `privatePostFinanceStakingDefiSolPurchase` | POST | `finance/staking-defi/sol/purchase` | 5 |
| `privatePostFinanceStakingDefiSolRedeem` | POST | `finance/staking-defi/sol/redeem` | 5 |
| `privatePostFinanceStakingDefiSolCancelRedeem` | POST | `finance/staking-defi/sol/cancel-redeem` | 5 |
| `privatePostFinanceFlexibleLoanMaxLoan` | POST | `finance/flexible-loan/max-loan` | 4 |
| `privatePostFinanceFlexibleLoanAdjustCollateral` | POST | `finance/flexible-loan/adjust-collateral` | 4 |
| `privatePostCopytradingAlgoOrder` | POST | `copytrading/algo-order` | 1 |
| `privatePostCopytradingCloseSubposition` | POST | `copytrading/close-subposition` | 1 |
| `privatePostCopytradingSetInstruments` | POST | `copytrading/set-instruments` | 4 |
| `privatePostCopytradingAmendProfitSharingRatio` | POST | `copytrading/amend-profit-sharing-ratio` | 4 |
| `privatePostCopytradingFirstCopySettings` | POST | `copytrading/first-copy-settings` | 4 |
| `privatePostCopytradingAmendCopySettings` | POST | `copytrading/amend-copy-settings` | 4 |
| `privatePostCopytradingStopCopyTrading` | POST | `copytrading/stop-copy-trading` | 4 |
| `privatePostCopytradingBatchSetLeverage` | POST | `copytrading/batch-set-leverage` | 4 |
| `privatePostBrokerNdCreateSubaccount` | POST | `broker/nd/create-subaccount` | 0.25 |
| `privatePostBrokerNdDeleteSubaccount` | POST | `broker/nd/delete-subaccount` | 1 |
| `privatePostBrokerNdSubaccountApikey` | POST | `broker/nd/subaccount/apikey` | 0.25 |
| `privatePostBrokerNdSubaccountModifyApikey` | POST | `broker/nd/subaccount/modify-apikey` | 1 |
| `privatePostBrokerNdSubaccountDeleteApikey` | POST | `broker/nd/subaccount/delete-apikey` | 1 |
| `privatePostBrokerNdSetSubaccountLevel` | POST | `broker/nd/set-subaccount-level` | 4 |
| `privatePostBrokerNdSetSubaccountFeeRate` | POST | `broker/nd/set-subaccount-fee-rate` | 4 |
| `privatePostBrokerNdSetSubaccountAssets` | POST | `broker/nd/set-subaccount-assets` | 0.25 |
| `privatePostAssetBrokerNdSubaccountDepositAddress` | POST | `asset/broker/nd/subaccount-deposit-address` | 1 |
| `privatePostAssetBrokerNdModifySubaccountDepositAddress` | POST | `asset/broker/nd/modify-subaccount-deposit-address` | 1.6666666666666667 |
| `privatePostBrokerNdRebatePerOrders` | POST | `broker/nd/rebate-per-orders` | 36000 |
| `privatePostFinanceSfpDcdQuote` | POST | `finance/sfp/dcd/quote` | 10 |
| `privatePostFinanceSfpDcdOrder` | POST | `finance/sfp/dcd/order` | 10 |
| `privatePostFinanceSfpDcdTrade` | POST | `finance/sfp/dcd/trade` | 10 |
| `privatePostFinanceSfpDcdRedeemQuote` | POST | `finance/sfp/dcd/redeem-quote` | 10 |
| `privatePostFinanceSfpDcdRedeem` | POST | `finance/sfp/dcd/redeem` | 10 |
| `privatePostBrokerNdReportSubaccountIp` | POST | `broker/nd/report-subaccount-ip` | 0.25 |
| `privatePostBrokerDmaSubaccountApikey` | POST | `broker/dma/subaccount/apikey` | 0.25 |
| `privatePostBrokerDmaTrades` | POST | `broker/dma/trades` | 36000 |
| `privatePostBrokerFdRebatePerOrders` | POST | `broker/fd/rebate-per-orders` | 36000 |

