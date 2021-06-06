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
                        'market/asks',
                        'market/bids',
                        'market/books',
                        'market/symbols',
                        'market/ticker',
                        'market/trades',
                        // 'market/tradingview',
                    ],
                },
                'private': {
                    'post': [
                        'market/balances',
                        'market/cancel-order',
                        'market/my-open-orders',
                        'market/my-order-history',
                        'market/order-info',
                        'market/place-ask',
                        'market/place-bid',
                        'market/wallet',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.0025,
                    'maker': 0.0025,
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                '0': 'No error',
                '1': 'Invalid JSON payload',
                '2': 'Missing X-BTK-APIKEY',
                '3': 'Invalid API key',
                '4': 'API pending for activation',
                '5': 'IP not allowed',
                '6': 'Missing/invalid signature',
                '7': 'Missing timestamp',
                '8': 'Invalid timestamp',
                '9': 'Invalid user',
                '10': 'Invalid parameter',
                '11': 'Invalid symbol',
                '12': 'Invalid amount',
                '13': 'Invalid rate',
                '14': 'Improper rate',
                '15': 'Amount too low',
                '16': 'Failed to get Balance',
                '17': 'Wallet is empty',
                '18': 'Insufficient balance',
                '19': 'Failed to insert into db',
                '20': 'Failed to deduct balance',
                '21': 'Invalid order for cancellation',
                '22': 'Invalid side',
                '23': 'Failed to update order status',
                '24': 'Invalid currency for withdrawal',
                '30': 'Limit exceeded',
                '40': 'Pending withdrawal exists',
                '43': 'Failed to deduct crypto',
                '44': 'Failed to dreate withdrawal record',
            },
        });
    }

    async fetchMarkets (params = {}) {
        // OK - exchange = /api/market/symbols
        const markets = await this.publicGetMarketSymbols (params);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const [ quoteId, baseId ] = id.split ('_');
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
            'info': ticker,
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
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        // OK - exchange = /api/market/ticker
        await this.loadMarkets ();
        const tickers = await this.publicGetMarketTicker ();
        const result = {};
        const ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const ticker = tickers[id];
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
        const sym = market['id'];
        const request = {
            'sym': sym,
        };
        const response = await this.publicGetMarketTicker (this.extend (request, params));
        const ticker = this.safeValue (response, sym);
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = trade[0] * 1000;
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
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
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
            'sym': market['id'],
        };
        // Limit is mandatory. Set default count to 1000
        request['lmt'] = (limit !== undefined) ? limit : 1000;
        const trades = await this.publicGetMarketTrades (this.extend (request, params));
        return await this.parseTrades (trades, market, undefined, limit, params);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        // OK - exchange = /api/market/books
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': market['id'],
        };
        request['lmt'] = (limit !== undefined) ? limit : 1000;
        const orderbook = await this.publicGetMarketBooks (this.extend (request, params));
        // Get most recent timestamp
        // TODO
        const lastBidTime = orderbook['bids'][0][1];
        const lastAskTime = orderbook['asks'][0][1];
        const timestamp = (lastBidTime > lastAskTime) ? lastBidTime : lastAskTime;
        return await this.parseOrderBook (orderbook, timestamp * 1000, 'bids', 'asks', 3, 4);
    }

    async fetchBalance (params = {}) {
        // OK - exchange = /api/market/balances
        const request = {
        };
        const balances = await this.privatePostMarketBalances (this.extend (request, params));
        const result = { 'info': balances };
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (balances, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'reserved');
            account['total'] = this.sum(account['free'], account['used']);
            result[code] = account;
        }
        return await this.parseBalance (result);
    }

    parseOrder (order, market, params) {
        let type = undefined;
        let amount = undefined;
        let price = undefined;
        let credit = undefined;
        let cost = undefined;
        let side = undefined;
        const symbol = market['symbol'];
        const id = this.safeString (order, 'id');
        const timestamp = this.safeFloat (order, 'ts') * 1000;
        if (order['type'] === undefined) {
            // sell or buy order
            side = this.safeString (params, 'side');
            type = this.safeString (order, 'typ');
            amount = this.safeFloat (order, 'amt');
            price = this.safeFloat (order, 'rat');
            credit = this.safeFloat (order, 'cre');
            cost = this.safeFloat (order, 'rec');
        } else {
            // other order requests
            side = this.safeStringLower (order, 'side');
            type = this.safeString (order, 'type');
            amount = this.safeFloat (order, 'amount');
            price = this.safeFloat (order, 'rate');
            credit = this.safeFloat (order, 'credit');
            cost = this.safeFloat (order, 'receive');
        }
        const fee = this.safeFloat (order, 'fee');
        const average = undefined;
        const filled = undefined;
        const remaining = undefined;
        const status = undefined;
        const trades = undefined;
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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
            'fee': fee - credit,
            'trades': trades,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // OK - exchange = /api/market/place-[bid|ask]
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': market['id'],
            'amt': amount,
            'rat': price,
            'typ': type,
        };
        let response = {};
        if (side === 'sell') {
            response = await this.privatePostMarketPlaceAsk (this.extend (request, params));
        } else {
            response = await this.privatePostMarketPlaceBid (this.extend (request, params));
        }
        params = { 'side': side };
        return await this.parseOrder (response, market, params);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        // OK - exchange = /api/market/cancel-order
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': market['id'],
            'id': id,
            'sd': params['side'],
        };
        return await this.privatePostMarketCancelOrder (this.extend (request, params));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // OK - exchange = /api/market/my-open-orders
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': market['id'],
        };
        const orders = await this.privatePostMarketMyOpenOrders (this.extend (request, params));
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            const res = await this.parseOrder (orders[i], market, undefined);
            result.push (res);
        }
        return this.filterBySymbol (result, symbol);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/api/';
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
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if (path === 'market/ticker') {
            // Stupid ticker endpoint has no error reporting
            return response;
        }
        const error = this.safeValue (response, 'error');
        if (error !== undefined) {
            if (error === 0) {
                const result = this.safeValue (response, 'result');
                if (result !== undefined) {
                    return response['result'];
                } else {
                    // Endpoint /api/market/cancel-order has no response['result']
                    return response;
                }
            } else {
                throw new ExchangeError (this.id + ' ' + this.json (response['error']));
            }
        }
    }
};
