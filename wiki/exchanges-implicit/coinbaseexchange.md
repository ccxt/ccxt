Every endpoint in `coinbaseexchange`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/coinbaseexchange) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetCurrencies`); the snake_case alias (`public_get_currencies`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetCurrencies`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const coinbaseexchange = new ccxt.coinbaseexchange ();
const response = await coinbaseexchange.publicGetCurrencies (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const coinbaseexchange = new ccxt.coinbaseexchange ();
const response = await coinbaseexchange.publicGetCurrencies (params);
```

#### **Python**

```python
import ccxt
coinbaseexchange = ccxt.coinbaseexchange()
response = coinbaseexchange.public_get_currencies(params)
```

#### **PHP**

```php
$coinbaseexchange = new \ccxt\coinbaseexchange();
$response = $coinbaseexchange->public_get_currencies($params);
```

#### **C#**

```csharp
using ccxt;
var coinbaseexchange = new Coinbaseexchange();
var response = await coinbaseexchange.publicGetCurrencies(parameters);
```

#### **Go**

```go
coinbaseexchange := ccxt.NewCoinbaseexchange(nil)
response := <-coinbaseexchange.PublicGetCurrencies(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official coinbaseexchange API documentation:** [docs.cloud.coinbase.com](https://docs.cloud.coinbase.com/exchange/docs/)

> 82 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetCurrencies` | GET | `currencies` | 1 |
| `publicGetProducts` | GET | `products` | 1 |
| `publicGetProductsId` | GET | `products/{id}` | 1 |
| `publicGetProductsIdBook` | GET | `products/{id}/book` | 1 |
| `publicGetProductsIdCandles` | GET | `products/{id}/candles` | 1 |
| `publicGetProductsIdStats` | GET | `products/{id}/stats` | 1 |
| `publicGetProductsIdTicker` | GET | `products/{id}/ticker` | 1 |
| `publicGetProductsIdTrades` | GET | `products/{id}/trades` | 1 |
| `publicGetTime` | GET | `time` | 1 |
| `publicGetProductsSparkLines` | GET | `products/spark-lines` | 1 |
| `publicGetProductsVolumeSummary` | GET | `products/volume-summary` | 1 |

## private

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAddressBook` | GET | `address-book` | 1 |
| `privateGetAccounts` | GET | `accounts` | 1 |
| `privateGetAccountsId` | GET | `accounts/{id}` | 1 |
| `privateGetAccountsIdHolds` | GET | `accounts/{id}/holds` | 1 |
| `privateGetAccountsIdLedger` | GET | `accounts/{id}/ledger` | 1 |
| `privateGetAccountsIdTransfers` | GET | `accounts/{id}/transfers` | 1 |
| `privateGetCoinbaseAccounts` | GET | `coinbase-accounts` | 1 |
| `privateGetFills` | GET | `fills` | 1 |
| `privateGetFunding` | GET | `funding` | 1 |
| `privateGetFees` | GET | `fees` | 1 |
| `privateGetMarginProfileInformation` | GET | `margin/profile_information` | 1 |
| `privateGetMarginBuyingPower` | GET | `margin/buying_power` | 1 |
| `privateGetMarginWithdrawalPower` | GET | `margin/withdrawal_power` | 1 |
| `privateGetMarginWithdrawalPowerAll` | GET | `margin/withdrawal_power_all` | 1 |
| `privateGetMarginExitPlan` | GET | `margin/exit_plan` | 1 |
| `privateGetMarginLiquidationHistory` | GET | `margin/liquidation_history` | 1 |
| `privateGetMarginPositionRefreshAmounts` | GET | `margin/position_refresh_amounts` | 1 |
| `privateGetMarginStatus` | GET | `margin/status` | 1 |
| `privateGetOracle` | GET | `oracle` | 1 |
| `privateGetOrders` | GET | `orders` | 1 |
| `privateGetOrdersId` | GET | `orders/{id}` | 1 |
| `privateGetOrdersClientClientOid` | GET | `orders/client:{client_oid}` | 1 |
| `privateGetOtcOrders` | GET | `otc/orders` | 1 |
| `privateGetPaymentMethods` | GET | `payment-methods` | 1 |
| `privateGetPosition` | GET | `position` | 1 |
| `privateGetProfiles` | GET | `profiles` | 1 |
| `privateGetProfilesId` | GET | `profiles/{id}` | 1 |
| `privateGetReportsReportId` | GET | `reports/{report_id}` | 1 |
| `privateGetTransfers` | GET | `transfers` | 1 |
| `privateGetTransfersTransferId` | GET | `transfers/{transfer_id}` | 1 |
| `privateGetUsersSelfExchangeLimits` | GET | `users/self/exchange-limits` | 1 |
| `privateGetUsersSelfHoldBalances` | GET | `users/self/hold-balances` | 1 |
| `privateGetUsersSelfTrailingVolume` | GET | `users/self/trailing-volume` | 1 |
| `privateGetWithdrawalsFeeEstimate` | GET | `withdrawals/fee-estimate` | 1 |
| `privateGetConversionsConversionId` | GET | `conversions/{conversion_id}` | 1 |
| `privateGetConversions` | GET | `conversions` | 1 |
| `privateGetConversionsFees` | GET | `conversions/fees` | 1 |
| `privateGetLoansLendingOverview` | GET | `loans/lending-overview` | 1 |
| `privateGetLoansLendingOverviewXm` | GET | `loans/lending-overview-xm` | 1 |
| `privateGetLoansLoanPreview` | GET | `loans/loan-preview` | 1 |
| `privateGetLoansLoanPreviewXm` | GET | `loans/loan-preview-xm` | 1 |
| `privateGetLoansRepaymentPreview` | GET | `loans/repayment-preview` | 1 |
| `privateGetLoansRepaymentPreviewXm` | GET | `loans/repayment-preview-xm` | 1 |
| `privateGetLoansInterestLoanId` | GET | `loans/interest/{loan_id}` | 1 |
| `privateGetLoansInterestHistoryLoanId` | GET | `loans/interest/history/{loan_id}` | 1 |
| `privateGetLoansInterest` | GET | `loans/interest` | 1 |
| `privateGetLoansAssets` | GET | `loans/assets` | 1 |
| `privateGetLoans` | GET | `loans` | 1 |
| `privatePostConversions` | POST | `conversions` | 1 |
| `privatePostDepositsCoinbaseAccount` | POST | `deposits/coinbase-account` | 1 |
| `privatePostDepositsPaymentMethod` | POST | `deposits/payment-method` | 1 |
| `privatePostCoinbaseAccountsIdAddresses` | POST | `coinbase-accounts/{id}/addresses` | 1 |
| `privatePostFundingRepay` | POST | `funding/repay` | 1 |
| `privatePostOrders` | POST | `orders` | 1 |
| `privatePostPositionClose` | POST | `position/close` | 1 |
| `privatePostProfiles` | POST | `profiles` | 1 |
| `privatePostProfilesMarginTransfer` | POST | `profiles/margin-transfer` | 1 |
| `privatePostProfilesTransfer` | POST | `profiles/transfer` | 1 |
| `privatePostReports` | POST | `reports` | 1 |
| `privatePostWithdrawalsCoinbase` | POST | `withdrawals/coinbase` | 1 |
| `privatePostWithdrawalsCoinbaseAccount` | POST | `withdrawals/coinbase-account` | 1 |
| `privatePostWithdrawalsCrypto` | POST | `withdrawals/crypto` | 1 |
| `privatePostWithdrawalsPaymentMethod` | POST | `withdrawals/payment-method` | 1 |
| `privatePostLoansOpen` | POST | `loans/open` | 1 |
| `privatePostLoansRepayInterest` | POST | `loans/repay-interest` | 1 |
| `privatePostLoansRepayPrincipal` | POST | `loans/repay-principal` | 1 |
| `privateDeleteOrders` | DELETE | `orders` | 1 |
| `privateDeleteOrdersClientClientOid` | DELETE | `orders/client:{client_oid}` | 1 |
| `privateDeleteOrdersId` | DELETE | `orders/{id}` | 1 |
| `privatePutProfilesIdDeactivate` | PUT | `profiles/{id}/deactivate` | 1 |
| `privatePutProfilesId` | PUT | `profiles/{id}` | 1 |

