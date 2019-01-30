'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, AccountSuspended, InvalidNonce, DDoSProtection, NotSupported, BadRequest, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class kucoin2 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kucoin2',
            'name': 'KuCoin',
            'countries': [ 'SC' ],
            'rateLimit': 334,
            'version': 'v2',
            'certified': true,
            'comment': 'Platform 2.0',
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTicker': true,
                'fetchOrderBook': true,
                'fetchOrder': true,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
                'fetchDepositAddress': true,
                'withdraw': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchBalance': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchAccounts': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/51909432-b0a72780-23dd-11e9-99ba-73d23c8d4eed.jpg',
                'referral': 'https://www.kucoin.com/?r=E5wkqe',
                'api': {
                    'public': 'https://openapi-v2.kucoin.com',
                    'private': 'https://openapi-v2.kucoin.com',
                },
                'test': {
                    'public': 'https://openapi-sandbox.kucoin.com',
                    'private': 'https://openapi-sandbox.kucoin.com',
                },
                'www': 'https://www.kucoin.com',
                'doc': [
                    'https://docs.kucoin.com',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'api': {
                'public': {
                    'get': [
                        'timestamp',
                        'symbols',
                        'market/orderbook/level{level}',
                        'market/histories',
                        'market/candles',
                        'market/stats',
                        'currencies',
                        'currencies/{currency}',
                    ],
                    'post': [
                        'bullet-public',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'accounts/{accountId}',
                        'accounts/{accountId}/ledgers',
                        'accounts/{accountId}/holds',
                        'deposit-addresses',
                        'deposits',
                        'withdrawals',
                        'withdrawals/quotas',
                        'orders',
                        'orders/{orderId}',
                        'fills',
                    ],
                    'post': [
                        'accounts',
                        'accounts/inner-transfer',
                        'deposit-addresses',
                        'withdrawals',
                        'orders',
                        'bullet-private',
                    ],
                    'delete': [
                        'withdrawals/{withdrawalId}',
                        'orders/{orderId}',
                    ],
                },
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
                '8h': '8hour',
                '12h': '12hour',
                '1d': '1day',
                '1w': '1week',
            },
            'exceptions': {
                '400': BadRequest,
                '401': AuthenticationError,
                '403': NotSupported,
                '404': NotSupported,
                '405': NotSupported,
                '429': DDoSProtection,
                '500': ExchangeError,
                '503': ExchangeNotAvailable,
                '200004': InsufficientFunds,
                '300000': InvalidOrder,
                '400001': AuthenticationError,
                '400002': InvalidNonce,
                '400003': AuthenticationError,
                '400004': AuthenticationError,
                '400005': AuthenticationError,
                '400006': AuthenticationError,
                '400007': AuthenticationError,
                '400008': NotSupported,
                '400100': ArgumentsRequired,
                '411100': AccountSuspended,
                '500000': ExchangeError,
                'order_not_exist': OrderNotFound,  // {"code":"order_not_exist","msg":"order_not_exist"} ¯\_(ツ)_/¯
            },
            'options': {
                'version': 'v1',
                'symbolSeparator': '-',
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    async loadTimeDifference () {
        const response = await this.publicGetTimestamp ();
        const after = this.milliseconds ();
        const kucoinTime = this.safeInteger (response, 'data');
        this.options['timeDifference'] = parseInt (after - kucoinTime);
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetSymbols (params);
        //
        // { quoteCurrency: 'BTC',
        //   symbol: 'KCS-BTC',
        //   quoteMaxSize: '9999999',
        //   quoteIncrement: '0.000001',
        //   baseMinSize: '0.01',
        //   quoteMinSize: '0.00001',
        //   enableTrading: true,
        //   priceIncrement: '0.00000001',
        //   name: 'KCS-BTC',
        //   baseIncrement: '0.01',
        //   baseMaxSize: '9999999',
        //   baseCurrency: 'KCS' }
        //
        const responseData = response['data'];
        let result = {};
        for (let i = 0; i < responseData.length; i++) {
            const entry = responseData[i];
            const id = entry['name'];
            const baseId = entry['baseCurrency'];
            const quoteId = entry['quoteCurrency'];
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = entry['enableTrading'];
            const baseMax = this.safeFloat (entry, 'baseMaxSize');
            const baseMin = this.safeFloat (entry, 'baseMinSize');
            const quoteMax = this.safeFloat (entry, 'quoteMaxSize');
            const quoteMin = this.safeFloat (entry, 'quoteMinSize');
            const priceIncrement = this.safeFloat (entry, 'priceIncrement');
            const precision = {
                'amount': -Math.log10 (this.safeFloat (entry, 'quoteIncrement')),
                'price': -Math.log10 (priceIncrement),
            };
            const limits = {
                'amount': {
                    'min': quoteMin,
                    'max': quoteMax,
                },
                'price': {
                    'min': Math.max (baseMin / quoteMax, priceIncrement),
                    'max': baseMax / quoteMin,
                },
            };
            result[symbol] = {
                'id': id,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': entry,
            };
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        //
        // { precision: 10,
        //   name: 'KCS',
        //   fullName: 'KCS shares',
        //   currency: 'KCS' }
        //
        const responseData = response['data'];
        let result = {};
        for (let i = 0; i < responseData.length; i++) {
            const entry = responseData[i];
            const id = this.safeString (entry, 'name');
            const name = entry['fullName'];
            const code = this.commonCurrencyCode (id);
            const precision = this.safeInteger (entry, 'precision');
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': precision,
                'info': entry,
            };
        }
        return result;
    }

    async fetchAccounts (params = {}) {
        const response = await this.privateGetAccounts (params);
        const responseData = response['data'];
        let result = {};
        for (let i = 0; i < responseData.length; i++) {
            const entry = responseData[i];
            const accountId = entry['type'];
            result[accountId] = {
                'accountId': accountId,
                'type': accountId, // main or trade
                'currency': undefined,
                'info': entry,
            };
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol": "ETH-BTC",
        //         "high": "0.1",
        //         "vol": "3891.5909166",
        //         "low": "0.024",
        //         "changePrice": "0.031809",
        //         "changeRate": "31809",
        //         "close": "0.03181",
        //         "volValue": "119.5545894397034",
        //         "open": "0.000001",
        //     }
        //
        const change = this.safeFloat (ticker, 'changePrice');
        const percentage = this.safeFloat (ticker, 'changeRate');
        const open = this.safeFloat (ticker, 'open');
        const last = this.safeFloat (ticker, 'close');
        const high = this.safeFloat (ticker, 'high');
        const low = this.safeFloat (ticker, 'low');
        const baseVolume = this.safeFloat (ticker, 'vol');
        const quoteVolume = this.safeFloat (ticker, 'volValue');
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketStats (this.extend (request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "symbol": "ETH-BTC",
        //             "high": "0.1",
        //             "vol": "3891.5909166",
        //             "low": "0.024",
        //             "changePrice": "0.031809",
        //             "changeRate": "31809",
        //             "close": "0.03181",
        //             "volValue": "119.5545894397034",
        //             "open": "0.000001",
        //         },
        //     }
        //
        return this.parseTicker (response['data'], market);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        //
        //   [ [ "1545904980",             //Start time of the candle cycle
        //       "0.058",                  //opening price
        //       "0.049",                  //closing price
        //       "0.058",                  //highest price
        //       "0.049",                  //lowest price
        //       "0.018",                  //Transaction amount
        //       "0.000945" ], ... ]       //Transaction volume
        //
        const timestamp = this.safeInteger (ohlcv, 0);
        const open = this.safeFloat (ohlcv, 1);
        const close = this.safeFloat (ohlcv, 2);
        const high = this.safeFloat (ohlcv, 3);
        const low = this.safeFloat (ohlcv, 4);
        const volume = this.safeFloat (ohlcv, 6);
        return [timestamp, open, high, low, close, volume];
    }

    async fetchOHLCV (symbol, timeframe = '15m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        let request = {
            'symbol': marketId,
            'endAt': this.seconds (), // required param
            'type': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['startAt'] = Math.floor (since / 1000);
        }
        const response = await this.publicGetMarketCandles (this.extend (request, params));
        const responseData = response['data'];
        return this.parseOHLCVs (responseData, market, timeframe, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currencyId = this.currencyId (code);
        const request = { 'currency': currencyId };
        const response = await this.privateGetDepositAddresses (this.extend (request, params));
        const address = this.safeString (response, 'address');
        const memo = this.safeString (response, 'memo');
        return {
            'address': address,
            'tag': memo,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = { 'symbol': marketId, 'level': 3 };
        const response = await this.publicGetMarketOrderbookLevelLevel (this.extend (request, params));
        //
        // { sequence: '1547731421688',
        //   asks: [ [ '5c419328ef83c75456bd615c', '0.9', '0.09' ], ... ],
        //   bids: [ [ '5c419328ef83c75456bd615c', '0.9', '0.09' ], ... ], }
        //
        const responseData = response['data'];
        const timestamp = this.safeInteger (responseData, 'sequence');
        return this.parseOrderBook (responseData, timestamp, 'bids', 'asks', 1, 2);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        // required param, cannot be used twice
        const clientOid = this.uuid ();
        const request = {
            'clientOid': clientOid,
            'price': price,
            'side': side,
            'size': amount,
            'symbol': marketId,
            'type': type,
        };
        const response = await this.privatePostOrders (this.extend (request, params));
        const responseData = response['data'];
        return {
            'id': responseData['orderId'],
            'symbol': symbol,
            'type': type,
            'side': side,
            'status': 'open',
            'clientOid': clientOid,
            'info': responseData,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = { 'orderId': id };
        const response = this.privateDeleteOrdersOrderId (this.extend (request, params));
        return response;
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'status': status,
        };
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        const responseData = response['data'];
        const orders = responseData['items'];
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByStatus ('done', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByStatus ('active', symbol, since, limit, params);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const request = {
            'orderId': id,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privateGetOrdersOrderId (this.extend (request, params));
        const responseData = response['data'];
        return this.parseOrder (responseData, market);
    }

    parseSymbol (id) {
        let [ quote, base ] = id.split (this.options['symbolSeparator']);
        base = this.commonCurrencyCode (base);
        quote = this.commonCurrencyCode (quote);
        return base + '/' + quote;
    }

    parseOrder (order, market = undefined) {
        //
        //   { "id": "5c35c02703aa673ceec2a168",
        //     "symbol": "BTC-USDT",
        //     "opType": "DEAL",
        //     "type": "limit",
        //     "side": "buy",
        //     "price": "10",
        //     "size": "2",
        //     "funds": "0",
        //     "dealFunds": "0.166",
        //     "dealSize": "2",
        //     "fee": "0",
        //     "feeCurrency": "USDT",
        //     "stp": "",
        //     "stop": "",
        //     "stopTriggered": false,
        //     "stopPrice": "0",
        //     "timeInForce": "GTC",
        //     "postOnly": false,
        //     "hidden": false,
        //     "iceberge": false,
        //     "visibleSize": "0",
        //     "cancelAfter": 0,
        //     "channel": "IOS",
        //     "clientOid": "",
        //     "remark": "",
        //     "tags": "",
        //     "isActive": false,
        //     "cancelExist": false,
        //     "createdAt": 1547026471000 }
        //
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            const marketId = this.safeString (order, 'symbol');
            if (marketId !== undefined) {
                symbol = this.parseSymbol (marketId);
            }
        }
        const orderId = this.safeString (order, 'id');
        const type = this.safeString (order, 'type');
        const timestamp = this.safeString (order, 'createdAt');
        const datetime = this.iso8601 (timestamp);
        const price = this.safeFloat (order, 'price');
        const side = this.safeString (order, 'side');
        const feeCurrency = this.safeString (order, 'feeCurrency');
        const fee = this.safeFloat (order, 'fee');
        const amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat (order, 'dealSize');
        const remaining = amount - filled;
        // bool
        const status = order['isActive'] ? 'open' : 'closed';
        let fees = {
            'currency': feeCurrency,
            'cost': fee,
        };
        return {
            'id': orderId,
            'symbol': symbol,
            'type': type,
            'side': side,
            'amount': amount,
            'price': price,
            'filled': filled,
            'remaining': remaining,
            'timestamp': timestamp,
            'datetime': datetime,
            'fee': fees,
            'status': status,
            'info': order,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        let request = {
            'symbol': marketId,
        };
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetFills (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'items', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startAt'] = Math.floor (since / 1000);
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.publicGetMarketHistories (this.extend (request, params));
        //     {
        //         "code": "200000",
        //         "data": [
        //             {
        //                 "sequence": "1548764654235",
        //                 "side": "sell",
        //                 "size":"0.6841354",
        //                 "price":"0.03202",
        //                 "time":1548848575203567174
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "sequence": "1548764654235",
        //         "side": "sell",
        //         "size":"0.6841354",
        //         "price":"0.03202",
        //         "time":1548848575203567174
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "symbol":"BTC-USDT",
        //         "tradeId":"5c35c02709e4f67d5266954e",
        //         "orderId":"5c35c02703aa673ceec2a168",
        //         "counterOrderId":"5c1ab46003aa676e487fa8e3",
        //         "side":"buy",
        //         "liquidity":"taker",
        //         "forceTaker":true,
        //         "price":"0.083",
        //         "size":"0.8424304",
        //         "funds":"0.0699217232",
        //         "fee":"0",
        //         "feeRate":"0",
        //         "feeCurrency":"USDT",
        //         "stop":"",
        //         "type":"limit",
        //         "createdAt":1547026472000
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let id = this.safeString (trade, 'tradeId');
        if (id !== undefined) {
            id = id.toString ();
        }
        const orderId = this.safeString (trade, 'orderId');
        const amount = this.safeFloat (trade, 'size');
        let timestamp = this.safeInteger (trade, 'time');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp / 1000000);
        } else {
            timestamp = this.safeInteger (trade, 'createdAt');
        }
        const price = this.safeFloat (trade, 'price');
        const side = this.safeString (trade, 'side');
        const fee = {
            'cost': this.safeFloat (trade, 'fee'),
            'rate': this.safeFloat (trade, 'feeRate'),
            'feeCurrency': this.safeString (trade, 'feeCurrency'),
        };
        const type = this.safeString (trade, 'type');
        let cost = this.safeFloat (trade, 'funds');
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        return {
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currencyId (code);
        let request = {
            'currency': currency,
            'address': address,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = await this.privatePostWithdrawal (this.extend (request, params));
        //
        // { "withdrawalId": "5bffb63303aa675e8bbe18f9" }
        //
        const responseData = response['data'];
        return {
            'id': this.safeString (responseData, 'withdrawalId'),
            'info': responseData,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'SUCCESS': 'ok',
            'PROCESSING': 'ok',
            'FAILURE': 'failed',
        };
        return this.safeString (statuses, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // Deposits
        //   { "address": "0x5f047b29041bcfdbf0e4478cdfa753a336ba6989",
        //     "memo": "5c247c8a03aa677cea2a251d",
        //     "amount": 1,
        //     "fee": 0.0001,
        //     "currency": "KCS",
        //     "isInner": false,
        //     "walletTxId": "5bbb57386d99522d9f954c5a@test004",
        //     "status": "SUCCESS",
        //     "createdAt": 1544178843000,
        //     "updatedAt": 1544178891000 }
        // Withdrawals
        //   { "id": "5c2dc64e03aa675aa263f1ac",
        //     "address": "0x5bedb060b8eb8d823e2414d82acce78d38be7fe9",
        //     "memo": "",
        //     "currency": "ETH",
        //     "amount": 1.0000000,
        //     "fee": 0.0100000,
        //     "walletTxId": "3e2414d82acce78d38be7fe9",
        //     "isInner": false,
        //     "status": "FAILURE",
        //     "createdAt": 1546503758000,
        //     "updatedAt": 1546504603000 }
        //
        let code = undefined;
        let currencyId = this.safeString (transaction, 'currency');
        currency = this.safeValue (this.currencies_by_id, currencyId);
        if (currency !== undefined) {
            code = currency['code'];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        const address = this.safeString (transaction, 'address');
        const amount = this.safeFloat (transaction, 'amount');
        const txid = this.safeString (transaction, 'walletTxId');
        const type = txid === undefined ? 'withdrawal' : 'deposit';
        const rawStatus = this.safeString (transaction, 'status');
        const status = this.parseTransactionStatus (rawStatus);
        let fees = {
            'cost': this.safeFloat (transaction, 'fee'),
        };
        if (fees['cost'] !== undefined && amount !== undefined) {
            fees['rate'] = fees['cost'] / amount;
        }
        const tag = this.safeString (transaction, 'memo');
        const timestamp = this.safeInteger2 (transaction, 'updatedAt', 'createdAt');
        const datetime = this.iso8601 (timestamp);
        return {
            'address': address,
            'tag': tag,
            'currency': code,
            'amount': amount,
            'txid': txid,
            'type': type,
            'status': status,
            'fee': fees,
            'timestamp': timestamp,
            'datetime': datetime,
            'info': transaction,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetDeposits (this.extend (request, params));
        //
        // paginated
        // { code: '200000',
        //   data:
        //    { totalNum: 0,
        //      totalPage: 0,
        //      pageSize: 10,
        //      currentPage: 1,
        //      items: [...]
        //     } }
        //
        const responseData = response['data']['items'];
        return this.parseTransactions (responseData, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetWithdrawals (this.extend (request, params));
        //
        // paginated
        // { code: '200000',
        //   data:
        //    { totalNum: 0,
        //      totalPage: 0,
        //      pageSize: 10,
        //      currentPage: 1,
        //      items: [...] } }
        //
        const responseData = response['data']['items'];
        return this.parseTransactions (responseData, currency, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'type': 'main',
        };
        const response = await this.privateGetAccounts (this.extend (request, params));
        const responseData = response['data'];
        let result = { 'info': responseData };
        for (let i = 0; i < responseData.length; i++) {
            const entry = responseData[i];
            const currencyId = entry['currency'];
            const code = this.commonCurrencyCode (currencyId);
            let account = {};
            account['total'] = this.safeFloat (entry, 'balance', 0);
            account['free'] = this.safeFloat (entry, 'available', 0);
            account['used'] = this.safeFloat (entry, 'holds', 0);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (this.urls['api'][api] !== this.urls['test'][api]) {
            throw new ExchangeError ("KuCoin Platform 2.0 API currently works in preflight sandbox test mode. To proceed with KuCoin Platform 2.0 API in sandbox test mode and acknowledge this warning, please, set .urls['api'] = .urls['test'] after instantiating the exchange class. To trade with the exchange in live mode, please, use " + this.name + " API v1 as you would normally do. The official launch of KuCoin Platform 2.0 will be announced soon."); // eslint-disable-line quotes
        }
        //
        // the v2 URL is https://openapi-v2.kucoin.com/api/v1/endpoint
        //                                †                 ↑
        //
        let endpoint = '/api/' + this.options['version'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let endpart = '';
        headers = headers !== undefined ? headers : {};
        if (Object.keys (query).length) {
            if (method !== 'GET') {
                body = this.json (query);
                endpart = body;
                headers['Content-Type'] = 'application/json';
            } else {
                endpoint += '?' + this.urlencode (query);
            }
        }
        let url = this.urls['api'][api] + endpoint;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ().toString ();
            headers = this.extend ({
                'KC-API-KEY': this.apiKey,
                'KC-API-TIMESTAMP': timestamp,
                'KC-API-PASSPHRASE': this.password,
            }, headers);
            let payload = timestamp + method + endpoint + endpart;
            headers['KC-API-SIGN'] = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'base64');
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (!response) {
            return;
        }
        //
        // bad
        // {"code":"400100","msg":"validation.createOrder.clientOidIsRequired"}
        // good
        // { code: '200000',
        //   data: {...}, }
        //
        let errorCode = this.safeString (response, 'code');
        if (errorCode in this.exceptions) {
            let Exception = this.exceptions[errorCode];
            let message = this.safeString (response, 'msg', '');
            throw new Exception (this.id + ' ' + message);
        }
    }
};
