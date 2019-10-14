'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class btcturk extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcturk',
            'name': 'BTCTurk',
            'countries': [ 'TR' ], // Turkey
            'rateLimit': 1000,
            'has': {
                'CORS': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
            },
            'timeframes': {
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg',
                'api': 'https://www.btcturk.com/api',
                'www': 'https://www.btcturk.com',
                'doc': 'https://github.com/BTCTrader/broker-api-docs',
            },
            'api': {
                'public': {
                    'get': [
                        'ohlcdata', // ?last=COUNT
                        'orderbook',
                        'ticker',
                        'trades',   // ?last=COUNT (max 50)
                    ],
                },
                'private': {
                    'get': [
                        'balance',
                        'openOrders',
                        'userTransactions', // ?offset=0&limit=25&sort=asc
                    ],
                    'post': [
                        'exchange',
                        'cancelOrder',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.002 * 1.18,
                    'taker': 0.003 * 1.18,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetTicker (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'pair');
            let baseId = id.slice (0, 3);
            let quoteId = id.slice (3, 6);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            baseId = baseId.toLowerCase ();
            quoteId = quoteId.toLowerCase ();
            const symbol = base + '/' + quote;
            const precision = {
                'amount': 8,
                'price': 8,
            };
            const active = true;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        const result = { 'info': response };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currencies[code];
            const free = currency['id'] + '_available';
            const total = currency['id'] + '_balance';
            const used = currency['id'] + '_reserved';
            if (free in response) {
                const account = this.account ();
                account['free'] = this.safeFloat (response, free);
                account['total'] = this.safeFloat (response, total);
                account['used'] = this.safeFloat (response, used);
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairSymbol': market['id'],
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
        const timestamp = this.safeTimestamp (response, 'timestamp');
        return this.parseOrderBook (response, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'average'),
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetTicker (params);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const marketId = this.safeString (ticker, 'pair');
            let symbol = marketId;
            let market = undefined;
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[symbol];
                symbol = market['symbol'];
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickers = await this.fetchTickers (params);
        return this.safeValue2 (tickers, market['id'], symbol);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'date');
        const id = this.safeString (trade, 'tid');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'order': undefined,
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
        // let maxCount = 50;
        const request = {
            'pairSymbol': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        const timestamp = this.parse8601 (this.safeString (ohlcv, 'Time'));
        return [
            timestamp,
            this.safeFloat (ohlcv, 'Open'),
            this.safeFloat (ohlcv, 'High'),
            this.safeFloat (ohlcv, 'Low'),
            this.safeFloat (ohlcv, 'Close'),
            this.safeFloat (ohlcv, 'Volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        if (limit !== undefined) {
            request['last'] = limit;
        }
        const response = await this.publicGetOhlcdata (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'PairSymbol': this.marketId (symbol),
            'OrderType': (side === 'buy') ? 0 : 1,
            'OrderMethod': (type === 'market') ? 1 : 0,
        };
        if (type === 'market') {
            if (!('Total' in params)) {
                throw new ExchangeError (this.id + ' createOrder requires the "Total" extra parameter for market orders (amount and price are both ignored)');
            }
        } else {
            request['Price'] = price;
            request['Amount'] = amount;
        }
        const response = await this.privatePostExchange (this.extend (request, params));
        const id = this.safeString (response, 'id');
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (this.id === 'btctrader') {
            throw new ExchangeError (this.id + ' is an abstract base API for BTCExchange, BTCTurk');
        }
        let url = this.urls['api'] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            body = this.urlencode (params);
            const secret = this.base64ToBinary (this.secret);
            const auth = this.apiKey + nonce;
            headers = {
                'X-PCK': this.apiKey,
                'X-Stamp': nonce,
                'X-Signature': this.stringToBase64 (this.hmac (this.encode (auth), secret, 'sha256', 'binary')),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
