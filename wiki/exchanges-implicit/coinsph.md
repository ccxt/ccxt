Every endpoint in `coinsph`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/coinsph) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetOpenapiV1Ping`); the snake_case alias (`public_get_openapi_v1_ping`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetOpenapiV1Ping`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const coinsph = new ccxt.coinsph ();
const response = await coinsph.publicGetOpenapiV1Ping (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const coinsph = new ccxt.coinsph ();
const response = await coinsph.publicGetOpenapiV1Ping (params);
```

#### **Python**

```python
import ccxt
coinsph = ccxt.coinsph()
response = coinsph.public_get_openapi_v1_ping(params)
```

#### **PHP**

```php
$coinsph = new \ccxt\coinsph();
$response = $coinsph->public_get_openapi_v1_ping($params);
```

#### **C#**

```csharp
using ccxt;
var coinsph = new Coinsph();
var response = await coinsph.publicGetOpenapiV1Ping(parameters);
```

#### **Go**

```go
coinsph := ccxt.NewCoinsph(nil)
response := <-coinsph.PublicGetOpenapiV1Ping(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official coinsph API documentation:** [coins-docs.github.io](https://coins-docs.github.io/rest-api)

> 78 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.pro.coins.ph`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetOpenapiV1Ping` | GET | `openapi/v1/ping` | 1 |
| `publicGetOpenapiV1Time` | GET | `openapi/v1/time` | 1 |
| `publicGetOpenapiV1UserIp` | GET | `openapi/v1/user/ip` | 1 |
| `publicGetOpenapiQuoteV1Ticker24hr` | GET | `openapi/quote/v1/ticker/24hr` | 1 |
| `publicGetOpenapiQuoteV1TickerPrice` | GET | `openapi/quote/v1/ticker/price` | 1 |
| `publicGetOpenapiQuoteV1TickerBookTicker` | GET | `openapi/quote/v1/ticker/bookTicker` | 1 |
| `publicGetOpenapiV1ExchangeInfo` | GET | `openapi/v1/exchangeInfo` | 10 |
| `publicGetOpenapiQuoteV1Depth` | GET | `openapi/quote/v1/depth` | 1 |
| `publicGetOpenapiQuoteV1Klines` | GET | `openapi/quote/v1/klines` | 1 |
| `publicGetOpenapiQuoteV1Trades` | GET | `openapi/quote/v1/trades` | 1 |
| `publicGetOpenapiV1Pairs` | GET | `openapi/v1/pairs` | 1 |
| `publicGetOpenapiQuoteV1AvgPrice` | GET | `openapi/quote/v1/avgPrice` | 1 |

## private

**Base URL**: `https://api.pro.coins.ph`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetOpenapiV1CheckSysStatus` | GET | `openapi/v1/check-sys-status` | 1 |
| `privateGetOpenapiWalletV1ConfigGetall` | GET | `openapi/wallet/v1/config/getall` | 10 |
| `privateGetOpenapiWalletV1DepositAddress` | GET | `openapi/wallet/v1/deposit/address` | 10 |
| `privateGetOpenapiWalletV1DepositHistory` | GET | `openapi/wallet/v1/deposit/history` | 1 |
| `privateGetOpenapiWalletV1WithdrawHistory` | GET | `openapi/wallet/v1/withdraw/history` | 1 |
| `privateGetOpenapiWalletV1WithdrawAddressWhitelist` | GET | `openapi/wallet/v1/withdraw/address-whitelist` | 1 |
| `privateGetOpenapiV1Account` | GET | `openapi/v1/account` | 10 |
| `privateGetOpenapiV1ApiKeys` | GET | `openapi/v1/api-keys` | 1 |
| `privateGetOpenapiV1OpenOrders` | GET | `openapi/v1/openOrders` | 3 |
| `privateGetOpenapiV1AssetTradeFee` | GET | `openapi/v1/asset/tradeFee` | 1 |
| `privateGetOpenapiV1Order` | GET | `openapi/v1/order` | 2 |
| `privateGetOpenapiV1HistoryOrders` | GET | `openapi/v1/historyOrders` | 10 |
| `privateGetOpenapiV1MyTrades` | GET | `openapi/v1/myTrades` | 10 |
| `privateGetOpenapiV1CapitalDepositHistory` | GET | `openapi/v1/capital/deposit/history` | 1 |
| `privateGetOpenapiV1CapitalWithdrawHistory` | GET | `openapi/v1/capital/withdraw/history` | 1 |
| `privateGetOpenapiV3PaymentRequestGetPaymentRequest` | GET | `openapi/v3/payment-request/get-payment-request` | 1 |
| `privateGetMerchantApiV1GetInvoices` | GET | `merchant-api/v1/get-invoices` | 1 |
| `privateGetOpenapiAccountV3CryptoAccounts` | GET | `openapi/account/v3/crypto-accounts` | 1 |
| `privateGetOpenapiTransferV3TransfersId` | GET | `openapi/transfer/v3/transfers/{id}` | 1 |
| `privateGetOpenapiV1SubAccountList` | GET | `openapi/v1/sub-account/list` | 10 |
| `privateGetOpenapiV1SubAccountAsset` | GET | `openapi/v1/sub-account/asset` | 10 |
| `privateGetOpenapiV1SubAccountTransferUniversalTransferHistory` | GET | `openapi/v1/sub-account/transfer/universal-transfer-history` | 10 |
| `privateGetOpenapiV1SubAccountTransferSubHistory` | GET | `openapi/v1/sub-account/transfer/sub-history` | 10 |
| `privateGetOpenapiV1SubAccountApikeyIpRestriction` | GET | `openapi/v1/sub-account/apikey/ip-restriction` | 10 |
| `privateGetOpenapiV1SubAccountWalletDepositAddress` | GET | `openapi/v1/sub-account/wallet/deposit/address` | 1 |
| `privateGetOpenapiV1SubAccountWalletDepositHistory` | GET | `openapi/v1/sub-account/wallet/deposit/history` | 1 |
| `privateGetOpenapiV1FundCollectGetFundRecord` | GET | `openapi/v1/fund-collect/get-fund-record` | 1 |
| `privateGetOpenapiV1AssetTransactionHistory` | GET | `openapi/v1/asset/transaction/history` | 20 |
| `privatePostOpenapiWalletV1WithdrawApply` | POST | `openapi/wallet/v1/withdraw/apply` | 600 |
| `privatePostOpenapiV1OrderTest` | POST | `openapi/v1/order/test` | 1 |
| `privatePostOpenapiV1Order` | POST | `openapi/v1/order` | 1 |
| `privatePostOpenapiV1OrderCancelReplace` | POST | `openapi/v1/order/cancelReplace` | 1 |
| `privatePostOpenapiV1CapitalWithdrawApply` | POST | `openapi/v1/capital/withdraw/apply` | 1 |
| `privatePostOpenapiV1CapitalDepositApply` | POST | `openapi/v1/capital/deposit/apply` | 1 |
| `privatePostOpenapiV3PaymentRequestPaymentRequests` | POST | `openapi/v3/payment-request/payment-requests` | 1 |
| `privatePostOpenapiV3PaymentRequestDeletePaymentRequest` | POST | `openapi/v3/payment-request/delete-payment-request` | 1 |
| `privatePostOpenapiV3PaymentRequestPaymentRequestReminder` | POST | `openapi/v3/payment-request/payment-request-reminder` | 1 |
| `privatePostOpenapiV1UserDataStream` | POST | `openapi/v1/userDataStream` | 1 |
| `privatePostMerchantApiV1Invoices` | POST | `merchant-api/v1/invoices` | 1 |
| `privatePostMerchantApiV1InvoicesCancel` | POST | `merchant-api/v1/invoices-cancel` | 1 |
| `privatePostOpenapiConvertV1GetSupportedTradingPairs` | POST | `openapi/convert/v1/get-supported-trading-pairs` | 1 |
| `privatePostOpenapiConvertV1GetQuote` | POST | `openapi/convert/v1/get-quote` | 1 |
| `privatePostOpenapiConvertV1AcceptQuote` | POST | `openapi/convert/v1/accept-quote` | 1 |
| `privatePostOpenapiConvertV1QueryOrderHistory` | POST | `openapi/convert/v1/query-order-history` | 1 |
| `privatePostOpenapiOtcTradeV1GetSupportedTradingPairs` | POST | `openapi/otc-trade/v1/get-supported-trading-pairs` | 1 |
| `privatePostOpenapiOtcTradeV1CreateRfq` | POST | `openapi/otc-trade/v1/create-rfq` | 1 |
| `privatePostOpenapiOtcTradeV1AcceptRfq` | POST | `openapi/otc-trade/v1/accept-rfq` | 1 |
| `privatePostOpenapiOtcTradeV1ManualSettle` | POST | `openapi/otc-trade/v1/manual-settle` | 1 |
| `privatePostOpenapiOtcTradeV1QueryOrderHistory` | POST | `openapi/otc-trade/v1/query-order-history` | 1 |
| `privatePostOpenapiFiatV1SupportChannel` | POST | `openapi/fiat/v1/support-channel` | 1 |
| `privatePostOpenapiFiatV1CashOut` | POST | `openapi/fiat/v1/cash-out` | 1 |
| `privatePostOpenapiFiatV1History` | POST | `openapi/fiat/v1/history` | 1 |
| `privatePostOpenapiMigrationV4Sellorder` | POST | `openapi/migration/v4/sellorder` | 1 |
| `privatePostOpenapiMigrationV4ValidateField` | POST | `openapi/migration/v4/validate-field` | 1 |
| `privatePostOpenapiTransferV3Transfers` | POST | `openapi/transfer/v3/transfers` | 1 |
| `privatePostOpenapiTransferV4Transfers` | POST | `openapi/transfer/v4/transfers` | 1 |
| `privatePostOpenapiV1SubAccountCreate` | POST | `openapi/v1/sub-account/create` | 30 |
| `privatePostOpenapiV1SubAccountTransferUniversalTransfer` | POST | `openapi/v1/sub-account/transfer/universal-transfer` | 100 |
| `privatePostOpenapiV1SubAccountTransferSubToMaster` | POST | `openapi/v1/sub-account/transfer/sub-to-master` | 100 |
| `privatePostOpenapiV1SubAccountApikeyAddIpRestriction` | POST | `openapi/v1/sub-account/apikey/add-ip-restriction` | 30 |
| `privatePostOpenapiV1SubAccountApikeyDeleteIpRestriction` | POST | `openapi/v1/sub-account/apikey/delete-ip-restriction` | 30 |
| `privatePostOpenapiV1FundCollectCollectFromSubAccount` | POST | `openapi/v1/fund-collect/collect-from-sub-account` | 1 |
| `privatePutOpenapiV1UserDataStream` | PUT | `openapi/v1/userDataStream` | 1 |
| `privateDeleteOpenapiV1Order` | DELETE | `openapi/v1/order` | 1 |
| `privateDeleteOpenapiV1OpenOrders` | DELETE | `openapi/v1/openOrders` | 1 |
| `privateDeleteOpenapiV1UserDataStream` | DELETE | `openapi/v1/userDataStream` | 1 |

