'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class okcoinusd extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okcoinusd',
            'name': 'OKCoin USD',
            'countries': [ 'CN', 'US' ],
            'version': 'v1',
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
            'extension': '.do', // appended to endpoint URL
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
            'api': {
                'web': {
                    'get': [
                        'spot/markets/currencies',
                        'spot/markets/products',
                        'spot/markets/tickers',
                    ],
                },
                'public': {
                    'get': [
                        'depth',
                        'exchange_rate',
                        'future_depth',
                        'future_estimated_price',
                        'future_hold_amount',
                        'future_index',
                        'future_kline',
                        'future_price_limit',
                        'future_ticker',
                        'future_trades',
                        'kline',
                        'otcs',
                        'ticker',
                        'tickers',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'account_records',
                        'batch_trade',
                        'borrow_money',
                        'borrow_order_info',
                        'borrows_info',
                        'cancel_borrow',
                        'cancel_order',
                        'cancel_otc_order',
                        'cancel_withdraw',
                        'funds_transfer',
                        'future_batch_trade',
                        'future_cancel',
                        'future_devolve',
                        'future_explosive',
                        'future_order_info',
                        'future_orders_info',
                        'future_position',
                        'future_position_4fix',
                        'future_trade',
                        'future_trades_history',
                        'future_userinfo',
                        'future_userinfo_4fix',
                        'lend_depth',
                        'order_fee',
                        'order_history',
                        'order_info',
                        'orders_info',
                        'otc_order_history',
                        'otc_order_info',
                        'repayment',
                        'submit_otc_order',
                        'trade',
                        'trade_history',
                        'trade_otc_order',
                        'wallet_info',
                        'withdraw',
                        'withdraw_info',
                        'unrepayments_info',
                        'userinfo',
                    ],
                },
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
                'api': {
                    'web': 'https://www.okcoin.com/v2',
                    'public': 'https://www.okcoin.com/api',
                    'private': 'https://www.okcoin.com/api',
                },
                'www': 'https://www.okcoin.com',
                'doc': [
                    'https://www.okcoin.com/rest_getStarted.html',
                    'https://www.npmjs.com/package/okcoin.com',
                ],
            },
            'fees': {
                'trading': {
                    'taker': 0.002,
                    'maker': 0.002,
                },
            },
            'exceptions': {
                // see https://github.com/okcoin-okex/API-docs-OKEx.com/blob/master/API-For-Spot-EN/Error%20Code%20For%20Spot.md
                '10000': ExchangeError, // "Required field, can not be null"
                '10001': DDoSProtection, // "Request frequency too high to exceed the limit allowed"
                '10005': AuthenticationError, // "'SecretKey' does not exist"
                '10006': AuthenticationError, // "'Api_key' does not exist"
                '10007': AuthenticationError, // "Signature does not match"
                '1002': InsufficientFunds, // "The transaction amount exceed the balance"
                '1003': InvalidOrder, // "The transaction amount is less than the minimum requirement"
                '1004': InvalidOrder, // "The transaction amount is less than 0"
                '1013': InvalidOrder, // no contract type (PR-1101)
                '1027': InvalidOrder, // createLimitBuyOrder(symbol, 0, 0): Incorrect parameter may exceeded limits
                '1050': InvalidOrder, // returned when trying to cancel an order that was filled or canceled previously
                '1217': InvalidOrder, // "Order was sent at ±5% of the current market price. Please resend"
                '10014': InvalidOrder, // "Order price must be between 0 and 1,000,000"
                '1009': OrderNotFound, // for spot markets, cancelling closed order
                '1019': OrderNotFound, // order closed? ("Undo order failed")
                '1051': OrderNotFound, // for spot markets, cancelling "just closed" order
                '10009': OrderNotFound, // for spot markets, "Order does not exist"
                '20015': OrderNotFound, // for future markets
                '10008': ExchangeError, // Illegal URL parameter
            },
            'options': {
                'marketBuyPrice': false,
                'defaultContractType': 'this_week', // next_week, quarter
                'warnOnFetchOHLCVLimitArgument': true,
                'fiats': [ 'USD', 'CNY' ],
                'futures': {
                    'BCH': true,
                    'BTC': true,
                    'BTG': true,
                    'EOS': true,
                    'ETC': true,
                    'ETH': true,
                    'LTC': true,
                    'NEO': true,
                    'QTUM': true,
                    'USDT': true,
                    'XUC': true,
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.webGetSpotMarketsProducts ();
        let markets = response['data'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let id = markets[i]['symbol'];
            let [ baseId, quoteId ] = id.split ('_');
            let baseIdUppercase = baseId.toUpperCase ();
            let quoteIdUppercase = quoteId.toUpperCase ();
            let base = this.commonCurrencyCode (baseIdUppercase);
            let quote = this.commonCurrencyCode (quoteIdUppercase);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': markets[i]['maxSizeDigit'],
                'price': markets[i]['maxPriceDigit'],
            };
            let lot = Math.pow (10, -precision['amount']);
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
                'lot': lot,
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
            result.push (market);
            if ((this.has['futures']) && (market['base'] in this.options['futures'])) {
                let fiats = this.options['fiats'];
                for (let j = 0; j < fiats.length; j++) {
                    const fiat = fiats[j];
                    const lowercaseFiat = fiat.toLowerCase ();
                    result.push (this.extend (market, {
                        'quote': fiat,
                        'symbol': market['base'] + '/' + fiat,
                        'id': market['base'].toLowerCase () + '_' + lowercaseFiat,
                        'quoteId': lowercaseFiat,
                        'type': 'future',
                        'spot': false,
                        'future': true,
                    }));
                }
            }
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
        if (typeof limit !== 'undefined')
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
        if (typeof market === 'undefined') {
            if ('symbol' in ticker) {
                let marketId = ticker['symbol'];
                if (marketId in this.markets_by_id)
                    market = this.markets_by_id[marketId];
            }
        }
        if (typeof market !== 'undefined') {
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
        if (typeof ticker === 'undefined')
            throw new ExchangeError (this.id + ' fetchTicker returned an empty response: ' + this.json (response));
        let timestamp = this.safeInteger (response, 'date');
        if (typeof timestamp !== 'undefined') {
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
            ohlcv[1], // Open
            ohlcv[2], // High
            ohlcv[3], // Low
            ohlcv[4], // Close
            // ohlcv[5], // quote volume
            // ohlcv[6], // base volume
            ohlcv[volumeIndex], // okex will return base volume in the 7th element for future markets
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
        if (typeof limit !== 'undefined') {
            if (this.options['warnOnFetchOHLCVLimitArgument'])
                throw new ExchangeError (this.id + ' fetchOHLCV counts "limit" candles from current time backwards, therefore the "limit" argument for ' + this.id + ' is disabled. Set ' + this.id + '.options["warnOnFetchOHLCVLimitArgument"] = false to suppress this warning message.');
            request['size'] = parseInt (limit); // max is 1440 candles
        }
        if (typeof since !== 'undefined')
            request['since'] = since;
        else
            request['since'] = this.milliseconds () - 86400000; // last 24 hours
        let response = await this[method] (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostUserinfo ();
        let balances = response['info']['funds'];
        let result = { 'info': response };
        let ids = Object.keys (this.currencies_by_id);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let code = this.currencies_by_id[id]['code'];
            let account = this.account ();
            account['free'] = this.safeFloat (balances['free'], id, 0.0);
            account['used'] = this.safeFloat (balances['freezed'], id, 0.0);
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
                        if (typeof price === 'undefined') {
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
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' cancelOrder() requires a symbol argument');
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
        if (status === -1)
            return 'canceled';
        if (status === 0)
            return 'open';
        if (status === 1)
            return 'open';
        if (status === 2)
            return 'closed';
        if (status === 3)
            return 'open';
        if (status === 4)
            return 'canceled';
        return status;
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
        let status = this.parseOrderStatus (order['status']);
        let symbol = undefined;
        if (typeof market === 'undefined') {
            if ('symbol' in order)
                if (order['symbol'] in this.markets_by_id)
                    market = this.markets_by_id[order['symbol']];
        }
        if (market)
            symbol = market['symbol'];
        let timestamp = undefined;
        let createDateField = this.getCreateDateField ();
        if (createDateField in order)
            timestamp = order[createDateField];
        let amount = this.safeFloat (order, 'amount');
        let filled = this.safeFloat (order, 'deal_amount');
        let remaining = amount - filled;
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
        if (typeof symbol === 'undefined')
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
        if (typeof symbol === 'undefined')
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
        let url = '/';
        if (api !== 'web')
            url += this.version + '/';
        url += path;
        if (api !== 'web')
            url += this.extension;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let query = this.keysort (this.extend ({
                'api_key': this.apiKey,
            }, params));
            // secret key must be at the end of query
            let queryString = this.rawencode (query) + '&secret_key=' + this.secret;
            query['sign'] = this.hash (this.encode (queryString)).toUpperCase ();
            body = this.urlencode (query);
            headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        } else {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (body.length < 2)
            return; // fallback to default error handler
        if (body[0] === '{') {
            let response = JSON.parse (body);
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
