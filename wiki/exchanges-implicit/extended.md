Every endpoint in `extended`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/extended) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `v1PublicGetInfoMarkets`); the snake_case alias (`v1_public_get_info_markets`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`V1PublicGetInfoMarkets`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const extended = new ccxt.extended ();
const response = await extended.v1PublicGetInfoMarkets (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const extended = new ccxt.extended ();
const response = await extended.v1PublicGetInfoMarkets (params);
```

#### **Python**

```python
import ccxt
extended = ccxt.extended()
response = extended.v1_public_get_info_markets(params)
```

#### **PHP**

```php
$extended = new \ccxt\extended();
$response = $extended->v1_public_get_info_markets($params);
```

#### **C#**

```csharp
using ccxt;
var extended = new Extended();
var response = await extended.v1PublicGetInfoMarkets(parameters);
```

#### **Go**

```go
extended := ccxt.NewExtended(nil)
response := <-extended.V1PublicGetInfoMarkets(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official extended API documentation:** [api.docs.extended.exchange](https://api.docs.extended.exchange)

> 51 implicit endpoints across 1 access group.

## v1

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v1PublicGetInfoMarkets` | GET | `info/markets` |  |
| `v1PublicGetInfoAssets` | GET | `info/assets` |  |
| `v1PublicGetInfoAssetsAssetPrice` | GET | `info/assets/{asset}/price` |  |
| `v1PublicGetInfoMarketsMarketStats` | GET | `info/markets/{market}/stats` |  |
| `v1PublicGetInfoMarketsMarketOrderbook` | GET | `info/markets/{market}/orderbook` |  |
| `v1PublicGetInfoMarketsMarketTrades` | GET | `info/markets/{market}/trades` |  |
| `v1PublicGetInfoCandlesMarketCandleType` | GET | `info/candles/{market}/{candleType}` |  |
| `v1PublicGetInfoMarketFunding` | GET | `info/{market}/funding` |  |
| `v1PublicGetInfoMarketOpenInterests` | GET | `info/{market}/open-interests` |  |
| `v1PublicGetInfoBuilderDashboard` | GET | `info/builder/dashboard` |  |
| `v1PrivateGetUserAccounts` | GET | `user/accounts` |  |
| `v1PrivateGetUserAccountInfo` | GET | `user/account/info` |  |
| `v1PrivateGetUserBalance` | GET | `user/balance` |  |
| `v1PrivateGetUserSpotBalances` | GET | `user/spot/balances` |  |
| `v1PrivateGetUserAssetOperations` | GET | `user/assetOperations` |  |
| `v1PrivateGetUserPositions` | GET | `user/positions` |  |
| `v1PrivateGetUserPositionsHistory` | GET | `user/positions/history` |  |
| `v1PrivateGetUserOrders` | GET | `user/orders` |  |
| `v1PrivateGetUserOrdersHistory` | GET | `user/orders/history` |  |
| `v1PrivateGetUserOrdersId` | GET | `user/orders/{id}` |  |
| `v1PrivateGetUserOrdersExternalExternalId` | GET | `user/orders/external/{externalId}` |  |
| `v1PrivateGetUserTrades` | GET | `user/trades` |  |
| `v1PrivateGetUserFundingHistory` | GET | `user/funding/history` |  |
| `v1PrivateGetUserRebatesStats` | GET | `user/rebates/stats` |  |
| `v1PrivateGetUserLeverage` | GET | `user/leverage` |  |
| `v1PrivateGetUserFees` | GET | `user/fees` |  |
| `v1PrivateGetUserBridgeConfig` | GET | `user/bridge/config` |  |
| `v1PrivateGetUserBridgeQuote` | GET | `user/bridge/quote` |  |
| `v1PrivateGetUserAffiliate` | GET | `user/affiliate` |  |
| `v1PrivateGetUserReferralsStatus` | GET | `user/referrals/status` |  |
| `v1PrivateGetUserReferralsLinks` | GET | `user/referrals/links` |  |
| `v1PrivateGetUserReferralsDashboard` | GET | `user/referrals/dashboard` |  |
| `v1PrivateGetUserRewardsEarned` | GET | `user/rewards/earned` |  |
| `v1PrivateGetUserRewardsLeaderboardStats` | GET | `user/rewards/leaderboard/stats` |  |
| `v1PrivateGetPortfolioChartsEquities` | GET | `portfolio/charts/equities` |  |
| `v1PrivateGetPortfolioChartsPnl` | GET | `portfolio/charts/pnl` |  |
| `v1PrivateGetVaultPublicPerformance` | GET | `vault/public/performance` |  |
| `v1PrivateGetVaultPublicSummary` | GET | `vault/public/summary` |  |
| `v1PrivateGetBuilderTrades` | GET | `builder/trades` |  |
| `v1PrivatePostUserOrder` | POST | `user/order` |  |
| `v1PrivatePostUserOrderMassCancel` | POST | `user/order/massCancel` |  |
| `v1PrivatePostUserDeadmanswitch` | POST | `user/deadmanswitch` |  |
| `v1PrivatePostUserBridgeQuote` | POST | `user/bridge/quote` |  |
| `v1PrivatePostUserWithdrawal` | POST | `user/withdrawal` |  |
| `v1PrivatePostUserTransfer` | POST | `user/transfer` |  |
| `v1PrivatePostUserReferralsUse` | POST | `user/referrals/use` |  |
| `v1PrivatePostUserReferrals` | POST | `user/referrals` |  |
| `v1PrivatePutUserReferrals` | PUT | `user/referrals` |  |
| `v1PrivatePatchUserLeverage` | PATCH | `user/leverage` |  |
| `v1PrivateDeleteUserOrderId` | DELETE | `user/order/{id}` |  |
| `v1PrivateDeleteUserOrder` | DELETE | `user/order` |  |

