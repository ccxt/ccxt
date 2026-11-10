'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetDeepcoinMarketBooks(params = {}) {
        return this.request('deepcoin/market/books', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDeepcoinMarketCandles(params = {}) {
        return this.request('deepcoin/market/candles', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDeepcoinMarketInstruments(params = {}) {
        return this.request('deepcoin/market/instruments', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDeepcoinMarketTickers(params = {}) {
        return this.request('deepcoin/market/tickers', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDeepcoinMarketIndexCandles(params = {}) {
        return this.request('deepcoin/market/index-candles', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDeepcoinMarketTrades(params = {}) {
        return this.request('deepcoin/market/trades', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDeepcoinMarketMarkPriceCandles(params = {}) {
        return this.request('deepcoin/market/mark-price-candles', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDeepcoinMarketMarkPrice(params = {}) {
        return this.request('deepcoin/market/mark-price', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDeepcoinMarketOpenInterestVolume(params = {}) {
        return this.request('deepcoin/market/open-interest-volume', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDeepcoinMarketLongShortRatio(params = {}) {
        return this.request('deepcoin/market/long-short-ratio', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDeepcoinMarketTakerVolume(params = {}) {
        return this.request('deepcoin/market/taker-volume', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDeepcoinMarketStepMargin(params = {}) {
        return this.request('deepcoin/market/step-margin', ['public'], 'GET', params, { 'cost': 5 });
    }
    publicGetDeepcoinTradeFundingRate(params = {}) {
        return this.request('deepcoin/trade/funding-rate', ['public'], 'GET', params, { 'cost': 5 });
    }
    publicGetDeepcoinTradeFundRateCurrentFundingRate(params = {}) {
        return this.request('deepcoin/trade/fund-rate/current-funding-rate', ['public'], 'GET', params, { 'cost': 5 });
    }
    publicGetDeepcoinTradeFundRateHistory(params = {}) {
        return this.request('deepcoin/trade/fund-rate/history', ['public'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinAccountBalances(params = {}) {
        return this.request('deepcoin/account/balances', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinAccountAllBalances(params = {}) {
        return this.request('deepcoin/account/all-balances', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinAccountBills(params = {}) {
        return this.request('deepcoin/account/bills', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinAccountPositions(params = {}) {
        return this.request('deepcoin/account/positions', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinAccountTradeFee(params = {}) {
        return this.request('deepcoin/account/trade-fee', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinAccountLeverageInfo(params = {}) {
        return this.request('deepcoin/account/leverage-info', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinAccountPositionsHistory(params = {}) {
        return this.request('deepcoin/account/positions-history', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinTradeFills(params = {}) {
        return this.request('deepcoin/trade/fills', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinTradeOrderByID(params = {}) {
        return this.request('deepcoin/trade/orderByID', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinTradeOrder(params = {}) {
        return this.request('deepcoin/trade/order', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinTradeFinishOrderByID(params = {}) {
        return this.request('deepcoin/trade/finishOrderByID', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinTradeOrdersHistory(params = {}) {
        return this.request('deepcoin/trade/orders-history', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinTradeV2OrdersPending(params = {}) {
        return this.request('deepcoin/trade/v2/orders-pending', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinTradeTriggerOrdersPending(params = {}) {
        return this.request('deepcoin/trade/trigger-orders-pending', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinTradeTriggerOrdersHistory(params = {}) {
        return this.request('deepcoin/trade/trigger-orders-history', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinCopytradingSupportContracts(params = {}) {
        return this.request('deepcoin/copytrading/support-contracts', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinCopytradingLeaderPosition(params = {}) {
        return this.request('deepcoin/copytrading/leader-position', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinCopytradingEstimateProfit(params = {}) {
        return this.request('deepcoin/copytrading/estimate-profit', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinCopytradingHistoryProfit(params = {}) {
        return this.request('deepcoin/copytrading/history-profit', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinCopytradingFollowerRank(params = {}) {
        return this.request('deepcoin/copytrading/follower-rank', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinInternalTransferSupport(params = {}) {
        return this.request('deepcoin/internal-transfer/support', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinInternalTransferHistoryOrder(params = {}) {
        return this.request('deepcoin/internal-transfer/history-order', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinRebateConfig(params = {}) {
        return this.request('deepcoin/rebate/config', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinAgentsUsers(params = {}) {
        return this.request('deepcoin/agents/users', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinAgentsUsersRebateList(params = {}) {
        return this.request('deepcoin/agents/users/rebate-list', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinAgentsUsersRebates(params = {}) {
        return this.request('deepcoin/agents/users/rebates', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinAssetDepositList(params = {}) {
        return this.request('deepcoin/asset/deposit-list', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinAssetWithdrawList(params = {}) {
        return this.request('deepcoin/asset/withdraw-list', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinAssetRechargeChainList(params = {}) {
        return this.request('deepcoin/asset/recharge-chain-list', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinListenkeyAcquire(params = {}) {
        return this.request('deepcoin/listenkey/acquire', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinListenkeyExtend(params = {}) {
        return this.request('deepcoin/listenkey/extend', ['private'], 'GET', params, { 'cost': 5 });
    }
    privateGetDeepcoinSubAccountSubAccountApikey(params = {}) {
        return this.request('deepcoin/sub-account/sub-account-apikey', ['private'], 'GET', params, { 'cost': 5 });
    }
    privatePostDeepcoinAccountSetLeverage(params = {}) {
        return this.request('deepcoin/account/set-leverage', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinTradeOrder(params = {}) {
        return this.request('deepcoin/trade/order', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinTradeReplaceOrder(params = {}) {
        return this.request('deepcoin/trade/replace-order', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinTradeCancelOrder(params = {}) {
        return this.request('deepcoin/trade/cancel-order', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinTradeBatchCancelOrder(params = {}) {
        return this.request('deepcoin/trade/batch-cancel-order', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinTradeCancelTriggerOrder(params = {}) {
        return this.request('deepcoin/trade/cancel-trigger-order', ['private'], 'POST', params, { 'cost': 0.16666666666666666 });
    }
    privatePostDeepcoinTradeSwapCancelAll(params = {}) {
        return this.request('deepcoin/trade/swap/cancel-all', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinTradeTriggerOrder(params = {}) {
        return this.request('deepcoin/trade/trigger-order', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinTradeAmendTriggerOrder(params = {}) {
        return this.request('deepcoin/trade/amend-trigger-order', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinTradeBatchClosePosition(params = {}) {
        return this.request('deepcoin/trade/batch-close-position', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinTradeReplaceOrderSltp(params = {}) {
        return this.request('deepcoin/trade/replace-order-sltp', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinTradeClosePositionByIds(params = {}) {
        return this.request('deepcoin/trade/close-position-by-ids', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinTradeIncreasePosition(params = {}) {
        return this.request('deepcoin/trade/increase-position', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinTradeMergePositions(params = {}) {
        return this.request('deepcoin/trade/merge-positions', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinCopytradingLeaderSettings(params = {}) {
        return this.request('deepcoin/copytrading/leader-settings', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinCopytradingSetContracts(params = {}) {
        return this.request('deepcoin/copytrading/set-contracts', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinInternalTransfer(params = {}) {
        return this.request('deepcoin/internal-transfer', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinRebateConfig(params = {}) {
        return this.request('deepcoin/rebate/config', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinAssetTransfer(params = {}) {
        return this.request('deepcoin/asset/transfer', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinSubAccountCreateSubAccount(params = {}) {
        return this.request('deepcoin/sub-account/create-sub-account', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinSubAccountSubAccountApikey(params = {}) {
        return this.request('deepcoin/sub-account/sub-account-apikey', ['private'], 'POST', params, { 'cost': 5 });
    }
    privatePostDeepcoinSubAccountDeleteSubAccountApikey(params = {}) {
        return this.request('deepcoin/sub-account/delete-sub-account-apikey', ['private'], 'POST', params, { 'cost': 5 });
    }
}

exports["default"] = Exchange;
