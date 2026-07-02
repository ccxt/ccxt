Every endpoint in `coinmetro`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/coinmetro) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetDemoTemp`); the snake_case alias (`public_get_demo_temp`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetDemoTemp`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const coinmetro = new ccxt.coinmetro ();
const response = await coinmetro.publicGetDemoTemp (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const coinmetro = new ccxt.coinmetro ();
const response = await coinmetro.publicGetDemoTemp (params);
```

#### **Python**

```python
import ccxt
coinmetro = ccxt.coinmetro()
response = coinmetro.public_get_demo_temp(params)
```

#### **PHP**

```php
$coinmetro = new \ccxt\coinmetro();
$response = $coinmetro->public_get_demo_temp($params);
```

#### **C#**

```csharp
using ccxt;
var coinmetro = new Coinmetro();
var response = await coinmetro.publicGetDemoTemp(parameters);
```

#### **Go**

```go
coinmetro := ccxt.NewCoinmetro(nil)
response := <-coinmetro.PublicGetDemoTemp(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official coinmetro API documentation:** [documenter.getpostman.com](https://documenter.getpostman.com/view/3653795/SVfWN6KS)

> 30 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.coinmetro.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetDemoTemp` | GET | `demo/temp` | 1 |
| `publicGetExchangeCandlesPairTimeframeFromTo` | GET | `exchange/candles/{pair}/{timeframe}/{from}/{to}` | 3 |
| `publicGetExchangePrices` | GET | `exchange/prices` | 1 |
| `publicGetExchangeTicksPairFrom` | GET | `exchange/ticks/{pair}/{from}` | 3 |
| `publicGetAssets` | GET | `assets` | 1 |
| `publicGetMarkets` | GET | `markets` | 1 |
| `publicGetExchangeBookPair` | GET | `exchange/book/{pair}` | 3 |
| `publicGetExchangeBookUpdatesPairFrom` | GET | `exchange/bookUpdates/{pair}/{from}` | 1 |

## private

**Base URL**: `https://api.coinmetro.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetUsersBalances` | GET | `users/balances` | 1 |
| `privateGetUsersWallets` | GET | `users/wallets` | 1 |
| `privateGetUsersWalletsHistorySince` | GET | `users/wallets/history/{since}` | 1.67 |
| `privateGetExchangeOrdersStatusOrderID` | GET | `exchange/orders/status/{orderID}` | 1 |
| `privateGetExchangeOrdersActive` | GET | `exchange/orders/active` | 1 |
| `privateGetExchangeOrdersHistorySince` | GET | `exchange/orders/history/{since}` | 1.67 |
| `privateGetExchangeFillsSince` | GET | `exchange/fills/{since}` | 1.67 |
| `privateGetExchangeMargin` | GET | `exchange/margin` | 1 |
| `privatePostJwt` | POST | `jwt` | 1 |
| `privatePostJwtDevice` | POST | `jwtDevice` | 1 |
| `privatePostDevices` | POST | `devices` | 1 |
| `privatePostJwtReadOnly` | POST | `jwt-read-only` | 1 |
| `privatePostExchangeOrdersCreate` | POST | `exchange/orders/create` | 1 |
| `privatePostExchangeOrdersModifyOrderID` | POST | `exchange/orders/modify/{orderID}` | 1 |
| `privatePostExchangeSwap` | POST | `exchange/swap` | 1 |
| `privatePostExchangeSwapConfirmSwapId` | POST | `exchange/swap/confirm/{swapId}` | 1 |
| `privatePostExchangeOrdersCloseOrderID` | POST | `exchange/orders/close/{orderID}` | 1 |
| `privatePostExchangeOrdersHedge` | POST | `exchange/orders/hedge` | 1 |
| `privatePutJwt` | PUT | `jwt` | 1 |
| `privatePutExchangeOrdersCancelOrderID` | PUT | `exchange/orders/cancel/{orderID}` | 1 |
| `privatePutUsersMarginCollateral` | PUT | `users/margin/collateral` | 1 |
| `privatePutUsersMarginPrimaryCurrency` | PUT | `users/margin/primary/{currency}` | 1 |

