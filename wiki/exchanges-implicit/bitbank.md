Every endpoint in `bitbank`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitbank) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetPairTicker`); the snake_case alias (`public_get_pair_ticker`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetPairTicker`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bitbank = new ccxt.bitbank ();
const response = await bitbank.publicGetPairTicker (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bitbank = new ccxt.bitbank ();
const response = await bitbank.publicGetPairTicker (params);
```

#### **Python**

```python
import ccxt
bitbank = ccxt.bitbank()
response = bitbank.public_get_pair_ticker(params)
```

#### **PHP**

```php
$bitbank = new \ccxt\bitbank();
$response = $bitbank->public_get_pair_ticker($params);
```

#### **C#**

```csharp
using ccxt;
var bitbank = new Bitbank();
var response = await bitbank.publicGetPairTicker(parameters);
```

#### **Go**

```go
bitbank := ccxt.NewBitbank(nil)
response := <-bitbank.PublicGetPairTicker(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bitbank API documentation:** [docs.bitbank.cc](https://docs.bitbank.cc/)

> 28 implicit endpoints across 3 access groups.

## public

**Base URL**: `https://public.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetPairTicker` | GET | `{pair}/ticker` | 1 |
| `publicGetTickers` | GET | `tickers` | 1 |
| `publicGetTickersJpy` | GET | `tickers_jpy` | 1 |
| `publicGetPairDepth` | GET | `{pair}/depth` | 1 |
| `publicGetPairTransactions` | GET | `{pair}/transactions` | 1 |
| `publicGetPairTransactionsYyyymmdd` | GET | `{pair}/transactions/{yyyymmdd}` | 1 |
| `publicGetPairCandlestickCandletypeYyyymmdd` | GET | `{pair}/candlestick/{candletype}/{yyyymmdd}` | 1 |
| `publicGetPairCircuitBreakInfo` | GET | `{pair}/circuit_break_info` | 1 |

## private

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetUserAssets` | GET | `user/assets` | 1 |
| `privateGetUserSpotOrder` | GET | `user/spot/order` | 1 |
| `privateGetUserSpotActiveOrders` | GET | `user/spot/active_orders` | 1 |
| `privateGetUserMarginPositions` | GET | `user/margin/positions` | 1 |
| `privateGetUserSpotTradeHistory` | GET | `user/spot/trade_history` | 1 |
| `privateGetUserDepositHistory` | GET | `user/deposit_history` | 1 |
| `privateGetUserUnconfirmedDeposits` | GET | `user/unconfirmed_deposits` | 1 |
| `privateGetUserDepositOriginators` | GET | `user/deposit_originators` | 1 |
| `privateGetUserWithdrawalAccount` | GET | `user/withdrawal_account` | 1 |
| `privateGetUserWithdrawalHistory` | GET | `user/withdrawal_history` | 1 |
| `privateGetSpotStatus` | GET | `spot/status` | 1 |
| `privateGetSpotPairs` | GET | `spot/pairs` | 1 |
| `privatePostUserSpotOrder` | POST | `user/spot/order` | 1.66 |
| `privatePostUserSpotCancelOrder` | POST | `user/spot/cancel_order` | 1.66 |
| `privatePostUserSpotCancelOrders` | POST | `user/spot/cancel_orders` | 1.66 |
| `privatePostUserSpotOrdersInfo` | POST | `user/spot/orders_info` | 1.66 |
| `privatePostUserConfirmDeposits` | POST | `user/confirm_deposits` | 1.66 |
| `privatePostUserConfirmDepositsAll` | POST | `user/confirm_deposits_all` | 1.66 |
| `privatePostUserRequestWithdrawal` | POST | `user/request_withdrawal` | 1.66 |

## markets

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `marketsGetSpotPairs` | GET | `spot/pairs` | 1 |

