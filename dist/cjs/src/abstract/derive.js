'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetGetAllCurrencies(params = {}) {
        return this.request('get_all_currencies', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostDecodeAction(params = {}) {
        return this.request('decode_action', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetWalletsFromSessionKey(params = {}) {
        return this.request('get_wallets_from_session_key', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetAllCurrencies(params = {}) {
        return this.request('get_all_currencies', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetCurrency(params = {}) {
        return this.request('get_currency', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetRiskUniverses(params = {}) {
        return this.request('get_risk_universes', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetInstrument(params = {}) {
        return this.request('get_instrument', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetAllInstruments(params = {}) {
        return this.request('get_all_instruments', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetAllLiveInstruments(params = {}) {
        return this.request('get_all_live_instruments', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetTicker(params = {}) {
        return this.request('get_ticker', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetTickers(params = {}) {
        return this.request('get_tickers', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetLatestSignedFeeds(params = {}) {
        return this.request('get_latest_signed_feeds', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetOptionSettlementPrices(params = {}) {
        return this.request('get_option_settlement_prices', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetIndexChartData(params = {}) {
        return this.request('get_index_chart_data', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetTradingviewChartData(params = {}) {
        return this.request('get_tradingview_chart_data', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetFundingRateHistory(params = {}) {
        return this.request('get_funding_rate_history', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetTradeHistory(params = {}) {
        return this.request('get_trade_history', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetLiquidationHistory(params = {}) {
        return this.request('get_liquidation_history', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetInterestRateHistory(params = {}) {
        return this.request('get_interest_rate_history', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetTransaction(params = {}) {
        return this.request('get_transaction', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetOnchainActionHistory(params = {}) {
        return this.request('get_onchain_action_history', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetPendingDeposits(params = {}) {
        return this.request('get_pending_deposits', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostRegisterDepositAddress(params = {}) {
        return this.request('register_deposit_address', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetMargin(params = {}) {
        return this.request('get_margin', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostMarginWatch(params = {}) {
        return this.request('margin_watch', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostOrderQuote(params = {}) {
        return this.request('order_quote', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetLiveAuctions(params = {}) {
        return this.request('get_live_auctions', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostStartAuction(params = {}) {
        return this.request('start_auction', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetVault(params = {}) {
        return this.request('get_vault', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetVaults(params = {}) {
        return this.request('get_vaults', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetVaultActionHistory(params = {}) {
        return this.request('get_vault_action_history', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetVaultPerformanceHistory(params = {}) {
        return this.request('get_vault_performance_history', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostSetSocializationFeedData(params = {}) {
        return this.request('set_socialization_feed_data', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostWithdrawDebug(params = {}) {
        return this.request('withdraw_debug', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostSendQuoteDebug(params = {}) {
        return this.request('send_quote_debug', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostExecuteQuoteDebug(params = {}) {
        return this.request('execute_quote_debug', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetAllReferralCodes(params = {}) {
        return this.request('get_all_referral_codes', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetReferralPerformance(params = {}) {
        return this.request('get_referral_performance', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetTime(params = {}) {
        return this.request('get_time', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetLiveIncidents(params = {}) {
        return this.request('get_live_incidents', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetMakerPrograms(params = {}) {
        return this.request('get_maker_programs', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostGetMakerProgramScores(params = {}) {
        return this.request('get_maker_program_scores', ['public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetAccount(params = {}) {
        return this.request('get_account', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetSubaccount(params = {}) {
        return this.request('get_subaccount', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetSubaccounts(params = {}) {
        return this.request('get_subaccounts', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostDeleteSubaccount(params = {}) {
        return this.request('delete_subaccount', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetAllPortfolios(params = {}) {
        return this.request('get_all_portfolios', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostChangeSubaccountLabel(params = {}) {
        return this.request('change_subaccount_label', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWithdraw(params = {}) {
        return this.request('withdraw', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTransferSpot(params = {}) {
        return this.request('transfer_spot', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTransferSpotExternal(params = {}) {
        return this.request('transfer_spot_external', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTransferPositions(params = {}) {
        return this.request('transfer_positions', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRejectDepositRequest(params = {}) {
        return this.request('reject_deposit_request', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUpdateWhitelistedRecipients(params = {}) {
        return this.request('update_whitelisted_recipients', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrder(params = {}) {
        return this.request('order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostReplace(params = {}) {
        return this.request('replace', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrderDebug(params = {}) {
        return this.request('order_debug', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetOrder(params = {}) {
        return this.request('get_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetOpenOrders(params = {}) {
        return this.request('get_open_orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetTriggerOrders(params = {}) {
        return this.request('get_trigger_orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetAlgoOrders(params = {}) {
        return this.request('get_algo_orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancel(params = {}) {
        return this.request('cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelByLabel(params = {}) {
        return this.request('cancel_by_label', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelByNonce(params = {}) {
        return this.request('cancel_by_nonce', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelByInstrument(params = {}) {
        return this.request('cancel_by_instrument', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelAll(params = {}) {
        return this.request('cancel_all', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelTriggerOrder(params = {}) {
        return this.request('cancel_trigger_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelAlgoOrder(params = {}) {
        return this.request('cancel_algo_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelAllAlgoOrders(params = {}) {
        return this.request('cancel_all_algo_orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelAllTriggerOrders(params = {}) {
        return this.request('cancel_all_trigger_orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetOrderHistory(params = {}) {
        return this.request('get_order_history', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetTradeHistory(params = {}) {
        return this.request('get_trade_history', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetDepositHistory(params = {}) {
        return this.request('get_deposit_history', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetWithdrawalHistory(params = {}) {
        return this.request('get_withdrawal_history', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSendRfq(params = {}) {
        return this.request('send_rfq', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelRfq(params = {}) {
        return this.request('cancel_rfq', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelBatchRfqs(params = {}) {
        return this.request('cancel_batch_rfqs', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetRfqs(params = {}) {
        return this.request('get_rfqs', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPollRfqs(params = {}) {
        return this.request('poll_rfqs', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSendQuote(params = {}) {
        return this.request('send_quote', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelQuote(params = {}) {
        return this.request('cancel_quote', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelBatchQuotes(params = {}) {
        return this.request('cancel_batch_quotes', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetQuotes(params = {}) {
        return this.request('get_quotes', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPollQuotes(params = {}) {
        return this.request('poll_quotes', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostExecuteQuote(params = {}) {
        return this.request('execute_quote', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrderQuote(params = {}) {
        return this.request('order_quote', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostReplaceQuote(params = {}) {
        return this.request('replace_quote', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRfqGetBestQuote(params = {}) {
        return this.request('rfq_get_best_quote', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetMargin(params = {}) {
        return this.request('get_margin', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetCollaterals(params = {}) {
        return this.request('get_collaterals', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetPositions(params = {}) {
        return this.request('get_positions', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetOptionSettlementHistory(params = {}) {
        return this.request('get_option_settlement_history', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetSubaccountValueHistory(params = {}) {
        return this.request('get_subaccount_value_history', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetFundingHistory(params = {}) {
        return this.request('get_funding_history', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetInterestHistory(params = {}) {
        return this.request('get_interest_history', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetErc20TransferHistory(params = {}) {
        return this.request('get_erc20_transfer_history', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetLiquidationHistory(params = {}) {
        return this.request('get_liquidation_history', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostLiquidate(params = {}) {
        return this.request('liquidate', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSessionKeys(params = {}) {
        return this.request('session_keys', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSetSessionKey(params = {}) {
        return this.request('set_session_key', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEditSessionKey(params = {}) {
        return this.request('edit_session_key', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetMmpConfig(params = {}) {
        return this.request('get_mmp_config', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSetMmpConfig(params = {}) {
        return this.request('set_mmp_config', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostResetMmp(params = {}) {
        return this.request('reset_mmp', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCreateVault(params = {}) {
        return this.request('create_vault', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUpdateVaultInfo(params = {}) {
        return this.request('update_vault_info', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostMintVaultShares(params = {}) {
        return this.request('mint_vault_shares', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBurnVaultShares(params = {}) {
        return this.request('burn_vault_shares', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostForceBurn(params = {}) {
        return this.request('force_burn', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRequestVaultDeposit(params = {}) {
        return this.request('request_vault_deposit', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostRequestVaultWithdraw(params = {}) {
        return this.request('request_vault_withdraw', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelAllVaultRequests(params = {}) {
        return this.request('cancel_all_vault_requests', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetVaultShares(params = {}) {
        return this.request('get_vault_shares', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetCuratedVaults(params = {}) {
        return this.request('get_curated_vaults', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetShareholderVaults(params = {}) {
        return this.request('get_shareholder_vaults', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetLiveMintRequests(params = {}) {
        return this.request('get_live_mint_requests', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetLiveBurnRequests(params = {}) {
        return this.request('get_live_burn_requests', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetLiveVaultRequests(params = {}) {
        return this.request('get_live_vault_requests', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGetVaultRequestHistory(params = {}) {
        return this.request('get_vault_request_history', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
