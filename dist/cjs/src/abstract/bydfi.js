'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetV1PublicApiLimits(params = {}) {
        return this.request('v1/public/api_limits', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1FapiMarketExchangeInfo(params = {}) {
        return this.request('v1/fapi/market/exchange_info', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1FapiMarketDepth(params = {}) {
        return this.request('v1/fapi/market/depth', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1FapiMarketTrades(params = {}) {
        return this.request('v1/fapi/market/trades', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1FapiMarketKlines(params = {}) {
        return this.request('v1/fapi/market/klines', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1FapiMarketTicker24hr(params = {}) {
        return this.request('v1/fapi/market/ticker/24hr', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1FapiMarketTickerPrice(params = {}) {
        return this.request('v1/fapi/market/ticker/price', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1FapiMarketMarkPrice(params = {}) {
        return this.request('v1/fapi/market/mark_price', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1FapiMarketFundingRate(params = {}) {
        return this.request('v1/fapi/market/funding_rate', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1FapiMarketFundingRateHistory(params = {}) {
        return this.request('v1/fapi/market/funding_rate_history', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1FapiMarketRiskLimit(params = {}) {
        return this.request('v1/fapi/market/risk_limit', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1AccountAssets(params = {}) {
        return this.request('v1/account/assets', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1AccountTransferRecords(params = {}) {
        return this.request('v1/account/transfer_records', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1SpotDepositRecords(params = {}) {
        return this.request('v1/spot/deposit_records', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1SpotWithdrawRecords(params = {}) {
        return this.request('v1/spot/withdraw_records', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1FapiTradeOpenOrder(params = {}) {
        return this.request('v1/fapi/trade/open_order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1FapiTradePlanOrder(params = {}) {
        return this.request('v1/fapi/trade/plan_order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1FapiTradeLeverage(params = {}) {
        return this.request('v1/fapi/trade/leverage', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1FapiTradeHistoryOrder(params = {}) {
        return this.request('v1/fapi/trade/history_order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1FapiTradeHistoryTrade(params = {}) {
        return this.request('v1/fapi/trade/history_trade', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1FapiTradePositionHistory(params = {}) {
        return this.request('v1/fapi/trade/position_history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1FapiTradePositions(params = {}) {
        return this.request('v1/fapi/trade/positions', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV2FapiTradeOpenOrder(params = {}) {
        return this.request('v2/fapi/trade/open_order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV2FapiTradePlanOrder(params = {}) {
        return this.request('v2/fapi/trade/plan_order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV2FapiTradeHistoryOrder(params = {}) {
        return this.request('v2/fapi/trade/history_order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV2FapiTradeHistoryTrade(params = {}) {
        return this.request('v2/fapi/trade/history_trade', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV2FapiTradePositionHistory(params = {}) {
        return this.request('v2/fapi/trade/position_history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV2FapiTradePositions(params = {}) {
        return this.request('v2/fapi/trade/positions', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1FapiAccountBalance(params = {}) {
        return this.request('v1/fapi/account/balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1FapiUserDataAssetsMargin(params = {}) {
        return this.request('v1/fapi/user_data/assets_margin', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1FapiUserDataPositionSideDual(params = {}) {
        return this.request('v1/fapi/user_data/position_side/dual', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1AgentTeams(params = {}) {
        return this.request('v1/agent/teams', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1AgentAgentLinks(params = {}) {
        return this.request('v1/agent/agent_links', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1AgentRegularOverview(params = {}) {
        return this.request('v1/agent/regular_overview', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1AgentAgentSubOverview(params = {}) {
        return this.request('v1/agent/agent_sub_overview', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1AgentPartenerUserDeposit(params = {}) {
        return this.request('v1/agent/partener_user_deposit', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1AgentPartenerUsersData(params = {}) {
        return this.request('v1/agent/partener_users_data', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1AgentAffiliateUids(params = {}) {
        return this.request('v1/agent/affiliate_uids', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1AgentAffiliateCommission(params = {}) {
        return this.request('v1/agent/affiliate_commission', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1AgentInternalWithdrawalStatus(params = {}) {
        return this.request('v1/agent/internal_withdrawal_status', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1AccountTransfer(params = {}) {
        return this.request('v1/account/transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1FapiTradePlaceOrder(params = {}) {
        return this.request('v1/fapi/trade/place_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1FapiTradeBatchPlaceOrder(params = {}) {
        return this.request('v1/fapi/trade/batch_place_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1FapiTradeEditOrder(params = {}) {
        return this.request('v1/fapi/trade/edit_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1FapiTradeBatchEditOrder(params = {}) {
        return this.request('v1/fapi/trade/batch_edit_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1FapiTradeCancelAllOrder(params = {}) {
        return this.request('v1/fapi/trade/cancel_all_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1FapiTradeLeverage(params = {}) {
        return this.request('v1/fapi/trade/leverage', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1FapiTradeBatchLeverageMargin(params = {}) {
        return this.request('v1/fapi/trade/batch_leverage_margin', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV2FapiTradePlaceOrder(params = {}) {
        return this.request('v2/fapi/trade/place_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV2FapiTradeBatchPlaceOrder(params = {}) {
        return this.request('v2/fapi/trade/batch_place_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV2FapiTradeEditOrder(params = {}) {
        return this.request('v2/fapi/trade/edit_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV2FapiTradeBatchEditOrder(params = {}) {
        return this.request('v2/fapi/trade/batch_edit_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV2FapiTradeCancelOrder(params = {}) {
        return this.request('v2/fapi/trade/cancel_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV2FapiTradeBatchCancelOrder(params = {}) {
        return this.request('v2/fapi/trade/batch_cancel_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV2FapiTradeCancelAllOrder(params = {}) {
        return this.request('v2/fapi/trade/cancel_all_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1FapiUserDataMarginType(params = {}) {
        return this.request('v1/fapi/user_data/margin_type', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1FapiUserDataPositionSideDual(params = {}) {
        return this.request('v1/fapi/user_data/position_side/dual', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1AgentInternalWithdrawal(params = {}) {
        return this.request('v1/agent/internal_withdrawal', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
