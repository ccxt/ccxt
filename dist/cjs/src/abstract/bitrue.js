'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    spotKlinePublicGetPublicJson(params = {}) {
        return this.request('public.json', ['spot', 'kline', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    spotKlinePublicGetPublicCurrencyJson(params = {}) {
        return this.request('public{currency}.json', ['spot', 'kline', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    spotV1PublicGetPing(params = {}) {
        return this.request('ping', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    spotV1PublicGetTime(params = {}) {
        return this.request('time', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    spotV1PublicGetExchangeInfo(params = {}) {
        return this.request('exchangeInfo', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    spotV1PublicGetDepth(params = {}) {
        return this.request('depth', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1, 'byLimit': [[100, 0.24], [500, 1.2], [1000, 2.4]] });
    }
    spotV1PublicGetTrades(params = {}) {
        return this.request('trades', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    spotV1PublicGetHistoricalTrades(params = {}) {
        return this.request('historicalTrades', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 1.2 });
    }
    spotV1PublicGetAggTrades(params = {}) {
        return this.request('aggTrades', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    spotV1PublicGetTicker24hr(params = {}) {
        return this.request('ticker/24hr', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24, 'noSymbol': 9.6 });
    }
    spotV1PublicGetTickerPrice(params = {}) {
        return this.request('ticker/price', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    spotV1PublicGetTickerBookTicker(params = {}) {
        return this.request('ticker/bookTicker', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    spotV1PublicGetMarketKline(params = {}) {
        return this.request('market/kline', ['spot', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    spotV1PrivateGetOrder(params = {}) {
        return this.request('order', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    spotV1PrivateGetOpenOrders(params = {}) {
        return this.request('openOrders', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    spotV1PrivateGetAllOrders(params = {}) {
        return this.request('allOrders', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    spotV1PrivateGetAccount(params = {}) {
        return this.request('account', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    spotV1PrivateGetMyTrades(params = {}) {
        return this.request('myTrades', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    spotV1PrivateGetEtfNetValueSymbol(params = {}) {
        return this.request('etf/net-value/{symbol}', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    spotV1PrivateGetWithdrawHistory(params = {}) {
        return this.request('withdraw/history', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 120 });
    }
    spotV1PrivateGetDepositHistory(params = {}) {
        return this.request('deposit/history', ['spot', 'v1', 'private'], 'GET', params, undefined, undefined, { 'cost': 120 });
    }
    spotV1PrivatePostOrder(params = {}) {
        return this.request('order', ['spot', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    spotV1PrivatePostWithdrawCommit(params = {}) {
        return this.request('withdraw/commit', ['spot', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 120 });
    }
    spotV1PrivateDeleteOrder(params = {}) {
        return this.request('order', ['spot', 'v1', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 5 });
    }
    spotV2PrivateGetMyTrades(params = {}) {
        return this.request('myTrades', ['spot', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 1.2 });
    }
    fapiV1PublicGetPing(params = {}) {
        return this.request('ping', ['fapi', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    fapiV1PublicGetTime(params = {}) {
        return this.request('time', ['fapi', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    fapiV1PublicGetContracts(params = {}) {
        return this.request('contracts', ['fapi', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    fapiV1PublicGetDepth(params = {}) {
        return this.request('depth', ['fapi', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    fapiV1PublicGetTicker(params = {}) {
        return this.request('ticker', ['fapi', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    fapiV1PublicGetKlines(params = {}) {
        return this.request('klines', ['fapi', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    fapiV2PrivateGetMyTrades(params = {}) {
        return this.request('myTrades', ['fapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    fapiV2PrivateGetOpenOrders(params = {}) {
        return this.request('openOrders', ['fapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    fapiV2PrivateGetOrder(params = {}) {
        return this.request('order', ['fapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    fapiV2PrivateGetAccount(params = {}) {
        return this.request('account', ['fapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    fapiV2PrivateGetLeverageBracket(params = {}) {
        return this.request('leverageBracket', ['fapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    fapiV2PrivateGetCommissionRate(params = {}) {
        return this.request('commissionRate', ['fapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    fapiV2PrivateGetFuturesTransferHistory(params = {}) {
        return this.request('futures_transfer_history', ['fapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    fapiV2PrivateGetForceOrdersHistory(params = {}) {
        return this.request('forceOrdersHistory', ['fapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    fapiV2PrivatePostPositionMargin(params = {}) {
        return this.request('positionMargin', ['fapi', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    fapiV2PrivatePostLevelEdit(params = {}) {
        return this.request('level_edit', ['fapi', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    fapiV2PrivatePostCancel(params = {}) {
        return this.request('cancel', ['fapi', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    fapiV2PrivatePostOrder(params = {}) {
        return this.request('order', ['fapi', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 25 });
    }
    fapiV2PrivatePostAllOpenOrders(params = {}) {
        return this.request('allOpenOrders', ['fapi', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    fapiV2PrivatePostFuturesTransfer(params = {}) {
        return this.request('futures_transfer', ['fapi', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV1PublicGetPing(params = {}) {
        return this.request('ping', ['dapi', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    dapiV1PublicGetTime(params = {}) {
        return this.request('time', ['dapi', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    dapiV1PublicGetContracts(params = {}) {
        return this.request('contracts', ['dapi', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    dapiV1PublicGetDepth(params = {}) {
        return this.request('depth', ['dapi', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    dapiV1PublicGetTicker(params = {}) {
        return this.request('ticker', ['dapi', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    dapiV1PublicGetKlines(params = {}) {
        return this.request('klines', ['dapi', 'v1', 'public'], 'GET', params, undefined, undefined, { 'cost': 0.24 });
    }
    dapiV2PrivateGetMyTrades(params = {}) {
        return this.request('myTrades', ['dapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV2PrivateGetOpenOrders(params = {}) {
        return this.request('openOrders', ['dapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV2PrivateGetOrder(params = {}) {
        return this.request('order', ['dapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV2PrivateGetAccount(params = {}) {
        return this.request('account', ['dapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV2PrivateGetLeverageBracket(params = {}) {
        return this.request('leverageBracket', ['dapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV2PrivateGetCommissionRate(params = {}) {
        return this.request('commissionRate', ['dapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV2PrivateGetFuturesTransferHistory(params = {}) {
        return this.request('futures_transfer_history', ['dapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV2PrivateGetForceOrdersHistory(params = {}) {
        return this.request('forceOrdersHistory', ['dapi', 'v2', 'private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV2PrivatePostPositionMargin(params = {}) {
        return this.request('positionMargin', ['dapi', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV2PrivatePostLevelEdit(params = {}) {
        return this.request('level_edit', ['dapi', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV2PrivatePostCancel(params = {}) {
        return this.request('cancel', ['dapi', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV2PrivatePostOrder(params = {}) {
        return this.request('order', ['dapi', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV2PrivatePostAllOpenOrders(params = {}) {
        return this.request('allOpenOrders', ['dapi', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    dapiV2PrivatePostFuturesTransfer(params = {}) {
        return this.request('futures_transfer', ['dapi', 'v2', 'private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    openV1PrivatePostPoseidonApiV1ListenKey(params = {}) {
        return this.request('poseidon/api/v1/listenKey', ['open', 'v1', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    openV1PrivatePutPoseidonApiV1ListenKeyListenKey(params = {}) {
        return this.request('poseidon/api/v1/listenKey/{listenKey}', ['open', 'v1', 'private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    openV1PrivateDeletePoseidonApiV1ListenKeyListenKey(params = {}) {
        return this.request('poseidon/api/v1/listenKey/{listenKey}', ['open', 'v1', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
