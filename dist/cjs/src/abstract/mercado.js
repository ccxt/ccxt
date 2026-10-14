'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetCoins(params = {}) {
        return this.request('coins', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetCoinOrderbook(params = {}) {
        return this.request('{coin}/orderbook/', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetCoinTicker(params = {}) {
        return this.request('{coin}/ticker/', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetCoinTrades(params = {}) {
        return this.request('{coin}/trades/', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetCoinTradesFrom(params = {}) {
        return this.request('{coin}/trades/{from}/', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetCoinTradesFromTo(params = {}) {
        return this.request('{coin}/trades/{from}/{to}', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetCoinDaySummaryYearMonthDay(params = {}) {
        return this.request('{coin}/day-summary/{year}/{month}/{day}/', ['public'], 'GET', params, { 'cost': 1 });
    }
    privatePostCancelOrder(params = {}) {
        return this.request('cancel_order', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostGetAccountInfo(params = {}) {
        return this.request('get_account_info', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostGetOrder(params = {}) {
        return this.request('get_order', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostGetWithdrawal(params = {}) {
        return this.request('get_withdrawal', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostListSystemMessages(params = {}) {
        return this.request('list_system_messages', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostListOrders(params = {}) {
        return this.request('list_orders', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostListOrderbook(params = {}) {
        return this.request('list_orderbook', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostPlaceBuyOrder(params = {}) {
        return this.request('place_buy_order', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostPlaceSellOrder(params = {}) {
        return this.request('place_sell_order', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostPlaceMarketBuyOrder(params = {}) {
        return this.request('place_market_buy_order', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostPlaceMarketSellOrder(params = {}) {
        return this.request('place_market_sell_order', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostWithdrawCoin(params = {}) {
        return this.request('withdraw_coin', ['private'], 'POST', params, { 'cost': 1 });
    }
    v4PublicGetCoinCandle(params = {}) {
        return this.request('{coin}/candle/', ['v4Public'], 'GET', params, { 'cost': 1 });
    }
    v4PublicNetGetCandles(params = {}) {
        return this.request('candles', ['v4PublicNet'], 'GET', params, { 'cost': 1 });
    }
    v4PrivatePostAccounts(params = {}) {
        return this.request('accounts', ['v4Private'], 'POST', params, { 'cost': 1 });
    }
    v4PrivatePostAccountsAccountIdSymbolTransfersInternal(params = {}) {
        return this.request('accounts/{accountId}/{symbol}/transfers/internal', ['v4Private'], 'POST', params, { 'cost': 1 });
    }
    v4PrivatePostOauth2Token(params = {}) {
        return this.request('oauth2/token', ['v4Private'], 'POST', params, { 'cost': 1 });
    }
    v4PrivatePatchAccountsAccountIdWalletSymbolDepositsDepositId(params = {}) {
        return this.request('accounts/{accountId}/wallet/{symbol}/deposits/{depositId}', ['v4Private'], 'PATCH', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
