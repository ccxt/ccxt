'use strict';

// ---------------------------------------------------------------------------

const huobipro = require ('./huobipro.js');
const { ExchangeError, ArgumentsRequired, BadRequest, ExchangeNotAvailable, AuthenticationError, InvalidOrder, InsufficientFunds, OrderNotFound, DDoSProtection } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class cointiger extends huobipro {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cointiger',
            'name': 'CoinTiger',
            'countries': [ 'CN' ],
            'hostname': 'cointiger.pro',
            'has': {
                'fetchCurrencies': false,
                'fetchTickers': true,
                'fetchTradingLimits': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrderTrades': false, // not tested yet
                'cancelOrders': true,
            },
            'headers': {
                'Language': 'en_US',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/39797261-d58df196-5363-11e8-9880-2ec78ec5bd25.jpg',
                'api': {
                    'public': 'https://api.{hostname}/exchange/trading/api/market',
                    'private': 'https://api.{hostname}/exchange/trading/api',
                    'exchange': 'https://www.{hostname}/exchange',
                    'v2public': 'https://api.{hostname}/exchange/trading/api/v2',
                    'v2': 'https://api.{hostname}/exchange/trading/api/v2',
                },
                'www': 'https://www.cointiger.pro',
                'referral': 'https://www.cointiger.one/#/register?refCode=FfvDtt',
                'doc': 'https://github.com/cointiger/api-docs-en/wiki',
            },
            'api': {
                'v2public': {
                    'get': [
                        'timestamp',
                        'currencys',
                    ],
                },
                'v2': {
                    'get': [
                        'order/orders',
                        'order/match_results',
                        'order/make_detail',
                        'order/details',
                    ],
                    'post': [
                        'order',
                        'order/batch_cancel',
                    ],
                },
                'public': {
                    'get': [
                        'history/kline', // 获取K线数据
                        'detail/merged', // 获取聚合行情(Ticker)
                        'depth', // 获取 Market Depth 数据
                        'trade', // 获取 Trade Detail 数据
                        'history/trade', // 批量获取最近的交易记录
                        'detail', // 获取 Market Detail 24小时成交量数据
                    ],
                },
                'exchange': {
                    'get': [
                        'footer/tradingrule.html',
                        'api/public/market/detail',
                    ],
                },
                'private': {
                    'get': [
                        'user/balance',
                        'order/new',
                        'order/history',
                        'order/trade',
                    ],
                    'post': [
                        'order',
                    ],
                    'delete': [
                        'order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0008,
                    'taker': 0.0015,
                },
            },
            'exceptions': {
                //    {"code":"1","msg":"系统错误","data":null}
                //    {"code":"1","msg":"Balance insufficient,余额不足","data":null}
                '1': ExchangeError,
                '2': BadRequest, // {"code":"2","msg":"Parameter error","data":null}
                '5': InvalidOrder,
                '6': InvalidOrder,
                '8': OrderNotFound,
                '16': AuthenticationError, // funding password not set
                '100001': ExchangeError,
                '100002': ExchangeNotAvailable,
                '100003': ExchangeError,
                '100005': AuthenticationError,
                '110030': DDoSProtection,
            },
            'commonCurrencies': {
                'FGC': 'FoundGameCoin',
                'TCT': 'The Tycoon Chain Token',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.v2publicGetCurrencys (params);
        //
        //     {
        //         code: '0',
        //         msg: 'suc',
        //         data: {
        //             'bitcny-partition': [
        //                 {
        //                     baseCurrency: 'btc',
        //                     quoteCurrency: 'bitcny',
        //                     pricePrecision: 2,
        //                     amountPrecision: 4,
        //                     withdrawFeeMin: 0.0005,
        //                     withdrawFeeMax: 0.005,
        //                     withdrawOneMin: 0.01,
        //                     withdrawOneMax: 10,
        //                     depthSelect: { step0: '0.01', step1: '0.1', step2: '1' }
        //                 },
        //                 ...
        //             ],
        //             ...
        //         },
        //     }
        //
        const keys = Object.keys (response['data']);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const partition = response['data'][key];
            for (let j = 0; j < partition.length; j++) {
                const market = partition[j];
                const baseId = this.safeString (market, 'baseCurrency');
                const quoteId = this.safeString (market, 'quoteCurrency');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                const id = baseId + quoteId;
                const uppercaseId = id.toUpperCase ();
                const symbol = base + '/' + quote;
                const precision = {
                    'amount': market['amountPrecision'],
                    'price': market['pricePrecision'],
                };
                const active = true;
                result.push ({
                    'id': id,
                    'uppercaseId': uppercaseId,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'info': market,
                    'active': active,
                    'precision': precision,
                    'limits': {
                        'amount': {
                            'min': Math.pow (10, -precision['amount']),
                            'max': undefined,
                        },
                        'price': {
                            'min': Math.pow (10, -precision['price']),
                            'max': undefined,
                        },
                        'cost': {
                            'min': 0,
                            'max': undefined,
                        },
                    },
                });
            }
        }
        this.options['marketsByUppercaseId'] = this.indexBy (result, 'uppercaseId');
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (ticker, 'id');
        const close = this.safeFloat (ticker, 'last');
        const percentage = this.safeFloat (ticker, 'percentChange');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24hr'),
            'low': this.safeFloat (ticker, 'low24hr'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'], // this endpoint requires a lowercase market id
            'type': 'step0',
        };
        const response = await this.publicGetDepth (this.extend (request, params));
        const data = response['data']['depth_data'];
        if ('tick' in data) {
            if (!data['tick']) {
                throw new ExchangeError (this.id + ' fetchOrderBook() returned empty response: ' + this.json (response));
            }
            const orderbook = data['tick'];
            const timestamp = data['ts'];
            return this.parseOrderBook (orderbook, timestamp, 'buys');
        }
        throw new ExchangeError (this.id + ' fetchOrderBook() returned unrecognized response: ' + this.json (response));
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['uppercaseId'];
        const response = await this.exchangeGetApiPublicMarketDetail (params);
        if (!(marketId in response)) {
            throw new ExchangeError (this.id + ' fetchTicker symbol ' + symbol + ' (' + marketId + ') not found');
        }
        return this.parseTicker (response[marketId], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.exchangeGetApiPublicMarketDetail (params);
        const result = {};
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let market = undefined;
            let symbol = id;
            if (id in this.options['marketsByUppercaseId']) {
                // this endpoint returns uppercase ids
                symbol = this.options['marketsByUppercaseId'][id]['symbol'];
                market = this.options['marketsByUppercaseId'][id];
            }
            result[symbol] = this.parseTicker (response[id], market);
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        //
        //   {      volume: "0.014",
        //          symbol: "ethbtc",
        //         buy_fee: "0.00001400",
        //         orderId:  32235710,
        //           price: "0.06923825",
        //         created:  1531605169000,
        //              id:  3785005,
        //          source:  1,
        //            type: "buy-limit",
        //     bid_user_id:  326317         } ] }
        //
        // --------------------------------------------------------------------
        //
        //     {
        //         "volume": {
        //             "amount": "1.000",
        //             "icon": "",
        //             "title": "成交量"
        //                   },
        //         "price": {
        //             "amount": "0.04978883",
        //             "icon": "",
        //             "title": "委托价格"
        //                  },
        //         "created_at": 1513245134000,
        //         "deal_price": {
        //             "amount": 0.04978883000000000000000000000000,
        //             "icon": "",
        //             "title": "成交价格"
        //                       },
        //         "id": 138
        //     }
        //
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'orderId');
        const orderType = this.safeString (trade, 'type');
        let type = undefined;
        let side = undefined;
        if (orderType !== undefined) {
            const parts = orderType.split ('-');
            side = parts[0];
            type = parts[1];
        }
        side = this.safeString (trade, 'side', side);
        let amount = undefined;
        let price = undefined;
        let cost = undefined;
        if (side === undefined) {
            price = this.safeFloat (trade['price'], 'amount');
            amount = this.safeFloat (trade['volume'], 'amount');
            cost = this.safeFloat (trade['deal_price'], 'amount');
        } else {
            side = side.toLowerCase ();
            price = this.safeFloat (trade, 'price');
            amount = this.safeFloat2 (trade, 'amount', 'volume');
        }
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            let feeCurrency = undefined;
            if (market !== undefined) {
                if (side === 'buy') {
                    feeCurrency = market['base'];
                } else if (side === 'sell') {
                    feeCurrency = market['quote'];
                }
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        if (amount !== undefined) {
            if (price !== undefined) {
                if (cost === undefined) {
                    cost = amount * price;
                }
            }
        }
        let timestamp = this.safeInteger2 (trade, 'created_at', 'ts');
        timestamp = this.safeInteger2 (trade, 'created', 'mtime', timestamp);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetHistoryTrade (this.extend (request, params));
        return this.parseTrades (response['data']['trade_data'], market, since, limit);
    }

    async fetchMyTradesV1 (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'symbol': market['id'],
            'offset': 1,
            'limit': limit,
        };
        const response = await this.privateGetOrderTrade (this.extend (request, params));
        return this.parseTrades (response['data']['list'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const week = 604800000; // milliseconds
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        if (since === undefined) {
            since = this.milliseconds () - week; // week ago
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const start = this.ymd (since);
        const end = this.ymd (this.sum (since, week)); // one week
        if (limit === undefined) {
            limit = 1000;
        }
        const request = {
            'symbol': market['id'],
            'start-date': start,
            'end-date': end,
            'size': limit,
        };
        const response = await this.v2GetOrderMatchResults (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv['id'] * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['vol'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetHistoryKline (this.extend (request, params));
        return this.parseOHLCVs (response['data']['kline_data'], market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUserBalance (params);
        //
        //     {
        //         "code": "0",
        //         "msg": "suc",
        //         "data": [{
        //             "normal": "1813.01144179",
        //             "lock": "1325.42036785",
        //             "coin": "btc"
        //         }, {
        //             "normal": "9551.96692244",
        //             "lock": "547.06506717",
        //             "coin": "eth"
        //         }]
        //     }
        //
        const balances = this.safeValue (response, 'data');
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'coin');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeFloat (balance, 'lock');
            account['free'] = this.safeFloat (balance, 'normal');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'order_id': id,
        };
        const response = await this.v2GetOrderMakeDetail (this.extend (request, params));
        //
        // the above endpoint often returns an empty array
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: [ {      volume: "0.014",
        //                      symbol: "ethbtc",
        //                     buy_fee: "0.00001400",
        //                     orderId:  32235710,
        //                       price: "0.06923825",
        //                     created:  1531605169000,
        //                          id:  3785005,
        //                      source:  1,
        //                        type: "buy-limit",
        //                 bid_user_id:  326317         } ] }
        //
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchOrdersByStatusV1 (status = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100;
        }
        const method = (status === 'open') ? 'privateGetOrderNew' : 'privateGetOrderHistory';
        const request = {
            'symbol': market['id'],
            'offset': 1,
            'limit': limit,
        };
        const response = await this[method] (this.extend (request, params));
        const orders = response['data']['list'];
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            const order = this.extend (orders[i], {
                'status': status,
            });
            result.push (this.parseOrder (order, market));
        }
        return result;
    }

    async fetchOpenOrdersV1 (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatusV1 ('open', symbol, since, limit, params);
    }

    async fetchOrdersV1 (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatusV1 (undefined, symbol, since, limit, params);
    }

    async fetchOrdersByStatesV2 (states, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 50;
        }
        const request = {
            'symbol': market['id'],
            // 'types': 'buy-market,sell-market,buy-limit,sell-limit',
            'states': states, // 'new,part_filled,filled,canceled,expired'
            // 'from': '0', // id
            'direct': 'next', // or 'prev'
            'size': limit,
        };
        const response = await this.v2GetOrderOrders (this.extend (request, params));
        return this.parseOrders (response['data'], market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatesV2 ('new,part_filled,filled,canceled,expired', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatesV2 ('new,part_filled', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatesV2 ('filled,canceled', symbol, since, limit, params);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: {      symbol: "ethbtc",
        //                       fee: "0.00000200",
        //                 avg_price: "0.06863752",
        //                    source:  1,
        //                      type: "buy-limit",
        //                     mtime:  1531340305000,
        //                    volume: "0.002",
        //                   user_id:  326317,
        //                     price: "0.06863752",
        //                     ctime:  1531340304000,
        //               deal_volume: "0.00200000",
        //                        id:  31920243,
        //                deal_money: "0.00013727",
        //                    status:  2              } }
        //
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'order_id': id.toString (),
        };
        const response = await this.v2GetOrderDetails (this.extend (request, params));
        return this.parseOrder (response['data'], market);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open', // pending
            '1': 'open',
            '2': 'closed',
            '3': 'open',
            '4': 'canceled',
            '6': 'error',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //  v1
        //
        //      {
        //            volume: { "amount": "0.054", "icon": "", "title": "volume" },
        //         age_price: { "amount": "0.08377697", "icon": "", "title": "Avg price" },
        //              side: "BUY",
        //             price: { "amount": "0.00000000", "icon": "", "title": "price" },
        //        created_at: 1525569480000,
        //       deal_volume: { "amount": "0.64593598", "icon": "", "title": "Deal volume" },
        //   "remain_volume": { "amount": "1.00000000", "icon": "", "title": "尚未成交"
        //                id: 26834207,
        //             label: { go: "trade", title: "Traded", click: 1 },
        //          side_msg: "Buy"
        //      },
        //
        //  v2
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: {      symbol: "ethbtc",
        //                       fee: "0.00000200",
        //                 avg_price: "0.06863752",
        //                    source:  1,
        //                      type: "buy-limit",
        //                     mtime:  1531340305000,
        //                    volume: "0.002",
        //                   user_id:  326317,
        //                     price: "0.06863752",
        //                     ctime:  1531340304000,
        //               deal_volume: "0.00200000",
        //                        id:  31920243,
        //                deal_money: "0.00013727",
        //                    status:  2              } }
        //
        const id = this.safeString (order, 'id');
        let side = this.safeString (order, 'side');
        let type = undefined;
        const orderType = this.safeString (order, 'type');
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timestamp = this.safeInteger2 (order, 'created_at', 'ctime');
        const lastTradeTimestamp = this.safeInteger2 (order, 'mtime', 'finished-at');
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (order, 'symbol');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let remaining = undefined;
        let amount = undefined;
        let filled = undefined;
        let price = undefined;
        let cost = undefined;
        let fee = undefined;
        let average = undefined;
        if (side !== undefined) {
            side = side.toLowerCase ();
            amount = this.safeFloat (order['volume'], 'amount');
            remaining = ('remain_volume' in order) ? this.safeFloat (order['remain_volume'], 'amount') : undefined;
            filled = ('deal_volume' in order) ? this.safeFloat (order['deal_volume'], 'amount') : undefined;
            price = ('price' in order) ? this.safeFloat (order['price'], 'amount') : undefined;
            average = ('age_price' in order) ? this.safeFloat (order['age_price'], 'amount') : undefined;
        } else {
            if (orderType !== undefined) {
                const parts = orderType.split ('-');
                side = parts[0];
                type = parts[1];
                cost = this.safeFloat (order, 'deal_money');
                price = this.safeFloat (order, 'price');
                average = this.safeFloat (order, 'avg_price');
                amount = this.safeFloat2 (order, 'amount', 'volume');
                filled = this.safeFloat (order, 'deal_volume');
                const feeCost = this.safeFloat (order, 'fee');
                if (feeCost !== undefined) {
                    let feeCurrency = undefined;
                    if (market !== undefined) {
                        if (side === 'buy') {
                            feeCurrency = market['base'];
                        } else if (side === 'sell') {
                            feeCurrency = market['quote'];
                        }
                    }
                    fee = {
                        'cost': feeCost,
                        'currency': feeCurrency,
                    };
                }
            }
        }
        if (amount !== undefined) {
            if (remaining !== undefined) {
                if (filled === undefined) {
                    filled = Math.max (0, amount - remaining);
                }
            } else if (filled !== undefined) {
                cost = filled * price;
                if (remaining === undefined) {
                    remaining = Math.max (0, amount - filled);
                }
            }
        }
        if (status === undefined) {
            if (remaining !== undefined) {
                if (remaining === 0) {
                    status = 'closed';
                }
            }
        }
        const result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        //
        // obsolete since v2
        // https://github.com/ccxt/ccxt/issues/4815
        //
        //     if (!this.password) {
        //         throw new AuthenticationError (this.id + ' createOrder requires exchange.password to be set to user trading password (not login password!)');
        //     }
        //
        this.checkRequiredCredentials ();
        const market = this.market (symbol);
        const orderType = (type === 'limit') ? 1 : 2;
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'type': orderType,
            'volume': this.amountToPrecision (symbol, amount),
            // 'capital_password': this.password, // obsolete since v2, https://github.com/ccxt/ccxt/issues/4815
        };
        if ((type === 'market') && (side === 'buy')) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder requires price argument for market buy orders to calculate total cost according to exchange rules');
            }
            request['volume'] = this.amountToPrecision (symbol, parseFloat (amount) * parseFloat (price));
        }
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        } else {
            if (price === undefined) {
                request['price'] = this.priceToPrecision (symbol, 0);
            } else {
                request['price'] = this.priceToPrecision (symbol, price);
            }
        }
        const response = await this.v2PostOrder (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "suc",
        //         "data": {
        //             "order_id": 481
        //         }
        //     }
        //
        const timestamp = this.milliseconds ();
        return {
            'info': response,
            'id': this.safeString (response['data'], 'order_id'),
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
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'order_id': id,
        };
        const response = await this.privateDeleteOrder (this.extend (request, params));
        return {
            'id': id,
            'symbol': symbol,
            'info': response,
        };
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders requires a symbol argument');
        }
        const market = this.market (symbol);
        const marketId = market['id'];
        const orderIdList = {};
        orderIdList[marketId] = ids;
        const request = {
            'orderIdList': this.json (orderIdList),
        };
        const response = await this.v2PostOrderBatchCancel (this.extend (request, params));
        return {
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        this.checkRequiredCredentials ();
        let url = this.implodeParams (this.urls['api'][api], {
            'hostname': this.hostname,
        });
        url += '/' + this.implodeParams (path, params);
        if (api === 'private' || api === 'v2') {
            const timestamp = this.milliseconds ().toString ();
            const query = this.keysort (this.extend ({
                'time': timestamp,
            }, params));
            const keys = Object.keys (query);
            let auth = '';
            for (let i = 0; i < keys.length; i++) {
                auth += keys[i] + query[keys[i]].toString ();
            }
            auth += this.secret;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512');
            const urlParams = (method === 'POST') ? {} : query;
            url += '?' + this.urlencode (this.keysort (this.extend ({
                'api_key': this.apiKey,
                'time': timestamp,
            }, urlParams)));
            url += '&sign=' + signature;
            if (method === 'POST') {
                body = this.urlencode (query);
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
            }
        } else if (api === 'public' || api === 'v2public') {
            url += '?' + this.urlencode (this.extend ({
                'api_key': this.apiKey,
            }, params));
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('code' in response) {
            //
            //     { "code": "100005", "msg": "request sign illegal", "data": null }
            //
            const code = this.safeString (response, 'code');
            if (code !== undefined) {
                const message = this.safeString (response, 'msg');
                const feedback = this.id + ' ' + this.json (response);
                if (code !== '0') {
                    const exceptions = this.exceptions;
                    if (code in exceptions) {
                        if (code === '1') {
                            //
                            //    {"code":"1","msg":"系统错误","data":null}
                            //    {“code”:“1",“msg”:“Balance insufficient,余额不足“,”data”:null}
                            //
                            if (message.indexOf ('Balance insufficient') >= 0) {
                                throw new InsufficientFunds (feedback);
                            }
                        } else if (code === '2') {
                            if (message === 'offsetNot Null') {
                                throw new ExchangeError (feedback);
                            } else if (message === 'api_keyNot EXIST') {
                                throw new AuthenticationError (feedback);
                            } else if (message === 'price precision exceed the limit') {
                                throw new InvalidOrder (feedback);
                            } else if (message === 'Parameter error') {
                                throw new BadRequest (feedback);
                            }
                        }
                        throw new exceptions[code] (feedback);
                    } else {
                        throw new ExchangeError (this.id + ' unknown "error" value: ' + this.json (response));
                    }
                } else {
                    //
                    // Google Translate:
                    // 订单状态不能取消,订单取消失败 = Order status cannot be canceled
                    // 根据订单号没有查询到订单,订单取消失败 = The order was not queried according to the order number
                    //
                    // {"code":"0","msg":"suc","data":{"success":[],"failed":[{"err-msg":"订单状态不能取消,订单取消失败","order-id":32857051,"err-code":"8"}]}}
                    // {"code":"0","msg":"suc","data":{"success":[],"failed":[{"err-msg":"Parameter error","order-id":32857050,"err-code":"2"},{"err-msg":"订单状态不能取消,订单取消失败","order-id":32857050,"err-code":"8"}]}}
                    // {"code":"0","msg":"suc","data":{"success":[],"failed":[{"err-msg":"Parameter error","order-id":98549677,"err-code":"2"},{"err-msg":"根据订单号没有查询到订单,订单取消失败","order-id":98549677,"err-code":"8"}]}}
                    //
                    if (feedback.indexOf ('订单状态不能取消,订单取消失败') >= 0) {
                        if (feedback.indexOf ('Parameter error') >= 0) {
                            throw new OrderNotFound (feedback);
                        } else {
                            throw new InvalidOrder (feedback);
                        }
                    } else if (feedback.indexOf ('根据订单号没有查询到订单,订单取消失败') >= 0) {
                        throw new OrderNotFound (feedback);
                    }
                }
            }
        }
    }
};
