'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, ArgumentsRequired, ExchangeNotAvailable, AuthenticationError, InvalidOrder, InsufficientFunds, OrderNotFound, DDoSProtection, PermissionDenied, AddressPending } = require ('./base/errors');
const { TRUNCATE, DECIMAL_PLACES } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class adara extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'adara',
            'name': 'Adara',
            'countries': [ 'MT' ],
            'version': 'v2.0',
            'rateLimit': 1000,
            'certified': true,
            // new metainfo interface
            'has': {
                'CORS': true,
                'fetchOrderBooks': true,
                'createMarketOrder': false,
                'fetchDepositAddress': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchTickers': true,
                'withdraw': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': false,
            },
            'timeframes': {
                '1m': 'minutes',
                '3m': 'minutes',
                '5m': 'minutes',
                '15m': 'minutes',
                '30m': 'minutes',
                '1h': 'minutes',
                '4h': 'minutes',
                '1d': 'days',
                '1w': 'weeks',
                '1M': 'months',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
                'api': {
                    'public': 'https://platform.adara-test.io/v2.0',
                    'private': 'https://platform.adara-test.io/v2.0',
                    'v1public': 'https://crm.adara-test.io/v1.0',
                    'v1private': 'https://crm.adara-test.io/v1.0',
                },
                'www': 'https://adara.io',
                'doc': 'https://adara.io/products',
                'fees': 'https://adara.io/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'orderBook',
                        'quote',
                        'quote/{id}',
                        'trade',
                        'limits',
                    ],
                },
                'private': {
                    'get': [
                        'balance',
                        'order',
                        'order/{id}',
                    ],
                    'post': [
                        'order',
                    ],
                    'patch': [
                        'order/{id}',
                    ],
                },
                'v1public': {
                    'get': [
                        'symbol',
                    ],
                },
                'v1private': {
                    'get': [
                        'company',
                        'countries',
                        'currency',
                        'customerView',
                        'customer',
                        'document',
                        'kyc/{id}',
                        'kycStatusToVerified/{id}',
                        'member',
                        'transaction',
                        'user',
                        'wallet',
                    ],
                    'post': [
                        'company',
                        'countries',
                        'customer',
                        'document',
                        'documentsChangeStatusEmail',
                        'kycData',
                        'member',
                        'token',
                        'transaction',
                        'withdrawalConfirmation',
                        'confirmWithdrawalEmail',
                    ],
                    'delete': [
                        'company/{id}',
                        'countries',
                        'customer/{id}',
                        'document/{id}',
                        'member/{id}',
                        'token',
                        'wallet',
                    ],
                    'patch': [
                        'company/{id}',
                        'countries',
                        'customer/{id}',
                        'customer',
                        'document/{id}',
                        'document',
                        'transaction/{id}',
                        'transaction',
                        'user',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0025,
                    'taker': 0.0025,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'exceptions': {
                'exact': {
                    'AUTH': AuthenticationError, // {"errors":[{"code":"AUTH","title":"Not authorized","detail":"User is not authorized"}]}
                    // 'Missing request parameter error. Check the required parameters!': BadRequest, // 400 Bad Request {"error":{"name":400,"message":"Missing request parameter error. Check the required parameters!"}}
                    // 'side is missing, side does not have a valid value': InvalidOrder, // {"error":{"message":"side is missing, side does not have a valid value","name":"validation_error"}}
                },
                'broad': {
                    // 'thirdparty_agreement_required': PermissionDenied, // {"error":{"message":"개인정보 제 3자 제공 동의가 필요합니다.","name":"thirdparty_agreement_required"}}
                    // 'out_of_scope': PermissionDenied, // {"error":{"message":"권한이 부족합니다.","name":"out_of_scope"}}
                },
            },
            'options': {
                'fetchTickersMaxLength': 4096, // 2048,
                'fetchOrderBooksMaxLength': 4096, // 2048,
                // price precision by quote currency code
                'pricePrecisionByCode': {
                    'USD': 3,
                },
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchTradingLimits (symbols = undefined, params = {}) {
        // this method should not be called directly, use loadTradingLimits () instead
        //  by default it will try load withdrawal fees of all currencies (with separate requests)
        //  however if you define symbols = [ 'ETH/BTC', 'LTC/BTC' ] in args it will only load those
        await this.loadMarkets ();
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        let result = {};
        for (let i = 0; i < symbols.length; i++) {
            let symbol = symbols[i];
            result[symbol] = await this.fetchTradingLimitsById (this.marketId (symbol), params);
        }
        return result;
    }

    async fetchTradingLimitsById (id, params = {}) {
        let request = {
            'symbol': id,
        };
        let response = await this.publicGetCommonExchange (this.extend (request, params));
        //
        //     { status:   "ok",
        //         data: {                                  symbol: "aidocbtc",
        //                              'buy-limit-must-less-than':  1.1,
        //                          'sell-limit-must-greater-than':  0.9,
        //                         'limit-order-must-greater-than':  1,
        //                            'limit-order-must-less-than':  5000000,
        //                    'market-buy-order-must-greater-than':  0.0001,
        //                       'market-buy-order-must-less-than':  100,
        //                   'market-sell-order-must-greater-than':  1,
        //                      'market-sell-order-must-less-than':  500000,
        //                       'circuit-break-when-greater-than':  10000,
        //                          'circuit-break-when-less-than':  10,
        //                 'market-sell-order-rate-must-less-than':  0.1,
        //                  'market-buy-order-rate-must-less-than':  0.1        } }
        //
        return this.parseTradingLimits (this.safeValue (response, 'data', {}));
    }

    parseTradingLimits (limits, symbol = undefined, params = {}) {
        //
        //   {                                  symbol: "aidocbtc",
        //                  'buy-limit-must-less-than':  1.1,
        //              'sell-limit-must-greater-than':  0.9,
        //             'limit-order-must-greater-than':  1,
        //                'limit-order-must-less-than':  5000000,
        //        'market-buy-order-must-greater-than':  0.0001,
        //           'market-buy-order-must-less-than':  100,
        //       'market-sell-order-must-greater-than':  1,
        //          'market-sell-order-must-less-than':  500000,
        //           'circuit-break-when-greater-than':  10000,
        //              'circuit-break-when-less-than':  10,
        //     'market-sell-order-rate-must-less-than':  0.1,
        //      'market-buy-order-rate-must-less-than':  0.1        }
        //
        return {
            'info': limits,
            'limits': {
                'amount': {
                    'min': this.safeFloat (limits, 'limit-order-must-greater-than'),
                    'max': this.safeFloat (limits, 'limit-order-must-less-than'),
                },
            },
        };
    }

    async fetchMarkets (params = {}) {
        const response = await this.v1publicGetSymbol (params = {});
        // const log = require ('ololog').unlimited;
        // log.green (response);
        // process.exit ();
        //
        //     {     meta: { total: 64 },
        //         data: [ {            id:   "ETHBTC",
        //                             type:   "symbol",
        //                     attributes: { allowTrade:  true,
        //                                     createdAt: "2018-09-18T21:40:10.836Z",
        //                                         digits:  6,
        //                                     fullName: "ETHBTC",
        //                                     makerFee: "0.0025",
        //                                         name: "ETHBTC",
        //                                     takerFee: "0.0025",
        //                                     updatedAt: "2018-10-05T11:38:32.386Z"  },
        //                     relationships: {  }                                         },
        //                 {            id:   "MIOTABTC",
        //                             type:   "symbol",
        //                     attributes: { allowTrade:  false,
        //                                     createdAt: "2018-10-23T09:27:29.450Z",
        //                                         digits:  6,
        //                                     fullName: "MIOTABTC",
        //                                     makerFee: "0.0250",
        //                                         name: "MIOTABTC",
        //                                     takerFee: "0.0250",
        //                                     updatedAt: "2018-10-23T09:27:29.450Z"  },
        //                     relationships: {  }                                         }  ],
        //     included: []                                                                    }
        //
        const result = [];
        const markets = response['data'];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const attributes = this.safeValue (market, 'attributes');
            const idLength = id.length;
            const baseIdLength = idLength - 3;
            const baseId = id.slice (0, baseIdLength);
            const quoteId = id.slice (baseIdLength);
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const amountPrecision = this.safeInteger (attributes, 'digits');
            const precision = {
                'amount': amountPrecision,
                'price': 8,
            };
            const active = true;
            const maker = this.safeFloat (attributes, 'makerFee');
            const taker = this.safeFloat (attributes, 'takerFee');
            result.push ({
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'maker': maker,
                'taker': taker,
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
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetAccounts (params);
        //
        //     [ {          currency: "BTC",
        //                   balance: "0.005",
        //                    locked: "0.0",
        //         avg_krw_buy_price: "7446000",
        //                  modified:  false     },
        //       {          currency: "ETH",
        //                   balance: "0.1",
        //                    locked: "0.0",
        //         avg_krw_buy_price: "250000",
        //                  modified:  false    }   ]
        //
        let result = { 'info': response };
        let indexed = this.indexBy (response, 'currency');
        let ids = Object.keys (indexed);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let currency = this.commonCurrencyCode (id);
            let account = this.account ();
            let balance = indexed[id];
            let total = this.safeFloat (balance, 'balance');
            let used = this.safeFloat (balance, 'locked');
            let free = total - used;
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    getSymbolFromMarketId (marketId, market = undefined) {
        if (marketId === undefined) {
            return undefined;
        }
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market !== undefined) {
            return market['symbol'];
        }
        const [ baseId, quoteId ] = marketId.split ('-');
        const base = this.commonCurrencyCode (baseId);
        const quote = this.commonCurrencyCode (quoteId);
        return base + '/' + quote;
    }

    async fetchOrderBooks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = undefined;
        if (symbols === undefined) {
            ids = this.ids.join (',');
            // max URL length is 2083 symbols, including http schema, hostname, tld, etc...
            if (ids.length > this.options['fetchOrderBooksMaxLength']) {
                let numIds = this.ids.length;
                throw new ExchangeError (this.id + ' has ' + numIds.toString () + ' symbols (' + ids.length.toString () + ' characters) exceeding max URL length (' + this.options['fetchOrderBooksMaxLength'].toString () + ' characters), you are required to specify a list of symbols in the first argument to fetchOrderBooks');
            }
        } else {
            ids = this.marketIds (symbols);
            ids = ids.join (',');
        }
        const request = {
            'markets': ids,
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
        //
        //     [ {          market:   "BTC-ETH",
        //               timestamp:    1542899030043,
        //          total_ask_size:    109.57065201,
        //          total_bid_size:    125.74430631,
        //         orderbook_units: [ { ask_price: 0.02926679,
        //                              bid_price: 0.02919904,
        //                               ask_size: 4.20293961,
        //                               bid_size: 11.65043576 },
        //                            ...,
        //                            { ask_price: 0.02938209,
        //                              bid_price: 0.0291231,
        //                               ask_size: 0.05135782,
        //                               bid_size: 13.5595     }   ] },
        //       {          market:   "KRW-BTC",
        //               timestamp:    1542899034662,
        //          total_ask_size:    12.89790974,
        //          total_bid_size:    4.88395783,
        //         orderbook_units: [ { ask_price: 5164000,
        //                              bid_price: 5162000,
        //                               ask_size: 2.57606495,
        //                               bid_size: 0.214       },
        //                            ...,
        //                            { ask_price: 5176000,
        //                              bid_price: 5152000,
        //                               ask_size: 2.752,
        //                               bid_size: 0.4650305 }    ] }   ]
        //
        let result = {};
        for (let i = 0; i < response.length; i++) {
            const orderbook = response[i];
            const symbol = this.getSymbolFromMarketId (this.safeString (orderbook, 'market'));
            const timestamp = this.safeInteger (orderbook, 'timestamp');
            result[symbol] = {
                'bids': this.parseBidsAsks (orderbook['orderbook_units'], 'bid_price', 'bid_size'),
                'asks': this.parseBidsAsks (orderbook['orderbook_units'], 'ask_price', 'bid_size'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'nonce': undefined,
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let orderbooks = await this.fetchOrderBooks ([ symbol ], params);
        return this.safeValue (orderbooks, symbol);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {          type:   "quote",
        //                  id:   "XRPETH",
        //          attributes: {  currentPrice: 1,
        //                                  low: 1,
        //                                 high: 1,
        //                           baseVolume: 0,
        //                          quoteVolume: 0,
        //                               change: 0,
        //                        percentChange: 0,
        //                         serializedAt: 1543109275996 },
        //       relationships: { symbol: { data: { type: "symbol", id: "ETHBTC" } } } }
        //
        const symbol = this.getSymbolFromMarketId (this.safeString (ticker, 'id'), market);
        const attributes = this.safeValue (ticker, 'attributes', {});
        const timestamp = this.safeInteger (attributes, 'serializedAt');
        const last = this.safeFloat (attributes, 'currentPrice');
        const change = this.safeFloat (attributes, 'change');
        let open = undefined;
        if (change !== undefined) {
            if (last !== undefined) {
                open = last - change;
            }
        }
        const percentage = this.safeFloat (attributes, 'percentChange');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (attributes, 'high'),
            'low': this.safeFloat (attributes, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetQuote (params);
        const data = this.safeValue (response, 'data', []);
        //
        //     {     data: [ {          type:   "quote",
        //                                id:   "XRPETH",
        //                        attributes: {  currentPrice: 1,
        //                                                low: 1,
        //                                               high: 1,
        //                                         baseVolume: 0,
        //                                        quoteVolume: 0,
        //                                             change: 0,
        //                                      percentChange: 0,
        //                                       serializedAt: 1543109275996 },
        //                     relationships: { symbol: { data: { type: "symbol", id: "ETHBTC" } } } }  ],
        //       included: [ {          type:   "currency",
        //                                id:   "XRP",
        //                        attributes: {          name: "Ripple",
        //                                          shortName: "XRP",
        //                                             active:  true,
        //                                           accuracy:  4,
        //                                       allowDeposit:  true,
        //                                      allowWithdraw:  true,
        //                                        allowWallet:  true,
        //                                         allowTrade:  false,
        //                                       serializedAt:  1543109275996 },
        //                     relationships: {  }                               },
        //                   {          type:   "symbol",
        //                                id:   "XRPETH",
        //                        attributes: {     fullName: "XRPETH",
        //                                            digits:  8,
        //                                        allowTrade:  true,
        //                                      serializedAt:  1543109275996 },
        //                     relationships: { from: { data: { type: "currency", id: "XRP" } },
        //                                        to: { data: { type: "currency", id: "ETH" } }  } }  ]    }
        //
        let result = {};
        for (let t = 0; t < data.length; t++) {
            let ticker = this.parseTicker (data[t]);
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetQuoteId (this.extend (request, params));
        //
        //     { included: [ {       type:   "currency",
        //                             id:   "ETH",
        //                     attributes: {          name: "Ethereum",
        //                                       shortName: "ETH",
        //                                          active:  true,
        //                                        accuracy:  8,
        //                                    allowDeposit:  true,
        //                                   allowWithdraw:  true,
        //                                     allowWallet:  true,
        //                                      allowTrade:  true,
        //                                    serializedAt:  1543111444033 } },
        //                   {       type:   "currency",
        //                             id:   "BTC",
        //                     attributes: {          name: "Bitcoin",
        //                                       shortName: "BTC",
        //                                          active:  true,
        //                                        accuracy:  8,
        //                                    allowDeposit:  true,
        //                                   allowWithdraw:  true,
        //                                     allowWallet:  true,
        //                                      allowTrade:  true,
        //                                    serializedAt:  1543111444033 } },
        //                   {          type:   "symbol",
        //                                id:   "ETHBTC",
        //                        attributes: {     fullName: "ETHBTC",
        //                                            digits:  6,
        //                                        allowTrade:  true,
        //                                      serializedAt:  1543111444033 },
        //                     relationships: { from: { data: { type: "currency", id: "ETH" } },
        //                                        to: { data: { type: "currency", id: "BTC" } }  } } ],
        //           data: {          type:   "quote",
        //                              id:   "ETHBTC",
        //                      attributes: {  currentPrice: 34,
        //                                              low: 34,
        //                                             high: 34,
        //                                       baseVolume: 0,
        //                                      quoteVolume: 0,
        //                                           change: 0,
        //                                    percentChange: 0,
        //                                     serializedAt: 1543111444033 },
        //                   relationships: { symbol: { data: { type: "symbol", id: "ETHBTC" } } } }    } (fetchTicker @ adara.js:546)
        //
        return this.parseTicker (response['data']);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades
        //
        //
        //       {          type:   "trade",
        //                    id:   "1542988964359136846136847",
        //            attributes: {        price:  34,
        //                                amount:  4,
        //                                 total:  136,
        //                             operation: "buy",
        //                             createdAt: "2018-11-23T16:02:44.359Z",
        //                          serializedAt:  1543112364995              },
        //         relationships: { symbol: { data: { type: "symbol", id: "ETHBTC" } } } } ],
        //
        const id = this.safeString (trade, 'id', 'uuid');
        const attributes = this.safeValue (trade, 'attributes', {});
        const relationships = this.safeValue (trade, 'relationships', {});
        const symbolRelationship = this.safeValue (relationships, 'symbol', {});
        const symbolRelationshipData = this.safeValue (symbolRelationship, 'data', {});
        const marketId = this.safeString (symbolRelationshipData, 'id');
        market = this.safeValue (this.markets_by_id, marketId);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            const baseIdLength = marketId.length - 3;
            const baseId = marketId.slice (0, baseIdLength);
            const quoteId = marketId.slice (baseIdLength);
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        }
        const orderId = undefined;
        const timestamp = this.parse8601 (this.safeString (attributes, 'createdAt'));
        const side = this.safeString (attributes, 'operation');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = this.safeFloat (trade, 'total');
        if (cost === undefined) {
            if (amount !== undefined) {
                if (price !== undefined) {
                    cost = price * amount;
                }
            }
        }
        return {
            'id': id,
            'info': trade,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
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
            // 'id': market['id'],
        };
        let response = await this.publicGetTrade (this.extend (request, params));
        //
        //     {     data: [ {          type:   "trade",
        //                                id:   "1542988964359136846136847",
        //                        attributes: {        price:  34,
        //                                            amount:  4,
        //                                             total:  136,
        //                                         operation: "buy",
        //                                         createdAt: "2018-11-23T16:02:44.359Z",
        //                                      serializedAt:  1543112364995              },
        //                     relationships: { symbol: { data: { type: "symbol", id: "ETHBTC" } } } } ],
        //       included: [ {          type:   "currency",
        //                                id:   "ETH",
        //                        attributes: {          name: "Ethereum",
        //                                          shortName: "ETH",
        //                                             active:  true,
        //                                           accuracy:  8,
        //                                       allowDeposit:  true,
        //                                      allowWithdraw:  true,
        //                                        allowWallet:  true,
        //                                         allowTrade:  true,
        //                                       serializedAt:  1543112364995 },
        //                     relationships: {  }                               },
        //                   {          type:   "currency",
        //                                id:   "BTC",
        //                        attributes: {          name: "Bitcoin",
        //                                                   ...
        //                                       serializedAt:  1543112364995 },
        //                     relationships: {  }                               },
        //                   {          type:   "symbol",
        //                                id:   "ETHBTC",
        //                        attributes: {     fullName: "ETHBTC",
        //                                            digits:  6,
        //                                        allowTrade:  true,
        //                                      serializedAt:  1543112364995 },
        //                     relationships: { from: { data: { type: "currency", id: "ETH" } },
        //                                        to: { data: { type: "currency", id: "BTC" } }  } } }
        //
        return this.parseTrades (response['data'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        //
        //       {                  market: "BTC-ETH",
        //            candle_date_time_utc: "2018-11-22T13:47:00",
        //            candle_date_time_kst: "2018-11-22T22:47:00",
        //                   opening_price:  0.02915963,
        //                      high_price:  0.02915963,
        //                       low_price:  0.02915448,
        //                     trade_price:  0.02915448,
        //                       timestamp:  1542894473674,
        //          candle_acc_trade_price:  0.0981629437535248,
        //         candle_acc_trade_volume:  3.36693173,
        //                            unit:  1                     },
        //
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeFloat (ohlcv, 'opening_price'),
            this.safeFloat (ohlcv, 'high_price'),
            this.safeFloat (ohlcv, 'low_price'),
            this.safeFloat (ohlcv, 'trade_price'),
            this.safeFloat (ohlcv, 'candle_acc_trade_price'), // base volume
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let timeframePeriod = this.parseTimeframe (timeframe);
        let timeframeValue = this.timeframes[timeframe];
        if (limit === undefined) {
            limit = 200;
        }
        let request = {
            'market': market['id'],
            'timeframe': timeframeValue,
            'count': limit,
        };
        let method = 'publicGetCandlesTimeframe';
        if (timeframeValue === 'minutes') {
            let numMinutes = Math.round (timeframePeriod / 60);
            request['unit'] = numMinutes;
            method += 'Unit';
        }
        let response = await this[method] (this.extend (request, params));
        //
        //     [ {                  market: "BTC-ETH",
        //            candle_date_time_utc: "2018-11-22T13:47:00",
        //            candle_date_time_kst: "2018-11-22T22:47:00",
        //                   opening_price:  0.02915963,
        //                      high_price:  0.02915963,
        //                       low_price:  0.02915448,
        //                     trade_price:  0.02915448,
        //                       timestamp:  1542894473674,
        //          candle_acc_trade_price:  0.0981629437535248,
        //         candle_acc_trade_volume:  3.36693173,
        //                            unit:  1                     },
        //       {                  market: "BTC-ETH",
        //            candle_date_time_utc: "2018-11-22T10:06:00",
        //            candle_date_time_kst: "2018-11-22T19:06:00",
        //                   opening_price:  0.0294,
        //                      high_price:  0.02940882,
        //                       low_price:  0.02934283,
        //                     trade_price:  0.02937354,
        //                       timestamp:  1542881219276,
        //          candle_acc_trade_price:  0.0762597110943884,
        //         candle_acc_trade_volume:  2.5949617,
        //                            unit:  1                     }  ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new InvalidOrder (this.id + ' createOrder allows limit orders only!');
        }
        let orderSide = undefined;
        if (side === 'buy') {
            orderSide = 'bid';
        } else if (side === 'sell') {
            orderSide = 'ask';
        } else {
            throw new InvalidOrder (this.id + ' createOrder allows buy or sell side only!');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': orderSide,
            'volume': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
            'ord_type': type,
        };
        const response = await this.privatePostOrders (this.extend (request, params));
        const log = require ('ololog').unlimited;
        log.green (response);
        process.exit ();
        //
        //     {
        //         'uuid': 'cdd92199-2897-4e14-9448-f923320408ad',
        //         'side': 'bid',
        //         'ord_type': 'limit',
        //         'price': '100.0',
        //         'avg_price': '0.0',
        //         'state': 'wait',
        //         'market': 'KRW-BTC',
        //         'created_at': '2018-04-10T15:42:23+09:00',
        //         'volume': '0.01',
        //         'remaining_volume': '0.01',
        //         'reserved_fee': '0.0015',
        //         'remaining_fee': '0.0015',
        //         'paid_fee': '0.0',
        //         'locked': '1.0015',
        //         'executed_volume': '0.0',
        //         'trades_count': 0
        //     }
        //
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'uuid': id,
        };
        let response = await this.privateDeleteOrder (this.extend (request, params));
        //
        //     {
        //         "uuid": "cdd92199-2897-4e14-9448-f923320408ad",
        //         "side": "bid",
        //         "ord_type": "limit",
        //         "price": "100.0",
        //         "state": "wait",
        //         "market": "KRW-BTC",
        //         "created_at": "2018-04-10T15:42:23+09:00",
        //         "volume": "0.01",
        //         "remaining_volume": "0.01",
        //         "reserved_fee": "0.0015",
        //         "remaining_fee": "0.0015",
        //         "paid_fee": "0.0",
        //         "locked": "1.0015",
        //         "executed_volume": "0.0",
        //         "trades_count": 0
        //     }
        //
        return this.parseOrder (response);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.accountGetDeposithistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "type": "deposit",
        //             "uuid": "94332e99-3a87-4a35-ad98-28b0c969f830",
        //             "currency": "KRW",
        //             "txid": "9e37c537-6849-4c8b-a134-57313f5dfc5a",
        //             "state": "ACCEPTED",
        //             "created_at": "2017-12-08T15:38:02+09:00",
        //             "done_at": "2017-12-08T15:38:02+09:00",
        //             "amount": "100000.0",
        //             "fee": "0.0"
        //         },
        //         ...,
        //     ]
        //
        return this.parseTransactions (response['result'], currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.accountGetWithdrawalhistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "type": "withdraw",
        //             "uuid": "9f432943-54e0-40b7-825f-b6fec8b42b79",
        //             "currency": "BTC",
        //             "txid": null,
        //             "state": "processing",
        //             "created_at": "2018-04-13T11:24:01+09:00",
        //             "done_at": null,
        //             "amount": "0.01",
        //             "fee": "0.0",
        //             "krw_amount": "80420.0"
        //         },
        //         ...,
        //     ]
        //
        return this.parseTransactions (response['result'], currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //      {            Id:  72578097,
        //               Amount:  0.3,
        //             Currency: "ETH",
        //        Confirmations:  15,
        //          LastUpdated: "2018-06-17T07:12:14.57",
        //                 TxId: "0xb31b5ba2ca5438b58f93516eaa523eaf35b4420ca0f24061003df1be7…",
        //        CryptoAddress: "0x2d5f281fa51f1635abd4a60b0870a62d2a7fa404"                    }
        //
        // fetchWithdrawals
        //
        //     {
        //         "PaymentUuid" : "e293da98-788c-4188-a8f9-8ec2c33fdfcf",
        //         "Currency" : "XC",
        //         "Amount" : 7513.75121715,
        //         "Address" : "EVnSMgAd7EonF2Dgc4c9K14L12RBaW5S5J",
        //         "Opened" : "2014-07-08T23:13:31.83",
        //         "Authorized" : true,
        //         "PendingPayment" : false,
        //         "TxCost" : 0.00002000,
        //         "TxId" : "b4a575c2a71c7e56d02ab8e26bb1ef0a2f6cf2094f6ca2116476a569c1e84f6e",
        //         "Canceled" : false,
        //         "InvalidAddress" : false
        //     }
        //
        const id = this.safeString2 (transaction, 'Id', 'PaymentUuid');
        const amount = this.safeFloat (transaction, 'Amount');
        const address = this.safeString2 (transaction, 'CryptoAddress', 'Address');
        const txid = this.safeString (transaction, 'TxId');
        const updated = this.parse8601 (this.safeValue (transaction, 'LastUpdated'));
        const timestamp = this.parse8601 (this.safeString (transaction, 'Opened', updated));
        const type = (timestamp !== undefined) ? 'withdrawal' : 'deposit';
        let code = undefined;
        let currencyId = this.safeString (transaction, 'Currency');
        currency = this.safeValue (this.currencies_by_id, currencyId);
        if (currency !== undefined) {
            code = currency['code'];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        let status = 'pending';
        if (type === 'deposit') {
            if (currency !== undefined) {
                // deposits numConfirmations never reach the minConfirmations number
                // we set all of them to 'ok', otherwise they'd all be 'pending'
                //
                //     const numConfirmations = this.safeInteger (transaction, 'Confirmations', 0);
                //     const minConfirmations = this.safeInteger (currency['info'], 'MinConfirmation');
                //     if (numConfirmations >= minConfirmations) {
                //         status = 'ok';
                //     }
                //
                status = 'ok';
            }
        } else {
            const authorized = this.safeValue (transaction, 'Authorized', false);
            const pendingPayment = this.safeValue (transaction, 'PendingPayment', false);
            const canceled = this.safeValue (transaction, 'Canceled', false);
            const invalidAddress = this.safeValue (transaction, 'InvalidAddress', false);
            if (invalidAddress) {
                status = 'failed';
            } else if (canceled) {
                status = 'canceled';
            } else if (pendingPayment) {
                status = 'pending';
            } else if (authorized && (txid !== undefined)) {
                status = 'ok';
            }
        }
        let feeCost = this.safeFloat (transaction, 'TxCost');
        if (feeCost === undefined) {
            if (type === 'deposit') {
                // according to https://support.bittrex.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-
                feeCost = 0; // FIXME: remove hardcoded value that may change any time
            } else if (type === 'withdrawal') {
                throw new ExchangeError ('Withdrawal without fee detected!');
            }
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': type,
            'updated': updated,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    parseSymbol (id) {
        let [ quote, base ] = id.split (this.options['symbolSeparator']);
        base = this.commonCurrencyCode (base);
        quote = this.commonCurrencyCode (quote);
        return base + '/' + quote;
    }

    parseOrderStatus (status) {
        const statuses = {
            'wait': 'open',
            'done': 'closed',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "uuid": "a08f09b1-1718-42e2-9358-f0e5e083d3ee",
        //         "side": "bid",
        //         "ord_type": "limit",
        //         "price": "17417000.0",
        //         "state": "done",
        //         "market": "KRW-BTC",
        //         "created_at": "2018-04-05T14:09:14+09:00",
        //         "volume": "1.0",
        //         "remaining_volume": "0.0",
        //         "reserved_fee": "26125.5",
        //         "remaining_fee": "25974.0",
        //         "paid_fee": "151.5",
        //         "locked": "17341974.0",
        //         "executed_volume": "1.0",
        //         "trades_count": 2,
        //         "trades": [
        //             {
        //                 "market": "KRW-BTC",
        //                 "uuid": "78162304-1a4d-4524-b9e6-c9a9e14d76c3",
        //                 "price": "101000.0",
        //                 "volume": "0.77368323",
        //                 "funds": "78142.00623",
        //                 "ask_fee": "117.213009345",
        //                 "bid_fee": "117.213009345",
        //                 "created_at": "2018-04-05T14:09:15+09:00",
        //                 "side": "bid",
        //             },
        //             {
        //                 "market": "KRW-BTC",
        //                 "uuid": "f73da467-c42f-407d-92fa-e10d86450a20",
        //                 "price": "101000.0",
        //                 "volume": "0.22631677",
        //                 "funds": "22857.99377",
        //                 "ask_fee": "34.286990655",
        //                 "bid_fee": "34.286990655",
        //                 "created_at": "2018-04-05T14:09:15+09:00",
        //                 "side": "bid",
        //             },
        //         ],
        //     }
        //
        let id = this.safeString (order, 'uuid');
        let side = this.safeString (order, 'side');
        if (side === 'bid') {
            side = 'buy';
        } else {
            side = 'sell';
        }
        let type = this.safeString (order, 'ord_type');
        let timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        let status = this.parseOrderStatus (this.safeString (order, 'state'));
        let lastTradeTimestamp = undefined;
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'volume');
        let remaining = this.safeFloat (order, 'remaining_volume');
        let filled = this.safeFloat (order, 'executed_volume');
        let cost = undefined;
        let average = undefined;
        if (cost === undefined) {
            if ((price !== undefined) && (filled !== undefined)) {
                cost = price * filled;
            }
        }
        let orderTrades = this.safeValue (order, 'trades');
        let trades = undefined;
        if (orderTrades !== undefined) {
            trades = this.parseTrades (orderTrades);
        }
        let fee = undefined;
        let feeCost = this.safeFloat (order, 'paid_fee');
        let feeCurrency = undefined;
        let marketId = this.safeString (order, 'market');
        market = this.safeValue (this.markets_by_id, marketId);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        } else {
            const [ baseId, quoteId ] = marketId.split ('-');
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            symbol = base + '/' + quote;
            feeCurrency = quote;
        }
        if (trades !== undefined) {
            let numTrades = trades.length;
            if (numTrades > 0) {
                if (lastTradeTimestamp === undefined) {
                    lastTradeTimestamp = trades[numTrades - 1]['timestamp'];
                }
                if (feeCost === undefined) {
                    for (let i = 0; i < numTrades; i++) {
                        let tradeFee = this.safeValue (trades[i], 'fee', {});
                        let tradeFeeCost = this.safeFloat (tradeFee, 'cost');
                        if (tradeFeeCost !== undefined) {
                            if (feeCost === undefined) {
                                feeCost = 0;
                            }
                            feeCost = this.sum (feeCost, tradeFeeCost);
                        }
                    }
                }
            }
        }
        if (feeCost !== undefined) {
            fee = {
                'currency': feeCurrency,
                'cost': feeCost,
            };
        }
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            // 'market': this.marketId (symbol),
            // 'state': 'wait', 'done', 'cancel',
            // 'page': 1,
            // 'order_by': 'asc',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.marketId (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        // const response =
        /*
            [
                {
                    "uuid": "a08f09b1-1718-42e2-9358-f0e5e083d3ee",
                    "side": "bid",
                    "ord_type": "limit",
                    "price": "17417000.0",
                    "state": "done",
                    "market": "KRW-BTC",
                    "created_at": "2018-04-05T14:09:14+09:00",
                    "volume": "1.0",
                    "remaining_volume": "0.0",
                    "reserved_fee": "26125.5",
                    "remaining_fee": "25974.0",
                    "paid_fee": "151.5",
                    "locked": "17341974.0",
                    "executed_volume": "1.0",
                    "trades_count":2
                },
            ]
        */
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'state': 'wait',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'state': 'done',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'uuid': id,
        };
        // let response = await this.publicGetOrder (this.extend (request, params));
        let response =
        //
            {
                "uuid": "a08f09b1-1718-42e2-9358-f0e5e083d3ee",
                "side": "bid",
                "ord_type": "limit",
                "price": "17417000.0",
                "state": "done",
                "market": "KRW-BTC",
                "created_at": "2018-04-05T14:09:14+09:00",
                "volume": "1.0",
                "remaining_volume": "0.0",
                "reserved_fee": "26125.5",
                "remaining_fee": "25974.0",
                "paid_fee": "151.5",
                "locked": "17341974.0",
                "executed_volume": "1.0",
                "trades_count": 2,
                "trades": [
                    {
                        "market": "KRW-BTC",
                        "uuid": "78162304-1a4d-4524-b9e6-c9a9e14d76c3",
                        "price": "101000.0",
                        "volume": "0.77368323",
                        "funds": "78142.00623",
                        "ask_fee": "117.213009345",
                        "bid_fee": "117.213009345",
                        "created_at": "2018-04-05T14:09:15+09:00",
                        "side": "bid"
                    },
                    {
                        "market": "KRW-BTC",
                        "uuid": "f73da467-c42f-407d-92fa-e10d86450a20",
                        "price": "101000.0",
                        "volume": "0.22631677",
                        "funds": "22857.99377",
                        "ask_fee": "34.286990655",
                        "bid_fee": "34.286990655",
                        "created_at": "2018-04-05T14:09:15+09:00",
                        "side": "bid"
                    }
                ]
            }
        //
        return this.parseOrder (response);
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetDepositsCoinAddresses (params);
        //
        //     [
        //         {
        //             "currency": "BTC",
        //             "deposit_address": "3EusRwybuZUhVDeHL7gh3HSLmbhLcy7NqD",
        //             "secondary_address": null
        //         },
        //         {
        //             "currency": "ETH",
        //             "deposit_address": "0x0d73e0a482b8cf568976d2e8688f4a899d29301c",
        //             "secondary_address": null
        //         },
        //         {
        //             "currency": "XRP",
        //             "deposit_address": "rN9qNpgnBaZwqCg8CvUZRPqCcPPY7wfWep",
        //             "secondary_address": "3057887915"
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            let depositAddress = this.parseDepositAddress (response[i]);
            let code = depositAddress['code'];
            result[code] = depositAddress;
        }
        return result;
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         "currency": "BTC",
        //         "deposit_address": "3EusRwybuZUhVDeHL7gh3HSLmbhLcy7NqD",
        //         "secondary_address": null
        //     }
        //
        const address = this.safeString (depositAddress, 'deposit_address');
        const tag = this.safeString (depositAddress, 'secondary_address');
        const code = this.commonCurrencyCode (this.safeString (depositAddress, 'currency'));
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': depositAddress,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const response = await this.privateGetDepositsCoinAddress (this.extend ({
            'currency': currency['id'],
        }, params));
        //
        //     {
        //         "currency": "BTC",
        //         "deposit_address": "3EusRwybuZUhVDeHL7gh3HSLmbhLcy7NqD",
        //         "secondary_address": null
        //     }
        //
        return this.parseDepositAddress (response);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'amount': amount,
        }
        let method = 'privatePostWithdraws';
        if (code !== 'KRW') {
            method += 'Coin';
            request['currency'] = currency['id'];
            request['address'] = address;
            if (tag !== undefined) {
                request['secondary_address'] = tag;
            }
        } else {
            method += 'Krw';
        }
        let response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "type": "withdraw",
        //         "uuid": "9f432943-54e0-40b7-825f-b6fec8b42b79",
        //         "currency": "BTC",
        //         "txid": "ebe6937b-130e-4066-8ac6-4b0e67f28adc",
        //         "state": "processing",
        //         "created_at": "2018-04-13T11:24:01+09:00",
        //         "done_at": null,
        //         "amount": "0.01",
        //         "fee": "0.0",
        //         "krw_amount": "80420.0"
        //     }
        //
        return this.parseTransaction (response);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const request = {
                'access_key': this.apiKey,
                'nonce': nonce,
            };
            if (Object.keys (query).length) {
                request['query'] = this.urlencode (query);
            }
            const jwt = this.jwt (request, this.secret);
            headers = {
                'Authorization': 'Bearer ' + jwt,
            };
            if (method === 'POST') {
                body = this.json (params);
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response = undefined) {
        if (!this.isJsonEncodedObject (body))
            return; // fallback to default error handler
        response = JSON.parse (body);
        //
        //     {"error":{"name":400,"message":"Missing request parameter error. Check the required parameters!"}}
        //     {"error":{"message":"side is missing, side does not have a valid value","name":"validation_error"}}
        //     {"error":{"message":"개인정보 제 3자 제공 동의가 필요합니다.","name":"thirdparty_agreement_required"}}
        //     {"error":{"message":"권한이 부족합니다.","name":"out_of_scope"}}
        //
        const error = this.safeValue (response, 'error');
        if (error !== undefined) {
            const message = this.safeString (error, 'message');
            const name = this.safeString (error, 'name');
            const feedback = this.id + ' ' + this.json (response);
            const exact = this.exceptions['exact'];
            if (message in exact) {
                throw new exact[message] (feedback);
            }
            if (name in exact) {
                throw new exact[name] (feedback);
            }
            const broad = this.exceptions['broad'];
            let broadKey = this.findBroadlyMatchedKey (broad, message);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            broadKey = this.findBroadlyMatchedKey (broad, name);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
