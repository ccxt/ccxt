Every endpoint in `aster`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/aster) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `fapiPublicGetV1Ping`); the snake_case alias (`fapiPublic_get_v1_ping`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`FapiPublicGetV1Ping`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const aster = new ccxt.aster ();
const response = await aster.fapiPublicGetV1Ping (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const aster = new ccxt.aster ();
const response = await aster.fapiPublicGetV1Ping (params);
```

#### **Python**

```python
import ccxt
aster = ccxt.aster()
response = aster.fapiPublic_get_v1_ping(params)
```

#### **PHP**

```php
$aster = new \ccxt\aster();
$response = $aster->fapiPublic_get_v1_ping($params);
```

#### **C#**

```csharp
using ccxt;
var aster = new Aster();
var response = await aster.fapiPublicGetV1Ping(parameters);
```

#### **Go**

```go
aster := ccxt.NewAster(nil)
response := <-aster.FapiPublicGetV1Ping(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official aster API documentation:** [github.com](https://github.com/asterdex/api-docs)

> 165 implicit endpoints across 4 access groups.

## fapiPublic

**Base URL**: `https://fapi.asterdex.com/fapi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `fapiPublicGetV1Ping` | GET | `v1/ping` | 1 |
| `fapiPublicGetV3Ping` | GET | `v3/ping` | 1 |
| `fapiPublicGetV1Time` | GET | `v1/time` | 1 |
| `fapiPublicGetV3Time` | GET | `v3/time` | 1 |
| `fapiPublicGetV1ExchangeInfo` | GET | `v1/exchangeInfo` | 1 |
| `fapiPublicGetV3ExchangeInfo` | GET | `v3/exchangeInfo` | 1 |
| `fapiPublicGetV1Depth` | GET | `v1/depth` | 1 |
| `fapiPublicGetV3Depth` | GET | `v3/depth` | 2 |
| `fapiPublicGetV1Trades` | GET | `v1/trades` | 1 |
| `fapiPublicGetV3Trades` | GET | `v3/trades` | 1 |
| `fapiPublicGetV1HistoricalTrades` | GET | `v1/historicalTrades` | 1 |
| `fapiPublicGetV3HistoricalTrades` | GET | `v3/historicalTrades` | 20 |
| `fapiPublicGetV1AggTrades` | GET | `v1/aggTrades` | 1 |
| `fapiPublicGetV3AggTrades` | GET | `v3/aggTrades` | 20 |
| `fapiPublicGetV1Klines` | GET | `v1/klines` | 1 |
| `fapiPublicGetV3Klines` | GET | `v3/klines` | 1 |
| `fapiPublicGetV1IndexPriceKlines` | GET | `v1/indexPriceKlines` | 1 |
| `fapiPublicGetV3IndexPriceKlines` | GET | `v3/indexPriceKlines` | 1 |
| `fapiPublicGetV1MarkPriceKlines` | GET | `v1/markPriceKlines` | 1 |
| `fapiPublicGetV3MarkPriceKlines` | GET | `v3/markPriceKlines` | 1 |
| `fapiPublicGetV1PremiumIndex` | GET | `v1/premiumIndex` | 1 |
| `fapiPublicGetV3PremiumIndex` | GET | `v3/premiumIndex` | 1 |
| `fapiPublicGetV1FundingRate` | GET | `v1/fundingRate` | 1 |
| `fapiPublicGetV3FundingRate` | GET | `v3/fundingRate` | 1 |
| `fapiPublicGetV1FundingInfo` | GET | `v1/fundingInfo` | 1 |
| `fapiPublicGetV3FundingInfo` | GET | `v3/fundingInfo` | 1 |
| `fapiPublicGetV1Ticker24hr` | GET | `v1/ticker/24hr` | 1 |
| `fapiPublicGetV3Ticker24hr` | GET | `v3/ticker/24hr` | 1 |
| `fapiPublicGetV1TickerPrice` | GET | `v1/ticker/price` | 1 |
| `fapiPublicGetV3TickerPrice` | GET | `v3/ticker/price` | 1 |
| `fapiPublicGetV1TickerBookTicker` | GET | `v1/ticker/bookTicker` | 1 |
| `fapiPublicGetV3TickerBookTicker` | GET | `v3/ticker/bookTicker` | 1 |
| `fapiPublicGetV1AdlQuantile` | GET | `v1/adlQuantile` | 1 |
| `fapiPublicGetV1ForceOrders` | GET | `v1/forceOrders` | 1 |
| `fapiPublicGetV3Indexreferences` | GET | `v3/indexreferences` | 1 |

## fapiPrivate

**Base URL**: `https://fapi.asterdex.com/fapi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `fapiPrivateGetV1PositionSideDual` | GET | `v1/positionSide/dual` | 1 |
| `fapiPrivateGetV3PositionSideDual` | GET | `v3/positionSide/dual` | 30 |
| `fapiPrivateGetV1MultiAssetsMargin` | GET | `v1/multiAssetsMargin` | 1 |
| `fapiPrivateGetV3MultiAssetsMargin` | GET | `v3/multiAssetsMargin` | 1 |
| `fapiPrivateGetV1Order` | GET | `v1/order` | 1 |
| `fapiPrivateGetV3Order` | GET | `v3/order` | 1 |
| `fapiPrivateGetV1OpenOrder` | GET | `v1/openOrder` | 1 |
| `fapiPrivateGetV3OpenOrder` | GET | `v3/openOrder` | 1 |
| `fapiPrivateGetV1OpenOrders` | GET | `v1/openOrders` | 1 |
| `fapiPrivateGetV3OpenOrders` | GET | `v3/openOrders` | 1 |
| `fapiPrivateGetV1AllOrders` | GET | `v1/allOrders` | 1 |
| `fapiPrivateGetV3AllOrders` | GET | `v3/allOrders` | 1 |
| `fapiPrivateGetV2Balance` | GET | `v2/balance` | 1 |
| `fapiPrivateGetV3Balance` | GET | `v3/balance` | 1 |
| `fapiPrivateGetV3Account` | GET | `v3/account` | 1 |
| `fapiPrivateGetV1PositionMarginHistory` | GET | `v1/positionMargin/history` | 1 |
| `fapiPrivateGetV3PositionMarginHistory` | GET | `v3/positionMargin/history` | 1 |
| `fapiPrivateGetV2PositionRisk` | GET | `v2/positionRisk` | 1 |
| `fapiPrivateGetV3PositionRisk` | GET | `v3/positionRisk` | 1 |
| `fapiPrivateGetV1UserTrades` | GET | `v1/userTrades` | 1 |
| `fapiPrivateGetV3UserTrades` | GET | `v3/userTrades` | 5 |
| `fapiPrivateGetV1Income` | GET | `v1/income` | 1 |
| `fapiPrivateGetV3Income` | GET | `v3/income` | 1 |
| `fapiPrivateGetV1LeverageBracket` | GET | `v1/leverageBracket` | 1 |
| `fapiPrivateGetV3LeverageBracket` | GET | `v3/leverageBracket` | 1 |
| `fapiPrivateGetV1CommissionRate` | GET | `v1/commissionRate` | 1 |
| `fapiPrivateGetV3CommissionRate` | GET | `v3/commissionRate` | 1 |
| `fapiPrivateGetV3AdlQuantile` | GET | `v3/adlQuantile` | 1 |
| `fapiPrivateGetV3ForceOrders` | GET | `v3/forceOrders` | 1 |
| `fapiPrivateGetV3Mmp` | GET | `v3/mmp` | 1 |
| `fapiPrivateGetV3AccountWithJoinMargin` | GET | `v3/accountWithJoinMargin` | 1 |
| `fapiPrivateGetV4Account` | GET | `v4/account` | 1 |
| `fapiPrivateGetV3Agent` | GET | `v3/agent` | 1 |
| `fapiPrivateGetV3Builder` | GET | `v3/builder` | 1 |
| `fapiPrivatePostV1PositionSideDual` | POST | `v1/positionSide/dual` | 1 |
| `fapiPrivatePostV3PositionSideDual` | POST | `v3/positionSide/dual` | 1 |
| `fapiPrivatePostV1MultiAssetsMargin` | POST | `v1/multiAssetsMargin` | 1 |
| `fapiPrivatePostV3MultiAssetsMargin` | POST | `v3/multiAssetsMargin` | 1 |
| `fapiPrivatePostV1Order` | POST | `v1/order` | 1 |
| `fapiPrivatePostV3Order` | POST | `v3/order` | 1 |
| `fapiPrivatePostV1OrderTest` | POST | `v1/order/test` | 1 |
| `fapiPrivatePostV3OrderTest` | POST | `v3/order/test` | 1 |
| `fapiPrivatePostV1BatchOrders` | POST | `v1/batchOrders` | 1 |
| `fapiPrivatePostV3BatchOrders` | POST | `v3/batchOrders` | 1 |
| `fapiPrivatePostV1AssetWalletTransfer` | POST | `v1/asset/wallet/transfer` | 1 |
| `fapiPrivatePostV3AssetWalletTransfer` | POST | `v3/asset/wallet/transfer` | 1 |
| `fapiPrivatePostV1CountdownCancelAll` | POST | `v1/countdownCancelAll` | 1 |
| `fapiPrivatePostV3CountdownCancelAll` | POST | `v3/countdownCancelAll` | 1 |
| `fapiPrivatePostV1Leverage` | POST | `v1/leverage` | 1 |
| `fapiPrivatePostV3Leverage` | POST | `v3/leverage` | 1 |
| `fapiPrivatePostV1MarginType` | POST | `v1/marginType` | 1 |
| `fapiPrivatePostV3MarginType` | POST | `v3/marginType` | 1 |
| `fapiPrivatePostV1PositionMargin` | POST | `v1/positionMargin` | 1 |
| `fapiPrivatePostV3PositionMargin` | POST | `v3/positionMargin` | 1 |
| `fapiPrivatePostV1ListenKey` | POST | `v1/listenKey` | 1 |
| `fapiPrivatePostV3ListenKey` | POST | `v3/listenKey` | 1 |
| `fapiPrivatePostV3Mmp` | POST | `v3/mmp` | 1 |
| `fapiPrivatePostV3MmpReset` | POST | `v3/mmpReset` | 1 |
| `fapiPrivatePostV3Noop` | POST | `v3/noop` | 1 |
| `fapiPrivatePostV3ApproveAgent` | POST | `v3/approveAgent` | 1 |
| `fapiPrivatePostV3UpdateAgent` | POST | `v3/updateAgent` | 1 |
| `fapiPrivatePostV3ApproveBuilder` | POST | `v3/approveBuilder` | 1 |
| `fapiPrivatePostV3UpdateBuilder` | POST | `v3/updateBuilder` | 1 |
| `fapiPrivatePutV1ListenKey` | PUT | `v1/listenKey` | 1 |
| `fapiPrivatePutV3ListenKey` | PUT | `v3/listenKey` | 1 |
| `fapiPrivateDeleteV1Order` | DELETE | `v1/order` | 1 |
| `fapiPrivateDeleteV3Order` | DELETE | `v3/order` | 1 |
| `fapiPrivateDeleteV1AllOpenOrders` | DELETE | `v1/allOpenOrders` | 1 |
| `fapiPrivateDeleteV3AllOpenOrders` | DELETE | `v3/allOpenOrders` | 1 |
| `fapiPrivateDeleteV1BatchOrders` | DELETE | `v1/batchOrders` | 1 |
| `fapiPrivateDeleteV3BatchOrders` | DELETE | `v3/batchOrders` | 1 |
| `fapiPrivateDeleteV3Mmp` | DELETE | `v3/mmp` | 1 |
| `fapiPrivateDeleteV1ListenKey` | DELETE | `v1/listenKey` | 1 |
| `fapiPrivateDeleteV3ListenKey` | DELETE | `v3/listenKey` | 1 |
| `fapiPrivateDeleteV3Agent` | DELETE | `v3/agent` | 1 |
| `fapiPrivateDeleteV3Builder` | DELETE | `v3/builder` | 1 |

## sapiPublic

**Base URL**: `https://sapi.asterdex.com/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `sapiPublicGetV1Ping` | GET | `v1/ping` | 1 |
| `sapiPublicGetV1Time` | GET | `v1/time` | 1 |
| `sapiPublicGetV1ExchangeInfo` | GET | `v1/exchangeInfo` | 1 |
| `sapiPublicGetV1Depth` | GET | `v1/depth` | 1 |
| `sapiPublicGetV1Trades` | GET | `v1/trades` | 1 |
| `sapiPublicGetV1HistoricalTrades` | GET | `v1/historicalTrades` | 1 |
| `sapiPublicGetV1AggTrades` | GET | `v1/aggTrades` | 1 |
| `sapiPublicGetV1Klines` | GET | `v1/klines` | 1 |
| `sapiPublicGetV1Ticker24hr` | GET | `v1/ticker/24hr` | 1 |
| `sapiPublicGetV1TickerPrice` | GET | `v1/ticker/price` | 1 |
| `sapiPublicGetV1TickerBookTicker` | GET | `v1/ticker/bookTicker` | 1 |
| `sapiPublicGetV1AsterWithdrawEstimateFee` | GET | `v1/aster/withdraw/estimateFee` | 1 |
| `sapiPublicGetV3Ping` | GET | `v3/ping` | 1 |
| `sapiPublicGetV3Time` | GET | `v3/time` | 1 |
| `sapiPublicGetV3ExchangeInfo` | GET | `v3/exchangeInfo` | 1 |
| `sapiPublicGetV3Depth` | GET | `v3/depth` | 2 |
| `sapiPublicGetV3Trades` | GET | `v3/trades` | 1 |
| `sapiPublicGetV3HistoricalTrades` | GET | `v3/historicalTrades` | 20 |
| `sapiPublicGetV3AggTrades` | GET | `v3/aggTrades` | 20 |
| `sapiPublicGetV3Klines` | GET | `v3/klines` | 1 |
| `sapiPublicGetV3Ticker24hr` | GET | `v3/ticker/24hr` | 1 |
| `sapiPublicGetV3TickerPrice` | GET | `v3/ticker/price` | 1 |
| `sapiPublicGetV3TickerBookTicker` | GET | `v3/ticker/bookTicker` | 1 |
| `sapiPublicGetV3AsterWithdrawEstimateFee` | GET | `v3/aster/withdraw/estimateFee` | 1 |

## sapiPrivate

**Base URL**: `https://sapi.asterdex.com/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `sapiPrivateGetV1CommissionRate` | GET | `v1/commissionRate` | 1 |
| `sapiPrivateGetV1Order` | GET | `v1/order` | 1 |
| `sapiPrivateGetV1OpenOrders` | GET | `v1/openOrders` | 1 |
| `sapiPrivateGetV1AllOrders` | GET | `v1/allOrders` | 1 |
| `sapiPrivateGetV1TransactionHistory` | GET | `v1/transactionHistory` | 1 |
| `sapiPrivateGetV1Account` | GET | `v1/account` | 1 |
| `sapiPrivateGetV1UserTrades` | GET | `v1/userTrades` | 1 |
| `sapiPrivateGetV3CommissionRate` | GET | `v3/commissionRate` | 1 |
| `sapiPrivateGetV3Order` | GET | `v3/order` | 1 |
| `sapiPrivateGetV3OpenOrders` | GET | `v3/openOrders` | 1 |
| `sapiPrivateGetV3AllOrders` | GET | `v3/allOrders` | 5 |
| `sapiPrivateGetV3Account` | GET | `v3/account` | 5 |
| `sapiPrivateGetV3UserTrades` | GET | `v3/userTrades` | 5 |
| `sapiPrivateGetV3OpenOrder` | GET | `v3/openOrder` | 1 |
| `sapiPrivatePostV1Order` | POST | `v1/order` | 1 |
| `sapiPrivatePostV1AssetWalletTransfer` | POST | `v1/asset/wallet/transfer` | 5 |
| `sapiPrivatePostV1AssetSendToAddress` | POST | `v1/asset/sendToAddress` | 1 |
| `sapiPrivatePostV1ListenKey` | POST | `v1/listenKey` | 1 |
| `sapiPrivatePostV3Order` | POST | `v3/order` | 1 |
| `sapiPrivatePostV3AssetWalletTransfer` | POST | `v3/asset/wallet/transfer` | 5 |
| `sapiPrivatePostV3AsterUserWithdraw` | POST | `v3/aster/user-withdraw` | 1 |
| `sapiPrivatePostV3ListenKey` | POST | `v3/listenKey` | 1 |
| `sapiPrivatePutV1ListenKey` | PUT | `v1/listenKey` |  |
| `sapiPrivatePutV3ListenKey` | PUT | `v3/listenKey` |  |
| `sapiPrivateDeleteV1Order` | DELETE | `v1/order` | 1 |
| `sapiPrivateDeleteV1AllOpenOrders` | DELETE | `v1/allOpenOrders` | 1 |
| `sapiPrivateDeleteV1ListenKey` | DELETE | `v1/listenKey` | 1 |
| `sapiPrivateDeleteV3AllOpenOrders` | DELETE | `v3/allOpenOrders` | 1 |
| `sapiPrivateDeleteV3Order` | DELETE | `v3/order` | 1 |
| `sapiPrivateDeleteV3ListenKey` | DELETE | `v3/listenKey` | 1 |

