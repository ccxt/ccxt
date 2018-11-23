'use strict';

// ---------------------------------------------------------------------------

const acx = require ('./acx.js');
const { ArgumentsRequired } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class kuna extends acx {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kuna',
            'name': 'Kuna',
            'countries': [ 'UA' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'CORS': false,
                'fetchTickers': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31697638-912824fa-b3c1-11e7-8c36-cf9606eb94ac.jpg',
                'api': 'https://kuna.io',
                'www': 'https://kuna.io',
                'doc': 'https://kuna.io/documents/api',
                'fees': 'https://kuna.io/documents/api',
            },
            'fees': {
                'trading': {
                    'taker': 0.25 / 100,
                    'maker': 0.25 / 100,
                },
                'funding': {
                    'withdraw': {
                        'UAH': '1%',
                        'BTC': 0.001,
                        'BCH': 0.001,
                        'ETH': 0.01,
                        'WAVES': 0.01,
                        'GOL': 0.0,
                        'GBG': 0.0,
                        // 'RMC': 0.001 BTC
                        // 'ARN': 0.01 ETH
                        // 'R': 0.01 ETH
                        // 'EVR': 0.01 ETH
                    },
                    'deposit': {
                        // 'UAH': (amount) => amount * 0.001 + 5
                    },
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const quotes = [ 'btc', 'eth', 'eurs', 'gbg', 'uah' ];
        const pricePrecisions = {
            'UAH': 0,
        };
        let markets = [];
        let tickers = await this.publicGetTickers ();
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            for (let j = 0; j < quotes.length; j++) {
                let quoteId = quotes[j];
                if (id.indexOf (quoteId) > 0) {
                    let baseId = id.replace (quoteId, '');
                    let base = baseId.toUpperCase ();
                    let quote = quoteId.toUpperCase ();
                    base = this.commonCurrencyCode (base);
                    quote = this.commonCurrencyCode (quote);
                    let symbol = base + '/' + quote;
                    let precision = {
                        'amount': 6,
                        'price': this.safeInteger (pricePrecisions, quote, 6),
                    };
                    markets.push ({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'baseId': baseId,
                        'quoteId': quoteId,
                        'precision': precision,
                        'limits': {
                            'amount': {
                                'min': Math.pow (10, -precision['amount']),
                                'max': Math.pow (10, precision['amount']),
                            },
                            'price': {
                                'min': Math.pow (10, -precision['price']),
                                'max': Math.pow (10, precision['price']),
                            },
                            'cost': {
                                'min': undefined,
                                'max': undefined,
                            },
                        },
                    });
                    break;
                }
            }
        }
        return markets;
    }

    async fetchL3OrderBook (symbol, limit = undefined, params = {}) {
        return this.fetchOrderBook (symbol, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orders = await this.privateGetOrders (this.extend ({
            'market': market['id'],
        }, params));
        // todo emulation of fetchClosedOrders, fetchOrders, fetchOrder
        // with order cache + fetchOpenOrders
        // as in BTC-e, Liqui, Yobit, DSX, Tidex, WEX
        return this.parseOrders (orders, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['created_at']);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let side = this.safeString (trade, 'side');
        if (side !== undefined) {
            let sideMap = {
                'ask': 'sell',
                'bid': 'buy',
            };
            side = this.safeString (sideMap, side);
        }
        let cost = this.safeFloat (trade, 'funds');
        let order = this.safeString (trade, 'order_id');
        return {
            'id': trade['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'volume'),
            'cost': cost,
            'order': order,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateGetTradesMy ({ 'market': market['id'] });
        return this.parseTrades (response, market, since, limit);
    }
};
