Every endpoint in `phemex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/phemex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetCfgV2Products`); the snake_case alias (`public_get_cfg_v2_products`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetCfgV2Products`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const phemex = new ccxt.phemex ();
const response = await phemex.publicGetCfgV2Products (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const phemex = new ccxt.phemex ();
const response = await phemex.publicGetCfgV2Products (params);
```

#### **Python**

```python
import ccxt
phemex = ccxt.phemex()
response = phemex.public_get_cfg_v2_products(params)
```

#### **PHP**

```php
$phemex = new \ccxt\phemex();
$response = $phemex->public_get_cfg_v2_products($params);
```

#### **C#**

```csharp
using ccxt;
var phemex = new Phemex();
var response = await phemex.publicGetCfgV2Products(parameters);
```

#### **Go**

```go
phemex := ccxt.NewPhemex(nil)
response := <-phemex.PublicGetCfgV2Products(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official phemex API documentation:** [phemex-docs.github.io](https://phemex-docs.github.io/#overview)

> 115 implicit endpoints across 4 access groups.

## public

**Base URL**: `https://{hostname}/exchange/public`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetCfgV2Products` | GET | `cfg/v2/products` | 5 |
| `publicGetCfgFundingRates` | GET | `cfg/fundingRates` | 5 |
| `publicGetProducts` | GET | `products` | 5 |
| `publicGetNomicsTrades` | GET | `nomics/trades` | 5 |
| `publicGetMdKline` | GET | `md/kline` | 5 |
| `publicGetMdV2KlineList` | GET | `md/v2/kline/list` | 5 |
| `publicGetMdV2Kline` | GET | `md/v2/kline` | 5 |
| `publicGetMdV2KlineLast` | GET | `md/v2/kline/last` | 5 |
| `publicGetMdOrderbook` | GET | `md/orderbook` | 5 |
| `publicGetMdTrade` | GET | `md/trade` | 5 |
| `publicGetMdSpotTicker24hr` | GET | `md/spot/ticker/24hr` | 5 |
| `publicGetExchangePublicCfgChainSettings` | GET | `exchange/public/cfg/chain-settings` | 5 |

## v1

**Base URL**: `https://{hostname}/v1`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v1GetMdFullbook` | GET | `md/fullbook` | 5 |
| `v1GetMdOrderbook` | GET | `md/orderbook` | 5 |
| `v1GetMdTrade` | GET | `md/trade` | 5 |
| `v1GetMdTicker24hr` | GET | `md/ticker/24hr` | 5 |
| `v1GetMdTicker24hrAll` | GET | `md/ticker/24hr/all` | 5 |
| `v1GetMdSpotTicker24hr` | GET | `md/spot/ticker/24hr` | 5 |
| `v1GetMdSpotTicker24hrAll` | GET | `md/spot/ticker/24hr/all` | 5 |
| `v1GetExchangePublicProducts` | GET | `exchange/public/products` | 5 |
| `v1GetApiDataPublicDataFundingRateHistory` | GET | `api-data/public/data/funding-rate-history` | 5 |

## v2

**Base URL**: `https://{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v2GetPublicProducts` | GET | `public/products` | 5 |
| `v2GetPublicProductsPlus` | GET | `public/products-plus` | 5 |
| `v2GetMdV2Orderbook` | GET | `md/v2/orderbook` | 5 |
| `v2GetMdV2Trade` | GET | `md/v2/trade` | 5 |
| `v2GetMdV2Ticker24hr` | GET | `md/v2/ticker/24hr` | 5 |
| `v2GetMdV2Ticker24hrAll` | GET | `md/v2/ticker/24hr/all` | 5 |
| `v2GetApiDataPublicDataFundingRateHistory` | GET | `api-data/public/data/funding-rate-history` | 5 |

## private

**Base URL**: `https://{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetSpotOrdersActive` | GET | `spot/orders/active` | 1 |
| `privateGetSpotOrders` | GET | `spot/orders` | 1 |
| `privateGetSpotWallets` | GET | `spot/wallets` | 5 |
| `privateGetExchangeSpotOrder` | GET | `exchange/spot/order` | 5 |
| `privateGetExchangeSpotOrderTrades` | GET | `exchange/spot/order/trades` | 5 |
| `privateGetExchangeOrderV2OrderList` | GET | `exchange/order/v2/orderList` | 5 |
| `privateGetExchangeOrderV2TradingList` | GET | `exchange/order/v2/tradingList` | 5 |
| `privateGetAccountsAccountPositions` | GET | `accounts/accountPositions` | 1 |
| `privateGetGAccountsAccountPositions` | GET | `g-accounts/accountPositions` | 1 |
| `privateGetGAccountsPositions` | GET | `g-accounts/positions` | 25 |
| `privateGetGAccountsRiskUnit` | GET | `g-accounts/risk-unit` | 1 |
| `privateGetApiDataFuturesFundingFees` | GET | `api-data/futures/funding-fees` | 5 |
| `privateGetApiDataGFuturesFundingFees` | GET | `api-data/g-futures/funding-fees` | 5 |
| `privateGetApiDataFuturesOrders` | GET | `api-data/futures/orders` | 5 |
| `privateGetApiDataGFuturesOrders` | GET | `api-data/g-futures/orders` | 5 |
| `privateGetApiDataFuturesOrdersByOrderId` | GET | `api-data/futures/orders/by-order-id` | 5 |
| `privateGetApiDataGFuturesOrdersByOrderId` | GET | `api-data/g-futures/orders/by-order-id` | 5 |
| `privateGetApiDataFuturesTrades` | GET | `api-data/futures/trades` | 5 |
| `privateGetApiDataGFuturesTrades` | GET | `api-data/g-futures/trades` | 5 |
| `privateGetApiDataFuturesTradingFees` | GET | `api-data/futures/trading-fees` | 5 |
| `privateGetApiDataGFuturesTradingFees` | GET | `api-data/g-futures/trading-fees` | 5 |
| `privateGetApiDataFuturesV2TradeAccountDetail` | GET | `api-data/futures/v2/tradeAccountDetail` | 5 |
| `privateGetApiDataGFuturesClosedPosition` | GET | `api-data/g-futures/closedPosition` | 5 |
| `privateGetGOrdersActiveList` | GET | `g-orders/activeList` | 1 |
| `privateGetOrdersActiveList` | GET | `orders/activeList` | 1 |
| `privateGetExchangeOrderList` | GET | `exchange/order/list` | 5 |
| `privateGetExchangeOrder` | GET | `exchange/order` | 5 |
| `privateGetExchangeOrderTrade` | GET | `exchange/order/trade` | 5 |
| `privateGetPhemexUserUsersChildren` | GET | `phemex-user/users/children` | 5 |
| `privateGetPhemexUserWalletsV2DepositAddress` | GET | `phemex-user/wallets/v2/depositAddress` | 5 |
| `privateGetPhemexUserWalletsTradeAccountDetail` | GET | `phemex-user/wallets/tradeAccountDetail` | 5 |
| `privateGetPhemexDepositWalletsApiDepositAddress` | GET | `phemex-deposit/wallets/api/depositAddress` | 5 |
| `privateGetPhemexDepositWalletsApiDepositHist` | GET | `phemex-deposit/wallets/api/depositHist` | 5 |
| `privateGetPhemexDepositWalletsApiChainCfg` | GET | `phemex-deposit/wallets/api/chainCfg` | 5 |
| `privateGetPhemexWithdrawWalletsApiWithdrawHist` | GET | `phemex-withdraw/wallets/api/withdrawHist` | 5 |
| `privateGetPhemexWithdrawWalletsApiAssetInfo` | GET | `phemex-withdraw/wallets/api/asset/info` | 5 |
| `privateGetPhemexUserOrderClosedPositionList` | GET | `phemex-user/order/closedPositionList` | 5 |
| `privateGetExchangeMarginsTransfer` | GET | `exchange/margins/transfer` | 5 |
| `privateGetExchangeWalletsConfirmWithdraw` | GET | `exchange/wallets/confirm/withdraw` | 5 |
| `privateGetExchangeWalletsWithdrawList` | GET | `exchange/wallets/withdrawList` | 5 |
| `privateGetExchangeWalletsDepositList` | GET | `exchange/wallets/depositList` | 5 |
| `privateGetExchangeWalletsV2DepositAddress` | GET | `exchange/wallets/v2/depositAddress` | 5 |
| `privateGetApiDataSpotsFunds` | GET | `api-data/spots/funds` | 5 |
| `privateGetApiDataSpotsOrders` | GET | `api-data/spots/orders` | 5 |
| `privateGetApiDataSpotsOrdersByOrderId` | GET | `api-data/spots/orders/by-order-id` | 5 |
| `privateGetApiDataSpotsPnls` | GET | `api-data/spots/pnls` | 5 |
| `privateGetApiDataSpotsTrades` | GET | `api-data/spots/trades` | 5 |
| `privateGetApiDataSpotsTradesByOrderId` | GET | `api-data/spots/trades/by-order-id` | 5 |
| `privateGetAssetsConvert` | GET | `assets/convert` | 5 |
| `privateGetAssetsTransfer` | GET | `assets/transfer` | 5 |
| `privateGetAssetsSpotsSubAccountsTransfer` | GET | `assets/spots/sub-accounts/transfer` | 5 |
| `privateGetAssetsFuturesSubAccountsTransfer` | GET | `assets/futures/sub-accounts/transfer` | 5 |
| `privateGetAssetsQuote` | GET | `assets/quote` | 5 |
| `privatePostSpotOrders` | POST | `spot/orders` | 1 |
| `privatePostOrders` | POST | `orders` | 1 |
| `privatePostGOrders` | POST | `g-orders` | 1 |
| `privatePostPositionsAssign` | POST | `positions/assign` | 5 |
| `privatePostExchangeWalletsTransferOut` | POST | `exchange/wallets/transferOut` | 5 |
| `privatePostExchangeWalletsTransferIn` | POST | `exchange/wallets/transferIn` | 5 |
| `privatePostExchangeMargins` | POST | `exchange/margins` | 5 |
| `privatePostExchangeWalletsCreateWithdraw` | POST | `exchange/wallets/createWithdraw` | 5 |
| `privatePostExchangeWalletsCancelWithdraw` | POST | `exchange/wallets/cancelWithdraw` | 5 |
| `privatePostExchangeWalletsCreateWithdrawAddress` | POST | `exchange/wallets/createWithdrawAddress` | 5 |
| `privatePostAssetsTransfer` | POST | `assets/transfer` | 5 |
| `privatePostAssetsSpotsSubAccountsTransfer` | POST | `assets/spots/sub-accounts/transfer` | 5 |
| `privatePostAssetsFuturesSubAccountsTransfer` | POST | `assets/futures/sub-accounts/transfer` | 5 |
| `privatePostAssetsUniversalTransfer` | POST | `assets/universal-transfer` | 5 |
| `privatePostAssetsConvert` | POST | `assets/convert` | 5 |
| `privatePostPhemexWithdrawWalletsApiCreateWithdraw` | POST | `phemex-withdraw/wallets/api/createWithdraw` | 5 |
| `privatePostPhemexWithdrawWalletsApiCancelWithdraw` | POST | `phemex-withdraw/wallets/api/cancelWithdraw` | 5 |
| `privatePutSpotOrdersCreate` | PUT | `spot/orders/create` | 1 |
| `privatePutSpotOrders` | PUT | `spot/orders` | 1 |
| `privatePutOrdersReplace` | PUT | `orders/replace` | 1 |
| `privatePutGOrdersReplace` | PUT | `g-orders/replace` | 1 |
| `privatePutGOrdersCreate` | PUT | `g-orders/create` | 1 |
| `privatePutPositionsLeverage` | PUT | `positions/leverage` | 5 |
| `privatePutGPositionsLeverage` | PUT | `g-positions/leverage` | 5 |
| `privatePutGPositionsSwitchPosModeSync` | PUT | `g-positions/switch-pos-mode-sync` | 5 |
| `privatePutPositionsRiskLimit` | PUT | `positions/riskLimit` | 5 |
| `privateDeleteSpotOrders` | DELETE | `spot/orders` | 2 |
| `privateDeleteSpotOrdersAll` | DELETE | `spot/orders/all` | 2 |
| `privateDeleteOrdersCancel` | DELETE | `orders/cancel` | 1 |
| `privateDeleteOrders` | DELETE | `orders` | 1 |
| `privateDeleteOrdersAll` | DELETE | `orders/all` | 3 |
| `privateDeleteGOrdersCancel` | DELETE | `g-orders/cancel` | 1 |
| `privateDeleteGOrders` | DELETE | `g-orders` | 1 |
| `privateDeleteGOrdersAll` | DELETE | `g-orders/all` | 3 |

