'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AccountSuspended, BadRequest, BadResponse, NetworkError, DDoSProtection, AuthenticationError, PermissionDenied, ArgumentsRequired, ExchangeError, InsufficientFunds, InvalidOrder, InvalidNonce, OrderNotFound } = require ('./base/errors');
const { DECIMAL_PLACES } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class digifinex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'digifinex',
            'name': 'DigiFinex',
            'countries': [ 'SG' ],
            'version': 'v1',
            'rateLimit': 900, // 300 for posts
            'certified': false,
            // new metainfo interface
            'has': {
                // 'cancelAllOrders': false,
                'cancelOrders': true,
                'createMarketOrder': false,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchFundingFees': false,
                // 'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchTickers': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://static.digifinex.vip/newhome/pc/img/index/logo_dark.svg',
                'api': 'https://openapi.digifinex.vip/v2',
                'apiV3': 'https://openapi.digifinex.vip/v3/',
                'www': 'https://www.digifinex.vip/',
                'doc': [
                    'https://github.com/DigiFinex/api',
                ],
                'fees': 'https://digifinex.zendesk.com/hc/en-us/articles/360007166473-Fee-Structure-on-DigiFinex',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                    ],
                },
                'publicV3': {
                    'get': [
                        'markets',
                        'order_book',
                        'trades',
                        'kline',
                    ],
                },
                'private': {
                    'get': [
                        'otc_market_price',
                        'depth',
                        'trade_detail',
                        'kline',
                        'trade_pairs',
                        'open_orders',
                        'order_history',
                        'order_info',
                        'order_detail',
                        'myposition',
                    ],
                    'post': [
                        'trade',
                        'cancel_order',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    '10001': [ BadRequest, "Wrong request method, please check it's a GET ot POST request" ],
                    '10002': [ AuthenticationError, 'Invalid ApiKey' ],
                    '10003': [ AuthenticationError, "Sign doesn't match" ],
                    '10004': [ ArgumentsRequired, 'Illegal request parameters' ],
                    '10005': [ DDoSProtection, 'Request frequency exceeds the limit' ],
                    '10006': [ PermissionDenied, 'Unauthorized to execute this request' ],
                    '10007': [ PermissionDenied, 'IP address Unauthorized' ],
                    '10008': [ InvalidNonce, 'Timestamp for this request is invalid, timestamp must within 1 minute' ],
                    '10009': [ NetworkError, 'Unexist endpoint, please check endpoint URL' ],
                    '10011': [ AccountSuspended, 'ApiKey expired. Please go to client side to re-create an ApiKey' ],
                    '20001': [ PermissionDenied, 'Trade is not open for this trading pair' ],
                    '20002': [ PermissionDenied, 'Trade of this trading pair is suspended' ],
                    '20003': [ InvalidOrder, 'Invalid price or amount' ],
                    '20007': [ InvalidOrder, 'Price precision error' ],
                    '20008': [ InvalidOrder, 'Amount precision error' ],
                    '20009': [ InvalidOrder, 'Amount is less than the minimum requirement' ],
                    '20010': [ InvalidOrder, 'Cash Amount is less than the minimum requirement' ],
                    '20011': [ InsufficientFunds, 'Insufficient balance' ],
                    '20012': [ BadRequest, 'Invalid trade type, valid value: buy/sell)' ],
                    '20013': [ InvalidOrder, 'No order info found' ],
                    '20014': [ BadRequest, 'Invalid date, Valid format: 2018-07-25)' ],
                    '20015': [ BadRequest, 'Date exceeds the limit' ],
                    '20018': [ PermissionDenied, 'Your trading rights have been banned by the system' ],
                    '20019': [ BadRequest, 'Wrong trading pair symbol. Correct format:"usdt_btc". Quote asset is in the front' ],
                },
                'broad': {
                },
            },
            'precisionMode': DECIMAL_PLACES,
            'options': {
                'orderTypes': {
                },
            },
            'apiKey': '15cb6aad284ab8',
            'secret': '48cad555befb5de238f6688b440a803f05cb6aad2',
        });
    }

    async fetchMarkets (params = {}) {
        let response = await this.privateGetTradePairs ();
        let result = [];
        let keys = Object.keys (response['data']);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let pair = id.split ('_');
            let baseId = pair[1];
            let quoteId = pair[0];
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            let symbol = base + '/' + quote;
            let market = response['data'][id];
            let precision = {
                'price': market[1],
                'amount': market[0],
            };
            let limits = {
                'amount': {
                    'min': market[2],
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': market[3],
                    'max': undefined,
                },
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
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        let response = await this.privateGetMyposition ();
        let result = { 'info': response };
        let free = response['free'];
        let frozen = response['frozen'];
        let keysFree = Object.keys (free);
        let keysFrozen = Object.keys (frozen);
        let keys = this.arrayConcat (keysFree, keysFrozen);
        for (let i = 0; i < keys.length; i++) {
            let uppercase = keys[i].toUpperCase ();
            let account = this.account ();
            if (this.inArray (keys[i], keysFree)) {
                account['free'] = free[keys[i]];
            }
            if (this.inArray (keys[i], keysFrozen)) {
                account['used'] = frozen[keys[i]];
            }
            account['total'] = this.sum (account['free'] + account['used']);
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let markets = await this.loadMarkets ();
        symbol = markets[symbol]['id'];
        let request = {
            'symbol': symbol,
        };
        let response = await this.privateGetDepth (this.extend (request, params));
        return this.parseOrderBook (response, parseInt (response['date']) * 1000);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        if (symbols !== undefined) {
            throw new BadRequest ('Only supports fetching all tickers');
        }
        let response = await this.publicGetTicker ();
        let result = {};
        let keys = Object.keys (response['ticker']);
        for (let i = 0; i < keys.length; i++) {
            let symbol = keys[i].toUpperCase ();
            let parts = symbol.split ('_');
            symbol = parts[1] + '/' + parts[0];
            let r = this.parseTicker (response['date'], response['ticker'], symbol);
            result[symbol] = r;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        let markets = await this.loadMarkets ();
        symbol = markets[symbol]['id'];
        let response = await this.publicGetTicker (this.extend ({
            'symbol': symbol,
        }, params));
        let result = 0;
        let keys = Object.keys (response['ticker']);
        for (let i = 0; i < keys.length; i++) {
            let symbol = keys[i];
            result = this.parseTicker (response['date'], response['ticker'], symbol);
        }
        return result;
    }

    parseTicker (date, ticker, symbol) {
        let timestamp = parseInt (date) * 1000;
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
            'close': this.safeFloat (ticker, 'last'),
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000;
        let side = trade['type'].toLowerCase ();
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let cost = price * amount;
        let fee = undefined;
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'order': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        let markets = await this.loadMarkets ();
        let market = markets[symbol];
        symbol = market['id'];
        let request = {
            'symbol': symbol,
        };
        let response = await this.privateGetTradeDetail (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // exchange-specific parameters: post_only
        // post-only: 1: yes, 0: no. A post_only order will only be created as a maker order. If it cannot be placed into order book immediately, it will be cancelled automatically.
        if (!price > 0 || !amount > 0) { // to parse exception tests
            throw new InvalidOrder ();
        }
        await this.loadMarkets ();
        let markets = await this.loadMarkets ();
        let mark = markets[symbol]['id'];
        const order = {
            'symbol': mark,
            'price': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
            'type': side,
        };
        if (type === 'market') {
            throw new InvalidOrder ('market order not supported');
        }
        let response = await this.privatePostTrade (this.extend (order, params));
        let result = {
            'info': response,
            'id': response['order_id'],
            'symbol': symbol,
            'side': side,
        };
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        // await this.loadMarkets ();
        let response = await this.privatePostCancelOrder ({ 'order_id': id });
        if (response.success.length !== 1)
            throw new OrderNotFound ();
        return response;
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        // maximum 20 IDs supported
        let response = await this.privatePostCancelOrder ({ 'order_id': ids.join (',') });
        return response;
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'open', // partially filled
            '2': 'closed',
            '3': 'canceled',
            '4': 'canceled', // partially filled and canceled
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        let side = order['type'];
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        if (market === undefined) {
            let exchange = order['symbol'].toUpperCase ();
            if (exchange in this.markets_by_id) {
                market = this.markets_by_id[exchange];
            }
        }
        let timestamp = parseInt (order['created_date']) * 1000;
        let result = {
            'info': order,
            'id': order['order_id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': parseInt (order['finished_date']) * 1000,
            'symbol': market['symbol'],
            'type': 'limit',
            'side': side,
            'price': this.safeFloat (order, 'price'),
            'average': this.safeFloat (order, 'avg_price'),
            'amount': this.safeFloat (order, 'amount'),
            'remaining': this.safeFloat (order, 'amount') - this.safeFloat (order, 'executed_amount'),
            'filled': this.safeFloat (order, 'executed_amount'),
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // exchange-specific non-unified parameters: page, type
        // page: Page Num, page=1 for 1st page. None for 1st page by default.
        // type：buy/sell/buy_market/sell_market，none for all types
        let markets = await this.loadMarkets ();
        let market = markets[symbol];
        symbol = market['id'];
        let request = {
            'symbol': symbol,
        };
        let response = await this.privateGetOpenOrders (this.extend (request, params));
        let orders = this.parseOrders (response['orders'], market, since, limit);
        return orders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // Only supports historical orders of last 3 days
        // `since` has only date precision in digifinex
        // exchange-specific non-unified parameters: page, type
        // page: Page Num, page=1 for 1st page. None for 1st page by default.
        // type：buy/sell/buy_market/sell_market，none for all types
        let markets = await this.loadMarkets ();
        let market = markets[symbol];
        symbol = market['id'];
        let request = {
            'symbol': symbol,
        };
        if (since) {
            request['date'] = this.dateUTC8 (since);
        }
        let response = await this.privateGetOrderHistory (params);
        let filtered = this.parseOrders (response['orders'], market, since, limit);
        return filtered;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let response = await this.privateGetOrderInfo (this.extend ({
            'order_id': parseInt (id),
        }, params));
        return this.parseOrder (response);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
            ohlcv[5],
            ohlcv[3],
            ohlcv[4],
            ohlcv[2],
            ohlcv[1],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        let markets = await this.loadMarkets ();
        let market = markets[symbol];
        symbol = market['id'];
        let request = {
            'symbol': symbol,
            'type': 'kline_' + timeframe,
        };
        let response = await this.privateGetKline (this.extend (request, params));
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        params['apiKey'] = this.apiKey;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            params['timestamp'] = parseInt (this.nonce ());
            params['apiSecret'] = this.secret;
            params = this.keysort (params);
            let keys = Object.keys (params);
            let arr = [];
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let s = params[key].toString ();
                arr.push (s);
            }
            this.omit (params, 'apiSecret');
            let s = arr.join ('');
            let sign = this.hash (this.encode (s), 'md5');
            params['sign'] = sign;
        }
        let url = '';
        if (api === 'publicV3')
            url = this.url['apiV3'] + '/' + path;
        else
            url = this.urls['api'] + '/' + path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (method === 'POST') {
            if (Object.keys (params).length) {
                body = this.urlencode (params);
            }
        }
        let result = { 'url': url, 'method': method, 'body': body, 'headers': headers };
        return result;
    }

    dateUTC8 (timestampMS) {
        const timedelta = this.safeValue (this.options, 'timedelta', 8 * 60 * 60 * 1000); // eight hours
        return this.ymd (timestampMS + timedelta);
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response) {
        if (!response) {
            return; // fall back to default error handler
        }
        const code = this.safeString (response, 'code');
        if (code === '0') {
            return; // no error
        }
        const feedback = this.id + ' ' + responseBody;
        if (code === undefined) {
            throw new BadResponse (feedback);
        }
        const unknownError = [ ExchangeError, feedback ];
        const [ ExceptionClass, message ] = this.safeValue (this.exceptions['exact'], code, unknownError);
        throw new ExceptionClass (message);
    }
};
