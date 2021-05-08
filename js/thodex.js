'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InvalidOrder } = require ('./base/errors');

module.exports = class thodex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'thodex',
            'name': 'Thodex',
            'version': 'v1',
            'countries': ['TR'],
            'rateLimit': 1000,
            'has': {
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchOpenOrders': true,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/5405177/102882595-a4a83100-445f-11eb-9e26-679f2bc87742.jpeg',
                'api': 'https://api.thodex.com',
                'www': 'https://www.thodex.com',
                'doc': 'https://api.thodex.com',
                'fees': 'https://www.thodex.com/en/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'public/time',
                        'public/markets',
                        'public/market-status',
                        'public/market-summary',
                        'public/market-history',
                        'public/order-depth',
                    ],
                },
                'private': {
                    'get': [
                        'market/open-orders',
                        'market/order-history',
                        'account/balance',
                    ],
                    'post': [
                        'market/buy-limit',
                        'market/sell-limit',
                        'market/buy',
                        'market/sell',
                        'market/cancel',
                    ],
                },
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetPublicMarkets (params);
        const markets = this.safeValue (response, 'result', {});
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = markets[key];
            const id = this.safeString (market, 'keyname');
            const tradingName = this.safeString (market, 'stock_keyname');
            const baseId = tradingName;
            const quoteId = this.safeString (market, 'money_keyname');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            if (tradingName === id) {
                symbol = id;
            }
            const precision = {
                'amount': this.safeInteger (market, 'stock_prec'),
                'price': this.safeInteger (market, 'money_prec'),
            };
            let active = false;
            const maintenance = this.safeString (market, 'maintenance');
            if (maintenance === 'NO') {
                active = true;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'min_amount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        const headers = [];
        await this.loadMarkets ();
        const response = await this.privateGetAccountBalance (params, headers);
        const result = [];
        const balances = this.safeValue (response, 'result');
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (balances, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'freeze');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'id');
        const typeId = this.safeString (order, 'type');
        const symbol = this.safeString (market, 'symbol');
        let side = undefined;
        let type = undefined;
        const sideId = this.safeString (order, 'side');
        if (sideId === 1) {
            side = 'sell';
        } else {
            side = 'buy';
        }
        if (typeId === 1) {
            type = 'limit';
        } else {
            type = 'market';
        }
        const timestamp = this.safeFloat (order, 'ctime') * 1000;
        const lastTradeTimestamp = this.safeFloat (order, 'mtime');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const remaining = this.safeFloat (order, 'left');
        const filled = amount - remaining;
        const status = 'open';
        let cost = undefined;
        if (filled !== undefined) {
            if (price !== undefined) {
                cost = filled * price;
            }
        }
        return {
            'id': id,
            'info': order,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': null,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 100;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'page': 1,
            'limit': limit,
            'market': market['id'],
        };
        const response = await this.privateGetMarketOpenOrders (this.extend (request, params));
        const data = this.safeValue (response, 'result');
        const orders = this.safeValue (data, 'records', []);
        return this.parseOrders (orders, market, undefined, limit);
    }

    parseTicker (ticker, market = undefined) {
        const symbol = this.safeString (market, 'symbol');
        const timestamp = this.milliseconds ();
        const close = this.safeFloat (ticker, 'close');
        const high = this.safeFloat (ticker, 'high');
        const low = this.safeFloat (ticker, 'low');
        const open = this.safeFloat (ticker, 'open');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = { 'market': market['id'].toUpperCase () };
        const response = await this.publicGetPublicMarketStatus (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        return this.parseTicker (result, market);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'].toUpperCase (),
        };
        const response = await this.publicGetPublicOrderDepth (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        return this.parseOrderBook (result);
    }

    parseTrade (trade, market) {
        const id = this.safeString (trade, 'id');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        let fee = undefined;
        let role = undefined;
        let side = undefined;
        let order = undefined;
        const timestamp = this.safeTimestamp (trade, 'time');
        const user = this.safeInteger (trade, 'user');
        if (user === undefined) {
            side = this.safeString (trade, 'type');
            if (amount !== undefined) {
                if (price !== undefined) {
                    cost = price * amount;
                }
            }
        } else {
            order = this.safeString (trade, 'deal_order_id');
            cost = this.safeFloat (trade, 'deal');
            fee = this.safeFloat (trade, 'fee');
            const side_id = this.safeInteger (trade, 'type');
            if (side_id === 1) {
                side = 'sell';
            } else {
                side = 'buy';
            }
            const role_id = this.safeInteger (trade, 'role');
            if (role_id === 1) {
                role = 'maker';
            } else {
                role = 'taker';
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'order': order,
            'side': side,
            'takerOrMaker': role,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'].toUpperCase (),
        };
        const response = await this.publicGetPublicMarketHistory (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        return this.parseTrades (result, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'].toUpperCase (),
        };
        const response = await this.privateGetMarketOrderHistory (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        const records = this.safeValue (result, 'records');
        return this.parseTrades (records, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'market': market['id'],
        };
        const response = await this.privatePostMarketCancel (this.extend (request, params));
        const data = this.safeValue (response, 'result');
        return this.parseOrder (data, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = '';
        if (type === 'limit') {
            if (side === 'buy') {
                method = 'privatePostMarketBuyLimit';
            } else {
                method = 'privatePostMarketSellLimit';
            }
        } else if (type === 'market') {
            if (side === 'buy') {
                method = 'privatePostMarketBuy';
            } else {
                method = 'privatePostMarketSell';
            }
        }
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'type': side,
        };
        amount = parseFloat (amount);
        // for market buy it requires the amount of quote currency to spend
        if ((type === 'market') && (side === 'buy')) {
            if (this.options['createMarketBuyOrderRequiresPrice']) {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                } else {
                    price = parseFloat (price);
                    request['amount'] = this.costToPrecision (symbol, amount * price);
                }
            } else {
                request['amount'] = this.costToPrecision (symbol, amount);
            }
        } else {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this[method] (this.extend (request, params));
        const data = this.safeValue (response, 'result');
        return this.parseOrder (data, market);
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetPublicTime (params);
        const result = this.safeValue (response, 'result');
        return result;
    }

    nonce () {
        return this.seconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        path = this.implodeParams (path, params);
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            query = this.extend ({
                'tonce': nonce.toString (),
                'apikey': this.apiKey,
            }, query);
            query = this.keysort (query);
            const urlencoded = this.urlencode (query);
            url += '?' + urlencoded;
            const signature = this.hash (this.encode (urlencoded + '&secret=' + this.secret), 'sha256', 'hex');
            headers = { 'Authorization': signature, 'Content-Type': 'application/json', 'cache-control': 'no-cache' };
            if (method === 'POST') {
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        return response;
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code >= 400) {
            const error = this.safeValue (response, 'error');
            const code = this.safeInteger (error, 'code');
            if (error !== undefined) {
                if (code !== undefined) {
                    throw new ExchangeError (this.id + ' ' + body);
                }
            }
            const result = this.safeValue (response, 'result');
            if (result === undefined) {
                throw new ExchangeError (this.id + ' ' + body);
            }
        }
    }
};
