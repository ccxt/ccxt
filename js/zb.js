'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, ExchangeError, ArgumentsRequired, AuthenticationError, InsufficientFunds, OrderNotFound, ExchangeNotAvailable, DDoSProtection, InvalidOrder, InvalidAddress } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class zb extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'zb',
            'name': 'ZB',
            'countries': [ 'CN' ],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'withdraw': true,
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
            'exceptions': {
                'exact': {
                    // '1000': 'Successful operation',
                    '1001': ExchangeError, // 'General error message',
                    '1002': ExchangeError, // 'Internal error',
                    '1003': AuthenticationError, // 'Verification does not pass',
                    '1004': AuthenticationError, // 'Funding security password lock',
                    '1005': AuthenticationError, // 'Funds security password is incorrect, please confirm and re-enter.',
                    '1006': AuthenticationError, // 'Real-name certification pending approval or audit does not pass',
                    '1009': ExchangeNotAvailable, // 'This interface is under maintenance',
                    '2001': InsufficientFunds, // 'Insufficient CNY Balance',
                    '2002': InsufficientFunds, // 'Insufficient BTC Balance',
                    '2003': InsufficientFunds, // 'Insufficient LTC Balance',
                    '2005': InsufficientFunds, // 'Insufficient ETH Balance',
                    '2006': InsufficientFunds, // 'Insufficient ETC Balance',
                    '2007': InsufficientFunds, // 'Insufficient BTS Balance',
                    '2009': InsufficientFunds, // 'Account balance is not enough',
                    '3001': OrderNotFound, // 'Pending orders not found',
                    '3002': InvalidOrder, // 'Invalid price',
                    '3003': InvalidOrder, // 'Invalid amount',
                    '3004': AuthenticationError, // 'User does not exist',
                    '3005': BadRequest, // 'Invalid parameter',
                    '3006': AuthenticationError, // 'Invalid IP or inconsistent with the bound IP',
                    '3007': AuthenticationError, // 'The request time has expired',
                    '3008': OrderNotFound, // 'Transaction records not found',
                    '3009': InvalidOrder, // 'The price exceeds the limit',
                    '3011': InvalidOrder, // 'The entrusted price is abnormal, please modify it and place order again',
                    '4001': ExchangeNotAvailable, // 'API interface is locked or not enabled',
                    '4002': DDoSProtection, // 'Request too often',
                },
                'broad': {
                    '提币地址有误，请先添加提币地址。': InvalidAddress, // {"code":1001,"message":"提币地址有误，请先添加提币地址。"}
                },
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg',
                'api': {
                    'public': 'http://api.zb.cn/data', // no https for public API
                    'private': 'https://trade.zb.cn/api',
                },
                'www': 'https://www.zb.com',
                'doc': 'https://www.zb.com/i/developer',
                'fees': 'https://www.zb.com/i/rate',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'ticker',
                        'allTicker',
                        'depth',
                        'trades',
                        'kline',
                    ],
                },
                'private': {
                    'get': [
                        // spot API
                        'order',
                        'cancelOrder',
                        'getOrder',
                        'getOrders',
                        'getOrdersNew',
                        'getOrdersIgnoreTradeType',
                        'getUnfinishedOrdersIgnoreTradeType',
                        'getAccountInfo',
                        'getUserAddress',
                        'getPayinAddress',
                        'getWithdrawAddress',
                        'getWithdrawRecord',
                        'getChargeRecord',
                        'getCnyWithdrawRecord',
                        'getCnyChargeRecord',
                        'withdraw',
                        // leverage API
                        'getLeverAssetsInfo',
                        'getLeverBills',
                        'transferInLever',
                        'transferOutLever',
                        'loan',
                        'cancelLoan',
                        'getLoans',
                        'getLoanRecords',
                        'borrow',
                        'repay',
                        'getRepayments',
                    ],
                },
            },
            'fees': {
                'funding': {
                    'withdraw': {
                        'BTC': 0.0001,
                        'BCH': 0.0006,
                        'LTC': 0.005,
                        'ETH': 0.01,
                        'ETC': 0.01,
                        'BTS': 3,
                        'EOS': 1,
                        'QTUM': 0.01,
                        'HSR': 0.001,
                        'XRP': 0.1,
                        'USDT': '0.1%',
                        'QCASH': 5,
                        'DASH': 0.002,
                        'BCD': 0,
                        'UBTC': 0,
                        'SBTC': 0,
                        'INK': 20,
                        'TV': 0.1,
                        'BTH': 0,
                        'BCX': 0,
                        'LBTC': 0,
                        'CHAT': 20,
                        'bitCNY': 20,
                        'HLC': 20,
                        'BTP': 0,
                        'BCW': 0,
                    },
                },
                'trading': {
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'commonCurrencies': {
                'ENT': 'ENTCash',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetMarkets (params);
        const keys = Object.keys (markets);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amountScale'),
                'price': this.safeInteger (market, 'priceScale'),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': true,
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
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetGetAccountInfo (params);
        // todo: use this somehow
        // let permissions = response['result']['base'];
        const balances = this.safeValue (response['result'], 'coins');
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            //     {        enName: "BTC",
            //               freez: "0.00000000",
            //         unitDecimal:  8, // always 8
            //              cnName: "BTC",
            //       isCanRecharge:  true, // TODO: should use this
            //             unitTag: "฿",
            //       isCanWithdraw:  true,  // TODO: should use this
            //           available: "0.00000000",
            //                 key: "btc"         }
            const account = this.account ();
            const currencyId = this.safeString (balance, 'key');
            const code = this.safeCurrencyCode (currencyId);
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'freez');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        // fetchDepositAddress
        //
        //     {
        //         "key": "0x0af7f36b8f09410f3df62c81e5846da673d4d9a9"
        //     }
        //
        // fetchDepositAddresses
        //
        //     {
        //         "blockChain": "btc",
        //         "isUseMemo": false,
        //         "address": "1LL5ati6pXHZnTGzHSA3rWdqi4mGGXudwM",
        //         "canWithdraw": true,
        //         "canDeposit": true
        //     }
        //     {
        //         "blockChain": "bts",
        //         "isUseMemo": true,
        //         "account": "btstest",
        //         "memo": "123",
        //         "canWithdraw": true,
        //         "canDeposit": true
        //     }
        //
        let address = this.safeString (depositAddress, 'key');
        let tag = undefined;
        const memo = this.safeString (depositAddress, 'memo');
        if (memo !== undefined) {
            tag = memo;
        } else if (address.indexOf ('_') >= 0) {
            const parts = address.split ('_');
            address = parts[0];  // WARNING: MAY BE tag_address INSTEAD OF address_tag FOR SOME CURRENCIES!!
            tag = parts[1];
        }
        const currencyId = this.safeString (depositAddress, 'blockChain');
        const code = this.safeCurrencyCode (currencyId, currency);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': depositAddress,
        };
    }

    parseDepositAddresses (addresses, codes = undefined) {
        let result = [];
        for (let i = 0; i < addresses.length; i++) {
            const address = this.parseDepositAddress (addresses[i]);
            result.push (address);
        }
        if (codes) {
            result = this.filterByArray (result, 'currency', codes);
        }
        return this.indexBy (result, 'currency');
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetGetPayinAddress (params);
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": [
        //                 {
        //                     "blockChain": "btc",
        //                     "isUseMemo": false,
        //                     "address": "1LL5ati6pXHZnTGzHSA3rWdqi4mGGXudwM",
        //                     "canWithdraw": true,
        //                     "canDeposit": true
        //                 },
        //                 {
        //                     "blockChain": "bts",
        //                     "isUseMemo": true,
        //                     "account": "btstest",
        //                     "memo": "123",
        //                     "canWithdraw": true,
        //                     "canDeposit": true
        //                 },
        //             ]
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', []);
        return this.parseDepositAddresses (datas, codes);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetGetUserAddress (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": {
        //                 "key": "0x0af7f36b8f09410f3df62c81e5846da673d4d9a9"
        //             }
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', {});
        return this.parseDepositAddress (datas, currency);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetAllTicker (params);
        const result = {};
        const anotherMarketsById = {};
        const marketIds = Object.keys (this.marketsById);
        for (let i = 0; i < marketIds.length; i++) {
            const tickerId = marketIds[i].replace ('_', '');
            anotherMarketsById[tickerId] = this.marketsById[marketIds[i]];
        }
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const market = anotherMarketsById[ids[i]];
            result[market['symbol']] = this.parseTicker (response[ids[i]], market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const ticker = response['ticker'];
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
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
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 1000;
        }
        const request = {
            'market': market['id'],
            'type': this.timeframes[timeframe],
            'limit': limit,
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.publicGetKline (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'date');
        let side = this.safeString (trade, 'trade_type');
        side = (side === 'bid') ? 'buy' : 'sell';
        const id = this.safeString (trade, 'tid');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
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
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
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

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new InvalidOrder (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const request = {
            'price': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
            'tradeType': (side === 'buy') ? '1' : '0',
            'currency': this.marketId (symbol),
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id.toString (),
            'currency': this.marketId (symbol),
        };
        return await this.privateGetCancelOrder (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            'id': id.toString (),
            'currency': this.marketId (symbol),
        };
        const response = await this.privateGetGetOrder (this.extend (request, params));
        //
        //     {
        //         'total_amount': 0.01,
        //         'id': '20180910244276459',
        //         'price': 180.0,
        //         'trade_date': 1536576744960,
        //         'status': 2,
        //         'trade_money': '1.96742',
        //         'trade_amount': 0.01,
        //         'type': 0,
        //         'currency': 'eth_usdt'
        //     }
        //
        return this.parseOrder (response, undefined);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'pageIndex': 1, // default pageIndex is 1
            'pageSize': limit, // default pageSize is 50
        };
        let method = 'privateGetGetOrdersIgnoreTradeType';
        // tradeType 交易类型1/0[buy/sell]
        if ('tradeType' in params) {
            method = 'privateGetGetOrdersNew';
        }
        let response = undefined;
        try {
            response = await this[method] (this.extend (request, params));
        } catch (e) {
            if (e instanceof OrderNotFound) {
                return [];
            }
            throw e;
        }
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 10, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'pageIndex': 1, // default pageIndex is 1
            'pageSize': limit, // default pageSize is 10
        };
        let method = 'privateGetGetUnfinishedOrdersIgnoreTradeType';
        // tradeType 交易类型1/0[buy/sell]
        if ('tradeType' in params) {
            method = 'privateGetGetOrdersNew';
        }
        let response = undefined;
        try {
            response = await this[method] (this.extend (request, params));
        } catch (e) {
            if (e instanceof OrderNotFound) {
                return [];
            }
            throw e;
        }
        return this.parseOrders (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrder
        //
        //     {
        //         'total_amount': 0.01,
        //         'id': '20180910244276459',
        //         'price': 180.0,
        //         'trade_date': 1536576744960,
        //         'status': 2,
        //         'trade_money': '1.96742',
        //         'trade_amount': 0.01,
        //         'type': 0,
        //         'currency': 'eth_usdt'
        //     }
        //
        let side = this.safeInteger (order, 'type');
        side = (side === 1) ? 'buy' : 'sell';
        const type = 'limit'; // market order is not availalbe in ZB
        const timestamp = this.safeInteger (order, 'trade_date');
        const marketId = this.safeString (order, 'currency');
        const symbol = this.safeSymbol (marketId, market, '_');
        const price = this.safeFloat (order, 'price');
        const filled = this.safeFloat (order, 'trade_amount');
        const amount = this.safeFloat (order, 'total_amount');
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = amount - filled;
            }
        }
        const cost = this.safeFloat (order, 'trade_money');
        let average = undefined;
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        if ((cost !== undefined) && (filled !== undefined) && (filled > 0)) {
            average = cost / filled;
        }
        const id = this.safeString (order, 'id');
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'canceled',
            '2': 'closed',
            '3': 'open', // partial
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionStatus (status) {
        const statuses = {
            '0': 'pending', // submitted, pending confirmation
            '1': 'failed',
            '2': 'ok',
            '3': 'canceled',
            '5': 'ok', // confirmed
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "code": 1000,
        //         "message": "success",
        //         "id": "withdrawalId"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "amount": 0.01,
        //         "fees": 0.001,
        //         "id": 2016042556231,
        //         "manageTime": 1461579340000,
        //         "status": 3,
        //         "submitTime": 1461579288000,
        //         "toAddress": "14fxEPirL9fyfw1i9EF439Pq6gQ5xijUmp",
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "address": "1FKN1DZqCm8HaTujDioRL2Aezdh7Qj7xxx",
        //         "amount": "1.00000000",
        //         "confirmTimes": 1,
        //         "currency": "BTC",
        //         "description": "Successfully Confirm",
        //         "hash": "7ce842de187c379abafadd64a5fe66c5c61c8a21fb04edff9532234a1dae6xxx",
        //         "id": 558,
        //         "itransfer": 1,
        //         "status": 2,
        //         "submit_time": "2016-12-07 18:51:57",
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'hash');
        const amount = this.safeFloat (transaction, 'amount');
        let timestamp = this.parse8601 (this.safeString (transaction, 'submit_time'));
        timestamp = this.safeInteger (transaction, 'submitTime', timestamp);
        let address = this.safeString2 (transaction, 'toAddress', 'address');
        let tag = undefined;
        if (address !== undefined) {
            const parts = address.split ('_');
            address = this.safeString (parts, 0);
            tag = this.safeString (parts, 1);
        }
        const confirmTimes = this.safeInteger (transaction, 'confirmTimes');
        const updated = this.safeInteger (transaction, 'manageTime');
        let type = undefined;
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        if (address !== undefined) {
            type = (confirmTimes === undefined) ? 'withdrawal' : 'deposit';
        }
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        let fee = undefined;
        const feeCost = this.safeFloat (transaction, 'fees');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': undefined,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        const password = this.safeString (params, 'safePwd', this.password);
        if (password === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires exchange.password or a safePwd parameter');
        }
        const fees = this.safeFloat (params, 'fees');
        if (fees === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a fees parameter');
        }
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag !== undefined) {
            address += '_' + tag;
        }
        const request = {
            'amount': this.currencyToPrecision (code, amount),
            'currency': currency['id'],
            'fees': this.currencyToPrecision (code, fees),
            // 'itransfer': 0, // agree for an internal transfer, 0 disagree, 1 agree, the default is to disagree
            'method': 'withdraw',
            'receiveAddr': address,
            'safePwd': password,
        };
        const response = await this.privateGetWithdraw (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": "success",
        //         "id": "withdrawalId"
        //     }
        //
        const transaction = this.parseTransaction (response, currency);
        return this.extend (transaction, {
            'type': 'withdrawal',
            'address': address,
            'addressTo': address,
            'amount': amount,
        });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'],
            // 'pageIndex': 1,
            // 'pageSize': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetGetWithdrawRecord (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": {
        //                 "list": [
        //                     {
        //                         "amount": 0.01,
        //                         "fees": 0.001,
        //                         "id": 2016042556231,
        //                         "manageTime": 1461579340000,
        //                         "status": 3,
        //                         "submitTime": 1461579288000,
        //                         "toAddress": "14fxEPirL9fyfw1i9EF439Pq6gQ5xijUmp",
        //                     },
        //                 ],
        //                 "pageIndex": 1,
        //                 "pageSize": 10,
        //                 "totalCount": 4,
        //                 "totalPage": 1
        //             }
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', {});
        const withdrawals = this.safeValue (datas, 'list', []);
        return this.parseTransactions (withdrawals, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'],
            // 'pageIndex': 1,
            // 'pageSize': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetGetChargeRecord (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": {
        //                 "list": [
        //                     {
        //                         "address": "1FKN1DZqCm8HaTujDioRL2Aezdh7Qj7xxx",
        //                         "amount": "1.00000000",
        //                         "confirmTimes": 1,
        //                         "currency": "BTC",
        //                         "description": "Successfully Confirm",
        //                         "hash": "7ce842de187c379abafadd64a5fe66c5c61c8a21fb04edff9532234a1dae6xxx",
        //                         "id": 558,
        //                         "itransfer": 1,
        //                         "status": 2,
        //                         "submit_time": "2016-12-07 18:51:57",
        //                     },
        //                 ],
        //                 "pageIndex": 1,
        //                 "pageSize": 10,
        //                 "total": 8
        //             }
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', {});
        const deposits = this.safeValue (datas, 'list', []);
        return this.parseTransactions (deposits, currency, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'public') {
            url += '/' + this.version + '/' + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            let query = this.keysort (this.extend ({
                'method': path,
                'accesskey': this.apiKey,
            }, params));
            const nonce = this.nonce ();
            query = this.keysort (query);
            const auth = this.rawencode (query);
            const secret = this.hash (this.encode (this.secret), 'sha1');
            const signature = this.hmac (this.encode (auth), this.encode (secret), 'md5');
            const suffix = 'sign=' + signature + '&reqTime=' + nonce.toString ();
            url += '/' + path + '?' + auth + '&' + suffix;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if (body[0] === '{') {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            if ('code' in response) {
                const code = this.safeString (response, 'code');
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                if (code !== '1000') {
                    throw new ExchangeError (feedback);
                }
            }
            // special case for {"result":false,"message":"服务端忙碌"} (a "Busy Server" reply)
            const result = this.safeValue (response, 'result');
            if (result !== undefined) {
                if (!result) {
                    const message = this.safeString (response, 'message');
                    if (message === '服务端忙碌') {
                        throw new ExchangeNotAvailable (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
    }
};
