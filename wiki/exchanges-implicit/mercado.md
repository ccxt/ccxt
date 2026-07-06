Every endpoint in `mercado`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/mercado) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetCoins`); the snake_case alias (`public_get_coins`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetCoins`). Switch tabs for the call in each language:

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
| `publicGetCoins` | GET | `coins` |  |
| `publicGetCoinOrderbook` | GET | `{coin}/orderbook/` |  |
| `publicGetCoinTicker` | GET | `{coin}/ticker/` |  |
| `publicGetCoinTrades` | GET | `{coin}/trades/` |  |
| `publicGetCoinTradesFrom` | GET | `{coin}/trades/{from}/` |  |
| `publicGetCoinTradesFromTo` | GET | `{coin}/trades/{from}/{to}` |  |
| `publicGetCoinDaySummaryYearMonthDay` | GET | `{coin}/day-summary/{year}/{month}/{day}/` |  |

## private

**Base URL**: `https://www.mercadobitcoin.net/tapi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostCancelOrder` | POST | `cancel_order` |  |
| `privatePostGetAccountInfo` | POST | `get_account_info` |  |
| `privatePostGetOrder` | POST | `get_order` |  |
| `privatePostGetWithdrawal` | POST | `get_withdrawal` |  |
| `privatePostListSystemMessages` | POST | `list_system_messages` |  |
| `privatePostListOrders` | POST | `list_orders` |  |
| `privatePostListOrderbook` | POST | `list_orderbook` |  |
| `privatePostPlaceBuyOrder` | POST | `place_buy_order` |  |
| `privatePostPlaceSellOrder` | POST | `place_sell_order` |  |
| `privatePostPlaceMarketBuyOrder` | POST | `place_market_buy_order` |  |
| `privatePostPlaceMarketSellOrder` | POST | `place_market_sell_order` |  |
| `privatePostWithdrawCoin` | POST | `withdraw_coin` |  |

## v4Public

**Base URL**: `https://www.mercadobitcoin.com.br/v4`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v4PublicGetCoinCandle` | GET | `{coin}/candle/` |  |

## v4PublicNet

**Base URL**: `https://api.mercadobitcoin.net/api/v4`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v4PublicNetGetCandles` | GET | `candles` |  |

