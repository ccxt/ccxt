'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class lakebtc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lakebtc',
            'name': 'LakeBTC',
            'countries': 'US',
            'version': 'api_v2',
            'has': {
                'CORS': true,
                'createMarketOrder': false,
                'fetchTickers': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28074120-72b7c38a-6660-11e7-92d9-d9027502281d.jpg',
                'api': 'https://api.lakebtc.com',
                'www': 'https://www.lakebtc.com',
                'doc': [
                    'https://www.lakebtc.com/s/api_v2',
                    'https://www.lakebtc.com/s/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'bcorderbook',
                        'bctrades',
                        'ticker',
                    ],
                },
                'private': {
                    'post': [
                        'buyOrder',
                        'cancelOrders',
                        'getAccountInfo',
                        'getExternalAccounts',
                        'getOrders',
                        'getTrades',
                        'openOrders',
                        'sellOrder',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.15 / 100,
                    'taker': 0.2 / 100,
                },
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetTicker ();
        let result = [];
        let keys = Object.keys (markets);
        for (let k = 0; k < keys.length; k++) {
            let id = keys[k];
            let market = markets[id];
            let baseId = id.slice (0, 3);
            let quoteId = id.slice (3, 6);
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['balance'];
        let result = { 'info': response };
        let ids = Object.keys (balances);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let code = id;
            if (id in this.currencies_by_id) {
                let currency = this.currencies_by_id[id];
                code = currency['code'];
            }
            let balance = parseFloat (balances[id]);
            let account = {
                'free': balance,
                'used': 0.0,
                'total': balance,
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetBcorderbook (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last');
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
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let symbol = ids[i];
            let ticker = tickers[symbol];
            let market = undefined;
            if (symbol in this.markets_by_id) {
                market = this.markets_by_id[symbol];
                symbol = market['symbol'];
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let tickers = await this.publicGetTicker (params);
        return this.parseTicker (tickers[market['id']], market);
    }

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': trade['tid'].toString (),
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amount'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetBctrades (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type === 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let method = 'privatePost' + this.capitalize (side) + 'Order';
        let market = this.market (symbol);
        let order = {
            'params': [ price, amount, market['id'] ],
        };
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelOrder ({ 'params': id });
    }

    nonce () {
        return this.microseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version;
        if (api === 'public') {
            url += '/' + path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let queryParams = '';
            if ('params' in params) {
                queryParams = params['params'].join ();
            }
            let query = this.urlencode ({
                'tonce': nonce,
                'accesskey': this.apiKey,
                'requestmethod': method.toLowerCase (),
                'id': nonce,
                'method': path,
                'params': queryParams,
            });
            body = this.json ({
                'method': path,
                'params': queryParams,
                'id': nonce,
            });
            let signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha1');
            let auth = this.encode (this.apiKey + ':' + signature);
            headers = {
                'Json-Rpc-Tonce': nonce.toString (),
                'Authorization': 'Basic ' + this.decode (this.stringToBase64 (auth)),
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
};
