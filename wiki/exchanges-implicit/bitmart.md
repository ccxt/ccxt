Every endpoint in `bitmart`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitmart) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetSystemTime`); the snake_case alias (`public_get_system_time`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetSystemTime`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bitmart = new ccxt.bitmart ();
const response = await bitmart.publicGetSystemTime (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bitmart = new ccxt.bitmart ();
const response = await bitmart.publicGetSystemTime (params);
```

#### **Python**

```python
import ccxt
bitmart = ccxt.bitmart()
response = bitmart.public_get_system_time(params)
```

#### **PHP**

```php
$bitmart = new \ccxt\bitmart();
$response = $bitmart->public_get_system_time($params);
```

#### **C#**

```csharp
using ccxt;
var bitmart = new Bitmart();
var response = await bitmart.publicGetSystemTime(parameters);
```

#### **Go**

```go
bitmart := ccxt.NewBitmart(nil)
response := <-bitmart.PublicGetSystemTime(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bitmart API documentation:** [developer-pro.bitmart.com](https://developer-pro.bitmart.com/)

> 120 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetSystemTime` | GET | `system/time` | 3 |
| `publicGetSystemService` | GET | `system/service` | 3 |
| `publicGetSpotV1Currencies` | GET | `spot/v1/currencies` | 7.5 |
| `publicGetSpotV1Symbols` | GET | `spot/v1/symbols` | 7.5 |
| `publicGetSpotV1SymbolsDetails` | GET | `spot/v1/symbols/details` | 5 |
| `publicGetSpotQuotationV3Tickers` | GET | `spot/quotation/v3/tickers` | 6 |
| `publicGetSpotQuotationV3Ticker` | GET | `spot/quotation/v3/ticker` | 4 |
| `publicGetSpotQuotationV3LiteKlines` | GET | `spot/quotation/v3/lite-klines` | 5 |
| `publicGetSpotQuotationV3Klines` | GET | `spot/quotation/v3/klines` | 7 |
| `publicGetSpotQuotationV3Books` | GET | `spot/quotation/v3/books` | 4 |
| `publicGetSpotQuotationV3Trades` | GET | `spot/quotation/v3/trades` | 4 |
| `publicGetSpotV1Ticker` | GET | `spot/v1/ticker` | 5 |
| `publicGetSpotV2Ticker` | GET | `spot/v2/ticker` | 30 |
| `publicGetSpotV1TickerDetail` | GET | `spot/v1/ticker_detail` | 5 |
| `publicGetSpotV1Steps` | GET | `spot/v1/steps` | 30 |
| `publicGetSpotV1SymbolsKline` | GET | `spot/v1/symbols/kline` | 6 |
| `publicGetSpotV1SymbolsBook` | GET | `spot/v1/symbols/book` | 5 |
| `publicGetSpotV1SymbolsTrades` | GET | `spot/v1/symbols/trades` | 5 |
| `publicGetContractV1Tickers` | GET | `contract/v1/tickers` | 15 |
| `publicGetContractPublicDetails` | GET | `contract/public/details` | 5 |
| `publicGetContractPublicDepth` | GET | `contract/public/depth` | 5 |
| `publicGetContractPublicOpenInterest` | GET | `contract/public/open-interest` | 30 |
| `publicGetContractPublicFundingRate` | GET | `contract/public/funding-rate` | 30 |
| `publicGetContractPublicFundingRateHistory` | GET | `contract/public/funding-rate-history` | 30 |
| `publicGetContractPublicKline` | GET | `contract/public/kline` | 6 |
| `publicGetAccountV1Currencies` | GET | `account/v1/currencies` | 30 |
| `publicGetContractPublicMarkpriceKline` | GET | `contract/public/markprice-kline` | 5 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccountSubAccountV1TransferList` | GET | `account/sub-account/v1/transfer-list` | 7.5 |
| `privateGetAccountSubAccountV1TransferHistory` | GET | `account/sub-account/v1/transfer-history` | 7.5 |
| `privateGetAccountSubAccountMainV1Wallet` | GET | `account/sub-account/main/v1/wallet` | 5 |
| `privateGetAccountSubAccountMainV1SubaccountList` | GET | `account/sub-account/main/v1/subaccount-list` | 7.5 |
| `privateGetAccountContractSubAccountMainV1Wallet` | GET | `account/contract/sub-account/main/v1/wallet` | 5 |
| `privateGetAccountContractSubAccountMainV1TransferList` | GET | `account/contract/sub-account/main/v1/transfer-list` | 7.5 |
| `privateGetAccountContractSubAccountV1TransferHistory` | GET | `account/contract/sub-account/v1/transfer-history` | 7.5 |
| `privateGetAccountV1Wallet` | GET | `account/v1/wallet` | 5 |
| `privateGetAccountV1Currencies` | GET | `account/v1/currencies` | 30 |
| `privateGetSpotV1Wallet` | GET | `spot/v1/wallet` | 5 |
| `privateGetAccountV1DepositAddress` | GET | `account/v1/deposit/address` | 30 |
| `privateGetAccountV1WithdrawCharge` | GET | `account/v1/withdraw/charge` | 32 |
| `privateGetAccountV2DepositWithdrawHistory` | GET | `account/v2/deposit-withdraw/history` | 7.5 |
| `privateGetAccountV1DepositWithdrawDetail` | GET | `account/v1/deposit-withdraw/detail` | 7.5 |
| `privateGetAccountV1WithdrawAddressList` | GET | `account/v1/withdraw/address/list` | 30 |
| `privateGetSpotV1OrderDetail` | GET | `spot/v1/order_detail` | 1 |
| `privateGetSpotV2Orders` | GET | `spot/v2/orders` | 5 |
| `privateGetSpotV1Trades` | GET | `spot/v1/trades` | 5 |
| `privateGetSpotV2Trades` | GET | `spot/v2/trades` | 4 |
| `privateGetSpotV3Orders` | GET | `spot/v3/orders` | 5 |
| `privateGetSpotV2OrderDetail` | GET | `spot/v2/order_detail` | 1 |
| `privateGetSpotV1MarginIsolatedBorrowRecord` | GET | `spot/v1/margin/isolated/borrow_record` | 1 |
| `privateGetSpotV1MarginIsolatedRepayRecord` | GET | `spot/v1/margin/isolated/repay_record` | 1 |
| `privateGetSpotV1MarginIsolatedPairs` | GET | `spot/v1/margin/isolated/pairs` | 30 |
| `privateGetSpotV1MarginIsolatedAccount` | GET | `spot/v1/margin/isolated/account` | 5 |
| `privateGetSpotV1TradeFee` | GET | `spot/v1/trade_fee` | 30 |
| `privateGetSpotV1UserFee` | GET | `spot/v1/user_fee` | 30 |
| `privateGetSpotV1BrokerRebate` | GET | `spot/v1/broker/rebate` | 1 |
| `privateGetContractPrivateAssetsDetail` | GET | `contract/private/assets-detail` | 5 |
| `privateGetContractPrivateOrder` | GET | `contract/private/order` | 1.2 |
| `privateGetContractPrivateOrderHistory` | GET | `contract/private/order-history` | 10 |
| `privateGetContractPrivatePosition` | GET | `contract/private/position` | 10 |
| `privateGetContractPrivatePositionV2` | GET | `contract/private/position-v2` | 10 |
| `privateGetContractPrivateGetOpenOrders` | GET | `contract/private/get-open-orders` | 1.2 |
| `privateGetContractPrivateCurrentPlanOrder` | GET | `contract/private/current-plan-order` | 1.2 |
| `privateGetContractPrivateTrades` | GET | `contract/private/trades` | 10 |
| `privateGetContractPrivatePositionRisk` | GET | `contract/private/position-risk` | 10 |
| `privateGetContractPrivateAffilateRebateList` | GET | `contract/private/affilate/rebate-list` | 10 |
| `privateGetContractPrivateAffilateTradeList` | GET | `contract/private/affilate/trade-list` | 10 |
| `privateGetContractPrivateTransactionHistory` | GET | `contract/private/transaction-history` | 10 |
| `privateGetContractPrivateGetPositionMode` | GET | `contract/private/get-position-mode` | 1 |
| `privatePostAccountSubAccountMainV1SubToMain` | POST | `account/sub-account/main/v1/sub-to-main` | 30 |
| `privatePostAccountSubAccountSubV1SubToMain` | POST | `account/sub-account/sub/v1/sub-to-main` | 30 |
| `privatePostAccountSubAccountMainV1MainToSub` | POST | `account/sub-account/main/v1/main-to-sub` | 30 |
| `privatePostAccountSubAccountSubV1SubToSub` | POST | `account/sub-account/sub/v1/sub-to-sub` | 30 |
| `privatePostAccountSubAccountMainV1SubToSub` | POST | `account/sub-account/main/v1/sub-to-sub` | 30 |
| `privatePostAccountContractSubAccountMainV1SubToMain` | POST | `account/contract/sub-account/main/v1/sub-to-main` | 7.5 |
| `privatePostAccountContractSubAccountMainV1MainToSub` | POST | `account/contract/sub-account/main/v1/main-to-sub` | 7.5 |
| `privatePostAccountContractSubAccountSubV1SubToMain` | POST | `account/contract/sub-account/sub/v1/sub-to-main` | 7.5 |
| `privatePostAccountV1WithdrawApply` | POST | `account/v1/withdraw/apply` | 7.5 |
| `privatePostSpotV1SubmitOrder` | POST | `spot/v1/submit_order` | 1 |
| `privatePostSpotV1BatchOrders` | POST | `spot/v1/batch_orders` | 1 |
| `privatePostSpotV2CancelOrder` | POST | `spot/v2/cancel_order` | 1 |
| `privatePostSpotV1CancelOrders` | POST | `spot/v1/cancel_orders` | 15 |
| `privatePostSpotV4QueryOrder` | POST | `spot/v4/query/order` | 1 |
| `privatePostSpotV4QueryClientOrder` | POST | `spot/v4/query/client-order` | 1 |
| `privatePostSpotV4QueryOpenOrders` | POST | `spot/v4/query/open-orders` | 5 |
| `privatePostSpotV4QueryHistoryOrders` | POST | `spot/v4/query/history-orders` | 5 |
| `privatePostSpotV4QueryTrades` | POST | `spot/v4/query/trades` | 5 |
| `privatePostSpotV4QueryOrderTrades` | POST | `spot/v4/query/order-trades` | 5 |
| `privatePostSpotV4CancelOrders` | POST | `spot/v4/cancel_orders` | 3 |
| `privatePostSpotV4CancelAll` | POST | `spot/v4/cancel_all` | 90 |
| `privatePostSpotV4BatchOrders` | POST | `spot/v4/batch_orders` | 3 |
| `privatePostSpotV4AlgoSubmitOrder` | POST | `spot/v4/algo/submit_order` | 6 |
| `privatePostSpotV4AlgoCancelOrder` | POST | `spot/v4/algo/cancel_order` | 6 |
| `privatePostSpotV4AlgoCancelAll` | POST | `spot/v4/algo/cancel_all` | 12 |
| `privatePostSpotV4QueryAlgoOrder` | POST | `spot/v4/query/algo/order` | 1.5 |
| `privatePostSpotV4QueryAlgoClientOrder` | POST | `spot/v4/query/algo/client-order` | 1.5 |
| `privatePostSpotV4QueryAlgoOpenOrders` | POST | `spot/v4/query/algo/open-orders` | 3 |
| `privatePostSpotV4QueryAlgoHistoryOrders` | POST | `spot/v4/query/algo/history-orders` | 3 |
| `privatePostSpotV3CancelOrder` | POST | `spot/v3/cancel_order` | 1 |
| `privatePostSpotV2BatchOrders` | POST | `spot/v2/batch_orders` | 1 |
| `privatePostSpotV2SubmitOrder` | POST | `spot/v2/submit_order` | 1 |
| `privatePostSpotV1MarginSubmitOrder` | POST | `spot/v1/margin/submit_order` | 1.5 |
| `privatePostSpotV1MarginIsolatedBorrow` | POST | `spot/v1/margin/isolated/borrow` | 30 |
| `privatePostSpotV1MarginIsolatedRepay` | POST | `spot/v1/margin/isolated/repay` | 30 |
| `privatePostSpotV1MarginIsolatedTransfer` | POST | `spot/v1/margin/isolated/transfer` | 30 |
| `privatePostAccountV1TransferContractList` | POST | `account/v1/transfer-contract-list` | 60 |
| `privatePostAccountV1TransferContract` | POST | `account/v1/transfer-contract` | 60 |
| `privatePostContractPrivateSubmitOrder` | POST | `contract/private/submit-order` | 2.5 |
| `privatePostContractPrivateCancelOrder` | POST | `contract/private/cancel-order` | 1.5 |
| `privatePostContractPrivateCancelOrders` | POST | `contract/private/cancel-orders` | 30 |
| `privatePostContractPrivateSubmitPlanOrder` | POST | `contract/private/submit-plan-order` | 2.5 |
| `privatePostContractPrivateCancelPlanOrder` | POST | `contract/private/cancel-plan-order` | 1.5 |
| `privatePostContractPrivateSubmitLeverage` | POST | `contract/private/submit-leverage` | 2.5 |
| `privatePostContractPrivateSubmitTpSlOrder` | POST | `contract/private/submit-tp-sl-order` | 2.5 |
| `privatePostContractPrivateModifyPlanOrder` | POST | `contract/private/modify-plan-order` | 2.5 |
| `privatePostContractPrivateModifyPresetPlanOrder` | POST | `contract/private/modify-preset-plan-order` | 2.5 |
| `privatePostContractPrivateModifyLimitOrder` | POST | `contract/private/modify-limit-order` | 2.5 |
| `privatePostContractPrivateModifyTpSlOrder` | POST | `contract/private/modify-tp-sl-order` | 2.5 |
| `privatePostContractPrivateSubmitTrailOrder` | POST | `contract/private/submit-trail-order` | 2.5 |
| `privatePostContractPrivateCancelTrailOrder` | POST | `contract/private/cancel-trail-order` | 1.5 |
| `privatePostContractPrivateSetPositionMode` | POST | `contract/private/set-position-mode` | 1 |

