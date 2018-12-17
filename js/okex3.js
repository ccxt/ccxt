'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, DDoSProtection, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class okex3 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex3',
            'name': 'OKEX',
            'countries': [ 'CN', 'US' ],
            'version': 'v3',
            'rateLimit': 1000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'has': {
                'CORS': false,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': true,
                'futures': false,
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '12h': '12hour',
                '1d': '1day',
                '3d': '3day',
                '1w': '1week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
                'api': 'https://www.okex.com/api',
                'www': 'https://www.okcoin.com',
                'doc': 'https://www.okex.com/docs/en/',
            },
            'api': {
                'general': {
                    'get': [
                        'time',
                    ],
                },
                'account': {
                    'get': [
                        'currencies',
                        'wallet',
                        'wallet/{currency}',
                        'withdrawal/fee',
                        'withdrawal/history',
                        'withdrawal/history/{currency}',
                        'ledger',
                        'deposit/address',
                        'deposit/history',
                        'deposit/history/{currency}',
                    ],
                    'post': [
                        'transfer',
                        'withdrawal',
                    ],
                },
                'spot': {
                    'get': [
                        'accounts',
                        'accounts/{currency}',
                        'accounts/{currency}/ledger',
                        'orders',
                        'orders_pending',
                        'orders/{order_id}',
                        'fills',
                        // public
                        'instruments',
                        'instruments/{instrument_id}/book',
                        'instruments/ticker',
                        'instruments/{instrument_id}/ticker',
                        'instruments/{instrument_id}/trades',
                        'instruments/{instrument_id}/candles',
                    ],
                    'post': [
                        'orders',
                        'batch_orders',
                        'cancel_orders/{order_id}',
                        'cancel_batch_orders',
                    ],
                },
                'margin': {
                    'get': [
                        'accounts',
                        'accounts/{instrument_id}',
                        'accounts/{instrument_id}/ledger',
                        'accounts/availability',
                        'accounts/{instrument_id}/availability',
                        'accounts/borrowed',
                        'accounts/{instrument_id}/borrowed',
                        'orders',
                        'orders/{order_id}',
                        'orders_pending',
                        'fills',
                    ],
                    'post': [
                        'accounts/borrow',
                        'accounts/repayment',
                        'orders',
                        'batch_orders',
                    ],
                    'delete': [
                        'cancel_orders',
                        'cancel_batch_orders',
                    ],
                },
                'futures': {
                    'get': [
                        'position',
                        '{instrument_id}/position',
                        'accounts',
                        'accounts/{currency}',
                        'accounts/{currency}/leverage',
                        'accounts/{currency}/ledger',
                        'orders/{instrument_id}',
                        'orders/{instrument_id}/{order_id}',
                        'fills',
                        // public
                        'instruments',
                        'instruments/{instrument_id}/book',
                        'instruments/ticker',
                        'instruments/{instrument_id}/ticker',
                        'instruments/{instrument_id}/trades',
                        'instruments/{instrument_id}/candles',
                        'accounts/{instrument_id}/holds',
                        'instruments/{instrument_id}/index',
                        'rate',
                        'instruments/{instrument_id}/estimated_price',
                        'instruments/{instrument_id}/open_interest',
                        'instruments/{instrument_id}/price_limit',
                        'instruments/{instrument_id}/liquidation',
                        'instruments/{instrument_id}/mark_price',
                    ],
                    'post': [
                        'accounts/{currency}/leverage',
                        'order',
                        'orders',
                        'cancel_order/{instrument_id}/{order_id}',
                        'cancel_batch_orders/{instrument_id}',
                    ],
                },
                'swap': {
                    'get': [
                        '{instrument_id}/position',
                        'accounts',
                        '{instrument_id}/accounts',
                        'accounts/{instrument_id}/settings',
                        'accounts/{instrument_id}/ledger',
                        'accounts/{instrument_id}/holds',
                        'orders/{instrument_id}',
                        'orders/{instrument_id}/{order_id}',
                        'fills',
                        // public
                        'instruments',
                        'instruments/{instrument_id}/depth?size=50',
                        'instruments/ticker',
                        'instruments/{instrument_id}/ticker',
                        'instruments/{instrument_id}/trades',
                        'instruments/{instrument_id}/candles',
                        'instruments/{instrument_id}/index',
                        'rate',
                        'instruments/{instrument_id}/open_interest',
                        'instruments/{instrument_id}/price_limit',
                        'instruments/{instrument_id}/liquidation',
                        'instruments/{instrument_id}/funding_time',
                        'instruments/{instrument_id}/mark_price',
                        'instruments/{instrument_id}/historical_funding_rate',
                    ],
                    'post': [
                        'accounts/{instrument_id}/leverage',
                        'order',
                        'orders',
                        'cancel_order/{instrument_id}/{order_id}',
                        'cancel_batch_orders/{instrument_id}',
                    ],
                },
                'ett': {
                    'get': [
                        'accounts',
                        'accounts/{currency}',
                        'accounts/{currency}/ledger',
                        'orders', // fetchOrder, fetchOrders
                        'constituents/{ett}',
                        'define-price/{ett}',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders/{order_id}',
                    ]
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.002,
                    'maker': 0.002,
                },
            },
            'exceptions': {
                // Common Error Codes
                // 400 Bad Request — Invalid request format
                // 401 Unauthorized — Invalid API Key
                // 403 Forbidden — You do not have access to the requested resource
                // 404 Not Found
                // 500 Internal Server Error — We had a problem with our server
            },
            'options': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        let response = await this.spotGetInstruments ();
        //
        //     [ {   base_currency: "DASH",
        //          base_increment: "0.000001",
        //           base_min_size: "0.001",
        //           instrument_id: "DASH-BTC",
        //                min_size: "0.001",
        //              product_id: "DASH-BTC",
        //          quote_currency: "BTC",
        //         quote_increment: "0.00000001",
        //          size_increment: "0.000001",
        //               tick_size: "0.00000001"  },
        //       ...,
        //       {   base_currency: "EOS",
        //          base_increment: "0.000001",
        //           base_min_size: "0.01",
        //           instrument_id: "EOS-OKB",
        //                min_size: "0.01",
        //              product_id: "EOS-OKB",
        //          quote_currency: "OKB",
        //         quote_increment: "0.0001",
        //          size_increment: "0.000001",
        //               tick_size: "0.0001"    }      ]
        //
        let result = [];
        for (let i = 0; i < response.length; i++) {
            let market = response[i];
            let baseId = this.safeString (market, 'base_currency');
            let quoteId = this.safeString (market, 'quote_currency');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': markets[i]['maxSizeDigit'],
                'price': markets[i]['maxPriceDigit'],
            };
            let minAmount = markets[i]['minTradeSize'];
            let minPrice = Math.pow (10, -precision['price']);
            let active = (markets[i]['online'] !== 0);
            let baseNumericId = markets[i]['baseCurrency'];
            let quoteNumericId = markets[i]['quoteCurrency'];
            let market = this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'baseNumericId': baseNumericId,
                'quoteNumericId': quoteNumericId,
                'info': markets[i],
                'type': 'spot',
                'spot': true,
                'future': false,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': minPrice,
                        'max': undefined,
                    },
                    'cost': {
                        'min': minAmount * minPrice,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'publicGet';
        let request = {
            'symbol': market['id'],
        };
        if (limit !== undefined)
            request['size'] = limit;
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = this.options['defaultContractType']; // this_week, next_week, quarter
        }
        method += 'Depth';
        let orderbook = await this[method] (this.extend (request, params));
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {              buy:   "48.777300",
        //                 change:   "-1.244500",
        //       changePercentage:   "-2.47%",
        //                  close:   "49.064000",
        //            createdDate:    1531704852254,
        //             currencyId:    527,
        //                dayHigh:   "51.012500",
        //                 dayLow:   "48.124200",
        //                   high:   "51.012500",
        //                inflows:   "0",
        //                   last:   "49.064000",
        //                    low:   "48.124200",
        //             marketFrom:    627,
        //                   name: {  },
        //                   open:   "50.308500",
        //               outflows:   "0",
        //              productId:    527,
        //                   sell:   "49.064000",
        //                 symbol:   "zec_okb",
        //                 volume:   "1049.092535"   }
        //
        let timestamp = this.safeInteger2 (ticker, 'timestamp', 'createdDate');
        let symbol = undefined;
        if (market === undefined) {
            if ('symbol' in ticker) {
                let marketId = ticker['symbol'];
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                } else {
                    let [ baseId, quoteId ] = ticker['symbol'].split ('_');
                    let base = baseId.toUpperCase ();
                    let quote = quoteId.toUpperCase ();
                    base = this.commonCurrencyCode (base);
                    quote = this.commonCurrencyCode (quote);
                    symbol = base + '/' + quote;
                }
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let last = this.safeFloat (ticker, 'last');
        let open = this.safeFloat (ticker, 'open');
        let change = this.safeFloat (ticker, 'change');
        let percentage = this.safeFloat (ticker, 'changePercentage');
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
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat2 (ticker, 'vol', 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'publicGet';
        let request = {
            'symbol': market['id'],
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = this.options['defaultContractType']; // this_week, next_week, quarter
        }
        method += 'Ticker';
        let response = await this[method] (this.extend (request, params));
        let ticker = this.safeValue (response, 'ticker');
        if (ticker === undefined)
            throw new ExchangeError (this.id + ' fetchTicker returned an empty response: ' + this.json (response));
        let timestamp = this.safeInteger (response, 'date');
        if (timestamp !== undefined) {
            timestamp *= 1000;
            ticker = this.extend (ticker, { 'timestamp': timestamp });
        }
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'info': trade,
            'timestamp': trade['date_ms'],
            'datetime': this.iso8601 (trade['date_ms']),
            'symbol': symbol,
            'id': trade['tid'].toString (),
            'order': undefined,
            'type': undefined,
            'side': trade['type'],
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amount'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'publicGet';
        let request = {
            'symbol': market['id'],
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = this.options['defaultContractType']; // this_week, next_week, quarter
        }
        method += 'Trades';
        let response = await this[method] (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        let numElements = ohlcv.length;
        let volumeIndex = (numElements > 6) ? 6 : 5;
        return [
            ohlcv[0], // timestamp
            parseFloat (ohlcv[1]), // Open
            parseFloat (ohlcv[2]), // High
            parseFloat (ohlcv[3]), // Low
            parseFloat (ohlcv[4]), // Close
            // parseFloat (ohlcv[5]), // quote volume
            // parseFloat (ohlcv[6]), // base volume
            parseFloat (ohlcv[volumeIndex]), // okex will return base volume in the 7th element for future markets
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'publicGet';
        let request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = this.options['defaultContractType']; // this_week, next_week, quarter
        }
        method += 'Kline';
        if (limit !== undefined) {
            if (this.options['warnOnFetchOHLCVLimitArgument'])
                throw new ExchangeError (this.id + ' fetchOHLCV counts "limit" candles from current time backwards, therefore the "limit" argument for ' + this.id + ' is disabled. Set ' + this.id + '.options["warnOnFetchOHLCVLimitArgument"] = false to suppress this warning message.');
            request['size'] = parseInt (limit); // max is 1440 candles
        }
        if (since !== undefined)
            request['since'] = since;
        else
            request['since'] = this.milliseconds () - 86400000; // last 24 hours
        let response = await this[method] (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostUserinfo (params);
        let balances = response['info']['funds'];
        let result = { 'info': response };
        let ids = Object.keys (balances['free']);
        let usedField = 'freezed';
        // wtf, okex?
        // https://github.com/okcoin-okex/API-docs-OKEx.com/commit/01cf9dd57b1f984a8737ef76a037d4d3795d2ac7
        if (!(usedField in balances))
            usedField = 'holds';
        let usedKeys = Object.keys (balances[usedField]);
        ids = this.arrayConcat (ids, usedKeys);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let code = id.toUpperCase ();
            if (id in this.currencies_by_id) {
                code = this.currencies_by_id[id]['code'];
            } else {
                code = this.commonCurrencyCode (code);
            }
            let account = this.account ();
            account['free'] = this.safeFloat (balances['free'], id, 0.0);
            account['used'] = this.safeFloat (balances[usedField], id, 0.0);
            account['total'] = this.sum (account['free'], account['used']);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost';
        let order = {
            'symbol': market['id'],
            'type': side,
        };
        if (market['future']) {
            method += 'Future';
            order = this.extend (order, {
                'contract_type': this.options['defaultContractType'], // this_week, next_week, quarter
                'match_price': 0, // match best counter party price? 0 or 1, ignores price if 1
                'lever_rate': 10, // leverage rate value: 10 or 20 (10 by default)
                'price': price,
                'amount': amount,
            });
        } else {
            if (type === 'limit') {
                order['price'] = price;
                order['amount'] = amount;
            } else {
                order['type'] += '_market';
                if (side === 'buy') {
                    if (this.options['marketBuyPrice']) {
                        if (price === undefined) {
                            // eslint-disable-next-line quotes
                            throw new ExchangeError (this.id + " market buy orders require a price argument (the amount you want to spend or the cost of the order) when this.options['marketBuyPrice'] is true.");
                        }
                        order['price'] = price;
                    } else {
                        order['price'] = this.safeFloat (params, 'cost');
                        if (!order['price']) {
                            // eslint-disable-next-line quotes
                            throw new ExchangeError (this.id + " market buy orders require an additional cost parameter, cost = price * amount. If you want to pass the cost of the market order (the amount you want to spend) in the price argument (the default " + this.id + " behaviour), set this.options['marketBuyPrice'] = true. It will effectively suppress this warning exception as well.");
                        }
                    }
                } else {
                    order['amount'] = amount;
                }
            }
        }
        params = this.omit (params, 'cost');
        method += 'Trade';
        let response = await this[method] (this.extend (order, params));
        let timestamp = this.milliseconds ();
        return {
            'info': response,
            'id': response['order_id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'order_id': id,
        };
        let method = 'privatePost';
        if (market['future']) {
            method += 'FutureCancel';
            request['contract_type'] = this.options['defaultContractType']; // this_week, next_week, quarter
        } else {
            method += 'CancelOrder';
        }
        let response = await this[method] (this.extend (request, params));
        return response;
    }

    parseOrderStatus (status) {
        let statuses = {
            '-1': 'canceled',
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'open',
            '4': 'canceled',
        };
        return this.safeValue (statuses, status, status);
    }

    parseOrderSide (side) {
        if (side === 1)
            return 'buy'; // open long position
        if (side === 2)
            return 'sell'; // open short position
        if (side === 3)
            return 'sell'; // liquidate long position
        if (side === 4)
            return 'buy'; // liquidate short position
        return side;
    }

    parseOrder (order, market = undefined) {
        let side = undefined;
        let type = undefined;
        if ('type' in order) {
            if ((order['type'] === 'buy') || (order['type'] === 'sell')) {
                side = order['type'];
                type = 'limit';
            } else if (order['type'] === 'buy_market') {
                side = 'buy';
                type = 'market';
            } else if (order['type'] === 'sell_market') {
                side = 'sell';
                type = 'market';
            } else {
                side = this.parseOrderSide (order['type']);
                if (('contract_name' in order) || ('lever_rate' in order))
                    type = 'margin';
            }
        }
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (order, 'symbol');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (market)
            symbol = market['symbol'];
        let timestamp = undefined;
        let createDateField = this.getCreateDateField ();
        if (createDateField in order)
            timestamp = order[createDateField];
        let amount = this.safeFloat (order, 'amount');
        let filled = this.safeFloat (order, 'deal_amount');
        amount = Math.max (amount, filled);
        let remaining = Math.max (0, amount - filled);
        if (type === 'market') {
            remaining = 0;
        }
        let average = this.safeFloat (order, 'avg_price');
        // https://github.com/ccxt/ccxt/issues/2452
        average = this.safeFloat (order, 'price_avg', average);
        let cost = average * filled;
        let result = {
            'info': order,
            'id': order['order_id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': order['price'],
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    getCreateDateField () {
        // needed for derived exchanges
        // allcoin typo create_data instead of create_date
        return 'create_date';
    }

    getOrdersField () {
        // needed for derived exchanges
        // allcoin typo order instead of orders (expected based on their API docs)
        return 'orders';
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol parameter');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost';
        let request = {
            'order_id': id,
            'symbol': market['id'],
            // 'status': 0, // 0 for unfilled orders, 1 for filled orders
            // 'current_page': 1, // current page number
            // 'page_length': 200, // number of orders returned per page, maximum 200
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = this.options['defaultContractType']; // this_week, next_week, quarter
        }
        method += 'OrderInfo';
        let response = await this[method] (this.extend (request, params));
        let ordersField = this.getOrdersField ();
        let numOrders = response[ordersField].length;
        if (numOrders > 0)
            return this.parseOrder (response[ordersField][0]);
        throw new OrderNotFound (this.id + ' order ' + id + ' not found');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol parameter');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost';
        let request = {
            'symbol': market['id'],
        };
        let order_id_in_params = ('order_id' in params);
        if (market['future']) {
            method += 'FutureOrdersInfo';
            request['contract_type'] = this.options['defaultContractType']; // this_week, next_week, quarter
            if (!order_id_in_params)
                throw new ExchangeError (this.id + ' fetchOrders() requires order_id param for futures market ' + symbol + ' (a string of one or more order ids, comma-separated)');
        } else {
            let status = undefined;
            if ('type' in params) {
                status = params['type'];
            } else if ('status' in params) {
                status = params['status'];
            } else {
                let name = order_id_in_params ? 'type' : 'status';
                throw new ExchangeError (this.id + ' fetchOrders() requires ' + name + ' param for spot market ' + symbol + ' (0 - for unfilled orders, 1 - for filled/canceled orders)');
            }
            if (order_id_in_params) {
                method += 'OrdersInfo';
                request = this.extend (request, {
                    'type': status,
                    'order_id': params['order_id'],
                });
            } else {
                method += 'OrderHistory';
                request = this.extend (request, {
                    'status': status,
                    'current_page': 1, // current page number
                    'page_length': 200, // number of orders returned per page, maximum 200
                });
            }
            params = this.omit (params, [ 'type', 'status' ]);
        }
        let response = await this[method] (this.extend (request, params));
        let ordersField = this.getOrdersField ();
        return this.parseOrders (response[ordersField], market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let open = 0; // 0 for unfilled orders, 1 for filled orders
        return await this.fetchOrders (symbol, since, limit, this.extend ({
            'status': open,
        }, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let closed = 1; // 0 for unfilled orders, 1 for filled orders
        let orders = await this.fetchOrders (symbol, since, limit, this.extend ({
            'status': closed,
        }, params));
        return orders;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        // if (amount < 0.01)
        //     throw new ExchangeError (this.id + ' withdraw() requires amount > 0.01');
        // for some reason they require to supply a pair of currencies for withdrawing one currency
        let currencyId = currency['id'] + '_usd';
        if (tag) {
            address = address + ':' + tag;
        }
        let request = {
            'symbol': currencyId,
            'withdraw_address': address,
            'withdraw_amount': amount,
            'target': 'address', // or 'okcn', 'okcom', 'okex'
        };
        let query = params;
        if ('chargefee' in query) {
            request['chargefee'] = query['chargefee'];
            query = this.omit (query, 'chargefee');
        } else {
            throw new ExchangeError (this.id + ' withdraw() requires a `chargefee` parameter');
        }
        if (this.password) {
            request['trade_pwd'] = this.password;
        } else if ('password' in query) {
            request['trade_pwd'] = query['password'];
            query = this.omit (query, 'password');
        } else if ('trade_pwd' in query) {
            request['trade_pwd'] = query['trade_pwd'];
            query = this.omit (query, 'trade_pwd');
        }
        let passwordInRequest = ('trade_pwd' in request);
        if (!passwordInRequest)
            throw new ExchangeError (this.id + ' withdraw() requires this.password set on the exchange instance or a password / trade_pwd parameter');
        let response = await this.privatePostWithdraw (this.extend (request, query));
        return {
            'info': response,
            'id': this.safeString (response, 'withdraw_id'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // Signing a Message
        // The OK-ACCESS-SIGN header is generated by creating a sha256 HMAC using the base64-decoded secret key on the prehash string timestamp + method + requestPath + body (where + represents string concatenation), secretKey and base64-encode the output. For example: sign=CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp + 'GET' + '/users/self/verify', secretKey))
        // The timestamp value is the same as the OK-ACCESS-TIMESTAMP header and nanometer precision.
        // The method should be UPPER CASE, like GET/POST.
        // requestPath is the path of requesting an endpoint, such as：/orders?before=2&limit=30.
        // The body is the request body string or omitted if there is no request body (typically for GET requests). For example:{"product_id":"BTC-USD-0309","order_id":"377454671037440"}
        // secretKey is generated when a user is subscribing to an Apikey. Prehash string:2018-03-08T10:59:25.789ZPOST/orders?before=2&limit=30{"product_id":"BTC-USD-0309","order_id":"377454671037440"}
        // public enum ContentTypeEnum {
        //     APPLICATION_JSON("application/json"),
        //     APPLICATION_JSON_UTF8("application/json; charset=UTF-8"),
        //     // The server does not support types
        //     APPLICATION_FORM("application/x-www-form-urlencoded; charset=UTF-8"),;
        // }
        // public enum HttpHeadersEnum {
        //     OK_ACCESS_KEY("OK-ACCESS-KEY"),
        //     OK_ACCESS_SIGN("OK-ACCESS-SIGN"),
        //     OK_ACCESS_TIMESTAMP("OK-ACCESS-TIMESTAMP"),
        //     OK_ACCESS_PASSPHRASE("OK-ACCESS-PASSPHRASE"),
        //     OK_FROM("OK-FROM"),
        //     OK_TO("OK-TO"),
        //     OK_LIMIT("OK-LIMIT"),;
        //     private String header;
        //     HttpHeadersEnum(String header) {
        //         this.header = header;
        //     }
        //     public String header() {
        //         return header;
        //     }
        // }
        // import com.okcoin.commons.okex.open.api.config.APIConfiguration;
        // import com.okcoin.commons.okex.open.api.constant.APIConstants;
        // import com.okcoin.commons.okex.open.api.enums.ContentTypeEnum;
        // import com.okcoin.commons.okex.open.api.enums.HttpHeadersEnum;
        // import com.okcoin.commons.okex.open.api.exception.APIException;
        // import com.okcoin.commons.okex.open.api.utils.DateUtils;
        // import com.okcoin.commons.okex.open.api.utils.HmacSHA256Base64Utils;
        // import okhttp3.*;
        // import okio.Buffer;
        // public class APIHttpClient {
        //     private Headers headers(Request request, String timestamp) {
        //         Headers.Builder builder = new Headers.Builder();
        //         builder.add(APIConstants.ACCEPT, ContentTypeEnum.APPLICATION_JSON.contentType());
        //         builder.add(APIConstants.CONTENT_TYPE, ContentTypeEnum.APPLICATION_JSON_UTF8.contentType());
        //         builder.add(APIConstants.COOKIE, getCookie());
        //         if (StringUtils.isNotEmpty(this.credentials.getSecretKey())) {
        //             builder.add(HttpHeadersEnum.OK_ACCESS_KEY.header(), this.credentials.getApiKey());
        //             builder.add(HttpHeadersEnum.OK_ACCESS_SIGN.header(), sign(request, timestamp));
        //             builder.add(HttpHeadersEnum.OK_ACCESS_TIMESTAMP.header(), timestamp);
        //             builder.add(HttpHeadersEnum.OK_ACCESS_PASSPHRASE.header(), this.credentials.getPassphrase());
        //         }
        //         return builder.build();
        //     }
        //     private String sign(Request request, String timestamp) {
        //         String sign;
        //         try {
        //             sign = HmacSHA256Base64Utils.sign(timestamp, method(request), requestPath(request),
        //                     queryString(request), body(request), this.credentials.getSecretKey());
        //         } catch (IOException e) {
        //             throw new APIException("Request get body io exception.", e);
        //         } catch (CloneNotSupportedException e) {
        //             throw new APIException("Hmac SHA256 Base64 Signature clone not supported exception.", e);
        //         } catch (InvalidKeyException e) {
        //             throw new APIException("Hmac SHA256 Base64 Signature invalid key exception.", e);
        //         }
        //         return sign;
        //     }
        //     private String requestPath(Request request) {
        //         String url = url(request);
        //         url = url.replace(this.config.getEndpoint(), APIConstants.EMPTY);
        //         String requestPath = url;
        //         if (requestPath.contains(APIConstants.QUESTION)) {
        //             requestPath = requestPath.substring(0, url.lastIndexOf(APIConstants.QUESTION));
        //         }
        //         if(this.config.getEndpoint().endsWith(APIConstants.SLASH)){
        //             requestPath = APIConstants.SLASH + requestPath;
        //         }
        //         return requestPath;
        //     }
        //     private String queryString(Request request) {
        //         String url = url(request);
        //         String queryString = APIConstants.EMPTY;
        //         if (url.contains(APIConstants.QUESTION)) {
        //             queryString = url.substring(url.lastIndexOf(APIConstants.QUESTION) + 1);
        //         }
        //         return queryString;
        //     }
        //     private String body(Request request) throws IOException {
        //         RequestBody requestBody = request.body();
        //         String body = APIConstants.EMPTY;
        //         if (requestBody != null) {
        //             Buffer buffer = new Buffer();
        //             requestBody.writeTo(buffer);
        //             body = buffer.readString(APIConstants.UTF_8);
        //         }
        //         return body;
        //     }
        // }
        // import retrofit2.Call;
        // import retrofit2.http.GET;
        // import retrofit2.http.Path;
        // import retrofit2.http.Query;
        // import java.util.List;
        // interface FuturesMarketAPI {
        //     @GET("/api/futures/v3/products/{instrument_id}/candles")
        //     Call<JSONArray> getProductCandles(@Path("instrument_id") String productId, @Query("start") String start, @Query("end") String end, @Query("granularity") String granularity);
        // }
        // import com.alibaba.fastjson.JSONArray;
        // import com.okcoin.commons.okex.open.api.bean.futures.result.*;
        // import com.okcoin.commons.okex.open.api.client.APIClient;
        // import com.okcoin.commons.okex.open.api.config.APIConfiguration;
        // import com.okcoin.commons.okex.open.api.service.futures.FuturesMarketAPIService;
        // public class FuturesMarketAPIServiceImpl implements FuturesMarketAPIService {
        //     private APIClient client;
        //     private FuturesMarketAPI api;
        //     public FuturesMarketAPIServiceImpl(APIConfiguration config) {
        //         this.client = new APIClient(config);
        //         this.api = client.createService(FuturesMarketAPI.class);
        //     }
        //     @Override
        //     public JSONArray getProductCandles(String productId, long start, long end, long granularity) {
        //         return this.client.executeSync(this.api.getProductCandles(productId, String.valueOf(start), String.valueOf(end), String.valueOf(granularity)));
        //     }
        // }
        // import okhttp3.Headers;
        // import okhttp3.OkHttpClient;
        // import org.apache.commons.lang3.StringUtils;
        // import org.slf4j.Logger;
        // import org.slf4j.LoggerFactory;
        // import retrofit2.Call;
        // import retrofit2.Response;
        // import retrofit2.Retrofit;
        // import java.io.IOException;
        // import java.util.List;
        // import java.util.Optional;
        // public class APIClient {
        //     /**
        //      * Synchronous send request
        //      */
        //     public <T> T executeSync(Call<T> call) {
        //         try {
        //             Response<T> response = call.execute();
        //             if (this.config.isPrint()) {
        //                 printResponse(response);
        //             }
        //             int status = response.code();
        //             String message = new StringBuilder().append(response.code()).append(" / ").append(response.message()).toString();
        //             if (response.isSuccessful()) {
        //                 return response.body();
        //             } else if (APIConstants.resultStatusArray.contains(status)) {
        //                 HttpResult result = JSON.parseObject(new String(response.errorBody().bytes()), HttpResult.class);
        //                 result.setStatusCode(status);
        //                 throw new APIException(result.message());
        //             } else {
        //                 throw new APIException(message);
        //             }
        //         } catch (IOException e) {
        //             throw new APIException("APIClient executeSync exception.", e);
        //         }
        //     }
        // }
        // public class FuturesAPIBaseTests extends BaseTests {
        //     public APIConfiguration config() {
        //         APIConfiguration config = new APIConfiguration();
        //         config.setEndpoint("https://www.okex.com/");
        //         config.setApiKey("");
        //         config.setSecretKey("");
        //         config.setPassphrase("");
        //         config.setPrint(true);
        //         config.setI18n(I18nEnum.ENGLISH);
        //         return config;
        //     }
        //     String productId = "BTC-USD-180928";
        // }
        // import com.alibaba.fastjson.JSON;
        // import com.alibaba.fastjson.JSONArray;
        // import com.okcoin.commons.okex.open.api.bean.futures.result.*;
        // import com.okcoin.commons.okex.open.api.service.futures.FuturesMarketAPIService;
        // import com.okcoin.commons.okex.open.api.service.futures.impl.FuturesMarketAPIServiceImpl;
        // import org.junit.Before;
        // import org.junit.Test;
        // import org.slf4j.Logger;
        // import org.slf4j.LoggerFactory;
        // import java.util.List;
        // public class FuturesMarketAPITests extends FuturesAPIBaseTests {
        //     private FuturesMarketAPIService marketAPIService;
        //     @Before
        //     public void before() {
        //         config = config();
        //         marketAPIService = new FuturesMarketAPIServiceImpl(config);
        //     }
        //     @Test
        //     public void testGetProductCandles() {
        //         long start = System.currentTimeMillis();
        //         long end = System.currentTimeMillis() + 2000L;
        //         JSONArray array = marketAPIService.getProductCandles(productId, 1530323640000L, 0, 180L);
        //         toResultString(LOG, "Product-Candles", array);
        //     }
        // }
        // Timestamp
        // The OK-ACCESS-TIMESTAMP request header must be in the UTC time zone Unix timestamp decimal seconds format or the ISO8601 standard time format. It needs to be accurate to milliseconds.
        // Your timestamp must be within 30 seconds of the api service time or your request will be considered expired and rejected. We recommend using the time endpoint to query for the API server time if you believe there many be time skew between your server and the API servers.
        let url = this.urls['api'] + '/' + api + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (Object.keys (params).length)
            url += '?' + this.urlencode (params);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response = undefined) {
        if (body.length < 2)
            return; // fallback to default error handler
        if (body[0] === '{') {
            response = JSON.parse (body);
            if ('error_code' in response) {
                let error = this.safeString (response, 'error_code');
                let message = this.id + ' ' + this.json (response);
                if (error in this.exceptions) {
                    let ExceptionClass = this.exceptions[error];
                    throw new ExceptionClass (message);
                } else {
                    throw new ExchangeError (message);
                }
            }
            if ('result' in response)
                if (!response['result'])
                    throw new ExchangeError (this.id + ' ' + this.json (response));
        }
    }
};
