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
| `webGetCtrlFeesAndLimits` | GET | `ctrl/feesAndLimits` |  |
| `webGetEnDocsFees` | GET | `en/docs/fees` |  |

## public

**Base URL**: `https://api.exmo.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetCurrency` | GET | `currency` |  |
| `publicGetCurrencyListExtended` | GET | `currency/list/extended` |  |
| `publicGetOrderBook` | GET | `order_book` |  |
| `publicGetPairSettings` | GET | `pair_settings` |  |
| `publicGetTicker` | GET | `ticker` |  |
| `publicGetTrades` | GET | `trades` |  |
| `publicGetCandlesHistory` | GET | `candles_history` |  |
| `publicGetRequiredAmount` | GET | `required_amount` |  |
| `publicGetPaymentsProvidersCryptoList` | GET | `payments/providers/crypto/list` |  |

## private

**Base URL**: `https://api.exmo.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostUserInfo` | POST | `user_info` |  |
| `privatePostOrderCreate` | POST | `order_create` |  |
| `privatePostOrderCancel` | POST | `order_cancel` |  |
| `privatePostStopMarketOrderCreate` | POST | `stop_market_order_create` |  |
| `privatePostStopMarketOrderCancel` | POST | `stop_market_order_cancel` |  |
| `privatePostUserOpenOrders` | POST | `user_open_orders` |  |
| `privatePostUserTrades` | POST | `user_trades` |  |
| `privatePostUserCancelledOrders` | POST | `user_cancelled_orders` |  |
| `privatePostOrderTrades` | POST | `order_trades` |  |
| `privatePostDepositAddress` | POST | `deposit_address` |  |
| `privatePostWithdrawCrypt` | POST | `withdraw_crypt` |  |
| `privatePostWithdrawGetTxid` | POST | `withdraw_get_txid` |  |
| `privatePostExcodeCreate` | POST | `excode_create` |  |
| `privatePostExcodeLoad` | POST | `excode_load` |  |
| `privatePostCodeCheck` | POST | `code_check` |  |
| `privatePostWalletHistory` | POST | `wallet_history` |  |
| `privatePostWalletOperations` | POST | `wallet_operations` |  |
| `privatePostMarginUserOrderCreate` | POST | `margin/user/order/create` |  |
| `privatePostMarginUserOrderUpdate` | POST | `margin/user/order/update` |  |
| `privatePostMarginUserOrderCancel` | POST | `margin/user/order/cancel` |  |
| `privatePostMarginUserPositionClose` | POST | `margin/user/position/close` |  |
| `privatePostMarginUserPositionMarginAdd` | POST | `margin/user/position/margin_add` |  |
| `privatePostMarginUserPositionMarginRemove` | POST | `margin/user/position/margin_remove` |  |
| `privatePostMarginCurrencyList` | POST | `margin/currency/list` |  |
| `privatePostMarginPairList` | POST | `margin/pair/list` |  |
| `privatePostMarginSettings` | POST | `margin/settings` |  |
| `privatePostMarginFundingList` | POST | `margin/funding/list` |  |
| `privatePostMarginUserInfo` | POST | `margin/user/info` |  |
| `privatePostMarginUserOrderList` | POST | `margin/user/order/list` |  |
| `privatePostMarginUserOrderHistory` | POST | `margin/user/order/history` |  |
| `privatePostMarginUserOrderTrades` | POST | `margin/user/order/trades` |  |
| `privatePostMarginUserOrderMaxQuantity` | POST | `margin/user/order/max_quantity` |  |
| `privatePostMarginUserPositionList` | POST | `margin/user/position/list` |  |
| `privatePostMarginUserPositionMarginRemoveInfo` | POST | `margin/user/position/margin_remove_info` |  |
| `privatePostMarginUserPositionMarginAddInfo` | POST | `margin/user/position/margin_add_info` |  |
| `privatePostMarginUserWalletList` | POST | `margin/user/wallet/list` |  |
| `privatePostMarginUserWalletHistory` | POST | `margin/user/wallet/history` |  |
| `privatePostMarginUserTradeList` | POST | `margin/user/trade/list` |  |
| `privatePostMarginTrades` | POST | `margin/trades` |  |
| `privatePostMarginLiquidationFeed` | POST | `margin/liquidation/feed` |  |

