
//  ---------------------------------------------------------------------------

import Exchange from './abstract/arkm.js';
import { Precise } from './base/Precise.js';
import { AuthenticationError, ArgumentsRequired, ExchangeError, InsufficientFunds, DDoSProtection, InvalidNonce, PermissionDenied, BadRequest, BadSymbol, NotSupported, AccountNotEnabled, OnMaintenance, InvalidOrder, RequestTimeout, OrderNotFound, RateLimitExceeded } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, Str, Ticker, OrderRequest, Balances, Transaction, OrderBook, Tickers, Strings, Currency, Currencies, Market, Num, Account, CancellationRequest, Dict, int, TradingFeeInterface, TradingFees, LedgerEntry, DepositAddress, Position } from './base/types.js';

/**
 * @class arkm
 * @augments Exchange
 */
export default class arkm extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'arkm',
            'name': 'ARKM',
            'countries': [ 'US' ],
            'version': 'v1',
            'rateLimit': 20 / 3, // 150 req/s
            'certified': false,
            'pro': false,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'sandbox': false,
                'fetchCurrencies': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
                'fetchTime': true,
                //
                'cancelOrder': true,
                'cancelAllOrders': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '6h': '6h',
                '1d': '24h',
            },
            'urls': {
                'logo': '',
                'api': {
                    'v1': 'https://arkm.com/api',
                },
                'www': 'https://arkm.com/',
                'referral': {
                    'url': 'https://arkm.com',
                    'discount': 0,
                },
                'doc': [
                    'https://arkm.com/limits-api',
                    'https://info.arkm.com/api-platform',
                ],
                'fees': 'https://arkm.com/fees',
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'assets': 1,
                            'pairs': 1,
                            'contracts': 1,
                            'book': 1,
                            'ticker': 1,
                            'tickers': 1,
                            'trades': 1,
                            'candles': 1,
                            'server-time': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'orders': 7.5, // spot 20/s, todo: perp 40/s
                            'orders/by-client-order-id': 7.5,
                        },
                        'post': {
                            'orders/cancel': 7.5,
                            'orders/cancel/all': 7.5,
                        },
                    },
                },
            },
            'options': {
                'networks': {
                    'ERC20': 'ETH',
                    'ETH': 'ETH',
                    'BTC': 'BTC',
                    'SOL': 'SOL',
                    'TON': 'TON',
                    'DOGE': 'DOGE',
                    'SUI': 'SUI',
                    'XRP': 'XRP',
                    'OP': 'OP',
                    'AVAXC': 'AVAX',
                    'ARBONE': 'ARB',
                },
                'requestExpiration': 5000, // 5 seconds
            },
            'features': {
                'default': {
                //     'sandbox': true,
                //     'createOrder': {
                //         'marginMode': true,
                //         'triggerPrice': true,
                //         // todo: implementation fix
                //         'triggerPriceType': {
                //             'last': true,
                //             'mark': true,
                //             'index': true,
                //         },
                //         'triggerDirection': false,
                //         'stopLossPrice': true,
                //         'takeProfitPrice': true,
                //         'attachedStopLossTakeProfit': undefined,
                //         'timeInForce': {
                //             'IOC': true,
                //             'FOK': true,
                //             'PO': true,
                //             'GTD': false,
                //         },
                //         'hedged': false,
                //         'selfTradePrevention': true, // todo: implement
                //         'trailing': false,
                //         'iceberg': false,
                //         'leverage': false,
                //         'marketBuyByCost': true,
                //         'marketBuyRequiresPrice': true,
                //     },
                //     'createOrders': {
                //         'max': 10,
                //     },
                //     'fetchMyTrades': {
                //         'marginMode': false,
                //         'limit': 100,
                //         'daysBack': undefined,
                //         'untilDays': 1,
                //         'symbolRequired': false,
                //     },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': true,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                //     'fetchOrders': {
                //         'marginMode': false,
                //         'limit': 100,
                //         'daysBack': undefined,
                //         'untilDays': 1,
                //         'trigger': false,
                //         'trailing': false,
                //         'symbolRequired': false,
                //     },
                //     'fetchClosedOrders': {
                //         'marginMode': false,
                //         'limit': 100,
                //         'daysBack': undefined,
                //         'daysBackCanceled': undefined,
                //         'untilDays': 1,
                //         'trigger': false,
                //         'trailing': false,
                //         'symbolRequired': false,
                //     },
                //     'fetchOHLCV': {
                //         'limit': 365,
                //     },
                },
                // 'spot': {
                //     'extends': 'default',
                // },
                // 'swap': {
                //     'linear': {
                //         'extends': 'default',
                //     },
                //     'inverse': {
                //         'extends': 'default',
                //     },
                // },
                // 'future': {
                //     'linear': {
                //         'extends': 'default',
                //     },
                //     'inverse': {
                //         'extends': 'default',
                //     },
                // },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                },
                'broad': {},
            },
        });
    }

    /**
     * @method
     * @name arkm#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://arkm.com/docs#get/public/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.v1PublicGetAssets (params);
        //
        //    [
        //        {
        //            "symbol": "USDT",
        //            "name": "Tether",
        //            "imageUrl": "https://static.arkhamintelligence.com/tokens/tether.png",
        //            "stablecoin": true,
        //            "featuredPair": "BTC_USDT",
        //            "chains": [
        //                {
        //                    "symbol": "ETH",
        //                    "assetSymbol": "ETH",
        //                    "name": "Ethereum",
        //                    "type": "1",
        //                    "confirmations": "6",
        //                    "blockTime": "12000000"
        //                }
        //            ],
        //            "status": "listed",
        //            "minDeposit": "5",
        //            "minWithdrawal": "5",
        //            "withdrawalFee": "2"
        //        },
        //        ...
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const code = this.safeCurrencyCode (id);
            const networks: Dict = {};
            const chains = this.safeList (currency, 'chains', []);
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'symbol');
                const network = this.networkIdToCode (networkId);
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'title': this.safeString (chain, 'name'),
                    'active': undefined,
                    'deposit': undefined,
                    'withdraw': undefined,
                    'fee': undefined,
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
            }
            result[code] = this.safeCurrencyStructure ({
                'info': currency,
                'id': id,
                'code': code,
                'name': this.safeString (currency, 'name'),
                'active': this.safeString (currency, 'status') === 'listed',
                'deposit': undefined,
                'withdraw': undefined,
                'fee': this.safeNumber (currency, 'withdrawalFee'),
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'minWithdrawal'),
                        'max': undefined,
                    },
                    'deposit': {
                        'min': this.safeNumber (currency, 'minDeposit'),
                        'max': undefined,
                    },
                },
                'type': 'crypto',
                'networks': networks,
            });
        }
        return result;
    }

    /**
     * @method
     * @name arkm#fetchMarkets
     * @see https://arkm.com/docs#get/public/pairs
     * @description retrieves data on all markets for arkm
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.v1PublicGetPairs (params);
        //
        //    [
        //        {
        //            "symbol": "BTC_USDT",
        //            "baseSymbol": "BTC",
        //            "baseImageUrl": "https://static.arkhamintelligence.com/tokens/bitcoin.png",
        //            "baseIsStablecoin": false,
        //            "baseName": "Bitcoin",
        //            "quoteSymbol": "USDT",
        //            "quoteImageUrl": "https://static.arkhamintelligence.com/tokens/tether.png",
        //            "quoteIsStablecoin": true,
        //            "quoteName": "Tether",
        //            "minTickPrice": "0.01",
        //            "minLotSize": "0.00001",
        //            "minSize": "0.00001",
        //            "maxSize": "9000",
        //            "minPrice": "0.01",
        //            "maxPrice": "1000000",
        //            "minNotional": "5",
        //            "maxPriceScalarUp": "1.8",
        //            "maxPriceScalarDown": "0.2",
        //            "pairType": "spot", // atm, always 'spot' value
        //            "maxLeverage": "0",
        //            "status": "listed"
        //        },
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "baseSymbol": "BTC.P",
        //            "baseImageUrl": "https://static.arkhamintelligence.com/tokens/bitcoin.png",
        //            "baseIsStablecoin": false,
        //            "baseName": "Bitcoin Perpetual",
        //            "quoteSymbol": "USDT",
        //            "quoteImageUrl": "https://static.arkhamintelligence.com/tokens/tether.png",
        //            "quoteIsStablecoin": true,
        //            "quoteName": "Tether",
        //            "minTickPrice": "0.01",
        //            "minLotSize": "0.00001",
        //            "minSize": "0.00001",
        //            "maxSize": "9000",
        //            "minPrice": "0.01",
        //            "maxPrice": "1000000",
        //            "minNotional": "5",
        //            "maxPriceScalarUp": "1.5",
        //            "maxPriceScalarDown": "0.5",
        //            "pairType": "perpetual",
        //            "marginSchedule": "C",
        //            "maxLeverage": "25",
        //            "status": "listed"
        //        },
        //        ...
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseSymbol');
            const quoteId = this.safeString (market, 'quoteSymbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let marketType: Str = undefined;
            let symbol: Str = undefined;
            const pairType = this.safeString (market, 'pairType');
            const isSpot = pairType === 'spot';
            const isPerpetual = pairType === 'perpetual';
            if (isSpot) {
                marketType = 'spot';
                symbol = base + '/' + quote;
            } else if (isPerpetual) {
                marketType = 'swap';
                const baseCorrected = baseId.replace ('.P', '');
                symbol = baseCorrected + '/' + quote + ':' + quote;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': marketType,
                'spot': isSpot,
                'margin': undefined,
                'swap': isPerpetual,
                'future': false,
                'option': false,
                'active': this.safeString (market, 'status') === 'listed',
                'contract': isPerpetual,
                'linear': isPerpetual,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'price': this.safeNumber (market, 'minTickPrice'),
                    'amount': this.safeNumber (market, 'minLotSize'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minSize'),
                        'max': this.safeNumber (market, 'maxSize'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'minPrice'),
                        'max': this.safeNumber (market, 'maxPrice'),
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minNotional'),
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
     * @name arkm#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://arkm.com/docs#get/public/server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}) {
        const response = await this.v1PublicGetServerTime (params);
        //
        //    {
        //        "serverTime": "1753465832770820"
        //    }
        //
        return this.safeIntegerProduct (response, 'serverTime', 0.001);
    }

    /**
     * @method
     * @name arkm#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://arkm.com/docs#get/public/book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the number of order book entries to return, max 50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PublicGetBook (this.extend (request, params));
        //
        //    {
        //        "symbol": "BTC_USDT",
        //        "group": "0.01",
        //        "asks": [
        //            {
        //                "price": "122900.43",
        //                "size": "0.0243"
        //            },
        //            {
        //                "price": "121885.53",
        //                "size": "0.00116"
        //            },
        //            ...
        //        ],
        //        "bids": [
        //            {
        //                "price": "20400",
        //                "size": "0.00316"
        //            },
        //            {
        //                "price": "30000",
        //                "size": "0.00116"
        //            },
        //            ...
        //        ],
        //        "lastTime": "1753419275604353"
        //    }
        //
        const timestamp = this.safeIntegerProduct (response, 'lastTime', 0.001);
        const marketId = this.safeString (response, 'symbol');
        return this.parseOrderBook (response, this.safeSymbol (marketId, market), timestamp, 'bids', 'asks', 'price', 'size');
    }

    /**
     * @method
     * @name arkm#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://arkm.com/docs#get/public/candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        const maxLimit = 365;
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, maxLimit) as OHLCV[];
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'duration': this.safeString (this.timeframes, timeframe, timeframe),
        };
        const durationMs = this.parseTimeframe (timeframe) * 1000;
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, [ 'until' ]);
        const selectedLimit = (limit !== undefined) ? Math.min (limit, maxLimit) : maxLimit;
        if (since !== undefined) {
            request['start'] = since;
            request['end'] = since + selectedLimit * durationMs;
        } else {
            const now = this.milliseconds ();
            request['end'] = (until !== undefined) ? until : now;
            request['start'] = request['end'] - selectedLimit * durationMs;
        }
        // exchange needs macroseconds
        request['start'] = request['start'] * 1000;
        request['end'] = request['end'] * 1000;
        const response = await this.v1PublicGetCandles (this.extend (request, params));
        //
        //    [
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "time": "1753464720000000",
        //            "duration": "60000000",
        //            "open": "116051.35",
        //            "high": "116060.27",
        //            "low": "116051.35",
        //            "close": "116060.27",
        //            "volume": "0.0257",
        //            "quoteVolume": "2982.6724054"
        //        },
        //        ...
        //    ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "time": "1753464720000000",
        //            "duration": "60000000",
        //            "open": "116051.35",
        //            "high": "116060.27",
        //            "low": "116051.35",
        //            "close": "116060.27",
        //            "volume": "0.0257",
        //            "quoteVolume": "2982.6724054"
        //        }
        //
        return [
            this.safeIntegerProduct (ohlcv, 'time', 0.001),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        const response = await this.v1PublicGetTickers (params);
        //
        //    [
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "baseSymbol": "BTC.P",
        //            "quoteSymbol": "USDT",
        //            "indexCurrency": "USDT",
        //            "price": "118806.89",
        //            "price24hAgo": "118212.29",
        //            "high24h": "119468.05",
        //            "low24h": "117104.44",
        //            "volume24h": "180.99438",
        //            "quoteVolume24h": "21430157.5928827",
        //            "markPrice": "118814.71",
        //            "indexPrice": "118804.222610343",
        //            "fundingRate": "0.000007",
        //            "nextFundingRate": "0.000006",
        //            "nextFundingTime": "1753390800000000",
        //            "productType": "perpetual",
        //            "openInterest": "2.55847",
        //            "usdVolume24h": "21430157.5928827",
        //            "openInterestUSD": "303963.8638583"
        //        },
        //        ...
        //
        return this.parseTickers (response, symbols);
    }

    /**
     * @method
     * @name arkm#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.v1PublicGetTicker (this.extend (request, params));
        //
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "baseSymbol": "BTC.P",
        //            "quoteSymbol": "USDT",
        //            "indexCurrency": "USDT",
        //            "price": "118806.89",
        //            "price24hAgo": "118212.29",
        //            "high24h": "119468.05",
        //            "low24h": "117104.44",
        //            "volume24h": "180.99438",
        //            "quoteVolume24h": "21430157.5928827",
        //            "markPrice": "118814.71",
        //            "indexPrice": "118804.222610343",
        //            "fundingRate": "0.000007",
        //            "nextFundingRate": "0.000006",
        //            "nextFundingTime": "1753390800000000",
        //            "productType": "perpetual",
        //            "openInterest": "2.55847",
        //            "usdVolume24h": "21430157.5928827",
        //            "openInterestUSD": "303963.8638583"
        //        }
        //
        return this.parseTicker (response, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        return this.safeTicker ({
            'info': ticker,
            'symbol': this.safeSymbol (marketId, market),
            'high': this.safeNumber (ticker, 'high24h'),
            'low': this.safeNumber (ticker, 'low24h'),
            'bid': this.safeNumber (ticker, 'bid'),
            'last': this.safeNumber (ticker, 'price'),
            'open': this.safeNumber (ticker, 'price24hAgo'),
            'change': this.safeNumber (ticker, 'priceChange'),
            'percentage': this.safeNumber (ticker, 'priceChangePercent'),
            'baseVolume': this.safeNumber (ticker, 'volume24h'),
            'quoteVolume': this.safeNumber (ticker, 'usdVolume24h'),
            'markPrice': this.safeNumber (ticker, 'markPrice'),
            'indexPrice': this.safeNumber (ticker, 'indexPrice'),
            'vwap': undefined,
            'average': undefined,
            'previousClose': undefined,
            'askVolume': undefined,
            'bidVolume': undefined,
        });
    }

    /**
     * @method
     * @name arkm#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://arkm.com/docs#get/public/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @param {string} [params.method] method, default: marketPublicGetV1beta3CryptoLocTrades
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const request: Dict = {
            'symbol': marketId,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PublicGetTrades (this.extend (request, params));
        //
        //    [
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "revisionId": "1130514101",
        //            "size": "0.01668",
        //            "price": "116309.57",
        //            "takerSide": "sell",
        //            "time": "1753439710374047"
        //        },
        //        ...
        //    ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "revisionId": "1130514101",
        //            "size": "0.01668",
        //            "price": "116309.57",
        //            "takerSide": "sell",
        //            "time": "1753439710374047"
        //        }
        //
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeIntegerProduct (trade, 'time', 0.001);
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'revisionId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': this.safeString (trade, 'takerSide'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'size'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name arkmm#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://arkm.com/docs#get/orders/by-client-order-id
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const clientOrderId = this.safeString (params, 'clientOrderId');
        params = this.omit (params, 'clientOrderId' );
        if (clientOrderId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a clientOrderId string for order instead of "id"');
        }
        const request: Dict = {
            'id': clientOrderId,
        };
        const response = await this.v1PrivateGetOrdersOrder (this.extend (request, params));
        //
        //    {
        //        "orderId": "3690478767430",
        //        "userId": "2959123",
        //        "subaccountId": "0",
        //        "symbol": "SOL_USDT",
        //        "time": "1753696843913970",
        //        "side": "sell",
        //        "type": "limitGtc",
        //        "size": "0.066",
        //        "price": "293.2",
        //        "postOnly": false,
        //        "reduceOnly": false,
        //        "executedSize": "0",
        //        "status": "booked",
        //        "avgPrice": "0",
        //        "executedNotional": "0",
        //        "creditFeePaid": "0",
        //        "marginBonusFeePaid": "0",
        //        "quoteFeePaid": "0",
        //        "arkmFeePaid": "0",
        //        "revisionId": "887956326",
        //        "lastTime": "1753696843914830",
        //        "clientOrderId": "",
        //        "lastSize": "0",
        //        "lastPrice": "0",
        //        "lastCreditFee": "0",
        //        "lastMarginBonusFee": "0",
        //        "lastQuoteFee": "0",
        //        "lastArkmFee": "0"
        //    }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data);
    }

    /**
     * @method
     * @name arkm#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://arkm.com/docs#get/orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.v1PrivateGetOrders (this.extend ({}, params));
        //
        // [
        //    {
        //        "orderId": "3690478767430",
        //        "userId": "2959123",
        //        "subaccountId": "0",
        //        "symbol": "SOL_USDT",
        //        "time": "1753696843913970",
        //        "side": "sell",
        //        "type": "limitGtc",
        //        "size": "0.066",
        //        "price": "293.2",
        //        "postOnly": false,
        //        "reduceOnly": false,
        //        "executedSize": "0",
        //        "status": "booked",
        //        "avgPrice": "0",
        //        "executedNotional": "0",
        //        "creditFeePaid": "0",
        //        "marginBonusFeePaid": "0",
        //        "quoteFeePaid": "0",
        //        "arkmFeePaid": "0",
        //        "revisionId": "887956326",
        //        "lastTime": "1753696843914830",
        //        "clientOrderId": "",
        //        "lastSize": "0",
        //        "lastPrice": "0",
        //        "lastCreditFee": "0",
        //        "lastMarginBonusFee": "0",
        //        "lastQuoteFee": "0",
        //        "lastArkmFee": "0"
        //    }
        // ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name arkm#cancelOrder
     * @description cancels an open order
     * @see https://arkm.com/docs#post/orders/cancel
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        const request: Dict = {};
        const clientOrderId = this.safeInteger (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            params = this.omit (params, 'clientOrderId');
            request['clientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = parseInt (id);
        }
        const response = await this.v1PrivatePostOrdersCancel (this.extend (request, params));
        //
        // {"orderId":3691703758327}
        //
        return this.parseOrder (response);
    }

    /**
     * @method
     * @name arkm#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://arkm.com/docs#post/orders/cancel/all
     * @param {string} symbol cancel alls open orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        if (symbol !== undefined) {
            throw new BadRequest (this.id + ' cancelAllOrders() does not support a symbol argument, use cancelOrder() or fetchOpenOrders() instead');
        }
        const response = await this.v1PrivatePostOrdersCancelAll (params);
        //
        // []  returns an empty array, even when successfully cancels orders
        //
        return this.parseOrders (response, undefined);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // fetchOrder, fetchOrders
        //
        //    {
        //        "orderId": "3690478767430",
        //        "userId": "2959123",
        //        "subaccountId": "0",
        //        "symbol": "SOL_USDT",
        //        "time": "1753696843913970",
        //        "side": "sell",
        //        "type": "limitGtc",
        //        "size": "0.066",
        //        "price": "293.2",
        //        "postOnly": false,
        //        "reduceOnly": false,
        //        "executedSize": "0",
        //        "status": "booked",
        //        "avgPrice": "0",
        //        "executedNotional": "0",
        //        "creditFeePaid": "0",
        //        "marginBonusFeePaid": "0",
        //        "quoteFeePaid": "0",
        //        "arkmFeePaid": "0",
        //        "revisionId": "887956326",
        //        "lastTime": "1753696843914830",
        //        "clientOrderId": "",
        //        "lastSize": "0",
        //        "lastPrice": "0",
        //        "lastCreditFee": "0",
        //        "lastMarginBonusFee": "0",
        //        "lastQuoteFee": "0",
        //        "lastArkmFee": "0"
        //    }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const isPostOnly = this.safeBool (order, 'postOnly');
        const typeRaw = this.safeString (order, 'type');
        const orderType = isPostOnly ? 'limit' : this.parseOrderType (typeRaw);
        const timeInForce = isPostOnly ? 'PO' : this.parseTimeInForce (typeRaw);
        const feeValue = this.safeString (order, 'commission');
        let fee = undefined;
        if (feeValue !== undefined) {
            fee = {
                'cost': feeValue,
                'currency': 'USD',
            };
        }
        const timestamp = this.safeIntegerProduct (order, 'time', 0.001);
        return this.safeOrder ({
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimeStamp': undefined,
            'lastUpdateTimestamp': this.safeIntegerProduct (order, 'lastTime', 0.001),
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'symbol': market['symbol'],
            'type': orderType,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': this.safeString (order, 'side'),
            'price': this.safeNumber (order, 'price'),
            'triggerPrice': undefined,
            'cost': this.safeNumber (order, 'executedNotional'),
            'average': this.safeNumber (order, 'avgPrice'),
            'amount': this.safeNumber (order, 'size'),
            'filled': this.safeNumber (order, ''),
            'remaining': undefined,
            'trades': undefined,
            'fee': fee,
            'reduceOnly': this.safeBool (order, 'reduceOnly'),
            'info': order,
        }, market);
    }

    parseOrderType (type: Str): Str {
        const types: Dict = {
            'limitGtc': 'limit',
            'limitIoc': 'limit',
            'limitFok': 'limit',
            'market': 'market',
        };
        return this.safeStringUpper (types, type, type);
    }

    parseTimeInForce (type: Str): Str {
        const types: Dict = {
            'limitGtc': 'GTC',
            'limitIoc': 'IOC',
            'limitFok': 'FOK',
            'market': 'IOC',
        };
        return this.safeStringUpper (types, type, type);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'new': 'pending',
            'booked': 'open',
            'taker': 'closed',
            'maker': 'closed',
            'cancelled': 'canceled',
            'closed': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const type = this.safeString (api, 0);
        const access = this.safeString (api, 1);
        const accessPart = (access === 'public') ? access + '/' : '';
        let url = this.urls['api'][type] + '/' + accessPart + path;
        const query = this.omit (params, this.extractParams (path));
        if (access === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const expires = (this.milliseconds () + this.safeInteger (this.options, 'requestExpiration', 5000)) * 1000; // need macroseconds
            if (method === 'POST') {
                body = this.json (params);
            }
            const bodyStr = body !== undefined ? body : '';
            const payload = this.apiKey + expires.toString () + method.toUpperCase () + '/' + path + bodyStr;
            const decodedSecret = this.base64ToBinary (this.secret);
            const signature = this.hmac (this.encode (payload), decodedSecret, sha256, 'base64');
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Arkham-Api-Key': this.apiKey,
                'Arkham-Expires': expires,
                'Arkham-Signature': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        // response examples:
        //   {message: 'Not Found'}
        const message = this.safeString (response, 'message');
        if (message !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            throw new ExchangeError (this.id + ' ' + body);
        }
        return undefined;
    }
}
