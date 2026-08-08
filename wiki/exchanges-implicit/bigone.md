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
| `publicGetPing` | GET | `ping` | 1 |
| `publicGetAssetPairs` | GET | `asset_pairs` | 1 |
| `publicGetAssetPairsAssetPairNameDepth` | GET | `asset_pairs/{asset_pair_name}/depth` | 1 |
| `publicGetAssetPairsAssetPairNameTrades` | GET | `asset_pairs/{asset_pair_name}/trades` | 1 |
| `publicGetAssetPairsAssetPairNameTicker` | GET | `asset_pairs/{asset_pair_name}/ticker` | 1 |
| `publicGetAssetPairsAssetPairNameCandles` | GET | `asset_pairs/{asset_pair_name}/candles` | 1 |
| `publicGetAssetPairsTickers` | GET | `asset_pairs/tickers` | 1 |

## private

**Base URL**: `https://{hostname}/api/v3/viewer`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccounts` | GET | `accounts` | 1 |
| `privateGetFundAccounts` | GET | `fund/accounts` | 1 |
| `privateGetAssetsAssetSymbolAddress` | GET | `assets/{asset_symbol}/address` | 1 |
| `privateGetOrders` | GET | `orders` | 1 |
| `privateGetOrdersId` | GET | `orders/{id}` | 1 |
| `privateGetOrdersMulti` | GET | `orders/multi` | 1 |
| `privateGetTrades` | GET | `trades` | 1 |
| `privateGetWithdrawals` | GET | `withdrawals` | 1 |
| `privateGetDeposits` | GET | `deposits` | 1 |
| `privatePostOrders` | POST | `orders` | 1 |
| `privatePostOrdersIdCancel` | POST | `orders/{id}/cancel` | 1 |
| `privatePostOrdersCancel` | POST | `orders/cancel` | 1 |
| `privatePostWithdrawals` | POST | `withdrawals` | 1 |
| `privatePostTransfer` | POST | `transfer` | 1 |

## contractPublic

**Base URL**: `https://{hostname}/api/contract/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `contractPublicGetSymbols` | GET | `symbols` | 1 |
| `contractPublicGetInstruments` | GET | `instruments` | 1 |
| `contractPublicGetDepthSymbolSnapshot` | GET | `depth@{symbol}/snapshot` | 1 |
| `contractPublicGetInstrumentsDifference` | GET | `instruments/difference` | 1 |
| `contractPublicGetInstrumentsPrices` | GET | `instruments/prices` | 1 |

## contractPrivate

**Base URL**: `https://{hostname}/api/contract/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `contractPrivateGetAccounts` | GET | `accounts` | 1 |
| `contractPrivateGetOrdersId` | GET | `orders/{id}` | 1 |
| `contractPrivateGetOrders` | GET | `orders` | 1 |
| `contractPrivateGetOrdersOpening` | GET | `orders/opening` | 1 |
| `contractPrivateGetOrdersCount` | GET | `orders/count` | 1 |
| `contractPrivateGetOrdersOpeningCount` | GET | `orders/opening/count` | 1 |
| `contractPrivateGetTrades` | GET | `trades` | 1 |
| `contractPrivateGetTradesCount` | GET | `trades/count` | 1 |
| `contractPrivatePostOrders` | POST | `orders` | 1 |
| `contractPrivatePostOrdersBatch` | POST | `orders/batch` | 1 |
| `contractPrivatePutPositionsSymbolMargin` | PUT | `positions/{symbol}/margin` | 1 |
| `contractPrivatePutPositionsSymbolRiskLimit` | PUT | `positions/{symbol}/risk-limit` | 1 |
| `contractPrivateDeleteOrdersId` | DELETE | `orders/{id}` | 1 |
| `contractPrivateDeleteOrdersBatch` | DELETE | `orders/batch` | 1 |

## webExchange

**Base URL**: `https://{hostname}/api/`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `webExchangeGetV3Assets` | GET | `v3/assets` | 1 |

