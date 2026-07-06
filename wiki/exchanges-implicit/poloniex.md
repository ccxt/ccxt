Every endpoint in `poloniex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/poloniex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetMarkets`); the snake_case alias (`public_get_markets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetMarkets`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const poloniex = new ccxt.poloniex ();
const response = await poloniex.publicGetMarkets (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const poloniex = new ccxt.poloniex ();
const response = await poloniex.publicGetMarkets (params);
```

#### **Python**

```python
import ccxt
poloniex = ccxt.poloniex()
response = poloniex.public_get_markets(params)
```

#### **PHP**

```php
$poloniex = new \ccxt\poloniex();
$response = $poloniex->public_get_markets($params);
```

#### **C#**

```csharp
using ccxt;
var poloniex = new Poloniex();
var response = await poloniex.publicGetMarkets(parameters);
```

#### **Go**

```go
poloniex := ccxt.NewPoloniex(nil)
response := <-poloniex.PublicGetMarkets(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official poloniex API documentation:** [api-docs.poloniex.com](https://api-docs.poloniex.com/spot/)

> 101 implicit endpoints across 4 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetMarkets` | GET | `markets` | 20 |
| `publicGetMarketsSymbol` | GET | `markets/{symbol}` | 1 |
| `publicGetCurrencies` | GET | `currencies` | 20 |
| `publicGetCurrenciesCurrency` | GET | `currencies/{currency}` | 20 |
| `publicGetV2Currencies` | GET | `v2/currencies` | 20 |
| `publicGetV2CurrenciesCurrency` | GET | `v2/currencies/{currency}` | 20 |
| `publicGetTimestamp` | GET | `timestamp` | 1 |
| `publicGetMarketsPrice` | GET | `markets/price` | 1 |
| `publicGetMarketsSymbolPrice` | GET | `markets/{symbol}/price` | 1 |
| `publicGetMarketsMarkPrice` | GET | `markets/markPrice` | 1 |
| `publicGetMarketsSymbolMarkPrice` | GET | `markets/{symbol}/markPrice` | 1 |
| `publicGetMarketsSymbolMarkPriceComponents` | GET | `markets/{symbol}/markPriceComponents` | 1 |
| `publicGetMarketsSymbolOrderBook` | GET | `markets/{symbol}/orderBook` | 1 |
| `publicGetMarketsSymbolCandles` | GET | `markets/{symbol}/candles` | 1 |
| `publicGetMarketsSymbolTrades` | GET | `markets/{symbol}/trades` | 20 |
| `publicGetMarketsTicker24h` | GET | `markets/ticker24h` | 20 |
| `publicGetMarketsSymbolTicker24h` | GET | `markets/{symbol}/ticker24h` | 20 |
| `publicGetMarketsCollateralInfo` | GET | `markets/collateralInfo` | 1 |
| `publicGetMarketsCurrencyCollateralInfo` | GET | `markets/{currency}/collateralInfo` | 1 |
| `publicGetMarketsBorrowRatesInfo` | GET | `markets/borrowRatesInfo` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccounts` | GET | `accounts` | 4 |
| `privateGetAccountsBalances` | GET | `accounts/balances` | 4 |
| `privateGetAccountsIdBalances` | GET | `accounts/{id}/balances` | 4 |
| `privateGetAccountsActivity` | GET | `accounts/activity` | 20 |
| `privateGetAccountsTransfer` | GET | `accounts/transfer` | 20 |
| `privateGetAccountsTransferId` | GET | `accounts/transfer/{id}` | 4 |
| `privateGetFeeinfo` | GET | `feeinfo` | 20 |
| `privateGetAccountsInterestHistory` | GET | `accounts/interest/history` | 1 |
| `privateGetSubaccounts` | GET | `subaccounts` | 4 |
| `privateGetSubaccountsBalances` | GET | `subaccounts/balances` | 20 |
| `privateGetSubaccountsIdBalances` | GET | `subaccounts/{id}/balances` | 4 |
| `privateGetSubaccountsTransfer` | GET | `subaccounts/transfer` | 20 |
| `privateGetSubaccountsTransferId` | GET | `subaccounts/transfer/{id}` | 4 |
| `privateGetWalletsAddresses` | GET | `wallets/addresses` | 20 |
| `privateGetWalletsAddressesCurrency` | GET | `wallets/addresses/{currency}` | 20 |
| `privateGetWalletsActivity` | GET | `wallets/activity` | 20 |
| `privateGetMarginAccountMargin` | GET | `margin/accountMargin` | 4 |
| `privateGetMarginBorrowStatus` | GET | `margin/borrowStatus` | 4 |
| `privateGetMarginMaxSize` | GET | `margin/maxSize` | 4 |
| `privateGetOrders` | GET | `orders` | 20 |
| `privateGetOrdersId` | GET | `orders/{id}` | 4 |
| `privateGetOrdersKillSwitchStatus` | GET | `orders/killSwitchStatus` | 4 |
| `privateGetSmartorders` | GET | `smartorders` | 20 |
| `privateGetSmartordersId` | GET | `smartorders/{id}` | 4 |
| `privateGetOrdersHistory` | GET | `orders/history` | 20 |
| `privateGetSmartordersHistory` | GET | `smartorders/history` | 20 |
| `privateGetTrades` | GET | `trades` | 20 |
| `privateGetOrdersIdTrades` | GET | `orders/{id}/trades` | 4 |
| `privatePostAccountsTransfer` | POST | `accounts/transfer` | 4 |
| `privatePostSubaccountsTransfer` | POST | `subaccounts/transfer` | 20 |
| `privatePostWalletsAddress` | POST | `wallets/address` | 20 |
| `privatePostWalletsWithdraw` | POST | `wallets/withdraw` | 20 |
| `privatePostV2WalletsWithdraw` | POST | `v2/wallets/withdraw` | 20 |
| `privatePostOrders` | POST | `orders` | 4 |
| `privatePostOrdersBatch` | POST | `orders/batch` | 20 |
| `privatePostOrdersKillSwitch` | POST | `orders/killSwitch` | 4 |
| `privatePostSmartorders` | POST | `smartorders` | 4 |
| `privateDeleteOrdersId` | DELETE | `orders/{id}` | 4 |
| `privateDeleteOrdersCancelByIds` | DELETE | `orders/cancelByIds` | 20 |
| `privateDeleteOrders` | DELETE | `orders` | 20 |
| `privateDeleteSmartordersId` | DELETE | `smartorders/{id}` | 4 |
| `privateDeleteSmartordersCancelByIds` | DELETE | `smartorders/cancelByIds` | 20 |
| `privateDeleteSmartorders` | DELETE | `smartorders` | 20 |
| `privatePutOrdersId` | PUT | `orders/{id}` | 20 |
| `privatePutSmartordersId` | PUT | `smartorders/{id}` | 20 |

## swapPublic

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `swapPublicGetV3MarketAllInstruments` | GET | `v3/market/allInstruments` | 0.6666666666666666 |
| `swapPublicGetV3MarketInstruments` | GET | `v3/market/instruments` | 0.6666666666666666 |
| `swapPublicGetV3MarketOrderBook` | GET | `v3/market/orderBook` | 0.6666666666666666 |
| `swapPublicGetV3MarketCandles` | GET | `v3/market/candles` | 10 |
| `swapPublicGetV3MarketIndexPriceCandlesticks` | GET | `v3/market/indexPriceCandlesticks` | 10 |
| `swapPublicGetV3MarketPremiumIndexCandlesticks` | GET | `v3/market/premiumIndexCandlesticks` | 10 |
| `swapPublicGetV3MarketMarkPriceCandlesticks` | GET | `v3/market/markPriceCandlesticks` | 10 |
| `swapPublicGetV3MarketTrades` | GET | `v3/market/trades` | 0.6666666666666666 |
| `swapPublicGetV3MarketLiquidationOrder` | GET | `v3/market/liquidationOrder` | 0.6666666666666666 |
| `swapPublicGetV3MarketTickers` | GET | `v3/market/tickers` | 0.6666666666666666 |
| `swapPublicGetV3MarketMarkPrice` | GET | `v3/market/markPrice` | 0.6666666666666666 |
| `swapPublicGetV3MarketIndexPrice` | GET | `v3/market/indexPrice` | 0.6666666666666666 |
| `swapPublicGetV3MarketIndexPriceComponents` | GET | `v3/market/indexPriceComponents` | 0.6666666666666666 |
| `swapPublicGetV3MarketFundingRate` | GET | `v3/market/fundingRate` | 0.6666666666666666 |
| `swapPublicGetV3MarketOpenInterest` | GET | `v3/market/openInterest` | 0.6666666666666666 |
| `swapPublicGetV3MarketInsurance` | GET | `v3/market/insurance` | 0.6666666666666666 |
| `swapPublicGetV3MarketRiskLimit` | GET | `v3/market/riskLimit` | 0.6666666666666666 |

## swapPrivate

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `swapPrivateGetV3AccountBalance` | GET | `v3/account/balance` | 4 |
| `swapPrivateGetV3AccountBills` | GET | `v3/account/bills` | 20 |
| `swapPrivateGetV3TradeOrderOpens` | GET | `v3/trade/order/opens` | 20 |
| `swapPrivateGetV3TradeOrderTrades` | GET | `v3/trade/order/trades` | 20 |
| `swapPrivateGetV3TradeOrderHistory` | GET | `v3/trade/order/history` | 20 |
| `swapPrivateGetV3TradePositionOpens` | GET | `v3/trade/position/opens` | 20 |
| `swapPrivateGetV3TradePositionHistory` | GET | `v3/trade/position/history` | 20 |
| `swapPrivateGetV3PositionLeverages` | GET | `v3/position/leverages` | 20 |
| `swapPrivateGetV3PositionMode` | GET | `v3/position/mode` | 20 |
| `swapPrivatePostV3TradeOrder` | POST | `v3/trade/order` | 4 |
| `swapPrivatePostV3TradeOrders` | POST | `v3/trade/orders` | 40 |
| `swapPrivatePostV3TradePosition` | POST | `v3/trade/position` | 20 |
| `swapPrivatePostV3TradePositionAll` | POST | `v3/trade/positionAll` | 100 |
| `swapPrivatePostV3PositionLeverage` | POST | `v3/position/leverage` | 20 |
| `swapPrivatePostV3PositionMode` | POST | `v3/position/mode` | 20 |
| `swapPrivatePostV3TradePositionMargin` | POST | `v3/trade/position/margin` | 20 |
| `swapPrivateDeleteV3TradeOrder` | DELETE | `v3/trade/order` | 2 |
| `swapPrivateDeleteV3TradeBatchOrders` | DELETE | `v3/trade/batchOrders` | 20 |
| `swapPrivateDeleteV3TradeAllOrders` | DELETE | `v3/trade/allOrders` | 20 |

