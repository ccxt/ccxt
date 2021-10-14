
'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class mxc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mxc',
            'name': 'MXC',
            'countries': [ 'CN' ],
            'version': 'v2',
            'rateLimit': 1000,
            'has': {
                'fetchCurrencies': false,
                'CORS': false,
                'createMarketOrder': false,
                'fetchTickers': true,
                'withdraw': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'fetchTransactions': false,
                'createDepositAddress': false,
                'fetchDepositAddress': false,
                'fetchClosedOrders': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrderTrades': false,
                'fetchOrders': true,
                'fetchOrder': true,
                'fetchMyTrades': false,
                'fetchBalance': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'createOrder': true,
                'cancelOrder': true,
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://www.mxc.ceo/open/api/v2/',
                    'private': 'https://www.mxc.ceo/open/api/v2/',
                },
                'www': 'https://mxc.ceo/',
                'doc': 'https://mxcdevelop.github.io/APIDoc/open.api.v2.en.html',
                'fees': [
                    'https://www.mxc.ceo/info/fee',
                ],
                'referral': '',
            },
            'api': {
                'public': {
                    'get': [
                        'market/ticker',
                        'market/symbols',
                        'market/depth',
                        'market/kline',
                        'market/deals',
                    ],
                },
                'private': {
                    'get': [
                        'account/info',
                        'current/orders',
                        'order/deals',
                        'order/open_orders',
                        'order/list',
                        'order/query',
                        'order/deal_detail',
                    ],
                    'post': [
                        'order/place',
                        'order/place_batch',
                    ],
                    'delete': [
                        'order/cancel',
                        'order/cancel_by_symbol',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.002,
                    'taker': 0.002,
                },
            },
            'exceptions': {
            },
            'options': {
                'limits': {
                    'cost': {
                        'min': {
                            'BTC': 0.0001,
                            'ETH': 0.001,
                            'USDT': 1,
                        },
                    },
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarketSymbols (this.extend ({
            'api_key': this.apiKey,
        }, params));
        const markets = this.safeValue (response, 'data');
        if (!markets) {
            throw new ExchangeError (this.id + ' fetchMarkets got an unrecognized response');
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const parts = market.symbol.split ('_');
            const numParts = parts.length;
            let baseId = parts[0];
            let quoteId = parts[1];
            if (numParts > 2) {
                baseId = parts[0] + '_' + parts[1];
                quoteId = parts[2];
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const precision = {
                'amount': 8,
                'price': market.price_scale,
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'min_amount'),
                    'max': this.safeFloat (market, 'max_amount'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result.push ({
                'id': i,
                'symbol': base + '_' + quote,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': true,
                'maker': market['maker_fee_rate'],
                'taker': market['taker_fee_rate'],
                'precision': precision,
                'limits': limits,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'api_key': this.apiKey,
            'req_time': this.seconds (),
        };
        const response = await this.privateGetAccountInfo (this.extend (request, params));
        const result = { 'info': response };
        const currencyIds = Object.keys (response.data);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (response[currencyId], 'available');
            account['used'] = this.safeFloat (response[currencyId], 'frozen');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'depth': 5,
            'symbol': symbol,
            'api_key': this.apiKey,
        };
        const response = await this.publicGetMarketDepth (this.extend (request, params));
        const orderbook = this.safeValue (response, 'data');
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'quantity');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        // they return [ Timestamp, Volume, Close, High, Low, Open ]
        return [
            parseInt (ohlcv[0]),   // t
            parseFloat (ohlcv[1]), // o
            parseFloat (ohlcv[2]), // c
            parseFloat (ohlcv[3]), // h
            parseFloat (ohlcv[4]), // l
            parseFloat (ohlcv[5]), // v
            parseFloat (ohlcv[6]), // a
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1, params = {}) {
        this.fetchMarkets ();
        const periodDurationInSeconds = this.parseTimeframe (timeframe);
        const request = {
            'symbol': symbol,
            'interval': timeframe,
            'api_key': this.apiKey,
            'limit': limit,
        };
        // max limit = 1001
        if (limit !== undefined) {
            const hours = parseInt ((periodDurationInSeconds * limit) / 3600);
            request['range_hour'] = Math.max (0, hours - 1);
        }
        if (since !== undefined) {
            request['startTime'] = parseInt (since / 1000);
        }
        const response = await this.publicGetMarketKline (this.extend (request, params));
        // "data": [
        //     [
        //         1557728040,    //timestamp in seconds
        //         "7054.7",      //open
        //         "7056.26",     //close
        //         "7056.29",     //high
        //         "7054.16",     //low
        //         "9.817734",    //vol
        //         "6926.521"     //amount
        //     ],
        //     [
        //         1557728100,
        //         "7056.26",
        //         "7042.17",
        //         "7056.98",
        //         "7042.16",
        //         "23.69423",
        //         "1677.931"
        //     ]
        // ]
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, undefined, timeframe, since, limit);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker[0], 'last');
        const percentage = undefined;
        const open = this.safeFloat (ticker[0], 'open');
        let change = this.safeFloat (ticker[0], 'change_rate');
        let average = undefined;
        if ((last !== undefined) && (percentage !== undefined)) {
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker[0], 'high'),
            'low': this.safeFloat (ticker[0], 'low'),
            'bid': this.safeFloat (ticker[0], 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker[0], 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeFloat (ticker[0], 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbol = undefined, params = {}) {
        const request = this.extend ({
            'symbol': symbol,
            'api_key': this.apiKey,
        }, params);
        const response = await this.publicGetMarketTicker (request);
        const result = {};
        const data = this.safeValue (response, 'data', []);
        const ids = Object.keys (data);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const [ baseId, quoteId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const symbol = base + '/' + quote;
            result[symbol] = this.parseTicker (data[id], undefined);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        const response = await this.publicGetMarketTicker (this.extend ({
            'api_key': this.apiKey,
            'symbol': symbol,
        }, params));
        const ticker = this.safeValue (response, 'data');
        return this.parseTicker (ticker, undefined);
    }

    parseTrade (trade, market = undefined) {
        const dateStr = this.safeValue (trade, 'tradeTime');
        let timestamp = undefined;
        if (dateStr !== undefined) {
            timestamp = this.parseDate (dateStr + '  GMT+8');
        }
        // take either of orderid or orderId
        const price = this.safeFloat (trade, 'tradePrice');
        const amount = this.safeFloat (trade, 'tradeQuantity');
        const type = this.safeString (trade, 'tradeType');
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
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': type === '1' ? 'buy' : 'sell',
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
            'symbol': symbol,
            'api_key': this.apiKey,
        };
        const response = await this.publicGetMarketDeals (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        const defaultType = 'BID';
        const type = this.safeString (params, 'type', defaultType);
        const request = {
            'symbol': symbol,
            'trade_type': (type === 'buy') ? 'BID' : 'ASK',
            'limit': limit,
            'api_key': this.apiKey,
            'req_time': this.seconds (),
        };
        const response = await this.privateGetOrderList (this.extend (request, params));
        return this.parseOrders (response['data'], undefined, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_ids': id,
            'api_key': this.apiKey,
            'req_time': this.seconds (),
        };
        const response = await this.privateGetOrderQuery (this.extend (request, params));
        return this.parseOrder (response['data']);
    }

    parseOrderSide (side) {
        const sides = {
            '1': 'BID',
            '2': 'ASK',
        };
        return this.safeString (sides, side, side);
    }

    parseOrderStatus (status) {
        const statuses = {
            '1': 'open',
            '2': 'closed',
            '3': 'open', // partial closed
            '4': 'canceled', // partial closed
            '5': 'canceled', // partial canceled
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // Different API endpoints returns order info in different format...
        // with different fields filled.
        let id = this.safeString (order, 'id');
        if (id === undefined) {
            id = this.safeString (order, 'data');
        }
        let symbol = undefined;
        const marketId = this.safeString (order, 'market');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const dateStr = this.safeString (order, 'createTime');
        // XXX: MXC returns order creation times in GMT+8 timezone with out specifying it
        //  hence appending ' GMT+8' to it so we can get the correct value
        // XXX: Also MXC api does not return actual matched prices and costs/fees
        let timestamp = undefined;
        if (dateStr !== undefined) {
            timestamp = this.parseDate (dateStr + '  GMT+8');
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.parseOrderSide (this.safeString (order, 'type'));
        const price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'totalQuantity');
        if (amount === undefined) {
            amount = this.safeFloat (order, 'initialAmount');
        }
        const filled = this.safeFloat (order, 'tradedQuantity');
        const average = undefined;
        let remaining = undefined;
        if ((filled !== undefined) && (amount !== undefined)) {
            remaining = amount - filled;
        }
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': average,
            'trades': undefined,
            'fee': {
                'cost': undefined,
                'currency': undefined,
                'rate': undefined,
            },
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'api_key': this.apiKey,
            'req_time': this.seconds (),
            'symbol': this.marketId (symbol),
            'price': price,
            'quantity': amount,
            'order_type': type.toUpperCase (),
            'trade_type': (side === 'buy') ? 'BID' : 'ASK',
        };
        const response = await this.privatePostOrderPlace (this.extend (request, params));
        return this.parseOrder (this.extend ({
            'status': 'open',
            'type': side,
            'initialAmount': amount,
        }, response), market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': symbol,
            'api_key': this.apiKey,
            'req_time': this.seconds (),
        };
        const response = await this.privateGetOrderOpenOrders (this.extend (request, params));
        return this.parseOrders (response['data'], market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            'api_key': this.apiKey,
            'req_time': this.seconds (),
            'order_ids': id,
        };
        return await this.privateDeleteOrderCancel (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + this.implodeParams (path, params);
        const url2 = '/open/api/' + this.version + '/' + this.implodeParams (path, params);
        const query = params;
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const auth2 = method + '\n' + url2 + '\n' + this.rawencode (this.keysort (query));
            const auth = this.rawencode (this.keysort (query));
            const signature = this.hmac (this.encode (auth2), this.encode (this.secret), 'sha256');
            const suffix = 'sign=' + signature;
            url += '?' + auth + '&' + suffix;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const resultString = this.safeString (response, 'result', '');
        if (resultString !== 'false') {
            return;
        }
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'message', body);
        if (errorCode !== undefined) {
            const feedback = this.safeString (this.errorCodeNames, errorCode, message);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
    }
};
