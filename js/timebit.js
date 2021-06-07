'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, PermissionDenied, InsufficientFunds, InvalidOrder, ExchangeError, OrderNotFound, ExchangeNotAvailable, BadRequest, NotSupported } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class timebit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'timebit',
            'name': 'Timebit',
            'countries': [ 'SG'], // Singapore
            'version': 'v1',
            'certified': false,
            'has': {
                'cancelOrder': true,
                'createOrder': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchCurrencies': true,
                'fetchBalance': true,
                'fetchDepositAddress': true,
                'fetchOHLCV': true,
            },
            'timeframes': {
                '1m': 'M1',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '5d': 'D5',
                '1w': 'W1',
                '1M': 'M1',
            },
            'urls': {
                'logo': 'https://ex.timebit.sg/assets/images/logo.svg',
                'api': {
                    'private': 'https://public-api.timebit.sg/api/v1',
                    'public': 'https://public-api.timebit.sg/api/v1/public',
                    'spot': 'https://public-api.timebit.sg/api/v1/spot',
                },
                'www': 'https://ex.timebit.sg/',
                'doc': 'https://public-api.timebit.sg/swagger-ui.html',
                'fees': 'https://timebitex.com/fees/',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'orderbook/{pair}',
                        'ticker/{pair}',
                        'currencies',
                    ],
                },
                'private': {
                    'get': [
                        'account/balance',
                        'account/address/{currency}',
                        'order/{orderId}/detail',
                        'order/history',
                        'order/open{character}orders',
                    ],
                    'post': [
                        'order/{orderId}/cancel',
                        'order/add',
                    ],
                },
                'spot': {
                    'get': [
                        'trades/{pair}',
                        'candle/{pair}/{timeFrame}',
                    ],
                },
            },
            'exceptions': {
                'MSG_ORDER_NOT_FOUND': OrderNotFound,
                'Access Denied': PermissionDenied,
                'MSG_DATA_INVALID': InvalidOrder,
                'MSG_ORDER_BALANCE_NOT_ENOUGH': InsufficientFunds,
                'Unknown order': OrderNotFound,
                'Server error': ExchangeNotAvailable,
                'Bad request': BadRequest,
            },
            'sides': {
                'buy': 'buy',
                'sell': 'sell',
            },
            'types': {
                'limit': 'limit',
                'market': 'market',
            },
            'fees': {
                'trading': {
                    'taker': 0.001, // 0.1% trading fee
                    'maker': 0.001, // 0.1% trading fee
                },
            },
        });
    }

    sign (path, api = 'open', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (params.character !== undefined) {
            const ignoreParam = {
                'character': params.character,
            };
            delete params.character;
            path = this.implodeParams (path, ignoreParam);
        }
        if (!(api in this.urls['api'])) {
            throw new NotSupported (this.id + ' does not have a testnet/sandbox URL for ' + api + ' endpoints');
        }
        let url = this.urls['api'][api];
        url += '/' + this.implodeParams (path, params);
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let query = undefined;
            const uri = '/api/v1/' + this.implodeParams (path, params);
            const timestamp = this.seconds ();
            delete params.orderId;
            delete params.currency;
            query = this.urlencodeWithArrayRepeat (params);
            const data = timestamp.concat (method).concat (uri);
            const signature = this.hmac (data, this.secret);
            headers = {
                'CEN-ACCESS-KEY': this.apiKey,
                'CEN-ACCESS-TIMESTAMP': timestamp, // execution start time call api (unix time)
                'CEN-ACCESS-SIGN': signature,
            };
            if (method === 'GET') {
                if (query !== '' && query !== undefined) {
                    url += '?' + query;
                }
            } else if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = this.json (params);
            }
        } else {
            if (method === 'GET') {
                delete params.pair;
                delete params.timeFrame;
                delete params.orderId;
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    convertSymbol (market) {
        const id = this.safeString (market, 'marketName');
        const baseId = this.safeString (market, 'baseCurrency');
        const quoteId = this.safeString (market, 'marketCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const maker = parseFloat (0.1) / 100;
        const taker = parseFloat (0.1) / 100;
        const minAmount = 0.001;
        const precision = { 'base': 8, 'quote': 8, 'amount': 4, 'price': 2 };
        const entry = {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'maker': maker,
            'taker': taker,
            'active': true,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': minAmount,
                    'max': Math.pow (10, precision['amount']),
                },
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': undefined,
                },
                'cost': {
                    'min': 0,
                    'max': undefined,
                },
            },
        };
        return entry;
    }

    async fetchMarkets (params = {}) {
        const method = 'publicGetMarkets';
        const response = await this[method] (params);
        // {
        //     "result":true,
        //     "code":1000,
        //     "message":"Success",
        //     "data":[
        //     {
        //     "marketName":"btcusdt",
        //     "marketCurrency":"usdt",
        //     "marketCurrencyName":"usdt",
        //     "baseCurrency":"btc",
        //     "baseCurrencyName":"btc",
        //     "minTradingSize":0.001,
        //     "isActive":true
        //     }
        //     ]
        //     }
        //     {
        //     "result":true,
        //     "code":1000,
        //     "message":"Success",
        //     "data":[
        //     {
        //     "marketName":"btcusdt",
        //     "marketCurrency":"usdt",
        //     "marketCurrencyName":"usdt",
        //     "baseCurrency":"btc",
        //     "baseCurrencyName":"btc",
        //     "minTradingSize":0.001,
        //     "isActive":true
        //     }
        //     ]
        //     }
        const markets = this.safeValue (response, 'data');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const entry = this.convertSymbol (market);
            result.push (entry);
        }
        return result;
    }

    preOptiomizeOrderBookData (orderBook) {
        const tranferOrderBook = {};
        const sellList = orderBook['sell'];
        const _tranferList = [];
        const _sellTranferList = [];
        for (let i = 0; i < sellList.length; i++) {
            const _sellOrder = sellList[i];
            const _sellTranferObj = [];
            _sellTranferObj.push (_sellOrder['price']);
            _sellTranferObj.push (_sellOrder['amount']);
            _sellTranferList.push (_sellTranferObj);
        }
        const buyList = orderBook['buy'];
        for (let i = 0; i < buyList.length; i++) {
            const _order = buyList[i];
            const _tranferObj = [];
            _tranferObj.push (_order['price']);
            _tranferObj.push (_order['amount']);
            _tranferList.push (_tranferObj);
        }
        tranferOrderBook['asks'] = _sellTranferList;
        tranferOrderBook['bids'] = _tranferList;
        return tranferOrderBook;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        const method = 'publicGetOrderbookPair';
        await this.loadMarkets ();
        const request = {
            'pair': this.markets[symbol]['id'],
        };
        limit = 'all';
        if (limit !== undefined) {
            request['type'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        // {
        //     "result":true,
        //     "code":1000,
        //     "message":"Success",
        //     "data":{
        //     "buy":[
        //     {
        //     "id":0,
        //     "accountId":0,
        //     "status":null,
        //     "type":null,
        //     "price":2242.06,
        //     "amount":0.013251,
        //     "filledAmount":null,
        //     "fee":null,
        //     "total":null,
        //     "createdAt":0,
        //     "finishedAt":0,
        //     "canceledAt":0,
        //     "symbol":null
        //     }
        //     ],
        //     "sell":[
        //     {
        //     "id":0,
        //     "accountId":0,
        //     "status":null,
        //     "type":null,
        //     "price":2258.9,
        //     "amount":0.019698,
        //     "filledAmount":null,
        //     "fee":null,
        //     "total":null,
        //     "createdAt":0,
        //     "finishedAt":0,
        //     "canceledAt":0,
        //     "symbol":null
        //     }
        //     ]
        //     },
        //     "pagination":null
        //     }
        const data = this.safeValue (response, 'data');
        return this.parseOrderBook (this.preOptiomizeOrderBookData (data), symbol);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const method = 'publicGetTickerPair';
        const response = await this[method] (this.extend (request, params));
        const data = response['data'];
        if (Array.isArray (data)) {
            const firstTicker = this.safeValue (data, 0, {});
            firstTicker['symbol'] = symbol;
            return this.parseTicker (firstTicker, market);
        }
        data['symbol'] = symbol;
        return this.parseTicker (data, market);
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     "open":2648.41,
        //     "high":2749.43,
        //     "low":2521.91,
        //     "close":2662.26,
        //     "volume24h":1794.62953
        // }
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'open'),
            'close': this.safeNumber (ticker, 'close'),
            'last': this.safeNumber (ticker, 'close'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    convertTrade (symbol, trade) {
        const id = this.safeString (trade, 'trade_id');
        const timestamp = this.safeTimestamp (trade, 'timestamp') / 1000;
        const datetime = this.iso8601 (timestamp);
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'base_volume');
        const type = this.safeString (trade, 'type').indexOf ('limit') !== -1 ? 'limit' : 'market';
        const side = this.safeString (trade, 'type').indexOf ('buy') !== -1 ? 'buy' : 'sell';
        const cost = this.safeFloat (trade, 'quote_volume');
        const entry = {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': undefined,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
        };
        return entry;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const method = 'spotGetTradesPair';
        await this.loadMarkets ();
        const marketSymbol = this.markets[symbol]['id'];
        const request = {
            'pair': marketSymbol,
        };
        const response = await this[method] (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        // {
        //     "trade_id":566138474,
        //     "price":"2630.25",
        //     "base_volume":"0.015194",
        //     "quote_volume":"39.9640185",
        //     "timestamp":"1621928442622",
        //     "type":"buy_limit"
        // }
        const result = [];
        result.push (this.convertTrade (symbol, data));
        return result;
    }

    async fetchCurrencies (params = {}) {
        const method = 'publicGetCurrencies';
        const response = await this[method] (params);
        // {
        //     "result":true,
        //     "code":1000,
        //     "message":"Success",
        //     "data":[
        //     {
        //     "symbol":"EUSDT",
        //     "name":"USDT ERC-20",
        //     "active":true
        //     }
        //     ],
        //     "pagination":null
        //     }
        const currencies = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const code = this.safeCurrencyCode (this.safeString (currency, 'symbol') === 'EUSDT'
                ? 'USDT' : this.safeString (currency, 'symbol'));
            const name = this.safeCurrencyCode (this.safeString (currency, 'name'));
            const active = this.safeString (currency, 'active');
            result[code] = {
                'id': code,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'precision': undefined,
                'fee': undefined,
            };
        }
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const method = 'privatePostOrderOrderIdCancel';
        const request = {
            'orderId': id,
        };
        const response = await this[method] (this.extend (request, params));
        const result = this.safeValue (response, 'data', '');
        if (result === '') {
            return response;
        }
        return this.parseOrder (result);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const method = 'privateGetOrderOrderIdDetail';
        const request = {
            'orderId': id,
        };
        const response = await this[method] (this.extend (request, params));
        const order = this.safeValue (response, 'data', {});
        if (order === undefined || order.id === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder() could not find order id ' + id);
        }
        //
        // {
        //     "data":{
        //     "amount":0,
        //     "canceledAt":0,
        //     "createdAt":0,
        //     "fee":0,
        //     "filledAmount":0,
        //     "finishedAt":0,
        //     "id":0,
        //     "price":0,
        //     "status":"string",
        //     "symbol":"string",
        //     "total":0,
        //     "type":"string",
        //     },
        //     "status":"Success",
        //     "message":null,
        //     "ex":null
        //     }
        const result = this.safeValue (response, 'data', []);
        return this.parseOrder (result, undefined);
    }

    parseTrade (trade, market = undefined) {
        //
        //     { id: '604560813',
        //    accountId: '1017192',
        //    status: 'filled',
        //    type: 'buy_market',
        //    price: '0.0',
        //    amount: '0.00000',
        //    filledAmount: '0.000275',
        //    fee: '5.5E-7',
        //    total: '9.97268197',
        //    createdAt: '1622537112504',
        //    finishedAt: '1622537112879',
        //    canceledAt: '0',
        //    symbol: 'btcusdt' }
        //
        let timestamp = undefined;
        let side = undefined;
        let type = undefined;
        let amountString = undefined;
        let orderId = undefined;
        let fee = undefined;
        let symbol = undefined;
        let totalString = undefined;
        //
        orderId = this.safeString (trade, 'id');
        timestamp = this.safeTimestamp (trade, 'createdAt');
        const _type = this.safeString (trade, 'type');
        side = _type.split ('_')[0];
        type = _type.split ('_')[1];
        totalString = this.safeString (trade, 'total');
        amountString = this.safeString (trade, 'filledAmount');
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            symbol = trade.symbol;
        }
        if ('fee' in trade) {
            let currency = undefined;
            if (market !== undefined) {
                currency = market['quote'];
            } else {
                const label = symbol.substring (3, symbol.length).toString ();
                currency = label.toUpperCase ();
            }
            fee = {
                'cost': this.safeNumber (trade, 'fee'),
                'currency': currency,
            };
        }
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (totalString);
        const price = this.parseNumber (Precise.stringMul (totalString, amountString));
        return {
            'id': orderId,
            'order': orderId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired ('fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const method = 'privateGetOrderHistory';
        let market = undefined;
        let _symbol = 'all';
        if (symbol !== 'all') {
            market = this.market (symbol);
            _symbol = market['id'];
        }
        const request = {
            'symbol': _symbol,
        };
        if (params.type === undefined) {
            request.type = 'all';
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // {"data":[
        //     {
        //       "accountId": 0,
        //       "amount": 0,
        //       "canceledAt": 0,
        //       "createdAt": 0,
        //       "fee": 0,
        //       "filledAmount": 0,
        //       "finishedAt": 0,
        //       "id": 0,
        //       "price": 0,
        //       "status": "string",
        //       "symbol": "string",
        //       "total": 0,
        //       "type": "string"
        //     }
        //   ],"status":"Success","message":null,"ex":null}
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'submitted': 'submitted',
            'filled': 'filled',
            'canceled': 'canceled',
            'partial_canceled': 'partial_canceled',
            'partial_filled': 'partial_filled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     { id: '604613135',
        // accountId: '1017192',
        // status: 'submitted',
        // type: 'buy_limit',
        // price: '2490.32',
        // amount: '0.00400',
        // filledAmount: '0.00000',
        // fee: '0E-7',
        // total: '0E-7',
        // createdAt: '1622542690574',
        // finishedAt: '0',
        // canceledAt: '0',
        // symbol: 'ethusdt' }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (order, 'createdAt');
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'amount');
        const cost = this.safeNumber2 (order, 'total');
        const id = this.safeString (order, 'id');
        const _type = this.safeString (order, 'type');
        let side = undefined;
        let type = undefined;
        if (_type !== undefined && _type.split ('_') !== undefined && _type.split ('_').length !== 0) {
            side = _type.split ('_')[0];
            type = _type.split ('_')[1];
        }
        let fee = undefined;
        if ('fee' in order) {
            let currency = undefined;
            if (market !== undefined) {
                currency = market['quote'];
            } else {
                const label = symbol.substring (3, symbol.length).toString ();
                currency = label.toUpperCase ().replace ('/', '');
            }
            fee = {
                'cost': this.safeNumber (order, 'fee'),
                'currency': currency,
            };
        }
        const rawTrades = this.safeValue (order, 'trades');
        let trades = undefined;
        if (rawTrades !== undefined) {
            trades = this.parseTrades (rawTrades, market, undefined, undefined, { 'order': id });
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': trades,
        });
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const method = 'privateGetOrderOpenCharacterOrders';
        let market = undefined;
        let _symbol = 'all';
        if (symbol !== 'all') {
            market = this.market (symbol);
            _symbol = market['id'];
        }
        const request = {
            'symbol': _symbol,
            'character': '-',
        };
        if (params.type === undefined) {
            request.type = 'all';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // {"data":[
        //     {
        //       "accountId": 0,
        //       "amount": 0,
        //       "canceledAt": 0,
        //       "createdAt": 0,
        //       "fee": 0,
        //       "filledAmount": 0,
        //       "finishedAt": 0,
        //       "id": 0,
        //       "price": 0,
        //       "status": "string",
        //       "symbol": "string",
        //       "total": 0,
        //       "type": "string"
        //     }
        //   ],"status":"Success","message":null,"ex":null}
        //
        const result = this.safeValue (response, 'data', []);
        return this.parseOrders (result, market, since, limit);
    }

    tranferData (rawData) {
        // let type = rawData.side + '_' + rawData.type;
        const type = rawData.side;
        return {
            'base': rawData.base,
            'quote': rawData.quote,
            'type': type,
            'amount': rawData.quantity.toString (),
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        const arrSymbol = symbol.split ('/');
        let requestSide = undefined;
        let requestType = undefined;
        side = side.toLowerCase ();
        type = type.toLowerCase ();
        if (side in this.sides) {
            requestSide = this.sides[side];
        } else {
            throw new NotSupported ('Side ' + side + ' not supported');
        }
        if (type in this.types) {
            requestType = this.types[type];
        } else {
            throw new NotSupported ('Type ' + type + ' not supported.');
        }
        const method = 'privatePostOrderAdd';
        await this.loadMarkets ();
        // tranfer data
        const requestRaw = {
            'symbol': this.markets[symbol]['id'],
            'side': requestSide,
            'type': requestType,
            'quantity': amount,
            'base': arrSymbol[0].toLowerCase (),
            'quote': arrSymbol[1].toLowerCase (),
        };
        const request = this.tranferData (requestRaw);
        if (price !== undefined) {
            request['price'] = price;
        }
        const response = await this[method] (this.extend (request, params));
        const result = this.safeValue (response, 'data', '');
        if (result === '') {
            throw new InvalidOrder ();
        }
        return this.parseOrder (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const method = 'privateGetAccountBalance';
        const response = await this[method] (params);
        // { result: true,
        //     code: '1000',
        //     message: 'Success',
        //     data:
        //      [ { accountId: '0',
        //          symbol: 'KRS',
        //          balance: '0',
        //          balanceFrozen: '0',
        //          status: '0' },
        //        { accountId: '0',
        //          symbol: 'BTC',
        //          balance: '0.00027446',
        //          balanceFrozen: '0',
        //          status: '0' },
        //        { accountId: '0',
        //          symbol: 'ETH',
        //          balance: '0',
        //          balanceFrozen: '0',
        //          status: '0' },
        //        { accountId: '0',
        //          symbol: 'USDT',
        //          balance: '55.06603803',
        //          balanceFrozen: '34.96128',
        //          status: '0' },
        //        { accountId: '0',
        //          symbol: 'TRX',
        //          balance: '0',
        //          balanceFrozen: '0',
        //          status: '0' } ],
        //     pagination: null }
        const balances = this.safeValue (response, 'data');
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'balance');
            account['used'] = this.safeFloat (balance, 'balanceFrozen');
            account['total'] = this.safeFloat (balance, 'balance') + this.safeFloat (balance, 'balanceFrozen');
            result[code] = account;
        }
        return this.parseBalance (result, false);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //   { address: 'THeTN5DzmGk5PfFPeEzmVBTHgRraBdtbQd',
        //     name: null,
        //    currency: 'TRX' },
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString (depositAddress, 'tag');
        let currencyId = this.safeString (depositAddress, 'currency');
        currencyId = currencyId === undefined ? currency : currencyId;
        const code = this.safeCurrencyCode (currencyId);
        return {
            'info': depositAddress,
            'code': code,
            'address': address,
            'tag': tag,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const method = 'privateGetAccountAddressCurrency';
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this[method] (this.extend (request, params));
        //
        // { result: true,
        //     code: '1000',
        //     message: 'Success',
        //     data:
        //      { address: 'THeTN5DzmGk5PfFPeEzmVBTHgRraBdtbQd',
        //        name: null,
        //        currency: 'TRX' },
        //     pagination: null }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseDepositAddress (data, currency['id']);
    }

    tranderOHLCVData (rawData) {
        // [
        //     { time: '1622868720000',
        //     open: '2778.9',
        //     high: '2779.89',
        //     low: '2776.67',
        //     close: '2779.89',
        //     volume: '1.4910919999999999' },
        // { time: '1622868660000',
        //     open: '2778.35',
        //     high: '2780.51',
        //     low: '2777.94',
        //     close: '2778.84',
        //     volume: '1.5128819999999998' },
        //     ...
        // ]
        const data = [];
        const result = [];
        for (let i = 0; i < rawData.length; i++) {
            const raw = rawData[i];
            data[0] = raw['time'];
            data[1] = raw['open'];
            data[2] = raw['high'];
            data[3] = raw['low'];
            data[4] = raw['close'];
            data[5] = raw['volume'];
            result[i] = data;
        }
        return result;
    }

    async fetchOHLCV (symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // the default limit 50, max 100
        limit = (limit === undefined) ? 50 : limit;
        const method = 'spotGetCandlePairTimeFrame';
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'timeFrame': this.timeframes[timeframe],
            'size': limit,
        };
        const duration = this.parseTimeframe (timeframe);
        if (since === undefined) {
            const end = this.seconds ();
            request['start'] = end - duration * limit;
            request['end'] = end;
        } else {
            const start = parseInt (since / 1000);
            request['start'] = start;
            request['end'] = this.sum (start, duration * limit);
        }
        const response = await this[method] (this.extend (request, params));
        // { data:
        //     [ { time: '1622871300000',
        //         open: '2762.63',
        //         high: '2763.81',
        //         low: '2756.7000000000003',
        //         close: '2760.6',
        //         volume: '1.84676' },
        //       { time: '1622871000000',
        //         open: '2771.37',
        //         high: '2771.37',
        //         low: '2753.4700000000003',
        //         close: '2762.42',
        //         volume: '7.743916' },
        //     ...
        //     ],
        //    status: 'Success',
        //    message: null,
        //    ex: null }
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (this.tranderOHLCVData (data), market, timeframe, since, limit);
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code === 500) {
            throw new ExchangeNotAvailable (this.id + ' ' + code.toString () + ' ' + reason);
        }
        if (body.indexOf ('Access Denied') >= 0) {
            throw new PermissionDenied (body);
        }
        if (body.indexOf ('MSG_ORDER_BALANCE_NOT_ENOUGH') >= 0) {
            throw new InsufficientFunds (this.id + ' ' + body);
        }
        if (body.indexOf ('MSG_ORDER_NOT_FOUND') >= 0) {
            throw new OrderNotFound (this.id + ' ' + body);
        }
        if (body.indexOf ('Unknown order') >= 0) {
            throw new OrderNotFound (this.id + ' ' + body);
        }
        if (body.indexOf ('MSG_DATA_INVALID') >= 0) {
            throw new InvalidOrder (this.id + ' ' + body);
        }
        if (body.indexOf ('Server error') >= 0) {
            throw new ExchangeNotAvailable (body);
        }
        if (response === undefined || response.data === '') {
            throw new ExchangeError (this.id + ' ' + body);
        }
    }
};
