'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetGetAllCurrencies(params = {}) {
        return this.request("get_all_currencies", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicPostBuildRegisterSessionKeyTx(params = {}) {
        return this.request("build_register_session_key_tx", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostRegisterSessionKey(params = {}) {
        return this.request("register_session_key", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostDeregisterSessionKey(params = {}) {
        return this.request("deregister_session_key", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetWalletsFromSessionKey(params = {}) {
        return this.request("get_wallets_from_session_key", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostLogin(params = {}) {
        return this.request("login", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostStatistics(params = {}) {
        return this.request("statistics", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostAllStatistics(params = {}) {
        return this.request("all_statistics", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostUserStatistics(params = {}) {
        return this.request("user_statistics", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostAllUserStatistics(params = {}) {
        return this.request("all_user_statistics", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetAllCurrencies(params = {}) {
        return this.request("get_all_currencies", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetCurrency(params = {}) {
        return this.request("get_currency", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetAsset(params = {}) {
        return this.request("get_asset", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetAssets(params = {}) {
        return this.request("get_assets", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetInstrument(params = {}) {
        return this.request("get_instrument", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetAllInstruments(params = {}) {
        return this.request("get_all_instruments", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetInstruments(params = {}) {
        return this.request("get_instruments", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetTicker(params = {}) {
        return this.request("get_ticker", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetTickers(params = {}) {
        return this.request("get_tickers", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetLatestSignedFeeds(params = {}) {
        return this.request("get_latest_signed_feeds", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetOptionSettlementPrices(params = {}) {
        return this.request("get_option_settlement_prices", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetSpotFeedHistory(params = {}) {
        return this.request("get_spot_feed_history", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetSpotFeedHistoryCandles(params = {}) {
        return this.request("get_spot_feed_history_candles", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetIndexChartData(params = {}) {
        return this.request("get_index_chart_data", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetTradingviewChartData(params = {}) {
        return this.request("get_tradingview_chart_data", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetFundingRateHistory(params = {}) {
        return this.request("get_funding_rate_history", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetTradeHistory(params = {}) {
        return this.request("get_trade_history", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetOptionSettlementHistory(params = {}) {
        return this.request("get_option_settlement_history", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetLiquidationHistory(params = {}) {
        return this.request("get_liquidation_history", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetInterestRateHistory(params = {}) {
        return this.request("get_interest_rate_history", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetPerpImpactTwap(params = {}) {
        return this.request("get_perp_impact_twap", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetTransaction(params = {}) {
        return this.request("get_transaction", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetMargin(params = {}) {
        return this.request("get_margin", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostMarginWatch(params = {}) {
        return this.request("margin_watch", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostOrderQuote(params = {}) {
        return this.request("order_quote", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostValidateInviteCode(params = {}) {
        return this.request("validate_invite_code", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetPoints(params = {}) {
        return this.request("get_points", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetAllPoints(params = {}) {
        return this.request("get_all_points", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetPointsLeaderboard(params = {}) {
        return this.request("get_points_leaderboard", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetDescendantTree(params = {}) {
        return this.request("get_descendant_tree", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetTreeRoots(params = {}) {
        return this.request("get_tree_roots", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetSwellPercentPoints(params = {}) {
        return this.request("get_swell_percent_points", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetStdrvSnapshots(params = {}) {
        return this.request("get_stdrv_snapshots", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetVaultAssets(params = {}) {
        return this.request("get_vault_assets", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetEtherfiEffectiveBalances(params = {}) {
        return this.request("get_etherfi_effective_balances", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetKelpEffectiveBalances(params = {}) {
        return this.request("get_kelp_effective_balances", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetBridgeBalances(params = {}) {
        return this.request("get_bridge_balances", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetEthenaParticipants(params = {}) {
        return this.request("get_ethena_participants", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetVaultShare(params = {}) {
        return this.request("get_vault_share", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetVaultStatistics(params = {}) {
        return this.request("get_vault_statistics", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetVaultBalances(params = {}) {
        return this.request("get_vault_balances", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetVaultPools(params = {}) {
        return this.request("get_vault_pools", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetVaultRates(params = {}) {
        return this.request("get_vault_rates", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostEstimateIntegratorPoints(params = {}) {
        return this.request("estimate_integrator_points", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostCreateSubaccountDebug(params = {}) {
        return this.request("create_subaccount_debug", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostCreateAccountWithSecret(params = {}) {
        return this.request("create_account_with_secret", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostDepositDebug(params = {}) {
        return this.request("deposit_debug", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostWithdrawDebug(params = {}) {
        return this.request("withdraw_debug", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostSendQuoteDebug(params = {}) {
        return this.request("send_quote_debug", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostExecuteQuoteDebug(params = {}) {
        return this.request("execute_quote_debug", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetInviteCode(params = {}) {
        return this.request("get_invite_code", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostRegisterInvite(params = {}) {
        return this.request("register_invite", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetAllReferralCodes(params = {}) {
        return this.request("get_all_referral_codes", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetReferralPerformance(params = {}) {
        return this.request("get_referral_performance", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetTime(params = {}) {
        return this.request("get_time", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetLiveIncidents(params = {}) {
        return this.request("get_live_incidents", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetMakerPrograms(params = {}) {
        return this.request("get_maker_programs", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetMakerProgramScores(params = {}) {
        return this.request("get_maker_program_scores", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetDetailedMakerSnapshotHistory(params = {}) {
        return this.request("get_detailed_maker_snapshot_history", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetRateLimits(params = {}) {
        return this.request("getRateLimits", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetAccount(params = {}) {
        return this.request("get_account", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCreateSubaccount(params = {}) {
        return this.request("create_subaccount", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetSubaccount(params = {}) {
        return this.request("get_subaccount", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetSubaccounts(params = {}) {
        return this.request("get_subaccounts", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetAllPortfolios(params = {}) {
        return this.request("get_all_portfolios", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostChangeSubaccountLabel(params = {}) {
        return this.request("change_subaccount_label", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetNotificationsv(params = {}) {
        return this.request("get_notificationsv", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetNotifications(params = {}) {
        return this.request("get_notifications", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostUpdateNotifications(params = {}) {
        return this.request("update_notifications", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostDeposit(params = {}) {
        return this.request("deposit", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostWithdraw(params = {}) {
        return this.request("withdraw", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostTransferErc20(params = {}) {
        return this.request("transfer_erc20", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostTransferPosition(params = {}) {
        return this.request("transfer_position", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostTransferPositions(params = {}) {
        return this.request("transfer_positions", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOrder(params = {}) {
        return this.request("order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostReplace(params = {}) {
        return this.request("replace", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOrderDebug(params = {}) {
        return this.request("order_debug", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetOrder(params = {}) {
        return this.request("get_order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetOrders(params = {}) {
        return this.request("get_orders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetOpenOrders(params = {}) {
        return this.request("get_open_orders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetTriggerOrders(params = {}) {
        return this.request("get_trigger_orders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetAlgoOrders(params = {}) {
        return this.request("get_algo_orders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancel(params = {}) {
        return this.request("cancel", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelByLabel(params = {}) {
        return this.request("cancel_by_label", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelByNonce(params = {}) {
        return this.request("cancel_by_nonce", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelByInstrument(params = {}) {
        return this.request("cancel_by_instrument", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelAll(params = {}) {
        return this.request("cancel_all", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelTriggerOrder(params = {}) {
        return this.request("cancel_trigger_order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelAlgoOrder(params = {}) {
        return this.request("cancel_algo_order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelAllAlgoOrders(params = {}) {
        return this.request("cancel_all_algo_orders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelAllTriggerOrders(params = {}) {
        return this.request("cancel_all_trigger_orders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetOrderHistory(params = {}) {
        return this.request("get_order_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetTradeHistory(params = {}) {
        return this.request("get_trade_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetDepositHistory(params = {}) {
        return this.request("get_deposit_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetWithdrawalHistory(params = {}) {
        return this.request("get_withdrawal_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostSendRfq(params = {}) {
        return this.request("send_rfq", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelRfq(params = {}) {
        return this.request("cancel_rfq", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelBatchRfqs(params = {}) {
        return this.request("cancel_batch_rfqs", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetRfqs(params = {}) {
        return this.request("get_rfqs", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostPollRfqs(params = {}) {
        return this.request("poll_rfqs", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostSendQuote(params = {}) {
        return this.request("send_quote", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelQuote(params = {}) {
        return this.request("cancel_quote", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelBatchQuotes(params = {}) {
        return this.request("cancel_batch_quotes", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetQuotes(params = {}) {
        return this.request("get_quotes", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostPollQuotes(params = {}) {
        return this.request("poll_quotes", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostExecuteQuote(params = {}) {
        return this.request("execute_quote", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOrderQuote(params = {}) {
        return this.request("order_quote", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostReplaceQuote(params = {}) {
        return this.request("replace_quote", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostRfqGetBestQuote(params = {}) {
        return this.request("rfq_get_best_quote", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetMargin(params = {}) {
        return this.request("get_margin", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetCollaterals(params = {}) {
        return this.request("get_collaterals", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetPositions(params = {}) {
        return this.request("get_positions", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetOptionSettlementHistory(params = {}) {
        return this.request("get_option_settlement_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetSubaccountValueHistory(params = {}) {
        return this.request("get_subaccount_value_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostExpiredAndCancelledHistory(params = {}) {
        return this.request("expired_and_cancelled_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetFundingHistory(params = {}) {
        return this.request("get_funding_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetInterestHistory(params = {}) {
        return this.request("get_interest_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetErc20TransferHistory(params = {}) {
        return this.request("get_erc20_transfer_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetLiquidationHistory(params = {}) {
        return this.request("get_liquidation_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostLiquidate(params = {}) {
        return this.request("liquidate", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetLiquidatorHistory(params = {}) {
        return this.request("get_liquidator_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostSessionKeys(params = {}) {
        return this.request("session_keys", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostEditSessionKey(params = {}) {
        return this.request("edit_session_key", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostChangeSessionKeyLabel(params = {}) {
        return this.request("change_session_key_label", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostRegisterScopedSessionKey(params = {}) {
        return this.request("register_scoped_session_key", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetMmpConfig(params = {}) {
        return this.request("get_mmp_config", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostSetMmpConfig(params = {}) {
        return this.request("set_mmp_config", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostResetMmp(params = {}) {
        return this.request("reset_mmp", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostSetCancelOnDisconnect(params = {}) {
        return this.request("set_cancel_on_disconnect", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetInviteCode(params = {}) {
        return this.request("get_invite_code", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostRegisterInvite(params = {}) {
        return this.request("register_invite", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetContactInfo(params = {}) {
        return this.request("get_contact_info", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCreateContactInfo(params = {}) {
        return this.request("create_contact_info", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostUpdateContactInfo(params = {}) {
        return this.request("update_contact_info", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostDeleteContactInfo(params = {}) {
        return this.request("delete_contact_info", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
}

exports["default"] = Exchange;
