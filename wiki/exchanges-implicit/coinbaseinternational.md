Every endpoint in `coinbaseinternational`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/coinbaseinternational) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `v1PublicGetAssets`); the snake_case alias (`v1_public_get_assets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`V1PublicGetAssets`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const coinbaseinternational = new ccxt.coinbaseinternational ();
const response = await coinbaseinternational.v1PublicGetAssets (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const coinbaseinternational = new ccxt.coinbaseinternational ();
const response = await coinbaseinternational.v1PublicGetAssets (params);
```

#### **Python**

```python
import ccxt
coinbaseinternational = ccxt.coinbaseinternational()
response = coinbaseinternational.v1_public_get_assets(params)
```

#### **PHP**

```php
$coinbaseinternational = new \ccxt\coinbaseinternational();
$response = $coinbaseinternational->v1_public_get_assets($params);
```

#### **C#**

```csharp
using ccxt;
var coinbaseinternational = new Coinbaseinternational();
var response = await coinbaseinternational.v1PublicGetAssets(parameters);
```

#### **Go**

```go
coinbaseinternational := ccxt.NewCoinbaseinternational(nil)
response := <-coinbaseinternational.V1PublicGetAssets(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official coinbaseinternational API documentation:** [docs.cloud.coinbase.com](https://docs.cloud.coinbase.com/intx/docs)

> 35 implicit endpoints across 1 access group.

## v1

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v1PublicGetAssets` | GET | `assets` |  |
| `v1PublicGetAssetsAssets` | GET | `assets/{assets}` |  |
| `v1PublicGetAssetsAssetNetworks` | GET | `assets/{asset}/networks` |  |
| `v1PublicGetInstruments` | GET | `instruments` |  |
| `v1PublicGetInstrumentsInstrument` | GET | `instruments/{instrument}` |  |
| `v1PublicGetInstrumentsInstrumentQuote` | GET | `instruments/{instrument}/quote` |  |
| `v1PublicGetInstrumentsInstrumentFunding` | GET | `instruments/{instrument}/funding` |  |
| `v1PublicGetInstrumentsInstrumentCandles` | GET | `instruments/{instrument}/candles` |  |
| `v1PrivateGetOrders` | GET | `orders` |  |
| `v1PrivateGetOrdersId` | GET | `orders/{id}` |  |
| `v1PrivateGetPortfolios` | GET | `portfolios` |  |
| `v1PrivateGetPortfoliosPortfolio` | GET | `portfolios/{portfolio}` |  |
| `v1PrivateGetPortfoliosPortfolioDetail` | GET | `portfolios/{portfolio}/detail` |  |
| `v1PrivateGetPortfoliosPortfolioSummary` | GET | `portfolios/{portfolio}/summary` |  |
| `v1PrivateGetPortfoliosPortfolioBalances` | GET | `portfolios/{portfolio}/balances` |  |
| `v1PrivateGetPortfoliosPortfolioBalancesAsset` | GET | `portfolios/{portfolio}/balances/{asset}` |  |
| `v1PrivateGetPortfoliosPortfolioPositions` | GET | `portfolios/{portfolio}/positions` |  |
| `v1PrivateGetPortfoliosPortfolioPositionsInstrument` | GET | `portfolios/{portfolio}/positions/{instrument}` |  |
| `v1PrivateGetPortfoliosFills` | GET | `portfolios/fills` |  |
| `v1PrivateGetPortfoliosPortfolioFills` | GET | `portfolios/{portfolio}/fills` |  |
| `v1PrivateGetTransfers` | GET | `transfers` |  |
| `v1PrivateGetTransfersTransferUuid` | GET | `transfers/{transfer_uuid}` |  |
| `v1PrivatePostOrders` | POST | `orders` |  |
| `v1PrivatePostPortfolios` | POST | `portfolios` |  |
| `v1PrivatePostPortfoliosMargin` | POST | `portfolios/margin` |  |
| `v1PrivatePostPortfoliosTransfer` | POST | `portfolios/transfer` |  |
| `v1PrivatePostTransfersWithdraw` | POST | `transfers/withdraw` |  |
| `v1PrivatePostTransfersAddress` | POST | `transfers/address` |  |
| `v1PrivatePostTransfersCreateCounterpartyId` | POST | `transfers/create-counterparty-id` |  |
| `v1PrivatePostTransfersValidateCounterpartyId` | POST | `transfers/validate-counterparty-id` |  |
| `v1PrivatePostTransfersWithdrawCounterparty` | POST | `transfers/withdraw/counterparty` |  |
| `v1PrivatePutOrdersId` | PUT | `orders/{id}` |  |
| `v1PrivatePutPortfoliosPortfolio` | PUT | `portfolios/{portfolio}` |  |
| `v1PrivateDeleteOrders` | DELETE | `orders` |  |
| `v1PrivateDeleteOrdersId` | DELETE | `orders/{id}` |  |

