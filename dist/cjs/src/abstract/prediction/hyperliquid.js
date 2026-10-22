'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var PredictionExchange = require('../../base/PredictionExchange.js');

// ----------------------------------------------------------------------------
class Exchange extends PredictionExchange["default"] {
    publicPostInfo(params = {}) {
        return this.request('info', ['public'], 'POST', params, { 'cost': 20, 'byType': { 'l2Book': 2, 'allMids': 2, 'spotClearinghouseState': 2, 'candleSnapshot': 4, 'orderStatus': 2 } });
    }
    privatePostExchange(params = {}) {
        return this.request('exchange', ['private'], 'POST', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
