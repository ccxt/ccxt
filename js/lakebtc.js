'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, BadSymbol, InvalidOrder, InsufficientFunds } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class lakebtc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lakebtc',
            'name': 'LakeBTC',
            'countries': [ 'US' ],
            'version': 'api_v2',
            'rateLimit': 1000,
            'has': {
                'cancelOrder': true,
                'CORS': true,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
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
            'exceptions': {
                'broad': {
                    'Signature': AuthenticationError,
                    'invalid symbol': BadSymbol,
                    'Volume doit': InvalidOrder,
                    'insufficient_balance': InsufficientFunds,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetTicker (params);
        const result = [];
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = response[id];
            const baseId = id.slice (0, 3);
            const quoteId = id.slice (3, 6);
            const base = baseId.toUpperCase ();
            const quote = quoteId.toUpperCase ();
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': undefined,
                'precision': this.precision,
                'limits': this.limits,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetAccountInfo (params);
        const balances = this.safeValue (response, 'balance', {});
        const result = { 'info': response };
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeFloat (balances, currencyId);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        const response = await this.publicGetBcorderbook (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
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
        const response = await this.publicGetTicker (params);
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const marketId = ids[i];
            const ticker = response[marketId];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickers = await this.publicGetTicker (params);
        return this.parseTicker (tickers[market['id']], market);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'date');
        const id = this.safeString (trade, 'tid');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
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
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetBctrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        const method = 'privatePost' + this.capitalize (side) + 'Order';
        const market = this.market (symbol);
        const order = {
            'params': [ price, amount, market['id'] ],
        };
        const response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': this.safeString (response, 'id'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'params': [ id ],
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    nonce () {
        return this.microseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version;
        if (api === 'public') {
            url += '/' + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const nonceAsString = nonce.toString ();
            const requestId = this.seconds ();
            let queryParams = '';
            if ('params' in params) {
                const paramsList = params['params'];
                const stringParams = [];
                for (let i = 0; i < paramsList.length; i++) {
                    let param = paramsList[i];
                    if (typeof paramsList !== 'string') {
                        param = param.toString ();
                    }
                    stringParams.push (param);
                }
                queryParams = stringParams.join (',');
                body = {
                    'method': path,
                    'params': params['params'],
                    'id': requestId,
                };
            } else {
                body = {
                    'method': path,
                    'params': '',
                    'id': requestId,
                };
            }
            body = this.json (body);
            let query = [
                'tonce=' + nonceAsString,
                'accesskey=' + this.apiKey,
                'requestmethod=' + method.toLowerCase (),
                'id=' + requestId.toString (),
                'method=' + path,
                'params=' + queryParams,
            ];
            query = query.join ('&');
            const signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha1');
            const auth = this.apiKey + ':' + signature;
            const signature64 = this.decode (this.stringToBase64 (auth));
            headers = {
                'Json-Rpc-Tonce': nonceAsString,
                'Authorization': 'Basic ' + signature64,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to the default error handler
        }
        //
        //     {"error":"Failed to submit order: invalid symbol"}
        //     {"error":"Failed to submit order: La validation a échoué : Volume doit être supérieur ou égal à 1.0"}
        //     {"error":"Failed to submit order: insufficient_balance"}
        //
        const feedback = this.id + ' ' + body;
        const error = this.safeString (response, 'error');
        if (error !== undefined) {
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
