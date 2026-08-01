import Exchange from '../abstract/prediction/sxbet.js';

// ---------------------------------------------------------------------------

/**
 * @class sxbet
 * @augments Exchange
 */
export default class sxbet extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'sxbet',
            'name': 'SX Bet',
            'countries': [],
            'rateLimit': 120, // 500 req/min baseline; /orders is 5500/min, /trades is 200/min
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchEvent': true,
                'fetchEvents': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchSettlements': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'prediction': true,
            },
            'urls': {
                'logo': '', // todo
                'api': {
                    'sxbet': 'https://api.sx.bet',
                    'explorer': 'https://explorerl2.sx.technology/api',
                },
                'test': {
                    'sxbet': 'https://api.toronto.sx.bet',
                    'explorer': 'https://explorerl2.toronto.sx.technology/api',
                },
                'www': 'https://sx.bet',
                'doc': [ 'https://docs.sx.bet' ],
            },
            'api': {
                'sxbet': {
                    'public': {
                        'get': {
                            'metadata': 1,
                            'markets/active': 1,
                            'markets/find': 1,
                            'markets/popular': 1,
                            'orders': 1,
                            'orders/odds/best': 1,
                            'trades': 1,
                            'trades/consolidated': 1,
                            'trades/orders': 1,
                            'trades/portfolio/refunds': 1,
                            'fixture/active': 1,
                            'fixture/status': 1,
                            'sports': 1,
                            'leagues': 1,
                            'leagues/active': 1,
                            'teams': 1,
                            'live-scores': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'orders/new': 1,
                            'orders/fill/v2': 1,
                            'orders/cancel/v2': 1,
                            'orders/cancel/event': 1,
                            'orders/cancel/all': 1,
                        },
                    },
                },
                'explorer': {
                    'public': {
                        'get': {
                            'api': 1, // ?module=account&action=tokenbalance&contractaddress=...&address=...
                        },
                    },
                },
            },
            'requiredCredentials': {
                // apiKey is the optional X-Api-Key header (higher REST rate limits, required for
                // websocket); trading needs walletAddress (order 'maker' field) and privateKey
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': false,
                },
            },
            'exceptions': {
                'exact': {},
                'broad': {},
            },
            'options': {
            },
        });
    }
}
