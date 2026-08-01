Every endpoint in `apex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/apex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetV3Symbols`); the snake_case alias (`public_get_v3_symbols`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetV3Symbols`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const apex = new ccxt.apex ();
const response = await apex.publicGetV3Symbols (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const apex = new ccxt.apex ();
const response = await apex.publicGetV3Symbols (params);
```

#### **Python**

```python
import ccxt
apex = ccxt.apex()
response = apex.public_get_v3_symbols(params)
```

#### **PHP**

```php
$apex = new \ccxt\apex();
$response = $apex->public_get_v3_symbols($params);
```

#### **C#**

```csharp
using ccxt;
var apex = new Apex();
var response = await apex.publicGetV3Symbols(parameters);
```

#### **Go**

```go
apex := ccxt.NewApex(nil)
response := <-apex.PublicGetV3Symbols(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official apex API documentation:** [api-docs.omni.apex.exchange](https://api-docs.omni.apex.exchange)

> 27 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://{hostname}/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetV3Symbols` | GET | `v3/symbols` | 1 |
| `publicGetV3HistoryFunding` | GET | `v3/history-funding` | 1 |
| `publicGetV3Ticker` | GET | `v3/ticker` | 1 |
| `publicGetV3Klines` | GET | `v3/klines` | 1 |
| `publicGetV3Trades` | GET | `v3/trades` | 1 |
| `publicGetV3Depth` | GET | `v3/depth` | 1 |
| `publicGetV3Time` | GET | `v3/time` | 1 |
| `publicGetV3DataAllTickerInfo` | GET | `v3/data/all-ticker-info` | 1 |

## private

**Base URL**: `https://{hostname}/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetV3Account` | GET | `v3/account` | 1 |
| `privateGetV3AccountBalance` | GET | `v3/account-balance` | 1 |
| `privateGetV3Fills` | GET | `v3/fills` | 1 |
| `privateGetV3OrderFills` | GET | `v3/order-fills` | 1 |
| `privateGetV3Order` | GET | `v3/order` | 1 |
| `privateGetV3HistoryOrders` | GET | `v3/history-orders` | 1 |
| `privateGetV3OrderByClientOrderId` | GET | `v3/order-by-client-order-id` | 1 |
| `privateGetV3Funding` | GET | `v3/funding` | 1 |
| `privateGetV3HistoricalPnl` | GET | `v3/historical-pnl` | 1 |
| `privateGetV3OpenOrders` | GET | `v3/open-orders` | 1 |
| `privateGetV3Transfers` | GET | `v3/transfers` | 1 |
| `privateGetV3Transfer` | GET | `v3/transfer` | 1 |
| `privatePostV3DeleteOpenOrders` | POST | `v3/delete-open-orders` | 1 |
| `privatePostV3DeleteClientOrderId` | POST | `v3/delete-client-order-id` | 1 |
| `privatePostV3DeleteOrder` | POST | `v3/delete-order` | 1 |
| `privatePostV3Order` | POST | `v3/order` | 1 |
| `privatePostV3SetInitialMarginRate` | POST | `v3/set-initial-margin-rate` | 1 |
| `privatePostV3TransferOut` | POST | `v3/transfer-out` | 1 |
| `privatePostV3ContractTransferOut` | POST | `v3/contract-transfer-out` | 1 |

