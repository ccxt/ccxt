'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var PredictionExchange = require('../../base/PredictionExchange.js');

// ----------------------------------------------------------------------------
class Exchange extends PredictionExchange["default"] {
    sxbetPublicGetMetadataObv3(params = {}) {
        return this.request('metadata/obv3', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetOrderbookV3Snapshot(params = {}) {
        return this.request('orderbook-v3/snapshot', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetTradesV3Public(params = {}) {
        return this.request('trades-v3/public', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetMarketsActive(params = {}) {
        return this.request('markets/active', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetMarketsFind(params = {}) {
        return this.request('markets/find', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetMarketsPopular(params = {}) {
        return this.request('markets/popular', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetTradesConsolidated(params = {}) {
        return this.request('trades/consolidated', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetTradesOrders(params = {}) {
        return this.request('trades/orders', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetTradesPortfolioRefunds(params = {}) {
        return this.request('trades/portfolio/refunds', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetFixtureActive(params = {}) {
        return this.request('fixture/active', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetFixtureStatus(params = {}) {
        return this.request('fixture/status', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetSports(params = {}) {
        return this.request('sports', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetLeagues(params = {}) {
        return this.request('leagues', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetLeaguesActive(params = {}) {
        return this.request('leagues/active', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetTeams(params = {}) {
        return this.request('teams', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPublicGetLiveScores(params = {}) {
        return this.request('live-scores', ['sxbet', 'public'], 'GET', params, { 'cost': 1 });
    }
    sxbetPrivateGetUserRealtimeTokenV3ApiKey(params = {}) {
        return this.request('user/realtime-token-v3/api-key', ['sxbet', 'private'], 'GET', params, { 'cost': 1 });
    }
    sxbetPrivateGetUserProxy(params = {}) {
        return this.request('user/proxy', ['sxbet', 'private'], 'GET', params, { 'cost': 1 });
    }
    sxbetPrivateGetUserBalanceV3(params = {}) {
        return this.request('user/balance-v3', ['sxbet', 'private'], 'GET', params, { 'cost': 1 });
    }
    sxbetPrivateGetUserTransferToProxyPending(params = {}) {
        return this.request('user/transfer-to-proxy/pending', ['sxbet', 'private'], 'GET', params, { 'cost': 1 });
    }
    sxbetPrivateGetUserTransferToProxyStatus(params = {}) {
        return this.request('user/transfer-to-proxy/status', ['sxbet', 'private'], 'GET', params, { 'cost': 1 });
    }
    sxbetPrivateGetOrdersV3(params = {}) {
        return this.request('orders-v3', ['sxbet', 'private'], 'GET', params, { 'cost': 1 });
    }
    sxbetPrivateGetOrdersV3OrderId(params = {}) {
        return this.request('orders-v3/{orderId}', ['sxbet', 'private'], 'GET', params, { 'cost': 1 });
    }
    sxbetPrivateGetOrdersV3OddsBest(params = {}) {
        return this.request('orders-v3/odds/best', ['sxbet', 'private'], 'GET', params, { 'cost': 1 });
    }
    sxbetPrivateGetTradesV3(params = {}) {
        return this.request('trades-v3', ['sxbet', 'private'], 'GET', params, { 'cost': 1 });
    }
    sxbetPrivateGetFillsV3(params = {}) {
        return this.request('fills-v3', ['sxbet', 'private'], 'GET', params, { 'cost': 1 });
    }
    sxbetPrivateGetPositionsV3(params = {}) {
        return this.request('positions-v3', ['sxbet', 'private'], 'GET', params, { 'cost': 1 });
    }
    sxbetPrivateDeleteOrdersV3(params = {}) {
        return this.request('orders-v3', ['sxbet', 'private'], 'DELETE', params, { 'cost': 1 });
    }
    sxbetPrivateDeleteOrdersV3Event(params = {}) {
        return this.request('orders-v3/event', ['sxbet', 'private'], 'DELETE', params, { 'cost': 1 });
    }
    sxbetPrivateDeleteOrdersV3All(params = {}) {
        return this.request('orders-v3/all', ['sxbet', 'private'], 'DELETE', params, { 'cost': 1 });
    }
    sxbetPrivatePostOrdersV3(params = {}) {
        return this.request('orders-v3', ['sxbet', 'private'], 'POST', params, { 'cost': 1 });
    }
    sxbetPrivatePostUserDeployProxy(params = {}) {
        return this.request('user/deploy-proxy', ['sxbet', 'private'], 'POST', params, { 'cost': 1 });
    }
    sxbetPrivatePostUserTransferToProxy(params = {}) {
        return this.request('user/transfer-to-proxy', ['sxbet', 'private'], 'POST', params, { 'cost': 1 });
    }
    sxbetPrivatePostHeartbeatV3(params = {}) {
        return this.request('heartbeat/v3', ['sxbet', 'private'], 'POST', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
