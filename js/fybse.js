'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class fybse extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'fybse',
            'name': 'FYB-SE',
            'countries': [ 'SE' ], // Sweden
            'has': {
                'CORS': false,
            },
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg',
                'api': 'https://www.fybse.se/api/SEK',
                'www': 'https://www.fybse.se',
                'doc': 'https://fyb.docs.apiary.io',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'tickerdetailed',
                        'orderbook',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'test',
                        'getaccinfo',
                        'getpendingorders',
                        'getorderhistory',
                        'cancelpendingorder',
                        'placeorder',
                        'withdraw',
                    ],
                },
            },
            'markets': {
                'BTC/SEK': { 'id': 'SEK', 'symbol': 'BTC/SEK', 'base': 'BTC', 'quote': 'SEK' },
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetaccinfo (params);
        const btc = this.safeFloat (response, 'btcBal');
        const symbol = this.symbols[0];
        const quote = this.markets[symbol]['quote'];
        const lowercase = quote.toLowerCase () + 'Bal';
        const fiat = this.safeFloat (response, lowercase);
        const crypto = this.account ();
        crypto['total'] = btc;
        const result = { 'BTC': crypto };
        result[quote] = this.account ();
        result[quote]['total'] = fiat;
        result['info'] = response;
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetOrderbook (params);
        return this.parseOrderBook (response);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const ticker = await this.publicGetTickerdetailed (params);
        const timestamp = this.milliseconds ();
        const last = this.safeFloat (ticker, 'last');
        const volume = this.safeFloat (ticker, 'vol');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': volume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.safeInteger (trade, 'date');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const id = this.safeString (trade, 'tid');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'info': trade,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetTrades (params);
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'qty': amount,
            'price': price,
            'type': side[0].toUpperCase (),
        };
        const response = await this.privatePostPlaceorder (this.extend (request, params));
        return {
            'info': response,
            'id': response['pending_oid'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderNo': id,
        };
        return await this.privatePostCancelpendingorder (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        if (api === 'public') {
            url += '.json';
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'timestamp': nonce }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'key': this.apiKey,
                'sig': this.hmac (this.encode (body), this.encode (this.secret), 'sha1'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if (api === 'private') {
            if ('error' in response) {
                if (response['error']) {
                    throw new ExchangeError (this.id + ' ' + this.json (response));
                }
            }
        }
        return response;
    }
};
