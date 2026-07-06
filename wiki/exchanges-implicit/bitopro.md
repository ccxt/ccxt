Every endpoint in `bitopro`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitopro) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetOrderBookPair`); the snake_case alias (`public_get_order_book_pair`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetOrderBookPair`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bitopro = new ccxt.bitopro ();
const response = await bitopro.publicGetOrderBookPair (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bitopro = new ccxt.bitopro ();
const response = await bitopro.publicGetOrderBookPair (params);
```

#### **Python**

```python
import ccxt
bitopro = ccxt.bitopro()
response = bitopro.public_get_order_book_pair(params)
```

#### **PHP**

```php
$bitopro = new \ccxt\bitopro();
$response = $bitopro->public_get_order_book_pair($params);
```

#### **C#**

```csharp
using ccxt;
var bitopro = new Bitopro();
var response = await bitopro.publicGetOrderBookPair(parameters);
```

#### **Go**

```go
bitopro := ccxt.NewBitopro(nil)
response := <-bitopro.PublicGetOrderBookPair(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bitopro API documentation:** [github.com](https://github.com/bitoex/bitopro-offical-api-docs/blob/master/v3-1/rest-1/rest.md)

> 26 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetOrderBookPair` | GET | `order-book/{pair}` | 1 |
| `publicGetTickers` | GET | `tickers` | 1 |
| `publicGetTickersPair` | GET | `tickers/{pair}` | 1 |
| `publicGetTradesPair` | GET | `trades/{pair}` | 1 |
| `publicGetProvisioningCurrencies` | GET | `provisioning/currencies` | 1 |
| `publicGetProvisioningTradingPairs` | GET | `provisioning/trading-pairs` | 1 |
| `publicGetProvisioningLimitationsAndFees` | GET | `provisioning/limitations-and-fees` | 1 |
| `publicGetTradingHistoryPair` | GET | `trading-history/{pair}` | 1 |
| `publicGetPriceOtcCurrency` | GET | `price/otc/{currency}` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccountsBalance` | GET | `accounts/balance` | 1 |
| `privateGetOrdersHistory` | GET | `orders/history` | 1 |
| `privateGetOrdersAllPair` | GET | `orders/all/{pair}` | 1 |
| `privateGetOrdersTradesPair` | GET | `orders/trades/{pair}` | 1 |
| `privateGetOrdersPairOrderId` | GET | `orders/{pair}/{orderId}` | 1 |
| `privateGetWalletWithdrawCurrencySerial` | GET | `wallet/withdraw/{currency}/{serial}` | 1 |
| `privateGetWalletWithdrawCurrencyIdId` | GET | `wallet/withdraw/{currency}/id/{id}` | 1 |
| `privateGetWalletDepositHistoryCurrency` | GET | `wallet/depositHistory/{currency}` | 1 |
| `privateGetWalletWithdrawHistoryCurrency` | GET | `wallet/withdrawHistory/{currency}` | 1 |
| `privateGetOrdersOpen` | GET | `orders/open` | 1 |
| `privatePostOrdersPair` | POST | `orders/{pair}` | 0.5 |
| `privatePostOrdersBatch` | POST | `orders/batch` | 6.666666666666667 |
| `privatePostWalletWithdrawCurrency` | POST | `wallet/withdraw/{currency}` | 10 |
| `privatePutOrders` | PUT | `orders` | 5 |
| `privateDeleteOrdersPairId` | DELETE | `orders/{pair}/{id}` | 0.6666666666666666 |
| `privateDeleteOrdersAll` | DELETE | `orders/all` | 5 |
| `privateDeleteOrdersPair` | DELETE | `orders/{pair}` | 5 |

