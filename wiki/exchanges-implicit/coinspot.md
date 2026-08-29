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
| `publicGetLatest` | GET | `latest` | 1 |

## private

**Base URL**: `https://www.coinspot.com.au/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostOrders` | POST | `orders` | 1 |
| `privatePostOrdersHistory` | POST | `orders/history` | 1 |
| `privatePostMyCoinDeposit` | POST | `my/coin/deposit` | 1 |
| `privatePostMyCoinSend` | POST | `my/coin/send` | 1 |
| `privatePostQuoteBuy` | POST | `quote/buy` | 1 |
| `privatePostQuoteSell` | POST | `quote/sell` | 1 |
| `privatePostMyBalances` | POST | `my/balances` | 1 |
| `privatePostMyOrders` | POST | `my/orders` | 1 |
| `privatePostMyBuy` | POST | `my/buy` | 1 |
| `privatePostMySell` | POST | `my/sell` | 1 |
| `privatePostMyBuyCancel` | POST | `my/buy/cancel` | 1 |
| `privatePostMySellCancel` | POST | `my/sell/cancel` | 1 |
| `privatePostRoMyBalances` | POST | `ro/my/balances` | 1 |
| `privatePostRoMyBalancesCointype` | POST | `ro/my/balances/{cointype}` | 1 |
| `privatePostRoMyDeposits` | POST | `ro/my/deposits` | 1 |
| `privatePostRoMyWithdrawals` | POST | `ro/my/withdrawals` | 1 |
| `privatePostRoMyTransactions` | POST | `ro/my/transactions` | 1 |
| `privatePostRoMyTransactionsCointype` | POST | `ro/my/transactions/{cointype}` | 1 |
| `privatePostRoMyTransactionsOpen` | POST | `ro/my/transactions/open` | 1 |
| `privatePostRoMyTransactionsCointypeOpen` | POST | `ro/my/transactions/{cointype}/open` | 1 |
| `privatePostRoMySendreceive` | POST | `ro/my/sendreceive` | 1 |
| `privatePostRoMyAffiliatepayments` | POST | `ro/my/affiliatepayments` | 1 |
| `privatePostRoMyReferralpayments` | POST | `ro/my/referralpayments` | 1 |

## v2

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PublicGetLatest` | GET | `latest` | 1 |
| `v2PublicGetLatestCointype` | GET | `latest/{cointype}` | 1 |
| `v2PublicGetLatestCointypeMarkettype` | GET | `latest/{cointype}/{markettype}` | 1 |
| `v2PublicGetBuypriceCointype` | GET | `buyprice/{cointype}` | 1 |
| `v2PublicGetBuypriceCointypeMarkettype` | GET | `buyprice/{cointype}/{markettype}` | 1 |
| `v2PublicGetSellpriceCointype` | GET | `sellprice/{cointype}` | 1 |
| `v2PublicGetSellpriceCointypeMarkettype` | GET | `sellprice/{cointype}/{markettype}` | 1 |
| `v2PublicGetOrdersOpenCointype` | GET | `orders/open/{cointype}` | 1 |
| `v2PublicGetOrdersOpenCointypeMarkettype` | GET | `orders/open/{cointype}/{markettype}` | 1 |
| `v2PublicGetOrdersCompletedCointype` | GET | `orders/completed/{cointype}` | 1 |
| `v2PublicGetOrdersCompletedCointypeMarkettype` | GET | `orders/completed/{cointype}/{markettype}` | 1 |
| `v2PublicGetOrdersSummaryCompletedCointype` | GET | `orders/summary/completed/{cointype}` | 1 |
| `v2PublicGetOrdersSummaryCompletedCointypeMarkettype` | GET | `orders/summary/completed/{cointype}/{markettype}` | 1 |
| `v2PrivatePostStatus` | POST | `status` | 1 |
| `v2PrivatePostMyCoinDeposit` | POST | `my/coin/deposit` | 1 |
| `v2PrivatePostQuoteBuyNow` | POST | `quote/buy/now` | 1 |
| `v2PrivatePostQuoteSellNow` | POST | `quote/sell/now` | 1 |
| `v2PrivatePostQuoteSwapNow` | POST | `quote/swap/now` | 1 |
| `v2PrivatePostMyBuy` | POST | `my/buy` | 1 |
| `v2PrivatePostMyBuyEdit` | POST | `my/buy/edit` | 1 |
| `v2PrivatePostMySell` | POST | `my/sell` | 1 |
| `v2PrivatePostMySellEdit` | POST | `my/sell/edit` | 1 |
| `v2PrivatePostMyBuyNow` | POST | `my/buy/now` | 1 |
| `v2PrivatePostMySellNow` | POST | `my/sell/now` | 1 |
| `v2PrivatePostMySwapNow` | POST | `my/swap/now` | 1 |
| `v2PrivatePostMyBuyCancel` | POST | `my/buy/cancel` | 1 |
| `v2PrivatePostMyBuyCancelAll` | POST | `my/buy/cancel/all` | 1 |
| `v2PrivatePostMySellCancel` | POST | `my/sell/cancel` | 1 |
| `v2PrivatePostMySellCancelAll` | POST | `my/sell/cancel/all` | 1 |
| `v2PrivatePostMyCoinWithdrawSenddetails` | POST | `my/coin/withdraw/senddetails` | 1 |
| `v2PrivatePostMyCoinWithdrawSend` | POST | `my/coin/withdraw/send` | 1 |
| `v2PrivatePostRoStatus` | POST | `ro/status` | 1 |
| `v2PrivatePostRoOrdersMarketOpen` | POST | `ro/orders/market/open` | 1 |
| `v2PrivatePostRoOrdersMarketCompleted` | POST | `ro/orders/market/completed` | 1 |
| `v2PrivatePostRoMyBalances` | POST | `ro/my/balances` | 1 |
| `v2PrivatePostRoMyBalanceCointype` | POST | `ro/my/balance/{cointype}` | 1 |
| `v2PrivatePostRoMyOrdersMarketOpen` | POST | `ro/my/orders/market/open` | 1 |
| `v2PrivatePostRoMyOrdersLimitOpen` | POST | `ro/my/orders/limit/open` | 1 |
| `v2PrivatePostRoMyOrdersCompleted` | POST | `ro/my/orders/completed` | 1 |
| `v2PrivatePostRoMyOrdersMarketCompleted` | POST | `ro/my/orders/market/completed` | 1 |
| `v2PrivatePostRoMySendreceive` | POST | `ro/my/sendreceive` | 1 |
| `v2PrivatePostRoMyDeposits` | POST | `ro/my/deposits` | 1 |
| `v2PrivatePostRoMyWithdrawals` | POST | `ro/my/withdrawals` | 1 |
| `v2PrivatePostRoMyAffiliatepayments` | POST | `ro/my/affiliatepayments` | 1 |
| `v2PrivatePostRoMyReferralpayments` | POST | `ro/my/referralpayments` | 1 |

