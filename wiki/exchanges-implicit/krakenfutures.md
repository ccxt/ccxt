Every endpoint in `krakenfutures`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/krakenfutures) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetFeeschedules`); the snake_case alias (`public_get_feeschedules`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetFeeschedules`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const krakenfutures = new ccxt.krakenfutures ();
const response = await krakenfutures.publicGetFeeschedules (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const krakenfutures = new ccxt.krakenfutures ();
const response = await krakenfutures.publicGetFeeschedules (params);
```

#### **Python**

```python
import ccxt
krakenfutures = ccxt.krakenfutures()
response = krakenfutures.public_get_feeschedules(params)
```

#### **PHP**

```php
$krakenfutures = new \ccxt\krakenfutures();
$response = $krakenfutures->public_get_feeschedules($params);
```

#### **C#**

```csharp
using ccxt;
var krakenfutures = new Krakenfutures();
var response = await krakenfutures.publicGetFeeschedules(parameters);
```

#### **Go**

```go
krakenfutures := ccxt.NewKrakenfutures(nil)
response := <-krakenfutures.PublicGetFeeschedules(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official krakenfutures API documentation:** [docs.kraken.com](https://docs.kraken.com/api/docs/futures-api/trading/market-data/)

> 39 implicit endpoints across 4 access groups.

## public

**Base URL**: `https://futures.kraken.com/derivatives/api/`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetFeeschedules` | GET | `feeschedules` |  |
| `publicGetInstruments` | GET | `instruments` |  |
| `publicGetOrderbook` | GET | `orderbook` |  |
| `publicGetTickers` | GET | `tickers` |  |
| `publicGetHistory` | GET | `history` |  |
| `publicGetHistoricalfundingrates` | GET | `historicalfundingrates` |  |

## private

**Base URL**: `https://futures.kraken.com/derivatives/api/`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetFeeschedulesVolumes` | GET | `feeschedules/volumes` |  |
| `privateGetOpenpositions` | GET | `openpositions` |  |
| `privateGetNotifications` | GET | `notifications` |  |
| `privateGetAccounts` | GET | `accounts` |  |
| `privateGetOpenorders` | GET | `openorders` |  |
| `privateGetRecentorders` | GET | `recentorders` |  |
| `privateGetFills` | GET | `fills` |  |
| `privateGetTransfers` | GET | `transfers` |  |
| `privateGetLeveragepreferences` | GET | `leveragepreferences` |  |
| `privateGetPnlpreferences` | GET | `pnlpreferences` |  |
| `privateGetAssignmentprogramCurrent` | GET | `assignmentprogram/current` |  |
| `privateGetAssignmentprogramHistory` | GET | `assignmentprogram/history` |  |
| `privateGetOrdersStatus` | GET | `orders/status` |  |
| `privatePostSendorder` | POST | `sendorder` |  |
| `privatePostEditorder` | POST | `editorder` |  |
| `privatePostCancelorder` | POST | `cancelorder` |  |
| `privatePostTransfer` | POST | `transfer` |  |
| `privatePostBatchorder` | POST | `batchorder` |  |
| `privatePostCancelallorders` | POST | `cancelallorders` |  |
| `privatePostCancelallordersafter` | POST | `cancelallordersafter` |  |
| `privatePostWithdrawal` | POST | `withdrawal` |  |
| `privatePostAssignmentprogramAdd` | POST | `assignmentprogram/add` |  |
| `privatePostAssignmentprogramDelete` | POST | `assignmentprogram/delete` |  |
| `privatePutLeveragepreferences` | PUT | `leveragepreferences` |  |
| `privatePutPnlpreferences` | PUT | `pnlpreferences` |  |

## charts

**Base URL**: `https://futures.kraken.com/api/charts/`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `chartsGetPriceTypeSymbolInterval` | GET | `{price_type}/{symbol}/{interval}` |  |

## history

**Base URL**: `https://futures.kraken.com/api/history/`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `historyGetOrders` | GET | `orders` |  |
| `historyGetExecutions` | GET | `executions` |  |
| `historyGetTriggers` | GET | `triggers` |  |
| `historyGetAccountlogcsv` | GET | `accountlogcsv` |  |
| `historyGetAccountLog` | GET | `account-log` |  |
| `historyGetMarketSymbolOrders` | GET | `market/{symbol}/orders` |  |
| `historyGetMarketSymbolExecutions` | GET | `market/{symbol}/executions` |  |

