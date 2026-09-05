Every endpoint in `btse`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/btse) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetSpotApiV33MarketSummary`); the snake_case alias (`public_get_spot_api_v3_3_market_summary`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetSpotApiV33MarketSummary`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const btse = new ccxt.btse ();
const response = await btse.publicGetSpotApiV33MarketSummary (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const btse = new ccxt.btse ();
const response = await btse.publicGetSpotApiV33MarketSummary (params);
```

#### **Python**

```python
import ccxt
btse = ccxt.btse()
response = btse.public_get_spot_api_v3_3_market_summary(params)
```

#### **PHP**

```php
$btse = new \ccxt\btse();
$response = $btse->public_get_spot_api_v3_3_market_summary($params);
```

#### **C#**

```csharp
using ccxt;
var btse = new Btse();
var response = await btse.publicGetSpotApiV33MarketSummary(parameters);
```

#### **Go**

```go
btse := ccxt.NewBtse(nil)
response := <-btse.PublicGetSpotApiV33MarketSummary(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official btse API documentation:** [support.btse.com](https://support.btse.com/en/support/solutions/articles/43000044751-btse-api)

> 128 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.btse.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetSpotApiV33MarketSummary` | GET | `spot/api/v3.3/market_summary` | 5 |
| `publicGetSpotApiV33Ohlcv` | GET | `spot/api/v3.3/ohlcv` | 5 |
| `publicGetSpotApiV33Price` | GET | `spot/api/v3.3/price` | 5 |
| `publicGetSpotApiV33Orderbook` | GET | `spot/api/v3.3/orderbook` | 5 |
| `publicGetSpotApiV33OrderbookL2` | GET | `spot/api/v3.3/orderbook/L2` | 5 |
| `publicGetSpotApiV33Trades` | GET | `spot/api/v3.3/trades` | 5 |
| `publicGetSpotApiV33Time` | GET | `spot/api/v3.3/time` | 5 |
| `publicGetFuturesApiV23MarketSummary` | GET | `futures/api/v2.3/market_summary` | 5 |
| `publicGetFuturesApiV23Ohlcv` | GET | `futures/api/v2.3/ohlcv` | 5 |
| `publicGetFuturesApiV23Price` | GET | `futures/api/v2.3/price` | 5 |
| `publicGetFuturesApiV23Orderbook` | GET | `futures/api/v2.3/orderbook` | 5 |
| `publicGetFuturesApiV23OrderbookL2` | GET | `futures/api/v2.3/orderbook/L2` | 5 |
| `publicGetFuturesApiV23Trades` | GET | `futures/api/v2.3/trades` | 5 |
| `publicGetFuturesApiV23FundingHistory` | GET | `futures/api/v2.3/funding_history` | 5 |
| `publicGetFuturesApiV23MarketRiskLimit` | GET | `futures/api/v2.3/market/risk_limit` | 5 |
| `publicGetSpotApiV32AvailableCurrencyNetworks` | GET | `spot/api/v3.2/availableCurrencyNetworks` | 15 |
| `publicGetSpotApiV32ExchangeRate` | GET | `spot/api/v3.2/exchangeRate` | 15 |
| `publicGetPublicApiWalletV1CryptoNetworks` | GET | `public-api/wallet/v1/crypto/networks` | 15 |
| `publicGetPublicApiWalletV1AssetsExchangeRate` | GET | `public-api/wallet/v1/assets/exchangeRate` | 15 |
| `publicGetPublicApiMarketV1Markets` | GET | `public-api/market/v1/markets` | 3 |
| `publicGetPublicApiMarketV1ExchangeInfo` | GET | `public-api/market/v1/exchangeInfo` | 3 |
| `publicGetPublicApiMarketV1Orderbook` | GET | `public-api/market/v1/orderbook` | 3 |
| `publicGetPublicApiMarketV1Trades` | GET | `public-api/market/v1/trades` | 3 |
| `publicGetPublicApiMarketV1Klines` | GET | `public-api/market/v1/klines` | 3 |
| `publicGetPublicApiMarketV1Ticker24hr` | GET | `public-api/market/v1/ticker/24hr` | 3 |
| `publicGetPublicApiMarketV1TickerPrice` | GET | `public-api/market/v1/ticker/price` | 3 |
| `publicGetPublicApiMarketV1TickerIndices` | GET | `public-api/market/v1/ticker/indices` | 3 |
| `publicGetPublicApiMarketV1TickerL1` | GET | `public-api/market/v1/ticker/l1` | 3 |
| `publicGetPublicApiMarketV1RecentFundingHistory` | GET | `public-api/market/v1/recentFundingHistory` | 3 |
| `publicGetPublicApiMarketV1RiskLimits` | GET | `public-api/market/v1/riskLimits` | 3 |
| `publicGetPublicApiWalletV1CryptoList` | GET | `public-api/wallet/v1/crypto/list` | 15 |
| `publicGetPublicApiOtcV1Markets` | GET | `public-api/otc/v1/markets` | 1 |

## private

**Base URL**: `https://api.btse.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetSpotApiV33Order` | GET | `spot/api/v3.3/order` | 1 |
| `privateGetSpotApiV33UserOpenOrders` | GET | `spot/api/v3.3/user/open_orders` | 5 |
| `privateGetSpotApiV33UserTradeHistory` | GET | `spot/api/v3.3/user/trade_history` | 5 |
| `privateGetSpotApiV33UserFees` | GET | `spot/api/v3.3/user/fees` | 5 |
| `privateGetSpotApiV33InvestProducts` | GET | `spot/api/v3.3/invest/products` | 5 |
| `privateGetSpotApiV33InvestOrders` | GET | `spot/api/v3.3/invest/orders` | 5 |
| `privateGetSpotApiV33InvestHistory` | GET | `spot/api/v3.3/invest/history` | 5 |
| `privateGetFuturesApiV23Order` | GET | `futures/api/v2.3/order` | 1 |
| `privateGetFuturesApiV23UserOpenOrders` | GET | `futures/api/v2.3/user/open_orders` | 1 |
| `privateGetFuturesApiV23UserTradeHistory` | GET | `futures/api/v2.3/user/trade_history` | 5 |
| `privateGetFuturesApiV23UserPositions` | GET | `futures/api/v2.3/user/positions` | 5 |
| `privateGetFuturesApiV23RiskLimit` | GET | `futures/api/v2.3/risk_limit` | 5 |
| `privateGetFuturesApiV23Leverage` | GET | `futures/api/v2.3/leverage` | 5 |
| `privateGetFuturesApiV23UserFees` | GET | `futures/api/v2.3/user/fees` | 5 |
| `privateGetFuturesApiV23PositionMode` | GET | `futures/api/v2.3/position_mode` | 5 |
| `privateGetFuturesApiV23UserMarginSetting` | GET | `futures/api/v2.3/user/margin_setting` | 5 |
| `privateGetFuturesApiV23UserWallet` | GET | `futures/api/v2.3/user/wallet` | 5 |
| `privateGetFuturesApiV23UserWalletHistory` | GET | `futures/api/v2.3/user/wallet_history` | 5 |
| `privateGetFuturesApiV23UserUnifiedWalletMargin` | GET | `futures/api/v2.3/user/unifiedWallet/margin` | 5 |
| `privateGetFuturesApiV23UserMargin` | GET | `futures/api/v2.3/user/margin` | 5 |
| `privateGetOtcApiV1GetMarket` | GET | `otc/api/v1/getMarket` | 1 |
| `privateGetSpotApiV32UserWallet` | GET | `spot/api/v3.2/user/wallet` | 15 |
| `privateGetSpotApiV32UserWalletHistory` | GET | `spot/api/v3.2/user/wallet_history` | 15 |
| `privateGetSpotApiV33UserWalletAddress` | GET | `spot/api/v3.3/user/wallet/address` | 15 |
| `privateGetSpotApiV32AvailableCurrencies` | GET | `spot/api/v3.2/availableCurrencies` | 15 |
| `privateGetSpotApiV32SubaccountWalletHistory` | GET | `spot/api/v3.2/subaccount/wallet/history` | 15 |
| `privateGetSpotApiV4TradeOrders` | GET | `spot/api/v4/trade/orders` | 5 |
| `privateGetSpotApiV4TradeOrder` | GET | `spot/api/v4/trade/order` | 5 |
| `privateGetSpotApiV4TradeTradeHistory` | GET | `spot/api/v4/trade/trade_history` | 5 |
| `privateGetSpotApiV4TradeFees` | GET | `spot/api/v4/trade/fees` | 5 |
| `privateGetFuturesApiV3TradeOrders` | GET | `futures/api/v3/trade/orders` | 5 |
| `privateGetFuturesApiV3TradeRiskLimit` | GET | `futures/api/v3/trade/risk_limit` | 5 |
| `privateGetFuturesApiV3TradePositionMode` | GET | `futures/api/v3/trade/position_mode` | 5 |
| `privateGetFuturesApiV3TradeLeverage` | GET | `futures/api/v3/trade/leverage` | 5 |
| `privateGetFuturesApiV3TradeTradeHistory` | GET | `futures/api/v3/trade/trade_history` | 5 |
| `privateGetFuturesApiV3TradePositions` | GET | `futures/api/v3/trade/positions` | 5 |
| `privateGetFuturesApiV3TradeMarginSetting` | GET | `futures/api/v3/trade/margin_setting` | 5 |
| `privateGetPublicApiWalletV1Assets` | GET | `public-api/wallet/v1/assets` | 15 |
| `privateGetPublicApiWalletV1UserAssets` | GET | `public-api/wallet/v1/user/assets` | 15 |
| `privateGetPublicApiWalletV1UserWalletHistory` | GET | `public-api/wallet/v1/user/walletHistory` | 15 |
| `privateGetPublicApiWalletV1UserCryptoAddress` | GET | `public-api/wallet/v1/user/crypto/address` | 15 |
| `privateGetPublicApiOtcV1Quotes` | GET | `public-api/otc/v1/quotes` | 1 |
| `privatePostSpotApiV33Order` | POST | `spot/api/v3.3/order` | 1 |
| `privatePostSpotApiV33OrderPeg` | POST | `spot/api/v3.3/order/peg` | 1 |
| `privatePostSpotApiV33OrderCancelAllAfter` | POST | `spot/api/v3.3/order/cancelAllAfter` | 1 |
| `privatePostSpotApiV33InvestDeposit` | POST | `spot/api/v3.3/invest/deposit` | 5 |
| `privatePostSpotApiV33InvestRenew` | POST | `spot/api/v3.3/invest/renew` | 5 |
| `privatePostSpotApiV33InvestRedeem` | POST | `spot/api/v3.3/invest/redeem` | 5 |
| `privatePostFuturesApiV23Order` | POST | `futures/api/v2.3/order` | 1 |
| `privatePostFuturesApiV23OrderPeg` | POST | `futures/api/v2.3/order/peg` | 1 |
| `privatePostFuturesApiV23OrderCancelAllAfter` | POST | `futures/api/v2.3/order/cancelAllAfter` | 1 |
| `privatePostFuturesApiV23OrderClosePosition` | POST | `futures/api/v2.3/order/close_position` | 1 |
| `privatePostFuturesApiV23RiskLimit` | POST | `futures/api/v2.3/risk_limit` | 5 |
| `privatePostFuturesApiV23Leverage` | POST | `futures/api/v2.3/leverage` | 5 |
| `privatePostFuturesApiV23SettleIn` | POST | `futures/api/v2.3/settle_in` | 5 |
| `privatePostFuturesApiV23OrderBindTpsl` | POST | `futures/api/v2.3/order/bind/tpsl` | 1 |
| `privatePostFuturesApiV23PositionMode` | POST | `futures/api/v2.3/position_mode` | 5 |
| `privatePostFuturesApiV23UserWalletTransfer` | POST | `futures/api/v2.3/user/wallet/transfer` | 5 |
| `privatePostFuturesApiV23SubaccountWalletTransfer` | POST | `futures/api/v2.3/subaccount/wallet/transfer` | 5 |
| `privatePostOtcApiV1Quote` | POST | `otc/api/v1/quote` | 1 |
| `privatePostOtcApiV1AcceptQuoteId` | POST | `otc/api/v1/accept/{quoteId}` | 1 |
| `privatePostOtcApiV1RejectQuoteId` | POST | `otc/api/v1/reject/{quoteId}` | 1 |
| `privatePostOtcApiV1QueryOrderQuoteId` | POST | `otc/api/v1/queryOrder/{quoteId}` | 1 |
| `privatePostSpotApiV33UserWalletAddress` | POST | `spot/api/v3.3/user/wallet/address` | 15 |
| `privatePostSpotApiV33UserWalletWithdraw` | POST | `spot/api/v3.3/user/wallet/withdraw` | 15 |
| `privatePostSpotApiV32UserWalletConvert` | POST | `spot/api/v3.2/user/wallet/convert` | 15 |
| `privatePostSpotApiV33UserWalletTransfer` | POST | `spot/api/v3.3/user/wallet/transfer` | 15 |
| `privatePostSpotApiV4TradeOrders` | POST | `spot/api/v4/trade/orders` | 1 |
| `privatePostSpotApiV4TradeOrdersCancelAllAfter` | POST | `spot/api/v4/trade/orders/cancel_all_after` | 1 |
| `privatePostSpotApiV4TradeOrdersAlgo` | POST | `spot/api/v4/trade/orders/algo` | 1 |
| `privatePostFuturesApiV3TradeOrders` | POST | `futures/api/v3/trade/orders` | 1 |
| `privatePostFuturesApiV3TradeOrdersCancelAllAfter` | POST | `futures/api/v3/trade/orders/cancel_all_after` | 1 |
| `privatePostFuturesApiV3TradeOrdersAlgo` | POST | `futures/api/v3/trade/orders/algo` | 1 |
| `privatePostFuturesApiV3TradeSettleIn` | POST | `futures/api/v3/trade/settle_in` | 5 |
| `privatePostFuturesApiV3TradeRiskLimit` | POST | `futures/api/v3/trade/risk_limit` | 5 |
| `privatePostFuturesApiV3TradePositionsTpsl` | POST | `futures/api/v3/trade/positions/tpsl` | 1 |
| `privatePostFuturesApiV3TradePositionMode` | POST | `futures/api/v3/trade/position_mode` | 1 |
| `privatePostFuturesApiV3TradeLeverage` | POST | `futures/api/v3/trade/leverage` | 1 |
| `privatePostPublicApiWalletV1UserCryptoAddress` | POST | `public-api/wallet/v1/user/crypto/address` | 15 |
| `privatePostPublicApiWalletV1UserCryptoWithdraw` | POST | `public-api/wallet/v1/user/crypto/withdraw` | 15 |
| `privatePostPublicApiWalletV1UserAssetsSendTo` | POST | `public-api/wallet/v1/user/assets/sendTo` | 15 |
| `privatePostPublicApiWalletV1UserAssetsConvert` | POST | `public-api/wallet/v1/user/assets/convert` | 15 |
| `privatePostPublicApiOtcV1Quotes` | POST | `public-api/otc/v1/quotes` | 1 |
| `privatePostPublicApiOtcV1QuotesAccept` | POST | `public-api/otc/v1/quotes/accept` | 1 |
| `privatePutSpotApiV33Order` | PUT | `spot/api/v3.3/order` | 1 |
| `privatePutFuturesApiV23Order` | PUT | `futures/api/v2.3/order` | 1 |
| `privatePutSpotApiV4TradeOrders` | PUT | `spot/api/v4/trade/orders` | 1 |
| `privatePutFuturesApiV3TradeOrders` | PUT | `futures/api/v3/trade/orders` | 1 |
| `privateDeleteSpotApiV33Order` | DELETE | `spot/api/v3.3/order` | 1 |
| `privateDeleteFuturesApiV23Order` | DELETE | `futures/api/v2.3/order` | 1 |
| `privateDeleteSpotApiV33UserWalletAddress` | DELETE | `spot/api/v3.3/user/wallet/address` | 15 |
| `privateDeleteSpotApiV4TradeOrders` | DELETE | `spot/api/v4/trade/orders` | 1 |
| `privateDeleteSpotApiV4TradeOrdersAll` | DELETE | `spot/api/v4/trade/orders/all` | 1 |
| `privateDeleteFuturesApiV3TradeOrders` | DELETE | `futures/api/v3/trade/orders` | 1 |
| `privateDeleteFuturesApiV3TradePositions` | DELETE | `futures/api/v3/trade/positions` | 1 |
| `privateDeletePublicApiWalletV1UserCryptoAddress` | DELETE | `public-api/wallet/v1/user/crypto/address` | 15 |

