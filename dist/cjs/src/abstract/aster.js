'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    fapiPublicGetV1Ping(params = {}) {
        return this.request('v1/ping', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3Ping(params = {}) {
        return this.request('v3/ping', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1Time(params = {}) {
        return this.request('v1/time', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3Time(params = {}) {
        return this.request('v3/time', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1ExchangeInfo(params = {}) {
        return this.request('v1/exchangeInfo', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3ExchangeInfo(params = {}) {
        return this.request('v3/exchangeInfo', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1Depth(params = {}) {
        return this.request('v1/depth', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3Depth(params = {}) {
        return this.request('v3/depth', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    fapiPublicGetV1Trades(params = {}) {
        return this.request('v1/trades', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3Trades(params = {}) {
        return this.request('v3/trades', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1HistoricalTrades(params = {}) {
        return this.request('v1/historicalTrades', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3HistoricalTrades(params = {}) {
        return this.request('v3/historicalTrades', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    fapiPublicGetV1AggTrades(params = {}) {
        return this.request('v1/aggTrades', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3AggTrades(params = {}) {
        return this.request('v3/aggTrades', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    fapiPublicGetV1Klines(params = {}) {
        return this.request('v1/klines', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3Klines(params = {}) {
        return this.request('v3/klines', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1IndexPriceKlines(params = {}) {
        return this.request('v1/indexPriceKlines', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3IndexPriceKlines(params = {}) {
        return this.request('v3/indexPriceKlines', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1MarkPriceKlines(params = {}) {
        return this.request('v1/markPriceKlines', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3MarkPriceKlines(params = {}) {
        return this.request('v3/markPriceKlines', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1PremiumIndex(params = {}) {
        return this.request('v1/premiumIndex', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3PremiumIndex(params = {}) {
        return this.request('v3/premiumIndex', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1FundingRate(params = {}) {
        return this.request('v1/fundingRate', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3FundingRate(params = {}) {
        return this.request('v3/fundingRate', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1FundingInfo(params = {}) {
        return this.request('v1/fundingInfo', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3FundingInfo(params = {}) {
        return this.request('v3/fundingInfo', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1Ticker24hr(params = {}) {
        return this.request('v1/ticker/24hr', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3Ticker24hr(params = {}) {
        return this.request('v3/ticker/24hr', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1TickerPrice(params = {}) {
        return this.request('v1/ticker/price', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3TickerPrice(params = {}) {
        return this.request('v3/ticker/price', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1TickerBookTicker(params = {}) {
        return this.request('v1/ticker/bookTicker', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3TickerBookTicker(params = {}) {
        return this.request('v3/ticker/bookTicker', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1AdlQuantile(params = {}) {
        return this.request('v1/adlQuantile', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV1ForceOrders(params = {}) {
        return this.request('v1/forceOrders', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPublicGetV3Indexreferences(params = {}) {
        return this.request('v3/indexreferences', ['fapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV1PositionSideDual(params = {}) {
        return this.request('v1/positionSide/dual', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3PositionSideDual(params = {}) {
        return this.request('v3/positionSide/dual', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    fapiPrivateGetV1MultiAssetsMargin(params = {}) {
        return this.request('v1/multiAssetsMargin', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3MultiAssetsMargin(params = {}) {
        return this.request('v3/multiAssetsMargin', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV1Order(params = {}) {
        return this.request('v1/order', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3Order(params = {}) {
        return this.request('v3/order', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV1OpenOrder(params = {}) {
        return this.request('v1/openOrder', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3OpenOrder(params = {}) {
        return this.request('v3/openOrder', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV1OpenOrders(params = {}) {
        return this.request('v1/openOrders', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3OpenOrders(params = {}) {
        return this.request('v3/openOrders', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV1AllOrders(params = {}) {
        return this.request('v1/allOrders', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3AllOrders(params = {}) {
        return this.request('v3/allOrders', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV2Balance(params = {}) {
        return this.request('v2/balance', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3Balance(params = {}) {
        return this.request('v3/balance', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3Account(params = {}) {
        return this.request('v3/account', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV1PositionMarginHistory(params = {}) {
        return this.request('v1/positionMargin/history', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3PositionMarginHistory(params = {}) {
        return this.request('v3/positionMargin/history', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV2PositionRisk(params = {}) {
        return this.request('v2/positionRisk', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3PositionRisk(params = {}) {
        return this.request('v3/positionRisk', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV1UserTrades(params = {}) {
        return this.request('v1/userTrades', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3UserTrades(params = {}) {
        return this.request('v3/userTrades', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    fapiPrivateGetV1Income(params = {}) {
        return this.request('v1/income', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3Income(params = {}) {
        return this.request('v3/income', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV1LeverageBracket(params = {}) {
        return this.request('v1/leverageBracket', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3LeverageBracket(params = {}) {
        return this.request('v3/leverageBracket', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV1CommissionRate(params = {}) {
        return this.request('v1/commissionRate', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3CommissionRate(params = {}) {
        return this.request('v3/commissionRate', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3AdlQuantile(params = {}) {
        return this.request('v3/adlQuantile', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3ForceOrders(params = {}) {
        return this.request('v3/forceOrders', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3Mmp(params = {}) {
        return this.request('v3/mmp', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3AccountWithJoinMargin(params = {}) {
        return this.request('v3/accountWithJoinMargin', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV4Account(params = {}) {
        return this.request('v4/account', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3Agent(params = {}) {
        return this.request('v3/agent', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3Builder(params = {}) {
        return this.request('v3/builder', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateGetV3BuilderUserTrades(params = {}) {
        return this.request('v3/builder/userTrades', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    fapiPrivateGetV3BuilderApprovedUserList(params = {}) {
        return this.request('v3/builder/approvedUserList', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    fapiPrivateGetV3StpMode(params = {}) {
        return this.request('v3/stpMode', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    fapiPrivateGetV3AssetMigrateUserHistory(params = {}) {
        return this.request('v3/asset/migrateUser/history', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    fapiPrivateGetV3StrategyOpenOrder(params = {}) {
        return this.request('v3/strategyOpenOrder', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    fapiPrivateGetV3StrategyHistoryOrder(params = {}) {
        return this.request('v3/strategyHistoryOrder', ['fapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    fapiPrivatePostV1PositionSideDual(params = {}) {
        return this.request('v1/positionSide/dual', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3PositionSideDual(params = {}) {
        return this.request('v3/positionSide/dual', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV1MultiAssetsMargin(params = {}) {
        return this.request('v1/multiAssetsMargin', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3MultiAssetsMargin(params = {}) {
        return this.request('v3/multiAssetsMargin', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV1Order(params = {}) {
        return this.request('v1/order', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3Order(params = {}) {
        return this.request('v3/order', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV1OrderTest(params = {}) {
        return this.request('v1/order/test', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3OrderTest(params = {}) {
        return this.request('v3/order/test', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV1BatchOrders(params = {}) {
        return this.request('v1/batchOrders', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3BatchOrders(params = {}) {
        return this.request('v3/batchOrders', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV1AssetWalletTransfer(params = {}) {
        return this.request('v1/asset/wallet/transfer', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3AssetWalletTransfer(params = {}) {
        return this.request('v3/asset/wallet/transfer', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV1CountdownCancelAll(params = {}) {
        return this.request('v1/countdownCancelAll', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3CountdownCancelAll(params = {}) {
        return this.request('v3/countdownCancelAll', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV1Leverage(params = {}) {
        return this.request('v1/leverage', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3Leverage(params = {}) {
        return this.request('v3/leverage', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV1MarginType(params = {}) {
        return this.request('v1/marginType', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3MarginType(params = {}) {
        return this.request('v3/marginType', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV1PositionMargin(params = {}) {
        return this.request('v1/positionMargin', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3PositionMargin(params = {}) {
        return this.request('v3/positionMargin', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV1ListenKey(params = {}) {
        return this.request('v1/listenKey', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3ListenKey(params = {}) {
        return this.request('v3/listenKey', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3Mmp(params = {}) {
        return this.request('v3/mmp', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3MmpReset(params = {}) {
        return this.request('v3/mmpReset', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3Noop(params = {}) {
        return this.request('v3/noop', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3ApproveAgent(params = {}) {
        return this.request('v3/approveAgent', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3UpdateAgent(params = {}) {
        return this.request('v3/updateAgent', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3ApproveBuilder(params = {}) {
        return this.request('v3/approveBuilder', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3UpdateBuilder(params = {}) {
        return this.request('v3/updateBuilder', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3RegisterAndApproveAgent(params = {}) {
        return this.request('v3/registerAndApproveAgent', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    fapiPrivatePostV3AssetMigrateUser(params = {}) {
        return this.request('v3/asset/migrateUser', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    fapiPrivatePostV3Chase(params = {}) {
        return this.request('v3/chase', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3StpMode(params = {}) {
        return this.request('v3/stpMode', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePostV3PlaceStrategyOrder(params = {}) {
        return this.request('v3/placeStrategyOrder', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    fapiPrivatePostV3UpdateStrategyOrder(params = {}) {
        return this.request('v3/updateStrategyOrder', ['fapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    fapiPrivatePutV1ListenKey(params = {}) {
        return this.request('v1/listenKey', ['fapiPrivate'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivatePutV3ListenKey(params = {}) {
        return this.request('v3/listenKey', ['fapiPrivate'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateDeleteV1Order(params = {}) {
        return this.request('v1/order', ['fapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateDeleteV3Order(params = {}) {
        return this.request('v3/order', ['fapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateDeleteV1AllOpenOrders(params = {}) {
        return this.request('v1/allOpenOrders', ['fapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateDeleteV3AllOpenOrders(params = {}) {
        return this.request('v3/allOpenOrders', ['fapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateDeleteV1BatchOrders(params = {}) {
        return this.request('v1/batchOrders', ['fapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateDeleteV3BatchOrders(params = {}) {
        return this.request('v3/batchOrders', ['fapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateDeleteV3GuardedCancelOrder(params = {}) {
        return this.request('v3/guardedCancelOrder', ['fapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateDeleteV3GuardedBatchOrders(params = {}) {
        return this.request('v3/guardedBatchOrders', ['fapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateDeleteV3Mmp(params = {}) {
        return this.request('v3/mmp', ['fapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateDeleteV1ListenKey(params = {}) {
        return this.request('v1/listenKey', ['fapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateDeleteV3ListenKey(params = {}) {
        return this.request('v3/listenKey', ['fapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateDeleteV3Agent(params = {}) {
        return this.request('v3/agent', ['fapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    fapiPrivateDeleteV3Builder(params = {}) {
        return this.request('v3/builder', ['fapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV1Ping(params = {}) {
        return this.request('v1/ping', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV1Time(params = {}) {
        return this.request('v1/time', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV1ExchangeInfo(params = {}) {
        return this.request('v1/exchangeInfo', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV1Depth(params = {}) {
        return this.request('v1/depth', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV1Trades(params = {}) {
        return this.request('v1/trades', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV1HistoricalTrades(params = {}) {
        return this.request('v1/historicalTrades', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV1AggTrades(params = {}) {
        return this.request('v1/aggTrades', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV1Klines(params = {}) {
        return this.request('v1/klines', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV1Ticker24hr(params = {}) {
        return this.request('v1/ticker/24hr', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV1TickerPrice(params = {}) {
        return this.request('v1/ticker/price', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV1TickerBookTicker(params = {}) {
        return this.request('v1/ticker/bookTicker', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV1AsterWithdrawEstimateFee(params = {}) {
        return this.request('v1/aster/withdraw/estimateFee', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV3Ping(params = {}) {
        return this.request('v3/ping', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV3Time(params = {}) {
        return this.request('v3/time', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV3ExchangeInfo(params = {}) {
        return this.request('v3/exchangeInfo', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV3Depth(params = {}) {
        return this.request('v3/depth', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 2, 'byLimit': [[50, 2], [100, 5], [500, 10], [1000, 20]] });
    }
    sapiPublicGetV3Trades(params = {}) {
        return this.request('v3/trades', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPublicGetV3HistoricalTrades(params = {}) {
        return this.request('v3/historicalTrades', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    sapiPublicGetV3AggTrades(params = {}) {
        return this.request('v3/aggTrades', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    sapiPublicGetV3Klines(params = {}) {
        return this.request('v3/klines', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1, 'byLimit': [[99, 1], [499, 2], [1000, 5], [10000, 10]] });
    }
    sapiPublicGetV3Ticker24hr(params = {}) {
        return this.request('v3/ticker/24hr', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1, 'noSymbol': 40 });
    }
    sapiPublicGetV3TickerPrice(params = {}) {
        return this.request('v3/ticker/price', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1, 'noSymbol': 2 });
    }
    sapiPublicGetV3TickerBookTicker(params = {}) {
        return this.request('v3/ticker/bookTicker', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1, 'noSymbol': 2 });
    }
    sapiPublicGetV3AsterWithdrawEstimateFee(params = {}) {
        return this.request('v3/aster/withdraw/estimateFee', ['sapiPublic'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateGetV1CommissionRate(params = {}) {
        return this.request('v1/commissionRate', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateGetV1Order(params = {}) {
        return this.request('v1/order', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateGetV1OpenOrders(params = {}) {
        return this.request('v1/openOrders', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateGetV1AllOrders(params = {}) {
        return this.request('v1/allOrders', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateGetV1TransactionHistory(params = {}) {
        return this.request('v1/transactionHistory', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateGetV1Account(params = {}) {
        return this.request('v1/account', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateGetV1UserTrades(params = {}) {
        return this.request('v1/userTrades', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateGetV3CommissionRate(params = {}) {
        return this.request('v3/commissionRate', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1, 'noSymbol': 2 });
    }
    sapiPrivateGetV3Order(params = {}) {
        return this.request('v3/order', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateGetV3OpenOrders(params = {}) {
        return this.request('v3/openOrders', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateGetV3AllOrders(params = {}) {
        return this.request('v3/allOrders', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    sapiPrivateGetV3Account(params = {}) {
        return this.request('v3/account', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    sapiPrivateGetV3UserTrades(params = {}) {
        return this.request('v3/userTrades', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    sapiPrivateGetV3OpenOrder(params = {}) {
        return this.request('v3/openOrder', ['sapiPrivate'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivatePostV1Order(params = {}) {
        return this.request('v1/order', ['sapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivatePostV1AssetWalletTransfer(params = {}) {
        return this.request('v1/asset/wallet/transfer', ['sapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    sapiPrivatePostV1AssetSendToAddress(params = {}) {
        return this.request('v1/asset/sendToAddress', ['sapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivatePostV1ListenKey(params = {}) {
        return this.request('v1/listenKey', ['sapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivatePostV3Order(params = {}) {
        return this.request('v3/order', ['sapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivatePostV3AssetWalletTransfer(params = {}) {
        return this.request('v3/asset/wallet/transfer', ['sapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    sapiPrivatePostV3AsterUserWithdraw(params = {}) {
        return this.request('v3/aster/user-withdraw', ['sapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivatePostV3ListenKey(params = {}) {
        return this.request('v3/listenKey', ['sapiPrivate'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivatePutV1ListenKey(params = {}) {
        return this.request('v1/listenKey', ['sapiPrivate'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivatePutV3ListenKey(params = {}) {
        return this.request('v3/listenKey', ['sapiPrivate'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateDeleteV1Order(params = {}) {
        return this.request('v1/order', ['sapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateDeleteV1AllOpenOrders(params = {}) {
        return this.request('v1/allOpenOrders', ['sapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateDeleteV1ListenKey(params = {}) {
        return this.request('v1/listenKey', ['sapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateDeleteV3AllOpenOrders(params = {}) {
        return this.request('v3/allOpenOrders', ['sapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateDeleteV3Order(params = {}) {
        return this.request('v3/order', ['sapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    sapiPrivateDeleteV3ListenKey(params = {}) {
        return this.request('v3/listenKey', ['sapiPrivate'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
