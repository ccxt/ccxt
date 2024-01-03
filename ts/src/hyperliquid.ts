
//  ---------------------------------------------------------------------------

import Exchange from './abstract/hyperliquid.js';
import { ExchangeError, ArgumentsRequired } from './base/errors.js';
// import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Market, Balances } from './base/types.js';
// Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, OrderRequest, FundingHistory, Str, Transaction, Ticker, OrderBook, Tickers, Strings, Currency, Position, Liquidation
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
                'fetchFundingRateHistory': false,
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
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
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
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint
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
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.user] *required* Onchain address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        const user = this.safeString (params, 'user');
        if (user === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchBalance() requires a amount argument');
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
