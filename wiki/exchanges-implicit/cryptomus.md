Every endpoint in `cryptomus`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/cryptomus) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetV2UserApiExchangeMarkets`); the snake_case alias (`public_get_v2_user_api_exchange_markets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetV2UserApiExchangeMarkets`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const cryptomus = new ccxt.cryptomus ();
const response = await cryptomus.publicGetV2UserApiExchangeMarkets (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const cryptomus = new ccxt.cryptomus ();
const response = await cryptomus.publicGetV2UserApiExchangeMarkets (params);
```

#### **Python**

```python
import ccxt
cryptomus = ccxt.cryptomus()
response = cryptomus.public_get_v2_user_api_exchange_markets(params)
```

#### **PHP**

```php
$cryptomus = new \ccxt\cryptomus();
$response = $cryptomus->public_get_v2_user_api_exchange_markets($params);
```

#### **C#**

```csharp
using ccxt;
var cryptomus = new Cryptomus();
var response = await cryptomus.publicGetV2UserApiExchangeMarkets(parameters);
```

#### **Go**

```go
cryptomus := ccxt.NewCryptomus(nil)
response := <-cryptomus.PublicGetV2UserApiExchangeMarkets(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official cryptomus API documentation:** [doc.cryptomus.com](https://doc.cryptomus.com/personal)

> 31 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.cryptomus.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetV2UserApiExchangeMarkets` | GET | `v2/user-api/exchange/markets` | 1 |
| `publicGetV2UserApiExchangeMarketPrice` | GET | `v2/user-api/exchange/market/price` | 1 |
| `publicGetV2UserApiExchangeMarketsPrice` | GET | `v2/user-api/exchange/markets/price` | 1 |
| `publicGetV1ExchangeMarketAssets` | GET | `v1/exchange/market/assets` | 1 |
| `publicGetV1ExchangeMarketOrderBookCurrencyPair` | GET | `v1/exchange/market/order-book/{currencyPair}` | 1 |
| `publicGetV1ExchangeMarketTickers` | GET | `v1/exchange/market/tickers` | 1 |
| `publicGetV1ExchangeMarketTradesCurrencyPair` | GET | `v1/exchange/market/trades/{currencyPair}` | 1 |

## private

**Base URL**: `https://api.cryptomus.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetV2UserApiExchangeOrders` | GET | `v2/user-api/exchange/orders` | 1 |
| `privateGetV2UserApiExchangeOrdersHistory` | GET | `v2/user-api/exchange/orders/history` | 1 |
| `privateGetV2UserApiExchangeAccountBalance` | GET | `v2/user-api/exchange/account/balance` | 1 |
| `privateGetV2UserApiExchangeAccountTariffs` | GET | `v2/user-api/exchange/account/tariffs` | 1 |
| `privateGetV2UserApiPaymentServices` | GET | `v2/user-api/payment/services` | 1 |
| `privateGetV2UserApiPayoutServices` | GET | `v2/user-api/payout/services` | 1 |
| `privateGetV2UserApiTransactionList` | GET | `v2/user-api/transaction/list` | 1 |
| `privateGetV2UserApiBalance` | GET | `v2/user-api/balance` | 1 |
| `privateGetV2UserApiConvertDirectionList` | GET | `v2/user-api/convert/direction-list` | 1 |
| `privateGetV2UserApiConvertOrderList` | GET | `v2/user-api/convert/order-list` | 1 |
| `privateGetV2UserApiAmlCheckBalance` | GET | `v2/user-api/aml/check/balance` | 1 |
| `privateGetV2UserApiAmlCheckCurrencies` | GET | `v2/user-api/aml/check/currencies` | 1 |
| `privateGetV2UserApiAmlCheckPackages` | GET | `v2/user-api/aml/check/packages` | 1 |
| `privateGetV2UserApiAmlCheckRequest` | GET | `v2/user-api/aml/check/request` | 1 |
| `privateGetV2UserApiAmlCheckRequestId` | GET | `v2/user-api/aml/check/request/{id}` | 1 |
| `privatePostV2UserApiExchangeOrders` | POST | `v2/user-api/exchange/orders` | 1 |
| `privatePostV2UserApiExchangeOrdersMarket` | POST | `v2/user-api/exchange/orders/market` | 1 |
| `privatePostV2UserApiConvert` | POST | `v2/user-api/convert` | 1 |
| `privatePostV2UserApiConvertCalculate` | POST | `v2/user-api/convert/calculate` | 1 |
| `privatePostV2UserApiConvertLimit` | POST | `v2/user-api/convert/limit` | 1 |
| `privatePostV2UserApiAmlCheckRequest` | POST | `v2/user-api/aml/check/request` | 1 |
| `privatePostV2UserApiAmlCheckRequestIdReportSend` | POST | `v2/user-api/aml/check/request/{id}/report/send` | 1 |
| `privateDeleteV2UserApiExchangeOrdersOrderId` | DELETE | `v2/user-api/exchange/orders/{orderId}` | 1 |
| `privateDeleteV2UserApiConvertOrderUuid` | DELETE | `v2/user-api/convert/{orderUuid}` | 1 |

