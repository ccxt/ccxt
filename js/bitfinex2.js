'use strict';

// ---------------------------------------------------------------------------

const bitfinex = require ('./bitfinex.js');
const { ExchangeError, NotSupported, InsufficientFunds } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class bitfinex2 extends bitfinex {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitfinex2',
            'name': 'Bitfinex v2',
            'countries': 'VG',
            'version': 'v2',
            // new metainfo interface
            'has': {
                'CORS': true,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchDepositAddress': false,
                'fetchClosedOrders': false,
                'fetchFundingFees': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchTickers': true,
                'fetchTradingFees': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api': 'https://api.bitfinex.com',
                'www': 'https://www.bitfinex.com',
                'doc': [
                    'https://bitfinex.readme.io/v2/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ],
                'fees': 'https://www.bitfinex.com/fees',
            },
            'api': {
                'v1': {
                    'get': [
                        'symbols',
                        'symbols_details',
                    ],
                },
                'public': {
                    'get': [
                        'platform/status',
                        'tickers',
                        'ticker/{symbol}',
                        'trades/{symbol}/hist',
                        'book/{symbol}/{precision}',
                        'book/{symbol}/P0',
                        'book/{symbol}/P1',
                        'book/{symbol}/P2',
                        'book/{symbol}/P3',
                        'book/{symbol}/R0',
                        'stats1/{key}:{size}:{symbol}/{side}/{section}',
                        'stats1/{key}:{size}:{symbol}/long/last',
                        'stats1/{key}:{size}:{symbol}/long/hist',
                        'stats1/{key}:{size}:{symbol}/short/last',
                        'stats1/{key}:{size}:{symbol}/short/hist',
                        'candles/trade:{timeframe}:{symbol}/{section}',
                        'candles/trade:{timeframe}:{symbol}/last',
                        'candles/trade:{timeframe}:{symbol}/hist',
                    ],
                    'post': [
                        'calc/trade/avg',
                    ],
                },
                'private': {
                    'post': [
                        'auth/r/wallets',
                        'auth/r/orders/{symbol}',
                        'auth/r/orders/{symbol}/new',
                        'auth/r/orders/{symbol}/hist',
                        'auth/r/order/{symbol}:{id}/trades',
                        'auth/r/trades/{symbol}/hist',
                        'auth/r/positions',
                        'auth/r/funding/offers/{symbol}',
                        'auth/r/funding/offers/{symbol}/hist',
                        'auth/r/funding/loans/{symbol}',
                        'auth/r/funding/loans/{symbol}/hist',
                        'auth/r/funding/credits/{symbol}',
                        'auth/r/funding/credits/{symbol}/hist',
                        'auth/r/funding/trades/{symbol}/hist',
                        'auth/r/info/margin/{key}',
                        'auth/r/info/funding/{key}',
                        'auth/r/movements/{currency}/hist',
                        'auth/r/stats/perf:{timeframe}/hist',
                        'auth/r/alerts',
                        'auth/w/alert/set',
                        'auth/w/alert/{type}:{symbol}:{price}/del',
                        'auth/calc/order/avail',
                        'auth/r/ledgers/{symbol}/hist',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.0005,
                        'BCH': 0.0005,
                        'ETH': 0.01,
                        'EOS': 0.1,
                        'LTC': 0.001,
                        'OMG': 0.1,
                        'IOT': 0.0,
                        'NEO': 0.0,
                        'ETC': 0.01,
                        'XRP': 0.02,
                        'ETP': 0.01,
                        'ZEC': 0.001,
                        'BTG': 0.0,
                        'DASH': 0.01,
                        'XMR': 0.04,
                        'QTM': 0.01,
                        'EDO': 0.5,
                        'DAT': 1.0,
                        'AVT': 0.5,
                        'SAN': 0.1,
                        'USDT': 5.0,
                        'SPK': 9.2784,
                        'BAT': 9.0883,
                        'GNT': 8.2881,
                        'SNT': 14.303,
                        'QASH': 3.2428,
                        'YYW': 18.055,
                    },
                },
            },
        });
    }

    isFiat (code) {
        let fiat = {
            'USD': 'USD',
            'EUR': 'EUR',
        };
        return (code in fiat);
    }

    getCurrencyId (code) {
        let isFiat = this.isFiat (code);
        let prefix = isFiat ? 'f' : 't';
        return prefix + code;
    }

    async fetchMarkets () {
        let markets = await this.v1GetSymbolsDetails ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['pair'].toUpperCase ();
            let baseId = id.slice (0, 3);
            let quoteId = id.slice (3, 6);
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            id = 't' + id;
            baseId = this.getCurrencyId (baseId);
            quoteId = this.getCurrencyId (quoteId);
            let precision = {
                'price': market['price_precision'],
                'amount': market['price_precision'],
            };
            let limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minimum_order_size'),
                    'max': this.safeFloat (market, 'maximum_order_size'),
                },
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': Math.pow (10, precision['price']),
                },
            };
            limits['cost'] = {
                'min': limits['amount']['min'] * limits['price']['min'],
                'max': undefined,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': limits,
                'lot': Math.pow (10, -precision['amount']),
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostAuthRWallets ();
        let balanceType = this.safeString (params, 'type', 'exchange');
        let result = { 'info': response };
        for (let b = 0; b < response.length; b++) {
            let balance = response[b];
            let accountType = balance[0];
            let currency = balance[1];
            let total = balance[2];
            let available = balance[4];
            if (accountType === balanceType) {
                if (currency[0] === 't')
                    currency = currency.slice (1);
                let uppercase = currency.toUpperCase ();
                uppercase = this.commonCurrencyCode (uppercase);
                let account = this.account ();
                account['free'] = available;
                account['total'] = total;
                if (account['free'])
                    account['used'] = account['total'] - account['free'];
                result[uppercase] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetBookSymbolPrecision (this.extend ({
            'symbol': this.marketId (symbol),
            'precision': 'R0',
        }, params));
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
        for (let i = 0; i < orderbook.length; i++) {
            let order = orderbook[i];
            let price = order[1];
            let amount = order[2];
            let side = (amount > 0) ? 'bids' : 'asks';
            amount = Math.abs (amount);
            result[side].push ([ price, amount ]);
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let length = ticker.length;
        let last = ticker[length - 4];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker[length - 2],
            'low': ticker[length - 1],
            'bid': ticker[length - 10],
            'bidVolume': undefined,
            'ask': ticker[length - 8],
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': ticker[length - 6],
            'percentage': ticker[length - 5],
            'average': undefined,
            'baseVolume': ticker[length - 3],
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTickers (this.extend ({
            'symbols': this.ids.join (','),
        }, params));
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let id = ticker[0];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.markets[symbol];
        let ticker = await this.publicGetTickerSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        let [ id, timestamp, amount, price ] = trade;
        let side = (amount < 0) ? 'sell' : 'buy';
        if (amount < 0) {
            amount = -amount;
        }
        return {
            'id': id.toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 120, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'sort': '-1',
            'limit': limit, // default = max = 120
        };
        if (typeof since !== 'undefined')
            request['start'] = since;
        let response = await this.publicGetTradesSymbolHist (this.extend (request, params));
        let trades = this.sortBy (response, 1);
        return this.parseTrades (trades, market, undefined, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 100, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (typeof since === 'undefined')
            since = this.milliseconds () - this.parseTimeframe (timeframe) * limit * 1000;
        let request = {
            'symbol': market['id'],
            'timeframe': this.timeframes[timeframe],
            'sort': 1,
            'limit': limit,
            'start': since,
        };
        let response = await this.publicGetCandlesTradeTimeframeSymbolHist (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        throw new NotSupported (this.id + ' createOrder not implemented yet');
    }

    cancelOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' cancelOrder not implemented yet');
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrder not implemented yet');
    }

    async fetchDepositAddress (currency, params = {}) {
        throw new NotSupported (this.id + ' fetchDepositAddress() not implemented yet.');
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        throw new NotSupported (this.id + ' withdraw not implemented yet');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = 25, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'limit': limit,
            'end': this.seconds (),
        };
        if (typeof since !== 'undefined')
            request['start'] = parseInt (since / 1000);
        let response = await this.privatePostAuthRTradesSymbolHist (this.extend (request, params));
        // return this.parseTrades (response, market, since, limit); // not implemented yet for bitfinex v2
        return response;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'v1')
            request = api + request;
        else
            request = this.version + request;
        let url = this.urls['api'] + '/' + request;
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            body = this.json (query);
            let auth = '/api' + '/' + request + nonce + body;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha384');
            headers = {
                'bfx-nonce': nonce,
                'bfx-apikey': this.apiKey,
                'bfx-signature': signature,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (response) {
            if ('message' in response) {
                if (response['message'].indexOf ('not enough exchange balance') >= 0)
                    throw new InsufficientFunds (this.id + ' ' + this.json (response));
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
            return response;
        } else if (response === '') {
            throw new ExchangeError (this.id + ' returned empty response');
        }
        return response;
    }
};
