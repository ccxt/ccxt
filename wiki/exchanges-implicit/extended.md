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
| `v1PublicGetInfoMarkets` | GET | `info/markets` | 1 |
| `v1PublicGetInfoAssets` | GET | `info/assets` | 1 |
| `v1PublicGetInfoAssetsAssetPrice` | GET | `info/assets/{asset}/price` | 1 |
| `v1PublicGetInfoMarketsMarketStats` | GET | `info/markets/{market}/stats` | 1 |
| `v1PublicGetInfoMarketsMarketOrderbook` | GET | `info/markets/{market}/orderbook` | 1 |
| `v1PublicGetInfoMarketsMarketTrades` | GET | `info/markets/{market}/trades` | 1 |
| `v1PublicGetInfoCandlesMarketCandleType` | GET | `info/candles/{market}/{candleType}` | 1 |
| `v1PublicGetInfoMarketFunding` | GET | `info/{market}/funding` | 1 |
| `v1PublicGetInfoMarketOpenInterests` | GET | `info/{market}/open-interests` | 1 |
| `v1PublicGetInfoBuilderDashboard` | GET | `info/builder/dashboard` | 1 |
| `v1PrivateGetUserAccounts` | GET | `user/accounts` | 1 |
| `v1PrivateGetUserAccountInfo` | GET | `user/account/info` | 1 |
| `v1PrivateGetUserBalance` | GET | `user/balance` | 1 |
| `v1PrivateGetUserSpotBalances` | GET | `user/spot/balances` | 1 |
| `v1PrivateGetUserAssetOperations` | GET | `user/assetOperations` | 1 |
| `v1PrivateGetUserPositions` | GET | `user/positions` | 1 |
| `v1PrivateGetUserPositionsHistory` | GET | `user/positions/history` | 1 |
| `v1PrivateGetUserOrders` | GET | `user/orders` | 1 |
| `v1PrivateGetUserOrdersHistory` | GET | `user/orders/history` | 1 |
| `v1PrivateGetUserOrdersId` | GET | `user/orders/{id}` | 1 |
| `v1PrivateGetUserOrdersExternalExternalId` | GET | `user/orders/external/{externalId}` | 1 |
| `v1PrivateGetUserTrades` | GET | `user/trades` | 1 |
| `v1PrivateGetUserFundingHistory` | GET | `user/funding/history` | 1 |
| `v1PrivateGetUserRebatesStats` | GET | `user/rebates/stats` | 1 |
| `v1PrivateGetUserLeverage` | GET | `user/leverage` | 1 |
| `v1PrivateGetUserFees` | GET | `user/fees` | 1 |
| `v1PrivateGetUserBridgeConfig` | GET | `user/bridge/config` | 1 |
| `v1PrivateGetUserBridgeQuote` | GET | `user/bridge/quote` | 1 |
| `v1PrivateGetUserAffiliate` | GET | `user/affiliate` | 1 |
| `v1PrivateGetUserReferralsStatus` | GET | `user/referrals/status` | 1 |
| `v1PrivateGetUserReferralsLinks` | GET | `user/referrals/links` | 1 |
| `v1PrivateGetUserReferralsDashboard` | GET | `user/referrals/dashboard` | 1 |
| `v1PrivateGetUserRewardsEarned` | GET | `user/rewards/earned` | 1 |
| `v1PrivateGetUserRewardsLeaderboardStats` | GET | `user/rewards/leaderboard/stats` | 1 |
| `v1PrivateGetPortfolioChartsEquities` | GET | `portfolio/charts/equities` | 1 |
| `v1PrivateGetPortfolioChartsPnl` | GET | `portfolio/charts/pnl` | 1 |
| `v1PrivateGetVaultPublicPerformance` | GET | `vault/public/performance` | 1 |
| `v1PrivateGetVaultPublicSummary` | GET | `vault/public/summary` | 1 |
| `v1PrivateGetBuilderTrades` | GET | `builder/trades` | 1 |
| `v1PrivatePostUserOrder` | POST | `user/order` | 1 |
| `v1PrivatePostUserOrderMassCancel` | POST | `user/order/massCancel` | 1 |
| `v1PrivatePostUserDeadmanswitch` | POST | `user/deadmanswitch` | 1 |
| `v1PrivatePostUserBridgeQuote` | POST | `user/bridge/quote` | 1 |
| `v1PrivatePostUserWithdrawal` | POST | `user/withdrawal` | 1 |
| `v1PrivatePostUserTransfer` | POST | `user/transfer` | 1 |
| `v1PrivatePostUserReferralsUse` | POST | `user/referrals/use` | 1 |
| `v1PrivatePostUserReferrals` | POST | `user/referrals` | 1 |
| `v1PrivatePutUserReferrals` | PUT | `user/referrals` | 1 |
| `v1PrivatePatchUserLeverage` | PATCH | `user/leverage` | 1 |
| `v1PrivateDeleteUserOrderId` | DELETE | `user/order/{id}` | 1 |
| `v1PrivateDeleteUserOrder` | DELETE | `user/order` | 1 |

