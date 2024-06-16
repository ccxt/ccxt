
//  ---------------------------------------------------------------------------

import Exchange from './abstract/coindcx.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Dict, IndexType, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class coindcx
 * @augments Exchange
 */
export default class coindcx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coindcx',
            'name': 'CoinDCX',
            'countries': [ 'IN' ], // India
            'version': 'v1',
            'rateLimit': 30, // 2000 per minute
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDeposit': undefined,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
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
                'withdraw': false,
                'ws': false,
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
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': '', // todo: add a logo
                'api': {
                    'public1': 'https://api.coindcx.com', // base URL for some public endpoint is https://public.coindcx.com. However, it will only be used where it is exclusively mentioned in the documentation.
                    'private': 'https://api.coindcx.com',
                    'public2': 'https://public.coindcx.com', // todo should we rename it?
                },
                'www': 'https://coindcx.com/',
                'doc': [
                    'https://docs.coindcx.com/',
                ],
                'fees': 'https://docs.coindcx.com/?python#3-fees-and-charges',
            },
            'api': {
                'public1': {
                    'get': {
                        'exchange/ticker': 1,
                        'exchange/v1/markets': 1,
                        'exchange/v1/markets_details': 1,
                        'exchange/v1/derivatives/futures/data/active_instruments': 1,
                        'exchange/v1/derivatives/futures/data/instrument': 1,
                    },
                },
                'public2': {
                    'get': {
                        'market_data/trade_history': 1,
                        'market_data/orderbook': 1,
                        'market_data/candles': 1,
                    },
                },
                'private': {
                    'post': {
                        'exchange/v1/users/balances': 1,
                        'exchange/v1/users/info': 1,
                        'exchange/v1/orders/create': 1,
                        'exchange/v1/orders/create_multiple': 1,
                        'exchange/v1/orders/status': 1,
                        'exchange/v1/orders/status_multiple': 1,
                        'exchange/v1/orders/active_orders': 1,
                        'exchange/v1/orders/trade_history': 1,
                        'exchange/v1/orders/active_orders_count': 1,
                        'exchange/v1/orders/cancel_all': 1,
                        'exchange/v1/orders/cancel_by_ids': 1,
                        'exchange/v1/orders/cancel': 1,
                        'exchange/v1/orders/edit': 1,
                        'exchange/v1/funding/fetch_orders': 1,
                        'exchange/v1/funding/lend': 1,
                        'exchange/v1/funding/settle': 1,
                        'exchange/v1/margin/create': 1,
                        'exchange/v1/margin/cancel': 1,
                        'exchange/v1/margin/exit': 1,
                        'exchange/v1/margin/edit_target': 1,
                        'exchange/v1/margin/edit_price_of_target_order': 1,
                        'exchange/v1/margin/edit_sl': 1,
                        'exchange/v1/margin/edit_trailing_sl': 1,
                        'exchange/v1/margin/add_margin': 1,
                        'exchange/v1/margin/remove_margin': 1,
                        'exchange/v1/margin/fetch_orders': 1,
                        'exchange/v1/margin/order': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'quote',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0'),
                    'maker': this.parseNumber ('0'),
                },
            },
            'precisionMode': DECIMAL_PLACES,
            // exchange-specific options
            'options': {
                'networks': {
                    // todo: complete list of networks
                },
            },
            'exceptions': {
                'exact': {
                    // {"code":400,"message":"Invalid Request.","status":"error"}
                    // {"code":401,"message":"Invalid credentials","status":"error"}
                    // {"status":"error","message":"not_found","code":404}
                    // {"code":422,"message":"Invalid Request","status":"error"}
                    // {"code":404,"message":"Order not found","status":"error"}
                },
                'broad': {
                    // todo: add more error codes
                },
            },
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name coindcx#fetchMarkets
         * @description retrieves data on all markets for coindcx
         * @see https://docs.coindcx.com/?javascript#markets-details
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.public1GetExchangeV1MarketsDetails (params);
        //
        //     [
        //         {
        //             "coindcx_name": "ONDOUSDT",
        //             "base_currency_short_name": "USDT",
        //             "target_currency_short_name": "ONDO",
        //             "target_currency_name": "Ondo",
        //             "base_currency_name": "Tether",
        //             "min_quantity": 10.0,
        //             "max_quantity": 10000000000.0,
        //             "max_quantity_market": 10000000000.0,
        //             "min_price": 1.0e-05,
        //             "max_price": 10000000000.0,
        //             "min_notional": 0.1,
        //             "base_currency_precision": 5,
        //             "target_currency_precision": 4,
        //             "step": 0.0001,
        //             "order_types": [
        //                 "market_order",
        //                 "limit_order"
        //             ],
        //             "symbol": "ONDOUSDT",
        //             "ecode": "KC",
        //             "bo_sl_safety_percent": null,
        //             "max_leverage": null,
        //             "max_leverage_short": null,
        //             "pair": "KC-ONDO_USDT",
        //             "status": "active"
        //         }
        //     ]
        //
        return this.parseMarkets (response);
    }

    parseMarket (market: Dict): Market {
        const marketId = this.safeString (market, 'coindcx_name'); // todo how to set encode
        const baseId = this.safeString (market, 'target_currency_short_name');
        const quoteId = this.safeString (market, 'base_currency_short_name');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        let margin = false;
        let max_leverage = this.safeNumber (market, 'max_leverage');
        if (max_leverage === 0) {
            max_leverage = undefined;
        }
        if (max_leverage !== undefined) {
            margin = true;
        }
        const active = this.safeString (market, 'status');
        let isActive = false;
        if (active === 'active') {
            isActive = true;
        }
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot', // todo check
            'spot': true,
            'margin': margin,
            'swap': false,
            'future': false,
            'option': false,
            'active': isActive,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'taker': this.safeNumber (market, 'taker_fee', 0), // spot markets have no fees yet
            'maker': this.safeNumber (market, 'maker_fee', 0), // spot markets have no fees yet
            'precision': {
                'amount': this.safeInteger (market, 'target_currency_precision'),
                'price': this.safeInteger (market, 'base_currency_precision'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': max_leverage,
                },
                'amount': {
                    'min': this.safeNumber (market, 'min_quantity'),
                    'max': this.safeNumber (market, 'max_quantity'),
                },
                'price': {
                    'min': this.safeNumber (market, 'min_price'),
                    'max': this.safeNumber (market, 'max_price'),
                },
                'cost': {
                    'min': this.safeNumber (market, 'min_notional'),
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        };
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name coindcx#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://docs.coindcx.com/?javascript#ticker
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.public1GetExchangeTicker (params);
        //
        // [
        //     {
        //         "market": "BTCINR",
        //         "change_24_hour": "1.486",
        //         "high": "6199999.0",
        //         "low": "6028180.13",
        //         "volume": "16901590.410328545",
        //         "last_price": "6181299.060000000000",
        //         "bid": "6103600.520000000000",
        //         "ask": "6180699.010000000000",
        //         "timestamp": 1717616755
        //     }
        // ]
        //
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        //  {
        //      "market": "BTCINR",
        //      "change_24_hour": "1.486",
        //      "high": "6199999.0",
        //      "low": "6028180.13",
        //      "volume": "16901590.410328545",
        //      "last_price": "6181299.060000000000",
        //      "bid": "6103600.520000000000",
        //      "ask": "6180699.010000000000",
        //      "timestamp": 1717616755
        //  }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const marketId = this.safeString (ticker, 'market');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'last_price');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': this.safeString (ticker, 'bid'),
            'ask': undefined,
            'askVolume': this.safeString (ticker, 'ask'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'change_24_hour'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeString (ticker, 'volume'),
            'info': ticker,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name coindcx#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.coindcx.com/?javascript#candles
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch (default 500, max 1000)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch (works only if since is also defined)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        timeframe = this.safeString (this.timeframes, timeframe, timeframe);
        const marketInfo = this.safeDict (market, 'info', {});
        const pair = this.safeString (marketInfo, 'pair');
        const request: Dict = {
            'pair': pair,
            'interval': timeframe,
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit (params, 'until');
        }
        const response = await this.public2GetMarketDataCandles (this.extend (request, params));
        //
        //     [
        //         {
        //             "open":70938.55,
        //             "high":70938.55,
        //             "low":70926.27,
        //             "volume":7.60989,
        //             "close":70931.98,
        //             "time":1717692120000
        //         }
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coindcx#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.coindcx.com/?javascript#order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return (not used by coindcx)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketInfo = this.safeDict (market, 'info', {});
        const pair = this.safeString (marketInfo, 'pair');
        const request: Dict = {
            'pair': pair,
        };
        const response = await this.public2GetMarketDataOrderbook (this.extend (request, params));
        //
        //     {
        //         "timestamp": 1717694482206,
        //         "asks":
        //         {
        //             "71198.00": "7.630",
        //             "71198.10": "0.116",
        //             "71198.40": "0.069",
        //             "71198.50": "0.056",
        //             "71198.70": "0.046",
        //             "71198.80": "0.258",
        //             "71198.90": "0.095",
        //             "71199.00": "0.324",
        //             ...
        //         },
        //         "bids":
        //         {
        //             "71197.90": "8.563",
        //             "71197.80": "0.011",
        //             "71196.80": "0.561",
        //             "71196.70": "0.892",
        //             "71196.60": "0.019",
        //             "71196.30": "0.100",
        //             "71196.10": "0.007",
        //             "71196.00": "0.002",
        //             ...
        //         }
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp);
    }

    parseBidsAsks (bidasks, priceKey: IndexType = 0, amountKey: IndexType = 1, countOrIdKey: IndexType = 2) {
        const prices = Object.keys (bidasks);
        const result = [];
        for (let i = 0; i < prices.length; i++) {
            const price = prices[i];
            const amount = bidasks[price];
            result.push ([ this.parseNumber (price), this.parseNumber (amount) ]);
        }
        return result;
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coindcx#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.coindcx.com/#trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch (default 30, max 500)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketInfo = this.safeDict (market, 'info', {});
        const pair = this.safeString (marketInfo, 'pair');
        const request: Dict = {
            'pair': pair,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.public2GetMarketDataTradeHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "p": 0.00000153,
        //             "q": 10971,
        //             "s": "SNTBTC",
        //             "T": 1663742387385,
        //             "m": true
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://docs.coindcx.com/?javascript#account-trade-history
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum amount of trades to fetch (default 500, min 1, max 5000)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest trade to fetch (default now)
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {int} [params.from_id] trade ID after which you want the data. If not supplied, trades in ascending order will be returned
         * @param {int} [params.sort] specify asc or desc to get trades in ascending or descending order, default: asc
         * @returns {Trade[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {};
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['from_timestamp'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['to_timestamp'] = until;
            params = this.omit (params, 'until');
        }
        const response = await this.privatePostExchangeV1OrdersTradeHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 113754608,
        //             "order_id": "fcaae278-2a73-11ef-a2d5-5374ccb4f829",
        //             "side": "buy",
        //             "fee_amount": "0.00000000000000",
        //             "ecode": "B",
        //             "quantity": "0.00010000000000",
        //             "price": "65483.14000000000000",
        //             "symbol": "BTCUSDT",
        //             "timestamp": 1718386312255.3608
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        //
        // public fetchTrades
        //
        //     {
        //         "p": 0.00000153,
        //         "q": 10971,
        //         "s": "SNTBTC",
        //         "T": 1663742387385,
        //         "m": true
        //     }
        //
        // private fetchMyTrades
        //
        //     {
        //         "id": 113754608,
        //         "order_id": "fcaae278-2a73-11ef-a2d5-5374ccb4f829",
        //         "side": "buy",
        //         "fee_amount": "0.00000000000000",
        //         "ecode": "B",
        //         "quantity": "0.00010000000000",
        //         "price": "65483.14000000000000",
        //         "symbol": "BTCUSDT",
        //         "timestamp": 1718386312255.3608
        //     }
        //
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger2 (trade, 'T', 'timestamp');
        const isMaker = this.safeBool (trade, 'm');
        let takerOrMaker: Str = undefined;
        if (isMaker) {
            takerOrMaker = 'maker';
        } else if (isMaker !== undefined) {
            takerOrMaker = 'taker';
        }
        const fee = {
            'cost': this.safeString (trade, 'fee_amount'),
            'currency': undefined,
        };
        return this.safeTrade ({
            'id': this.safeString (trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'order': this.safeString (trade, 'order_id'),
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': takerOrMaker,
            'price': this.safeString2 (trade, 'p', 'price'),
            'amount': this.safeString2 (trade, 'q', 'quantity'),
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name coindcx#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.coindcx.com/?javascript#get-balances
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostExchangeV1UsersBalances (params);
        //
        //     [
        //         {
        //             "balance": "80.0",
        //             "locked_balance": "0.0",
        //             "currency": "USDT"
        //         },
        //         {
        //             "balance": "0.0",
        //             "locked_balance": "0.0",
        //             "currency":"XRP"
        //         }
        //     ]
        //
        return this.parseBalance (response);
    }

    parseBalance (balances): Balances {
        const result: Dict = {
            'info': balances,
        };
        for (let i = 0; i < balances.length; i++) {
            const balanceEntry = this.safeDict (balances, i, {});
            const currencyId = this.safeString (balanceEntry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balanceEntry, 'balance');
            account['used'] = this.safeString (balanceEntry, 'locked_balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name coindcx#createOrder
         * @description create a trade order
         * @see https://docs.coindcx.com/?python#new-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit', 'stop_limit', 'stop_market', 'take_profit_limit', 'take_profit_market'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.clientOrderId] *for spot markets without margin only* a unique id for the order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isSpot = market['spot'];
        if (isSpot) {
            const isMargin = market['margin'];
            if (isMargin) {
                return this.createSpotMarginOrder (symbol, type, side, amount, price, params);
            } else {
                return this.createSpotOrderWithoutMargin (symbol, type, side, amount, price, params);
            }
        }
    }

    async createSpotMarginOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit', 'stop_limit', 'take_profit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.leverage] the rate of leverage
         * @param {float} [params.triggerPrice] triggerPrice at which the attached take profit / stop loss order will be triggered
         * @param {float} [params.stopLossPrice] stop loss trigger price
         * @param {float} [params.takeProfitPrice] take profit trigger price
         */
        const market = this.market (symbol);
        // todo check and add trailing_sl and target_price
        const marketInfo = this.safeDict (market, 'info', {});
        const request: Dict = {
            'market': market['id'],
            'order_type': this.encodeOrderType (type),
            'side': side,
            'quantity': this.amountToPrecision (symbol, amount),
            'ecode': this.safeString (marketInfo, 'ecode'),
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        if ((type === 'market') || (type === 'limit')) {
            if (stopLossPrice !== undefined) {
                request['order_type'] = 'stop_limit';
            } else if (takeProfitPrice !== undefined) {
                request['order_type'] = 'take_profit';
            }
        }
        const triggerPrice = this.safeStringN (params, [ 'triggerPrice', 'stopLossPrice', 'takeProfitPrice' ]);
        if (triggerPrice !== undefined) {
            request['stop_price'] = this.priceToPrecision (symbol, triggerPrice);
        }
        const response = this.privatePostExchangeV1MarginCreate (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "93c5ecee-2bdb-11ef-8777-0bea7a6ac553",
        //             "side": "buy",
        //             "status": "init",
        //             "market": "ACHUSDT",
        //             "order_type": "market_order",
        //             "base_currency_name": null,
        //             "target_currency_name": null,
        //             "base_currency_short_name": null,
        //             "target_currency_short_name": null,
        //             "base_currency_precision": null,
        //             "target_currency_precision": null,
        //             "trailing_sl": false,
        //             "trail_percent": null,
        //             "avg_entry": 0.0,
        //             "avg_exit": 0.0,
        //             "maker_fee": 0.1,
        //             "taker_fee": 0.1,
        //             "fee": 0.1,
        //             "entry_fee": 0.0,
        //             "exit_fee": 0.0,
        //             "active_pos": 0.0,
        //             "exit_pos": 0.0,
        //             "total_pos": 0.0,
        //             "quantity": 1.0,
        //             "price": 0.02414,
        //             "sl_price": 0.00483,
        //             "target_price": 0.0,
        //             "stop_price": 0.0,
        //             "pnl": 0.0,
        //             "initial_margin": 0.02418828,
        //             "interest": 0.0667,
        //             "interest_amount": 0.0,
        //             "interest_amount_updated_at": 0,
        //             "interest_free_hours": 1.0,
        //             "leverage": 1.0,
        //             "result": null,
        //             "tds_amount": null,
        //             "margin_tds_records": [],
        //             "created_at": 1718540754877,
        //             "updated_at": 1718540754877,
        //             "orders": [
        //                 {
        //                     "id": 104430986,
        //                     "order_type": "market_order",
        //                     "status": "initial",
        //                     "market": "ACHUSDT",
        //                     "side": "buy",
        //                     "avg_price": 0.0,
        //                     "total_quantity": 1.0,
        //                     "remaining_quantity": 1.0,
        //                     "price_per_unit": 0.0,
        //                     "timestamp": 1718540754920.9573,
        //                     "maker_fee": 0.1,
        //                     "taker_fee": 0.1,
        //                     "fee": 0.1,
        //                     "fee_amount": 0.0,
        //                     "filled_quantity": 0.0,
        //                     "bo_stage": "stage_entry",
        //                     "cancelled_quantity": 0.0,
        //                     "stop_price": 0.0
        //                 }
        //             ]
        //         }
        //     ]
        //
        const order = this.safeDict (response, 0, {});
        return this.parseOrder (order, market);
    }

    async createSpotOrderWithoutMargin (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.clientOrderId] a unique id for the order
         */
        const market = this.market (symbol);
        // todo throw an exception for margin params
        const request: Dict = {
            'market': market['id'],
            'order_type': this.encodeOrderType (type),
            'side': side,
            'total_quantity': this.amountToPrecision (symbol, amount),
        };
        if (price !== undefined) {
            request['price_per_unit'] = this.priceToPrecision (symbol, price);
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        const response = await this.privatePostExchangeV1OrdersCreate (this.extend (request, params));
        //
        //     {
        //         "orders": [
        //             {
        //                 "id": "fcaae278-2a73-11ef-a2d5-5374ccb4f829",
        //                 "client_order_id": null,
        //                 "order_type": "market_order",
        //                 "side": "buy",
        //                 "status": "open",
        //                 "fee_amount": 0.0,
        //                 "fee": 0.0,
        //                 "maker_fee": 0.0,
        //                 "taker_fee": 0.0,
        //                 "total_quantity": 0.0001,
        //                 "remaining_quantity": 0.0001,
        //                 "source": "web",
        //                 "base_currency_name": null,
        //                 "target_currency_name": null,
        //                 "base_currency_short_name": null,
        //                 "target_currency_short_name": null,
        //                 "base_currency_precision": null,
        //                 "target_currency_precision": null,
        //                 "avg_price": 0.0,
        //                 "price_per_unit": 65483.14,
        //                 "stop_price": 0.0,
        //                 "market": "BTCUSDT",
        //                 "time_in_force": "good_till_cancel",
        //                 "created_at": 1718386312000,
        //                 "updated_at": 1718386312000,
        //                 "trades": null
        //             }
        //         ]
        //     }
        //
        const orders = this.safeList (response, 'orders', []);
        const order = this.safeDict (orders, 0, {});
        return this.parseOrder (order, market);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name coindcx#fetchOrder
         * @see https://docs.coindcx.com/?javascript#order-status
         * @description fetches information on an order made by the user
         * @param {string} id a unique id for the order
         * @param {string} [symbol] not used by coindcx fetchOrder
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.clientOrderId] the client order id of the order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {
            'id': id,
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        const response = await this.privatePostExchangeV1OrdersStatus (this.extend (request, params));
        //
        //     {
        //         "id": "fcaae278-2a73-11ef-a2d5-5374ccb4f829",
        //         "client_order_id": null,
        //         "order_type": "market_order",
        //         "side": "buy",
        //         "status": "filled",
        //         "fee_amount": 0.0,
        //         "fee": 0.0,
        //         "maker_fee": 0.0,
        //         "taker_fee": 0.0,
        //         "total_quantity": 0.0001,
        //         "remaining_quantity": 0.0,
        //         "source": "web",
        //         "base_currency_name": null,
        //         "target_currency_name": null,
        //         "base_currency_short_name": null,
        //         "target_currency_short_name": null,
        //         "base_currency_precision": null,
        //         "target_currency_precision": null,
        //         "avg_price": 65483.14,
        //         "price_per_unit": 65483.14,
        //         "stop_price": 0.0,
        //         "market": "BTCUSDT",
        //         "time_in_force": "good_till_cancel",
        //         "created_at": 1718386312000,
        //         "updated_at": 1718386312000,
        //         "trades": null
        //     }
        //
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name coindcx#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://docs.coindcx.com/#active-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] not used by coindxc
         * @param {int} [limit] not used by coindxc
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.orderId] a unique id for the order
         * @param {int} [params.clientOrderId] the client order id of the order
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {int} [params.side] toggle between 'buy' or 'sell'
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        const response = await this.privatePostExchangeV1OrdersActiveOrders (this.extend (request, params));
        //
        //     {
        //         "orders": [
        //             {
        //                 "id": "2614a58a-2b29-11ef-8787-833693318846",
        //                 "user_id": "390ec282-4f54-47c2-9cc3-c842a8834b88",
        //                 "fee": 0.0,
        //                 "fee_amount": 0.0,
        //                 "side": "buy",
        //                 "order_type": "limit_order",
        //                 "status": "open",
        //                 "total_quantity": 0.0001,
        //                 "remaining_quantity": 0.0001,
        //                 "price_per_unit": 60000.0,
        //                 "created_at": "2024-06-15T15:08:40.430Z",
        //                 "updated_at": "2024-06-15T15:08:40.430Z",
        //                 "market": "BTCUSDT",
        //                 "market_order_locked": 6.0,
        //                 "avg_price": 0.0,
        //                 "ecode": "B",
        //                 "stop_price": 0.0,
        //                 "notification": "no_notification",
        //                 "source": "web",
        //                 "maker_fee": 0.0,
        //                 "taker_fee": 0.0,
        //                 "time_in_force": "good_till_cancel",
        //                 "locked_spot_balance": true,
        //                 "closed_at": null,
        //                 "client_order_id": null
        //             }
        //         ],
        //         "details": false,
        //         "cp": false,
        //         "cp_hash": {}
        //     }
        //
        const orders = this.safeList (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#cancelOrder
         * @description cancels an open order
         * @see https://docs.coindcx.com/?javascript#cancel
         * @param {string} id order id
         * @param {string} symbol not used by coindcx cancelOrder
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.client_order_id] a unique id for the order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {
            'id': id,
        };
        //
        //     {
        //         "message": "success",
        //         "status": 200,
        //         "code": 200
        //     }
        //
        return await this.privatePostExchangeV1OrdersCancel (this.extend (request, params));
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#cancelAllOrders
         * @description cancel all open orders
         * @see https://docs.coindcx.com/?javascript#cancel-all
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {int} [params.side] toggle between 'buy' or 'sell'
         * @returns {object} response from exchange
         */
        const request: Dict = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['market'] = market['id'];
        }
        //
        //     {
        //         "message": "success",
        //         "status": 200,
        //         "code": 200
        //     }
        //
        return await this.privatePostExchangeV1OrdersCancelAll (this.extend (request, params));
    }

    async cancelOrders (ids:string[], symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name coindcx#cancelOrders
         * @description cancel multiple orders
         * @see https://docs.coindcx.com/?javascript#cancel-multiple-by-ids
         * @param {string[]} ids order ids
         * @param {string} [symbol] not used by coindcx cancelOrders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.client_order_ids] Array of Client Order IDs
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'orderIds': ids,
        };
        //
        //     {
        //         "message": "success",
        //         "status": 200,
        //         "code": 200
        //     }
        //
        return await this.privatePostExchangeV1OrdersCancelByIds (this.extend (request, params));
    }

    parseOrder (order, market: Market = undefined): Order {
        //
        // createOrder, fetchOrder
        //     {
        //         "id": "fcaae278-2a73-11ef-a2d5-5374ccb4f829",
        //         "client_order_id": null,
        //         "order_type": "market_order",
        //         "side": "buy",
        //         "status": "open",
        //         "fee_amount": 0.0,
        //         "fee": 0.0,
        //         "maker_fee": 0.0,
        //         "taker_fee": 0.0,
        //         "total_quantity": 0.0001,
        //         "remaining_quantity": 0.0001,
        //         "source": "web",
        //         "base_currency_name": null,
        //         "target_currency_name": null,
        //         "base_currency_short_name": null,
        //         "target_currency_short_name": null,
        //         "base_currency_precision": null,
        //         "target_currency_precision": null,
        //         "avg_price": 0.0,
        //         "price_per_unit": 65483.14,
        //         "stop_price": 0.0,
        //         "market": "BTCUSDT",
        //         "time_in_force": "good_till_cancel",
        //         "created_at": 1718386312000,
        //         "updated_at": 1718386312000,
        //         "trades": null // todo check
        //     }
        //
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (order, 'created_at');
        const fee = {
            'currency': undefined,
            'cost': this.safeNumber (order, 'fee_amount'),
        };
        const status = this.safeString (order, 'status');
        const triggerPrice = this.omitZero (this.safeString (order, 'stop_price'));
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined, // todo check
            'lastUpdateTimestamp': this.safeInteger (order, 'updated_at'),
            'status': this.parseOrderStatus (status),
            'symbol': market['symbol'],
            'type': this.parseOrderType (this.safeString (order, 'order_type')),
            'timeInForce': this.parseOrderTimeInForce (this.safeString (order, 'time_in_force')), // only for limit orders
            'side': this.safeString (order, 'side'),
            'price': this.safeString (order, 'price_per_unit'),
            'average': this.omitZero (this.safeString (order, 'avg_price')),
            'amount': this.safeString (order, 'total_quantity'),
            'filled': undefined,
            'remaining': this.safeString (order, 'remaining_quantity'),
            'triggerPrice': triggerPrice,
            'takeProfitPrice': undefined, // todo check
            'stopLossPrice': undefined, // todo check
            'cost': undefined,
            'trades': undefined,
            'fee': fee,
            'info': order,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses: Dict = {
            'open': 'open',
            'init': 'open', // todo check
            'partially_filled': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'partially_cancelled': 'canceled',
            'rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type) {
        const types: Dict = {
            'market_order': 'market',
            'limit_order': 'limit',
        };
        return this.safeString (types, type, type);
    }

    parseOrderTimeInForce (type) {
        const types: Dict = {
            'good_till_cancel': 'GTC',
            'immediate_or_cancel': 'IOC',
            'fill_or_kill': 'FOK',
        };
        return this.safeString (types, type, type);
    }

    encodeOrderType (type) {
        const types = {
            'market': 'market_order',
            'limit': 'limit_order',
        };
        return this.safeString (types, type, type);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (method === 'POST') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ();
            const secret = this.encode (this.secret);
            params['timestamp'] = timestamp;
            const payload = this.json (params);
            const signature = this.hmac (this.encode (payload), secret, sha256);
            headers = {
                'Content-Type': 'application/json',
                'X-AUTH-APIKEY': this.apiKey,
                'X-AUTH-SIGNATURE': signature,
            };
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
