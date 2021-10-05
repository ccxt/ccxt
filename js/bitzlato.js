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
                'fetchTime': true,
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
                'test': {
                    'public': 'https://market-sandbox.{hostname}/api/v2/peatio/public',
                    'private': 'https://market-sandbox.{hostname}/api/v2/peatio',
                },
                'api': {
                    'public': 'https://market.{hostname}/api/v2/peatio/public',
                    'private': 'https://market.{hostname}/api/v2/peatio',
                },
                'www': 'https://market.bitzlato.com/',
                'doc': [
                    'https://market.bitzlato.com/docs',
                ],
                'fees': '',
            },
            'api': {
                'public': {
                    'get': [
                        'withdraw_limits',
                        'trading_fees',
                        'timestamp',
                        'member-levels',
                        'markets/{market}/tickers',
                        'markets/tickers',
                        'markets/{market}/k-line',
                        'markets/{market}/depth',
                        'markets/{market}/trades',
                        'markets/{market}/order-book',
                        'markets',
                        'currencies',
                        'currencies/{id}',
                    ],
                },
                'private': {
                    'get': [
                        'account/internal_transfers',
                        'account/transactions',
                        'account/stats/pnl',
                        'account/withdraws',
                        'account/withdraws/sums',
                        'account/beneficiaries/{id}',
                        'account/beneficiaries',
                        'account/deposit_address/{currency}',
                        'account/deposits/{txid}',
                        'account/deposits',
                        'account/balances/{currency}',
                        'account/balances',
                        'account/trades',
                        'market/orders',
                        'market/orders/{id}',
                        'coinmarketcap/orderbook/{market_pair}',
                        'coinmarketcap/trades/{market_pair}',
                        'coinmarketcap/ticker',
                        'coinmarketcap/assets',
                        'coinmarketcap/summary',
                        'coingecko/historical_trades',
                        'coingecko/orderbook',
                        'coingecko/tickers',
                        'coingecko/pairs',
                    ],
                    'post': [
                        'account/internal_transfers',
                        'account/withdraws',
                        'account/beneficiaries',
                        'account/deposits/intention',
                        'market/orders/cancel',
                        'market/orders/{id}/cancel',
                        'market/orders',
                    ],
                    'patch': [
                        'account/beneficiaries/{id}/activate',
                        'account/beneficiaries/{id}/resend_pin',
                    ],
                    'delete': [
                        'account/beneficiaries/{id}',
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
                            [this.parseNumber ('3'), this.parseNumber ('0.0018')],
                            [this.parseNumber ('4'), this.parseNumber ('0.0016')],
                            [this.parseNumber ('5'), this.parseNumber ('0.002')],
                            [this.parseNumber ('6'), this.parseNumber ('0.0')],
                        ],
                        'maker': [
                            [this.parseNumber ('1'), this.parseNumber ('0.002')],
                            [this.parseNumber ('2'), this.parseNumber ('0.001')],
                            [this.parseNumber ('3'), this.parseNumber ('0.0008')],
                            [this.parseNumber ('4'), this.parseNumber ('0.0006')],
                            [this.parseNumber ('5'), this.parseNumber ('0.002')],
                            [this.parseNumber ('6'), this.parseNumber ('0.0')],
                        ],
                    },
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'options': {
              'defaultType': 'spot',
              'timeDifference': 0,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
        });
    }

    async fetchTime (params = {}) {
      const response = await this.publicGetTimestamp (params);
      //  "\"2021-10-05T12:34:56+00:00\""
      const parsed = JSON.parse (response);
      return this.parse8601 (parsed);
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
        const query = this.omit (params, this.extractParams (path));
        const baseUrl = this.implodeHostname (this.urls.api[api]);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        headers = {
          'Accept': 'application/json'
        }
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (method === 'POST') {
            headers['Content-type'] = 'application/json'
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            // TODO: implement authorization headers
            headers['Authorization'] = 'Bearer ' + this.apiKey;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
    }
};
