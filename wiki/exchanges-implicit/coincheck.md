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
| `publicGetExchangeOrdersRate` | GET | `exchange/orders/rate` | 1 |
| `publicGetExchangeStatus` | GET | `exchange_status` | 1 |
| `publicGetOrderBooks` | GET | `order_books` | 1 |
| `publicGetRatePair` | GET | `rate/{pair}` | 1 |
| `publicGetTicker` | GET | `ticker` | 1 |
| `publicGetTrades` | GET | `trades` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccounts` | GET | `accounts` | 1 |
| `privateGetAccountsBalance` | GET | `accounts/balance` | 1 |
| `privateGetAccountsLeverageBalance` | GET | `accounts/leverage_balance` | 1 |
| `privateGetBankAccounts` | GET | `bank_accounts` | 1 |
| `privateGetDepositMoney` | GET | `deposit_money` | 1 |
| `privateGetExchangeOrdersId` | GET | `exchange/orders/{id}` | 1 |
| `privateGetExchangeOrdersOpens` | GET | `exchange/orders/opens` | 1 |
| `privateGetExchangeOrdersCancelStatus` | GET | `exchange/orders/cancel_status` | 1 |
| `privateGetExchangeOrdersTransactions` | GET | `exchange/orders/transactions` | 1 |
| `privateGetExchangeOrdersTransactionsPagination` | GET | `exchange/orders/transactions_pagination` | 1 |
| `privateGetExchangeLeveragePositions` | GET | `exchange/leverage/positions` | 1 |
| `privateGetLendingBorrowsMatches` | GET | `lending/borrows/matches` | 1 |
| `privateGetSendMoney` | GET | `send_money` | 1 |
| `privateGetWithdraws` | GET | `withdraws` | 1 |
| `privatePostBankAccounts` | POST | `bank_accounts` | 1 |
| `privatePostDepositMoneyIdFast` | POST | `deposit_money/{id}/fast` | 1 |
| `privatePostExchangeOrders` | POST | `exchange/orders` | 1 |
| `privatePostExchangeTransfersToLeverage` | POST | `exchange/transfers/to_leverage` | 1 |
| `privatePostExchangeTransfersFromLeverage` | POST | `exchange/transfers/from_leverage` | 1 |
| `privatePostLendingBorrows` | POST | `lending/borrows` | 1 |
| `privatePostLendingBorrowsIdRepay` | POST | `lending/borrows/{id}/repay` | 1 |
| `privatePostSendMoney` | POST | `send_money` | 1 |
| `privatePostWithdraws` | POST | `withdraws` | 1 |
| `privateDeleteBankAccountsId` | DELETE | `bank_accounts/{id}` | 1 |
| `privateDeleteExchangeOrdersId` | DELETE | `exchange/orders/{id}` | 1 |
| `privateDeleteWithdrawsId` | DELETE | `withdraws/{id}` | 1 |

