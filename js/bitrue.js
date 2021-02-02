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
                'fetchTradingLimits': false,
                'fetchTradingFees': false,
                'fetchAllTradingFees': false,
                'fetchFundingFees': false,
                'fetchTime': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
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
        // const data = this.safeValue (response, 0, []);
        return this.parseTickers (response, symbols);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
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

    async loadTimeDiff () {
        if (this.defMillis === undefined) {
            await this.fetchTime ();
        }
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
        return this.parseBalance (result);
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
        const response = this.privatePostOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'orderId': id,
            'symbol': market['id'],
        };
        const response = this.privateGetOrder (this.extend (request, params));
        const orderId = this.safeString (response, 'orderId');
        if (orderId === undefined) {
            throw new OrderNotFound (this.id + ' could not find matching order');
        }
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = this.privateGetOpenOrders (this.extend (request, params));
        const orders = Array.isArray (response) ? response : [];
        const result = this.parseOrders (orders, market, undefined, undefined, params = {});
        return result;
    }

    async fetchClosedOrders (symbol = undefined, start_id = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (start_id !== undefined) {
            request['fromId'] = start_id;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = this.privateGetMyTrades (this.extend (request, params));
        const trades = Array.isArray (response) ? response : [];
        const result = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = this.parseTrade (trades[i], undefined);
            result.push (trade);
        }
        return result;
    }

    async fetchOrders (symbol = undefined, orderId = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const states = this.safeValue (params, 'states', []); // 'NEW', 'PARTIALLY_FILLED', 'CANCELED', 'FILLED'
        const query = this.omit (params, 'states');
        let request = {
            'symbol': market['id'],
        };
        if (orderId !== undefined) {
            request['orderId'] = orderId;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = this.privateGetAllOrders (this.extend (request, query));
        const orders = Array.isArray (response) ? response : [];
        return this.parseOrders (orders, market, orderId, limit, {});
    }

    async parseOrder (order, market = undefined) {
        // {
        //   "symbol": "BATBTC",
        //   "orderId": "194601105",
        //   "clientOrderId": "",
        //   "price": "0.0000216600000000",
        //   "origQty": "155.0000000000000000",
        //   "executedQty": "0.0000000000000000",
        //   "cummulativeQuoteQty": "0.0000000000000000",
        //   "status": "NEW",
        //   "timeInForce": "",
        //   "type": "LIMIT",
        //   "side": "BUY",
        //   "stopPrice": "",
        //   "icebergQty": "",
        //   "time": 1590637046000,
        //   "updateTime": 1590637046000,
        //   "isWorking": "False"
        // }
        const status = this.parseOrderStatus (this.safeValue (order, 'status'));
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            market = this.marketsById[this.safeString (order, 'symbol').lower ()];
        }
        let timestamp = undefined;
        if ('time' in order) {
            timestamp = this.safeInteger (order, 'time');
        } else if ('updateTime' in order) {
            timestamp = this.safeInteger (order, 'updateTime');
        } else if ('transactTime' in order) {
            timestamp = this.safeInteger (order, 'transactTime');
        }
        const executeQty = this.safeFloat (order, 'executedQty');
        const cummulativeQuoteQty = this.safeFloat (order, 'cummulativeQuoteQty');
        let average = undefined;
        if (executeQty !== undefined && cummulativeQuoteQty !== undefined) {
            average = (executeQty > 0) ? cummulativeQuoteQty / executeQty : 0.0;
        }
        const amount = this.safeFloat (order, 'origQty');
        const remaining = (amount !== undefined && executeQty !== undefined) ? amount - executeQty : undefined;
        return {
            'info': order,
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': this.safeValue (order, 'type'),
            'side': this.safeValue (order, 'side'),
            'price': this.safeFloat (order, 'price'),
            'average': average,
            'amount': amount,
            'remaining': remaining,
            'filled': executeQty,
            'status': status,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    async parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PENDING_CANCEL': 'canceled',
            'REJECTED': 'failed',
            'EXPIRED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        return this.privateDeleteOrder (this.extend (request, params));
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
        const message = this.safeString (response, 'message');
        if ((errorCode !== undefined) && (errorCode !== '0')) {
            const feedback = this.id + ' ' + body;
            this.throw_exactly_matched_exception (this.exceptions['codes'], errorCode, feedback);
            this.throw_exactly_matched_exception (this.exceptions['exact'], message, feedback);
            throw new ExchangeError (response);
        }
    }
};
