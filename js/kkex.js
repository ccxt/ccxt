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
            'countries': [ 'CN', 'US', 'JA' ],
            'version': 'v1',
            'has': {
                'CORS': false,
                'publicAPI': false,
                'fetchBalance': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchFundingFees': false,
                'fetchTickers': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'createMarketOrder': true,
                'withdraw': false,
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
                    'public': 'http://kkex.vip/api/v1',
                    'private': 'http://kkex.vip/api/v2',
                },
                'www': 'http://kkex.vip',
                'doc': [
                    'http://kkex.vip/api_wiki/cn/',
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
            'symbol': this.marketId (symbol),
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
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
            'since': since
        }, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let side = this.safeString (order, 'side');
        if (typeof side === 'undefined') {
            side = this.safeString (order, 'type');
        }
        let timestamp = undefined;
        let iso8601 = undefined;
        if ('datetime' in order) {
            timestamp = this.parse8601 (order['datetime']);
            iso8601 = this.iso8601 (timestamp);
        }
        return {
            'id': order['order_id'] || order['id'],
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
        let sides = ['buy', 'sell', 'buy_market', 'sell_market'];

        let request = {'symbol': market['id']};
        if (type === 'market') {
            if (side === 'sell') {
                request['amount'] = amount;
            } else if (side === 'buy') {
                request['price'] = amount;
            }
            side += '_market'
        } else {
            request['amount'] = amount;
            request['price'] = price;
        }

        request['type'] = side

        if (sides.indexOf(side) === -1)
            throw new ExchangeError ('side not in', sides);

        let response = await this.privatePostTrade (this.extend (request, params));
        if (response['result'] === false) {
            throw new ExchangeError (JSON.stringify(response));
        }
        let id = response['order_id'];
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
        let response = await this.privatePostCancelOrder (this.extend ({
            'order_id': id,
            'symbol': symbol.replace('/', ''),
        }, params));
        return response;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrders(0, symbol, since, limit, params);
    }

    async fetchOrders (status = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostOrderHistory( this.extend ({
            'symbol': market['id'],
            'status': status,
        }, params));
        return this.parseOrders (response['orders'], market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrders(1, symbol, since, limit, params);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        console.log('debug:', url)
        if (api === 'public') {
            url += '?' + this.urlencode (params);
            headers = { 'Content-Type': 'application/json' };
            return { 'url': url, 'method': method, 'body': body, 'headers': headers };
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce();
            let sign = this.extend ({'nonce': nonce, 'api_key': this.apiKey}, params);
            let signArr = Object.keys(sign).sort();
            let newSign = signArr.map(el => {
                let t = {};
                t[el] = sign[el];
                return t;
            })

            newSign.push({'secret_key': this.secret});
            var out = [];
            for (let i in newSign) {
                let key = Object.keys(newSign[i])[0]
                out.push(encodeURIComponent(key) + '=' + encodeURIComponent(newSign[i][key]));
            }
            newSign = out.join('&');
            newSign = this.hash (newSign, 'md5').toUpperCase();
            body = this.extend ({
                'api_key': this.apiKey,
                'sign': newSign,
                'nonce': nonce,
            }, params)
            let str = [];
            let keys = Object.keys(body);
            for(let i in keys) {
                let key = keys[i]
                str.push(encodeURIComponent(key) + "=" + encodeURIComponent(body[key]));
            }
            body = str.join("&");
            headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            return { 'url': url, 'method': method, 'body': body, 'headers': headers };
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        return response;
    }
};
