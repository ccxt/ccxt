Every endpoint in `pacifica`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/pacifica) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetInfo`); the snake_case alias (`public_get_info`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetInfo`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const pacifica = new ccxt.pacifica ();
const response = await pacifica.publicGetInfo (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const pacifica = new ccxt.pacifica ();
const response = await pacifica.publicGetInfo (params);
```

#### **Python**

```python
import ccxt
pacifica = ccxt.pacifica()
response = pacifica.public_get_info(params)
```

#### **PHP**

```php
$pacifica = new \ccxt\pacifica();
$response = $pacifica->public_get_info($params);
```

#### **C#**

```csharp
using ccxt;
var pacifica = new Pacifica();
var response = await pacifica.publicGetInfo(parameters);
```

#### **Go**

```go
pacifica := ccxt.NewPacifica(nil)
response := <-pacifica.PublicGetInfo(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official pacifica API documentation:** [docs.pacifica.fi](https://docs.pacifica.fi/api-documentation/api/rest-api)

> 39 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetInfo` | GET | `info` | 1 |
| `publicGetInfoPrices` | GET | `info/prices` | 1 |
| `publicGetKline` | GET | `kline` | 12 |
| `publicGetKlineMark` | GET | `kline/mark` | 12 |
| `publicGetBook` | GET | `book` | 1 |
| `publicGetTrades` | GET | `trades` | 1 |
| `publicGetFundingRateHistory` | GET | `funding_rate/history` | 1 |
| `publicGetAccount` | GET | `account` | 1 |
| `publicGetAccountSettings` | GET | `account/settings` | 1 |
| `publicGetPositions` | GET | `positions` | 1 |
| `publicGetTradesHistory` | GET | `trades/history` | 12 |
| `publicGetFundingHistory` | GET | `funding/history` | 1 |
| `publicGetPortfolio` | GET | `portfolio` | 1 |
| `publicGetAccountBalanceHistory` | GET | `account/balance/history` | 12 |
| `publicGetOrders` | GET | `orders` | 1 |
| `publicGetOrdersHistory` | GET | `orders/history` | 12 |
| `publicGetOrdersHistoryById` | GET | `orders/history_by_id` | 1 |
| `publicGetAccountBuilderCodesApprovals` | GET | `account/builder_codes/approvals` | 1 |

## private

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostAccountLeverage` | POST | `account/leverage` | 1 |
| `privatePostAccountMargin` | POST | `account/margin` | 1 |
| `privatePostAccountWithdraw` | POST | `account/withdraw` | 1 |
| `privatePostAccountSubaccountCreate` | POST | `account/subaccount/create` | 1 |
| `privatePostAccountSubaccountList` | POST | `account/subaccount/list` | 1 |
| `privatePostAccountSubaccountTransfer` | POST | `account/subaccount/transfer` | 1 |
| `privatePostOrdersCreate` | POST | `orders/create` | 1 |
| `privatePostOrdersCreateMarket` | POST | `orders/create_market` | 1 |
| `privatePostOrdersStopCreate` | POST | `orders/stop/create` | 1 |
| `privatePostPositionsTpsl` | POST | `positions/tpsl` | 1 |
| `privatePostOrdersCancel` | POST | `orders/cancel` | 0.5 |
| `privatePostOrdersCancelAll` | POST | `orders/cancel_all` | 0.5 |
| `privatePostOrdersStopCancel` | POST | `orders/stop/cancel` | 0.5 |
| `privatePostOrdersEdit` | POST | `orders/edit` | 1 |
| `privatePostOrdersBatch` | POST | `orders/batch` | 1 |
| `privatePostAccountBuilderCodesApprove` | POST | `account/builder_codes/approve` | 1 |
| `privatePostAccountBuilderCodesRevoke` | POST | `account/builder_codes/revoke` | 1 |
| `privatePostAgentBind` | POST | `agent/bind` | 1 |
| `privatePostAccountApiKeysCreate` | POST | `account/api_keys/create` | 1 |
| `privatePostAccountApiKeysRevoke` | POST | `account/api_keys/revoke` | 1 |
| `privatePostAccountApiKeys` | POST | `account/api_keys` | 1 |

