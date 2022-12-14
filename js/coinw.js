'use strict';

//  ---------------------------------------------------------------------------
const Exchange = require ('./base/Exchange');
// const { ExchangeError, AccountSuspended, ArgumentsRequired, AuthenticationError, DDoSProtection, ExchangeNotAvailable, InvalidOrder, OrderNotFound, PermissionDenied, InsufficientFunds, BadSymbol, RateLimitExceeded, BadRequest } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
// const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class coinw extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinw',
            'name': 'CoinW',
            'countries': [ 'CN' ],
            'rateLimit': 166.667, // TODO: Check rate limit
            'version': 'v1',
            'hostname': 'coinw.com',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined,
                'swap': undefined, // has but unimplemented
                'future': undefined,
                'option': undefined,
                'cancelAllOrders': true, // https://api.coinw.com/api/v1/private?command=cancelAllOrder
                'cancelOrder': true, // https://api.coinw.com/api/v1/private?command=cancelOrder
                'createOrder': true, // https://api.coinw.com/api/v1/private?command=doTrade
                'fetchBalance': true, // https://api.coinw.com/api/v1/private?command=returnCompleteBalances
                'fetchClosedOrders': true, // https://api.coinw.com/api/v1/private?command=returnUTradeHistory
                'fetchCurrencies': true,
                'fetchDeposists': true, // https://api.coinw.com/api/v1/private?command=returnDepositsWithdrawals
                'fetchMarkets': true,
                'fetchMyTrades': true, // https://api.coinw.com/api/v1/private?command=getUserTrades
                'fetchOHLCV': true,
                'fetchOpenOrders': true, // https://api.coinw.com/api/v1/private?command=returnOpenOrders
                'fetchOrder': true, // https://api.coinw.com/api/v1/private?command=returnOrderTrades
                'fetchOrderBook': true,
                'fetchTicker': 'emulated',
                'fetchTickers': true,
                'fetchTrades': true, // https://api.coinw.com/api/v1/public?command=returnTradeHistory&symbol=CWT_CNYT&start=1579238517000&end=1581916917660
                'fetchWithdrawals': true, // https://api.coinw.com/api/v1/private?command=returnDepositsWithdrawals
                'transfer': true, // https://api.coinw.com/api/v1/public?command=spotWealthTransfer
                'withdraw': true, // https://api.coinw.com/api/v1/private?command=doWithdraw
            },
            'timeframes': {
                '1m': '60',
                '3m': '180',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '2h': '7200',
                '4h': '14400',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/77257418-3262b000-6c85-11ea-8fb8-20bdf20b3592.jpg',
                'api': {
                    'rest': 'https://api.{hostname}',
                },
                'www': 'https://www.{hostname}',
                'doc': [
                    'https://www.coinw.com/api_doc.html',
                    'https://www.coinw.com/front/API',
                ],
                'fees': 'https://www.coinw.com/service/coinFee.html',
            },
            'api': {
                'public': {
                    'get': {
                        'returnTicker': 1,
                        'returnCurrencies': 1,
                        'returnSymbol': 1,
                        'returnOrderBook': 1,
                        'returnTradeHistory': 1,
                        'returnChartData': 1,
                        'return24hVolume': 1,
                    },
                    'post': {
                        'spotWealthTransfer': 1, // TODO: public transfer ??? -> https://api.coinw.com/api/v1/public?command=spotWealthTransfer
                    },
                },
                'private': {
                    'post': {
                        'returnOpenOrders': 1,
                        'returnOrderTrades': 1,
                        'returnOrderStatus': 1,
                        'returnUTradeHistory': 1,
                        'getUserTrades': 1,
                        'doTrade': 1,
                        'cancelOrder': 1,
                        'cancelAllOrder': 1,
                        'returnBalances': 1,
                        'returnCompleteBalances': 1,
                        'returnDepositsWithdrawals': 1,
                        'doWithdraw': 1,
                        'cancelWithdraw': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false, // TODO: Include tiers
                    'percentage': true,
                    'taker': this.parseNumber ('0.002'),
                    'maker': this.parseNumber ('0.002'),
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': { // TODO: Handle exceptions
            },
            'commonCurrencies': {
            },
            'options': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name coinw#fetchMarkets
         * @description retrieves data on all markets for coinw
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetReturnSymbol (params);
        //
        //    [
        //        {
        //            "currencyBase":"SDOG",
        //            "maxBuyCount":"99999999999",
        //            "pricePrecision":10,
        //            "minBuyPrice":"0.0",
        //            "currencyPair":"SDOG_USDT",
        //            "minBuyAmount":"5.0",
        //            "maxBuyPrice":"9999.0",
        //            "currencyQuote":"USDT",
        //            "countPrecision":1,
        //            "minBuyCount":"1000.0",
        //            "state":1,
        //            "maxBuyAmount":"9999.0"
        //        },
        //    ]
        //
        const data = this.safeValue (response, 'data', []);
        const dataLength = data.length;
        const result = [];
        for (let i = 0; i < dataLength; i++) {
            const market = data[i];
            const id = this.safeString (market, 'currencyPair');
            const baseId = this.safeString (market, 'currencyBase');
            const quoteId = this.safeString (market, 'currencyQuote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const type = 'spot';
            const spot = true;
            const amountPrecision = this.safeString (market, 'countPrecision');
            const pricePrecision = this.safeString (market, 'pricePrecision');
            const state = this.safeString (market, 'state');
            result.push ({
                'id': id,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'type': type,
                'spot': spot,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': (state === '1'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (amountPrecision)),
                    'price': this.parseNumber (this.parsePrecision (pricePrecision)),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minBuyAmount'),
                        'max': this.safeNumber (market, 'maxBuyAmount'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'minBuyPrice'),
                        'max': this.safeNumber (market, 'maxBuyPrice'),
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_order_value'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name coinw#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the coinw api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetReturnCurrencies (params);
        //
        //  {
        //      "AGLD":{
        //         "maxQty":"5714.0",
        //         "minQty":"3.0",
        //         "recharge":"1",
        //         "symbol":"AGLD",
        //         "symbolId":"569",
        //         "txFee":"0.0",
        //         "withDraw":"1"
        //     },
        //  }
        //
        const data = this.safeValue (response, 'data', {});
        const dataKeys = Object.keys (data);
        const dataLength = dataKeys.length;
        const result = {};
        for (let i = 0; i < dataLength; i++) {
            const dataKey = dataKeys[i];
            const currency = data[dataKey];
            const symbolId = this.safeString (currency, 'symbolId');
            const code = this.safeCurrencyCode (this.safeString (currency, 'symbol'));
            const withdraw = this.safeString (currency, 'withDraw');
            result[code] = {
                'id': symbolId,
                'code': code,
                'info': currency,
                'name': undefined,
                'active': undefined,
                'deposit': undefined,
                'withdraw': (withdraw === '1'),
                'fee': this.safeNumber (currency, 'txFee'),
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (currency, 'minQty'),
                        'max': this.safeNumber (currency, 'maxQty'),
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //   "EET_CNYT":{
        //       "percentChange":"0",
        //       "high24hr":"0.0",
        //       "last":"0.008",
        //       "highestBid":"0.007",
        //       "id":39,
        //       "isFrozen":0
        //       "baseVolume":"0.0",
        //       "lowestAsk":"0.008",
        //       "low24hr":"0.0"
        //   }
        //
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high24hr'),
            'low': this.safeString (ticker, 'low24hr'),
            'bid': this.safeString (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'percentChange'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name coinw#fetchTickers
         * @description v1, fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the coinw api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetReturnTicker (params);
        //
        //   {
        //       "code":"200",
        //       "data":{
        //           "EET_CNYT":{
        //               "percentChange":"0",
        //               "high24hr":"0.0",
        //               "last":"0.008",
        //               "highestBid":"0.007",
        //               "id":39,
        //               "isFrozen":0
        //               "baseVolume":"0.0",
        //               "lowestAsk":"0.008",
        //               "low24hr":"0.0"
        //           }
        //       },
        //       "msg":"SUCCESS"
        //   }
        //
        const data = this.safeValue (response, 'data', {});
        const tickers = this.parseTickers (data, symbols);
        const result = this.indexBy (tickers, 'symbol');
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTrade (trade, market = undefined) {
        //
        //    {
        //        amount: '0.6463',
        //        id: '76700619',
        //        price: '16956.08',
        //        time: '2022-12-02 23:14:34',
        //        total: '10958.714504',
        //        type: 'SELL'
        //    }
        //
        const datetime = this.safeString (trade, 'time');
        const orderId = this.safeString (trade, 'id');
        return this.safeTrade ({
            'info': trade,
            'id': orderId,
            'order': orderId,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': market['symbol'],
            'type': undefined,
            'takerOrMaker': undefined,
            'side': this.safeStringLower (trade, 'type'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': this.safeString (trade, 'total'),
            'fee': {
                'cost': undefined,
                'currency': undefined,
            },
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinw#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum number of trades structures to retrieve, default = 100, max = 1000
         * @param {object} params extra parameters specific to the coinw api endpoint
         * @param {int|undefined} params.end the earliest time in ms to fetch trades for
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.publicGetReturnTradeHistory (this.extend (request, params));
        //
        //    {
        //        "code":"200",
        //        "data":[
        //        {
        //            "amount":49.2,
        //            "total":160.5888,
        //            "price":3.264,
        //            "id":416253782,
        //            "time":"2020-01-09 10:10:15",
        //            "type":"buy"
        //        },{
        //            "amount":63.4,
        //            "total":207.1278,
        //            "price":3.267,
        //            "id":416253778,
        //            "time":"2020-01-09 10:10:15",
        //            "type":"sell"
        //            }
        //        ],
        //        "msg":"SUCCESS"
        //    }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinw#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit *default=100* valid values include 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000
         * @param {object} params extra parameters specific to the coinw api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            limit = Math.min (20, Math.max (5, limit));
            request['size'] = limit;
        }
        const response = await this.publicGetReturnOrderBook (this.extend (request, params));
        //
        //   {
        //       code: '200',
        //       data: {
        //         asks: [
        //             [ '16910.1600', '0.2049' ]
        //          ],
        //         bids: [
        //             [ '16908.6300', '0.2849' ],
        //          ]
        //       },
        //       msg: 'SUCCESS'
        //   }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrderBook (data, market['symbol']);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //       {
        //           "date":1.5809922E12,
        //           "volume":0.0,
        //           "high":8.803,
        //           "low":8.803,
        //           "close":8.803,
        //           "open":8.803
        //       },
        //
        return [
            this.safeInteger (ohlcv, 'date'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinw#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the coinw api endpoint
         * @param {int|undefined} params.end timestamp in ms of the latest candle to fetch
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.publicGetReturnChartData (this.extend (request, params));
        //
        //   {
        //       "code":"200",
        //       "data":[{
        //           "date":1.5809922E12,
        //           "volume":0.0,
        //           "high":8.803,
        //           "low":8.803,
        //           "close":8.803,
        //           "open":8.803
        //         },{
        //           "date":1.580994E12,
        //           "volume":0.0,
        //           "high":8.803,
        //           "low":8.803,
        //           "close":8.803,
        //           "open":8.803
        //         },{
        //           "date":1.5822864E12,
        //           "volume":121503.276,
        //           "high":9.587,
        //           "low":9.169,
        //           "close":9.4949,
        //           "open":9.4274
        //         },{
        //           "date":1.5822882E12,
        //           "volume":137447.694,
        //           "high":9.575,
        //           "low":9.191,
        //           "close":9.4599,
        //           "open":9.4949
        //         }
        //       ],
        //       "msg":"SUCCESS"
        //   }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchBalance2 (params = {}) {
        // Test out `sign()` function
        const request = {};
        const response = await this.privatePostReturnCompleteBalances (this.extend (request, params));
        console.log (response);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const access = api;
        const prefix = 'api/v1';
        let url = this.implodeHostname (this.urls['api']['rest']) + '/' + prefix + '/' + access + '?command=' + path;
        headers = { 'content-type': 'application/json' };
        if (access === 'public') {
            url += '&' + this.urlencode (params); // TODO: Post - Transfer??
        } else {
            this.checkRequiredCredentials ();
            method = 'POST'; // -> Only POST endpoints
            body = this.json (params);
            params['api_key'] = this.apiKey;
            const sortedParams = this.keysort (params);
            url += '&' + this.urlencode (sortedParams) + '&';
            url += 'secret_key=' + this.secret; // FIXME: secret can't be directly added to the url? Since verbose outputs the url?
            const signature = this.hash (url, 'md5', 'hash');
            headers = {
                'api_key': this.encode (this.apiKey),
                'signature': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    // handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
    //     // TODO: handleErrors
    // }
};
