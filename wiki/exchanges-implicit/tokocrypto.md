Every endpoint in `tokocrypto`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/tokocrypto) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `binanceGetPing`); the snake_case alias (`binance_get_ping`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`BinanceGetPing`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const tokocrypto = new ccxt.tokocrypto ();
const response = await tokocrypto.binanceGetPing (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const tokocrypto = new ccxt.tokocrypto ();
const response = await tokocrypto.binanceGetPing (params);
```

#### **Python**

```python
import ccxt
tokocrypto = ccxt.tokocrypto()
response = tokocrypto.binance_get_ping(params)
```

#### **PHP**

```php
$tokocrypto = new \ccxt\tokocrypto();
$response = $tokocrypto->binance_get_ping($params);
```

#### **C#**

```csharp
using ccxt;
var tokocrypto = new Tokocrypto();
var response = await tokocrypto.binanceGetPing(parameters);
```

#### **Go**

```go
tokocrypto := ccxt.NewTokocrypto(nil)
response := <-tokocrypto.BinanceGetPing(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official tokocrypto API documentation:** [tokocrypto.com](https://www.tokocrypto.com/apidocs/)

> 33 implicit endpoints across 3 access groups.

## binance

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `binanceGetPing` | GET | `ping` | 1 |
| `binanceGetTime` | GET | `time` | 1 |
| `binanceGetDepth` | GET | `depth` | 1 |
| `binanceGetTrades` | GET | `trades` | 1 |
| `binanceGetAggTrades` | GET | `aggTrades` | 1 |
| `binanceGetHistoricalTrades` | GET | `historicalTrades` | 5 |
| `binanceGetKlines` | GET | `klines` | 1 |
| `binanceGetTicker24hr` | GET | `ticker/24hr` | 1 |
| `binanceGetTickerPrice` | GET | `ticker/price` | 1 |
| `binanceGetTickerBookTicker` | GET | `ticker/bookTicker` | 1 |
| `binanceGetExchangeInfo` | GET | `exchangeInfo` | 10 |
| `binancePutUserDataStream` | PUT | `userDataStream` | 1 |
| `binancePostUserDataStream` | POST | `userDataStream` | 1 |
| `binanceDeleteUserDataStream` | DELETE | `userDataStream` | 1 |

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetOpenV1CommonTime` | GET | `open/v1/common/time` | 1 |
| `publicGetOpenV1CommonSymbols` | GET | `open/v1/common/symbols` | 1 |
| `publicGetOpenV1MarketDepth` | GET | `open/v1/market/depth` | 1 |
| `publicGetOpenV1MarketTrades` | GET | `open/v1/market/trades` | 1 |
| `publicGetOpenV1MarketAggTrades` | GET | `open/v1/market/agg-trades` | 1 |
| `publicGetOpenV1MarketKlines` | GET | `open/v1/market/klines` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetOpenV1OrdersDetail` | GET | `open/v1/orders/detail` | 1 |
| `privateGetOpenV1Orders` | GET | `open/v1/orders` | 1 |
| `privateGetOpenV1AccountSpot` | GET | `open/v1/account/spot` | 1 |
| `privateGetOpenV1AccountSpotAsset` | GET | `open/v1/account/spot/asset` | 1 |
| `privateGetOpenV1OrdersTrades` | GET | `open/v1/orders/trades` | 1 |
| `privateGetOpenV1Withdraws` | GET | `open/v1/withdraws` | 1 |
| `privateGetOpenV1Deposits` | GET | `open/v1/deposits` | 1 |
| `privateGetOpenV1DepositsAddress` | GET | `open/v1/deposits/address` | 1 |
| `privatePostOpenV1Orders` | POST | `open/v1/orders` | 1 |
| `privatePostOpenV1OrdersCancel` | POST | `open/v1/orders/cancel` | 1 |
| `privatePostOpenV1OrdersOco` | POST | `open/v1/orders/oco` | 1 |
| `privatePostOpenV1Withdraws` | POST | `open/v1/withdraws` | 1 |
| `privatePostOpenV1UserDataStream` | POST | `open/v1/user-data-stream` | 1 |

