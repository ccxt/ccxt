'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, RequestTimeout, AuthenticationError, DDoSProtection, InsufficientFunds, OrderNotFound, OrderNotCached, InvalidOrder, AccountSuspended, CancelPending, InvalidNonce } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class idex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'idex',
            'name': 'IDEX',
            'countries': [ 'PAN' ],
            'rateLimit': 1000, // up to 6 calls per second
            'has': {
                'CORS': false,
                'fetchTickers': true
            },
            'timeframes': {
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '2h': 7200,
                '4h': 14400,
                '1d': 86400,
            },
            'urls': {
                'logo': undefined,
                'api': {
                    'public': 'https://api.idex.market'
                },
                'www': 'https://idex.market/eth/aura',
                'doc': [
                    'https://github.com/AuroraDAO/idex-api-docs'
                ]
            },
            'api': {
                'public': {
                    'get': [
                        'returnTicker',
                        'returnCurrencies'
                    ]
                },
                'private': {
                    'post': [
                    ],
                },
            },
            'fees': {
                'trading': {},
                'funding': {},
            },
            'limits': {},
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'commonCurrencies': {},
            'options': {},
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetReturnTicker ();
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let market = markets[id];
            let [ quote, base ] = id.split ('_');
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': true,
                'precision': {
                    'amount': 8,
                    'price': 8,
                },
                'info': market,
            }));
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let open = undefined;
        let change = undefined;
        let average = undefined;
        let last = this.safeFloat (ticker, 'last');
        let relativeChange = this.safeFloat (ticker, 'percentChange');
        if (relativeChange !== -1) {
            open = last / this.sum (1, relativeChange);
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': relativeChange * 100,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'quoteVolume'),
            'quoteVolume': this.safeFloat (ticker, 'baseVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetReturnTicker (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let currencies = await this.publicGetReturnCurrencies (params);
        let ids = Object.keys (currencies);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let currency = currencies[id];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            let precision = 8; // default precision, todo: fix "magic constants"
            let code = this.commonCurrencyCode (id);
            let active = (currency['delisted'] === 0) && !currency['disabled'];
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'fee': this.safeFloat (currency, 'txFee'), // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currency['txFee'],
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let tickers = await this.publicGetReturnTicker (params);
        let ticker = tickers[market['id']];
        return this.parseTicker (ticker, market);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'public') {
            url += '/' + path;
        } else {
            this.checkRequiredCredentials ();
            query['nonce'] = this.nonce ();
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        let response = undefined;
        try {
            response = JSON.parse (body);
        } catch (e) {
            // syntax error, resort to default error handler
            return;
        }
        if ('error' in response) {
            const message = response['error'];
            const feedback = this.id + ' ' + this.json (response);
            if (message === 'Invalid order number, or you are not the person who placed the order.') {
                throw new OrderNotFound (feedback);
            } else if (message === 'Connection timed out. Please try again.') {
                throw new RequestTimeout (feedback);
            } else if (message === 'Internal error. Please try again.') {
                throw new ExchangeNotAvailable (feedback);
            } else if (message === 'Order not found, or you are not the person who placed it.') {
                throw new OrderNotFound (feedback);
            } else if (message === 'Invalid API key/secret pair.') {
                throw new AuthenticationError (feedback);
            } else if (message === 'Please do not make more than 8 API calls per second.') {
                throw new DDoSProtection (feedback);
            } else if (message.indexOf ('Total must be at least') >= 0) {
                throw new InvalidOrder (feedback);
            } else if (message.indexOf ('This account is frozen.') >= 0) {
                throw new AccountSuspended (feedback);
            } else if (message.indexOf ('Not enough') >= 0) {
                throw new InsufficientFunds (feedback);
            } else if (message.indexOf ('Nonce must be greater') >= 0) {
                throw new InvalidNonce (feedback);
            } else if (message.indexOf ('You have already called cancelOrder or moveOrder on this order.') >= 0) {
                throw new CancelPending (feedback);
            } else {
                throw new ExchangeError (this.id + ' unknown error ' + this.json (response));
            }
        }
    }
};
