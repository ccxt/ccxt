'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, AuthenticationError, InvalidOrder, InsufficientFunds, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class adara extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'adara',
            'name': 'Adara',
            'countries': [ 'MT' ],
            'version': 'v1',
            'rateLimit': 1000,
            'certified': false,
            // new metainfo interface
            'has': {
                'CORS': true,
                'fetchCurrencies': true,
                'fetchOrderBooks': false,
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
                'apiKey': true,
                'secret': true,
                'token': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/49189583-0466a780-f380-11e8-9248-57a631aad2d6.jpg',
                'api': 'https://api.adara.io',
                'www': 'https://adara.io',
                'doc': 'https://api.adara.io/v1',
                'fees': 'https://adara.io/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'limits',
                        'market',
                        'marketDepth',
                        'marketInfo',
                        'orderBook',
                        'quote/',
                        'quote/{id}',
                        'symbols',
                        'trade',
                    ],
                    'post': [
                        'confirmContactEmail',
                        'restorePassword',
                        'user', // sign up
                    ],
                },
                'private': {
                    'get': [
                        'balance',
                        'order',
                        'order/{id}',
                        'currencyBalance',
                        'apiKey', // the list of apiKeys
                        'user/{id}',
                    ],
                    'post': [
                        'order',
                        'recovery',
                        'user',
                        'apiKey',  // sign in and optionally create an apiKey
                        'contact',
                    ],
                    'patch': [
                        'order/{id}',
                        'user/{id}', // change password
                        'customer', // update user info
                    ],
                    'delete': [
                        'apiKey',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.001,
                    'taker': 0.001,
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
                    'Insufficient funds': InsufficientFunds,
                    'Amount is too small': InvalidOrder,
                    'operation has invalid value': InvalidOrder,
                    "closed order can't be changed": InvalidOrder,
                    'Order is not found': OrderNotFound,
                    'AUTH': AuthenticationError,
                    'You are not authorized': AuthenticationError,
                    'Bad Request': BadRequest,
                    '500': ExchangeError,
                },
                'broad': {},
            },
        });
    }

    async fetchMarkets (params = {}) {
        const request = {
            'include': 'from,to',
        };
        const response = await this.publicGetSymbols (this.extend (request, params));
        const included = this.safeValue (response, 'included', []);
        const includedByType = this.groupBy (included, 'type');
        const currencies = this.safeValue (includedByType, 'currency', []);
        const currenciesById = this.indexBy (currencies, 'id');
        //
        //     {     meta: { total: 61 },
        //           data: [ {            id:   "XRPUSD",
        //                              type:   "symbol",
        //                        attributes: { allowTrade:  false,
        //                                       createdAt: "2018-10-23T09:31:06.830Z",
        //                                          digits:  5,
        //                                        fullName: "XRPUSD",
        //                                        makerFee: "0.0250",
        //                                            name: "XRPUSD",
        //                                        takerFee: "0.0250",
        //                                       updatedAt: "2018-10-23T09:31:06.830Z"  },
        //                     relationships: { from: { data: { id: "XRP", type: "currency" } },
        //                                        to: { data: { id: "USD", type: "currency" } }  } },
        //                   {            id:   "XRPETH",
        //                              type:   "symbol",
        //                        attributes: { allowTrade:  true,
        //                                       createdAt: "2018-10-09T22:34:28.268Z",
        //                                          digits:  8,
        //                                        fullName: "XRPETH",
        //                                        makerFee: "0.0025",
        //                                            name: "XRPETH",
        //                                        takerFee: "0.0025",
        //                                       updatedAt: "2018-10-09T22:34:28.268Z"  },
        //                     relationships: { from: { data: { id: "XRP", type: "currency" } },
        //                                        to: { data: { id: "ETH", type: "currency" } }  } }  ],
        //       included: [ {            id:   "XRP",
        //                              type:   "currency",
        //                        attributes: {               accuracy:  4,
        //                                                      active:  true,
        //                                                allowDeposit:  true,
        //                                                  allowTrade:  false,
        //                                                 allowWallet:  true,
        //                                               allowWithdraw:  true,
        //                                                        name: "Ripple",
        //                                                   shortName: "XRP",
        //                                      transactionUriTemplate: "https://www.ripplescan.com/transactions/:txId",
        //                                           walletUriTemplate: "https://www.ripplescan.com/accounts/:address",
        //                                                 withdrawFee: "0.20000000",
        //                                           withdrawMinAmount: "22.00000000"                                    },
        //                     relationships: {  }                                                                          },
        //                   {            id:   "ETH",
        //                              type:   "currency",
        //                        attributes: {               accuracy:  8,
        //                                                      active:  true,
        //                                                allowDeposit:  true,
        //                                                  allowTrade:  true,
        //                                                 allowWallet:  true,
        //                                               allowWithdraw:  true,
        //                                                        name: "Ethereum",
        //                                                   shortName: "ETH",
        //                                      transactionUriTemplate: "https://etherscan.io/tx/:txId",
        //                                           walletUriTemplate: "https://etherscan.io/address/:address",
        //                                                 withdrawFee: "0.00800000",
        //                                           withdrawMinAmount: "0.02000000"                             },
        //                     relationships: {  }                                                                  },
        //                   {            id:   "USD",
        //                              type:   "currency",
        //                        attributes: {               accuracy:  6,
        //                                                      active:  true,
        //                                                allowDeposit:  false,
        //                                                  allowTrade:  true,
        //                                                 allowWallet:  false,
        //                                               allowWithdraw:  false,
        //                                                        name: "USD",
        //                                                   shortName: "USD",
        //                                      transactionUriTemplate:  null,
        //                                           walletUriTemplate:  null,
        //                                                 withdrawFee: "0.00000000",
        //                                           withdrawMinAmount: "0.00000000"  },
        //                     relationships: {  }                                       }                          ] }
        //
        const result = [];
        const markets = response['data'];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const attributes = this.safeValue (market, 'attributes', {});
            const relationships = this.safeValue (market, 'relationships', {});
            const fromRelationship = this.safeValue (relationships, 'from', {});
            const toRelationship = this.safeValue (relationships, 'to', {});
            const fromRelationshipData = this.safeValue (fromRelationship, 'data', {});
            const toRelationshipData = this.safeValue (toRelationship, 'data', {});
            const baseId = this.safeString (fromRelationshipData, 'id');
            const quoteId = this.safeString (toRelationshipData, 'id');
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const baseCurrency = this.safeValue (currenciesById, baseId, {});
            const baseCurrencyAttributes = this.safeValue (baseCurrency, 'attributes', {});
            const symbol = base + '/' + quote;
            const amountPrecision = this.safeInteger (baseCurrencyAttributes, 'accuracy', 8);
            const pricePrecision = this.safeInteger (attributes, 'digits', 8);
            const precision = {
                'amount': amountPrecision,
                'price': pricePrecision,
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

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        //
        //     {     meta: { total: 22 },
        //           data: [ {            id:   "USD",
        //                              type:   "currency",
        //                        attributes: {               accuracy:  6,
        //                                                      active:  true,
        //                                                allowDeposit:  false,
        //                                                  allowTrade:  true,
        //                                                 allowWallet:  false,
        //                                               allowWithdraw:  false,
        //                                                        name: "USD",
        //                                                   shortName: "USD",
        //                                      transactionUriTemplate:  null,
        //                                           walletUriTemplate:  null,
        //                                                 withdrawFee: "0.00000000",
        //                                           withdrawMinAmount: "0.00000000"  },
        //                     relationships: {  }                                       },
        //                   {            id:   "BTC",
        //                              type:   "currency",
        //                        attributes: {               accuracy:  8,
        //                                                      active:  true,
        //                                                allowDeposit:  true,
        //                                                  allowTrade:  true,
        //                                                 allowWallet:  true,
        //                                               allowWithdraw:  true,
        //                                                        name: "Bitcoin",
        //                                                   shortName: "BTC",
        //                                      transactionUriTemplate: "https://blockexplorer.com/tx/:txId",
        //                                           walletUriTemplate: "https://blockexplorer.com/address/:address",
        //                                                 withdrawFee: "0.00050000",
        //                                           withdrawMinAmount: "0.00200000"                                  },
        //                     relationships: {  }                                                                      }                           ],
        //       included: []                                                                                                                          }
        //
        const currencies = response['data'];
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const attributes = this.safeValue (currency, 'attributes', {});
            const code = this.commonCurrencyCode (id);
            const precision = this.safeInteger (attributes, 'accuracy');
            const fee = this.safeFloat (attributes, 'withdrawFee');
            const active = this.safeValue (attributes, 'active');
            const allowDeposit = this.safeValue (attributes, 'allowDeposit');
            const allowWithdraw = this.safeValue (attributes, 'allowWithdraw');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': this.safeString (attributes, 'name'),
                'active': (active && allowDeposit && allowWithdraw),
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (attributes, 'withdrawMinAmount'),
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
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
                const account = this.account ();
                account['total'] = this.safeFloat (attributes, 'totalBalance');
                account['used'] = this.safeFloat (attributes, 'onOrders');
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
        const numBidAsks = orderbook.length;
        if (numBidAsks > 0) {
            timestamp = this.safeInteger (orderbook[0]['attributes'], 'serializedAt');
        }
        for (let i = 0; i < orderbook.length; i++) {
            const bidask = orderbook[i];
            const attributes = this.safeValue (bidask, 'attributes', {});
            const currenTimestamp = this.safeInteger (attributes, 'serializedAt');
            timestamp = Math.max (timestamp, currenTimestamp);
            const id = this.safeString (bidask, 'id');
            if (id.indexOf ('OBID') >= 0) {
                bids.push (this.parseBidAsk (bidask['attributes'], priceKey, amountKey));
            } else if (id.indexOf ('OSID') >= 0) {
                asks.push (this.parseBidAsk (bidask['attributes'], priceKey, amountKey));
            } else {
                throw new ExchangeError (this.id + ' parseOrderBook encountered an unrecognized bidask format: ' + this.json (bidask));
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
        const filters = 'filters[symbol]';
        const request = {};
        request[filters] = market['id'];
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
        const response = await this.publicGetQuote (params);
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
        const result = {};
        for (let t = 0; t < data.length; t++) {
            const ticker = this.parseTicker (data[t]);
            const symbol = ticker['symbol'];
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
        market = this.safeValue (this.markets_by_id, marketId, market);
        let symbol = undefined;
        let feeCurrency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        } else if (marketId !== undefined) {
            const baseIdLength = marketId.length - 3;
            const baseId = marketId.slice (0, baseIdLength);
            const quoteId = marketId.slice (baseIdLength);
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            symbol = base + '/' + quote;
            feeCurrency = quote;
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
                    cost = parseFloat (this.costToPrecision (symbol, price * amount));
                }
            }
        }
        const feeCost = this.safeFloat (attributes, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return {
            'id': id,
            'info': trade,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
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
        const response = await this.publicGetTrade (this.extend (request, params));
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'data': {
                'type': 'order',
                'attributes': {
                    'amount': parseFloat (this.amountToPrecision (symbol, amount)),
                    'operation': side,
                    'orderType': type,
                    'price': parseFloat (this.priceToPrecision (symbol, price)),
                },
                'relationships': {
                    'symbol': {
                        'data': {
                            'id': market['id'],
                            'type': 'symbol',
                        },
                    },
                },
            },
            'included': [
                {
                    'id': market['id'],
                    'type': 'symbol',
                },
            ],
        };
        const response = await this.privatePostOrder (this.extend (request, params));
        //
        //     { included: [ {       type:   "currency",
        //                             id:   "XLM",
        //                     attributes: {          name: "Stellar",
        //                                       shortName: "XLM",
        //                                          active:  true,
        //                                        accuracy:  8,
        //                                    allowDeposit:  true,
        //                                   allowWithdraw:  true,
        //                                     allowWallet:  true,
        //                                      allowTrade:  false,
        //                                    serializedAt:  1543434477449 } },
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
        //                                    serializedAt:  1543434477449 } },
        //                   {          type:   "symbol",
        //                                id:   "XLMBTC",
        //                        attributes: {     fullName: "XLMBTC",
        //                                            digits:  6,
        //                                        allowTrade:  true,
        //                                      serializedAt:  1543434477449 },
        //                     relationships: { from: { data: { type: "currency", id: "XLM" } },
        //                                        to: { data: { type: "currency", id: "BTC" } }  } } ],
        //           data: {          type:   "order",
        //                              id:   "34793",
        //                      attributes: { serializedAt:    1543434477449,
        //                                       operation:   "buy",
        //                                       orderType:   "limit",
        //                                        clientId:   "4733ea40-7d5c-4ddc-aec5-eb41baf90555",
        //                                          amount:    220,
        //                                           price:    0.000035,
        //                                    averagePrice:    0,
        //                                             fee:    0,
        //                                        timeOpen:   "2018-11-28T19:47:57.435Z",
        //                                       timeClose:    null,
        //                                          status:   "open",
        //                                          filled:    0,
        //                                           flags: []                                        },
        //                   relationships: { symbol: { data: { type: "symbol", id: "XLMBTC" } } }       } }
        //
        return this.parseOrder (response['data']);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
            'data': {
                'attributes': {
                    'status': 'canceled',
                },
            },
        };
        const response = await this.privatePatchOrderId (this.extend (request, params));
        //
        //     { included: [ {       type:   "currency",
        //                             id:   "XLM",
        //                     attributes: {          name: "Stellar",
        //                                       shortName: "XLM",
        //                                          active:  true,
        //                                        accuracy:  8,
        //                                    allowDeposit:  true,
        //                                   allowWithdraw:  true,
        //                                     allowWallet:  true,
        //                                      allowTrade:  false,
        //                                    serializedAt:  1543437874742 } },
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
        //                                    serializedAt:  1543437874742 } },
        //                   {          type:   "symbol",
        //                                id:   "XLMBTC",
        //                        attributes: {     fullName: "XLMBTC",
        //                                            digits:  6,
        //                                        allowTrade:  true,
        //                                      serializedAt:  1543437874742 },
        //                     relationships: { from: { data: { type: "currency", id: "XLM" } },
        //                                        to: { data: { type: "currency", id: "BTC" } }  } } ],
        //           data: {          type:   "order",
        //                              id:   "34794",
        //                      attributes: { serializedAt:    1543437874742,
        //                                       operation:   "buy",
        //                                       orderType:   "limit",
        //                                        clientId:   "4733ea40-7d5c-4ddc-aec5-eb41baf90555",
        //                                          amount:    110,
        //                                           price:    0.000034,
        //                                    averagePrice:    0,
        //                                             fee:    0,
        //                                        timeOpen:   "2018-11-28T20:42:35.486Z",
        //                                       timeClose:    null,
        //                                          status:   "canceled",
        //                                          filled:    0,
        //                                           flags: []                                        },
        //                   relationships: { symbol: { data: { type: "symbol", id: "XLMBTC" } } }       } }
        //
        return this.parseOrder (response['data']);
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'closed': 'closed',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //         {          type:   "order",
        //                      id:   "34793",
        //              attributes: { serializedAt:  1543435013349,
        //                               operation: "buy",
        //                               orderType: "limit",
        //                                clientId: "4733ea40-7d5c-4ddc-aec5-eb41baf90555",
        //                                  amount:  220,
        //                                   price:  0.000035,
        //                            averagePrice:  0.000035,
        //                                     fee:  0.0001925,
        //                                timeOpen: "2018-11-28T19:47:57.435Z",
        //                               timeClose: "2018-11-28T19:47:57.452Z",
        //                                  status: "closed",
        //                                  filled:  220,
        //                                   flags:  null                                   },
        //           relationships: { symbol: { data: { type: "symbol", id: "XLMBTC" } } } }
        //
        const id = this.safeString (order, 'id');
        const attributes = this.safeValue (order, 'attributes', {});
        const relationships = this.safeValue (order, 'relationships', {});
        const symbolRelationship = this.safeValue (relationships, 'symbol', {});
        const symbolRelationshipData = this.safeValue (symbolRelationship, 'data', {});
        const tradesRelationship = this.safeValue (relationships, 'trades', {});
        const tradesRelationshipData = this.safeValue (tradesRelationship, 'data');
        const marketId = this.safeString (symbolRelationshipData, 'id');
        market = this.safeValue (this.markets_by_id, marketId, market);
        let feeCurrency = undefined;
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        } else if (marketId !== undefined) {
            const baseIdLength = marketId.length - 3;
            const baseId = marketId.slice (0, baseIdLength);
            const quoteId = marketId.slice (baseIdLength);
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            symbol = base + '/' + quote;
            feeCurrency = quote;
        }
        const timestamp = this.parse8601 (this.safeString (attributes, 'timeOpen'));
        const side = this.safeString (attributes, 'operation');
        const type = this.safeString (attributes, 'orderType');
        const status = this.parseOrderStatus (this.safeString (attributes, 'status'));
        const lastTradeTimestamp = this.parse8601 (this.safeString (attributes, 'timeClose'));
        const price = this.safeFloat (attributes, 'price');
        const amount = this.safeFloat (attributes, 'amount');
        const filled = this.safeFloat (attributes, 'filled');
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = Math.max (0, amount - filled);
            }
        }
        let cost = undefined;
        const average = this.safeFloat (attributes, 'averagePrice');
        if (cost === undefined) {
            if ((average !== undefined) && (filled !== undefined)) {
                cost = parseFloat (this.costToPrecision (symbol, average * filled));
            }
        }
        let fee = undefined;
        const feeCost = this.safeFloat (attributes, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'currency': feeCurrency,
                'cost': feeCost,
            };
        }
        let trades = undefined;
        if (tradesRelationshipData !== undefined) {
            const numTrades = tradesRelationshipData.length;
            if (numTrades > 0) {
                trades = this.parseTrades (tradesRelationshipData, market);
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
            'include': 'trades',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            const filters = 'filters[symbol]';
            request[filters] = market['id'];
        }
        const response = await this.privateGetOrder (this.extend (request, params));
        //
        //     {     data: [ {          type:   "order",
        //                                id:   "34793",
        //                        attributes: { serializedAt:  1543436770259,
        //                                         operation: "buy",
        //                                         orderType: "limit",
        //                                            amount:  220,
        //                                             price:  0.000035,
        //                                      averagePrice:  0.000035,
        //                                               fee:  0.0001925,
        //                                          timeOpen: "2018-11-28T19:47:57.435Z",
        //                                         timeClose: "2018-11-28T19:47:57.452Z",
        //                                            status: "closed",
        //                                            filled:  220,
        //                                             flags:  null                       },
        //                     relationships: { symbol: { data: { type: "symbol", id: "XLMBTC" } },
        //                                      trades: { data: [{ type: "trade", id: "34789_34793" }] } } } ],
        //       included: [ {       type:   "currency",
        //                             id:   "XLM",
        //                     attributes: {          name: "Stellar",
        //                                       shortName: "XLM",
        //                                          active:  true,
        //                                        accuracy:  8,
        //                                    allowDeposit:  true,
        //                                   allowWithdraw:  true,
        //                                     allowWallet:  true,
        //                                      allowTrade:  false,
        //                                    serializedAt:  1543436770259 } },
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
        //                                    serializedAt:  1543436770259 } },
        //                   {          type:   "symbol",
        //                                id:   "XLMBTC",
        //                        attributes: {     fullName: "XLMBTC",
        //                                            digits:  6,
        //                                        allowTrade:  true,
        //                                      serializedAt:  1543436770259 },
        //                     relationships: { from: { data: { type: "currency", id: "XLM" } },
        //                                        to: { data: { type: "currency", id: "BTC" } }  } },
        //                   {       type:   "trade",
        //                             id:   "34789_34793",
        //                     attributes: {       fee:  0.0001925,
        //                                       price:  0.000035,
        //                                      amount:  220,
        //                                       total:  0.0077,
        //                                   operation: "buy",
        //                                   createdAt: "2018-11-28T19:47:57.451Z" } }                ],
        //           meta: { total: 1 }                                                                         }
        //
        return this.parseOrdersResponse (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const filters = 'filters[status][]';
        const request = {};
        request[filters] = 'open';
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const filters = 'filters[status][]';
        const request = {};
        request[filters] = 'closed';
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    parseOrdersResponse (response, market = undefined, since = undefined, limit = undefined) {
        const included = this.safeValue (response, 'included', []);
        const includedByType = this.groupBy (included, 'type');
        const unparsedTrades = this.safeValue (includedByType, 'trade', []);
        const trades = this.parseTrades (unparsedTrades, market);
        const tradesById = this.indexBy (trades, 'id');
        const orders = this.parseOrders (this.safeValue (response, 'data', []), market, since, limit);
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const orderTrades = [];
            const orderFee = this.safeValue (order, 'fee', {});
            const orderFeeCurrency = this.safeString (orderFee, 'currency');
            if (order['trades'] !== undefined) {
                for (let j = 0; j < order['trades'].length; j++) {
                    const orderTrade = order['trades'][j];
                    const orderTradeId = orderTrade['id'];
                    if (orderTradeId in tradesById) {
                        orderTrades.push (this.deepExtend (tradesById[orderTradeId], {
                            'order': order['id'],
                            'type': order['type'],
                            'symbol': order['symbol'],
                            'fee': {
                                'currency': orderFeeCurrency,
                            },
                        }));
                    }
                }
            }
            const numOrderTrades = orderTrades.length;
            if (numOrderTrades > 0) {
                order['trades'] = orderTrades;
            }
            result.push (order);
        }
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
            'include': 'trades',
        };
        const response = await this.privateGetOrderId (this.extend (request, params));
        //
        //     { included: [ {       type:   "currency",
        //                             id:   "XLM",
        //                     attributes: {          name: "Stellar",
        //                                       shortName: "XLM",
        //                                          active:  true,
        //                                        accuracy:  8,
        //                                    allowDeposit:  true,
        //                                   allowWithdraw:  true,
        //                                     allowWallet:  true,
        //                                      allowTrade:  false,
        //                                    serializedAt:  1543436451996 } },
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
        //                                    serializedAt:  1543436451996 } },
        //                   {          type:   "symbol",
        //                                id:   "XLMBTC",
        //                        attributes: {     fullName: "XLMBTC",
        //                                            digits:  6,
        //                                        allowTrade:  true,
        //                                      serializedAt:  1543436451996 },
        //                     relationships: { from: { data: { type: "currency", id: "XLM" } },
        //                                        to: { data: { type: "currency", id: "BTC" } }  } },
        //                   {       type:   "trade",
        //                             id:   "34789_34793",
        //                     attributes: {       fee:  0.0001925,
        //                                       price:  0.000035,
        //                                      amount:  220,
        //                                       total:  0.0077,
        //                                   operation: "buy",
        //                                   createdAt: "2018-11-28T19:47:57.451Z" } }                ],
        //           data: {          type:   "order",
        //                              id:   "34793",
        //                      attributes: { serializedAt:  1543436451996,
        //                                       operation: "buy",
        //                                       orderType: "limit",
        //                                        clientId: "4733ea40-7d5c-4ddc-aec5-eb41baf90555",
        //                                          amount:  220,
        //                                           price:  0.000035,
        //                                    averagePrice:  0.000035,
        //                                             fee:  0.0001925,
        //                                        timeOpen: "2018-11-28T19:47:57.435Z",
        //                                       timeClose: "2018-11-28T19:47:57.452Z",
        //                                          status: "closed",
        //                                          filled:  220,
        //                                           flags:  null                                   },
        //                   relationships: { symbol: { data: { type: "symbol", id: "XLMBTC" } },
        //                                    trades: { data: [{ type: "trade", id: "34789_34793" }] } } } }
        //
        const data = this.safeValue (response, 'data');
        response['data'] = [];
        response['data'].push (data);
        const orders = this.parseOrdersResponse (response);
        const ordersById = this.indexBy (orders, 'id');
        if (id in ordersById) {
            return ordersById[id];
        }
        throw new OrderNotFound (this.id + ' fetchOrder could not find order id ' + id.toString ());
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let payload = '/' + this.implodeParams (path, params);
        let url = this.urls['api'] + '/' + this.version + payload;
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            const nonce = this.nonce ();
            let expiredAt = this.sum (nonce, this.safeInteger (this.options, 'expiredAt', 10000));
            expiredAt = expiredAt.toString ();
            if ((method === 'POST') || (method === 'PATCH')) {
                body = this.json (query);
                payload = body;
            }
            if (this.token) {
                headers = {
                    'Cookie': 'token=' + this.token,
                };
            } else {
                this.checkRequiredCredentials ();
                const auth = method + payload + 'expiredAt=' + expiredAt;
                const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512', 'base64');
                headers = {
                    'X-ADX-EXPIRE': expiredAt,
                    'X-ADX-APIKEY': this.apiKey,
                    'X-ADX-SIGNATURE': signature,
                };
            }
            if (method !== 'GET') {
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        const errors = this.safeValue (response, 'errors', []);
        const numErrors = errors.length;
        if (numErrors > 0) {
            const error = errors[0];
            const code = this.safeString (error, 'code');
            const status = this.safeString (error, 'status');
            const title = this.safeString (error, 'title');
            const detail = this.safeString (error, 'detail');
            const feedback = this.id + ' ' + this.json (response);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], status, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], title, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], detail, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
