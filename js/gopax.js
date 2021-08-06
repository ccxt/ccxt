'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidOrder, AuthenticationError, InsufficientFunds, BadSymbol, OrderNotFound, InvalidAddress, BadRequest } = require ('./base/errors');
const { TRUNCATE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class gopax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gopax',
            'name': 'GOPAX',
            'countries': [ 'KR' ], // South Korea
            'version': 'v1',
            'rateLimit': 50,
            'hostname': 'gopax.co.kr', // or 'gopax.com'
            'certified': true,
            'pro': true,
            'has': {
                'cancelOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': 'emulated',
                'fetchDepositAddresses': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTransactions': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '30m': '30',
                '1d': '1440',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/102897212-ae8a5e00-4478-11eb-9bab-91507c643900.jpg',
                'api': {
                    'public': 'https://api.{hostname}', // or 'https://api.gopax.co.kr'
                    'private': 'https://api.{hostname}',
                },
                'www': 'https://www.gopax.co.kr',
                'doc': 'https://gopax.github.io/API/index.en.html',
                'fees': 'https://www.gopax.com/feeinfo',
            },
            'api': {
                'public': {
                    'get': [
                        'notices',
                        'assets',
                        'price-tick-size',
                        'trading-pairs',
                        'trading-pairs/{tradingPair}/ticker',
                        'trading-pairs/{tradingPair}/book',
                        'trading-pairs/{tradingPair}/trades',
                        'trading-pairs/{tradingPair}/stats',
                        'trading-pairs/{tradingPair}/price-tick-size',
                        'trading-pairs/stats',
                        'trading-pairs/{tradingPair}/candles',
                        'time',
                    ],
                },
                'private': {
                    'get': [
                        'balances',
                        'balances/{assetName}',
                        'orders',
                        'orders/{orderId}',
                        'orders/clientOrderId/{clientOrderId}',
                        'trades',
                        'deposit-withdrawal-status',
                        'crypto-deposit-addresses',
                        'crypto-withdrawal-addresses',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders/{orderId}',
                        'orders/clientOrderId/{clientOrderId}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'tierBased': false,
                    'maker': 0.04 / 100,
                    'taker': 0.04 / 100,
                },
            },
            'exceptions': {
                'broad': {
                    'ERROR_INVALID_ORDER_TYPE': InvalidOrder,
                    'ERROR_INVALID_AMOUNT': InvalidOrder,
                    'ERROR_INVALID_TRADING_PAIR': BadSymbol, // Unlikely to be triggered, due to ccxt.gopax.js implementation
                    'No such order ID': OrderNotFound, // {"errorMessage":"No such order ID","errorCode":202,"errorData":"Order server error: 202"}
                    // 'Not enough amount': InsufficientFunds, // {"errorMessage":"Not enough amount, try increasing your order amount","errorCode":10212,"errorData":{}}
                    'Forbidden order type': InvalidOrder,
                    'the client order ID will be reusable which order has already been completed or canceled': InvalidOrder,
                    'ERROR_NO_SUCH_TRADING_PAIR': BadSymbol, // Unlikely to be triggered, due to ccxt.gopax.js implementation
                    'ERROR_INVALID_ORDER_SIDE': InvalidOrder,
                    'ERROR_NOT_HEDGE_TOKEN_USER': InvalidOrder,
                    'ORDER_EVENT_ERROR_NOT_ALLOWED_BID_ORDER': InvalidOrder, // Triggered only when the exchange is locked
                    'ORDER_EVENT_ERROR_INSUFFICIENT_BALANCE': InsufficientFunds,
                    'Invalid option combination': InvalidOrder,
                    'No such client order ID': OrderNotFound,
                },
                'exact': {
                    '100': BadSymbol, // Invalid asset name
                    '101': BadSymbol, // Invalid trading pair
                    '103': InvalidOrder, // Invalid order type
                    '104': BadSymbol, // Invalid trading pair
                    '105': BadSymbol, // Trading pair temporarily disabled
                    '106': BadSymbol, // Invalid asset name
                    '107': InvalidOrder, // Invalid order amount
                    '108': InvalidOrder, // Invalid order price
                    '111': InvalidOrder, // Invalid event type
                    '201': InsufficientFunds, // Not enough balance
                    '202': InvalidOrder, // Invalid order ID
                    '203': InvalidOrder, // Order amount X order price too large
                    '204': InvalidOrder, // Bid order temporarily unavailable
                    '205': InvalidOrder, // Invalid side
                    '206': InvalidOrder, // Invalid order option combination
                    '10004': AuthenticationError, // Not authorized
                    // '10004': ExchangeError, // API key not exist
                    // '10004': ExchangeError, // User KYC not approved
                    // '10004': ExchangeError, // User account is frozen
                    // '10004': ExchangeError, // User is under deactivation process
                    // '10004': ExchangeError, // 2FA is not enabled
                    // '10004': ExchangeError, // Invalid signature
                    '10041': BadRequest, // Invalid exchange
                    '10056': BadRequest, // No registered asset
                    '10057': BadSymbol, // No registered trading pair
                    '10059': BadSymbol, // Invalid trading pair
                    '10062': BadRequest, // Invalid chart interval
                    '10069': OrderNotFound, // {"errorMessage":"No such order ID: 73152094","errorCode":10069,"errorData":"73152094"}
                    '10155': AuthenticationError, // {"errorMessage":"Invalid API key","errorCode":10155}
                    '10166': BadRequest, // Invalid chart range
                    '10212': InvalidOrder, // {"errorMessage":"Not enough amount, try increasing your order amount","errorCode":10212,"errorData":{}}
                    '10221': OrderNotFound, // No such client order ID
                    '10222': InvalidOrder, // Client order ID being used
                    '10223': InvalidOrder, // Soon the client order ID will be reusable which order has already been completed or canceled
                    '10227': InvalidOrder, // Invalid client order ID format
                    '10319': BadRequest, // Pagination is required as you have too many orders
                    '10358': InvalidOrder, // Invalid order type
                    '10359': InvalidOrder, // Invalid order side
                    '10360': InvalidOrder, // Invalid order status
                    '10361': InvalidOrder, // Invalid order time in force
                    '10362': InvalidOrder, // Invalid order protection
                    '10363': InvalidOrder, // Invalid forced completion reason
                },
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //     {"serverTime":1608327726656}
        //
        return this.safeInteger (response, 'serverTime');
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetTradingPairs (params);
        //
        //     [
        //         {
        //             "id":1,
        //             "name":"ETH-KRW",
        //             "baseAsset":"ETH",
        //             "quoteAsset":"KRW",
        //             "baseAssetScale":8,
        //             "quoteAssetScale":0,
        //             "priceMin":1,
        //             "restApiOrderAmountMin":{
        //                 "limitAsk":{"amount":10000,"unit":"KRW"},
        //                 "limitBid":{"amount":10000,"unit":"KRW"},
        //                 "marketAsk":{"amount":0.001,"unit":"ETH"},
        //                 "marketBid":{"amount":10000,"unit":"KRW"},
        //             },
        //             "makerFeePercent":0.2,
        //             "takerFeePercent":0.2,
        //         },
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'name');
            const numericId = this.safeInteger (market, 'id');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'price': this.safeInteger (market, 'quoteAssetScale'),
                'amount': this.safeInteger (market, 'baseAssetScale'),
            };
            const minimums = this.safeValue (market, 'restApiOrderAmountMin', {});
            const marketAsk = this.safeValue (minimums, 'marketAsk', {});
            const marketBid = this.safeValue (minimums, 'marketBid', {});
            const takerFeePercentString = this.safeString (market, 'takerFeePercent');
            const makerFeePercentString = this.safeString (market, 'makerFeePercent');
            const taker = this.parseNumber (Precise.stringDiv (takerFeePercentString, '100'));
            const maker = this.parseNumber (Precise.stringDiv (makerFeePercentString, '100'));
            result.push ({
                'id': id,
                'info': market,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': this.safeString (market, 'baseAsset'),
                'quoteId': this.safeString (market, 'quoteAsset'),
                'active': true,
                'taker': taker,
                'maker': maker,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (marketAsk, 'amount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeNumber (market, 'priceMin'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (marketBid, 'amount'),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetAssets (params);
        //
        //     [
        //         {
        //             "id":"KRW",
        //             "name":"대한민국 원",
        //             "scale":0,
        //             "withdrawalFee":1000,
        //             "withdrawalAmountMin":5000
        //         },
        //         {
        //             "id":"ETH",
        //             "name":"이더리움",
        //             "scale":8,
        //             "withdrawalFee":0.03,
        //             "withdrawalAmountMin":0.015
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const fee = this.safeNumber (currency, 'withdrawalFee');
            const precision = this.safeNumber (currency, 'scale');
            result[code] = {
                'id': id,
                'info': currency,
                'code': code,
                'name': name,
                'active': true,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'withdrawalAmountMin'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'tradingPair': market['id'],
            // 'level': 3, // 1 best bidask, 2 top 50 bidasks, 3 all bidasks
        };
        const response = await this.publicGetTradingPairsTradingPairBook (this.extend (request, params));
        //
        //     {
        //         "sequence":17691957,
        //         "bid":[
        //             ["17690499",25019000,0.00008904,"1608326468921"],
        //             ["17691894",25010000,0.4295,"1608326499940"],
        //             ["17691895",25009000,0.2359,"1608326499953"],
        //         ],
        //         "ask":[
        //             ["17689176",25024000,0.000098,"1608326442006"],
        //             ["17691351",25031000,0.206,"1608326490418"],
        //             ["17691571",25035000,0.3996,"1608326493742"],
        //         ]
        //     }
        //
        const nonce = this.safeInteger (response, 'sequence');
        const result = this.parseOrderBook (response, symbol, undefined, 'bid', 'ask', 1, 2);
        result['nonce'] = nonce;
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "price":25087000,
        //         "ask":25107000,
        //         "askVolume":0.05837704,
        //         "bid":25087000,
        //         "bidVolume":0.00398628,
        //         "volume":350.09171591,
        //         "quoteVolume":8721016926.06529,
        //         "time":"2020-12-18T21:42:13.774Z",
        //     }
        //
        // fetchTickers
        //
        //     {
        //         "name":"ETH-KRW",
        //         "open":690500,
        //         "high":719500,
        //         "low":681500,
        //         "close":709500,
        //         "volume":2784.6081544,
        //         "time":"2020-12-18T21:54:50.795Z"
        //     }
        //
        const marketId = this.safeString (ticker, 'name');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.parse8601 (this.safeString (ticker, 'time'));
        const open = this.safeNumber (ticker, 'open');
        const last = this.safeNumber2 (ticker, 'price', 'close');
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        if ((last !== undefined) && (open !== undefined)) {
            average = this.sum (last, open) / 2;
            change = last - open;
            if (open > 0) {
                percentage = change / open * 100;
            }
        }
        const baseVolume = this.safeNumber (ticker, 'volume');
        const quoteVolume = this.safeNumber (ticker, 'quoteVolume');
        const vwap = this.vwap (baseVolume, quoteVolume);
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': this.safeNumber (ticker, 'bidVolume'),
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': this.safeNumber (ticker, 'askVolume'),
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'tradingPair': market['id'],
        };
        const response = await this.publicGetTradingPairsTradingPairTicker (this.extend (request, params));
        //
        //     {
        //         "price":25087000,
        //         "ask":25107000,
        //         "askVolume":0.05837704,
        //         "bid":25087000,
        //         "bidVolume":0.00398628,
        //         "volume":350.09171591,
        //         "quoteVolume":8721016926.06529,
        //         "time":"2020-12-18T21:42:13.774Z",
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTradingPairsStats (params);
        //
        //     [
        //         {
        //             "name":"ETH-KRW",
        //             "open":690500,
        //             "high":719500,
        //             "low":681500,
        //             "close":709500,
        //             "volume":2784.6081544,
        //             "time":"2020-12-18T21:54:50.795Z"
        //         }
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    parsePublicTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (trade, 'time'));
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'amount');
        let symbol = undefined;
        if ('symbol' in market) {
            symbol = this.safeString (market, 'symbol');
        }
        return {
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined, // Not mandatory to specify
            'type': undefined, // Not mandatory to specify
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': undefined,
        };
    }

    parsePrivateTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        const symbol = this.safeString (trade, 'tradingPairName').replace ('-', '/');
        const side = this.safeString (trade, 'side');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'baseAmount');
        let feeCurrency = symbol.slice (0, 3);
        if (side === 'sell') {
            feeCurrency = symbol.slice (4);
        }
        const fee = {
            'cost': this.safeNumber (trade, 'fee'),
            'currency': feeCurrency,
            'rate': undefined,
        };
        return {
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': this.safeInteger (trade, 'orderId'),
            'type': undefined,
            'side': side,
            'takerOrMaker': this.safeString (trade, 'position'),
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': fee,
        };
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "time":"2020-12-19T12:17:43.000Z",
        //         "date":1608380263,
        //         "id":23903608,
        //         "price":25155000,
        //         "amount":0.0505,
        //         "side":"sell",
        //     }
        //
        // private fetchMyTrades
        //
        //     {
        //         "id": 73953,                             // trading event ID
        //         "orderId": 453324,                       // order ID
        //         "baseAmount": 3,                         // traded base asset amount
        //         "quoteAmount": 3000000,                  // traded quote asset amount
        //         "fee": 0.0012,                           // fee
        //         "price": 1000000,                        // price
        //         "timestamp": "2020-09-25T04:06:30.000Z", // trading time
        //         "side": "buy",                           // buy, sell
        //         "tradingPairName": "ZEC-KRW",            // order book
        //         "position": "maker"                      // maker, taker
        //     }
        //
        //     {
        //         "tradeId": 74072,            // trade ID
        //         "orderId": 453529,           // order ID
        //         "side": 2,                   // 1(bid), 2(ask)
        //         "type": 1,                   // 1(limit), 2(market)
        //         "baseAmount": 0.01,          // filled base asset amount (in ZEC for this case)
        //         "quoteAmount": 1,            // filled quote asset amount (in KRW for this case)
        //         "fee": 0.0004,               // fee
        //         "price": 100,                // price
        //         "isSelfTrade": false,        // whether both of matching orders are yours
        //         "occurredAt": 1603932107,    // trade occurrence time
        //         "tradingPairName": "ZEC-KRW" // order book
        //     }
        //
        const id = this.safeString2 (trade, 'id', 'tradeId');
        const orderId = this.safeInteger (trade, 'orderId');
        let timestamp = this.parse8601 (this.safeString2 (trade, 'time', 'timestamp'));
        timestamp = this.safeTimestamp (trade, 'occuredAt', timestamp);
        const marketId = this.safeString (trade, 'tradingPairName');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        let side = this.safeString (trade, 'side');
        if (side === '1') {
            side = 'buy';
        } else if (side === '2') {
            side = 'sell';
        }
        let type = this.safeString (trade, 'type');
        if (type === '1') {
            type = 'limit';
        } else if (type === '2') {
            type = 'market';
        }
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString2 (trade, 'amount', 'baseAmount');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        let cost = this.safeNumber (trade, 'quoteAmount');
        if (cost === undefined) {
            cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        }
        const feeCost = this.safeNumber (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['base'],
            };
        }
        const takerOrMaker = this.safeString (trade, 'position');
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
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
            'tradingPair': market['id'],
            // 'limit': limit,
            // 'pastmax': id, // read data older than this ID
            // 'latestmin': id, // read data newer than this ID
            // 'after': parseInt (since / 1000),
            // 'before': this.seconds (),
        };
        if (since !== undefined) {
            request['after'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTradingPairsTradingPairTrades (this.extend (request, params));
        //
        //     [
        //         {"time":"2020-12-19T12:17:43.000Z","date":1608380263,"id":23903608,"price":25155000,"amount":0.0505,"side":"sell"},
        //         {"time":"2020-12-19T12:17:13.000Z","date":1608380233,"id":23903604,"price":25140000,"amount":0.019,"side":"sell"},
        //         {"time":"2020-12-19T12:16:49.000Z","date":1608380209,"id":23903599,"price":25140000,"amount":0.0072,"side":"sell"},
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1606780800000, // timestamp
        //         21293000,      // low
        //         21300000,      // high
        //         21294000,      // open
        //         21300000,      // close
        //         1.019126,      // volume
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        limit = (limit === undefined) ? 1024 : limit; // default 1024
        const request = {
            'tradingPair': market['id'],
            // 'start': since,
            // 'end': this.milliseconds (),
            'interval': this.timeframes[timeframe],
        };
        const duration = this.parseTimeframe (timeframe);
        if (since === undefined) {
            const end = this.milliseconds ();
            request['end'] = end;
            request['start'] = end - limit * duration * 1000;
        } else {
            request['start'] = since;
            request['end'] = this.sum (since, limit * duration * 1000);
        }
        const response = await this.publicGetTradingPairsTradingPairCandles (this.extend (request, params));
        //
        //     [
        //         [1606780800000,21293000,21300000,21294000,21300000,1.019126],
        //         [1606780860000,21237000,21293000,21293000,21263000,0.96800057],
        //         [1606780920000,21240000,21240000,21240000,21240000,0.11068715],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseBalanceResponse (response) {
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString2 (balance, 'asset', 'isoAlpha3');
            const code = this.safeCurrencyCode (currencyId);
            const hold = this.safeString (balance, 'hold');
            const pendingWithdrawal = this.safeString (balance, 'pendingWithdrawal');
            const account = this.account ();
            account['free'] = this.safeString (balance, 'avail');
            account['used'] = Precise.stringAdd (hold, pendingWithdrawal);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalances (params);
        //
        //     [
        //         {
        //             "asset": "KRW",                   // asset name
        //             "avail": 1759466.76,              // available amount to place order
        //             "hold": 16500,                    // outstanding amount on order books
        //             "pendingWithdrawal": 0,           // amount being withdrawn
        //             "lastUpdatedAt": "1600684352032", // balance last update time
        //         },
        //     ]
        //
        return this.parseBalanceResponse (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            'placed': 'open',
            'cancelled': 'canceled',
            'completed': 'closed',
            'updated': 'open',
            'reserved': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // cancelOrder
        //
        //     {} // empty object
        //
        // fetchOrder, fetchOrders, fetchOpenOrders, createOrder
        //
        //     {
        //         "id": "453324",                          // order ID
        //         "clientOrderId": "zeckrw23456",          // client order ID (showed only when it exists)
        //         "status": "updated",                     // placed, cancelled, completed, updated, reserved
        //         "forcedCompletionReason": undefined,     // the reason in case it was canceled in the middle (protection or timeInForce)
        //         "tradingPairName": "ZEC-KRW",            // order book
        //         "side": "buy",                           // buy, sell
        //         "type": "limit",                         // limit, market
        //         "price": 1000000,                        // price
        //         "stopPrice": undefined,                  // stop price (showed only for stop orders)
        //         "amount": 4,                             // initial amount
        //         "remaining": 1,                          // outstanding amount
        //         "protection": "yes",                     // whether protection is activated (yes or no)
        //         "timeInForce": "gtc",                    // limit order's time in force (gtc/po/ioc/fok)
        //         "createdAt": "2020-09-25T04:06:20.000Z", // order placement time
        //         "updatedAt": "2020-09-25T04:06:29.000Z", // order last update time
        //         "balanceChange": {
        //             "baseGross": 3,                      // base asset balance's gross change (in ZEC for this case)
        //             "baseFee": {
        //                 "taking": 0,                     // base asset fee imposed as taker
        //                 "making": -0.0012                // base asset fee imposed as maker
        //             },
        //             "baseNet": 2.9988,                   // base asset balance's net change (in ZEC for this case)
        //             "quoteGross": -3000000,              // quote asset balance's gross change (in KRW for
        //             "quoteFee": {
        //                 "taking": 0,                     // quote asset fee imposed as taker
        //                 "making": 0                      // quote asset fee imposed as maker
        //             },
        //             "quoteNet": -3000000                 // quote asset balance's net change (in KRW for this case)
        //         }
        //     }
        //
        const id = this.safeString (order, 'id');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const timestamp = this.parse8601 (this.safeString (order, 'createdAt'));
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const timeInForce = this.safeStringUpper (order, 'timeInForce');
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'amount');
        const stopPrice = this.safeNumber (order, 'stopPrice');
        const remaining = this.safeNumber (order, 'remaining');
        const marketId = this.safeString (order, 'tradingPairName');
        market = this.safeMarket (marketId, market, '-');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const balanceChange = this.safeValue (order, 'balanceChange', {});
        const filled = this.safeNumber (balanceChange, 'baseNet');
        let cost = this.safeNumber (balanceChange, 'quoteNet');
        if (cost !== undefined) {
            cost = Math.abs (cost);
        }
        let updated = undefined;
        if ((filled !== undefined) && (filled > 0)) {
            updated = this.parse8601 (this.safeString (order, 'updatedAt'));
        }
        let fee = undefined;
        if (side === 'buy') {
            const baseFee = this.safeValue (balanceChange, 'baseFee', {});
            const taking = this.safeNumber (baseFee, 'taking');
            const making = this.safeNumber (baseFee, 'making');
            fee = {
                'currency': market['base'],
                'cost': this.sum (taking, making),
            };
        } else {
            const quoteFee = this.safeValue (balanceChange, 'quoteFee', {});
            const taking = this.safeNumber (quoteFee, 'taking');
            const making = this.safeNumber (quoteFee, 'making');
            fee = {
                'currency': market['quote'],
                'cost': this.sum (taking, making),
            };
        }
        let postOnly = undefined;
        if (timeInForce !== undefined) {
            postOnly = (timeInForce === 'PO');
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': updated,
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': undefined,
            'fee': fee,
            'info': order,
        });
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let method = undefined;
        const clientOrderId = this.safeString (params, 'clientOrderId');
        params = this.omit (params, 'clientOrderId');
        const request = {};
        if (clientOrderId === undefined) {
            method = 'privateGetOrdersOrderId';
            request['orderId'] = id;
        } else {
            method = 'privateGetOrdersClientOrderIdClientOrderId';
            request['clientOrderId'] = clientOrderId;
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "id": "453324",                          // order ID
        //         "clientOrderId": "zeckrw23456",          // client order ID (showed only when it exists)
        //         "status": "updated",                     // placed, cancelled, completed, updated, reserved
        //         "forcedCompletionReason": undefined,     // the reason in case it was canceled in the middle (protection or timeInForce)
        //         "tradingPairName": "ZEC-KRW",            // order book
        //         "side": "buy",                           // buy, sell
        //         "type": "limit",                         // limit, market
        //         "price": 1000000,                        // price
        //         "stopPrice": undefined,                  // stop price (showed only for stop orders)
        //         "amount": 4,                             // initial amount
        //         "remaining": 1,                          // outstanding amount
        //         "protection": "yes",                     // whether protection is activated (yes or no)
        //         "timeInForce": "gtc",                    // limit order's time in force (gtc/po/ioc/fok)
        //         "createdAt": "2020-09-25T04:06:20.000Z", // order placement time
        //         "updatedAt": "2020-09-25T04:06:29.000Z", // order last update time
        //         "balanceChange": {
        //             "baseGross": 3,                      // base asset balance's gross change (in ZEC for this case)
        //             "baseFee": {
        //                 "taking": 0,                     // base asset fee imposed as taker
        //                 "making": -0.0012                // base asset fee imposed as maker
        //             },
        //             "baseNet": 2.9988,                   // base asset balance's net change (in ZEC for this case)
        //             "quoteGross": -3000000,              // quote asset balance's gross change (in KRW for
        //             "quoteFee": {
        //                 "taking": 0,                     // quote asset fee imposed as taker
        //                 "making": 0                      // quote asset fee imposed as maker
        //             },
        //             "quoteNet": -3000000                 // quote asset balance's net change (in KRW for this case)
        //         }
        //     }
        //
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'includePast': 'true', // if true, completed and canceled orders are included as the result, they are accessible for one hour only from its completion or cancellation time
            // 'pagination': 'false', // if the result is more than 3,000 orders, set this value as true to access 1000 orders at max per each page
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "453324",                          // order ID
        //             "clientOrderId": "zeckrw23456",          // client order ID (showed only when it exists)
        //             "status": "updated",                     // placed, cancelled, completed, updated, reserved
        //             "forcedCompletionReason": undefined,     // the reason in case it was canceled in the middle (protection or timeInForce)
        //             "tradingPairName": "ZEC-KRW",            // order book
        //             "side": "buy",                           // buy, sell
        //             "type": "limit",                         // limit, market
        //             "price": 1000000,                        // price
        //             "stopPrice": undefined,                  // stop price (showed only for stop orders)
        //             "amount": 4,                             // initial amount
        //             "remaining": 1,                          // outstanding amount
        //             "protection": "yes",                     // whether protection is activated (yes or no)
        //             "timeInForce": "gtc",                    // limit order's time in force (gtc/po/ioc/fok)
        //             "createdAt": "2020-09-25T04:06:20.000Z", // order placement time
        //             "updatedAt": "2020-09-25T04:06:29.000Z", // order last update time
        //             "balanceChange": {
        //                 "baseGross": 3,                      // base asset balance's gross change (in ZEC for this case)
        //                 "baseFee": {
        //                     "taking": 0,                     // base asset fee imposed as taker
        //                     "making": -0.0012                // base asset fee imposed as maker
        //                 },
        //                 "baseNet": 2.9988,                   // base asset balance's net change (in ZEC for this case)
        //                 "quoteGross": -3000000,              // quote asset balance's gross change (in KRW for
        //                 "quoteFee": {
        //                     "taking": 0,                     // quote asset fee imposed as taker
        //                     "making": 0                      // quote asset fee imposed as maker
        //                 },
        //                 "quoteNet": -3000000                 // quote asset balance's net change (in KRW for this case)
        //             }
        //         },
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'includePast': 'false',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'clientOrderId': 'test4321', // max 20 characters of [a-zA-Z0-9_-]
            'tradingPairName': market['id'],
            'side': side, // buy, sell
            'type': type, // limit, market
            // 'price': this.priceToPrecision (symbol, price),
            // 'stopPrice': this.priceToPrecision (symbol, stopPrice), // optional, becomes a stop order if set
            // 'amount': this.amountToPrecision (symbol, amount),
            // 'protection': 'no', // whether protection is activated
            // 'timeInForce': 'gtc', // gtc, po, ioc, fok
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
            request['amount'] = this.amountToPrecision (symbol, amount);
        } else if (type === 'market') {
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                let total = amount;
                const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                if (createMarketBuyOrderRequiresPrice) {
                    if (price === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument");
                    }
                    total = price * amount;
                }
                const precision = market['precision']['price'];
                request['amount'] = this.decimalToPrecision (total, TRUNCATE, precision, this.precisionMode);
            } else {
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        const stopPrice = this.safeNumber (params, 'stopPrice');
        if (stopPrice !== undefined) {
            request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            params = this.omit (params, 'stopPrice');
        }
        const timeInForce = this.safeStringLower (params, 'timeInForce');
        if (timeInForce !== undefined) {
            request['timeInForce'] = timeInForce;
            params = this.omit (params, 'timeInForce');
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        //
        //     {
        //         "id": "453327",                          // order ID
        //         "clientOrderId": "test4321",             // client order ID (showed only when it exists)
        //         "status": "reserved",                    // placed, cancelled, completed, updated, reserved
        //         "forcedCompletionReason": undefined,     // the reason in case it was canceled in the middle (protection or timeInForce)
        //         "tradingPairName": "BCH-KRW",            // order book
        //         "side": "sell",                          // buy, sell
        //         "type": "limit",                         // limit, market
        //         "price": 11000000,                       // price
        //         "stopPrice": 12000000,                   // stop price (showed only for stop orders)
        //         "amount": 0.5,                           // initial amount
        //         "remaining": 0.5,                        // outstanding amount
        //         "protection": "no",                      // whether protection is activated (yes or no)
        //         "timeInForce": "gtc",                    // limit order's time in force (gtc/po/ioc/fok)
        //         "createdAt": "2020-09-25T04:51:31.000Z", // order placement time
        //         "balanceChange": {
        //             "baseGross": 0,                      // base asset balance's gross change (in BCH for this case)
        //             "baseFee": {
        //                 "taking": 0,                     // base asset fee imposed as taker
        //                 "making": 0                      // base asset fee imposed as maker
        //             },
        //             "baseNet": 0,                        // base asset balance's net change (in BCH for this case)
        //             "quoteGross": 0,                     // quote asset balance's gross change (in KRW for
        //             "quoteFee": {
        //                 "taking": 0,                     // quote asset fee imposed as taker
        //                 "making": 0                      // quote asset fee imposed as maker
        //             },
        //             "quoteNet": 0                        // quote asset balance's net change (in KRW for this case)
        //         }
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const clientOrderId = this.safeString (params, 'clientOrderId');
        let method = undefined;
        if (clientOrderId === undefined) {
            method = 'privateDeleteOrdersOrderId';
            request['orderId'] = id;
        } else {
            method = 'privateDeleteOrdersClientOrderIdClientOrderId';
            request['clientOrderId'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {}
        //
        const order = this.parseOrder (response);
        return this.extend (order, { 'id': id });
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'limit': limit, // max 100
            // 'pastmax': id, // read data older than this id
            // 'latestmin': id, // read data newer than this id
            // 'after': parseInt (since / 1000), // Read data after this timestamp in seconds
            // 'before': this.seconds (), // Read data before this timestamp in seconds
            'deepSearch': 'true', // read data older than one month ago are inclusively looked up only when it is "true"
        };
        if (since !== undefined) {
            request['after'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 73953,                             // trading event ID
        //             "orderId": 453324,                       // order ID
        //             "baseAmount": 3,                         // traded base asset amount
        //             "quoteAmount": 3000000,                  // traded quote asset amount
        //             "fee": 0.0012,                           // fee
        //             "price": 1000000,                        // price
        //             "timestamp": "2020-09-25T04:06:30.000Z", // trading time
        //             "side": "buy",                           // buy, sell
        //             "tradingPairName": "ZEC-KRW",            // order book
        //             "position": "maker"                      // maker, taker
        //         },
        //     ]
        //
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseTrades (response, market, since, limit);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         "asset": "BTC",                                  // asset name
        //         "address": "1CwC2cMFu1jRQUBtw925cENbT1kctJBMdm", // deposit address
        //         "memoId": null,                                  // memo ID (showed only for assets using memo ID)
        //         "createdAt": 1594802312                          // deposit address creation time
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString (depositAddress, 'memoId');
        const currencyId = this.safeString (depositAddress, 'asset');
        const code = this.safeCurrencyCode (currencyId);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': depositAddress,
        };
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetCryptoDepositAddresses (params);
        //
        //     [
        //         {
        //             "asset": "BTC",                                  // asset name
        //             "address": "1CwC2cMFu1jRQUBtw925cENbT1kctJBMdm", // deposit address
        //             "memoId": null,                                  // memo ID (showed only for assets using memo ID)
        //             "createdAt": 1594802312                          // deposit address creation time
        //         },
        //     ]
        //
        return this.parseDepositAddresses (response, codes);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const response = await this.fetchDepositAddresses (undefined, params);
        const address = this.safeValue (response, code);
        if (address === undefined) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress() ' + code + ' address not found');
        }
        return address;
    }

    parseTransactionStatus (status) {
        const statuses = {
            'reviewing': 'pending',
            'rejected': 'rejected',
            'processing': 'pending',
            'failed': 'failed',
            'completed': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         "id": 640,                     // deposit/withdrawal event ID
        //         "asset": "BTC",                // asset name
        //         "type": "crypto_withdrawal",   // fiat_withdrawal, fiat_deposit, crypto_withdrawal, crypto_deposit
        //         "netAmount": 0.0001,           // amount
        //         "feeAmount": 0.0005,           // fee (null if there is no imposed fee)
        //         "status": "completed",         // reviewing, rejected, processing, failed, completed
        //         "reviewStartedAt": 1595556218, // request time
        //         "completedAt": 1595556902,     // completion time (showed only in case of completed)
        //         "txId": "eaca5ad3...",         // tx ID
        //         "sourceAddress": null,         // sender address (showed only in case of crypto_deposit)
        //         "destinationAddress: "3H8...", // recipient address (showed only in case of crypto_withdrawal)
        //         "destinationMemoId": null      // recipient address's memo ID
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'txId');
        const currencyId = this.safeString (transaction, 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        let type = this.safeString (transaction, 'type');
        if ((type === 'crypto_withdrawal') || (type === 'fiat_withdrawal')) {
            type = 'withdrawal';
        } else if ((type === 'crypto_deposit' || type === 'fiat_deposit')) {
            type = 'deposit';
        }
        const amount = this.safeNumber (transaction, 'netAmount');
        const feeCost = this.safeNumber (transaction, 'feeAmount');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        const timestamp = this.safeTimestamp (transaction, 'reviewStartedAt');
        const updated = this.safeTimestamp (transaction, 'completedAt');
        const addressFrom = this.safeString (transaction, 'sourceAddress');
        const addressTo = this.safeString (transaction, 'destinationAddress');
        const tagFrom = this.safeString (transaction, 'sourceMemoId');
        const tagTo = this.safeString (transaction, 'destinationMemoId');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': addressFrom,
            'address': addressTo,
            'addressTo': addressTo,
            'tagFrom': tagFrom,
            'tag': tagTo,
            'tagTo': tagTo,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'comment': undefined,
            'fee': fee,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'limit': limit, // max 20
            // 'latestmin': limit, // read data older than this id
            // 'after': this.milliseconds (),
            // 'before': since,
            // 'completedOnly': 'no',
        };
        if (since !== undefined) {
            request['before'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetDepositWithdrawalStatus (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 640,                     // deposit/withdrawal event ID
        //             "asset": "BTC",                // asset name
        //             "type": "crypto_withdrawal",   // fiat_withdrawal, fiat_deposit, crypto_withdrawal, crypto_deposit
        //             "netAmount": 0.0001,           // amount
        //             "feeAmount": 0.0005,           // fee (null if there is no imposed fee)
        //             "status": "completed",         // reviewing, rejected, processing, failed, completed
        //             "reviewStartedAt": 1595556218, // request time
        //             "completedAt": 1595556902,     // completion time (showed only in case of completed)
        //             "txId": "eaca5ad3...",         // tx ID
        //             "sourceAddress": null,         // sender address (showed only in case of crypto_deposit)
        //             "destinationAddress: "3H8...", // recipient address (showed only in case of crypto_withdrawal)
        //             "destinationMemoId": null      // recipient address's memo ID
        //         },
        //     ]
        //
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (response, currency, since, limit, params);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) { // for authentication in private API calls
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.implodeHostname (this.urls['api'][api]) + endpoint;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ().toString ();
            let auth = 't' + timestamp + method + endpoint;
            headers = {
                'api-key': this.apiKey,
                'timestamp': timestamp,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = this.json (params);
                auth += body;
            } else if (endpoint === '/orders') {
                if (Object.keys (query).length) {
                    const urlQuery = '?' + this.urlencode (query);
                    auth += urlQuery;
                    url += urlQuery;
                }
            } else if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
            const rawSecret = this.base64ToBinary (this.secret);
            const signature = this.hmac (this.encode (auth), rawSecret, 'sha512', 'base64');
            headers['signature'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {"errorMessage":"Invalid API key","errorCode":10155}
        //
        if (!Array.isArray (response)) {
            const errorCode = this.safeString (response, 'errorCode');
            const errorMessage = this.safeString (response, 'errorMessage');
            const feedback = this.id + ' ' + body;
            if (errorMessage !== undefined) {
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            }
            if (errorCode !== undefined) {
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            }
            if ((errorCode !== undefined) || (errorMessage !== undefined)) {
                throw new ExchangeError (feedback);
            }
        }
    }
};
