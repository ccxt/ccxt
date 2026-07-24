Every endpoint in `onetrading`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/onetrading) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetCurrencies`); the snake_case alias (`public_get_currencies`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetCurrencies`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const onetrading = new ccxt.onetrading ();
const response = await onetrading.publicGetCurrencies (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const onetrading = new ccxt.onetrading ();
const response = await onetrading.publicGetCurrencies (params);
```

#### **Python**

```python
import ccxt
onetrading = ccxt.onetrading()
response = onetrading.public_get_currencies(params)
```

#### **PHP**

```php
$onetrading = new \ccxt\onetrading();
$response = $onetrading->public_get_currencies($params);
```

#### **C#**

```csharp
using ccxt;
var onetrading = new Onetrading();
var response = await onetrading.publicGetCurrencies(parameters);
```

#### **Go**

```go
onetrading := ccxt.NewOnetrading(nil)
response := <-onetrading.PublicGetCurrencies(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official onetrading API documentation:** [docs.onetrading.com](https://docs.onetrading.com)

> 20 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.onetrading.com/fast`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetCurrencies` | GET | `currencies` |  |
| `publicGetCandlesticksInstrumentCode` | GET | `candlesticks/{instrument_code}` |  |
| `publicGetFees` | GET | `fees` |  |
| `publicGetInstruments` | GET | `instruments` |  |
| `publicGetOrderBookInstrumentCode` | GET | `order-book/{instrument_code}` |  |
| `publicGetMarketTicker` | GET | `market-ticker` |  |
| `publicGetMarketTickerInstrumentCode` | GET | `market-ticker/{instrument_code}` |  |
| `publicGetTime` | GET | `time` |  |

## private

**Base URL**: `https://api.onetrading.com/fast`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccountBalances` | GET | `account/balances` |  |
| `privateGetAccountFees` | GET | `account/fees` |  |
| `privateGetAccountOrders` | GET | `account/orders` |  |
| `privateGetAccountOrdersOrderId` | GET | `account/orders/{order_id}` |  |
| `privateGetAccountOrdersClientClientId` | GET | `account/orders/client/{client_id}` |  |
| `privateGetAccountOrdersOrderIdTrades` | GET | `account/orders/{order_id}/trades` |  |
| `privateGetAccountTrades` | GET | `account/trades` |  |
| `privateGetAccountTradeTradeId` | GET | `account/trade/{trade_id}` |  |
| `privatePostAccountOrders` | POST | `account/orders` |  |
| `privateDeleteAccountOrders` | DELETE | `account/orders` |  |
| `privateDeleteAccountOrdersOrderId` | DELETE | `account/orders/{order_id}` |  |
| `privateDeleteAccountOrdersClientClientId` | DELETE | `account/orders/client/{client_id}` |  |

