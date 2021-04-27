'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, BadResponse, BadRequest, InvalidOrder, InsufficientFunds, AuthenticationError, RateLimitExceeded, DDoSProtection, BadSymbol } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class lcx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lcx',
            'name': 'lcx',
            'countries': ['LI'],
            'rateLimit': 250, // ms
            'has': {
                'CORS': true,
                'fetchMarkets': true,
                'fetchTickers': true,
                'fetchTicker': true,
                'fetchOHLCV': false,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '45m': '45',
                '1h': '60',
                '2h': '120',
                '3h': '180',
                '4h': '240',
                '1d': '1D',
                '1w': '1W',
                '1M': '1M',
            },
            'version': 'v1',
            'urls': {
                'logo': 'https://web.lcx.com/wp-content/uploads/2018/12/logo_black.png',
                'api': {
                    'accounts': 'https://exchange-api.lcx.com',
                    'public': 'https://exchange-api.lcx.com',
                    'private': 'https://exchange-api.lcx.com',
                },
                'www': 'https://www.lcx.com',
                'doc': [
                    'https://exchange.lcx.com/v1/docs',
                ],
                'fees': 'https://exchange.lcx.com/setting/fees',
                'referral': 'https://accounts.lcx.com/register?referralCode=CCXT_DOCS',
            },
            'api': {
                'public': {
                    'get': [
                        'market/pairs',
                        'currency',
                        'market/tickers',
                    ],
                    'post': [
                        'order/book',
                        'market/ticker',
                        'market/kline',
                        'trade/recent',
                    ],
                },
                'private': {
                    'post': [
                        'orderHistory',
                        'open',
                        'create',
                        'cancel',
                    ],
                    'get': [
                        'balances',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.3 / 100,
                    'taker': 0.3 / 100,
                },
            },
            'exceptions': {
                'exact': {
                    'UNAUTHORIZED': AuthenticationError,
                    'INVALID_ARGUMENT': BadRequest, // Parameters are not a valid format, parameters are empty, or out of range, or a parameter was sent when not required.
                    'TRADING_UNAVAILABLE': ExchangeNotAvailable,
                    'NOT_ENOUGH_BALANCE': InsufficientFunds,
                    'NOT_ALLOWED_COMBINATION': BadRequest,
                    'INVALID_ORDER': InvalidOrder, // Requested order does not exist, or it is not your order
                    'RATE_LIMIT_EXCEEDED': RateLimitExceeded, // You are sending requests too frequently. Please try it later.
                    'MARKET_UNAVAILABLE': ExchangeNotAvailable, // Market is closed today
                    'INVALID_MARKET': BadSymbol, // Requested market is not exist
                    'INVALID_CURRENCY': BadRequest, // Requested currency is not exist on ProBit system
                    'TOO_MANY_OPEN_ORDERS': DDoSProtection, // Too many open orders
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {},
            'commonCurrencies': {
                'LCX': 'LCX',
                'BTC': 'Bitcoin',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarketPairs (params);
        const markets = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeString (market, 'base');
            const quote = this.safeString (market, 'quote');
            const symbol = base + '/' + quote;
            const active = this.safeValue (market, 'status', false);
            const amountPrecision = this.safeInteger (market, 'amountPrecision');
            const costPrecision = this.safeInteger (market, 'amountPrecision');
            const precision = {
                'amount': amountPrecision,
                'price': this.safeFloat (market, 'pricePrecision'),
                'cost': costPrecision,
            };
            const takerFeeRate = this.safeFloat (market, 'taker_fee_rate');
            const makerFeeRate = this.safeFloat (market, 'maker_fee_rate');
            result.push ({
                'id': id,
                'info': market,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'taker': takerFeeRate / 100,
                'maker': makerFeeRate / 100,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minBaseOrder'),
                        'max': this.safeFloat (market, 'maxBaseOrder'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'min_price'),
                        'max': this.safeFloat (market, 'max_price'),
                    },
                    'cost': {
                        'min': this.safeFloat (market, 'minQuoteOrder'),
                        'max': this.safeFloat (market, 'maxQuoteOrder'),
                    },
                },
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalances ({});
        const data = this.safeValue (response, 'data');
        const result = { 'info': data };
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const code = this.safeString (balance, 'coin');
            const account = this.account ();
            account['total'] = this.safeFloat (balance.balance, 'totalBalance');
            account['free'] = this.safeFloat (balance.balance, 'freeBalance');
            account['used'] = this.safeFloat (balance.balance, 'occupiedBalance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['symbol'],
        };
        const response = await this.publicPostOrderBook (this.extend (request, params));
        const orderbook = this.safeValue (response, 'data', {});
        return {
            'bids': this.safeValue (orderbook, 'buy', []),
            'asks': this.safeValue (orderbook, 'sell', []),
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.publicGetMarketTickers (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseTickers (data);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        rawTickers = Object.values (rawTickers);
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['symbol'],
        };
        params['pair'] = market['symbol'];
        const response = await this.publicPostMarketTicker (this.extend (request, params));
        const ticker = this.safeValue (response, 'data', []);
        if (ticker === undefined) {
            throw new BadResponse (this.id + ' fetchTicker () returned an empty response');
        }
        return this.parseTicker (ticker);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'lastUpdated');
        const symbol = this.safeString (ticker, 'symbol');
        const close = this.safeFloat (ticker, 'lastPrice');
        const change = this.safeFloat (ticker, 'change');
        let percentage = undefined;
        let open = undefined;
        if (change !== undefined) {
            if (close !== undefined) {
                open = close - change;
                percentage = open ? (change / open) * 100 : 0;
            }
        }
        const baseVolume = this.safeFloat (ticker, 'volume');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bestBid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'bestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        if (symbol !== undefined) {
            request['pair'] = market['symbol'];
        }
        if (params['page'] !== undefined) {
            request['offset'] = params['page'];
        } else {
            request['offset'] = 1;
        }
        const response = await this.privatePostOrderHistory (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrders (data, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['symbol'],
        };
        if (params['page'] !== undefined) {
            request['offset'] = params['page'];
        } else {
            request['offset'] = 1;
        }
        const response = await this.publicPostTradeRecent (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = trade[3] * 1000;
        const id = trade[3].toString ();
        const symbol = this.safeString (market, 'symbol');
        let side = this.safeString (trade[2], 'side');
        side = (side === 'BUY') ? 'buy' : 'sell';
        const price = trade[0];
        const amount = trade[1];
        const orderId = undefined;
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        since = this.parse8601 (since);
        const request = {};
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (symbol !== undefined) {
            request['pair'] = market['symbol'];
        }
        if (params['page'] !== undefined) {
            request['offset'] = params['page'];
        } else {
            request['offset'] = 1;
        }
        if (since) {
            request['fromDate'] = this.iso8601 (since);
            request['toDate'] = this.iso8601 (this.nonce ());
        }
        const response = await this.privatePostOpen (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {};
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (symbol !== undefined) {
            request['pair'] = market['symbol'];
        }
        if (params['page'] !== undefined) {
            request['offset'] = params['page'];
        } else {
            request['offset'] = 1;
        }
        if (since) {
            request['fromDate'] = this.iso8601 (since);
            request['toDate'] = this.iso8601 (this.nonce ());
        }
        const response = await this.privatePostOrderHistory (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const orders = this.parseOrders (data, market, since, limit);
        return this.filterBy (orders, 'status', 'closed');
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        let status = this.parseOrderStatus (this.safeString (order, 'Status'));
        const id = this.safeString (order, 'Id');
        let side = this.safeString (order, 'Side');
        let type = this.safeString (order, 'OrderType');
        type = type.toLowerCase ();
        status = status.toLowerCase ();
        side = side.toLowerCase ();
        const symbol = this.safeString (order, 'Pair');
        const timestamp = this.safeFloat (order, 'UpdatedAt');
        let price = this.safeFloat (order, 'Price');
        const filled = this.safeFloat (order, 'Filled');
        let remaining = this.safeFloat (order, 'Amount');
        const canceledAmount = this.safeFloat (order, 'cancelled_quantity');
        if (canceledAmount !== undefined) {
            remaining = this.sum (remaining, canceledAmount);
        }
        const amount = this.safeFloat (order, 'Amount');
        const cost = this.safeFloat2 (order, 'Cost');
        if (type === 'market') {
            price = undefined;
        }
        const average = this.safeFloat (order, 'Average');
        let clientOrderId = this.safeString (order, 'client_order_id');
        if (clientOrderId === '') {
            clientOrderId = undefined;
        }
        return {
            'id': id,
            'info': order,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'status': status,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': average,
            'cost': cost,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'Pair': market['symbol'],
            'Amount': parseFloat (this.amountToPrecision (symbol, amount)),
            'Price': parseFloat (this.priceToPrecision (symbol, price)),
            'OrderType': type.toUpperCase (),
            'Side': side.toUpperCase (),
        };
        const response = await this.privatePostCreate (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'OrderId': id,
        };
        const response = await this.privatePostCancel (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (method === 'POST') {
                url += this.implodeParams (path, params);
                body = this.json (query);
            } else {
                url += this.implodeParams (path, params);
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
        } else if (api === 'private') {
            path = 'api' + '/' + path;
            const now = this.nonce ();
            this.checkRequiredCredentials ();
            let payload = method + '/' + path;
            if (method !== 'GET') {
                payload = method + '/' + path + this.json (query);
            }
            const signature = this.hmac (payload, this.secret, 'sha256', 'base64');
            headers = {
                'x-access-key': this.apiKey,
                'x-access-sign': signature,
                'x-access-timestamp': now,
            };
            url += this.implodeParams (path, params);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (Object.keys (query).length) {
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('errorCode' in response) {
            const errorCode = this.safeString (response, 'errorCode');
            const message = this.safeString (response, 'message');
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
