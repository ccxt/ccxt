Every endpoint in `alpaca`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/alpaca) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `traderPrivateGetV2Account`); the snake_case alias (`trader_private_get_v2_account`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`TraderPrivateGetV2Account`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const alpaca = new ccxt.alpaca ();
const response = await alpaca.traderPrivateGetV2Account (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const alpaca = new ccxt.alpaca ();
const response = await alpaca.traderPrivateGetV2Account (params);
```

#### **Python**

```python
import ccxt
alpaca = ccxt.alpaca()
response = alpaca.trader_private_get_v2_account(params)
```

#### **PHP**

```php
$alpaca = new \ccxt\alpaca();
$response = $alpaca->trader_private_get_v2_account($params);
```

#### **C#**

```csharp
using ccxt;
var alpaca = new Alpaca();
var response = await alpaca.traderPrivateGetV2Account(parameters);
```

#### **Go**

```go
alpaca := ccxt.NewAlpaca(nil)
response := <-alpaca.TraderPrivateGetV2Account(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official alpaca API documentation:** [alpaca.markets](https://alpaca.markets/docs/)

> 70 implicit endpoints across 2 access groups.

## trader

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `traderPrivateGetV2Account` | GET | `v2/account` |  |
| `traderPrivateGetV2Orders` | GET | `v2/orders` |  |
| `traderPrivateGetV2OrdersOrderId` | GET | `v2/orders/{order_id}` |  |
| `traderPrivateGetV2Positions` | GET | `v2/positions` |  |
| `traderPrivateGetV2PositionsSymbolOrAssetId` | GET | `v2/positions/{symbol_or_asset_id}` |  |
| `traderPrivateGetV2AccountPortfolioHistory` | GET | `v2/account/portfolio/history` |  |
| `traderPrivateGetV2Watchlists` | GET | `v2/watchlists` |  |
| `traderPrivateGetV2WatchlistsWatchlistId` | GET | `v2/watchlists/{watchlist_id}` |  |
| `traderPrivateGetV2WatchlistsByName` | GET | `v2/watchlists:by_name` |  |
| `traderPrivateGetV2AccountConfigurations` | GET | `v2/account/configurations` |  |
| `traderPrivateGetV2AccountActivities` | GET | `v2/account/activities` |  |
| `traderPrivateGetV2AccountActivitiesActivityType` | GET | `v2/account/activities/{activity_type}` |  |
| `traderPrivateGetV2Calendar` | GET | `v2/calendar` |  |
| `traderPrivateGetV2Clock` | GET | `v2/clock` |  |
| `traderPrivateGetV2Assets` | GET | `v2/assets` |  |
| `traderPrivateGetV2AssetsSymbolOrAssetId` | GET | `v2/assets/{symbol_or_asset_id}` |  |
| `traderPrivateGetV2CorporateActionsAnnouncementsId` | GET | `v2/corporate_actions/announcements/{id}` |  |
| `traderPrivateGetV2CorporateActionsAnnouncements` | GET | `v2/corporate_actions/announcements` |  |
| `traderPrivateGetV2Wallets` | GET | `v2/wallets` |  |
| `traderPrivateGetV2WalletsTransfers` | GET | `v2/wallets/transfers` |  |
| `traderPrivatePostV2Orders` | POST | `v2/orders` |  |
| `traderPrivatePostV2Watchlists` | POST | `v2/watchlists` |  |
| `traderPrivatePostV2WatchlistsWatchlistId` | POST | `v2/watchlists/{watchlist_id}` |  |
| `traderPrivatePostV2WatchlistsByName` | POST | `v2/watchlists:by_name` |  |
| `traderPrivatePostV2WalletsTransfers` | POST | `v2/wallets/transfers` |  |
| `traderPrivatePutV2OrdersOrderId` | PUT | `v2/orders/{order_id}` |  |
| `traderPrivatePutV2WatchlistsWatchlistId` | PUT | `v2/watchlists/{watchlist_id}` |  |
| `traderPrivatePutV2WatchlistsByName` | PUT | `v2/watchlists:by_name` |  |
| `traderPrivatePatchV2OrdersOrderId` | PATCH | `v2/orders/{order_id}` |  |
| `traderPrivatePatchV2AccountConfigurations` | PATCH | `v2/account/configurations` |  |
| `traderPrivateDeleteV2Orders` | DELETE | `v2/orders` |  |
| `traderPrivateDeleteV2OrdersOrderId` | DELETE | `v2/orders/{order_id}` |  |
| `traderPrivateDeleteV2Positions` | DELETE | `v2/positions` |  |
| `traderPrivateDeleteV2PositionsSymbolOrAssetId` | DELETE | `v2/positions/{symbol_or_asset_id}` |  |
| `traderPrivateDeleteV2WatchlistsWatchlistId` | DELETE | `v2/watchlists/{watchlist_id}` |  |
| `traderPrivateDeleteV2WatchlistsByName` | DELETE | `v2/watchlists:by_name` |  |
| `traderPrivateDeleteV2WatchlistsWatchlistIdSymbol` | DELETE | `v2/watchlists/{watchlist_id}/{symbol}` |  |

## market

**Base URL**: `https://data.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `marketPublicGetV1beta3CryptoLocBars` | GET | `v1beta3/crypto/{loc}/bars` |  |
| `marketPublicGetV1beta3CryptoLocLatestBars` | GET | `v1beta3/crypto/{loc}/latest/bars` |  |
| `marketPublicGetV1beta3CryptoLocLatestOrderbooks` | GET | `v1beta3/crypto/{loc}/latest/orderbooks` |  |
| `marketPublicGetV1beta3CryptoLocLatestQuotes` | GET | `v1beta3/crypto/{loc}/latest/quotes` |  |
| `marketPublicGetV1beta3CryptoLocLatestTrades` | GET | `v1beta3/crypto/{loc}/latest/trades` |  |
| `marketPublicGetV1beta3CryptoLocQuotes` | GET | `v1beta3/crypto/{loc}/quotes` |  |
| `marketPublicGetV1beta3CryptoLocSnapshots` | GET | `v1beta3/crypto/{loc}/snapshots` |  |
| `marketPublicGetV1beta3CryptoLocTrades` | GET | `v1beta3/crypto/{loc}/trades` |  |
| `marketPrivateGetV1beta1CorporateActions` | GET | `v1beta1/corporate-actions` |  |
| `marketPrivateGetV1beta1ForexLatestRates` | GET | `v1beta1/forex/latest/rates` |  |
| `marketPrivateGetV1beta1ForexRates` | GET | `v1beta1/forex/rates` |  |
| `marketPrivateGetV1beta1LogosSymbol` | GET | `v1beta1/logos/{symbol}` |  |
| `marketPrivateGetV1beta1News` | GET | `v1beta1/news` |  |
| `marketPrivateGetV1beta1ScreenerStocksMostActives` | GET | `v1beta1/screener/stocks/most-actives` |  |
| `marketPrivateGetV1beta1ScreenerMarketTypeMovers` | GET | `v1beta1/screener/{market_type}/movers` |  |
| `marketPrivateGetV2StocksAuctions` | GET | `v2/stocks/auctions` |  |
| `marketPrivateGetV2StocksBars` | GET | `v2/stocks/bars` |  |
| `marketPrivateGetV2StocksBarsLatest` | GET | `v2/stocks/bars/latest` |  |
| `marketPrivateGetV2StocksMetaConditionsTicktype` | GET | `v2/stocks/meta/conditions/{ticktype}` |  |
| `marketPrivateGetV2StocksMetaExchanges` | GET | `v2/stocks/meta/exchanges` |  |
| `marketPrivateGetV2StocksQuotes` | GET | `v2/stocks/quotes` |  |
| `marketPrivateGetV2StocksQuotesLatest` | GET | `v2/stocks/quotes/latest` |  |
| `marketPrivateGetV2StocksSnapshots` | GET | `v2/stocks/snapshots` |  |
| `marketPrivateGetV2StocksTrades` | GET | `v2/stocks/trades` |  |
| `marketPrivateGetV2StocksTradesLatest` | GET | `v2/stocks/trades/latest` |  |
| `marketPrivateGetV2StocksSymbolAuctions` | GET | `v2/stocks/{symbol}/auctions` |  |
| `marketPrivateGetV2StocksSymbolBars` | GET | `v2/stocks/{symbol}/bars` |  |
| `marketPrivateGetV2StocksSymbolBarsLatest` | GET | `v2/stocks/{symbol}/bars/latest` |  |
| `marketPrivateGetV2StocksSymbolQuotes` | GET | `v2/stocks/{symbol}/quotes` |  |
| `marketPrivateGetV2StocksSymbolQuotesLatest` | GET | `v2/stocks/{symbol}/quotes/latest` |  |
| `marketPrivateGetV2StocksSymbolSnapshot` | GET | `v2/stocks/{symbol}/snapshot` |  |
| `marketPrivateGetV2StocksSymbolTrades` | GET | `v2/stocks/{symbol}/trades` |  |
| `marketPrivateGetV2StocksSymbolTradesLatest` | GET | `v2/stocks/{symbol}/trades/latest` |  |

