Every endpoint in `bithumb`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bithumb) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetTickerALLQuoteId`); the snake_case alias (`public_get_ticker_all_quoteid`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetTickerALLQuoteId`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bithumb = new ccxt.bithumb ();
const response = await bithumb.publicGetTickerALLQuoteId (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bithumb = new ccxt.bithumb ();
const response = await bithumb.publicGetTickerALLQuoteId (params);
```

#### **Python**

```python
import ccxt
bithumb = ccxt.bithumb()
response = bithumb.public_get_ticker_all_quoteid(params)
```

#### **PHP**

```php
$bithumb = new \ccxt\bithumb();
$response = $bithumb->public_get_ticker_all_quoteid($params);
```

#### **C#**

```csharp
using ccxt;
var bithumb = new Bithumb();
var response = await bithumb.publicGetTickerALLQuoteId(parameters);
```

#### **Go**

```go
bithumb := ccxt.NewBithumb(nil)
response := <-bithumb.PublicGetTickerALLQuoteId(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bithumb API documentation:** [apidocs.bithumb.com](https://apidocs.bithumb.com)

> 28 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.{hostname}/public`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetTickerALLQuoteId` | GET | `ticker/ALL_{quoteId}` |  |
| `publicGetTickerBaseIdQuoteId` | GET | `ticker/{baseId}_{quoteId}` |  |
| `publicGetOrderbookALLQuoteId` | GET | `orderbook/ALL_{quoteId}` |  |
| `publicGetOrderbookBaseIdQuoteId` | GET | `orderbook/{baseId}_{quoteId}` |  |
| `publicGetTransactionHistoryBaseIdQuoteId` | GET | `transaction_history/{baseId}_{quoteId}` |  |
| `publicGetNetworkInfo` | GET | `network-info` |  |
| `publicGetAssetsstatusMultichainALL` | GET | `assetsstatus/multichain/ALL` |  |
| `publicGetAssetsstatusMultichainCurrency` | GET | `assetsstatus/multichain/{currency}` |  |
| `publicGetWithdrawMinimumALL` | GET | `withdraw/minimum/ALL` |  |
| `publicGetWithdrawMinimumCurrency` | GET | `withdraw/minimum/{currency}` |  |
| `publicGetAssetsstatusALL` | GET | `assetsstatus/ALL` |  |
| `publicGetAssetsstatusBaseId` | GET | `assetsstatus/{baseId}` |  |
| `publicGetCandlestickBaseIdQuoteIdInterval` | GET | `candlestick/{baseId}_{quoteId}/{interval}` |  |

## private

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostInfoAccount` | POST | `info/account` |  |
| `privatePostInfoBalance` | POST | `info/balance` |  |
| `privatePostInfoWalletAddress` | POST | `info/wallet_address` |  |
| `privatePostInfoTicker` | POST | `info/ticker` |  |
| `privatePostInfoOrders` | POST | `info/orders` |  |
| `privatePostInfoUserTransactions` | POST | `info/user_transactions` |  |
| `privatePostInfoOrderDetail` | POST | `info/order_detail` |  |
| `privatePostTradePlace` | POST | `trade/place` |  |
| `privatePostTradeCancel` | POST | `trade/cancel` |  |
| `privatePostTradeBtcWithdrawal` | POST | `trade/btc_withdrawal` |  |
| `privatePostTradeKrwDeposit` | POST | `trade/krw_deposit` |  |
| `privatePostTradeKrwWithdrawal` | POST | `trade/krw_withdrawal` |  |
| `privatePostTradeMarketBuy` | POST | `trade/market_buy` |  |
| `privatePostTradeMarketSell` | POST | `trade/market_sell` |  |
| `privatePostTradeStopLimit` | POST | `trade/stop_limit` |  |

