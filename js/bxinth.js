'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bxinth extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bxinth',
            'name': 'BX.in.th',
            'countries': [ 'TH' ], // Thailand
            'rateLimit': 1500,
            'has': {
                'CORS': false,
                'fetchTickers': true,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766412-567b1eb4-5ed7-11e7-94a8-ff6a3884f6c5.jpg',
                'api': 'https://bx.in.th/api',
                'www': 'https://bx.in.th',
                'doc': 'https://bx.in.th/info/api',
            },
            'api': {
                'public': {
                    'get': [
                        '', // ticker
                        'options',
                        'optionbook',
                        'orderbook',
                        'pairing',
                        'trade',
                        'tradehistory',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'biller',
                        'billgroup',
                        'billpay',
                        'cancel',
                        'deposit',
                        'getorders',
                        'history',
                        'option-issue',
                        'option-bid',
                        'option-sell',
                        'option-myissue',
                        'option-mybid',
                        'option-myoptions',
                        'option-exercise',
                        'option-cancel',
                        'option-history',
                        'order',
                        'withdrawal',
                        'withdrawal-history',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.25 / 100,
                    'maker': 0.25 / 100,
                },
            },
            'commonCurrencies': {
                'DAS': 'DASH',
                'DOG': 'DOGE',
                'LEO': 'LeoCoin',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetPairing (params);
        const keys = Object.keys (response);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = response[key];
            const id = this.safeString (market, 'pairing_id');
            const baseId = this.safeString (market, 'secondary_currency');
            const quoteId = this.safeString (market, 'primary_currency');
            const active = this.safeValue (market, 'active');
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
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostBalance (params);
        const balances = this.safeValue (response, 'balance', {});
        const result = { 'info': balances };
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (balances, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['total'] = this.safeFloat (balance, 'total');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pairing': this.marketId (symbol),
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last_price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker['orderbook']['bids'], 'highbid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker['orderbook']['asks'], 'highbid'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'change'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume_24hours'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGet (params);
        const result = {};
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const ticker = response[id];
            const market = this.markets_by_id[id];
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request = {
            'pairing': id,
        };
        const response = await this.publicGet (this.extend (request, params));
        const ticker = this.safeValue (response, id);
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        const date = this.safeString (trade, 'trade_date');
        let timestamp = undefined;
        if (date !== undefined) {
            timestamp = this.parse8601 (date + '+07:00'); // Thailand UTC+7 offset
        }
        const id = this.safeString (trade, 'trade_id');
        const orderId = this.safeString (trade, 'order_id');
        const type = undefined;
        const side = this.safeString (trade, 'trade_type');
        const price = this.safeFloat (trade, 'rate');
        const amount = this.safeFloat (trade, 'amount');
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairing': market['id'],
        };
        const response = await this.publicGetTrade (this.extend (request, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pairing': this.marketId (symbol),
            'type': side,
            'amount': amount,
            'rate': price,
        };
        const response = await this.privatePostOrder (this.extend (request, params));
        const id = this.safeString (response, 'order_id');
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const pairing = undefined; // TODO fixme
        const request = {
            'order_id': id,
            'pairing': pairing,
        };
        return await this.privatePostCancel (this.extend (request, params));
    }

    async parseOrder (order, market = undefined) {
        const side = this.safeString (order, 'order_type');
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (order, 'pairing_id');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString (order, 'date'));
        const price = this.safeFloat (order, 'rate');
        const amount = this.safeFloat (order, 'amount');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        const id = this.safeString (order, 'order_id');
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pairing'] = market['id'];
        }
        const response = await this.privatePostGetorders (this.extend (request, params));
        const orders = this.parseOrders (response['orders'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/';
        if (path) {
            url += path + '/';
        }
        if (Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const auth = this.apiKey + nonce.toString () + this.secret;
            const signature = this.hash (this.encode (auth), 'sha256');
            body = this.urlencode (this.extend ({
                'key': this.apiKey,
                'nonce': nonce,
                'signature': signature,
                // twofa: this.twofa,
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if (api === 'public') {
            return response;
        }
        if ('success' in response) {
            if (response['success']) {
                return response;
            }
        }
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
