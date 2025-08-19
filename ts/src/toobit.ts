//  ---------------------------------------------------------------------------

import Exchange from './abstract/toobit.js';
import { AuthenticationError, ExchangeNotAvailable, OnMaintenance, AccountSuspended, PermissionDenied, RateLimitExceeded, InvalidNonce, InvalidAddress, ArgumentsRequired, ExchangeError, InvalidOrder, InsufficientFunds, BadRequest, OrderNotFound, BadSymbol, NotSupported, NetworkError } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE, TRUNCATE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Int, OrderSide, Balances, OrderType, OHLCV, Order, Str, Trade, Transaction, Ticker, OrderBook, Tickers, Strings, Currency, Market, TransferEntry, Num, TradingFeeInterface, Currencies, IsolatedBorrowRates, IsolatedBorrowRate, Dict, OrderRequest, int, FundingRate, DepositAddress, BorrowInterest, MarketInterface, FundingRateHistory, FundingHistory, LedgerEntry, Position } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class toobit
 * @augments Exchange
 */
export default class toobit extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'toobit',
            'name': 'Toobit',
            'countries': [ 'SC' ], // Seychelles
            'version': 'v1',
            'rateLimit': 50, // 20 requests per second
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'fetchStatus': true,
                'fetchTime': true,
                'fetchMarkets': true,
                'fetchOrderBook': true,
            },
            'urls': {
                'logo': '',
                'api': {
                    'common': 'https://api.toobit.com/',
                    'spot': 'https://api.toobit.com/',
                    'swap': 'https://api.toobit.com/',
                },
                'www': 'https://www.toobit.com/',
                'doc': [
                    'https://toobit-docs.github.io/apidocs/spot/v1/en/',
                    'https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/',
                ],
                'referral': undefined,
                'fees': 'https://www.toobit.com/fee',
            },
            'api': {
                'common': {
                    'get': {
                        'api/v1/time': 1,
                        'api/v1/ping': 1,
                        'api/v1/exchangeInfo': 1,
                        'quote/v1/depth': 1, // todo: by limit 1-10
                        'quote/v1/depth/merged': 1,
                    },
                },
                'spot': {
                    'get': {
                    },
                },
                'private': {
                    'get': {
                    },
                    'post': {
                    },
                    'delete': {
                    },
                },
            },
            'timeframes': {
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'commonCurrencies': {},
            'options': {
                'defaultType': 'spot',
            },
        });
    }

    /**
     * @method
     * @name toobit#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#test-connectivity
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        const response = await this.commonGetApiV1Ping (params);
        return {
            'status': 'ok',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name toobit#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#check-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.commonGetApiV1Time (params);
        //
        //     {
        //         "serverTime": 1699827319559
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    /**
     * @method
     * @name toobit#fetchMarkets
     * @description retrieves data on all markets for toobit
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#exchange-information
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<MarketInterface[]> {
        const response = await this.commonGetApiV1ExchangeInfo (params);
        //
        //    {
        //        "timezone": "UTC",
        //        "serverTime": "1755583099926",
        //        "brokerFilters": [],
        //        "symbols": [
        //            {
        //                "filters": [
        //                    {
        //                        "minPrice": "0.01",
        //                        "maxPrice": "10000000.00000000",
        //                        "tickSize": "0.01",
        //                        "filterType": "PRICE_FILTER"
        //                    },
        //                    {
        //                        "minQty": "0.0001",
        //                        "maxQty": "4000",
        //                        "stepSize": "0.0001",
        //                        "filterType": "LOT_SIZE"
        //                    },
        //                    {
        //                        "minNotional": "5",
        //                        "filterType": "MIN_NOTIONAL"
        //                    },
        //                    {
        //                        "minAmount": "5",
        //                        "maxAmount": "6600000",
        //                        "minBuyPrice": "0.01",
        //                        "filterType": "TRADE_AMOUNT"
        //                    },
        //                    {
        //                        "maxSellPrice": "99999999",
        //                        "buyPriceUpRate": "0.1",
        //                        "sellPriceDownRate": "0.1",
        //                        "filterType": "LIMIT_TRADING"
        //                    },
        //                    {
        //                        "buyPriceUpRate": "0.1",
        //                        "sellPriceDownRate": "0.1",
        //                        "filterType": "MARKET_TRADING"
        //                    },
        //                    {
        //                        "noAllowMarketStartTime": "0",
        //                        "noAllowMarketEndTime": "0",
        //                        "limitOrderStartTime": "0",
        //                        "limitOrderEndTime": "0",
        //                        "limitMinPrice": "0",
        //                        "limitMaxPrice": "0",
        //                        "filterType": "OPEN_QUOTE"
        //                    }
        //                ],
        //                "exchangeId": "301",
        //                "symbol": "ETHUSDT",
        //                "symbolName": "ETHUSDT",
        //                "status": "TRADING",
        //                "baseAsset": "ETH",
        //                "baseAssetName": "ETH",
        //                "baseAssetPrecision": "0.0001",
        //                "quoteAsset": "USDT",
        //                "quoteAssetName": "USDT",
        //                "quotePrecision": "0.01",
        //                "icebergAllowed": false,
        //                "isAggregate": false,
        //                "allowMargin": true,
        //             }
        //        ],
        //        "options": [],
        //        "contracts": [
        //            {
        //                 "filters": [ ... ],
        //                 "exchangeId": "301",
        //                 "symbol": "BTC-SWAP-USDT",
        //                 "symbolName": "BTC-SWAP-USDTUSDT",
        //                 "status": "TRADING",
        //                 "baseAsset": "BTC-SWAP-USDT",
        //                 "baseAssetPrecision": "0.001",
        //                 "quoteAsset": "USDT",
        //                 "quoteAssetPrecision": "0.1",
        //                 "icebergAllowed": false,
        //                 "inverse": false,
        //                 "index": "BTC",
        //                 "indexToken": "BTCUSDT",
        //                 "marginToken": "USDT",
        //                 "marginPrecision": "0.0001",
        //                 "contractMultiplier": "0.001",
        //                 "underlying": "BTC",
        //                 "riskLimits": [
        //                     {
        //                         "riskLimitId": "200020911",
        //                         "quantity": "42000.0",
        //                         "initialMargin": "0.02",
        //                         "maintMargin": "0.01",
        //                         "isWhite": false
        //                     },
        //                     {
        //                         "riskLimitId": "200020912",
        //                         "quantity": "84000.0",
        //                         "initialMargin": "0.04",
        //                         "maintMargin": "0.02",
        //                         "isWhite": false
        //                     },
        //                     ...
        //                 ]
        //            },
        //        ],
        //        "coins": [
        //            {
        //                "orgId": "9001",
        //                "coinId": "TCOM",
        //                "coinName": "TCOM",
        //                "coinFullName": "TCOM",
        //                "allowWithdraw": true,
        //                "allowDeposit": true,
        //                "chainTypes": [
        //                    {
        //                        "chainType": "BSC",
        //                        "withdrawFee": "49.55478",
        //                        "minWithdrawQuantity": "77",
        //                        "maxWithdrawQuantity": "0",
        //                        "minDepositQuantity": "48",
        //                        "allowDeposit": true,
        //                        "allowWithdraw": false
        //                    }
        //                ],
        //                "isVirtual": false
        //            },
        //          ...
        //
        const symbols = this.safeList (response, 'symbols', []);
        const contracts = this.safeList (response, 'contracts', []);
        const all = this.arrayConcat (symbols, contracts);
        const result = [];
        for (let i = 0; i < all.length; i++) {
            const market = all[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const baseParts = baseId.split ('-');
            const baseIdClean = baseParts[0];
            const base = this.safeCurrencyCode (baseIdClean);
            const quote = this.safeCurrencyCode (quoteId);
            const settleId = this.safeString (market, 'marginToken');
            const settle = this.safeCurrencyCode (settleId);
            const status = this.safeString (market, 'status');
            const active = (status === 'TRADING');
            const filters = this.safeList (market, 'filters', []);
            const filtersByType = this.indexBy (filters, 'filterType');
            const priceFilter = this.safeDict (filtersByType, 'PRICE_FILTER', {});
            const lotSizeFilter = this.safeDict (filtersByType, 'LOT_SIZE', {});
            const minNotionalFilter = this.safeDict (filtersByType, 'MIN_NOTIONAL', {});
            let symbol = base + '/' + quote;
            const isContract = ('contractMultiplier' in market);
            const inverse = this.safeBool (market, 'isInverse');
            if (isContract) {
                symbol += ':' + settle;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': undefined,
                'spot': !isContract,
                'margin': false,
                'swap': isContract,
                'future': false,
                'option': false,
                'active': active,
                'contract': isContract,
                'linear': isContract ? !inverse : undefined,
                'inverse': isContract ? inverse : undefined,
                'contractSize': this.safeNumber (market, 'contractMultiplier'),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (lotSizeFilter, 'stepSize'),
                    'price': this.safeNumber (priceFilter, 'tickSize'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (lotSizeFilter, 'minQty'),
                        'max': this.safeNumber (lotSizeFilter, 'maxQty'),
                    },
                    'price': {
                        'min': this.safeNumber (priceFilter, 'minPrice'),
                        'max': this.safeNumber (priceFilter, 'maxPrice'),
                    },
                    'cost': {
                        'min': this.safeNumber (minNotionalFilter, 'minNotional'),
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
     * @name toobit#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#order-book
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
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
        const response = await this.commonGetQuoteV1Depth (this.extend (request, params));
        //
        //    {
        //        "t": "1755593995237",
        //        "b": [
        //            [
        //                "115186.47",
        //                "4.184864"
        //            ],
        //            [
        //                "115186.46",
        //                "0.002756"
        //            ],
        //            ...
        //        ],
        //        "a": [
        //            [
        //                "115186.48",
        //                "6.137369"
        //            ],
        //            [
        //                "115186.49",
        //                "0.002914"
        //            ],
        //            ...
        //        ]
        //    }
        //
        const timestamp = this.safeInteger (response, 't');
        return this.parseOrderBook (response, market['symbol'], timestamp, 'b', 'a');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ();
            let queryString = '';
            if (method === 'GET' || method === 'DELETE') {
                if (Object.keys (query).length) {
                    queryString = this.urlencode (query);
                    url += '?' + queryString;
                }
            } else {
                body = this.json (query);
            }
            const payload = timestamp + method + '/' + path + (body || queryString || '');
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
            headers = {
                'X-TB-APIKEY': this.apiKey,
                'X-TB-TIMESTAMP': timestamp.toString (),
                'X-TB-SIGNATURE': signature,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        if (errorCode && errorCode !== '200') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
