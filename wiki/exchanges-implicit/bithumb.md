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
| `publicGetTickerALLQuoteId` | GET | `ticker/ALL_{quoteId}` | 1 |
| `publicGetTickerBaseIdQuoteId` | GET | `ticker/{baseId}_{quoteId}` | 1 |
| `publicGetOrderbookALLQuoteId` | GET | `orderbook/ALL_{quoteId}` | 1 |
| `publicGetOrderbookBaseIdQuoteId` | GET | `orderbook/{baseId}_{quoteId}` | 1 |
| `publicGetTransactionHistoryBaseIdQuoteId` | GET | `transaction_history/{baseId}_{quoteId}` | 1 |
| `publicGetNetworkInfo` | GET | `network-info` | 1 |
| `publicGetAssetsstatusMultichainALL` | GET | `assetsstatus/multichain/ALL` | 1 |
| `publicGetAssetsstatusMultichainCurrency` | GET | `assetsstatus/multichain/{currency}` | 1 |
| `publicGetWithdrawMinimumALL` | GET | `withdraw/minimum/ALL` | 1 |
| `publicGetWithdrawMinimumCurrency` | GET | `withdraw/minimum/{currency}` | 1 |
| `publicGetAssetsstatusALL` | GET | `assetsstatus/ALL` | 1 |
| `publicGetAssetsstatusBaseId` | GET | `assetsstatus/{baseId}` | 1 |
| `publicGetCandlestickBaseIdQuoteIdInterval` | GET | `candlestick/{baseId}_{quoteId}/{interval}` | 1 |

## private

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostInfoAccount` | POST | `info/account` | 1 |
| `privatePostInfoBalance` | POST | `info/balance` | 1 |
| `privatePostInfoWalletAddress` | POST | `info/wallet_address` | 1 |
| `privatePostInfoTicker` | POST | `info/ticker` | 1 |
| `privatePostInfoOrders` | POST | `info/orders` | 1 |
| `privatePostInfoUserTransactions` | POST | `info/user_transactions` | 1 |
| `privatePostInfoOrderDetail` | POST | `info/order_detail` | 1 |
| `privatePostTradePlace` | POST | `trade/place` | 1 |
| `privatePostTradeCancel` | POST | `trade/cancel` | 1 |
| `privatePostTradeBtcWithdrawal` | POST | `trade/btc_withdrawal` | 1 |
| `privatePostTradeKrwDeposit` | POST | `trade/krw_deposit` | 1 |
| `privatePostTradeKrwWithdrawal` | POST | `trade/krw_withdrawal` | 1 |
| `privatePostTradeMarketBuy` | POST | `trade/market_buy` | 1 |
| `privatePostTradeMarketSell` | POST | `trade/market_sell` | 1 |
| `privatePostTradeStopLimit` | POST | `trade/stop_limit` | 1 |

