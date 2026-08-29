Every endpoint in `paymium`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/paymium) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetCountries`); the snake_case alias (`public_get_countries`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetCountries`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const paymium = new ccxt.paymium ();
const response = await paymium.publicGetCountries (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const paymium = new ccxt.paymium ();
const response = await paymium.publicGetCountries (params);
```

#### **Python**

```python
import ccxt
paymium = ccxt.paymium()
response = paymium.public_get_countries(params)
```

#### **PHP**

```php
$paymium = new \ccxt\paymium();
$response = $paymium->public_get_countries($params);
```

#### **C#**

```csharp
using ccxt;
var paymium = new Paymium();
var response = await paymium.publicGetCountries(parameters);
```

#### **Go**

```go
paymium := ccxt.NewPaymium(nil)
response := <-paymium.PublicGetCountries(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official paymium API documentation:** [github.com](https://github.com/Paymium/api-documentation) · [paymium.com](https://www.paymium.com/page/developers) · [paymium.github.io](https://paymium.github.io/api-documentation/)

> 24 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetCountries` | GET | `countries` | 1 |
| `publicGetCurrencies` | GET | `currencies` | 1 |
| `publicGetDataCurrencyTicker` | GET | `data/{currency}/ticker` | 1 |
| `publicGetDataCurrencyTrades` | GET | `data/{currency}/trades` | 1 |
| `publicGetDataCurrencyDepth` | GET | `data/{currency}/depth` | 1 |
| `publicGetBitcoinChartsIdTrades` | GET | `bitcoin_charts/{id}/trades` | 1 |
| `publicGetBitcoinChartsIdDepth` | GET | `bitcoin_charts/{id}/depth` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetUser` | GET | `user` | 1 |
| `privateGetUserAddresses` | GET | `user/addresses` | 1 |
| `privateGetUserAddressesAddress` | GET | `user/addresses/{address}` | 1 |
| `privateGetUserOrders` | GET | `user/orders` | 1 |
| `privateGetUserOrdersUuid` | GET | `user/orders/{uuid}` | 1 |
| `privateGetUserPriceAlerts` | GET | `user/price_alerts` | 1 |
| `privateGetMerchantGetPaymentUuid` | GET | `merchant/get_payment/{uuid}` | 1 |
| `privatePostUserAddresses` | POST | `user/addresses` | 1 |
| `privatePostUserOrders` | POST | `user/orders` | 1 |
| `privatePostUserWithdrawals` | POST | `user/withdrawals` | 1 |
| `privatePostUserEmailTransfers` | POST | `user/email_transfers` | 1 |
| `privatePostUserPaymentRequests` | POST | `user/payment_requests` | 1 |
| `privatePostUserPriceAlerts` | POST | `user/price_alerts` | 1 |
| `privatePostMerchantCreatePayment` | POST | `merchant/create_payment` | 1 |
| `privateDeleteUserOrdersUuid` | DELETE | `user/orders/{uuid}` | 1 |
| `privateDeleteUserOrdersUuidCancel` | DELETE | `user/orders/{uuid}/cancel` | 1 |
| `privateDeleteUserPriceAlertsId` | DELETE | `user/price_alerts/{id}` | 1 |

