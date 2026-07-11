Every endpoint in `bit2c`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bit2c) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetExchangesPairTicker`); the snake_case alias (`public_get_exchanges_pair_ticker`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetExchangesPairTicker`). Switch tabs for the call in each language:

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
| `publicGetExchangesPairTicker` | GET | `Exchanges/{pair}/Ticker` |  |
| `publicGetExchangesPairOrderbook` | GET | `Exchanges/{pair}/orderbook` |  |
| `publicGetExchangesPairTrades` | GET | `Exchanges/{pair}/trades` |  |
| `publicGetExchangesPairLasttrades` | GET | `Exchanges/{pair}/lasttrades` |  |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostMerchantCreateCheckout` | POST | `Merchant/CreateCheckout` |  |
| `privatePostFundsAddCoinFundsRequest` | POST | `Funds/AddCoinFundsRequest` |  |
| `privatePostOrderAddFund` | POST | `Order/AddFund` |  |
| `privatePostOrderAddOrder` | POST | `Order/AddOrder` |  |
| `privatePostOrderGetById` | POST | `Order/GetById` |  |
| `privatePostOrderAddOrderMarketPriceBuy` | POST | `Order/AddOrderMarketPriceBuy` |  |
| `privatePostOrderAddOrderMarketPriceSell` | POST | `Order/AddOrderMarketPriceSell` |  |
| `privatePostOrderCancelOrder` | POST | `Order/CancelOrder` |  |
| `privatePostOrderAddCoinFundsRequest` | POST | `Order/AddCoinFundsRequest` |  |
| `privatePostOrderAddStopOrder` | POST | `Order/AddStopOrder` |  |
| `privatePostPaymentGetMyId` | POST | `Payment/GetMyId` |  |
| `privatePostPaymentSend` | POST | `Payment/Send` |  |
| `privatePostPaymentPay` | POST | `Payment/Pay` |  |
| `privateGetAccountBalance` | GET | `Account/Balance` |  |
| `privateGetAccountBalanceV2` | GET | `Account/Balance/v2` |  |
| `privateGetOrderMyOrders` | GET | `Order/MyOrders` |  |
| `privateGetOrderGetById` | GET | `Order/GetById` |  |
| `privateGetOrderAccountHistory` | GET | `Order/AccountHistory` |  |
| `privateGetOrderOrderHistory` | GET | `Order/OrderHistory` |  |

