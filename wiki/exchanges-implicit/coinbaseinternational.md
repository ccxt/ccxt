Every endpoint in `coinbaseinternational`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/coinbaseinternational) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `v1PublicGetAssets`); the snake_case alias (`v1_public_get_assets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`V1PublicGetAssets`). Switch tabs for the call in each language:

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

> 58 implicit endpoints across 1 access group.

## v1

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v1PublicGetAssets` | GET | `assets` | 1 |
| `v1PublicGetAssetsAssets` | GET | `assets/{assets}` | 1 |
| `v1PublicGetAssetsAssetNetworks` | GET | `assets/{asset}/networks` | 1 |
| `v1PublicGetInstruments` | GET | `instruments` | 1 |
| `v1PublicGetInstrumentsInstrument` | GET | `instruments/{instrument}` | 1 |
| `v1PublicGetInstrumentsInstrumentQuote` | GET | `instruments/{instrument}/quote` | 1 |
| `v1PublicGetInstrumentsInstrumentFunding` | GET | `instruments/{instrument}/funding` | 1 |
| `v1PublicGetInstrumentsInstrumentCandles` | GET | `instruments/{instrument}/candles` | 1 |
| `v1PublicGetInstrumentsVolumesDaily` | GET | `instruments/volumes/daily` | 1 |
| `v1PublicGetPositionOffsets` | GET | `position-offsets` | 1 |
| `v1PublicGetFeeRateTiers` | GET | `fee-rate-tiers` | 1 |
| `v1PrivateGetAddressBook` | GET | `address-book` | 1 |
| `v1PrivateGetOrders` | GET | `orders` | 1 |
| `v1PrivateGetOrdersId` | GET | `orders/{id}` | 1 |
| `v1PrivateGetIndexIndexComposition` | GET | `index/{index}/composition` | 1 |
| `v1PrivateGetIndexIndexCompositionHistory` | GET | `index/{index}/composition-history` | 1 |
| `v1PrivateGetIndexIndexPrice` | GET | `index/{index}/price` | 1 |
| `v1PrivateGetIndexIndexCandles` | GET | `index/{index}/candles` | 1 |
| `v1PrivateGetPortfolios` | GET | `portfolios` | 1 |
| `v1PrivateGetPortfoliosPortfolio` | GET | `portfolios/{portfolio}` | 1 |
| `v1PrivateGetPortfoliosPortfolioDetail` | GET | `portfolios/{portfolio}/detail` | 1 |
| `v1PrivateGetPortfoliosPortfolioSummary` | GET | `portfolios/{portfolio}/summary` | 1 |
| `v1PrivateGetPortfoliosPortfolioBalances` | GET | `portfolios/{portfolio}/balances` | 1 |
| `v1PrivateGetPortfoliosPortfolioBalancesAsset` | GET | `portfolios/{portfolio}/balances/{asset}` | 1 |
| `v1PrivateGetPortfoliosPortfolioPositions` | GET | `portfolios/{portfolio}/positions` | 1 |
| `v1PrivateGetPortfoliosPortfolioPositionsInstrument` | GET | `portfolios/{portfolio}/positions/{instrument}` | 1 |
| `v1PrivateGetPortfoliosPortfolioPositionLimits` | GET | `portfolios/{portfolio}/position-limits` | 1 |
| `v1PrivateGetPortfoliosPortfolioPositionLimitsPositions` | GET | `portfolios/{portfolio}/position-limits/positions` | 1 |
| `v1PrivateGetPortfoliosPortfolioPositionLimitsPositionsInstrument` | GET | `portfolios/{portfolio}/position-limits/positions/{instrument}` | 1 |
| `v1PrivateGetPortfoliosFills` | GET | `portfolios/fills` | 1 |
| `v1PrivateGetPortfoliosPortfolioFills` | GET | `portfolios/{portfolio}/fills` | 1 |
| `v1PrivateGetPortfoliosFeeRates` | GET | `portfolios/fee-rates` | 1 |
| `v1PrivateGetPortfoliosPortfolioLoans` | GET | `portfolios/{portfolio}/loans` | 1 |
| `v1PrivateGetPortfoliosPortfolioLoansAsset` | GET | `portfolios/{portfolio}/loans/{asset}` | 1 |
| `v1PrivateGetPortfoliosPortfolioLoansAssetAvailability` | GET | `portfolios/{portfolio}/loans/{asset}/availability` | 1 |
| `v1PrivateGetPortfoliosPortfolioMarginCallStatus` | GET | `portfolios/{portfolio}/margin-call-status` | 1 |
| `v1PrivateGetTransfers` | GET | `transfers` | 1 |
| `v1PrivateGetTransfersTransferUuid` | GET | `transfers/{transfer_uuid}` | 1 |
| `v1PrivateGetTransfersWithdrawPortfolioAssetCounterpartyWithdrawalLimit` | GET | `transfers/withdraw/{portfolio}/{asset}/counterparty-withdrawal-limit` | 1 |
| `v1PrivatePostOrders` | POST | `orders` | 1 |
| `v1PrivatePostPortfolios` | POST | `portfolios` | 1 |
| `v1PrivatePostPortfoliosMargin` | POST | `portfolios/margin` | 1 |
| `v1PrivatePostPortfoliosPortfolioCrossCollateralEnabled` | POST | `portfolios/{portfolio}/cross-collateral-enabled` | 1 |
| `v1PrivatePostPortfoliosPortfolioAutoMarginEnabled` | POST | `portfolios/{portfolio}/auto-margin-enabled` | 1 |
| `v1PrivatePostPortfoliosPortfolioLoansAsset` | POST | `portfolios/{portfolio}/loans/{asset}` | 1 |
| `v1PrivatePostPortfoliosPortfolioLoansAssetPreview` | POST | `portfolios/{portfolio}/loans/{asset}/preview` | 1 |
| `v1PrivatePostPortfoliosTransfer` | POST | `portfolios/transfer` | 1 |
| `v1PrivatePostPortfoliosTransferPosition` | POST | `portfolios/transfer-position` | 1 |
| `v1PrivatePostTransfersWithdraw` | POST | `transfers/withdraw` | 1 |
| `v1PrivatePostTransfersAddress` | POST | `transfers/address` | 1 |
| `v1PrivatePostTransfersCreateCounterpartyId` | POST | `transfers/create-counterparty-id` | 1 |
| `v1PrivatePostTransfersValidateCounterpartyId` | POST | `transfers/validate-counterparty-id` | 1 |
| `v1PrivatePostTransfersWithdrawCounterparty` | POST | `transfers/withdraw/counterparty` | 1 |
| `v1PrivatePutOrdersId` | PUT | `orders/{id}` | 1 |
| `v1PrivatePutPortfoliosPortfolio` | PUT | `portfolios/{portfolio}` | 1 |
| `v1PrivateDeleteOrders` | DELETE | `orders` | 1 |
| `v1PrivateDeleteOrdersId` | DELETE | `orders/{id}` | 1 |
| `v1PrivatePatchPortfoliosPortfolio` | PATCH | `portfolios/{portfolio}` | 1 |

