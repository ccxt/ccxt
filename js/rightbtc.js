'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, InsufficientFunds, InvalidOrder, OrderNotFound } = require ('./base/errors');

module.exports = class rightbtc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'rightbtc',
            'name': 'RightBTC',
            'countries': [ 'AE' ],
            'has': {
                'privateAPI': false,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': false,
                'fetchOrder': 'emulated',
                'fetchMyTrades': true,
            },
            'timeframes': {
                '1m': 'min1',
                '5m': 'min5',
                '15m': 'min15',
                '30m': 'min30',
                '1h': 'hr1',
                '1d': 'day1',
                '1w': 'week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/42633917-7d20757e-85ea-11e8-9f53-fffe9fbb7695.jpg',
                'api': 'https://www.rightbtc.com/api',
                'www': 'https://www.rightbtc.com',
                'doc': [
                    'https://www.rightbtc.com/api/trader',
                    'https://www.rightbtc.com/api/public',
                ],
                // eslint-disable-next-line no-useless-escape
                // 'fees': 'https://www.rightbtc.com/\#\!/support/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'getAssetsTradingPairs/zh',
                        'trading_pairs',
                        'ticker/{trading_pair}',
                        'tickers',
                        'depth/{trading_pair}',
                        'depth/{trading_pair}/{count}',
                        'trades/{trading_pair}',
                        'trades/{trading_pair}/{count}',
                        'candlestick/latest/{trading_pair}',
                        'candlestick/{timeSymbol}/{trading_pair}',
                        'candlestick/{timeSymbol}/{trading_pair}/{count}',
                    ],
                },
                'trader': {
                    'get': [
                        'balance/{symbol}',
                        'balances',
                        'deposits/{asset}/{page}',
                        'withdrawals/{asset}/{page}',
                        'orderpage/{trading_pair}/{cursor}',
                        'orders/{trading_pair}/{ids}', // ids are a slash-separated list of {id}/{id}/{id}/...
                        'history/{trading_pair}/{ids}',
                        'historys/{trading_pair}/{page}',
                        'trading_pairs',
                    ],
                    'post': [
                        'order',
                    ],
                    'delete': [
                        'order/{trading_pair}/{ids}',
                    ],
                },
            },
            // HARDCODING IS DEPRECATED, THE FEES BELOW SHOULD BE REWRITTEN
            'fees': {
                'trading': {
                    // min trading fees
                    // 0.0001 BTC
                    // 0.01 ETP
                    // 0.001 ETH
                    // 0.1 BITCNY
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'withdraw': {
                        // 'BTM': n => 3 + n * (1 / 100),
                        // 'ZDC': n => 1 + n * (0.5 / 100),
                        // 'ZGC': n => 0.5 + n * (0.5 / 100),
                        // 'BTS': n => 1 + n * (1 / 100),
                        // 'DLT': n => 3 + n * (1 / 100),
                        // 'SNT': n => 10 + n * (1 / 100),
                        // 'XNC': n => 1 + n * (1 / 100),
                        // 'ICO': n => 3 + n * (1 / 100),
                        // 'CMC': n => 1 + n * (0.5 / 100),
                        // 'GXS': n => 0.2 + n * (1 / 100),
                        // 'OBITS': n => 0.3 + n * (1 / 100),
                        // 'ICS': n => 2 + n * (1 / 100),
                        // 'TIC': n => 2 + n * (1 / 100),
                        // 'IND': n => 20 + n * (1 / 100),
                        // 'MVC': n => 20 + n * (1 / 100),
                        // 'BitCNY': n => 0.1 + n * (1 / 100),
                        // 'MTX': n => 1 + n * (1 / 100),
                        'ETP': 0.01,
                        'BTC': 0.001,
                        'ETH': 0.01,
                        'ETC': 0.01,
                        'STORJ': 3,
                        'LTC': 0.001,
                        'ZEC': 0.001,
                        'BCC': 0.001,
                        'XRB': 0,
                        'NXS': 0.1,
                    },
                },
            },
            'commonCurrencies': {
                'XRB': 'NANO',
            },
            'exceptions': {
                'ERR_USERTOKEN_NOT_FOUND': AuthenticationError,
                'ERR_ASSET_NOT_EXISTS': ExchangeError,
                'ERR_ASSET_NOT_AVAILABLE': ExchangeError,
                'ERR_BALANCE_NOT_ENOUGH': InsufficientFunds,
                'ERR_CREATE_ORDER': InvalidOrder,
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetTradingPairs ();
        let zh = await this.publicGetGetAssetsTradingPairsZh ();
        let markets = this.extend (zh['result'], response['status']['message']);
        let marketIds = Object.keys (markets);
        let result = [];
        for (let i = 0; i < marketIds.length; i++) {
            let id = marketIds[i];
            let market = markets[id];
            let baseId = market['bid_asset_symbol'];
            let quoteId = market['ask_asset_symbol'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': parseInt (market['bid_asset_decimals']),
                'price': parseInt (market['ask_asset_decimals']),
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
                        'max': Math.pow (10, precision['price']),
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
                'info': market,
            });
        }
        return result;
    }

    divideSafeFloat (x, key, divisor) {
        let value = this.safeFloat (x, key);
        if (typeof value !== 'undefined')
            return value / divisor;
        return value;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = ticker['date'];
        let last = this.divideSafeFloat (ticker, 'last', 1e8);
        let high = this.divideSafeFloat (ticker, 'high', 1e8);
        let low = this.divideSafeFloat (ticker, 'low', 1e8);
        let bid = this.divideSafeFloat (ticker, 'buy', 1e8);
        let ask = this.divideSafeFloat (ticker, 'sell', 1e8);
        let baseVolume = this.divideSafeFloat (ticker, 'vol24h', 1e8);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTickerTradingPair (this.extend ({
            'trading_pair': market['id'],
        }, params));
        return this.parseTicker (response['result'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTickers (params);
        let tickers = response['result'];
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let id = ticker['market'];
            if (!(id in this.marketsById)) {
                continue;
            }
            let market = this.marketsById[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetDepthTradingPair (this.extend ({
            'trading_pair': this.marketId (symbol),
        }, params));
        let bidsasks = {};
        let types = ['bid', 'ask'];
        for (let ti = 0; ti < types.length; ti++) {
            let type = types[ti];
            bidsasks[type] = [];
            for (let i = 0; i < response['result'][type].length; i++) {
                let [ price, amount, total ] = response['result'][type][i];
                bidsasks[type].push ([
                    price / 1e8,
                    amount / 1e8,
                    total / 1e8,
                ]);
            }
        }
        return this.parseOrderBook (bidsasks, undefined, 'bid', 'ask');
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //         "order_id": 118735,
        //         "trade_id": 7,
        //         "trading_pair": "BTCCNY",
        //         "side": "B",
        //         "quantity": 1000000000,
        //         "price": 900000000,
        //         "created_at": "2017-06-06T20:45:27.000Z"
        //     }
        //
        let timestamp = this.safeInteger (trade, 'date');
        if (typeof timestamp === 'undefined') {
            if ('created_at' in trade) {
                timestamp = this.parse8601 (trade['created_at']);
            }
        }
        let id = this.safeString (trade, 'tid');
        id = this.safeString (trade, 'trade_id', id);
        let orderId = this.safeString (trade, 'order_id');
        let price = this.divideSafeFloat (trade, 'price', 1e8);
        let amount = this.safeFloat (trade, 'amount');
        amount = this.safeFloat (trade, 'quantity', amount);
        if (typeof amount !== 'undefined')
            amount = amount / 1e8;
        let symbol = undefined;
        if (typeof market === 'undefined') {
            let marketId = this.safeString (trade, 'trading_pair');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        }
        let cost = this.costToPrecision (symbol, price * amount);
        cost = parseFloat (cost);
        let side = this.safeString (trade, 'side');
        side = side.toLowerCase ();
        if (side === 'b') {
            side = 'buy';
        } else if (side === 's') {
            side = 'sell';
        }
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesTradingPair (this.extend ({
            'trading_pair': market['id'],
        }, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
            ohlcv[2] / 1e8,
            ohlcv[3] / 1e8,
            ohlcv[4] / 1e8,
            ohlcv[5] / 1e8,
            ohlcv[1] / 1e8,
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetCandlestickTimeSymbolTradingPair (this.extend ({
            'trading_pair': market['id'],
            'timeSymbol': this.timeframes[timeframe],
        }, params));
        return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.traderGetBalances (params);
        //
        //     {
        //         "status": {
        //             "success": 1,
        //             "message": "GET_BALANCES"
        //         },
        //         "result": [
        //             {
        //                 "asset": "ETP",
        //                 "balance": "5000000000000",
        //                 "frozen": "0",
        //                 "state": "1"
        //             },
        //             {
        //                 "asset": "CNY",
        //                 "balance": "10000000000000",
        //                 "frozen": "240790000",
        //                 "state": "1"
        //             }
        //         ]
        //     }
        //
        let result = { 'info': response };
        let balances = response['result'];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currencyId = balance['asset'];
            let code = this.commonCurrencyCode (currencyId);
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            }
            let total = this.divideSafeFloat (balance, 'balance', 1e8);
            let used = this.divideSafeFloat (balance, 'frozen', 1e8);
            let free = undefined;
            if (typeof total !== 'undefined') {
                if (typeof used !== 'undefined') {
                    free = total - used;
                }
            }
            let account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'trading_pair': market['id'],
            'quantity': parseInt (amount * 1e8),
            'limit': parseInt (price * 1e8),
            'type': type.toUpperCase (),
            'side': side.toUpperCase (),
        };
        let response = await this.traderPostOrder (this.extend (order, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (typeof symbol === 'undefined') {
            throw new ExchangeError (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.traderDeleteOrderTradingPairIds (this.extend ({
            'trading_pair': market['id'],
            'ids': id,
        }, params));
        return response;
    }

    parseOrderStatus (status) {
        let statuses = {
            'NEW': 'open',
            'TRADE': 'closed', // TRADE means filled or partially filled orders
            'CANCEL': 'canceled',
        };
        if (status in statuses)
            return statuses[status];
        return status;
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrder / fetchOpenOrders
        //
        //     {
        //         "id": 4180528,
        //         "quantity": 20000000,
        //         "rest": 20000000,
        //         "limit": 1000000,
        //         "price": null,
        //         "side": "BUY",
        //         "created": 1496005693738
        //     }
        //
        // fetchOrders
        //
        //     {
        //         "trading_pair": "ETPCNY",
        //         "status": "TRADE",
        //         "fee": 0.23,
        //         "min_fee": 10000000,
        //         "created_at": "2017-05-25T00:12:27.000Z",
        //         "cost": 1152468000000,
        //         "limit": 3600000000,
        //         "id": 11060,
        //         "quantity": 32013000000,
        //         "filled_quantity": 32013000000
        //     }
        //
        let id = this.safeString (order, 'id');
        let status = this.safeValue (order, 'status');
        if (typeof status !== 'undefined')
            status = this.parseOrderStatus (status);
        let marketId = this.safeString (order, 'trading_pair');
        if (typeof market === 'undefined') {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        let symbol = marketId;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let timestamp = this.safeInteger (order, 'created');
        if (typeof timestamp === 'undefined') {
            timestamp = this.parse8601 (order['created_at']);
        }
        if ('time' in order)
            timestamp = order['time'];
        else if ('transactTime' in order)
            timestamp = order['transactTime'];
        let price = this.safeFloat (order, 'limit');
        price = this.safeFloat (order, 'price', price);
        if (typeof price !== 'undefined')
            price = price / 1e8;
        let amount = this.divideSafeFloat (order, 'quantity', 1e8);
        let filled = this.divideSafeFloat (order, 'filled_quantity', 1e8);
        let remaining = this.divideSafeFloat (order, 'rest', 1e8);
        let cost = this.divideSafeFloat (order, 'cost', 1e8);
        // lines 483-494 should be generalized into a base class method
        if (typeof amount !== 'undefined') {
            if (typeof remaining === 'undefined') {
                if (typeof filled !== 'undefined') {
                    remaining = Math.max (0, amount - filled);
                }
            }
            if (typeof filled === 'undefined') {
                if (typeof remaining !== 'undefined') {
                    filled = Math.max (0, amount - remaining);
                }
            }
        }
        let type = 'limit';
        let side = this.safeString (order, 'side');
        if (typeof side !== 'undefined')
            side = side.toLowerCase ();
        let feeCost = this.divideSafeFloat (order, 'min_fee', 1e8);
        let fee = undefined;
        if (typeof feeCost !== 'undefined') {
            let feeCurrency = undefined;
            if (typeof market !== 'undefined')
                feeCurrency = market['quote'];
            fee = {
                'rate': this.safeFloat (order, 'fee'),
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        let trades = undefined;
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (typeof symbol === 'undefined') {
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'trading_pair': market['id'],
            'ids': id,
        };
        let response = await this.traderGetOrdersTradingPairIds (this.extend (request, params));
        //
        // let response = {
        //         "status": {
        //             "success": 1,
        //             "message": "SUC_LIST_AVTICE_ORDERS"
        //         },
        //         "result": [
        //             {
        //                 "id": 4180528,
        //                 "quantity": 20000000,
        //                 "rest": 20000000,
        //                 "limit": 1000000,
        //                 "price": null,
        //                 "side": "BUY",
        //                 "created": 1496005693738
        //             }
        //         ]
        //     }
        //
        let orders = this.parseOrders (response['result'], market);
        let ordersById = this.indexBy (orders, 'id');
        if (!(id in ordersById)) {
            throw new OrderNotFound (this.id + ' fetchOrder could not find order ' + id.toString () + ' in open orders.');
        }
        return ordersById[id];
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (typeof symbol === 'undefined') {
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'trading_pair': market['id'],
            'cursor': 0,
        };
        let response = await this.traderGetOrderpageTradingPairCursor (this.extend (request, params));
        //
        // let response = {
        //         "status": {
        //             "success": 1,
        //             "message": "SUC_LIST_AVTICE_ORDERS_PAGE"
        //         },
        //         "result": {
        //             "cursor": "0",
        //             "orders": [
        //                 {
        //                     "id": 4180528,
        //                     "quantity": 20000000,
        //                     "rest": 20000000,
        //                     "limit": 1000000,
        //                     "price": null,
        //                     "side": "BUY",
        //                     "created": 1496005693738
        //                 }
        //             ]
        //         }
        //     }
        //
        return this.parseOrders (response['result']['orders'], market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let ids = this.safeString (params, 'ids');
        if ((typeof symbol === 'undefined') || (typeof ids === 'undefined')) {
            throw new ExchangeError (this.id + " fetchOrders requires a 'symbol' argument and an extra 'ids' parameter. The 'ids' should be an array or a string of one or more order ids separated with slashes."); // eslint-disable-line quotes
        }
        if (Array.isArray (ids)) {
            ids = ids.join ('/');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'trading_pair': market['id'],
            'ids': ids,
        };
        let response = await this.traderGetHistoryTradingPairIds (this.extend (request, params));
        //
        // let response = {
        //         "status": {
        //             "success": 1,
        //             "message": null
        //         },
        //         "result": [
        //             {
        //                 "trading_pair": "ETPCNY",
        //                 "status": "TRADE",
        //                 "fee": 0.23,
        //                 "min_fee": 10000000,
        //                 "created_at": "2017-05-25T00:12:27.000Z",
        //                 "cost": 1152468000000,
        //                 "limit": 3600000000,
        //                 "id": 11060,
        //                 "quantity": 32013000000,
        //                 "filled_quantity": 32013000000
        //             }
        //         ]
        //     }
        //
        return this.parseOrders (response['result'], undefined, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (typeof symbol === 'undefined') {
            throw new ExchangeError (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.traderGetHistorysTradingPairPage (this.extend ({
            'trading_pair': market['id'],
            'page': 0,
        }, params));
        //
        // let response = {
        //         "status": {
        //             "success": 1,
        //             "message": null
        //         },
        //         "result": [
        //             {
        //                 "order_id": 118735,
        //                 "trade_id": 7,
        //                 "trading_pair": "BTCCNY",
        //                 "side": "B",
        //                 "quantity": 1000000000,
        //                 "price": 900000000,
        //                 "created_at": "2017-06-06T20:45:27.000Z"
        //             },
        //             {
        //                 "order_id": 118734,
        //                 "trade_id": 7,
        //                 "trading_pair": "BTCCNY",
        //                 "side": "S",
        //                 "quantity": 1000000000,
        //                 "price": 900000000,
        //                 "created_at": "2017-06-06T20:45:27.000Z"
        //             }
        //         ]
        //     }
        //
        return this.parseTrades (response['result'], undefined, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + api + '/' + this.implodeParams (path, params);
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            headers = {
                'apikey': this.apiKey,
                'signature': this.secret,
            };
            if (method === 'GET') {
                if (Object.keys (query).length)
                    url += '?' + this.urlencode (query);
            } else {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            if ('success' in response) {
                //
                //     {"status":{"success":0,"message":"ERR_USERTOKEN_NOT_FOUND"}}
                //
                let success = this.safeString (response, 'success');
                if (success !== '1') {
                    const message = this.safeString (response, 'message');
                    const feedback = this.id + ' ' + this.json (response);
                    const exceptions = this.exceptions;
                    if (message in exceptions) {
                        throw new exceptions[message] (feedback);
                    }
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
