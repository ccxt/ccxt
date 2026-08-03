Every endpoint in `blofin`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/blofin) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetMarketInstruments`); the snake_case alias (`public_get_market_instruments`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetMarketInstruments`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const blofin = new ccxt.blofin ();
const response = await blofin.publicGetMarketInstruments (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const blofin = new ccxt.blofin ();
const response = await blofin.publicGetMarketInstruments (params);
```

#### **Python**

```python
import ccxt
blofin = ccxt.blofin()
response = blofin.public_get_market_instruments(params)
```

#### **PHP**

```php
$blofin = new \ccxt\blofin();
$response = $blofin->public_get_market_instruments($params);
```

#### **C#**

```csharp
using ccxt;
var blofin = new Blofin();
var response = await blofin.publicGetMarketInstruments(parameters);
```

#### **Go**

```go
blofin := ccxt.NewBlofin(nil)
response := <-blofin.PublicGetMarketInstruments(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official blofin API documentation:** [blofin.com](https://blofin.com/docs)

> 79 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetMarketInstruments` | GET | `market/instruments` | 1 |
| `publicGetMarketTickers` | GET | `market/tickers` | 1 |
| `publicGetMarketBooks` | GET | `market/books` | 1 |
| `publicGetMarketTrades` | GET | `market/trades` | 1 |
| `publicGetMarketMarkPrice` | GET | `market/mark-price` | 1 |
| `publicGetMarketFundingRate` | GET | `market/funding-rate` | 1 |
| `publicGetMarketFundingRateHistory` | GET | `market/funding-rate-history` | 1 |
| `publicGetMarketCandles` | GET | `market/candles` | 1 |
| `publicGetMarketIndexCandles` | GET | `market/index-candles` | 1 |
| `publicGetMarketMarkPriceCandles` | GET | `market/mark-price-candles` | 1 |
| `publicGetMarketPositionTiers` | GET | `market/position-tiers` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAssetBalances` | GET | `asset/balances` | 1 |
| `privateGetAssetBills` | GET | `asset/bills` | 1 |
| `privateGetAssetWithdrawalHistory` | GET | `asset/withdrawal-history` | 1 |
| `privateGetAssetDepositHistory` | GET | `asset/deposit-history` | 1 |
| `privateGetAccountConfig` | GET | `account/config` | 1 |
| `privateGetAssetCurrencies` | GET | `asset/currencies` | 1 |
| `privateGetAccountBalance` | GET | `account/balance` | 1 |
| `privateGetAccountPositions` | GET | `account/positions` | 1 |
| `privateGetAccountPositionsHistory` | GET | `account/positions-history` | 1 |
| `privateGetAccountMarginMode` | GET | `account/margin-mode` | 1 |
| `privateGetAccountPositionMode` | GET | `account/position-mode` | 1 |
| `privateGetAccountLeverageInfo` | GET | `account/leverage-info` | 1 |
| `privateGetAccountBatchLeverageInfo` | GET | `account/batch-leverage-info` | 1 |
| `privateGetTradeOrdersPending` | GET | `trade/orders-pending` | 1 |
| `privateGetTradeOrderDetail` | GET | `trade/order-detail` | 1 |
| `privateGetTradeOrdersTpslPending` | GET | `trade/orders-tpsl-pending` | 1 |
| `privateGetTradeOrderTpslDetail` | GET | `trade/order-tpsl-detail` | 1 |
| `privateGetTradeOrdersAlgoPending` | GET | `trade/orders-algo-pending` | 1 |
| `privateGetTradeOrdersHistory` | GET | `trade/orders-history` | 1 |
| `privateGetTradeOrdersTpslHistory` | GET | `trade/orders-tpsl-history` | 1 |
| `privateGetTradeOrdersAlgoHistory` | GET | `trade/orders-algo-history` | 1 |
| `privateGetTradeFillsHistory` | GET | `trade/fills-history` | 1 |
| `privateGetTradeOrderPriceRange` | GET | `trade/order/price-range` | 1 |
| `privateGetAffiliateBasic` | GET | `affiliate/basic` | 1 |
| `privateGetAffiliateReferralCode` | GET | `affiliate/referral-code` | 1 |
| `privateGetAffiliateInvitees` | GET | `affiliate/invitees` | 1 |
| `privateGetAffiliateSubInvitees` | GET | `affiliate/sub-invitees` | 1 |
| `privateGetAffiliateSubAffiliates` | GET | `affiliate/sub-affiliates` | 1 |
| `privateGetAffiliateInviteesDailyInfo` | GET | `affiliate/invitees/daily/info` | 1 |
| `privateGetCopytradingInstruments` | GET | `copytrading/instruments` | 1 |
| `privateGetCopytradingConfig` | GET | `copytrading/config` | 1 |
| `privateGetCopytradingAccountBalance` | GET | `copytrading/account/balance` | 1 |
| `privateGetCopytradingAccountPositionsByOrder` | GET | `copytrading/account/positions-by-order` | 1 |
| `privateGetCopytradingAccountPositionsDetailsByOrder` | GET | `copytrading/account/positions-details-by-order` | 1 |
| `privateGetCopytradingAccountPositionsByContract` | GET | `copytrading/account/positions-by-contract` | 1 |
| `privateGetCopytradingAccountPositionMode` | GET | `copytrading/account/position-mode` | 1 |
| `privateGetCopytradingAccountLeverageInfo` | GET | `copytrading/account/leverage-info` | 1 |
| `privateGetCopytradingTradeOrdersPending` | GET | `copytrading/trade/orders-pending` | 1 |
| `privateGetCopytradingTradePendingTpslByContract` | GET | `copytrading/trade/pending-tpsl-by-contract` | 1 |
| `privateGetCopytradingTradePositionHistoryByOrder` | GET | `copytrading/trade/position-history-by-order` | 1 |
| `privateGetCopytradingTradeOrdersHistory` | GET | `copytrading/trade/orders-history` | 1 |
| `privateGetCopytradingTradePendingTpslByOrder` | GET | `copytrading/trade/pending-tpsl-by-order` | 1 |
| `privateGetUserQueryApikey` | GET | `user/query-apikey` | 1 |
| `privateGetSpotTradeFillsHistory` | GET | `spot/trade/fills-history` | 1 |
| `privatePostAssetTransfer` | POST | `asset/transfer` | 1 |
| `privatePostAssetDemoApplyMoney` | POST | `asset/demo-apply-money` | 1 |
| `privatePostAccountSetMarginMode` | POST | `account/set-margin-mode` | 1 |
| `privatePostAccountSetPositionMode` | POST | `account/set-position-mode` | 1 |
| `privatePostAccountSetLeverage` | POST | `account/set-leverage` | 1 |
| `privatePostTradeOrder` | POST | `trade/order` | 1 |
| `privatePostTradeBatchOrders` | POST | `trade/batch-orders` | 1 |
| `privatePostTradeOrderTpsl` | POST | `trade/order-tpsl` | 1 |
| `privatePostTradeOrderAlgo` | POST | `trade/order-algo` | 1 |
| `privatePostTradeCancelOrder` | POST | `trade/cancel-order` | 1 |
| `privatePostTradeCancelBatchOrders` | POST | `trade/cancel-batch-orders` | 1 |
| `privatePostTradeCancelTpsl` | POST | `trade/cancel-tpsl` | 1 |
| `privatePostTradeCancelAlgo` | POST | `trade/cancel-algo` | 1 |
| `privatePostTradeClosePosition` | POST | `trade/close-position` | 1 |
| `privatePostCopytradingAccountSetPositionMode` | POST | `copytrading/account/set-position-mode` | 1 |
| `privatePostCopytradingAccountSetLeverage` | POST | `copytrading/account/set-leverage` | 1 |
| `privatePostCopytradingTradePlaceOrder` | POST | `copytrading/trade/place-order` | 1 |
| `privatePostCopytradingTradeCancelOrder` | POST | `copytrading/trade/cancel-order` | 1 |
| `privatePostCopytradingTradePlaceTpslByContract` | POST | `copytrading/trade/place-tpsl-by-contract` | 1 |
| `privatePostCopytradingTradeCancelTpslByContract` | POST | `copytrading/trade/cancel-tpsl-by-contract` | 1 |
| `privatePostCopytradingTradePlaceTpslByOrder` | POST | `copytrading/trade/place-tpsl-by-order` | 1 |
| `privatePostCopytradingTradeCancelTpslByOrder` | POST | `copytrading/trade/cancel-tpsl-by-order` | 1 |
| `privatePostCopytradingTradeClosePositionByOrder` | POST | `copytrading/trade/close-position-by-order` | 1 |
| `privatePostCopytradingTradeClosePositionByContract` | POST | `copytrading/trade/close-position-by-contract` | 1 |

