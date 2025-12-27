//  ---------------------------------------------------------------------------

import Exchange from './abstract/lcx';
import { BadRequest, AuthenticationError, InsufficientFunds, InvalidOrder, ExchangeNotAvailable, BadResponse, ExchangeError, RateLimitExceeded, BadSymbol, InvalidAddress, DDoSProtection } from './base/errors.js';
import { Int, OHLCV, Str } from './base/types';
import { sha256 } from './static_dependencies/noble-hashes/sha256';

//  ---------------------------------------------------------------------------

/**
 * @class lcx
 * @augments Exchange
 */
export default class lcx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lcx',
            'name': 'lcx',
            'countries': [ 'LI' ],
            'rateLimit': 1000, // ms
            'has': {
                'CORS': true,
                'spot': true,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
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
                'logo': 'https://terminal-files.lcx.com/static/img/ccxt/LCX.jpg',
                'api': {
                    'accounts': 'https://exchange-api.lcx.com',
                    'public': 'https://exchange-api.lcx.com',
                    'private': 'https://exchange-api.lcx.com',
                },
                'www': 'https://www.lcx.com',
                'doc': [
                    'https://exchange.lcx.com/v1/docs',
                ],
                'fees': 'https://www.lcx.com/fees/',
                'referral': 'https://accounts.lcx.com/register',
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
                    'maker': 0.003,
                    'taker': 0.003,
                },
            },
            'exceptions': {
                'exact': {
                    'UNAUTHORIZED': AuthenticationError,
                    'INVALID_ARGUMENT': BadRequest,
                    'TRADING_UNAVAILABLE': ExchangeNotAvailable,
                    'Invalid amount': InvalidOrder,
                    'Invalid price': InvalidOrder,
                    'Not Enough Balance': InsufficientFunds,
                    'NOT_ALLOWED_COMBINATION': BadRequest,
                    'Invalid order': InvalidOrder,
                    'RATE_LIMIT_EXCEEDED': RateLimitExceeded,
                    'MARKET_UNAVAILABLE': ExchangeNotAvailable,
                    'INVALID_MARKET': BadSymbol,
                    'INVALID_CURRENCY': BadRequest,
                    'TOO_MANY_OPEN_ORDERS': DDoSProtection,
                    'DUPLICATE_ADDRESS': InvalidAddress,
                    'Bad Request': BadRequest,
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
            const takerFeeRate = 0.003;
            const makerFeeRate = 0.003;
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
                'taker': takerFeeRate,
                'maker': makerFeeRate,
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
            account['total'] = this.safeString (balance.balance, 'totalBalance');
            account['free'] = this.safeString (balance.balance, 'freeBalance');
            account['used'] = this.safeString (balance.balance, 'occupiedBalance');
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
        return this.parseTickers (data, symbols);
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
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'lastUpdated') * 1000;
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
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'bestAsk'),
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

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        if (symbol !== undefined) {
            request['pair'] = market['symbol'];
        }
        request['offset'] = 1;
        const pageInParams = ('page' in params);
        if (pageInParams) {
            params = this.extend (params, {
                'offset': parseInt (params['page']),
            });
        }
        const response = await this.privatePostOrderHistory (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseTrades (data, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['symbol'],
        };
        request['offset'] = 1;
        const response = await this.publicPostTradeRecent (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        let result = [];
        for (let i = 0; i < data.length; i++) {
            result.push (this.parseTrade (data[i], market));
        }
        result = this.sortBy (result, 'timestamp');
        return result;
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parseNumber (this.safeInteger (trade, 3) * 1000);
        const id = trade[3].toString ();
        const symbol = this.safeString (market, 'symbol');
        let side = this.safeString (trade[2], 'side');
        side = (side === 'BUY') ? 'buy' : 'sell';
        const price = this.parseNumber (trade[0]);
        const amount = this.parseNumber (trade[1]);
        const orderId = id;
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

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['symbol'],
            'resolution': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['from'] = since;
        } else {
            request['from'] = this.nonce () - 86400000;
        }
        if (request['from'] !== undefined) {
            if (limit === undefined) {
                limit = 1000;
            }
            const duration = this.parseTimeframe (timeframe);
            const endTime = this.sum (request['from'], limit * duration * 1000 - 1);
            const now = this.milliseconds ();
            request['to'] = Math.min (now, endTime);
        }
        if (request['from'] !== undefined) {
            request['from'] = request['from'] / 1000;
        }
        if (request['to'] !== undefined) {
            request['to'] = request['to'] / 1000;
        }
        const response = await this.publicPostMarketKline (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined): OHLCV {
        return [
            this.safeNumber (ohlcv, 'timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        since = this.parse8601 (since);
        const request = {};
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (symbol !== undefined) {
            request['pair'] = market['symbol'];
        }
        request['offset'] = 1;
        const pageInParams = ('page' in params);
        if (pageInParams) {
            params = this.extend (params, {
                'offset': parseInt (params['page']),
            });
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
        request['offset'] = 1;
        const pageInParams = ('page' in params);
        if (pageInParams) {
            params = this.extend (params, {
                'offset': parseInt (params['page']),
            });
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
        const cost = this.safeFloat (order, 'Cost');
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
        if (api === 'private') {
            path = 'api' + '/' + path;
            const now = this.nonce ();
            this.checkRequiredCredentials ();
            let payload = method + '/' + path + this.json (query);
            if (method === 'GET') {
                payload = method + '/' + path;
            }
            const signature = this.hmac (payload, this.secret, sha256, 'base64');
            headers = {
                'x-access-key': this.apiKey,
                'x-access-sign': signature,
                'x-access-timestamp': now,
            };
        }
        url += this.implodeParams (path, params);
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        if (method === 'POST') {
            if (Object.keys (query).length) {
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (code === 401) {
            this.throwExactlyMatchedException (this.exceptions, body, body);
            return;
        }
        if (response === undefined) {
            return;
        }
        const feedback = this.id + ' ' + body;
        const message = this.safeString (response, 'message');
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
        }
        if ('errorCode' in response) {
            const errorCode = this.safeString (response, 'errorCode');
            if (errorCode !== undefined) {
                this.throwBroadlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
}
