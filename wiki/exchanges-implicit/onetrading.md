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
| `publicGetCurrencies` | GET | `currencies` | 1 |
| `publicGetCandlesticksInstrumentCode` | GET | `candlesticks/{instrument_code}` | 1 |
| `publicGetFees` | GET | `fees` | 1 |
| `publicGetInstruments` | GET | `instruments` | 1 |
| `publicGetOrderBookInstrumentCode` | GET | `order-book/{instrument_code}` | 1 |
| `publicGetMarketTicker` | GET | `market-ticker` | 1 |
| `publicGetMarketTickerInstrumentCode` | GET | `market-ticker/{instrument_code}` | 1 |
| `publicGetTime` | GET | `time` | 1 |

## private

**Base URL**: `https://api.onetrading.com/fast`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccountBalances` | GET | `account/balances` | 1 |
| `privateGetAccountFees` | GET | `account/fees` | 1 |
| `privateGetAccountOrders` | GET | `account/orders` | 1 |
| `privateGetAccountOrdersOrderId` | GET | `account/orders/{order_id}` | 1 |
| `privateGetAccountOrdersClientClientId` | GET | `account/orders/client/{client_id}` | 1 |
| `privateGetAccountOrdersOrderIdTrades` | GET | `account/orders/{order_id}/trades` | 1 |
| `privateGetAccountTrades` | GET | `account/trades` | 1 |
| `privateGetAccountTradeTradeId` | GET | `account/trade/{trade_id}` | 1 |
| `privatePostAccountOrders` | POST | `account/orders` | 1 |
| `privateDeleteAccountOrders` | DELETE | `account/orders` | 1 |
| `privateDeleteAccountOrdersOrderId` | DELETE | `account/orders/{order_id}` | 1 |
| `privateDeleteAccountOrdersClientClientId` | DELETE | `account/orders/client/{client_id}` | 1 |

