'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, RequestTimeout, InvalidOrder, AuthenticationError, InsufficientFunds, NetworkError, ExchangeNotAvailable, DDoSProtection, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class dragonex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dragonex',
            'name': 'DragonEX',
            'countries': ['SG'], // Singapore
            'version': 'v1',
            'rateLimit': 2000,  // NOT THE ACTUAL RATE LIMIT
            'accessToken': undefined,
            'has': {
                'createOrder': true,
                'fetchOrderBooks': true,
                'fetchOHLCV': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchCurrencies': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://openapi.dragonex.io/api', // all endpoints are authenticated
                    'private': 'https://openapi.dragonex.io/api',
                },
                'www': 'https://dragonex.io',
                'referral': '',
                'doc': 'https://github.com/Dragonexio/OpenApi/tree/master/docs/English',
                'fees': 'https://dragonex.zendesk.com/hc/en-us/articles/115002431171-Fee',
            },
            'api': {
                'private': {
                    'get': [
                        'coin/all',
                        'user/own',
                        'symbol/all',
                        'market/kline',
                        'market/real',
                        'market/buy',
                        'market/sell',
                    ],
                    'post': [
                        'token/new',
                        'token/status',
                        'user/own',
                        'order/buy',
                        'order/sell',
                        'order/cancel',
                        'order/detail',
                        'order/history',
                        'deal/history',
                    ],
                },
            },
            'timeframes': {
                '1m': 1,
                '5m': 2,
                '15m': 3,
                '30m': 4,
                '60m': 5,
                '1h': 5,
                '1d': 6,
            },
            'exceptions': {
                '2': RequestTimeout,
                '3': NetworkError,
                '4': ExchangeError,
                '5': ExchangeError,
                '6': ExchangeNotAvailable,
                '7': ExchangeNotAvailable,
                '8': ExchangeError,
                '4000': InsufficientFunds,  // not all error codes are documented
                '5016': InvalidOrder,
                '9006': AuthenticationError,
                '9007': AuthenticationError,
                '9008': DDoSProtection,
                '9011': AuthenticationError,
                '9016': DDoSProtection,
            },
        });
    }

    async fetchMarkets () {
        if (typeof this.accessToken === 'undefined') {
            await this.authenticate ();
        }
        let response = await this.privateGetSymbolAll ();
        let data = response['data'];
        let result = [];
        for (let i = 0; i < data.length; i++) {
            let info = data[i];
            let id = info['symbol'];
            let [ base, quote ] = id.split ('_');
            let symbol = base.toUpperCase () + '/' + quote.toUpperCase ();
            let int_symbol_id = info['symbol_id'];  // store it as a string
            result.push ({
                'id': int_symbol_id,
                'symbol': symbol,
                'info': info,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let response = await this.privateGetCoinAll ();
        let data = response['data'];
        let result = {};
        for (let i = 0; i < data.length; i++) {
            let info = data[i];
            let id = info['code'];
            let code = this.commonCurrencyCode (id.toUpperCase ());
            let int_coin_id = info['coin_id'];
            result[code] = {
                'id': int_coin_id,
                'code': code,
                'info': info,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        // They provide no data if you have no balance
        await this.loadMarkets ();
        let response = await this.privatePostUserOwn ();
        let result = { 'info': response };
        let data = response['data'];
        for (let i = 0; i < data.length; i++) {
            let current = data[i];
            let code = current['code'].toUpperCase ();
            let account = {
                'used': this.safeFloat (current, 'frozen', 0),
                'total': this.safeFloat (current, 'volume', 0),
            };
            account['free'] = account['total'] - account['used'];
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        // makes two requests because that is how they implemented it
        await this.loadMarkets ();
        let market = this.market (symbol);
        let symbol_id = market['id'];
        let buy_side = await this.privateGetMarketBuy ({ 'symbol_id': symbol_id });
        let sell_side = await this.privateGetMarketSell ({ 'symbol_id': symbol_id });
        let nonunified = { 'bids': buy_side['data'], 'asks': sell_side['data'] };
        return this.parseOrderBook (nonunified, undefined, 'bids', 'asks', 'price', 'volume', market);
    }

    parseOrderBook (orderbook, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1, market = undefined) {
        let result = {};
        let sides = [ bidsKey, asksKey ];
        for (let i = 0; i < sides.length; i++) {
            let side = sides[i];
            let new_book = [];
            let book = orderbook[side];
            for (let i = 0; i < book.length; i++) {
                let price = this.safeFloat (book[i], priceKey);
                let volume = this.safeFloat (book[i], amountKey);
                new_book.push ([ price, volume ]);
            }
            result[side] = new_book;
        }
        result['timestamp'] = timestamp;
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let id = market['id'];
        let response = await this.privateGetMarketReal (this.extend ({ 'symbol_id': id }, params));
        let data = response['data'][0];
        return this.parseTicker (data, market);
    }

    parseTicker (ticker, market) {
        let close = this.safeFloat (ticker, 'close_price');
        return {
            'info': ticker,
            'close': close,
            'high': this.safeFloat (ticker, 'max_price'),
            'low': this.safeFloat (ticker, 'min_price'),
            'open': this.safeFloat (ticker, 'open_price'),
            'last': close,
            'baseVolume': this.safeFloat (ticker, 'total_volume'),
            'quoteVolume': this.safeFloat (ticker, 'total_amount'),
            'change': this.safeFloat (ticker, 'price_change'),
            'percentage': this.safeFloat (ticker, 'price_change_percentage'),
            'timestamp': this.safeInteger (ticker, 'timestamp'),
        };
    }

    handleErrors (code, reason, url, method, headers, body, response = undefined) {
        if (typeof response !== 'undefined') {
            // JS callchain parses body beforehand
            this.throwExceptionOnError (body, response);
        } else if (body && (body[0] === '{')) {
            // Python/PHP callchains don't have json available at this step
            this.throwExceptionOnError (body, JSON.parse (body));
        }
    }

    throwExceptionOnError (body, response) {
        let code = this.safeString (response, 'code');
        if (code !== '1') {
            if (code in this.exceptions) {
                throw new this.exceptions[code] (body);
            } else {
                throw new ExchangeError (body);
            }
        }
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = 0, limit = 100, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let symbol_id = market['id'];
        let symbolic_timeframe = this.timeframes[timeframe];
        let request = {
            'symbol_id': symbol_id,
            'kline_type': symbolic_timeframe,
            'count': limit,
            'st': since,
        };
        let response = await this.privateGetMarketKline (this.extend (request, params));
        let lists = response['data']['lists'];
        let ohlcvs = [];
        for (let i = 0; i < lists.length; i++) {
            let cur = lists[i];
            let ohlcv = [ cur[6], cur[4], cur[2], cur[3], cur[1], cur[0] ];  // columns - [ 'amount','close_price','max_price','min_price','open_price','pre_close_price','timestamp','usdt_amount','volume' ]
            ohlcv = ohlcv.map (parseFloat);
            ohlcv[0] = parseInt (ohlcv[0]);
            ohlcvs.push (ohlcv);
        }
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type !== 'limit') {
            throw new NotSupported ('Only limit orders are currently supported');
        }
        let market = this.market (symbol);
        let request = {
            'symbol_id': market['id'],
            'price': price.toString (),
            'volume': amount.toString (),  // change to xToPrecision
        };
        let method = 'privatePostOrder' + this.capitalize (side);
        return await this[method] (this.extend (request, params));
    }

    async cancelOrder (symbol, order_id, params = {}) {
        await this.loadMarkets ();
        let symbol_id = this.market (symbol)['id'];
        let request = this.extend ({ 'symbol_id': symbol_id, 'order_id': order_id }, params);
        return this.privatePostOrderCancel (request);
    }

    async fetchOrder (symbol, order_id, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let symbol_id = market['id'];
        let request = this.extend ({ 'symbol_id': symbol_id, 'order_id': order_id }, params);
        let response = await this.privatePostOrderDetail (request);
        return this.parseOrder (response['data'], market);
    }

    async fetchOrders (symbol, since = undefined, limit = 100, params = {}) {
        if (typeof symbol === 'undefined') {
            throw new ExchangeError ('symbol is required for fetchOrders');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let symbol_id = market['id'];
        let request = {
            'symbol_id': symbol_id,
            'count': limit,
        };
        let response = await this.privatePostOrderHistory (this.extend (request, params));
        return this.parseOrders (response['data']['list'], market, since, limit);
    }

    async fetchOpenOrders (symbol, since = undefined, limit = 100, params = {}) {
        let response = this.fetchOrders (symbol, since, limit, params);
        return this.filterByValueSinceLimit (response, 'status', 'open', since, limit);
    }

    async fetchClosedOrders (symbol, since = undefined, limit = 100, params = {}) {
        let response = this.fetchOrders (symbol, since, limit, params);
        return this.filterByValueSinceLimit (response, 'status', 'closed', since, limit);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (typeof market === 'undefined') {
            if (this.markets !== 'undefined') {
                let symbol_id = this.safeInteger (order, 'symbol_id');
                symbol = this.marketsById[symbol_id]['symbol'];
            } else {
                throw new ExchangeError ('parseOrder needs a market argument if this.markets is not loaded');
            }
        } else {
            symbol = market['symbol'];
        }
        let side = this.safeInteger (order, 'order_type') - 1 ? 'sell' : 'buy';
        let amount = this.safeFloat (order, 'volume');
        let filled = this.safeFloat (order, 'trade_volume');
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let timestamp = this.safeString (order, 'timestamp');
        return {
            'info': order,
            'symbol': symbol,
            'id': this.safeString (order, 'order_id'),
            'price': this.safeFloat (order, 'price'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'filled': filled,
            'amount': amount,
            'remaining': amount - filled,
            'side': side,
            'status': status,
        };
    }

    parseOrderStatus (status) {
        let statuses = {
            '0': 'pending',
            '1': 'open',
            '2': 'closed',
            '3': 'cancelled',
            '4': 'failed',
        };
        return this.safeString (statuses, status, 'open');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let symbol_id = market['id'];
        let response = await this.privatePostDealHistory (this.extend ({ 'symbol_id': symbol_id }, params));
        return this.parseTrades (response['data']['trades'], market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (typeof market === 'undefined') {
            if (this.markets !== 'undefined') {
                let symbol_id = this.safeInteger (trade, 'symbol_id');
                symbol = this.marketsById[symbol_id]['symbol'];
            } else {
                throw new ExchangeError ('parseTrade needs a market argument if this.markets is not loaded');
            }
        } else {
            symbol = market['symbol'];
        }
        let fee = this.safeString (trade, 'charge');
        let fee_struct = { 'fee': fee };
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'volume');
        let timestamp = this.safeString (trade, 'timestamp');
        return {
            'info': trade,
            'id': this.safeString (trade, 'trade_id'),
            'symbol': symbol,
            'order': this.safeString (trade, 'order_id'),
            'price': price,
            'cost': price * amount + fee,
            'fee': fee_struct,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    async authenticate () {
        let response = await this.privatePostTokenNew ();
        this.accessToken = response['data']['token'];
        return this.accessToken;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        this.checkRequiredCredentials ();
        if (method === 'POST') {
            path += '/';  // don't ask why
            body = this.extend (body, params);
            body = JSON.stringify (body);
        }
        let signablePath = '/' + this.version + '/' + path;
        let url = this.urls['api'][api] + signablePath;
        let shaContent = this.hash (body, 'sha1');
        let contentType = 'application/json';
        let date = this.emailGMT (this.milliseconds ());
        let canonicalizedDragonExHeaders = '';  // not sure what this is
        let string = [method, shaContent, contentType, date, canonicalizedDragonExHeaders].join ('\n');
        string = string + '/api' + signablePath;
        let signed = this.hmac (string, this.secret, 'sha1', 'base64');
        headers = {
            'auth': this.apiKey + ':' + signed,
            'content-type': contentType,
            'content-sha1': shaContent,
            'date': date,
        };
        if (typeof this.accessToken !== 'undefined') {
            headers['token'] = this.accessToken;
        }
        if (method === 'GET') {
            if (Object.keys (params).length > 0) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
