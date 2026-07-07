Every endpoint in `dydx`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/dydx) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `indexerGetAddressesAddress`); the snake_case alias (`indexer_get_addresses_address`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`IndexerGetAddressesAddress`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const dydx = new ccxt.dydx ();
const response = await dydx.indexerGetAddressesAddress (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const dydx = new ccxt.dydx ();
const response = await dydx.indexerGetAddressesAddress (params);
```

#### **Python**

```python
import ccxt
dydx = ccxt.dydx()
response = dydx.indexer_get_addresses_address(params)
```

#### **PHP**

```php
$dydx = new \ccxt\dydx();
$response = $dydx->indexer_get_addresses_address($params);
```

#### **C#**

```csharp
using ccxt;
var dydx = new Dydx();
var response = await dydx.indexerGetAddressesAddress(parameters);
```

#### **Go**

```go
dydx := ccxt.NewDydx(nil)
response := <-dydx.IndexerGetAddressesAddress(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official dydx API documentation:** [docs.dydx.xyz](https://docs.dydx.xyz)

> 54 implicit endpoints across 3 access groups.

## indexer

**Base URL**: `https://indexer.dydx.trade/v4`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `indexerGetAddressesAddress` | GET | `addresses/{address}` | 1 |
| `indexerGetAddressesAddressParentSubaccountNumberNumber` | GET | `addresses/{address}/parentSubaccountNumber/{number}` | 1 |
| `indexerGetAddressesAddressSubaccountNumberSubaccountNumber` | GET | `addresses/{address}/subaccountNumber/{subaccountNumber}` | 1 |
| `indexerGetAssetPositions` | GET | `assetPositions` | 1 |
| `indexerGetAssetPositionsParentSubaccountNumber` | GET | `assetPositions/parentSubaccountNumber` | 1 |
| `indexerGetCandlesPerpetualMarketsMarket` | GET | `candles/perpetualMarkets/{market}` | 1 |
| `indexerGetComplianceScreenAddress` | GET | `compliance/screen/{address}` | 1 |
| `indexerGetFills` | GET | `fills` | 1 |
| `indexerGetFillsParentSubaccountNumber` | GET | `fills/parentSubaccountNumber` | 1 |
| `indexerGetFundingPayments` | GET | `fundingPayments` | 1 |
| `indexerGetFundingPaymentsParentSubaccount` | GET | `fundingPayments/parentSubaccount` | 1 |
| `indexerGetHeight` | GET | `height` | 0.1 |
| `indexerGetHistoricalPnl` | GET | `historical-pnl` | 1 |
| `indexerGetHistoricalPnlParentSubaccountNumber` | GET | `historical-pnl/parentSubaccountNumber` | 1 |
| `indexerGetHistoricalBlockTradingRewardsAddress` | GET | `historicalBlockTradingRewards/{address}` | 1 |
| `indexerGetHistoricalFundingMarket` | GET | `historicalFunding/{market}` | 1 |
| `indexerGetHistoricalTradingRewardAggregationsAddress` | GET | `historicalTradingRewardAggregations/{address}` | 1 |
| `indexerGetOrderbooksPerpetualMarketMarket` | GET | `orderbooks/perpetualMarket/{market}` | 1 |
| `indexerGetOrders` | GET | `orders` | 1 |
| `indexerGetOrdersParentSubaccountNumber` | GET | `orders/parentSubaccountNumber` | 1 |
| `indexerGetOrdersOrderId` | GET | `orders/{orderId}` | 1 |
| `indexerGetPerpetualMarkets` | GET | `perpetualMarkets` | 1 |
| `indexerGetPerpetualPositions` | GET | `perpetualPositions` | 1 |
| `indexerGetPerpetualPositionsParentSubaccountNumber` | GET | `perpetualPositions/parentSubaccountNumber` | 1 |
| `indexerGetScreen` | GET | `screen` | 1 |
| `indexerGetSparklines` | GET | `sparklines` | 1 |
| `indexerGetTime` | GET | `time` | 1 |
| `indexerGetTradesPerpetualMarketMarket` | GET | `trades/perpetualMarket/{market}` | 1 |
| `indexerGetTransfers` | GET | `transfers` | 1 |
| `indexerGetTransfersBetween` | GET | `transfers/between` | 1 |
| `indexerGetTransfersParentSubaccountNumber` | GET | `transfers/parentSubaccountNumber` | 1 |
| `indexerGetVaultV1MegavaultHistoricalPnl` | GET | `vault/v1/megavault/historicalPnl` | 1 |
| `indexerGetVaultV1MegavaultPositions` | GET | `vault/v1/megavault/positions` | 1 |
| `indexerGetVaultV1VaultsHistoricalPnl` | GET | `vault/v1/vaults/historicalPnl` | 1 |
| `indexerGetPerpetualMarketSparklines` | GET | `perpetualMarketSparklines` | 1 |
| `indexerGetPerpetualMarketsTicker` | GET | `perpetualMarkets/{ticker}` | 1 |
| `indexerGetPerpetualMarketsTickerOrderbook` | GET | `perpetualMarkets/{ticker}/orderbook` | 1 |
| `indexerGetTradesPerpetualMarketTicker` | GET | `trades/perpetualMarket/{ticker}` | 1 |
| `indexerGetHistoricalFundingTicker` | GET | `historicalFunding/{ticker}` | 1 |
| `indexerGetCandlesTickerResolution` | GET | `candles/{ticker}/{resolution}` | 1 |
| `indexerGetAddressesAddressSubaccounts` | GET | `addresses/{address}/subaccounts` | 1 |
| `indexerGetAddressesAddressSubaccountNumberSubaccountNumberAssetPositions` | GET | `addresses/{address}/subaccountNumber/{subaccountNumber}/assetPositions` | 1 |
| `indexerGetAddressesAddressSubaccountNumberSubaccountNumberPerpetualPositions` | GET | `addresses/{address}/subaccountNumber/{subaccountNumber}/perpetualPositions` | 1 |
| `indexerGetAddressesAddressSubaccountNumberSubaccountNumberOrders` | GET | `addresses/{address}/subaccountNumber/{subaccountNumber}/orders` | 1 |
| `indexerGetFillsParentSubaccount` | GET | `fills/parentSubaccount` | 1 |
| `indexerGetHistoricalPnlParentSubaccount` | GET | `historical-pnl/parentSubaccount` | 1 |

## nodeRpc

**Base URL**: `https://dydx-ops-rpc.kingnodes.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `nodeRpcGetAbciInfo` | GET | `abci_info` | 1 |
| `nodeRpcGetBlock` | GET | `block` | 1 |
| `nodeRpcGetBroadcastTxAsync` | GET | `broadcast_tx_async` | 1 |
| `nodeRpcGetBroadcastTxSync` | GET | `broadcast_tx_sync` | 1 |
| `nodeRpcGetTx` | GET | `tx` | 1 |

## nodeRest

**Base URL**: `https://dydx-rest.publicnode.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `nodeRestGetCosmosAuthV1beta1AccountInfoDydxAddress` | GET | `cosmos/auth/v1beta1/account_info/{dydxAddress}` | 1 |
| `nodeRestPostCosmosTxV1beta1Encode` | POST | `cosmos/tx/v1beta1/encode` | 1 |
| `nodeRestPostCosmosTxV1beta1Simulate` | POST | `cosmos/tx/v1beta1/simulate` | 1 |

