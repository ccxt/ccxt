//  ---------------------------------------------------------------------------

import Exchange from './base/Exchange.js';
import { TICK_SIZE } from './base/functions/number.js';

//  ---------------------------------------------------------------------------

/**
 * @class dase
 * @augments Exchange
 */
export default class dase extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'dase',
            'name': 'DASE',
            'countries': [ 'EU' ],
            'rateLimit': 200,
            'version': 'v1',
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                // public
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                // private
                'fetchBalance': false,
                'createOrder': false,
                'cancelOrder': false,
                'cancelAllOrders': false,
                'fetchOrder': false,
                'fetchOpenOrders': false,
                'fetchOrders': false,
            },
            'urls': {
                'logo': undefined,
                'api': {
                    'rest': 'https://api.dase.com',
                },
                'www': 'https://www.dase.com',
                'doc': 'https://api.dase.com/docs',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'markets/stats',
                        'markets/{market}/ticker',
                        'markets/{market}/snapshot',
                        'markets/{market}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'balances',
                        'balances/{currency}',
                        'orders',
                        'orders/{order_id}',
                        'orders/{order_id}/transactions',
                        'accounts/transactions',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders',
                        'orders/{order_id}',
                    ],
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }
}
