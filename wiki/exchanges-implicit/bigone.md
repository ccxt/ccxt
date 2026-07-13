Every endpoint in `bigone`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bigone) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetPing`); the snake_case alias (`public_get_ping`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetPing`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bigone = new ccxt.bigone ();
const response = await bigone.publicGetPing (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bigone = new ccxt.bigone ();
const response = await bigone.publicGetPing (params);
```

#### **Python**

```python
import ccxt
bigone = ccxt.bigone()
response = bigone.public_get_ping(params)
```

#### **PHP**

```php
$bigone = new \ccxt\bigone();
$response = $bigone->public_get_ping($params);
```

#### **C#**

```csharp
using ccxt;
var bigone = new Bigone();
var response = await bigone.publicGetPing(parameters);
```

#### **Go**

```go
bigone := ccxt.NewBigone(nil)
response := <-bigone.PublicGetPing(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bigone API documentation:** [open.big.one](https://open.big.one/docs/api.html)

> 41 implicit endpoints across 5 access groups.

## public

**Base URL**: `https://{hostname}/api/v3`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetPing` | GET | `ping` |  |
| `publicGetAssetPairs` | GET | `asset_pairs` |  |
| `publicGetAssetPairsAssetPairNameDepth` | GET | `asset_pairs/{asset_pair_name}/depth` |  |
| `publicGetAssetPairsAssetPairNameTrades` | GET | `asset_pairs/{asset_pair_name}/trades` |  |
| `publicGetAssetPairsAssetPairNameTicker` | GET | `asset_pairs/{asset_pair_name}/ticker` |  |
| `publicGetAssetPairsAssetPairNameCandles` | GET | `asset_pairs/{asset_pair_name}/candles` |  |
| `publicGetAssetPairsTickers` | GET | `asset_pairs/tickers` |  |

## private

**Base URL**: `https://{hostname}/api/v3/viewer`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccounts` | GET | `accounts` |  |
| `privateGetFundAccounts` | GET | `fund/accounts` |  |
| `privateGetAssetsAssetSymbolAddress` | GET | `assets/{asset_symbol}/address` |  |
| `privateGetOrders` | GET | `orders` |  |
| `privateGetOrdersId` | GET | `orders/{id}` |  |
| `privateGetOrdersMulti` | GET | `orders/multi` |  |
| `privateGetTrades` | GET | `trades` |  |
| `privateGetWithdrawals` | GET | `withdrawals` |  |
| `privateGetDeposits` | GET | `deposits` |  |
| `privatePostOrders` | POST | `orders` |  |
| `privatePostOrdersIdCancel` | POST | `orders/{id}/cancel` |  |
| `privatePostOrdersCancel` | POST | `orders/cancel` |  |
| `privatePostWithdrawals` | POST | `withdrawals` |  |
| `privatePostTransfer` | POST | `transfer` |  |

## contractPublic

**Base URL**: `https://{hostname}/api/contract/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `contractPublicGetSymbols` | GET | `symbols` |  |
| `contractPublicGetInstruments` | GET | `instruments` |  |
| `contractPublicGetDepthSymbolSnapshot` | GET | `depth@{symbol}/snapshot` |  |
| `contractPublicGetInstrumentsDifference` | GET | `instruments/difference` |  |
| `contractPublicGetInstrumentsPrices` | GET | `instruments/prices` |  |

## contractPrivate

**Base URL**: `https://{hostname}/api/contract/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `contractPrivateGetAccounts` | GET | `accounts` |  |
| `contractPrivateGetOrdersId` | GET | `orders/{id}` |  |
| `contractPrivateGetOrders` | GET | `orders` |  |
| `contractPrivateGetOrdersOpening` | GET | `orders/opening` |  |
| `contractPrivateGetOrdersCount` | GET | `orders/count` |  |
| `contractPrivateGetOrdersOpeningCount` | GET | `orders/opening/count` |  |
| `contractPrivateGetTrades` | GET | `trades` |  |
| `contractPrivateGetTradesCount` | GET | `trades/count` |  |
| `contractPrivatePostOrders` | POST | `orders` |  |
| `contractPrivatePostOrdersBatch` | POST | `orders/batch` |  |
| `contractPrivatePutPositionsSymbolMargin` | PUT | `positions/{symbol}/margin` |  |
| `contractPrivatePutPositionsSymbolRiskLimit` | PUT | `positions/{symbol}/risk-limit` |  |
| `contractPrivateDeleteOrdersId` | DELETE | `orders/{id}` |  |
| `contractPrivateDeleteOrdersBatch` | DELETE | `orders/batch` |  |

## webExchange

**Base URL**: `https://{hostname}/api/`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `webExchangeGetV3Assets` | GET | `v3/assets` |  |

