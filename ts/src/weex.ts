
//  ---------------------------------------------------------------------------

import Exchange from './abstract/weex.js';
import { ArgumentsRequired } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Currencies, Currency, Dict, FundingRate, FundingRateHistory, FundingRates, Int, Market, OHLCV, OrderBook, Str, Strings, Ticker, Tickers, Trade, TransferEntry } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class weex
 * @augments Exchange
 */
export default class weex extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'weex',
            'name': 'Weex',
            'countries': [ 'SG' ], // Singapore
            'rateLimit': 20, // 10 requests per second for public endpoints, 500 requests per 10 seconds for private endpoints
            'version': 'v3',
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelOrdersWithClientOrderId': false,
                'cancelOrderWithClientOrderId': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createLimitBuyOrder': false,
                'createLimitOrder': false,
                'createLimitSellOrder': false,
                'createMarketBuyOrder': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrder': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'deposit': false,
                'editOrder': false,
                'editOrders': false,
                'editOrderWithClientOrderId': false,
                'fetchAccounts': false,
                'fetchADLRank': false,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchGreeks': false,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
                'fetchL2OrderBook': false,
                'fetchL3OrderBook': false,
                'fetchLastPrices': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverage': false,
                'fetchLeverages': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrdersByStatus': false,
                'fetchOrderTrades': false,
                'fetchOrderWithClientOrderId': false,
                'fetchPosition': false,
                'fetchPositionADLRank': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsADLRank': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'privateAPI': false,
                'publicAPI': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
            },
            'urls': {
                'logo': '', // todo
                'api': {
                    'public': 'https://api-spot.weex.com',
                    'private': 'https://api-spot.weex.com',
                    'contract': 'https://api-contract.weex.com',
                    'contractPrivate': 'https://api-contract.weex.com',
                },
                'www': 'https://www.weex.com',
                'doc': [
                    'https://www.weex.com/api-doc',
                ],
            },
            'api': {
                'public': {
                    // multiply public endpoints weight by 5
                    'get': {
                        'api/v3/time': 5, // done
                        'api/v3/coins': 25, // done
                        'api/v3/exchangeInfo': 100, // done
                        'api/v3/ping': 5, // done
                        'api/v3/apiTradingSymbols': 25, // not unified
                        'api/v3/market/ticker/price': 20, // not unified
                        'api/v3/market/ticker/24hr': 10, // done
                        'api/v3/market/trades': 125, // done
                        'api/v3/market/klines': 10, // done
                        'api/v3/market/depth': 25, // done
                        'api/v3/market/ticker/bookTicker': 20, // done
                    },
                },
                'private': {
                    'get': {
                        'api/v3/account/': 5, // done
                        'api/v3/account/transferRecords': 3, // done
                        'api/v3/order': 2,
                        'api/v3/openOrders': 3,
                        'api/v3/allOrders': 10,
                        'api/v3/myTrades': 5,
                        'api/v3/rebate/affiliate/getAffiliateUIDs': 20,
                        'api/v3/rebate/affiliate/getChannelUserTradeAndAsset': 20,
                        'api/v3/rebate/affiliate/getAffiliateCommission': 20,
                        'api/v3/rebate/affiliate/getInternalWithdrawalStatus': 100,
                        'api/v3/rebate/affiliate/querySubChannelTransactions': 10,
                        'api/v3/agency/verifyReferrals': 20,
                        'api/v3/agency/getAssert': 20,
                        'api/v3/agency/getDealData': 20,
                    },
                    'post': {
                        'api/v3/account/bills': 5,
                        'api/v3/account/fundingBills': 5,
                        'api/v3/order': 5,
                        'api/v3/order/batch': 50,
                        'api/v3/rebate/affiliate/internalWithdrawal': 100,
                    },
                    'delete': {
                        'api/v3/order': 1,
                        'api/v3/openOrders': 1,
                        'api/v3/order/batch': 10,
                    },
                },
                'contract': {
                    // multiply public endpoints weight by 5
                    'get': {
                        'capi/v3/market/time': 5, // done
                        'capi/v3/market/exchangeInfo': 5, // done
                        'capi/v3/market/depth': 5, // done
                        'capi/v3/market/ticker/24hr': 200, // done
                        'capi/v3/market/ticker/bookTicker': 5, // done
                        'capi/v3/market/trades': 25, // done
                        'capi/v3/market/klines': 5, // done
                        'capi/v3/market/indexPriceKlines': 5, // done
                        'capi/v3/market/markPriceKlines': 5, // done
                        'capi/v3/market/historyKlines': 25, // done
                        'capi/v3/market/symbolPrice': 5, // not unified
                        'capi/v3/market/openInterest': 10, // done
                        'capi/v3/market/premiumIndex': 5, // done
                        'capi/v3/market/fundingRate': 25, // done
                        'capi/v3/market/apiTradingSymbols': 25, // not unified
                    },
                },
                'contractPrivate': {
                    'get': {
                        'capi/v3/account/balance': 10, // done
                        'capi/v3/account/commissionRate': 10,
                        'capi/v3/account/accountConfig': 10,
                        'capi/v3/account/symbolConfig': 10,
                        'capi/v3/account/position/allPosition': 15,
                        'capi/v3/account/position/singlePosition': 3,
                        'capi/v3/order': 3,
                        'capi/v3/openOrders': 5,
                        'capi/v3/order/history': 10,
                        'capi/v3/userTrades': 5,
                        'capi/v3/openAlgoOrders': 3,
                        'capi/v3/allAlgoOrders': 10,
                    },
                    'post': {
                        'capi/v3/account/income': 5,
                        'capi/v3/account/marginType': 50,
                        'capi/v3/account/leverage': 20,
                        'capi/v3/account/positionMargin': 30,
                        'capi/v3/account/modifyAutoAppendMargin': 30,
                        'capi/v3/order': 5,
                        'capi/v3/batchOrders': 10,
                        'capi/v3/algoOrder': 5,
                        'capi/v3/placeTpSlOrder': 5,
                        'capi/v3/modifyTpSlOrder': 5,
                    },
                    'delete': {
                        'capi/v3/order': 3,
                        'capi/v3/batchOrders': 10,
                        'capi/v3/allOpenOrders': 10,
                        'capi/v3/closePositions': 50,
                        'capi/v3/algoOrder': 3,
                        'capi/v3/algoOpenOrders': 10,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
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
                '1w': '1w',
                '1M': '1M',
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    // {"code":-1000,"msg":"An unknown error occurred."}
                    // {"code":-1142,"msg":"Parameter 'interval' is invalid."}
                    // {"code":-1142,"msg":"Parameter 'limit' is invalid."}
                    // {"code":-1150,"msg":"Request method 'GET' not supported"}
                    // {"code":-1044,"msg":"Invalid ACCESS_KEY."}
                    // {"code":-1052,"msg":"Insufficient permissions for this action."}
                    // {"code":-1047,"msg":"API authentication failed."}
                },
                'broad': {
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.1'),
                    'maker': this.parseNumber ('0.1'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.1') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.09') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.08') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.06') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.05') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.04') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.03') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.1') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.08') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.07') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.05') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.04') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.03') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.01') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0') ],
                        ],
                    },
                },
                'spot': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.1'),
                    'maker': this.parseNumber ('0.1'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.1') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.09') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.08') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.06') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.05') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.04') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.03') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.1') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.08') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.07') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.05') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.04') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.03') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.01') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0') ],
                        ],
                    },
                },
                'contract': {
                    'feeSide': 'quote',
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.08'),
                    'maker': this.parseNumber ('0.02'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.08') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.075') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.06') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.055') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.05') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.048') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.045') ],
                            [ this.parseNumber ('300000000'), this.parseNumber ('0.042') ],
                            [ this.parseNumber ('500000000'), this.parseNumber ('0.04') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.02') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.018') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.018') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.016') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.016') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.014') ],
                            [ this.parseNumber ('300000000'), this.parseNumber ('0.012') ],
                            [ this.parseNumber ('500000000'), this.parseNumber ('0.01') ],
                        ],
                    },
                },
            },
            'commonCurrencies': {
                'XBT': 'XBT',
            },
            'options': {
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'accountsByType': {
                },
                'networks': {
                    'BEP20': 'BEP20(BSC)',
                    'BSC': 'BEP20(BSC)',
                    'ERC20': 'ERC20',
                    'ETH': 'ERC20',
                    'POLYGON': 'POLYGON(MATIC)',
                    'MATIC': 'POLYGON(MATIC)',
                    'ARBITRUM': 'ARBITRUM(ARB)',
                    'ARB': 'ARBITRUM(ARB)',
                    'SOLANA': 'SOLANA(SOL)',
                    'SOL': 'SOLANA(SOL)',
                    'OP': 'OPTIMISM(OP)',
                    'OPTIMISM': 'OPTIMISM(OP)',
                    'AVALANCHEC': 'AVALANCHE_C(AVAX_C)',
                    'AVAXC': 'AVALANCHE_C(AVAX_C)',
                },
                'networksById': {
                    'BEP20(BSC)': 'BEP20',
                    'ERC20': 'ERC20',
                    'POLYGON(MATIC)': 'MATIC',
                    'ARBITRUM(ARB)': 'ARB',
                    'SOLANA(SOL)': 'SOL',
                    'OPTIMISM(OP)': 'OP',
                    'AVALANCHE_C(AVAX_C)': 'AVAXC',
                },
                'timeframes': {
                    'spot': {
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
                        '1w': '1w',
                        '1M': '1M',
                    },
                    'contract': {
                        '1m': '1m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1h',
                        '4h': '4h',
                        '12h': '12h',
                        '1d': '1d',
                        '1w': '1w',
                    },
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'test': true,
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': undefined,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': false,
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': {
                        'max': 10,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': 7, // per  implementation comments
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 300,
                    },
                },
                'forDerivs': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
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
                        'marketBuyRequiresPrice': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchCanceledAndClosedOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000, // 100 for historical
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forDerivs',
                    },
                    'inverse': undefined,
                },
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    /**
     * @method
     * @name weex#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://www.weex.com/api-doc/spot/ConfigAPI/Ping
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        const response = await this.publicGetApiV3Ping (params);
        // reutns an empty response if the exchange is alive, otherwise will trigger an error
        return {
            'status': 'ok',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name weex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.weex.com/api-doc/spot/ConfigAPI/GetServerTime
     * @see https://www.weex.com/api-doc/contract/Market_API/GetServerTime
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', default is 'spot'
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTime', undefined, params);
        let response = undefined;
        if (type !== 'spot') {
            response = await this.contractGetCapiV3MarketTime (params);
        } else {
            response = await this.publicGetApiV3Time (params);
        }
        //
        //     {
        //         "serverTime": 1764505776347
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    /**
     * @method
     * @name weex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.weex.com/api-doc/spot/ConfigAPI/CurrencyInfo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetApiV3Coins (params);
        //
        //     [
        //         {
        //             "coin": "BTC",
        //             "depositAllEnable": true,
        //             "withdrawAllEnable": true,
        //             "name": "BTC",
        //             "networkList": [
        //                 {
        //                     "network": "BTC",
        //                     "coin": "BTC",
        //                     "withdrawIntegerMultiple": 1E-8,
        //                     "isDefault": true,
        //                     "depositEnable": true,
        //                     "withdrawEnable": true,
        //                     "depositDesc": null,
        //                     "withdrawDesc": null,
        //                     "name": "BTC",
        //                     "withdrawFee": "0.00016",
        //                     "withdrawMin": "0.002",
        //                     "depositDust": "0.00001",
        //                     "minConfirm": 3,
        //                     "withdrawTag": false,
        //                     "contractAddressUrl": "https://www.blockchain.com/explorer/mempool/",
        //                     "contractAddress": "btc"
        //                 },
        //                 {
        //                     "network": "BEP20(BSC)",
        //                     "coin": "BTC",
        //                     "withdrawIntegerMultiple": 1E-8,
        //                     "isDefault": false,
        //                     "depositEnable": true,
        //                     "withdrawEnable": false,
        //                     "depositDesc": null,
        //                     "withdrawDesc": null,
        //                     "name": "BEP20(BSC)",
        //                     "withdrawFee": "0.00001",
        //                     "withdrawMin": "0.00006",
        //                     "depositDust": "0.00003",
        //                     "minConfirm": 61,
        //                     "withdrawTag": false,
        //                     "contractAddressUrl": "",
        //                     "contractAddress": ""
        //                 }
        //             ]
        //         },
        //         {
        //             "coin": "USDT",
        //             "depositAllEnable": true,
        //             "withdrawAllEnable": true,
        //             "name": "USDT",
        //             "networkList": [
        //                 {
        //                     "network": "TRC20",
        //                     "coin": "USDT",
        //                     "withdrawIntegerMultiple": 1E-8,
        //                     "isDefault": true,
        //                     "depositEnable": true,
        //                     "withdrawEnable": true,
        //                     "depositDesc": null,
        //                     "withdrawDesc": null,
        //                     "name": "TRC20",
        //                     "withdrawFee": "1.5",
        //                     "withdrawMin": "10",
        //                     "depositDust": "0.1",
        //                     "minConfirm": 20,
        //                     "withdrawTag": false,
        //                     "contractAddressUrl": "https://tronscan.org/#/token20/",
        //                     "contractAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
        //                 },
        //                 {
        //                     "network": "ERC20",
        //                     "coin": "USDT",
        //                     "withdrawIntegerMultiple": 1E-8,
        //                     "isDefault": false,
        //                     "depositEnable": true,
        //                     "withdrawEnable": true,
        //                     "depositDesc": null,
        //                     "withdrawDesc": null,
        //                     "name": "ERC20",
        //                     "withdrawFee": "1",
        //                     "withdrawMin": "20",
        //                     "depositDust": "0.1",
        //                     "minConfirm": 12,
        //                     "withdrawTag": false,
        //                     "contractAddressUrl": "https://etherscan.io/token/",
        //                     "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7"
        //                 },
        //                 {
        //                     "network": "AVALANCHE_C(AVAX_C)",
        //                     "coin": "USDT",
        //                     "withdrawIntegerMultiple": 1E-8,
        //                     "isDefault": false,
        //                     "depositEnable": true,
        //                     "withdrawEnable": true,
        //                     "depositDesc": null,
        //                     "withdrawDesc": null,
        //                     "name": "AVALANCHE_C(AVAX_C)",
        //                     "withdrawFee": "0.5",
        //                     "withdrawMin": "10",
        //                     "depositDust": "0.1",
        //                     "minConfirm": 35,
        //                     "withdrawTag": false,
        //                     "contractAddressUrl": "https://avascan.info/blockchain/c/token/",
        //                     "contractAddress": "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"
        //                 }
        //             ]
        //         }
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currency = this.safeDict (response, i);
            const currencyId = this.safeString (currency, 'coin');
            const code = this.safeCurrencyCode (currencyId);
            const name = this.safeString (currency, 'name');
            const networks: Dict = {};
            const chains = this.safeList (currency, 'networkList', []);
            for (let j = 0; j < chains.length; j++) {
                const chain = this.safeDict (chains, j);
                const networkId = this.safeString (chain, 'network');
                const networkCode = this.networkIdToCode (networkId);
                networks[networkCode] = {
                    'info': chain,
                    'id': networkId,
                    'network': networkCode,
                    'active': undefined,
                    'deposit': this.safeBool (chain, 'depositEnable'),
                    'withdraw': this.safeBool (chain, 'withdrawEnable'),
                    'fee': this.safeNumber (chain, 'withdrawFee'),
                    'precision': this.safeNumber (chain, 'withdrawIntegerMultiple'),
                    'isDefault': this.safeBool (chain, 'isDefault', false),
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (chain, 'withdrawMin'),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.safeNumber (chain, 'depositDust'),
                            'max': undefined,
                        },
                    },
                };
            }
            const networkKeys = Object.keys (networks);
            const networksLength = networkKeys.length;
            const emptyChains = networksLength === 0; // non-functional coins
            const valueForEmpty = emptyChains ? false : undefined;
            result[code] = this.safeCurrencyStructure ({
                'info': currency,
                'code': code,
                'id': currencyId,
                'type': 'crypto',
                'name': name,
                'active': undefined,
                'deposit': valueForEmpty,
                'withdraw': valueForEmpty,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': networks,
            });
        }
        return result;
    }

    /**
     * @method
     * @name weex#fetchMarkets
     * @description retrieves data on all markets for exchagne
     * @see https://www.weex.com/api-doc/spot/ConfigAPI/GetProductInfo // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetContractInfo // contract
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const promises = [
            this.publicGetApiV3ExchangeInfo (params),
            this.contractGetCapiV3MarketExchangeInfo (params),
        ];
        const [ spotResponse, contractResponse ] = await Promise.all (promises);
        const spotArray = this.safeList (spotResponse, 'symbols', []);
        const contractArray = this.safeList (contractResponse, 'symbols', []);
        const result = this.arrayConcat (spotArray, contractArray);
        return this.parseMarkets (result);
    }

    parseMarket (market: Dict): Market {
        //
        // spot
        //     {
        //         "symbol": "ETHUSDT",
        //         "status": "TRADING",
        //         "baseAsset": "ETH",
        //         "baseAssetPrecision": "8",
        //         "quoteAsset": "USDT",
        //         "quoteAssetPrecision": "8",
        //         "tickSize": "0.01",
        //         "stepSize": "0.00001",
        //         "minTradeAmount": "0.0001",
        //         "maxTradeAmount": "99999",
        //         "takerFeeRate": "0.001",
        //         "makerFeeRate": "0.001",
        //         "buyLimitPriceRatio": "0.1",
        //         "sellLimitPriceRatio": "0.1",
        //         "marketBuyLimitSize": "99999",
        //         "marketSellLimitSize": "99999",
        //         "marketFallbackPriceRatio": "0",
        //         "enableTrade": true,
        //         "enableDisplay": true,
        //         "displayDigitMerge": "0.01,0.1,0.5,1,5",
        //         "displayNew": false,
        //         "displayHot": false
        //     }
        //
        // contract
        //     {
        //         "symbol": "ETHUSDT",
        //         "baseAsset": "ETH",
        //         "quoteAsset": "USDT",
        //         "marginAsset": "USDT",
        //         "pricePrecision": "2",
        //         "quantityPrecision": "3",
        //         "baseAssetPrecision": "2",
        //         "quotePrecision": "8",
        //         "contractVal": "0.001",
        //         "delivery": [
        //             "00:00:00",
        //             "08:00:00",
        //             "16:00:00"
        //         ],
        //         "forwardContractFlag": true,
        //         "minLeverage": "1",
        //         "maxLeverage": "400",
        //         "buyLimitPriceRatio": "0.01",
        //         "sellLimitPriceRatio": "0.01",
        //         "makerFeeRate": "0.0002",
        //         "takerFeeRate": "0.0008",
        //         "minOrderSize": "0.001",
        //         "maxOrderSize": "1000000",
        //         "maxPositionSize": "5000000",
        //         "marketOpenLimitSize": "2300"
        //     }
        //
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'baseAsset');
        const quoteId = this.safeString (market, 'quoteAsset');
        const settleId = this.safeString (market, 'marginAsset');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        let active = true;
        let symbol = base + '/' + quote;
        let isSpot = true;
        let isLinear = undefined;
        let isInverse = undefined;
        if (settle !== undefined) {
            symbol += ':' + settle;
            isSpot = false;
            if (settle === quote) {
                isLinear = true;
                isInverse = false;
            } else if (settle === base) {
                isLinear = false;
                isInverse = true;
            }
        } else {
            active = this.safeBool (market, 'enableTrade');
        }
        let amountPrecision = this.safeNumber (market, 'stepSize');
        let pricePrecision = this.safeNumber (market, 'tickSize');
        if (amountPrecision === undefined) {
            const amountPrecisionString = this.parsePrecision (this.safeString (market, 'quantityPrecision'));
            const pricePrecisionString = this.parsePrecision (this.safeString (market, 'pricePrecision'));
            amountPrecision = this.parseNumber (amountPrecisionString);
            pricePrecision = this.parseNumber (pricePrecisionString);
        }
        const fees = this.safeDict (this.fees, isSpot ? 'spot' : 'contract', {});
        return this.safeMarketStructure ({
            'id': id,
            'lowercaseId': id.toLowerCase (),
            'numericId': this.safeInteger (market, 'contractId'),
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': isSpot ? 'spot' : 'swap',
            'spot': isSpot,
            'margin': false,
            'swap': !isSpot,
            'future': false,
            'option': false,
            'active': active,
            'contract': !isSpot,
            'linear': isLinear,
            'inverse': isInverse,
            'taker': this.safeNumber (market, 'takerFeeRate'),
            'maker': this.safeNumber (market, 'makerFeeRate'),
            'feeSide': fees['feeSide'],
            'contractSize': this.safeNumber (market, 'contractVal'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': amountPrecision,
                'price': pricePrecision,
            },
            'limits': {
                'leverage': {
                    'min': this.safeNumber (market, 'minLeverage'),
                    'max': this.safeNumber (market, 'maxLeverage'),
                },
                'amount': {
                    'min': this.safeNumber2 (market, 'minTradeAmount', 'minOrderSize'),
                    'max': this.safeNumber2 (market, 'maxTradeAmount', 'maxOrderSize'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'percentage': fees['percentage'],
            'tierBased': fees['tierBased'],
            'tiers': fees['tiers'],
            'info': market,
        });
    }

    /**
     * @method
     * @name weex#fetchTickers
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetAllTickerInfo // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetTicker24h // contract
     * @param {string} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', default is 'spot' (used if symbols are not provided)
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true);
        const market = this.getMarketFromSymbols (symbols);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        let symbolsLength = 0;
        if (symbols !== undefined) {
            symbolsLength = symbols.length;
        }
        const request: Dict = {};
        if (symbolsLength === 1) {
            request['symbol'] = market['id'];
        }
        let response = undefined;
        if (marketType === 'spot') {
            //
            //     [
            //         {
            //             "symbol": "ETHUSDT",
            //             "priceChange": "-72.98",
            //             "priceChangePercent": "-0.033811",
            //             "lastPrice": "2085.46",
            //             "bidPrice": "2085.44",
            //             "bidQty": "1.53848",
            //             "askPrice": "2085.47",
            //             "askQty": "1.87504",
            //             "openPrice": "2158.44",
            //             "highPrice": "2168.40",
            //             "lowPrice": "2061.12",
            //             "volume": "157359.56105",
            //             "quoteVolume": "331284305.7193626",
            //             "openTime": 1775493000000,
            //             "closeTime": 1775579400000,
            //             "count": 59727
            //         }
            //     ]
            //
            response = await this.publicGetApiV3MarketTicker24hr (this.extend (request, params));
        } else {
            //
            //     [
            //         {
            //             "symbol": "ETHUSDT",
            //             "priceChange": "-75.49",
            //             "priceChangePercent": "-0.034992",
            //             "lastPrice": "2081.80",
            //             "openPrice": "2157.29",
            //             "highPrice": "2167.51",
            //             "lowPrice": "2059.17",
            //             "volume": "623160.426",
            //             "quoteVolume": "1310647345.19346",
            //             "openTime": 1775493000000,
            //             "closeTime": 1775579400000,
            //             "markPrice": "2081.8",
            //             "indexPrice": "2082.75"
            //         }
            //     ]
            //
            response = await this.contractGetCapiV3MarketTicker24hr (this.extend (request, params));
        }
        if (!Array.isArray (response)) {
            response = [ response ];
        }
        return this.parseTickers (response, symbols);
    }

    /**
     * @method
     * @name weex#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetBookTicker // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetBookTicker // contract
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', default is 'spot' (used if symbols are not provided)
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchBidsAsks (symbols: Strings = undefined, params = {}) {
        symbols = this.marketSymbols (symbols, undefined, true, true);
        const market = this.getMarketFromSymbols (symbols);
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.publicGetApiV3MarketTickerBookTicker (params);
        } else {
            response = await this.contractGetCapiV3MarketTickerBookTicker (params);
        }
        if (!Array.isArray (response)) {
            response = [ response ];
        }
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // spot
        //     {
        //         "symbol": "ETHUSDT",
        //         "priceChange": "-72.98",
        //         "priceChangePercent": "-0.033811",
        //         "lastPrice": "2085.46",
        //         "bidPrice": "2085.44",
        //         "bidQty": "1.53848",
        //         "askPrice": "2085.47",
        //         "askQty": "1.87504",
        //         "openPrice": "2158.44",
        //         "highPrice": "2168.40",
        //         "lowPrice": "2061.12",
        //         "volume": "157359.56105",
        //         "quoteVolume": "331284305.7193626",
        //         "openTime": 1775493000000,
        //         "closeTime": 1775579400000,
        //         "count": 59727
        //     }
        //
        // swap
        //     {
        //         "symbol": "ETHUSDT",
        //         "priceChange": "-75.49",
        //         "priceChangePercent": "-0.034992",
        //         "lastPrice": "2081.80",
        //         "openPrice": "2157.29",
        //         "highPrice": "2167.51",
        //         "lowPrice": "2059.17",
        //         "volume": "623160.426",
        //         "quoteVolume": "1310647345.19346",
        //         "openTime": 1775493000000,
        //         "closeTime": 1775579400000,
        //         "markPrice": "2081.8",
        //         "indexPrice": "2082.75"
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const markPrice = this.safeString (ticker, 'markPrice');
        let marketType = 'spot';
        if (markPrice !== undefined) {
            marketType = 'swap';
        }
        market = this.safeMarket (marketId, market, undefined, marketType);
        const timestamp = this.safeInteger2 (ticker, 'closeTime', 'time');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'highPrice'),
            'low': this.safeString (ticker, 'lowPrice'),
            'bid': this.safeString (ticker, 'bidPrice'),
            'bidVolume': this.safeString (ticker, 'bidQty'),
            'ask': this.safeString (ticker, 'askPrice'),
            'askVolume': this.safeString (ticker, 'askQty'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'openPrice'),
            'close': this.safeString (ticker, 'lastPrice'),
            'last': this.safeString (ticker, 'lastPrice'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': this.safeString (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'markPrice': markPrice,
            'indexPrice': this.safeString (ticker, 'indexPrice'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name weex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetDepthData // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetDepthData // contract
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 15, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if ((limit !== undefined) && (limit > 15)) {
            request['limit'] = 200; // default is 15, max is 200
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetApiV3MarketDepth (this.extend (request, params));
        } else {
            response = await this.contractGetCapiV3MarketDepth (this.extend (request, params));
        }
        //
        //     {
        //         "asks": [
        //             [
        //                 "2096.77",
        //                 "45.592"
        //             ]
        //         ],
        //         "bids": [
        //             [
        //                 "2096.76",
        //                 "49.162"
        //             ]
        //         ],
        //         "lastUpdateId": 14138610208
        //     }
        //
        const orderbook = this.parseOrderBook (response, symbol);
        orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        return orderbook;
    }

    /**
     * @method
     * @name weex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetKLineData // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetKlines // contract last price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetIndexPriceKlines // contract index price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetMarkPriceKlines // contract mark price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetHistoryKlines // contract historical klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default 100, max 300)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * Check fetchSpotOHLCV() and fetchContractOHLCV() for more details on the extra parameters that can be used in params
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            return await this.fetchSpotOHLCV (symbol, timeframe, since, limit, params);
        } else {
            return await this.fetchContractOHLCV (symbol, timeframe, since, limit, params);
        }
    }

    /**
     * @method
     * @ignore
     * @name weex#fetchSpotOHLCV
     * @description helper method for fetchOHLCV
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetKLineData
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchSpotOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        const response = await this.publicGetApiV3MarketKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    /**
     * @method
     * @ignore
     * @name weex#fetchContractOHLCV
     * @description helper method for fetchOHLCV
     * @see https://www.weex.com/api-doc/contract/Market_API/GetKlines // contract last price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetIndexPriceKlines // contract index price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetMarkPriceKlines // contract mark price
     * @see https://www.weex.com/api-doc/contract/Market_API/GetHistoryKlines // contract historical klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default 100, max 100 for historical klines, max 1000 for other contract klines)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {bool} [params.paginate] whether to automatically paginate requests until the required number of candles is returned
     * @param {bool} [params.historical] whether to fetch historical klines (default is false). If false, will fetch last price klines
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchContractOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const maxHistoricalLimit = 100;
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            params = this.extend (params, { 'historical': true });
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, maxHistoricalLimit) as OHLCV[];
        }
        const until = this.safeInteger (params, 'until');
        let historical = false;
        [ historical, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'historical');
        const timeframeOption = this.safeDict (this.options, 'timeframes', {});
        const contractTimeframes = this.safeDict (timeframeOption, 'contract', {});
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'interval': this.safeString (contractTimeframes, timeframe, timeframe),
        };
        const priceType = this.safeStringUpper (params, 'price');
        params = this.omit (params, [ 'historical', 'until', 'price' ]);
        let response = undefined;
        if (historical) {
            if (priceType !== undefined) {
                request['priceType'] = priceType;
            }
            let startTime = since;
            let endTime = until;
            if ((since === undefined) || (until === undefined)) {
                const now = this.milliseconds ();
                const duration = this.parseTimeframe (timeframe) * 1000;
                const numberOfCandles = limit ? limit : maxHistoricalLimit;
                const timeDelta = numberOfCandles * duration;
                if ((since === undefined) && (until === undefined)) {
                    endTime = now;
                    startTime = now - timeDelta;
                } else if (since === undefined) {
                    startTime = until - timeDelta;
                } else {
                    endTime = since + timeDelta;
                }
            }
            request['startTime'] = startTime;
            request['endTime'] = endTime;
            response = await this.contractGetCapiV3MarketHistoryKlines (this.extend (request, params));
        } else {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            if (priceType === 'MARK') {
                response = await this.contractGetCapiV3MarketMarkPriceKlines (this.extend (request, params));
            } else if (priceType === 'INDEX') {
                response = await this.contractGetCapiV3MarketIndexPriceKlines (this.extend (request, params));
            } else {
                response = await this.contractGetCapiV3MarketKlines (this.extend (request, params));
            }
        }
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    /**
     * @method
     * @name weex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.weex.com/api-doc/spot/MarketDataAPI/GetTradeData // spot
     * @see https://www.weex.com/api-doc/contract/Market_API/GetRecentTrades // contract
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (default 100, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetApiV3MarketTrades (this.extend (request, params));
        } else {
            response = await this.contractGetCapiV3MarketTrades (this.extend (request, params));
        }
        //
        //     [
        //         {
        //             "id": "875fba11-f8a1-42ad-915d-012ccb375e8a",
        //             "price": "2114.77",
        //             "qty": "0.01000",
        //             "quoteQty": "21.1477000",
        //             "time": 1775594995485,
        //             "isBuyerMaker": false,
        //             "isBestMatch": true
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //     {
        //         "id": "875fba11-f8a1-42ad-915d-012ccb375e8a",
        //         "price": "2114.77",
        //         "qty": "0.01000",
        //         "quoteQty": "21.1477000",
        //         "time": 1775594995485,
        //         "isBuyerMaker": false,
        //         "isBestMatch": true
        //     }
        //
        const timestamp = this.safeInteger (trade, 'time');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'takerOrMaker': undefined,
            'side': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'qty'),
            'cost': this.safeString (trade, 'quoteQty'),
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name weex#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://www.weex.com/api-doc/contract/Market_API/GetOpenInterest
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    async fetchOpenInterest (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.contractGetCapiV3MarketOpenInterest (this.extend (request, params));
        return this.parseOpenInterest (response, market);
    }

    parseOpenInterest (interest, market: Market = undefined) {
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "openInterest": "1772356.352",
        //         "time": 1775595582598
        //     }
        //
        const marketId = this.safeString (interest, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const timestamp = this.safeInteger (interest, 'time');
        return this.safeOpenInterest ({
            'symbol': symbol,
            'openInterestAmount': this.safeString (interest, 'openInterest'),
            'openInterestValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        }, market);
    }

    /**
     * @method
     * @name weex#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://www.weex.com/api-doc/contract/Market_API/GetCurrentFundingRate
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        let symbolsLength = 0;
        if (symbols !== undefined) {
            symbolsLength = symbols.length;
        }
        const request: Dict = {};
        if (symbolsLength === 1) {
            const market = this.getMarketFromSymbols (symbols);
            request['symbol'] = market['id'];
        }
        const response = await this.contractGetCapiV3MarketPremiumIndex (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "ETHUSDT",
        //             "markPrice": "2133.71",
        //             "indexPrice": "2134.44",
        //             "forecastFundingRate": "0.00005618",
        //             "lastFundingRate": "0.00001031",
        //             "interestRate": "0.001",
        //             "nextFundingTime": 1775606400000,
        //             "time": 1775597594265,
        //             "collectCycle": 480
        //         }
        //     ]
        //
        return this.parseFundingRates (response, symbols);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const timestamp = this.safeInteger (contract, 'time');
        const nextFundingTimestamp = this.safeInteger (contract, 'nextFundingTime');
        let interval = undefined;
        const collectCycle = this.safeString (contract, 'collectCycle');
        if (collectCycle !== undefined) {
            interval = Precise.stringDiv (collectCycle, '60');
            interval = interval + 'h';
        }
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': this.safeNumber (contract, 'markPrice'),
            'indexPrice': this.safeNumber (contract, 'indexPrice'),
            'interestRate': this.safeNumber (contract, 'interestRate'),
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'lastFundingRate'),
            'fundingTimestamp': timestamp,
            'fundingDatetime': this.iso8601 (timestamp),
            'nextFundingRate': this.safeNumber (contract, 'forecastFundingRate'),
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601 (nextFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': interval,
        } as FundingRate;
    }

    /**
     * @method
     * @name weex#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://www.weex.com/api-doc/contract/Market_API/GetFundingRateHistory
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate records to fetch (default 100, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request: Dict = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        const response = await this.contractGetCapiV3MarketFundingRate (this.extend (request, params));
        return this.parseFundingRateHistories (response, market, since, limit) as FundingRateHistory[];
    }

    parseFundingRateHistory (contract, market: Market = undefined) {
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "fundingRate": "0.00001031",
        //         "fundingTime": 1775577600000,
        //         "markPrice": "2079.26"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const timestamp = this.safeInteger (contract, 'fundingTime');
        return {
            'info': contract,
            'symbol': symbol,
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    /**
     * @method
     * @name weex#fetchBalance
     * @see https://www.weex.com/api-doc/spot/AccountAPI/GetAccountBalance // spot
     * @see https://www.weex.com/api-doc/contract/Account_API/GetAccountBalance // contract
     * @description query for balance and get the amount of funds available for trading or funds locked in positions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' (default is 'spot')
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        let response = undefined;
        if (type === 'spot') {
            //
            //     {
            //         "makerCommission": 0,
            //         "takerCommission": 0,
            //         "commissionRates": {
            //             "maker": "0.00000000",
            //             "taker": "0.00000000"
            //         },
            //         "canTrade": true,
            //         "canWithdraw": true,
            //         "canDeposit": true,
            //         "updateTime": 1775601317093,
            //         "accountType": "SPOT",
            //         "balances": [
            //             {
            //                 "asset": "USDT",
            //                 "free": "20.00000000",
            //                 "locked": "0"
            //             }
            //         ],
            //         "permissions": [
            //             "SPOT"
            //         ],
            //         "uid": 8886281669
            //     }
            //
            response = await this.privateGetApiV3Account (params);
        } else {
            //
            //     [
            //         {
            //             "asset": "USDT",
            //             "balance": "20.00000000",
            //             "availableBalance": "20.00000000",
            //             "frozen": "0",
            //             "unrealizePnl": "0"
            //         }
            //     ]
            //
            response = await this.contractPrivateGetCapiV3AccountBalance (params);
        }
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
        };
        const balances = this.safeList (response, 'balances', response);
        for (let i = 0; i < balances.length; i++) {
            const entry = this.safeDict (balances, i);
            const id = this.safeString (entry, 'asset');
            const code = this.safeCurrencyCode (id);
            const account = this.account ();
            account['free'] = this.safeString2 (entry, 'availableBalance', 'free');
            account['used'] = this.safeString2 (entry, 'frozen', 'locked');
            account['total'] = this.safeString (entry, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name weex#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://www.weex.com/api-doc/spot/AccountAPI/TransferRecords
     * @param {string} [code] unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve (default 10, max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] whether to paginate the results (default false)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        await this.loadMarkets ();
        let request: Dict = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const maxLimit = 100;
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTransfers', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchTransfers', code, since, limit, params, maxLimit);
        }
        if (since !== undefined) {
            request['after'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('before', request, params);
        const response = await this.privateGetApiV3AccountTransferRecords (this.extend (request, params));
        //
        //     [
        //         {
        //             "coinName": "USDT",
        //             "status": "Successful",
        //             "toType": "",
        //             "toSymbol": "",
        //             "fromType": "",
        //             "fromSymbol": "",
        //             "amount": "20.00000000",
        //             "tradeTime": "1775605824252"
        //         }
        //     ]
        //
        return this.parseTransfers (response, currency, since, limit);
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        const timestamp = this.safeInteger (transfer, 'tradeTime');
        const currencyId = this.safeString (transfer, 'coinName');
        const currencyCode = this.safeCurrencyCode (currencyId, currency);
        const status = this.safeString (transfer, 'status');
        return {
            'info': transfer,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': currencyCode,
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': this.safeStringLower (transfer, 'fromType'),
            'toAccount': this.safeStringLower (transfer, 'toType'),
            'status': this.parseTransferStatus (status),
        };
    }

    parseTransferStatus (status: Str): string {
        const statuses: Dict = {
            'Successful': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                endpoint += '?' + this.urlencode (query);
            }
        }
        if ((api === 'private') || (api === 'contractPrivate')) {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ().toString ();
            let payload = timestamp + method + '/' + endpoint;
            if (method === 'POST') {
                body = this.json (query);
                payload += body;
            }
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'base64');
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-PASSPHRASE': this.password,
                'ACCESS-TIMESTAMP': timestamp,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
            }
        }
        const url = this.urls['api'][api] + '/' + endpoint;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
