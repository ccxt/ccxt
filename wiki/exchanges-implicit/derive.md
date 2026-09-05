Every endpoint in `derive`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/derive) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetGetAllCurrencies`); the snake_case alias (`public_get_get_all_currencies`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetGetAllCurrencies`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const derive = new ccxt.derive ();
const response = await derive.publicGetGetAllCurrencies (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const derive = new ccxt.derive ();
const response = await derive.publicGetGetAllCurrencies (params);
```

#### **Python**

```python
import ccxt
derive = ccxt.derive()
response = derive.public_get_get_all_currencies(params)
```

#### **PHP**

```php
$derive = new \ccxt\derive();
$response = $derive->public_get_get_all_currencies($params);
```

#### **C#**

```csharp
using ccxt;
var derive = new Derive();
var response = await derive.publicGetGetAllCurrencies(parameters);
```

#### **Go**

```go
derive := ccxt.NewDerive(nil)
response := <-derive.PublicGetGetAllCurrencies(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official derive API documentation:** [docs.derive.xyz](https://docs.derive.xyz/docs/)

> 113 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.lyra.finance/public`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetGetAllCurrencies` | GET | `get_all_currencies` | 1 |
| `publicPostBuildRegisterSessionKeyTx` | POST | `build_register_session_key_tx` | 1 |
| `publicPostRegisterSessionKey` | POST | `register_session_key` | 1 |
| `publicPostDeregisterSessionKey` | POST | `deregister_session_key` | 1 |
| `publicPostLogin` | POST | `login` | 1 |
| `publicPostStatistics` | POST | `statistics` | 1 |
| `publicPostGetAllCurrencies` | POST | `get_all_currencies` | 1 |
| `publicPostGetCurrency` | POST | `get_currency` | 1 |
| `publicPostGetInstrument` | POST | `get_instrument` | 1 |
| `publicPostGetAllInstruments` | POST | `get_all_instruments` | 1 |
| `publicPostGetInstruments` | POST | `get_instruments` | 1 |
| `publicPostGetTicker` | POST | `get_ticker` | 1 |
| `publicPostGetLatestSignedFeeds` | POST | `get_latest_signed_feeds` | 1 |
| `publicPostGetOptionSettlementPrices` | POST | `get_option_settlement_prices` | 1 |
| `publicPostGetSpotFeedHistory` | POST | `get_spot_feed_history` | 1 |
| `publicPostGetSpotFeedHistoryCandles` | POST | `get_spot_feed_history_candles` | 1 |
| `publicPostGetFundingRateHistory` | POST | `get_funding_rate_history` | 1 |
| `publicPostGetTradeHistory` | POST | `get_trade_history` | 1 |
| `publicPostGetOptionSettlementHistory` | POST | `get_option_settlement_history` | 1 |
| `publicPostGetLiquidationHistory` | POST | `get_liquidation_history` | 1 |
| `publicPostGetInterestRateHistory` | POST | `get_interest_rate_history` | 1 |
| `publicPostGetTransaction` | POST | `get_transaction` | 1 |
| `publicPostGetMargin` | POST | `get_margin` | 1 |
| `publicPostMarginWatch` | POST | `margin_watch` | 1 |
| `publicPostValidateInviteCode` | POST | `validate_invite_code` | 1 |
| `publicPostGetPoints` | POST | `get_points` | 1 |
| `publicPostGetAllPoints` | POST | `get_all_points` | 1 |
| `publicPostGetPointsLeaderboard` | POST | `get_points_leaderboard` | 1 |
| `publicPostGetDescendantTree` | POST | `get_descendant_tree` | 1 |
| `publicPostGetTreeRoots` | POST | `get_tree_roots` | 1 |
| `publicPostGetSwellPercentPoints` | POST | `get_swell_percent_points` | 1 |
| `publicPostGetVaultAssets` | POST | `get_vault_assets` | 1 |
| `publicPostGetEtherfiEffectiveBalances` | POST | `get_etherfi_effective_balances` | 1 |
| `publicPostGetKelpEffectiveBalances` | POST | `get_kelp_effective_balances` | 1 |
| `publicPostGetBridgeBalances` | POST | `get_bridge_balances` | 1 |
| `publicPostGetEthenaParticipants` | POST | `get_ethena_participants` | 1 |
| `publicPostGetVaultShare` | POST | `get_vault_share` | 1 |
| `publicPostGetVaultStatistics` | POST | `get_vault_statistics` | 1 |
| `publicPostGetVaultBalances` | POST | `get_vault_balances` | 1 |
| `publicPostEstimateIntegratorPoints` | POST | `estimate_integrator_points` | 1 |
| `publicPostCreateSubaccountDebug` | POST | `create_subaccount_debug` | 1 |
| `publicPostDepositDebug` | POST | `deposit_debug` | 1 |
| `publicPostWithdrawDebug` | POST | `withdraw_debug` | 1 |
| `publicPostSendQuoteDebug` | POST | `send_quote_debug` | 1 |
| `publicPostExecuteQuoteDebug` | POST | `execute_quote_debug` | 1 |
| `publicPostGetInviteCode` | POST | `get_invite_code` | 1 |
| `publicPostRegisterInvite` | POST | `register_invite` | 1 |
| `publicPostGetTime` | POST | `get_time` | 1 |
| `publicPostGetLiveIncidents` | POST | `get_live_incidents` | 1 |
| `publicPostGetMakerPrograms` | POST | `get_maker_programs` | 1 |
| `publicPostGetMakerProgramScores` | POST | `get_maker_program_scores` | 1 |

## private

**Base URL**: `https://api.lyra.finance/private`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostGetAccount` | POST | `get_account` | 1 |
| `privatePostCreateSubaccount` | POST | `create_subaccount` | 1 |
| `privatePostGetSubaccount` | POST | `get_subaccount` | 1 |
| `privatePostGetSubaccounts` | POST | `get_subaccounts` | 1 |
| `privatePostGetAllPortfolios` | POST | `get_all_portfolios` | 1 |
| `privatePostChangeSubaccountLabel` | POST | `change_subaccount_label` | 1 |
| `privatePostGetNotificationsv` | POST | `get_notificationsv` | 1 |
| `privatePostUpdateNotifications` | POST | `update_notifications` | 1 |
| `privatePostDeposit` | POST | `deposit` | 1 |
| `privatePostWithdraw` | POST | `withdraw` | 1 |
| `privatePostTransferErc20` | POST | `transfer_erc20` | 1 |
| `privatePostTransferPosition` | POST | `transfer_position` | 1 |
| `privatePostTransferPositions` | POST | `transfer_positions` | 1 |
| `privatePostOrder` | POST | `order` | 1 |
| `privatePostReplace` | POST | `replace` | 1 |
| `privatePostOrderDebug` | POST | `order_debug` | 1 |
| `privatePostGetOrder` | POST | `get_order` | 1 |
| `privatePostGetOrders` | POST | `get_orders` | 1 |
| `privatePostGetOpenOrders` | POST | `get_open_orders` | 1 |
| `privatePostCancel` | POST | `cancel` | 1 |
| `privatePostCancelByLabel` | POST | `cancel_by_label` | 1 |
| `privatePostCancelByNonce` | POST | `cancel_by_nonce` | 1 |
| `privatePostCancelByInstrument` | POST | `cancel_by_instrument` | 1 |
| `privatePostCancelAll` | POST | `cancel_all` | 1 |
| `privatePostCancelTriggerOrder` | POST | `cancel_trigger_order` | 1 |
| `privatePostGetOrderHistory` | POST | `get_order_history` | 1 |
| `privatePostGetTradeHistory` | POST | `get_trade_history` | 1 |
| `privatePostGetDepositHistory` | POST | `get_deposit_history` | 1 |
| `privatePostGetWithdrawalHistory` | POST | `get_withdrawal_history` | 1 |
| `privatePostSendRfq` | POST | `send_rfq` | 1 |
| `privatePostCancelRfq` | POST | `cancel_rfq` | 1 |
| `privatePostCancelBatchRfqs` | POST | `cancel_batch_rfqs` | 1 |
| `privatePostGetRfqs` | POST | `get_rfqs` | 1 |
| `privatePostPollRfqs` | POST | `poll_rfqs` | 1 |
| `privatePostSendQuote` | POST | `send_quote` | 1 |
| `privatePostCancelQuote` | POST | `cancel_quote` | 1 |
| `privatePostCancelBatchQuotes` | POST | `cancel_batch_quotes` | 1 |
| `privatePostGetQuotes` | POST | `get_quotes` | 1 |
| `privatePostPollQuotes` | POST | `poll_quotes` | 1 |
| `privatePostExecuteQuote` | POST | `execute_quote` | 1 |
| `privatePostRfqGetBestQuote` | POST | `rfq_get_best_quote` | 1 |
| `privatePostGetMargin` | POST | `get_margin` | 1 |
| `privatePostGetCollaterals` | POST | `get_collaterals` | 1 |
| `privatePostGetPositions` | POST | `get_positions` | 1 |
| `privatePostGetOptionSettlementHistory` | POST | `get_option_settlement_history` | 1 |
| `privatePostGetSubaccountValueHistory` | POST | `get_subaccount_value_history` | 1 |
| `privatePostExpiredAndCancelledHistory` | POST | `expired_and_cancelled_history` | 1 |
| `privatePostGetFundingHistory` | POST | `get_funding_history` | 1 |
| `privatePostGetInterestHistory` | POST | `get_interest_history` | 1 |
| `privatePostGetErc20TransferHistory` | POST | `get_erc20_transfer_history` | 1 |
| `privatePostGetLiquidationHistory` | POST | `get_liquidation_history` | 1 |
| `privatePostLiquidate` | POST | `liquidate` | 1 |
| `privatePostGetLiquidatorHistory` | POST | `get_liquidator_history` | 1 |
| `privatePostSessionKeys` | POST | `session_keys` | 1 |
| `privatePostEditSessionKey` | POST | `edit_session_key` | 1 |
| `privatePostRegisterScopedSessionKey` | POST | `register_scoped_session_key` | 1 |
| `privatePostGetMmpConfig` | POST | `get_mmp_config` | 1 |
| `privatePostSetMmpConfig` | POST | `set_mmp_config` | 1 |
| `privatePostResetMmp` | POST | `reset_mmp` | 1 |
| `privatePostSetCancelOnDisconnect` | POST | `set_cancel_on_disconnect` | 1 |
| `privatePostGetInviteCode` | POST | `get_invite_code` | 1 |
| `privatePostRegisterInvite` | POST | `register_invite` | 1 |

