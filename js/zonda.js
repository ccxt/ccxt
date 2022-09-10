'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InvalidNonce, InsufficientFunds, AuthenticationError, InvalidOrder, ExchangeError, OrderNotFound, AccountSuspended, BadSymbol, OrderImmediatelyFillable, RateLimitExceeded, OnMaintenance, PermissionDenied } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class zonda extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'zonda',
            'name': 'Zonda',
            'countries': [ 'EE' ], // Estonia
            'rateLimit': 1000,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchDeposit': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchDeposits': undefined,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': undefined,
                'fetchTransfer': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': undefined,
                'reduceMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '60',
                '3m': '180',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '1h': '3600',
                '2h': '7200',
                '4h': '14400',
                '6h': '21600',
                '12h': '43200',
                '1d': '86400',
                '3d': '259200',
                '1w': '604800',
            },
            'hostname': 'zonda.exchange',
            'urls': {
                'referral': 'https://auth.zondaglobal.com/ref/jHlbB4mIkdS1',
                'logo': 'https://user-images.githubusercontent.com/1294454/159202310-a0e38007-5e7c-4ba9-a32f-c8263a0291fe.jpg',
                'www': 'https://zondaglobal.com',
                'api': {
                    'public': 'https://{hostname}/API/Public',
                    'private': 'https://{hostname}/API/Trading/tradingApi.php',
                    'v1_01Public': 'https://api.{hostname}/rest',
                    'v1_01Private': 'https://api.{hostname}/rest',
                },
                'doc': [
                    'https://docs.zonda.exchange/',
                    'https://github.com/BitBayNet/API',
                ],
                'support': 'https://zondaglobal.com/en/helpdesk/zonda-exchange',
                'fees': 'https://zondaglobal.com/legal/zonda-exchange/fees',
            },
            'api': {
                'public': {
                    'get': [
                        '{id}/all',
                        '{id}/market',
                        '{id}/orderbook',
                        '{id}/ticker',
                        '{id}/trades',
                    ],
                },
                'private': {
                    'post': [
                        'info',
                        'trade',
                        'cancel',
                        'orderbook',
                        'orders',
                        'transfer',
                        'withdraw',
                        'history',
                        'transactions',
                    ],
                },
                'v1_01Public': {
                    'get': [
                        'trading/ticker',
                        'trading/ticker/{symbol}',
                        'trading/stats',
                        'trading/stats/{symbol}',
                        'trading/orderbook/{symbol}',
                        'trading/transactions/{symbol}',
                        'trading/candle/history/{symbol}/{resolution}',
                    ],
                },
                'v1_01Private': {
                    'get': [
                        'api_payments/deposits/crypto/addresses',
                        'payments/withdrawal/{detailId}',
                        'payments/deposit/{detailId}',
                        'trading/offer',
                        'trading/stop/offer',
                        'trading/config/{symbol}',
                        'trading/history/transactions',
                        'balances/BITBAY/history',
                        'balances/BITBAY/balance',
                        'fiat_cantor/rate/{baseId}/{quoteId}',
                        'fiat_cantor/history',
                    ],
                    'post': [
                        'trading/offer/{symbol}',
                        'trading/stop/offer/{symbol}',
                        'trading/config/{symbol}',
                        'balances/BITBAY/balance',
                        'balances/BITBAY/balance/transfer/{source}/{destination}',
                        'fiat_cantor/exchange',
                    ],
                    'delete': [
                        'trading/offer/{symbol}/{id}/{side}/{price}',
                        'trading/stop/offer/{symbol}/{id}/{side}/{price}',
                    ],
                    'put': [
                        'balances/BITBAY/balance/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.0'),
                    'taker': this.parseNumber ('0.001'),
                    'percentage': true,
                    'tierBased': false,
                },
                'fiat': {
                    'maker': this.parseNumber ('0.0030'),
                    'taker': this.parseNumber ('0.0043'),
                    'percentage': true,
                    'tierBased': true,
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0.0043'), this.parseNumber ('0') ],
                            [ this.parseNumber ('0.0042'), this.parseNumber ('1250') ],
                            [ this.parseNumber ('0.0041'), this.parseNumber ('3750') ],
                            [ this.parseNumber ('0.0040'), this.parseNumber ('7500') ],
                            [ this.parseNumber ('0.0039'), this.parseNumber ('10000') ],
                            [ this.parseNumber ('0.0038'), this.parseNumber ('15000') ],
                            [ this.parseNumber ('0.0037'), this.parseNumber ('20000') ],
                            [ this.parseNumber ('0.0036'), this.parseNumber ('25000') ],
                            [ this.parseNumber ('0.0035'), this.parseNumber ('37500') ],
                            [ this.parseNumber ('0.0034'), this.parseNumber ('50000') ],
                            [ this.parseNumber ('0.0033'), this.parseNumber ('75000') ],
                            [ this.parseNumber ('0.0032'), this.parseNumber ('100000') ],
                            [ this.parseNumber ('0.0031'), this.parseNumber ('150000') ],
                            [ this.parseNumber ('0.0030'), this.parseNumber ('200000') ],
                            [ this.parseNumber ('0.0029'), this.parseNumber ('250000') ],
                            [ this.parseNumber ('0.0028'), this.parseNumber ('375000') ],
                            [ this.parseNumber ('0.0027'), this.parseNumber ('500000') ],
                            [ this.parseNumber ('0.0026'), this.parseNumber ('625000') ],
                            [ this.parseNumber ('0.0025'), this.parseNumber ('875000') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0.0030'), this.parseNumber ('0') ],
                            [ this.parseNumber ('0.0029'), this.parseNumber ('1250') ],
                            [ this.parseNumber ('0.0028'), this.parseNumber ('3750') ],
                            [ this.parseNumber ('0.0028'), this.parseNumber ('7500') ],
                            [ this.parseNumber ('0.0027'), this.parseNumber ('10000') ],
                            [ this.parseNumber ('0.0026'), this.parseNumber ('15000') ],
                            [ this.parseNumber ('0.0025'), this.parseNumber ('20000') ],
                            [ this.parseNumber ('0.0025'), this.parseNumber ('25000') ],
                            [ this.parseNumber ('0.0024'), this.parseNumber ('37500') ],
                            [ this.parseNumber ('0.0023'), this.parseNumber ('50000') ],
                            [ this.parseNumber ('0.0023'), this.parseNumber ('75000') ],
                            [ this.parseNumber ('0.0022'), this.parseNumber ('100000') ],
                            [ this.parseNumber ('0.0021'), this.parseNumber ('150000') ],
                            [ this.parseNumber ('0.0021'), this.parseNumber ('200000') ],
                            [ this.parseNumber ('0.0020'), this.parseNumber ('250000') ],
                            [ this.parseNumber ('0.0019'), this.parseNumber ('375000') ],
                            [ this.parseNumber ('0.0018'), this.parseNumber ('500000') ],
                            [ this.parseNumber ('0.0018'), this.parseNumber ('625000') ],
                            [ this.parseNumber ('0.0017'), this.parseNumber ('875000') ],
                        ],
                    },
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'options': {
                'fiatCurrencies': [ 'EUR', 'USD', 'GBP', 'PLN' ],
                'transfer': {
                    'fillResponseFromRequest': true,
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                '400': ExchangeError, // At least one parameter wasn't set
                '401': InvalidOrder, // Invalid order type
                '402': InvalidOrder, // No orders with specified currencies
                '403': InvalidOrder, // Invalid payment currency name
                '404': InvalidOrder, // Error. Wrong transaction type
                '405': InvalidOrder, // Order with this id doesn't exist
                '406': InsufficientFunds, // No enough money or crypto
                // code 407 not specified are not specified in their docs
                '408': InvalidOrder, // Invalid currency name
                '501': AuthenticationError, // Invalid public key
                '502': AuthenticationError, // Invalid sign
                '503': InvalidNonce, // Invalid moment parameter. Request time doesn't match current server time
                '504': ExchangeError, // Invalid method
                '505': AuthenticationError, // Key has no permission for this action
                '506': AccountSuspended, // Account locked. Please contact with customer service
                // codes 507 and 508 are not specified in their docs
                '509': ExchangeError, // The BIC/SWIFT is required for this currency
                '510': BadSymbol, // Invalid market name
                'FUNDS_NOT_SUFFICIENT': InsufficientFunds,
                'OFFER_FUNDS_NOT_EXCEEDING_MINIMUMS': InvalidOrder,
                'OFFER_NOT_FOUND': OrderNotFound,
                'OFFER_WOULD_HAVE_BEEN_PARTIALLY_FILLED': OrderImmediatelyFillable,
                'ACTION_LIMIT_EXCEEDED': RateLimitExceeded,
                'UNDER_MAINTENANCE': OnMaintenance,
                'REQUEST_TIMESTAMP_TOO_OLD': InvalidNonce,
                'PERMISSIONS_NOT_SUFFICIENT': PermissionDenied,
                'INVALID_STOP_RATE': InvalidOrder,
            },
            'commonCurrencies': {
                'GGC': 'Global Game Coin',
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name zonda#fetchMarkets
         * @description retrieves data on all markets for zonda
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.v1_01PublicGetTradingTicker (params);
        const fiatCurrencies = this.safeValue (this.options, 'fiatCurrencies', []);
        //
        //     {
        //         status: 'Ok',
        //         items: {
        //             'BSV-USD': {
        //                 market: {
        //                     code: 'BSV-USD',
        //                     first: { currency: 'BSV', minOffer: '0.00035', scale: 8 },
        //                     second: { currency: 'USD', minOffer: '5', scale: 2 }
        //                 },
        //                 time: '1557569762154',
        //                 highestBid: '52.31',
        //                 lowestAsk: '62.99',
        //                 rate: '63',
        //                 previousRate: '51.21',
        //             },
        //         },
        //     }
        //
        const result = [];
        const items = this.safeValue (response, 'items', {});
        const keys = Object.keys (items);
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const item = items[id];
            const market = this.safeValue (item, 'market', {});
            const first = this.safeValue (market, 'first', {});
            const second = this.safeValue (market, 'second', {});
            const baseId = this.safeString (first, 'currency');
            const quoteId = this.safeString (second, 'currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let fees = this.safeValue (this.fees, 'trading', {});
            if (this.inArray (base, fiatCurrencies) || this.inArray (quote, fiatCurrencies)) {
                fees = this.safeValue (this.fees, 'fiat', {});
            }
            // todo: check that the limits have ben interpreted correctly
            // todo: parse the fees page
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
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.safeNumber (fees, 'taker'),
                'maker': this.safeNumber (fees, 'maker'),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'optionType': undefined,
                'strike': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (first, 'scale'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (second, 'scale'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (first, 'minOffer'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (second, 'minOffer'),
                        'max': undefined,
                    },
                },
                'info': item,
            });
        }
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zonda#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol not used by zonda fetchOpenOrders
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        const response = await this.v1_01PrivateGetTradingOffer (this.extend (request, params));
        const items = this.safeValue (response, 'items', []);
        return this.parseOrders (items, undefined, since, limit, { 'status': 'open' });
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         market: 'ETH-EUR',
        //         offerType: 'Sell',
        //         id: '93d3657b-d616-11e9-9248-0242ac110005',
        //         currentAmount: '0.04',
        //         lockedAmount: '0.04',
        //         rate: '280',
        //         startAmount: '0.04',
        //         time: '1568372806924',
        //         postOnly: false,
        //         hidden: false,
        //         mode: 'limit',
        //         receivedAmount: '0.0',
        //         firstBalanceId: '5b816c3e-437c-4e43-9bef-47814ae7ebfc',
        //         secondBalanceId: 'ab43023b-4079-414c-b340-056e3430a3af'
        //     }
        //
        const marketId = this.safeString (order, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.safeInteger (order, 'time');
        const amount = this.safeString (order, 'startAmount');
        const remaining = this.safeString (order, 'currentAmount');
        const postOnly = this.safeValue (order, 'postOnly');
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': this.safeString (order, 'mode'),
            'timeInForce': undefined,
            'postOnly': postOnly,
            'side': this.safeStringLower (order, 'offerType'),
            'price': this.safeString (order, 'rate'),
            'stopPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'filled': undefined,
            'remaining': remaining,
            'average': undefined,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zonda#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbol) {
            const markets = [ this.marketId (symbol) ];
            symbol = this.symbol (symbol);
            request['markets'] = markets;
        }
        const query = { 'query': this.json (this.extend (request, params)) };
        const response = await this.v1_01PrivateGetTradingHistoryTransactions (query);
        //
        //     {
        //         status: 'Ok',
        //         totalRows: '67',
        //         items: [
        //             {
        //                 id: 'b54659a0-51b5-42a0-80eb-2ac5357ccee2',
        //                 market: 'BTC-EUR',
        //                 time: '1541697096247',
        //                 amount: '0.00003',
        //                 rate: '4341.44',
        //                 initializedBy: 'Sell',
        //                 wasTaker: false,
        //                 userAction: 'Buy',
        //                 offerId: 'bd19804a-6f89-4a69-adb8-eb078900d006',
        //                 commissionValue: null
        //             },
        //         ]
        //     }
        //
        const items = this.safeValue (response, 'items');
        const result = this.parseTrades (items, undefined, since, limit);
        if (symbol === undefined) {
            return result;
        }
        return this.filterBySymbol (result, symbol);
    }

    parseBalance (response) {
        const balances = this.safeValue (response, 'balances');
        if (balances === undefined) {
            throw new ExchangeError (this.id + ' empty balance response ' + this.json (response));
        }
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeString (balance, 'lockedFunds');
            account['free'] = this.safeString (balance, 'availableFunds');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name zonda#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.v1_01PrivateGetBalancesBITBAYBalance (params);
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name zonda#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1_01PublicGetTradingOrderbookSymbol (this.extend (request, params));
        //
        //     {
        //         "status":"Ok",
        //         "sell":[
        //             {"ra":"43988.93","ca":"0.00100525","sa":"0.00100525","pa":"0.00100525","co":1},
        //             {"ra":"43988.94","ca":"0.00114136","sa":"0.00114136","pa":"0.00114136","co":1},
        //             {"ra":"43989","ca":"0.010578","sa":"0.010578","pa":"0.010578","co":1},
        //         ],
        //         "buy":[
        //             {"ra":"42157.33","ca":"2.83147881","sa":"2.83147881","pa":"2.83147881","co":2},
        //             {"ra":"42096.0","ca":"0.00011878","sa":"0.00011878","pa":"0.00011878","co":1},
        //             {"ra":"42022.0","ca":"0.00011899","sa":"0.00011899","pa":"0.00011899","co":1},
        //         ],
        //         "timestamp":"1642299886122",
        //         "seqNo":"27641254"
        //     }
        //
        const rawBids = this.safeValue (response, 'buy', []);
        const rawAsks = this.safeValue (response, 'sell', []);
        const timestamp = this.safeInteger (response, 'timestamp');
        return {
            'symbol': market['symbol'],
            'bids': this.parseBidsAsks (rawBids, 'ra', 'ca'),
            'asks': this.parseBidsAsks (rawAsks, 'ra', 'ca'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': this.safeInteger (response, 'seqNo'),
        };
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         m: 'ETH-PLN',
        //         h: '13485.13',
        //         l: '13100.01',
        //         v: '126.10710939',
        //         r24h: '13332.72'
        //       }
        //
        const open = this.safeString (ticker, 'r24h');
        const high = this.safeString (ticker, 'h');
        const low = this.safeString (ticker, 'l');
        const volume = this.safeString (ticker, 'v');
        const marketId = this.safeString (ticker, 'm');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': volume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name zonda#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1_01PublicGetTradingStatsSymbol (this.extend (request, params));
        //
        //     {
        //       status: 'Ok',
        //       stats: {
        //         m: 'ETH-PLN',
        //         h: '13485.13',
        //         l: '13100.01',
        //         v: '126.10710939',
        //         r24h: '13332.72'
        //       }
        //     }
        //
        const stats = this.safeValue (response, 'stats');
        return this.parseTicker (stats, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name zonda#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.v1_01PublicGetTradingStats (params);
        //
        //     {
        //         status: 'Ok',
        //         items: {
        //             'DAI-PLN': {
        //                 m: 'DAI-PLN',
        //                 h: '4.41',
        //                 l: '4.37',
        //                 v: '8.71068087',
        //                 r24h: '4.36'
        //             }
        //         }
        //     }
        //
        const items = this.safeValue (response, 'items');
        return this.parseTickers (items, symbols);
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zonda#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        const balanceCurrencies = [];
        if (code !== undefined) {
            const currency = this.currency (code);
            balanceCurrencies.push (currency['id']);
        }
        let request = {
            'balanceCurrencies': balanceCurrencies,
        };
        if (since !== undefined) {
            request['fromTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        request = this.extend (request, params);
        const response = await this.v1_01PrivateGetBalancesBITBAYHistory ({ 'query': this.json (request) });
        const items = response['items'];
        return this.parseLedger (items, undefined, since, limit);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //    FUNDS_MIGRATION
        //    {
        //      "historyId": "84ea7a29-7da5-4de5-b0c0-871e83cad765",
        //      "balance": {
        //        "id": "821ec166-cb88-4521-916c-f4eb44db98df",
        //        "currency": "LTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "LTC"
        //      },
        //      "detailId": null,
        //      "time": 1506128252968,
        //      "type": "FUNDS_MIGRATION",
        //      "value": 0.0009957,
        //      "fundsBefore": { "total": 0, "available": 0, "locked": 0 },
        //      "fundsAfter": { "total": 0.0009957, "available": 0.0009957, "locked": 0 },
        //      "change": { "total": 0.0009957, "available": 0.0009957, "locked": 0 }
        //    }
        //
        //    CREATE_BALANCE
        //    {
        //      "historyId": "d0fabd8d-9107-4b5e-b9a6-3cab8af70d49",
        //      "balance": {
        //        "id": "653ffcf2-3037-4ebe-8e13-d5ea1a01d60d",
        //        "currency": "BTG",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTG"
        //      },
        //      "detailId": null,
        //      "time": 1508895244751,
        //      "type": "CREATE_BALANCE",
        //      "value": 0,
        //      "fundsBefore": { "total": null, "available": null, "locked": null },
        //      "fundsAfter": { "total": 0, "available": 0, "locked": 0 },
        //      "change": { "total": 0, "available": 0, "locked": 0 }
        //    }
        //
        //    BITCOIN_GOLD_FORK
        //    {
        //      "historyId": "2b4d52d3-611c-473d-b92c-8a8d87a24e41",
        //      "balance": {
        //        "id": "653ffcf2-3037-4ebe-8e13-d5ea1a01d60d",
        //        "currency": "BTG",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTG"
        //      },
        //      "detailId": null,
        //      "time": 1508895244778,
        //      "type": "BITCOIN_GOLD_FORK",
        //      "value": 0.00453512,
        //      "fundsBefore": { "total": 0, "available": 0, "locked": 0 },
        //      "fundsAfter": { "total": 0.00453512, "available": 0.00453512, "locked": 0 },
        //      "change": { "total": 0.00453512, "available": 0.00453512, "locked": 0 }
        //    }
        //
        //    ADD_FUNDS
        //    {
        //      "historyId": "3158236d-dae5-4a5d-81af-c1fa4af340fb",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": "8e83a960-e737-4380-b8bb-259d6e236faa",
        //      "time": 1520631178816,
        //      "type": "ADD_FUNDS",
        //      "value": 0.628405,
        //      "fundsBefore": { "total": 0.00453512, "available": 0.00453512, "locked": 0 },
        //      "fundsAfter": { "total": 0.63294012, "available": 0.63294012, "locked": 0 },
        //      "change": { "total": 0.628405, "available": 0.628405, "locked": 0 }
        //    }
        //
        //    TRANSACTION_PRE_LOCKING
        //    {
        //      "historyId": "e7d19e0f-03b3-46a8-bc72-dde72cc24ead",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": null,
        //      "time": 1520706403868,
        //      "type": "TRANSACTION_PRE_LOCKING",
        //      "value": -0.1,
        //      "fundsBefore": { "total": 0.63294012, "available": 0.63294012, "locked": 0 },
        //      "fundsAfter": { "total": 0.63294012, "available": 0.53294012, "locked": 0.1 },
        //      "change": { "total": 0, "available": -0.1, "locked": 0.1 }
        //    }
        //
        //    TRANSACTION_POST_OUTCOME
        //    {
        //      "historyId": "c4010825-231d-4a9c-8e46-37cde1f7b63c",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": "bf2876bc-b545-4503-96c8-ef4de8233876",
        //      "time": 1520706404032,
        //      "type": "TRANSACTION_POST_OUTCOME",
        //      "value": -0.01771415,
        //      "fundsBefore": { "total": 0.63294012, "available": 0.53294012, "locked": 0.1 },
        //      "fundsAfter": { "total": 0.61522597, "available": 0.53294012, "locked": 0.08228585 },
        //      "change": { "total": -0.01771415, "available": 0, "locked": -0.01771415 }
        //    }
        //
        //    TRANSACTION_POST_INCOME
        //    {
        //      "historyId": "7f18b7af-b676-4125-84fd-042e683046f6",
        //      "balance": {
        //        "id": "ab43023b-4079-414c-b340-056e3430a3af",
        //        "currency": "EUR",
        //        "type": "FIAT",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "EUR"
        //      },
        //      "detailId": "f5fcb274-0cc7-4385-b2d3-bae2756e701f",
        //      "time": 1520706404035,
        //      "type": "TRANSACTION_POST_INCOME",
        //      "value": 628.78,
        //      "fundsBefore": { "total": 0, "available": 0, "locked": 0 },
        //      "fundsAfter": { "total": 628.78, "available": 628.78, "locked": 0 },
        //      "change": { "total": 628.78, "available": 628.78, "locked": 0 }
        //    }
        //
        //    TRANSACTION_COMMISSION_OUTCOME
        //    {
        //      "historyId": "843177fa-61bc-4cbf-8be5-b029d856c93b",
        //      "balance": {
        //        "id": "ab43023b-4079-414c-b340-056e3430a3af",
        //        "currency": "EUR",
        //        "type": "FIAT",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "EUR"
        //      },
        //      "detailId": "f5fcb274-0cc7-4385-b2d3-bae2756e701f",
        //      "time": 1520706404050,
        //      "type": "TRANSACTION_COMMISSION_OUTCOME",
        //      "value": -2.71,
        //      "fundsBefore": { "total": 766.06, "available": 766.06, "locked": 0 },
        //      "fundsAfter": { "total": 763.35,"available": 763.35, "locked": 0 },
        //      "change": { "total": -2.71, "available": -2.71, "locked": 0 }
        //    }
        //
        //    TRANSACTION_OFFER_COMPLETED_RETURN
        //    {
        //      "historyId": "cac69b04-c518-4dc5-9d86-e76e91f2e1d2",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": null,
        //      "time": 1520714886425,
        //      "type": "TRANSACTION_OFFER_COMPLETED_RETURN",
        //      "value": 0.00000196,
        //      "fundsBefore": { "total": 0.00941208, "available": 0.00941012, "locked": 0.00000196 },
        //      "fundsAfter": { "total": 0.00941208, "available": 0.00941208, "locked": 0 },
        //      "change": { "total": 0, "available": 0.00000196, "locked": -0.00000196 }
        //    }
        //
        //    WITHDRAWAL_LOCK_FUNDS
        //    {
        //      "historyId": "03de2271-66ab-4960-a786-87ab9551fc14",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": "6ad3dc72-1d6d-4ec2-8436-ca43f85a38a6",
        //      "time": 1522245654481,
        //      "type": "WITHDRAWAL_LOCK_FUNDS",
        //      "value": -0.8,
        //      "fundsBefore": { "total": 0.8, "available": 0.8, "locked": 0 },
        //      "fundsAfter": { "total": 0.8, "available": 0, "locked": 0.8 },
        //      "change": { "total": 0, "available": -0.8, "locked": 0.8 }
        //    }
        //
        //    WITHDRAWAL_SUBTRACT_FUNDS
        //    {
        //      "historyId": "b0308c89-5288-438d-a306-c6448b1a266d",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": "6ad3dc72-1d6d-4ec2-8436-ca43f85a38a6",
        //      "time": 1522246526186,
        //      "type": "WITHDRAWAL_SUBTRACT_FUNDS",
        //      "value": -0.8,
        //      "fundsBefore": { "total": 0.8, "available": 0, "locked": 0.8 },
        //      "fundsAfter": { "total": 0, "available": 0, "locked": 0 },
        //      "change": { "total": -0.8, "available": 0, "locked": -0.8 }
        //    }
        //
        //    TRANSACTION_OFFER_ABORTED_RETURN
        //    {
        //      "historyId": "b1a3c075-d403-4e05-8f32-40512cdd88c0",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": null,
        //      "time": 1522512298662,
        //      "type": "TRANSACTION_OFFER_ABORTED_RETURN",
        //      "value": 0.0564931,
        //      "fundsBefore": { "total": 0.44951311, "available": 0.39302001, "locked": 0.0564931 },
        //      "fundsAfter": { "total": 0.44951311, "available": 0.44951311, "locked": 0 },
        //      "change": { "total": 0, "available": 0.0564931, "locked": -0.0564931 }
        //    }
        //
        //    WITHDRAWAL_UNLOCK_FUNDS
        //    {
        //      "historyId": "0ed569a2-c330-482e-bb89-4cb553fb5b11",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": "0c7be256-c336-4111-bee7-4eb22e339700",
        //      "time": 1527866360785,
        //      "type": "WITHDRAWAL_UNLOCK_FUNDS",
        //      "value": 0.05045,
        //      "fundsBefore": { "total": 0.86001578, "available": 0.80956578, "locked": 0.05045 },
        //      "fundsAfter": { "total": 0.86001578, "available": 0.86001578, "locked": 0 },
        //      "change": { "total": 0, "available": 0.05045, "locked": -0.05045 }
        //    }
        //
        //    TRANSACTION_COMMISSION_RETURN
        //    {
        //      "historyId": "07c89c27-46f1-4d7a-8518-b73798bf168a",
        //      "balance": {
        //        "id": "ab43023b-4079-414c-b340-056e3430a3af",
        //        "currency": "EUR",
        //        "type": "FIAT",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "EUR"
        //      },
        //      "detailId": null,
        //      "time": 1528304043063,
        //      "type": "TRANSACTION_COMMISSION_RETURN",
        //      "value": 0.6,
        //      "fundsBefore": { "total": 0, "available": 0, "locked": 0 },
        //      "fundsAfter": { "total": 0.6, "available": 0.6, "locked": 0 },
        //      "change": { "total": 0.6, "available": 0.6, "locked": 0 }
        //    }
        //
        const timestamp = this.safeInteger (item, 'time');
        const balance = this.safeValue (item, 'balance', {});
        const currencyId = this.safeString (balance, 'currency');
        const change = this.safeValue (item, 'change', {});
        let amount = this.safeString (change, 'total');
        let direction = 'in';
        if (Precise.stringLt (amount, '0')) {
            direction = 'out';
            amount = Precise.stringNeg (amount);
        }
        // there are 2 undocumented api calls: (v1_01PrivateGetPaymentsDepositDetailId and v1_01PrivateGetPaymentsWithdrawalDetailId)
        // that can be used to enrich the transfers with txid, address etc (you need to use info.detailId as a parameter)
        const fundsBefore = this.safeValue (item, 'fundsBefore', {});
        const fundsAfter = this.safeValue (item, 'fundsAfter', {});
        return {
            'info': item,
            'id': this.safeString (item, 'historyId'),
            'direction': direction,
            'account': undefined,
            'referenceId': this.safeString (item, 'detailId'),
            'referenceAccount': undefined,
            'type': this.parseLedgerEntryType (this.safeString (item, 'type')),
            'currency': this.safeCurrencyCode (currencyId),
            'amount': amount,
            'before': this.safeNumber (fundsBefore, 'total'),
            'after': this.safeNumber (fundsAfter, 'total'),
            'status': 'ok',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    parseLedgerEntryType (type) {
        const types = {
            'ADD_FUNDS': 'transaction',
            'BITCOIN_GOLD_FORK': 'transaction',
            'CREATE_BALANCE': 'transaction',
            'FUNDS_MIGRATION': 'transaction',
            'WITHDRAWAL_LOCK_FUNDS': 'transaction',
            'WITHDRAWAL_SUBTRACT_FUNDS': 'transaction',
            'WITHDRAWAL_UNLOCK_FUNDS': 'transaction',
            'TRANSACTION_COMMISSION_OUTCOME': 'fee',
            'TRANSACTION_COMMISSION_RETURN': 'fee',
            'TRANSACTION_OFFER_ABORTED_RETURN': 'trade',
            'TRANSACTION_OFFER_COMPLETED_RETURN': 'trade',
            'TRANSACTION_POST_INCOME': 'trade',
            'TRANSACTION_POST_OUTCOME': 'trade',
            'TRANSACTION_PRE_LOCKING': 'trade',
        };
        return this.safeString (types, type, type);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         '1582399800000',
        //         {
        //             o: '0.0001428',
        //             c: '0.0001428',
        //             h: '0.0001428',
        //             l: '0.0001428',
        //             v: '4',
        //             co: '1'
        //         }
        //     ]
        //
        const first = this.safeValue (ohlcv, 1, {});
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (first, 'o'),
            this.safeNumber (first, 'h'),
            this.safeNumber (first, 'l'),
            this.safeNumber (first, 'c'),
            this.safeNumber (first, 'v'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zonda#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['baseId'] + '-' + market['quoteId'];
        const request = {
            'symbol': tradingSymbol,
            'resolution': this.timeframes[timeframe],
            // 'from': 1574709092000, // unix timestamp in milliseconds, required
            // 'to': 1574709092000, // unix timestamp in milliseconds, required
        };
        if (limit === undefined) {
            limit = 100;
        }
        const duration = this.parseTimeframe (timeframe);
        const timerange = limit * duration * 1000;
        if (since === undefined) {
            request['to'] = this.milliseconds ();
            request['from'] = request['to'] - timerange;
        } else {
            request['from'] = parseInt (since);
            request['to'] = this.sum (request['from'], timerange);
        }
        const response = await this.v1_01PublicGetTradingCandleHistorySymbolResolution (this.extend (request, params));
        //
        //     {
        //         "status":"Ok",
        //         "items":[
        //             ["1591503060000",{"o":"0.02509572","c":"0.02509438","h":"0.02509664","l":"0.02509438","v":"0.02082165","co":"17"}],
        //             ["1591503120000",{"o":"0.02509606","c":"0.02509515","h":"0.02509606","l":"0.02509487","v":"0.04971703","co":"13"}],
        //             ["1591503180000",{"o":"0.02509532","c":"0.02509589","h":"0.02509589","l":"0.02509454","v":"0.01332236","co":"7"}],
        //         ]
        //     }
        //
        const items = this.safeValue (response, 'items', []);
        return this.parseOHLCVs (items, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // createOrder trades
        //
        //     {
        //         "rate": "0.02195928",
        //         "amount": "0.00167952"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         amount: "0.29285199",
        //         commissionValue: "0.00125927",
        //         id: "11c8203a-a267-11e9-b698-0242ac110007",
        //         initializedBy: "Buy",
        //         market: "ETH-EUR",
        //         offerId: "11c82038-a267-11e9-b698-0242ac110007",
        //         rate: "277",
        //         time: "1562689917517",
        //         userAction: "Buy",
        //         wasTaker: true,
        //     }
        //
        // fetchTrades (public)
        //
        //     {
        //          id: 'df00b0da-e5e0-11e9-8c19-0242ac11000a',
        //          t: '1570108958831',
        //          a: '0.04776653',
        //          r: '0.02145854',
        //          ty: 'Sell'
        //     }
        //
        const timestamp = this.safeInteger2 (trade, 'time', 't');
        const side = this.safeStringLower2 (trade, 'userAction', 'ty');
        const wasTaker = this.safeValue (trade, 'wasTaker');
        let takerOrMaker = undefined;
        if (wasTaker !== undefined) {
            takerOrMaker = wasTaker ? 'taker' : 'maker';
        }
        const priceString = this.safeString2 (trade, 'rate', 'r');
        const amountString = this.safeString2 (trade, 'amount', 'a');
        const feeCostString = this.safeString (trade, 'commissionValue');
        const marketId = this.safeString (trade, 'market');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrency = (side === 'buy') ? market['base'] : market['quote'];
            fee = {
                'currency': feeCurrency,
                'cost': feeCostString,
            };
        }
        const order = this.safeString (trade, 'offerId');
        // todo: check this logic
        let type = undefined;
        if (order !== undefined) {
            type = order ? 'limit' : 'market';
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'id'),
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
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
         * @name zonda#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['baseId'] + '-' + market['quoteId'];
        const request = {
            'symbol': tradingSymbol,
        };
        if (since !== undefined) {
            request['fromTime'] = since - 1; // result does not include exactly `since` time therefore decrease by 1
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default - 10, max - 300
        }
        const response = await this.v1_01PublicGetTradingTransactionsSymbol (this.extend (request, params));
        const items = this.safeValue (response, 'items');
        return this.parseTrades (items, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name zonda#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['baseId'] + '-' + market['quoteId'];
        amount = parseFloat (this.amountToPrecision (symbol, amount));
        const request = {
            'symbol': tradingSymbol,
            'offerType': side.toUpperCase (),
            'amount': amount,
        };
        const stopLossPrice = this.safeValue2 (params, 'stopPrice', 'stopLossPrice');
        const isStopLossPrice = stopLossPrice !== undefined;
        const isLimitOrder = type === 'limit';
        const isMarketOrder = type === 'market';
        const isStopLimit = (type === 'stop-limit') || (isLimitOrder && isStopLossPrice);
        const isStopMarket = type === 'stop-market' || (isMarketOrder && isStopLossPrice);
        const isStopOrder = isStopLimit || isStopMarket;
        const method = isStopOrder ? 'v1_01PrivatePostTradingStopOfferSymbol' : 'v1_01PrivatePostTradingOfferSymbol';
        if (isLimitOrder || isStopLimit) {
            request['rate'] = this.priceToPrecision (symbol, price);
            request['mode'] = isStopLimit ? 'stop-limit' : 'limit';
        } else if (isMarketOrder || isStopMarket) {
            request['mode'] = isStopMarket ? 'stop-market' : 'market';
        } else {
            throw new ExchangeError (this.id + ' createOrder() invalid type');
        }
        if (isStopOrder) {
            if (!isStopLossPrice) {
                throw new ExchangeError (this.id + ' createOrder() zonda requires `triggerPrice` or `stopPrice` parameter for stop-limit or stop-market orders');
            }
            request['stopRate'] = this.priceToPrecision (symbol, stopLossPrice);
        }
        params = this.omit (params, [ 'stopPrice', 'stopLossPrice' ]);
        const response = await this[method] (this.extend (request, params));
        //
        // unfilled (open order)
        //
        //     {
        //         status: 'Ok',
        //         completed: false, // can deduce status from here
        //         offerId: 'ce9cc72e-d61c-11e9-9248-0242ac110005',
        //         transactions: [], // can deduce order info from here
        //     }
        //
        // filled (closed order)
        //
        //     {
        //         "status": "Ok",
        //         "offerId": "942a4a3e-e922-11e9-8c19-0242ac11000a",
        //         "completed": true,
        //         "transactions": [
        //           {
        //             "rate": "0.02195928",
        //             "amount": "0.00167952"
        //           },
        //           {
        //             "rate": "0.02195928",
        //             "amount": "0.00167952"
        //           },
        //           {
        //             "rate": "0.02196207",
        //             "amount": "0.27704177"
        //           }
        //         ]
        //     }
        //
        // partially-filled (open order)
        //
        //     {
        //         "status": "Ok",
        //         "offerId": "d0ebefab-f4d7-11e9-8c19-0242ac11000a",
        //         "completed": false,
        //         "transactions": [
        //           {
        //             "rate": "0.02106404",
        //             "amount": "0.0019625"
        //           },
        //           {
        //             "rate": "0.02106404",
        //             "amount": "0.0019625"
        //           },
        //           {
        //             "rate": "0.02105901",
        //             "amount": "0.00975256"
        //           }
        //         ]
        //     }
        //
        const id = this.safeString2 (response, 'offerId', 'stopOfferId');
        const completed = this.safeValue (response, 'completed', false);
        const status = completed ? 'closed' : 'open';
        const transactions = this.safeValue (response, 'transactions');
        return this.safeOrder ({
            'id': id,
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'filled': undefined,
            'remaining': undefined,
            'average': undefined,
            'fee': undefined,
            'trades': transactions,
            'clientOrderId': undefined,
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name zonda#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const side = this.safeString (params, 'side');
        if (side === undefined) {
            throw new ExchangeError (this.id + ' cancelOrder() requires a `side` parameter ("buy" or "sell")');
        }
        const price = this.safeValue (params, 'price');
        if (price === undefined) {
            throw new ExchangeError (this.id + ' cancelOrder() requires a `price` parameter (float or string)');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['baseId'] + '-' + market['quoteId'];
        const request = {
            'symbol': tradingSymbol,
            'id': id,
            'side': side,
            'price': price,
        };
        // { status: 'Fail', errors: [ 'NOT_RECOGNIZED_OFFER_TYPE' ] }  -- if required params are missing
        // { status: 'Ok', errors: [] }
        return await this.v1_01PrivateDeleteTradingOfferSymbolIdSidePrice (this.extend (request, params));
    }

    isFiat (currency) {
        const fiatCurrencies = {
            'USD': true,
            'EUR': true,
            'PLN': true,
        };
        return this.safeValue (fiatCurrencies, currency, false);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         "address": "33u5YAEhQbYfjHHPsfMfCoSdEjfwYjVcBE",
        //         "currency": "BTC",
        //         "balanceId": "5d5d19e7-2265-49c7-af9a-047bcf384f21",
        //         "balanceEngine": "BITBAY",
        //         "tag": null
        //     }
        //
        const currencyId = this.safeString (depositAddress, 'currency');
        const address = this.safeString (depositAddress, 'address');
        this.checkAddress (address);
        return {
            'currency': this.safeCurrencyCode (currencyId, currency),
            'address': address,
            'tag': this.safeString (depositAddress, 'tag'),
            'network': undefined,
            'info': depositAddress,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name zonda#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @param {string|undefined} params.walletId Wallet id to filter deposit adresses.
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.v1_01PrivateGetApiPaymentsDepositsCryptoAddresses (this.extend (request, params));
        //
        //     {
        //         "status": "Ok",
        //         "data": [{
        //                 "address": "33u5YAEhQbYfjHHPsfMfCoSdEjfwYjVcBE",
        //                 "currency": "BTC",
        //                 "balanceId": "5d5d19e7-2265-49c7-af9a-047bcf384f21",
        //                 "balanceEngine": "BITBAY",
        //                 "tag": null
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        const first = this.safeValue (data, 0);
        return this.parseDepositAddress (first, currency);
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        /**
         * @method
         * @name zonda#fetchDepositAddresses
         * @description fetch deposit addresses for multiple currencies and chain types
         * @param {[string]|undefined} codes zonda does not support filtering filtering by multiple codes and will ignore this parameter.
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {object} a list of [address structures]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const response = await this.v1_01PrivateGetApiPaymentsDepositsCryptoAddresses (params);
        //
        //     {
        //         "status": "Ok",
        //         "data": [{
        //                 "address": "33u5YAEhQbYfjHHPsfMfCoSdEjfwYjVcBE",
        //                 "currency": "BTC",
        //                 "balanceId": "5d5d19e7-2265-49c7-af9a-047bcf384f21",
        //                 "balanceEngine": "BITBAY",
        //                 "tag": null
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseDepositAddresses (data, codes);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name zonda#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'source': fromAccount,
            'destination': toAccount,
            'currency': code,
            'funds': this.currencyToPrecision (code, amount),
        };
        const response = await this.v1_01PrivatePostBalancesBITBAYBalanceTransferSourceDestination (this.extend (request, params));
        //
        //     {
        //         "status": "Ok",
        //         "from": {
        //             "id": "ad9397c5-3bd9-4372-82ba-22da6a90cb56",
        //             "userId": "4bc43956-423f-47fd-9faa-acd37c58ed9f",
        //             "availableFunds": 0.01803472,
        //             "totalFunds": 0.01804161,
        //             "lockedFunds": 0.00000689,
        //             "currency": "BTC",
        //             "type": "CRYPTO",
        //             "name": "BTC",
        //             "balanceEngine": "BITBAY"
        //         },
        //         "to": {
        //             "id": "01931d52-536b-4ca5-a9f4-be28c86d0cc3",
        //             "userId": "4bc43956-423f-47fd-9faa-acd37c58ed9f",
        //             "availableFunds": 0.0001,
        //             "totalFunds": 0.0001,
        //             "lockedFunds": 0,
        //             "currency": "BTC",
        //             "type": "CRYPTO",
        //             "name": "Prowizja",
        //             "balanceEngine": "BITBAY"
        //         },
        //         "errors": null
        //     }
        //
        const transfer = this.parseTransfer (response, currency);
        const transferOptions = this.safeValue (this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeValue (transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            transfer['amount'] = amount;
        }
        return transfer;
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //     {
        //         "status": "Ok",
        //         "from": {
        //             "id": "ad9397c5-3bd9-4372-82ba-22da6a90cb56",
        //             "userId": "4bc43956-423f-47fd-9faa-acd37c58ed9f",
        //             "availableFunds": 0.01803472,
        //             "totalFunds": 0.01804161,
        //             "lockedFunds": 0.00000689,
        //             "currency": "BTC",
        //             "type": "CRYPTO",
        //             "name": "BTC",
        //             "balanceEngine": "BITBAY"
        //         },
        //         "to": {
        //             "id": "01931d52-536b-4ca5-a9f4-be28c86d0cc3",
        //             "userId": "4bc43956-423f-47fd-9faa-acd37c58ed9f",
        //             "availableFunds": 0.0001,
        //             "totalFunds": 0.0001,
        //             "lockedFunds": 0,
        //             "currency": "BTC",
        //             "type": "CRYPTO",
        //             "name": "Prowizja",
        //             "balanceEngine": "BITBAY"
        //         },
        //         "errors": null
        //     }
        //
        const status = this.safeString (transfer, 'status');
        const fromAccount = this.safeValue (transfer, 'from', {});
        const fromId = this.safeString (fromAccount, 'id');
        const to = this.safeValue (transfer, 'to', {});
        const toId = this.safeString (to, 'id');
        const currencyId = this.safeString (fromAccount, 'currency');
        return {
            'info': transfer,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': undefined,
            'fromAccount': fromId,
            'toAccount': toId,
            'status': this.parseTransferStatus (status),
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            'Ok': 'ok',
            'Fail': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name zonda#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the zonda api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        let method = undefined;
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'quantity': amount,
        };
        if (this.isFiat (code)) {
            method = 'privatePostWithdraw';
            // request['account'] = params['account']; // they demand an account number
            // request['express'] = params['express']; // whatever it means, they don't explain
            // request['bic'] = '';
        } else {
            method = 'privatePostTransfer';
            if (tag !== undefined) {
                address += '?dt=' + tag.toString ();
            }
            request['address'] = address;
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "status": "Ok",
        //         "data": {
        //           "id": "65e01087-afb0-4ab2-afdb-cc925e360296"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTransaction (data, currency);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "id": "65e01087-afb0-4ab2-afdb-cc925e360296"
        //     }
        //
        currency = this.safeCurrency (undefined, currency);
        return {
            'id': this.safeString (transaction, 'id'),
            'txid': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'amount': undefined,
            'type': undefined,
            'currency': currency['code'],
            'status': undefined,
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'fee': undefined,
            'info': transaction,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]);
        if (api === 'public') {
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params) + '.json';
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'v1_01Public') {
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'v1_01Private') {
            this.checkRequiredCredentials ();
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            const nonce = this.milliseconds ().toString ();
            let payload = undefined;
            if (method !== 'POST') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
                payload = this.apiKey + nonce;
            } else if (body === undefined) {
                body = this.json (query);
                payload = this.apiKey + nonce + body;
            }
            headers = {
                'Request-Timestamp': nonce,
                'Operation-Id': this.uuid (),
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (payload), this.encode (this.secret), 'sha512'),
                'Content-Type': 'application/json',
            };
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'method': path,
                'moment': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('code' in response) {
            //
            // bitbay returns the integer 'success': 1 key from their private API
            // or an integer 'code' value from 0 to 510 and an error message
            //
            //      { 'success': 1, ... }
            //      { 'code': 502, 'message': 'Invalid sign' }
            //      { 'code': 0, 'message': 'offer funds not exceeding minimums' }
            //
            //      400 At least one parameter wasn't set
            //      401 Invalid order type
            //      402 No orders with specified currencies
            //      403 Invalid payment currency name
            //      404 Error. Wrong transaction type
            //      405 Order with this id doesn't exist
            //      406 No enough money or crypto
            //      408 Invalid currency name
            //      501 Invalid public key
            //      502 Invalid sign
            //      503 Invalid moment parameter. Request time doesn't match current server time
            //      504 Invalid method
            //      505 Key has no permission for this action
            //      506 Account locked. Please contact with customer service
            //      509 The BIC/SWIFT is required for this currency
            //      510 Invalid market name
            //
            const code = this.safeString (response, 'code'); // always an integer
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions, code, feedback);
            throw new ExchangeError (feedback);
        } else if ('status' in response) {
            //
            //      {"status":"Fail","errors":["OFFER_FUNDS_NOT_EXCEEDING_MINIMUMS"]}
            //
            const status = this.safeString (response, 'status');
            if (status === 'Fail') {
                const errors = this.safeValue (response, 'errors');
                const feedback = this.id + ' ' + body;
                for (let i = 0; i < errors.length; i++) {
                    const error = errors[i];
                    this.throwExactlyMatchedException (this.exceptions, error, feedback);
                }
                throw new ExchangeError (feedback);
            }
        }
    }
};
