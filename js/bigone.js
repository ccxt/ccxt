'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, ExchangeNotAvailable, InvalidNonce } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bigone extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bigone',
            'name': 'BigONE',
            'countries': [ 'GB' ],
            'version': 'v3',
            'has': {
                'cancelAllOrders': true,
                'createMarketOrder': false,
                'fetchDepositAddress': true,
                'fetchMyTrades': false, // todo support fetchMyTrades
                'fetchOHLCV': false, // todo support fetchOHLCV
                'fetchOpenOrders': true,
                'fetchTickers': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/42803606-27c2b5ec-89af-11e8-8d15-9c8c245e8b2c.jpg',
                'api': {
                    'public': 'https://big.one/api/v3',
                    'private': 'https://big.one/api/v3/viewer',
                },
                'www': 'https://big.one',
                'doc': 'https://open.big.one/docs/api.html',
                'fees': 'https://help.big.one/hc/en-us/articles/115001933374-BigONE-Fee-Policy',
                'referral': 'https://b1.run/users/new?code=D3LLBVFT',
            },
            'api': {
                'public': {
                    'get': [
                        'ping',
                        'asset_pairs',
                        'asset_pairs/{symbol}/depth',
                        'asset_pairs/{symbol}/trades',
                        'asset_pairs/{symbol}/ticker',
                        'asset_pairs/{symbol}/candles',
                        'asset_pairs/tickers',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'orders',
                        'orders/{id}',
                        'trades',
                        'withdrawals',
                        'deposits',
                    ],
                    'post': [
                        'orders',
                        'orders/{id}/cancel',
                        'orders/cancel',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
                'funding': {
                    // HARDCODING IS DEPRECATED THE FEES BELOW ARE TO BE REMOVED SOON
                    'withdraw': {
                        'BTC': 0.002,
                        'ETH': 0.01,
                        'EOS': 0.01,
                        'ZEC': 0.002,
                        'LTC': 0.01,
                        'QTUM': 0.01,
                        // 'INK': 0.01 QTUM,
                        // 'BOT': 0.01 QTUM,
                        'ETC': 0.01,
                        'GAS': 0.0,
                        'BTS': 1.0,
                        'GXS': 0.1,
                        'BITCNY': 1.0,
                    },
                },
            },
            'exceptions': {
                'codes': {
                    '401': AuthenticationError,
                    '10030': InvalidNonce, // {"message":"invalid nonce, nonce should be a 19bits number","code":10030}
                },
                'detail': {
                    'Internal server error': ExchangeNotAvailable,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetAssetPairs (params);
        const markets = this.safeValue (response, 'data');
        const result = [];
        this.options['marketsByUuid'] = {};
        for (let i = 0; i < markets.length; i++) {
            //    {
            //        "id": "d2185614-50c3-4588-b146-b8afe7534da6",
            //        "quote_scale": 8,
            //        "quote_asset": {
            //          "id": "0df9c3c3-255a-46d7-ab82-dedae169fba9",
            //          "symbol": "BTC",
            //          "name": "Bitcoin"
            //        },
            //        "name": "BTG-BTC",
            //        "base_scale": 4,
            //        "min_quote_value":"0.001",
            //        "base_asset": {
            //          "id": "5df3b155-80f5-4f5a-87f6-a92950f0d0ff",
            //          "symbol": "BTG",
            //          "name": "Bitcoin Gold"
            //        }
            //    }
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const uuid = this.safeString (market, 'id');
            const baseAsset = this.safeValue (market, 'base_asset', {});
            const quoteAsset = this.safeValue (market, 'quote_asset', {});
            const baseId = this.safeString (baseAsset, 'symbol');
            const quoteId = this.safeString (quoteAsset, 'symbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'base_scale'),
                'price': this.safeInteger (market, 'quote_scale'),
            };
            const entry = {
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
                        'min': Math.pow (10, -precision['amount']),
                        'max': Math.pow (10, precision['amount']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': Math.pow (10, precision['price']),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            };
            this.options['marketsByUuid'][uuid] = entry;
            result.push (entry);
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //    {
        //        "volume": "190.4925000000000000",
        //        "open": "0.0777371200000000",
        //        "asset_pair_name": "ETH-BTC",
        //        "low": "0.0742925600000000",
        //        "high": "0.0789150000000000",
        //        "daily_change": "-0.00029",
        //        "close": "0.0774425600000000", //  last price
        //        "bid": {
        //          "price": "0.0764777900000000",
        //          "order_count": 4,
        //          "quantity": "6.4248000000000000"
        //        },
        //        "ask": {
        //          "price": "0.0774425600000000",
        //          "order_count": 2,
        //          "quantity": "1.1741000000000000"
        //        }
        //    }
        if (market === undefined) {
            const marketId = this.safeString (ticker, 'asset_pair_name');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.milliseconds ();
        const close = this.safeFloat (ticker, 'close');
        const bid = this.safeValue (ticker, 'bid', {});
        const ask = this.safeValue (ticker, 'ask', {});
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (bid, 'price'),
            'bidVolume': this.safeFloat (bid, 'quantity'),
            'ask': this.safeFloat (ask, 'price'),
            'askVolume': this.safeFloat (ask, 'quantity'),
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'daily_change'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetAssetPairsSymbolTicker (this.extend (request, params));
        return this.parseTicker (response['data'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const ids = this.marketIds (symbols);
            request['pair_names'] = ids.join (',');
        }
        const response = await this.publicGetAssetPairsTickers (this.extend (request, params));
        const tickers = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
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
        const response = await this.publicGetAssetPairsSymbolDepth (this.extend (request, params));
        return this.parseOrderBook (response['data'], undefined, 'bids', 'asks', 'price', 'quantity');
    }

    parseTrade (trade, market = undefined) {
        //    {
        //        "id": 38199941,
        //        "price": "3378.67",
        //        "amount": "0.019812",
        //        "taker_side": "ASK",
        //        "created_at": "2019-01-29T06:05:56Z"
        //    }
        let timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        if (timestamp === undefined) {
            // actual time field different from v3 API doc, will be fixed by BigONE soon
            timestamp = this.parse8601 (this.safeString (trade, 'inserted_at'));
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = this.costToPrecision (symbol, price * amount);
            }
        }
        // taker side is not related to buy/sell side
        // the following code is probably a mistake
        let side = undefined;
        if (trade['taker_side'] === 'ASK') {
            side = 'sell';
        } else {
            side = 'buy';
        }
        const id = this.safeString (trade, 'id');
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': 'limit',
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': parseFloat (cost),
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetAssetPairsSymbolTrades (this.extend (request, params));
        //    {
        //        "code": 0,
        //        "data": [{
        //            "id": 38199941,
        //            "price": "3378.67",
        //            "amount": "0.019812",
        //            "taker_side": "ASK",
        //            "created_at": "2019-01-29T06:05:56Z"
        //        }, {
        //            "id": 38199934,
        //            "price": "3376.14",
        //            "amount": "0.019384",
        //            "taker_side": "ASK",
        //            "created_at": "2019-01-29T06:05:40Z"
        //        }]
        //    }
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccounts (params);
        //    [
        //        {
        //            "asset_symbol": "BTC",
        //            "balance": "0",
        //            "locked_balance": "0"
        //        }
        //    ]
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data');
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const symbol = this.safeString (balance, 'asset_symbol');
            const code = this.safeCurrencyCode (symbol);
            const account = this.account ();
            account['total'] = this.safeFloat (balance, 'balance');
            account['used'] = this.safeFloat (balance, 'locked_balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        //    {
        //        "id": 10,
        //        "asset_pair_name": "EOS-BTC",
        //        "price": "10.00",
        //        "amount": "10.00",
        //        "filled_amount": "9.0",
        //        "avg_deal_price": "12.0",
        //        "side": "ASK",
        //        "state": "FILLED",
        //        "created_at":"2019-01-29T06:05:56Z",
        //        "updated_at":"2019-01-29T06:05:56Z"
        //    }
        const id = this.safeString (order, 'id');
        if (market === undefined) {
            const marketId = this.safeString (order, 'asset_pair_name');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'filled_amount');
        const remaining = Math.max (0, amount - filled);
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        let side = this.safeString (order, 'side');
        if (side === 'BID') {
            side = 'buy';
        } else {
            side = 'sell';
        }
        let cost = undefined;
        if (filled !== undefined) {
            if (price !== undefined) {
                cost = filled * price;
            }
        }
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        side = (side === 'buy') ? 'BID' : 'ASK';
        const request = {
            'asset_pair_name': market['id'], // asset pair name BTC-USDT, required
            'side': side, // order side one of "ASK"/"BID", required
            'amount': this.amountToPrecision (symbol, amount), // order amount, string, required
            'price': this.priceToPrecision (symbol, price), // order price, string, required
        };
        const response = await this.privatePostOrders (this.extend (request, params));
        //    {
        //        "id": 10,
        //        "asset_pair_name": "EOS-BTC",
        //        "price": "10.00",
        //        "amount": "10.00",
        //        "filled_amount": "9.0",
        //        "avg_deal_price": "12.0",
        //        "side": "ASK",
        //        "state": "FILLED",
        //        "created_at":"2019-01-29T06:05:56Z",
        //        "updated_at":"2019-01-29T06:05:56Z"
        //    }
        const order = this.safeValue (response, 'data');
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { 'id': id };
        const response = await this.privatePostOrdersIdCancel (this.extend (request, params));
        //    {
        //        "id": 10,
        //        "asset_pair_name": "EOS-BTC",
        //        "price": "10.00",
        //        "amount": "10.00",
        //        "filled_amount": "9.0",
        //        "avg_deal_price": "12.0",
        //        "side": "ASK",
        //        "state": "CANCELLED",
        //        "created_at":"2019-01-29T06:05:56Z",
        //        "updated_at":"2019-01-29T06:05:56Z"
        //    }
        const order = this.safeValue (response, 'data');
        return this.parseOrder (order);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'asset_pair_name': market['id'],
        };
        const response = await this.privatePostOrdersCancel (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 10,
        //             "market_uuid": "d2185614-50c3-4588-b146-b8afe7534da6",
        //             "price": "10.00",
        //             "amount": "10.00",
        //             "filled_amount": "9.0",
        //             "avg_deal_price": "12.0",
        //             "side": "ASK",
        //             "state": "FILLED"
        //         },
        //         {
        //             ...
        //         },
        //     ]
        //
        const result = this.safeValue (response, 'data');
        result['info'] = response;
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { 'id': id };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        const order = this.safeValue (response, 'data');
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        //
        //    Name             Type    Require     Description                                          Example
        //    asset_pair_name  string  true        asset pair Name                                      BTC-USDT
        //    page_token       string  false       request page after this page token
        //    side             string  false       order side, one of "ASK"/"BID"
        //    state            string  false       order state, one of "CANCELLED"/"FILLED"/"PENDING"
        //    limit            string  false       default 20; max 200
        //
        const request = {
            'asset_pair_name': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        //    {
        //        "data": [{
        //            "id": 10,
        //            "asset_pair_name": "ETH-BTC",
        //            "price": "10.00",
        //            "amount": "10.00",
        //            "filled_amount": "9.0",
        //            "avg_deal_price": "12.0",
        //            "side": "ASK",
        //            "state": "FILLED",
        //            "created_at":"2019-01-29T06:05:56Z",
        //            "updated_at":"2019-01-29T06:05:56Z"
        //        }],
        //        "page_token":"dxzef"
        //    }
        const orders = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            result.push (this.parseOrder (orders[i], market));
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'PENDING': 'open',
            'FILLED': 'closed',
            'CANCELLED': 'canceled',
        };
        return this.safeString (statuses, status);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'state': 'PENDING',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'state': 'FILLED',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    nonce () {
        return this.microseconds () * 1000;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const request = {
                'type': 'OpenAPIV2',
                'sub': this.apiKey,
                'nonce': nonce,
            };
            const jwt = this.jwt (request, this.encode (this.secret));
            headers = {
                'Authorization': 'Bearer ' + jwt,
            };
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //      {"errors":{"detail":"Internal server error"}}
        //      {"errors":[{"message":"invalid nonce, nonce should be a 19bits number","code":10030}],"data":null}
        //
        const error = this.safeValue (response, 'error');
        const errors = this.safeValue (response, 'errors');
        const data = this.safeValue (response, 'data');
        if (error !== undefined || errors !== undefined || data === undefined) {
            const feedback = this.id + ' ' + this.json (response);
            let code = undefined;
            if (error !== undefined) {
                code = this.safeInteger (error, 'code');
            }
            let exceptions = this.exceptions['codes'];
            if (errors !== undefined) {
                if (Array.isArray (errors)) {
                    code = this.safeString (errors[0], 'code');
                } else {
                    code = this.safeString (errors, 'detail');
                    exceptions = this.exceptions['detail'];
                }
            }
            if (code in exceptions) {
                throw new exceptions[code] (feedback);
            } else {
                throw new ExchangeError (feedback);
            }
        }
    }
};
