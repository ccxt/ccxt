Every endpoint in `mudrex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/mudrex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `marketGetPriceKline`); the snake_case alias (`market_get_price_kline`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`MarketGetPriceKline`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const mudrex = new ccxt.mudrex ();
const response = await mudrex.marketGetPriceKline (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const mudrex = new ccxt.mudrex ();
const response = await mudrex.marketGetPriceKline (params);
```

#### **Python**

```python
import ccxt
mudrex = ccxt.mudrex()
response = mudrex.market_get_price_kline(params)
```

#### **PHP**

```php
$mudrex = new \ccxt\mudrex();
$response = $mudrex->market_get_price_kline($params);
```

#### **C#**

```csharp
using ccxt;
var mudrex = new Mudrex();
var response = await mudrex.marketGetPriceKline(parameters);
```

#### **Go**

```go
mudrex := ccxt.NewMudrex(nil)
response := <-mudrex.MarketGetPriceKline(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official mudrex API documentation:** [docs.trade.mudrex.com](https://docs.trade.mudrex.com/docs)

> 26 implicit endpoints across 2 access groups.

## market

**Base URL**: `https://trade.mudrex.com/fapi/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `marketGetPriceKline` | GET | `price/kline` | 1 |
| `marketGetPriceMarkKline` | GET | `price/mark-kline` | 1 |

## private

**Base URL**: `https://trade.mudrex.com/fapi/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetFutures` | GET | `futures` | 1 |
| `privateGetFuturesAssetId` | GET | `futures/{asset_id}` | 1 |
| `privateGetWalletFunds` | GET | `wallet/funds` | 5 |
| `privateGetFuturesFunds` | GET | `futures/funds` | 5 |
| `privateGetFuturesOrders` | GET | `futures/orders` | 1 |
| `privateGetFuturesOrdersHistory` | GET | `futures/orders/history` | 1 |
| `privateGetFuturesOrdersOrderId` | GET | `futures/orders/{order_id}` | 1 |
| `privateGetFuturesPositions` | GET | `futures/positions` | 1 |
| `privateGetFuturesPositionsHistory` | GET | `futures/positions/history` | 1 |
| `privateGetFuturesFeeHistory` | GET | `futures/fee/history` | 1 |
| `privateGetFuturesAssetIdLeverage` | GET | `futures/{asset_id}/leverage` | 2 |
| `privateGetFuturesPositionsPositionIdLiqPrice` | GET | `futures/positions/{position_id}/liq-price` | 1 |
| `privatePostWalletFuturesTransfer` | POST | `wallet/futures/transfer` | 5 |
| `privatePostFuturesTransfersInr` | POST | `futures/transfers/inr` | 5 |
| `privatePostFuturesAssetIdOrder` | POST | `futures/{asset_id}/order` | 2 |
| `privatePostFuturesPositionsPositionIdClose` | POST | `futures/positions/{position_id}/close` | 2 |
| `privatePostFuturesPositionsPositionIdClosePartial` | POST | `futures/positions/{position_id}/close/partial` | 2 |
| `privatePostFuturesPositionsPositionIdReverse` | POST | `futures/positions/{position_id}/reverse` | 2 |
| `privatePostFuturesPositionsPositionIdAddMargin` | POST | `futures/positions/{position_id}/add-margin` | 2 |
| `privatePostFuturesPositionsPositionIdRiskorder` | POST | `futures/positions/{position_id}/riskorder` | 2 |
| `privatePostFuturesAssetIdLeverage` | POST | `futures/{asset_id}/leverage` | 2 |
| `privatePatchFuturesOrdersOrderId` | PATCH | `futures/orders/{order_id}` | 1 |
| `privatePatchFuturesPositionsPositionIdRiskorder` | PATCH | `futures/positions/{position_id}/riskorder` | 2 |
| `privateDeleteFuturesOrdersOrderId` | DELETE | `futures/orders/{order_id}` | 2 |

