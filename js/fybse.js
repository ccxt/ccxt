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
            'countries': 'SE', // Sweden
            'has': {
                'CORS': false,
            },
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg',
                'api': 'https://www.fybse.se/api/SEK',
                'www': 'https://www.fybse.se',
                'doc': 'http://docs.fyb.apiary.io',
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
        let balance = await this.privatePostGetaccinfo ();
        let btc = parseFloat (balance['btcBal']);
        let symbol = this.symbols[0];
        let quote = this.markets[symbol]['quote'];
        let lowercase = quote.toLowerCase () + 'Bal';
        let fiat = parseFloat (balance[lowercase]);
        let crypto = {
            'free': btc,
            'used': 0.0,
            'total': btc,
        };
        let result = { 'BTC': crypto };
        result[quote] = {
            'free': fiat,
            'used': 0.0,
            'total': fiat,
        };
        result['info'] = balance;
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let orderbook = await this.publicGetOrderbook (params);
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetTickerdetailed (params);
        let timestamp = this.milliseconds ();
        let last = undefined;
        let volume = undefined;
        if ('last' in ticker)
            last = this.safeFloat (ticker, 'last');
        if ('vol' in ticker)
            volume = this.safeFloat (ticker, 'vol');
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

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000;
        return {
            'info': trade,
            'id': trade['tid'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amount'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTrades (params);
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let response = await this.privatePostPlaceorder (this.extend ({
            'qty': amount,
            'price': price,
            'type': side[0].toUpperCase (),
        }, params));
        return {
            'info': response,
            'id': response['pending_oid'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelpendingorder ({ 'orderNo': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        if (api === 'public') {
            url += '.json';
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
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
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (api === 'private')
            if ('error' in response)
                if (response['error'])
                    throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
};
