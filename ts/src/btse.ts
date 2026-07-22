
//  ---------------------------------------------------------------------------

import Exchange from './abstract/btse.js';
import { ArgumentsRequired, BadRequest, InvalidOrder } from '../ccxt.js';
import { sha384 } from './static_dependencies/noble-hashes/sha512.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Dict, FundingRate, FundingRateHistory, FundingRates, int, Int, Leverage, LeverageTier, LeverageTiers, MarginMode, Market, Num, OHLCV, OpenInterests, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TradingFees, TradingFeeInterface } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class btse
 * @augments Exchange
 */
export default class btse extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'btse',
            'name': 'BTSE',
            'countries': [ 'VG' ], // Virgin Islands (British)
            'rateLimit': 1000 / 75, // 75 requests per second
            'version': 'v3', // spot v3.3 and v3.2, swap v.2.3
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'cancelOrdersWithClientOrderId': false,
                'cancelOrderWithClientOrderId': true,
                'closeAllPositions': false,
                'closePosition': true,
                'createDepositAddress': false,
                'createLimitBuyOrder': true,
                'createLimitOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrder': true,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': true, // contract markets only
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': true,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': true,
                'deposit': false,
                'editOrder': true,
                'editOrders': false,
                'editOrderWithClientOrderId': true,
                'fetchAccounts': false,
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
                'fetchCurrencies': false,
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
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
                'fetchL2OrderBook': false,
                'fetchL3OrderBook': false,
                'fetchLastPrices': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverage': true,
                'fetchLeverages': false,
                'fetchLeverageTiers': true,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': true,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': true,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrdersByStatus': false,
                'fetchOrderTrades': true,
                'fetchOrderWithClientOrderId': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': true,
                'fetchPositions': true,
                'fetchPositionsForSymbol': true,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
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
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': true,
                'setPositionMode': true,
                'signIn': false,
                'transfer': false,
                'watchMyLiquidationsForSymbols': false,
                'withdraw': false,
                'ws': false,
            },
            'urls': {
                'logo': '', // todo add logo
                'api': {
                    'public': 'https://api.btse.com',
                    'private': 'https://api.btse.com',
                },
                'test': {
                    'public': 'https://testapi.btse.io',
                    'private': 'https://testapi.btse.io',
                },
                'www': 'https://www.btse.com',
                'doc': 'https://support.btse.com/en/support/solutions/articles/43000044751-btse-api',
                'referral': '', // todo check
                'fees': 'https://support.btse.com/en/support/solutions/articles/43000064283',
            },
            'api': {
                'public': {
                    'get': {
                        'spot/api/v3.3/market_summary': 5, // done
                        'spot/api/v3.3/ohlcv': 5, // done
                        'spot/api/v3.3/price': 5, // not used
                        'spot/api/v3.3/orderbook': 5, // not used
                        'spot/api/v3.3/orderbook/L2': 5, // done
                        'spot/api/v3.3/trades': 5, // done
                        'spot/api/v3.3/time': 5, // done
                        'futures/api/v2.3/market_summary': 5, // done
                        'futures/api/v2.3/ohlcv': 5, // done
                        'futures/api/v2.3/price': 5, // not used
                        'futures/api/v2.3/orderbook': 5, // not used
                        'futures/api/v2.3/orderbook/L2': 5, // done
                        'futures/api/v2.3/trades': 5, // done
                        'futures/api/v2.3/funding_history': 5, // done
                        'futures/api/v2.3/market/risk_limit': 5, // done
                        'spot/api/v3.2/availableCurrencyNetworks': 15, // not used
                        'spot/api/v3.2/exchangeRate': 15, // not used
                        'public-api/wallet/v1/crypto/networks ': 15, // not used
                        'public-api/wallet/v1/assets/exchangeRate': 15, // not used
                    },
                },
                'private': {
                    'get': {
                        'spot/api/v3.3/order': 1, // done
                        'spot/api/v3.3/user/open_orders': 5, // done
                        'spot/api/v3.3/user/trade_history': 5, // done
                        'spot/api/v3.3/user/fees': 5, // done
                        'spot/api/v3.3/invest/products': 5,
                        'spot/api/v3.3/invest/orders': 5,
                        'spot/api/v3.3/invest/history': 5,
                        'futures/api/v2.3/order': 1, // done
                        'futures/api/v2.3/user/open_orders': 1, // done
                        'futures/api/v2.3/user/trade_history': 5, // done
                        'futures/api/v2.3/user/positions': 5, // done
                        'futures/api/v2.3/risk_limit': 5, // not used
                        'futures/api/v2.3/leverage': 5, // done
                        'futures/api/v2.3/user/fees': 5, // done
                        'futures/api/v2.3/position_mode': 5, // done
                        'futures/api/v2.3/user/margin_setting': 5, // not used
                        'futures/api/v2.3/user/wallet': 5,
                        'futures/api/v2.3/user/wallet_history': 5,
                        'futures/api/v2.3/user/unifiedWallet/margin': 5,
                        'futures/api/v2.3/user/margin': 5,
                        'otc/api/v1/getMarket': 1,
                        'spot/api/v3.2/user/wallet': 15,
                        'spot/api/v3.2/user/wallet_history': 15,
                        'spot/api/v3.3/user/wallet/address': 15,
                        'spot/api/v3.2/availableCurrencies': 15,
                        'spot/api/v3.2/subaccount/wallet/history': 15,
                    },
                    'post': {
                        'spot/api/v3.3/order': 1, // done
                        'spot/api/v3.3/order/peg': 1, // same as above
                        'spot/api/v3.3/order/cancelAllAfter': 1, // done
                        'spot/api/v3.3/invest/deposit': 5,
                        'spot/api/v3.3/invest/renew': 5,
                        'spot/api/v3.3/invest/redeem': 5,
                        'futures/api/v2.3/order': 1, // done
                        'futures/api/v2.3/order/peg': 1, // done
                        'futures/api/v2.3/order/cancelAllAfter': 1, // done
                        'futures/api/v2.3/order/close_position': 1, // done
                        'futures/api/v2.3/risk_limit': 5, // not used
                        'futures/api/v2.3/leverage': 5, // done
                        'futures/api/v2.3/settle_in': 5,
                        'futures/api/v2.3/order/bind/tpsl': 1,
                        'futures/api/v2.3/position_mode': 5, // done
                        'futures/api/v2.3/user/wallet/transfer': 5,
                        'futures/api/v2.3/subaccount/wallet/transfer': 5,
                        'otc/api/v1/quote': 1,
                        'otc/api/v1/accept/{quoteId}': 1,
                        'otc/api/v1/reject/{quoteId}': 1,
                        'otc/api/v1/queryOrder/{quoteId}': 1,
                        'spot/api/v3.3/user/wallet/address': 15,
                        'spot/api/v3.3/user/wallet/withdraw': 15,
                        'spot/api/v3.2/user/wallet/convert': 15,
                        'spot/api/v3.3/user/wallet/transfer': 15,
                    },
                    'put': {
                        'spot/api/v3.3/order': 1, // done
                        'futures/api/v2.3/order': 1, // done
                    },
                    'delete': {
                        'spot/api/v3.3/order': 1, // done
                        'futures/api/v2.3/order': 1, // done
                        'spot/api/v3.3/user/wallet/address': 15,
                    },
                },
            },
            'features': {
                'contract': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'mark': true,
                            'last': true,
                            'index': false,
                        },
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': {
                                'last': true,
                                'mark': true,
                                'index': false,
                            },
                            'price': false,
                        },
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': true,
                        'selfTradePrevention': false,
                        'trailing': true,
                        'iceberg': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'daysBack': undefined,
                        'limit': undefined,
                        'untilDays': 7,
                        'symbolRequired': false,
                    },
                    'fetchOrder': undefined,
                    'fetchOpenOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchCanceledAndClosedOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 300,
                    },
                },
                'spot': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'mark': false,
                            'last': true,
                            'index': true,
                        },
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': undefined, // not supported
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false, // see timeInForce in options
                        },
                        'hedged': false,
                        'selfTradePrevention': false,
                        'trailing': true,
                        'iceberg': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'daysBack': undefined,
                        'limit': undefined,
                        'untilDays': 7,
                        'symbolRequired': false,
                    },
                    'fetchOrder': undefined,
                    'fetchOpenOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchCanceledAndClosedOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 300,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'contract',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': {
                        'extends': 'contract',
                    },
                    'inverse': undefined,
                },
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '6h': '360',
                '1d': '1440',
                '1w': '10080',
                '1M': '43200',
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0002'),
                },
                'spot': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0002'),
                },
                'contract': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.00055'),
                },
            },
            'exceptions': {
                'exact': {
                    // 200 {"symbol":"ETH-PERP","timestamp":1770892916507,"status":135,"type":93,"message":"{\"msgKey\":\"trade.error.invalid.position_id\",\"params\":[\"ETH-PERP-USDT\"] ,\"default_msg\":\"User is in ISOLATE_HEDGE in market: ETH-PERP-USDT, but positionId is empty in the request.\"}"}
                    // bad request {"status":429,"errorCode":-1,"message":"Order not found","extraData":["ETHPFC-USD","0","117"]}
                    // {"status":400,"errorCode":-2,"message":"symbol parameter is mandatory","extraData":null}
                    // {"status":400,"errorCode":134,"message":"failure","extraData":"Remaining positions."}
                    // {"status":400,"errorCode":-2,"message":"symbol parameter is mandatory","extraData":null}
                    // {"status":400,"errorCode":33001003,"message":"You can not SELL ETH lower than 1825.24 USDT","extraData":["SELL","ETH","lower","1825.24","USDT"]}
                    // {"code":400,"msg":"BADREQUEST: startTime can not before than 1569888000000 (2019-10-01T00:00)","time":1770828108074,"data":null,"success":false}
                    // when position mode is wrong {"status":429,"errorCode":-1,"message":"Order not found","extraData":["117","0"]}
                    // {"status":400,"errorCode":-2,"message":"Invalid request parameters","extraData":null}
                    // {"code":33001001,"msg":"BADREQUEST: The distance between Trigger Price and Limit Price cannot exceed 5.0 %","time":1770815167145,"data":["5.0 %"],"success":false}
                    // {"code":51523,"msg":"BADREQUEST: Insufficient wallet balance","time":1770814875493,"data":null,"success":false}
                    // {"code":10002,"msg":"UNAUTHORIZED: Authentication Failed","time":1770477230034,"data":null,"success":false}
                    // {"status":400,"errorCode":-7,"message":"Authenticate failed","extraData":null}
                    // 400 Bad Request {"code":-11,"msg":"System error","success":false,"time":1770451790797,"data":[]}
                    // {"code":400,"msg":"BADREQUEST: resolution too small for the requested time range. Records returned exceeds 300","success":false,"time":1770452248292,"data":[]}
                    // {"status":400,"errorCode":-2,"message":"Can't support count more than 500","extraData":null}
                },
                'broad': {
                },
            },
            'commonCurrencies': {
            },
            'options': {
                'timeDifference': 0, // the difference between system clock and the exchange server clock in milliseconds
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'networks': {
                },
                'timeInForce': {
                    'GTC': 'GTC',
                    'IOC': 'IOC',
                    'FOK': 'FOK',
                    'HALFMIN': 'HALFMIN',
                    'FIVEMIN': 'FIVEMIN',
                    'HOUR': 'HOUR',
                    'TWELVEHOUR': 'TWELVEHOUR',
                    'DAY': 'DAY',
                    'WEEK': 'WEEK',
                    'MONTH': 'MONTH',
                },
                'accountsByType': {
                },
                'accountsById': {
                },
            },
        });
    }

    /**
     * @method
     * @name btse#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://btsecom.github.io/docs/spotV3_3/en/#query-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetSpotApiV33Time (params);
        //
        //     {
        //         "iso": "2026-02-06T11:48:37.976Z",
        //         "epoch": 1770378517
        //     }
        //
        return this.safeTimestamp (response, 'epoch');
    }

    /**
     * @method
     * @name btse#fetchMarkets
     * @description retrieves data on all markets for btse
     * @see https://btsecom.github.io/docs/spotV3_3/en/#market-summary
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#market-summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const spotPromise = this.publicGetSpotApiV33MarketSummary (params);
        const contractPromise = this.publicGetFuturesApiV23MarketSummary (params);
        const [ spotMarkets, contractMarkets ] = await Promise.all ([ spotPromise, contractPromise ]);
        const markets = this.arrayConcat (spotMarkets, contractMarkets);
        return this.parseMarkets (markets);
    }

    parseMarket (market: Dict): Market {
        //
        // spot
        //     {
        //         "symbol": "ZSWAP-USDT",
        //         "last": 0.0014137,
        //         "lowestAsk": 0.0014242,
        //         "highestBid": 0.0014051,
        //         "percentageChange": -1.26414303,
        //         "volume": 35492.87247512,
        //         "high24Hr": 0.0014591,
        //         "low24Hr": 0.0011803,
        //         "base": "ZSWAP",
        //         "quote": "USDT",
        //         "active": true,
        //         "size": 26176204.2,
        //         "minValidPrice": 0.0000001,
        //         "minPriceIncrement": 0.0000001,
        //         "minOrderSize": 0.1,
        //         "maxOrderSize": 20000000,
        //         "minSizeIncrement": 0.1,
        //         "openInterest": 0,
        //         "openInterestUSD": 0,
        //         "contractStart": 0,
        //         "contractEnd": 0,
        //         "timeBasedContract": false,
        //         "openTime": 0,
        //         "closeTime": 0,
        //         "startMatching": 0,
        //         "inactiveTime": 0,
        //         "fundingRate": 0,
        //         "contractSize": 0,
        //         "maxPosition": 0,
        //         "minRiskLimit": 0,
        //         "maxRiskLimit": 0,
        //         "availableSettlement": null,
        //         "futures": false,
        //         "isMarketOpenToOtc": false,
        //         "isMarketOpenToSpot": true
        //     }
        //
        // swap
        //     {
        //         "symbol": "BTC-PERP",
        //         "last": 66358.6,
        //         "lowestAsk": 66359.8,
        //         "highestBid": 66352.6,
        //         "openInterest": 31447681,
        //         "openInterestUSD": 20867816.81,
        //         "percentageChange": -4.5777,
        //         "volume": 4296340617.722564,
        //         "high24Hr": 70819.6,
        //         "low24Hr": 59838.9,
        //         "base": "BTC",
        //         "quote": "USDT",
        //         "contractStart": 0,
        //         "contractEnd": 0,
        //         "active": true,
        //         "timeBasedContract": false,
        //         "openTime": 0,
        //         "closeTime": 0,
        //         "startMatching": 0,
        //         "inactiveTime": 0,
        //         "fundingRate": -0.000058,
        //         "contractSize": 0.00001,
        //         "maxPosition": 1100000000,
        //         "minValidPrice": 0.1,
        //         "minPriceIncrement": 0.1,
        //         "minOrderSize": 1,
        //         "maxOrderSize": 7500000,
        //         "minRiskLimit": 3000000,
        //         "maxRiskLimit": 1100000000,
        //         "minSizeIncrement": 1,
        //         "availableSettlement": [
        //             "USD",
        //             "USDT"
        //         ]
        //     }
        //
        // future
        //     {
        //         "symbol": "BTC-260626",
        //         "last": "67433.8",
        //         "lowestAsk": "67485.5",
        //         "highestBid": "67435.8",
        //         "openInterest": "1571293",
        //         "openInterestUSD": "1059955.67",
        //         "percentageChange": "-4.5871",
        //         "volume": "5969.600405",
        //         "high24Hr": "71933.7",
        //         "low24Hr": "60731.8",
        //         "base": "BTC",
        //         "quote": "USDT",
        //         "contractStart": "0",
        //         "contractEnd": "1782460830",
        //         "active": true,
        //         "timeBasedContract": true,
        //         "openTime": "1766736000000",
        //         "closeTime": "1782460830000",
        //         "startMatching": "1766736015000",
        //         "inactiveTime": "1782460800000",
        //         "fundingRate": "0",
        //         "contractSize": "0.00001",
        //         "maxPosition": "40000000",
        //         "minValidPrice": "0.1",
        //         "minPriceIncrement": "0.1",
        //         "minOrderSize": "1",
        //         "maxOrderSize": "100000",
        //         "minRiskLimit": "30000",
        //         "maxRiskLimit": "40000000",
        //         "minSizeIncrement": "1",
        //         "availableSettlement": [
        //             "USD",
        //             "USDT"
        //         ]
        //     }
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'base');
        const quoteId = this.safeString (market, 'quote');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        const maxAmountString = this.safeString (market, 'maxOrderSize');
        const minAmountString = this.safeString (market, 'minOrderSize');
        const minPriceString = this.safeString (market, 'minValidPrice');
        const pricePrecision = this.safeString (market, 'minPriceIncrement');
        const amountPrecision = this.safeString (market, 'minSizeIncrement');
        const isSpot = !(this.safeBool (market, 'futures', true)); // only spot markets have the 'futures' field, and it's false
        let active = this.safeBool (market, 'active');
        let type = 'spot';
        let isSwap = false;
        let isFuture = false;
        let expiry = undefined;
        let contractSize = undefined;
        if (isSpot) {
            active = this.safeValue (market, 'isMarketOpenToSpot');
        }
        if (!isSpot) {
            symbol += ':' + quote; // todo check
            contractSize = this.safeString (market, 'contractSize');
            isFuture = this.safeBool (market, 'timeBasedContract', false);
            if (isFuture) {
                expiry = this.safeInteger (market, 'closeTime');
                symbol += '-' + this.yymmdd (expiry);
                type = 'future';
            } else {
                type = 'swap';
                isSwap = true;
            }
        }
        let fees = this.fees['contract'];
        if (isSpot) {
            fees = this.fees['spot'];
        }
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': isSpot ? undefined : quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': isSpot ? undefined : quoteId,
            'type': type,
            'spot': isSpot,
            'margin': isSpot ? false : undefined,
            'swap': isSwap,
            'future': isFuture,
            'option': false,
            'active': active,
            'contract': isSwap || isFuture,
            'linear': isSpot ? undefined : true,
            'inverse': isSpot ? undefined : false,
            'taker': fees['taker'],
            'maker': fees['maker'],
            'contractSize': this.parseNumber (contractSize),
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (amountPrecision),
                'price': this.parseNumber (pricePrecision),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.parseNumber (minAmountString),
                    'max': this.parseNumber (maxAmountString),
                },
                'price': {
                    'min': this.parseNumber (minPriceString),
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': this.parse8601 (this.safeString (market, 'createdAt')),
            'info': market,
        });
    }

    /**
     * @method
     * @name btse#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://btsecom.github.io/docs/spotV3_3/en/#charting-data
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#charting-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default and max 300)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const maxLimit = 300;
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, maxLimit);
        }
        const market = this.market (symbol);
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const request = {
            'symbol': market['id'],
            'resolution': interval,
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'until');
        if (until !== undefined) {
            if (since !== undefined) {
                // check if the requested time range is too large for one request
                // if so, just omit until for correct paginated calls for not to get an error from the exchange
                const duration = this.parseTimeframe (timeframe);
                const maxDelta = duration * maxLimit;
                const difference = until - since;
                if (difference < maxDelta) {
                    request['end'] = until;
                }
            } else {
                request['end'] = until;
            }
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetSpotApiV33Ohlcv (this.extend (request, params));
        } else {
            response = await this.publicGetFuturesApiV23Ohlcv (this.extend (request, params));
        }
        //
        //     [
        //         [
        //             1770454800,
        //             2018.43,
        //             2020.0,
        //             2018.43,
        //             2019.21,
        //             1291958.948051 // volume in quote currency
        //         ]
        //     ]
        //
        const result = this.parseOHLCVs (response, market, timeframe, since, limit);
        return result;
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     [
        //         1770454800,
        //         2018.43,
        //         2020.0,
        //         2018.43,
        //         2019.21,
        //         1291958.948051 // volume in quote currency
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    /**
     * @method
     * @name btse#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://btsecom.github.io/docs/spotV3_3/en/#orderbook-2
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#orderbook-2
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetSpotApiV33OrderbookL2 (this.extend (request, params));
        } else {
            response = await this.publicGetFuturesApiV23OrderbookL2 (this.extend (request, params));
        }
        //
        //     {
        //         "symbol": "ETH-USDT",
        //         "buyQuote": [
        //             {
        //                 "price": "2012.79",
        //                 "size": "3.8940"
        //             }
        //         ],
        //         "sellQuote": [
        //             {
        //                 "price": "2012.92",
        //                 "size": "0.0050"
        //             }
        //         ],
        //         "timestamp": 1770458310213,
        //         "depth": 1
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, market['symbol'], timestamp, 'buyQuote', 'sellQuote', 'price', 'size');
    }

    /**
     * @method
     * @name btse#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#funding-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of entries to fetch (default and max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingRateHistory[]> {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            if (!(market['contract'])) {
                throw new BadRequest (this.id + ' fetchFundingRateHistory() supports contract markets only');
            }
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'until');
        if (until !== undefined) {
            request['to'] = until;
        }
        if (since === undefined && until === undefined) {
            if (limit !== undefined) {
                request['count'] = limit; // mutually exclusive with since/until
            }
        }
        const response = await this.publicGetFuturesApiV23FundingHistory (this.extend (request, params));
        //
        //     {
        //         "ETH-PERP": [
        //             {
        //                 "time": 1770451200,
        //                 "rate": 0.00001528,
        //                 "symbol": "ETH-PERP"
        //             }
        //         ]
        //     }
        //
        let flattened = [];
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const entry = this.safeList (response, key, []);
            flattened = this.arrayConcat (flattened, entry);
        }
        return this.parseFundingRateHistories (flattened, market, since, limit);
    }

    parseFundingRateHistory (contract, market: Market = undefined) {
        //
        //     {
        //         "time": 1770451200,
        //         "rate": 0.00001528,
        //         "symbol": "ETH-PERP"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const timestamp = this.safeTimestamp (contract, 'time');
        return {
            'info': contract,
            'symbol': this.safeSymbol (marketId, market),
            'fundingRate': this.safeNumber (contract, 'rate'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    /**
     * @method
     * @name btse#fetchLeverageTiers
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#market-risk-limit-setting
     * @description retrieve information on the maximum leverage, for different trade sizes
     * @param {string[]|undefined} symbols a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
     */
    async fetchLeverageTiers (symbols: Strings = undefined, params = {}): Promise<LeverageTiers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request: Dict = {};
        if (symbols !== undefined) {
            const length = symbols.length;
            if (length === 1) {
                const requestedSymbol = this.safeString (symbols, 0);
                const market = this.market (requestedSymbol);
                request['symbol'] = market['id'];
            }
        }
        const response = await this.publicGetFuturesApiV23MarketRiskLimit (this.extend (request, params));
        //
        //     {
        //         "code": 1,
        //         "msg": "Success",
        //         "time": 1770462468706,
        //         "data": [
        //             {
        //                 "symbol": "RENDER-PERP",
        //                 "riskLevel": 1,
        //                 "riskLimitValue": 5000,
        //                 "initialMarginRate": 0.01333333,
        //                 "maintenanceMarginRate": 0.00666667,
        //                 "maxLeverage": 75
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'symbol');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            if (symbols === undefined || this.inArray (symbol, symbols)) {
                if (!(symbol in result)) {
                    result[symbol] = [];
                }
                const tiers = result[symbol];
                const parsed = {
                    'tier': this.safeInteger (entry, 'riskLevel'),
                    'symbol': symbol,
                    'currency': market['settle'],
                    'minNotional': undefined,
                    'maxNotional': this.safeNumber (entry, 'riskLimitValue'),
                    'maintenanceMarginRate': this.safeNumber (entry, 'maintenanceMarginRate'),
                    'maxLeverage': this.safeNumber (entry, 'maxLeverage'),
                    'info': entry,
                };
                tiers.push (parsed);
                result[symbol] = this.sortBy (tiers, 'tier');
            }
        }
        return result as LeverageTiers;
    }

    /**
     * @method
     * @name btse#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, for different trade sizes for a single market
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#market-risk-limit-setting
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
     */
    async fetchMarketLeverageTiers (symbol: string, params = {}): Promise<LeverageTier[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['contract']) {
            throw new BadRequest (this.id + ' fetchMarketLeverageTiers() supports contract markets only');
        }
        const result = await this.fetchLeverageTiers ([ symbol ], params);
        return result[symbol];
    }

    /**
     * @method
     * @name btse#fetchTickers
     * @see https://btsecom.github.io/docs/spotV3_3/en/#market-summary
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#market-summary
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] default is 'spot' (if not 'spot', contract markets will be queried)
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true);
        const market = this.getMarketFromSymbols (symbols);
        let type = 'spot';
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params, type);
        let response = undefined;
        if (type === 'spot') {
            response = await this.publicGetSpotApiV33MarketSummary (params);
        } else {
            response = await this.publicGetFuturesApiV23MarketSummary (params);
        }
        return this.parseTickers (response, symbols);
    }

    /**
     * @method
     * @name btse#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://btsecom.github.io/docs/spotV3_3/en/#market-summary
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#market-summary
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['spot']) {
            //
            //     [
            //         {
            //             "symbol": "ETH-USDT",
            //             "last": 2035.14,
            //             "lowestAsk": 2035.57,
            //             "highestBid": 2035.55,
            //             "percentageChange": 5.94169703,
            //             "volume": 89426694.95885499,
            //             "high24Hr": 2119.19,
            //             "low24Hr": 1915.22,
            //             "base": "ETH",
            //             "quote": "USDT",
            //             "active": true,
            //             "size": 43994.847,
            //             "minValidPrice": 0.01,
            //             "minPriceIncrement": 0.01,
            //             "minOrderSize": 0.0001,
            //             "maxOrderSize": 2000,
            //             "minSizeIncrement": 0.0001,
            //             "openInterest": 0,
            //             "openInterestUSD": 0,
            //             "contractStart": 0,
            //             "contractEnd": 0,
            //             "timeBasedContract": false,
            //             "openTime": 0,
            //             "closeTime": 0,
            //             "startMatching": 0,
            //             "inactiveTime": 0,
            //             "fundingRate": 0,
            //             "contractSize": 0,
            //             "maxPosition": 0,
            //             "minRiskLimit": 0,
            //             "maxRiskLimit": 0,
            //             "availableSettlement": null,
            //             "futures": false,
            //             "isMarketOpenToOtc": true,
            //             "isMarketOpenToSpot": true
            //         }
            //     ]
            response = await this.publicGetSpotApiV33MarketSummary (this.extend (request, params));
        } else {
            //
            //     [
            //         {
            //             "symbol": "BTC-PERP",
            //             "last": 66358.6,
            //             "lowestAsk": 66359.8,
            //             "highestBid": 66352.6,
            //             "openInterest": 31447681,
            //             "openInterestUSD": 20867816.81,
            //             "percentageChange": -4.5777,
            //             "volume": 4296340617.722564,
            //             "high24Hr": 70819.6,
            //             "low24Hr": 59838.9,
            //             "base": "BTC",
            //             "quote": "USDT",
            //             "contractStart": 0,
            //             "contractEnd": 0,
            //             "active": true,
            //             "timeBasedContract": false,
            //             "openTime": 0,
            //             "closeTime": 0,
            //             "startMatching": 0,
            //             "inactiveTime": 0,
            //             "fundingRate": -0.000058,
            //             "contractSize": 0.00001,
            //             "maxPosition": 1100000000,
            //             "minValidPrice": 0.1,
            //             "minPriceIncrement": 0.1,
            //             "minOrderSize": 1,
            //             "maxOrderSize": 7500000,
            //             "minRiskLimit": 3000000,
            //             "maxRiskLimit": 1100000000,
            //             "minSizeIncrement": 1,
            //             "availableSettlement": [
            //                 "USD",
            //                 "USDT"
            //             ]
            //         }
            //     ]
            response = await this.publicGetFuturesApiV23MarketSummary (this.extend (request, params));
        }
        const data = this.safeDict (response, 0, {});
        return this.parseTicker (data, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high24Hr'),
            'low': this.safeString (ticker, 'low24Hr'),
            'bid': this.safeString (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'percentageChange'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'size'),
            'quoteVolume': this.safeString (ticker, 'volume'),
            'markPrice': undefined,
            'indexPrice': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name btse#fetchOpenInterest
     * @description Retrieves the open interest of a derivative trading pair
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#market-summary
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/?id=interest-history-structure}
     */
    async fetchOpenInterest (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            throw new BadRequest (this.id + ' fetchOpenInterest() symbol does not support market ' + symbol);
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetFuturesApiV23MarketSummary (this.extend (request, params));
        const interest = this.safeDict (response, 0, {});
        return this.parseOpenInterest (interest, market);
    }

    /**
     * @method
     * @name btse#fetchOpenInterests
     * @description Retrieves the open interest for a list of symbols
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#market-summary
     * @param {string[]} [symbols] a list of unified CCXT market symbols
     * @param {object} [params] exchange specific parameters
     * @returns {object[]} a list of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    async fetchOpenInterests (symbols: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetFuturesApiV23MarketSummary (params);
        return this.parseOpenInterests (response, symbols) as OpenInterests;
    }

    parseOpenInterest (interest, market: Market = undefined) {
        const marketId = this.safeString (interest, 'symbol');
        market = this.safeMarket (marketId, market);
        return this.safeOpenInterest ({
            'symbol': market['symbol'],
            'openInterestAmount': this.safeNumber (interest, 'openInterest'),
            'openInterestValue': this.safeNumber (interest, 'openInterestUSD'),
            'timestamp': undefined,
            'datetime': undefined,
            'info': interest,
        }, market);
    }

    /**
     * @method
     * @name btse#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#market-summary
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            throw new BadRequest (this.id + ' fetchFundingRate() symbol does not support spot markets');
        }
        const request: Dict = {
            'symbol': market['id'],
            'listFullAttributes': true,
        };
        const response = await this.publicGetFuturesApiV23MarketSummary (this.extend (request, params));
        const data = this.safeDict (response, 0, {});
        return this.parseFundingRate (data, market);
    }

    /**
     * @method
     * @name btse#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#market-summary
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rates structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexe by market symbols
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request: Dict = {
            'listFullAttributes': true,
        };
        const response = await this.publicGetFuturesApiV23MarketSummary (this.extend (request, params));
        return this.parseFundingRates (response, symbols);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        //
        //     {
        //         "symbol": "ETH-PERP",
        //         "last": 2034.23,
        //         "lowestAsk": 2033.9,
        //         "highestBid": 2033.75,
        //         "openInterest": 23884716,
        //         "openInterestUSD": 4859177.67,
        //         "percentageChange": 4.3728,
        //         "volume": 2060865914.715277,
        //         "high24Hr": 2117.35,
        //         "low24Hr": 1918.26,
        //         "base": "ETH",
        //         "quote": "USDT",
        //         "contractStart": 0,
        //         "contractEnd": 0,
        //         "active": true,
        //         "timeBasedContract": false,
        //         "openTime": 0,
        //         "closeTime": 0,
        //         "startMatching": 0,
        //         "inactiveTime": 0,
        //         "fundingRate": 0.0001,
        //         "contractSize": 0.0001,
        //         "maxPosition": 800000000,
        //         "minValidPrice": 0.01,
        //         "minPriceIncrement": 0.01,
        //         "minOrderSize": 1,
        //         "maxOrderSize": 10000000,
        //         "minRiskLimit": 1500000,
        //         "maxRiskLimit": 800000000,
        //         "minSizeIncrement": 1,
        //         "availableSettlement": [
        //             "USD",
        //             "USDT",
        //             "USDC",
        //             "BTC",
        //             "ETH",
        //             "AED",
        //             "AUD",
        //             "CAD",
        //             "CHF",
        //             "EUR",
        //             "GBP",
        //             "HKD",
        //             "INR",
        //             "JPY",
        //             "MYR",
        //             "NZD",
        //             "SGD",
        //             "SOL",
        //             "XRP"
        //         ],
        //         "fundingIntervalMinutes": 480,
        //         "fundingTime": 1770480000000
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        market = this.safeMarket (marketId, market);
        const nextFundingTimestamp = this.safeInteger (contract, 'fundingTime');
        const minutes = this.safeString (contract, 'fundingIntervalMinutes');
        const interval = minutes + 'm'; // todo check
        return {
            'info': contract,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
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
     * @name btse#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://btsecom.github.io/docs/spotV3_3/en/#query-trades-fills
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-trades-fills
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry to fetch
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetSpotApiV33Trades (this.extend (request, params));
        } else {
            response = await this.publicGetFuturesApiV23Trades (this.extend (request, params));
        }
        //
        //     [
        //         {
        //             "price": 2042.7041849,
        //             "size": 0.01,
        //             "side": "SELL",
        //             "symbol": "ETH-USDT",
        //             "serialId": 128814627,
        //             "timestamp": 1770473932328
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name btse#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://btsecom.github.io/docs/spotV3_3/en/#query-user-trades-fills
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-trades-fills-2
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is undefined
     * @param {string} [params.type] 'spot' or 'swap' or 'future', default is 'spot'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const paginate = this.safeBool (params, 'paginate', false);
        if (paginate) {
            params = this.omit (params, 'paginate');
            return await this.fetchPaginatedCallDynamic ('fetchMyTrades', symbol, since, limit, params);
        }
        let market = undefined;
        let request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params, marketType);
        let response = undefined;
        if (marketType === 'spot') {
            //
            //     [
            //         {
            //             "tradeId": "4b4bd301-6f20-4e39-a682-ce4f9b8400a0",
            //             "orderId": "2fa9678b-9945-47ce-9ffe-256dc7b4dd8c",
            //             "clOrderID": "test spot market buy",
            //             "username": "romancuhari",
            //             "side": "BUY",
            //             "orderType": 77,
            //             "triggerType": 0,
            //             "price": 1952.05859608,
            //             "size": 0.19520586,
            //             "filledPrice": 1952.05859608,
            //             "filledSize": 0.0001,
            //             "triggerPrice": 0,
            //             "base": "ETH",
            //             "quote": "USDT",
            //             "symbol": "ETH-USDT",
            //             "feeCurrency": "ETH",
            //             "feeAmount": 0.0000002,
            //             "wallet": "SPOT@",
            //             "realizedPnl": 0,
            //             "total": 0,
            //             "serialId": 49071052,
            //             "timestamp": 1770814978685,
            //             "avgFilledPrice": 1952.05859608
            //         }
            //     ]
            //
            response = await this.privateGetSpotApiV33UserTradeHistory (this.extend (request, params));
        } else {
            //
            //     [
            //         {
            //             "tradeId": "b708489a-19d1-4be2-a6c2-f499f76aa176",
            //             "orderId": "5c6a26db-8cfb-45c7-b25d-56927bc36795",
            //             "username": "romancuhari",
            //             "side": "BUY",
            //             "orderType": 77,
            //             "triggerType": null,
            //             "price": 0,
            //             "size": 1,
            //             "filledPrice": 1956.59,
            //             "filledSize": 1,
            //             "triggerPrice": 0,
            //             "base": "ETH",
            //             "quote": "USDT",
            //             "symbol": "ETH-PERP",
            //             "feeCurrency": "USDT",
            //             "feeAmount": 0.00010761,
            //             "wallet": "CROSS@",
            //             "realizedPnl": 0,
            //             "total": -0.00010761,
            //             "serialId": 50953296,
            //             "timestamp": 1770821231984,
            //             "orderDetailType": null,
            //             "contractSize": 0.0001,
            //             "clOrderID": "",
            //             "positionId": "ETH-PERP-USDT",
            //             "avgFilledPrice": 1956.59
            //         }
            //     ]
            //
            response = await this.privateGetFuturesApiV23UserTradeHistory (this.extend (request, params));
        }
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name btse#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://btsecom.github.io/docs/spotV3_3/en/#query-user-trades-fills
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-trades-fills-2
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, could be used instead of the order id
     * @param {string} [params.type] 'spot' or 'swap' or 'future', default is 'spot'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId === undefined) {
            if (id === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires an id argument or a clientOrderId parameter');
            } else {
                params = this.extend (params, { 'orderID': id });
            }
        } else {
            params = this.extend (params, { 'clOrderID': clientOrderId });
        }
        return await this.fetchMyTrades (symbol, since, limit, params);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //     {
        //         "price": 2042.7041849,
        //         "size": 0.01,
        //         "side": "SELL",
        //         "symbol": "ETH-USDT",
        //         "serialId": 128814627,
        //         "timestamp": 1770473932328
        //     }
        //
        // fetchMyTrades spot
        //     {
        //         "tradeId": "4b4bd301-6f20-4e39-a682-ce4f9b8400a0",
        //         "orderId": "2fa9678b-9945-47ce-9ffe-256dc7b4dd8c",
        //         "clOrderID": "test spot market buy",
        //         "username": "romancuhari",
        //         "side": "BUY",
        //         "orderType": 77,
        //         "triggerType": 0,
        //         "price": 1952.05859608,
        //         "size": 0.19520586,
        //         "filledPrice": 1952.05859608,
        //         "filledSize": 0.0001,
        //         "triggerPrice": 0,
        //         "base": "ETH",
        //         "quote": "USDT",
        //         "symbol": "ETH-USDT",
        //         "feeCurrency": "ETH",
        //         "feeAmount": 0.0000002,
        //         "wallet": "SPOT@",
        //         "realizedPnl": 0,
        //         "total": 0,
        //         "serialId": 49071052,
        //         "timestamp": 1770814978685,
        //         "avgFilledPrice": 1952.05859608
        //     }
        //
        // fetchMyTrades swap
        //     {
        //         "tradeId": "b708489a-19d1-4be2-a6c2-f499f76aa176",
        //         "orderId": "5c6a26db-8cfb-45c7-b25d-56927bc36795",
        //         "username": "romancuhari",
        //         "side": "BUY",
        //         "orderType": 77,
        //         "triggerType": null,
        //         "price": 0,
        //         "size": 1,
        //         "filledPrice": 1956.59,
        //         "filledSize": 1,
        //         "triggerPrice": 0,
        //         "base": "ETH",
        //         "quote": "USDT",
        //         "symbol": "ETH-PERP",
        //         "feeCurrency": "USDT",
        //         "feeAmount": 0.00010761,
        //         "wallet": "CROSS@",
        //         "realizedPnl": 0,
        //         "total": -0.00010761,
        //         "serialId": 50953296,
        //         "timestamp": 1770821231984,
        //         "orderDetailType": null,
        //         "contractSize": 0.0001,
        //         "clOrderID": "",
        //         "positionId": "ETH-PERP-USDT",
        //         "avgFilledPrice": 1956.59
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        let fee = undefined;
        const feeCost = this.safeNumber (trade, 'feeAmount');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (this.safeString (trade, 'feeCurrency')),
            };
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': this.safeString2 (trade, 'tradeId', 'serialId'),
            'order': this.safeString (trade, 'orderId'),
            'type': undefined,
            'side': this.safeStringLower (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeString2 (trade, 'filledPrice', 'price'),
            'amount': this.safeString2 (trade, 'filledSize', 'size'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name btse#createOrder
     * @description create a trade order
     * @see https://btsecom.github.io/docs/spotV3_3/en/#create-new-order
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#create-new-order
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#create-new-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately (default is false)
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', 'PO', 'HALFMIN', 'FIVEMIN', 'HOUR', 'TWELVEHOUR', 'DAY', 'WEEK' or 'MONTH'
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at (same as takeProfitPrice)
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {string} [params.triggerPriceType] 'INDEX_PRICE' or 'LAST_PRICE', default is 'LAST_PRICE'
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {float} [params.deviation] *PEG orders only* How much should the order price deviate from index price. Value is in percentage and can range from -10 to 10
     * @param {float} [params.stealth] *PEG orders only*  How many percent of the order is to be displayed on the orderbook
     * @param {float} [params.stopPrice] *NB - It is NOT stopLossPrice or triggerPrice!!! OCO orders only* Mandatory when creating an OCO order. Indicates the stop price
     * @param {bool} [params.hedged] *contract markets only* true for hedged mode, false for one way mode, default is false
     * @param {string} [params.marginMode] *contract markets only* 'cross' or 'isolated' (default is 'cross') - the exchange does not have cross/isolated margin modes but instead has 'ONE_WAY', 'HEDGE' and 'ISOLATED' position modes, so this param will be converted to the appropriate position mode
     * @param {string} [params.positionMode] *contract markets only* 'ONE_WAY (default) or 'HEDGE or 'ISOLATED' (if not provided, it will be derived from marginMode and hedged params)
     * @param {object} [params.takeProfit] *contract markets only* *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] *contract markets only* take profit trigger price
     * @param {string} [params.takeProfit.priceType] *contract markets only* 'markPrice' or 'lastPrice', default is 'markPrice'
     * @param {object} [params.stopLoss] *contract markets only* *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] *contract markets only* stop loss trigger price
     * @param {string} [params.stopLoss.priceType] *contract markets only* 'markPrice' or 'lastPrice', default is 'markPrice'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            return await this.createSpotOrder (symbol, type, side, amount, price, params);
        } else {
            return await this.createContractOrder (symbol, type, side, amount, price, params);
        }
    }

    /**
     * @method
     * @name btse#createSpotOrder
     * @description create a trade order on spot market
     * @see https://btsecom.github.io/docs/spotV3_3/en/#create-new-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'OCO' or 'PEG'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately (default is false)
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', 'PO', 'HALFMIN', 'FIVEMIN', 'HOUR', 'TWELVEHOUR', 'DAY', 'WEEK' or 'MONTH'
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at (same as takeProfitPrice)
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {string} [params.triggerPriceType] 'INDEX_PRICE' or 'LAST_PRICE', default is 'LAST_PRICE'
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {float} [params.deviation] *PEG orders only* How much should the order price deviate from index price. Value is in percentage and can range from -10 to 10
     * @param {float} [params.stealth] *PEG orders only*  How many percent of the order is to be displayed on the orderbook
     * @param {float} [params.stopPrice] *NB - It is NOT stopLossPrice or triggerPrice!!! OCO orders only* Mandatory when creating an OCO order. Indicates the stop price
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createSpotOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        type = type.toUpperCase ();
        const request: Dict = {
            'symbol': market['id'],
            // 'price'
            'size': this.amountToPrecision (symbol, amount),
            'side': side.toUpperCase (),
            // 'time_in_force'
            'type': type,
            // 'txType'
            // 'stopPrice'
            // 'triggerPrice'
            // 'trailValue'
            // 'postOnly'
            // 'clOrderID'
            // 'stealth'
            // 'deviation'
            // 'triggerPriceType'
        };
        const isMarketOrder = (type === 'MARKET');
        if (!isMarketOrder) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price argument for ' + type + ' orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrderID'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        let postOnly = false;
        // exchange-specific postOnly is the same as the unified one
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, postOnly, params); // this will remove PO from params.timeInForce if present
        if (postOnly) {
            request['postOnly'] = true;
        }
        const timeInForce = this.handleTimeInForce (params);
        if (timeInForce !== undefined) {
            request['time_in_force'] = timeInForce;
        }
        const triggerPrice = this.safeString (params, 'triggerPrice');
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        const triggerPriceToSend = triggerPrice || takeProfitPrice || stopLossPrice;
        const isTriggerOrder = (triggerPrice !== undefined) || (takeProfitPrice !== undefined);
        const isStopLossOrder = (stopLossPrice !== undefined);
        if (isTriggerOrder || isStopLossOrder) {
            params = this.omit (params, [ 'triggerPrice', 'takeProfitPrice', 'stopLossPrice' ]);
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPriceToSend);
            if (isTriggerOrder) {
                request['txType'] = 'TRIGGER';
            } else if (isStopLossOrder) {
                request['txType'] = 'STOP';
            }
        }
        const trailingAmount = this.safeString (params, 'trailingAmount');
        if (trailingAmount !== undefined) {
            request['trailValue'] = this.priceToPrecision (symbol, trailingAmount);
            params = this.omit (params, 'trailingAmount');
        }
        let triggerPriceType = this.safeString (params, 'triggerPriceType');
        if (triggerPriceType !== undefined) {
            params = this.omit (params, 'triggerPriceType');
            if ((triggerPriceType === 'index') || (triggerPriceType === 'indexPrice')) {
                triggerPriceType = 'INDEX_PRICE';
            } else if ((triggerPriceType === 'last') || (triggerPriceType === 'lastPrice')) {
                triggerPriceType = 'LAST_PRICE';
            }
            request['triggerPriceType'] = triggerPriceType;
        }
        const response = await this.privatePostSpotApiV33Order (this.extend (request, params));
        //
        //     [
        //         {
        //             "status": 2,
        //             "symbol": "ETH-USDT",
        //             "orderType": 76,
        //             "price": 1000,
        //             "side": "BUY",
        //             "orderID": "cde4fb37-2e2b-437e-a816-4b55b2e2b7c7",
        //             "timestamp": 1770813053751,
        //             "triggerPrice": 0,
        //             "stopPrice": null,
        //             "trigger": false,
        //             "message": "",
        //             "clOrderID": null,
        //             "stealth": 1,
        //             "deviation": 1,
        //             "postOnly": false,
        //             "orderDetailType": null,
        //             "originalOrderBaseSize": 0.0001,
        //             "originalOrderQuoteSize": null,
        //             "currentOrderBaseSize": 0.0001,
        //             "currentOrderQuoteSize": null,
        //             "remainingOrderBaseSize": 0.0001,
        //             "remainingOrderQuoteSize": null,
        //             "filledBaseSize": 0,
        //             "totalFilledBaseSize": 0,
        //             "orderCurrency": "base",
        //             "avgFilledPrice": 0,
        //             "time_in_force": "GTC"
        //         }
        //     ]
        //
        const order = this.safeDict (response, 0, {});
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name btse#createContractOrder
     * @description create a trade order on contract market
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#create-new-order
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#create-new-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'OCO' or 'PEG'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately (default is false)
     * @param {bool} [params.reduceOnly] if true, the order will only reduce a current position, not increase it (default is false)
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', 'PO', 'HALFMIN', 'FIVEMIN', 'HOUR', 'TWELVEHOUR', 'DAY', 'WEEK' or 'MONTH'
     * @param {bool} [params.hedged] true for hedged mode, false for one way mode, default is false
     * @param {string} [params.marginMode] 'cross' or 'isolated' (default is 'cross') - the exchange does not have cross/isolated margin modes but instead has 'ONE_WAY', 'HEDGE' and 'ISOLATED' position modes, so this param will be converted to the appropriate position mode
     * @param {string} [params.positionMode] 'ONE_WAY (default) or 'HEDGE or 'ISOLATED' (if not provided, it will be derived from marginMode and hedged params)
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at (same as takeProfitPrice)
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {string} [params.triggerPriceType] 'markPrice' or 'lastPrice', default is 'markPrice'
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {string} [params.takeProfit.priceType] 'markPrice' or 'lastPrice', default is 'markPrice'
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {string} [params.stopLoss.priceType] 'markPrice' or 'lastPrice', default is 'markPrice'
     * @param {float} [params.deviation] *PEG orders only* How much should the order price deviate from index price. Value is in percentage and can range from -10 to 10
     * @param {float} [params.stealth] *PEG orders only*  How many percent of the order is to be displayed on the orderbook
     * @param {float} [params.stopPrice] *NB - It is NOT the stopLossPrice!!! OCO orders only* Mandatory when creating an OCO order. Indicates the stop price
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createContractOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            // 'price'
            'size': this.amountToPrecision (symbol, amount),
            'side': side.toUpperCase (),
            // 'time_in_force'
            // 'type'
            // 'txType'
            // 'stopPrice'
            // 'triggerPrice'
            // 'trailValue'
            // 'postOnly'
            // 'reduceOnly'
            // 'clOrderID'
            // 'trigger'
            // 'takeProfitPrice'
            // 'takeProfitTrigger'
            // 'stopLossPrice'
            // 'stopLossTrigger'
            // 'positionMode'
            // additional params for algo orders:
            // 'deviation'
            // 'stealth'
        };
        type = type.toUpperCase ();
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrderID'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        // handle positionMode
        const positionMode = this.safeString (params, 'positionMode');
        // if positionMode is provided, we will get it from params and send it as is
        if (positionMode === undefined) {
            let hedged = false;
            [ hedged, params ] = this.handleOptionAndParams (params, 'createOrder', 'hedged', hedged);
            let marginMode = 'cross';
            [ marginMode, params ] = this.handleOptionAndParams (params, 'createOrder', 'marginMode', marginMode);
            if (marginMode === 'isolated') {
                if (hedged) {
                    throw new BadRequest (this.id + ' createOrder() cannot use isolated margin with hedged positions');
                }
                request['positionMode'] = 'ISOLATED';
            } else if (hedged) {
                request['positionMode'] = 'HEDGE';
            }
            // if not hedged and not isolated, the default is ONE_WAY
        }
        const deviation = this.safeNumber (params, 'deviation');
        const stealth = this.safeNumber (params, 'stealth');
        let response = undefined;
        if ((type === 'PEG') || (deviation !== undefined) || (stealth !== undefined)) {
            // contract PEG orders have own endpoint and do not require type
            request['price'] = this.priceToPrecision (symbol, price);
            response = await this.privatePostSpotApiV33OrderPeg (this.extend (request, params));
        } else {
            request['type'] = type;
            const isMarketOrder = (type === 'MARKET');
            if (!isMarketOrder) {
                if (price === undefined) {
                    throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for ' + type + ' orders');
                }
                request['price'] = this.priceToPrecision (symbol, price);
            }
            let postOnly = false;
            // exchange-specific postOnly is the same as the unified one
            [ postOnly, params ] = this.handlePostOnly (isMarketOrder, postOnly, params); // this will remove PO from params.timeInForce if present
            if (postOnly) {
                request['postOnly'] = true;
            }
            const timeInForce = this.handleTimeInForce (params);
            if (timeInForce !== undefined) {
                request['time_in_force'] = timeInForce;
            }
            // reduceOnly will be passed with params
            const trailingAmount = this.safeString (params, 'trailingAmount');
            if (trailingAmount !== undefined) {
                request['trailValue'] = this.priceToPrecision (symbol, trailingAmount);
                params = this.omit (params, 'trailingAmount');
            }
            const triggerPrice = this.safeString (params, 'triggerPrice');
            // the exchange uses takeProfitPrice and stopLossPrice for attached TP/SL orders
            // this means that we have a conflict with our logic
            // we will use ccxt terms and logic to define what kind of tp/sl order we want to create
            // first we handling with simple tp/sl order
            const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
            const stopLossPrice = this.safeString (params, 'stopLossPrice');
            const triggerPriceToSend = triggerPrice || takeProfitPrice || stopLossPrice;
            const isTriggerOrder = (triggerPrice !== undefined) || (takeProfitPrice !== undefined);
            const isStopLossOrder = (stopLossPrice !== undefined);
            if (isTriggerOrder || isStopLossOrder) {
                params = this.omit (params, [ 'triggerPrice', 'takeProfitPrice', 'stopLossPrice' ]);
                request['triggerPrice'] = this.priceToPrecision (symbol, triggerPriceToSend);
                if (isTriggerOrder) {
                    request['txType'] = 'TRIGGER';
                } else if (isStopLossOrder) {
                    request['txType'] = 'STOP';
                }
            }
            const triggerPriceType = this.safeString (params, 'triggerPriceType');
            if (triggerPriceType !== undefined) {
                params = this.omit (params, 'triggerPriceType');
                request['triggerPriceType'] = this.encodeContractPriceType (triggerPriceType);
            }
            // here we handling with attached take profit and stop loss orders
            const takeProfit = this.safeDict (params, 'takeProfit');
            const stopLoss = this.safeDict (params, 'stopLoss');
            if ((takeProfit !== undefined) || (stopLoss !== undefined)) {
                const takeProfitTriggerPrice = this.safeString (takeProfit, 'triggerPrice');
                const stopLossTriggerPrice = this.safeString (stopLoss, 'triggerPrice');
                const stopLossTriggerPriceType = this.safeString (stopLoss, 'priceType');
                if (takeProfitTriggerPrice !== undefined) {
                    request['takeProfitPrice'] = this.priceToPrecision (symbol, takeProfitTriggerPrice);
                    const takeProfitTriggerPriceType = this.safeString (takeProfit, 'priceType');
                    if (takeProfitTriggerPriceType !== undefined) {
                        request['takeProfitTrigger'] = this.encodeContractPriceType (takeProfitTriggerPriceType);
                    }
                }
                if (stopLossTriggerPrice !== undefined) {
                    request['stopLossPrice'] = this.priceToPrecision (symbol, stopLossTriggerPrice);
                    if (stopLossTriggerPriceType !== undefined) {
                        request['stopLossTrigger'] = this.encodeContractPriceType (stopLossTriggerPriceType);
                    }
                }
                params = this.omit (params, [ 'takeProfit', 'stopLoss' ]);
            }
            //
            //     [
            //         {
            //             "status": 4,
            //             "symbol": "ETH-PERP",
            //             "orderType": 77,
            //             "price": 1956.59,
            //             "side": "BUY",
            //             "orderID": "5c6a26db-8cfb-45c7-b25d-56927bc36795",
            //             "timestamp": 1770821231984,
            //             "triggerPrice": 0,
            //             "trigger": false,
            //             "deviation": 100,
            //             "stealth": 100,
            //             "message": "",
            //             "avgFilledPrice": 1956.59,
            //             "clOrderID": "",
            //             "originalOrderSize": 1,
            //             "currentOrderSize": 1,
            //             "filledSize": 1,
            //             "totalFilledSize": 1,
            //             "remainingSize": 0,
            //             "postOnly": false,
            //             "orderDetailType": null,
            //             "positionMode": "ONE_WAY",
            //             "positionDirection": null,
            //             "positionId": "ETH-PERP-USDT",
            //             "time_in_force": "GTC"
            //         }
            //     ]
            //
            response = await this.privatePostFuturesApiV23Order (this.extend (request, params));
        }
        const order = this.safeDict (response, 0, {});
        return this.parseOrder (order, market);
    }

    encodeContractPriceType (priceType) {
        const priceTypes = {
            'MARK_PRICE': 'markPrice',
            'LAST_PRICE': 'lastPrice',
            'last': 'lastPrice',
            'mark': 'markPrice',
        };
        return this.safeString (priceTypes, priceType, priceType);
    }

    /**
     * @method
     * @name btse#fetchOpenOrder
     * @description fetches information on an open order made by the user
     * @see https://btsecom.github.io/docs/spotV3_3/en/#query-order
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-order
     * @param {string} id the order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {string} [params.type] 'spot', 'swap' or 'future' (default is 'spot')
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrderID'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        } else if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrder() requires an id argument or a clientOrderId parameter');
        } else {
            request['orderID'] = id;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrder', market, params, marketType);
        let response = undefined;
        if (marketType === 'spot') {
            //
            //     {
            //         "orderID": "a5ff04c6-c0bc-47a4-ac7f-6750e9b1699c",
            //         "orderType": 76,
            //         "price": 1000,
            //         "side": "BUY",
            //         "orderValue": 0.0999846,
            //         "pegPriceMin": 0,
            //         "pegPriceMax": 0,
            //         "pegPriceDeviation": 0,
            //         "timestamp": 1770830503384,
            //         "triggerOrder": false,
            //         "triggerPrice": 0,
            //         "triggerOriginalPrice": 0,
            //         "triggerOrderType": 0,
            //         "triggerTrailingStopDeviation": 0,
            //         "triggerStopPrice": 0,
            //         "symbol": "ETH-USDT",
            //         "trailValue": 0,
            //         "trailValueType": "DISTANCE",
            //         "quote": "USDT",
            //         "clOrderID": null,
            //         "status": 2,
            //         "timeInForce": "GTC",
            //         "triggerUseLastPrice": false,
            //         "activationPrice": null,
            //         "activationPriceType": null,
            //         "currentPegPrice": 999.84,
            //         "originalOrderBaseSize": 0.0001,
            //         "originalOrderQuoteSize": null,
            //         "currentOrderBaseSize": 0.0001,
            //         "currentOrderQuoteSize": null,
            //         "remainingOrderBaseSize": 0.0001,
            //         "remainingOrderQuoteSize": null,
            //         "totalFilledBaseSize": 0,
            //         "orderCurrency": "base",
            //         "avgFilledPrice": 0,
            //         "triggered": false,
            //         "wrapperOrder": false
            //     }
            //
            response = await this.privateGetSpotApiV33Order (this.extend (request, params));
        } else {
            //
            //     {
            //         "orderType": 76,
            //         "price": 1830,
            //         "originalOrderSize": 1,
            //         "currentOrderSize": 1,
            //         "totalFilledSize": 1,
            //         "remainingSize": 0,
            //         "side": "SELL",
            //         "orderValue": 0.183,
            //         "pegPriceMin": 0,
            //         "pegPriceMax": 0,
            //         "pegPriceDeviation": 1,
            //         "timestamp": 1770831088059,
            //         "orderID": "5857e882-52ba-4668-a733-b0c346d087fd",
            //         "stealth": 1,
            //         "triggerOrder": false,
            //         "triggered": false,
            //         "triggerPrice": 0,
            //         "triggerOriginalPrice": 0,
            //         "triggerOrderType": 0,
            //         "triggerTrailingStopDeviation": 0,
            //         "triggerStopPrice": 0,
            //         "symbol": "ETH-PERP",
            //         "trailValue": 0,
            //         "trailValueType": "DISTANCE",
            //         "clOrderID": "",
            //         "reduceOnly": false,
            //         "status": 4,
            //         "triggerUseLastPrice": false,
            //         "avgFilledPrice": 1932.16,
            //         "contractSize": 0.0001,
            //         "timeInForce": "GTC",
            //         "closeOrder": false,
            //         "activationPrice": null,
            //         "activationPriceType": null,
            //         "currentPegPrice": 1830,
            //         "wrapperOrder": false
            //     }
            //
            response = await this.privateGetFuturesApiV23Order (this.extend (request, params));
        }
        return this.parseOrder (response);
    }

    /**
     * @method
     * @name btse#editOrder
     * @description edit a trade order
     * @see https://btsecom.github.io/docs/spotV3_3/en/#amend-order
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#amend-order
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' (not used by btse)
     * @param {string} side 'buy' or 'sell' (not used by btse)
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order (required if id is not provided)
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'type': 'ALL',
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrderID'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        } else if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrder() requires an id argument or a clientOrderId parameter');
        } else {
            request['orderID'] = id;
        }
        if (amount !== undefined) {
            request['orderSize'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        const triggerPrice = this.safeString (params, 'triggerPrice');
        if (triggerPrice !== undefined) {
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
            params = this.omit (params, 'triggerPrice');
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.privatePutSpotApiV33Order (this.extend (request, params));
        } else {
            response = await this.privatePutFuturesApiV23Order (this.extend (request, params));
        }
        const order = this.safeDict (response, 0, {});
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name btse#cancelOrder
     * @see https://btsecom.github.io/docs/spotV3_3/en/#cancel-order
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#cancel-order
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order (required if id is not provided)
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrderID'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        } else if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrder() requires an id argument or a clientOrderId parameter');
        } else {
            request['orderID'] = id;
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.privateDeleteSpotApiV33Order (this.extend (request, params));
        } else {
            response = await this.privateDeleteFuturesApiV23Order (this.extend (request, params));
        }
        const order = this.safeDict (response, 0, {});
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name btse#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://btsecom.github.io/docs/spotV3_3/en/#cancel-order
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#cancel-order
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['spot']) {
            response = await this.privateDeleteSpotApiV33Order (this.extend (request, params));
        } else {
            response = await this.privateDeleteFuturesApiV23Order (this.extend (request, params));
        }
        return this.parseOrders (response, market);
    }

    /**
     * @method
     * @name btse#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://btsecom.github.io/docs/spotV3_3/en/#dead-man-39-s-switch-cancel-all-after
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#dead-man-39-s-switch-cancel-all-after
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'swap' or 'future' (default is 'spot')
     * @returns {object} the api result
     */
    async cancelAllOrdersAfter (timeout: Int, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'timeout': timeout,
        };
        let response = undefined;
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelAllOrdersAfter', undefined, params, marketType);
        if (marketType === 'spot') {
            response = await this.privatePostSpotApiV33OrderCancelAllAfter (this.extend (request, params));
        } else {
            response = await this.privatePostFuturesApiV23OrderCancelAllAfter (this.extend (request, params));
        }
        return response;
    }

    /**
     * @method
     * @name btse#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://btsecom.github.io/docs/spotV3_3/en/#query-open-orders
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-open-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'swap' or 'future' (default is 'spot')
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params, marketType);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateGetSpotApiV33UserOpenOrders (this.extend (request, params));
        } else {
            response = await this.privateGetFuturesApiV23UserOpenOrders (this.extend (request, params));
        }
        // todo check parsing
        return this.parseOrders (response, market);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder - spot
        //     {
        //         "status": 2,
        //         "symbol": "ETH-USDT",
        //         "orderType": 76,
        //         "price": 1000,
        //         "side": "BUY",
        //         "orderID": "cde4fb37-2e2b-437e-a816-4b55b2e2b7c7",
        //         "timestamp": 1770813053751,
        //         "triggerPrice": 0,
        //         "stopPrice": null,
        //         "trigger": false,
        //         "message": "",
        //         "clOrderID": null,
        //         "stealth": 1,
        //         "deviation": 1,
        //         "postOnly": false,
        //         "orderDetailType": null,
        //         "originalOrderBaseSize": 0.0001,
        //         "originalOrderQuoteSize": null,
        //         "currentOrderBaseSize": 0.0001,
        //         "currentOrderQuoteSize": null,
        //         "remainingOrderBaseSize": 0.0001,
        //         "remainingOrderQuoteSize": null,
        //         "filledBaseSize": 0,
        //         "totalFilledBaseSize": 0,
        //         "orderCurrency": "base",
        //         "avgFilledPrice": 0,
        //         "time_in_force": "GTC"
        //     }
        //
        // createOrder - swap
        //     {
        //         "status": 4,
        //         "symbol": "ETH-PERP",
        //         "orderType": 77,
        //         "price": 1956.59,
        //         "side": "BUY",
        //         "orderID": "5c6a26db-8cfb-45c7-b25d-56927bc36795",
        //         "timestamp": 1770821231984,
        //         "triggerPrice": 0,
        //         "trigger": false,
        //         "deviation": 100,
        //         "stealth": 100,
        //         "message": "",
        //         "avgFilledPrice": 1956.59,
        //         "clOrderID": "",
        //         "originalOrderSize": 1,
        //         "currentOrderSize": 1,
        //         "filledSize": 1,
        //         "totalFilledSize": 1,
        //         "remainingSize": 0,
        //         "postOnly": false,
        //         "orderDetailType": null,
        //         "positionMode": "ONE_WAY",
        //         "positionDirection": null,
        //         "positionId": "ETH-PERP-USDT",
        //         "time_in_force": "GTC"
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (order, 'timestamp');
        const rawStatus = this.safeString (order, 'status');
        const rawType = this.safeString (order, 'orderType');
        const rawTimeInForce = this.safeString (order, 'time_in_force');
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'orderID'),
            'clientOrderId': this.safeString (order, 'clOrderID'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'status': this.parseOrderStatus (rawStatus),
            'symbol': market['symbol'],
            'type': this.parseOrderType (rawType),
            'timeInForce': this.parseTimeInForce (rawTimeInForce),
            'postOnly': this.safeBool (order, 'postOnly'),
            'reduceOnly': undefined, // todo check
            'side': this.safeStringLower (order, 'side'),
            'price': this.safeString (order, 'price'),
            'triggerPrice': this.omitZero (this.safeString2 (order, 'triggerOriginalPrice', 'triggerPrice')),
            'stopLossPrice': undefined, // todo check
            'takeProfitPrice': undefined, // todo check
            'amount': this.safeString2 (order, 'currentOrderBaseSize', 'currentOrderSize'),
            'filled': this.safeString2 (order, 'totalFilledBaseSize', 'totalFilledSize'),
            'remaining': this.safeString2 (order, 'remainingOrderBaseSize', 'remainingSize'),
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'average': this.omitZero (this.safeString (order, 'avgFilledPrice')),
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            '2': 'open', // Order Inserted
            '3': 'closed', // Order Transacted
            '4': 'closed', // Order Fully Transacted
            '5': 'open', // Order Partially Transacted
            '6': 'canceled', // Order Cancelled
            '7': 'refunded', // Order Refunded
            '8': 'rejected', // Insufficient Balance
            '9': 'open', // Trigger Inserted
            '10': 'open', // Trigger Activated
            '15': 'rejected', // Order Rejected
            '16': 'rejected', // Order Not Found
            '17': 'rejected', // Request Failed
            '123': 'open', // AMEND_ORDER = Order amended
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type) {
        const types = {
            '76': 'limit', // Limit order
            '77': 'market', // Market order
            '80': 'limit', // Peg/Algo order
        };
        return this.safeString (types, type, type);
    }

    parseTimeInForce (timeInForce) {
        const values = {
            'GTC': 'GTC',
            'IOC': 'IOC',
            'FOK': 'FOK',
            'HALFMIN': 'GTD',
            'FIVEMIN': 'GTD',
            'HOUR': 'GTD',
            'TWELVEHOUR': 'GTD',
            'DAY': 'GTD',
            'WEEK': 'GTD',
            'MONTH': 'GTD',
        };
        return this.safeString (values, timeInForce, timeInForce);
    }

    /**
     * @method
     * @name btse#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://btsecom.github.io/docs/spotV3_3/en/#query-account-fees
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-account-fee
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'swap' or 'future' (default is 'spot')
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        let response = [];
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTradingFees', undefined, params, marketType);
        if (marketType === 'spot') {
            response = await this.privateGetSpotApiV33UserFees (params);
        } else {
            response = await this.privateGetFuturesApiV23UserFees (params);
        }
        //
        //     [
        //         {
        //             "symbol": "FUSD-USD",
        //             "makerFee": 0.002,
        //             "takerFee": 0.002
        //         }
        //     ]
        //
        const responseList = this.arrayConcat ([], response);
        const result: Dict = {};
        for (let i = 0; i < responseList.length; i++) {
            const feeInfo = responseList[i];
            const marketId = this.safeString (feeInfo, 'symbol');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const makerFee = this.safeNumber (feeInfo, 'makerFee');
            const takerFee = this.safeNumber (feeInfo, 'takerFee');
            result[symbol] = {
                'info': feeInfo,
                'symbol': symbol,
                'maker': makerFee,
                'taker': takerFee,
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    /**
     * @method
     * @name btse#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://btsecom.github.io/docs/spotV3_3/en/#query-account-fees
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-account-fee
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['spot']) {
            response = await this.privateGetSpotApiV33UserFees (this.extend (request, params));
        } else {
            response = await this.privateGetFuturesApiV23UserFees (this.extend (request, params));
        }
        const feeInfo = this.safeDict (response, 0, {});
        const makerFee = this.safeNumber (feeInfo, 'makerFee');
        const takerFee = this.safeNumber (feeInfo, 'takerFee');
        return {
            'info': feeInfo,
            'symbol': symbol,
            'maker': makerFee,
            'taker': takerFee,
            'percentage': true,
            'tierBased': true,
        };
    }

    /**
     * @method
     * @name btse#fetchPositions
     * @description fetch all open positions
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-position
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.privateGetFuturesApiV23UserPositions (params);
        return this.parsePositions (response, symbols);
    }

    /**
     * @method
     * @name btse#fetchPositionsForSymbol
     * @description fetch open positions for a single market
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-position
     * @description fetch all open positions for specific symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositionsForSymbol (symbol: string, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        params = this.extend ({
            'symbol': market['id'],
        }, params);
        return await this.fetchPositions ([ symbol ], params);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        //     {
        //         "marginType": 91,
        //         "entryPrice": 1968.78,
        //         "markPrice": 1967.47829431,
        //         "symbol": "ETH-PERP",
        //         "side": "BUY",
        //         "orderValue": 3.93495658,
        //         "settleWithAsset": "USDT",
        //         "unrealizedProfitLoss": -0.00260341,
        //         "totalMaintenanceMargin": 0.0218963,
        //         "size": 20,
        //         "liquidationPrice": 0,
        //         "isolatedLeverage": 25,
        //         "adlScoreBucket": 1,
        //         "contractSize": 0.0001,
        //         "liquidationInProgress": false,
        //         "timestamp": 1770880518034,
        //         "takeProfitOrder": {
        //             "orderId": "18b4056a-59de-424a-843e-c2df5c9f7265",
        //             "side": "SELL",
        //             "triggerPrice": 2500,
        //             "triggerUseLastPrice": false
        //         },
        //         "stopLossOrder": {
        //             "orderId": "e7ef1035-0773-446d-9a80-2de0e1de2c13",
        //             "side": "SELL",
        //             "triggerPrice": 1000,
        //             "triggerUseLastPrice": false
        //         },
        //         "positionMode": "ONE_WAY",
        //         "positionDirection": null,
        //         "positionId": "ETH-PERP-USDT",
        //         "walletName": "CROSS@",
        //         "currentLeverage": 0.2,
        //         "minimumRequiredMargin": 0
        //     }
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (position, 'timestamp');
        const marginType = this.safeString (position, 'marginType');
        const side = this.safeStringLower2 (position, 'positionDirection', 'side');
        const positionMode = this.safeString (position, 'positionMode');
        const hedged = (positionMode === 'HEDGE') || (positionMode === 'ISOLATED');
        const takeProfitOrder = this.safeDict (position, 'takeProfitOrder', {});
        const takeProfitPrice = this.safeString (takeProfitOrder, 'triggerPrice');
        const stopLossOrder = this.safeDict (position, 'stopLossOrder', {});
        const stopLossPrice = this.safeString (stopLossOrder, 'triggerPrice');
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'positionId'),
            'symbol': market['symbol'],
            'entryPrice': this.parseNumber (this.safeString (position, 'entryPrice')),
            'markPrice': this.parseNumber (this.safeString (position, 'markPrice')),
            'lastPrice': undefined,
            'takeProfitPrice': this.parseNumber (takeProfitPrice),
            'stopLossPrice': this.parseNumber (stopLossPrice),
            'notional': this.parseNumber (this.safeString (position, 'orderValue')),
            'collateral': undefined,
            'unrealizedPnl': this.parseNumber (this.safeString (position, 'unrealizedProfitLoss')),
            'realizedPnl': undefined,
            'side': this.parsePositionSide (side),
            'contracts': this.parseNumber (this.safeString (position, 'size')),
            'contractSize': this.parseNumber (this.safeString (position, 'contractSize')),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': undefined,
            'hedged': hedged,
            'maintenanceMargin': this.parseNumber (this.safeString (position, 'totalMaintenanceMargin')),
            'maintenanceMarginPercentage': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': this.parseNumber (this.safeString (position, 'currentLeverage')),
            'liquidationPrice': this.parseNumber (this.safeString (position, 'liquidationPrice')),
            'marginRatio': undefined,
            'marginMode': this.parseMarginModeType (marginType),
            'percentage': undefined,
        });
    }

    parseMarginModeType (marginMode) {
        const marginModes = {
            '91': 'cross',
            '92': 'isolated',
        };
        return this.safeString (marginModes, marginMode, marginMode);
    }

    parsePositionSide (side) {
        const sides = {
            'buy': 'long',
            'sell': 'short',
        };
        return this.safeString (sides, side, side);
    }

    /**
     * @method
     * @name btse#fetchPositionMode
     * @description fetchs the position mode, hedged or one way, hedged for btse is set identically for all linear markets or all inverse markets
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-position-mode
     * @param {string} symbol unified symbol of the market to fetch entry for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    async fetchPositionMode (symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPositionMode() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.privateGetFuturesApiV23PositionMode (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "ETH-PERP",
        //             "positionMode": "HEDGE"
        //         }
        //     ]
        //
        const data = this.safeDict (response, 0, {});
        const positionMode = this.safeString (data, 'positionMode');
        const hedged = (positionMode === 'HEDGE') || (positionMode === 'ISOLATED');
        return {
            'info': data,
            'symbol': symbol,
            'hedged': hedged,
        };
    }

    /**
     * @method
     * @name btse#setPositionMode
     * @description NB!!! This method also sets margin mode to cross on btse. Set hedged to true or false for a cross-margin market.
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Set%20Position%20Mode
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol unified symbol of the market to set position mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setPositionMode (hedged: boolean, symbol: Str = undefined, params = {}) {
        // NB!!! This method also sets margin mode to cross on btse
        // btse do not have specific endpoint for marginMode
        // both marginMode and positionMode are set and get with the same endpoints
        // it terms of btse positionMode could be HEDGE, ONE_WAY or ISOLATED
        // ISOLATED positionMode is always hedged and multi-position
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setPositionMode() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const positionMode = hedged ? 'HEDGE' : 'ONE_WAY';
        const request: Dict = {
            'symbol': market['id'],
            'positionMode': positionMode,
        };
        return await this.privatePostFuturesApiV23PositionMode (this.extend (request, params));
    }

    /**
     * @method
     * @name btse#fetchMarginMode
     * @description fetches the margin mode of a specific symbol
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#get-leverage
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    async fetchMarginMode (symbol: string, params = {}): Promise<MarginMode> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.privateGetFuturesApiV23Leverage (this.extend (request, params));
        const data = this.safeDict (response, 0, {});
        return this.parseMarginMode (data, market);
    }

    parseMarginMode (marginMode: Dict, market = undefined): MarginMode {
        //
        //     {
        //         "symbol": "ETH-PERP",
        //         "leverage": 10,
        //         "marginMode": "ISOLATED",
        //         "positionDirection": "SHORT"
        //     }
        //
        const marketId = this.safeString (marginMode, 'symbol');
        market = this.safeMarket (marketId, market);
        const positionMode = this.safeStringLower (marginMode, 'marginMode');
        let marginModeValue = 'cross';
        if (positionMode === 'isolated') {
            marginModeValue = 'isolated';
        }
        return {
            'info': marginMode,
            'symbol': market['symbol'],
            'marginMode': marginModeValue,
        } as MarginMode;
    }

    /**
     * @method
     * @name btse#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Set%20Position%20Mode
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.hedged] set to true to use dualSidePosition, required for setting marginMode to cross on btse
     * @returns {object} response from the exchange
     */
    async setMarginMode (marginMode: string, symbol: Str = undefined, params = {}) {
        // btse do not have specific endpoint for marginMode
        // both marginMode and positionMode are set and get with the same endpoints
        // it terms of btse positionMode could be HEDGE, ONE_WAY or ISOLATED
        // ISOLATED positionMode is always hedged and multi-position
        // we use params.hedged to define the positionMode when marginMode is cross
        // and warn user if the params are not correct for the marginMode being set
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        marginMode = marginMode.toLowerCase ();
        let positionMode = 'ONE_WAY';
        if ((marginMode !== 'cross') && (marginMode !== 'isolated')) {
            throw new BadRequest (this.id + ' setMarginMode() marginMode argument should be either cross or isolated');
        }
        const hedged = this.safeBool (params, 'hedged');
        if (marginMode === 'cross') {
            if (!('hedged' in params)) {
                throw new ArgumentsRequired (this.id + ' setMarginMode() requires a hedged parameter for cross margin mode');
            } else if (hedged) {
                positionMode = 'HEDGE';
            }
        } else if (('hedged' in params) && (!hedged)) {
            throw new BadRequest (this.id + ' setMarginMode() hedged parameter cannot be false for isolated margin mode');
        } else {
            positionMode = 'ISOLATED';
        }
        params = this.omit (params, 'hedged');
        const request: Dict = {
            'symbol': market['id'],
            'positionMode': positionMode,
        };
        return await this.privatePostFuturesApiV23PositionMode (this.extend (request, params));
    }

    /**
     * @method
     * @name btse#closePosition
     * @description closes an open position for a market
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#close-position
     * @param {string} symbol unified CCXT market symbol
     * @param {string} [side] not used by btse
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'limit' or 'market' (default is 'market')
     * @param {float} [params.price] required if params.type is 'limit'
     * @param {bool} [params.postOnly] true if the order should be post only
     * @param {string} [params.positionId] The position ID that you want to close. Mandatory when positionMode is HEDGE or ISOLATED
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let type = 'market';
        [ type, params ] = this.handleOptionAndParams (params, 'closePosition', 'type', type);
        type = type.toUpperCase ();
        request['type'] = type;
        if (type === 'LIMIT') {
            const price = this.safeString (params, 'price');
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' closePosition() requires a price parameter for limit orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostFuturesApiV23OrderClosePosition (this.extend (request, params));
        const order = this.safeDict (response, 0, {});
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name btse#fetchLeverage
     * @description fetch the leverage for a market
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#get-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.privateGetFuturesApiV23Leverage (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "ETH-PERP",
        //             "leverage": 10,
        //             "marginMode": "ISOLATED",
        //             "positionDirection": "LONG"
        //         },
        //         {
        //             "symbol": "ETH-PERP",
        //             "leverage": 10,
        //             "marginMode": "ISOLATED",
        //             "positionDirection": "SHORT"
        //         }
        //     ]
        //
        let safeResponse = [];
        if (Array.isArray (response)) {
            safeResponse = response;
        }
        const result: Dict = {
            'info': response,
            'symbol': symbol,
        };
        let longLeverage = undefined;
        let shortLeverage = undefined;
        let marginMode = undefined;
        for (let i = 0; i < safeResponse.length; i++) {
            const entrty = safeResponse[i];
            const leverageValue = this.safeInteger (entrty, 'leverage');
            const positionDirection = this.safeString (entrty, 'positionDirection');
            marginMode = this.safeStringLower (entrty, 'marginMode');
            if (positionDirection === 'LONG') {
                longLeverage = leverageValue;
            } else if (positionDirection === 'SHORT') {
                shortLeverage = leverageValue;
            } else if (positionDirection === undefined) {
                longLeverage = leverageValue;
                shortLeverage = leverageValue;
            }
        }
        result['marginMode'] = marginMode;
        result['longLeverage'] = longLeverage;
        result['shortLeverage'] = shortLeverage;
        return result as Leverage;
    }

    /**
     * @method
     * @name btse#setLeverage
     * @description set the level of leverage for a market
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#set-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: int, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        const response = await this.privatePostFuturesApiV23Leverage (this.extend (request, params));
        return response;
    }

    sign (path, api: any = 'public', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const baseUrl = this.urls['api'][api];
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let queryString = '';
        if ((method === 'GET') || (method === 'DELETE')) {
            if (Object.keys (query).length) {
                queryString = this.urlencode (query);
                url += '?' + queryString;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            let bodyString = this.json (query);
            if ((method === 'GET') || (method === 'DELETE')) {
                bodyString = '';
            } else {
                body = bodyString;
            }
            path = this.cleanPath (path);
            const payload = path + nonce.toString () + bodyString;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha384);
            headers = {
                'request-api': this.apiKey,
                'request-nonce': nonce.toString (),
                'request-sign': signature,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    cleanPath (path) {
        let result = path.replace ('spot', '');
        result = result.replace ('futures', '');
        result = result.replace ('otc', '');
        return result;
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }
}
