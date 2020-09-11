'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError, ExchangeError, ArgumentsRequired, PermissionDenied, InvalidOrder, OrderNotFound, InsufficientFunds, BadRequest, RateLimitExceeded, InvalidNonce, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class duedex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'duedex',
            'name': 'DueDEX',
            'countries': [ 'BZ' ], // Belize
            'version': 'v1',
            'userAgent': undefined,
            'rateLimit': 200,
            'has': {
                'cancelOrder': true,
                'CORS': true,
                'cancelAllOrders': true,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': 'emulated',
                'fetchDeposits': false,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
            },
            'timeframes': {
                '1m': '1',
                '30m': '30',
                '1h': '60',
                '1d': 'D',
            },
            'urls': {
                'test': {
                    'public': 'https://api.testnet.duedex.com',
                    'private': 'https://api.testnet.duedex.com',
                    'bars': 'https://testnet.duedex.com/bars',
                },
                'logo': 'https://avatars3.githubusercontent.com/u/51757131?s=200&v=4',
                'api': {
                    'public': 'https://api.duedex.com',
                    'private': 'https://api.duedex.com',
                    'bars': 'https://www.duedex.com/bars',
                },
                'www': 'https://www.duedex.com',
                'doc': [
                    'https://github.com/DueDEX/API-Documentation',
                ],
                'fees': 'https://duedex.zendesk.com/hc/en-us/articles/360022357973-Perpetual-Swaps-Trading-Fees',
                'referral': 'https://www.duedex.com/register?code=BEFTWN',
            },
            'api': {
                'public': {
                    'get': [
                        'instrument',
                        'ticker',
                        'ticker/{instrument}',
                    ],
                },
                'private': {
                    'get': [
                        'order/active',
                        'order',
                        'order/all',
                        'position',
                        'margin',
                    ],
                    'post': [
                        'order',
                        'position/leverage',
                        'position/riskLimit',
                        'position/margin/transfer',
                    ],
                    'delete': [
                        'order',
                    ],
                    'patch': [
                        'order',
                    ],
                },
                'bars': {
                    'get': [
                        'tradingView/history',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    '-1': ExchangeError, // internal server error
                    '100': ExchangeError, // service unavailable
                    '1000': BadRequest, // invalid argument
                    '5000': BadRequest, // endpoint not found
                    '5001': BadRequest, // header missing
                    '5002': AuthenticationError, // api key not found
                    '5003': InvalidNonce, // invalid timestamp
                    '5004': BadRequest, // invalid expiration
                    '5005': AuthenticationError, // invalid signature
                    '5006': BadRequest, // duplicate parameter
                    '5007': BadRequest, // unsupported charset
                    '5008': BadRequest, // request too large
                    '5009': BadRequest, // unsupported mime type
                    '5010': RateLimitExceeded, // rate limit exceeded
                    '5011': PermissionDenied, // insufficient permission
                    '5012': PermissionDenied, // not in ip whitelist
                    '10035': BadRequest, // invalid leverage
                    '10036': BadRequest, // invalid instrument status
                    '10037': InvalidOrder, // invalid order status
                    '10038': BadRequest, // invalid price step
                    '10039': BadRequest, // invalid risk limit
                    '10040': BadRequest, // invalid size step
                    '10050': BadRequest, // instrument not found
                    '10052': BadRequest, // max leverage exceeded
                    '10056': OrderNotFound, // order not found
                    '10061': BadRequest, // price over liquidation
                    '10065': BadRequest, // risk limit exceeded
                    '10066': BadRequest, // risk limit not changed
                    '10070': BadRequest, // token not found
                    '10075': AuthenticationError, // unauthorised
                    '10082': AuthenticationError, // api key not found
                    '10090': AuthenticationError, // empty api key permission
                    '10091': BadRequest, // immediate cancellation without fills
                    '10092': BadRequest, // price under liquidation
                    '10093': BadRequest, // client order id already exists
                    '10094': BadRequest, // no position to close
                    '10095': BadRequest, // amount must not be zero
                    '10098': BadRequest, // position not found
                    '10099': BadRequest, // max order count exceeded
                    '10100': InvalidOrder, // fok order not filled
                    '10101': BadRequest, // user order margin mode not changed
                    '10102': BadRequest, // user risk value mode not changed
                    '10103': InvalidOrder, // order price too high
                    '10104': InvalidOrder, // order price too low
                    '10106': InvalidOrder, // close order already exists
                    '10107': InvalidOrder, // invalid time in force
                    '10117': InvalidOrder, // post only order rejected
                    '10118': InvalidOrder, // no orders to cancel
                    '10119': InvalidOrder, // target order rejected
                    '10120': InvalidOrder, // invalid order price
                    '10121': InvalidOrder, // invalid order size
                    '10028': InsufficientFunds, // insufficient balance
                    '10148': InvalidOrder, // invalid order type
                    '10187': PermissionDenied, // cross mode not allowed for leverage lock
                    '10188': PermissionDenied, // min leverage exceeded for leverage lock
                    '10189': PermissionDenied, // max leverage exceeded for leverageLock
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'Ddx-Expiration': 5 * 1000, // 5 sec, default
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.00075,
                    'maker': -0.00025,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetInstrument (params);
        const markets = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'instrumentId');
            const baseId = this.safeString (market, 'baseCurrencySymbol');
            const quoteId = this.safeString (market, 'quoteCurrencySymbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': undefined,
                'price': undefined,
            };
            const lotSize = this.safeFloat (market, 'lotSize');
            const tickSize = this.safeFloat (market, 'tickSize');
            if (lotSize !== undefined) {
                precision['amount'] = lotSize;
            }
            if (tickSize !== undefined) {
                precision['price'] = tickSize;
            }
            const status = this.safeString (market, 'status');
            const active = (status === 'open');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'taker': this.safeFloat (market, 'takerFee'),
                'maker': this.safeFloat (market, 'makerFee'),
                'type': 'future',
                'spot': false,
                'future': true,
                'option': false,
                'inverse': this.safeValue (market, 'isInverse'),
                'limits': {
                    'amount': {
                        'min': lotSize,
                        'max': this.safeFloat (market, 'maxSize'),
                    },
                    'price': {
                        'min': undefined,
                        'max': this.safeFloat (market, 'maxPrice'),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetMargin (params);
        //
        //     {
        //         code: 0,
        //         data: [{
        //                 currency: "BTC",
        //                 available: "0.09865794",
        //                 orderMargin: "0.00046317",
        //                 positionMargin: "0.00088501",
        //                 realisedPnl: "0.00000612",
        //                 unrealisedPnl: "0.00001010",
        //                 bonusLeft: "0.00000000"
        //             },
        //             {
        //                 currency: "USDT",
        //                 available: "1000.0000",
        //                 orderMargin: "0.0000",
        //                 positionMargin: "0.0000",
        //                 realisedPnl: "0.0000",
        //                 unrealisedPnl: "0.0000",
        //                 bonusLeft: "0.0000"
        //             }
        //         ]
        //     }
        //
        const result = {
            'info': response,
        };
        const balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const free = this.safeFloat (balance, 'available');
            const used = this.safeFloat (balance, 'orderMargin') + this.safeFloat (balance, 'positionMargin');
            account['free'] = free;
            account['used'] = used;
            account['total'] = free + used;
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "instrument": "BTCUSD",
        //         "bestBid": "10037.00",
        //         "bestAsk": "10039.00",
        //         "lastPrice": "10037.50",
        //         "indexPrice": "10036.01",
        //         "markPrice": "10036.21",
        //         "fundingRate": "0.000100",
        //         "nextFundingTime": "2020-09-09T04:00:00.000Z",
        //         "open": "10337.00",
        //         "high": "10356.50",
        //         "low": "9850.00",
        //         "close": "10040.00",
        //         "volume": 7509236,
        //         "openInterest": 717585
        //     }
        //
        const timestamp = undefined;
        const marketId = this.safeString (ticker, 'instrument');
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'lastPrice');
        const open = this.safeFloat (ticker, 'open');
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            if (open > 0) {
                percentage = change / open * 100;
            }
            average = this.sum (open, last) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'bestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        const response = await this.publicGetTickerInstrument (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "instrument": "BTCUSD",
        //             "bestBid": "10037.00",
        //             "bestAsk": "10039.00",
        //             "lastPrice": "10037.50",
        //             "indexPrice": "10036.01",
        //             "markPrice": "10036.21",
        //             "fundingRate": "0.000100",
        //             "nextFundingTime": "2020-09-09T04:00:00.000Z",
        //             "open": "10337.00",
        //             "high": "10356.50",
        //             "low": "9850.00",
        //             "close": "10040.00",
        //             "volume": 7509236,
        //             "openInterest": 717585
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTicker (data);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        const data = this.safeValue (response, 'data', []);
        const tickers = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseTicker (data[i]);
            const symbol = ticker['symbol'];
            tickers[symbol] = ticker;
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        if (limit === undefined) {
            limit = 100;
        }
        const duration = this.parseTimeframe (timeframe);
        const now = this.seconds ();
        if (since === undefined) {
            request['from'] = now - limit * duration;
        } else {
            request['from'] = parseInt (since / 1000);
        }
        request['to'] = request['from'] + limit * duration;
        const response = await this.barsGetTradingViewHistory (this.extend (request, params));
        return this.parseTradingViewOHLCV (response, market, timeframe, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'new': 'open',
            'partiallyFilled': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'untriggered': 'open', // Stop order not yet triggered
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderSide (side) {
        const sides = {
            'long': 'buy',
            'short': 'sell',
        };
        return this.safeString (sides, side, side);
    }

    convertOrderSide (side) {
        const sides = {
            'buy': 'long',
            'sell': 'short',
        };
        return this.safeString (sides, side, side);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         instrument: "BTCUSD",
        //         orderId: 69839181,
        //         clientOrderId: "",
        //         type: "limit",
        //         isCloseOrder: false,
        //         side: "long",
        //         price: "8600.00",
        //         size: 1,
        //         timeInForce: "gtc",
        //         notionalValue: "0.00011627",
        //         status: "new",
        //         fillPrice: "0.00",
        //         filledSize: 0,
        //         accumulatedFees: "0.00000000",
        //         createTime: "2020-09-10T10:02:52.165Z",
        //         updateTime: "2020-09-10T10:02:52.165Z"
        //     }
        //
        const marketId = this.safeString (order, 'instrument');
        let symbol = undefined;
        let settlementCurrency = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        const timestamp = this.parse8601 (this.safeString (order, 'createTime'));
        const id = this.safeValue (order, 'orderId');
        const price = this.safeFloat (order, 'price');
        const average = this.safeFloat (order, 'fillPrice');
        const amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat (order, 'filledSize');
        if (market !== undefined) {
            symbol = market['symbol'];
            if (market['inverse']) {
                settlementCurrency = market['base'];
            } else {
                settlementCurrency = market['quote'];
            }
        }
        let remaining = undefined;
        if ((amount !== undefined) && (filled !== undefined)) {
            remaining = amount - filled;
        }
        let cost = undefined;
        if ((filled !== undefined) && (average !== undefined)) {
            cost = average * filled;
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.safeStringLower (order, 'side');
        const feeCost = this.safeFloat (order, 'accumulatedFees');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': Math.abs (feeCost),
                'currency': settlementCurrency,
            };
        }
        const type = this.safeString (order, 'type');
        let clientOrderId = this.safeString (order, 'clientOrderId');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined;
        }
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': this.parseOrderSide (side),
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId === undefined) {
            request['orderId'] = id;
        }
        const response = await this.privateGetOrder (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires an symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
            'type': type, // 'limit', 'market', 'stopMarket', 'stopLimit', 'takeProfitMarket', 'takeProfitLimit'
            'side': this.convertOrderSide (side), // 'long', 'short'
            // 'price': parseFloat (this.priceToPrecision (symbol, price)), // required for limit orders
            'size': parseInt (this.amountToPrecision (symbol, amount)), // order quantity in paper, integer only
        };
        let priceIsRequired = false;
        if (type === 'limit') {
            priceIsRequired = true;
        }
        if (priceIsRequired) {
            if (price !== undefined) {
                request['price'] = parseFloat (this.priceToPrecision (symbol, price));
            } else {
                throw new ArgumentsRequired (this.id + ' createOrder requires a price argument for a ' + type + ' order');
            }
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder requires an symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        if (price !== undefined) {
            request['price'] = parseFloat (this.priceToPrecision (symbol, price));
        }
        // This endpoint has no response data.
        await this.privatePatchOrder (this.extend (request, params));
        return await this.fetchOrder (id, symbol, params);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        // This endpoint has no response data.
        await this.privateDeleteOrder (this.extend (request, params));
        return await this.fetchOrder (id, symbol, params);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        // This endpoint has no response data.
        // { code: 0 }
        return await this.privateDeleteOrder (this.extend (request, params));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        if (since !== undefined) {
            request['fromTime'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrderAll (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        if (symbol !== undefined) {
            await this.loadMarkets ();
            market = this.market (symbol);
        }
        const response = await this.privateGetOrderActive ();
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!(api in this.urls['api'])) {
            throw new NotSupported (this.id + ' does not have a testnet/sandbox URL for ' + api + ' endpoints');
        }
        let url = this.urls['api'][api];
        let queryString = '';
        let bodyString = '';
        const query = this.omit (params, this.extractParams (path));
        path = this.implodeParams (path, params);
        path = '/' + this.version + '/' + path;
        url += path;
        if ((method === 'GET') && (Object.keys (query).length)) {
            queryString = this.urlencode (query);
            url += '?' + queryString;
        }
        if ((method !== 'GET') && (Object.keys (query).length)) {
            bodyString = this.json (query);
            body = bodyString;
            headers = {
                'Content-Type': 'application/json',
            };
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let timestamp = this.milliseconds ();
            let expiration = this.safeInteger (this.options, 'Ddx-Expiration', 5000);
            expiration = this.sum (timestamp, expiration);
            timestamp = timestamp.toString ();
            expiration = expiration.toString ();
            const message = method + '|' + path + '|' + timestamp + '|' + expiration + '|' + queryString + '|' + bodyString;
            const secret = this.base64ToBinary (this.secret);
            const signature = this.hmac (this.encode (message), secret, 'sha256', 'hex');
            if (headers === undefined) {
                headers = {};
            }
            headers = this.extend ({
                'Ddx-Timestamp': timestamp,
                'Ddx-Expiration': expiration,
                'Ddx-Key': this.apiKey,
                'Ddx-Signature': signature,
            }, headers);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
        }
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             ...
        //         },
        //         "message": "A short message ONLY WHEN the request is not successful"
        //     }
        //
        const errorCode = this.safeValue (response, 'code');
        if (errorCode !== undefined) {
            if (errorCode !== 0) {
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                throw new ExchangeError (feedback); // unknown message
            }
        } else {
            const status = this.safeValue (response, 'status');
            if (status === 400) {
                const feedback = this.id + ' ' + body;
                throw new BadRequest (feedback);
            }
        }
    }
};
