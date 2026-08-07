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
| `publicGetOrderbook` | GET | `orderbook` |  |
| `publicGetTicker` | GET | `ticker` |  |
| `publicGetTickerUtc` | GET | `ticker_utc` |  |
| `publicGetTrades` | GET | `trades` |  |

## v2Public

**Base URL**: `https://api.coinone.co.kr/public/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PublicGetRangeUnits` | GET | `range_units` |  |
| `v2PublicGetMarketsQuoteCurrency` | GET | `markets/{quote_currency}` |  |
| `v2PublicGetMarketsQuoteCurrencyTargetCurrency` | GET | `markets/{quote_currency}/{target_currency}` |  |
| `v2PublicGetOrderbookQuoteCurrencyTargetCurrency` | GET | `orderbook/{quote_currency}/{target_currency}` |  |
| `v2PublicGetTradesQuoteCurrencyTargetCurrency` | GET | `trades/{quote_currency}/{target_currency}` |  |
| `v2PublicGetTickerNewQuoteCurrency` | GET | `ticker_new/{quote_currency}` |  |
| `v2PublicGetTickerNewQuoteCurrencyTargetCurrency` | GET | `ticker_new/{quote_currency}/{target_currency}` |  |
| `v2PublicGetTickerUtcNewQuoteCurrency` | GET | `ticker_utc_new/{quote_currency}` |  |
| `v2PublicGetTickerUtcNewQuoteCurrencyTargetCurrency` | GET | `ticker_utc_new/{quote_currency}/{target_currency}` |  |
| `v2PublicGetCurrencies` | GET | `currencies` |  |
| `v2PublicGetCurrenciesCurrency` | GET | `currencies/{currency}` |  |
| `v2PublicGetChartQuoteCurrencyTargetCurrency` | GET | `chart/{quote_currency}/{target_currency}` |  |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostAccountDepositAddress` | POST | `account/deposit_address` |  |
| `privatePostAccountBtcDepositAddress` | POST | `account/btc_deposit_address` |  |
| `privatePostAccountBalance` | POST | `account/balance` |  |
| `privatePostAccountDailyBalance` | POST | `account/daily_balance` |  |
| `privatePostAccountUserInfo` | POST | `account/user_info` |  |
| `privatePostAccountVirtualAccount` | POST | `account/virtual_account` |  |
| `privatePostOrderCancelAll` | POST | `order/cancel_all` |  |
| `privatePostOrderCancel` | POST | `order/cancel` |  |
| `privatePostOrderLimitBuy` | POST | `order/limit_buy` |  |
| `privatePostOrderLimitSell` | POST | `order/limit_sell` |  |
| `privatePostOrderCompleteOrders` | POST | `order/complete_orders` |  |
| `privatePostOrderLimitOrders` | POST | `order/limit_orders` |  |
| `privatePostOrderOrderInfo` | POST | `order/order_info` |  |
| `privatePostTransactionAuthNumber` | POST | `transaction/auth_number` |  |
| `privatePostTransactionHistory` | POST | `transaction/history` |  |
| `privatePostTransactionKrwHistory` | POST | `transaction/krw/history` |  |
| `privatePostTransactionBtc` | POST | `transaction/btc` |  |
| `privatePostTransactionCoin` | POST | `transaction/coin` |  |

## v2Private

**Base URL**: `https://api.coinone.co.kr/v2`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PrivatePostAccountBalance` | POST | `account/balance` |  |
| `v2PrivatePostAccountDepositAddress` | POST | `account/deposit_address` |  |
| `v2PrivatePostAccountUserInfo` | POST | `account/user_info` |  |
| `v2PrivatePostAccountVirtualAccount` | POST | `account/virtual_account` |  |
| `v2PrivatePostOrderCancel` | POST | `order/cancel` |  |
| `v2PrivatePostOrderLimitBuy` | POST | `order/limit_buy` |  |
| `v2PrivatePostOrderLimitSell` | POST | `order/limit_sell` |  |
| `v2PrivatePostOrderLimitOrders` | POST | `order/limit_orders` |  |
| `v2PrivatePostOrderCompleteOrders` | POST | `order/complete_orders` |  |
| `v2PrivatePostOrderQueryOrder` | POST | `order/query_order` |  |
| `v2PrivatePostTransactionAuthNumber` | POST | `transaction/auth_number` |  |
| `v2PrivatePostTransactionBtc` | POST | `transaction/btc` |  |
| `v2PrivatePostTransactionHistory` | POST | `transaction/history` |  |
| `v2PrivatePostTransactionKrwHistory` | POST | `transaction/krw/history` |  |

## v2_1Private

**Base URL**: `https://api.coinone.co.kr/v2.1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2_1PrivatePostAccountBalanceAll` | POST | `account/balance/all` |  |
| `v2_1PrivatePostAccountBalance` | POST | `account/balance` |  |
| `v2_1PrivatePostAccountTradeFee` | POST | `account/trade_fee` |  |
| `v2_1PrivatePostAccountTradeFeeQuoteCurrencyTargetCurrency` | POST | `account/trade_fee/{quote_currency}/{target_currency}` |  |
| `v2_1PrivatePostOrderLimit` | POST | `order/limit` |  |
| `v2_1PrivatePostOrderCancel` | POST | `order/cancel` |  |
| `v2_1PrivatePostOrderCancelAll` | POST | `order/cancel/all` |  |
| `v2_1PrivatePostOrderOpenOrders` | POST | `order/open_orders` |  |
| `v2_1PrivatePostOrderOpenOrdersAll` | POST | `order/open_orders/all` |  |
| `v2_1PrivatePostOrderCompleteOrders` | POST | `order/complete_orders` |  |
| `v2_1PrivatePostOrderCompleteOrdersAll` | POST | `order/complete_orders/all` |  |
| `v2_1PrivatePostOrderInfo` | POST | `order/info` |  |
| `v2_1PrivatePostTransactionKrwHistory` | POST | `transaction/krw/history` |  |
| `v2_1PrivatePostTransactionCoinHistory` | POST | `transaction/coin/history` |  |
| `v2_1PrivatePostTransactionCoinWithdrawalLimit` | POST | `transaction/coin/withdrawal/limit` |  |

