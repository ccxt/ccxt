'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicSpotGetV2SystemTime(params = {}) {
        return this.request('v2/system/time', ['public', 'spot'], 'GET', params, { 'cost': 10 });
    }
    publicSpotGetV2SystemStatus(params = {}) {
        return this.request('v2/system/status', ['public', 'spot'], 'GET', params, { 'cost': 10 });
    }
    publicSpotGetV2MarketOrderbook(params = {}) {
        return this.request('v2/market/orderbook', ['public', 'spot'], 'GET', params, { 'cost': 10 });
    }
    publicSpotGetV2MarketOrderbookTicker(params = {}) {
        return this.request('v2/market/orderbook/ticker', ['public', 'spot'], 'GET', params, { 'cost': 10 });
    }
    publicSpotGetV2MarketTrades(params = {}) {
        return this.request('v2/market/trades', ['public', 'spot'], 'GET', params, { 'cost': 10 });
    }
    publicSpotGetV2MarketTicker(params = {}) {
        return this.request('v2/market/ticker', ['public', 'spot'], 'GET', params, { 'cost': 10 });
    }
    publicSpotGetV2MarketAllTickers(params = {}) {
        return this.request('v2/market/allTickers', ['public', 'spot'], 'GET', params, { 'cost': 10 });
    }
    publicSpotGetV2ExExchangeInfo(params = {}) {
        return this.request('v2/ex/exchangeInfo', ['public', 'spot'], 'GET', params, { 'cost': 10 });
    }
    publicSpotGetV2ExCurrencies(params = {}) {
        return this.request('v2/ex/currencies', ['public', 'spot'], 'GET', params, { 'cost': 10 });
    }
    publicSpotGetV2MarketKlines(params = {}) {
        return this.request('v2/market/klines', ['public', 'spot'], 'GET', params, { 'cost': 10 });
    }
    publicSpotGetV2ExTradefees(params = {}) {
        return this.request('v2/ex/tradefees', ['public', 'spot'], 'GET', params, { 'cost': 10 });
    }
    publicSwapGetV1SystemTime(params = {}) {
        return this.request('v1/system/time', ['public', 'swap'], 'GET', params, { 'cost': 10 });
    }
    publicSwapGetV1SystemStatus(params = {}) {
        return this.request('v1/system/status', ['public', 'swap'], 'GET', params, { 'cost': 10 });
    }
    publicSwapGetV1ExchangeTradefee(params = {}) {
        return this.request('v1/exchange/tradefee', ['public', 'swap'], 'GET', params, { 'cost': 10 });
    }
    publicSwapGetV1ExchangeTradefees(params = {}) {
        return this.request('v1/exchange/tradefees', ['public', 'swap'], 'GET', params, { 'cost': 10 });
    }
    publicSwapGetV1ExchangeExchangeInfo(params = {}) {
        return this.request('v1/exchange/exchangeInfo', ['public', 'swap'], 'GET', params, { 'cost': 10 });
    }
    publicSwapGetV1ExchangePairs(params = {}) {
        return this.request('v1/exchange/pairs', ['public', 'swap'], 'GET', params, { 'cost': 10 });
    }
    publicSwapGetV1MarketOrderBook(params = {}) {
        return this.request('v1/market/orderBook', ['public', 'swap'], 'GET', params, { 'cost': 10 });
    }
    publicSwapGetV1MarketTicker24Hr(params = {}) {
        return this.request('v1/market/ticker24Hr', ['public', 'swap'], 'GET', params, { 'cost': 10 });
    }
    publicSwapGetV1MarketMarkets(params = {}) {
        return this.request('v1/market/markets', ['public', 'swap'], 'GET', params, { 'cost': 10 });
    }
    publicSwapGetV1MarketMarketInfo(params = {}) {
        return this.request('v1/market/marketInfo', ['public', 'swap'], 'GET', params, { 'cost': 10 });
    }
    publicSwapGetV1MarketAggTrade(params = {}) {
        return this.request('v1/market/aggTrade', ['public', 'swap'], 'GET', params, { 'cost': 10 });
    }
    publicSwapPostV1MarketKlines(params = {}) {
        return this.request('v1/market/klines', ['public', 'swap'], 'POST', params, { 'cost': 10 });
    }
    privateSpotPostV2ExOrders(params = {}) {
        return this.request('v2/ex/orders', ['private', 'spot'], 'POST', params, { 'cost': 10 });
    }
    privateSpotGetV2ExOrders(params = {}) {
        return this.request('v2/ex/orders', ['private', 'spot'], 'GET', params, { 'cost': 10 });
    }
    privateSpotGetV2AccountBalance(params = {}) {
        return this.request('v2/account/balance', ['private', 'spot'], 'GET', params, { 'cost': 10 });
    }
    privateSpotGetV2ExTradefee(params = {}) {
        return this.request('v2/ex/tradefee', ['private', 'spot'], 'GET', params, { 'cost': 10 });
    }
    privateSpotGetV2ExMyfeeSymbol(params = {}) {
        return this.request('v2/ex/myfee/{symbol}', ['private', 'spot'], 'GET', params, { 'cost': 10 });
    }
    privateSpotGetV2ExOrder(params = {}) {
        return this.request('v2/ex/order', ['private', 'spot'], 'GET', params, { 'cost': 10 });
    }
    privateSpotGetV2ExOrderFills(params = {}) {
        return this.request('v2/ex/order/fills', ['private', 'spot'], 'GET', params, { 'cost': 10 });
    }
    privateSpotDeleteV2ExOrder(params = {}) {
        return this.request('v2/ex/order', ['private', 'spot'], 'DELETE', params, { 'cost': 10 });
    }
    privateSpotDeleteV2ExOrders(params = {}) {
        return this.request('v2/ex/orders', ['private', 'spot'], 'DELETE', params, { 'cost': 10 });
    }
    privateSpotDeleteV2ExOrdersCancelAll(params = {}) {
        return this.request('v2/ex/orders/cancelAll', ['private', 'spot'], 'DELETE', params, { 'cost': 10 });
    }
    privateSwapGetV1WalletBalance(params = {}) {
        return this.request('v1/wallet/balance', ['private', 'swap'], 'GET', params, { 'cost': 10 });
    }
    privateSwapGetV1TradeOrder(params = {}) {
        return this.request('v1/trade/order', ['private', 'swap'], 'GET', params, { 'cost': 10 });
    }
    privateSwapGetV1TradeOrderOpenOrders(params = {}) {
        return this.request('v1/trade/order/open-orders', ['private', 'swap'], 'GET', params, { 'cost': 10 });
    }
    privateSwapGetV1TradeOrderHistory(params = {}) {
        return this.request('v1/trade/order/history', ['private', 'swap'], 'GET', params, { 'cost': 10 });
    }
    privateSwapGetV1TradeUserLeverages(params = {}) {
        return this.request('v1/trade/userLeverages', ['private', 'swap'], 'GET', params, { 'cost': 10 });
    }
    privateSwapGetV1TradeUserLeverage(params = {}) {
        return this.request('v1/trade/userLeverage', ['private', 'swap'], 'GET', params, { 'cost': 10 });
    }
    privateSwapGetV1TradePositions(params = {}) {
        return this.request('v1/trade/positions', ['private', 'swap'], 'GET', params, { 'cost': 10 });
    }
    privateSwapGetV1TradeHistory(params = {}) {
        return this.request('v1/trade/history', ['private', 'swap'], 'GET', params, { 'cost': 10 });
    }
    privateSwapGetV1TradeTransactionHistory(params = {}) {
        return this.request('v1/trade/transaction/history', ['private', 'swap'], 'GET', params, { 'cost': 10 });
    }
    privateSwapPostV1TradeOrder(params = {}) {
        return this.request('v1/trade/order', ['private', 'swap'], 'POST', params, { 'cost': 10 });
    }
    privateSwapPostV1TradeOrderAddTPSL(params = {}) {
        return this.request('v1/trade/order/addTPSL', ['private', 'swap'], 'POST', params, { 'cost': 10 });
    }
    privateSwapPostV1TradeAddMargin(params = {}) {
        return this.request('v1/trade/addMargin', ['private', 'swap'], 'POST', params, { 'cost': 10 });
    }
    privateSwapPostV1TradeReduceMargin(params = {}) {
        return this.request('v1/trade/reduceMargin', ['private', 'swap'], 'POST', params, { 'cost': 10 });
    }
    privateSwapPostV1TradePositionClose(params = {}) {
        return this.request('v1/trade/position/close', ['private', 'swap'], 'POST', params, { 'cost': 10 });
    }
    privateSwapPostV1TradeUpdateUserLeverage(params = {}) {
        return this.request('v1/trade/update/userLeverage', ['private', 'swap'], 'POST', params, { 'cost': 10 });
    }
    privateSwapDeleteV1TradeOrder(params = {}) {
        return this.request('v1/trade/order', ['private', 'swap'], 'DELETE', params, { 'cost': 10 });
    }
    privateSwapDeleteV1TradeOrderAll(params = {}) {
        return this.request('v1/trade/order/all', ['private', 'swap'], 'DELETE', params, { 'cost': 10 });
    }
    privateSwapPatchV1TradeOrder(params = {}) {
        return this.request('v1/trade/order', ['private', 'swap'], 'PATCH', params, { 'cost': 10 });
    }
}

exports["default"] = Exchange;
