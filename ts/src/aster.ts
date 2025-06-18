//  ---------------------------------------------------------------------------

import Exchange from './abstract/aster.js';
import { ArgumentsRequired } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import Precise from './base/Precise.js';
import type { Currencies, Dict, FundingRate, FundingRateHistory, FundingRates, Int, Market, OHLCV, OrderBook, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';

//  ---------------------------------------------------------------------------xs
/**
 * @class aster
 * @augments Exchange
 */
export default class aster extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'aster',
            'name': 'Aster',
            'countries': [ 'US' ],
            // 3 req/s for free
            // 150 req/s for subscribers: https://aster.markets/data
            // for brokers: https://aster.markets/docs/api-references/broker-api/#authentication-and-rate-limit
            'rateLimit': 333,
            'hostname': 'aster.markets',
            'pro': true,
            'urls': {
                'logo': '',
                'www': 'https://www.asterdex.com/en',
                'api': {
                    'rest': 'https://fapi.asterdex.com',
                },
                'doc': 'https://github.com/asterdex/api-docs',
                'fees': 'https://docs.asterdex.com/product/asterex-simple/fees-and-slippage',
            },
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,  // contract only
                'closeAllPositions': false,
                'closePosition': false,  // exchange specific closePosition parameter for binance createOrder is not synonymous with how CCXT uses closePositions
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createLimitBuyOrder': false,
                'createLimitSellOrder': false,
                'createMarketBuyOrder': false,
                'createMarketBuyOrderWithCost': false,
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
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'editOrder': false,
                'editOrders': false,
                'fetchAccounts': undefined,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': 'emulated',
                'fetchCanceledOrders': 'emulated',
                'fetchClosedOrder': false,
                'fetchClosedOrders': 'emulated',
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
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': 'emulated',
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': 'emulated',
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLastPrices': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverage': 'emulated',
                'fetchLeverages': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrice': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': 'emulated',
                'fetchTransactionFee': 'emulated',
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
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
            },
            'api': {
                'public': {
                    'get': [
                        'fapi/v1/ping',
                        'fapi/v1/time',
                        'fapi/v1/exchangeInfo',
                        'fapi/v1/depth',
                        'fapi/v1/trades',
                        'fapi/v1/historicalTrades',
                        'fapi/v1/aggTrades',
                        'fapi/v1/klines',
                        'fapi/v1/indexPriceKlines',
                        'fapi/v1/markPriceKlines',
                        'fapi/v1/premiumIndex',
                        'fapi/v1/fundingRate',
                        'fapi/v1/ticker/24hr',
                        'fapi/v1/ticker/price',
                        'fapi/v1/ticker/bookTicker',
                        'fapi/v1/leverageBracket',
                        'fapi/v1/adlQuantile',
                        'fapi/v1/forceOrders',
                    ],
                },
                'private': {
                    'get': [
                        'fapi/v1/positionSide/dual',
                        'fapi/v1/multiAssetsMargin',
                        'fapi/v1/order',
                        'fapi/v1/openOrder',
                        'fapi/v1/openOrders',
                        'fapi/v1/allOrders',
                        'fapi/v2/balance',
                        'fapi/v2/account',
                        'fapi/v1/positionMargin/history',
                        'fapi/v2/positionRisk',
                        'fapi/v1/userTrades',
                        'fapi/v1/income',
                        'fapi/v1/commissionRate',
                    ],
                    'post': [
                        'fapi/v1/order',
                        'fapi/v1/positionSide/dual',
                        'fapi/v1/multiAssetsMargin',
                        'fapi/v1/order/test',
                        'fapi/v1/batchOrders',
                        'fapi/v1/countdownCancelAll',
                        'fapi/v1/leverage',
                        'fapi/v1/marginType',
                        'fapi/v1/positionMargin',
                        'fapi/v1/listenKey',
                    ],
                    'put': [
                        'fapi/v1/listenKey',
                    ],
                    'delete': [
                        'fapi/v1/order',
                        'fapi/v1/allOpenOrders',
                        'fapi/v1/batchOrders',
                        'fapi/v1/listenKey',
                    ],
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
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0001'),
                    'taker': this.parseNumber ('0.00035'),
                },
            },
            'options': {
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
        });
    }

    /**
     * @method
     * @name aster#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response: Dict = await this.publicGetFapiV1ExchangeInfo (params);
        const rows = this.safeList (response, 'assets', []);
        //
        //     [
        //         {
        //             "asset": "USDT",
        //             "marginAvailable": true,
        //             "autoAssetExchange": "-10000"
        //         }
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const currency = rows[i];
            const currencyId = this.safeString (currency, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            result[code] = this.safeCurrencyStructure ({
                'info': currency,
                'code': code,
                'id': currencyId,
                'name': code,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
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
                'networks': undefined,
                'type': 'crypto', // atm exchange api provides only cryptos
            });
        }
        return result;
    }

    /**
     * @method
     * @name aster#fetchMarkets
     * @description retrieves data on all markets for bigone
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response: Dict = await this.publicGetFapiV1ExchangeInfo (params);
        const markets = this.safeList (response, 'symbols', []);
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "pair": "BTCUSDT",
        //             "contractType": "PERPETUAL",
        //             "deliveryDate": 4133404800000,
        //             "onboardDate": 1627628400000,
        //             "status": "TRADING",
        //             "maintMarginPercent": "2.5000",
        //             "requiredMarginPercent": "5.0000",
        //             "baseAsset": "BTC",
        //             "quoteAsset": "USDT",
        //             "marginAsset": "USDT",
        //             "pricePrecision": 1,
        //             "quantityPrecision": 3,
        //             "baseAssetPrecision": 8,
        //             "quotePrecision": 8,
        //             "underlyingType": "COIN",
        //             "underlyingSubType": [],
        //             "settlePlan": 0,
        //             "triggerProtect": "0.0200",
        //             "liquidationFee": "0.025000",
        //             "marketTakeBound": "0.02",
        //             "filters": [
        //                 {
        //                     "minPrice": "1",
        //                     "maxPrice": "1000000",
        //                     "filterType": "PRICE_FILTER",
        //                     "tickSize": "0.1"
        //                 },
        //                 {
        //                     "stepSize": "0.001",
        //                     "filterType": "LOT_SIZE",
        //                     "maxQty": "100",
        //                     "minQty": "0.001"
        //                 },
        //                 {
        //                     "stepSize": "0.001",
        //                     "filterType": "MARKET_LOT_SIZE",
        //                     "maxQty": "10",
        //                     "minQty": "0.001"
        //                 },
        //                 {
        //                     "limit": 200,
        //                     "filterType": "MAX_NUM_ORDERS"
        //                 },
        //                 {
        //                     "limit": 10,
        //                     "filterType": "MAX_NUM_ALGO_ORDERS"
        //                 },
        //                 {
        //                     "notional": "5",
        //                     "filterType": "MIN_NOTIONAL"
        //                 },
        //                 {
        //                     "multiplierDown": "0.9800",
        //                     "multiplierUp": "1.0200",
        //                     "multiplierDecimal": "4",
        //                     "filterType": "PERCENT_PRICE"
        //                 }
        //             ],
        //             "orderTypes": [
        //                 "LIMIT",
        //                 "MARKET",
        //                 "STOP",
        //                 "STOP_MARKET",
        //                 "TAKE_PROFIT",
        //                 "TAKE_PROFIT_MARKET",
        //                 "TRAILING_STOP_MARKET"
        //             ],
        //             "timeInForce": [
        //                 "GTC",
        //                 "IOC",
        //                 "FOK",
        //                 "GTX",
        //                 "RPI"
        //             ]
        //         }
        //     ]
        //
        const fees = this.fees;
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const settleId = this.safeString (market, 'marginAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const symbol = base + '/' + quote + ':' + settle;
            const status = this.safeString (market, 'status');
            const active = status === 'TRADING';
            result.push (this.safeMarketStructure ({
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
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'active': active,
                'contract': true,
                'linear': true,
                'inverse': false,
                'taker': fees['trading']['taker'],
                'maker': fees['trading']['maker'],
                'contractSize': 1,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'quantityPrecision'),
                    'price': this.safeNumber (market, 'pricePrecision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
                        'max': undefined,
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
                'info': market,
            }));
        }
        return result;
    }

    /**
     * @method
     * @name aster#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#check-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetFapiV1Time (params);
        //
        //     {
        //         "serverTime": 1499827319559
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     [
        //         1631158560000,
        //         "208.1850",
        //         "208.1850",
        //         "208.1850",
        //         "208.1850",
        //         "11.84",
        //         1631158619999,
        //         "2464.910400",
        //         1,
        //         "11.84",
        //         "2464.910400",
        //         "0"
        //     ]
        //
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
     * @name aster#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#klinecandlestick-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.price] "mark" or "index" for mark price and index price candles
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request: Dict = {};
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            if (limit > 1500) {
                limit = 1500; // Default 500; max 1500.
            }
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        request['interval'] = this.safeString (this.timeframes, timeframe, timeframe);
        const price = this.safeString (params, 'price');
        const isMark = (price === 'mark');
        const isIndex = (price === 'index');
        params = this.omit (params, 'price');
        let response = undefined;
        if (isMark) {
            request['symbol'] = market['id'];
            response = await this.publicGetFapiV1MarkPriceKlines (this.extend (request, params));
        } else if (isIndex) {
            request['pair'] = market['id'];
            response = await this.publicGetFapiV1IndexPriceKlines (this.extend (request, params));
        } else {
            request['symbol'] = market['id'];
            response = await this.publicGetFapiV1Klines (this.extend (request, params));
        }
        //
        //     [
        //         [
        //             1631158560000,
        //             "208.1850",
        //             "208.1850",
        //             "208.1850",
        //             "208.1850",
        //             "11.84",
        //             1631158619999,
        //             "2464.910400",
        //             1,
        //             "11.84",
        //             "2464.910400",
        //             "0"
        //         ]
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "id": 3913206,
        //         "price": "644.100",
        //         "qty": "0.08",
        //         "quoteQty": "51.528",
        //         "time": 1749784506633,
        //         "isBuyerMaker": true
        //     }
        //
        const id = this.safeString (trade, 'id');
        const symbol = market['symbol'];
        const amountString = this.safeString (trade, 'qty');
        const priceString = this.safeString (trade, 'price');
        const costString = this.safeString (trade, 'quoteQty');
        const timestamp = this.safeInteger (trade, 'time');
        const isBuyerMaker = this.safeBool (trade, 'isBuyerMaker');
        const side = isBuyerMaker ? 'sell' : 'buy';
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': this.safeString (trade, 'orderId'),
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name aster#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#recent-trades-list
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            if (limit > 1000) {
                limit = 1000; // Default 500; max 1000.
            }
            request['limit'] = limit;
        }
        const response = await this.publicGetFapiV1Trades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 3913206,
        //             "price": "644.100",
        //             "qty": "0.08",
        //             "quoteQty": "51.528",
        //             "time": 1749784506633,
        //             "isBuyerMaker": true
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name aster#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            // limit: [5, 10, 20, 50, 100, 500, 1000]. Default: 500
            request['limit'] = limit;
        }
        const response = await this.publicGetFapiV1Depth (this.extend (request, params));
        //
        //     {
        //         "lastUpdateId": 1027024,
        //         "E": 1589436922972, //     Message output time
        //         "T": 1589436922959, //     Transaction time
        //         "bids": [
        //             [
        //                 "4.00000000", //     PRICE
        //                 "431.00000000" //     QTY
        //             ]
        //         ],
        //         "asks": [
        //             [
        //                 "4.00000200",
        //                 "12.00000000"
        //             ]
        //         ]
        //     }
        //
        const timestamp = this.safeInteger (response, 'T');
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks');
    }

    /**
     * @method
     * @name aster#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#get-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let request: Dict = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            if (limit > 1000) {
                limit = 1000; // Default 100; max 1000
            }
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        const response = await this.publicGetFapiV1FundingRate (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "fundingTime": 1747209600000,
        //             "fundingRate": "0.00010000"
        //         }
        //     ]
        //
        const rates = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const timestamp = this.safeInteger (entry, 'fundingTime');
            rates.push ({
                'info': entry,
                'symbol': this.safeSymbol (this.safeString (entry, 'symbol')),
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit) as FundingRateHistory[];
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "priceChange": "1845.7",
        //         "priceChangePercent": "1.755",
        //         "weightedAvgPrice": "105515.5",
        //         "lastPrice": "107037.7",
        //         "lastQty": "0.004",
        //         "openPrice": "105192.0",
        //         "highPrice": "107223.5",
        //         "lowPrice": "104431.6",
        //         "volume": "8753.286",
        //         "quoteVolume": "923607368.61",
        //         "openTime": 1749976620000,
        //         "closeTime": 1750063053754,
        //         "firstId": 24195078,
        //         "lastId": 24375783,
        //         "count": 180706
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'closeTime');
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'lastPrice');
        const open = this.safeString (ticker, 'openPrice');
        let percentage = this.safeString (ticker, 'priceChangePercent');
        percentage = Precise.stringMul (percentage, '100');
        const quoteVolume = this.safeString (ticker, 'quoteVolume');
        const baseVolume = this.safeString (ticker, 'volume');
        const high = this.safeString (ticker, 'highPrice');
        const low = this.safeString (ticker, 'lowPrice');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': undefined,
            'indexPrice': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name aster#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#24hr-ticker-price-change-statistics
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTicker() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetFapiV1Ticker24hr (this.extend (request, params));
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "priceChange": "1845.7",
        //         "priceChangePercent": "1.755",
        //         "weightedAvgPrice": "105515.5",
        //         "lastPrice": "107037.7",
        //         "lastQty": "0.004",
        //         "openPrice": "105192.0",
        //         "highPrice": "107223.5",
        //         "lowPrice": "104431.6",
        //         "volume": "8753.286",
        //         "quoteVolume": "923607368.61",
        //         "openTime": 1749976620000,
        //         "closeTime": 1750063053754,
        //         "firstId": 24195078,
        //         "lastId": 24375783,
        //         "count": 180706
        //     }
        //
        return this.parseTicker (response, market);
    }

    /**
     * @method
     * @name aster#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#24hr-ticker-price-change-statistics
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetFapiV1Ticker24hr (params);
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "priceChange": "1845.7",
        //             "priceChangePercent": "1.755",
        //             "weightedAvgPrice": "105515.5",
        //             "lastPrice": "107037.7",
        //             "lastQty": "0.004",
        //             "openPrice": "105192.0",
        //             "highPrice": "107223.5",
        //             "lowPrice": "104431.6",
        //             "volume": "8753.286",
        //             "quoteVolume": "923607368.61",
        //             "openTime": 1749976620000,
        //             "closeTime": 1750063053754,
        //             "firstId": 24195078,
        //             "lastId": 24375783,
        //             "count": 180706
        //         }
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "markPrice": "106729.84047826",
        //         "indexPrice": "106775.72673913",
        //         "estimatedSettlePrice": "106708.84997006",
        //         "lastFundingRate": "0.00010000",
        //         "interestRate": "0.00010000",
        //         "nextFundingTime": 1750147200000,
        //         "time": 1750146970000
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const nextFundingTimestamp = this.safeInteger (contract, 'nextFundingTime');
        const timestamp = this.safeInteger (contract, 'time');
        return {
            'info': contract,
            'symbol': this.safeSymbol (marketId, market),
            'markPrice': this.safeNumber (contract, 'markPrice'),
            'indexPrice': this.safeNumber (contract, 'indexPrice'),
            'interestRate': this.safeNumber (contract, 'interestRate'),
            'estimatedSettlePrice': this.safeNumber (contract, 'estimatedSettlePrice'),
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
     * @name aster#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#mark-price
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTicker() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetFapiV1PremiumIndex (this.extend (request, params));
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "markPrice": "106729.84047826",
        //         "indexPrice": "106775.72673913",
        //         "estimatedSettlePrice": "106708.84997006",
        //         "lastFundingRate": "0.00010000",
        //         "interestRate": "0.00010000",
        //         "nextFundingTime": 1750147200000,
        //         "time": 1750146970000
        //     }
        //
        return this.parseFundingRate (response, market);
    }

    /**
     * @method
     * @name aster#fetchFundingRates
     * @description fetch the current funding rate for multiple symbols
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#24hr-ticker-price-change-statistics
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetFapiV1PremiumIndex (this.extend (params));
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "markPrice": "106729.84047826",
        //             "indexPrice": "106775.72673913",
        //             "estimatedSettlePrice": "106708.84997006",
        //             "lastFundingRate": "0.00010000",
        //             "interestRate": "0.00010000",
        //             "nextFundingTime": 1750147200000,
        //             "time": 1750146970000
        //         }
        //     ]
        //
        return this.parseFundingRates (response, symbols);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api']['rest']) + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.rawencode (params);
            }
        // } else if (api === 'private') {
            //
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
