'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

// ---------------------------------------------------------------------------

module.exports = class vaultoro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'vaultoro',
            'name': 'Vaultoro',
            'countries': [ 'CH' ],
            'rateLimit': 1000,
            'version': '1',
            'has': {
                'CORS': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766880-f205e870-5ee9-11e7-8fe2-0d5b15880752.jpg',
                'api': 'https://api.vaultoro.com',
                'www': 'https://www.vaultoro.com',
                'doc': 'https://api.vaultoro.com',
            },
            'commonCurrencies': {
                'GLD': 'Gold',
            },
            'api': {
                'public': {
                    'get': [
                        'bidandask',
                        'buyorders',
                        'latest',
                        'latesttrades',
                        'markets',
                        'orderbook',
                        'sellorders',
                        'transactions/day',
                        'transactions/hour',
                        'transactions/month',
                    ],
                },
                'private': {
                    'get': [
                        'balance',
                        'mytrades',
                        'orders',
                    ],
                    'post': [
                        'buy/{symbol}/{type}',
                        'cancel/{id}',
                        'sell/{symbol}/{type}',
                        'withdraw',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const result = [];
        const response = await this.publicGetMarkets (params);
        const market = this.safeValue (response, 'data');
        const baseId = this.safeString (market, 'MarketCurrency');
        const quoteId = this.safeString (market, 'BaseCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const id = this.safeString (market, 'MarketName');
        result.push ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
        });
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        const balances = this.safeValue (response, 'data');
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency_code');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'cash');
            account['used'] = this.safeFloat (balance, 'reserved');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetOrderbook (params);
        const orderbook = {
            'bids': response['data'][0]['b'],
            'asks': response['data'][1]['s'],
        };
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'Gold_Price', 'Gold_Amount');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const quote = await this.publicGetBidandask (params);
        const bidsLength = quote['bids'].length;
        const bid = quote['bids'][bidsLength - 1];
        const ask = quote['asks'][0];
        const response = await this.publicGetMarkets (params);
        const ticker = this.safeValue (response, 'data');
        const timestamp = this.milliseconds ();
        const last = this.safeFloat (ticker, 'LastPrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, '24hHigh'),
            'low': this.safeFloat (ticker, '24hLow'),
            'bid': bid[0],
            'bidVolume': undefined,
            'ask': ask[0],
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, '24hVolume'),
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (trade, 'Time'));
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat (trade, 'Gold_Price');
        const amount = this.safeFloat (trade, 'Gold_Amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
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
        const response = await this.publicGetTransactionsDay (params);
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = 'privatePost' + this.capitalize (side) + 'SymbolType';
        const request = {
            'symbol': market['quoteId'].toLowerCase (),
            'type': type,
            'gld': amount,
            'price': price || 1,
        };
        const response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': response['data']['Order_ID'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        return await this.privatePostCancelId (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/';
        if (api === 'public') {
            url += path;
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            url += this.version + '/' + this.implodeParams (path, params);
            const query = this.extend ({
                'nonce': nonce,
                'apikey': this.apiKey,
            }, this.omit (params, this.extractParams (path)));
            url += '?' + this.urlencode (query);
            headers = {
                'Content-Type': 'application/json',
                'X-Signature': this.hmac (this.encode (url), this.encode (this.secret)),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
