
//  ---------------------------------------------------------------------------

import Exchange from './abstract/btse.js';
// import { ArgumentsRequired, AuthenticationError, BadRequest, ExchangeError, InsufficientFunds, NotSupported, PermissionDenied, RateLimitExceeded } from '../ccxt.js';
import { Precise } from './base/Precise.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Dict, Int, Market } from './base/types.js';

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
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'deposit': false,
                'editOrder': false,
                'editOrders': false,
                'editOrderWithClientOrderId': false,
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
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
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
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'watchMyLiquidationsForSymbols': false,
                'withdraw': false,
                'ws': true,
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
                        'spot/api/v3.3/ohlcv': 5,
                        'spot/api/v3.3/price': 5,
                        'spot/api/v3.3/orderbook': 5,
                        'spot/api/v3.3/orderbook/L2': 5,
                        'spot/api/v3.3/trades': 5,
                        'spot/api/v3.3/time': 5, // done
                        'futures/api/v2.3/market_summary': 5, // done
                        'futures/api/v2.3/ohlcv': 5,
                        'futures/api/v2.3/price': 5,
                        'futures/api/v2.3/orderbook': 5,
                        'futures/api/v2.3/orderbook/L2': 5,
                        'futures/api/v2.3/trades': 5,
                        'futures/api/v2.3/funding_history': 5,
                        'futures/api/v2.3/market/risk_limit': 5,
                        'spot/api/v3.2/availableCurrencyNetworks': 15,
                        'spot/api/v3.2/exchangeRate': 15,
                        'public-api/wallet/v1/crypto/networks ': 15,
                        'public-api/wallet/v1/assets/exchangeRate': 15,
                    },
                },
                'private': {
                    'get': {
                        'spot/api/v3.3/order': 1,
                        'spot/api/v3.3/user/open_orders': 5,
                        'spot/api/v3.3/user/trade_history': 5,
                        'spot/api/v3.3/user/fees': 5,
                        'spot/api/v3.3/invest/products': 5,
                        'spot/api/v3.3/invest/orders': 5,
                        'spot/api/v3.3/invest/history': 5,
                        'futures/api/v2.3/order': 1,
                        'futures/api/v2.3/user/open_orders': 1,
                        'futures/api/v2.3/user/trade_history': 5,
                        'futures/api/v2.3/user/positions': 5,
                        'futures/api/v2.3/risk_limit': 5,
                        'futures/api/v2.3/leverage': 5,
                        'futures/api/v2.3/user/fees': 5,
                        'futures/api/v2.3/position_mode': 5,
                        'futures/api/v2.3/user/margin_setting': 5,
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
                        'spot/api/v3.3/order': 1,
                        'spot/api/v3.3/order/peg': 1,
                        'spot/api/v3.3/order/cancelAllAfter': 1,
                        'spot/api/v3.3/invest/deposit': 5,
                        'spot/api/v3.3/invest/renew': 5,
                        'spot/api/v3.3/invest/redeem': 5,
                        'futures/api/v2.3/order': 1,
                        'futures/api/v2.3/order/peg': 1,
                        'futures/api/v2.3/order/cancelAllAfter': 1,
                        'futures/api/v2.3/order/close_position': 1,
                        'futures/api/v2.3/risk_limit': 5,
                        'futures/api/v2.3/leverage': 5,
                        'futures/api/v2.3/settle_in': 5,
                        'futures/api/v2.3/order/bind/tpsl': 1,
                        'futures/api/v2.3/position_mode': 5,
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
                        'spot/api/v3.3/order': 1,
                        'futures/api/v2.3/order': 1,
                    },
                    'delete': {
                        'spot/api/v3.3/order': 1,
                        'futures/api/v2.3/order': 1,
                        'spot/api/v3.3/user/wallet/address': 15,
                    },
                },
            },
            'features': {
                'spot': undefined,
                'swap': {
                    'linear': {
                        'sandbox': false,
                        'createOrder': {
                            'marginMode': false,
                            'triggerPrice': false,
                            'triggerPriceType': {
                                'mark': true,
                                'last': true,
                                'index': false,
                            },
                            'stopLossPrice': true,
                            'takeProfitPrice': true,
                            'attachedStopLossTakeProfit': undefined, // not supported
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
                        'createOrders': {
                            'max': 5,
                        },
                        'fetchMyTrades': {
                            'marginMode': false,
                            'daysBack': 182, // 6 months
                            'limit': 500,
                            'untilDays': 7,
                            'symbolRequired': false,
                        },
                        'fetchOrder': undefined,
                        'fetchOpenOrder': {
                            'marginMode': false,
                            'trigger': true,
                            'trailing': false,
                            'symbolRequired': true,
                        },
                        'fetchOpenOrders': {
                            'marginMode': false,
                            'limit': 500,
                            'trigger': true,
                            'trailing': false,
                            'symbolRequired': true,
                        },
                        'fetchOrders': undefined,
                        'fetchCanceledAndClosedOrders': {
                            'marginMode': false,
                            'limit': 500,
                            'daysBack': 182, // 6 months
                            'untilDays': 7,
                            'trigger': false,
                            'trailing': false,
                            'symbolRequired': false,
                        },
                        'fetchClosedOrders': undefined,
                        'fetchOHLCV': {
                            'limit': 500,
                        },
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
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
                '12h': '12h',
                '1d': '1d',
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
        let amountPrecision = this.safeString (market, 'minSizeIncrement');
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
            amountPrecision = Precise.stringMul (amountPrecision, contractSize);
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
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
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

    sign (path, api: any = 'public', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const baseUrl = this.urls['api'][api];
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let queryString = '';
        if (method === 'GET') {
            if (Object.keys (query).length) {
                queryString = this.urlencode (query);
                url += '?' + queryString;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
