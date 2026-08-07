Every endpoint in `coinspot`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/coinspot) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetLatest`); the snake_case alias (`public_get_latest`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetLatest`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const coinspot = new ccxt.coinspot ();
const response = await coinspot.publicGetLatest (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const coinspot = new ccxt.coinspot ();
const response = await coinspot.publicGetLatest (params);
```

#### **Python**

```python
import ccxt
coinspot = ccxt.coinspot()
response = coinspot.public_get_latest(params)
```

#### **PHP**

```php
$coinspot = new \ccxt\coinspot();
$response = $coinspot->public_get_latest($params);
```

#### **C#**

```csharp
using ccxt;
var coinspot = new Coinspot();
var response = await coinspot.publicGetLatest(parameters);
```

#### **Go**

```go
coinspot := ccxt.NewCoinspot(nil)
response := <-coinspot.PublicGetLatest(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official coinspot API documentation:** [coinspot.com.au](https://www.coinspot.com.au/api)

> 69 implicit endpoints across 3 access groups.

## public

**Base URL**: `https://www.coinspot.com.au/pubapi`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetLatest` | GET | `latest` |  |

## private

**Base URL**: `https://www.coinspot.com.au/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostOrders` | POST | `orders` |  |
| `privatePostOrdersHistory` | POST | `orders/history` |  |
| `privatePostMyCoinDeposit` | POST | `my/coin/deposit` |  |
| `privatePostMyCoinSend` | POST | `my/coin/send` |  |
| `privatePostQuoteBuy` | POST | `quote/buy` |  |
| `privatePostQuoteSell` | POST | `quote/sell` |  |
| `privatePostMyBalances` | POST | `my/balances` |  |
| `privatePostMyOrders` | POST | `my/orders` |  |
| `privatePostMyBuy` | POST | `my/buy` |  |
| `privatePostMySell` | POST | `my/sell` |  |
| `privatePostMyBuyCancel` | POST | `my/buy/cancel` |  |
| `privatePostMySellCancel` | POST | `my/sell/cancel` |  |
| `privatePostRoMyBalances` | POST | `ro/my/balances` |  |
| `privatePostRoMyBalancesCointype` | POST | `ro/my/balances/{cointype}` |  |
| `privatePostRoMyDeposits` | POST | `ro/my/deposits` |  |
| `privatePostRoMyWithdrawals` | POST | `ro/my/withdrawals` |  |
| `privatePostRoMyTransactions` | POST | `ro/my/transactions` |  |
| `privatePostRoMyTransactionsCointype` | POST | `ro/my/transactions/{cointype}` |  |
| `privatePostRoMyTransactionsOpen` | POST | `ro/my/transactions/open` |  |
| `privatePostRoMyTransactionsCointypeOpen` | POST | `ro/my/transactions/{cointype}/open` |  |
| `privatePostRoMySendreceive` | POST | `ro/my/sendreceive` |  |
| `privatePostRoMyAffiliatepayments` | POST | `ro/my/affiliatepayments` |  |
| `privatePostRoMyReferralpayments` | POST | `ro/my/referralpayments` |  |

## v2

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PublicGetLatest` | GET | `latest` |  |
| `v2PublicGetLatestCointype` | GET | `latest/{cointype}` |  |
| `v2PublicGetLatestCointypeMarkettype` | GET | `latest/{cointype}/{markettype}` |  |
| `v2PublicGetBuypriceCointype` | GET | `buyprice/{cointype}` |  |
| `v2PublicGetBuypriceCointypeMarkettype` | GET | `buyprice/{cointype}/{markettype}` |  |
| `v2PublicGetSellpriceCointype` | GET | `sellprice/{cointype}` |  |
| `v2PublicGetSellpriceCointypeMarkettype` | GET | `sellprice/{cointype}/{markettype}` |  |
| `v2PublicGetOrdersOpenCointype` | GET | `orders/open/{cointype}` |  |
| `v2PublicGetOrdersOpenCointypeMarkettype` | GET | `orders/open/{cointype}/{markettype}` |  |
| `v2PublicGetOrdersCompletedCointype` | GET | `orders/completed/{cointype}` |  |
| `v2PublicGetOrdersCompletedCointypeMarkettype` | GET | `orders/completed/{cointype}/{markettype}` |  |
| `v2PublicGetOrdersSummaryCompletedCointype` | GET | `orders/summary/completed/{cointype}` |  |
| `v2PublicGetOrdersSummaryCompletedCointypeMarkettype` | GET | `orders/summary/completed/{cointype}/{markettype}` |  |
| `v2PrivatePostStatus` | POST | `status` |  |
| `v2PrivatePostMyCoinDeposit` | POST | `my/coin/deposit` |  |
| `v2PrivatePostQuoteBuyNow` | POST | `quote/buy/now` |  |
| `v2PrivatePostQuoteSellNow` | POST | `quote/sell/now` |  |
| `v2PrivatePostQuoteSwapNow` | POST | `quote/swap/now` |  |
| `v2PrivatePostMyBuy` | POST | `my/buy` |  |
| `v2PrivatePostMyBuyEdit` | POST | `my/buy/edit` |  |
| `v2PrivatePostMySell` | POST | `my/sell` |  |
| `v2PrivatePostMySellEdit` | POST | `my/sell/edit` |  |
| `v2PrivatePostMyBuyNow` | POST | `my/buy/now` |  |
| `v2PrivatePostMySellNow` | POST | `my/sell/now` |  |
| `v2PrivatePostMySwapNow` | POST | `my/swap/now` |  |
| `v2PrivatePostMyBuyCancel` | POST | `my/buy/cancel` |  |
| `v2PrivatePostMyBuyCancelAll` | POST | `my/buy/cancel/all` |  |
| `v2PrivatePostMySellCancel` | POST | `my/sell/cancel` |  |
| `v2PrivatePostMySellCancelAll` | POST | `my/sell/cancel/all` |  |
| `v2PrivatePostMyCoinWithdrawSenddetails` | POST | `my/coin/withdraw/senddetails` |  |
| `v2PrivatePostMyCoinWithdrawSend` | POST | `my/coin/withdraw/send` |  |
| `v2PrivatePostRoStatus` | POST | `ro/status` |  |
| `v2PrivatePostRoOrdersMarketOpen` | POST | `ro/orders/market/open` |  |
| `v2PrivatePostRoOrdersMarketCompleted` | POST | `ro/orders/market/completed` |  |
| `v2PrivatePostRoMyBalances` | POST | `ro/my/balances` |  |
| `v2PrivatePostRoMyBalanceCointype` | POST | `ro/my/balance/{cointype}` |  |
| `v2PrivatePostRoMyOrdersMarketOpen` | POST | `ro/my/orders/market/open` |  |
| `v2PrivatePostRoMyOrdersLimitOpen` | POST | `ro/my/orders/limit/open` |  |
| `v2PrivatePostRoMyOrdersCompleted` | POST | `ro/my/orders/completed` |  |
| `v2PrivatePostRoMyOrdersMarketCompleted` | POST | `ro/my/orders/market/completed` |  |
| `v2PrivatePostRoMySendreceive` | POST | `ro/my/sendreceive` |  |
| `v2PrivatePostRoMyDeposits` | POST | `ro/my/deposits` |  |
| `v2PrivatePostRoMyWithdrawals` | POST | `ro/my/withdrawals` |  |
| `v2PrivatePostRoMyAffiliatepayments` | POST | `ro/my/affiliatepayments` |  |
| `v2PrivatePostRoMyReferralpayments` | POST | `ro/my/referralpayments` |  |

