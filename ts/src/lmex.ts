// ---------------------------------------------------------------------------
// LMEX Exchange connector for CCXT
// Spot API docs:    https://api.lmex.io/spot (OpenAPI v3.2)
// Futures API docs: https://api.lmex.io/futures (OpenAPI v2.3)
// Auth:             HMAC-SHA384( secret, path + nonce + body )
//                   path excludes query-string; body = '' for GET/DELETE
// ---------------------------------------------------------------------------

import Exchange from './abstract/lmex.js';
import {
    AuthenticationError, BadRequest, BadSymbol, ExchangeError,
    InsufficientFunds, InvalidOrder, OrderNotFound,
    RateLimitExceeded, PermissionDenied,
} from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha384 } from './static_dependencies/noble-hashes/sha512.js';
import type {
    Balances, Dict, FundingRate, FundingRates, Int, Market, Num, OHLCV,
    Order, OrderBook, OrderSide, OrderType, Position, Str, Strings,
    Ticker, Tickers, Trade, int,
} from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class lmex
 * @augments Exchange
 */
export default class lmex extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'lmex',
            'name': 'LMEX',
            'countries': [ 'SG' ],
            'rateLimit': 34,
            'version': 'v3.2',
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': true,
                'fetchFundingRates': true,
                'fetchL2OrderBook': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchWithdrawals': false,
                'setLeverage': true,
                'setMarginMode': false,
                'transfer': false,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '6h': '360',
                '1d': '1440',
                '1w': '10080',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/PLACEHOLDER/lmex.png',
                'api': {
                    'public': 'https://api.lmex.io/spot/api/v3.2',
                    'private': 'https://api.lmex.io/spot/api/v3.2',
                    'futuresPublic': 'https://api.lmex.io/futures/api/v2.3',
                    'futuresPrivate': 'https://api.lmex.io/futures/api/v2.3',
                },
                'test': {
                    'public': 'https://test-api.lmex.io/spot/api/v3.2',
                    'private': 'https://test-api.lmex.io/spot/api/v3.2',
                    'futuresPublic': 'https://test-api.lmex.io/futures/api/v2.3',
                    'futuresPrivate': 'https://test-api.lmex.io/futures/api/v2.3',
                },
                'www': 'https://www.lmex.io',
                'doc': [
                    'https://docs.lmex.io',
                ],
                'fees': 'https://www.lmex.io/fees',
                'referral': '',
            },
            'api': {
                'public': {
                    'get': {
                        'market_summary': 1,
                        'ohlcv': 1,
                        'price': 1,
                        'orderbook/L2': 1,
                        'trades': 1,
                        'time': 1,
                    },
                },
                'private': {
                    'get': {
                        'order': 1,
                        'user/wallet': 1,
                        'user/open_orders': 1,
                        'user/trade_history': 1,
                    },
                    'post': {
                        'order': 1,
                    },
                    'delete': {
                        'order': 1,
                    },
                },
                'futuresPublic': {
                    'get': {
                        'market_summary': 1,
                        'public/instruments': 1,
                        'orderbook': 1,
                        'orderbook/L2': 1,
                        'trades': 1,
                        'price': 1,
                        'ticker': 1,
                        'ohlcv': 1,
                        'time': 1,
                    },
                },
                'futuresPrivate': {
                    'get': {
                        'user/wallet': 1,
                        'user/positions': 1,
                        'user/open_orders': 1,
                        'user/trade_history': 1,
                        'order': 1,
                        'leverage': 1,
                    },
                    'post': {
                        'order': 1,
                        'order/close_position': 1,
                        'leverage': 1,
                        'user/cancel_all': 1,
                    },
                    'delete': {
                        'order': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0004'),
                    'taker': this.parseNumber ('0.0006'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                    '-8103': PermissionDenied,
                    '-7006': BadSymbol,
                    '10002': AuthenticationError,
                    '10001': AuthenticationError,
                    '80001': BadSymbol,
                    '80003': BadRequest,
                    '80004': BadRequest,
                    '80006': InvalidOrder,
                    '80007': InvalidOrder,
                },
                'broad': {
                    'INSUFFICIENT_BALANCE': InsufficientFunds,
                    'ORDER_NOTFOUND': OrderNotFound,
                    'API_MARKET_NOT_EXISTS': BadSymbol,
                    'RATE_LIMIT': RateLimitExceeded,
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                // LMEX futures accounts can be in ONE_WAY or HEDGE position mode.
                // Pass this with every futures order — set to undefined to omit (one-way accounts).
                'positionMode': 'HEDGE',
            },
            'features': {
                'spot': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': false,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
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
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': undefined,
                    },
                },
                'swap': {
                    'linear': {
                        'sandbox': true,
                        'createOrder': {
                            'marginMode': false,
                            'triggerPrice': true,
                            'triggerPriceType': undefined,
                            'triggerDirection': false,
                            'stopLossPrice': false,
                            'takeProfitPrice': false,
                            'attachedStopLossTakeProfit': undefined,
                            'timeInForce': {
                                'IOC': true,
                                'FOK': false,
                                'PO': true,
                                'GTD': false,
                            },
                            'hedged': false,
                            'selfTradePrevention': false,
                            'trailing': false,
                            'leverage': true,
                            'marketBuyByCost': false,
                            'marketBuyRequiresPrice': false,
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
                        'fetchOrders': undefined,
                        'fetchClosedOrders': undefined,
                        'fetchOHLCV': {
                            'limit': undefined,
                        },
                    },
                    'inverse': undefined,
                },
            },
        });
    }

    /**
     * @ignore
     * @method
     * @description returns epoch time in milliseconds — LMEX requires a ms-precision nonce
     */
    nonce (): int {
        return this.milliseconds ();
    }

    /**
     * @ignore
     * @method
     * @description builds URL and adds auth headers for signed endpoints
     * Signature = HMAC-SHA384( secret, sigPath + nonce + body )
     * sigPath = '/api/v3.2/' + path  for spot private
     * sigPath = '/api/v2.3/' + path  for futures private
     * nonce = epoch ms as string; body = JSON for POST, '' for GET/DELETE
     */
    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const baseUrl = this.safeValue (this.urls['api'], api, this.urls['api']['public']);
        let url = baseUrl + '/' + path;
        const isSpotPrivate = (api === 'private');
        const isFuturesPrivate = (api === 'futuresPrivate');
        const isPrivate = isSpotPrivate || isFuturesPrivate;
        if (isPrivate) {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let bodyStr = '';
            if (method === 'POST') {
                bodyStr = this.json (params);
                body = bodyStr;
                headers = {
                    'Content-Type': 'application/json',
                };
            } else {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
            let sigPath = '';
            if (isSpotPrivate) {
                sigPath = '/api/v3.2/' + path;
            } else {
                sigPath = '/api/v2.3/' + path;
            }
            const signature = this.hmac (this.encode (sigPath + nonce + bodyStr), this.encode (this.secret), sha384, 'hex');
            if (headers === undefined) {
                headers = {};
            }
            headers['request-api'] = this.apiKey;
            headers['request-nonce'] = nonce;
            headers['request-sign'] = signature;
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    /**
     * @method
     * @name lmex#fetchMarkets
     * @description retrieves data on all markets for lmex
     * @see https://api.lmex.io/spot/api/v3.2/market_summary
     * @see https://api.lmex.io/futures/api/v2.3/market_summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const spotResponse = await this.publicGetMarketSummary (params);
        const futuresResponse = await this.futuresPublicGetMarketSummary (params);
        const markets = [];
        for (let i = 0; i < spotResponse.length; i++) {
            markets.push (this.parseMarket (spotResponse[i]));
        }
        for (let i = 0; i < futuresResponse.length; i++) {
            const item = this.extend (futuresResponse[i], { 'futures': true });
            markets.push (this.parseMarket (item));
        }
        return markets;
    }

    /**
     * @ignore
     * @method
     * @description parses a market_summary item into a CCXT market object
     */
    parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'base');
        const quoteId = this.safeString (market, 'quote');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const isFutures = this.safeBool (market, 'futures', false);
        const isTimeBased = this.safeBool (market, 'timeBasedContract', false);
        const settle = isFutures ? 'USDT' : undefined;
        let type = 'spot';
        if (isFutures) {
            type = isTimeBased ? 'future' : 'swap';
        }
        let symbol = base + '/' + quote;
        if (isFutures) {
            symbol = base + '/' + quote + ':' + settle;
        }
        const maxLeverage = isFutures ? 100 : undefined;
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settle,
            'type': type,
            'spot': !isFutures,
            'margin': false,
            'swap': isFutures && !isTimeBased,
            'future': isFutures && isTimeBased,
            'option': false,
            'active': this.safeBool (market, 'active', true),
            'contract': isFutures,
            'linear': isFutures ? true : undefined,
            'inverse': isFutures ? false : undefined,
            'contractSize': isFutures ? this.safeNumber (market, 'contractSize', 1) : undefined,
            'expiry': isFutures ? this.safeInteger (market, 'contractEnd') : undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'taker': this.fees['trading']['taker'],
            'maker': this.fees['trading']['maker'],
            'limits': {
                'leverage': { 'min': isFutures ? 1 : undefined, 'max': maxLeverage },
                'amount': {
                    'min': this.safeNumber (market, 'minOrderSize'),
                    'max': this.safeNumber (market, 'maxOrderSize'),
                },
                'price': { 'min': this.safeNumber (market, 'minValidPrice'), 'max': undefined },
                'cost': { 'min': undefined, 'max': undefined },
            },
            'precision': {
                'amount': this.safeNumber (market, 'minSizeIncrement'),
                'price': this.safeNumber (market, 'minPriceIncrement'),
            },
            'info': market,
        });
    }

    /**
     * @method
     * @name lmex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://api.lmex.io/spot/api/v3.2/time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetTime (params);
        return this.safeInteger (response, 'epoch') * 1000;
    }

    /**
     * @method
     * @name lmex#fetchTicker
     * @description fetches a price ticker for a specific market
     * @see https://api.lmex.io/spot/api/v3.2/market_summary
     * @see https://api.lmex.io/futures/api/v2.3/market_summary
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = { 'symbol': market['id'] };
        const isFutures = market['swap'] || market['future'];
        let response = undefined;
        if (isFutures) {
            response = await this.futuresPublicGetMarketSummary (this.extend (request, params));
        } else {
            response = await this.publicGetMarketSummary (this.extend (request, params));
        }
        const data = Array.isArray (response) ? response[0] : response;
        return this.parseTicker (data, market);
    }

    /**
     * @method
     * @name lmex#fetchTickers
     * @description fetches price tickers for multiple markets
     * @see https://api.lmex.io/spot/api/v3.2/market_summary
     * @see https://api.lmex.io/futures/api/v2.3/market_summary
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const spotResponse = await this.publicGetMarketSummary (params);
        const futuresResponse = await this.futuresPublicGetMarketSummary (params);
        const all = this.arrayConcat (spotResponse, futuresResponse);
        const tickers = {};
        for (let i = 0; i < all.length; i++) {
            const ticker = this.parseTicker (all[i]);
            const sym = ticker['symbol'];
            if (sym !== undefined) {
                tickers[sym] = ticker;
            }
        }
        return this.filterByArrayTickers (tickers, 'symbol', symbols, false);
    }

    /**
     * @ignore
     * @method
     * @description parses a raw market_summary item into a unified CCXT ticker structure
     */
    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const id = this.safeString (ticker, 'symbol');
        const mkt = this.safeMarket (id, market);
        return this.safeTicker ({
            'symbol': mkt['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeNumber (ticker, 'high24Hr'),
            'low': this.safeNumber (ticker, 'low24Hr'),
            'bid': this.safeNumber (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeNumber (ticker, 'last'),
            'last': this.safeNumber (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeNumber (ticker, 'percentageChange'),
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'size'),
            'quoteVolume': this.safeNumber (ticker, 'volume'),
            'info': ticker,
        }, mkt);
    }

    /**
     * @method
     * @name lmex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.lmex.io/spot/api/v3.2/orderbook/L2
     * @see https://api.lmex.io/futures/api/v2.3/orderbook/L2
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isFutures = market['swap'] || market['future'];
        const request: Dict = { 'symbol': market['id'] };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        let response = undefined;
        if (isFutures) {
            response = await this.futuresPublicGetOrderbookL2 (this.extend (request, params));
        } else {
            response = await this.publicGetOrderbookL2 (this.extend (request, params));
        }
        const timestamp = this.safeInteger (response, 'timestamp', this.milliseconds ());
        const rawBids = this.safeList (response, 'buyQuote', []);
        const rawAsks = this.safeList (response, 'sellQuote', []);
        const bids = [];
        const asks = [];
        for (let i = 0; i < rawBids.length; i++) {
            const entry = rawBids[i];
            bids.push ([ this.safeNumber (entry, 'price'), this.safeNumber (entry, 'size') ]);
        }
        for (let i = 0; i < rawAsks.length; i++) {
            const entry = rawAsks[i];
            asks.push ([ this.safeNumber (entry, 'price'), this.safeNumber (entry, 'size') ]);
        }
        return this.parseOrderBook ({
            'bids': bids,
            'asks': asks,
        }, symbol, timestamp, 'bids', 'asks');
    }

    /**
     * @method
     * @name lmex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.lmex.io/spot/api/v3.2/ohlcv
     * @see https://api.lmex.io/futures/api/v2.3/ohlcv
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.end] ending timestamp in ms
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isFutures = market['swap'] || market['future'];
        const resolution = this.safeString (this.timeframes, timeframe, '1');
        const request: Dict = {
            'symbol': market['id'],
            'resolution': resolution,
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        let response = undefined;
        if (isFutures) {
            response = await this.futuresPublicGetOhlcv (this.extend (request, params));
        } else {
            response = await this.publicGetOhlcv (this.extend (request, params));
        }
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    /**
     * @ignore
     * @method
     * @description parses a raw OHLCV array into a unified CCXT OHLCV array
     */
    parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    /**
     * @method
     * @name lmex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.lmex.io/spot/api/v3.2/trades
     * @see https://api.lmex.io/futures/api/v2.3/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.startTime] starting timestamp in ms
     * @param {int} [params.endTime] ending timestamp in ms
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isFutures = market['swap'] || market['future'];
        const request: Dict = { 'symbol': market['id'] };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        let response = undefined;
        if (isFutures) {
            response = await this.futuresPublicGetTrades (this.extend (request, params));
        } else {
            response = await this.publicGetTrades (this.extend (request, params));
        }
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @ignore
     * @method
     * @description parses a raw trade object into a unified CCXT trade structure
     */
    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const id = this.safeString2 (trade, 'tradeId', 'serialId');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeStringLower (trade, 'side') as OrderSide;
        const price = this.safeNumber2 (trade, 'filledPrice', 'price');
        const amount = this.safeNumber2 (trade, 'filledSize', 'size');
        const mkt = this.safeMarket (this.safeString (trade, 'symbol'), market);
        const cost = (price !== undefined && amount !== undefined) ? price * amount : undefined;
        const feeCurrencyId = this.safeString (trade, 'feeCurrency');
        const feeAmount = this.safeNumber (trade, 'feeAmount');
        let fee = undefined;
        if ((feeAmount !== undefined) && (feeCurrencyId !== undefined)) {
            fee = { 'currency': this.safeCurrencyCode (feeCurrencyId), 'cost': feeAmount };
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': mkt['symbol'],
            'order': this.safeString2 (trade, 'orderId', 'orderID'),
            'type': this.parseOrderTypeFromInt (this.safeInteger (trade, 'orderType')),
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, mkt);
    }

    /**
     * @method
     * @name lmex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.lmex.io/futures/api/v2.3/user/wallet
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] wallet type, default 'CROSS@'
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const request = { 'wallet': 'CROSS@' };
        const response = await this.futuresPrivateGetUserWallet (this.extend (request, params));
        return this.parseBalance (response);
    }

    /**
     * @ignore
     * @method
     * @description parses a wallet balance response into a unified CCXT balance structure
     */
    parseBalance (response: any): Balances {
        const result: Dict = { 'info': response };
        const wallets = Array.isArray (response) ? response : [ response ];
        for (let i = 0; i < wallets.length; i++) {
            const wallet = wallets[i];
            const assets = this.safeList (wallet, 'assets', []);
            const assetsInUse = this.safeList (wallet, 'assetsInUse', []);
            const usedMap: Dict = {};
            for (let j = 0; j < assetsInUse.length; j++) {
                const entry = assetsInUse[j];
                const ccy = this.safeCurrencyCode (this.safeString (entry, 'currency'));
                usedMap[ccy] = this.safeNumber (entry, 'balance');
            }
            for (let j = 0; j < assets.length; j++) {
                const asset = assets[j];
                const code = this.safeCurrencyCode (this.safeString (asset, 'currency'));
                const total = this.safeNumber (asset, 'balance');
                const used = this.safeNumber (usedMap, code, 0);
                const free = (total !== undefined) ? total - used : undefined;
                result[code] = { 'free': free, 'used': used, 'total': total };
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name lmex#createOrder
     * @description create a trade order
     * @see https://api.lmex.io/spot/api/v3.2/order
     * @see https://api.lmex.io/futures/api/v2.3/order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.stopPrice] trigger price for stop orders
     * @param {float} [params.triggerPrice] trigger price for stop orders, same as stopPrice
     * @param {string} [params.time_in_force] 'GTC', 'IOC', 'FOK', etc.
     * @param {boolean} [params.postOnly] true for post-only orders
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'type': type.toUpperCase (),
            'size': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit' || type === 'stop_limit') {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price argument for a limit order');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const stopPrice = this.safeNumber2 (params, 'stopPrice', 'triggerPrice');
        if (stopPrice !== undefined) {
            request['triggerPrice'] = this.priceToPrecision (symbol, stopPrice);
            params = this.omit (params, [ 'stopPrice', 'triggerPrice' ]);
        }
        const isFutures = market['swap'] || market['future'];
        let raw = undefined;
        if (isFutures) {
            const positionMode = this.safeString (this.options, 'positionMode');
            if (positionMode !== undefined) {
                request['positionMode'] = positionMode;
            }
            raw = await this.futuresPrivatePostOrder (this.extend (request, params));
        } else {
            raw = await this.privatePostOrder (this.extend (request, params));
        }
        const data = Array.isArray (raw) ? raw[0] : raw;
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name lmex#cancelOrder
     * @description cancels an open order
     * @see https://api.lmex.io/spot/api/v3.2/order
     * @see https://api.lmex.io/futures/api/v2.3/order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clOrderID] client custom order ID
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request: Dict = { 'orderID': id };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const isFutures = (market !== undefined) && (market['swap'] || market['future']);
        let raw = undefined;
        if (isFutures) {
            raw = await this.futuresPrivateDeleteOrder (this.extend (request, params));
        } else {
            raw = await this.privateDeleteOrder (this.extend (request, params));
        }
        const data = Array.isArray (raw) ? raw[0] : raw;
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name lmex#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://api.lmex.io/spot/api/v3.2/order
     * @see https://api.lmex.io/futures/api/v2.3/user/cancel_all
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const isFutures = (market !== undefined) && (market['swap'] || market['future']);
        let response = undefined;
        if (isFutures) {
            response = await this.futuresPrivatePostUserCancelAll (this.extend (request, params));
        } else {
            response = await this.privateDeleteOrder (this.extend (request, params));
        }
        const orders = Array.isArray (response) ? response : [];
        return this.parseOrders (orders, market);
    }

    /**
     * @method
     * @name lmex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api.lmex.io/spot/api/v3.2/user/open_orders
     * @see https://api.lmex.io/futures/api/v2.3/user/open_orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const isFutures = (market !== undefined) && (market['swap'] || market['future']);
        let response = undefined;
        if (isFutures) {
            response = await this.futuresPrivateGetUserOpenOrders (this.extend (request, params));
        } else {
            response = await this.privateGetUserOpenOrders (this.extend (request, params));
        }
        const orders = Array.isArray (response) ? response : [];
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name lmex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api.lmex.io/spot/api/v3.2/order
     * @see https://api.lmex.io/futures/api/v2.3/order
     * @param {string} id the order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request: Dict = { 'orderID': id };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const isFutures = (market !== undefined) && (market['swap'] || market['future']);
        let response = undefined;
        if (isFutures) {
            response = await this.futuresPrivateGetOrder (this.extend (request, params));
        } else {
            response = await this.privateGetOrder (this.extend (request, params));
        }
        return this.parseOrder (response, market);
    }

    /**
     * @ignore
     * @method
     * @description parses a raw order object into a unified CCXT order structure
     */
    parseOrder (order: Dict, market: Market = undefined): Order {
        const id = this.safeString (order, 'orderID');
        const statusInt = this.safeInteger (order, 'status');
        const orderState = this.safeString (order, 'orderState');
        let status = undefined;
        if (statusInt !== undefined) {
            status = this.parseOrderStatusFromInt (statusInt);
        } else {
            status = this.parseOrderStatus (orderState);
        }
        const timestamp = this.safeInteger (order, 'timestamp');
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber2 (order, 'originalOrderSize', 'originalSize');
        const filled = this.safeNumber2 (order, 'filledSize', 'fillSize');
        const remaining = this.safeNumber (order, 'remainingSize');
        const mkt = this.safeMarket (this.safeString (order, 'symbol'), market);
        const orderTypeInt = this.safeInteger (order, 'orderType');
        const orderTypeStr = this.parseOrderTypeFromInt (orderTypeInt);
        const timeInForce = this.safeString2 (order, 'timeInForce', 'time_in_force');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': this.safeString (order, 'clOrderID'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': mkt['symbol'],
            'type': orderTypeStr as OrderType,
            'timeInForce': timeInForce,
            'postOnly': this.safeBool (order, 'postOnly'),
            'side': this.safeStringLower (order, 'side') as OrderSide,
            'price': price,
            'stopPrice': this.safeNumber (order, 'triggerPrice'),
            'triggerPrice': this.safeNumber (order, 'triggerPrice'),
            'average': this.safeNumber2 (order, 'avgFillPrice', 'averageFillPrice'),
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': undefined,
            'trades': [],
            'fee': undefined,
            'info': order,
        }, mkt);
    }

    /**
     * @ignore
     * @method
     * @description maps an LMEX integer order status code to a unified CCXT status string
     */
    parseOrderStatusFromInt (status: int): Str {
        const statuses: Dict = {
            '2': 'open',
            '4': 'closed',
            '5': 'open',
            '6': 'canceled',
            '7': 'canceled',
            '8': 'rejected',
            '9': 'open',
            '10': 'open',
            '15': 'rejected',
            '16': 'rejected',
            '17': 'rejected',
            '65': 'open',
            '85': 'open',
            '88': 'canceled',
        };
        return this.safeString (statuses, this.numberToString (status), 'open');
    }

    /**
     * @ignore
     * @method
     * @description maps an LMEX string orderState to a unified CCXT status string
     */
    parseOrderStatus (status: Str = undefined): Str {
        const statuses: Dict = {
            'STATUS_ACTIVE': 'open',
            'STATUS_INACTIVE': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @ignore
     * @method
     * @description maps an LMEX integer orderType to a unified CCXT order type string
     */
    parseOrderTypeFromInt (orderType: int): Str {
        const types: Dict = {
            '76': 'limit',
            '77': 'market',
            '80': 'limit',
        };
        return this.safeString (types, this.numberToString (orderType), 'limit');
    }

    /**
     * @method
     * @name lmex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.lmex.io/spot/api/v3.2/user/trade_history
     * @see https://api.lmex.io/futures/api/v2.3/user/trade_history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.endTime] latest timestamp in ms
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const isFutures = (market !== undefined) && (market['swap'] || market['future']);
        let response = undefined;
        if (isFutures) {
            response = await this.futuresPrivateGetUserTradeHistory (this.extend (request, params));
        } else {
            response = await this.privateGetUserTradeHistory (this.extend (request, params));
        }
        const trades = Array.isArray (response) ? response : [];
        return this.parseTrades (trades, market, since, limit);
    }

    /**
     * @method
     * @name lmex#fetchPositions
     * @description fetch all open positions
     * @see https://api.lmex.io/futures/api/v2.3/user/positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const response = await this.futuresPrivateGetUserPositions (params);
        const positions = Array.isArray (response) ? response : [];
        return this.parsePositions (positions, symbols);
    }

    /**
     * @method
     * @name lmex#fetchPosition
     * @description fetch data on an open position
     * @see https://api.lmex.io/futures/api/v2.3/user/positions
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    async fetchPosition (symbol: string, params = {}): Promise<Position> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const positions = await this.fetchPositions (undefined, params);
        for (let i = 0; i < positions.length; i++) {
            if (positions[i]['symbol'] === market['symbol']) {
                return positions[i];
            }
        }
        throw new ExchangeError (this.id + ' fetchPosition: position for ' + symbol + ' not found');
    }

    /**
     * @ignore
     * @method
     * @description parses a raw position object into a unified CCXT position structure
     */
    parsePosition (position: Dict, market: Market = undefined): Position {
        const id = this.safeString (position, 'symbol');
        const mkt = this.safeMarket (id, market);
        const sideStr = this.safeStringLower (position, 'side');
        const side = (sideStr === 'buy') ? 'long' : 'short';
        const contracts = this.safeNumber (position, 'size');
        const marginType = this.safeInteger (position, 'marginType');
        let marginMode = 'cross';
        if (marginType === 92) {
            marginMode = 'isolated';
        }
        const timestamp = this.safeInteger (position, 'timestamp');
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': mkt['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'contracts': contracts,
            'contractSize': mkt['contractSize'],
            'side': side,
            'notional': this.safeNumber (position, 'orderValue'),
            'leverage': this.safeNumber (position, 'currentLeverage'),
            'unrealizedPnl': this.safeNumber (position, 'unrealizedProfitLoss'),
            'realizedPnl': undefined,
            'collateral': undefined,
            'entryPrice': this.safeNumber (position, 'entryPrice'),
            'markPrice': this.safeNumber (position, 'markPrice'),
            'liquidationPrice': this.safeNumber (position, 'liquidationPrice'),
            'marginMode': marginMode,
            'hedged': this.safeString (position, 'positionMode') === 'HEDGE',
            'maintenanceMargin': this.safeNumber (position, 'totalMaintenanceMargin'),
            'initialMargin': undefined,
            'marginRatio': undefined,
            'percentage': undefined,
        });
    }

    /**
     * @method
     * @name lmex#fetchFundingRate
     * @description fetch the current funding rate for a swap market
     * @see https://api.lmex.io/futures/api/v2.3/market_summary
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = { 'symbol': market['id'] };
        const isFutures = market['swap'] || market['future'];
        let response = undefined;
        if (isFutures) {
            response = await this.futuresPublicGetMarketSummary (this.extend (request, params));
        } else {
            response = await this.publicGetMarketSummary (this.extend (request, params));
        }
        const data = Array.isArray (response) ? response[0] : response;
        return this.parseFundingRate (data, market);
    }

    /**
     * @method
     * @name lmex#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://api.lmex.io/futures/api/v2.3/market_summary
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-structure), indexed by market symbols
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        const response = await this.futuresPublicGetMarketSummary (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const marketId = this.safeString (item, 'symbol');
            const mkt = this.safeMarket (marketId);
            if (mkt !== undefined && mkt['swap']) {
                const fr = this.parseFundingRate (item, mkt);
                result[fr['symbol']] = fr;
            }
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArray (result, 'symbol', symbols) as FundingRates;
    }

    /**
     * @ignore
     * @method
     * @description parses a market_summary item into a unified CCXT funding rate structure
     */
    parseFundingRate (contract, market: Market = undefined): FundingRate {
        const id = this.safeString (contract, 'symbol');
        const mkt = this.safeMarket (id, market);
        return {
            'info': contract,
            'symbol': mkt['symbol'],
            'markPrice': this.safeNumber (contract, 'markPrice'),
            'indexPrice': this.safeNumber (contract, 'indexPrice'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    /**
     * @method
     * @name lmex#setLeverage
     * @description set the level of leverage for a market
     * @see https://api.lmex.io/futures/api/v2.3/leverage
     * @param {float} leverage the rate of leverage
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from exchange
     */
    async setLeverage (leverage: int, symbol: Str = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new BadRequest (this.id + ' setLeverage() requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = { 'symbol': market['id'], 'leverage': leverage };
        return await this.futuresPrivatePostLeverage (this.extend (request, params));
    }

    /**
     * @ignore
     * @method
     * @description is thrown in case of a failed request
     */
    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any {
        if (response === undefined) {
            return undefined;
        }
        // The exchange returns errors as {"errorCode":"...","message":"..."} or {"code":N,"msg":"..."}
        const errorCode = this.safeString (response, 'errorCode', this.safeString (response, 'error', this.safeString (response, 'code')));
        const message = this.safeString2 (response, 'message', 'msg', body);
        const feedback = this.id + ' ' + message;
        if (errorCode !== undefined && errorCode !== '0') {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            if (code === 401) {
                throw new AuthenticationError (feedback);
            }
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
