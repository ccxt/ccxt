Every endpoint in `derive`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/derive) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetGetAllCurrencies`); the snake_case alias (`public_get_get_all_currencies`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetGetAllCurrencies`). Switch tabs for the call in each language:

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
| `publicGetGetAllCurrencies` | GET | `get_all_currencies` |  |
| `publicPostBuildRegisterSessionKeyTx` | POST | `build_register_session_key_tx` |  |
| `publicPostRegisterSessionKey` | POST | `register_session_key` |  |
| `publicPostDeregisterSessionKey` | POST | `deregister_session_key` |  |
| `publicPostLogin` | POST | `login` |  |
| `publicPostStatistics` | POST | `statistics` |  |
| `publicPostGetAllCurrencies` | POST | `get_all_currencies` |  |
| `publicPostGetCurrency` | POST | `get_currency` |  |
| `publicPostGetInstrument` | POST | `get_instrument` |  |
| `publicPostGetAllInstruments` | POST | `get_all_instruments` |  |
| `publicPostGetInstruments` | POST | `get_instruments` |  |
| `publicPostGetTicker` | POST | `get_ticker` |  |
| `publicPostGetLatestSignedFeeds` | POST | `get_latest_signed_feeds` |  |
| `publicPostGetOptionSettlementPrices` | POST | `get_option_settlement_prices` |  |
| `publicPostGetSpotFeedHistory` | POST | `get_spot_feed_history` |  |
| `publicPostGetSpotFeedHistoryCandles` | POST | `get_spot_feed_history_candles` |  |
| `publicPostGetFundingRateHistory` | POST | `get_funding_rate_history` |  |
| `publicPostGetTradeHistory` | POST | `get_trade_history` |  |
| `publicPostGetOptionSettlementHistory` | POST | `get_option_settlement_history` |  |
| `publicPostGetLiquidationHistory` | POST | `get_liquidation_history` |  |
| `publicPostGetInterestRateHistory` | POST | `get_interest_rate_history` |  |
| `publicPostGetTransaction` | POST | `get_transaction` |  |
| `publicPostGetMargin` | POST | `get_margin` |  |
| `publicPostMarginWatch` | POST | `margin_watch` |  |
| `publicPostValidateInviteCode` | POST | `validate_invite_code` |  |
| `publicPostGetPoints` | POST | `get_points` |  |
| `publicPostGetAllPoints` | POST | `get_all_points` |  |
| `publicPostGetPointsLeaderboard` | POST | `get_points_leaderboard` |  |
| `publicPostGetDescendantTree` | POST | `get_descendant_tree` |  |
| `publicPostGetTreeRoots` | POST | `get_tree_roots` |  |
| `publicPostGetSwellPercentPoints` | POST | `get_swell_percent_points` |  |
| `publicPostGetVaultAssets` | POST | `get_vault_assets` |  |
| `publicPostGetEtherfiEffectiveBalances` | POST | `get_etherfi_effective_balances` |  |
| `publicPostGetKelpEffectiveBalances` | POST | `get_kelp_effective_balances` |  |
| `publicPostGetBridgeBalances` | POST | `get_bridge_balances` |  |
| `publicPostGetEthenaParticipants` | POST | `get_ethena_participants` |  |
| `publicPostGetVaultShare` | POST | `get_vault_share` |  |
| `publicPostGetVaultStatistics` | POST | `get_vault_statistics` |  |
| `publicPostGetVaultBalances` | POST | `get_vault_balances` |  |
| `publicPostEstimateIntegratorPoints` | POST | `estimate_integrator_points` |  |
| `publicPostCreateSubaccountDebug` | POST | `create_subaccount_debug` |  |
| `publicPostDepositDebug` | POST | `deposit_debug` |  |
| `publicPostWithdrawDebug` | POST | `withdraw_debug` |  |
| `publicPostSendQuoteDebug` | POST | `send_quote_debug` |  |
| `publicPostExecuteQuoteDebug` | POST | `execute_quote_debug` |  |
| `publicPostGetInviteCode` | POST | `get_invite_code` |  |
| `publicPostRegisterInvite` | POST | `register_invite` |  |
| `publicPostGetTime` | POST | `get_time` |  |
| `publicPostGetLiveIncidents` | POST | `get_live_incidents` |  |
| `publicPostGetMakerPrograms` | POST | `get_maker_programs` |  |
| `publicPostGetMakerProgramScores` | POST | `get_maker_program_scores` |  |

## private

