Every endpoint in `bitteam`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitteam) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `historyGetApiTwHistoryPairNameResolution`); the snake_case alias (`history_get_api_tw_history_pairname_resolution`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`HistoryGetApiTwHistoryPairNameResolution`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bitteam = new ccxt.bitteam ();
const response = await bitteam.historyGetApiTwHistoryPairNameResolution (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bitteam = new ccxt.bitteam ();
const response = await bitteam.historyGetApiTwHistoryPairNameResolution (params);
```

#### **Python**

```python
import ccxt
bitteam = ccxt.bitteam()
response = bitteam.history_get_api_tw_history_pairname_resolution(params)
```

#### **PHP**

```php
$bitteam = new \ccxt\bitteam();
$response = $bitteam->history_get_api_tw_history_pairname_resolution($params);
```

#### **C#**

```csharp
using ccxt;
var bitteam = new Bitteam();
var response = await bitteam.historyGetApiTwHistoryPairNameResolution(parameters);
```

#### **Go**

```go
bitteam := ccxt.NewBitteam(nil)
response := <-bitteam.HistoryGetApiTwHistoryPairNameResolution(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bitteam API documentation:** [bit.team](https://bit.team/trade/api/documentation)

> 25 implicit endpoints across 3 access groups.

## history

**Base URL**: `https://history.bit.team`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `historyGetApiTwHistoryPairNameResolution` | GET | `api/tw/history/{pairName}/{resolution}` | 1 |

## public

**Base URL**: `https://bit.team`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetTradeApiAsset` | GET | `trade/api/asset` | 1 |
| `publicGetTradeApiCurrencies` | GET | `trade/api/currencies` | 1 |
| `publicGetTradeApiOrderbooksSymbol` | GET | `trade/api/orderbooks/{symbol}` | 1 |
| `publicGetTradeApiOrders` | GET | `trade/api/orders` | 1 |
| `publicGetTradeApiPairName` | GET | `trade/api/pair/{name}` | 1 |
| `publicGetTradeApiPairs` | GET | `trade/api/pairs` | 1 |
| `publicGetTradeApiPairsPrecisions` | GET | `trade/api/pairs/precisions` | 1 |
| `publicGetTradeApiRates` | GET | `trade/api/rates` | 1 |
| `publicGetTradeApiTradeId` | GET | `trade/api/trade/{id}` | 1 |
| `publicGetTradeApiTrades` | GET | `trade/api/trades` | 1 |
| `publicGetTradeApiCcxtPairs` | GET | `trade/api/ccxt/pairs` | 1 |
| `publicGetTradeApiCmcAssets` | GET | `trade/api/cmc/assets` | 1 |
| `publicGetTradeApiCmcOrderbookPair` | GET | `trade/api/cmc/orderbook/{pair}` | 1 |
| `publicGetTradeApiCmcSummary` | GET | `trade/api/cmc/summary` | 1 |
| `publicGetTradeApiCmcTicker` | GET | `trade/api/cmc/ticker` | 1 |
| `publicGetTradeApiCmcTradesPair` | GET | `trade/api/cmc/trades/{pair}` | 1 |

## private

**Base URL**: `https://bit.team`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetTradeApiCcxtBalance` | GET | `trade/api/ccxt/balance` | 1 |
| `privateGetTradeApiCcxtOrderId` | GET | `trade/api/ccxt/order/{id}` | 1 |
| `privateGetTradeApiCcxtOrdersOfUser` | GET | `trade/api/ccxt/ordersOfUser` | 1 |
| `privateGetTradeApiCcxtTradesOfUser` | GET | `trade/api/ccxt/tradesOfUser` | 1 |
| `privateGetTradeApiTransactionsOfUser` | GET | `trade/api/transactionsOfUser` | 1 |
| `privatePostTradeApiCcxtCancelAllOrder` | POST | `trade/api/ccxt/cancel-all-order` | 1 |
| `privatePostTradeApiCcxtCancelorder` | POST | `trade/api/ccxt/cancelorder` | 1 |
| `privatePostTradeApiCcxtOrdercreate` | POST | `trade/api/ccxt/ordercreate` | 1 |

