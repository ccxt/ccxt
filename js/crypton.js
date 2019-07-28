'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class crypton extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'crypton',
            'name': 'Crypton',
            'countries': [ 'EU' ],
            'rateLimit': 500,
            'version': '1',
            'has': {
                'fetchDepositAddress': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchTicker': false,
                'fetchTickers': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/41334251-905b5a78-6eed-11e8-91b9-f3aa435078a1.jpg',
                'api': 'https://api.cryptonbtc.com',
                'www': 'https://cryptonbtc.com',
                'doc': 'https://cryptonbtc.docs.apiary.io/',
                'fees': 'https://help.cryptonbtc.com/hc/en-us/articles/360004089872-Fees',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'markets',
                        'markets/{id}',
                        'markets/{id}/orderbook',
                        'markets/{id}/trades',
                        'tickers',
                    ],
                },
                'private': {
                    'get': [
                        'balances',
                        'orders',
                        'orders/{id}',
                        'fills',
                        'deposit_address/{currency}',
                        'deposits',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0020,
                    'taker': 0.0020,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        const markets = response['result'];
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': 8,
                'price': this.precisionFromString (this.safeString (market, 'priceStep')),
            };
            const active = market['enabled'];
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
                        'min': this.safeFloat (market, 'minSize'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeFloat (market, 'priceStep'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privateGetBalances (params);
        const result = { 'info': balances };
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const balance = balances[currencyId];
            account['total'] = this.safeFloat (balance, 'total');
            account['free'] = this.safeFloat (balance, 'free');
            account['used'] = this.safeFloat (balance, 'locked');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': this.marketId (symbol),
        };
        const response = await this.publicGetMarketsIdOrderbook (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        const relativeChange = this.safeFloat (ticker, 'change24h', 0.0);
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': relativeChange * 100,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume24h'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const tickers = this.safeValue (response, 'result');
        const keys = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const ticker = tickers[id];
            let market = undefined;
            let symbol = id;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                symbol = this.parseSymbol (id);
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (trade, 'time'));
        let symbol = undefined;
        const marketId = this.safeString (trade, 'market');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        const feeCost = this.safeFloat (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const id = this.safeString (trade, 'id');
        const side = this.safeString (trade, 'side');
        const orderId = this.safeString (trade, 'orderId');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
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
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketsIdTrades (this.extend (request, params));
        //
        //     {
        //         "result":[
        //             {
        //                 "id":4256381,
        //                 "price":7901.56,
        //                 "side":"buy",
        //                 "size":0.75708114,
        //                 "time":"2019-05-14T16:15:46.781653+00:00"
        //             }
        //         ],
        //         "success":true
        //     }
        //
        return this.parseTrades (response['result'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetFills (this.extend (request, params));
        const trades = this.parseTrades (response['result'], market, since, limit);
        return this.filterBySymbol (trades, symbol);
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'id');
        const status = this.safeString (order, 'status');
        const side = this.safeString (order, 'side');
        const type = this.safeString (order, 'type');
        let symbol = undefined;
        const marketId = this.safeString (order, 'market');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        } else {
            symbol = this.parseSymbol (marketId);
        }
        const timestamp = this.parse8601 (this.safeString (order, 'createdAt'));
        const feeCost = this.safeFloat (order, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (order, 'feeCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat (order, 'filledSize');
        const remaining = amount - filled;
        const cost = filled * price;
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
            'cost': cost,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        return this.parseOrder (response['result']);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const market = undefined;
        if (symbol !== undefined) {
            request['market'] = this.marketId (symbol);
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response['result'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            'side': side,
            'type': type,
            'size': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostOrders (this.extend (request, params));
        return this.parseOrder (response['result']);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateDeleteOrdersId (this.extend (request, params));
        return this.parseOrder (response['result']);
    }

    parseSymbol (id) {
        let [ base, quote ] = id.split ('-');
        base = this.safeCurrencyCode (base);
        quote = this.safeCurrencyCode (quote);
        return base + '/' + quote;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetDepositAddressCurrency (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        const address = this.safeString (result, 'address');
        const tag = this.safeString (result, 'tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                request += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'] + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    payload = body;
                }
            }
            const auth = timestamp + method + request + payload;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            headers = {
                'CRYPTON-APIKEY': this.apiKey,
                'CRYPTON-SIGNATURE': signature,
                'CRYPTON-TIMESTAMP': timestamp,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return;
        }
        const success = this.safeValue (response, 'success');
        if (!success) {
            throw new ExchangeError (this.id + ' ' + body);
        }
    }
};
