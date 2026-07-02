Every endpoint in `toobit`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/toobit) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `commonGetApiV1Time`); the snake_case alias (`common_get_api_v1_time`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`CommonGetApiV1Time`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const toobit = new ccxt.toobit ();
const response = await toobit.commonGetApiV1Time (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const toobit = new ccxt.toobit ();
const response = await toobit.commonGetApiV1Time (params);
```

#### **Python**

```python
import ccxt
toobit = ccxt.toobit()
response = toobit.common_get_api_v1_time(params)
```

#### **PHP**

```php
$toobit = new \ccxt\toobit();
$response = $toobit->common_get_api_v1_time($params);
```

#### **C#**

```csharp
using ccxt;
var toobit = new Toobit();
var response = await toobit.commonGetApiV1Time(parameters);
```

#### **Go**

```go
toobit := ccxt.NewToobit(nil)
response := <-toobit.CommonGetApiV1Time(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official toobit API documentation:** [toobit-docs.github.io](https://toobit-docs.github.io/apidocs/spot/v1/en/) · [toobit-docs.github.io](https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/)

> 59 implicit endpoints across 2 access groups.

## common

**Base URL**: `https://api.toobit.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `commonGetApiV1Time` | GET | `api/v1/time` | 1 |
| `commonGetApiV1Ping` | GET | `api/v1/ping` | 1 |
| `commonGetApiV1ExchangeInfo` | GET | `api/v1/exchangeInfo` | 1 |
| `commonGetQuoteV1Depth` | GET | `quote/v1/depth` | 1 |
| `commonGetQuoteV1DepthMerged` | GET | `quote/v1/depth/merged` | 1 |
| `commonGetQuoteV1Trades` | GET | `quote/v1/trades` | 1 |
| `commonGetQuoteV1Klines` | GET | `quote/v1/klines` | 1 |
| `commonGetQuoteV1IndexKlines` | GET | `quote/v1/index/klines` | 1 |
| `commonGetQuoteV1MarkPriceKlines` | GET | `quote/v1/markPrice/klines` | 1 |
| `commonGetQuoteV1MarkPrice` | GET | `quote/v1/markPrice` | 1 |
| `commonGetQuoteV1Index` | GET | `quote/v1/index` | 1 |
| `commonGetQuoteV1Ticker24hr` | GET | `quote/v1/ticker/24hr` | 40 |
| `commonGetQuoteV1ContractTicker24hr` | GET | `quote/v1/contract/ticker/24hr` | 40 |
| `commonGetQuoteV1TickerPrice` | GET | `quote/v1/ticker/price` | 1 |
| `commonGetQuoteV1TickerBookTicker` | GET | `quote/v1/ticker/bookTicker` | 1 |
| `commonGetApiV1FuturesFundingRate` | GET | `api/v1/futures/fundingRate` | 1 |
| `commonGetApiV1FuturesHistoryFundingRate` | GET | `api/v1/futures/historyFundingRate` | 1 |

## private

**Base URL**: `https://api.toobit.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetApiV1Account` | GET | `api/v1/account` | 5 |
| `privateGetApiV1AccountCheckApiKey` | GET | `api/v1/account/checkApiKey` | 1 |
| `privateGetApiV1SpotOrder` | GET | `api/v1/spot/order` | 1.67 |
| `privateGetApiV1SpotOpenOrders` | GET | `api/v1/spot/openOrders` | 1.67 |
| `privateGetApiV1FuturesOpenOrders` | GET | `api/v1/futures/openOrders` | 1.67 |
| `privateGetApiV1SpotTradeOrders` | GET | `api/v1/spot/tradeOrders` | 8.35 |
| `privateGetApiV1FuturesHistoryOrders` | GET | `api/v1/futures/historyOrders` | 8.35 |
| `privateGetApiV1AccountTrades` | GET | `api/v1/account/trades` | 8.35 |
| `privateGetApiV1AccountBalanceFlow` | GET | `api/v1/account/balanceFlow` | 5 |
| `privateGetApiV1AccountDepositOrders` | GET | `api/v1/account/depositOrders` | 5 |
| `privateGetApiV1AccountWithdrawOrders` | GET | `api/v1/account/withdrawOrders` | 5 |
| `privateGetApiV1AccountDepositAddress` | GET | `api/v1/account/deposit/address` | 1 |
| `privateGetApiV1SubAccount` | GET | `api/v1/subAccount` | 5 |
| `privateGetApiV1FuturesAccountLeverage` | GET | `api/v1/futures/accountLeverage` | 1 |
| `privateGetApiV1FuturesOrder` | GET | `api/v1/futures/order` | 1.67 |
| `privateGetApiV1FuturesPositions` | GET | `api/v1/futures/positions` | 8.35 |
| `privateGetApiV1FuturesBalance` | GET | `api/v1/futures/balance` | 5 |
| `privateGetApiV1FuturesUserTrades` | GET | `api/v1/futures/userTrades` | 8.35 |
| `privateGetApiV1FuturesBalanceFlow` | GET | `api/v1/futures/balanceFlow` | 5 |
| `privateGetApiV1FuturesCommissionRate` | GET | `api/v1/futures/commissionRate` | 5 |
| `privateGetApiV1FuturesTodayPnl` | GET | `api/v1/futures/todayPnl` | 5 |
| `privatePostApiV1SpotOrderTest` | POST | `api/v1/spot/orderTest` | 1.67 |
| `privatePostApiV1SpotOrder` | POST | `api/v1/spot/order` | 1.67 |
| `privatePostApiV1FuturesOrder` | POST | `api/v1/futures/order` | 1.67 |
| `privatePostApiV1SpotBatchOrders` | POST | `api/v1/spot/batchOrders` | 3.34 |
| `privatePostApiV1SubAccountTransfer` | POST | `api/v1/subAccount/transfer` | 1 |
| `privatePostApiV1AccountWithdraw` | POST | `api/v1/account/withdraw` | 1 |
| `privatePostApiV1FuturesMarginType` | POST | `api/v1/futures/marginType` | 1 |
| `privatePostApiV1FuturesLeverage` | POST | `api/v1/futures/leverage` | 1 |
| `privatePostApiV1FuturesBatchOrders` | POST | `api/v1/futures/batchOrders` | 3.34 |
| `privatePostApiV1FuturesPositionTradingStop` | POST | `api/v1/futures/position/trading-stop` | 5.01 |
| `privatePostApiV1FuturesPositionMargin` | POST | `api/v1/futures/positionMargin` | 1 |
| `privatePostApiV1UserDataStream` | POST | `api/v1/userDataStream` | 1 |
| `privatePostApiV1ListenKey` | POST | `api/v1/listenKey` | 1 |
| `privateDeleteApiV1SpotOrder` | DELETE | `api/v1/spot/order` | 1.67 |
| `privateDeleteApiV1FuturesOrder` | DELETE | `api/v1/futures/order` | 1.67 |
| `privateDeleteApiV1SpotOpenOrders` | DELETE | `api/v1/spot/openOrders` | 8.35 |
| `privateDeleteApiV1FuturesBatchOrders` | DELETE | `api/v1/futures/batchOrders` | 8.35 |
| `privateDeleteApiV1SpotCancelOrderByIds` | DELETE | `api/v1/spot/cancelOrderByIds` | 8.35 |
| `privateDeleteApiV1FuturesCancelOrderByIds` | DELETE | `api/v1/futures/cancelOrderByIds` | 8.35 |
| `privateDeleteApiV1ListenKey` | DELETE | `api/v1/listenKey` | 1 |
| `privatePutApiV1ListenKey` | PUT | `api/v1/listenKey` | 1 |

