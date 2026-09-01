Every endpoint in `bithumb`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bithumb) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetPublicTickerALLQuoteId`); the snake_case alias (`public_get_public_ticker_all_quoteid`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetPublicTickerALLQuoteId`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bithumb = new ccxt.bithumb ();
const response = await bithumb.publicGetPublicTickerALLQuoteId (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bithumb = new ccxt.bithumb ();
const response = await bithumb.publicGetPublicTickerALLQuoteId (params);
```

#### **Python**

```python
import ccxt
bithumb = ccxt.bithumb()
response = bithumb.public_get_public_ticker_all_quoteid(params)
```

#### **PHP**

```php
$bithumb = new \ccxt\bithumb();
$response = $bithumb->public_get_public_ticker_all_quoteid($params);
```

#### **C#**

```csharp
using ccxt;
var bithumb = new Bithumb();
var response = await bithumb.publicGetPublicTickerALLQuoteId(parameters);
```

#### **Go**

```go
bithumb := ccxt.NewBithumb(nil)
response := <-bithumb.PublicGetPublicTickerALLQuoteId(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bithumb API documentation:** [apidocs.bithumb.com](https://apidocs.bithumb.com)

> 67 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetPublicTickerALLQuoteId` | GET | `public/ticker/ALL_{quoteId}` | 1 |
| `publicGetPublicTickerBaseIdQuoteId` | GET | `public/ticker/{baseId}_{quoteId}` | 1 |
| `publicGetPublicOrderbookALLQuoteId` | GET | `public/orderbook/ALL_{quoteId}` | 1 |
| `publicGetPublicOrderbookBaseIdQuoteId` | GET | `public/orderbook/{baseId}_{quoteId}` | 1 |
| `publicGetPublicTransactionHistoryBaseIdQuoteId` | GET | `public/transaction_history/{baseId}_{quoteId}` | 1 |
| `publicGetPublicNetworkInfo` | GET | `public/network-info` | 1 |
| `publicGetPublicAssetsstatusMultichainALL` | GET | `public/assetsstatus/multichain/ALL` | 1 |
| `publicGetPublicAssetsstatusMultichainCurrency` | GET | `public/assetsstatus/multichain/{currency}` | 1 |
| `publicGetPublicWithdrawMinimumALL` | GET | `public/withdraw/minimum/ALL` | 1 |
| `publicGetPublicWithdrawMinimumCurrency` | GET | `public/withdraw/minimum/{currency}` | 1 |
| `publicGetPublicAssetsstatusALL` | GET | `public/assetsstatus/ALL` | 1 |
| `publicGetPublicAssetsstatusBaseId` | GET | `public/assetsstatus/{baseId}` | 1 |
| `publicGetPublicCandlestickBaseIdQuoteIdInterval` | GET | `public/candlestick/{baseId}_{quoteId}/{interval}` | 1 |
| `publicGetV1MarketAll` | GET | `v1/market/all` | 1 |
| `publicGetV1CandlesMinutesUnit` | GET | `v1/candles/minutes/{unit}` | 1 |
| `publicGetV1CandlesDays` | GET | `v1/candles/days` | 1 |
| `publicGetV1CandlesWeeks` | GET | `v1/candles/weeks` | 1 |
| `publicGetV1CandlesMonths` | GET | `v1/candles/months` | 1 |
| `publicGetV1TradesTicks` | GET | `v1/trades/ticks` | 1 |
| `publicGetV1Ticker` | GET | `v1/ticker` | 1 |
| `publicGetV1Orderbook` | GET | `v1/orderbook` | 1 |
| `publicGetV1MarketVirtualAssetWarning` | GET | `v1/market/virtual_asset_warning` | 1 |
| `publicGetV1Notices` | GET | `v1/notices` | 1 |
| `publicGetV2FeeInoutCurrency` | GET | `v2/fee/inout/{currency}` | 1 |

## private

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetV1Accounts` | GET | `v1/accounts` | 1 |
| `privateGetV1OrdersChance` | GET | `v1/orders/chance` | 1 |
| `privateGetV1Order` | GET | `v1/order` | 1 |
| `privateGetV1Orders` | GET | `v1/orders` | 1 |
| `privateGetV1Twap` | GET | `v1/twap` | 1 |
| `privateGetV1Withdraws` | GET | `v1/withdraws` | 1 |
| `privateGetV1WithdrawsKrw` | GET | `v1/withdraws/krw` | 1 |
| `privateGetV1Withdraw` | GET | `v1/withdraw` | 1 |
| `privateGetV1WithdrawsChance` | GET | `v1/withdraws/chance` | 1 |
| `privateGetV1WithdrawsCoinAddresses` | GET | `v1/withdraws/coin_addresses` | 1 |
| `privateGetV1Deposits` | GET | `v1/deposits` | 1 |
| `privateGetV1DepositsKrw` | GET | `v1/deposits/krw` | 1 |
| `privateGetV1Deposit` | GET | `v1/deposit` | 1 |
| `privateGetV1DepositsCoinAddresses` | GET | `v1/deposits/coin_addresses` | 1 |
| `privateGetV1DepositsCoinAddress` | GET | `v1/deposits/coin_address` | 1 |
| `privateGetV1StatusWallet` | GET | `v1/status/wallet` | 1 |
| `privateGetV1ApiKeys` | GET | `v1/api_keys` | 1 |
| `privatePostInfoAccount` | POST | `info/account` | 1 |
| `privatePostInfoBalance` | POST | `info/balance` | 1 |
| `privatePostInfoWalletAddress` | POST | `info/wallet_address` | 1 |
| `privatePostInfoTicker` | POST | `info/ticker` | 1 |
| `privatePostInfoOrders` | POST | `info/orders` | 1 |
| `privatePostInfoUserTransactions` | POST | `info/user_transactions` | 1 |
| `privatePostInfoOrderDetail` | POST | `info/order_detail` | 1 |
| `privatePostTradePlace` | POST | `trade/place` | 5 |
| `privatePostTradeCancel` | POST | `trade/cancel` | 5 |
| `privatePostTradeBtcWithdrawal` | POST | `trade/btc_withdrawal` | 1 |
| `privatePostTradeKrwDeposit` | POST | `trade/krw_deposit` | 1 |
| `privatePostTradeKrwWithdrawal` | POST | `trade/krw_withdrawal` | 1 |
| `privatePostTradeMarketBuy` | POST | `trade/market_buy` | 1 |
| `privatePostTradeMarketSell` | POST | `trade/market_sell` | 1 |
| `privatePostTradeStopLimit` | POST | `trade/stop_limit` | 1 |
| `privatePostV2Orders` | POST | `v2/orders` | 1 |
| `privatePostV2OrdersBatch` | POST | `v2/orders/batch` | 6 |
| `privatePostV2OrdersCancel` | POST | `v2/orders/cancel` | 6 |
| `privatePostV1Twap` | POST | `v1/twap` | 1 |
| `privatePostV1WithdrawsCoin` | POST | `v1/withdraws/coin` | 1 |
| `privatePostV1WithdrawsKrw` | POST | `v1/withdraws/krw` | 1 |
| `privatePostV1DepositsGenerateCoinAddress` | POST | `v1/deposits/generate_coin_address` | 1 |
| `privatePostV1DepositsKrw` | POST | `v1/deposits/krw` | 1 |
| `privateDeleteV2Order` | DELETE | `v2/order` | 1 |
| `privateDeleteV1Twap` | DELETE | `v1/twap` | 1 |
| `privateDeleteV1WithdrawsCoin` | DELETE | `v1/withdraws/coin` | 1 |

