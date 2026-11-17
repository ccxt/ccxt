'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var PredictionExchange = require('../../base/PredictionExchange.js');

// ----------------------------------------------------------------------------
class Exchange extends PredictionExchange["default"] {
    predictfunGetV1AuthMessage(params = {}) {
        return this.request('v1/auth/message', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1Categories(params = {}) {
        return this.request('v1/categories', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1CategoriesSlug(params = {}) {
        return this.request('v1/categories/{slug}', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1Tags(params = {}) {
        return this.request('v1/tags', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1Markets(params = {}) {
        return this.request('v1/markets', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1MarketsId(params = {}) {
        return this.request('v1/markets/{id}', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1MarketsIdStats(params = {}) {
        return this.request('v1/markets/{id}/stats', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1MarketsIdLastSale(params = {}) {
        return this.request('v1/markets/{id}/last-sale', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1MarketsIdOrderbook(params = {}) {
        return this.request('v1/markets/{id}/orderbook', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1MarketsIdTimeseries(params = {}) {
        return this.request('v1/markets/{id}/timeseries', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1MarketsIdTimeseriesLatest(params = {}) {
        return this.request('v1/markets/{id}/timeseries/latest', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1OrdersHash(params = {}) {
        return this.request('v1/orders/{hash}', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1Orders(params = {}) {
        return this.request('v1/orders', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1OrdersMatches(params = {}) {
        return this.request('v1/orders/matches', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1Account(params = {}) {
        return this.request('v1/account', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1AccountActivity(params = {}) {
        return this.request('v1/account/activity', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1Positions(params = {}) {
        return this.request('v1/positions', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1PositionsAddress(params = {}) {
        return this.request('v1/positions/{address}', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunGetV1Search(params = {}) {
        return this.request('v1/search', ['predictfun'], 'GET', params, { 'cost': 1 });
    }
    predictfunPostV1Auth(params = {}) {
        return this.request('v1/auth', ['predictfun'], 'POST', params, { 'cost': 1 });
    }
    predictfunPostV1OrdersRemove(params = {}) {
        return this.request('v1/orders/remove', ['predictfun'], 'POST', params, { 'cost': 1 });
    }
    predictfunPostV1Orders(params = {}) {
        return this.request('v1/orders', ['predictfun'], 'POST', params, { 'cost': 1 });
    }
    predictfunPostV1OrdersRemoveByHash(params = {}) {
        return this.request('v1/orders/remove-by-hash', ['predictfun'], 'POST', params, { 'cost': 1 });
    }
    predictfunPostV1AccountReferral(params = {}) {
        return this.request('v1/account/referral', ['predictfun'], 'POST', params, { 'cost': 1 });
    }
    predictfunPostV1OauthFinalize(params = {}) {
        return this.request('v1/oauth/finalize', ['predictfun'], 'POST', params, { 'cost': 1 });
    }
    predictfunPostV1OauthOrders(params = {}) {
        return this.request('v1/oauth/orders', ['predictfun'], 'POST', params, { 'cost': 1 });
    }
    predictfunPostV1OauthOrdersCreate(params = {}) {
        return this.request('v1/oauth/orders/create', ['predictfun'], 'POST', params, { 'cost': 1 });
    }
    predictfunPostV1OauthOrdersCancel(params = {}) {
        return this.request('v1/oauth/orders/cancel', ['predictfun'], 'POST', params, { 'cost': 1 });
    }
    predictfunPostV1OauthPositions(params = {}) {
        return this.request('v1/oauth/positions', ['predictfun'], 'POST', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
