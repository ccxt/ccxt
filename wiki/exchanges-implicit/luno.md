Every endpoint in `luno`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/luno) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `exchangeGetMarkets`); the snake_case alias (`exchange_get_markets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`ExchangeGetMarkets`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const luno = new ccxt.luno ();
const response = await luno.exchangeGetMarkets (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const luno = new ccxt.luno ();
const response = await luno.exchangeGetMarkets (params);
```

#### **Python**

```python
import ccxt
luno = ccxt.luno()
response = luno.exchange_get_markets(params)
```

#### **PHP**

```php
$luno = new \ccxt\luno();
$response = $luno->exchange_get_markets($params);
```

#### **C#**

```csharp
using ccxt;
var luno = new Luno();
var response = await luno.exchangeGetMarkets(parameters);
```

#### **Go**

```go
luno := ccxt.NewLuno(nil)
response := <-luno.ExchangeGetMarkets(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official luno API documentation:** [luno.com](https://www.luno.com/en/api) · [npmjs.org](https://npmjs.org/package/bitx) · [github.com](https://github.com/bausmeier/node-bitx)

> 34 implicit endpoints across 4 access groups.

## exchange

**Base URL**: `https://api.luno.com/api/exchange`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `exchangeGetMarkets` | GET | `markets` | 1 |

## exchangePrivate

**Base URL**: `https://api.luno.com/api/exchange`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `exchangePrivateGetCandles` | GET | `candles` | 1 |

## public

**Base URL**: `https://api.luno.com/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetOrderbook` | GET | `orderbook` | 1 |
| `publicGetOrderbookTop` | GET | `orderbook_top` | 1 |
| `publicGetTicker` | GET | `ticker` | 1 |
| `publicGetTickers` | GET | `tickers` | 1 |
| `publicGetTrades` | GET | `trades` | 1 |

## private

**Base URL**: `https://api.luno.com/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccountsIdPending` | GET | `accounts/{id}/pending` | 1 |
| `privateGetAccountsIdTransactions` | GET | `accounts/{id}/transactions` | 1 |
| `privateGetBalance` | GET | `balance` | 1 |
| `privateGetBeneficiaries` | GET | `beneficiaries` | 1 |
| `privateGetSendNetworks` | GET | `send/networks` | 1 |
| `privateGetFeeInfo` | GET | `fee_info` | 1 |
| `privateGetFundingAddress` | GET | `funding_address` | 1 |
| `privateGetListorders` | GET | `listorders` | 1 |
| `privateGetListtrades` | GET | `listtrades` | 1 |
| `privateGetSendFee` | GET | `send_fee` | 1 |
| `privateGetOrdersId` | GET | `orders/{id}` | 1 |
| `privateGetWithdrawals` | GET | `withdrawals` | 1 |
| `privateGetWithdrawalsId` | GET | `withdrawals/{id}` | 1 |
| `privateGetTransfers` | GET | `transfers` | 1 |
| `privatePostAccounts` | POST | `accounts` | 1 |
| `privatePostAddressValidate` | POST | `address/validate` | 1 |
| `privatePostPostorder` | POST | `postorder` | 1 |
| `privatePostMarketorder` | POST | `marketorder` | 1 |
| `privatePostStoporder` | POST | `stoporder` | 1 |
| `privatePostFundingAddress` | POST | `funding_address` | 1 |
| `privatePostWithdrawals` | POST | `withdrawals` | 1 |
| `privatePostSend` | POST | `send` | 1 |
| `privatePostOauth2Grant` | POST | `oauth2/grant` | 1 |
| `privatePostBeneficiaries` | POST | `beneficiaries` | 1 |
| `privatePutAccountsIdName` | PUT | `accounts/{id}/name` | 1 |
| `privateDeleteWithdrawalsId` | DELETE | `withdrawals/{id}` | 1 |
| `privateDeleteBeneficiariesId` | DELETE | `beneficiaries/{id}` | 1 |

