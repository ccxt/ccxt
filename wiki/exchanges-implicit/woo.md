Every endpoint in `woo`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/woo) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `v1PubGetHistKline`); the snake_case alias (`v1_pub_get_hist_kline`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`V1PubGetHistKline`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const woo = new ccxt.woo ();
const response = await woo.v1PubGetHistKline (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const woo = new ccxt.woo ();
const response = await woo.v1PubGetHistKline (params);
```

#### **Python**

```python
import ccxt
woo = ccxt.woo()
response = woo.v1_pub_get_hist_kline(params)
```

#### **PHP**

```php
$woo = new \ccxt\woo();
$response = $woo->v1_pub_get_hist_kline($params);
```

#### **C#**

```csharp
using ccxt;
var woo = new Woo();
var response = await woo.v1PubGetHistKline(parameters);
```

#### **Go**

```go
woo := ccxt.NewWoo(nil)
response := <-woo.V1PubGetHistKline(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official woo API documentation:** [docs.woox.io](https://docs.woox.io/)

> 134 implicit endpoints across 3 access groups.

## v1

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v1PubGetHistKline` | GET | `hist/kline` | 10 |
| `v1PubGetHistTrades` | GET | `hist/trades` | 10 |
| `v1PublicGetInfo` | GET | `info` | 1 |
| `v1PublicGetInfoSymbol` | GET | `info/{symbol}` | 1 |
| `v1PublicGetSystemInfo` | GET | `system_info` | 1 |
| `v1PublicGetMarketTrades` | GET | `market_trades` | 1 |
| `v1PublicGetToken` | GET | `token` | 1 |
| `v1PublicGetTokenNetwork` | GET | `token_network` | 1 |
| `v1PublicGetFundingRates` | GET | `funding_rates` | 1 |
| `v1PublicGetFundingRateSymbol` | GET | `funding_rate/{symbol}` | 1 |
| `v1PublicGetFundingRateHistory` | GET | `funding_rate_history` | 1 |
| `v1PublicGetFutures` | GET | `futures` | 1 |
| `v1PublicGetFuturesSymbol` | GET | `futures/{symbol}` | 1 |
| `v1PublicGetOrderbookSymbol` | GET | `orderbook/{symbol}` | 1 |
| `v1PublicGetKline` | GET | `kline` | 1 |
| `v1PrivateGetClientToken` | GET | `client/token` | 1 |
| `v1PrivateGetOrderOid` | GET | `order/{oid}` | 1 |
| `v1PrivateGetClientOrderClientOrderId` | GET | `client/order/{client_order_id}` | 1 |
| `v1PrivateGetOrders` | GET | `orders` | 1 |
| `v1PrivateGetClientTradeTid` | GET | `client/trade/{tid}` | 1 |
| `v1PrivateGetOrderOidTrades` | GET | `order/{oid}/trades` | 1 |
| `v1PrivateGetClientTrades` | GET | `client/trades` | 1 |
| `v1PrivateGetClientHistTrades` | GET | `client/hist_trades` | 1 |
| `v1PrivateGetStakingYieldHistory` | GET | `staking/yield_history` | 1 |
| `v1PrivateGetClientHolding` | GET | `client/holding` | 1 |
| `v1PrivateGetAssetDeposit` | GET | `asset/deposit` | 10 |
| `v1PrivateGetAssetHistory` | GET | `asset/history` | 60 |
| `v1PrivateGetSubAccountAll` | GET | `sub_account/all` | 60 |
| `v1PrivateGetSubAccountAssets` | GET | `sub_account/assets` | 60 |
| `v1PrivateGetSubAccountAssetDetail` | GET | `sub_account/asset_detail` | 60 |
| `v1PrivateGetSubAccountIpRestriction` | GET | `sub_account/ip_restriction` | 10 |
| `v1PrivateGetAssetMainSubTransferHistory` | GET | `asset/main_sub_transfer_history` | 30 |
| `v1PrivateGetTokenInterest` | GET | `token_interest` | 60 |
| `v1PrivateGetTokenInterestToken` | GET | `token_interest/{token}` | 60 |
| `v1PrivateGetInterestHistory` | GET | `interest/history` | 60 |
| `v1PrivateGetInterestRepay` | GET | `interest/repay` | 60 |
| `v1PrivateGetFundingFeeHistory` | GET | `funding_fee/history` | 30 |
| `v1PrivateGetPositions` | GET | `positions` | 3.33 |
| `v1PrivateGetPositionSymbol` | GET | `position/{symbol}` | 3.33 |
| `v1PrivateGetClientTransactionHistory` | GET | `client/transaction_history` | 60 |
| `v1PrivateGetClientFuturesLeverage` | GET | `client/futures_leverage` | 60 |
| `v1PrivatePostOrder` | POST | `order` | 1 |
| `v1PrivatePostOrderCancelAllAfter` | POST | `order/cancel_all_after` | 1 |
| `v1PrivatePostAssetLtv` | POST | `asset/ltv` | 30 |
| `v1PrivatePostAssetInternalWithdraw` | POST | `asset/internal_withdraw` | 30 |
| `v1PrivatePostInterestRepay` | POST | `interest/repay` | 60 |
| `v1PrivatePostClientAccountMode` | POST | `client/account_mode` | 120 |
| `v1PrivatePostClientPositionMode` | POST | `client/position_mode` | 5 |
| `v1PrivatePostClientLeverage` | POST | `client/leverage` | 120 |
| `v1PrivatePostClientFuturesLeverage` | POST | `client/futures_leverage` | 30 |
| `v1PrivatePostClientIsolatedMargin` | POST | `client/isolated_margin` | 30 |
| `v1PrivateDeleteOrder` | DELETE | `order` | 1 |
| `v1PrivateDeleteClientOrder` | DELETE | `client/order` | 1 |
| `v1PrivateDeleteOrders` | DELETE | `orders` | 1 |
| `v1PrivateDeleteAssetWithdraw` | DELETE | `asset/withdraw` | 120 |

## v2

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PrivateGetClientHolding` | GET | `client/holding` | 1 |

## v3

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v3PublicGetSystemInfo` | GET | `systemInfo` | 1 |
| `v3PublicGetInstruments` | GET | `instruments` | 1 |
| `v3PublicGetToken` | GET | `token` | 1 |
| `v3PublicGetTokenNetwork` | GET | `tokenNetwork` | 1 |
| `v3PublicGetTokenInfo` | GET | `tokenInfo` | 1 |
| `v3PublicGetMarketTrades` | GET | `marketTrades` | 1 |
| `v3PublicGetMarketTradesHistory` | GET | `marketTradesHistory` | 1 |
| `v3PublicGetOrderbook` | GET | `orderbook` | 1 |
| `v3PublicGetKline` | GET | `kline` | 1 |
| `v3PublicGetKlineHistory` | GET | `klineHistory` | 1 |
| `v3PublicGetFutures` | GET | `futures` | 1 |
| `v3PublicGetFundingRate` | GET | `fundingRate` | 1 |
| `v3PublicGetFundingRateHistory` | GET | `fundingRateHistory` | 1 |
| `v3PublicGetInsuranceFund` | GET | `insuranceFund` | 1 |
| `v3PrivateGetTradeOrder` | GET | `trade/order` | 2 |
| `v3PrivateGetTradeOrders` | GET | `trade/orders` | 1 |
| `v3PrivateGetTradeAlgoOrder` | GET | `trade/algoOrder` | 1 |
| `v3PrivateGetTradeAlgoOrders` | GET | `trade/algoOrders` | 1 |
| `v3PrivateGetTradeTransaction` | GET | `trade/transaction` | 1 |
| `v3PrivateGetTradeTransactionHistory` | GET | `trade/transactionHistory` | 5 |
| `v3PrivateGetTradeTradingFee` | GET | `trade/tradingFee` | 5 |
| `v3PrivateGetAccountInfo` | GET | `account/info` | 60 |
| `v3PrivateGetAccountTokenConfig` | GET | `account/tokenConfig` | 1 |
| `v3PrivateGetAccountSymbolConfig` | GET | `account/symbolConfig` | 1 |
| `v3PrivateGetAccountSubAccountsAll` | GET | `account/subAccounts/all` | 60 |
| `v3PrivateGetAccountReferralSummary` | GET | `account/referral/summary` | 60 |
| `v3PrivateGetAccountReferralRewardHistory` | GET | `account/referral/rewardHistory` | 60 |
| `v3PrivateGetAccountCredentials` | GET | `account/credentials` | 60 |
| `v3PrivateGetAssetBalances` | GET | `asset/balances` | 1 |
| `v3PrivateGetAssetTokenHistory` | GET | `asset/token/history` | 60 |
| `v3PrivateGetAssetTransferHistory` | GET | `asset/transfer/history` | 30 |
| `v3PrivateGetAssetWalletHistory` | GET | `asset/wallet/history` | 60 |
| `v3PrivateGetAssetWalletDeposit` | GET | `asset/wallet/deposit` | 60 |
| `v3PrivateGetAssetStakingYieldHistory` | GET | `asset/staking/yieldHistory` | 60 |
| `v3PrivateGetFuturesPositions` | GET | `futures/positions` | 3.33 |
| `v3PrivateGetFuturesLeverage` | GET | `futures/leverage` | 60 |
| `v3PrivateGetFuturesDefaultMarginMode` | GET | `futures/defaultMarginMode` | 60 |
| `v3PrivateGetFuturesFundingFeeHistory` | GET | `futures/fundingFee/history` | 30 |
| `v3PrivateGetSpotMarginInterestRate` | GET | `spotMargin/interestRate` | 60 |
| `v3PrivateGetSpotMarginInterestHistory` | GET | `spotMargin/interestHistory` | 60 |
| `v3PrivateGetSpotMarginMaxMargin` | GET | `spotMargin/maxMargin` | 60 |
| `v3PrivateGetAlgoOrderOid` | GET | `algo/order/{oid}` | 1 |
| `v3PrivateGetAlgoOrders` | GET | `algo/orders` | 1 |
| `v3PrivateGetPositions` | GET | `positions` | 3.33 |
| `v3PrivateGetBuypower` | GET | `buypower` | 1 |
| `v3PrivateGetConvertExchangeInfo` | GET | `convert/exchangeInfo` | 1 |
| `v3PrivateGetConvertAssetInfo` | GET | `convert/assetInfo` | 1 |
| `v3PrivateGetConvertRfq` | GET | `convert/rfq` | 60 |
| `v3PrivateGetConvertTrade` | GET | `convert/trade` | 1 |
| `v3PrivateGetConvertTrades` | GET | `convert/trades` | 1 |
| `v3PrivatePostTradeOrder` | POST | `trade/order` | 2 |
| `v3PrivatePostTradeAlgoOrder` | POST | `trade/algoOrder` | 5 |
| `v3PrivatePostTradeCancelAllAfter` | POST | `trade/cancelAllAfter` | 1 |
| `v3PrivatePostAccountTradingMode` | POST | `account/tradingMode` | 120 |
| `v3PrivatePostAccountListenKey` | POST | `account/listenKey` | 20 |
| `v3PrivatePostAssetTransfer` | POST | `asset/transfer` | 30 |
| `v3PrivatePostAssetWalletWithdraw` | POST | `asset/wallet/withdraw` | 60 |
| `v3PrivatePostSpotMarginLeverage` | POST | `spotMargin/leverage` | 120 |
| `v3PrivatePostSpotMarginInterestRepay` | POST | `spotMargin/interestRepay` | 60 |
| `v3PrivatePostAlgoOrder` | POST | `algo/order` | 5 |
| `v3PrivatePostConvertRft` | POST | `convert/rft` | 60 |
| `v3PrivatePutTradeOrder` | PUT | `trade/order` | 2 |
| `v3PrivatePutTradeAlgoOrder` | PUT | `trade/algoOrder` | 2 |
| `v3PrivatePutFuturesLeverage` | PUT | `futures/leverage` | 60 |
| `v3PrivatePutFuturesPositionMode` | PUT | `futures/positionMode` | 120 |
| `v3PrivatePutOrderOid` | PUT | `order/{oid}` | 2 |
| `v3PrivatePutOrderClientClientOrderId` | PUT | `order/client/{client_order_id}` | 2 |
| `v3PrivatePutAlgoOrderOid` | PUT | `algo/order/{oid}` | 2 |
| `v3PrivatePutAlgoOrderClientClientOrderId` | PUT | `algo/order/client/{client_order_id}` | 2 |
| `v3PrivateDeleteTradeOrder` | DELETE | `trade/order` | 1 |
| `v3PrivateDeleteTradeOrders` | DELETE | `trade/orders` | 1 |
| `v3PrivateDeleteTradeAlgoOrder` | DELETE | `trade/algoOrder` | 1 |
| `v3PrivateDeleteTradeAlgoOrders` | DELETE | `trade/algoOrders` | 1 |
| `v3PrivateDeleteTradeAllOrders` | DELETE | `trade/allOrders` | 1 |
| `v3PrivateDeleteAlgoOrderOrderId` | DELETE | `algo/order/{order_id}` | 1 |
| `v3PrivateDeleteAlgoOrdersPending` | DELETE | `algo/orders/pending` | 1 |
| `v3PrivateDeleteAlgoOrdersPendingSymbol` | DELETE | `algo/orders/pending/{symbol}` | 1 |
| `v3PrivateDeleteOrdersPending` | DELETE | `orders/pending` | 1 |

