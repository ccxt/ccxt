import Exchange from './abstract/coinlist.js';
// import { ExchangeError } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
// import { Precise } from './base/Precise.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
// import { Int, OrderSide, OrderType } from './base/types.js';

/**
 * @class coinlist
 * @extends Exchange
 */
export default class coinlist extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinlist',
            'name': 'Coinlist',
            // todo: find out countries
            'countries': [ 'CO' ], // Columbia
            'version': 'v1',
            'rateLimit': 300, // 1000 per 5 minutes
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
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
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayMargin': false,
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
                '30m': '30m',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://trade-api.coinlist.co',
                    'private': 'https://trade-api.coinlist.co',
                },
                'www': 'https://coinlist.co',
                'doc': [
                    'https://trade-docs.coinlist.co',
                ],
                'fees': '', // todo
            },
            'api': {
                'public': {
                    'get': {
                        'v1/time': 1,
                        'v1/symbols': 1,
                        'v1/symbols/{symbol}': 1, // todo: should I implement this one?
                        'v1/symbols/summary': 1,
                        'v1/symbols/{symbol}/summary': 1,
                        'v1/symbols/{symbol}/book': 1,
                        'v1/symbols/{symbol}/candles': 1,
                        // todo
                    },
                },
                'private': {
                    'get': {
                        // todo
                    },
                    'post': {
                        // todo
                    },
                    'delete': {
                        // todo
                    },
                },
            },
            'fees': {
                // todo
            },
            'precisionMode': TICK_SIZE,
            // exchange-specific options
            'options': {
                'createMarketBuyOrderRequiresPrice': true, // true or false
            },
            // https://trade-docs.coinlist.co/?javascript--nodejs#cancel-all-after-dead-man-39-s-switch
            'exceptions': {
                'exact': {
                    // to do: add
                },
                'broad': {
                    // to do: add
                },
            },
        });
    }

    calculateRateLimiterCost (api, method, path, params, config = {}) {
        // todo
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name coinlist#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} [params] extra parameters specific to the coinlist api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetV1Time (params);
        //
        //     {
        //         "epoch": 1698087996.039,
        //         "iso": "2023-10-23T19:06:36.039Z"
        //     }
        //
        const string = this.safeString (response, 'iso');
        return this.parse8601 (string);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name coinlist#fetchMarkets
         * @description retrieves data on all markets for coinlist
         * @param {object} [params] extra parameters specific to the exchange api endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetV1Symbols (params);
        //
        //     {
        //         symbols: [
        //             {
        //                 symbol: 'CQT-USDT',
        //                 base_currency: 'CQT',
        //                 is_trader_geofenced: false,
        //                 list_time: '2021-06-15T00:00:00.000Z',
        //                 type: 'spot',
        //                 series_code: 'CQT-USDT-SPOT',
        //                 long_name: 'Covalent',
        //                 asset_class: 'CRYPTO',
        //                 minimum_price_increment: '0.0001',
        //                 minimum_size_increment: '0.0001',
        //                 quote_currency: 'USDT',
        //                 index_code: null,
        //                 price_band_threshold_market: '0.05',
        //                 price_band_threshold_limit: '0.25',
        //                 last_price: '0.12160000',
        //                 fair_price: '0.12300000',
        //                 index_price: null
        //             },
        //         ]
        //     }
        //
        const markets = this.safeValue (response, 'symbols');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const amountPrecision = this.safeString (market, 'minimum_size_increment');
            const pricePrecision = this.safeString (market, 'minimum_price_increment');
            const created = this.safeString (market, 'list_time');
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': this.safeStringLower (market, 'status') === 'trading',
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': undefined,
                'maker': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
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
                'created': this.parse8601 (created),
                'info': market,
            });
        }
        this.setMarkets (result);
        return result;
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name coinlist#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the coinlist api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
         */
        await this.loadMarkets ();
        const request = {};
        const tickers = await this.publicGetV1SymbolsSummary (this.extend (request, params));
        //
        //     {
        //         "MATIC-USD": {
        //             "type":"spot",
        //             "last_price":"0.60990000",
        //             "lowest_ask":"0.61190000",
        //             "highest_bid":"0.60790000",
        //             "last_trade": {
        //                 "price":"0.60000000",
        //                 "volume":"2.0000",
        //                 "imbalance":"198.0000",
        //                 "logicalTime":"2023-10-22T23:02:25.000Z",
        //                 "auctionCode":"MATIC-USD-2023-10-22T23:02:25.000Z"
        //         },
        //             "volume_base_24h":"34.0555",
        //             "volume_quote_24h":"19.9282",
        //             "price_change_percent_24h":"7.50925436",
        //             "highest_price_24h":"0.68560000",
        //             "lowest_price_24h":"0.55500000"
        //         },
        //     }
        //
        return this.parseTickers (tickers, symbols, params);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name coinlist#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the coinlist api endpoint
         * @returns {object} a [ticker structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const ticker = await this.publicGetV1SymbolsSymbolSummary (this.extend (request, params));
        //
        //     {
        //         "type":"spot",
        //         "last_price":"31125.00000000",
        //         "lowest_ask":"31349.99000000",
        //         "highest_bid":"30900.00000000",
        //         "last_trade": {
        //             "price":"31000.00000000",
        //             "volume":"0.0003",
        //             "imbalance":"0.0000",
        //             "logicalTime":"2023-10-23T16:57:15.000Z",
        //             "auctionCode":"BTC-USDT-2023-10-23T16:57:15.000Z"
        //         },
        //         "volume_base_24h":"0.3752",
        //         "volume_quote_24h":"11382.7181",
        //         "price_change_percent_24h":"3.66264694",
        //         "highest_price_24h":"31225.12000000",
        //         "lowest_price_24h":"29792.81000000"
        //     }
        //
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "type":"spot",
        //         "last_price":"0.60990000",
        //         "lowest_ask":"0.61190000",
        //         "highest_bid":"0.60790000",
        //         "last_trade": {
        //             "price":"0.60000000",
        //             "volume":"2.0000",
        //             "imbalance":"198.0000",
        //             "logicalTime":"2023-10-22T23:02:25.000Z",
        //             "auctionCode":"MATIC-USD-2023-10-22T23:02:25.000Z"
        //          },
        //         "volume_base_24h":"34.0555",
        //         "volume_quote_24h":"19.9282",
        //         "price_change_percent_24h":"7.50925436",
        //         "highest_price_24h":"0.68560000",
        //         "lowest_price_24h":"0.55500000"
        //     }
        //
        // todo: check for open price and volumes
        const lastTrade = this.safeValue (ticker, 'last_trade');
        const timestamp = this.parse8601 (this.safeString (lastTrade, 'logicalTime'));
        const bid = this.safeString (ticker, 'highest_bid');
        const ask = this.safeString (ticker, 'lowest_ask');
        const baseVolume = this.safeString (ticker, 'volume_base_24h');
        const quoteVolume = this.safeString (ticker, 'volume_quote_24h');
        const high = this.safeString (ticker, 'highest_price_24h');
        const low = this.safeString (ticker, 'lowest_price_24h');
        const close = this.safeString (ticker, 'last_price');
        const changePcnt = this.safeString (ticker, 'price_change_percent_24h');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'open': undefined,
            'high': high,
            'low': low,
            'close': close,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': changePcnt,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coinlist#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 200)
         * @param {object} [params] extra parameters specific to the coinlist api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1SymbolsSymbolBook (this.extend (request, params));
        //
        //     {
        //         "bids": [
        //             [ "30900.00000000", "0.0001" ],
        //             [ "30664.21000000", "0.0172" ],
        //             [ "30664.20000000", "0.0906" ],
        //         ],
        //         "asks": [
        //             [ "31349.99000000", "0.0003" ],
        //             [ "31350.00000000", "0.0023" ],
        //             [ "31359.33000000", "0.0583" ],
        //         ],
        //         "after_auction_code": "BTC-USDT-2023-10-23T18:40:51.000Z",
        //         "call_time": "2023-10-23T18:40:51.068Z",
        //         "logical_time": "2023-10-23T18:40:51.000Z"
        //     }
        //
        const logical_time = this.parse8601 (this.safeString (response, 'logical_time')); // todo: check what time to use
        const call_time = this.parse8601 (this.safeString (response, 'call_time'));
        const orderbook = this.parseOrderBook (response, symbol, logical_time);
        orderbook['nonce'] = call_time;
        return orderbook;
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coinlist#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch (default 500, max 1000)
         * @param {object} [params] extra parameters specific to the coinlist api endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const granularity = this.safeString (this.timeframes, timeframe);
        const request = {
            'symbol': market['id'],
            'granularity': granularity,
        };
        if (since !== undefined) {
            request['start_time'] = this.iso8601 (since);
            if (limit !== undefined) {
                const duration = this.parseTimeframe (timeframe) * 1000;
                request['end_time'] = this.iso8601 (this.sum (since, duration * (limit)));
            } else {
                request['end_time'] = this.iso8601 (this.milliseconds ());
            }
        }
        const response = await this.publicGetV1SymbolsSymbolCandles (this.extend (request, params));
        //
        //     {
        //         "candles": [
        //             [
        //                 "2023-10-17T15:00:00.000Z",
        //                 "28522.96000000",
        //                 "28522.96000000",
        //                 "28522.96000000",
        //                 "28522.96000000",
        //                 "0.1881",
        //                 null
        //             ],
        //             [
        //                 "2023-10-17T15:30:00.000Z",
        //                 "28582.64000000",
        //                 "28582.64000000",
        //                 "28582.64000000",
        //                 "28582.64000000",
        //                 "0.0050",
        //                 null
        //             ]
        //         ]
        //     }
        //
        // todo: response doesnt match GUI
        const candles = this.safeValue (response, 'candles', []);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.parse8601 (this.safeString (ohlcv, 0)),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.omit (params, this.extractParams (path));
        const endpoint = this.implodeParams (path, params);
        url = url + '/' + endpoint;
        if (api === 'private') {
            // todo
        } else {
            query = this.urlencode (query);
            if (query.length !== 0) {
                url += '?' + query;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
