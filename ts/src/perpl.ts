//  ---------------------------------------------------------------------------

import Exchange from './abstract/perpl.js';
import { BadRequest, OperationRejected, PermissionDenied } from './base/errors.js';
import type { Dict, Endpoint } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class perpl
 * @augments Exchange
 */
export default class perpl extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'perpl',
            'name': 'Perpl',
            'countries': [],
            'version': 'v1',
            'rateLimit': 1000, // REST limits are unpublished and may change without notice
            'certified': false,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelOrder': false,
                'cancelOrderWs': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createMarketOrderWs': false,
                'createOrder': false,
                'createOrderWs': false,
                'editOrder': false,
                'editOrderWs': false,
                'fetchBalance': false,
                'fetchCurrencies': false,
                'fetchCurrenciesWs': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchL2OrderBook': false,
                'fetchMarkets': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchPositions': false,
                'fetchTicker': false,
                'fetchTrades': false,
                'sandbox': true,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchPositions': false,
                'watchTicker': false,
                'watchTrades': false,
                'ws': false,
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '1h': '3600',
                '2h': '7200',
                '4h': '14400',
                '8h': '28800',
                '12h': '43200',
                '1d': '86400',
            },
            'urls': {
                'api': {
                    'public': 'https://app.perpl.xyz/api',
                    'private': 'https://app.perpl.xyz/api',
                },
                'test': {
                    'public': 'https://testnet.perpl.xyz/api',
                    'private': 'https://testnet.perpl.xyz/api',
                },
                'www': 'https://perpl.xyz',
                'doc': [
                    'https://docs.perpl.xyz/',
                    'https://github.com/PerplFoundation/api-docs',
                ],
                'fees': 'https://docs.perpl.xyz/exchange/fees',
            },
            'api': {
                // relative costs only, REST limits are not published
                'public': {
                    'get': {
                        'v1/pub/context': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market-data/{market_id}/candles/{resolution}/{from}-{to}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market-data/{market_id}/funding/{from}-{to}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market-data/funding/{from}-{to}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/profile/announcements': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        'v1/api-key/payload': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api-key/enroll': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
                'private': {
                    'get': {
                        'v1/profile/ref-code': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trading/account-history': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trading/fills': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trading/order-history': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trading/position-history': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'httpExceptions': {
                '400': BadRequest, // Bad Request
                '403': PermissionDenied, // Forbidden - scope insufficient
                '409': OperationRejected, // Public key already registered
                '423': OperationRejected, // Per-profile key limit reached
            },
            'options': {
                'defaultType': 'swap',
                'chainId': 143,
                'sandboxChainId': 10143,
            },
            'features': {},
        });
    }
}
