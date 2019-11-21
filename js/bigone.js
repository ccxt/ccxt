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
            'countries': [ 'CN' ],
            'version': 'v3',
            'has': {
                'cancelAllOrders': true,
                'createMarketOrder': false,
                'fetchDepositAddress': true,
                'fetchMyTrades': false, // todo support fetchMyTrades
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchTickers': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'min1',
                '5m': 'min5',
                '15m': 'min15',
                '30m': 'min30',
                '1h': 'hour1',
                '3h': 'hour3',
                '4h': 'hour4',
                '6h': 'hour6',
                '12h': 'hour12',
                '1d': 'day1',
                '1w': 'week1',
                '1M': 'month1',
            },
            'hostname': 'big.one',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/42803606-27c2b5ec-89af-11e8-8d15-9c8c245e8b2c.jpg',
                'api': {
                    'public': 'https://{hostname}/api/v3',
                    'private': 'https://{hostname}/api/v3/viewer',
                },
                'www': 'https://big.one',
                'doc': 'https://open.big.one/docs/api.html',
                'fees': 'https://bigone.zendesk.com/hc/en-us/articles/115001933374-BigONE-Fee-Policy',
                'referral': 'https://b1.run/users/new?code=D3LLBVFT',
            },
            'api': {
                'public': {
                    'get': [
                        'ping',
                        'asset_pairs',
                        'asset_pairs/{asset_pair_name}/depth',
                        'asset_pairs/{asset_pair_name}/trades',
                        'asset_pairs/{asset_pair_name}/ticker',
                        'asset_pairs/{asset_pair_name}/candles',
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
                        'BTC': 0.001,
                        'ETH': 0.005,
                        'EOS': 0.01,
                        'ZEC': 0.003,
                        'LTC': 0.01,
                        'QTUM': 0.01,
                        // 'INK': 0.01 QTUM,
                        // 'BOT': 0.01 QTUM,
                        'ETC': 0.01,
                        'GAS': 0.0,
                        'BTS': 1.0,
                        'GXS': 0.1,
                        'BITCNY': 19.0,
                    },
                },
            },
            'exceptions': {
                'codes': {
                    '10030': InvalidNonce, // {"message":"invalid nonce, nonce should be a 19bits number","code":10030}
                    '401': AuthenticationError,
                    '40004': AuthenticationError, // {"code":40004,"message":"invalid jwt"}
                },
                'detail': {
                    'Internal server error': ExchangeNotAvailable,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetAssetPairs (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "id":"01e48809-b42f-4a38-96b1-c4c547365db1",
        //                 "name":"PCX-BTC",
        //                 "quote_scale":7,
        //                 "quote_asset":{
        //                     "id":"0df9c3c3-255a-46d7-ab82-dedae169fba9",
        //                     "symbol":"BTC",
        //                     "name":"Bitcoin",
        //                 },
        //                 "base_asset":{
        //                     "id":"405484f7-4b03-4378-a9c1-2bd718ecab51",
        //                     "symbol":"PCX",
        //                     "name":"ChainX",
        //                 },
        //                 "base_scale":3,
        //                 "min_quote_value":"0.0001",
        //             },
        //         ]
        //     }
        //
        const markets = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
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
                'uuid': uuid,
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
            result.push (entry);
        }
        return result;
    }

    async loadMarkets (reload = false, params = {}) {
        const markets = await super.loadMarkets (reload, params);
        let marketsByUuid = this.safeValue (this.options, 'marketsByUuid');
        if ((marketsByUuid === undefined) || reload) {
            marketsByUuid = {};
            for (let i = 0; i < this.symbols.length; i++) {
                const symbol = this.symbols[i];
                const market = this.markets[symbol];
                const uuid = this.safeString (market, 'uuid');
                marketsByUuid[uuid] = market;
            }
            this.options['marketsByUuid'] = marketsByUuid;
        }
        return markets;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "asset_pair_name":"ETH-BTC",
        //         "bid":{"price":"0.021593","order_count":1,"quantity":"0.20936"},
        //         "ask":{"price":"0.021613","order_count":1,"quantity":"2.87064"},
        //         "open":"0.021795",
        //         "high":"0.021795",
        //         "low":"0.021471",
        //         "close":"0.021613",
        //         "volume":"117078.90431",
        //         "daily_change":"-0.000182"
        //     }
        //
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (ticker, 'asset_pair_name');
            if (marketId !== undefined) {
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                } else {
                    const [ baseId, quoteId ] = marketId.split ('-');
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    symbol = base + '/' + quote;
                }
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
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
            'asset_pair_name': market['id'],
        };
        const response = await this.publicGetAssetPairsAssetPairNameTicker (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "asset_pair_name":"ETH-BTC",
        //             "bid":{"price":"0.021593","order_count":1,"quantity":"0.20936"},
        //             "ask":{"price":"0.021613","order_count":1,"quantity":"2.87064"},
        //             "open":"0.021795",
        //             "high":"0.021795",
        //             "low":"0.021471",
        //             "close":"0.021613",
        //             "volume":"117078.90431",
        //             "daily_change":"-0.000182"
        //         }
        //     }
        //
        const ticker = this.safeValue (response, 'data', {});
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const ids = this.marketIds (symbols);
            request['pair_names'] = ids.join (',');
        }
        const response = await this.publicGetAssetPairsTickers (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "asset_pair_name":"PCX-BTC",
        //                 "bid":{"price":"0.000234","order_count":1,"quantity":"0.518"},
        //                 "ask":{"price":"0.0002348","order_count":1,"quantity":"2.348"},
        //                 "open":"0.0002343",
        //                 "high":"0.0002348",
        //                 "low":"0.0002162",
        //                 "close":"0.0002348",
        //                 "volume":"12887.016",
        //                 "daily_change":"0.0000005"
        //             },
        //             {
        //                 "asset_pair_name":"GXC-USDT",
        //                 "bid":{"price":"0.5054","order_count":1,"quantity":"40.53"},
        //                 "ask":{"price":"0.5055","order_count":1,"quantity":"38.53"},
        //                 "open":"0.5262",
        //                 "high":"0.5323",
        //                 "low":"0.5055",
        //                 "close":"0.5055",
        //                 "volume":"603963.05",
        //                 "daily_change":"-0.0207"
        //             }
        //         ]
        //     }
        //
        const tickers = this.safeValue (response, 'data', []);
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
            'asset_pair_name': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 200
        }
        const response = await this.publicGetAssetPairsAssetPairNameDepth (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data": {
        //             "asset_pair_name": "EOS-BTC",
        //             "bids": [
        //                 { "price": "42", "order_count": 4, "quantity": "23.33363711" }
        //             ],
        //             "asks": [
        //                 { "price": "45", "order_count": 2, "quantity": "4193.3283464" }
        //             ]
        //         }
        //     }
        //
        const orderbook = this.safeValue (response, 'data', {});
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'quantity');
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id": 38199941,
        //         "price": "3378.67",
        //         "amount": "0.019812",
        //         "taker_side": "ASK",
        //         "created_at": "2019-01-29T06:05:56Z"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     ...
        //
        const timestamp = this.parse8601 (this.safeString2 (trade, 'created_at', 'inserted_at'));
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
        const takerSide = this.safeString (trade, 'taker_side');
        const side = (takerSide === 'ASK') ? 'sell' : 'buy';
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
            'asset_pair_name': market['id'],
        };
        const response = await this.publicGetAssetPairsAssetPairNameTrades (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "id": 38199941,
        //                 "price": "3378.67",
        //                 "amount": "0.019812",
        //                 "taker_side": "ASK",
        //                 "created_at": "2019-01-29T06:05:56Z"
        //             },
        //             {
        //                 "id": 38199934,
        //                 "price": "3376.14",
        //                 "amount": "0.019384",
        //                 "taker_side": "ASK",
        //                 "created_at": "2019-01-29T06:05:40Z"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        //
        //     {
        //         close: '0.021562',
        //         high: '0.021563',
        //         low: '0.02156',
        //         open: '0.021563',
        //         time: '2019-11-21T07:54:00Z',
        //         volume: '59.84376'
        //     }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'time')),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100; // default 100, max 500
        }
        const request = {
            'asset_pair_name': market['id'],
            'period': this.timeframes[timeframe],
            'limit': limit,
        };
        if (since !== undefined) {
            // const start = parseInt (since / 1000);
            const end = this.sum (since, limit * this.parseTimeframe (timeframe) * 1000);
            request['time'] = this.iso8601 (end);
        }
        const response = await this.publicGetAssetPairsAssetPairNameCandles (this.extend (request, params));
        //
        //     {
        //         code: 0,
        //         data: [
        //             {
        //                 close: '0.021656',
        //                 high: '0.021658',
        //                 low: '0.021652',
        //                 open: '0.021652',
        //                 time: '2019-11-21T09:30:00Z',
        //                 volume: '53.08664'
        //             },
        //             {
        //                 close: '0.021652',
        //                 high: '0.021656',
        //                 low: '0.021652',
        //                 open: '0.021656',
        //                 time: '2019-11-21T09:29:00Z',
        //                 volume: '88.39861'
        //             },
        //         ]
        //     }
        //
        const ohlcvs = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
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
        const baseUrl = this.implodeParams (this.urls['api'][api], { 'hostname': this.hostname });
        let url = baseUrl + '/' + this.implodeParams (path, params);
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
