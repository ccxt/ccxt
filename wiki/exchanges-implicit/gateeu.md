Every endpoint in `gateeu`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/gateeu) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicWalletGetCurrencyChains`); the snake_case alias (`public_wallet_get_currency_chains`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicWalletGetCurrencyChains`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const gateeu = new ccxt.gateeu ();
const response = await gateeu.publicWalletGetCurrencyChains (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const gateeu = new ccxt.gateeu ();
const response = await gateeu.publicWalletGetCurrencyChains (params);
```

#### **Python**

```python
import ccxt
gateeu = ccxt.gateeu()
response = gateeu.public_wallet_get_currency_chains(params)
```

#### **PHP**

```php
$gateeu = new \ccxt\gateeu();
$response = $gateeu->public_wallet_get_currency_chains($params);
```

#### **C#**

```csharp
using ccxt;
var gateeu = new Gateeu();
var response = await gateeu.publicWalletGetCurrencyChains(parameters);
```

#### **Go**

```go
gateeu := ccxt.NewGateeu(nil)
response := <-gateeu.PublicWalletGetCurrencyChains(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official gateeu API documentation:** [gate.com](https://www.gate.com/docs/developers/apiv4/en)

> 339 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicWalletGetCurrencyChains` | GET | `currency_chains` | 1 |
| `publicUnifiedGetCurrencies` | GET | `currencies` | 1 |
| `publicUnifiedGetHistoryLoanRate` | GET | `history_loan_rate` | 1 |
| `publicSpotGetCurrencies` | GET | `currencies` | 1 |
| `publicSpotGetCurrenciesCurrency` | GET | `currencies/{currency}` | 1 |
| `publicSpotGetCurrencyPairs` | GET | `currency_pairs` | 1 |
| `publicSpotGetCurrencyPairsCurrencyPair` | GET | `currency_pairs/{currency_pair}` | 1 |
| `publicSpotGetTickers` | GET | `tickers` | 1 |
| `publicSpotGetOrderBook` | GET | `order_book` | 1 |
| `publicSpotGetTrades` | GET | `trades` | 1 |
| `publicSpotGetCandlesticks` | GET | `candlesticks` | 1 |
| `publicSpotGetTime` | GET | `time` | 1 |
| `publicSpotGetInsuranceHistory` | GET | `insurance_history` | 1 |
| `publicMarginGetUniCurrencyPairs` | GET | `uni/currency_pairs` | 1 |
| `publicMarginGetUniCurrencyPairsCurrencyPair` | GET | `uni/currency_pairs/{currency_pair}` | 1 |
| `publicMarginGetLoanMarginTiers` | GET | `loan_margin_tiers` | 1 |
| `publicMarginGetCurrencyPairs` | GET | `currency_pairs` | 1 |
| `publicMarginGetCurrencyPairsCurrencyPair` | GET | `currency_pairs/{currency_pair}` | 1 |
| `publicMarginGetFundingBook` | GET | `funding_book` | 1 |
| `publicMarginGetCrossCurrencies` | GET | `cross/currencies` | 1 |
| `publicMarginGetCrossCurrenciesCurrency` | GET | `cross/currencies/{currency}` | 1 |
| `publicFlash_swapGetCurrencyPairs` | GET | `currency_pairs` | 1 |
| `publicFlash_swapGetCurrencies` | GET | `currencies` | 1 |
| `publicFuturesGetSettleContracts` | GET | `{settle}/contracts` | 1 |
| `publicFuturesGetSettleContractsContract` | GET | `{settle}/contracts/{contract}` | 1 |
| `publicFuturesGetSettleOrderBook` | GET | `{settle}/order_book` | 1 |
| `publicFuturesGetSettleTrades` | GET | `{settle}/trades` | 1 |
| `publicFuturesGetSettleCandlesticks` | GET | `{settle}/candlesticks` | 1 |
| `publicFuturesGetSettlePremiumIndex` | GET | `{settle}/premium_index` | 1 |
| `publicFuturesGetSettleTickers` | GET | `{settle}/tickers` | 1 |
| `publicFuturesGetSettleFundingRate` | GET | `{settle}/funding_rate` | 1 |
| `publicFuturesGetSettleInsurance` | GET | `{settle}/insurance` | 1 |
| `publicFuturesGetSettleContractStats` | GET | `{settle}/contract_stats` | 1 |
| `publicFuturesGetSettleIndexConstituentsIndex` | GET | `{settle}/index_constituents/{index}` | 1 |
| `publicFuturesGetSettleLiqOrders` | GET | `{settle}/liq_orders` | 1 |
| `publicFuturesGetSettleRiskLimitTiers` | GET | `{settle}/risk_limit_tiers` | 1 |
| `publicDeliveryGetSettleContracts` | GET | `{settle}/contracts` | 1 |
| `publicDeliveryGetSettleContractsContract` | GET | `{settle}/contracts/{contract}` | 1 |
| `publicDeliveryGetSettleOrderBook` | GET | `{settle}/order_book` | 1 |
| `publicDeliveryGetSettleTrades` | GET | `{settle}/trades` | 1 |
| `publicDeliveryGetSettleCandlesticks` | GET | `{settle}/candlesticks` | 1 |
| `publicDeliveryGetSettleTickers` | GET | `{settle}/tickers` | 1 |
| `publicDeliveryGetSettleInsurance` | GET | `{settle}/insurance` | 1 |
| `publicDeliveryGetSettleRiskLimitTiers` | GET | `{settle}/risk_limit_tiers` | 1 |
| `publicOptionsGetUnderlyings` | GET | `underlyings` | 1 |
| `publicOptionsGetExpirations` | GET | `expirations` | 1 |
| `publicOptionsGetContracts` | GET | `contracts` | 1 |
| `publicOptionsGetContractsContract` | GET | `contracts/{contract}` | 1 |
| `publicOptionsGetSettlements` | GET | `settlements` | 1 |
| `publicOptionsGetSettlementsContract` | GET | `settlements/{contract}` | 1 |
| `publicOptionsGetOrderBook` | GET | `order_book` | 1 |
| `publicOptionsGetTickers` | GET | `tickers` | 1 |
| `publicOptionsGetUnderlyingTickersUnderlying` | GET | `underlying/tickers/{underlying}` | 1 |
| `publicOptionsGetCandlesticks` | GET | `candlesticks` | 1 |
| `publicOptionsGetUnderlyingCandlesticks` | GET | `underlying/candlesticks` | 1 |
| `publicOptionsGetTrades` | GET | `trades` | 1 |
| `publicEarnGetUniCurrencies` | GET | `uni/currencies` | 1 |
| `publicEarnGetUniCurrenciesCurrency` | GET | `uni/currencies/{currency}` | 1 |
| `publicEarnGetDualInvestmentPlan` | GET | `dual/investment_plan` | 1 |
| `publicEarnGetStructuredProducts` | GET | `structured/products` | 1 |
| `publicLoanGetCollateralCurrencies` | GET | `collateral/currencies` | 1 |
| `publicLoanGetMultiCollateralCurrencies` | GET | `multi_collateral/currencies` | 1 |
| `publicLoanGetMultiCollateralLtv` | GET | `multi_collateral/ltv` | 1 |
| `publicLoanGetMultiCollateralFixedRate` | GET | `multi_collateral/fixed_rate` | 1 |
| `publicLoanGetMultiCollateralCurrentRate` | GET | `multi_collateral/current_rate` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateWithdrawalsPostWithdrawals` | POST | `withdrawals` | 20 |
| `privateWithdrawalsPostPush` | POST | `push` | 1 |
| `privateWithdrawalsDeleteWithdrawalsWithdrawalId` | DELETE | `withdrawals/{withdrawal_id}` | 1 |
| `privateWalletGetDepositAddress` | GET | `deposit_address` | 1 |
| `privateWalletGetWithdrawals` | GET | `withdrawals` | 1 |
| `privateWalletGetDeposits` | GET | `deposits` | 1 |
| `privateWalletGetSubAccountTransfers` | GET | `sub_account_transfers` | 1 |
| `privateWalletGetOrderStatus` | GET | `order_status` | 1 |
| `privateWalletGetWithdrawStatus` | GET | `withdraw_status` | 1 |
| `privateWalletGetSubAccountBalances` | GET | `sub_account_balances` | 2.5 |
| `privateWalletGetSubAccountMarginBalances` | GET | `sub_account_margin_balances` | 2.5 |
| `privateWalletGetSubAccountFuturesBalances` | GET | `sub_account_futures_balances` | 2.5 |
| `privateWalletGetSubAccountCrossMarginBalances` | GET | `sub_account_cross_margin_balances` | 2.5 |
| `privateWalletGetSavedAddress` | GET | `saved_address` | 1 |
| `privateWalletGetFee` | GET | `fee` | 1 |
| `privateWalletGetTotalBalance` | GET | `total_balance` | 2.5 |
| `privateWalletGetSmallBalance` | GET | `small_balance` | 1 |
| `privateWalletGetSmallBalanceHistory` | GET | `small_balance_history` | 1 |
| `privateWalletGetPush` | GET | `push` | 1 |
| `privateWalletGetGetLowCapExchangeList` | GET | `getLowCapExchangeList` | 1 |
| `privateWalletPostTransfers` | POST | `transfers` | 2.5 |
| `privateWalletPostSubAccountTransfers` | POST | `sub_account_transfers` | 2.5 |
| `privateWalletPostSubAccountToSubAccount` | POST | `sub_account_to_sub_account` | 2.5 |
| `privateWalletPostSmallBalance` | POST | `small_balance` | 1 |
| `privateSubAccountsGetSubAccounts` | GET | `sub_accounts` | 2.5 |
| `privateSubAccountsGetSubAccountsUserId` | GET | `sub_accounts/{user_id}` | 2.5 |
| `privateSubAccountsGetSubAccountsUserIdKeys` | GET | `sub_accounts/{user_id}/keys` | 2.5 |
| `privateSubAccountsGetSubAccountsUserIdKeysKey` | GET | `sub_accounts/{user_id}/keys/{key}` | 2.5 |
| `privateSubAccountsPostSubAccounts` | POST | `sub_accounts` | 2.5 |
| `privateSubAccountsPostSubAccountsUserIdKeys` | POST | `sub_accounts/{user_id}/keys` | 2.5 |
| `privateSubAccountsPostSubAccountsUserIdLock` | POST | `sub_accounts/{user_id}/lock` | 2.5 |
| `privateSubAccountsPostSubAccountsUserIdUnlock` | POST | `sub_accounts/{user_id}/unlock` | 2.5 |
| `privateSubAccountsPutSubAccountsUserIdKeysKey` | PUT | `sub_accounts/{user_id}/keys/{key}` | 2.5 |
| `privateSubAccountsDeleteSubAccountsUserIdKeysKey` | DELETE | `sub_accounts/{user_id}/keys/{key}` | 2.5 |
| `privateUnifiedGetAccounts` | GET | `accounts` | 1.3333333333333333 |
| `privateUnifiedGetBorrowable` | GET | `borrowable` | 1.3333333333333333 |
| `privateUnifiedGetTransferable` | GET | `transferable` | 1.3333333333333333 |
| `privateUnifiedGetTransferables` | GET | `transferables` | 1.3333333333333333 |
| `privateUnifiedGetBatchBorrowable` | GET | `batch_borrowable` | 1.3333333333333333 |
| `privateUnifiedGetLoans` | GET | `loans` | 1.3333333333333333 |
| `privateUnifiedGetLoanRecords` | GET | `loan_records` | 1.3333333333333333 |
| `privateUnifiedGetInterestRecords` | GET | `interest_records` | 1.3333333333333333 |
| `privateUnifiedGetRiskUnits` | GET | `risk_units` | 1.3333333333333333 |
| `privateUnifiedGetUnifiedMode` | GET | `unified_mode` | 1.3333333333333333 |
| `privateUnifiedGetEstimateRate` | GET | `estimate_rate` | 1.3333333333333333 |
| `privateUnifiedGetCurrencyDiscountTiers` | GET | `currency_discount_tiers` | 1.3333333333333333 |
| `privateUnifiedGetLoanMarginTiers` | GET | `loan_margin_tiers` | 1.3333333333333333 |
| `privateUnifiedGetLeverageUserCurrencyConfig` | GET | `leverage/user_currency_config` | 1.3333333333333333 |
| `privateUnifiedGetLeverageUserCurrencySetting` | GET | `leverage/user_currency_setting` | 1.3333333333333333 |
| `privateUnifiedGetAccountMode` | GET | `account_mode` | 1.3333333333333333 |
| `privateUnifiedPostLoans` | POST | `loans` | 13.333333333333334 |
| `privateUnifiedPostPortfolioCalculator` | POST | `portfolio_calculator` | 1.3333333333333333 |
| `privateUnifiedPostLeverageUserCurrencySetting` | POST | `leverage/user_currency_setting` | 1.3333333333333333 |
| `privateUnifiedPostCollateralCurrencies` | POST | `collateral_currencies` | 1.3333333333333333 |
| `privateUnifiedPostAccountMode` | POST | `account_mode` | 1.3333333333333333 |
| `privateUnifiedPutUnifiedMode` | PUT | `unified_mode` | 1.3333333333333333 |
| `privateSpotGetFee` | GET | `fee` | 1 |
| `privateSpotGetBatchFee` | GET | `batch_fee` | 1 |
| `privateSpotGetAccounts` | GET | `accounts` | 1 |
| `privateSpotGetAccountBook` | GET | `account_book` | 1 |
| `privateSpotGetOpenOrders` | GET | `open_orders` | 1 |
| `privateSpotGetOrders` | GET | `orders` | 1 |
| `privateSpotGetOrdersOrderId` | GET | `orders/{order_id}` | 1 |
| `privateSpotGetMyTrades` | GET | `my_trades` | 1 |
| `privateSpotGetPriceOrders` | GET | `price_orders` | 1 |
| `privateSpotGetPriceOrdersOrderId` | GET | `price_orders/{order_id}` | 1 |
| `privateSpotPostBatchOrders` | POST | `batch_orders` | 0.4 |
| `privateSpotPostCrossLiquidateOrders` | POST | `cross_liquidate_orders` | 1 |
| `privateSpotPostOrders` | POST | `orders` | 0.4 |
| `privateSpotPostCancelBatchOrders` | POST | `cancel_batch_orders` | 0.26666666666666666 |
| `privateSpotPostCountdownCancelAll` | POST | `countdown_cancel_all` | 0.26666666666666666 |
| `privateSpotPostAmendBatchOrders` | POST | `amend_batch_orders` | 0.4 |
| `privateSpotPostPriceOrders` | POST | `price_orders` | 0.4 |
| `privateSpotDeleteOrders` | DELETE | `orders` | 0.26666666666666666 |
| `privateSpotDeleteOrdersOrderId` | DELETE | `orders/{order_id}` | 0.26666666666666666 |
| `privateSpotDeletePriceOrders` | DELETE | `price_orders` | 0.26666666666666666 |
| `privateSpotDeletePriceOrdersOrderId` | DELETE | `price_orders/{order_id}` | 0.26666666666666666 |
| `privateSpotPatchOrdersOrderId` | PATCH | `orders/{order_id}` | 0.4 |
| `privateMarginGetAccounts` | GET | `accounts` | 1.3333333333333333 |
| `privateMarginGetAccountBook` | GET | `account_book` | 1.3333333333333333 |
| `privateMarginGetFundingAccounts` | GET | `funding_accounts` | 1.3333333333333333 |
| `privateMarginGetAutoRepay` | GET | `auto_repay` | 1.3333333333333333 |
| `privateMarginGetTransferable` | GET | `transferable` | 1.3333333333333333 |
| `privateMarginGetUniEstimateRate` | GET | `uni/estimate_rate` | 1.3333333333333333 |
| `privateMarginGetUniLoans` | GET | `uni/loans` | 1.3333333333333333 |
| `privateMarginGetUniLoanRecords` | GET | `uni/loan_records` | 1.3333333333333333 |
| `privateMarginGetUniInterestRecords` | GET | `uni/interest_records` | 1.3333333333333333 |
| `privateMarginGetUniBorrowable` | GET | `uni/borrowable` | 1.3333333333333333 |
| `privateMarginGetUserLoanMarginTiers` | GET | `user/loan_margin_tiers` | 1.3333333333333333 |
| `privateMarginGetUserAccount` | GET | `user/account` | 1.3333333333333333 |
| `privateMarginGetLoans` | GET | `loans` | 1.3333333333333333 |
| `privateMarginGetLoansLoanId` | GET | `loans/{loan_id}` | 1.3333333333333333 |
| `privateMarginGetLoansLoanIdRepayment` | GET | `loans/{loan_id}/repayment` | 1.3333333333333333 |
| `privateMarginGetLoanRecords` | GET | `loan_records` | 1.3333333333333333 |
| `privateMarginGetLoanRecordsLoanRecordId` | GET | `loan_records/{loan_record_id}` | 1.3333333333333333 |
| `privateMarginGetBorrowable` | GET | `borrowable` | 1.3333333333333333 |
| `privateMarginGetCrossAccounts` | GET | `cross/accounts` | 1.3333333333333333 |
| `privateMarginGetCrossAccountBook` | GET | `cross/account_book` | 1.3333333333333333 |
| `privateMarginGetCrossLoans` | GET | `cross/loans` | 1.3333333333333333 |
| `privateMarginGetCrossLoansLoanId` | GET | `cross/loans/{loan_id}` | 1.3333333333333333 |
| `privateMarginGetCrossRepayments` | GET | `cross/repayments` | 1.3333333333333333 |
| `privateMarginGetCrossInterestRecords` | GET | `cross/interest_records` | 1.3333333333333333 |
| `privateMarginGetCrossTransferable` | GET | `cross/transferable` | 1.3333333333333333 |
| `privateMarginGetCrossEstimateRate` | GET | `cross/estimate_rate` | 1.3333333333333333 |
| `privateMarginGetCrossBorrowable` | GET | `cross/borrowable` | 1.3333333333333333 |
| `privateMarginPostAutoRepay` | POST | `auto_repay` | 1.3333333333333333 |
| `privateMarginPostUniLoans` | POST | `uni/loans` | 1.3333333333333333 |
| `privateMarginPostLeverageUserMarketSetting` | POST | `leverage/user_market_setting` | 1.3333333333333333 |
| `privateMarginPostLoans` | POST | `loans` | 1.3333333333333333 |
| `privateMarginPostMergedLoans` | POST | `merged_loans` | 1.3333333333333333 |
| `privateMarginPostLoansLoanIdRepayment` | POST | `loans/{loan_id}/repayment` | 1.3333333333333333 |
| `privateMarginPostCrossLoans` | POST | `cross/loans` | 1.3333333333333333 |
| `privateMarginPostCrossRepayments` | POST | `cross/repayments` | 1.3333333333333333 |
| `privateMarginPatchLoansLoanId` | PATCH | `loans/{loan_id}` | 1.3333333333333333 |
| `privateMarginPatchLoanRecordsLoanRecordId` | PATCH | `loan_records/{loan_record_id}` | 1.3333333333333333 |
| `privateMarginDeleteLoansLoanId` | DELETE | `loans/{loan_id}` | 1.3333333333333333 |
| `privateFlash_swapGetOrders` | GET | `orders` | 1 |
| `privateFlash_swapGetOrdersOrderId` | GET | `orders/{order_id}` | 1 |
| `privateFlash_swapPostOrders` | POST | `orders` | 1 |
| `privateFlash_swapPostOrdersPreview` | POST | `orders/preview` | 1 |
| `privateFuturesGetSettleAccounts` | GET | `{settle}/accounts` | 1 |
| `privateFuturesGetSettleAccountBook` | GET | `{settle}/account_book` | 1 |
| `privateFuturesGetSettlePositions` | GET | `{settle}/positions` | 1 |
| `privateFuturesGetSettlePositionsContract` | GET | `{settle}/positions/{contract}` | 1 |
| `privateFuturesGetSettleGetLeverageContract` | GET | `{settle}/get_leverage/{contract}` | 1 |
| `privateFuturesGetSettleDualCompPositionsContract` | GET | `{settle}/dual_comp/positions/{contract}` | 1 |
| `privateFuturesGetSettleOrders` | GET | `{settle}/orders` | 1 |
| `privateFuturesGetSettleOrdersTimerange` | GET | `{settle}/orders_timerange` | 1 |
| `privateFuturesGetSettleOrdersOrderId` | GET | `{settle}/orders/{order_id}` | 1 |
| `privateFuturesGetSettleMyTrades` | GET | `{settle}/my_trades` | 1 |
| `privateFuturesGetSettleMyTradesTimerange` | GET | `{settle}/my_trades_timerange` | 1 |
| `privateFuturesGetSettlePositionClose` | GET | `{settle}/position_close` | 1 |
| `privateFuturesGetSettleLiquidates` | GET | `{settle}/liquidates` | 1 |
| `privateFuturesGetSettleAutoDeleverages` | GET | `{settle}/auto_deleverages` | 1 |
| `privateFuturesGetSettleFee` | GET | `{settle}/fee` | 1 |
| `privateFuturesGetSettleRiskLimitTable` | GET | `{settle}/risk_limit_table` | 1 |
| `privateFuturesGetSettlePriceOrders` | GET | `{settle}/price_orders` | 1 |
| `privateFuturesGetSettlePriceOrdersOrderId` | GET | `{settle}/price_orders/{order_id}` | 1 |
| `privateFuturesPostSettlePositionsContractMargin` | POST | `{settle}/positions/{contract}/margin` | 1 |
| `privateFuturesPostSettlePositionsContractLeverage` | POST | `{settle}/positions/{contract}/leverage` | 1 |
| `privateFuturesPostSettlePositionsContractSetLeverage` | POST | `{settle}/positions/{contract}/set_leverage` | 1 |
| `privateFuturesPostSettlePositionsContractRiskLimit` | POST | `{settle}/positions/{contract}/risk_limit` | 1 |
| `privateFuturesPostSettlePositionsCrossMode` | POST | `{settle}/positions/cross_mode` | 1 |
| `privateFuturesPostSettleDualCompPositionsCrossMode` | POST | `{settle}/dual_comp/positions/cross_mode` | 1 |
| `privateFuturesPostSettleDualMode` | POST | `{settle}/dual_mode` | 1 |
| `privateFuturesPostSettleSetPositionMode` | POST | `{settle}/set_position_mode` | 1 |
| `privateFuturesPostSettleDualCompPositionsContractMargin` | POST | `{settle}/dual_comp/positions/{contract}/margin` | 1 |
| `privateFuturesPostSettleDualCompPositionsContractLeverage` | POST | `{settle}/dual_comp/positions/{contract}/leverage` | 1 |
| `privateFuturesPostSettleDualCompPositionsContractRiskLimit` | POST | `{settle}/dual_comp/positions/{contract}/risk_limit` | 1 |
| `privateFuturesPostSettleOrders` | POST | `{settle}/orders` | 0.4 |
| `privateFuturesPostSettleBatchOrders` | POST | `{settle}/batch_orders` | 0.4 |
| `privateFuturesPostSettleCountdownCancelAll` | POST | `{settle}/countdown_cancel_all` | 0.4 |
| `privateFuturesPostSettleBatchCancelOrders` | POST | `{settle}/batch_cancel_orders` | 0.4 |
| `privateFuturesPostSettleBatchAmendOrders` | POST | `{settle}/batch_amend_orders` | 0.4 |
| `privateFuturesPostSettleBboOrders` | POST | `{settle}/bbo_orders` | 0.4 |
| `privateFuturesPostSettlePriceOrders` | POST | `{settle}/price_orders` | 0.4 |
| `privateFuturesPutSettleOrdersOrderId` | PUT | `{settle}/orders/{order_id}` | 1 |
| `privateFuturesPutSettlePriceOrdersOrderId` | PUT | `{settle}/price_orders/{order_id}` | 1 |
| `privateFuturesDeleteSettleOrders` | DELETE | `{settle}/orders` | 0.26666666666666666 |
| `privateFuturesDeleteSettleOrdersOrderId` | DELETE | `{settle}/orders/{order_id}` | 0.26666666666666666 |
| `privateFuturesDeleteSettlePriceOrders` | DELETE | `{settle}/price_orders` | 0.26666666666666666 |
| `privateFuturesDeleteSettlePriceOrdersOrderId` | DELETE | `{settle}/price_orders/{order_id}` | 0.26666666666666666 |
| `privateDeliveryGetSettleAccounts` | GET | `{settle}/accounts` | 1.3333333333333333 |
| `privateDeliveryGetSettleAccountBook` | GET | `{settle}/account_book` | 1.3333333333333333 |
| `privateDeliveryGetSettlePositions` | GET | `{settle}/positions` | 1.3333333333333333 |
| `privateDeliveryGetSettlePositionsContract` | GET | `{settle}/positions/{contract}` | 1.3333333333333333 |
| `privateDeliveryGetSettleOrders` | GET | `{settle}/orders` | 1.3333333333333333 |
| `privateDeliveryGetSettleOrdersOrderId` | GET | `{settle}/orders/{order_id}` | 1.3333333333333333 |
| `privateDeliveryGetSettleMyTrades` | GET | `{settle}/my_trades` | 1.3333333333333333 |
| `privateDeliveryGetSettlePositionClose` | GET | `{settle}/position_close` | 1.3333333333333333 |
| `privateDeliveryGetSettleLiquidates` | GET | `{settle}/liquidates` | 1.3333333333333333 |
| `privateDeliveryGetSettleSettlements` | GET | `{settle}/settlements` | 1.3333333333333333 |
| `privateDeliveryGetSettlePriceOrders` | GET | `{settle}/price_orders` | 1.3333333333333333 |
| `privateDeliveryGetSettlePriceOrdersOrderId` | GET | `{settle}/price_orders/{order_id}` | 1.3333333333333333 |
| `privateDeliveryPostSettlePositionsContractMargin` | POST | `{settle}/positions/{contract}/margin` | 1.3333333333333333 |
| `privateDeliveryPostSettlePositionsContractLeverage` | POST | `{settle}/positions/{contract}/leverage` | 1.3333333333333333 |
| `privateDeliveryPostSettlePositionsContractRiskLimit` | POST | `{settle}/positions/{contract}/risk_limit` | 1.3333333333333333 |
| `privateDeliveryPostSettleOrders` | POST | `{settle}/orders` | 1.3333333333333333 |
| `privateDeliveryPostSettlePriceOrders` | POST | `{settle}/price_orders` | 1.3333333333333333 |
| `privateDeliveryDeleteSettleOrders` | DELETE | `{settle}/orders` | 1.3333333333333333 |
| `privateDeliveryDeleteSettleOrdersOrderId` | DELETE | `{settle}/orders/{order_id}` | 1.3333333333333333 |
| `privateDeliveryDeleteSettlePriceOrders` | DELETE | `{settle}/price_orders` | 1.3333333333333333 |
| `privateDeliveryDeleteSettlePriceOrdersOrderId` | DELETE | `{settle}/price_orders/{order_id}` | 1.3333333333333333 |
| `privateOptionsGetMySettlements` | GET | `my_settlements` | 1.3333333333333333 |
| `privateOptionsGetAccounts` | GET | `accounts` | 1.3333333333333333 |
| `privateOptionsGetAccountBook` | GET | `account_book` | 1.3333333333333333 |
| `privateOptionsGetPositions` | GET | `positions` | 1.3333333333333333 |
| `privateOptionsGetPositionsContract` | GET | `positions/{contract}` | 1.3333333333333333 |
| `privateOptionsGetPositionClose` | GET | `position_close` | 1.3333333333333333 |
| `privateOptionsGetOrders` | GET | `orders` | 1.3333333333333333 |
| `privateOptionsGetOrdersOrderId` | GET | `orders/{order_id}` | 1.3333333333333333 |
| `privateOptionsGetMyTrades` | GET | `my_trades` | 1.3333333333333333 |
| `privateOptionsGetMmp` | GET | `mmp` | 1.3333333333333333 |
| `privateOptionsPostOrders` | POST | `orders` | 1.3333333333333333 |
| `privateOptionsPostCountdownCancelAll` | POST | `countdown_cancel_all` | 1.3333333333333333 |
| `privateOptionsPostMmp` | POST | `mmp` | 1.3333333333333333 |
| `privateOptionsPostMmpReset` | POST | `mmp/reset` | 1.3333333333333333 |
| `privateOptionsDeleteOrders` | DELETE | `orders` | 1.3333333333333333 |
| `privateOptionsDeleteOrdersOrderId` | DELETE | `orders/{order_id}` | 1.3333333333333333 |
| `privateEarnGetUniLends` | GET | `uni/lends` | 1.3333333333333333 |
| `privateEarnGetUniLendRecords` | GET | `uni/lend_records` | 1.3333333333333333 |
| `privateEarnGetUniInterestsCurrency` | GET | `uni/interests/{currency}` | 1.3333333333333333 |
| `privateEarnGetUniInterestRecords` | GET | `uni/interest_records` | 1.3333333333333333 |
| `privateEarnGetUniInterestStatusCurrency` | GET | `uni/interest_status/{currency}` | 1.3333333333333333 |
| `privateEarnGetUniChart` | GET | `uni/chart` | 1.3333333333333333 |
| `privateEarnGetUniRate` | GET | `uni/rate` | 1.3333333333333333 |
| `privateEarnGetStakingEth2RateRecords` | GET | `staking/eth2/rate_records` | 1.3333333333333333 |
| `privateEarnGetDualOrders` | GET | `dual/orders` | 1.3333333333333333 |
| `privateEarnGetDualBalance` | GET | `dual/balance` | 1.3333333333333333 |
| `privateEarnGetStructuredOrders` | GET | `structured/orders` | 1.3333333333333333 |
| `privateEarnGetStakingCoins` | GET | `staking/coins` | 1.3333333333333333 |
| `privateEarnGetStakingOrderList` | GET | `staking/order_list` | 1.3333333333333333 |
| `privateEarnGetStakingAwardList` | GET | `staking/award_list` | 1.3333333333333333 |
| `privateEarnGetStakingAssets` | GET | `staking/assets` | 1.3333333333333333 |
| `privateEarnGetUniCurrencies` | GET | `uni/currencies` | 1.3333333333333333 |
| `privateEarnGetUniCurrenciesCurrency` | GET | `uni/currencies/{currency}` | 1.3333333333333333 |
| `privateEarnPostUniLends` | POST | `uni/lends` | 1.3333333333333333 |
| `privateEarnPostStakingEth2Swap` | POST | `staking/eth2/swap` | 1.3333333333333333 |
| `privateEarnPostDualOrders` | POST | `dual/orders` | 1.3333333333333333 |
| `privateEarnPostStructuredOrders` | POST | `structured/orders` | 1.3333333333333333 |
| `privateEarnPostStakingSwap` | POST | `staking/swap` | 1.3333333333333333 |
| `privateEarnPutUniInterestReinvest` | PUT | `uni/interest_reinvest` | 1.3333333333333333 |
| `privateEarnPatchUniLends` | PATCH | `uni/lends` | 1.3333333333333333 |
| `privateLoanGetCollateralOrders` | GET | `collateral/orders` | 1.3333333333333333 |
| `privateLoanGetCollateralOrdersOrderId` | GET | `collateral/orders/{order_id}` | 1.3333333333333333 |
| `privateLoanGetCollateralRepayRecords` | GET | `collateral/repay_records` | 1.3333333333333333 |
| `privateLoanGetCollateralCollaterals` | GET | `collateral/collaterals` | 1.3333333333333333 |
| `privateLoanGetCollateralTotalAmount` | GET | `collateral/total_amount` | 1.3333333333333333 |
| `privateLoanGetCollateralLtv` | GET | `collateral/ltv` | 1.3333333333333333 |
| `privateLoanGetMultiCollateralOrders` | GET | `multi_collateral/orders` | 1.3333333333333333 |
| `privateLoanGetMultiCollateralOrdersOrderId` | GET | `multi_collateral/orders/{order_id}` | 1.3333333333333333 |
| `privateLoanGetMultiCollateralRepay` | GET | `multi_collateral/repay` | 1.3333333333333333 |
| `privateLoanGetMultiCollateralMortgage` | GET | `multi_collateral/mortgage` | 1.3333333333333333 |
| `privateLoanGetMultiCollateralCurrencyQuota` | GET | `multi_collateral/currency_quota` | 1.3333333333333333 |
| `privateLoanGetCollateralCurrencies` | GET | `collateral/currencies` | 1.3333333333333333 |
| `privateLoanGetMultiCollateralCurrencies` | GET | `multi_collateral/currencies` | 1.3333333333333333 |
| `privateLoanGetMultiCollateralLtv` | GET | `multi_collateral/ltv` | 1.3333333333333333 |
| `privateLoanGetMultiCollateralFixedRate` | GET | `multi_collateral/fixed_rate` | 1.3333333333333333 |
| `privateLoanGetMultiCollateralCurrentRate` | GET | `multi_collateral/current_rate` | 1.3333333333333333 |
| `privateLoanPostCollateralOrders` | POST | `collateral/orders` | 1.3333333333333333 |
| `privateLoanPostCollateralRepay` | POST | `collateral/repay` | 1.3333333333333333 |
| `privateLoanPostCollateralCollaterals` | POST | `collateral/collaterals` | 1.3333333333333333 |
| `privateLoanPostMultiCollateralOrders` | POST | `multi_collateral/orders` | 1.3333333333333333 |
| `privateLoanPostMultiCollateralRepay` | POST | `multi_collateral/repay` | 1.3333333333333333 |
| `privateLoanPostMultiCollateralMortgage` | POST | `multi_collateral/mortgage` | 1.3333333333333333 |
| `privateAccountGetDetail` | GET | `detail` | 1.3333333333333333 |
| `privateAccountGetMainKeys` | GET | `main_keys` | 1.3333333333333333 |
| `privateAccountGetRateLimit` | GET | `rate_limit` | 1.3333333333333333 |
| `privateAccountGetStpGroups` | GET | `stp_groups` | 1.3333333333333333 |
| `privateAccountGetStpGroupsStpIdUsers` | GET | `stp_groups/{stp_id}/users` | 1.3333333333333333 |
| `privateAccountGetStpGroupsDebitFee` | GET | `stp_groups/debit_fee` | 1.3333333333333333 |
| `privateAccountGetDebitFee` | GET | `debit_fee` | 1.3333333333333333 |
| `privateAccountPostStpGroups` | POST | `stp_groups` | 1.3333333333333333 |
| `privateAccountPostStpGroupsStpIdUsers` | POST | `stp_groups/{stp_id}/users` | 1.3333333333333333 |
| `privateAccountPostDebitFee` | POST | `debit_fee` | 1.3333333333333333 |
| `privateAccountDeleteStpGroupsStpIdUsers` | DELETE | `stp_groups/{stp_id}/users` | 1.3333333333333333 |
| `privateRebateGetAgencyTransactionHistory` | GET | `agency/transaction_history` | 1.3333333333333333 |
| `privateRebateGetAgencyCommissionHistory` | GET | `agency/commission_history` | 1.3333333333333333 |
| `privateRebateGetPartnerTransactionHistory` | GET | `partner/transaction_history` | 1.3333333333333333 |
| `privateRebateGetPartnerCommissionHistory` | GET | `partner/commission_history` | 1.3333333333333333 |
| `privateRebateGetPartnerSubList` | GET | `partner/sub_list` | 1.3333333333333333 |
| `privateRebateGetBrokerCommissionHistory` | GET | `broker/commission_history` | 1.3333333333333333 |
| `privateRebateGetBrokerTransactionHistory` | GET | `broker/transaction_history` | 1.3333333333333333 |
| `privateRebateGetUserInfo` | GET | `user/info` | 1.3333333333333333 |
| `privateRebateGetUserSubRelation` | GET | `user/sub_relation` | 1.3333333333333333 |
| `privateOtcGetGetUserDefBank` | GET | `get_user_def_bank` | 1 |
| `privateOtcGetOrderList` | GET | `order/list` | 1 |
| `privateOtcGetStableCoinOrderList` | GET | `stable_coin/order/list` | 1 |
| `privateOtcGetOrderDetail` | GET | `order/detail` | 1 |
| `privateOtcPostQuote` | POST | `quote` | 1 |
| `privateOtcPostOrderCreate` | POST | `order/create` | 1 |
| `privateOtcPostStableCoinOrderCreate` | POST | `stable_coin/order/create` | 1 |
| `privateOtcPostOrderPaid` | POST | `order/paid` | 1 |
| `privateOtcPostOrderCancel` | POST | `order/cancel` | 1 |

