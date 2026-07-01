Every endpoint in `bitrue`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitrue) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `spotKlinePublicGetPublicJson`); the snake_case alias (`spot_kline_public_get_public_json`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`SpotKlinePublicGetPublicJson`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bitrue = new ccxt.bitrue ();
const response = await bitrue.spotKlinePublicGetPublicJson (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bitrue = new ccxt.bitrue ();
const response = await bitrue.spotKlinePublicGetPublicJson (params);
```

#### **Python**

```python
import ccxt
bitrue = ccxt.bitrue()
response = bitrue.spot_kline_public_get_public_json(params)
```

#### **PHP**

```php
$bitrue = new \ccxt\bitrue();
$response = $bitrue->spot_kline_public_get_public_json($params);
```

#### **C#**

```csharp
using ccxt;
var bitrue = new Bitrue();
var response = await bitrue.spotKlinePublicGetPublicJson(parameters);
```

#### **Go**

```go
bitrue := ccxt.NewBitrue(nil)
response := <-bitrue.SpotKlinePublicGetPublicJson(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bitrue API documentation:** [github.com](https://github.com/Bitrue-exchange/bitrue-official-api-docs) · [bitrue.com](https://www.bitrue.com/api-docs)

> 65 implicit endpoints across 3 access groups.

## spot

**Base URL**: `https://www.bitrue.com/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `spotKlinePublicGetPublicJson` | GET | `public.json` | 0.24 |
| `spotKlinePublicGetPublicCurrencyJson` | GET | `public{currency}.json` | 0.24 |
| `spotV1PublicGetPing` | GET | `ping` | 0.24 |
| `spotV1PublicGetTime` | GET | `time` | 0.24 |
| `spotV1PublicGetExchangeInfo` | GET | `exchangeInfo` | 0.24 |
| `spotV1PublicGetDepth` | GET | `depth` | 1 |
| `spotV1PublicGetTrades` | GET | `trades` | 0.24 |
| `spotV1PublicGetHistoricalTrades` | GET | `historicalTrades` | 1.2 |
| `spotV1PublicGetAggTrades` | GET | `aggTrades` | 0.24 |
| `spotV1PublicGetTicker24hr` | GET | `ticker/24hr` | 0.24 |
| `spotV1PublicGetTickerPrice` | GET | `ticker/price` | 0.24 |
| `spotV1PublicGetTickerBookTicker` | GET | `ticker/bookTicker` | 0.24 |
| `spotV1PublicGetMarketKline` | GET | `market/kline` | 0.24 |
| `spotV1PrivateGetOrder` | GET | `order` | 5 |
| `spotV1PrivateGetOpenOrders` | GET | `openOrders` | 5 |
| `spotV1PrivateGetAllOrders` | GET | `allOrders` | 25 |
| `spotV1PrivateGetAccount` | GET | `account` | 25 |
| `spotV1PrivateGetMyTrades` | GET | `myTrades` | 25 |
| `spotV1PrivateGetEtfNetValueSymbol` | GET | `etf/net-value/{symbol}` | 0.24 |
| `spotV1PrivateGetWithdrawHistory` | GET | `withdraw/history` | 120 |
| `spotV1PrivateGetDepositHistory` | GET | `deposit/history` | 120 |
| `spotV1PrivatePostOrder` | POST | `order` | 5 |
| `spotV1PrivatePostWithdrawCommit` | POST | `withdraw/commit` | 120 |
| `spotV1PrivateDeleteOrder` | DELETE | `order` | 5 |
| `spotV2PrivateGetMyTrades` | GET | `myTrades` | 1.2 |

## fapi

**Base URL**: `https://fapi.bitrue.com/fapi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `fapiV1PublicGetPing` | GET | `ping` | 0.24 |
| `fapiV1PublicGetTime` | GET | `time` | 0.24 |
| `fapiV1PublicGetContracts` | GET | `contracts` | 0.24 |
| `fapiV1PublicGetDepth` | GET | `depth` | 0.24 |
| `fapiV1PublicGetTicker` | GET | `ticker` | 0.24 |
| `fapiV1PublicGetKlines` | GET | `klines` | 0.24 |
| `fapiV2PrivateGetMyTrades` | GET | `myTrades` | 5 |
| `fapiV2PrivateGetOpenOrders` | GET | `openOrders` | 5 |
| `fapiV2PrivateGetOrder` | GET | `order` | 5 |
| `fapiV2PrivateGetAccount` | GET | `account` | 5 |
| `fapiV2PrivateGetLeverageBracket` | GET | `leverageBracket` | 5 |
| `fapiV2PrivateGetCommissionRate` | GET | `commissionRate` | 5 |
| `fapiV2PrivateGetFuturesTransferHistory` | GET | `futures_transfer_history` | 5 |
| `fapiV2PrivateGetForceOrdersHistory` | GET | `forceOrdersHistory` | 5 |
| `fapiV2PrivatePostPositionMargin` | POST | `positionMargin` | 5 |
| `fapiV2PrivatePostLevelEdit` | POST | `level_edit` | 5 |
| `fapiV2PrivatePostCancel` | POST | `cancel` | 5 |
| `fapiV2PrivatePostOrder` | POST | `order` | 25 |
| `fapiV2PrivatePostAllOpenOrders` | POST | `allOpenOrders` | 5 |
| `fapiV2PrivatePostFuturesTransfer` | POST | `futures_transfer` | 5 |

## dapi

**Base URL**: `https://fapi.bitrue.com/dapi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `dapiV1PublicGetPing` | GET | `ping` | 0.24 |
| `dapiV1PublicGetTime` | GET | `time` | 0.24 |
| `dapiV1PublicGetContracts` | GET | `contracts` | 0.24 |
| `dapiV1PublicGetDepth` | GET | `depth` | 0.24 |
| `dapiV1PublicGetTicker` | GET | `ticker` | 0.24 |
| `dapiV1PublicGetKlines` | GET | `klines` | 0.24 |
| `dapiV2PrivateGetMyTrades` | GET | `myTrades` | 5 |
| `dapiV2PrivateGetOpenOrders` | GET | `openOrders` | 5 |
| `dapiV2PrivateGetOrder` | GET | `order` | 5 |
| `dapiV2PrivateGetAccount` | GET | `account` | 5 |
| `dapiV2PrivateGetLeverageBracket` | GET | `leverageBracket` | 5 |
| `dapiV2PrivateGetCommissionRate` | GET | `commissionRate` | 5 |
| `dapiV2PrivateGetFuturesTransferHistory` | GET | `futures_transfer_history` | 5 |
| `dapiV2PrivateGetForceOrdersHistory` | GET | `forceOrdersHistory` | 5 |
| `dapiV2PrivatePostPositionMargin` | POST | `positionMargin` | 5 |
| `dapiV2PrivatePostLevelEdit` | POST | `level_edit` | 5 |
| `dapiV2PrivatePostCancel` | POST | `cancel` | 5 |
| `dapiV2PrivatePostOrder` | POST | `order` | 5 |
| `dapiV2PrivatePostAllOpenOrders` | POST | `allOpenOrders` | 5 |
| `dapiV2PrivatePostFuturesTransfer` | POST | `futures_transfer` | 5 |

