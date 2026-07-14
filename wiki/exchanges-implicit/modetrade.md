Every endpoint in `modetrade`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/modetrade) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `v1PublicGetPublicVolumeStats`); the snake_case alias (`v1_public_get_public_volume_stats`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`V1PublicGetPublicVolumeStats`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const modetrade = new ccxt.modetrade ();
const response = await modetrade.v1PublicGetPublicVolumeStats (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const modetrade = new ccxt.modetrade ();
const response = await modetrade.v1PublicGetPublicVolumeStats (params);
```

#### **Python**

```python
import ccxt
modetrade = ccxt.modetrade()
response = modetrade.v1_public_get_public_volume_stats(params)
```

#### **PHP**

```php
$modetrade = new \ccxt\modetrade();
$response = $modetrade->v1_public_get_public_volume_stats($params);
```

#### **C#**

```csharp
using ccxt;
var modetrade = new Modetrade();
var response = await modetrade.v1PublicGetPublicVolumeStats(parameters);
```

#### **Go**

```go
modetrade := ccxt.NewModetrade(nil)
response := <-modetrade.V1PublicGetPublicVolumeStats(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official modetrade API documentation:** [trade.mode.network](https://trade.mode.network)

> 115 implicit endpoints across 1 access group.

## v1

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `v1PublicGetPublicVolumeStats` | GET | `public/volume/stats` | 1 |
| `v1PublicGetPublicBrokerName` | GET | `public/broker/name` | 1 |
| `v1PublicGetPublicChainInfoBrokerId` | GET | `public/chain_info/{broker_id}` | 1 |
| `v1PublicGetPublicSystemInfo` | GET | `public/system_info` | 1 |
| `v1PublicGetPublicVaultBalance` | GET | `public/vault_balance` | 1 |
| `v1PublicGetPublicInsurancefund` | GET | `public/insurancefund` | 1 |
| `v1PublicGetPublicChainInfo` | GET | `public/chain_info` | 1 |
| `v1PublicGetFaucetUsdc` | GET | `faucet/usdc` | 1 |
| `v1PublicGetPublicAccount` | GET | `public/account` | 1 |
| `v1PublicGetGetAccount` | GET | `get_account` | 1 |
| `v1PublicGetRegistrationNonce` | GET | `registration_nonce` | 1 |
| `v1PublicGetGetOrderlyKey` | GET | `get_orderly_key` | 1 |
| `v1PublicGetPublicLiquidation` | GET | `public/liquidation` | 1 |
| `v1PublicGetPublicLiquidatedPositions` | GET | `public/liquidated_positions` | 1 |
| `v1PublicGetPublicConfig` | GET | `public/config` | 1 |
| `v1PublicGetPublicCampaignRanking` | GET | `public/campaign/ranking` | 10 |
| `v1PublicGetPublicCampaignStats` | GET | `public/campaign/stats` | 10 |
| `v1PublicGetPublicCampaignUser` | GET | `public/campaign/user` | 10 |
| `v1PublicGetPublicCampaignStatsDetails` | GET | `public/campaign/stats/details` | 10 |
| `v1PublicGetPublicCampaigns` | GET | `public/campaigns` | 10 |
| `v1PublicGetPublicPointsLeaderboard` | GET | `public/points/leaderboard` | 1 |
| `v1PublicGetClientPoints` | GET | `client/points` | 1 |
| `v1PublicGetPublicPointsEpoch` | GET | `public/points/epoch` | 1 |
| `v1PublicGetPublicPointsEpochDates` | GET | `public/points/epoch_dates` | 1 |
| `v1PublicGetPublicReferralCheckRefCode` | GET | `public/referral/check_ref_code` | 1 |
| `v1PublicGetPublicReferralVerifyRefCode` | GET | `public/referral/verify_ref_code` | 1 |
| `v1PublicGetReferralAdminInfo` | GET | `referral/admin_info` | 1 |
| `v1PublicGetReferralInfo` | GET | `referral/info` | 1 |
| `v1PublicGetReferralRefereeInfo` | GET | `referral/referee_info` | 1 |
| `v1PublicGetReferralRefereeRebateSummary` | GET | `referral/referee_rebate_summary` | 1 |
| `v1PublicGetReferralRefereeHistory` | GET | `referral/referee_history` | 1 |
| `v1PublicGetReferralReferralHistory` | GET | `referral/referral_history` | 1 |
| `v1PublicGetReferralRebateSummary` | GET | `referral/rebate_summary` | 1 |
| `v1PublicGetClientDistributionHistory` | GET | `client/distribution_history` | 1 |
| `v1PublicGetTvConfig` | GET | `tv/config` | 1 |
| `v1PublicGetTvHistory` | GET | `tv/history` | 1 |
| `v1PublicGetTvSymbolInfo` | GET | `tv/symbol_info` | 1 |
| `v1PublicGetPublicFundingRateHistory` | GET | `public/funding_rate_history` | 1 |
| `v1PublicGetPublicFundingRateSymbol` | GET | `public/funding_rate/{symbol}` | 0.33 |
| `v1PublicGetPublicFundingRates` | GET | `public/funding_rates` | 1 |
| `v1PublicGetPublicInfo` | GET | `public/info` | 1 |
| `v1PublicGetPublicInfoSymbol` | GET | `public/info/{symbol}` | 1 |
| `v1PublicGetPublicMarketTrades` | GET | `public/market_trades` | 1 |
| `v1PublicGetPublicToken` | GET | `public/token` | 1 |
| `v1PublicGetPublicFutures` | GET | `public/futures` | 1 |
| `v1PublicGetPublicFuturesSymbol` | GET | `public/futures/{symbol}` | 1 |
| `v1PublicPostRegisterAccount` | POST | `register_account` | 1 |
| `v1PrivateGetClientKeyInfo` | GET | `client/key_info` | 6 |
| `v1PrivateGetClientOrderlyKeyIpRestriction` | GET | `client/orderly_key_ip_restriction` | 6 |
| `v1PrivateGetOrderOid` | GET | `order/{oid}` | 1 |
| `v1PrivateGetClientOrderClientOrderId` | GET | `client/order/{client_order_id}` | 1 |
| `v1PrivateGetAlgoOrderOid` | GET | `algo/order/{oid}` | 1 |
| `v1PrivateGetAlgoClientOrderClientOrderId` | GET | `algo/client/order/{client_order_id}` | 1 |
| `v1PrivateGetOrders` | GET | `orders` | 1 |
| `v1PrivateGetAlgoOrders` | GET | `algo/orders` | 1 |
| `v1PrivateGetTradeTid` | GET | `trade/{tid}` | 1 |
| `v1PrivateGetTrades` | GET | `trades` | 1 |
| `v1PrivateGetOrderOidTrades` | GET | `order/{oid}/trades` | 1 |
| `v1PrivateGetClientLiquidatorLiquidations` | GET | `client/liquidator_liquidations` | 1 |
| `v1PrivateGetLiquidations` | GET | `liquidations` | 1 |
| `v1PrivateGetAssetHistory` | GET | `asset/history` | 60 |
| `v1PrivateGetClientHolding` | GET | `client/holding` | 1 |
| `v1PrivateGetWithdrawNonce` | GET | `withdraw_nonce` | 1 |
| `v1PrivateGetSettleNonce` | GET | `settle_nonce` | 1 |
| `v1PrivateGetPnlSettlementHistory` | GET | `pnl_settlement/history` | 1 |
| `v1PrivateGetVolumeUserDaily` | GET | `volume/user/daily` | 60 |
| `v1PrivateGetVolumeUserStats` | GET | `volume/user/stats` | 60 |
| `v1PrivateGetClientStatistics` | GET | `client/statistics` | 60 |
| `v1PrivateGetClientInfo` | GET | `client/info` | 60 |
| `v1PrivateGetClientStatisticsDaily` | GET | `client/statistics/daily` | 60 |
| `v1PrivateGetPositions` | GET | `positions` | 3.33 |
| `v1PrivateGetPositionSymbol` | GET | `position/{symbol}` | 3.33 |
| `v1PrivateGetFundingFeeHistory` | GET | `funding_fee/history` | 30 |
| `v1PrivateGetNotificationInboxNotifications` | GET | `notification/inbox/notifications` | 60 |
| `v1PrivateGetNotificationInboxUnread` | GET | `notification/inbox/unread` | 60 |
| `v1PrivateGetVolumeBrokerDaily` | GET | `volume/broker/daily` | 60 |
| `v1PrivateGetBrokerFeeRateDefault` | GET | `broker/fee_rate/default` | 10 |
| `v1PrivateGetBrokerUserInfo` | GET | `broker/user_info` | 10 |
| `v1PrivateGetOrderbookSymbol` | GET | `orderbook/{symbol}` | 1 |
| `v1PrivateGetKline` | GET | `kline` | 1 |
| `v1PrivatePostOrderlyKey` | POST | `orderly_key` | 1 |
| `v1PrivatePostClientSetOrderlyKeyIpRestriction` | POST | `client/set_orderly_key_ip_restriction` | 6 |
| `v1PrivatePostClientResetOrderlyKeyIpRestriction` | POST | `client/reset_orderly_key_ip_restriction` | 6 |
| `v1PrivatePostOrder` | POST | `order` | 1 |
| `v1PrivatePostBatchOrder` | POST | `batch-order` | 10 |
| `v1PrivatePostAlgoOrder` | POST | `algo/order` | 1 |
| `v1PrivatePostLiquidation` | POST | `liquidation` | 1 |
| `v1PrivatePostClaimInsuranceFund` | POST | `claim_insurance_fund` | 1 |
| `v1PrivatePostWithdrawRequest` | POST | `withdraw_request` | 1 |
| `v1PrivatePostSettlePnl` | POST | `settle_pnl` | 1 |
| `v1PrivatePostNotificationInboxMarkRead` | POST | `notification/inbox/mark_read` | 60 |
| `v1PrivatePostNotificationInboxMarkReadAll` | POST | `notification/inbox/mark_read_all` | 60 |
| `v1PrivatePostClientLeverage` | POST | `client/leverage` | 120 |
| `v1PrivatePostClientMaintenanceConfig` | POST | `client/maintenance_config` | 60 |
| `v1PrivatePostDelegateSigner` | POST | `delegate_signer` | 10 |
| `v1PrivatePostDelegateOrderlyKey` | POST | `delegate_orderly_key` | 10 |
| `v1PrivatePostDelegateSettlePnl` | POST | `delegate_settle_pnl` | 10 |
| `v1PrivatePostDelegateWithdrawRequest` | POST | `delegate_withdraw_request` | 10 |
| `v1PrivatePostBrokerFeeRateSet` | POST | `broker/fee_rate/set` | 10 |
| `v1PrivatePostBrokerFeeRateSetDefault` | POST | `broker/fee_rate/set_default` | 10 |
| `v1PrivatePostBrokerFeeRateDefault` | POST | `broker/fee_rate/default` | 10 |
| `v1PrivatePostReferralCreate` | POST | `referral/create` | 10 |
| `v1PrivatePostReferralUpdate` | POST | `referral/update` | 10 |
| `v1PrivatePostReferralBind` | POST | `referral/bind` | 10 |
| `v1PrivatePostReferralEditSplit` | POST | `referral/edit_split` | 10 |
| `v1PrivatePutOrder` | PUT | `order` | 1 |
| `v1PrivatePutAlgoOrder` | PUT | `algo/order` | 1 |
| `v1PrivateDeleteOrder` | DELETE | `order` | 1 |
| `v1PrivateDeleteAlgoOrder` | DELETE | `algo/order` | 1 |
| `v1PrivateDeleteClientOrder` | DELETE | `client/order` | 1 |
| `v1PrivateDeleteAlgoClientOrder` | DELETE | `algo/client/order` | 1 |
| `v1PrivateDeleteAlgoOrders` | DELETE | `algo/orders` | 1 |
| `v1PrivateDeleteOrders` | DELETE | `orders` | 1 |
| `v1PrivateDeleteBatchOrder` | DELETE | `batch-order` | 1 |
| `v1PrivateDeleteClientBatchOrder` | DELETE | `client/batch-order` | 1 |

