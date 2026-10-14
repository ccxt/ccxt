'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetFeeschedules(params = {}) {
        return this.request('feeschedules', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetInstruments(params = {}) {
        return this.request('instruments', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetInstrumentsStatus(params = {}) {
        return this.request('instruments/status', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetInstrumentsSymbolStatus(params = {}) {
        return this.request('instruments/{symbol}/status', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetOrderbook(params = {}) {
        return this.request('orderbook', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTickers(params = {}) {
        return this.request('tickers', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTickersSymbol(params = {}) {
        return this.request('tickers/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetHistory(params = {}) {
        return this.request('history', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetHistoricalfundingrates(params = {}) {
        return this.request('historicalfundingrates', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetFeeschedulesVolumes(params = {}) {
        return this.request('feeschedules/volumes', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetOpenpositions(params = {}) {
        return this.request('openpositions', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetNotifications(params = {}) {
        return this.request('notifications', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccounts(params = {}) {
        return this.request('accounts', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetOpenorders(params = {}) {
        return this.request('openorders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetRecentorders(params = {}) {
        return this.request('recentorders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetFills(params = {}) {
        return this.request('fills', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTransfers(params = {}) {
        return this.request('transfers', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetLeveragepreferences(params = {}) {
        return this.request('leveragepreferences', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetPnlpreferences(params = {}) {
        return this.request('pnlpreferences', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAssignmentprogramCurrent(params = {}) {
        return this.request('assignmentprogram/current', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAssignmentprogramHistory(params = {}) {
        return this.request('assignmentprogram/history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetOrdersStatus(params = {}) {
        return this.request('orders/status', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUnwindqueue(params = {}) {
        return this.request('unwindqueue', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetSelfTradeStrategy(params = {}) {
        return this.request('self-trade-strategy', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetSubaccounts(params = {}) {
        return this.request('subaccounts', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetSubaccountUidTradingEnabled(params = {}) {
        return this.request('subaccount/{uid}/trading-enabled', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetRfqAssignmentMaxLeverage(params = {}) {
        return this.request('rfq-assignment/max-leverage', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostSendorder(params = {}) {
        return this.request('sendorder', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostEditorder(params = {}) {
        return this.request('editorder', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelorder(params = {}) {
        return this.request('cancelorder', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTransfer(params = {}) {
        return this.request('transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTransferSubaccount(params = {}) {
        return this.request('transfer/subaccount', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostBatchorder(params = {}) {
        return this.request('batchorder', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelallorders(params = {}) {
        return this.request('cancelallorders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostCancelallordersafter(params = {}) {
        return this.request('cancelallordersafter', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostWithdrawal(params = {}) {
        return this.request('withdrawal', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAssignmentprogramAdd(params = {}) {
        return this.request('assignmentprogram/add', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAssignmentprogramDelete(params = {}) {
        return this.request('assignmentprogram/delete', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePutLeveragepreferences(params = {}) {
        return this.request('leveragepreferences', ['private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privatePutPnlpreferences(params = {}) {
        return this.request('pnlpreferences', ['private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privatePutSelfTradeStrategy(params = {}) {
        return this.request('self-trade-strategy', ['private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privatePutSubaccountUidTradingEnabled(params = {}) {
        return this.request('subaccount/{uid}/trading-enabled', ['private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privatePutRfqAssignmentMaxLeverage(params = {}) {
        return this.request('rfq-assignment/max-leverage', ['private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteRfqAssignmentMaxLeverage(params = {}) {
        return this.request('rfq-assignment/max-leverage', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    chartsGetPriceTypeSymbolInterval(params = {}) {
        return this.request('{price_type}/{symbol}/{interval}', ['charts'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    chartsGetAnalyticsLiquidityPool(params = {}) {
        return this.request('analytics/liquidity-pool', ['charts'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    historyGetOrders(params = {}) {
        return this.request('orders', ['history'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    historyGetExecutions(params = {}) {
        return this.request('executions', ['history'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    historyGetTriggers(params = {}) {
        return this.request('triggers', ['history'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    historyGetAccountlogcsv(params = {}) {
        return this.request('accountlogcsv', ['history'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    historyGetAccountLog(params = {}) {
        return this.request('account-log', ['history'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    historyGetMarketSymbolOrders(params = {}) {
        return this.request('market/{symbol}/orders', ['history'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    historyGetMarketSymbolExecutions(params = {}) {
        return this.request('market/{symbol}/executions', ['history'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    historyGetMarketSymbolPrice(params = {}) {
        return this.request('market/{symbol}/price', ['history'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    historyGetPositions(params = {}) {
        return this.request('positions', ['history'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
