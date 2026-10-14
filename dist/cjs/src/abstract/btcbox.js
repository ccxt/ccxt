'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetDepth(params = {}) {
        return this.request("depth", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetOrders(params = {}) {
        return this.request("orders", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTicker(params = {}) {
        return this.request("ticker", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTickers(params = {}) {
        return this.request("tickers", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privatePostBalance(params = {}) {
        return this.request("balance", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOrderHistory(params = {}) {
        return this.request("order_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostTradeAdd(params = {}) {
        return this.request("trade_add", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostTradeCancel(params = {}) {
        return this.request("trade_cancel", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostTradeList(params = {}) {
        return this.request("trade_list", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostTradeView(params = {}) {
        return this.request("trade_view", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostWallet(params = {}) {
        return this.request("wallet", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    webApiGetAjaxCoinCoinInfo(params = {}) {
        return this.request("ajax/coin/coinInfo", "webApi", 'GET', params, undefined, undefined, { "cost": 1 });
    }
}

exports["default"] = Exchange;
