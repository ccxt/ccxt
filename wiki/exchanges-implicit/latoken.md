Every endpoint in `latoken`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/latoken) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetBookCurrencyQuote`); the snake_case alias (`public_get_book_currency_quote`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetBookCurrencyQuote`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const latoken = new ccxt.latoken ();
const response = await latoken.publicGetBookCurrencyQuote (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const latoken = new ccxt.latoken ();
const response = await latoken.publicGetBookCurrencyQuote (params);
```

#### **Python**

```python
import ccxt
latoken = ccxt.latoken()
response = latoken.public_get_book_currency_quote(params)
```

#### **PHP**

```php
$latoken = new \ccxt\latoken();
$response = $latoken->public_get_book_currency_quote($params);
```

#### **C#**

```csharp
using ccxt;
var latoken = new Latoken();
var response = await latoken.publicGetBookCurrencyQuote(parameters);
```

#### **Go**

```go
latoken := ccxt.NewLatoken(nil)
response := <-latoken.PublicGetBookCurrencyQuote(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official latoken API documentation:** [api.latoken.com](https://api.latoken.com)

> 52 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetBookCurrencyQuote` | GET | `book/{currency}/{quote}` | 1 |
| `publicGetChartWeek` | GET | `chart/week` | 1 |
| `publicGetChartWeekCurrencyQuote` | GET | `chart/week/{currency}/{quote}` | 1 |
| `publicGetCurrency` | GET | `currency` | 1 |
| `publicGetCurrencyAvailable` | GET | `currency/available` | 1 |
| `publicGetCurrencyQuotes` | GET | `currency/quotes` | 1 |
| `publicGetCurrencyCurrency` | GET | `currency/{currency}` | 1 |
| `publicGetPair` | GET | `pair` | 1 |
| `publicGetPairAvailable` | GET | `pair/available` | 1 |
| `publicGetTicker` | GET | `ticker` | 1 |
| `publicGetTickerBaseQuote` | GET | `ticker/{base}/{quote}` | 1 |
| `publicGetTime` | GET | `time` | 1 |
| `publicGetTradeHistoryCurrencyQuote` | GET | `trade/history/{currency}/{quote}` | 1 |
| `publicGetTradeFeeCurrencyQuote` | GET | `trade/fee/{currency}/{quote}` | 1 |
| `publicGetTradeFeeLevels` | GET | `trade/feeLevels` | 1 |
| `publicGetTransactionBindings` | GET | `transaction/bindings` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAuthAccount` | GET | `auth/account` | 1 |
| `privateGetAuthAccountCurrencyCurrencyType` | GET | `auth/account/currency/{currency}/{type}` | 1 |
| `privateGetAuthOrder` | GET | `auth/order` | 1 |
| `privateGetAuthOrderGetOrderId` | GET | `auth/order/getOrder/{id}` | 1 |
| `privateGetAuthOrderPairCurrencyQuote` | GET | `auth/order/pair/{currency}/{quote}` | 1 |
| `privateGetAuthOrderPairCurrencyQuoteActive` | GET | `auth/order/pair/{currency}/{quote}/active` | 1 |
| `privateGetAuthStopOrder` | GET | `auth/stopOrder` | 1 |
| `privateGetAuthStopOrderGetOrderId` | GET | `auth/stopOrder/getOrder/{id}` | 1 |
| `privateGetAuthStopOrderPairCurrencyQuote` | GET | `auth/stopOrder/pair/{currency}/{quote}` | 1 |
| `privateGetAuthStopOrderPairCurrencyQuoteActive` | GET | `auth/stopOrder/pair/{currency}/{quote}/active` | 1 |
| `privateGetAuthTrade` | GET | `auth/trade` | 1 |
| `privateGetAuthTradePairCurrencyQuote` | GET | `auth/trade/pair/{currency}/{quote}` | 1 |
| `privateGetAuthTradeFeeCurrencyQuote` | GET | `auth/trade/fee/{currency}/{quote}` | 1 |
| `privateGetAuthTransaction` | GET | `auth/transaction` | 1 |
| `privateGetAuthTransactionBindings` | GET | `auth/transaction/bindings` | 1 |
| `privateGetAuthTransactionBindingsCurrency` | GET | `auth/transaction/bindings/{currency}` | 1 |
| `privateGetAuthTransactionId` | GET | `auth/transaction/{id}` | 1 |
| `privateGetAuthTransfer` | GET | `auth/transfer` | 1 |
| `privatePostAuthOrderCancel` | POST | `auth/order/cancel` | 1 |
| `privatePostAuthOrderCancelAll` | POST | `auth/order/cancelAll` | 1 |
| `privatePostAuthOrderCancelAllCurrencyQuote` | POST | `auth/order/cancelAll/{currency}/{quote}` | 1 |
| `privatePostAuthOrderPlace` | POST | `auth/order/place` | 1 |
| `privatePostAuthSpotDeposit` | POST | `auth/spot/deposit` | 1 |
| `privatePostAuthSpotWithdraw` | POST | `auth/spot/withdraw` | 1 |
| `privatePostAuthStopOrderCancel` | POST | `auth/stopOrder/cancel` | 1 |
| `privatePostAuthStopOrderCancelAll` | POST | `auth/stopOrder/cancelAll` | 1 |
| `privatePostAuthStopOrderCancelAllCurrencyQuote` | POST | `auth/stopOrder/cancelAll/{currency}/{quote}` | 1 |
| `privatePostAuthStopOrderPlace` | POST | `auth/stopOrder/place` | 1 |
| `privatePostAuthTransactionDepositAddress` | POST | `auth/transaction/depositAddress` | 1 |
| `privatePostAuthTransactionWithdraw` | POST | `auth/transaction/withdraw` | 1 |
| `privatePostAuthTransactionWithdrawCancel` | POST | `auth/transaction/withdraw/cancel` | 1 |
| `privatePostAuthTransactionWithdrawConfirm` | POST | `auth/transaction/withdraw/confirm` | 1 |
| `privatePostAuthTransactionWithdrawResendCode` | POST | `auth/transaction/withdraw/resendCode` | 1 |
| `privatePostAuthTransferEmail` | POST | `auth/transfer/email` | 1 |
| `privatePostAuthTransferId` | POST | `auth/transfer/id` | 1 |
| `privatePostAuthTransferPhone` | POST | `auth/transfer/phone` | 1 |

