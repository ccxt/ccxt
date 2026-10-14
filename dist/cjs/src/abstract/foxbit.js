'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    v3PublicGetCurrencies(params = {}) {
        return this.request('currencies', ['v3', 'public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v3PublicGetMarkets(params = {}) {
        return this.request('markets', ['v3', 'public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v3PublicGetMarketsTicker24hr(params = {}) {
        return this.request('markets/ticker/24hr', ['v3', 'public'], 'GET', params, undefined, undefined, { 'cost': 60 });
    }
    v3PublicGetMarketsMarketOrderbook(params = {}) {
        return this.request('markets/{market}/orderbook', ['v3', 'public'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    v3PublicGetMarketsMarketCandlesticks(params = {}) {
        return this.request('markets/{market}/candlesticks', ['v3', 'public'], 'GET', params, undefined, undefined, { 'cost': 12 });
    }
    v3PublicGetMarketsMarketTradesHistory(params = {}) {
        return this.request('markets/{market}/trades/history', ['v3', 'public'], 'GET', params, undefined, undefined, { 'cost': 12 });
    }
    v3PublicGetMarketsMarketTicker24hr(params = {}) {
        return this.request('markets/{market}/ticker/24hr', ['v3', 'public'], 'GET', params, undefined, undefined, { 'cost': 15 });
    }
    v3PublicGetMarketsSparklineWindow(params = {}) {
        return this.request('markets/sparkline/{window}', ['v3', 'public'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    v3PublicGetTravelRuleOperationReasons(params = {}) {
        return this.request('travel_rule/operation_reasons', ['v3', 'public'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    v3PrivateGetAccounts(params = {}) {
        return this.request('accounts', ['v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    v3PrivateGetAccountsSymbolTransactions(params = {}) {
        return this.request('accounts/{symbol}/transactions', ['v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 60 });
    }
    v3PrivateGetOrders(params = {}) {
        return this.request('orders', ['v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    v3PrivateGetOrdersByOrderIdId(params = {}) {
        return this.request('orders/by-order-id/{id}', ['v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    v3PrivateGetTrades(params = {}) {
        return this.request('trades', ['v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 6 });
    }
    v3PrivateGetDepositsAddress(params = {}) {
        return this.request('deposits/address', ['v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    v3PrivateGetDeposits(params = {}) {
        return this.request('deposits', ['v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    v3PrivateGetWithdrawals(params = {}) {
        return this.request('withdrawals', ['v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    v3PrivateGetMeFeesTrading(params = {}) {
        return this.request('me/fees/trading', ['v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 60 });
    }
    v3PrivateGetPrimeDeskExecutionsQuoteId(params = {}) {
        return this.request('prime_desk/executions/{quote_id}', ['v3', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    v3PrivatePostOrders(params = {}) {
        return this.request('orders', ['v3', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    v3PrivatePostOrdersBatch(params = {}) {
        return this.request('orders/batch', ['v3', 'private'], 'POST', params, undefined, undefined, { 'cost': 7.5 });
    }
    v3PrivatePostOrdersCancelReplace(params = {}) {
        return this.request('orders/cancel-replace', ['v3', 'private'], 'POST', params, undefined, undefined, { 'cost': 3 });
    }
    v3PrivatePostWithdrawals(params = {}) {
        return this.request('withdrawals', ['v3', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    v3PrivatePostDepositsDepositSnTravelRule(params = {}) {
        return this.request('deposits/{deposit_sn}/travel_rule', ['v3', 'private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    v3PrivatePutOrdersCancel(params = {}) {
        return this.request('orders/cancel', ['v3', 'private'], 'PUT', params, undefined, undefined, { 'cost': 2 });
    }
    statusPublicGetStatus(params = {}) {
        return this.request('status', ['status', 'public'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
}

exports["default"] = Exchange;
