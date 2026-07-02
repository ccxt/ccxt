Every endpoint in `cryptocom`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/cryptocom) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `basePublicGetV1PublicGetAnnouncements`); the snake_case alias (`base_public_get_v1_public_get_announcements`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`BasePublicGetV1PublicGetAnnouncements`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const cryptocom = new ccxt.cryptocom ();
const response = await cryptocom.basePublicGetV1PublicGetAnnouncements (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const cryptocom = new ccxt.cryptocom ();
const response = await cryptocom.basePublicGetV1PublicGetAnnouncements (params);
```

#### **Python**

```python
import ccxt
cryptocom = ccxt.cryptocom()
response = cryptocom.base_public_get_v1_public_get_announcements(params)
```

#### **PHP**

```php
$cryptocom = new \ccxt\cryptocom();
$response = $cryptocom->base_public_get_v1_public_get_announcements($params);
```

#### **C#**

```csharp
using ccxt;
var cryptocom = new Cryptocom();
var response = await cryptocom.basePublicGetV1PublicGetAnnouncements(parameters);
```

#### **Go**

```go
cryptocom := ccxt.NewCryptocom(nil)
response := <-cryptocom.BasePublicGetV1PublicGetAnnouncements(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official cryptocom API documentation:** [exchange-docs.crypto.com](https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html) · [exchange-docs.crypto.com](https://exchange-docs.crypto.com/spot/index.html) · [exchange-docs.crypto.com](https://exchange-docs.crypto.com/derivatives/index.html)

> 129 implicit endpoints across 4 access groups.

## base

**Base URL**: `https://api.crypto.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `basePublicGetV1PublicGetAnnouncements` | GET | `v1/public/get-announcements` | 1 |

## v1

**Base URL**: `https://api.crypto.com/exchange/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v1PublicGetPublicAuth` | GET | `public/auth` | 3.3333333333333335 |
| `v1PublicGetPublicGetInstruments` | GET | `public/get-instruments` | 3.3333333333333335 |
| `v1PublicGetPublicGetBook` | GET | `public/get-book` | 1 |
| `v1PublicGetPublicGetCandlestick` | GET | `public/get-candlestick` | 1 |
| `v1PublicGetPublicGetTrades` | GET | `public/get-trades` | 1 |
| `v1PublicGetPublicGetTickers` | GET | `public/get-tickers` | 1 |
| `v1PublicGetPublicGetValuations` | GET | `public/get-valuations` | 1 |
| `v1PublicGetPublicGetExpiredSettlementPrice` | GET | `public/get-expired-settlement-price` | 3.3333333333333335 |
| `v1PublicGetPublicGetInsurance` | GET | `public/get-insurance` | 1 |
| `v1PublicGetPublicGetAnnouncements` | GET | `public/get-announcements` | 1 |
| `v1PublicGetPublicGetRiskParameters` | GET | `public/get-risk-parameters` | 1 |
| `v1PublicPostPublicStakingGetConversionRate` | POST | `public/staking/get-conversion-rate` | 2 |
| `v1PrivatePostPrivateSetCancelOnDisconnect` | POST | `private/set-cancel-on-disconnect` | 3.3333333333333335 |
| `v1PrivatePostPrivateGetCancelOnDisconnect` | POST | `private/get-cancel-on-disconnect` | 3.3333333333333335 |
| `v1PrivatePostPrivateUserBalance` | POST | `private/user-balance` | 3.3333333333333335 |
| `v1PrivatePostPrivateUserBalanceHistory` | POST | `private/user-balance-history` | 3.3333333333333335 |
| `v1PrivatePostPrivateGetPositions` | POST | `private/get-positions` | 3.3333333333333335 |
| `v1PrivatePostPrivateCreateOrder` | POST | `private/create-order` | 0.6666666666666666 |
| `v1PrivatePostPrivateAmendOrder` | POST | `private/amend-order` | 1.3333333333333333 |
| `v1PrivatePostPrivateCreateOrderList` | POST | `private/create-order-list` | 3.3333333333333335 |
| `v1PrivatePostPrivateCancelOrder` | POST | `private/cancel-order` | 0.6666666666666666 |
| `v1PrivatePostPrivateCancelOrderList` | POST | `private/cancel-order-list` | 3.3333333333333335 |
| `v1PrivatePostPrivateCancelAllOrders` | POST | `private/cancel-all-orders` | 0.6666666666666666 |
| `v1PrivatePostPrivateClosePosition` | POST | `private/close-position` | 3.3333333333333335 |
| `v1PrivatePostPrivateGetOrderHistory` | POST | `private/get-order-history` | 100 |
| `v1PrivatePostPrivateGetOpenOrders` | POST | `private/get-open-orders` | 3.3333333333333335 |
| `v1PrivatePostPrivateGetOrderDetail` | POST | `private/get-order-detail` | 0.3333333333333333 |
| `v1PrivatePostPrivateGetTrades` | POST | `private/get-trades` | 100 |
| `v1PrivatePostPrivateChangeAccountLeverage` | POST | `private/change-account-leverage` | 3.3333333333333335 |
| `v1PrivatePostPrivateGetTransactions` | POST | `private/get-transactions` | 3.3333333333333335 |
| `v1PrivatePostPrivateCreateSubaccountTransfer` | POST | `private/create-subaccount-transfer` | 3.3333333333333335 |
| `v1PrivatePostPrivateGetSubaccountBalances` | POST | `private/get-subaccount-balances` | 3.3333333333333335 |
| `v1PrivatePostPrivateGetOrderList` | POST | `private/get-order-list` | 3.3333333333333335 |
| `v1PrivatePostPrivateCreateWithdrawal` | POST | `private/create-withdrawal` | 3.3333333333333335 |
| `v1PrivatePostPrivateGetCurrencyNetworks` | POST | `private/get-currency-networks` | 3.3333333333333335 |
| `v1PrivatePostPrivateGetDepositAddress` | POST | `private/get-deposit-address` | 3.3333333333333335 |
| `v1PrivatePostPrivateGetAccounts` | POST | `private/get-accounts` | 3.3333333333333335 |
| `v1PrivatePostPrivateGetWithdrawalHistory` | POST | `private/get-withdrawal-history` | 3.3333333333333335 |
| `v1PrivatePostPrivateGetDepositHistory` | POST | `private/get-deposit-history` | 3.3333333333333335 |
| `v1PrivatePostPrivateGetFeeRate` | POST | `private/get-fee-rate` | 2 |
| `v1PrivatePostPrivateGetInstrumentFeeRate` | POST | `private/get-instrument-fee-rate` | 2 |
| `v1PrivatePostPrivateFiatFiatDepositInfo` | POST | `private/fiat/fiat-deposit-info` | 3.3333333333333335 |
| `v1PrivatePostPrivateFiatFiatDepositHistory` | POST | `private/fiat/fiat-deposit-history` | 3.3333333333333335 |
| `v1PrivatePostPrivateFiatFiatWithdrawHistory` | POST | `private/fiat/fiat-withdraw-history` | 3.3333333333333335 |
| `v1PrivatePostPrivateFiatFiatCreateWithdraw` | POST | `private/fiat/fiat-create-withdraw` | 3.3333333333333335 |
| `v1PrivatePostPrivateFiatFiatTransactionQuota` | POST | `private/fiat/fiat-transaction-quota` | 3.3333333333333335 |
| `v1PrivatePostPrivateFiatFiatTransactionLimit` | POST | `private/fiat/fiat-transaction-limit` | 3.3333333333333335 |
| `v1PrivatePostPrivateFiatFiatGetBankAccounts` | POST | `private/fiat/fiat-get-bank-accounts` | 3.3333333333333335 |
| `v1PrivatePostPrivateStakingStake` | POST | `private/staking/stake` | 2 |
| `v1PrivatePostPrivateStakingUnstake` | POST | `private/staking/unstake` | 2 |
| `v1PrivatePostPrivateStakingGetStakingPosition` | POST | `private/staking/get-staking-position` | 2 |
| `v1PrivatePostPrivateStakingGetStakingInstruments` | POST | `private/staking/get-staking-instruments` | 2 |
| `v1PrivatePostPrivateStakingGetOpenStake` | POST | `private/staking/get-open-stake` | 2 |
| `v1PrivatePostPrivateStakingGetStakeHistory` | POST | `private/staking/get-stake-history` | 2 |
| `v1PrivatePostPrivateStakingGetRewardHistory` | POST | `private/staking/get-reward-history` | 2 |
| `v1PrivatePostPrivateStakingConvert` | POST | `private/staking/convert` | 2 |
| `v1PrivatePostPrivateStakingGetOpenConvert` | POST | `private/staking/get-open-convert` | 2 |
| `v1PrivatePostPrivateStakingGetConvertHistory` | POST | `private/staking/get-convert-history` | 2 |
| `v1PrivatePostPrivateCreateIsolatedMarginTransfer` | POST | `private/create-isolated-margin-transfer` | 3.3333333333333335 |
| `v1PrivatePostPrivateChangeIsolatedMarginLeverage` | POST | `private/change-isolated-margin-leverage` | 3.3333333333333335 |

## v2

**Base URL**: `https://api.crypto.com/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PublicGetPublicAuth` | GET | `public/auth` | 1 |
| `v2PublicGetPublicGetInstruments` | GET | `public/get-instruments` | 1 |
| `v2PublicGetPublicGetBook` | GET | `public/get-book` | 1 |
| `v2PublicGetPublicGetCandlestick` | GET | `public/get-candlestick` | 1 |
| `v2PublicGetPublicGetTicker` | GET | `public/get-ticker` | 1 |
| `v2PublicGetPublicGetTrades` | GET | `public/get-trades` | 1 |
| `v2PublicGetPublicMarginGetTransferCurrencies` | GET | `public/margin/get-transfer-currencies` | 1 |
| `v2PublicGetPublicMarginGetLoadCurrenices` | GET | `public/margin/get-load-currenices` | 1 |
| `v2PublicGetPublicRespondHeartbeat` | GET | `public/respond-heartbeat` | 1 |
| `v2PrivatePostPrivateSetCancelOnDisconnect` | POST | `private/set-cancel-on-disconnect` | 3.3333333333333335 |
| `v2PrivatePostPrivateGetCancelOnDisconnect` | POST | `private/get-cancel-on-disconnect` | 3.3333333333333335 |
| `v2PrivatePostPrivateCreateWithdrawal` | POST | `private/create-withdrawal` | 3.3333333333333335 |
| `v2PrivatePostPrivateGetWithdrawalHistory` | POST | `private/get-withdrawal-history` | 3.3333333333333335 |
| `v2PrivatePostPrivateGetCurrencyNetworks` | POST | `private/get-currency-networks` | 3.3333333333333335 |
| `v2PrivatePostPrivateGetDepositHistory` | POST | `private/get-deposit-history` | 3.3333333333333335 |
| `v2PrivatePostPrivateGetDepositAddress` | POST | `private/get-deposit-address` | 3.3333333333333335 |
| `v2PrivatePostPrivateExportCreateExportRequest` | POST | `private/export/create-export-request` | 3.3333333333333335 |
| `v2PrivatePostPrivateExportGetExportRequests` | POST | `private/export/get-export-requests` | 3.3333333333333335 |
| `v2PrivatePostPrivateExportDownloadExportOutput` | POST | `private/export/download-export-output` | 3.3333333333333335 |
| `v2PrivatePostPrivateGetAccountSummary` | POST | `private/get-account-summary` | 3.3333333333333335 |
| `v2PrivatePostPrivateCreateOrder` | POST | `private/create-order` | 0.6666666666666666 |
| `v2PrivatePostPrivateCancelOrder` | POST | `private/cancel-order` | 0.6666666666666666 |
| `v2PrivatePostPrivateCancelAllOrders` | POST | `private/cancel-all-orders` | 0.6666666666666666 |
| `v2PrivatePostPrivateCreateOrderList` | POST | `private/create-order-list` | 3.3333333333333335 |
| `v2PrivatePostPrivateGetOrderHistory` | POST | `private/get-order-history` | 3.3333333333333335 |
| `v2PrivatePostPrivateGetOpenOrders` | POST | `private/get-open-orders` | 3.3333333333333335 |
| `v2PrivatePostPrivateGetOrderDetail` | POST | `private/get-order-detail` | 0.3333333333333333 |
| `v2PrivatePostPrivateGetTrades` | POST | `private/get-trades` | 100 |
| `v2PrivatePostPrivateGetAccounts` | POST | `private/get-accounts` | 3.3333333333333335 |
| `v2PrivatePostPrivateGetSubaccountBalances` | POST | `private/get-subaccount-balances` | 3.3333333333333335 |
| `v2PrivatePostPrivateCreateSubaccountTransfer` | POST | `private/create-subaccount-transfer` | 3.3333333333333335 |
| `v2PrivatePostPrivateOtcGetOtcUser` | POST | `private/otc/get-otc-user` | 3.3333333333333335 |
| `v2PrivatePostPrivateOtcGetInstruments` | POST | `private/otc/get-instruments` | 3.3333333333333335 |
| `v2PrivatePostPrivateOtcRequestQuote` | POST | `private/otc/request-quote` | 100 |
| `v2PrivatePostPrivateOtcAcceptQuote` | POST | `private/otc/accept-quote` | 100 |
| `v2PrivatePostPrivateOtcGetQuoteHistory` | POST | `private/otc/get-quote-history` | 3.3333333333333335 |
| `v2PrivatePostPrivateOtcGetTradeHistory` | POST | `private/otc/get-trade-history` | 3.3333333333333335 |
| `v2PrivatePostPrivateOtcCreateOrder` | POST | `private/otc/create-order` | 3.3333333333333335 |

## derivatives

**Base URL**: `https://deriv-api.crypto.com/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `derivativesPublicGetPublicAuth` | GET | `public/auth` | 3.3333333333333335 |
| `derivativesPublicGetPublicGetInstruments` | GET | `public/get-instruments` | 3.3333333333333335 |
| `derivativesPublicGetPublicGetBook` | GET | `public/get-book` | 1 |
| `derivativesPublicGetPublicGetCandlestick` | GET | `public/get-candlestick` | 1 |
| `derivativesPublicGetPublicGetTrades` | GET | `public/get-trades` | 1 |
| `derivativesPublicGetPublicGetTickers` | GET | `public/get-tickers` | 1 |
| `derivativesPublicGetPublicGetValuations` | GET | `public/get-valuations` | 1 |
| `derivativesPublicGetPublicGetExpiredSettlementPrice` | GET | `public/get-expired-settlement-price` | 3.3333333333333335 |
| `derivativesPublicGetPublicGetInsurance` | GET | `public/get-insurance` | 1 |
| `derivativesPrivatePostPrivateSetCancelOnDisconnect` | POST | `private/set-cancel-on-disconnect` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateGetCancelOnDisconnect` | POST | `private/get-cancel-on-disconnect` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateUserBalance` | POST | `private/user-balance` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateUserBalanceHistory` | POST | `private/user-balance-history` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateGetPositions` | POST | `private/get-positions` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateCreateOrder` | POST | `private/create-order` | 0.6666666666666666 |
| `derivativesPrivatePostPrivateCreateOrderList` | POST | `private/create-order-list` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateCancelOrder` | POST | `private/cancel-order` | 0.6666666666666666 |
| `derivativesPrivatePostPrivateCancelOrderList` | POST | `private/cancel-order-list` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateCancelAllOrders` | POST | `private/cancel-all-orders` | 0.6666666666666666 |
| `derivativesPrivatePostPrivateClosePosition` | POST | `private/close-position` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateConvertCollateral` | POST | `private/convert-collateral` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateGetOrderHistory` | POST | `private/get-order-history` | 100 |
| `derivativesPrivatePostPrivateGetOpenOrders` | POST | `private/get-open-orders` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateGetOrderDetail` | POST | `private/get-order-detail` | 0.3333333333333333 |
| `derivativesPrivatePostPrivateGetTrades` | POST | `private/get-trades` | 100 |
| `derivativesPrivatePostPrivateChangeAccountLeverage` | POST | `private/change-account-leverage` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateGetTransactions` | POST | `private/get-transactions` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateCreateSubaccountTransfer` | POST | `private/create-subaccount-transfer` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateGetSubaccountBalances` | POST | `private/get-subaccount-balances` | 3.3333333333333335 |
| `derivativesPrivatePostPrivateGetOrderList` | POST | `private/get-order-list` | 3.3333333333333335 |

