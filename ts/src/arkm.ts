
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
                'fetchCurrencies': false,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
                'fetchTime': true,
                //
                'fetchOrders': true,
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
                        },
                        'post': {
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
                // 'default': {
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
                //     'fetchOrder': {
                //         'marginMode': false,
                //         'trigger': false,
                //         'trailing': false,
                //         'symbolRequired': false,
                //     },
                //     'fetchOpenOrders': {
                //         'marginMode': true,
                //         'limit': 100,
                //         'trigger': false,
                //         'trailing': false,
                //         'symbolRequired': false,
                //     },
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
                // },
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
        return [];
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
     * @name arkm#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://arkm.com/docs#get/orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const response = await this.v1PrivateGetOrders (this.extend ({}, params));
        //
        //     [
        //         {
        //           "id": "cbaf12d7-69b8-49c0-a31b-b46af35c755c",
        //           "client_order_id": "ccxt_b36156ae6fd44d098ac9c179bab33efd",
        //           "created_at": "2023-11-17T04:21:42.234579Z",
        //           "updated_at": "2023-11-17T04:22:34.442765Z",
        //           "submitted_at": "2023-11-17T04:21:42.233357Z",
        //           "filled_at": null,
        //           "expired_at": null,
        //           "canceled_at": "2023-11-17T04:22:34.399019Z",
        //           "failed_at": null,
        //           "replaced_at": null,
        //           "replaced_by": null,
        //           "replaces": null,
        //           "asset_id": "77c6f47f-0939-4b23-b41e-47b4469c4bc8",
        //           "symbol": "LTC/USDT",
        //           "asset_class": "crypto",
        //           "notional": null,
        //           "qty": "0.001",
        //           "filled_qty": "0",
        //           "filled_avg_price": null,
        //           "order_class": "",
        //           "order_type": "limit",
        //           "type": "limit",
        //           "side": "sell",
        //           "time_in_force": "gtc",
        //           "limit_price": "1000",
        //           "stop_price": null,
        //           "status": "canceled",
        //           "extended_hours": false,
        //           "legs": null,
        //           "trail_percent": null,
        //           "trail_price": null,
        //           "hwm": null,
        //           "subtag": null,
        //           "source": "access_key"
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
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
            // const nonce = this.nonce ().toString ();
            // const requestParams = this.extend ({}, params);
            // const paramsKeys = Object.keys (requestParams);
            // const strSortKey = this.paramsToString (requestParams, 0);
            // const payload = path + nonce + this.apiKey + strSortKey + nonce;
            // const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256);
            // body = this.json ({
            //     'id': nonce,
            //     'method': path,
            //     'params': params,
            //     'api_key': this.apiKey,
            //     'sig': signature,
            //     'nonce': nonce,
            // });
            // headers = {
            //     'Content-Type': 'application/json',
            // };
            const expires = (this.milliseconds () + this.safeInteger (this.options, 'requestExpiration', 5000)) * 1000; // need macroseconds
            const requestData = {
                'API_KEY': this.apiKey,
                'API_SECRET': this.secret,
                'BASE_URL': 'https://arkm.com/api',
                'METHOD': method,
                'REQUEST_PATH': '/' + path,
                'BODY': '',
            };
            const payload1 = this.apiKey + expires.toString () + method.toUpperCase () + '/' + path;
            const payload = this.stringToBase64 (payload1);
            const secretDecoded = this.decode (this.secret);
            const hmac = this.hmac (this.encode (payload1), this.encode (this.secret), sha256, 'base64');
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Arkham-Api-Key': this.apiKey,
                'Arkham-Expires': expires,
                'Arkham-Signature': this.stringToBase64 (hmac),
            };
            // if (method === 'GET') {
            //     if (Object.keys (params).length) {
            //         url += '?' + this.urlencode (params);
            //     }
            // } else {
            //     headers['Content-Type'] = 'application/json';
            //     body = this.json (params);
            // }
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
