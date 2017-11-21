"use strict";

// ---------------------------------------------------------------------------

const acx = require ('./acx.js')
const { ExchangeError, InsufficientFunds } = require ('./base/errors')

// ---------------------------------------------------------------------------

module.exports = class kuna extends acx {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kuna',
            'name': 'Kuna',
            'countries': 'UA',
            'rateLimit': 1000,
            'version': 'v2',
            'hasCORS': false,
            'hasFetchTickers': false,
            'hasFetchOHLCV': false,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31697638-912824fa-b3c1-11e7-8c36-cf9606eb94ac.jpg',
                'api': 'https://kuna.io',
                'www': 'https://kuna.io',
                'doc': 'https://kuna.io/documents/api',
            },
            'api': {
                'public': {
                    'get': [
                        'tickers/{market}',
                        'order_book',
                        'order_book/{market}',
                        'trades',
                        'trades/{market}',
                        'timestamp',
                    ],
                },
                'private': {
                    'get': [
                        'members/me',
                        'orders',
                        'trades/my',
                    ],
                    'post': [
                        'orders',
                        'order/delete',
                    ],
                },
            },
            'markets': {
                'BTC/UAH': { 'id': 'btcuah', 'symbol': 'BTC/UAH', 'base': 'BTC', 'quote': 'UAH', 'precision': { 'amount': 6, 'price': 0 }, 'lot': 0.000001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 1, 'max': undefined }}},
                'ETH/UAH': { 'id': 'ethuah', 'symbol': 'ETH/UAH', 'base': 'ETH', 'quote': 'UAH', 'precision': { 'amount': 6, 'price': 0 }, 'lot': 0.000001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 1, 'max': undefined }}},
                'GBG/UAH': { 'id': 'gbguah', 'symbol': 'GBG/UAH', 'base': 'GBG', 'quote': 'UAH', 'precision': { 'amount': 3, 'price': 2 }, 'lot': 0.001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 0.01, 'max': undefined }}}, // Golos Gold (GBG != GOLOS)
                'KUN/BTC': { 'id': 'kunbtc', 'symbol': 'KUN/BTC', 'base': 'KUN', 'quote': 'BTC', 'precision': { 'amount': 6, 'price': 6 }, 'lot': 0.000001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }}},
                'BCH/BTC': { 'id': 'bchbtc', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'precision': { 'amount': 6, 'price': 6 }, 'lot': 0.000001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }}},
                'WAVES/UAH': { 'id': 'wavesuah', 'symbol': 'WAVES/UAH', 'base': 'WAVES', 'quote': 'UAH', 'precision': { 'amount': 6, 'price': 0 }, 'lot': 0.000001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 1, 'max': undefined }}},
            },
            'fees': {
                'trading': {
                    'taker': 0.2 / 100,
                    'maker': 0.2 / 100,
                },
            },
        });
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code == 400) {
            let data = JSON.parse (body);
            let error = data['error'];
            let errorMessage = error['message'];
            if (errorMessage.includes ('cannot lock funds')) {
                throw new InsufficientFunds ([ this.id, method, url, code, reason, body ].join (' '));
            }
        }
    }

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let orderBook = await this.publicGetOrderBook (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseOrderBook (orderBook, undefined, 'bids', 'asks', 'price', 'volume');
    }

    parseOrder (order, market) {
        let symbol = market['symbol'];
        let timestamp = this.parse8601 (order['created_at']);
        return {
            'id': order['id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': 'open',
            'symbol': symbol,
            'type': order['ord_type'],
            'side': order['side'],
            'price': parseFloat (order['price']),
            'amount': parseFloat (order['volume']),
            'filled': parseFloat (order['executed_volume']),
            'remaining': parseFloat (order['remaining_volume']),
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol argument');
        let market = this.market (symbol);
        let orders = await this.privateGetOrders (this.extend ({
            'market': market['id'],
        }, params));
        // todo emulation of fetchClosedOrders, fetchOrders, fetchOrder
        // with order cache + fetchOpenOrders
        // as in BTC-e, Liqui, Yobit, DSX, Tidex, WEX
        return this.parseOrders (orders, market);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['created_at']);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'id': trade['id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['volume']),
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (response, market);
    }

    parseMyTrade (trade, market) {
        let timestamp = this.parse8601 (trade['created_at']);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'id': trade['id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'price': trade['price'],
            'amount': trade['volume'],
            'cost': trade['funds'],
            'symbol': symbol,
            'side': trade['side'],
            'order': trade['order_id'],
        };
    }

    parseMyTrades (trades, market = undefined) {
        let parsedTrades = [];
        for (let i = 0; i < trades.length; i++) {
            let trade = trades[i];
            let parsedTrade = this.parseMyTrade (trade, market);
            parsedTrades.push(parsedTrade);
        }
        return parsedTrades;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol argument');
        let market = this.market (symbol);
        let response = await this.privateGetTradesMy ({ 'market': market['id'] });
        return this.parseMyTrades (response, market);
    }
}
