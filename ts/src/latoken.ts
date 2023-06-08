
//  ---------------------------------------------------------------------------

import Exchange from './abstract/latoken.js';
import { ExchangeError, AuthenticationError, ArgumentsRequired, InvalidNonce, BadRequest, ExchangeNotAvailable, PermissionDenied, AccountSuspended, RateLimitExceeded, InsufficientFunds, BadSymbol, InvalidOrder } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import { Int, OrderSide, OrderType } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class latoken extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'latoken',
            'name': 'Latoken',
            'countries': [ 'KY' ], // Cayman Islands
            'version': 'v2',
            'rateLimit': 1000,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': undefined, // has but unimplemented
                'future': undefined,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCurrencies': true,
                'fetchDepositWithdrawFees': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositionMode': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTransactions': true,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'transfer': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/61511972-24c39f00-aa01-11e9-9f7c-471f1d6e5214.jpg',
                'api': {
                    'rest': 'https://api.latoken.com',
                },
                'www': 'https://latoken.com',
                'doc': [
                    'https://api.latoken.com',
                ],
                'fees': 'https://latoken.com/fees',
                'referral': 'https://latoken.com/invite?r=mvgp2djk',
            },
            'api': {
                'public': {
                    'get': {
                        'book/{currency}/{quote}': 1,
                        'chart/week': 1,
                        'chart/week/{currency}/{quote}': 1,
                        'currency': 1,
                        'currency/available': 1,
                        'currency/quotes': 1,
                        'currency/{currency}': 1,
                        'pair': 1,
                        'pair/available': 1,
                        'ticker': 1,
                        'ticker/{base}/{quote}': 1,
                        'time': 1,
                        'trade/history/{currency}/{quote}': 1,
                        'trade/fee/{currency}/{quote}': 1,
                        'trade/feeLevels': 1,
                        'transaction/bindings': 1,
                    },
                },
                'private': {
                    'get': {
                        'auth/account': 1,
                        'auth/account/currency/{currency}/{type}': 1,
                        'auth/order': 1,
                        'auth/order/getOrder/{id}': 1,
                        'auth/order/pair/{currency}/{quote}': 1,
                        'auth/order/pair/{currency}/{quote}/active': 1,
                        'auth/stopOrder': 1,
                        'auth/stopOrder/getOrder/{id}': 1,
                        'auth/stopOrder/pair/{currency}/{quote}': 1,
                        'auth/stopOrder/pair/{currency}/{quote}/active': 1,
                        'auth/trade': 1,
                        'auth/trade/pair/{currency}/{quote}': 1,
                        'auth/trade/fee/{currency}/{quote}': 1,
                        'auth/transaction': 1,
                        'auth/transaction/bindings': 1,
                        'auth/transaction/bindings/{currency}': 1,
                        'auth/transaction/{id}': 1,
                        'auth/transfer': 1,
                    },
                    'post': {
                        'auth/order/cancel': 1,
                        'auth/order/cancelAll': 1,
                        'auth/order/cancelAll/{currency}/{quote}': 1,
                        'auth/order/place': 1,
                        'auth/spot/deposit': 1,
                        'auth/spot/withdraw': 1,
                        'auth/stopOrder/cancel': 1,
                        'auth/stopOrder/cancelAll': 1,
                        'auth/stopOrder/cancelAll/{currency}/{quote}': 1,
                        'auth/stopOrder/place': 1,
                        'auth/transaction/depositAddress': 1,
                        'auth/transaction/withdraw': 1,
                        'auth/transaction/withdraw/cancel': 1,
                        'auth/transaction/withdraw/confirm': 1,
                        'auth/transaction/withdraw/resendCode': 1,
                        'auth/transfer/email': 1,
                        'auth/transfer/id': 1,
                        'auth/transfer/phone': 1,
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0049'),
                    'taker': this.parseNumber ('0.0049'),
                },
            },
            'commonCurrencies': {
                'BUX': 'Buxcoin',
                'CBT': 'Community Business Token',
                'CTC': 'CyberTronchain',
                'DMD': 'Diamond Coin',
                'FREN': 'Frenchie',
                'GDX': 'GoldenX',
                'GEC': 'Geco One',
                'GEM': 'NFTmall',
                'GMT': 'GMT Token',
                'IMC': 'IMCoin',
                'MT': 'Monarch',
                'TPAY': 'Tetra Pay',
                'TRADE': 'Smart Trade Coin',
                'TSL': 'Treasure SL',
                'UNO': 'Unobtanium',
                'WAR': 'Warrior Token',
            },
            'exceptions': {
                'exact': {
                    'INTERNAL_ERROR': ExchangeError, // internal server error. You can contact our support to solve this problem. {"message":"Internal Server Error","error":"INTERNAL_ERROR","status":"FAILURE"}
                    'SERVICE_UNAVAILABLE': ExchangeNotAvailable, // requested information currently not available. You can contact our support to solve this problem or retry later.
                    'NOT_AUTHORIZED': AuthenticationError, // user's query not authorized. Check if you are logged in.
                    'FORBIDDEN': PermissionDenied, // you don't have enough access rights.
                    'BAD_REQUEST': BadRequest, // some bad request, for example bad fields values or something else. Read response message for more information.
                    'NOT_FOUND': ExchangeError, // entity not found. Read message for more information.
                    'ACCESS_DENIED': PermissionDenied, // access is denied. Probably you don't have enough access rights, you contact our support.
                    'REQUEST_REJECTED': ExchangeError, // user's request rejected for some reasons. Check error message.
                    'HTTP_MEDIA_TYPE_NOT_SUPPORTED': BadRequest, // http media type not supported.
                    'MEDIA_TYPE_NOT_ACCEPTABLE': BadRequest, // media type not acceptable
                    'METHOD_ARGUMENT_NOT_VALID': BadRequest, // one of method argument is invalid. Check argument types and error message for more information.
                    'VALIDATION_ERROR': BadRequest, // check errors field to get reasons.
                    'ACCOUNT_EXPIRED': AccountSuspended, // restore your account or create a new one.
                    'BAD_CREDENTIALS': AuthenticationError, // invalid username or password.
                    'COOKIE_THEFT': AuthenticationError, // cookie has been stolen. Let's try reset your cookies.
                    'CREDENTIALS_EXPIRED': AccountSuspended, // credentials expired.
                    'INSUFFICIENT_AUTHENTICATION': AuthenticationError, // for example, 2FA required.
                    'UNKNOWN_LOCATION': AuthenticationError, // user logged from unusual location, email confirmation required.
                    'TOO_MANY_REQUESTS': RateLimitExceeded, // too many requests at the time. A response header X-Rate-Limit-Remaining indicates the number of allowed request per a period.
                    'INSUFFICIENT_FUNDS': InsufficientFunds, // {"message":"not enough balance on the spot account for currency (USDT), need (20.000)","error":"INSUFFICIENT_FUNDS","status":"FAILURE"}
                    'ORDER_VALIDATION': InvalidOrder, // {"message":"Quantity (0) is not positive","error":"ORDER_VALIDATION","status":"FAILURE"}
                    'BAD_TICKS': InvalidOrder, // {"status":"FAILURE","message":"Quantity (1.4) does not match quantity tick (10)","error":"BAD_TICKS","errors":null,"result":false}
                },
                'broad': {
                    'invalid API key, signature or digest': AuthenticationError, // {"result":false,"message":"invalid API key, signature or digest","error":"BAD_REQUEST","status":"FAILURE"}
                    'The API key was revoked': AuthenticationError, // {"result":false,"message":"The API key was revoked","error":"BAD_REQUEST","status":"FAILURE"}
                    'request expired or bad': InvalidNonce, // {"result":false,"message":"request expired or bad <timeAlive>/<timestamp> format","error":"BAD_REQUEST","status":"FAILURE"}
                    'For input string': BadRequest, // {"result":false,"message":"Internal error","error":"For input string: \"NaN\"","status":"FAILURE"}
                    'Unable to resolve currency by tag': BadSymbol, // {"message":"Unable to resolve currency by tag (undefined)","error":"NOT_FOUND","status":"FAILURE"}
                    "Can't find currency with tag": BadSymbol, // {"status":"FAILURE","message":"Can't find currency with tag = undefined","error":"NOT_FOUND","errors":null,"result":false}
                    'Unable to place order because pair is in inactive state': BadSymbol, // {"message":"Unable to place order because pair is in inactive state (PAIR_STATUS_INACTIVE)","error":"ORDER_VALIDATION","status":"FAILURE"}
                    'API keys are not available for': AccountSuspended, // {"result":false,"message":"API keys are not available for FROZEN user","error":"BAD_REQUEST","status":"FAILURE"}
                },
            },
            'options': {
                'defaultType': 'spot',
                'types': {
                    'wallet': 'ACCOUNT_TYPE_WALLET',
                    'spot': 'ACCOUNT_TYPE_SPOT',
                },
                'accounts': {
                    'ACCOUNT_TYPE_WALLET': 'wallet',
                    'ACCOUNT_TYPE_SPOT': 'spot',
                },
                'fetchTradingFee': {
                    'method': 'fetchPrivateTradingFee', // or 'fetchPublicTradingFee'
                },
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name latoken#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetTime (params);
        //
        //     {
        //         "serverTime": 1570615577321
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name latoken#fetchMarkets
         * @description retrieves data on all markets for latoken
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const currencies = await this.fetchCurrenciesFromCache (params);
        //
        //     [
        //         {
        //             "id":"1a075819-9e0b-48fc-8784-4dab1d186d6d",
        //             "status":"CURRENCY_STATUS_ACTIVE",
        //             "type":"CURRENCY_TYPE_ALTERNATIVE", // CURRENCY_TYPE_CRYPTO, CURRENCY_TYPE_IEO
        //             "name":"MyCryptoBank",
        //             "tag":"MCB",
        //             "description":"",
        //             "logo":"",
        //             "decimals":18,
        //             "created":1572912000000,
        //             "tier":1,
        //             "assetClass":"ASSET_CLASS_UNKNOWN",
        //             "minTransferAmount":0
        //         },
        //         {
        //             "id":"db02758e-2507-46a5-a805-7bc60355b3eb",
        //             "status":"CURRENCY_STATUS_ACTIVE",
        //             "type":"CURRENCY_TYPE_FUTURES_CONTRACT",
        //             "name":"BTC USDT Futures Contract",
        //             "tag":"BTCUSDT",
        //             "description":"",
        //             "logo":"",
        //             "decimals":8,
        //             "created":1589459984395,
        //             "tier":1,
        //             "assetClass":"ASSET_CLASS_UNKNOWN",
        //             "minTransferAmount":0
        //         },
        //     ]
        //
        const response = await this.publicGetPair (params);
        //
        //     [
        //         {
        //             "id":"dba4289b-6b46-4d94-bf55-49eec9a163ad",
        //             "status":"PAIR_STATUS_ACTIVE", // CURRENCY_STATUS_INACTIVE
        //             "baseCurrency":"fb9b53d6-bbf6-472f-b6ba-73cc0d606c9b",
        //             "quoteCurrency":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f",
        //             "priceTick":"0.000000100000000000",
        //             "priceDecimals":7,
        //             "quantityTick":"0.010000000",
        //             "quantityDecimals":2,
        //             "costDisplayDecimals":7,
        //             "created":1572957210501,
        //             "minOrderQuantity":"0",
        //             "maxOrderCostUsd":"999999999999999999",
        //             "minOrderCostUsd":"0",
        //             "externalSymbol":""
        //         }
        //     ]
        //
        if (this.safeValue (this.options, 'adjustForTimeDifference', true)) {
            await this.loadTimeDifference ();
        }
        const currenciesById = this.indexBy (currencies, 'id');
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'id');
            // the exchange shows them inverted
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const baseCurrency = this.safeValue (currenciesById, baseId);
            const quoteCurrency = this.safeValue (currenciesById, quoteId);
            if (baseCurrency !== undefined && quoteCurrency !== undefined) {
                const base = this.safeCurrencyCode (this.safeString (baseCurrency, 'tag'));
                const quote = this.safeCurrencyCode (this.safeString (quoteCurrency, 'tag'));
                const lowercaseQuote = quote.toLowerCase ();
                const capitalizedQuote = this.capitalize (lowercaseQuote);
                const status = this.safeString (market, 'status');
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
                    'active': (status === 'PAIR_STATUS_ACTIVE'), // assuming true
                    'contract': false,
                    'linear': undefined,
                    'inverse': undefined,
                    'contractSize': undefined,
                    'expiry': undefined,
                    'expiryDatetime': undefined,
                    'strike': undefined,
                    'optionType': undefined,
                    'precision': {
                        'amount': this.safeNumber (market, 'quantityTick'),
                        'price': this.safeNumber (market, 'priceTick'),
                    },
                    'limits': {
                        'leverage': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'amount': {
                            'min': this.safeNumber (market, 'minOrderQuantity'),
                            'max': undefined,
                        },
                        'price': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'cost': {
                            'min': this.safeNumber (market, 'minOrderCost' + capitalizedQuote),
                            'max': this.safeNumber (market, 'maxOrderCost' + capitalizedQuote),
                        },
                    },
                    'info': market,
                });
            }
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
            const response = await this.publicGetCurrency (params);
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
         * @name latoken#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.fetchCurrenciesFromCache (params);
        //
        //     [
        //         {
        //             "id":"1a075819-9e0b-48fc-8784-4dab1d186d6d",
        //             "status":"CURRENCY_STATUS_ACTIVE",
        //             "type":"CURRENCY_TYPE_ALTERNATIVE", // CURRENCY_TYPE_CRYPTO, CURRENCY_TYPE_IEO
        //             "name":"MyCryptoBank",
        //             "tag":"MCB",
        //             "description":"",
        //             "logo":"",
        //             "decimals":18,
        //             "created":1572912000000,
        //             "tier":1,
        //             "assetClass":"ASSET_CLASS_UNKNOWN",
        //             "minTransferAmount":0
        //         },
        //         {
        //             "id":"db02758e-2507-46a5-a805-7bc60355b3eb",
        //             "status":"CURRENCY_STATUS_ACTIVE",
        //             "type":"CURRENCY_TYPE_FUTURES_CONTRACT",
        //             "name":"BTC USDT Futures Contract",
        //             "tag":"BTCUSDT",
        //             "description":"",
        //             "logo":"",
        //             "decimals":8,
        //             "created":1589459984395,
        //             "tier":1,
        //             "assetClass":"ASSET_CLASS_UNKNOWN",
        //             "minTransferAmount":0
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'id');
            const tag = this.safeString (currency, 'tag');
            const code = this.safeCurrencyCode (tag);
            const fee = this.safeNumber (currency, 'fee');
            const currencyType = this.safeString (currency, 'type');
            const parts = currencyType.split ('_');
            const numParts = parts.length;
            const lastPart = this.safeValue (parts, numParts - 1);
            const type = lastPart.toLowerCase ();
            const status = this.safeString (currency, 'status');
            const active = (status === 'CURRENCY_STATUS_ACTIVE');
            const name = this.safeString (currency, 'name');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'type': type,
                'active': active,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': fee,
                'precision': this.parseNumber (this.parsePrecision (this.safeString (currency, 'decimals'))),
                'limits': {
                    'amount': {
                        'min': this.safeNumber (currency, 'minTransferAmount'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': {},
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name latoken#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetAuthAccount (params);
        //
        //     [
        //         {
        //             id: "e5852e02-8711-431c-9749-a6f5503c6dbe",
        //             status: "ACCOUNT_STATUS_ACTIVE",
        //             type: "ACCOUNT_TYPE_WALLET",
        //             timestamp: "1635920106506",
        //             currency: "0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //             available: "100.000000",
        //             blocked: "0.000000"
        //         },
        //         {
        //             id: "369df204-acbc-467e-a25e-b16e3cc09cf6",
        //             status: "ACCOUNT_STATUS_ACTIVE",
        //             type: "ACCOUNT_TYPE_SPOT",
        //             timestamp: "1635920106504",
        //             currency: "0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //             available: "100.000000",
        //             blocked: "0.000000"
        //         }
        //     ]
        //
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        let maxTimestamp = undefined;
        const defaultType = this.safeString2 (this.options, 'fetchBalance', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const types = this.safeValue (this.options, 'types', {});
        const accountType = this.safeString (types, type, type);
        const balancesByType = this.groupBy (response, 'type');
        const balances = this.safeValue (balancesByType, accountType, []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const timestamp = this.safeInteger (balance, 'timestamp');
            if (timestamp !== undefined) {
                if (maxTimestamp === undefined) {
                    maxTimestamp = timestamp;
                } else {
                    maxTimestamp = Math.max (maxTimestamp, timestamp);
                }
            }
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'blocked');
            result[code] = account;
        }
        result['timestamp'] = maxTimestamp;
        result['datetime'] = this.iso8601 (maxTimestamp);
        return this.safeBalance (result);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name latoken#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['baseId'],
            'quote': market['quoteId'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // max 1000
        }
        const response = await this.publicGetBookCurrencyQuote (this.extend (request, params));
        //
        //     {
        //         "ask":[
        //             {"price":"4428.76","quantity":"0.08136","cost":"360.3239136","accumulated":"360.3239136"},
        //             {"price":"4429.77","quantity":"1.11786","cost":"4951.8626922","accumulated":"5312.1866058"},
        //             {"price":"4430.94","quantity":"1.78418","cost":"7905.5945292","accumulated":"13217.781135"},
        //         ],
        //         "bid":[
        //             {"price":"4428.43","quantity":"0.13675","cost":"605.5878025","accumulated":"605.5878025"},
        //             {"price":"4428.19","quantity":"0.03619","cost":"160.2561961","accumulated":"765.8439986"},
        //             {"price":"4428.15","quantity":"0.02926","cost":"129.567669","accumulated":"895.4116676"},
        //         ],
        //         "totalAsk":"53.14814",
        //         "totalBid":"112216.9029791"
        //     }
        //
        return this.parseOrderBook (response, symbol, undefined, 'bid', 'ask', 'price', 'quantity');
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f/0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //         "baseCurrency":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f",
        //         "quoteCurrency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //         "volume24h":"76411867.852585600000000000",
        //         "volume7d":"637809926.759451100000000000",
        //         "change24h":"2.5300",
        //         "change7d":"5.1300",
        //         "lastPrice":"4426.9"
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'lastPrice');
        const change = this.safeString (ticker, 'change24h');
        const timestamp = this.nonce ();
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'low': this.safeString (ticker, 'low'),
            'high': this.safeString (ticker, 'high'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeString (ticker, 'volume24h'),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name latoken#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'base': market['baseId'],
            'quote': market['quoteId'],
        };
        const response = await this.publicGetTickerBaseQuote (this.extend (request, params));
        //
        //     {
        //         "symbol":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f/0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //         "baseCurrency":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f",
        //         "quoteCurrency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //         "volume24h":"76411867.852585600000000000",
        //         "volume7d":"637809926.759451100000000000",
        //         "change24h":"2.5300",
        //         "change7d":"5.1300",
        //         "lastPrice":"4426.9"
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name latoken#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        //
        //     [
        //         {
        //             "symbol":"DASH/BTC",
        //             "baseCurrency":"ed75c263-4ab9-494b-8426-031dab1c7cc1",
        //             "quoteCurrency":"92151d82-df98-4d88-9a4d-284fa9eca49f",
        //             "volume24h":"1.977753278000000000",
        //             "volume7d":"18.964342670000000000",
        //             "change24h":"-1.4800",
        //             "change7d":"-5.5200",
        //             "lastPrice":"0.003066"
        //         },
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id":"c152f814-8eeb-44f0-8f3f-e5c568f2ffcf",
        //         "isMakerBuyer":false,
        //         "baseCurrency":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f",
        //         "quoteCurrency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //         "price":"4435.56",
        //         "quantity":"0.32534",
        //         "cost":"1443.0650904",
        //         "timestamp":1635854642725,
        //         "makerBuyer":false
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "id":"02e02533-b4bf-4ba9-9271-24e2108dfbf7",
        //         "isMakerBuyer":false,
        //         "direction":"TRADE_DIRECTION_BUY",
        //         "baseCurrency":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f",
        //         "quoteCurrency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //         "price":"4564.32",
        //         "quantity":"0.01000",
        //         "cost":"45.6432",
        //         "fee":"0.223651680000000000",
        //         "order":"c9cac6a0-484c-4892-88e7-ad51b39f2ce1",
        //         "timestamp":1635921580399,
        //         "makerBuyer":false
        //     }
        //
        const type = undefined;
        const timestamp = this.safeInteger (trade, 'timestamp');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'quantity');
        const costString = this.safeString (trade, 'cost');
        const makerBuyer = this.safeValue (trade, 'makerBuyer');
        let side = this.safeString (trade, 'direction');
        if (side === undefined) {
            side = makerBuyer ? 'sell' : 'buy';
        } else {
            if (side === 'TRADE_DIRECTION_BUY') {
                side = 'buy';
            } else if (side === 'TRADE_DIRECTION_SELL') {
                side = 'sell';
            }
        }
        const isBuy = (side === 'buy');
        const takerOrMaker = (makerBuyer && isBuy) ? 'maker' : 'taker';
        const baseId = this.safeString (trade, 'baseCurrency');
        const quoteId = this.safeString (trade, 'quoteCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        if (symbol in this.markets) {
            market = this.market (symbol);
        }
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'order');
        const feeCost = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': quote,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name latoken#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['baseId'],
            'quote': market['quoteId'],
            // 'from': since.toString (), // milliseconds
            // 'limit': limit, // default 100, max 1000
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        const response = await this.publicGetTradeHistoryCurrencyQuote (this.extend (request, params));
        //
        //     [
        //         {"id":"c152f814-8eeb-44f0-8f3f-e5c568f2ffcf","isMakerBuyer":false,"baseCurrency":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f","quoteCurrency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5","price":"4435.56","quantity":"0.32534","cost":"1443.0650904","timestamp":1635854642725,"makerBuyer":false},
        //         {"id":"cfecbefb-3d11-43d7-b9d4-fa16211aad8a","isMakerBuyer":false,"baseCurrency":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f","quoteCurrency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5","price":"4435.13","quantity":"0.26540","cost":"1177.083502","timestamp":1635854641114,"makerBuyer":false},
        //         {"id":"f43d3ec8-db94-49f3-b534-91dbc2779296","isMakerBuyer":true,"baseCurrency":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f","quoteCurrency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5","price":"4435.00","quantity":"0.41738","cost":"1851.0803","timestamp":1635854640323,"makerBuyer":true},
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchTradingFee (symbol: string, params = {}) {
        /**
         * @method
         * @name latoken#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        let method = this.safeString (params, 'method');
        params = this.omit (params, 'method');
        if (method === undefined) {
            const options = this.safeValue (this.options, 'fetchTradingFee', {});
            method = this.safeString (options, 'method', 'fetchPrivateTradingFee');
        }
        return await this[method] (symbol, params);
    }

    async fetchPublicTradingFee (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['baseId'],
            'quote': market['quoteId'],
        };
        const response = await this.publicGetTradeFeeCurrencyQuote (this.extend (request, params));
        //
        //     {
        //         makerFee: '0.004900000000000000',
        //         takerFee: '0.004900000000000000',
        //         type: 'FEE_SCHEME_TYPE_PERCENT_QUOTE',
        //         take: 'FEE_SCHEME_TAKE_PROPORTION'
        //     }
        //
        return {
            'info': response,
            'symbol': market['symbol'],
            'maker': this.safeNumber (response, 'makerFee'),
            'taker': this.safeNumber (response, 'takerFee'),
        };
    }

    async fetchPrivateTradingFee (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['baseId'],
            'quote': market['quoteId'],
        };
        const response = await this.privateGetAuthTradeFeeCurrencyQuote (this.extend (request, params));
        //
        //     {
        //         makerFee: '0.004900000000000000',
        //         takerFee: '0.004900000000000000',
        //         type: 'FEE_SCHEME_TYPE_PERCENT_QUOTE',
        //         take: 'FEE_SCHEME_TAKE_PROPORTION'
        //     }
        //
        return {
            'info': response,
            'symbol': market['symbol'],
            'maker': this.safeNumber (response, 'makerFee'),
            'taker': this.safeNumber (response, 'takerFee'),
        };
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name latoken#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'currency': market['baseId'],
            // 'quote': market['quoteId'],
            // 'from': this.milliseconds (),
            // 'limit': limit, // default '100'
        };
        let method = 'privateGetAuthTrade';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currency'] = market['baseId'];
            request['quote'] = market['quoteId'];
            method = 'privateGetAuthTradePairCurrencyQuote';
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":"02e02533-b4bf-4ba9-9271-24e2108dfbf7",
        //             "isMakerBuyer":false,
        //             "direction":"TRADE_DIRECTION_BUY",
        //             "baseCurrency":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f",
        //             "quoteCurrency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //             "price":"4564.32",
        //             "quantity":"0.01000",
        //             "cost":"45.6432",
        //             "fee":"0.223651680000000000",
        //             "order":"c9cac6a0-484c-4892-88e7-ad51b39f2ce1",
        //             "timestamp":1635921580399,
        //             "makerBuyer":false
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'ORDER_STATUS_PLACED': 'open',
            'ORDER_STATUS_CLOSED': 'closed',
            'ORDER_STATUS_CANCELLED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (status) {
        const statuses = {
            'ORDER_TYPE_MARKET': 'market',
            'ORDER_TYPE_LIMIT': 'limit',
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            'ORDER_CONDITION_GOOD_TILL_CANCELLED': 'GTC',
            'ORDER_CONDITION_IMMEDIATE_OR_CANCEL': 'IOC',
            'ORDER_CONDITION_FILL_OR_KILL': 'FOK',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "orderId":"1563460093.134037.704945@0370:2",
        //         "cliOrdId":"",
        //         "pairId":370,
        //         "symbol":"ETHBTC",
        //         "side":"sell",
        //         "orderType":"limit",
        //         "price":1.0,
        //         "amount":1.0
        //     }
        //
        // fetchOrder, fetchOpenOrders, fetchOrders
        //
        //     {
        //         "id":"a76bd262-3560-4bfb-98ac-1cedd394f4fc",
        //         "status":"ORDER_STATUS_PLACED",
        //         "side":"ORDER_SIDE_BUY",
        //         "condition":"ORDER_CONDITION_GOOD_TILL_CANCELLED",
        //         "type":"ORDER_TYPE_LIMIT",
        //         "baseCurrency":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f",
        //         "quoteCurrency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //         "clientOrderId":"web-macos_chrome_1a6a6659-6f7c-4fac-be0b-d1d7ac06d",
        //         "price":"4000.00",
        //         "quantity":"0.01",
        //         "cost":"40.000000000000000000",
        //         "filled":"0",
        //         "trader":"7244bb3a-b6b2-446a-ac78-fa4bce5b59a9",
        //         "creator":"ORDER_CREATOR_USER",
        //         "creatorId":"",
        //         "timestamp":1635920767648
        //     }
        //
        // cancelOrder
        //
        //     {
        //         "message":"cancellation request successfully submitted",
        //         "status":"SUCCESS",
        //         "id":"a631426d-3543-45ba-941e-75f7825afb0f"
        //     }
        //
        const id = this.safeString (order, 'id');
        const timestamp = this.safeInteger (order, 'timestamp');
        const baseId = this.safeString (order, 'baseCurrency');
        const quoteId = this.safeString (order, 'quoteCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = undefined;
        if ((base !== undefined) && (quote !== undefined)) {
            symbol = base + '/' + quote;
            if (symbol in this.markets) {
                market = this.market (symbol);
            }
        }
        const orderSide = this.safeString (order, 'side');
        let side = undefined;
        if (orderSide !== undefined) {
            const parts = orderSide.split ('_');
            const partsLength = parts.length;
            side = this.safeStringLower (parts, partsLength - 1);
        }
        const type = this.parseOrderType (this.safeString (order, 'type'));
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'quantity');
        const filled = this.safeString (order, 'filled');
        const cost = this.safeString (order, 'cost');
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        const message = this.safeString (order, 'message');
        if (message !== undefined) {
            if (message.indexOf ('cancel') >= 0) {
                status = 'canceled';
            } else if (message.indexOf ('accept') >= 0) {
                status = 'open';
            }
        }
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const timeInForce = this.parseTimeInForce (this.safeString (order, 'condition'));
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'average': undefined,
            'remaining': undefined,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name latoken#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['baseId'],
            'quote': market['quoteId'],
        };
        const response = await this.privateGetAuthOrderPairCurrencyQuoteActive (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":"a76bd262-3560-4bfb-98ac-1cedd394f4fc",
        //             "status":"ORDER_STATUS_PLACED",
        //             "side":"ORDER_SIDE_BUY",
        //             "condition":"ORDER_CONDITION_GOOD_TILL_CANCELLED",
        //             "type":"ORDER_TYPE_LIMIT",
        //             "baseCurrency":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f",
        //             "quoteCurrency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //             "clientOrderId":"web-macos_chrome_1a6a6659-6f7c-4fac-be0b-d1d7ac06d",
        //             "price":"4000.00",
        //             "quantity":"0.01000",
        //             "cost":"40.00",
        //             "filled":"0.00000",
        //             "trader":"7244bb3a-b6b2-446a-ac78-fa4bce5b59a9",
        //             "creator":"USER",
        //             "creatorId":"",
        //             "timestamp":1635920767648
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name latoken#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'currency': market['baseId'],
            // 'quote': market['quoteId'],
            // 'from': this.milliseconds (),
            // 'limit': limit, // default '100'
        };
        let method = 'privateGetAuthOrder';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currency'] = market['baseId'];
            request['quote'] = market['quoteId'];
            method = 'privateGetAuthOrderPairCurrencyQuote';
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":"a76bd262-3560-4bfb-98ac-1cedd394f4fc",
        //             "status":"ORDER_STATUS_PLACED",
        //             "side":"ORDER_SIDE_BUY",
        //             "condition":"ORDER_CONDITION_GOOD_TILL_CANCELLED",
        //             "type":"ORDER_TYPE_LIMIT",
        //             "baseCurrency":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f",
        //             "quoteCurrency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //             "clientOrderId":"web-macos_chrome_1a6a6659-6f7c-4fac-be0b-d1d7ac06d",
        //             "price":"4000.00",
        //             "quantity":"0.01000",
        //             "cost":"40.00",
        //             "filled":"0.00000",
        //             "trader":"7244bb3a-b6b2-446a-ac78-fa4bce5b59a9",
        //             "creator":"USER",
        //             "creatorId":"",
        //             "timestamp":1635920767648
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name latoken#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by latoken fetchOrder
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetAuthOrderGetOrderId (this.extend (request, params));
        //
        //     {
        //         "id":"a76bd262-3560-4bfb-98ac-1cedd394f4fc",
        //         "status":"ORDER_STATUS_PLACED",
        //         "side":"ORDER_SIDE_BUY",
        //         "condition":"ORDER_CONDITION_GOOD_TILL_CANCELLED",
        //         "type":"ORDER_TYPE_LIMIT",
        //         "baseCurrency":"620f2019-33c0-423b-8a9d-cde4d7f8ef7f",
        //         "quoteCurrency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //         "clientOrderId":"web-macos_chrome_1a6a6659-6f7c-4fac-be0b-d1d7ac06d",
        //         "price":"4000.00",
        //         "quantity":"0.01",
        //         "cost":"40.000000000000000000",
        //         "filled":"0",
        //         "trader":"7244bb3a-b6b2-446a-ac78-fa4bce5b59a9",
        //         "creator":"ORDER_CREATOR_USER",
        //         "creatorId":"",
        //         "timestamp":1635920767648
        //     }
        //
        return this.parseOrder (response);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name latoken#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        const request = {
            'baseCurrency': market['baseId'],
            'quoteCurrency': market['quoteId'],
            'side': side.toUpperCase (), // "BUY", "BID", "SELL", "ASK"
            'condition': 'GTC', // "GTC", "GOOD_TILL_CANCELLED", "IOC", "IMMEDIATE_OR_CANCEL", "FOK", "FILL_OR_KILL"
            'type': uppercaseType, // "LIMIT", "MARKET"
            'clientOrderId': this.uuid (), // 50 characters max
            // 'price': this.priceToPrecision (symbol, price),
            // 'quantity': this.amountToPrecision (symbol, amount),
        };
        if (uppercaseType === 'LIMIT') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        request['quantity'] = this.amountToPrecision (symbol, amount);
        request['timestamp'] = this.seconds ();
        const response = await this.privatePostAuthOrderPlace (this.extend (request, params));
        //
        //     {
        //         "orderId":"1563460093.134037.704945@0370:2",
        //         "cliOrdId":"",
        //         "pairId":370,
        //         "symbol":"ETHBTC",
        //         "side":"sell",
        //         "orderType":"limit",
        //         "price":1.0,
        //         "amount":1.0
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name latoken#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by latoken cancelOrder ()
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privatePostAuthOrderCancel (this.extend (request, params));
        //
        //     {
        //         "id": "12345678-1234-1244-1244-123456789012",
        //         "message": "cancellation request successfully submitted",
        //         "status": "SUCCESS",
        //         "error": "",
        //         "errors": { }
        //     }
        //
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name latoken#cancelAllOrders
         * @description cancel all open orders in a market
         * @param {string} symbol unified market symbol of the market to cancel orders in
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'currency': market['baseId'],
            // 'quote': market['quoteId'],
        };
        let method = 'privatePostAuthOrderCancelAll';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currency'] = market['baseId'];
            request['quote'] = market['quoteId'];
            method = 'privatePostAuthOrderCancelAllCurrencyQuote';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "message":"cancellation request successfully submitted",
        //         "status":"SUCCESS"
        //     }
        //
        return response;
    }

    async fetchTransactions (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name latoken#fetchTransactions
         * @description fetch history of deposits and withdrawals
         * @param {string|undefined} code unified currency code for the currency of the transactions, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest transaction, default is undefined
         * @param {int|undefined} limit max number of transactions to return, default is undefined
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'page': '1',
            // 'size': 100,
        };
        const response = await this.privateGetAuthTransaction (this.extend (request, params));
        //
        //     {
        //         "hasNext":false,
        //         "content":[
        //             {
        //                 "id":"fbf7d0d1-2629-4ad8-9def-7a1dba423362",
        //                 "status":"TRANSACTION_STATUS_CONFIRMED",
        //                 "type":"TRANSACTION_TYPE_DEPOSIT",
        //                 "senderAddress":"",
        //                 "recipientAddress":"0x3c46fa2e3f9023bc4897828ed173f8ecb3a554bc",
        //                 "amount":"200.000000000000000000",
        //                 "transactionFee":"0.000000000000000000",
        //                 "timestamp":1635893208404,
        //                 "transactionHash":"0x28bad3b74a042df13d64ddfbca855566a51bf7f190b8cd565c236a18d5cd493f#42",
        //                 "blockHeight":13540262,
        //                 "currency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //                 "memo":null,
        //                 "paymentProvider":"a8d6d1cb-f84a-4e9d-aa82-c6a08b356ee1",
        //                 "requiresCode":false
        //             }
        //         ],
        //         "first":true,
        //         "hasContent":true,
        //         "pageSize":10
        //     }
        //
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const content = this.safeValue (response, 'content', []);
        return this.parseTransactions (content, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         "id":"fbf7d0d1-2629-4ad8-9def-7a1dba423362",
        //         "status":"TRANSACTION_STATUS_CONFIRMED",
        //         "type":"TRANSACTION_TYPE_DEPOSIT",
        //         "senderAddress":"",
        //         "recipientAddress":"0x3c46fa2e3f9023bc4897828ed173f8ecb3a554bc",
        //         "amount":"200.000000000000000000",
        //         "transactionFee":"0.000000000000000000",
        //         "timestamp":1635893208404,
        //         "transactionHash":"0x28bad3b74a042df13d64ddfbca855566a51bf7f190b8cd565c236a18d5cd493f#42",
        //         "blockHeight":13540262,
        //         "currency":"0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //         "memo":null,
        //         "paymentProvider":"a8d6d1cb-f84a-4e9d-aa82-c6a08b356ee1",
        //         "requiresCode":false
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const timestamp = this.safeInteger (transaction, 'timestamp');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const amount = this.safeNumber (transaction, 'amount');
        const addressFrom = this.safeString (transaction, 'senderAddress');
        const addressTo = this.safeString (transaction, 'recipientAddress');
        const txid = this.safeString (transaction, 'transactionHash');
        const tagTo = this.safeString (transaction, 'memo');
        let fee = undefined;
        const feeCost = this.safeNumber (transaction, 'transactionFee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        const type = this.parseTransactionType (this.safeString (transaction, 'type'));
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'address': addressTo,
            'tagFrom': undefined,
            'tagTo': tagTo,
            'tag': tagTo,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'TRANSACTION_STATUS_CONFIRMED': 'ok',
            'TRANSACTION_STATUS_EXECUTED': 'ok',
            'TRANSACTION_STATUS_CANCELLED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type) {
        const types = {
            'TRANSACTION_TYPE_DEPOSIT': 'deposit',
            'TRANSACTION_TYPE_WITHDRAWAL': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    async fetchTransfers (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name latoken#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @param {string|undefined} code unified currency code of the currency transferred
         * @param {int|undefined} since the earliest time in ms to fetch transfers for
         * @param {int|undefined} limit the maximum number of  transfers structures to retrieve
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {[object]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const response = await this.privateGetAuthTransfer (params);
        //
        //     {
        //         "hasNext": true,
        //         "content": [
        //             {
        //             "id": "ebd6312f-cb4f-45d1-9409-4b0b3027f21e",
        //             "status": "TRANSFER_STATUS_COMPLETED",
        //             "type": "TRANSFER_TYPE_WITHDRAW_SPOT",
        //             "fromAccount": "c429c551-adbb-4078-b74b-276bea308a36",
        //             "toAccount": "631c6203-bd62-4734-a04d-9b2a951f43b9",
        //             "transferringFunds": 1259.0321785,
        //             "usdValue": 1259.032179,
        //             "rejectReason": null,
        //             "timestamp": 1633515579530,
        //             "direction": "INTERNAL",
        //             "method": "TRANSFER_METHOD_UNKNOWN",
        //             "recipient": null,
        //             "sender": null,
        //             "currency": "0c3a106d-bde3-4c13-a26e-3fd2394529e5",
        //             "codeRequired": false,
        //             "fromUser": "ce555f3f-585d-46fb-9ae6-487f66738073",
        //             "toUser": "ce555f3f-585d-46fb-9ae6-487f66738073",
        //             "fee": 0
        //             },
        //             ...
        //         ],
        //         "first": true,
        //         "pageSize": 20,
        //         "hasContent": true
        //     }
        //
        const transfers = this.safeValue (response, 'content', []);
        return this.parseTransfers (transfers, currency, since, limit);
    }

    async transfer (code: string, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name latoken#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the latoken api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        let method = undefined;
        if (toAccount.indexOf ('@') >= 0) {
            method = 'privatePostAuthTransferEmail';
        } else if (toAccount.length === 36) {
            method = 'privatePostAuthTransferId';
        } else {
            method = 'privatePostAuthTransferPhone';
        }
        const request = {
            'currency': currency['id'],
            'recipient': toAccount,
            'value': this.currencyToPrecision (code, amount),
        };
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "id": "e6fc4ace-7750-44e4-b7e9-6af038ac7107",
        //         "status": "TRANSFER_STATUS_COMPLETED",
        //         "type": "TRANSFER_TYPE_DEPOSIT_SPOT",
        //         "fromAccount": "3bf61015-bf32-47a6-b237-c9f70df772ad",
        //         "toAccount": "355eb279-7c7e-4515-814a-575a49dc0325",
        //         "transferringFunds": "500000.000000000000000000",
        //         "usdValue": "0.000000000000000000",
        //         "rejectReason": "",
        //         "timestamp": 1576844438402,
        //         "direction": "INTERNAL",
        //         "method": "TRANSFER_METHOD_UNKNOWN",
        //         "recipient": "",
        //         "sender": "",
        //         "currency": "40af7879-a8cc-4576-a42d-7d2749821b58",
        //         "codeRequired": false,
        //         "fromUser": "cd555555-666d-46fb-9ae6-487f66738073",
        //         "toUser": "cd555555-666d-46fb-9ae6-487f66738073",
        //         "fee": 0
        //     }
        //
        return this.parseTransfer (response);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //     {
        //         "id": "e6fc4ace-7750-44e4-b7e9-6af038ac7107",
        //         "status": "TRANSFER_STATUS_COMPLETED",
        //         "type": "TRANSFER_TYPE_DEPOSIT_SPOT",
        //         "fromAccount": "3bf61015-bf32-47a6-b237-c9f70df772ad",
        //         "toAccount": "355eb279-7c7e-4515-814a-575a49dc0325",
        //         "transferringFunds": "500000.000000000000000000",
        //         "usdValue": "0.000000000000000000",
        //         "rejectReason": "",
        //         "timestamp": 1576844438402,
        //         "direction": "INTERNAL",
        //         "method": "TRANSFER_METHOD_UNKNOWN",
        //         "recipient": "",
        //         "sender": "",
        //         "currency": "40af7879-a8cc-4576-a42d-7d2749821b58",
        //         "codeRequired": false,
        //         "fromUser": "cd555555-666d-46fb-9ae6-487f66738073",
        //         "toUser": "cd555555-666d-46fb-9ae6-487f66738073",
        //         "fee": 0
        //     }
        //
        const timestamp = this.safeTimestamp (transfer, 'timestamp');
        const currencyId = this.safeString (transfer, 'currency');
        const status = this.safeString (transfer, 'status');
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'id'),
            'timestamp': this.safeInteger (transfer, 'timestamp'),
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (transfer, 'transferringFunds'),
            'fromAccount': this.safeString (transfer, 'fromAccount'),
            'toAccount': this.safeString (transfer, 'toAccount'),
            'status': this.parseTransferStatus (status),
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            'TRANSFER_STATUS_COMPLETED': 'ok',
            'TRANSFER_STATUS_PENDING': 'pending',
            'TRANSFER_STATUS_REJECTED': 'failed',
            'TRANSFER_STATUS_UNVERIFIED': 'pending',
            'TRANSFER_STATUS_CANCELLED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = undefined, headers = undefined, body = undefined) {
        const request = '/' + this.version + '/' + this.implodeParams (path, params);
        let requestString = request;
        const query = this.omit (params, this.extractParams (path));
        const urlencodedQuery = this.urlencode (query);
        if (method === 'GET') {
            if (Object.keys (query).length) {
                requestString += '?' + urlencodedQuery;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const auth = method + request + urlencodedQuery;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha512);
            headers = {
                'X-LA-APIKEY': this.apiKey,
                'X-LA-SIGNATURE': signature,
                'X-LA-DIGEST': 'HMAC-SHA512', // HMAC-SHA384, HMAC-SHA512, optional
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = this.json (query);
            }
        }
        const url = this.urls['api']['rest'] + requestString;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined;
        }
        //
        // {"result":false,"message":"invalid API key, signature or digest","error":"BAD_REQUEST","status":"FAILURE"}
        // {"result":false,"message":"request expired or bad <timeAlive>/<timestamp> format","error":"BAD_REQUEST","status":"FAILURE"}
        // {"message":"Internal Server Error","error":"INTERNAL_ERROR","status":"FAILURE"}
        // {"result":false,"message":"Internal error","error":"For input string: \"NaN\"","status":"FAILURE"}
        //
        const message = this.safeString (response, 'message');
        const feedback = this.id + ' ' + body;
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        }
        const error = this.safeValue (response, 'error');
        const errorMessage = this.safeString (error, 'message');
        if ((error !== undefined) || (errorMessage !== undefined)) {
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
