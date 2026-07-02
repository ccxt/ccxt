Every endpoint in `hashkey`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/hashkey) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetApiV1ExchangeInfo`); the snake_case alias (`public_get_api_v1_exchangeinfo`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetApiV1ExchangeInfo`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const hashkey = new ccxt.hashkey ();
const response = await hashkey.publicGetApiV1ExchangeInfo (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const hashkey = new ccxt.hashkey ();
const response = await hashkey.publicGetApiV1ExchangeInfo (params);
```

#### **Python**

```python
import ccxt
hashkey = ccxt.hashkey()
response = hashkey.public_get_api_v1_exchangeinfo(params)
```

#### **PHP**

```php
$hashkey = new \ccxt\hashkey();
$response = $hashkey->public_get_api_v1_exchangeinfo($params);
```

#### **C#**

```csharp
using ccxt;
var hashkey = new Hashkey();
var response = await hashkey.publicGetApiV1ExchangeInfo(parameters);
```

#### **Go**

```go
hashkey := ccxt.NewHashkey(nil)
response := <-hashkey.PublicGetApiV1ExchangeInfo(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official hashkey API documentation:** [hashkeyglobal-apidoc.readme.io](https://hashkeyglobal-apidoc.readme.io/)

> 63 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api-glb.hashkey.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetApiV1ExchangeInfo` | GET | `api/v1/exchangeInfo` | 5 |
| `publicGetQuoteV1Depth` | GET | `quote/v1/depth` | 1 |
| `publicGetQuoteV1Trades` | GET | `quote/v1/trades` | 1 |
| `publicGetQuoteV1Klines` | GET | `quote/v1/klines` | 1 |
| `publicGetQuoteV1Ticker24hr` | GET | `quote/v1/ticker/24hr` | 1 |
| `publicGetQuoteV1TickerPrice` | GET | `quote/v1/ticker/price` | 1 |
| `publicGetQuoteV1TickerBookTicker` | GET | `quote/v1/ticker/bookTicker` | 1 |
| `publicGetQuoteV1DepthMerged` | GET | `quote/v1/depth/merged` | 1 |
| `publicGetQuoteV1MarkPrice` | GET | `quote/v1/markPrice` | 1 |
| `publicGetQuoteV1Index` | GET | `quote/v1/index` | 1 |
| `publicGetApiV1FuturesFundingRate` | GET | `api/v1/futures/fundingRate` | 1 |
| `publicGetApiV1FuturesHistoryFundingRate` | GET | `api/v1/futures/historyFundingRate` | 1 |
| `publicGetApiV1Ping` | GET | `api/v1/ping` | 1 |
| `publicGetApiV1Time` | GET | `api/v1/time` | 1 |

## private

**Base URL**: `https://api-glb.hashkey.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetApiV1SpotOrder` | GET | `api/v1/spot/order` | 1 |
| `privateGetApiV1SpotOpenOrders` | GET | `api/v1/spot/openOrders` | 1 |
| `privateGetApiV1SpotTradeOrders` | GET | `api/v1/spot/tradeOrders` | 5 |
| `privateGetApiV1FuturesLeverage` | GET | `api/v1/futures/leverage` | 1 |
| `privateGetApiV1FuturesOrder` | GET | `api/v1/futures/order` | 1 |
| `privateGetApiV1FuturesOpenOrders` | GET | `api/v1/futures/openOrders` | 1 |
| `privateGetApiV1FuturesUserTrades` | GET | `api/v1/futures/userTrades` | 1 |
| `privateGetApiV1FuturesPositions` | GET | `api/v1/futures/positions` | 1 |
| `privateGetApiV1FuturesHistoryOrders` | GET | `api/v1/futures/historyOrders` | 1 |
| `privateGetApiV1FuturesBalance` | GET | `api/v1/futures/balance` | 1 |
| `privateGetApiV1FuturesLiquidationAssignStatus` | GET | `api/v1/futures/liquidationAssignStatus` | 1 |
| `privateGetApiV1FuturesRiskLimit` | GET | `api/v1/futures/riskLimit` | 1 |
| `privateGetApiV1FuturesCommissionRate` | GET | `api/v1/futures/commissionRate` | 1 |
| `privateGetApiV1FuturesGetBestOrder` | GET | `api/v1/futures/getBestOrder` | 1 |
| `privateGetApiV1AccountVipInfo` | GET | `api/v1/account/vipInfo` | 1 |
| `privateGetApiV1Account` | GET | `api/v1/account` | 1 |
| `privateGetApiV1AccountTrades` | GET | `api/v1/account/trades` | 5 |
| `privateGetApiV1AccountType` | GET | `api/v1/account/type` | 5 |
| `privateGetApiV1AccountCheckApiKey` | GET | `api/v1/account/checkApiKey` | 1 |
| `privateGetApiV1AccountBalanceFlow` | GET | `api/v1/account/balanceFlow` | 5 |
| `privateGetApiV1SpotSubAccountOpenOrders` | GET | `api/v1/spot/subAccount/openOrders` | 1 |
| `privateGetApiV1SpotSubAccountTradeOrders` | GET | `api/v1/spot/subAccount/tradeOrders` | 1 |
| `privateGetApiV1SubAccountTrades` | GET | `api/v1/subAccount/trades` | 1 |
| `privateGetApiV1FuturesSubAccountOpenOrders` | GET | `api/v1/futures/subAccount/openOrders` | 1 |
| `privateGetApiV1FuturesSubAccountHistoryOrders` | GET | `api/v1/futures/subAccount/historyOrders` | 1 |
| `privateGetApiV1FuturesSubAccountUserTrades` | GET | `api/v1/futures/subAccount/userTrades` | 1 |
| `privateGetApiV1AccountDepositAddress` | GET | `api/v1/account/deposit/address` | 1 |
| `privateGetApiV1AccountDepositOrders` | GET | `api/v1/account/depositOrders` | 1 |
| `privateGetApiV1AccountWithdrawOrders` | GET | `api/v1/account/withdrawOrders` | 1 |
| `privatePostApiV1UserDataStream` | POST | `api/v1/userDataStream` | 1 |
| `privatePostApiV1SpotOrderTest` | POST | `api/v1/spot/orderTest` | 1 |
| `privatePostApiV1SpotOrder` | POST | `api/v1/spot/order` | 1 |
| `privatePostApiV11SpotOrder` | POST | `api/v1.1/spot/order` | 1 |
| `privatePostApiV1SpotBatchOrders` | POST | `api/v1/spot/batchOrders` | 5 |
| `privatePostApiV1FuturesLeverage` | POST | `api/v1/futures/leverage` | 1 |
| `privatePostApiV1FuturesOrder` | POST | `api/v1/futures/order` | 1 |
| `privatePostApiV1FuturesPositionTradingStop` | POST | `api/v1/futures/position/trading-stop` | 3 |
| `privatePostApiV1FuturesBatchOrders` | POST | `api/v1/futures/batchOrders` | 5 |
| `privatePostApiV1AccountAssetTransfer` | POST | `api/v1/account/assetTransfer` | 1 |
| `privatePostApiV1AccountAuthAddress` | POST | `api/v1/account/authAddress` | 1 |
| `privatePostApiV1AccountWithdraw` | POST | `api/v1/account/withdraw` | 1 |
| `privatePutApiV1UserDataStream` | PUT | `api/v1/userDataStream` | 1 |
| `privateDeleteApiV1SpotOrder` | DELETE | `api/v1/spot/order` | 1 |
| `privateDeleteApiV1SpotOpenOrders` | DELETE | `api/v1/spot/openOrders` | 5 |
| `privateDeleteApiV1SpotCancelOrderByIds` | DELETE | `api/v1/spot/cancelOrderByIds` | 5 |
| `privateDeleteApiV1FuturesOrder` | DELETE | `api/v1/futures/order` | 1 |
| `privateDeleteApiV1FuturesBatchOrders` | DELETE | `api/v1/futures/batchOrders` | 1 |
| `privateDeleteApiV1FuturesCancelOrderByIds` | DELETE | `api/v1/futures/cancelOrderByIds` | 1 |
| `privateDeleteApiV1UserDataStream` | DELETE | `api/v1/userDataStream` | 1 |

