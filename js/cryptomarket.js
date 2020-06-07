'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class cryptomarket extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cryptomarket',
            'name': 'CryptoMarket',
            'countries': [ 'AR', 'BR', 'CL', 'EU', 'MXN' ],  // countries sorted acending
            'rateLimit': 6000, // in miliseconds
            'version': 'v2',
            'has': {
                'CORS': true,
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': true,
                'createDepositAddress': false,
                'createOrder': true,
                'deposit': false,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true, // makes two api calls, one for each side of the market, and is [price, amount, timestamp]
                'fetchOrders': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransactions': true, // requires limit and currency params
                'withdraw': false,
            },
            'urls': {
                'api': 'https://api.cryptomkt.com',
                'www': 'https://www.cryptomkt.com',
                'doc': 'https://developers.cryptomkt.com',
                'fees': 'https://www.cryptomkt.com/es/tarifas',
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '1h': 60,
                '4h': 240,
                '1d': 1440,
                '1w': 10080,
            },
            'api': {
                'public': {
                    'get': [
                        'market',
                        'ticker',
                        'book',
                        'trades',
                        'prices',
                    ],
                },
                'private': {
                    'get': [
                        'account',
                        'orders/active',
                        'balance',
                        'orders/executed',
                        'orders/status',
                        'transactions',
                    ],
                    'post': [
                        'orders/cancel',
                        'orders/create',
                        'request/deposit',
                        'request/withdrawal',
                        'transfer',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.2 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.68 / 100],
                            [2000, 0.58 / 100],
                            [20000, 0.48 / 100],
                            [100000, 0.38 / 100],
                            [500000, 0.28 / 100],
                        ],
                        'maker': [
                            [0, 0.39 / 100],
                            [2000, 0.34 / 100],
                            [20000, 0.29 / 100],
                            [100000, 0.19 / 100],
                            [500000, 0.09 / 100],
                        ],
                    },
                },
                'funding': {
                    'tierBased': false,
                    'percentage': true,
                    'withdraw': {
                        'BTC': 0,
                        'EOS': 0,
                        'ETH': 0,
                        'XLM': 0,
                        'ARS': 0.9 / 100,
                        'BRL': 8.9, // fixed amount, not a percentage
                        'CLP': 0,
                        'EUR': 0,
                        'MXN': 0,
                    },
                    'deposit': {
                        'BTC': 0,
                        'EOS': 0,
                        'ETH': 0,
                        'XLM': 0,
                        'ARS': 0.9 / 100,
                        'BRL': 0,
                        'CLP': 0,
                        'EUR': 0,
                        'MXN': 0,
                    },
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarket (params);
        const data = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const currency_pair = data[i];
            const baseId = currency_pair.slice (0, 3);
            const quoteId = currency_pair.slice (3, 6);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            // const precision = {
            //     'amount': undefined,
            //     'price': undefined,
            // };
            result.push ({
                'id': currency_pair,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': currency_pair,
            });
        }
        return result;
    }

    parseOrderStatus (status) {
        const statuses = {
            'queued': 'open',
            'filled': 'closed',
            'cancelled': 'canceled', // turns out both spellings are correct, the first its preferred by british writers, and the second by north american writers.
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // if is a closed order
        // {'amount': {'executed': '1', 'original': '1'},
        //    'avg_execution_price': '47.85',
        //    'created_at': '2020-02-26T20:56:42.360000',
        //    'fee': '0.325',
        //    'fills': [{'amount': '47.85',
        //               'date': '2020-02-26T20:56:42',
        //               'fee': '0.325',
        //               'price': '47.85'}],
        //    'id': 'O614553',
        //    'market': 'XLMCLP',
        //    'price': '0', // 0 if a market order, else  (limit or stop-limit) it has value
        //    'side': 'sell',
        //    'status': 'filled',
        //    'stop': None,
        //    'type': 'market',
        //    'updated_at': '2020-02-26T20:56:43.460454'
        // }
        // if is an open order, then is a subset of a closed order (no fills and fee = 0)
        // {
        //     'amount': {'executed': '0', 'original': '1'},
        //     'avg_execution_price': '0',
        //     'created_at': '2020-05-18T01:49:33.302000',
        //     'fee': '0',
        //     'id': 'O9761171',
        //     'market': 'XLMCLP',
        //     'price': '120',
        //     'side': 'sell',
        //     'status': 'queued',
        //     'stop': None,
        //     'type': 'limit',
        //     'updated_at': '2020-05-18T01:49:33.342640'
        // }
        const id = this.safeString (order, 'id');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const amountDict = this.safeValue (order, 'amount');
        const amount = this.safeFloat (amountDict, 'original');
        const filled = this.safeFloat (amountDict, 'executed');
        const remaining = amount - filled;
        const price = this.safeFloat (order, 'avg_execution_price');
        const type = this.safeString (order, 'type'); // can be 'market', 'limit' and 'stop-limit'
        const side = this.safeString (order, 'side');
        const fee = this.safeFloat (order, 'fee');
        const created_at = this.safeString (order, 'created_at');
        if (market === undefined) {
            const marketId = this.safeString (order, 'market');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        let symbol = undefined;
        let feeCurrency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            if (side === 'buy') {
                feeCurrency = market['base'];
            } else { // side === "sell"
                feeCurrency = market['quote'];
            }
        }
        const fills = this.safeValue (order, 'fills');
        const trades = this.parseTrades (fills, market, undefined, undefined);
        const tradesLenght = trades.length;
        const lastTradeTimestamp = this.safeInteger (trades[tradesLenght - 1], 'timestamp');
        const cost = filled * price;
        return {
            'id': id,
            'clientOrderId': undefined,
            'datetime': created_at,
            'timestamp': this.parse8601 (created_at),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': trades,
            'fee': { 'currency': feeCurrency, 'cost': fee },
            'info': order,
        };
    }

    parseTrade (trade, market = undefined) {
        // if it is a trade from fetch trades
        // {
        //     "amount": "0.0876",
        //     "market": "ETHCLP",
        //     "market_taker": "buy",
        //     "price": "169600",
        //     "timestamp": "2020-03-09T19:10:38"
        // }
        // if it is a fill from an order
        // {
        //     'amount': '47.85',
        //     'date': '2020-02-26T20:56:42',
        //     'fee': '0.325',
        //     'price': '47.85'
        // }
        const amount = this.safeFloat (trade, 'amount');
        const price = this.safeFloat (trade, 'price');
        const side = this.safeString (trade, 'market_taker');
        let datetime = this.safeString2 (trade, 'timestamp', 'date');
        const timestamp = this.parse8601 (datetime);
        datetime = this.iso8601 (timestamp);
        if (market === undefined) {
            const marketId = this.safeString (trade, 'market');
            market = this.safeValue (this.markets_by_id, marketId, market);
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const fee = this.safeFloat (trade, 'fee');
        // we only know if is taker if it has the 'market_taker' field.
        let takerOrMaker = undefined;
        if (side !== undefined) {
            takerOrMaker = 'taker';
        }
        return {
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'type': undefined,
            'order': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'fee': {
                'cost': fee,
                'currency': undefined,
                'rate': undefined,
            },
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        if (since !== undefined) {
            const start = this.ymd (since);
            request = this.extend (request, {
                'start': start,
            });
        }
        if (limit !== undefined) {
            request = this.extend (request, {
                'limit': limit,
            });
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        const result = this.safeValue (response, 'data', []);
        return this.parseTrades (result, market, since, limit);
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     'ask': '18',
        //     'bid': '0',
        //     'high': '0',
        //     'last_price': '0',
        //     'low': '0',
        //     'market': 'XLMMXN',
        //     'timestamp': '2020-06-02T00:11:43.490327',
        //     'volume': '0'
        // }
        const datetime = this.safeString (ticker, 'timestamp');
        const high = this.safeFloat (ticker, 'high');
        const low = this.safeFloat (ticker, 'low');
        const ask = this.safeFloat (ticker, 'ask');
        const bid = this.safeFloat (ticker, 'bid');
        const last_price = this.safeFloat (ticker, 'last_price');
        if (market === undefined) {
            const marketId = this.safeString (ticker, 'market');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'symbol': symbol,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last_price,
            'last': last_price,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = {
            'market': marketId,
        };
        const response = await this.publicGetTicker (request);
        const data = this.safeValue (response, 'data');
        const ticker = data[0];
        return this.parseTicker (ticker);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker ();
        const data = this.safeValue (response, 'data');
        const tickers = data;
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            result[ticker['symbol']] = ticker;
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        // {
        //     "data": [
        //        {
        //           "timestamp": "2017-08-31T12:31:58.782060",
        //           "price": "252610",
        //           "amount": "0.6729"
        //        },
        //        {
        //           "timestamp": "2017-08-31T10:14:58.466285",
        //           "price": "252200",
        //           "amount": "7.6226"
        //        }
        //     ]
        //  }
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        let asksrequest = {
            'market': marketId,
            'side': 'sell',
        };
        let bidsrequest = {
            'market': marketId,
            'side': 'buy',
        };
        if (limit !== undefined) {
            asksrequest = this.extend (asksrequest, {
                'limit': limit,
            });
            bidsrequest = this.extend (bidsrequest, {
                'limit': limit,
            });
        }
        const asks = await this.publicGetBook (asksrequest); // first call to api
        const askList = this.safeValue (asks, 'data');
        await this.sleep (this.rateLimit); // delaying for safety
        const bids = await this.publicGetBook (bidsrequest); // second call to api
        const bidList = this.safeValue (bids, 'data');
        const result = {
            'bids': [],
            'asks': [],
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
        for (let i = 0; i < askList.length; i++) {
            const price = this.safeFloat (askList[i], 'price');
            const amount = this.safeFloat (askList[i], 'amount');
            const datetime = this.safeFloat (askList[i], 'timestamp');
            const timestamp = this.parse8601 (datetime);
            result['asks'].push ([price, amount, timestamp]);
        }
        for (let i = 0; i < bidList.length; i++) {
            const price = this.safeFloat (bidList[i], 'price');
            const amount = this.safeFloat (bidList[i], 'amount');
            const datetime = this.safeFloat (bidList[i], 'timestamp');
            const timestamp = this.parse8601 (datetime);
            result['bids'].push ([price, amount, timestamp]);
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        // {
        //     "candle_id": 9354058,
        //     "open_price": "148800",
        //     "hight_price": "150200",
        //     "close_price": "149760",
        //     "low_price": "142280",
        //     "volume_sum": "32.446",
        //     "candle_date": "2019-07-24 00:00",
        //     "tick_count": "760"
        // }
        const datetime = this.safeString (ohlcv, 'candle_date') + ':00';
        return [
            this.parse8601 (datetime),
            this.safeFloat (ohlcv, 'open_price'),
            this.safeFloat (ohlcv, 'hight_price'),
            this.safeFloat (ohlcv, 'low_price'),
            this.safeFloat (ohlcv, 'close_price'),
            this.safeFloat (ohlcv, 'volume_sum'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        // {
        //     "data": {
        //       "ask": [
        //        {
        //          "candle_id": 9354058,
        //          "open_price": "148800",
        //          "hight_price": "150200",
        //          "close_price": "149760",
        //          "low_price": "142280",
        //          "volume_sum": "32.446",
        //          "candle_date": "2019-07-24 00:00",
        //          "tick_count": "760"
        //        }
        //       ],
        //       "bid": [
        //         {
        //          "candle_id": 9354052,
        //          "open_price": "146260",
        //          "hight_price": "149900",
        //          "close_price": "147500",
        //          "low_price": "140060",
        //          "volume_sum": "32.446",
        //          "candle_date": "2019-07-24 00:00",
        //          "tick_count": "688"
        //        }
        //       ]
        //     }
        // }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'market': market['id'],
            'timeframe': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            if (limit > 20) {
                request = this.extend (request, {
                    'limit': limit,
                });
            }
        }
        const response = await this.publicGetPrices (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        const ohlcvs = this.safeValue (data, 'ask', []);
        const bidsohlcvs = this.safeValue (data, 'bid', []);
        for (let i = 0; i < bidsohlcvs.length; i++) {
            const ohlcv = bidsohlcvs[i];
            ohlcvs.push (ohlcv);
        }
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        // [
        //     {
        //         "available": "120347",
        //         "wallet": "CLP",
        //         "balance": "120347"
        //     },
        //     {
        //         "available": "10.3399",
        //         "wallet": "ETH",
        //         "balance": "11.3399"
        //     }
        // ]
        const response = await this.privateGetBalance (params);
        const data = this.safeValue (response, 'data');
        const result = { 'info': response };
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'wallet');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['total'] = this.safeFloat (balance, 'balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = {
            'market': marketId,
            'type': type,
            'amount': amount.toString (),
            'price': price.toString (),
            'side': side,
        };
        const response = await this.privatePostOrdersCreate (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privatePostOrdersCancel (request);
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersStatus (request);
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        let request = {
            'market': marketId,
        };
        if (limit !== undefined) {
            request = this.extend (request, {
                'limit': limit,
            });
        }
        const response = await this.privateGetOrdersActive (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrders (data);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        let request = {
            'market': marketId,
        };
        if (limit !== undefined) {
            request = this.extend (request, {
                'limit': limit,
            });
        }
        const response = await this.privateGetOrdersExecuted (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrders (data);
    }

    parseTransaction (transaction, currency = undefined) {
        // {
        //     "id": "T487247",
        //     "type": -1,
        //     "date": "2020-05-03T21:50:47",
        //     "currency": "XLM",
        //     "fee_amount": "0",
        //     "fee_percent": "0.00+0.00%",
        //     "amount": "1",
        //     "balance": "92",
        //     "hash": null,
        //     "address": "GDMXNQBJMS3FYI4PFSYCCB4XODQMNMTKPQ5HIKOUWBOWJ2P3CF6WASBE",
        //     "memo": "25767435",
        //     "blocks": 0,
        //     "penalty": "0"
        // }
        const id = this.safeString (transaction, 'id');
        const typeInt = this.safeInteger (transaction, 'type');
        let type = '';
        if (typeInt === -1) {
            type = 'deposit';
        } else { // type == 1
            type = 'withdrawal';
        }
        const datetime = this.safeString (transaction, 'date');
        if (currency === undefined) {
            currency = this.safeString (transaction, 'currency');
        }
        const fee_amount = this.safeFloat (transaction, 'fee_amount');
        const amount = this.safeFloat (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const memo = this.safeString (transaction, 'memo');
        return {
            'info': transaction,
            'id': id,
            'txid': undefined,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': memo,
            'type': type,
            'amount': amount,
            'currency': currency,
            'status': 'ok',
            'updated': undefined,
            'comment': undefined,
            'fee': {
                'currency': currency,
                'cost': fee_amount,
                'rate': undefined,
            },
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currency': code,
            'limit': limit,
        };
        const response = await this.privateGetTransactions (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseTransactions (data, code, since, limit);
    }

    nonce () {
        return this.microseconds () / 1000000;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let toSign = nonce + '/' + this.version + '/' + path;
            if (method === 'POST') {
                const keysorted = this.keysort (params);
                const keys = Object.keys (keysorted);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    toSign += keysorted[key];
                }
                body = this.urlencode (params);
            }
            const signature = this.hmac (this.encode (toSign), this.encode (this.secret), 'sha384');
            headers = {
                'X-MKT-APIKEY': this.apiKey,
                'X-MKT-SIGNATURE': signature,
                'X-MKT-TIMESTAMP': nonce,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        const paramLength = Object.keys (params).length;
        if (method === 'GET' && paramLength) {
            url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
