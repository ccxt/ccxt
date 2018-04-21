'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, InvalidNonce, InsufficientFunds, OrderNotFound, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitz extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitz',
            'name': 'Bit-Z',
            'countries': 'HK',
            'rateLimit': 1000,
            'version': 'v1',
            'userAgent': this.userAgents['chrome'],
            'has': {
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/35862606-4f554f14-0b5d-11e8-957d-35058c504b6f.jpg',
                'api': 'https://www.bit-z.com/api_v1',
                'www': 'https://www.bit-z.com',
                'doc': 'https://www.bit-z.com/api.html',
                'fees': 'https://www.bit-z.com/about/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'tickerall',
                        'depth',
                        'orders',
                        'kline',
                    ],
                },
                'private': {
                    'post': [
                        'balances',
                        'tradeAdd',
                        'tradeCancel',
                        'openOrders',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.001,
                    'taker': 0.001,
                },
                'funding': {
                    'withdraw': {
                        'BTC': '0.5%',
                        'DKKT': '0.5%',
                        'ETH': 0.01,
                        'USDT': '0.5%',
                        'LTC': '0.5%',
                        'FCT': '0.5%',
                        'LSK': '0.5%',
                        'HXI': '0.8%',
                        'ZEC': '0.5%',
                        'DOGE': '0.5%',
                        'MZC': '0.5%',
                        'ETC': '0.5%',
                        'GXS': '0.5%',
                        'XPM': '0.5%',
                        'PPC': '0.5%',
                        'BLK': '0.5%',
                        'XAS': '0.5%',
                        'HSR': '0.5%',
                        'NULS': 5.0,
                        'VOISE': 350.0,
                        'PAY': 1.5,
                        'EOS': 0.6,
                        'YBCT': 35.0,
                        'OMG': 0.3,
                        'OTN': 0.4,
                        'BTX': '0.5%',
                        'QTUM': '0.5%',
                        'DASH': '0.5%',
                        'GAME': '0.5%',
                        'BCH': '0.5%',
                        'GNT': 9.0,
                        'SSS': 1500.0,
                        'ARK': '0.5%',
                        'PART': '0.5%',
                        'LEO': '0.5%',
                        'DGB': '0.5%',
                        'ZSC': 130.0,
                        'VIU': 350.0,
                        'BTG': '0.5%',
                        'ARN': 10.0,
                        'VTC': '0.5%',
                        'BCD': '0.5%',
                        'TRX': 200.0,
                        'HWC': '0.5%',
                        'UNIT': '0.5%',
                        'OXY': '0.5%',
                        'MCO': 0.3500,
                        'SBTC': '0.5%',
                        'BCX': '0.5%',
                        'ETF': '0.5%',
                        'PYLNT': 0.4000,
                        'XRB': '0.5%',
                        'ETP': '0.5%',
                    },
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'options': {
                'lastNonceTimestamp': 0,
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetTickerall ();
        let markets = response['data'];
        let ids = Object.keys (markets);
        let result = [];
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = markets[id];
            let [ baseId, quoteId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostBalances (params);
        let data = response['data'];
        let balances = this.omit (data, 'uid');
        let result = { 'info': response };
        let keys = Object.keys (balances);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let idHasUnderscore = (id.indexOf ('_') >= 0);
            if (!idHasUnderscore) {
                let code = id.toUpperCase ();
                if (id in this.currencies_by_id) {
                    code = this.currencies_by_id[id]['code'];
                }
                let account = this.account ();
                let usedField = id + '_lock';
                account['used'] = this.safeFloat (balances, usedField);
                account['total'] = this.safeFloat (balances, id);
                account['free'] = account['total'] - account['used'];
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['date'] * 1000;
        let symbol = market['symbol'];
        let last = parseFloat (ticker['last']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'bidVolume': undefined,
            'ask': parseFloat (ticker['sell']),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['vol']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTicker (this.extend ({
            'coin': market['id'],
        }, params));
        return this.parseTicker (response['data'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTickerall (params);
        let tickers = response['data'];
        let result = {};
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (tickers[id], market);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetDepth (this.extend ({
            'coin': this.marketId (symbol),
        }, params));
        let orderbook = response['data'];
        let timestamp = orderbook['date'] * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    }

    parseTrade (trade, market = undefined) {
        let hkt = this.sum (this.milliseconds (), 28800000);
        let utcDate = this.iso8601 (hkt);
        utcDate = utcDate.split ('T');
        utcDate = utcDate[0] + ' ' + trade['t'] + '+08';
        let timestamp = this.parse8601 (utcDate);
        let price = parseFloat (trade['p']);
        let amount = parseFloat (trade['n']);
        let symbol = market['symbol'];
        let cost = this.priceToPrecision (symbol, amount * price);
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': undefined,
            'order': undefined,
            'type': 'limit',
            'side': trade['s'],
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetOrders (this.extend ({
            'coin': market['id'],
        }, params));
        let trades = response['data']['d'];
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetKline (this.extend ({
            'coin': market['id'],
            'type': this.timeframes[timeframe],
        }, params));
        let ohlcv = JSON.parse (response['data']['datas']['data']);
        return this.parseOHLCVs (ohlcv, market, timeframe, since, limit);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let side = this.safeString (order, 'side');
        if (typeof side === 'undefined') {
            side = this.safeString (order, 'type');
            if (typeof side !== 'undefined')
                side = (side === 'in') ? 'buy' : 'sell';
        }
        let timestamp = undefined;
        let iso8601 = undefined;
        if ('datetime' in order) {
            timestamp = this.parse8601 (order['datetime']);
            iso8601 = this.iso8601 (timestamp);
        }
        return {
            'id': order['id'],
            'datetime': iso8601,
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': order['price'],
            'cost': undefined,
            'amount': order['number'],
            'filled': undefined,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderType = (side === 'buy') ? 'in' : 'out';
        if (!this.password)
            throw new ExchangeError (this.id + ' createOrder() requires you to set exchange.password = "YOUR_TRADING_PASSWORD" (a trade password is NOT THE SAME as your login password)');
        let request = {
            'coin': market['id'],
            'type': orderType,
            'price': this.priceToPrecision (symbol, price),
            'number': this.amountToString (symbol, amount),
            'tradepwd': this.password,
        };
        let response = await this.privatePostTradeAdd (this.extend (request, params));
        let id = response['data']['id'];
        let order = this.parseOrder ({
            'id': id,
            'price': price,
            'number': amount,
            'side': side,
        }, market);
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostTradeCancel (this.extend ({
            'id': id,
        }, params));
        return response;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostOpenOrders (this.extend ({
            'coin': market['id'],
        }, params));
        return this.parseOrders (response['data'], market, since, limit);
    }

    nonce () {
        let currentTimestamp = this.seconds ();
        if (currentTimestamp > this.options['lastNonceTimestamp']) {
            this.options['lastNonceTimestamp'] = currentTimestamp;
            this.options['lastNonce'] = 100000;
        }
        this.options['lastNonce'] += 1;
        return this.options['lastNonce'];
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        let query = undefined;
        if (api === 'public') {
            query = this.urlencode (params);
            if (query.length)
                url += '?' + query;
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.keysort (this.extend ({
                'api_key': this.apiKey,
                'timestamp': this.seconds (),
                'nonce': this.nonce (),
            }, params)));
            body += '&sign=' + this.hash (this.encode (body + this.secret));
            headers = { 'Content-type': 'application/x-www-form-urlencoded' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        let code = this.safeString (response, 'code');
        if (code !== '0') {
            let ErrorClass = this.safeValue ({
                '103': AuthenticationError,
                '104': AuthenticationError,
                '200': AuthenticationError,
                '202': AuthenticationError,
                '401': AuthenticationError,
                '406': AuthenticationError,
                '203': InvalidNonce,
                '201': OrderNotFound,
                '408': InsufficientFunds,
                '106': DDoSProtection,
            }, code, ExchangeError);
            let message = this.safeString (response, 'msg', 'Error');
            throw new ErrorClass (message);
        }
        return response;
    }
};
