'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetMarketExchangeInfo(params = {}) {
        return this.request('market/exchange-info', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketInventory(params = {}) {
        return this.request('market/inventory', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketDataPrices(params = {}) {
        return this.request('market/data/prices', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketDataStats(params = {}) {
        return this.request('market/data/stats', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketDataTrades(params = {}) {
        return this.request('market/data/trades', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketDataKlines(params = {}) {
        return this.request('market/data/klines', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketDataOpenInterest(params = {}) {
        return this.request('market/data/open-interest', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketDataOrderbook(params = {}) {
        return this.request('market/data/orderbook', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketDataFundingRates(params = {}) {
        return this.request('market/data/funding-rates', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetExchangeUtcTimestamp(params = {}) {
        return this.request('exchange/utc-timestamp', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCapitalBalance(params = {}) {
        return this.request('capital/balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCapitalHistory(params = {}) {
        return this.request('capital/history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCapitalDepositInfo(params = {}) {
        return this.request('capital/deposit-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTradeAccountInfo(params = {}) {
        return this.request('trade/account/info', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTradeAccountTrades(params = {}) {
        return this.request('trade/account/trades', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTradeAccountTradingHistory(params = {}) {
        return this.request('trade/account/trading_history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTradeAccountSettlementsHistory(params = {}) {
        return this.request('trade/account/settlements_history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTradeOrders(params = {}) {
        return this.request('trade/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTradeOrder(params = {}) {
        return this.request('trade/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTradeOrdersHistory(params = {}) {
        return this.request('trade/orders/history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privatePutTradeOrder(params = {}) {
        return this.request('trade/order', ['private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteTradeOrder(params = {}) {
        return this.request('trade/order', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteTradeOrders(params = {}) {
        return this.request('trade/orders', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTradeOrder(params = {}) {
        return this.request('trade/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTradeOrders(params = {}) {
        return this.request('trade/orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCapitalWithdraw(params = {}) {
        return this.request('capital/withdraw', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCapitalTransfer(params = {}) {
        return this.request('capital/transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTradeAccountLeverage(params = {}) {
        return this.request('trade/account/leverage', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
