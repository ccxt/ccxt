'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, OrderNotFound, InvalidOrder } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class bololex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bololex',
            'name': 'BOLOLEX',
            'countries': [ 'VC' ], // Saint Vincent and the Grenadines
            'rateLimit': 600 / 10 / 60 * 1000,
            'enableRateLimit': false,
            'verbose': false,
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchOrderBook': true,
                'fetchTickers': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
                'withdraw': true,
                'deposit': false,
                'fetchDepositAddress': true,
                'createDepositAddress': true,
                'fetchOHLCV': true,
            },
            'timeframes': {
                '1m': '1',
                '3m': 'M3',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '1d': 'D1',
            },
            'urls': {
                'logo': 'https://bololex.com/images/bololex.svg',
                'api': 'https://api.bololex.com/api',
                'www': 'https://bololex.com',
                'doc': 'https://documenter.getpostman.com/view/11272664/SzmZbztP?version=latest',
                'fees': [
                    'https://bololex.com/fees',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'symbols',
                        'currencies',
                        'prices',
                        'prices/{symbol}',
                        'book/{symbol}',
                        'trades',
                        'tradeview/history',
                    ],
                },
                'private': {
                    'get': [
                        'user/balances',
                        'user/trades',
                        'user/deposit/{currency}',
                        'orders/{orderID}',
                        'orders/history',
                        'orders',
                    ],
                    'post': [
                        'orders',
                        'user/deposit/{currency}',
                        'user/withdraw',
                    ],
                    'delete': [
                        'orders/{orderID}',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    'ORDER_NOT_FOUND': OrderNotFound,
                },
                'broad': {
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'options': {
                'defaultTimeInForce': 'IOC',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetSymbols (params);
        const markets = this.safeValue (response, 'result', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const symbol = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const lot = this.safeFloat (market, 'lotSize');
            const pricePrecision = this.safeFloat (market, 'pricePrecision');
            const step = Math.pow (10, -pricePrecision);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            result.push ({
                'info': market,
                'id': symbol.replace ('/', '-'),
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'lot': lot,
                'step': step,
                'active': this.safeValue (market, 'isActive'),
                'precision': {
                    'amount': this.precisionFromString (this.numberToString (lot)),
                    'price': pricePrecision,
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minTradeSize'),
                        'max': undefined,
                    },
                    'price': {
                        'min': step,
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

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        const currencies = this.safeValue (response, 'result', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'symbol');
            const code = this.safeCurrencyCode (id);
            result[code] = ({
                'info': currencies[i],
                'id': id,
                'code': code,
                'name': this.safeString (currency, 'name'),
                'active': this.safeValue (currency, 'isActive'),
                'fee': undefined,
                'precision': this.safeInteger (currency, 'amountPrecision'),
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
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUserBalances (params);
        const balance = this.safeValue (response, 'result', []);
        return this.parseBalance (balance);
    }

    parseBalance (balance) {
        const result = { 'info': balance, 'free': {}, 'used': {}, 'total': {}};
        const currencies = Object.keys (balance.available);
        for (let i = 0; i < currencies.length; i++) {
            const code = currencies[i];
            // console.log (this.asFloat (balances.available[code]));
            const fValue = this.asFloat (balance.available[code]);
            const tValue = this.asFloat (balance.total[code]);
            const uValue = this.asFloat (this.decimalToPrecision (this.sum (tValue, -fValue), 3, 6));
            result[code] = {
                'free': fValue,
                'used': uValue,
                'total': tValue,
            };
            result.free[code] = fValue;
            result.used[code] = uValue;
            result.total[code] = tValue;
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetBookSymbol (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        const orderbook = this.safeValue (response, 'result', []);
        // console.log (orderbook);
        return this.parseOrderBook (orderbook, symbol, undefined, 'buy', 'sell', 'price', 'quantity');
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.marketId (symbol),
            'resolution': this.timeframes[timeframe],
            'from': since / 1000,
        };
        const response = await this.publicGetTradeviewHistory (this.extend (request, params));
        const raw = this.safeValue (response, 'result', []);
        return this.parseTradingViewOHLCV (raw, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        const data = {
            'timestamp': ohlcv[0],
            'open': ohlcv[1],
            'max': ohlcv[2],
            'min': ohlcv[3],
            'close': ohlcv[4],
            'volume': ohlcv[5],
        };
        return [
            this.safeInteger (data, 'timestamp'),
            this.safeFloat (data, 'open'),
            this.safeFloat (data, 'max'),
            this.safeFloat (data, 'min'),
            this.safeFloat (data, 'close'),
            this.safeFloat (data, 'volume'),
        ];
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetPrices (params);
        const tickers = this.safeValue (response, 'result', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            let symbol = this.safeString (ticker, 'symbol');
            symbol = symbol.replace ('/', '-');
            const market = this.markets_by_id[symbol];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = { 'symbol': this.marketId (symbol) };
        const response = await this.publicGetPricesSymbol (this.extend (request, params));
        const tickers = this.safeValue (response, 'result', []);
        return this.parseTicker (tickers[0], market);
    }

    parseTicker (ticker, market = undefined) {
        const datetime = this.safeString (ticker, 'timestamp');
        const last = this.safeFloat (ticker, 'last');
        const open = this.safeFloat (ticker, 'open');
        const volume = this.safeValue (ticker, 'volume');
        return {
            'symbol': this.safeString (ticker, 'symbol'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'priceChange'),
            'average': undefined,
            'baseVolume': this.safeFloat (volume, 'base'),
            'quoteVolume': this.safeFloat (volume, 'quote'),
            'info': ticker,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 10, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        this.omit (params, 'page');
        const request = {
            'symbol': this.marketId (symbol),
            'limit': limit,
        };
        if (since !== undefined) {
            request['startDate'] = since;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        const trades = this.safeValue (response, 'result', []);
        // return trades;
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            symbol = this.marketId (symbol);
        } else {
            symbol = 'any';
        }
        const page = this.safeInteger (params, 'page', 1);
        this.omit (params, 'page');
        const request = {
            'symbol': symbol,
            'startDate': since,
            'endDate': this.milliseconds (),
            'page': page,
            'itemsPerPage': limit,
        };
        const response = await this.privateGetUserTrades (this.extend (request, params));
        const trades = this.safeValue (this.safeValue (response, 'result'), 'trades', []);
        // return trades;
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const datetime = this.safeString (trade, 'created');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'quantity');
        const cost = price * amount; // total cost (including fees), `price * amount`
        return {
            'info': trade,
            'id': this.safeString (trade, 'tradeId'),
            'order': undefined,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': this.safeString (trade, 'symbol', this.safeString (trade, 'pair')),
            'type': undefined,
            'side': this.safeString (trade, 'side').toLowerCase (),
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': {
                'cost': this.safeFloat (trade, 'fee'),
                'currency': undefined,
                'rate': undefined,
            },
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        // const market = this.market (symbol);
        amount = this.asFloat (amount);
        const request = {
            'symbol': this.marketId (symbol),
            'side': side,
            'quantity': amount,
            'type': type,
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        } else {
            request['subType'] = this.safeString (params, 'subType', this.options['defaultTimeInForce'].toLowerCase ());
            this.omit (params, 'subType');
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const order = this.parseOrder (this.safeValue (response, 'result', []));
        if (order['status'] === 'rejected') {
            throw new InvalidOrder (this.id + ' order was rejected by the exchange ' + this.json (order));
        }
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderID': id,
        };
        const response = await this.privateDeleteOrdersOrderID (this.extend (request, params));
        return this.parseOrder (this.safeValue (response, 'result', []));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetOrdersOrderID ({ 'orderID': id });
        const order = this.safeValue (response, 'result', []);
        if (order) {
            return this.parseOrder (order);
        }
        throw new OrderNotFound (this.id + ' fetchOrder() error: ' + this.response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            symbol = this.marketId (symbol);
        } else {
            symbol = 'any';
        }
        const page = this.safeInteger (params, 'page', 1);
        this.omit (params, 'page');
        const request = {
            'symbol': symbol,
            'startDate': since,
            'endDate': this.milliseconds (),
            // 'side': 'any',
            // 'type': 'any',
            // 'userId': 'any',
            'page': page,
            'itemsPerPage': limit || 10,
            'hideCanceled': false,
        };
        const response = await this.privateGetOrdersHistory (this.extend (request, params));
        const orders = this.safeValue (response, 'result', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            symbol = this.marketId (symbol);
        } else {
            symbol = 'any';
        }
        const page = this.safeInteger (params, 'page', 1);
        this.omit (params, 'page');
        const request = {
            'symbol': symbol,
            'startDate': since,
            'endDate': this.milliseconds (),
            // 'side': 'any',
            // 'type': 'any',
            // 'userId': 'any',
            'page': page,
            'itemsPerPage': limit || 10,
            'hideCanceled': true,
        };
        const response = await this.privateGetOrdersHistory (this.extend (request, params));
        const orders = this.safeValue (response, 'result', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            symbol = this.marketId (symbol);
        } else {
            symbol = 'any';
        }
        const page = this.safeInteger (params, 'page', 1);
        this.omit (params, 'page');
        const request = {
            'symbol': symbol,
            // 'side': '',
            // 'type': '',
            // 'userId': '',
            'page': page,
            'itemsPerPage': limit || 10,
        };
        const response = await this.privateGetOrders (this.extend (request, params));
        const orders = this.safeValue (response, 'result', []);
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            // 'inactive':
            'new': 'open',
            'partial': 'closed',
            'filled': 'closed',
            'cancelled': 'canceled',
            'rejected': 'rejected',
        };
        return this.safeString (statuses, status);
    }

    parseOrder (order, market = undefined) {
        const datetime = this.safeString (order, 'created');
        const symbol = this.safeString (order, 'symbol');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let price = this.safeFloat (order, 'price');
        const avgPrice = this.safeFloat (order, 'averagePrice');
        price = price || avgPrice;
        const amount = this.safeFloat (order, 'quantity');
        const amountFilled = this.safeFloat (order, 'cumQuantity');
        const remaining = this.sum (amount, -amountFilled);
        const cost = price * amountFilled;
        const id = this.safeString (order, 'orderID');
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        return {
            'id': id,
            'info': order,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': amountFilled,
            'remaining': remaining,
            'fee': undefined,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetUserDepositCurrency (this.extend (request, params));
        const address = this.safeValue (response, 'result')['address'];
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostUserDepositCurrency (this.extend (request, params));
        const address = this.safeValue (response, 'result')['address'];
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        const response = await this.privatePostUserWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'result'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            headers = {
                'X-API-Key': this.apiKey,
            };
            if (method === 'GET') {
                url += '?' + this.urlencode (query);
            }
            if (method === 'POST') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    headers['Content-Type'] = 'application/json';
                    // application/x-www-form-urlencoded
                    // body = this.urlencode (query);
                }
            }
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined, config = {}, context = {}) {
        return await this.fetch2 (path, api, method, params, headers, body);
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
        }
        const status = this.safeValue (response, 'status', false);
        if (!status) {
            const type = this.safeValue (response, 'type');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], type, feedback);
            // this.throwBroadlyMatchedException (this.exceptions['broad'], response, feedback);
            throw new ExchangeError (feedback); // unknown error
        }
        if ('ExecutionReport' in response) {
            if (response['ExecutionReport']['orderRejectReason'] === 'orderExceedsLimit') {
                throw new InsufficientFunds (this.id + ' ' + this.json (response));
            }
        }
        // throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
