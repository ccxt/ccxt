
//  ---------------------------------------------------------------------------

import Exchange from './abstract/valr.js';
import type {
    Account,
    Balances,
    CrossBorrowRates,
    Currencies,
    Currency,
    DepositAddress,
    Dict,
    FundingRate,
    FundingRates,
    int,
    Int,
    LedgerEntry,
    Market,
    Num,
    OpenInterest,
    Order,
    OrderBook,
    OrderRequest,
    OrderSide,
    OrderType,
    Position,
    Str,
    Strings,
    Ticker,
    Tickers,
    Trade,
    TradingFees,
    Transaction,
    TransferEntry,
} from './base/types.js';
import { Precise } from './base/Precise.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import {
    ArgumentsRequired,
    AuthenticationError,
    BadRequest,
    BadSymbol,
    DuplicateOrderId,
    InsufficientFunds,
    InvalidOrder,
    NotSupported,
    NullResponse,
    OrderNotFound,
} from './base/errors.js';
import { DECIMAL_PLACES } from './base/functions/number.js';

// ---------------------------------------------------------------------------

/**
 * @class valr
 * @augments Exchange
 */
export default class valr extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'valr',
            'name': 'VALR',
            'countries': [ 'ZA' ],
            'rateLimit': 1000,
            'version': '1',
            // 'comment': 'This comment is optional',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': undefined,
                'closeAllPositions': undefined,
                'closePosition': undefined,
                'createDepositAddress': undefined,
                'createLimitBuyOrder': undefined,
                'createLimitOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': true,
                'createMarketOrderWithCost': true,
                'createMarketSellOrder': true,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': undefined,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': undefined,
                'createStopLimitOrder': undefined,
                'createStopLossOrder': undefined,
                'createStopMarketOrder': undefined,
                'createStopOrder': undefined,
                'createTakeProfitOrder': undefined,
                'createTrailingAmountOrder': undefined,
                'createTrailingPercentOrder': undefined,
                'createTriggerOrder': undefined,
                'deposit': undefined,
                'editLimitBuyOrder': true,
                'editLimitOrder': true,
                'editLimitSellOrder': true,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchBorrowInterest': true,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistories': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRates': true,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchCanceledAndClosedOrders': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': true,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': undefined,
                'fetchConvertQuote': undefined,
                'fetchCrossBorrowRate': true,
                'fetchCrossBorrowRates': true,
                'fetchCurrencies': true,
                'fetchDeposit': undefined,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': undefined,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': undefined,
                'fetchDepositWithdrawFees': undefined,
                'fetchFundingHistory': undefined,
                'fetchFundingLimits': false,
                'fetchFundingRate': undefined,
                'fetchFundingRateHistory': undefined,
                'fetchFundingRates': true,
                'fetchGreeks': undefined,
                'fetchIndexOHLCV': undefined,
                'fetchIsolatedBorrowRate': undefined,
                'fetchIsolatedBorrowRates': undefined,
                'fetchIsolatedPositions': undefined,
                'fetchL2OrderBook': true,
                'fetchL3OrderBook': true,
                'fetchLastPrices': undefined,
                'fetchLedger': true,
                'fetchLedgerEntry': false,
                'fetchLeverage': undefined,
                'fetchLeverages': undefined,
                'fetchLeverageTiers': undefined,
                'fetchLiquidations': undefined,
                'fetchMarginAdjustmentHistory': undefined,
                'fetchMarginMode': undefined,
                'fetchMarginModes': undefined,
                'fetchMarketLeverageTiers': undefined,
                'fetchMarkets': true,
                'fetchMarkOHLCV': undefined,
                'fetchMyLiquidations': undefined,
                'fetchMySettlementHistory': undefined,
                'fetchMyTrades': true,
                'fetchOHLCV': false, // TODO
                'fetchOpenInterest': undefined,
                'fetchOpenInterestHistory': undefined,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': true,
                'fetchOption': undefined,
                'fetchOptionChain': undefined,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrdersByStatus': undefined,
                'fetchOrderTrades': undefined,
                'fetchPermissions': true,
                'fetchPosition': undefined,
                'fetchPositionMode': undefined,
                'fetchPositions': true,
                'fetchPositionsForSymbol': true,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': undefined,
                'fetchSettlementHistory': undefined,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': undefined,
                'fetchTradingFees': true,
                'fetchTradingLimits': undefined,
                'fetchTransactionFee': undefined,
                'fetchTransactionFees': undefined,
                'fetchTransactions': false,
                'fetchTransfer': undefined,
                'fetchTransfers': undefined,
                'fetchUnderlyingAssets': undefined,
                'fetchVolatilityHistory': undefined,
                'fetchWithdrawAddresses': undefined,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': undefined,
                'reduceMargin': undefined,
                'repayCrossMargin': undefined,
                'repayIsolatedMargin': undefined,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false, // TODO
                'withdraw': true,
            },
            'urls': {
                'logo': undefined,
                'api': {
                    'public': 'https://api.valr.com/v1/public',
                    'private': 'https://api.valr.com/v1',
                },
                'www': 'https://www.valr.com',
                'doc': [
                    'https://docs.valr.com/',
                ],
                'fees': 'https://support.valr.com/hc/en-us/articles/360015777451-What-are-VALR-s-charges',
                'referral': {
                    'url': 'https://www.valr.com/invite/VAE2R2GV',
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        '{pair}/orderbook', // fetchOrderBook
                        '{pair}/orderbook/full', // fetchL3OrderBook
                        'currencies', // fetchCurrencies
                        'pairs', // fetchMarkets
                        'pairs/{type}',
                        'ordertypes',
                        '{pair}/ordertypes',
                        'marketsummary', // fetchTickers
                        '{pair}/marketsummary', // fetchTicker
                        '{pair}/markprice/buckets',
                        '{pair}/trades', // fetchTrades
                        'futures/funding/history', // TODO fetchFundingRateHistory
                        'futures/info', // fetchFundingRates
                        'loans/info',
                        'time', // fetchTime
                        'status', // fetchStatus
                        'risklimit/{pair}',
                    ],
                },
                'private': {
                    'get': [
                        'account/api-keys/current', // fetchPermissions
                        'account/subaccounts', // fetchAccounts
                        'account/balances', // fetchBalance
                        'account/balances/all',
                        'account/transactionhistory',
                        'account/transactionhistory/subaccounts',
                        'account/{pair}/tradehistory', // fetchMyTrades
                        'account/tradehistory',
                        'account/fees/trade', // fetchTradingFees
                        'marketdata/{pair}/orderbook', // fetchOrderBook
                        'marketdata/{pair}/orderbook/full', // fetchL3OrderBook
                        'marketdata/{pair}/tradehistory', // fetchTrades
                        'wallet/crypto/{currency}/deposit/address', // fetchDepositAddress
                        'wallet/crypto/{currency}/deposit/history', // fetchDeposits
                        'wallet/crypto/deposit/history', // TODO update fetchDeposits with new API
                        'wallet/crypto/address-book',
                        'wallet/crypto/address-book/{currency}',
                        'wallet/crypto/{currency}/withdraw',
                        'wallet/crypto/{currency}/withdraw/{id}',
                        'wallet/crypto/{currency}/withdraw/history', // fetchWithdrawals
                        'wallet/crypto/withdraw/history', // TODO update fetchWithdrawals with new API
                        'wallet/fiat/{currency}/accounts/{id}',
                        'wallet/fiat/{currency}/accounts',
                        'wallet/fiat/{currency}/banks',
                        'wallet/fiat/{currency}/deposit/reference', // fetchDepositAddress
                        'wallet/fiat/{currency}/deposit/reference/{currencyBuy}',
                        'wallet/fiat/{currency}/auto-buy',
                        'simple/{pair}/order/{id}',
                        'pay/limits',
                        'pay/payid',
                        'pay/history',
                        'pay/identifier/{id}',
                        'pay/transactionid/{id}',
                        'orders/{pair}/orderid/{id}', // fetchOrder
                        'orders/{pair}/customerorderid/{id}',
                        'orders/open', // fetchOpenOrders
                        'orders/history', // fetchClosedOrders
                        'orders/history/summary/orderid/{id}', // fetchClosedOrder
                        'orders/history/summary/customerorderid/{id}', // fetchClosedOrder
                        'orders/history/detail/orderid/{id}',
                        'orders/history/detail/customerorderid/{id}',
                        'staking/balances/{currency}',
                        'staking/rates',
                        'staking/rates/{currency}',
                        'staking/rewards',
                        'staking/history',
                        'margin/status', // TODO fetchLeverages
                        'margin/account/status',
                        'margin/leverage/{pair}',
                        'positions/open', // fetchPositions & fetchPositionsForSymbol
                        'positions/closed/summary',
                        'positions/closed',
                        'positions/history',
                        'positions/funding/history',
                        'borrows/{currency}/history', // fetchBorrowInterest
                        'loans/info',
                        'loans/rates', // fetchCrossBorrowRates
                        'loans/rates/history',
                        'loans/open',
                        'loans/credit-history',
                        'loans/update-history',
                    ],
                    'post': [
                        'account/subaccount',
                        'account/subaccounts/transfer', // transfer
                        'wallet/crypto/{currency}/withdraw', // withdraw
                        'wallet/crypto/service-providers',
                        'wallet/fiat/{currency}/accounts',
                        'wallet/fiat/{currency}/withdraw', // withdraw
                        'simple/{pair}/quote', // TODO fetchConvertQuote
                        'simple/{pair}/order', // TODO createConvertTrade
                        'pay',
                        'orders/conditionals',
                        'orders/conditionals/:currencyPair/history',
                        'orders/conditionals/conditional/{pair}/orderid/{id}',
                        'orders/limit', // createOrder
                        'orders/market', // createOrder
                        'orders/stop/limit',
                        'batch/orders', // TODO createOrders
                        'staking/stake',
                        'staking/un-stake',
                        'loans',
                    ],
                    'put': [
                        'account/subaccount',
                        'pay/transactionid/{id}/reverse',
                        'pay/transactionid/{id}/partial-reverse',
                        'orders/modify', // editOrder
                        'orders/conditionals/modify',
                        'margin/account/status',
                        'margin/leverage/{pair}',
                        'loans/increase',
                        'loans/rate',
                        'loans/unlock',
                    ],
                    'delete': [
                        'account/subaccount',
                        'wallet/fiat/{currency}/accounts/{id}',
                        'orders/order', // cancelOrder
                        'orders', // cancelAllOrders
                        'orders/{pair}', // cancelAllOrders
                        'orders/conditionals/',
                        'orders/conditionals/{pair}',
                        'loans/unlock',
                    ],
                },
                'privateV2': {
                    'get': [
                        'margin/status',
                        'healthz',
                    ],
                    'post': [
                        'orders/market',
                        'orders/limit',
                        'orders/stop/limit',
                    ],
                    'put': [
                        'orders/modify',
                    ],
                    'delete': [
                        'orders/order',
                    ],
                },
            },
            'headers': {
                'Content-Type': 'application/json',
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'tierBased': true,
                    'maker': this.parseNumber ('0.0018'),
                    'taker': this.parseNumber ('0.0035'),
                    // 'spot': {
                    //     'maker': '0.0',
                    //     'taker': '0.005',
                    // },
                    // 'swap': {
                    //     'maker': '0.0',
                    //     'taker': '0.004',
                    // },
                    // 'zar': {
                    //     'maker': '-0.001',
                    //     'taker': '0.1',
                    // },
                    // 'usdt/usdc': {
                    //     'maker': '0.0',
                    //     'taker': '0.01',
                    // },
                },
            },
            'options': {
                'fiat': {
                    'ZAR': 'ZAR',
                    'USD': 'USD',
                },
                'subAccountId': undefined,
            },
            'httpExceptions': {
                '403': AuthenticationError,
            },
            'precisionMode': DECIMAL_PLACES,
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true, // todo
                        'triggerPriceType': undefined,
                        'triggerDirection': true, // todo
                        'stopLossPrice': false, // todo
                        'takeProfitPrice': false, // todo
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 100000, // todo
                        'untilDays': 100000, // todo
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 100000,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 100000,
                        'daysBackCanceled': 1,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': undefined,
                    },
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'exceptions': {
                'exact': {
                    '-1': OrderNotFound, // {"code":-1,"message":"Invalid Order. "}
                    '-12007': InvalidOrder, // {"code":-12007,"message":"Minimum order size not met . Minimum amount: 1 USDT, minimum total: 10 ZAR"}
                    '-11502': DuplicateOrderId, // {'code': '-11502', 'message': "Duplicate customer order id's are not allowed"}
                    '-113': BadRequest, // "code":-113,"message":"Invalid JSON payload"
                },
                'broad': {
                    'Internal transfer did not succeed From account does not have sufficient balance for transfer': InsufficientFunds,
                    'Internal transfer did not succeed A subaccount can only transfer funds from itself': BadRequest,
                    'Invalid Request, please check your request and try again': BadRequest,
                },
            },
        });
    }

    checkRequiredSymbolArgument (methodName: string, symbol: string) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires valid symbol name');
        }
        if (typeof symbol !== 'string') {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires valid string name for symbol');
        }
        const market = this.safeMarket (symbol);
        if (market === undefined) {
            throw new BadSymbol (this.id + ' ' + methodName + '() found no valid market for symbol: ' + symbol);
        }
    }

    checkRequiredCurrencyCodeArgument (methodName: string, code: string) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires valid currency code name');
        }
        const currency = this.safeCurrency (code);
        if (currency['id'] === undefined) {
            throw new BadRequest (this.id + ' ' + methodName + '() found no valid currency ID for currency code: ' + code);
        }
    }

    isFiat (code) {
        return (code in this.options['fiat']);
    }

    async fetchTime (params = {}): Promise<number> {
        /**
         * @method
         * @name valr#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://docs.valr.com/#95f84056-2ac7-4f92-a5d9-fd0d9c104f01
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetTime (params);
        return this.parse8601 (this.safeString (response, 'time'));
    }

    async fetchStatus (params = {}): Promise<any> {
        /**
         * @method
         * @name valr#fetchStatus
         * @see https://docs.valr.com/#88ab52a2-d63b-48b2-8984-d0982baec40a
         * @description fetch status of exchange
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A [exchange status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.publicGetStatus (params);
        const statusReport = this.safeString (response, 'status');
        let status = undefined;
        if (statusReport === 'online') {
            status = 'ok';
        } else if (statusReport === 'read-only') {
            status = 'maintenance';
        }
        return {
            'status': status,
            'updated': undefined,
            'eta': undefined,
            'url': 'https://status.valr.com/',
            'info': response,
        };
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name valr#fetchCurrencies
         * @see https://docs.valr.com/#88ab52a2-d63b-48b2-8984-d0982baec40a
         * @description fetches all available currencies on an exchange
         * @param {{}} [params={}] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of [Currency Structure]{@link https://docs.ccxt.com/#/?id=currency-structure}
         */
        const currencies = await this.publicGetCurrencies (params);
        // [
        //     {
        //       "symbol": "R",
        //       "isActive": true,
        //       "shortName": "ZAR",
        //       "longName": "Rand",
        //       "decimalPlaces": "2",
        //       "withdrawalDecimalPlaces": "2",
        //       "collateral": true,
        //       "collateralWeight": "1"
        //     },
        //     {
        //       "symbol": "BTC",
        //       "isActive": true,
        //       "shortName": "BTC",
        //       "longName": "Bitcoin",
        //       "decimalPlaces": "8",
        //       "withdrawalDecimalPlaces": "8",
        //       "collateral": true,
        //       "collateralWeight": "0.95",
        //       "defaultNetworkType": "Bitcoin",
        //       "supportedNetworks": [
        //         {
        //           "networkType": "Bitcoin",
        //           "networkLongName": "Bitcoin"
        //         }
        //       ]
        //     },
        //     {
        //       "symbol": "ETH",
        //       "isActive": true,
        //       "shortName": "ETH",
        //       "longName": "Ethereum",
        //       "decimalPlaces": "18",
        //       "withdrawalDecimalPlaces": "8",
        //       "collateral": true,
        //       "collateralWeight": "0.95",
        //       "defaultNetworkType": "Ethereum",
        //       "supportedNetworks": [
        //         {
        //           "networkType": "Ethereum",
        //           "networkLongName": "Ethereum"
        //         }
        //       ]
        //     },
        //     ...
        // ]
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const code = this.safeCurrencyCode (this.safeString (currency, 'shortName'));
            let fiatType = undefined;
            if (this.isFiat (code)) {
                fiatType = 'fiat';
            } else {
                fiatType = 'crypto';
            }
            let precision = this.safeInteger (currency, 'decimalPlaces');
            // Siacoin reports precision of 24 which does not pass build test
            if ((precision !== undefined) && (precision > 18)) {
                precision = 18;
            }
            result[code] = this.safeCurrencyStructure ({
                'id': this.safeString (currency, 'shortName'),
                'code': code,
                'info': currency,
                'name': this.safeString (currency, 'longName'),
                'active': this.safeString (currency, 'isActive'),
                'precision': precision,
                'withdraw': ('supportedNetworks' in currency) ? true : false,
                'deposit': ('supportedNetworks' in currency) ? true : false,
                'type': fiatType,
            });
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name valr#fetchMarkets
         * @description retrieves data on all markets for valr
         * @see https://docs.valr.com/#cfa57d7e-2106-4066-bc27-c10210b6aa82
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [Market Structure]{@link https://docs.ccxt.com/#/?id=market-structure}
         */
        const markets = await this.publicGetPairs (params);
        // [
        //     {'symbol': 'ENJUSDC',
        //     'baseCurrency': 'ENJ',
        //     'quoteCurrency': 'USDC',
        //     'shortName': 'ENJ/USDC',
        //     'active': True,
        //     'minBaseAmount': '3.5',
        //     'maxBaseAmount': '3586.3',
        //     'minQuoteAmount': '2',
        //     'maxQuoteAmount': '5000',
        //     'tickSize': '0.01',
        //     'baseDecimalPlaces': '2',
        //     'marginTradingAllowed': False,
        //     'currencyPairType': 'SPOT'},
        //    {'symbol': 'USDTZARPERP',
        //     'baseCurrency': 'USDT',
        //     'quoteCurrency': 'ZAR',
        //     'shortName': 'USDT/ZARPERP',
        //     'active': True,
        //     'minBaseAmount': '1',
        //     'maxBaseAmount': '250000',
        //     'minQuoteAmount': '15',
        //     'maxQuoteAmount': '5000000',
        //     'tickSize': '0.01',
        //     'baseDecimalPlaces': '3',
        //     'marginTradingAllowed': False,
        //     'currencyPairType': 'FUTURE'
        // },
        // ]
        return this.parseMarkets (markets);
    }

    parseMarket (market): Market {
        const base = this.safeCurrencyCode (this.safeString (market, 'baseCurrency'));
        const quote = this.safeCurrencyCode (this.safeString (market, 'quoteCurrency'));
        const currencyPairType = this.safeString (market, 'currencyPairType');
        let marketType = undefined;
        let spot = undefined;
        let swap = undefined;
        let symbol = base + '/' + quote;
        // required for future contracts
        let contract = false;
        let linear = undefined;
        let contractSize = undefined;
        let settle = undefined;
        let settleId = undefined;
        let inverse = undefined;
        const fees = this.safeDict (this.fees, 'trading');
        if (currencyPairType === 'SPOT') {
            marketType = 'spot';
            spot = true;
        } else if (currencyPairType === 'FUTURE') {
            marketType = 'swap';
            spot = false;
            swap = true;
            symbol = symbol + ':' + quote;
            contract = true;
            // Guess value
            contractSize = this.parseNumber ('1');
            // According to docs: https://support.valr.com/hc/en-us/articles/11078306427420-Perpetual-Futures-Trading-Guide
            linear = true;
            settle = base;
            settleId = this.safeString (market, 'baseCurrency');
            symbol = base + '/' + quote + ':' + settle;
            inverse = false;
        }
        return this.safeMarketStructure ({
            'id': this.safeString (market, 'symbol'),
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': this.safeString (market, 'baseCurrency'),
            'quoteId': this.safeString (market, 'quoteCurrency'),
            'active': this.safeBool (market, 'active'),
            'type': marketType,
            'spot': spot,
            'margin': this.safeBool (market, 'marginTradingAllowed'),
            'future': false,
            'swap': swap,
            'option': false,
            'contract': contract,
            'percentage': true,
            'tierBased': true,
            'linear': linear,
            'contractSize': contractSize,
            'settle': settle,
            'settleId': settleId,
            'inverse': inverse,
            // Setting defaults based on exchange not on response
            // These values are actually from private API call and can be overwritten with loadTradingFees
            'taker': this.safeValue (fees, 'taker'),
            'maker': this.safeValue (fees, 'maker'),
            'precision': {
                'price': this.precisionFromString (this.safeString (market, 'tickSize')),
                'amount': this.safeInteger (market, 'baseDecimalPlaces'),
            },
            'limits': {
                'amount': {
                    'min': this.safeFloat (market, 'minBaseAmount'),
                    'max': this.safeFloat (market, 'maxBaseAmount'),
                },
                'cost': {
                    'max': this.safeFloat (market, 'maxQuoteAmount'),
                },
            },
            'info': market,
        });
    }

    async fetchTickers (symbols: string[] = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name valr#fetchTickers
         * @see https://docs.valr.com/#cd1f0448-3da3-44cf-b00d-91edd74e7e19
         * @description fetch market statistics for the multiple markets on the exchange
         * @param {string} [symbol] unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a assiative array of [Ticker Structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetMarketsummary (params);
        // [
        //     {
        //       "currencyPair": "BTCZAR",
        //       "askPrice": "520000",
        //       "bidPrice": "400000",
        //       "lastTradedPrice": "400000",
        //       "previousClosePrice": "400000",
        //       "baseVolume": "0",
        //       "highPrice": "400000",
        //       "lowPrice": "0",
        //       "created": "2022-06-12T18:06:05.001Z",
        //       "changeFromPrevious": "0",
        //       "markPrice": "400000"
        //     },
        //     {
        //       "currencyPair": "ETHZAR",
        //       "askPrice": "32158",
        //       "bidPrice": "30899",
        //       "lastTradedPrice": "30899",
        //       "previousClosePrice": "30899",
        //       "baseVolume": "0",
        //       "highPrice": "30899",
        //       "lowPrice": "0",
        //       "created": "2022-06-12T18:06:05.001Z",
        //       "changeFromPrevious": "0",
        //       "markPrice": "30899"
        //     },
        //     ...
        // ]
        return this.parseTickers (response, symbols, params);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name valr#fetchTicker
         * @see https://docs.valr.com/#89b446bb-60a6-42ff-aa09-29e4918a9eb0
         * @description fetch market statistics for a market on the exchange
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [Ticker Structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        this.checkRequiredSymbolArgument (this.id + ' fetchTicker', symbol);
        const marketId = this.marketId (symbol);
        const request = {
            'pair': marketId,
        };
        const response = await this.publicGetPairMarketsummary (this.extend (request, params));
        return this.parseTicker (response);
    }

    parseTicker (ticker: object, market: Market = undefined): Ticker {
        const timestamp = this.parse8601 (this.safeString (ticker, 'created'));
        const result = {
            'symbol': this.safeSymbol (this.safeString2 (ticker, 'currencyPair', 'currencyPairSymbol')),
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'highPrice'),
            'low': this.safeString (ticker, 'lowPrice'),
            'bid': this.safeString (ticker, 'bidPrice'),
            'ask': this.safeString (ticker, 'askPrice'),
            'close': this.safeString (ticker, ''),
            'last': this.safeString (ticker, 'lastTradedPrice'),
            'open': this.safeString (ticker, 'previousClosePrice'),
            'previousClose': this.safeString (ticker, 'previousClosePrice'),
            'average': this.safeString (ticker, 'markPrice'),
            'change': undefined,
            'percentage': this.safeString (ticker, 'changeFromPrevious'),
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
        };
        return this.safeTicker (result);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name valr#fetchOrderBook
         * @see https://docs.valr.com/#89b446bb-60a6-42ff-aa09-29e4918a9eb0
         * @description fetches upto a maximum of the top 40 bids and asks in the order book
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {Int} [limit] the maximum number of order book structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [Order Book Structure]{@link https://docs.ccxt.com/#/?id=order-book-structure}
         */
        await this.loadMarkets ();
        let response = undefined;
        this.checkRequiredSymbolArgument ('fetchOrderBook', symbol);
        const queryParams = {
            'pair': this.marketId (symbol),
        };
        if (this.checkRequiredCredentials (false)) {
            response = await this.privateGetMarketdataPairOrderbook (this.extend (queryParams, params));
        } else {
            response = await this.publicGetPairOrderbook (this.extend (queryParams, params));
        }
        const lastDateChange = this.safeString (response, 'LastChange');
        const timestamp = this.parse8601 (lastDateChange);
        return this.parseOrderBook (response, symbol, timestamp, 'Bids', 'Asks', 'price', 'quantity', 'orderCount');
    }

    async fetchL3OrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name valr#fetchL3OrderBook
         * @see https://docs.valr.com/#c2acf6b9-dbba-4e6a-9075-a7907360812d
         * @description fetches all bids and asks in the order book
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {Int} [limit] the maximum number of order book structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [Order Book Structure]{@link https://docs.ccxt.com/#/?id=order-book-structure}
         */
        await this.loadMarkets ();
        let response = undefined;
        this.checkRequiredSymbolArgument ('fetchOrderBook', symbol);
        const queryParams = {
            'pair': this.marketId (symbol),
        };
        if (this.checkRequiredCredentials (false)) {
            response = await this.privateGetMarketdataPairOrderbookFull (this.extend (queryParams, params));
        } else {
            response = await this.publicGetPairOrderbookFull (this.extend (queryParams, params));
        }
        const lastDateChange = this.safeString (response, 'LastChange');
        const timestamp = this.parse8601 (lastDateChange);
        return this.parseOrderBook (response, symbol, timestamp, 'Bids', 'Asks', 'price', 'quantity', 'id');
    }

    async fetchPermissions (params = {}) {
        /**
         * @method
         * @name valr#fetchPermissions
         * @see https://docs.valr.com/#af083ac6-0514-4979-9bab-f599ea1bed4f
         * @description returns the current API Key's information and permissions.
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns an associative array with API enable permissions
         */
        this.checkRequiredCredentials ();
        const response = await this.privateGetAccountApiKeysCurrent (params);
        const permissions = this.safeValue (response, 'permissions');
        return {
            'info': response,
            'created': this.parse8601 (this.safeString (response, 'addedAt')),
            'viewaccess': this.inArray ('View access', permissions),
            'trade': this.inArray ('Trade', permissions),
            'cryptwithdraws': this.inArray ('Withdraw', permissions),
            'fiatwithdraws': this.inArray ('Link bank account', permissions),
            'transfers': this.inArray ('Internal Transfer', permissions),
        };
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name valr#fetchBalance
         * @see https://docs.valr.com/#60455ec7-ecdc-42ad-9a57-64941299da52
         * @description fetches the the balances in all currencies on the user account.
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.excludeZeroBalances] only return none zero balances
         * @returns {object} a associative array of [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetAccountBalances (params);
        // [
        //     {
        //       "currency": "USDT",
        //       "available": "44822.97549155",
        //       "reserved": "99.99925",
        //       "total": "145612.43129945",
        //       "updatedAt": "2023-04-25T09:00:04.406Z",
        //       "lendReserved": "100000",
        //       "borrowReserved": "689.4565579",
        //       "borrowedAmount": "0",
        //       "totalInReference": "7828.62533868",
        //       "totalInReferenceWeighted": "7828.62533868",
        //       "referenceCurrency": "USDC"
        //     },
        //     {
        //       "currency": "BTC",
        //       "available": "0",
        //       "reserved": "0",
        //       "total": "-0.00101056",
        //       "updatedAt": "2023-04-25T09:00:00.103Z",
        //       "lendReserved": "0",
        //       "borrowReserved": "0",
        //       "borrowedAmount": "0.00101056",
        //       "totalInReference": "-28.29568",
        //       "totalInReferenceWeighted": "-27.588288",
        //       "referenceCurrency": "USDC"
        //     }
        // ]
        return this.parseBalance (response);
    }

    parseBalance (balances): Balances {
        const timestamp = this.parseDate (this.safeString (this.last_response_headers, 'Date'));
        const result = {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': balances,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'currency'));
            const lendBorrow = Precise.stringAdd (
                this.safeString (balance, 'lendReserved'),
                this.safeString (balance, 'borrowReserved')
            );
            const used = Precise.stringAdd (
                lendBorrow,
                this.safeString (balance, 'reserved')
            );
            const debt = Precise.stringSub (
                this.safeString (balance, 'borrowedAmount'),
                this.safeString (balance, 'borrowReserved')
            );
            result[code] = {
                'free': this.safeFloat (balance, 'available'),
                'used': used,
                'total': this.safeFloat (balance, 'total'),
                'debt': debt,
            };
        }
        return this.safeBalance (result);
    }

    async fetchAccounts (params = {}): Promise<Account[]> {
        /**
         * @method
         * @name valr#fetchAccounts
         * @see https://docs.valr.com/#9443d7ce-c1c5-4597-b43e-d8fc2e7b49a7
         * @description fetch all the accounts associated with a profile
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
         */
        const query = { 'subAccountId': '0' };
        const response = await this.privateGetAccountSubaccounts (this.extend (query, params));
        return this.parseAccounts (response, params);
    }

    parseAccount (account) {
        let accountType = undefined;
        if (this.safeString (account, 'label') === 'Primary') {
            accountType = 'main';
        } else {
            accountType = 'subaccount';
        }
        // Todo: Use account structure
        return {
            'id': this.safeString (account, 'id'),
            'type': accountType,
            'name': this.safeString (account, 'label'),
            'code': undefined,
            'info': account,
        } as Account;
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name valr#fetchOrder
         * @see https://docs.valr.com/#8d9252e1-ee27-495e-86ed-57458bdafd19
         * @description fetches information on an order made by the user
         * @param {string} id order id (order customer order id)
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.useClientId] ID is for clientOrderId field and associate API call (default is false)
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        this.checkRequiredSymbolArgument ('fetchOrder', symbol);
        const marketId = this.marketId (symbol);
        const useClientOrderId = this.safeBool (params, 'useClientId', false);
        const request = {
            'id': id,
            'pair': marketId,
        };
        let response = undefined;
        if (useClientOrderId) {
            params = this.omit (params, 'useClientId');
            response = await this.privateGetOrdersPairCustomerorderidId (this.extend (request, params));
        } else {
            response = await this.privateGetOrdersPairOrderidId (this.extend (request, params));
        }
        // {
        //     "orderId": "00fa7cb4-ea7c-4b8e-beed-dc63e226a6a2",
        //     "orderStatusType": "Placed",
        //     "currencyPair": "BTCZAR",
        //     "originalPrice": "100000",
        //     "remainingQuantity": "0.02",
        //     "originalQuantity": "0.02",
        //     "orderSide": "buy",
        //     "orderType": "post-only limit",
        //     "failedReason": "",
        //     "orderUpdatedAt": "2024-03-12T09:42:37.766Z",
        //     "orderCreatedAt": "2024-03-12T09:42:37.766Z",
        //     "timeInForce": "GTC"
        // }
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name valr#fetchOpenOrders
         * @description fetches information on all order made by the user
         * @see https://docs.valr.com/#910bc498-b88d-48e8-b392-6cc94b8cb66d
         * @param {string} [symbol] unified symbol of the market the order was made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetOrdersOpen (params);
        // [{'orderId': 'aa6dce9a-6acb-477f-9da8-223127e6b32d',
        // 'side': 'buy',
        // 'remainingQuantity': '0.02',
        // 'price': '100000',
        // 'currencyPair': 'BTCZAR',
        // 'createdAt': '2024-03-12T07:14:17.275Z',
        // 'originalQuantity': '0.02',
        // 'filledPercentage': '0.00',
        // 'updatedAt': '2024-03-12T07:14:17.275Z',
        // 'status': 'Placed',
        // 'type': 'post-only limit',
        // 'timeInForce': 'GTC'}]
        let market = undefined;
        if (symbol !== undefined) {
            market = this.safeValue (this.markets, symbol);
        }
        return this.parseOrders (response, market, since, limit, params);
    }

    async fetchClosedOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name valr#fetchClosedOrder
         * @description fetches information on closed order based on the ID or CustomerID
         * @see https://docs.valr.com/#7f42e4d5-c853-4da2-9c7d-adb4f3385ca2
         * @see https://docs.valr.com/#112c551e-4ee3-46a3-8fcf-0db07d3f48f2
         * @param {string} [symbol] unified symbol of the market the order was made in - Note used
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.useClientId] ID is for clientOrderId field and associate API call (default is false)
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const useClientOrderId = this.safeBool (params, 'useClientId', false);
        const request = {
            'id': id,
        };
        let response = undefined;
        if (useClientOrderId) {
            params = this.omit (params, 'useClientId');
            response = await this.privateGetOrdersHistorySummaryCustomerorderidId (this.extend (request, params));
        } else {
            response = await this.privateGetOrdersHistorySummaryOrderidId (this.extend (request, params));
        }
        return this.parseOrder (response);
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name valr#fetchClosedOrders
         * @description fetches information on all closed order made by the user
         * @see https://docs.valr.com/#5f0ef16a-4f9d-40f3-bcdf-b1a63a0b42a4
         * @param {string} [symbol] unified symbol of the market the order was made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {object} [params.skip] number of items to skip from list
         * @param {object} [params.endTime] Include only records before this ISO 8601 end time
         * @param {object} [params.statuses]  Include only orders that have this status. Comma-seperated list
         * @returns {object} a list of [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const query = {};
        if (since !== undefined) {
            query['startTime'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            query['limit'] = limit;
        }
        if (symbol !== undefined) {
            query['currencyPair'] = this.marketId (symbol);
        }
        await this.loadMarkets ();
        const response = await this.privateGetOrdersHistory (this.extend (query, params));
        // [{'orderId': 'aa6dce9a-6acb-477f-9da8-223127e6b32d',
        //   'orderStatusType': 'Cancelled',
        //   'currencyPair': 'BTCZAR',
        //   'averagePrice': '0',
        //   'originalPrice': '100000',
        //   'remainingQuantity': '0.02',
        //   'originalQuantity': '0.02',
        //   'total': '0',
        //   'totalFee': '0',
        //   'feeCurrency': 'BTC',
        //   'orderSide': 'buy',
        //   'orderType': 'post-only limit',
        //   'failedReason': '',
        //   'orderUpdatedAt': '2024-03-12T07:16:14.205Z',
        //   'orderCreatedAt': '2024-03-12T07:14:17.275Z',
        //   'timeInForce': 'GTC'}]
        let market = undefined;
        if (symbol !== undefined) {
            market = this.safeValue (this.markets, symbol);
        }
        return this.parseOrders (response, market, since, limit, params);
    }

    parseOrder (order, market: Market = undefined): Order {
        const orderStatus = this.safeString2 (order, 'status', 'orderStatusType');
        let status = undefined;
        if (this.inArray (orderStatus, [ 'Placed', 'Active', 'Order Modified', 'Partially Filled' ])) {
            status = 'open';
        } else if (this.inArray (orderStatus, [ 'Failed', 'Cancelled' ])) {
            const failedReason = this.safeString (order, 'failedReason');
            if (this.inArray (failedReason, [ 'Insufficient Balance', 'The borrow amount is unavailable currently, please try again later' ])) {
                status = 'rejected';
            } else {
                status = 'canceled';
            }
        } else if (orderStatus === 'Filled') {
            status = 'closed';
        }
        const orderType = this.safeString2 (order, 'type', 'orderType');
        let typeParse = undefined;
        let postOnly = undefined;
        if (orderType !== undefined) {
            if (orderType === 'market') {
                typeParse = 'market';
                postOnly = false;
            } else if (orderType.indexOf ('limit') >= 0) {
                typeParse = 'limit';
                postOnly = (orderType.indexOf ('post-only') >= 0);
            }
        }
        const totalFee = this.safeNumber2 (order, 'totalFee', 'executedFee');
        const feeCurrency = this.safeString (order, 'feeCurrency');
        let fee = undefined;
        if (totalFee !== undefined) {
            fee = {
                'cost': totalFee,
                'currency': this.safeCurrencyCode (feeCurrency),
                'rate': undefined,
            };
        }
        const executedPrice = this.safeNumber (order, 'executedPrice');
        const orderPrice = this.safeNumber2 (order, 'price', 'originalPrice');
        let finalPrice = undefined;
        if ((executedPrice !== undefined) && (executedPrice !== 0)) {
            finalPrice = executedPrice;
        } else {
            finalPrice = orderPrice;
        }
        const datetime = this.safeString2 (order, 'createdAt', 'orderCreatedAt');
        const updateDatetime = this.safeString2 (order, 'updatedAt', 'orderUpdatedAt');
        const result = {
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'customerOrderId'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': this.safeSymbol (this.safeString (order, 'currencyPair')),
            'type': typeParse,
            'side': this.safeString2 (order, 'side', 'orderSide'),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.parse8601 (updateDatetime),
            'price': finalPrice,
            'amount': this.safeString2 (order, 'executedQuantity', 'originalQuantity'),
            'cost': this.safeString (order, 'total'),
            'average': this.safeString (order, 'averagePrice'),
            'filled': this.safeString (order, 'totalExecutedQuantity'),
            'remaining': this.safeString (order, 'remainingQuantity'),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': postOnly,
            'trades': undefined,
            'reduceOnly': this.safeValue (order, 'reduceOnly'),
            'triggerPrice': undefined,
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
            'status': status,
            'fee': fee,
            'info': order,
        };
        return this.safeOrder (result, market);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name valr#createOrder
         * @see https://docs.valr.com/#5beb7328-24ca-4d8a-84f2-6029725ad923
         * @description Create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency. If included in market order, use quote amount
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {object} [params.postOnly] if true will place a limit order and fail if matched immidiately
         * @param {object} [params.clientOrderId] an optional field which can be specified by clients to track this order using their own internal order management systems
         * @param {object} [params.allowMargin] Set to true for a margin / leverage trade
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure} with only the id and symbol added
         */
        await this.loadMarkets ();
        let response = undefined;
        this.checkRequiredSymbolArgument ('createOrder', symbol);
        const marketId = this.marketId (symbol);
        if (side !== 'buy' && side !== 'sell') {
            throw new InvalidOrder (this.id + ' createOrder() - "side" must be either "buy" or "sell".');
        }
        const body = {
            'side': side.toUpperCase (),
            'pair': marketId,
        };
        // Optional parameters
        if (this.safeString (params, 'clientOrderId')) {
            body['customerOrderId'] = this.safeString (params, 'clientOrderId');
        }
        if (this.safeString (params, 'allowMargin')) {
            body['allowMargin'] = this.safeString (params, 'allowMargin');
        }
        this.omit (params, [ 'allowMargin', 'clientOrderId' ]);
        if (type === 'market') {
            if (price) {
                body['quoteAmount'] = amount;
            } else {
                body['baseAmount'] = amount;
            }
            this.omit (params, [ 'baseAmount', 'quoteAmount' ]);
            response = await this.privatePostOrdersMarket (this.extend (body, params));
        } else if (type === 'limit') {
            body['price'] = this.numberToString (price);
            body['quantity'] = this.numberToString (amount);
            if (this.safeString (params, 'postOnly')) {
                body['postOnly'] = this.safeBool (params, 'postOnly');
                this.omit (params, 'postOnly');
            }
            response = await this.privatePostOrdersLimit (this.extend (body, params));
        } else {
            throw new InvalidOrder (this.id + ' createOrder() - "type" must be either "market" or "limit" to create an order.');
        }
        const timestamp = this.parseDate (this.safeString (this.last_response_headers, 'Date'));
        return this.parseOrder ({
            'createdAt': this.iso8601 (timestamp),
            'orderId': this.safeString (response, 'id'),
            'currencyPair': marketId,
            'customerOrderId': this.safeString (params, 'clientOrderId'),
        });
    }

    async createOrders (orders: OrderRequest[], params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        throw new NotSupported (this.id + ' createOrders() is not supported yet');
        // const response = await this.privatePostBatchOrders ()
    }

    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name valr#editOrder
         * @see https://docs.valr.com/#0d31c914-0393-463b-966a-97dbc50554fd
         * @description Edit a trade order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} [amount] how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency. If included in market order, use quote amount
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.matchRetain] RETAIN_ORIGINAL (default) keeps original order, CANCEL_ORIGINAL to cancle original order or REPRICE to reprice within one tick
         * @param {boolean} [params.setTotal] If true (default), new amount will takes current fill quantity into account, otherwise it simply forces new amount to be set.
         * @param {object} [params.clientOrderId] an optional field which can be specified by clients to track this order using their own internal order management systems
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure} with only the id and symbol added
         */
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const modifyMethod = this.safeString (params, 'matchRetain', 'RETAIN_ORIGINAL');
        const orderFormat = {
            'orderId': id,
            'pair': marketId,
            'modifyMatchStrategy': modifyMethod,
        };
        if (price !== undefined) {
            orderFormat['newPrice'] = this.numberToString (price);
        }
        if (amount !== undefined) {
            const amountStrategy = this.safeBool (params, 'setTotal', true);
            const amountMethod = (amountStrategy) ? 'newTotalQuantity' : 'newRemainingQuantity';
            orderFormat[amountMethod] = this.numberToString (amount);
        }
        if (this.safeString (params, 'clientOrderId')) {
            orderFormat['customerOrderId'] = this.safeString (params, 'clientOrderId');
        }
        params = this.omit (params, [ 'matchRetain', 'setTotal', 'clientOrderId' ]);
        const response = await this.privatePutOrdersModify (this.extend (orderFormat, params));
        return this.parseOrder ({
            'orderUpdatedAt': this.iso8601 (this.parseDate (this.safeString (this.last_response_headers, 'Date'))),
            'orderId': id,
            'transactionId': this.safeString (response, 'id'),
            'currencyPair': marketId,
            'customerOrderId': this.safeString (params, 'clientOrderId'),
        });
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name valr#cancelOrder
         * @see https://docs.valr.com/#3d9ba169-7222-4c0f-ab08-87c22162c0c4
         * @description cancels an open order
         * @param {string} id order id or customer order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.clientOrderId] ID is for clientOrderId field and associate API call (default is false)
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure} with only the id and symbol added
         */
        await this.loadMarkets ();
        this.checkRequiredSymbolArgument ('cancelOrder', symbol);
        const useClientOrderId = this.safeBool (params, 'clientOrderId', false);
        const marketId = this.marketId (symbol);
        const orderFormat = { 'pair': marketId };
        if (useClientOrderId) {
            params = this.omit (params, 'clientOrderId');
            orderFormat['customerOrderId'] = id;
        } else {
            orderFormat['orderId'] = id;
        }
        await this.privateDeleteOrdersOrder (this.extend (orderFormat, params));
        return this.parseOrder ({
            'orderUpdatedAt': this.iso8601 (this.parseDate (this.safeString (this.last_response_headers, 'Date'))),
            'orderId': (!useClientOrderId) ? id : undefined,
            'customerOrderId': (useClientOrderId) ? id : undefined,
            'currencyPair': marketId,
        });
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name valr#cancelAllOrders
         * @see https://docs.valr.com/#90822956-7e25-48a8-bd14-a83fb8766b46
         * @description cancels all an open order or all open orders on a specific market
         * @param {string} [symbol] unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an list of [order structure]{@link https://docs.ccxt.com/#/?id=order-structure} with only the id and option symbol added
         */
        await this.loadMarkets ();
        let response = undefined;
        let marketId = undefined;
        if (symbol === undefined) {
            response = await this.privateDeleteOrders (params);
        } else {
            this.checkRequiredSymbolArgument ('cancelAllOrders', symbol);
            marketId = this.marketId (symbol);
            const body = {
                'pair': marketId,
            };
            response = await this.privateDeleteOrdersPair (this.extend (body, params));
        }
        const timestamp = this.parseDate (this.safeString (this.last_response_headers, 'Date'));
        for (let i = 0; i < response.length; i++) {
            response[i]['currencyPair'] = marketId;
            response[i]['orderUpdatedAt'] = this.iso8601 (timestamp);
        }
        return this.parseOrders (response);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name valr#fetchTrades
         * @see https://docs.valr.com/#68ecbf66-c8ab-4460-a1f3-5b245b15877e
         * @see https://docs.valr.com/#8e9429c0-f43b-4483-a2be-d03cd1bbb230
         * @description get the list of most recent trades for a particular symbol. If API keys present, use private API call for improved rate limits
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {object} [params.skip] number of items to skip to skip from list
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        let response = undefined;
        this.checkRequiredSymbolArgument ('fetchTrades', symbol);
        const queryParams = {
            'pair': this.marketId (symbol),
        };
        if (since !== undefined) {
            queryParams['startTime'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            queryParams['limit'] = limit;
        }
        if (this.checkRequiredCredentials (false)) {
            response = await this.privateGetMarketdataPairTradehistory (this.extend (queryParams, params));
            // [
            //     {
            //       "price": "43023",
            //       "quantity": "0.01971316",
            //       "currencyPair": "BTCUSDC",
            //       "tradedAt": "2024-02-07T12:48:40.256Z",
            //       "takerSide": "sell",
            //       "sequenceId": 1204770707632816000,
            //       "id": "37e5fba7-c5b7-11ee-b1a8-c700095e5df0",
            //       "quoteVolume": "848.11928268"
            //     },
            //     {
            //       "price": "42909",
            //       "quantity": "0.00005173",
            //       "currencyPair": "BTCUSDC",
            //       "tradedAt": "2024-02-07T12:24:22.818Z",
            //       "takerSide": "buy",
            //       "sequenceId": 1204764594694783000,
            //       "id": "d33297ae-c5b3-11ee-b1a8-c700095e5df0",
            //       "quoteVolume": "2.21968257"
            //     },
            // ]
        } else {
            response = await this.publicGetPairTrades (params);
            // [
            //     {
            //       "price": "43064",
            //       "quantity": "0.00079928",
            //       "currencyPair": "BTCUSDC",
            //       "tradedAt": "2024-02-05T07:47:04.625Z",
            //       "takerSide": "sell",
            //       "sequenceId": 1203970033324130300,
            //       "id": "c13c5166-c3fa-11ee-b1a8-c700095e5df0",
            //       "quoteVolume": "34.42019392"
            //     },
            //     {
            //       "price": "43010",
            //       "quantity": "0.0001",
            //       "currencyPair": "BTCUSDC",
            //       "tradedAt": "2024-02-05T07:39:40.198Z",
            //       "takerSide": "buy",
            //       "sequenceId": 1203968169262186500,
            //       "id": "b8562435-c3f9-11ee-b1a8-c700095e5df0",
            //       "quoteVolume": "4.301"
            //     },
            // ]
        }
        return this.parseTrades (response, undefined, since, limit, params);
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name valr#fetchMyTrades
         * @see https://docs.valr.com/#68ecbf66-c8ab-4460-a1f3-5b245b15877e
         * @see https://docs.valr.com/#8e9429c0-f43b-4483-a2be-d03cd1bbb230
         * @description get the list of most recent trades for a particular symbol for the profile.
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {object} [params.skip] number of items to skip to skip from list
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        this.checkRequiredSymbolArgument ('fetchMyTrades', symbol);
        const queryParams = {
            'pair': this.marketId (symbol),
        };
        if (limit !== undefined) {
            queryParams['limit'] = limit;
        }
        if (since !== undefined) {
            queryParams['startTime'] = this.iso8601 (since);
        }
        const response = await this.privateGetAccountPairTradehistory (this.extend (queryParams, params));
        // [
        //     {
        //       "price": "29001",
        //       "quantity": "0.00137926",
        //       "currencyPair": "BTCUSDC",
        //       "tradedAt": "2024-02-07T06:00:30.180Z",
        //       "side": "buy",
        //       "sequenceId": 1204667988813283300,
        //       "id": "32ad194e-c57e-11ee-9935-593da58a6690",
        //       "orderId": "3fda280f-e87e-44c8-babf-852da844e514",
        //       "fee": "0.000000413778",
        //       "feeCurrency": "BTC"
        //     },
        //     {'price': '19.3017',
        //     'quantity': '1',
        //     'currencyPair': 'USDCZAR',
        //     'tradedAt': '2024-02-27T14:46:44.852Z',
        //     'side': 'sell',
        //     'sequenceId': '1212048179894161409',
        //     'id': '06e88b34-d57f-11ee-92bb-d59de6d96a53',
        //     'orderId': '5ae9af1e-eb05-427e-af4f-50bcbd9dc8f1',
        //     'makerReward': '0.0001',
        //     'makerRewardCurrency': 'USDC'}
        // ]
        return this.parseTrades (response, undefined, since, limit, params);
    }

    parseTrade (trade: object, market: Market = undefined): Trade {
        const symbol = this.safeSymbol (this.safeString (trade, 'currencyPair'));
        const timestamp = this.parse8601 (this.safeString (trade, 'tradedAt'));
        const feeCost = this.safeNumber (trade, 'totalFee');
        const fee = {
            'currency': this.safeCurrencyCode (this.safeString (trade, 'feeCurrency')),
            'cost': feeCost,
            'rate': undefined,
        };
        return this.safeTrade ({
            'info': trade,
            'amount': this.safeNumber (trade, 'quantity'),
            'clientOrderId': this.safeString (trade, 'customerOrderId'),
            'cost': this.safeNumber (trade, 'quoteVolume'),
            'datetime': this.safeString (trade, 'tradedAt'),
            'fee': fee,
            'id': this.safeString (trade, 'id'),
            'order': this.safeString (trade, 'orderId'),
            'price': this.safeNumber (trade, 'price'),
            'side': this.safeString2 (trade, 'side', 'takerSide'),
            'symbol': symbol,
            'takerOrMaker': undefined,
            'timestamp': timestamp,
        });
    }

    async fetchTradingFees (params = {}): Promise<TradingFees> {
        /**
         * @method
         * @name valr#fetchTradingFees
         * @see https://docs.valr.com/#00502bc7-bf1e-40d5-b284-25fa719f0229
         * @description fetch the trading fees for multiple markets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.privateGetAccountFeesTrade (params);
        if (!Array.isArray (response)) {
            throw new NullResponse (this.id + ' ' + 'fetchTradingFees() received incorrect response');
        }
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const tradeFee = response[i];
            const symbol = this.safeSymbol (this.safeString (tradeFee, 'currencyPair'));
            if (('makerPercentage' in tradeFee) && ('takerPercentage' in tradeFee)) {
                let makerStr = this.safeString (tradeFee, 'makerPercentage');
                let takerStr = this.safeString (tradeFee, 'takerPercentage');
                makerStr = (makerStr !== undefined) ? Precise.stringDiv (makerStr, '100') : undefined;
                takerStr = (takerStr !== undefined) ? Precise.stringDiv (takerStr, '100') : undefined;
                result[symbol] = {
                    'maker': this.parseNumber (makerStr),
                    'taker': this.parseNumber (takerStr),
                    'info': tradeFee,
                    'symbol': symbol,
                    'percentage': true,
                    'tierBased': true,
                };
            } else {
                // Trading pair only avialble on VALR simple buy/sell platform and not trading platform.
                continue;
            }
        }
        return result;
        // todo: Let fetchTradingFee only returned symbol instead of all - requires update in Exchange.ts
        // todo: Update .market values with feeTrading values.
    }

    async loadTradingFees (params = {}) {
        await this.loadMarkets ();
        const tradingFees = await this.fetchTradingFees (params);
        const tradingFeesList = this.toArray (tradingFees);
        for (let i = 0; i < tradingFeesList.length; i++) {
            const tradeFee = tradingFeesList[i];
            const symbol = tradeFee['symbol'];
            if (symbol in this.markets) {
                this.markets[symbol]['taker'] = tradeFee['taker'];
                this.markets[symbol]['maker'] = tradeFee['maker'];
            }
        }
    }

    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        /**
         * @method
         * @name valr#fetchDepositAddress
         * @see https://docs.valr.com/#b10ea5dd-00cb-4c33-bb28-53104a8f1b7b
         * @see https://docs.valr.com/#619d83fa-f562-4ed3-a573-81afbafd2f1c
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        this.checkRequiredCurrencyCodeArgument ('fetchDepositAddress', code);
        let response = undefined;
        const currency = this.safeCurrency (code);
        const currencyId = {
            'currency': currency['id'],
        };
        if (this.isFiat (code)) {
            response = await this.privateGetWalletFiatCurrencyDepositReference (this.extend (currencyId, params));
            // {'reference': 'USDGVVU6XR'}
        } else {
            response = await this.privateGetWalletCryptoCurrencyDepositAddress (this.extend (currencyId, params));
            // {'currency': 'BTC',
            // 'address': '3Af2LnWaUFS2wXmXQMugsEtnq7iJTEncfX',
            // 'networkType': 'Bitcoin'}
        }
        return this.parseDepositAddress (response, currency);
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined) {
        const currencyId = this.safeString (currency, 'id');
        return {
            'currency': this.safeCurrencyCode (this.safeString (depositAddress, 'currency', currencyId)),
            'network': this.safeString (depositAddress, 'networkType'),
            'address': this.safeString2 (depositAddress, 'address', 'reference'),
            'tag': this.safeString (depositAddress, 'paymentReference'),
            'info': depositAddress,
        };
    }

    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name valr#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://docs.valr.com/#1061d8de-3792-4a0a-8ae6-715cb8a5179e
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        this.checkRequiredCurrencyCodeArgument ('fetchDeposits', code);
        let response = undefined;
        const currency = this.safeCurrency (code);
        const queryParams = {
            'currency': currency['id'],
        };
        if (this.isFiat (code)) {
            queryParams['transactionTypes'] = 'FIAT_DEPOSIT';
            response = await this.privateGetAccountTransactionhistory (this.extend (queryParams, params));
            // [{
            //     'transactionType': { 'type': 'FIAT_DEPOSIT', 'description': 'Deposit' },
            //     'creditCurrency': 'ZAR',
            //         'creditValue': '750',
            //             'eventAt': '2024-04-03T09:12:27.587038Z',
            //                 'id': '4ab7a1ff-f19a-11ee-92bb-8f9d774e71b6'
            // },
            // {
            //     'transactionType': { 'type': 'FIAT_DEPOSIT', 'description': 'Deposit' },
            //     'creditCurrency': 'ZAR',
            //         'creditValue': '1000',
            //             'eventAt': '2024-03-28T05:20:17.258300Z',
            //                 'id': 'dd1d9d20-ecc2-11ee-92bb-8f9d774e71b6'
            // }]
        } else {
            response = await this.privateGetWalletCryptoCurrencyDepositHistory (this.extend (queryParams, params));
            // [
            //     {
            //       "currencyCode": "BTC",
            //       "receiveAddress": "2MvLmR6cd4YVDFAU8BTujKkzrV1dwFaNHup",
            //       "transactionHash": "fb588e3be006058c5853880421ef7241388270e2b506ce7ca553f8e5b797f628",
            //       "networkType": "Bitcoin",
            //       "amount": "0.01",
            //       "createdAt": "2019-03-01T14:36:53Z",
            //       "confirmations": 2,
            //       "confirmed": true,
            //       "confirmedAt": "2019-03-01T14:48:47.340347Z"
            //     },
            //     {
            //       "currencyCode": "BTC",
            //       "receiveAddress": "2MvLmR6cd4YVDFAU8BTujKkzrV1dwFaNHup",
            //       "transactionHash": "a0a70db6c1b2f84caa562e8523f0aaee83c73d1e9ff97e9ec2d6b36f4ad56f3e",
            //       "networkType": "Bitcoin",
            //       "amount": "0.11229885",
            //       "createdAt": "2019-01-11T08:54:20Z",
            //       "confirmations": 0,
            //       "confirmed": true,
            //       "confirmedAt": "2019-01-11T09:30:57.265843Z"
            //     }
            //   ]
        }
        return this.parseTransactions (response);
        // Todo - Update Exchange.ts fetchDeposits argument from symbol to code parameter
    }

    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name valr#fetchWithdrawals
         * @see https://docs.valr.com/#d166dbf5-e922-4037-b0a7-5d490796662c
         * @description fetch history of withdrawals
         * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
         * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
         * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const currency = this.safeCurrency (code);
        const queryParams = {};
        let response = undefined;
        if (this.isFiat (code)) {
            if (code !== undefined) {
                queryParams['currency'] = currency['id'];
            }
            if (since !== undefined) {
                queryParams['startTime'] = this.iso8601 (since);
            }
            if (limit !== undefined) {
                queryParams['limit'] = limit;
            }
            queryParams['transactionTypes'] = 'FIAT_WITHDRAWAL';
            response = await this.privateGetAccountTransactionhistory (this.extend (queryParams, params));
        } else {
            this.checkRequiredCurrencyCodeArgument ('fetchWithdrawals', code);
            queryParams['currency'] = currency['id'];
            response = await this.privateGetWalletCryptoCurrencyWithdrawHistory (this.extend (queryParams, params));
        // [
        //     {
        //       "currency": "BTC",
        //       "address": "invalidAddress123",
        //       "amount": "0.0001",
        //       "feeAmount": "0.0002",
        //       "confirmations": 0,
        //       "uniqueId": "2ab9dfce-7818-4812-9b33-fee7bd7c7c5a",
        //       "createdAt": "2019-04-20T14:30:26.950Z",
        //       "verified": true,
        //       "status": "Failed",
        //       "networkType": "Bitcoin"
        //     },
        //     {
        //       "currency": "BTC",
        //       "address": "mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt",
        //       "amount": "0.19974963",
        //       "feeAmount": "0.0002",
        //       "transactionHash": "a79535cc38f515d1c3ecac364057521ffece9ed0ed11667ba2b83bcc8c065994",
        //       "confirmations": 2,
        //       "lastConfirmationAt": "2019-03-12T08:08:13.879189",
        //       "uniqueId": "a243daf8-cc5d-4e61-9618-433e0d4c79ac",
        //       "createdAt": "2019-03-11T10:36:23.739Z",
        //       "verified": true,
        //       "status": "Complete",
        //       "networkType": "Bitcoin"
        //     },
        //     {
        //       "currency": "BTC",
        //       "address": "mkuKgijS7w4hjWL3Zs7kw7HQvM85a2F8RZ",
        //       "amount": "0.01",
        //       "feeAmount": "0.00055",
        //       "transactionHash": "87d8701d3b241cc6a32b10388ad5c6f8cf9a9336d9e9fcd2592ad84b57473eb9",
        //       "confirmations": 2,
        //       "lastConfirmationAt": "2019-01-12T08:55:14.692649",
        //       "uniqueId": "be612be3-06e3-4214-b81e-9bf8e645c28a",
        //       "createdAt": "2019-01-11T12:56:21.080Z",
        //       "verified": true,
        //       "status": "Processing",
        //       "networkType": "Bitcoin"
        //     }
        //   ]
        // Todo - Update Exchange.ts fetchDeposits argument from symbol to code parameter
        }
        return this.parseTransactions (response, currency, since, limit, params);
    }

    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name valr#fetchLedger
         * @see https://docs.valr.com/#0d7cc0ff-b8ca-4e1f-980e-36d07672e53d
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string} [code] uunified currency code, default is undefined
         * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int} [limit] max number of ledger entrys to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {object} [params.skip] number of items to skip from list
         * @param {object} [params.transactionTypes] string list of transaction types to match (see VALR docs for details)
         * @returns {object} a list of [ledger entry structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#ledger-entry-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const queryParams = {};
        if (code !== undefined) {
            currency = this.currency (code);
            queryParams['currency'] = currency['id'];
        }
        if (since !== undefined) {
            queryParams['startTime'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            queryParams['limit'] = limit;
        }
        const response = await this.privateGetAccountTransactionhistory (this.extend (queryParams, params));
        params = this.omit (params, 'transactionTypes');
        const accountId = {
            'account': this.safeString (this.last_request_headers, 'X-VALR-SUB-ACCOUNT-ID', '0'),
        };
        return this.parseLedger (response, currency, since, limit, this.extend (accountId, params));
    }

    parseLedgerEntry (item, currency: Currency = undefined): LedgerEntry {
        const ledgerTypeInfo = this.safeDict (item, 'transactionType');
        const ledgerType = this.safeString (ledgerTypeInfo, 'type');
        const transactionTypes = {
            'ACCOUNT_FUNDING': [ 'deposit', 'in' ],
            'LIMIT_BUY': [ 'trade', 'in' ],
            'LIMIT_SELL': [ 'trade', 'out' ],
            'MARKET_BUY': [ 'trade', 'in' ],
            'MARKET_SELL': [ 'trade', 'out' ],
            'SIMPLE_BUY': [ 'trade', 'in' ],
            'SIMPLE_SELL': [ 'trade', 'out' ],
            'AUTO_BUY': [ 'trade', 'in' ],
            'MAKER_REWARD': [ 'cashback', 'in' ],
            'BLOCKCHAIN_RECEIVE': [ 'deposit', 'in' ],
            'BLOCKCHAIN_SEND': [ 'withdrawal', 'out' ],
            'FIAT_DEPOSIT': [ 'deposit', 'in' ],
            'FIAT_WITHDRAWAL': [ 'withdrawal', 'out' ],
            'REFERRAL_REBATE': [ 'rebate', 'in' ],
            'REFERRAL_REWARD': [ 'referral', 'in' ],
            'PROMOTIONAL_REBATE': [ 'rebate', 'in' ],
            'INTERNAL_TRANSFER': [ 'transfer', undefined ],
            'FIAT_WITHDRAWAL_REVERSAL': [ 'deposit', 'in' ],
            'PAYMENT_SENT': [ 'withdrawal', 'out' ],
            'PAYMENT_RECEIVED': [ 'deposit', 'in' ],
            'PAYMENT_REVERSED': [ 'deposit', 'in' ],
            'PAYMENT_REWARD': [ 'cashback', 'in' ],
            'OFF_CHAIN_BLOCKCHAIN_WITHDRAW': [ 'withdrawal', 'out' ],
            'OFF_CHAIN_BLOCKCHAIN_DEPOSIT': [ 'deposit', 'in' ],
            'SIMPLE_SWAP_BUY': [ 'trade', 'in' ],
            'SIMPLE_SWAP_SELL': [ 'trade', 'out' ],
            'SIMPLE_SWAP_FAILURE_REVERSAL': [ 'transaction', undefined ],
            'SPOT_LEND_INTEREST_PAYMENT': [ 'interest', 'in' ],
            'SPOT_BORROW_INTEREST_CHARGE': [ 'interest', 'out' ],
            'FUTURES_FUNDING_PAID': [ 'interest', 'out' ],
            'FUTURES_PNL_LOSS': [ 'trade', 'out' ],
            'FUTURES_PNL_PROFIT': [ 'trade', 'in' ],
        };
        // const transactionDisciption = this.safeString (transactionTypeInfo, 'Deposit');
        const entryTime = this.parseDate (this.safeString (item, 'eventAt'));
        const additionalInfo = this.safeDict (item, 'additionalInfo');
        const matchEventType = this.safeList (transactionTypes, ledgerType);
        let parseType = undefined;
        let direction = undefined;
        if (matchEventType !== undefined) {
            parseType = matchEventType[0];
            direction = matchEventType[1];
        } else {
            this.log (ledgerType);
        }
        if (ledgerType === 'INTERNAL_TRANSFER') {
            direction = ('creditCurrency' in item) ? 'in' : 'out';
        }
        let amount = undefined;
        let code = undefined;
        if (direction === 'in') {
            amount = this.safeNumber (item, 'creditValue');
            code = this.safeCurrencyCode (this.safeString (item, 'creditCurrency'));
        } else if (direction === 'out') {
            amount = this.safeNumber (item, 'debitValue');
            code = this.safeCurrencyCode (this.safeString (item, 'debitCurrency'));
        }
        return {
            'id': this.safeString (item, 'id'),
            'timestamp': entryTime,
            'datetime': this.iso8601 (entryTime),
            'direction': direction,
            'account': undefined,
            'referenceId': this.safeString2 (additionalInfo, 'sourceTransactionId', 'orderId'),
            'referenceAccount': undefined,
            'type': parseType,
            'currency': code,
            'amount': amount,
            'before': 0,
            'after': 0,
            'status': 'ok',
            'fee': {
                'currency': this.safeCurrencyCode (this.safeString (item, 'feeCurrency')),
                'cost': this.safeNumber (item, 'feeValue'),
                'rate': undefined,
            },
            'info': item,
        };
    }

    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}): Promise<Transaction> {
        /**
         * @method
         * @name valr#withdraw
         * @see https://docs.valr.com/#bb0ad4dc-a28d-41a3-8e59-5070bc589c5a
         * @see https://docs.valr.com/#fb4db187-530b-4632-b933-7bdfd192bcf5
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        this.checkRequiredCurrencyCodeArgument ('fetchWithdrawals', code);
        const currency = this.safeCurrency (code);
        // todo: Include 'networkType' from default currency if none provided via params
        let response = undefined;
        if (this.isFiat (code)) {
            const withdrawalBody = {
                'currency': currency['id'],
                'linkedBankAccountId': address,
                'amount': this.numberToString (amount),
            };
            response = await this.privatePostWalletFiatCurrencyWithdraw (this.extend (withdrawalBody, params));
        } else {
            const withdrawalBody = {
                'currency': currency['id'],
                'address': address,
                'amount': this.numberToString (amount),
            };
            response = await this.privatePostWalletCryptoCurrencyWithdraw (this.extend (withdrawalBody, params));
        }
        return this.parseTransaction (response);
    }

    parseTransaction (transaction, currency: Currency = undefined): Transaction {
        if ('transactionType' in transaction) {
            return this.parseTransactionHistory (transaction);
        }
        const timestamp = this.parse8601 (this.safeString (transaction, 'createdAt'));
        const code = this.safeCurrencyCode (this.safeString (transaction, 'currencyCode'));
        let status = undefined;
        if (this.safeBool (transaction, 'confirmed')) {
            status = 'ok';
        }
        let transactionType = undefined;
        if ('receiveAddress' in transaction) {
            transactionType = 'deposit';
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'transactionHash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': this.safeString (transaction, 'receiveAddress'),
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': transactionType,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': this.parse8601 (this.safeString (transaction, 'confirmedAt')),
            'fee': undefined,
            'network': this.safeString (transaction, 'networkType'),
            'comment': undefined,
            'internal': undefined,
        } as Transaction;
    }

    parseTransactionHistory (transaction) {
        const transactionTypeInfo = this.safeDict (transaction, 'transactionType');
        const transactionType = this.safeString (transactionTypeInfo, 'type');
        // const transactionDisciption = this.safeString (transactionTypeInfo, 'Deposit');
        let parseType = undefined;
        let amount = undefined;
        let status = undefined;
        let currency = undefined;
        let address = undefined;
        let addressTo = undefined;
        let fee = undefined;
        const eventTime = this.parseDate (this.safeString (transaction, 'eventAt'));
        if (transactionType === 'FIAT_DEPOSIT' || transactionType === 'FIAT_WITHDRAWAL') {
            parseType = (transactionType === 'FIAT_DEPOSIT') ? 'deposit' : 'withdrawal';
            amount = this.safeNumber2 (transaction, 'creditValue', 'debitValue');
            status = 'ok';
            currency = this.safeCurrencyCode (this.safeString2 (transaction, 'creditCurrency', 'debitCurrency'));
            fee = {
                'currency': this.safeCurrencyCode (this.safeString (transaction, 'feeCurrency')),
                'cost': this.safeNumber (transaction, 'feeValue'),
                'rate': undefined,
            };
            if (parseType === 'withdrawal') {
                const additionalInfo = this.safeDict (transaction, 'additionalInfo');
                address = this.safeString (additionalInfo, 'accountNumber');
                addressTo = this.safeString (additionalInfo, 'bankName');
            }
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': undefined,
            'timestamp': eventTime,
            'datetime': this.iso8601 (eventTime),
            'address': address,
            'addressFrom': undefined,
            'addressTo': addressTo,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': parseType,
            'amount': amount,
            'currency': currency,
            'status': status,
            'updated': undefined,
            'fee': fee,
            'network': undefined,
            'comment': undefined,
            'internal': undefined,
        } as Transaction;
    }

    async fetchCrossBorrowRates (params = {}): Promise<CrossBorrowRates> {
        await this.loadMarkets ();
        const response = await this.privateGetLoansRates (params);
        const results = {};
        for (let i = 0; i < response.length; i++) {
            const borrowRate = response[i];
            const code = this.safeCurrencyCode (this.safeString (borrowRate, 'currency'));
            if (code !== undefined) {
                results[code] = this.parseBorrowRate (borrowRate);
            }
        }
        return results;
    }

    parseBorrowRate (info, currency: Currency = undefined): Dict {
        const code = this.safeCurrencyCode (this.safeString (info, 'currency'));
        const httpTime = this.safeString (this.last_response_headers, 'Date');
        const timestamp = this.parseDate (httpTime);
        return {
            'currency': code,
            'rate': this.safeFloat (info, 'estimatedNextBorrowRate'),
            'period': 3600000,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    async fetchBorrowInterest (code: Str = undefined, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.safeCurrency (code);
        const currencyId = {
            'currency': currency['id'],
        };
        const response = await this.privateGetBorrowsCurrencyHistory ((this.extend (currencyId, params)));
        // [
        //     {
        //         'currency': 'USDC',
        //         'interestAmount': '0.00422975',
        //         'quantity': '617.30146378',
        //         'createdAt': '2024-04-27T17:00:00.058468Z'
        //     },
        //     {
        //         'currency': 'USDC',
        //         'interestAmount': '0.00422973',
        //         'quantity': '617.29723405',
        //         'createdAt': '2024-04-27T16:00:00.058495Z'
        //     },
        //     {
        //         'currency': 'USDC',
        //         'interestAmount': '0.0042297',
        //         'quantity': '617.29300435',
        //         'createdAt': '2024-04-27T15:00:00.071487Z'
        //     },
        //     {
        //         'currency': 'USDC',
        //         'interestAmount': '0.01194441',
        //         'quantity': '1743.19955994',
        //         'createdAt': '2024-04-27T14:00:00.179967Z'
        //     },
        //     {
        //         'currency': 'USDC',
        //         'interestAmount': '0.01194433',
        //         'quantity': '1743.18761561',
        //         'createdAt': '2024-04-27T13:00:00.179921Z'
        //     },
        //     {
        //         'currency': 'USDC',
        //         'interestAmount': '0.00000682',
        //         'quantity': '0.9949',
        //         'createdAt': '2024-04-27T12:00:00.179949Z'
        //     }]
        return this.parseBorrowInterests (response);
    }

    parseBorrowInterest (info, market: Market = undefined) {
        const code = this.safeCurrencyCode (this.safeString (info, 'currency'));
        const amount = this.safeString (info, 'quantity');
        const interestAmount = this.safeString (info, 'interestAmount');
        const interestRate = Precise.stringDiv (interestAmount, amount, 9);
        return {
            'account': undefined,
            'currency': code,
            'interest': this.parseNumber (interestAmount),
            'interestRate': this.parseNumber (interestRate),
            'amountBorrowed': this.parseNumber (amount),
            'timestamp': this.parseDate (this.safeString (info, 'createdAt')),
            'datetime': this.safeString (info, 'createdAt'),
            'info': info,
        };
    }

    async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const currency = this.safeCurrency (code);
        const accountsByName = this.indexBy (this.accounts, 'name');
        const fromAccountId = this.safeDict (accountsByName, fromAccount);
        const toAccountId = this.safeDict (accountsByName, toAccount);
        const query = {
            'fromId': fromAccountId ? fromAccountId['id'] : fromAccount,
            'toId': toAccountId ? toAccountId['id'] : toAccount,
            'currencyCode': currency['id'],
            'amount': amount,
            'subAccountId': '0',
        };
        await this.privatePostAccountSubaccountsTransfer ((this.extend (query, params)));
        const responseTimestamp = this.parseDate (this.safeString (this.last_response_headers, 'Date'));
        const last_json_request = this.parseJson (this.last_request_body);
        const requestedCurrency = this.safeString (last_json_request, 'currencyCode');
        return {
            'info': undefined,
            'id': undefined,
            'timestamp': responseTimestamp,
            'datetime': this.iso8601 (responseTimestamp),
            'currency': this.safeCurrencyCode (requestedCurrency),
            'amount': this.safeNumber (last_json_request, 'amount'),
            'fromAccount': this.safeString (last_json_request, 'fromId'),
            'toAccount': this.safeString (last_json_request, 'toId'),
            'status': undefined,
        };
    }

    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        /**
         * @method
         * @name exchange#fetchTransfer
         * @description fetches a transfer
         * @param {string} id transfer id
         * @param {int} [since] timestamp in ms of the earliest transfer to fetch
         * @param {int} [limit] the maximum amount of transfers to fetch
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        const query = {
            'transactionTypes': 'INTERNAL_TRANSFER',
        };
        const currency = this.safeCurrency (code);
        if (code !== undefined) {
            query['currency'] = currency['id'];
        }
        if (since !== undefined) {
            query['startTime'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            query['limit'] = limit;
        }
        const response = await this.privateGetAccountTransactionhistory (this.extend (query, params));
        return this.parseTransfers (response, currency, since, limit, params);
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        // [{'transactionType': {'type': 'INTERNAL_TRANSFER', 'description': 'Transfer'},
        //     'debitCurrency': 'ZAR',
        //     'debitValue': '1',
        //     'eventAt': '2024-06-13T20:49:36.846Z',
        //     'additionalInfo': {'reason': 'SUB_ACCOUNT',
        //      'reasonDescription': 'Transfer between subaccounts',
        //      'additional': 'Transfer from Primary to Development'},
        //     'id': '723a6e23-29c6-11ef-9e76-33277cfdd873'},
        //    {'transactionType': {'type': 'INTERNAL_TRANSFER', 'description': 'Transfer'},
        //     'creditCurrency': 'ZAR',
        //     'creditValue': '62629.65',
        //     'eventAt': '2024-06-12T05:19:28.689Z',
        //     'additionalInfo': {'reason': 'SUB_ACCOUNT',
        //      'reasonDescription': 'Transfer between subaccounts',
        //      'additional': 'Transfer from Trading to Primary'},]
        const ledgerTypeInfo = this.safeDict (transfer, 'transactionType');
        const ledgerType = this.safeString (ledgerTypeInfo, 'type');
        const transactionTypes = {
            'INTERNAL_TRANSFER': [ 'transfer', undefined ],
            // 'PAYMENT_SENT': [ 'withdrawal', 'out' ],
            // 'PAYMENT_RECEIVED': [ 'deposit', 'in' ],
            // 'PAYMENT_REVERSED': [ 'deposit', 'in' ],
            // 'PAYMENT_REWARD': [ 'cashback', 'in' ],
        };
        // const transactionDisciption = this.safeString (transactionTypeInfo, 'Deposit');
        const entryTime = this.parseDate (this.safeString (transfer, 'eventAt'));
        const additionalInfo = this.safeDict (transfer, 'additionalInfo');
        const matchEventType = this.safeList (transactionTypes, ledgerType);
        // let parseType = undefined;
        let direction = undefined;
        if (matchEventType !== undefined) {
            // parseType = matchEventType[0];
            direction = matchEventType[1];
        }
        if (ledgerType === 'INTERNAL_TRANSFER') {
            direction = ('creditCurrency' in transfer) ? 'in' : 'out';
        }
        let amount = undefined;
        let code = undefined;
        if (direction === 'in') {
            amount = this.safeNumber (transfer, 'creditValue');
            code = this.safeCurrencyCode (this.safeString (transfer, 'creditCurrency'));
        } else if (direction === 'out') {
            amount = this.safeNumber (transfer, 'debitValue');
            code = this.safeCurrencyCode (this.safeString (transfer, 'debitCurrency'));
        }
        const accounts = this.safeString (additionalInfo, 'additional');
        const fromIndex = accounts.indexOf ('from');
        const toIndex = accounts.indexOf ('to');
        const fromAccount = accounts.slice (fromIndex + 5, toIndex - 1);
        const toAccount = accounts.slice (toIndex + 3);
        const accountsByName = this.indexBy (this.accounts, 'name');
        const fromAccountId = this.safeDict (accountsByName, fromAccount);
        const toAccountId = this.safeDict (accountsByName, toAccount);
        return {
            'id': this.safeString (transfer, 'id'),
            'timestamp': entryTime,
            'datetime': this.iso8601 (entryTime),
            'currency': code,
            'amount': amount,
            'fromAccount': fromAccountId ? fromAccountId['id'] : fromAccount,
            'toAccount': toAccountId ? toAccountId['id'] : toAccount,
            'status': 'ok',
            'info': transfer,
        };
    }

    async fetchOpenInterest (symbol: string, params = {}): Promise<OpenInterest> {
        /**
         * @method
         * @name exchange#fetchOpenInterest
         * @see https://docs.valr.com/#459c7c67-3c0f-494e-851b-2fd83cbff2da
         * @description fetches information on open interest
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} a [open intrest structure]{@link https://docs.ccxt.com/#/README?id=open-interest-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetFuturesInfo (params);
        const result = this.parseOpenInterests (response, [ symbol ]);
        return this.filterBySymbol (result, symbol);
    }

    parseOpenInterest (interest, market: Market = undefined): OpenInterest {
        throw new NotSupported (this.id + ' parseOpenInterest () is not supported yet');
    }

    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        /**
         * @method
         * @name exchange#fetchFundingRates
         * @description fetches information on the next funding rate
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/README?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetFuturesInfo (params);
        const result = this.parseFundingRates (response);
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseFundingRate (contract: string, market: Market = undefined): FundingRate {
        // {'currencyPair': 'BTCZARPERP',
        //     'estimatedFundingRate': '-0.00002',
        //     'openInterest': '3.3416',
        //     'nextFundingRun': '1729886400000',
        //     'nextPnlRun': '1729886400000'}
        const nextFundingTimestamp = this.safeInteger (contract, 'nextFundingRun');
        return {
            'symbol': this.safeSymbol (this.safeString (contract, 'currencyPair')),
            'info': contract,
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601 (nextFundingTimestamp),
            'nextFundingRate': this.safeNumber (contract, 'estimatedFundingRate'),
            'interval': '1h',
        };
    }

    async fetchPositionsForSymbol (symbol: string, params = {}): Promise<Position[]> {
        /**
         * @method
         * @name exchange#fetchPositionsForSymbol
         * @description fetches all open positions for specific symbol, unlike fetchPositions (which is designed to work with multiple symbols) so this method might be preffered for one-market position, because of less rate-limit consumption and speed
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the endpoint
         * @param {object} [params.skip] number of items to skip from list
         * @param {object} [params.limit] number of items to limit from list
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure} with maximum 3 items - possible one position for "one-way" mode, and possible two positions (long & short) for "two-way" (a.k.a. hedge) mode
         */
        const queryParams = {
            'currencyPair': this.marketId (symbol),
        };
        return this.fetchPositions (this.extend (queryParams, params));
    }

    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const response = await this.privateGetPositionsOpen (params);
        return this.parsePositions (response, symbols);
    }

    parsePosition (position: Dict, market: Market = undefined): Position {
        // {
        //     "pair": "BTCUSDTPERP",
        //     "side": "buy",
        //     "quantity": "0.0013",
        //     "realisedPnl": "15.22299935",
        //     "totalSessionEntryQuantity": "0.0013",
        //     "totalSessionValue": "54.2438",
        //     "sessionAverageEntryPrice": "41726",
        //     "averageEntryPrice": "30001",
        //     "unrealisedPnl": "0.2613",
        //     "updatedAt": "2023-12-05T12:00:00.317Z",
        //     "createdAt": "2023-11-14T19:41:44.936Z",
        //     "positionId": "237a9503-b32b-5f40-28a9-03fe7ad510d4"
        //   },
        const timestamp = this.parseDate (this.safeString (position, 'createdAt'));
        const side = this.safeString (position, 'side');
        let positionSide = undefined;
        if (side === 'buy') {
            positionSide = 'long';
        } else if (side === 'sell') {
            positionSide = 'short';
        }
        return {
            'symbol': this.safeSymbol (this.safeString (position, 'pair')),
            'id': this.safeString (position, 'positionId'),
            'info': position,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'contracts': this.safeNumber (position, 'quantity'),
            'contractSize': this.safeNumber (position, 'totalSessionValue'),
            'side': positionSide,
            // notional?: number;
            // leverage?: number;
            'unrealizedPnl': this.safeNumber (position, 'unrealisedPnl'),
            'realizedPnl': this.safeNumber (position, 'realisedPnl'),
            // collateral?: number;
            'entryPrice': this.safeNumber (position, 'averageEntryPrice'),
            // markPrice?: number;
            // liquidationPrice?: number;
            // marginMode?: Str;
            // hedged?: boolean;
            // maintenanceMargin?: number;
            // maintenanceMarginPercentage?: number;
            // initialMargin?: number;
            // initialMarginPercentage?: number;
            // marginRatio?: number;
            // lastUpdateTimestamp?: number;
            // lastPrice?: number;
            // stopLossPrice?: number;
            // takeProfitPrice?: number;
            // percentage?: number;
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let partialPath = this.implodeParams (path, params);
        let subAccountId = this.safeString (params, 'subAccountId');
        params = this.omit (params, 'subAccountId');
        if (subAccountId === '0') {
            subAccountId = undefined;
        } else if (subAccountId === undefined) {
            subAccountId = this.safeString (this.options, 'subAccountId');
        }
        const query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                body = this.json (query);
            } else {
                partialPath += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'][api] + '/' + partialPath;
        let signHeaders = undefined;
        if (api === 'private') {
            const full_path = '/v' + this.version + '/' + partialPath;
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let message = timestamp + method.toUpperCase () + full_path;
            if (body !== undefined) {
                message += body;
            }
            if (subAccountId) {
                message += subAccountId;
            }
            const payloadBase64 = this.stringToBase64 (message);
            const signature = this.hmac (
                this.base64ToBinary (payloadBase64),
                this.base64ToBinary (this.stringToBase64 (this.secret)),
                sha512,
                'hex'
            );
            signHeaders = {
                // 'Content-Type': 'application/json',
                'X-VALR-API-KEY': this.apiKey,
                'X-VALR-SIGNATURE': signature,
                'X-VALR-TIMESTAMP': timestamp,
            };
            if (subAccountId) {
                signHeaders['X-VALR-SUB-ACCOUNT-ID'] = subAccountId;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': this.deepExtend (headers, signHeaders) };
    }

    handleErrors (statusCode: int, statusText: string, url: string, method: string, responseHeaders: Dict, responseBody: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to the default error handler
        }
        if (statusCode === 200 || statusCode === 202) {
            return undefined;
        }
        const message = this.safeString (response, 'message');
        const errorCode = this.safeString (response, 'code');
        if (errorCode && message) {
            const errorMessage = this.id + ' - ' + message;
            const erroCodeStr = errorCode.toString ();
            this.throwExactlyMatchedException (this.exceptions['exact'], erroCodeStr, errorMessage);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, errorMessage);
        }
        return undefined;
    }
}
