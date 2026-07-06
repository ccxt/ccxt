Every endpoint in `btcbox`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/btcbox) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetDepth`); the snake_case alias (`public_get_depth`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetDepth`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const btcbox = new ccxt.btcbox ();
const response = await btcbox.publicGetDepth (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const btcbox = new ccxt.btcbox ();
const response = await btcbox.publicGetDepth (params);
```

#### **Python**

```python
import ccxt
btcbox = ccxt.btcbox()
response = btcbox.public_get_depth(params)
```

#### **PHP**

```php
$btcbox = new \ccxt\btcbox();
$response = $btcbox->public_get_depth($params);
```

#### **C#**

```csharp
using ccxt;
var btcbox = new Btcbox();
var response = await btcbox.publicGetDepth(parameters);
```

#### **Go**

```go
btcbox := ccxt.NewBtcbox(nil)
response := <-btcbox.PublicGetDepth(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official btcbox API documentation:** [blog.btcbox.jp](https://blog.btcbox.jp/en/archives/8762)

> 11 implicit endpoints across 3 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetDepth` | GET | `depth` |  |
| `publicGetOrders` | GET | `orders` |  |
| `publicGetTicker` | GET | `ticker` |  |
| `publicGetTickers` | GET | `tickers` |  |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostBalance` | POST | `balance` |  |
| `privatePostTradeAdd` | POST | `trade_add` |  |
| `privatePostTradeCancel` | POST | `trade_cancel` |  |
| `privatePostTradeList` | POST | `trade_list` |  |
| `privatePostTradeView` | POST | `trade_view` |  |
| `privatePostWallet` | POST | `wallet` |  |

## webApi

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `webApiGetAjaxCoinCoinInfo` | GET | `ajax/coin/coinInfo` |  |

