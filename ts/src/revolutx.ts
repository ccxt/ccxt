//  ---------------------------------------------------------------------------

import { ed25519 } from '@noble/curves/ed25519.js';
import Exchange from './abstract/revolutx.js';
import { AuthenticationError, DDoSProtection, InvalidOrder, OrderNotFound, ExchangeError, ArgumentsRequired, PermissionDenied, InsufficientFunds } from './base/errors.js';
import type { Balances, Currencies, Currency, Dict, Int, int, List, Market, MarketInterface, NullableDict, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';
import { Precise } from './base/Precise.js';
import { eddsa } from './base/functions/crypto.js';
import { TICK_SIZE } from './base/functions/number.js';

//  ---------------------------------------------------------------------------

/**
 * @class revolutx
 * @augments Exchange
 */
export default class revolutx extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'revolutx',
            'name': 'Revolut X',
            'countries': [ 'GB' ],
            'rateLimit': 1000,
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '4h': 240,
                '1d': 1440,
                '2d': 2880,
                '4d': 5760,
                '1w': 10080,
                '2w': 20160,
                '4w': 40320,
            },
            'urls': {
                'logo': 'https://exchange.revolut.com/favicon.ico',
                'api': {
                    'public': 'https://revx.revolut.com/api',
                    'private': 'https://revx.revolut.com/api',
                },
                'www': 'https://exchange.revolut.com',
                'doc': 'https://developer.revolut.com/docs/api/revolut-x-crypto-exchange',
                'fees': 'https://exchange.revolut.com/fees',
            },
            'api': {
                'public': {
                    'get': {
                        '2.0/public/order-book/{symbol}': 1,
                        '1.0/public/tickers': 1,
                        '1.0/public/candles/{symbol}': 1,
                        '1.0/public/trades/all': 1,
                        '1.0/public/configuration/currencies': 1,
                        '1.0/public/configuration/pairs': 1,
                    },
                },
                'private': {
                    'get': {
                        '1.0/balances': 1,
                        '1.0/orders/active': 1,
                        '1.0/orders/historical': 1,
                        '1.0/orders/{venue_order_id}': 1,
                        '1.0/orders/fills/{venue_order_id}': 1,
                        '1.0/trades/private/{symbol}': 1,
                    },
                    'post': {
                        '1.0/orders': 1,
                    },
                    'put': {
                        '1.0/orders/{venue_order_id}': 1,
                    },
                    'delete': {
                        '1.0/orders': 1,
                        '1.0/orders/{venue_order_id}': 1,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                'privateKey': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0009'),
                    'maker': this.parseNumber ('0'),
                },
            },
            'options': {
                'region': undefined,
            },
            'precisionMode': TICK_SIZE,
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1900,
                        'daysBack': 30,
                        'untilDays': undefined,
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 300,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 1900,
                        'daysBack': 30,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 1900,
                        'daysBack': 30,
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
            },
            'exceptions': {
                'exact': {},
                'broad': {
                    'insufficient': InsufficientFunds,
                    'invalid order': InvalidOrder,
                    'not found': OrderNotFound,
                },
            },
        });
    }

    override sign (path: any, api: any = 'public', method = 'GET', params: Dict = {}, headers: NullableDict = undefined, body: Str = undefined): Dict {
        const implodedPath = this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const queryLength = Object.keys (query).length;
        let url = this.urls['api'][api] + '/' + implodedPath;
        let queryString = '';
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            if (method === 'GET') {
                if (queryLength) {
                    queryString = this.urlencode (query);
                    url += '?' + queryString;
                }
            } else if (method === 'DELETE') {
                if (queryLength) {
                    queryString = this.urlencode (query);
                    url += '?' + queryString;
                }
            } else {
                body = this.json (query);
            }
            const requestPath = '/api/' + implodedPath;
            let bodyString = '';
            if (body !== undefined) {
                bodyString = body;
            }
            const message = timestamp + method.toUpperCase () + requestPath + queryString + bodyString;
            const signature = eddsa (this.encode (message), this.privateKey, ed25519);
            headers = {
                'X-Revx-API-Key': this.apiKey,
                'X-Revx-Timestamp': timestamp,
                'X-Revx-Signature': signature,
            };
            if (method === 'POST' || method === 'PUT') {
                headers['Content-Type'] = 'application/json';
            }
        } else {
            if (method === 'GET') {
                if (queryLength) {
                    queryString = this.urlencode (query);
                    url += '?' + queryString;
                }
            } else {
                body = this.json (query);
                headers = { 'Content-Type': 'application/json' };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    /**
     * @method
     * @name revolutx#parseMarket
     * @description parses a market from the exchange's market data
     * @ignore
     * @param {object} market the raw market data from the exchange
     * @returns {object} a [market structure]{@link https://docs.ccxt.com/?id=market-structure}
     */
    override parseMarket (market: Dict): MarketInterface {
        const id = this.safeString (market, 'id');
        const base = this.safeString (market, 'base', '');
        const quote = this.safeString (market, 'quote', '');
        const baseId = base;
        const quoteId = quote;
        const baseStep = this.safeString (market, 'base_step');
        const quoteStep = this.safeString (market, 'quote_step');
        const minOrderSize = this.safeString (market, 'min_order_size');
        const maxOrderSize = this.safeString (market, 'max_order_size');
        const minOrderSizeQuote = this.safeString (market, 'min_order_size_quote');
        const status = this.safeString (market, 'status');
        const active = (status === 'active');
        const symbol = base + '/' + quote;
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': active,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'contract': false,
            'settle': undefined,
            'settleId': undefined,
            'contractSize': undefined,
            'linear': undefined,
            'inverse': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'taker': this.parseNumber ('0.0009'),
            'maker': this.parseNumber ('0'),
            'percentage': true,
            'tierBased': false,
            'feeSide': 'get',
            'precision': {
                'amount': this.parseNumber (baseStep),
                'price': this.parseNumber (quoteStep),
            },
            'limits': {
                'amount': {
                    'min': this.parseNumber (minOrderSize),
                    'max': this.parseNumber (maxOrderSize),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.parseNumber (minOrderSizeQuote),
                    'max': undefined,
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'market': undefined,
            },
            'created': undefined,
            'info': market,
        };
    }

    /**
     * @method
     * @name revolutx#fetchMarkets
     * @description retrieves all available markets on the exchange
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.region] the region to filter markets by (e.g. EEA, UK)
     * @returns {object[]} an array of [market structures]{@link https://docs.ccxt.com/?id=market-structure}
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const request: Dict = {};
        const region = this.safeString2 (params, 'region', 'region', this.options['region']);
        if (region !== undefined) {
            request['region'] = region;
        }
        const response = await this['publicGet10PublicConfigurationPairs'] (this.extend (request, params));
        //
        //     {
        //         "BTC/USD": {
        //             "base": "BTC", "quote": "USD",
        //             "base_step": "0.0000001", "quote_step": "0.01",
        //             "min_order_size": "0.0000001", "max_order_size": "1000",
        //             "min_order_size_quote": "0.01", "status": "active"
        //         }
        //     }
        //
        const markets = this.safeDict (response, 'data', response);
        const keys = Object.keys (markets);
        const result: MarketInterface[] = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = this.safeDict (markets, key, {});
            const base = this.safeString (market, 'base');
            const quote = this.safeString (market, 'quote');
            const marketId = base + '-' + quote;
            const marketData = this.extend (market, { 'id': marketId });
            result.push (this.parseMarket (marketData));
        }
        return result as Market[];
    }

    /**
     * @method
     * @name revolutx#parseCurrency
     * @description parses a currency from the exchange's currency data
     * @ignore
     * @param {object} currency the raw currency data from the exchange
     * @returns {object} a [currency structure]{@link https://docs.ccxt.com/?id=currency-structure}
     */
    override parseCurrency (currency: Dict): Currency {
        const id = this.safeString2 (currency, 'id', 'symbol', '');
        const code = this.safeCurrencyCode (id);
        const name = this.safeString (currency, 'name');
        const scale = this.safeInteger (currency, 'scale');
        const status = this.safeString (currency, 'status');
        const active = (status === 'active');
        const assetType = this.safeString (currency, 'asset_type');
        const type = (assetType === 'crypto') ? 'crypto' : 'fiat';
        const precision = (scale !== undefined) ? Math.pow (10, -scale) : undefined;
        return {
            'info': currency,
            'id': id,
            'code': code,
            'name': name,
            'active': active,
            'type': type,
            'precision': this.parseNumber (precision),
            'fee': undefined,
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
            'networks': {},
        } as Currency;
    }

    /**
     * @method
     * @name revolutx#fetchCurrencies
     * @description fetches all available currencies on the exchange
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.region] the region to filter currencies by
     * @returns {object} a dictionary of [currency structures]{@link https://docs.ccxt.com/?id=currency-structure}
     */
    override async fetchCurrencies (params = {}): Promise<Currencies> {
        const request: Dict = {};
        const region = this.safeString2 (params, 'region', 'region', this.options['region']);
        if (region !== undefined) {
            request['region'] = region;
        }
        const response = await this['publicGet10PublicConfigurationCurrencies'] (this.extend (request, params));
        //
        //     {
        //         "BTC": { "symbol": "BTC", "name": "Bitcoin", "scale": 8, "asset_type": "crypto", "status": "active" },
        //         "USD": { "symbol": "$", "name": "US Dollar", "scale": 2, "asset_type": "fiat", "status": "active" }
        //     }
        //
        const currencies = this.safeDict (response, 'data', response);
        const keys = Object.keys (currencies);
        const result: Dict = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const currency = this.safeDict (currencies, key, {});
            const currencyData = this.extend (currency, { 'id': key });
            const parsed = this.parseCurrency (currencyData);
            const code = this.safeString (parsed, 'code', '');
            if (code === '') {
                continue;
            }
            result[code] = parsed;
        }
        return result as Currencies;
    }

    /**
     * @method
     * @name revolutx#parseTicker
     * @description parses a ticker from the exchange's ticker data
     * @ignore
     * @param {object} ticker the raw ticker data from the exchange
     * @param {object} [market] the market the ticker is for
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const tickerSymbol = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (tickerSymbol, market, '/');
        const bid = this.safeString (ticker, 'bid');
        const ask = this.safeString (ticker, 'ask');
        const last = this.safeString (ticker, 'last_price');
        const high = this.safeString (ticker, 'high_24h');
        const low = this.safeString (ticker, 'low_24h');
        const priceChange = this.safeString (ticker, 'price_change_24h');
        const baseVolume = this.safeString (ticker, 'volume_24h');
        const timestamp = this.safeInteger (ticker, 'timestamp');
        let open = undefined;
        if (last !== undefined && priceChange !== undefined) {
            open = Precise.stringSub (last, priceChange);
        }
        let percentage = undefined;
        if (open !== undefined && priceChange !== undefined) {
            const percentageString = Precise.stringDiv (priceChange, open, 8);
            percentage = this.parseNumber (Precise.stringMul (percentageString, '100'));
        }
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': priceChange,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name revolutx#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.region] the region to fetch tickers for (e.g. EEA, UK)
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {};
        if (symbols !== undefined) {
            const marketIds: List = [];
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market (symbol);
                marketIds.push (market['id']);
            }
            request['symbols'] = marketIds.join (',');
        }
        const region = this.safeString2 (params, 'region', 'region', this.options['region']);
        if (region !== undefined) {
            request['region'] = region;
        }
        const response = await this['publicGet10PublicTickers'] (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             { "symbol": "BTC/USD", "bid": "119950.00", "ask": "120050.00", "mid": "120000.00",
        //               "last_price": "119980.00", "low_24h": "115000.00", "high_24h": "122500.00",
        //               "price_change_24h": "2480.00", "volume_24h": "135.42000000", "region": "EEA" }
        //         ],
        //         "metadata": { "timestamp": 1785313433816 }
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const metadata = this.safeDict (response, 'metadata', {});
        const timestamp = this.safeInteger (metadata, 'timestamp');
        const result: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const tickerData = this.safeDict (data, i, {});
            tickerData['timestamp'] = timestamp;
            const ticker = this.parseTicker (tickerData);
            const symbol = this.safeString (ticker, 'symbol', '');
            if (symbol === '') {
                continue;
            }
            result[symbol] = ticker;
        }
        if (symbols !== undefined) {
            const filtered: Dict = {};
            for (let i = 0; i < symbols.length; i++) {
                const s = symbols[i];
                if (s in result) {
                    filtered[s] = result[s];
                }
            }
            return filtered as Tickers;
        }
        return result as Tickers;
    }

    /**
     * @method
     * @name revolutx#fetchTicker
     * @description fetches a price ticker for a given market symbol
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.region] the region to fetch the ticker for
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const tickers = await this.fetchTickers ([ symbol ], params);
        const ticker = this.safeDict (tickers, symbol);
        if (ticker === undefined) {
            throw new ExchangeError (this.id + ' fetchTicker() could not find ticker for symbol ' + symbol);
        }
        return ticker as Ticker;
    }

    /**
     * @method
     * @name revolutx#fetchOrderBook
     * @description fetches the current order book snapshot for a given market symbol
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum number of orders to return (1-50, default 50)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.region] the region to fetch the order book for
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const region = this.safeString2 (params, 'region', 'region', this.options['region']);
        if (region !== undefined) {
            request['region'] = region;
        }
        const response = await this['publicGet20PublicOrderBookSymbol'] (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "asks": [ { "price": "4005.00", "quantity": "1.7000", "count": 3 } ],
        //             "bids": [ { "price": "4000.00", "quantity": "0.25", "count": 1 } ]
        //         },
        //         "metadata": { "region": "UK", "timestamp": 1785313433816 }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const metadata = this.safeDict (response, 'metadata', {});
        const timestamp = this.safeInteger (metadata, 'timestamp');
        const asks = this.safeList (data, 'asks', []);
        const bids = this.safeList (data, 'bids', []);
        const orderbook: Dict = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
        for (let i = 0; i < asks.length; i++) {
            const ask = this.safeDict (asks, i, {});
            const price = this.safeNumber (ask, 'price');
            const amount = this.safeNumber (ask, 'quantity');
            orderbook['asks'].push ([ price, amount ]);
        }
        for (let i = 0; i < bids.length; i++) {
            const bid = this.safeDict (bids, i, {});
            const price = this.safeNumber (bid, 'price');
            const amount = this.safeNumber (bid, 'quantity');
            orderbook['bids'].push ([ price, amount ]);
        }
        return this.parseOrderBook (orderbook, symbol, timestamp);
    }

    /**
     * @method
     * @name revolutx#parseOHLCV
     * @description parses an OHLCV candle from the exchange's candle data
     * @ignore
     * @param {object} ohlcv the raw candle data from the exchange
     * @param {object} [market] the market the candle is for
     * @returns {int[]} an [OHLCV structure]{@link https://docs.ccxt.com/?id=ohlcv-structure}
     */
    override parseOHLCV (ohlcv: Dict, market: Market = undefined): OHLCV {
        const timestamp = this.safeInteger (ohlcv, 'start');
        const open = this.safeNumber (ohlcv, 'open');
        const high = this.safeNumber (ohlcv, 'high');
        const low = this.safeNumber (ohlcv, 'low');
        const close = this.safeNumber (ohlcv, 'close');
        const volume = this.safeNumber (ohlcv, 'volume');
        return [ timestamp, open, high, low, close, volume ];
    }

    /**
     * @method
     * @name revolutx#fetchOHLCV
     * @description fetches historical candlestick data for a given market symbol
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents (e.g. 1m, 5m, 1h, 1d)
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {string} [params.region] the region to fetch candles for
     * @returns {int[][]} a list of [OHLCV structures]{@link https://docs.ccxt.com/?id=ohlcv-structure}
     */
    override async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'interval': this.safeInteger (this.timeframes, timeframe, 5),
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        const until = this.safeInteger2 (params, 'until', 'until');
        if (until !== undefined) {
            request['until'] = until;
        } else {
            request['until'] = this.milliseconds ();
        }
        const region = this.safeString2 (params, 'region', 'region', this.options['region']);
        if (region !== undefined) {
            request['region'] = region;
        }
        const response = await this['publicGet10PublicCandlesSymbol'] (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             { "start": 1785309833816, "open": "119800.00", "high": "120100.00",
        //               "low": "119700.00", "close": "120000.00", "volume": "0.25000000" }
        //         ],
        //         "metadata": { "region": "EEA", "timestamp": 1785313433816 }
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const result: OHLCV[] = [];
        for (let i = 0; i < data.length; i++) {
            const candle = this.safeDict (data, i, {});
            result.push (this.parseOHLCV (candle, market));
        }
        if (limit !== undefined && result.length > limit) {
            return result.slice (0, limit);
        }
        return result;
    }

    /**
     * @method
     * @name revolutx#parseTrade
     * @description parses a trade from the exchange's public trade data
     * @ignore
     * @param {object} trade the raw trade data from the exchange
     * @param {object} [market] the market the trade was executed in
     * @returns {object} a [trade structure]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        const id = this.safeString (trade, 'id');
        const tradeSymbol = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (tradeSymbol, market, '/');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'quantity');
        const side = this.safeStringLower (trade, 'side');
        const timestamp = this.safeInteger (trade, 'timestamp');
        let cost = undefined;
        if (price !== undefined && amount !== undefined) {
            cost = price * amount;
        }
        return {
            'info': trade,
            'id': id,
            'order': undefined,
            'symbol': symbol,
            'side': side,
            'type': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        } as Trade;
    }

    /**
     * @method
     * @name revolutx#fetchTrades
     * @description fetches the public trade history for a given market symbol
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to return (1-1900, default 1900)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @param {string} [params.cursor] pagination cursor from the previous response
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async fetchTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request: Dict = {};
        if (market !== undefined) {
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_date'] = since;
        }
        const until = this.safeInteger2 (params, 'until', 'until');
        if (until !== undefined) {
            request['end_date'] = until;
        } else if (since !== undefined) {
            request['end_date'] = this.milliseconds ();
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const cursor = this.safeString (params, 'cursor');
        if (cursor !== undefined) {
            request['cursor'] = cursor;
        }
        const response = await this['publicGet10PublicTradesAll'] (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             { "id": "3b2b202b-7668-43cf-a6c8-b3354e7f4c52", "symbol": "BTC/USD",
        //               "price": "119980.00", "quantity": "0.01000000", "side": "sell", "timestamp": 1785313433816 }
        //         ],
        //         "metadata": { "timestamp": 1785313433816, "next_cursor": "..." }
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const result: Trade[] = [];
        for (let i = 0; i < data.length; i++) {
            const trade = this.safeDict (data, i, {});
            result.push (this.parseTrade (trade, market));
        }
        return result;
    }

    /**
     * @method
     * @name revolutx#fetchBalance
     * @description fetches the current balance for the authenticated user
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async fetchBalance (params = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const response = await this['privateGet10Balances'] (params);
        //
        //     [
        //         { "currency": "BTC", "available": "1.25000000", "reserved": "0.10000000", "total": "1.35000000" },
        //         { "currency": "USD", "available": "50000.00", "reserved": "1000.00", "total": "51000.00", "staked": "32.00000000" }
        //     ]
        //
        const data = this.safeList (response, 'data', response);
        const result: Dict = { 'info': response };
        for (let i = 0; i < data.length; i++) {
            const balance = this.safeDict (data, i, {});
            const currency = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currency);
            if (code === undefined) {
                continue;
            }
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            const reserved = this.safeString (balance, 'reserved');
            const staked = this.safeString (balance, 'staked');
            let used = reserved;
            if (staked !== undefined) {
                used = (reserved === undefined) ? staked : Precise.stringAdd (reserved, staked);
            }
            account['used'] = used;
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name revolutx#parseOrderStatus
     * @description parses the order status from the exchange's status to the unified ccxt status
     * @ignore
     * @param {string} status the exchange-specific order status
     * @returns {string|undefined} the unified order status
     */
    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'pending_new': 'open',
            'new': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'canceled': 'canceled',
            'rejected': 'rejected',
            'replaced': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name revolutx#parseOrder
     * @description parses an order from the exchange's order data
     * @ignore
     * @param {object} order the raw order data from the exchange
     * @param {object} [market] the market the order was placed in
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override parseOrder (order: Dict, market: Market = undefined): Order {
        const orderId = this.safeString2 (order, 'id', 'venue_order_id');
        const clientOrderId = this.safeString (order, 'client_order_id');
        const orderSymbol = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (orderSymbol, market, '/');
        const side = this.safeStringLower (order, 'side');
        const orderType = this.safeStringLower (order, 'type');
        const quantity = this.safeString (order, 'quantity');
        const filledQuantity = this.safeString (order, 'filled_quantity');
        const leavesQuantity = this.safeString (order, 'leaves_quantity');
        const price = this.safeString (order, 'price');
        const averageFillPrice = this.safeString (order, 'average_fill_price');
        const amount = this.safeString (order, 'amount');
        const filledAmount = this.safeString (order, 'filled_amount');
        const totalFee = this.safeString (order, 'total_fee');
        const feeCurrency = this.safeString (order, 'fee_currency');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timeInForce = this.safeString (order, 'time_in_force');
        const createdDate = this.safeInteger (order, 'created_date');
        const updatedDate = this.safeInteger (order, 'updated_date');
        let fee = undefined;
        if (totalFee !== undefined) {
            fee = {
                'cost': this.parseNumber (totalFee),
                'currency': feeCurrency,
            };
        }
        let amountValue = undefined;
        if (quantity !== undefined) {
            amountValue = quantity;
        } else if (amount !== undefined) {
            amountValue = amount;
        }
        let filledValue = undefined;
        if (filledQuantity !== undefined) {
            filledValue = filledQuantity;
        } else if (filledAmount !== undefined) {
            filledValue = filledAmount;
        }
        let remainingValue = undefined;
        if (leavesQuantity !== undefined) {
            remainingValue = leavesQuantity;
        }
        return this.safeOrder ({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'symbol': symbol,
            'side': side,
            'type': orderType,
            'price': this.parseNumber (price),
            'average': this.parseNumber (averageFillPrice),
            'amount': this.parseNumber (amountValue),
            'filled': this.parseNumber (filledValue),
            'remaining': this.parseNumber (remainingValue),
            'status': status,
            'timeInForce': timeInForce,
            'timestamp': createdDate,
            'datetime': this.iso8601 (createdDate),
            'lastUpdateTimestamp': updatedDate,
            'fee': fee,
            'info': order,
        }, market);
    }

    /**
     * @method
     * @name revolutx#createOrder
     * @description create a trade order
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-trading
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the base currency you want to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a custom client order id (UUID)
     * @param {string} [params.quoteSize] the order size in quote currency (alternative to amount)
     * @param {string} [params.timeInForce] 'gtc' or 'ioc' for limit orders
     * @param {string[]} [params.executionInstructions] limit order instructions, e.g. ['post_only'] or ['allow_taker']
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id', this.uuid ());
        const quoteSize = this.safeString2 (params, 'quoteSize', 'quote_size');
        const timeInForce = this.safeStringLower2 (params, 'timeInForce', 'time_in_force');
        const executionInstructions = this.safeList (params, 'executionInstructions', this.safeList (params, 'execution_instructions'));
        const orderConfiguration: Dict = {};
        if (type === 'limit') {
            const limitConfig: Dict = {};
            if (quoteSize !== undefined) {
                limitConfig['quote_size'] = quoteSize;
            } else {
                limitConfig['base_size'] = this.amountToPrecision (symbol, amount);
            }
            limitConfig['price'] = this.priceToPrecision (symbol, price);
            if (timeInForce !== undefined) {
                limitConfig['time_in_force'] = timeInForce;
            }
            if (executionInstructions !== undefined) {
                limitConfig['execution_instructions'] = executionInstructions;
            }
            orderConfiguration['limit'] = limitConfig;
        } else if (type === 'market') {
            if (timeInForce !== undefined) {
                throw new InvalidOrder (this.id + ' createOrder() timeInForce is only supported for limit orders');
            }
            if (executionInstructions !== undefined) {
                throw new InvalidOrder (this.id + ' createOrder() executionInstructions are only supported for limit orders');
            }
            const marketConfig: Dict = {};
            if (quoteSize !== undefined) {
                marketConfig['quote_size'] = quoteSize;
            } else {
                marketConfig['base_size'] = this.amountToPrecision (symbol, amount);
            }
            orderConfiguration['market'] = marketConfig;
        } else {
            throw new InvalidOrder (this.id + ' createOrder() does not support order type ' + type);
        }
        const request: Dict = {
            'client_order_id': clientOrderId,
            'symbol': market['id'],
            'side': side,
            'order_configuration': orderConfiguration,
        };
        const response = await this['privatePost10Orders'] (this.extend (request, this.omit (params, [ 'quoteSize', 'quote_size', 'clientOrderId', 'client_order_id', 'timeInForce', 'time_in_force', 'executionInstructions', 'execution_instructions' ])));
        //
        //     {
        //         "data": [
        //             { "venue_order_id": "7a52e92e-8639-4fe1-abaa-68d3a2d5234b", "client_order_id": "...", "state": "new" }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orderData = Array.isArray (data) ? this.safeDict (data, 0, {}) : this.safeDict (response, 'data', {});
        const venueOrderId = this.safeString (orderData, 'venue_order_id');
        const state = this.safeString (orderData, 'state');
        const order = this.parseOrder (this.extend (orderData, {
            'id': venueOrderId,
            'symbol': market['id'],
            'status': state,
            'side': side,
            'type': type,
        }), market);
        return order;
    }

    /**
     * @method
     * @name revolutx#cancelOrder
     * @description cancels an open order by its id
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-trading
     * @param {string} id the order id (venue order id)
     * @param {string} symbol not used by this exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {
            'venue_order_id': id,
        };
        await this['privateDelete10OrdersVenueOrderId'] (this.extend (request, params));
        return {
            'id': id,
            'status': 'canceled',
            'info': undefined,
        } as Order;
    }

    /**
     * @method
     * @name revolutx#cancelAllOrders
     * @description cancels all open orders
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-trading
     * @param {string} [symbol] not used by this exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an empty [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        await this['privateDelete10Orders'] (params);
        return [];
    }

    /**
     * @method
     * @name revolutx#fetchOrder
     * @description fetches an order by its id
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data
     * @param {string} id the order id (venue order id)
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {
            'venue_order_id': id,
        };
        const response = await this['privateGet10OrdersVenueOrderId'] (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "id": "uuid", "client_order_id": "uuid", "symbol": "BTC/USD",
        //             "side": "buy", "type": "limit", "quantity": "0.002", "filled_quantity": "0",
        //             "leaves_quantity": "0.002", "amount": "240.00", "filled_amount": "0",
        //             "price": "120000.00", "average_fill_price": "0", "total_fee": "0",
        //             "fee_currency": "USD", "status": "new", "time_in_force": "gtc",
        //             "execution_instructions": ["allow_taker"],
        //             "created_date": 1785309833816, "updated_date": 1785313433816
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name revolutx#fetchOpenOrders
     * @description fetches all open orders for the authenticated user
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data
     * @param {string|undefined} symbol unified symbol of the market to fetch open orders for
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to return (1-300, default 300)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.cursor] pagination cursor from the previous response
     * @param {string[]} [params.orderStates] filter by order states, e.g. ['new', 'partially_filled']
     * @param {string[]} [params.orderTypes] filter by order types, e.g. ['limit', 'market']
     * @param {string} [params.side] filter by side, 'buy' or 'sell'
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbols'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const cursor = this.safeString (params, 'cursor');
        if (cursor !== undefined) {
            request['cursor'] = cursor;
        }
        const orderStates = this.safeList2 (params, 'orderStates', 'order_states');
        if (orderStates !== undefined) {
            request['order_states'] = orderStates.join (',');
        }
        const orderTypes = this.safeList2 (params, 'orderTypes', 'order_types');
        if (orderTypes !== undefined) {
            request['order_types'] = orderTypes.join (',');
        }
        const side = this.safeString (params, 'side');
        if (side !== undefined) {
            request['side'] = side;
        }
        const response = await this['privateGet10OrdersActive'] (this.extend (request, this.omit (params, [ 'cursor', 'orderStates', 'order_states', 'orderTypes', 'order_types', 'side' ])));
        //
        //     {
        //         "data": [ { "id": "uuid", "client_order_id": "uuid", "symbol": "BTC/USD", ... } ],
        //         "metadata": { "timestamp": 1785313433816, "next_cursor": "..." }
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const result: Order[] = [];
        for (let i = 0; i < data.length; i++) {
            const order = this.safeDict (data, i, {});
            result.push (this.parseOrder (order));
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit) as Order[];
    }

    /**
     * @method
     * @name revolutx#fetchOrders
     * @description fetches historical orders for the authenticated user
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data
     * @param {string|undefined} symbol unified symbol of the market to fetch orders for
     * @param {int} [since] timestamp in ms of the earliest order to fetch, the lookup window is limited to 30 days
     * @param {int} [limit] the maximum number of orders to return (1-1900, default 1900)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest order to fetch
     * @param {string} [params.cursor] pagination cursor from the previous response
     * @param {string[]} [params.orderStates] filter by order states, e.g. ['filled', 'cancelled', 'rejected']
     * @param {string[]} [params.orderTypes] filter by order types, e.g. ['limit', 'market']
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const request: Dict = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbols'] = market['id'];
        }
        const thirtyDays = 2592000000;
        const until = this.safeInteger2 (params, 'until', 'until');
        if (since !== undefined) {
            request['start_date'] = since;
        } else if (until !== undefined) {
            request['start_date'] = until - thirtyDays;
        }
        if (until !== undefined) {
            request['end_date'] = until;
        } else if (since !== undefined) {
            const now = this.milliseconds ();
            const defaultEnd = since + thirtyDays;
            request['end_date'] = (defaultEnd < now) ? defaultEnd : now;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const cursor = this.safeString (params, 'cursor');
        if (cursor !== undefined) {
            request['cursor'] = cursor;
        }
        const orderStates = this.safeList2 (params, 'orderStates', 'order_states');
        if (orderStates !== undefined) {
            request['order_states'] = orderStates.join (',');
        }
        const orderTypes = this.safeList2 (params, 'orderTypes', 'order_types');
        if (orderTypes !== undefined) {
            request['order_types'] = orderTypes.join (',');
        }
        const response = await this['privateGet10OrdersHistorical'] (this.extend (request, this.omit (params, [ 'until', 'cursor', 'orderStates', 'order_states', 'orderTypes', 'order_types' ])));
        const data = this.safeList (response, 'data', []);
        const result: Order[] = [];
        for (let i = 0; i < data.length; i++) {
            const order = this.safeDict (data, i, {});
            result.push (this.parseOrder (order));
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit) as Order[];
    }

    /**
     * @method
     * @name revolutx#fetchClosedOrders
     * @description fetches closed (filled, cancelled, rejected) orders for the authenticated user
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data
     * @param {string|undefined} symbol unified symbol of the market to fetch orders for
     * @param {int} [since] timestamp in ms of the earliest order to fetch, the lookup window is limited to 30 days
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const orderStates = this.safeList2 (params, 'orderStates', 'order_states', [ 'filled', 'cancelled', 'rejected', 'replaced' ]);
        const requestParams = this.extend (this.omit (params, [ 'orderStates', 'order_states' ]), {
            'order_states': orderStates,
        });
        return await this.fetchOrders (symbol, since, limit, requestParams);
    }

    /**
     * @method
     * @name revolutx#parseMyTrade
     * @description parses a trade from the exchange's private trade format
     * @ignore
     * @param {object} trade the raw trade data from the exchange
     * @param {object} [market] the market the trade was executed in
     * @returns {object} a [trade structure]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    parseMyTrade (trade: Dict, market: Market = undefined): Trade {
        const id = this.safeString (trade, 'tid');
        const orderId = this.safeString (trade, 'oid');
        const price = this.safeNumber (trade, 'p');
        const amount = this.safeNumber (trade, 'q');
        const side = this.safeStringLower (trade, 's');
        const timestamp = this.safeInteger2 (trade, 'tdt', 'pdt');
        const isMaker = this.safeBool (trade, 'im', false);
        const takerOrMaker = (isMaker) ? 'maker' : 'taker';
        let cost = undefined;
        if (price !== undefined && amount !== undefined) {
            cost = price * amount;
        }
        const symbol = this.safeSymbol (undefined, market);
        return {
            'info': trade,
            'id': id,
            'order': orderId,
            'symbol': symbol,
            'side': side,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        } as Trade;
    }

    /**
     * @method
     * @name revolutx#fetchMyTrades
     * @description fetches the trade history for the authenticated user
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch, the lookup window is limited to 30 days
     * @param {int} [limit] the maximum number of trades to return (1-1900, default 1900)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @param {string} [params.cursor] pagination cursor from the previous response
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol parameter');
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const thirtyDays = 2592000000;
        const until = this.safeInteger2 (params, 'until', 'until');
        if (since !== undefined) {
            request['start_date'] = since;
        } else if (until !== undefined) {
            request['start_date'] = until - thirtyDays;
        }
        if (until !== undefined) {
            request['end_date'] = until;
        } else if (since !== undefined) {
            const now = this.milliseconds ();
            const defaultEnd = since + thirtyDays;
            request['end_date'] = (defaultEnd < now) ? defaultEnd : now;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const cursor = this.safeString (params, 'cursor');
        if (cursor !== undefined) {
            request['cursor'] = cursor;
        }
        const response = await this['privateGet10TradesPrivateSymbol'] (this.extend (request, this.omit (params, [ 'until' ])));
        //
        //     {
        //         "data": [
        //             { "tdt": 1785309833816, "p": "119900.00", "q": "0.00100000",
        //               "tid": "ad3e8787ab623ba5a1dfea53819be6f9", "oid": "2affb2ac-4cf7-4bbf-b7b2-fc1e885bdc2c",
        //               "s": "buy", "im": false }
        //         ],
        //         "metadata": { "timestamp": 1785313433816, "next_cursor": "..." }
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const result: Trade[] = [];
        for (let i = 0; i < data.length; i++) {
            const trade = this.safeDict (data, i, {});
            result.push (this.parseMyTrade (trade, market));
        }
        return result;
    }

    /**
     * @method
     * @name revolutx#editOrder
     * @description replaces an existing order
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-trading
     * @param {string} id the order id (venue order id) to replace
     * @param {string} symbol unified symbol of the market
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the new amount
     * @param {float} [price] the new price
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a custom client order id (UUID)
     * @param {string} [params.quoteSize] the new order size in quote currency
     * @param {string} [params.timeInForce] e.g. gtc
     * @param {string[]} [params.executionInstructions] e.g. ['post_only']
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        // note: the exchange assigns a new venue_order_id on replace — the returned order carries the new id
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id', this.uuid ());
        const quoteSize = this.safeString2 (params, 'quoteSize', 'quote_size');
        const timeInForce = this.safeStringLower2 (params, 'timeInForce', 'time_in_force');
        const executionInstructions = this.safeList (params, 'executionInstructions', this.safeList (params, 'execution_instructions'));
        const request: Dict = {
            'client_order_id': clientOrderId,
            'venue_order_id': id,
        };
        if (quoteSize !== undefined) {
            request['quote_size'] = quoteSize;
        } else if (amount !== undefined) {
            request['base_size'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (timeInForce !== undefined) {
            request['time_in_force'] = timeInForce;
        }
        if (executionInstructions !== undefined) {
            request['execution_instructions'] = executionInstructions;
        }
        const response = await this['privatePut10OrdersVenueOrderId'] (this.extend (request, this.omit (params, [ 'clientOrderId', 'client_order_id', 'quoteSize', 'quote_size', 'timeInForce', 'time_in_force', 'executionInstructions', 'execution_instructions' ])));
        //
        //     {
        //         "data": [
        //             { "venue_order_id": "7a52e92e-8639-4fe1-abaa-68d3a2d5234b", "client_order_id": "...", "state": "new" }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orderData = Array.isArray (data) ? this.safeDict (data, 0, {}) : this.safeDict (response, 'data', {});
        const newVenueOrderId = this.safeString (orderData, 'venue_order_id');
        const state = this.safeString (orderData, 'state');
        const order = this.parseOrder (this.extend (orderData, {
            'id': newVenueOrderId,
            'symbol': market['id'],
            'status': state,
            'side': side,
            'type': type,
        }), market);
        return order;
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (code === 429) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (code === 401) {
            throw new AuthenticationError (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (code === 403) {
            throw new PermissionDenied (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (code === 404) {
            throw new OrderNotFound (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (code >= 400) {
            if (response === undefined) {
                return undefined;
            }
            const feedback = this.id + ' ' + body;
            let errorMessage: Str = undefined;
            if (typeof response === 'object') {
                errorMessage = this.safeString2 (response, 'message', 'error');
            }
            if (errorMessage !== undefined) {
                this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            }
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
