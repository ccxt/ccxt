Every endpoint in `mercado`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/mercado) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetCoins`); the snake_case alias (`public_get_coins`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetCoins`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const mercado = new ccxt.mercado ();
const response = await mercado.publicGetCoins (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const mercado = new ccxt.mercado ();
const response = await mercado.publicGetCoins (params);
```

#### **Python**

```python
import ccxt
mercado = ccxt.mercado()
response = mercado.public_get_coins(params)
```

#### **PHP**

```php
$mercado = new \ccxt\mercado();
$response = $mercado->public_get_coins($params);
```

#### **C#**

```csharp
using ccxt;
var mercado = new Mercado();
var response = await mercado.publicGetCoins(parameters);
```

#### **Go**

```go
mercado := ccxt.NewMercado(nil)
response := <-mercado.PublicGetCoins(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official mercado API documentation:** [mercadobitcoin.com.br](https://www.mercadobitcoin.com.br/api-doc) · [mercadobitcoin.com.br](https://www.mercadobitcoin.com.br/trade-api)

> 21 implicit endpoints across 4 access groups.

## public

**Base URL**: `https://www.mercadobitcoin.net/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetCoins` | GET | `coins` | 1 |
| `publicGetCoinOrderbook` | GET | `{coin}/orderbook/` | 1 |
| `publicGetCoinTicker` | GET | `{coin}/ticker/` | 1 |
| `publicGetCoinTrades` | GET | `{coin}/trades/` | 1 |
| `publicGetCoinTradesFrom` | GET | `{coin}/trades/{from}/` | 1 |
| `publicGetCoinTradesFromTo` | GET | `{coin}/trades/{from}/{to}` | 1 |
| `publicGetCoinDaySummaryYearMonthDay` | GET | `{coin}/day-summary/{year}/{month}/{day}/` | 1 |

## private

**Base URL**: `https://www.mercadobitcoin.net/tapi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostCancelOrder` | POST | `cancel_order` | 1 |
| `privatePostGetAccountInfo` | POST | `get_account_info` | 1 |
| `privatePostGetOrder` | POST | `get_order` | 1 |
| `privatePostGetWithdrawal` | POST | `get_withdrawal` | 1 |
| `privatePostListSystemMessages` | POST | `list_system_messages` | 1 |
| `privatePostListOrders` | POST | `list_orders` | 1 |
| `privatePostListOrderbook` | POST | `list_orderbook` | 1 |
| `privatePostPlaceBuyOrder` | POST | `place_buy_order` | 1 |
| `privatePostPlaceSellOrder` | POST | `place_sell_order` | 1 |
| `privatePostPlaceMarketBuyOrder` | POST | `place_market_buy_order` | 1 |
| `privatePostPlaceMarketSellOrder` | POST | `place_market_sell_order` | 1 |
| `privatePostWithdrawCoin` | POST | `withdraw_coin` | 1 |

## v4Public

**Base URL**: `https://www.mercadobitcoin.com.br/v4`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v4PublicGetCoinCandle` | GET | `{coin}/candle/` | 1 |

## v4PublicNet

**Base URL**: `https://api.mercadobitcoin.net/api/v4`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v4PublicNetGetCandles` | GET | `candles` | 1 |

