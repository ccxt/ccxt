'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    v1PublicGetPublicVolumeStats(params = {}) {
        return this.request('public/volume/stats', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicBrokerName(params = {}) {
        return this.request('public/broker/name', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicChainInfoBrokerId(params = {}) {
        return this.request('public/chain_info/{broker_id}', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicSystemInfo(params = {}) {
        return this.request('public/system_info', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicVaultBalance(params = {}) {
        return this.request('public/vault_balance', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicInsurancefund(params = {}) {
        return this.request('public/insurancefund', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicChainInfo(params = {}) {
        return this.request('public/chain_info', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetFaucetUsdc(params = {}) {
        return this.request('faucet/usdc', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicAccount(params = {}) {
        return this.request('public/account', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetGetAccount(params = {}) {
        return this.request('get_account', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetRegistrationNonce(params = {}) {
        return this.request('registration_nonce', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetGetOrderlyKey(params = {}) {
        return this.request('get_orderly_key', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicLiquidation(params = {}) {
        return this.request('public/liquidation', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicLiquidatedPositions(params = {}) {
        return this.request('public/liquidated_positions', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicConfig(params = {}) {
        return this.request('public/config', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicCampaignRanking(params = {}) {
        return this.request('public/campaign/ranking', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    v1PublicGetPublicCampaignStats(params = {}) {
        return this.request('public/campaign/stats', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    v1PublicGetPublicCampaignUser(params = {}) {
        return this.request('public/campaign/user', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    v1PublicGetPublicCampaignStatsDetails(params = {}) {
        return this.request('public/campaign/stats/details', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    v1PublicGetPublicCampaigns(params = {}) {
        return this.request('public/campaigns', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    v1PublicGetPublicPointsLeaderboard(params = {}) {
        return this.request('public/points/leaderboard', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetClientPoints(params = {}) {
        return this.request('client/points', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicPointsEpoch(params = {}) {
        return this.request('public/points/epoch', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicPointsEpochDates(params = {}) {
        return this.request('public/points/epoch_dates', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicPointsRankings(params = {}) {
        return this.request('public/points/rankings', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicPointsStages(params = {}) {
        return this.request('public/points/stages', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicReferralCheckRefCode(params = {}) {
        return this.request('public/referral/check_ref_code', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicReferralVerifyRefCode(params = {}) {
        return this.request('public/referral/verify_ref_code', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetReferralAdminInfo(params = {}) {
        return this.request('referral/admin_info', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetReferralInfo(params = {}) {
        return this.request('referral/info', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetReferralRefereeInfo(params = {}) {
        return this.request('referral/referee_info', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetReferralRefereeRebateSummary(params = {}) {
        return this.request('referral/referee_rebate_summary', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetReferralRefereeHistory(params = {}) {
        return this.request('referral/referee_history', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetReferralReferralHistory(params = {}) {
        return this.request('referral/referral_history', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetReferralRebateSummary(params = {}) {
        return this.request('referral/rebate_summary', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetClientDistributionHistory(params = {}) {
        return this.request('client/distribution_history', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetTvConfig(params = {}) {
        return this.request('tv/config', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetTvHistory(params = {}) {
        return this.request('tv/history', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetTvSymbolInfo(params = {}) {
        return this.request('tv/symbol_info', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetTvKlineHistory(params = {}) {
        return this.request('tv/kline_history', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicFundingRateHistory(params = {}) {
        return this.request('public/funding_rate_history', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicFundingRateSymbol(params = {}) {
        return this.request('public/funding_rate/{symbol}', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.33 });
    }
    v1PublicGetPublicFundingRates(params = {}) {
        return this.request('public/funding_rates', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicInfo(params = {}) {
        return this.request('public/info', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicInfoSymbol(params = {}) {
        return this.request('public/info/{symbol}', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicMarketTrades(params = {}) {
        return this.request('public/market_trades', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicToken(params = {}) {
        return this.request('public/token', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicFutures(params = {}) {
        return this.request('public/futures', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetPublicFuturesSymbol(params = {}) {
        return this.request('public/futures/{symbol}', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetStakingValor2BatchInfo(params = {}) {
        return this.request('staking/valor2/batch_info', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetStakingValor2PoolInfo(params = {}) {
        return this.request('staking/valor2/pool_info', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicGetStakingValor2RevenueBuyback(params = {}) {
        return this.request('staking/valor2/revenue_buyback', ['v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PublicPostRegisterAccount(params = {}) {
        return this.request('register_account', ['v1', 'public'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetClientKeyInfo(params = {}) {
        return this.request('client/key_info', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    v1PrivateGetClientOrderlyKeyIpRestriction(params = {}) {
        return this.request('client/orderly_key_ip_restriction', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    v1PrivateGetOrderOid(params = {}) {
        return this.request('order/{oid}', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetClientOrderClientOrderId(params = {}) {
        return this.request('client/order/{client_order_id}', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetAlgoOrderOid(params = {}) {
        return this.request('algo/order/{oid}', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetAlgoClientOrderClientOrderId(params = {}) {
        return this.request('algo/client/order/{client_order_id}', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetOrders(params = {}) {
        return this.request('orders', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetAlgoOrders(params = {}) {
        return this.request('algo/orders', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetTradeTid(params = {}) {
        return this.request('trade/{tid}', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetTrades(params = {}) {
        return this.request('trades', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetOrderOidTrades(params = {}) {
        return this.request('order/{oid}/trades', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetClientLiquidatorLiquidations(params = {}) {
        return this.request('client/liquidator_liquidations', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetLiquidations(params = {}) {
        return this.request('liquidations', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetAssetHistory(params = {}) {
        return this.request('asset/history', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 60 });
    }
    v1PrivateGetClientHolding(params = {}) {
        return this.request('client/holding', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetWithdrawNonce(params = {}) {
        return this.request('withdraw_nonce', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetSettleNonce(params = {}) {
        return this.request('settle_nonce', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetTransferNonce(params = {}) {
        return this.request('transfer_nonce', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetPnlSettlementHistory(params = {}) {
        return this.request('pnl_settlement/history', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetVolumeUserDaily(params = {}) {
        return this.request('volume/user/daily', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 60 });
    }
    v1PrivateGetVolumeUserStats(params = {}) {
        return this.request('volume/user/stats', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 60 });
    }
    v1PrivateGetClientStatistics(params = {}) {
        return this.request('client/statistics', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 60 });
    }
    v1PrivateGetClientInfo(params = {}) {
        return this.request('client/info', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 60 });
    }
    v1PrivateGetClientStatisticsDaily(params = {}) {
        return this.request('client/statistics/daily', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 60 });
    }
    v1PrivateGetPositions(params = {}) {
        return this.request('positions', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 3.33 });
    }
    v1PrivateGetPositionSymbol(params = {}) {
        return this.request('position/{symbol}', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 3.33 });
    }
    v1PrivateGetFundingFeeHistory(params = {}) {
        return this.request('funding_fee/history', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    v1PrivateGetNotificationInboxNotifications(params = {}) {
        return this.request('notification/inbox/notifications', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 60 });
    }
    v1PrivateGetNotificationInboxUnread(params = {}) {
        return this.request('notification/inbox/unread', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 60 });
    }
    v1PrivateGetVolumeBrokerDaily(params = {}) {
        return this.request('volume/broker/daily', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 60 });
    }
    v1PrivateGetBrokerFeeRateDefault(params = {}) {
        return this.request('broker/fee_rate/default', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivateGetBrokerUserInfo(params = {}) {
        return this.request('broker/user_info', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivateGetBrokerDailyFeeRevenue(params = {}) {
        return this.request('broker/daily_fee_revenue', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivateGetOrderbookSymbol(params = {}) {
        return this.request('orderbook/{symbol}', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetKline(params = {}) {
        return this.request('kline', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetClientMarginModes(params = {}) {
        return this.request('client/margin_modes', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetClientLeverages(params = {}) {
        return this.request('client/leverages', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetClientPointsUserStatistics(params = {}) {
        return this.request('client/points/user_statistics', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetStakingValor2Redeem(params = {}) {
        return this.request('staking/valor2/redeem', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetReferralMultiLevelAdmin(params = {}) {
        return this.request('referral/multi_level/admin', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetReferralMultiLevelAdminInfo(params = {}) {
        return this.request('referral/multi_level/admin/info', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetReferralMultiLevelAdminRefereeList(params = {}) {
        return this.request('referral/multi_level/admin/referee_list', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetReferralMultiLevelAdminSummary(params = {}) {
        return this.request('referral/multi_level/admin/summary', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetReferralMultiLevelMaxRebateRate(params = {}) {
        return this.request('referral/multi_level/max_rebate_rate', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetReferralMultiLevelRebateInfo(params = {}) {
        return this.request('referral/multi_level/rebate_info', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetReferralMultiLevelRefereeList(params = {}) {
        return this.request('referral/multi_level/referee_list', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetReferralMultiLevelStatistics(params = {}) {
        return this.request('referral/multi_level/statistics', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateGetReferralMultiLevelVolumePrerequisite(params = {}) {
        return this.request('referral/multi_level/volume_prerequisite', ['v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivatePostOrderlyKey(params = {}) {
        return this.request('orderly_key', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivatePostClientSetOrderlyKeyIpRestriction(params = {}) {
        return this.request('client/set_orderly_key_ip_restriction', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 6 });
    }
    v1PrivatePostClientResetOrderlyKeyIpRestriction(params = {}) {
        return this.request('client/reset_orderly_key_ip_restriction', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 6 });
    }
    v1PrivatePostOrder(params = {}) {
        return this.request('order', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivatePostBatchOrder(params = {}) {
        return this.request('batch-order', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostAlgoOrder(params = {}) {
        return this.request('algo/order', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivatePostLiquidation(params = {}) {
        return this.request('liquidation', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivatePostClaimInsuranceFund(params = {}) {
        return this.request('claim_insurance_fund', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivatePostWithdrawRequest(params = {}) {
        return this.request('withdraw_request', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivatePostSettlePnl(params = {}) {
        return this.request('settle_pnl', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivatePostNotificationInboxMarkRead(params = {}) {
        return this.request('notification/inbox/mark_read', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 60 });
    }
    v1PrivatePostNotificationInboxMarkReadAll(params = {}) {
        return this.request('notification/inbox/mark_read_all', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 60 });
    }
    v1PrivatePostClientLeverage(params = {}) {
        return this.request('client/leverage', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 120 });
    }
    v1PrivatePostClientLeverages(params = {}) {
        return this.request('client/leverages', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 120 });
    }
    v1PrivatePostClientMarginMode(params = {}) {
        return this.request('client/margin_mode', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivatePostPositionMargin(params = {}) {
        return this.request('position_margin', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivatePostClientMaintenanceConfig(params = {}) {
        return this.request('client/maintenance_config', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 60 });
    }
    v1PrivatePostDelegateSigner(params = {}) {
        return this.request('delegate_signer', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostDelegateOrderlyKey(params = {}) {
        return this.request('delegate_orderly_key', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostDelegateSettlePnl(params = {}) {
        return this.request('delegate_settle_pnl', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostDelegateWithdrawRequest(params = {}) {
        return this.request('delegate_withdraw_request', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostBrokerFeeRateSet(params = {}) {
        return this.request('broker/fee_rate/set', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostBrokerFeeRateSetDefault(params = {}) {
        return this.request('broker/fee_rate/set_default', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostBrokerFeeRateDefault(params = {}) {
        return this.request('broker/fee_rate/default', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostReferralCreate(params = {}) {
        return this.request('referral/create', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostReferralUpdate(params = {}) {
        return this.request('referral/update', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostReferralBind(params = {}) {
        return this.request('referral/bind', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostReferralEditSplit(params = {}) {
        return this.request('referral/edit_split', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostReferralEditRefereeDescription(params = {}) {
        return this.request('referral/edit_referee_description', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostReferralMultiLevelAdmin(params = {}) {
        return this.request('referral/multi_level/admin', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostReferralMultiLevelAdminCreateAffiliate(params = {}) {
        return this.request('referral/multi_level/admin/create/affiliate', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostReferralMultiLevelAdminResetAffiliate(params = {}) {
        return this.request('referral/multi_level/admin/reset/affiliate', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostReferralMultiLevelAdminUpdate(params = {}) {
        return this.request('referral/multi_level/admin/update', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostReferralMultiLevelAdminUpdateAffiliate(params = {}) {
        return this.request('referral/multi_level/admin/update/affiliate', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostReferralMultiLevelClaimCode(params = {}) {
        return this.request('referral/multi_level/claim_code', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostReferralMultiLevelRebateRateSetDefault(params = {}) {
        return this.request('referral/multi_level/rebate_rate/set_default', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePostReferralMultiLevelRebateRateUpdate(params = {}) {
        return this.request('referral/multi_level/rebate_rate/update', ['v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v1PrivatePutOrder(params = {}) {
        return this.request('order', ['v1', 'private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivatePutAlgoOrder(params = {}) {
        return this.request('algo/order', ['v1', 'private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateDeleteOrder(params = {}) {
        return this.request('order', ['v1', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateDeleteAlgoOrder(params = {}) {
        return this.request('algo/order', ['v1', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateDeleteClientOrder(params = {}) {
        return this.request('client/order', ['v1', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateDeleteAlgoClientOrder(params = {}) {
        return this.request('algo/client/order', ['v1', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateDeleteAlgoOrders(params = {}) {
        return this.request('algo/orders', ['v1', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateDeleteOrders(params = {}) {
        return this.request('orders', ['v1', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateDeleteBatchOrder(params = {}) {
        return this.request('batch-order', ['v1', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    v1PrivateDeleteClientBatchOrder(params = {}) {
        return this.request('client/batch-order', ['v1', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    v2PrivatePostInternalTransfer(params = {}) {
        return this.request('internal_transfer', ['v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
