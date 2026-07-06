Every endpoint in `deepcoin`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/deepcoin) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetDeepcoinMarketBooks`); the snake_case alias (`public_get_deepcoin_market_books`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetDeepcoinMarketBooks`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const deepcoin = new ccxt.deepcoin ();
const response = await deepcoin.publicGetDeepcoinMarketBooks (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const deepcoin = new ccxt.deepcoin ();
const response = await deepcoin.publicGetDeepcoinMarketBooks (params);
```

#### **Python**

```python
import ccxt
deepcoin = ccxt.deepcoin()
response = deepcoin.public_get_deepcoin_market_books(params)
```

#### **PHP**

```php
$deepcoin = new \ccxt\deepcoin();
$response = $deepcoin->public_get_deepcoin_market_books($params);
```

#### **C#**

```csharp
using ccxt;
var deepcoin = new Deepcoin();
var response = await deepcoin.publicGetDeepcoinMarketBooks(parameters);
```

#### **Go**

```go
deepcoin := ccxt.NewDeepcoin(nil)
response := <-deepcoin.PublicGetDeepcoinMarketBooks(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official deepcoin API documentation:** [deepcoin.com](https://www.deepcoin.com/docs)

> 53 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.deepcoin.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetDeepcoinMarketBooks` | GET | `deepcoin/market/books` | 1 |
| `publicGetDeepcoinMarketCandles` | GET | `deepcoin/market/candles` | 1 |
| `publicGetDeepcoinMarketInstruments` | GET | `deepcoin/market/instruments` | 1 |
| `publicGetDeepcoinMarketTickers` | GET | `deepcoin/market/tickers` | 1 |
| `publicGetDeepcoinMarketIndexCandles` | GET | `deepcoin/market/index-candles` | 1 |
| `publicGetDeepcoinMarketTrades` | GET | `deepcoin/market/trades` | 1 |
| `publicGetDeepcoinMarketMarkPriceCandles` | GET | `deepcoin/market/mark-price-candles` | 1 |
| `publicGetDeepcoinMarketStepMargin` | GET | `deepcoin/market/step-margin` | 5 |
| `publicGetDeepcoinTradeFundingRate` | GET | `deepcoin/trade/funding-rate` | 5 |
| `publicGetDeepcoinTradeFundRateCurrentFundingRate` | GET | `deepcoin/trade/fund-rate/current-funding-rate` | 5 |
| `publicGetDeepcoinTradeFundRateHistory` | GET | `deepcoin/trade/fund-rate/history` | 5 |

## private

**Base URL**: `https://api.deepcoin.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetDeepcoinAccountBalances` | GET | `deepcoin/account/balances` | 5 |
| `privateGetDeepcoinAccountBills` | GET | `deepcoin/account/bills` | 5 |
| `privateGetDeepcoinAccountPositions` | GET | `deepcoin/account/positions` | 5 |
| `privateGetDeepcoinTradeFills` | GET | `deepcoin/trade/fills` | 5 |
| `privateGetDeepcoinTradeOrderByID` | GET | `deepcoin/trade/orderByID` | 5 |
| `privateGetDeepcoinTradeFinishOrderByID` | GET | `deepcoin/trade/finishOrderByID` | 5 |
| `privateGetDeepcoinTradeOrdersHistory` | GET | `deepcoin/trade/orders-history` | 5 |
| `privateGetDeepcoinTradeV2OrdersPending` | GET | `deepcoin/trade/v2/orders-pending` | 5 |
| `privateGetDeepcoinTradeTriggerOrdersPending` | GET | `deepcoin/trade/trigger-orders-pending` | 5 |
| `privateGetDeepcoinTradeTriggerOrdersHistory` | GET | `deepcoin/trade/trigger-orders-history` | 5 |
| `privateGetDeepcoinCopytradingSupportContracts` | GET | `deepcoin/copytrading/support-contracts` | 5 |
| `privateGetDeepcoinCopytradingLeaderPosition` | GET | `deepcoin/copytrading/leader-position` | 5 |
| `privateGetDeepcoinCopytradingEstimateProfit` | GET | `deepcoin/copytrading/estimate-profit` | 5 |
| `privateGetDeepcoinCopytradingHistoryProfit` | GET | `deepcoin/copytrading/history-profit` | 5 |
| `privateGetDeepcoinCopytradingFollowerRank` | GET | `deepcoin/copytrading/follower-rank` | 5 |
| `privateGetDeepcoinInternalTransferSupport` | GET | `deepcoin/internal-transfer/support` | 5 |
| `privateGetDeepcoinInternalTransferHistoryOrder` | GET | `deepcoin/internal-transfer/history-order` | 5 |
| `privateGetDeepcoinRebateConfig` | GET | `deepcoin/rebate/config` | 5 |
| `privateGetDeepcoinAgentsUsers` | GET | `deepcoin/agents/users` | 5 |
| `privateGetDeepcoinAgentsUsersRebateList` | GET | `deepcoin/agents/users/rebate-list` | 5 |
| `privateGetDeepcoinAgentsUsersRebates` | GET | `deepcoin/agents/users/rebates` | 5 |
| `privateGetDeepcoinAssetDepositList` | GET | `deepcoin/asset/deposit-list` | 5 |
| `privateGetDeepcoinAssetWithdrawList` | GET | `deepcoin/asset/withdraw-list` | 5 |
| `privateGetDeepcoinAssetRechargeChainList` | GET | `deepcoin/asset/recharge-chain-list` | 5 |
| `privateGetDeepcoinListenkeyAcquire` | GET | `deepcoin/listenkey/acquire` | 5 |
| `privateGetDeepcoinListenkeyExtend` | GET | `deepcoin/listenkey/extend` | 5 |
| `privatePostDeepcoinAccountSetLeverage` | POST | `deepcoin/account/set-leverage` | 5 |
| `privatePostDeepcoinTradeOrder` | POST | `deepcoin/trade/order` | 5 |
| `privatePostDeepcoinTradeReplaceOrder` | POST | `deepcoin/trade/replace-order` | 5 |
| `privatePostDeepcoinTradeCancelOrder` | POST | `deepcoin/trade/cancel-order` | 5 |
| `privatePostDeepcoinTradeBatchCancelOrder` | POST | `deepcoin/trade/batch-cancel-order` | 5 |
| `privatePostDeepcoinTradeCancelTriggerOrder` | POST | `deepcoin/trade/cancel-trigger-order` | 0.16666666666666666 |
| `privatePostDeepcoinTradeSwapCancelAll` | POST | `deepcoin/trade/swap/cancel-all` | 5 |
| `privatePostDeepcoinTradeTriggerOrder` | POST | `deepcoin/trade/trigger-order` | 5 |
| `privatePostDeepcoinTradeBatchClosePosition` | POST | `deepcoin/trade/batch-close-position` | 5 |
| `privatePostDeepcoinTradeReplaceOrderSltp` | POST | `deepcoin/trade/replace-order-sltp` | 5 |
| `privatePostDeepcoinTradeClosePositionByIds` | POST | `deepcoin/trade/close-position-by-ids` | 5 |
| `privatePostDeepcoinCopytradingLeaderSettings` | POST | `deepcoin/copytrading/leader-settings` | 5 |
| `privatePostDeepcoinCopytradingSetContracts` | POST | `deepcoin/copytrading/set-contracts` | 5 |
| `privatePostDeepcoinInternalTransfer` | POST | `deepcoin/internal-transfer` | 5 |
| `privatePostDeepcoinRebateConfig` | POST | `deepcoin/rebate/config` | 5 |
| `privatePostDeepcoinAssetTransfer` | POST | `deepcoin/asset/transfer` | 5 |

