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
| `publicGetAssets` | GET | `assets` | 1 |
| `publicGetIndices` | GET | `indices` | 1 |
| `publicGetProducts` | GET | `products` | 1 |
| `publicGetProductsSymbol` | GET | `products/{symbol}` | 1 |
| `publicGetTickers` | GET | `tickers` | 1 |
| `publicGetTickersSymbol` | GET | `tickers/{symbol}` | 1 |
| `publicGetL2orderbookSymbol` | GET | `l2orderbook/{symbol}` | 1 |
| `publicGetTradesSymbol` | GET | `trades/{symbol}` | 1 |
| `publicGetStats` | GET | `stats` | 1 |
| `publicGetHistoryCandles` | GET | `history/candles` | 1 |
| `publicGetHistorySparklines` | GET | `history/sparklines` | 1 |
| `publicGetSettings` | GET | `settings` | 1 |

## private

**Base URL**: `https://api.delta.exchange`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetOrders` | GET | `orders` | 1 |
| `privateGetOrdersOrderId` | GET | `orders/{order_id}` | 1 |
| `privateGetOrdersClientOrderIdClientOid` | GET | `orders/client_order_id/{client_oid}` | 1 |
| `privateGetProductsProductIdOrdersLeverage` | GET | `products/{product_id}/orders/leverage` | 1 |
| `privateGetPositionsMargined` | GET | `positions/margined` | 1 |
| `privateGetPositions` | GET | `positions` | 1 |
| `privateGetOrdersHistory` | GET | `orders/history` | 1 |
| `privateGetFills` | GET | `fills` | 1 |
| `privateGetFillsHistoryDownloadCsv` | GET | `fills/history/download/csv` | 1 |
| `privateGetWalletBalances` | GET | `wallet/balances` | 1 |
| `privateGetWalletTransactions` | GET | `wallet/transactions` | 1 |
| `privateGetWalletTransactionsDownload` | GET | `wallet/transactions/download` | 1 |
| `privateGetWalletsSubAccountsTransferHistory` | GET | `wallets/sub_accounts_transfer_history` | 1 |
| `privateGetUsersTradingPreferences` | GET | `users/trading_preferences` | 1 |
| `privateGetSubAccounts` | GET | `sub_accounts` | 1 |
| `privateGetProfile` | GET | `profile` | 1 |
| `privateGetRateLimitsQuota` | GET | `rate_limits/quota` | 1 |
| `privateGetHeartbeat` | GET | `heartbeat` | 1 |
| `privateGetDepositsAddress` | GET | `deposits/address` | 1 |
| `privatePostOrders` | POST | `orders` | 1 |
| `privatePostOrdersBracket` | POST | `orders/bracket` | 1 |
| `privatePostOrdersBatch` | POST | `orders/batch` | 1 |
| `privatePostProductsProductIdOrdersLeverage` | POST | `products/{product_id}/orders/leverage` | 1 |
| `privatePostPositionsChangeMargin` | POST | `positions/change_margin` | 1 |
| `privatePostPositionsCloseAll` | POST | `positions/close_all` | 1 |
| `privatePostWalletsSubAccountBalanceTransfer` | POST | `wallets/sub_account_balance_transfer` | 1 |
| `privatePostHeartbeatCreate` | POST | `heartbeat/create` | 1 |
| `privatePostHeartbeat` | POST | `heartbeat` | 1 |
| `privatePostOrdersCancelAfter` | POST | `orders/cancel_after` | 1 |
| `privatePostOrdersLeverage` | POST | `orders/leverage` | 1 |
| `privatePutOrders` | PUT | `orders` | 1 |
| `privatePutOrdersBracket` | PUT | `orders/bracket` | 1 |
| `privatePutOrdersBatch` | PUT | `orders/batch` | 1 |
| `privatePutPositionsAutoTopup` | PUT | `positions/auto_topup` | 1 |
| `privatePutUsersUpdateMmp` | PUT | `users/update_mmp` | 1 |
| `privatePutUsersResetMmp` | PUT | `users/reset_mmp` | 1 |
| `privatePutUsersMarginMode` | PUT | `users/margin_mode` | 1 |
| `privateDeleteOrders` | DELETE | `orders` | 1 |
| `privateDeleteOrdersAll` | DELETE | `orders/all` | 1 |
| `privateDeleteOrdersBatch` | DELETE | `orders/batch` | 1 |

