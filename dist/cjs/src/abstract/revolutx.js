'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGet20PublicOrderBookSymbol(params = {}) {
        return this.request('2.0/public/order-book/{symbol}', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGet10PublicTickers(params = {}) {
        return this.request('1.0/public/tickers', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGet10PublicCandlesSymbol(params = {}) {
        return this.request('1.0/public/candles/{symbol}', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGet10PublicTradesAll(params = {}) {
        return this.request('1.0/public/trades/all', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGet10PublicConfigurationCurrencies(params = {}) {
        return this.request('1.0/public/configuration/currencies', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGet10PublicConfigurationPairs(params = {}) {
        return this.request('1.0/public/configuration/pairs', ['public'], 'GET', params, { 'cost': 1 });
    }
    privateGet10Balances(params = {}) {
        return this.request('1.0/balances', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGet10OrdersActive(params = {}) {
        return this.request('1.0/orders/active', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGet10OrdersHistorical(params = {}) {
        return this.request('1.0/orders/historical', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGet10OrdersVenueOrderId(params = {}) {
        return this.request('1.0/orders/{venue_order_id}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGet10OrdersFillsVenueOrderId(params = {}) {
        return this.request('1.0/orders/fills/{venue_order_id}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGet10TradesPrivateSymbol(params = {}) {
        return this.request('1.0/trades/private/{symbol}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGet10Transactions(params = {}) {
        return this.request('1.0/transactions', ['private'], 'GET', params, { 'cost': 1 });
    }
    privatePost10Orders(params = {}) {
        return this.request('1.0/orders', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePut10OrdersVenueOrderId(params = {}) {
        return this.request('1.0/orders/{venue_order_id}', ['private'], 'PUT', params, { 'cost': 1 });
    }
    privateDelete10Orders(params = {}) {
        return this.request('1.0/orders', ['private'], 'DELETE', params, { 'cost': 1 });
    }
    privateDelete10OrdersVenueOrderId(params = {}) {
        return this.request('1.0/orders/{venue_order_id}', ['private'], 'DELETE', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
