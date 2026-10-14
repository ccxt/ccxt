'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetApiV1Assets(params = {}) {
        return this.request('api/v1/assets', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Collateral(params = {}) {
        return this.request('api/v1/collateral', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1BorrowLendMarkets(params = {}) {
        return this.request('api/v1/borrowLend/markets', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1BorrowLendMarketsHistory(params = {}) {
        return this.request('api/v1/borrowLend/markets/history', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1BorrowLendApy(params = {}) {
        return this.request('api/v1/borrowLend/apy', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Markets(params = {}) {
        return this.request('api/v1/markets', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Market(params = {}) {
        return this.request('api/v1/market', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Ticker(params = {}) {
        return this.request('api/v1/ticker', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Tickers(params = {}) {
        return this.request('api/v1/tickers', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Depth(params = {}) {
        return this.request('api/v1/depth', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Prediction(params = {}) {
        return this.request('api/v1/prediction', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1PredictionTags(params = {}) {
        return this.request('api/v1/prediction/tags', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1MarketSessions(params = {}) {
        return this.request('api/v1/market-sessions', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1MarketHolidays(params = {}) {
        return this.request('api/v1/market-holidays', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Securities(params = {}) {
        return this.request('api/v1/securities', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Klines(params = {}) {
        return this.request('api/v1/klines', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1MarkPrices(params = {}) {
        return this.request('api/v1/markPrices', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1OpenInterest(params = {}) {
        return this.request('api/v1/openInterest', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1FundingRates(params = {}) {
        return this.request('api/v1/fundingRates', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Status(params = {}) {
        return this.request('api/v1/status', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Ping(params = {}) {
        return this.request('api/v1/ping', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Time(params = {}) {
        return this.request('api/v1/time', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Wallets(params = {}) {
        return this.request('api/v1/wallets', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1Trades(params = {}) {
        return this.request('api/v1/trades', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetApiV1TradesHistory(params = {}) {
        return this.request('api/v1/trades/history', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1Account(params = {}) {
        return this.request('api/v1/account', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1AccountLimitsBorrow(params = {}) {
        return this.request('api/v1/account/limits/borrow', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1AccountLimitsOrder(params = {}) {
        return this.request('api/v1/account/limits/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1AccountLimitsWithdrawal(params = {}) {
        return this.request('api/v1/account/limits/withdrawal', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1BorrowLendPositions(params = {}) {
        return this.request('api/v1/borrowLend/positions', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1BorrowLendPositionLiquidationPrice(params = {}) {
        return this.request('api/v1/borrowLend/position/liquidationPrice', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1Capital(params = {}) {
        return this.request('api/v1/capital', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1CapitalCollateral(params = {}) {
        return this.request('api/v1/capital/collateral', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1CapitalDeposits(params = {}) {
        return this.request('wapi/v1/capital/deposits', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1CapitalDepositAddress(params = {}) {
        return this.request('wapi/v1/capital/deposit/address', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1CapitalWithdrawals(params = {}) {
        return this.request('wapi/v1/capital/withdrawals', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1Position(params = {}) {
        return this.request('api/v1/position', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistoryBorrowLend(params = {}) {
        return this.request('wapi/v1/history/borrowLend', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistoryInterest(params = {}) {
        return this.request('wapi/v1/history/interest', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistoryBorrowLendPositions(params = {}) {
        return this.request('wapi/v1/history/borrowLend/positions', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistoryDust(params = {}) {
        return this.request('wapi/v1/history/dust', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistoryFills(params = {}) {
        return this.request('wapi/v1/history/fills', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistoryFunding(params = {}) {
        return this.request('wapi/v1/history/funding', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistoryPosition(params = {}) {
        return this.request('wapi/v1/history/position', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistoryOrders(params = {}) {
        return this.request('wapi/v1/history/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1Rfqs(params = {}) {
        return this.request('api/v1/rfqs', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistoryRfq(params = {}) {
        return this.request('wapi/v1/history/rfq', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistoryQuote(params = {}) {
        return this.request('wapi/v1/history/quote', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistoryRfqFill(params = {}) {
        return this.request('wapi/v1/history/rfq/fill', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistoryQuoteFill(params = {}) {
        return this.request('wapi/v1/history/quote/fill', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistorySettlement(params = {}) {
        return this.request('wapi/v1/history/settlement', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetWapiV1HistoryStrategies(params = {}) {
        return this.request('wapi/v1/history/strategies', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1Strategy(params = {}) {
        return this.request('api/v1/strategy', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1Strategies(params = {}) {
        return this.request('api/v1/strategies', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1Order(params = {}) {
        return this.request('api/v1/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiV1Orders(params = {}) {
        return this.request('api/v1/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostApiV1AccountConvertDust(params = {}) {
        return this.request('api/v1/account/convertDust', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostApiV1BorrowLend(params = {}) {
        return this.request('api/v1/borrowLend', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWapiV1CapitalWithdrawals(params = {}) {
        return this.request('wapi/v1/capital/withdrawals', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostApiV1Order(params = {}) {
        return this.request('api/v1/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostApiV1Orders(params = {}) {
        return this.request('api/v1/orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostApiV1Rfq(params = {}) {
        return this.request('api/v1/rfq', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostApiV1RfqAccept(params = {}) {
        return this.request('api/v1/rfq/accept', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostApiV1RfqRefresh(params = {}) {
        return this.request('api/v1/rfq/refresh', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostApiV1RfqCancel(params = {}) {
        return this.request('api/v1/rfq/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostApiV1RfqQuote(params = {}) {
        return this.request('api/v1/rfq/quote', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostApiV1Strategy(params = {}) {
        return this.request('api/v1/strategy', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteApiV1Order(params = {}) {
        return this.request('api/v1/order', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteApiV1Orders(params = {}) {
        return this.request('api/v1/orders', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteApiV1Strategy(params = {}) {
        return this.request('api/v1/strategy', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteApiV1Strategies(params = {}) {
        return this.request('api/v1/strategies', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privatePatchApiV1Account(params = {}) {
        return this.request('api/v1/account', ['private'], 'PATCH', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
