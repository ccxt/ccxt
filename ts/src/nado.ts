// ---------------------------------------------------------------------------

import Exchange from './abstract/nado.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Currencies, Currency, Dict, Int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class nado
 * @augments Exchange
 */
export default class nado extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'nado',
            'name': 'Nado',
            'countries': [ 'KY' ], // Cayman Islands
            'rateLimit': 25,
            'version': 'v1',
            'precisionMode': TICK_SIZE,
            'certified': false,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'createOrder': false,
                'fetchBalance': false,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPositions': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'withdraw': false,
            },
            'urls': {
                'logo': undefined,
                'api': {
                    'gateway': 'https://gateway.prod.nado.xyz/v1',
                    'gatewayV2': 'https://gateway.prod.nado.xyz/v2',
                    'archive': 'https://archive.prod.nado.xyz/v1',
                    'archiveV2': 'https://archive.prod.nado.xyz/v2',
                    'trigger': 'https://trigger.prod.nado.xyz/v1',
                },
                'test': {
                    'gateway': 'https://gateway.test.nado.xyz/v1',
                    'gatewayV2': 'https://gateway.test.nado.xyz/v2',
                    'archive': 'https://archive.test.nado.xyz/v1',
                    'archiveV2': 'https://archive.test.nado.xyz/v2',
                    'trigger': 'https://trigger.test.nado.xyz/v1',
                },
                'www': 'https://nado.xyz',
                'doc': 'https://docs.nado.xyz/',
            },
            'api': {
                'gateway': {
                    'public': {
                        'get': {
                            'symbols': 2,
                            'query': 1,
                        },
                        'post': {
                            'query': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'execute': 1,
                        },
                    },
                },
                'gatewayV2': {
                    'public': {
                        'get': {
                            'assets': 2,
                            'pairs': 1,
                            'orderbook': 1,
                        },
                    },
                },
                'archive': {
                    'post': {
                        '': 1,
                    },
                },
                'archiveV2': {
                    'public': {
                        'get': {
                            'tickers': 1,
                            'contracts': 1,
                            'trades': 1,
                        },
                    },
                },
                'trigger': {
                    'private': {
                        'post': {
                            'execute': 1,
                            'query': 1,
                        },
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
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
                'defaultType': 'swap',
            },
            'timeframes': {
                '1m': 60,
                '5m': 300,
                '15m': 900,
                '1h': 3600,
                '2h': 7200,
                '4h': 14400,
                '1d': 86400,
                '1w': 604800,
                '4w': 2419200,
            },
            'features': {},
            'exceptions': {
                'exact': {},
                'broad': {},
            },
        });
    }

    /**
     * @method
     * @name nado#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        const request: Dict = {
            'type': 'status',
        };
        const response = await this.gatewayPublicGetQuery (this.extend (request, params));
        //
        //     {
        //         "status": "success",
        //         "data": "active",
        //         "request_type": "query_status"
        //     }
        //
        const status = this.safeString (response, 'data');
        return {
            'status': (status === 'active') ? 'ok' : 'error',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name nado#fetchMarkets
     * @description retrieves data on all markets for nado
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/symbols
     * @see https://docs.nado.xyz/developer-resources/api/v2/pairs
     * @see https://docs.nado.xyz/developer-resources/api/v2/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const symbolsRequest = this.gatewayPublicGetSymbols (params);
        const pairsRequest = this.gatewayV2PublicGetPairs (params);
        const assetsRequest = this.gatewayV2PublicGetAssets (params);
        const responses = await Promise.all ([ symbolsRequest, pairsRequest, assetsRequest ]);
        const symbols = this.safeList (responses, 0, []);
        const pairs = this.safeList (responses, 1, []);
        const assets = this.safeList (responses, 2, []);
        const pairsById = this.indexBy (pairs, 'product_id');
        const assetsById = this.indexBy (assets, 'product_id');
        const markets = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = symbols[i];
            const id = this.safeString (market, 'product_id');
            const pair = this.safeDict (pairsById, id, {});
            const asset = this.safeDict (assetsById, id, {});
            const rawType = this.safeString (market, 'type');
            const type = (rawType === 'perp') ? 'swap' : rawType;
            const contract = (type === 'swap');
            const tickerId = this.safeString2 (pair, 'ticker_id', 'tickerId');
            if (tickerId === undefined) {
                continue;
            }
            const baseId = this.safeString (market, 'symbol');
            const quoteId = this.safeString (pair, 'quote', 'USDT0');
            const settleId = contract ? quoteId : undefined;
            const base = this.safeCurrencyCode (this.removeMarketSuffix (baseId));
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            let symbol = base + '/' + quote;
            if (contract) {
                symbol += ':' + settle;
            }
            const tradingStatus = this.safeString (market, 'trading_status');
            const active = (tradingStatus !== 'not_tradable');
            const priceIncrement = this.parseX18 (this.safeString (market, 'price_increment_x18'));
            const amountIncrement = this.parseX18 (this.safeString (market, 'size_increment'));
            const minCost = this.parseX18 (this.safeString (market, 'min_size'));
            markets.push ({
                'id': id,
                'lowercaseId': undefined,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': (type === 'spot'),
                'margin': undefined,
                'swap': contract,
                'future': false,
                'option': false,
                'active': active,
                'contract': contract,
                'linear': contract ? true : undefined,
                'inverse': contract ? false : undefined,
                'taker': this.parseX18 (this.safeString (market, 'taker_fee_rate_x18')),
                'maker': this.parseX18 (this.safeString (market, 'maker_fee_rate_x18')),
                'contractSize': contract ? 1 : undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': amountIncrement,
                    'price': priceIncrement,
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
                        'min': minCost,
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': this.extend (market, {
                    'ticker_id': tickerId,
                    'name': this.safeString (asset, 'name'),
                    'v2Pair': pair,
                    'v2Asset': asset,
                }),
            });
        }
        return markets;
    }

    /**
     * @method
     * @name nado#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.nado.xyz/developer-resources/api/v2/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.gatewayV2PublicGetAssets (params);
        const currencies = [];
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const marketType = this.safeString (currency, 'market_type');
            const canDeposit = this.safeBool (currency, 'can_deposit', false);
            const canWithdraw = this.safeBool (currency, 'can_withdraw', false);
            if ((marketType === 'perp') && !canDeposit && !canWithdraw) {
                continue;
            }
            currencies.push (currency);
        }
        return this.parseCurrencies (currencies);
    }

    /**
     * @method
     * @name nado#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.nado.xyz/developer-resources/api/v2/tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.archiveV2PublicGetTickers (params);
        //
        //     {
        //         "BTC-PERP_USDT0": {
        //             "product_id": 2,
        //             "ticker_id": "BTC-PERP_USDT0",
        //             "base_currency": "BTC",
        //             "quote_currency": "USDT0",
        //             "last_price": 25728.0,
        //             "base_volume": 552.048,
        //             "quote_volume": 14238632.207250029,
        //             "price_change_percent_24h": -0.6348599635253989
        //         }
        //     }
        //
        const tickers = this.toArray (response);
        return this.parseTickers (tickers, symbols);
    }

    /**
     * @method
     * @name nado#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.nado.xyz/developer-resources/api/v2/tickers
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickers = await this.fetchTickers ([ symbol ], params);
        return this.safeTicker (this.safeDict (tickers, symbol), market);
    }

    /**
     * @method
     * @name nado#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.nado.xyz/developer-resources/api/v2/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickerId = this.safeString (market['info'], 'ticker_id');
        const request: Dict = {
            'ticker_id': tickerId,
            'depth': (limit === undefined) ? 100 : limit,
        };
        const response = await this.gatewayV2PublicGetOrderbook (this.extend (request, params));
        //
        //     {
        //         "product_id": 1,
        //         "ticker_id": "BTC-PERP_USDT0",
        //         "bids": [
        //             [ 116215.0, 0.128 ],
        //             [ 116214.0, 0.172 ]
        //         ],
        //         "asks": [
        //             [ 116225.0, 0.043 ],
        //             [ 116226.0, 0.172 ]
        //         ],
        //         "timestamp": 1757913317944
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, market['symbol'], timestamp);
    }

    /**
     * @method
     * @name nado#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/candlesticks
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
        params = this.omit (params, 'until');
        const request: Dict = {
            'candlesticks': {
                'product_id': this.parseToInt (market['id']),
                'granularity': this.safeInteger (this.timeframes, timeframe, this.parseTimeframe (timeframe)),
            },
        };
        if (limit !== undefined) {
            request['candlesticks']['limit'] = limit;
        }
        if (until !== undefined) {
            request['candlesticks']['max_time'] = this.parseToInt (until / 1000);
        }
        const response = await this.archivePost (this.deepExtend (request, params));
        //
        //     {
        //         "candlesticks": [
        //             {
        //                 "product_id": 1,
        //                 "granularity": 60,
        //                 "submission_idx": "627709",
        //                 "timestamp": "1680118140",
        //                 "open_x18": "27235000000000000000000",
        //                 "high_x18": "27298000000000000000000",
        //                 "low_x18": "27235000000000000000000",
        //                 "close_x18": "27298000000000000000000",
        //                 "volume": "1999999999999999998"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'candlesticks', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "product_id": 1,
        //         "granularity": 60,
        //         "submission_idx": "627709",
        //         "timestamp": "1680118140",
        //         "open_x18": "27235000000000000000000",
        //         "high_x18": "27298000000000000000000",
        //         "low_x18": "27235000000000000000000",
        //         "close_x18": "27298000000000000000000",
        //         "volume": "1999999999999999998"
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'timestamp'),
            this.parseX18 (this.safeString (ohlcv, 'open_x18')),
            this.parseX18 (this.safeString (ohlcv, 'high_x18')),
            this.parseX18 (this.safeString (ohlcv, 'low_x18')),
            this.parseX18 (this.safeString (ohlcv, 'close_x18')),
            this.parseX18 (this.safeString (ohlcv, 'volume')),
        ];
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'product_id');
        market = this.safeMarket (marketId, market);
        const timestamp = undefined;
        const last = this.safeString (ticker, 'last_price');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'price_change_percent_24h'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'base_volume'),
            'quoteVolume': this.safeString (ticker, 'quote_volume'),
            'info': ticker,
        }, market);
    }

    parseCurrency (rawCurrency: Dict): Currency {
        const canDeposit = this.safeBool (rawCurrency, 'can_deposit', false);
        const canWithdraw = this.safeBool (rawCurrency, 'can_withdraw', false);
        const id = this.safeString (rawCurrency, 'product_id');
        const currencyId = this.safeString (rawCurrency, 'symbol');
        const code = this.safeCurrencyCode (this.removeMarketSuffix (currencyId));
        return this.safeCurrencyStructure ({
            'id': id,
            'name': this.safeString (rawCurrency, 'name'),
            'code': code,
            'precision': undefined,
            'active': undefined,
            'fee': undefined,
            'networks': {},
            'deposit': canDeposit,
            'withdraw': canWithdraw,
            'type': 'crypto',
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
            'info': rawCurrency,
        });
    }

    parseX18 (value) {
        if (value === undefined) {
            return undefined;
        }
        return this.parseNumber (Precise.stringDiv (value, '1000000000000000000'));
    }

    removeMarketSuffix (marketId) {
        if (marketId === undefined) {
            return undefined;
        }
        if (marketId.endsWith ('-PERP')) {
            return marketId.slice (0, -5);
        }
        return marketId;
    }

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = api[0];
        if (typeof api === 'string') {
            endpoint = api;
        }
        let url = this.urls['api'][endpoint];
        if (path !== '') {
            url += '/' + this.implodeParams (path, params);
        }
        const query = this.omit (params, this.extractParams (path));
        headers = {};
        if ((endpoint === 'gateway') || (endpoint === 'archive')) {
            headers['Accept-Encoding'] = 'gzip, br, deflate';
        }
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            headers['Content-Type'] = 'application/json';
            body = this.json (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
