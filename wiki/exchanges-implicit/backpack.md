Every endpoint in `backpack`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/backpack) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetApiV1Assets`); the snake_case alias (`public_get_api_v1_assets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetApiV1Assets`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const backpack = new ccxt.backpack ();
const response = await backpack.publicGetApiV1Assets (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const backpack = new ccxt.backpack ();
const response = await backpack.publicGetApiV1Assets (params);
```

#### **Python**

```python
import ccxt
backpack = ccxt.backpack()
response = backpack.public_get_api_v1_assets(params)
```

#### **PHP**

```php
$backpack = new \ccxt\backpack();
$response = $backpack->public_get_api_v1_assets($params);
```

#### **C#**

```csharp
using ccxt;
var backpack = new Backpack();
var response = await backpack.publicGetApiV1Assets(parameters);
```

#### **Go**

```go
backpack := ccxt.NewBackpack(nil)
response := <-backpack.PublicGetApiV1Assets(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official backpack API documentation:** [docs.backpack.exchange](https://docs.backpack.exchange/)

> 56 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.backpack.exchange`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetApiV1Assets` | GET | `api/v1/assets` | 1 |
| `publicGetApiV1Collateral` | GET | `api/v1/collateral` | 1 |
| `publicGetApiV1BorrowLendMarkets` | GET | `api/v1/borrowLend/markets` | 1 |
| `publicGetApiV1BorrowLendMarketsHistory` | GET | `api/v1/borrowLend/markets/history` | 1 |
| `publicGetApiV1Markets` | GET | `api/v1/markets` | 1 |
| `publicGetApiV1Market` | GET | `api/v1/market` | 1 |
| `publicGetApiV1Ticker` | GET | `api/v1/ticker` | 1 |
| `publicGetApiV1Tickers` | GET | `api/v1/tickers` | 1 |
| `publicGetApiV1Depth` | GET | `api/v1/depth` | 1 |
| `publicGetApiV1Klines` | GET | `api/v1/klines` | 1 |
| `publicGetApiV1MarkPrices` | GET | `api/v1/markPrices` | 1 |
| `publicGetApiV1OpenInterest` | GET | `api/v1/openInterest` | 1 |
| `publicGetApiV1FundingRates` | GET | `api/v1/fundingRates` | 1 |
| `publicGetApiV1Status` | GET | `api/v1/status` | 1 |
| `publicGetApiV1Ping` | GET | `api/v1/ping` | 1 |
| `publicGetApiV1Time` | GET | `api/v1/time` | 1 |
| `publicGetApiV1Wallets` | GET | `api/v1/wallets` | 1 |
| `publicGetApiV1Trades` | GET | `api/v1/trades` | 1 |
| `publicGetApiV1TradesHistory` | GET | `api/v1/trades/history` | 1 |

## private

**Base URL**: `https://api.backpack.exchange`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetApiV1Account` | GET | `api/v1/account` | 1 |
| `privateGetApiV1AccountLimitsBorrow` | GET | `api/v1/account/limits/borrow` | 1 |
| `privateGetApiV1AccountLimitsOrder` | GET | `api/v1/account/limits/order` | 1 |
| `privateGetApiV1AccountLimitsWithdrawal` | GET | `api/v1/account/limits/withdrawal` | 1 |
| `privateGetApiV1BorrowLendPositions` | GET | `api/v1/borrowLend/positions` | 1 |
| `privateGetApiV1Capital` | GET | `api/v1/capital` | 1 |
| `privateGetApiV1CapitalCollateral` | GET | `api/v1/capital/collateral` | 1 |
| `privateGetWapiV1CapitalDeposits` | GET | `wapi/v1/capital/deposits` | 1 |
| `privateGetWapiV1CapitalDepositAddress` | GET | `wapi/v1/capital/deposit/address` | 1 |
| `privateGetWapiV1CapitalWithdrawals` | GET | `wapi/v1/capital/withdrawals` | 1 |
| `privateGetApiV1Position` | GET | `api/v1/position` | 1 |
| `privateGetWapiV1HistoryBorrowLend` | GET | `wapi/v1/history/borrowLend` | 1 |
| `privateGetWapiV1HistoryInterest` | GET | `wapi/v1/history/interest` | 1 |
| `privateGetWapiV1HistoryBorrowLendPositions` | GET | `wapi/v1/history/borrowLend/positions` | 1 |
| `privateGetWapiV1HistoryDust` | GET | `wapi/v1/history/dust` | 1 |
| `privateGetWapiV1HistoryFills` | GET | `wapi/v1/history/fills` | 1 |
| `privateGetWapiV1HistoryFunding` | GET | `wapi/v1/history/funding` | 1 |
| `privateGetWapiV1HistoryOrders` | GET | `wapi/v1/history/orders` | 1 |
| `privateGetWapiV1HistoryRfq` | GET | `wapi/v1/history/rfq` | 1 |
| `privateGetWapiV1HistoryQuote` | GET | `wapi/v1/history/quote` | 1 |
| `privateGetWapiV1HistorySettlement` | GET | `wapi/v1/history/settlement` | 1 |
| `privateGetWapiV1HistoryStrategies` | GET | `wapi/v1/history/strategies` | 1 |
| `privateGetApiV1Order` | GET | `api/v1/order` | 1 |
| `privateGetApiV1Orders` | GET | `api/v1/orders` | 1 |
| `privatePostApiV1AccountConvertDust` | POST | `api/v1/account/convertDust` | 1 |
| `privatePostApiV1BorrowLend` | POST | `api/v1/borrowLend` | 1 |
| `privatePostWapiV1CapitalWithdrawals` | POST | `wapi/v1/capital/withdrawals` | 1 |
| `privatePostApiV1Order` | POST | `api/v1/order` | 1 |
| `privatePostApiV1Orders` | POST | `api/v1/orders` | 1 |
| `privatePostApiV1Rfq` | POST | `api/v1/rfq` | 1 |
| `privatePostApiV1RfqAccept` | POST | `api/v1/rfq/accept` | 1 |
| `privatePostApiV1RfqRefresh` | POST | `api/v1/rfq/refresh` | 1 |
| `privatePostApiV1RfqCancel` | POST | `api/v1/rfq/cancel` | 1 |
| `privatePostApiV1RfqQuote` | POST | `api/v1/rfq/quote` | 1 |
| `privateDeleteApiV1Order` | DELETE | `api/v1/order` | 1 |
| `privateDeleteApiV1Orders` | DELETE | `api/v1/orders` | 1 |
| `privatePatchApiV1Account` | PATCH | `api/v1/account` | 1 |

