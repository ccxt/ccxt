'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, AuthenticationError, NetworkError, ArgumentsRequired, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class hollaex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hollaex',
            'name': 'HollaEx',
            'countries': [ 'KR' ],
            'rateLimit': 333,
            'version': 'v0',
            'has': {
                'CORS': false,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
                'fetchBalance': true,
                'createOrder': true,
                'createLimitBuyOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketSellOrder': true,
                'cancelOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchOrders': true,
                'fetchMyTrades': true,
                'withdraw': true,
                'fetchDepositAddress': true,
            },
            'timeframes': {
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/10441291/59487066-8058b500-8eb6-11e9-82fd-c9157b18c2d8.jpg',
                'api': 'https://api.hollaex.com',
                'www': 'https://hollaex.com',
                'doc': 'https://apidocs.hollaex.com',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'ticker/all',
                        'orderbooks',
                        'trades',
                        'constant',
                        'chart',
                    ],
                },
                'private': {
                    'get': [
                        'user',
                        'user/balance',
                        'user/trades',
                        'user/orders',
                        'user/orders/{orderId}',
                        'user/deposits',
                        'user/withdrawals',
                    ],
                    'post': [
                        'user/request-withdrawal',
                        'order',
                    ],
                    'delete': [
                        'user/orders/{orderId}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                },
            },
            'exceptions': {
                'Order not found': OrderNotFound,
                '400': BadRequest,
                '403': AuthenticationError,
                '404': BadRequest,
                '405': BadRequest,
                '410': BadRequest,
                '429': BadRequest,
                '500': NetworkError,
                '503': NetworkError,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetConstant ();
        const markets = this.safeValue (response, 'pairs');
        const pairs = Object.keys (markets);
        const result = [];
        for (let i = 0; i < pairs.length; i++) {
            const market = markets[pairs[i]];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'pair_base');
            const quoteId = this.safeString (market, 'pair_2');
            let increment_price = this.safeFloat (market, 'increment_price');
            let pricePrecision = 0;
            for (let i = 1; i >= 0 && increment_price < 1; i++) {
                increment_price = increment_price * 10;
                pricePrecision = i;
            }
            let increment_size = this.safeFloat (market, 'increment_size');
            let amountPrecision = 0;
            for (let i = 1; i >= 0 && increment_size < 1; i++) {
                increment_size = increment_size * 10;
                amountPrecision = i;
            }
            const precision = {
                'cost': undefined,
                'price': pricePrecision,
                'amount': amountPrecision,
            };
            if (quoteId === 'eur') {
                precision['price'] = 4;
            }
            const base = this.commonCurrencyCode (baseId).toUpperCase ();
            const quote = this.commonCurrencyCode (quoteId).toUpperCase ();
            const symbol = base + '/' + quote;
            const active = this.safeValue (market, 'active');
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'min_size'),
                    'max': this.safeFloat (market, 'max_size'),
                },
                'price': {
                    'min': this.safeFloat (market, 'min_price'),
                    'max': this.safeFloat (market, 'max_price'),
                },
                'cost': undefined,
            };
            const info = market;
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': info,
            };
            result.push (entry);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetConstant ();
        const coins = this.safeValue (response, 'coins');
        const currencies = Object.keys (coins);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = coins[currencies[i]];
            const id = this.safeString (currency, 'symbol');
            const code = id.toUpperCase ();
            const name = this.safeString (currency, 'fullname');
            const active = this.safeValue (currency, 'active');
            const fee = this.safeValue (currency, 'fee');
            let min = this.safeFloat (currency, 'min');
            let precision = 0;
            for (let i = 1; i >= 0 && min < 1; i++) {
                min = min * 10;
                precision = i;
            }
            const limits = {
                'amount': {
                    'min': min,
                    'max': this.safeFloat (currency, 'max'),
                },
                'price': {
                    'min': min,
                    'max': this.safeFloat (currency, 'max'),
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': limits,
            };
        }
        return result;
    }

    async fetchOrderBook (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = await this.publicGetOrderbooks (this.extend (request, params));
        response = response[market['id']];
        const datetime = this.safeString (response, 'timestamp');
        const timestamp = this.parse8601 (datetime);
        const result = {
            'bids': response['bids'],
            'asks': response['asks'],
            'timestamp': timestamp,
            'datetime': datetime,
            'nonce': this.milliseconds (),
        };
        return result;
    }

    async fetchTicker (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTicker requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbol = undefined, params = {}) {
        const markets = await this.loadMarkets ();
        const response = await this.publicGetTickerAll (this.extend (params));
        return this.parseTickers (response, markets);
    }

    parseTickers (response, markets) {
        const result = [];
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            result.push (this.parseTicker (response[keys[i]], this.marketsById[keys[i]]));
        }
        return this.filterByArray (result, 'symbol');
    }

    parseTicker (response, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const info = response;
        const time = this.safeString (response, 'time');
        let datetime = undefined;
        if (time === undefined) {
            datetime = this.safeString (response, 'timestamp');
        } else {
            datetime = time;
        }
        const timestamp = this.parse8601 (datetime);
        const high = this.safeFloat (response, 'high');
        const low = this.safeFloat (response, 'low');
        const bid = undefined;
        const bidVolume = undefined;
        const ask = undefined;
        const askVolume = undefined;
        const vwap = undefined;
        const open = this.safeFloat (response, 'open');
        const close = this.safeFloat (response, 'close');
        let last = this.safeFloat (response, 'last');
        if (last === undefined) {
            last = close;
        }
        const previousClose = undefined;
        const change = undefined;
        const percentage = undefined;
        const average = undefined;
        const baseVolume = this.safeFloat (response, 'volume');
        const quoteVolume = undefined;
        const result = {
            'symbol': symbol,
            'info': info,
            'timestamp': timestamp,
            'datetime': datetime,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': vwap,
            'open': open,
            'close': close,
            'last': last,
            'previousClose': previousClose,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
        };
        return result;
    }

    async fetchTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response[market['id']], market);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const info = trade;
        const id = undefined;
        const datetime = this.safeString (trade, 'timestamp');
        const timestamp = this.parse8601 (datetime);
        const order = undefined;
        const type = undefined;
        const side = this.safeString (trade, 'side');
        const takerOrMaker = undefined;
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        const cost = parseFloat (this.amountToPrecision (symbol, price * amount));
        const fee = undefined;
        const result = {
            'info': info,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': order,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
        return result;
    }

    async fetchOHLCV (symbol = undefined, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const to = this.seconds ();
        let fromTime = since;
        if (fromTime === undefined) {
            fromTime = to - 2592000; // default to a month
        } else {
            fromTime /= 1000;
        }
        const request = {
            'from': fromTime,
            'to': to,
            'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        const response = await this.publicGetChart (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (response, market = undefined, timeframe = '1h', since = undefined, limit = undefined) {
        const time = this.parse8601 (this.safeString (response, 'time'));
        const open = this.safeFloat (response, 'open');
        const high = this.safeFloat (response, 'high');
        const low = this.safeFloat (response, 'low');
        const close = this.safeFloat (response, 'close');
        const volume = this.safeFloat (response, 'volume');
        return [
            time,
            open,
            high,
            low,
            close,
            volume,
        ];
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUserBalance (params);
        const result = {
            'info': response,
            'free': undefined,
            'used': undefined,
            'total': undefined,
        };
        const free = {};
        const used = {};
        const total = {};
        const currencyId = Object.keys (this.currencies_by_id);
        for (let i = 0; i < currencyId.length; i++) {
            const currency = this.currencies_by_id[currencyId[i]]['code'];
            const responseCurr = currencyId[i];
            free[currency] = response[responseCurr + '_available'];
            total[currency] = response[responseCurr + '_balance'];
            used[currency] = parseFloat (this.currencyToPrecision (currency, total[currency] - free[currency]));
            result[currency] = {
                'free': free[currency],
                'used': used[currency],
                'total': total[currency],
            };
        }
        result['free'] = free;
        result['used'] = used;
        result['total'] = total;
        return result;
    }

    async fetchOrder (id = undefined, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires an orderId argument');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderId = this.safeValue (params, 'orderId');
        const request = {
            'orderId': orderId,
        };
        if (orderId === undefined) {
            request['orderId'] = id;
        }
        const response = await this.privateGetUserOrdersOrderId (this.extend (request, params));
        if (symbol !== this.markets_by_id[response['symbol']]['symbol']) {
            throw new BadRequest (this.id + ' symbol argument does not match order symbol');
        }
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetUserOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, params);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (order, 'id');
        const datetime = this.safeString (order, 'created_at');
        const timestamp = this.parse8601 (datetime);
        const lastTradeTimestamp = undefined;
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat (order, 'filled');
        const remaining = parseFloat (this.amountToPrecision (symbol, amount - filled));
        let cost = undefined;
        let status = 'open';
        if (type === 'market') {
            status = 'closed';
        } else {
            cost = parseFloat (this.priceToPrecision (symbol, filled * price));
        }
        const trades = undefined;
        const fee = undefined;
        const info = order;
        const result = {
            'id': id,
            'datetime': datetime,
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': trades,
            'fee': fee,
            'info': info,
        };
        return result;
    }

    async createOrder (symbol = undefined, type = undefined, side = undefined, amount = undefined, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a symbol argument');
        }
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a type argument');
        }
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a side argument');
        }
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires an amount argument');
        }
        if (type === 'limit' && price === undefined) {
            throw new ArgumentsRequired (this.id + ' limit createOrder requires a price argument');
        }
        if (type === 'market' && price !== undefined) {
            throw new BadRequest (this.id + ' market createOrder does not require a price argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const order = {
            'symbol': market['id'],
            'side': side,
            'size': amount,
            'type': type,
            'price': price,
        };
        const response = await this.privatePostOrder (this.extend (order, params));
        response['created_at'] = this.iso8601 (this.milliseconds ());
        return this.parseOrder (response, market);
    }

    async createLimitBuyOrder (symbol = undefined, amount = undefined, price = undefined, params = {}) {
        return this.createOrder (symbol, 'limit', 'buy', amount, price, params);
    }

    async createLimitSellOrder (symbol = undefined, amount = undefined, price = undefined, params = {}) {
        return this.createOrder (symbol, 'limit', 'sell', amount, price, params);
    }

    async createMarketBuyOrder (symbol = undefined, amount = undefined, params = {}) {
        return this.createOrder (symbol, 'market', 'buy', amount, undefined, params);
    }

    async createMarketSellOrder (symbol = undefined, amount = undefined, params = {}) {
        return this.createOrder (symbol, 'market', 'sell', amount, undefined, params);
    }

    async cancelOrder (id = undefined, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires an id argument');
        }
        const request = {
            'orderId': id,
        };
        const response = await this.privateDeleteUserOrdersOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetUserTrades (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchDepositAddress (code = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress requires a code argument');
        }
        await this.loadMarkets ();
        const curr = await this.currency (code);
        const currency = this.safeString (curr, 'name').toLowerCase ();
        const response = await this.privateGetUser ();
        const info = this.safeValue (response, 'crypto_wallet');
        const address = this.safeString (info, currency);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': info[currency],
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (code !== undefined) {
            const currency = this.currency (code)['id'];
            request['currency'] = currency;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetUserDeposits (this.extend (request, params));
        return this.parseTransactions (response.data);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (code !== undefined) {
            const currency = this.currency (code)['id'];
            request['currency'] = currency;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetUserWithdrawals (this.extend (request, params));
        return this.parseTransactions (response.data);
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeFloat (transaction, 'id');
        const txid = this.safeString (transaction, 'transaction_id');
        const datetime = this.safeString (transaction, 'created_at');
        const timestamp = this.parse8601 (datetime);
        const addressFrom = undefined;
        const address = undefined;
        const addressTo = undefined;
        const tagFrom = undefined;
        const tag = undefined;
        const tagTo = undefined;
        const type = this.safeString (transaction, 'type');
        const amount = this.safeFloat (transaction, 'amount');
        const currencyId = this.safeString (transaction, 'currency');
        currency = this.currencies_by_id[currencyId]['code'];
        let message = 'pending';
        const status = transaction['status'];
        const dismissed = transaction['dismissed'];
        const rejected = transaction['rejected'];
        if (status) {
            message = 'ok';
        } else if (dismissed) {
            message = 'canceled';
        } else if (rejected) {
            message = 'failed';
        }
        const updated = undefined;
        const comment = this.safeString (transaction, 'description');
        const fee = {
            'currency': currency,
            'cost': this.safeFloat (transaction, 'fee'),
            'rate': undefined,
        };
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': datetime,
            'addressFrom': addressFrom,
            'address': address,
            'addressTo': addressTo,
            'tagFrom': tagFrom,
            'tag': tag,
            'tagTo': tagTo,
            'type': type,
            'amount': amount,
            'currency': currency,
            'status': message,
            'updated': updated,
            'comment': comment,
            'fee': fee,
        };
    }

    async withdraw (code = undefined, amount = undefined, address = undefined, tag = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw requires a code argument');
        }
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw requires an amount argument');
        }
        if (address === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw requires an address argument');
        }
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currencies[code]['id'];
        const request = {
            'currency': currency,
            'amount': amount,
            'address': address,
        };
        const response = await this.privatePostUserRequestWithdrawal (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version;
        if (api === 'public') {
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            const accessToken = 'Bearer ' + this.apiKey;
            headers = {
                'Content-Type': 'application/json',
                'Authorization': accessToken,
            };
            if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (code >= 400 && code <= 503) {
            const exceptions = this.exceptions;
            const message = this.safeString (response, 'message');
            const keys = Object.keys (exceptions);
            if (keys.indexOf (message) !== -1) {
                const ExceptionClass = exceptions[message];
                throw new ExceptionClass (this.id + ' ' + message);
            }
            const status = code.toString ();
            if (keys.indexOf (status) !== -1) {
                const ExceptionClass = exceptions[status];
                throw new ExceptionClass (this.id + ' ' + message);
            }
        }
    }
};
