
//  ---------------------------------------------------------------------------

import Exchange from './abstract/whitebit.js';
import { ExchangeNotAvailable, ExchangeError, DDoSProtection, BadSymbol, InvalidOrder, ArgumentsRequired, AuthenticationError, OrderNotFound, PermissionDenied, InsufficientFunds, BadRequest, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import { Int, OrderSide } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class whitebit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'whitebit',
            'name': 'WhiteBit',
            'version': 'v4',
            'countries': [ 'EE' ],
            'rateLimit': 500,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'createOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': true,
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
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchOrderTrades': true,
                'fetchPositionMode': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactionFees': true,
                'repayMargin': false,
                'setLeverage': true,
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
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/66732963-8eb7dd00-ee66-11e9-849b-10d9282bb9e0.jpg',
                'api': {
                    'v1': {
                        'public': 'https://whitebit.com/api/v1/public',
                        'private': 'https://whitebit.com/api/v1',
                    },
                    'v2': {
                        'public': 'https://whitebit.com/api/v2/public',
                    },
                    'v4': {
                        'public': 'https://whitebit.com/api/v4/public',
                        'private': 'https://whitebit.com/api/v4',
                    },
                },
                'www': 'https://www.whitebit.com',
                'doc': 'https://github.com/whitebit-exchange/api-docs',
                'fees': 'https://whitebit.com/fee-schedule',
                'referral': 'https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963',
            },
            'api': {
                'web': {
                    'get': [
                        'v1/healthcheck',
                    ],
                },
                'v1': {
                    'public': {
                        'get': [
                            'markets',
                            'tickers',
                            'ticker',
                            'symbols',
                            'depth/result',
                            'history',
                            'kline',
                        ],
                    },
                    'private': {
                        'post': [
                            'account/balance',
                            'order/new',
                            'order/cancel',
                            'orders',
                            'account/order_history',
                            'account/executed_history',
                            'account/executed_history/all',
                            'account/order',
                        ],
                    },
                },
                'v2': {
                    'public': {
                        'get': [
                            'markets',
                            'ticker',
                            'assets',
                            'fee',
                            'depth/{market}',
                            'trades/{market}',
                        ],
                    },
                },
                'v4': {
                    'public': {
                        'get': [
                            'assets',
                            'collateral/markets',
                            'fee',
                            'orderbook/{market}',
                            'ticker',
                            'trades/{market}',
                            'time',
                            'ping',
                            'markets',
                        ],
                    },
                    'private': {
                        'post': [
                            'collateral-account/balance',
                            'collateral-account/positions/history',
                            'collateral-account/leverage',
                            'collateral-account/positions/open',
                            'collateral-account/summary',
                            'main-account/address',
                            'main-account/balance',
                            'main-account/create-new-address',
                            'main-account/codes',
                            'main-account/codes/apply',
                            'main-account/codes/my',
                            'main-account/codes/history',
                            'main-account/fiat-deposit-url',
                            'main-account/history',
                            'main-account/withdraw',
                            'main-account/withdraw-pay',
                            'main-account/transfer',
                            'trade-account/balance',
                            'trade-account/executed-history',
                            'trade-account/order',
                            'trade-account/order/history',
                            'order/collateral/limit',
                            'order/collateral/market',
                            'order/collateral/trigger_market',
                            'order/new',
                            'order/market',
                            'order/stock_market',
                            'order/stop_limit',
                            'order/stop_market',
                            'order/cancel',
                            'orders',
                            'profile/websocket_token',
                        ],
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0.001'),
                },
            },
            'options': {
                'fiatCurrencies': [ 'EUR', 'USD', 'RUB', 'UAH' ],
                'fetchBalance': {
                    'account': 'spot',
                },
                'accountsByType': {
                    'main': 'main',
                    'spot': 'spot',
                    'margin': 'collateral',
                    'trade': 'spot',
                },
                'networksById': {
                    'BEP20': 'BSC',
                },
                'defaultType': 'spot',
                'brokerId': 'ccxt',
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'Unauthorized request.': AuthenticationError, // {"code":10,"message":"Unauthorized request."}
                    'The market format is invalid.': BadSymbol, // {"code":0,"message":"Validation failed","errors":{"market":["The market format is invalid."]}}
                    'Market is not available': BadSymbol, // {"success":false,"message":{"market":["Market is not available"]},"result":[]}
                    'Invalid payload.': BadRequest, // {"code":9,"message":"Invalid payload."}
                    'Amount must be greater than 0': InvalidOrder, // {"code":0,"message":"Validation failed","errors":{"amount":["Amount must be greater than 0"]}}
                    'Not enough balance.': InsufficientFunds, // {"code":10,"message":"Inner validation failed","errors":{"amount":["Not enough balance."]}}
                    'The order id field is required.': InvalidOrder, // {"code":0,"message":"Validation failed","errors":{"orderId":["The order id field is required."]}}
                    'Not enough balance': InsufficientFunds, // {"code":0,"message":"Validation failed","errors":{"amount":["Not enough balance"]}}
                    'This action is unauthorized.': PermissionDenied, // {"code":0,"message":"This action is unauthorized."}
                    'This API Key is not authorized to perform this action.': PermissionDenied, // {"code":4,"message":"This API Key is not authorized to perform this action."}
                    'Unexecuted order was not found.': OrderNotFound, // {"code":2,"message":"Inner validation failed","errors":{"order_id":["Unexecuted order was not found."]}}
                    'The selected from is invalid.': BadRequest, // {"code":0,"message":"Validation failed","errors":{"from":["The selected from is invalid."]}}
                    '503': ExchangeNotAvailable, // {"response":null,"status":503,"errors":{"message":[""]},"notification":null,"warning":null,"_token":null},
                    '422': OrderNotFound, // {"response":null,"status":422,"errors":{"orderId":["Finished order id 1295772653 not found on your account"]},"notification":null,"warning":"Finished order id 1295772653 not found on your account","_token":null}
                },
                'broad': {
                    'Given amount is less than min amount': InvalidOrder, // {"code":0,"message":"Validation failed","errors":{"amount":["Given amount is less than min amount 200000"],"total":["Total is less than 5.05"]}}
                    'Total is less than': InvalidOrder, // {"code":0,"message":"Validation failed","errors":{"amount":["Given amount is less than min amount 200000"],"total":["Total is less than 5.05"]}}
                    'fee must be no less than': InvalidOrder, // {"code":0,"message":"Validation failed","errors":{"amount":["Total amount + fee must be no less than 5.05505"]}}
                    'Enable your key in API settings': PermissionDenied, // {"code":2,"message":"This action is unauthorized. Enable your key in API settings"}
                    'You don\'t have such amount for transfer': InsufficientFunds, // {"code":3,"message":"Inner validation failed","errors":{"amount":["You don't have such amount for transfer (available 0.44523433, in amount: 2)"]}}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name whitebit#fetchMarkets
         * @description retrieves data on all markets for whitebit
         * @see https://whitebit-exchange.github.io/api-docs/docs/Public/http-v4#market-info
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const markets = await this.v4PublicGetMarkets ();
        //
        //    [
        //        {
        //          "name": "SON_USD",         // Market pair name
        //          "stock": "SON",            // Ticker of stock currency
        //          "money": "USD",            // Ticker of money currency
        //          "stockPrec": "3",          // Stock currency precision
        //          "moneyPrec": "2",          // Precision of money currency
        //          "feePrec": "4",            // Fee precision
        //          "makerFee": "0.001",       // Default maker fee ratio
        //          "takerFee": "0.001",       // Default taker fee ratio
        //          "minAmount": "0.001",      // Minimal amount of stock to trade
        //          "minTotal": "0.001",       // Minimal amount of money to trade
        //          "tradesEnabled": true,     // Is trading enabled
        //          "isCollateral": true,      // Is margin trading enabled
        //          "type": "spot"             // Market type. Possible values: "spot", "futures"
        //        },
        //        {
        //          ...
        //        }
        //    ]
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'stock');
            let quoteId = this.safeString (market, 'money');
            quoteId = (quoteId === 'PERP') ? 'USDT' : quoteId;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const active = this.safeValue (market, 'tradesEnabled');
            const isCollateral = this.safeValue (market, 'isCollateral');
            const typeId = this.safeString (market, 'type');
            let type = undefined;
            let settle = undefined;
            let settleId = undefined;
            let symbol = base + '/' + quote;
            const swap = typeId === 'futures';
            const margin = isCollateral && !swap;
            let contract = false;
            const amountPrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'stockPrec')));
            const contractSize = amountPrecision;
            let linear = undefined;
            let inverse = undefined;
            if (swap) {
                settleId = quoteId;
                settle = this.safeCurrencyCode (settleId);
                symbol = symbol + ':' + settle;
                type = 'swap';
                contract = true;
                linear = true;
                inverse = false;
            } else {
                type = 'spot';
            }
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': !swap,
                'margin': margin,
                'swap': swap,
                'future': false,
                'option': false,
                'active': active,
                'contract': contract,
                'linear': linear,
                'inverse': inverse,
                'taker': this.safeNumber (market, 'makerFee'),
                'maker': this.safeNumber (market, 'takerFee'),
                'contractSize': contractSize,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': amountPrecision,
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'moneyPrec'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minAmount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minTotal'),
                        'max': undefined,
                    },
                },
                'info': market,
            };
            result.push (entry);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name whitebit#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.v4PublicGetAssets (params);
        //
        //      "BTC": {
        //          "name": "Bitcoin",
        //          "unified_cryptoasset_id": 1,
        //          "can_withdraw": true,
        //          "can_deposit": true,
        //          "min_withdraw": "0.001",
        //          "max_withdraw": "2",
        //          "maker_fee": "0.1",
        //          "taker_fee": "0.1",
        //          "min_deposit": "0.0001",
        //           "max_deposit": "0",
        //       },
        //
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = response[id];
            // breaks down in Python due to utf8 encoding issues on the exchange side
            // const name = this.safeString (currency, 'name');
            const canDeposit = this.safeValue (currency, 'can_deposit', true);
            const canWithdraw = this.safeValue (currency, 'can_withdraw', true);
            const active = canDeposit && canWithdraw;
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency, // the original payload
                'name': undefined, // see the comment above
                'active': active,
                'deposit': canDeposit,
                'withdraw': canWithdraw,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'min_withdraw'),
                        'max': this.safeNumber (currency, 'max_withdraw'),
                    },
                },
            };
        }
        return result;
    }

    async fetchTransactionFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchTransactionFees
         * @description *DEPRECATED* please use fetchDepositWithdrawFees instead
         * @param {[string]|undefined} codes not used by fetchTransactionFees ()
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const response = await this.v4PublicGetFee (params);
        //
        //      {
        //          "1INCH":{
        //              "is_depositable":true,
        //              "is_withdrawal":true,
        //              "ticker":"1INCH",
        //              "name":"1inch",
        //              "providers":[
        //              ],
        //              "withdraw":{
        //                   "max_amount":"0",
        //                  "min_amount":"21.5",
        //                  "fixed":"17.5",
        //                  "flex":null
        //              },
        //              "deposit":{
        //                  "max_amount":"0",
        //                  "min_amount":"19.5",
        //                  "fixed":null,
        //                  "flex":null
        //               }
        //          },
        //           {...}
        //      }
        //
        const currenciesIds = Object.keys (response);
        const withdrawFees = {};
        const depositFees = {};
        for (let i = 0; i < currenciesIds.length; i++) {
            const currency = currenciesIds[i];
            const data = response[currency];
            const code = this.safeCurrencyCode (currency);
            const withdraw = this.safeValue (data, 'withdraw', {});
            withdrawFees[code] = this.safeString (withdraw, 'fixed');
            const deposit = this.safeValue (data, 'deposit', {});
            depositFees[code] = this.safeString (deposit, 'fixed');
        }
        return {
            'withdraw': withdrawFees,
            'deposit': depositFees,
            'info': response,
        };
    }

    async fetchDepositWithdrawFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @param {[string]|undefined} codes not used by fetchDepositWithdrawFees ()
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const response = await this.v4PublicGetFee (params);
        //
        //    {
        //        "1INCH": {
        //            "is_depositable": true,
        //            "is_withdrawal": true,
        //            "ticker": "1INCH",
        //            "name": "1inch",
        //            "providers": [],
        //            "withdraw": {
        //                "max_amount": "0",
        //                "min_amount": "21.5",
        //                "fixed": "17.5",
        //                "flex": null
        //            },
        //            "deposit": {
        //                "max_amount": "0",
        //                "min_amount": "19.5",
        //                "fixed": null,
        //                "flex": null
        //            }
        //        },
        //        'WBT (ERC20)': {
        //            is_depositable: true,
        //            is_withdrawal: true,
        //            ticker: 'WBT',
        //            name: 'WhiteBIT Token',
        //            providers: [],
        //            withdraw: { max_amount: '0', min_amount: '0.7', fixed: '0.253', flex: null },
        //            deposit: { max_amount: '0', min_amount: '0.35', fixed: null, flex: null }
        //        },
        //        'WBT (TRC20)': {
        //            is_depositable: true,
        //            is_withdrawal: true,
        //            ticker: 'WBT',
        //            name: 'WhiteBIT Token',
        //            providers: [],
        //            withdraw: { max_amount: '0', min_amount: '1.5', fixed: '0.075', flex: null },
        //            deposit: { max_amount: '0', min_amount: '0.75', fixed: null, flex: null }
        //        },
        //        ...
        //    }
        //
        return this.parseDepositWithdrawFees (response, codes);
    }

    parseDepositWithdrawFees (response, codes = undefined, currencyIdKey = undefined) {
        //
        //    {
        //        "1INCH": {
        //            "is_depositable": true,
        //            "is_withdrawal": true,
        //            "ticker": "1INCH",
        //            "name": "1inch",
        //            "providers": [],
        //            "withdraw": {
        //                "max_amount": "0",
        //                "min_amount": "21.5",
        //                "fixed": "17.5",
        //                "flex": null
        //            },
        //            "deposit": {
        //                "max_amount": "0",
        //                "min_amount": "19.5",
        //                "fixed": null,
        //                "flex": null
        //            }
        //        },
        //        'WBT (ERC20)': {
        //            is_depositable: true,
        //            is_withdrawal: true,
        //            ticker: 'WBT',
        //            name: 'WhiteBIT Token',
        //            providers: [],
        //            withdraw: { max_amount: '0', min_amount: '0.7', fixed: '0.253', flex: null },
        //            deposit: { max_amount: '0', min_amount: '0.35', fixed: null, flex: null }
        //        },
        //        'WBT (TRC20)': {
        //            is_depositable: true,
        //            is_withdrawal: true,
        //            ticker: 'WBT',
        //            name: 'WhiteBIT Token',
        //            providers: [],
        //            withdraw: { max_amount: '0', min_amount: '1.5', fixed: '0.075', flex: null },
        //            deposit: { max_amount: '0', min_amount: '0.75', fixed: null, flex: null }
        //        },
        //        ...
        //    }
        //
        const depositWithdrawFees = {};
        codes = this.marketCodes (codes);
        const currencyIds = Object.keys (response);
        for (let i = 0; i < currencyIds.length; i++) {
            const entry = currencyIds[i];
            const splitEntry = entry.split (' ');
            const currencyId = splitEntry[0];
            const feeInfo = response[entry];
            const code = this.safeCurrencyCode (currencyId);
            if ((codes === undefined) || (this.inArray (code, codes))) {
                const depositWithdrawFee = this.safeValue (depositWithdrawFees, code);
                if (depositWithdrawFee === undefined) {
                    depositWithdrawFees[code] = this.depositWithdrawFee ({});
                }
                depositWithdrawFees[code]['info'][entry] = feeInfo;
                let networkId = this.safeString (splitEntry, 1);
                const withdraw = this.safeValue (feeInfo, 'withdraw');
                const deposit = this.safeValue (feeInfo, 'deposit');
                const withdrawFee = this.safeNumber (withdraw, 'fixed');
                const depositFee = this.safeNumber (deposit, 'fixed');
                const withdrawResult = {
                    'fee': withdrawFee,
                    'percentage': (withdrawFee !== undefined) ? false : undefined,
                };
                const depositResult = {
                    'fee': depositFee,
                    'percentage': (depositFee !== undefined) ? false : undefined,
                };
                if (networkId !== undefined) {
                    const networkLength = networkId.length;
                    networkId = networkId.slice (1, networkLength - 1);
                    const networkCode = this.networkIdToCode (networkId);
                    depositWithdrawFees[code]['networks'][networkCode] = {
                        'withdraw': withdrawResult,
                        'deposit': depositResult,
                    };
                } else {
                    depositWithdrawFees[code]['withdraw'] = withdrawResult;
                    depositWithdrawFees[code]['deposit'] = depositResult;
                }
            }
        }
        const depositWithdrawCodes = Object.keys (depositWithdrawFees);
        for (let i = 0; i < depositWithdrawCodes.length; i++) {
            const code = depositWithdrawCodes[i];
            const currency = this.currency (code);
            depositWithdrawFees[code] = this.assignDefaultDepositWithdrawFees (depositWithdrawFees[code], currency);
        }
        return depositWithdrawFees;
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name whitebit#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        const response = await this.v4PublicGetAssets (params);
        //
        //      {
        //          '1INCH': {
        //              name: '1inch',
        //              unified_cryptoasset_id: '8104',
        //              can_withdraw: true,
        //              can_deposit: true,
        //              min_withdraw: '33',
        //              max_withdraw: '0',
        //              maker_fee: '0.1',
        //              taker_fee: '0.1',
        //              min_deposit: '30',
        //              max_deposit: '0'
        //            },
        //            ...
        //      }
        //
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            const fee = this.safeValue (response, market['baseId'], {});
            let makerFee = this.safeString (fee, 'maker_fee');
            let takerFee = this.safeString (fee, 'taker_fee');
            makerFee = Precise.stringDiv (makerFee, '100');
            takerFee = Precise.stringDiv (takerFee, '100');
            result[symbol] = {
                'info': fee,
                'symbol': market['symbol'],
                'percentage': true,
                'tierBased': false,
                'maker': this.parseNumber (makerFee),
                'taker': this.parseNumber (takerFee),
            };
        }
        return result;
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name whitebit#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v1PublicGetTicker (this.extend (request, params));
        //
        //      {
        //         "success":true,
        //         "message":"",
        //         "result": {
        //             "bid":"0.021979",
        //             "ask":"0.021996",
        //             "open":"0.02182",
        //             "high":"0.022039",
        //             "low":"0.02161",
        //             "last":"0.021987",
        //             "volume":"2810.267",
        //             "deal":"61.383565474",
        //             "change":"0.76",
        //         },
        //     }
        //
        const ticker = this.safeValue (response, 'result', {});
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        //  FetchTicker (v1)
        //
        //    {
        //        "bid": "0.021979",
        //        "ask": "0.021996",
        //        "open": "0.02182",
        //        "high": "0.022039",
        //        "low": "0.02161",
        //        "last": "0.021987",
        //        "volume": "2810.267",
        //        "deal": "61.383565474",
        //        "change": "0.76",
        //    }
        //
        // FetchTickers (v4)
        //
        //    "BCH_RUB": {
        //        "base_id": 1831,
        //        "quote_id": 0,
        //        "last_price": "32830.21",
        //        "quote_volume": "1494659.8024096",
        //        "base_volume": "46.1083",
        //        "isFrozen": false,
        //        "change": "2.12" // in percent
        //    }
        //
        market = this.safeMarket (undefined, market);
        const last = this.safeString (ticker, 'last_price');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'change'),
            'average': undefined,
            'baseVolume': this.safeString2 (ticker, 'base_volume', 'volume'),
            'quoteVolume': this.safeString2 (ticker, 'quote_volume', 'deal'),
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.v4PublicGetTicker (params);
        //
        //      "BCH_RUB": {
        //          "base_id":1831,
        //          "quote_id":0,
        //          "last_price":"32830.21",
        //          "quote_volume":"1494659.8024096",
        //          "base_volume":"46.1083",
        //          "isFrozen":false,
        //          "change":"2.12"
        //      },
        //
        const marketIds = Object.keys (response);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const ticker = this.parseTicker (response[marketId], market);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit; // default = 50, maximum = 100
        }
        const response = await this.v4PublicGetOrderbookMarket (this.extend (request, params));
        //
        //      {
        //          "timestamp": 1594391413,
        //          "asks": [
        //              [
        //                  "9184.41",
        //                  "0.773162"
        //              ],
        //              [ ... ]
        //          ],
        //          "bids": [
        //              [
        //                  "9181.19",
        //                  "0.010873"
        //              ],
        //              [ ... ]
        //          ]
        //      }
        //
        const timestamp = this.parseNumber (Precise.stringMul (this.safeString (response, 'timestamp'), '1000'));
        return this.parseOrderBook (response, symbol, timestamp);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v4PublicGetTradesMarket (this.extend (request, params));
        //
        //      [
        //          {
        //              "tradeID": 158056419,
        //              "price": "9186.13",
        //              "quote_volume": "0.0021",
        //              "base_volume": "9186.13",
        //              "trade_timestamp": 1594391747,
        //              "type": "sell"
        //          },
        //      ],
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.v4PrivatePostTradeAccountExecutedHistory (this.extend (request, params));
        //
        // when no symbol is provided
        //
        //   {
        //       "USDC_USDT":[
        //          {
        //             "id":"1343815269",
        //             "clientOrderId":"",
        //             "time":"1641051917.532965",
        //             "side":"sell",
        //             "role":"2",
        //             "amount":"9.986",
        //             "price":"0.9995",
        //             "deal":"9.981007",
        //             "fee":"0.009981007",
        //             "orderId":"58166729555"
        //          },
        //       ]
        //   }
        //
        // when a symbol is provided
        //
        //     [
        //         {
        //             'id': 1343815269,
        //             'clientOrderId': '',
        //             'time': 1641051917.532965,
        //             'side': 'sell',
        //             'role': 2,
        //             'amount': '9.986',
        //             'price': '0.9995',
        //             'deal': '9.981007',
        //             'fee': '0.009981007',
        //             'orderId': 58166729555,
        //         },
        //     ]
        //
        if (Array.isArray (response)) {
            return this.parseTrades (response, market, since, limit);
        } else {
            let results = [];
            const keys = Object.keys (response);
            for (let i = 0; i < keys.length; i++) {
                const marketId = keys[i];
                const marketNew = this.safeMarket (marketId, undefined, '_');
                const rawTrades = this.safeValue (response, marketId, []);
                const parsed = this.parseTrades (rawTrades, marketNew, since, limit);
                results = this.arrayConcat (results, parsed);
            }
            results = this.sortBy2 (results, 'timestamp', 'id');
            return this.filterBySinceLimit (results, since, limit, 'timestamp') as any;
        }
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTradesV4
        //
        //     {
        //       "tradeID": 158056419,
        //       "price": "9186.13",
        //       "quote_volume": "0.0021",
        //       "base_volume": "9186.13",
        //       "trade_timestamp": 1594391747,
        //       "type": "sell"
        //     }
        //
        // orderTrades (v4Private)
        //
        //     {
        //         "time": 1593342324.613711,
        //         "fee": "0.00000419198",
        //         "price": "0.00000701",
        //         "amount": "598",
        //         "id": 149156519, // trade id
        //         "dealOrderId": 3134995325, // orderId
        //         "clientOrderId": "customId11",
        //         "role": 2, // 1 = maker, 2 = taker
        //         "deal": "0.00419198" // amount in money
        //     }
        //
        // fetchMyTrades
        //
        //      {
        //          'id': 1343815269,
        //          'clientOrderId': '',
        //          'time': 1641051917.532965,
        //          'side': 'sell',
        //          'role': 2,
        //          'amount': '9.986',
        //          'price': '0.9995',
        //          'deal': '9.981007',
        //          'fee': '0.009981007',
        //          'orderId': 58166729555,
        //      }
        //
        market = this.safeMarket (undefined, market);
        const timestamp = this.safeTimestamp2 (trade, 'time', 'trade_timestamp');
        const orderId = this.safeString2 (trade, 'dealOrderId', 'orderId');
        const cost = this.safeString (trade, 'deal');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString2 (trade, 'amount', 'quote_volume');
        const id = this.safeString2 (trade, 'id', 'tradeID');
        const side = this.safeString2 (trade, 'type', 'side');
        const symbol = market['symbol'];
        const role = this.safeInteger (trade, 'role');
        let takerOrMaker = undefined;
        if (role !== undefined) {
            takerOrMaker = (role === 1) ? 'maker' : 'taker';
        }
        let fee = undefined;
        const feeCost = this.safeString (trade, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['quote'],
            };
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            const maxLimit = 1440;
            if (limit === undefined) {
                limit = maxLimit;
            }
            limit = Math.min (limit, maxLimit);
            const start = this.parseToInt (since / 1000);
            const duration = this.parseTimeframe (timeframe);
            const end = this.sum (start, duration * limit);
            request['start'] = start;
            request['end'] = end;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1440);
        }
        const response = await this.v1PublicGetKline (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result":[
        //             [1591488000,"0.025025","0.025025","0.025029","0.025023","6.181","0.154686629"],
        //             [1591488060,"0.025028","0.025033","0.025035","0.025026","8.067","0.201921167"],
        //             [1591488120,"0.025034","0.02505","0.02505","0.025034","20.089","0.503114696"],
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1591488000,
        //         "0.025025",
        //         "0.025025",
        //         "0.025029",
        //         "0.025023",
        //         "6.181",
        //         "0.154686629"
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0), // timestamp
            this.safeNumber (ohlcv, 1), // open
            this.safeNumber (ohlcv, 3), // high
            this.safeNumber (ohlcv, 4), // low
            this.safeNumber (ohlcv, 2), // close
            this.safeNumber (ohlcv, 5), // volume
        ];
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name whitebit#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.v4PublicGetPing (params);
        //
        //      [
        //          "pong"
        //      ]
        //
        const status = this.safeString (response, 0);
        return {
            'status': (status === 'pong') ? 'ok' : status,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name whitebit#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.v4PublicGetTime (params);
        //
        //     {
        //         "time":1635467280514
        //     }
        //
        return this.safeInteger (response, 'time');
    }

    async createOrder (symbol: string, type, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'amount': this.amountToPrecision (symbol, amount),
        };
        const clientOrderId = this.safeString2 (params, 'clOrdId', 'clientOrderId');
        if (clientOrderId === undefined) {
            const brokerId = this.safeString (this.options, 'brokerId');
            if (brokerId !== undefined) {
                request['clientOrderId'] = brokerId + this.uuid16 ();
            }
        } else {
            request['clientOrderId'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId' ]);
        }
        const marketType = this.safeString (market, 'type');
        const isLimitOrder = type === 'limit';
        const isMarketOrder = type === 'market';
        const stopPrice = this.safeNumberN (params, [ 'triggerPrice', 'stopPrice', 'activation_price' ]);
        const isStopOrder = (stopPrice !== undefined);
        const postOnly = this.isPostOnly (isMarketOrder, false, params);
        const [ marginMode, query ] = this.handleMarginModeAndParams ('createOrder', params);
        if (postOnly) {
            request['postOnly'] = true;
        }
        let method = undefined;
        if (marginMode !== undefined && marginMode !== 'cross') {
            throw new NotSupported (this.id + ' createOrder() is only available for cross margin');
        }
        const useCollateralEndpoint = marginMode !== undefined || marketType === 'swap';
        if (isStopOrder) {
            request['activation_price'] = this.priceToPrecision (symbol, stopPrice);
            if (isLimitOrder) {
                // stop limit order
                method = 'v4PrivatePostOrderStopLimit';
                request['price'] = this.priceToPrecision (symbol, price);
            } else {
                // stop market order
                method = 'v4PrivatePostOrderStopMarket';
                if (useCollateralEndpoint) {
                    method = 'v4PrivatePostOrderCollateralTriggerMarket';
                }
            }
        } else {
            if (isLimitOrder) {
                // limit order
                method = 'v4PrivatePostOrderNew';
                if (useCollateralEndpoint) {
                    method = 'v4PrivatePostOrderCollateralLimit';
                }
                request['price'] = this.priceToPrecision (symbol, price);
            } else {
                // market order
                method = 'v4PrivatePostOrderStockMarket';
                if (useCollateralEndpoint) {
                    method = 'v4PrivatePostOrderCollateralMarket';
                }
            }
        }
        params = this.omit (query, [ 'postOnly', 'triggerPrice', 'stopPrice' ]);
        const response = await this[method] (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'orderId': parseInt (id),
        };
        return await this.v4PrivatePostOrderCancel (this.extend (request, params));
    }

    parseBalance (response) {
        const balanceKeys = Object.keys (response);
        const result = {};
        for (let i = 0; i < balanceKeys.length; i++) {
            const id = balanceKeys[i];
            const code = this.safeCurrencyCode (id);
            const balance = response[id];
            if (typeof balance === 'object' && balance !== undefined) {
                const account = this.account ();
                account['free'] = this.safeString (balance, 'available');
                account['used'] = this.safeString (balance, 'freeze');
                account['total'] = this.safeString (balance, 'main_balance');
                result[code] = account;
            } else {
                const account = this.account ();
                account['total'] = balance;
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name whitebit#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        let method = undefined;
        if (marketType === 'swap') {
            method = 'v4PrivatePostCollateralAccountBalance';
        } else {
            const options = this.safeValue (this.options, 'fetchBalance', {});
            const defaultAccount = this.safeString (options, 'account');
            const account = this.safeString (params, 'account', defaultAccount);
            params = this.omit (params, 'account');
            if (account === 'main') {
                method = 'v4PrivatePostMainAccountBalance';
            } else {
                method = 'v4PrivatePostTradeAccountBalance';
            }
        }
        const response = await this[method] (query);
        //
        // main account
        //
        //     {
        //         "BTC":{"main_balance":"0.0013929494020316"},
        //         "ETH":{"main_balance":"0.001398289308"},
        //     }
        //
        // spot trade account
        //
        //     {
        //         "BTC": { "available": "0.123", "freeze": "1" },
        //         "XMR": { "available": "3013", "freeze": "100" },
        //     }
        //
        // swap
        //
        //     {
        //          "BTC": 1,
        //          "USDT": 1000
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 100);
        }
        const response = await this.v4PrivatePostOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "orderId": 3686033640,
        //             "clientOrderId": "customId11",
        //             "market": "BTC_USDT",
        //             "side": "buy",
        //             "type": "limit",
        //             "timestamp": 1594605801.49815,    // current timestamp of unexecuted order
        //             "dealMoney": "0",                 // executed amount in money
        //             "dealStock": "0",                 // executed amount in stock
        //             "amount": "2.241379",             // active order amount
        //             "takerFee": "0.001",
        //             "makerFee": "0.001",
        //             "left": "2.241379",               // unexecuted amount in stock
        //             "dealFee": "0",                   // executed fee by deal
        //             "price": "40000"
        //         },
        //     ]
        //
        return this.parseOrders (response, market, since, limit, { 'status': 'open' });
    }

    async fetchClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 100); // default 50 max 100
        }
        const response = await this.v4PrivatePostTradeAccountOrderHistory (this.extend (request, params));
        //
        //     {
        //         "BTC_USDT": [
        //             {
        //                 "id": 160305483,
        //                 "clientOrderId": "customId11",
        //                 "time": 1594667731.724403,
        //                 "side": "sell",
        //                 "role": 2, // 1 = maker, 2 = taker
        //                 "amount": "0.000076",
        //                 "price": "9264.21",
        //                 "deal": "0.70407996",
        //                 "fee": "0.00070407996"
        //             },
        //         ],
        //     }
        //
        const marketIds = Object.keys (response);
        let results = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const marketNew = this.safeMarket (marketId, undefined, '_');
            const orders = response[marketId];
            for (let j = 0; j < orders.length; j++) {
                const order = this.parseOrder (orders[j], marketNew);
                results.push (this.extend (order, { 'status': 'closed' }));
            }
        }
        results = this.sortBy (results, 'timestamp');
        results = this.filterBySymbolSinceLimit (results, symbol, since, limit);
        return results;
    }

    parseOrderType (type) {
        const types = {
            'limit': 'limit',
            'market': 'market',
            'stop market': 'market',
            'stop limit': 'limit',
            'stock market': 'market',
            'margin limit': 'limit',
            'margin market': 'market',
        };
        return this.safeString (types, type, type);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, fetchOpenOrders
        //
        //      {
        //          "orderId":105687928629,
        //          "clientOrderId":"",
        //          "market":"DOGE_USDT",
        //          "side":"sell",
        //          "type":"stop market",
        //          "timestamp":1659091079.729576,
        //          "dealMoney":"0",                // executed amount in quote
        //          "dealStock":"0",                // base filled amount
        //          "amount":"100",
        //          "takerFee":"0.001",
        //          "makerFee":"0",
        //          "left":"100",
        //          "dealFee":"0",
        //          "activation_price":"0.065"      // stop price (if stop limit or stop market)
        //      }
        //
        // fetchClosedOrders
        //
        //      {
        //          "id":105531094719,
        //          "clientOrderId":"",
        //          "ctime":1659045334.550127,
        //          "ftime":1659045334.550127,
        //          "side":"buy",
        //          "amount":"5.9940059",           // cost in terms of quote for regular market orders, amount in terms or base for all other order types
        //          "price":"0",
        //          "type":"market",
        //          "takerFee":"0.001",
        //          "makerFee":"0",
        //          "dealFee":"0.0059375815",
        //          "dealStock":"85",               // base filled amount
        //          "dealMoney":"5.9375815",        // executed amount in quote
        //      }
        //
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const side = this.safeString (order, 'side');
        const filled = this.safeString (order, 'dealStock');
        const remaining = this.safeString (order, 'left');
        let clientOrderId = this.safeString (order, 'clientOrderId');
        if (clientOrderId === '') {
            clientOrderId = undefined;
        }
        const price = this.safeString (order, 'price');
        const stopPrice = this.safeNumber (order, 'activation_price');
        const orderId = this.safeString2 (order, 'orderId', 'id');
        const type = this.safeString (order, 'type');
        let amount = this.safeString (order, 'amount');
        const cost = this.safeString (order, 'dealMoney');
        if ((side === 'buy') && ((type === 'market') || (type === 'stop market'))) {
            amount = filled;
        }
        const dealFee = this.safeString (order, 'dealFee');
        let fee = undefined;
        if (dealFee !== undefined) {
            fee = {
                'cost': this.parseNumber (dealFee),
                'currency': market['quote'],
            };
        }
        const timestamp = this.safeTimestamp2 (order, 'ctime', 'timestamp');
        const lastTradeTimestamp = this.safeTimestamp (order, 'ftime');
        return this.safeOrder ({
            'info': order,
            'id': orderId,
            'symbol': symbol,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'timeInForce': undefined,
            'postOnly': undefined,
            'status': undefined,
            'side': side,
            'price': price,
            'type': this.parseOrderType (type),
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': undefined,
            'cost': cost,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async fetchOrderTrades (id: string, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const request = {
            'orderId': parseInt (id),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 100);
        }
        const response = await this.v4PrivatePostTradeAccountOrder (this.extend (request, params));
        //
        //     {
        //         "records": [
        //             {
        //                 "time": 1593342324.613711,
        //                 "fee": "0.00000419198",
        //                 "price": "0.00000701",
        //                 "amount": "598",
        //                 "id": 149156519, // trade id
        //                 "dealOrderId": 3134995325, // orderId
        //                 "clientOrderId": "customId11", // empty string if not specified
        //                 "role": 2, // 1 = maker, 2 = taker
        //                 "deal": "0.00419198"
        //             }
        //         ],
        //         "offset": 0,
        //         "limit": 100
        //     }
        //
        const data = this.safeValue (response, 'records', []);
        return this.parseTrades (data, market);
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name whitebit#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'ticker': currency['id'],
        };
        let method = 'v4PrivatePostMainAccountAddress';
        if (this.isFiat (code)) {
            method = 'v4PrivatePostMainAccountFiatDepositUrl';
            const provider = this.safeNumber (params, 'provider');
            if (provider === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires a provider when the ticker is fiat');
            }
            request['provider'] = provider;
            const amount = this.safeNumber (params, 'amount');
            if (amount === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires an amount when the ticker is fiat');
            }
            request['amount'] = amount;
            const uniqueId = this.safeValue (params, 'uniqueId');
            if (uniqueId === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires an uniqueId when the ticker is fiat');
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // fiat
        //
        //     {
        //         "url": "https://someaddress.com"
        //     }
        //
        // crypto
        //
        //     {
        //         "account": {
        //             "address": "GDTSOI56XNVAKJNJBLJGRNZIVOCIZJRBIDKTWSCYEYNFAZEMBLN75RMN",
        //             "memo": "48565488244493"
        //         },
        //         "required": {
        //             "fixedFee": "0",
        //             "flexFee": {
        //                 "maxFee": "0",
        //                 "minFee": "0",
        //                 "percent": "0"
        //             },
        //             "maxAmount": "0",
        //             "minAmount": "1"
        //         }
        //     }
        //
        const url = this.safeString (response, 'url');
        const account = this.safeValue (response, 'account', {});
        const address = this.safeString (account, 'address', url);
        const tag = this.safeString (account, 'memo');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    async setLeverage (leverage, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} response from the exchange
         */
        await this.loadMarkets ();
        if (symbol !== undefined) {
            throw new NotSupported (this.id + ' setLeverage() does not allow to set per symbol');
        }
        if ((leverage < 1) || (leverage > 20)) {
            throw new BadRequest (this.id + ' setLeverage() leverage should be between 1 and 20');
        }
        const request = {
            'leverage': leverage,
        };
        return await this.v4PrivatePostCollateralAccountLeverage (this.extend (request, params));
        //     {
        //         "leverage": 5
        //     }
    }

    async transfer (code: string, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name whitebit#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://github.com/whitebit-exchange/api-docs/blob/main/docs/Private/http-main-v4.md#transfer-between-main-and-trade-balances
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from - main, spot, collateral
         * @param {string} toAccount account to transfer to - main, spot, collateral
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeValue (this.options, 'accountsByType');
        const fromAccountId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toAccountId = this.safeString (accountsByType, toAccount, toAccount);
        const amountString = this.currencyToPrecision (code, amount);
        const request = {
            'ticker': currency['id'],
            'amount': amountString,
            'from': fromAccountId,
            'to': toAccountId,
        };
        const response = await this.v4PrivatePostMainAccountTransfer (this.extend (request, params));
        //
        //    []
        //
        return this.parseTransfer (response, currency);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //    []
        //
        return {
            'info': transfer,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': this.safeCurrencyCode (undefined, currency),
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
        };
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code); // check if it has canDeposit
        const request = {
            'ticker': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'address': address,
        };
        let uniqueId = this.safeValue (params, 'uniqueId');
        if (uniqueId === undefined) {
            uniqueId = this.uuid22 ();
        }
        request['uniqueId'] = uniqueId;
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        if (this.isFiat (code)) {
            const provider = this.safeValue (params, 'provider');
            if (provider === undefined) {
                throw new ArgumentsRequired (this.id + ' withdraw() requires a provider when the ticker is fiat');
            }
            request['provider'] = provider;
        }
        const response = await this.v4PrivatePostMainAccountWithdraw (this.extend (request, params));
        //
        // empty array with a success status
        // go to deposit/withdraw history and check you request status by uniqueId
        //
        //     []
        //
        return this.extend ({ 'id': uniqueId }, this.parseTransaction (response, currency));
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         "address": "3ApEASLcrQtZpg1TsssFgYF5V5YQJAKvuE",                                              // deposit address
        //         "uniqueId": null,                                                                             // unique Id of deposit
        //         "createdAt": 1593437922,                                                                      // timestamp of deposit
        //         "currency": "Bitcoin",                                                                        // deposit currency
        //         "ticker": "BTC",                                                                              // deposit currency ticker
        //         "method": 1,                                                                                  // called method 1 - deposit, 2 - withdraw
        //         "amount": "0.0006",                                                                           // amount of deposit
        //         "description": "",                                                                            // deposit description
        //         "memo": "",                                                                                   // deposit memo
        //         "fee": "0",                                                                                   // deposit fee
        //         "status": 15,                                                                                 // transactions status
        //         "network": null,                                                                              // if currency is multinetwork
        //         "transactionHash": "a275a514013e4e0f927fd0d1bed215e7f6f2c4c6ce762836fe135ec22529d886",        // deposit transaction hash
        //         "details": {
        //             "partial": {                                                                              // details about partially successful withdrawals
        //                 "requestAmount": "50000",                                                             // requested withdrawal amount
        //                 "processedAmount": "39000",                                                           // processed withdrawal amount
        //                 "processedFee": "273",                                                                // fee for processed withdrawal amount
        //                 "normalizeTransaction": ""                                                            // deposit id
        //             }
        //         },
        //         "confirmations": {                                                                            // if transaction status == 15 you can see this object
        //             "actual": 1,                                                                              // current block confirmations
        //             "required": 2                                                                             // required block confirmation for successful deposit
        //         }
        //     }
        //
        currency = this.safeCurrency (undefined, currency);
        const address = this.safeString (transaction, 'address');
        const timestamp = this.safeTimestamp (transaction, 'createdAt');
        const currencyId = this.safeString (transaction, 'ticker');
        const status = this.safeString (transaction, 'status');
        const method = this.safeString (transaction, 'method');
        return {
            'id': this.safeString (transaction, 'uniqueId'),
            'txid': this.safeString (transaction, 'transactionHash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.safeString (transaction, 'network'),
            'addressFrom': (method === '1') ? address : undefined,
            'address': address,
            'addressTo': (method === '2') ? address : undefined,
            'amount': this.safeNumber (transaction, 'amount'),
            'type': (method === '1') ? 'deposit' : 'withdrawal',
            'currency': this.safeCurrencyCode (currencyId, currency),
            'status': this.parseTransactionStatus (status),
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': this.safeString (transaction, 'description'),
            'fee': {
                'cost': this.safeNumber (transaction, 'fee'),
                'currency': this.safeCurrencyCode (currencyId, currency),
            },
            'info': transaction,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            '1': 'pending',
            '2': 'pending',
            '3': 'ok',
            '4': 'canceled',
            '5': 'pending',
            '6': 'pending',
            '7': 'ok',
            '9': 'canceled',
            '10': 'pending',
            '11': 'pending',
            '12': 'pending',
            '13': 'pending',
            '14': 'pending',
            '15': 'pending',
            '16': 'pending',
            '17': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchDeposit (id: string, code: string = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchDeposit
         * @description fetch information on a deposit
         * @param {string} id deposit id
         * @param {string|undefined} code not used by whitebit fetchDeposit ()
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            'transactionMethod': 1,
            'uniqueId': id,
            'limit': 1,
            'offset': 0,
        };
        if (code !== undefined) {
            currency = this.currency (code);
            request['ticker'] = currency['id'];
        }
        const response = await this.v4PrivatePostMainAccountHistory (this.extend (request, params));
        //
        //     {
        //         "limit": 100,
        //         "offset": 0,
        //         "records": [
        //             {
        //                 "address": "3ApEASLcrQtZpg1TsssFgYF5V5YQJAKvuE",                                              // deposit address
        //                 "uniqueId": null,                                                                             // unique Id of deposit
        //                 "createdAt": 1593437922,                                                                      // timestamp of deposit
        //                 "currency": "Bitcoin",                                                                        // deposit currency
        //                 "ticker": "BTC",                                                                              // deposit currency ticker
        //                 "method": 1,                                                                                  // called method 1 - deposit, 2 - withdraw
        //                 "amount": "0.0006",                                                                           // amount of deposit
        //                 "description": "",                                                                            // deposit description
        //                 "memo": "",                                                                                   // deposit memo
        //                 "fee": "0",                                                                                   // deposit fee
        //                 "status": 15,                                                                                 // transactions status
        //                 "network": null,                                                                              // if currency is multinetwork
        //                 "transactionHash": "a275a514013e4e0f927fd0d1bed215e7f6f2c4c6ce762836fe135ec22529d886",        // deposit transaction hash
        //                 "details": {
        //                     "partial": {                                                                              // details about partially successful withdrawals
        //                         "requestAmount": "50000",                                                             // requested withdrawal amount
        //                         "processedAmount": "39000",                                                           // processed withdrawal amount
        //                         "processedFee": "273",                                                                // fee for processed withdrawal amount
        //                         "normalizeTransaction": ""                                                            // deposit id
        //                     }
        //                 },
        //                 "confirmations": {                                                                            // if transaction status == 15 you can see this object
        //                     "actual": 1,                                                                              // current block confirmations
        //                     "required": 2                                                                             // required block confirmation for successful deposit
        //                 }
        //             },
        //             {...},
        //         ],
        //         "total": 300                                                                                             // total number of  transactions, use this for calculating ‘limit’ and ‘offset'
        //     }
        //
        const records = this.safeValue (response, 'records', []);
        const first = this.safeValue (records, 0, {});
        return this.parseTransaction (first, currency);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            'transactionMethod': 1,
            'limit': 100,
            'offset': 0,
        };
        if (code !== undefined) {
            currency = this.currency (code);
            request['ticker'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 100);
        }
        const response = await this.v4PrivatePostMainAccountHistory (this.extend (request, params));
        //
        //     {
        //         "limit": 100,
        //         "offset": 0,
        //         "records": [
        //             {
        //                 "address": "3ApEASLcrQtZpg1TsssFgYF5V5YQJAKvuE",                                              // deposit address
        //                 "uniqueId": null,                                                                             // unique Id of deposit
        //                 "createdAt": 1593437922,                                                                      // timestamp of deposit
        //                 "currency": "Bitcoin",                                                                        // deposit currency
        //                 "ticker": "BTC",                                                                              // deposit currency ticker
        //                 "method": 1,                                                                                  // called method 1 - deposit, 2 - withdraw
        //                 "amount": "0.0006",                                                                           // amount of deposit
        //                 "description": "",                                                                            // deposit description
        //                 "memo": "",                                                                                   // deposit memo
        //                 "fee": "0",                                                                                   // deposit fee
        //                 "status": 15,                                                                                 // transactions status
        //                 "network": null,                                                                              // if currency is multinetwork
        //                 "transactionHash": "a275a514013e4e0f927fd0d1bed215e7f6f2c4c6ce762836fe135ec22529d886",        // deposit transaction hash
        //                 "details": {
        //                     "partial": {                                                                              // details about partially successful withdrawals
        //                         "requestAmount": "50000",                                                             // requested withdrawal amount
        //                         "processedAmount": "39000",                                                           // processed withdrawal amount
        //                         "processedFee": "273",                                                                // fee for processed withdrawal amount
        //                         "normalizeTransaction": ""                                                            // deposit id
        //                     }
        //                 },
        //                 "confirmations": {                                                                            // if transaction status == 15 you can see this object
        //                     "actual": 1,                                                                              // current block confirmations
        //                     "required": 2                                                                             // required block confirmation for successful deposit
        //                 }
        //             },
        //             {...},
        //         ],
        //         "total": 300                                                                                             // total number of  transactions, use this for calculating ‘limit’ and ‘offset'
        //     }
        //
        const records = this.safeValue (response, 'records', []);
        return this.parseTransactions (records, currency, since, limit);
    }

    async fetchBorrowInterest (code: string = undefined, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchBorrowInterest
         * @description fetch the interest owed by the user for borrowing currency for margin trading
         * @see https://github.com/whitebit-exchange/api-docs/blob/main/docs/Private/http-trade-v4.md#open-positions
         * @param {string|undefined} code unified currency code
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch borrrow interest for
         * @param {int|undefined} limit the maximum number of structures to retrieve
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {[object]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.v4PrivatePostCollateralAccountPositionsOpen (this.extend (request, params));
        //
        //     [
        //         {
        //             "positionId": 191823,
        //             "market": "BTC_USDT",
        //             "openDate": 1660340344.027163,
        //             "modifyDate": 1660340344.027163,
        //             "amount": "0.003075",
        //             "basePrice": "24149.24512",
        //             "liquidationPrice": "7059.02",
        //             "leverage": "5",
        //             "pnl": "-0.15",
        //             "pnlPercent": "-0.20",
        //             "margin": "14.86",
        //             "freeMargin": "44.99",
        //             "funding": "0",
        //             "unrealizedFunding": "0.0000307828284903",
        //             "liquidationState": null
        //         }
        //     ]
        //
        const interest = this.parseBorrowInterests (response, market);
        return this.filterByCurrencySinceLimit (interest, code, since, limit);
    }

    parseBorrowInterest (info, market = undefined) {
        //
        //     {
        //         "positionId": 191823,
        //         "market": "BTC_USDT",
        //         "openDate": 1660340344.027163,
        //         "modifyDate": 1660340344.027163,
        //         "amount": "0.003075",
        //         "basePrice": "24149.24512",
        //         "liquidationPrice": "7059.02",
        //         "leverage": "5",
        //         "pnl": "-0.15",
        //         "pnlPercent": "-0.20",
        //         "margin": "14.86",
        //         "freeMargin": "44.99",
        //         "funding": "0",
        //         "unrealizedFunding": "0.0000307828284903",
        //         "liquidationState": null
        //     }
        //
        const marketId = this.safeString (info, 'market');
        const symbol = this.safeSymbol (marketId, market, '_');
        const timestamp = this.safeTimestamp (info, 'modifyDate');
        return {
            'symbol': symbol,
            'marginMode': 'cross',
            'currency': 'USDT',
            'interest': this.safeNumber (info, 'unrealizedFunding'),
            'interestRate': 0.00098, // https://whitebit.com/fees
            'amountBorrowed': this.safeNumber (info, 'amount'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    isFiat (currency) {
        const fiatCurrencies = this.safeValue (this.options, 'fiatCurrencies', []);
        return this.inArray (currency, fiatCurrencies);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        const version = this.safeValue (api as any, 0);
        const accessibility = this.safeValue (api as any, 1);
        const pathWithParams = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][version][accessibility] + pathWithParams;
        if (accessibility === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (accessibility === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const secret = this.encode (this.secret);
            const request = '/' + 'api' + '/' + version + pathWithParams;
            body = this.json (this.extend ({ 'request': request, 'nonce': nonce }, params));
            const payload = this.stringToBase64 (body);
            const signature = this.hmac (this.encode (payload), secret, sha512);
            headers = {
                'Content-Type': 'application/json',
                'X-TXC-APIKEY': this.apiKey,
                'X-TXC-PAYLOAD': payload,
                'X-TXC-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (code === 404) {
            throw new ExchangeError (this.id + ' ' + code.toString () + ' endpoint not found');
        }
        if (response !== undefined) {
            // For cases where we have a meaningful status
            // {"response":null,"status":422,"errors":{"orderId":["Finished order id 435453454535 not found on your account"]},"notification":null,"warning":"Finished order id 435453454535 not found on your account","_token":null}
            const status = this.safeString (response, 'status');
            // {"code":10,"message":"Unauthorized request."}
            const message = this.safeString (response, 'message');
            // For these cases where we have a generic code variable error key
            // {"code":0,"message":"Validation failed","errors":{"amount":["Amount must be greater than 0"]}}
            const codeNew = this.safeInteger (response, 'code');
            const hasErrorStatus = status !== undefined && status !== '200';
            if (hasErrorStatus || codeNew !== undefined) {
                const feedback = this.id + ' ' + body;
                let errorInfo = message;
                if (hasErrorStatus) {
                    errorInfo = status;
                } else {
                    const errorObject = this.safeValue (response, 'errors');
                    if (errorObject !== undefined) {
                        const errorKey = Object.keys (errorObject)[0];
                        const errorMessageArray = this.safeValue (errorObject, errorKey, []);
                        const errorMessageLength = errorMessageArray.length;
                        errorInfo = (errorMessageLength > 0) ? errorMessageArray[0] : body;
                    }
                }
                this.throwExactlyMatchedException (this.exceptions['exact'], errorInfo, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
                throw new ExchangeError (feedback);
            }
        }
        return undefined;
    }
}
