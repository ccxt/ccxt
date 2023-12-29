
//  ---------------------------------------------------------------------------

import Exchange from './abstract/oanda.js';
// @ts-ignore
import { ExchangeError, ExchangeNotAvailable, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, NetworkError, InsufficientFunds, InvalidNonce, CancelPending, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, AccountNotEnabled, BadSymbol, RateLimitExceeded, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class oanda
 * @augments Exchange
 */
export default class oanda extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'oanda',
            'name': 'Oanda',
            // Crypto is offered to the following OANDA divisions:
            //    OANDA Global Markets
            //    OANDA Europe Markets (but not OANDA Europe Limited)
            //    OANDA Australia
            //    OANDA Asia Pacific.
            'countries': [ 'EN' ], // England
            'rateLimit': 8.34, // https://developer.oanda.com/rest-live-v20/development-guide/
            'version': 'v3',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'editOrder': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedPositions': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrdersByIds': true,
                'fetchOrderTrades': true,
                'fetchPosition': true, // removed because of emulation, will be implemented in base later
                'fetchPositions': true,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchWithdrawals': false,
                'private': true,
                'public': false,
                'reduceMargin': false,
                'setLeverage': true,
                'setMarginMode': false,
                'withdraw': false,
            },
            'timeframes': {
                '5s': 'S5',
                '10s': 'S10',
                '15s': 'S15',
                '30s': 'S30',
                '1m': 'M1',
                '2m': 'M2',
                '4m': 'M4',
                '5m': 'M5',
                '10m': 'M10',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '2h': 'H2',
                '3h': 'H3',
                '4h': 'H4',
                '6h': 'H6',
                '8h': 'H8',
                '12h': 'H12',
                '1d': 'D',
                '1w': 'W',
                '1M': 'M',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api-fxtrade.oanda.com',
                    'private': 'https://api-fxtrade.oanda.com',
                },
                'test': {
                    'public': 'https://api-fxpractice.oanda.com',
                    'private': 'https://api-fxpractice.oanda.com',
                },
                'www': 'https://www.oanda.com/',
                'doc': [
                    'https://developer.oanda.com/',
                    'https://oanda-api-v20.readthedocs.io/',
                ],
                'fees': [
                    'https://www.oanda.com/bvi-en/cfds/our-pricing/',
                ],
                'referral': '',
            },
            'api': {
                'public': {
                    'get': {
                    },
                },
                // apikey (account id) - https://www.oanda.com/funding/
                // secret - https://www.oanda.com/account/tpa/personal_token
                'private': {
                    'get': {
                        'accounts': 1,
                        'accounts/{accountID}': 1,
                        'accounts/{accountID}/summary': 1, // example response: same as above, but without 'trades'|'orders'|'positions' properties
                        'accounts/{accountID}/instruments': 1,
                        'accounts/{accountID}/changes': 1,
                        'instruments/{instrument}/candles': 1,
                        'instruments/{instrument}/orderBook': 1,
                        'instruments/{instrument}/positionBook': 1,
                        'instruments/{instrument}/recentHourlyOrderBooks': 1, // undocumented, as they have incomplete api
                        'instruments/{instrument}/recentHourlyPositionBooks': 1, // undocumented, as they have incomplete api
                        'accounts/{accountID}/orders': 1,
                        'accounts/{accountID}/pendingOrders': 1, // TO_DO
                        'accounts/{accountID}/orders/{orderSpecifier}': 1,
                        'accounts/{accountID}/trades': 1,
                        'accounts/{accountID}/trades/{tradeSpecifier}': 1,
                        'accounts/{accountID}/positions': 1,
                        'accounts/{accountID}/openPositions': 1,
                        'accounts/{accountID}/positions/{instrument}': 1,
                        'accounts/{accountID}/transactions': 1,
                        'accounts/{accountID}/transactions/{transactionID}': 1,
                        'accounts/{accountID}/transactions/idrange': 1,
                        'accounts/{accountID}/transactions/sinceid': 1,
                        'accounts/{accountID}/transactions/stream': 1,
                        'accounts/{accountID}/candles/latest': 1, // unclear difference compared to 'instrument/candles'
                        'accounts/{accountID}/pricing': 1,
                        'accounts/{accountID}/instruments/{instrument}/candles': 1, // unclear difference compared to 'instrument/candles'
                    },
                    'patch': {
                        'accounts/{accountID}/configuration': 1,
                    },
                    'post': {
                        'accounts/{accountID}/orders': 1,
                    },
                    'put': {
                        'accounts/{accountID}/orders/{orderSpecifier}': 1, // replace order (cancels & recreates)
                        'accounts/{accountID}/orders/{orderSpecifier}/cancel': 1,
                        'accounts/{accountID}/orders/{orderSpecifier}/clientExtensions': 1,
                        'accounts/{accountID}/trades/{tradeSpecifier}/close': 1,
                        'accounts/{accountID}/trades/{tradeSpecifier}/clientExtensions': 1,
                        'accounts/{accountID}/trades/{tradeSpecifier}/orders': 1,
                        'accounts/{accountID}/positions/{instrument}/close': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    // 'maker': 0.2 / 100,
                    // 'taker': 0.2 / 100,
                },
            },
            'options': {
                // Oanda has a buggy/incomplete api endpoint. They do return instruments, that work with some endpoints (also in UI charts, like CN50/USD: https://trade.oanda.com/ ) but, some of those instruments are not available for orderbooks, and from API, there is no way to find out which symbols have orderbooks and which doesn't have. So, I've hardcoded them according to the list from their Web-UI.
                'allowedOrdebookSymbols': [ 'AUD/JPY', 'AUD/USD', 'EUR/AUD', 'EUR/CHF', 'EUR/GBP', 'EUR/JPY', 'EUR/USD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'NZD/USD', 'USD/CAD', 'USD/CHF', 'USD/JPY', 'XAU/USD', 'XAG/USD' ],
            },
            'requiredCredentials': {
                'apiKey': true, // this needs to be an account-id
                'secret': true, // this needs to be a 'secret-token'
            },
            'commonCurrencies': {
            },
            'exceptions': {
                // https://developer.oanda.com/rest-live-v20/transaction-df/
                'exact': {
                    'UNITS_INVALID': BadRequest, // {"orderRejectTransaction":{"id":"64","accountID":"001-004-123456-001","userID":123456,"batchID":"64","requestID":"24910393117751396","time":"2022-02-06T07:40:36.837630106Z","type":"LIMIT_ORDER_REJECT","instrument":"EUR_USD","units":"0","price":"1212","timeInForce":"GTC","triggerCondition":"DEFAULT","partialFill":"DEFAULT","positionFill":"DEFAULT","reason":"CLIENT_ORDER","rejectReason":"UNITS_INVALID"},"relatedTransactionIDs":["64"],"lastTransactionID":"64","errorMessage":"Order units specified are invalid","errorCode":"UNITS_INVALID"}
                    'PRICE_INVALID': BadRequest,
                    'UNITS_LIMIT_EXCEEDED': BadRequest,
                    'oanda::rest::core::InvalidParameterException': BadRequest,
                    'ORDER_DOESNT_EXIST': OrderNotFound,
                    'NO_SUCH_ORDER': OrderNotFound,
                    'INVALID_PAGESIZE': BadRequest,
                    'MARGIN_RATE_INVALID': BadRequest,
                },
                'broad': {
                    'Maximum value for ': BadRequest, // {"errorMessage":"Maximum value for 'count' exceeded"}
                    "Invalid value specified for 'instrument'": BadSymbol, // {"errorMessage":"Invalid value specified for 'instrument'"}
                    'Invalid value specified for ': BadRequest, // {"errorMessage":"Invalid value specified for 'from'"}
                    ' is not a valid instrument.': BadSymbol,
                    'Invalid Instrument ': BadSymbol,
                    'The request was missing required data': BadRequest,
                    'The provided request was forbidden': AuthenticationError,
                    'Insufficient authorization to perform request': AuthenticationError,
                    'The order ID specified does not exist': OrderNotFound,
                    'The trade ID specified does not exist': BadRequest,
                    'The transaction ID specified does not exist': BadRequest,
                    'The units specified exceeds the maximum number of units allowed': BadRequest,
                    'The Order specified does not exist': OrderNotFound,
                    'The specified page size is invalid': BadRequest,
                    'The margin rate provided is invalid': BadRequest,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name oanda#fetchMarkets
         * @description retrieves data on all markets for this exchange
         * @see https://developer.oanda.com/rest-live-v20/account-ep/
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        // possible 'type' param: 'CURRENCY', 'CFD', 'METAL'
        const response = await this.privateGetAccountsAccountIDInstruments (params);
        //
        //     {
        //         instruments: [
        //             {
        //                 name: 'GBP_CAD',
        //                 type: 'CURRENCY',
        //                 displayName: 'GBP/CAD',
        //                 pipLocation: '-4',
        //                 displayPrecision: '5',
        //                 tradeUnitsPrecision: '0',
        //                 minimumTradeSize: '1',
        //                 maximumTrailingStopDistance: '1.00000',
        //                 minimumTrailingStopDistance: '0.00050',
        //                 maximumPositionSize: '0',
        //                 maximumOrderUnits: '100000000',
        //                 marginRate: '0.0333',
        //                 guaranteedStopLossOrderMode: 'ALLOWED',
        //                 minimumGuaranteedStopLossDistance: '0.0010',
        //                 guaranteedStopLossOrderExecutionPremium: '0.00050',
        //                 guaranteedStopLossOrderLevelRestriction: { volume: '1000000', priceRange: '0.00250' },
        //                 tags: [ { type: 'ASSET_CLASS', name: 'CURRENCY' } ],
        //                 financing: {
        //                     longRate: '-0.0105',
        //                     shortRate: '-0.0145',
        //                     financingDaysOfWeek: [
        //                         { dayOfWeek: 'MONDAY', daysCharged: '1' },
        //                         { dayOfWeek: 'TUESDAY', daysCharged: '1' },
        //                         { dayOfWeek: 'WEDNESDAY', daysCharged: '3' },
        //                         { dayOfWeek: 'THURSDAY', daysCharged: '1' },
        //                         { dayOfWeek: 'FRIDAY', daysCharged: '1' },
        //                         { dayOfWeek: 'SATURDAY', daysCharged: '0' },
        //                         { dayOfWeek: 'SUNDAY', daysCharged: '0' }
        //                     ]
        //                 }
        //             },
        //         ]
        //         lastTransactionID: '3'
        //     }
        //
        const data = this.safeValue (response, 'instruments');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'name');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const type = 'spot';
            result.push ({
                'id': id,
                'lowercaseId': id.toLowerCase (),
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': type,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'active': true,
                'option': false,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.safeNumber (market, 'takerFee'),
                'maker': this.safeNumber (market, 'makerFee'),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'tradeUnitsPrecision'),
                    'price': this.safeNumber (market, 'displayPrecision'),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeString (market, 'minimumTradeSize'),
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
                'info': market,
                'created': undefined,
            });
        }
        return result;
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name oanda#fetchOHLCV
         * @see https://developer.oanda.com/rest-live-v20/instrument-ep/
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
            'granularity': this.timeframes[timeframe],
            'price': 'BMA', // https://developer.oanda.com/rest-live-v20/primitives-df/#PricingComponent
        };
        // from & to : 'RFC 3339' or 'UNIX' format
        if (since !== undefined) {
            const start = Math.round (since / 1000);
            request['from'] = start.toString;
        }
        if (limit !== undefined) {
            request['count'] = Math.min (limit, 5000);
        }
        const response = await this.privateGetInstrumentsInstrumentCandles (this.extend (request, params));
        //
        //     {
        //         instrument: 'GBP_USD',
        //         granularity: 'S5',
        //         candles: [
        //             {
        //                 complete: true, // might be false to last current bar
        //                 volume: '1',
        //                 time: '2022-02-02T14:13:40.000000000Z',
        //                 bid: { o: '1.35594', h: '1.35595', l: '1.35590', c: '1.35591' }, // if 'B' flag used
        //                 mid: { o: '1.35600', h: '1.35602', l: '1.35596', c: '1.35598' }, // if 'M' flag used
        //                 ask: { o: '1.35607', h: '1.35608', l: '1.35602', c: '1.35604' }  // if 'A' flag used
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'candles', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         complete: true, // might be false to last current bar
        //         volume: '1',
        //         time: '2022-02-02T14:13:40.000000000Z',
        //         bid: { o: '1.35594', h: '1.35595', l: '1.35590', c: '1.35591' }, // if 'B' flag used
        //         mid: { o: '1.35600', h: '1.35602', l: '1.35596', c: '1.35598' }, // if 'M' flag used
        //         ask: { o: '1.35607', h: '1.35608', l: '1.35602', c: '1.35604' }  // if 'A' flag used
        //     }
        //
        const dateString = this.safeString (ohlcv, 'time');
        const timestamp = this.parseDate (dateString);
        const bidObject = this.safeValue (ohlcv, 'bid');
        const askObject = this.safeValue (ohlcv, 'ask');
        const midObject = this.safeValue (ohlcv, 'mid');
        return [
            timestamp,
            this.safeNumber (midObject, 'o'),
            this.safeNumber (askObject, 'h'),
            this.safeNumber (bidObject, 'l'),
            this.safeNumber (midObject, 'c'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (path.indexOf ('{accountID}') >= 0) { // when accountID is in path, but not provided, use the default one
            params['accountID'] = this.safeValue (params, 'accountID', this.apiKey);
        }
        let url = this.urls['api'][api] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET' && Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            if (method !== 'GET') {
                body = this.json (query);
            }
            headers = {
                'Authorization': 'Bearer ' + this.secret,
                'Content-Type': 'application/json',
                'timestamp': timestamp,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
        }
        const errorMessage = this.safeString (response, 'errorMessage', '');
        const errorCode = this.safeString (response, 'errorCode', '');
        if (errorMessage !== '') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
}
