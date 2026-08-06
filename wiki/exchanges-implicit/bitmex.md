Every endpoint in `bitmex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitmex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetAnnouncement`); the snake_case alias (`public_get_announcement`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetAnnouncement`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bitmex = new ccxt.bitmex ();
const response = await bitmex.publicGetAnnouncement (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bitmex = new ccxt.bitmex ();
const response = await bitmex.publicGetAnnouncement (params);
```

#### **Python**

```python
import ccxt
bitmex = ccxt.bitmex()
response = bitmex.public_get_announcement(params)
```

#### **PHP**

```php
$bitmex = new \ccxt\bitmex();
$response = $bitmex->public_get_announcement($params);
```

#### **C#**

```csharp
using ccxt;
var bitmex = new Bitmex();
var response = await bitmex.publicGetAnnouncement(parameters);
```

#### **Go**

```go
bitmex := ccxt.NewBitmex(nil)
response := <-bitmex.PublicGetAnnouncement(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bitmex API documentation:** [bitmex.com](https://www.bitmex.com/app/apiOverview) · [github.com](https://github.com/BitMEX/api-connectors/tree/master/official-http)

> 93 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://www.bitmex.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetAnnouncement` | GET | `announcement` | 5 |
| `publicGetAnnouncementUrgent` | GET | `announcement/urgent` | 5 |
| `publicGetChat` | GET | `chat` | 5 |
| `publicGetChatChannels` | GET | `chat/channels` | 5 |
| `publicGetChatConnected` | GET | `chat/connected` | 5 |
| `publicGetChatPinned` | GET | `chat/pinned` | 5 |
| `publicGetFunding` | GET | `funding` | 5 |
| `publicGetGuild` | GET | `guild` | 5 |
| `publicGetInstrument` | GET | `instrument` | 5 |
| `publicGetInstrumentActive` | GET | `instrument/active` | 5 |
| `publicGetInstrumentActiveAndIndices` | GET | `instrument/activeAndIndices` | 5 |
| `publicGetInstrumentActiveIntervals` | GET | `instrument/activeIntervals` | 5 |
| `publicGetInstrumentCompositeIndex` | GET | `instrument/compositeIndex` | 5 |
| `publicGetInstrumentIndices` | GET | `instrument/indices` | 5 |
| `publicGetInstrumentUsdVolume` | GET | `instrument/usdVolume` | 5 |
| `publicGetInsurance` | GET | `insurance` | 5 |
| `publicGetLeaderboard` | GET | `leaderboard` | 5 |
| `publicGetLiquidation` | GET | `liquidation` | 5 |
| `publicGetOrderBookL2` | GET | `orderBook/L2` | 5 |
| `publicGetPorlNonce` | GET | `porl/nonce` | 5 |
| `publicGetQuote` | GET | `quote` | 5 |
| `publicGetQuoteBucketed` | GET | `quote/bucketed` | 5 |
| `publicGetSchema` | GET | `schema` | 5 |
| `publicGetSchemaWebsocketHelp` | GET | `schema/websocketHelp` | 5 |
| `publicGetSettlement` | GET | `settlement` | 5 |
| `publicGetStats` | GET | `stats` | 5 |
| `publicGetStatsHistory` | GET | `stats/history` | 5 |
| `publicGetStatsHistoryUSD` | GET | `stats/historyUSD` | 5 |
| `publicGetTrade` | GET | `trade` | 5 |
| `publicGetTradeBucketed` | GET | `trade/bucketed` | 5 |
| `publicGetWalletAssets` | GET | `wallet/assets` | 5 |
| `publicGetWalletNetworks` | GET | `wallet/networks` | 5 |

## private

**Base URL**: `https://www.bitmex.com`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAddress` | GET | `address` | 5 |
| `privateGetApiKey` | GET | `apiKey` | 5 |
| `privateGetExecution` | GET | `execution` | 5 |
| `privateGetExecutionTradeHistory` | GET | `execution/tradeHistory` | 5 |
| `privateGetGlobalNotification` | GET | `globalNotification` | 5 |
| `privateGetLeaderboardName` | GET | `leaderboard/name` | 5 |
| `privateGetOrder` | GET | `order` | 5 |
| `privateGetPorlSnapshots` | GET | `porl/snapshots` | 5 |
| `privateGetPosition` | GET | `position` | 5 |
| `privateGetUser` | GET | `user` | 5 |
| `privateGetUserAffiliateStatus` | GET | `user/affiliateStatus` | 5 |
| `privateGetUserCheckReferralCode` | GET | `user/checkReferralCode` | 5 |
| `privateGetUserCommission` | GET | `user/commission` | 5 |
| `privateGetUserCsa` | GET | `user/csa` | 5 |
| `privateGetUserDepositAddress` | GET | `user/depositAddress` | 5 |
| `privateGetUserExecutionHistory` | GET | `user/executionHistory` | 5 |
| `privateGetUserGetWalletTransferAccounts` | GET | `user/getWalletTransferAccounts` | 5 |
| `privateGetUserMargin` | GET | `user/margin` | 5 |
| `privateGetUserQuoteFillRatio` | GET | `user/quoteFillRatio` | 5 |
| `privateGetUserQuoteValueRatio` | GET | `user/quoteValueRatio` | 5 |
| `privateGetUserStaking` | GET | `user/staking` | 5 |
| `privateGetUserStakingInstruments` | GET | `user/staking/instruments` | 5 |
| `privateGetUserStakingTiers` | GET | `user/staking/tiers` | 5 |
| `privateGetUserTradingVolume` | GET | `user/tradingVolume` | 5 |
| `privateGetUserUnstakingRequests` | GET | `user/unstakingRequests` | 5 |
| `privateGetUserWallet` | GET | `user/wallet` | 5 |
| `privateGetUserWalletHistory` | GET | `user/walletHistory` | 5 |
| `privateGetUserWalletSummary` | GET | `user/walletSummary` | 5 |
| `privateGetUserAffiliates` | GET | `userAffiliates` | 5 |
| `privateGetUserEvent` | GET | `userEvent` | 5 |
| `privatePostAddress` | POST | `address` | 5 |
| `privatePostChat` | POST | `chat` | 5 |
| `privatePostGuild` | POST | `guild` | 5 |
| `privatePostGuildArchive` | POST | `guild/archive` | 5 |
| `privatePostGuildJoin` | POST | `guild/join` | 5 |
| `privatePostGuildKick` | POST | `guild/kick` | 5 |
| `privatePostGuildLeave` | POST | `guild/leave` | 5 |
| `privatePostGuildSharesTrades` | POST | `guild/sharesTrades` | 5 |
| `privatePostOrder` | POST | `order` | 1 |
| `privatePostOrderCancelAllAfter` | POST | `order/cancelAllAfter` | 5 |
| `privatePostOrderClosePosition` | POST | `order/closePosition` | 5 |
| `privatePostPositionIsolate` | POST | `position/isolate` | 1 |
| `privatePostPositionLeverage` | POST | `position/leverage` | 1 |
| `privatePostPositionRiskLimit` | POST | `position/riskLimit` | 5 |
| `privatePostPositionTransferMargin` | POST | `position/transferMargin` | 1 |
| `privatePostUserAddSubaccount` | POST | `user/addSubaccount` | 5 |
| `privatePostUserCancelWithdrawal` | POST | `user/cancelWithdrawal` | 5 |
| `privatePostUserCommunicationToken` | POST | `user/communicationToken` | 5 |
| `privatePostUserConfirmEmail` | POST | `user/confirmEmail` | 5 |
| `privatePostUserConfirmWithdrawal` | POST | `user/confirmWithdrawal` | 5 |
| `privatePostUserLogout` | POST | `user/logout` | 5 |
| `privatePostUserPreferences` | POST | `user/preferences` | 5 |
| `privatePostUserRequestWithdrawal` | POST | `user/requestWithdrawal` | 5 |
| `privatePostUserUnstakingRequests` | POST | `user/unstakingRequests` | 5 |
| `privatePostUserUpdateSubaccount` | POST | `user/updateSubaccount` | 5 |
| `privatePostUserWalletTransfer` | POST | `user/walletTransfer` | 5 |
| `privatePutGuild` | PUT | `guild` | 5 |
| `privatePutOrder` | PUT | `order` | 1 |
| `privateDeleteOrder` | DELETE | `order` | 1 |
| `privateDeleteOrderAll` | DELETE | `order/all` | 1 |
| `privateDeleteUserUnstakingRequests` | DELETE | `user/unstakingRequests` | 5 |

