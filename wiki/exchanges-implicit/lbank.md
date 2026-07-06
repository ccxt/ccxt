Every endpoint in `lbank`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/lbank) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `spotPublicGetCurrencyPairs`); the snake_case alias (`spot_public_get_currencypairs`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`SpotPublicGetCurrencyPairs`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const lbank = new ccxt.lbank ();
const response = await lbank.spotPublicGetCurrencyPairs (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const lbank = new ccxt.lbank ();
const response = await lbank.spotPublicGetCurrencyPairs (params);
```

#### **Python**

```python
import ccxt
lbank = ccxt.lbank()
response = lbank.spot_public_get_currencypairs(params)
```

#### **PHP**

```php
$lbank = new \ccxt\lbank();
$response = $lbank->spot_public_get_currencypairs($params);
```

#### **C#**

```csharp
using ccxt;
var lbank = new Lbank();
var response = await lbank.spotPublicGetCurrencyPairs(parameters);
```

#### **Go**

```go
lbank := ccxt.NewLbank(nil)
response := <-lbank.SpotPublicGetCurrencyPairs(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official lbank API documentation:** [lbank.com](https://www.lbank.com/en-US/docs/index.html)

> 58 implicit endpoints across 2 access groups.

## spot

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `spotPublicGetCurrencyPairs` | GET | `currencyPairs` | 2.5 |
| `spotPublicGetAccuracy` | GET | `accuracy` | 2.5 |
| `spotPublicGetUsdToCny` | GET | `usdToCny` | 2.5 |
| `spotPublicGetAssetConfigs` | GET | `assetConfigs` | 2.5 |
| `spotPublicGetWithdrawConfigs` | GET | `withdrawConfigs` | 3.75 |
| `spotPublicGetTimestamp` | GET | `timestamp` | 2.5 |
| `spotPublicGetTicker24hr` | GET | `ticker/24hr` | 2.5 |
| `spotPublicGetTicker` | GET | `ticker` | 2.5 |
| `spotPublicGetDepth` | GET | `depth` | 2.5 |
| `spotPublicGetIncrDepth` | GET | `incrDepth` | 2.5 |
| `spotPublicGetTrades` | GET | `trades` | 2.5 |
| `spotPublicGetKline` | GET | `kline` | 2.5 |
| `spotPublicGetSupplementSystemPing` | GET | `supplement/system_ping` | 2.5 |
| `spotPublicGetSupplementIncrDepth` | GET | `supplement/incrDepth` | 2.5 |
| `spotPublicGetSupplementTrades` | GET | `supplement/trades` | 2.5 |
| `spotPublicGetSupplementTickerPrice` | GET | `supplement/ticker/price` | 2.5 |
| `spotPublicGetSupplementTickerBookTicker` | GET | `supplement/ticker/bookTicker` | 2.5 |
| `spotPublicPostSupplementSystemStatus` | POST | `supplement/system_status` | 2.5 |
| `spotPrivatePostUserInfo` | POST | `user_info` | 2.5 |
| `spotPrivatePostSubscribeGetKey` | POST | `subscribe/get_key` | 2.5 |
| `spotPrivatePostSubscribeRefreshKey` | POST | `subscribe/refresh_key` | 2.5 |
| `spotPrivatePostSubscribeDestroyKey` | POST | `subscribe/destroy_key` | 2.5 |
| `spotPrivatePostGetDepositAddress` | POST | `get_deposit_address` | 2.5 |
| `spotPrivatePostDepositHistory` | POST | `deposit_history` | 2.5 |
| `spotPrivatePostCreateOrder` | POST | `create_order` | 1 |
| `spotPrivatePostBatchCreateOrder` | POST | `batch_create_order` | 1 |
| `spotPrivatePostCancelOrder` | POST | `cancel_order` | 1 |
| `spotPrivatePostCancelClientOrders` | POST | `cancel_clientOrders` | 1 |
| `spotPrivatePostOrdersInfo` | POST | `orders_info` | 2.5 |
| `spotPrivatePostOrdersInfoHistory` | POST | `orders_info_history` | 2.5 |
| `spotPrivatePostOrderTransactionDetail` | POST | `order_transaction_detail` | 2.5 |
| `spotPrivatePostTransactionHistory` | POST | `transaction_history` | 2.5 |
| `spotPrivatePostOrdersInfoNoDeal` | POST | `orders_info_no_deal` | 2.5 |
| `spotPrivatePostWithdraw` | POST | `withdraw` | 2.5 |
| `spotPrivatePostWithdrawCancel` | POST | `withdrawCancel` | 2.5 |
| `spotPrivatePostWithdraws` | POST | `withdraws` | 2.5 |
| `spotPrivatePostSupplementUserInfo` | POST | `supplement/user_info` | 2.5 |
| `spotPrivatePostSupplementWithdraw` | POST | `supplement/withdraw` | 2.5 |
| `spotPrivatePostSupplementDepositHistory` | POST | `supplement/deposit_history` | 2.5 |
| `spotPrivatePostSupplementWithdraws` | POST | `supplement/withdraws` | 2.5 |
| `spotPrivatePostSupplementGetDepositAddress` | POST | `supplement/get_deposit_address` | 2.5 |
| `spotPrivatePostSupplementAssetDetail` | POST | `supplement/asset_detail` | 2.5 |
| `spotPrivatePostSupplementCustomerTradeFee` | POST | `supplement/customer_trade_fee` | 2.5 |
| `spotPrivatePostSupplementApiRestrictions` | POST | `supplement/api_Restrictions` | 2.5 |
| `spotPrivatePostSupplementSystemPing` | POST | `supplement/system_ping` | 2.5 |
| `spotPrivatePostSupplementCreateOrderTest` | POST | `supplement/create_order_test` | 1 |
| `spotPrivatePostSupplementCreateOrder` | POST | `supplement/create_order` | 1 |
| `spotPrivatePostSupplementCancelOrder` | POST | `supplement/cancel_order` | 1 |
| `spotPrivatePostSupplementCancelOrderBySymbol` | POST | `supplement/cancel_order_by_symbol` | 1 |
| `spotPrivatePostSupplementOrdersInfo` | POST | `supplement/orders_info` | 2.5 |
| `spotPrivatePostSupplementOrdersInfoNoDeal` | POST | `supplement/orders_info_no_deal` | 2.5 |
| `spotPrivatePostSupplementOrdersInfoHistory` | POST | `supplement/orders_info_history` | 2.5 |
| `spotPrivatePostSupplementUserInfoAccount` | POST | `supplement/user_info_account` | 2.5 |
| `spotPrivatePostSupplementTransactionHistory` | POST | `supplement/transaction_history` | 2.5 |

## contract

**Base URL**: `https://lbkperp.lbank.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `contractPublicGetCfdOpenApiV1PubGetTime` | GET | `cfd/openApi/v1/pub/getTime` | 2.5 |
| `contractPublicGetCfdOpenApiV1PubInstrument` | GET | `cfd/openApi/v1/pub/instrument` | 2.5 |
| `contractPublicGetCfdOpenApiV1PubMarketData` | GET | `cfd/openApi/v1/pub/marketData` | 2.5 |
| `contractPublicGetCfdOpenApiV1PubMarketOrder` | GET | `cfd/openApi/v1/pub/marketOrder` | 2.5 |

