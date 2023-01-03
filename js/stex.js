'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, ExchangeError, InsufficientFunds, OrderNotFound, PermissionDenied, BadRequest, BadSymbol, DDoSProtection, InvalidOrder, AccountSuspended } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class stex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'stex',
            'name': 'STEX', // formerly known as stocks.exchange
            'countries': [ 'EE' ], // Estonia
            'rateLimit': 1000 / 3, // https://help.stex.com/en/articles/2815043-api-3-rate-limits
            'certified': false,
            // new metainfo interface
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
                'createMarketOrder': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrder': true,
                'fetchCurrencies': true,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
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
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTransactionFees': true,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'version': 'v3',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/69680782-03fd0b80-10bd-11ea-909e-7f603500e9cc.jpg',
                'api': {
                    'rest': 'https://api3.stex.com',
                },
                'www': 'https://www.stex.com',
                'doc': [
                    'https://apidocs.stex.com/',
                    'https://help.stex.com/en/collections/1593608-api-v3-documentation',
                ],
                'fees': 'https://app.stex.com/en/pairs-specification',
                'referral': 'https://app.stex.com?ref=36416021',
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'token': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '12h': '720',
                '1d': '1D', // default
            },
            'api': {
                'public': {
                    'get': {
                        'currencies': 1, // Available Currencies
                        'currencies/{currencyId}': 1, // Get currency info
                        'markets': 1, // Available markets
                        'pairs-groups': 1, // Available currency pairs groups (as displayed at stex trading page)
                        'currency_pairs/list/{code}': 1, // Available currency pairs
                        'currency_pairs/group/{currencyPairGroupId}': 1, // Available currency pairs for a given group
                        'currency_pairs/{currencyPairId}': 1, // Get currency pair information
                        'ticker': 1, // Tickers list for all currency pairs
                        'ticker/{currencyPairId}': 1, // Ticker for currency pair
                        'trades/{currencyPairId}': 1, // Trades for given currency pair
                        'orderbook/{currencyPairId}': 1, // Orderbook for given currency pair
                        'chart/{currencyPairId}/{candlesType}': 1, // A list of candles for given currency pair
                        'deposit-statuses': 1, // Available Deposit Statuses
                        'deposit-statuses/{statusId}': 1, // Get deposit status info
                        'withdrawal-statuses': 1, // Available Withdrawal Statuses
                        'withdrawal-statuses/{statusId}': 1, // Get status info
                        'ping': 1, // Test API is working and get server time
                        'mobile-versions': 1, // Shows the official mobile applications data
                        'twitter': 1, // Get the last 20 posts (stex.com) on Twitter
                    },
                },
                'trading': {
                    'get': {
                        'fees/{currencyPairId}': 1, // Returns the user's fees for a given currency pair
                        'orders': 12, // List your currently open orders
                        'orders/{currencyPairId}': 6, // List your currently open orders for given currency pair
                        'order/{orderId}': 12, // Get a single order
                    },
                    'post': {
                        'orders/{currencyPairId}': 1.5, // Create new order and put it to the orders processing queue
                        'orders/bulk/{currencyPairId}': 12, // Create new orders in a bulk and put it to the orders processing queue
                    },
                    'delete': {
                        'orders': 30, // Delete all active orders
                        'orders/{currencyPairId}': 12, // Delete active orders for given currency pair
                        'order/{orderId}': 1.5, // Cancel order
                    },
                },
                'reports': {
                    'get': {
                        'currencies': 12, // Get a list of currencies user had any activity in
                        'currency_pairs': 12, // Gets the list of currency pairs the user had orders in for all the time
                        'orders': 12, // Get past orders
                        'orders/{orderId}': 12, // Get specified order details
                        'trades/{currencyPairId}': 12, // Get a list of user trades according to request parameters
                        'background/{listMode}': 12, // Get reports list for category
                        'background/{id}': 12, // Get some report info
                        'background/download/{id}': 12, // Get file by id
                    },
                    'post': {
                        'background/create': 12, // Create new report
                    },
                    'delete': {
                        'background/{id}': 12, // Remove report by id
                    },
                },
                'profile': {
                    'get': {
                        'info': 3, // Account information
                        'wallets': 3, // Get a list of user wallets
                        'wallets/{walletId}': 3, // Single wallet information
                        'wallets/address/{walletId}': 3, // Get deposit address for given wallet
                        'deposits': 3, // Get a list of deposits made by user
                        'deposits/{id}': 3, // Get deposit by id
                        'rewards': 3, // Get a list of rewards obtained by user (e.g. in trading competitions)
                        'rewards/{id}': 3, // Get reward by id
                        'addressbook': 3, // Get a list of user address book items
                        'addressbook/{itemId}': 3, // Single address book item
                        'withdrawals': 3, // Get a list of withdrawals made by user
                        'withdrawals/{id}': 3, // Get withdrawal by id
                        'notifications': 3, // Get notifications
                        'notifications/price': 3, // Get a list of active price alerts
                        'favorite/currency_pairs': 3, // Get favorite currency pairs
                        'token-scopes': 3, // Get current token scopes
                    },
                    'post': {
                        'wallets/burn/{walletId}': 3, // Burns the given wallet
                        'wallets/{walletId}/hold_amount': 3, // Move a part of the funds on the wallet to the "hold" to keep it safe from trading
                        'wallets/{currencyId}': 3, // Create a wallet for given currency
                        'wallets/address/{walletId}': 3, // Create new deposit address
                        'addressbook/disable_item/{itemId}': 3, // Disables the address book item
                        'addressbook/enable_item/{itemId}': 3, // Enable the address book item
                        'addressbook/enable_strict_wd': 3, // Restrict the withdrawals to only addresses that are active in addressbook
                        'addressbook/disable_strict_wd': 3, // Remove restriction to withdraw to only addresses that are active in addressbook. E.g. allow to withdraw to any address.
                        'withdraw': 30, // Create withdrawal request
                        'notifications/price': 3, // Create new price alert
                        'referral/program': 3, // Create referral program
                        'referral/insert/{code}': 3, // Insert referral code
                        'referral/bonus_transfer/{currencyId}': 3, // Transfer referral bonuses balance to main balance for given currency
                    },
                    'put': {
                        'favorite/currency_pairs/set': 3, // Set favorite currency pairs
                    },
                    'delete': {
                        'addressbook/{itemId}': 3, // Deletes address book item
                        'withdraw/{withdrawalId}': 30, // Cancel unconfirmed withdrawal
                        'notifications/price/{priceAlertId}': 3, // Delete the price alert by ID
                    },
                },
                'verification': {
                    'get': {
                        'countries': 1, // Countries list, beta
                        'status': 1, // Get status verify
                        'fractal/url': 1, // Generate verify url from Fractal
                        'smart-id': 1, // Check Smart-ID verify
                        'stex': 1, // Get information about your KYC, beta
                        'cryptonomica/code': 1, // Get Discount code for Cryptonomica
                    },
                    'post': {
                        'smart-id': 1, // Initialization Smart-ID verify (Send request to Smart-ID App)
                        'stex': 1, // Update information regarding of your KYC verification, beta
                        'cryptonomica': 1, // Add verification from Cryptonomica
                    },
                },
                'settings': {
                    'get': {
                        'notifications/{event}': 1, // User event notification settings
                        'notifications': 1, // User events notification settings
                    },
                    'put': {
                        'notifications': 1, // Set notification settings
                        'notifications/set': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.002'),
                    'maker': this.parseNumber ('0.002'),
                },
            },
            'commonCurrencies': {
                'BC': 'Bitcoin Confidential',
                'BITS': 'Bitcoinus',
                'BITSW': 'BITS',
                'BHD': 'Bithold',
                'BTH': 'Bithereum',
                'MPH': 'Chasyr Token',
                'SBTC': 'SBTCT', // SiamBitcoin
            },
            'options': {
                'parseOrderToPrecision': false,
                'networks': {
                    'ERC20': 5,
                    'ETH': 5,
                    'OMNI': 10,
                    'XLM': 20,
                    'BEP2': 22,
                    'TRC20': 24,
                    'TRX': 24,
                    'SOL': 25,
                    'BEP20': 501,
                },
                'accountsByType': {
                    'spot': 'spot',
                    'hold': 'hold',
                    'funding': 'funding',
                    'referal': 'referal',
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    // {"success":false,"message":"Wrong parameters","errors":{"candleType":["Invalid Candle Type!"]}}
                    // {"success":false,"message":"Wrong parameters","errors":{"time":["timeStart or timeEnd is less then 1"]}}
                    'Wrong parameters': BadRequest,
                    'Unauthenticated.': AuthenticationError, // {"message":"Unauthenticated."}
                    'Server Error': ExchangeError, // { "message": "Server Error" }
                    'This feature is only enabled for users verifies by Cryptonomica': PermissionDenied, // {"success":false,"message":"This feature is only enabled for users verifies by Cryptonomica"}
                    'Too Many Attempts.': DDoSProtection, // { "message": "Too Many Attempts." }
                    'Selected Pair is disabled': BadSymbol, // {"success":false,"message":"Selected Pair is disabled"}
                    'Invalid scope(s) provided.': PermissionDenied, // { "message": "Invalid scope(s) provided." }
                    'The maximum amount of open orders with the same price cannot exceed 10': InvalidOrder, // { "success":false,"message":"The maximum amount of open orders with the same price cannot exceed 10" }
                    'Your account not verified!': AccountSuspended, // {"success":false,"message":"Your account not verified!","unified_message":{"message_id":"verification_required_to_continue","substitutions":null},"notice":"Please be informed that parameter `message` is deprecated and will be removed. Use unified_message instead."}
                },
                'broad': {
                    'Not enough': InsufficientFunds, // {"success":false,"message":"Not enough  ETH"}
                },
            },
        });
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name stex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetCurrencies (params);
        //
        //     {
        //         "success":true,
        //         "data":[
        //             {
        //                 "id":1,
        //                 "code":"BTC",
        //                 "name":"Bitcoin",
        //                 "active":true,
        //                 "delisted":false,
        //                 "precision":8,
        //                 "minimum_tx_confirmations":1,
        //                 "minimum_withdrawal_amount":"0.00200000",
        //                 "minimum_deposit_amount":"0.00000000",
        //                 "deposit_fee_currency_id":1,
        //                 "deposit_fee_currency_code":"BTC",
        //                 "deposit_fee_const":"0.00000000",
        //                 "deposit_fee_percent":"0.00000000",
        //                 "withdrawal_fee_currency_id":1,
        //                 "withdrawal_fee_currency_code":"BTC",
        //                 "withdrawal_fee_const":"0.00100000",
        //                 "withdrawal_fee_percent":"0.00000000",
        //                 "block_explorer_url":"https:\/\/blockchain.info\/tx\/",
        //                 "protocol_specific_settings":null
        //             },
        //         ]
        //     }
        //
        const result = {};
        const currencies = this.safeValue (response, 'data', []);
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const numericId = this.safeInteger (currency, 'id');
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const code = this.safeCurrencyCode (this.safeString (currency, 'code'));
            const precision = this.parseNumber (this.parsePrecision (this.safeString (currency, 'precision')));
            const fee = this.safeNumber (currency, 'withdrawal_fee_const'); // todo: redesign
            const active = this.safeValue (currency, 'active', true);
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'info': currency,
                'type': undefined,
                'name': this.safeString (currency, 'name'),
                'active': active,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': precision,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': this.safeNumber (currency, 'minimum_deposit_amount'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'minimum_withdrawal_amount'),
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
         * @name stex#fetchMarkets
         * @description retrieves data on all markets for stex
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const request = {
            'code': 'ALL',
        };
        const response = await this.publicGetCurrencyPairsListCode (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "data":[
        //             {
        //                 "id":935,
        //                 "currency_id":662,
        //                 "currency_code":"ABET",
        //                 "currency_name":"Altbet",
        //                 "market_currency_id":1,
        //                 "market_code":"BTC",
        //                 "market_name":"Bitcoin",
        //                 "min_order_amount":"0.00000010",
        //                 "min_buy_price":"0.00000001",
        //                 "min_sell_price":"0.00000001",
        //                 "buy_fee_percent":"0.20000000",
        //                 "sell_fee_percent":"0.20000000",
        //                 "active":true,
        //                 "delisted":false,
        //                 "pair_message":"",
        //                 "currency_precision":8,
        //                 "market_precision":8,
        //                 "symbol":"ABET_BTC",
        //                 "group_name":"BTC",
        //                 "group_id":1
        //             }
        //         ]
        //     }
        //
        const result = [];
        const markets = this.safeValue (response, 'data', []);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const numericId = this.safeInteger (market, 'id');
            const baseId = this.safeString (market, 'currency_id');
            const quoteId = this.safeString (market, 'market_currency_id');
            const baseNumericId = this.safeInteger (market, 'currency_id');
            const quoteNumericId = this.safeInteger (market, 'market_currency_id');
            const base = this.safeCurrencyCode (this.safeString (market, 'currency_code'));
            const quote = this.safeCurrencyCode (this.safeString (market, 'market_code'));
            const minBuyPrice = this.safeString (market, 'min_buy_price');
            const minSellPrice = this.safeString (market, 'min_sell_price');
            const minPrice = Precise.stringMax (minBuyPrice, minSellPrice);
            const buyFee = Precise.stringDiv (this.safeString (market, 'buy_fee_percent'), '100');
            const sellFee = Precise.stringDiv (this.safeString (market, 'sell_fee_percent'), '100');
            const fee = Precise.stringMax (buyFee, sellFee);
            result.push ({
                'id': id,
                'numericId': numericId,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'baseNumericId': baseNumericId,
                'quoteNumericId': quoteNumericId,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': this.safeValue (market, 'active'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': fee,
                'maker': fee,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'currency_precision'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'market_precision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_order_amount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': minPrice,
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

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name stex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPairId': market['id'],
        };
        const response = await this.publicGetTickerCurrencyPairId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "id": 2,
        //             "amount_multiplier": 1,
        //             "currency_code": "ETH",
        //             "market_code": "BTC",
        //             "currency_name": "Ethereum",
        //             "market_name": "Bitcoin",
        //             "symbol": "ETH_BTC",
        //             "group_name": "BTC",
        //             "group_id": 1,
        //             "ask": "0.02069998",
        //             "bid": "0.02028622",
        //             "last": "0.02049224",
        //             "open": "0.02059605",
        //             "low": "0.01977744",
        //             "high": "0.02097005",
        //             "volume": "480.43248971",
        //             "volumeQuote": "23491.29826130",
        //             "count": "7384",
        //             "fiatsRate": {
        //                 "USD": 7230.86,
        //                 "EUR": 6590.79,
        //                 "UAH": 173402,
        //                 "AUD": 10595.51,
        //                 "IDR": 101568085,
        //                 "CNY": 50752,
        //                 "KRW": 8452295,
        //                 "JPY": 784607,
        //                 "VND": 167315119,
        //                 "INR": 517596,
        //                 "GBP": 5607.25,
        //                 "CAD": 9602.63,
        //                 "BRL": 30472,
        //                 "RUB": 460718
        //             },
        //             "timestamp": 1574698235601
        //         }
        //     }
        //
        const ticker = this.safeValue (response, 'data', {});
        return this.parseTicker (ticker, market);
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name stex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetPing (params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "server_datetime": {
        //                 "date": "2019-01-22 15:13:34.233796",
        //                 "timezone_type": 3,
        //                 "timezone": "UTC"
        //             },
        //             "server_timestamp": 1548170014
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const serverDatetime = this.safeValue (data, 'server_datetime', {});
        return this.parse8601 (this.safeString (serverDatetime, 'date'));
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPairId': market['id'],
        };
        if (limit !== undefined) {
            request['limit_bids'] = limit; // returns all if set to 0, default 100
            request['limit_asks'] = limit; // returns all if set to 0, default 100
        }
        const response = await this.publicGetOrderbookCurrencyPairId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "ask": [
        //                 { "currency_pair_id": 2, "amount": "2.17865373", "price": "0.02062917", "amount2": "0.04494382", "count": 1, "cumulative_amount": 2.17865373 },
        //                 { "currency_pair_id": 2, "amount": "2.27521743", "price": "0.02062918", "amount2": "0.04693587", "count": 1, "cumulative_amount": 4.45387116 },
        //                 { "currency_pair_id": 2, "amount": "1.26980049", "price": "0.02063170", "amount2": "0.02619814", "count": 1, "cumulative_amount": 5.72367165 },
        //             ],
        //             "bid": [
        //                 { "currency_pair_id": 2, "amount": "0.00978005", "price": "0.02057000", "amount2": "0.00020118", "count": 1, "cumulative_amount": 0.00978005 },
        //                 { "currency_pair_id": 2, "amount": "0.00500000", "price": "0.02056000", "amount2": "0.00010280", "count": 1, "cumulative_amount": 0.01478005 },
        //                 { "currency_pair_id": 2, "amount": "0.77679882", "price": "0.02054001", "amount2": "0.01595546", "count": 1, "cumulative_amount": 0.79157887 },
        //             ],
        //             "ask_total_amount": 2555.749174609999,
        //             "bid_total_amount": 29.180037330000005
        //         }
        //     }
        //
        const orderbook = this.safeValue (response, 'data', {});
        return this.parseOrderBook (orderbook, symbol, undefined, 'bid', 'ask', 'price', 'amount');
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "id": 2,
        //         "amount_multiplier": 1,
        //         "currency_code": "ETH",
        //         "market_code": "BTC",
        //         "currency_name": "Ethereum",
        //         "market_name": "Bitcoin",
        //         "symbol": "ETH_BTC",
        //         "group_name": "BTC",
        //         "group_id": 1,
        //         "ask": "0.02069998",
        //         "bid": "0.02028622",
        //         "last": "0.02049224",
        //         "open": "0.02059605",
        //         "low": "0.01977744",
        //         "high": "0.02097005",
        //         "volume": "480.43248971",
        //         "volumeQuote": "23491.29826130",
        //         "count": "7384",
        //         "fiatsRate": {
        //             "USD": 7230.86,
        //             "EUR": 6590.79,
        //             "UAH": 173402,
        //             "AUD": 10595.51,
        //             "IDR": 101568085,
        //             "CNY": 50752,
        //             "KRW": 8452295,
        //             "JPY": 784607,
        //             "VND": 167315119,
        //             "INR": 517596,
        //             "GBP": 5607.25,
        //             "CAD": 9602.63,
        //             "BRL": 30472,
        //             "RUB": 460718
        //         },
        //         "timestamp": 1574698235601
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const marketId = this.safeString2 (ticker, 'id', 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const last = this.safeString (ticker, 'last');
        const open = this.safeString (ticker, 'open');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volumeQuote'),
            'quoteVolume': this.safeString (ticker, 'volume'),
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        //
        //     {
        //         "success":true,
        //         "data":[
        //             {
        //                 "id":262,
        //                 "amount_multiplier":1,
        //                 "currency_code":"ARDR",
        //                 "market_code":"BTC",
        //                 "currency_name":"ARDOR",
        //                 "market_name":"Bitcoin",
        //                 "symbol":"ARDR_BTC",
        //                 "group_name":"BTC",
        //                 "group_id":1,
        //                 "ask":"0.00000630",
        //                 "bid":"0.00000613",
        //                 "last":"0.00000617",
        //                 "open":"0.00000620",
        //                 "low":"0.00000614",
        //                 "high":"0.00000630",
        //                 "volume":"30.37795305",
        //                 "volumeQuote":"4911487.01996544",
        //                 "count":"710",
        //                 "fiatsRate":{
        //                     "USD":7230.86,
        //                     "EUR":6590.79,
        //                     "UAH":173402,
        //                     "AUD":10744.52,
        //                     "IDR":101568085,
        //                     "CNY":50752,
        //                     "KRW":8452295,
        //                     "JPY":784607,
        //                     "VND":167315119,
        //                     "INR":517596,
        //                     "GBP":5607.25,
        //                     "CAD":9602.63,
        //                     "BRL":30472,
        //                     "RUB":467358
        //                 },
        //                 "timestamp":1574698617304,
        //                 "group_position":1
        //             },
        //         ]
        //     }
        //
        const tickers = this.safeValue (response, 'data', []);
        return this.parseTickers (tickers, symbols);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "time": 1566086400000,
        //         "close": 0.01895,
        //         "open": 0.01812427,
        //         "high": 0.0191588,
        //         "low": 0.01807001,
        //         "volume": 2588.597813750006
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPairId': market['id'],
            'candlesType': this.timeframes[timeframe], // default 1d
            // 'timeStart': 1574709092, // unix timestamp in seconds, required
            // 'timeEnd': 1574709092, // unix timestamp in seconds, required
            // 'limit': 100, // default 100, optional
            // 'offset' 100, // optional, pagination within timerange
        };
        if (limit === undefined) {
            limit = 100;
        } else {
            request['limit'] = limit;
        }
        const duration = this.parseTimeframe (timeframe);
        const timerange = limit * duration;
        if (since === undefined) {
            request['timeEnd'] = this.seconds ();
            request['timeStart'] = request['timeEnd'] - timerange;
        } else {
            request['timeStart'] = parseInt (since / 1000);
            request['timeEnd'] = this.sum (request['timeStart'], timerange);
        }
        const response = await this.publicGetChartCurrencyPairIdCandlesType (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "time": 1566086400000,
        //                 "close": 0.01895,
        //                 "open": 0.01812427,
        //                 "high": 0.0191588,
        //                 "low": 0.01807001,
        //                 "volume": 2588.597813750006
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "id": 35989317,
        //         "price": "0.02033813",
        //         "amount": "3.60000000",
        //         "type": "BUY",
        //         "timestamp": "1574713503"
        //     }
        //
        // private fetchMyTrades, fetchClosedOrder, fetchOrderTrades
        //
        //     {
        //         "id": 658745,
        //         "buy_order_id": 6587453,
        //         "sell_order_id": 6587459,
        //         "price": 0.012285,
        //         "amount": 6.35,
        //         "trade_type": "SELL",
        //         "timestamp": "1538737692"
        //     }
        //
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        let symbol = undefined;
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const side = this.safeStringLower2 (trade, 'type', 'trade_type');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPairId': market['id'],
            // 'sort': 'ASC', // ASC or DESC, default DESC
            // 'from': 1574709092, // unix timestamp, optional
            // 'till': 1574709092, // unix timestamp, optional
            // 'limit': 100, // default 100, optional
            // 'offset': 100, // optional
        };
        if (limit !== undefined) {
            request['limit'] = limit; // currently limited to 100 or fewer
        }
        if (since !== undefined) {
            request['sort'] = 'ASC'; // needed to make the from param work
            request['from'] = parseInt (since / 1000);
        }
        const response = await this.publicGetTradesCurrencyPairId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "id": 35989317,
        //                 "price": "0.02033813",
        //                 "amount": "3.60000000",
        //                 "type": "BUY",
        //                 "timestamp": "1574713503"
        //             },
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTradingFee (symbol, params = {}) {
        /**
         * @method
         * @name stex#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPairId': market['id'],
        };
        const response = await this.tradingGetFeesCurrencyPairId (this.extend (request, params));
        //
        //     {
        //         success: true,
        //         data: { buy_fee: '0.00200000', sell_fee: '0.00200000' },
        //         unified_message: { message_id: 'operation_successful', substitutions: [] }
        //      }
        //
        const data = this.safeValue (response, 'data');
        return {
            'info': response,
            'symbol': market['symbol'],
            'maker': this.safeNumber (data, 'sell_fee'),
            'taker': this.safeNumber (data, 'buy_fee'),
            'percentage': true,
            'tierBased': true,
        };
    }

    parseBalance (response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'currency_id'));
            const account = this.account ();
            account['free'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'frozen_balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name stex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        // await this.loadAccounts ();
        const response = await this.profileGetWallets (params);
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "id": null,
        //                 "currency_id": 665,
        //                 "delisted": false,
        //                 "disabled": false,
        //                 "disable_deposits": false,
        //                 "currency_code": "ORM",
        //                 "currency_name": "Orium",
        //                 "currency_type_id": 5,
        //                 "balance": "0",
        //                 "frozen_balance": "0",
        //                 "bonus_balance": "0",
        //                 "total_balance": "0",
        //                 "protocol_specific_settings": null,
        //                 "rates": { "BTC": "0.00000000020", "USD": "0.00000147" },
        //             },
        //             {
        //                 "id": null,
        //                 "currency_id": 272,
        //                 "delisted": false,
        //                 "disabled": false,
        //                 "disable_deposits": false,
        //                 "currency_code": "USDT",
        //                 "currency_name": "TetherUSD",
        //                 "currency_type_id": 23,
        //                 "balance": "0",
        //                 "frozen_balance": "0",
        //                 "bonus_balance": "0",
        //                 "total_balance": "0",
        //                 "protocol_specific_settings": [
        //                     { "protocol_name": "OMNI", "protocol_id": 10, "active": true, "withdrawal_fee_currency_id": 272, "withdrawal_fee_const": 10, "withdrawal_fee_percent": 0, "block_explorer_url": "https://omniexplorer.info/search/" },
        //                     { "protocol_name": "ERC20", "protocol_id": 5, "active": true, "withdrawal_fee_const": 1.2, "withdrawal_fee_percent": 0, "block_explorer_url": "https://etherscan.io/tx/" },
        //                     { "protocol_name": "TRON", "protocol_id": 24, "active": true, "withdrawal_fee_currency_id": 272, "withdrawal_fee_const": 0.2, "withdrawal_fee_percent": 0, "block_explorer_url": "https://tronscan.org/#/transaction/" }
        //                 ],
        //                 "rates": { "BTC": "0.00013893", "USD": "1" },
        //             },
        //         ]
        //     }
        //
        return this.parseBalance (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            'PROCESSING': 'open',
            'PENDING': 'open',
            'PARTIAL': 'open',
            'FINISHED': 'closed',
            'CANCELLED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, fetchOpenOrders, fetchClosedOrders, cancelOrder, fetchOrder, fetchClosedOrder
        //
        //     {
        //         "id": 828680665,
        //         "currency_pair_id": 1,
        //         "currency_pair_name": "NXT_BTC",
        //         "price": "0.011384",
        //         "trigger_price": 0.011385,
        //         "initial_amount": "13.942",
        //         "processed_amount": "3.724", // missing in fetchClosedOrder
        //         "type": "SELL",
        //         "original_type": "STOP_LIMIT_SELL",
        //         "created": "2019-01-17 10:14:48",
        //         "timestamp": "1547720088",
        //         "status": "PARTIAL"
        //         // fetchClosedOrder only
        //         "trades": [
        //             {
        //                 "id": 658745,
        //                 "buy_order_id": 658745,
        //                 "sell_order_id": 828680665,
        //                 "price": 0.012285,
        //                 "amount": 6.35,
        //                 "trade_type": "SELL",
        //                 "timestamp": "1538737692"
        //             }
        //         ],
        //         // fetchClosedOrder only
        //         "fees": [
        //             {
        //                 "id": 1234567,
        //                 "currency_id": 1,
        //                 "amount": 0.00025,
        //                 "timestamp": "1548149238"
        //             }
        //         ]
        //     }
        //
        const id = this.safeString (order, 'id');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString2 (order, 'currency_pair_id', 'currency_pair_name');
        const symbol = this.safeSymbol (marketId, market, '_');
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'initial_amount');
        const filled = this.safeString (order, 'processed_amount');
        let remaining = undefined;
        let cost = undefined;
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = Precise.stringSub (amount, filled);
                if (this.options['parseOrderToPrecision']) {
                    remaining = this.amountToPrecision (symbol, remaining);
                }
                remaining = Precise.stringMax (remaining, '0.0');
            }
            if (price !== undefined) {
                if (cost === undefined) {
                    cost = Precise.stringMul (price, filled);
                }
            }
        }
        let type = this.safeString (order, 'original_type');
        if ((type === 'BUY') || (type === 'SELL')) {
            type = undefined;
        }
        const side = this.safeStringLower (order, 'type');
        const trades = this.safeValue (order, 'trades');
        const stopPrice = this.safeNumber (order, 'trigger_price');
        const result = {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'trades': trades,
        };
        const fees = this.safeValue (order, 'fees');
        if (fees === undefined) {
            result['fee'] = undefined;
        } else {
            const numFees = fees.length;
            if (numFees > 0) {
                result['fees'] = [];
                for (let i = 0; i < fees.length; i++) {
                    const feeCost = this.safeString (fees[i], 'amount');
                    if (feeCost !== undefined) {
                        const feeCurrencyId = this.safeString (fees[i], 'currency_id');
                        const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
                        result['fees'].push ({
                            'cost': feeCost,
                            'currency': feeCurrencyCode,
                        });
                    }
                }
            } else {
                result['fee'] = undefined;
            }
        }
        return this.safeOrder (result, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name stex#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (type === 'market') {
            throw new ExchangeError (this.id + ' createOrder() allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (type === 'limit') {
            type = side;
        }
        const request = {
            'currencyPairId': market['id'],
            'type': type.toUpperCase (), // 'BUY', 'SELL', 'STOP_LIMIT_BUY', 'STOP_LIMIT_SELL'
            'amount': parseFloat (this.amountToPrecision (symbol, amount)), // required
            'price': parseFloat (this.priceToPrecision (symbol, price)), // required
            // 'trigger_price': 123.45 // required for STOP_LIMIT_BUY or STOP_LIMIT_SELL
        };
        const response = await this.tradingPostOrdersCurrencyPairId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "id": 828680665,
        //             "currency_pair_id": 1,
        //             "currency_pair_name": "NXT_BTC",
        //             "price": "0.011384",
        //             "trigger_price": 0.011385,
        //             "initial_amount": "13.942",
        //             "processed_amount": "3.724",
        //             "type": "SELL",
        //             "original_type": "STOP_LIMIT_SELL",
        //             "created": "2019-01-17 10:14:48",
        //             "timestamp": "1547720088",
        //             "status": "PARTIAL"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.tradingGetOrderOrderId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "id": 828680665,
        //             "currency_pair_id": 1,
        //             "currency_pair_name": "NXT_BTC",
        //             "price": "0.011384",
        //             "trigger_price": 0.011385,
        //             "initial_amount": "13.942",
        //             "processed_amount": "3.724",
        //             "type": "SELL",
        //             "original_type": "STOP_LIMIT_SELL",
        //             "created": "2019-01-17 10:14:48",
        //             "timestamp": "1547720088",
        //             "status": "PARTIAL"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrder (data, market);
    }

    async fetchClosedOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchClosedOrder
         * @description fetch an open order by it's id
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol, default is undefined
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.reportsGetOrdersOrderId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "id": 5478965,
        //             "currency_pair_id": 1,
        //             "currency_pair_name": "NXT_BTC",
        //             "price": "0.00013800",
        //             "initial_amount": "1.00000000",
        //             "type": "BUY",
        //             "created": "2019-01-22 09:27:17",
        //             "timestamp": 1548149237,
        //             "status": "FINISHED",
        //             "trades": [
        //                 {
        //                     "id": 658745,
        //                     "buy_order_id": 6587453,
        //                     "sell_order_id": 6587459,
        //                     "price": 0.012285,
        //                     "amount": 6.35,
        //                     "trade_type": "SELL",
        //                     "timestamp": "1538737692"
        //                 }
        //             ],
        //             "fees": [
        //                 {
        //                     "id": 1234567,
        //                     "currency_id": 1,
        //                     "amount": 0.00025,
        //                     "timestamp": "1548149238"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrder (data, market);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        const order = await this.fetchClosedOrder (id, symbol, params);
        return order['trades'];
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        let method = 'tradingGetOrders';
        const request = {
            // 'limit': 100, // default 100
            // 'offset': 100,
        };
        if (symbol !== undefined) {
            method = 'tradingGetOrdersCurrencyPairId';
            market = this.market (symbol);
            request['currencyPairId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "id": 828680665,
        //                 "currency_pair_id": 1,
        //                 "currency_pair_name": "NXT_BTC",
        //                 "price": "0.011384",
        //                 "trigger_price": 0.011385,
        //                 "initial_amount": "13.942",
        //                 "processed_amount": "3.724",
        //                 "type": "SELL",
        //                 "original_type": "STOP_LIMIT_SELL",
        //                 "created": "2019-01-17 10:14:48",
        //                 "timestamp": "1547720088",
        //                 "status": "PARTIAL"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name stex#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by stex cancelOrder ()
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.tradingDeleteOrderOrderId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "put_into_processing_queue": [
        //                 {
        //                     "id": 828680665,
        //                     "currency_pair_id": 1,
        //                     "currency_pair_name": "NXT_BTC",
        //                     "price": "0.011384",
        //                     "trigger_price": 0.011385,
        //                     "initial_amount": "13.942",
        //                     "processed_amount": "3.724",
        //                     "type": "SELL",
        //                     "original_type": "STOP_LIMIT_SELL",
        //                     "created": "2019-01-17 10:14:48",
        //                     "timestamp": "1547720088",
        //                     "status": "PARTIAL"
        //                 }
        //             ],
        //             "not_put_into_processing_queue": [
        //                 {
        //                     "id": 828680665,
        //                     "currency_pair_id": 1,
        //                     "currency_pair_name": "NXT_BTC",
        //                     "price": "0.011384",
        //                     "trigger_price": 0.011385,
        //                     "initial_amount": "13.942",
        //                     "processed_amount": "3.724",
        //                     "type": "SELL",
        //                     "original_type": "STOP_LIMIT_SELL",
        //                     "created": "2019-01-17 10:14:48",
        //                     "timestamp": "1547720088",
        //                     "status": "PARTIAL"
        //                 }
        //             ],
        //             "message": "string"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const acceptedOrders = this.safeValue (data, 'put_into_processing_queue', []);
        const rejectedOrders = this.safeValue (data, 'not_put_into_processing_queue', []);
        const numAcceptedOrders = acceptedOrders.length;
        const numRejectedOrders = rejectedOrders.length;
        if (numAcceptedOrders < 1) {
            if (numRejectedOrders < 1) {
                throw new OrderNotFound (this.id + ' cancelOrder() received an empty response: ' + this.json (response));
            } else {
                return this.parseOrder (rejectedOrders[0]);
            }
        } else {
            if (numRejectedOrders < 1) {
                return this.parseOrder (acceptedOrders[0]);
            } else {
                throw new OrderNotFound (this.id + ' cancelOrder() received an empty response: ' + this.json (response));
            }
        }
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name stex#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let method = 'tradingDeleteOrders';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['currencyPairId'] = market['id'];
            method = 'tradingDeleteOrdersCurrencyPairId';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "data":{
        //             "put_into_processing_queue":[],
        //             "not_put_into_processing_queue":[],
        //             "message":"Orders operations are handled in processing queue, therefore cancelling is not immediate."
        //         }
        //     }
        //
        return response;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPairId': market['id'],
            // 'timeStart': '2019-11-26T19:54:55.901Z', // datetime in iso format
            // 'timeEnd': '2019-11-26T19:54:55.901Z', // datetime in iso format
            // 'limit': 100, // default 100
            // 'offset': 100,
        };
        if (since !== undefined) {
            request['timeStart'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.reportsGetTradesCurrencyPairId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "id": 658745,
        //                 "buy_order_id": 6587453,
        //                 "sell_order_id": 6587459,
        //                 "price": 0.012285,
        //                 "amount": 6.35,
        //                 "trade_type": "SELL",
        //                 "timestamp": "1538737692"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async createDepositAddress (code, params = {}) {
        /**
         * @method
         * @name stex#createDepositAddress
         * @description create a currency deposit address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currencyId': currency['id'],
            // Default value is the value that represents legacy protocol.
            // In case of USDT it is 10 as Tether OMNI was the default previously.
            // The list of protocols can be obtained from the /public/currencies/{currencyId}
            // 'protocol_id': 10,
        };
        const response = await this.profilePostWalletsCurrencyId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "id": 45875,
        //             "currency_id": 1,
        //             "delisted": false,
        //             "disabled": false,
        //             "disable_deposits": false,
        //             "code": "BTC",
        //             "balance": "0.198752",
        //             "frozen_balance": "1.5784",
        //             "bonus_balance": "0.000",
        //             "deposit_address": {
        //                 "address": "0X12WERTYUIIJHGFVBNMJHGDFGHJ765SDFGHJ",
        //                 "address_name": "Address",
        //                 "additional_address_parameter": "qwertyuiopasdfghjkl",
        //                 "additional_address_parameter_name": "Destination Tag",
        //                 "notification": "",
        //                 "protocol_id": 10,
        //                 "protocol_name": "Tether OMNI",
        //                 "supports_new_address_creation": false
        //                 },
        //             "multi_deposit_addresses": [
        //                 {
        //                     "address": "0X12WERTYUIIJHGFVBNMJHGDFGHJ765SDFGHJ",
        //                     "address_name": "Address",
        //                     "additional_address_parameter": "qwertyuiopasdfghjkl",
        //                     "additional_address_parameter_name": "Destination Tag",
        //                     "notification": "",
        //                     "protocol_id": 10,
        //                     "protocol_name": "Tether OMNI",
        //                     "supports_new_address_creation": false
        //                 }
        //             ],
        //             "withdrawal_additional_field_name": "Payment ID (optional)",
        //             "rates": { "BTC": 0.000001 },
        //             "protocol_specific_settings": [
        //                 {
        //                     "protocol_name": "Tether OMNI",
        //                     "protocol_id": 10,
        //                     "active": true,
        //                     "withdrawal_fee_currency_id": 1,
        //                     "withdrawal_fee_const": 0.002,
        //                     "withdrawal_fee_percent": 0,
        //                     "block_explorer_url": "https://omniexplorer.info/search/"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const depositAddress = this.safeValue (data, 'deposit_address', {});
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString (depositAddress, 'additional_address_parameter');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name stex#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const balance = await this.fetchBalance ();
        const wallets = this.safeValue (balance['info'], 'data', []);
        const walletsByCurrencyId = this.indexBy (wallets, 'currency_id');
        const currency = this.currency (code);
        const wallet = this.safeValue (walletsByCurrencyId, currency['id']);
        if (wallet === undefined) {
            throw new ExchangeError (this.id + ' fetchDepositAddress() could not find the wallet id for currency code ' + code + ', try to call createDepositAddress() first');
        }
        const walletId = this.safeInteger (wallet, 'id');
        if (walletId === undefined) {
            throw new ExchangeError (this.id + ' fetchDepositAddress() could not find the wallet id for currency code ' + code + ', try to call createDepositAddress() first');
        }
        const request = {
            'walletId': walletId,
        };
        const response = await this.profileGetWalletsWalletId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "id": 45875,
        //             "currency_id": 1,
        //             "delisted": false,
        //             "disabled": false,
        //             "disable_deposits": false,
        //             "code": "BTC",
        //             "balance": "0.198752",
        //             "frozen_balance": "1.5784",
        //             "bonus_balance": "0.000",
        //             "deposit_address": {
        //                 "address": "0X12WERTYUIIJHGFVBNMJHGDFGHJ765SDFGHJ",
        //                 "address_name": "Address",
        //                 "additional_address_parameter": "qwertyuiopasdfghjkl",
        //                 "additional_address_parameter_name": "Destination Tag",
        //                 "notification": "",
        //                 "protocol_id": 10,
        //                 "protocol_name": "Tether OMNI",
        //                 "supports_new_address_creation": false
        //             },
        //             "multi_deposit_addresses": [
        //                 {
        //                     "address": "0X12WERTYUIIJHGFVBNMJHGDFGHJ765SDFGHJ",
        //                     "address_name": "Address",
        //                     "additional_address_parameter": "qwertyuiopasdfghjkl",
        //                     "additional_address_parameter_name": "Destination Tag",
        //                     "notification": "",
        //                     "protocol_id": 10,
        //                     "protocol_name": "Tether OMNI",
        //                     "supports_new_address_creation": false
        //                 }
        //             ],
        //             "withdrawal_additional_field_name": "Payment ID (optional)",
        //             "rates": { "BTC": 0.000001 },
        //             "protocol_specific_settings": [
        //                 {
        //                     "protocol_name": "Tether OMNI",
        //                     "protocol_id": 10,
        //                     "active": true,
        //                     "withdrawal_fee_currency_id": 1,
        //                     "withdrawal_fee_const": 0.002,
        //                     "withdrawal_fee_percent": 0,
        //                     "block_explorer_url": "https://omniexplorer.info/search/"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const depositAddress = this.safeValue (data, 'deposit_address', {});
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString (depositAddress, 'additional_address_parameter');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'] + '/' + api + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            headers = {
                'Authorization': 'Bearer ' + this.token,
            };
            if (method === 'GET' || method === 'DELETE') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                body = this.json (query);
                if (Object.keys (query).length) {
                    headers['Content-Type'] = 'application/json';
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'processing': 'pending',
            'checking by system': 'pending',
            'hodl': 'pending',
            'amount too low': 'failed',
            'not confirmed': 'pending',
            'cancelled by user': 'canceled',
            'approved': 'pending',
            'finished': 'ok',
            'withdrawal error': 'failed',
            'deposit error': 'failed',
            'cancelled by admin': 'canceled',
            'awaiting': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposit & fetchDeposits
        //
        //     {
        //         "id": 123654789,
        //         "currency_id": 1,
        //         "currency_code": "BTC",
        //         "deposit_fee_currency_id": 1,
        //         "deposit_fee_currency_code": "BTC",
        //         "amount": 0.25,
        //         "fee": 0.00025,
        //         "txid": "qwertyuhgfdsasdfgh",
        //         "protocol_id": 0,
        //         "deposit_status_id": 1,
        //         "status": "PROCESSING",
        //         "status_color": "#BC3D51",
        //         "created_at": "2018-11-28 12:32:08",
        //         "timestamp": "1543409389",
        //         "confirmations": "1 of 2"
        //     }
        //
        // fetchWithdrawal && fetchWithdrawals
        //
        //     {
        //         "id": 65899,
        //         "amount": "0.00600000",
        //         "currency_id": 1,
        //         "currency_code": "BTC",
        //         "fee": "0.00400000",
        //         "fee_currency_id": 1,
        //         "fee_currency_code": "BTC",
        //         "withdrawal_status_id": 1,
        //         "status": "Not Confirmed",
        //         "status_color": "#BC3D51",
        //         "created_at": "2019-01-21 09:36:05",
        //         "created_ts": "1548063365",
        //         "updated_at": "2019-01-21 09:36:05",
        //         "updated_ts": "1548063365",
        //         "txid": null,
        //         "protocol_id": 0,
        //         "withdrawal_address": {
        //             "address": "0X12WERTYUIIJHGFVBNMJHGDFGHJ765SDFGHJ",
        //             "address_name": "Address",
        //             "additional_address_parameter": "qwertyuiopasdfghjkl",
        //             "additional_address_parameter_name": "Destination Tag",
        //             "notification": "",
        //             "protocol_id": 10,
        //             "protocol_name": "Tether OMNI",
        //             "supports_new_address_creation": false
        //         }
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const withdrawalAddress = this.safeValue (transaction, 'withdrawal_address', {});
        const address = this.safeString (withdrawalAddress, 'address');
        const tag = this.safeString (withdrawalAddress, 'additional_address_parameter');
        const currencyId = this.safeString (transaction, 'currency_id');
        let code = undefined;
        if (currencyId in this.currencies_by_id) {
            currency = this.currencies_by_id[currencyId];
        } else {
            code = this.commonCurrencyCode (this.safeString (transaction, 'currency_code'));
        }
        if ((code === undefined) && (currency !== undefined)) {
            code = currency['code'];
        }
        const type = ('deposit_status_id' in transaction) ? 'deposit' : 'withdrawal';
        const amount = this.safeNumber (transaction, 'amount');
        const status = this.parseTransactionStatus (this.safeStringLower (transaction, 'status'));
        const timestamp = this.safeTimestamp2 (transaction, 'timestamp', 'created_ts');
        const updated = this.safeTimestamp (transaction, 'updated_ts');
        const txid = this.safeString (transaction, 'txid');
        let fee = undefined;
        const feeCost = this.safeNumber (transaction, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString2 (transaction, 'fee_currency_id', 'deposit_fee_currency_id');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const network = this.safeString (withdrawalAddress, 'protocol_name');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
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
            'updated': updated,
            'fee': fee,
        };
    }

    async fetchDeposit (id, code = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchDeposit
         * @description fetch information on a deposit
         * @param {string} id deposit id
         * @param {string|undefined} code not used by stex fetchDeposit ()
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.profileGetDepositsId (this.extend (request, params));
        //
        //     {
        //         success: true,
        //         data: {
        //             id: '21974074',
        //             currency_id: '272',
        //             block_explorer_url: 'https://omniexplorer.info/search/',
        //             currency_code: 'USDT',
        //             deposit_fee_currency_id: '272',
        //             deposit_fee_currency_code: 'USDT',
        //             amount: '11.00000000',
        //             fee: '0.00000000',
        //             deposit_status_id: '3',
        //             status: 'FINISHED',
        //             status_color: '#00BE75',
        //             txid: '15b50da4600a5021dbddaed8f4a71de093bf206ea66eb4ab2f151e3e9e2fed71',
        //             protocol_id: '24',
        //             confirmations: '129 of 20',
        //             created_at: '2022-05-16 16:38:40',
        //             timestamp: '1652719120',
        //             protocol_specific_settings: [{
        //                 protocol_name: 'TRON',
        //                 protocol_id: '24',
        //                 block_explorer_url: 'https://tronscan.org/#/transaction/'
        //             }]
        //         },
        //         unified_message: {
        //             message_id: 'operation_successful',
        //             substitutions: []
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransaction (data);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currencyId'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['timeStart'] = since;
        }
        const response = await this.profileGetDeposits (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "id": 123654789,
        //                 "currency_id": 1,
        //                 "currency_code": "BTC",
        //                 "deposit_fee_currency_id": 1,
        //                 "deposit_fee_currency_code": "BTC",
        //                 "amount": 0.25,
        //                 "fee": 0.00025,
        //                 "txid": "qwertyuhgfdsasdfgh",
        //                 "protocol_id": 0,
        //                 "deposit_status_id": 1,
        //                 "status": "PROCESSING",
        //                 "status_color": "#BC3D51",
        //                 "created_at": "2018-11-28 12:32:08",
        //                 "timestamp": "1543409389",
        //                 "confirmations": "1 of 2",
        //                 "protocol_specific_settings": {
        //                     "protocol_name": "Tether OMNI",
        //                     "protocol_id": 10,
        //                     "block_explorer_url": "https://omniexplorer.info/search/"
        //                 }
        //             }
        //         ]
        //     }
        //
        const deposits = this.safeValue (response, 'data', []);
        return this.parseTransactions (deposits, currency, since, limit);
    }

    async fetchWithdrawal (id, code = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchWithdrawal
         * @description fetch data on a currency withdrawal via the withdrawal id
         * @param {string} id withdrawal id
         * @param {string|undefined} code not used by stex.fetchWithdrawal
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.profileGetWithdrawalsId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "id": 65899,
        //             "amount": "0.00600000",
        //             "currency_id": 1,
        //             "currency_code": "BTC",
        //             "fee": "0.00400000",
        //             "fee_currency_id": 1,
        //             "fee_currency_code": "BTC",
        //             "withdrawal_status_id": 1,
        //             "status": "Not Confirmed",
        //             "status_color": "#BC3D51",
        //             "created_at": "2019-01-21 09:36:05",
        //             "created_ts": "1548063365",
        //             "updated_at": "2019-01-21 09:36:05",
        //             "updated_ts": "1548063365",
        //             "reason": "string",
        //             "txid": null,
        //             "protocol_id": 0,
        //             "withdrawal_address": {
        //                 "address": "0X12WERTYUIIJHGFVBNMJHGDFGHJ765SDFGHJ",
        //                 "address_name": "Address",
        //                 "additional_address_parameter": "qwertyuiopasdfghjkl",
        //                 "additional_address_parameter_name": "Destination Tag",
        //                 "notification": "",
        //                 "protocol_id": 10,
        //                 "protocol_name": "Tether OMNI",
        //                 "supports_new_address_creation": false
        //             },
        //             "protocol_specific_settings": {
        //                 "protocol_name": "Tether OMNI",
        //                 "protocol_id": 10,
        //                 "block_explorer_url": "https://omniexplorer.info/search/"
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransaction (data);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currencyId'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['timeStart'] = since;
        }
        const response = await this.profileGetWithdrawals (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "id": 65899,
        //                 "amount": "0.00600000",
        //                 "currency_id": 1,
        //                 "currency_code": "BTC",
        //                 "fee": "0.00400000",
        //                 "fee_currency_id": 1,
        //                 "fee_currency_code": "BTC",
        //                 "withdrawal_status_id": 1,
        //                 "status": "Not Confirmed",
        //                 "status_color": "#BC3D51",
        //                 "created_at": "2019-01-21 09:36:05",
        //                 "created_ts": "1548063365",
        //                 "updated_at": "2019-01-21 09:36:05",
        //                 "updated_ts": "1548063365",
        //                 "txid": null,
        //                 "protocol_id": 0,
        //                 "withdrawal_address": {
        //                     "address": "0X12WERTYUIIJHGFVBNMJHGDFGHJ765SDFGHJ",
        //                     "address_name": "Address",
        //                     "additional_address_parameter": "qwertyuiopasdfghjkl",
        //                     "additional_address_parameter_name": "Destination Tag",
        //                     "notification": "",
        //                     "protocol_id": 10,
        //                     "protocol_name": "Tether OMNI",
        //                     "supports_new_address_creation": false
        //                 },
        //                 "protocol_specific_settings": {
        //                     "protocol_name": "Tether OMNI",
        //                     "protocol_id": 10,
        //                     "block_explorer_url": "https://omniexplorer.info/search/"
        //                 }
        //             }
        //         ]
        //     }
        //
        const withdrawals = this.safeValue (response, 'data', []);
        return this.parseTransactions (withdrawals, currency, since, limit);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name stex#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        let method = undefined;
        const request = {};
        if (fromAccount === 'referal' && toAccount === 'spot') {
            request['currencyId'] = currency['id'];
            method = 'profilePostReferralBonusTransferCurrencyId';
        } else if (toAccount === 'hold') {
            request['walletId'] = fromAccount;
            amount = this.currencyToPrecision (code, amount);
            amount = Precise.stringNeg (amount);
            request['amount'] = amount;
            method = 'profilePostWalletsWalletIdHoldAmount';
        } else if (fromAccount === 'hold') {
            request['walletId'] = toAccount;
            request['amount'] = amount;
            method = 'profilePostWalletsWalletIdHoldAmount';
        } else {
            throw new ExchangeError (this.id + ' transfer() only allows transfers of referal to spot and between a walletId and funding');
        }
        const response = await this[method] (this.extend (request, params));
        //
        //  profilePostReferralBonusTransferCurrencyId
        //     {
        //         "success": true,
        //         "data": ""
        //     }
        //
        //  profilePostWalletsWalletIdHoldAmount
        //     {
        //         success: true,
        //         data: {
        //             id: '4055802',
        //             currency_id: '272',
        //             currency_code: 'USDT',
        //             currency_name: 'TetherUSD',
        //             balance: '10.00000000',
        //             frozen_balance: '0.00000000',
        //             bonus_balance: '0.00000000',
        //             hold_balance: '1.00000000',
        //             total_balance: '11.00000000',
        //             disable_deposits: false,
        //             disable_withdrawals: false,
        //             withdrawal_limit: '0.00000000',
        //             delisted: false,
        //             disabled: false,
        //             deposit_address: null,
        //             multi_deposit_addresses: [{
        //                 address: 'TYzhabfHWMLgLnMW46ZyUHkUVJPXaDgdxK',
        //                 address_name: 'Deposit Address',
        //                 additional_address_parameter: null,
        //                 additional_address_parameter_name: null,
        //                 notification: '',
        //                 protocol_id: '24',
        //                 protocol_name: 'TRON',
        //                 supports_new_address_creation: false
        //             }],
        //             contract_or_asset_id: '31',
        //             contract_field_name: null,
        //             withdrawal_additional_field_name: null,
        //             depo_message: '',
        //             wd_message: '',
        //             currency_type_id: '23',
        //             protocol_specific_settings: [{
        //                 {
        //                     protocol_name: 'ERC20',
        //                     protocol_id: '5',
        //                     active: true,
        //                     disable_deposits: false,
        //                     disable_withdrawals: false,
        //                     withdrawal_limit: '0',
        //                     deposit_fee_currency_id: '272',
        //                     deposit_fee_currency_code: 'USDT',
        //                     deposit_fee_percent: '0',
        //                     deposit_fee_const: '0',
        //                     withdrawal_fee_currency_id: '272',
        //                     withdrawal_fee_currency_code: 'USDT',
        //                     withdrawal_fee_const: '10',
        //                     withdrawal_fee_percent: '0',
        //                     block_explorer_url: 'https://etherscan.io/tx/',
        //                     contract_or_asset_id: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        //                     contract_field_name: '',
        //                     withdrawal_additional_field_name: '',
        //                     depo_message: '',
        //                     wd_message: ''
        //                 },
        //                 ...
        //             ],
        //             coin_info: {
        //                 twitter: 'https://twitter.com/Tether_to',
        //                 version: '',
        //                 facebook: 'https://www.facebook.com/tether.to',
        //                 telegram: '',
        //                 icon_large: 'https://app-coin-images.stex.com/large/usdt.png',
        //                 icon_small: 'https://app-coin-images.stex.com/small/usdt.png',
        //                 description: 'Tether (USDT) is a cryptocurrency with a value meant to mirror the value of the U.S. dollar. The idea was to create a stable cryptocurrency that can be used like digital dollars. Coins that serve this purpose of being a stable dollar substitute are called “stable coins.” Tether is the most popular stable coin and even acts as a dollar replacement on many popular exchanges! According to their site, Tether converts cash into digital currency, to anchor or “tether” the value of the coin to the price of national currencies like the US dollar, the Euro, and the Yen. Like other cryptos it uses blockchain. Unlike other cryptos, it is [according to the official Tether site] “100% backed by USD” (USD is held in reserve). The primary use of Tether is that it offers some stability to the otherwise volatile crypto space and offers liquidity to exchanges who can’t deal in dollars and with banks (for example to the sometimes controversial but leading exchange Bitfinex).The digital coins are issued by a company called Tether Limited that is governed by the laws of the British Virgin Islands, according to the legal part of its website. It is incorporated in Hong Kong. It has emerged that Jan Ludovicus van der Velde is the CEO of cryptocurrency exchange Bitfinex, which has been accused of being involved in the price manipulation of bitcoin, as well as tether. Many people trading on exchanges, including Bitfinex, will use tether to buy other cryptocurrencies like bitcoin. Tether Limited argues that using this method to buy virtual currencies allows users to move fiat in and out of an exchange more quickly and cheaply. Also, exchanges typically have rocky relationships with banks, and using Tether is a way to circumvent that.USDT is fairly simple to use. Once on exchanges like Poloniex or Bittrex, it can be used to purchase Bitcoin and other cryptocurrencies. It can be easily transferred from an exchange to any Omni Layer enabled wallet. Tether has no transaction fees, although external wallets and exchanges may charge one. In order to convert USDT to USD and vise versa through the Tether.to Platform, users must pay a small fee. Buying and selling Tether for Bitcoin can be done through a variety of exchanges like the ones mentioned previously or through the Tether.to platform, which also allows the conversion between USD to and from your bank account.',
        //                 official_site: 'https://tether.to/',
        //                 official_block_explorer: 'https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7'
        //             },
        //             rates: {
        //                 BTC: '0.00003372',
        //                 USD: '1'
        //             }
        //         },
        //         unified_message: {
        //             message_id: 'operation_successful',
        //             substitutions: []
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const transfer = this.parseTransfer (data, currency);
        const transferOptions = this.safeValue (this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeValue (transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
            if (typeof amount === 'string' && Precise.stringLt (amount, '0')) {
                amount = this.parseNumber (Precise.stringNeg (amount));
            }
            transfer['amount'] = amount;
            if (transfer['currency'] === undefined) {
                transfer['currency'] = code;
            }
        }
        return transfer;
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //     {
        //         "id": 45875,
        //         "currency_id": 1,
        //         "currency_code": "USDT",
        //         "currency_name": "TetherUSD",
        //         "balance": "0.198752",
        //         "frozen_balance": "1.5784",
        //         "bonus_balance": "0.000",
        //         "hold_balance": "0.000",
        //         "total_balance": "1.777152",
        //         "disable_deposits": false,
        //         "disable_withdrawals": false,
        //         "withdrawal_limit": "string",
        //         "delisted": false,
        //         "disabled": false,
        //         "deposit_address": {
        //             "address": "0X12WERTYUIIJHGFVBNMJHGDFGHJ765SDFGHJ",
        //             "address_name": "Address",
        //             "additional_address_parameter": "qwertyuiopasdfghjkl",
        //             "additional_address_parameter_name": "Destination Tag",
        //             "notification": "",
        //             "protocol_id": 10,
        //             "protocol_name": "Tether OMNI",
        //             "supports_new_address_creation": false
        //         },
        //         "multi_deposit_addresses": [{
        //             "address": "0X12WERTYUIIJHGFVBNMJHGDFGHJ765SDFGHJ",
        //             "address_name": "Address",
        //             "additional_address_parameter": "qwertyuiopasdfghjkl",
        //             "additional_address_parameter_name": "Destination Tag",
        //             "notification": "",
        //             "protocol_id": 10,
        //             "protocol_name": "Tether OMNI",
        //             "supports_new_address_creation": false
        //         }],
        //         "withdrawal_additional_field_name": "Payment ID (optional)",
        //         "currency_type_id": 23,
        //         "protocol_specific_settings": [{
        //             "protocol_name": "Tether OMNI",
        //             "protocol_id": 10,
        //             "active": true,
        //             "disable_deposits": false,
        //             "disable_withdrawals": false,
        //             "withdrawal_limit": 0,
        //             "deposit_fee_currency_id": 272,
        //             "deposit_fee_currency_code": "USDT",
        //             "deposit_fee_percent": 0,
        //             "deposit_fee_const": 0,
        //             "withdrawal_fee_currency_id": 1,
        //             "withdrawal_fee_currency_code": "USDT",
        //             "withdrawal_fee_const": 0.002,
        //             "withdrawal_fee_percent": 0,
        //             "block_explorer_url": "https://omniexplorer.info/search/",
        //             "withdrawal_additional_field_name": ""
        //         }],
        //         "coin_info": {
        //             "twitter": "https://twitter.com/btc",
        //             "version": "",
        //             "facebook": "https://www.facebook.com/bitcoins",
        //             "telegram": "",
        //             "icon_large": "https://app-coin-images.stex.com/large/btc.png",
        //             "icon_small": "https://app-coin-images.stex.com/small/btc.png",
        //             "description": "Bitcoin is the first successful internet money based on peer-to-peer technology;....",
        //             "official_site": "http://www.bitcoin.org",
        //             "official_block_explorer": "https://blockchair.com/bitcoin/"
        //         },
        //         "rates": {
        //             "BTC": 0.000001
        //         }
        //     }
        //
        const currencyId = this.safeString (transfer, 'currency_id');
        let code = undefined;
        if (currencyId in this.currencies_by_id) {
            currency = this.currencies_by_id[currencyId];
        } else {
            code = this.commonCurrencyCode (this.safeString (transfer, 'currency_code'));
        }
        if (code === undefined) {
            code = this.safeValue (currency, 'code');
        }
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'id'),
            'timestamp': undefined,
            'datetime': undefined,
            'currency': code,
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name stex#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency_id': currency['id'],
            'amount': parseFloat (this.currencyToPrecision (code, amount)),
            'address': address,
            // 'protocol_id': 10, // optional, to be used with multicurrency wallets like USDT
            // 'additional_address_parameter': tag, // optional
        };
        if (tag !== undefined) {
            request['additional_address_parameter'] = tag;
        }
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeInteger (networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['protocol_id'] = network;
            params = this.omit (params, 'network');
        }
        const response = await this.profilePostWithdraw (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "id": 65899,
        //             "amount": "0.00600000",
        //             "currency_id": 1,
        //             "currency_code": "BTC",
        //             "fee": "0.00400000",
        //             "fee_currency_id": 1,
        //             "fee_currency_code": "BTC",
        //             "withdrawal_status_id": 1,
        //             "status": "Not Confirmed",
        //             "status_color": "#BC3D51",
        //             "created_at": "2019-01-21 09:36:05",
        //             "created_ts": "1548063365",
        //             "updated_at": "2019-01-21 09:36:05",
        //             "updated_ts": "1548063365",
        //             "txid": null,
        //             "protocol_id": 0,
        //             "withdrawal_address": {
        //                 "address": "0X12WERTYUIIJHGFVBNMJHGDFGHJ765SDFGHJ",
        //                 "address_name": "Address",
        //                 "additional_address_parameter": "qwertyuiopasdfghjkl",
        //                 "additional_address_parameter_name": "Destination Tag",
        //                 "notification": "",
        //                 "protocol_id": 10,
        //                 "protocol_name": "Tether OMNI",
        //                 "supports_new_address_creation": false
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransaction (data, currency);
    }

    async fetchTransactionFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchTransactionFees
         * @description *DEPRECATED* please use fetchDepositWithdrawFees instead
         * @see https://apidocs.stex.com/#tag/Public/paths/~1public~1currencies/get
         * @param {[string]|undefined} codes list of unified currency codes
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "id": 1,
        //                 "code": "BTC",
        //                 "name": "Bitcoin",
        //                 "active": true,
        //                 "delisted": false,
        //                 "precision": 8,
        //                 "minimum_tx_confirmations": 24,
        //                 "minimum_withdrawal_amount": "0.009",
        //                 "minimum_deposit_amount": "0.000003",
        //                 "deposit_fee_currency_id": 1,
        //                 "deposit_fee_currency_code": "ETH",
        //                 "deposit_fee_const": "0.00001",
        //                 "deposit_fee_percent": "0",
        //                 "withdrawal_fee_currency_id": 1,
        //                 "withdrawal_fee_currency_code": "ETH",
        //                 "withdrawal_fee_const": "0.0015",
        //                 "withdrawal_fee_percent": "0",
        //                 "withdrawal_limit": "string",
        //                 "block_explorer_url": "https://blockchain.info/tx/",
        //                 "protocol_specific_settings": [
        //                     {
        //                         "protocol_name": "Tether OMNI",
        //                         "protocol_id": 10,
        //                         "active": true,
        //                         "withdrawal_fee_currency_id": 1,
        //                         "withdrawal_fee_const": 0.002,
        //                         "withdrawal_fee_percent": 0,
        //                         "block_explorer_url": "https://omniexplorer.info/search/"
        //                     }
        //                 ]
        //             }
        //         ]
        //     }
        //
        const currencyKeys = Object.keys (this.currencies);
        const result = {};
        for (let i = 0; i < currencyKeys.length; i++) {
            const code = currencyKeys[i];
            const currency = this.currencies[code];
            if (codes !== undefined && !this.inArray (code, codes)) {
                continue;
            }
            const info = this.safeValue (currency, 'info');
            result[code] = {
                'withdraw': this.safeNumber (currency, 'fee'),
                'deposit': this.safeNumber (info, 'deposit_fee_const'),
                'info': info,
            };
        }
        return result;
    }

    async fetchDepositWithdrawFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name stex#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://apidocs.stex.com/#tag/Public/paths/~1public~1currencies/get
         * @param {[string]|undefined} codes list of unified currency codes
         * @param {object} params extra parameters specific to the stex api endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetCurrencies (params);
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "id": 1,
        //                 "code": "BTC",
        //                 "name": "Bitcoin",
        //                 "active": true,
        //                 "delisted": false,
        //                 "precision": 8,
        //                 "minimum_tx_confirmations": 24,
        //                 "minimum_withdrawal_amount": "0.009",
        //                 "minimum_deposit_amount": "0.000003",
        //                 "deposit_fee_currency_id": 1,
        //                 "deposit_fee_currency_code": "ETH",
        //                 "deposit_fee_const": "0.00001",
        //                 "deposit_fee_percent": "0",
        //                 "withdrawal_fee_currency_id": 1,
        //                 "withdrawal_fee_currency_code": "ETH",
        //                 "withdrawal_fee_const": "0.0015",
        //                 "withdrawal_fee_percent": "0",
        //                 "withdrawal_limit": "string",
        //                 "block_explorer_url": "https://blockchain.info/tx/",
        //                 "protocol_specific_settings": [
        //                     {
        //                         "protocol_name": "Tether OMNI",
        //                         "protocol_id": 10,
        //                         "active": true,
        //                         "withdrawal_fee_currency_id": 1,
        //                         "withdrawal_fee_const": 0.002,
        //                         "withdrawal_fee_percent": 0,
        //                         "block_explorer_url": "https://omniexplorer.info/search/"
        //                     }
        //                 ]
        //             }
        //             ...
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseDepositWithdrawFees (data, codes, 'code');
    }

    parseDepositWithdrawFee (fee, currency = undefined) {
        //
        //    {
        //        "id": 1,
        //        "code": "BTC",
        //        "name": "Bitcoin",
        //        "active": true,
        //        "delisted": false,
        //        "precision": 8,
        //        "minimum_tx_confirmations": 24,
        //        "minimum_withdrawal_amount": "0.009",
        //        "minimum_deposit_amount": "0.000003",
        //        "deposit_fee_currency_id": 1,
        //        "deposit_fee_currency_code": "ETH",
        //        "deposit_fee_const": "0.00001",
        //        "deposit_fee_percent": "0",
        //        "withdrawal_fee_currency_id": 1,
        //        "withdrawal_fee_currency_code": "ETH",
        //        "withdrawal_fee_const": "0.0015",
        //        "withdrawal_fee_percent": "0",
        //        "withdrawal_limit": "string",
        //        "block_explorer_url": "https://blockchain.info/tx/",
        //        "protocol_specific_settings": [
        //            {
        //                "protocol_name": "Tether OMNI",
        //                "protocol_id": 10,
        //                "active": true,
        //                "withdrawal_fee_currency_id": 1,
        //                "withdrawal_fee_const": 0.002,
        //                "withdrawal_fee_percent": 0,
        //                "block_explorer_url": "https://omniexplorer.info/search/"
        //            }
        //        ]
        //    }
        //
        const result = {
            'withdraw': {
                'fee': this.safeNumber (fee, 'withdrawal_fee_const'),
                'percentage': false,
            },
            'deposit': {
                'fee': this.safeNumber (fee, 'deposit_fee_const'),
                'percentage': false,
            },
            'networks': {},
        };
        const networks = this.safeValue (fee, 'protocol_specific_settings', []);
        for (let i = 0; i < networks.length; i++) {
            const network = networks[i];
            const networkId = this.safeString (network, 'protocol_name');
            const networkCode = this.networkIdToCode (networkId);
            result['networks'][networkCode] = {
                'withdraw': {
                    'fee': this.safeNumber (network, 'withdrawal_fee_const'),
                    'percentage': false,
                },
                'deposit': {
                    'fee': undefined,
                    'percentage': undefined,
                },
            };
        }
        return result;
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"success":false,"message":"Wrong parameters","errors":{"candleType":["Invalid Candle Type!"]}}
        //     {"success":false,"message":"Wrong parameters","errors":{"time":["timeStart or timeEnd is less then 1"]}}
        //     {"success":false,"message":"Not enough  ETH"}
        //
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            const message = this.safeString (response, 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
