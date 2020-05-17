'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, AuthenticationError, ArgumentsRequired } = require ('./base/errors');
// ---------------------------------------------------------------------------

module.exports = class cryptocom extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cryptocom',
            'name': 'СryptoСom',
            'countries': [ 'MT' ],
            'rateLimit': 100,
            'version': 'v1',
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': false,
                'fetchOrderBook': true,
                'fetchOHLCV': true,
                'fetchTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'cancelAllOrders': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30', // default
                '1h': '60',
                '1d': '1440',
                '1w': '10080',
                '1M': '43200',
            },
            'urls': {
                'logo': 'https://crypto.com/images/crypto_logo_blue-1a354060.png',
                'api': 'https://api.crypto.com',
                'www': 'https://crypto.com',
                'doc': 'https://crypto.com/exchange-doc',
                'fees': 'https://crypto.com/exchange/document/fees-limits',
            },
            'api': {
                'public': {
                    'get': [
                        'symbols', // List all available market symbols
                        'ticker', // Get tickers in all available markets
                        'klines', // Get k-line data over a specified period
                        'trades', // Get last 200 trades in a specified market
                        'ticker/price', // Get latest execution price for all markets
                        'depth', // Get the order book for a particular market
                    ],
                },
                'private': {
                    'post': [
                        'account', // List all account balance of user
                        'order', // Create an order
                        'showOrder', // Get order detail
                        'orders/cancel', // Cancel an order
                        'cancelAllOrders', // Cancel all orders in a particular market
                        'openOrders', // List all open orders in a particular market
                        'allOrders', // List all orders in a particular market
                        'myTrades', // List all executed orders
                    ],
                },
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'exceptions': {
                '500': ExchangeError, // Internal Server Error
                '503': ExchangeNotAvailable, // Server Busy - The server is temporarily too busy, please retry later
                '100004': AuthenticationError, // {'code': '100004', 'msg': 'request parameter illegal', 'data': None}
                '100005': AuthenticationError, // {'code': '100005', 'msg': 'request sign illegal', 'data': None}
            },
            'options': {
                'fetchOrderBook': {
                    'type': 'step0', // or 'main'
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        //    {
        //       "code":"0",
        //       "msg":"suc",
        //       "data":[
        //          {
        //             "symbol":"crobtc",
        //             "count_coin":"BTC",
        //             "amount_precision":2,
        //             "base_coin":"CRO",
        //             "price_precision":8
        //          } ]
        //    }
        const response = await this.publicGetSymbols (params);
        const markets = this.safeValue (response, 'data', {});
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base_coin');
            const quoteId = this.safeString (market, 'count_coin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amount_precision'),
                'price': this.safeInteger (market, 'price_precision'),
            };
            result.push ({
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'taker': this.fees['trading']['taker'],
                'maker': this.fees['trading']['maker'],
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': Math.pow (10, precision['amount']),
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
            });
        }
        return result;
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        // they return [ Timestamp, Volume, Close, High, Low, Open ]
        return [
            parseInt (ohlcv[0]),   // t
            parseFloat (ohlcv[1]), // o
            parseFloat (ohlcv[2]), // h
            parseFloat (ohlcv[3]), // l
            parseFloat (ohlcv[4]), // c
            parseFloat (ohlcv[5]), // v
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        const response = await this.publicGetKlines (this.extend (request, params));
        //      {
        //       "code": "0",
        //       "msg": "suc",
        //       "data": [
        //          [ 1588707000, 0.00000704, 0.00000707, 0.00000702, 0.00000704, 95172.49040524 ],
        //          [ 1588707900, 0.00000703, 0.00000706, 0.00000702, 0.00000703, 54371.82911970 ],
        //          ...
        //          [ 1588708800, 0.00000704, 0.00000706, 0.00000702, 0.00000702, 65486.62800270 ],
        //       ]
        //      }
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        let type = undefined;
        if ('type' in params) {
            type = params['type'];
            params = this.omit (params, 'type');
        } else {
            const options = this.safeValue (this.options, 'fetchOrderBook', {});
            type = this.safeString (options, 'type');
        }
        request['type'] = type;
        const response = await this.publicGetDepth (this.extend (request, params));
        //        {
        //        "code":"0",
        //        "msg":"suc",
        //        "data": {
        //            "tick": {
        //                  "asks": [
        //                      [ 0.00000692, 19623.4180177 ],
        //                      [ 0.00000693, 65620.10483685 ],
        //                      ...
        //                      [0.00062,1000],
        //                  ],
        //                  "bids": [
        //                      [ 0.0000069, 61216.77 ],
        //                      [ 0.00000689, 1947.68 ],
        //                      ...
        //                      [0.00000347,4079.93]
        //                  ],
        //                  "time": null
        //              }
        //          }
        //        }
        const result = this.safeValue (response, 'data', {});
        const orderbook = this.safeValue (result, 'tick');
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeInteger (ticker, 'time');
        if (timestamp === undefined) {
            timestamp = this.milliseconds ();
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let open = undefined;
        let change = undefined;
        let average = undefined;
        const last = this.safeFloat (ticker, 'last');
        const relativeChange = this.safeFloat (ticker, 'rose');
        if (relativeChange !== -1) {
            open = last / this.sum (1, relativeChange);
            change = last - open;
            average = this.sum (last, open) / 2;
        }
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
            'percentage': relativeChange * 100,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        //    {
        //      "code":"0",
        //      "msg":"suc",
        //      "data": {
        //        "date": 1588981375165,
        //        "ticker": [
        //          {
        //            "symbol":"crobtc",
        //            "high":"0.00000694",
        //            "vol":"14428176.79384366",
        //            "last":"0.0000069000000000",
        //            "low":"0.00000656",
        //            "buy":"0.00000689",
        //            "sell":"0.00000692",
        //            "change":"0.0454545455",
        //            "rose":"0.0454545455"
        //          },
        //        ]
        //      }
        //    }
        const data = this.safeValue (response, 'data', {});
        const tickers = this.safeValue (data, 'ticker', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const marketId = this.safeString (ticker, 'symbol');
            if (marketId !== undefined) {
                if (marketId in this.markets_by_id) {
                    const market = this.markets_by_id[marketId];
                    const symbol = market['symbol'];
                    result[symbol] = this.parseTicker (ticker, market);
                } else {
                    result[marketId] = this.parseTicker (ticker);
                }
            }
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //    {
        //      "code":"0",
        //      "msg":"suc",
        //      "data": {
        //        "high":"0.000007",
        //        "vol":"14781438.38348542",
        //        "last":"0.0000069600000000",
        //        "low":"0.00000674",
        //        "buy":"0.00000696",
        //        "sell":"0.00000699",
        //        "rose":"0.0087082729",
        //        "time":1589017701000
        //      }
        //    }
        const data = this.safeValue (response, 'data', {});
        return this.parseTicker (data, market);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger (trade, 'ctime');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        if (amount === undefined) {
            amount = this.safeFloat (trade, 'volume');
        }
        const cost = price * amount;
        const side = this.safeStringLower (trade, 'type');
        const id = this.safeString (trade, 'id');
        const type = 'limit'; // all trades are still limit trades
        const takerOrMaker = undefined; // can't distinguish my deal from someone else's
        const order = undefined; // can't distinguish my deal from someone else's
        const fee = undefined;
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': order,
            'takerOrMaker': takerOrMaker,
            'type': type,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        //    {
        //      "code": "0",
        //      "msg": "suc",
        //      "data": [
        //        {
        //          "amount": 151.1700000000000000,
        //          "price": 0.0000069600000000,
        //          "ctime": 1589032904000,
        //          "id": 1887449,
        //          "type": "buy"
        //        },
        //      ]
        //    }
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostAccount (params);
        //    {
        //      "code": "0",
        //      "msg": "suc",
        //      "data": {
        //        "total_asset": 432323.23, // user total assets (estimated in BTC)
        //        "coin_list": [
        //          {
        //            "normal": 32323.233, // usable balance
        //            "locked": 32323.233, // locked balance, e.g. locked in an active, non-executed order
        //            "btcValuatin": 112.33, // value equal to BTC
        //            "coin": "btc" // asset type
        //          },
        //        ]
        //      }
        //    }
        const data = this.safeValue (response, 'data', {});
        const coin_list = this.safeValue (data, 'coin_list', []);
        const result = {};
        for (let i = 0; i < coin_list.length; i++) {
            const balance = coin_list[i];
            const currencyId = this.safeString (balance, 'coin');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            //  account['total'] = this.safeFloat (balance, 'normal');
            account['free'] = this.safeFloat (balance, 'normal');
            account['used'] = this.safeFloat (balance, 'locked');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = (type === 'limit') ? 1 : 2;
        const request = {
            'symbol': market['id'],
            'volume': this.amountToPrecision (symbol, amount),
            'side': side.toUpperCase (),
            'type': orderType,
        };
        if (type !== 'market') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        //    {
        //      'code': '0',
        //      'msg': 'suc',
        //      'data': {
        //        'order_id': 67952563
        //      }
        //    }
        const data = this.safeValue (response, 'data', {});
        const order = this.parseOrder (data, market);
        const id = data['order_id'];
        this.orders[id] = order;
        return order;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders requires a `symbol` argument');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        return await this.privatePostCancelAllOrders (this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a `symbol` argument');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostOrdersCancel (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data);
    }

    parseOrderStatus (status) {
        // 0: INIT, "Initial order"
        // 1: NEW, "New order, Unfinished business enters the market"
        // 2: FILLED, "Full deal"
        // 3: PART_FILLED, "Partial transaction"
        // 4: CANCELED, "Order cancelled"
        // 5: PENDING_CANCEL, "Order will be cancelled"
        // 6. EXPIRED(, "Abnormal order"
        const statuses = {
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'open',
            '4': 'canceled',
            '5': 'canceled',
            '6': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const created = this.safeInteger (order, 'created_at');
        const updated = this.safeInteger (order, 'updated_at');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const amount = this.safeFloat (order, 'volume');
        const filled = this.safeFloat (order, 'deal_volume');
        const remaining = this.safeFloat (order, 'remain_volume');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let id = this.safeString (order, 'order_id');
        if (id === undefined) {
            id = this.safeString (order, 'id');
        }
        const clientOrderId = id;
        const price = this.safeFloat (order, 'price');
        const type = this.safeString (order, 'type');
        const side = this.safeStringLower (order, 'side');
        const trades = this.safeValue (order, 'tradeList');
        return {
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': created,
            'datetime': this.iso8601 (created),
            'lastTradeTimestamp': updated,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'info': order,
            'cost': undefined,
            'fee': undefined,
            'average': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a `symbol` argument');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostShowOrder (this.extend (request, params));
        //    {
        //      'code': '0',
        //      'msg': 'suc',
        //      'data': {
        //        'order_info': {
        //          'side': 'SELL',
        //          'total_price': '1.08255100',
        //          'fee': '0.00000000',
        //          'created_at': 1589038246000,
        //          'deal_price': '0.00000000',
        //          'avg_price': '0.00000000',
        //          'countCoin': 'USDT',
        //          'source': 3,
        //          'type': 1,
        //          'side_msg': 'Sell',
        //          'volume': '0.00470000',
        //          'updated_at': 1589038273000,
        //          'price': '230.33000000',
        //          'source_msg': 'API',
        //          'status_msg': 'Canceled',
        //          'deal_volume': '0.00000000',
        //          'fee_coin': 'USDT',
        //          'id': 67991754,
        //          'remain_volume': '0.00470000',
        //          'baseCoin': 'ETH',
        //          'tradeList': [],
        //          'status': 4
        //        }
        //      }
        //    }
        const data = this.safeValue (response, 'data', {});
        const order_info = this.safeValue (data, 'order_info', []);
        return this.parseOrder (order_info, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a `symbol` argument');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privatePostOpenOrders (this.extend (request, params));
        //    {
        //      'code': '0',
        //      'msg': 'suc',
        //      'data': {
        //        'count': 1,
        //        'resultList': [
        //          {
        //            'side': 'SELL',
        //            'total_price': '1.08255100',
        //            'fee': '0.00000000',
        //            'created_at': 1589044302000,
        //            'deal_price': '0.00000000',
        //            'avg_price': '0.00000000',
        //            'countCoin': 'USDT',
        //            'source': 3,
        //            'type': 1,
        //            'side_msg': 'Sell',
        //            'volume': '0.00470000',
        //            'updated_at': 1589044302000,
        //            'price': '230.33000000',
        //            'source_msg': 'API',
        //            'status_msg': 'unsettled',
        //            'deal_volume': '0.00000000',
        //            'fee_coin': 'USDT',
        //            'id': 68087073,
        //            'remain_volume': '0.00470000',
        //            'baseCoin': 'ETH',
        //            'status': 1
        //          }
        //        ]
        //      }
        //    }
        const data = this.safeValue (response, 'data', {});
        const resultList = this.safeValue (data, 'resultList', []);
        let orders = this.parseOrders (resultList, market, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        return orders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders requires a `symbol` argument');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privatePostAllOrders (this.extend (request, params));
        //    {
        //      'code': '0',
        //      'msg': 'suc',
        //      'data': {
        //        'count': 1,
        //        'orderList': [
        //          {
        //            'side': 'SELL',
        //            'total_price': '1.08255100',
        //            'fee': '0.00000000',
        //            'created_at': 1589044302000,
        //            'deal_price': '0.00000000',
        //            'avg_price': '0.00000000',
        //            'countCoin': 'USDT',
        //            'source': 3,
        //            'type': 1,
        //            'side_msg': 'Sell',
        //            'volume': '0.00470000',
        //            'updated_at': 1589044302000,
        //            'price': '230.33000000',
        //            'source_msg': 'API',
        //            'status_msg': 'unsettled',
        //            'deal_volume': '0.00000000',
        //            'fee_coin': 'USDT',
        //            'id': 68087073,
        //            'remain_volume': '0.00470000',
        //            'baseCoin': 'ETH',
        //            'status': 1
        //          }
        //        ]
        //      }
        //    }
        const data = this.safeValue (response, 'data', {});
        const orderList = this.safeValue (data, 'orderList', []);
        let orders = this.parseOrders (orderList, market, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        orders = this.filterByArray (orders, 'status', [ 'closed', 'canceled' ], false);
        return orders;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a `symbol` argument');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        //    endDate   No   End time, accurate to seconds "yyyy-MM-dd HH:mm:ss"
        //    page      No   Page number
        //    pageSize  No   Page size
        //    startDate No   Start time, accurate to seconds "yyyy-MM-dd HH:mm:ss"
        //    symbol    Yes  Market symbol "btcusdt", See below for details
        const response = await this.privatePostMyTrades (this.extend (request, params));
        //    {
        //      'code': '0',
        //      'msg': 'suc',
        //      'data': {
        //        'count': 1,
        //        'resultList': [
        //          {
        //            'volume': '0.0047',
        //            'side': 'SELL',
        //            'feeCoin': 'USDT',
        //            'ask_user_id': 71308,
        //            'price': '213.26000000',
        //            'fee': '0.00',
        //            'ctime': 1589046006000,
        //            'deal_price': '1.00',
        //            'id': 1811457,
        //            'type': 'Sell',
        //            'ask_id': 68117598
        //          }
        //        ]
        //      }
        //    }
        const data = this.safeValue (response, 'data', {});
        const resultList = this.safeValue (data, 'resultList', []);
        return this.parseTrades (resultList, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const sortedByKey = this.keysort (this.extend ({
                'api_key': this.apiKey,
                'time': nonce,
            }, params));
            const query = this.urlencode (sortedByKey);
            const payload = query.replace ('&', '').replace ('=', '') + this.secret;
            const signature = this.hash (this.encode (payload), 'sha256');
            body = this.extend (sortedByKey, {
                'sign': signature,
            });
            body = this.urlencode (body);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code >= 400) {
            const feedback = this.id + ' ' + body;
            if ((code === 503) || (code === 500)) {
                // The server is temporarily too busy, please retry later
                throw new ExchangeNotAvailable (feedback);
            }
            // Request rejected due to an input validation error
            if (code === 429) {
                return;
            }
            // { code: 0, msg: "suc", data: ... }
            if (body[0] === '{') {
                if (('code' in response) && (response['code'] !== 0)) {
                    const errorCode = this.safeString (response, 'code');
                    this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
                }
            }
            throw new ExchangeError (feedback);
        }
    }
};
