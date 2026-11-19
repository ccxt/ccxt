Every endpoint in `paradex`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/paradex) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetBboMarket`); Python and PHP use the snake_case form (`public_get_bbo_market`), and Go uses the PascalCase form (`PublicGetBboMarket`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const paradex = new ccxt.paradex ();
const response = await paradex.publicGetBboMarket (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const paradex = new ccxt.paradex ();
const response = await paradex.publicGetBboMarket (params);
```

#### **Python**

```python
import ccxt
paradex = ccxt.paradex()
response = paradex.public_get_bbo_market(params)
```

#### **PHP**

```php
$paradex = new \ccxt\paradex();
$response = $paradex->public_get_bbo_market($params);
```

#### **C#**

```csharp
using ccxt;
var paradex = new Paradex();
var response = await paradex.publicGetBboMarket(parameters);
```

#### **Go**

```go
paradex := ccxt.NewParadex(nil)
response := <-paradex.PublicGetBboMarket(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official paradex API documentation:** [docs.api.testnet.paradex.trade](https://docs.api.testnet.paradex.trade/)

> 127 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetBboMarket` | GET | `bbo/{market}` | 1 |
| `publicGetBboMarketInteractive` | GET | `bbo/{market}/interactive` | 1 |
| `publicGetFundingData` | GET | `funding/data` | 1 |
| `publicGetMarkets` | GET | `markets` | 1 |
| `publicGetMarketsHistory` | GET | `markets/history` | 1 |
| `publicGetMarketsKlines` | GET | `markets/klines` | 1 |
| `publicGetMarketsSettlementPrice` | GET | `markets/settlement-price` | 1 |
| `publicGetMarketsSummary` | GET | `markets/summary` | 1 |
| `publicGetOrderbookMarket` | GET | `orderbook/{market}` | 1 |
| `publicGetOrderbookMarketImpactPrice` | GET | `orderbook/{market}/impact-price` | 1 |
| `publicGetOrderbookMarketInteractive` | GET | `orderbook/{market}/interactive` | 1 |
| `publicGetInsurance` | GET | `insurance` | 1 |
| `publicGetJwksJson` | GET | `jwks.json` | 1 |
| `publicGetOnboarding` | GET | `onboarding` | 1 |
| `publicGetReferralsConfig` | GET | `referrals/config` | 1 |
| `publicGetStakingBalanceHistoryGlobal` | GET | `staking/balance/history/global` | 1 |
| `publicGetStakingConfig` | GET | `staking/config` | 1 |
| `publicGetSystemAnnouncements` | GET | `system/announcements` | 1 |
| `publicGetSystemConfig` | GET | `system/config` | 1 |
| `publicGetSystemPortfolioMarginConfig` | GET | `system/portfolio-margin-config` | 1 |
| `publicGetSystemState` | GET | `system/state` | 1 |
| `publicGetSystemTime` | GET | `system/time` | 1 |
| `publicGetSystemVolumeTiers` | GET | `system/volume-tiers` | 1 |
| `publicGetTrades` | GET | `trades` | 1 |
| `publicGetVaults` | GET | `vaults` | 1 |
| `publicGetVaultsAnalytics` | GET | `vaults/analytics` | 1 |
| `publicGetVaultsBalance` | GET | `vaults/balance` | 1 |
| `publicGetVaultsConfig` | GET | `vaults/config` | 1 |
| `publicGetVaultsHistory` | GET | `vaults/history` | 1 |
| `publicGetVaultsPositions` | GET | `vaults/positions` | 1 |
| `publicGetVaultsSummary` | GET | `vaults/summary` | 1 |
| `publicGetVaultsTransfers` | GET | `vaults/transfers` | 1 |
| `publicGetXpFeeConfig` | GET | `xp/fee-config` | 1 |
| `publicGetXpPublicTransfers` | GET | `xp/public-transfers` | 1 |
| `publicGetXpTransferTransferId` | GET | `xp/transfer/{transfer_id}` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAccount` | GET | `account` | 2.5 |
| `privateGetAccountCompliance` | GET | `account/compliance` | 2.5 |
| `privateGetAccountHistory` | GET | `account/history` | 2.5 |
| `privateGetAccountInfo` | GET | `account/info` | 2.5 |
| `privateGetAccountMargin` | GET | `account/margin` | 2.5 |
| `privateGetAccountProfile` | GET | `account/profile` | 2.5 |
| `privateGetAccountSettings` | GET | `account/settings` | 2.5 |
| `privateGetAccountSubaccounts` | GET | `account/subaccounts` | 2.5 |
| `privateGetAccountSummary` | GET | `account/summary` | 2.5 |
| `privateGetBalance` | GET | `balance` | 2.5 |
| `privateGetFills` | GET | `fills` | 2.5 |
| `privateGetFundingPayments` | GET | `funding/payments` | 2.5 |
| `privateGetPositions` | GET | `positions` | 2.5 |
| `privateGetTradebusts` | GET | `tradebusts` | 2.5 |
| `privateGetTransactions` | GET | `transactions` | 2.5 |
| `privateGetAccountKeysSubkeys` | GET | `account/keys/subkeys` | 2.5 |
| `privateGetAccountKeysSubkeysPublicKey` | GET | `account/keys/subkeys/{public_key}` | 2.5 |
| `privateGetAccountTokens` | GET | `account/tokens` | 2.5 |
| `privateGetAlgoOrders` | GET | `algo/orders` | 2.5 |
| `privateGetAlgoOrdersHistory` | GET | `algo/orders-history` | 2.5 |
| `privateGetAlgoOrdersAlgoId` | GET | `algo/orders/{algo_id}` | 2.5 |
| `privateGetBlockTrades` | GET | `block-trades` | 2.5 |
| `privateGetBlockTradesBlockTradeId` | GET | `block-trades/{block_trade_id}` | 2.5 |
| `privateGetBlockTradesBlockTradeIdOffers` | GET | `block-trades/{block_trade_id}/offers` | 2.5 |
| `privateGetBlockTradesBlockTradeIdOffersOfferId` | GET | `block-trades/{block_trade_id}/offers/{offer_id}` | 2.5 |
| `privateGetLiquidations` | GET | `liquidations` | 2.5 |
| `privateGetOrders` | GET | `orders` | 2.5 |
| `privateGetOrdersHistory` | GET | `orders-history` | 2.5 |
| `privateGetOrdersByClientIdClientId` | GET | `orders/by_client_id/{client_id}` | 2.5 |
| `privateGetOrdersOrderId` | GET | `orders/{order_id}` | 2.5 |
| `privateGetReferralsQrCode` | GET | `referrals/qr-code` | 2.5 |
| `privateGetReferralsSummary` | GET | `referrals/summary` | 2.5 |
| `privateGetRfqs` | GET | `rfqs` | 2.5 |
| `privateGetRfqsDrafts` | GET | `rfqs/drafts` | 2.5 |
| `privateGetRfqsMarkets` | GET | `rfqs/markets` | 2.5 |
| `privateGetRfqsRfqIdBbo` | GET | `rfqs/{rfq_id}/bbo` | 2.5 |
| `privateGetStakingBalanceHistory` | GET | `staking/balance/history` | 2.5 |
| `privateGetStakingHistory` | GET | `staking/history` | 2.5 |
| `privateGetStakingSummary` | GET | `staking/summary` | 2.5 |
| `privateGetTransfers` | GET | `transfers` | 2.5 |
| `privateGetVaultsAccountSummary` | GET | `vaults/account-summary` | 2.5 |
| `privateGetVaultsMine` | GET | `vaults/mine` | 2.5 |
| `privateGetXpAccountBalance` | GET | `xp/account-balance` | 2.5 |
| `privateGetXpTransfers` | GET | `xp/transfers` | 2.5 |
| `privatePostAccountCompliance` | POST | `account/compliance` | 1 |
| `privatePostAccountMarginMarket` | POST | `account/margin/{market}` | 1 |
| `privatePostAccountProfileMarketMaxSlippageMarket` | POST | `account/profile/market_max_slippage/{market}` | 1 |
| `privatePostAccountProfileNotifications` | POST | `account/profile/notifications` | 1 |
| `privatePostAccountProfileNotificationsLastSeen` | POST | `account/profile/notifications/last_seen` | 1 |
| `privatePostAccountProfileReferralCode` | POST | `account/profile/referral_code` | 1 |
| `privatePostAccountProfileRefreshInventory` | POST | `account/profile/refresh_inventory` | 1 |
| `privatePostAccountProfileSizeCurrencyDisplay` | POST | `account/profile/size_currency_display` | 1 |
| `privatePostAccountProfileUsername` | POST | `account/profile/username` | 1 |
| `privatePostAccountReferrer` | POST | `account/referrer` | 1 |
| `privatePostAccountSettingsTradingValueDisplay` | POST | `account/settings/trading_value_display` | 1 |
| `privatePostAccountParadigmEnable` | POST | `account/paradigm/enable` | 1 |
| `privatePostAccountTerminalToken` | POST | `account/terminal-token` | 1 |
| `privatePostAccountKeysSubkeysActivate` | POST | `account/keys/subkeys/activate` | 1 |
| `privatePostAccountKeysSubkeys` | POST | `account/keys/subkeys` | 1 |
| `privatePostAccountTokens` | POST | `account/tokens` | 1 |
| `privatePostAlgoOrders` | POST | `algo/orders` | 1 |
| `privatePostAuth` | POST | `auth` | 2.5 |
| `privatePostBlockTrades` | POST | `block-trades` | 1 |
| `privatePostBlockTradesBlockTradeIdExecute` | POST | `block-trades/{block_trade_id}/execute` | 1 |
| `privatePostBlockTradesBlockTradeIdOffers` | POST | `block-trades/{block_trade_id}/offers` | 1 |
| `privatePostBlockTradesBlockTradeIdOffersOfferIdExecute` | POST | `block-trades/{block_trade_id}/offers/{offer_id}/execute` | 1 |
| `privatePostOnboarding` | POST | `onboarding` | 2.5 |
| `privatePostOrders` | POST | `orders` | 1 |
| `privatePostOrdersBatch` | POST | `orders/batch` | 1 |
| `privatePostRfqs` | POST | `rfqs` | 1 |
| `privatePostRfqsDrafts` | POST | `rfqs/drafts` | 1 |
| `privatePostRfqsRfqIdExecute` | POST | `rfqs/{rfq_id}/execute` | 1 |
| `privatePostV2Auth` | POST | `v2/auth` | 2.5 |
| `privatePostV2Onboarding` | POST | `v2/onboarding` | 2.5 |
| `privatePostVaults` | POST | `vaults` | 1 |
| `privatePostXpTransfer` | POST | `xp/transfer` | 1 |
| `privatePutAccountProfile` | PUT | `account/profile` | 1 |
| `privatePutAccountKeysSubkeysPublicKey` | PUT | `account/keys/subkeys/{public_key}` | 1 |
| `privatePutAccountKeysSubkeysPublicKeyAllowedCidrs` | PUT | `account/keys/subkeys/{public_key}/allowed-cidrs` | 1 |
| `privatePutAccountTokensLookupIdAllowedCidrs` | PUT | `account/tokens/{lookup_id}/allowed-cidrs` | 1 |
| `privatePutOrdersOrderId` | PUT | `orders/{order_id}` | 1 |
| `privateDeleteAccountKeysSubkeysPublicKey` | DELETE | `account/keys/subkeys/{public_key}` | 1 |
| `privateDeleteAccountTokensLookupId` | DELETE | `account/tokens/{lookup_id}` | 1 |
| `privateDeleteAlgoOrdersAlgoId` | DELETE | `algo/orders/{algo_id}` | 1 |
| `privateDeleteBlockTradesBlockTradeId` | DELETE | `block-trades/{block_trade_id}` | 1 |
| `privateDeleteBlockTradesBlockTradeIdOffersOfferId` | DELETE | `block-trades/{block_trade_id}/offers/{offer_id}` | 1 |
| `privateDeleteOrders` | DELETE | `orders` | 1 |
| `privateDeleteOrdersBatch` | DELETE | `orders/batch` | 1 |
| `privateDeleteOrdersByClientIdClientId` | DELETE | `orders/by_client_id/{client_id}` | 1 |
| `privateDeleteOrdersOrderId` | DELETE | `orders/{order_id}` | 1 |
| `privateDeleteRfqsDraftsDraftId` | DELETE | `rfqs/drafts/{draft_id}` | 1 |
| `privateDeleteRfqsRfqId` | DELETE | `rfqs/{rfq_id}` | 1 |

