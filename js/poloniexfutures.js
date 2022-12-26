'use strict';

//  ---------------------------------------------------------------------------

const { BadRequest, ArgumentsRequired, InvalidOrder } = require ('./base/errors');
const Precise = require ('./base/Precise');
const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class poloniexfutures extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'poloniexfutures',
            'name': 'Poloniex Futures',
            'countries': [ 'US' ],
            // 'rateLimit': 1000, // up to 6 calls per second
            'certified': false,
            'pro': false,
            'version': 'v1',
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': true,
                'swap': true,
                'future': false,
                'option': undefined,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': false,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchL3OrderBook': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchOrdersByStatus': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrder': true,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '2h': 120,
                '4h': 480,
                '12h': 720,
                '1d': 1440,
                '1w': 10080,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
                'api': {
                    'public': 'https://futures-api.poloniex.com',
                    'private': 'https://futures-api.poloniex.com',
                },
                'www': 'https://www.poloniex.com',
                'doc': 'https://futures-docs.poloniex.com',
                'fees': 'https://poloniex.com/fee-schedule',
                'referral': 'https://poloniex.com/signup?c=UBFZJRPJ',
            },
            'api': {
                'public': {
                    'get': [
                        'contracts/active',
                        'contracts/{symbol}',
                        'ticker',
                        'ticker', // v2
                        'tickers', // v2
                        'level2/snapshot',
                        'level2/depth',
                        'level2/message/query',
                        'level3/snapshot', // v2
                        'trade/history',
                        'interest/query',
                        'index/query',
                        'mark-price/{symbol}/current',
                        'premium/query',
                        'funding-rate/{symbol}/current',
                        'timestamp',
                        'status',
                        'kline/query',
                    ],
                    'post': [
                        'bullet-public',
                    ],
                },
                'private': {
                    'get': [
                        'account-overview',
                        'transaction-history',
                        'orders',
                        'stopOrders',
                        'recentDoneOrders',
                        'orders/{order-id}',
                        'fills',
                        'openOrderStatistics',
                        'position',
                        'positions',
                        'funding-history',
                    ],
                    'post': [
                        'orders',
                        'orders',
                        'position/margin/auto-deposit-status',
                        'position/margin/deposit-margin',
                        'bullet-private',
                    ],
                    'delete': [
                        'orders/{order-id}',
                        'orders',
                        'stopOrders',
                    ],
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                // TODO
                // 'trading': {
                //     'feeSide': 'get',
                //     // starting from Jan 8 2020
                //     'maker': this.parseNumber ('0.0009'),
                //     'taker': this.parseNumber ('0.0009'),
                // },
                // 'funding': {},
            },
            'limits': {
                // TODO
                // 'amount': {
                //     'min': 0.000001,
                //     'max': undefined,
                // },
                // 'price': {
                //     'min': 0.00000001,
                //     'max': 1000000000,
                // },
                // 'cost': {
                //     'min': 0.00000000,
                //     'max': 1000000000,
                // },
            },
            'precision': {
                // TODO
                // 'amount': 8,
                // 'price': 8,
            },
            'commonCurrencies': {
                // 'AIR': 'AirCoin',
                // 'APH': 'AphroditeCoin',
                // 'BCC': 'BTCtalkcoin',
                // 'BCHABC': 'BCHABC',
                // 'BDG': 'Badgercoin',
                // 'BTM': 'Bitmark',
                // 'CON': 'Coino',
                // 'GOLD': 'GoldEagles',
                // 'GPUC': 'GPU',
                // 'HOT': 'Hotcoin',
                // 'ITC': 'Information Coin',
                // 'KEY': 'KEYCoin',
                // 'MASK': 'NFTX Hashmasks Index', // conflict with Mask Network
                // 'MEME': 'Degenerator Meme', // Degenerator Meme migrated to Meme Inu, this exchange still has the old price
                // 'PLX': 'ParallaxCoin',
                // 'REPV2': 'REP',
                // 'STR': 'XLM',
                // 'SOC': 'SOCC',
                // 'TRADE': 'Unitrade',
                // 'XAP': 'API Coin',
                // // this is not documented in the API docs for Poloniex
                // // https://github.com/ccxt/ccxt/issues/7084
                // // when the user calls withdraw ('USDT', amount, address, tag, params)
                // // with params = { 'currencyToWithdrawAs': 'USDTTRON' }
                // // or params = { 'currencyToWithdrawAs': 'USDTETH' }
                // // fetchWithdrawals ('USDT') returns the corresponding withdrawals
                // // with a USDTTRON or a USDTETH currency id, respectfully
                // // therefore we have map them back to the original code USDT
                // // otherwise the returned withdrawals are filtered out
                // 'USDTTRON': 'USDT',
                // 'USDTETH': 'USDT',
            },
            'options': {
                'networks': {
                    // TODO
                    // 'ERC20': 'ETH',
                    // 'TRX': 'TRON',
                    // 'TRC20': 'TRON',
                },
                'limits': {
                    // TODO
                    // 'cost': {
                    //     'min': {
                    //         'BTC': 0.0001,
                    //         'ETH': 0.0001,
                    //         'USDT': 1.0,
                    //         'TRX': 100,
                    //         'BNB': 0.06,
                    //         'USDC': 1.0,
                    //         'USDJ': 1.0,
                    //         'TUSD': 0.0001,
                    //         'DAI': 1.0,
                    //         'PAX': 1.0,
                    //         'BUSD': 1.0,
                    //     },
                    // },
                },
                'versions': {
                    'public': {
                        'GET': {
                            'ticker': 'v2',
                            'tickers': 'v2',
                            'level3/snapshot': 'v2',
                        },
                    },
                },
                'requiredCredentials': {
                    'apiKey': true,
                    'secret': true,
                    'password': true,
                },
            },
            'exceptions': {
                // TODO
                // 'exact': {
                //     'You may only place orders that reduce your position.': InvalidOrder,
                //     'Invalid order number, or you are not the person who placed the order.': OrderNotFound,
                //     'Permission denied': PermissionDenied,
                //     'Permission denied.': PermissionDenied,
                //     'Connection timed out. Please try again.': RequestTimeout,
                //     'Internal error. Please try again.': ExchangeNotAvailable,
                //     'Currently in maintenance mode.': OnMaintenance,
                //     'Order not found, or you are not the person who placed it.': OrderNotFound,
                //     'Invalid API key/secret pair.': AuthenticationError,
                //     'Please do not make more than 8 API calls per second.': DDoSProtection,
                //     'Rate must be greater than zero.': InvalidOrder, // {"error":"Rate must be greater than zero."}
                //     'Invalid currency pair.': BadSymbol, // {"error":"Invalid currency pair."}
                //     'Invalid currencyPair parameter.': BadSymbol, // {"error":"Invalid currencyPair parameter."}
                //     'Trading is disabled in this market.': BadSymbol, // {"error":"Trading is disabled in this market."}
                //     'Invalid orderNumber parameter.': OrderNotFound,
                //     'Order is beyond acceptable bounds.': InvalidOrder, // {"error":"Order is beyond acceptable bounds.","fee":"0.00155000","currencyPair":"USDT_BOBA"}
                // },
                // 'broad': {
                //     'Total must be at least': InvalidOrder, // {"error":"Total must be at least 0.0001."}
                //     'This account is frozen.': AccountSuspended,
                //     'This account is locked.': AccountSuspended, // {"error":"This account is locked."}
                //     'Not enough': InsufficientFunds,
                //     'Nonce must be greater': InvalidNonce,
                //     'You have already called cancelOrder or moveOrder on this order.': CancelPending,
                //     'Amount must be at least': InvalidOrder, // {"error":"Amount must be at least 0.000001."}
                //     'is either completed or does not exist': OrderNotFound, // {"error":"Order 587957810791 is either completed or does not exist."}
                //     'Error pulling ': ExchangeError, // {"error":"Error pulling order book"}
                // },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchMarkets
         * @description retrieves data on all markets for poloniexfutures
         * @see https://futures-docs.poloniex.com/#symbol-2
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetContractsActive (params);
        //
        // {
        //  "code": "200000",
        //  "data": [
        //     {
        //       symbol: 'APTUSDTPERP',
        //       takerFixFee: '0E-10',
        //       nextFundingRateTime: '20145603',
        //       makerFixFee: '0E-10',
        //       type: 'FFWCSX',
        //       predictedFundingFeeRate: '0.000000',
        //       turnoverOf24h: '386037.46704292',
        //       initialMargin: '0.05',
        //       isDeleverage: true,
        //       createdAt: '1666681959000',
        //       fundingBaseSymbol: '.APTINT8H',
        //       lowPriceOf24h: '4.34499979019165',
        //       lastTradePrice: '4.4090000000',
        //       indexPriceTickSize: '0.001',
        //       fairMethod: 'FundingRate',
        //       takerFeeRate: '0.00040',
        //       order: '102',
        //       updatedAt: '1671076377000',
        //       displaySettleCurrency: 'USDT',
        //       indexPrice: '4.418',
        //       multiplier: '1.0',
        //       maxLeverage: '20',
        //       fundingQuoteSymbol: '.USDTINT8H',
        //       quoteCurrency: 'USDT',
        //       maxOrderQty: '1000000',
        //       maxPrice: '1000000.0000000000',
        //       maintainMargin: '0.025',
        //       status: 'Open',
        //       displayNameMap: [Object],
        //       openInterest: '2367',
        //       highPriceOf24h: '4.763999938964844',
        //       fundingFeeRate: '0.000000',
        //       volumeOf24h: '83540.00000000',
        //       riskStep: '500000',
        //       isQuanto: true,
        //       maxRiskLimit: '20000',
        //       rootSymbol: 'USDT',
        //       baseCurrency: 'APT',
        //       firstOpenDate: '1666701000000',
        //       tickSize: '0.001',
        //       markMethod: 'FairPrice',
        //       indexSymbol: '.PAPTUSDT',
        //       markPrice: '4.418',
        //       minRiskLimit: '1000000',
        //       settlementFixFee: '0E-10',
        //       settlementSymbol: '',
        //       priceChgPctOf24h: '-0.0704',
        //       fundingRateSymbol: '.APTUSDTPERPFPI8H',
        //       makerFeeRate: '0.00010',
        //       isInverse: false,
        //       lotSize: '1',
        //       settleCurrency: 'USDT',
        //       settlementFeeRate: '0.0'
        //     },
        //   ]
        // }
        //
        const result = [];
        const data = this.safeValue (response, 'data', []);
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const settleId = this.safeString (market, 'rootSymbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const symbol = base + '/' + quote + ':' + settle;
            const inverse = this.safeValue (market, 'isInverse');
            const status = this.safeString (market, 'status');
            const multiplier = this.safeString (market, 'multiplier');
            const tickSize = this.safeNumber (market, 'indexPriceTickSize');
            const lotSize = this.safeNumber (market, 'lotSize');
            const limitAmountMax = this.safeNumber (market, 'maxOrderQty');
            const limitPriceMax = this.safeNumber (market, 'maxPrice');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': 'swap',
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'active': (status === 'Open'),
                'contract': true,
                'linear': !inverse,
                'inverse': inverse,
                'taker': this.safeNumber (market, 'takerFeeRate'),
                'maker': this.safeNumber (market, 'makerFeeRate'),
                'contractSize': this.parseNumber (Precise.stringAbs (multiplier)),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': lotSize,
                    'price': tickSize,
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': this.safeNumber (market, 'maxLeverage'),
                    },
                    'amount': {
                        'min': lotSize,
                        'max': limitAmountMax,
                    },
                    'price': {
                        'min': tickSize,
                        'max': limitPriceMax,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        let timestamp = this.safeNumber (ticker, 'ts');
        timestamp = parseInt (timestamp / 1000000);
        const last = this.safeString (ticker, 'price');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (ticker, 'bestBidPrice'),
            'bidVolume': this.safeString (ticker, 'bestBidSize'),
            'ask': this.safeString (ticker, 'bestAskPrice'),
            'askVolume': this.safeString (ticker, 'bestAskSize'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://futures-docs.poloniex.com/#get-real-time-ticker-2-0
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        // {
        //     code: '200000',
        //     data: {
        //       sequence: '11574719',
        //       symbol: 'BTCUSDTPERP',
        //       side: 'sell',
        //       size: '1',
        //       price: '16990.1',
        //       bestBidSize: '3',
        //       bestBidPrice: '16990.1',
        //       bestAskPrice: '16991.0',
        //       tradeId: '639c8a529fd7cf0001af4157',
        //       bestAskSize: '505',
        //       ts: '1671203410721232337'
        //     }
        // }
        //
        return this.parseTicker (this.safeValue (response, 'data', {}), market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://futures-docs.poloniex.com/#get-real-time-ticker-of-all-symbols
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        return this.parseTickers (this.safeValue (response, 'data', []), symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfuturesfutures#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://futures-docs.poloniex.com/#get-full-order-book-level-2
         * @see https://futures-docs.poloniex.com/#get-full-order-book-level-3
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the poloniexfuturesfutures api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const level = this.safeNumber (params, 'level');
        params = this.omit (params, 'level');
        if (level !== undefined && level !== 2 && level !== 3) {
            throw new BadRequest (this.id + ' fetchOrderBook() can only return level 2 & 3');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (level === 2) {
            response = await this.publicGetLevel2Snapshot (this.extend (request, params));
        } else {
            response = await this.publicGetLevel3Snapshot (this.extend (request, params));
        }
        // L2
        //
        // {
        //     "code": "200000",
        //     "data": {
        //     "symbol": "BTCUSDTPERP",
        //     "sequence": 1669149851334,
        //     "asks": [
        //         [
        //             16952,
        //             12
        //         ],
        //     ],
        //     "bids": [
        //         [
        //             16951.9,
        //             13
        //         ],
        //     ],
        // }
        //
        // L3
        //
        // {
        //     "code": "200000",
        //     "data": {
        //     "symbol": "BTCUSDTPERP",
        //     "sequence": 1669149851334,
        //     "asks": [
        //         [
        //             "639c95388cba5100084eabce",
        //             "16952.0",
        //             "1",
        //             1671206200542484700
        //         ],
        //     ],
        //     "bids": [
        //         [
        //             "626659d83385c200072e690b",
        //             "17.0",
        //             "1000",
        //             1650874840161291000
        //         ],
        //     ],
        // }
        //
        const data = this.safeValue (response, 'data', {});
        const timestamp = parseInt (this.safeInteger (data, 'ts') / 1000000);
        let orderbook = undefined;
        if (level === 2) {
            orderbook = this.parseOrderBook (data, market['symbol'], timestamp, 'bids', 'asks', 0, 1);
        } else {
            orderbook = this.parseOrderBook (data, market['symbol'], timestamp, 'bids', 'asks', 1, 2);
        }
        return orderbook;
    }

    async fetchL3OrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchL3OrderBook
         * @description fetches level 3 information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://futures-docs.poloniex.com/#get-full-order-book-level-3
         * @param {string} symbol unified market symbol
         * @param {int|undefined} limit max number of orders to return, default is undefined
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} an [order book structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetLevel3Snapshot (this.extend (request, params));
        // {
        //     "code": "200000",
        //     "data": {
        //     "symbol": "BTCUSDTPERP",
        //     "sequence": 1669149851334,
        //     "asks": [
        //         [
        //             "639c95388cba5100084eabce",
        //             "16952.0",
        //             "1",
        //             1671206200542484700
        //         ],
        //     ],
        //     "bids": [
        //         [
        //             "626659d83385c200072e690b",
        //             "17.0",
        //             "1000",
        //             1650874840161291000
        //         ],
        //     ],
        // }
        //
        const data = this.safeValue (response, 'data', {});
        const timestamp = parseInt (this.safeInteger (data, 'ts') / 1000000);
        return this.parseOrderBook (data, market['symbol'], timestamp, 'bids', 'asks', 1, 2);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "sequence": 11827985,
        //         "side": "buy",
        //         "size": 101,
        //         "price": "16864.0000000000",
        //         "takerOrderId": "639c986f0ac2470007be75ee",
        //         "makerOrderId": "639c986fa69d280007b76111",
        //         "tradeId": "639c986f9fd7cf0001afd7ee",
        //         "ts": 1671207023485924400
        //     }
        //
        let timestamp = this.safeInteger (trade, 'ts');
        timestamp = parseInt (timestamp / 1000000);
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'tradeId'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'takerOrMaker': undefined,
            'side': this.safeString (trade, 'side'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'size'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://futures-docs.poloniex.com/#historical-data
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTradeHistory (this.extend (request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //        {
        //          "sequence": 11827985,
        //          "side": "buy",
        //          "size": 101,
        //          "price": "16864.0000000000",
        //          "takerOrderId": "639c986f0ac2470007be75ee",
        //          "makerOrderId": "639c986fa69d280007b76111",
        //          "tradeId": "639c986f9fd7cf0001afd7ee",
        //          "ts": 1671207023485924400
        //        },
        //    }
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the poloniexfutures server
         * @see https://futures-docs.poloniex.com/#time
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the poloniexfutures server
         */
        const response = await this.publicGetTimestamp (params);
        //
        // {
        //     "code":"200000",
        //     "msg":"success",
        //     "data":1546837113087
        // }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://futures-docs.poloniex.com/#k-chart
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const request = {
            'symbol': marketId,
            'granularity': this.timeframes[timeframe],
        };
        const duration = this.parseTimeframe (timeframe) * 1000;
        let endAt = this.milliseconds ();
        if (since !== undefined) {
            request['from'] = since;
            if (limit === undefined) {
                limit = this.safeInteger (this.options, 'fetchOHLCVLimit', 200);
            }
            endAt = this.sum (since, limit * duration);
        } else if (limit !== undefined) {
            since = endAt - limit * duration;
            request['from'] = since;
        }
        request['to'] = endAt;
        const response = await this.publicGetKlineQuery (this.extend (request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            [1636459200000, 4779.3, 4792.1, 4768.7, 4770.3, 78051],
        //            [1636460100000, 4770.25, 4778.55, 4757.55, 4777.25, 80164],
        //            [1636461000000, 4777.25, 4791.45, 4774.5, 4791.3, 51555]
        //        ]
        //    }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseBalance (response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const data = this.safeValue (response, 'data');
        const currencyId = this.safeString (data, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString (data, 'availableBalance');
        account['total'] = this.safeString (data, 'accountEquity');
        result[code] = account;
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://futures-docs.poloniex.com/#get-account-overview
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const currencyId = this.safeString (params, 'currency');
        let request = {};
        if (currencyId !== undefined) {
            const currency = this.currency (currencyId);
            request = {
                'currency': currency['id'],
            };
        }
        const response = await this.privateGetAccountOverview (this.extend (request, params));
        //
        //     {
        //         code: '200000',
        //         data: {
        //             accountEquity: 0.00005,
        //             unrealisedPNL: 0,
        //             marginBalance: 0.00005,
        //             positionMargin: 0,
        //             orderMargin: 0,
        //             frozenFunds: 0,
        //             availableBalance: 0.00005,
        //             currency: 'XBT'
        //         }
        //     }
        //
        return this.parseBalance (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#createOrder
         * @description Create an order on the exchange
         * @see https://futures-docs.poloniex.com/#place-an-order
         * @param {string} symbol Unified CCXT market symbol
         * @param {string} type 'limit' or 'market'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount the amount of currency to trade
         * @param {float} price *ignored in "market" orders* the price at which the order is to be fullfilled at in units of the quote currency
         * @param {object} params  Extra parameters specific to the exchange API endpoint
         * @param {float} params.leverage Leverage size of the order
         * @param {float} params.stopPrice The price at which a trigger order is triggered at
         * @param {bool} params.reduceOnly A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true.
         * @param {string} params.timeInForce GTC, GTT, IOC, or FOK, default is GTC, limit orders only
         * @param {string} params.postOnly Post only flag, invalid when timeInForce is IOC or FOK
         * @param {string} params.clientOid client order id, defaults to uuid if not passed
         * @param {string} params.remark remark for the order, length cannot exceed 100 utf8 characters
         * @param {string} params.stop 'up' or 'down', defaults to 'up' if side is sell and 'down' if side is buy, requires stopPrice
         * @param {string} params.stopPriceType  TP, IP or MP, defaults to TP
         * @param {bool} params.closeOrder set to true to close position
         * @param {bool} params.forceHold A mark to forcely hold the funds for an order, even though it's an order to reduce the position size. This helps the order stay on the order book and not get canceled when the position size changes. Set to false by default.
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        // required param, cannot be used twice
        const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId', this.uuid ());
        params = this.omit (params, [ 'clientOid', 'clientOrderId' ]);
        if (amount < 1) {
            throw new InvalidOrder (this.id + ' createOrder() minimum contract order amount is 1');
        }
        const preciseAmount = parseInt (this.amountToPrecision (symbol, amount));
        const request = {
            'clientOid': clientOrderId,
            'side': side,
            'symbol': market['id'],
            'type': type, // limit or market
            'size': preciseAmount,
            'leverage': 1,
        };
        const stopPrice = this.safeValue2 (params, 'triggerPrice', 'stopPrice');
        if (stopPrice) {
            request['stop'] = (side === 'buy') ? 'up' : 'down';
            const stopPriceType = this.safeString (params, 'stopPriceType', 'TP');
            request['stopPriceType'] = stopPriceType;
            request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
        }
        const uppercaseType = type.toUpperCase ();
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        if (uppercaseType === 'LIMIT') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
            } else {
                request['price'] = this.priceToPrecision (symbol, price);
            }
            if (timeInForce !== undefined) {
                request['timeInForce'] = timeInForce;
            }
        }
        const postOnly = this.safeValue (params, 'postOnly', false);
        const hidden = this.safeValue (params, 'hidden');
        if (postOnly && (hidden !== undefined)) {
            throw new BadRequest (this.id + ' createOrder() does not support the postOnly parameter together with a hidden parameter');
        }
        const iceberg = this.safeValue (params, 'iceberg');
        if (iceberg) {
            const visibleSize = this.safeValue (params, 'visibleSize');
            if (visibleSize === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a visibleSize parameter for iceberg orders');
            }
        }
        params = this.omit (params, [ 'timeInForce', 'stopPrice', 'triggerPrice' ]); // Time in force only valid for limit orders, exchange error when gtc for market orders
        const response = await this.privatePostOrders (this.extend (request, params));
        //
        //    {
        //        code: "200000",
        //        data: {
        //            orderId: "619717484f1d010001510cde",
        //        },
        //    }
        //
        const data = this.safeValue (response, 'data', {});
        return {
            'id': this.safeString (data, 'orderId'),
            'clientOrderId': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': undefined,
            'type': undefined,
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': undefined,
            'fee': undefined,
            'trades': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'stopPrice': undefined,
            'info': response,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#cancelOrder
         * @description cancels an open order
         * @see https://futures-docs.poloniex.com/#cancel-an-order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'order-id': id,
        };
        const response = await this.privateDeleteOrdersOrderId (this.extend (request, params));
        //
        //   {
        //       code: "200000",
        //       data: {
        //           cancelledOrderIds: [
        //                "619714b8b6353000014c505a",
        //           ],
        //           cancelFailedOrders: [
        //              {
        //                  orderId: "63a9c5c2b9e7d70007eb0cd5", orderState: "2"}
        //          ],
        //       },
        //   }
        //
        const data = this.safeValue (response, 'data');
        const cancelledOrderIds = this.safeValue (data, 'cancelledOrderIds');
        const cancelledOrderIdsLength = cancelledOrderIds.length;
        if (cancelledOrderIdsLength === 0) {
            throw new InvalidOrder (this.id + ' cancelOrder() order already cancelled');
        }
        return {
            'id': this.safeString (cancelledOrderIds, 0),
            'clientOrderId': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': undefined,
            'type': undefined,
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': undefined,
            'fee': undefined,
            'trades': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'stopPrice': undefined,
            'info': response,
        };
    }

    async fetchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchPositions
         * @description fetch all open positions
         * @see https://futures-docs.poloniex.com/#get-position-list
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetPositions (params);
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            {
        //                "id": "615ba79f83a3410001cde321",
        //                "symbol": "ETHUSDTM",
        //                "autoDeposit": false,
        //                "maintMarginReq": 0.005,
        //                "riskLimit": 1000000,
        //                "realLeverage": 18.61,
        //                "crossMode": false,
        //                "delevPercentage": 0.86,
        //                "openingTimestamp": 1638563515618,
        //                "currentTimestamp": 1638576872774,
        //                "currentQty": 2,
        //                "currentCost": 83.64200000,
        //                "currentComm": 0.05018520,
        //                "unrealisedCost": 83.64200000,
        //                "realisedGrossCost": 0.00000000,
        //                "realisedCost": 0.05018520,
        //                "isOpen": true,
        //                "markPrice": 4225.01,
        //                "markValue": 84.50020000,
        //                "posCost": 83.64200000,
        //                "posCross": 0.0000000000,
        //                "posInit": 3.63660870,
        //                "posComm": 0.05236717,
        //                "posLoss": 0.00000000,
        //                "posMargin": 3.68897586,
        //                "posMaint": 0.50637594,
        //                "maintMargin": 4.54717586,
        //                "realisedGrossPnl": 0.00000000,
        //                "realisedPnl": -0.05018520,
        //                "unrealisedPnl": 0.85820000,
        //                "unrealisedPnlPcnt": 0.0103,
        //                "unrealisedRoePcnt": 0.2360,
        //                "avgEntryPrice": 4182.10,
        //                "liquidationPrice": 4023.00,
        //                "bankruptPrice": 4000.25,
        //                "settleCurrency": "USDT",
        //                "isInverse": false
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (response, 'data');
        return this.parsePositions (data, symbols);
    }

    parsePosition (position, market = undefined) {
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            {
        //                "id": "615ba79f83a3410001cde321",         // Position ID
        //                "symbol": "ETHUSDTM",                     // Symbol
        //                "autoDeposit": false,                     // Auto deposit margin or not
        //                "maintMarginReq": 0.005,                  // Maintenance margin requirement
        //                "riskLimit": 1000000,                     // Risk limit
        //                "realLeverage": 25.92,                    // Leverage of the order
        //                "crossMode": false,                       // Cross mode or not
        //                "delevPercentage": 0.76,                  // ADL ranking percentile
        //                "openingTimestamp": 1638578546031,        // Open time
        //                "currentTimestamp": 1638578563580,        // Current timestamp
        //                "currentQty": 2,                          // Current postion quantity
        //                "currentCost": 83.787,                    // Current postion value
        //                "currentComm": 0.0167574,                 // Current commission
        //                "unrealisedCost": 83.787,                 // Unrealised value
        //                "realisedGrossCost": 0.0,                 // Accumulated realised gross profit value
        //                "realisedCost": 0.0167574,                // Current realised position value
        //                "isOpen": true,                           // Opened position or not
        //                "markPrice": 4183.38,                     // Mark price
        //                "markValue": 83.6676,                     // Mark value
        //                "posCost": 83.787,                        // Position value
        //                "posCross": 0.0,                          // added margin
        //                "posInit": 3.35148,                       // Leverage margin
        //                "posComm": 0.05228309,                    // Bankruptcy cost
        //                "posLoss": 0.0,                           // Funding fees paid out
        //                "posMargin": 3.40376309,                  // Position margin
        //                "posMaint": 0.50707892,                   // Maintenance margin
        //                "maintMargin": 3.28436309,                // Position margin
        //                "realisedGrossPnl": 0.0,                  // Accumulated realised gross profit value
        //                "realisedPnl": -0.0167574,                // Realised profit and loss
        //                "unrealisedPnl": -0.1194,                 // Unrealised profit and loss
        //                "unrealisedPnlPcnt": -0.0014,             // Profit-loss ratio of the position
        //                "unrealisedRoePcnt": -0.0356,             // Rate of return on investment
        //                "avgEntryPrice": 4189.35,                 // Average entry price
        //                "liquidationPrice": 4044.55,              // Liquidation price
        //                "bankruptPrice": 4021.75,                 // Bankruptcy price
        //                "settleCurrency": "USDT",                 // Currency used to clear and settle the trades
        //                "isInverse": false
        //            }
        //        ]
        //    }
        //
        const symbol = this.safeString (position, 'symbol');
        market = this.safeMarket (symbol, market);
        const timestamp = this.safeNumber (position, 'currentTimestamp');
        const size = this.safeString (position, 'currentQty');
        let side = undefined;
        if (Precise.stringGt (size, '0')) {
            side = 'long';
        } else if (Precise.stringLt (size, '0')) {
            side = 'short';
        }
        const notional = Precise.stringAbs (this.safeString (position, 'posCost'));
        const initialMargin = this.safeString (position, 'posInit');
        const initialMarginPercentage = Precise.stringDiv (initialMargin, notional);
        // const marginRatio = Precise.stringDiv (maintenanceRate, collateral);
        const unrealisedPnl = this.safeString (position, 'unrealisedPnl');
        const crossMode = this.safeValue (position, 'crossMode');
        // currently crossMode is always set to false and only isolated positions are supported
        const marginMode = crossMode ? 'cross' : 'isolated';
        return {
            'info': position,
            'id': undefined,
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'maintenanceMargin': this.safeNumber (position, 'posMaint'),
            'maintenanceMarginPercentage': this.safeNumber (position, 'maintMarginReq'),
            'entryPrice': this.safeNumber (position, 'avgEntryPrice'),
            'notional': this.parseNumber (notional),
            'leverage': this.safeNumber (position, 'realLeverage'),
            'unrealizedPnl': this.parseNumber (unrealisedPnl),
            'contracts': this.parseNumber (Precise.stringAbs (size)),
            'contractSize': this.safeValue (market, 'contractSize'),
            //     realisedPnl: position['realised_pnl'],
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber (position, 'liquidationPrice'),
            'markPrice': this.safeNumber (position, 'markPrice'),
            'collateral': this.safeNumber (position, 'maintMargin'),
            'marginMode': marginMode,
            'side': side,
            'percentage': this.parseNumber (Precise.stringDiv (unrealisedPnl, initialMargin)),
        };
    }

    async fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchFundingHistory
         * @description fetch the history of funding payments paid and received on this account
         * @see https://futures-docs.poloniex.com/#get-funding-history
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch funding history for
         * @param {int|undefined} limit the maximum number of funding history structures to retrieve
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-history-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            // * Since is ignored if limit is defined
            request['maxCount'] = limit;
        }
        const response = await this.privateGetFundingHistory (this.extend (request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "dataList": [
        //                {
        //                    "id": 239471298749817,
        //                    "symbol": "ETHUSDTM",
        //                    "timePoint": 1638532800000,
        //                    "fundingRate": 0.000100,
        //                    "markPrice": 4612.8300000000,
        //                    "positionQty": 12,
        //                    "positionCost": 553.5396000000,
        //                    "funding": -0.0553539600,
        //                    "settleCurrency": "USDT"
        //                },
        //                ...
        //            ],
        //            "hasMore": true
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data');
        const dataList = this.safeValue (data, 'dataList', []);
        const dataListLength = dataList.length;
        const fees = [];
        for (let i = 0; i < dataListLength; i++) {
            const listItem = dataList[i];
            const timestamp = this.safeInteger (listItem, 'timePoint');
            fees.push ({
                'info': listItem,
                'symbol': symbol,
                'code': this.safeCurrencyCode (this.safeString (listItem, 'settleCurrency')),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'id': this.safeNumber (listItem, 'id'),
                'amount': this.safeNumber (listItem, 'funding'),
                'fundingRate': this.safeNumber (listItem, 'fundingRate'),
                'markPrice': this.safeNumber (listItem, 'markPrice'),
                'positionQty': this.safeNumber (listItem, 'positionQty'),
                'positionCost': this.safeNumber (listItem, 'positionCost'),
            });
        }
        return fees;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @param {object} params.stop When true, all the trigger orders will be cancelled
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            request['symbol'] = this.marketId (symbol);
        }
        const stop = this.safeValue (params, 'stop');
        const method = stop ? 'privateDeleteStopOrders' : 'privateDeleteOrders';
        const response = await this[method] (this.extend (request, params));
        //
        //   {
        //       code: "200000",
        //       data: {
        //           cancelledOrderIds: [
        //                "619714b8b6353000014c505a",
        //           ],
        //       },
        //   }
        //
        const data = this.safeValue (response, 'data');
        const result = [];
        const cancelledOrderIds = this.safeValue (data, 'cancelledOrderIds');
        const cancelledOrderIdsLength = cancelledOrderIds.length;
        for (let i = 0; i < cancelledOrderIdsLength; i++) {
            const cancelledOrderId = this.safeString (cancelledOrderIds, i);
            result.push ({
                'id': cancelledOrderId,
                'clientOrderId': undefined,
                'timestamp': undefined,
                'datetime': undefined,
                'lastTradeTimestamp': undefined,
                'symbol': undefined,
                'type': undefined,
                'side': undefined,
                'price': undefined,
                'amount': undefined,
                'cost': undefined,
                'average': undefined,
                'filled': undefined,
                'remaining': undefined,
                'status': undefined,
                'fee': undefined,
                'trades': undefined,
                'timeInForce': undefined,
                'postOnly': undefined,
                'stopPrice': undefined,
                'info': response,
            });
        }
        return result;
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchOrdersByStatus
         * @description fetches a list of orders placed on the exchange
         * @see https://docs.kucoin.com/futures/#get-order-list
         * @see https://docs.kucoin.com/futures/#get-untriggered-stop-order-list
         * @param {string} status 'active' or 'closed', only 'active' is valid for stop orders
         * @param {string|undefined} symbol unified symbol for the market to retrieve orders from
         * @param {int|undefined} since timestamp in ms of the earliest order to retrieve
         * @param {int|undefined} limit The maximum number of orders to retrieve
         * @param {object} params exchange specific parameters
         * @param {bool|undefined} params.stop set to true to retrieve untriggered stop orders
         * @param {int|undefined} params.until End time in ms
         * @param {string|undefined} params.side buy or sell
         * @param {string|undefined} params.type limit or market
         * @returns An [array of order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const stop = this.safeValue (params, 'stop');
        const until = this.safeInteger2 (params, 'until', 'till');
        params = this.omit (params, [ 'stop', 'until', 'till' ]);
        if (status === 'closed') {
            status = 'done';
        } else if (status === 'open') {
            status = 'active';
        }
        const request = {};
        if (!stop) {
            request['status'] = status;
        } else if (status !== 'active') {
            throw new BadRequest (this.id + ' fetchOrdersByStatus() can only fetch untriggered stop orders');
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (until !== undefined) {
            request['endAt'] = until;
        }
        const method = stop ? 'privateGetStopOrders' : 'privateGetOrders';
        const response = await this[method] (this.extend (request, params));
        const responseData = this.safeValue (response, 'data', {});
        const orders = this.safeValue (responseData, 'items', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://docs.kucoin.com/futures/#get-order-list
         * @see https://docs.kucoin.com/futures/#get-untriggered-stop-order-list
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @param {int|undefined} params.till end time in ms
         * @param {string|undefined} params.side buy or sell
         * @param {string|undefined} params.type limit, or market
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByStatus ('active', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://docs.kucoin.com/futures/#get-order-list
         * @see https://docs.kucoin.com/futures/#get-untriggered-stop-order-list
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @param {int|undefined} params.till end time in ms
         * @param {string|undefined} params.side buy or sell
         * @param {string|undefined} params.type limit, or market
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByStatus ('done', symbol, since, limit, params);
    }

    async fetchOrder (id = undefined, symbol = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://docs.kucoin.com/futures/#get-details-of-a-single-order
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let method = 'privateGetOrdersOrderId';
        if (id === undefined) {
            const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
            if (clientOrderId === undefined) {
                throw new InvalidOrder (this.id + ' fetchOrder() requires parameter id or params.clientOid');
            }
            request['clientOid'] = clientOrderId;
            method = 'futuresPrivateGetOrdersByClientOid';
            params = this.omit (params, [ 'clientOid', 'clientOrderId' ]);
        } else {
            request['order-id'] = id;
        }
        const response = await this[method] (this.extend (request, params));
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const responseData = this.safeValue (response, 'data');
        return this.parseOrder (responseData, market);
    }

    parseOrder (order, market = undefined) {
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const orderId = this.safeString (order, 'id');
        const type = this.safeString (order, 'type');
        const timestamp = this.safeInteger (order, 'createdAt');
        const datetime = this.iso8601 (timestamp);
        const price = this.safeString (order, 'price');
        // price is zero for market order
        // omitZero is called in safeOrder2
        const side = this.safeString (order, 'side');
        const feeCurrencyId = this.safeString (order, 'feeCurrency');
        const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
        const feeCost = this.safeNumber (order, 'fee');
        const amount = this.safeString (order, 'size');
        const filled = this.safeString (order, 'dealSize');
        const rawCost = this.safeString2 (order, 'dealFunds', 'filledValue');
        const leverage = this.safeString (order, 'leverage');
        const cost = Precise.stringDiv (rawCost, leverage);
        let average = undefined;
        if (Precise.stringGt (filled, '0')) {
            const contractSize = this.safeString (market, 'contractSize');
            if (market['linear']) {
                average = Precise.stringDiv (rawCost, Precise.stringMul (contractSize, filled));
            } else {
                average = Precise.stringDiv (Precise.stringMul (contractSize, filled), rawCost);
            }
        }
        // precision reported by their api is 8 d.p.
        // const average = Precise.stringDiv (rawCost, Precise.stringMul (filled, market['contractSize']));
        // bool
        const isActive = this.safeValue (order, 'isActive', false);
        const cancelExist = this.safeValue (order, 'cancelExist', false);
        let status = isActive ? 'open' : 'closed';
        status = cancelExist ? 'canceled' : status;
        const fee = {
            'currency': feeCurrency,
            'cost': feeCost,
        };
        const clientOrderId = this.safeString (order, 'clientOid');
        const timeInForce = this.safeString (order, 'timeInForce');
        const stopPrice = this.safeNumber (order, 'stopPrice');
        const postOnly = this.safeValue (order, 'postOnly');
        return this.safeOrder ({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'amount': amount,
            'price': price,
            'stopPrice': stopPrice,
            'cost': cost,
            'filled': filled,
            'remaining': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'fee': fee,
            'status': status,
            'info': order,
            'lastTradeTimestamp': undefined,
            'average': average,
            'trades': undefined,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        const versions = this.safeValue (this.options, 'versions', {});
        const apiVersions = this.safeValue (versions, api, {});
        const methodVersions = this.safeValue (apiVersions, method, {});
        const defaultVersion = this.safeString (methodVersions, path, this.version);
        const version = this.safeString (params, 'version', defaultVersion);
        const tail = '/api/' + version + '/' + this.implodeParams (path, params);
        url += tail;
        const query = this.omit (params, path);
        const queryLength = Object.keys (query).length;
        if (api === 'public') {
            if (queryLength) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let endpoint = '/api/v1/' + this.implodeParams (path, params);
            const bodyEncoded = this.urlencode (query);
            if (method !== 'GET' && method !== 'HEAD') {
                body = query;
            } else {
                if (queryLength && bodyEncoded !== '') {
                    url += '?' + bodyEncoded;
                    endpoint += '?' + bodyEncoded;
                }
            }
            const now = this.milliseconds ().toString ();
            let endpart = '';
            if (body !== undefined) {
                body = this.json (query);
                endpart = body;
            }
            const payload = now + method + endpoint + endpart;
            console.log (payload);
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'base64');
            headers = {
                'PF-API-SIGN': signature,
                'PF-API-TIMESTAMP': now,
                'PF-API-KEY': this.apiKey,
                'PF-API-PASSPHRASE': this.password,
            };
            headers['Content-Type'] = 'application/json';
            console.log (headers);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        // {"error":"Permission denied."}
        if ('error' in response) {
            const message = response['error'];
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
