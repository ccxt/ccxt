//  ---------------------------------------------------------------------------
import Exchange from './abstract/lighter.js';
import { ExchangeError } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Dict, Int, int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class lighter
 * @augments Exchange
 */
export default class lighter extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'lighter',
            'name': 'Lighter',
            'countries': [],
            'version': 'v1',
            'rateLimit': 1000, // 60 requests per minute - normal account
            'certified': false,
            'pro': false,
            'dex': false,
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
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelOrdersForSymbols': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopOrder': false,
                'createTriggerOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchAllGreeks': false,
                'fetchBalance': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': false,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
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
            'hostname': 'zklighter.elliot.ai',
            'urls': {
                'logo': '',
                'api': {
                    'root': 'https://mainnet.{hostname}',
                    'public': 'https://mainnet.{hostname}',
                    'private': 'https://mainnet.{hostname}',
                },
                'test': {
                    'root': 'https://testnet.{hostname}',
                    'public': 'https://testnet.{hostname}',
                    'private': 'https://testnet.{hostname}',
                },
                'www': 'https://lighter.xyz/',
                'doc': 'https://apidocs.lighter.xyz/',
                'fees': 'https://docs.lighter.xyz/perpetual-futures/fees',
                'referral': '',
            },
            'api': {
                'root': {
                    'get': {
                        // root
                        '': 1, // status
                        'info': 1,
                    },
                },
                'public': {
                    'get': {
                        // account
                        'account': 1,
                        'accountsByL1Address': 1,
                        'apikeys': 1,
                        // order
                        'exchangeStats': 1,
                        'orderBookDetails': 1,
                        'orderBookOrders': 1,
                        'orderBooks': 1,
                        'recentTrades': 1,
                        // transaction
                        'blockTxs': 1,
                        'nextNonce': 1,
                        'tx': 1,
                        'txFromL1TxHash': 1,
                        'txs': 1,
                        // announcement
                        'announcement': 1,
                        // block
                        'block': 1,
                        'blocks': 1,
                        'currentHeight': 1,
                        // candlestick
                        'candlesticks': 1,
                        'fundings': 1,
                        // bridge
                        'fastbridge/info': 1,
                        // funding
                        'funding-rates': 1,
                        // info
                        'withdrawalDelay': 1,
                    },
                    'post': {
                        // transaction
                        'sendTx': 1,
                        'sendTxBatch': 1,
                    },
                },
                'private': {
                    'get': {
                        // account
                        'accountLimits': 1,
                        'accountMetadata': 1,
                        'pnl': 1,
                        'l1Metadata': 1,
                        'liquidations': 1,
                        'positionFunding': 1,
                        'publicPoolsMetadata': 1,
                        // order
                        'accountActiveOrders': 1,
                        'accountInactiveOrders': 1,
                        'export': 1,
                        'trades': 1,
                        // transaction
                        'accountTxs': 1,
                        'deposit/history': 1,
                        'transfer/history': 1,
                        'withdraw/history': 1,
                        // referral
                        'referral/points': 1,
                        // info
                        'transferFeeInfo': 1,
                    },
                    'post': {
                        // account
                        'changeAccountTier': 1,
                        // notification
                        'notification/ack': 1,
                    },
                },
            },
            'httpExceptions': {
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'fees': {
                'taker': 0,
                'maker': 0,
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'walletAddress': false,
                'privateKey': false,
                'password': false,
                'apiKeyIndex': true,
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {},
            'options': {
                'defaultType': 'swap',
            },
        });
    }

    /**
     * @method
     * @name lighter#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://apidocs.lighter.xyz/reference/status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        const response = await this.rootGet (params);
        //
        //     {
        //         "status": "1",
        //         "network_id": "1",
        //         "timestamp": "1717777777"
        //     }
        //
        const status = this.safeString (response, 'status');
        return {
            'status': (status === '200') ? 'ok' : 'error', // if there's no Errors, status = 'ok'
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name lighter#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://apidocs.lighter.xyz/reference/status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.rootGet (params);
        //
        //     {
        //         "status": "1",
        //         "network_id": "1",
        //         "timestamp": "1717777777"
        //     }
        //
        return this.safeTimestamp (response, 'timestamp');
    }

    /**
     * @method
     * @name lighter#fetchMarkets
     * @description retrieves data on all markets for lighter
     * @see https://apidocs.lighter.xyz/reference/orderbookdetails
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetOrderBookDetails (params);
        //
        //     {
        //         "code": 200,
        //         "order_book_details": [
        //             {
        //                 "symbol": "ETH",
        //                 "market_id": 0,
        //                 "status": "active",
        //                 "taker_fee": "0.0000",
        //                 "maker_fee": "0.0000",
        //                 "liquidation_fee": "1.0000",
        //                 "min_base_amount": "0.0050",
        //                 "min_quote_amount": "10.000000",
        //                 "order_quote_limit": "",
        //                 "supported_size_decimals": 4,
        //                 "supported_price_decimals": 2,
        //                 "supported_quote_decimals": 6,
        //                 "size_decimals": 4,
        //                 "price_decimals": 2,
        //                 "quote_multiplier": 1,
        //                 "default_initial_margin_fraction": 500,
        //                 "min_initial_margin_fraction": 200,
        //                 "maintenance_margin_fraction": 120,
        //                 "closeout_margin_fraction": 80,
        //                 "last_trade_price": 3550.69,
        //                 "daily_trades_count": 1197349,
        //                 "daily_base_token_volume": 481297.3509,
        //                 "daily_quote_token_volume": 1671431095.263844,
        //                 "daily_price_low": 3402.41,
        //                 "daily_price_high": 3571.45,
        //                 "daily_price_change": 0.5294300840859545,
        //                 "open_interest": 39559.3278,
        //                 "daily_chart": {},
        //                 "market_config": {
        //                     "market_margin_mode": 0,
        //                     "insurance_fund_account_index": 281474976710655,
        //                     "liquidation_mode": 0,
        //                     "force_reduce_only": false,
        //                     "trading_hours": ""
        //                 }
        //             }
        //         ]
        //     }
        //
        const markets = this.safeList (response, 'order_book_details', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'market_id');
            const baseId = this.safeString (market, 'symbol');
            const quoteId = 'USDC';
            const settleId = 'USDC';
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const amountDecimals = this.safeString2 (market, 'size_decimals', 'supported_size_decimals');
            const priceDecimals = this.safeString2 (market, 'price_decimals', 'supported_price_decimals');
            const amountPrecision = (amountDecimals === undefined) ? undefined : this.parseNumber (this.parsePrecision (amountDecimals));
            const pricePrecision = (priceDecimals === undefined) ? undefined : this.parseNumber (this.parsePrecision (priceDecimals));
            const quoteMultiplier = this.safeNumber (market, 'quote_multiplier');
            result.push ({
                'id': id,
                'symbol': base + '/' + quote + ':' + settle,
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
                'active': this.safeString (market, 'status') === 'active',
                'contract': true,
                'linear': true,
                'inverse': false,
                'taker': this.safeNumber (market, 'taker_fee'),
                'maker': this.safeNumber (market, 'maker_fee'),
                'contractSize': quoteMultiplier,
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
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_base_amount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_quote_amount'),
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }

    /**
     * @method
     * @name lighter#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.lighter.xyz/reference/orderbookorders
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market_id': market['id'],
            'limit': 100,
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 100);
        }
        const response = await this.publicGetOrderBookOrders (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "total_asks": 1,
        //         "asks": [
        //             {
        //                 "order_index": 281475565888172,
        //                 "order_id": "281475565888172",
        //                 "owner_account_index": 134436,
        //                 "initial_base_amount": "0.2000",
        //                 "remaining_base_amount": "0.2000",
        //                 "price": "3430.00",
        //                 "order_expiry": 1765419046807
        //             }
        //         ],
        //         "total_bids": 1,
        //         "bids": [
        //             {
        //                 "order_index": 562949401225099,
        //                 "order_id": "562949401225099",
        //                 "owner_account_index": 314236,
        //                 "initial_base_amount": "1.7361",
        //                 "remaining_base_amount": "1.3237",
        //                 "price": "3429.80",
        //                 "order_expiry": 1765419047587
        //             }
        //         ]
        //     }
        //
        const result = this.parseOrderBook (response, market['symbol'], undefined, 'bids', 'asks', 'price', 'remaining_base_amount');
        return result;
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "symbol": "ETH",
        //         "market_id": 0,
        //         "status": "active",
        //         "taker_fee": "0.0000",
        //         "maker_fee": "0.0000",
        //         "liquidation_fee": "1.0000",
        //         "min_base_amount": "0.0050",
        //         "min_quote_amount": "10.000000",
        //         "order_quote_limit": "",
        //         "supported_size_decimals": 4,
        //         "supported_price_decimals": 2,
        //         "supported_quote_decimals": 6,
        //         "size_decimals": 4,
        //         "price_decimals": 2,
        //         "quote_multiplier": 1,
        //         "default_initial_margin_fraction": 500,
        //         "min_initial_margin_fraction": 200,
        //         "maintenance_margin_fraction": 120,
        //         "closeout_margin_fraction": 80,
        //         "last_trade_price": 3550.69,
        //         "daily_trades_count": 1197349,
        //         "daily_base_token_volume": 481297.3509,
        //         "daily_quote_token_volume": 1671431095.263844,
        //         "daily_price_low": 3402.41,
        //         "daily_price_high": 3571.45,
        //         "daily_price_change": 0.5294300840859545,
        //         "open_interest": 39559.3278,
        //         "daily_chart": {},
        //         "market_config": {
        //             "market_margin_mode": 0,
        //             "insurance_fund_account_index": 281474976710655,
        //             "liquidation_mode": 0,
        //             "force_reduce_only": false,
        //             "trading_hours": ""
        //         }
        //     }
        //
        const marketId = this.safeString (ticker, 'market_id');
        market = this.safeMarket (marketId, market, undefined, 'swap');
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'last_trade_price');
        const high = this.safeString (ticker, 'daily_price_high');
        const low = this.safeString (ticker, 'daily_price_low');
        const baseVolume = this.safeString (ticker, 'daily_base_token_volume');
        const quoteVolume = this.safeString (ticker, 'daily_quote_token_volume');
        const change = this.safeString (ticker, 'daily_price_change');
        const openInterest = this.safeString (ticker, 'open_interest');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': undefined,
            'indexPrice': undefined,
            'openInterest': openInterest,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name lighter#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.lighter.xyz/reference/orderbookdetails
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market_id': market['id'],
        };
        const response = await this.publicGetOrderBookDetails (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "order_book_details": [
        //             {
        //                 "symbol": "ETH",
        //                 "market_id": 0,
        //                 "status": "active",
        //                 "taker_fee": "0.0000",
        //                 "maker_fee": "0.0000",
        //                 "liquidation_fee": "1.0000",
        //                 "min_base_amount": "0.0050",
        //                 "min_quote_amount": "10.000000",
        //                 "order_quote_limit": "",
        //                 "supported_size_decimals": 4,
        //                 "supported_price_decimals": 2,
        //                 "supported_quote_decimals": 6,
        //                 "size_decimals": 4,
        //                 "price_decimals": 2,
        //                 "quote_multiplier": 1,
        //                 "default_initial_margin_fraction": 500,
        //                 "min_initial_margin_fraction": 200,
        //                 "maintenance_margin_fraction": 120,
        //                 "closeout_margin_fraction": 80,
        //                 "last_trade_price": 3550.69,
        //                 "daily_trades_count": 1197349,
        //                 "daily_base_token_volume": 481297.3509,
        //                 "daily_quote_token_volume": 1671431095.263844,
        //                 "daily_price_low": 3402.41,
        //                 "daily_price_high": 3571.45,
        //                 "daily_price_change": 0.5294300840859545,
        //                 "open_interest": 39559.3278,
        //                 "daily_chart": {},
        //                 "market_config": {
        //                     "market_margin_mode": 0,
        //                     "insurance_fund_account_index": 281474976710655,
        //                     "liquidation_mode": 0,
        //                     "force_reduce_only": false,
        //                     "trading_hours": ""
        //                 }
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'order_book_details', []);
        const first = this.safeDict (data, 0, {});
        return this.parseTicker (first, market);
    }

    /**
     * @method
     * @name lighter#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://apidocs.lighter.xyz/reference/orderbookdetails
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetOrderBookDetails (params);
        const tickers = this.safeList (response, 'order_book_details', []);
        return this.parseTickers (tickers, symbols);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "timestamp": 1763001300000,
        //         "open": 3438.49,
        //         "high": 3445.58,
        //         "low": 3435.38,
        //         "close": 3439.19,
        //         "open_raw": 0,
        //         "high_raw": 0,
        //         "low_raw": 0,
        //         "close_raw": 0,
        //         "volume0": 1253.4977,
        //         "volume1": 4314077.600513,
        //         "last_trade_id": 464354353
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume0'),
        ];
    }

    /**
     * @method
     * @name lighter#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://apidocs.lighter.xyz/reference/candlesticks
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, [ 'until' ]);
        const now = this.milliseconds ();
        let startTs = undefined;
        let endTs = undefined;
        if (since !== undefined) {
            startTs = since;
            if (until !== undefined) {
                endTs = until;
            } else if (limit !== undefined) {
                const duration = this.parseTimeframe (timeframe);
                endTs = this.sum (since, duration * limit * 1000);
            } else {
                endTs = now;
            }
        } else {
            endTs = (until !== undefined) ? until : now;
            const defaultLimit = 100;
            if (limit !== undefined) {
                startTs = endTs - this.parseTimeframe (timeframe) * 1000 * limit;
            } else {
                startTs = endTs - this.parseTimeframe (timeframe) * 1000 * defaultLimit;
            }
        }
        const request: Dict = {
            'market_id': market['id'],
            'count_back': 0,
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
            'start_timestamp': startTs,
            'end_timestamp': endTs,
        };
        const response = await this.publicGetCandlesticks (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "resolution": "5m",
        //         "candlesticks": [
        //             {
        //                 "timestamp": 1763001300000,
        //                 "open": 3438.49,
        //                 "high": 3445.58,
        //                 "low": 3435.38,
        //                 "close": 3439.19,
        //                 "open_raw": 0,
        //                 "high_raw": 0,
        //                 "low_raw": 0,
        //                 "close_raw": 0,
        //                 "volume0": 1253.4977,
        //                 "volume1": 4314077.600513,
        //                 "last_trade_id": 464354353
        //             }
        //         ]
        //     }
        //
        const ohlcvs = this.safeValue (response, 'candlesticks', []);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = undefined;
        if (api === 'root') {
            url = this.implodeHostname (this.urls['api']['public']);
        } else {
            url = this.implodeHostname (this.urls['api'][api]) + '/api/' + this.version + '/' + path;
        }
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.rawencode (params);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         "code": "200",
        //         "message": "string"
        //     }
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        if (code !== undefined && code !== '0' && code !== '200') {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
