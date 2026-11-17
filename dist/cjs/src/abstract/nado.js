'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    gatewayPublicGetSymbols(params = {}) {
        return this.request('symbols', ['gateway', 'public'], 'GET', params, { 'cost': 2 });
    }
    gatewayPublicGetQuery(params = {}) {
        return this.request('query', ['gateway', 'public'], 'GET', params, { 'cost': 2, 'byType': { 'status': 1, 'contracts': 1, 'order': 1, 'subaccount_orders': 2, 'subaccount_info': 2 } });
    }
    gatewayPublicGetEdgeQuery(params = {}) {
        return this.request('edge/query', ['gateway', 'public'], 'GET', params, { 'cost': 1 });
    }
    gatewayPublicPostQuery(params = {}) {
        return this.request('query', ['gateway', 'public'], 'POST', params, { 'cost': 2, 'byType': { 'status': 1, 'contracts': 1, 'order': 1, 'subaccount_orders': 2, 'subaccount_info': 2 } });
    }
    gatewayPublicPostEdgeQuery(params = {}) {
        return this.request('edge/query', ['gateway', 'public'], 'POST', params, { 'cost': 1 });
    }
    gatewayPrivatePostExecute(params = {}) {
        return this.request('execute', ['gateway', 'private'], 'POST', params, { 'cost': 1 });
    }
    gatewayV2PublicGetAssets(params = {}) {
        return this.request('assets', ['gatewayV2', 'public'], 'GET', params, { 'cost': 2 });
    }
    gatewayV2PublicGetPairs(params = {}) {
        return this.request('pairs', ['gatewayV2', 'public'], 'GET', params, { 'cost': 2 });
    }
    gatewayV2PublicGetOrderbook(params = {}) {
        return this.request('orderbook', ['gatewayV2', 'public'], 'GET', params, { 'cost': 1 });
    }
    archivePost(params = {}) {
        return this.request('', ['archive'], 'POST', params, { 'cost': 2, 'byQuery': { 'candlesticks': [2, 100], 'events': [2, 10], 'matches': [2, 10], 'orders': [2, 20], 'interest_and_funding': [5] } });
    }
    archiveV2PublicGetTickers(params = {}) {
        return this.request('tickers', ['archiveV2', 'public'], 'GET', params, { 'cost': 2 });
    }
    archiveV2PublicGetContracts(params = {}) {
        return this.request('contracts', ['archiveV2', 'public'], 'GET', params, { 'cost': 2 });
    }
    archiveV2PublicGetTrades(params = {}) {
        return this.request('trades', ['archiveV2', 'public'], 'GET', params, { 'cost': 4, 'byRows': [2, 50] });
    }
    archiveV2PublicGetSymbols(params = {}) {
        return this.request('symbols', ['archiveV2', 'public'], 'GET', params, { 'cost': 2 });
    }
    triggerPrivatePostExecute(params = {}) {
        return this.request('execute', ['trigger', 'private'], 'POST', params, { 'cost': 1 });
    }
    triggerPrivatePostQuery(params = {}) {
        return this.request('query', ['trigger', 'private'], 'POST', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
