'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, OrderNotFound, InvalidOrder } = require ('./base/errors');
const { DECIMAL_PLACES } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bithumbglobal extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bithumbglobal',
            'name': 'Bithumb Global',
            'countries': [ 'KR' ], // South Korea
            'rateLimit': 500,
            'version': 'v1',
            'has': {
                'cancelOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'withdraw': false,
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://global-openapi.bithumb.pro/openapi',
                    'private': 'https://global-openapi.bithumb.pro/openapi',
                },
                'www': 'https://www.bithumb.pro',
                'doc': 'https://github.com/bithumb-pro/bithumb.pro-official-api-docs',
                'fees': 'https://www.bithumb.pro/en-us/fee',
            },
            'timeframes': {
                '1m': 'm1',
                '3m': 'm3',
                '5m': 'm5',
                '15m': 'm15',
                '30m': 'm30',
                '1h': 'h1',
                '2h': 'h2',
                '4h': 'h4',
                '6h': 'h6',
                '8h': 'h8',
                '12h': 'h12',
                '1d': 'd1',
                '3d': 'd3',
                '7d': 'w1',
                '1M': 'M1',
            },
            'api': {
                'public': {
                    'get': [
                        'serverTime',
                        'spot/config',
                        'spot/orderBook',
                        'spot/ticker',
                        'spot/trades',
                        'spot/kline',
                    ],
                },
                'private': {
                    'get': [
                        'c2c/api/order/getlist',
                        'c2c/api/order/getorderdetail',
                        'countryInfo',
                    ],
                    'post': [
                        'withdraw',
                        'transfer',
                        'spot/placeOrder',
                        'spot/cancelOrder',
                        'spot/assetList',
                        'spot/orderDetail',
                        'spot/orderList',
                        'spot/singleOrder',
                        'spot/openOrders',
                        'spot/myTrades',
                        'spot/cancelOrder/batch',
                        'spot/placeOrders',
                        'lever/asset/list',
                        'lever/asset/info',
                        'lever/asset/borrowed',
                        'lever/asset/collect',
                        'lever/asset/change/list',
                        'lever/order/create',
                        'lever/order/cancel',
                        'lever/order/list/open',
                        'lever/order/list',
                        'lever/trades/list',
                        'lever/available',
                        'lever/order/cancel/batch',
                        'lever/sign',
                        'c2c/order/payment',
                        'c2c/api/order/savebymatchcondition',
                        'saveKyc',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
            },
            'precisionMode': DECIMAL_PLACES,
            'exceptions': {
                'exact': {
                    // 9002 occurs when there are missing/wrong parameters, the signature does not need to be wrong
                    '9002': BadRequest, // {"data":null,"code":"9002","msg":"verifySignature failed","timestamp":1597061538013,"startTime":null}
                    '20000': InvalidOrder, // {"data":null,"code":"20000","msg":"order params error","timestamp":1597064915274,"startTime":null}
                    '20004': OrderNotFound, // {"data":null,"code":"20004","msg":"order absent","timestamp":1597061829420,"startTime":null}
                    '20012': BadRequest, // {"data":null,"code":"20012","msg":"cancel failed,order status changed","timestamp":1597065978595,"startTime":null}
                    '20044': InvalidOrder, // {"data":null,"code":"20044","msg":"quantity accuracy is wrong for placing order","timestamp":1597066179132,"startTime":null}
                },
                'broad': {
                },
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetServerTime (params);
        //
        //     {
        //         "data":1600010650147,
        //         "code":"0",
        //         "msg":"success",
        //         "timestamp":1600010650147,
        //         "startTime":null
        //     }
        //
        return this.safeInteger (response, 'timestamp');
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetSpotConfig (params);
        const data = this.safeValue (response, 'data');
        const spotConfig = this.safeValue (data, 'spotConfig');
        const result = [];
        for (let i = 0; i < spotConfig.length; i++) {
            const market = spotConfig[i];
            const currencyId = this.safeValue (market, 'symbol');
            const [ baseId, quoteId ] = currencyId.split ('-');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const accuracy = this.safeValue (market, 'accuracy', {});
            result.push ({
                'id': currencyId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'active': true,
                'precision': {
                    'amount': this.safeInteger (accuracy, 1),
                    'price': this.safeInteger (accuracy, 0),
                },
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
                },
                'baseId': baseId,
                'quoteId': quoteId,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetSpotConfig (params);
        const data = this.safeValue (response, 'data');
        const coinConfig = this.safeValue (data, 'coinConfig');
        const result = {};
        for (let i = 0; i < coinConfig.length; i++) {
            const currency = coinConfig[i];
            const name = this.safeString (currency, 'name');
            const id = name;
            const code = this.safeCurrencyCode (name);
            result[code] = {
                'id': id,
                'numericId': undefined,
                'code': code,
                'info': currency,
                'name': name,
                'active': this.safeString (currency, 'depositStatus') === 1,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'minTxAmt'),
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
                        'min': this.safeFloat (currency, 'minWithdraw'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        const response = await this.publicGetSpotOrderBook (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseOrderBook (data, undefined, 'b', 's', 0, 1);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.fetchTickers ([symbol], params);
        return tickers[symbol];
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols === undefined) {
            request['symbol'] = 'ALL';
        } else {
            const marketIds = this.marketIds (symbols);
            request['symbol'] = marketIds.join (',');
        }
        const response = await this.publicGetSpotTicker (this.extend (request, params));
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker, market = undefined, timestamp = undefined) {
        let symbol = undefined;
        const marketId = this.safeString (ticker, 's');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'c');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'h'),
            'low': this.safeFloat (ticker, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'p'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'vol'),
            'info': ticker,
        };
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = {};
        const timestamp = this.safeInteger (rawTickers, 'timestamp');
        const data = this.safeValue (rawTickers, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseTicker (data[i], undefined, timestamp);
            tickers[ticker['symbol']] = ticker;
        }
        return tickers;
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 't');
        const side = this.safeString (trade, 's');
        const price = this.safeFloat (trade, 'p');
        const amount = this.safeFloat (trade, 'v');
        const cost = price * amount;
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': undefined,
            'order': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request = {
            'symbol': id,
        };
        const response = await this.publicGetSpotTrades (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeTimestamp (ohlcv, 'time'),
            this.safeFloat (ohlcv, 'o'),
            this.safeFloat (ohlcv, 'h'),
            this.safeFloat (ohlcv, 'l'),
            this.safeFloat (ohlcv, 'c'),
            this.safeFloat (ohlcv, 'v'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const duration = this.parseTimeframe (timeframe);
        if (limit === undefined) {
            limit = 100;
        }
        let end = undefined;
        let start = undefined;
        if (since === undefined) {
            end = this.seconds ();
            start = end - duration * limit;
        } else {
            start = parseInt (since / 1000);
            end = since + duration * limit;
        }
        const request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
            'start': start,
            'end': end,
        };
        const response = await this.publicGetSpotKline (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'assetType': 'spot',
        };
        const response = await this.privatePostSpotAssetList (this.extend (request, params));
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data');
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeString (balance, 'coinType');
            const account = this.account ();
            const safeCode = this.safeCurrencyCode (code);
            account['total'] = this.safeFloat (balance, 'count');
            account['used'] = this.safeFloat (balance, 'frozen');
            result[safeCode] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
            'type': type.toLowerCase (),
            'side': side.toLowerCase (),
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
            request['quantity'] = this.amountToPrecision (symbol, amount);
        } else {
            const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
            if (createMarketBuyOrderRequiresPrice) {
                if (price !== undefined) {
                    amount = amount * price;
                } else {
                    throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument (the exchange-specific behaviour)");
                }
            }
            request['price'] = '-1';
            request['quantity'] = this.priceToPrecision (symbol, amount);
        }
        const response = await this.privatePostSpotPlaceOrder (this.extend (request, params));
        const responseData = this.safeValue (response, 'data', {});
        const id = this.safeString (responseData, 'orderId');
        return {
            'info': response,
            'symbol': symbol,
            'type': type,
            'side': side,
            'id': id,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
            'symbol': market['id'],
        };
        const response = await this.privatePostSpotSingleOrder (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'page': 1, // page count starts with 1
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privatePostSpotOpenOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        const list = this.safeValue (data, 'list');
        return this.parseOrders (list, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'status': 'closed',
            'queryRange': 'thisweek', // thisweekago
            // 'page': 1, // page count starts with 1
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privatePostSpotOrderList (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        const list = this.safeValue (data, 'list');
        return this.parseOrders (list, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'pending': 'open',
            'cancel': 'canceled',
            'success': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'orderId');
        let symbol = this.safeString (order, 'symbol');
        if (market === undefined) {
            market = this.markets_by_id[symbol];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            const base = this.safeCurrencyCode (this.safeString (order, 'coinType'));
            const quote = this.safeCurrencyCode (this.safeString (order, 'marketType'));
            symbol = base + '/' + quote;
        }
        const timestamp = this.safeInteger (order, 'createTime');
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const filled = this.safeFloat (order, 'tradedNum');
        let price = this.safeFloat (order, 'price');
        let avgPrice = this.safeFloat (order, 'avgPrice');
        let amount = undefined;
        if (type === 'market') {
            amount = this.safeFloat (order, 'tradedNum');
        } else {
            amount = this.safeFloat (order, 'quantity');
            if (avgPrice === 0) {
                avgPrice = undefined;
            }
        }
        if (filled !== 0) {
            price = avgPrice;
        }
        const remaining = amount - filled;
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': avgPrice,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            'orderId': id,
            'symbol': this.marketId (symbol),
        };
        return await this.privatePostSpotCancelOrder (this.extend (request, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + '/' + this.version + endpoint;
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const ts = this.nonce ().toString ();
            query = this.keysort (this.extend ({
                'apiKey': this.apiKey,
                'msgNo': ts,
                'timestamp': ts,
                'version': 'v1.0.0',
            }, query));
            const urlparams = this.urlencode (query);
            query['signature'] = this.hmac (this.encode (urlparams), this.encode (this.secret), 'sha256');
            body = this.json (query);
            headers = {
                'content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('code' in response) {
            const code = this.safeString (response, 'code');
            const message = this.safeString (response, 'msg');
            if (code === '0') {
                return; // no error
            }
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwExactlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
