
//  ---------------------------------------------------------------------------

import Exchange from './abstract/paradex.js';
import { ExchangeError, RateLimitExceeded, PermissionDenied, InsufficientFunds, AuthenticationError, InvalidOrder, BadRequest } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Dict, Market } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class paradex
 * @augments Exchange
 */
export default class paradex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'paradex',
            'name': 'Paradex',
            'countries': [],
            'version': 'v1',
            'rateLimit': 50,
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'cancelOrdersForSymbols': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createReduceOnlyOrder': true,
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
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': true,
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
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
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
                '1M': 604800,
            },
            'hostname': 'paradex.trade',
            'urls': {
                'logo': 'https://x.com/tradeparadex/photo',
                'api': {
                    'v1': 'https://api.prod.{hostname}/v1',
                },
                'test': {
                    'v1': 'https://api.testnet.{hostname}/v1',
                },
                'www': 'https://www.paradex.trade/',
                'doc': 'https://docs.api.testnet.paradex.trade/',
                'fees': 'https://docs.paradex.trade/getting-started/trading-fees',
                'referral': '',
            },
            'api': {
                'public': {
                    'get': {
                        'bbo/{market}': 1,
                        'funding/data': 1,
                        'markets': 1,
                        'markets/summary': 1,
                        'orderbook/{market}': 1,
                        'insurance': 1,
                        'referrals/config': 1,
                        'system/config': 1,
                        'system/state': 1,
                        'system/time': 1,
                        'trades': 1,
                    },
                },
                'private': {
                    'get': {
                        'account': 1,
                        'account/profile': 1,
                        'balance': 1,
                        'fills': 1,
                        'funding/payments': 1,
                        'positions': 1,
                        'tradebusts': 1,
                        'transactions': 1,
                        'liquidations': 1,
                        'orders': 1,
                        'orders-history': 1,
                        'orders/by_client_id/{client_id}': 1,
                        'orders/{order_id}': 1,
                        'points_data/{market}/{program}': 1,
                        'referrals/summary': 1,
                        'transfers': 1,
                    },
                    'post': {
                        'account/profile/referral_code': 1,
                        'account/profile/username': 1,
                        'auth': 1,
                        'onboarding': 1,
                        'orders': 1,
                    },
                    'delete': {
                        'orders': 1,
                        'orders/by_client_id/{client_id}': 1,
                        'orders/{order_id}': 1,
                    },
                },
            },
            'fees': {
                'swap': {
                    'taker': this.parseNumber ('0.0002'),
                    'maker': this.parseNumber ('0.0002'),
                },
                'spot': {
                    'taker': this.parseNumber ('0.0002'),
                    'maker': this.parseNumber ('0.0002'),
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'exceptions': {
                'exact': {
                    '1000': RateLimitExceeded,
                    '1015': RateLimitExceeded,
                    '1001': PermissionDenied,
                    '1002': PermissionDenied,
                    '1003': PermissionDenied,
                    '2000': InvalidOrder,
                    '2001': InvalidOrder,
                    '2002': InvalidOrder,
                    '2003': InvalidOrder,
                    '2004': InvalidOrder,
                    '2005': InvalidOrder,
                    '2006': InvalidOrder,
                    '2007': InvalidOrder,
                    '2008': InvalidOrder,
                    '2009': InvalidOrder,
                    '2010': InvalidOrder,
                    '2011': BadRequest,
                    '2012': BadRequest,
                    '2013': InvalidOrder,
                    '2014': PermissionDenied,
                    '2015': InvalidOrder,
                    '2016': InvalidOrder,
                    '2017': InvalidOrder,
                    '2019': InvalidOrder,
                    '2020': InvalidOrder,
                    '2021': InvalidOrder,
                    '2022': InvalidOrder,
                    '2023': InvalidOrder,
                    '2024': InsufficientFunds,
                    '2025': InsufficientFunds,
                    '2026': BadRequest,
                    '2027': AuthenticationError,
                    '2028': AuthenticationError,
                    '2029': AuthenticationError,
                    '2030': BadRequest,
                    '2031': InvalidOrder,
                    '2033': InvalidOrder,
                    '2034': InvalidOrder,
                    '2035': InvalidOrder,
                    '2036': InvalidOrder,
                    '2037': InvalidOrder,
                    '2038': InvalidOrder,
                    '2039': InvalidOrder,
                    '2040': InvalidOrder,
                    '2041': InvalidOrder,
                    '2042': InvalidOrder,
                    '2043': InvalidOrder,
                    '2044': InvalidOrder,
                    '2045': InvalidOrder,
                    '2046': InvalidOrder,
                    '2047': InvalidOrder,
                    '2048': InvalidOrder,
                    '2049': ExchangeError,
                    '2050': PermissionDenied,
                    '2051': InvalidOrder,
                    '2052': InvalidOrder,
                    '2053': InvalidOrder,
                    '2054': InvalidOrder,
                    '2055': InvalidOrder,
                    '2056': InvalidOrder,
                    '2057': InvalidOrder,
                    '2058': InvalidOrder,
                    '2059': InvalidOrder,
                    '2060': InvalidOrder,
                    '2061': InvalidOrder,
                    '2062': InvalidOrder,
                    '2063': InvalidOrder,
                    '2064': InvalidOrder,
                    '2065': InvalidOrder,
                    '2066': InvalidOrder,
                    '2067': InvalidOrder,
                    '2068': InvalidOrder,
                    '2069': InvalidOrder,
                    '2070': InvalidOrder,
                    '2071': InvalidOrder,
                    '2072': InvalidOrder,
                    '2073': InvalidOrder,
                    '2074': InvalidOrder,
                    '2075': InvalidOrder,
                    '2076': InvalidOrder,
                    '3000': BadRequest,
                    '3001': BadRequest,
                    '3002': BadRequest,
                    '3003': BadRequest,
                    '4000': BadRequest,
                    '4001': ExchangeError,
                    '4002': ExchangeError,
                    '4003': ExchangeError,
                    '4004': InvalidOrder,
                    '5000': ExchangeError,
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
            },
            'options': {
                'defaultType': 'swap',
                'sandboxMode': false,
                'timeDifference': 0, // the difference between system clock and exchange server clock
                'brokerId': 5930043274845996,
            },
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name paradex#fetchMarkets
         * @description retrieves data on all markets for bitget
         * @see https://docs.api.testnet.paradex.trade/#list-available-markets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         "results": [
        //             {
        //                 "symbol": "BODEN-USD-PERP",
        //                 "base_currency": "BODEN",
        //                 "quote_currency": "USD",
        //                 "settlement_currency": "USDC",
        //                 "order_size_increment": "1",
        //                 "price_tick_size": "0.00001",
        //                 "min_notional": "200",
        //                 "open_at": 1717065600000,
        //                 "expiry_at": 0,
        //                 "asset_kind": "PERP",
        //                 "position_limit": "2000000",
        //                 "price_bands_width": "0.2",
        //                 "max_open_orders": 50,
        //                 "max_funding_rate": "0.05",
        //                 "delta1_cross_margin_params": {
        //                     "imf_base": "0.2",
        //                     "imf_shift": "180000",
        //                     "imf_factor": "0.00071",
        //                     "mmf_factor": "0.5"
        //                 },
        //                 "price_feed_id": "9LScEHse1ioZt2rUuhwiN6bmYnqpMqvZkQJDNUpxVHN5",
        //                 "oracle_ewma_factor": "0.14999987905913592",
        //                 "max_order_size": "520000",
        //                 "max_funding_rate_change": "0.0005",
        //                 "max_tob_spread": "0.2"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'results');
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        //
        //     {
        //         "symbol": "BODEN-USD-PERP",
        //         "base_currency": "BODEN",
        //         "quote_currency": "USD",
        //         "settlement_currency": "USDC",
        //         "order_size_increment": "1",
        //         "price_tick_size": "0.00001",
        //         "min_notional": "200",
        //         "open_at": 1717065600000,
        //         "expiry_at": 0,
        //         "asset_kind": "PERP",
        //         "position_limit": "2000000",
        //         "price_bands_width": "0.2",
        //         "max_open_orders": 50,
        //         "max_funding_rate": "0.05",
        //         "delta1_cross_margin_params": {
        //             "imf_base": "0.2",
        //             "imf_shift": "180000",
        //             "imf_factor": "0.00071",
        //             "mmf_factor": "0.5"
        //         },
        //         "price_feed_id": "9LScEHse1ioZt2rUuhwiN6bmYnqpMqvZkQJDNUpxVHN5",
        //         "oracle_ewma_factor": "0.14999987905913592",
        //         "max_order_size": "520000",
        //         "max_funding_rate_change": "0.0005",
        //         "max_tob_spread": "0.2"
        //     }
        //
        const marketId = this.safeString (market, 'symbol');
        const quoteId = this.safeString (market, 'quote_currency');
        const baseId = this.safeString (market, 'base_currency');
        const quote = this.safeCurrencyCode (quoteId);
        const base = this.safeCurrencyCode (baseId);
        const settleId = this.safeString (market, 'settlement_currency');
        const settle = this.safeCurrencyCode (settleId);
        const symbol = base + '/' + quote + ':' + settle;
        const expiry = this.safeInteger (market, 'expiry_at');
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': true,
            'swap': true,
            'future': false,
            'option': false,
            'active': this.safeBool (market, 'enableTrading'),
            'contract': true,
            'linear': undefined,
            'inverse': undefined,
            'taker': undefined,
            'maker': undefined,
            'contractSize': undefined,
            'expiry': (expiry === 0) ? undefined : expiry,
            'expiryDatetime': (expiry === 0) ? undefined : this.iso8601 (expiry),
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][this.version]) + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            // this.checkRequiredCredentials ();
            // headers = {
            //     'Accept': 'application/json',
            //     'Authorization': 'Bearer ' + this.apiKey,
            // };
            // if (method === 'POST') {
            //     body = this.json (query);
            //     headers['Content-Type'] = 'application/json';
            // } else {
            //     if (Object.keys (query).length) {
            //         url += '?' + this.urlencode (query);
            //     }
            // }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
