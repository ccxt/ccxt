'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AccountSuspended, BadRequest, BadResponse, NetworkError, DDoSProtection, AuthenticationError, PermissionDenied, ArgumentsRequired, ExchangeError, InsufficientFunds, InvalidOrder, InvalidNonce, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class digifinex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'digifinex',
            'name': 'DigiFinex',
            'countries': [ 'SG' ],
            'version': 'v3',
            'rateLimit': 900, // 300 for posts
            'has': {
                'cancelOrders': true,
                'fetchOrders': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchTickers': true,
                'fetchMyTrades': true,
                'fetchLedger': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '12h': '720',
                '1d': '1D',
                '1w': '1W',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/62184319-304e8880-b366-11e9-99fe-8011d6929195.jpg',
                'api': 'https://openapi.digifinex.vip',
                'www': 'https://www.digifinex.vip',
                'doc': [
                    'https://docs.digifinex.vip',
                ],
                'fees': 'https://digifinex.zendesk.com/hc/en-us/articles/360000328482-Fee-Structure-on-DigiFinex',
                'referral': 'https://www.digifinex.vip/en-ww/from/DhOzBg/3798****5114',
            },
            'api': {
                'v2': {
                    'get': [
                        'ticker',
                    ],
                },
                'public': {
                    'get': [
                        '{market}/symbols',
                        'kline',
                        'margin/currencies',
                        'margin/symbols',
                        'markets', // undocumented
                        'order_book',
                        'ping',
                        'spot/symbols',
                        'time',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        '{market}/financelog',
                        '{market}/mytrades',
                        '{market}/order',
                        '{market}/order/current',
                        '{market}/order/history',
                        'margin/assets',
                        'margin/financelog',
                        'margin/mytrades',
                        'margin/order',
                        'margin/order/current',
                        'margin/order/history',
                        'margin/positions',
                        'otc/financelog',
                        'spot/assets',
                        'spot/financelog',
                        'spot/mytrades',
                        'spot/order',
                        'spot/order/current',
                        'spot/order/history',
                    ],
                    'post': [
                        '{market}/order/cancel',
                        '{market}/order/new',
                        'margin/order/cancel',
                        'margin/order/new',
                        'margin/position/close',
                        'spot/order/cancel',
                        'spot/order/new',
                        'transfer',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    '10001': [ BadRequest, "Wrong request method, please check it's a GET ot POST request" ],
                    '10002': [ AuthenticationError, 'Invalid ApiKey' ],
                    '10003': [ AuthenticationError, "Sign doesn't match" ],
                    '10004': [ BadRequest, 'Illegal request parameters' ],
                    '10005': [ DDoSProtection, 'Request frequency exceeds the limit' ],
                    '10006': [ PermissionDenied, 'Unauthorized to execute this request' ],
                    '10007': [ PermissionDenied, 'IP address Unauthorized' ],
                    '10008': [ InvalidNonce, 'Timestamp for this request is invalid, timestamp must within 1 minute' ],
                    '10009': [ NetworkError, 'Unexist endpoint, please check endpoint URL' ],
                    '10011': [ AccountSuspended, 'ApiKey expired. Please go to client side to re-create an ApiKey' ],
                    '20001': [ PermissionDenied, 'Trade is not open for this trading pair' ],
                    '20002': [ PermissionDenied, 'Trade of this trading pair is suspended' ],
                    '20003': [ InvalidOrder, 'Invalid price or amount' ],
                    '20007': [ InvalidOrder, 'Price precision error' ],
                    '20008': [ InvalidOrder, 'Amount precision error' ],
                    '20009': [ InvalidOrder, 'Amount is less than the minimum requirement' ],
                    '20010': [ InvalidOrder, 'Cash Amount is less than the minimum requirement' ],
                    '20011': [ InsufficientFunds, 'Insufficient balance' ],
                    '20012': [ BadRequest, 'Invalid trade type, valid value: buy/sell)' ],
                    '20013': [ InvalidOrder, 'No order info found' ],
                    '20014': [ BadRequest, 'Invalid date, Valid format: 2018-07-25)' ],
                    '20015': [ BadRequest, 'Date exceeds the limit' ],
                    '20018': [ PermissionDenied, 'Your trading rights have been banned by the system' ],
                    '20019': [ BadRequest, 'Wrong trading pair symbol. Correct format:"usdt_btc". Quote asset is in the front' ],
                    '20020': [ DDoSProtection, "You have violated the API operation trading rules and temporarily forbid trading. At present, we have certain restrictions on the user's transaction rate and withdrawal rate." ],
                    '50000': [ ExchangeError, 'Exception error' ],
                },
                'broad': {
                },
            },
            'options': {
                'defaultType': 'spot',
                'types': [ 'spot', 'margin', 'otc' ],
            },
        });
    }

    async fetchMarketsByType (type, params = {}) {
        const method = 'publicGet' + this.capitalize (type) + 'Symbols';
        const response = await this[method] (params);
        //
        //     {
        //         "symbol_list": [
        //             {
        //                 "order_types":["LIMIT","MARKET"],
        //                 "quote_asset":"USDT",
        //                 "minimum_value":2,
        //                 "amount_precision":4,
        //                 "status":"TRADING",
        //                 "minimum_amount":0.001,
        //                 "symbol":"LTC_USDT",
        //                 "margin_rate":0.3,
        //                 "zone":"MAIN",
        //                 "base_asset":"LTC",
        //                 "price_precision":2
        //             },
        //         ],
        //         "code":0
        //     }
        //
        const markets = this.safeValue (response, 'symbols_list', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base_asset');
            const quoteId = this.safeString (market, 'quote_asset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amount_precision'),
                'price': this.safeInteger (market, 'price_precision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minimum_amount'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeFloat (market, 'minimum_value'),
                    'max': undefined,
                },
            };
            //
            // The status is documented in the exchange API docs as follows:
            // TRADING, HALT (delisted), BREAK (trading paused)
            // https://docs.digifinex.vip/en-ww/v3/#/public/spot/symbols
            // However, all spot markets actually have status === 'HALT'
            // despite that they appear to be active on the exchange website.
            // Apparently, we can't trust this status.
            // const status = this.safeString (market, 'status');
            // const active = (status === 'TRADING');
            //
            const active = undefined;
            const spot = (type === 'spot');
            const margin = (type === 'margin');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'type': type,
                'spot': spot,
                'margin': margin,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         "data": [
        //             {
        //                 "volume_precision":4,
        //                 "price_precision":2,
        //                 "market":"btc_usdt",
        //                 "min_amount":2,
        //                 "min_volume":0.0001
        //             },
        //         ],
        //         "date":1564507456,
        //         "code":0
        //     }
        //
        const markets = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'market');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'volume_precision'),
                'price': this.safeInteger (market, 'price_precision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'min_volume'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeFloat (market, 'min_amount'),
                    'max': undefined,
                },
            };
            const active = undefined;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const method = 'privateGet' + this.capitalize (type) + 'Assets';
        const response = await this[method] (params);
        //
        //     {
        //         "code": 0,
        //         "list": [
        //             {
        //                 "currency": "BTC",
        //                 "free": 4723846.89208129,
        //                 "total": 0
        //             }
        //         ]
        //     }
        const balances = this.safeValue (response, 'list', []);
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeFloat (balance, 'frozen');
            account['free'] = this.safeFloat (balance, 'free');
            account['total'] = this.safeFloat (balance, 'total');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 150
        }
        const response = await this.publicGetOrderBook (this.extend (request, params));
        //
        //     {
        //         "bids": [
        //             [9605.77,0.0016],
        //             [9605.46,0.0003],
        //             [9602.04,0.0127],
        //         ],
        //         "asks": [
        //             [9627.22,0.025803],
        //             [9627.12,0.168543],
        //             [9626.52,0.0011529],
        //         ],
        //         "date":1564509499,
        //         "code":0
        //     }
        //
        const timestamp = this.safeTimestamp (response, 'date');
        return this.parseOrderBook (response, timestamp);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const apiKey = this.safeValue (params, 'apiKey', this.apiKey);
        if (!apiKey) {
            throw new ArgumentsRequired (this.id + ' fetchTicker is a private v2 endpoint that requires an `exchange.apiKey` credential or an `apiKey` extra parameter');
        }
        await this.loadMarkets ();
        const request = {
            'apiKey': apiKey,
        };
        const response = await this.v2GetTicker (this.extend (request, params));
        //
        //     {
        //         "ticker":{
        //             "btc_eth":{
        //                 "last":0.021957,
        //                 "base_vol":2249.3521732227,
        //                 "change":-0.6,
        //                 "vol":102443.5111,
        //                 "sell":0.021978,
        //                 "low":0.021791,
        //                 "buy":0.021946,
        //                 "high":0.022266
        //             }
        //         },
        //         "date":1564518452,
        //         "code":0
        //     }
        //
        const result = {};
        const tickers = this.safeValue (response, 'ticker', {});
        const date = this.safeInteger (response, 'date');
        const reversedMarketIds = Object.keys (tickers);
        for (let i = 0; i < reversedMarketIds.length; i++) {
            const reversedMarketId = reversedMarketIds[i];
            const ticker = this.extend ({
                'date': date,
            }, tickers[reversedMarketId]);
            const [ quoteId, baseId ] = reversedMarketId.split ('_');
            const marketId = baseId + '_' + quoteId;
            let market = undefined;
            let symbol = undefined;
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        const apiKey = this.safeValue (params, 'apiKey', this.apiKey);
        if (!apiKey) {
            throw new ArgumentsRequired (this.id + ' fetchTicker is a private v2 endpoint that requires an `exchange.apiKey` credential or an `apiKey` extra parameter');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // reversed base/quote in v2
        const marketId = market['quoteId'] + '_' + market['baseId'];
        const request = {
            'symbol': marketId,
            'apiKey': apiKey,
        };
        const response = await this.v2GetTicker (this.extend (request, params));
        //
        //     {
        //         "ticker":{
        //             "btc_eth":{
        //                 "last":0.021957,
        //                 "base_vol":2249.3521732227,
        //                 "change":-0.6,
        //                 "vol":102443.5111,
        //                 "sell":0.021978,
        //                 "low":0.021791,
        //                 "buy":0.021946,
        //                 "high":0.022266
        //             }
        //         },
        //         "date":1564518452,
        //         "code":0
        //     }
        //
        const date = this.safeInteger (response, 'date');
        const ticker = this.safeValue (response, 'ticker', {});
        let result = this.safeValue (ticker, marketId, {});
        result = this.extend ({ 'date': date }, result);
        return this.parseTicker (result, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "last":0.021957,
        //         "base_vol":2249.3521732227,
        //         "change":-0.6,
        //         "vol":102443.5111,
        //         "sell":0.021978,
        //         "low":0.021791,
        //         "buy":0.021946,
        //         "high":0.022266,
        //         "date"1564518452, // injected from fetchTicker/fetchTickers
        //     }
        //
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeTimestamp (ticker, 'date');
        const last = this.safeFloat (ticker, 'last');
        const percentage = this.safeFloat (ticker, 'change');
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
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'base_vol'),
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "date":1564520003,
        //         "id":1596149203,
        //         "amount":0.7073,
        //         "type":"buy",
        //         "price":0.02193,
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "symbol": "BTC_USDT",
        //         "order_id": "6707cbdcda0edfaa7f4ab509e4cbf966",
        //         "id": 28457,
        //         "price": 0.1,
        //         "amount": 0,
        //         "fee": 0.096,
        //         "fee_currency": "USDT",
        //         "timestamp": 1499865549,
        //         "side": "buy",
        //         "is_maker": true
        //     }
        //
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'order_id');
        const timestamp = this.safeTimestamp2 (trade, 'date', 'timestamp');
        const side = this.safeString2 (trade, 'type', 'side');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let symbol = undefined;
        const marketId = this.safeString (trade, 'symbol');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[market];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        const takerOrMaker = this.safeValue (trade, 'is_maker');
        const feeCost = this.safeFloat (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'order': orderId,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 500
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "date":1564520003,
        //                 "id":1596149203,
        //                 "amount":0.7073,
        //                 "type":"buy",
        //                 "price":0.02193,
        //             },
        //             {
        //                 "date":1564520002,
        //                 "id":1596149165,
        //                 "amount":0.3232,
        //                 "type":"sell",
        //                 "price":0.021927,
        //             },
        //         ],
        //         "code": 0,
        //         "date": 1564520003,
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000, // timestamp
            ohlcv[5], // open
            ohlcv[3], // high
            ohlcv[4], // low
            ohlcv[2], // close
            ohlcv[1], // volume
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
            // 'start_time': 1564520003, // starting timestamp, 200 candles before end_time by default
            // 'end_time': 1564520003, // ending timestamp, current timestamp by default
        };
        if (since !== undefined) {
            const startTime = parseInt (since / 1000);
            request['start_time'] = startTime;
            if (limit !== undefined) {
                const duration = this.parseTimeframe (timeframe);
                request['end_time'] = this.sum (startTime, limit * duration);
            }
        } else if (limit !== undefined) {
            const endTime = this.seconds ();
            const duration = this.parseTimeframe (timeframe);
            request['startTime'] = this.sum (endTime, -limit * duration);
        }
        const response = await this.publicGetKline (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":[
        //             [1556712900,2205.899,0.029967,0.02997,0.029871,0.029927],
        //             [1556713800,1912.9174,0.029992,0.030014,0.029955,0.02996],
        //             [1556714700,1556.4795,0.029974,0.030019,0.029969,0.02999],
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const request = {
            'market': orderType,
            'symbol': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            // 'post_only': 0, // 0 by default, if set to 1 the order will be canceled if it can be executed immediately, making sure there will be no market taking
        };
        let suffix = '';
        if (type === 'market') {
            suffix = '_market';
        } else {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        request['type'] = side + suffix;
        const response = await this.privatePostMarketOrderNew (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "order_id": "198361cecdc65f9c8c9bb2fa68faec40"
        //     }
        //
        const result = this.parseOrder (response, market);
        return this.extend (result, {
            'symbol': symbol,
            'side': side,
            'type': type,
            'amount': amount,
            'price': price,
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const request = {
            'market': orderType,
            'order_id': id,
        };
        const response = await this.privatePostMarketOrderCancel (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "success": [
        //             "198361cecdc65f9c8c9bb2fa68faec40",
        //             "3fb0d98e51c18954f10d439a9cf57de0"
        //         ],
        //         "error": [
        //             "78a7104e3c65cc0c5a212a53e76d0205"
        //         ]
        //     }
        //
        const canceledOrders = this.safeValue (response, 'success', []);
        const numCanceledOrders = canceledOrders.length;
        if (numCanceledOrders !== 1) {
            throw new OrderNotFound (this.id + ' cancelOrder ' + id + ' not found');
        }
        return response;
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const request = {
            'market': orderType,
            'order_id': ids.join (','),
        };
        const response = await this.privatePostCancelOrder (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "success": [
        //             "198361cecdc65f9c8c9bb2fa68faec40",
        //             "3fb0d98e51c18954f10d439a9cf57de0"
        //         ],
        //         "error": [
        //             "78a7104e3c65cc0c5a212a53e76d0205"
        //         ]
        //     }
        //
        const canceledOrders = this.safeValue (response, 'success', []);
        const numCanceledOrders = canceledOrders.length;
        if (numCanceledOrders < 1) {
            throw new OrderNotFound (this.id + ' cancelOrders error');
        }
        return response;
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'open', // partially filled
            '2': 'closed',
            '3': 'canceled',
            '4': 'canceled', // partially filled and canceled
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "code": 0,
        //         "order_id": "198361cecdc65f9c8c9bb2fa68faec40"
        //     }
        //
        // fetchOrder, fetchOpenOrders, fetchOrders
        //
        //     {
        //         "symbol": "BTC_USDT",
        //         "order_id": "dd3164b333a4afa9d5730bb87f6db8b3",
        //         "created_date": 1562303547,
        //         "finished_date": 0,
        //         "price": 0.1,
        //         "amount": 1,
        //         "cash_amount": 1,
        //         "executed_amount": 0,
        //         "avg_price": 0,
        //         "status": 1,
        //         "type": "buy",
        //         "kind": "margin"
        //     }
        //
        const id = this.safeString (order, 'order_id');
        const timestamp = this.safeTimestamp (order, 'created_date');
        const lastTradeTimestamp = this.safeTimestamp (order, 'finished_date');
        let side = this.safeString (order, 'type');
        let type = undefined;
        if (side !== undefined) {
            const parts = side.split ('_');
            const numParts = parts.length;
            if (numParts > 1) {
                side = parts[0];
                type = parts[1];
            } else {
                type = 'limit';
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        if (market === undefined) {
            const exchange = order['symbol'].toUpperCase ();
            if (exchange in this.markets_by_id) {
                market = this.markets_by_id[exchange];
            }
        }
        let symbol = undefined;
        const marketId = this.safeString (order, 'symbol');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'executed_amount');
        const price = this.safeFloat (order, 'price');
        const average = this.safeFloat (order, 'avg_price');
        let remaining = undefined;
        let cost = undefined;
        if (filled !== undefined) {
            if (average !== undefined) {
                cost = filled * average;
            }
            if (amount !== undefined) {
                remaining = Math.max (0, amount - filled);
            }
        }
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'average': average,
            'status': status,
            'fee': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'market': orderType,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetMarketOrderCurrent (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "order_id": "dd3164b333a4afa9d5730bb87f6db8b3",
        //                 "created_date": 1562303547,
        //                 "finished_date": 0,
        //                 "price": 0.1,
        //                 "amount": 1,
        //                 "cash_amount": 1,
        //                 "executed_amount": 0,
        //                 "avg_price": 0,
        //                 "status": 1,
        //                 "type": "buy",
        //                 "kind": "margin"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'market': orderType,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000); // default 3 days from now, max 30 days
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 100
        }
        const response = await this.privateGetMarketOrderHistory (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "order_id": "dd3164b333a4afa9d5730bb87f6db8b3",
        //                 "created_date": 1562303547,
        //                 "finished_date": 0,
        //                 "price": 0.1,
        //                 "amount": 1,
        //                 "cash_amount": 1,
        //                 "executed_amount": 0,
        //                 "avg_price": 0,
        //                 "status": 1,
        //                 "type": "buy",
        //                 "kind": "margin"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'market': orderType,
            'order_id': id,
        };
        const response = await this.privateGetMarketOrder (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "order_id": "dd3164b333a4afa9d5730bb87f6db8b3",
        //                 "created_date": 1562303547,
        //                 "finished_date": 0,
        //                 "price": 0.1,
        //                 "amount": 1,
        //                 "cash_amount": 1,
        //                 "executed_amount": 0,
        //                 "avg_price": 0,
        //                 "status": 1,
        //                 "type": "buy",
        //                 "kind": "margin"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'market': orderType,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000); // default 3 days from now, max 30 days
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 100
        }
        const response = await this.privateGetMarketMytrades (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "list": [
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "order_id": "6707cbdcda0edfaa7f4ab509e4cbf966",
        //                 "id": 28457,
        //                 "price": 0.1,
        //                 "amount": 0,
        //                 "fee": 0.096,
        //                 "fee_currency": "USDT",
        //                 "timestamp": 1499865549,
        //                 "side": "buy",
        //                 "is_maker": true
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'list', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseLedgerEntryType (type) {
        const types = {};
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         "currency_mark": "BTC",
        //         "type": 100234,
        //         "num": 28457,
        //         "balance": 0.1,
        //         "time": 1546272000
        //     }
        //
        const id = this.safeString (item, 'num');
        const account = undefined;
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const code = this.safeCurrencyCode (this.safeString (item, 'currency_mark'), currency);
        const timestamp = this.safeTimestamp (item, 'time');
        const before = undefined;
        const after = this.safeFloat (item, 'balance');
        const status = 'ok';
        return {
            'info': item,
            'id': id,
            'direction': undefined,
            'account': account,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': undefined,
            'before': before,
            'after': after,
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        const request = {
            'market': orderType,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency_mark'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        const response = await this.privateGetMarketFinancelog (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "total": 521,
        //             "finance": [
        //                 {
        //                     "currency_mark": "BTC",
        //                     "type": 100234,
        //                     "num": 28457,
        //                     "balance": 0.1,
        //                     "time": 1546272000
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const items = this.safeValue (data, 'finance', []);
        return this.parseLedger (items, currency, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = (api === 'v2') ? api : this.version;
        let url = this.urls['api'] + '/' + version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const urlencoded = this.urlencode (this.keysort (query));
        if (api === 'private') {
            const nonce = this.nonce ().toString ();
            const auth = urlencoded;
            // the signature is not time-limited :\
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            if (method === 'GET') {
                if (urlencoded) {
                    url += '?' + urlencoded;
                }
            } else if (method === 'POST') {
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
                if (urlencoded) {
                    body = urlencoded;
                }
            }
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': nonce,
            };
        } else {
            if (urlencoded) {
                url += '?' + urlencoded;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    dateUTC8 (timestampMS) {
        const timedelta = this.safeValue (this.options, 'timedelta', 8 * 60 * 60 * 1000); // eight hours
        return this.ymd (timestampMS + timedelta);
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fall back to default error handler
        }
        const code = this.safeString (response, 'code');
        if (code === '0') {
            return; // no error
        }
        const feedback = this.id + ' ' + responseBody;
        if (code === undefined) {
            throw new BadResponse (feedback);
        }
        const unknownError = [ ExchangeError, feedback ];
        const [ ExceptionClass, message ] = this.safeValue (this.exceptions['exact'], code, unknownError);
        throw new ExceptionClass (message);
    }
};
