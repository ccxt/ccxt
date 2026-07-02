Every endpoint in `ascendex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/ascendex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `v1PublicGetAssets`); the snake_case alias (`v1_public_get_assets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`V1PublicGetAssets`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const ascendex = new ccxt.ascendex ();
const response = await ascendex.v1PublicGetAssets (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const ascendex = new ccxt.ascendex ();
const response = await ascendex.v1PublicGetAssets (params);
```

#### **Python**

```python
import ccxt
ascendex = ccxt.ascendex()
response = ascendex.v1_public_get_assets(params)
```

#### **PHP**

```php
$ascendex = new \ccxt\ascendex();
$response = $ascendex->v1_public_get_assets($params);
```

#### **C#**

```csharp
using ccxt;
var ascendex = new Ascendex();
var response = await ascendex.v1PublicGetAssets(parameters);
```

#### **Go**

```go
ascendex := ccxt.NewAscendex(nil)
response := <-ascendex.V1PublicGetAssets(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official ascendex API documentation:** [ascendex.github.io](https://ascendex.github.io/ascendex-pro-api/#ascendex-pro-api-documentation)

> 73 implicit endpoints across 2 access groups.

## v1

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v1PublicGetAssets` | GET | `assets` | 1 |
| `v1PublicGetProducts` | GET | `products` | 1 |
| `v1PublicGetTicker` | GET | `ticker` | 1 |
| `v1PublicGetBarhistInfo` | GET | `barhist/info` | 1 |
| `v1PublicGetBarhist` | GET | `barhist` | 1 |
| `v1PublicGetDepth` | GET | `depth` | 1 |
| `v1PublicGetTrades` | GET | `trades` | 1 |
| `v1PublicGetCashAssets` | GET | `cash/assets` | 1 |
| `v1PublicGetCashProducts` | GET | `cash/products` | 1 |
| `v1PublicGetMarginAssets` | GET | `margin/assets` | 1 |
| `v1PublicGetMarginProducts` | GET | `margin/products` | 1 |
| `v1PublicGetFuturesCollateral` | GET | `futures/collateral` | 1 |
| `v1PublicGetFuturesContracts` | GET | `futures/contracts` | 1 |
| `v1PublicGetFuturesRefPx` | GET | `futures/ref-px` | 1 |
| `v1PublicGetFuturesMarketData` | GET | `futures/market-data` | 1 |
| `v1PublicGetFuturesFundingRates` | GET | `futures/funding-rates` | 1 |
| `v1PublicGetRiskLimitInfo` | GET | `risk-limit-info` | 1 |
| `v1PublicGetExchangeInfo` | GET | `exchange-info` | 1 |
| `v1PrivateGetInfo` | GET | `info` | 1 |
| `v1PrivateGetWalletTransactions` | GET | `wallet/transactions` | 1 |
| `v1PrivateGetWalletDepositAddress` | GET | `wallet/deposit/address` | 1 |
| `v1PrivateGetDataBalanceSnapshot` | GET | `data/balance/snapshot` | 1 |
| `v1PrivateGetDataBalanceHistory` | GET | `data/balance/history` | 1 |
| `v1PrivateAccountCategoryGetBalance` | GET | `balance` | 1 |
| `v1PrivateAccountCategoryGetOrderOpen` | GET | `order/open` | 1 |
| `v1PrivateAccountCategoryGetOrderStatus` | GET | `order/status` | 1 |
| `v1PrivateAccountCategoryGetOrderHistCurrent` | GET | `order/hist/current` | 1 |
| `v1PrivateAccountCategoryGetRisk` | GET | `risk` | 1 |
| `v1PrivateAccountCategoryPostOrder` | POST | `order` | 1 |
| `v1PrivateAccountCategoryPostOrderBatch` | POST | `order/batch` | 1 |
| `v1PrivateAccountCategoryDeleteOrder` | DELETE | `order` | 1 |
| `v1PrivateAccountCategoryDeleteOrderAll` | DELETE | `order/all` | 1 |
| `v1PrivateAccountCategoryDeleteOrderBatch` | DELETE | `order/batch` | 1 |
| `v1PrivateAccountGroupGetCashBalance` | GET | `cash/balance` | 1 |
| `v1PrivateAccountGroupGetMarginBalance` | GET | `margin/balance` | 1 |
| `v1PrivateAccountGroupGetMarginRisk` | GET | `margin/risk` | 1 |
| `v1PrivateAccountGroupGetFuturesCollateralBalance` | GET | `futures/collateral-balance` | 1 |
| `v1PrivateAccountGroupGetFuturesPosition` | GET | `futures/position` | 1 |
| `v1PrivateAccountGroupGetFuturesRisk` | GET | `futures/risk` | 1 |
| `v1PrivateAccountGroupGetFuturesFundingPayments` | GET | `futures/funding-payments` | 1 |
| `v1PrivateAccountGroupGetOrderHist` | GET | `order/hist` | 1 |
| `v1PrivateAccountGroupGetSpotFee` | GET | `spot/fee` | 1 |
| `v1PrivateAccountGroupPostTransfer` | POST | `transfer` | 1 |
| `v1PrivateAccountGroupPostFuturesTransferDeposit` | POST | `futures/transfer/deposit` | 1 |
| `v1PrivateAccountGroupPostFuturesTransferWithdraw` | POST | `futures/transfer/withdraw` | 1 |

## v2

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2PublicGetAssets` | GET | `assets` | 1 |
| `v2PublicGetFuturesContract` | GET | `futures/contract` | 1 |
| `v2PublicGetFuturesCollateral` | GET | `futures/collateral` | 1 |
| `v2PublicGetFuturesPricingData` | GET | `futures/pricing-data` | 1 |
| `v2PublicGetFuturesTicker` | GET | `futures/ticker` | 1 |
| `v2PublicGetRiskLimitInfo` | GET | `risk-limit-info` | 1 |
| `v2PrivateDataGetOrderHist` | GET | `order/hist` | 1 |
| `v2PrivateGetAccountInfo` | GET | `account/info` | 1 |
| `v2PrivateAccountGroupGetOrderHist` | GET | `order/hist` | 1 |
| `v2PrivateAccountGroupGetFuturesPosition` | GET | `futures/position` | 1 |
| `v2PrivateAccountGroupGetFuturesFreeMargin` | GET | `futures/free-margin` | 1 |
| `v2PrivateAccountGroupGetFuturesOrderHistCurrent` | GET | `futures/order/hist/current` | 1 |
| `v2PrivateAccountGroupGetFuturesFundingPayments` | GET | `futures/funding-payments` | 1 |
| `v2PrivateAccountGroupGetFuturesOrderOpen` | GET | `futures/order/open` | 1 |
| `v2PrivateAccountGroupGetFuturesOrderStatus` | GET | `futures/order/status` | 1 |
| `v2PrivateAccountGroupPostFuturesIsolatedPositionMargin` | POST | `futures/isolated-position-margin` | 1 |
| `v2PrivateAccountGroupPostFuturesMarginType` | POST | `futures/margin-type` | 1 |
| `v2PrivateAccountGroupPostFuturesLeverage` | POST | `futures/leverage` | 1 |
| `v2PrivateAccountGroupPostFuturesTransferDeposit` | POST | `futures/transfer/deposit` | 1 |
| `v2PrivateAccountGroupPostFuturesTransferWithdraw` | POST | `futures/transfer/withdraw` | 1 |
| `v2PrivateAccountGroupPostFuturesOrder` | POST | `futures/order` | 1 |
| `v2PrivateAccountGroupPostFuturesOrderBatch` | POST | `futures/order/batch` | 1 |
| `v2PrivateAccountGroupPostFuturesOrderOpen` | POST | `futures/order/open` | 1 |
| `v2PrivateAccountGroupPostSubuserSubuserTransfer` | POST | `subuser/subuser-transfer` | 1 |
| `v2PrivateAccountGroupPostSubuserSubuserTransferHist` | POST | `subuser/subuser-transfer-hist` | 1 |
| `v2PrivateAccountGroupDeleteFuturesOrder` | DELETE | `futures/order` | 1 |
| `v2PrivateAccountGroupDeleteFuturesOrderBatch` | DELETE | `futures/order/batch` | 1 |
| `v2PrivateAccountGroupDeleteFuturesOrderAll` | DELETE | `futures/order/all` | 1 |

