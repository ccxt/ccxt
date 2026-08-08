Every endpoint in `exmo`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/exmo) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `webGetCtrlFeesAndLimits`); the snake_case alias (`web_get_ctrl_feesandlimits`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`WebGetCtrlFeesAndLimits`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const exmo = new ccxt.exmo ();
const response = await exmo.webGetCtrlFeesAndLimits (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exmo = new ccxt.exmo ();
const response = await exmo.webGetCtrlFeesAndLimits (params);
```

#### **Python**

```python
import ccxt
exmo = ccxt.exmo()
response = exmo.web_get_ctrl_feesandlimits(params)
```

#### **PHP**

```php
$exmo = new \ccxt\exmo();
$response = $exmo->web_get_ctrl_feesandlimits($params);
```

#### **C#**

```csharp
using ccxt;
var exmo = new Exmo();
var response = await exmo.webGetCtrlFeesAndLimits(parameters);
```

#### **Go**

```go
exmo := ccxt.NewExmo(nil)
response := <-exmo.WebGetCtrlFeesAndLimits(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official exmo API documentation:** [exmo.me](https://exmo.me/en/api_doc?ref=131685)

> 51 implicit endpoints across 3 access groups.

## web

**Base URL**: `https://exmo.me`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `webGetCtrlFeesAndLimits` | GET | `ctrl/feesAndLimits` | 1 |
| `webGetEnDocsFees` | GET | `en/docs/fees` | 1 |

## public

**Base URL**: `https://api.exmo.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetCurrency` | GET | `currency` | 1 |
| `publicGetCurrencyListExtended` | GET | `currency/list/extended` | 1 |
| `publicGetOrderBook` | GET | `order_book` | 1 |
| `publicGetPairSettings` | GET | `pair_settings` | 1 |
| `publicGetTicker` | GET | `ticker` | 1 |
| `publicGetTrades` | GET | `trades` | 1 |
| `publicGetCandlesHistory` | GET | `candles_history` | 1 |
| `publicGetRequiredAmount` | GET | `required_amount` | 1 |
| `publicGetPaymentsProvidersCryptoList` | GET | `payments/providers/crypto/list` | 1 |

## private

**Base URL**: `https://api.exmo.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostUserInfo` | POST | `user_info` | 1 |
| `privatePostOrderCreate` | POST | `order_create` | 1 |
| `privatePostOrderCancel` | POST | `order_cancel` | 1 |
| `privatePostStopMarketOrderCreate` | POST | `stop_market_order_create` | 1 |
| `privatePostStopMarketOrderCancel` | POST | `stop_market_order_cancel` | 1 |
| `privatePostUserOpenOrders` | POST | `user_open_orders` | 1 |
| `privatePostUserTrades` | POST | `user_trades` | 1 |
| `privatePostUserCancelledOrders` | POST | `user_cancelled_orders` | 1 |
| `privatePostOrderTrades` | POST | `order_trades` | 1 |
| `privatePostDepositAddress` | POST | `deposit_address` | 1 |
| `privatePostWithdrawCrypt` | POST | `withdraw_crypt` | 1 |
| `privatePostWithdrawGetTxid` | POST | `withdraw_get_txid` | 1 |
| `privatePostExcodeCreate` | POST | `excode_create` | 1 |
| `privatePostExcodeLoad` | POST | `excode_load` | 1 |
| `privatePostCodeCheck` | POST | `code_check` | 1 |
| `privatePostWalletHistory` | POST | `wallet_history` | 1 |
| `privatePostWalletOperations` | POST | `wallet_operations` | 1 |
| `privatePostMarginUserOrderCreate` | POST | `margin/user/order/create` | 1 |
| `privatePostMarginUserOrderUpdate` | POST | `margin/user/order/update` | 1 |
| `privatePostMarginUserOrderCancel` | POST | `margin/user/order/cancel` | 1 |
| `privatePostMarginUserPositionClose` | POST | `margin/user/position/close` | 1 |
| `privatePostMarginUserPositionMarginAdd` | POST | `margin/user/position/margin_add` | 1 |
| `privatePostMarginUserPositionMarginRemove` | POST | `margin/user/position/margin_remove` | 1 |
| `privatePostMarginCurrencyList` | POST | `margin/currency/list` | 1 |
| `privatePostMarginPairList` | POST | `margin/pair/list` | 1 |
| `privatePostMarginSettings` | POST | `margin/settings` | 1 |
| `privatePostMarginFundingList` | POST | `margin/funding/list` | 1 |
| `privatePostMarginUserInfo` | POST | `margin/user/info` | 1 |
| `privatePostMarginUserOrderList` | POST | `margin/user/order/list` | 1 |
| `privatePostMarginUserOrderHistory` | POST | `margin/user/order/history` | 1 |
| `privatePostMarginUserOrderTrades` | POST | `margin/user/order/trades` | 1 |
| `privatePostMarginUserOrderMaxQuantity` | POST | `margin/user/order/max_quantity` | 1 |
| `privatePostMarginUserPositionList` | POST | `margin/user/position/list` | 1 |
| `privatePostMarginUserPositionMarginRemoveInfo` | POST | `margin/user/position/margin_remove_info` | 1 |
| `privatePostMarginUserPositionMarginAddInfo` | POST | `margin/user/position/margin_add_info` | 1 |
| `privatePostMarginUserWalletList` | POST | `margin/user/wallet/list` | 1 |
| `privatePostMarginUserWalletHistory` | POST | `margin/user/wallet/history` | 1 |
| `privatePostMarginUserTradeList` | POST | `margin/user/trade/list` | 1 |
| `privatePostMarginTrades` | POST | `margin/trades` | 1 |
| `privatePostMarginLiquidationFeed` | POST | `margin/liquidation/feed` | 1 |

