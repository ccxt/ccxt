Every endpoint in `novadax`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/novadax) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetCommonSymbol`); the snake_case alias (`public_get_common_symbol`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetCommonSymbol`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const novadax = new ccxt.novadax ();
const response = await novadax.publicGetCommonSymbol (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const novadax = new ccxt.novadax ();
const response = await novadax.publicGetCommonSymbol (params);
```

#### **Python**

```python
import ccxt
novadax = ccxt.novadax()
response = novadax.public_get_common_symbol(params)
```

#### **PHP**

```php
$novadax = new \ccxt\novadax();
$response = $novadax->public_get_common_symbol($params);
```

#### **C#**

```csharp
using ccxt;
var novadax = new Novadax();
var response = await novadax.publicGetCommonSymbol(parameters);
```

#### **Go**

```go
novadax := ccxt.NewNovadax(nil)
response := <-novadax.PublicGetCommonSymbol(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official novadax API documentation:** [doc.novadax.com](https://doc.novadax.com/pt-BR/)

> 25 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.novadax.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetCommonSymbol` | GET | `common/symbol` | 1 |
| `publicGetCommonSymbols` | GET | `common/symbols` | 1 |
| `publicGetCommonTimestamp` | GET | `common/timestamp` | 1 |
| `publicGetMarketTickers` | GET | `market/tickers` | 5 |
| `publicGetMarketTicker` | GET | `market/ticker` | 1 |
| `publicGetMarketDepth` | GET | `market/depth` | 1 |
| `publicGetMarketTrades` | GET | `market/trades` | 5 |
| `publicGetMarketKlineHistory` | GET | `market/kline/history` | 5 |

## private

**Base URL**: `https://api.novadax.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetOrdersGet` | GET | `orders/get` | 1 |
| `privateGetOrdersList` | GET | `orders/list` | 10 |
| `privateGetOrdersFill` | GET | `orders/fill` | 3 |
| `privateGetOrdersFills` | GET | `orders/fills` | 10 |
| `privateGetAccountGetBalance` | GET | `account/getBalance` | 1 |
| `privateGetAccountSubs` | GET | `account/subs` | 1 |
| `privateGetAccountSubsBalance` | GET | `account/subs/balance` | 1 |
| `privateGetAccountSubsTransferRecord` | GET | `account/subs/transfer/record` | 10 |
| `privateGetWalletQueryDepositWithdraw` | GET | `wallet/query/deposit-withdraw` | 3 |
| `privatePostOrdersCreate` | POST | `orders/create` | 5 |
| `privatePostOrdersBatchCreate` | POST | `orders/batch-create` | 50 |
| `privatePostOrdersCancel` | POST | `orders/cancel` | 1 |
| `privatePostOrdersBatchCancel` | POST | `orders/batch-cancel` | 10 |
| `privatePostOrdersCancelBySymbol` | POST | `orders/cancel-by-symbol` | 10 |
| `privatePostAccountSubsTransfer` | POST | `account/subs/transfer` | 5 |
| `privatePostWalletWithdrawCoin` | POST | `wallet/withdraw/coin` | 3 |
| `privatePostAccountWithdrawCoin` | POST | `account/withdraw/coin` | 3 |

