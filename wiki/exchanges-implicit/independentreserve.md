Every endpoint in `independentreserve`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/independentreserve) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetGetValidPrimaryCurrencyCodes`); the snake_case alias (`public_get_getvalidprimarycurrencycodes`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetGetValidPrimaryCurrencyCodes`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const independentreserve = new ccxt.independentreserve ();
const response = await independentreserve.publicGetGetValidPrimaryCurrencyCodes (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const independentreserve = new ccxt.independentreserve ();
const response = await independentreserve.publicGetGetValidPrimaryCurrencyCodes (params);
```

#### **Python**

```python
import ccxt
independentreserve = ccxt.independentreserve()
response = independentreserve.public_get_getvalidprimarycurrencycodes(params)
```

#### **PHP**

```php
$independentreserve = new \ccxt\independentreserve();
$response = $independentreserve->public_get_getvalidprimarycurrencycodes($params);
```

#### **C#**

```csharp
using ccxt;
var independentreserve = new Independentreserve();
var response = await independentreserve.publicGetGetValidPrimaryCurrencyCodes(parameters);
```

#### **Go**

```go
independentreserve := ccxt.NewIndependentreserve(nil)
response := <-independentreserve.PublicGetGetValidPrimaryCurrencyCodes(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official independentreserve API documentation:** [independentreserve.com](https://www.independentreserve.com/API)

> 39 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.independentreserve.com/Public`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetGetValidPrimaryCurrencyCodes` | GET | `GetValidPrimaryCurrencyCodes` | 1 |
| `publicGetGetValidSecondaryCurrencyCodes` | GET | `GetValidSecondaryCurrencyCodes` | 1 |
| `publicGetGetValidLimitOrderTypes` | GET | `GetValidLimitOrderTypes` | 1 |
| `publicGetGetValidMarketOrderTypes` | GET | `GetValidMarketOrderTypes` | 1 |
| `publicGetGetValidOrderTypes` | GET | `GetValidOrderTypes` | 1 |
| `publicGetGetValidTransactionTypes` | GET | `GetValidTransactionTypes` | 1 |
| `publicGetGetMarketSummary` | GET | `GetMarketSummary` | 1 |
| `publicGetGetOrderBook` | GET | `GetOrderBook` | 1 |
| `publicGetGetAllOrders` | GET | `GetAllOrders` | 1 |
| `publicGetGetTradeHistorySummary` | GET | `GetTradeHistorySummary` | 1 |
| `publicGetGetRecentTrades` | GET | `GetRecentTrades` | 1 |
| `publicGetGetFxRates` | GET | `GetFxRates` | 1 |
| `publicGetGetOrderMinimumVolumes` | GET | `GetOrderMinimumVolumes` | 1 |
| `publicGetGetCryptoWithdrawalFees` | GET | `GetCryptoWithdrawalFees` | 1 |
| `publicGetGetCryptoWithdrawalFees2` | GET | `GetCryptoWithdrawalFees2` | 1 |
| `publicGetGetNetworks` | GET | `GetNetworks` | 1 |
| `publicGetGetPrimaryCurrencyConfig2` | GET | `GetPrimaryCurrencyConfig2` | 1 |

## private

**Base URL**: `https://api.independentreserve.com/Private`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostGetOpenOrders` | POST | `GetOpenOrders` | 1 |
| `privatePostGetClosedOrders` | POST | `GetClosedOrders` | 1 |
| `privatePostGetClosedFilledOrders` | POST | `GetClosedFilledOrders` | 1 |
| `privatePostGetOrderDetails` | POST | `GetOrderDetails` | 1 |
| `privatePostGetAccounts` | POST | `GetAccounts` | 1 |
| `privatePostGetTransactions` | POST | `GetTransactions` | 1 |
| `privatePostGetFiatBankAccounts` | POST | `GetFiatBankAccounts` | 1 |
| `privatePostGetDigitalCurrencyDepositAddress` | POST | `GetDigitalCurrencyDepositAddress` | 1 |
| `privatePostGetDigitalCurrencyDepositAddress2` | POST | `GetDigitalCurrencyDepositAddress2` | 1 |
| `privatePostGetDigitalCurrencyDepositAddresses` | POST | `GetDigitalCurrencyDepositAddresses` | 1 |
| `privatePostGetDigitalCurrencyDepositAddresses2` | POST | `GetDigitalCurrencyDepositAddresses2` | 1 |
| `privatePostGetTrades` | POST | `GetTrades` | 1 |
| `privatePostGetBrokerageFees` | POST | `GetBrokerageFees` | 1 |
| `privatePostGetDigitalCurrencyWithdrawal` | POST | `GetDigitalCurrencyWithdrawal` | 1 |
| `privatePostPlaceLimitOrder` | POST | `PlaceLimitOrder` | 1 |
| `privatePostPlaceMarketOrder` | POST | `PlaceMarketOrder` | 1 |
| `privatePostCancelOrder` | POST | `CancelOrder` | 1 |
| `privatePostSynchDigitalCurrencyDepositAddressWithBlockchain` | POST | `SynchDigitalCurrencyDepositAddressWithBlockchain` | 1 |
| `privatePostRequestFiatWithdrawal` | POST | `RequestFiatWithdrawal` | 1 |
| `privatePostWithdrawFiatCurrency` | POST | `WithdrawFiatCurrency` | 1 |
| `privatePostWithdrawDigitalCurrency` | POST | `WithdrawDigitalCurrency` | 1 |
| `privatePostWithdrawCrypto` | POST | `WithdrawCrypto` | 1 |

