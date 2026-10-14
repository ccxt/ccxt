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

📚 **Official derive API documentation:** [docs.derive.xyz](https://docs.derive.xyz/)

> 119 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://api.derive.xyz/v3/public`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetGetAllCurrencies` | GET | `get_all_currencies` | 1 |
| `publicPostDecodeAction` | POST | `decode_action` | 1 |
| `publicPostGetWalletsFromSessionKey` | POST | `get_wallets_from_session_key` | 1 |
| `publicPostGetAllCurrencies` | POST | `get_all_currencies` | 1 |
| `publicPostGetCurrency` | POST | `get_currency` | 1 |
| `publicPostGetRiskUniverses` | POST | `get_risk_universes` | 1 |
| `publicPostGetInstrument` | POST | `get_instrument` | 1 |
| `publicPostGetAllInstruments` | POST | `get_all_instruments` | 1 |
| `publicPostGetAllLiveInstruments` | POST | `get_all_live_instruments` | 1 |
| `publicPostGetTicker` | POST | `get_ticker` | 1 |
| `publicPostGetTickers` | POST | `get_tickers` | 1 |
| `publicPostGetLatestSignedFeeds` | POST | `get_latest_signed_feeds` | 1 |
| `publicPostGetOptionSettlementPrices` | POST | `get_option_settlement_prices` | 1 |
| `publicPostGetIndexChartData` | POST | `get_index_chart_data` | 1 |
| `publicPostGetTradingviewChartData` | POST | `get_tradingview_chart_data` | 1 |
| `publicPostGetFundingRateHistory` | POST | `get_funding_rate_history` | 1 |
| `publicPostGetTradeHistory` | POST | `get_trade_history` | 1 |
| `publicPostGetLiquidationHistory` | POST | `get_liquidation_history` | 1 |
| `publicPostGetInterestRateHistory` | POST | `get_interest_rate_history` | 1 |
| `publicPostGetTransaction` | POST | `get_transaction` | 1 |
| `publicPostGetOnchainActionHistory` | POST | `get_onchain_action_history` | 1 |
| `publicPostGetPendingDeposits` | POST | `get_pending_deposits` | 1 |
| `publicPostRegisterDepositAddress` | POST | `register_deposit_address` | 1 |
| `publicPostGetMargin` | POST | `get_margin` | 1 |
| `publicPostMarginWatch` | POST | `margin_watch` | 1 |
| `publicPostOrderQuote` | POST | `order_quote` | 1 |
| `publicPostGetLiveAuctions` | POST | `get_live_auctions` | 1 |
| `publicPostStartAuction` | POST | `start_auction` | 1 |
| `publicPostGetVault` | POST | `get_vault` | 1 |
| `publicPostGetVaults` | POST | `get_vaults` | 1 |
| `publicPostGetVaultActionHistory` | POST | `get_vault_action_history` | 1 |
| `publicPostGetVaultPerformanceHistory` | POST | `get_vault_performance_history` | 1 |
| `publicPostSetSocializationFeedData` | POST | `set_socialization_feed_data` | 1 |
| `publicPostWithdrawDebug` | POST | `withdraw_debug` | 1 |
| `publicPostSendQuoteDebug` | POST | `send_quote_debug` | 1 |
| `publicPostExecuteQuoteDebug` | POST | `execute_quote_debug` | 1 |
| `publicPostGetAllReferralCodes` | POST | `get_all_referral_codes` | 1 |
| `publicPostGetReferralPerformance` | POST | `get_referral_performance` | 1 |
| `publicPostGetTime` | POST | `get_time` | 1 |
| `publicPostGetLiveIncidents` | POST | `get_live_incidents` | 1 |
| `publicPostGetMakerPrograms` | POST | `get_maker_programs` | 1 |
| `publicPostGetMakerProgramScores` | POST | `get_maker_program_scores` | 1 |

## private

**Base URL**: `https://api.derive.xyz/v3/private`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privatePostGetAccount` | POST | `get_account` | 1 |
| `privatePostGetSubaccount` | POST | `get_subaccount` | 1 |
| `privatePostGetSubaccounts` | POST | `get_subaccounts` | 1 |
| `privatePostDeleteSubaccount` | POST | `delete_subaccount` | 1 |
| `privatePostGetAllPortfolios` | POST | `get_all_portfolios` | 1 |
| `privatePostChangeSubaccountLabel` | POST | `change_subaccount_label` | 1 |
| `privatePostWithdraw` | POST | `withdraw` | 1 |
| `privatePostTransferSpot` | POST | `transfer_spot` | 1 |
| `privatePostTransferSpotExternal` | POST | `transfer_spot_external` | 1 |
| `privatePostTransferPositions` | POST | `transfer_positions` | 1 |
| `privatePostRejectDepositRequest` | POST | `reject_deposit_request` | 1 |
| `privatePostUpdateWhitelistedRecipients` | POST | `update_whitelisted_recipients` | 1 |
| `privatePostOrder` | POST | `order` | 1 |
| `privatePostReplace` | POST | `replace` | 1 |
| `privatePostOrderDebug` | POST | `order_debug` | 1 |
| `privatePostGetOrder` | POST | `get_order` | 1 |
| `privatePostGetOpenOrders` | POST | `get_open_orders` | 1 |
| `privatePostGetTriggerOrders` | POST | `get_trigger_orders` | 1 |
| `privatePostGetAlgoOrders` | POST | `get_algo_orders` | 1 |
| `privatePostCancel` | POST | `cancel` | 1 |
| `privatePostCancelByLabel` | POST | `cancel_by_label` | 1 |
| `privatePostCancelByNonce` | POST | `cancel_by_nonce` | 1 |
| `privatePostCancelByInstrument` | POST | `cancel_by_instrument` | 1 |
| `privatePostCancelAll` | POST | `cancel_all` | 1 |
| `privatePostCancelTriggerOrder` | POST | `cancel_trigger_order` | 1 |
| `privatePostCancelAlgoOrder` | POST | `cancel_algo_order` | 1 |
| `privatePostCancelAllAlgoOrders` | POST | `cancel_all_algo_orders` | 1 |
| `privatePostCancelAllTriggerOrders` | POST | `cancel_all_trigger_orders` | 1 |
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
| `privatePostOrderQuote` | POST | `order_quote` | 1 |
| `privatePostReplaceQuote` | POST | `replace_quote` | 1 |
| `privatePostRfqGetBestQuote` | POST | `rfq_get_best_quote` | 1 |
| `privatePostGetMargin` | POST | `get_margin` | 1 |
| `privatePostGetCollaterals` | POST | `get_collaterals` | 1 |
| `privatePostGetPositions` | POST | `get_positions` | 1 |
| `privatePostGetOptionSettlementHistory` | POST | `get_option_settlement_history` | 1 |
| `privatePostGetSubaccountValueHistory` | POST | `get_subaccount_value_history` | 1 |
| `privatePostGetFundingHistory` | POST | `get_funding_history` | 1 |
| `privatePostGetInterestHistory` | POST | `get_interest_history` | 1 |
| `privatePostGetErc20TransferHistory` | POST | `get_erc20_transfer_history` | 1 |
| `privatePostGetLiquidationHistory` | POST | `get_liquidation_history` | 1 |
| `privatePostLiquidate` | POST | `liquidate` | 1 |
| `privatePostSessionKeys` | POST | `session_keys` | 1 |
| `privatePostSetSessionKey` | POST | `set_session_key` | 1 |
| `privatePostEditSessionKey` | POST | `edit_session_key` | 1 |
| `privatePostGetMmpConfig` | POST | `get_mmp_config` | 1 |
| `privatePostSetMmpConfig` | POST | `set_mmp_config` | 1 |
| `privatePostResetMmp` | POST | `reset_mmp` | 1 |
| `privatePostCreateVault` | POST | `create_vault` | 1 |
| `privatePostUpdateVaultInfo` | POST | `update_vault_info` | 1 |
| `privatePostMintVaultShares` | POST | `mint_vault_shares` | 1 |
| `privatePostBurnVaultShares` | POST | `burn_vault_shares` | 1 |
| `privatePostForceBurn` | POST | `force_burn` | 1 |
| `privatePostRequestVaultDeposit` | POST | `request_vault_deposit` | 1 |
| `privatePostRequestVaultWithdraw` | POST | `request_vault_withdraw` | 1 |
| `privatePostCancelAllVaultRequests` | POST | `cancel_all_vault_requests` | 1 |
| `privatePostGetVaultShares` | POST | `get_vault_shares` | 1 |
| `privatePostGetCuratedVaults` | POST | `get_curated_vaults` | 1 |
| `privatePostGetShareholderVaults` | POST | `get_shareholder_vaults` | 1 |
| `privatePostGetLiveMintRequests` | POST | `get_live_mint_requests` | 1 |
| `privatePostGetLiveBurnRequests` | POST | `get_live_burn_requests` | 1 |
| `privatePostGetLiveVaultRequests` | POST | `get_live_vault_requests` | 1 |
| `privatePostGetVaultRequestHistory` | POST | `get_vault_request_history` | 1 |

