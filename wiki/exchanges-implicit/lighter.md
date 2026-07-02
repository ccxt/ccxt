Every endpoint in `lighter`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/lighter) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `rootGet`); the snake_case alias (`root_get_`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`RootGet`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const lighter = new ccxt.lighter ();
const response = await lighter.rootGet (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const lighter = new ccxt.lighter ();
const response = await lighter.rootGet (params);
```

#### **Python**

```python
import ccxt
lighter = ccxt.lighter()
response = lighter.root_get_(params)
```

#### **PHP**

```php
$lighter = new \ccxt\lighter();
$response = $lighter->root_get_($params);
```

#### **C#**

```csharp
using ccxt;
var lighter = new Lighter();
var response = await lighter.rootGet(parameters);
```

#### **Go**

```go
lighter := ccxt.NewLighter(nil)
response := <-lighter.RootGet(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official lighter API documentation:** [apidocs.lighter.xyz](https://apidocs.lighter.xyz/)

> 46 implicit endpoints across 3 access groups.

## root

**Base URL**: `https://mainnet.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `rootGet` | GET | `` | 1 |
| `rootGetInfo` | GET | `info` | 1 |

## public

**Base URL**: `https://mainnet.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetAccount` | GET | `account` | 1 |
| `publicGetAccountsByL1Address` | GET | `accountsByL1Address` | 1 |
| `publicGetApikeys` | GET | `apikeys` | 1 |
| `publicGetExchangeStats` | GET | `exchangeStats` | 1 |
| `publicGetAssetDetails` | GET | `assetDetails` | 1 |
| `publicGetOrderBookDetails` | GET | `orderBookDetails` | 1 |
| `publicGetOrderBookOrders` | GET | `orderBookOrders` | 1 |
| `publicGetOrderBooks` | GET | `orderBooks` | 1 |
| `publicGetRecentTrades` | GET | `recentTrades` | 1 |
| `publicGetBlockTxs` | GET | `blockTxs` | 1 |
| `publicGetNextNonce` | GET | `nextNonce` | 1 |
| `publicGetTx` | GET | `tx` | 1 |
| `publicGetTxFromL1TxHash` | GET | `txFromL1TxHash` | 1 |
| `publicGetTxs` | GET | `txs` | 1 |
| `publicGetAnnouncement` | GET | `announcement` | 1 |
| `publicGetBlock` | GET | `block` | 1 |
| `publicGetBlocks` | GET | `blocks` | 1 |
| `publicGetCurrentHeight` | GET | `currentHeight` | 1 |
| `publicGetCandles` | GET | `candles` | 1 |
| `publicGetFundings` | GET | `fundings` | 1 |
| `publicGetFastbridgeInfo` | GET | `fastbridge/info` | 1 |
| `publicGetFundingRates` | GET | `funding-rates` | 1 |
| `publicGetWithdrawalDelay` | GET | `withdrawalDelay` | 1 |
| `publicPostSendTx` | POST | `sendTx` | 1 |
| `publicPostSendTxBatch` | POST | `sendTxBatch` | 1 |

## private

**Base URL**: `https://mainnet.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccountLimits` | GET | `accountLimits` | 1 |
| `privateGetAccountMetadata` | GET | `accountMetadata` | 1 |
| `privateGetPnl` | GET | `pnl` | 1 |
| `privateGetL1Metadata` | GET | `l1Metadata` | 1 |
| `privateGetLiquidations` | GET | `liquidations` | 1 |
| `privateGetPositionFunding` | GET | `positionFunding` | 1 |
| `privateGetPublicPoolsMetadata` | GET | `publicPoolsMetadata` | 1 |
| `privateGetAccountActiveOrders` | GET | `accountActiveOrders` | 1 |
| `privateGetAccountInactiveOrders` | GET | `accountInactiveOrders` | 1 |
| `privateGetExport` | GET | `export` | 1 |
| `privateGetTrades` | GET | `trades` | 1 |
| `privateGetAccountTxs` | GET | `accountTxs` | 1 |
| `privateGetDepositHistory` | GET | `deposit/history` | 1 |
| `privateGetTransferHistory` | GET | `transfer/history` | 1 |
| `privateGetWithdrawHistory` | GET | `withdraw/history` | 1 |
| `privateGetReferralPoints` | GET | `referral/points` | 1 |
| `privateGetTransferFeeInfo` | GET | `transferFeeInfo` | 1 |
| `privatePostChangeAccountTier` | POST | `changeAccountTier` | 1 |
| `privatePostNotificationAck` | POST | `notification/ack` | 1 |

