import Exchange from '../abstract/prediction/opinion.js';

// ---------------------------------------------------------------------------

/**
 * @class opinion
 * @augments Exchange
 */
export default class opinion extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'opinion',
            'name': 'Opinion',
            'countries': [],
            'rateLimit': 67, // 15 requests per second per API key
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'prediction': true,
            },
            'timeframes': {
                '1m': '1m',
                '1h': '1h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': '', // todo
                'api': {
                    'opinion': 'https://openapi.opinion.trade/openapi',
                },
                'www': 'https://opinion.trade',
                'doc': [ 'https://docs.opinion.trade' ],
            },
            'api': {
                'opinion': {
                    'public': {
                        'get': {
                            'market': 1,
                            'market/{marketId}': 1,
                            'market/categorical/{marketId}': 1,
                            'market/slug/{slug}': 1,
                            'label': 1,
                            'token/latest-price': 1,
                            'token/orderbook': 1,
                            'token/price-history': 1,
                            'quoteToken': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'order': 1,
                            'order/{orderId}': 1,
                            'positions/user/{walletAddress}': 1,
                            'trade/user/{walletAddress}': 1,
                        },
                        'post': {
                            'auth/api-key': 1,
                        },
                        'delete': {
                            'auth/api-key': 1,
                        },
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,        // apikey header, required on every Open API call
                'secret': false,
                'walletAddress': true, // EIP-712 signer for auth/api-key mgmt and order signing
                'privateKey': true,
            },
        });
    }
}
