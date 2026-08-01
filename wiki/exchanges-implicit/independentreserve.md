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
| `publicGetGetValidPrimaryCurrencyCodes` | GET | `GetValidPrimaryCurrencyCodes` |  |
| `publicGetGetValidSecondaryCurrencyCodes` | GET | `GetValidSecondaryCurrencyCodes` |  |
| `publicGetGetValidLimitOrderTypes` | GET | `GetValidLimitOrderTypes` |  |
| `publicGetGetValidMarketOrderTypes` | GET | `GetValidMarketOrderTypes` |  |
| `publicGetGetValidOrderTypes` | GET | `GetValidOrderTypes` |  |
| `publicGetGetValidTransactionTypes` | GET | `GetValidTransactionTypes` |  |
| `publicGetGetMarketSummary` | GET | `GetMarketSummary` |  |
| `publicGetGetOrderBook` | GET | `GetOrderBook` |  |
| `publicGetGetAllOrders` | GET | `GetAllOrders` |  |
| `publicGetGetTradeHistorySummary` | GET | `GetTradeHistorySummary` |  |
| `publicGetGetRecentTrades` | GET | `GetRecentTrades` |  |
| `publicGetGetFxRates` | GET | `GetFxRates` |  |
| `publicGetGetOrderMinimumVolumes` | GET | `GetOrderMinimumVolumes` |  |
| `publicGetGetCryptoWithdrawalFees` | GET | `GetCryptoWithdrawalFees` |  |
| `publicGetGetCryptoWithdrawalFees2` | GET | `GetCryptoWithdrawalFees2` |  |
| `publicGetGetNetworks` | GET | `GetNetworks` |  |
| `publicGetGetPrimaryCurrencyConfig2` | GET | `GetPrimaryCurrencyConfig2` |  |

## private

**Base URL**: `https://api.independentreserve.com/Private`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostGetOpenOrders` | POST | `GetOpenOrders` |  |
| `privatePostGetClosedOrders` | POST | `GetClosedOrders` |  |
| `privatePostGetClosedFilledOrders` | POST | `GetClosedFilledOrders` |  |
| `privatePostGetOrderDetails` | POST | `GetOrderDetails` |  |
| `privatePostGetAccounts` | POST | `GetAccounts` |  |
| `privatePostGetTransactions` | POST | `GetTransactions` |  |
| `privatePostGetFiatBankAccounts` | POST | `GetFiatBankAccounts` |  |
| `privatePostGetDigitalCurrencyDepositAddress` | POST | `GetDigitalCurrencyDepositAddress` |  |
| `privatePostGetDigitalCurrencyDepositAddress2` | POST | `GetDigitalCurrencyDepositAddress2` |  |
| `privatePostGetDigitalCurrencyDepositAddresses` | POST | `GetDigitalCurrencyDepositAddresses` |  |
| `privatePostGetDigitalCurrencyDepositAddresses2` | POST | `GetDigitalCurrencyDepositAddresses2` |  |
| `privatePostGetTrades` | POST | `GetTrades` |  |
| `privatePostGetBrokerageFees` | POST | `GetBrokerageFees` |  |
| `privatePostGetDigitalCurrencyWithdrawal` | POST | `GetDigitalCurrencyWithdrawal` |  |
| `privatePostPlaceLimitOrder` | POST | `PlaceLimitOrder` |  |
| `privatePostPlaceMarketOrder` | POST | `PlaceMarketOrder` |  |
| `privatePostCancelOrder` | POST | `CancelOrder` |  |
| `privatePostSynchDigitalCurrencyDepositAddressWithBlockchain` | POST | `SynchDigitalCurrencyDepositAddressWithBlockchain` |  |
| `privatePostRequestFiatWithdrawal` | POST | `RequestFiatWithdrawal` |  |
| `privatePostWithdrawFiatCurrency` | POST | `WithdrawFiatCurrency` |  |
| `privatePostWithdrawDigitalCurrency` | POST | `WithdrawDigitalCurrency` |  |
| `privatePostWithdrawCrypto` | POST | `WithdrawCrypto` |  |

