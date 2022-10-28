'use strict';

//  ---------------------------------------------------------------------------
const Exchange = require ('./base/Exchange');
const { ExchangeError, AccountSuspended, ArgumentsRequired, AuthenticationError, DDoSProtection, ExchangeNotAvailable, InvalidOrder, OrderNotFound, PermissionDenied, InsufficientFunds, BadSymbol, RateLimitExceeded, BadRequest } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bibox extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bibox',
            'name': 'Bibox',
            'countries': [ 'CN', 'US', 'KR' ],
            'rateLimit': 166.667,
            'version': 'v3.1',
            'hostname': 'bibox.com',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // has but unimplemented
                'swap': undefined, // has but unimplemented
                'future': undefined,
                'option': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createMarketOrder': undefined, // or they will return https://github.com/ccxt/ccxt/issues/2338
                'createOrder': true,
                'createStopLimitOrder': false, // true for contract
                'createStopMarketOrder': false, // true for contract
                'createStopOrder': false, // true for contract
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrdersByStatus': true,
                'fetchPositionMode': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': true,
                'fetchWithdrawals': true,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/77257418-3262b000-6c85-11ea-8fb8-20bdf20b3592.jpg',
                'api': {
                    'rest': 'https://api.{hostname}',
                },
                'www': 'https://www.bibox365.com',
                'doc': [
                    'https://biboxcom.github.io/en/',
                    'https://biboxcom.github.io/v3/spot/en/',
                    'https://biboxcom.github.io/api/spot/v4',
                ],
                'fees': 'https://bibox.zendesk.com/hc/en-us/articles/360002336133',
                'referral': 'https://w2.bibox365.com/login/register?invite_code=05Kj3I',
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'cquery': 1,
                            'mdata': 1,
                            'cdata': 1,
                            'orderpending': 1,
                        },
                        'post': {
                            'mdata': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'credit': 1,
                            'cquery': 1,
                            'ctrade': 1,
                            'user': 1,
                            'orderpending': 1,
                            'transfer': 1,
                        },
                    },
                },
                'v1.1': {
                    'public': {
                        'get': [
                            'cquery',
                        ],
                    },
                    'private': {
                        'post': [
                            'cquery',
                            'ctrade',
                        ],
                    },
                },
                'v2': {
                    'public': {
                        'get': [
                            'mdata/kline',
                            'mdata/depth',
                        ],
                    },
                    'private': {
                        'post': [
                            'assets/transfer/spot',
                        ],
                    },
                },
                'v3': {
                    'public': {
                        'get': [
                            'mdata/ping',
                            'mdata/pairList',
                            'mdata/kline',
                            'mdata/marketAll',
                            'mdata/market',
                            'mdata/depth',
                            'mdata/deals',
                            'mdata/ticker',
                            'cbc/timestamp',
                            'cbu/timestamp',
                        ],
                    },
                    'private': {
                        'post': [
                            'assets/transfer/spot',
                            'assets/transfer/cbc',
                            'cbc/order/open',
                            'cbc/order/close',
                            'cbc/order/closeBatch',
                            'cbc/order/closeAll',
                            'cbc/changeMargin',
                            'cbc/changeMode',
                            'cbc/assets',
                            'cbc/position',
                            'cbc/order/list',
                            'cbc/order/detail',
                            'cbc/order/listBatch',
                            'cbc/order/listBatchByClientOid',
                            'cbuassets/transfer',
                            'cbu/order/open',
                            'cbu/order/close',
                            'cbu/order/closeBatch',
                            'cbu/order/closeAll',
                            'cbu/order/planOpen',
                            'cbu/order/planOrderList',
                            'cbu/order/planClose',
                            'cbu/order/planCloseAll',
                            'cbu/changeMargin',
                            'cbu/changeMode',
                            'cbu/assets',
                            'cbu/position',
                            'cbu/order/list',
                            'bu/order/detail',
                            'cbu/order/listBatch',
                            'cbu/order/listBatchByClientOid',
                        ],
                    },
                },
                'v3.1': {
                    'public': {
                        'get': [
                            'mdata/ping',
                            'cquery/buFundRate',
                            'cquery/buTagPrice',
                            'cquery/buValue',
                            'cquery/buUnit',
                            'cquery/bcFundRate',
                            'cquery/bcTagPrice',
                            'cquery/bcValue',
                            'cquery/bcUnit',
                        ],
                    },
                    'private': {
                        'get': [
                            'orderpending/tradeLimit',
                        ],
                        'post': [
                            'transfer/mainAssets',
                            'spot/account/assets',
                            'transfer/transferIn',
                            'transfer/transferOut',
                            'transfer/transferInList',
                            'transfer/transferOutList',
                            'transfer/coinConfig',
                            'transfer/withdrawInfo',
                            'orderpending/trade',
                            'orderpending/cancelTrade',
                            'orderpending/orderPendingList',
                            'orderpending/pendingHistoryList',
                            'orderpending/orderDetail',
                            'orderpending/order',
                            'orderpending/orderHistoryList',
                            'orderpending/orderDetailsLast',
                            'credit/transferAssets/base2credit',
                            'credit/transferAssets/credit2base',
                            'credit/lendOrder/get',
                            'credit/borrowOrder/get',
                            'credit/lendOrderbook/get',
                            'credit/transferAssets/lendAssets',
                            'credit/transferAssets/borrowAssets',
                            'credit/borrowOrder/autobook',
                            'credit/borrowOrder/refund',
                            'credit/lendOrderbook/publish',
                            'credit/lendOrderbook/cancel',
                            'credit/trade/trade',
                            'credit/trade/cancel',
                            'cquery/base_u/dealLog',
                            'cquery/base_u/orderDetail',
                            'cquery/base_u/orderHistory',
                            'cquery/base_u/orderById',
                            'cquery/base_coin/dealLog',
                            'cquery/base_coin/orderDetail',
                            'cquery/base_coin/orderHistory',
                            'cquery/base_coin/orderById',
                        ],
                    },
                },
                'v4': {
                    'public': {
                        'get': [
                            'marketdata/pairs',
                            'marketdata/order_book',
                            'marketdata/candles',
                            'marketdata/trades',
                            'marketdata/ticker',
                        ],
                    },
                    'private': {
                        'get': [
                            'userdata/accounts',
                            'userdata/ledger',
                            'userdata/order',
                            'userdata/orders',
                            'userdata/fills',
                        ],
                        'post': [
                            'userdata/order',
                        ],
                        'delete': [
                            'userdata/order',
                            'userdata/orders',
                            'userdata/fills',
                        ],
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.002'),
                    'maker': this.parseNumber ('0.001'),
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                '2011': AccountSuspended, // Account is locked
                '2015': AuthenticationError, // Google authenticator is wrong
                '2021': InsufficientFunds, // Insufficient balance available for withdrawal
                '2027': InsufficientFunds, // Insufficient balance available (for trade)
                '2033': OrderNotFound, // operation failed! Orders have been completed or revoked
                '2065': InvalidOrder, // Precatory price is exorbitant, please reset
                '2066': InvalidOrder, // Precatory price is low, please reset
                '2067': InvalidOrder, // Does not support market orders
                '2068': InvalidOrder, // The number of orders can not be less than
                '2078': InvalidOrder, // unvalid order price
                '2085': InvalidOrder, // Order quantity is too small
                '2091': RateLimitExceeded, // request is too frequency, please try again later
                '2092': InvalidOrder, // Minimum amount not met
                '2131': InvalidOrder, // The order quantity cannot be greater than
                '3000': BadRequest, // Requested parameter incorrect
                '3002': BadRequest, // Parameter cannot be null
                '3012': AuthenticationError, // invalid apiKey
                '3016': BadSymbol, // Trading pair error
                '3024': PermissionDenied, // wrong apikey permissions
                '3025': AuthenticationError, // signature failed
                '4000': ExchangeNotAvailable, // current network is unstable
                '4003': DDoSProtection, // server busy please try again later
                '-2004': InvalidOrder, // Invalid parameter 'price': price limit
                '-2102': RateLimitExceeded, // The usage limit is 10000 in 10000ms, but 10296 have been used.
            },
            'commonCurrencies': {
                'APENFT(NFT)': 'NFT',
                'BOX': 'DefiBox',
                'BPT': 'BlockPool Token',
                'GMT': 'GMT Token',
                'KEY': 'Bihu',
                'MTC': 'MTC Mesh Network', // conflict with MTC Docademic doc.com Token https://github.com/ccxt/ccxt/issues/6081 https://github.com/ccxt/ccxt/issues/3025
                'NFT': 'NFT Protocol',
                'PAI': 'PCHAIN',
                'REVO': 'Revo Network',
                'STAR': 'Starbase',
                'TERN': 'Ternio-ERC20',
            },
            'options': {
                'typesByAccount': {
                    'base': 'main',
                    'credit': 'margin',
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bibox#fetchMarkets
         * @description retrieves data on all markets for bibox
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const markets = await this.v4PublicGetMarketdataPairs (params);
        //
        //    [
        //        {
        //          symbol: 'STI_USDT',
        //          base: 'STI',
        //          quote: 'USDT',
        //          min_price: '0.000001',
        //          max_price: '100000000',
        //          min_quantity: '0.000001',
        //          max_quantity: '100000000',
        //          price_scale: '6',
        //          quantity_scale: '3',
        //          price_increment: '0.000001',
        //          quantity_increment: '0.001',
        //          min_order_value: '1'
        //        },
        //        ...
        //    ]
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const type = 'spot';
            const spot = true;
            const amountPrecision = this.safeString (market, 'quantity_scale');
            const pricePrecision = this.safeString (market, 'price_scale');
            result.push ({
                'id': id,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'type': type,
                'spot': spot,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (amountPrecision)),
                    'price': this.parseNumber (this.parsePrecision (pricePrecision)),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_quantity'),
                        'max': this.safeNumber (market, 'max_quantity'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'min_price'),
                        'max': this.safeNumber (market, 'max_price'),
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_order_value'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        // we don't set values that are not defined by the exchange
        //
        // fetchTicker
        //
        //    {
        //        "s": "ADA_USDT",             // trading pair code
        //        "t": 1666143212000,          // 24 hour transaction count
        //        "o": 0.371735,               // opening price
        //        "h": 0.373646,               // highest price
        //        "l": 0.358383,               // lowest price
        //        "p": 0.361708,               // latest price
        //        "q": 8.1,                    // latest volume
        //        "v": 1346397.88,             // 24 hour volume
        //        "a": 494366.08822867,        // 24 hour transaction value
        //        "c": -0.0267,                // 24 hour Change
        //        "n": 244631,
        //        "f": 16641250,               // 24 hour first transaction id
        //        "bp": 0.361565,              // Best current bid price
        //        "bq": 4324.26,               // Best current bid quantity
        //        "ap": 0.361708,              // Best current ask price
        //        "aq": 7726.59                // Best current ask quantity
        //    }
        //
        // fetchTickers
        //
        //    {
        //        is_hide: '0',
        //        high_cny: '0.1094',
        //        amount: '5.34',
        //        coin_symbol: 'BIX',
        //        last: '0.00000080',
        //        currency_symbol: 'BTC',
        //        change: '+0.00000001',
        //        low_cny: '0.1080',
        //        base_last_cny: '0.10935854',
        //        area_id: '7',
        //        percent: '+1.27%',
        //        last_cny: '0.1094',
        //        high: '0.00000080',
        //        low: '0.00000079',
        //        pair_type: '0',
        //        last_usd: '0.0155',
        //        vol24H: '6697325',
        //        id: '1',
        //        high_usd: '0.0155',
        //        low_usd: '0.0153'
        //    }
        //
        const timestamp = this.safeInteger2 (ticker, 'timestamp', 't');
        const baseId = this.safeString (ticker, 'coin_symbol');
        const quoteId = this.safeString (ticker, 'currency_symbol');
        let marketId = this.safeString (ticker, 's');
        if ((marketId === undefined) && (baseId !== undefined) && (quoteId !== undefined)) {
            marketId = baseId + '_' + quoteId;
        }
        market = this.safeMarket (marketId, market);
        const last = this.safeString2 (ticker, 'last', 'p');
        let percentage = this.safeString (ticker, 'percent');
        if (percentage !== undefined) {
            percentage = percentage.replace ('%', '');
        }
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString2 (ticker, 'high', 'h'),
            'low': this.safeString2 (ticker, 'low', 'l'),
            'bid': this.safeString (ticker, 'bp'),
            'bidVolume': this.safeString (ticker, 'bq'),
            'ask': this.safeString (ticker, 'ap'),
            'askVolume': this.safeString (ticker, 'aq'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'change'),
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString2 (ticker, 'a', 'vol24H'),
            'quoteVolume': this.safeString2 (ticker, 'v', 'amount'),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bibox#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://biboxcom.github.io/api/spot/v4/en/#get-tickers
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v4PublicGetMarketdataTicker (this.extend (request, params));
        //
        //    [
        //        {
        //            "s": "ADA_USDT",             // trading pair code
        //            "t": 1666143212000,          // 24 hour transaction count
        //            "o": 0.371735,               // opening price
        //            "h": 0.373646,               // highest price
        //            "l": 0.358383,               // lowest price
        //            "p": 0.361708,               // latest price
        //            "q": 8.1,                    // latest volume
        //            "v": 1346397.88,             // 24 hour volume
        //            "a": 494366.08822867,        // 24 hour transaction value
        //            "c": -0.0267,                // 24 hour Change
        //            "n": 244631,
        //            "f": 16641250,               // 24 hour first transaction id
        //            "bp": 0.361565,              // Best current bid price
        //            "bq": 4324.26,               // Best current bid quantity
        //            "ap": 0.361708,              // Best current ask price
        //            "aq": 7726.59                // Best current ask quantity
        //        }
        //    ]
        //
        const ticker = this.safeValue (response, 0);
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchTickers
         * @description v1, fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request = {
            'cmd': 'marketAll',
        };
        const response = await this.v1PublicGetMdata (this.extend (request, params));
        //
        //    {
        //        result: [
        //            {
        //                is_hide: '0',
        //                high_cny: '0.1094',
        //                amount: '5.34',
        //                coin_symbol: 'BIX',
        //                last: '0.00000080',
        //                currency_symbol: 'BTC',
        //                change: '+0.00000001',
        //                low_cny: '0.1080',
        //                base_last_cny: '0.10935854',
        //                area_id: '7',
        //                percent: '+1.27%',
        //                last_cny: '0.1094',
        //                high: '0.00000080',
        //                low: '0.00000079',
        //                pair_type: '0',
        //                last_usd: '0.0155',
        //                vol24H: '6697325',
        //                id: '1',
        //                high_usd: '0.0155',
        //                low_usd: '0.0153'
        //            },
        //            ...
        //        ],
        //        cmd: 'marketAll',
        //        ver: '1.1'
        //    }
        //
        const tickers = this.parseTickers (response['result'], symbols);
        const result = this.indexBy (tickers, 'symbol');
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger2 (trade, 'time', 'createdAt');
        let side = this.safeInteger2 (trade, 'side', 'order_side');
        side = (side === 1) ? 'buy' : 'sell';
        let marketId = this.safeString (trade, 'pair');
        if (marketId === undefined) {
            const baseId = this.safeString (trade, 'coin_symbol');
            const quoteId = this.safeString (trade, 'currency_symbol');
            if ((baseId !== undefined) && (quoteId !== undefined)) {
                marketId = baseId + '_' + quoteId;
            }
        }
        market = this.safeMarket (marketId, market);
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_symbol');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': Precise.stringNeg (feeCostString),
                'currency': feeCurrencyCode,
            };
        }
        const id = this.safeString (trade, 'id');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': undefined, // Bibox does not have it (documented) yet
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': 'limit',
            'takerOrMaker': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'cmd': 'deals',
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit; // default = 200
        }
        const response = await this.v1PublicGetMdata (this.extend (request, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchOrderBook
         * @see https://biboxcom.github.io/api/spot/v4/en/#get-order-book
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit *default=100* valid values include 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000
         * @param {object} params extra parameters specific to the bibox api endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {int|undefined} price_scale *default=0* depth of consolidation by price, valid values include 0, 1, 2, 3, 4, 5
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            const allowedValues = [ 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000 ];
            if (!this.inArray (limit, allowedValues)) {
                throw new BadRequest (this.id + ' fetchOrderBook limit argument by only be one of 1, 2, 5, 10, 20, 50, 100, 200, 500 or 1000');
            }
            request['level'] = limit;
        }
        const response = await this.v4PublicGetMarketdataOrderBook (this.extend (request, params));
        //
        //    {
        //        i: '1917961902',                  // update id
        //        t: '1666221729812',               // update time
        //        b: [                              // buy orders
        //            [
        //                '0.350983',               // order price
        //                '8760.69'                 // order amount
        //            ],
        //            ...
        //        ],
        //        a: [                              // sell orders
        //            [
        //                '0.351084',
        //                '14241.62'
        //            ],
        //            ...
        //        ]
        //    }
        //
        return this.parseOrderBook (response, market['symbol'], this.safeInteger (response, 't'), 'b', 'a');
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //    [
        //        '1656702000000',      // start time
        //        '19449.4',            // opening price
        //        '19451.7',            // maximum price
        //        '19290.6',            // minimum price
        //        '19401.5',            // closing price
        //        '73.328833',          // transaction volume
        //        '1419466.3805812',    // transaction value
        //        '45740585',           // first transaction id
        //        2899                  // The total number of transactions in the range
        //    ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchOHLCV
         * @see https://biboxcom.github.io/v3/spotv4/en/#get-candles
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @param {int|undefined} params.until timestamp in ms of the latest candle to fetch
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const until = this.safeInteger (params, 'until');
        const request = {
            'symbol': market['id'],
            'time_frame': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined && until !== undefined) {
            throw new BadRequest (this.id + ' fetchOHLCV cannot take both a since parameter and params["until"]');
        } else if (since !== undefined) {
            request['after'] = since;
        } else if (until !== undefined) {
            request['before'] = until;
        }
        const response = await this.v4PublicGetMarketdataCandles (this.extend (request, params));
        //
        //    {
        //        t: '3600000',
        //        e: [
        //            [
        //                '1656702000000',      // start time
        //                '19449.4',            // opening price
        //                '19451.7',            // maximum price
        //                '19290.6',            // minimum price
        //                '19401.5',            // closing price
        //                '73.328833',          // transaction volume
        //                '1419466.3805812',    // transaction value
        //                '45740585',           // first transaction id
        //                2899                  // The total number of transactions in the range
        //            ],
        //            ...
        //    }
        //
        let result = this.safeValue (response, 'e');
        if (result === undefined) {
            result = response || [];
        }
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bibox#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        if (this.checkRequiredCredentials (false)) {
            return await this.fetchCurrenciesPrivate (params);
        } else {
            return await this.fetchCurrenciesPublic (params);
        }
    }

    async fetchCurrenciesPublic (params = {}) {
        const request = {
            'cmd': 'currencies',
        };
        const response = await this.v1PublicGetCdata (this.extend (request, params));
        //
        // v1PublicGetCdata
        //
        //     {
        //         "result":[
        //             {
        //                 "symbol":"BTC",
        //                 "name":"BTC",
        //                 "valid_decimals":8,
        //                 "original_decimals":8,
        //                 "is_erc20":0,
        //                 "enable_withdraw":1,
        //                 "enable_deposit":1,
        //                 "withdraw_min":0.005,
        //                 "describe_summary":"[{\"lang\":\"zh-cn\",\"text\":\"Bitcoin 比特币的概念最初由中本聪在2009年提出，是点对点的基于 SHA-256 算法的一种P2P形式的数字货币，点对点的传输意味着一个去中心化的支付系统。\"},{\"lang\":\"en-ww\",\"text\":\"Bitcoin is a digital asset and a payment system invented by Satoshi Nakamoto who published a related paper in 2008 and released it as open-source software in 2009. The system featured as peer-to-peer; users can transact directly without an intermediary.\"}]"
        //             }
        //         ],
        //         "cmd":"currencies"
        //     }
        //
        const currencies = this.safeValue (response, 'result', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'symbol');
            const name = this.safeString (currency, 'name'); // contains hieroglyphs causing python ASCII bug
            const code = this.safeCurrencyCode (id);
            const precision = this.parseNumber (this.parsePrecision (this.safeString (currency, 'valid_decimals')));
            const deposit = this.safeValue (currency, 'enable_deposit');
            const withdraw = this.safeValue (currency, 'enable_withdraw');
            const active = (deposit && withdraw);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': precision,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'withdraw_min'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchCurrenciesPrivate (params = {}) {
        if (!this.checkRequiredCredentials (false)) {
            throw new AuthenticationError (this.id + " fetchCurrencies is an authenticated endpoint, therefore it requires 'apiKey' and 'secret' credentials. If you don't need currency details, set exchange.has['fetchCurrencies'] = false before calling its methods.");
        }
        const request = {
            'cmd': 'transfer/coinList',
            'body': {},
        };
        const response = await this.v1PrivatePostTransfer (this.extend (request, params));
        //
        //     {
        //         "result":[
        //             {
        //                 "result":[
        //                     {
        //                         "totalBalance":"14.60987476",
        //                         "balance":"14.60987476",
        //                         "freeze":"0.00000000",
        //                         "id":60,
        //                         "symbol":"USDT",
        //                         "icon_url":"/appimg/USDT_icon.png",
        //                         "describe_url":"[{\"lang\":\"zh-cn\",\"link\":\"https://bibox.zendesk.com/hc/zh-cn/articles/115004798234\"},{\"lang\":\"en-ww\",\"link\":\"https://bibox.zendesk.com/hc/en-us/articles/115004798234\"}]",
        //                         "name":"USDT",
        //                         "enable_withdraw":1,
        //                         "enable_deposit":1,
        //                         "enable_transfer":1,
        //                         "confirm_count":2,
        //                         "is_erc20":1,
        //                         "forbid_info":null,
        //                         "describe_summary":"[{\"lang\":\"zh-cn\",\"text\":\"USDT 是 Tether 公司推出的基于稳定价值货币美元（USD）的代币 Tether USD（简称USDT），1USDT=1美元，用户可以随时使用 USDT 与 USD 进行1:1的兑换。\"},{\"lang\":\"en-ww\",\"text\":\"USDT is a cryptocurrency asset issued on the Bitcoin blockchain via the Omni Layer Protocol. Each USDT unit is backed by a U.S Dollar held in the reserves of the Tether Limited and can be redeemed through the Tether Platform.\"}]",
        //                         "total_amount":4776930644,
        //                         "supply_amount":4642367414,
        //                         "price":"--",
        //                         "contract_father":"OMNI",
        //                         "supply_time":"--",
        //                         "comment":null,
        //                         "chain_type":"OMNI",
        //                         "general_name":"USDT",
        //                         "contract":"31",
        //                         "original_decimals":8,
        //                         "deposit_type":0,
        //                         "hasCobo":0,
        //                         "BTCValue":"0.00027116",
        //                         "CNYValue":"90.36087919",
        //                         "USDValue":"14.61090236",
        //                         "children":[
        //                             {"type":"ERC20","symbol":"eUSDT","enable_deposit":1,"enable_withdraw":1,"confirm_count":13},
        //                             {"type":"TRC20","symbol":"tUSDT","enable_deposit":1,"enable_withdraw":1,"confirm_count":20},
        //                             {"type":"OMNI","symbol":"USDT","enable_deposit":1,"enable_withdraw":1,"confirm_count":2},
        //                             {"type":"HECO","symbol":"hUSDT","enable_deposit":1,"enable_withdraw":1,"confirm_count":12},
        //                             {"type":"BSC(BEP20)","symbol":"bUSDT","enable_deposit":1,"enable_withdraw":1,"confirm_count":5},
        //                             {"type":"HPB","symbol":"pUSDT","enable_deposit":1,"enable_withdraw":1,"confirm_count":20}
        //                         ]
        //                     }
        //                 ],
        //                 "cmd":"transfer/coinList"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const currencies = this.safeValue (firstResult, 'result', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'symbol');
            const name = currency['name']; // contains hieroglyphs causing python ASCII bug
            const code = this.safeCurrencyCode (id);
            const precision = this.parseNumber ('0.00000001');
            const deposit = this.safeValue (currency, 'enable_deposit');
            const withdraw = this.safeValue (currency, 'enable_withdraw');
            const active = (deposit && withdraw);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': precision,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    parseBalance (response) {
        //
        //    [
        //        {
        //            "s": "USDT",              // asset code
        //            "a": 2.6617573979,        // available amount
        //            "h": 0                    // frozen amount
        //        },
        //        ...
        //    ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 's');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'a');
            account['used'] = this.safeString (balance, 'h');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bibox#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://biboxcom.github.io/api/spot/v4/en/#get-accounts
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @param {str} params.code unified currency code
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const code = this.safeString (params, 'code');
        params = this.omit (params, 'code');
        const request = {};
        if (code !== undefined) {
            const currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        const response = await this.v4PrivateGetUserdataAccounts (this.extend (request, params));
        //
        //    [
        //        {
        //            "s": "USDT",              // asset code
        //            "a": 2.6617573979,        // available amount
        //            "h": 0                    // frozen amount
        //        },
        //        ...
        //    ]
        //
        return this.parseBalance (response);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //    {
        //        "i": 1125899918063693495,     // entry id
        //        "s": "USDT",                  // asset symbol
        //        "T": "transfer_in",           // entry type: transfer, trade, fee
        //        "a": 14.71,                   // amount
        //        "b": 14.7100000044,           // balance
        //        "t": 1663367640374            // time
        //    }
        //
        const ledgerTypes = {
            'transfer_in': 'transfer',
            'transfer_out': 'transfer',
            'trade_finish_ask': 'trade',
            'trade_finish_bid': 'trade',
        };
        const id = this.safeString (item, 'i');
        const currencyId = this.safeString (item, 's');
        const type = this.safeString (item, 'T');
        const timestamp = this.safeInteger (item, 't');
        const amount = this.safeString (item, 'a');
        let direction = 'in';
        if (Precise.stringLt (amount, '0')) {
            direction = 'out';
        }
        return {
            'id': id,
            'direction': direction,
            'account': undefined,
            'referenceId': id,
            'referenceAccount': undefined,
            'type': this.safeString (ledgerTypes, type, type),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.parseNumber (amount),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': undefined,
            'after': this.safeNumber (item, 'b'),
            'status': undefined,
            'fee': undefined,
            'info': item,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @see https://biboxcom.github.io/api/spot/v4/en/#get-an-account-39-s-ledger
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit *default = 100* max number of ledger entrys to return
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @param {int} params.until timestamp in ms of the latest ledger entry, default is undefined
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {int} before bill record id. limited to return the maximum id value of the bill records
         * @param {int} after bill record id, limited to return the minimum id value of the bill records
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, 'until');
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (until !== undefined) {
            request['end_time'] = until;
        }
        const response = await this.v4PrivateGetUserdataLedger (this.extend (request, params));
        //
        //    [
        //        {
        //            "i": 1125899918063693495,     // entry id
        //            "s": "USDT",                  // asset symbol
        //            "T": "transfer_in",           // entry type: transfer, trade, fee
        //            "a": 14.71,                   // amount
        //            "b": 14.7100000044,           // balance
        //            "t": 1663367640374            // time
        //        }
        //    ]
        //
        return this.parseLedger (response, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since not used by bibox
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve, max=50, default=50
         * @param {object} params extra parameters specific to the bibox api endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {int} params.page page number, default=1
         * @param {string|undefined} params.filter_type deposit record filter, 0-all, 1-deposit in progress, 2-deposit received, 3-deposit failed
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 50;
        }
        const page = this.safeInteger (params, 'page', 1);
        const request = {
            'page': page,
            'size': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin_symbol'] = currency['id'];
        }
        const method = 'v3.1PrivatePostTransferTransferInList';
        const response = await this[method] (this.extend (request, params));
        //
        //    {
        //        result: {
        //            count: '5',
        //            page: '1',
        //            items: [
        //                {
        //                    id: '3553023',
        //                    coin_symbol: 'bUSDT',
        //                    chain_type: 'BEP20(BSC)',
        //                    to_address: '0xf1458ba28073b056e9666c4b2bbbc60451cda0fd',
        //                    tx_id: '0x2f2319c4ae804893369aeeeef06dd429abf2833b61290ea2bd63ec0e363ebce6',
        //                    amount: '14.71000000',
        //                    confirmCount: '14',
        //                    createdAt: '1663367581000',
        //                    status: '2'
        //                },
        //                ...
        //            ]
        //        },
        //        cmd: 'transferInList',
        //        state: '0'
        //    }
        //
        const result = this.safeValue (response, 'result');
        const items = this.safeValue (result, 'items');
        for (let i = 0; i < items.length; i++) {
            items[i]['type'] = 'deposit';
        }
        return this.parseTransactions (items, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'page': 1,
            'size': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['symbol'] = currency['id'];
        }
        const response = await this.v1PrivatePostTransfer ({
            'cmd': 'transfer/transferOutList',
            'body': this.extend (request, params),
        });
        //
        //     {
        //         "result":[
        //             {
        //                 "result":{
        //                     "count":1,
        //                     "page":1,
        //                     "items":[
        //                         {
        //                             "id":612867,
        //                             "coin_symbol":"ETH",
        //                             "chain_type":"ETH",
        //                             "to_address":"0xd41de7a88ab5fc59edc6669f54873576be95bff1",
        //                             "tx_id":"0xc60950596227af3f27c3a1b5911ea1c79bae53bdce67274e48a0ce87a5ef2df8",
        //                             "addr_remark":"binance",
        //                             "amount":"2.34550946",
        //                             "fee":"0.00600000",
        //                             "createdAt":1561339330000,
        //                             "memo":"",
        //                             "status":3
        //                         }
        //                     ]
        //                 },
        //                 "cmd":"transfer/transferOutList"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const innerResult = this.safeValue (firstResult, 'result', {});
        const withdrawals = this.safeValue (innerResult, 'items', []);
        for (let i = 0; i < withdrawals.length; i++) {
            withdrawals[i]['type'] = 'withdrawal';
        }
        return this.parseTransactions (withdrawals, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         'id': 1023291,
        //         'coin_symbol': 'ETH',
        //         'to_address': '0x7263....',
        //         'amount': '0.49170000',
        //         'confirmCount': '16',
        //         'createdAt': 1553123867000,
        //         'status': 2
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         'id': 521844,
        //         'coin_symbol': 'ETH',
        //         'to_address': '0xfd4e....',
        //         'addr_remark': '',
        //         'amount': '0.39452750',
        //         'fee': '0.00600000',
        //         'createdAt': 1553226906000,
        //         'memo': '',
        //         'status': 3
        //     }
        //
        // withdraw
        //
        //     {
        //         "result": 228, // withdrawal id
        //         "cmd":"transfer/transferOut"
        //     }
        //
        const id = this.safeString2 (transaction, 'id', 'result');
        const address = this.safeString (transaction, 'to_address');
        const currencyId = this.safeString (transaction, 'coin_symbol');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger (transaction, 'createdAt');
        let tag = this.safeString (transaction, 'addr_remark');
        const type = this.safeString (transaction, 'type');
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'), type);
        const amount = this.safeNumber (transaction, 'amount');
        let feeCost = this.safeNumber (transaction, 'fee');
        if (type === 'deposit') {
            feeCost = 0;
            tag = undefined;
        }
        const fee = {
            'cost': feeCost,
            'currency': code,
        };
        return {
            'info': transaction,
            'id': id,
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    parseTransactionStatusByType (status, type = undefined) {
        const statuses = {
            'deposit': {
                '1': 'pending',
                '2': 'ok',
            },
            'withdrawal': {
                '0': 'pending',
                '3': 'ok',
            },
        };
        return this.safeString (this.safeValue (statuses, type, {}), status, status);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bibox#createOrder
         * @description create a trade order
         * @see https://biboxcom.github.io/api/spot/v4/en/#create-an-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @param {bool|undefined} params.postOnly true or false
         * @param {string|undefined} params.timeInForce gtc or ioc
         * @param {string|undefined} params.clientOrderId client order id
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        type = type.toLowerCase ();
        if (type === 'market') {
            throw new BadRequest (this.id + ' createOrder () does not support market orders, only limit orders are allowed');
        } else if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder () requires a price argument for limit orders');
        }
        const request = {
            'symbol': market['id'],
            'side': side,
            'type': type,
            'quantity': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        const timeInForce = this.safeStringLower (params, 'timeInForce');
        if (timeInForce !== undefined) {
            request['time_in_force'] = timeInForce;
        }
        const postOnly = this.isPostOnly (false, undefined, params);
        if (postOnly) {
            request['post_only'] = postOnly;
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        params = this.omit (params, [ 'postOnly', 'timeInForce', 'clientOrderId' ]);
        const response = await this.v4PrivatePostUserdataOrder (this.deepExtend (request, params));
        //
        //     {
        //         "i": 14580623695947906,
        //         "I": "0",
        //         "m": "LUNC_USDT",
        //         "T": "limit",
        //         "s": "sell",
        //         "Q": -1015236.00000,
        //         "P": 0.0002900000,
        //         "t": "gtc",
        //         "o": false,
        //         "S": "accepted",
        //         "E": 0,
        //         "e": 0,
        //         "C": 1665670398046,
        //         "U": 1665670398046,
        //         "V": 582952205212,
        //         "n": 0,
        //         "F": [],
        //         "f": []
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name bibox#cancelAllOrders
         * @description cancels all open orders
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v4PrivateDeleteUserdataOrders (this.extend (request, params));
        //
        // []
        //
        return this.parseOrders (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bibox#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by bibox cancelOrder ()
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'id': id,
        };
        const response = await this.v4PrivateDeleteUserdataOrder (this.extend (request, params));
        //
        //    {
        //        "i": 4611688217450643477, // The order id assigned by the exchange
        //        "I": "", // User specified order id
        //        "m": "BTC_USDT", // trading pair code
        //        "T": "limit", // order type
        //        "s": "sell", // order direction
        //        "Q": -0.0100, // Order amount
        //        "P": 10043.8500, // order price
        //        "t": "gtc", // Time In Force
        //        "o": false, // Post Only
        //        "S": "filled", // order status
        //        "E": -0.0100, // transaction volume
        //        "e": -100.43850000, // transaction value
        //        "C": 1643193746043, // creation time
        //        "U": 1643193746464, // update time
        //        "n": 2, // number of transactions
        //        "F": [
        //            {
        //                "i": 13, // deal id
        //                "t": 1643193746464, // transaction time
        //                "p": 10043.85, // transaction price
        //                "q": -0.009, // transaction volume
        //                "l": "maker", // Maker / Taker transaction
        //                "f": {
        //                    "a": "USDT", // This transaction is used to pay the transaction fee
        //                    "m": 0.09039465000 // The handling fee for this transaction
        //                }
        //            },
        //            {
        //                "i": 12,
        //                "t": 1643193746266,
        //                "p": 10043.85,
        //                "q": -0.001,
        //                "l": "maker",
        //                "f": {
        //                        "a": "USDT",
        //                        "m": 0.01004385000
        //                    }
        //                }
        //        ],
        //        "f": [
        //            {
        //                "a": "USDT",  // Assets used to pay fees
        //                "m": 0.10043850000  // Total handling fee
        //            }
        //        ]
        //    }
        //
        return this.parseOrder (response);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by bibox fetchOrder
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.v4PrivateGetUserdataOrder (this.extend (request, params));
        //
        //    {
        //        i: '14580623696203099',       // the order id assigned by the exchange
        //        I: '0',                       // user specified order id
        //        m: 'ADA_USDT',                // trading pair code
        //        T: 'limit',                   // order type
        //        s: 'buy',                     // order direction
        //        Q: '4.000000',                // order amount
        //        P: '0.300000',                // order price
        //        t: 'gtc',                     // time in force
        //        o: false,                     // post only
        //        S: 'accepted',                // order status
        //        E: '0',                       // transaction volume
        //        e: '0',                       // transaction value
        //        C: '1666235804233',           // creation time
        //        U: '1666235804233',           // update time
        //        V: '586925436933',
        //        n: '0',                       // number of transactions
        //        F: [
        //            {
        //                i: 13,                // transaction id
        //                t: 1643193746464,     // transaction time
        //                p: 10043.85,          // transaction price
        //                q: -0.009,            // transaction volume
        //                l: "maker",           // maker / taker transaction
        //                f: {
        //                    a: "USDT",        // the asset used for the transaction to pay the handling fee
        //                    m: 0.09039465000  // the transaction fee
        //                }
        //            },
        //            ...
        //        ],
        //        f: [
        //            {
        //                a: "USDT",            // Assets used to pay fees
        //                m: 0.10043850000      // Total handling fee
        //            }
        //        ]
        //    }
        //
        return this.parseOrder (response);
    }

    parseOrder (order, market = undefined) {
        //
        //    {
        //        i: '14580623696203099',       // the order id assigned by the exchange
        //        I: '0',                       // user specified order id
        //        m: 'ADA_USDT',                // trading pair code
        //        T: 'limit',                   // order type
        //        s: 'buy',                     // order direction
        //        Q: '4.000000',                // order amount
        //        P: '0.300000',                // order price
        //        t: 'gtc',                     // time in force
        //        o: false,                     // post only
        //        S: 'accepted',                // order status
        //        E: '0',                       // transaction volume
        //        e: '0',                       // transaction value
        //        C: '1666235804233',           // creation time
        //        U: '1666235804233',           // update time
        //        V: '586925436933',
        //        n: '0',                       // number of transactions
        //        F: [
        //            {
        //                i: 13,                // transaction id
        //                t: 1643193746464,     // transaction time
        //                p: 10043.85,          // transaction price
        //                q: -0.009,            // transaction volume
        //                l: "maker",           // maker / taker transaction
        //                f: {
        //                    a: "USDT",        // the asset used for the transaction to pay the handling fee
        //                    m: 0.09039465000  // the transaction fee
        //                }
        //            },
        //            ...
        //        ],
        //        f: [
        //            {
        //                a: "USDT",            // Assets used to pay fees
        //                m: 0.10043850000      // Total handling fee
        //            }
        //        ]
        //    }
        //
        const marketId = this.safeString (order, 'm');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (order, 'C');
        let amount = this.safeString (order, 'Q');
        amount = Precise.stringAbs (amount);
        const side = this.safeString (order, 's');
        const fees = [];
        const orderFees = this.safeValue (order, 'f', []);
        for (let i = 0; i < orderFees.length; i++) {
            fees.push ({
                'currency': this.safeCurrencyCode (this.safeString (orderFees[i], 'a')),
                'cost': this.safeString (orderFees[i], 'm'),
            });
        }
        const transactions = this.safeValue (order, 'F');
        const trades = [];
        for (let i = 0; i < transactions.length; i++) {
            const trade = this.parseTrade (transactions[i]);
            trades.push (trade);
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'i'),
            'clientOrderId': this.omitZero (this.safeString (order, 'I')),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': this.safeString (order, 'T'),
            'timeInForce': this.safeStringUpper (order, 't'),
            'postOnly': this.safeValue (order, 'o'),
            'side': side,
            'price': this.safeString (order, 'P'),
            'stopPrice': undefined,
            'amount': amount,
            'cost': this.safeString (order, 'e'),
            'average': undefined,
            'filled': this.safeString (order, 'E'),
            'remaining': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'S')),
            'fee': this.safeValue (fees, 0),
            'fees': fees,
            'trades': trades,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            // original comments from bibox:
            '1': 'open', // pending
            '2': 'open', // part completed
            'accepted': 'open',
            '3': 'closed', // completed
            '4': 'canceled', // part canceled
            '5': 'canceled', // canceled
            '6': 'canceled', // canceling
            'rejected': 'rejected',
            '-1': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param status open or closed
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @param {int} params.until the latest time in ms to fetch orders for
         *
         * EXCHANGE SPECIFIC PARMETERS
         * @param {string} params.before order update id limited to return the maximum update id of the order
         * @param {string} params.after delegate update id limited to return the minimum update id of the order
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        const until = this.safeInteger (params, 'until');
        const open = (status === 'open');
        const unsettled = (status === 'unsettled');
        params = this.omit (params, 'until');
        if (until !== undefined) {              // The order of request parameters must go end_time -> limit -> start_time -> status -> symbol
            request['end_time'] = until;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        request['status'] = (open || unsettled) ? 'unsettled' : 'settled';
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.v4PrivateGetUserdataOrders (this.extend (request, params));
        //
        //    [
        //        {
        //            "i": 14589419788970785,
        //            "I": "0",
        //            "m": "ADA_USDT",
        //            "T": "limit",
        //            "s": "buy",
        //            "Q": 4.000000,
        //            "P": 0.300000,
        //            "t": "gtc",
        //            "o": false,
        //            "S": "accepted",
        //            "E": 0,
        //            "e": 0,
        //            "C": 1666373682656,
        //            "U": 1666373682656,
        //            "V": 587932155076,
        //            "n": 0,
        //            "F": [],
        //            "f": []
        //        }
        //    ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of order structures to retrieve
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByStatus ('open', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders requires a symbol argument');
        }
        return await this.fetchOrdersByStatus ('closed', symbol, since, limit, params);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const size = limit ? limit : 200;
        const request = {
            'cmd': 'orderpending/orderHistoryList',
            'body': this.extend ({
                'pair': market['id'],
                'account_type': 0, // 0 - regular, 1 - margin
                'page': 1,
                'size': size,
                'coin_symbol': market['baseId'],
                'currency_symbol': market['quoteId'],
            }, params),
        };
        const response = await this.v1PrivatePostOrderpending (request);
        //
        //     {
        //         "result":[
        //             {
        //                 "result":{
        //                     "count":1,
        //                     "page":1,
        //                     "items":[
        //                         {
        //                             "id":"100055558128033",
        //                             "createdAt": 1512756997000,
        //                             "account_type":0,
        //                             "coin_symbol":"LTC",
        //                             "currency_symbol":"BTC",
        //                             "order_side":2,
        //                             "order_type":2,
        //                             "price":"0.00886500",
        //                             "amount":"1.00000000",
        //                             "money":"0.00886500",
        //                             "fee":0
        //                         }
        //                     ]
        //                 },
        //                 "cmd":"orderpending/orderHistoryList"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const innerResult = this.safeValue (firstResult, 'result', {});
        const trades = this.safeValue (innerResult, 'items', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name bibox#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'cmd': 'transfer/transferIn',
            'body': this.extend ({
                'coin_symbol': currency['id'],
            }, params),
        };
        const response = await this.v1PrivatePostTransfer (request);
        //
        //     {
        //         "result":[
        //             {
        //                 "result":"3Jx6RZ9TNMsAoy9NUzBwZf68QBppDruSKW",
        //                 "cmd":"transfer/transferIn"
        //             }
        //         ]
        //     }
        //
        //     {
        //         "result":[
        //             {
        //                 "result":"{\"account\":\"PERSONALLY OMITTED\",\"memo\":\"PERSONALLY OMITTED\"}",
        //                 "cmd":"transfer/transferIn"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const innerResult = this.safeValue (firstResult, 'result');
        let address = innerResult;
        let tag = undefined;
        if (this.isJsonEncodedObject (innerResult)) {
            const parsed = JSON.parse (innerResult);
            address = this.safeString (parsed, 'account');
            tag = this.safeString (parsed, 'memo');
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bibox#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (this.password === undefined) {
            if (!('trade_pwd' in params)) {
                throw new ExchangeError (this.id + ' withdraw() requires this.password set on the exchange instance or a trade_pwd parameter');
            }
        }
        if (!('totp_code' in params)) {
            throw new ExchangeError (this.id + ' withdraw() requires a totp_code parameter for 2FA authentication');
        }
        const request = {
            'trade_pwd': this.password,
            'coin_symbol': currency['id'],
            'amount': amount,
            'addr': address,
        };
        if (tag !== undefined) {
            request['address_remark'] = tag;
        }
        const response = await this.v1PrivatePostTransfer ({
            'cmd': 'transfer/transferOut',
            'body': this.extend (request, params),
        });
        //
        //     {
        //         "result":[
        //             {
        //                 "result": 228, // withdrawal id
        //                 "cmd":"transfer/transferOut"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        return this.parseTransaction (firstResult, currency);
    }

    async fetchTransactionFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name bibox#fetchTransactionFees
         * @description fetch transaction fees
         * @param {[string]|undefined} codes list of unified currency codes
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {[object]} a list of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        // by default it will try load withdrawal fees of all currencies (with separate requests)
        // however if you define codes = [ 'ETH', 'BTC' ] in args it will only load those
        await this.loadMarkets ();
        const withdrawFees = {};
        const info = {};
        if (codes === undefined) {
            codes = Object.keys (this.currencies);
        }
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const request = {
                'cmd': 'transfer/coinConfig',
                'body': this.extend ({
                    'coin_symbol': currency['id'],
                }, params),
            };
            const response = await this.v1PrivatePostTransfer (request);
            //     {
            //         "result":[
            //             {
            //                 "result":[
            //                     {
            //                         "coin_symbol":"ETH",
            //                         "is_active":1,
            //                         "original_decimals":18,
            //                         "enable_deposit":1,
            //                         "enable_withdraw":1,
            //                         "withdraw_fee":0.008,
            //                         "withdraw_min":0.05,
            //                         "deposit_avg_spent":173700,
            //                         "withdraw_avg_spent":322600
            //                     }
            //                 ],
            //                 "cmd":"transfer/coinConfig"
            //             }
            //         ]
            //     }
            //
            const outerResults = this.safeValue (response, 'result', []);
            const firstOuterResult = this.safeValue (outerResults, 0, {});
            const innerResults = this.safeValue (firstOuterResult, 'result', []);
            const firstInnerResult = this.safeValue (innerResults, 0, {});
            info[code] = firstInnerResult;
            withdrawFees[code] = this.safeNumber (firstInnerResult, 'withdraw_fee');
        }
        return {
            'info': info,
            'withdraw': withdrawFees,
            'deposit': {},
        };
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name bibox#transfer
         * @description transfer currency internally between wallets on the same account, transfers must be made to/from account "main"
         * @see https://biboxcom.github.io/api/spot/v3/en/#wallet-to-spot
         * @see https://biboxcom.github.io/api/spot/v3/en/#wallet-to-leverage
         * @see https://biboxcom.github.io/api/spot/v3/en/#leverage-to-wallet
         * @see https://biboxcom.github.io/api/futures/v3/en/#2-fund-transfer
         * @see https://biboxcom.github.io/api/futures-coin/v3/en/#2-fund-transfer
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount main, spot, cross, swap or an isolated margin market symbol (ex: XRP/USDT)
         * @param {string} toAccount main, spot, cross, swap or an isolated margin market symbol (ex: XRP/USDT)
         * @param {object} params extra parameters specific to the bibox api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const fromMain = fromAccount === 'main' || fromAccount === 'wallet' || fromAccount === 'funding';
        const fromSpot = fromAccount === 'spot';
        const toMain = toAccount === 'main' || toAccount === 'wallet' || toAccount === 'funding';
        const toSpot = toAccount === 'spot';
        const toCross = toAccount === 'cross';
        const fromCross = fromAccount === 'cross';
        const toIsolated = this.inArray (toAccount, this.symbols);
        const fromIsolated = this.inArray (fromAccount, this.symbols);
        const toSwap = toAccount === 'swap';
        const fromSwap = fromAccount === 'swap';
        let method = 'v3PrivatePostAssetsTransferSpot';
        const request = {
            'amount': amount,
        };
        if (toSpot || fromSpot) {
            request['symbol'] = currency['id'];
            if (fromMain) {
                request['type'] = 0;
            } else if (toMain) {
                request['type'] = 1;
            } else {
                throw new BadRequest (this.id + ' cannot transfer from ' + fromAccount + ' to ' + toAccount);
            }
        } else if ((fromCross || fromIsolated) && toMain) {
            method = 'v3.1PrivatePostCreditTransferAssetsCredit2base';
            request['coin_symbol'] = currency['id'];
            request['pair'] = fromIsolated ? this.marketId (fromAccount) : '*_USDT';
        } else if ((toCross || toIsolated) && fromMain) {
            method = 'v3.1PrivatePostCreditTransferAssetsBase2credit';
            request['coin_symbol'] = currency['id'];
            request['pair'] = toIsolated ? this.marketId (toAccount) : '*_USDT';
        } else if (toSwap || fromSwap) {
            if (code === 'USDT') {
                method = 'v3PrivatePostCbuassetsTransfer';
            } else {
                method = 'v3PrivatePostAssetsTransferCbc';
            }
            if (toMain) {
                request['type'] = 1;
            } else if (fromMain) {
                request['type'] = 0;
            } else {
                throw new BadRequest (this.id + ' cannot transfer from ' + fromAccount + ' to ' + toAccount);
            }
            request['symbol'] = currency['id'];
        } else {
            throw new BadRequest (this.id + ' cannot transfer from ' + fromAccount + ' to ' + toAccount);
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot <-> main
        //
        //    {
        //        state: '0',
        //        id: '936177661049344000'
        //    }
        //
        // main <-> leverage
        //
        //    {
        //        result: '1620000000049',
        //        cmd: 'transferAssets/base2credit',
        //        state: '0'
        //    }
        //
        // main <-> swap
        //
        //    {
        //        state: '0',
        //        result: '936190233517527040'
        //    }
        //
        return this.parseTransfer (response, currency);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        // spot <-> main
        //
        //    {
        //        state: '0',
        //        id: '936177661049344000'
        //    }
        //
        // main <-> leverage
        //
        //    {
        //        result: '1620000000049',
        //        cmd: 'transferAssets/base2credit',
        //        state: '0'
        //    }
        //
        // main <-> swap
        //
        //    {
        //        state: '0',
        //        result: '936190233517527040'
        //    }
        //
        const cmd = this.safeString (transfer, 'cmd');
        let fromAccount = undefined;
        let toAccount = undefined;
        if (cmd !== undefined) {
            const accounts = this.safeString (cmd.split ('/'), 1);
            const parts = accounts.split ('2');
            fromAccount = this.safeString (parts, 0);
            toAccount = this.safeString (parts, 1);
            fromAccount = this.safeString (this.options['typesByAccount'], fromAccount, fromAccount);
            toAccount = this.safeString (this.options['typesByAccount'], toAccount, toAccount);
        }
        return {
            'info': transfer,
            'id': this.safeString2 (transfer, 'id', 'result'),
            'timestamp': undefined,
            'datetime': undefined,
            'currency': this.safeString (currency, 'code'),
            'amount': undefined,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': undefined,
        };
    }

    sign (path, api = 'v1Public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const [ version, access ] = api;
        const v1 = (version === 'v1');
        const v4 = (version === 'v4');
        const prefix = v4 ? '/api' : '';
        let url = this.implodeHostname (this.urls['api']['rest']) + prefix + '/' + version + '/' + path;
        const jsonParams = v1 ? this.json ([ params ]) : this.json (params);
        headers = { 'content-type': 'application/json' };
        if (access === 'public') {
            if (method !== 'GET') {
                if (v1) {
                    body = { 'cmds': jsonParams };
                } else {
                    body = { 'body': jsonParams };
                }
            } else if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            if (version === 'v3' || version === 'v3.1') {
                const timestamp = this.numberToString (this.milliseconds ());
                let strToSign = timestamp;
                if (jsonParams !== '{}') {
                    strToSign += jsonParams;
                }
                const sign = this.hmac (this.encode (strToSign), this.encode (this.secret), 'md5');
                headers['bibox-api-key'] = this.apiKey;
                headers['bibox-api-sign'] = sign;
                headers['bibox-timestamp'] = timestamp;
                if (method === 'GET') {
                    url += '?' + this.urlencode (params);
                } else {
                    if (jsonParams !== '{}') {
                        body = params;
                    }
                }
            } else if (v4) {
                let strToSign = '';
                const sortedParams = this.keysort (params);
                if (method === 'GET') {
                    url += '?' + this.urlencode (sortedParams);
                    strToSign = this.urlencode (sortedParams);
                } else {
                    if (jsonParams !== '{}') {
                        body = sortedParams;
                    }
                    strToSign = this.json (body, { 'convertArraysToObjects': true });
                }
                const sign = this.hmac (this.encode (strToSign), this.encode (this.secret), 'sha256');
                headers['Bibox-Api-Key'] = this.apiKey;
                headers['Bibox-Api-Sign'] = sign;
            } else {
                const sign = this.hmac (this.encode (jsonParams), this.encode (this.secret), 'md5');
                body = {
                    'apikey': this.apiKey,
                    'sign': sign,
                };
                if (v1) {
                    body['cmds'] = jsonParams;
                } else {
                    body['body'] = jsonParams;
                }
            }
        }
        if (body !== undefined) {
            body = this.json (body, { 'convertArraysToObjects': true });
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if ('state' in response) {
            if (this.safeNumber (response, 'state') === 0) {
                return;
            }
            throw new ExchangeError (this.id + ' ' + body);
        }
        if ('error' in response) {
            if (typeof response['error'] === 'object') {
                if ('code' in response['error']) {
                    const code = this.safeString (response['error'], 'code');
                    const feedback = this.id + ' ' + body;
                    this.throwExactlyMatchedException (this.exceptions, code, feedback);
                    throw new ExchangeError (feedback);
                }
                throw new ExchangeError (this.id + ' ' + body);
            } else {
                const code = this.safeString (response, 'error');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions, code, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
