'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetPairTicker(params = {}) {
        return this.request('{pair}/ticker', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTickers(params = {}) {
        return this.request('tickers', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTickersJpy(params = {}) {
        return this.request('tickers_jpy', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPairDepth(params = {}) {
        return this.request('{pair}/depth', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPairTransactions(params = {}) {
        return this.request('{pair}/transactions', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPairTransactionsYyyymmdd(params = {}) {
        return this.request('{pair}/transactions/{yyyymmdd}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPairCandlestickCandletypeYyyymmdd(params = {}) {
        return this.request('{pair}/candlestick/{candletype}/{yyyymmdd}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPairCircuitBreakInfo(params = {}) {
        return this.request('{pair}/circuit_break_info', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUserAssets(params = {}) {
        return this.request('user/assets', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUserSpotOrder(params = {}) {
        return this.request('user/spot/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUserSpotActiveOrders(params = {}) {
        return this.request('user/spot/active_orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUserMarginStatus(params = {}) {
        return this.request('user/margin/status', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUserMarginPositions(params = {}) {
        return this.request('user/margin/positions', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUserSpotTradeHistory(params = {}) {
        return this.request('user/spot/trade_history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUserDepositHistory(params = {}) {
        return this.request('user/deposit_history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUserUnconfirmedDeposits(params = {}) {
        return this.request('user/unconfirmed_deposits', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUserDepositOriginators(params = {}) {
        return this.request('user/deposit_originators', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUserWithdrawalAccount(params = {}) {
        return this.request('user/withdrawal_account', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUserWithdrawalHistory(params = {}) {
        return this.request('user/withdrawal_history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetSpotStatus(params = {}) {
        return this.request('spot/status', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetSpotPairs(params = {}) {
        return this.request('spot/pairs', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUserSpotOrder(params = {}) {
        return this.request('user/spot/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.66 });
    }
    privatePostUserSpotCancelOrder(params = {}) {
        return this.request('user/spot/cancel_order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.66 });
    }
    privatePostUserSpotCancelOrders(params = {}) {
        return this.request('user/spot/cancel_orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.66 });
    }
    privatePostUserSpotOrdersInfo(params = {}) {
        return this.request('user/spot/orders_info', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.66 });
    }
    privatePostUserConfirmDeposits(params = {}) {
        return this.request('user/confirm_deposits', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.66 });
    }
    privatePostUserConfirmDepositsAll(params = {}) {
        return this.request('user/confirm_deposits_all', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.66 });
    }
    privatePostUserRequestWithdrawal(params = {}) {
        return this.request('user/request_withdrawal', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.66 });
    }
    marketsGetSpotPairs(params = {}) {
        return this.request('spot/pairs', ['markets'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
