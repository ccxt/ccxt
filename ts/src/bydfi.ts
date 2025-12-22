
//  ---------------------------------------------------------------------------

import { ArgumentsRequired, ExchangeError, NotSupported, PermissionDenied } from '../ccxt.js';
import Exchange from './abstract/bydfi.js';
// import { BadRequest } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Dict, FundingRate, FundingRateHistory, Int, int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Trade, Ticker, Tickers } from './base/types.js';

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
            'pro': false, // todo set to true when pro file will be implemented
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
                'cancelAllOrders': false,
                'cancelOrder': true,
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
                'createOrders': false,
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
                'editOrder': 'emulated',
                'editOrders': false,
                'editOrderWithClientOrderId': false,
                'fetchAccounts': false,
                'fetchBalance': true,
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
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
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
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
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
                'logo': '', // todo
                'api': {
                    'public': 'https://api.bydfi.com/api',
                    'private': 'https://api.bydfi.com/api',
                },
                'www': 'https://bydfi.com/',
                'doc': 'https://developers.bydfi.com/en/',
            },
            'fees': {
            },
            'api': {
                'public': {
                    'get': {
                        'v1/public/api_limits': 1, // https://developers.bydfi.com/en/public#inquiry-into-api-rate-limit-configuration
                        'v1/swap/market/exchange_info': 1, // done
                        'v1/swap/market/depth': 1, // done
                        'v1/swap/market/trades': 1, // done
                        'v1/swap/market/klines': 1, // done
                        'v1/swap/market/ticker/24hr': 1, // done
                        'v1/swap/market/ticker/price': 1, // https://developers.bydfi.com/en/swap/market#latest-price
                        'v1/swap/market/mark_price': 1, // https://developers.bydfi.com/en/swap/market#mark-price
                        'v1/swap/market/funding_rate': 1, // done
                        'v1/swap/market/funding_rate_history': 1, // done
                        'v1/swap/market/risk_limit': 1, // https://developers.bydfi.com/en/swap/market#risk-limit
                    },
                },
                'private': {
                    'get': {
                        'v1/account/assets': 1, // https://developers.bydfi.com/en/account
                        'v1/account/transfer_records': 1, // https://developers.bydfi.com/en/account#query-wallet-transfer-records
                        'v1/spot/deposit_records': 1, // https://developers.bydfi.com/en/spot/account#query-deposit-records
                        'v1/spot/withdraw_records': 1, // https://developers.bydfi.com/en/spot/account#query-withdrawal-records
                        'v1/swap/trade/open_order': 1, // https://developers.bydfi.com/en/swap/trade#pending-order-query
                        'v1/swap/trade/plan_order': 1, // https://developers.bydfi.com/en/swap/trade#planned-order-query
                        'v1/swap/trade/leverage': 1, // https://developers.bydfi.com/en/swap/trade#get-leverage-for-single-trading-pair
                        'v1/swap/trade/history_order': 1, // https://developers.bydfi.com/en/swap/trade#historical-orders-query
                        'v1/swap/trade/history_trade': 1, // https://developers.bydfi.com/en/swap/trade#historical-trades-query
                        'v1/swap/trade/position_history': 1, // https://developers.bydfi.com/en/swap/trade#query-historical-position-profit-and-loss-records
                        'v1/swap/trade/positions': 1, // https://developers.bydfi.com/en/swap/trade#positions-query
                        'v1/swap/account/balance': 1, // https://developers.bydfi.com/en/swap/user#asset-query
                        'v1/swap/user_data/assets_margin': 1, // https://developers.bydfi.com/en/swap/user#margin-mode-query
                        'v1/swap/user_data/position_side/dual': 1, // https://developers.bydfi.com/en/swap/user#get-position-mode
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
                        'v1/account/transfer': 1, // https://developers.bydfi.com/en/account#asset-transfer-between-accounts
                        'v1/swap/trade/place_order': 1, // done
                        'v1/swap/trade/batch_place_order': 1, // https://developers.bydfi.com/en/swap/trade#batch-order-placement
                        'v1/swap/trade/edit_order': 1, // https://developers.bydfi.com/en/swap/trade#order-modification
                        'v1/swap/trade/batch_edit_order': 1, // https://developers.bydfi.com/en/swap/trade#batch-order-modification
                        'v1/swap/trade/cancel_all_order': 1, // https://developers.bydfi.com/en/swap/trade#complete-order-cancellation
                        'v1/swap/trade/leverage': 1, // https://developers.bydfi.com/en/swap/trade#set-leverage-for-single-trading-pair
                        'v1/swap/trade/batch_leverage_margin': 1, // https://developers.bydfi.com/en/swap/trade#modify-leverage-and-margin-type-with-one-click
                        'v1/swap/user_data/margin_type': 1, // https://developers.bydfi.com/en/swap/user#change-margin-type-cross-margin
                        'v1/swap/user_data/position_side/dual': 1, // https://developers.bydfi.com/en/swap/user#change-position-mode-dual
                        'v1/agent/internal_withdrawal': 1, // https://developers.bydfi.com/en/agent/#internal-withdrawal
                    },
                },
            },
            'features': {
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
                    'Requires transaction permissions': PermissionDenied, // {"code":101107,"message":"Requires transaction permissions"}
                    // {"code":600,"message":"The parameter 'startTime' is missing"}
                    // {"code":101001,"message":"Apikey doesn't exist!"}
                },
                'broad': {
                },
            },
            'commonCurrencies': {
            },
            'options': {
                'timeInForce': {
                    'GTC': 'GTC', // Good Till Cancelled
                    'FOK': 'FOK', // Fill Or Kill
                    'IOC': 'IOC', // Immediate Or Cancel
                    'PO': 'POST_ONLY',   // Post Only
                },
            },
        });
    }

    /**
     * @method
     * @name bydfi#fetchMarkets
     * @description retrieves data on all markets for bydfi
     * @see
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
        const maxAmountString = Precise.stringMax (limitMaxQty, marketMaxQty); // todo: check which one is correct
        const marketMinQty = this.safeString (market, 'marketMinQty');
        const limitMinQty = this.safeString (market, 'limitMinQty');
        const minAmountString = Precise.stringMin (marketMinQty, limitMinQty); // todo: check which one is correct
        const pricePrecision = this.parsePrecision (this.safeString (market, 'priceOrderPrecision'));
        const amountPrecision = this.parsePrecision (this.safeString (market, 'volumePrecision'));
        const taker = this.safeNumber (market, 'feeRateTaker');
        const maker = this.safeNumber (market, 'feeRateMaker');
        const contractSize = this.safeNumber (market, 'contractFactor');
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
            'contractSize': contractSize,
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
     * @name alpaca#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.alpaca.markets/reference/cryptolatestorderbooks
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
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'time');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': this.safeString (trade, 'id'),
            'order': undefined,
            'type': undefined,
            'side': this.safeStringLower (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'quantity'),
            'cost': undefined,
            'fee': undefined,
        }, market);
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
        const market = this.market (symbol);
        const maxLimit = 500; // docs says max 1500, but in practice only 500 works
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const request = {
            'symbol': market['id'],
            'interval': interval,
        };
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, maxLimit);
        }
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
        // if (limit !== undefined) {
        //     request['limit'] = limit;
        // }
        if (until !== undefined) {
            request['endTime'] = until;
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
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'time');
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
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
        let wallet = 'W001'; // todo check if it is mandatory
        [ wallet, params ] = this.handleOptionAndParams (params, 'createOrder', 'wallet', wallet);
        orderRequest = this.extend (orderRequest, { 'wallet': wallet });
        const response = await this.privatePostV1SwapTradePlaceOrder (orderRequest);
        return this.parseOrder (response, market);
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
        } else if (reduceOnly) {
            throw new NotSupported (this.id + ' createOrder() closePosition cannot be used with reduceOnly');
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
        const workingType = this.safeString (params, 'triggerPriceType');
        if (workingType !== undefined) {
            if ((type === 'MARKET') || (type === 'LIMIT')) {
                throw new NotSupported (this.id + ' createOrder() triggerPriceType is only supported for stopLoss, takeProfit and trailingStop orders');
            }
            request['workingType'] = workingType;
            params = this.omit (params, 'triggerPriceType');
        }
        return this.extend (request, params);
    }

    sign (path, api: any = 'public', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        let url = this.urls['api'][api];
        let endpoint = '/' + path;
        let query = '';
        if (method === 'GET') {
            query = this.urlencode (params);
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
                body = this.json (params);
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
