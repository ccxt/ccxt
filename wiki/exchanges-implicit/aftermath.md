Every endpoint in `aftermath`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/aftermath) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetMarkets`); the snake_case alias (`public_get_markets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetMarkets`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const aftermath = new ccxt.aftermath ();
const response = await aftermath.publicGetMarkets (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const aftermath = new ccxt.aftermath ();
const response = await aftermath.publicGetMarkets (params);
```

#### **Python**

```python
import ccxt
aftermath = ccxt.aftermath()
response = aftermath.public_get_markets(params)
```

#### **PHP**

```php
$aftermath = new \ccxt\aftermath();
$response = $aftermath->public_get_markets($params);
```

#### **C#**

```csharp
using ccxt;
var aftermath = new Aftermath();
var response = await aftermath.publicGetMarkets(parameters);
```

#### **Go**

```go
aftermath := ccxt.NewAftermath(nil)
response := <-aftermath.PublicGetMarkets(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official aftermath API documentation:** [aftermath.finance](https://aftermath.finance)

> 26 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetMarkets` | GET | `markets` | 1 |
| `publicGetCurrencies` | GET | `currencies` | 1 |
| `publicPostTicker` | POST | `ticker` | 1 |
| `publicPostOrderbook` | POST | `orderbook` | 1 |
| `publicPostTrades` | POST | `trades` | 1 |
| `publicPostOHLCV` | POST | `OHLCV` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostAccounts` | POST | `accounts` | 1 |
| `privatePostBalance` | POST | `balance` | 1 |
| `privatePostMyPendingOrders` | POST | `myPendingOrders` | 1 |
| `privatePostPositions` | POST | `positions` | 1 |
| `privatePostBuildAllocate` | POST | `build/allocate` | 1 |
| `privatePostBuildCancelOrders` | POST | `build/cancelOrders` | 1 |
| `privatePostBuildCreateAccount` | POST | `build/createAccount` | 1 |
| `privatePostBuildCreateOrders` | POST | `build/createOrders` | 1 |
| `privatePostBuildDeallocate` | POST | `build/deallocate` | 1 |
| `privatePostBuildDeposit` | POST | `build/deposit` | 1 |
| `privatePostBuildSetLeverage` | POST | `build/setLeverage` | 1 |
| `privatePostBuildWithdraw` | POST | `build/withdraw` | 1 |
| `privatePostSubmitAllocate` | POST | `submit/allocate` | 1 |
| `privatePostSubmitCancelOrders` | POST | `submit/cancelOrders` | 1 |
| `privatePostSubmitCreateAccount` | POST | `submit/createAccount` | 1 |
| `privatePostSubmitCreateOrders` | POST | `submit/createOrders` | 1 |
| `privatePostSubmitDeallocate` | POST | `submit/deallocate` | 1 |
| `privatePostSubmitDeposit` | POST | `submit/deposit` | 1 |
| `privatePostSubmitSetLeverage` | POST | `submit/setLeverage` | 1 |
| `privatePostSubmitWithdraw` | POST | `submit/withdraw` | 1 |

