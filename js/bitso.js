'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidNonce, AuthenticationError, OrderNotFound, NotSupported, BadRequest, ArgumentsRequired } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bitso extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitso',
            'name': 'Bitso',
            'countries': [ 'MX' ], // Mexico
            'rateLimit': 2000, // 30 requests per minute
            'version': 'v3',
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
                'cancelOrders': true,
                'createDepositAddress': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': false,
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
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactionFee': false,
                'fetchTransactionFees': true,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87295554-11f98280-c50e-11ea-80d6-15b3bafa8cbf.jpg',
                'api': {
                    'rest': 'https://api.bitso.com',
                },
                'www': 'https://bitso.com',
                'doc': 'https://bitso.com/api_info',
                'fees': 'https://bitso.com/fees',
                'referral': 'https://bitso.com/?ref=itej',
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'precision': {
                    'XRP': 0.000001,
                    'MXN': 0.01,
                    'TUSD': 0.01,
                },
                'defaultPrecision': 0.00000001,
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '1h': '3600',
                '4h': '14400',
                '12h': '43200',
                '1d': '86400',
                '1w': '604800',
            },
            'api': {
                'public': {
                    'get': [
                        'available_books',
                        'ticker',
                        'order_book',
                        'trades',
                        'ohlc',
                    ],
                },
                'private': {
                    'get': [
                        'account_status',
                        'balance',
                        'fees',
                        'fundings',
                        'fundings/{fid}',
                        'funding_destination',
                        'kyc_documents',
                        'ledger',
                        'ledger/trades',
                        'ledger/fees',
                        'ledger/fundings',
                        'ledger/withdrawals',
                        'mx_bank_codes',
                        'open_orders',
                        'order_trades/{oid}',
                        'orders/{oid}',
                        'user_trades',
                        'user_trades/{tid}',
                        'withdrawals/',
                        'withdrawals/{wid}',
                    ],
                    'post': [
                        'bitcoin_withdrawal',
                        'debit_card_withdrawal',
                        'ether_withdrawal',
                        'ripple_withdrawal',
                        'bcash_withdrawal',
                        'litecoin_withdrawal',
                        'orders',
                        'phone_number',
                        'phone_verification',
                        'phone_withdrawal',
                        'spei_withdrawal',
                        'ripple_withdrawal',
                        'bcash_withdrawal',
                        'litecoin_withdrawal',
                    ],
                    'delete': [
                        'orders',
                        'orders/{oid}',
                        'orders/all',
                    ],
                },
            },
            'exceptions': {
                '0201': AuthenticationError, // Invalid Nonce or Invalid Credentials
                '104': InvalidNonce, // Cannot perform request - nonce must be higher than 1520307203724237
                '0304': BadRequest, // {"success":false,"error":{"code":"0304","message":"The field time_bucket () is either invalid or missing"}}
            },
        });
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitso#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetLedger (this.extend (request, params));
        //
        //     {
        //         success: true,
        //         payload: [{
        //             eid: '2510b3e2bc1c87f584500a18084f35ed',
        //             created_at: '2022-06-08T12:21:42+0000',
        //             balance_updates: [{
        //                 amount: '0.00080000',
        //                 currency: 'btc'
        //             }],
        //             operation: 'funding',
        //             details: {
        //                 network: 'btc',
        //                 method: 'btc',
        //                 method_name: 'Bitcoin',
        //                 asset: 'btc',
        //                 protocol: 'btc',
        //                 integration: 'bitgo-v2',
        //                 fid: '6112c6369100d6ecceb7f54f17cf0511'
        //             }
        //         }]
        //     }
        //
        const payload = this.safeValue (response, 'payload', []);
        return this.parseLedger (payload, code, since, limit);
    }

    parseLedgerEntryType (type) {
        const types = {
            'funding': 'transaction',
            'withdrawal': 'transaction',
            'trade': 'trade',
            'fee': 'fee',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         eid: '2510b3e2bc1c87f584500a18084f35ed',
        //         created_at: '2022-06-08T12:21:42+0000',
        //         balance_updates: [{
        //             amount: '0.00080000',
        //             currency: 'btc'
        //         }],
        //         operation: 'funding',
        //         details: {
        //             network: 'btc',
        //             method: 'btc',
        //             method_name: 'Bitcoin',
        //             asset: 'btc',
        //             protocol: 'btc',
        //             integration: 'bitgo-v2',
        //             fid: '6112c6369100d6ecceb7f54f17cf0511'
        //         }
        //     }
        //
        //  trade
        //     {
        //         eid: '8976c6053f078f704f037d82a813678a',
        //         created_at: '2022-06-08T17:01:48+0000',
        //         balance_updates: [{
        //                 amount: '59.21320500',
        //                 currency: 'mxn'
        //             },
        //             {
        //                 amount: '-0.00010000',
        //                 currency: 'btc'
        //             }
        //         ],
        //         operation: 'trade',
        //         details: {
        //             tid: '72145428',
        //             oid: 'JO5TZmMZjzjlZDyT'
        //         }
        //     }
        //
        //  fee
        //     {
        //         eid: 'cbbb3c8d4e41723d25d2850dcb7c3c74',
        //         created_at: '2022-06-08T17:01:48+0000',
        //         balance_updates: [{
        //             amount: '-0.38488583',
        //             currency: 'mxn'
        //         }],
        //         operation: 'fee',
        //         details: {
        //             tid: '72145428',
        //             oid: 'JO5TZmMZjzjlZDyT'
        //         }
        //     }
        const operation = this.safeString (item, 'operation');
        const type = this.parseLedgerEntryType (operation);
        const balanceUpdates = this.safeValue (item, 'balance_updates', []);
        const firstBalance = this.safeValue (balanceUpdates, 0, {});
        let direction = undefined;
        let fee = undefined;
        const amount = this.safeString (firstBalance, 'amount');
        const currencyId = this.safeString (firstBalance, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const details = this.safeValue (item, 'details', {});
        let referenceId = this.safeString2 (details, 'fid', 'wid');
        if (referenceId === undefined) {
            referenceId = this.safeString (details, 'tid');
        }
        if (operation === 'funding') {
            direction = 'in';
        } else if (operation === 'withdrawal') {
            direction = 'out';
        } else if (operation === 'trade') {
            direction = undefined;
        } else if (operation === 'fee') {
            direction = 'out';
            const cost = Precise.stringAbs (amount);
            fee = {
                'cost': cost,
                'currency': currency,
            };
        }
        const timestamp = this.parse8601 (this.safeString (item, 'created_at'));
        return this.safeLedgerEntry ({
            'id': this.safeString (item, 'eid'),
            'direction': direction,
            'account': undefined,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': undefined,
            'after': undefined,
            'status': 'ok',
            'fee': fee,
            'info': item,
        }, currency);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitso#fetchMarkets
         * @description retrieves data on all markets for bitso
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetAvailableBooks (params);
        //
        //     {
        //         "success":true,
        //         "payload":[
        //             {
        //                 "book":"btc_mxn",
        //                 "minimum_price":"500",
        //                 "maximum_price":"10000000",
        //                 "minimum_amount":"0.00005",
        //                 "maximum_amount":"500",
        //                 "minimum_value":"5",
        //                 "maximum_value":"10000000",
        //                 "tick_size":"0.01",
        //                 "fees":{
        //                     "flat_rate":{"maker":"0.500","taker":"0.650"},
        //                     "structure":[
        //                         {"volume":"1500000","maker":"0.00500","taker":"0.00650"},
        //                         {"volume":"2000000","maker":"0.00490","taker":"0.00637"},
        //                         {"volume":"5000000","maker":"0.00480","taker":"0.00624"},
        //                         {"volume":"7000000","maker":"0.00440","taker":"0.00572"},
        //                         {"volume":"10000000","maker":"0.00420","taker":"0.00546"},
        //                         {"volume":"15000000","maker":"0.00400","taker":"0.00520"},
        //                         {"volume":"35000000","maker":"0.00370","taker":"0.00481"},
        //                         {"volume":"50000000","maker":"0.00300","taker":"0.00390"},
        //                         {"volume":"150000000","maker":"0.00200","taker":"0.00260"},
        //                         {"volume":"250000000","maker":"0.00100","taker":"0.00130"},
        //                         {"volume":"9999999999","maker":"0.00000","taker":"0.00130"},
        //                     ]
        //                 }
        //             },
        //         ]
        //     }
        const markets = this.safeValue (response, 'payload', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'book');
            const [ baseId, quoteId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const fees = this.safeValue (market, 'fees', {});
            const flatRate = this.safeValue (fees, 'flat_rate', {});
            const takerString = this.safeString (flatRate, 'taker');
            const makerString = this.safeString (flatRate, 'maker');
            const taker = this.parseNumber (Precise.stringDiv (takerString, '100'));
            const maker = this.parseNumber (Precise.stringDiv (makerString, '100'));
            const feeTiers = this.safeValue (fees, 'structure', []);
            const fee = {
                'taker': taker,
                'maker': maker,
                'percentage': true,
                'tierBased': true,
            };
            const takerFees = [];
            const makerFees = [];
            for (let j = 0; j < feeTiers.length; j++) {
                const tier = feeTiers[j];
                const volume = this.safeNumber (tier, 'volume');
                const takerFee = this.safeNumber (tier, 'taker');
                const makerFee = this.safeNumber (tier, 'maker');
                takerFees.push ([ volume, takerFee ]);
                makerFees.push ([ volume, makerFee ]);
                if (j === 0) {
                    fee['taker'] = takerFee;
                    fee['maker'] = makerFee;
                }
            }
            const tiers = {
                'taker': takerFees,
                'maker': makerFees,
            };
            fee['tiers'] = tiers;
            // TODO: precisions can be also set from https://bitso.com/api/v3/catalogues ->available_currency_conversions->currencies (or ->currencies->metadata)  or https://bitso.com/api/v3/get_exchange_rates/mxn
            const defaultPricePrecision = this.safeNumber (this.options['precision'], quote, this.options['defaultPrecision']);
            result.push (this.extend ({
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
                'taker': taker,
                'maker': maker,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (this.options['precision'], base, this.options['defaultPrecision']),
                    'price': this.safeNumber (market, 'tick_size', defaultPricePrecision),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minimum_amount'),
                        'max': this.safeNumber (market, 'maximum_amount'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'minimum_price'),
                        'max': this.safeNumber (market, 'maximum_price'),
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minimum_value'),
                        'max': this.safeNumber (market, 'maximum_value'),
                    },
                },
                'info': market,
            }, fee));
        }
        return result;
    }

    parseBalance (response) {
        const payload = this.safeValue (response, 'payload', {});
        const balances = this.safeValue (payload, 'balances', []);
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'locked');
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bitso#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        //
        //     {
        //       "success": true,
        //       "payload": {
        //         "balances": [
        //           {
        //             "currency": "bat",
        //             "available": "0.00000000",
        //             "locked": "0.00000000",
        //             "total": "0.00000000",
        //             "pending_deposit": "0.00000000",
        //             "pending_withdrawal": "0.00000000"
        //           },
        //           {
        //             "currency": "bch",
        //             "available": "0.00000000",
        //             "locked": "0.00000000",
        //             "total": "0.00000000",
        //             "pending_deposit": "0.00000000",
        //             "pending_withdrawal": "0.00000000"
        //           },
        //         ],
        //       },
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitso#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'book': market['id'],
        };
        const response = await this.publicGetOrderBook (this.extend (request, params));
        const orderbook = this.safeValue (response, 'payload');
        const timestamp = this.parse8601 (this.safeString (orderbook, 'updated_at'));
        return this.parseOrderBook (orderbook, market['symbol'], timestamp, 'bids', 'asks', 'price', 'amount');
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "high":"37446.85",
        //         "last":"36599.54",
        //         "created_at":"2022-01-28T12:06:11+00:00",
        //         "book":"btc_usdt",
        //         "volume":"7.29075419",
        //         "vwap":"36579.1564400307",
        //         "low":"35578.52",
        //         "ask":"36574.76",
        //         "bid":"36538.22",
        //         "change_24":"-105.64"
        //     }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.parse8601 (this.safeString (ticker, 'created_at'));
        const vwap = this.safeString (ticker, 'vwap');
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = Precise.stringMul (baseVolume, vwap);
        const last = this.safeString (ticker, 'last');
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
            'vwap': vwap,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bitso#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'book': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const ticker = this.safeValue (response, 'payload');
        //
        //     {
        //         "success":true,
        //         "payload":{
        //             "high":"37446.85",
        //             "last":"37051.96",
        //             "created_at":"2022-01-28T17:03:29+00:00",
        //             "book":"btc_usdt",
        //             "volume":"6.16176186",
        //             "vwap":"36582.6293169472",
        //             "low":"35578.52",
        //             "ask":"37083.62",
        //             "bid":"37039.66",
        //             "change_24":"478.45"
        //         }
        //     }
        //
        return this.parseTicker (ticker, market);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitso#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'book': market['id'],
            'time_bucket': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['start'] = since;
            if (limit !== undefined) {
                const duration = this.parseTimeframe (timeframe);
                request['end'] = this.sum (since, duration * limit * 1000);
            }
        } else if (limit !== undefined) {
            const now = this.milliseconds ();
            request['end'] = now;
            request['start'] = now - this.parseTimeframe (timeframe) * 1000 * limit;
        }
        const response = await this.publicGetOhlc (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "payload": [
        //             {
        //                 "bucket_start_time":1648219140000,
        //                 "first_trade_time":1648219154990,
        //                 "last_trade_time":1648219189441,
        //                 "first_rate":"44958.60",
        //                 "last_rate":"44979.88",
        //                 "min_rate":"44957.33",
        //                 "max_rate":"44979.88",
        //                 "trade_count":8,
        //                 "volume":"0.00082814",
        //                 "vwap":"44965.02"
        //             },
        //         ]
        //     }
        //
        const payload = this.safeValue (response, 'payload', []);
        return this.parseOHLCVs (payload, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m') {
        //
        //     {
        //         "bucket_start_time":1648219140000,
        //         "first_trade_time":1648219154990,
        //         "last_trade_time":1648219189441,
        //         "first_rate":"44958.60",
        //         "last_rate":"44979.88",
        //         "min_rate":"44957.33",
        //         "max_rate":"44979.88",
        //         "trade_count":8,
        //         "volume":"0.00082814",
        //         "vwap":"44965.02"
        //     },
        //
        return [
            this.safeInteger (ohlcv, 'bucket_start_time'),
            this.safeNumber (ohlcv, 'first_rate'),
            this.safeNumber (ohlcv, 'max_rate'),
            this.safeNumber (ohlcv, 'min_rate'),
            this.safeNumber (ohlcv, 'last_rate'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      {
        //          "book": "btc_usdt",
        //          "created_at": "2021-11-24T12:14:53+0000",
        //          "amount": "0.00026562",
        //          "maker_side": "sell",
        //          "price": "56471.55",
        //          "tid": "52557338"
        //      }
        //
        // fetchMyTrades (private)
        //
        //      {
        //          "book": "btc_usdt",
        //          "created_at": "2021-11-24T12:31:03+0000",
        //          "minor": "11.30356000",
        //          "major": "-0.00020000",
        //          "fees_amount": "0.01119052",
        //          "fees_currency": "usdt",
        //          "minor_currency": "usdt",
        //          "major_currency": "btc",
        //          "oid": "djTzMIWx2Vi3iMjl",
        //          "tid": "52559051",
        //          "price": "56517.80",
        //          "side": "sell",
        //          "maker_side": "buy"
        //      }
        //
        // fetchOrderTrades (private)
        //
        //      {
        //          "book": "btc_usdt",
        //          "created_at": "2021-11-24T12:30:52+0000",
        //          "minor": "-11.33047916",
        //          "major": "0.00020020",
        //          "fees_amount": "0.00000020",
        //          "fees_currency": "btc",
        //          "minor_currency": "usdt",
        //          "major_currency": "btc",
        //          "oid": "O0D2zcljjjQF5xlG",
        //          "tid": "52559030",
        //          "price": "56595.80",
        //          "side": "buy",
        //          "maker_side": "sell"
        //      }
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        const marketId = this.safeString (trade, 'book');
        const symbol = this.safeSymbol (marketId, market, '_');
        const side = this.safeString2 (trade, 'side', 'maker_side');
        const makerSide = this.safeString (trade, 'maker_side');
        let takerOrMaker = undefined;
        if (side === makerSide) {
            takerOrMaker = 'maker';
        } else {
            takerOrMaker = 'taker';
        }
        let amount = this.safeString2 (trade, 'amount', 'major');
        if (amount !== undefined) {
            amount = Precise.stringAbs (amount);
        }
        let fee = undefined;
        const feeCost = this.safeString (trade, 'fees_amount');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fees_currency');
            const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        let cost = this.safeString (trade, 'minor');
        if (cost !== undefined) {
            cost = Precise.stringAbs (cost);
        }
        const price = this.safeString (trade, 'price');
        const orderId = this.safeString (trade, 'oid');
        const id = this.safeString (trade, 'tid');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitso#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'book': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response['payload'], market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name bitso#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.privateGetFees (params);
        //
        //    {
        //        success: true,
        //        payload: {
        //            fees: [
        //                {
        //                    book: 'btc_mxn',
        //                    fee_percent: '0.6500',
        //                    fee_decimal: '0.00650000',
        //                    taker_fee_percent: '0.6500',
        //                    taker_fee_decimal: '0.00650000',
        //                    maker_fee_percent: '0.5000',
        //                    maker_fee_decimal: '0.00500000',
        //                    volume_currency: 'mxn',
        //                    current_volume: '0.00',
        //                    next_volume: '1500000.00',
        //                    next_maker_fee_percent: '0.490',
        //                    next_taker_fee_percent: '0.637',
        //                    nextVolume: '1500000.00',
        //                    nextFee: '0.490',
        //                    nextTakerFee: '0.637'
        //                },
        //                ...
        //            ],
        //            deposit_fees: [
        //                {
        //                    currency: 'btc',
        //                    method: 'rewards',
        //                    fee: '0.00',
        //                    is_fixed: false
        //                },
        //                ...
        //            ],
        //            withdrawal_fees: {
        //                ada: '0.20958100',
        //                bch: '0.00009437',
        //                ars: '0',
        //                btc: '0.00001209',
        //                ...
        //            }
        //        }
        //    }
        //
        const payload = this.safeValue (response, 'payload', {});
        const fees = this.safeValue (payload, 'fees', []);
        const result = {};
        for (let i = 0; i < fees.length; i++) {
            const fee = fees[i];
            const marketId = this.safeString (fee, 'book');
            const symbol = this.safeSymbol (marketId, undefined, '_');
            result[symbol] = {
                'info': fee,
                'symbol': symbol,
                'maker': this.safeNumber (fee, 'maker_fee_decimal'),
                'taker': this.safeNumber (fee, 'taker_fee_decimal'),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = 25, params = {}) {
        /**
         * @method
         * @name bitso#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        // the don't support fetching trades starting from a date yet
        // use the `marker` extra param for that
        // this is not a typo, the variable name is 'marker' (don't confuse with 'market')
        const markerInParams = ('marker' in params);
        // warn the user with an exception if the user wants to filter
        // starting from since timestamp, but does not set the trade id with an extra 'marker' param
        if ((since !== undefined) && !markerInParams) {
            throw new ExchangeError (this.id + ' fetchMyTrades() does not support fetching trades starting from a timestamp with the `since` argument, use the `marker` extra param to filter starting from an integer trade id');
        }
        // convert it to an integer unconditionally
        if (markerInParams) {
            params = this.extend (params, {
                'marker': parseInt (params['marker']),
            });
        }
        const request = {
            'book': market['id'],
            'limit': limit, // default = 25, max = 100
            // 'sort': 'desc', // default = desc
            // 'marker': id, // integer id to start from
        };
        const response = await this.privateGetUserTrades (this.extend (request, params));
        return this.parseTrades (response['payload'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitso#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'book': market['id'],
            'side': side,
            'type': type,
            'major': this.amountToPrecision (market['symbol'], amount),
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (market['symbol'], price);
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const id = this.safeString (response['payload'], 'oid');
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitso#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by bitso cancelOrder ()
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'oid': id,
        };
        return await this.privateDeleteOrdersOid (this.extend (request, params));
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitso#cancelOrders
         * @description cancel multiple orders
         * @param {[string]} ids order ids
         * @param {string|undefined} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (!Array.isArray (ids)) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() ids argument should be an array');
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const oids = ids.join (',');
        const request = {
            'oids': oids,
        };
        const response = await this.privateDeleteOrders (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "payload": ["yWTQGxDMZ0VimZgZ"]
        //     }
        //
        const payload = this.safeValue (response, 'payload', []);
        const orders = [];
        for (let i = 0; i < payload.length; i++) {
            const id = payload[i];
            orders.push (this.parseOrder (id, market));
        }
        return orders;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitso#cancelAllOrders
         * @description cancel all open orders
         * @param {undefined} symbol bitso does not support canceling orders for only a specific market
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol !== undefined) {
            throw new NotSupported (this.id + ' cancelAllOrders() deletes all orders for user, it does not support filtering by symbol.');
        }
        const response = await this.privateDeleteOrdersAll (params);
        //
        //     {
        //         success: true,
        //         payload: ['NWUZUYNT12ljwzDT', 'kZUkZmQ2TTjkkYTY']
        //     }
        //
        const payload = this.safeValue (response, 'payload', []);
        const canceledOrders = [];
        for (let i = 0; i < payload.length; i++) {
            const order = this.parseOrder (payload[i]);
            canceledOrders.push (order);
        }
        return canceledOrders;
    }

    parseOrderStatus (status) {
        const statuses = {
            'partial-fill': 'open', // this is a common substitution in ccxt
            'completed': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //
        // canceledOrder
        // yWTQGxDMZ0VimZgZ
        //
        let id = undefined;
        if (typeof order === 'string') {
            id = order;
        } else {
            id = this.safeString (order, 'oid');
        }
        const side = this.safeString (order, 'side');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'book');
        const symbol = this.safeSymbol (marketId, market, '_');
        const orderType = this.safeString (order, 'type');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'original_amount');
        const remaining = this.safeString (order, 'unfilled_amount');
        const clientOrderId = this.safeString (order, 'client_id');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'remaining': remaining,
            'filled': undefined,
            'status': status,
            'fee': undefined,
            'average': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 25, params = {}) {
        /**
         * @method
         * @name bitso#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        // the don't support fetching trades starting from a date yet
        // use the `marker` extra param for that
        // this is not a typo, the variable name is 'marker' (don't confuse with 'market')
        const markerInParams = ('marker' in params);
        // warn the user with an exception if the user wants to filter
        // starting from since timestamp, but does not set the trade id with an extra 'marker' param
        if ((since !== undefined) && !markerInParams) {
            throw new ExchangeError (this.id + ' fetchOpenOrders() does not support fetching orders starting from a timestamp with the `since` argument, use the `marker` extra param to filter starting from an integer trade id');
        }
        // convert it to an integer unconditionally
        if (markerInParams) {
            params = this.extend (params, {
                'marker': parseInt (params['marker']),
            });
        }
        const request = {
            'book': market['id'],
            'limit': limit, // default = 25, max = 100
            // 'sort': 'desc', // default = desc
            // 'marker': id, // integer id to start from
        };
        const response = await this.privateGetOpenOrders (this.extend (request, params));
        const orders = this.parseOrders (response['payload'], market, since, limit);
        return orders;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitso#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by bitso fetchOrder
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetOrdersOid ({
            'oid': id,
        });
        const payload = this.safeValue (response, 'payload');
        if (Array.isArray (payload)) {
            const numOrders = response['payload'].length;
            if (numOrders === 1) {
                return this.parseOrder (payload[0]);
            }
        }
        throw new OrderNotFound (this.id + ': The order ' + id + ' not found.');
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitso#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'oid': id,
        };
        const response = await this.privateGetOrderTradesOid (this.extend (request, params));
        return this.parseTrades (response['payload'], market);
    }

    async fetchDeposit (id, code = undefined, params = {}) {
        /**
         * @method
         * @name bitso#fetchDeposit
         * @description fetch information on a deposit
         * @param {string} id deposit id
         * @param {string|undefined} code bitso does not support filtering by currency code and will ignore this argument
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            'fid': id,
        };
        const response = await this.privateGetFundingsFid (this.extend (request, params));
        //
        //     {
        //         success: true,
        //         payload: [{
        //             fid: '6112c6369100d6ecceb7f54f17cf0511',
        //             status: 'complete',
        //             created_at: '2022-06-08T12:02:49+0000',
        //             currency: 'btc',
        //             method: 'btc',
        //             method_name: 'Bitcoin',
        //             amount: '0.00080000',
        //             asset: 'btc',
        //             network: 'btc',
        //             protocol: 'btc',
        //             integration: 'bitgo-v2',
        //             details: {
        //                 receiving_address: '3N2vbcYKhogs6RoTb4eYCUJ3beRSqLgSif',
        //                 tx_hash: '327f3838531f211485ec59f9d0a119fea1595591e274d942b2c10b9b8262eb1d',
        //                 confirmations: '4'
        //             }
        //         }]
        //     }
        //
        const transactions = this.safeValue (response, 'payload', []);
        const first = this.safeValue (transactions, 0, {});
        return this.parseTransaction (first);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitso#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privateGetFundings (params);
        //
        //     {
        //         success: true,
        //         payload: [{
        //             fid: '6112c6369100d6ecceb7f54f17cf0511',
        //             status: 'complete',
        //             created_at: '2022-06-08T12:02:49+0000',
        //             currency: 'btc',
        //             method: 'btc',
        //             method_name: 'Bitcoin',
        //             amount: '0.00080000',
        //             asset: 'btc',
        //             network: 'btc',
        //             protocol: 'btc',
        //             integration: 'bitgo-v2',
        //             details: {
        //                 receiving_address: '3N2vbcYKhogs6RoTb4eYCUJ3beRSqLgSif',
        //                 tx_hash: '327f3838531f211485ec59f9d0a119fea1595591e274d942b2c10b9b8262eb1d',
        //                 confirmations: '4'
        //             }
        //         }]
        //     }
        //
        const transactions = this.safeValue (response, 'payload', []);
        return this.parseTransactions (transactions, currency, since, limit, params);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name bitso#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'fund_currency': currency['id'],
        };
        const response = await this.privateGetFundingDestination (this.extend (request, params));
        let address = this.safeString (response['payload'], 'account_identifier');
        let tag = undefined;
        if (address.indexOf ('?dt=') >= 0) {
            const parts = address.split ('?dt=');
            address = this.safeString (parts, 0);
            tag = this.safeString (parts, 1);
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    async fetchTransactionFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name bitso#fetchTransactionFees
         * @description *DEPRECATED* please use fetchDepositWithdrawFees instead
         * @see https://bitso.com/api_info#fees
         * @param {[string]|undefined} codes list of unified currency codes
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {[object]} a list of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetFees (params);
        //
        //    {
        //        success: true,
        //        payload: {
        //            fees: [
        //                {
        //                    book: 'btc_mxn',
        //                    fee_percent: '0.6500',
        //                    fee_decimal: '0.00650000',
        //                    taker_fee_percent: '0.6500',
        //                    taker_fee_decimal: '0.00650000',
        //                    maker_fee_percent: '0.5000',
        //                    maker_fee_decimal: '0.00500000',
        //                    volume_currency: 'mxn',
        //                    current_volume: '0.00',
        //                    next_volume: '1500000.00',
        //                    next_maker_fee_percent: '0.490',
        //                    next_taker_fee_percent: '0.637',
        //                    nextVolume: '1500000.00',
        //                    nextFee: '0.490',
        //                    nextTakerFee: '0.637'
        //                },
        //                ...
        //            ],
        //            deposit_fees: [
        //                {
        //                    currency: 'btc',
        //                    method: 'rewards',
        //                    fee: '0.00',
        //                    is_fixed: false
        //                },
        //                ...
        //            ],
        //            withdrawal_fees: {
        //                ada: '0.20958100',
        //                bch: '0.00009437',
        //                ars: '0',
        //                btc: '0.00001209',
        //                ...
        //            }
        //        }
        //    }
        //
        const result = {};
        const payload = this.safeValue (response, 'payload', {});
        const depositFees = this.safeValue (payload, 'deposit_fees', []);
        for (let i = 0; i < depositFees.length; i++) {
            const depositFee = depositFees[i];
            const currencyId = this.safeString (depositFee, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            if ((codes !== undefined) && !this.inArray (code, codes)) {
                continue;
            }
            result[code] = {
                'deposit': this.safeNumber (depositFee, 'fee'),
                'withdraw': undefined,
                'info': {
                    'deposit': depositFee,
                    'withdraw': undefined,
                },
            };
        }
        const withdrawalFees = this.safeValue (payload, 'withdrawal_fees', []);
        const currencyIds = Object.keys (withdrawalFees);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            if ((codes !== undefined) && !this.inArray (code, codes)) {
                continue;
            }
            result[code] = {
                'deposit': this.safeValue (result[code], 'deposit'),
                'withdraw': this.safeNumber (withdrawalFees, currencyId),
                'info': {
                    'deposit': this.safeValue (result[code]['info'], 'deposit'),
                    'withdraw': this.safeNumber (withdrawalFees, currencyId),
                },
            };
        }
        return result;
    }

    async fetchDepositWithdrawFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name bitso#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://bitso.com/api_info#fees
         * @param {[string]|undefined} codes list of unified currency codes
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {[object]} a list of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetFees (params);
        //
        //    {
        //        success: true,
        //        payload: {
        //            fees: [
        //                {
        //                    book: 'btc_mxn',
        //                    fee_percent: '0.6500',
        //                    fee_decimal: '0.00650000',
        //                    taker_fee_percent: '0.6500',
        //                    taker_fee_decimal: '0.00650000',
        //                    maker_fee_percent: '0.5000',
        //                    maker_fee_decimal: '0.00500000',
        //                    volume_currency: 'mxn',
        //                    current_volume: '0.00',
        //                    next_volume: '1500000.00',
        //                    next_maker_fee_percent: '0.490',
        //                    next_taker_fee_percent: '0.637',
        //                    nextVolume: '1500000.00',
        //                    nextFee: '0.490',
        //                    nextTakerFee: '0.637'
        //                },
        //                ...
        //            ],
        //            deposit_fees: [
        //                {
        //                    currency: 'btc',
        //                    method: 'rewards',
        //                    fee: '0.00',
        //                    is_fixed: false
        //                },
        //                ...
        //            ],
        //            withdrawal_fees: {
        //                ada: '0.20958100',
        //                bch: '0.00009437',
        //                ars: '0',
        //                btc: '0.00001209',
        //                ...
        //            }
        //        }
        //    }
        //
        const payload = this.safeValue (response, 'payload', {});
        return this.parseDepositWithdrawFees (payload, codes);
    }

    parseDepositWithdrawFees (response, codes = undefined, currencyIdKey = undefined) {
        //
        //    {
        //        fees: [
        //            {
        //                book: 'btc_mxn',
        //                fee_percent: '0.6500',
        //                fee_decimal: '0.00650000',
        //                taker_fee_percent: '0.6500',
        //                taker_fee_decimal: '0.00650000',
        //                maker_fee_percent: '0.5000',
        //                maker_fee_decimal: '0.00500000',
        //                volume_currency: 'mxn',
        //                current_volume: '0.00',
        //                next_volume: '1500000.00',
        //                next_maker_fee_percent: '0.490',
        //                next_taker_fee_percent: '0.637',
        //                nextVolume: '1500000.00',
        //                nextFee: '0.490',
        //                nextTakerFee: '0.637'
        //            },
        //            ...
        //        ],
        //        deposit_fees: [
        //            {
        //                currency: 'btc',
        //                method: 'rewards',
        //                fee: '0.00',
        //                is_fixed: false
        //            },
        //            ...
        //        ],
        //        withdrawal_fees: {
        //            ada: '0.20958100',
        //            bch: '0.00009437',
        //            ars: '0',
        //            btc: '0.00001209',
        //            ...
        //        }
        //    }
        //
        const result = {};
        const depositResponse = this.safeValue (response, 'deposit_fees', []);
        const withdrawalResponse = this.safeValue (response, 'withdrawal_fees', []);
        for (let i = 0; i < depositResponse.length; i++) {
            const entry = depositResponse[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            if ((codes === undefined) || (code in codes)) {
                result[code] = {
                    'deposit': {
                        'fee': this.safeNumber (entry, 'fee'),
                        'percentage': !this.safeValue (entry, 'is_fixed'),
                    },
                    'withdraw': {
                        'fee': undefined,
                        'percentage': undefined,
                    },
                    'networks': {},
                    'info': entry,
                };
            }
        }
        const withdrawalKeys = Object.keys (withdrawalResponse);
        for (let i = 0; i < withdrawalKeys.length; i++) {
            const currencyId = withdrawalKeys[i];
            const code = this.safeCurrencyCode (currencyId);
            if ((codes === undefined) || (code in codes)) {
                const withdrawFee = this.parseNumber (withdrawalResponse[currencyId]);
                const resultValue = this.safeValue (result, code);
                if (resultValue === undefined) {
                    result[code] = this.depositWithdrawFee ({});
                }
                result[code]['withdraw']['fee'] = withdrawFee;
                result[code]['info'][code] = withdrawFee;
            }
        }
        return result;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitso#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bitso api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const methods = {
            'BTC': 'Bitcoin',
            'ETH': 'Ether',
            'XRP': 'Ripple',
            'BCH': 'Bcash',
            'LTC': 'Litecoin',
        };
        const currency = this.currency (code);
        const method = (code in methods) ? methods[code] : undefined;
        if (method === undefined) {
            throw new ExchangeError (this.id + ' not valid withdraw coin: ' + code);
        }
        const request = {
            'amount': amount,
            'address': address,
            'destination_tag': tag,
        };
        const classMethod = 'privatePost' + method + 'Withdrawal';
        const response = await this[classMethod] (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "payload": [
        //             {
        //                 "wid": "c5b8d7f0768ee91d3b33bee648318688",
        //                 "status": "pending",
        //                 "created_at": "2016-04-08T17:52:31.000+00:00",
        //                 "currency": "btc",
        //                 "method": "Bitcoin",
        //                 "amount": "0.48650929",
        //                 "details": {
        //                     "withdrawal_address": "18MsnATiNiKLqUHDTRKjurwMg7inCrdNEp",
        //                     "tx_hash": "d4f28394693e9fb5fffcaf730c11f32d1922e5837f76ca82189d3bfe30ded433"
        //                 }
        //             },
        //         ]
        //     }
        //
        const payload = this.safeValue (response, 'payload', []);
        const first = this.safeValue (payload, 0);
        return this.parseTransaction (first, currency);
    }

    safeNetwork (networkId) {
        if (networkId === undefined) {
            return undefined;
        }
        networkId = networkId.toUpperCase ();
        const networksById = {
            'trx': 'TRC20',
            'erc20': 'ERC20',
            'bsc': 'BEP20',
            'bep2': 'BEP2',
        };
        return this.safeString (networksById, networkId, networkId);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // deposit
        //     {
        //         fid: '6112c6369100d6ecceb7f54f17cf0511',
        //         status: 'complete',
        //         created_at: '2022-06-08T12:02:49+0000',
        //         currency: 'btc',
        //         method: 'btc',
        //         method_name: 'Bitcoin',
        //         amount: '0.00080000',
        //         asset: 'btc',
        //         network: 'btc',
        //         protocol: 'btc',
        //         integration: 'bitgo-v2',
        //         details: {
        //             receiving_address: '3NmvbcYKhogs6RoTb4eYCUJ3beRSqLgSif',
        //             tx_hash: '327f3838531f611485ec59f9d0a119fea1595591e274d942b2c10b9b8262eb1d',
        //             confirmations: '4'
        //         }
        //     }
        //
        // withdraw
        //
        //     {
        //         "wid": "c5b8d7f0768ee91d3b33bee648318688",
        //         "status": "pending",
        //         "created_at": "2016-04-08T17:52:31.000+00:00",
        //         "currency": "btc",
        //         "method": "Bitcoin",
        //         "amount": "0.48650929",
        //         "details": {
        //             "withdrawal_address": "18MsnATiNiKLqUHDTRKjurwMg7inCrdNEp",
        //             "tx_hash": "d4f28394693e9fb5fffcaf730c11f32d1922e5837f76ca82189d3bfe30ded433"
        //         }
        //     }
        //
        const currencyId = this.safeString2 (transaction, 'currency', 'asset');
        currency = this.safeCurrency (currencyId, currency);
        const details = this.safeValue (transaction, 'details', {});
        const datetime = this.safeString (transaction, 'created_at');
        const withdrawalAddress = this.safeString (details, 'withdrawal_address');
        const receivingAddress = this.safeString (details, 'receiving_address');
        const networkId = this.safeString2 (transaction, 'network', 'method');
        const status = this.safeString (transaction, 'status');
        const withdrawId = this.safeString (transaction, 'wid');
        return {
            'id': this.safeString2 (transaction, 'wid', 'fid'),
            'txid': this.safeString (details, 'tx_hash'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'network': this.safeNetwork (networkId),
            'addressFrom': receivingAddress,
            'address': (withdrawalAddress !== undefined) ? withdrawalAddress : receivingAddress,
            'addressTo': withdrawalAddress,
            'amount': this.safeString (transaction, 'amount'),
            'type': (withdrawId === undefined) ? 'deposit' : 'withdrawal',
            'currency': this.safeCurrencyCode (currencyId, currency),
            'status': this.parseTransactionStatus (status),
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'fee': undefined,
            'info': transaction,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'pending': 'pending',
            'in_progress': 'pending',
            'complete': 'ok',
            'failed': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET' || method === 'DELETE') {
            if (Object.keys (query).length) {
                endpoint += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api']['rest'] + endpoint;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let request = [ nonce, method, endpoint ].join ('');
            if (method !== 'GET' && method !== 'DELETE') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    request += body;
                }
            }
            const signature = this.hmac (this.encode (request), this.encode (this.secret));
            const auth = this.apiKey + ':' + nonce + ':' + signature;
            headers = {
                'Authorization': 'Bitso ' + auth,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('success' in response) {
            //
            //     {"success":false,"error":{"code":104,"message":"Cannot perform request - nonce must be higher than 1520307203724237"}}
            //
            let success = this.safeValue (response, 'success', false);
            if (typeof success === 'string') {
                if ((success === 'true') || (success === '1')) {
                    success = true;
                } else {
                    success = false;
                }
            }
            if (!success) {
                const feedback = this.id + ' ' + this.json (response);
                const error = this.safeValue (response, 'error');
                if (error === undefined) {
                    throw new ExchangeError (feedback);
                }
                const code = this.safeString (error, 'code');
                this.throwExactlyMatchedException (this.exceptions, code, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
