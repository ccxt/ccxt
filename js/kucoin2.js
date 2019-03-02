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
                'fetchTickers': true,
                'fetchOrderBook': true,
                'fetchOrder': true,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
                'fetchDepositAddress': true,
                'createDepositAddress': true,
                'withdraw': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchBalance': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchAccounts': true,
                'fetchFundingFee': true,
                'fetchOHLCV': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/51909432-b0a72780-23dd-11e9-99ba-73d23c8d4eed.jpg',
                'referral': 'https://www.kucoin.com/ucenter/signup?rcode=E5wkqe',
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
                        'market/allTickers',
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
                'order_not_exist_or_not_allow_to_cancel': InvalidOrder,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
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
        const data = response['data'];
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = market['name'];
            const baseId = market['baseCurrency'];
            const quoteId = market['quoteCurrency'];
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = market['enableTrading'];
            const baseMaxSize = this.safeFloat (market, 'baseMaxSize');
            const baseMinSize = this.safeFloat (market, 'baseMinSize');
            const quoteMaxSize = this.safeFloat (market, 'quoteMaxSize');
            const quoteMinSize = this.safeFloat (market, 'quoteMinSize');
            const quoteIncrement = this.safeFloat (market, 'quoteIncrement');
            const precision = {
                'amount': this.precisionFromString (this.safeString (market, 'baseIncrement')),
                'price': this.precisionFromString (this.safeString (market, 'priceIncrement')),
            };
            const limits = {
                'amount': {
                    'min': baseMinSize,
                    'max': baseMaxSize,
                },
                'price': {
                    'min': Math.max (quoteMinSize / baseMinSize, quoteIncrement),
                    'max': quoteMaxSize / baseMinSize,
                },
                'cost': {
                    'min': quoteMinSize,
                    'max': quoteMaxSize,
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
                'info': market,
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
        const result = {};
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
        //
        //     { code:   "200000",
        //       data: [ {   balance: "0.00009788",
        //                 available: "0.00009788",
        //                     holds: "0",
        //                  currency: "BTC",
        //                        id: "5c6a4fd399a1d81c4f9cc4d0",
        //                      type: "trade"                     },
        //               ...,
        //               {   balance: "0.00000001",
        //                 available: "0.00000001",
        //                     holds: "0",
        //                  currency: "ETH",
        //                        id: "5c6a49ec99a1d819392e8e9f",
        //                      type: "trade"                     }  ] }
        //
        const data = this.safeValue (response, 'data');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const account = data[i];
            const accountId = this.safeString (account, 'id');
            const currencyId = this.safeString (account, 'currency');
            const code = this.commonCurrencyCode (currencyId);
            const type = this.safeString (account, 'type');  // main or trade
            result.push ({
                'id': accountId,
                'type': type,
                'currency': code,
                'info': account,
            });
        }
        return result;
    }

    async fetchFundingFee (code, params = {}) {
        const currencyId = this.currencyId (code);
        const request = {
            'currency': currencyId,
        };
        const response = await this.privateGetWithdrawalsQuotas (this.extend (request, params));
        const data = response['data'];
        let withdrawFees = {};
        withdrawFees[code] = this.safeFloat (data, 'withdrawMinFee');
        return {
            'info': response,
            'withdraw': withdrawFees,
            'deposit': {},
        };
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         'buy': '0.00001168',
        //         'changePrice': '-0.00000018',
        //         'changeRate': '-0.0151',
        //         'datetime': 1550661146316,
        //         'high': '0.0000123',
        //         'last': '0.00001169',
        //         'low': '0.00001159',
        //         'sell': '0.00001182',
        //         'symbol': 'LOOM-BTC',
        //         'vol': '44399.5669'
        //     }
        //
        let percentage = this.safeFloat (ticker, 'changeRate');
        if (percentage !== undefined) {
            percentage = percentage * 100;
        }
        const last = this.safeFloat (ticker, 'last');
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.commonCurrencyCode (baseId);
                const quote = this.commonCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'changePrice'),
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'volValue'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarketAllTickers (params);
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "date": 1550661940645,
        //             "ticker": [
        //                 'buy': '0.00001168',
        //                 'changePrice': '-0.00000018',
        //                 'changeRate': '-0.0151',
        //                 'datetime': 1550661146316,
        //                 'high': '0.0000123',
        //                 'last': '0.00001169',
        //                 'low': '0.00001159',
        //                 'sell': '0.00001182',
        //                 'symbol': 'LOOM-BTC',
        //                 'vol': '44399.5669'
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const tickers = this.safeValue (data, 'ticker', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = this.safeString (ticker, 'symbol');
            if (symbol !== undefined) {
                result[symbol] = ticker;
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
        const response = await this.publicGetMarketStats (this.extend (request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             'buy': '0.00001168',
        //             'changePrice': '-0.00000018',
        //             'changeRate': '-0.0151',
        //             'datetime': 1550661146316,
        //             'high': '0.0000123',
        //             'last': '0.00001169',
        //             'low': '0.00001159',
        //             'sell': '0.00001182',
        //             'symbol': 'LOOM-BTC',
        //             'vol': '44399.5669'
        //         },
        //     }
        //
        return this.parseTicker (response['data'], market);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        //
        //     [
        //         "1545904980",             // Start time of the candle cycle
        //         "0.058",                  // opening price
        //         "0.049",                  // closing price
        //         "0.058",                  // highest price
        //         "0.049",                  // lowest price
        //         "0.018",                  // base volume
        //         "0.000945",               // quote volume
        //     ]
        //
        return [
            parseInt (ohlcv[0]) * 1000,
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '15m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const request = {
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

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currencyId = this.currencyId (code);
        const request = { 'currency': currencyId };
        const response = await this.privatePostDepositAddresses (this.extend (request, params));
        // BCH {"code":"200000","data":{"address":"bitcoincash:qza3m4nj9rx7l9r0cdadfqxts6f92shvhvr5ls4q7z","memo":""}}
        // BTC {"code":"200000","data":{"address":"36SjucKqQpQSvsak9A7h6qzFjrVXpRNZhE","memo":""}}
        const data = this.safeValue (response, 'data', {});
        let address = this.safeString (data, 'address');
        // BCH/BSV is returned with a "bitcoincash:" prefix, which we cut off here and only keep the address
        address = address.replace ('bitcoincash:', '');
        const tag = this.safeString (data, 'memo');
        this.checkAddress (address);
        return {
            'info': response,
            'currency': code,
            'address': address,
            'tag': tag,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currencyId = this.currencyId (code);
        const request = { 'currency': currencyId };
        const response = await this.privateGetDepositAddresses (this.extend (request, params));
        // BCH {"code":"200000","data":{"address":"bitcoincash:qza3m4nj9rx7l9r0cdadfqxts6f92shvhvr5ls4q7z","memo":""}}
        // BTC {"code":"200000","data":{"address":"36SjucKqQpQSvsak9A7h6qzFjrVXpRNZhE","memo":""}}
        const data = this.safeValue (response, 'data', {});
        let address = this.safeString (data, 'address');
        // BCH/BSV is returned with a "bitcoincash:" prefix, which we cut off here and only keep the address
        if (address !== undefined) {
            address = address.replace ('bitcoincash:', '');
        }
        const tag = this.safeString (data, 'memo');
        this.checkAddress (address);
        return {
            'info': response,
            'currency': code,
            'address': address,
            'tag': tag,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = this.extend ({ 'symbol': marketId, 'level': 2 }, params);
        const response = await this.publicGetMarketOrderbookLevelLevel (request);
        //
        // { sequence: '1547731421688',
        //   asks: [ [ '5c419328ef83c75456bd615c', '0.9', '0.09' ], ... ],
        //   bids: [ [ '5c419328ef83c75456bd615c', '0.9', '0.09' ], ... ], }
        //
        const data = response['data'];
        const timestamp = this.safeInteger (data, 'sequence');
        // level can be a string such as 2_20 or 2_100
        const levelString = this.safeString (request, 'level');
        const levelParts = levelString.split ('_');
        const level = parseInt (levelParts[0]);
        return this.parseOrderBook (data, timestamp, 'bids', 'asks', level - 2, level - 1);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        // required param, cannot be used twice
        const clientOid = this.uuid ();
        const request = {
            'clientOid': clientOid,
            'side': side,
            'size': this.amountToPrecision (symbol, amount),
            'symbol': marketId,
            'type': type,
        };
        if (type !== 'market') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
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
        const request = {
            'status': status,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        const responseData = this.safeValue (response, 'data', {});
        const orders = this.safeValue (responseData, 'items', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByStatus ('done', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByStatus ('active', symbol, since, limit, params);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
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
        const marketId = this.safeString (order, 'symbol');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.commonCurrencyCode (baseId);
                const quote = this.commonCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        const orderId = this.safeString (order, 'id');
        const type = this.safeString (order, 'type');
        const timestamp = this.safeInteger (order, 'createdAt');
        const datetime = this.iso8601 (timestamp);
        const price = this.safeFloat (order, 'price');
        const side = this.safeString (order, 'side');
        const feeCurrencyId = this.safeString (order, 'feeCurrency');
        const feeCurrency = this.commonCurrencyCode (feeCurrencyId);
        const feeCost = this.safeFloat (order, 'fee');
        const amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat (order, 'dealSize');
        const cost = this.safeFloat (order, 'dealFunds');
        const remaining = amount - filled;
        // bool
        const status = order['isActive'] ? 'open' : 'closed';
        let fee = {
            'currency': feeCurrency,
            'cost': feeCost,
        };
        return {
            'id': orderId,
            'symbol': symbol,
            'type': type,
            'side': side,
            'amount': amount,
            'price': price,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'timestamp': timestamp,
            'datetime': datetime,
            'fee': fee,
            'status': status,
            'info': order,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
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
        const request = {
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
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.commonCurrencyCode (baseId);
                const quote = this.commonCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
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
            'currency': this.safeString (trade, 'feeCurrency'),
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
        const request = {
            'currency': currency,
            'address': address,
            'amount': amount,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = await this.privatePostWithdrawals (this.extend (request, params));
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
        const request = {};
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
        const request = {};
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
            'type': 'trade',
        };
        const response = await this.privateGetAccounts (this.extend (request, params));
        const responseData = response['data'];
        const result = { 'info': responseData };
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
            const payload = timestamp + method + endpoint + endpart;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'base64');
            headers['KC-API-SIGN'] = this.decode (signature);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (!response) {
            return;
        }
        //
        // bad
        //     { "code": "400100", "msg": "validation.createOrder.clientOidIsRequired" }
        // good
        //     { code: '200000', data: { ... }}
        //
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        const ExceptionClass = this.safeValue2 (this.exceptions, message, errorCode);
        if (ExceptionClass !== undefined) {
            throw new ExceptionClass (this.id + ' ' + message);
        }
    }
};
