'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InvalidOrder } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitmax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmax',
            'name': 'bitmax',
            'countries': [ 'CN' ], // Japan, Malta
            'rateLimit': 500,
            'certified': true,
            // new metainfo interface
            'has': {
                'fetchDepositAddress': true,
                'CORS': false,
                'fetchBidsAsks': false,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchMyTrades': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': false,
                'fetchFundingFees': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'fetchTransactions': false,
                'fetchCurrencies': false,
                'fetchStatus': false,
            },
            'timeframes': {
                '1m': 1,
                '3m': 3,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '2h': 120,
                '4h': 240,
                '6h': 360,
                '12h': 720,
                '1d': '1d',
                '1w': '1w',
                '1M': '1m',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/12462602/60425376-f41fef00-9c24-11e9-899b-e3af164ff9e2.png',
                'api': {
                    'public': 'https://bitmax.io/api/v1',
                    'private': 'https://bitmax.io/api/v1',
                },
                'www': 'https://bitmax.io',
                'referral': 'https://bitmax.io/#/register?inviteCode=0PPRJOQ2',
                'doc': [
                    'https://github.com/bitmax-exchange/api-doc/blob/master/bitmax-api-doc-v1.2.md',
                ],
                'fees': 'https://bitmax.io/#/feeRate/tradeRate',
            },
            'api': {
                'public': {
                    'get': [
                        'depth',
                        'trades',
                        'products',
                        'ticker/24hr',
                        'barhist',
                    ],
                },
                'private': {
                    'get': [
                        'user/info',
                        'balance',
                        'order/open',
                        'order',
                        'order/history',
                        'order/{coid}',
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
                    'taker': 0.0004,
                    'maker': 0.0004,
                },
            },
            'options': {
                'accountGroup': -1,
                'fetchTradesMethod': 'publicGetAggTrades',
                'fetchTickersMethod': 'publicGetTicker24hr',
                'defaultTimeInForce': 'GTC',
                'defaultLimitOrderType': 'limit',
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                'recvWindow': 5 * 1000,
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'parseOrderToPrecision': false,
                'newOrderRespType': {
                    'market': 'FULL',
                    'limit': 'RESULT',
                },
            },
            'exceptions': {},
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetProducts (params);
        const markets = response;
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            // "123456" is a "test symbol/market"
            if (id === '123456') {
                continue;
            }
            const baseId = market['baseAsset'];
            const quoteId = market['quoteAsset'];
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'base': market['qtyScale'],
                'quote': market['qtyScale'],
                'amount': market['qtyScale'],
                'price': market['notionalScale'],
            };
            const status = this.safeString (market, 'status');
            const active = (status === 'Normal');
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
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
                },
            };
            result.push (entry);
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
        let cost = amount * rate;
        let precision = market['precision']['price'];
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
            precision = market['precision']['amount'];
        }
        cost = this.decimalToPrecision (cost, ROUND, precision, this.precisionMode);
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (cost),
        };
    }

    async loadAccountGroup () {
        if (this.options['accountGroup'] === -1) {
            const res = await this.privateGetUserInfo ();
            const group = this.safeInteger (res, 'accountGroup', -1);
            this.options['accountGroup'] = group;
        }
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        await this.loadAccountGroup ();
        const response = await this.privateGetBalance (params);
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = balance['assetCode'];
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'availableAmount');
            account['used'] = this.safeFloat (balance, 'inOrderAmount');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'],
        };
        if (limit !== undefined) {
            request['n'] = limit; // default = maximum = 100
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        const orderbook = this.parseOrderBook (response);
        const timestamp = this.safeInteger (response, 'ts');
        orderbook['nonce'] = timestamp;
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'barStartTime');
        const symbol = this.findSymbol (this.safeString (ticker, 'symbol'), market);
        const last = this.safeFloat (ticker, 'closePrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': this.safeFloat (ticker, 'bidPrice'),
            'bidVolume': this.safeFloat (ticker, 'bidQty'),
            'ask': this.safeFloat (ticker, 'askPrice'),
            'askVolume': this.safeFloat (ticker, 'askQty'),
            'vwap': this.safeFloat (ticker, 'weightedAvgPrice'),
            'open': this.safeFloat (ticker, 'openPrice'),
            'close': last,
            'last': last,
            'previousClose': this.safeFloat (ticker, 'prevClosePrice'), // previous day close
            'change': this.safeFloat (ticker, 'priceChange'),
            'percentage': this.safeFloat (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'],
        };
        const response = await this.publicGetTicker24hr (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
        };
        const response = await this.publicGetTicker24hr (this.extend (request, params));
        return this.parseTickers (response, symbols);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        // this exchange return data is wrong, sometimes open > high
        return [
            ohlcv['t'],
            parseFloat (ohlcv['o']),
            parseFloat (ohlcv['h']),
            parseFloat (ohlcv['l']),
            parseFloat (ohlcv['c']),
            parseFloat (ohlcv['v']),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'],
            'interval': this.timeframes[timeframe],
        };
        const now = this.nonce ();
        request['from'] = now - this.timeframes[timeframe] * 60 * 1000 * 500;
        request['to'] = now;
        const response = await this.publicGetBarhist (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger (trade, 't');
        const price = this.safeFloat (trade, 'p');
        const amount = this.safeFloat (trade, 'q');
        const takerOrMaker = trade['bm'] ? 'maker' : 'taker';
        const symbol = market['symbol'];
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': undefined,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['n'] = limit; // default = 500, maximum = 1000
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'PendingNew': 'open',
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'Canceled': 'canceled',
            'Rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
        let timestamp = undefined;
        if ('time' in order) {
            timestamp = this.safeInteger (order, 'time');
        }
        let price = this.safeFloat (order, 'orderPrice');
        const amount = this.safeFloat (order, 'orderQty');
        const filled = this.safeFloat (order, 'filledQty');
        let remaining = undefined;
        let cost = this.safeFloat (order, 'cummulativeQuoteQty');
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
                if (this.options['parseOrderToPrecision']) {
                    remaining = parseFloat (this.amountToPrecision (symbol, remaining));
                }
                remaining = Math.max (remaining, 0.0);
            }
            if (price !== undefined) {
                if (cost === undefined) {
                    cost = price * filled;
                }
            }
        }
        const id = this.safeString (order, 'coid');
        let type = this.safeString (order, 'orderType');
        if (type !== undefined) {
            type = type.toLowerCase ();
            if (type === 'market') {
                if (price === 0.0) {
                    if ((cost !== undefined) && (filled !== undefined)) {
                        if ((cost > 0) && (filled > 0)) {
                            price = cost / filled;
                        }
                    }
                }
            }
        }
        let side = this.safeString (order, 'side');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        const fee = {
            'cost': this.safeFloat (order, 'fee'),
            'currency': this.safeString (order, 'feeAsset'),
        };
        const average = this.safeFloat (order, 'avgPrice');
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
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccountGroup ();
        const market = this.market (symbol);
        const test = this.safeValue (params, 'test', false);
        if (test) {
            params = this.omit (params, 'test');
        }
        const request = {
            'coid': this.coid (),
            'time': this.nonce (),
            'symbol': market['id'],
            'orderPrice': this.priceToPrecision (symbol, price),
            'orderQty': this.amountToPrecision (symbol, amount),
            'orderType': type,
            'side': side,
        };
        const response = await this.privatePostOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadAccountGroup ();
        const market = this.market (symbol);
        const request = {
            'coid': id,
        };
        const response = await this.privateGetOrderCoid (this.extend (request, params));
        const order = this.safeValue (response, 'data', {});
        return this.parseOrder (order, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadAccountGroup ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetOrderHistory (this.extend (request, params));
        let orders = this.safeValue (response, 'data', {});
        orders = this.safeValue (orders, 'data', {});
        orders = this.safeValue (orders, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccountGroup ();
        const market = this.market (symbol);
        const request = {};
        request['symbol'] = market['id'];
        const response = await this.privateGetOrderOpen (this.extend (request, params));
        const orders = this.safeValue (response, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadAccountGroup ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'coid': this.coid (),
            'origCoid': id,
            'time': this.nonce (),
        };
        const response = await this.privateDeleteOrder (this.extend (request, params));
        const order = this.safeValue (response, 'data', {});
        return this.parseOrder (order);
    }

    coid () {
        const uuid = this.uuid ();
        const parts = uuid.split ('-');
        const clientOrderId = parts.join ('');
        const coid = clientOrderId.slice (0, 32);
        return coid;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        // fix sign params
        if (this.options['accountGroup'] !== -1) {
            url = url.replace ('/api/', '/' + this.options['accountGroup'] + '/api/');
        }
        url += '/' + this.implodeParams (path, params);
        // fix sign error
        path = path.replace ('/{coid}', '');
        url = url.replace ('v1/order/history', 'v2/order/history');
        let timestamp = this.nonce ();
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let coid = this.coid ();
            if ('coid' in params) {
                coid = params['coid'];
            }
            if ('time' in params) {
                timestamp = params['time'];
            }
            timestamp = this.decimalToPrecision (timestamp, 13);
            let query = timestamp + '+' + path;
            if (method !== 'GET') {
                query += '+' + coid;
            }
            const signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha256', 'base64');
            headers = {
                'x-auth-key': this.apiKey,
                'x-auth-signature': signature,
                'x-auth-timestamp': timestamp,
                'Content-Type': 'application/json',
            };
            if (method !== 'GET') {
                headers['x-auth-coid'] = coid;
                body = this.json (params);
            }
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return;
        }
        code = this.safeInteger (response, 'code', 0);
        if (code !== 0) {
            const feedback = this.id + ' ' + body;
            const exceptions = this.exceptions;
            if (code in exceptions) {
                throw new exceptions[code] (feedback);
            }
            const message = this.safeString (response, 'message');
            if (message === 'Duplicate clientOrderId') {
                throw new InvalidOrder (feedback);
            }
            throw new ExchangeError (feedback);
        }
    }
};
