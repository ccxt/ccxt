Every endpoint in `hibachi`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/hibachi) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetMarketExchangeInfo`); the snake_case alias (`public_get_market_exchange_info`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetMarketExchangeInfo`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const hibachi = new ccxt.hibachi ();
const response = await hibachi.publicGetMarketExchangeInfo (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const hibachi = new ccxt.hibachi ();
const response = await hibachi.publicGetMarketExchangeInfo (params);
```

#### **Python**

```python
import ccxt
hibachi = ccxt.hibachi()
response = hibachi.public_get_market_exchange_info(params)
```

#### **PHP**

```php
$hibachi = new \ccxt\hibachi();
$response = $hibachi->public_get_market_exchange_info($params);
```

#### **C#**

```csharp
using ccxt;
var hibachi = new Hibachi();
var response = await hibachi.publicGetMarketExchangeInfo(parameters);
```

#### **Go**

```go
hibachi := ccxt.NewHibachi(nil)
response := <-hibachi.PublicGetMarketExchangeInfo(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official hibachi API documentation:** [hibachi.xyz](https://www.hibachi.xyz/)

> 22 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://data-api.hibachi.xyz`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetMarketExchangeInfo` | GET | `market/exchange-info` | 1 |
| `publicGetMarketDataTrades` | GET | `market/data/trades` | 1 |
| `publicGetMarketDataPrices` | GET | `market/data/prices` | 1 |
| `publicGetMarketDataStats` | GET | `market/data/stats` | 1 |
| `publicGetMarketDataKlines` | GET | `market/data/klines` | 1 |
| `publicGetMarketDataOrderbook` | GET | `market/data/orderbook` | 1 |
| `publicGetMarketDataOpenInterest` | GET | `market/data/open-interest` | 1 |
| `publicGetMarketDataFundingRates` | GET | `market/data/funding-rates` | 1 |
| `publicGetExchangeUtcTimestamp` | GET | `exchange/utc-timestamp` | 1 |

## private

**Base URL**: `https://api.hibachi.xyz`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetCapitalDepositInfo` | GET | `capital/deposit-info` | 1 |
| `privateGetCapitalHistory` | GET | `capital/history` | 1 |
| `privateGetTradeAccountTradingHistory` | GET | `trade/account/trading_history` | 1 |
| `privateGetTradeAccountInfo` | GET | `trade/account/info` | 1 |
| `privateGetTradeOrder` | GET | `trade/order` | 1 |
| `privateGetTradeAccountTrades` | GET | `trade/account/trades` | 1 |
| `privateGetTradeOrders` | GET | `trade/orders` | 1 |
| `privatePutTradeOrder` | PUT | `trade/order` | 1 |
| `privateDeleteTradeOrder` | DELETE | `trade/order` | 1 |
| `privateDeleteTradeOrders` | DELETE | `trade/orders` | 1 |
| `privatePostTradeOrder` | POST | `trade/order` | 1 |
| `privatePostTradeOrders` | POST | `trade/orders` | 1 |
| `privatePostCapitalWithdraw` | POST | `capital/withdraw` | 1 |

