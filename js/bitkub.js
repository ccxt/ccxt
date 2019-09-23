'use strict';

//---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class bitkub extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitkub',
            'name': 'Bitkub',
            'countries': ['TH'], // Thailand
            'rateLimit': 1500,
            'has': {
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': true, // cancel-order
                'createDepositAddress': false,
                'createOrder': true, // place-ask, place-bid
                'deposit': false,
                'fetchBalance': true, // balances
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchMarkets': true, // symbols
                'fetchMyTrades': true, // my-order-history
                'fetchOHLCV': false, // trading-view
                'fetchOpenOrders': true, // my-open-orders
                'fetchOrder': true, // order-info
                'fetchOrderBook': true, // books
                'fetchOrders': true, // ?
                'fetchStatus': true,
                'fetchTicker': true, // ticker
                'fetchTickers': true, // ticker
                'fetchBidsAsks': false,
                'fetchTrades': true, // trades
                'withdraw': false,
            },
            'urls': {
                'referral': 'https://www.bitkub.com/signup?ref=61648',
                // 'logo': '',
                'api': 'https://api.bitkub.com',
                'www': 'https://bitkub.com',
                'doc': 'https://github.com/bitkub/bitkub-official-api-docs',
            },
            'api': {
                'public': {
                    'get': [
                        'servertime',
                        'asks',
                        'bids',
                        'books',
                        'symbols',
                        'ticker',
                        'trades',
                        // 'tradingview',
                    ],
                },
                'private': {
                    'post': [
                        'balances',
                        'cancel-order',
                        'my-open-orders',
                        'my-order-history',
                        'order-info',
                        'place-ask',
                        'place-bid',
                        'wallet',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.25 / 100,
                    'maker': 0.25 / 100,
                },
            },
            'commonCurrencies': {},
        });
    }

    async fetchMarkets (params = {}) {
        // OK - exchange = /api/market/symbols
        const markets = await this.publicGetSymbols (params);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const reverse = this.safeString (market, 'symbol');
            const [ quoteId, baseId ] = reverse.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24hr'),
            'low': this.safeFloat (ticker, 'low24hr'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'change'),
            'percentage': this.safeFloat (ticker, 'percentChange'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        // OK (so far) - exchange = /api/market/ticker
        await this.loadMarkets ();
        const tickers = await this.publicGetTicker (params);
        const result = {};
        const ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            const idx = ids[i];
            const id = tickers[idx]['id'];
            const ticker = tickers[idx];
            const market = this.markets_by_id[id];
            if (market !== undefined) {
                const symbol = market['symbol'];
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        // OK (so far) - exchange = /api/market/ticker
        await this.loadMarkets ();
        const market = this.market (symbol);
        const sym = this.safeString (market['info'], 'symbol');
        const request = {
            'sym': sym,
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const ticker = this.safeValue (response, sym);
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = trade[0] * 1000; // undefined;
        const id = undefined;
        const orderId = undefined;
        const type = undefined;
        const side = trade[3].toLowerCase ();
        const price = trade[1];
        const amount = trade[2];
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'takerOrMaker': undefined,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        // OK - exchange = /api/market/trades
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': this.safeString (market['info'], 'symbol'),
        };
        // Set default count to 1000
        if (limit !== undefined) {
            request['lmt'] = limit;
        } else {
            request['lmt'] = 1000;
        }
        const trades = await this.publicGetTrades (this.extend (request, params));
        const result = [];
        for (let i = 0; i < trades.length; i++) {
            result.push (this.parseTrade (trades[i], symbol));
        }
        return result;
    }

    parseOrderBook (orderbook, timestamp = undefined, priceKey = 'price') {
    // parseOrderBook (orderbook, timestamp = undefined, _bidsKey = 'bids', _asksKey = 'asks', priceKey = 'price', amountKey = 'amount') {
        const bids = [];
        const asks = [];
        const numBids = orderbook.bids.length;
        const numAsks = orderbook.asks.length;
        // Get latest timestamp
        if (orderbook.bids[0][1] > orderbook.asks[0][1]) {
            timestamp = orderbook.bids[0][1] * 1000;
        } else {
            timestamp = orderbook.asks[0][1] * 1000;
        }
        for (let i = 0; i < numBids; i++) {
            bids.push (orderbook.bids[i].splice (3, 2));
        }
        for (let i = 0; i < numAsks; i++) {
            asks.push (orderbook.asks[i].splice (3, 2));
        }
        return {
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': this.nonce (),
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        // OK - exchange = /api/market/books
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': this.safeString (market['info'], 'symbol'),
        };
        if (limit !== undefined) {
            request['lmt'] = limit;
        } else {
            request['lmt'] = 1000;
        }
        const orderbook = await this.publicGetBooks (this.extend (request, params));
        return this.parseOrderBook (orderbook);
    }

    async fetchBalance (params = {}) {
        // OK - exchange = /api/market/balances
        await this.loadMarkets ();
        const request = {
        };
        const balances = await this.privatePostBalances (request);
        const result = { 'info': balances };
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (balances, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'reserved');
            account['total'] = account['free'] + account['used'];
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        // "result": {
        //    "id": 1, // order id
        //    "typ": "limit", // order type
        //    "amt": 1.00000000, // selling amount
        //    "rat": 15000, // rate
        //    "fee": 37.5, // fee
        //    "cre": 37.5, // fee credit used
        //    "rec": 15000, // amount to receive
        //    "ts": 1533834844 // timestamp
        //  }
        // Fix fee and credits
        const id = this.safeString (order, 'id');
        const timestamp = this.safeFloat (order, 'ts');
        const side = this.safeStringLower (order, 'side');
        const price = this.safeFloat (order, 'rat');
        const amount = this.safeFloat (order, 'amt');
        const symbol = market['symbol'];
        const type = this.safeString (order, 'typ');
        const cost = this.safeFloat (order, 'rec');
        const fee = this.safeFloat (order, 'fee');
        const cre = this.safeFloat (order, 'cre');
        // FIX ME --V--
        const average = undefined;
        const filled = undefined;
        const remaining = undefined;
        const status = undefined;
        const trades = undefined;
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp * 1000),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee - cre,
            'trades': trades,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // OK (sort of) - exchange = /api/market/place-[bid|ask]
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': this.safeString (market['info'], 'symbol'),
            'amt': amount,
            'rat': price,
            'typ': type,
        };
        let response = {};
        if (side === 'sell') {
            response = await this.privatePostPlaceAsk (this.extend (request, params));
        } else {
            response = await this.privatePostPlaceBid (this.extend (request, params));
        }
        let order = {};
        order = await this.parseOrder (response, market);
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        // OK - exchange = /api/market/cancel-order
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': this.safeString (market['info'], 'symbol'),
            'id': id,
            'sd': params['side'],
        };
        // return await this.privatePostCancelOrders(this.extend(request, params));
        return await this.privatePostCancelOrder (request);
    }

    async parseOrders (order, market = undefined) {
        // {
        //    "id": 2, // order id
        //    "side": "SELL", // order side
        //    "type": "limit", // order type
        //    "rate": 15000, // rate
        //    "fee": 35.01, // fee
        //    "credit": 35.01, // credit used
        //    "amount": 0.93333334, // amount
        //    "receive": 14000, // amount to receive
        //    "parent_id": 1, // parent order id
        //    "super_id": 1, // super parent order id
        //    "ts": 1533834844 // timestamp
        //  }
        const id = this.safeString (order, 'id');
        const timestamp = this.safeFloat (order, 'ts');
        const side = this.safeStringLower (order, 'side');
        const price = this.safeFloat (order, 'rate');
        const amount = this.safeFloat (order, 'amount');
        const symbol = market['symbol'];
        const type = this.safeString (order, 'type');
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp * 1000),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'filled': 0,
            'remaining': amount,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // OK (so far) - exchange = /api/market/my-open-orders
        // 'symbol' is required
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': this.safeString (market['info'], 'symbol'),
        };
        const response = await this.privatePostMyOpenOrders (this.extend (request, {}));
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const order = await this.parseOrders (response[i], market);
            result.push (this.extend (order, {
                'status': 'open',
            }));
        }
        return this.filterBySymbol (result, symbol);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/api/market/';
        if (path) {
            url += path;
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const auth = this.json (this.extend (params, { 'ts': nonce }));
            const signature = this.hmac (this.encode (auth), this.secret, 'sha256');
            body = this.json (this.extend (JSON.parse (auth), { 'sig': signature }));
            headers = {
                'accept': 'application/json',
                'content-type': 'application/json',
                'x-btk-apikey': this.apiKey,
            };
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        // console.log({ 'url': url, 'method': method, 'body': body, 'headers': headers });
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if (api === 'public') {
            if (response['error'] === undefined) {
                return response;
            } else {
                return response['result'];
            }
        }
        if (response['error'] === 0) {
            if (response['result'] === undefined) {
                return response;
            } else {
                return response['result'];
            }
        }
        throw new ExchangeError (this.id + ' ' + this.json (response['error']));
    }
};
