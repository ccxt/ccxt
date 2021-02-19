'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, OrderNotFound, InsufficientFunds, PermissionDenied, BadRequest, RateLimitExceeded, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bigone extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bigone',
            'name': 'BigONE',
            'countries': [ 'CN' ],
            'version': 'v3',
            'rateLimit': 1200, // 500 request per 10 minutes
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
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
            'hostname': 'big.one', // or 'bigone.com'
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/69354403-1d532180-0c91-11ea-88ed-44c06cefdf87.jpg',
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
                        'fund/accounts',
                        'assets/{asset_symbol}/address',
                        'orders',
                        'orders/{id}',
                        'orders/multi',
                        'trades',
                        'withdrawals',
                        'deposits',
                    ],
                    'post': [
                        'orders',
                        'orders/{id}/cancel',
                        'orders/cancel',
                        'withdrawals',
                        'transfer',
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
                'exact': {
                    '10001': BadRequest, // syntax error
                    '10005': ExchangeError, // internal error
                    "Amount's scale must greater than AssetPair's base scale": InvalidOrder,
                    '10007': BadRequest, // parameter error, {"code":10007,"message":"Amount's scale must greater than AssetPair's base scale"}
                    '10011': ExchangeError, // system error
                    '10013': OrderNotFound, // {"code":10013,"message":"Resource not found"}
                    '10014': InsufficientFunds, // {"code":10014,"message":"Insufficient funds"}
                    '10403': PermissionDenied, // permission denied
                    '10429': RateLimitExceeded, // too many requests
                    '40004': AuthenticationError, // {"code":40004,"message":"invalid jwt"}
                    '40103': AuthenticationError, // invalid otp code
                    '40104': AuthenticationError, // invalid asset pin code
                    '40301': PermissionDenied, // {"code":40301,"message":"Permission denied withdrawal create"}
                    '40302': ExchangeError, // already requested
                    '40601': ExchangeError, // resource is locked
                    '40602': ExchangeError, // resource is depleted
                    '40603': InsufficientFunds, // insufficient resource
                    '40120': InvalidOrder, // Order is in trading
                    '40121': InvalidOrder, // Order is already cancelled or filled
                },
                'broad': {
                },
            },
            'commonCurrencies': {
                'MBN': 'Mobilian Coin',
                'ONE': 'BigONE Token',
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
            const minCost = this.safeInteger (market, 'min_quote_value');
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
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': minCost,
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
        const marketId = this.safeString (ticker, 'asset_pair_name');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = undefined;
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
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetPing (params);
        //
        //     {
        //         "data": {
        //             "timestamp": 1527665262168391000
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (data, 'timestamp');
        return parseInt (timestamp / 1000000);
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
        //     {
        //         "id": 10854280,
        //         "asset_pair_name": "XIN-USDT",
        //         "price": "70",
        //         "amount": "1",
        //         "taker_side": "ASK",
        //         "maker_order_id": 58284908,
        //         "taker_order_id": 58284909,
        //         "maker_fee": "0.0008",
        //         "taker_fee": "0.07",
        //         "side": "SELF_TRADING",
        //         "inserted_at": "2019-04-16T12:00:01Z"
        //     },
        //
        //     {
        //         "id": 10854263,
        //         "asset_pair_name": "XIN-USDT",
        //         "price": "75.7",
        //         "amount": "12.743149",
        //         "taker_side": "BID",
        //         "maker_order_id": null,
        //         "taker_order_id": 58284888,
        //         "maker_fee": null,
        //         "taker_fee": "0.0025486298",
        //         "side": "BID",
        //         "inserted_at": "2019-04-15T06:20:57Z"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString2 (trade, 'created_at', 'inserted_at'));
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        const marketId = this.safeString (trade, 'asset_pair_name');
        const symbol = this.safeSymbol (marketId, market, '-');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = this.costToPrecision (symbol, price * amount);
            }
        }
        let side = this.safeString (trade, 'side');
        const takerSide = this.safeString (trade, 'taker_side');
        let takerOrMaker = undefined;
        if ((takerSide !== undefined) && (side !== undefined) && (side !== 'SELF_TRADING')) {
            takerOrMaker = (takerSide === side) ? 'taker' : 'maker';
        }
        if (side === undefined) {
            // taker side is not related to buy/sell side
            // the following code is probably a mistake
            side = (takerSide === 'ASK') ? 'sell' : 'buy';
        } else {
            if (side === 'BID') {
                side = 'buy';
            } else if (side === 'ASK') {
                side = 'sell';
            }
        }
        const makerOrderId = this.safeString (trade, 'maker_order_id');
        const takerOrderId = this.safeString (trade, 'taker_order_id');
        let orderId = undefined;
        if (makerOrderId !== undefined) {
            if (takerOrderId !== undefined) {
                orderId = [ makerOrderId, takerOrderId ];
            } else {
                orderId = makerOrderId;
            }
        } else if (takerOrderId !== undefined) {
            orderId = takerOrderId;
        }
        const id = this.safeString (trade, 'id');
        const result = {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': 'limit',
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': parseFloat (cost),
            'info': trade,
        };
        let makerCurrencyCode = undefined;
        let takerCurrencyCode = undefined;
        if ((market !== undefined) && (takerOrMaker !== undefined)) {
            if (side === 'buy') {
                if (takerOrMaker === 'maker') {
                    makerCurrencyCode = market['base'];
                    takerCurrencyCode = market['quote'];
                } else {
                    makerCurrencyCode = market['quote'];
                    takerCurrencyCode = market['base'];
                }
            } else {
                if (takerOrMaker === 'maker') {
                    makerCurrencyCode = market['quote'];
                    takerCurrencyCode = market['base'];
                } else {
                    makerCurrencyCode = market['base'];
                    takerCurrencyCode = market['quote'];
                }
            }
        } else if (side === 'SELF_TRADING') {
            if (takerSide === 'BID') {
                makerCurrencyCode = market['quote'];
                takerCurrencyCode = market['base'];
            } else if (takerSide === 'ASK') {
                makerCurrencyCode = market['base'];
                takerCurrencyCode = market['quote'];
            }
        }
        const makerFeeCost = this.safeFloat (trade, 'maker_fee');
        const takerFeeCost = this.safeFloat (trade, 'taker_fee');
        if (makerFeeCost !== undefined) {
            if (takerFeeCost !== undefined) {
                result['fees'] = [
                    { 'cost': makerFeeCost, 'currency': makerCurrencyCode },
                    { 'cost': takerFeeCost, 'currency': takerCurrencyCode },
                ];
            } else {
                result['fee'] = { 'cost': makerFeeCost, 'currency': makerCurrencyCode };
            }
        } else if (takerFeeCost !== undefined) {
            result['fee'] = { 'cost': takerFeeCost, 'currency': takerCurrencyCode };
        } else {
            result['fee'] = undefined;
        }
        return result;
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

    parseOHLCV (ohlcv, market = undefined) {
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
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const type = this.safeString (params, 'type', '');
        params = this.omit (params, 'type');
        const method = 'privateGet' + this.capitalize (type) + 'Accounts';
        const response = await this[method] (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {"asset_symbol":"NKC","balance":"0","locked_balance":"0"},
        //             {"asset_symbol":"UBTC","balance":"0","locked_balance":"0"},
        //             {"asset_symbol":"READ","balance":"0","locked_balance":"0"},
        //         ],
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', []);
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
        //
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
        //        "updated_at":"2019-01-29T06:05:56Z",
        //    }
        //
        const id = this.safeString (order, 'id');
        const marketId = this.safeString (order, 'asset_pair_name');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'filled_amount');
        let remaining = undefined;
        if (amount !== undefined && filled !== undefined) {
            remaining = Math.max (0, amount - filled);
        }
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
        const lastTradeTimestamp = this.parse8601 (this.safeString (order, 'updated_at'));
        const average = this.safeFloat (order, 'avg_deal_price');
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        side = (side === 'buy') ? 'BID' : 'ASK';
        const uppercaseType = type.toUpperCase ();
        const request = {
            'asset_pair_name': market['id'], // asset pair name BTC-USDT, required
            'side': side, // order side one of "ASK"/"BID", required
            'amount': this.amountToPrecision (symbol, amount), // order amount, string, required
            // 'price': this.priceToPrecision (symbol, price), // order price, string, required
            'type': uppercaseType,
            // 'operator': 'GTE', // stop orders only, GTE greater than and equal, LTE less than and equal
            // 'immediate_or_cancel': false, // limit orders only, must be false when post_only is true
            // 'post_only': false, // limit orders only, must be false when immediate_or_cancel is true
        };
        if (uppercaseType === 'LIMIT') {
            request['price'] = this.priceToPrecision (symbol, price);
        } else {
            const isStopLimit = (uppercaseType === 'STOP_LIMIT');
            const isStopMarket = (uppercaseType === 'STOP_MARKET');
            if (isStopLimit || isStopMarket) {
                const stopPrice = this.safeFloat2 (params, 'stop_price', 'stopPrice');
                if (stopPrice === undefined) {
                    throw new ArgumentsRequired (this.id + ' createOrder() requires a stop_price parameter');
                }
                request['stop_price'] = this.priceToPrecision (symbol, stopPrice);
                params = this.omit (params, [ 'stop_price', 'stopPrice' ]);
            }
            if (isStopLimit) {
                request['price'] = this.priceToPrecision (symbol, price);
            }
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        //
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
        //
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
        //     {
        //         "code":0,
        //         "data": {
        //             "cancelled":[
        //                 58272370,
        //                 58272377
        //             ],
        //             "failed": []
        //         }
        //     }
        //
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { 'id': id };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        const order = this.safeValue (response, 'data', {});
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'asset_pair_name': market['id'],
            // 'page_token': 'dxzef', // request page after this page token
            // 'side': 'ASK', // 'ASK' or 'BID', optional
            // 'state': 'FILLED', // 'CANCELLED', 'FILLED', 'PENDING'
            // 'limit' 20, // default 20, max 200
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 20, max 200
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        //
        //    {
        //        "code":0,
        //        "data": [
        //             {
        //                 "id": 10,
        //                 "asset_pair_name": "ETH-BTC",
        //                 "price": "10.00",
        //                 "amount": "10.00",
        //                 "filled_amount": "9.0",
        //                 "avg_deal_price": "12.0",
        //                 "side": "ASK",
        //                 "state": "FILLED",
        //                 "created_at":"2019-01-29T06:05:56Z",
        //                 "updated_at":"2019-01-29T06:05:56Z",
        //             },
        //         ],
        //        "page_token":"dxzef",
        //    }
        //
        const orders = this.safeValue (response, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = {
            'asset_pair_name': market['id'],
            // 'page_token': 'dxzef', // request page after this page token
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 20, max 200
        }
        const response = await this.privateGetTrades (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "id": 10854280,
        //                 "asset_pair_name": "XIN-USDT",
        //                 "price": "70",
        //                 "amount": "1",
        //                 "taker_side": "ASK",
        //                 "maker_order_id": 58284908,
        //                 "taker_order_id": 58284909,
        //                 "maker_fee": "0.0008",
        //                 "taker_fee": "0.07",
        //                 "side": "SELF_TRADING",
        //                 "inserted_at": "2019-04-16T12:00:01Z"
        //             },
        //             {
        //                 "id": 10854263,
        //                 "asset_pair_name": "XIN-USDT",
        //                 "price": "75.7",
        //                 "amount": "12.743149",
        //                 "taker_side": "BID",
        //                 "maker_order_id": null,
        //                 "taker_order_id": 58284888,
        //                 "maker_fee": null,
        //                 "taker_fee": "0.0025486298",
        //                 "side": "BID",
        //                 "inserted_at": "2019-04-15T06:20:57Z"
        //             }
        //         ],
        //         "page_token":"dxfv"
        //     }
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
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
                // 'recv_window': '30', // default 30
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

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset_symbol': currency['id'],
        };
        const response = await this.privateGetAssetsAssetSymbolAddress (this.extend (request, params));
        //
        // the actual response format is not the same as the documented one
        // the data key contains an array in the actual response
        //
        //     {
        //         "code":0,
        //         "message":"",
        //         "data":[
        //             {
        //                 "id":5521878,
        //                 "chain":"Bitcoin",
        //                 "value":"1GbmyKoikhpiQVZ1C9sbF17mTyvBjeobVe",
        //                 "memo":""
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const dataLength = data.length;
        if (dataLength < 1) {
            throw new ExchangeError (this.id + 'fetchDepositAddress() returned empty address response');
        }
        const firstElement = data[0];
        const address = this.safeString (firstElement, 'value');
        const tag = this.safeString (firstElement, 'memo');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            // what are other statuses here?
            'WITHHOLD': 'ok', // deposits
            'UNCONFIRMED': 'pending',
            'CONFIRMED': 'ok', // withdrawals
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "amount": "25.0",
        //         "asset_symbol": "BTS"
        //         "confirms": 100,
        //         "id": 5,
        //         "inserted_at": "2018-02-16T11:39:58.000Z",
        //         "is_internal": false,
        //         "kind": "default",
        //         "memo": "",
        //         "state": "WITHHOLD",
        //         "txid": "72e03037d144dae3d32b68b5045462b1049a0755",
        //         "updated_at": "2018-11-09T10:20:09.000Z",
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "amount": "5",
        //         "asset_symbol": "ETH",
        //         "completed_at": "2018-03-15T16:13:45.610463Z",
        //         "customer_id": "10",
        //         "id": 10,
        //         "inserted_at": "2018-03-15T16:13:45.610463Z",
        //         "is_internal": true,
        //         "note": "2018-03-15T16:13:45.610463Z",
        //         "state": "CONFIRMED",
        //         "target_address": "0x4643bb6b393ac20a6175c713175734a72517c63d6f7"
        //         "txid": "0x4643bb6b393ac20a6175c713175734a72517c63d6f73a3ca90a15356f2e967da0",
        //     }
        //
        // withdraw
        //
        //     {
        //         "id":1077391,
        //         "customer_id":1082679,
        //         "amount":"21.9000000000000000",
        //         "txid":"",
        //         "is_internal":false,
        //         "kind":"on_chain",
        //         "state":"PENDING",
        //         "inserted_at":"2020-06-03T00:50:57+00:00",
        //         "updated_at":"2020-06-03T00:50:57+00:00",
        //         "memo":"",
        //         "target_address":"rDYtYT3dBeuw376rvHqoZBKW3UmvguoBAf",
        //         "fee":"0.1000000000000000",
        //         "asset_symbol":"XRP"
        //     }
        //
        const currencyId = this.safeString (transaction, 'asset_symbol');
        const code = this.safeCurrencyCode (currencyId);
        const id = this.safeInteger (transaction, 'id');
        const amount = this.safeFloat (transaction, 'amount');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const timestamp = this.parse8601 (this.safeString (transaction, 'inserted_at'));
        const updated = this.parse8601 (this.safeString2 (transaction, 'updated_at', 'completed_at'));
        const txid = this.safeString (transaction, 'txid');
        const address = this.safeString (transaction, 'target_address');
        const tag = this.safeString (transaction, 'memo');
        const type = ('customer_id' in transaction) ? 'deposit' : 'withdrawal';
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': undefined,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'page_token': 'dxzef', // request page after this page token
            // 'limit': 50, // optional, default 50
            // 'kind': 'string', // optional - air_drop, big_holder_dividend, default, eosc_to_eos, internal, equally_airdrop, referral_mining, one_holder_dividend, single_customer, snapshotted_airdrop, trade_mining
            // 'asset_symbol': 'BTC', // optional
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset_symbol'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50
        }
        const response = await this.privateGetDeposits (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "page_token": "NQ==",
        //         "data": [
        //             {
        //                 "id": 5,
        //                 "amount": "25.0",
        //                 "confirms": 100,
        //                 "txid": "72e03037d144dae3d32b68b5045462b1049a0755",
        //                 "is_internal": false,
        //                 "inserted_at": "2018-02-16T11:39:58.000Z",
        //                 "updated_at": "2018-11-09T10:20:09.000Z",
        //                 "kind": "default",
        //                 "memo": "",
        //                 "state": "WITHHOLD",
        //                 "asset_symbol": "BTS"
        //             }
        //         ]
        //     }
        //
        const deposits = this.safeValue (response, 'data', []);
        return this.parseTransactions (deposits, code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'page_token': 'dxzef', // request page after this page token
            // 'limit': 50, // optional, default 50
            // 'kind': 'string', // optional - air_drop, big_holder_dividend, default, eosc_to_eos, internal, equally_airdrop, referral_mining, one_holder_dividend, single_customer, snapshotted_airdrop, trade_mining
            // 'asset_symbol': 'BTC', // optional
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset_symbol'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50
        }
        const response = await this.privateGetWithdrawals (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "id": 10,
        //                 "customer_id": "10",
        //                 "asset_symbol": "ETH",
        //                 "amount": "5",
        //                 "state": "CONFIRMED",
        //                 "note": "2018-03-15T16:13:45.610463Z",
        //                 "txid": "0x4643bb6b393ac20a6175c713175734a72517c63d6f73a3ca90a15356f2e967da0",
        //                 "completed_at": "2018-03-15T16:13:45.610463Z",
        //                 "inserted_at": "2018-03-15T16:13:45.610463Z",
        //                 "is_internal": true,
        //                 "target_address": "0x4643bb6b393ac20a6175c713175734a72517c63d6f7"
        //             }
        //         ],
        //         "page_token":"dxvf"
        //     }
        //
        const withdrawals = this.safeValue (response, 'data', []);
        return this.parseTransactions (withdrawals, code, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
            'target_address': address,
            'amount': this.currencyToPrecision (code, amount),
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        // requires write permission on the wallet
        const response = await this.privatePostWithdrawals (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "message":"",
        //         "data":{
        //             "id":1077391,
        //             "customer_id":1082679,
        //             "amount":"21.9000000000000000",
        //             "txid":"",
        //             "is_internal":false,
        //             "kind":"on_chain",
        //             "state":"PENDING",
        //             "inserted_at":"2020-06-03T00:50:57+00:00",
        //             "updated_at":"2020-06-03T00:50:57+00:00",
        //             "memo":"",
        //             "target_address":"rDYtYT3dBeuw376rvHqoZBKW3UmvguoBAf",
        //             "fee":"0.1000000000000000",
        //             "asset_symbol":"XRP"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransaction (data, currency);
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //      {"code":10013,"message":"Resource not found"}
        //      {"code":40004,"message":"invalid jwt"}
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        if (code !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
