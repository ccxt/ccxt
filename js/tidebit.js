'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class tidebit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tidebit',
            'name': 'TideBit',
            'countries': [ 'HK' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'fetchDepositAddress': true,
                'CORS': false,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/39034921-e3acf016-4480-11e8-9945-a6086a1082fe.jpg',
                'api': 'https://www.tidebit.com',
                'www': 'https://www.tidebit.com',
                'doc': [
                    'https://www.tidebit.com/documents/api/guide',
                    'https://www.tidebit.com/swagger/#/default',
                ],
                'referral': 'http://bit.ly/2IX0LrM',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'tickers/{market}',
                        'timestamp',
                        'trades',
                        'trades/{market}',
                        'order_book',
                        'order',
                        'k_with_pending_trades',
                        'k',
                        'depth',
                    ],
                    'post': [],
                },
                'private': {
                    'get': [
                        'addresses/{address}',
                        'deposits/history',
                        'deposits/get_deposit',
                        'deposits/deposit_address',
                        'historys/orders',
                        'historys/vouchers',
                        'historys/accounts',
                        'historys/snapshots',
                        'linkage/get_status',
                        'members/me',
                        'order',
                        'orders',
                        'partners/orders/{id}/trades',
                        'referral_commissions/get_undeposited',
                        'referral_commissions/get_graph_data',
                        'trades/my',
                        'withdraws/bind_account_list',
                        'withdraws/get_withdraw_account',
                        'withdraws/fetch_bind_info',
                    ],
                    'post': [
                        'deposits/deposit_cash',
                        'favorite_markets/update',
                        'order/delete',
                        'orders',
                        'orders/multi',
                        'orders/clear',
                        'referral_commissions/deposit',
                        'withdraws/apply',
                        'withdraws/bind_bank',
                        'withdraws/bind_address',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.3 / 100,
                    'taker': 0.3 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': true,
                    'withdraw': {}, // There is only 1% fee on withdrawals to your bank account.
                },
            },
            'exceptions': {
                '2002': InsufficientFunds,
                '2003': OrderNotFound,
            },
        });
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetDepositAddress (this.extend (request, params));
        if ('success' in response) {
            if (response['success']) {
                const address = this.safeString (response, 'address');
                const tag = this.safeString (response, 'addressTag');
                return {
                    'currency': code,
                    'address': this.checkAddress (address),
                    'tag': tag,
                    'info': response,
                };
            }
        }
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'id');
            const symbol = this.safeString (market, 'name');
            const [ baseId, quoteId ] = symbol.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetMembersMe (params);
        const balances = this.safeValue (response, 'accounts');
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'balance');
            account['used'] = this.safeFloat (balance, 'locked');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 300
        }
        request['market'] = market['id'];
        const response = await this.publicGetDepth (this.extend (request, params));
        const timestamp = this.safeTimestamp (response, 'timestamp');
        return this.parseOrderBook (response, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeTimestamp (ticker, 'at');
        ticker = this.safeValue (ticker, 'ticker', {});
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'ask': this.safeFloat (ticker, 'sell'),
            'bidVolume': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'change': undefined,
            'percentage': undefined,
            'previousClose': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetTickers (params);
        const ids = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let market = undefined;
            let symbol = id;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                const baseId = id.slice (0, 3);
                const quoteId = id.slice (3, 6);
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            const ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTickersMarket (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        const id = this.safeString (trade, 'id');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'volume');
        const cost = this.safeFloat (trade, 'funds');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'order': undefined,
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
            'market': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
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

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 30; // default is 30
        }
        const request = {
            'market': market['id'],
            'period': this.timeframes[timeframe],
            'limit': limit,
        };
        if (since !== undefined) {
            request['timestamp'] = parseInt (since / 1000);
        } else {
            request['timestamp'] = 1800000;
        }
        const response = await this.publicGetK (this.extend (request, params));
        if (response === 'null') {
            return [];
        }
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'done': 'closed',
            'wait': 'open',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "id": 7,                              // 唯一的 Order ID
        //         "side": "sell",                       // Buy/Sell 代表买单/卖单
        //         "price": "3100.0",                    // 出价
        //         "avg_price": "3101.2",                // 平均成交价
        //         "state": "wait",                      // 订单的当前状态 [wait,done,cancel]
        //                                               //   wait   表明订单正在市场上挂单
        //                                               //          是一个active order
        //                                               //          此时订单可能部分成交或者尚未成交
        //                                               //   done   代表订单已经完全成交
        //                                               //   cancel 代表订单已经被撤销
        //         "market": "btccny",                   // 订单参与的交易市场
        //         "created_at": "2014-04-18T02:02:33Z", // 下单时间 ISO8601格式
        //         "volume": "100.0",                    // 购买/卖出数量
        //         "remaining_volume": "89.8",           // 还未成交的数量 remaining_volume 总是小于等于 volume
        //                                               //   在订单完全成交时变成 0
        //         "executed_volume": "10.2",            // 已成交的数量
        //                                               //   volume = remaining_volume + executed_volume
        //         "trades_count": 1,                    // 订单的成交数 整数值
        //                                               //   未成交的订单为 0 有一笔成交的订单为 1
        //                                               //   通过该字段可以判断订单是否处于部分成交状态
        //         "trades": [                           // 订单的详细成交记录 参见Trade
        //                                               //   注意: 只有某些返回详细订单数据的 API 才会包含 Trade 数据
        //             {
        //                 "id": 2,
        //                 "price": "3100.0",
        //                 "volume": "10.2",
        //                 "market": "btccny",
        //                 "created_at": "2014-04-18T02:04:49Z",
        //                 "side": "sell"
        //             }
        //         ]
        //     }
        //
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            const marketId = order['market'];
            symbol = this.markets_by_id[marketId]['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const id = this.safeString (order, 'id');
        const type = this.safeString (order, 'ord_type');
        const side = this.safeString (order, 'side');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'volume');
        const filled = this.safeFloat (order, 'executed_volume');
        const remaining = this.safeFloat (order, 'remaining_volume');
        let cost = undefined;
        if (price !== undefined) {
            if (filled !== undefined) {
                cost = price * filled;
            }
        }
        return {
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            'side': side,
            'volume': amount.toString (),
            'ord_type': type,
        };
        if (type === 'limit') {
            request['price'] = price.toString ();
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const market = this.markets_by_id[response['market']];
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const result = await this.privatePostOrderDelete (this.extend (request, params));
        const order = this.parseOrder (result);
        const status = this.safeString (order, 'status');
        if (status === 'closed' || status === 'canceled') {
            throw new OrderNotFound (this.id + ' ' + this.json (order));
        }
        return order;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const id = this.safeString (params, 'id');
        if (id === undefined) {
            throw new ExchangeError (this.id + ' withdraw() requires an extra `id` param (withdraw account id according to withdraws/bind_account_list endpoint');
        }
        const request = {
            'id': id,
            'currency_type': 'coin', // or 'cash'
            'currency': currency['id'],
            'body': amount,
            // 'address': address, // they don't allow withdrawing to direct addresses?
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const result = await this.privatePostWithdrawsApply (this.extend (request, params));
        return {
            'info': result,
            'id': undefined,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    encodeParams (params) {
        return this.urlencode (this.keysort (params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + 'api/' + this.version + '/' + this.implodeParams (path, params) + '.json';
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const sortedByKey = this.keysort (this.extend ({
                'access_key': this.apiKey,
                'tonce': nonce,
            }, params));
            const query = this.urlencode (sortedByKey);
            const payload = method + '|' + request + '|' + query;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret));
            const suffix = query + '&signature=' + signature;
            if (method === 'GET') {
                url += '?' + suffix;
            } else {
                body = suffix;
                headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 400) || (response === undefined)) {
            const feedback = this.id + ' ' + body;
            if (response === undefined) {
                throw new ExchangeError (feedback);
            }
            const error = this.safeValue (response, 'error', {});
            const errorCode = this.safeString (error, 'code');
            this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
            // fallback to default error handler
        }
    }
};
