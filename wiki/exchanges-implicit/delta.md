Every endpoint in `delta`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/delta) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetAssets`); the snake_case alias (`public_get_assets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetAssets`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const delta = new ccxt.delta ();
const response = await delta.publicGetAssets (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const delta = new ccxt.delta ();
const response = await delta.publicGetAssets (params);
```

#### **Python**

```python
import ccxt
delta = ccxt.delta()
response = delta.public_get_assets(params)
```

#### **PHP**

```php
$delta = new \ccxt\delta();
$response = $delta->public_get_assets($params);
```

#### **C#**

```csharp
using ccxt;
var delta = new Delta();
var response = await delta.publicGetAssets(parameters);
```

#### **Go**

```go
delta := ccxt.NewDelta(nil)
response := <-delta.PublicGetAssets(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official delta API documentation:** [docs.delta.exchange](https://docs.delta.exchange)

> 52 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.delta.exchange`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetAssets` | GET | `assets` |  |
| `publicGetIndices` | GET | `indices` |  |
| `publicGetProducts` | GET | `products` |  |
| `publicGetProductsSymbol` | GET | `products/{symbol}` |  |
| `publicGetTickers` | GET | `tickers` |  |
| `publicGetTickersSymbol` | GET | `tickers/{symbol}` |  |
| `publicGetL2orderbookSymbol` | GET | `l2orderbook/{symbol}` |  |
| `publicGetTradesSymbol` | GET | `trades/{symbol}` |  |
| `publicGetStats` | GET | `stats` |  |
| `publicGetHistoryCandles` | GET | `history/candles` |  |
| `publicGetHistorySparklines` | GET | `history/sparklines` |  |
| `publicGetSettings` | GET | `settings` |  |

## private

**Base URL**: `https://api.delta.exchange`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetOrders` | GET | `orders` |  |
| `privateGetOrdersOrderId` | GET | `orders/{order_id}` |  |
| `privateGetOrdersClientOrderIdClientOid` | GET | `orders/client_order_id/{client_oid}` |  |
| `privateGetProductsProductIdOrdersLeverage` | GET | `products/{product_id}/orders/leverage` |  |
| `privateGetPositionsMargined` | GET | `positions/margined` |  |
| `privateGetPositions` | GET | `positions` |  |
| `privateGetOrdersHistory` | GET | `orders/history` |  |
| `privateGetFills` | GET | `fills` |  |
| `privateGetFillsHistoryDownloadCsv` | GET | `fills/history/download/csv` |  |
| `privateGetWalletBalances` | GET | `wallet/balances` |  |
| `privateGetWalletTransactions` | GET | `wallet/transactions` |  |
| `privateGetWalletTransactionsDownload` | GET | `wallet/transactions/download` |  |
| `privateGetWalletsSubAccountsTransferHistory` | GET | `wallets/sub_accounts_transfer_history` |  |
| `privateGetUsersTradingPreferences` | GET | `users/trading_preferences` |  |
| `privateGetSubAccounts` | GET | `sub_accounts` |  |
| `privateGetProfile` | GET | `profile` |  |
| `privateGetRateLimitsQuota` | GET | `rate_limits/quota` |  |
| `privateGetHeartbeat` | GET | `heartbeat` |  |
| `privateGetDepositsAddress` | GET | `deposits/address` |  |
| `privatePostOrders` | POST | `orders` |  |
| `privatePostOrdersBracket` | POST | `orders/bracket` |  |
| `privatePostOrdersBatch` | POST | `orders/batch` |  |
| `privatePostProductsProductIdOrdersLeverage` | POST | `products/{product_id}/orders/leverage` |  |
| `privatePostPositionsChangeMargin` | POST | `positions/change_margin` |  |
| `privatePostPositionsCloseAll` | POST | `positions/close_all` |  |
| `privatePostWalletsSubAccountBalanceTransfer` | POST | `wallets/sub_account_balance_transfer` |  |
| `privatePostHeartbeatCreate` | POST | `heartbeat/create` |  |
| `privatePostHeartbeat` | POST | `heartbeat` |  |
| `privatePostOrdersCancelAfter` | POST | `orders/cancel_after` |  |
| `privatePostOrdersLeverage` | POST | `orders/leverage` |  |
| `privatePutOrders` | PUT | `orders` |  |
| `privatePutOrdersBracket` | PUT | `orders/bracket` |  |
| `privatePutOrdersBatch` | PUT | `orders/batch` |  |
| `privatePutPositionsAutoTopup` | PUT | `positions/auto_topup` |  |
| `privatePutUsersUpdateMmp` | PUT | `users/update_mmp` |  |
| `privatePutUsersResetMmp` | PUT | `users/reset_mmp` |  |
| `privatePutUsersMarginMode` | PUT | `users/margin_mode` |  |
| `privateDeleteOrders` | DELETE | `orders` |  |
| `privateDeleteOrdersAll` | DELETE | `orders/all` |  |
| `privateDeleteOrdersBatch` | DELETE | `orders/batch` |  |

