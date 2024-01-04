
//  ---------------------------------------------------------------------------

import Exchange from './abstract/hyperliquid.js';
import { ExchangeError, ArgumentsRequired } from './base/errors.js';
// import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Market, Balances, Int, OrderBook, OHLCV, Str, FundingRateHistory, Order } from './base/types.js';
//  ---------------------------------------------------------------------------

/**
 * @class hyperliquid
 * @augments Exchange
 */
export default class hyperliquid extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hyperliquid',
            'name': 'Hyperliquid',
            'countries': [ 'US' ], // is this dex in US?
            'version': 'v!',
            'rateLimit': 50, // 1200 requests per minute, 20 request per second
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createReduceOnlyOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': undefined,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
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
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1m',
            },
            'hostname': 'hyperliquid.xyz',
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'test': {
                    'public': 'https://api.hyperliquid-testnet.xyz',
                    'private': 'https://api.hyperliquid-testnet.xyz',
                },
                'www': 'https://hyperliquid.xyz',
                'doc': 'https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api',
                'fees': 'https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees',
                'referral': '',
            },
            'api': {
                'public': {
                    'post': {
                        'info': 1,
                    },
                },
                'private': {
                    'post': {
                        'exchange': 1,
                    },
                },
            },
            'fees': {
                'swap': {
                    'taker': this.parseNumber ('0.0006'),
                    'maker': this.parseNumber ('0.0004'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
            },
            'options': {
            },
        });
    }

    setSandboxMode (enabled) {
        super.setSandboxMode (enabled);
        this.options['sandboxMode'] = enabled;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchMarkets
         * @description retrieves data on all markets for hyperliquid
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-asset-contexts-includes-mark-price-current-funding-open-interest-etc
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const request = {
            'type': 'metaAndAssetCtxs',
        };
        const response = await this.publicPostInfo (this.extend (request, params));
        //
        //     [
        //         {
        //             "universe": [
        //                 {
        //                     "maxLeverage": 50,
        //                     "name": "SOL",
        //                     "onlyIsolated": false,
        //                     "szDecimals": 2
        //                 }
        //             ]
        //         },
        //         [
        //             {
        //                 "dayNtlVlm": "9450588.2273",
        //                 "funding": "0.0000198",
        //                 "impactPxs": [
        //                     "108.04",
        //                     "108.06"
        //                 ],
        //                 "markPx": "108.04",
        //                 "midPx": "108.05",
        //                 "openInterest": "10764.48",
        //                 "oraclePx": "107.99",
        //                 "premium": "0.00055561",
        //                 "prevDayPx": "111.81"
        //             }
        //         ]
        //     ]
        //
        let meta = this.safeValue (response, 0, {});
        meta = this.safeValue (meta, 'universe', []);
        const assetCtxs = this.safeValue (response, 1, {});
        const result = [];
        for (let i = 0; i < meta.length; i++) {
            const data = Object.assign (this.safeValue (meta, i, {}), this.safeValue (assetCtxs, i, {}));
            result.push (data);
        }
        return this.parseMarkets (result);
    }

    parseMarket (market): Market {
        //
        //     {
        //         "maxLeverage": "50",
        //         "name": "ETH",
        //         "onlyIsolated": false,
        //         "szDecimals": "4",
        //         "dayNtlVlm": "1709813.11535",
        //         "funding": "0.00004807",
        //         "impactPxs": [
        //             "2369.3",
        //             "2369.6"
        //         ],
        //         "markPx": "2369.6",
        //         "midPx": "2369.45",
        //         "openInterest": "1815.4712",
        //         "oraclePx": "2367.3",
        //         "premium": "0.00090821",
        //         "prevDayPx": "2381.5"
        //     }
        //
        const quoteId = 'USD';
        const baseId = this.safeString (market, 'name');
        const quote = this.safeCurrencyCode (quoteId);
        const base = this.safeCurrencyCode (baseId);
        const settleId = 'USDC';
        const settle = this.safeCurrencyCode (settleId);
        let symbol = base + '/' + quote;
        const contract = true;
        const swap = true;
        if (contract) {
            if (swap) {
                symbol = symbol + ':' + settle;
            }
        }
        return {
            'id': undefined,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': undefined,
            'swap': swap,
            'future': false,
            'option': false,
            'active': true,
            'contract': contract,
            'linear': true,
            'inverse': false,
            'taker': undefined,
            'maker': undefined,
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
        };
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name hyperliquid#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-state
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.user] *required* Onchain address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        const user = this.safeString (params, 'user');
        if (user === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchBalance() requires a user argument');
        }
        const request = {
            'type': 'clearinghouseState',
        };
        const response = await this.publicPostInfo (this.extend (request, params));
        //
        //     {
        //         "assetPositions": [],
        //         "crossMaintenanceMarginUsed": "0.0",
        //         "crossMarginSummary": {
        //             "accountValue": "100.0",
        //             "totalMarginUsed": "0.0",
        //             "totalNtlPos": "0.0",
        //             "totalRawUsd": "100.0"
        //         },
        //         "marginSummary": {
        //             "accountValue": "100.0",
        //             "totalMarginUsed": "0.0",
        //             "totalNtlPos": "0.0",
        //             "totalRawUsd": "100.0"
        //         },
        //         "time": "1704261007014",
        //         "withdrawable": "100.0"
        //     }
        //
        const data = this.safeValue (response, 'marginSummary', {});
        const result = {
            'info': response,
            'USDC': {
                'total': this.safeFloat (data, 'accountValue'),
                'used': this.safeFloat (data, 'totalMarginUsed'),
            },
        };
        const timestamp = this.safeInteger (response, 'time');
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.safeBalance (result);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name hyperliquid#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#info
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'type': 'l2Book',
            'coin': market['base'],
        };
        const response = await this.publicPostInfo (this.extend (request, params));
        //
        //     {
        //         "coin": "ETH",
        //         "levels": [
        //             [
        //                 {
        //                     "n": "2",
        //                     "px": "2216.2",
        //                     "sz": "74.0637"
        //                 }
        //             ],
        //             [
        //                 {
        //                     "n": "2",
        //                     "px": "2216.5",
        //                     "sz": "70.5893"
        //                 }
        //             ]
        //         ],
        //         "time": "1704290104840"
        //     }
        //
        const data = this.safeValue (response, 'levels', []);
        const result = {
            'bids': this.safeValue (data, 0, []),
            'asks': this.safeValue (data, 1, []),
        };
        const timestamp = this.safeInteger (response, 'time');
        return this.parseOrderBook (result, market['symbol'], timestamp, 'bids', 'asks', 'px', 'sz');
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name hyperliquid#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#info-1
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents, support '1m', '15m', '1h', '1d'
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const until = this.safeInteger (params, 'until', this.milliseconds ());
        if (since === undefined) {
            since = 0;
        }
        if (limit === undefined) {
            limit = 500;
        }
        params = this.omit (params, [ 'until' ]);
        const request = {
            'type': 'candleSnapshot',
            'req': {
                'coin': market['base'],
                'interval': timeframe,
                'startTime': since,
                'endTime': until,
            },
        };
        const response = await this.publicPostInfo (this.extend (request, params));
        //
        //     [
        //         {
        //             "T": 1704287699999,
        //             "c": "2226.4",
        //             "h": "2247.9",
        //             "i": "15m",
        //             "l": "2224.6",
        //             "n": 46,
        //             "o": "2247.9",
        //             "s": "ETH",
        //             "t": 1704286800000,
        //             "v": "591.6427"
        //         }
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "T": 1704287699999,
        //         "c": "2226.4",
        //         "h": "2247.9",
        //         "i": "15m",
        //         "l": "2224.6",
        //         "n": 46,
        //         "o": "2247.9",
        //         "s": "ETH",
        //         "t": 1704286800000,
        //         "v": "591.6427"
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'T'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-historical-funding-rates
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest funding rate
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'type': 'fundingHistory',
            'coin': market['base'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        } else {
            request['startTime'] = this.milliseconds () - 100 * 60 * 60 * 1000;
        }
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.publicPostInfo (this.extend (request, params));
        //
        //     [
        //         {
        //             "coin": "ETH",
        //             "fundingRate": "0.0000125",
        //             "premium": "0.00057962",
        //             "time": 1704290400031
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const timestamp = this.safeInteger (entry, 'time');
            result.push ({
                'info': entry,
                'symbol': this.safeSymbol (undefined, market, undefined, 'swap'),
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit) as FundingRateHistory[];
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name hyperliquid#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.user] *required* Onchain address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const user = this.safeString (params, 'user');
        if (user === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a user argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'type': 'openOrders',
        };
        const response = await this.publicPostInfo (this.extend (request, params));
        //
        //     [
        //         {
        //             "coin": "ETH",
        //             "limitPx": "2000.0",
        //             "oid": 3991946565,
        //             "origSz": "0.1",
        //             "side": "B",
        //             "sz": "0.1",
        //             "timestamp": 1704346468838
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    parseOrder (order, market: Market = undefined): Order {
        //
        //     {
        //         "coin": "ETH",
        //         "limitPx": "2000.0",
        //         "oid": 3991946565,
        //         "origSz": "0.1",
        //         "side": "B",
        //         "sz": "0.1",
        //         "timestamp": 1704346468838
        //     }
        //
        const symbol = this.safeSymbol (undefined, market, undefined, 'swap');
        const timestamp = this.safeInteger (order, 'timestamp');
        const price = this.safeString (order, 'limitPx');
        const amount = this.safeString (order, 'sz');
        const id = this.safeString (order, 'oid');
        let side = this.safeString (order, 'side');
        if (side !== undefined) {
            side = (side === 'A') ? 'sell' : 'buy';
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'symbol': symbol,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': undefined,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //
        const message = this.safeString (response, 'err_msg');
        const errorCode = this.safeString2 (response, 'code', 'err_code');
        const feedback = this.id + ' ' + body;
        const nonEmptyMessage = ((message !== undefined) && (message !== ''));
        if (nonEmptyMessage) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        }
        const nonZeroErrorCode = (errorCode !== undefined) && (errorCode !== '00000');
        if (nonZeroErrorCode) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        if (nonZeroErrorCode || nonEmptyMessage) {
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.implodeHostname (this.urls['api'][api]) + '/' + path;
        if (method === 'POST') {
            headers = {
                'Content-Type': 'application/json',
            };
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
