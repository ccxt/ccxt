Every endpoint in `krakenfutures`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/krakenfutures) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetFeeschedules`); the snake_case alias (`public_get_feeschedules`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetFeeschedules`). Switch tabs for the call in each language:

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
| `publicGetFeeschedules` | GET | `feeschedules` | 1 |
| `publicGetInstruments` | GET | `instruments` | 1 |
| `publicGetOrderbook` | GET | `orderbook` | 1 |
| `publicGetTickers` | GET | `tickers` | 1 |
| `publicGetHistory` | GET | `history` | 1 |
| `publicGetHistoricalfundingrates` | GET | `historicalfundingrates` | 1 |

## private

**Base URL**: `https://futures.kraken.com/derivatives/api/`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetFeeschedulesVolumes` | GET | `feeschedules/volumes` | 1 |
| `privateGetOpenpositions` | GET | `openpositions` | 1 |
| `privateGetNotifications` | GET | `notifications` | 1 |
| `privateGetAccounts` | GET | `accounts` | 1 |
| `privateGetOpenorders` | GET | `openorders` | 1 |
| `privateGetRecentorders` | GET | `recentorders` | 1 |
| `privateGetFills` | GET | `fills` | 1 |
| `privateGetTransfers` | GET | `transfers` | 1 |
| `privateGetLeveragepreferences` | GET | `leveragepreferences` | 1 |
| `privateGetPnlpreferences` | GET | `pnlpreferences` | 1 |
| `privateGetAssignmentprogramCurrent` | GET | `assignmentprogram/current` | 1 |
| `privateGetAssignmentprogramHistory` | GET | `assignmentprogram/history` | 1 |
| `privateGetOrdersStatus` | GET | `orders/status` | 1 |
| `privatePostSendorder` | POST | `sendorder` | 1 |
| `privatePostEditorder` | POST | `editorder` | 1 |
| `privatePostCancelorder` | POST | `cancelorder` | 1 |
| `privatePostTransfer` | POST | `transfer` | 1 |
| `privatePostBatchorder` | POST | `batchorder` | 1 |
| `privatePostCancelallorders` | POST | `cancelallorders` | 1 |
| `privatePostCancelallordersafter` | POST | `cancelallordersafter` | 1 |
| `privatePostWithdrawal` | POST | `withdrawal` | 1 |
| `privatePostAssignmentprogramAdd` | POST | `assignmentprogram/add` | 1 |
| `privatePostAssignmentprogramDelete` | POST | `assignmentprogram/delete` | 1 |
| `privatePutLeveragepreferences` | PUT | `leveragepreferences` | 1 |
| `privatePutPnlpreferences` | PUT | `pnlpreferences` | 1 |

## charts

**Base URL**: `https://futures.kraken.com/api/charts/`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `chartsGetPriceTypeSymbolInterval` | GET | `{price_type}/{symbol}/{interval}` | 1 |

## history

**Base URL**: `https://futures.kraken.com/api/history/`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `historyGetOrders` | GET | `orders` | 1 |
| `historyGetExecutions` | GET | `executions` | 1 |
| `historyGetTriggers` | GET | `triggers` | 1 |
| `historyGetAccountlogcsv` | GET | `accountlogcsv` | 1 |
| `historyGetAccountLog` | GET | `account-log` | 1 |
| `historyGetMarketSymbolOrders` | GET | `market/{symbol}/orders` | 1 |
| `historyGetMarketSymbolExecutions` | GET | `market/{symbol}/executions` | 1 |

