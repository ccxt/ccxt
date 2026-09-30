Every endpoint in `alpaca`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/alpaca) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `brokerPrivateGetV1AccountsAccountIdTokenizationRequests`); the snake_case alias (`broker_private_get_v1_accounts_account_id_tokenization_requests`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`BrokerPrivateGetV1AccountsAccountIdTokenizationRequests`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const alpaca = new ccxt.alpaca ();
const response = await alpaca.brokerPrivateGetV1AccountsAccountIdTokenizationRequests (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const alpaca = new ccxt.alpaca ();
const response = await alpaca.brokerPrivateGetV1AccountsAccountIdTokenizationRequests (params);
```

#### **Python**

```python
import ccxt
alpaca = ccxt.alpaca()
response = alpaca.broker_private_get_v1_accounts_account_id_tokenization_requests(params)
```

#### **PHP**

```php
$alpaca = new \ccxt\alpaca();
$response = $alpaca->broker_private_get_v1_accounts_account_id_tokenization_requests($params);
```

#### **C#**

```csharp
using ccxt;
var alpaca = new Alpaca();
var response = await alpaca.brokerPrivateGetV1AccountsAccountIdTokenizationRequests(parameters);
```

#### **Go**

```go
alpaca := ccxt.NewAlpaca(nil)
response := <-alpaca.BrokerPrivateGetV1AccountsAccountIdTokenizationRequests(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official alpaca API documentation:** [alpaca.markets](https://alpaca.markets/docs/)

> 96 implicit endpoints across 3 access groups.

## broker

**Base URL**: `https://broker-api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `brokerPrivateGetV1AccountsAccountIdTokenizationRequests` | GET | `v1/accounts/{account_id}/tokenization/requests` | 1 |
| `brokerPrivateGetV1AccountsAccountIdTokenizationRequestsTokenizationRequestId` | GET | `v1/accounts/{account_id}/tokenization/requests/{tokenization_request_id}` | 1 |
| `brokerPrivateGetV1AccountsAccountIdTokenizationRequestsByClientRequestId` | GET | `v1/accounts/{account_id}/tokenization/requests:by_client_request_id` | 1 |
| `brokerPrivateGetV1AccountsAccountIdTokenizationRequestsByIssuerRequestId` | GET | `v1/accounts/{account_id}/tokenization/requests:by_issuer_request_id` | 1 |
| `brokerPrivateGetV1FpslAnalyticsAccountIdLoans` | GET | `v1/fpsl/analytics/{account_id}/loans` | 1 |
| `brokerPrivateGetV1Ipos` | GET | `v1/ipos` | 1 |
| `brokerPrivateGetV1IposOfferingReference` | GET | `v1/ipos/{offering_reference}` | 1 |
| `brokerPrivateGetV1WalletsTravelRuleVasps` | GET | `v1/wallets/travel-rule/vasps` | 1 |
| `brokerPrivateGetV1beta1Acats` | GET | `v1beta1/acats` | 1 |
| `brokerPrivateGetV1beta1AcatsContrabrokers` | GET | `v1beta1/acats/contrabrokers` | 1 |
| `brokerPrivateGetV1beta1AcatsAccountId` | GET | `v1beta1/acats/{account_id}` | 1 |
| `brokerPrivateGetV1beta1AcatsAccountIdAcatsId` | GET | `v1beta1/acats/{account_id}/{acats_id}` | 1 |
| `brokerPrivateGetV1beta1AcatsAccountIdAcatsIdAssets` | GET | `v1beta1/acats/{account_id}/{acats_id}/assets` | 1 |
| `brokerPrivatePostV1beta1AcatsAccountId` | POST | `v1beta1/acats/{account_id}` | 1 |
| `brokerPrivatePatchV1AccountsAccountIdWalletsWhitelistsWhitelistedAddressIdTravelRuleInfo` | PATCH | `v1/accounts/{account_id}/wallets/whitelists/{whitelisted_address_id}/travel-rule-info` | 1 |

## trader

**Base URL**: `https://api.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `traderPrivateGetV2Account` | GET | `v2/account` | 1 |
| `traderPrivateGetV2Orders` | GET | `v2/orders` | 1 |
| `traderPrivateGetV2OrdersOrderId` | GET | `v2/orders/{order_id}` | 1 |
| `traderPrivateGetV2Positions` | GET | `v2/positions` | 1 |
| `traderPrivateGetV2PositionsSymbolOrAssetId` | GET | `v2/positions/{symbol_or_asset_id}` | 1 |
| `traderPrivateGetV2AccountPortfolioHistory` | GET | `v2/account/portfolio/history` | 1 |
| `traderPrivateGetV2Watchlists` | GET | `v2/watchlists` | 1 |
| `traderPrivateGetV2WatchlistsWatchlistId` | GET | `v2/watchlists/{watchlist_id}` | 1 |
| `traderPrivateGetV2WatchlistsByName` | GET | `v2/watchlists:by_name` | 1 |
| `traderPrivateGetV2AccountConfigurations` | GET | `v2/account/configurations` | 1 |
| `traderPrivateGetV2AccountActivities` | GET | `v2/account/activities` | 1 |
| `traderPrivateGetV2AccountActivitiesActivityType` | GET | `v2/account/activities/{activity_type}` | 1 |
| `traderPrivateGetV2Calendar` | GET | `v2/calendar` | 1 |
| `traderPrivateGetV2Clock` | GET | `v2/clock` | 1 |
| `traderPrivateGetV2Assets` | GET | `v2/assets` | 1 |
| `traderPrivateGetV2AssetsSymbolOrAssetId` | GET | `v2/assets/{symbol_or_asset_id}` | 1 |
| `traderPrivateGetV2CorporateActionsAnnouncementsId` | GET | `v2/corporate_actions/announcements/{id}` | 1 |
| `traderPrivateGetV2CorporateActionsAnnouncements` | GET | `v2/corporate_actions/announcements` | 1 |
| `traderPrivateGetV2Wallets` | GET | `v2/wallets` | 1 |
| `traderPrivateGetV2WalletsTransfers` | GET | `v2/wallets/transfers` | 1 |
| `traderPrivateGetV1Locates` | GET | `v1/locates` | 1 |
| `traderPrivateGetV1LocatesLocateId` | GET | `v1/locates/{locate_id}` | 1 |
| `traderPrivateGetV1LocatesQuotes` | GET | `v1/locates/quotes` | 1 |
| `traderPrivateGetV2TokenizationRequests` | GET | `v2/tokenization/requests` | 1 |
| `traderPrivateGetV2TokenizationRequestsTokenizationRequestId` | GET | `v2/tokenization/requests/{tokenization_request_id}` | 1 |
| `traderPrivateGetV2TokenizationRequestsByClientRequestId` | GET | `v2/tokenization/requests:by_client_request_id` | 1 |
| `traderPrivateGetV2WalletsTravelRuleVasps` | GET | `v2/wallets/travel-rule/vasps` | 1 |
| `traderPrivatePostV2Orders` | POST | `v2/orders` | 1 |
| `traderPrivatePostV2Watchlists` | POST | `v2/watchlists` | 1 |
| `traderPrivatePostV2WatchlistsWatchlistId` | POST | `v2/watchlists/{watchlist_id}` | 1 |
| `traderPrivatePostV2WatchlistsByName` | POST | `v2/watchlists:by_name` | 1 |
| `traderPrivatePostV2WalletsTransfers` | POST | `v2/wallets/transfers` | 1 |
| `traderPrivatePostV1Locates` | POST | `v1/locates` | 1 |
| `traderPrivatePutV2OrdersOrderId` | PUT | `v2/orders/{order_id}` | 1 |
| `traderPrivatePutV2WatchlistsWatchlistId` | PUT | `v2/watchlists/{watchlist_id}` | 1 |
| `traderPrivatePutV2WatchlistsByName` | PUT | `v2/watchlists:by_name` | 1 |
| `traderPrivatePatchV2OrdersOrderId` | PATCH | `v2/orders/{order_id}` | 1 |
| `traderPrivatePatchV2AccountConfigurations` | PATCH | `v2/account/configurations` | 1 |
| `traderPrivatePatchV2WalletsWhitelistsWhitelistedAddressIdTravelRuleInfo` | PATCH | `v2/wallets/whitelists/{whitelisted_address_id}/travel-rule-info` | 1 |
| `traderPrivateDeleteV2Orders` | DELETE | `v2/orders` | 1 |
| `traderPrivateDeleteV2OrdersOrderId` | DELETE | `v2/orders/{order_id}` | 1 |
| `traderPrivateDeleteV2Positions` | DELETE | `v2/positions` | 1 |
| `traderPrivateDeleteV2PositionsSymbolOrAssetId` | DELETE | `v2/positions/{symbol_or_asset_id}` | 1 |
| `traderPrivateDeleteV2WatchlistsWatchlistId` | DELETE | `v2/watchlists/{watchlist_id}` | 1 |
| `traderPrivateDeleteV2WatchlistsByName` | DELETE | `v2/watchlists:by_name` | 1 |
| `traderPrivateDeleteV2WatchlistsWatchlistIdSymbol` | DELETE | `v2/watchlists/{watchlist_id}/{symbol}` | 1 |

## market

**Base URL**: `https://data.{hostname}`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `marketPublicGetV1beta3CryptoLocBars` | GET | `v1beta3/crypto/{loc}/bars` | 1 |
| `marketPublicGetV1beta3CryptoLocLatestBars` | GET | `v1beta3/crypto/{loc}/latest/bars` | 1 |
| `marketPublicGetV1beta3CryptoLocLatestOrderbooks` | GET | `v1beta3/crypto/{loc}/latest/orderbooks` | 1 |
| `marketPublicGetV1beta3CryptoLocLatestQuotes` | GET | `v1beta3/crypto/{loc}/latest/quotes` | 1 |
| `marketPublicGetV1beta3CryptoLocLatestTrades` | GET | `v1beta3/crypto/{loc}/latest/trades` | 1 |
| `marketPublicGetV1beta3CryptoLocQuotes` | GET | `v1beta3/crypto/{loc}/quotes` | 1 |
| `marketPublicGetV1beta3CryptoLocSnapshots` | GET | `v1beta3/crypto/{loc}/snapshots` | 1 |
| `marketPublicGetV1beta3CryptoLocTrades` | GET | `v1beta3/crypto/{loc}/trades` | 1 |
| `marketPrivateGetV1beta1CorporateActions` | GET | `v1beta1/corporate-actions` | 1 |
| `marketPrivateGetV1beta1FixedIncomeLatestPrices` | GET | `v1beta1/fixed_income/latest/prices` | 1 |
| `marketPrivateGetV1beta1FixedIncomeLatestQuotes` | GET | `v1beta1/fixed_income/latest/quotes` | 1 |
| `marketPrivateGetV1beta1ForexLatestRates` | GET | `v1beta1/forex/latest/rates` | 1 |
| `marketPrivateGetV1beta1ForexRates` | GET | `v1beta1/forex/rates` | 1 |
| `marketPrivateGetV1beta1LogosSymbol` | GET | `v1beta1/logos/{symbol}` | 1 |
| `marketPrivateGetV1beta1News` | GET | `v1beta1/news` | 1 |
| `marketPrivateGetV1beta1ScreenerStocksMostActives` | GET | `v1beta1/screener/stocks/most-actives` | 1 |
| `marketPrivateGetV1beta1ScreenerMarketTypeMovers` | GET | `v1beta1/screener/{market_type}/movers` | 1 |
| `marketPrivateGetV2StocksAuctions` | GET | `v2/stocks/auctions` | 1 |
| `marketPrivateGetV2StocksBars` | GET | `v2/stocks/bars` | 1 |
| `marketPrivateGetV2StocksBarsLatest` | GET | `v2/stocks/bars/latest` | 1 |
| `marketPrivateGetV2StocksMetaConditionsTicktype` | GET | `v2/stocks/meta/conditions/{ticktype}` | 1 |
| `marketPrivateGetV2StocksMetaExchanges` | GET | `v2/stocks/meta/exchanges` | 1 |
| `marketPrivateGetV2StocksQuotes` | GET | `v2/stocks/quotes` | 1 |
| `marketPrivateGetV2StocksQuotesLatest` | GET | `v2/stocks/quotes/latest` | 1 |
| `marketPrivateGetV2StocksSnapshots` | GET | `v2/stocks/snapshots` | 1 |
| `marketPrivateGetV2StocksTrades` | GET | `v2/stocks/trades` | 1 |
| `marketPrivateGetV2StocksTradesLatest` | GET | `v2/stocks/trades/latest` | 1 |
| `marketPrivateGetV2StocksSymbolAuctions` | GET | `v2/stocks/{symbol}/auctions` | 1 |
| `marketPrivateGetV2StocksSymbolBars` | GET | `v2/stocks/{symbol}/bars` | 1 |
| `marketPrivateGetV2StocksSymbolBarsLatest` | GET | `v2/stocks/{symbol}/bars/latest` | 1 |
| `marketPrivateGetV2StocksSymbolQuotes` | GET | `v2/stocks/{symbol}/quotes` | 1 |
| `marketPrivateGetV2StocksSymbolQuotesLatest` | GET | `v2/stocks/{symbol}/quotes/latest` | 1 |
| `marketPrivateGetV2StocksSymbolSnapshot` | GET | `v2/stocks/{symbol}/snapshot` | 1 |
| `marketPrivateGetV2StocksSymbolTrades` | GET | `v2/stocks/{symbol}/trades` | 1 |
| `marketPrivateGetV2StocksSymbolTradesLatest` | GET | `v2/stocks/{symbol}/trades/latest` | 1 |

