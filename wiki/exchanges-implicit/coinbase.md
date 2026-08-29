Every endpoint in `coinbase`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/coinbase) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `v2PublicGetCurrencies`); the snake_case alias (`v2_public_get_currencies`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`V2PublicGetCurrencies`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const coinbase = new ccxt.coinbase ();
const response = await coinbase.v2PublicGetCurrencies (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const coinbase = new ccxt.coinbase ();
const response = await coinbase.v2PublicGetCurrencies (params);
```

#### **Python**

```python
import ccxt
coinbase = ccxt.coinbase()
response = coinbase.v2_public_get_currencies(params)
```

#### **PHP**

```php
$coinbase = new \ccxt\coinbase();
$response = $coinbase->v2_public_get_currencies($params);
```

#### **C#**

```csharp
using ccxt;
var coinbase = new Coinbase();
var response = await coinbase.v2PublicGetCurrencies(parameters);
```

#### **Go**

```go
coinbase := ccxt.NewCoinbase(nil)
response := <-coinbase.V2PublicGetCurrencies(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official coinbase API documentation:** [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com/coinbase-app/introduction/welcome) · [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/api-reference)

> 91 implicit endpoints across 2 access groups.

## v2

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PublicGetCurrencies` | GET | `currencies` | 10.6 |
| `v2PublicGetCurrenciesCrypto` | GET | `currencies/crypto` | 10.6 |
| `v2PublicGetTime` | GET | `time` | 10.6 |
| `v2PublicGetExchangeRates` | GET | `exchange-rates` | 10.6 |
| `v2PublicGetUsersUserId` | GET | `users/{user_id}` | 10.6 |
| `v2PublicGetPricesSymbolBuy` | GET | `prices/{symbol}/buy` | 10.6 |
| `v2PublicGetPricesSymbolSell` | GET | `prices/{symbol}/sell` | 10.6 |
| `v2PublicGetPricesSymbolSpot` | GET | `prices/{symbol}/spot` | 10.6 |
| `v2PrivateGetAccounts` | GET | `accounts` | 10.6 |
| `v2PrivateGetAccountsAccountId` | GET | `accounts/{account_id}` | 10.6 |
| `v2PrivateGetAccountsAccountIdAddresses` | GET | `accounts/{account_id}/addresses` | 10.6 |
| `v2PrivateGetAccountsAccountIdAddressesAddressId` | GET | `accounts/{account_id}/addresses/{address_id}` | 10.6 |
| `v2PrivateGetAccountsAccountIdAddressesAddressIdTransactions` | GET | `accounts/{account_id}/addresses/{address_id}/transactions` | 10.6 |
| `v2PrivateGetAccountsAccountIdTransactions` | GET | `accounts/{account_id}/transactions` | 10.6 |
| `v2PrivateGetAccountsAccountIdTransactionsTransactionId` | GET | `accounts/{account_id}/transactions/{transaction_id}` | 10.6 |
| `v2PrivateGetAccountsAccountIdBuys` | GET | `accounts/{account_id}/buys` | 10.6 |
| `v2PrivateGetAccountsAccountIdBuysBuyId` | GET | `accounts/{account_id}/buys/{buy_id}` | 10.6 |
| `v2PrivateGetAccountsAccountIdSells` | GET | `accounts/{account_id}/sells` | 10.6 |
| `v2PrivateGetAccountsAccountIdSellsSellId` | GET | `accounts/{account_id}/sells/{sell_id}` | 10.6 |
| `v2PrivateGetAccountsAccountIdDeposits` | GET | `accounts/{account_id}/deposits` | 10.6 |
| `v2PrivateGetAccountsAccountIdDepositsDepositId` | GET | `accounts/{account_id}/deposits/{deposit_id}` | 10.6 |
| `v2PrivateGetAccountsAccountIdWithdrawals` | GET | `accounts/{account_id}/withdrawals` | 10.6 |
| `v2PrivateGetAccountsAccountIdWithdrawalsWithdrawalId` | GET | `accounts/{account_id}/withdrawals/{withdrawal_id}` | 10.6 |
| `v2PrivateGetPaymentMethods` | GET | `payment-methods` | 10.6 |
| `v2PrivateGetPaymentMethodsPaymentMethodId` | GET | `payment-methods/{payment_method_id}` | 10.6 |
| `v2PrivateGetUser` | GET | `user` | 10.6 |
| `v2PrivateGetUserAuth` | GET | `user/auth` | 10.6 |
| `v2PrivatePostAccounts` | POST | `accounts` | 10.6 |
| `v2PrivatePostAccountsAccountIdPrimary` | POST | `accounts/{account_id}/primary` | 10.6 |
| `v2PrivatePostAccountsAccountIdAddresses` | POST | `accounts/{account_id}/addresses` | 10.6 |
| `v2PrivatePostAccountsAccountIdTransactions` | POST | `accounts/{account_id}/transactions` | 10.6 |
| `v2PrivatePostAccountsAccountIdTransactionsTransactionIdComplete` | POST | `accounts/{account_id}/transactions/{transaction_id}/complete` | 10.6 |
| `v2PrivatePostAccountsAccountIdTransactionsTransactionIdResend` | POST | `accounts/{account_id}/transactions/{transaction_id}/resend` | 10.6 |
| `v2PrivatePostAccountsAccountIdBuys` | POST | `accounts/{account_id}/buys` | 10.6 |
| `v2PrivatePostAccountsAccountIdBuysBuyIdCommit` | POST | `accounts/{account_id}/buys/{buy_id}/commit` | 10.6 |
| `v2PrivatePostAccountsAccountIdSells` | POST | `accounts/{account_id}/sells` | 10.6 |
| `v2PrivatePostAccountsAccountIdSellsSellIdCommit` | POST | `accounts/{account_id}/sells/{sell_id}/commit` | 10.6 |
| `v2PrivatePostAccountsAccountIdDeposits` | POST | `accounts/{account_id}/deposits` | 10.6 |
| `v2PrivatePostAccountsAccountIdDepositsDepositIdCommit` | POST | `accounts/{account_id}/deposits/{deposit_id}/commit` | 10.6 |
| `v2PrivatePostAccountsAccountIdWithdrawals` | POST | `accounts/{account_id}/withdrawals` | 10.6 |
| `v2PrivatePostAccountsAccountIdWithdrawalsWithdrawalIdCommit` | POST | `accounts/{account_id}/withdrawals/{withdrawal_id}/commit` | 10.6 |
| `v2PrivatePutAccountsAccountId` | PUT | `accounts/{account_id}` | 10.6 |
| `v2PrivatePutUser` | PUT | `user` | 10.6 |
| `v2PrivateDeleteAccountsId` | DELETE | `accounts/{id}` | 10.6 |
| `v2PrivateDeleteAccountsAccountIdTransactionsTransactionId` | DELETE | `accounts/{account_id}/transactions/{transaction_id}` | 10.6 |

## v3

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v3PublicGetBrokerageTime` | GET | `brokerage/time` | 3 |
| `v3PublicGetBrokerageMarketProductBook` | GET | `brokerage/market/product_book` | 3 |
| `v3PublicGetBrokerageMarketProducts` | GET | `brokerage/market/products` | 3 |
| `v3PublicGetBrokerageMarketProductsProductId` | GET | `brokerage/market/products/{product_id}` | 3 |
| `v3PublicGetBrokerageMarketProductsProductIdCandles` | GET | `brokerage/market/products/{product_id}/candles` | 3 |
| `v3PublicGetBrokerageMarketProductsProductIdTicker` | GET | `brokerage/market/products/{product_id}/ticker` | 3 |
| `v3PrivateGetBrokerageAccounts` | GET | `brokerage/accounts` | 1 |
| `v3PrivateGetBrokerageAccountsAccountUuid` | GET | `brokerage/accounts/{account_uuid}` | 1 |
| `v3PrivateGetBrokerageOrdersHistoricalBatch` | GET | `brokerage/orders/historical/batch` | 1 |
| `v3PrivateGetBrokerageOrdersHistoricalFills` | GET | `brokerage/orders/historical/fills` | 1 |
| `v3PrivateGetBrokerageOrdersHistoricalOrderId` | GET | `brokerage/orders/historical/{order_id}` | 1 |
| `v3PrivateGetBrokerageProducts` | GET | `brokerage/products` | 3 |
| `v3PrivateGetBrokerageProductsProductId` | GET | `brokerage/products/{product_id}` | 3 |
| `v3PrivateGetBrokerageProductsProductIdCandles` | GET | `brokerage/products/{product_id}/candles` | 3 |
| `v3PrivateGetBrokerageProductsProductIdTicker` | GET | `brokerage/products/{product_id}/ticker` | 3 |
| `v3PrivateGetBrokerageBestBidAsk` | GET | `brokerage/best_bid_ask` | 3 |
| `v3PrivateGetBrokerageProductBook` | GET | `brokerage/product_book` | 3 |
| `v3PrivateGetBrokerageTransactionSummary` | GET | `brokerage/transaction_summary` | 3 |
| `v3PrivateGetBrokeragePortfolios` | GET | `brokerage/portfolios` | 1 |
| `v3PrivateGetBrokeragePortfoliosPortfolioUuid` | GET | `brokerage/portfolios/{portfolio_uuid}` | 1 |
| `v3PrivateGetBrokerageConvertTradeTradeId` | GET | `brokerage/convert/trade/{trade_id}` | 1 |
| `v3PrivateGetBrokerageCfmBalanceSummary` | GET | `brokerage/cfm/balance_summary` | 1 |
| `v3PrivateGetBrokerageCfmPositions` | GET | `brokerage/cfm/positions` | 1 |
| `v3PrivateGetBrokerageCfmPositionsProductId` | GET | `brokerage/cfm/positions/{product_id}` | 1 |
| `v3PrivateGetBrokerageCfmSweeps` | GET | `brokerage/cfm/sweeps` | 1 |
| `v3PrivateGetBrokerageIntxPortfolioPortfolioUuid` | GET | `brokerage/intx/portfolio/{portfolio_uuid}` | 1 |
| `v3PrivateGetBrokerageIntxPositionsPortfolioUuid` | GET | `brokerage/intx/positions/{portfolio_uuid}` | 1 |
| `v3PrivateGetBrokerageIntxPositionsPortfolioUuidSymbol` | GET | `brokerage/intx/positions/{portfolio_uuid}/{symbol}` | 1 |
| `v3PrivateGetBrokeragePaymentMethods` | GET | `brokerage/payment_methods` | 1 |
| `v3PrivateGetBrokeragePaymentMethodsPaymentMethodId` | GET | `brokerage/payment_methods/{payment_method_id}` | 1 |
| `v3PrivateGetBrokerageKeyPermissions` | GET | `brokerage/key_permissions` | 1 |
| `v3PrivatePostBrokerageOrders` | POST | `brokerage/orders` | 1 |
| `v3PrivatePostBrokerageOrdersBatchCancel` | POST | `brokerage/orders/batch_cancel` | 1 |
| `v3PrivatePostBrokerageOrdersEdit` | POST | `brokerage/orders/edit` | 1 |
| `v3PrivatePostBrokerageOrdersEditPreview` | POST | `brokerage/orders/edit_preview` | 1 |
| `v3PrivatePostBrokerageOrdersPreview` | POST | `brokerage/orders/preview` | 1 |
| `v3PrivatePostBrokeragePortfolios` | POST | `brokerage/portfolios` | 1 |
| `v3PrivatePostBrokeragePortfoliosMoveFunds` | POST | `brokerage/portfolios/move_funds` | 1 |
| `v3PrivatePostBrokerageConvertQuote` | POST | `brokerage/convert/quote` | 1 |
| `v3PrivatePostBrokerageConvertTradeTradeId` | POST | `brokerage/convert/trade/{trade_id}` | 1 |
| `v3PrivatePostBrokerageCfmSweepsSchedule` | POST | `brokerage/cfm/sweeps/schedule` | 1 |
| `v3PrivatePostBrokerageIntxAllocate` | POST | `brokerage/intx/allocate` | 1 |
| `v3PrivatePostBrokerageOrdersClosePosition` | POST | `brokerage/orders/close_position` | 1 |
| `v3PrivatePutBrokeragePortfoliosPortfolioUuid` | PUT | `brokerage/portfolios/{portfolio_uuid}` | 1 |
| `v3PrivateDeleteBrokeragePortfoliosPortfolioUuid` | DELETE | `brokerage/portfolios/{portfolio_uuid}` | 1 |
| `v3PrivateDeleteBrokerageCfmSweeps` | DELETE | `brokerage/cfm/sweeps` | 1 |

