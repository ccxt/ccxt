'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinsbit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinsbit',
            'name': 'Coinsbit',
            'countries': ['BR'],
            'rateLimit': 1000,
            'has': {
                'createMarketOrder': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
            },
            'urls': {
                'api': {
                    'public': 'http://coinsbit.io',
                    'private': 'http://coinsbit.io',
                    'wapi': 'wss://coinsbit.io/trade_ws',
                },
                'www': 'https://coinsbit.io/',
                'doc': [
                    'https://www.notion.so/API-COINSBIT-WS-API-COINSBIT-cf1044cff30646d49a0bab0e28f27a87',
                ],
                'fees': 'https://coinsbit.io/fee-schedule',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'ticker',
                        'book',
                        'history',
                        'symbols',
                        'depth/result'
                    ],
                    'post': [
                        'order/new',
                        'order/cancel',
                        'orders',
                        'account/balances',
                        'account/balance',
                        'account/order',
                        'account/order_history'
                    ]
                },
                'private': {
                    'get': [
                        'markets',
                        'tickers',
                        'ticker',
                        'book',
                        'history',
                        'symbols',
                        'depth/result'
                    ],
                    'post': [
                        'order/new',
                        'order/cancel',
                        'orders',
                        'account/balances',
                        'account/balance',
                        'account/order',
                        'account/order_history'
                    ]
                },
                'wapi': {
                    'server': [
                        'ping',
                        'time',
                    ],
                    'kline': [
                        'subscribe',
                        'unsubscribe',
                    ],
                    'price': [
                        'subscribe',
                        'unsubscribe',
                    ],
                    'state': [
                        'query'
                        'subscribe',
                        'unsubscribe',
                    ],
                    'deals': [
                        'subscribe',
                        'unsubscribe',
                    ],
                    'depth': [
                        'subscribe',
                        'unsubscribe',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.002,
                    'taker': 0.002,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.0,
                        'ETH': 0.0,
                        'KSH': 0.0,
                    },
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const method = this.options['fetchMarketsMethod'];
        const response = await this[method] (params);
        const markets = this.safeValue (response, 'data');
        const numMarkets = markets.length;
        if (numMarkets < 1) {
            throw new ExchangeError (this.id + ' publicGetCommonSymbols returned empty response: ' + this.json (markets));
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseId = this.safeString (market, 'base-currency');
            const quoteId = this.safeString (market, 'quote-currency');
            const id = baseId + quoteId;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': market['amount-precision'],
                'price': market['price-precision'],
            };
            const maker = (base === 'OMG') ? 0 : 0.2 / 100;
            const taker = (base === 'OMG') ? 0 : 0.2 / 100;
            const minAmount = this.safeFloat (market, 'min-order-amt', Math.pow (10, -precision['amount']));
            const minCost = this.safeFloat (market, 'min-order-value', 0);
            const state = this.safeString (market, 'state');
            const active = (state === 'online');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'taker': taker,
                'maker': maker,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': minCost,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }
};
