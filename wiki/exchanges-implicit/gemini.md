Every endpoint in `gemini`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/gemini) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `webExchangeGet`); the snake_case alias (`webExchange_get_`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`WebExchangeGet`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const gemini = new ccxt.gemini ();
const response = await gemini.webExchangeGet (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const gemini = new ccxt.gemini ();
const response = await gemini.webExchangeGet (params);
```

#### **Python**

```python
import ccxt
gemini = ccxt.gemini()
response = gemini.webExchange_get_(params)
```

#### **PHP**

```php
$gemini = new \ccxt\gemini();
$response = $gemini->webExchange_get_($params);
```

#### **C#**

```csharp
using ccxt;
var gemini = new Gemini();
var response = await gemini.webExchangeGet(parameters);
```

#### **Go**

```go
gemini := ccxt.NewGemini(nil)
response := <-gemini.WebExchangeGet(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official gemini API documentation:** [docs.gemini.com](https://docs.gemini.com/rest-api) · [docs.sandbox.gemini.com](https://docs.sandbox.gemini.com)

> 82 implicit endpoints across 4 access groups.

## webExchange

**Base URL**: `https://exchange.gemini.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `webExchangeGet` | GET | `` |  |

## web

**Base URL**: `https://docs.gemini.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `webGetRestApi` | GET | `rest-api` |  |

## public

**Base URL**: `https://api.gemini.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetV1Symbols` | GET | `v1/symbols` | 5 |
| `publicGetV1SymbolsDetailsSymbol` | GET | `v1/symbols/details/{symbol}` | 5 |
| `publicGetV1NetworkToken` | GET | `v1/network/{token}` | 5 |
| `publicGetV1StakingRates` | GET | `v1/staking/rates` | 5 |
| `publicGetV1PubtickerSymbol` | GET | `v1/pubticker/{symbol}` | 5 |
| `publicGetV1Feepromos` | GET | `v1/feepromos` | 5 |
| `publicGetV2TickerSymbol` | GET | `v2/ticker/{symbol}` | 5 |
| `publicGetV2CandlesSymbolTimeframe` | GET | `v2/candles/{symbol}/{timeframe}` | 5 |
| `publicGetV1TradesSymbol` | GET | `v1/trades/{symbol}` | 5 |
| `publicGetV1AuctionSymbol` | GET | `v1/auction/{symbol}` | 5 |
| `publicGetV1AuctionSymbolHistory` | GET | `v1/auction/{symbol}/history` | 5 |
| `publicGetV1Pricefeed` | GET | `v1/pricefeed` | 5 |
| `publicGetV1FundingamountSymbol` | GET | `v1/fundingamount/{symbol}` | 5 |
| `publicGetV1FundingamountreportRecordsXlsx` | GET | `v1/fundingamountreport/records.xlsx` | 5 |
| `publicGetV1BookSymbol` | GET | `v1/book/{symbol}` | 5 |
| `publicGetV1EarnRates` | GET | `v1/earn/rates` | 5 |
| `publicGetV2DerivativesCandlesSymbolTimeFrame` | GET | `v2/derivatives/candles/{symbol}/{time_frame}` | 5 |
| `publicGetV2FxrateSymbolTimestamp` | GET | `v2/fxrate/{symbol}/{timestamp}` | 5 |
| `publicGetV1RiskstatsSymbol` | GET | `v1/riskstats/{symbol}` | 5 |

## private

**Base URL**: `https://api.gemini.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetV1PerpetualsFundingpaymentreportRecordsXlsx` | GET | `v1/perpetuals/fundingpaymentreport/records.xlsx` | 1 |
| `privatePostV1StakingUnstake` | POST | `v1/staking/unstake` | 1 |
| `privatePostV1StakingStake` | POST | `v1/staking/stake` | 1 |
| `privatePostV1StakingRewards` | POST | `v1/staking/rewards` | 1 |
| `privatePostV1StakingHistory` | POST | `v1/staking/history` | 1 |
| `privatePostV1OrderNew` | POST | `v1/order/new` | 1 |
| `privatePostV1OrderCancel` | POST | `v1/order/cancel` | 1 |
| `privatePostV1WrapSymbol` | POST | `v1/wrap/{symbol}` | 1 |
| `privatePostV1OrderCancelSession` | POST | `v1/order/cancel/session` | 1 |
| `privatePostV1OrderCancelAll` | POST | `v1/order/cancel/all` | 1 |
| `privatePostV1OrderStatus` | POST | `v1/order/status` | 1 |
| `privatePostV1Orders` | POST | `v1/orders` | 1 |
| `privatePostV1Mytrades` | POST | `v1/mytrades` | 1 |
| `privatePostV1Notionalvolume` | POST | `v1/notionalvolume` | 1 |
| `privatePostV1Tradevolume` | POST | `v1/tradevolume` | 1 |
| `privatePostV1ClearingNew` | POST | `v1/clearing/new` | 1 |
| `privatePostV1ClearingStatus` | POST | `v1/clearing/status` | 1 |
| `privatePostV1ClearingCancel` | POST | `v1/clearing/cancel` | 1 |
| `privatePostV1ClearingConfirm` | POST | `v1/clearing/confirm` | 1 |
| `privatePostV1Balances` | POST | `v1/balances` | 1 |
| `privatePostV1BalancesStaking` | POST | `v1/balances/staking` | 1 |
| `privatePostV1NotionalbalancesCurrency` | POST | `v1/notionalbalances/{currency}` | 1 |
| `privatePostV1Transfers` | POST | `v1/transfers` | 1 |
| `privatePostV1AddressesNetwork` | POST | `v1/addresses/{network}` | 1 |
| `privatePostV1DepositNetworkNewAddress` | POST | `v1/deposit/{network}/newAddress` | 1 |
| `privatePostV1DepositCurrencyNewAddress` | POST | `v1/deposit/{currency}/newAddress` | 1 |
| `privatePostV1WithdrawCurrency` | POST | `v1/withdraw/{currency}` | 1 |
| `privatePostV1AccountTransferCurrency` | POST | `v1/account/transfer/{currency}` | 1 |
| `privatePostV1PaymentsAddbank` | POST | `v1/payments/addbank` | 1 |
| `privatePostV1PaymentsMethods` | POST | `v1/payments/methods` | 1 |
| `privatePostV1PaymentsSenWithdraw` | POST | `v1/payments/sen/withdraw` | 1 |
| `privatePostV1BalancesEarn` | POST | `v1/balances/earn` | 1 |
| `privatePostV1EarnInterest` | POST | `v1/earn/interest` | 1 |
| `privatePostV1EarnHistory` | POST | `v1/earn/history` | 1 |
| `privatePostV1ApprovedAddressesNetworkRequest` | POST | `v1/approvedAddresses/{network}/request` | 1 |
| `privatePostV1ApprovedAddressesAccountNetwork` | POST | `v1/approvedAddresses/account/{network}` | 1 |
| `privatePostV1ApprovedAddressesNetworkRemove` | POST | `v1/approvedAddresses/{network}/remove` | 1 |
| `privatePostV1Account` | POST | `v1/account` | 1 |
| `privatePostV1AccountCreate` | POST | `v1/account/create` | 1 |
| `privatePostV1AccountList` | POST | `v1/account/list` | 1 |
| `privatePostV1Heartbeat` | POST | `v1/heartbeat` | 1 |
| `privatePostV1Roles` | POST | `v1/roles` | 1 |
| `privatePostV1Custodyaccountfees` | POST | `v1/custodyaccountfees` | 1 |
| `privatePostV1WithdrawCurrencyCodeLowerCaseFeeEstimate` | POST | `v1/withdraw/{currencyCodeLowerCase}/feeEstimate` | 1 |
| `privatePostV1PaymentsAddbankCad` | POST | `v1/payments/addbank/cad` | 1 |
| `privatePostV1Transactions` | POST | `v1/transactions` | 1 |
| `privatePostV1MarginAccount` | POST | `v1/margin/account` | 1 |
| `privatePostV1MarginRates` | POST | `v1/margin/rates` | 1 |
| `privatePostV1MarginOrderPreview` | POST | `v1/margin/order/preview` | 1 |
| `privatePostV1ClearingList` | POST | `v1/clearing/list` | 1 |
| `privatePostV1ClearingBrokerList` | POST | `v1/clearing/broker/list` | 1 |
| `privatePostV1ClearingBrokerNew` | POST | `v1/clearing/broker/new` | 1 |
| `privatePostV1ClearingTrades` | POST | `v1/clearing/trades` | 1 |
| `privatePostV1InstantQuote` | POST | `v1/instant/quote` | 1 |
| `privatePostV1InstantExecute` | POST | `v1/instant/execute` | 1 |
| `privatePostV1AccountRename` | POST | `v1/account/rename` | 1 |
| `privatePostV1OauthRevokeByToken` | POST | `v1/oauth/revokeByToken` | 1 |
| `privatePostV1Margin` | POST | `v1/margin` | 1 |
| `privatePostV1PerpetualsFundingPayment` | POST | `v1/perpetuals/fundingPayment` | 1 |
| `privatePostV1PerpetualsFundingpaymentreportRecordsJson` | POST | `v1/perpetuals/fundingpaymentreport/records.json` | 1 |
| `privatePostV1Positions` | POST | `v1/positions` | 1 |

