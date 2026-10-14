'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetAssets(params = {}) {
        return this.request("assets", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetIndices(params = {}) {
        return this.request("indices", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetProducts(params = {}) {
        return this.request("products", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetProductsSymbol(params = {}) {
        return this.request("products/{symbol}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTickers(params = {}) {
        return this.request("tickers", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTickersSymbol(params = {}) {
        return this.request("tickers/{symbol}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetL2orderbookSymbol(params = {}) {
        return this.request("l2orderbook/{symbol}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTradesSymbol(params = {}) {
        return this.request("trades/{symbol}", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetStats(params = {}) {
        return this.request("stats", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetHistoryCandles(params = {}) {
        return this.request("history/candles", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetHistorySparklines(params = {}) {
        return this.request("history/sparklines", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetSettings(params = {}) {
        return this.request("settings", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetOrders(params = {}) {
        return this.request("orders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetOrdersOrderId(params = {}) {
        return this.request("orders/{order_id}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetOrdersClientOrderIdClientOid(params = {}) {
        return this.request("orders/client_order_id/{client_oid}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetProductsProductIdOrdersLeverage(params = {}) {
        return this.request("products/{product_id}/orders/leverage", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetPositionsMargined(params = {}) {
        return this.request("positions/margined", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetPositions(params = {}) {
        return this.request("positions", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetOrdersHistory(params = {}) {
        return this.request("orders/history", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFills(params = {}) {
        return this.request("fills", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFillsHistoryDownloadCsv(params = {}) {
        return this.request("fills/history/download/csv", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetWalletBalances(params = {}) {
        return this.request("wallet/balances", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetWalletTransactions(params = {}) {
        return this.request("wallet/transactions", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetWalletTransactionsDownload(params = {}) {
        return this.request("wallet/transactions/download", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetWalletsSubAccountsTransferHistory(params = {}) {
        return this.request("wallets/sub_accounts_transfer_history", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetUsersTradingPreferences(params = {}) {
        return this.request("users/trading_preferences", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetSubAccounts(params = {}) {
        return this.request("sub_accounts", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetProfile(params = {}) {
        return this.request("profile", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetRateLimitsQuota(params = {}) {
        return this.request("rate_limits/quota", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetHeartbeat(params = {}) {
        return this.request("heartbeat", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetDepositsAddress(params = {}) {
        return this.request("deposits/address", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOrders(params = {}) {
        return this.request("orders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOrdersBracket(params = {}) {
        return this.request("orders/bracket", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOrdersBatch(params = {}) {
        return this.request("orders/batch", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostProductsProductIdOrdersLeverage(params = {}) {
        return this.request("products/{product_id}/orders/leverage", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostPositionsChangeMargin(params = {}) {
        return this.request("positions/change_margin", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostPositionsCloseAll(params = {}) {
        return this.request("positions/close_all", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostWalletsSubAccountBalanceTransfer(params = {}) {
        return this.request("wallets/sub_account_balance_transfer", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostHeartbeatCreate(params = {}) {
        return this.request("heartbeat/create", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostHeartbeat(params = {}) {
        return this.request("heartbeat", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOrdersCancelAfter(params = {}) {
        return this.request("orders/cancel_after", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostOrdersLeverage(params = {}) {
        return this.request("orders/leverage", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePutOrders(params = {}) {
        return this.request("orders", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutOrdersBracket(params = {}) {
        return this.request("orders/bracket", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutOrdersBatch(params = {}) {
        return this.request("orders/batch", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutPositionsAutoTopup(params = {}) {
        return this.request("positions/auto_topup", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutUsersUpdateMmp(params = {}) {
        return this.request("users/update_mmp", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutUsersResetMmp(params = {}) {
        return this.request("users/reset_mmp", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutUsersMarginMode(params = {}) {
        return this.request("users/margin_mode", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privatePutUsersTradingPreferences(params = {}) {
        return this.request("users/trading_preferences", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteOrders(params = {}) {
        return this.request("orders", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteOrdersAll(params = {}) {
        return this.request("orders/all", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteOrdersBatch(params = {}) {
        return this.request("orders/batch", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
}

exports["default"] = Exchange;
