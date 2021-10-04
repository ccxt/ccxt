'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidAddress, ArgumentsRequired, InsufficientFunds, AuthenticationError, OrderNotFound, InvalidOrder, BadRequest, InvalidNonce, BadSymbol, OnMaintenance, NotSupported, PermissionDenied, ExchangeNotAvailable } = require ('./base/errors');
const { SIGNIFICANT_DIGITS, DECIMAL_PLACES, TRUNCATE, ROUND } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class bitzlato extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitzlato',
            'name': 'Bitzlato',
            'countries': [ 'HK' ],
            'version': 'v2',
            'rateLimit': 1000,
            'has': {
                // 'cancelAllOrders': true,
                // 'cancelOrder': true,
                // 'cancelOrders': undefined,
                // 'CORS': undefined,
                // 'createOrder': true,
                // 'createLimitOrder': true,
                // 'createMarketOrder': true,
                // 'createDepositAddress': undefined,
                // 'deposit': undefined,
                // 'editOrder': 'emulated',
                // 'fetchBalance': true,
                // 'fetchBidsAsks': undefined,
                // 'fetchClosedOrders': undefined,
                // 'fetchCurrencies': undefined,
                // 'fetchDepositAddress': undefined,
                // 'fetchDeposits': undefined,
                // 'fetchFundingFees': undefined,
                // 'fetchL2OrderBook': true,
                // 'fetchLedger': undefined,
                // 'fetchMarkets': true,
                // 'fetchMyTrades': undefined,
                // 'fetchOHLCV': 'emulated',
                // 'fetchOpenOrders': undefined,
                // 'fetchOrder': undefined,
                // 'fetchOrderBook': true,
                // 'fetchOrderBooks': undefined,
                // 'fetchOrders': undefined,
                // 'fetchOrderTrades': undefined,
                // 'fetchStatus': 'emulated',
                // 'fetchTicker': true,
                // 'fetchTickers': undefined,
                // 'fetchTime': undefined,
                // 'fetchTrades': true,
                // 'fetchTradingFee': undefined,
                // 'fetchTradingFees': undefined,
                // 'fetchTradingLimits': undefined,
                // 'fetchTransactions': undefined,
                // 'fetchWithdrawals': undefined,
                // 'signIn': undefined,
                // 'withdraw': undefined,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'hostname': 'bitzlato.com',
            'urls': {
                'logo': '',
                'test': 'https://market-sandbox.{hostname}/api',
                'api': 'https://market.{hostname}/api',
                'www': 'https://market.{hostname}/',
                'doc': [
                    'https://market.{hostname}/docs',
                ],
                'fees': '',
            },
            'api': {
                'public': {
                    'get': [
                        'peatio/public/withdraw_limits',
                        'peatio/public/trading_fees',
                        'peatio/public/timestamp',
                        'peatio/public/member-levels',
                        'peatio/public/markets/{market}/tickers',
                        'peatio/public/markets/tickers',
                        'peatio/public/markets/{market}/k-line',
                        'peatio/public/markets/{market}/depth',
                        'peatio/public/markets/{market}/trades',
                        'peatio/public/markets/{market}/order-book',
                        'peatio/public/markets',
                        'peatio/public/currencies',
                        'peatio/public/currencies/{id}',
                    ],
                },
                'private': {
                    'get': [
                        'peatio/account/internal_transfers',
                        'peatio/account/transactions',
                        'peatio/account/stats/pnl',
                        'peatio/account/withdraws',
                        'peatio/account/withdraws/sums',
                        'peatio/account/beneficiaries/{id}',
                        'peatio/account/beneficiaries',
                        'peatio/account/deposit_address/{currency}',
                        'peatio/account/deposits/{txid}',
                        'peatio/account/deposits',
                        'peatio/account/balances/{currency}',
                        'peatio/account/balances',
                        'peatio/account/trades',
                        'peatio/market/orders',
                        'peatio/market/orders/{id}',
                        'peatio/coinmarketcap/orderbook/{market_pair}',
                        'peatio/coinmarketcap/trades/{market_pair}',
                        'peatio/coinmarketcap/ticker',
                        'peatio/coinmarketcap/assets',
                        'peatio/coinmarketcap/summary',
                        'peatio/coingecko/historical_trades',
                        'peatio/coingecko/orderbook',
                        'peatio/coingecko/tickers',
                        'peatio/coingecko/pairs',
                    ],
                    'post': [
                        'peatio/account/internal_transfers',
                        'peatio/account/withdraws',
                        'peatio/account/beneficiaries',
                        'peatio/account/deposits/intention',
                        'peatio/market/orders/cancel',
                        'peatio/market/orders/{id}/cancel',
                        'peatio/market/orders',
                    ],
                    'patch': [
                        'peatio/account/beneficiaries/{id}/activate',
                        'peatio/account/beneficiaries/{id}/resend_pin',
                    ],
                    'delete': [
                        'peatio/account/beneficiaries/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'percentage': true,
                    'tierBased': true,
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                    'tiers': {
                        'taker': [
                            [this.parseNumber ('1'), this.parseNumber ('0.002')],
                            [this.parseNumber ('2'), this.parseNumber ('0.002')],
                            [this.parseNumber ('3'), this.parseNumber ('0.002')],
                            [this.parseNumber ('4'), this.parseNumber ('0.002')],
                            [this.parseNumber ('5'), this.parseNumber ('0.002')],
                            [this.parseNumber ('6'), this.parseNumber ('0.002')],
                        ],
                        'maker': [
                            [this.parseNumber ('1'), this.parseNumber ('0.002')],
                            [this.parseNumber ('2'), this.parseNumber ('0.002')],
                            [this.parseNumber ('3'), this.parseNumber ('0.002')],
                            [this.parseNumber ('4'), this.parseNumber ('0.002')],
                            [this.parseNumber ('5'), this.parseNumber ('0.002')],
                            [this.parseNumber ('6'), this.parseNumber ('0.002')],
                        ],
                    },
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'options': {
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
        });
    }

    isFiat (code) {
    }

    getCurrencyId (code) {
    }

    async fetchStatus (params = {}) {
    }

    async fetchMarkets (params = {}) {
    }

    async fetchCurrencies (params = {}) {
    }

    async fetchBalance (params = {}) {
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrder is not implemented yet');
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
    }

    parseTicker (ticker, market = undefined) {
    }

    async fetchTickers (symbols = undefined, params = {}) {
    }

    async fetchTicker (symbol, params = {}) {
    }

    parseSymbol (marketId) {
    }

    parseTrade (trade, market = undefined) {
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 100, params = {}) {
    }

    parseOrderStatus (status) {
    }

    parseOrder (order, market = undefined) {
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
    }

    async fetchClosedOrder (id, symbol = undefined, params = {}) {
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
    }

    async createDepositAddress (code, params = {}) {
    }

    async fetchDepositAddress (code, params = {}) {
    }

    parseTransactionStatus (status) {
    }

    parseTransaction (transaction, currency = undefined) {
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
    }

    async fetchPositions (symbols = undefined, params = {}) {
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
    }
};
