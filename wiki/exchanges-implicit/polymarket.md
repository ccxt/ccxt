Every endpoint in `polymarket`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/polymarket) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetInfoPing`); Python and PHP use the snake_case form (`public_get_info_ping`), and Go uses the PascalCase form (`PublicGetInfoPing`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const polymarket = new ccxt.polymarket ();
const response = await polymarket.publicGetInfoPing (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const polymarket = new ccxt.polymarket ();
const response = await polymarket.publicGetInfoPing (params);
```

#### **Python**

```python
import ccxt
polymarket = ccxt.polymarket()
response = polymarket.public_get_info_ping(params)
```

#### **PHP**

```php
$polymarket = new \ccxt\polymarket();
$response = $polymarket->public_get_info_ping($params);
```

#### **C#**

```csharp
using ccxt;
var polymarket = new Polymarket();
var response = await polymarket.publicGetInfoPing(parameters);
```

#### **Go**

```go
polymarket := ccxt.NewPolymarket(nil)
response := <-polymarket.PublicGetInfoPing(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official polymarket API documentation:** [docs.polymarket.com](https://docs.polymarket.com/perps/overview) · [docs.polymarket.com](https://docs.polymarket.com/api-reference/perps/overview)

> 45 implicit endpoints across 3 access groups.

## public

**Base URL**: `https://api.perpetuals.polymarket.com/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetInfoPing` | GET | `info/ping` | 1 |
| `publicGetInfoTime` | GET | `info/time` | 1 |
| `publicGetInfoExchange` | GET | `info/exchange` | 2 |
| `publicGetInfoAssets` | GET | `info/assets` | 2 |
| `publicGetInfoInstruments` | GET | `info/instruments` | 2 |
| `publicGetInfoTickers` | GET | `info/tickers` | 2 |
| `publicGetInfoStatistics` | GET | `info/statistics` | 2 |
| `publicGetInfoKlines` | GET | `info/klines` | 5 |
| `publicGetInfoMarkHistory` | GET | `info/mark-history` | 5 |
| `publicGetInfoBbo` | GET | `info/bbo` | 2 |
| `publicGetInfoBook` | GET | `info/book` | 5 |
| `publicGetInfoIndex` | GET | `info/index` | 2 |
| `publicGetInfoTrades` | GET | `info/trades` | 10 |
| `publicGetInfoPortfolio` | GET | `info/portfolio` | 5 |
| `publicGetInfoPositionFills` | GET | `info/position-fills` | 10 |
| `publicGetInfoFunding` | GET | `info/funding` | 10 |
| `publicGetInfoFees` | GET | `info/fees` | 2 |
| `publicGetInfoLimitTiers` | GET | `info/limit-tiers` | 2 |
| `publicGetInfoInvite` | GET | `info/invite` | 1 |

## private

**Base URL**: `https://api.perpetuals.polymarket.com/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccountCredentials` | GET | `account/credentials` | 2 |
| `privateGetAccountOrders` | GET | `account/orders` | 10 |
| `privateGetAccountOpenOrders` | GET | `account/open-orders` | 20 |
| `privateGetAccountBalances` | GET | `account/balances` | 2 |
| `privateGetAccountPortfolio` | GET | `account/portfolio` | 2 |
| `privateGetAccountFills` | GET | `account/fills` | 10 |
| `privateGetAccountEquity` | GET | `account/equity` | 10 |
| `privateGetAccountPnl` | GET | `account/pnl` | 10 |
| `privateGetAccountFunding` | GET | `account/funding` | 10 |
| `privateGetAccountDeposits` | GET | `account/deposits` | 10 |
| `privateGetAccountWithdrawals` | GET | `account/withdrawals` | 10 |
| `privateGetAccountConfig` | GET | `account/config` | 2 |
| `privateGetAccountLimits` | GET | `account/limits` | 1 |
| `privateGetAccountAutoCancel` | GET | `account/auto-cancel` | 1 |

## trade

**Base URL**: `https://api.perpetuals.polymarket.com/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `tradePostTradeOrders` | POST | `trade/orders` | 1 |
| `tradePostAccountProxy` | POST | `account/proxy` | 1 |
| `tradePostAccountWithdraw` | POST | `account/withdraw` | 1 |
| `tradePatchTradeOrders` | PATCH | `trade/orders` | 1 |
| `tradePatchTradeOrdersCoid` | PATCH | `trade/orders-coid` | 1 |
| `tradePatchTradeLeverage` | PATCH | `trade/leverage` | 1 |
| `tradePatchTradeMargin` | PATCH | `trade/margin` | 1 |
| `tradePatchTradeAutoCancel` | PATCH | `trade/auto-cancel` | 1 |
| `tradeDeleteTradeOrders` | DELETE | `trade/orders` | 1 |
| `tradeDeleteTradeOrdersCoid` | DELETE | `trade/orders-coid` | 1 |
| `tradeDeleteTradeOrdersAll` | DELETE | `trade/orders/all` | 1 |
| `tradeDeleteAccountProxy` | DELETE | `account/proxy` | 1 |

