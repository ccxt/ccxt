Every endpoint in `bit2c`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bit2c) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetExchangesPairTicker`); the snake_case alias (`public_get_exchanges_pair_ticker`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetExchangesPairTicker`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bit2c = new ccxt.bit2c ();
const response = await bit2c.publicGetExchangesPairTicker (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bit2c = new ccxt.bit2c ();
const response = await bit2c.publicGetExchangesPairTicker (params);
```

#### **Python**

```python
import ccxt
bit2c = ccxt.bit2c()
response = bit2c.public_get_exchanges_pair_ticker(params)
```

#### **PHP**

```php
$bit2c = new \ccxt\bit2c();
$response = $bit2c->public_get_exchanges_pair_ticker($params);
```

#### **C#**

```csharp
using ccxt;
var bit2c = new Bit2c();
var response = await bit2c.publicGetExchangesPairTicker(parameters);
```

#### **Go**

```go
bit2c := ccxt.NewBit2c(nil)
response := <-bit2c.PublicGetExchangesPairTicker(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bit2c API documentation:** [bit2c.co.il](https://www.bit2c.co.il/home/api) · [github.com](https://github.com/OferE/bit2c)

> 23 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetExchangesPairTicker` | GET | `Exchanges/{pair}/Ticker` | 1 |
| `publicGetExchangesPairOrderbook` | GET | `Exchanges/{pair}/orderbook` | 1 |
| `publicGetExchangesPairTrades` | GET | `Exchanges/{pair}/trades` | 1 |
| `publicGetExchangesPairLasttrades` | GET | `Exchanges/{pair}/lasttrades` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostMerchantCreateCheckout` | POST | `Merchant/CreateCheckout` | 1 |
| `privatePostFundsAddCoinFundsRequest` | POST | `Funds/AddCoinFundsRequest` | 1 |
| `privatePostOrderAddFund` | POST | `Order/AddFund` | 1 |
| `privatePostOrderAddOrder` | POST | `Order/AddOrder` | 1 |
| `privatePostOrderGetById` | POST | `Order/GetById` | 1 |
| `privatePostOrderAddOrderMarketPriceBuy` | POST | `Order/AddOrderMarketPriceBuy` | 1 |
| `privatePostOrderAddOrderMarketPriceSell` | POST | `Order/AddOrderMarketPriceSell` | 1 |
| `privatePostOrderCancelOrder` | POST | `Order/CancelOrder` | 1 |
| `privatePostOrderAddCoinFundsRequest` | POST | `Order/AddCoinFundsRequest` | 1 |
| `privatePostOrderAddStopOrder` | POST | `Order/AddStopOrder` | 1 |
| `privatePostPaymentGetMyId` | POST | `Payment/GetMyId` | 1 |
| `privatePostPaymentSend` | POST | `Payment/Send` | 1 |
| `privatePostPaymentPay` | POST | `Payment/Pay` | 1 |
| `privateGetAccountBalance` | GET | `Account/Balance` | 1 |
| `privateGetAccountBalanceV2` | GET | `Account/Balance/v2` | 1 |
| `privateGetOrderMyOrders` | GET | `Order/MyOrders` | 1 |
| `privateGetOrderGetById` | GET | `Order/GetById` | 1 |
| `privateGetOrderAccountHistory` | GET | `Order/AccountHistory` | 1 |
| `privateGetOrderOrderHistory` | GET | `Order/OrderHistory` | 1 |

