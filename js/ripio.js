'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, BadSymbol, BadRequest, InvalidOrder, ArgumentsRequired, OrderNotFound, InsufficientFunds, DDoSProtection } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class ripio extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ripio',
            'name': 'Ripio',
            'countries': [ 'AR', 'BR' ], // Argentina
            'rateLimit': 50,
            'version': 'v1',
            'pro': true,
            // new metainfo interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/94507548-a83d6a80-0218-11eb-9998-28b9cec54165.jpg',
                'api': {
                    'public': 'https://api.exchange.ripio.com/api',
                    'private': 'https://api.exchange.ripio.com/api',
                },
                'www': 'https://exchange.ripio.com',
                'doc': [
                    'https://exchange.ripio.com/en/api/',
                ],
                'fees': 'https://exchange.ripio.com/en/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'rate/all/',
                        'rate/{pair}/',
                        'orderbook/{pair}/',
                        'tradehistory/{pair}/',
                        'pair/',
                        'currency/',
                        'orderbook/{pair}/depth/',
                    ],
                },
                'private': {
                    'get': [
                        'balances/exchange_balances/',
                        'order/{pair}/{order_id}/',
                        'order/{pair}/',
                        'trade/{pair}/',
                    ],
                    'post': [
                        'order/{pair}/',
                        'order/{pair}/{order_id}/cancel/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0'),
                    'maker': this.parseNumber ('0.0'),
                },
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                    'Authentication credentials were not provided': AuthenticationError, // {"detail":"Authentication credentials were not provided."}
                    'Disabled pair': BadSymbol, // {"status_code":400,"errors":{"pair":["Invalid/Disabled pair BTC_ARS"]},"message":"An error has occurred, please check the form."}
                    'Invalid order type': InvalidOrder, // {"status_code":400,"errors":{"order_type":["Invalid order type. Valid options: ['MARKET', 'LIMIT']"]},"message":"An error has occurred, please check the form."}
                    'Your balance is not enough': InsufficientFunds, // {"status_code":400,"errors":{"non_field_errors":["Your balance is not enough for this order: You have 0 BTC but you need 1 BTC"]},"message":"An error has occurred, please check the form."}
                    "Order couldn't be created": ExchangeError, // {'status_code': 400,'errors': {'non_field_errors': _("Order couldn't be created")}, 'message': _('Seems like an unexpected error occurred. Please try again later or write us to support@ripio.com if the problem persists.') }
                    // {"status_code":404,"errors":{"order":["Order 286e560e-b8a2-464b-8b84-15a7e2a67eab not found."]},"message":"An error has occurred, please check the form."}
                    // {"status_code":404,"errors":{"trade":["Trade <trade_id> not found."]},"message":"An error has occurred, please check the form."}
                    'not found': OrderNotFound,
                    'Invalid pair': BadSymbol, // {"status_code":400,"errors":{"pair":["Invalid pair FOOBAR"]},"message":"An error has occurred, please check the form."}
                    'amount must be a number': BadRequest, // {"status_code":400,"errors":{"amount":["amount must be a number"]},"message":"An error has occurred, please check the form."}
                    'Total must be at least': InvalidOrder, // {"status_code":400,"errors":{"non_field_errors":["Total must be at least 10."]},"message":"An error has occurred, please check the form."}
                    'Account not found': BadRequest, // {"error_description": "Account not found."}, "status": 404
                    'Wrong password provided': AuthenticationError, // {'error': "Wrong password provided."}, “status_code”: 400
                    'User tokens limit': DDoSProtection, // {'error': "User tokens limit. Can't create more than 10 tokens."}, “status_code”: 400
                    'Something unexpected ocurred': ExchangeError, // {'status_code': 400, 'errors': {'non_field_errors': 'Something unexpected ocurred!'}, 'message': 'Seems like an unexpected error occurred. Please try again later or write us to support@ripio.com if the problem persists.'}
                    // {'status_code': 404, 'errors': {'account_balance': ['Exchange balance <currency>not found.']},'message': 'An error has occurred, please check the form.'}
                    // {'status_code': 404, 'errors': {'account_balance': ['Account balance <id> not found.']},'message': 'An error has occurred, please check the form.'}
                    'account_balance': BadRequest,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name ripio#fetchMarkets
         * @description retrieves data on all markets for ripio
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetPair (params);
        //
        //     {
        //         "next":null,
        //         "previous":null,
        //         "results":[
        //             {
        //                 "base":"BTC",
        //                 "base_name":"Bitcoin",
        //                 "quote":"USDC",
        //                 "quote_name":"USD Coin",
        //                 "symbol":"BTC_USDC",
        //                 "fees":[
        //                     {
        //                         "traded_volume": 0.0,
        //                         "maker_fee": 0.0,
        //                         "taker_fee": 0.0,
        //                         "cancellation_fee": 0.0
        //                     }
        //                 ],
        //                 "country":"ZZ",
        //                 "enabled":true,
        //                 "priority":10,
        //                 "min_amount":"0.00001",
        //                 "price_tick":"0.000001",
        //                 "min_value":"10",
        //                 "limit_price_threshold":"25.00"
        //             },
        //         ]
        //     }
        //
        const result = [];
        const results = this.safeValue (response, 'results', []);
        for (let i = 0; i < results.length; i++) {
            const market = results[i];
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const id = this.safeString (market, 'symbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const fees = this.safeValue (market, 'fees', []);
            const firstFee = this.safeValue (fees, 0, {});
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': this.safeValue (market, 'enabled', true),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.safeNumber (firstFee, 'taker_fee', 0.0),
                'maker': this.safeNumber (firstFee, 'maker_fee', 0.0),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'min_amount'),
                    'price': this.safeNumber (market, 'price_tick'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_amount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_value'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name ripio#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetCurrency (params);
        //
        //     {
        //         "next":null,
        //         "previous":null,
        //         "results":[
        //             {
        //                 "name":"Argentine Peso",
        //                 "symbol":"$",
        //                 "currency":"ARS",
        //                 "country":"AR",
        //                 "decimal_places":"2",
        //                 "enabled":true
        //             },
        //             {
        //                 "name":"Bitcoin Cash",
        //                 "symbol":"BCH",
        //                 "currency":"BCH",
        //                 "country":"AR",
        //                 "decimal_places":"8",
        //                 "enabled":true
        //             },
        //             {
        //                 "name":"Bitcoin",
        //                 "symbol":"BTC",
        //                 "currency":"BTC",
        //                 "country":"AR",
        //                 "decimal_places":"8",
        //                 "enabled":true
        //             }
        //         ]
        //     }
        //
        const results = this.safeValue (response, 'results', []);
        const result = {};
        for (let i = 0; i < results.length; i++) {
            const currency = results[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const active = this.safeValue (currency, 'enabled', true);
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'info': currency, // the original payload
                'active': active,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': this.parseNumber (this.parsePrecision (this.safeString (currency, 'decimal_places'))),
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "pair":"BTC_USDC",
        //         "last_price":"10850.02",
        //         "low":"10720.03",
        //         "high":"10909.99",
        //         "variation":"1.21",
        //         "volume":"0.83868",
        //         "base":"BTC",
        //         "base_name":"Bitcoin",
        //         "quote":"USDC",
        //         "quote_name":"USD Coin",
        //         "bid":"10811.00",
        //         "ask":"10720.03",
        //         "avg":"10851.47",
        //         "ask_volume":"0.00140",
        //         "bid_volume":"0.00185",
        //         "created_at":"2020-09-28 21:44:51.228920+00:00"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'created_at'));
        const marketId = this.safeString (ticker, 'pair');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'last_price');
        const average = this.safeString (ticker, 'avg');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': this.safeString (ticker, 'bid_volume'),
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': this.safeString (ticker, 'ask_volume'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': average,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name ripio#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetRatePair (this.extend (request, params));
        //
        //     {
        //         "pair":"BTC_USDC",
        //         "last_price":"10850.02",
        //         "low":"10720.03",
        //         "high":"10909.99",
        //         "variation":"1.21",
        //         "volume":"0.83868",
        //         "base":"BTC",
        //         "base_name":"Bitcoin",
        //         "quote":"USDC",
        //         "quote_name":"USD Coin",
        //         "bid":"10811.00",
        //         "ask":"10720.03",
        //         "avg":"10851.47",
        //         "ask_volume":"0.00140",
        //         "bid_volume":"0.00185",
        //         "created_at":"2020-09-28 21:44:51.228920+00:00"
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name ripio#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetRateAll (params);
        //
        //     [
        //         {
        //             "pair":"BTC_USDC",
        //             "last_price":"10850.02",
        //             "low":"10720.03",
        //             "high":"10909.99",
        //             "variation":"1.21",
        //             "volume":"0.83868",
        //             "base":"BTC",
        //             "base_name":"Bitcoin",
        //             "quote":"USDC",
        //             "quote_name":"USD Coin",
        //             "bid":"10811.00",
        //             "ask":"10720.03",
        //             "avg":"10851.47",
        //             "ask_volume":"0.00140",
        //             "bid_volume":"0.00185",
        //             "created_at":"2020-09-28 21:44:51.228920+00:00"
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name ripio#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetOrderbookPair (this.extend (request, params));
        //
        //     {
        //         "buy":[
        //             {"amount":"0.00230","total":"24.95","price":"10850.02"},
        //             {"amount":"0.07920","total":"858.52","price":"10840.00"},
        //             {"amount":"0.00277","total":"30.00","price":"10833.03"},
        //         ],
        //         "sell":[
        //             {"amount":"0.03193","total":"348.16","price":"10904.00"},
        //             {"amount":"0.00210","total":"22.90","price":"10905.70"},
        //             {"amount":"0.00300","total":"32.72","price":"10907.98"},
        //         ],
        //         "updated_id":47225
        //     }
        //
        const orderbook = this.parseOrderBook (response, market['symbol'], undefined, 'buy', 'sell', 'price', 'amount');
        orderbook['nonce'] = this.safeInteger (response, 'updated_id');
        return orderbook;
    }

    parseTrade (trade, market = undefined) {
        //
        //
        // fetchTrades (public)
        //
        //      {
        //          "created_at":1649899167,
        //          "amount":"0.00852",
        //          "price":"3106.000000",
        //          "side":"SELL",
        //          "pair":"ETH_USDC",
        //          "taker_fee":"0",
        //          "taker_side":"SELL",
        //          "maker_fee":"0"
        //      }
        //
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "created_at":1601322501,
        //         "amount":"0.00276",
        //         "price":"10850.020000",
        //         "side":"SELL",
        //         "pair":"BTC_USDC",
        //         "taker_fee":"0",
        //         "taker_side":"SELL",
        //         "maker_fee":"0",
        //         "taker":2577953,
        //         "maker":2577937
        //     }
        //
        // createOrder fills
        //
        //     {
        //         "pair":"BTC_USDC",
        //         "exchanged":0.002,
        //         "match_price":10593.99,
        //         "maker_fee":0.0,
        //         "taker_fee":0.0,
        //         "timestamp":1601730306942
        //     }
        //
        const id = this.safeString (trade, 'id');
        let timestamp = this.safeInteger (trade, 'timestamp');
        timestamp = this.safeTimestamp (trade, 'created_at', timestamp);
        let side = this.safeString (trade, 'side');
        const takerSide = this.safeString (trade, 'taker_side');
        const takerOrMaker = (takerSide === side) ? 'taker' : 'maker';
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        const priceString = this.safeString2 (trade, 'price', 'match_price');
        const amountString = this.safeString2 (trade, 'amount', 'exchanged');
        const marketId = this.safeString (trade, 'pair');
        market = this.safeMarket (marketId, market);
        const feeCostString = this.safeString (trade, takerOrMaker + '_fee');
        const orderId = this.safeString (trade, takerOrMaker);
        let fee = undefined;
        if (feeCostString !== undefined) {
            fee = {
                'cost': feeCostString,
                'currency': (side === 'buy') ? market['base'] : market['quote'],
            };
        }
        return this.safeTrade ({
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ripio#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTradehistoryPair (this.extend (request, params));
        //
        //      [
        //          {
        //              "created_at":1649899167,
        //              "amount":"0.00852",
        //              "price":"3106.000000",
        //              "side":"SELL",
        //              "pair":"ETH_USDC",
        //              "taker_fee":"0",
        //              "taker_side":"SELL",
        //              "maker_fee":"0"
        //          }
        //      ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name ripio#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.publicGetPair (params);
        //
        //     {
        //         next: null,
        //         previous: null,
        //         results: [
        //             {
        //                 base: 'BTC',
        //                 base_name: 'Bitcoin',
        //                 quote: 'USDC',
        //                 quote_name: 'USD Coin',
        //                 symbol: 'BTC_USDC',
        //                 fees: [
        //                     {
        //                         traded_volume: '0.0',
        //                         maker_fee: '0.0',
        //                         taker_fee: '0.0',
        //                         cancellation_fee: '0.0'
        //                     }
        //                 ],
        //                 country: 'ZZ',
        //                 enabled: true,
        //                 priority: '10',
        //                 min_amount: '0.0000100000',
        //                 price_tick: '0.000001',
        //                 min_value: '10',
        //                 limit_price_threshold: '25.00'
        //             },
        //         ]
        //     }
        //
        const results = this.safeValue (response, 'results', []);
        const result = {};
        for (let i = 0; i < results.length; i++) {
            const pair = results[i];
            const marketId = this.safeString (pair, 'symbol');
            const symbol = this.safeSymbol (marketId, undefined, '_');
            const fees = this.safeValue (pair, 'fees', []);
            const fee = this.safeValue (fees, 0, {});
            result[symbol] = {
                'info': pair,
                'symbol': symbol,
                'maker': this.safeNumber (fee, 'maker_fee'),
                'taker': this.safeNumber (fee, 'taker_fee'),
                'tierBased': false,
            };
        }
        return result;
    }

    parseBalance (response) {
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name ripio#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetBalancesExchangeBalances (params);
        //
        //     [
        //         {
        //             "id":603794,
        //             "currency":"USD Coin",
        //             "symbol":"USDC",
        //             "available":"0",
        //             "locked":"0",
        //             "code":"exchange",
        //             "balance_type":"crypto"
        //         },
        //     ]
        //
        return this.parseBalance (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name ripio#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        const uppercaseSide = side.toUpperCase ();
        const request = {
            'pair': market['id'],
            'order_type': uppercaseType, // LIMIT, MARKET
            'side': uppercaseSide, // BUY or SELL
            'amount': this.amountToPrecision (symbol, amount),
        };
        if (uppercaseType === 'LIMIT') {
            request['limit_price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrderPair (this.extend (request, params));
        //
        //     {
        //         "order_id": "160f523c-f6ef-4cd1-a7c9-1a8ede1468d8",
        //         "pair": "BTC_ARS",
        //         "side": "BUY",
        //         "amount": "0.00400",
        //         "notional": null,
        //         "fill_or_kill": false,
        //         "all_or_none": false,
        //         "order_type": "LIMIT",
        //         "status": "OPEN",
        //         "created_at": 1578413945,
        //         "filled": "0.00000",
        //         "limit_price": "10.00",
        //         "stop_price": null,
        //         "distance": null
        //     }
        //
        // createOrder market type
        //
        //     {
        //         "order_id":"d6b60c01-8624-44f2-9e6c-9e8cd677ea5c",
        //         "pair":"BTC_USDC",
        //         "side":"BUY",
        //         "amount":"0.00200",
        //         "notional":"50",
        //         "fill_or_kill":false,
        //         "all_or_none":false,
        //         "order_type":"MARKET",
        //         "status":"OPEN",
        //         "created_at":1601730306,
        //         "filled":"0.00000",
        //         "fill_price":10593.99,
        //         "fee":0.0,
        //         "fills":[
        //             {
        //                 "pair":"BTC_USDC",
        //                 "exchanged":0.002,
        //                 "match_price":10593.99,
        //                 "maker_fee":0.0,
        //                 "taker_fee":0.0,
        //                 "timestamp":1601730306942
        //             }
        //         ],
        //         "filled_at":"2020-10-03T13:05:06.942186Z",
        //         "limit_price":"0.000000",
        //         "stop_price":null,
        //         "distance":null
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ripio#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostOrderPairOrderIdCancel (this.extend (request, params));
        //
        //     {
        //         "order_id": "286e560e-b8a2-464b-8b84-15a7e2a67eab",
        //         "pair": "BTC_ARS",
        //         "side": "SELL",
        //         "amount": "0.00100",
        //         "notional": null,
        //         "fill_or_kill": false,
        //         "all_or_none": false,
        //         "order_type": "LIMIT",
        //         "status": "CANC",
        //         "created_at": 1575472707,
        //         "filled": "0.00000",
        //         "limit_price": "681000.00",
        //         "stop_price": null,
        //         "distance": null
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ripio#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'order_id': id,
        };
        const response = await this.privateGetOrderPairOrderId (this.extend (request, params));
        //
        //     {
        //         "order_id": "0b4ff48e-cfd6-42db-8d8c-3b536da447af",
        //         "pair": "BTC_ARS",
        //         "side": "BUY",
        //         "amount": "0.00100",
        //         "notional": null,
        //         "fill_or_kill": false,
        //         "all_or_none": false,
        //         "order_type": "LIMIT",
        //         "status": "OPEN",
        //         "created_at": 1575472944,
        //         "filled": "0.00000",
        //         "limit_price": "661000.00",
        //         "stop_price": null,
        //         "distance": null
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ripio#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            // 'status': 'OPEN,PART,CLOS,CANC,COMP',
            // 'offset': 0,
            // 'limit': limit,
        };
        if (limit !== undefined) {
            request['offset'] = limit;
        }
        const response = await this.privateGetOrderPair (this.extend (request, params));
        //
        //     {
        //         "next": "https://api.exchange.ripio.com/api/v1/order/BTC_ARS/?limit=20&offset=20&page=1&page_size=25&status=OPEN%2CPART",
        //         "previous": null,
        //         "results": {
        //             "data": [
        //                 {
        //                     "order_id": "ca74280b-6966-4b73-a720-68709078922b",
        //                     "pair": "BTC_ARS",
        //                     "side": "SELL",
        //                     "amount": "0.00100",
        //                     "notional": null,
        //                     "fill_or_kill": false,
        //                     "all_or_none": false,
        //                     "order_type": "LIMIT",
        //                     "status": "OPEN",
        //                     "created_at": 1578340134,
        //                     "filled": "0.00000",
        //                     "limit_price": "665000.00",
        //                     "stop_price": null,
        //                     "distance": null
        //                 },
        //             ]
        //         }
        //     }
        //
        const results = this.safeValue (response, 'results', {});
        const data = this.safeValue (results, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ripio#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'status': 'OPEN,PART',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ripio#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'status': 'CLOS,CANC,COMP',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    parseOrderStatus (status) {
        const statuses = {
            'OPEN': 'open',
            'PART': 'open',
            'CLOS': 'canceled',
            'CANC': 'canceled',
            'COMP': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, cancelOrder, fetchOpenOrders, fetchClosedOrders, fetchOrders, fetchOrder
        //
        //     {
        //         "order_id": "286e560e-b8a2-464b-8b84-15a7e2a67eab",
        //         "pair": "BTC_ARS",
        //         "side": "SELL",
        //         "amount": "0.00100",
        //         "notional": null,
        //         "fill_or_kill": false,
        //         "all_or_none": false,
        //         "order_type": "LIMIT",
        //         "status": "CANC",
        //         "created_at": 1575472707,
        //         "filled": "0.00000",
        //         "limit_price": "681000.00",
        //         "stop_price": null,
        //         "distance": null
        //     }
        //
        //     {
        //         "order_id": "d6b60c01-8624-44f2-9e6c-9e8cd677ea5c",
        //         "pair": "BTC_USDC",
        //         "side": "BUY",
        //         "amount": "0.00200",
        //         "notional": "50",
        //         "fill_or_kill": false,
        //         "all_or_none": false,
        //         "order_type": "MARKET",
        //         "status": "OPEN",
        //         "created_at": 1601730306,
        //         "filled": "0.00000",
        //         "fill_price": 10593.99,
        //         "fee": 0.0,
        //         "fills": [
        //             {
        //                 "pair": "BTC_USDC",
        //                 "exchanged": 0.002,
        //                 "match_price": 10593.99,
        //                 "maker_fee": 0.0,
        //                 "taker_fee": 0.0,
        //                 "timestamp": 1601730306942
        //             }
        //         ],
        //         "filled_at": "2020-10-03T13:05:06.942186Z",
        //         "limit_price": "0.000000",
        //         "stop_price": null,
        //         "distance": null
        //     }
        //
        const id = this.safeString (order, 'order_id');
        const amount = this.safeString (order, 'amount');
        const cost = this.safeString (order, 'notional');
        const type = this.safeStringLower (order, 'order_type');
        const priceField = (type === 'market') ? 'fill_price' : 'limit_price';
        const price = this.safeString (order, priceField);
        const side = this.safeStringLower (order, 'side');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timestamp = this.safeTimestamp (order, 'created_at');
        const average = this.safeString (order, 'fill_price');
        const filled = this.safeString (order, 'filled');
        const fills = this.safeValue (order, 'fills');
        const marketId = this.safeString (order, 'pair');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': this.safeSymbol (marketId, market, '_'),
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': this.safeString (order, 'stop_price'),
            'triggerPrice': this.safeString (order, 'stop_price'),
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': fills,
        }, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ripio#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            // 'offset': 0,
            // 'limit': limit,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTradePair (this.extend (request, params));
        //
        //     {
        //         "next": "https://api.exchange.ripio.com/api/v1/trade/<pair>/?limit=20&offset=20",
        //         "previous": null,
        //         "results": {
        //             "data": [
        //                 {
        //                     "created_at": 1578414028,
        //                     "amount": "0.00100",
        //                     "price": "665000.00",
        //                     "side": "BUY",
        //                     "taker_fee": "0",
        //                     "taker_side": "BUY",
        //                     "match_price": "66500000",
        //                     "maker_fee": "0",
        //                     "taker": 4892,
        //                     "maker": 4889
        //                 },
        //             ]
        //         }
        //     }
        //
        const results = this.safeValue (response, 'results', {});
        const data = this.safeValue (results, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + request;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'POST') {
                body = this.json (query);
            } else {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.apiKey,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //      {"detail":"Authentication credentials were not provided."}
        //      {"status_code":400,"errors":{"pair":["Invalid pair FOOBAR"]},"message":"An error has occurred, please check the form."}
        //      {"status_code":400,"errors":{"order_type":["Invalid order type. Valid options: ['MARKET', 'LIMIT']"]},"message":"An error has occurred, please check the form."}
        //      {"status_code":400,"errors":{"non_field_errors":"Something unexpected ocurred!"},"message":"Seems like an unexpected error occurred. Please try again later or write us to support@ripio.com if the problem persists."}
        //      {"status_code":400,"errors":{"pair":["Invalid/Disabled pair BTC_ARS"]},"message":"An error has occurred, please check the form."}
        //
        const detail = this.safeString (response, 'detail');
        if (detail !== undefined) {
            const feedback = this.id + ' ' + body;
            // this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], detail, feedback);
        }
        const errors = this.safeValue (response, 'errors');
        if (errors !== undefined) {
            const feedback = this.id + ' ' + body;
            const keys = Object.keys (errors);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const error = this.safeValue (errors, key, []);
                const message = this.safeString (error, 0);
                // this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
