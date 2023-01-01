'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadSymbol, AuthenticationError, InsufficientFunds, InvalidOrder, ArgumentsRequired, OrderNotFound, InvalidAddress, BadRequest, RateLimitExceeded, PermissionDenied, ExchangeNotAvailable, AccountSuspended, OnMaintenance } = require ('./base/errors');
const { SIGNIFICANT_DIGITS, DECIMAL_PLACES, TRUNCATE, ROUND } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ----------------------------------------------------------------------------

module.exports = class bitvavo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitvavo',
            'name': 'Bitvavo',
            'countries': [ 'NL' ], // Netherlands
            'rateLimit': 60, // 1000 requests per minute
            'version': 'v2',
            'certified': true,
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
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': true,
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
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
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
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/169202626-bd130fc5-fcf9-41bb-8d97-6093225c73cd.jpg',
                'api': {
                    'public': 'https://api.bitvavo.com',
                    'private': 'https://api.bitvavo.com',
                },
                'www': 'https://bitvavo.com/',
                'doc': 'https://docs.bitvavo.com/',
                'fees': 'https://bitvavo.com/en/fees',
                'referral': 'https://bitvavo.com/?a=24F34952F7',
            },
            'api': {
                'public': {
                    'get': {
                        'time': 1,
                        'markets': 1,
                        'assets': 1,
                        '{market}/book': 1,
                        '{market}/trades': 5,
                        '{market}/candles': 1,
                        'ticker/price': 1,
                        'ticker/book': 1,
                        'ticker/24h': { 'cost': 1, 'noMarket': 25 },
                    },
                },
                'private': {
                    'get': {
                        'account': 1,
                        'order': 1,
                        'orders': 5,
                        'ordersOpen': { 'cost': 1, 'noMarket': 25 },
                        'trades': 5,
                        'balance': 5,
                        'deposit': 1,
                        'depositHistory': 5,
                        'withdrawalHistory': 5,
                    },
                    'post': {
                        'order': 1,
                        'withdrawal': 1,
                    },
                    'put': {
                        'order': 1,
                    },
                    'delete': {
                        'order': 1,
                        'orders': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0025'),
                    'maker': this.parseNumber ('0.002'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0025') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0020') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0.0016') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0010') ],
                            [ this.parseNumber ('2500000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.0004') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0015') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0010') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('2500000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.0003') ],
                        ],
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                    '101': ExchangeError, // Unknown error. Operation may or may not have succeeded.
                    '102': BadRequest, // Invalid JSON.
                    '103': RateLimitExceeded, // You have been rate limited. Please observe the Bitvavo-Ratelimit-AllowAt header to see when you can send requests again. Failure to respect this limit will result in an IP ban. The default value is 1000 weighted requests per minute. Please contact support if you wish to increase this limit.
                    '104': RateLimitExceeded, // You have been rate limited by the number of new orders. The default value is 100 new orders per second or 100.000 new orders per day. Please update existing orders instead of cancelling and creating orders. Please contact support if you wish to increase this limit.
                    '105': PermissionDenied, // Your IP or API key has been banned for not respecting the rate limit. The ban expires at ${expiryInMs}.
                    '107': ExchangeNotAvailable, // The matching engine is overloaded. Please wait 500ms and resubmit your order.
                    '108': ExchangeNotAvailable, // The matching engine could not process your order in time. Please consider increasing the access window or resubmit your order.
                    '109': ExchangeNotAvailable, // The matching engine did not respond in time. Operation may or may not have succeeded.
                    '110': BadRequest, // Invalid endpoint. Please check url and HTTP method.
                    '200': BadRequest, // ${param} url parameter is not supported. Please note that parameters are case-sensitive and use body parameters for PUT and POST requests.
                    '201': BadRequest, // ${param} body parameter is not supported. Please note that parameters are case-sensitive and use url parameters for GET and DELETE requests.
                    '202': BadRequest, // ${param} order parameter is not supported. Please note that certain parameters are only allowed for market or limit orders.
                    '203': BadSymbol, // {"errorCode":203,"error":"symbol parameter is required."}
                    '204': BadRequest, // ${param} parameter is not supported.
                    '205': BadRequest, // ${param} parameter is invalid.
                    '206': BadRequest, // Use either ${paramA} or ${paramB}. The usage of both parameters at the same time is not supported.
                    '210': InvalidOrder, // Amount exceeds the maximum allowed amount (1000000000).
                    '211': InvalidOrder, // Price exceeds the maximum allowed amount (100000000000).
                    '212': InvalidOrder, // Amount is below the minimum allowed amount for this asset.
                    '213': InvalidOrder, // Price is below the minimum allowed amount (0.000000000000001).
                    '214': InvalidOrder, // Price is too detailed
                    '215': InvalidOrder, // Price is too detailed. A maximum of 15 digits behind the decimal point are allowed.
                    '216': InsufficientFunds, // {"errorCode":216,"error":"You do not have sufficient balance to complete this operation."}
                    '217': InvalidOrder, // {"errorCode":217,"error":"Minimum order size in quote currency is 5 EUR or 0.001 BTC."}
                    '230': ExchangeError, // The order is rejected by the matching engine.
                    '231': ExchangeError, // The order is rejected by the matching engine. TimeInForce must be GTC when markets are paused.
                    '232': BadRequest, // You must change at least one of amount, amountRemaining, price, timeInForce, selfTradePrevention or postOnly.
                    '233': InvalidOrder, // {"errorCode":233,"error":"Order must be active (status new or partiallyFilled) to allow updating/cancelling."}
                    '234': InvalidOrder, // Market orders cannot be updated.
                    '235': ExchangeError, // You can only have 100 open orders on each book.
                    '236': BadRequest, // You can only update amount or amountRemaining, not both.
                    '240': OrderNotFound, // {"errorCode":240,"error":"No order found. Please be aware that simultaneously updating the same order may return this error."}
                    '300': AuthenticationError, // Authentication is required for this endpoint.
                    '301': AuthenticationError, // {"errorCode":301,"error":"API Key must be of length 64."}
                    '302': AuthenticationError, // Timestamp is invalid. This must be a timestamp in ms. See Bitvavo-Access-Timestamp header or timestamp parameter for websocket.
                    '303': AuthenticationError, // Window must be between 100 and 60000 ms.
                    '304': AuthenticationError, // Request was not received within acceptable window (default 30s, or custom with Bitvavo-Access-Window header) of Bitvavo-Access-Timestamp header (or timestamp parameter for websocket).
                    // '304': AuthenticationError, // Authentication is required for this endpoint.
                    '305': AuthenticationError, // {"errorCode":305,"error":"No active API key found."}
                    '306': AuthenticationError, // No active API key found. Please ensure that you have confirmed the API key by e-mail.
                    '307': PermissionDenied, // This key does not allow access from this IP.
                    '308': AuthenticationError, // {"errorCode":308,"error":"The signature length is invalid (HMAC-SHA256 should return a 64 length hexadecimal string)."}
                    '309': AuthenticationError, // {"errorCode":309,"error":"The signature is invalid."}
                    '310': PermissionDenied, // This key does not allow trading actions.
                    '311': PermissionDenied, // This key does not allow showing account information.
                    '312': PermissionDenied, // This key does not allow withdrawal of funds.
                    '315': BadRequest, // Websocket connections may not be used in a browser. Please use REST requests for this.
                    '317': AccountSuspended, // This account is locked. Please contact support.
                    '400': ExchangeError, // Unknown error. Please contact support with a copy of your request.
                    '401': ExchangeError, // Deposits for this asset are not available at this time.
                    '402': PermissionDenied, // You need to verify your identitiy before you can deposit and withdraw digital assets.
                    '403': PermissionDenied, // You need to verify your phone number before you can deposit and withdraw digital assets.
                    '404': OnMaintenance, // Could not complete this operation, because our node cannot be reached. Possibly under maintenance.
                    '405': ExchangeError, // You cannot withdraw digital assets during a cooldown period. This is the result of newly added bank accounts.
                    '406': BadRequest, // {"errorCode":406,"error":"Your withdrawal is too small."}
                    '407': ExchangeError, // Internal transfer is not possible.
                    '408': InsufficientFunds, // {"errorCode":408,"error":"You do not have sufficient balance to complete this operation."}
                    '409': InvalidAddress, // {"errorCode":409,"error":"This is not a verified bank account."}
                    '410': ExchangeError, // Withdrawals for this asset are not available at this time.
                    '411': BadRequest, // You can not transfer assets to yourself.
                    '412': InvalidAddress, // {"errorCode":412,"error":"eth_address_invalid."}
                    '413': InvalidAddress, // This address violates the whitelist.
                    '414': ExchangeError, // You cannot withdraw assets within 2 minutes of logging in.
                },
                'broad': {
                    'start parameter is invalid': BadRequest, // {"errorCode":205,"error":"start parameter is invalid."}
                    'symbol parameter is invalid': BadSymbol, // {"errorCode":205,"error":"symbol parameter is invalid."}
                    'amount parameter is invalid': InvalidOrder, // {"errorCode":205,"error":"amount parameter is invalid."}
                    'orderId parameter is invalid': InvalidOrder, // {"errorCode":205,"error":"orderId parameter is invalid."}
                },
            },
            'options': {
                'BITVAVO-ACCESS-WINDOW': 10000, // default 10 sec
                'fetchCurrencies': {
                    'expires': 1000, // 1 second
                },
            },
            'precisionMode': SIGNIFICANT_DIGITS,
            'commonCurrencies': {
                'MIOTA': 'IOTA', // https://github.com/ccxt/ccxt/issues/7487
            },
        });
    }

    currencyToPrecision (code, fee, networkCode = undefined) {
        return this.decimalToPrecision (fee, 0, this.currencies[code]['precision'], DECIMAL_PLACES);
    }

    amountToPrecision (symbol, amount) {
        // https://docs.bitfinex.com/docs/introduction#amount-precision
        // The amount field allows up to 8 decimals.
        // Anything exceeding this will be rounded to the 8th decimal.
        return this.decimalToPrecision (amount, TRUNCATE, this.markets[symbol]['precision']['amount'], DECIMAL_PLACES);
    }

    priceToPrecision (symbol, price) {
        price = this.decimalToPrecision (price, ROUND, this.markets[symbol]['precision']['price'], this.precisionMode);
        // https://docs.bitfinex.com/docs/introduction#price-precision
        // The precision level of all trading prices is based on significant figures.
        // All pairs on Bitfinex use up to 5 significant digits and up to 8 decimals (e.g. 1.2345, 123.45, 1234.5, 0.00012345).
        // Prices submit with a precision larger than 5 will be cut by the API.
        return this.decimalToPrecision (price, TRUNCATE, 8, DECIMAL_PLACES);
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bitvavo#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetTime (params);
        //
        //     { "time": 1590379519148 }
        //
        return this.safeInteger (response, 'time');
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitvavo#fetchMarkets
         * @description retrieves data on all markets for bitvavo
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetMarkets (params);
        const currencies = await this.fetchCurrenciesFromCache (params);
        const currenciesById = this.indexBy (currencies, 'symbol');
        //
        //     [
        //         {
        //             "market":"ADA-BTC",
        //             "status":"trading", // "trading" "halted" "auction"
        //             "base":"ADA",
        //             "quote":"BTC",
        //             "pricePrecision":5,
        //             "minOrderInBaseAsset":"100",
        //             "minOrderInQuoteAsset":"0.001",
        //             "orderTypes": [ "market", "limit" ]
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'market');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const status = this.safeString (market, 'status');
            const baseCurrency = this.safeValue (currenciesById, baseId);
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
                'active': (status === 'trading'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger (baseCurrency, 'decimals', 8),
                    'price': this.safeInteger (market, 'pricePrecision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minOrderInBaseAsset'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minOrderInQuoteAsset'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrenciesFromCache (params = {}) {
        // this method is now redundant
        // currencies are now fetched before markets
        const options = this.safeValue (this.options, 'fetchCurrencies', {});
        const timestamp = this.safeInteger (options, 'timestamp');
        const expires = this.safeInteger (options, 'expires', 1000);
        const now = this.milliseconds ();
        if ((timestamp === undefined) || ((now - timestamp) > expires)) {
            const response = await this.publicGetAssets (params);
            this.options['fetchCurrencies'] = this.extend (options, {
                'response': response,
                'timestamp': now,
            });
        }
        return this.safeValue (this.options['fetchCurrencies'], 'response');
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bitvavo#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.fetchCurrenciesFromCache (params);
        //
        //     [
        //         {
        //             "symbol":"ADA",
        //             "name":"Cardano",
        //             "decimals":6,
        //             "depositFee":"0",
        //             "depositConfirmations":15,
        //             "depositStatus":"OK", // "OK", "MAINTENANCE", "DELISTED"
        //             "withdrawalFee":"0.2",
        //             "withdrawalMinAmount":"0.2",
        //             "withdrawalStatus":"OK", // "OK", "MAINTENANCE", "DELISTED"
        //             "networks": [ "Mainnet" ], // "ETH", "NEO", "ONT", "SEPA", "VET"
        //             "message":"",
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const code = this.safeCurrencyCode (id);
            const depositStatus = this.safeValue (currency, 'depositStatus');
            const deposit = (depositStatus === 'OK');
            const withdrawalStatus = this.safeValue (currency, 'withdrawalStatus');
            const withdrawal = (withdrawalStatus === 'OK');
            const active = deposit && withdrawal;
            const name = this.safeString (currency, 'name');
            result[code] = {
                'id': id,
                'info': currency,
                'code': code,
                'name': name,
                'active': active,
                'deposit': deposit,
                'withdraw': withdrawal,
                'fee': this.safeNumber (currency, 'withdrawalFee'),
                'precision': this.safeInteger (currency, 'decimals', 8),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'withdrawalMinAmount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bitvavo#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTicker24h (this.extend (request, params));
        //
        //     {
        //         "market":"ETH-BTC",
        //         "open":"0.022578",
        //         "high":"0.023019",
        //         "low":"0.022573",
        //         "last":"0.023019",
        //         "volume":"25.16366324",
        //         "volumeQuote":"0.57333305",
        //         "bid":"0.023039",
        //         "bidSize":"0.53500578",
        //         "ask":"0.023041",
        //         "askSize":"0.47859202",
        //         "timestamp":1590381666900
        //     }
        //
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "market":"ETH-BTC",
        //         "open":"0.022578",
        //         "high":"0.023019",
        //         "low":"0.022573",
        //         "last":"0.023019",
        //         "volume":"25.16366324",
        //         "volumeQuote":"0.57333305",
        //         "bid":"0.023039",
        //         "bidSize":"0.53500578",
        //         "ask":"0.023041",
        //         "askSize":"0.47859202",
        //         "timestamp":1590381666900
        //     }
        //
        const marketId = this.safeString (ticker, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const last = this.safeString (ticker, 'last');
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = this.safeString (ticker, 'volumeQuote');
        const open = this.safeString (ticker, 'open');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': this.safeString (ticker, 'bidSize'),
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': this.safeString (ticker, 'askSize'),
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetTicker24h (params);
        //
        //     [
        //         {
        //             "market":"ADA-BTC",
        //             "open":"0.0000059595",
        //             "high":"0.0000059765",
        //             "low":"0.0000059595",
        //             "last":"0.0000059765",
        //             "volume":"2923.172",
        //             "volumeQuote":"0.01743483",
        //             "bid":"0.0000059515",
        //             "bidSize":"1117.630919",
        //             "ask":"0.0000059585",
        //             "askSize":"809.999739",
        //             "timestamp":1590382266324
        //         }
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            // 'limit': 500, // default 500, max 1000
            // 'start': since,
            // 'end': this.milliseconds (),
            // 'tradeIdFrom': '57b1159b-6bf5-4cde-9e2c-6bd6a5678baf',
            // 'tradeIdTo': '57b1159b-6bf5-4cde-9e2c-6bd6a5678baf',
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.publicGetMarketTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":"94154c98-6e8b-4e33-92a8-74e33fc05650",
        //             "timestamp":1590382761859,
        //             "amount":"0.06026079",
        //             "price":"8095.3",
        //             "side":"buy"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id":"94154c98-6e8b-4e33-92a8-74e33fc05650",
        //         "timestamp":1590382761859,
        //         "amount":"0.06026079",
        //         "price":"8095.3",
        //         "side":"buy"
        //     }
        //
        // createOrder, fetchOpenOrders, fetchOrders, editOrder (private)
        //
        //     {
        //         "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //         "timestamp":1590505649245,
        //         "amount":"0.249825",
        //         "price":"183.49",
        //         "taker":true,
        //         "fee":"0.12038925",
        //         "feeCurrency":"EUR",
        //         "settled":true
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //         "orderId":"af76d6ce-9f7c-4006-b715-bb5d430652d0",
        //         "timestamp":1590505649245,
        //         "market":"ETH-EUR",
        //         "side":"sell",
        //         "amount":"0.249825",
        //         "price":"183.49",
        //         "taker":true,
        //         "fee":"0.12038925",
        //         "feeCurrency":"EUR",
        //         "settled":true
        //     }
        //
        // watchMyTrades (private)
        //
        //     {
        //         event: 'fill',
        //         timestamp: 1590964470132,
        //         market: 'ETH-EUR',
        //         orderId: '85d082e1-eda4-4209-9580-248281a29a9a',
        //         fillId: '861d2da5-aa93-475c-8d9a-dce431bd4211',
        //         side: 'sell',
        //         amount: '0.1',
        //         price: '211.46',
        //         taker: true,
        //         fee: '0.056',
        //         feeCurrency: 'EUR'
        //     }
        //
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeString (trade, 'side');
        const id = this.safeString2 (trade, 'id', 'fillId');
        const marketId = this.safeString (trade, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        const taker = this.safeValue (trade, 'taker');
        let takerOrMaker = undefined;
        if (taker !== undefined) {
            takerOrMaker = taker ? 'taker' : 'maker';
        }
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        const orderId = this.safeString (trade, 'orderId');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name bitvavo#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.privateGetAccount (params);
        //
        //     {
        //         "fees": {
        //           "taker": "0.0025",
        //           "maker": "0.0015",
        //           "volume": "10000.00"
        //         }
        //     }
        //
        const fees = this.safeValue (response, 'fees');
        const maker = this.safeNumber (fees, 'maker');
        const taker = this.safeNumber (fees, 'taker');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': maker,
                'taker': taker,
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetMarketBook (this.extend (request, params));
        //
        //     {
        //         "market":"BTC-EUR",
        //         "nonce":35883831,
        //         "bids":[
        //             ["8097.4","0.6229099"],
        //             ["8097.2","0.64151283"],
        //             ["8097.1","0.24966294"],
        //         ],
        //         "asks":[
        //             ["8097.5","1.36916911"],
        //             ["8098.8","0.33462248"],
        //             ["8099.3","1.12908646"],
        //         ]
        //     }
        //
        const orderbook = this.parseOrderBook (response, market['symbol']);
        orderbook['nonce'] = this.safeInteger (response, 'nonce');
        return orderbook;
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1590383700000,
        //         "8088.5",
        //         "8088.5",
        //         "8088.5",
        //         "8088.5",
        //         "0.04788623"
        //     ]
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
         * @name bitvavo#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'interval': this.timeframes[timeframe],
            // 'limit': 1440, // default 1440, max 1440
            // 'start': since,
            // 'end': this.milliseconds (),
        };
        if (since !== undefined) {
            // https://github.com/ccxt/ccxt/issues/9227
            const duration = this.parseTimeframe (timeframe);
            request['start'] = since;
            if (limit === undefined) {
                limit = 1440;
            }
            request['end'] = this.sum (since, limit * duration * 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 1440, max 1440
        }
        const response = await this.publicGetMarketCandles (this.extend (request, params));
        //
        //     [
        //         [1590383700000,"8088.5","8088.5","8088.5","8088.5","0.04788623"],
        //         [1590383580000,"8091.3","8091.5","8091.3","8091.5","0.04931221"],
        //         [1590383520000,"8090.3","8092.7","8090.3","8092.5","0.04001286"],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseBalance (response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'inOrder');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bitvavo#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        //
        //     [
        //         {
        //             "symbol": "BTC",
        //             "available": "1.57593193",
        //             "inOrder": "0.74832374"
        //         }
        //     ]
        //
        return this.parseBalance (response);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name bitvavo#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
        };
        const response = await this.privateGetDeposit (this.extend (request, params));
        //
        //     {
        //         "address": "0x449889e3234514c45d57f7c5a571feba0c7ad567",
        //         "paymentId": "10002653"
        //     }
        //
        const address = this.safeString (response, 'address');
        const tag = this.safeString (response, 'paymentId');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#createOrder
         * @description create a trade order
         * @see https://docs.bitvavo.com/#tag/Orders/paths/~1order/post
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @param {string|undefined} params.timeInForce "GTC", "IOC", or "PO"
         * @param {float|undefined} params.stopPrice The price at which a trigger order is triggered at
         * @param {float|undefined} params.triggerPrice The price at which a trigger order is triggered at
         * @param {bool|undefined} params.postOnly If true, the order will only be posted to the order book and not executed immediately
         * @param {float|undefined} params.stopLossPrice The price at which a stop loss order is triggered at
         * @param {float|undefined} params.takeProfitPrice The price at which a take profit order is triggered at
         * @param {string|undefined} params.triggerType "price"
         * @param {string|undefined} params.triggerReference "lastTrade", "bestBid", "bestAsk", "midPrice" Only for stop orders: Use this to determine which parameter will trigger the order
         * @param {string|undefined} params.selfTradePrevention "decrementAndCancel", "cancelOldest", "cancelNewest", "cancelBoth"
         * @param {bool|undefined} params.disableMarketProtection don't cancel if the next fill price is 10% worse than the best fill price
         * @param {bool|undefined} params.responseRequired Set this to 'false' when only an acknowledgement of success or failure is required, this is faster.
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'orderType': type,
        };
        const isMarketOrder = (type === 'market') || (type === 'stopLoss') || (type === 'takeProfit');
        const isLimitOrder = (type === 'limit') || (type === 'stopLossLimit') || (type === 'takeProfitLimit');
        const timeInForce = this.safeString (params, 'timeInForce');
        let triggerPrice = this.safeStringN (params, [ 'triggerPrice', 'stopPrice', 'triggerAmount' ]);
        const postOnly = this.isPostOnly (isMarketOrder, false, params);
        const stopLossPrice = this.safeValue (params, 'stopLossPrice'); // trigger when price crosses from above to below this value
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice'); // trigger when price crosses from below to above this value
        params = this.omit (params, [ 'timeInForce', 'triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice' ]);
        if (isMarketOrder) {
            let cost = undefined;
            if (price !== undefined) {
                const priceString = this.numberToString (price);
                const amountString = this.numberToString (amount);
                const quoteAmount = Precise.stringMul (amountString, priceString);
                cost = this.parseNumber (quoteAmount);
            } else {
                cost = this.safeNumber (params, 'cost');
            }
            if (cost !== undefined) {
                const precision = this.currency (market['quote'])['precision'];
                request['amountQuote'] = this.decimalToPrecision (cost, TRUNCATE, precision, this.precisionMode);
            } else {
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
            params = this.omit (params, [ 'cost' ]);
        } else if (isLimitOrder) {
            request['price'] = this.priceToPrecision (symbol, price);
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        const isTakeProfit = (takeProfitPrice !== undefined) || (type === 'takeProfit') || (type === 'takeProfitLimit');
        const isStopLoss = (stopLossPrice !== undefined) || (triggerPrice !== undefined) && (!isTakeProfit) || (type === 'stopLoss') || (type === 'stopLossLimit');
        if (isStopLoss) {
            if (stopLossPrice !== undefined) {
                triggerPrice = stopLossPrice;
            }
            request['orderType'] = isMarketOrder ? 'stopLoss' : 'stopLossLimit';
        } else if (isTakeProfit) {
            if (takeProfitPrice !== undefined) {
                triggerPrice = takeProfitPrice;
            }
            request['orderType'] = isMarketOrder ? 'takeProfit' : 'takeProfitLimit';
        }
        if (triggerPrice !== undefined) {
            request['triggerAmount'] = this.priceToPrecision (symbol, triggerPrice);
            request['triggerType'] = 'price';
            request['triggerReference'] = 'lastTrade'; // 'bestBid', 'bestAsk', 'midPrice'
        }
        if ((timeInForce !== undefined) && (timeInForce !== 'PO')) {
            request['timeInForce'] = timeInForce;
        }
        if (postOnly) {
            request['postOnly'] = true;
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        //
        //      {
        //          "orderId":"dec6a640-5b4c-45bc-8d22-3b41c6716630",
        //          "market":"DOGE-EUR",
        //          "created":1654789135146,
        //          "updated":1654789135153,
        //          "status":"new",
        //          "side":"buy",
        //          "orderType":"stopLossLimit",
        //          "amount":"200",
        //          "amountRemaining":"200",
        //          "price":"0.07471",
        //          "triggerPrice":"0.0747",
        //          "triggerAmount":"0.0747",
        //          "triggerType":"price",
        //          "triggerReference":"lastTrade",
        //          "onHold":"14.98",
        //          "onHoldCurrency":"EUR",
        //          "filledAmount":"0",
        //          "filledAmountQuote":"0",
        //          "feePaid":"0",
        //          "feeCurrency":"EUR",
        //          "fills":[ // filled with market orders only
        //             {
        //                 "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //                 "timestamp":1590505649245,
        //                 "amount":"0.249825",
        //                 "price":"183.49",
        //                 "taker":true,
        //                 "fee":"0.12038925",
        //                 "feeCurrency":"EUR",
        //                 "settled":true
        //             }
        //          ],
        //          "selfTradePrevention":"decrementAndCancel",
        //          "visible":true,
        //          "timeInForce":"GTC",
        //          "postOnly":false
        //      }
        //
        return this.parseOrder (response, market);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {};
        const amountRemaining = this.safeNumber (params, 'amountRemaining');
        params = this.omit (params, 'amountRemaining');
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (amount !== undefined) {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        if (amountRemaining !== undefined) {
            request['amountRemaining'] = this.amountToPrecision (symbol, amountRemaining);
        }
        request = this.extend (request, params);
        if (Object.keys (request).length) {
            request['orderId'] = id;
            request['market'] = market['id'];
            const response = await this.privatePutOrder (this.extend (request, params));
            return this.parseOrder (response, market);
        } else {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an amount argument, or a price argument, or non-empty params');
        }
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
            'market': market['id'],
        };
        const response = await this.privateDeleteOrder (this.extend (request, params));
        //
        //     {
        //         "orderId": "2e7ce7fc-44e2-4d80-a4a7-d079c4750b61"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateDeleteOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "orderId": "1be6d0df-d5dc-4b53-a250-3376f3b393e6"
        //         }
        //     ]
        //
        return this.parseOrders (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
            'market': market['id'],
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        //
        //     {
        //         "orderId":"af76d6ce-9f7c-4006-b715-bb5d430652d0",
        //         "market":"ETH-EUR",
        //         "created":1590505649241,
        //         "updated":1590505649241,
        //         "status":"filled",
        //         "side":"sell",
        //         "orderType":"market",
        //         "amount":"0.249825",
        //         "amountRemaining":"0",
        //         "onHold":"0",
        //         "onHoldCurrency":"ETH",
        //         "filledAmount":"0.249825",
        //         "filledAmountQuote":"45.84038925",
        //         "feePaid":"0.12038925",
        //         "feeCurrency":"EUR",
        //         "fills":[
        //             {
        //                 "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //                 "timestamp":1590505649245,
        //                 "amount":"0.249825",
        //                 "price":"183.49",
        //                 "taker":true,
        //                 "fee":"0.12038925",
        //                 "feeCurrency":"EUR",
        //                 "settled":true
        //             }
        //         ],
        //         "selfTradePrevention":"decrementAndCancel",
        //         "visible":false,
        //         "disableMarketProtection":false
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            // 'limit': 500,
            // 'start': since,
            // 'end': this.milliseconds (),
            // 'orderIdFrom': 'af76d6ce-9f7c-4006-b715-bb5d430652d0',
            // 'orderIdTo': 'af76d6ce-9f7c-4006-b715-bb5d430652d0',
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "orderId":"af76d6ce-9f7c-4006-b715-bb5d430652d0",
        //             "market":"ETH-EUR",
        //             "created":1590505649241,
        //             "updated":1590505649241,
        //             "status":"filled",
        //             "side":"sell",
        //             "orderType":"market",
        //             "amount":"0.249825",
        //             "amountRemaining":"0",
        //             "onHold":"0",
        //             "onHoldCurrency":"ETH",
        //             "filledAmount":"0.249825",
        //             "filledAmountQuote":"45.84038925",
        //             "feePaid":"0.12038925",
        //             "feeCurrency":"EUR",
        //             "fills":[
        //                 {
        //                     "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //                     "timestamp":1590505649245,
        //                     "amount":"0.249825",
        //                     "price":"183.49",
        //                     "taker":true,
        //                     "fee":"0.12038925",
        //                     "feeCurrency":"EUR",
        //                     "settled":true
        //                 }
        //             ],
        //             "selfTradePrevention":"decrementAndCancel",
        //             "visible":false,
        //             "disableMarketProtection":false
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'market': market['id'], // rate limit 25 without a market, 1 with market specified
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateGetOrdersOpen (this.extend (request, params));
        //
        //     [
        //         {
        //             "orderId":"af76d6ce-9f7c-4006-b715-bb5d430652d0",
        //             "market":"ETH-EUR",
        //             "created":1590505649241,
        //             "updated":1590505649241,
        //             "status":"filled",
        //             "side":"sell",
        //             "orderType":"market",
        //             "amount":"0.249825",
        //             "amountRemaining":"0",
        //             "onHold":"0",
        //             "onHoldCurrency":"ETH",
        //             "filledAmount":"0.249825",
        //             "filledAmountQuote":"45.84038925",
        //             "feePaid":"0.12038925",
        //             "feeCurrency":"EUR",
        //             "fills":[
        //                 {
        //                     "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //                     "timestamp":1590505649245,
        //                     "amount":"0.249825",
        //                     "price":"183.49",
        //                     "taker":true,
        //                     "fee":"0.12038925",
        //                     "feeCurrency":"EUR",
        //                     "settled":true
        //                 }
        //             ],
        //             "selfTradePrevention":"decrementAndCancel",
        //             "visible":false,
        //             "disableMarketProtection":false
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'new': 'open',
            'canceled': 'canceled',
            'canceledAuction': 'canceled',
            'canceledSelfTradePrevention': 'canceled',
            'canceledIOC': 'canceled',
            'canceledFOK': 'canceled',
            'canceledMarketProtection': 'canceled',
            'canceledPostOnly': 'canceled',
            'filled': 'closed',
            'partiallyFilled': 'open',
            'expired': 'canceled',
            'rejected': 'canceled',
            'awaitingTrigger': 'open', // https://github.com/ccxt/ccxt/issues/8489
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // cancelOrder, cancelAllOrders
        //
        //     {
        //         "orderId": "2e7ce7fc-44e2-4d80-a4a7-d079c4750b61"
        //     }
        //
        // createOrder, fetchOrder, fetchOpenOrders, fetchOrders, editOrder
        //
        //     {
        //         "orderId":"af76d6ce-9f7c-4006-b715-bb5d430652d0",
        //         "market":"ETH-EUR",
        //         "created":1590505649241,
        //         "updated":1590505649241,
        //         "status":"filled",
        //         "side":"sell",
        //         "orderType":"market",
        //         "amount":"0.249825",
        //         "amountRemaining":"0",
        //         "price": "183.49", // limit orders only
        //         "onHold":"0",
        //         "onHoldCurrency":"ETH",
        //         "filledAmount":"0.249825",
        //         "filledAmountQuote":"45.84038925",
        //         "feePaid":"0.12038925",
        //         "feeCurrency":"EUR",
        //         "fills":[
        //             {
        //                 "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //                 "timestamp":1590505649245,
        //                 "amount":"0.249825",
        //                 "price":"183.49",
        //                 "taker":true,
        //                 "fee":"0.12038925",
        //                 "feeCurrency":"EUR",
        //                 "settled":true
        //             }
        //         ],
        //         "selfTradePrevention":"decrementAndCancel",
        //         "visible":false,
        //         "disableMarketProtection":false
        //         "timeInForce": "GTC",
        //         "postOnly": true,
        //     }
        //
        const id = this.safeString (order, 'orderId');
        const timestamp = this.safeInteger (order, 'created');
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.safeString (order, 'side');
        const type = this.safeString (order, 'orderType');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'amount');
        const remaining = this.safeString (order, 'amountRemaining');
        const filled = this.safeString (order, 'filledAmount');
        const cost = this.safeString (order, 'filledAmountQuote');
        let fee = undefined;
        const feeCost = this.safeNumber (order, 'feePaid');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (order, 'feeCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const rawTrades = this.safeValue (order, 'fills', []);
        const timeInForce = this.safeString (order, 'timeInForce');
        const postOnly = this.safeValue (order, 'postOnly');
        // https://github.com/ccxt/ccxt/issues/8489
        const stopPrice = this.safeNumber (order, 'triggerPrice');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': rawTrades,
        }, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            // 'limit': 500,
            // 'start': since,
            // 'end': this.milliseconds (),
            // 'tradeIdFrom': 'af76d6ce-9f7c-4006-b715-bb5d430652d0',
            // 'tradeIdTo': 'af76d6ce-9f7c-4006-b715-bb5d430652d0',
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this.privateGetTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //             "orderId":"af76d6ce-9f7c-4006-b715-bb5d430652d0",
        //             "timestamp":1590505649245,
        //             "market":"ETH-EUR",
        //             "side":"sell",
        //             "amount":"0.249825",
        //             "price":"183.49",
        //             "taker":true,
        //             "fee":"0.12038925",
        //             "feeCurrency":"EUR",
        //             "settled":true
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'address': address, // address or IBAN
            // 'internal': false, // transfer to another Bitvavo user address, no fees
            // 'addWithdrawalFee': false, // true = add the fee on top, otherwise the fee is subtracted from the amount
        };
        if (tag !== undefined) {
            request['paymentId'] = tag;
        }
        const response = await this.privatePostWithdrawal (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "symbol": "BTC",
        //         "amount": "1.5"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'symbol': currency['id'],
            // 'limit': 500, // default 500, max 1000
            // 'start': since,
            // 'end': this.milliseconds (),
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['symbol'] = currency['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this.privateGetWithdrawalHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "timestamp":1590531212000,
        //             "symbol":"ETH",
        //             "amount":"0.091",
        //             "fee":"0.009",
        //             "status":"awaiting_bitvavo_inspection",
        //             "address":"0xe42b309f1eE9F0cbf7f54CcF3bc2159eBfA6735b",
        //             "paymentId": "10002653",
        //             "txId": "927b3ea50c5bb52c6854152d305dfa1e27fc01d10464cf10825d96d69d235eb3",
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit, { 'type': 'withdrawal' });
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'symbol': currency['id'],
            // 'limit': 500, // default 500, max 1000
            // 'start': since,
            // 'end': this.milliseconds (),
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['symbol'] = currency['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this.privateGetDepositHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "timestamp":1590492401000,
        //             "symbol":"ETH",
        //             "amount":"0.249825",
        //             "fee":"0",
        //             "status":"completed",
        //             "txId":"0x5167b473fd37811f9ef22364c3d54726a859ef9d98934b3a1e11d7baa8d2c2e2"
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit, { 'type': 'deposit' });
    }

    parseTransactionStatus (status) {
        const statuses = {
            'awaiting_processing': 'pending',
            'awaiting_email_confirmation': 'pending',
            'awaiting_bitvavo_inspection': 'pending',
            'approved': 'pending',
            'sending': 'pending',
            'in_mempool': 'pending',
            'processed': 'pending',
            'completed': 'ok',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "success": true,
        //         "symbol": "BTC",
        //         "amount": "1.5"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "timestamp": 1542967486256,
        //         "symbol": "BTC",
        //         "amount": "0.99994",
        //         "address": "BitcoinAddress",
        //         "paymentId": "10002653",
        //         "txId": "927b3ea50c5bb52c6854152d305dfa1e27fc01d10464cf10825d96d69d235eb3",
        //         "fee": "0.00006",
        //         "status": "awaiting_processing"
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "timestamp":1590492401000,
        //         "symbol":"ETH",
        //         "amount":"0.249825",
        //         "fee":"0",
        //         "status":"completed",
        //         "txId":"0x5167b473fd37811f9ef22364c3d54726a859ef9d98934b3a1e11d7baa8d2c2e2"
        //     }
        //
        const id = undefined;
        const timestamp = this.safeInteger (transaction, 'timestamp');
        const currencyId = this.safeString (transaction, 'symbol');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const amount = this.safeNumber (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const txid = this.safeString (transaction, 'txId');
        let fee = undefined;
        const feeCost = this.safeNumber (transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        let type = undefined;
        if (('success' in transaction) || ('address' in transaction)) {
            type = 'withdrawal';
        } else {
            type = 'deposit';
        }
        const tag = this.safeString (transaction, 'paymentId');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': undefined,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = '/' + this.version + '/' + this.implodeParams (path, params);
        const getOrDelete = (method === 'GET') || (method === 'DELETE');
        if (getOrDelete) {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let payload = '';
            if (!getOrDelete) {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    payload = body;
                }
            }
            const timestamp = this.milliseconds ().toString ();
            const auth = timestamp + method + url + payload;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            const accessWindow = this.safeString (this.options, 'BITVAVO-ACCESS-WINDOW', '10000');
            headers = {
                'BITVAVO-ACCESS-KEY': this.apiKey,
                'BITVAVO-ACCESS-SIGNATURE': signature,
                'BITVAVO-ACCESS-TIMESTAMP': timestamp,
                'BITVAVO-ACCESS-WINDOW': accessWindow,
            };
            if (!getOrDelete) {
                headers['Content-Type'] = 'application/json';
            }
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"errorCode":308,"error":"The signature length is invalid (HMAC-SHA256 should return a 64 length hexadecimal string)."}
        //     {"errorCode":203,"error":"symbol parameter is required."}
        //     {"errorCode":205,"error":"symbol parameter is invalid."}
        //
        const errorCode = this.safeString (response, 'errorCode');
        const error = this.safeString (response, 'error');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }

    calculateRateLimiterCost (api, method, path, params, config = {}, context = {}) {
        if (('noMarket' in config) && !('market' in params)) {
            return config['noMarket'];
        }
        return this.safeValue (config, 'cost', 1);
    }
};
