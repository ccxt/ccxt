'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetHealth(params = {}) {
        return this.request('health', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetConstants(params = {}) {
        return this.request('constants', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetKit(params = {}) {
        return this.request('kit', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetTiers(params = {}) {
        return this.request('tiers', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetTicker(params = {}) {
        return this.request('ticker', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetTickers(params = {}) {
        return this.request('tickers', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetOrderbook(params = {}) {
        return this.request('orderbook', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetOrderbooks(params = {}) {
        return this.request('orderbooks', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetTrades(params = {}) {
        return this.request('trades', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetChart(params = {}) {
        return this.request('chart', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetCharts(params = {}) {
        return this.request('charts', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetMinicharts(params = {}) {
        return this.request('minicharts', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetOraclePrices(params = {}) {
        return this.request('oracle/prices', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetQuickTrade(params = {}) {
        return this.request('quick-trade', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetUdfConfig(params = {}) {
        return this.request('udf/config', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetUdfHistory(params = {}) {
        return this.request('udf/history', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetUdfSymbols(params = {}) {
        return this.request('udf/symbols', ['public'], 'GET', params, { 'cost': 1 });
    }
    privateGetUser(params = {}) {
        return this.request('user', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetUserBalance(params = {}) {
        return this.request('user/balance', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetUserDeposits(params = {}) {
        return this.request('user/deposits', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetUserWithdrawals(params = {}) {
        return this.request('user/withdrawals', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetUserWithdrawalFee(params = {}) {
        return this.request('user/withdrawal/fee', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetSubaccounts(params = {}) {
        return this.request('subaccounts', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetUserTrades(params = {}) {
        return this.request('user/trades', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetOrders(params = {}) {
        return this.request('orders', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetOrder(params = {}) {
        return this.request('order', ['private'], 'GET', params, { 'cost': 1 });
    }
    privatePostUserWithdrawal(params = {}) {
        return this.request('user/withdrawal', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostSubaccountTransfer(params = {}) {
        return this.request('subaccount/transfer', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostOrder(params = {}) {
        return this.request('order', ['private'], 'POST', params, { 'cost': 1 });
    }
    privateDeleteOrderAll(params = {}) {
        return this.request('order/all', ['private'], 'DELETE', params, { 'cost': 1 });
    }
    privateDeleteOrder(params = {}) {
        return this.request('order', ['private'], 'DELETE', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
