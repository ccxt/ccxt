'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetExchangeOrdersRate(params = {}) {
        return this.request('exchange/orders/rate', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetExchangeStatus(params = {}) {
        return this.request('exchange_status', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetOrderBooks(params = {}) {
        return this.request('order_books', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetRatePair(params = {}) {
        return this.request('rate/{pair}', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetTicker(params = {}) {
        return this.request('ticker', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetTrades(params = {}) {
        return this.request('trades', ['public'], 'GET', params, { 'cost': 1 });
    }
    privateGetAccounts(params = {}) {
        return this.request('accounts', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetAccountsBalance(params = {}) {
        return this.request('accounts/balance', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetAccountsLeverageBalance(params = {}) {
        return this.request('accounts/leverage_balance', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetBankAccounts(params = {}) {
        return this.request('bank_accounts', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetDepositMoney(params = {}) {
        return this.request('deposit_money', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetExchangeOrdersId(params = {}) {
        return this.request('exchange/orders/{id}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetExchangeOrdersOpens(params = {}) {
        return this.request('exchange/orders/opens', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetExchangeOrdersCancelStatus(params = {}) {
        return this.request('exchange/orders/cancel_status', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetExchangeOrdersTransactions(params = {}) {
        return this.request('exchange/orders/transactions', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetExchangeOrdersTransactionsPagination(params = {}) {
        return this.request('exchange/orders/transactions_pagination', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetExchangeLeveragePositions(params = {}) {
        return this.request('exchange/leverage/positions', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetLendingBorrowsMatches(params = {}) {
        return this.request('lending/borrows/matches', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetSendMoney(params = {}) {
        return this.request('send_money', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetWithdraws(params = {}) {
        return this.request('withdraws', ['private'], 'GET', params, { 'cost': 1 });
    }
    privatePostBankAccounts(params = {}) {
        return this.request('bank_accounts', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostDepositMoneyIdFast(params = {}) {
        return this.request('deposit_money/{id}/fast', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostExchangeOrders(params = {}) {
        return this.request('exchange/orders', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostExchangeTransfersToLeverage(params = {}) {
        return this.request('exchange/transfers/to_leverage', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostExchangeTransfersFromLeverage(params = {}) {
        return this.request('exchange/transfers/from_leverage', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostLendingBorrows(params = {}) {
        return this.request('lending/borrows', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostLendingBorrowsIdRepay(params = {}) {
        return this.request('lending/borrows/{id}/repay', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostSendMoney(params = {}) {
        return this.request('send_money', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostWithdraws(params = {}) {
        return this.request('withdraws', ['private'], 'POST', params, { 'cost': 1 });
    }
    privateDeleteBankAccountsId(params = {}) {
        return this.request('bank_accounts/{id}', ['private'], 'DELETE', params, { 'cost': 1 });
    }
    privateDeleteExchangeOrdersId(params = {}) {
        return this.request('exchange/orders/{id}', ['private'], 'DELETE', params, { 'cost': 1 });
    }
    privateDeleteWithdrawsId(params = {}) {
        return this.request('withdraws/{id}', ['private'], 'DELETE', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
