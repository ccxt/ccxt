'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, RateLimitExceeded, ArgumentsRequired, ExchangeNotAvailable, OrderNotFound, InvalidOrder, InvalidNonce, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bybit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bybit',
            'name': 'Bybit',
            'countries': [ 'SG' ], // Singapore
            'userAgent': 'sdk_ccxt/bybit_1.0',
            'rateLimit': 100,
            'has': {
                'fetchDepositAddress': false,
                'CORS': false,
                'fetchTickers': true,
                'fetchTicker': true,
                'fetchOHLCV': true,
                'fetchMyTrades': true,
                'fetchTrades': true,
                'fetchOrder': 'emulated',
                'fetchOrders': true,
                'createOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': false,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': true,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '9h': '720',
                '1d': 'D',
                '1M': 'M',
                '1w': 'W',
                '1Y': 'Y',
            },
            'debug': false, // set true to use testnet
            'urls': {
                'test': {
                    'v2': 'http://api-testnet.bybit.com/v2',
                    'wapi': 'https://api-testnet.bybit.com',
                    'public': 'https://api-testnet.bybit.com/open-api',
                    'private': 'https://api-testnet.bybit.com/open-api',
                },
                'api': {
                    'v2': 'https://api.bybit.com/v2',
                    'wapi': 'https://api.bybit.com',
                    'public': 'https://api.bybit.com/open-api',
                    'private': 'https://api.bybit.com/open-api',
                },
                'logo': 'https://user-images.githubusercontent.com/3198806/66993457-30a52700-f0fe-11e9-810c-a4a51e36fd20.png',
                'www': 'https://www.bybit.com',
                'doc': [
                    'https://github.com/bybit-exchange/bybit-official-api-docs',
                ],
                'fees': 'https://help.bybit.com/hc/en-us/articles/360007291173-Trading-Fee',
            },
            'api': {
                'v2': {
                    'get': [
                        'public/time',
                        'public/symbols',
                        'public/tickers',
                        'public/ticker',
                        'public/kline/list',
                        'public/orderBook/L2',
                        'private/execution/list',
                        'public/trading-records',
                    ],
                    'post': [
                        'private/order/create',
                        'private/order/cancel',
                        'private/order/cancelAll',
                        'private/stop-order/cancelAll',
                    ],
                },
                'wapi': {
                    'get': [
                        'position/list',
                    ],
                },
                'private': {
                    'get': [
                        'order/list',
                        'stop-order/list',
                        'wallet/fund/records',
                        'wallet/withdraw/list',
                    ],
                    'post': [
                        'order/create',
                        'order/cancel',
                        'stop-order/create',
                        'stop-order/cancel',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.00075,
                    'maker': -0.00025,
                },
            },
            // exchange-specific options
            'options': {
                'recvWindow': 5 * 1000, // 5 seconds by default
                'timeDifference': 0,
                'adjustTime': false, // set true to sync server time before api call
            },
            'exceptions': {
                '-1': ExchangeNotAvailable,
                '20010': InvalidOrder, // createOrder -> 'invalid qty' or others
                '10002': InvalidNonce, // 'your time is ahead of server'
                '10003': AuthenticationError, // api_key invalid,
                '10004': AuthenticationError, // invalid sign,
                '10005': AuthenticationError, // permission denied
                '10006': RateLimitExceeded,
                '10010': AuthenticationError, // ip mismatch
                '20001': OrderNotFound,
                '20003': ArgumentsRequired,
                '20005': ArgumentsRequired,
                '20007': ArgumentsRequired,
                '20009': ArgumentsRequired,
                '20013': ArgumentsRequired,
                '20015': ArgumentsRequired,
                '20017': ArgumentsRequired,
                '20019': ArgumentsRequired,
                '20020': ArgumentsRequired,
                '20021': ArgumentsRequired,
                '20084': ArgumentsRequired,
                '30010': InsufficientFunds,
                '30067': InsufficientFunds,
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async loadServerTimeDifference () {
        const response = await this.v2GetPublicTime ();
        const after = this.milliseconds ();
        const serverTime = this.safeInteger (response, 'time_now') * 1000;
        this.options['timeDifference'] = after - serverTime;
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        if (this.options['adjustTime']) {
            await this.loadServerTimeDifference ();
        }
        const response = await this.v2GetPublicSymbols (params);
        const data = this.safeValue (response, 'result', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const active = this.safeValue (market, 'active', true);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v2GetPublicTickers (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        return this.parseTicker (result[0]);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.v2GetPublicTickers ();
        const result = this.parseTickers (this.safeValue (response, 'result', []));
        const tickers = this.filterTickers (result, symbols);
        return tickers;
    }

    filterTickers (tickers, symbols) {
        if (symbols === undefined) {
            return tickers;
        }
        if (!Array.isArray (symbols)) {
            return tickers;
        }
        if (!symbols.length) {
            return tickers;
        }
        const filteredTickers = {};
        for (let i = 0; i < symbols.length; i++) {
            filteredTickers[symbols[i]] = tickers[symbols[i]];
        }
        return filteredTickers;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (!('order_id' in params) && (symbol === undefined)) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires `symbol` or `order_id` param');
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = this.truncate (since / 1000, 0);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v2GetPrivateExecutionList (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const tradesList = this.safeValue (result, 'trade_list', []);
        let trades = [];
        if (market !== undefined) {
            trades = this.parseTrades (tradesList, market);
        } else {
            if (tradesList) {
                const tradesLength = tradesList.length;
                for (let i = 0; i < tradesLength; i++) {
                    const tradeRaw = tradesList[i];
                    const trade = this.parseTrade (tradeRaw);
                    trades.push (trade);
                }
            }
        }
        return this.filterBySinceLimit (trades, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // at the moment (11.12.2019) works incorrectly with this additional argument
        // if (since !== undefined) {
        //     request['from'] = since;
        // }
        const response = await this.v2GetPublicTradingRecords (this.extend (request, params));
        // {
        //     "ret_code": 0,                                   // error code 0 means success
        //     "ret_msg": "OK",                                 // error message
        //     "ext_code": "",
        //     "ext_info": "",
        //     "result": [
        //         {
        //             "id":7724919,                                   // ID
        //             "symbol": "BTCUSD",                             // contract type
        //             "price": 9499.5,                                // execution price
        //             "qty": 9500,                                    // execution quantity
        //             "side": "Buy",                                  // side
        //             "time": "2019-11-19T08:03:04.077Z",             // UTC time
        //         }
        //     ],
        //     "time_now": "1567109419.049271"
        // }
        const result = this.safeValue (response, 'result', []);
        const trades = this.parseTrades (result, market, since, limit);
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v2GetPublicOrderBookL2 (this.extend (request, params));
        // {
        // ...
        //     "result": [
        //         {
        //             "symbol": "BTCUSD",                 // symbol
        //             "price": "9487",                    // price
        //             "size": 336241,                     // size (in USD contracts)
        //             "side": "Buy"                       // side
        //         },
        //         {
        //             "symbol": "BTCUSD",                 // symbol
        //             "price": "9487.5",                  // price
        //             "size": 522147,                     // size (in USD contracts)
        //             "side": "Sell"                      // side
        //         }
        //     ],
        //     "time_now": "1567108756.834357"             // UTC timestamp
        // }
        const timestamp = this.safeFloat (response, 'time_now') * 1000;
        const datetime = this.iso8601 (timestamp);
        const result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': datetime,
            'nonce': undefined,
        };
        // parseOrderBook can't be applied here because of specific structure of response
        const data = this.safeValue (response, 'result', []);
        if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                const order = data[i];
                const side = this.safeString (order, 'side');
                let bidsOrAsks = undefined;
                if (side === 'Sell') {
                    bidsOrAsks = 'asks';
                } else if (side === 'Buy') {
                    bidsOrAsks = 'bids';
                }
                const amount = this.safeFloat (order, 'size');
                const price = this.safeFloat (order, 'price');
                if (bidsOrAsks !== undefined) {
                    result[bidsOrAsks].push ([ price, amount ]);
                }
            }
            result['bids'] = this.sortBy (result['bids'], 0, true);
            result['asks'] = this.sortBy (result['asks'], 0);
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.wapiGetPositionList (this.extend (request, params));
        const retData = this.safeValue (response, 'result');
        const result = { 'info': retData };
        for (let i = 0; i < retData.length; i++) {
            const position = retData[i];
            const symbol = this.safeString (position, 'symbol');
            const market = this.markets_by_id[symbol];
            const currencyId = market['base'];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = position['wallet_balance'];
            account['used'] = position['position_margin'] + position['occ_closing_fee'] + position['occ_funding_fee'] + position['order_margin'];
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since === undefined) {
            request['from'] = this.seconds () - 86400; // default from 24 hours ago
        } else {
            request['from'] = this.truncate (since / 1000, 0);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default == max == 200
        }
        const response = await this.v2GetPublicKlineList (this.extend (request, params));
        return this.parseOHLCVs (this.safeValue (response, 'result', {}), market, timeframe, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        // There are two type of orders, so user must define which order to cancel
        // so why not ask user to point out in  which order to cancel ?
        let orders = undefined;
        if (('stop_order_id' in params) || ('order_id' in params)) {
            orders = await this.fetchOrders (symbol, undefined, undefined, params);
        } else {
            throw new ArgumentsRequired (this.id + " fetchOrder() requires additional argement either 'order_id' to fetch active order or 'stop_order_id' to fetch conditional order. Values of these arguments should be equal to value of 'id' argument.");
        }
        const numResults = orders.length;
        if (numResults === 1) {
            return orders[0];
        } else {
            for (let i = 0; i < numResults; i++) {
                if (this.safeString (orders[i], 'id') === id) {
                    return orders[i];
                }
            }
        }
        throw new OrderNotFound (this.id + ': The order ' + id + ' not found.');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterOrdersByStatus (orders, 'open');
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterOrdersByStatus (orders, 'closed');
    }

    filterOrdersByStatus (orders, status) {
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] === status) {
                result.push (orders[i]);
            }
        }
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            if (limit > 20) {
                request['limit'] = limit;
            }
        }
        let response = undefined;
        // if params include 'stop_order_id' then return to user conditional orders
        if ('stop_order_id' in params) {
            response = await this.privateGetStopOrderList (this.extend (request, params));
        } else {
            // by default get active orders (not conditional)
            response = await this.privateGetOrderList (this.extend (request, params));
        }
        const result = this.safeValue (response, 'result', {});
        const orders = this.parseOrders (this.safeValue (result, 'data', []), market, since, limit);
        return this.filterBySinceLimit (orders, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
            'side': this.capitalize (side),
            'qty': amount,
            'order_type': this.capitalize (type),
        };
        if (price !== undefined) {
            request['price'] = price;
        }
        if (this.safeString (params, 'time_in_force') === undefined) {
            if (type === 'market') {
                request['time_in_force'] = '';
            } else {
                request['time_in_force'] = 'GoodTillCancel';
            }
        }
        let response = undefined;
        if (('stop_px' in params) && ('base_price' in params)) {
            response = await this.privatePostStopOrderCreate (this.extend (request, params));
        } else {
            response = await this.v2PostPrivateOrderCreate (this.extend (request, params));
        }
        const order = this.parseOrder (this.safeValue (response, 'result', {}));
        const id = this.safeString (order, 'id');
        if (id !== undefined) {
            this.orders[id] = order;
        }
        return this.extend ({ 'info': response }, order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        // There are two type of orders, so user must define which order to cancel
        // so why not ask user to point out in  which order to cancel ?
        let response = undefined;
        if ('stop_order_id' in params) {
            response = await this.privatePostStopOrderCancel (params);
        } else if ('order_id' in params) {
            response = await this.privatePostOrderCancel (params);
        } else {
            throw new ArgumentsRequired (this.id + " cancelOrder() requires additional argement either 'order_id' to cancel active order or 'stop_order_id' to cancel conditional order. Values of these arguments should be equal to value of 'id' argument.");
        }
        return this.parseOrder (this.safeValue (response, 'result', {}));
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'wallet_fund_type': 'Deposit',
        };
        if (since !== undefined) {
            request['start_date'] = this.ymd (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['code'];
        }
        const response = await this.privateGetWalletFundRecords (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        return this.parseTransactions (this.safeValue (result, 'data', []), currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['code'];
        }
        if (since !== undefined) {
            request['start_date'] = this.ymd (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetWalletWithdrawList (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        return this.parseTransactions (this.safeValue (result, 'data', []), currency, since, limit);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['start_date'] = this.ymd (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['code'];
        }
        const response = await this.privateGetWalletFundRecords (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    parseTrade (trade, market = undefined) {
        // My trades
        // {
        //     'result': {
        //         'order_id': '',   // always empty
        //         'trade_list': [{
        //             'closed_size': 0,                                // Closed size
        //             'cross_seq': 3154097,                            // CrossSeq
        //             'exec_fee': '-0.00000005',                       // Execution fee
        //             'exec_id': 'b3551383-19b1-4aa6-8ac2-f996bea6e07c', // Unique exec ID
        //             'exec_price': '4202',                              // Exec Price
        //             'exec_qty': 1,                                   // Exec Qty
        //             'exec_time': '1545203567',                       // Exec time
        //             'exec_type': 'Trade',                            // Exec type -- Trade: normal  Funding: funding  AdlTrade：ADL  BustTrade:  liquidation trade
        //             'exec_value': '0.00023798',                      // Exec value
        //             'fee_rate': '-0.00025',                          // Fee rate
        //             'last_liquidity_ind': 'AddedLiquidity',          // AddedLiquidity/RemovedLiquidity
        //             'leaves_qty': 0,                                 // Leave Qty
        //             'nth_fill': 7,                                   // Nth Fill
        //             'order_id': 'd854bb13-3fb9-4608-ade4-828f50210778', // Unique order ID
        //             'order_price': '4202',                           // Order's price
        //             'order_qty': 1,                                  // Order's qty
        //             'order_type': 'Limit',                           // Order's type
        //             'side': 'Sell',                                  // Side
        //             'symbol': 'BTCUSD',                              // Symbol
        //             'user_id': 155446                                // UserID
        //         }]
        //     },
        //     'time_now': '1551340186.761136'
        // }
        // Public trades
        // {
        //     "result": [
        //         {
        //             "id":7724919,                                   // ID
        //             "symbol": "BTCUSD",                             // contract type
        //             "price": 9499.5,                                // execution price
        //             "qty": 9500,                                    // execution quantity
        //             "side": "Buy",                                  // side
        //             "time": "2019-11-19T08:03:04.077Z",             // UTC time
        //         }
        //     ],
        //     "time_now": "1567109419.049271"
        // }
        let timestamp = this.safeTimestamp (trade, 'exec_time'); // defined for public trades
        let datetime = this.safeString (trade, 'time'); // defined for my trades
        if (timestamp === undefined) {
            timestamp = this.parse8601 (datetime);
        } else {
            datetime = this.iso8601 (timestamp);
        }
        const price = this.safeFloat2 (trade, 'exec_price', 'price');
        let amount = this.safeFloat (trade, 'exec_value'); // BTC/ETH/XRP/EOS
        const id = this.safeString2 (trade, 'cross_seq', 'id');
        const order = this.safeString (trade, 'order_id');
        const side = this.safeStringLower (trade, 'side');
        const cost = this.safeFloat2 (trade, 'exec_qty', 'qty');
        const execFee = this.safeFloat (trade, 'exec_fee');
        const feeRate = this.safeFloat (trade, 'fee_rate');
        let takerOrMaker = undefined;
        if (execFee !== undefined) {
            takerOrMaker = execFee < 0 ? 'maker' : 'taker';
        }
        let type = this.safeStringLower (trade, 'order_type');
        if (type !== 'limit' && type !== 'market') {
            type = undefined;
        }
        if (amount === undefined) {
            amount = cost / price;
        }
        let symbol = undefined;
        let base = undefined;
        let quote = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        } else {
            const marketId = this.safeValue (trade, 'Market');
            const [ baseId, quoteId] = marketId.split ('_');
            base = this.safeCurrencyCode (baseId);
            quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        }
        let fee = undefined;
        if (feeRate !== undefined) {
            const rate = feeRate > 0 ? feeRate : -feeRate;
            const currency = side === 'buy' ? base : quote;
            let feeCost = undefined;
            if (execFee !== undefined) {
                feeCost = execFee > 0 ? execFee : -execFee;
            } else {
                if (side === 'buy') {
                    feeCost = amount * rate;
                } else {
                    if (cost !== undefined) {
                        feeCost = cost * rate;
                    }
                }
            }
            fee = {
                'rate': rate,
                'cost': feeCost,
                'currency': currency,
            };
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'fee': fee,
        };
    }

    parseTransaction (transaction, currency = undefined) {
        // Get wallet fund records
        // {
        //   "ret_code": 0,                            //Error code 0 means success
        //   "ret_msg": "ok",                          //Error message
        //   "ext_code": "",
        //   "result": {
        //     "data": [{
        //       "id": 128495,                         //id
        //       "user_id": 103669,                    //user id
        //       "coin": "XRP",                        //coin type
        //       "wallet_id": 14760,                   //wallet id
        //       "type": "Realized P&L",               //funding type
        //       "amount": "1.18826225",
        //       "tx_id": "",
        //       "address": "XRPUSD",                  //address
        //       "wallet_balance": "999.12908894",     //balance
        //       "exec_time": "2019-09-25T00:00:15.000Z",
        //       "cross_seq": 0
        //     }]
        //   },
        //   "time_now": "1569395810.140869"
        // }
        // Get withdraw records
        // {
        //   "ret_code": 0,                                        //Error code 0 means success
        //   "ret_msg": "ok",                                      //error message
        //   "ext_code": "",
        //   "result": {
        //     "data": [{
        //       "id": 137,                                        //id
        //       "user_id": 160249,                                //user id
        //       "coin": "XRP",                                    //coin type
        //       "status": "Pending",                              //status
        //       "amount": "20.00000000",                          //amount
        //       "fee": "0.25000000",
        //       "address": "rH7H595XYEVTEHU2FySYsWnmfACBnZS9zM",
        //       "tx_id": "",
        //       "submited_at": "2019-06-11T02:20:24.000Z",
        //       "updated_at": "2019-06-11T02:20:24.000Z"
        //     }]
        //   },
        //   "ext_info": null,
        //   "time_now": "1570863984.536136"
        // }
        const id = this.safeString (transaction, 'id');
        // For deposits, transactTime == timestamp
        // For withdrawals, transactTime is submission, timestamp is processed
        const updated = this.parse8601 (this.safeString (transaction, 'updated_at'));
        const timestamp = this.parse8601 (this.safeString2 (transaction, 'submited_at', 'exec_time'));
        let type = this.safeStringLower (transaction, 'type');
        if (type === undefined) {
            type = 'withdrawal'; // privateGetWithdrawList has no `type`
        }
        type = this.parseTransactionType (type);
        // Deposits have no from address or to address, withdrawals have both
        let address = undefined;
        let addressFrom = undefined;
        let addressTo = undefined;
        if (type === 'withdrawal') {
            addressFrom = this.safeString (transaction, 'address');
            address = addressFrom;
        } else if (type === 'deposit') {
            addressTo = this.safeString (transaction, 'address');
            address = addressTo;
        }
        const amount = this.safeFloat (transaction, 'amount');
        const feeCost = this.safeFloat (transaction, 'fee');
        currency = this.safeString (transaction, 'coin');
        const fee = {
            'cost': feeCost,
            'currency': currency,
        };
        let status = this.safeString (transaction, 'status');
        if (status !== undefined) {
            status = this.parseTransactionStatus (status);
        }
        const txid = this.safeString2 (transaction, 'txid', 'tx_id');
        const tagTo = this.safeString (transaction, 'destination_tag');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': addressFrom,
            'address': address,
            'addressTo': addressTo,
            'tagFrom': undefined,
            'tag': tagTo,
            'tagTo': tagTo,
            'type': type,
            'amount': amount,
            'currency': currency,
            'status': status,
            'updated': updated,
            'comment': undefined,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'Cancelled': 'canceled',
            'Confirmation Email Expired': 'canceled',
            'Transferred successfully': 'ok',
            'Pending Email Confirmation': 'pending',
            'Pending Review': 'pending',
            'Pending Transfer': 'pending',
            'Processing': 'pending',
            'Rejected': 'rejected',
            'Fail': 'failed',
            'Pending': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (transType) {
        const transTypes = {
            'Deposit': 'deposit',
            'Withdraw': 'withdrawal',
            'withdraw': 'withdrawal',
        };
        return this.safeString (transTypes, transType, transType);
    }

    parseOrder (order) {
        const status = this.parseOrderStatus (this.safeString2 (order, 'order_status', 'stop_order_status'));
        const marketId = this.safeValue (order, 'symbol');
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            symbol = this.markets_by_id[marketId]['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        let lastTradeTimestamp = this.safeFloat (order, 'last_exec_time');
        if (lastTradeTimestamp !== undefined) {
            lastTradeTimestamp = this.truncate (lastTradeTimestamp * 1000, 0); // absent for conditional orders
        }
        const remaining = this.safeFloat (order, 'leaves_qty'); // leave amount in quote currency
        const price = this.safeFloat (order, 'price'); // float price in quote currency
        const amount = this.safeFloat (order, 'qty'); // ordered amount of base currency
        let filled = undefined;
        let cost = undefined; // filled * price
        if (remaining !== undefined) {
            filled = amount - remaining;
            cost = filled * price;
        }
        const id = this.safeString2 (order, 'order_id', 'stop_order_id');
        const type = this.safeStringLower (order, 'order_type');
        const side = this.safeStringLower (order, 'side');
        const feeCost = this.safeFloat (order, 'cum_exec_fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const market = this.market (symbol);
            fee = {
                'currency': market['quote'],
                'cost': feeCost,
            };
        }
        return {
            'info': order,
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
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
            'fee': fee,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'Created': 'open',
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'Cancelled': 'canceled',
            'Rejected': 'canceled',
            'Untriggered': 'open',
            'Triggered': 'open',
            'Active': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        if (marketId in this.markets_by_id) {
            symbol = this.markets_by_id[marketId]['symbol'];
        }
        const last = this.safeFloat (ticker, 'last_price');
        const percentage = this.safeFloat (ticker, 'price_24h_pcnt');
        let open = undefined;
        let change = undefined;
        let average = undefined;
        if (percentage !== -1) {
            open = last / this.sum (1, percentage);
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high_price_24h'),
            'low': this.safeFloat (ticker, 'low_price_24h'),
            'bid': this.safeFloat (ticker, 'bid_price'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask_price'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': this.safeFloat (ticker, 'prev_price_24h'), // previous day close
            'change': change,
            'percentage': percentage * 100,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'turnover_24h'),
            'quoteVolume': this.safeFloat (ticker, 'volume_24h'),
            'info': ticker,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeFloat (ohlcv, 'open_time'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '';
        let env = 'api';
        if (this.debug) {
            env = 'test';
        }
        url = this.urls[env][api] + '/' + path;
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        if ((api === 'private') || (api === 'wapi') || (path.indexOf ('private') >= 0)) {
            const query = this.extend ({
                'api_key': this.apiKey,
                'timestamp': this.nonce (),
                'recv_window': this.options['recvWindow'],
            }, params);
            const sortedQuery = {};
            const queryKeys = Object.keys (query);
            queryKeys.sort ();
            for (let i = 0; i < queryKeys.length; i++) {
                sortedQuery[queryKeys[i]] = query[queryKeys[i]];
            }
            let queryStr = this.rawencode (sortedQuery);
            const signature = this.hmac (queryStr, this.encode (this.secret));
            queryStr += '&' + 'sign=' + signature;
            url += '?' + queryStr;
        } else {
            if (Object.keys (params).length) {
                let queryStr = '';
                queryStr += '&' + this.urlencode (params);
                url += '?' + queryStr;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
        if (statusCode >= 500) {
            throw new ExchangeNotAvailable (this.id + ' ' + statusText);
        }
        const ret_code = this.safeValue (response, 'ret_code', -1);
        if (ret_code === 0) {
            return;
        }
        const message = this.safeValue (response, 'ret_msg', 'Unknown Error');
        const feedback = this.id + ' ' + message;
        this.throwExactlyMatchedException (this.exceptions, ret_code, feedback);
        throw new ExchangeError (this.id + ' ' + message);
    }
};
