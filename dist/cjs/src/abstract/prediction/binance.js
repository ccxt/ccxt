'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var PredictionExchange = require('../../base/PredictionExchange.js');

// ----------------------------------------------------------------------------
class Exchange extends PredictionExchange["default"] {
    sapiPrivateGetCategoryList(params = {}) {
        return this.request("category/list", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetMarketList(params = {}) {
        return this.request("market/list", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetMarketSearch(params = {}) {
        return this.request("market/search", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetMarketDetail(params = {}) {
        return this.request("market/detail", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetOrderBook(params = {}) {
        return this.request("order-book", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetOrderBookLastTradePrice(params = {}) {
        return this.request("order-book/last-trade-price", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetWalletList(params = {}) {
        return this.request("wallet/list", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetBalancePaymentOptions(params = {}) {
        return this.request("balance/payment-options", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetQuotaLimitStatus(params = {}) {
        return this.request("quota/limit/status", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetPnlPortfolio(params = {}) {
        return this.request("pnl/portfolio", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetPnlQuery(params = {}) {
        return this.request("pnl/query", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetPositionList(params = {}) {
        return this.request("position/list", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetPositionFilter(params = {}) {
        return this.request("position/filter", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetPositionToken(params = {}) {
        return this.request("position/token", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetPositionSettledHistory(params = {}) {
        return this.request("position/settled-history", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetOrderList(params = {}) {
        return this.request("order/list", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivateGetOrderHistory(params = {}) {
        return this.request("order/history", ["sapi", "private"], 'GET', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivatePostTradeGetQuote(params = {}) {
        return this.request("trade/get-quote", ["sapi", "private"], 'POST', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivatePostTradePlaceOrderBundle(params = {}) {
        return this.request("trade/place-order-bundle", ["sapi", "private"], 'POST', params, undefined, undefined, { "cost": 200 });
    }
    sapiPrivatePostTradeBatchCancel(params = {}) {
        return this.request("trade/batch-cancel", ["sapi", "private"], 'POST', params, undefined, undefined, { "cost": 200 });
    }
}

exports["default"] = Exchange;
