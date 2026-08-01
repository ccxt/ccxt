Every endpoint in `coincheck`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/coincheck) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetExchangeOrdersRate`); the snake_case alias (`public_get_exchange_orders_rate`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetExchangeOrdersRate`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const coincheck = new ccxt.coincheck ();
const response = await coincheck.publicGetExchangeOrdersRate (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const coincheck = new ccxt.coincheck ();
const response = await coincheck.publicGetExchangeOrdersRate (params);
```

#### **Python**

```python
import ccxt
coincheck = ccxt.coincheck()
response = coincheck.public_get_exchange_orders_rate(params)
```

#### **PHP**

```php
$coincheck = new \ccxt\coincheck();
$response = $coincheck->public_get_exchange_orders_rate($params);
```

#### **C#**

```csharp
using ccxt;
var coincheck = new Coincheck();
var response = await coincheck.publicGetExchangeOrdersRate(parameters);
```

#### **Go**

```go
coincheck := ccxt.NewCoincheck(nil)
response := <-coincheck.PublicGetExchangeOrdersRate(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official coincheck API documentation:** [coincheck.com](https://coincheck.com/documents/exchange/api)

> 32 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetExchangeOrdersRate` | GET | `exchange/orders/rate` |  |
| `publicGetExchangeStatus` | GET | `exchange_status` |  |
| `publicGetOrderBooks` | GET | `order_books` |  |
| `publicGetRatePair` | GET | `rate/{pair}` |  |
| `publicGetTicker` | GET | `ticker` |  |
| `publicGetTrades` | GET | `trades` |  |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccounts` | GET | `accounts` |  |
| `privateGetAccountsBalance` | GET | `accounts/balance` |  |
| `privateGetAccountsLeverageBalance` | GET | `accounts/leverage_balance` |  |
| `privateGetBankAccounts` | GET | `bank_accounts` |  |
| `privateGetDepositMoney` | GET | `deposit_money` |  |
| `privateGetExchangeOrdersId` | GET | `exchange/orders/{id}` |  |
| `privateGetExchangeOrdersOpens` | GET | `exchange/orders/opens` |  |
| `privateGetExchangeOrdersCancelStatus` | GET | `exchange/orders/cancel_status` |  |
| `privateGetExchangeOrdersTransactions` | GET | `exchange/orders/transactions` |  |
| `privateGetExchangeOrdersTransactionsPagination` | GET | `exchange/orders/transactions_pagination` |  |
| `privateGetExchangeLeveragePositions` | GET | `exchange/leverage/positions` |  |
| `privateGetLendingBorrowsMatches` | GET | `lending/borrows/matches` |  |
| `privateGetSendMoney` | GET | `send_money` |  |
| `privateGetWithdraws` | GET | `withdraws` |  |
| `privatePostBankAccounts` | POST | `bank_accounts` |  |
| `privatePostDepositMoneyIdFast` | POST | `deposit_money/{id}/fast` |  |
| `privatePostExchangeOrders` | POST | `exchange/orders` |  |
| `privatePostExchangeTransfersToLeverage` | POST | `exchange/transfers/to_leverage` |  |
| `privatePostExchangeTransfersFromLeverage` | POST | `exchange/transfers/from_leverage` |  |
| `privatePostLendingBorrows` | POST | `lending/borrows` |  |
| `privatePostLendingBorrowsIdRepay` | POST | `lending/borrows/{id}/repay` |  |
| `privatePostSendMoney` | POST | `send_money` |  |
| `privatePostWithdraws` | POST | `withdraws` |  |
| `privateDeleteBankAccountsId` | DELETE | `bank_accounts/{id}` |  |
| `privateDeleteExchangeOrdersId` | DELETE | `exchange/orders/{id}` |  |
| `privateDeleteWithdrawsId` | DELETE | `withdraws/{id}` |  |

