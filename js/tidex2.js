'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError } = require ('./base/errors');

module.exports = class tidex2 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tidex2',
            'name': 'Tidex',
            'countries': [ 'UK' ],
            'rateLimit': 2000,
            'version': '3',
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createMarketOrder': undefined,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCurrencies': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedPositions': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg',
                'api': {
                    'web': 'https://gate.tidex.com/api',
                    'public': 'https://api.tidex.com/api/v1/public',
                    'private': 'https://api.tidex.com/api/v1',
                },
                'www': 'https://tidex.com',
                'doc': 'https://gitlab.com/tidex/api/-/blob/main/tidex_doc.md',
                'referral': 'https://tidex.com/exchange/?ref=57f5638d9cd7',
                'fees': [
                    'https://tidex.com/fee-schedule',
                ],
            },
            'timeframes': {
                '15s': '15',
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '1h': '3600',
                '4h': '14400',
                '1d': '86400',
                '3d': '259200',
                '1w': '604800',
            },
            'api': {
                'web': {
                    'get': [
                        'currency',
                    ],
                },
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'ticker',
                        'book',
                        'history/result',
                        'symbols',
                        'depth/result',
                        'kline',
                    ],
                },
                'private': {
                    'post': [
                        'account/balances',
                        'account/balance',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.002'),
                    'maker': this.parseNumber ('0.002'),
                },
            },
            'commonCurrencies': {
                'DSH': 'DASH',
                'EMGO': 'MGO',
                'MGO': 'WMGO',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                    'Api key header is missing!': AuthenticationError, // {"code":0,"success":false,"message":"Api key header is missing!","result":[]}
                },
            },
            'options': {
                'fetchTickersMaxLength': 1000,
            },
            'orders': {}, // orders cache / emulation
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.webGetCurrency (params);
        //
        //     [
        //         {
        //             "id":2,
        //             "symbol":"BTC",
        //             "type":2,
        //             "name":"Bitcoin",
        //             "amountPoint":8,
        //             "depositEnable":true,
        //             "depositMinAmount":0.0005,
        //             "withdrawEnable":true,
        //             "withdrawFee":0.0004,
        //             "withdrawMinAmount":0.0005,
        //             "settings":{
        //                 "Blockchain":"https://blockchair.com/bitcoin/",
        //                 "TxUrl":"https://blockchair.com/bitcoin/transaction/{0}",
        //                 "AddrUrl":"https://blockchair.com/bitcoin/address/{0}",
        //                 "ConfirmationCount":3,
        //                 "NeedMemo":false,
        //                 "ManuallyWithdraw":false
        //             },
        //             "visible":true,
        //             "isDelisted":false
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const precision = this.safeInteger (currency, 'amountPoint');
            const code = this.safeCurrencyCode (id);
            const active = this.safeValue (currency, 'visible');
            const withdrawEnable = this.safeValue (currency, 'withdrawEnable');
            const depositEnable = this.safeValue (currency, 'depositEnable');
            const name = this.safeString (currency, 'name');
            const fee = this.safeNumber (currency, 'withdrawFee');
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': active,
                'deposit': depositEnable,
                'withdraw': withdrawEnable,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'withdrawMinAmount'),
                        'max': undefined,
                    },
                    'deposit': {
                        'min': this.safeNumber (currency, 'depositMinAmount'),
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
                'fee': fee,
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        const markets = this.safeValue (response, 'result');
        //
        //     {
        //         "code":200,
        //         "success":true,
        //         "message":"",
        //         "result":[
        //             {
        //                 "name":"BCH_BTC",
        //                 "moneyPrec":8,
        //                 "stock":"BCH",
        //                 "money":"BTC",
        //                 "stockPrec":8,
        //                 "feePrec":8,
        //                 "minAmount":"0.001"
        //             }
        //         ]
        //     }
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const precision = {
                'amount': undefined,
                'price': this.safeInteger (market, 'moneyPrec'),
            };
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
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': precision,
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minAmount'),
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

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //     {
        //         "name":"YFI_USDT",
        //         "bid":"21607.842223",
        //         "ask":"21635.50514299",
        //         "open":"21530.31",
        //         "high":"22619.38",
        //         "low":"21193.59",
        //         "last":"21644.23",
        //         "volume":"188.4555124",
        //         "deal":"4075612.142786252",
        //         "change":"1"
        //     }
        //
        // fetchTickers
        //     {
        //         "at":1646289676,
        //         "ticker":{
        //             "name":"yfi_usdt",
        //             "bid":"21937.47155034",
        //             "ask":"21966.13380147",
        //             "open":"21449.08",
        //             "high":"22619.38",
        //             "low":"21193.59",
        //             "last":"21968.03",
        //             "vol":"188.4452385",
        //             "deal":"4075398.065557751",
        //             "change":"2"
        //         }
        //     }
        //
        const timestamp = this.safeTimestamp (ticker, 'at');
        if (timestamp !== undefined) {
            ticker = this.safeValue (ticker, 'ticker');
        }
        const marketId = this.safeStringUpper (ticker, 'name');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'last');
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
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeString (ticker, 'avg'),
            'baseVolume': this.safeString (ticker, 'vol_cur'),
            'quoteVolume': this.safeString (ticker, 'vol'),
            'info': ticker,
        }, market, false);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const result = this.safeValue (response, 'result');
        //
        //     {
        //         "code":200,
        //         "success":true,
        //         "message":"",
        //         "result":{
        //             "YFI_USDT":{
        //                 "at":1646289676,
        //                 "ticker":{
        //                     "name":"yfi_usdt",
        //                     "bid":"21937.47155034",
        //                     "ask":"21966.13380147",
        //                     "open":"21449.08",
        //                     "high":"22619.38",
        //                     "low":"21193.59",
        //                     "last":"21968.03",
        //                     "vol":"188.4452385",
        //                     "deal":"4075398.065557751",
        //                     "change":"2"
        //                 }
        //             }
        //         }
        //     }
        //
        return this.parseTickers (result, symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        //
        //     {
        //         "code":200,
        //         "success":true,
        //         "message":"",
        //         "result":{
        //             "name":"YFI_USDT",
        //             "bid":"21607.842223",
        //             "ask":"21635.50514299",
        //             "open":"21530.31",
        //             "high":"22619.38",
        //             "low":"21193.59",
        //             "last":"21644.23",
        //             "volume":"188.4555124",
        //             "deal":"4075612.142786252",
        //             "change":"1"
        //         }
        //     }
        //
        return this.parseTicker (result, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 1, max = 100
        }
        const response = await this.publicGetDepthResult (this.extend (request, params));
        //
        //     {
        //         "asks":[
        //             ["22064.13194312","0.25742"],
        //         ],
        //         "bids":[
        //             ["22017.12205596","0.11"],
        //         ]
        //     }
        //
        return this.parseOrderBook (response, symbol);
    }

    parseTrade (trade, market = undefined) {
        // fetchTrades
        //     {
        //         "tid":135762344,
        //         "date":1646294384,
        //         "price":"21991.91",
        //         "type":"buy",
        //         "amount":"0.0024",
        //         "total":"52.780584"
        //     }
        //
        const timestamp = this.safeTimestamp (trade, 'date');
        const side = this.safeString (trade, 'type');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        const id = this.safeString (trade, 'tid');
        const symbol = this.safeSymbol (undefined, market);
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (since === undefined) {
            since = 1;
        }
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'since': since, // Min 1; Market History Since Selected tid
        };
        if (limit !== undefined) {
            request['limit'] = limit; // Default 50; min 1; max 1000
        }
        const response = await this.publicGetHistoryResult (this.extend (request, params));
        //
        //     [
        //         {
        //             "tid":135762344,
        //             "date":1646294384,
        //             "price":"21991.91",
        //             "type":"buy",
        //             "amount":"0.0024",
        //             "total":"52.780584"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "time":1646205840,
        //         "open":"21290.48",
        //         "close":"21290.48",
        //         "highest":"21290.48",
        //         "lowest":"21290.48",
        //         "volume":"0",
        //         "amount":"0",
        //         "market":"YFI_USDT"
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'highest'),
            this.safeNumber (ohlcv, 'lowest'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'interval': this.timeframes[timeframe],
            'market': market['id'],
        };
        limit = (limit === undefined) ? 1501 : limit;
        if (since === undefined) {
            request['end'] = this.seconds ();
            request['start'] = request['end'] - limit * this.parseTimeframe (timeframe);
        } else {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.sum (request['start'], limit * this.parseTimeframe (timeframe));
        }
        const response = await this.publicGetKline (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const kline = this.safeValue (result, 'kline', []);
        //
        //     {
        //         "code":200,
        //         "success":true,
        //         "message":"",
        //         "result":{
        //             "market":"YFI_USDT",
        //             "start":1646205797,
        //             "end":1646295857,
        //             "interval":60,
        //             "kline":[
        //                 {
        //                     "time":1646205840,
        //                     "open":"21290.48",
        //                     "close":"21290.48",
        //                     "highest":"21290.48",
        //                     "lowest":"21290.48",
        //                     "volume":"0",
        //                     "amount":"0",
        //                     "market":"YFI_USDT"
        //                 }
        //             ]
        //         }
        //     }
        //
        return this.parseOHLCVs (kline, market, timeframe, since, limit);
    }

    parseBalance (response) {
        const balances = this.safeValue (response, 'return');
        const timestamp = this.safeTimestamp (balances, 'server_time');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const funds = this.safeValue (balances, 'funds', {});
        const currencyIds = Object.keys (funds);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (funds, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeString (balance, 'value');
            account['used'] = this.safeString (balance, 'inOrders');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostAccountBalances (params);
        //
        //     {
        //         "success":1,
        //         "return":{
        //             "funds":{
        //                 "btc":{"value":0.0000499885629956,"inOrders":0.0},
        //                 "eth":{"value":0.000000030741708,"inOrders":0.0},
        //                 "tdx":{"value":0.0000000155385356,"inOrders":0.0}
        //             },
        //             "rights":{
        //                 "info":true,
        //                 "trade":true,
        //                 "withdraw":false
        //             },
        //             "transaction_count":0,
        //             "open_orders":0,
        //             "server_time":1619436907
        //         },
        //         "stat":{
        //             "isSuccess":true,
        //             "serverTime":"00:00:00.0001157",
        //             "time":"00:00:00.0101364",
        //             "errors":null
        //         }
        //     }
        //
        return this.parseBalance (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        const amountString = amount.toString ();
        const priceString = price.toString ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': side,
            'amount': this.amountToPrecision (symbol, amount),
            'rate': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostTrade (this.extend (request, params));
        let id = undefined;
        let status = 'open';
        let filledString = '0.0';
        let remainingString = amountString;
        const returnResult = this.safeValue (response, 'return');
        if (returnResult !== undefined) {
            id = this.safeString (returnResult, 'order_id');
            if (id === '0') {
                id = this.safeString (returnResult, 'init_order_id');
                status = 'closed';
            }
            filledString = this.safeString (returnResult, 'received', filledString);
            remainingString = this.safeString (returnResult, 'remains', amountString);
        }
        const timestamp = this.milliseconds ();
        return this.safeOrder ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': priceString,
            'cost': undefined,
            'amount': amountString,
            'remaining': remainingString,
            'filled': filledString,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
            'info': response,
            'clientOrderId': undefined,
            'average': undefined,
            'trades': undefined,
        }, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': parseInt (id),
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'closed',
            '2': 'canceled',
            '3': 'canceled', // or partially-filled and still open? https://github.com/ccxt/ccxt/issues/1594
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'id');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timestamp = this.safeTimestamp (order, 'timestamp_created');
        const marketId = this.safeString (order, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        let remaining = undefined;
        let amount = undefined;
        const price = this.safeString (order, 'rate');
        if ('start_amount' in order) {
            amount = this.safeString (order, 'start_amount');
            remaining = this.safeString (order, 'amount');
        } else {
            remaining = this.safeString (order, 'amount');
        }
        const fee = undefined;
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString (order, 'type'),
            'price': price,
            'stopPrice': undefined,
            'cost': undefined,
            'amount': amount,
            'remaining': remaining,
            'filled': undefined,
            'status': status,
            'fee': fee,
            'average': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': parseInt (id),
        };
        const response = await this.privatePostOrderInfo (this.extend (request, params));
        id = id.toString ();
        const result = this.safeValue (response, 'return', {});
        const order = this.safeValue (result, id);
        return this.parseOrder (this.extend ({ 'id': id }, order));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privatePostActiveOrders (this.extend (request, params));
        //
        //     {
        //         "success":1,
        //         "return":{
        //             "1255468911":{
        //                 "status":0,
        //                 "pair":"spike_usdt",
        //                 "type":"sell",
        //                 "amount":35028.44256388,
        //                 "rate":0.00199989,
        //                 "timestamp_created":1602684432
        //             }
        //         },
        //         "stat":{
        //             "isSuccess":true,
        //             "serverTime":"00:00:00.0000826",
        //             "time":"00:00:00.0091423",
        //             "errors":null
        //         }
        //     }
        //
        // it can only return 'open' orders (i.e. no way to fetch 'closed' orders)
        const orders = this.safeValue (response, 'return', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        // some derived classes use camelcase notation for request fields
        const request = {
            // 'from': 123456789, // trade ID, from which the display starts numerical 0 (test result: liqui ignores this field)
            // 'count': 1000, // the number of trades for display numerical, default = 1000
            // 'from_id': trade ID, from which the display starts numerical 0
            // 'end_id': trade ID on which the display ends numerical ∞
            // 'order': 'ASC', // sorting, default = DESC (test result: liqui ignores this field, most recent trade always goes last)
            // 'since': 1234567890, // UTC start time, default = 0 (test result: liqui ignores this field)
            // 'end': 1234567890, // UTC end time, default = ∞ (test result: liqui ignores this field)
            // 'pair': 'eth_btc', // default = all markets
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['count'] = parseInt (limit);
        }
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        const response = await this.privatePostTradeHistory (this.extend (request, params));
        const trades = this.safeValue (response, 'return', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset': currency['id'],
            'amount': parseFloat (amount),
            'address': address,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = await this.privatePostCreateWithdraw (this.extend (request, params));
        //
        //     {
        //         "success":1,
        //         "return":{
        //             "withdraw_id":1111,
        //             "withdraw_info":{
        //                 "id":1111,
        //                 "asset_id":1,
        //                 "asset":"BTC",
        //                 "amount":0.0093,
        //                 "fee":0.0007,
        //                 "create_time":1575128018,
        //                 "status":"Created",
        //                 "data":{
        //                     "address":"1KFHE7w8BhaENAswwryaoccDb6qcT6DbYY",
        //                     "memo":"memo",
        //                     "tx":null,
        //                     "error":null
        //                 },
        //             "in_blockchain":false
        //             }
        //         }
        //     }
        //
        const result = this.safeValue (response, 'return', {});
        return {
            'info': response,
            'id': this.safeString (result, 'withdraw_id'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        const query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'nonce': nonce,
                'request': path,
            }, query));
            const signature = this.hmac (this.encode (body), this.encode (this.secret), 'sha512');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': signature,
            };
        } else if (api === 'public') {
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            url += '/' + this.implodeParams (path, params);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    headers = {
                        'Content-Type': 'application/json',
                    };
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('success' in response) {
            //
            // 1 - The exchange only returns the integer 'success' key from their private API
            //
            //     { "success": 1, ... } httpCode === 200
            //     { "success": 0, ... } httpCode === 200
            //
            // 2 - However, derived exchanges can return non-integers
            //
            //     It can be a numeric string
            //     { "sucesss": "1", ... }
            //     { "sucesss": "0", ... }, httpCode >= 200 (can be 403, 502, etc)
            //
            //     Or just a string
            //     { "success": "true", ... }
            //     { "success": "false", ... }, httpCode >= 200
            //
            //     Or a boolean
            //     { "success": true, ... }
            //     { "success": false, ... }, httpCode >= 200
            //
            // 3 - Oversimplified, Python PEP8 forbids comparison operator (===) of different types
            //
            // 4 - We do not want to copy-paste and duplicate the code of this handler to other exchanges derived from Liqui
            //
            // To cover points 1, 2, 3 and 4 combined this handler should work like this:
            //
            let success = this.safeValue (response, 'success', false);
            if (typeof success === 'string') {
                if ((success === 'true') || (success === '1')) {
                    success = true;
                } else {
                    success = false;
                }
            }
            if (!success) {
                const code = this.safeString (response, 'code');
                const message = this.safeString (response, 'message');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
