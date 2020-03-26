'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, ExchangeError, InsufficientFunds, InvalidOrder, BadSymbol } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitmax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmax',
            'name': 'BitMax',
            'countries': [ 'CN' ], // China
            'rateLimit': 500,
            'certified': false,
            // new metainfo interface
            'has': {
                'CORS': false,
                'fetchAccounts': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchMyTrades': false,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchOrderTrades': true,
                'fetchClosedOrders': true,
                'fetchTransactions': false,
                'fetchCurrencies': true,
                'cancelAllOrders': true,
                'fetchDepositAddress': true,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1d',
                '1w': '1w',
                '1M': '1m',
            },
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/66820319-19710880-ef49-11e9-8fbe-16be62a11992.jpg',
                'api': 'https://bitmax.io',
                'test': 'https://bitmax-test.io',
                'www': 'https://bitmax.io',
                'doc': [
                    'https://github.com/bitmax-exchange/api-doc/blob/master/bitmax-api-doc-v1.2.md',
                ],
                'fees': 'https://bitmax.io/#/feeRate/tradeRate',
                'referral': 'https://bitmax.io/#/register?inviteCode=EL6BXBQM',
            },
            'api': {
                'public': {
                    'get': [
                        'assets',
                        'depth',
                        'fees',
                        'quote',
                        'depth',
                        'trades',
                        'products',
                        'ticker/24hr',
                        'barhist',
                        'barhist/info',
                        'margin/ref-price',
                    ],
                },
                'private': {
                    'get': [
                        'deposit',
                        'user/info',
                        'balance',
                        'order/batch',
                        'order/open',
                        'order',
                        'order/history',
                        'order/{coid}',
                        'order/fills/{coid}',
                        'transaction',
                        'margin/balance',
                        'margin/order/open',
                        'margin/order',
                    ],
                    'post': [
                        'margin/order',
                        'order',
                        'order/batch',
                    ],
                    'delete': [
                        'margin/order',
                        'order',
                        'order/all',
                        'order/batch',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
            },
            'options': {
                'accountGroup': undefined,
                'parseOrderToPrecision': false,
            },
            'exceptions': {
                'exact': {
                    '2100': AuthenticationError, // {"code":2100,"message":"ApiKeyFailure"}
                    '5002': BadSymbol, // {"code":5002,"message":"Invalid Symbol"}
                    '6010': InsufficientFunds, // {'code': 6010, 'message': 'Not enough balance.'}
                    '60060': InvalidOrder, // { 'code': 60060, 'message': 'The order is already filled or canceled.' }
                    '600503': InvalidOrder, // {"code":600503,"message":"Notional is too small."}
                },
                'broad': {},
            },
            'commonCurrencies': {
                'BTCBEAR': 'BEAR',
                'BTCBULL': 'BULL',
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetAssets (params);
        //
        //     [
        //         {
        //           "assetCode" : "LTO",
        //           "assetName" : "LTO",
        //           "precisionScale" : 9,
        //           "nativeScale" : 3,
        //           "withdrawalFee" : 5.0,
        //           "minWithdrawalAmt" : 10.0,
        //           "status" : "Normal"
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'assetCode');
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const code = this.safeCurrencyCode (id);
            const precision = this.safeInteger (currency, 'precisionScale');
            const fee = this.safeFloat (currency, 'withdrawalFee'); // todo: redesign
            const status = this.safeString (currency, 'status');
            const active = (status === 'Normal');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': undefined,
                'name': this.safeString (currency, 'assetName'),
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minWithdrawalAmt'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetProducts (params);
        //
        //     [
        //         {
        //             "symbol" : "BCH/USDT",
        //             "domain" : "USDS",
        //             "baseAsset" : "BCH",
        //             "quoteAsset" : "USDT",
        //             "priceScale" : 2,
        //             "qtyScale" : 3,
        //             "notionalScale" : 9,
        //             "minQty" : "0.000000001",
        //             "maxQty" : "1000000000",
        //             "minNotional" : "5",
        //             "maxNotional" : "200000",
        //             "status" : "Normal",
        //             "miningStatus" : "",
        //             "marginTradable" : true,
        //             "commissionType" : "Quote",
        //             "commissionReserveRate" : 0.0010000000
        //         },
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'qtyScale'),
                'price': this.safeInteger (market, 'notionalScale'),
            };
            const status = this.safeString (market, 'status');
            const active = (status === 'Normal');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minQty'),
                        'max': this.safeFloat (market, 'maxQty'),
                    },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': {
                        'min': this.safeFloat (market, 'minNotional'),
                        'max': this.safeFloat (market, 'maxNotional'),
                    },
                },
            });
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
        let cost = amount * rate;
        let precision = market['precision']['price'];
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
            precision = market['precision']['amount'];
        }
        cost = this.decimalToPrecision (cost, ROUND, precision, this.precisionMode);
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (cost),
        };
    }

    async fetchAccounts (params = {}) {
        let accountGroup = this.safeString (this.options, 'accountGroup');
        let response = undefined;
        if (accountGroup === undefined) {
            response = await this.privateGetUserInfo (params);
            //
            //     {
            //         "accountGroup": 5
            //     }
            //
            accountGroup = this.safeString (response, 'accountGroup');
        }
        return [
            {
                'id': accountGroup,
                'type': undefined,
                'currency': undefined,
                'info': response,
            },
        ];
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const response = await this.privateGetBalance (params);
        //
        //     {
        //         "code": 0,
        //         "status": "success", // this field will be deprecated soon
        //         "email": "foo@bar.com", // this field will be deprecated soon
        //         "data": [
        //             {
        //                 "assetCode": "TSC",
        //                 "assetName": "Ethereum",
        //                 "totalAmount": "20.03", // total balance amount
        //                 "availableAmount": "20.03", // balance amount available to trade
        //                 "inOrderAmount": "0.000", // in order amount
        //                 "btcValue": "70.81"     // the current BTC value of the balance, may be missing
        //             },
        //         ]
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'assetCode'));
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'availableAmount');
            account['used'] = this.safeFloat (balance, 'inOrderAmount');
            account['total'] = this.safeFloat (balance, 'totalAmount');
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
            request['n'] = limit; // default = maximum = 100
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        //
        //     {
        //         "m":"depth",
        //         "ts":1570866464777,
        //         "seqnum":5124140078,
        //         "s":"ETH/USDT",
        //         "asks":[
        //             ["183.57","5.92"],
        //             ["183.6","10.185"]
        //         ],
        //         "bids":[
        //             ["183.54","0.16"],
        //             ["183.53","10.8"],
        //         ]
        //     }
        //
        const timestamp = this.safeInteger (response, 'ts');
        const result = this.parseOrderBook (response, timestamp);
        result['nonce'] = this.safeInteger (response, 'seqnum');
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol":"BCH/USDT",
        //         "interval":"1d",
        //         "barStartTime":1570866600000,
        //         "openPrice":"225.16",
        //         "closePrice":"224.05",
        //         "highPrice":"226.08",
        //         "lowPrice":"218.92",
        //         "volume":"8607.036"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'barStartTime');
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        } else if (marketId !== undefined) {
            const [ baseId, quoteId ] = marketId.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'closePrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'openPrice'),
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker24hr (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker24hr (params);
        return this.parseTickers (response, symbols);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        //
        //     {
        //         "m":"bar",
        //         "s":"ETH/BTC",
        //         "ba":"ETH",
        //         "qa":"BTC",
        //         "i":"1",
        //         "t":1570867020000,
        //         "o":"0.022023",
        //         "c":"0.022018",
        //         "h":"0.022023",
        //         "l":"0.022018",
        //         "v":"2.510",
        //     }
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeFloat (ohlcv, 'o'),
            this.safeFloat (ohlcv, 'h'),
            this.safeFloat (ohlcv, 'l'),
            this.safeFloat (ohlcv, 'c'),
            this.safeFloat (ohlcv, 'v'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        // if since and limit are not specified
        // the exchange will return just 1 last candle by default
        const duration = this.parseTimeframe (timeframe);
        if (since !== undefined) {
            request['from'] = since;
            if (limit !== undefined) {
                request['to'] = this.sum (since, limit * duration * 1000, 1);
            }
        } else if (limit !== undefined) {
            request['to'] = this.milliseconds ();
            request['from'] = request['to'] - limit * duration * 1000 - 1;
        }
        const response = await this.publicGetBarhist (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "p": "13.75", // price
        //         "q": "6.68", // quantity
        //         "t": 1528988084944, // timestamp
        //         "bm": False, // if true, the buyer is the market maker, we only use this field to "define the side" of a public trade
        //     }
        //
        // private fetchOrderTrades
        //
        //     {
        //         "ap": "0.029062965", // average filled price
        //         "bb": "36851.981", // base asset total balance
        //         "bc": "0", // if possitive, this is the BTMX commission charged by reverse mining, if negative, this is the mining output of the current fill.
        //         "bpb": "36851.981", // base asset pending balance
        //         "btmxBal": "0.0", // optional, the BTMX balance of the current account. This field is only available when bc is non-zero.
        //         "cat": "CASH", // account category: CASH/MARGIN
        //         "coid": "41g6wtPRFrJXgg6YxjqI6Qoog139Dmoi", // client order id, (needed to cancel order)
        //         "ei": "NULL_VAL", // execution instruction
        //         "errorCode": "NULL_VAL", // if the order is rejected, this field explains why
        //         "execId": "12562285", // for each user, this is a strictly increasing long integer (represented as string)
        //         "f": "78.074", // filled quantity, this is the aggregated quantity executed by all past fills
        //         "fa": "BTC", // fee asset
        //         "fee": "0.000693608", // fee
        //         'lp': "0.029064", // last price, the price executed by the last fill
        //         "l": "11.932", // last quantity, the quantity executed by the last fill
        //         "m": "order", // message type
        //         "orderType": "Limit", // Limit, Market, StopLimit, StopMarket
        //         "p": "0.029066", // limit price, only available for limit and stop limit orders
        //         "q": "100.000", // order quantity
        //         "qb": "98878.642957097", // quote asset total balance
        //         "qpb": "98877.967247508", // quote asset pending balance
        //         "s": "ETH/BTC", // symbol
        //         "side": "Buy", // side
        //         "status": "PartiallyFilled", // order status
        //         "t": 1561131458389, // timestamp
        //     }
        //
        const timestamp = this.safeInteger (trade, 't');
        const price = this.safeFloat (trade, 'p');
        const amount = this.safeFloat (trade, 'q');
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        const buyerIsMaker = this.safeValue (trade, 'bm');
        let symbol = undefined;
        const marketId = this.safeString (trade, 's');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = market.split ('/');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fa');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const orderId = this.safeString (trade, 'coid');
        let side = this.safeStringLower (trade, 'side');
        if ((side === undefined) && (buyerIsMaker !== undefined)) {
            side = buyerIsMaker ? 'buy' : 'sell';
        }
        const type = this.safeStringLower (trade, 'orderType');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': undefined,
            'order': orderId,
            'type': type,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
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
            request['n'] = limit; // currently limited to 100 or fewer
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "m": "marketTrades", // message type
        //         "s": "ETH/BTC", // symbol
        //         "trades": [
        //             {
        //                 "p": "13.75", // price
        //                 "q": "6.68", // quantity
        //                 "t": 1528988084944, // timestamp
        //                 "bm": False, // if true, the buyer is the market maker
        //             },
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'PendingNew': 'open',
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'Canceled': 'canceled',
            'Rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "coid": "xxx...xxx",
        //         "action": "new",
        //         "success": true  // success = true means the order has been submitted to the matching engine.
        //     }
        //
        // fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "accountCategory": "CASH",
        //         "accountId": "cshKAhmTHQNUKhR1pQyrDOdotE3Tsnz4",
        //         "avgPrice": "0.000000000",
        //         "baseAsset": "ETH",
        //         "btmxCommission": "0.000000000",
        //         "coid": "41g6wtPRFrJXgg6Y7vpIkcCyWhgcK0cF", // the unique identifier, you will need, this value to cancel this order
        //         "errorCode": "NULL_VAL",
        //         "execId": "12452288",
        //         "execInst": "NULL_VAL",
        //         "fee": "0.000000000", // cumulative fee paid for this order
        //         "feeAsset": "", // the asset
        //         "filledQty": "0.000000000", // filled quantity
        //         "notional": "0.000000000",
        //         "orderPrice": "0.310000000", // only available for limit and stop limit orders
        //         "orderQty": "1.000000000",
        //         "orderType": "StopLimit",
        //         "quoteAsset": "BTC",
        //         "side": "Buy",
        //         "status": "PendingNew",
        //         "stopPrice": "0.300000000", // only available for stop market and stop limit orders
        //         "symbol": "ETH/BTC",
        //         "time": 1566091628227, // The last execution time of the order
        //         "sendingTime": 1566091503547, // The sending time of the order
        //         "userId": "supEQeSJQllKkxYSgLOoVk7hJAX59WSz"
        //     }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ baseId, quoteId ] = marketId.split ('/');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (order, 'sendingTime');
        let price = this.safeFloat (order, 'orderPrice');
        const amount = this.safeFloat (order, 'orderQty');
        const filled = this.safeFloat (order, 'filledQty');
        let remaining = undefined;
        let cost = this.safeFloat (order, 'cummulativeQuoteQty');
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
                if (this.options['parseOrderToPrecision']) {
                    remaining = parseFloat (this.amountToPrecision (symbol, remaining));
                }
                remaining = Math.max (remaining, 0.0);
            }
            if (price !== undefined) {
                if (cost === undefined) {
                    cost = price * filled;
                }
            }
        }
        const id = this.safeString (order, 'coid');
        let type = this.safeString (order, 'orderType');
        if (type !== undefined) {
            type = type.toLowerCase ();
            if (type === 'market') {
                if (price === 0.0) {
                    if ((cost !== undefined) && (filled !== undefined)) {
                        if ((cost > 0) && (filled > 0)) {
                            price = cost / filled;
                        }
                    }
                }
            }
        }
        const side = this.safeStringLower (order, 'side');
        const fee = {
            'cost': this.safeFloat (order, 'fee'),
            'currency': this.safeString (order, 'feeAsset'),
        };
        const average = this.safeFloat (order, 'avgPrice');
        const clientOrderId = id;
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const request = {
            'coid': this.coid (), // a unique identifier of length 32
            // 'time': this.milliseconds (), // milliseconds since UNIX epoch in UTC, this is filled in the private section of the sign() method below
            'symbol': market['id'],
            // 'orderPrice': this.priceToPrecision (symbol, price), // optional, limit price of the order. This field is required for limit orders and stop limit orders
            // 'stopPrice': '15.7', // optional, stopPrice of the order. This field is required for stop_market orders and stop limit orders
            'orderQty': this.amountToPrecision (symbol, amount),
            'orderType': type, // order type, you shall specify one of the following: "limit", "market", "stop_market", "stop_limit"
            'side': side, // "buy" or "sell"
            // 'postOnly': true, // optional, if true, the order will either be posted to the limit order book or be cancelled, i.e. the order cannot take liquidity, default is false
            // 'timeInForce': 'GTC', // optional, supports "GTC" good-till-canceled and "IOC" immediate-or-cancel
        };
        if ((type === 'limit') || (type === 'stop_limit')) {
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "email": "foo@bar.com", // this field will be deprecated soon
        //         "status": "success", // this field will be deprecated soon
        //         "data": {
        //             "coid": "xxx...xxx",
        //             "action": "new",
        //             "success": true, // success = true means the order has been submitted to the matching engine
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'coid': id,
        };
        const response = await this.privateGetOrderCoid (this.extend (request, params));
        //
        //     {
        //         'code': 0,
        //         'status': 'success', // this field will be deprecated soon
        //         'email': 'foo@bar.com', // this field will be deprecated soon
        //         "data": {
        //             "accountCategory": "CASH",
        //             "accountId": "cshKAhmTHQNUKhR1pQyrDOdotE3Tsnz4",
        //             "avgPrice": "0.000000000",
        //             "baseAsset": "ETH",
        //             "btmxCommission": "0.000000000",
        //             "coid": "41g6wtPRFrJXgg6Y7vpIkcCyWhgcK0cF", // the unique identifier, you will need, this value to cancel this order
        //             "errorCode": "NULL_VAL",
        //             "execId": "12452288",
        //             "execInst": "NULL_VAL",
        //             "fee": "0.000000000", // cumulative fee paid for this order
        //             "feeAsset": "", // the asset
        //             "filledQty": "0.000000000", // filled quantity
        //             "notional": "0.000000000",
        //             "orderPrice": "0.310000000", // only available for limit and stop limit orders
        //             "orderQty": "1.000000000",
        //             "orderType": "StopLimit",
        //             "quoteAsset": "BTC",
        //             "side": "Buy",
        //             "status": "PendingNew",
        //             "stopPrice": "0.300000000", // only available for stop market and stop limit orders
        //             "symbol": "ETH/BTC",
        //             "time": 1566091628227, // The last execution time of the order
        //             "sendingTime": 1566091503547, // The sending time of the order
        //             "userId": "supEQeSJQllKkxYSgLOoVk7hJAX59WSz"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'coid': id,
        };
        const response = await this.privateGetOrderFillsCoid (this.extend (request, params));
        //
        //     {
        //         'code': 0,
        //         'status': 'success', // this field will be deprecated soon
        //         'email': 'foo@bar.com', // this field will be deprecated soon
        //         "data": [
        //             {
        //                 "ap": "0.029062965", // average filled price
        //                 "bb": "36851.981", // base asset total balance
        //                 "bc": "0", // if possitive, this is the BTMX commission charged by reverse mining, if negative, this is the mining output of the current fill.
        //                 "bpb": "36851.981", // base asset pending balance
        //                 "btmxBal": "0.0", // optional, the BTMX balance of the current account. This field is only available when bc is non-zero.
        //                 "cat": "CASH", // account category: CASH/MARGIN
        //                 "coid": "41g6wtPRFrJXgg6YxjqI6Qoog139Dmoi", // client order id, (needed to cancel order)
        //                 "ei": "NULL_VAL", // execution instruction
        //                 "errorCode": "NULL_VAL", // if the order is rejected, this field explains why
        //                 "execId": "12562285", // for each user, this is a strictly increasing long integer (represented as string)
        //                 "f": "78.074", // filled quantity, this is the aggregated quantity executed by all past fills
        //                 "fa": "BTC", // fee asset
        //                 "fee": "0.000693608", // fee
        //                 'lp': "0.029064", // last price, the price executed by the last fill
        //                 "l": "11.932", // last quantity, the quantity executed by the last fill
        //                 "m": "order", // message type
        //                 "orderType": "Limit", // Limit, Market, StopLimit, StopMarket
        //                 "p": "0.029066", // limit price, only available for limit and stop limit orders
        //                 "q": "100.000", // order quantity
        //                 "qb": "98878.642957097", // quote asset total balance
        //                 "qpb": "98877.967247508", // quote asset pending balance
        //                 "s": "ETH/BTC", // symbol
        //                 "side": "Buy", // side
        //                 "status": "PartiallyFilled", // order status
        //                 "t": 1561131458389, // timestamp
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTrades (data, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        const request = {
            // 'side': 'buy', // or 'sell', optional
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetOrderOpen (this.extend (request, params));
        //
        //     {
        //         'code': 0,
        //         'status': 'success', // this field will be deprecated soon
        //         'email': 'foo@bar.com', // this field will be deprecated soon
        //         "data": [
        //             {
        //                 "accountCategory": "CASH",
        //                 "accountId": "cshKAhmTHQNUKhR1pQyrDOdotE3Tsnz4",
        //                 "avgPrice": "0.000000000",
        //                 "baseAsset": "ETH",
        //                 "btmxCommission": "0.000000000",
        //                 "coid": "41g6wtPRFrJXgg6Y7vpIkcCyWhgcK0cF", // the unique identifier, you will need, this value to cancel this order
        //                 "errorCode": "NULL_VAL",
        //                 "execId": "12452288",
        //                 "execInst": "NULL_VAL",
        //                 "fee": "0.000000000", // cumulative fee paid for this order
        //                 "feeAsset": "", // the asset
        //                 "filledQty": "0.000000000", // filled quantity
        //                 "notional": "0.000000000",
        //                 "orderPrice": "0.310000000", // only available for limit and stop limit orders
        //                 "orderQty": "1.000000000",
        //                 "orderType": "StopLimit",
        //                 "quoteAsset": "BTC",
        //                 "side": "Buy",
        //                 "status": "PendingNew",
        //                 "stopPrice": "0.300000000", // only available for stop market and stop limit orders
        //                 "symbol": "ETH/BTC",
        //                 "time": 1566091628227, // The last execution time of the order
        //                 "sendingTime": 1566091503547, // The sending time of the order
        //                 "userId": "supEQeSJQllKkxYSgLOoVk7hJAX59WSz"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        const request = {
            // 'symbol': 'ETH/BTC', // optional
            // 'category': 'CASH', // optional, string
            // 'orderType': 'Market', // optional, string
            // 'page': 1, // optional, integer type, starts at 1
            // 'pageSize': 100, // optional, integer type
            // 'side': 'buy', // or 'sell', optional, case insensitive.
            // 'startTime': 1566091628227, // optional, integer milliseconds since UNIX epoch representing the start of the range
            // 'endTime': 1566091628227, // optional, integer milliseconds since UNIX epoch representing the end of the range
            // 'status': 'Filled', // optional, can only be one of "Filled", "Canceled", "Rejected"
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['n'] = limit; // default 15, max 50
        }
        const response = await this.privateGetOrderHistory (this.extend (request, params));
        //
        //     {
        //         'code': 0,
        //         'status': 'success', // this field will be deprecated soon
        //         'email': 'foo@bar.com', // this field will be deprecated soon
        //         'data': {
        //             'page': 1,
        //             'pageSize': 20,
        //             'limit': 500,
        //             'hasNext': False,
        //             'data': [
        //                 {
        //                     'time': 1566091429000, // The last execution time of the order (This timestamp is in second level resolution)
        //                     'coid': 'QgQIMJhPFrYfUf60ZTihmseTqhzzwOCx',
        //                     'execId': '331',
        //                     'symbol': 'BTMX/USDT',
        //                     'orderType': 'Market',
        //                     'baseAsset': 'BTMX',
        //                     'quoteAsset': 'USDT',
        //                     'side': 'Buy',
        //                     'stopPrice': '0.000000000', // only meaningful for stop market and stop limit orders
        //                     'orderPrice': '0.123000000', // only meaningful for limit and stop limit orders
        //                     'orderQty': '9229.409000000',
        //                     'filledQty': '9229.409000000',
        //                     'avgPrice': '0.095500000',
        //                     'fee': '0.352563424',
        //                     'feeAsset': 'USDT',
        //                     'btmxCommission': '0.000000000',
        //                     'status': 'Filled',
        //                     'notional': '881.408559500',
        //                     'userId': '5DNEppWy33SayHjFQpgQUTjwNMSjEhD3',
        //                     'accountId': 'ACPHERRWRIA3VQADMEAB2ZTLYAXNM3PJ',
        //                     'accountCategory': 'CASH',
        //                     'errorCode': 'NULL_VAL',
        //                     'execInst': 'NULL_VAL',
        //                     "sendingTime": 1566091382736, // The sending time of the order
        //                },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orders = this.safeValue (data, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'coid': this.coid (),
            'origCoid': id,
            // 'time': this.milliseconds (), // this is filled in the private section of the sign() method below
        };
        const response = await this.privateDeleteOrder (this.extend (request, params));
        //
        //     {
        //         'code': 0,
        //         'status': 'success', // this field will be deprecated soon
        //         'email': 'foo@bar.com', // this field will be deprecated soon
        //         'data': {
        //             'action': 'cancel',
        //             'coid': 'gaSRTi3o3Yo4PaXpVK0NSLP47vmJuLea',
        //             'success': True,
        //         }
        //     }
        //
        const order = this.safeValue (response, 'data', {});
        return this.parseOrder (order);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const request = {
            // 'side': 'buy', // optional string field (case-insensitive), either "buy" or "sell"
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id']; // optional
        }
        const response = await this.privateDeleteOrderAll (this.extend (request, params));
        //
        //     ?
        //
        return response;
    }

    coid () {
        const uuid = this.uuid ();
        const parts = uuid.split ('-');
        const clientOrderId = parts.join ('');
        const coid = clientOrderId.slice (0, 32);
        return coid;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const currency = this.currency (code);
        const request = {
            'requestId': this.coid (),
            // 'time': this.milliseconds (), // this is filled in the private section of the sign() method below
            'assetCode': currency['id'],
        };
        // note: it is highly recommended to use V2 version of this route,
        // especially for assets with multiple block chains such as USDT.
        const response = await this.privateGetDeposit (this.extend (request, params));
        //
        // v1
        //
        //     {
        //         "data": {
        //             "address": "0x26a3CB49578F07000575405a57888681249c35Fd"
        //         },
        //         "email": "igor.kroitor@gmial.com",
        //         "status": "success",
        //     }
        //
        // v2
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "asset": "XRP",
        //                 "blockChain": "Ripple",
        //                 "addressData": {
        //                     "address": "rpinhtY4p35bPmVXPbfWRUtZ1w1K1gYShB",
        //                     "destTag": "54301"
        //                 }
        //             }
        //         ],
        //         "email": "xxx@xxx.com",
        //         "status": "success" // the request has been submitted to the server
        //     }
        //
        let addressData = this.safeValue (response, 'data');
        if (Array.isArray (addressData)) {
            const firstElement = this.safeValue (addressData, 0, {});
            addressData = this.safeValue (firstElement, 'addressData', {});
        }
        const address = this.safeString (addressData, 'address');
        const tag = this.safeString (addressData, 'destTag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/api/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let accountGroup = this.safeString (this.options, 'accountGroup');
            if (accountGroup === undefined) {
                if (this.accounts !== undefined) {
                    accountGroup = this.accounts[0]['id'];
                }
            }
            if (accountGroup !== undefined) {
                url = '/' + accountGroup + url;
            }
            const coid = this.safeString (query, 'coid');
            query['time'] = this.milliseconds ().toString ();
            let auth = query['time'] + '+' + path.replace ('/{coid}', ''); // fix sign error
            headers = {
                'x-auth-key': this.apiKey,
                'x-auth-timestamp': query['time'],
                'Content-Type': 'application/json',
            };
            if (coid !== undefined) {
                auth += '+' + coid;
                headers['x-auth-coid'] = coid;
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            headers['x-auth-signature'] = this.decode (signature);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                body = this.json (query);
            }
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"code":2100,"message":"ApiKeyFailure"}
        //     {'code': 6010, 'message': 'Not enough balance.'}
        //     {'code': 60060, 'message': 'The order is already filled or canceled.'}
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        const error = (code !== undefined) && (code !== '0');
        if (error || (message !== undefined)) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