**Base URL**: `https://api.lyra.finance/private`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostGetAccount` | POST | `get_account` |  |
| `privatePostCreateSubaccount` | POST | `create_subaccount` |  |
| `privatePostGetSubaccount` | POST | `get_subaccount` |  |
| `privatePostGetSubaccounts` | POST | `get_subaccounts` |  |
| `privatePostGetAllPortfolios` | POST | `get_all_portfolios` |  |
| `privatePostChangeSubaccountLabel` | POST | `change_subaccount_label` |  |
| `privatePostGetNotificationsv` | POST | `get_notificationsv` |  |
| `privatePostUpdateNotifications` | POST | `update_notifications` |  |
| `privatePostDeposit` | POST | `deposit` |  |
| `privatePostWithdraw` | POST | `withdraw` |  |
| `privatePostTransferErc20` | POST | `transfer_erc20` |  |
| `privatePostTransferPosition` | POST | `transfer_position` |  |
| `privatePostTransferPositions` | POST | `transfer_positions` |  |
| `privatePostOrder` | POST | `order` |  |
| `privatePostReplace` | POST | `replace` |  |
| `privatePostOrderDebug` | POST | `order_debug` |  |
| `privatePostGetOrder` | POST | `get_order` |  |
| `privatePostGetOrders` | POST | `get_orders` |  |
| `privatePostGetOpenOrders` | POST | `get_open_orders` |  |
| `privatePostCancel` | POST | `cancel` |  |
| `privatePostCancelByLabel` | POST | `cancel_by_label` |  |
| `privatePostCancelByNonce` | POST | `cancel_by_nonce` |  |
| `privatePostCancelByInstrument` | POST | `cancel_by_instrument` |  |
| `privatePostCancelAll` | POST | `cancel_all` |  |
| `privatePostCancelTriggerOrder` | POST | `cancel_trigger_order` |  |
| `privatePostGetOrderHistory` | POST | `get_order_history` |  |
| `privatePostGetTradeHistory` | POST | `get_trade_history` |  |
| `privatePostGetDepositHistory` | POST | `get_deposit_history` |  |
| `privatePostGetWithdrawalHistory` | POST | `get_withdrawal_history` |  |
| `privatePostSendRfq` | POST | `send_rfq` |  |
| `privatePostCancelRfq` | POST | `cancel_rfq` |  |
| `privatePostCancelBatchRfqs` | POST | `cancel_batch_rfqs` |  |
| `privatePostGetRfqs` | POST | `get_rfqs` |  |
| `privatePostPollRfqs` | POST | `poll_rfqs` |  |
| `privatePostSendQuote` | POST | `send_quote` |  |
| `privatePostCancelQuote` | POST | `cancel_quote` |  |
| `privatePostCancelBatchQuotes` | POST | `cancel_batch_quotes` |  |
| `privatePostGetQuotes` | POST | `get_quotes` |  |
| `privatePostPollQuotes` | POST | `poll_quotes` |  |
| `privatePostExecuteQuote` | POST | `execute_quote` |  |
| `privatePostRfqGetBestQuote` | POST | `rfq_get_best_quote` |  |
| `privatePostGetMargin` | POST | `get_margin` |  |
| `privatePostGetCollaterals` | POST | `get_collaterals` |  |
| `privatePostGetPositions` | POST | `get_positions` |  |
| `privatePostGetOptionSettlementHistory` | POST | `get_option_settlement_history` |  |
| `privatePostGetSubaccountValueHistory` | POST | `get_subaccount_value_history` |  |
| `privatePostExpiredAndCancelledHistory` | POST | `expired_and_cancelled_history` |  |
| `privatePostGetFundingHistory` | POST | `get_funding_history` |  |
| `privatePostGetInterestHistory` | POST | `get_interest_history` |  |
| `privatePostGetErc20TransferHistory` | POST | `get_erc20_transfer_history` |  |
| `privatePostGetLiquidationHistory` | POST | `get_liquidation_history` |  |
| `privatePostLiquidate` | POST | `liquidate` |  |
| `privatePostGetLiquidatorHistory` | POST | `get_liquidator_history` |  |
| `privatePostSessionKeys` | POST | `session_keys` |  |
| `privatePostEditSessionKey` | POST | `edit_session_key` |  |
| `privatePostRegisterScopedSessionKey` | POST | `register_scoped_session_key` |  |
| `privatePostGetMmpConfig` | POST | `get_mmp_config` |  |
| `privatePostSetMmpConfig` | POST | `set_mmp_config` |  |
| `privatePostResetMmp` | POST | `reset_mmp` |  |
| `privatePostSetCancelOnDisconnect` | POST | `set_cancel_on_disconnect` |  |
| `privatePostGetInviteCode` | POST | `get_invite_code` |  |
| `privatePostRegisterInvite` | POST | `register_invite` |  |

