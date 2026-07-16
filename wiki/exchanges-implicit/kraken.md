Every endpoint in `kraken`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/kraken) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `zendeskGet360000292886`); the snake_case alias (`zendesk_get_360000292886`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`ZendeskGet360000292886`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const kraken = new ccxt.kraken ();
const response = await kraken.zendeskGet360000292886 (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const kraken = new ccxt.kraken ();
const response = await kraken.zendeskGet360000292886 (params);
```

#### **Python**

```python
import ccxt
kraken = ccxt.kraken()
response = kraken.zendesk_get_360000292886(params)
```

#### **PHP**

```php
$kraken = new \ccxt\kraken();
$response = $kraken->zendesk_get_360000292886($params);
```

#### **C#**

```csharp
using ccxt;
var kraken = new Kraken();
var response = await kraken.zendeskGet360000292886(parameters);
```

#### **Go**

```go
kraken := ccxt.NewKraken(nil)
response := <-kraken.ZendeskGet360000292886(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official kraken API documentation:** [docs.kraken.com](https://docs.kraken.com/api-reference/)

> 61 implicit endpoints across 3 access groups.

## zendesk

**Base URL**: `https://kraken.zendesk.com/api/v2/help_center/en-us/articles`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `zendeskGet360000292886` | GET | `360000292886` |  |
| `zendeskGet201893608` | GET | `201893608` |  |

## public

**Base URL**: `https://api.kraken.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetTime` | GET | `Time` | 1 |
| `publicGetSystemStatus` | GET | `SystemStatus` | 1 |
| `publicGetAssets` | GET | `Assets` | 1 |
| `publicGetAssetPairs` | GET | `AssetPairs` | 1 |
| `publicGetTicker` | GET | `Ticker` | 1 |
| `publicGetOHLC` | GET | `OHLC` | 1.2 |
| `publicGetDepth` | GET | `Depth` | 1.2 |
| `publicGetGroupedBook` | GET | `GroupedBook` | 1.2 |
| `publicGetTrades` | GET | `Trades` | 1.2 |
| `publicGetSpread` | GET | `Spread` | 1 |
| `publicGetPreTrade` | GET | `PreTrade` | 1 |
| `publicGetPostTrade` | GET | `PostTrade` | 1 |

## private

**Base URL**: `https://api.kraken.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostLevel3` | POST | `Level3` | 1.2 |
| `privatePostBalance` | POST | `Balance` | 3 |
| `privatePostBalanceEx` | POST | `BalanceEx` | 3 |
| `privatePostCreditLines` | POST | `CreditLines` | 3 |
| `privatePostTradeBalance` | POST | `TradeBalance` | 3 |
| `privatePostOpenOrders` | POST | `OpenOrders` | 3 |
| `privatePostClosedOrders` | POST | `ClosedOrders` | 3 |
| `privatePostQueryOrders` | POST | `QueryOrders` | 3 |
| `privatePostOrderAmends` | POST | `OrderAmends` | 3 |
| `privatePostTradesHistory` | POST | `TradesHistory` | 6 |
| `privatePostQueryTrades` | POST | `QueryTrades` | 3 |
| `privatePostOpenPositions` | POST | `OpenPositions` | 3 |
| `privatePostLedgers` | POST | `Ledgers` | 6 |
| `privatePostQueryLedgers` | POST | `QueryLedgers` | 3 |
| `privatePostTradeVolume` | POST | `TradeVolume` | 3 |
| `privatePostAddExport` | POST | `AddExport` | 3 |
| `privatePostExportStatus` | POST | `ExportStatus` | 3 |
| `privatePostRetrieveExport` | POST | `RetrieveExport` | 3 |
| `privatePostRemoveExport` | POST | `RemoveExport` | 3 |
| `privatePostGetApiKeyInfo` | POST | `GetApiKeyInfo` | 3 |
| `privatePostAddOrder` | POST | `AddOrder` | 0 |
| `privatePostAmendOrder` | POST | `AmendOrder` | 0 |
| `privatePostCancelOrder` | POST | `CancelOrder` | 0 |
| `privatePostCancelAll` | POST | `CancelAll` | 3 |
| `privatePostCancelAllOrdersAfter` | POST | `CancelAllOrdersAfter` | 3 |
| `privatePostGetWebSocketsToken` | POST | `GetWebSocketsToken` | 3 |
| `privatePostAddOrderBatch` | POST | `AddOrderBatch` | 0 |
| `privatePostCancelOrderBatch` | POST | `CancelOrderBatch` | 0 |
| `privatePostEditOrder` | POST | `EditOrder` | 0 |
| `privatePostDepositMethods` | POST | `DepositMethods` | 3 |
| `privatePostDepositAddresses` | POST | `DepositAddresses` | 3 |
| `privatePostDepositStatus` | POST | `DepositStatus` | 3 |
| `privatePostWithdrawMethods` | POST | `WithdrawMethods` | 3 |
| `privatePostWithdrawAddresses` | POST | `WithdrawAddresses` | 3 |
| `privatePostWithdrawInfo` | POST | `WithdrawInfo` | 3 |
| `privatePostWithdraw` | POST | `Withdraw` | 3 |
| `privatePostWithdrawStatus` | POST | `WithdrawStatus` | 3 |
| `privatePostWithdrawCancel` | POST | `WithdrawCancel` | 3 |
| `privatePostWalletTransfer` | POST | `WalletTransfer` | 3 |
| `privatePostCreateSubaccount` | POST | `CreateSubaccount` | 3 |
| `privatePostAccountTransfer` | POST | `AccountTransfer` | 3 |
| `privatePostEarnAllocate` | POST | `Earn/Allocate` | 3 |
| `privatePostEarnDeallocate` | POST | `Earn/Deallocate` | 3 |
| `privatePostEarnAllocateStatus` | POST | `Earn/AllocateStatus` | 3 |
| `privatePostEarnDeallocateStatus` | POST | `Earn/DeallocateStatus` | 3 |
| `privatePostEarnStrategies` | POST | `Earn/Strategies` | 3 |
| `privatePostEarnAllocations` | POST | `Earn/Allocations` | 3 |

