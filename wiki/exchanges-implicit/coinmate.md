Every endpoint in `coinmate`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/coinmate) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetOrderBook`); the snake_case alias (`public_get_orderbook`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetOrderBook`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const coinmate = new ccxt.coinmate ();
const response = await coinmate.publicGetOrderBook (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const coinmate = new ccxt.coinmate ();
const response = await coinmate.publicGetOrderBook (params);
```

#### **Python**

```python
import ccxt
coinmate = ccxt.coinmate()
response = coinmate.public_get_orderbook(params)
```

#### **PHP**

```php
$coinmate = new \ccxt\coinmate();
$response = $coinmate->public_get_orderbook($params);
```

#### **C#**

```csharp
using ccxt;
var coinmate = new Coinmate();
var response = await coinmate.publicGetOrderBook(parameters);
```

#### **Go**

```go
coinmate := ccxt.NewCoinmate(nil)
response := <-coinmate.PublicGetOrderBook(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official coinmate API documentation:** [coinmate.docs.apiary.io](https://coinmate.docs.apiary.io) · [coinmate.io](https://coinmate.io/developers)

> 61 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetOrderBook` | GET | `orderBook` | 1 |
| `publicGetTicker` | GET | `ticker` | 1 |
| `publicGetTickerAll` | GET | `tickerAll` | 1 |
| `publicGetProducts` | GET | `products` | 1 |
| `publicGetTransactions` | GET | `transactions` | 1 |
| `publicGetTradingPairs` | GET | `tradingPairs` | 1 |
| `publicGetSystemTime` | GET | `system/time` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostCurrencies` | POST | `currencies` | 1 |
| `privatePostBalances` | POST | `balances` | 1 |
| `privatePostBitcoinCashWithdrawal` | POST | `bitcoinCashWithdrawal` | 1 |
| `privatePostBitcoinCashDepositAddresses` | POST | `bitcoinCashDepositAddresses` | 1 |
| `privatePostBitcoinDepositAddresses` | POST | `bitcoinDepositAddresses` | 1 |
| `privatePostBitcoinWithdrawal` | POST | `bitcoinWithdrawal` | 1 |
| `privatePostBitcoinWithdrawalFees` | POST | `bitcoinWithdrawalFees` | 1 |
| `privatePostBuyInstant` | POST | `buyInstant` | 1 |
| `privatePostBuyLimit` | POST | `buyLimit` | 1 |
| `privatePostCancelOrder` | POST | `cancelOrder` | 1 |
| `privatePostCancelOrderWithInfo` | POST | `cancelOrderWithInfo` | 1 |
| `privatePostCreateVoucher` | POST | `createVoucher` | 1 |
| `privatePostDashDepositAddresses` | POST | `dashDepositAddresses` | 1 |
| `privatePostDashWithdrawal` | POST | `dashWithdrawal` | 1 |
| `privatePostEthereumWithdrawal` | POST | `ethereumWithdrawal` | 1 |
| `privatePostEthereumDepositAddresses` | POST | `ethereumDepositAddresses` | 1 |
| `privatePostLitecoinWithdrawal` | POST | `litecoinWithdrawal` | 1 |
| `privatePostLitecoinDepositAddresses` | POST | `litecoinDepositAddresses` | 1 |
| `privatePostOpenOrders` | POST | `openOrders` | 1 |
| `privatePostOrder` | POST | `order` | 1 |
| `privatePostOrderHistory` | POST | `orderHistory` | 1 |
| `privatePostOrderById` | POST | `orderById` | 1 |
| `privatePostPusherAuth` | POST | `pusherAuth` | 1 |
| `privatePostRedeemVoucher` | POST | `redeemVoucher` | 1 |
| `privatePostReplaceByBuyLimit` | POST | `replaceByBuyLimit` | 1 |
| `privatePostReplaceByBuyInstant` | POST | `replaceByBuyInstant` | 1 |
| `privatePostReplaceBySellLimit` | POST | `replaceBySellLimit` | 1 |
| `privatePostReplaceBySellInstant` | POST | `replaceBySellInstant` | 1 |
| `privatePostRippleDepositAddresses` | POST | `rippleDepositAddresses` | 1 |
| `privatePostRippleWithdrawal` | POST | `rippleWithdrawal` | 1 |
| `privatePostSellInstant` | POST | `sellInstant` | 1 |
| `privatePostSellLimit` | POST | `sellLimit` | 1 |
| `privatePostTransactionHistory` | POST | `transactionHistory` | 1 |
| `privatePostTraderFees` | POST | `traderFees` | 1 |
| `privatePostTradeHistory` | POST | `tradeHistory` | 1 |
| `privatePostTransfer` | POST | `transfer` | 1 |
| `privatePostTransferHistory` | POST | `transferHistory` | 1 |
| `privatePostUnconfirmedBitcoinDeposits` | POST | `unconfirmedBitcoinDeposits` | 1 |
| `privatePostUnconfirmedBitcoinCashDeposits` | POST | `unconfirmedBitcoinCashDeposits` | 1 |
| `privatePostUnconfirmedDashDeposits` | POST | `unconfirmedDashDeposits` | 1 |
| `privatePostUnconfirmedEthereumDeposits` | POST | `unconfirmedEthereumDeposits` | 1 |
| `privatePostUnconfirmedLitecoinDeposits` | POST | `unconfirmedLitecoinDeposits` | 1 |
| `privatePostUnconfirmedRippleDeposits` | POST | `unconfirmedRippleDeposits` | 1 |
| `privatePostCancelAllOpenOrders` | POST | `cancelAllOpenOrders` | 1 |
| `privatePostWithdrawVirtualCurrency` | POST | `withdrawVirtualCurrency` | 1 |
| `privatePostVirtualCurrencyDepositAddresses` | POST | `virtualCurrencyDepositAddresses` | 1 |
| `privatePostUnconfirmedVirtualCurrencyDeposits` | POST | `unconfirmedVirtualCurrencyDeposits` | 1 |
| `privatePostAdaWithdrawal` | POST | `adaWithdrawal` | 1 |
| `privatePostAdaDepositAddresses` | POST | `adaDepositAddresses` | 1 |
| `privatePostUnconfirmedAdaDeposits` | POST | `unconfirmedAdaDeposits` | 1 |
| `privatePostSolWithdrawal` | POST | `solWithdrawal` | 1 |
| `privatePostSolDepositAddresses` | POST | `solDepositAddresses` | 1 |
| `privatePostUnconfirmedSolDeposits` | POST | `unconfirmedSolDeposits` | 1 |
| `privatePostBankWireWithdrawal` | POST | `bankWireWithdrawal` | 1 |

