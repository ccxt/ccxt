Every endpoint in `hitbtc`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/hitbtc) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetPublicCurrency`); the snake_case alias (`public_get_public_currency`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetPublicCurrency`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const hitbtc = new ccxt.hitbtc ();
const response = await hitbtc.publicGetPublicCurrency (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const hitbtc = new ccxt.hitbtc ();
const response = await hitbtc.publicGetPublicCurrency (params);
```

#### **Python**

```python
import ccxt
hitbtc = ccxt.hitbtc()
response = hitbtc.public_get_public_currency(params)
```

#### **PHP**

```php
$hitbtc = new \ccxt\hitbtc();
$response = $hitbtc->public_get_public_currency($params);
```

#### **C#**

```csharp
using ccxt;
var hitbtc = new Hitbtc();
var response = await hitbtc.publicGetPublicCurrency(parameters);
```

#### **Go**

```go
hitbtc := ccxt.NewHitbtc(nil)
response := <-hitbtc.PublicGetPublicCurrency(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official hitbtc API documentation:** [api.hitbtc.com](https://api.hitbtc.com) · [github.com](https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv2.md)

> 111 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.hitbtc.com/api/3`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetPublicCurrency` | GET | `public/currency` | 10 |
| `publicGetPublicCurrencyCurrency` | GET | `public/currency/{currency}` | 10 |
| `publicGetPublicSymbol` | GET | `public/symbol` | 10 |
| `publicGetPublicSymbolSymbol` | GET | `public/symbol/{symbol}` | 10 |
| `publicGetPublicTicker` | GET | `public/ticker` | 10 |
| `publicGetPublicTickerSymbol` | GET | `public/ticker/{symbol}` | 10 |
| `publicGetPublicPriceRate` | GET | `public/price/rate` | 10 |
| `publicGetPublicPriceHistory` | GET | `public/price/history` | 10 |
| `publicGetPublicPriceTicker` | GET | `public/price/ticker` | 10 |
| `publicGetPublicPriceTickerSymbol` | GET | `public/price/ticker/{symbol}` | 10 |
| `publicGetPublicTrades` | GET | `public/trades` | 10 |
| `publicGetPublicTradesSymbol` | GET | `public/trades/{symbol}` | 10 |
| `publicGetPublicOrderbook` | GET | `public/orderbook` | 10 |
| `publicGetPublicOrderbookSymbol` | GET | `public/orderbook/{symbol}` | 10 |
| `publicGetPublicCandles` | GET | `public/candles` | 10 |
| `publicGetPublicCandlesSymbol` | GET | `public/candles/{symbol}` | 10 |
| `publicGetPublicConvertedCandles` | GET | `public/converted/candles` | 10 |
| `publicGetPublicConvertedCandlesSymbol` | GET | `public/converted/candles/{symbol}` | 10 |
| `publicGetPublicFuturesInfo` | GET | `public/futures/info` | 10 |
| `publicGetPublicFuturesInfoSymbol` | GET | `public/futures/info/{symbol}` | 10 |
| `publicGetPublicFuturesHistoryFunding` | GET | `public/futures/history/funding` | 10 |
| `publicGetPublicFuturesHistoryFundingSymbol` | GET | `public/futures/history/funding/{symbol}` | 10 |
| `publicGetPublicFuturesCandlesIndexPrice` | GET | `public/futures/candles/index_price` | 10 |
| `publicGetPublicFuturesCandlesIndexPriceSymbol` | GET | `public/futures/candles/index_price/{symbol}` | 10 |
| `publicGetPublicFuturesCandlesMarkPrice` | GET | `public/futures/candles/mark_price` | 10 |
| `publicGetPublicFuturesCandlesMarkPriceSymbol` | GET | `public/futures/candles/mark_price/{symbol}` | 10 |
| `publicGetPublicFuturesCandlesPremiumIndex` | GET | `public/futures/candles/premium_index` | 10 |
| `publicGetPublicFuturesCandlesPremiumIndexSymbol` | GET | `public/futures/candles/premium_index/{symbol}` | 10 |
| `publicGetPublicFuturesCandlesOpenInterest` | GET | `public/futures/candles/open_interest` | 10 |
| `publicGetPublicFuturesCandlesOpenInterestSymbol` | GET | `public/futures/candles/open_interest/{symbol}` | 10 |

## private

**Base URL**: `https://api.hitbtc.com/api/3`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetSpotBalance` | GET | `spot/balance` | 15 |
| `privateGetSpotBalanceCurrency` | GET | `spot/balance/{currency}` | 15 |
| `privateGetSpotOrder` | GET | `spot/order` | 1 |
| `privateGetSpotOrderClientOrderId` | GET | `spot/order/{client_order_id}` | 1 |
| `privateGetSpotFee` | GET | `spot/fee` | 15 |
| `privateGetSpotFeeSymbol` | GET | `spot/fee/{symbol}` | 15 |
| `privateGetSpotHistoryOrder` | GET | `spot/history/order` | 15 |
| `privateGetSpotHistoryTrade` | GET | `spot/history/trade` | 15 |
| `privateGetMarginAccount` | GET | `margin/account` | 1 |
| `privateGetMarginAccountIsolatedSymbol` | GET | `margin/account/isolated/{symbol}` | 1 |
| `privateGetMarginAccountCrossCurrency` | GET | `margin/account/cross/{currency}` | 1 |
| `privateGetMarginOrder` | GET | `margin/order` | 1 |
| `privateGetMarginOrderClientOrderId` | GET | `margin/order/{client_order_id}` | 1 |
| `privateGetMarginConfig` | GET | `margin/config` | 15 |
| `privateGetMarginHistoryOrder` | GET | `margin/history/order` | 15 |
| `privateGetMarginHistoryTrade` | GET | `margin/history/trade` | 15 |
| `privateGetMarginHistoryPositions` | GET | `margin/history/positions` | 15 |
| `privateGetMarginHistoryClearing` | GET | `margin/history/clearing` | 15 |
| `privateGetFuturesBalance` | GET | `futures/balance` | 15 |
| `privateGetFuturesBalanceCurrency` | GET | `futures/balance/{currency}` | 15 |
| `privateGetFuturesAccount` | GET | `futures/account` | 1 |
| `privateGetFuturesAccountIsolatedSymbol` | GET | `futures/account/isolated/{symbol}` | 1 |
| `privateGetFuturesOrder` | GET | `futures/order` | 1 |
| `privateGetFuturesOrderClientOrderId` | GET | `futures/order/{client_order_id}` | 1 |
| `privateGetFuturesConfig` | GET | `futures/config` | 15 |
| `privateGetFuturesFee` | GET | `futures/fee` | 15 |
| `privateGetFuturesFeeSymbol` | GET | `futures/fee/{symbol}` | 15 |
| `privateGetFuturesHistoryOrder` | GET | `futures/history/order` | 15 |
| `privateGetFuturesHistoryTrade` | GET | `futures/history/trade` | 15 |
| `privateGetFuturesHistoryPositions` | GET | `futures/history/positions` | 15 |
| `privateGetFuturesHistoryClearing` | GET | `futures/history/clearing` | 15 |
| `privateGetWalletBalance` | GET | `wallet/balance` | 30 |
| `privateGetWalletBalanceCurrency` | GET | `wallet/balance/{currency}` | 30 |
| `privateGetWalletCryptoAddress` | GET | `wallet/crypto/address` | 30 |
| `privateGetWalletCryptoAddressRecentDeposit` | GET | `wallet/crypto/address/recent-deposit` | 30 |
| `privateGetWalletCryptoAddressRecentWithdraw` | GET | `wallet/crypto/address/recent-withdraw` | 30 |
| `privateGetWalletCryptoAddressCheckMine` | GET | `wallet/crypto/address/check-mine` | 30 |
| `privateGetWalletTransactions` | GET | `wallet/transactions` | 30 |
| `privateGetWalletTransactionsTxId` | GET | `wallet/transactions/{tx_id}` | 30 |
| `privateGetWalletCryptoFeeEstimate` | GET | `wallet/crypto/fee/estimate` | 30 |
| `privateGetWalletAirdrops` | GET | `wallet/airdrops` | 30 |
| `privateGetWalletAmountLocks` | GET | `wallet/amount-locks` | 30 |
| `privateGetSubAccount` | GET | `sub-account` | 15 |
| `privateGetSubAccountAcl` | GET | `sub-account/acl` | 15 |
| `privateGetSubAccountBalanceSubAccID` | GET | `sub-account/balance/{subAccID}` | 15 |
| `privateGetSubAccountCryptoAddressSubAccIDCurrency` | GET | `sub-account/crypto/address/{subAccID}/{currency}` | 15 |
| `privatePostSpotOrder` | POST | `spot/order` | 1 |
| `privatePostSpotOrderList` | POST | `spot/order/list` | 1 |
| `privatePostMarginOrder` | POST | `margin/order` | 1 |
| `privatePostMarginOrderList` | POST | `margin/order/list` | 1 |
| `privatePostFuturesOrder` | POST | `futures/order` | 1 |
| `privatePostFuturesOrderList` | POST | `futures/order/list` | 1 |
| `privatePostWalletCryptoAddress` | POST | `wallet/crypto/address` | 30 |
| `privatePostWalletCryptoWithdraw` | POST | `wallet/crypto/withdraw` | 30 |
| `privatePostWalletConvert` | POST | `wallet/convert` | 30 |
| `privatePostWalletTransfer` | POST | `wallet/transfer` | 30 |
| `privatePostWalletInternalWithdraw` | POST | `wallet/internal/withdraw` | 30 |
| `privatePostWalletCryptoCheckOffchainAvailable` | POST | `wallet/crypto/check-offchain-available` | 30 |
| `privatePostWalletCryptoFeesEstimate` | POST | `wallet/crypto/fees/estimate` | 30 |
| `privatePostWalletAirdropsIdClaim` | POST | `wallet/airdrops/{id}/claim` | 30 |
| `privatePostSubAccountFreeze` | POST | `sub-account/freeze` | 15 |
| `privatePostSubAccountActivate` | POST | `sub-account/activate` | 15 |
| `privatePostSubAccountTransfer` | POST | `sub-account/transfer` | 15 |
| `privatePostSubAccountAcl` | POST | `sub-account/acl` | 15 |
| `privatePatchSpotOrderClientOrderId` | PATCH | `spot/order/{client_order_id}` | 1 |
| `privatePatchMarginOrderClientOrderId` | PATCH | `margin/order/{client_order_id}` | 1 |
| `privatePatchFuturesOrderClientOrderId` | PATCH | `futures/order/{client_order_id}` | 1 |
| `privateDeleteSpotOrder` | DELETE | `spot/order` | 1 |
| `privateDeleteSpotOrderClientOrderId` | DELETE | `spot/order/{client_order_id}` | 1 |
| `privateDeleteMarginPosition` | DELETE | `margin/position` | 1 |
| `privateDeleteMarginPositionIsolatedSymbol` | DELETE | `margin/position/isolated/{symbol}` | 1 |
| `privateDeleteMarginOrder` | DELETE | `margin/order` | 1 |
| `privateDeleteMarginOrderClientOrderId` | DELETE | `margin/order/{client_order_id}` | 1 |
| `privateDeleteFuturesPosition` | DELETE | `futures/position` | 1 |
| `privateDeleteFuturesPositionMarginModeSymbol` | DELETE | `futures/position/{margin_mode}/{symbol}` | 1 |
| `privateDeleteFuturesOrder` | DELETE | `futures/order` | 1 |
| `privateDeleteFuturesOrderClientOrderId` | DELETE | `futures/order/{client_order_id}` | 1 |
| `privateDeleteWalletCryptoWithdrawId` | DELETE | `wallet/crypto/withdraw/{id}` | 30 |
| `privatePutMarginAccountIsolatedSymbol` | PUT | `margin/account/isolated/{symbol}` | 1 |
| `privatePutFuturesAccountIsolatedSymbol` | PUT | `futures/account/isolated/{symbol}` | 1 |
| `privatePutWalletCryptoWithdrawId` | PUT | `wallet/crypto/withdraw/{id}` | 30 |

