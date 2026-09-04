
//  ---------------------------------------------------------------------------

import Exchange from './abstract/polymarket.js';
import { ExchangeError, AuthenticationError, BadRequest, BadSymbol, RateLimitExceeded, ExchangeNotAvailable, ArgumentsRequired } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Dict, Int, Str, Strings, Market, Currencies, NullableDict, Ticker, Tickers, OrderBook, Trade, OHLCV, FundingRate, FundingRates, FundingRateHistory, OpenInterest, OpenInterests, TradingFees, Status, List, Endpoint, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class polymarket
 * @description Polymarket perpetual futures - a hybrid dex with an off-chain order book and on-chain settlement of collateral. The venue trades linear perpetual contracts on crypto, indices, equities and commodities, quoted using USD and collateralized exclusively with pUSD. The prediction-market CLOB is a separate product, integrated as ccxt.prediction.polymarket
 * @augments Exchange
 */
export default class polymarket extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'polymarket',
            'name': 'Polymarket',
            'countries': [ 'US' ],
            'version': 'v1',
            // 1000 weighted tokens per minute per IP -> 60ms per weight unit
            'rateLimit': 60,
            'certified': false,
            'pro': true,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createOrder': false,
                'createOrders': false,
                'createReduceOnlyOrder': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchBidsAsks': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterests': true,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1s': '1s',
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/89e1a2c4-a682-44e7-ad50-9fb15b534437',
                'api': {
                    'public': 'https://api.perpetuals.polymarket.com/v1',
                },
                'www': 'https://polymarket.com/perps',
                'doc': [
                    'https://docs.polymarket.com/perps/overview',
                    'https://docs.polymarket.com/api-reference/perps/overview',
                ],
                'fees': 'https://docs.polymarket.com/perps/learn-about-trading/fees',
            },
            'api': {
                'public': {
                    'get': {
                        'info/ping': { 'cost': 1 } as Endpoint<Dict>,
                        'info/time': { 'cost': 1 } as Endpoint<Dict>,
                        'info/exchange': { 'cost': 2 } as Endpoint<Dict>,
                        'info/assets': { 'cost': 2 } as Endpoint<List>,
                        'info/instruments': { 'cost': 2 } as Endpoint<List>,
                        'info/tickers': { 'cost': 2 } as Endpoint<List>,
                        'info/statistics': { 'cost': 2 } as Endpoint<List>,
                        'info/klines': { 'cost': 5 } as Endpoint<Dict>,
                        'info/mark-history': { 'cost': 5 } as Endpoint<Dict>,
                        'info/bbo': { 'cost': 2 } as Endpoint<List>,
                        'info/book': { 'cost': 5 } as Endpoint<Dict>,
                        'info/index': { 'cost': 2 } as Endpoint<Dict>,
                        'info/trades': { 'cost': 10 } as Endpoint<Dict>,
                        'info/portfolio': { 'cost': 5 } as Endpoint<Dict>,
                        'info/position-fills': { 'cost': 10 } as Endpoint<Dict>,
                        'info/funding': { 'cost': 10 } as Endpoint<Dict>,
                        'info/fees': { 'cost': 2 } as Endpoint<Dict>,
                        'info/limit-tiers': { 'cost': 2 } as Endpoint<List>,
                        'info/invite': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'requiredCredentials': {
                // only public market data is implemented so far - trading auth
                // is self-provisioned from walletAddress + privateKey and will
                // flip these flags when private methods land
                'apiKey': false,
                'secret': false,
                'walletAddress': false,
                'privateKey': false,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    // tier-0 rates from GET /v1/info/fees, shared by every category
                    'taker': this.parseNumber ('0.0004'),
                    'maker': this.parseNumber ('0.000125'),
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
            },
            'exceptions': {
                'exact': {
                    'unauthorized': AuthenticationError,
                    'ip_rate_limited': RateLimitExceeded,
                    'action_rate_limited': RateLimitExceeded,
                    'message_rate_limited': RateLimitExceeded,
                    'service_unavailable': ExchangeNotAvailable,
                },
                'broad': {
                    'invalid query parameters': BadRequest,
                    'invalid path parameters': BadRequest,
                    'invalid instrument': BadRequest,
                },
            },
            'features': {
                'spot': undefined,
                'forPerps': {
                    'sandbox': false,
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forPerps',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
        });
    }

    /**
     * @method
     * @name polymarket#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.polymarket.com/perps/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    override async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetInfoTime (params);
        //
        //     { "time": 1788524530209 }
        //
        return this.safeInteger (response, 'time');
    }

    /**
     * @method
     * @name polymarket#fetchStatus
     * @description the latest known information on the availability of the exchange api
     * @see https://docs.polymarket.com/perps/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    override async fetchStatus (params = {}): Promise<Status> {
        const response = await this.publicGetInfoExchange (params);
        //
        //     {
        //         "name": "Polymarket",
        //         "version": "1",
        //         "chain_id": 137,
        //         "contract": "0xDCa4af75705dbB50f62437045afF9921947917d2",
        //         "cancel_only": false,
        //         "engine_version": "0.0.69"
        //     }
        //
        const cancelOnly = this.safeBool (response, 'cancel_only', false);
        return {
            'status': (cancelOnly === true) ? 'maintenance' : 'ok',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name polymarket#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.polymarket.com/perps/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    override async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetInfoAssets (params);
        //
        //     [
        //         {
        //             "asset": "pUSD",
        //             "address": "0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB",
        //             "decimals": 6,
        //             "collateral_ratio": "1.00",
        //             "withdrawal_fee": "0.000000"
        //         }
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const currencyId = this.safeString (currency, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            result[code as string] = this.safeCurrencyStructure ({
                'id': currencyId,
                'code': code,
                'name': currencyId,
                'info': currency,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': this.safeNumber (currency, 'withdrawal_fee'),
                'precision': this.parseNumber (this.parsePrecision (this.safeString (currency, 'decimals'))),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'type': 'crypto',
                'networks': {},
            });
        }
        return result;
    }

    /**
     * @method
     * @name polymarket#fetchMarkets
     * @description retrieves data on all markets for polymarket perps
     * @see https://docs.polymarket.com/perps/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetInfoInstruments (params);
        //
        //     [
        //         {
        //             "instrument_id": 1,
        //             "instrument_type": "perpetual",
        //             "category": "index",
        //             "isolated_only": false,
        //             "symbol": "SP500-USD",
        //             "base_asset": "SP500",
        //             "quote_asset": "pUSD",
        //             "funding_interval": "1h",
        //             "quantity_decimals": 5,
        //             "price_decimals": 1,
        //             "price_bounds": "0.05",
        //             "liquidation_fee": "0.005",
        //             "max_order_count": 200,
        //             "min_notional": "10",
        //             "max_market_notional": "1000000",
        //             "max_limit_notional": "5000000",
        //             "max_leverage": 20,
        //             "risk_tiers": [ { "lower_bound": "0", "max_leverage": 20 } ],
        //             "ui_live_time": 1785542400000
        //         }
        //     ]
        //
        return this.parseMarkets (response);
    }

    override parseMarket (market: Dict): Market {
        const numericId = this.safeString (market, 'instrument_id');
        const venueSymbol = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'base_asset');
        // prices are denominated using USD while pUSD is the 1:1 collateral and settlement token
        const settleId = this.safeString (market, 'quote_asset');
        const parts = (venueSymbol as string).split ('-');
        const quoteId = this.safeString (parts, 1, 'USD');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        const crossAllowed = !(this.safeBool (market, 'isolated_only', false));
        return this.safeMarketStructure ({
            'id': numericId,
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
            'active': undefined,
            'contract': true,
            'linear': true,
            'inverse': false,
            // tier-0 rates from GET /v1/info/fees, shared by every category
            'taker': this.parseNumber ('0.0004'),
            'maker': this.parseNumber ('0.000125'),
            'contractSize': this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'marginModes': {
                'cross': crossAllowed,
                'isolated': true,
            },
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'quantity_decimals'))),
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'price_decimals'))),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': this.safeNumber (market, 'max_leverage'),
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
                    'min': this.safeNumber (market, 'min_notional'),
                    'max': this.safeNumber (market, 'max_limit_notional'),
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name polymarket#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market, merging the ticker, statistics and best bid and ask endpoints
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        // the tickers and statistics endpoints ignore the documented
        // instrument_id filter and always answer with every instrument, so
        // the single-market call reuses the bulk fetch and selects one row
        const tickers = await this.fetchTickers ([ symbol ], params);
        const ticker = this.safeDict (tickers, symbol);
        if (ticker === undefined) {
            throw new BadSymbol (this.id + ' fetchTicker() could not find a ticker for ' + symbol);
        }
        return ticker as Ticker;
    }

    /**
     * @method
     * @name polymarket#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market, merging the ticker, statistics and best bid and ask endpoints
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const promises = [
            this.publicGetInfoTickers (params),
            this.publicGetInfoStatistics (params),
            this.publicGetInfoBbo (params),
        ];
        const responses = await Promise.all (promises);
        //
        // tickers
        //
        //     [
        //         {
        //             "instrument_id": 1,
        //             "symbol": "SP500-USD",
        //             "index_price": "7713.1",
        //             "mark_price": "7715",
        //             "last_price": "7714",
        //             "mid_price": "7715",
        //             "open_interest": "1101.82729",
        //             "funding_rate": "0.00000625",
        //             "next_funding": 1788548400000,
        //             "timestamp": 1788546972857
        //         }
        //     ]
        //
        // statistics
        //
        //     [
        //         {
        //             "instrument_id": 1,
        //             "symbol": "SP500-USD",
        //             "volume": "2087643.9565559996",
        //             "open_price": "7754.5",
        //             "klines": [ [ 1788458400000, "7754.5", "7754.5", "7751.4", "7751.4", "0.39184", 3 ] ]
        //         }
        //     ]
        //
        // bbo
        //
        //     [
        //         {
        //             "instrument_id": 1,
        //             "bid_price": "7715",
        //             "bid_quantity": "22.63803",
        //             "ask_price": "7715.1",
        //             "ask_quantity": "0.95534",
        //             "timestamp": 1788546975038
        //         }
        //     ]
        //
        const merged: Dict = {};
        const statistics = responses[1];
        for (let i = 0; i < statistics.length; i++) {
            const entry = statistics[i];
            const instrumentId = this.safeString (entry, 'instrument_id');
            // the 24 hourly kline rows are dropped from the merged payload to keep tickers light, candles are served by fetchOHLCV
            merged[instrumentId as string] = this.omit (entry, 'klines');
        }
        const bbos = responses[2];
        for (let i = 0; i < bbos.length; i++) {
            const entry = bbos[i];
            const instrumentId = this.safeString (entry, 'instrument_id');
            const previous = this.safeDict (merged, instrumentId, {});
            // the tickers endpoint timestamp wins the merge below, as most unified fields come from it - bbo rows carry a slightly newer sampling time
            merged[instrumentId as string] = this.extend (previous, entry);
        }
        const tickers = responses[0];
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            const entry = tickers[i];
            const instrumentId = this.safeString (entry, 'instrument_id');
            const previous = this.safeDict (merged, instrumentId, {});
            result.push (this.extend (previous, entry));
        }
        return this.parseTickers (result, symbols);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // merged row assembled by fetchTickers from the tickers, statistics and bbo endpoints
        //
        //     {
        //         "instrument_id": 1,
        //         "symbol": "SP500-USD",
        //         "volume": "2087643.9565559996",
        //         "open_price": "7754.5",
        //         "bid_price": "7715",
        //         "bid_quantity": "22.63803",
        //         "ask_price": "7715.1",
        //         "ask_quantity": "0.95534",
        //         "index_price": "7713.1",
        //         "mark_price": "7715",
        //         "last_price": "7714",
        //         "mid_price": "7715",
        //         "open_interest": "1101.82729",
        //         "funding_rate": "0.00000625",
        //         "next_funding": 1788548400000,
        //         "timestamp": 1788546972857
        //     }
        //
        const marketId = this.safeString (ticker, 'instrument_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (ticker, 'bid_price'),
            'bidVolume': this.safeString (ticker, 'bid_quantity'),
            'ask': this.safeString (ticker, 'ask_price'),
            'askVolume': this.safeString (ticker, 'ask_quantity'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'open_price'),
            'close': this.safeString (ticker, 'last_price'),
            'last': this.safeString (ticker, 'last_price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            // the statistics volume is denominated using pUSD, verified against the sum of hourly candle base volumes
            'quoteVolume': this.safeString (ticker, 'volume'),
            'markPrice': this.safeString (ticker, 'mark_price'),
            'indexPrice': this.safeString (ticker, 'index_price'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name polymarket#fetchBidsAsks
     * @description fetches the best bid and ask price and volume for multiple markets
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetInfoBbo (params);
        //
        //     [
        //         {
        //             "instrument_id": 1,
        //             "bid_price": "7715",
        //             "bid_quantity": "22.63803",
        //             "ask_price": "7715.1",
        //             "ask_quantity": "0.95534",
        //             "timestamp": 1788546975038
        //         }
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    /**
     * @method
     * @name polymarket#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return, must be one of 10, 100, 500 or 1000, the default is 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_id': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetInfoBook (this.extend (request, params));
        //
        //     {
        //         "instrument_id": 1,
        //         "bids": [ [ "7745.1", "0.319" ] ],
        //         "asks": [ [ "7745.2", "53.36141" ] ],
        //         "timestamp": 1788524545112,
        //         "sequence": 35631219797
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, market['symbol'], timestamp);
        orderbook['nonce'] = this.safeInteger (response, 'sequence');
        return orderbook;
    }

    /**
     * @method
     * @name polymarket#fetchTrades
     * @description get the list of the most recent trades for a particular symbol
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch, the venue serves at most 100 per request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_id': market['id'],
        };
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        const response = await this.publicGetInfoTrades (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "trade_id": 3738280849593744,
        //                 "instrument_id": 1,
        //                 "side": "long",
        //                 "price": "7714",
        //                 "quantity": "0.00136",
        //                 "timestamp": 1788546565789,
        //                 "hash": "0x"
        //             }
        //         ],
        //         "more": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "trade_id": 3738280849593744,
        //         "instrument_id": 1,
        //         "side": "long",
        //         "price": "7714",
        //         "quantity": "0.00136",
        //         "timestamp": 1788546565789,
        //         "hash": "0x"
        //     }
        //
        const marketId = this.safeString (trade, 'instrument_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        let side = this.safeStringLower (trade, 'side');
        if (side === 'long') {
            side = 'buy';
        } else if (side === 'short') {
            side = 'sell';
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'trade_id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'quantity'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name polymarket#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, the venue serves at most 1000 per request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling the endpoint multiple times
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, 1000) as OHLCV[];
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_id': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        const duration = this.parseTimeframe (timeframe) * 1000;
        if (since !== undefined) {
            request['start_timestamp'] = since;
        } else {
            // the venue requires an explicit range start - the window covers
            // exactly the requested number of candle bins including the
            // current one, so the newest candle never falls off the range
            const end = (until !== undefined) ? until : this.milliseconds ();
            const requestedLimit = (limit !== undefined) ? limit : 100;
            request['start_timestamp'] = end - (requestedLimit - 1) * duration;
        }
        const response = await this.publicGetInfoKlines (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             [ 1788458400000, "7754.5", "7754.5", "7751.4", "7751.4", "0.39184", 3 ]
        //         ],
        //         "more": false
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        //
        // rows carry the timestamp, open, high, low, close, base volume and the trade count
        //
        //     [ 1788458400000, "7754.5", "7754.5", "7751.4", "7751.4", "0.39184", 3 ]
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
     * @name polymarket#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    override async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        // the tickers endpoint ignores the documented instrument_id filter
        // and always answers with every instrument, so the single-market call
        // reuses the bulk fetch and selects the requested row
        const fundingRates = await this.fetchFundingRates ([ symbol ], params);
        const fundingRate = this.safeDict (fundingRates, symbol);
        if (fundingRate === undefined) {
            throw new BadSymbol (this.id + ' fetchFundingRate() could not find the funding rate for ' + symbol);
        }
        return fundingRate as FundingRate;
    }

    /**
     * @method
     * @name polymarket#fetchFundingRates
     * @description fetches the current funding rates for multiple markets
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    override async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetInfoTickers (params);
        const result = this.parseFundingRates (response);
        return this.filterByArray (result, 'symbol', symbols);
    }

    override parseFundingRate (contract: any, market: Market = undefined): FundingRate {
        //
        //     {
        //         "instrument_id": 1,
        //         "symbol": "SP500-USD",
        //         "index_price": "7713.1",
        //         "mark_price": "7715",
        //         "last_price": "7714",
        //         "mid_price": "7715",
        //         "open_interest": "1101.82729",
        //         "funding_rate": "0.00000625",
        //         "next_funding": 1788548400000,
        //         "timestamp": 1788546972857
        //     }
        //
        const marketId = this.safeString (contract, 'instrument_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (contract, 'timestamp');
        const nextFundingTimestamp = this.safeInteger (contract, 'next_funding');
        const interval = this.safeString (market['info'], 'funding_interval');
        return {
            'info': contract,
            'symbol': market['symbol'],
            'markPrice': this.safeNumber (contract, 'mark_price'),
            'indexPrice': this.safeNumber (contract, 'index_price'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'funding_rate'),
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
     * @name polymarket#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures to fetch, the venue serves at most 100 per request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling the endpoint multiple times
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    override async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingRateHistory[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchFundingRateHistory', symbol, since, limit, '1h', params, 100) as FundingRateHistory[];
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_id': market['id'],
        };
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        const response = await this.publicGetInfoFunding (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             { "funding_rate": "0.00000625", "timestamp": 1788544800063 }
        //         ],
        //         "more": false
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const timestamp = this.safeInteger (entry, 'timestamp');
            rates.push ({
                'info': entry,
                'symbol': market['symbol'],
                'fundingRate': this.safeNumber (entry, 'funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit) as FundingRateHistory[];
    }

    /**
     * @method
     * @name polymarket#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [open interest structure]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    override async fetchOpenInterest (symbol: string, params = {}): Promise<OpenInterest> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        // the tickers endpoint ignores the documented instrument_id filter
        // and always answers with every instrument, so the single-market call
        // reuses the bulk fetch and selects the requested row
        const openInterests = await this.fetchOpenInterests ([ symbol ], params);
        const openInterest = this.safeDict (openInterests, symbol);
        if (openInterest === undefined) {
            throw new BadSymbol (this.id + ' fetchOpenInterest() could not find the open interest for ' + symbol);
        }
        return openInterest as OpenInterest;
    }

    /**
     * @method
     * @name polymarket#fetchOpenInterests
     * @description retrieves the open interest of multiple contract trading pairs
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string[]} [symbols] unified market symbols, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [open interest structures]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    override async fetchOpenInterests (symbols: Strings = undefined, params = {}): Promise<OpenInterests> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetInfoTickers (params);
        const result = this.parseOpenInterests (response);
        return this.filterByArray (result, 'symbol', symbols);
    }

    override parseOpenInterest (interest: any, market: Market = undefined) {
        //
        //     {
        //         "instrument_id": 1,
        //         "symbol": "SP500-USD",
        //         "index_price": "7713.1",
        //         "mark_price": "7715",
        //         "last_price": "7714",
        //         "mid_price": "7715",
        //         "open_interest": "1101.82729",
        //         "funding_rate": "0.00000625",
        //         "next_funding": 1788548400000,
        //         "timestamp": 1788546972857
        //     }
        //
        const marketId = this.safeString (interest, 'instrument_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (interest, 'timestamp');
        return this.safeOpenInterest ({
            'symbol': market['symbol'],
            'openInterestAmount': this.safeString (interest, 'open_interest'),
            'openInterestValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        }, market);
    }

    /**
     * @method
     * @name polymarket#fetchTradingFees
     * @description fetches the default trading fees for multiple markets
     * @see https://docs.polymarket.com/perps/learn-about-trading/fees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    override async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        const response = await this.publicGetInfoFees (params);
        //
        //     {
        //         "fee_schedule": [
        //             {
        //                 "instrument_type": "perpetual",
        //                 "category": "equity",
        //                 "taker_fee_rate": "0.0004",
        //                 "maker_fee_rate": "0.000125",
        //                 "tiers": [ { "min_volume_30d": "0", "taker_fee_rate": "0.0004", "maker_fee_rate": "0.000125" } ]
        //             }
        //         ]
        //     }
        //
        const schedule = this.safeList (response, 'fee_schedule', []);
        const byCategory: Dict = {};
        for (let i = 0; i < schedule.length; i++) {
            const entry = schedule[i];
            const category = this.safeString (entry, 'category');
            byCategory[category as string] = entry;
        }
        const fallback = this.safeDict (schedule, 0, {});
        const result: Dict = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            const category = this.safeString (market['info'], 'category');
            const entry = this.safeDict (byCategory, category, fallback);
            result[symbol] = {
                'info': entry,
                'symbol': symbol,
                'maker': this.safeNumber (entry, 'maker_fee_rate'),
                'taker': this.safeNumber (entry, 'taker_fee_rate'),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    override calculateRateLimiterCost (api: any, method: any, path: any, params: any, config = {}) {
        if (path === 'info/book') {
            const depth = this.safeInteger (params, 'depth', 100);
            if (depth <= 10) {
                return 2;
            } else if (depth <= 100) {
                return 5;
            } else if (depth <= 500) {
                return 10;
            }
            return 20;
        }
        return this.safeValue (config, 'cost', 1);
    }

    override sign (path: any, api: any = 'public', method = 'GET', params = {}, headers: NullableDict = undefined, body: Str = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            const keys = Object.keys (query);
            const keysLength = keys.length;
            if (keysLength > 0) {
                url += '?' + this.urlencode (query);
            }
        }
        headers = {
            'Accept': 'application/json',
        };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        //
        //     {
        //         "status": "err",
        //         "error": "invalid query parameters: missing field `interval`",
        //         "arts": 1788524547131,
        //         "ts": 1788524547131,
        //         "ref": "g-164de39df348d7"
        //     }
        //
        const status = this.safeString (response, 'status');
        const error = this.safeString (response, 'error');
        if ((status === 'err') || (error !== undefined)) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            // an unmapped error on a 4xx or 5xx response falls through so the
            // http status fallback can apply a retryable classification, while
            // covering statuses the base table does not know
            const codeAsString = code.toString ();
            if ((code < 400) || !(codeAsString in this.httpExceptions)) {
                throw new ExchangeError (feedback);
            }
        }
        return undefined;
    }
}
