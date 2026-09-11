
// ---------------------------------------------------------------------------

import Exchange from './abstract/ax.js';
import { AuthenticationError, BadRequest, BadSymbol, ExchangeError, InvalidOrder, ArgumentsRequired, InsufficientFunds, OrderNotFound, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Balances, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Dict, Strings, Trade, Ticker, Tickers, Position, FundingRate, FundingRates, int } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class ax
 * @augments Exchange
 * @description AX (Architect Exchange) - a derivatives exchange for perpetual contracts
 */
export default class ax extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'ax',
            'name': 'AX',
            'countries': [ 'US' ],
            'version': 'v1',
            'rateLimit': 100,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingRate': true,
                'fetchFundingRates': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchWithdrawals': false,
                'sandbox': true,
                'signIn': true,
                'withdraw': false,
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'GTC': true,
                            'IOC': true,
                            'FOK': false,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
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
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 50,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 50,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': undefined,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                },
            },
            'timeframes': {
                '1s': '1s',
                '5s': '5s',
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/placeholder', // TODO: replace with actual AX exchange logo URL
                'api': {
                    'public': 'https://gateway.architect.exchange/api',
                    'private': 'https://gateway.architect.exchange/api',
                    'orders': 'https://gateway.architect.exchange/orders',
                },
                'test': {
                    'public': 'https://gateway.sandbox.architect.exchange/api',
                    'private': 'https://gateway.sandbox.architect.exchange/api',
                    'orders': 'https://gateway.sandbox.architect.exchange/orders',
                },
                'www': 'https://architect.exchange',
                'doc': [
                    'https://docs.architect.exchange/api-reference',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'instruments': 1,
                        'instrument': 1,
                    },
                    'post': {
                        'authenticate': 1,
                    },
                },
                'private': {
                    'get': {
                        'book': 1,
                        'tickers': 1,
                        'ticker': 1,
                        'trades': 1,
                        'candles': 1,
                        'candles/current': 1,
                        'candles/last': 1,
                        'whoami': 1,
                        'balances': 1,
                        'positions': 1,
                        'fills': 1,
                        'transactions': 1,
                        'funding-transactions': 1,
                        'liquidations': 1,
                        'risk-snapshot': 1,
                        'api-keys': 1,
                        'funding-rates': 1,
                    },
                    'post': {
                        'sandbox/deposit': 1,
                        'sandbox/withdraw': 1,
                        'api-keys': 1,
                    },
                    'delete': {
                        'api-keys': 1,
                    },
                },
                'orders': {
                    'get': {
                        'open_orders': 1,
                        'orders': 1,
                        'order-status': 1,
                        'order-fills': 1,
                    },
                    'post': {
                        'place_order': 1,
                        'cancel_order': 1,
                        'cancel_all_orders': 1,
                        'initial-margin-requirement': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0005'),
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {},
                'broad': {
                    'unauthorized': AuthenticationError,
                    'Unauthorized': AuthenticationError,
                    'token expired': AuthenticationError,
                    'invalid token': AuthenticationError,
                    'rate limit': RateLimitExceeded,
                    'Rate limit': RateLimitExceeded,
                    'insufficient': InsufficientFunds,
                    'INSUFFICIENT_MARGIN': InsufficientFunds,
                    'INSUFFICIENT_CREDIT_LIMIT': InsufficientFunds,
                    'order not found': OrderNotFound,
                    'ORDER_NOT_FOUND': OrderNotFound,
                    'UNKNOWN_SYMBOL': BadSymbol,
                    'INVALID_PRICE_INCREMENT': InvalidOrder,
                    'INCORRECT_QUANTITY': InvalidOrder,
                    'INCORRECT_ORDER_TYPE': InvalidOrder,
                    'PRICE_OUT_OF_BOUNDS': InvalidOrder,
                    'NO_LIQUIDITY': InvalidOrder,
                    'CLOSE_ONLY': InvalidOrder,
                    'MAX_OPEN_ORDERS_EXCEEDED': InvalidOrder,
                    'EXCHANGE_CLOSED': ExchangeError,
                },
            },
            'options': {
                'tokenExpires': undefined,
                'defaultType': 'swap',
            },
        });
    }

    /**
     * @method
     * @name ax#signIn
     * @description sign in, must be called prior to using other authenticated methods
     * @see https://docs.architect.exchange/api-reference
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns response from exchange
     */
    async signIn (params = {}) {
        const expirationSeconds = this.safeInteger (params, 'expiration_seconds', 86400);
        params = this.omit (params, 'expiration_seconds');
        const request: Dict = {
            'api_key': this.apiKey,
            'api_secret': this.secret,
            'expiration_seconds': expirationSeconds,
        };
        const response = await this.publicPostAuthenticate (this.extend (request, params));
        //
        //     { "token": "<bearer-token>" }
        //
        const token = this.safeString (response, 'token');
        if (token === undefined) {
            throw new AuthenticationError (this.id + ' signIn() failed, no token returned');
        }
        this.token = token;
        // refresh 1 hour before actual expiry
        const refreshMs = (expirationSeconds - 3600) * 1000;
        this.options['tokenExpires'] = this.sum (this.milliseconds (), refreshMs);
        return token;
    }

    async handleToken (params = {}) {
        const now = this.milliseconds ();
        const token = this.token;
        const tokenExpires = this.safeInteger (this.options, 'tokenExpires');
        if ((token === undefined) || (tokenExpires === undefined) || (now > tokenExpires)) {
            return await this.signIn ();
        } else {
            return this.token;
        }
    }

    /**
     * @method
     * @name ax#fetchMarkets
     * @description retrieves data on all markets for ax
     * @see https://docs.architect.exchange/api-reference
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Market[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetInstruments (params);
        //
        //     {
        //         "instruments": [
        //             {
        //                 "symbol": "GBPUSD-PERP",
        //                 "multiplier": "10000",
        //                 "price_scale": 5,
        //                 "tick_size": "0.00001",
        //                 "minimum_order_size": "1",
        //                 "quote_currency": "USD",
        //                 "initial_margin_pct": "0.02",
        //                 "maintenance_margin_pct": "0.01",
        //                 "category": "fx"
        //             }
        //         ]
        //     }
        //
        const instruments = this.safeList (response, 'instruments', []);
        return this.parseMarkets (instruments);
    }

    parseMarket (market: Dict): Market {
        const marketId = this.safeString (market, 'symbol');
        const quoteId = this.safeString (market, 'quote_currency');
        const quote = this.safeCurrencyCode (quoteId);
        // AX symbols follow two patterns:
        // FX pairs: "GBPUSD-PERP" where symbolPart is base+quote concatenated
        // Non-FX:   "TSLA-PERP", "XAU-PERP" where symbolPart is just the base
        const parts = marketId.split ('-');
        const symbolPart = this.safeString (parts, 0);
        const contractType = this.safeString (parts, 1);
        let baseId = undefined;
        if (symbolPart.endsWith (quoteId)) {
            baseId = symbolPart.slice (0, symbolPart.length - quoteId.length);
        } else {
            baseId = symbolPart;
        }
        const base = this.safeCurrencyCode (baseId);
        const settleId = quoteId;
        const settle = quote;
        const swap = (contractType === 'PERP');
        const symbol = base + '/' + quote + ':' + settle;
        const tickSize = this.safeString (market, 'tick_size');
        const multiplier = this.safeString (market, 'multiplier');
        const minOrderSize = this.safeString (market, 'minimum_order_size');
        return {
            'id': marketId,
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
            'swap': swap,
            'future': false,
            'option': false,
            'active': true,
            'contract': true,
            'linear': true,
            'inverse': false,
            'contractSize': this.parseNumber (multiplier),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber ('1'),
                'price': this.parseNumber (tickSize),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.parseNumber (minOrderSize),
                    'max': undefined,
                },
                'price': {
                    'min': this.parseNumber (tickSize),
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        };
    }

    /**
     * @method
     * @name ax#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information for a specific market
     * @see https://docs.architect.exchange/api-reference
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.privateGetTicker (this.extend (request, params));
        //
        //     {
        //         "s": "GBPUSD-PERP",
        //         "p": "1.26455",
        //         "q": 100,
        //         "o": "1.26000",
        //         "h": "1.27000",
        //         "l": "1.25500",
        //         "v": 50000,
        //         "oi": 12000,
        //         "m": "1.26450",
        //         "i": "OPEN",
        //         "ts": 1709900000, "tn": 0
        //     }
        //
        return this.parseTicker (response, market);
    }

    /**
     * @method
     * @name ax#fetchTickers
     * @description fetches price tickers for multiple markets
     * @see https://docs.architect.exchange/api-reference
     * @param {string[]|undefined} [symbols] unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        const response = await this.privateGetTickers (params);
        //
        //     [
        //         { "s": "GBPUSD-PERP", "p": "1.26455", ... },
        //         ...
        //     ]
        //
        const tickers = this.safeList (response, 'tickers', []);
        return this.parseTickers (tickers, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeTimestamp (ticker, 'ts');
        const last = this.safeString (ticker, 'p');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': this.safeString (ticker, 'bp'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ap'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': undefined,
            'markPrice': this.safeString (ticker, 'm'),
            'openInterest': this.safeString (ticker, 'oi'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name ax#fetchOrderBook
     * @description fetches information on open orders with bid and ask prices, volumes and other data
     * @see https://docs.architect.exchange/api-reference
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int|undefined} [limit] not used by ax fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'level': 2,
        };
        const response = await this.privateGetBook (this.extend (request, params));
        //
        //     {
        //         "book": {
        //             "s": "GBPUSD-PERP",
        //             "b": [{"p": "1.26450", "q": 500}],
        //             "a": [{"p": "1.26460", "q": 300}],
        //             "ts": 1709900000,
        //             "tn": 123456789
        //         }
        //     }
        //
        const book = this.safeDict (response, 'book', {});
        const timestamp = this.safeTimestamp (book, 'ts');
        return this.parseOrderBook (book, symbol, timestamp, 'b', 'a', 'p', 'q');
    }

    /**
     * @method
     * @name ax#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.architect.exchange/api-reference
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int|undefined} [since] not used by ax fetchTrades
     * @param {int|undefined} [limit] the maximum amount of trades to fetch, max 100, default 10
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTrades (this.extend (request, params));
        //
        //     {
        //         "trades": [
        //             { "symbol": "GBPUSD-PERP", "price": "1.26455", "quantity": 50, "side": "B", "timestamp": "2026-03-09T12:00:00Z" }
        //         ]
        //     }
        //
        const trades = this.safeList (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades (compact format from REST /api/trades)
        //
        //     {
        //         "s": "GBPUSD-PERP",
        //         "p": "1.26455",
        //         "q": 50,
        //         "d": "B",
        //         "ts": 1709900000, "tn": 0
        //     }
        //
        // fetchMyTrades (fills)
        //
        //     {
        //         "trade_id": "T-...",
        //         "symbol": "GBPUSD-PERP",
        //         "price": "1.26455",
        //         "quantity": 50,
        //         "side": "B",
        //         "fee": "0.01",
        //         "is_taker": true
        //     }
        //
        const marketId = this.safeString2 (trade, 'symbol', 's');
        market = this.safeMarket (marketId, market);
        let timestamp = undefined;
        const ts = this.safeInteger (trade, 'ts');
        if (ts !== undefined) {
            timestamp = ts * 1000;
        } else {
            timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        }
        const price = this.safeString2 (trade, 'price', 'p');
        const amount = this.safeString2 (trade, 'quantity', 'q');
        const cost = undefined;
        const rawSide = this.safeString2 (trade, 'side', 'd');
        const side = (rawSide === 'B') ? 'buy' : 'sell';
        const id = this.safeString (trade, 'trade_id');
        const isTaker = this.safeBool (trade, 'is_taker');
        let takerOrMaker: Str = undefined;
        if (isTaker !== undefined) {
            takerOrMaker = isTaker ? 'taker' : 'maker';
        }
        let fee = undefined;
        const feeCost = this.safeString (trade, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['quote'],
            };
        }
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': undefined,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    /**
     * @method
     * @name ax#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.architect.exchange/api-reference
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} [timeframe] the length of time each candle represents, default '1m'
     * @param {int|undefined} [since] timestamp in ms of the earliest candle to fetch
     * @param {int|undefined} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'candle_width': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since === undefined) {
            const defaultLimit = (limit !== undefined) ? limit : 100;
            const timeframeMs = this.parseTimeframe (timeframe) * 1000;
            const start = this.milliseconds () - defaultLimit * timeframeMs;
            request['start_timestamp_ns'] = start * 1000000;
            request['end_timestamp_ns'] = this.milliseconds () * 1000000;
        } else {
            request['start_timestamp_ns'] = since * 1000000;
            if (limit !== undefined) {
                const timeframeMs = this.parseTimeframe (timeframe) * 1000;
                const end = this.sum (since, limit * timeframeMs);
                request['end_timestamp_ns'] = end * 1000000;
            }
        }
        const response = await this.privateGetCandles (this.extend (request, params));
        //
        //     {
        //         "candles": [
        //             {
        //                 "symbol": "GBPUSD-PERP",
        //                 "ts": "2026-03-09T12:00:00Z",
        //                 "open": "1.26400",
        //                 "high": "1.26500",
        //                 "low": "1.26350",
        //                 "close": "1.26450",
        //                 "volume": 1500,
        //                 "buy_volume": 800,
        //                 "sell_volume": 700,
        //                 "width": "1m"
        //             }
        //         ]
        //     }
        //
        const candles = this.safeList (response, 'candles', []);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        const timestamp = this.parse8601 (this.safeString (ohlcv, 'ts'));
        return [
            timestamp,
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name ax#fetchFundingRate
     * @description fetch the current funding rate for a specific market
     * @see https://docs.architect.exchange/api-reference
     * @param {string} symbol unified symbol of the market to fetch the funding rate for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        const market = this.market (symbol);
        const now = this.milliseconds ();
        const request: Dict = {
            'symbol': market['id'],
            'start_timestamp_ns': (now - 86400000) * 1000000,
            'end_timestamp_ns': now * 1000000,
        };
        const response = await this.privateGetFundingRates (this.extend (request, params));
        //
        //     {
        //         "funding_rates": [
        //             {
        //                 "symbol": "GBPUSD-PERP",
        //                 "timestamp_ns": "1773676800000000000",
        //                 "funding_rate": "-0.002969589896",
        //                 "funding_amount": "-0.003950000000",
        //                 "benchmark_price": "1.330150000000",
        //                 "settlement_price": "1.326200000000"
        //             }
        //         ]
        //     }
        //
        const rates = this.safeList (response, 'funding_rates', []);
        const rate = this.safeDict (rates, rates.length - 1, {});
        const previousRate = (rates.length >= 2) ? this.safeDict (rates, rates.length - 2) : undefined;
        return this.parseFundingRate (rate, market, previousRate);
    }

    /**
     * @method
     * @name ax#fetchFundingRates
     * @description fetch the current funding rates for multiple markets
     * @see https://docs.architect.exchange/api-reference
     * @param {string[]|undefined} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        symbols = this.marketSymbols (symbols);
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        const now = this.milliseconds ();
        const promises = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const request: Dict = {
                'symbol': market['id'],
                'start_timestamp_ns': (now - 86400000) * 1000000,
                'end_timestamp_ns': now * 1000000,
            };
            promises.push (this.privateGetFundingRates (this.extend (request, params)));
        }
        const responses = await Promise.all (promises);
        const result: FundingRates = {};
        for (let i = 0; i < symbols.length; i++) {
            const rates = this.safeList (responses[i], 'funding_rates', []);
            if (rates.length === 0) {
                continue;
            }
            const rate = this.safeDict (rates, rates.length - 1, {});
            const previousRate = (rates.length >= 2) ? this.safeDict (rates, rates.length - 2) : undefined;
            const market = this.market (symbols[i]);
            const parsed = this.parseFundingRate (rate, market, previousRate);
            result[parsed['symbol']] = parsed;
        }
        return result;
    }

    parseFundingRate (contract, market: Market = undefined, previousContract = undefined): FundingRate {
        const marketId = this.safeString (contract, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestampNs = this.safeInteger (contract, 'timestamp_ns');
        const timestamp = (timestampNs !== undefined) ? this.parseToInt (timestampNs / 1000000) : undefined;
        let previousFundingRate = undefined;
        let previousFundingTimestamp = undefined;
        if (previousContract !== undefined) {
            previousFundingRate = this.safeNumber (previousContract, 'funding_rate');
            const prevTimestampNs = this.safeInteger (previousContract, 'timestamp_ns');
            previousFundingTimestamp = (prevTimestampNs !== undefined) ? this.parseToInt (prevTimestampNs / 1000000) : undefined;
        }
        let interval = undefined;
        if (previousFundingTimestamp !== undefined && timestamp !== undefined) {
            const diff = timestamp - previousFundingTimestamp;
            interval = this.parseFundingInterval (this.numberToString (diff));
        }
        return {
            'info': contract,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': this.safeNumber (contract, 'benchmark_price'),
            'interestRate': undefined,
            'estimatedSettlePrice': this.safeNumber (contract, 'settlement_price'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'funding_rate'),
            'fundingTimestamp': timestamp,
            'fundingDatetime': this.iso8601 (timestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': previousFundingRate,
            'previousFundingTimestamp': previousFundingTimestamp,
            'previousFundingDatetime': this.iso8601 (previousFundingTimestamp),
            'interval': interval,
        };
    }

    parseFundingInterval (milliseconds: string): string {
        const intervals: Dict = {
            '3600000': '1h',
            '14400000': '4h',
            '28800000': '8h',
            '57600000': '16h',
            '86400000': '24h',
        };
        return this.safeString (intervals, milliseconds, milliseconds);
    }

    /**
     * @method
     * @name ax#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.architect.exchange/api-reference
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        const response = await this.privateGetBalances (params);
        //
        //     [
        //         { "symbol": "USD", "amount": "100000.00" }
        //     ]
        //
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
        };
        const balances = this.safeList (response, 'balances', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'amount');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name ax#fetchPositions
     * @description fetch all open positions
     * @see https://docs.architect.exchange/api-reference
     * @param {string[]|undefined} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        const response = await this.privateGetPositions (params);
        //
        //     [
        //         {
        //             "symbol": "GBPUSD-PERP",
        //             "signed_quantity": 1000,
        //             "signed_notional": "126450.00",
        //             "realized_pnl": "500.00"
        //         }
        //     ]
        //
        const positions = this.safeList (response, 'positions', []);
        const result = this.parsePositions (positions, symbols);
        return result;
    }

    parsePosition (position: Dict, market: Market = undefined): Position {
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const signedQuantity = this.safeString (position, 'signed_quantity');
        let side: Str = undefined;
        if (Precise.stringGt (signedQuantity, '0')) {
            side = 'long';
        } else if (Precise.stringLt (signedQuantity, '0')) {
            side = 'short';
        }
        const contracts = Precise.stringAbs (signedQuantity);
        const notional = this.safeString (position, 'signed_notional');
        const averagePrice = this.safeString (position, 'average_price');
        const liquidationPrice = this.safeString (position, 'liquidation_price');
        const unrealizedPnl = this.safeString (position, 'unrealized_pnl');
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.parseNumber (averagePrice),
            'notional': this.parseNumber (notional),
            'leverage': undefined,
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'contracts': this.parseNumber (contracts),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'marginRatio': undefined,
            'liquidationPrice': this.parseNumber (liquidationPrice),
            'markPrice': undefined,
            'lastPrice': undefined,
            'collateral': undefined,
            'marginMode': undefined,
            'side': side,
            'percentage': undefined,
            'hedged': false,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    /**
     * @method
     * @name ax#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.architect.exchange/api-reference
     * @param {string|undefined} [symbol] unified market symbol
     * @param {int|undefined} [since] not used by ax fetchMyTrades
     * @param {int|undefined} [limit] not used by ax fetchMyTrades
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privateGetFills (params);
        //
        //     [
        //         {
        //             "trade_id": "T-...",
        //             "symbol": "GBPUSD-PERP",
        //             "price": "1.26455",
        //             "quantity": 50,
        //             "side": "B",
        //             "fee": "0.01",
        //             "is_taker": true
        //         }
        //     ]
        //
        const fills = this.safeList (response, 'fills', []);
        return this.parseTrades (fills, market, since, limit);
    }

    /**
     * @method
     * @name ax#createOrder
     * @description create a trade order
     * @see https://docs.architect.exchange/api-reference
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {number} amount how much you want to trade in units of contracts
     * @param {number|undefined} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {string|undefined} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        const request: Dict = {
            's': market['id'],
            'd': (side === 'buy') ? 'B' : 'S',
            'q': parseInt (this.amountToPrecision (symbol, amount)), // AX requires integer contract quantities
        };
        if (uppercaseType === 'LIMIT') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
            }
            request['p'] = this.priceToPrecision (symbol, price);
            request['tif'] = 'GTC';
        } else if (uppercaseType === 'MARKET') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for market orders, used as a protective price with IOC time-in-force');
            }
            request['tif'] = 'IOC';
            request['p'] = this.priceToPrecision (symbol, price);
        } else {
            request['tif'] = this.safeString (params, 'timeInForce', 'GTC');
        }
        const postOnly = this.isPostOnly (uppercaseType === 'MARKET', undefined, params);
        request['po'] = postOnly;
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'cid');
        if (clientOrderId !== undefined) {
            request['cid'] = clientOrderId;
        }
        const tag = this.safeString (params, 'tag');
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        params = this.omit (params, [ 'postOnly', 'clientOrderId', 'cid', 'tag', 'timeInForce' ]);
        const response = await this.ordersPostPlaceOrder (this.extend (request, params));
        //
        //     { "oid": "O-01ARZ3NDEKTSV4RRFFQ69G5FAV" }
        //
        const orderId = this.safeString (response, 'oid');
        return this.safeOrder ({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': 'open',
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    /**
     * @method
     * @name ax#cancelOrder
     * @description cancels an open order
     * @see https://docs.architect.exchange/api-reference
     * @param {string} id order id
     * @param {string|undefined} [symbol] not used by ax cancelOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.handleToken ();
        const request: Dict = {
            'oid': id,
        };
        const response = await this.ordersPostCancelOrder (this.extend (request, params));
        //
        //     { "cxl_rx": true }
        //
        return this.safeOrder ({
            'id': id,
            'info': response,
            'status': 'canceled',
        });
    }

    /**
     * @method
     * @name ax#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.architect.exchange/api-reference
     * @param {string|undefined} [symbol] unified market symbol, only cancel orders in the specified market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        await this.handleToken ();
        const request: Dict = {};
        if (symbol !== undefined) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.ordersPostCancelAllOrders (this.extend (request, params));
        return [ this.safeOrder ({ 'info': response }) ];
    }

    /**
     * @method
     * @name ax#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.architect.exchange/api-reference
     * @param {string|undefined} [symbol] unified market symbol
     * @param {int|undefined} [since] not used by ax fetchOpenOrders
     * @param {int|undefined} [limit] not used by ax fetchOpenOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        const response = await this.ordersGetOpenOrders (params);
        //
        //     { "orders": [ ... ] }
        //
        const orders = this.safeList (response, 'orders', []);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name ax#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.architect.exchange/api-reference
     * @param {string|undefined} [symbol] unified market symbol
     * @param {int|undefined} [since] not used by ax fetchOrders
     * @param {int|undefined} [limit] the maximum number of order structures to retrieve, max 50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.ordersGetOrders (this.extend (request, params));
        //
        //     { "orders": [ ... ] }
        //
        const orders = this.safeList (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name ax#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.architect.exchange/api-reference
     * @param {string|undefined} [symbol] unified market symbol
     * @param {int|undefined} [since] the earliest time in ms to fetch orders for
     * @param {int|undefined} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, undefined, params);
        const filteredOrders = this.filterBy (orders, 'status', 'closed');
        return this.filterBySinceLimit (filteredOrders, since, limit);
    }

    /**
     * @method
     * @name ax#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.architect.exchange/api-reference
     * @param {string} id the order id
     * @param {string|undefined} [symbol] not used by ax fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        const request: Dict = {
            'order_id': id,
        };
        const response = await this.ordersGetOrderStatus (this.extend (request, params));
        return this.parseOrder (response);
    }

    /**
     * @method
     * @name ax#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.architect.exchange/api-reference
     * @param {string} id order id
     * @param {string|undefined} [symbol] unified market symbol
     * @param {int|undefined} [since] not used by ax fetchOrderTrades
     * @param {int|undefined} [limit] not used by ax fetchOrderTrades
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await Promise.all ([ this.loadMarkets (), this.handleToken () ]);
        const request: Dict = {
            'order_id': id,
        };
        const response = await this.ordersGetOrderFills (this.extend (request, params));
        //
        //     { "fills": [ ... ] }
        //
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const fills = this.safeList (response, 'fills', []);
        return this.parseTrades (fills, market, since, limit);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "oid": "O-01ARZ3NDEKTSV4RRFFQ69G5FAV",
        //         "s": "GBPUSD-PERP",
        //         "d": "B",
        //         "q": 100,
        //         "p": "1.26450",
        //         "xq": 50,
        //         "rq": 50,
        //         "o": "ACCEPTED",
        //         "tif": "GTC"
        //     }
        //
        const orderId = this.safeString2 (order, 'oid', 'order_id');
        const marketId = this.safeString2 (order, 's', 'symbol');
        market = this.safeMarket (marketId, market);
        const rawSide = this.safeString2 (order, 'd', 'side');
        let side: Str = undefined;
        if (rawSide === 'B') {
            side = 'buy';
        } else if (rawSide === 'S') {
            side = 'sell';
        } else {
            side = rawSide;
        }
        const price = this.safeString2 (order, 'p', 'price');
        const amount = this.safeString2 (order, 'q', 'quantity');
        const filled = this.safeString2 (order, 'xq', 'executed_quantity');
        const remaining = this.safeString2 (order, 'rq', 'remaining_quantity');
        const rawStatus = this.safeString2 (order, 'o', 'status');
        const status = this.parseOrderStatus (rawStatus);
        const tif = this.safeString (order, 'tif');
        let type: Str = undefined;
        if (tif === 'IOC') {
            type = 'market';
        } else if (price !== undefined) {
            type = 'limit';
        }
        const clientOrderId = this.safeString2 (order, 'cid', 'client_order_id');
        const timestamp = this.safeTimestamp (order, 'ts');
        return this.safeOrder ({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': tif,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'PENDING': 'open',
            'ACCEPTED': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
            'DONE_FOR_DAY': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (method === 'POST') {
                headers = {
                    'Content-Type': 'application/json',
                };
                body = this.json (params);
            } else {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
        } else {
            this.checkRequiredCredentials ();
            const token = this.token;
            if (token === undefined) {
                throw new AuthenticationError (this.id + ' requires a token, please call signIn() first');
            }
            headers = {
                'Authorization': 'Bearer ' + token,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = this.json (params);
            } else {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const error = this.safeString (response, 'error');
        const message = this.safeString (response, 'message');
        const errorMessage = error || message;
        if (errorMessage !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback);
        }
        if ((httpCode !== undefined) && (httpCode >= 400)) {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            if (httpCode === 401) {
                throw new AuthenticationError (feedback);
            } else if (httpCode === 403) {
                throw new AuthenticationError (feedback);
            } else if (httpCode === 404) {
                throw new BadRequest (feedback);
            } else if (httpCode === 429) {
                throw new RateLimitExceeded (feedback);
            }
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
