
//  ---------------------------------------------------------------------------

import Exchange from './abstract/coindcx.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Dict, IndexType, Int, Market, Num, OHLCV, OrderBook, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';

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
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
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
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
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
            'precisionMode': TICK_SIZE,
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
        const max_leverage: Num = this.safeNumber (market, 'max_leverage');
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
                'amount': this.safeNumber (market, 'target_currency_precision'),
                'price': this.safeNumber (market, 'base_currency_precision'),
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
        const marketInfo = this.safeDict (market, 'info');
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
        const marketInfo = this.safeDict (market, 'info');
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
        const marketInfo = this.safeDict (market, 'info');
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
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (trade, 'T');
        const isMaker = this.safeBool (trade, 'm');
        let takerOrMaker: Str = undefined;
        if (isMaker) {
            takerOrMaker = 'maker';
        } else if (isMaker !== undefined) {
            takerOrMaker = 'taker';
        }
        return this.safeTrade ({
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'order': undefined,
            'side': undefined,
            'takerOrMaker': takerOrMaker,
            'price': this.safeString (trade, 'p'),
            'amount': this.safeString (trade, 'q'),
            'cost': undefined,
            'fee': undefined,
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
            url += this.urlencode (params);
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
