//  ---------------------------------------------------------------------------

import Exchange from './abstract/etoro.js';
import { ExchangeError, ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, InvalidOrder, OrderNotFound, PermissionDenied, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Balances, Dict, Int, Market, NullableDict, Num, OHLCV, Order, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class etoro
 * @augments Exchange
 */
export default class etoro extends Exchange {
    override describe (): Dict {
        return this.deepExtend (super.describe (), {
            'id': 'etoro',
            'name': 'eToro',
            'countries': [ 'CY', 'GB', 'US' ],
            // market data: 120 requests / 60 s, portfolio and order info: 60 / 60 s, execution: 20 / 60 s (per user key)
            'rateLimit': 500,
            'version': 'v1',
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'closePosition': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': 'OneMinute',
                '5m': 'FiveMinutes',
                '10m': 'TenMinutes',
                '15m': 'FifteenMinutes',
                '30m': 'ThirtyMinutes',
                '1h': 'OneHour',
                '4h': 'FourHours',
                '1d': 'OneDay',
                '1w': 'OneWeek',
            },
            'urls': {
                'logo': 'https://etoro-cdn.etorostatic.com/web-client/img/etoro-logo.svg',
                // demo vs real is selected by the request path, not the host
                'api': {
                    'public': 'https://public-api.etoro.com',
                    'private': 'https://public-api.etoro.com',
                },
                'test': {
                    'public': 'https://public-api.etoro.com',
                    'private': 'https://public-api.etoro.com',
                },
                'www': 'https://www.etoro.com',
                'doc': [
                    'https://api-portal.etoro.com',
                ],
                'fees': 'https://www.etoro.com/trading/fees/',
            },
            'api': {
                'public': {
                    'get': {
                        'api/v1/market-data/search': 1,
                        'api/v1/market-data/instruments': 1,
                        'api/v2/market-data/instruments': 1,
                        'api/v1/market-data/instruments/rates': 1,
                        'api/v2/market-data/rates': 1,
                        'api/v1/market-data/instruments/{instrumentId}/history/candles/{direction}/{interval}/{candlesCount}': 1,
                        'api/v1/market-data/instrument-types': 1,
                        'api/v1/market-data/exchanges': 1,
                    },
                },
                'private': {
                    'get': {
                        'api/v1/trading/info/real/pnl': 2,
                        'api/v1/trading/info/demo/pnl': 2,
                        'api/v1/trading/info/portfolio': 2,
                        'api/v1/trading/info/demo/portfolio': 2,
                        'api/v2/trading/info/orders:lookup': 2,
                        'api/v2/trading/info/demo/orders:lookup': 2,
                        'api/v1/trading/info/real/close-orders/{orderId}': 2,
                        'api/v1/trading/info/demo/close-orders/{orderId}': 2,
                        'api/v1/trading/info/trade/history': 2,
                        'api/v1/trading/info/trade/demo/history': 2,
                    },
                    'post': {
                        'api/v2/trading/info/eligibility': 6,
                        'api/v2/trading/info/demo/eligibility': 6,
                        'api/v2/trading/execution/orders': 6,
                        'api/v2/trading/execution/demo/orders': 6,
                        'api/v1/trading/execution/market-close-orders/positions/{positionId}': 6,
                        'api/v1/trading/execution/demo/market-close-orders/positions/{positionId}': 6,
                    },
                    'delete': {
                        'api/v2/trading/execution/orders/{orderId}': 6,
                        'api/v2/trading/execution/demo/orders/{orderId}': 6,
                        'api/v1/trading/execution/market-close-orders/{orderId}': 6,
                        'api/v1/trading/execution/demo/market-close-orders/{orderId}': 6,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true, // x-api-key, the public api key
                'secret': true, // x-user-key, the user key
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.01'),
                    'taker': this.parseNumber ('0.01'),
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'sandboxMode': false,
                'spotExchangeId': '8', // exchangeId of eToro's crypto spot instruments, futures are listed under another id
            },
            'features': {
                'spot': {
                    'sandbox': true,
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
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': 364,
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
                        'limit': 1000,
                    },
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'exceptions': {
                'exact': {
                    'Unauthorized': AuthenticationError,
                    'InvalidKey': AuthenticationError,
                    'Forbidden': PermissionDenied,
                    'TooManyRequests': RateLimitExceeded,
                    'RequestIdRequired': BadRequest,
                    'RouteNotFound': BadRequest,
                },
                'broad': {
                    'Instrument not found': BadSymbol,
                    'Insufficient': InvalidOrder,
                    'Order category for': OrderNotFound,
                },
            },
        });
    }

    override setSandboxMode (enable: boolean) {
        super.setSandboxMode (enable);
        this.options['sandboxMode'] = enable;
    }

    /**
     * @method
     * @name etoro#fetchMarkets
     * @description retrieves data on all crypto spot markets for etoro
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-display-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        let instruments = [];
        let pageToken: Str = undefined;
        while (true) {
            const request: Dict = {
                'type': 'Crypto',
                'pageSize': 1000,
            };
            if (pageToken !== undefined) {
                request['pageToken'] = pageToken;
            }
            const response = await this.publicGetApiV2MarketDataInstruments (this.extend (request, params));
            //
            //     {
            //         "results": [
            //             {
            //                 "instrumentId": 100000,
            //                 "displayName": "Bitcoin",
            //                 "type": "Crypto",
            //                 "symbol": "BTC",
            //                 "exchangeId": 8,
            //                 "image": { "uri": "https://etoro-cdn.etorostatic.com/market-avatars/100000/100000_F0AF32_F7F7F7.svg", "backgroundColor": "#F0AF32" }
            //             }
            //         ],
            //         "pagination": { "pageSize": 1000, "nextPageToken": "NzA5", "hasNext": false }
            //     }
            //
            const results = this.safeList (response, 'results', []);
            instruments = this.arrayConcat (instruments, results);
            const pagination = this.safeDict (response, 'pagination', {});
            const hasNext = this.safeBool (pagination, 'hasNext', false);
            pageToken = this.safeString (pagination, 'nextPageToken');
            if (!hasNext || (pageToken === undefined)) {
                break;
            }
        }
        const spotExchangeId = this.safeString (this.options, 'spotExchangeId', '8');
        const result = [];
        for (let i = 0; i < instruments.length; i++) {
            const instrument = instruments[i];
            const exchangeId = this.safeString (instrument, 'exchangeId');
            const baseId = this.safeString (instrument, 'symbol');
            // skip futures and the dotted legacy / wrapped / placeholder listings like GRAM.OLD, USDC.SOL, Drm.Crypto100688
            if ((exchangeId !== spotExchangeId) || (baseId === undefined) || (baseId.indexOf ('.') >= 0)) {
                continue;
            }
            result.push (this.parseMarket (instrument));
        }
        return result;
    }

    override parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'instrumentId');
        const baseId = this.safeString (market, 'symbol');
        const quoteId = 'USD';
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return this.safeMarketStructure ({
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
            'active': undefined,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'taker': this.safeNumber (this.fees['trading'], 'taker'),
            'maker': this.safeNumber (this.fees['trading'], 'maker'),
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': undefined,
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
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name etoro#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-market-rates
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instrumentIds': market['id'],
        };
        const response = await this.publicGetApiV1MarketDataInstrumentsRates (this.extend (request, params));
        const rates = this.safeList (response, 'rates', []);
        const ticker = this.safeDict (rates, 0, {});
        return this.parseTicker (ticker, market);
    }

    /**
     * @method
     * @name etoro#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-market-rates
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const symbolsResolved = this.marketSymbols (symbols);
        const symbolsList: string[] = (symbolsResolved === undefined) ? this.symbols : symbolsResolved;
        const ids = [];
        for (let i = 0; i < symbolsList.length; i++) {
            const market = this.market (symbolsList[i]);
            ids.push (market['id']);
        }
        // the endpoint accepts at most 100 instrument ids per request
        const chunks = [];
        let currentChunk = [];
        for (let i = 0; i < ids.length; i++) {
            currentChunk.push (ids[i]);
            const currentLength = currentChunk.length;
            if (currentLength === 100) {
                chunks.push (currentChunk);
                currentChunk = [];
            }
        }
        const lastLength = currentChunk.length;
        if (lastLength > 0) {
            chunks.push (currentChunk);
        }
        let rates = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const request: Dict = {
                'instrumentIds': chunk.join (','),
            };
            const response = await this.publicGetApiV1MarketDataInstrumentsRates (this.extend (request, params));
            rates = this.arrayConcat (rates, this.safeList (response, 'rates', []));
        }
        return this.parseTickers (rates, symbolsResolved);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "instrumentID": 100000,
        //         "ask": 64224.41,
        //         "bid": 64224.4,
        //         "lastExecution": 64224.4,
        //         "conversionRateAsk": 1,
        //         "conversionRateBid": 1,
        //         "date": "2026-11-18T10:46:51.1277742Z",
        //         "unitMargin": 64224.4,
        //         "priceRateID": 165085192158,
        //         ...
        //     }
        //
        // watchTicker (content of an instrument:<id> message, the instrument id comes from the topic)
        //
        //     {
        //         "Ask": "84917.73",
        //         "Bid": "83232.21",
        //         "LastExecution": "84072.94",
        //         "Date": "2025-04-01T08:36:02.8305456Z",
        //         "PriceRateID": "106439224591"
        //     }
        //
        const marketId = this.safeString2 (ticker, 'instrumentID', 'InstrumentID');
        const resolvedMarket = this.safeMarket (marketId, market);
        const timestamp = this.parse8601 (this.safeString2 (ticker, 'date', 'Date'));
        const last = this.safeString2 (ticker, 'lastExecution', 'LastExecution');
        return this.safeTicker ({
            'symbol': resolvedMarket['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString2 (ticker, 'bid', 'Bid'),
            'bidVolume': undefined,
            'ask': this.safeString2 (ticker, 'ask', 'Ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name etoro#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price of a market, the endpoint only returns the most recent candles
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-candle-history
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch, used only to filter the most recent candles
     * @param {int} [limit] the maximum amount of candles to fetch, default 100, max 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let candlesCount = 100;
        if (since !== undefined) {
            candlesCount = 1000;
        } else if (limit !== undefined) {
            candlesCount = Math.min (limit, 1000);
        }
        const request: Dict = {
            'instrumentId': market['id'],
            'direction': 'asc',
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
            'candlesCount': candlesCount,
        };
        const response = await this.publicGetApiV1MarketDataInstrumentsInstrumentIdHistoryCandlesDirectionIntervalCandlesCount (this.extend (request, params));
        //
        //     {
        //         "interval": "OneDay",
        //         "candles": [
        //             {
        //                 "instrumentId": 100000,
        //                 "candles": [
        //                     { "instrumentID": 100000, "fromDate": "2026-11-17T00:00:00Z", "open": 65241.03, "high": 65472.04, "low": 63258.88, "close": 64285.54, "volume": null }
        //                 ],
        //                 "rangeOpen": 65241.03,
        //                 "rangeClose": 64294.62,
        //                 "rangeHigh": 65472.04,
        //                 "rangeLow": 63258.88,
        //                 "volume": 0
        //             }
        //         ]
        //     }
        //
        const instruments = this.safeList (response, 'candles', []);
        const first = this.safeDict (instruments, 0, {});
        const candles = this.safeList (first, 'candles', []);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        //
        //     { "instrumentID": 100000, "fromDate": "2026-11-17T00:00:00Z", "open": 65241.03, "high": 65472.04, "low": 63258.88, "close": 64285.54, "volume": null }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'fromDate')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchPortfolio (params = {}): Promise<Dict> {
        let response = undefined;
        if (this.safeBool (this.options, 'sandboxMode', false)) {
            response = await this.privateGetApiV1TradingInfoDemoPnl (params);
        } else {
            response = await this.privateGetApiV1TradingInfoRealPnl (params);
        }
        return this.safeDict (response, 'clientPortfolio', {});
    }

    /**
     * @method
     * @name etoro#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders, crypto balances are the units of the open real (non-cfd, unleveraged) long positions
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-account-pnl-and-portfolio-details
     * @see https://api-portal.etoro.com/api-reference/trading--demo/get-account-pnl-and-portfolio-details
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    override async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const portfolio = await this.fetchPortfolio (params);
        return this.parseBalance (portfolio);
    }

    override parseBalance (portfolio: Dict): Balances {
        //
        //     {
        //         "positions": [
        //             {
        //                 "positionID": 3644959955,
        //                 "instrumentID": 100000,
        //                 "isBuy": true,
        //                 "amount": 39.94,
        //                 "leverage": 1,
        //                 "units": 0.000627,
        //                 "settlementTypeID": 1,
        //                 "mirrorID": 0,
        //                 ...
        //             }
        //         ],
        //         "unrealizedPnL": 0.49,
        //         "mirrors": [],
        //         "accountCurrencyId": 1,
        //         "credit": 99907.32,
        //         "orders": [],
        //         "ordersForOpen": [],
        //         ...
        //     }
        //
        const result: Dict = {
            'info': portfolio,
        };
        // available cash = credit - pending market orders (not opened by a copy-trading mirror) - pending limit orders
        let used: Str = '0';
        const ordersForOpen = this.safeList (portfolio, 'ordersForOpen', []);
        for (let i = 0; i < ordersForOpen.length; i++) {
            const order = ordersForOpen[i];
            const mirrorId = this.safeString2 (order, 'mirrorID', 'mirrorId', '0');
            if (mirrorId === '0') {
                used = Precise.stringAdd (used, this.safeString (order, 'amount', '0'));
            }
        }
        const orders = this.safeList (portfolio, 'orders', []);
        for (let i = 0; i < orders.length; i++) {
            used = Precise.stringAdd (used, this.safeString (orders[i], 'amount', '0'));
        }
        const credit = this.safeString (portfolio, 'credit');
        const usd = this.account ();
        usd['free'] = Precise.stringSub (credit, used);
        usd['used'] = used;
        result['USD'] = usd;
        const positions = this.safeList (portfolio, 'positions', []);
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const instrumentId = this.safeString2 (position, 'instrumentID', 'instrumentId');
            const settlementType = this.safeString2 (position, 'settlementTypeID', 'settlementTypeId');
            const isBuy = this.safeBool (position, 'isBuy');
            // only real (owned) long positions on known spot markets are holdings, cfd and stock positions are skipped
            const knownMarkets = this.safeList (this.markets_by_id, instrumentId);
            if ((settlementType !== '1') || !isBuy || (knownMarkets === undefined)) {
                continue;
            }
            const market = this.safeMarket (instrumentId);
            const code = market['base'];
            const account = this.safeDict (result, code, this.account ());
            const units = this.safeString (position, 'units', '0');
            account['total'] = Precise.stringAdd (this.safeString (account, 'total', '0'), units);
            account['free'] = account['total'];
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name etoro#createOrder
     * @description create a trade order, a buy opens a new real position, a sell closes (part of) an open position
     * @see https://api-portal.etoro.com/api-reference/trading--real/create-an-order
     * @see https://api-portal.etoro.com/api-reference/trading--real/close-position-by-units
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit', a limit buy is placed as a market-if-touched order unless timeInForce is IOC, sells must be market orders
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the base currency you want to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] *buy only* the quote amount in USD to spend instead of the base amount
     * @param {string} [params.timeInForce] 'IOC' to place a limit buy as an immediate-or-cancel limit order
     * @param {string} [params.positionId] *sell only* the id of the position to sell from, without it the account must hold exactly one position in the market and selling all its units closes it, with it exactly the amount is deducted (use closePosition () to sell all the units)
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const sandboxMode = this.safeBool (this.options, 'sandboxMode', false);
        if (side === 'sell') {
            // a sell closes (part of) an open position
            if (type !== 'market') {
                throw new InvalidOrder (this.id + ' createOrder() supports market sell orders only, a sell closes (part of) an open position');
            }
            let positionId = this.safeString (params, 'positionId');
            const closeParams = this.omit (params, 'positionId');
            let unitsToDeduct: Str = this.numberToString (amount);
            if (positionId === undefined) {
                const position = await this.findSpotPosition (symbol, 'createOrder');
                positionId = this.safeString2 (position, 'positionID', 'positionId');
                const positionUnits = this.safeString (position, 'units');
                // deducting all the units is rejected (the remaining position would be worth less than 1 USD), a full close sends no units
                if ((positionUnits !== undefined) && Precise.stringGe (unitsToDeduct, positionUnits)) {
                    unitsToDeduct = undefined;
                }
            }
            const closeRequest: Dict = {
                'positionId': positionId,
            };
            if (unitsToDeduct !== undefined) {
                closeRequest['UnitsToDeduct'] = this.parseToNumeric (unitsToDeduct);
            }
            const closeResponse = await this.closePositionRequest (symbol, this.extend (closeRequest, closeParams));
            return this.parseOrder (this.safeDict (closeResponse, 'orderForClose', {}), market);
        }
        const request: Dict = {
            'action': 'open',
            'transaction': 'buy',
            'instrumentId': this.parseToInt (market['id']),
            'leverage': 1,
            'orderCurrency': 'usd',
        };
        const cost = this.safeString (params, 'cost');
        if (cost !== undefined) {
            request['amount'] = this.parseToNumeric (cost);
        } else {
            request['units'] = this.parseToNumeric (this.numberToString (amount));
        }
        if (type === 'market') {
            request['orderType'] = 'mkt';
        } else if (type === 'limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
            }
            const timeInForce = this.safeStringUpper (params, 'timeInForce');
            if (timeInForce === 'IOC') {
                request['orderType'] = 'limitIOC';
                request['limitRate'] = this.parseToNumeric (this.numberToString (price));
            } else {
                request['orderType'] = 'mit';
                request['triggerRate'] = this.parseToNumeric (this.numberToString (price));
            }
        } else {
            throw new InvalidOrder (this.id + ' createOrder() supports market and limit orders only');
        }
        const query = this.omit (params, [ 'cost', 'timeInForce' ]);
        let response = undefined;
        if (sandboxMode) {
            response = await this.privatePostApiV2TradingExecutionDemoOrders (this.extend (request, query));
        } else {
            response = await this.privatePostApiV2TradingExecutionOrders (this.extend (request, query));
        }
        //
        //     {
        //         "token": "066faaee-e1e9-49d2-a568-c6e1cc336ad8",
        //         "orderId": 13902598,
        //         "referenceId": "1c94300c-90aa-4303-9d00-dec376d74efb"
        //     }
        //
        const order = this.parseOrder (response, market);
        order['type'] = type;
        order['side'] = side;
        return order;
    }

    /**
     * @method
     * @name etoro#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://api-portal.etoro.com/api-reference/trading--real/create-an-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async createMarketBuyOrderWithCost (symbol: string, cost: number, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const req: Dict = {
            'cost': this.numberToString (cost),
        };
        // the cost in params overrides the amount
        return await this.createOrder (symbol, 'market', 'buy', cost, undefined, this.extend (req, params));
    }

    async findSpotPosition (symbol: string, methodName: string): Promise<Dict> {
        const market = this.market (symbol);
        // the account must hold exactly one real long position in the market
        const portfolio = await this.fetchPortfolio ();
        const positions = this.safeList (portfolio, 'positions', []);
        const matching = [];
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const instrumentId = this.safeString2 (position, 'instrumentID', 'instrumentId');
            const settlementType = this.safeString2 (position, 'settlementTypeID', 'settlementTypeId');
            const isBuy = this.safeBool (position, 'isBuy');
            if ((instrumentId === market['id']) && (settlementType === '1') && isBuy) {
                matching.push (position);
            }
        }
        const numMatching = matching.length;
        if (numMatching === 0) {
            throw new InvalidOrder (this.id + ' ' + methodName + '() found no open position in ' + market['symbol']);
        }
        if (numMatching > 1) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() found ' + numMatching.toString () + ' open positions in ' + market['symbol'] + ', set params.positionId to choose one');
        }
        return matching[0];
    }

    async closePositionRequest (symbol: string, params = {}): Promise<Dict> {
        // params carry the positionId path argument and the optional UnitsToDeduct, a full close sends no units
        const market = this.market (symbol);
        const sandboxMode = this.safeBool (this.options, 'sandboxMode', false);
        const request: Dict = {};
        let response = undefined;
        if (sandboxMode) {
            request['InstrumentID'] = this.parseToInt (market['id']);
            response = await this.privatePostApiV1TradingExecutionDemoMarketCloseOrdersPositionsPositionId (this.extend (request, params));
        } else {
            request['InstrumentId'] = this.parseToInt (market['id']);
            response = await this.privatePostApiV1TradingExecutionMarketCloseOrdersPositionsPositionId (this.extend (request, params));
        }
        //
        //     {
        //         "orderForClose": {
        //             "positionID": 2150941015,
        //             "instrumentID": 1111,
        //             "unitsToDeduct": 2,
        //             "orderID": 13904638,
        //             "orderType": 19,
        //             "statusID": 1,
        //             "CID": 7765437,
        //             "openDateTime": "2025-04-02T16:07:54.0880338Z",
        //             "lastUpdate": "2025-04-02T16:07:54.0880338Z"
        //         },
        //         "token": "5fe065bc-f6f9-4897-a2ce-c4fccef73ff8"
        //     }
        //
        return response;
    }

    /**
     * @method
     * @name etoro#closePosition
     * @description closes a whole open position with a market sell, the remaining units of a position cannot be sold with createOrder ()
     * @see https://api-portal.etoro.com/api-reference/trading--real/close-position-by-units
     * @param {string} symbol unified market symbol
     * @param {string} [side] not used by etoro closePosition ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionId] the id of the position to close, required when the account holds more than one position in the market
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async closePosition (symbol: string, side: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        let positionId = this.safeString (params, 'positionId');
        const query = this.omit (params, 'positionId');
        if (positionId === undefined) {
            const position = await this.findSpotPosition (symbol, 'closePosition');
            positionId = this.safeString2 (position, 'positionID', 'positionId');
        }
        const request: Dict = {
            'positionId': positionId,
        };
        const response = await this.closePositionRequest (symbol, this.extend (request, query));
        return this.parseOrder (this.safeDict (response, 'orderForClose', {}), this.market (symbol));
    }

    /**
     * @method
     * @name etoro#cancelOrder
     * @description cancels an open order that is waiting for the market to open or for its trigger rate
     * @see https://api-portal.etoro.com/api-reference/trading--real/cancels-an-order-before-it-is-executed
     * @param {string} id order id
     * @param {string} [symbol] not used by etoro cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.closeOrder] set to true to cancel a pending sell (close position) order
     * @returns {object} An [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const sandboxMode = this.safeBool (this.options, 'sandboxMode', false);
        const closeOrder = this.safeBool (params, 'closeOrder', false);
        const query = this.omit (params, 'closeOrder');
        const request: Dict = {
            'orderId': id,
        };
        let response = undefined;
        if (closeOrder) {
            if (sandboxMode) {
                response = await this.privateDeleteApiV1TradingExecutionDemoMarketCloseOrdersOrderId (this.extend (request, query));
            } else {
                response = await this.privateDeleteApiV1TradingExecutionMarketCloseOrdersOrderId (this.extend (request, query));
            }
        } else {
            if (sandboxMode) {
                response = await this.privateDeleteApiV2TradingExecutionDemoOrdersOrderId (this.extend (request, query));
            } else {
                response = await this.privateDeleteApiV2TradingExecutionOrdersOrderId (this.extend (request, query));
            }
        }
        //
        //     { "token": "7f1da128-..." }
        //
        // the cancellation is asynchronous, fetchOrder () reports the final status
        return this.safeOrder ({
            'id': id,
            'info': response,
        });
    }

    /**
     * @method
     * @name etoro#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-order-information-and-position-details
     * @param {string} id the order id
     * @param {string} [symbol] not used by etoro fetchOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] the x-request-id the order was created with, used instead of the id
     * @param {boolean} [params.closeOrder] set to true to fetch a sell (close position) order
     * @returns {object} An [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const sandboxMode = this.safeBool (this.options, 'sandboxMode', false);
        const clientOrderId = this.safeString (params, 'clientOrderId');
        const closeOrder = this.safeBool (params, 'closeOrder', false);
        const query = this.omit (params, [ 'clientOrderId', 'closeOrder' ]);
        const request: Dict = {};
        let response = undefined;
        if (closeOrder) {
            request['orderId'] = id;
            if (sandboxMode) {
                response = await this.privateGetApiV1TradingInfoDemoCloseOrdersOrderId (this.extend (request, query));
            } else {
                response = await this.privateGetApiV1TradingInfoRealCloseOrdersOrderId (this.extend (request, query));
            }
            //
            //     {
            //         "token": "d9c97f57-19f0-47b4-8e49-da6826960b19",
            //         "orderID": 394994707,
            //         "CID": 17799278,
            //         "statusID": 4,
            //         "orderType": 19,
            //         "closeActionType": 1,
            //         "operationType": 2,
            //         "errorCode": 776,
            //         "errorMessage": "Calculated remaining live position amount in dollars: 0 < 1. PositionID: 3645484190",
            //         "instrumentID": 100000,
            //         "requestOccurred": "2026-11-18T11:09:17.387Z",
            //         "proceeds": 0.0,
            //         "positions": []
            //     }
            //
            return this.parseOrder (response);
        }
        if (clientOrderId !== undefined) {
            request['referenceId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        if (sandboxMode) {
            response = await this.privateGetApiV2TradingInfoDemoOrdersLookup (this.extend (request, query));
        } else {
            response = await this.privateGetApiV2TradingInfoOrdersLookup (this.extend (request, query));
        }
        return this.parseOrder (response);
    }

    /**
     * @method
     * @name etoro#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-account-pnl-and-portfolio-details
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const portfolio = await this.fetchPortfolio (params);
        const limitOrders = this.safeList (portfolio, 'orders', []);
        const ordersForOpen = this.safeList (portfolio, 'ordersForOpen', []);
        const ordersForClose = this.safeList (portfolio, 'ordersForClose', []);
        const orders = this.arrayConcat (this.arrayConcat (limitOrders, ordersForOpen), ordersForClose);
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            '1': 'open', // Received
            '2': 'open', // Placed
            '3': 'closed', // Filled
            '4': 'rejected', // Rejected
            '5': 'open', // PartiallyFilled
            '6': 'open', // PendingCancel
            '7': 'canceled', // Canceled
            '8': 'expired', // Expired
            '9': 'canceled', // CanceledPartiallyFilled
            '10': 'rejected', // RejectedPartiallyFilled
            '11': 'open', // WaitingForMarket
            '12': 'open', // PendingTriggeredRate
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str): Str {
        const types: Dict = {
            'mkt': 'market',
            'mit': 'limit',
            'limitIOC': 'limit',
        };
        return this.safeString (types, type, type);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder (buy)
        //
        //     { "token": "066faaee-e1e9-49d2-a568-c6e1cc336ad8", "orderId": 13902598, "referenceId": "1c94300c-90aa-4303-9d00-dec376d74efb" }
        //
        // createOrder (sell), fetchOpenOrders (ordersForClose)
        //
        //     { "positionID": 2150941015, "instrumentID": 1111, "unitsToDeduct": 2, "orderID": 13904638, "orderType": 19, "statusID": 1, "openDateTime": "2025-04-02T16:07:54.0880338Z", ... }
        //
        // fetchOpenOrders (orders, pending market-if-touched orders)
        //
        //     { "orderID": 5001, "instrumentID": 101, "isBuy": true, "rate": 1.3, "amount": 1000, "units": 10.5, "openDateTime": "2024-01-01T09:00:00Z", ... }
        //
        // fetchOpenOrders (ordersForOpen, pending market orders)
        //
        //     { "orderID": 5001, "orderType": 17, "statusID": 11, "instrumentID": 101, "amount": 1000, "amountInUnits": 10.5, "isBuy": true, "openDateTime": "2024-01-01T09:00:00Z", ... }
        //
        // fetchOrder
        //
        //     {
        //         "orderId": 394898254,
        //         "action": "open",
        //         "transaction": "buy",
        //         "type": "mkt",
        //         "status": { "id": 3, "name": "Filled", "errorCode": 0 },
        //         "asset": { "symbol": "BTC", "instrumentId": 100000, "currency": "USD", "settlementType": "REAL", "leverage": 1, "side": "long" },
        //         "requestedAmount": 39.94,
        //         "requestedUnits": 0.000627,
        //         "totalCosts": 0.4,
        //         "positionExecutions": [
        //             {
        //                 "positionId": 3644959955,
        //                 "openingData": { "orderId": 394898254, "executionTime": "2026-11-17T19:05:08.04Z", "units": 0.000627, "avgPrice": 63703.77, "fees": 0.4, ... },
        //                 ...
        //             }
        //         ],
        //         "requestTime": "2026-11-17T19:05:07.96Z",
        //         "lastUpdate": "2026-11-17T19:05:08.097Z",
        //         "requestType": "byAmount",
        //         ...
        //     }
        //
        const asset = this.safeDict (order, 'asset', {});
        const marketId = this.safeStringN (order, [ 'instrumentID', 'instrumentId' ], this.safeString (asset, 'instrumentId'));
        const resolvedMarket = this.safeMarket (marketId, market);
        const id = this.safeString2 (order, 'orderID', 'orderId');
        const statusDict = this.safeDict (order, 'status');
        let status = undefined;
        let type = undefined;
        let side = undefined;
        let price = undefined;
        let amount = undefined;
        let cost = undefined;
        let filled = undefined;
        let average = undefined;
        const fees = [];
        let timeInForce = undefined;
        let timestamp = this.parse8601 (this.safeString (order, 'openDateTime'));
        let lastUpdateTimestamp = this.parse8601 (this.safeString (order, 'lastUpdate'));
        if (statusDict !== undefined) {
            // fetchOrder
            status = this.parseOrderStatus (this.safeString (statusDict, 'id'));
            const exchangeType = this.safeString (order, 'type');
            type = this.parseOrderType (exchangeType);
            if (exchangeType === 'limitIOC') {
                timeInForce = 'IOC';
                price = this.safeString (order, 'requestedLimitRate');
            } else if (exchangeType === 'mit') {
                price = this.safeString (order, 'requestedTriggerRate');
            }
            const transaction = this.safeString (order, 'transaction');
            side = ((transaction === 'buy') || (transaction === 'buyToCover')) ? 'buy' : 'sell';
            amount = this.safeString (order, 'requestedUnits');
            timestamp = this.parse8601 (this.safeString (order, 'requestTime'));
            lastUpdateTimestamp = this.parse8601 (this.safeString (order, 'lastUpdate'));
            const executions = this.safeList (order, 'positionExecutions', []);
            let filledUnits: Str = '0';
            let filledCost: Str = '0';
            for (let i = 0; i < executions.length; i++) {
                const openingData = this.safeDict (executions[i], 'openingData', {});
                const units = this.safeString (openingData, 'units', '0');
                filledUnits = Precise.stringAdd (filledUnits, units);
                filledCost = Precise.stringAdd (filledCost, Precise.stringMul (units, this.safeString (openingData, 'avgPrice', '0')));
            }
            filled = filledUnits;
            cost = filledCost;
            if (Precise.stringGt (filledUnits, '0')) {
                average = Precise.stringDiv (filledCost, filledUnits);
            }
            const totalCosts = this.safeString (order, 'totalCosts');
            if (totalCosts !== undefined) {
                fees.push ({
                    'cost': totalCosts,
                    'currency': 'USD',
                });
            }
        } else if (('unitsToDeduct' in order) || ('positionID' in order) || ('closeActionType' in order)) {
            // close order, the account holds long positions only, so closing sells
            status = this.parseOrderStatus (this.safeString (order, 'statusID'));
            type = 'market';
            side = 'sell';
            amount = this.safeString (order, 'unitsToDeduct');
            const requestOccurred = this.parse8601 (this.safeString (order, 'requestOccurred'));
            if (requestOccurred !== undefined) {
                timestamp = requestOccurred;
            }
        } else if ('rate' in order) {
            // pending market-if-touched order
            status = 'open';
            type = 'limit';
            side = (this.safeBool (order, 'isBuy')) ? 'buy' : 'sell';
            price = this.safeString (order, 'rate');
            amount = this.safeString (order, 'units');
        } else if ('isBuy' in order) {
            // pending market order
            status = 'open';
            type = 'market';
            side = (this.safeBool (order, 'isBuy')) ? 'buy' : 'sell';
            amount = this.safeString (order, 'amountInUnits');
        }
        if ((amount !== undefined) && Precise.stringEq (amount, '0')) {
            amount = undefined; // a by-amount order has no units requested
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': this.safeString (order, 'referenceId'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': status,
            'symbol': resolvedMarket['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'fee': undefined,
            'fees': fees,
            'trades': undefined,
            'info': order,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name etoro#fetchMyTrades
     * @description fetch the trades of closed positions, each closed position yields its opening buy and its closing sell
     * @see https://api-portal.etoro.com/api-reference/trading--real/list-trading-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for, at most 364 days back, default 364 days back
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const sandboxMode = this.safeBool (this.options, 'sandboxMode', false);
        let minTimestamp = since;
        if (minTimestamp === undefined) {
            minTimestamp = this.milliseconds () - 364 * 86400000;
        }
        const request: Dict = {
            'minDate': this.yyyymmdd (minTimestamp),
        };
        let response = undefined;
        if (sandboxMode) {
            response = await this.privateGetApiV1TradingInfoTradeDemoHistory (this.extend (request, params));
        } else {
            response = await this.privateGetApiV1TradingInfoTradeHistory (this.extend (request, params));
        }
        //
        //     [
        //         {
        //             "netProfit": 0.13,
        //             "closeRate": 1798.87,
        //             "closeTimestamp": "2026-11-17T20:37:57.697Z",
        //             "positionId": 3644994131,
        //             "instrumentId": 100001,
        //             "isBuy": true,
        //             "leverage": 1,
        //             "openRate": 1787.34,
        //             "openTimestamp": "2026-11-17T20:01:12.583Z",
        //             "orderId": 394920309,
        //             "investment": 19.99,
        //             "initialInvestment": 19.99,
        //             "fees": 0,
        //             "units": 0.011185,
        //             ...
        //         }
        //     ]
        //
        const items = this.toArray (response);
        let trades = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const marketId = this.safeString (item, 'instrumentId');
            // positions in instruments outside the crypto spot markets are skipped
            const knownMarkets = this.safeList (this.markets_by_id, marketId);
            if (knownMarkets === undefined) {
                continue;
            }
            trades.push (this.parseTradeLeg (item, 'open'));
            trades.push (this.parseTradeLeg (item, 'close'));
        }
        trades = this.sortBy (trades, 'timestamp');
        return this.filterBySymbolSinceLimit (trades, (market === undefined) ? undefined : market['symbol'], since, limit);
    }

    parseTradeLeg (trade: Dict, leg: string, market: Market = undefined): Trade {
        const marketId = this.safeString (trade, 'instrumentId');
        const resolvedMarket = this.safeMarket (marketId, market);
        const positionId = this.safeString (trade, 'positionId');
        const isBuy = this.safeBool (trade, 'isBuy');
        let side = undefined;
        let timestamp = undefined;
        let price = undefined;
        let orderId = undefined;
        let fee = undefined;
        if (leg === 'open') {
            side = (isBuy) ? 'buy' : 'sell';
            timestamp = this.parse8601 (this.safeString (trade, 'openTimestamp'));
            price = this.safeString (trade, 'openRate');
            orderId = this.safeString (trade, 'orderId');
        } else {
            side = (isBuy) ? 'sell' : 'buy';
            timestamp = this.parse8601 (this.safeString (trade, 'closeTimestamp'));
            price = this.safeString (trade, 'closeRate');
            fee = {
                'cost': this.safeString (trade, 'fees'),
                'currency': 'USD',
            };
        }
        return this.safeTrade ({
            'id': positionId + '-' + leg,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': resolvedMarket['symbol'],
            'order': orderId,
            'type': 'market',
            'side': side,
            'takerOrMaker': 'taker',
            'price': price,
            'amount': this.safeString (trade, 'units'),
            'cost': undefined,
            'fee': fee,
        }, resolvedMarket);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        // a trade history item is a closed position, parsed as its closing trade
        return this.parseTradeLeg (trade, 'close', market);
    }

    override sign (path: string, api: string[] = [ 'public' ], method: string = 'GET', params: Dict = {}): Dict {
        const apiName = api[0];
        const baseApiUrl = this.safeString (this.urls['api'], apiName);
        if (baseApiUrl === undefined) {
            throw new ExchangeError (this.id + ' sign() has no API URL for this endpoint');
        }
        let url = baseApiUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        // every endpoint, market data included, requires the key pair
        this.checkRequiredCredentials ();
        const headersSigned: NullableDict = {
            'x-request-id': this.uuid (),
            'x-api-key': this.apiKey,
            'x-user-key': this.secret,
        };
        let bodySigned: Str = undefined;
        if ((method === 'GET') || (method === 'DELETE')) {
            if (Object.keys (query).length > 0) {
                url += '?' + this.urlencode (query);
            }
        } else {
            bodySigned = this.json (query);
            headersSigned['Content-Type'] = 'application/json';
        }
        return { 'url': url, 'method': method, 'body': bodySigned, 'headers': headersSigned };
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: NullableDict, requestBody: Str) {
        if (response === undefined) {
            return undefined;
        }
        //
        // gateway envelope
        //
        //     { "errorCode": "RouteNotFound", "errorMessage": "Route not found" }
        //
        // problem details
        //
        //     { "type": "...", "title": "...", "status": 400, "detail": "..." }
        //
        // order lookup
        //
        //     { "message": "Order category for 394994707 not found" }
        //
        if ((code < 400) && ('token' in response)) {
            // an order object, its errorCode and errorMessage describe an order rejection, parsed as the order status
            return undefined;
        }
        const feedback = this.id + ' ' + body;
        const errorCode = this.safeString (response, 'errorCode');
        const message = this.safeStringN (response, [ 'errorMessage', 'detail', 'message' ]);
        const title = this.safeString (response, 'title');
        if ((errorCode !== undefined) || (message !== undefined) || (title !== undefined)) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            if (message !== undefined) {
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            }
            if (title !== undefined) {
                this.throwBroadlyMatchedException (this.exceptions['broad'], title, feedback);
            }
            if (code >= 400) {
                return undefined; // the default http status handler throws
            }
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
