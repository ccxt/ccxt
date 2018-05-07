'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, DDoSProtection, ExchangeNotAvailable, InvalidOrder, OrderNotFound, PermissionDenied, InsufficientFunds } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class kkex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kkex',
            'name': 'Kkex',
            'countries': [ 'CN', 'US', 'KR' ],
            'version': 'v1',
            'has': {
                'CORS': false,
                'publicAPI': false,
                'fetchBalance': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchFundingFees': false,
                'fetchTickers': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'createMarketOrder': false,
                'withdraw': true,
            },
            'timeframes': {
                 '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '8h': '12hour',
                '1d': 'day',
                '1w': '1week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/34902611-2be8bf1a-f830-11e7-91a2-11b2f292e750.jpg',
                'api': {
                    'public': 'https://kkex.vip/api/v1',
                    'private': 'https://kkex.vip/api/v2',
                },
                'www': 'https://kkex.vip',
                'doc': [
                    'https://kkex.vip/api_wiki/cn/',
                ],
                'fees': 'https://intercom.help/kkex/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'products',
                        'assets',
                        'tickers',
                        'ticker',
                        'depth',
                        'trades',
                        'kline',
                        'exchange_rate',
                    ],
                    'post': [
                        'process_strategy',
                    ],
                },
                'private': {
                    'get': [],
                    'post': [
                        'profile',
                        'userinfo',
                        'trade',
                        'batch_trade',
                        'cancel_order',
                        'cancel_all_orders',
                        'order_info',
                        'orders_info',
                        'order_history',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.002,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'options': {
                'lastNonceTimestamp': 0,
            },
            'exceptions': {
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        let tickers = await this.publicGetTickers(params);
        tickers = tickers['tickers']
        let products = await this.publicGetProducts(params);
        products = products['products']
        let markets = tickers.map ( el => Object.keys(el)[0]);
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let id = markets[i];
            let market = markets[i];
            let baseId, quoteId = '';
            for (let j = 0; j < products.length; j++) {
                let p = products[j];
                if (p['mark_asset'] + p['base_asset'] === market) {
                    quoteId = p['base_asset'];
                    baseId =  p['mark_asset'];
                }
            }
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
                'info': market
            })
        }
        return result;
    }

    async fetchBalance (params = {}) {
        // await this.loadMarkets ();
        // let response = await this.privatePostBalances (params);
        // let data = response['data'];
        // let balances = this.omit (data, 'uid');
        // let result = { 'info': response };
        // let keys = Object.keys (balances);
        // for (let i = 0; i < keys.length; i++) {
        //     let id = keys[i];
        //     let idHasUnderscore = (id.indexOf ('_') >= 0);
        //     if (!idHasUnderscore) {
        //         let code = id.toUpperCase ();
        //         if (id in this.currencies_by_id) {
        //             code = this.currencies_by_id[id]['code'];
        //         }
        //         let account = this.account ();
        //         let usedField = id + '_lock';
        //         account['used'] = this.safeFloat (balances, usedField);
        //         account['total'] = this.safeFloat (balances, id);
        //         account['free'] = account['total'] - account['used'];
        //         result[code] = account;
        //     }
        // }
        // return this.parseBalance (result);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['date'] * 1000;
        let symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last');
        ticker = ticker['ticker'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.markets[symbol];
        let response = await this.publicGetTicker (this.extend ({
            'symbol': market['id'],
        }, params));
        let t = {
            ticker: response['ticker'],
            symbol: symbol,
            date: response['date']
        };
        return this.parseTicker (t, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTickers (params);
        let tickers = response['tickers'];
        let date = response['date'];
        let ids = tickers.map(el => Object.keys(el)[0])
        let result = {}
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[i][id];
            let t = {
                'ticker': ticker,
                'symbol': symbol,
                'date': date,
            };
            result[symbol] = this.parseTicker (t, market);
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
        let timestamp = parseInt (trade['date']) * 1000;
        let datetime = this.iso8601 (timestamp);
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let id = market['id'];
        let symbol = market['symbol'];
        return {
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'id': undefined,
            'order': undefined,
            'type': 'limit',
            'side': trade['type'],
            'price': price,
            'amount': amount,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
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
        let url = this.urls['api'][api] + '/' + path;
        console.log('debug:', url)
        let cmds = this.json ([ params ]);
        if (api === 'public') {
            url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            body = {
                'cmds': cmds,
                'apikey': this.apiKey,
                'sign': this.hmac (this.encode (cmds), this.encode (this.secret), 'md5'),
            };
        }
        if (typeof body !== 'undefined')
            body = this.json (body, { 'convertArraysToObjects': true });
        headers = { 'Content-Type': 'application/json' };

        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (method === 'GET') {
            return response;
        } else {
            return response['result'][0];
        }
    }
};
