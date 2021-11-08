'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection, AuthenticationError, InvalidOrder, ArgumentsRequired } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class lbank extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lbank',
            'name': 'LBank',
            'countries': [ 'CN' ],
            'version': 'v1',
            'has': {
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': undefined, // status 0 API doesn't work
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'withdraw': true,
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
                'fees': 'https://lbankinfo.zendesk.com/hc/en-gb/articles/360012072873-Trading-Fees',
                'referral': 'https://www.lbex.io/invite?icode=7QCY',
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
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'commonCurrencies': {
                'VET_ERC20': 'VEN',
                'PNT': 'Penta',
            },
            'options': {
                'cacheSecretAsPem': true,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetAccuracy (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = market['symbol'];
            const parts = id.split ('_');
            let baseId = undefined;
            let quoteId = undefined;
            const numParts = parts.length;
            // lbank will return symbols like "vet_erc20_usdt"
            if (numParts > 2) {
                baseId = parts[0] + '_' + parts[1];
                quoteId = parts[2];
            } else {
                baseId = parts[0];
                quoteId = parts[1];
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
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
                'type': 'spot',
                'spot': true,
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
            const marketId = this.safeString (ticker, 'symbol');
            if (marketId in this.markets_by_id) {
                const market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const parts = marketId.split ('_');
                let baseId = undefined;
                let quoteId = undefined;
                const numParts = parts.length;
                // lbank will return symbols like "vet_erc20_usdt"
                if (numParts > 2) {
                    baseId = parts[0] + '_' + parts[1];
                    quoteId = parts[2];
                } else {
                    baseId = parts[0];
                    quoteId = parts[1];
                }
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const info = ticker;
        ticker = info['ticker'];
        const last = this.safeNumber (ticker, 'latest');
        const percentage = this.safeNumber (ticker, 'change');
        let open = undefined;
        if (percentage !== undefined) {
            const relativeChange = this.sum (1, percentage / 100);
            if (relativeChange > 0) {
                open = last / this.sum (1, relativeChange);
            }
        }
        let change = undefined;
        let average = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
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
            'baseVolume': this.safeNumber (ticker, 'vol'),
            'quoteVolume': this.safeNumber (ticker, 'turnover'),
            'info': info,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': 'all',
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = 60, params = {}) {
        await this.loadMarkets ();
        let size = 60;
        if (limit !== undefined) {
            size = Math.min (limit, size);
        }
        const request = {
            'symbol': this.marketId (symbol),
            'size': size,
        };
        const response = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (response, symbol);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (trade, 'date_ms');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const id = this.safeString (trade, 'tid');
        const type = undefined;
        let side = this.safeString (trade, 'type');
        side = side.replace ('_market', '');
        return {
            'id': id,
            'info': this.safeValue (trade, 'info', trade),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': type,
            'side': side,
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
            'size': 100,
        };
        if (since !== undefined) {
            request['time'] = parseInt (since);
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1590969600,
        //         0.02451657,
        //         0.02452675,
        //         0.02443701,
        //         0.02447814,
        //         238.38210000
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (since === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV() requires a `since` argument');
        }
        if (limit === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV() requires a `limit` argument');
        }
        const request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
            'size': limit,
            'time': parseInt (since / 1000),
        };
        const response = await this.publicGetKline (this.extend (request, params));
        //
        //     [
        //         [1590969600,0.02451657,0.02452675,0.02443701,0.02447814,238.38210000],
        //         [1590969660,0.02447814,0.02449883,0.02443209,0.02445973,212.40270000],
        //         [1590969720,0.02445973,0.02452067,0.02445909,0.02446151,266.16920000],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostUserInfo (params);
        //
        //     {
        //         "result":"true",
        //         "info":{
        //             "freeze":{
        //                 "iog":"0.00000000",
        //                 "ssc":"0.00000000",
        //                 "eon":"0.00000000",
        //             },
        //             "asset":{
        //                 "iog":"0.00000000",
        //                 "ssc":"0.00000000",
        //                 "eon":"0.00000000",
        //             },
        //             "free":{
        //                 "iog":"0.00000000",
        //                 "ssc":"0.00000000",
        //                 "eon":"0.00000000",
        //             },
        //         }
        //     }
        //
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const info = this.safeValue (response, 'info', {});
        const free = this.safeValue (info, 'free', {});
        const freeze = this.safeValue (info, 'freeze', {});
        const asset = this.safeValue (info, 'asset', {});
        const currencyIds = Object.keys (free);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (free, currencyId);
            account['used'] = this.safeString (freeze, currencyId);
            account['total'] = this.safeString (asset, currencyId);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            '-1': 'cancelled', // cancelled
            '0': 'open', // not traded
            '1': 'open', // partial deal
            '2': 'closed', // complete deal
            '4': 'closed', // disposal processing
        };
        return this.safeString (statuses, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "symbol"："eth_btc",
        //         "amount"：10.000000,
        //         "create_time"：1484289832081,
        //         "price"：5000.000000,
        //         "avg_price"：5277.301200,
        //         "type"："sell",
        //         "order_id"："ab704110-af0d-48fd-a083-c218f19a4a55",
        //         "deal_amount"：10.000000,
        //         "status"：2
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const timestamp = this.safeInteger (order, 'create_time');
        // Limit Order Request Returns: Order Price
        // Market Order Returns: cny amount of market order
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'amount');
        const filled = this.safeString (order, 'deal_amount');
        const average = this.safeString (order, 'avg_price');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString (order, 'order_id');
        const type = this.safeString (order, 'order_type');
        const side = this.safeString (order, 'type');
        return this.safeOrder2 ({
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': this.safeValue (order, 'info', order),
            'average': average,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
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
        const response = await this.privatePostCreateOrder (this.extend (order, params));
        order = this.omit (order, 'type');
        order['order_id'] = response['order_id'];
        order['type'] = side;
        order['order_type'] = type;
        order['create_time'] = this.milliseconds ();
        order['info'] = response;
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostCancelOrder (this.extend (request, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        // Id can be a list of ids delimited by a comma
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostOrdersInfo (this.extend (request, params));
        const data = this.safeValue (response, 'orders', []);
        const orders = this.parseOrders (data, market);
        const numOrders = orders.length;
        if (numOrders === 1) {
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
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'current_page': 1,
            'page_length': limit,
        };
        const response = await this.privatePostOrdersInfoHistory (this.extend (request, params));
        const data = this.safeValue (response, 'orders', []);
        return this.parseOrders (data, undefined, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        const closed = this.filterBy (orders, 'status', 'closed');
        const canceled = this.filterBy (orders, 'status', 'cancelled'); // cancelled orders may be partially filled
        const allOrders = this.arrayConcat (closed, canceled);
        return this.filterBySymbolSinceLimit (allOrders, symbol, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        // mark and fee are optional params, mark is a note and must be less than 255 characters
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'assetCode': currency['id'],
            'amount': amount,
            'account': address,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = this.privatePostWithdraw (this.extend (request, params));
        return {
            'id': this.safeString (response, 'id'),
            'info': response,
        };
    }

    convertSecretToPem (secret) {
        const lineLength = 64;
        const secretLength = secret.length - 0;
        let numLines = parseInt (secretLength / lineLength);
        numLines = this.sum (numLines, 1);
        let pem = "-----BEGIN PRIVATE KEY-----\n"; // eslint-disable-line
        for (let i = 0; i < numLines; i++) {
            const start = i * lineLength;
            const end = this.sum (start, lineLength);
            pem += this.secret.slice (start, end) + "\n"; // eslint-disable-line
        }
        return pem + '-----END PRIVATE KEY-----';
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        // Every endpoint ends with ".do"
        url += '.do';
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const query = this.keysort (this.extend ({
                'api_key': this.apiKey,
            }, params));
            const queryString = this.rawencode (query);
            const message = this.hash (this.encode (queryString)).toUpperCase ();
            const cacheSecretAsPem = this.safeValue (this.options, 'cacheSecretAsPem', true);
            let pem = undefined;
            if (cacheSecretAsPem) {
                pem = this.safeValue (this.options, 'pem');
                if (pem === undefined) {
                    pem = this.convertSecretToPem (this.secret);
                    this.options['pem'] = pem;
                }
            } else {
                pem = this.convertSecretToPem (this.secret);
            }
            const sign = this.binaryToBase64 (this.rsa (message, this.encode (pem), 'RS256'));
            query['sign'] = sign;
            body = this.urlencode (query);
            headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const success = this.safeString (response, 'result');
        if (success === 'false') {
            const errorCode = this.safeString (response, 'error_code');
            const message = this.safeString ({
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
            const ErrorClass = this.safeValue ({
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
    }
};
