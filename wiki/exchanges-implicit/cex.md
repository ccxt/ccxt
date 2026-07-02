Every endpoint in `cex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/cex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicPostGetServerTime`); the snake_case alias (`public_post_get_server_time`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicPostGetServerTime`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const cex = new ccxt.cex ();
const response = await cex.publicPostGetServerTime (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const cex = new ccxt.cex ();
const response = await cex.publicPostGetServerTime (params);
```

#### **Python**

```python
import ccxt
cex = ccxt.cex()
response = cex.public_post_get_server_time(params)
```

#### **PHP**

```php
$cex = new \ccxt\cex();
$response = $cex->public_post_get_server_time($params);
```

#### **C#**

```csharp
using ccxt;
var cex = new Cex();
var response = await cex.publicPostGetServerTime(parameters);
```

#### **Go**

```go
cex := ccxt.NewCex(nil)
response := <-cex.PublicPostGetServerTime(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official cex API documentation:** [trade.cex.io](https://trade.cex.io/docs/)

> 28 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://trade.cex.io/api/spot/rest-public`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicPostGetServerTime` | POST | `get_server_time` | 1 |
| `publicPostGetPairsInfo` | POST | `get_pairs_info` | 1 |
| `publicPostGetCurrenciesInfo` | POST | `get_currencies_info` | 1 |
| `publicPostGetProcessingInfo` | POST | `get_processing_info` | 10 |
| `publicPostGetTicker` | POST | `get_ticker` | 1 |
| `publicPostGetTradeHistory` | POST | `get_trade_history` | 1 |
| `publicPostGetOrderBook` | POST | `get_order_book` | 1 |
| `publicPostGetCandles` | POST | `get_candles` | 1 |

## private

**Base URL**: `https://trade.cex.io/api/spot/rest`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostGetMyCurrentFee` | POST | `get_my_current_fee` | 5 |
| `privatePostGetFeeStrategy` | POST | `get_fee_strategy` | 1 |
| `privatePostGetMyVolume` | POST | `get_my_volume` | 5 |
| `privatePostDoCreateAccount` | POST | `do_create_account` | 1 |
| `privatePostGetMyAccountStatusV3` | POST | `get_my_account_status_v3` | 5 |
| `privatePostGetMyWalletBalance` | POST | `get_my_wallet_balance` | 5 |
| `privatePostGetMyOrders` | POST | `get_my_orders` | 5 |
| `privatePostDoMyNewOrder` | POST | `do_my_new_order` | 1 |
| `privatePostDoCancelMyOrder` | POST | `do_cancel_my_order` | 1 |
| `privatePostDoCancelAllOrders` | POST | `do_cancel_all_orders` | 5 |
| `privatePostGetOrderBook` | POST | `get_order_book` | 1 |
| `privatePostGetCandles` | POST | `get_candles` | 1 |
| `privatePostGetTradeHistory` | POST | `get_trade_history` | 1 |
| `privatePostGetMyTransactionHistory` | POST | `get_my_transaction_history` | 1 |
| `privatePostGetMyFundingHistory` | POST | `get_my_funding_history` | 5 |
| `privatePostDoMyInternalTransfer` | POST | `do_my_internal_transfer` | 1 |
| `privatePostGetProcessingInfo` | POST | `get_processing_info` | 10 |
| `privatePostGetDepositAddress` | POST | `get_deposit_address` | 5 |
| `privatePostDoDepositFundsFromWallet` | POST | `do_deposit_funds_from_wallet` | 1 |
| `privatePostDoWithdrawalFundsToWallet` | POST | `do_withdrawal_funds_to_wallet` | 1 |

