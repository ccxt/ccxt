
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bydfi.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, ExchangeError, InsufficientFunds, NotSupported, PermissionDenied, RateLimitExceeded } from '../ccxt.js';
import { Precise } from './base/Precise.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Balances, Currency, Dict, FundingRate, FundingRateHistory, Int, int, Leverage, MarginMode, Market, Num, OHLCV, Order, OrderBook, OrderRequest, OrderSide, OrderType, Position, Str, Strings, Trade, Transaction, TransferEntry, Ticker, Tickers } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bydfi
 * @augments Exchange
 */
export default class bydfi extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bydfi',
            'name': 'BYDFi',
            'countries': [ 'SG' ], // Singapore todo check
            'rateLimit': 50, // 20 requests per second
            'version': 'v1',
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelOrdersWithClientOrderId': false,
                'cancelOrderWithClientOrderId': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createLimitBuyOrder': false,
                'createLimitOrder': true,
                'createLimitSellOrder': false,
                'createMarketBuyOrder': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrder': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopLossOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': true,
                'createTriggerOrder': false,
                'deposit': false,
                'editOrder': true,
                'editOrders': true,
                'editOrderWithClientOrderId': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledAndClosedOrders': true,
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
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
                'fetchL2OrderBook': true,
                'fetchL3OrderBook': false,
                'fetchLastPrices': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverage': true,
                'fetchLeverages': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': true,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
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
                'fetchPositionHistory': true,
                'fetchPositionMode': true,
                'fetchPositions': true,
                'fetchPositionsForSymbol': true,
                'fetchPositionsHistory': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
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
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': true,
                'setPositionMode': true,
                'signIn': false,
                'transfer': true,
                'watchMyLiquidationsForSymbols': false,
                'withdraw': false,
                'ws': true,
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/bfffb73d-29bd-465d-b75b-98e210491769',
                'api': {
                    'public': 'https://api.bydfi.com/api',
                    'private': 'https://api.bydfi.com/api',
                },
                'www': 'https://bydfi.com/',
                'doc': 'https://developers.bydfi.com/en/',
                'referral': 'https://partner.bydfi.com/j/DilWutCI',
            },
            'fees': {
            },
            'api': {
                'public': {
                    'get': {
                        'v1/public/api_limits': 1, // https://developers.bydfi.com/en/public#inquiry-into-api-rate-limit-configuration
                        'v1/swap/market/exchange_info': 1,
                        'v1/swap/market/depth': 1,
                        'v1/swap/market/trades': 1,
                        'v1/swap/market/klines': 1,
                        'v1/swap/market/ticker/24hr': 1,
                        'v1/swap/market/ticker/price': 1, // https://developers.bydfi.com/en/swap/market#latest-price
                        'v1/swap/market/mark_price': 1, // https://developers.bydfi.com/en/swap/market#mark-price
                        'v1/swap/market/funding_rate': 1,
                        'v1/swap/market/funding_rate_history': 1,
                        'v1/swap/market/risk_limit': 1, // https://developers.bydfi.com/en/swap/market#risk-limit
                    },
                },
                'private': {
                    'get': {
                        'v1/account/assets': 1,
                        'v1/account/transfer_records': 1,
                        'v1/spot/deposit_records': 1,
                        'v1/spot/withdraw_records': 1,
                        'v1/swap/trade/open_order': 1,
                        'v1/swap/trade/plan_order': 1,
                        'v1/swap/trade/leverage': 1,
                        'v1/swap/trade/history_order': 1,
                        'v1/swap/trade/history_trade': 1,
                        'v1/swap/trade/position_history': 1,
                        'v1/swap/trade/positions': 1,
                        'v1/swap/account/balance': 1,
                        'v1/swap/user_data/assets_margin': 1,
                        'v1/swap/user_data/position_side/dual': 1,
                        'v1/agent/teams': 1, // https://developers.bydfi.com/en/agent/#query-kol-subordinate-team-information
                        'v1/agent/agent_links': 1, // https://developers.bydfi.com/en/agent/#query-kol-invitation-code-list
                        'v1/agent/regular_overview': 1, // https://developers.bydfi.com/en/agent/#query-kol-direct-client-data-list
                        'v1/agent/agent_sub_overview': 1, // https://developers.bydfi.com/en/agent/#query-kol-subordinate-affiliate-list
                        'v1/agent/partener_user_deposit': 1, // https://developers.bydfi.com/en/agent/#check-the-recharge-amount-of-kol-within-one-year
                        'v1/agent/partener_users_data': 1, // https://developers.bydfi.com/en/agent/#query-kol-subordinate-deposit-and-trading-data
                        'v1/agent/affiliate_uids': 1, // https://developers.bydfi.com/en/agent/#get-affiliate-uids
                        'v1/agent/affiliate_commission': 1, // https://developers.bydfi.com/en/agent/#get-affiliate-commission
                        'v1/agent/internal_withdrawal_status': 1, // https://developers.bydfi.com/en/agent/#get-internal-withdrawal-status
                    },
                    'post': {
                        'v1/account/transfer': 1,
                        'v1/swap/trade/place_order': 1,
                        'v1/swap/trade/batch_place_order': 1,
                        'v1/swap/trade/edit_order': 1,
                        'v1/swap/trade/batch_edit_order': 1,
                        'v1/swap/trade/cancel_all_order': 1,
                        'v1/swap/trade/leverage': 1,
                        'v1/swap/trade/batch_leverage_margin': 1, // https://developers.bydfi.com/en/swap/trade#modify-leverage-and-margin-type-with-one-click
                        'v1/swap/user_data/margin_type': 1,
                        'v1/swap/user_data/position_side/dual': 1,
                        'v1/agent/internal_withdrawal': 1, // https://developers.bydfi.com/en/agent/#internal-withdrawal
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
            'exceptions': {
                'exact': {
                    '101001': AuthenticationError, // {"code":101001,"message":"Apikey doesn't exist!"}
                    '101103': AuthenticationError, // {"code":101103,"message":"Invalid API-key, IP, or permissions for action."}
                    '102001': BadRequest, // {"code":102001,"message":"Unsupported transfer type"}
                    '102002': PermissionDenied, // {"code":102002,"message":"The current account does not support transfer of this currency"}
                    '401': AuthenticationError, // 401 Unauthorized – Invalid API Key
                    '500': ExchangeError, // 500 Internal Error
                    '501': ExchangeError, // 501 System Busy
                    '506': ExchangeError, // 506 Unknown Request Origin
                    '510': RateLimitExceeded, // 510 Requests Too Frequent
                    '511': AuthenticationError, // 511 Access to the Interface is Forbidden
                    '513': BadRequest, // 513 Invalid Request
                    '514': BadRequest, // 514 Duplicate Request
                    '600': BadRequest, // 600 Parameter Error
                    'Position does not exist': BadRequest, // {"code":100036,"message":"Position does not exist"}
                    'Requires transaction permissions': PermissionDenied, // {"code":101107,"message":"Requires transaction permissions"}
                    'Service error': ExchangeError, // { msg: 'Service error', code: '-1' }
                    'transfer failed': InsufficientFunds, // {"code":500,"message":"transfer failed","success":false}
                },
                'broad': {
                    'is missing': ArgumentsRequired, // {"code":600,"message":"The parameter 'startTime' is missing"}
                },
            },
            'commonCurrencies': {
            },
            'options': {
                'networks': {
                    'ERC20': 'ETH', // todo add more networks
                },
                'timeInForce': {
                    'GTC': 'GTC', // Good Till Cancelled
                    'FOK': 'FOK', // Fill Or Kill
                    'IOC': 'IOC', // Immediate Or Cancel
                    'PO': 'POST_ONLY', // Post Only
                },
                'accountsByType': {
                    'spot': 'SPOT',
                    'swap': 'SWAP',
                    'funding': 'FUND',
                },
                'accountsById': {
                    'SPOT': 'spot',
                    'SWAP': 'swap',
                    'FUND': 'funding',
                },
            },
        });
    }

    /**
     * @method
     * @name bydfi#fetchMarkets
     * @description retrieves data on all markets for bydfi
     * @see https://developers.bydfi.com/en/swap/market#fetching-trading-rules-and-pairs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV1SwapMarketExchangeInfo (params);
        //
        //     {
        //         "code": "200",
        //         "message": "success",
        //         "data": [
        //             {
        //                 "symbol": "CLANKER-USDT",
        //                 "baseAsset": "CLANKER",
        //                 "marginAsset": "USDT",
        //                 "quoteAsset": "USDT",
        //                 "contractFactor": "0.01",
        //                 "limitMaxQty": "50000",
        //                 "limitMinQty": "1",
        //                 "marketMaxQty": "10000",
        //                 "marketMinQty": "1",
        //                 "pricePrecision": "8",
        //                 "basePrecision": "8",
        //                 "feeRateTaker": "0.0006",
        //                 "feeRateMaker": "0.0002",
        //                 "liqFeeRate": "0.0006",
        //                 "openBuyLimitRateMax": "0.05",
        //                 "openSellLimitRateMax": "100",
        //                 "openBuyLimitRateMin": "0.98",
        //                 "openSellLimitRateMin": "0.05",
        //                 "priceOrderPrecision": "2",
        //                 "baseShowPrecision": "2",
        //                 "maxLeverageLevel": "20",
        //                 "volumePrecision": "2",
        //                 "maxLimitOrderNum": "200",
        //                 "maxPlanOrderNum": "10",
        //                 "reverse": false,
        //                 "onboardTime": "1763373600000",
        //                 "status": "NORMAL"
        //             },
        //             ...
        //         ],
        //         "success": true
        //     }
        const data = this.safeList (response, 'data', []);
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        //
        //     {
        //         "symbol": "CLANKER-USDT",
        //         "baseAsset": "CLANKER",
        //         "marginAsset": "USDT",
        //         "quoteAsset": "USDT",
        //         "contractFactor": "0.01",
        //         "limitMaxQty": "50000",
        //         "limitMinQty": "1",
        //         "marketMaxQty": "10000",
        //         "marketMinQty": "1",
        //         "pricePrecision": "8",
        //         "basePrecision": "8",
        //         "feeRateTaker": "0.0006",
        //         "feeRateMaker": "0.0002",
        //         "liqFeeRate": "0.0006",
        //         "openBuyLimitRateMax": "0.05",
        //         "openSellLimitRateMax": "100",
        //         "openBuyLimitRateMin": "0.98",
        //         "openSellLimitRateMin": "0.05",
        //         "priceOrderPrecision": "2",
        //         "baseShowPrecision": "2",
        //         "maxLeverageLevel": "20",
        //         "volumePrecision": "2",
        //         "maxLimitOrderNum": "200",
        //         "maxPlanOrderNum": "10",
        //         "reverse": false,
        //         "onboardTime": "1763373600000",
        //         "status": "NORMAL"
        //     }
        //
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'baseAsset');
        const quoteId = this.safeString (market, 'quoteAsset');
        const settleId = this.safeString (market, 'marginAsset');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        const symbol = base + '/' + quote + ':' + settle;
        const inverse = this.safeBool (market, 'reverse');
        const limitMaxQty = this.safeString (market, 'limitMaxQty');
        const marketMaxQty = this.safeString (market, 'marketMaxQty');
        const maxAmountString = Precise.stringMax (limitMaxQty, marketMaxQty);
        const marketMinQty = this.safeString (market, 'marketMinQty');
        const limitMinQty = this.safeString (market, 'limitMinQty');
        const minAmountString = Precise.stringMin (marketMinQty, limitMinQty);
        const contractSize = this.safeString (market, 'contractFactor');
        const pricePrecision = this.parsePrecision (this.safeString (market, 'priceOrderPrecision'));
        const rawAmountPrecision = this.parsePrecision (this.safeString (market, 'volumePrecision'));
        const amountPrecision = Precise.stringDiv (rawAmountPrecision, contractSize);
        const basePrecision = this.parsePrecision (this.safeString (market, 'basePrecision'));
        const taker = this.safeNumber (market, 'feeRateTaker');
        const maker = this.safeNumber (market, 'feeRateMaker');
        const maxLeverage = this.safeNumber (market, 'maxLeverageLevel');
        const status = this.safeString (market, 'status');
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': undefined,
            'swap': true,
            'future': false,
            'option': false,
            'active': status === 'NORMAL',
            'contract': true,
            'linear': !inverse,
            'inverse': inverse,
            'taker': taker,
            'maker': maker,
            'contractSize': this.parseNumber (contractSize),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (amountPrecision),
                'price': this.parseNumber (pricePrecision),
                'base': this.parseNumber (basePrecision),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': maxLeverage,
                },
                'amount': {
                    'min': this.parseNumber (minAmountString),
                    'max': this.parseNumber (maxAmountString),
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
            'created': this.parse8601 (this.safeString (market, 'createdAt')),
            'info': market,
        });
    }

    /**
     * @method
     * @name bydfi#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.bydfi.com/en/swap/market#depth-information
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return, could be 5, 10, 20, 50, 100, 500 or 1000 (default 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = this.getClosestLimit (limit);
        }
        const response = await this.publicGetV1SwapMarketDepth (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": {
        //             "lastUpdateId": "221780076",
        //             "symbol": "ETH-USDT",
        //             "asks": [
        //                 {
        //                     "price": "2958.21",
        //                     "amount": "39478"
        //                 },
        //                 ...
        //             ],
        //             "bids": [
        //                 {
        //                     "price": "2958.19",
        //                     "amount": "174498"
        //                 },
        //                 ...
        //             ],
        //             "e": "221780076"
        //         },
        //         "success": true
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.milliseconds ();
        const orderBook = this.parseOrderBook (data, market['symbol'], timestamp, 'bids', 'asks', 'price', 'amount');
        orderBook['nonce'] = this.safeInteger (data, 'lastUpdateId');
        return orderBook;
    }

    getClosestLimit (limit: Int): Int {
        const limits = [ 5, 10, 20, 50, 100, 500, 1000 ];
        let result = 1000;
        for (let i = 0; i < limits.length; i++) {
            if (limit <= limits[i]) {
                result = limits[i];
                break;
            }
        }
        return result;
    }

    /**
     * @method
     * @name bydfi#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://developers.bydfi.com/en/swap/market#recent-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (default 500, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.fromId] retrieve from which trade ID to start. Default to retrieve the most recent trade records
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1SwapMarketTrades (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": [
        //             {
        //                 "id": "7407825178362667008",
        //                 "symbol": "ETH-USDT",
        //                 "price": "2970.49",
        //                 "quantity": "63",
        //                 "side": "SELL",
        //                 "time": 1766163153218
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name bydfi#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://developers.bydfi.com/en/swap/trade#historical-trades-query
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet
     * @param {string} [params.orderType] order type ('LIMIT', 'MARKET', 'LIQ', 'LIMIT_CLOSE', 'MARKET_CLOSE', 'STOP', 'TAKE_PROFIT', 'STOP_MARKET', 'TAKE_PROFIT_MARKET' or 'TRAILING_STOP_MARKET')
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const paginate = this.safeBool (params, 'paginate', false);
        if (paginate) {
            const maxLimit = 500;
            params = this.omit (params, 'paginate');
            params = this.extend (params, { 'paginationDirection': 'backward' });
            const paginatedResponse = await this.fetchPaginatedCallDynamic ('fetchMyTrades', symbol, since, limit, params, maxLimit, true);
            return this.sortBy (paginatedResponse, 'timestamp');
        }
        let contractType = 'FUTURE';
        [ contractType, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'contractType', contractType);
        const request: Dict = {
            'contractType': contractType,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        params = this.handleSinceAndUntil ('fetchMyTrades', since, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV1SwapTradeHistoryTrade (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": [
        //             {
        //                 "orderId": "7408919189505597440",
        //                 "wallet": "W001",
        //                 "symbol": "ETH-USDC",
        //                 "time": "1766423985842",
        //                 "dealPrice": "3032.45",
        //                 "dealVolume": "1",
        //                 "fee": "0",
        //                 "side": "BUY",
        //                 "type": "2",
        //                 "liqPrice": null,
        //                 "basePrecision": "8",
        //                 "baseShowPrecision": "2",
        //                 "tradePnl": "0",
        //                 "marginType": "CROSS",
        //                 "leverageLevel": 1
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //     {
        //         "id": "7407825178362667008",
        //         "symbol": "ETH-USDT",
        //         "price": "2970.49",
        //         "quantity": "63",
        //         "side": "SELL",
        //         "time": 1766163153218
        //     }
        //
        // fetchMyTrades
        //     {
        //         "orderId": "7408919189505597440",
        //         "wallet": "W001",
        //         "symbol": "ETH-USDC",
        //         "time": "1766423985842",
        //         "dealPrice": "3032.45",
        //         "dealVolume": "1",
        //         "fee": "0",
        //         "side": "BUY",
        //         "type": "2",
        //         "liqPrice": null,
        //         "basePrecision": "8",
        //         "baseShowPrecision": "2",
        //         "tradePnl": "0",
        //         "marginType": "CROSS",
        //         "leverageLevel": 1
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'time');
        let fee = undefined;
        const rawType = this.safeString (trade, 'type');
        const feeCost = this.safeString (trade, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['settle'],
            };
        }
        const orderId = this.safeString (trade, 'orderId');
        let side: Str = undefined; // fetchMyTrades always returns side BUY
        if (orderId === undefined) {
            // from fetchTrades
            side = this.safeStringLower (trade, 'side');
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': this.safeString (trade, 'id'),
            'order': orderId,
            'type': this.parseTradeType (rawType),
            'side': side,
            'takerOrMaker': undefined,
            'price': this.safeString2 (trade, 'price', 'dealPrice'),
            'amount': this.safeString2 (trade, 'quantity', 'dealVolume'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    parseTradeType (type: Str): Str {
        const types = {
            '1': 'limit',
            '2': 'market',
            '3': 'liquidation',
        };
        return this.safeString (types, type, type);
    }

    /**
     * @method
     * @name bydfi#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.bydfi.com/en/swap/market#candlestick-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (max 500)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const maxLimit = 500; // docs says max 1500, but in practice only 500 works
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, maxLimit);
        }
        const market = this.market (symbol);
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const request = {
            'symbol': market['id'],
            'interval': interval,
        };
        let startTime = since;
        const numberOfCandles = limit ? limit : maxLimit;
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'until');
        const now = this.milliseconds ();
        const duration = this.parseTimeframe (timeframe) * 1000;
        const timeDelta = duration * numberOfCandles;
        if (startTime === undefined && until === undefined) {
            startTime = now - timeDelta;
            until = now;
        } else if (until === undefined) {
            until = startTime + timeDelta;
            if (until > now) {
                until = now;
            }
        } else if (startTime === undefined) {
            startTime = until - timeDelta;
        }
        request['startTime'] = startTime;
        request['endTime'] = until;
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1SwapMarketKlines (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": [
        //             {
        //                 "s": "ETH-USDT",
        //                 "t": "1766166000000",
        //                 "c": "2964.990000000000000000",
        //                 "o": "2967.830000000000000000",
        //                 "h": "2967.830000000000000000",
        //                 "l": "2964.130000000000000000",
        //                 "v": "20358.000000000000000000"
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const result = this.parseOHLCVs (data, market, timeframe, since, limit);
        return result;
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "s": "ETH-USDT",
        //         "t": "1766166000000",
        //         "c": "2964.990000000000000000",
        //         "o": "2967.830000000000000000",
        //         "h": "2967.830000000000000000",
        //         "l": "2964.130000000000000000",
        //         "v": "20358.000000000000000000"
        //     }
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    /**
     * @method
     * @name bydfi#fetchTickers
     * @see https://developers.bydfi.com/en/swap/market#24hr-price-change-statistics
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const response = await this.publicGetV1SwapMarketTicker24hr (params);
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": [
        //             {
        //                 "symbol": "BTC-USDT",
        //                 "open": "86452.9",
        //                 "high": "89371.2",
        //                 "low": "84418.5",
        //                 "last": "87050.3",
        //                 "vol": "12938783",
        //                 "time": 1766169423872
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTickers (data, symbols);
    }

    /**
     * @method
     * @name bydfi#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developers.bydfi.com/en/swap/market#24hr-price-change-statistics
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
        const response = await this.publicGetV1SwapMarketTicker24hr (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        const ticker = this.safeDict (data, 0, {});
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // fetchTicker/fetchTickers
        //     {
        //         "symbol": "BTC-USDT",
        //         "open": "86452.9",
        //         "high": "89371.2",
        //         "low": "84418.5",
        //         "last": "87050.3",
        //         "vol": "12938783",
        //         "time": 1766169423872
        //     }
        //
        const marketId = this.safeString2 (ticker, 'symbol', 's');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (ticker, 'time', 'E');
        const last = this.safeString2 (ticker, 'last', 'c');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString2 (ticker, 'high', 'h'),
            'low': this.safeString2 (ticker, 'low', 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString2 (ticker, 'open', 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString2 (ticker, 'vol', 'v'),
            'quoteVolume': undefined,
            'markPrice': undefined,
            'indexPrice': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name bydfi#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://developers.bydfi.com/en/swap/market#recent-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1SwapMarketFundingRate (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": {
        //             "symbol": "BTC-USDT",
        //             "lastFundingRate": "0.0001",
        //             "nextFundingTime": "1766188800000",
        //             "time": "1766170665007"
        //         },
        //         "success": true
        //     }
        //
        const data = this.safeDict (response, 'data');
        return this.parseFundingRate (data, market);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        //
        //     {
        //         "symbol": "BTC-USDT",
        //         "lastFundingRate": "0.0001",
        //         "nextFundingTime": "1766188800000",
        //         "time": "1766170665007"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (contract, 'time');
        const nextFundingTimestamp = this.safeInteger (contract, 'nextFundingTime');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'lastFundingRate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601 (nextFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        } as FundingRate;
    }

    /**
     * @method
     * @name bydfi#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://developers.bydfi.com/en/swap/market#historical-funding-rates
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingRateHistory[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.publicGetV1SwapMarketFundingRateHistory (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": [
        //             {
        //                 "symbol": "ETH-USDT",
        //                 "fundingRate": "0.00000025",
        //                 "fundingTime": "1765584000000",
        //                 "markPrice": "3083.2"
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseFundingRateHistories (data, market, since, limit);
    }

    parseFundingRateHistory (contract, market: Market = undefined) {
        //
        //     {
        //         "symbol": "ETH-USDT",
        //         "fundingRate": "0.00000025",
        //         "fundingTime": "1765584000000",
        //         "markPrice": "3083.2"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const timestamp = this.safeInteger (contract, 'fundingTime');
        return {
            'info': contract,
            'symbol': this.safeSymbol (marketId, market),
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    /**
     * @method
     * @name bydfi#createOrder
     * @description create a trade order
     * @see https://developers.bydfi.com/en/swap/trade#placing-an-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @param {bool} [params.hedged] true for hedged mode, false for one way mode, default is false
     * @param {string} [params.clientOrderId] Custom order ID, must be unique for open orders
     * @param {string} [params.timeInForce] 'GTC' (Good Till Cancelled), 'FOK' (Fill Or Kill), 'IOC' (Immediate Or Cancel), 'PO' (Post Only)
     * @param {bool} [params.postOnly] true or false, whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false, true or false whether the order is reduce-only
     * @param {float} [params.stopLossPrice] The price a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price a take profit order is triggered at
     * @param {float} [params.trailingTriggerPrice] the price to activate a trailing order, default uses the price argument or market price if price is not provided
     * @param {float} [params.trailingPercent] the percent to trail away from the current market price
     * @param {string} [params.triggerPriceType] 'MARK_PRICE' or 'CONTRACT_PRICE', default is 'CONTRACT_PRICE', the price type used to trigger stop orders
     * @param {bool} [params.closePosition] true or false, whether to close all positions after triggering, only supported in STOP_MARKET and TAKE_PROFIT_MARKET; not used with quantity;
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let orderRequest = this.createOrderRequest (symbol, type, side, amount, price, params);
        let wallet = 'W001';
        [ wallet, params ] = this.handleOptionAndParams (params, 'createOrder', 'wallet', wallet);
        orderRequest = this.extend (orderRequest, { 'wallet': wallet });
        const response = await this.privatePostV1SwapTradePlaceOrder (orderRequest);
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": {
        //             "wallet": "W001",
        //             "symbol": "ETH-USDT",
        //             "orderId": "7408875768086683648",
        //             "clientOrderId": "7408875768086683648",
        //             "price": "1000",
        //             "origQty": "10",
        //             "avgPrice": null,
        //             "executedQty": "0",
        //             "orderType": "LIMIT",
        //             "side": "BUY",
        //             "status": "NEW",
        //             "stopPrice": null,
        //             "activatePrice": null,
        //             "timeInForce": null,
        //             "workingType": "CONTRACT_PRICE",
        //             "positionSide": "BOTH",
        //             "priceProtect": false,
        //             "reduceOnly": false,
        //             "closePosition": false,
        //             "createTime": "1766413633367",
        //             "updateTime": "1766413633367"
        //         },
        //         "success": true
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            // 'positionSide': STRING Position direction, not required in single position mode, default and can only be BOTH; required in dual position mode, and can only choose LONG or SHORT
            // 'type': STRING Order type LIMIT / MARKET / STOP / TAKE_PROFIT / STOP_MARKET / TAKE_PROFIT_MARKET / TRAILING_STOP_MARKET
            // 'reduceOnly': BOOL true, false; defaults to false in non-dual mode; not accepted in dual mode; not supported when using closePosition.
            // 'quantity': DECIMAL Order quantity, not supported with closePosition.
            // 'price': DECIMAL Order price
            // 'clientOrderId': STRING User-defined order number, must not be repeated in pending orders. If blank, the system will assign automatically
            // 'stopPrice': DECIMAL Trigger price, only required for STOP, STOP_MARKET, TAKE_PROFIT, TAKE_PROFIT_MARKET
            // 'closePosition': BOOL true, false; all positions closed after triggering, only supported in STOP_MARKET and TAKE_PROFIT_MARKET; not used with quantity; has a self-closing effect, not used with reduceOnly
            // 'activationPrice': DECIMAL Trailing stop activation price, required for TRAILING_STOP_MARKET, default to current market price upon order (supports different workingType)
            // 'callbackRate': DECIMAL Trailing stop callback rate, can range from [0.1, 5], where 1 represents 1%, only required for TRAILING_STOP_MARKET
            // 'timeInForce': STRING Validity method GTC / FOK / POST_ONLY / IOC / TRAILING_STOP
            // 'workingType': STRING stopPrice trigger type: MARK_PRICE(marking price), CONTRACT_PRICE(latest contract price). Default CONTRACT_PRICE
        };
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        const isStopLossOrder = (stopLossPrice !== undefined);
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        const isTakeProfitOrder = (takeProfitPrice !== undefined);
        const trailingPercent = this.safeString (params, 'trailingPercent');
        const isTailingStopOrder = (trailingPercent !== undefined);
        let stopPrice = undefined;
        if (isStopLossOrder || isTakeProfitOrder) {
            stopPrice = isStopLossOrder ? stopLossPrice : takeProfitPrice;
            params = this.omit (params, [ 'stopLossPrice', 'takeProfitPrice' ]);
            request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
        } else if (isTailingStopOrder) {
            params = this.omit (params, [ 'trailingPercent' ]);
            request['callbackRate'] = trailingPercent;
            let trailingTriggerPrice = this.numberToString (price);
            [ trailingTriggerPrice, params ] = this.handleParamString (params, 'trailingTriggerPrice', trailingTriggerPrice);
            if (trailingTriggerPrice !== undefined) {
                request['activationPrice'] = this.priceToPrecision (symbol, trailingTriggerPrice);
                params = this.omit (params, [ 'trailingTriggerPrice' ]);
            }
        }
        type = type.toUpperCase ();
        const isMarketOrder = ((type === 'MARKET') || (type === 'STOP_MARKET') || (type === 'TAKE_PROFIT_MARKET') || (type === 'TRAILING_STOP_MARKET'));
        if (isMarketOrder) {
            if (type === 'MARKET') {
                if (isStopLossOrder) {
                    type = 'STOP_MARKET';
                } else if (isTakeProfitOrder) {
                    type = 'TAKE_PROFIT_MARKET';
                } else if (isTailingStopOrder) {
                    type = 'TRAILING_STOP_MARKET';
                }
            }
        } else {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
            request['price'] = this.priceToPrecision (symbol, price);
            if (isStopLossOrder) {
                type = 'STOP';
            } else if (isTakeProfitOrder) {
                type = 'TAKE_PROFIT';
            }
        }
        request['type'] = type;
        let hedged = false;
        [ hedged, params ] = this.handleOptionAndParams (params, 'createOrder', 'hedged', hedged);
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        if (hedged) {
            params = this.omit (params, 'reduceOnly');
            if (side === 'buy') {
                request['positionSide'] = reduceOnly ? 'SHORT' : 'LONG';
            } else if (side === 'sell') {
                request['positionSide'] = reduceOnly ? 'LONG' : 'SHORT';
            }
        }
        const closePosition = this.safeBool (params, 'closePosition', false);
        if (!closePosition) {
            params = this.omit (params, 'closePosition');
            request['quantity'] = this.amountToPrecision (symbol, amount);
        } else if ((type !== 'STOP_MARKET') && (type !== 'TAKE_PROFIT_MARKET')) {
            throw new NotSupported (this.id + ' createOrder() closePosition is only supported for stopLoss and takeProfit market orders');
        }
        let timeInForce = this.handleTimeInForce (params);
        let postOnly = false;
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, timeInForce === 'POST_ONLY', params);
        if (postOnly) {
            timeInForce = 'POST_ONLY';
        }
        if (timeInForce !== undefined) {
            request['timeInForce'] = timeInForce;
            params = this.omit (params, 'timeInForce');
        }
        if (isStopLossOrder || isTakeProfitOrder || isTailingStopOrder) {
            let workingType = 'CONTRACT_PRICE';
            [ workingType, params ] = this.handleOptionAndParams (params, 'createOrder', 'triggerPriceType', workingType);
            request['workingType'] = this.encodeWorkingType (workingType);
        }
        return this.extend (request, params);
    }

    encodeWorkingType (workingType: Str): Str {
        const types = {
            'markPrice': 'MARK_PRICE',
            'mark': 'MARK_PRICE',
            'contractPrice': 'CONTRACT_PRICE',
            'contract': 'CONTRACT_PRICE',
            'last': 'CONTRACT_PRICE',
        };
        return this.safeString (types, workingType, workingType);
    }

    /**
     * @method
     * @name bydfi#createOrders
     * @description create a list of trade orders
     * @see https://developers.bydfi.com/en/swap/trade#batch-order-placement
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrders (orders: OrderRequest[], params = {}) {
        await this.loadMarkets ();
        const length = orders.length;
        if (length > 5) {
            throw new BadRequest (this.id + ' createOrders() accepts a maximum of 5 orders');
        }
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const symbol = this.safeString (rawOrder, 'symbol');
            const type = this.safeString (rawOrder, 'type');
            const side = this.safeString (rawOrder, 'side');
            const amount = this.safeNumber (rawOrder, 'amount');
            const price = this.safeNumber (rawOrder, 'price');
            const orderParams = this.safeDict (rawOrder, 'params', {});
            const orderRequest = this.createOrderRequest (symbol, type, side, amount, price, orderParams);
            ordersRequests.push (orderRequest);
        }
        let wallet = 'W001';
        [ wallet, params ] = this.handleOptionAndParams (params, 'createOrder', 'wallet', wallet);
        const request: Dict = {
            'wallet': wallet,
            'orders': ordersRequests,
        };
        const response = await this.privatePostV1SwapTradeBatchPlaceOrder (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data);
    }

    /**
     * @method
     * @name bydfi#editOrder
     * @description edit a trade order
     * @see https://developers.bydfi.com/en/swap/trade#order-modification
     * @param {string} id order id (mandatory if params.clientOrderId is not provided)
     * @param {string} [symbol] unified symbol of the market to create an order in
     * @param {string} [type] not used by bydfi editOrder
     * @param {string} [side] 'buy' or 'sell'
     * @param {float} [amount] how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price for the order, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique identifier for the order (could be alternative to id)
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request = this.createEditOrderRequest (id, symbol, 'limit', side, amount, price, params);
        let wallet = 'W001';
        [ wallet, params ] = this.handleOptionAndParams (params, 'editOrder', 'wallet', wallet);
        request['wallet'] = wallet;
        const response = await this.privatePostV1SwapTradeEditOrder (request);
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data);
    }

    /**
     * @method
     * @name bydfi#editOrders
     * @description edit a list of trade orders
     * @see https://developers.bydfi.com/en/swap/trade#batch-order-modification
     * @param {Array} orders list of orders to edit, each object should contain the parameters required by editOrder, namely id, symbol, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async editOrders (orders: OrderRequest[], params = {}) : Promise<Order[]> {
        await this.loadMarkets ();
        const length = orders.length;
        if (length > 5) {
            throw new BadRequest (this.id + ' editOrders() accepts a maximum of 5 orders');
        }
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const id = this.safeString (rawOrder, 'id');
            const symbol = this.safeString (rawOrder, 'symbol');
            const side = this.safeString (rawOrder, 'side');
            const amount = this.safeNumber (rawOrder, 'amount');
            const price = this.safeNumber (rawOrder, 'price');
            const orderParams = this.safeDict (rawOrder, 'params', {});
            const orderRequest = this.createEditOrderRequest (id, symbol, 'limit', side, amount, price, orderParams);
            ordersRequests.push (orderRequest);
        }
        let wallet = 'W001';
        [ wallet, params ] = this.handleOptionAndParams (params, 'editOrder', 'wallet', wallet);
        const request: Dict = {
            'wallet': wallet,
            'editOrders': ordersRequests,
        };
        const response = await this.privatePostV1SwapTradeBatchEditOrder (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data);
    }

    createEditOrderRequest (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        const clientOrderId = this.safeString (params, 'clientOrderId');
        const request: Dict = {};
        if ((id === undefined) && (clientOrderId === undefined)) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an id argument or a clientOrderId parameter');
        } else if (id !== undefined) {
            request['orderId'] = id;
        }
        const market = this.market (symbol);
        request['symbol'] = market['id'];
        if (side !== undefined) {
            request['side'] = side.toUpperCase ();
        }
        if (amount !== undefined) {
            request['quantity'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        return this.extend (request, params);
    }

    /**
     * @method
     * @name bydfi#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://developers.bydfi.com/en/swap/trade#complete-order-cancellation
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let wallet = 'W001';
        [ wallet, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'wallet', wallet);
        const request: Dict = {
            'symbol': market['id'],
            'wallet': wallet,
        };
        const response = await this.privatePostV1SwapTradeCancelAllOrder (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": [
        //             {
        //                 "wallet": "W001",
        //                 "symbol": "ETH-USDT",
        //                 "orderId": "7408875768086683648",
        //                 "clientOrderId": "7408875768086683648",
        //                 "price": "1000",
        //                 "origQty": "10",
        //                 "avgPrice": "0",
        //                 "executedQty": "0",
        //                 "orderType": "LIMIT",
        //                 "side": "BUY",
        //                 "status": "CANCELED",
        //                 "stopPrice": null,
        //                 "activatePrice": null,
        //                 "timeInForce": null,
        //                 "workingType": "CONTRACT_PRICE",
        //                 "positionSide": "BOTH",
        //                 "priceProtect": false,
        //                 "reduceOnly": false,
        //                 "closePosition": false,
        //                 "createTime": "1766413633367",
        //                 "updateTime": "1766413633370"
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market);
    }

    /**
     * @method
     * @name bydfi#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://developers.bydfi.com/en/swap/trade#pending-order-query
     * @see https://developers.bydfi.com/en/swap/trade#planned-order-query
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true or false, whether to fetch conditional orders only
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let wallet = 'W001';
        [ wallet, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'wallet', wallet);
        const request: Dict = {
            'symbol': market['id'],
            'wallet': wallet,
        };
        let response = undefined;
        let trigger = false;
        [ trigger, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'trigger', trigger);
        if (!trigger) {
            //
            //     {
            //         "code": 200,
            //         "message": "success",
            //         "data": [
            //             {
            //                 "wallet": "W001",
            //                 "symbol": "ETH-USDC",
            //                 "orderId": "7408896083240091648",
            //                 "clientOrderId": "7408896083240091648",
            //                 "price": "999",
            //                 "origQty": "1",
            //                 "avgPrice": "0",
            //                 "executedQty": "0",
            //                 "orderType": "LIMIT",
            //                 "side": "BUY",
            //                 "status": "NEW",
            //                 "stopPrice": null,
            //                 "activatePrice": null,
            //                 "timeInForce": null,
            //                 "workingType": "CONTRACT_PRICE",
            //                 "positionSide": "BOTH",
            //                 "priceProtect": false,
            //                 "reduceOnly": false,
            //                 "closePosition": false,
            //                 "createTime": "1766418476877",
            //                 "updateTime": "1766418476880"
            //             }
            //         ],
            //         "success": true
            //     }
            //
            response = await this.privateGetV1SwapTradeOpenOrder (this.extend (request, params));
        } else {
            response = await this.privateGetV1SwapTradePlanOrder (this.extend (request, params));
        }
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name bydfi#fetchOpenOrder
     * @description fetch an open order by the id
     * @see https://developers.bydfi.com/en/swap/trade#pending-order-query
     * @see https://developers.bydfi.com/en/swap/trade#planned-order-query
     * @param {string} id order id (mandatory if params.clientOrderId is not provided)
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true or false, whether to fetch conditional orders only
     * @param {string} [params.clientOrderId] a unique identifier for the order (could be alternative to id)
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if ((id === undefined) && (clientOrderId === undefined)) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrder() requires an id argument or a clientOrderId parameter');
        } else if (id !== undefined) {
            request['orderId'] = id;
        }
        let wallet = 'W001';
        [ wallet, params ] = this.handleOptionAndParams (params, 'fetchOpenOrder', 'wallet', wallet);
        request['wallet'] = wallet;
        let response = undefined;
        let trigger = false;
        [ trigger, params ] = this.handleOptionAndParams (params, 'fetchOpenOrder', 'trigger', trigger);
        if (!trigger) {
            response = await this.privateGetV1SwapTradeOpenOrder (this.extend (request, params));
        } else {
            response = await this.privateGetV1SwapTradePlanOrder (this.extend (request, params));
        }
        const data = this.safeList (response, 'data', []);
        const order = this.safeDict (data, 0, {});
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name bydfi#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled and closed orders made by the user
     * @see https://developers.bydfi.com/en/swap/trade#historical-orders-query
     * @param {string} symbol unified market symbol of the closed orders
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the max number of closed orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest order
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet
     * @param {string} [params.orderType] order type ('LIMIT', 'MARKET', 'LIQ', 'LIMIT_CLOSE', 'MARKET_CLOSE', 'STOP', 'TAKE_PROFIT', 'STOP_MARKET', 'TAKE_PROFIT_MARKET' or 'TRAILING_STOP_MARKET')
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const paginate = this.safeBool (params, 'paginate', false);
        if (paginate) {
            const maxLimit = 500;
            params = this.omit (params, 'paginate');
            params = this.extend (params, { 'paginationDirection': 'backward' });
            const paginatedResponse = await this.fetchPaginatedCallDynamic ('fetchCanceledAndClosedOrders', symbol, since, limit, params, maxLimit, true);
            return this.sortBy (paginatedResponse, 'timestamp');
        }
        let contractType = 'FUTURE';
        [ contractType, params ] = this.handleOptionAndParams (params, 'fetchCanceledAndClosedOrders', 'contractType', contractType);
        const request: Dict = {
            'contractType': contractType,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        params = this.handleSinceAndUntil ('fetchCanceledAndClosedOrders', since, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV1SwapTradeHistoryOrder (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": [
        //             {
        //                 "orderId": "7408919189505597440",
        //                 "orderType": "MARKET",
        //                 "symbol": "ETH-USDC",
        //                 "origQty": "1",
        //                 "side": "BUY",
        //                 "positionSide": "BOTH",
        //                 "positionAvgPrice": null,
        //                 "positionVolume": null,
        //                 "positionType": null,
        //                 "reduceOnly": false,
        //                 "closePosition": false,
        //                 "action": null,
        //                 "price": "3032.45",
        //                 "avgPrice": "3032.45",
        //                 "brkPrice": null,
        //                 "dealVolume": null,
        //                 "status": "2",
        //                 "wallet": "W001",
        //                 "alias": null,
        //                 "contractId": null,
        //                 "mtime": "1766423985842",
        //                 "ctime": "1766423985840",
        //                 "fixedPrice": null,
        //                 "direction": null,
        //                 "triggerPrice": null,
        //                 "priceType": null,
        //                 "basePrecision": "8",
        //                 "baseShowPrecision": "2",
        //                 "strategyType": null,
        //                 "leverageLevel": 1,
        //                 "marginType": "CROSS",
        //                 "remark": null,
        //                 "callbackRate": null,
        //                 "activationPrice": null
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    handleSinceAndUntil (methodName: string, since: Int = undefined, params = {}): Dict {
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams2 (params, methodName, 'until', 'endTime');
        const now = this.milliseconds ();
        const sevenDays = 7 * 24 * 60 * 60 * 1000; // the maximum range is 7 days
        let startTime = since;
        if (startTime === undefined) {
            if (until === undefined) {
                // both since and until are undefined
                startTime = now - sevenDays;
                until = now;
            } else {
                // since is undefined but until is defined
                startTime = until - sevenDays;
            }
        } else if (until === undefined) {
            // until is undefined but since is defined
            const delta = now - startTime;
            if (delta > sevenDays) {
                until = startTime + sevenDays;
            } else {
                until = now;
            }
        }
        const request: Dict = {
            'startTime': startTime,
            'endTime': until,
        };
        return this.extend (request, params);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder, fetchOpenOrders, fetchOpenOrder
        //     {
        //         "wallet": "W001",
        //         "symbol": "ETH-USDT",
        //         "orderId": "7408875768086683648",
        //         "clientOrderId": "7408875768086683648",
        //         "price": "1000",
        //         "origQty": "10",
        //         "avgPrice": "0",
        //         "executedQty": "0",
        //         "orderType": "LIMIT",
        //         "side": "BUY",
        //         "status": "CANCELED",
        //         "stopPrice": null,
        //         "activatePrice": null,
        //         "timeInForce": null,
        //         "workingType": "CONTRACT_PRICE",
        //         "positionSide": "BOTH",
        //         "priceProtect": false,
        //         "reduceOnly": false,
        //         "closePosition": false,
        //         "createTime": "1766413633367",
        //         "updateTime": "1766413633370"
        //     }
        //
        // fetchCanceledAndClosedOrders
        //     {
        //         "orderId": "7408919189505597440",
        //         "orderType": "MARKET",
        //         "symbol": "ETH-USDC",
        //         "origQty": "1",
        //         "side": "BUY",
        //         "positionSide": "BOTH",
        //         "positionAvgPrice": null,
        //         "positionVolume": null,
        //         "positionType": null,
        //         "reduceOnly": false,
        //         "closePosition": false,
        //         "action": null,
        //         "price": "3032.45",
        //         "avgPrice": "3032.45",
        //         "brkPrice": null,
        //         "dealVolume": null,
        //         "status": "2",
        //         "wallet": "W001",
        //         "alias": null,
        //         "contractId": null,
        //         "mtime": "1766423985842",
        //         "ctime": "1766423985840",
        //         "fixedPrice": null,
        //         "direction": null,
        //         "triggerPrice": null,
        //         "priceType": null,
        //         "basePrecision": "8",
        //         "baseShowPrecision": "2",
        //         "strategyType": null,
        //         "leverageLevel": 1,
        //         "marginType": "CROSS",
        //         "remark": null,
        //         "callbackRate": null,
        //         "activationPrice": null
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (order, 'createTime', 'ctime');
        const rawType = this.safeString (order, 'orderType');
        const stopPrice = this.safeStringN (order, [ 'stopPrice', 'activatePrice', 'triggerPrice' ]);
        const isStopLossOrder = (rawType === 'STOP') || (rawType === 'STOP_MARKET') || (rawType === 'TRAILING_STOP_MARKET');
        const isTakeProfitOrder = (rawType === 'TAKE_PROFIT') || (rawType === 'TAKE_PROFIT_MARKET');
        const rawTimeInForce = this.safeString (order, 'timeInForce');
        const timeInForce = this.parseOrderTimeInForce (rawTimeInForce);
        let postOnly = undefined;
        if (timeInForce === 'PO') {
            postOnly = true;
        }
        const rawStatus = this.safeString (order, 'status');
        const fee = {};
        const quoteFee = this.safeNumber (order, 'quoteFee');
        if (quoteFee !== undefined) {
            fee['cost'] = quoteFee;
            fee['currency'] = market['quote'];
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeInteger2 (order, 'updateTime', 'mtime'),
            'status': this.parseOrderStatus (rawStatus),
            'symbol': market['symbol'],
            'type': this.parseOrderType (rawType),
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': this.safeBool (order, 'reduceOnly'),
            'side': this.safeStringLower (order, 'side'),
            'price': this.safeString (order, 'price'),
            'triggerPrice': stopPrice,
            'stopLossPrice': isStopLossOrder ? stopPrice : undefined,
            'takeProfitPrice': isTakeProfitOrder ? stopPrice : undefined,
            'amount': this.safeString (order, 'origQty'),
            'filled': this.safeString (order, 'executedQty'),
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': fee,
            'average': this.omitZero (this.safeString (order, 'avgPrice')),
        }, market);
    }

    parseOrderType (type: Str): Str {
        const types = {
            'LIMIT': 'limit',
            'MARKET': 'market',
            'STOP': 'limit',
            'STOP_MARKET': 'market',
            'TAKE_PROFIT': 'limit',
            'TAKE_PROFIT_MARKET': 'market',
            'TRAILING_STOP_MARKET': 'market',
        };
        return this.safeString (types, type, type);
    }

    parseOrderTimeInForce (timeInForce: Str): Str {
        const timeInForces = {
            'GTC': 'GTC',
            'FOK': 'FOK',
            'IOC': 'IOC',
            'POST_ONLY': 'PO',
            'TRAILING_STOP': 'IOC',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseOrderStatus (status: Str): Str {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'EXPIRED': 'canceled',
            'PART_FILLED_CANCELLED': 'canceled',
            'CANCELED': 'canceled',
            '2': 'closed',
            '4': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name bydfi#setLeverage
     * @description set the level of leverage for a market
     * @see https://developers.bydfi.com/en/swap/trade#set-leverage-for-single-trading-pair
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: int, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let wallet = 'W001';
        [ wallet, params ] = this.handleOptionAndParams (params, 'setLeverage', 'wallet', wallet);
        const request: Dict = {
            'symbol': market['id'],
            'leverage': leverage,
            'wallet': wallet,
        };
        const response = await this.privatePostV1SwapTradeLeverage (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        return data;
    }

    /**
     * @method
     * @name bydfi#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://developers.bydfi.com/en/swap/trade#get-leverage-for-single-trading-pair
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let wallet = 'W001';
        [ wallet, params ] = this.handleOptionAndParams (params, 'fetchLeverage', 'wallet', wallet);
        const request: Dict = {
            'symbol': market['id'],
            'wallet': wallet,
        };
        const response = await this.privateGetV1SwapTradeLeverage (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": {
        //             "symbol": "ETH-USDC",
        //             "leverage": 1,
        //             "maxNotionalValue": "100000000"
        //         },
        //         "success": true
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseLeverage (data, market);
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        const marketId = this.safeString (leverage, 'symbol');
        return {
            'info': leverage,
            'symbol': this.safeSymbol (marketId, market),
            'marginMode': undefined,
            'longLeverage': this.safeInteger (leverage, 'leverage'),
            'shortLeverage': this.safeInteger (leverage, 'leverage'),
        } as Leverage;
    }

    /**
     * @method
     * @name bydfi#fetchPositions
     * @description fetch all open positions
     * @see https://developers.bydfi.com/en/swap/trade#positions-query
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.settleCoin] the settlement currency (USDT or USDC or USD)
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        let contractType = 'FUTURE';
        [ contractType, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'contractType', contractType);
        const request: Dict = {
            'contractType': contractType,
        };
        const response = await this.privateGetV1SwapTradePositions (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": [
        //             {
        //                 "symbol": "ETH-USDC",
        //                 "side": "BUY",
        //                 "volume": "0.001",
        //                 "avgPrice": "3032.45",
        //                 "liqPrice": "0",
        //                 "markPrice": "3032.37",
        //                 "unPnl": "-0.00008",
        //                 "positionMargin": "0",
        //                 "settleCoin": "USDC",
        //                 "im": "3.03245",
        //                 "mm": "0.007581125"
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parsePositions (data, symbols);
    }

    /**
     * @method
     * @name bydfi#fetchPositionsForSymbol
     * @description fetch open positions for a single market
     * @see https://developers.bydfi.com/en/swap/trade#positions-query
     * @description fetch all open positions for specific symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositionsForSymbol (symbol: string, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let contractType = 'FUTURE';
        [ contractType, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'contractType', contractType);
        const request: Dict = {
            'contractType': contractType,
            'symbol': market['id'],
        };
        const response = await this.privateGetV1SwapTradePositions (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parsePositions (data, [ market['symbol'] ]);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        // fetchPositions, fetchPositionsForSymbol
        //     {
        //         "symbol": "ETH-USDC",
        //         "side": "BUY",
        //         "volume": "0.001",
        //         "avgPrice": "3032.45",
        //         "liqPrice": "0",
        //         "markPrice": "3032.37",
        //         "unPnl": "-0.00008",
        //         "positionMargin": "0",
        //         "settleCoin": "USDC",
        //         "im": "3.03245",
        //         "mm": "0.007581125"
        //     }
        //
        // fetchPositionsHistory
        //     {
        //         "id": "16788366",
        //         "wallet": "W001",
        //         "currency": "USDC",
        //         "symbol": "ETH-USDC",
        //         "side": "BUY",
        //         "positionSide": "BOTH",
        //         "leverage": 1,
        //         "avgOpenPositionPrice": "3032.45",
        //         "openPositionVolume": "1",
        //         "openCount": 1,
        //         "highPrice": "3032.45",
        //         "lowPrice": "2953.67",
        //         "avgClosePositionPrice": "2953.67",
        //         "closePositionVolume": "1",
        //         "closePositionCost": "2.95367",
        //         "closeCount": 1,
        //         "positionProfits": "-0.07878",
        //         "lossBonus": "0",
        //         "capitalFeeTotal": "-0.00026361",
        //         "capitalFeeOutCash": "-0.00026361",
        //         "capitalFeeInCash": "0",
        //         "capitalFeeBonus": "0",
        //         "openFeeTotal": "-0.00181947",
        //         "openFeeBonus": "0",
        //         "closeFeeTotal": "-0.00177221",
        //         "closeFeeBonus": "0",
        //         "liqLoss": "0",
        //         "liqClosed": false,
        //         "sequence": "53685341336",
        //         "updateTime": "1766494929423",
        //         "createTime": "1766423985842"
        //     }
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const buyOrSell = this.safeString (position, 'side');
        const rawPositionSide = this.safeStringLower (position, 'positionSide');
        let positionSide = this.parsePositionSide (buyOrSell);
        let hedged = undefined;
        let isFetchPositionsHistory = false;
        if (rawPositionSide !== undefined) {
            isFetchPositionsHistory = true;
            if (rawPositionSide !== 'both') {
                positionSide = rawPositionSide;
                hedged = true;
            } else {
                hedged = false;
            }
        }
        const contractSize = this.safeString (market, 'contractSize');
        let contracts = this.safeString2 (position, 'volume', 'openPositionVolume');
        if (!isFetchPositionsHistory) {
            // in fetchPositions, the 'volume' is in base currency units, need to convert to contracts
            contracts = Precise.stringDiv (contracts, contractSize);
        }
        const timestamp = this.safeInteger (position, 'createTime');
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'id'),
            'symbol': market['symbol'],
            'entryPrice': this.parseNumber (this.safeString2 (position, 'avgOpenPositionPrice', 'avgPrice')),
            'markPrice': this.parseNumber (this.safeString (position, 'markPrice')),
            'lastPrice': this.parseNumber (this.safeString (position, 'avgClosePositionPrice')),
            'notional': this.parseNumber (this.safeString (position, 'closePositionCost')),
            'collateral': undefined,
            'unrealizedPnl': this.parseNumber (this.safeString (position, 'unPnl')),
            'realizedPnl': this.parseNumber (this.safeString (position, 'positionProfits')),
            'side': positionSide,
            'contracts': this.parseNumber (contracts),
            'contractSize': this.parseNumber (contractSize),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': this.safeInteger (position, 'updateTime'),
            'hedged': hedged,
            'maintenanceMargin': this.parseNumber (this.safeString (position, 'mm')),
            'maintenanceMarginPercentage': undefined,
            'initialMargin': this.parseNumber (this.safeString (position, 'im')),
            'initialMarginPercentage': undefined,
            'leverage': this.parseNumber (this.safeString (position, 'leverage')),
            'liquidationPrice': this.parseNumber (this.safeString (position, 'liqPrice')),
            'marginRatio': undefined,
            'marginMode': undefined,
            'percentage': undefined,
        });
    }

    parsePositionSide (side: Str): Str {
        const sides = {
            'BUY': 'long',
            'SELL': 'short',
        };
        return this.safeString (sides, side, side);
    }

    /**
     * @method
     * @name bydfi#fetchPositionHistory
     * @description fetches historical positions
     * @see https://developers.bydfi.com/en/swap/trade#query-historical-position-profit-and-loss-records
     * @param {string} symbol a unified market symbol
     * @param {int} [since] timestamp in ms of the earliest position to fetch , params["until"] - since <= 7 days
     * @param {int} [limit] the maximum amount of records to fetch (default 500, max 500)
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest position to fetch , params["until"] - since <= 7 days
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositionHistory (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let contractType = 'FUTURE';
        [ contractType, params ] = this.handleOptionAndParams (params, 'fetchPositionsHistory', 'contractType', contractType);
        const request: Dict = {
            'symbol': market['id'],
            'contractType': contractType,
        };
        params = this.handleSinceAndUntil ('fetchPositionsHistory', since, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV1SwapTradePositionHistory (this.extend (request, params));
        //
        //
        const data = this.safeList (response, 'data', []);
        const positions = this.parsePositions (data);
        return this.filterBySinceLimit (positions, since, limit);
    }

    /**
     * @method
     * @name bydfi#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://developers.bydfi.com/en/swap/trade#query-historical-position-profit-and-loss-records
     * @param {string[]} symbols a list of unified market symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch , params["until"] - since <= 7 days
     * @param {int} [limit] the maximum amount of records to fetch (default 500, max 500)
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest position to fetch , params["until"] - since <= 7 days
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositionsHistory (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        let contractType = 'FUTURE';
        [ contractType, params ] = this.handleOptionAndParams (params, 'fetchPositionsHistory', 'contractType', contractType);
        const request: Dict = {
            'contractType': contractType,
        };
        params = this.handleSinceAndUntil ('fetchPositionsHistory', since, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV1SwapTradePositionHistory (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": [
        //             {
        //                 "id": "16788366",
        //                 "wallet": "W001",
        //                 "currency": "USDC",
        //                 "symbol": "ETH-USDC",
        //                 "side": "BUY",
        //                 "positionSide": "BOTH",
        //                 "leverage": 1,
        //                 "avgOpenPositionPrice": "3032.45",
        //                 "openPositionVolume": "1",
        //                 "openCount": 1,
        //                 "highPrice": "3032.45",
        //                 "lowPrice": "2953.67",
        //                 "avgClosePositionPrice": "2953.67",
        //                 "closePositionVolume": "1",
        //                 "closePositionCost": "2.95367",
        //                 "closeCount": 1,
        //                 "positionProfits": "-0.07878",
        //                 "lossBonus": "0",
        //                 "capitalFeeTotal": "-0.00026361",
        //                 "capitalFeeOutCash": "-0.00026361",
        //                 "capitalFeeInCash": "0",
        //                 "capitalFeeBonus": "0",
        //                 "openFeeTotal": "-0.00181947",
        //                 "openFeeBonus": "0",
        //                 "closeFeeTotal": "-0.00177221",
        //                 "closeFeeBonus": "0",
        //                 "liqLoss": "0",
        //                 "liqClosed": false,
        //                 "sequence": "53685341336",
        //                 "updateTime": "1766494929423",
        //                 "createTime": "1766423985842"
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const positions = this.parsePositions (data, symbols);
        return this.filterBySinceLimit (positions, since, limit);
    }

    /**
     * @method
     * @name bydfi#fetchMarginMode
     * @description fetches the margin mode of a trading pair
     * @see https://developers.bydfi.com/en/swap/user#margin-mode-query
     * @param {string} symbol unified symbol of the market to fetch the margin mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    async fetchMarginMode (symbol: string, params = {}): Promise<MarginMode> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let contractType = 'FUTURE';
        [ contractType, params ] = this.handleOptionAndParams (params, 'fetchMarginMode', 'contractType', contractType);
        let wallet = 'W001';
        [ wallet, params ] = this.handleOptionAndParams (params, 'fetchMarginMode', 'wallet', wallet);
        const request: Dict = {
            'contractType': contractType,
            'symbol': market['id'],
            'wallet': wallet,
        };
        const response = await this.privateGetV1SwapUserDataAssetsMargin (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": {
        //             "wallet": "W001",
        //             "symbol": "ETH-USDC",
        //             "marginType": "CROSS"
        //         },
        //         "success": true
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseMarginMode (data, market);
    }

    parseMarginMode (marginMode: Dict, market: Market = undefined): MarginMode {
        const marketId = this.safeString (marginMode, 'symbol');
        return {
            'info': marginMode,
            'symbol': this.safeSymbol (marketId, market),
            'marginMode': this.safeStringLower (marginMode, 'marginType'),
        } as MarginMode;
    }

    /**
     * @method
     * @name bydfi#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://developers.bydfi.com/en/swap/user#change-margin-type-cross-margin
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} response from the exchange
     */
    async setMarginMode (marginMode: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        marginMode = marginMode.toLowerCase ();
        if (marginMode !== 'isolated' && marginMode !== 'cross') {
            throw new BadRequest (this.id + ' setMarginMode() marginMode argument should be isolated or cross');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let contractType = 'FUTURE';
        [ contractType, params ] = this.handleOptionAndParams (params, 'fetchMarginMode', 'contractType', contractType);
        let wallet = 'W001';
        [ wallet, params ] = this.handleOptionAndParams (params, 'fetchMarginMode', 'wallet', wallet);
        const request: Dict = {
            'contractType': contractType,
            'symbol': market['id'],
            'marginType': marginMode.toUpperCase (),
            'wallet': wallet,
        };
        return await this.privatePostV1SwapUserDataMarginType (this.extend (request, params));
    }

    /**
     * @method
     * @name bydfi#setPositionMode
     * @description set hedged to true or false for a market, hedged for bydfi is set identically for all markets with same settle currency
     * @see https://developers.bydfi.com/en/swap/user#change-position-mode-dual
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} [symbol] not used by bydfi setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @param {string} [params.settleCoin] The settlement currency - USDT or USDC or USD (default is USDT)
     * @returns {object} response from the exchange
     */
    async setPositionMode (hedged: boolean, symbol: Str = undefined, params = {}) {
        if (symbol !== undefined) {
            throw new NotSupported (this.id + ' setPositionMode() does not support a symbol argument. The position mode is set identically for all markets with same settle currency');
        }
        await this.loadMarkets ();
        const positionType = hedged ? 'HEDGE' : 'ONEWAY';
        let wallet = 'W001';
        [ wallet, params ] = this.handleOptionAndParams (params, 'setPositionMode', 'wallet', wallet);
        let contractType = 'FUTURE';
        [ contractType, params ] = this.handleOptionAndParams (params, 'setPositionMode', 'contractType', contractType);
        let settleCoin = 'USDT';
        [ settleCoin, params ] = this.handleOptionAndParams (params, 'setPositionMode', 'settleCoin', settleCoin);
        const request: Dict = {
            'contractType': contractType,
            'wallet': wallet,
            'positionType': positionType,
            'settleCoin': settleCoin,
        };
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "success": true
        //     }
        //
        return await this.privatePostV1SwapUserDataPositionSideDual (this.extend (request, params));
    }

    /**
     * @method
     * @name bydfi#fetchPositionMode
     * @description fetchs the position mode, hedged or one way, hedged for bydfi is set identically for all markets with same settle currency
     * @see https://developers.bydfi.com/en/swap/user#get-position-mode
     * @param {string} [symbol] unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @param {string} [params.settleCoin] The settlement currency - USDT or USDC or USD (default is USDT or settle currency of the market if market is provided)
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    async fetchPositionMode (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        let wallet = 'W001';
        [ wallet, params ] = this.handleOptionAndParams (params, 'fetchPositionMode', 'wallet', wallet);
        let contractType = 'FUTURE';
        [ contractType, params ] = this.handleOptionAndParams (params, 'fetchPositionMode', 'contractType', contractType);
        let settleCoin = 'USDT';
        if (symbol === undefined) {
            [ settleCoin, params ] = this.handleOptionAndParams (params, 'fetchPositionMode', 'settleCoin', settleCoin);
        } else {
            const market = this.market (symbol);
            settleCoin = market['settleId'];
        }
        const request: Dict = {
            'contractType': contractType,
            'settleCoin': settleCoin,
            'wallet': wallet,
        };
        const response = await this.privateGetV1SwapUserDataPositionSideDual (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": {
        //             "wallet": "W001",
        //             "contractType": "FUTURE",
        //             "settleCoin": "USDT",
        //             "positionType": "HEDGE",
        //             "unitModel": 2,
        //             "pricingModel": "FLAG",
        //             "priceProtection": "CLOSE",
        //             "totalWallet": 2
        //         },
        //         "success": true
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const hedged = this.safeString (data, 'positionType') === 'HEDGE';
        return {
            'info': response,
            'hedged': hedged,
        };
    }

    /**
     * @method
     * @name bydfi#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://developers.bydfi.com/en/account#asset-inquiry
     * @see https://developers.bydfi.com/en/swap/user#asset-query
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountType] the type of account to fetch the balance for, either 'spot' or 'swap'  or 'funding' (default is 'spot')
     * @param {string} [params.wallet] *swap only* The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @param {string} [params.asset] currency id for the balance to fetch
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let accountType = 'spot';
        [ accountType, params ] = this.handleOptionAndParams2 (params, 'fetchBalance', 'accountType', 'type', accountType);
        const request: Dict = {};
        let response = undefined;
        if (accountType !== 'swap') {
            const options = this.safeDict (this.options, 'accountsByType', {});
            const parsedAccountType = this.safeString (options, accountType, accountType);
            request['walletType'] = parsedAccountType;
            //
            //     {
            //         "code": 200,
            //         "message": "success",
            //         "data": [
            //             {
            //                 "walletType": "spot",
            //                 "asset": "USDC",
            //                 "total": "100",
            //                 "available": "100",
            //                 "frozen": "0"
            //             }
            //         ],
            //         "success": true
            //     }
            //
            response = await this.privateGetV1AccountAssets (this.extend (request, params));
        } else {
            let wallet = 'W001';
            [ wallet, params ] = this.handleOptionAndParams (params, 'fetchBalance', 'wallet', wallet);
            request['wallet'] = wallet;
            //
            //     {
            //         "code": 200,
            //         "message": "success",
            //         "data": [
            //             {
            //                 "wallet": "W001",
            //                 "asset": "USDT",
            //                 "balance": "0",
            //                 "frozen": "0",
            //                 "positionMargin": "0",
            //                 "availableBalance": "0",
            //                 "canWithdrawAmount": "0",
            //                 "bonusAmount": "0"
            //             },
            //             {
            //                 "wallet": "W001",
            //                 "asset": "USDC",
            //                 "balance": "99.99505828",
            //                 "frozen": "4.0024",
            //                 "positionMargin": "2.95342",
            //                 "availableBalance": "92.96020828",
            //                 "canWithdrawAmount": "92.96020828",
            //                 "bonusAmount": "0"
            //             }
            //         ],
            //         "success": true
            //     }
            response = await this.privateGetV1SwapAccountBalance (this.extend (request, params));
        }
        const data = this.safeList (response, 'data', []);
        return this.parseBalance (data);
    }

    parseBalance (response): Balances {
        const timestamp = this.milliseconds ();
        const result: Dict = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const symbol = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (symbol);
            const account = this.account ();
            account['total'] = this.safeString2 (balance, 'total', 'balance');
            account['free'] = this.safeString2 (balance, 'available', 'availableBalance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name budfi#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://developers.bydfi.com/en/account#asset-transfer-between-accounts
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount 'spot', 'funding', or 'swap'
     * @param {string} toAccount 'spot', 'funding', or 'swap'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount:string, params = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeDict (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
        const request: Dict = {
            'asset': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'fromType': fromId,
            'toType': toId,
        };
        const response = await this.privatePostV1AccountTransfer (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "success": true
        //     }
        //
        const transfer = this.parseTransfer (response, currency);
        const transferOptions = this.safeDict (this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeBool (transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            const timestamp = this.milliseconds ();
            transfer['timestamp'] = timestamp;
            transfer['datetime'] = this.iso8601 (timestamp);
            transfer['currency'] = code;
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
            transfer['amount'] = amount;
        }
        return transfer;
    }

    /**
     * @method
     * @name bydfi#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://developers.bydfi.com/en/account#query-wallet-transfer-records
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve (default 10)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransfers() requires a code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const paginate = this.safeBool (params, 'paginate', false);
        if (paginate) {
            const maxLimit = 50;
            params = this.omit (params, 'paginate');
            params = this.extend (params, { 'paginationDirection': 'backward' });
            const paginatedResponse = await this.fetchPaginatedCallDynamic ('fetchTransfers', currency['code'], since, limit, params, maxLimit, true);
            return this.sortBy (paginatedResponse, 'timestamp');
        }
        const request: Dict = {
            'asset': currency['id'],
        };
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams2 (params, 'fetchTransfers', 'until', 'endTime');
        if (until === undefined) {
            until = this.milliseconds (); // exchange requires endTime
        }
        if (since === undefined) {
            since = 1; // exchange requires startTime but allows any value
        }
        request['startTime'] = since;
        request['endTime'] = until;
        if (limit !== undefined) {
            request['rows'] = limit;
        }
        const response = await this.privateGetV1AccountTransferRecords (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "data": [
        //             {
        //                 "orderId": "1209991065294581760",
        //                 "txId": "6km5fRK83Gwdp43HA479DW1Colh2pKyS",
        //                 "sourceWallet": "SPOT",
        //                 "targetWallet": "SWAP",
        //                 "asset": "USDC",
        //                 "amount": "100",
        //                 "status": "SUCCESS",
        //                 "timestamp": 1766413950000
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTransfers (data, currency, since, limit);
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        //
        // transfer
        //     {
        //         "code": 200,
        //         "message": "success",
        //         "success": true
        //     }
        //
        // fetchTransfers
        //     {
        //         "orderId": "1209991065294581760",
        //         "txId": "6km5fRK83Gwdp43HA479DW1Colh2pKyS",
        //         "sourceWallet": "SPOT",
        //         "targetWallet": "SWAP",
        //         "asset": "USDC",
        //         "amount": "100",
        //         "status": "SUCCESS",
        //         "timestamp": 1766413950000
        //     }
        //
        const status = this.safeStringUpper2 (transfer, 'message', 'status');
        const accountsById = this.safeDict (this.options, 'accountsById', {});
        const fromId = this.safeStringUpper (transfer, 'sourceWallet');
        const toId = this.safeStringUpper (transfer, 'targetWallet');
        const fromAccount = this.safeString (accountsById, fromId, fromId);
        const toAccount = this.safeString (accountsById, toId, toId);
        const timestamp = this.safeInteger (transfer, 'timestamp');
        const currencyId = this.safeString (transfer, 'asset');
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'txId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.paraseTransferStatus (status),
        };
    }

    paraseTransferStatus (status: Str): Str {
        const statuses = {
            'SUCCESS': 'ok',
            'WAIT': 'pending',
            'FAILED': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name bydfi#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://developers.bydfi.com/en/spot/account#query-deposit-records
     * @param {string} code unified currency code (mandatory)
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        return await this.fetchTransactionsHelper ('deposit', code, since, limit, params);
    }

    /**
     * @method
     * @name bydfi#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://developers.bydfi.com/en/spot/account#query-withdrawal-records
     * @param {string} code unified currency code (mandatory)
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        return await this.fetchTransactionsHelper ('withdrawal', code, since, limit, params);
    }

    async fetchTransactionsHelper (type, code, since, limit, params) {
        const methodName = (type === 'deposit') ? 'fetchDeposits' : 'fetchWithdrawals';
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const paginate = this.safeBool (params, 'paginate', false);
        if (paginate) {
            const maxLimit = 50;
            params = this.omit (params, 'paginate');
            params = this.extend (params, { 'paginationDirection': 'backward' });
            const paginatedResponse = await this.fetchPaginatedCallDynamic (methodName, currency['code'], since, limit, params, maxLimit, true);
            return this.sortBy (paginatedResponse, 'timestamp');
        }
        const request: Dict = {
            'asset': currency['id'],
        };
        let until = undefined;
        [ until, params ] = this.handleOptionAndParams2 (params, 'fetchTransfers', 'until', 'endTime');
        const now = this.milliseconds ();
        const sevenDays = 7 * 24 * 60 * 60 * 1000; // the maximum range is 7 days
        let startTime = since;
        if (startTime === undefined) {
            if (until === undefined) {
                // both since and until are undefined
                startTime = now - sevenDays;
                until = now;
            } else {
                // since is undefined but until is defined
                startTime = until - sevenDays;
            }
        } else if (until === undefined) {
            // until is undefined but since is defined
            const delta = now - startTime;
            if (delta > sevenDays) {
                until = startTime + sevenDays;
            } else {
                until = now;
            }
        }
        request['startTime'] = startTime;
        request['endTime'] = until;
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (type === 'deposit') {
            //
            //     {
            //         "code": 200,
            //         "message": "success",
            //         "data": [
            //             {
            //                 "orderId": "1208864446987255809",
            //                 "asset": "USDC",
            //                 "amount": "200",
            //                 "status": "SUCCESS",
            //                 "txId": "0xd059a82a55ffc737722bd23c1ef3db2884ce8525b72ff0b3c038b430ce0c8ca5",
            //                 "network": "ETH",
            //                 "address": "0x8346b46f6aa9843c09f79f1c170a37aca83c8fcd",
            //                 "addressTag": null,
            //                 "finishTime": 1766145475000,
            //                 "createTime": 1766145344000
            //             }
            //         ],
            //         "success": true
            //     }
            //
            response = await this.privateGetV1SpotDepositRecords (this.extend (request, params));
        } else {
            //
            // todo check after withdrawal
            //
            response = await this.privateGetV1SpotWithdrawRecords (this.extend (request, params));
        }
        const data = this.safeList (response, 'data', []);
        const transactionParams: Dict = {
            'type': type,
        };
        params = this.extend (params, transactionParams);
        return this.parseTransactions (data, currency, since, limit, params);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // fetchDeposits
        //     {
        //         "orderId": "1208864446987255809",
        //         "asset": "USDC",
        //         "amount": "200",
        //         "status": "SUCCESS",
        //         "txId": "0xd059a82a55ffc737722bd23c1ef3db2884ce8525b72ff0b3c038b430ce0c8ca5",
        //         "network": "ETH",
        //         "address": "0x8346b46f6aa9843c09f79f1c170a37aca83c8fcd",
        //         "addressTag": null,
        //         "finishTime": 1766145475000,
        //         "createTime": 1766145344000
        //     }
        //
        const currencyId = this.safeString (transaction, 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        const rawStatus = this.safeStringLower (transaction, 'status');
        const timestamp = this.safeInteger (transaction, 'createTime');
        let fee = undefined;
        const feeCost = this.safeNumber (transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
            };
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'orderId'),
            'txid': this.safeString (transaction, 'txId'),
            'type': undefined,
            'currency': code,
            'network': this.networkIdToCode (this.safeString (transaction, 'network')),
            'amount': this.safeNumber (transaction, 'amount'),
            'status': this.parseTransactionStatus (rawStatus),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': this.safeString (transaction, 'address'),
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': this.safeString (transaction, 'addressTag'),
            'tagFrom': undefined,
            'tagTo': undefined,
            'updated': this.safeInteger (transaction, 'finishTime'),
            'comment': undefined,
            'fee': fee,
            'internal': false,
        };
    }

    parseTransactionStatus (status: Str): Str {
        const statuses = {
            'success': 'ok',
            'wait': 'pending',
            'failed': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api: any = 'public', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        let url = this.urls['api'][api];
        let endpoint = '/' + path;
        let query = '';
        const sortedParams = this.keysort (params);
        if (method === 'GET') {
            query = this.urlencode (sortedParams);
            if (query.length !== 0) {
                endpoint += '?' + query;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            if (method === 'GET') {
                const payload = this.apiKey + timestamp + query;
                const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
                headers = {
                    'X-API-KEY': this.apiKey,
                    'X-API-TIMESTAMP': timestamp,
                    'X-API-SIGNATURE': signature,
                };
            } else {
                body = this.json (sortedParams);
                const payload = this.apiKey + timestamp + body;
                const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
                headers = {
                    'Content-Type': 'application/json',
                    'X-API-KEY': this.apiKey,
                    'X-API-TIMESTAMP': timestamp,
                    'X-API-SIGNATURE': signature,
                };
            }
        }
        url += endpoint;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         "code": 101107,
        //         "message": "Requires transaction permissions"
        //     }
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        if (code !== '200') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
