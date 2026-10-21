'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetMarkets(params = {}) {
        return this.request('markets', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetMarket(params = {}) {
        return this.request('market', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetTickers(params = {}) {
        return this.request('tickers', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetTicker(params = {}) {
        return this.request('ticker', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetBook(params = {}) {
        return this.request('book', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetHistory(params = {}) {
        return this.request('history', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDepthResult(params = {}) {
        return this.request('depth/result', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetMarketKline(params = {}) {
        return this.request('market/kline', ['public'], 'GET', params, { 'cost': 1 });
    }
    privatePostAccountBalances(params = {}) {
        return this.request('account/balances', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostAccountBalance(params = {}) {
        return this.request('account/balance', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostOrderNew(params = {}) {
        return this.request('order/new', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostOrderCancel(params = {}) {
        return this.request('order/cancel', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostOrders(params = {}) {
        return this.request('orders', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostAccountMarketOrderHistory(params = {}) {
        return this.request('account/market_order_history', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostAccountMarketDealHistory(params = {}) {
        return this.request('account/market_deal_history', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostAccountOrder(params = {}) {
        return this.request('account/order', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostAccountOrderHistory(params = {}) {
        return this.request('account/order_history', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostAccountExecutedHistory(params = {}) {
        return this.request('account/executed_history', ['private'], 'POST', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
