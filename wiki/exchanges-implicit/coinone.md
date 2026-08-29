Every endpoint in `coinone`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/coinone) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetOrderbook`); the snake_case alias (`public_get_orderbook`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetOrderbook`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const coinone = new ccxt.coinone ();
const response = await coinone.publicGetOrderbook (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const coinone = new ccxt.coinone ();
const response = await coinone.publicGetOrderbook (params);
```

#### **Python**

```python
import ccxt
coinone = ccxt.coinone()
response = coinone.public_get_orderbook(params)
```

#### **PHP**

```php
$coinone = new \ccxt\coinone();
$response = $coinone->public_get_orderbook($params);
```

#### **C#**

```csharp
using ccxt;
var coinone = new Coinone();
var response = await coinone.publicGetOrderbook(parameters);
```

#### **Go**

```go
coinone := ccxt.NewCoinone(nil)
response := <-coinone.PublicGetOrderbook(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official coinone API documentation:** [doc.coinone.co.kr](https://doc.coinone.co.kr)

> 63 implicit endpoints across 5 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetOrderbook` | GET | `orderbook` | 1 |
| `publicGetTicker` | GET | `ticker` | 1 |
| `publicGetTickerUtc` | GET | `ticker_utc` | 1 |
| `publicGetTrades` | GET | `trades` | 1 |

## v2Public

**Base URL**: `https://api.coinone.co.kr/public/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PublicGetRangeUnits` | GET | `range_units` | 1 |
| `v2PublicGetMarketsQuoteCurrency` | GET | `markets/{quote_currency}` | 1 |
| `v2PublicGetMarketsQuoteCurrencyTargetCurrency` | GET | `markets/{quote_currency}/{target_currency}` | 1 |
| `v2PublicGetOrderbookQuoteCurrencyTargetCurrency` | GET | `orderbook/{quote_currency}/{target_currency}` | 1 |
| `v2PublicGetTradesQuoteCurrencyTargetCurrency` | GET | `trades/{quote_currency}/{target_currency}` | 1 |
| `v2PublicGetTickerNewQuoteCurrency` | GET | `ticker_new/{quote_currency}` | 1 |
| `v2PublicGetTickerNewQuoteCurrencyTargetCurrency` | GET | `ticker_new/{quote_currency}/{target_currency}` | 1 |
| `v2PublicGetTickerUtcNewQuoteCurrency` | GET | `ticker_utc_new/{quote_currency}` | 1 |
| `v2PublicGetTickerUtcNewQuoteCurrencyTargetCurrency` | GET | `ticker_utc_new/{quote_currency}/{target_currency}` | 1 |
| `v2PublicGetCurrencies` | GET | `currencies` | 1 |
| `v2PublicGetCurrenciesCurrency` | GET | `currencies/{currency}` | 1 |
| `v2PublicGetChartQuoteCurrencyTargetCurrency` | GET | `chart/{quote_currency}/{target_currency}` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostAccountDepositAddress` | POST | `account/deposit_address` | 1 |
| `privatePostAccountBtcDepositAddress` | POST | `account/btc_deposit_address` | 1 |
| `privatePostAccountBalance` | POST | `account/balance` | 1 |
| `privatePostAccountDailyBalance` | POST | `account/daily_balance` | 1 |
| `privatePostAccountUserInfo` | POST | `account/user_info` | 1 |
| `privatePostAccountVirtualAccount` | POST | `account/virtual_account` | 1 |
| `privatePostOrderCancelAll` | POST | `order/cancel_all` | 1 |
| `privatePostOrderCancel` | POST | `order/cancel` | 1 |
| `privatePostOrderLimitBuy` | POST | `order/limit_buy` | 1 |
| `privatePostOrderLimitSell` | POST | `order/limit_sell` | 1 |
| `privatePostOrderCompleteOrders` | POST | `order/complete_orders` | 1 |
| `privatePostOrderLimitOrders` | POST | `order/limit_orders` | 1 |
| `privatePostOrderOrderInfo` | POST | `order/order_info` | 1 |
| `privatePostTransactionAuthNumber` | POST | `transaction/auth_number` | 1 |
| `privatePostTransactionHistory` | POST | `transaction/history` | 1 |
| `privatePostTransactionKrwHistory` | POST | `transaction/krw/history` | 1 |
| `privatePostTransactionBtc` | POST | `transaction/btc` | 1 |
| `privatePostTransactionCoin` | POST | `transaction/coin` | 1 |

## v2Private

**Base URL**: `https://api.coinone.co.kr/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PrivatePostAccountBalance` | POST | `account/balance` | 1 |
| `v2PrivatePostAccountDepositAddress` | POST | `account/deposit_address` | 1 |
| `v2PrivatePostAccountUserInfo` | POST | `account/user_info` | 1 |
| `v2PrivatePostAccountVirtualAccount` | POST | `account/virtual_account` | 1 |
| `v2PrivatePostOrderCancel` | POST | `order/cancel` | 1 |
| `v2PrivatePostOrderLimitBuy` | POST | `order/limit_buy` | 1 |
| `v2PrivatePostOrderLimitSell` | POST | `order/limit_sell` | 1 |
| `v2PrivatePostOrderLimitOrders` | POST | `order/limit_orders` | 1 |
| `v2PrivatePostOrderCompleteOrders` | POST | `order/complete_orders` | 1 |
| `v2PrivatePostOrderQueryOrder` | POST | `order/query_order` | 1 |
| `v2PrivatePostTransactionAuthNumber` | POST | `transaction/auth_number` | 1 |
| `v2PrivatePostTransactionBtc` | POST | `transaction/btc` | 1 |
| `v2PrivatePostTransactionHistory` | POST | `transaction/history` | 1 |
| `v2PrivatePostTransactionKrwHistory` | POST | `transaction/krw/history` | 1 |

## v2_1Private

**Base URL**: `https://api.coinone.co.kr/v2.1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2_1PrivatePostAccountBalanceAll` | POST | `account/balance/all` | 1 |
| `v2_1PrivatePostAccountBalance` | POST | `account/balance` | 1 |
| `v2_1PrivatePostAccountTradeFee` | POST | `account/trade_fee` | 1 |
| `v2_1PrivatePostAccountTradeFeeQuoteCurrencyTargetCurrency` | POST | `account/trade_fee/{quote_currency}/{target_currency}` | 1 |
| `v2_1PrivatePostOrderLimit` | POST | `order/limit` | 1 |
| `v2_1PrivatePostOrderCancel` | POST | `order/cancel` | 1 |
| `v2_1PrivatePostOrderCancelAll` | POST | `order/cancel/all` | 1 |
| `v2_1PrivatePostOrderOpenOrders` | POST | `order/open_orders` | 1 |
| `v2_1PrivatePostOrderOpenOrdersAll` | POST | `order/open_orders/all` | 1 |
| `v2_1PrivatePostOrderCompleteOrders` | POST | `order/complete_orders` | 1 |
| `v2_1PrivatePostOrderCompleteOrdersAll` | POST | `order/complete_orders/all` | 1 |
| `v2_1PrivatePostOrderInfo` | POST | `order/info` | 1 |
| `v2_1PrivatePostTransactionKrwHistory` | POST | `transaction/krw/history` | 1 |
| `v2_1PrivatePostTransactionCoinHistory` | POST | `transaction/coin/history` | 1 |
| `v2_1PrivatePostTransactionCoinWithdrawalLimit` | POST | `transaction/coin/withdrawal/limit` | 1 |

