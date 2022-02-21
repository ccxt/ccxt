'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, OrderNotFound, InsufficientFunds, DDoSProtection, PermissionDenied, BadSymbol, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitforex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitforex',
            'name': 'Bitforex',
            'countries': [ 'CN' ],
            'rateLimit': 500, // https://github.com/ccxt/ccxt/issues/5054
            'version': 'v1',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': undefined, // has but unimplemented
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchMyTrades': undefined,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': undefined,
                'fetchTicker': true,
                'fetchTickers': undefined,
                'fetchTrades': true,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '12h': '12hour',
                '1d': '1day',
                '1w': '1week',
                '1M': '1month',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87295553-1160ec00-c50e-11ea-8ea0-df79276a9646.jpg',
                'api': 'https://api.bitforex.com',
                'www': 'https://www.bitforex.com',
                'doc': 'https://github.com/githubdev2020/API_Doc_en/wiki',
                'fees': 'https://help.bitforex.com/en_us/?cat=13',
                'referral': 'https://www.bitforex.com/en/invitationRegister?inviterId=1867438',
            },
            'api': {
                'public': {
                    'get': {
                        'api/v1/market/symbols': 20,
                        'api/v1/market/ticker': 4,
                        'api/v1/market/depth': 4,
                        'api/v1/market/trades': 20,
                        'api/v1/market/kline': 20,
                    },
                },
                'private': {
                    'post': {
                        'api/v1/fund/mainAccount': 1,
                        'api/v1/fund/allAccount': 30,
                        'api/v1/trade/placeOrder': 1,
                        'api/v1/trade/placeMultiOrder': 10,
                        'api/v1/trade/cancelOrder': 1,
                        'api/v1/trade/cancelMultiOrder': 20,
                        'api/v1/trade/cancelAllOrder': 20,
                        'api/v1/trade/orderInfo': 1,
                        'api/v1/trade/multiOrderInfo': 10,
                        'api/v1/trade/orderInfos': 20,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
                'funding': {
                    'tierBased': false,
                    'percentage': true,
                    'deposit': {},
                    'withdraw': {},
                },
            },
            'commonCurrencies': {
                'BKC': 'Bank Coin',
                'CAPP': 'Crypto Application Token',
                'CREDIT': 'TerraCredit',
                'CTC': 'Culture Ticket Chain',
                'EWT': 'EcoWatt Token',
                'IQ': 'IQ.Cash',
                'MIR': 'MIR COIN',
                'NOIA': 'METANOIA',
                'TON': 'To The Moon',
            },
            'exceptions': {
                '1000': OrderNotFound, // {"code":"1000","success":false,"time":1643047898676,"message":"The order does not exist or the status is wrong"}
                '1003': BadSymbol, // {"success":false,"code":"1003","message":"Param Invalid:param invalid -symbol:symbol error"}
                '1013': AuthenticationError,
                '1016': AuthenticationError,
                '1017': PermissionDenied, // {"code":"1017","success":false,"time":1602670594367,"message":"IP not allow"}
                '1019': BadSymbol, // {"code":"1019","success":false,"time":1607087743778,"message":"Symbol Invalid"}
                '3002': InsufficientFunds,
                '4002': InvalidOrder, // {"success":false,"code":"4002","message":"Price unreasonable"}
                '4003': InvalidOrder, // {"success":false,"code":"4003","message":"amount too small"}
                '4004': OrderNotFound,
                '10204': DDoSProtection,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetApiV1MarketSymbols (params);
        //
        //    {
        //        "data": [
        //            {
        //                "amountPrecision":4,
        //                "minOrderAmount":3.0E-4,
        //                "pricePrecision":2,
        //                "symbol":"coin-usdt-btc"
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = response['data'];
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const symbolParts = id.split ('-');
            const baseId = symbolParts[2];
            const quoteId = symbolParts[1];
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDateTime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger (market, 'amountPrecision'),
                    'price': this.safeInteger (market, 'pricePrecision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minOrderAmount'),
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

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public) v1
        //
        //      {
        //          "price":57594.53,
        //          "amount":0.3172,
        //          "time":1637329685322,
        //          "direction":1,
        //          "tid":"1131019666"
        //      }
        //
        //      {
        //          "price":57591.33,
        //          "amount":0.002,
        //          "time":1637329685322,
        //          "direction":1,
        //          "tid":"1131019639"
        //      }
        //
        market = this.safeMarket (undefined, market);
        const timestamp = this.safeInteger (trade, 'time');
        const id = this.safeString (trade, 'tid');
        const orderId = undefined;
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const sideId = this.safeInteger (trade, 'direction');
        const side = this.parseSide (sideId);
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'order': orderId,
            'fee': undefined,
            'takerOrMaker': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const market = this.market (symbol);
        const response = await this.publicGetApiV1MarketTrades (this.extend (request, params));
        //
        // {
        //  "data":
        //      [
        //          {
        //              "price":57594.53,
        //              "amount":0.3172,
        //              "time":1637329685322,
        //              "direction":1,
        //              "tid":"1131019666"
        //          }
        //      ],
        //  "success": true,
        //  "time": 1637329688475
        // }
        //
        return this.parseTrades (response['data'], market, since, limit);
    }

    parseBalance (response) {
        const data = response['data'];
        const result = { 'info': response };
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeString (balance, 'frozen');
            account['free'] = this.safeString (balance, 'active');
            account['total'] = this.safeString (balance, 'fix');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostApiV1FundAllAccount (params);
        return this.parseBalance (response);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "buy":7.04E-7,
        //         "date":1643371198598,
        //         "high":7.48E-7,
        //         "last":7.28E-7,
        //         "low":7.10E-7,
        //         "sell":7.54E-7,
        //         "vol":9877287.2874
        //     }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.safeInteger (ticker, 'date');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'last'),
            'last': this.safeString (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.markets[symbol];
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetApiV1MarketTicker (this.extend (request, params));
        const ticker = this.safeValue (response, 'data');
        //
        //     {
        //         "data":{
        //             "buy":37082.83,
        //             "date":1643388686660,
        //             "high":37487.83,
        //             "last":37086.79,
        //             "low":35544.44,
        //             "sell":37090.52,
        //             "vol":690.9776
        //         },
        //         "success":true,
        //         "time":1643388686660
        //     }
        //
        return this.parseTicker (ticker, market);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "close":0.02505143,
        //         "currencyVol":0,
        //         "high":0.02506422,
        //         "low":0.02505143,
        //         "open":0.02506095,
        //         "time":1591508940000,
        //         "vol":51.1869
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'vol'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'ktype': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['size'] = limit; // default 1, max 600
        }
        const response = await this.publicGetApiV1MarketKline (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {"close":0.02505143,"currencyVol":0,"high":0.02506422,"low":0.02505143,"open":0.02506095,"time":1591508940000,"vol":51.1869},
        //             {"close":0.02503914,"currencyVol":0,"high":0.02506687,"low":0.02503914,"open":0.02505358,"time":1591509000000,"vol":9.1082},
        //             {"close":0.02505172,"currencyVol":0,"high":0.02507466,"low":0.02503895,"open":0.02506371,"time":1591509060000,"vol":63.7431},
        //         ],
        //         "success":true,
        //         "time":1591509427131
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = {
            'symbol': marketId,
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetApiV1MarketDepth (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeInteger (response, 'time');
        return this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'canceled',
            '4': 'canceled',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseSide (sideId) {
        if (sideId === 1) {
            return 'buy';
        } else if (sideId === 2) {
            return 'sell';
        } else {
            return undefined;
        }
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'orderId');
        const timestamp = this.safeNumber (order, 'createTime');
        const lastTradeTimestamp = this.safeNumber (order, 'lastTime');
        const symbol = market['symbol'];
        const sideId = this.safeInteger (order, 'tradeType');
        const side = this.parseSide (sideId);
        const type = undefined;
        const price = this.safeString (order, 'orderPrice');
        const average = this.safeString (order, 'avgPrice');
        const amount = this.safeString (order, 'orderAmount');
        const filled = this.safeString (order, 'dealAmount');
        const status = this.parseOrderStatus (this.safeString (order, 'orderState'));
        const feeSide = (side === 'buy') ? 'base' : 'quote';
        const feeCurrency = market[feeSide];
        const fee = {
            'cost': this.safeNumber (order, 'tradeFee'),
            'currency': feeCurrency,
        };
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': undefined,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.marketId (symbol),
            'orderId': id,
        };
        const response = await this.privatePostApiV1TradeOrderInfo (this.extend (request, params));
        const order = this.parseOrder (response['data'], market);
        return order;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.marketId (symbol),
            'state': 0,
        };
        const response = await this.privatePostApiV1TradeOrderInfos (this.extend (request, params));
        return this.parseOrders (response['data'], market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.marketId (symbol),
            'state': 1,
        };
        const response = await this.privatePostApiV1TradeOrderInfos (this.extend (request, params));
        return this.parseOrders (response['data'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let sideId = undefined;
        if (side === 'buy') {
            sideId = 1;
        } else if (side === 'sell') {
            sideId = 2;
        }
        const request = {
            'symbol': this.marketId (symbol),
            'price': price,
            'amount': amount,
            'tradeType': sideId,
        };
        const response = await this.privatePostApiV1TradePlaceOrder (this.extend (request, params));
        const data = response['data'];
        return {
            'info': response,
            'id': this.safeString (data, 'orderId'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        if (symbol !== undefined) {
            request['symbol'] = this.marketId (symbol);
        }
        const results = await this.privatePostApiV1TradeCancelOrder (this.extend (request, params));
        const success = results['success'];
        const returnVal = { 'info': results, 'success': success };
        return returnVal;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let payload = this.urlencode ({ 'accessKey': this.apiKey });
            query['nonce'] = this.milliseconds ();
            if (Object.keys (query).length) {
                payload += '&' + this.urlencode (this.keysort (query));
            }
            // let message = '/' + 'api/' + this.version + '/' + path + '?' + payload;
            const message = '/' + path + '?' + payload;
            const signature = this.hmac (this.encode (message), this.encode (this.secret));
            body = payload + '&signData=' + signature;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (typeof body !== 'string') {
            return; // fallback to default error handler
        }
        if ((body[0] === '{') || (body[0] === '[')) {
            const feedback = this.id + ' ' + body;
            const success = this.safeValue (response, 'success');
            if (success !== undefined) {
                if (!success) {
                    const code = this.safeString (response, 'code');
                    this.throwExactlyMatchedException (this.exceptions, code, feedback);
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
