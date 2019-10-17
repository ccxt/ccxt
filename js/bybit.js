'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, OrderNotFound, InvalidOrder, InvalidNonce, AuthenticationError } = require ('./base/errors');

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
                'fetchTrades': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': false,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': false,
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
                '10010': AuthenticationError, // ip mismatch
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async loadServerTimeDifference () {
        const response = await this.v2GetPublicTime ();
        const after = this.milliseconds ();
        const serverTime = parseInt (response['time_now']) * 1000;
        this.options['timeDifference'] = parseInt (after - serverTime);
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
        return this.parseTicker (response['result'][0]);
    }

    async fetchTickers (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.v2GetPublicTickers ();
        return this.parseTickers (response['result']);
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
            request['startTime'] = this.safeInteger (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v2GetPrivateExecutionList (this.extend (request, params));
        return this.parseTrades (this.safeValue (response['result'], 'trade_list', []), market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v2GetPublicOrderBookL2 (this.extend (request, params));
        const result = {
            'bids': [],
            'asks': [],
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
        const data = this.safeValue (response, 'result', []);
        for (let i = 0; i < data.length; i++) {
            const order = data[i];
            const side = (order['side'] === 'Sell') ? 'asks' : 'bids';
            const amount = this.safeFloat (order, 'size');
            const price = this.safeFloat (order, 'price');
            if (price !== undefined) {
                result[side].push ([ price, amount ]);
            }
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.wapiGetPositionList (this.extend (request, params));
        const retData = response['result'];
        const result = { 'info': retData };
        for (let i = 0; i < retData.length; i++) {
            const position = retData[i];
            const symbol = this.safeString (position, 'symbol');
            const currencyId = this.convertSymbolToCurrency (symbol);
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
        return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const filter = {
            'order_id': id,
        };
        const response = await this.fetchOrders (symbol, undefined, undefined, this.deepExtend (filter, params));
        const numResults = response.length;
        if (numResults === 1) {
            return response[0];
        }
        throw new OrderNotFound (this.id + ': The order ' + id + ' not found.');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const openStatusesPairs = this.orderStatuses ('open');
        const openStatusKeys = Object.keys (openStatusesPairs);
        let request = {
            'order_status': openStatusKeys.join (','),
        };
        if (params !== undefined) {
            request = this.deepExtend (params, request);
        }
        return await this.fetchOrders (symbol, since, limit, request);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        request = this.deepExtend (request, params);
        const response = await this.privateGetOrderList (request);
        return this.parseOrders (this.safeValue (response['result'], 'data', []), market, since, limit);
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
        let response = undefined;
        if (('stop_px' in params) && ('base_price' in params)) {
            response = await this.privatePostStopOrderCreate (this.extend (request, params));
        } else {
            response = await this.privatePostOrderCreate (this.extend (request, params));
        }
        const order = this.parseOrder (response['result']);
        const id = this.safeString (order, 'order_id');
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        let response = undefined;
        if ('stop_px' in params) {
            response = await this.privatePostStopOrderCancel (this.extend (request, params));
        } else {
            response = await this.privatePostOrderCancel (this.extend (request, params));
        }
        return this.parseOrder (response['result']);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        let request = {
            'wallet_fund_type': 'Deposit',
        };
        if (params !== undefined) {
            request = this.deepExtend (params, request);
        }
        return this.fetchFundRecords (code, since, limit, request);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency;
        }
        if (since !== undefined) {
            request['start_date'] = this.ymd (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const reqParams = this.extend (request, params);
        const response = await this.privateGetWalletWithdrawList (reqParams);
        return this.parseTransactions (this.safeValue (response['result'], 'data', []), currency, since, limit);
    }

    async fetchFundRecords (code = undefined, since = undefined, limit = undefined, params = {}) {
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
            request['coin'] = currency;
        }
        const reqParams = this.extend (request, params);
        const response = await this.privateGetWalletFundRecords (reqParams);
        const transactions = this.filterByArray (this.safeValue (response['result'], 'data', []), 'type', ['Withdraw', 'Deposit'], false);
        return this.parseTransactions (transactions, currency, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'exec_time');
        const price = this.safeFloat (trade, 'exec_price'); // USD
        const amount = this.safeFloat (trade, 'exec_value'); // BTC/ETH/XRP/EOS
        const id = this.safeString (trade, 'cross_seq');
        const order = this.safeString (trade, 'order_id');
        const side = this.safeStringLower (trade, 'side');
        const cost = this.safeFloat (trade, 'exec_qty');
        const execFee = this.safeFloat (trade, 'exec_fee');
        const feeRate = this.safeFloat (trade, 'fee_rate');
        let symbol = undefined;
        const marketId = this.safeString (trade, 'symbol');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = marketId;
            }
        }
        const fee = {
            'cost': execFee,
            'currency': this.convertSymbolToCurrency (symbol),
            'rate': feeRate,
        };
        const takerOrMaker = fee['cost'] < 0 ? 'maker' : 'taker';
        const type = this.safeStringLower (trade, 'order_type');
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
        const id = this.safeString (transaction, 'id');
        // For deposits, transactTime == timestamp
        // For withdrawals, transactTime is submission, timestamp is processed
        const timestamp = this.parse8601 (this.safeString (transaction, 'updated_at'));
        let transactTime = this.parse8601 (this.safeString (transaction, 'submited_at'));
        const exec_time = this.safeString (transaction, 'exec_time'); // used for fetchFundRecords
        if (exec_time !== undefined) {
            transactTime = this.parse8601 (exec_time);
        }
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
            'timestamp': transactTime,
            'datetime': this.iso8601 (transactTime),
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
            'updated': timestamp,
            'comment': undefined,
            'fee': fee,
        };
    }

    convertSymbolToCurrency (symbol) {
        const symbolToCurrency = {
            'BTCUSD': 'BTC',
            'ETHUSD': 'ETH',
            'XRPUSD': 'XRP',
            'EOSUSD': 'EOS',
        };
        return this.safeString (symbolToCurrency, symbol, symbol);
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
        const symbol = this.findSymbol (this.safeString (order, 'symbol'));
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const lastTradeTimestamp = this.truncate (this.safeFloat (order, 'last_exec_time') * 1000, 0);
        const qty = this.safeFloat (order, 'qty'); // ordered amount in quote currency
        const leaveQty = this.safeFloat (order, 'leaves_qty'); // leave amount in quote currency
        const price = this.safeFloat (order, 'price'); // float price in quote currency
        const amount = undefined; // ordered amount of base currency
        const filled = this.safeFloat (order, 'cum_exec_value'); // filled amount of base currency, not return while place order
        const remaining = this.safeFloat (order, 'leaves_value'); // leaves_value
        const cost = qty - leaveQty; // filled * price
        let average = undefined;
        if (cost !== undefined) {
            if (filled) {
                average = cost / filled;
            }
        }
        const id = this.safeString2 (order, 'order_id', 'stop_order_id');
        const type = this.safeStringLower (order, 'order_type');
        const side = this.safeStringLower (order, 'side');
        const trades = undefined;
        const fee = undefined; // fy_todo {"currency":"xx", "cost":xx, "rate":xx} `cum_exec_fee` not return now
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
            'average': average,
            'trades': trades,
            'fee': fee,
        };
    }

    parseOrderStatus (status) {
        const statuses = this.orderStatuses ();
        return this.safeString (statuses, status, status);
    }

    orderStatuses (filter = undefined) {
        const statuses = {
            'Created': 'created',
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'Cancelled': 'canceled',
            'Rejected': 'rejected',
            'Untriggered': 'open',
            'Triggered': 'open',
            'Active': 'open',
        };
        if (filter === undefined) {
            return statuses;
        } else {
            const ret = {};
            const statusKeys = Object.keys (statuses);
            for (let i = 0; i < statusKeys.length; i++) {
                if (statuses[statusKeys[i]] === filter) {
                    ret[statusKeys[i]] = statuses[statusKeys[i]];
                }
            }
            return ret;
        }
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'close_time');
        const symbol = this.findSymbol (this.safeString (ticker, 'symbol'), market);
        const last = this.safeFloat (ticker, 'last_price');
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
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': this.safeFloat (ticker, 'prev_price_24h'), // previous day close
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'price_24h_pcnt'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'turnover_24h'),
            'quoteVolume': this.safeFloat (ticker, 'volume_24h'),
            'info': ticker,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv['open_time'],
            parseFloat (ohlcv['open']),
            parseFloat (ohlcv['high']),
            parseFloat (ohlcv['low']),
            parseFloat (ohlcv['close']),
            parseFloat (ohlcv['volume']),
        ];
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if ('ret_code' in response) {
            if (response['ret_code'] === 0) {
                return response;
            }
        }
        throw new ExchangeError (this.id + ' ' + this.json (response));
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
        const exceptions = this.exceptions;
        if (ret_code in exceptions) {
            const ExceptionClass = exceptions[ret_code];
            throw new ExceptionClass (this.id + ' ' + this.json (response));
        }
    }
};
