'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicPostInfo(params = {}) {
        return this.request('info', ['public'], 'POST', params, { 'cost': 10, 'byType': { 'l2Book': 2, 'allMids': 2, 'clearinghouseState': 2, 'orderStatus': 2, 'spotClearinghouseState': 2, 'exchangeStatus': 2, 'candleSnapshot': 4 } });
    }
    privatePostExchange(params = {}) {
        return this.request('exchange', ['private'], 'POST', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
