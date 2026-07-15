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
| `publicGetCurrencies` | GET | `currencies` |  |
| `publicGetProducts` | GET | `products` |  |
| `publicGetProductsId` | GET | `products/{id}` |  |
| `publicGetProductsIdBook` | GET | `products/{id}/book` |  |
| `publicGetProductsIdCandles` | GET | `products/{id}/candles` |  |
| `publicGetProductsIdStats` | GET | `products/{id}/stats` |  |
| `publicGetProductsIdTicker` | GET | `products/{id}/ticker` |  |
| `publicGetProductsIdTrades` | GET | `products/{id}/trades` |  |
| `publicGetTime` | GET | `time` |  |
| `publicGetProductsSparkLines` | GET | `products/spark-lines` |  |
| `publicGetProductsVolumeSummary` | GET | `products/volume-summary` |  |

## private

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAddressBook` | GET | `address-book` |  |
| `privateGetAccounts` | GET | `accounts` |  |
| `privateGetAccountsId` | GET | `accounts/{id}` |  |
| `privateGetAccountsIdHolds` | GET | `accounts/{id}/holds` |  |
| `privateGetAccountsIdLedger` | GET | `accounts/{id}/ledger` |  |
| `privateGetAccountsIdTransfers` | GET | `accounts/{id}/transfers` |  |
| `privateGetCoinbaseAccounts` | GET | `coinbase-accounts` |  |
| `privateGetFills` | GET | `fills` |  |
| `privateGetFunding` | GET | `funding` |  |
| `privateGetFees` | GET | `fees` |  |
| `privateGetMarginProfileInformation` | GET | `margin/profile_information` |  |
| `privateGetMarginBuyingPower` | GET | `margin/buying_power` |  |
| `privateGetMarginWithdrawalPower` | GET | `margin/withdrawal_power` |  |
| `privateGetMarginWithdrawalPowerAll` | GET | `margin/withdrawal_power_all` |  |
| `privateGetMarginExitPlan` | GET | `margin/exit_plan` |  |
| `privateGetMarginLiquidationHistory` | GET | `margin/liquidation_history` |  |
| `privateGetMarginPositionRefreshAmounts` | GET | `margin/position_refresh_amounts` |  |
| `privateGetMarginStatus` | GET | `margin/status` |  |
| `privateGetOracle` | GET | `oracle` |  |
| `privateGetOrders` | GET | `orders` |  |
| `privateGetOrdersId` | GET | `orders/{id}` |  |
| `privateGetOrdersClientClientOid` | GET | `orders/client:{client_oid}` |  |
| `privateGetOtcOrders` | GET | `otc/orders` |  |
| `privateGetPaymentMethods` | GET | `payment-methods` |  |
| `privateGetPosition` | GET | `position` |  |
| `privateGetProfiles` | GET | `profiles` |  |
| `privateGetProfilesId` | GET | `profiles/{id}` |  |
| `privateGetReportsReportId` | GET | `reports/{report_id}` |  |
| `privateGetTransfers` | GET | `transfers` |  |
| `privateGetTransfersTransferId` | GET | `transfers/{transfer_id}` |  |
| `privateGetUsersSelfExchangeLimits` | GET | `users/self/exchange-limits` |  |
| `privateGetUsersSelfHoldBalances` | GET | `users/self/hold-balances` |  |
| `privateGetUsersSelfTrailingVolume` | GET | `users/self/trailing-volume` |  |
| `privateGetWithdrawalsFeeEstimate` | GET | `withdrawals/fee-estimate` |  |
| `privateGetConversionsConversionId` | GET | `conversions/{conversion_id}` |  |
| `privateGetConversions` | GET | `conversions` |  |
| `privateGetConversionsFees` | GET | `conversions/fees` |  |
| `privateGetLoansLendingOverview` | GET | `loans/lending-overview` |  |
| `privateGetLoansLendingOverviewXm` | GET | `loans/lending-overview-xm` |  |
| `privateGetLoansLoanPreview` | GET | `loans/loan-preview` |  |
| `privateGetLoansLoanPreviewXm` | GET | `loans/loan-preview-xm` |  |
| `privateGetLoansRepaymentPreview` | GET | `loans/repayment-preview` |  |
| `privateGetLoansRepaymentPreviewXm` | GET | `loans/repayment-preview-xm` |  |
| `privateGetLoansInterestLoanId` | GET | `loans/interest/{loan_id}` |  |
| `privateGetLoansInterestHistoryLoanId` | GET | `loans/interest/history/{loan_id}` |  |
| `privateGetLoansInterest` | GET | `loans/interest` |  |
| `privateGetLoansAssets` | GET | `loans/assets` |  |
| `privateGetLoans` | GET | `loans` |  |
| `privatePostConversions` | POST | `conversions` |  |
| `privatePostDepositsCoinbaseAccount` | POST | `deposits/coinbase-account` |  |
| `privatePostDepositsPaymentMethod` | POST | `deposits/payment-method` |  |
| `privatePostCoinbaseAccountsIdAddresses` | POST | `coinbase-accounts/{id}/addresses` |  |
| `privatePostFundingRepay` | POST | `funding/repay` |  |
| `privatePostOrders` | POST | `orders` |  |
| `privatePostPositionClose` | POST | `position/close` |  |
| `privatePostProfiles` | POST | `profiles` |  |
| `privatePostProfilesMarginTransfer` | POST | `profiles/margin-transfer` |  |
| `privatePostProfilesTransfer` | POST | `profiles/transfer` |  |
| `privatePostReports` | POST | `reports` |  |
| `privatePostWithdrawalsCoinbase` | POST | `withdrawals/coinbase` |  |
| `privatePostWithdrawalsCoinbaseAccount` | POST | `withdrawals/coinbase-account` |  |
| `privatePostWithdrawalsCrypto` | POST | `withdrawals/crypto` |  |
| `privatePostWithdrawalsPaymentMethod` | POST | `withdrawals/payment-method` |  |
| `privatePostLoansOpen` | POST | `loans/open` |  |
| `privatePostLoansRepayInterest` | POST | `loans/repay-interest` |  |
| `privatePostLoansRepayPrincipal` | POST | `loans/repay-principal` |  |
| `privateDeleteOrders` | DELETE | `orders` |  |
| `privateDeleteOrdersClientClientOid` | DELETE | `orders/client:{client_oid}` |  |
| `privateDeleteOrdersId` | DELETE | `orders/{id}` |  |
| `privatePutProfilesIdDeactivate` | PUT | `profiles/{id}/deactivate` |  |
| `privatePutProfilesId` | PUT | `profiles/{id}` |  |

