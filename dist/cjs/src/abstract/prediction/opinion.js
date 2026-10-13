'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var PredictionExchange = require('../../base/PredictionExchange.js');

// ----------------------------------------------------------------------------
class Exchange extends PredictionExchange["default"] {
    opinionPublicGetMarket(params = {}) {
        return this.request("market", ["opinion", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPublicGetMarketMarketId(params = {}) {
        return this.request("market/{marketId}", ["opinion", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPublicGetMarketCategoricalMarketId(params = {}) {
        return this.request("market/categorical/{marketId}", ["opinion", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPublicGetMarketSlugSlug(params = {}) {
        return this.request("market/slug/{slug}", ["opinion", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPublicGetLabel(params = {}) {
        return this.request("label", ["opinion", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPublicGetTokenLatestPrice(params = {}) {
        return this.request("token/latest-price", ["opinion", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPublicGetTokenOrderbook(params = {}) {
        return this.request("token/orderbook", ["opinion", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPublicGetTokenPriceHistory(params = {}) {
        return this.request("token/price-history", ["opinion", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPublicGetQuoteToken(params = {}) {
        return this.request("quoteToken", ["opinion", "public"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPrivateGetOrder(params = {}) {
        return this.request("order", ["opinion", "private"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPrivateGetOrderOrderId(params = {}) {
        return this.request("order/{orderId}", ["opinion", "private"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPrivateGetPositionsUserWalletAddress(params = {}) {
        return this.request("positions/user/{walletAddress}", ["opinion", "private"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPrivateGetTradeUserWalletAddress(params = {}) {
        return this.request("trade/user/{walletAddress}", ["opinion", "private"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPrivateGetAuthApiKey(params = {}) {
        return this.request("auth/api-key", ["opinion", "private"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPrivateGetUserAuth(params = {}) {
        return this.request("user/auth", ["opinion", "private"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPrivateGetUserBalance(params = {}) {
        return this.request("user/balance", ["opinion", "private"], 'GET', params, undefined, undefined, { "cost": 1 });
    }
    opinionPrivatePostAuthApiKey(params = {}) {
        return this.request("auth/api-key", ["opinion", "private"], 'POST', params, undefined, undefined, { "cost": 1 });
    }
    opinionPrivatePostOrder(params = {}) {
        return this.request("order", ["opinion", "private"], 'POST', params, undefined, undefined, { "cost": 1 });
    }
    opinionPrivatePostOrderCancel(params = {}) {
        return this.request("order/cancel", ["opinion", "private"], 'POST', params, undefined, undefined, { "cost": 1 });
    }
    opinionPrivateDeleteAuthApiKey(params = {}) {
        return this.request("auth/api-key", ["opinion", "private"], 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
}

exports["default"] = Exchange;
