'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetExchangesPairTicker(params = {}) {
        return this.request('Exchanges/{pair}/Ticker', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetExchangesPairOrderbook(params = {}) {
        return this.request('Exchanges/{pair}/orderbook', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetExchangesPairOrderbookTop(params = {}) {
        return this.request('Exchanges/{pair}/orderbook-top', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetExchangesPairTrades(params = {}) {
        return this.request('Exchanges/{pair}/trades', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetExchangesPairLasttrades(params = {}) {
        return this.request('Exchanges/{pair}/lasttrades', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostMerchantCreateCheckout(params = {}) {
        return this.request('Merchant/CreateCheckout', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFundsAddCoinFundsRequest(params = {}) {
        return this.request('Funds/AddCoinFundsRequest', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostFundsWithdrawCoin(params = {}) {
        return this.request('Funds/WithdrawCoin', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrderAddFund(params = {}) {
        return this.request('Order/AddFund', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrderAddOrder(params = {}) {
        return this.request('Order/AddOrder', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrderGetById(params = {}) {
        return this.request('Order/GetById', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrderAddOrderMarketPriceBuy(params = {}) {
        return this.request('Order/AddOrderMarketPriceBuy', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrderAddOrderMarketPriceSell(params = {}) {
        return this.request('Order/AddOrderMarketPriceSell', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrderCancelOrder(params = {}) {
        return this.request('Order/CancelOrder', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrderAddCoinFundsRequest(params = {}) {
        return this.request('Order/AddCoinFundsRequest', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrderAddStopOrder(params = {}) {
        return this.request('Order/AddStopOrder', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPaymentGetMyId(params = {}) {
        return this.request('Payment/GetMyId', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPaymentSend(params = {}) {
        return this.request('Payment/Send', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPaymentPay(params = {}) {
        return this.request('Payment/Pay', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccountBalance(params = {}) {
        return this.request('Account/Balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccountBalanceV2(params = {}) {
        return this.request('Account/Balance/v2', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetOrderMyOrders(params = {}) {
        return this.request('Order/MyOrders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetOrderGetById(params = {}) {
        return this.request('Order/GetById', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetOrderAccountHistory(params = {}) {
        return this.request('Order/AccountHistory', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetOrderOrderHistory(params = {}) {
        return this.request('Order/OrderHistory', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetOrderHistoryByOrderId(params = {}) {
        return this.request('Order/HistoryByOrderId', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
