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
                'fetchDepositAddress': false,
                'fetchClosedOrders': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchTickers': true,
                'withdraw': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'fetchTransactions': false,
            },
            'requiredCredentials': {
                'secret': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
                'api': {
                    'public': 'https://api.adara-master.io/v2.0',
                    'private': 'https://api.adara-master.io/v2.0',
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
                    'Order is not found': OrderNotFound, // {"errors":[{"status":"404","title":"Not Found","detail":"Order is not found"}]}
                    'AUTH': AuthenticationError, // {"errors":[{"code":"AUTH","title":"Not authorized","detail":"User is not authorized"}]}
                    'You are not authorized': AuthenticationError, // {"errors":[{"status":"401","title":"Unauthorized","detail":"You are not authorized"}]}
                    'Bad Request': BadRequest, // {"errors":[{"status":"400","title":"Bad Request","detail":"symbol filter is not filled"}]}
                    '500': ExchangeError, // {"errors":[{"status":"500","title":"TypeError","detail":"TypeError: Cannot read property 'buy' of undefined"}]}
                },
                'broad': {
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
            const active = this.safeValue (attributes, 'allowTrade');
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
        let response = await this.privateGetBalance (params);
        //
        //     {     data: [ {          type:   "balance",
        //                                id:   "U4f0f0940-39bf-45a8-90bc-12d2899db4f1_BALANCE_FOR_ETH",
        //                        attributes: {           totalBalance: 10000,
        //                                                    onOrders: 0,
        //                                      normalizedTotalBalance: 310,
        //                                          normalizedOnOrders: 0,
        //                                                  percentage: 3.004116443856034,
        //                                                serializedAt: 1543324487949      },
        //                     relationships: {           currency: { data: { type: "currency", id: "ETH" } },
        //                                      normalizedCurrency: { data: { type: "currency", id: "BTC" } }  } }  ],
        //       included: [ {          type:   "currency",
        //                                id:   "BTC",
        //                        attributes: {          name: "Bitcoin",
        //                                          shortName: "BTC",
        //                                             active:  true,
        //                                           accuracy:  8,
        //                                       allowDeposit:  true,
        //                                      allowWithdraw:  true,
        //                                        allowWallet:  true,
        //                                         allowTrade:  true,
        //                                       serializedAt:  1543324487948 },
        //                     relationships: {  }                               },
        //                   {       type:   "currency",
        //                             id:   "ETH",
        //                     attributes: {          name: "Ethereum",
        //                                       shortName: "ETH",
        //                                          active:  true,
        //                                        accuracy:  8,
        //                                    allowDeposit:  true,
        //                                   allowWithdraw:  true,
        //                                     allowWallet:  true,
        //                                      allowTrade:  true,
        //                                    serializedAt:  1543324487948 } }      ]                                  }
        //
        const result = { 'info': response };
        const data = this.safeValue (response, 'data');
        if (data !== undefined) {
            for (let i = 0; i < data.length; i++) {
                const balance = data[i];
                const attributes = this.safeValue (balance, 'attributes', {});
                const relationships = this.safeValue (balance, 'relationships', {});
                const currencyRelationship = this.safeValue (relationships, 'currency', {});
                const currencyRelationshipData = this.safeValue (currencyRelationship, 'data');
                const currencyId = this.safeString (currencyRelationshipData, 'id');
                const code = this.commonCurrencyCode (currencyId);
                let account = this.account ();
                let total = this.safeFloat (attributes, 'totalBalance');
                let used = this.safeFloat (attributes, 'onOrders');
                let free = total - used;
                account['free'] = free;
                account['used'] = used;
                account['total'] = total;
                result[code] = account;
            }
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

    parseOrderBook (orderbook, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 'price', amountKey = 'amount') {
        const bids = [];
        const asks = [];
        let numBidAsks = orderbook.length;
        if (numBidAsks > 0) {
            timestamp = this.safeInteger (orderbook[0]['attributes'], 'serializedAt');
        }
        for (let i = 0; i < orderbook.length; i++) {
            const bidask = orderbook[i];
            const attributes = this.safeValue (bidask, 'attributes', {});
            let currenTimestamp = this.safeInteger (attributes, 'serializedAt');
            timestamp = Math.max (timestamp, currenTimestamp);
            const id = this.safeString (bidask, 'id');
            if (id.indexOf ('OBID') >= 0) {
                bids.push (this.parseBidAsk (bidask['attributes'], priceKey, amountKey));
            } else if (id.indexOf ('OSID') >= 0) {
                asks.push (this.parseBidAsk (bidask['attributes'], priceKey, amountKey));
            } else {
                throw ExchangeError (this.id + ' parseOrderBook encountered an unrecognized bidask format: ' + this.json (bidask));
            }
        }
        return {
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'filters[symbol]': market['id'],
        };
        const response = await this.publicGetOrderBook (this.extend (request, params));
        //
        //     { data: [ {       type:   "orderBook",
        //                         id:   "OBID0SLTCETHS0",
        //                 attributes: {        price: 1,
        //                                     amount: 4,
        //                               serializedAt: 1543116143473 } },
        //               {       type:   "orderBook",
        //                         id:   "OSID3SLTCETHS0",
        //                 attributes: {        price: 12,
        //                                     amount: 12,
        //                               serializedAt: 1543116143474 } }  ] }
        //
        return this.parseOrderBook (response['data'], undefined, 'bids', 'asks', 'price', 'amount');
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
        const price = this.safeFloat (attributes, 'price');
        const amount = this.safeFloat (attributes, 'amount');
        let cost = this.safeFloat (attributes, 'total');
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
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
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
        const request = {
            // 'market': this.marketId (symbol),
            // 'state': 'wait', 'done', 'cancel',
            // 'page': 1,
            // 'order_by': 'asc',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.marketId (symbol);
            request['filters[symbol]'] = market['id'];
        }
        const response = await this.privateGetOrder (this.extend (request, params));
        //
        //     {
        //         "data": [{
        //             "id": "string",
        //             "type": "order",
        //             "attributes": {
        //                 "operation": "buy",
        //                 "orderType": "market",
        //                 "amount": 0,
        //                 "price": 0,
        //                 "averagePrice": 0,
        //                 "fee": 0,
        //                 "filled": 0,
        //                 "stop": 0,
        //                 "timeOpen": "2018-11-27T13:30:21Z",
        //                 "timeClose": "2018-11-27T13:30:21Z",
        //                 "comment": "string",
        //                 "status": "open",
        //                 "flag": "stop"
        //             },
        //             "relationships": {
        //                 "symbol": { "data": { "id": "string", "type": "symbol" } },
        //                 "trades": { "data": [ { "id": "string", "type": "trade" } ] }
        //             }
        //         }],
        //         "included": [{
        //             "id": "string",
        //             "type": "trade",
        //             "attributes": {
        //                 "fee": 0,
        //                 "price": 0,
        //                 "amount": 0,
        //                 "total": 0,
        //                 "operation": "buy",
        //                 "createdAt": "2018-11-27T13:30:21Z"
        //             },
        //             "relationships": { "symbol": { "data": { "id": "string", "type": "symbol" } } }
        //         }]
        //     }
        //
        return this.parseOrders (response['data'], market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'filters[status]': 'open',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'filters[status]': 'closed',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        let response = await this.privateGetOrderId (this.extend (request, params));
        //
        //     {
        //         "data": [{
        //             "id": "string",
        //             "type": "order",
        //             "attributes": {
        //                 "operation": "buy",
        //                 "orderType": "market",
        //                 "amount": 0,
        //                 "price": 0,
        //                 "averagePrice": 0,
        //                 "fee": 0,
        //                 "filled": 0,
        //                 "stop": 0,
        //                 "timeOpen": "2018-11-27T13:30:21Z",
        //                 "timeClose": "2018-11-27T13:30:21Z",
        //                 "comment": "string",
        //                 "status": "open",
        //                 "flag": "stop"
        //             },
        //             "relationships": {
        //                 "symbol": { "data": { "id": "string", "type": "symbol" } },
        //                 "trades": { "data": [ { "id": "string", "type": "trade" } ] }
        //             }
        //         }],
        //         "included": [{
        //             "id": "string",
        //             "type": "trade",
        //             "attributes": {
        //                 "fee": 0,
        //                 "price": 0,
        //                 "amount": 0,
        //                 "total": 0,
        //                 "operation": "buy",
        //                 "createdAt": "2018-11-27T13:30:21Z"
        //             },
        //             "relationships": { "symbol": { "data": { "id": "string", "type": "symbol" } } }
        //         }]
        //     }
        //
        return this.parseOrder (response['data']);
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
            // const jwt = this.jwt (request, this.secret);
            headers = {
                // 'Authorization': 'Bearer ' + jwt,
                'Cookie': 'token=' + this.apiKey,
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
        //     {"errors":[{"code":"AUTH","title":"Not authorized","detail":"User is not authorized"}]}
        //     {"errors":[{"status":"400","title":"Bad Request","detail":"symbol filter is not filled"}]}
        //     {"errors":[{"status":"401","title":"Unauthorized","detail":"You are not authorized"}]}
        //     {"errors":[{"status":"500","title":"TypeError","detail":"TypeError: Cannot read property 'buy' of undefined"}]}
        //     {"errors":[{"status":"404","title":"Not Found","detail":"Order is not found"}]}
        //
        const errors = this.safeValue (response, 'errors', []);
        const numErrors = errors.length;
        if (numErrors > 0) {
            const error = errors[0];
            const code = this.safeString (error, 'code');
            const status = this.safeString (error, 'status');
            const title = this.safeString (error, 'title');
            const detail = this.safeString (error, 'detail');
            const feedback = this.id + ' ' + this.json (response);
            const exact = this.exceptions['exact'];
            if (code in exact) {
                throw new exact[code] (feedback);
            }
            if (status in exact) {
                throw new exact[status] (feedback);
            }
            if (title in exact) {
                throw new exact[title] (feedback);
            }
            if (detail in exact) {
                throw new exact[detail] (feedback);
            }
            const broad = this.exceptions['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, body);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
