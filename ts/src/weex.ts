
//  ---------------------------------------------------------------------------

import Exchange from './abstract/weex.js';
// import { ArgumentsRequired, BadRequest, InvalidOrder, NotSupported } from './base/errors.js';
// import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Currencies, Dict, Int, Market } from './base/types.js';

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
                'fetchBalance': false,
                'fetchBidsAsks': false,
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
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
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
                'fetchMarkOHLCV': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
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
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
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
                        'api/v3/coins': 25,
                        'api/v3/exchangeInfo': 100, // done
                        'api/v3/ping': 5, // done
                        'api/v3/apiTradingSymbols': 25, // not unified
                        'api/v3/market/ticker/price': 20,
                        'api/v3/market/ticker/24hr': 10,
                        'api/v3/market/trades': 125,
                        'api/v3/market/klines': 10,
                        'api/v3/market/depth': 25,
                        'api/v3/market/ticker/bookTicker': 20,
                    },
                },
                'private': {
                    'get': {
                        'api/v3/account': 5,
                        'api/v3/account/bills': 5,
                        'api/v3/account/fundingBills': 5,
                        'api/v3/account/transferRecords': 3,
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
                        'capi/v3/market/depth': 5,
                        'capi/v3/market/ticker/24hr': 200,
                        'capi/v3/market/ticker/bookTicker': 5,
                        'capi/v3/market/trades': 25,
                        'capi/v3/market/klines': 5,
                        'capi/v3/market/indexPriceKlines': 5,
                        'capi/v3/market/markPriceKlines': 5,
                        'capi/v3/market/historyKlines': 25,
                        'capi/v3/market/symbolPrice': 5,
                        'capi/v3/market/openInterest': 10,
                        'capi/v3/market/premiumIndex': 5,
                        'capi/v3/market/fundingRate': 25,
                        'capi/v3/market/apiTradingSymbols': 25,
                    },
                },
                'contractPrivate': {
                    'get': {
                        'capi/v3/account/balance': 10,
                        'capi/v3/account/commissionRate': 10,
                        'capi/v3/account/accountConfig': 10,
                        'capi/v3/account/symbolConfig': 10,
                        'capi/v3/account/income': 5,
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
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1day',
                '1w': '1week',
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
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
                        'limit': 1000,
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
                        'limit': 1000,
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
        if (settle !== undefined) {
            symbol += ':' + settle;
            isSpot = false;
            if (settle === quote) {
                isLinear = true;
            } else if (settle === base) {
                isLinear = false;
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
            'inverse': isLinear === undefined ? undefined : !isLinear,
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                endpoint += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ().toString ();
            let signaturePath = endpoint.replace ('spot/open', '');
            signaturePath = signaturePath.replace ('futures/open', '');
            let payload = timestamp + method + signaturePath;
            if (method === 'POST') {
                body = this.json (query);
                payload += body;
            }
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256);
            headers = {
                'X-CH-APIKEY': this.apiKey,
                'X-CH-SIGN': signature,
                'X-CH-TS': timestamp,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
            }
        }
        const url = this.urls['api'][api] + '/' + endpoint;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
