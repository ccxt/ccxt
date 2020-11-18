'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, ExchangeError, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class wbf extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'wbf',
            'name': 'Wbf',
            'countries': ['US'],
            'version': 'v1',
            'rateLimit': 1000,
            'has': {
                'createMarketOrder': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchCurrencies': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchTrades': false,
            },
            'urls': {
                'api': {
                    'public': 'https://openapi.wbf.live/open/api',
                    'private': 'https://openapi.wbf.live/open/api',
                },
                'www': 'https://www.wbf.live',
                'doc': [
                    'https://github.com/wbfex/api/blob/master/api/us_en/api_doc_en.md',
                ],
                'fees': '',
            },
            'api': {
                'public': {
                    'get': [
                        'get_ticker',
                        'market_dept',
                        'common/symbols',
                        'get_records',
                    ],
                },
                'private': {
                    'get': [],
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
    // {
    //     "symbol": "ethbtc",
    //     "count_coin": "btc",
    //     "amount_precision": 3,
    //     "base_coin": "eth",
    //     "price_precision": 8
    //     },
        const response = await this.publicGetCommonSymbols (params);
        const result = [];
        for (let i = 0; i < response['data'].length; i++) {
            const market = response['data'][i];
            const baseId = this.safeString (market, 'base_coin');
            const quoteId = this.safeString (market, 'count_coin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const id = base + quote;
            const symbol = base + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amount_precision'),
                'price': this.safeInteger (market, 'price_precision'),
            };
            result.push ({
                'id': id.toLowerCase (),
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
                        'min': undefined,
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

    async fetchOHLCV (symbol, timeframe = '5', since = undefined, limit = undefined, params = {}) {
        const request = {
            'symbol': symbol,
            'period': timeframe,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        const response = await this.publicGetGetRecords (request);
        const { data } = response;
        // [
        //     1595727000,  //Time，second
        //     9674.4758,   //Open
        //     9675.8867,   //High
        //     9652.9081,   //Low
        //     9654.2835,   //Close
        //     369.67841    //Amount
        // ],
        return this.parseOHLCVs (data, undefined, timeframe, since, limit);
    }

    async fetchTicker (symbol, params = {}) {
    // {
    //     "high": 1,//Maximum value
    //     "vol": 10232.26315789,//Trading volume
    //     "last": 173.60263169,//Latest Transaction Price
    //     "low": 0.01,//Minimum value
    //     "buy": "0.01000000",//Buy one price
    //     "sell": "1.12345680",//Selling price
    //     "rose": -0.44564773,//Ups and downs
    //     "time": 1514448473626
    // }
        await this.loadMarkets ();
        const timestamp = this.milliseconds ();
        const market = this.market (symbol);
        const request = this.extend ({
            'symbol': this.safeString (market, 'symbol'),
        }, params);
        const response = await this.publicGetGetTicker (request);
        const ticker = this.safeValue (response, 'data');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'previousClose': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'percentage': undefined,
            'change': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
            'type': 'step0',
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetMarketDept (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrderBook (data.tick, undefined, 'bids', 'asks');
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const query = this.omit (params, 'type');
        const response = await this.privateGetWalletBalance (query);
        const balances = this.safeValue (response, 'data');
        const wallets = this.safeValue (balances, 'WALLET');
        const result = { 'info': wallets };
        for (let i = 0; i < wallets.length; i++) {
            const wallet = wallets[i];
            const currencyId = wallet['coinType'];
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
        const market = this.market (symbol);
        const method = 'privatePostTradeOrderCreate';
        const direction = side === 'buy' ? 'BID' : 'ASK';
        const request = {
            'amount': this.amountToPrecision (symbol, amount),
            'direction': direction,
            'pair': this.safeString (market, 'id'),
            'price': this.priceToPrecision (symbol, price),
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
            'orderNo': id,
            'pair': this.marketId (symbol),
        };
        return await this.privatePostTradeOrderCancel (this.extend (request, params));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': this.safeString (market, 'id'),
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.privateGetTradeOrderListUnfinished (this.extend (request, params));
        const result = this.safeValue (response, 'data');
        return this.parseOrders (this.safeValue (result, 'data'), market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderNo': id,
            'pair': this.marketId (symbol),
        };
        const response = await this.privateGetTradeOrderUnfinishedDetail (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        if (!data) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (data);
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
            const secret = this.encode (this.secret);
            const signature = this.hmac (query, secret, 'sha256');
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
