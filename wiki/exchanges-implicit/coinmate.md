Every endpoint in `coinmate`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/coinmate) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetOrderBook`); the snake_case alias (`public_get_orderbook`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetOrderBook`). Switch tabs for the call in each language:

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
| `publicGetOrderBook` | GET | `orderBook` |  |
| `publicGetTicker` | GET | `ticker` |  |
| `publicGetTickerAll` | GET | `tickerAll` |  |
| `publicGetProducts` | GET | `products` |  |
| `publicGetTransactions` | GET | `transactions` |  |
| `publicGetTradingPairs` | GET | `tradingPairs` |  |
| `publicGetSystemTime` | GET | `system/time` |  |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostCurrencies` | POST | `currencies` |  |
| `privatePostBalances` | POST | `balances` |  |
| `privatePostBitcoinCashWithdrawal` | POST | `bitcoinCashWithdrawal` |  |
| `privatePostBitcoinCashDepositAddresses` | POST | `bitcoinCashDepositAddresses` |  |
| `privatePostBitcoinDepositAddresses` | POST | `bitcoinDepositAddresses` |  |
| `privatePostBitcoinWithdrawal` | POST | `bitcoinWithdrawal` |  |
| `privatePostBitcoinWithdrawalFees` | POST | `bitcoinWithdrawalFees` |  |
| `privatePostBuyInstant` | POST | `buyInstant` |  |
| `privatePostBuyLimit` | POST | `buyLimit` |  |
| `privatePostCancelOrder` | POST | `cancelOrder` |  |
| `privatePostCancelOrderWithInfo` | POST | `cancelOrderWithInfo` |  |
| `privatePostCreateVoucher` | POST | `createVoucher` |  |
| `privatePostDashDepositAddresses` | POST | `dashDepositAddresses` |  |
| `privatePostDashWithdrawal` | POST | `dashWithdrawal` |  |
| `privatePostEthereumWithdrawal` | POST | `ethereumWithdrawal` |  |
| `privatePostEthereumDepositAddresses` | POST | `ethereumDepositAddresses` |  |
| `privatePostLitecoinWithdrawal` | POST | `litecoinWithdrawal` |  |
| `privatePostLitecoinDepositAddresses` | POST | `litecoinDepositAddresses` |  |
| `privatePostOpenOrders` | POST | `openOrders` |  |
| `privatePostOrder` | POST | `order` |  |
| `privatePostOrderHistory` | POST | `orderHistory` |  |
| `privatePostOrderById` | POST | `orderById` |  |
| `privatePostPusherAuth` | POST | `pusherAuth` |  |
| `privatePostRedeemVoucher` | POST | `redeemVoucher` |  |
| `privatePostReplaceByBuyLimit` | POST | `replaceByBuyLimit` |  |
| `privatePostReplaceByBuyInstant` | POST | `replaceByBuyInstant` |  |
| `privatePostReplaceBySellLimit` | POST | `replaceBySellLimit` |  |
| `privatePostReplaceBySellInstant` | POST | `replaceBySellInstant` |  |
| `privatePostRippleDepositAddresses` | POST | `rippleDepositAddresses` |  |
| `privatePostRippleWithdrawal` | POST | `rippleWithdrawal` |  |
| `privatePostSellInstant` | POST | `sellInstant` |  |
| `privatePostSellLimit` | POST | `sellLimit` |  |
| `privatePostTransactionHistory` | POST | `transactionHistory` |  |
| `privatePostTraderFees` | POST | `traderFees` |  |
| `privatePostTradeHistory` | POST | `tradeHistory` |  |
| `privatePostTransfer` | POST | `transfer` |  |
| `privatePostTransferHistory` | POST | `transferHistory` |  |
| `privatePostUnconfirmedBitcoinDeposits` | POST | `unconfirmedBitcoinDeposits` |  |
| `privatePostUnconfirmedBitcoinCashDeposits` | POST | `unconfirmedBitcoinCashDeposits` |  |
| `privatePostUnconfirmedDashDeposits` | POST | `unconfirmedDashDeposits` |  |
| `privatePostUnconfirmedEthereumDeposits` | POST | `unconfirmedEthereumDeposits` |  |
| `privatePostUnconfirmedLitecoinDeposits` | POST | `unconfirmedLitecoinDeposits` |  |
| `privatePostUnconfirmedRippleDeposits` | POST | `unconfirmedRippleDeposits` |  |
| `privatePostCancelAllOpenOrders` | POST | `cancelAllOpenOrders` |  |
| `privatePostWithdrawVirtualCurrency` | POST | `withdrawVirtualCurrency` |  |
| `privatePostVirtualCurrencyDepositAddresses` | POST | `virtualCurrencyDepositAddresses` |  |
| `privatePostUnconfirmedVirtualCurrencyDeposits` | POST | `unconfirmedVirtualCurrencyDeposits` |  |
| `privatePostAdaWithdrawal` | POST | `adaWithdrawal` |  |
| `privatePostAdaDepositAddresses` | POST | `adaDepositAddresses` |  |
| `privatePostUnconfirmedAdaDeposits` | POST | `unconfirmedAdaDeposits` |  |
| `privatePostSolWithdrawal` | POST | `solWithdrawal` |  |
| `privatePostSolDepositAddresses` | POST | `solDepositAddresses` |  |
| `privatePostUnconfirmedSolDeposits` | POST | `unconfirmedSolDeposits` |  |
| `privatePostBankWireWithdrawal` | POST | `bankWireWithdrawal` |  |

