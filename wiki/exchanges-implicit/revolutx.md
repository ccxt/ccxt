Every endpoint in `revolutx`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/revolutx) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGet20PublicOrderBookSymbol`); the snake_case alias (`public_get_2_0_public_order_book_symbol`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGet20PublicOrderBookSymbol`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const revolutx = new ccxt.revolutx ();
const response = await revolutx.publicGet20PublicOrderBookSymbol (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const revolutx = new ccxt.revolutx ();
const response = await revolutx.publicGet20PublicOrderBookSymbol (params);
```

#### **Python**

```python
import ccxt
revolutx = ccxt.revolutx()
response = revolutx.public_get_2_0_public_order_book_symbol(params)
```

#### **PHP**

```php
$revolutx = new \ccxt\revolutx();
$response = $revolutx->public_get_2_0_public_order_book_symbol($params);
```

#### **C#**

```csharp
using ccxt;
var revolutx = new Revolutx();
var response = await revolutx.publicGet20PublicOrderBookSymbol(parameters);
```

#### **Go**

```go
revolutx := ccxt.NewRevolutx(nil)
response := <-revolutx.PublicGet20PublicOrderBookSymbol(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official revolutx API documentation:** [developer.revolut.com](https://developer.revolut.com/docs/api/revolut-x-crypto-exchange)

> 16 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://revx.revolut.com/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGet20PublicOrderBookSymbol` | GET | `2.0/public/order-book/{symbol}` | 1 |
| `publicGet10PublicTickers` | GET | `1.0/public/tickers` | 1 |
| `publicGet10PublicCandlesSymbol` | GET | `1.0/public/candles/{symbol}` | 1 |
| `publicGet10PublicTradesAll` | GET | `1.0/public/trades/all` | 1 |
| `publicGet10PublicConfigurationCurrencies` | GET | `1.0/public/configuration/currencies` | 1 |
| `publicGet10PublicConfigurationPairs` | GET | `1.0/public/configuration/pairs` | 1 |

## private

**Base URL**: `https://revx.revolut.com/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGet10Balances` | GET | `1.0/balances` | 1 |
| `privateGet10OrdersActive` | GET | `1.0/orders/active` | 1 |
| `privateGet10OrdersHistorical` | GET | `1.0/orders/historical` | 1 |
| `privateGet10OrdersVenueOrderId` | GET | `1.0/orders/{venue_order_id}` | 1 |
| `privateGet10OrdersFillsVenueOrderId` | GET | `1.0/orders/fills/{venue_order_id}` | 1 |
| `privateGet10TradesPrivateSymbol` | GET | `1.0/trades/private/{symbol}` | 1 |
| `privatePost10Orders` | POST | `1.0/orders` | 1 |
| `privatePut10OrdersVenueOrderId` | PUT | `1.0/orders/{venue_order_id}` | 1 |
| `privateDelete10Orders` | DELETE | `1.0/orders` | 1 |
| `privateDelete10OrdersVenueOrderId` | DELETE | `1.0/orders/{venue_order_id}` | 1 |

