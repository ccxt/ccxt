'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InsufficientFunds, OrderNotFound, InvalidOrder, AuthenticationError, PermissionDenied, BadRequest } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitrue extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitrue',
            'name': 'Bitrue',
            'countries': ['US'],
            'version': 'v1',
            'rateLimit': 3000,
            'urls': {
                'logo': 'https://www.bitrue.com/includes/assets/346c710f38975f71fa8ea90f9f7457a3.svg',
                'api': 'https://www.bitrue.com/api',
                'www': 'https://bitrue.com',
                'doc': 'https://github.com/Bitrue/bitrue-official-api-docs',
                'referral': 'https://www.bitrue.com/activity/task/task-landing?inviteCode=TAEZWW&cn=900000',
            },
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'fetchTradingLimits': false,
                'fetchTradingFees': false,
                'fetchAllTradingFees': false,
                'fetchFundingFees': false,
                'fetchTime': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': false,
                'fetchBalance': true,
                'createMarketOrder': true,
                'createOrder': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'cancelAllOrders': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'api': {
                'public': {
                    'get': [
                        'exchangeInfo',
                        'ticker/24hr',
                        'ticker/24hr',
                        'depth',
                        'trades',
                        'time',
                    ],
                },
                'private': {
                    'get': [
                        'account',
                        'order',
                        'openOrders',
                        'myTrades',
                        'allOrders',
                    ],
                    'post': [
                        'order',
                    ],
                    'delete': [
                        'order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
            },
            'commonCurrencies': {
                'PLA': 'Plair',
            },
            'options': {
                'timeDifference': undefined, // the difference between system clock and Bitrue clock, normally about 57 seconds
                'adjustForTimeDifference': true,
            },
            'exceptions': {
                'codes': {
                    '-1': BadRequest,
                    '-2': BadRequest,
                    '1001': BadRequest,
                    '1004': ArgumentsRequired,
                    '1006': AuthenticationError,
                    '1008': AuthenticationError,
                    '1010': AuthenticationError,
                    '1011': PermissionDenied,
                    '2001': AuthenticationError,
                    '2002': InvalidOrder,
                    '2004': OrderNotFound,
                    '9003': PermissionDenied,
                },
                'exact': {
                    'market does not have a valid value': BadRequest,
                    'side does not have a valid value': BadRequest,
                    'Account::AccountError: Cannot lock funds': InsufficientFunds,
                    'The account does not exist': AuthenticationError,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const request = { 'show_details': true };
        const response = await this.publicGetExchangeInfo (this.extend (request, params));
        const result = [];
        // const symbols = this.safeValue (response, 'symbols');
        const markets = this.safeValue (response, 'symbols');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeStringLower (market, 'symbol');
            const base = this.safeStringUpper (market, 'baseAsset');
            const quote = this.safeStringUpper (market, 'quoteAsset');
            const baseId = base.toLowerCase ();
            const quoteId = quote.toLowerCase ();
            const symbol = base + '/' + quote;
            const filters = this.safeValue (market, 'filters');
            const price_filter = this.safeValue (filters, 0);
            const volume_filter = this.safeValue (filters, 1);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'info': market,
                'precision': {
                    'amount': this.safeValue (volume_filter, 'volumeScale'),
                    'price': this.safeValue (price_filter, 'priceScale'),
                    'base': this.safeValue (volume_filter, 'volumeScale'),
                    'quote': this.safeValue (price_filter, 'priceScale'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeValue (volume_filter, 'minQty'),
                        'max': this.safeValue (volume_filter, 'maxQty'),
                    },
                    'price': {
                        'min': this.safeValue (price_filter, 'minPrice'),
                        'max': this.safeValue (price_filter, 'maxPrice'),
                    },
                    'cost': {
                        'min': this.safeValue (volume_filter, 'minQty'),
                        'max': this.safeValue (volume_filter, 'maxQty'),
                    },
                },
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker24hr (this.extend (request, params));
        const data = this.safeValue (response, 0);
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker24hr (params);
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        const marketId = this.safeStringLower (ticker, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = this.safeTimestamp (ticker, 'closeTime');
        if (timestamp === undefined || timestamp === 0) {
            timestamp = this.milliseconds ();
        }
        const vwap = this.safeFloat (ticker, 'weightedAvgPrice');
        // response includes `volume`, but it is equal to `quoteVolume`
        // since e.g. BTC/USDT volume = quoteVolume ~ 30000000, we can assume it is quoteVolume
        let baseVolume = undefined;
        const quoteVolume = this.safeFloat (ticker, 'quoteVolume');
        if ((quoteVolume !== undefined) && (vwap !== undefined) && (vwap > 0)) {
            baseVolume = quoteVolume / vwap;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': this.safeFloat (ticker, 'bidPrice'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'askPrice'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeFloat (ticker, 'openPrice'),
            'close': this.safeFloat (ticker, 'lastPrice'),
            'last': this.safeFloat (ticker, 'lastPrice'),
            'previousClose': this.safeFloat (ticker, 'prevClosePrice'),
            'change': this.safeFloat (ticker, 'priceChange'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        const orderbook = response ? response : {};
        const timestamp = this.safeInteger (orderbook, 'lastUpdateId');
        return this.parseOrderBook (orderbook, timestamp);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        const data = Array.isArray (response) ? response : [];
        return this.parseTrades (data, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const market = symbol ? this.market (symbol) : undefined;
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privateGetMyTrades (this.extend (request, params));
        const data = Array.isArray (response) ? response : [];
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const side = this.safeValue (trade, 'isBuyer') ? 'buy' : 'sell';
        const takerOrMaker = this.safeValue (trade, 'isMaker') ? 'maker' : 'taker';
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        if (symbol === undefined) {
            if (market === undefined) {
                market = this.markets_by_id[this.safeStringLower (trade, 'symbol')];
            }
            symbol = market['symbol'];
        }
        let timestamp = this.safeInteger (trade, 'time');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (trade, 'time'));
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'qty');
        const cost = price * amount;
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'id'),
            'order': undefined,
            'type': 'limit',
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        const serverMillis = this.safeInteger (response, 'serverTime');
        const localMillis = this.milliseconds ();
        this.diffMillis = serverMillis - localMillis;
        return serverMillis;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccount (params);
        const balances = this.safeValue (response, 'balances');
        const result = {
            'info': response,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeValue (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'free');
            account['used'] = this.safeFloat (balance, 'locked');
            result[code] = account;
        }
        return this.parseBalance (result, true);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'type': type.toUpperCase (),
            'quantity': this.amountToPrecision (symbol, amount),
        };
        if (type.toUpperCase () === 'LIMIT') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        // Note: Bitrue's API response for order creation does not include information such as type and side
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
            'symbol': market['id'],
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        const orderId = this.safeString (response, 'orderId');
        if (orderId === undefined) {
            throw new OrderNotFound (this.id + ' could not find matching order');
        }
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privateGetOpenOrders (this.extend (request, params));
        const orders = Array.isArray (response) ? response : [];
        return this.parseOrders (orders, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privateGetAllOrders (this.extend (request, params));
        const orders = Array.isArray (response) ? response : [];
        return this.parseOrders (orders, market);
    }

    parseOrder (order, market = undefined) {
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            symbol = this.safeSymbol (this.safeString (order, 'symbol'));
        }
        let timestamp = undefined;
        if ('time' in order) {
            timestamp = this.safeInteger (order, 'time');
        } else if ('updateTime' in order) {
            timestamp = this.safeInteger (order, 'updateTime');
        } else if ('transactTime' in order) {
            timestamp = this.safeInteger (order, 'transactTime');
        }
        const executedQty = this.safeFloat (order, 'executedQty');
        const cummulativeQuoteQty = this.safeFloat (order, 'cummulativeQuoteQty');
        let average = undefined;
        if (executedQty !== undefined && cummulativeQuoteQty !== undefined) {
            average = (executedQty > 0) ? cummulativeQuoteQty / executedQty : 0.0;
        }
        const amount = this.safeFloat (order, 'origQty');
        const remaining = (amount !== undefined && executedQty !== undefined) ? (amount - executedQty) : undefined;
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': this.safeStringLower (order, 'type'),
            'side': this.safeStringLower (order, 'side'),
            'price': this.safeFloat (order, 'price'),
            'amount': amount,
            'average': average,
            'filled': executedQty,
            'remaining': remaining,
            'status': status,
            'cost': cummulativeQuoteQty,
            'fee': undefined,
            'trades': undefined,
        });
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PENDING_CANCEL': 'canceled',
            'REJECTED': 'failed',
            'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        const response = await this.privateDeleteOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    async loadTimeDifference (params = {}) {
        const serverTime = await this.fetchTime (params);
        const after = this.milliseconds ();
        this.options['timeDifference'] = after - serverTime;
        return this.options['timeDifference'];
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (query) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = (this.options['timeDifference'] !== undefined) ? (this.milliseconds () - this.options['timeDifference']) : 0;
            query = this.extend ({ 'timestamp': timestamp }, query);
            const signStr = this.urlencode (query);
            const signature = this.hmac (this.encode (signStr), this.encode (this.secret));
            query = this.extend ({ 'signature': signature }, query);
            if (method === 'GET') {
                url += '?' + signStr + '&signature=' + signature;
            } else {
                body = signStr + '&signature=' + signature;
            }
        }
        headers = { 'Content-Type': 'application/json', 'X-MBX-APIKEY': this.apiKey };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        //     {"code":1011,"message":"This IP '5.228.233.138' is not allowed","data":{}}
        //
        if (response === undefined) {
            return;
        }
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        if ((errorCode !== undefined) && (errorCode !== '0')) {
            const feedback = this.id + ' ' + body;
            this.throw_exactly_matched_exception (this.exceptions['codes'], errorCode, feedback);
            this.throw_exactly_matched_exception (this.exceptions['exact'], message, feedback);
            throw new ExchangeError (message);
        }
    }
};
