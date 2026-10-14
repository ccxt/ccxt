'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetMarketBook(params = {}) {
        return this.request("{market}/book", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetReportMarketBook(params = {}) {
        return this.request("report/{market}/book", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetMarketTrades(params = {}) {
        return this.request("{market}/trades", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetReportMarketTrades(params = {}) {
        return this.request("report/{market}/trades", "public", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    publicGetTickerPrice(params = {}) {
        return this.request("ticker/price", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTickerBook(params = {}) {
        return this.request("ticker/book", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetMarketCandles(params = {}) {
        return this.request("{market}/candles", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetTicker24h(params = {}) {
        return this.request("ticker/24h", "public", 'GET', params, undefined, undefined, { "cost": 1, "noMarket": 25 });
    }
    publicGetTime(params = {}) {
        return this.request("time", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetMarkets(params = {}) {
        return this.request("markets", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetAssets(params = {}) {
        return this.request("assets", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetOrder(params = {}) {
        return this.request("order", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetOrdersOpen(params = {}) {
        return this.request("ordersOpen", "private", 'GET', params, undefined, undefined, { "cost": 5, "noMarket": 100 });
    }
    privateGetTrades(params = {}) {
        return this.request("trades", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetOrders(params = {}) {
        return this.request("orders", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetDeposit(params = {}) {
        return this.request("deposit", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetDepositHistory(params = {}) {
        return this.request("depositHistory", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetWithdrawalHistory(params = {}) {
        return this.request("withdrawalHistory", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetAccount(params = {}) {
        return this.request("account", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetBalance(params = {}) {
        return this.request("balance", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetStakingBalance(params = {}) {
        return this.request("stakingBalance", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccountFees(params = {}) {
        return this.request("account/fees", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetAccountHistory(params = {}) {
        return this.request("account/history", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetSubaccounts(params = {}) {
        return this.request("subaccounts", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetSubaccountsTransfers(params = {}) {
        return this.request("subaccounts/transfers", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetSubaccountsTransfersTransferId(params = {}) {
        return this.request("subaccounts/transfers/{transferId}", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetInstitutionalSubaccountsBalance(params = {}) {
        return this.request("institutional/subaccounts/balance", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetInstitutionalSubaccountsHistory(params = {}) {
        return this.request("institutional/subaccounts/history", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetInstitutionalSubaccountsOrdersOpen(params = {}) {
        return this.request("institutional/subaccounts/orders/open", "private", 'GET', params, undefined, undefined, { "cost": 5, "noMarket": 100 });
    }
    privatePostOrder(params = {}) {
        return this.request("order", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelOrdersAfter(params = {}) {
        return this.request("cancelOrdersAfter", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostWithdrawal(params = {}) {
        return this.request("withdrawal", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCryptoWithdrawal(params = {}) {
        return this.request("crypto/withdrawal", "private", 'POST', params, undefined, undefined, { "cost": 25 });
    }
    privatePostSubaccounts(params = {}) {
        return this.request("subaccounts", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostSubaccountsTransfers(params = {}) {
        return this.request("subaccounts/transfers", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePutOrder(params = {}) {
        return this.request("order", "private", 'PUT', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteOrder(params = {}) {
        return this.request("order", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteOrders(params = {}) {
        return this.request("orders", "private", 'DELETE', params, undefined, undefined, { "cost": 25, "noMarket": 100 });
    }
    privateDeleteAtomicOrders(params = {}) {
        return this.request("atomic/orders", "private", 'DELETE', params, undefined, undefined, { "cost": 100 });
    }
    privateDeleteInstitutionalSubaccountsOrder(params = {}) {
        return this.request("institutional/subaccounts/order", "private", 'DELETE', params, undefined, undefined, { "cost": 1 });
    }
    privateDeleteInstitutionalSubaccountsOrders(params = {}) {
        return this.request("institutional/subaccounts/orders", "private", 'DELETE', params, undefined, undefined, { "cost": 25, "noMarket": 100 });
    }
}

exports["default"] = Exchange;
