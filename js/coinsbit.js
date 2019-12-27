'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, DDoSProtection, ExchangeError, InsufficientFunds, InvalidOrder, ArgumentsRequired, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinsbit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinsbit',
            'name': 'Coinsbit',
            'countries': ['EE'],
            'urls': {
                'api': {
                    'public': 'https://coinsbit.io/api/',
                    'private': 'https://coinsbit.io/api/',
                },
                'www': 'https://coinsbit.io/',
                'doc': [
                    'https://www.notion.so/API-COINSBIT-WS-API-COINSBIT-cf1044cff30646d49a0bab0e28f27a87',
                ],
                'fees': 'https://coinsbit.io/fee-schedule',
            },
            'version': 'v1',
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'ticker',
                        'book',
                        'history',
                        'history/result',
                        'products',
                        'symbols',
                        'depth/result',
                    ],
                },
                'private': {
                    'post': [
                        'order/new',
                        'order/cancel',
                        'orders',
                        'account/balances',
                        'account/balance',
                        'account/order',
                        'account/order_history',
                    ],
                },
            },
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createLimitOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrders': false,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
            },
            'rateLimit': 1000,
            'fees': {
                'trading': {
                    'maker': 0.002,
                    'taker': 0.002,
                },
            },
            'exceptions': {
                'balance not enough': InsufficientFunds,
                'amount is less than': InvalidOrder,
                'Total is less than': InvalidOrder,
                'validation.total': InvalidOrder,
                'Too many requests.': DDoSProtection,
                'This action is unauthorized.': AuthenticationError,
                'order not found': OrderNotFound,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        const marketsList = this.safeValue (response, 'result');
        const parsedMarketList = [];
        for (let marketIndex = 0; marketIndex < marketsList.length; marketIndex++) {
            const market = marketsList[marketIndex];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'stock');
            const quoteId = this.safeString (market, 'money');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const isActive = true;
            const precision = {
                'amount': this.safeInteger (market, 'stockPrec'),
                'price': this.safeInteger (market, 'moneyPrec'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minAmount'),
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
            };
            parsedMarketList.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': isActive,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return parsedMarketList;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetTicker (this.extend ({ 'market': market['id'] }, params));
        const ticker = this.safeValue (response, 'result');
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const tickers = this.safeValue (response, 'result');
        const tickersIds = Object.keys (tickers);
        const parsedTickers = [];
        for (let tickerIndex = 0; tickerIndex < tickersIds.length; tickerIndex++) {
            const tickerId = tickersIds[tickerIndex];
            const tickerObject = tickers[tickerId];
            const ticker = this.safeValue (tickerObject, 'ticker');
            ticker['at'] = this.safeValue (tickerObject, 'at');
            const market = this.safeValue (this.markets_by_id, tickerId);
            parsedTickers.push (this.parseTicker (ticker, market));
        }
        return this.filterByArray (parsedTickers, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeTimestamp (ticker, 'at');
        let datetime = undefined;
        if (timestamp !== undefined) {
            datetime = this.iso8601 (timestamp);
        }
        const high = this.safeFloat (ticker, 'high');
        const low = this.safeFloat (ticker, 'low');
        const bid = this.safeFloat (ticker, 'bid');
        const ask = this.safeFloat (ticker, 'ask');
        const open = this.safeFloat (ticker, 'open');
        const close = this.safeFloat (ticker, 'last');
        const last = this.safeFloat (ticker, 'last');
        const change = last - open;
        let percentage = undefined;
        if (open !== 0) {
            percentage = parseFloat (change / open) * parseFloat (100);
        }
        const average = parseFloat (this.sum (last, open)) / parseFloat (2);
        let baseVolume = undefined;
        if ('vol' in ticker) {
            baseVolume = this.safeFloat (ticker, 'vol');
        } else if ('volume' in ticker) {
            baseVolume = this.safeFloat (ticker, 'volume');
        }
        const quoteVolume = this.safeFloat (ticker, 'deal');
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': datetime,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDepthResult (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'bids', 'asks');
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // 'since' param of the request is required a tid as a value.
        // The exchange will return the trades, starting with this trade id
        if ('tid' in params) {
            request['since'] = params['tid'];
        } else {
            request['since'] = 0;
        }
        const trades = await this.publicGetHistoryResult (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit, params);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        let currency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            currency = market['quote'];
        }
        const id = this.safeString (trade, 'tid');
        let timestamp = undefined;
        if ('date' in trade) {
            timestamp = this.safeTimestamp (trade, 'date');
        } else if ('time' in trade) {
            timestamp = this.safeTimestamp (trade, 'time');
        } else if ('ftime' in trade) {
            timestamp = this.safeTimestamp (trade, 'ftime');
        }
        const datetime = this.iso8601 (timestamp);
        let side = undefined;
        if ('side' in trade) {
            side = this.safeString (trade, 'side');
        } else if ('type' in trade) {
            side = this.safeString (trade, 'type');
        }
        let price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        const cost = this.safeFloat (trade, 'dealMoney');
        if (price === 0) {
            price = cost / amount;
        }
        const fee = {
            'currency': currency,
            'cost': this.safeFloat (trade, 'dealFee'),
        };
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostAccountBalances (params);
        const balances = this.safeValue (response, 'result');
        const currencies = Object.keys (balances);
        const parsedBalances = {};
        for (let currencyIndex = 0; currencyIndex < currencies.length; currencyIndex++) {
            const currency = currencies[currencyIndex];
            const balance = balances[currency];
            parsedBalances[currency] = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'freeze'),
            };
        }
        parsedBalances['info'] = balances;
        return this.parseBalance (parsedBalances);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            symbol['limit'] = limit;
        }
        if (since !== undefined) {
            symbol['since'] = limit;
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const orders = this.safeValue (this.safeValue (response, 'result'), 'result');
        return this.parseOrders (orders, market, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const response = await this.privatePostAccountOrderHistory (params);
        const result = this.safeValue (response, 'result');
        if (Array.isArray (result)) {
            // User has no closed orders yet.
            return [];
        }
        const market = this.market (symbol);
        const orders = this.safeValue (result, market['id'], []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const response = await this.privatePostAccountOrderHistory (params);
        const result = this.safeValue (response, 'result');
        if (Array.isArray (result)) {
            // User has no closed orders yet.
            return [];
        }
        const market = this.market (symbol);
        const orders = this.safeValue (result, market['id'], []);
        return this.parseTrades (orders, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        let id = undefined;
        if ('id' in order) {
            id = this.safeString (order, 'id');
        } else if ('orderId' in order) {
            id = this.safeString (order, 'orderId');
        }
        let timestamp = undefined;
        if ('timestamp' in order) {
            timestamp = this.safeTimestamp (order, 'timestamp');
        } else if ('ctime' in order) {
            timestamp = this.safeTimestamp (order, 'ctime');
        }
        const datetime = this.iso8601 (timestamp);
        const lastTradeTimestamp = this.safeTimestamp (order, 'ftime');
        const marketId = this.safeString (order, 'market');
        let orderMarket = undefined;
        let symbol = undefined;
        let currency = undefined;
        if (marketId in this.markets_by_id) {
            orderMarket = this.markets_by_id[marketId];
            symbol = orderMarket['symbol'];
            currency = orderMarket['quote'];
        }
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const amount = this.safeFloat (order, 'amount');
        const remaining = this.safeFloat (order, 'left');
        let status = undefined;
        let filled = undefined;
        if (remaining === undefined || remaining === 0.0) {
            status = 'closed';
            filled = amount;
        } else {
            status = 'open';
            filled = amount - remaining;
        }
        let price = this.safeFloat (order, 'price');
        const cost = this.safeFloat (order, 'dealMoney');
        if (price === 0.0) {
            if ((cost !== undefined) && (filled !== undefined)) {
                if ((cost > 0) && (filled > 0)) {
                    price = cost / filled;
                }
            }
        }
        const fee = {
            'currency': currency,
            'cost': this.safeFloat (order, 'dealFee'),
        };
        return {
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
            'trades': undefined,
            'fee': fee,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'price': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
        };
        const response = await this.privatePostOrderNew (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        return this.parseOrder (result, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'orderId': parseInt (id),
        };
        const response = await this.privatePostOrderCancel (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        return this.parseOrder (result, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + this.version + '/';
        if (api === 'public') {
            url += 'public/';
        }
        url += this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            const queryKeysArray = Object.keys (query);
            const queryKeysArrayLength = queryKeysArray.length;
            if (queryKeysArrayLength > 0) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const request = '/api/' + this.version + '/' + this.implodeParams (path, params);
            const nonce = this.nonce ().toString ();
            query = this.extend ({
                'nonce': nonce,
                'request': request,
            }, query);
            body = this.json (query, { 'jsonUnescapedSlashes': true });
            query = this.encode (body);
            const payload = this.stringToBase64 (query);
            const secret = this.encode (this.secret);
            const signature = this.hmac (payload, secret, 'sha512');
            headers = {
                'Content-type': 'application/json',
                'X-TXC-APIKEY': this.apiKey,
                'X-TXC-PAYLOAD': this.decode (payload),
                'X-TXC-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code !== 200) {
            const feedback = "\n" + 'id: ' + this.id + "\n" + 'url: ' + url + "\n" + 'request body: ' + requestBody + "\n" + 'code: ' + code + "\n" + 'body:' + "\n" + body; // eslint-disable-line quotes
            this.throwExactlyMatchedException (this.httpExceptions, code.toString (), feedback);
        }
        const isSuccess = this.safeValue (response, 'success', true);
        if (!isSuccess) {
            const messages = this.json (this.safeValue (response, 'message'));
            const feedback = "\n" + 'id: ' + this.id + "\n" + 'url: ' + url + "\n" + 'request body: ' + requestBody + "\n" + 'Error: ' + messages + "\n" + 'body:' + "\n" + body; // eslint-disable-line quotes
            this.throwBroadlyMatchedException (this.exceptions, messages, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
