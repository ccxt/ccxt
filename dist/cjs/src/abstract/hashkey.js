'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetApiV1ExchangeInfo(params = {}) {
        return this.request("api/v1/exchangeInfo", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetQuoteV1Depth(params = {}) {
        return this.request("quote/v1/depth", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetQuoteV1Trades(params = {}) {
        return this.request("quote/v1/trades", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetQuoteV1Klines(params = {}) {
        return this.request("quote/v1/klines", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetQuoteV1Ticker24hr(params = {}) {
        return this.request("quote/v1/ticker/24hr", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetQuoteV1TickerPrice(params = {}) {
        return this.request("quote/v1/ticker/price", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetQuoteV1TickerBookTicker(params = {}) {
        return this.request("quote/v1/ticker/bookTicker", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetQuoteV1DepthMerged(params = {}) {
        return this.request("quote/v1/depth/merged", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetQuoteV1MarkPrice(params = {}) {
        return this.request("quote/v1/markPrice", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetQuoteV1Index(params = {}) {
        return this.request("quote/v1/index", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetApiV1FuturesFundingRate(params = {}) {
        return this.request("api/v1/futures/fundingRate", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetApiV1FuturesHistoryFundingRate(params = {}) {
        return this.request("api/v1/futures/historyFundingRate", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetApiV1Ping(params = {}) {
        return this.request("api/v1/ping", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetApiV1Time(params = {}) {
        return this.request("api/v1/time", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1SpotOrder(params = {}) {
        return this.request("api/v1/spot/order", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1SpotOpenOrders(params = {}) {
        return this.request("api/v1/spot/openOrders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1SpotTradeOrders(params = {}) {
        return this.request("api/v1/spot/tradeOrders", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetApiV1FuturesLeverage(params = {}) {
        return this.request("api/v1/futures/leverage", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1FuturesOrder(params = {}) {
        return this.request("api/v1/futures/order", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1FuturesOpenOrders(params = {}) {
        return this.request("api/v1/futures/openOrders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1FuturesUserTrades(params = {}) {
        return this.request("api/v1/futures/userTrades", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1FuturesPositions(params = {}) {
        return this.request("api/v1/futures/positions", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1FuturesHistoryOrders(params = {}) {
        return this.request("api/v1/futures/historyOrders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1FuturesBalance(params = {}) {
        return this.request("api/v1/futures/balance", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1FuturesLiquidationAssignStatus(params = {}) {
        return this.request("api/v1/futures/liquidationAssignStatus", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1FuturesRiskLimit(params = {}) {
        return this.request("api/v1/futures/riskLimit", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1FuturesCommissionRate(params = {}) {
        return this.request("api/v1/futures/commissionRate", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1FuturesGetBestOrder(params = {}) {
        return this.request("api/v1/futures/getBestOrder", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1CoinInfo(params = {}) {
        return this.request("api/v1/coinInfo", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1AccountVipInfo(params = {}) {
        return this.request("api/v1/account/vipInfo", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1Account(params = {}) {
        return this.request("api/v1/account", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1AccountTrades(params = {}) {
        return this.request("api/v1/account/trades", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetApiV1AccountType(params = {}) {
        return this.request("api/v1/account/type", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetApiV1AccountChainType(params = {}) {
        return this.request("api/v1/account/chainType", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1AccountCheckApiKey(params = {}) {
        return this.request("api/v1/account/checkApiKey", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1AccountBalanceFlow(params = {}) {
        return this.request("api/v1/account/balanceFlow", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetApiV1SpotSubAccountOpenOrders(params = {}) {
        return this.request("api/v1/spot/subAccount/openOrders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1SpotSubAccountTradeOrders(params = {}) {
        return this.request("api/v1/spot/subAccount/tradeOrders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1SubAccountTrades(params = {}) {
        return this.request("api/v1/subAccount/trades", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1FuturesSubAccountOpenOrders(params = {}) {
        return this.request("api/v1/futures/subAccount/openOrders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1FuturesSubAccountHistoryOrders(params = {}) {
        return this.request("api/v1/futures/subAccount/historyOrders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1FuturesSubAccountUserTrades(params = {}) {
        return this.request("api/v1/futures/subAccount/userTrades", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1AccountDepositAddress(params = {}) {
        return this.request("api/v1/account/deposit/address", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1AccountDepositOrders(params = {}) {
        return this.request("api/v1/account/depositOrders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1AccountWithdrawOrders(params = {}) {
        return this.request("api/v1/account/withdrawOrders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetApiV1AffiliateInviteeInfo(params = {}) {
        return this.request("api/v1/affiliate/inviteeInfo", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privatePostApiV1UserDataStream(params = {}) {
        return this.request("api/v1/userDataStream", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostApiV1SpotOrderTest(params = {}) {
        return this.request("api/v1/spot/orderTest", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostApiV1SpotOrder(params = {}) {
        return this.request("api/v1/spot/order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostApiV11SpotOrder(params = {}) {
        return this.request("api/v1.1/spot/order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostApiV1SpotBatchOrders(params = {}) {
        return this.request("api/v1/spot/batchOrders", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostApiV1FuturesLeverage(params = {}) {
        return this.request("api/v1/futures/leverage", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostApiV1FuturesOrder(params = {}) {
        return this.request("api/v1/futures/order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostApiV1FuturesMarginType(params = {}) {
        return this.request("api/v1/futures/marginType", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostApiV1FuturesPositionMargin(params = {}) {
        return this.request("api/v1/futures/positionMargin", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostApiV1FuturesPositionTradingStop(params = {}) {
        return this.request("api/v1/futures/position/trading-stop", "private", 'POST', params, undefined, undefined, { "cost": 3 });
    }
    privatePostApiV1FuturesBatchOrders(params = {}) {
        return this.request("api/v1/futures/batchOrders", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostApiV1AccountAssetTransfer(params = {}) {
        return this.request("api/v1/account/assetTransfer", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostApiV1AccountAuthAddress(params = {}) {
        return this.request("api/v1/account/authAddress", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostApiV1AccountWithdraw(params = {}) {
        return this.request("api/v1/account/withdraw", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePutApiV1UserDataStream(params = {}) {
        return this.request("api/v1/userDataStream", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteApiV1SpotOrder(params = {}) {
        return this.request("api/v1/spot/order", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteApiV1SpotOpenOrders(params = {}) {
        return this.request("api/v1/spot/openOrders", "private", 'DELETE', params, undefined, undefined, { "cost": 5 });
    }
    privateDeleteApiV1SpotCancelOrderByIds(params = {}) {
        return this.request("api/v1/spot/cancelOrderByIds", "private", 'DELETE', params, undefined, undefined, { "cost": 5 });
    }
    privateDeleteApiV1SpotCancelAllOpenOrders(params = {}) {
        return this.request("api/v1/spot/cancelAllOpenOrders", "private", 'DELETE', params, undefined, undefined, { "cost": 5 });
    }
    privateDeleteApiV1FuturesOrder(params = {}) {
        return this.request("api/v1/futures/order", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteApiV1FuturesBatchOrders(params = {}) {
        return this.request("api/v1/futures/batchOrders", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteApiV1FuturesCancelOrderByIds(params = {}) {
        return this.request("api/v1/futures/cancelOrderByIds", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteApiV1FuturesCancelAllOpenOrders(params = {}) {
        return this.request("api/v1/futures/cancelAllOpenOrders", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteApiV1UserDataStream(params = {}) {
        return this.request("api/v1/userDataStream", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
}

exports["default"] = Exchange;
