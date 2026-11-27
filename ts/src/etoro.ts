//  ---------------------------------------------------------------------------

import Exchange from './abstract/etoro.js';
import { Precise } from './base/Precise.js';
import { ExchangeError, AuthenticationError, BadRequest, BadSymbol, InvalidOrder, OrderNotFound, PermissionDenied, ArgumentsRequired, NotSupported, InsufficientFunds, RateLimitExceeded, ExchangeNotAvailable, MarketClosed, DuplicateOrderId } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Account, Balances, Dict, Endpoint, Int, List, Market, MarketInterface, NullableDict, Num, OHLCV, Order, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, int } from './base/types.js';

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
            'countries': [ 'IL', 'CY', 'GB', 'US', 'AU' ],
            'rateLimit': 500, // market-data endpoints allow 120 requests per 60 seconds
            'version': 'v1',
            'certified': false,
            'pro': true,
            'urls': {
                'logo': 'https://etoro-cdn.etorostatic.com/web-client/img/etoro-logo-green.svg',
                'api': {
                    'rest': 'https://public-api.etoro.com',
                },
                'test': {
                    'rest': 'https://public-api.etoro.com', // demo account, same host with /demo/ endpoints
                },
                'www': 'https://www.etoro.com',
                'doc': [
                    'https://api-portal.etoro.com/',
                ],
                'fees': 'https://www.etoro.com/trading/fees/',
            },
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'closeAllPositions': false,
                'closePosition': true,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createReduceOnlyOrder': false,
                'createStopLossOrder': false,
                'createTakeProfitOrder': false,
                'createTriggerOrder': true,
                'editOrder': false,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchL2OrderBook': false,
                'fetchLeverage': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPositionsHistory': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'api': {
                // every endpoint, including market data, requires the x-api-key and x-user-key headers
                'public': {
                    'get': {
                        'v1/market-data/instruments': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market-data/instruments/rates': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market-data/instruments/history/closing-price': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market-data/instruments/{instrumentId}/history/candles/{direction}/{interval}/{candlesCount}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market-data/search': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market-data/exchanges': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market-data/instrument-types': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market-data/stocks-industries': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/data/instruments/{instrumentId}/candles': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/data/instruments/{instrumentId}/candles/coverage': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/market-data/instruments': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/market-data/instruments/search': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/market-data/rates': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
                'private': {
                    'get': {
                        'v1/me': { 'cost': 2 } as Endpoint<Dict>,
                        'v1/balances': { 'cost': 2 } as Endpoint<Dict>,
                        'v1/trading/info/real/pnl': { 'cost': 2 } as Endpoint<Dict>,
                        'v1/trading/info/demo/pnl': { 'cost': 2 } as Endpoint<Dict>,
                        'v1/trading/info/portfolio': { 'cost': 2 } as Endpoint<Dict>,
                        'v1/trading/info/demo/portfolio': { 'cost': 2 } as Endpoint<Dict>,
                        'v1/trading/info/aggregate-portfolio': { 'cost': 2 } as Endpoint<Dict>,
                        'v1/trading/info/demo/aggregate-portfolio': { 'cost': 2 } as Endpoint<Dict>,
                        'v1/trading/info/real/close-orders/{orderId}': { 'cost': 2 } as Endpoint<Dict>,
                        'v1/trading/info/demo/close-orders/{orderId}': { 'cost': 2 } as Endpoint<Dict>,
                        'v1/trading/info/trade/history': { 'cost': 2 } as Endpoint<List>,
                        'v1/trading/info/trade/demo/history': { 'cost': 2 } as Endpoint<List>,
                        'v2/trading/info/instrument-breakdown': { 'cost': 2 } as Endpoint<Dict>,
                        'v2/trading/info/demo/instrument-breakdown': { 'cost': 2 } as Endpoint<Dict>,
                        'v2/trading/info/orders:lookup': { 'cost': 2 } as Endpoint<Dict>,
                        'v2/trading/info/demo/orders:lookup': { 'cost': 2 } as Endpoint<Dict>,
                    },
                    'post': {
                        'v1/trading/info/aggregate-portfolio': { 'cost': 2 } as Endpoint<Dict>,
                        'v1/trading/info/demo/aggregate-portfolio': { 'cost': 2 } as Endpoint<Dict>,
                        'v1/trading/execution/market-close-orders/positions/{positionId}': { 'cost': 6 } as Endpoint<Dict>,
                        'v1/trading/execution/demo/market-close-orders/positions/{positionId}': { 'cost': 6 } as Endpoint<Dict>,
                        'v2/trading/execution/orders': { 'cost': 6 } as Endpoint<Dict>,
                        'v2/trading/execution/demo/orders': { 'cost': 6 } as Endpoint<Dict>,
                        'v3/trading/execution/orders': { 'cost': 6 } as Endpoint<Dict>,
                        'v3/trading/execution/demo/orders': { 'cost': 6 } as Endpoint<Dict>,
                        'v2/trading/info/eligibility': { 'cost': 6 } as Endpoint<Dict>,
                        'v2/trading/info/demo/eligibility': { 'cost': 6 } as Endpoint<Dict>,
                        'v2/trading/info/costs': { 'cost': 6 } as Endpoint<Dict>,
                        'v2/trading/info/demo/costs': { 'cost': 6 } as Endpoint<Dict>,
                    },
                    'patch': {
                        'v2/trading/positions/{positionId}': { 'cost': 2 } as Endpoint<Dict>,
                        'v2/trading/demo/positions/{positionId}': { 'cost': 2 } as Endpoint<Dict>,
                    },
                    'delete': {
                        'v1/trading/execution/market-close-orders/{orderId}': { 'cost': 6 } as Endpoint<Dict>,
                        'v1/trading/execution/demo/market-close-orders/{orderId}': { 'cost': 6 } as Endpoint<Dict>,
                        'v2/trading/execution/orders/{orderId}': { 'cost': 6 } as Endpoint<Dict>,
                        'v2/trading/execution/demo/orders/{orderId}': { 'cost': 6 } as Endpoint<Dict>,
                        'v3/trading/execution/orders/{orderId}': { 'cost': 6 } as Endpoint<Dict>,
                        'v3/trading/execution/demo/orders/{orderId}': { 'cost': 6 } as Endpoint<Dict>,
                    },
                },
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
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    // stocks, etfs and cfds are commission-free, the cost is included in the spread
                    'taker': 0,
                    'maker': 0,
                },
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true, // x-api-key
                'secret': true, // x-user-key
            },
            'commonCurrencies': {},
            'options': {
                'fetchMarkets': {
                    'types': [ 1, 2, 4, 5, 6, 10 ], // forex, commodities, indices, stocks, etf, crypto
                    'futures': true, // CME futures (exchangeId 40)
                },
                // instrument type ids that are also tradeable without leverage (settlementType real)
                'spotInstrumentTypes': [ 5, 6, 10 ],
                'futuresExchangeId': 40,
                'futuresTemplateIds': [ 998, 999 ],
                // the default quote currency of each eToro exchange id, refined with the conversion rate in fetchMarkets
                'exchangeCurrencies': {
                    '1': 'USD',
                    '2': 'USD',
                    '3': 'USD',
                    '4': 'USD',
                    '5': 'USD',
                    '6': 'EUR',
                    '7': 'GBX',
                    '8': 'USD',
                    '9': 'EUR',
                    '10': 'EUR',
                    '11': 'EUR',
                    '12': 'CHF',
                    '13': 'JPY',
                    '14': 'NOK',
                    '15': 'SEK',
                    '16': 'DKK',
                    '17': 'EUR',
                    '18': 'CAD',
                    '19': 'USD',
                    '20': 'USD',
                    '21': 'HKD',
                    '22': 'EUR',
                    '23': 'EUR',
                    '24': 'SAR',
                    '30': 'EUR',
                    '31': 'AUD',
                    '32': 'EUR',
                    '33': 'USD',
                    '34': 'EUR',
                    '35': 'CZK',
                    '36': 'PLN',
                    '37': 'HUF',
                    '38': 'EUR',
                    '39': 'AED',
                    '40': 'USD',
                    '41': 'AED',
                    '42': 'GBX',
                    '43': 'GBX',
                    '44': 'GBX',
                    '45': 'CNY',
                    '46': 'CNY',
                    '47': 'INR',
                    '48': 'CAD',
                    '49': 'SGD',
                    '50': 'ISK',
                    '51': 'EUR',
                    '52': 'EUR',
                    '53': 'EUR',
                    '54': 'KRW',
                    '55': 'TWD',
                    '56': 'JPY',
                    '57': 'USD',
                    '58': 'ILS',
                },
                'cryptoQuotes': [ 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF', 'CNH', 'BTC', 'ETH', 'LTC', 'BCH', 'DASH', 'XRP', 'XLM', 'A' ],
                // the exchange does not expose tick sizes, these are defaults by instrument type id
                'pricePrecision': {
                    '1': '0.00001',
                    '10': '0.00000001',
                    'default': '0.0001',
                },
                'amountPrecision': {
                    'future': '1',
                    'default': '0.000001',
                },
                'orderCurrency': 'usd',
                'fetchMyTradesDaysBack': 364, // the trade history lookback must be less than a year
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': undefined,
                            'price': false,
                        },
                        'timeInForce': {
                            'IOC': true,
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': true,
                        'trailing': true,
                        'leverage': true,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': 100000,
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
                'spot': {
                    'extends': 'default',
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
            },
            'exceptions': {
                'exact': {
                    'Unauthorized': AuthenticationError, // {"errorCode":"Unauthorized","errorMessage":"Unauthorized"}
                    'InvalidKey': AuthenticationError,
                    'GCID_REQUIRED': AuthenticationError,
                    'InsufficientPermissions': PermissionDenied, // {"errorCode":"InsufficientPermissions","errorMessage":"UserToken does not have permission to access"}
                    'Forbidden': PermissionDenied,
                    'RequestIdRequired': BadRequest, // {"errorCode":"RequestIdRequired","errorMessage":"X-Request-Id header is required"}
                    'VALIDATION_ERROR': BadRequest,
                    'ValidationFailed': BadRequest,
                    'AccountNotFound': BadRequest,
                    'INSTRUMENT_NOT_FOUND': BadSymbol,
                    'InvalidAmountInUsd': InvalidOrder,
                    'TooManyRequests': RateLimitExceeded,
                    'DEPENDENCY_UNAVAILABLE': ExchangeNotAvailable,
                    'UnhandledException': ExchangeError,
                    '720': InvalidOrder, // minimum position amount
                    '741': InvalidOrder, // Order cannot be placed because the requested position is already closed
                    '759': PermissionDenied, // manual Trading is disallowed for this instrument type(10:CRYPTO)
                },
                'broad': {
                    'Instrument not found': BadSymbol, // {"message":"Instrument not found for ID: 99999999"}
                    'Order not found': OrderNotFound, // {"message":"Order not found for OrderId 123"}
                    'Order category for': OrderNotFound, // {"message":"Order category for 123 not found"}
                    'Exactly one of amount, units, or contracts': InvalidOrder,
                    'stopLossRate': InvalidOrder,
                    'insufficient': InsufficientFunds,
                    'Insufficient': InsufficientFunds,
                    'One or more validation errors occurred': BadRequest,
                    'market is closed': MarketClosed,
                    'Market is closed': MarketClosed,
                    'market closed': MarketClosed,
                    'duplicate': DuplicateOrderId,
                    'Duplicate': DuplicateOrderId,
                },
            },
        });
    }

    /**
     * @method
     * @name etoro#fetchMarkets
     * @description retrieves data on all markets for etoro
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-display-data.md
     * @see https://api-portal.etoro.com/api-reference/market-data/search-for-instruments.md
     * @see https://api-portal.etoro.com/api-reference/market-data/search-for-securities-instruments-by-id-or-symbol.md
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        const fetchMarketsOptions = this.safeDict (this.options, 'fetchMarkets', {});
        const fetchFutures = this.safeBool (fetchMarketsOptions, 'futures', true);
        const promises: Promise<any>[] = [
            this.publicGetV1MarketDataInstruments (params),
            this.fetchInstrumentsSearchData (),
        ];
        if (fetchFutures) {
            promises.push (this.fetchFuturesInstruments ());
        }
        const results = await Promise.all (promises);
        //
        //     {
        //         "instrumentDisplayDatas": [
        //             {
        //                 "instrumentID": 1001,
        //                 "instrumentDisplayName": "Apple",
        //                 "instrumentTypeID": 5,
        //                 "exchangeID": 4,
        //                 "symbolFull": "AAPL",
        //                 "priceSource": "Nasdaq",
        //                 "hasExpirationDate": false,
        //                 "isInternalInstrument": false,
        //                 "images": [ ... ],
        //                 "stocksIndustryID": 1
        //             },
        //         ]
        //     }
        //
        const instrumentsResponse = this.safeDict (results, 0, {});
        const instruments = this.safeList (instrumentsResponse, 'instrumentDisplayDatas', []);
        const searchById = this.safeDict (results, 1, {});
        const futuresById = this.safeDict (results, 2, {});
        const allowedTypes = this.safeList (fetchMarketsOptions, 'types', []);
        const futuresExchangeId = this.safeString (this.options, 'futuresExchangeId', '40');
        const templateIds = this.safeList (this.options, 'futuresTemplateIds', []);
        const spotTypes = this.safeList (this.options, 'spotInstrumentTypes', []);
        const publicInstruments = [];
        for (let i = 0; i < instruments.length; i++) {
            const instrument = instruments[i];
            const isInternal = this.safeBool (instrument, 'isInternalInstrument', false);
            const instrumentId = this.safeInteger (instrument, 'instrumentID');
            if (isInternal || (this.inArray (instrumentId, templateIds))) {
                continue;
            }
            publicInstruments.push (instrument);
        }
        const rates = this.getConversionReferenceRates (publicInstruments, searchById);
        const cryptoSymbols: Dict = {};
        for (let i = 0; i < publicInstruments.length; i++) {
            const instrument = publicInstruments[i];
            if (this.safeInteger (instrument, 'instrumentTypeID') === 10) {
                const symbolFull = this.safeString (instrument, 'symbolFull', '');
                cryptoSymbols[symbolFull.toUpperCase ()] = true;
            }
        }
        const result = [];
        for (let i = 0; i < publicInstruments.length; i++) {
            const instrument = publicInstruments[i];
            const instrumentId = this.safeString (instrument, 'instrumentID');
            const typeId = this.safeInteger (instrument, 'instrumentTypeID');
            const exchangeId = this.safeString (instrument, 'exchangeID');
            const searchEntry = this.safeDict (searchById, instrumentId);
            const extended = this.extend (instrument, {
                'search': searchEntry,
            });
            if (exchangeId === futuresExchangeId) {
                if (fetchFutures) {
                    const futureMarket = this.parseFutureMarket (extended, this.safeDict (futuresById, instrumentId, {}));
                    if (futureMarket !== undefined) {
                        result.push (futureMarket);
                    }
                }
                continue;
            }
            if (!this.inArray (typeId, allowedTypes)) {
                continue;
            }
            const quoteAndBase = this.getMarketBaseAndQuote (extended, rates, cryptoSymbols);
            if (this.inArray (typeId, spotTypes)) {
                result.push (this.parseEtoroMarket (extended, quoteAndBase, 'spot'));
            }
            result.push (this.parseEtoroMarket (extended, quoteAndBase, 'swap'));
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name etoro#fetchInstrumentsSearchData
     * @description fetches conversion rates and listing status of all instruments, indexed by instrument id
     * @see https://api-portal.etoro.com/api-reference/market-data/search-for-instruments.md
     * @returns {object} a dictionary of search entries indexed by instrument id
     */
    async fetchInstrumentsSearchData (): Promise<Dict> {
        const pageSize = 5000;
        const maxPages = 10;
        const result: Dict = {};
        for (let page = 1; page <= maxPages; page++) {
            const request: Dict = {
                'fields': 'instrumentId,cvtBid,currentRate,isDelisted,isCurrentlyTradable',
                'pageSize': pageSize,
                'page': page,
            };
            const response = await this.publicGetV1MarketDataSearch (request);
            //
            //     {
            //         "page": 1,
            //         "pageSize": 5000,
            //         "totalItems": 13465,
            //         "items": [
            //             {
            //                 "instrumentId": 1001,
            //                 "cvtBid": 1,
            //                 "currentRate": 230.1,
            //                 "isDelisted": false,
            //                 "isCurrentlyTradable": true
            //             },
            //         ]
            //     }
            //
            const items = this.safeList (response, 'items', []);
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const id = this.safeString (item, 'instrumentId', '');
                result[id] = item;
            }
            const itemsLength = items.length;
            if (itemsLength < pageSize) {
                break;
            }
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name etoro#fetchFuturesInstruments
     * @description fetches the expiry and multiplier of CME futures instruments, indexed by instrument id
     * @see https://api-portal.etoro.com/api-reference/market-data/search-for-securities-instruments-by-id-or-symbol.md
     * @returns {object} a dictionary of futures instruments indexed by instrument id
     */
    async fetchFuturesInstruments (): Promise<Dict> {
        const result: Dict = {};
        let pageToken: Str = undefined;
        const maxPages = 10;
        for (let i = 0; i < maxPages; i++) {
            const request: Dict = {
                'exchangeId': this.safeInteger (this.options, 'futuresExchangeId', 40),
                'pageSize': 1000,
            };
            if (pageToken !== undefined) {
                request['pageToken'] = pageToken;
            }
            const response = await this.publicGetV2MarketDataInstruments (request);
            //
            //     {
            //         "results": [
            //             {
            //                 "instrumentId": 998,
            //                 "displayName": "Futures Index Template",
            //                 "type": "Indices",
            //                 "symbol": "FUT_IDX_TEMP",
            //                 "exchangeId": 40,
            //                 "multiplier": 2,
            //                 "lastTradingDateTime": "2221-12-31T23:00:00Z",
            //                 "expirationDateTime": "2221-12-31T23:00:00Z",
            //                 "image": { "uri": "..." }
            //             },
            //         ],
            //         "pagination": { "pageSize": 1000, "nextPageToken": "ODM4", "hasNext": false }
            //     }
            //
            const items = this.safeList (response, 'results', []);
            for (let j = 0; j < items.length; j++) {
                const item = items[j];
                const id = this.safeString (item, 'instrumentId', '');
                result[id] = item;
            }
            const pagination = this.safeDict (response, 'pagination', {});
            const hasNext = this.safeBool (pagination, 'hasNext', false);
            pageToken = this.safeString (pagination, 'nextPageToken');
            if (!hasNext || (pageToken === undefined)) {
                break;
            }
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @name etoro#getConversionReferenceRates
     * @description builds the usd conversion rate of each currency from the forex pairs
     * @param {object[]} instruments the instrument display data
     * @param {object} searchById the search entries indexed by instrument id
     * @returns {object} a dictionary of conversion rates indexed by currency code
     */
    getConversionReferenceRates (instruments: any[], searchById: Dict): Dict {
        const rates: Dict = {
            'USD': '1',
        };
        for (let i = 0; i < instruments.length; i++) {
            const instrument = instruments[i];
            const symbolFull = this.safeString (instrument, 'symbolFull', '');
            const typeId = this.safeInteger (instrument, 'instrumentTypeID');
            if ((typeId !== 1) || (symbolFull.length !== 6)) {
                continue;
            }
            const entry = this.safeDict (searchById, this.safeString (instrument, 'instrumentID'), {});
            const baseId = symbolFull.slice (0, 3);
            const quoteId = symbolFull.slice (3, 6);
            const cvtBid = this.safeString (entry, 'cvtBid');
            if ((cvtBid !== undefined) && Precise.stringGt (cvtBid, '0') && !(quoteId in rates)) {
                rates[quoteId] = cvtBid;
            }
            const currentRate = this.safeString (entry, 'currentRate');
            if ((quoteId === 'USD') && (currentRate !== undefined) && Precise.stringGt (currentRate, '0') && !(baseId in rates)) {
                rates[baseId] = currentRate;
            }
        }
        if ('GBP' in rates) {
            rates['GBX'] = Precise.stringDiv (rates['GBP'], '100');
        }
        return rates;
    }

    isCloseConversionRate (a: Str, b: Str): boolean {
        if ((a === undefined) || (b === undefined) || Precise.stringEq (b, '0')) {
            return false;
        }
        const ratio = Precise.stringDiv (a, b, 10);
        const diff = Precise.stringAbs (Precise.stringSub (ratio, '1'));
        return Precise.stringLt (diff, '0.02');
    }

    /**
     * @ignore
     * @method
     * @name etoro#getMarketBaseAndQuote
     * @description resolves the base and quote currency ids of an instrument
     * @param {object} instrument the instrument display data extended with its search entry
     * @param {object} rates the usd conversion rates indexed by currency code
     * @param {object} cryptoSymbols the crypto symbols indexed by uppercase symbol
     * @returns {string[]} the base and quote currency ids
     */
    getMarketBaseAndQuote (instrument: Dict, rates: Dict, cryptoSymbols: Dict): string[] {
        const symbolFull = this.safeString (instrument, 'symbolFull', '');
        const typeId = this.safeInteger (instrument, 'instrumentTypeID');
        if ((typeId === 1) && (symbolFull.length === 6)) {
            return [ symbolFull.slice (0, 3), symbolFull.slice (3, 6) ];
        }
        if (typeId === 10) {
            const upperSymbol = symbolFull.toUpperCase ();
            const cryptoQuotes = this.safeList (this.options, 'cryptoQuotes', []);
            for (let i = 0; i < cryptoQuotes.length; i++) {
                const cryptoQuote = cryptoQuotes[i];
                const quoteLength = cryptoQuote.length;
                const symbolLength = upperSymbol.length;
                if ((symbolLength > quoteLength) && upperSymbol.endsWith (cryptoQuote)) {
                    const baseLength = symbolLength - quoteLength;
                    const baseId = upperSymbol.slice (0, baseLength);
                    if ((baseId in cryptoSymbols) || (baseId === 'GOLD')) {
                        return [ baseId, cryptoQuote ];
                    }
                }
            }
            return [ symbolFull, 'USD' ];
        }
        const exchangeCurrencies = this.safeDict (this.options, 'exchangeCurrencies', {});
        const exchangeId = this.safeString (instrument, 'exchangeID');
        const defaultQuote = this.safeString (exchangeCurrencies, exchangeId, 'USD');
        let quoteId = defaultQuote;
        const searchEntry = this.safeDict (instrument, 'search', {});
        const cvtBid = this.safeString (searchEntry, 'cvtBid');
        if ((cvtBid !== undefined) && Precise.stringGt (cvtBid, '0')) {
            const defaultRate = this.safeString (rates, defaultQuote);
            if (!this.isCloseConversionRate (cvtBid, defaultRate)) {
                const codes = Object.keys (rates);
                const found = [];
                for (let i = 0; i < codes.length; i++) {
                    const code = codes[i];
                    if (this.isCloseConversionRate (cvtBid, rates[code])) {
                        found.push (code);
                    }
                }
                const foundLength = found.length;
                if (foundLength === 1) {
                    quoteId = found[0];
                }
            }
        }
        return [ symbolFull, quoteId ];
    }

    safeEtoroCurrencyCode (currencyId: Str): Str {
        if (currencyId === undefined) {
            return undefined;
        }
        let code = currencyId.toUpperCase ();
        code = code.replaceAll ('/', '-');
        code = code.replaceAll (' ', '-');
        return this.safeCurrencyCode (code);
    }

    parseEtoroMarket (instrument: Dict, baseAndQuote: string[], marketType: string): Market {
        //
        //     {
        //         "instrumentID": 1001,
        //         "instrumentDisplayName": "Apple",
        //         "instrumentTypeID": 5,
        //         "exchangeID": 4,
        //         "symbolFull": "AAPL",
        //         "priceSource": "Nasdaq",
        //         "hasExpirationDate": false,
        //         "isInternalInstrument": false,
        //         "stocksIndustryID": 1,
        //         "search": { "instrumentId": 1001, "cvtBid": 1, "currentRate": 230.1, "isDelisted": false, "isCurrentlyTradable": true }
        //     }
        //
        const id = this.safeString (instrument, 'instrumentID');
        const typeId = this.safeString (instrument, 'instrumentTypeID');
        const base = this.safeEtoroCurrencyCode (baseAndQuote[0]);
        const quote = this.safeEtoroCurrencyCode (baseAndQuote[1]);
        const isSpot = (marketType === 'spot');
        let symbol = base + '/' + quote;
        let settle: Str = undefined;
        if (!isSpot) {
            settle = 'USD';
            symbol = symbol + ':' + settle;
        }
        const pricePrecisions = this.safeDict (this.options, 'pricePrecision', {});
        const amountPrecisions = this.safeDict (this.options, 'amountPrecision', {});
        const searchEntry = this.safeDict (instrument, 'search');
        let active = false;
        if (searchEntry !== undefined) {
            active = !this.safeBool (searchEntry, 'isDelisted', false);
        }
        // crypto is charged a 1% fee per side
        const fee = (typeId === '10') ? this.parseNumber ('0.01') : this.parseNumber ('0');
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': base,
            'quoteId': quote,
            'settleId': settle,
            'type': marketType,
            'spot': isSpot,
            'margin': false,
            'swap': !isSpot,
            'future': false,
            'option': false,
            'active': active,
            'contract': !isSpot,
            'linear': isSpot ? undefined : true,
            'inverse': isSpot ? undefined : false,
            'contractSize': isSpot ? undefined : this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (this.safeString (amountPrecisions, 'default')),
                'price': this.parseNumber (this.safeString2 (pricePrecisions, typeId, 'default')),
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
            'taker': fee,
            'maker': fee,
            'created': undefined,
            'info': instrument,
        });
    }

    parseFutureMarket (instrument: Dict, futureInfo: Dict): Market {
        //
        // instrument: v1 display data extended with the search entry
        //
        //     {
        //         "instrumentID": 100123,
        //         "instrumentTypeID": 4,
        //         "exchangeID": 40,
        //         "symbolFull": "SP500.MAR28",
        //         ...
        //     }
        //
        // futureInfo (v2 instruments)
        //
        //     {
        //         "instrumentId": 100123,
        //         "symbol": "SP500.MAR28",
        //         "exchangeId": 40,
        //         "multiplier": 50,
        //         "lastTradingDateTime": "2221-12-31T23:00:00Z",
        //         "expirationDateTime": "2221-12-31T23:00:00Z"
        //     }
        //
        const id = this.safeString (instrument, 'instrumentID');
        const symbolFull = this.safeString (instrument, 'symbolFull', '');
        const typeId = this.safeInteger (instrument, 'instrumentTypeID');
        const parts = symbolFull.split ('.');
        const partsLength = parts.length;
        if (partsLength < 2) {
            return undefined;
        }
        const suffix = parts[partsLength - 1].toUpperCase ();
        const baseParts = [];
        for (let i = 0; i < partsLength - 1; i++) {
            baseParts.push (parts[i]);
        }
        let baseId = baseParts.join ('.');
        let quoteId = 'USD';
        if ((typeId === 1) && (baseId.length === 6)) {
            quoteId = baseId.slice (3, 6);
            baseId = baseId.slice (0, 3);
        }
        let expiry: Int = undefined;
        const expirationDateTime = this.safeString (futureInfo, 'expirationDateTime');
        // placeholder expiries (year 2221/2222) are resolved from the symbol suffix, e.g. SP500.MAR28
        if ((expirationDateTime !== undefined) && !expirationDateTime.startsWith ('22')) {
            expiry = this.parse8601 (expirationDateTime);
        } else {
            const months: Dict = {
                'JAN': '01',
                'FEB': '02',
                'MAR': '03',
                'APR': '04',
                'MAY': '05',
                'JUN': '06',
                'JUL': '07',
                'AUG': '08',
                'SEP': '09',
                'OCT': '10',
                'NOV': '11',
                'DEC': '12',
            };
            const month = this.safeString (months, suffix.slice (0, 3));
            const year = suffix.slice (3);
            const digits = '0123456789';
            const isYear = (year.length === 2) && (digits.indexOf (year.slice (0, 1)) !== -1) && (digits.indexOf (year.slice (1, 2)) !== -1);
            if ((month !== undefined) && isYear) {
                expiry = this.parse8601 ('20' + year + '-' + month + '-01T00:00:00Z');
            }
        }
        if (expiry === undefined) {
            return undefined;
        }
        const base = this.safeEtoroCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = 'USD';
        const symbol = base + '/' + quote + ':' + settle + '-' + this.yymmdd (expiry);
        const searchEntry = this.safeDict (instrument, 'search');
        let active = false;
        if (searchEntry !== undefined) {
            active = !this.safeBool (searchEntry, 'isDelisted', false) && (expiry > this.milliseconds ());
        }
        const pricePrecisions = this.safeDict (this.options, 'pricePrecision', {});
        const amountPrecisions = this.safeDict (this.options, 'amountPrecision', {});
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': base,
            'quoteId': quote,
            'settleId': settle,
            'type': 'future',
            'spot': false,
            'margin': false,
            'swap': false,
            'future': true,
            'option': false,
            'active': active,
            'contract': true,
            'linear': true,
            'inverse': false,
            'contractSize': this.safeNumber (futureInfo, 'multiplier', this.parseNumber ('1')),
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (this.safeString (amountPrecisions, 'future')),
                'price': this.parseNumber (this.safeString2 (pricePrecisions, this.numberToString (typeId), 'default')),
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
            'taker': this.parseNumber ('0'),
            'maker': this.parseNumber ('0'),
            'created': undefined,
            'info': this.extend (instrument, {
                'future': futureInfo,
            }),
        });
    }

    /**
     * @method
     * @name etoro#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-market-rates.md
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)
     */
    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instrumentIds': market['id'],
        };
        const response = await this.publicGetV1MarketDataInstrumentsRates (this.extend (request, params));
        const rates = this.safeList (response, 'rates', []);
        const first = this.safeDict (rates, 0);
        if (first === undefined) {
            throw new BadSymbol (this.id + ' fetchTicker() could not find a ticker for ' + symbol);
        }
        return this.parseTicker (first, market);
    }

    /**
     * @method
     * @name etoro#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-market-rates.md
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all active markets are fetched by default, 1000 instruments are sent per request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)
     */
    override async fetchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        let requestedSymbols: string[] = [];
        if (symbols !== undefined) {
            requestedSymbols = this.marketSymbols (symbols, undefined, false);
        } else {
            const allMarkets = this.toArray (this.markets);
            for (let i = 0; i < allMarkets.length; i++) {
                const market = allMarkets[i];
                if (market['active']) {
                    requestedSymbols.push (market['symbol']);
                }
            }
        }
        const symbolsById: Dict = {};
        const ids = [];
        for (let i = 0; i < requestedSymbols.length; i++) {
            const market = this.market (requestedSymbols[i]);
            const marketId = this.safeString (market, 'id', '');
            if (!(marketId in symbolsById)) {
                symbolsById[marketId] = [];
                ids.push (marketId);
            }
            symbolsById[marketId].push (market['symbol']);
        }
        const chunkSize = 1000;
        const promises: Promise<any>[] = [];
        for (let i = 0; i < ids.length; i += chunkSize) {
            const chunk = this.arraySlice (ids, i, i + chunkSize);
            const request: Dict = {
                'instrumentIds': chunk.join (','),
            };
            promises.push (this.publicGetV1MarketDataInstrumentsRates (this.extend (request, params)));
        }
        const responses = await Promise.all (promises);
        const result: Dict = {};
        for (let i = 0; i < responses.length; i++) {
            const rates = this.safeList (responses[i], 'rates', []);
            for (let j = 0; j < rates.length; j++) {
                const rate = rates[j];
                const marketId = this.safeString (rate, 'instrumentID');
                // the same instrument id is shared by the spot and the swap market
                const marketSymbols = this.safeList (symbolsById, marketId, []);
                for (let k = 0; k < marketSymbols.length; k++) {
                    const market = this.market (marketSymbols[k]);
                    result[market['symbol']] = this.parseTicker (rate, market);
                }
            }
        }
        return result;
    }

    /**
     * @method
     * @name etoro#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-market-rates.md
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all active markets are fetched by default
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)
     */
    override async fetchBidsAsks (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        return await this.fetchTickers (symbols, params);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "instrumentID": 1001,
        //         "ask": 355.5,
        //         "bid": 355.1,
        //         "lastExecution": 355.1,
        //         "conversionRateAsk": 1,
        //         "conversionRateBid": 1,
        //         "date": "2026-11-26T00:49:03.7279276Z",
        //         "unitMargin": 355.1,
        //         "unitMarginAsk": 355.5,
        //         "unitMarginBid": 355.1,
        //         "priceRateID": 166217747680,
        //         "bidDiscounted": 355.1,
        //         "askDiscounted": 355.5,
        //         "unitMarginBidDiscounted": 355.1,
        //         "unitMarginAskDiscounted": 355.5
        //     }
        //
        const marketId = this.safeString (ticker, 'instrumentID');
        const marketResolved = this.safeEtoroMarket (marketId, undefined, market);
        const timestamp = this.parse8601 (this.safeString (ticker, 'date'));
        const last = this.safeString (ticker, 'lastExecution');
        return this.safeTicker ({
            'symbol': marketResolved['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
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
            'markPrice': undefined,
            'indexPrice': undefined,
            'info': ticker,
        }, marketResolved);
    }

    /**
     * @method
     * @name etoro#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-portal.etoro.com/api-reference/market-data/get-instrument-candle-history.md
     * @see https://api-portal.etoro.com/api-reference/data/get-price-candles-for-an-instrument.md
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, default 100, max 1000 (2000 when since is provided)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {string} [params.side] 'bid', 'ask' or 'both', only used when since is provided, default is 'bid'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const until = this.safeInteger (params, 'until');
        const query = this.omit (params, 'until');
        if ((since === undefined) && (until === undefined)) {
            const candlesCount = (limit === undefined) ? 100 : Math.min (limit, 1000);
            const candlesRequest: Dict = {
                'instrumentId': market['id'],
                'direction': 'desc',
                'interval': this.safeString (this.timeframes, timeframe, timeframe),
                'candlesCount': candlesCount,
            };
            const candlesResponse = await this.publicGetV1MarketDataInstrumentsInstrumentIdHistoryCandlesDirectionIntervalCandlesCount (this.extend (candlesRequest, query));
            //
            //     {
            //         "interval": "OneHour",
            //         "candles": [
            //             {
            //                 "instrumentId": 1001,
            //                 "candles": [
            //                     {
            //                         "instrumentID": 1001,
            //                         "fromDate": "2026-11-26T00:00:00Z",
            //                         "open": 355.2,
            //                         "high": 355.49,
            //                         "low": 354.8,
            //                         "close": 355.1,
            //                         "volume": 11989
            //                     },
            //                 ],
            //                 "rangeOpen": 355.2,
            //                 "rangeClose": 355.2,
            //                 "rangeHigh": 355.49,
            //                 "rangeLow": 354.57,
            //                 "volume": 23633
            //             }
            //         ]
            //     }
            //
            const outer = this.safeList (candlesResponse, 'candles', []);
            const first = this.safeDict (outer, 0, {});
            const candles = this.safeList (first, 'candles', []);
            return this.parseOHLCVs (candles, market, timeframe, since, limit);
        }
        const dataLimit = (limit === undefined) ? 100 : Math.min (limit, 2000);
        const duration = this.parseTimeframe (timeframe) * 1000;
        const request: Dict = {
            'instrumentId': market['id'],
            'interval': timeframe,
            'limit': dataLimit,
        };
        let endTime = until;
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
            if (endTime === undefined) {
                endTime = this.sum (since, duration * dataLimit);
            }
        }
        if (endTime !== undefined) {
            request['to'] = this.iso8601 (endTime);
        }
        const response = await this.publicGetV1DataInstrumentsInstrumentIdCandles (this.extend (request, query));
        //
        //     {
        //         "instrumentId": 1001,
        //         "symbol": "AAPL/USD",
        //         "interval": "1h",
        //         "side": "bid",
        //         "window": { "from": "2026-11-20T00:00:00Z", "to": "2026-11-26T16:15:44.768301Z" },
        //         "pagination": { "limit": 3, "hasNext": true, "nextCursor": "MjAyNi0xMS0yNVQyMjowMDowMCswMDowMA" },
        //         "results": [
        //             {
        //                 "time": "2026-11-26T00:00:00Z",
        //                 "open": "355.2",
        //                 "high": "355.49",
        //                 "low": "354.8",
        //                 "close": "355.1",
        //                 "volume": "11989"
        //             },
        //         ]
        //     }
        //
        const results = this.safeList (response, 'results', []);
        return this.parseOHLCVs (results, market, timeframe, since, dataLimit);
    }

    override parseOHLCV (ohlcv: Dict, market: Market = undefined): OHLCV {
        //
        // market-data candles
        //
        //     {
        //         "instrumentID": 1001,
        //         "fromDate": "2026-11-26T00:00:00Z",
        //         "open": 355.2,
        //         "high": 355.49,
        //         "low": 354.8,
        //         "close": 355.1,
        //         "volume": 11989
        //     }
        //
        // data candles
        //
        //     {
        //         "time": "2026-11-26T00:00:00Z",
        //         "open": "355.2",
        //         "high": "355.49",
        //         "low": "354.8",
        //         "close": "355.1",
        //         "volume": "11989"
        //     }
        //
        return [
            this.parse8601 (this.safeString2 (ohlcv, 'fromDate', 'time')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name etoro#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders and positions
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-a-filtered-aggregated-portfolio-snapshot.md
     * @see https://api-portal.etoro.com/api-reference/trading--demo/get-a-filtered-aggregated-portfolio-snapshot.md
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/?id=balance-structure)
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        await this.loadMarkets ();
        let response = undefined;
        if (this.isSandboxModeEnabled) {
            response = await this.privateGetV1TradingInfoDemoAggregatePortfolio (params);
        } else {
            response = await this.privateGetV1TradingInfoAggregatePortfolio (params);
        }
        return this.parseBalance (response);
    }

    override parseBalance (response: Dict): Balances {
        //
        //     {
        //         "cid": 34374239,
        //         "timestamp": "2026-11-27T10:05:52.527",
        //         "accountCurrency": "USD",
        //         "accountTotals": {
        //             "accountAvailableCash": 99969.01,
        //             "accountAvailableMargin": 99969.01,
        //             "cryptoAvailableMargin": 99969.01,
        //             "accountFrozenCash": 15,
        //             "accountCurrentPnl": 0,
        //             "accountTotalValue": 99984.01,
        //             "accountTotalUsedMargin": 15,
        //             "accountBalance": 99984.01
        //         },
        //         "instrumentAggregates": [ ... ],
        //         "mirrors": []
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (response, 'timestamp'));
        const result: Dict = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const totals = this.safeDict (response, 'accountTotals', {});
        const code = this.safeString (response, 'accountCurrency', 'USD');
        const account = this.account ();
        // the total value includes the cash, the pending orders and the current value of the open positions
        account['free'] = this.safeString (totals, 'accountAvailableCash');
        account['total'] = this.safeString (totals, 'accountTotalValue');
        result[code] = account;
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name etoro#fetchAccounts
     * @description fetch all the accounts associated with a profile, the real (trading) and the demo account
     * @see https://api-portal.etoro.com/api-reference/users-info/get-user-profile-and-account-summary.md
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures](https://docs.ccxt.com/?id=account-structure) indexed by the account type
     */
    override async fetchAccounts (params: Dict = {}): Promise<Account[]> {
        const response = await this.privateGetV1Me (params);
        //
        //     {
        //         "gcid": 11111111,
        //         "realCid": 22222222,
        //         "demoCid": 33333333,
        //         "username": "...",
        //         "scopes": [ "etoro-public:market-data:read", ... ]
        //     }
        //
        const accounts = [];
        const realCid = this.safeString (response, 'realCid');
        if (realCid !== undefined) {
            accounts.push (this.extend (response, { 'accountId': realCid, 'accountType': 'trading' }));
        }
        const demoCid = this.safeString (response, 'demoCid');
        if (demoCid !== undefined) {
            accounts.push (this.extend (response, { 'accountId': demoCid, 'accountType': 'demo' }));
        }
        return this.parseAccounts (accounts, params);
    }

    override parseAccount (account: Dict): Account {
        return {
            'id': this.safeString (account, 'accountId'),
            'type': this.safeString (account, 'accountType'),
            'code': 'USD',
            'info': this.omit (account, [ 'accountId', 'accountType' ]),
        };
    }

    safeEtoroMarket (instrumentId: Str, settlementType: Str = undefined, market: Market = undefined): MarketInterface {
        if ((settlementType === undefined) && (market !== undefined)) {
            return market;
        }
        let marketType = 'swap';
        if (settlementType !== undefined) {
            const lower = settlementType.toLowerCase ();
            if (lower === 'real') {
                marketType = 'spot';
            } else if (lower === 'realfutures') {
                marketType = 'future';
            }
        }
        return this.safeMarket (instrumentId, market, undefined, marketType);
    }

    getSettlementType (market: MarketInterface): string {
        if (market['spot']) {
            return 'real';
        } else if (market['future']) {
            return 'realFutures';
        }
        return 'cfd';
    }

    /**
     * @method
     * @name etoro#createOrder
     * @description create a trade order, only orders opening a position are supported, use closePosition to close one
     * @see https://api-portal.etoro.com/api-reference/trading--real/create-an-order.md
     * @see https://api-portal.etoro.com/api-reference/trading--demo/create-an-order.md
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit', limit orders are immediate-or-cancel within 10% of the market price
     * @param {string} side 'buy' or 'sell', sell opens a short position and is only supported on swap markets
     * @param {float} amount how much of the base currency you want to trade, contracts for futures
     * @param {float} [price] the price for a limit order
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] the amount in USD to invest instead of the amount in base currency
     * @param {float} [params.triggerPrice] the price at which a market-if-touched order is triggered
     * @param {int} [params.leverage] the leverage multiplier, default is 1
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
     * @param {bool} [params.trailing] set to true for a trailing stop loss
     * @param {string} [params.clientOrderId] a uuid sent as the request id, can be used to fetch the order afterwards
     * @param {bool} [params.reduceOnly] set to true to close (a part of) an open position with a market order, see closePosition
     * @param {string} [params.positionId] the id of the position to close, implies reduceOnly
     * @returns {object} an [order structure](https://docs.ccxt.com/?id=order-structure)
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        const positionId = this.safeString (params, 'positionId');
        if (reduceOnly || (positionId !== undefined)) {
            if (type !== 'market') {
                throw new NotSupported (this.id + ' createOrder() supports only market orders to reduce a position');
            }
            const closeParams = this.omit (params, 'reduceOnly');
            if ((amount !== undefined) && !('amount' in closeParams)) {
                closeParams['amount'] = amount;
            }
            return await this.closePosition (symbol, side, closeParams);
        }
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        let response = undefined;
        if (this.isSandboxModeEnabled) {
            response = await this.privatePostV2TradingExecutionDemoOrders (request);
        } else {
            response = await this.privatePostV2TradingExecutionOrders (request);
        }
        //
        //     {
        //         "token": "676aaa4e-a97e-4b2c-8b06-12cf04211fdb",
        //         "orderId": 396858310,
        //         "referenceId": "2c4a382a-9725-40a4-9708-c9dc29e17d21"
        //     }
        //
        const order = this.parseOrder (response, market);
        order['type'] = type;
        order['side'] = side;
        order['amount'] = amount;
        order['price'] = price;
        order['status'] = 'open';
        return order;
    }

    /**
     * @method
     * @ignore
     * @name etoro#createOrderRequest
     * @description helper function to build the request of createOrder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the base currency you want to trade
     * @param {float} [price] the price for a limit order
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} request to be sent to the exchange
     */
    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Dict {
        const market = this.market (symbol);
        let transaction = 'buy';
        if (side === 'sell') {
            if (market['spot']) {
                throw new NotSupported (this.id + ' createOrder() does not support selling spot markets, use closePosition() instead');
            }
            transaction = 'sellShort';
        }
        const request: Dict = {
            'action': 'open',
            'transaction': transaction,
            'instrumentId': this.parseToInt (market['id']),
            'settlementType': this.getSettlementType (market),
        };
        const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        let orderType = 'mkt';
        if (triggerPrice !== undefined) {
            orderType = 'mit';
            request['triggerRate'] = this.parseToNumeric (this.priceToPrecision (symbol, triggerPrice));
        } else if (type === 'limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
            }
            orderType = 'limitIOC';
            request['limitRate'] = this.parseToNumeric (this.priceToPrecision (symbol, price));
        }
        request['orderType'] = orderType;
        const cost = this.safeString (params, 'cost');
        if (cost !== undefined) {
            request['amount'] = this.parseToNumeric (cost);
            request['orderCurrency'] = this.safeString (this.options, 'orderCurrency', 'usd');
        } else if (market['future']) {
            request['contracts'] = this.parseToNumeric (this.amountToPrecision (symbol, amount));
        } else {
            request['units'] = this.parseToNumeric (this.amountToPrecision (symbol, amount));
        }
        const leverage = this.safeInteger (params, 'leverage');
        if (leverage !== undefined) {
            request['leverage'] = leverage;
        }
        const stopLoss = this.safeDict (params, 'stopLoss');
        const takeProfit = this.safeDict (params, 'takeProfit');
        let stopLossPrice = this.safeString (params, 'stopLossPrice');
        if (stopLoss !== undefined) {
            stopLossPrice = this.safeString2 (stopLoss, 'triggerPrice', 'price');
        }
        if (stopLossPrice !== undefined) {
            request['stopLossRate'] = this.parseToNumeric (this.priceToPrecision (symbol, stopLossPrice));
        }
        let takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        if (takeProfit !== undefined) {
            takeProfitPrice = this.safeString2 (takeProfit, 'triggerPrice', 'price');
        }
        if (takeProfitPrice !== undefined) {
            request['takeProfitRate'] = this.parseToNumeric (this.priceToPrecision (symbol, takeProfitPrice));
        }
        const trailing = this.safeBool (params, 'trailing', false);
        if (trailing) {
            request['stopLossType'] = 'trailing';
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['x-request-id'] = clientOrderId;
        }
        const query = this.omit (params, [ 'cost', 'triggerPrice', 'stopPrice', 'leverage', 'stopLoss', 'takeProfit', 'stopLossPrice', 'takeProfitPrice', 'trailing', 'clientOrderId', 'timeInForce' ]);
        return this.extend (request, query);
    }

    /**
     * @method
     * @name etoro#cancelOrder
     * @description cancels an open order that has not been executed yet
     * @see https://api-portal.etoro.com/api-reference/trading--real/cancels-an-order-before-it-is-executed.md
     * @see https://api-portal.etoro.com/api-reference/trading--demo/cancels-an-order-before-it-is-executed.md
     * @see https://api-portal.etoro.com/api-reference/trading--real/cancel-pending-close-order.md
     * @see https://api-portal.etoro.com/api-reference/trading--demo/cancel-pending-demo-close-order.md
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.isCloseOrder] set to true to cancel a pending close order, created by closePosition
     * @returns {object} An [order structure](https://docs.ccxt.com/?id=order-structure)
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const isCloseOrder = this.safeBool (params, 'isCloseOrder', false);
        const query = this.omit (params, 'isCloseOrder');
        const request: Dict = {
            'orderId': id,
        };
        let response = undefined;
        if (isCloseOrder) {
            if (this.isSandboxModeEnabled) {
                response = await this.privateDeleteV1TradingExecutionDemoMarketCloseOrdersOrderId (this.extend (request, query));
            } else {
                response = await this.privateDeleteV1TradingExecutionMarketCloseOrdersOrderId (this.extend (request, query));
            }
            //
            //     {
            //         "token": "bd906f61-7f26-4d26-b90e-f7b109805eb8"
            //     }
            //
        } else {
            if (this.isSandboxModeEnabled) {
                response = await this.privateDeleteV2TradingExecutionDemoOrdersOrderId (this.extend (request, query));
            } else {
                response = await this.privateDeleteV2TradingExecutionOrdersOrderId (this.extend (request, query));
            }
            //
            //     {
            //         "orderId": 396858310,
            //         "referenceId": ""
            //     }
            //
        }
        const order = this.parseOrder (response, market);
        if (order['id'] === undefined) {
            order['id'] = id;
        }
        if (isCloseOrder) {
            order['reduceOnly'] = true;
        }
        order['status'] = 'canceled';
        return order;
    }

    /**
     * @method
     * @name etoro#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-order-information-and-position-details.md
     * @see https://api-portal.etoro.com/api-reference/trading--demo/get-order-information-and-position-details.md
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-close-order-information-and-closed-position-details.md
     * @see https://api-portal.etoro.com/api-reference/trading--demo/get-close-order-information-and-closed-position-details.md
     * @param {string} id the order id, a uuid is treated as the client order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] the client order id (the request id used when the order was created)
     * @param {bool} [params.isCloseOrder] set to true to fetch a close order, created by closePosition
     * @returns {object} An [order structure](https://docs.ccxt.com/?id=order-structure)
     */
    override async fetchOrder (id: Str, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const isCloseOrder = this.safeBool (params, 'isCloseOrder', false);
        const clientOrderId = this.safeString (params, 'clientOrderId');
        const query = this.omit (params, [ 'clientOrderId', 'isCloseOrder' ]);
        if (isCloseOrder) {
            const closeRequest: Dict = {
                'orderId': id,
            };
            let closeResponse = undefined;
            if (this.isSandboxModeEnabled) {
                closeResponse = await this.privateGetV1TradingInfoDemoCloseOrdersOrderId (this.extend (closeRequest, query));
            } else {
                closeResponse = await this.privateGetV1TradingInfoRealCloseOrdersOrderId (this.extend (closeRequest, query));
            }
            return this.parseOrder (closeResponse, market);
        }
        const request: Dict = {};
        if (clientOrderId !== undefined) {
            request['referenceId'] = clientOrderId;
        } else if ((id !== undefined) && (id.indexOf ('-') !== -1)) {
            request['referenceId'] = id;
        } else {
            request['orderId'] = id;
        }
        let response = undefined;
        if (this.isSandboxModeEnabled) {
            response = await this.privateGetV2TradingInfoDemoOrdersLookup (this.extend (request, query));
        } else {
            response = await this.privateGetV2TradingInfoOrdersLookup (this.extend (request, query));
        }
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name etoro#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-instrument-breakdown.md
     * @see https://api-portal.etoro.com/api-reference/trading--demo/get-instrument-breakdown-demo.md
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/?id=order-structure)
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        const request: Dict = {
            'positionLevel': 'None',
            'orderLevel': 'Normal',
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrumentIds'] = market['id'];
        }
        const response = await this.fetchInstrumentBreakdown (this.extend (request, params));
        const instruments = this.safeList (response, 'instruments', []);
        const orders = [];
        for (let i = 0; i < instruments.length; i++) {
            const instrumentOrders = this.safeList (instruments[i], 'orders', []);
            for (let j = 0; j < instrumentOrders.length; j++) {
                orders.push (instrumentOrders[j]);
            }
        }
        const parsed = this.parseOrders (orders, undefined, since, limit);
        const result = [];
        for (let i = 0; i < parsed.length; i++) {
            const order = parsed[i];
            if ((order['status'] === 'open') && ((symbol === undefined) || (order['symbol'] === symbol))) {
                result.push (order);
            }
        }
        return result;
    }

    async fetchInstrumentBreakdown (params: Dict = {}): Promise<Dict> {
        let response = undefined;
        if (this.isSandboxModeEnabled) {
            response = await this.privateGetV2TradingInfoDemoInstrumentBreakdown (params);
        } else {
            response = await this.privateGetV2TradingInfoInstrumentBreakdown (params);
        }
        //
        //     {
        //         "accountCurrency": "USD",
        //         "timestamp": "2026-07-21T09:30:00Z",
        //         "instruments": [
        //             {
        //                 "instrumentId": 1001,
        //                 "symbol": "AAPL",
        //                 "positions": [ ... ],
        //                 "orders": [ ... ]
        //             }
        //         ],
        //         "mirrors": []
        //     }
        //
        return response;
    }

    parseOrderStatus (status: Str) {
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
            'received': 'open',
            'placed': 'open',
            'pendingtriggerrate': 'open',
            'pendingtriggeredrate': 'open',
            'filled': 'closed',
            'rejected': 'rejected',
            'partiallyfilled': 'open',
            'pendingcancel': 'open',
            'canceled': 'canceled',
            'expired': 'expired',
            'canceledpartiallyfilled': 'canceled',
            'rejectedpartiallyfilled': 'rejected',
            'waitingformarket': 'open',
        };
        if (status === undefined) {
            return undefined;
        }
        return this.safeString (statuses, status.toLowerCase (), status);
    }

    parseOrderType (type: Str) {
        const types: Dict = {
            'mkt': 'market',
            'mit': 'market',
            'limitioc': 'limit',
        };
        if (type === undefined) {
            return undefined;
        }
        return this.safeString (types, type.toLowerCase (), type);
    }

    parseOrderSide (transaction: Str) {
        const sides: Dict = {
            'buy': 'buy',
            'buyToCover': 'buy',
            'sell': 'sell',
            'sellShort': 'sell',
        };
        return this.safeString (sides, transaction, transaction);
    }

    parseProtectionRate (rate: Str): Str {
        // etoro uses 0 and 0.01 (or 0.0001) as placeholders for a missing stop loss or take profit
        if ((rate === undefined) || Precise.stringLe (rate, '0.01')) {
            return undefined;
        }
        return rate;
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder
        //
        //     {
        //         "token": "676aaa4e-a97e-4b2c-8b06-12cf04211fdb",
        //         "orderId": 396858310,
        //         "referenceId": "2c4a382a-9725-40a4-9708-c9dc29e17d21"
        //     }
        //
        // fetchOrder
        //
        //     {
        //         "accountId": 34374239,
        //         "orderId": 396858318,
        //         "action": "open",
        //         "transaction": "buy",
        //         "type": "mkt",
        //         "etoroOrderTypeId": 17,
        //         "status": { "id": 3, "name": "Filled", "errorCode": 0 },
        //         "asset": { "symbol": "SIE.DE", "instrumentId": 1200, "currency": "EUR", "settlementType": "REAL", "leverage": 1, "side": "long" },
        //         "orderCurrency": "usd",
        //         "requestedAmount": 15,
        //         "requestedUnits": 0.054469,
        //         "requestedContracts": 0.054469,
        //         "frozenAmount": 16,
        //         "openStopLossRate": 0.01,
        //         "openTakeProfitRate": 0,
        //         "stopLossType": "fixed",
        //         "totalCosts": 1,
        //         "positionsToClose": [],
        //         "positionExecutions": [
        //             {
        //                 "positionId": 3650745937,
        //                 "state": "open",
        //                 "remainingUnits": 0.054469,
        //                 "openingData": {
        //                     "openTime": "2026-11-26T13:49:01.593Z",
        //                     "orderId": 396858318,
        //                     "executionTime": "2026-11-26T13:49:01.707Z",
        //                     "units": 0.054469,
        //                     "contracts": 0.054469,
        //                     "avgPrice": 250.71,
        //                     "avgConversionRate": 1.09824,
        //                     "fees": 1,
        //                     "taxes": 0
        //                 }
        //             }
        //         ],
        //         "requestTime": "2026-11-26T13:49:01.66Z",
        //         "lastUpdate": "2026-11-26T13:49:01.75Z",
        //         "openActionType": "customer",
        //         "requestType": "byAmount"
        //     }
        //
        // fetchOpenOrders (instrument-breakdown)
        //
        //     {
        //         "orderId": 123456789,
        //         "requestTime": "2026-07-20T10:00:00Z",
        //         "transaction": "buy",
        //         "action": "open",
        //         "status": "received",
        //         "type": "mkt",
        //         "eToroOrderTypeId": 19,
        //         "requestType": "byAmount",
        //         "orderCurrency": "USD",
        //         "requestedTriggerRate": null,
        //         "requestedUnits": 0.05,
        //         "requestedContracts": 1,
        //         "requestedAmountAcctCcy": 100,
        //         "openStopLossRate": null,
        //         "openTakeProfitRate": null,
        //         "asset": { "instrumentId": 1001, "symbol": "AAPL", "direction": "long", "settlementType": "real", "leverage": 1, "currency": "USD" }
        //     }
        //
        // closePosition
        //
        //     {
        //         "positionID": 3650745937,
        //         "instrumentID": 1200,
        //         "orderID": 396817494,
        //         "orderType": 19,
        //         "statusID": 1,
        //         "CID": 34374239,
        //         "openDateTime": "2026-11-26T13:49:21.8291957Z",
        //         "lastUpdate": "2026-11-26T13:49:21.8291957Z"
        //     }
        //
        // fetchOrder (close order)
        //
        //     {
        //         "token": "a7300e3a-3f38-4d57-b08c-5de01706f337",
        //         "orderID": 396982481,
        //         "CID": 34374239,
        //         "statusID": 3,
        //         "orderType": 19,
        //         "closeActionType": 0,
        //         "operationType": 2,
        //         "errorCode": 0,
        //         "assetCurrencyID": 2,
        //         "accountCurrencyID": 1,
        //         "instrumentID": 1202,
        //         "requestOccurred": "2026-11-27T10:03:53.21Z",
        //         "proceeds": 14,
        //         "externalOperationType": 0,
        //         "positions": [
        //             {
        //                 "positionID": 3650861095,
        //                 "occurred": "2026-11-27T10:03:53.3Z",
        //                 "rate": 193.89,
        //                 "units": 0.070616,
        //                 "conversionRate": 1.09582,
        //                 "amount": 15
        //             }
        //         ]
        //     }
        //
        let asset = this.safeDict (order, 'asset');
        if (asset === undefined) {
            const assets = this.safeList (order, 'asset', []);
            asset = this.safeDict (assets, 0, {});
        }
        let instrumentId = this.safeString2 (asset, 'instrumentId', 'instrumentID', this.safeString2 (order, 'instrumentID', 'instrumentId'));
        if (instrumentId === '0') {
            // rejected orders can come without an instrument, e.g. {"instrumentId":0,"side":"na","settlementType":"na"}
            instrumentId = undefined;
        }
        const settlementType = this.safeString (asset, 'settlementType');
        const marketResolved = this.safeEtoroMarket (instrumentId, settlementType, market);
        const statusDict = this.safeDict (order, 'status');
        let status: Str = undefined;
        let rejectReason: Str = undefined;
        if (statusDict !== undefined) {
            status = this.parseOrderStatus (this.safeString (statusDict, 'id'));
            const errorCode = this.safeString (statusDict, 'errorCode');
            if ((errorCode !== undefined) && (errorCode !== '0')) {
                rejectReason = errorCode + ' ' + this.safeString (statusDict, 'errorMessage', '');
            }
        } else {
            status = this.parseOrderStatus (this.safeString2 (order, 'status', 'statusID'));
            // close order details report the error at the top level
            const topErrorCode = this.safeString (order, 'errorCode');
            if ((topErrorCode !== undefined) && (topErrorCode !== '0')) {
                rejectReason = topErrorCode + ' ' + this.safeString (order, 'errorMessage', '');
            }
        }
        const timestamp = this.parse8601 (this.safeStringN (order, [ 'requestTime', 'openDateTime', 'requestOccurred' ]));
        const lastUpdateTimestamp = this.parse8601 (this.safeString (order, 'lastUpdate'));
        let rawType = this.safeString (order, 'type');
        const isCloseOrder = (this.safeString (order, 'orderType') === '19');
        if ((rawType === undefined) && isCloseOrder) {
            rawType = 'mkt'; // close orders are market orders
        }
        const triggerPrice = this.safeString2 (order, 'requestedTriggerRate', 'triggerRate');
        let timeInForce: Str = undefined;
        if ((rawType === 'limitIOC') || (rawType === 'limitIoc')) {
            timeInForce = 'IOC';
        }
        let transaction = this.safeString (order, 'transaction');
        if (transaction === 'na') {
            transaction = undefined;
        }
        const action = this.safeString (order, 'action');
        let reduceOnly = (action === 'close');
        if (isCloseOrder) {
            reduceOnly = true;
        }
        let filled: Str = undefined;
        let cost: Str = undefined;
        let feeCost: Str = undefined;
        let lastTradeTimestamp: Int = undefined;
        const executions = this.safeList (order, 'positionExecutions', []);
        const isFuture = (marketResolved !== undefined) && marketResolved['future'];
        for (let i = 0; i < executions.length; i++) {
            // the executions of a close order (websocket) have closingData instead of openingData
            const openingData = this.safeDict2 (executions[i], 'openingData', 'closingData', {});
            let units = this.safeString (openingData, 'units');
            if (isFuture) {
                units = this.safeString (openingData, 'contracts', units);
            }
            const avgPrice = this.safeString (openingData, 'avgPrice');
            if (units !== undefined) {
                filled = (filled === undefined) ? units : Precise.stringAdd (filled, units);
                if (avgPrice !== undefined) {
                    const executionCost = Precise.stringMul (units, avgPrice);
                    cost = (cost === undefined) ? executionCost : Precise.stringAdd (cost, executionCost);
                }
            }
            const fees = this.safeString (openingData, 'fees');
            if (fees !== undefined) {
                feeCost = (feeCost === undefined) ? fees : Precise.stringAdd (feeCost, fees);
            }
            const executionTimestamp = this.parse8601 (this.safeString (openingData, 'executionTime'));
            if ((executionTimestamp !== undefined) && ((lastTradeTimestamp === undefined) || (executionTimestamp > lastTradeTimestamp))) {
                lastTradeTimestamp = executionTimestamp;
            }
        }
        // the positions closed by a close order
        const closedPositions = this.safeList (order, 'positions', []);
        for (let i = 0; i < closedPositions.length; i++) {
            const closedPosition = closedPositions[i];
            const units = this.safeString (closedPosition, 'units');
            const rate = this.safeString (closedPosition, 'rate');
            if (units !== undefined) {
                filled = (filled === undefined) ? units : Precise.stringAdd (filled, units);
                if (rate !== undefined) {
                    const closeCost = Precise.stringMul (units, rate);
                    cost = (cost === undefined) ? closeCost : Precise.stringAdd (cost, closeCost);
                }
            }
            const occurred = this.parse8601 (this.safeString (closedPosition, 'occurred'));
            if ((occurred !== undefined) && ((lastTradeTimestamp === undefined) || (occurred > lastTradeTimestamp))) {
                lastTradeTimestamp = occurred;
            }
        }
        let average: Str = undefined;
        if ((filled !== undefined) && (cost !== undefined) && Precise.stringGt (filled, '0')) {
            average = Precise.stringDiv (cost, filled);
        }
        let amount = this.safeString (order, 'requestedUnits');
        if (isFuture) {
            amount = this.safeString (order, 'requestedContracts', amount);
        }
        if ((amount !== undefined) && Precise.stringEq (amount, '0')) {
            amount = undefined;
        }
        if (transaction === undefined) {
            const direction = this.safeString2 (asset, 'side', 'direction');
            if (direction === 'short') {
                transaction = 'sellShort';
            } else if (direction === 'long') {
                transaction = 'buy';
            }
        }
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeStringUpper (order, 'orderCurrency', 'USD'),
            };
        }
        return this.safeOrder ({
            'id': this.safeString2 (order, 'orderId', 'orderID'),
            'clientOrderId': this.safeString (order, 'referenceId'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': status,
            'symbol': this.safeString (marketResolved, 'symbol'),
            'type': this.parseOrderType (rawType),
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'reduceOnly': reduceOnly,
            'side': this.parseOrderSide (transaction),
            'price': undefined,
            'triggerPrice': triggerPrice,
            'stopLossPrice': this.parseProtectionRate (this.safeString (order, 'openStopLossRate')),
            'takeProfitPrice': this.parseProtectionRate (this.safeString (order, 'openTakeProfitRate')),
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': cost,
            'average': average,
            'trades': undefined,
            'fee': fee,
            'info': order,
            'rejectReason': rejectReason,
        }, marketResolved);
    }

    /**
     * @method
     * @name etoro#fetchPositions
     * @description fetch all open positions, including the unleveraged (spot) holdings
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-instrument-breakdown.md
     * @see https://api-portal.etoro.com/api-reference/trading--demo/get-instrument-breakdown-demo.md
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure](https://docs.ccxt.com/?id=position-structure)
     */
    override async fetchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const marketSymbolsList = this.marketSymbols (symbols);
        const request: Dict = {
            'positionLevel': 'Normal',
            'orderLevel': 'None',
        };
        const response = await this.fetchInstrumentBreakdown (this.extend (request, params));
        const instruments = this.safeList (response, 'instruments', []);
        const positions = [];
        for (let i = 0; i < instruments.length; i++) {
            const instrumentPositions = this.safeList (instruments[i], 'positions', []);
            for (let j = 0; j < instrumentPositions.length; j++) {
                positions.push (instrumentPositions[j]);
            }
        }
        const result = this.parsePositions (positions);
        return this.filterByArrayPositions (result, 'symbol', marketSymbolsList);
    }

    /**
     * @method
     * @name etoro#fetchPosition
     * @description fetch data on an open position
     * @see https://api-portal.etoro.com/api-reference/trading--real/get-instrument-breakdown.md
     * @see https://api-portal.etoro.com/api-reference/trading--demo/get-instrument-breakdown-demo.md
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionId] the id of the position, required if there is more than one position for the symbol
     * @returns {object} a [position structure](https://docs.ccxt.com/?id=position-structure)
     */
    override async fetchPosition (symbol: string, params: Dict = {}): Promise<Position> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const positionId = this.safeString (params, 'positionId');
        const query = this.omit (params, 'positionId');
        const positions = await this.fetchPositions ([ market['symbol'] ], query);
        const numPositions = positions.length;
        if (positionId !== undefined) {
            for (let i = 0; i < numPositions; i++) {
                if (positions[i]['id'] === positionId) {
                    return positions[i];
                }
            }
            throw new BadRequest (this.id + ' fetchPosition() could not find an open position with id ' + positionId + ' for ' + market['symbol']);
        }
        if (numPositions === 0) {
            throw new BadRequest (this.id + ' fetchPosition() could not find an open position for ' + market['symbol']);
        }
        // etoro positions are hedged, the earliest one is returned when there are several, use positionId or fetchPositions to get a specific one
        return positions[0];
    }

    override parsePosition (position: Dict, market: Market = undefined): Position {
        //
        //     {
        //         "redeemEligibility": "notAllowed",
        //         "positionId": 2150896073,
        //         "symbol": "AAPL",
        //         "instrumentId": 1001,
        //         "assetCurrency": "USD",
        //         "settlementType": "real",
        //         "direction": "long",
        //         "leverage": 1,
        //         "isSettled": true,
        //         "openTime": "2026-07-01T13:45:00Z",
        //         "openRate": 2020.7784,
        //         "openConversionRate": 1,
        //         "totalFeesAcctCcy": 0.5,
        //         "totalTaxesAcctCcy": 0,
        //         "takeProfitRate": null,
        //         "stopLossRate": 0.0001,
        //         "stopLossType": "fixed",
        //         "units": 0.049485,
        //         "contracts": 1,
        //         "marginAcctCcy": 100,
        //         "margin": 100,
        //         "addedFundsAcctCcy": 0,
        //         "addedFunds": 0,
        //         "overnightFeesAndDividends": 0,
        //         "currentRate": 2035.12,
        //         "currentConversionRate": 1,
        //         "rateTimestamp": "2026-07-21T09:29:58Z",
        //         "currentExposure": 100.71,
        //         "currentExposureAcctCcy": 100.71,
        //         "acctCcyReturn": 0.71,
        //         "acctCcyRoePercent": 0.71,
        //         "liquidationValueAcctCcy": 100.71,
        //         "liquidationValue": 100.71,
        //         "pnl": 0.71,
        //         "pnlPercent": 0.71,
        //         "fxValueImpact": 0,
        //         "roePercent": 0.71
        //     }
        //
        const instrumentId = this.safeString (position, 'instrumentId');
        const settlementType = this.safeString (position, 'settlementType');
        const marketResolved = this.safeEtoroMarket (instrumentId, settlementType, market);
        const timestamp = this.parse8601 (this.safeString (position, 'openTime'));
        let contracts = this.safeString (position, 'units');
        if (marketResolved['future']) {
            contracts = this.safeString (position, 'contracts', contracts);
        }
        const margin = this.safeString (position, 'margin');
        const leverage = this.safeString (position, 'leverage');
        let initialMarginPercentage: Str = undefined;
        if ((leverage !== undefined) && !Precise.stringEq (leverage, '0')) {
            initialMarginPercentage = Precise.stringDiv ('1', leverage);
        }
        const exposure = this.safeString (position, 'currentExposure');
        let notional: Str = undefined;
        if (exposure !== undefined) {
            notional = Precise.stringAbs (exposure);
        }
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'positionId'),
            'symbol': marketResolved['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': this.parse8601 (this.safeString (position, 'rateTimestamp')),
            'initialMargin': this.parseNumber (margin),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.safeNumber (position, 'openRate'),
            'notional': this.parseNumber (notional),
            'leverage': this.parseNumber (leverage),
            'unrealizedPnl': this.safeNumber (position, 'pnl'),
            'realizedPnl': undefined,
            'contracts': this.parseNumber (contracts),
            'contractSize': this.safeNumber (marketResolved, 'contractSize', this.parseNumber ('1')),
            'marginRatio': undefined,
            'liquidationPrice': undefined,
            'markPrice': this.safeNumber (position, 'currentRate'),
            'lastPrice': undefined,
            'collateral': this.parseNumber (margin),
            'marginMode': 'isolated',
            'side': this.safeString (position, 'direction'),
            'percentage': this.safeNumber (position, 'pnlPercent'),
            'hedged': true,
            'stopLossPrice': this.parseNumber (this.parseProtectionRate (this.safeString (position, 'stopLossRate'))),
            'takeProfitPrice': this.parseNumber (this.parseProtectionRate (this.safeString (position, 'takeProfitRate'))),
        });
    }

    /**
     * @method
     * @name etoro#closePosition
     * @description closes an open position with a market order
     * @see https://api-portal.etoro.com/api-reference/trading--real/close-position-by-units.md
     * @see https://api-portal.etoro.com/api-reference/trading--demo/close-demo-position-by-units.md
     * @param {string} symbol unified market symbol
     * @param {string} [side] 'buy' or 'sell', the side of the closing order, selects a long (sell) or a short (buy) position when positionId is not provided
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionId] the id of the position to close, required if there is more than one matching position for the symbol
     * @param {float} [params.amount] the amount of units to close, the whole position is closed by default
     * @returns {object} an [order structure](https://docs.ccxt.com/?id=order-structure)
     */
    override async closePosition (symbol: string, side: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let positionId = this.safeString (params, 'positionId');
        const amount = this.safeString (params, 'amount');
        const query = this.omit (params, [ 'positionId', 'amount' ]);
        let closeSide = side;
        if (positionId === undefined) {
            const positions = await this.fetchPositions ([ symbol ]);
            let positionSide: Str = undefined;
            if (side === 'buy') {
                positionSide = 'short';
            } else if (side === 'sell') {
                positionSide = 'long';
            }
            const matching = [];
            for (let i = 0; i < positions.length; i++) {
                const position = positions[i];
                if ((positionSide === undefined) || (position['side'] === positionSide)) {
                    matching.push (position);
                }
            }
            const numPositions = matching.length;
            if (numPositions === 0) {
                throw new InvalidOrder (this.id + ' closePosition() could not find an open position for ' + symbol);
            }
            if (numPositions > 1) {
                throw new ArgumentsRequired (this.id + ' closePosition() requires a positionId parameter, there is more than one open position for ' + symbol);
            }
            positionId = this.safeString (matching[0], 'id');
            if (closeSide === undefined) {
                closeSide = (this.safeString (matching[0], 'side') === 'short') ? 'buy' : 'sell';
            }
        }
        const request: Dict = {
            'positionId': positionId,
            'InstrumentID': this.parseToInt (market['id']),
        };
        if (amount !== undefined) {
            request['UnitsToDeduct'] = this.parseToNumeric (this.amountToPrecision (symbol, amount));
        }
        let response = undefined;
        if (this.isSandboxModeEnabled) {
            response = await this.privatePostV1TradingExecutionDemoMarketCloseOrdersPositionsPositionId (this.extend (request, query));
        } else {
            response = await this.privatePostV1TradingExecutionMarketCloseOrdersPositionsPositionId (this.extend (request, query));
        }
        //
        //     {
        //         "orderForClose": {
        //             "positionID": 3650745937,
        //             "instrumentID": 1200,
        //             "orderID": 396817494,
        //             "orderType": 19,
        //             "statusID": 1,
        //             "CID": 34374239,
        //             "openDateTime": "2026-11-26T13:49:21.8291957Z",
        //             "lastUpdate": "2026-11-26T13:49:21.8291957Z"
        //         },
        //         "token": "bd906f61-7f26-4d26-b90e-f7b109805eb8"
        //     }
        //
        const orderForClose = this.safeDict (response, 'orderForClose', {});
        const order = this.parseOrder (orderForClose, market);
        order['side'] = closeSide;
        order['type'] = 'market';
        order['reduceOnly'] = true;
        return order;
    }

    /**
     * @method
     * @name etoro#editPosition
     * @description changes the stop loss and the take profit of an open position
     * @see https://api-portal.etoro.com/api-reference/trading--real/modify-stop-loss-and-take-profit-settings-on-an-open-position.md
     * @see https://api-portal.etoro.com/api-reference/trading--demo/modify-stop-loss-and-take-profit-settings-on-an-open-position.md
     * @param {string} positionId the id of the position
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.stopLossPrice] the new stop loss price
     * @param {float} [params.takeProfitPrice] the new take profit price
     * @param {bool} [params.trailing] set to true for a trailing stop loss
     * @returns {object} the response from the exchange
     */
    async editPosition (positionId: string, params: Dict = {}): Promise<Dict> {
        const request: Dict = {
            'positionId': positionId,
        };
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        if (stopLossPrice !== undefined) {
            request['stopLossRate'] = this.parseToNumeric (stopLossPrice);
        }
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        if (takeProfitPrice !== undefined) {
            request['takeProfitRate'] = this.parseToNumeric (takeProfitPrice);
        }
        const trailing = this.safeBool (params, 'trailing');
        if (trailing !== undefined) {
            request['stopLossType'] = trailing ? 'trailing' : 'fixed';
        }
        const query = this.omit (params, [ 'stopLossPrice', 'takeProfitPrice', 'trailing' ]);
        let response = undefined;
        if (this.isSandboxModeEnabled) {
            response = await this.privatePatchV2TradingDemoPositionsPositionId (this.extend (request, query));
        } else {
            response = await this.privatePatchV2TradingPositionsPositionId (this.extend (request, query));
        }
        //
        //     {
        //         "operationId": "...",
        //         "positionId": 3650745937,
        //         "referenceId": "..."
        //     }
        //
        return response;
    }

    async fetchTradeHistory (since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<List> {
        let sinceResolved = since;
        if (sinceResolved === undefined) {
            const daysBack = this.safeInteger (this.options, 'fetchMyTradesDaysBack', 364);
            sinceResolved = this.milliseconds () - daysBack * 86400000;
        }
        const request: Dict = {
            'minDate': this.yyyymmdd (sinceResolved, '-'),
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let response = undefined;
        if (this.isSandboxModeEnabled) {
            response = await this.privateGetV1TradingInfoTradeDemoHistory (this.extend (request, params));
        } else {
            response = await this.privateGetV1TradingInfoTradeHistory (this.extend (request, params));
        }
        //
        //     [
        //         {
        //             "netProfit": 0,
        //             "closeRate": 250.66,
        //             "closeTimestamp": "2026-11-26T13:49:21.92Z",
        //             "positionId": 3650745937,
        //             "instrumentId": 1200,
        //             "isBuy": true,
        //             "leverage": 1,
        //             "openRate": 250.71,
        //             "openTimestamp": "2026-11-26T13:49:01.707Z",
        //             "stopLossRate": 0.01,
        //             "takeProfitRate": 0,
        //             "trailingStopLoss": false,
        //             "orderId": 396858318,
        //             "socialTradeId": 0,
        //             "parentPositionId": 0,
        //             "investment": 15,
        //             "initialInvestment": 15,
        //             "fees": 0,
        //             "units": 0.054469
        //         }
        //     ]
        //
        return response;
    }

    /**
     * @method
     * @name etoro#fetchMyTrades
     * @description fetch the opening and closing fills of closed positions
     * @see https://api-portal.etoro.com/api-reference/trading--real/list-trading-history.md
     * @see https://api-portal.etoro.com/api-reference/trading--demo/list-trading-history.md
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for, default is 364 days ago
     * @param {int} [limit] the maximum number of closed positions to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.page] the page number
     * @returns {Trade[]} a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.fetchTradeHistory (since, limit, params);
        const trades = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const openTrade = this.extend (entry, { 'tradeSide': 'open' });
            const closeTrade = this.extend (entry, { 'tradeSide': 'close' });
            trades.push (openTrade);
            trades.push (closeTrade);
        }
        const result = this.parseTrades (trades, undefined, since, undefined);
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, (market === undefined) ? undefined : market['symbol'], since, limit);
    }

    marketFromHistoryEntry (entry: Dict, market: Market = undefined): MarketInterface {
        const instrumentId = this.safeString (entry, 'instrumentId');
        if (market !== undefined) {
            return market;
        }
        // the history does not include the settlement type, unleveraged long stocks, etfs and crypto are real assets
        const isBuy = this.safeBool (entry, 'isBuy');
        const leverage = this.safeString (entry, 'leverage');
        let settlementType = 'cfd';
        if (isBuy && (leverage === '1')) {
            const spotMarket = this.safeMarket (instrumentId, undefined, undefined, 'spot');
            if (spotMarket['spot']) {
                settlementType = 'real';
            }
        }
        return this.safeEtoroMarket (instrumentId, settlementType);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchMyTrades: a closed position extended with the tradeSide, see fetchTradeHistory
        //
        const marketResolved = this.marketFromHistoryEntry (trade, market);
        const isOpen = (this.safeString (trade, 'tradeSide') === 'open');
        const isBuy = this.safeBool (trade, 'isBuy');
        let side: Str = undefined;
        let price: Str = undefined;
        let timestamp: Int = undefined;
        if (isOpen) {
            side = isBuy ? 'buy' : 'sell';
            price = this.safeString (trade, 'openRate');
            timestamp = this.parse8601 (this.safeString (trade, 'openTimestamp'));
        } else {
            side = isBuy ? 'sell' : 'buy';
            price = this.safeString (trade, 'closeRate');
            timestamp = this.parse8601 (this.safeString (trade, 'closeTimestamp'));
        }
        const positionId = this.safeString (trade, 'positionId');
        let fee = undefined;
        if (!isOpen) {
            fee = {
                'cost': this.safeString (trade, 'fees'),
                'currency': 'USD',
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': positionId + '-' + this.safeString (trade, 'tradeSide'),
            'order': isOpen ? this.safeString (trade, 'orderId') : undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': marketResolved['symbol'],
            'type': 'market',
            'side': side,
            'takerOrMaker': 'taker',
            'price': price,
            'amount': this.safeString (trade, 'units'),
            'cost': undefined,
            'fee': fee,
        }, marketResolved);
    }

    /**
     * @method
     * @name etoro#fetchPositionsHistory
     * @description fetches historical (closed) positions
     * @see https://api-portal.etoro.com/api-reference/trading--real/list-trading-history.md
     * @see https://api-portal.etoro.com/api-reference/trading--demo/list-trading-history.md
     * @param {string[]} [symbols] unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for, default is 364 days ago
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.page] the page number
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/?id=position-structure)
     */
    override async fetchPositionsHistory (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const marketSymbolsList = this.marketSymbols (symbols);
        const response = await this.fetchTradeHistory (since, limit, params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            result.push (this.parseHistoryPosition (response[i]));
        }
        const sorted = this.sortBy (result, 'timestamp');
        const filtered = this.filterByArrayPositions (sorted, 'symbol', marketSymbolsList);
        return this.filterBySinceLimit (filtered, since, limit);
    }

    parseHistoryPosition (position: Dict, market: Market = undefined): Position {
        //
        // see fetchTradeHistory
        //
        const marketResolved = this.marketFromHistoryEntry (position, market);
        const timestamp = this.parse8601 (this.safeString (position, 'openTimestamp'));
        const isBuy = this.safeBool (position, 'isBuy');
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'positionId'),
            'symbol': marketResolved['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': this.parse8601 (this.safeString (position, 'closeTimestamp')),
            'initialMargin': this.safeNumber (position, 'initialInvestment'),
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.safeNumber (position, 'openRate'),
            'notional': undefined,
            'leverage': this.safeNumber (position, 'leverage'),
            'unrealizedPnl': undefined,
            'realizedPnl': this.safeNumber (position, 'netProfit'),
            'contracts': this.safeNumber (position, 'units'),
            'contractSize': this.safeNumber (marketResolved, 'contractSize', this.parseNumber ('1')),
            'marginRatio': undefined,
            'liquidationPrice': undefined,
            'markPrice': undefined,
            'lastPrice': this.safeNumber (position, 'closeRate'),
            'collateral': this.safeNumber (position, 'investment'),
            'marginMode': 'isolated',
            'side': isBuy ? 'long' : 'short',
            'percentage': undefined,
            'hedged': true,
            'stopLossPrice': this.parseNumber (this.parseProtectionRate (this.safeString (position, 'stopLossRate'))),
            'takeProfitPrice': this.parseNumber (this.parseProtectionRate (this.safeString (position, 'takeProfitRate'))),
        });
    }

    override sign (path: string, api: string[] = [ 'public' ], method: string = 'GET', params: Dict = {}): Dict {
        let url = this.urls['api']['rest'] + '/api/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        // the request id doubles as the client order id of the created orders
        let requestId = this.safeString (query, 'x-request-id');
        query = this.omit (query, 'x-request-id');
        if (requestId === undefined) {
            requestId = this.uuid ();
        }
        // all endpoints, including the market data, require the api key and the user key
        this.checkRequiredCredentials ();
        const headers: Dict = {
            'x-request-id': requestId,
            'x-api-key': this.apiKey,
            'x-user-key': this.secret,
        };
        let body: Str = undefined;
        if ((method === 'GET') || (method === 'DELETE')) {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            headers['Content-Type'] = 'application/json';
            body = this.json (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: NullableDict, requestBody: Str) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     {"errorCode":"Unauthorized","errorMessage":"Unauthorized"}
        //     {"message":"Instrument not found for ID: 99999999"}
        //     {"errors":{"units":["Exactly one of amount, units, or contracts must be provided"]},"type":"...","title":"One or more validation errors occurred.","status":400,"traceId":"..."}
        //     {"success":false,"error":{"code":"...","message":"..."}}
        //     {"type":"...","title":"...","status":404,"detail":"..."}
        //
        if (code < 400) {
            if (!this.isDictionary (response)) {
                return undefined;
            }
            const success = this.safeBool (response, 'success');
            if (success !== false) {
                return undefined;
            }
        }
        const feedback = this.id + ' ' + body;
        const error = this.safeDict (response, 'error', {});
        const errorCode = this.safeStringN (response, [ 'errorCode', 'code' ], this.safeString (error, 'code'));
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
        if (code === 404) {
            if (url.indexOf ('orders') !== -1) {
                throw new OrderNotFound (feedback);
            }
            throw new BadRequest (feedback);
        }
        if (code === 401) {
            throw new AuthenticationError (feedback);
        }
        if (code === 403) {
            throw new PermissionDenied (feedback);
        }
        if (code === 429) {
            throw new RateLimitExceeded (feedback);
        }
        if (code >= 500) {
            throw new ExchangeNotAvailable (feedback);
        }
        if (code === 400) {
            throw new BadRequest (feedback);
        }
        throw new ExchangeError (feedback);
    }
}
