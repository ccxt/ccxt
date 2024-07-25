'use strict';

var whitebit$1 = require('./abstract/whitebit.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha512 = require('./static_dependencies/noble-hashes/sha512.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class whitebit
 * @augments Exchange
 */
class whitebit extends whitebit$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'whitebit',
            'name': 'WhiteBit',
            'version': 'v4',
            'countries': ['EE'],
            'rateLimit': 50,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchOrderTrades': true,
                'fetchPositionMode': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactionFees': true,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
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
                            'futures',
                            'platform/status',
                        ],
                    },
                    'private': {
                        'post': [
                            'collateral-account/balance',
                            'collateral-account/balance-summary',
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
                            'main-account/smart/plans',
                            'main-account/smart/investment',
                            'main-account/smart/investment/close',
                            'main-account/smart/investments',
                            'main-account/fee',
                            'main-account/smart/interest-payment-history',
                            'trade-account/balance',
                            'trade-account/executed-history',
                            'trade-account/order',
                            'trade-account/order/history',
                            'order/collateral/limit',
                            'order/collateral/market',
                            'order/collateral/stop-limit',
                            'order/collateral/trigger-market',
                            'order/new',
                            'order/market',
                            'order/stock_market',
                            'order/stop_limit',
                            'order/stop_market',
                            'order/cancel',
                            'order/cancel/all',
                            'order/kill-switch',
                            'order/kill-switch/status',
                            'order/bulk',
                            'order/modify',
                            'orders',
                            'oco-orders',
                            'order/collateral/oco',
                            'order/oco-cancel',
                            'order/oto-cancel',
                            'profile/websocket_token',
                            'convert/estimate',
                            'convert/confirm',
                            'convert/history',
                            'sub-account/create',
                            'sub-account/delete',
                            'sub-account/edit',
                            'sub-account/list',
                            'sub-account/transfer',
                            'sub-account/block',
                            'sub-account/unblock',
                            'sub-account/balances',
                            'sub-account/transfer/history',
                        ],
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber('0.001'),
                    'maker': this.parseNumber('0.001'),
                },
            },
            'options': {
                'fiatCurrencies': ['EUR', 'USD', 'RUB', 'UAH'],
                'fetchBalance': {
                    'account': 'spot',
                },
                'accountsByType': {
                    'funding': 'main',
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
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'exact': {
                    'Unauthorized request.': errors.AuthenticationError,
                    'The market format is invalid.': errors.BadSymbol,
                    'Market is not available': errors.BadSymbol,
                    'Invalid payload.': errors.BadRequest,
                    'Amount must be greater than 0': errors.InvalidOrder,
                    'Not enough balance.': errors.InsufficientFunds,
                    'The order id field is required.': errors.InvalidOrder,
                    'Not enough balance': errors.InsufficientFunds,
                    'This action is unauthorized.': errors.PermissionDenied,
                    'This API Key is not authorized to perform this action.': errors.PermissionDenied,
                    'Unexecuted order was not found.': errors.OrderNotFound,
                    'The selected from is invalid.': errors.BadRequest,
                    '503': errors.ExchangeNotAvailable,
                    '422': errors.OrderNotFound, // {"response":null,"status":422,"errors":{"orderId":["Finished order id 1295772653 not found on your account"]},"notification":null,"warning":"Finished order id 1295772653 not found on your account","_token":null}
                },
                'broad': {
                    'This action is unauthorized': errors.PermissionDenied,
                    'Given amount is less than min amount': errors.InvalidOrder,
                    'Total is less than': errors.InvalidOrder,
                    'fee must be no less than': errors.InvalidOrder,
                    'Enable your key in API settings': errors.PermissionDenied,
                    'You don\'t have such amount for transfer': errors.InsufficientFunds, // {"code":3,"message":"Inner validation failed","errors":{"amount":["You don't have such amount for transfer (available 0.44523433, in amount: 2)"]}}
                },
            },
        });
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name whitebit#fetchMarkets
         * @description retrieves data on all markets for whitebit
         * @see https://docs.whitebit.com/public/http-v4/#market-info
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const markets = await this.v4PublicGetMarkets();
        //
        //    [
        //        {
        //          "name": "SON_USD",         // Market pair name
        //          "stock": "SON",            // Ticker of stock currency
        //          "money": "USD",            // Ticker of money currency
        //          "stockPrec": "3",          // Stock currency precision
        //          "moneyPrec": "2",          // Precision of money currency
        //          "feePrec": "4",            // Fee precision
        //          "makerFee": "0.1",         // Default maker fee ratio
        //          "takerFee": "0.1",         // Default taker fee ratio
        //          "minAmount": "0.001",      // Minimal amount of stock to trade
        //          "minTotal": "0.001",       // Minimal amount of money to trade
        //          "tradesEnabled": true,     // Is trading enabled
        //          "isCollateral": true,      // Is margin trading enabled
        //          "type": "spot",            // Market type. Possible values: "spot", "futures"
        //          "maxTotal": "1000000000"   // Maximum total(amount * price) of money to trade
        //        },
        //        {
        //          ...
        //        }
        //    ]
        //
        return this.parseMarkets(markets);
    }
    parseMarket(market) {
        const id = this.safeString(market, 'name');
        const baseId = this.safeString(market, 'stock');
        let quoteId = this.safeString(market, 'money');
        quoteId = (quoteId === 'PERP') ? 'USDT' : quoteId;
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const active = this.safeValue(market, 'tradesEnabled');
        const isCollateral = this.safeValue(market, 'isCollateral');
        const typeId = this.safeString(market, 'type');
        let type;
        let settle = undefined;
        let settleId = undefined;
        let symbol = base + '/' + quote;
        const swap = typeId === 'futures';
        const margin = isCollateral && !swap;
        let contract = false;
        const amountPrecision = this.parseNumber(this.parsePrecision(this.safeString(market, 'stockPrec')));
        const contractSize = amountPrecision;
        let linear = undefined;
        let inverse = undefined;
        if (swap) {
            settleId = quoteId;
            settle = this.safeCurrencyCode(settleId);
            symbol = symbol + ':' + settle;
            type = 'swap';
            contract = true;
            linear = true;
            inverse = false;
        }
        else {
            type = 'spot';
        }
        const takerFeeRate = this.safeString(market, 'takerFee');
        const taker = Precise["default"].stringDiv(takerFeeRate, '100');
        const makerFeeRate = this.safeString(market, 'makerFee');
        const maker = Precise["default"].stringDiv(makerFeeRate, '100');
        return {
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
            'taker': this.parseNumber(taker),
            'maker': this.parseNumber(maker),
            'contractSize': contractSize,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': amountPrecision,
                'price': this.parseNumber(this.parsePrecision(this.safeString(market, 'moneyPrec'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(market, 'minAmount'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber(market, 'minTotal'),
                    'max': this.safeNumber(market, 'maxTotal'),
                },
            },
            'created': undefined,
            'info': market,
        };
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name whitebit#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://docs.whitebit.com/public/http-v4/#asset-status-list
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.v4PublicGetAssets(params);
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
        const ids = Object.keys(response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = response[id];
            // breaks down in Python due to utf8 encoding issues on the exchange side
            // const name = this.safeString (currency, 'name');
            const canDeposit = this.safeBool(currency, 'can_deposit', true);
            const canWithdraw = this.safeBool(currency, 'can_withdraw', true);
            const active = canDeposit && canWithdraw;
            const code = this.safeCurrencyCode(id);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': undefined,
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
                        'min': this.safeNumber(currency, 'min_withdraw'),
                        'max': this.safeNumber(currency, 'max_withdraw'),
                    },
                },
            };
        }
        return result;
    }
    async fetchTransactionFees(codes = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchTransactionFees
         * @deprecated
         * @description please use fetchDepositWithdrawFees instead
         * @see https://docs.whitebit.com/public/http-v4/#fee
         * @param {string[]|undefined} codes not used by fetchTransactionFees ()
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets();
        const response = await this.v4PublicGetFee(params);
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
        const currenciesIds = Object.keys(response);
        const withdrawFees = {};
        const depositFees = {};
        for (let i = 0; i < currenciesIds.length; i++) {
            const currency = currenciesIds[i];
            const data = response[currency];
            const code = this.safeCurrencyCode(currency);
            const withdraw = this.safeValue(data, 'withdraw', {});
            withdrawFees[code] = this.safeString(withdraw, 'fixed');
            const deposit = this.safeValue(data, 'deposit', {});
            depositFees[code] = this.safeString(deposit, 'fixed');
        }
        return {
            'withdraw': withdrawFees,
            'deposit': depositFees,
            'info': response,
        };
    }
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://docs.whitebit.com/public/http-v4/#fee
         * @param {string[]|undefined} codes not used by fetchDepositWithdrawFees ()
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets();
        const response = await this.v4PublicGetFee(params);
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
        //        "WBT (ERC20)": {
        //            "is_depositable": true,
        //            "is_withdrawal": true,
        //            "ticker": "WBT",
        //            "name": "WhiteBIT Token",
        //            "providers": [],
        //            "withdraw": { max_amount: "0", min_amount: '0.7', fixed: "0.253", flex: null },
        //            "deposit": { max_amount: "0", min_amount: "0.35", fixed: null, flex: null }
        //        },
        //        "WBT (TRC20)": {
        //            "is_depositable": true,
        //            "is_withdrawal": true,
        //            "ticker": "WBT",
        //            "name": "WhiteBIT Token",
        //            "providers": [],
        //            "withdraw": { max_amount: "0", min_amount: "1.5", fixed: "0.075", flex: null },
        //            "deposit": { max_amount: "0", min_amount: "0.75", fixed: null, flex: null }
        //        },
        //        ...
        //    }
        //
        return this.parseDepositWithdrawFees(response, codes);
    }
    parseDepositWithdrawFees(response, codes = undefined, currencyIdKey = undefined) {
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
        //        "WBT (ERC20)": {
        //            "is_depositable": true,
        //            "is_withdrawal": true,
        //            "ticker": "WBT",
        //            "name": "WhiteBIT Token",
        //            "providers": [],
        //            "withdraw": { max_amount: "0", min_amount: "0.7", fixed: "0.253", flex: null },
        //            "deposit": { max_amount: "0", min_amount: "0.35", fixed: null, flex: null }
        //        },
        //        "WBT (TRC20)": {
        //            "is_depositable": true,
        //            "is_withdrawal": true,
        //            "ticker": "WBT",
        //            "name": "WhiteBIT Token",
        //            "providers": [],
        //            "withdraw": { max_amount: "0", min_amount: "1.5", fixed: "0.075", flex: null },
        //            "deposit": { max_amount: "0", min_amount: "0.75", fixed: null, flex: null }
        //        },
        //        ...
        //    }
        //
        const depositWithdrawFees = {};
        codes = this.marketCodes(codes);
        const currencyIds = Object.keys(response);
        for (let i = 0; i < currencyIds.length; i++) {
            const entry = currencyIds[i];
            const splitEntry = entry.split(' ');
            const currencyId = splitEntry[0];
            const feeInfo = response[entry];
            const code = this.safeCurrencyCode(currencyId);
            if ((codes === undefined) || (this.inArray(code, codes))) {
                const depositWithdrawFee = this.safeValue(depositWithdrawFees, code);
                if (depositWithdrawFee === undefined) {
                    depositWithdrawFees[code] = this.depositWithdrawFee({});
                }
                depositWithdrawFees[code]['info'][entry] = feeInfo;
                let networkId = this.safeString(splitEntry, 1);
                const withdraw = this.safeValue(feeInfo, 'withdraw');
                const deposit = this.safeValue(feeInfo, 'deposit');
                const withdrawFee = this.safeNumber(withdraw, 'fixed');
                const depositFee = this.safeNumber(deposit, 'fixed');
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
                    networkId = networkId.slice(1, networkLength - 1);
                    const networkCode = this.networkIdToCode(networkId);
                    depositWithdrawFees[code]['networks'][networkCode] = {
                        'withdraw': withdrawResult,
                        'deposit': depositResult,
                    };
                }
                else {
                    depositWithdrawFees[code]['withdraw'] = withdrawResult;
                    depositWithdrawFees[code]['deposit'] = depositResult;
                }
            }
        }
        const depositWithdrawCodes = Object.keys(depositWithdrawFees);
        for (let i = 0; i < depositWithdrawCodes.length; i++) {
            const code = depositWithdrawCodes[i];
            const currency = this.currency(code);
            depositWithdrawFees[code] = this.assignDefaultDepositWithdrawFees(depositWithdrawFees[code], currency);
        }
        return depositWithdrawFees;
    }
    async fetchTradingFees(params = {}) {
        /**
         * @method
         * @name whitebit#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @see https://docs.whitebit.com/public/http-v4/#asset-status-list
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const response = await this.v4PublicGetAssets(params);
        //
        //      {
        //          "1INCH": {
        //              "name": "1inch",
        //              "unified_cryptoasset_id": "8104",
        //              "can_withdraw": true,
        //              "can_deposit": true,
        //              "min_withdraw": "33",
        //              "max_withdraw": "0",
        //              "maker_fee": "0.1",
        //              "taker_fee": "0.1",
        //              "min_deposit": "30",
        //              "max_deposit": "0"
        //            },
        //            ...
        //      }
        //
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market(symbol);
            const fee = this.safeValue(response, market['baseId'], {});
            let makerFee = this.safeString(fee, 'maker_fee');
            let takerFee = this.safeString(fee, 'taker_fee');
            makerFee = Precise["default"].stringDiv(makerFee, '100');
            takerFee = Precise["default"].stringDiv(takerFee, '100');
            result[symbol] = {
                'info': fee,
                'symbol': market['symbol'],
                'percentage': true,
                'tierBased': false,
                'maker': this.parseNumber(makerFee),
                'taker': this.parseNumber(takerFee),
            };
        }
        return result;
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name whitebit#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.whitebit.com/public/http-v4/#market-activity
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v1PublicGetTicker(this.extend(request, params));
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
        const ticker = this.safeDict(response, 'result', {});
        return this.parseTicker(ticker, market);
    }
    parseTicker(ticker, market = undefined) {
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
        market = this.safeMarket(undefined, market);
        const last = this.safeString(ticker, 'last_price');
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': this.safeString(ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString(ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString(ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString(ticker, 'change'),
            'average': undefined,
            'baseVolume': this.safeString2(ticker, 'base_volume', 'volume'),
            'quoteVolume': this.safeString2(ticker, 'quote_volume', 'deal'),
            'info': ticker,
        }, market);
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://docs.whitebit.com/public/http-v4/#market-activity
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.v4PublicGetTicker(params);
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
        const marketIds = Object.keys(response);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket(marketId);
            const ticker = this.parseTicker(response[marketId], market);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.whitebit.com/public/http-v4/#orderbook
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 100, maximum = 100
        }
        const response = await this.v4PublicGetOrderbookMarket(this.extend(request, params));
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
        const timestamp = this.safeTimestamp(response, 'timestamp');
        return this.parseOrderBook(response, symbol, timestamp);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.whitebit.com/public/http-v4/#recent-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v4PublicGetTradesMarket(this.extend(request, params));
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
        return this.parseTrades(response, market, since, limit);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://docs.whitebit.com/private/http-trade-v4/#query-executed-order-history
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        const response = await this.v4PrivatePostTradeAccountExecutedHistory(this.extend(request, params));
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
        //             "id": 1343815269,
        //             "clientOrderId": '',
        //             "time": 1641051917.532965,
        //             "side": "sell",
        //             "role": 2,
        //             "amount": "9.986",
        //             "price": "0.9995",
        //             "deal": "9.981007",
        //             "fee": "0.009981007",
        //             "orderId": 58166729555,
        //         },
        //     ]
        //
        if (Array.isArray(response)) {
            return this.parseTrades(response, market, since, limit);
        }
        else {
            let results = [];
            const keys = Object.keys(response);
            for (let i = 0; i < keys.length; i++) {
                const marketId = keys[i];
                const marketNew = this.safeMarket(marketId, undefined, '_');
                const rawTrades = this.safeValue(response, marketId, []);
                const parsed = this.parseTrades(rawTrades, marketNew, since, limit);
                results = this.arrayConcat(results, parsed);
            }
            results = this.sortBy2(results, 'timestamp', 'id');
            return this.filterBySinceLimit(results, since, limit, 'timestamp');
        }
    }
    parseTrade(trade, market = undefined) {
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
        //          "id": 1343815269,
        //          "clientOrderId": '',
        //          "time": 1641051917.532965,
        //          "side": "sell",
        //          "role": 2,
        //          "amount": "9.986",
        //          "price": "0.9995",
        //          "deal": "9.981007",
        //          "fee": "0.009981007",
        //          "orderId": 58166729555,
        //      }
        //
        market = this.safeMarket(undefined, market);
        const timestamp = this.safeTimestamp2(trade, 'time', 'trade_timestamp');
        const orderId = this.safeString2(trade, 'dealOrderId', 'orderId');
        const cost = this.safeString(trade, 'deal');
        const price = this.safeString(trade, 'price');
        const amount = this.safeString2(trade, 'amount', 'quote_volume');
        const id = this.safeString2(trade, 'id', 'tradeID');
        const side = this.safeString2(trade, 'type', 'side');
        const symbol = market['symbol'];
        const role = this.safeInteger(trade, 'role');
        let takerOrMaker = undefined;
        if (role !== undefined) {
            takerOrMaker = (role === 1) ? 'maker' : 'taker';
        }
        let fee = undefined;
        const feeCost = this.safeString(trade, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['quote'],
            };
        }
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
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
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.whitebit.com/public/http-v1/#kline
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            const maxLimit = 1440;
            if (limit === undefined) {
                limit = maxLimit;
            }
            limit = Math.min(limit, maxLimit);
            const start = this.parseToInt(since / 1000);
            request['start'] = start;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1440);
        }
        const response = await this.v1PublicGetKline(this.extend(request, params));
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
        const result = this.safeList(response, 'result', []);
        return this.parseOHLCVs(result, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
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
            this.safeTimestamp(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 5), // volume
        ];
    }
    async fetchStatus(params = {}) {
        /**
         * @method
         * @name whitebit#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @see https://docs.whitebit.com/public/http-v4/#server-status
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.v4PublicGetPing(params);
        //
        //      [
        //          "pong"
        //      ]
        //
        const status = this.safeString(response, 0);
        return {
            'status': (status === 'pong') ? 'ok' : status,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    async fetchTime(params = {}) {
        /**
         * @method
         * @name whitebit#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://docs.whitebit.com/public/http-v4/#server-time
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.v4PublicGetTime(params);
        //
        //     {
        //         "time":1635467280514
        //     }
        //
        return this.safeInteger(response, 'time');
    }
    async createMarketOrderWithCost(symbol, side, cost, params = {}) {
        /**
         * @method
         * @name whitebit#createMarketOrderWithCost
         * @description create a market order by providing the symbol, side and cost
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} side 'buy' or 'sell'
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        params['cost'] = cost;
        // only buy side is supported
        return await this.createOrder(symbol, 'market', side, 0, undefined, params);
    }
    async createMarketBuyOrderWithCost(symbol, cost, params = {}) {
        /**
         * @method
         * @name whitebit#createMarketBuyOrderWithCost
         * @description create a market buy order by providing the symbol and cost
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        return await this.createMarketOrderWithCost(symbol, 'buy', cost, params);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#createOrder
         * @description create a trade order
         * @see https://docs.whitebit.com/private/http-trade-v4/#create-limit-order
         * @see https://docs.whitebit.com/private/http-trade-v4/#create-market-order
         * @see https://docs.whitebit.com/private/http-trade-v4/#create-buy-stock-market-order
         * @see https://docs.whitebit.com/private/http-trade-v4/#create-stop-limit-order
         * @see https://docs.whitebit.com/private/http-trade-v4/#create-stop-market-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.cost] *market orders only* the cost of the order in units of the base currency
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
            'side': side,
        };
        let cost = undefined;
        [cost, params] = this.handleParamString(params, 'cost');
        if (cost !== undefined) {
            if ((side !== 'buy') || (type !== 'market')) {
                throw new errors.InvalidOrder(this.id + ' createOrder() cost is only supported for market buy orders');
            }
            request['amount'] = this.costToPrecision(symbol, cost);
        }
        else {
            request['amount'] = this.amountToPrecision(symbol, amount);
        }
        const clientOrderId = this.safeString2(params, 'clOrdId', 'clientOrderId');
        if (clientOrderId === undefined) {
            const brokerId = this.safeString(this.options, 'brokerId');
            if (brokerId !== undefined) {
                request['clientOrderId'] = brokerId + this.uuid16();
            }
        }
        else {
            request['clientOrderId'] = clientOrderId;
            params = this.omit(params, ['clientOrderId']);
        }
        const marketType = this.safeString(market, 'type');
        const isLimitOrder = type === 'limit';
        const isMarketOrder = type === 'market';
        const stopPrice = this.safeNumberN(params, ['triggerPrice', 'stopPrice', 'activation_price']);
        const isStopOrder = (stopPrice !== undefined);
        const postOnly = this.isPostOnly(isMarketOrder, false, params);
        const [marginMode, query] = this.handleMarginModeAndParams('createOrder', params);
        if (postOnly) {
            request['postOnly'] = true;
        }
        if (marginMode !== undefined && marginMode !== 'cross') {
            throw new errors.NotSupported(this.id + ' createOrder() is only available for cross margin');
        }
        params = this.omit(query, ['postOnly', 'triggerPrice', 'stopPrice']);
        const useCollateralEndpoint = marginMode !== undefined || marketType === 'swap';
        let response = undefined;
        if (isStopOrder) {
            request['activation_price'] = this.priceToPrecision(symbol, stopPrice);
            if (isLimitOrder) {
                // stop limit order
                request['price'] = this.priceToPrecision(symbol, price);
                response = await this.v4PrivatePostOrderStopLimit(this.extend(request, params));
            }
            else {
                // stop market order
                if (useCollateralEndpoint) {
                    response = await this.v4PrivatePostOrderCollateralTriggerMarket(this.extend(request, params));
                }
                else {
                    response = await this.v4PrivatePostOrderStopMarket(this.extend(request, params));
                }
            }
        }
        else {
            if (isLimitOrder) {
                // limit order
                request['price'] = this.priceToPrecision(symbol, price);
                if (useCollateralEndpoint) {
                    response = await this.v4PrivatePostOrderCollateralLimit(this.extend(request, params));
                }
                else {
                    response = await this.v4PrivatePostOrderNew(this.extend(request, params));
                }
            }
            else {
                // market order
                if (useCollateralEndpoint) {
                    response = await this.v4PrivatePostOrderCollateralMarket(this.extend(request, params));
                }
                else {
                    if (cost !== undefined) {
                        response = await this.v4PrivatePostOrderMarket(this.extend(request, params));
                    }
                    else {
                        response = await this.v4PrivatePostOrderStockMarket(this.extend(request, params));
                    }
                }
            }
        }
        return this.parseOrder(response);
    }
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#editOrder
         * @description edit a trade order
         * @see https://docs.whitebit.com/private/http-trade-v4/#modify-order
         * @param {string} id cancel order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (id === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' editOrder() requires a id argument');
        }
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' editOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'orderId': id,
            'market': market['id'],
        };
        const clientOrderId = this.safeString2(params, 'clOrdId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            // Update clientOrderId of the order
            request['clientOrderId'] = clientOrderId;
        }
        const isLimitOrder = type === 'limit';
        const stopPrice = this.safeNumberN(params, ['triggerPrice', 'stopPrice', 'activation_price']);
        const isStopOrder = (stopPrice !== undefined);
        params = this.omit(params, ['clOrdId', 'clientOrderId', 'triggerPrice', 'stopPrice']);
        if (isStopOrder) {
            request['activation_price'] = this.priceToPrecision(symbol, stopPrice);
            if (isLimitOrder) {
                // stop limit order
                request['amount'] = this.amountToPrecision(symbol, amount);
                request['price'] = this.priceToPrecision(symbol, price);
            }
            else {
                // stop market order
                if (side === 'buy') {
                    // Use total parameter instead of amount for modify buy stop market order
                    request['total'] = this.amountToPrecision(symbol, amount);
                }
                else {
                    request['amount'] = this.amountToPrecision(symbol, amount);
                }
            }
        }
        else {
            request['amount'] = this.amountToPrecision(symbol, amount);
            if (isLimitOrder) {
                // limit order
                request['price'] = this.priceToPrecision(symbol, price);
            }
        }
        const response = await this.v4PrivatePostOrderModify(this.extend(request, params));
        return this.parseOrder(response);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#cancelOrder
         * @description cancels an open order
         * @see https://docs.whitebit.com/private/http-trade-v4/#cancel-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
            'orderId': parseInt(id),
        };
        const response = await this.v4PrivatePostOrderCancel(this.extend(request, params));
        //
        //    {
        //        "orderId": 4180284841, // order id
        //        "clientOrderId": "customId11", // custom order identifier; "clientOrderId": "" - if not specified.
        //        "market": "BTC_USDT", // deal market
        //        "side": "buy", // order side
        //        "type": "stop market", // order type
        //        "timestamp": 1595792396.165973, // current timestamp
        //        "dealMoney": "0", // if order finished - amount in money currency that is finished
        //        "dealStock": "0", // if order finished - amount in stock currency that is finished
        //        "amount": "0.001", // amount
        //        "takerFee": "0.001", // maker fee ratio. If the number less than 0.0001 - it will be rounded to zero
        //        "makerFee": "0.001", // maker fee ratio. If the number less than 0.0001 - it will be rounded to zero
        //        "left": "0.001", // if order not finished - rest of the amount that must be finished
        //        "dealFee": "0", // fee in money that you pay if order is finished
        //        "price": "40000", // price if price isset
        //        "activation_price": "40000" // activation price if activation price is set
        //    }
        //
        return this.parseOrder(response);
    }
    async cancelAllOrders(symbol = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#cancelAllOrders
         * @description cancel all open orders
         * @see https://docs.whitebit.com/private/http-trade-v4/#cancel-all-orders
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] market type, ['swap', 'spot']
         * @param {boolean} [params.isMargin] cancel all margin orders
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('cancelAllOrders', market, params);
        const requestType = [];
        if (type === 'spot') {
            let isMargin = undefined;
            [isMargin, params] = this.handleOptionAndParams(params, 'cancelAllOrders', 'isMargin', false);
            if (isMargin) {
                requestType.push('margin');
            }
            else {
                requestType.push('spot');
            }
        }
        else if (type === 'swap') {
            requestType.push('futures');
        }
        else {
            throw new errors.NotSupported(this.id + ' cancelAllOrders() does not support ' + type + ' type');
        }
        request['type'] = requestType;
        const response = await this.v4PrivatePostOrderCancelAll(this.extend(request, params));
        //
        // []
        //
        return this.parseOrders(response, market);
    }
    async cancelAllOrdersAfter(timeout, params = {}) {
        /**
         * @method
         * @name whitebit#cancelAllOrdersAfter
         * @description dead man's switch, cancel all orders after the given timeout
         * @see https://docs.whitebit.com/private/http-trade-v4/#sync-kill-switch-timer
         * @param {number} timeout time in milliseconds, 0 represents cancel the timer
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.types] Order types value. Example: "spot", "margin", "futures" or null
         * @param {string} [params.symbol] symbol unified symbol of the market the order was made in
         * @returns {object} the api result
         */
        await this.loadMarkets();
        const symbol = this.safeString(params, 'symbol');
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelAllOrdersAfter() requires a symbol argument in params');
        }
        const market = this.market(symbol);
        params = this.omit(params, 'symbol');
        const isBiggerThanZero = (timeout > 0);
        const request = {
            'market': market['id'],
            // 'timeout': (timeout > 0) ? this.numberToString (timeout / 1000) : null,
        };
        if (isBiggerThanZero) {
            request['timeout'] = this.numberToString(timeout / 1000);
        }
        else {
            request['timeout'] = 'null';
        }
        const response = await this.v4PrivatePostOrderKillSwitch(this.extend(request, params));
        //
        //     {
        //         "market": "BTC_USDT", // currency market,
        //         "startTime": 1662478154, // now timestamp,
        //         "cancellationTime": 1662478154, // now + timer_value,
        //         "types": ["spot", "margin"]
        //     }
        //
        return response;
    }
    parseBalance(response) {
        const balanceKeys = Object.keys(response);
        const result = {};
        for (let i = 0; i < balanceKeys.length; i++) {
            const id = balanceKeys[i];
            const code = this.safeCurrencyCode(id);
            const balance = response[id];
            if (typeof balance === 'object' && balance !== undefined) {
                const account = this.account();
                account['free'] = this.safeString2(balance, 'available', 'main_balance');
                account['used'] = this.safeString(balance, 'freeze');
                account['total'] = this.safeString(balance, 'main_balance');
                result[code] = account;
            }
            else {
                const account = this.account();
                account['total'] = balance;
                result[code] = account;
            }
        }
        return this.safeBalance(result);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name whitebit#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.whitebit.com/private/http-main-v4/#main-balance
         * @see https://docs.whitebit.com/private/http-trade-v4/#trading-balance
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets();
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        let response = undefined;
        if (marketType === 'swap') {
            response = await this.v4PrivatePostCollateralAccountBalance(params);
        }
        else {
            const options = this.safeValue(this.options, 'fetchBalance', {});
            const defaultAccount = this.safeString(options, 'account');
            const account = this.safeString2(params, 'account', 'type', defaultAccount);
            params = this.omit(params, ['account', 'type']);
            if (account === 'main' || account === 'funding') {
                response = await this.v4PrivatePostMainAccountBalance(params);
            }
            else {
                response = await this.v4PrivatePostTradeAccountBalance(params);
            }
        }
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
        return this.parseBalance(response);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://docs.whitebit.com/private/http-trade-v4/#query-unexecutedactive-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 100);
        }
        const response = await this.v4PrivatePostOrders(this.extend(request, params));
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
        return this.parseOrders(response, market, since, limit, { 'status': 'open' });
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://docs.whitebit.com/private/http-trade-v4/#query-executed-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 100); // default 50 max 100
        }
        const response = await this.v4PrivatePostTradeAccountOrderHistory(this.extend(request, params));
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
        const marketIds = Object.keys(response);
        let results = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const marketNew = this.safeMarket(marketId, undefined, '_');
            const orders = response[marketId];
            for (let j = 0; j < orders.length; j++) {
                const order = this.parseOrder(orders[j], marketNew);
                results.push(this.extend(order, { 'status': 'closed' }));
            }
        }
        results = this.sortBy(results, 'timestamp');
        results = this.filterBySymbolSinceLimit(results, symbol, since, limit);
        return results;
    }
    parseOrderType(type) {
        const types = {
            'limit': 'limit',
            'market': 'market',
            'stop market': 'market',
            'stop limit': 'limit',
            'stock market': 'market',
            'margin limit': 'limit',
            'margin market': 'market',
        };
        return this.safeString(types, type, type);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder, fetchOpenOrders, cancelOrder
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
        //          "price": "40000", // price if price isset
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
        const marketId = this.safeString(order, 'market');
        market = this.safeMarket(marketId, market, '_');
        const symbol = market['symbol'];
        const side = this.safeString(order, 'side');
        const filled = this.safeString(order, 'dealStock');
        let remaining = this.safeString(order, 'left');
        let clientOrderId = this.safeString(order, 'clientOrderId');
        if (clientOrderId === '') {
            clientOrderId = undefined;
        }
        const price = this.safeString(order, 'price');
        const stopPrice = this.safeNumber(order, 'activation_price');
        const orderId = this.safeString2(order, 'orderId', 'id');
        const type = this.safeString(order, 'type');
        const orderType = this.parseOrderType(type);
        if (orderType === 'market') {
            remaining = undefined;
        }
        let amount = this.safeString(order, 'amount');
        const cost = this.safeString(order, 'dealMoney');
        if ((side === 'buy') && ((type === 'market') || (type === 'stop market'))) {
            amount = filled;
        }
        const dealFee = this.safeString(order, 'dealFee');
        let fee = undefined;
        if (dealFee !== undefined) {
            fee = {
                'cost': this.parseNumber(dealFee),
                'currency': market['quote'],
            };
        }
        const timestamp = this.safeTimestamp2(order, 'ctime', 'timestamp');
        const lastTradeTimestamp = this.safeTimestamp(order, 'ftime');
        return this.safeOrder({
            'info': order,
            'id': orderId,
            'symbol': symbol,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'timeInForce': undefined,
            'postOnly': undefined,
            'status': undefined,
            'side': side,
            'price': price,
            'type': orderType,
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
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @see https://docs.whitebit.com/private/http-trade-v4/#query-executed-order-deals
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        const request = {
            'orderId': parseInt(id),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 100);
        }
        const response = await this.v4PrivatePostTradeAccountOrder(this.extend(request, params));
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
        const data = this.safeList(response, 'records', []);
        return this.parseTrades(data, market);
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name whitebit#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://docs.whitebit.com/private/http-main-v4/#get-fiat-deposit-address
         * @see https://docs.whitebit.com/private/http-main-v4/#get-cryptocurrency-deposit-address
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'ticker': currency['id'],
        };
        let response = undefined;
        if (this.isFiat(code)) {
            const provider = this.safeString(params, 'provider');
            if (provider === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchDepositAddress() requires a provider when the ticker is fiat');
            }
            request['provider'] = provider;
            const amount = this.safeNumber(params, 'amount');
            if (amount === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchDepositAddress() requires an amount when the ticker is fiat');
            }
            request['amount'] = amount;
            const uniqueId = this.safeValue(params, 'uniqueId');
            if (uniqueId === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchDepositAddress() requires an uniqueId when the ticker is fiat');
            }
            response = await this.v4PrivatePostMainAccountFiatDepositUrl(this.extend(request, params));
        }
        else {
            response = await this.v4PrivatePostMainAccountAddress(this.extend(request, params));
        }
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
        const url = this.safeString(response, 'url');
        const account = this.safeValue(response, 'account', {});
        const address = this.safeString(account, 'address', url);
        const tag = this.safeString(account, 'memo');
        this.checkAddress(address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }
    async setLeverage(leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#setLeverage
         * @description set the level of leverage for a market
         * @see https://docs.whitebit.com/private/http-trade-v4/#change-collateral-account-leverage
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} response from the exchange
         */
        await this.loadMarkets();
        if (symbol !== undefined) {
            throw new errors.NotSupported(this.id + ' setLeverage() does not allow to set per symbol');
        }
        if ((leverage < 1) || (leverage > 20)) {
            throw new errors.BadRequest(this.id + ' setLeverage() leverage should be between 1 and 20');
        }
        const request = {
            'leverage': leverage,
        };
        return await this.v4PrivatePostCollateralAccountLeverage(this.extend(request, params));
        //     {
        //         "leverage": 5
        //     }
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name whitebit#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://docs.whitebit.com/private/http-main-v4/#transfer-between-main-and-trade-balances
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from - main, spot, collateral
         * @param {string} toAccount account to transfer to - main, spot, collateral
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const accountsByType = this.safeValue(this.options, 'accountsByType');
        const fromAccountId = this.safeString(accountsByType, fromAccount, fromAccount);
        const toAccountId = this.safeString(accountsByType, toAccount, toAccount);
        const amountString = this.currencyToPrecision(code, amount);
        const request = {
            'ticker': currency['id'],
            'amount': amountString,
            'from': fromAccountId,
            'to': toAccountId,
        };
        const response = await this.v4PrivatePostMainAccountTransfer(this.extend(request, params));
        //
        //    []
        //
        return this.parseTransfer(response, currency);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        //    []
        //
        return {
            'info': transfer,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': this.safeCurrencyCode(undefined, currency),
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
        };
    }
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#withdraw
         * @description make a withdrawal
         * @see https://docs.whitebit.com/private/http-main-v4/#create-withdraw-request
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code); // check if it has canDeposit
        const request = {
            'ticker': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
            'address': address,
        };
        let uniqueId = this.safeValue(params, 'uniqueId');
        if (uniqueId === undefined) {
            uniqueId = this.uuid22();
        }
        request['uniqueId'] = uniqueId;
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        if (this.isFiat(code)) {
            const provider = this.safeValue(params, 'provider');
            if (provider === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' withdraw() requires a provider when the ticker is fiat');
            }
            request['provider'] = provider;
        }
        const response = await this.v4PrivatePostMainAccountWithdraw(this.extend(request, params));
        //
        // empty array with a success status
        // go to deposit/withdraw history and check you request status by uniqueId
        //
        //     []
        //
        return this.extend({ 'id': uniqueId }, this.parseTransaction(response, currency));
    }
    parseTransaction(transaction, currency = undefined) {
        //
        //     {
        //         "address": "3ApEASLcrQtZpg1TsssFgYF5V5YQJAKvuE",                                              // deposit address
        //         "uniqueId": null,                                                                             // unique Id of deposit
        //         "transactionId": "a6d71d69-2b17-4ad8-8b15-2d686c54a1a5",
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
        //         "centralized": false,
        //     }
        //
        currency = this.safeCurrency(undefined, currency);
        const address = this.safeString(transaction, 'address');
        const timestamp = this.safeTimestamp(transaction, 'createdAt');
        const currencyId = this.safeString(transaction, 'ticker');
        const status = this.safeString(transaction, 'status');
        const method = this.safeString(transaction, 'method');
        return {
            'id': this.safeString(transaction, 'uniqueId'),
            'txid': this.safeString(transaction, 'transactionId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': this.safeString(transaction, 'network'),
            'addressFrom': (method === '1') ? address : undefined,
            'address': address,
            'addressTo': (method === '2') ? address : undefined,
            'amount': this.safeNumber(transaction, 'amount'),
            'type': (method === '1') ? 'deposit' : 'withdrawal',
            'currency': this.safeCurrencyCode(currencyId, currency),
            'status': this.parseTransactionStatus(status),
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': this.safeString(transaction, 'description'),
            'internal': undefined,
            'fee': {
                'cost': this.safeNumber(transaction, 'fee'),
                'currency': this.safeCurrencyCode(currencyId, currency),
            },
            'info': transaction,
        };
    }
    parseTransactionStatus(status) {
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
        return this.safeString(statuses, status, status);
    }
    async fetchDeposit(id, code = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchDeposit
         * @description fetch information on a deposit
         * @see https://docs.whitebit.com/private/http-main-v4/#get-depositwithdraw-history
         * @param {string} id deposit id
         * @param {string} code not used by whitebit fetchDeposit ()
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        let currency = undefined;
        const request = {
            'transactionMethod': 1,
            'uniqueId': id,
            'limit': 1,
            'offset': 0,
        };
        if (code !== undefined) {
            currency = this.currency(code);
            request['ticker'] = currency['id'];
        }
        const response = await this.v4PrivatePostMainAccountHistory(this.extend(request, params));
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
        const records = this.safeValue(response, 'records', []);
        const first = this.safeDict(records, 0, {});
        return this.parseTransaction(first, currency);
    }
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://docs.whitebit.com/private/http-main-v4/#get-depositwithdraw-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        let currency = undefined;
        const request = {
            'transactionMethod': 1,
            'limit': 100,
            'offset': 0,
        };
        if (code !== undefined) {
            currency = this.currency(code);
            request['ticker'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 100);
        }
        const response = await this.v4PrivatePostMainAccountHistory(this.extend(request, params));
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
        const records = this.safeList(response, 'records', []);
        return this.parseTransactions(records, currency, since, limit);
    }
    async fetchBorrowInterest(code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchBorrowInterest
         * @description fetch the interest owed by the user for borrowing currency for margin trading
         * @see https://docs.whitebit.com/private/http-trade-v4/#open-positions
         * @param {string} code unified currency code
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch borrrow interest for
         * @param {int} [limit] the maximum number of structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
         */
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        const response = await this.v4PrivatePostCollateralAccountPositionsOpen(this.extend(request, params));
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
        const interest = this.parseBorrowInterests(response, market);
        return this.filterByCurrencySinceLimit(interest, code, since, limit);
    }
    parseBorrowInterest(info, market = undefined) {
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
        const marketId = this.safeString(info, 'market');
        const symbol = this.safeSymbol(marketId, market, '_');
        const timestamp = this.safeTimestamp(info, 'modifyDate');
        return {
            'symbol': symbol,
            'marginMode': 'cross',
            'currency': 'USDT',
            'interest': this.safeNumber(info, 'unrealizedFunding'),
            'interestRate': 0.00098,
            'amountBorrowed': this.safeNumber(info, 'amount'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': info,
        };
    }
    async fetchFundingRate(symbol, params = {}) {
        /**
         * @method
         * @name whitebit#fetchFundingRate
         * @see https://docs.whitebit.com/public/http-v4/#available-futures-markets-list
         * @description fetch the current funding rate
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const response = await this.fetchFundingRates([symbol], params);
        return this.safeValue(response, symbol);
    }
    async fetchFundingRates(symbols = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchFundingRates
         * @see https://docs.whitebit.com/public/http-v4/#available-futures-markets-list
         * @description fetch the funding rate for multiple markets
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.v4PublicGetFutures(params);
        //
        //    [
        //        {
        //            "name": "BTC_USDT",
        //            "type": "direct",
        //            "quanto_multiplier": "0.0001",
        //            "ref_discount_rate": "0",
        //            "order_price_deviate": "0.5",
        //            "maintenance_rate": "0.005",
        //            "mark_type": "index",
        //            "last_price": "38026",
        //            "mark_price": "37985.6",
        //            "index_price": "37954.92",
        //            "funding_rate_indicative": "0.000219",
        //            "mark_price_round": "0.01",
        //            "funding_offset": 0,
        //            "in_delisting": false,
        //            "risk_limit_base": "1000000",
        //            "interest_rate": "0.0003",
        //            "order_price_round": "0.1",
        //            "order_size_min": 1,
        //            "ref_rebate_rate": "0.2",
        //            "funding_interval": 28800,
        //            "risk_limit_step": "1000000",
        //            "leverage_min": "1",
        //            "leverage_max": "100",
        //            "risk_limit_max": "8000000",
        //            "maker_fee_rate": "-0.00025",
        //            "taker_fee_rate": "0.00075",
        //            "funding_rate": "0.002053",
        //            "order_size_max": 1000000,
        //            "funding_next_apply": 1610035200,
        //            "short_users": 977,
        //            "config_change_time": 1609899548,
        //            "trade_size": 28530850594,
        //            "position_size": 5223816,
        //            "long_users": 455,
        //            "funding_impact_value": "60000",
        //            "orders_limit": 50,
        //            "trade_id": 10851092,
        //            "orderbook_id": 2129638396
        //        }
        //    ]
        //
        const data = this.safeValue(response, 'result', []);
        const result = this.parseFundingRates(data);
        return this.filterByArray(result, 'symbol', symbols);
    }
    parseFundingRate(contract, market = undefined) {
        //
        // {
        //     "ticker_id":"ADA_PERP",
        //     "stock_currency":"ADA",
        //     "money_currency":"USDT",
        //     "last_price":"0.296708",
        //     "stock_volume":"7982130",
        //     "money_volume":"2345758.29189",
        //     "bid":"0.296608",
        //     "ask":"0.296758",
        //     "high":"0.298338",
        //     "low":"0.290171",
        //     "product_type":"Perpetual",
        //     "open_interest":"46533000",
        //     "index_price":"0.29659",
        //     "index_name":"Cardano",
        //     "index_currency":"ADA",
        //     "funding_rate":"0.0001",
        //     "next_funding_rate_timestamp":"1691193600000",
        //     "brackets":{
        //        "1":"0",
        //        "2":"0",
        //        "3":"0",
        //        "5":"0",
        //        "10":"0",
        //        "20":"0",
        //        "50":"-10000",
        //        "100":"-5000"
        //     },
        //     "max_leverage":"100"
        //  }
        //
        const marketId = this.safeString(contract, 'ticker_id');
        const symbol = this.safeSymbol(marketId, market);
        const markPrice = this.safeNumber(contract, 'markPrice');
        const indexPrice = this.safeNumber(contract, 'indexPrice');
        const interestRate = this.safeNumber(contract, 'interestRate');
        const fundingRate = this.safeNumber(contract, 'funding_rate');
        const nextFundingTime = this.safeInteger(contract, 'next_funding_rate_timestamp');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'interestRate': interestRate,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': fundingRate,
            'fundingTimestamp': undefined,
            'fundingDatetime': this.iso8601(undefined),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': nextFundingTime,
            'nextFundingDatetime': this.iso8601(nextFundingTime),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }
    async fetchDepositsWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name whitebit#fetchDepositsWithdrawals
         * @description fetch history of deposits and withdrawals
         * @see https://github.com/whitebit-exchange/api-docs/blob/main/pages/private/http-main-v4.md#get-depositwithdraw-history
         * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
         * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
         * @param {int} [limit] max number of deposit/withdrawals to return, default = 50, Min: 1, Max: 100
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {number} [params.transactionMethod] Method. Example: 1 to display deposits / 2 to display withdraws. Do not send this parameter in order to receive both deposits and withdraws.
         * @param {string} [params.address] Can be used for filtering transactions by specific address or memo.
         * @param {string[]} [params.addresses] Can be used for filtering transactions by specific addresses or memos (max: 20).
         * @param {string} [params.uniqueId] Can be used for filtering transactions by specific unique id
         * @param {int} [params.offset] If you want the request to return entries starting from a particular line, you can use OFFSET clause to tell it where it should start. Default: 0, Min: 0, Max: 10000
         * @param {string[]} [params.status] Can be used for filtering transactions by status codes. Caution: You must use this parameter with appropriate transactionMethod and use valid status codes for this method. You can find them below. Example: "status": [3,7]
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['ticker'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 1000
        }
        const response = await this.v4PrivatePostMainAccountHistory(this.extend(request, params));
        //
        //    {
        //        "limit": 100,
        //        "offset": 0,
        //        "records": [
        //            {
        //                "address": "3ApEASLcrQtZpg1TsssFgYF5V5YQJAKvuE",                                        // deposit address
        //                "uniqueId": null,                                                                       // unique Id of deposit
        //                "createdAt": 1593437922,                                                                // timestamp of deposit
        //                "currency": "Bitcoin",                                                                  // deposit currency
        //                "ticker": "BTC",                                                                        // deposit currency ticker
        //                "method": 1,                                                                            // called method 1 - deposit, 2 - withdraw
        //                "amount": "0.0006",                                                                     // amount of deposit
        //                "description": "",                                                                      // deposit description
        //                "memo": "",                                                                             // deposit memo
        //                "fee": "0",                                                                             // deposit fee
        //                "status": 15,                                                                           // transactions status
        //                "network": null,                                                                        // if currency is multinetwork
        //                "transactionHash": "a275a514013e4e0f927fd0d1bed215e7f6f2c4c6ce762836fe135ec22529d886",  // deposit transaction hash
        //                "transactionId": "5e112b38-9652-11ed-a1eb-0242ac120002",                                // transaction id
        //                "details": {
        //                    "partial": {                                                                        // details about partially successful withdrawals
        //                        "requestAmount": "50000",                                                       // requested withdrawal amount
        //                        "processedAmount": "39000",                                                     // processed withdrawal amount
        //                        "processedFee": "273",                                                          // fee for processed withdrawal amount
        //                        "normalizeTransaction": ""                                                      // deposit id
        //                    }
        //                },
        //                "confirmations": {                                                                      // if transaction status == 15 (Pending) you can see this object
        //                    "actual": 1,                                                                        // current block confirmations
        //                    "required": 2                                                                       // required block confirmation for successful deposit
        //                }
        //            },
        //            {...},
        //        ],
        //        "total": 300                                                                                    // total number of  transactions, use this for calculating ‘limit’ and ‘offset'
        //    }
        //
        const records = this.safeList(response, 'records');
        return this.parseTransactions(records, currency, since, limit);
    }
    isFiat(currency) {
        const fiatCurrencies = this.safeValue(this.options, 'fiatCurrencies', []);
        return this.inArray(currency, fiatCurrencies);
    }
    nonce() {
        return this.milliseconds();
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit(params, this.extractParams(path));
        const version = this.safeValue(api, 0);
        const accessibility = this.safeValue(api, 1);
        const pathWithParams = '/' + this.implodeParams(path, params);
        let url = this.urls['api'][version][accessibility] + pathWithParams;
        if (accessibility === 'public') {
            if (Object.keys(query).length) {
                url += '?' + this.urlencode(query);
            }
        }
        if (accessibility === 'private') {
            this.checkRequiredCredentials();
            const nonce = this.nonce().toString();
            const secret = this.encode(this.secret);
            const request = '/' + 'api' + '/' + version + pathWithParams;
            body = this.json(this.extend({ 'request': request, 'nonce': nonce }, params));
            const payload = this.stringToBase64(body);
            const signature = this.hmac(this.encode(payload), secret, sha512.sha512);
            headers = {
                'Content-Type': 'application/json',
                'X-TXC-APIKEY': this.apiKey,
                'X-TXC-PAYLOAD': payload,
                'X-TXC-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new errors.DDoSProtection(this.id + ' ' + code.toString() + ' ' + reason + ' ' + body);
        }
        if (code === 404) {
            throw new errors.ExchangeError(this.id + ' ' + code.toString() + ' endpoint not found');
        }
        if (response !== undefined) {
            // For cases where we have a meaningful status
            // {"response":null,"status":422,"errors":{"orderId":["Finished order id 435453454535 not found on your account"]},"notification":null,"warning":"Finished order id 435453454535 not found on your account","_token":null}
            const status = this.safeString(response, 'status');
            // {"code":10,"message":"Unauthorized request."}
            const message = this.safeString(response, 'message');
            // For these cases where we have a generic code variable error key
            // {"code":0,"message":"Validation failed","errors":{"amount":["Amount must be greater than 0"]}}
            const codeNew = this.safeInteger(response, 'code');
            const hasErrorStatus = status !== undefined && status !== '200';
            if (hasErrorStatus || codeNew !== undefined) {
                const feedback = this.id + ' ' + body;
                let errorInfo = message;
                if (hasErrorStatus) {
                    errorInfo = status;
                }
                else {
                    const errorObject = this.safeValue(response, 'errors');
                    if (errorObject !== undefined) {
                        const errorKey = Object.keys(errorObject)[0];
                        const errorMessageArray = this.safeValue(errorObject, errorKey, []);
                        const errorMessageLength = errorMessageArray.length;
                        errorInfo = (errorMessageLength > 0) ? errorMessageArray[0] : body;
                    }
                }
                this.throwExactlyMatchedException(this.exceptions['exact'], errorInfo, feedback);
                this.throwBroadlyMatchedException(this.exceptions['broad'], body, feedback);
                throw new errors.ExchangeError(feedback);
            }
        }
        return undefined;
    }
}

module.exports = whitebit;
