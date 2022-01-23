'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, RateLimitExceeded, BadSymbol, ArgumentsRequired, PermissionDenied, InsufficientFunds, InvalidOrder } = require ('./base/errors');
const { base } = require ('./static_dependencies/elliptic/lib/elliptic/curve');
// const Precise = require ('./base/Precise');

module.exports = class wazirx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'redot',
            'name': 'Redot',
            'countries': [ 'IN' ],
            'version': 'v1',
            'rateLimit': 100,
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'fetchCurrencies': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchFundingFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRates': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderBook': true,
                'fetchPositions': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'withdraw': false,
                'fetchDepositAddressesByNetwork': false,
                'transfer': false,
                'fetchTransfers': false,
            },
            'urls': {
                'logo': 'https://cdn.redot.com/static/icons/500px_transparent_background/Icon_0-3.png',
                'api': {
                    'public': 'https://api.redot.com/v1/public',
                    'private': 'https://api.redot.com/v1/private',
                },
                'www': 'https://redot.com/',
                'doc': 'https://redot.com/docs/#rest-api',
                'fees': 'https://wazirx.com/fees',
            },
            'api': {
                'public': {
                    'get': {
                        'get-info': 1,
                        'get-assets': 1,
                        'get-instruments': 1,
                        'get-instrument': 1,
                        'get-order-book': 1,
                        'get-ticker': 1,
                        'get-last-trades': 1,
                        'get-candles': 1,
                        'get-stats': 1,
                    },
                },
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '1h': '3600',
                '12h': '43200',
            },
            'exceptions': {
                'exact': {
                    '-32700': BadRequest, // { "code": -1121, "message": "Invalid symbol." }
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetGetInstruments (params);
        // {
        //     "result":[
        //     {
        //         "id":"KARTA-USDT",
        //         "displayName":"KARTA/USDT",
        //         "type":"spot",
        //         "base":"KARTA",
        //         "quote":"USDT",
        //         "minQty":0.01,
        //         "maxQty":10000000.0,
        //         "tickSize":0.01,
        //         "takerFee":0.0015,
        //         "makerFee":-0.0005,
        //         "feeCurrency":"acquired"
        //     },
        // }
        const markets = this.safeValue (response, 'result', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const minQuantity = this.safeInteger (market, 'minQty');
            const maxQuantity = this.safeNumber (market, 'maxQty');
            const precision = {
                'amount': this.safeInteger (market, 'minQty'),
                'price': minQuantity,
            };
            result.push ({
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'linear': undefined,
                'inverse': undefined,
                'settle': undefined,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': undefined,
                'future': false,
                'swap': false,
                'option': false,
                'optionType': undefined,
                'strike': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'contract': false,
                'contractSize': undefined,
                'active': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber (minQuantity),
                        'max': maxQuantity,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrumentId': market['id'],
        };
        const response = await this.publicGetGetOrderBook (this.extend (request, params));
        //
        // {
        //     "result":{
        //     "bids":[
        //         [
        //             0.068377,
        //             1.3247,
        //         ],
        //     ],
        //     "asks":[
        //         [
        //             0.068531,
        //             0.2693,
        //         ]
        //     ],
        //     "time":1642973720071624
        //     }
        // }
        //
        const result = this.safeValue (response, 'result', []);
        const timestamp = this.safeInteger (response, 'time');
        return this.parseOrderBook (result, symbol, timestamp);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker24hr (this.extend (request, params));
        //
        // {
        //     "result":
        //     {
        //     "lastTradeId":7219332,
        //     "price":0.068708,
        //     "qty":0.0046,
        //     "bidPrice":0.068663,
        //     "askPrice":0.068678,
        //     "bidQty":0.4254,
        //     "askQty":0.0506,
        //     "volumeUsd":315646.03,
        //     "volume":130.5272,
        //     "time":1642974178845710
        //     }
        // }
        //
        const ticker = this.safeValue (response, 'result', {});
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetTickers24hr ();
        //
        // [
        //     {
        //        "symbol":"btcinr",
        //        "baseAsset":"btc",
        //        "quoteAsset":"inr",
        //        "openPrice":"3698486",
        //        "lowPrice":"3641155.0",
        //        "highPrice":"3767999.0",
        //        "lastPrice":"3713212.0",
        //        "volume":"254.11582",
        //        "bidPrice":"3715021.0",
        //        "askPrice":"3715022.0",
        //     }
        //     ...
        // ]
        //
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const parsedTicker = this.parseTicker (ticker);
            const symbol = parsedTicker['symbol'];
            result[symbol] = parsedTicker;
        }
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrumentId': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // Default 500; max 1000.
        }
        const response = await this.publicGetGetLastTrades (this.extend (request, params));
        // {
        //     "result":{
        //     "data":[
        //         {
        //             "id":744918,
        //             "time":1594800000857010,
        //             "price":0.02594000,
        //             "qty":0.05800000,
        //             "side":"buy"
        //         }
        //     ],
        //     "next":false
        //     }
        // }
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        //         {
        //             "id":744918,
        //             "time":1594800000857010,
        //             "price":0.02594000,
        //             "qty":0.05800000,
        //             "side":"buy"
        //         }
        //
        const id = this.safeString (trade, 'id');
        const timestamp = this.parse8601 (this.safeString (trade, 'time'));
        const datetime = this.iso8601 (timestamp);
        const symbol = this.safeSymbol (undefined, market);
        const side = this.safeString (trade, 'side');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'qty');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': id,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        });
    }

    parseTicker (ticker, market = undefined) {
        //
        // {
        //     "lastTradeId":7219332,
        //     "price":0.068708,
        //     "qty":0.0046,
        //     "bidPrice":0.068663,
        //     "askPrice":0.068678,
        //     "bidQty":0.4254,
        //     "askQty":0.0506,
        //     "volumeUsd":315646.03,
        //     "volume":130.5272,
        //     "time":1642974178845710
        // }
        //
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeNumber (ticker, 'price');
        const open = this.safeNumber (ticker, 'openPrice');
        const high = this.safeNumber (ticker, 'highPrice');
        const low = this.safeNumber (ticker, 'lowPrice');
        const baseVolume = this.safeNumber (ticker, 'volume');
        const bid = this.safeNumber (ticker, 'bidPrice');
        const ask = this.safeNumber (ticker, 'askPrice');
        const timestamp = this.safeString (ticker, 'time');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrumentId': market['id'],
            'size': this.timeframes[timeframe],
        };
        const response = await this.publicGetGetCandles (this.extend (request, params));
        // {
        //     "result":{
        //     "data":[
        //         {
        //             "time":1642973286229265,
        //             "low":0.068584,
        //             "high":0.068584,
        //             "open":0.068584,
        //             "close":0.068584,
        //             "volume":0.0338
        //         },
        // }
        const resultResponse = this.safeValue (response, 'result', {});
        const data = this.safeValue (resultResponse, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        // {"code":2098,"message":"Request out of receiving window."}
        //
        if (response === undefined) {
            return;
        }
        const errorCode = this.safeString (response, 'code');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
