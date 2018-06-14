'use strict';

// ---------------------------------------------------------------------------

const acx = require ('./acx.js');
const { ExchangeError } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class kuna extends acx {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kuna',
            'name': 'Kuna',
            'countries': 'UA',
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

    async fetchMarkets () {
        let predefinedMarkets = [
            { 'id': 'btcuah', 'symbol': 'BTC/UAH', 'base': 'BTC', 'quote': 'UAH', 'baseId': 'btc', 'quoteId': 'uah', 'precision': { 'amount': 6, 'price': 0 }, 'lot': 0.000001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 1, 'max': undefined }, 'cost': { 'min': 0.000001, 'max': undefined }}},
            { 'id': 'ethuah', 'symbol': 'ETH/UAH', 'base': 'ETH', 'quote': 'UAH', 'baseId': 'eth', 'quoteId': 'uah', 'precision': { 'amount': 6, 'price': 0 }, 'lot': 0.000001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 1, 'max': undefined }, 'cost': { 'min': 0.000001, 'max': undefined }}},
            { 'id': 'gbguah', 'symbol': 'GBG/UAH', 'base': 'GBG', 'quote': 'UAH', 'baseId': 'gbg', 'quoteId': 'uah', 'precision': { 'amount': 3, 'price': 2 }, 'lot': 0.001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 0.01, 'max': undefined }, 'cost': { 'min': 0.000001, 'max': undefined }}}, // Golos Gold (GBG != GOLOS)
            { 'id': 'kunbtc', 'symbol': 'KUN/BTC', 'base': 'KUN', 'quote': 'BTC', 'baseId': 'kun', 'quoteId': 'btc', 'precision': { 'amount': 6, 'price': 6 }, 'lot': 0.000001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.000001, 'max': undefined }}},
            { 'id': 'bchbtc', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'baseId': 'bch', 'quoteId': 'btc', 'precision': { 'amount': 6, 'price': 6 }, 'lot': 0.000001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.000001, 'max': undefined }}},
            { 'id': 'bchuah', 'symbol': 'BCH/UAH', 'base': 'BCH', 'quote': 'UAH', 'baseId': 'bch', 'quoteId': 'uah', 'precision': { 'amount': 6, 'price': 0 }, 'lot': 0.000001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 1, 'max': undefined }, 'cost': { 'min': 0.000001, 'max': undefined }}},
            { 'id': 'wavesuah', 'symbol': 'WAVES/UAH', 'base': 'WAVES', 'quote': 'UAH', 'baseId': 'waves', 'quoteId': 'uah', 'precision': { 'amount': 6, 'price': 0 }, 'lot': 0.000001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 1, 'max': undefined }, 'cost': { 'min': 0.000001, 'max': undefined }}},
            { 'id': 'arnbtc', 'symbol': 'ARN/BTC', 'base': 'ARN', 'quote': 'BTC', 'baseId': 'arn', 'quoteId': 'btc' },
            { 'id': 'b2bbtc', 'symbol': 'B2B/BTC', 'base': 'B2B', 'quote': 'BTC', 'baseId': 'b2b', 'quoteId': 'btc' },
            { 'id': 'evrbtc', 'symbol': 'EVR/BTC', 'base': 'EVR', 'quote': 'BTC', 'baseId': 'evr', 'quoteId': 'btc' },
            { 'id': 'golgbg', 'symbol': 'GOL/GBG', 'base': 'GOL', 'quote': 'GBG', 'baseId': 'gol', 'quoteId': 'gbg' },
            { 'id': 'rbtc', 'symbol': 'R/BTC', 'base': 'R', 'quote': 'BTC', 'baseId': 'r', 'quoteId': 'btc' },
            { 'id': 'rmcbtc', 'symbol': 'RMC/BTC', 'base': 'RMC', 'quote': 'BTC', 'baseId': 'rmc', 'quoteId': 'btc' },
        ];
        let markets = [];
        let tickers = await this.publicGetTickers ();
        for (let i = 0; i < predefinedMarkets.length; i++) {
            let market = predefinedMarkets[i];
            if (market['id'] in tickers)
                markets.push (market);
        }
        let marketsById = this.indexBy (markets, 'id');
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            if (!(id in marketsById)) {
                let baseId = id.replace ('btc', '');
                baseId = baseId.replace ('uah', '');
                baseId = baseId.replace ('gbg', '');
                if (baseId.length > 0) {
                    let baseIdLength = baseId.length - 0; // a transpiler workaround
                    let quoteId = id.slice (baseIdLength);
                    let base = baseId.toUpperCase ();
                    let quote = quoteId.toUpperCase ();
                    base = this.commonCurrencyCode (base);
                    quote = this.commonCurrencyCode (quote);
                    let symbol = base + '/' + quote;
                    markets.push ({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'baseId': baseId,
                        'quoteId': quoteId,
                    });
                }
            }
        }
        return markets;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderBook = await this.publicGetOrderBook (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseOrderBook (orderBook, undefined, 'bids', 'asks', 'price', 'remaining_volume');
    }

    async fetchL3OrderBook (symbol, limit = undefined, params = {}) {
        return this.fetchOrderBook (symbol, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol argument');
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
        let sideMap = {
            'ask': 'sell',
            'bid': 'buy',
        };
        side = sideMap[side];
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
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateGetTradesMy ({ 'market': market['id'] });
        return this.parseTrades (response, market, since, limit);
    }
};
