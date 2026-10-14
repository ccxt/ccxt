'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicPostGetServerTime(params = {}) {
        return this.request("get_server_time", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetPairsInfo(params = {}) {
        return this.request("get_pairs_info", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetCurrenciesInfo(params = {}) {
        return this.request("get_currencies_info", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetProcessingInfo(params = {}) {
        return this.request("get_processing_info", "public", 'POST', params, undefined, undefined, { "cost": 10 });
    }
    publicPostGetTicker(params = {}) {
        return this.request("get_ticker", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetTradeHistory(params = {}) {
        return this.request("get_trade_history", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetOrderBook(params = {}) {
        return this.request("get_order_book", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    publicPostGetCandles(params = {}) {
        return this.request("get_candles", "public", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetMyCurrentFee(params = {}) {
        return this.request("get_my_current_fee", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostGetFeeStrategy(params = {}) {
        return this.request("get_fee_strategy", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetMyVolume(params = {}) {
        return this.request("get_my_volume", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostDoCreateAccount(params = {}) {
        return this.request("do_create_account", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetMyAccountStatusV3(params = {}) {
        return this.request("get_my_account_status_v3", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostGetMyWalletBalance(params = {}) {
        return this.request("get_my_wallet_balance", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostGetMyOrders(params = {}) {
        return this.request("get_my_orders", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostDoMyNewOrder(params = {}) {
        return this.request("do_my_new_order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostDoCancelMyOrder(params = {}) {
        return this.request("do_cancel_my_order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostDoCancelAllOrders(params = {}) {
        return this.request("do_cancel_all_orders", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostGetOrderBook(params = {}) {
        return this.request("get_order_book", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetTicker(params = {}) {
        return this.request("get_ticker", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetCandles(params = {}) {
        return this.request("get_candles", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetTradeHistory(params = {}) {
        return this.request("get_trade_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetMyTransactionHistory(params = {}) {
        return this.request("get_my_transaction_history", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetMyFundingHistory(params = {}) {
        return this.request("get_my_funding_history", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostDoMyInternalTransfer(params = {}) {
        return this.request("do_my_internal_transfer", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetProcessingInfo(params = {}) {
        return this.request("get_processing_info", "private", 'POST', params, undefined, undefined, { "cost": 10 });
    }
    privatePostGetDepositAddress(params = {}) {
        return this.request("get_deposit_address", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostDoDepositFundsFromWallet(params = {}) {
        return this.request("do_deposit_funds_from_wallet", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostDoWithdrawalFundsToWallet(params = {}) {
        return this.request("do_withdrawal_funds_to_wallet", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
}

exports["default"] = Exchange;
