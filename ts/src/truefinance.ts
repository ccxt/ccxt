//  ---------------------------------------------------------------------------

import Exchange from './abstract/truefinance.js';
import { ExchangeError, ArgumentsRequired, InvalidOrder, OrderNotFound, BadRequest, BadSymbol, InsufficientFunds, PermissionDenied, RateLimitExceeded, ExchangeNotAvailable, AuthenticationError } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from '@noble/hashes/sha2.js';
import type { Market, Balances, Int, OrderBook, OHLCV, Str, Order, OrderType, OrderSide, Trade, Strings, Position, Dict, Num, int, TradingFeeInterface, TradingFees, FundingRates, FundingRate, Tickers, Ticker, NullableDict } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class truefinance
 * @augments Exchange
 */
export default class truefinance extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'truefinance',
            'name': 'TRUE Finance',
            'countries': [ 'CH' ],
            'version': 'v1',
            'rateLimit': 100, // 600 reads and 120 writes a minute per bot key
            'certified': false,
            'pro': false,
            'dex': true,
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
                'cancelOrders': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTakeProfitOrder': true,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': true,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
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
            'hostname': 'app.truefinance.ai',
            'urls': {
                'logo': 'https://true-design.up.railway.app/assets/logos/true-logo-256.png',
                'api': {
                    'public': 'https://{hostname}/api/bot/v1',
                    'private': 'https://{hostname}/api/bot/v1',
                },
                'www': 'https://app.truefinance.ai',
                'doc': [
                    'https://docs.truefinance.ai/en/docs/bot-api',
                ],
                'fees': 'https://docs.truefinance.ai/en/docs/bot-api',
            },
            'api': {
                'public': {
                    'get': {
                        'time': 1,
                        'markets': 1,
                        'mark': 1,
                        'bbo': 1,
                        'orderbook': 1,
                        'ticker': 1,
                        'candles': 1,
                        'trades': 1,
                    },
                },
                'private': {
                    'get': {
                        'key': 1,
                        'account': 1,
                        'positions': 1,
                        'positions/history': 1,
                        'orders': 1,
                        'orders/history': 1,
                        'orders/{id}': 1,
                        'fills': 1,
                    },
                    'post': {
                        'orders': 5,
                        'leverage': 5,
                        'ws-token': 1,
                    },
                    'patch': {
                        'orders/{id}': 5,
                    },
                    'delete': {
                        'orders/{id}': 5,
                        'orders': 5,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.00065'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'defaultType': 'swap',
                'adjustForTimeDifference': true,
                'timeDifference': 0,
                'settle': 'USDC',
            },
            'features': {
                'default': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': true,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'editOrder': {
                        'side': false,
                        'type': false,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 200,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
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
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'spot': undefined,
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'exceptions': {
                'exact': {
                    'missing_auth_headers': AuthenticationError,
                    'bad_signature': AuthenticationError,
                    'unknown_key': AuthenticationError,
                    'key_revoked': AuthenticationError,
                    'key_expired': AuthenticationError,
                    'key_paused': PermissionDenied,
                    'timestamp_out_of_window': AuthenticationError,
                    'replayed_request': AuthenticationError,
                    'scope_denied': PermissionDenied,
                    'ip_not_allowed': PermissionDenied,
                    'order_notional_cap': PermissionDenied,
                    'position_notional_cap': PermissionDenied,
                    'position_cap_unavailable': ExchangeNotAvailable,
                    'rate_limited': RateLimitExceeded,
                    'order_not_found': OrderNotFound,
                    'order_not_open': OrderNotFound,
                    'no_candles': BadSymbol,
                    'bad_market': BadSymbol,
                    'bad_side': InvalidOrder,
                    'bad_size': InvalidOrder,
                    'bad_type': InvalidOrder,
                    'bad_price': InvalidOrder,
                    'price_required': InvalidOrder,
                    'trigger_price_required': InvalidOrder,
                    'bad_tif': InvalidOrder,
                    'leverage_out_of_range': InvalidOrder,
                    'leverage_too_high': InvalidOrder,
                    'insufficient_margin': InsufficientFunds,
                    'insufficient_collateral': InsufficientFunds,
                    'account_unavailable': ExchangeNotAvailable,
                    'markets_unavailable': ExchangeNotAvailable,
                    'fills_unavailable': ExchangeNotAvailable,
                    'history_unavailable': ExchangeNotAvailable,
                    'venue_read_failed': ExchangeNotAvailable,
                    'bot_api_disabled': ExchangeNotAvailable,
                },
                'broad': {
                    'insufficient': InsufficientFunds,
                    'not found': OrderNotFound,
                    'band': InvalidOrder,
                    'lot': InvalidOrder,
                },
            },
        });
    }

    /**
     * @method
     * @name truefinance#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    override async fetchTime (params: Dict = {}): Promise<Int> {
        const response = await this.publicGetTime (params);
        //
        //     { "ok": true, "serverTime": 1760780000123 }
        //
        return this.safeInteger (response, 'serverTime');
    }

    /**
     * @method
     * @name truefinance#fetchMarkets
     * @description retrieves data on all markets for truefinance
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        if (this.safeBool (this.options, 'adjustForTimeDifference', false)) {
            await this.loadTimeDifference ();
        }
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         "ok": true,
        //         "markets": [
        //             {
        //                 "symbol": "BTCUSDC",
        //                 "base": "BTC",
        //                 "quote": "USDC",
        //                 "active": true,
        //                 "lotSize": "0.001",
        //                 "tickSize": "1",
        //                 "minOrderNotionalUsd": "10",
        //                 "maxOrderSize": "50",
        //                 "maxLeverage": 50,
        //                 "makerFeePct": "0.02",
        //                 "takerFeePct": "0.065",
        //                 "fundingRate8h": "0.0001",
        //                 "priceBands": { "min": "70000", "max": "95000" }
        //             }
        //         ]
        //     }
        //
        const markets = this.safeList (response, 'markets', []);
        return this.parseMarkets (markets);
    }

    override parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'base');
        const quoteId = this.safeString (market, 'quote', 'USDC');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = quote;
        const symbol = base + '/' + quote + ':' + settle;
        const bands = this.safeDict (market, 'priceBands', {});
        const maker = this.safeString (market, 'makerFeePct');
        const taker = this.safeString (market, 'takerFeePct');
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': quoteId,
            'type': 'swap',
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': this.safeBool (market, 'active', false),
            'contract': true,
            'linear': true,
            'inverse': false,
            'contractSize': this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'taker': this.parseNumber (Precise.stringDiv (taker, '100')),
            'maker': this.parseNumber (Precise.stringDiv (maker, '100')),
            'precision': {
                'amount': this.safeNumber (market, 'lotSize'),
                'price': this.safeNumber (market, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': this.safeNumber (market, 'maxLeverage'),
                },
                'amount': {
                    'min': this.safeNumber (market, 'lotSize'),
                    'max': this.safeNumber (market, 'maxOrderSize'),
                },
                'price': {
                    'min': this.safeNumber (bands, 'min'),
                    'max': this.safeNumber (bands, 'max'),
                },
                'cost': {
                    'min': this.safeNumber (market, 'minOrderNotionalUsd'),
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name truefinance#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const symbolsNormalized: Strings = this.marketSymbols (symbols);
        const request: Dict = {
            'market': 'ALL',
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         "ok": true,
        //         "data": {
        //             "results": [
        //                 { "symbol": "BTCUSDC", "last_traded_price": "82012.5", "volume_24h": "12.3", "price_change_rate_24h": "0.012" }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const rows = this.safeList (data, 'results', []);
        return this.parseTickers (rows, symbolsNormalized);
    }

    /**
     * @method
     * @name truefinance#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        const rows = this.safeList (data, 'results', []);
        let row: Dict = this.safeDict (rows, 0, {});
        const bboResponse = await this.publicGetBbo (request);
        //
        //     { "ok": true, "data": { "market": "BTCUSDC", "bid": "82000", "bid_size": "0.5", "ask": "82010", "ask_size": "0.4" } }
        //
        const bbo = this.safeDict (bboResponse, 'data', {});
        row = this.extend (row, bbo);
        return this.parseTicker (row, market);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     { "symbol": "BTCUSDC", "last_traded_price": "82012.5", "volume_24h": "12.3", "price_change_rate_24h": "0.012", "bid": "82000", "ask": "82010" }
        //
        const marketId = this.safeString2 (ticker, 'symbol', 'market');
        const marketResolved: Market = this.safeMarket (marketId, market);
        const last = this.safeString (ticker, 'last_traded_price');
        const changeRate = this.safeString (ticker, 'price_change_rate_24h');
        const timestamp = this.safeInteger (ticker, 'timestamp');
        let percentage = undefined;
        if (changeRate !== undefined) {
            percentage = Precise.stringMul (changeRate, '100');
        }
        return this.safeTicker ({
            'symbol': marketResolved['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': this.safeString (ticker, 'bid_size'),
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': this.safeString (ticker, 'ask_size'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume_24h'),
            'quoteVolume': undefined,
            'info': ticker,
        }, marketResolved);
    }

    /**
     * @method
     * @name truefinance#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'depth': (limit === undefined) ? 50 : limit,
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
        //
        //     {
        //         "ok": true,
        //         "data": {
        //             "market": "BTCUSDC",
        //             "bids": { "81000": "0.5", "80990": "1.2" },
        //             "asks": { "81010": "0.3", "81020": "2" }
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const book: Dict = {
            'bids': this.parseLevels (this.safeValue (data, 'bids')),
            'asks': this.parseLevels (this.safeValue (data, 'asks')),
        };
        return this.parseOrderBook (book, market['symbol'], this.milliseconds (), 'bids', 'asks', 0, 1);
    }

    parseLevels (raw: any): any[] {
        // the REST book is { price: size }, the websocket book is [ [ price, size ] ]
        const result: any[] = [];
        if (raw === undefined) {
            return result;
        }
        if (Array.isArray (raw)) {
            for (let i = 0; i < raw.length; i++) {
                const level = raw[i];
                result.push ([ this.safeNumber (level, 0), this.safeNumber (level, 1) ]);
            }
            return result;
        }
        const prices = Object.keys (raw);
        for (let i = 0; i < prices.length; i++) {
            const price = prices[i];
            result.push ([ this.parseNumber (price), this.safeNumber (raw, price) ]);
        }
        return result;
    }

    /**
     * @method
     * @name truefinance#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch, defaults to one hour ago
     * @param {int} [limit] the maximum amount of trades to fetch, max 500
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        if (since !== undefined) {
            request['startAt'] = since;
        } else {
            request['startAt'] = this.milliseconds () - 3600 * 1000;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 500);
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "ok": true,
        //         "data": {
        //             "results": [
        //                 { "id": "177396390-1", "market": "BTCUSDC", "price": "82000", "size": "0.002", "side": "buy", "created_at": 1760780000000 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const rows = this.safeList (data, 'results', []);
        return this.parseTrades (rows, market, since, limit);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // public
        //
        //     { "id": "177396390-1", "market": "BTCUSDC", "price": "82000", "size": "0.002", "side": "buy", "created_at": 1760780000000 }
        //
        // private (fills)
        //
        //     { "id": "177396390-1", "order_id": 42599337, "price": "81000", "size": "0.002", "fee": "0.0324", "fee_currency": "USDC", "liquidity": "maker", "side": "buy", "created_at": 1760780002000, "market": "BTCUSDC" }
        //
        const marketId = this.safeString (trade, 'market');
        const marketResolved: Market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'created_at');
        const feeCost = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (this.safeString (trade, 'fee_currency', 'USDC')),
            };
        }
        const side = this.safeStringLower (trade, 'side');
        const takerOrMaker = this.safeStringLower (trade, 'liquidity');
        return this.safeTrade ({
            'id': this.safeString (trade, 'id'),
            'order': this.safeString (trade, 'order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': marketResolved['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'size'),
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, marketResolved);
    }

    /**
     * @method
     * @name truefinance#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, max 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        const until = this.safeInteger (params, 'until');
        const query = this.omit (params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.publicGetCandles (this.extend (request, query));
        //
        //     {
        //         "ok": true,
        //         "market": "BTCUSDC",
        //         "interval": "1h",
        //         "candles": [
        //             [ "1760770800000", "81900", "82100", "81850", "82000", "12.5" ]
        //         ]
        //     }
        //
        const candles = this.safeList (response, 'candles', []);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        //
        //     [ "1760770800000", "81900", "82100", "81850", "82000", "12.5" ]
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
     * @name truefinance#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    override async fetchFundingRates (symbols: Strings = undefined, params: Dict = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        const symbolsNormalized: Strings = this.marketSymbols (symbols);
        const response = await this.publicGetMarkets (params);
        const markets = this.safeList (response, 'markets', []);
        const rows = [];
        for (let i = 0; i < markets.length; i++) {
            const row = markets[i];
            if (this.safeString (row, 'fundingRate8h') !== undefined) {
                rows.push (row);
            }
        }
        return this.parseFundingRates (rows, symbolsNormalized);
    }

    /**
     * @method
     * @name truefinance#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    override async fetchFundingRate (symbol: string, params: Dict = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const rates = await this.fetchFundingRates ([ market['symbol'] ], params);
        const rate = this.safeDict (rates, market['symbol']);
        if (rate === undefined) {
            throw new BadSymbol (this.id + ' fetchFundingRate() could not find a funding rate for ' + symbol);
        }
        return rate as FundingRate;
    }

    override parseFundingRate (contract: any, market: Market = undefined): FundingRate {
        //
        //     { "symbol": "BTCUSDC", "fundingRate8h": "0.0001", ... }
        //
        const marketId = this.safeString (contract, 'symbol');
        const marketResolved: Market = this.safeMarket (marketId, market);
        return {
            'info': contract,
            'symbol': marketResolved['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'fundingRate8h'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': '8h',
        } as FundingRate;
    }

    /**
     * @method
     * @name truefinance#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    override async fetchTradingFees (params: Dict = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        const result: Dict = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            result[symbol] = {
                'info': market['info'],
                'symbol': symbol,
                'maker': market['maker'],
                'taker': market['taker'],
                'percentage': true,
                'tierBased': false,
            };
        }
        return result;
    }

    /**
     * @method
     * @name truefinance#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    override async fetchTradingFee (symbol: string, params: Dict = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        return {
            'info': market['info'],
            'symbol': market['symbol'],
            'maker': market['maker'],
            'taker': market['taker'],
            'percentage': true,
            'tierBased': false,
        };
    }

    /**
     * @method
     * @name truefinance#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetAccount (params);
        //
        //     {
        //         "ok": true,
        //         "account": { "equityUsd": "8553.8", "freeCollateralUsd": "7400.1", "marginUsed": "1153.7" },
        //         "positionsOk": true,
        //         "positions": [ ... ]
        //     }
        //
        return this.parseBalance (response);
    }

    override parseBalance (response: any): Balances {
        const account = this.safeDict (response, 'account', {});
        const result: Dict = {
            'info': response,
        };
        const code = 'USDC';
        const balance = this.account ();
        balance['total'] = this.safeString (account, 'equityUsd');
        balance['free'] = this.safeString (account, 'freeCollateralUsd');
        balance['used'] = this.safeString (account, 'marginUsed');
        result[code] = balance;
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name truefinance#fetchPositions
     * @description fetch all open positions
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async fetchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const symbolsNormalized: Strings = this.marketSymbols (symbols);
        const response = await this.privateGetPositions (params);
        //
        //     {
        //         "ok": true,
        //         "positionsOk": true,
        //         "positions": [
        //             { "market": "BTCUSDC", "size": "0.01", "entry_price": "80000", "unrealized_pnl": "12.5", "leverage": "5", "margin": "160", "liquidation_price": "64000" }
        //         ]
        //     }
        //
        const rows = this.safeList (response, 'positions', []);
        const open = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const size = this.safeString (row, 'size');
            if ((size !== undefined) && !Precise.stringEq (size, '0')) {
                open.push (row);
            }
        }
        return this.parsePositions (open, symbolsNormalized);
    }

    /**
     * @method
     * @name truefinance#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async fetchPosition (symbol: string, params: Dict = {}): Promise<Position> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const positions = await this.fetchPositions ([ market['symbol'] ], params);
        return this.safeDict (positions, 0, {}) as Position;
    }

    override parsePosition (position: Dict, market: Market = undefined): Position {
        //
        //     { "market": "BTCUSDC", "size": "-0.5", "entry_price": "82000", "unrealized_pnl": "-3", "realized_pnl": "1", "leverage": "10", "margin": "4100", "liquidation_price": "89000", "maintenance_margin_rate": "0.015" }
        //
        const marketId = this.safeString (position, 'market');
        const marketResolved: Market = this.safeMarket (marketId, market);
        const size = this.safeString (position, 'size', '0');
        const side = Precise.stringGt (size, '0') ? 'long' : 'short';
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': marketResolved['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': undefined,
            'hedged': false,
            'side': side,
            'contracts': this.parseNumber (Precise.stringAbs (size)),
            'contractSize': this.parseNumber ('1'),
            'entryPrice': this.safeNumber (position, 'entry_price'),
            'markPrice': this.safeNumber (position, 'liquidation_mark'),
            'lastPrice': undefined,
            'notional': undefined,
            'leverage': this.safeNumber (position, 'leverage'),
            'collateral': this.safeNumber (position, 'margin'),
            'initialMargin': this.safeNumber (position, 'initial_margin'),
            'maintenanceMargin': this.safeNumber (position, 'maintenance_margin'),
            'initialMarginPercentage': undefined,
            'maintenanceMarginPercentage': this.safeNumber (position, 'maintenance_margin_rate'),
            'unrealizedPnl': this.safeNumber (position, 'unrealized_pnl'),
            'realizedPnl': this.safeNumber (position, 'realized_pnl'),
            'liquidationPrice': this.safeNumber (position, 'liquidation_price'),
            'marginMode': 'cross',
            'marginRatio': undefined,
            'percentage': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    /**
     * @method
     * @name truefinance#createOrder
     * @description create a trade order
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price at which a stop market order is triggered
     * @param {float} [params.stopLossPrice] the price at which a stop loss market order is triggered
     * @param {float} [params.takeProfitPrice] the price at which a take profit market order is triggered
     * @param {bool} [params.postOnly] true for a post only limit order
     * @param {bool} [params.reduceOnly] true for an order that may only reduce a position
     * @param {string} [params.clientOrderId] a unique id for the order, idempotent on the venue for 24 hours
     * @param {string} [params.timeInForce] "GTC", "IOC" or "FOK"
     * @param {int} [params.leverage] leverage to set on the market before the order is placed
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        const response = await this.privatePostOrders (request);
        //
        //     {
        //         "ok": true,
        //         "clientOrderId": "my-order-1",
        //         "order": { "id": 42599337, "market": "BTCUSDC", "side": "BUY", "size": "0.002", "price": "81000", "status": "open", "timestamp": 1760780000500 }
        //     }
        //
        let order = this.safeDict (response, 'order', {});
        const clientOrderId = this.safeString (response, 'clientOrderId');
        if (clientOrderId !== undefined) {
            order = this.extend (order, { 'clientOrderId': clientOrderId });
        }
        return this.parseOrder (order, market);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Dict {
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'side': side.toLowerCase (),
            'size': this.amountToPrecision (symbol, amount),
        };
        const postOnly = this.safeBool2 (params, 'postOnly', 'post_only', false);
        const reduceOnly = this.safeBool2 (params, 'reduceOnly', 'reduce_only', false);
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        const triggerPrice = this.safeStringN (params, [ 'triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice' ]);
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        const timeInForce = this.safeString2 (params, 'timeInForce', 'tif');
        const leverage = this.safeInteger (params, 'leverage');
        const query = this.omit (params, [ 'postOnly', 'post_only', 'reduceOnly', 'reduce_only', 'triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice', 'clientOrderId', 'client_order_id', 'timeInForce', 'tif', 'leverage' ]);
        const lowered = type.toLowerCase ();
        if (triggerPrice !== undefined) {
            const isTakeProfit = (takeProfitPrice !== undefined) || (lowered === 'take_profit') || (lowered === 'take_profit_market');
            request['type'] = isTakeProfit ? 'take_profit_market' : 'stop_market';
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
        } else if (lowered === 'market') {
            request['type'] = 'market';
        } else {
            request['type'] = 'limit';
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price for limit orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (postOnly) {
            request['postOnly'] = true;
        }
        if (reduceOnly) {
            request['reduceOnly'] = true;
        }
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        }
        if (timeInForce !== undefined) {
            request['tif'] = timeInForce.toUpperCase ();
        }
        if (leverage !== undefined) {
            request['leverage'] = leverage;
        }
        return this.extend (request, query);
    }

    /**
     * @method
     * @name truefinance#editOrder
     * @description edit the price of a resting limit order
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type not used by truefinance editOrder ()
     * @param {string} side not used by truefinance editOrder ()
     * @param {float} [amount] not used by truefinance editOrder ()
     * @param {float} [price] the new price of the order
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (price === undefined) {
            throw new InvalidOrder (this.id + ' editOrder() only changes the price of a resting limit order, a price is required');
        }
        const request: Dict = {
            'id': id,
            'price': this.priceToPrecision (symbol, price),
        };
        await this.privatePatchOrdersId (this.extend (request, params));
        return await this.fetchOrder (id, market['symbol']);
    }

    /**
     * @method
     * @name truefinance#cancelOrder
     * @description cancels an open order
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'id': id,
            'market': market['id'],
        };
        const response = await this.privateDeleteOrdersId (this.extend (request, params));
        //
        //     { "ok": true, "orderId": "42599337", "market": "BTCUSDC" }
        //
        return this.safeOrder ({
            'id': id,
            'symbol': market['symbol'],
            'status': 'canceled',
            'info': response,
        }, market);
    }

    /**
     * @method
     * @name truefinance#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} [symbol] unified market symbol, only cancel orders in this market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelAllOrders (symbol: Str = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateDeleteOrders (this.extend (request, params));
        //
        //     { "ok": true, "results": [ { "orderId": "42599337", "market": "BTCUSDC", "ok": true } ] }
        //
        const results = this.safeList (response, 'results', []);
        const orders = [];
        for (let i = 0; i < results.length; i++) {
            const row = results[i];
            const cancelled = this.safeBool (row, 'ok', false);
            orders.push (this.safeOrder ({
                'id': this.safeString (row, 'orderId'),
                'symbol': this.safeSymbol (this.safeString (row, 'market'), market),
                'status': cancelled ? 'canceled' : 'open',
                'info': row,
            }));
        }
        return orders;
    }

    /**
     * @method
     * @name truefinance#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        //
        //     {
        //         "ok": true,
        //         "orders": [
        //             { "id": 42834527, "market": "BTCUSDC", "side": "BUY", "size": "0.001", "remaining_size": "0.001", "price": "81677", "status": "open", "order_type": "LIMIT", "flags": [], "time_in_force": "GTC", "timestamp": 1760782788518 }
        //         ]
        //     }
        //
        const orders = this.safeList (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name truefinance#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        const response = await this.privateGetOrdersHistory (this.extend (request, params));
        //
        //     {
        //         "ok": true,
        //         "page": {
        //             "next": null,
        //             "results": [
        //                 { "id": 42599337, "market": "BTCUSDC", "side": "BUY", "size": "0.002", "remaining_size": "0.002", "price": "81000", "status": "closed", "cancel_reason": "USER_CANCELED", "order_type": "LIMIT", "flags": [ "POST_ONLY" ], "timestamp": 1760780000500 }
        //             ]
        //         }
        //     }
        //
        const page = this.safeDict (response, 'page', response);
        const orders = this.safeList (page, 'results', []);
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name truefinance#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterByArray (orders, 'status', [ 'closed', 'canceled', 'expired', 'rejected' ], false);
    }

    /**
     * @method
     * @name truefinance#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'id': id,
            'market': market['id'],
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        //
        //     {
        //         "ok": true,
        //         "order": { "id": "42599337", "market": "BTCUSDC", "side": "buy", "type": "limit", "price": "81000", "size": "0.002", "filledSize": "0", "remainingSize": "0.002", "status": "cancelled", "cancelReason": "USER_CANCELED", "timestamp": 1760780000500, "raw": { ... } }
        //     }
        //
        const order = this.safeDict (response, 'order', {});
        return this.parseOrder (order, market);
    }

    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'open': 'open',
            'partially_filled': 'open',
            'pending_trigger': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'canceled': 'canceled',
            'expired': 'expired',
            'rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // raw venue row (open orders, history, createOrder)
        //
        //     { "id": 42834527, "market": "BTCUSDC", "side": "BUY", "size": "0.001", "remaining_size": "0.001", "price": "81677", "status": "open", "order_type": "LIMIT", "flags": [ "POST_ONLY" ], "time_in_force": "GTC", "timestamp": 1760782788518, "client_id": "" }
        //
        // normalized row (fetchOrder), with the venue row under "raw"
        //
        //     { "id": "42599337", "market": "BTCUSDC", "side": "buy", "type": "limit", "price": "81000", "size": "0.002", "filledSize": "0", "remainingSize": "0.002", "status": "cancelled", "cancelReason": "USER_CANCELED", "timestamp": 1760780000500, "raw": { ... } }
        //
        const raw = this.safeDict (order, 'raw', order);
        const marketId = this.safeString2 (order, 'market', 'symbol');
        const marketResolved: Market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (raw, 'timestamp', 'created_at', this.safeInteger (order, 'timestamp'));
        let orderType: Str = this.safeStringLower2 (order, 'type', 'order_type');
        if (orderType === undefined) {
            orderType = this.safeStringLower (raw, 'order_type', '');
        }
        const flags = this.safeList (raw, 'flags', []);
        let postOnly = false;
        let reduceOnly = false;
        for (let i = 0; i < flags.length; i++) {
            const flag = flags[i].toUpperCase ();
            if (flag === 'POST_ONLY') {
                postOnly = true;
            } else if (flag === 'REDUCE_ONLY') {
                reduceOnly = true;
            }
        }
        let amount = this.safeString2 (raw, 'size', 'amount');
        if (amount === undefined) {
            amount = this.safeString (order, 'size');
        }
        let remaining = this.safeString2 (raw, 'remaining_size', 'remainingSize');
        if (remaining === undefined) {
            remaining = this.safeString (order, 'remainingSize');
        }
        let filled = this.safeString (order, 'filledSize');
        if ((filled === undefined) && (amount !== undefined) && (remaining !== undefined)) {
            filled = Precise.stringSub (amount, remaining);
        }
        let statusRaw = this.safeStringLower (order, 'status');
        if (statusRaw === undefined) {
            statusRaw = this.safeStringLower (raw, 'status', '');
        }
        let cancelReason = this.safeString (raw, 'cancel_reason');
        if (cancelReason === undefined) {
            cancelReason = this.safeString (order, 'cancelReason');
        }
        let status = undefined;
        if (statusRaw === 'closed') {
            // the venue word for "no longer resting": filled when nothing remains and nothing was cancelled, cancelled otherwise
            const fullyFilled = (remaining === '0') && (filled !== undefined) && (filled !== '0') && (cancelReason === undefined);
            status = fullyFilled ? 'closed' : 'canceled';
        } else {
            status = this.parseOrderStatus (statusRaw);
        }
        const triggerPrice = this.safeString (raw, 'trigger_price');
        let id = this.safeString2 (order, 'id', 'order_id');
        if (id === undefined) {
            id = this.safeString (raw, 'id');
        }
        let clientOrderId = this.safeString (order, 'clientOrderId');
        if (clientOrderId === undefined) {
            clientOrderId = this.safeString (raw, 'client_id');
            if (clientOrderId === '') {
                clientOrderId = undefined;
            }
        }
        let side = this.safeStringLower (order, 'side');
        if (side === undefined) {
            side = this.safeStringLower (raw, 'side');
        }
        let price = this.safeString (raw, 'price');
        if (price === undefined) {
            price = this.safeString (order, 'price');
        }
        const isMarket = (orderType !== undefined) && (orderType.indexOf ('market') >= 0);
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'symbol': marketResolved['symbol'],
            'type': isMarket ? 'market' : 'limit',
            'timeInForce': this.safeString (raw, 'time_in_force'),
            'postOnly': postOnly,
            'reduceOnly': reduceOnly,
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'stopPrice': triggerPrice,
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, marketResolved);
    }

    /**
     * @method
     * @name truefinance#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve, max 200
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 200);
        }
        const response = await this.privateGetFills (this.extend (request, params));
        //
        //     {
        //         "ok": true,
        //         "page": {
        //             "next": null,
        //             "results": [
        //                 { "id": "177396390-1", "order_id": 42599337, "price": "81000", "size": "0.002", "fee": "0.0324", "fee_currency": "USDC", "liquidity": "maker", "side": "buy", "created_at": 1760780002000, "market": "BTCUSDC" }
        //             ]
        //         }
        //     }
        //
        const page = this.safeDict (response, 'page', response);
        const rows = this.safeList (page, 'results', []);
        return this.parseTrades (rows, market, since, limit);
    }

    /**
     * @method
     * @name truefinance#setLeverage
     * @description set the level of leverage for a market
     * @see https://docs.truefinance.ai/en/docs/bot-api
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    override async setLeverage (leverage: int, symbol: Str = undefined, params: Dict = {}): Promise<any> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'leverage': leverage,
        };
        //
        //     { "ok": true, "market": "BTCUSDC", "leverage": 5 }
        //
        return await this.privatePostLeverage (this.extend (request, params));
    }

    override nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    override sign (path: string, api: string[] = [ 'public' ], method = 'GET', params: Dict = {}): Dict {
        const apiName = api[0];
        const pathWithId = this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let urlPath = '/api/bot/v1/' + pathWithId;
        let url = this.implodeHostname (this.urls['api'][apiName]) + '/' + pathWithId;
        const headers: NullableDict = {
            'Accept': 'application/json',
        };
        let body = undefined;
        let rawBody = '';
        if ((method === 'GET') || (method === 'DELETE')) {
            if (Object.keys (query).length > 0) {
                const encoded = this.urlencode (query);
                url += '?' + encoded;
                urlPath += '?' + encoded;
            }
        } else {
            rawBody = this.json (query);
            body = rawBody;
            headers['Content-Type'] = 'application/json';
        }
        if (apiName === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.numberToString (this.nonce ());
            const canonical = timestamp + method.toUpperCase () + urlPath + rawBody;
            const signature = this.hmac (this.encode (canonical), this.encode (this.secret), sha256, 'hex');
            headers['X-TRUE-KEY'] = this.apiKey;
            headers['X-TRUE-TS'] = timestamp;
            headers['X-TRUE-SIGN'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     { "ok": false, "error": "order_not_found", "message": "no such order" }
        //     { "ok": false, "error": "position_notional_cap", "message": "cap 1000 USD", "detail": { ... } }
        //
        const ok = this.safeBool (response, 'ok');
        if (ok === false) {
            const error = this.safeString (response, 'error', '');
            const message = this.safeString2 (response, 'message', 'detail', body);
            const feedback = this.id + ' ' + error + ' ' + message;
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            if (code === 401) {
                throw new AuthenticationError (feedback);
            } else if (code === 403) {
                throw new PermissionDenied (feedback);
            } else if (code === 404) {
                throw new OrderNotFound (feedback);
            } else if (code === 429) {
                throw new RateLimitExceeded (feedback);
            } else if (code === 400) {
                throw new BadRequest (feedback);
            }
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
