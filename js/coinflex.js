'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, OrderNotFound, BadRequest, InvalidOrder, InsufficientFunds } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinflex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinflex',
            'name': 'CoinFlex',
            'countries': [ 'SC' ], // Seychelles
            'rateLimit': 2000,
            'urls': {
                'www': 'https://coinflex.com/',
                'api': {
                    'public': 'https://webapi.coinflex.com',
                    'private': 'https://webapi.coinflex.com',
                },
                'fees': 'https://coinflex.com/fees/',
                'doc': [
                    'https://github.com/coinflex-exchange/API/blob/master/REST.md',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'assets/',
                        'markets/',
                        'tickers/',
                        'tickers/{base}:{counter}',
                        'depth/{base}:{counter}',
                    ],
                },
                'private': {
                    'get': [
                        'balances/',
                        'orders/',
                        'orders/{id}',
                        'trades/',
                        'trades/{time}',
                    ],
                    'post': [
                        'orders/',
                    ],
                    'delete': [
                        'orders/',
                        'orders/{id}',
                    ],
                },
            },
            'has': {
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchTickers': true,
                'fetchTicker': true,
                'fetchOrderBook': true,
                'fetchBalance': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'cancelAllOrders': true,
                'fetchTrades': false,
                'fetchOHLCV': false,
            },
            'requiredCredentials': {
                'apiKey': true,
                'privateKey': true,
                'uid': true,
                'secret': false,
            },
            'options': {
                'fetchCurrencies': {
                    'expires': 5000,
                },
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const answer = await this.fetchCurrenciesFromCache (params);
        const assets = this.safeValue (answer, 'currencies');
        const result = {};
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const code = this.safeCurrencyCode (this.safeString2 (asset, 'name', 'spot_name'));
            result[code] = {
                'id': this.safeInteger (asset, 'id'),
                'code': code,
                'name': code,
                'active': true,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': asset,
            };
        }
        return result;
    }

    async fetchCurrenciesFromCache (params = {}) {
        const options = this.safeValue (this.options, 'fetchCurrencies', {});
        const timestamp = this.safeInteger (options, 'timestamp');
        const expires = this.safeInteger (options, 'expires', 5000);
        const now = this.milliseconds ();
        if ((timestamp === undefined) || ((now - timestamp) > expires)) {
            const currencies = await this.publicGetAssets (params);
            this.options['fetchCurrencies'] = this.extend (options, {
                'currencies': currencies,
                'timestamp': now,
            });
        }
        return this.safeValue (this.options, 'fetchCurrencies', {});
    }

    async fetchMarkets (params = {}) {
        const currencies = await this.fetchCurrencies ();
        const markets = await this.publicGetMarkets ();
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseId = this.safeInteger (market, 'base');
            const base = this.findCurrencyById (currencies, baseId);
            const quoteId = this.safeInteger (market, 'counter');
            const quote = this.findCurrencyById (currencies, quoteId);
            const symbol = base + '/' + quote;
            let active = true;
            const expires = this.safeInteger (market, 'expires');
            if (expires !== undefined) {
                if (this.milliseconds () > expires) {
                    active = false;
                }
            }
            result.push ({
                'id': this.safeString (market, 'name'),
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': undefined,
                'limits': undefined,
                'info': market,
            });
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'base': market['baseId'],
            'counter': market['quoteId'],
        };
        const response = await this.publicGetTickersBaseCounter (this.extend (request, params));
        return this.parseTicker (response);
    }

    parseTicker (ticker, market = undefined) {
        if (market === undefined) {
            const baseId = this.safeInteger (ticker, 'base');
            const base = this.findCurrencyById (this.currencies, baseId);
            const quoteId = this.safeInteger (ticker, 'counter');
            const quote = this.findCurrencyById (this.currencies, quoteId);
            const symbol = base + '/' + quote;
            market = this.market (symbol);
        }
        let timestamp = this.safeInteger (ticker, 'time'); // in microseconds
        timestamp = parseInt (timestamp / 1000000);
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
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
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (side === 'sell') {
            amount *= -1;
        }
        const baseAsset = this.currencies[market['base']];
        const baseScale = this.safeInteger (baseAsset['info'], 'scale');
        const quoteAsset = this.currencies[market['quote']];
        const quoteScale = this.safeInteger (quoteAsset['info'], 'scale');
        const request = {
            'base': market['baseId'],
            'counter': market['quoteId'],
        };
        if (type === 'limit') {
            request['price'] = price * quoteScale;
        }
        request['quantity'] = amount * baseScale;
        const response = await this.privatePostOrders (this.extend (request, params));
        if ('remaining' in response) {
            return [];
        } else {
            return this.parseOrder (response);
        }
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'base': market['baseId'],
            'counter': market['quoteId'],
        };
        const response = await this.publicGetDepthBaseCounter (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': parseInt (id),
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalances (params);
        const result = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currency = this.findCurrencyById (this.currencies, balance.id);
            let available = this.safeFloat (balance, 'available');
            let reserved = this.safeFloat (balance, 'reserved');
            const asset = this.currencies[currency];
            const scale = this.safeInteger (asset['info'], 'scale');
            if (scale > 0) {
                available /= scale;
                reserved /= scale;
            }
            result[currency] = {
                'free': available,
                'used': reserved,
                'total': this.sum (available, reserved),
            };
        }
        return this.parseBalance (result);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const result = await this.privateGetOrders (params);
        let orders = this.parseOrders (result, undefined, since, limit);
        orders = this.filterBy (orders, 'symbol', symbol);
        return orders;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': parseInt (id),
        };
        return await this.privateDeleteOrdersId (this.extend (request, params));
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        return await this.privateDeleteOrders (params);
    }

    parseOrder (order, market = undefined) {
        let timestamp = this.safeInteger (order, 'time');
        timestamp = parseInt (timestamp / 1000);
        const baseId = this.safeInteger (order, 'base');
        const base = this.findCurrencyById (this.currencies, baseId);
        const baseAsset = this.currencies[base];
        const baseScale = this.safeInteger (baseAsset['info'], 'scale');
        const quoteId = this.safeInteger (order, 'counter');
        const quote = this.findCurrencyById (this.currencies, quoteId);
        const quoteAsset = this.currencies[quote];
        const quoteScale = this.safeInteger (quoteAsset['info'], 'scale');
        const symbol = base + '/' + quote;
        let amount = this.safeFloat (order, 'quantity');
        let side = undefined;
        if (amount > 0) {
            side = 'buy';
        } else if (amount < 0) {
            side = 'sell';
            amount *= -1;
        }
        if (baseScale > 0) {
            amount /= baseScale;
        }
        let price = this.safeFloat (order, 'price');
        if (quoteScale > 0) {
            price /= quoteScale;
        }
        return {
            'id': this.safeInteger (order, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'average': undefined,
            'amount': amount,
            'remaining': undefined,
            'filled': undefined,
            'status': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let response = undefined;
        if ('id' in params) {
            request['time'] = this.safeInteger (params, 'id');
            const query = this.omit (params, 'id');
            response = await this.privateGetTradesTime (this.extend (request, query));
            const responseArray = [];
            responseArray.push (response);
            response = responseArray;
        } else {
            response = await this.privateGetTrades (this.extend (request, params));
        }
        return this.parseTrades (response, undefined, since, limit);
    }

    parseTrade (trade, market) {
        const id = this.safeString (trade, 'time');
        const timestamp = parseInt (id / 1000);
        const baseId = this.safeInteger (trade, 'base');
        const base = this.findCurrencyById (this.currencies, baseId);
        const baseAsset = this.currencies[base];
        const baseScale = this.safeInteger (baseAsset['info'], 'scale');
        const quoteId = this.safeInteger (trade, 'counter');
        const quote = this.findCurrencyById (this.currencies, quoteId);
        const quoteAsset = this.currencies[quote];
        const quoteScale = this.safeInteger (quoteAsset['info'], 'scale');
        const symbol = base + '/' + quote;
        market = this.market (symbol);
        let amount = this.safeInteger (trade, 'quantity');
        let side = undefined;
        if (amount !== undefined) {
            if (amount > 0) {
                side = 'buy';
            } else if (amount < 0) {
                side = 'sell';
                amount *= -1;
            }
            if (baseScale > 0) {
                amount /= baseScale;
            }
        }
        let price = this.safeFloat (trade, 'price');
        if (price !== undefined) {
            if (quoteScale > 0) {
                price /= quoteScale;
            }
        }
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let fee = undefined;
        if ('counter_fee' in trade) {
            let cost = this.safeInteger (trade, 'counter_fee');
            if (cost !== undefined) {
                cost /= quoteScale;
                fee = {
                    'cost': cost,
                    'currency': quote,
                };
            }
        }
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'order': this.safeString (trade, 'order_id'),
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
            'info': trade,
        };
    }

    findCurrencyById (currencies, id) {
        const keys = Object.keys (currencies);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const currency = currencies[key];
            if (currency['id'] === id) {
                return currency['code'];
            }
        }
        throw new ExchangeError ('Currency with id ' + id + ' not founded');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const base = this.urls['api'][api];
        const request = '/' + this.implodeParams (path, params);
        let url = base + request;
        const query = this.omit (params, this.extractParams (path));
        let suffix = '';
        if (Object.keys (query).length) {
            suffix = this.urlencode (query);
        }
        if (method === 'GET') {
            if (suffix.length) {
                url = url + '?' + suffix;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const sid = this.uid + '/' + this.apiKey + ':' + this.privateKey;
            headers = {
                'Authorization': 'Basic ' + this.stringToBase64 (sid),
            };
            if (method === 'POST') {
                body = suffix;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code === 400) {
            if (method === 'POST') {
                if (url.indexOf ('orders/') > -1) {
                    throw new InvalidOrder (body);
                }
            }
        }
        if (code === 403) {
            if (method === 'POST') {
                if (url.indexOf ('orders/') > -1) {
                    if (body.indexOf ('insufficient funds') > -1) {
                        throw new InsufficientFunds (body);
                    }
                }
            }
        }
        if (code === 404) {
            if (method === 'GET' || method === 'DELETE') {
                if (url.indexOf ('orders/') > -1) {
                    const index = url.indexOf ('orders/');
                    const id = url.slice (index + 7);
                    throw new OrderNotFound (id);
                }
                if (url.indexOf ('trades/') > -1) {
                    const index = url.indexOf ('trades/');
                    const id = url.slice (index + 7);
                    throw new BadRequest ('Trade with id ' + id + ' not found');
                }
            }
        }
    }
};
