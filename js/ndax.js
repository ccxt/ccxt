'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, InsufficientFunds, BadSymbol, OrderNotFound } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class ndax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ndax',
            'name': 'NDAX',
            'countries': [ 'CA' ], // Canada
            'rateLimit': 1000,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': true,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '1h': '3600',
                '2h': '7200',
                '4h': '14400',
                '6h': '21600',
                '12h': '43200',
                '1d': '86400',
                '1w': '604800',
                '1M': '2419200',
                '4M': '9676800',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/108623144-67a3ef00-744e-11eb-8140-75c6b851e945.jpg',
                'test': {
                    'public': 'https://ndaxmarginstaging.cdnhop.net:8443/AP',
                    'private': 'https://ndaxmarginstaging.cdnhop.net:8443/AP',
                },
                'api': {
                    'public': 'https://api.ndax.io:8443/AP',
                    'private': 'https://api.ndax.io:8443/AP',
                },
                'www': 'https://ndax.io',
                'doc': [
                    'https://apidoc.ndax.io/',
                ],
                'fees': 'https://ndax.io/fees',
                'referral': 'https://one.ndax.io/bfQiSL',
            },
            'api': {
                'public': {
                    'get': {
                        'Activate2FA': 1,
                        'Authenticate2FA': 1,
                        'AuthenticateUser': 1,
                        'GetL2Snapshot': 1,
                        'GetLevel1': 1,
                        'GetValidate2FARequiredEndpoints': 1,
                        'LogOut': 1,
                        'GetTickerHistory': 1,
                        'GetProduct': 1,
                        'GetProducts': 1,
                        'GetInstrument': 1,
                        'GetInstruments': 1,
                        'Ping': 1,
                        'trades': 1, // undocumented
                        'GetLastTrades': 1, // undocumented
                        'SubscribeLevel1': 1,
                        'SubscribeLevel2': 1,
                        'SubscribeTicker': 1,
                        'SubscribeTrades': 1,
                        'SubscribeBlockTrades': 1,
                        'UnsubscribeBlockTrades': 1,
                        'UnsubscribeLevel1': 1,
                        'UnsubscribeLevel2': 1,
                        'UnsubscribeTicker': 1,
                        'UnsubscribeTrades': 1,
                        'Authenticate': 1, // undocumented
                    },
                },
                'private': {
                    'get': {
                        'GetUserAccountInfos': 1,
                        'GetUserAccounts': 1,
                        'GetUserAffiliateCount': 1,
                        'GetUserAffiliateTag': 1,
                        'GetUserConfig': 1,
                        'GetAllUnredactedUserConfigsForUser': 1,
                        'GetUnredactedUserConfigByKey': 1,
                        'GetUserDevices': 1,
                        'GetUserReportTickets': 1,
                        'GetUserReportWriterResultRecords': 1,
                        'GetAccountInfo': 1,
                        'GetAccountPositions': 1,
                        'GetAllAccountConfigs': 1,
                        'GetTreasuryProductsForAccount': 1,
                        'GetAccountTrades': 1,
                        'GetAccountTransactions': 1,
                        'GetOpenTradeReports': 1,
                        'GetAllOpenTradeReports': 1,
                        'GetTradesHistory': 1,
                        'GetOpenOrders': 1,
                        'GetOpenQuotes': 1,
                        'GetOrderFee': 1,
                        'GetOrderHistory': 1,
                        'GetOrdersHistory': 1,
                        'GetOrderStatus': 1,
                        'GetOmsFeeTiers': 1,
                        'GetAccountDepositTransactions': 1,
                        'GetAccountWithdrawTransactions': 1,
                        'GetAllDepositRequestInfoTemplates': 1,
                        'GetDepositInfo': 1,
                        'GetDepositRequestInfoTemplate': 1,
                        'GetDeposits': 1,
                        'GetDepositTicket': 1,
                        'GetDepositTickets': 1,
                        'GetOMSWithdrawFees': 1,
                        'GetWithdrawFee': 1,
                        'GetWithdraws': 1,
                        'GetWithdrawTemplate': 1,
                        'GetWithdrawTemplateTypes': 1,
                        'GetWithdrawTicket': 1,
                        'GetWithdrawTickets': 1,
                    },
                    'post': {
                        'AddUserAffiliateTag': 1,
                        'CancelUserReport': 1,
                        'RegisterNewDevice': 1,
                        'SubscribeAccountEvents': 1,
                        'UpdateUserAffiliateTag': 1,
                        'GenerateTradeActivityReport': 1,
                        'GenerateTransactionActivityReport': 1,
                        'GenerateTreasuryActivityReport': 1,
                        'ScheduleTradeActivityReport': 1,
                        'ScheduleTransactionActivityReport': 1,
                        'ScheduleTreasuryActivityReport': 1,
                        'CancelAllOrders': 1,
                        'CancelOrder': 1,
                        'CancelQuote': 1,
                        'CancelReplaceOrder': 1,
                        'CreateQuote': 1,
                        'ModifyOrder': 1,
                        'SendOrder': 1,
                        'SubmitBlockTrade': 1,
                        'UpdateQuote': 1,
                        'CancelWithdraw': 1,
                        'CreateDepositTicket': 1,
                        'CreateWithdrawTicket': 1,
                        'SubmitDepositTicketComment': 1,
                        'SubmitWithdrawTicketComment': 1,
                        'GetOrderHistoryByOrderId': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.0025'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
                // these credentials are required for signIn() and withdraw()
                'login': true,
                'password': true,
                // 'twofa': true,
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'Not_Enough_Funds': InsufficientFunds, // {"status":"Rejected","errormsg":"Not_Enough_Funds","errorcode":101}
                    'Server Error': ExchangeError, // {"result":false,"errormsg":"Server Error","errorcode":102,"detail":null}
                    'Resource Not Found': OrderNotFound, // {"result":false,"errormsg":"Resource Not Found","errorcode":104,"detail":null}
                },
                'broad': {
                    'Invalid InstrumentId': BadSymbol, // {"result":false,"errormsg":"Invalid InstrumentId: 10000","errorcode":100,"detail":null}
                    'This endpoint requires 2FACode along with the payload': AuthenticationError,
                },
            },
            'options': {
                'omsId': 1,
                'orderTypes': {
                    'Market': 1,
                    'Limit': 2,
                    'StopMarket': 3,
                    'StopLimit': 4,
                    'TrailingStopMarket': 5,
                    'TrailingStopLimit': 6,
                    'BlockTrade': 7,
                },
            },
        });
    }

    async signIn (params = {}) {
        /**
         * @method
         * @name ndax#signIn
         * @description sign in, must be called prior to using other authenticated methods
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns response from exchange
         */
        this.checkRequiredCredentials ();
        if (this.login === undefined || this.password === undefined) {
            throw new AuthenticationError (this.id + ' signIn() requires exchange.login, exchange.password');
        }
        let request = {
            'grant_type': 'client_credentials', // the only supported value
        };
        const response = await this.publicGetAuthenticate (this.extend (request, params));
        //
        //     {
        //         "Authenticated":true,
        //         "Requires2FA":true,
        //         "AuthType":"Google",
        //         "AddtlInfo":"",
        //         "Pending2FaToken": "6f5c4e66-f3ee-493e-9227-31cc0583b55f"
        //     }
        //
        let sessionToken = this.safeString (response, 'SessionToken');
        if (sessionToken !== undefined) {
            this.options['sessionToken'] = sessionToken;
            return response;
        }
        const pending2faToken = this.safeString (response, 'Pending2FaToken');
        if (pending2faToken !== undefined) {
            if (this.twofa === undefined) {
                throw new AuthenticationError (this.id + ' signIn() requires exchange.twofa credentials');
            }
            this.options['pending2faToken'] = pending2faToken;
            request = {
                'Code': this.oath (),
            };
            const response = await this.publicGetAuthenticate2FA (this.extend (request, params));
            //
            //     {
            //         "Authenticated": true,
            //         "UserId":57765,
            //         "SessionToken":"4a2a5857-c4e5-4fac-b09e-2c4c30b591a0"
            //     }
            //
            sessionToken = this.safeString (response, 'SessionToken');
            this.options['sessionToken'] = sessionToken;
            return response;
        }
        return response;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name ndax#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        const request = {
            'omsId': omsId,
        };
        const response = await this.publicGetGetProducts (this.extend (request, params));
        //
        //     [
        //         {
        //             "OMSId":1,
        //             "ProductId":1,
        //             "Product":"BTC",
        //             "ProductFullName":"Bitcoin",
        //             "ProductType":"CryptoCurrency",
        //             "DecimalPlaces":8,
        //             "TickSize":0.0000000100000000000000000000,
        //             "NoFees":false,
        //             "IsDisabled":false,
        //             "MarginEnabled":false
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'ProductId');
            const name = this.safeString (currency, 'ProductFullName');
            const type = this.safeString (currency, 'ProductType');
            const code = this.safeCurrencyCode (this.safeString (currency, 'Product'));
            const isDisabled = this.safeValue (currency, 'IsDisabled');
            const active = !isDisabled;
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'type': type,
                'precision': this.safeNumber (currency, 'TickSize'),
                'info': currency,
                'active': active,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
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

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name ndax#fetchMarkets
         * @description retrieves data on all markets for ndax
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        const request = {
            'omsId': omsId,
        };
        const response = await this.publicGetGetInstruments (this.extend (request, params));
        //
        //     [
        //         {
        //             "OMSId":1,
        //             "InstrumentId":3,
        //             "Symbol":"LTCBTC",
        //             "Product1":3,
        //             "Product1Symbol":"LTC",
        //             "Product2":1,
        //             "Product2Symbol":"BTC",
        //             "InstrumentType":"Standard",
        //             "VenueInstrumentId":3,
        //             "VenueId":1,
        //             "SortIndex":0,
        //             "SessionStatus":"Running",
        //             "PreviousSessionStatus":"Stopped",
        //             "SessionStatusDateTime":"2020-11-25T19:42:15.245Z",
        //             "SelfTradePrevention":true,
        //             "QuantityIncrement":0.0000000100000000000000000000,
        //             "PriceIncrement":0.0000000100000000000000000000,
        //             "MinimumQuantity":0.0100000000000000000000000000,
        //             "MinimumPrice":0.0000010000000000000000000000,
        //             "VenueSymbol":"LTCBTC",
        //             "IsDisable":false,
        //             "MasterDataId":0,
        //             "PriceCollarThreshold":0.0000000000000000000000000000,
        //             "PriceCollarPercent":0.0000000000000000000000000000,
        //             "PriceCollarEnabled":false,
        //             "PriceFloorLimit":0.0000000000000000000000000000,
        //             "PriceFloorLimitEnabled":false,
        //             "PriceCeilingLimit":0.0000000000000000000000000000,
        //             "PriceCeilingLimitEnabled":false,
        //             "CreateWithMarketRunning":true,
        //             "AllowOnlyMarketMakerCounterParty":false,
        //             "PriceCollarIndexDifference":0.0000000000000000000000000000,
        //             "PriceCollarConvertToOtcEnabled":false,
        //             "PriceCollarConvertToOtcClientUserId":0,
        //             "PriceCollarConvertToOtcAccountId":0,
        //             "PriceCollarConvertToOtcThreshold":0.0000000000000000000000000000,
        //             "OtcConvertSizeThreshold":0.0000000000000000000000000000,
        //             "OtcConvertSizeEnabled":false,
        //             "OtcTradesPublic":true,
        //             "PriceTier":0
        //         },
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'InstrumentId');
            // const lowercaseId = this.safeStringLower (market, 'symbol');
            const baseId = this.safeString (market, 'Product1');
            const quoteId = this.safeString (market, 'Product2');
            const base = this.safeCurrencyCode (this.safeString (market, 'Product1Symbol'));
            const quote = this.safeCurrencyCode (this.safeString (market, 'Product2Symbol'));
            const sessionStatus = this.safeString (market, 'SessionStatus');
            const isDisable = this.safeValue (market, 'IsDisable');
            const sessionRunning = (sessionStatus === 'Running');
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
                'active': (sessionRunning && !isDisable),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'QuantityIncrement'),
                    'price': this.safeNumber (market, 'PriceIncrement'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'MinimumQuantity'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeNumber (market, 'MinimumPrice'),
                        'max': undefined,
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

    parseOrderBook (orderbook, symbol, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 6, amountKey = 8) {
        let nonce = undefined;
        const result = {
            'symbol': symbol,
            'bids': [],
            'asks': [],
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
        for (let i = 0; i < orderbook.length; i++) {
            const level = orderbook[i];
            if (timestamp === undefined) {
                timestamp = this.safeInteger (level, 2);
            } else {
                const newTimestamp = this.safeInteger (level, 2);
                timestamp = Math.max (timestamp, newTimestamp);
            }
            if (nonce === undefined) {
                nonce = this.safeInteger (level, 0);
            } else {
                const newNonce = this.safeInteger (level, 0);
                nonce = Math.max (nonce, newNonce);
            }
            const bidask = this.parseBidAsk (level, priceKey, amountKey);
            const levelSide = this.safeInteger (level, 9);
            const side = levelSide ? asksKey : bidsKey;
            result[side].push (bidask);
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        result['nonce'] = nonce;
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name ndax#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        const market = this.market (symbol);
        limit = (limit === undefined) ? 100 : limit; // default 100
        const request = {
            'omsId': omsId,
            'InstrumentId': market['id'],
            'Depth': limit, // default 100
        };
        const response = await this.publicGetGetL2Snapshot (this.extend (request, params));
        //
        //     [
        //         [
        //             0,   // 0 MDUpdateId
        //             1,   // 1 Number of Unique Accounts
        //             123, // 2 ActionDateTime in Posix format X 1000
        //             0,   // 3 ActionType 0 (New), 1 (Update), 2(Delete)
        //             0.0, // 4 LastTradePrice
        //             0,   // 5 Number of Orders
        //             0.0, // 6 Price
        //             0,   // 7 ProductPairCode
        //             0.0, // 8 Quantity
        //             0,   // 9 Side
        //         ],
        //         [97244115,1,1607456142963,0,19069.32,1,19069.31,8,0.140095,0],
        //         [97244115,0,1607456142963,0,19069.32,1,19068.64,8,0.0055,0],
        //         [97244115,0,1607456142963,0,19069.32,1,19068.26,8,0.021291,0],
        //         [97244115,1,1607456142964,0,19069.32,1,19069.32,8,0.099636,1],
        //         [97244115,0,1607456142964,0,19069.32,1,19069.98,8,0.1,1],
        //         [97244115,0,1607456142964,0,19069.32,1,19069.99,8,0.141604,1],
        //     ]
        //
        return this.parseOrderBook (response, symbol);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "OMSId":1,
        //         "InstrumentId":8,
        //         "BestBid":19069.31,
        //         "BestOffer":19069.32,
        //         "LastTradedPx":19069.32,
        //         "LastTradedQty":0.0001,
        //         "LastTradeTime":1607040406424,
        //         "SessionOpen":19069.32,
        //         "SessionHigh":19069.32,
        //         "SessionLow":19069.32,
        //         "SessionClose":19069.32,
        //         "Volume":0.0001,
        //         "CurrentDayVolume":0.0001,
        //         "CurrentDayNotional":1.906932,
        //         "CurrentDayNumTrades":1,
        //         "CurrentDayPxChange":0.00,
        //         "Rolling24HrVolume":0.000000000000000000000000000,
        //         "Rolling24HrNotional":0.00000000000000000000000,
        //         "Rolling24NumTrades":0,
        //         "Rolling24HrPxChange":0,
        //         "TimeStamp":"1607040406425",
        //         "BidQty":0,
        //         "AskQty":0,
        //         "BidOrderCt":0,
        //         "AskOrderCt":0,
        //         "Rolling24HrPxChangePercent":0,
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'TimeStamp');
        const marketId = this.safeString (ticker, 'InstrumentId');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'LastTradedPx');
        const percentage = this.safeString (ticker, 'Rolling24HrPxChangePercent');
        const change = this.safeString (ticker, 'Rolling24HrPxChange');
        const open = this.safeString (ticker, 'SessionOpen');
        const baseVolume = this.safeString (ticker, 'Rolling24HrVolume');
        const quoteVolume = this.safeString (ticker, 'Rolling24HrNotional');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'SessionHigh'),
            'low': this.safeString (ticker, 'SessionLow'),
            'bid': this.safeString (ticker, 'BestBid'),
            'bidVolume': undefined, // this.safeNumber (ticker, 'BidQty'), always shows 0
            'ask': this.safeString (ticker, 'BestOffer'),
            'askVolume': undefined, // this.safeNumber (ticker, 'AskQty'), always shows 0
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
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name ndax#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'omsId': omsId,
            'InstrumentId': market['id'],
        };
        const response = await this.publicGetGetLevel1 (this.extend (request, params));
        //
        //     {
        //         "OMSId":1,
        //         "InstrumentId":8,
        //         "BestBid":19069.31,
        //         "BestOffer":19069.32,
        //         "LastTradedPx":19069.32,
        //         "LastTradedQty":0.0001,
        //         "LastTradeTime":1607040406424,
        //         "SessionOpen":19069.32,
        //         "SessionHigh":19069.32,
        //         "SessionLow":19069.32,
        //         "SessionClose":19069.32,
        //         "Volume":0.0001,
        //         "CurrentDayVolume":0.0001,
        //         "CurrentDayNotional":1.906932,
        //         "CurrentDayNumTrades":1,
        //         "CurrentDayPxChange":0.00,
        //         "Rolling24HrVolume":0.000000000000000000000000000,
        //         "Rolling24HrNotional":0.00000000000000000000000,
        //         "Rolling24NumTrades":0,
        //         "Rolling24HrPxChange":0,
        //         "TimeStamp":"1607040406425",
        //         "BidQty":0,
        //         "AskQty":0,
        //         "BidOrderCt":0,
        //         "AskOrderCt":0,
        //         "Rolling24HrPxChangePercent":0,
        //     }
        //
        return this.parseTicker (response, market);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1501603632000, // 0 DateTime
        //         2700.33,       // 1 High
        //         2687.01,       // 2 Low
        //         2687.01,       // 3 Open
        //         2687.01,       // 4 Close
        //         24.86100992,   // 5 Volume
        //         0,             // 6 Inside Bid Price
        //         2870.95,       // 7 Inside Ask Price
        //         1              // 8 InstrumentId
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ndax#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'omsId': omsId,
            'InstrumentId': market['id'],
            'Interval': this.timeframes[timeframe],
        };
        const duration = this.parseTimeframe (timeframe);
        const now = this.milliseconds ();
        if (since === undefined) {
            if (limit !== undefined) {
                request['FromDate'] = this.ymdhms (now - duration * limit * 1000);
                request['ToDate'] = this.ymdhms (now);
            }
        } else {
            request['FromDate'] = this.ymdhms (since);
            if (limit === undefined) {
                request['ToDate'] = this.ymdhms (now);
            } else {
                request['ToDate'] = this.ymdhms (this.sum (since, duration * limit * 1000));
            }
        }
        const response = await this.publicGetGetTickerHistory (this.extend (request, params));
        //
        //     [
        //         [1607299260000,19069.32,19069.32,19069.32,19069.32,0,19069.31,19069.32,8,1607299200000],
        //         [1607299320000,19069.32,19069.32,19069.32,19069.32,0,19069.31,19069.32,8,1607299260000],
        //         [1607299380000,19069.32,19069.32,19069.32,19069.32,0,19069.31,19069.32,8,1607299320000],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     [
        //         6913253,       //  0 TradeId
        //         8,             //  1 ProductPairCode
        //         0.03340802,    //  2 Quantity
        //         19116.08,      //  3 Price
        //         2543425077,    //  4 Order1
        //         2543425482,    //  5 Order2
        //         1606935922416, //  6 Tradetime
        //         0,             //  7 Direction
        //         1,             //  8 TakerSide
        //         0,             //  9 BlockTrade
        //         0,             // 10 Either Order1ClientId or Order2ClientId
        //     ]
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "OMSId":1,
        //         "ExecutionId":16916567,
        //         "TradeId":14476351,
        //         "OrderId":2543565231,
        //         "AccountId":449,
        //         "AccountName":"igor@ccxt.trade",
        //         "SubAccountId":0,
        //         "ClientOrderId":0,
        //         "InstrumentId":8,
        //         "Side":"Sell",
        //         "OrderType":"Market",
        //         "Quantity":0.1230000000000000000000000000,
        //         "RemainingQuantity":0.0000000000000000000000000000,
        //         "Price":19069.310000000000000000000000,
        //         "Value":2345.5251300000000000000000000,
        //         "CounterParty":"7",
        //         "OrderTradeRevision":1,
        //         "Direction":"NoChange",
        //         "IsBlockTrade":false,
        //         "Fee":1.1727625650000000000000000000,
        //         "FeeProductId":8,
        //         "OrderOriginator":446,
        //         "UserName":"igor@ccxt.trade",
        //         "TradeTimeMS":1607565031569,
        //         "MakerTaker":"Taker",
        //         "AdapterTradeId":0,
        //         "InsideBid":19069.310000000000000000000000,
        //         "InsideBidSize":0.2400950000000000000000000000,
        //         "InsideAsk":19069.320000000000000000000000,
        //         "InsideAskSize":0.0997360000000000000000000000,
        //         "IsQuote":false,
        //         "CounterPartyClientUserId":1,
        //         "NotionalProductId":2,
        //         "NotionalRate":1.0000000000000000000000000000,
        //         "NotionalValue":2345.5251300000000000000000000,
        //         "NotionalHoldAmount":0,
        //         "TradeTime":637431618315686826
        //     }
        //
        // fetchOrderTrades
        //
        //     {
        //         "Side":"Sell",
        //         "OrderId":2543565235,
        //         "Price":18600.000000000000000000000000,
        //         "Quantity":0.0000000000000000000000000000,
        //         "DisplayQuantity":0.0000000000000000000000000000,
        //         "Instrument":8,
        //         "Account":449,
        //         "AccountName":"igor@ccxt.trade",
        //         "OrderType":"Limit",
        //         "ClientOrderId":0,
        //         "OrderState":"FullyExecuted",
        //         "ReceiveTime":1607585844956,
        //         "ReceiveTimeTicks":637431826449564182,
        //         "LastUpdatedTime":1607585844959,
        //         "LastUpdatedTimeTicks":637431826449593893,
        //         "OrigQuantity":0.1230000000000000000000000000,
        //         "QuantityExecuted":0.1230000000000000000000000000,
        //         "GrossValueExecuted":2345.3947500000000000000000000,
        //         "ExecutableValue":0.0000000000000000000000000000,
        //         "AvgPrice":19068.250000000000000000000000,
        //         "CounterPartyId":0,
        //         "ChangeReason":"Trade",
        //         "OrigOrderId":2543565235,
        //         "OrigClOrdId":0,
        //         "EnteredBy":446,
        //         "UserName":"igor@ccxt.trade",
        //         "IsQuote":false,
        //         "InsideAsk":19069.320000000000000000000000,
        //         "InsideAskSize":0.0997360000000000000000000000,
        //         "InsideBid":19068.250000000000000000000000,
        //         "InsideBidSize":1.3300010000000000000000000000,
        //         "LastTradePrice":19068.250000000000000000000000,
        //         "RejectReason":"",
        //         "IsLockedIn":false,
        //         "CancelReason":"",
        //         "OrderFlag":"0",
        //         "UseMargin":false,
        //         "StopPrice":0.0000000000000000000000000000,
        //         "PegPriceType":"Unknown",
        //         "PegOffset":0.0000000000000000000000000000,
        //         "PegLimitOffset":0.0000000000000000000000000000,
        //         "IpAddress":"x.x.x.x",
        //         "ClientOrderIdUuid":null,
        //         "OMSId":1
        //     }
        //
        let priceString = undefined;
        let amountString = undefined;
        let costString = undefined;
        let timestamp = undefined;
        let id = undefined;
        let marketId = undefined;
        let side = undefined;
        let orderId = undefined;
        let takerOrMaker = undefined;
        let fee = undefined;
        let type = undefined;
        if (Array.isArray (trade)) {
            priceString = this.safeString (trade, 3);
            amountString = this.safeString (trade, 2);
            timestamp = this.safeInteger (trade, 6);
            id = this.safeString (trade, 0);
            marketId = this.safeString (trade, 1);
            const takerSide = this.safeValue (trade, 8);
            side = takerSide ? 'sell' : 'buy';
            orderId = this.safeString (trade, 4);
        } else {
            timestamp = this.safeInteger2 (trade, 'TradeTimeMS', 'ReceiveTime');
            id = this.safeString (trade, 'TradeId');
            orderId = this.safeString2 (trade, 'OrderId', 'OrigOrderId');
            marketId = this.safeString2 (trade, 'InstrumentId', 'Instrument');
            priceString = this.safeString (trade, 'Price');
            amountString = this.safeString (trade, 'Quantity');
            costString = this.safeString2 (trade, 'Value', 'GrossValueExecuted');
            takerOrMaker = this.safeStringLower (trade, 'MakerTaker');
            side = this.safeStringLower (trade, 'Side');
            type = this.safeStringLower (trade, 'OrderType');
            const feeCostString = this.safeString (trade, 'Fee');
            if (feeCostString !== undefined) {
                const feeCurrencyId = this.safeString (trade, 'FeeProductId');
                const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
                fee = {
                    'cost': feeCostString,
                    'currency': feeCurrencyCode,
                };
            }
        }
        const symbol = this.safeSymbol (marketId, market);
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ndax#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'omsId': omsId,
            'InstrumentId': market['id'],
        };
        if (limit !== undefined) {
            request['Count'] = limit;
        }
        const response = await this.publicGetGetLastTrades (this.extend (request, params));
        //
        //     [
        //         [6913253,8,0.03340802,19116.08,2543425077,2543425482,1606935922416,0,1,0,0],
        //         [6913254,8,0.01391671,19117.42,2543427510,2543427811,1606935927998,1,1,0,0],
        //         [6913255,8,0.000006,19107.81,2543430495,2543430793,1606935933881,2,0,0,0],
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchAccounts (params = {}) {
        /**
         * @method
         * @name ndax#fetchAccounts
         * @description fetch all the accounts associated with a profile
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/en/latest/manual.html#account-structure} indexed by the account type
         */
        if (!this.login) {
            throw new AuthenticationError (this.id + ' fetchAccounts() requires exchange.login email credential');
        }
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        this.checkRequiredCredentials ();
        const request = {
            'omsId': omsId,
            'UserId': this.uid,
            'UserName': this.login,
        };
        const response = await this.privateGetGetUserAccounts (this.extend (request, params));
        //
        //     [ 449 ] // comma-separated list of account ids
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const accountId = this.safeString (response, i);
            result.push ({
                'id': accountId,
                'type': undefined,
                'currency': undefined,
                'info': accountId,
            });
        }
        return result;
    }

    parseBalance (response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'ProductId');
            if (currencyId in this.currencies_by_id) {
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['total'] = this.safeString (balance, 'Amount');
                account['used'] = this.safeString (balance, 'Hold');
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name ndax#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        params = this.omit (params, [ 'accountId', 'AccountId' ]);
        const request = {
            'omsId': omsId,
            'AccountId': accountId,
        };
        const response = await this.privateGetGetAccountPositions (this.extend (request, params));
        //
        //     [
        //         {
        //             "OMSId":1,
        //             "AccountId":449,
        //             "ProductSymbol":"BTC",
        //             "ProductId":1,
        //             "Amount":10.000000000000000000000000000,
        //             "Hold":0,
        //             "PendingDeposits":0.0000000000000000000000000000,
        //             "PendingWithdraws":0.0000000000000000000000000000,
        //             "TotalDayDeposits":10.000000000000000000000000000,
        //             "TotalMonthDeposits":10.000000000000000000000000000,
        //             "TotalYearDeposits":10.000000000000000000000000000,
        //             "TotalDayDepositNotional":10.000000000000000000000000000,
        //             "TotalMonthDepositNotional":10.000000000000000000000000000,
        //             "TotalYearDepositNotional":10.000000000000000000000000000,
        //             "TotalDayWithdraws":0,
        //             "TotalMonthWithdraws":0,
        //             "TotalYearWithdraws":0,
        //             "TotalDayWithdrawNotional":0,
        //             "TotalMonthWithdrawNotional":0,
        //             "TotalYearWithdrawNotional":0,
        //             "NotionalProductId":8,
        //             "NotionalProductSymbol":"USDT",
        //             "NotionalValue":10.000000000000000000000000000,
        //             "NotionalHoldAmount":0,
        //             "NotionalRate":1
        //         },
        //     ]
        //
        return this.parseBalance (response);
    }

    parseLedgerEntryType (type) {
        const types = {
            'Trade': 'trade',
            'Deposit': 'transaction',
            'Withdraw': 'transaction',
            'Transfer': 'transfer',
            'OrderHold': 'trade',
            'WithdrawHold': 'transaction',
            'DepositHold': 'transaction',
            'MarginHold': 'trade',
            'ManualHold': 'trade',
            'ManualEntry': 'trade',
            'MarginAcquisition': 'trade',
            'MarginRelinquish': 'trade',
            'MarginQuoteHold': 'trade',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         "TransactionId": 2663709493,
        //         "ReferenceId": 68,
        //         "OMSId": 1,
        //         "AccountId": 449,
        //         "CR": 10.000000000000000000000000000,
        //         "DR": 0.0000000000000000000000000000,
        //         "Counterparty": 3,
        //         "TransactionType": "Other",
        //         "ReferenceType": "Deposit",
        //         "ProductId": 1,
        //         "Balance": 10.000000000000000000000000000,
        //         "TimeStamp": 1607532331591
        //     }
        //
        const currencyId = this.safeString (item, 'ProductId');
        const credit = this.safeString (item, 'CR');
        const debit = this.safeString (item, 'DR');
        let amount = undefined;
        let direction = undefined;
        if (Precise.stringLt (credit, '0')) {
            amount = credit;
            direction = 'in';
        } else if (Precise.stringLt (debit, '0')) {
            amount = debit;
            direction = 'out';
        }
        let before = undefined;
        const after = this.safeString (item, 'Balance');
        if (direction === 'out') {
            before = Precise.stringAdd (after, amount);
        } else if (direction === 'in') {
            before = Precise.stringMax ('0', Precise.stringSub (after, amount));
        }
        const timestamp = this.safeInteger (item, 'TimeStamp');
        return {
            'info': item,
            'id': this.safeString (item, 'TransactionId'),
            'direction': direction,
            'account': this.safeString (item, 'AccountId'),
            'referenceId': this.safeString (item, 'ReferenceId'),
            'referenceAccount': this.safeString (item, 'Counterparty'),
            'type': this.parseLedgerEntryType (this.safeString (item, 'ReferenceType')),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.parseNumber (amount),
            'before': this.parseNumber (before),
            'after': this.parseNumber (after),
            'status': 'ok',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ndax#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        params = this.omit (params, [ 'accountId', 'AccountId' ]);
        const request = {
            'omsId': omsId,
            'AccountId': accountId,
        };
        if (limit !== undefined) {
            request['Depth'] = limit;
        }
        const response = await this.privateGetGetAccountTransactions (this.extend (request, params));
        //
        //     [
        //         {
        //             "TransactionId":2663709493,
        //             "ReferenceId":68,
        //             "OMSId":1,
        //             "AccountId":449,
        //             "CR":10.000000000000000000000000000,
        //             "DR":0.0000000000000000000000000000,
        //             "Counterparty":3,
        //             "TransactionType":"Other",
        //             "ReferenceType":"Deposit",
        //             "ProductId":1,
        //             "Balance":10.000000000000000000000000000,
        //             "TimeStamp":1607532331591
        //         },
        //     ]
        //
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseLedger (response, currency, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'Accepted': 'open',
            'Rejected': 'rejected',
            'Working': 'open',
            'Canceled': 'canceled',
            'Expired': 'expired',
            'FullyExecuted': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "status":"Accepted",
        //         "errormsg":"",
        //         "OrderId": 2543565231
        //     }
        //
        // editOrder
        //
        //     {
        //         "ReplacementOrderId": 1234,
        //         "ReplacementClOrdId": 1561,
        //         "OrigOrderId": 5678,
        //         "OrigClOrdId": 91011,
        //     }
        //
        // fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "Side":"Buy",
        //         "OrderId":2543565233,
        //         "Price":19010,
        //         "Quantity":0.345,
        //         "DisplayQuantity":0.345,
        //         "Instrument":8,
        //         "Account":449,
        //         "AccountName":"igor@ccxt.trade",
        //         "OrderType":"Limit",
        //         "ClientOrderId":0,
        //         "OrderState":"Working",
        //         "ReceiveTime":1607579326003,
        //         "ReceiveTimeTicks":637431761260028981,
        //         "LastUpdatedTime":1607579326005,
        //         "LastUpdatedTimeTicks":637431761260054714,
        //         "OrigQuantity":0.345,
        //         "QuantityExecuted":0,
        //         "GrossValueExecuted":0,
        //         "ExecutableValue":0,
        //         "AvgPrice":0,
        //         "CounterPartyId":0,
        //         "ChangeReason":"NewInputAccepted",
        //         "OrigOrderId":2543565233,
        //         "OrigClOrdId":0,
        //         "EnteredBy":446,
        //         "UserName":"igor@ccxt.trade",
        //         "IsQuote":false,
        //         "InsideAsk":19069.32,
        //         "InsideAskSize":0.099736,
        //         "InsideBid":19068.25,
        //         "InsideBidSize":1.330001,
        //         "LastTradePrice":19068.25,
        //         "RejectReason":"",
        //         "IsLockedIn":false,
        //         "CancelReason":"",
        //         "OrderFlag":"AddedToBook",
        //         "UseMargin":false,
        //         "StopPrice":0,
        //         "PegPriceType":"Unknown",
        //         "PegOffset":0,
        //         "PegLimitOffset":0,
        //         "IpAddress":null,
        //         "ClientOrderIdUuid":null,
        //         "OMSId":1
        //     }
        //
        const timestamp = this.safeInteger (order, 'ReceiveTime');
        const marketId = this.safeString (order, 'Instrument');
        return this.safeOrder ({
            'id': this.safeString2 (order, 'ReplacementOrderId', 'OrderId'),
            'clientOrderId': this.safeString2 (order, 'ReplacementClOrdId', 'ClientOrderId'),
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeInteger (order, 'LastUpdatedTime'),
            'status': this.parseOrderStatus (this.safeString (order, 'OrderState')),
            'symbol': this.safeSymbol (marketId, market),
            'type': this.safeStringLower (order, 'OrderType'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeStringLower (order, 'Side'),
            'price': this.safeString (order, 'Price'),
            'stopPrice': this.parseNumber (this.omitZero (this.safeString (order, 'StopPrice'))),
            'cost': this.safeString (order, 'GrossValueExecuted'),
            'amount': this.safeString (order, 'OrigQuantity'),
            'filled': this.safeString (order, 'QuantityExecuted'),
            'average': this.safeString (order, 'AvgPrice'),
            'remaining': undefined,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name ndax#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        const clientOrderId = this.safeInteger2 (params, 'ClientOrderId', 'clientOrderId');
        params = this.omit (params, [ 'accountId', 'AccountId', 'clientOrderId', 'ClientOrderId' ]);
        const market = this.market (symbol);
        const orderSide = (side === 'buy') ? 0 : 1;
        const request = {
            'InstrumentId': parseInt (market['id']),
            'omsId': omsId,
            'AccountId': accountId,
            'TimeInForce': 1, // 0 Unknown, 1 GTC by default, 2 OPG execute as close to opening price as possible, 3 IOC immediate or canceled,  4 FOK fill-or-kill, 5 GTX good 'til executed, 6 GTD good 'til date
            // 'ClientOrderId': clientOrderId, // defaults to 0
            // If this order is order A, OrderIdOCO refers to the order ID of an order B (which is not the order being created by this call).
            // If order B executes, then order A created by this call is canceled.
            // You can also set up order B to watch order A in the same way, but that may require an update to order B to make it watch this one, which could have implications for priority in the order book.
            // See CancelReplaceOrder and ModifyOrder.
            // 'OrderIdOCO': 0, // The order ID if One Cancels the Other.
            // 'UseDisplayQuantity': false, // If you enter a Limit order with a reserve, you must set UseDisplayQuantity to true
            'Side': orderSide, // 0 Buy, 1 Sell, 2 Short, 3 unknown an error condition
            'Quantity': parseFloat (this.amountToPrecision (symbol, amount)),
            'OrderType': this.safeInteger (this.options['orderTypes'], this.capitalize (type)), // 0 Unknown, 1 Market, 2 Limit, 3 StopMarket, 4 StopLimit, 5 TrailingStopMarket, 6 TrailingStopLimit, 7 BlockTrade
            // 'PegPriceType': 3, // 1 Last, 2 Bid, 3 Ask, 4 Midpoint
            // 'LimitPrice': parseFloat (this.priceToPrecision (symbol, price)),
        };
        // If OrderType=1 (Market), Side=0 (Buy), and LimitPrice is supplied, the Market order will execute up to the value specified
        if (price !== undefined) {
            request['LimitPrice'] = parseFloat (this.priceToPrecision (symbol, price));
        }
        if (clientOrderId !== undefined) {
            request['ClientOrderId'] = clientOrderId;
        }
        const response = await this.privatePostSendOrder (this.extend (request, params));
        //
        //     {
        //         "status":"Accepted",
        //         "errormsg":"",
        //         "OrderId": 2543565231
        //     }
        //
        return this.parseOrder (response, market);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        const clientOrderId = this.safeInteger2 (params, 'ClientOrderId', 'clientOrderId');
        params = this.omit (params, [ 'accountId', 'AccountId', 'clientOrderId', 'ClientOrderId' ]);
        const market = this.market (symbol);
        const orderSide = (side === 'buy') ? 0 : 1;
        const request = {
            'OrderIdToReplace': parseInt (id),
            'InstrumentId': parseInt (market['id']),
            'omsId': omsId,
            'AccountId': accountId,
            'TimeInForce': 1, // 0 Unknown, 1 GTC by default, 2 OPG execute as close to opening price as possible, 3 IOC immediate or canceled,  4 FOK fill-or-kill, 5 GTX good 'til executed, 6 GTD good 'til date
            // 'ClientOrderId': clientOrderId, // defaults to 0
            // If this order is order A, OrderIdOCO refers to the order ID of an order B (which is not the order being created by this call).
            // If order B executes, then order A created by this call is canceled.
            // You can also set up order B to watch order A in the same way, but that may require an update to order B to make it watch this one, which could have implications for priority in the order book.
            // See CancelReplaceOrder and ModifyOrder.
            // 'OrderIdOCO': 0, // The order ID if One Cancels the Other.
            // 'UseDisplayQuantity': false, // If you enter a Limit order with a reserve, you must set UseDisplayQuantity to true
            'Side': orderSide, // 0 Buy, 1 Sell, 2 Short, 3 unknown an error condition
            'Quantity': parseFloat (this.amountToPrecision (symbol, amount)),
            'OrderType': this.safeInteger (this.options['orderTypes'], this.capitalize (type)), // 0 Unknown, 1 Market, 2 Limit, 3 StopMarket, 4 StopLimit, 5 TrailingStopMarket, 6 TrailingStopLimit, 7 BlockTrade
            // 'PegPriceType': 3, // 1 Last, 2 Bid, 3 Ask, 4 Midpoint
            // 'LimitPrice': parseFloat (this.priceToPrecision (symbol, price)),
        };
        // If OrderType=1 (Market), Side=0 (Buy), and LimitPrice is supplied, the Market order will execute up to the value specified
        if (price !== undefined) {
            request['LimitPrice'] = parseFloat (this.priceToPrecision (symbol, price));
        }
        if (clientOrderId !== undefined) {
            request['ClientOrderId'] = clientOrderId;
        }
        const response = await this.privatePostCancelReplaceOrder (this.extend (request, params));
        //
        //     {
        //         "replacementOrderId": 1234,
        //         "replacementClOrdId": 1561,
        //         "origOrderId": 5678,
        //         "origClOrdId": 91011,
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ndax#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        params = this.omit (params, [ 'accountId', 'AccountId' ]);
        const request = {
            'omsId': omsId,
            'AccountId': accountId,
            // 'InstrumentId': market['id'],
            // 'TradeId': 123, // If you specify TradeId, GetTradesHistory can return all states for a single trade
            // 'OrderId': 456, // If specified, the call returns all trades associated with the order
            // 'UserId': integer. The ID of the logged-in user. If not specified, the call returns trades associated with the users belonging to the default account for the logged-in user of this OMS.
            // 'StartTimeStamp': long integer. The historical date and time at which to begin the trade report, in POSIX format. If not specified, reverts to the start date of this account on the trading venue.
            // 'EndTimeStamp': long integer. Date at which to end the trade report, in POSIX format.
            // 'Depth': integer. In this case, the count of trades to return, counting from the StartIndex. If Depth is not specified, returns all trades between BeginTimeStamp and EndTimeStamp, beginning at StartIndex.
            // 'StartIndex': 0 // from the most recent trade 0 and moving backwards in time
            // 'ExecutionId': 123, // The ID of the individual buy or sell execution. If not specified, returns all.
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['InstrumentId'] = market['id'];
        }
        if (since !== undefined) {
            request['StartTimeStamp'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['Depth'] = limit;
        }
        const response = await this.privateGetGetTradesHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "OMSId":1,
        //             "ExecutionId":16916567,
        //             "TradeId":14476351,
        //             "OrderId":2543565231,
        //             "AccountId":449,
        //             "AccountName":"igor@ccxt.trade",
        //             "SubAccountId":0,
        //             "ClientOrderId":0,
        //             "InstrumentId":8,
        //             "Side":"Sell",
        //             "OrderType":"Market",
        //             "Quantity":0.1230000000000000000000000000,
        //             "RemainingQuantity":0.0000000000000000000000000000,
        //             "Price":19069.310000000000000000000000,
        //             "Value":2345.5251300000000000000000000,
        //             "CounterParty":"7",
        //             "OrderTradeRevision":1,
        //             "Direction":"NoChange",
        //             "IsBlockTrade":false,
        //             "Fee":1.1727625650000000000000000000,
        //             "FeeProductId":8,
        //             "OrderOriginator":446,
        //             "UserName":"igor@ccxt.trade",
        //             "TradeTimeMS":1607565031569,
        //             "MakerTaker":"Taker",
        //             "AdapterTradeId":0,
        //             "InsideBid":19069.310000000000000000000000,
        //             "InsideBidSize":0.2400950000000000000000000000,
        //             "InsideAsk":19069.320000000000000000000000,
        //             "InsideAskSize":0.0997360000000000000000000000,
        //             "IsQuote":false,
        //             "CounterPartyClientUserId":1,
        //             "NotionalProductId":2,
        //             "NotionalRate":1.0000000000000000000000000000,
        //             "NotionalValue":2345.5251300000000000000000000,
        //             "NotionalHoldAmount":0,
        //             "TradeTime":637431618315686826
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name ndax#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        params = this.omit (params, [ 'accountId', 'AccountId' ]);
        const request = {
            'omsId': omsId,
            'AccountId': accountId,
        };
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['IntrumentId'] = market['id'];
        }
        const response = await this.privatePostCancelAllOrders (this.extend (request, params));
        //
        //     {
        //         "result":true,
        //         "errormsg":null,
        //         "errorcode":0,
        //         "detail":null
        //     }
        //
        return response;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ndax#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        // const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        // const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        // params = this.omit (params, [ 'accountId', 'AccountId' ]);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'omsId': omsId,
            // 'AccountId': accountId,
        };
        const clientOrderId = this.safeInteger2 (params, 'clientOrderId', 'ClOrderId');
        if (clientOrderId !== undefined) {
            request['ClOrderId'] = clientOrderId;
        } else {
            request['OrderId'] = parseInt (id);
        }
        params = this.omit (params, [ 'clientOrderId', 'ClOrderId' ]);
        const response = await this.privatePostCancelOrder (this.extend (request, params));
        const order = this.parseOrder (response, market);
        return this.extend (order, {
            'id': id,
            'clientOrderId': clientOrderId,
        });
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ndax#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        params = this.omit (params, [ 'accountId', 'AccountId' ]);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'omsId': omsId,
            'AccountId': accountId,
        };
        const response = await this.privateGetGetOpenOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "Side":"Buy",
        //             "OrderId":2543565233,
        //             "Price":19010,
        //             "Quantity":0.345,
        //             "DisplayQuantity":0.345,
        //             "Instrument":8,
        //             "Account":449,
        //             "AccountName":"igor@ccxt.trade",
        //             "OrderType":"Limit",
        //             "ClientOrderId":0,
        //             "OrderState":"Working",
        //             "ReceiveTime":1607579326003,
        //             "ReceiveTimeTicks":637431761260028981,
        //             "LastUpdatedTime":1607579326005,
        //             "LastUpdatedTimeTicks":637431761260054714,
        //             "OrigQuantity":0.345,
        //             "QuantityExecuted":0,
        //             "GrossValueExecuted":0,
        //             "ExecutableValue":0,
        //             "AvgPrice":0,
        //             "CounterPartyId":0,
        //             "ChangeReason":"NewInputAccepted",
        //             "OrigOrderId":2543565233,
        //             "OrigClOrdId":0,
        //             "EnteredBy":446,
        //             "UserName":"igor@ccxt.trade",
        //             "IsQuote":false,
        //             "InsideAsk":19069.32,
        //             "InsideAskSize":0.099736,
        //             "InsideBid":19068.25,
        //             "InsideBidSize":1.330001,
        //             "LastTradePrice":19068.25,
        //             "RejectReason":"",
        //             "IsLockedIn":false,
        //             "CancelReason":"",
        //             "OrderFlag":"AddedToBook",
        //             "UseMargin":false,
        //             "StopPrice":0,
        //             "PegPriceType":"Unknown",
        //             "PegOffset":0,
        //             "PegLimitOffset":0,
        //             "IpAddress":null,
        //             "ClientOrderIdUuid":null,
        //             "OMSId":1
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ndax#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        params = this.omit (params, [ 'accountId', 'AccountId' ]);
        const request = {
            'omsId': omsId,
            'AccountId': accountId,
            // 'ClientOrderId': clientOrderId,
            // 'OriginalOrderId': id,
            // 'OriginalClientOrderId': long integer,
            // 'UserId': integer,
            // 'InstrumentId': market['id'],
            // 'StartTimestamp': since,
            // 'EndTimestamp': this.milliseconds (),
            // 'Depth': limit,
            // 'StartIndex': 0,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['InstrumentId'] = market['id'];
        }
        if (since !== undefined) {
            request['StartTimeStamp'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['Depth'] = limit;
        }
        const response = await this.privateGetGetOrdersHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "Side":"Buy",
        //             "OrderId":2543565233,
        //             "Price":19010.000000000000000000000000,
        //             "Quantity":0.0000000000000000000000000000,
        //             "DisplayQuantity":0.3450000000000000000000000000,
        //             "Instrument":8,
        //             "Account":449,
        //             "AccountName":"igor@ccxt.trade",
        //             "OrderType":"Limit",
        //             "ClientOrderId":0,
        //             "OrderState":"Canceled",
        //             "ReceiveTime":1607579326003,
        //             "ReceiveTimeTicks":637431761260028981,
        //             "LastUpdatedTime":1607580965346,
        //             "LastUpdatedTimeTicks":637431777653463754,
        //             "OrigQuantity":0.3450000000000000000000000000,
        //             "QuantityExecuted":0.0000000000000000000000000000,
        //             "GrossValueExecuted":0.0000000000000000000000000000,
        //             "ExecutableValue":0.0000000000000000000000000000,
        //             "AvgPrice":0.0000000000000000000000000000,
        //             "CounterPartyId":0,
        //             "ChangeReason":"UserModified",
        //             "OrigOrderId":2543565233,
        //             "OrigClOrdId":0,
        //             "EnteredBy":446,
        //             "UserName":"igor@ccxt.trade",
        //             "IsQuote":false,
        //             "InsideAsk":19069.320000000000000000000000,
        //             "InsideAskSize":0.0997360000000000000000000000,
        //             "InsideBid":19068.250000000000000000000000,
        //             "InsideBidSize":1.3300010000000000000000000000,
        //             "LastTradePrice":19068.250000000000000000000000,
        //             "RejectReason":"",
        //             "IsLockedIn":false,
        //             "CancelReason":"UserModified",
        //             "OrderFlag":"AddedToBook, RemovedFromBook",
        //             "UseMargin":false,
        //             "StopPrice":0.0000000000000000000000000000,
        //             "PegPriceType":"Unknown",
        //             "PegOffset":0.0000000000000000000000000000,
        //             "PegLimitOffset":0.0000000000000000000000000000,
        //             "IpAddress":"x.x.x.x",
        //             "ClientOrderIdUuid":null,
        //             "OMSId":1
        //         },
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name ndax#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        params = this.omit (params, [ 'accountId', 'AccountId' ]);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'omsId': omsId,
            'AccountId': accountId,
            'OrderId': parseInt (id),
        };
        const response = await this.privateGetGetOrderStatus (this.extend (request, params));
        //
        //     {
        //         "Side":"Sell",
        //         "OrderId":2543565232,
        //         "Price":0.0000000000000000000000000000,
        //         "Quantity":0.0000000000000000000000000000,
        //         "DisplayQuantity":0.0000000000000000000000000000,
        //         "Instrument":8,
        //         "Account":449,
        //         "AccountName":"igor@ccxt.trade",
        //         "OrderType":"Market",
        //         "ClientOrderId":0,
        //         "OrderState":"FullyExecuted",
        //         "ReceiveTime":1607569475591,
        //         "ReceiveTimeTicks":637431662755912377,
        //         "LastUpdatedTime":1607569475596,
        //         "LastUpdatedTimeTicks":637431662755960902,
        //         "OrigQuantity":1.0000000000000000000000000000,
        //         "QuantityExecuted":1.0000000000000000000000000000,
        //         "GrossValueExecuted":19068.270478610000000000000000,
        //         "ExecutableValue":0.0000000000000000000000000000,
        //         "AvgPrice":19068.270478610000000000000000,
        //         "CounterPartyId":0,
        //         "ChangeReason":"Trade",
        //         "OrigOrderId":2543565232,
        //         "OrigClOrdId":0,
        //         "EnteredBy":446,
        //         "UserName":"igor@ccxt.trade",
        //         "IsQuote":false,
        //         "InsideAsk":19069.320000000000000000000000,
        //         "InsideAskSize":0.0997360000000000000000000000,
        //         "InsideBid":19069.310000000000000000000000,
        //         "InsideBidSize":0.2400950000000000000000000000,
        //         "LastTradePrice":19069.310000000000000000000000,
        //         "RejectReason":"",
        //         "IsLockedIn":false,
        //         "CancelReason":"",
        //         "OrderFlag":"0",
        //         "UseMargin":false,
        //         "StopPrice":0.0000000000000000000000000000,
        //         "PegPriceType":"Unknown",
        //         "PegOffset":0.0000000000000000000000000000,
        //         "PegLimitOffset":0.0000000000000000000000000000,
        //         "IpAddress":"x.x.x.x",
        //         "ClientOrderIdUuid":null,
        //         "OMSId":1
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ndax#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        // const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        // const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        // params = this.omit (params, [ 'accountId', 'AccountId' ]);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'OMSId': parseInt (omsId),
            // 'AccountId': accountId,
            'OrderId': parseInt (id),
        };
        const response = await this.privatePostGetOrderHistoryByOrderId (this.extend (request, params));
        //
        //     [
        //         {
        //             "Side":"Sell",
        //             "OrderId":2543565235,
        //             "Price":18600.000000000000000000000000,
        //             "Quantity":0.0000000000000000000000000000,
        //             "DisplayQuantity":0.0000000000000000000000000000,
        //             "Instrument":8,
        //             "Account":449,
        //             "AccountName":"igor@ccxt.trade",
        //             "OrderType":"Limit",
        //             "ClientOrderId":0,
        //             "OrderState":"FullyExecuted",
        //             "ReceiveTime":1607585844956,
        //             "ReceiveTimeTicks":637431826449564182,
        //             "LastUpdatedTime":1607585844959,
        //             "LastUpdatedTimeTicks":637431826449593893,
        //             "OrigQuantity":0.1230000000000000000000000000,
        //             "QuantityExecuted":0.1230000000000000000000000000,
        //             "GrossValueExecuted":2345.3947500000000000000000000,
        //             "ExecutableValue":0.0000000000000000000000000000,
        //             "AvgPrice":19068.250000000000000000000000,
        //             "CounterPartyId":0,
        //             "ChangeReason":"Trade",
        //             "OrigOrderId":2543565235,
        //             "OrigClOrdId":0,
        //             "EnteredBy":446,
        //             "UserName":"igor@ccxt.trade",
        //             "IsQuote":false,
        //             "InsideAsk":19069.320000000000000000000000,
        //             "InsideAskSize":0.0997360000000000000000000000,
        //             "InsideBid":19068.250000000000000000000000,
        //             "InsideBidSize":1.3300010000000000000000000000,
        //             "LastTradePrice":19068.250000000000000000000000,
        //             "RejectReason":"",
        //             "IsLockedIn":false,
        //             "CancelReason":"",
        //             "OrderFlag":"0",
        //             "UseMargin":false,
        //             "StopPrice":0.0000000000000000000000000000,
        //             "PegPriceType":"Unknown",
        //             "PegOffset":0.0000000000000000000000000000,
        //             "PegLimitOffset":0.0000000000000000000000000000,
        //             "IpAddress":"x.x.x.x",
        //             "ClientOrderIdUuid":null,
        //             "OMSId":1
        //         },
        //     ]
        //
        const grouped = this.groupBy (response, 'ChangeReason');
        const trades = this.safeValue (grouped, 'Trade', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name ndax#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        params = this.omit (params, [ 'accountId', 'AccountId' ]);
        const currency = this.currency (code);
        const request = {
            'omsId': omsId,
            'AccountId': accountId,
            'ProductId': currency['id'],
            'GenerateNewKey': false,
        };
        const response = await this.privateGetGetDepositInfo (this.extend (request, params));
        //
        //     {
        //         "result":true,
        //         "errormsg":null,
        //         "statuscode":0,
        //         "AssetManagerId":1,
        //         "AccountId":57922,
        //         "AssetId":16,
        //         "ProviderId":23,
        //         "DepositInfo":"[\"0x8A27564b5c30b91C93B1591821642420F323a210\"]"
        //     }
        //
        return this.parseDepositAddress (response, currency);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        // fetchDepositAddress, createDepositAddress
        //
        //     {
        //         "result":true,
        //         "errormsg":null,
        //         "statuscode":0,
        //         "AssetManagerId":1,
        //         "AccountId":449,
        //         "AssetId":1,
        //         "ProviderId":1,
        //         "DepositInfo":"[\"r3e95RwVsLH7yCbnMfyh7SA8FdwUJCB4S2?memo=241452010\"]"
        //     }
        //
        const depositInfoString = this.safeString (depositAddress, 'DepositInfo');
        const depositInfo = JSON.parse (depositInfoString);
        const depositInfoLength = depositInfo.length;
        const lastString = this.safeString (depositInfo, depositInfoLength - 1);
        const parts = lastString.split ('?memo=');
        const address = this.safeString (parts, 0);
        const tag = this.safeString (parts, 1);
        let code = undefined;
        if (currency !== undefined) {
            code = currency['code'];
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': depositAddress,
        };
    }

    async createDepositAddress (code, params = {}) {
        /**
         * @method
         * @name ndax#createDepositAddress
         * @description create a currency deposit address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        const request = {
            'GenerateNewKey': true,
        };
        return await this.fetchDepositAddress (code, this.extend (request, params));
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ndax#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        params = this.omit (params, [ 'accountId', 'AccountId' ]);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const request = {
            'omsId': omsId,
            'AccountId': accountId,
        };
        const response = await this.privateGetGetDeposits (this.extend (request, params));
        //
        //     [
        //         {
        //             "OMSId":1,
        //             "DepositId":44,
        //             "AccountId":449,
        //             "SubAccountId":0,
        //             "ProductId":4,
        //             "Amount":200.00000000000000000000000000,
        //             "LastUpdateTimeStamp":637431291261187806,
        //             "ProductType":"CryptoCurrency",
        //             "TicketStatus":"FullyProcessed",
        //             "DepositInfo":"{}",
        //             "DepositCode":"ab0e23d5-a9ce-4d94-865f-9ab464fb1de3",
        //             "TicketNumber":71,
        //             "NotionalProductId":13,
        //             "NotionalValue":200.00000000000000000000000000,
        //             "FeeAmount":0.0000000000000000000000000000,
        //         },
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ndax#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        params = this.omit (params, [ 'accountId', 'AccountId' ]);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const request = {
            'omsId': omsId,
            'AccountId': accountId,
        };
        const response = await this.privateGetGetWithdraws (this.extend (request, params));
        //
        //     [
        //         {
        //             "Amount": 0.0,
        //             "FeeAmount": 0.0,
        //             "NotionalValue": 0.0,
        //             "WithdrawId": 0,
        //             "AssetManagerId": 0,
        //             "AccountId": 0,
        //             "AssetId": 0,
        //             "TemplateForm": "{\"TemplateType\": \"TetherRPCWithdraw\",\"Comment\": \"TestWithdraw\",\"ExternalAddress\": \"ms6C3pKAAr8gRCcnVebs8VRkVrjcvqNYv3\"}",
        //             "TemplateFormType": "TetherRPCWithdraw",
        //             "omsId": 0,
        //             "TicketStatus": 0,
        //             "TicketNumber": 0,
        //             "WithdrawTransactionDetails": "",
        //             "WithdrawType": "",
        //             "WithdrawCode": "490b4fa3-53fc-44f4-bd29-7e16be86fba3",
        //             "AssetType": 0,
        //             "Reaccepted": true,
        //             "NotionalProductId": 0
        //         },
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransactionStatusByType (status, type = undefined) {
        const statusesByType = {
            'deposit': {
                'New': 'pending', // new ticket awaiting operator review
                'AdminProcessing': 'pending', // an admin is looking at the ticket
                'Accepted': 'pending', // an admin accepts the ticket
                'Rejected': 'rejected', // admin rejects the ticket
                'SystemProcessing': 'pending', // automatic processing; an unlikely status for a deposit
                'FullyProcessed': 'ok', // the deposit has concluded
                'Failed': 'failed', // the deposit has failed for some reason
                'Pending': 'pending', // Account Provider has set status to pending
                'Confirmed': 'pending', // Account Provider confirms the deposit
                'AmlProcessing': 'pending', // anti-money-laundering process underway
                'AmlAccepted': 'pending', // anti-money-laundering process successful
                'AmlRejected': 'rejected', // deposit did not stand up to anti-money-laundering process
                'AmlFailed': 'failed', // anti-money-laundering process failed/did not complete
                'LimitsAccepted': 'pending', // deposit meets limits for fiat or crypto asset
                'LimitsRejected': 'rejected', // deposit does not meet limits for fiat or crypto asset
            },
            'withdrawal': {
                'New': 'pending', // awaiting operator review
                'AdminProcessing': 'pending', // An admin is looking at the ticket
                'Accepted': 'pending', // withdrawal will proceed
                'Rejected': 'rejected', // admin or automatic rejection
                'SystemProcessing': 'pending', // automatic processing underway
                'FullyProcessed': 'ok', // the withdrawal has concluded
                'Failed': 'failed', // the withdrawal failed for some reason
                'Pending': 'pending', // the admin has placed the withdrawal in pending status
                'Pending2Fa': 'pending', // user must click 2-factor authentication confirmation link
                'AutoAccepted': 'pending', // withdrawal will be automatically processed
                'Delayed': 'pending', // waiting for funds to be allocated for the withdrawal
                'UserCanceled': 'canceled', // withdraw canceled by user or Superuser
                'AdminCanceled': 'canceled', // withdraw canceled by Superuser
                'AmlProcessing': 'pending', // anti-money-laundering process underway
                'AmlAccepted': 'pending', // anti-money-laundering process complete
                'AmlRejected': 'rejected', // withdrawal did not stand up to anti-money-laundering process
                'AmlFailed': 'failed', // withdrawal did not complete anti-money-laundering process
                'LimitsAccepted': 'pending', // withdrawal meets limits for fiat or crypto asset
                'LimitsRejected': 'rejected', // withdrawal does not meet limits for fiat or crypto asset
                'Submitted': 'pending', // withdrawal sent to Account Provider; awaiting blockchain confirmation
                'Confirmed': 'pending', // Account Provider confirms that withdrawal is on the blockchain
                'ManuallyConfirmed': 'pending', // admin has sent withdrawal via wallet or admin function directly; marks ticket as FullyProcessed; debits account
                'Confirmed2Fa': 'pending', // user has confirmed withdraw via 2-factor authentication.
            },
        };
        const statuses = this.safeValue (statusesByType, type, {});
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "OMSId":1,
        //         "DepositId":44,
        //         "AccountId":449,
        //         "SubAccountId":0,
        //         "ProductId":4,
        //         "Amount":200.00000000000000000000000000,
        //         "LastUpdateTimeStamp":637431291261187806,
        //         "ProductType":"CryptoCurrency",
        //         "TicketStatus":"FullyProcessed",
        //         "DepositInfo":"{}",
        //         "DepositCode":"ab0e23d5-a9ce-4d94-865f-9ab464fb1de3",
        //         "TicketNumber":71,
        //         "NotionalProductId":13,
        //         "NotionalValue":200.00000000000000000000000000,
        //         "FeeAmount":0.0000000000000000000000000000,
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "Amount": 0.0,
        //         "FeeAmount": 0.0,
        //         "NotionalValue": 0.0,
        //         "WithdrawId": 0,
        //         "AssetManagerId": 0,
        //         "AccountId": 0,
        //         "AssetId": 0,
        //         "TemplateForm": "{\"TemplateType\": \"TetherRPCWithdraw\",\"Comment\": \"TestWithdraw\",\"ExternalAddress\": \"ms6C3pKAAr8gRCcnVebs8VRkVrjcvqNYv3\"}",
        //         "TemplateFormType": "TetherRPCWithdraw",
        //         "omsId": 0,
        //         "TicketStatus": 0,
        //         "TicketNumber": 0,
        //         "WithdrawTransactionDetails": "",
        //         "WithdrawType": "",
        //         "WithdrawCode": "490b4fa3-53fc-44f4-bd29-7e16be86fba3",
        //         "AssetType": 0,
        //         "Reaccepted": true,
        //         "NotionalProductId": 0
        //     }
        //
        let id = undefined;
        let txid = undefined;
        const currencyId = this.safeString (transaction, 'ProductId');
        const code = this.safeCurrencyCode (currencyId, currency);
        let timestamp = undefined;
        let type = undefined;
        if ('DepositId' in transaction) {
            id = this.safeString (transaction, 'DepositId');
            type = 'deposit';
        } else if ('WithdrawId' in transaction) {
            id = this.safeString (transaction, 'WithdrawId');
            type = 'withdrawal';
        }
        const templateFormString = this.safeString (transaction, 'TemplateForm');
        let address = undefined;
        let updated = this.safeInteger (transaction, 'LastUpdateTimeStamp');
        if (templateFormString !== undefined) {
            const templateForm = JSON.parse (templateFormString);
            address = this.safeString (templateForm, 'ExternalAddress');
            txid = this.safeString (templateForm, 'TxId');
            timestamp = this.safeInteger (templateForm, 'TimeSubmitted');
            updated = this.safeInteger (templateForm, 'LastUpdated', updated);
        }
        const addressTo = address;
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'TicketStatus'), type);
        const amount = this.safeNumber (transaction, 'Amount');
        const feeCost = this.safeNumber (transaction, 'FeeAmount');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressTo': addressTo,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name ndax#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        // this method required login, password and twofa key
        const sessionToken = this.safeString (this.options, 'sessionToken');
        if (sessionToken === undefined) {
            throw new AuthenticationError (this.id + ' call signIn() method to obtain a session token');
        }
        if (this.twofa === undefined) {
            throw new AuthenticationError (this.id + ' withdraw() requires exchange.twofa credentials');
        }
        this.checkAddress (address);
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeInteger2 (this.options, 'accountId', 'AccountId', parseInt (this.accounts[0]['id']));
        const accountId = this.safeInteger2 (params, 'accountId', 'AccountId', defaultAccountId);
        params = this.omit (params, [ 'accountId', 'AccountId' ]);
        const currency = this.currency (code);
        const withdrawTemplateTypesRequest = {
            'omsId': omsId,
            'AccountId': accountId,
            'ProductId': currency['id'],
        };
        const withdrawTemplateTypesResponse = await this.privateGetGetWithdrawTemplateTypes (withdrawTemplateTypesRequest);
        //
        //     {
        //         result: true,
        //         errormsg: null,
        //         statuscode: "0",
        //         TemplateTypes: [
        //             { AccountProviderId: "14", TemplateName: "ToExternalBitcoinAddress", AccountProviderName: "BitgoRPC-BTC" },
        //             { AccountProviderId: "20", TemplateName: "ToExternalBitcoinAddress", AccountProviderName: "TrezorBTC" },
        //             { AccountProviderId: "31", TemplateName: "BTC", AccountProviderName: "BTC Fireblocks 1" }
        //         ]
        //     }
        //
        const templateTypes = this.safeValue (withdrawTemplateTypesResponse, 'TemplateTypes', []);
        const firstTemplateType = this.safeValue (templateTypes, 0);
        if (firstTemplateType === undefined) {
            throw new ExchangeError (this.id + ' withdraw() could not find a withdraw template type for ' + currency['code']);
        }
        const templateName = this.safeString (firstTemplateType, 'TemplateName');
        const withdrawTemplateRequest = {
            'omsId': omsId,
            'AccountId': accountId,
            'ProductId': currency['id'],
            'TemplateType': templateName,
            'AccountProviderId': firstTemplateType['AccountProviderId'],
        };
        const withdrawTemplateResponse = await this.privateGetGetWithdrawTemplate (withdrawTemplateRequest);
        //
        //     {
        //         result: true,
        //         errormsg: null,
        //         statuscode: "0",
        //         Template: "{\"TemplateType\":\"ToExternalBitcoinAddress\",\"Comment\":\"\",\"ExternalAddress\":\"\"}"
        //     }
        //
        const template = this.safeString (withdrawTemplateResponse, 'Template');
        if (template === undefined) {
            throw new ExchangeError (this.id + ' withdraw() could not find a withdraw template for ' + currency['code']);
        }
        const withdrawTemplate = JSON.parse (template);
        withdrawTemplate['ExternalAddress'] = address;
        if (tag !== undefined) {
            if ('Memo' in withdrawTemplate) {
                withdrawTemplate['Memo'] = tag;
            }
        }
        const withdrawPayload = {
            'omsId': omsId,
            'AccountId': accountId,
            'ProductId': currency['id'],
            'TemplateForm': this.json (withdrawTemplate),
            'TemplateType': templateName,
        };
        const withdrawRequest = {
            'TfaType': 'Google',
            'TFaCode': this.oath (),
            'Payload': this.json (withdrawPayload),
        };
        const response = await this.privatePostCreateWithdrawTicket (this.deepExtend (withdrawRequest, params));
        return this.parseTransaction (response, currency);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (path === 'Authenticate') {
                const auth = this.login + ':' + this.password;
                const auth64 = this.stringToBase64 (auth);
                headers = {
                    'Authorization': 'Basic ' + this.decode (auth64),
                    // 'Content-Type': 'application/json',
                };
            } else if (path === 'Authenticate2FA') {
                const pending2faToken = this.safeString (this.options, 'pending2faToken');
                if (pending2faToken !== undefined) {
                    headers = {
                        'Pending2FaToken': pending2faToken,
                        // 'Content-Type': 'application/json',
                    };
                    query = this.omit (query, 'pending2faToken');
                }
            }
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const sessionToken = this.safeString (this.options, 'sessionToken');
            if (sessionToken === undefined) {
                const nonce = this.nonce ().toString ();
                const auth = nonce + this.uid + this.apiKey;
                const signature = this.hmac (this.encode (auth), this.encode (this.secret));
                headers = {
                    'Nonce': nonce,
                    'APIKey': this.apiKey,
                    'Signature': signature,
                    'UserId': this.uid,
                };
            } else {
                headers = {
                    'APToken': sessionToken,
                };
            }
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = this.json (query);
            } else {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code === 404) {
            throw new AuthenticationError (this.id + ' ' + body);
        }
        if (response === undefined) {
            return;
        }
        //
        //     {"status":"Rejected","errormsg":"Not_Enough_Funds","errorcode":101}
        //     {"result":false,"errormsg":"Server Error","errorcode":102,"detail":null}
        //
        const message = this.safeString (response, 'errormsg');
        if ((message !== undefined) && (message !== '')) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
