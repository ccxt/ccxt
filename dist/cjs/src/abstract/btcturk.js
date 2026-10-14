'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetOrderbook(params = {}) {
        return this.request("orderbook", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTicker(params = {}) {
        return this.request("ticker", "public", 'GET', params, undefined, undefined, { "cost": 0.1 });
    }
    publicGetTickerCurrency(params = {}) {
        return this.request("ticker/currency", "public", 'GET', params, undefined, undefined, { "cost": 0.1 });
    }
    publicGetTrades(params = {}) {
        return this.request("trades", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetOhlc(params = {}) {
        return this.request("ohlc", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetServerExchangeinfo(params = {}) {
        return this.request("server/exchangeinfo", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetUsersBalances(params = {}) {
        return this.request("users/balances", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetOpenOrders(params = {}) {
        return this.request("openOrders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAllOrders(params = {}) {
        return this.request("allOrders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetOrderOrderId(params = {}) {
        return this.request("order/{orderId}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetUsersTransactionsTrade(params = {}) {
        return this.request("users/transactions/trade", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetUsersTransactionsCrypto(params = {}) {
        return this.request("users/transactions/crypto", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetUsersTransactionsFiat(params = {}) {
        return this.request("users/transactions/fiat", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetCryptoDepositDeclarations(params = {}) {
        return this.request("crypto-deposit-declarations", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privatePostUsersTransactionsCrypto(params = {}) {
        return this.request("users/transactions/crypto", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostUsersTransactionsFiat(params = {}) {
        return this.request("users/transactions/fiat", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOrder(params = {}) {
        return this.request("order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelOrder(params = {}) {
        return this.request("cancelOrder", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCryptoDepositDeclarationsConfirm(params = {}) {
        return this.request("crypto-deposit-declarations/confirm", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteOrder(params = {}) {
        return this.request("order", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    graphGetOhlcs(params = {}) {
        return this.request("ohlcs", "graph", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    graphGetKlinesHistory(params = {}) {
        return this.request("klines/history", "graph", 'GET', params, undefined, undefined, { "cost": 1 });
    }
}

exports["default"] = Exchange;
