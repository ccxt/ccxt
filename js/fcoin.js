'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class fcoin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'fcoin',
            'name': 'FCoin',
            'countries': [ 'CN' ],
            'rateLimit': 2000,
            'userAgent': this.userAgents['chrome39'],
            'version': 'v2',
            'accounts': undefined,
            'accountsById': undefined,
            'hostname': 'api.fcoin.com',
            'has': {
                'CORS': false,
                'fetchDepositAddress': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchTradingLimits': false,
                'withdraw': false,
                'fetchCurrencies': false,
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '1d': 'D1',
                '1w': 'W1',
                '1M': 'MN',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/42244210-c8c42e1e-7f1c-11e8-8710-a5fb63b165c4.jpg',
                'api': 'https://api.fcoin.com',
                'www': 'https://www.fcoin.com',
                'referral': 'https://www.fcoin.com/i/Z5P7V',
                'doc': 'https://developer.fcoin.com',
                'fees': 'https://support.fcoin.com/hc/en-us/articles/360003715514-Trading-Rules',
            },
            'api': {
                'market': {
                    'get': [
                        'ticker/{symbol}',
                        'depth/{level}/{symbol}',
                        'trades/{symbol}',
                        'candles/{timeframe}/{symbol}',
                    ],
                },
                'public': {
                    'get': [
                        'symbols',
                        'currencies',
                        'server-time',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/balance',
                        'orders',
                        'orders/{order_id}',
                        'orders/{order_id}/match-results', // check order result
                    ],
                    'post': [
                        'orders',
                        'orders/{order_id}/submit-cancel', // cancel order
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.001,
                    'taker': 0.001,
                },
            },
            'limits': {
                'amount': { 'min': 0.01, 'max': 100000 },
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'limits': {
                    'BTM/USDT': { 'amount': { 'min': 0.1, 'max': 10000000 }},
                    'ETC/USDT': { 'amount': { 'min': 0.001, 'max': 400000 }},
                    'ETH/USDT': { 'amount': { 'min': 0.001, 'max': 10000 }},
                    'LTC/USDT': { 'amount': { 'min': 0.001, 'max': 40000 }},
                    'BCH/USDT': { 'amount': { 'min': 0.001, 'max': 5000 }},
                    'BTC/USDT': { 'amount': { 'min': 0.001, 'max': 1000 }},
                    'ICX/ETH': { 'amount': { 'min': 0.01, 'max': 3000000 }},
                    'OMG/ETH': { 'amount': { 'min': 0.01, 'max': 500000 }},
                    'FT/USDT': { 'amount': { 'min': 1, 'max': 10000000 }},
                    'ZIL/ETH': { 'amount': { 'min': 1, 'max': 10000000 }},
                    'ZIP/ETH': { 'amount': { 'min': 1, 'max': 10000000 }},
                    'FT/BTC': { 'amount': { 'min': 1, 'max': 10000000 }},
                    'FT/ETH': { 'amount': { 'min': 1, 'max': 10000000 }},
                },
            },
            'exceptions': {
                '400': NotSupported, // Bad Request
                '401': AuthenticationError,
                '405': NotSupported,
                '429': DDoSProtection, // Too Many Requests, exceed api request limit
                '1002': ExchangeNotAvailable, // System busy
                '1016': InsufficientFunds,
                '3008': InvalidOrder,
                '6004': InvalidNonce,
                '6005': AuthenticationError, // Illegal API Signature
            },
            'commonCurrencies': {
                'DAG': 'DAGX',
                'PAI': 'PCHAIN',
            },
        });
    }

    async fetchMarkets (params = {}) {
        let response = await this.publicGetSymbols ();
        let result = [];
        let markets = response['data'];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['name'];
            let baseId = market['base_currency'];
            let quoteId = market['quote_currency'];
            let base = baseId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            let quote = quoteId.toUpperCase ();
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let precision = {
                'price': market['price_decimal'],
                'amount': market['amount_decimal'],
            };
            let limits = {
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': Math.pow (10, precision['price']),
                },
            };
            if (symbol in this.options['limits']) {
                limits = this.extend (this.options['limits'][symbol], limits);
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetAccountsBalance (params);
        let result = { 'info': response };
        let balances = response['data'];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currencyId = balance['currency'];
            let code = currencyId.toUpperCase ();
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            } else {
                code = this.commonCurrencyCode (code);
            }
            let account = this.account ();
            account['free'] = parseFloat (balance['available']);
            account['total'] = parseFloat (balance['balance']);
            account['used'] = parseFloat (balance['frozen']);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseBidsAsks (orders, priceKey = 0, amountKey = 1) {
        let result = [];
        let length = orders.length;
        let halfLength = parseInt (length / 2);
        // += 2 in the for loop below won't transpile
        for (let i = 0; i < halfLength; i++) {
            let index = i * 2;
            let priceField = this.sum (index, priceKey);
            let amountField = this.sum (index, amountKey);
            result.push ([
                this.safeFloat (orders, priceField),
                this.safeFloat (orders, amountField),
            ]);
        }
        return result;
    }

    async fetchOrderBook (symbol = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit !== undefined) {
            if ((limit === 20) || (limit === 100)) {
                limit = 'L' + limit.toString ();
            } else {
                throw new ExchangeError (this.id + ' fetchOrderBook supports limit of 20, 100 or no limit. Other values are not accepted');
            }
        } else {
            limit = 'full';
        }
        let request = this.extend ({
            'symbol': this.marketId (symbol),
            'level': limit, // L20, L100, full
        }, params);
        let response = await this.marketGetDepthLevelSymbol (request);
        let orderbook = response['data'];
        return this.parseOrderBook (orderbook, orderbook['ts'], 'bids', 'asks', 0, 1);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.marketGetTickerSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (ticker['data'], market);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = undefined;
        let symbol = undefined;
        if (market === undefined) {
            let tickerType = this.safeString (ticker, 'type');
            if (tickerType !== undefined) {
                let parts = tickerType.split ('.');
                let id = parts[1];
                if (id in this.markets_by_id) {
                    market = this.markets_by_id[id];
                }
            }
        }
        let values = ticker['ticker'];
        let last = values[0];
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': values[7],
            'low': values[8],
            'bid': values[2],
            'bidVolume': values[3],
            'ask': values[4],
            'askVolume': values[5],
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': values[9],
            'quoteVolume': values[10],
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = parseInt (trade['ts']);
        let side = trade['side'].toLowerCase ();
        let orderId = this.safeString (trade, 'id');
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let cost = price * amount;
        let fee = undefined;
        return {
            'id': orderId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'order': orderId,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'limit': limit,
        };
        if (since !== undefined) {
            request['timestamp'] = parseInt (since / 1000);
        }
        let response = await this.marketGetTradesSymbol (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                if (this.options['createMarketBuyOrderRequiresPrice']) {
                    if (price === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                    } else {
                        amount = amount * price;
                    }
                }
            }
        }
        await this.loadMarkets ();
        let orderType = type;
        let request = {
            'symbol': this.marketId (symbol),
            'amount': this.amountToPrecision (symbol, amount),
            'side': side,
            'type': orderType,
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        let result = await this.privatePostOrders (this.extend (request, params));
        return {
            'info': result,
            'id': result['data'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrdersOrderIdSubmitCancel (this.extend ({
            'order_id': id,
        }, params));
        let order = this.parseOrder (response);
        return this.extend (order, {
            'id': id,
            'status': 'canceled',
        });
    }

    parseOrderStatus (status) {
        const statuses = {
            'submitted': 'open',
            'canceled': 'canceled',
            'partial_filled': 'open',
            'partial_canceled': 'canceled',
            'filled': 'closed',
            'pending_cancel': 'canceled',
        };
        if (status in statuses) {
            return statuses[status];
        }
        return status;
    }

    parseOrder (order, market = undefined) {
        let id = this.safeString (order, 'id');
        let side = this.safeString (order, 'side');
        let status = this.parseOrderStatus (this.safeString (order, 'state'));
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (order, 'symbol');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        let orderType = this.safeString (order, 'type');
        let timestamp = this.safeInteger (order, 'created_at');
        let amount = this.safeFloat (order, 'amount');
        let filled = this.safeFloat (order, 'filled_amount');
        let remaining = undefined;
        let price = this.safeFloat (order, 'price');
        let cost = this.safeFloat (order, 'executed_value');
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
            }
            if (cost === undefined) {
                if (price !== undefined) {
                    cost = price * filled;
                }
            } else if ((cost > 0) && (filled > 0)) {
                price = cost / filled;
            }
        }
        let feeCurrency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            feeCurrency = (side === 'buy') ? market['base'] : market['quote'];
        }
        let feeCost = this.safeFloat (order, 'fill_fees');
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'average': undefined,
            'status': status,
            'fee': {
                'cost': feeCost,
                'currency': feeCurrency,
            },
            'trades': undefined,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = this.extend ({
            'order_id': id,
        }, params);
        let response = await this.privateGetOrdersOrderId (request);
        return this.parseOrder (response['data']);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let result = await this.fetchOrders (symbol, since, limit, { 'states': 'submitted,partial_filled' });
        return result;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let result = await this.fetchOrders (symbol, since, limit, { 'states': 'filled' });
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'states': 'submitted,partial_filled,partial_canceled,filled,canceled',
        };
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response['data'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv['id'] * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['base_vol'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 100, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            throw new ExchangeError (this.id + ' fetchOHLCV requires a limit argument');
        }
        let market = this.market (symbol);
        let request = this.extend ({
            'symbol': market['id'],
            'timeframe': this.timeframes[timeframe],
            'limit': limit,
        }, params);
        let response = await this.marketGetCandlesTimeframeSymbol (request);
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/';
        request += (api === 'private') ? '' : (api + '/');
        request += this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if ((api === 'public') || (api === 'market')) {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            let timestamp = this.nonce ().toString ();
            query = this.keysort (query);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.rawencode (query);
                }
            }
            // HTTP_METHOD + HTTP_REQUEST_URI + TIMESTAMP + POST_BODY
            let auth = method + url + timestamp;
            if (method === 'POST') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    auth += this.urlencode (query);
                }
            }
            let payload = this.stringToBase64 (this.encode (auth));
            let signature = this.hmac (payload, this.encode (this.secret), 'sha1', 'binary');
            signature = this.decode (this.stringToBase64 (signature));
            headers = {
                'FC-ACCESS-KEY': this.apiKey,
                'FC-ACCESS-SIGNATURE': signature,
                'FC-ACCESS-TIMESTAMP': timestamp,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let status = this.safeString (response, 'status');
            if (status !== '0') {
                const feedback = this.id + ' ' + body;
                if (status in this.exceptions) {
                    const exceptions = this.exceptions;
                    throw new exceptions[status] (feedback);
                }
                throw new ExchangeError (feedback);
            }
        }
    }
};
