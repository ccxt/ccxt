'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, ExchangeError, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bkex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bkex',
            'name': 'BKEX',
            'countries': ['BVI'],
            'version': 'v2',
            'rateLimit': 1000,
            'has': {
                'createMarketOrder': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchCurrencies': true,
                'fetchTickers': false,
                'fetchTicker': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchTrades': false,
            },
            'urls': {
                'api': {
                    'public': 'https://api.bkex.io/v2',
                    'private': 'https://api.bkex.io/v2/u',
                },
                'www': 'https://www.bkex.com',
                'doc': [
                    'https://bkexapi.github.io/docs/api_en.htm',
                ],
                'fees': 'https://www.bkex.com/help/instruction/33',
            },
            'api': {
                'public': {
                    'get': [
                        'common/symbols',
                        'common/currencys',
                        'exchangeInfo',
                        'q/depth',
                        'q/deals',
                        'q/tickers',
                        'q/ticker/price',
                        'q/kline',
                    ],
                },
                'private': {
                    'get': [
                        'account/balance',
                        'order/openOrders',
                        'order/openOrder/detail',
                        'order/historyOrders',
                    ],
                    'post': [
                        'order/create',
                        'order/cancel',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.09,
                    'taker': 0.12,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetCommonSymbols (params);
        const data = this.safeValue (response, 'data');
        const numMarkets = data.length;
        if (numMarkets < 1) {
            throw new ExchangeError (this.id + ' publicGetExchangeInfo returned empty response: ' + this.json (data));
        }
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const baseId = id.split ('_')[0];
            const quoteId = id.split ('_')[1];
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': undefined,
                'price': this.safeInteger (market, 'pricePrecision'),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const timestamp = this.milliseconds ();
        const market = this.market (symbol);
        const request = this.extend ({
            'symbol': market['id'],
        }, params);
        const response = await this.publicGetQTickers (request);
        const ticker = this.safeValue (response, 'data');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker[0], 'high'),
            'low': this.safeFloat (ticker[0], 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'previousClose': undefined,
            'open': this.safeFloat (ticker[0], 'open'),
            'close': this.safeFloat (ticker[0], 'close'),
            'last': this.safeFloat (ticker[0], 'close'),
            'percentage': undefined,
            'change': this.safeFloat (ticker[0], 'change'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker[0], 'volume'),
            'quoteVolume': this.safeFloat (ticker[0], 'quoteVolume'),
            'info': ticker[0],
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetQDepth (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrderBook (data, undefined, 'bid', 'ask');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            this.safeInteger (ohlcv, 'ts'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'size': limit,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        const duration = this.parseTimeframe (timeframe);
        const timerange = limit * duration * 1000;
        if (since === undefined) {
            if (limit === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOHLCV requires a since argument or a limit argument');
            } else {
                request['to'] = this.milliseconds ();
                request['from'] = request['to'] - timerange;
            }
        } else {
            request['from'] = parseInt (since);
            request['to'] = this.sum (request['from'], timerange);
        }
        const response = await this.publicGetQKline (request);
        // {
        //     "symbol": "BTC_USDT",
        //     "volume": 12321.1234,
        //     "open": 4124.3,
        //     "close": 3873.213,
        //     "low": 3521.1,
        //     "high": 4521.5,
        //     "quoteVolume": 71031537.978665,
        //     "ts": 1529739295000
        // }
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, undefined, timeframe, since, limit);
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCommonCurrencys (params);
        const items = response['data'];
        const result = {};
        for (let i = 0; i < items.length; i++) {
            //    {
            //       "currency": "ETH",
            //       "maxWithdrawOneDay": 2000,
            //       "maxWithdrawSingle": 2000,
            //       "minWithdrawSingle": 0.1,
            //       "supportDeposit": true,
            //       "supportTrade": true,
            //       "supportWithdraw": true,
            //       "withdrawFee": 0.008
            //     },
            const item = items[i];
            const id = this.safeString (item, 'currency');
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'name': this.safeString (item, 'currency'),
                'active': this.safeValue (item, 'supportTrade') && this.safeValue (item, 'supportDeposit'),
                'fee': this.safeFloat (item, 'withdrawFee'),
                'precision': undefined,
                'info': item,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': this.safeFloat (item, 'minWithdrawSingle'), 'max': this.safeFloat (item, 'maxWithdrawSingle') },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const query = this.omit (params, 'type');
        const response = await this.privateGetAccountBalance (query);
        const balances = this.safeValue (response, 'data');
        const wallets = this.safeValue (balances, 'WALLET');
        const result = { 'info': wallets };
        for (let i = 0; i < wallets.length; i++) {
            const wallet = wallets[i];
            const currencyId = wallet['currency'];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (wallet, 'available');
            account['total'] = this.safeFloat (wallet, 'total');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const method = 'privatePostOrderCreate';
        const direction = side === 'buy' ? 'BID' : 'ASK';
        const request = {
            'volume': amount,
            'direction': direction,
            'symbol': symbol,
            'price': price,
            'type': type,
        };
        const response = await this[method] (this.extend (request, params));
        return {
            'id': this.safeValue (response, 'data'),
            'info': response,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        return await this.privatePostOrderCancel (this.extend (request, params));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.safeString (market, 'id'),
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.privateGetOrderOpenOrders (this.extend (request, params));
        const result = this.safeValue (response, 'data');
        return this.parseOrders (this.safeValue (result, 'data'), market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOrderOpenOrderDetail (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        if (!data) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (data);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'createdTime');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (trade, 'id');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'totalVolume');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        const type = undefined;
        const side = this.safeString (trade, 'type');
        return {
            'info': trade,
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const trades = await this.privateGetOrderHistoryOrders (this.extend (request, params));
        return this.parseTrades (trades, undefined, since, limit);
    }

    parseOrder (order, market = undefined) {
        const marketName = this.safeString (order, 'pair');
        market = market || this.findMarket (marketName);
        let timestamp = this.safeString (order, 'createdTime');
        if (timestamp !== undefined) {
            timestamp = Math.round (parseFloat (timestamp) * 1000);
        }
        const direction = this.safeValue (order, 'direction');
        const side = direction === 'BID' ? 'BUY' : 'SELL';
        const amount = this.safeFloat (order, 'totalAmount');
        const fillAmount = this.safeFloat (order, 'dealAmount', amount);
        const remaining = amount - fillAmount;
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': this.safeString (market, 'symbol'),
            'side': side,
            'type': this.safeString (order, 'orderType'),
            'price': this.safeFloat (order, 'price'),
            'cost': undefined,
            'amount': amount,
            'filled': fillAmount,
            'remaining': remaining,
            'fee': undefined,
            'info': order,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            query = this.urlencode (query);
            if (method === 'POST') {
                body = query;
            }
            const queryArray = query.split ('&');
            const sortedQuery = this.sortBy (queryArray, 0).join ('&');
            const secret = this.encode (this.secret);
            const signature = this.hmac (sortedQuery, secret, 'sha256');
            headers = {
                'Cache-Control': 'no-cache',
                'Content-type': 'application/x-www-form-urlencoded',
                'X_ACCESS_KEY': this.apiKey,
                'X_SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const httpCode = this.safeInteger (response, 'code', 200);
        if (response === undefined) {
            return;
        }
        if (code >= 400) {
            throw new ExchangeError (this.id + ' HTTP Error ' + code + ' reason: ' + reason);
        }
        if (httpCode >= 400) {
            const message = this.safeValue (response, 'msg', '');
            throw new ExchangeError (this.id + ' HTTP Error ' + httpCode + ' message: ' + message);
        }
    }
};
