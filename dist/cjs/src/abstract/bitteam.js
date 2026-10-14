'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    historyGetApiTwHistoryPairNameResolution(params = {}) {
        return this.request("api/tw/history/{pairName}/{resolution}", "history", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiAsset(params = {}) {
        return this.request("trade/api/asset", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiCurrencies(params = {}) {
        return this.request("trade/api/currencies", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiOrderbooksSymbol(params = {}) {
        return this.request("trade/api/orderbooks/{symbol}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiOrders(params = {}) {
        return this.request("trade/api/orders", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiPairName(params = {}) {
        return this.request("trade/api/pair/{name}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiPairs(params = {}) {
        return this.request("trade/api/pairs", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiPairsPrecisions(params = {}) {
        return this.request("trade/api/pairs/precisions", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiRates(params = {}) {
        return this.request("trade/api/rates", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiStats(params = {}) {
        return this.request("trade/api/stats", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiTradeId(params = {}) {
        return this.request("trade/api/trade/{id}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiTrades(params = {}) {
        return this.request("trade/api/trades", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiCcxtPairs(params = {}) {
        return this.request("trade/api/ccxt/pairs", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiCmcAssets(params = {}) {
        return this.request("trade/api/cmc/assets", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiCmcOrderbookPair(params = {}) {
        return this.request("trade/api/cmc/orderbook/{pair}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiCmcSummary(params = {}) {
        return this.request("trade/api/cmc/summary", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiCmcTicker(params = {}) {
        return this.request("trade/api/cmc/ticker", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradeApiCmcTradesPair(params = {}) {
        return this.request("trade/api/cmc/trades/{pair}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetTradeApiCcxtBalance(params = {}) {
        return this.request("trade/api/ccxt/balance", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetTradeApiCcxtOrderId(params = {}) {
        return this.request("trade/api/ccxt/order/{id}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetTradeApiCcxtOrdersOfUser(params = {}) {
        return this.request("trade/api/ccxt/ordersOfUser", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetTradeApiCcxtTradesOfUser(params = {}) {
        return this.request("trade/api/ccxt/tradesOfUser", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetTradeApiTransactionsOfUser(params = {}) {
        return this.request("trade/api/transactionsOfUser", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privatePostTradeApiCcxtCancelAllOrder(params = {}) {
        return this.request("trade/api/ccxt/cancel-all-order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostTradeApiCcxtCancelorder(params = {}) {
        return this.request("trade/api/ccxt/cancelorder", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostTradeApiCcxtOrdercreate(params = {}) {
        return this.request("trade/api/ccxt/ordercreate", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
}

exports["default"] = Exchange;
