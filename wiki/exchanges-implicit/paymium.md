Every endpoint in `paymium`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/paymium) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetCountries`); the snake_case alias (`public_get_countries`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetCountries`). Switch tabs for the call in each language:

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
| `publicGetCountries` | GET | `countries` |  |
| `publicGetCurrencies` | GET | `currencies` |  |
| `publicGetDataCurrencyTicker` | GET | `data/{currency}/ticker` |  |
| `publicGetDataCurrencyTrades` | GET | `data/{currency}/trades` |  |
| `publicGetDataCurrencyDepth` | GET | `data/{currency}/depth` |  |
| `publicGetBitcoinChartsIdTrades` | GET | `bitcoin_charts/{id}/trades` |  |
| `publicGetBitcoinChartsIdDepth` | GET | `bitcoin_charts/{id}/depth` |  |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetUser` | GET | `user` |  |
| `privateGetUserAddresses` | GET | `user/addresses` |  |
| `privateGetUserAddressesAddress` | GET | `user/addresses/{address}` |  |
| `privateGetUserOrders` | GET | `user/orders` |  |
| `privateGetUserOrdersUuid` | GET | `user/orders/{uuid}` |  |
| `privateGetUserPriceAlerts` | GET | `user/price_alerts` |  |
| `privateGetMerchantGetPaymentUuid` | GET | `merchant/get_payment/{uuid}` |  |
| `privatePostUserAddresses` | POST | `user/addresses` |  |
| `privatePostUserOrders` | POST | `user/orders` |  |
| `privatePostUserWithdrawals` | POST | `user/withdrawals` |  |
| `privatePostUserEmailTransfers` | POST | `user/email_transfers` |  |
| `privatePostUserPaymentRequests` | POST | `user/payment_requests` |  |
| `privatePostUserPriceAlerts` | POST | `user/price_alerts` |  |
| `privatePostMerchantCreatePayment` | POST | `merchant/create_payment` |  |
| `privateDeleteUserOrdersUuid` | DELETE | `user/orders/{uuid}` |  |
| `privateDeleteUserOrdersUuidCancel` | DELETE | `user/orders/{uuid}/cancel` |  |
| `privateDeleteUserPriceAlertsId` | DELETE | `user/price_alerts/{id}` |  |

