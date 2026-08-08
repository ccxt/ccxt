Every endpoint in `weex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/weex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetApiV3Time`); the snake_case alias (`public_get_api_v3_time`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetApiV3Time`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const weex = new ccxt.weex ();
const response = await weex.publicGetApiV3Time (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const weex = new ccxt.weex ();
const response = await weex.publicGetApiV3Time (params);
```

#### **Python**

```python
import ccxt
weex = ccxt.weex()
response = weex.public_get_api_v3_time(params)
```

#### **PHP**

```php
$weex = new \ccxt\weex();
$response = $weex->public_get_api_v3_time($params);
```

#### **C#**

```csharp
using ccxt;
var weex = new Weex();
var response = await weex.publicGetApiV3Time(parameters);
```

#### **Go**

```go
weex := ccxt.NewWeex(nil)
response := <-weex.PublicGetApiV3Time(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official weex API documentation:** [weex.com](https://www.weex.com/api-doc)

> 76 implicit endpoints across 4 access groups.

## public

**Base URL**: `https://api-spot.weex.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetApiV3Time` | GET | `api/v3/time` | 5 |
| `publicGetApiV3Coins` | GET | `api/v3/coins` | 25 |
| `publicGetApiV3ExchangeInfo` | GET | `api/v3/exchangeInfo` | 100 |
| `publicGetApiV3Ping` | GET | `api/v3/ping` | 5 |
| `publicGetApiV3ApiTradingSymbols` | GET | `api/v3/apiTradingSymbols` | 25 |
| `publicGetApiV3MarketTickerPrice` | GET | `api/v3/market/ticker/price` | 20 |
| `publicGetApiV3MarketTicker24hr` | GET | `api/v3/market/ticker/24hr` | 10 |
| `publicGetApiV3MarketTrades` | GET | `api/v3/market/trades` | 125 |
| `publicGetApiV3MarketKlines` | GET | `api/v3/market/klines` | 10 |
| `publicGetApiV3MarketDepth` | GET | `api/v3/market/depth` | 25 |
| `publicGetApiV3MarketTickerBookTicker` | GET | `api/v3/market/ticker/bookTicker` | 20 |

## private

**Base URL**: `https://api-spot.weex.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetApiV3Account` | GET | `api/v3/account/` | 5 |
| `privateGetApiV3AccountTransferRecords` | GET | `api/v3/account/transferRecords` | 3 |
| `privateGetApiV3Order` | GET | `api/v3/order` | 2 |
| `privateGetApiV3OpenOrders` | GET | `api/v3/openOrders` | 3 |
| `privateGetApiV3AllOrders` | GET | `api/v3/allOrders` | 10 |
| `privateGetApiV3MyTrades` | GET | `api/v3/myTrades` | 5 |
| `privateGetApiV3RebateAffiliateGetAffiliateUIDs` | GET | `api/v3/rebate/affiliate/getAffiliateUIDs` | 20 |
| `privateGetApiV3RebateAffiliateGetChannelUserTradeAndAsset` | GET | `api/v3/rebate/affiliate/getChannelUserTradeAndAsset` | 20 |
| `privateGetApiV3RebateAffiliateGetAffiliateCommission` | GET | `api/v3/rebate/affiliate/getAffiliateCommission` | 20 |
| `privateGetApiV3RebateAffiliateGetInternalWithdrawalStatus` | GET | `api/v3/rebate/affiliate/getInternalWithdrawalStatus` | 100 |
| `privateGetApiV3RebateAffiliateQuerySubChannelTransactions` | GET | `api/v3/rebate/affiliate/querySubChannelTransactions` | 10 |
| `privateGetApiV3AgencyVerifyReferrals` | GET | `api/v3/agency/verifyReferrals` | 20 |
| `privateGetApiV3AgencyGetAssert` | GET | `api/v3/agency/getAssert` | 20 |
| `privateGetApiV3AgencyGetDealData` | GET | `api/v3/agency/getDealData` | 20 |
| `privatePostApiV3AccountBills` | POST | `api/v3/account/bills` | 5 |
| `privatePostApiV3AccountFundingBills` | POST | `api/v3/account/fundingBills` | 5 |
| `privatePostApiV3Order` | POST | `api/v3/order` | 5 |
| `privatePostApiV3OrderBatch` | POST | `api/v3/order/batch` | 50 |
| `privatePostApiV3RebateAffiliateInternalWithdrawal` | POST | `api/v3/rebate/affiliate/internalWithdrawal` | 100 |
| `privateDeleteApiV3Order` | DELETE | `api/v3/order` | 1 |
| `privateDeleteApiV3OpenOrders` | DELETE | `api/v3/openOrders` | 1 |
| `privateDeleteApiV3OrderBatch` | DELETE | `api/v3/order/batch` | 10 |

## contract

**Base URL**: `https://api-contract.weex.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `contractGetCapiV3MarketTime` | GET | `capi/v3/market/time` | 5 |
| `contractGetCapiV3MarketExchangeInfo` | GET | `capi/v3/market/exchangeInfo` | 5 |
| `contractGetCapiV3MarketDepth` | GET | `capi/v3/market/depth` | 5 |
| `contractGetCapiV3MarketTicker24hr` | GET | `capi/v3/market/ticker/24hr` | 200 |
| `contractGetCapiV3MarketTickerBookTicker` | GET | `capi/v3/market/ticker/bookTicker` | 5 |
| `contractGetCapiV3MarketTrades` | GET | `capi/v3/market/trades` | 25 |
| `contractGetCapiV3MarketKlines` | GET | `capi/v3/market/klines` | 5 |
| `contractGetCapiV3MarketIndexPriceKlines` | GET | `capi/v3/market/indexPriceKlines` | 5 |
| `contractGetCapiV3MarketMarkPriceKlines` | GET | `capi/v3/market/markPriceKlines` | 5 |
| `contractGetCapiV3MarketHistoryKlines` | GET | `capi/v3/market/historyKlines` | 25 |
| `contractGetCapiV3MarketSymbolPrice` | GET | `capi/v3/market/symbolPrice` | 5 |
| `contractGetCapiV3MarketOpenInterest` | GET | `capi/v3/market/openInterest` | 10 |
| `contractGetCapiV3MarketPremiumIndex` | GET | `capi/v3/market/premiumIndex` | 5 |
| `contractGetCapiV3MarketFundingRate` | GET | `capi/v3/market/fundingRate` | 25 |
| `contractGetCapiV3MarketApiTradingSymbols` | GET | `capi/v3/market/apiTradingSymbols` | 25 |

## contractPrivate

**Base URL**: `https://api-contract.weex.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `contractPrivateGetCapiV3AccountBalance` | GET | `capi/v3/account/balance` | 10 |
| `contractPrivateGetCapiV3AccountCommissionRate` | GET | `capi/v3/account/commissionRate` | 10 |
| `contractPrivateGetCapiV3AccountAccountConfig` | GET | `capi/v3/account/accountConfig` | 10 |
| `contractPrivateGetCapiV3AccountSymbolConfig` | GET | `capi/v3/account/symbolConfig` | 10 |
| `contractPrivateGetCapiV3AccountPositionAllPosition` | GET | `capi/v3/account/position/allPosition` | 15 |
| `contractPrivateGetCapiV3AccountPositionSinglePosition` | GET | `capi/v3/account/position/singlePosition` | 3 |
| `contractPrivateGetCapiV3Order` | GET | `capi/v3/order` | 3 |
| `contractPrivateGetCapiV3OpenOrders` | GET | `capi/v3/openOrders` | 5 |
| `contractPrivateGetCapiV3OrderHistory` | GET | `capi/v3/order/history` | 10 |
| `contractPrivateGetCapiV3UserTrades` | GET | `capi/v3/userTrades` | 5 |
| `contractPrivateGetCapiV3OpenAlgoOrders` | GET | `capi/v3/openAlgoOrders` | 3 |
| `contractPrivateGetCapiV3AllAlgoOrders` | GET | `capi/v3/allAlgoOrders` | 10 |
| `contractPrivatePostCapiV3AccountIncome` | POST | `capi/v3/account/income` | 5 |
| `contractPrivatePostCapiV3AccountMarginType` | POST | `capi/v3/account/marginType` | 50 |
| `contractPrivatePostCapiV3AccountLeverage` | POST | `capi/v3/account/leverage` | 20 |
| `contractPrivatePostCapiV3AccountPositionMargin` | POST | `capi/v3/account/positionMargin` | 30 |
| `contractPrivatePostCapiV3AccountModifyAutoAppendMargin` | POST | `capi/v3/account/modifyAutoAppendMargin` | 30 |
| `contractPrivatePostCapiV3Order` | POST | `capi/v3/order` | 5 |
| `contractPrivatePostCapiV3BatchOrders` | POST | `capi/v3/batchOrders` | 10 |
| `contractPrivatePostCapiV3ClosePositions` | POST | `capi/v3/closePositions` | 50 |
| `contractPrivatePostCapiV3AlgoOrder` | POST | `capi/v3/algoOrder` | 5 |
| `contractPrivatePostCapiV3PlaceTpSlOrder` | POST | `capi/v3/placeTpSlOrder` | 5 |
| `contractPrivatePostCapiV3ModifyTpSlOrder` | POST | `capi/v3/modifyTpSlOrder` | 5 |
| `contractPrivateDeleteCapiV3Order` | DELETE | `capi/v3/order` | 3 |
| `contractPrivateDeleteCapiV3BatchOrders` | DELETE | `capi/v3/batchOrders` | 10 |
| `contractPrivateDeleteCapiV3AllOpenOrders` | DELETE | `capi/v3/allOpenOrders` | 10 |
| `contractPrivateDeleteCapiV3AlgoOrder` | DELETE | `capi/v3/algoOrder` | 3 |
| `contractPrivateDeleteCapiV3AlgoOpenOrders` | DELETE | `capi/v3/algoOpenOrders` | 10 |

