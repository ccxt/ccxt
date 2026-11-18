'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetV2TradingMarketConfig(params = {}) {
        return this.request('v2/trading/market-config', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetV2TradingTickers(params = {}) {
        return this.request('v2/trading/tickers', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetV2TradingOrderBook(params = {}) {
        return this.request('v2/trading/order-book', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetV1TradingCandle(params = {}) {
        return this.request('v1/trading/candle', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetV1TradingTradeLast(params = {}) {
        return this.request('v1/trading/trade/last', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetV2CurrencyAssets(params = {}) {
        return this.request('v2/currency/assets', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetV2CurrencyAssetsSymbol(params = {}) {
        return this.request('v2/currency/assets/{symbol}', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetV1WalletSettingsAssets(params = {}) {
        return this.request('v1/wallet/settings/assets', ['public'], 'GET', params, { 'cost': 1 });
    }
    privateGetV1TradingOrder(params = {}) {
        return this.request('v1/trading/order', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetV1TradingOrderId(params = {}) {
        return this.request('v1/trading/order/{id}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetV1TradingOrderIdTrades(params = {}) {
        return this.request('v1/trading/order/{id}/trades', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetV1TradingTrade(params = {}) {
        return this.request('v1/trading/trade', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetV1TradingWalletBalance(params = {}) {
        return this.request('v1/trading/wallet/balance', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetV1TradingWorkingCapital(params = {}) {
        return this.request('v1/trading/working-capital', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetV1TradingMovement(params = {}) {
        return this.request('v1/trading/movement', ['private'], 'GET', params, { 'cost': 1 });
    }
    privatePostV1TradingOrder(params = {}) {
        return this.request('v1/trading/order', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostV1TradingWalletDeposit(params = {}) {
        return this.request('v1/trading/wallet/deposit', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostV1TradingWalletWithdraw(params = {}) {
        return this.request('v1/trading/wallet/withdraw', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostV1SigninApikey(params = {}) {
        return this.request('v1/signin/apikey', ['private'], 'POST', params, { 'cost': 1 });
    }
    privateDeleteV1TradingOrderId(params = {}) {
        return this.request('v1/trading/order/{id}', ['private'], 'DELETE', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
