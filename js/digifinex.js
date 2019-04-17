'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AccountSuspended, BadRequest, BadResponse, NetworkError, DDoSProtection, AuthenticationError, PermissionDenied, ArgumentsRequired, ExchangeError, InsufficientFunds, InvalidOrder, InvalidNonce } = require ('./base/errors');
const { DECIMAL_PLACES } = require ('./base/functions/number');
// const log = require ('ololog');

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
            'commonCurrencies': {
                'BTC': 'BTC',
                'ETH': 'ETH',
                'USDT': 'USDT',
                'DFT': 'DigiFinexToken',
                'TUSD': 'TUSD',
                'USDC': 'USDC',
            },
            'exceptions': {
                'exact': {
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
        // if (response.code != 0)
        //     log.info ('[fetchMarkets] error: ' + response.code);
        this.checkResponse (response, 'fetchMarkets');
        // console.log (response);
        let result = [];
        let keys = Object.keys (response['data']);
        for (let i = 0; i < keys.length; i++) {
            let symbol = keys[i];
            let id = symbol.toUpperCase ();
            let pair = id.split ('_');
            let base = pair[0];
            let quote = pair[1];
            let baseId = base;
            let quoteId = quote;
            let market = response['data'][symbol];
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
        this.checkResponse (response, 'fetchBalance');
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
            account['total'] = account['free'] + account['used'];
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let request = {
            'symbol': symbol,
        };
        let response = await this.privateGetDepth (this.extend (request, params));
        this.checkResponse (response, 'fetchOrderBook');
        return this.parseOrderBook (response, parseInt (response['date']) * 1000);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        let response = await this.publicGetTicker ();
        // log.bright.yellow.error (response);
        this.checkResponse (response, 'fetchTicker');
        let result = {};
        let keys = Object.keys (response['ticker']);
        for (let i = 0; i < keys.length; i++) {
            let symbol = keys[i];
            let r = this.parseTicker (response['date'], response['ticker'], symbol);
            result[symbol] = r;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetTicker (this.extend ({
            'symbol': symbol,
        }, params));
        // console.log (response);
        this.checkResponse (response, 'fetchTicker');
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
        let request = {
            'symbol': symbol,
        };
        let response = await this.privateGetTradeDetail (this.extend (request, params));
        this.checkResponse (response, 'fetchTrades');
        return this.parseTrades (response['data'], request, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // exchange-specific parameters: post_only
        // post-only: 1: yes, 0: no. A post_only order will only be created as a maker order. If it cannot be placed into order book immediately, it will be cancelled automatically.
        await this.loadMarkets ();
        const order = {
            'symbol': symbol,
            'price': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
            'type': side,
        };
        if (type === 'market') {
            throw new InvalidOrder ('market order not supported');
        }
        let response = await this.privatePostTrade (this.extend (order, params));
        this.checkResponse (response, 'createOrder');
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
        this.checkResponse (response, 'cancelOrder');
        return response;
    }

    async CancelOrders (ids, symbol = undefined, params = {}) {
        // maximum 20 IDs supported
        let response = await this.privatePostCancelOrder ({ 'order_id': ids.join (',') });
        this.checkResponse (response, 'CancelOrders');
        return response;
    }

    parseOrder (order, market = undefined) {
        let side = order['type'];
        let status = undefined;
        if (order.status === 0 || order.status === 1) {
            status = 'open';
        } else if (order.status === 2) {
            status = 'closed';
        } else if (order.status === 3 || order.status === 4) {
            status = 'canceled';
        }
        let symbol = undefined;
        if (market === undefined) {
            let exchange = order['symbol'].toUpperCase ();
            if (exchange in this.markets_by_id) {
                market = this.markets_by_id[exchange];
            }
        }
        if (market !== undefined)
            symbol = market['symbol'];
        let timestamp = parseInt (order['created_date']) * 1000;
        let result = {
            'info': order,
            'id': order['order_id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': parseInt (order['finished_date']) * 1000,
            'symbol': symbol,
            'type': undefined,
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
        let request = {
            'symbol': symbol,
        };
        let response = await this.privateGetOpenOrders (this.extend (request, params));
        this.checkResponse (response, 'fetchOpenOrders');
        let orders = this.parseOrders (response['orders'], undefined, since, limit);
        return orders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // Only supports historical orders of last 3 days
        // `since` has only date precision in digifinex
        // exchange-specific non-unified parameters: page, type
        // page: Page Num, page=1 for 1st page. None for 1st page by default.
        // type：buy/sell/buy_market/sell_market，none for all types
        let request = {
            'symbol': symbol,
        };
        if (since) {
            request['date'] = this.dateUTC8 (since);
        }
        let response = await this.privateGetOrderHistory (params);
        this.checkResponse (response, 'fetchClosedOrders');
        let filtered = this.parseOrders (response['orders'], undefined, since, limit);
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
        let request = {
            'symbol': symbol,
            'type': 'kline_' + timeframe,
        };
        let response = await this.privateGetKline (this.extend (request, params));
        this.checkResponse (response, 'fetchOHLCV');
        return this.parseOHLCVs (response['data'], undefined, timeframe, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        params['apiKey'] = this.apiKey;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            params['timestamp'] = parseInt (this.seconds ());
            params['apiSecret'] = this.secret;
            params = this.keysort (params);
            let keys = Object.keys (params);
            let arr = [];
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let s = params[key].toString ();
                arr.push (s);
            }
            let s = arr.join ('');
            let sign = this.hash (this.encode (s), 'md5');
            params['sign'] = sign;
        }
        let url = this.urls['api'] + '/' + path;
        // log.info (url, params);
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
        // log.info (url);
        // log.info (result);
        return result;
    }

    dateUTC8 (timestampMS) {
        const timedelta = this.safeValue (this.options, 'timedelta', 8 * 60 * 60 * 1000); // eight hours
        return this.ymd (timestampMS + timedelta);
    }

    checkResponse (response, caller) {
        let code = response['code'];
        if (code === 0)
            return;
        caller = '[' + caller + '] ';
        if (code === undefined)
            throw new BadResponse (caller + 'bad response: ' + response);
        this.checkCode (code, caller);
    }

    checkCode (code, caller) {
        if (code === 10001) {
            throw new BadRequest (caller + "Wrong request method, please check it's a GET ot POST request");
        }
        if (code === 10002) {
            throw new AuthenticationError (caller + 'Invalid ApiKey');
        }
        if (code === 10003) {
            throw new AuthenticationError (caller + "Sign doesn't match");
        }
        if (code === 10004) {
            throw new ArgumentsRequired (caller + 'Illegal request parameters');
        }
        if (code === 10005) {
            throw new DDoSProtection (caller + 'Request frequency exceeds the limit');
        }
        if (code === 10006) {
            throw new PermissionDenied (caller + 'Unauthorized to execute this request');
        }
        if (code === 10007) {
            throw new PermissionDenied (caller + 'IP address Unauthorized');
        }
        if (code === 10008) {
            throw new InvalidNonce (caller + 'Timestamp for this request is invalid, timestamp must within 1 minute');
        }
        if (code === 10009) {
            throw new NetworkError (caller + 'Unexist endpoint, please check endpoint URL');
        }
        if (code === 10011) {
            throw new AccountSuspended (caller + 'ApiKey expired. Please go to client side to re-create an ApiKey');
        }
        if (code === 20001) {
            throw new PermissionDenied (caller + 'Trade is not open for this trading pair');
        }
        if (code === 20002) {
            throw new PermissionDenied (caller + 'Trade of this trading pair is suspended');
        }
        if (code === 20003) {
            throw new InvalidOrder (caller + 'Invalid price or amount');
        }
        if (code === 20007) {
            throw new InvalidOrder (caller + 'Price precision error');
        }
        if (code === 20008) {
            throw new InvalidOrder (caller + 'Amount precision error');
        }
        if (code === 20009) {
            throw new InvalidOrder (caller + 'Amount is less than the minimum requirement');
        }
        if (code === 20010) {
            throw new InvalidOrder (caller + 'Cash Amount is less than the minimum requirement');
        }
        if (code === 20011) {
            throw new InsufficientFunds (caller + 'Insufficient balance');
        }
        if (code === 20012) {
            throw new BadRequest (caller + 'Invalid trade type (valid value: buy/sell)');
        }
        if (code === 20013) {
            throw new InvalidOrder (caller + 'No order info found');
        }
        if (code === 20014) {
            throw new BadRequest (caller + 'Invalid date (Valid format: 2018-07-25)');
        }
        if (code === 20015) {
            throw new BadRequest (caller + 'Date exceeds the limit');
        }
        if (code === 20018) {
            throw new PermissionDenied (caller + 'Your trading rights have been banned by the system');
        }
        if (code === 20019) {
            throw new BadRequest (caller + 'Wrong trading pair symbol. Correct format:"usdt_btc". Quote asset is in the front');
        }
        throw new ExchangeError (caller + 'Unknown error code: ' + code);
    }
};
