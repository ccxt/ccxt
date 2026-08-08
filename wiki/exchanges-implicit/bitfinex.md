Every endpoint in `bitfinex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitfinex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetConfConfig`); the snake_case alias (`public_get_conf_config`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetConfConfig`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bitfinex = new ccxt.bitfinex ();
const response = await bitfinex.publicGetConfConfig (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bitfinex = new ccxt.bitfinex ();
const response = await bitfinex.publicGetConfConfig (params);
```

#### **Python**

```python
import ccxt
bitfinex = ccxt.bitfinex()
response = bitfinex.public_get_conf_config(params)
```

#### **PHP**

```php
$bitfinex = new \ccxt\bitfinex();
$response = $bitfinex->public_get_conf_config($params);
```

#### **C#**

```csharp
using ccxt;
var bitfinex = new Bitfinex();
var response = await bitfinex.publicGetConfConfig(parameters);
```

#### **Go**

```go
bitfinex := ccxt.NewBitfinex(nil)
response := <-bitfinex.PublicGetConfConfig(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bitfinex API documentation:** [docs.bitfinex.com](https://docs.bitfinex.com/v2/docs/) · [github.com](https://github.com/bitfinexcom/bitfinex-api-node)

> 136 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api-pub.bitfinex.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetConfConfig` | GET | `conf/{config}` | 2.7 |
| `publicGetConfPubActionObject` | GET | `conf/pub:{action}:{object}` | 2.7 |
| `publicGetConfPubActionObjectDetail` | GET | `conf/pub:{action}:{object}:{detail}` | 2.7 |
| `publicGetConfPubMapObject` | GET | `conf/pub:map:{object}` | 2.7 |
| `publicGetConfPubMapObjectDetail` | GET | `conf/pub:map:{object}:{detail}` | 2.7 |
| `publicGetConfPubMapCurrencyDetail` | GET | `conf/pub:map:currency:{detail}` | 2.7 |
| `publicGetConfPubMapCurrencySym` | GET | `conf/pub:map:currency:sym` | 2.7 |
| `publicGetConfPubMapCurrencyLabel` | GET | `conf/pub:map:currency:label` | 2.7 |
| `publicGetConfPubMapCurrencyUnit` | GET | `conf/pub:map:currency:unit` | 2.7 |
| `publicGetConfPubMapCurrencyUndl` | GET | `conf/pub:map:currency:undl` | 2.7 |
| `publicGetConfPubMapCurrencyPool` | GET | `conf/pub:map:currency:pool` | 2.7 |
| `publicGetConfPubMapCurrencyExplorer` | GET | `conf/pub:map:currency:explorer` | 2.7 |
| `publicGetConfPubMapCurrencyTxFee` | GET | `conf/pub:map:currency:tx:fee` | 2.7 |
| `publicGetConfPubMapTxMethod` | GET | `conf/pub:map:tx:method` | 2.7 |
| `publicGetConfPubListObject` | GET | `conf/pub:list:{object}` | 2.7 |
| `publicGetConfPubListObjectDetail` | GET | `conf/pub:list:{object}:{detail}` | 2.7 |
| `publicGetConfPubListCurrency` | GET | `conf/pub:list:currency` | 2.7 |
| `publicGetConfPubListPairExchange` | GET | `conf/pub:list:pair:exchange` | 2.7 |
| `publicGetConfPubListPairMargin` | GET | `conf/pub:list:pair:margin` | 2.7 |
| `publicGetConfPubListPairFutures` | GET | `conf/pub:list:pair:futures` | 2.7 |
| `publicGetConfPubListCompetitions` | GET | `conf/pub:list:competitions` | 2.7 |
| `publicGetConfPubInfoObject` | GET | `conf/pub:info:{object}` | 2.7 |
| `publicGetConfPubInfoObjectDetail` | GET | `conf/pub:info:{object}:{detail}` | 2.7 |
| `publicGetConfPubInfoPair` | GET | `conf/pub:info:pair` | 2.7 |
| `publicGetConfPubInfoPairFutures` | GET | `conf/pub:info:pair:futures` | 2.7 |
| `publicGetConfPubInfoTxStatus` | GET | `conf/pub:info:tx:status` | 2.7 |
| `publicGetConfPubFees` | GET | `conf/pub:fees` | 2.7 |
| `publicGetPlatformStatus` | GET | `platform/status` | 8 |
| `publicGetTickers` | GET | `tickers` | 2.7 |
| `publicGetTickerSymbol` | GET | `ticker/{symbol}` | 2.7 |
| `publicGetTickersHist` | GET | `tickers/hist` | 2.7 |
| `publicGetTradesSymbolHist` | GET | `trades/{symbol}/hist` | 2.7 |
| `publicGetBookSymbolPrecision` | GET | `book/{symbol}/{precision}` | 1 |
| `publicGetBookSymbolP0` | GET | `book/{symbol}/P0` | 1 |
| `publicGetBookSymbolP1` | GET | `book/{symbol}/P1` | 1 |
| `publicGetBookSymbolP2` | GET | `book/{symbol}/P2` | 1 |
| `publicGetBookSymbolP3` | GET | `book/{symbol}/P3` | 1 |
| `publicGetBookSymbolR0` | GET | `book/{symbol}/R0` | 1 |
| `publicGetStats1KeySizeSymbolSideSection` | GET | `stats1/{key}:{size}:{symbol}:{side}/{section}` | 2.7 |
| `publicGetStats1KeySizeSymbolSideLast` | GET | `stats1/{key}:{size}:{symbol}:{side}/last` | 2.7 |
| `publicGetStats1KeySizeSymbolSideHist` | GET | `stats1/{key}:{size}:{symbol}:{side}/hist` | 2.7 |
| `publicGetStats1KeySizeSymbolSection` | GET | `stats1/{key}:{size}:{symbol}/{section}` | 2.7 |
| `publicGetStats1KeySizeSymbolLast` | GET | `stats1/{key}:{size}:{symbol}/last` | 2.7 |
| `publicGetStats1KeySizeSymbolHist` | GET | `stats1/{key}:{size}:{symbol}/hist` | 2.7 |
| `publicGetStats1KeySizeSymbolLongLast` | GET | `stats1/{key}:{size}:{symbol}:long/last` | 2.7 |
| `publicGetStats1KeySizeSymbolLongHist` | GET | `stats1/{key}:{size}:{symbol}:long/hist` | 2.7 |
| `publicGetStats1KeySizeSymbolShortLast` | GET | `stats1/{key}:{size}:{symbol}:short/last` | 2.7 |
| `publicGetStats1KeySizeSymbolShortHist` | GET | `stats1/{key}:{size}:{symbol}:short/hist` | 2.7 |
| `publicGetCandlesTradeTimeframeSymbolPeriodSection` | GET | `candles/trade:{timeframe}:{symbol}:{period}/{section}` | 2.7 |
| `publicGetCandlesTradeTimeframeSymbolSection` | GET | `candles/trade:{timeframe}:{symbol}/{section}` | 2.7 |
| `publicGetCandlesTradeTimeframeSymbolLast` | GET | `candles/trade:{timeframe}:{symbol}/last` | 2.7 |
| `publicGetCandlesTradeTimeframeSymbolHist` | GET | `candles/trade:{timeframe}:{symbol}/hist` | 2.7 |
| `publicGetStatusType` | GET | `status/{type}` | 2.7 |
| `publicGetStatusDeriv` | GET | `status/deriv` | 2.7 |
| `publicGetStatusDerivSymbolHist` | GET | `status/deriv/{symbol}/hist` | 2.7 |
| `publicGetLiquidationsHist` | GET | `liquidations/hist` | 80 |
| `publicGetRankingsKeyTimeframeSymbolSection` | GET | `rankings/{key}:{timeframe}:{symbol}/{section}` | 2.7 |
| `publicGetRankingsKeyTimeframeSymbolHist` | GET | `rankings/{key}:{timeframe}:{symbol}/hist` | 2.7 |
| `publicGetPulseHist` | GET | `pulse/hist` | 2.7 |
| `publicGetPulseProfileNickname` | GET | `pulse/profile/{nickname}` | 2.7 |
| `publicGetFundingStatsSymbolHist` | GET | `funding/stats/{symbol}/hist` | 10 |
| `publicGetExtVasps` | GET | `ext/vasps` | 1 |
| `publicPostCalcTradeAvg` | POST | `calc/trade/avg` | 2.7 |
| `publicPostCalcFx` | POST | `calc/fx` | 2.7 |

## private

**Base URL**: `https://api.bitfinex.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostAuthRWallets` | POST | `auth/r/wallets` | 2.7 |
| `privatePostAuthRWalletsHist` | POST | `auth/r/wallets/hist` | 2.7 |
| `privatePostAuthROrders` | POST | `auth/r/orders` | 2.7 |
| `privatePostAuthROrdersSymbol` | POST | `auth/r/orders/{symbol}` | 2.7 |
| `privatePostAuthWOrderSubmit` | POST | `auth/w/order/submit` | 2.7 |
| `privatePostAuthWOrderUpdate` | POST | `auth/w/order/update` | 2.7 |
| `privatePostAuthWOrderCancel` | POST | `auth/w/order/cancel` | 2.7 |
| `privatePostAuthWOrderMulti` | POST | `auth/w/order/multi` | 2.7 |
| `privatePostAuthWOrderCancelMulti` | POST | `auth/w/order/cancel/multi` | 2.7 |
| `privatePostAuthROrdersSymbolHist` | POST | `auth/r/orders/{symbol}/hist` | 2.7 |
| `privatePostAuthROrdersHist` | POST | `auth/r/orders/hist` | 2.7 |
| `privatePostAuthROrderSymbolIdTrades` | POST | `auth/r/order/{symbol}:{id}/trades` | 2.7 |
| `privatePostAuthRTradesSymbolHist` | POST | `auth/r/trades/{symbol}/hist` | 2.7 |
| `privatePostAuthRTradesHist` | POST | `auth/r/trades/hist` | 2.7 |
| `privatePostAuthRLedgersCurrencyHist` | POST | `auth/r/ledgers/{currency}/hist` | 2.7 |
| `privatePostAuthRLedgersHist` | POST | `auth/r/ledgers/hist` | 2.7 |
| `privatePostAuthRInfoMarginKey` | POST | `auth/r/info/margin/{key}` | 2.7 |
| `privatePostAuthRInfoMarginBase` | POST | `auth/r/info/margin/base` | 2.7 |
| `privatePostAuthRInfoMarginSymAll` | POST | `auth/r/info/margin/sym_all` | 2.7 |
| `privatePostAuthRPositions` | POST | `auth/r/positions` | 2.7 |
| `privatePostAuthWPositionClaim` | POST | `auth/w/position/claim` | 2.7 |
| `privatePostAuthWPositionIncrease` | POST | `auth/w/position/increase:` | 2.7 |
| `privatePostAuthRPositionIncreaseInfo` | POST | `auth/r/position/increase/info` | 2.7 |
| `privatePostAuthRPositionsHist` | POST | `auth/r/positions/hist` | 2.7 |
| `privatePostAuthRPositionsAudit` | POST | `auth/r/positions/audit` | 2.7 |
| `privatePostAuthRPositionsSnap` | POST | `auth/r/positions/snap` | 2.7 |
| `privatePostAuthWDerivCollateralSet` | POST | `auth/w/deriv/collateral/set` | 2.7 |
| `privatePostAuthWDerivCollateralLimits` | POST | `auth/w/deriv/collateral/limits` | 2.7 |
| `privatePostAuthRFundingOffers` | POST | `auth/r/funding/offers` | 2.7 |
| `privatePostAuthRFundingOffersSymbol` | POST | `auth/r/funding/offers/{symbol}` | 2.7 |
| `privatePostAuthWFundingOfferSubmit` | POST | `auth/w/funding/offer/submit` | 2.7 |
| `privatePostAuthWFundingOfferCancel` | POST | `auth/w/funding/offer/cancel` | 2.7 |
| `privatePostAuthWFundingOfferCancelAll` | POST | `auth/w/funding/offer/cancel/all` | 2.7 |
| `privatePostAuthWFundingClose` | POST | `auth/w/funding/close` | 2.7 |
| `privatePostAuthWFundingAuto` | POST | `auth/w/funding/auto` | 2.7 |
| `privatePostAuthWFundingKeep` | POST | `auth/w/funding/keep` | 2.7 |
| `privatePostAuthRFundingOffersSymbolHist` | POST | `auth/r/funding/offers/{symbol}/hist` | 2.7 |
| `privatePostAuthRFundingOffersHist` | POST | `auth/r/funding/offers/hist` | 2.7 |
| `privatePostAuthRFundingLoans` | POST | `auth/r/funding/loans` | 2.7 |
| `privatePostAuthRFundingLoansHist` | POST | `auth/r/funding/loans/hist` | 2.7 |
| `privatePostAuthRFundingLoansSymbol` | POST | `auth/r/funding/loans/{symbol}` | 2.7 |
| `privatePostAuthRFundingLoansSymbolHist` | POST | `auth/r/funding/loans/{symbol}/hist` | 2.7 |
| `privatePostAuthRFundingCredits` | POST | `auth/r/funding/credits` | 2.7 |
| `privatePostAuthRFundingCreditsHist` | POST | `auth/r/funding/credits/hist` | 2.7 |
| `privatePostAuthRFundingCreditsSymbol` | POST | `auth/r/funding/credits/{symbol}` | 2.7 |
| `privatePostAuthRFundingCreditsSymbolHist` | POST | `auth/r/funding/credits/{symbol}/hist` | 2.7 |
| `privatePostAuthRFundingTradesSymbolHist` | POST | `auth/r/funding/trades/{symbol}/hist` | 2.7 |
| `privatePostAuthRFundingTradesHist` | POST | `auth/r/funding/trades/hist` | 2.7 |
| `privatePostAuthRInfoFundingKey` | POST | `auth/r/info/funding/{key}` | 2.7 |
| `privatePostAuthRInfoUser` | POST | `auth/r/info/user` | 2.7 |
| `privatePostAuthRSummary` | POST | `auth/r/summary` | 2.7 |
| `privatePostAuthRLoginsHist` | POST | `auth/r/logins/hist` | 2.7 |
| `privatePostAuthRPermissions` | POST | `auth/r/permissions` | 2.7 |
| `privatePostAuthWToken` | POST | `auth/w/token` | 2.7 |
| `privatePostAuthRAuditHist` | POST | `auth/r/audit/hist` | 2.7 |
| `privatePostAuthWTransfer` | POST | `auth/w/transfer` | 2.7 |
| `privatePostAuthWDepositAddress` | POST | `auth/w/deposit/address` | 24 |
| `privatePostAuthWDepositInvoice` | POST | `auth/w/deposit/invoice` | 24 |
| `privatePostAuthWWithdraw` | POST | `auth/w/withdraw` | 24 |
| `privatePostAuthRMovementsCurrencyHist` | POST | `auth/r/movements/{currency}/hist` | 2.7 |
| `privatePostAuthRMovementsHist` | POST | `auth/r/movements/hist` | 2.7 |
| `privatePostAuthRAlerts` | POST | `auth/r/alerts` | 5.34 |
| `privatePostAuthWAlertSet` | POST | `auth/w/alert/set` | 2.7 |
| `privatePostAuthWAlertPriceSymbolPriceDel` | POST | `auth/w/alert/price:{symbol}:{price}/del` | 2.7 |
| `privatePostAuthWAlertTypeSymbolPriceDel` | POST | `auth/w/alert/{type}:{symbol}:{price}/del` | 2.7 |
| `privatePostAuthCalcOrderAvail` | POST | `auth/calc/order/avail` | 2.7 |
| `privatePostAuthWSettingsSet` | POST | `auth/w/settings/set` | 2.7 |
| `privatePostAuthRSettings` | POST | `auth/r/settings` | 2.7 |
| `privatePostAuthWSettingsDel` | POST | `auth/w/settings/del` | 2.7 |
| `privatePostAuthRPulseHist` | POST | `auth/r/pulse/hist` | 2.7 |
| `privatePostAuthWPulseAdd` | POST | `auth/w/pulse/add` | 16 |
| `privatePostAuthWPulseDel` | POST | `auth/w/pulse/del` | 2.7 |

