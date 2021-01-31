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
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'withdraw': false,
            },
            'timeframes': undefined,
            'urls': {
                'referral': 'https://kuna.io?r=kunaid-gvfihe8az7o4',
                'logo': 'https://user-images.githubusercontent.com/51840849/87153927-f0578b80-c2c0-11ea-84b6-74612568e9e1.jpg',
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
        const quotes = [ 'btc', 'eth', 'eurs', 'rub', 'uah', 'usd', 'usdt', 'gol' ];
        const pricePrecisions = {
            'UAH': 0,
        };
        const markets = [];
        const response = await this.publicGetTickers (params);
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            for (let j = 0; j < quotes.length; j++) {
                const quoteId = quotes[j];
                const index = id.indexOf (quoteId);
                const slice = id.slice (index);
                if ((index > 0) && (slice === quoteId)) {
                    const baseId = id.replace (quoteId, '');
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    const symbol = base + '/' + quote;
                    const precision = {
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
                        'active': undefined,
                        'info': undefined,
                    });
                    break;
                }
            }
        }
        return markets;
    }

    async fetchL3OrderBook (symbol, limit = undefined, params = {}) {
        return await this.fetchOrderBook (symbol, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.privateGetOrders (this.extend (request, params));
        // todo emulation of fetchClosedOrders, fetchOrders, fetchOrder
        // with order cache + fetchOpenOrders
        // as in BTC-e, Liqui, Yobit, DSX, Tidex, WEX
        return this.parseOrders (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        let side = this.safeString2 (trade, 'side', 'trend');
        if (side !== undefined) {
            const sideMap = {
                'ask': 'sell',
                'bid': 'buy',
            };
            side = this.safeString (sideMap, side, side);
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'volume');
        const cost = this.safeFloat (trade, 'funds');
        const orderId = this.safeString (trade, 'order_id');
        const id = this.safeString (trade, 'id');
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'order': orderId,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.privateGetTradesMy (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const trades = await this.fetchTrades (symbol, since, limit, params);
        const ohlcvc = this.buildOHLCVC (trades, timeframe, since, limit);
        const result = [];
        for (let i = 0; i < ohlcvc.length; i++) {
            const ohlcv = ohlcvc[i];
            result.push ([
                ohlcv[0],
                ohlcv[1],
                ohlcv[2],
                ohlcv[3],
                ohlcv[4],
                ohlcv[5],
            ]);
        }
        return result;
    }
};
