'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, PermissionDenied, BadRequest, CancelPending, OrderNotFound, InsufficientFunds, RateLimitExceeded, InvalidOrder, AccountSuspended, BadSymbol, OnMaintenance } = require ('./base/errors');
const { TRUNCATE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class ripio extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ripio',
            'name': 'Ripio',
            'countries': [ 'AR' ], // Argentina
            'rateLimit': 50,
            'version': 'v1',
            // new metainfo interface
            'has': {
                'CORS': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/92337550-2b085500-f0b3-11ea-98e7-5794fb07dd3b.jpg',
                'api': {
                    'public': 'https://api.exchange.ripio.com/api',
                    'private': 'https://api.exchange.ripio.com/api',
                },
                'www': 'https://exchange.ripio.com',
                'doc': [
                    'https://exchange.ripio.com/en/api/',
                ],
                'fees': 'https://exchange.ripio.com/en/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'rate/all',
                        'rate/{pair}',
                        'rate/all', // ?country={country_code}
                        'orderbook/{pair}',
                        'tradehistory/{pair}',
                        'pair',
                        'currency',
                        'orderbook/{pair}/depth', // ?amount=1.4
                    ],
                },
                'private': {
                    'get': [
                        'balances/exchange_balances',
                        'order/{pair}',
                        'order/{pair}/{order_id}',
                        'order/{pair}', // ?status=OPEN,PART
                        // - OPEN: Open order available to be fill in the orderbook.
                        // - PART: Partially filled order, the remaining amount to fill remains in the orderbook.
                        // - CLOS: Order was cancelled before be fully filled but the amount already filled amount is traded.
                        // - CANC: Order was cancelled before any fill.
                        // - COMP: Order was fully filled.
                        'trade/{pair}',
                    ],
                    'post': [
                        'order/{pair}',
                        'order/{pair}/{order_id}/cancel',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.5 / 100,
                    'maker': 0.3 / 100,
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'commonCurrencies': {
            },
        });
    }
};
