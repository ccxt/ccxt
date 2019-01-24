'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection, AuthenticationError, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class lbank extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lbank',
            'name': 'LBank',
            'countries': [ 'CN' ],
            'version': 'v1',
            'has': {
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': false, // status 0 API doesn't work
                'fetchClosedOrders': true,
            },
            'timeframes': {
                '1m': 'minute1',
                '5m': 'minute5',
                '15m': 'minute15',
                '30m': 'minute30',
                '1h': 'hour1',
                '2h': 'hour2',
                '4h': 'hour4',
                '6h': 'hour6',
                '8h': 'hour8',
                '12h': 'hour12',
                '1d': 'day1',
                '1w': 'week1',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg',
                'api': 'https://api.lbank.info',
                'www': 'https://www.lbank.info',
                'doc': 'https://github.com/LBank-exchange/lbank-official-api-docs',
                'fees': 'https://lbankinfo.zendesk.com/hc/zh-cn/articles/115002295114--%E8%B4%B9%E7%8E%87%E8%AF%B4%E6%98%8E',
            },
            'api': {
                'public': {
                    'get': [
                        'currencyPairs',
                        'ticker',
                        'depth',
                        'trades',
                        'kline',
                        'accuracy',
                    ],
                },
                'private': {
                    'post': [
                        'user_info',
                        'create_order',
                        'cancel_order',
                        'orders_info',
                        'orders_info_history',
                        'withdraw',
                        'withdrawCancel',
                        'withdraws',
                        'withdrawConfigs',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': undefined,
                        'ZEC': 0.01,
                        'ETH': 0.01,
                        'ETC': 0.01,
                        // 'QTUM': amount => Math.max (0.01, amount * (0.1 / 100)),
                        'VEN': 10.0,
                        'BCH': 0.0002,
                        'SC': 50.0,
                        'BTM': 20.0,
                        'NAS': 1.0,
                        'EOS': 1.0,
                        'XWC': 5.0,
                        'BTS': 1.0,
                        'INK': 10.0,
                        'BOT': 3.0,
                        'YOYOW': 15.0,
                        'TGC': 10.0,
                        'NEO': 0.0,
                        'CMT': 20.0,
                        'SEER': 2000.0,
                        'FIL': undefined,
                        'BTG': undefined,
                    },
                },
            },
            'commonCurrencies': {
                'VET_ERC20': 'VEN',
            },
        });
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetAccuracy ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['symbol'];
            let parts = id.split ('_');
            let baseId = undefined;
            let quoteId = undefined;
            let numParts = parts.length;
            // lbank will return symbols like "vet_erc20_usdt"
            if (numParts > 2) {
                baseId = parts[0] + '_' + parts[1];
                quoteId = parts[2];
            } else {
                baseId = parts[0];
                quoteId = parts[1];
            }
            let base = this.commonCurrencyCode (baseId.toUpperCase ());
            let quote = this.commonCurrencyCode (quoteId.toUpperCase ());
            let symbol = base + '/' + quote;
            let precision = {
                'amount': this.safeInteger (market, 'quantityAccuracy'),
                'price': this.safeInteger (market, 'priceAccuracy'),
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
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': Math.pow (10, precision['price']),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': id,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (ticker, 'symbol');
            if (marketId in this.markets_by_id) {
                let market = this.marketsById[marketId];
                symbol = market['symbol'];
            } else {
                let parts = marketId.split ('_');
                let baseId = undefined;
                let quoteId = undefined;
                let numParts = parts.length;
                // lbank will return symbols like "vet_erc20_usdt"
                if (numParts > 2) {
                    baseId = parts[0] + '_' + parts[1];
                    quoteId = parts[2];
                } else {
                    baseId = parts[0];
                    quoteId = parts[1];
                }
                let base = this.commonCurrencyCode (baseId.toUpperCase ());
                let quote = this.commonCurrencyCode (quoteId.toUpperCase ());
                symbol = base + '/' + quote;
            }
        }
        let timestamp = this.safeInteger (ticker, 'timestamp');
        let info = ticker;
        ticker = info['ticker'];
        let last = this.safeFloat (ticker, 'latest');
        let percentage = this.safeFloat (ticker, 'change');
        let relativeChange = percentage / 100;
        let open = last / this.sum (1, relativeChange);
        let change = last - open;
        let average = this.sum (last, open) / 2;
        if (market !== undefined)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'turnover'),
            'info': info,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTicker (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (this.extend ({
            'symbol': 'all',
        }, params));
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = this.parseTicker (tickers[i]);
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = 60, params = {}) {
        await this.loadMarkets ();
        let size = 60;
        if (limit !== undefined)
            size = Math.min (limit, size);
        let response = await this.publicGetDepth (this.extend ({
            'symbol': this.marketId (symbol),
            'size': size,
        }, params));
        return this.parseOrderBook (response);
    }

    parseTrade (trade, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = parseInt (trade['date_ms']);
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let cost = this.costToPrecision (symbol, price * amount);
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'tid'),
            'order': undefined,
            'type': undefined,
            'side': trade['type'],
            'price': price,
            'amount': amount,
            'cost': parseFloat (cost),
            'fee': undefined,
            'info': this.safeValue (trade, 'info', trade),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'size': 100,
        };
        if (since !== undefined)
            request['time'] = parseInt (since);
        if (limit !== undefined)
            request['size'] = limit;
        let response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            ohlcv[1],
            ohlcv[2],
            ohlcv[3],
            ohlcv[4],
            ohlcv[5],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (since === undefined)
            throw new ExchangeError (this.id + ' fetchOHLCV requires a since argument');
        if (limit === undefined)
            throw new ExchangeError (this.id + ' fetchOHLCV requires a limit argument');
        let request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
            'size': limit,
            'time': parseInt (since / 1000),
        };
        let response = await this.publicGetKline (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostUserInfo (params);
        let result = { 'info': response };
        let ids = Object.keys (this.extend (response['info']['free'], response['info']['freeze']));
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let code = id;
            if (id in this.currencies_by_id)
                code = this.currencies_by_id[id]['code'];
            let free = this.safeFloat (response['info']['free'], id, 0.0);
            let used = this.safeFloat (response['info']['freeze'], id, 0.0);
            let account = {
                'free': free,
                'used': used,
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        let statuses = {
            '-1': 'cancelled', // cancelled
            '0': 'open', // not traded
            '1': 'open', // partial deal
            '2': 'closed', // complete deal
            '4': 'closed', // disposal processing
        };
        return this.safeString (statuses, status);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        let responseMarket = this.safeValue (this.marketsById, order['symbol']);
        if (responseMarket !== undefined) {
            symbol = responseMarket['symbol'];
        } else if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = this.safeInteger (order, 'create_time');
        // Limit Order Request Returns: Order Price
        // Market Order Returns: cny amount of market order
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'amount', 0.0);
        let filled = this.safeFloat (order, 'deal_amount', 0.0);
        let av_price = this.safeFloat (order, 'avg_price');
        let cost = undefined;
        if (av_price !== undefined) {
            cost = filled * av_price;
        }
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        return {
            'id': this.safeString (order, 'order_id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': this.safeString (order, 'order_type'),
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': amount - filled,
            'trades': undefined,
            'fee': undefined,
            'info': this.safeValue (order, 'info', order),
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'symbol': market['id'],
            'type': side,
            'amount': amount,
        };
        if (type === 'market') {
            order['type'] += '_market';
        } else {
            order['price'] = price;
        }
        let response = await this.privatePostCreateOrder (this.extend (order, params));
        order = this.omit (order, 'type');
        order['order_id'] = response['order_id'];
        order['type'] = side;
        order['order_type'] = type;
        order['create_time'] = this.milliseconds ();
        order['info'] = response;
        order = this.parseOrder (order, market);
        let id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostCancelOrder (this.extend ({
            'symbol': market['id'],
            'order_id': id,
        }, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        // Id can be a list of ids delimited by a comma
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostOrdersInfo (this.extend ({
            'symbol': market['id'],
            'order_id': id,
        }, params));
        let orders = this.parseOrders (response['orders'], market);
        if (orders.length === 1) {
            return orders[0];
        } else {
            return orders;
        }
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 100;
        }
        let market = this.market (symbol);
        let response = await this.privatePostOrdersInfoHistory (this.extend ({
            'symbol': market['id'],
            'current_page': 1,
            'page_length': limit,
        }, params));
        return this.parseOrders (response['orders'], undefined, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        let closed = this.filterBy (orders, 'status', 'closed');
        let cancelled = this.filterBy (orders, 'status', 'cancelled'); // cancelled orders may be partially filled
        return closed + cancelled;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        // mark and fee are optional params, mark is a note and must be less than 255 characters
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'assetCode': currency['id'],
            'amount': amount,
            'account': address,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        let response = this.privatePostWithdraw (this.extend (request, params));
        return {
            'id': response['id'],
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        // Every endpoint ends with ".do"
        url += '.do';
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let query = this.keysort (this.extend ({
                'api_key': this.apiKey,
            }, params));
            let queryString = this.rawencode (query) + '&secret_key=' + this.secret;
            query['sign'] = this.hash (this.encode (queryString)).toUpperCase ();
            body = this.urlencode (query);
            headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        let success = this.safeString (response, 'result');
        if (success === 'false') {
            let errorCode = this.safeString (response, 'error_code');
            let message = this.safeString ({
                '10000': 'Internal error',
                '10001': 'The required parameters can not be empty',
                '10002': 'verification failed',
                '10003': 'Illegal parameters',
                '10004': 'User requests are too frequent',
                '10005': 'Key does not exist',
                '10006': 'user does not exist',
                '10007': 'Invalid signature',
                '10008': 'This currency pair is not supported',
                '10009': 'Limit orders can not be missing orders and the number of orders',
                '10010': 'Order price or order quantity must be greater than 0',
                '10011': 'Market orders can not be missing the amount of the order',
                '10012': 'market sell orders can not be missing orders',
                '10013': 'is less than the minimum trading position 0.001',
                '10014': 'Account number is not enough',
                '10015': 'The order type is wrong',
                '10016': 'Account balance is not enough',
                '10017': 'Abnormal server',
                '10018': 'order inquiry can not be more than 50 less than one',
                '10019': 'withdrawal orders can not be more than 3 less than one',
                '10020': 'less than the minimum amount of the transaction limit of 0.001',
                '10022': 'Insufficient key authority',
            }, errorCode, this.json (response));
            let ErrorClass = this.safeValue ({
                '10002': AuthenticationError,
                '10004': DDoSProtection,
                '10005': AuthenticationError,
                '10006': AuthenticationError,
                '10007': AuthenticationError,
                '10009': InvalidOrder,
                '10010': InvalidOrder,
                '10011': InvalidOrder,
                '10012': InvalidOrder,
                '10013': InvalidOrder,
                '10014': InvalidOrder,
                '10015': InvalidOrder,
                '10016': InvalidOrder,
                '10022': AuthenticationError,
            }, errorCode, ExchangeError);
            throw new ErrorClass (message);
        }
        return response;
    }
};
