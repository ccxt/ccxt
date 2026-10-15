'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetMarkets(params = {}) {
        return this.request('markets', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetMarketsMarketIdTicker(params = {}) {
        return this.request('markets/{marketId}/ticker', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetMarketsMarketIdTrades(params = {}) {
        return this.request('markets/{marketId}/trades', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetMarketsMarketIdOrderbook(params = {}) {
        return this.request('markets/{marketId}/orderbook', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetMarketsMarketIdCandles(params = {}) {
        return this.request('markets/{marketId}/candles', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetMarketsTickers(params = {}) {
        return this.request('markets/tickers', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetMarketsOrderbooks(params = {}) {
        return this.request('markets/orderbooks', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetTime(params = {}) {
        return this.request('time', ['public'], 'GET', params, { 'cost': 1 });
    }
    privateGetOrders(params = {}) {
        return this.request('orders', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetOrdersId(params = {}) {
        return this.request('orders/{id}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetBatchordersIds(params = {}) {
        return this.request('batchorders/{ids}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetTrades(params = {}) {
        return this.request('trades', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetTradesId(params = {}) {
        return this.request('trades/{id}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetWithdrawals(params = {}) {
        return this.request('withdrawals', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetWithdrawalsId(params = {}) {
        return this.request('withdrawals/{id}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetDeposits(params = {}) {
        return this.request('deposits', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetDepositsId(params = {}) {
        return this.request('deposits/{id}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetTransfers(params = {}) {
        return this.request('transfers', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetTransfersId(params = {}) {
        return this.request('transfers/{id}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetAddresses(params = {}) {
        return this.request('addresses', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetWithdrawalFees(params = {}) {
        return this.request('withdrawal-fees', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetAssets(params = {}) {
        return this.request('assets', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetAccountsMeTradingFees(params = {}) {
        return this.request('accounts/me/trading-fees', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetAccountsMeWithdrawalLimits(params = {}) {
        return this.request('accounts/me/withdrawal-limits', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetAccountsMeBalances(params = {}) {
        return this.request('accounts/me/balances', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetAccountsMeTransactions(params = {}) {
        return this.request('accounts/me/transactions', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetReportsId(params = {}) {
        return this.request('reports/{id}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privatePostOrders(params = {}) {
        return this.request('orders', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostBatchorders(params = {}) {
        return this.request('batchorders', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostWithdrawals(params = {}) {
        return this.request('withdrawals', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostReports(params = {}) {
        return this.request('reports', ['private'], 'POST', params, { 'cost': 1 });
    }
    privateDeleteOrders(params = {}) {
        return this.request('orders', ['private'], 'DELETE', params, { 'cost': 1 });
    }
    privateDeleteOrdersId(params = {}) {
        return this.request('orders/{id}', ['private'], 'DELETE', params, { 'cost': 1 });
    }
    privateDeleteBatchordersIds(params = {}) {
        return this.request('batchorders/{ids}', ['private'], 'DELETE', params, { 'cost': 1 });
    }
    privatePutOrdersId(params = {}) {
        return this.request('orders/{id}', ['private'], 'PUT', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
