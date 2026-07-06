Every endpoint in `bullish`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bullish) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetV1Nonce`); the snake_case alias (`public_get_v1_nonce`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetV1Nonce`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bullish = new ccxt.bullish ();
const response = await bullish.publicGetV1Nonce (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bullish = new ccxt.bullish ();
const response = await bullish.publicGetV1Nonce (params);
```

#### **Python**

```python
import ccxt
bullish = ccxt.bullish()
response = bullish.public_get_v1_nonce(params)
```

#### **PHP**

```php
$bullish = new \ccxt\bullish();
$response = $bullish->public_get_v1_nonce($params);
```

#### **C#**

```csharp
using ccxt;
var bullish = new Bullish();
var response = await bullish.publicGetV1Nonce(parameters);
```

#### **Go**

```go
bullish := ccxt.NewBullish(nil)
response := <-bullish.PublicGetV1Nonce(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bullish API documentation:** [api.exchange.bullish.com](https://api.exchange.bullish.com/docs/api/rest/)

> 58 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.exchange.bullish.com/trading-api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetV1Nonce` | GET | `v1/nonce` | 1 |
| `publicGetV1Time` | GET | `v1/time` | 1 |
| `publicGetV1Assets` | GET | `v1/assets` | 1 |
| `publicGetV1AssetsSymbol` | GET | `v1/assets/{symbol}` | 1 |
| `publicGetV1Markets` | GET | `v1/markets` | 1 |
| `publicGetV1MarketsSymbol` | GET | `v1/markets/{symbol}` | 1 |
| `publicGetV1HistoryMarketsSymbol` | GET | `v1/history/markets/{symbol}` | 1 |
| `publicGetV1MarketsSymbolOrderbookHybrid` | GET | `v1/markets/{symbol}/orderbook/hybrid` | 1 |
| `publicGetV1MarketsSymbolTrades` | GET | `v1/markets/{symbol}/trades` | 1 |
| `publicGetV1MarketsSymbolTick` | GET | `v1/markets/{symbol}/tick` | 1 |
| `publicGetV1MarketsSymbolCandle` | GET | `v1/markets/{symbol}/candle` | 1 |
| `publicGetV1HistoryMarketsSymbolTrades` | GET | `v1/history/markets/{symbol}/trades` | 1 |
| `publicGetV1HistoryMarketsSymbolFundingRate` | GET | `v1/history/markets/{symbol}/funding-rate` | 1 |
| `publicGetV1IndexPrices` | GET | `v1/index-prices` | 1 |
| `publicGetV1IndexPricesAssetSymbol` | GET | `v1/index-prices/{assetSymbol}` | 1 |
| `publicGetV1ExpiryPricesSymbol` | GET | `v1/expiry-prices/{symbol}` | 1 |
| `publicGetV1OptionLadder` | GET | `v1/option-ladder` | 1 |
| `publicGetV1OptionLadderSymbol` | GET | `v1/option-ladder/{symbol}` | 1 |

## private

**Base URL**: `https://api.exchange.bullish.com/trading-api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetV2Orders` | GET | `v2/orders` | 1 |
| `privateGetV2HistoryOrders` | GET | `v2/history/orders` | 1 |
| `privateGetV2OrdersOrderId` | GET | `v2/orders/{orderId}` | 1 |
| `privateGetV2AmmInstructions` | GET | `v2/amm-instructions` | 1 |
| `privateGetV2AmmInstructionsInstructionId` | GET | `v2/amm-instructions/{instructionId}` | 1 |
| `privateGetV1WalletsTransactions` | GET | `v1/wallets/transactions` | 1 |
| `privateGetV1WalletsLimitsSymbol` | GET | `v1/wallets/limits/{symbol}` | 1 |
| `privateGetV1WalletsDepositInstructionsCryptoSymbol` | GET | `v1/wallets/deposit-instructions/crypto/{symbol}` | 1 |
| `privateGetV1WalletsWithdrawalInstructionsCryptoSymbol` | GET | `v1/wallets/withdrawal-instructions/crypto/{symbol}` | 1 |
| `privateGetV1WalletsDepositInstructionsFiatSymbol` | GET | `v1/wallets/deposit-instructions/fiat/{symbol}` | 1 |
| `privateGetV1WalletsWithdrawalInstructionsFiatSymbol` | GET | `v1/wallets/withdrawal-instructions/fiat/{symbol}` | 1 |
| `privateGetV1WalletsSelfHostedVerificationAttempts` | GET | `v1/wallets/self-hosted/verification-attempts` | 1 |
| `privateGetV1Trades` | GET | `v1/trades` | 5 |
| `privateGetV1HistoryTrades` | GET | `v1/history/trades` | 5 |
| `privateGetV1TradesTradeId` | GET | `v1/trades/{tradeId}` | 5 |
| `privateGetV1TradesClientOrderIdClientOrderId` | GET | `v1/trades/client-order-id/{clientOrderId}` | 1 |
| `privateGetV1AccountsAsset` | GET | `v1/accounts/asset` | 1 |
| `privateGetV1AccountsAssetSymbol` | GET | `v1/accounts/asset/{symbol}` | 1 |
| `privateGetV1UsersLogout` | GET | `v1/users/logout` | 1 |
| `privateGetV1UsersHmacLogin` | GET | `v1/users/hmac/login` | 1 |
| `privateGetV1AccountsTradingAccounts` | GET | `v1/accounts/trading-accounts` | 1 |
| `privateGetV1AccountsTradingAccountsTradingAccountId` | GET | `v1/accounts/trading-accounts/{tradingAccountId}` | 1 |
| `privateGetV1DerivativesPositions` | GET | `v1/derivatives-positions` | 1 |
| `privateGetV1HistoryDerivativesSettlement` | GET | `v1/history/derivatives-settlement` | 1 |
| `privateGetV1HistoryTransfer` | GET | `v1/history/transfer` | 1 |
| `privateGetV1HistoryBorrowInterest` | GET | `v1/history/borrow-interest` | 1 |
| `privateGetV2MmpConfiguration` | GET | `v2/mmp-configuration` | 1 |
| `privateGetV2OtcTrades` | GET | `v2/otc-trades` | 1 |
| `privateGetV2OtcTradesOtcTradeId` | GET | `v2/otc-trades/{otcTradeId}` | 1 |
| `privateGetV2OtcTradesUnconfirmedTrade` | GET | `v2/otc-trades/unconfirmed-trade` | 1 |
| `privatePostV2Orders` | POST | `v2/orders` | 5 |
| `privatePostV2Command` | POST | `v2/command` | 5 |
| `privatePostV2AmmInstructions` | POST | `v2/amm-instructions` | 1 |
| `privatePostV1WalletsWithdrawal` | POST | `v1/wallets/withdrawal` | 1 |
| `privatePostV2UsersLogin` | POST | `v2/users/login` | 1 |
| `privatePostV1SimulatePortfolioMargin` | POST | `v1/simulate-portfolio-margin` | 1 |
| `privatePostV1WalletsSelfHostedInitiate` | POST | `v1/wallets/self-hosted/initiate` | 1 |
| `privatePostV2MmpConfiguration` | POST | `v2/mmp-configuration` | 1 |
| `privatePostV2OtcTrades` | POST | `v2/otc-trades` | 1 |
| `privatePostV2OtcCommand` | POST | `v2/otc-command` | 1 |

