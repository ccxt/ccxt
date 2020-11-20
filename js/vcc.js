'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, OrderNotFound, InvalidOrder, BadRequest, AuthenticationError, RateLimitExceeded, RequestTimeout } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class vcc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'vcc',
            'name': 'VCC Exchange',
            'countries': [ 'VN' ], // Vietnam
            'rateLimit': 1000,
            'version': 'v3',
            'has': {
                'cancelOrder': true,
                'createOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchTicker': 'emulated',
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '60000',
                '5m': '300000',
                '15m': '900000',
                '30m': '1800000',
                '1h': '3600000',
                '2h': '7200000',
                '4h': '14400000',
                '6h': '21600000',
                '12h': '43200000',
                '1d': '86400000',
                '1w': '604800000',
            },
            'urls': {
                'logo': 'https://vcc.exchange/images/home-page/branding/logo-header.svg',
                'api': {
                    'public': 'https://api.vcc.exchange',
                    'private': 'https://api.vcc.exchange',
                },
                'www': 'https://vcc.exchange',
                'doc': [
                    'https://vcc.exchange/api',
                ],
                'fees': 'https://support.vcc.exchange/hc/en-us/articles/360016401754',
                'referral': 'https://vcc.exchange?ref=l4xhrH',
            },
            'api': {
                'public': {
                    'get': [
                        'summary',
                        'exchange_info',
                        'assets', // Available Currencies
                        'ticker', // Ticker list for all symbols
                        'trades/{market_pair}', // Recent trades
                        'orderbook/{market_pair}', // Orderbook
                        'chart/bars', // Candles
                        'tick_sizes',
                    ],
                },
                'private': {
                    'get': [
                        'user',
                        'balance', // Get trading balance
                        'orders/{order_id}', // Get a single order by order_id
                        'orders/open', // Get open orders
                        'orders', // Get closed orders
                        'orders/trades', // Get trades history
                        'deposit-address', // Generate or get deposit address
                        'transactions', // Get deposit/withdrawal history
                    ],
                    'post': [
                        'orders', // Create new order
                    ],
                    'put': [
                        'orders/{order_id}/cancel', // Cancel order
                        'orders/cancel-by-type',
                        'orders/cancel-all',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'exceptions': {
                'exact': {},
                'broad': {
                    'Unauthenticated': AuthenticationError, // {"message":"Unauthenticated."} // wrong api key
                    'signature is invalid': AuthenticationError, // {"message":"The given data was invalid.","errors":{"signature":["HMAC signature is invalid"]}}
                    'Timeout': RequestTimeout, // {"code":504,"message":"Gateway Timeout","description":""}
                    'Too many requests': RateLimitExceeded, // {"code":429,"message":"Too many requests","description":"Too many requests"}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetExchangeInfo (params);
        //
        //     {
        //         "message":null,
        //         "dataVersion":"4677e56a42f0c29872f3a6e75f5d39d2f07c748c",
        //         "data":{
        //             "timezone":"UTC",
        //             "serverTime":1605821914333,
        //             "symbols":[
        //                 {
        //                     "id":"btcvnd",
        //                     "symbol":"BTC\/VND",
        //                     "coin":"btc",
        //                     "currency":"vnd",
        //                     "baseId":1,
        //                     "quoteId":0,
        //                     "active":true,
        //                     "base_precision":"0.0000010000",
        //                     "quote_precision":"1.0000000000",
        //                     "minimum_quantity":"0.0000010000",
        //                     "minimum_amount":"250000.0000000000",
        //                     "precision":{"price":0,"amount":6,"cost":6},
        //                     "limits":{
        //                         "amount":{"min":"0.0000010000"},
        //                         "price":{"min":"1.0000000000"},
        //                         "cost":{"min":"250000.0000000000"},
        //                     },
        //                 },
        //             ],
        //         },
        //     }
        //
        const data = this.safeValue (response, 'data');
        const markets = this.safeValue (data, 'symbols');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = this.safeValue (markets, i);
            const symbol = this.safeString (market, 'symbol');
            const id = symbol.replace ('/', '_');
            const baseId = this.safeString (market, 'coin');
            const quoteId = this.safeString (market, 'currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const active = this.safeValue (market, 'active');
            const precision = this.safeValue (response, 'precision', {});
            const limits = this.safeValue (market, 'limits', {});
            const amountLimits = this.safeValue (limits, 'amount', {});
            const priceLimits = this.safeValue (limits, 'price', {});
            const costLimits = this.safeValue (limits, 'cost', {});
            const entry = {
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': {
                    'price': this.safeInteger (precision, 'price'),
                    'amount': this.safeInteger (precision, 'amount'),
                    'cost': this.safeInteger (precision, 'cost'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (amountLimits, 'min'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeFloat (priceLimits, 'min'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeFloat (costLimits, 'min'),
                        'max': undefined,
                    },
                },
            };
            result.push (entry);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetAssets (params);
        //
        //     {
        //         "message":null,
        //         "dataVersion":"2514c8012d94ea375018fc13e0b5d4d896e435df",
        //         "data":{
        //             "BTC":{
        //                 "name":"Bitcoin",
        //                 "unified_cryptoasset_id":1,
        //                 "can_withdraw":1,
        //                 "can_deposit":1,
        //                 "min_withdraw":"0.0011250000",
        //                 "max_withdraw":"100.0000000000",
        //                 "maker_fee":"0.002",
        //                 "taker_fee":"0.002",
        //                 "decimal":8,
        //                 "withdrawal_fee":"0.0006250000",
        //             },
        //         },
        //     }
        //
        const result = {};
        const data = this.safeValue (response, 'data');
        const ids = Object.keys (data);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = this.safeValue (data, id);
            const code = this.safeCurrencyCode (id);
            const canDeposit = this.safeValue (currency, 'can_deposit');
            const canWithdraw = this.safeValue (currency, 'can_withdraw');
            const active = (canDeposit && canWithdraw);
            result[code] = {
                'id': id,
                'code': code,
                'name': this.safeString (currency, 'name'),
                'active': active,
                'fee': this.safeFloat (currency, 'withdrawal_fee'),
                'precision': this.safeInteger (currency, 'decimal'),
                'limits': {
                    'withdraw': {
                        'min': this.safeFloat (currency, 'min_withdraw'),
                        'max': this.safeFloat (currency, 'max_withdraw'),
                    },
                },
            };
        }
        return result;
    }

    async fetchTradingFee (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.extend ({
            'symbol': market['id'],
        }, this.omit (params, 'symbol'));
        const response = await this.privateGetTradingFeeSymbol (request);
        //
        //     {
        //         takeLiquidityRate: '0.001',
        //         provideLiquidityRate: '-0.0001'
        //     }
        //
        return {
            'info': response,
            'maker': this.safeFloat (response, 'provideLiquidityRate'),
            'taker': this.safeFloat (response, 'takeLiquidityRate'),
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        //
        //     {
        //         "message":null,
        //         "dataVersion":"7168e6c99e90f60673070944d987988eef7d91fa",
        //         "data":{
        //             "vnd":{"balance":0,"available_balance":0},
        //             "btc":{"balance":0,"available_balance":0},
        //             "eth":{"balance":0,"available_balance":0},
        //         },
        //     }
        //
        const data = this.safeValue (response, 'data');
        const result = { 'info': response };
        const currencyIds = Object.keys (data);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (data, currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available_balance');
            account['total'] = this.safeFloat (balance, 'balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "low":"415805323.0000000000",
        //         "high":"415805323.0000000000",
        //         "open":"415805323.0000000000",
        //         "close":"415805323.0000000000",
        //         "time":"1605845940000",
        //         "volume":"0.0065930000",
        //         "opening_time":1605845963263,
        //         "closing_time":1605845963263
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
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
        const request = {
            'coin': market['baseId'],
            'currency': market['quoteId'],
            'resolution': this.timeframes[timeframe],
        };
        limit = (limit === undefined) ? 100 : limit;
        limit = Math.min (100, limit);
        const duration = this.parseTimeframe (timeframe);
        if (since === undefined) {
            const end = this.seconds ();
            request['to'] = end;
            request['from'] = end - limit * duration;
        } else {
            const start = parseInt (since / 1000);
            request['from'] = start;
            request['to'] = this.sum (start, limit * duration);
        }
        const response = await this.publicGetChartBars (this.extend (request, params));
        //
        //     [
        //         {"low":"415805323.0000000000","high":"415805323.0000000000","open":"415805323.0000000000","close":"415805323.0000000000","time":"1605845940000","volume":"0.0065930000","opening_time":1605845963263,"closing_time":1605845963263},
        //         {"low":"416344148.0000000000","high":"416344148.0000000000","open":"415805323.0000000000","close":"416344148.0000000000","time":"1605846000000","volume":"0.0052810000","opening_time":1605846011490,"closing_time":1605846011490},
        //         {"low":"416299269.0000000000","high":"417278376.0000000000","open":"416344148.0000000000","close":"417278376.0000000000","time":"1605846060000","volume":"0.0136750000","opening_time":1605846070727,"closing_time":1605846102282},
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_pair': market['id'],
            // 'depth': 0, // 0 = full orderbook, 5, 10, 20, 50, 100, 500
            'level': 2, // 1 = best bidask, 2 = aggregated by price, 3 = no aggregation
        };
        if (limit !== undefined) {
            if ((limit !== 0) && (limit !== 5) && (limit !== 10) && (limit !== 20) && (limit !== 50) && (limit !== 100) && (limit !== 500)) {
                throw new BadRequest (this.id + ' fetchOrderBook limit must be 0, 5, 10, 20, 50, 100, 500 if specified');
            }
            request['depth'] = limit;
        }
        const response = await this.publicGetOrderbookMarketPair (this.extend (request, params));
        //
        //     {
        //         "message":null,
        //         "dataVersion":"376cee43af26deabcd3762ab11a876b6e7a71e82",
        //         "data":{
        //             "bids":[
        //                 ["413342637.0000000000","0.165089"],
        //                 ["413274576.0000000000","0.03"],
        //                 ["413274574.0000000000","0.03"],
        //             ],
        //             "asks":[
        //                 ["416979125.0000000000","0.122835"],
        //                 ["417248934.0000000000","0.030006"],
        //                 ["417458879.0000000000","0.1517"],
        //             ],
        //             "timestamp":"1605841619147"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeValue (data, 'timestamp');
        return this.parseOrderBook (data, timestamp, 'bids', 'asks', 0, 1);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "base_id":1,
        //         "quote_id":0,
        //         "last_price":"411119457",
        //         "max_price":"419893173.0000000000",
        //         "min_price":"401292577.0000000000",
        //         "open_price":null,
        //         "base_volume":"10.5915050000",
        //         "quote_volume":"4367495977.4484430060",
        //         "isFrozen":0
        //     }
        //
        const timestamp = this.milliseconds ();
        const baseVolume = this.safeFloat (ticker, 'base_volume');
        const quoteVolume = this.safeFloat (ticker, 'quote_volume');
        const open = this.safeFloat (ticker, 'open_price');
        const last = this.safeFloat (ticker, 'last_price');
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            average = this.sum (last, open) / 2;
            if (open > 0) {
                percentage = change / open * 100;
            }
        }
        const vwap = this.vwap (baseVolume, quoteVolume);
        const symbol = (market === undefined) ? undefined : market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'max_price'),
            'low': this.safeFloat (ticker, 'min_price'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
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
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetTicker (params);
        //
        //     {
        //         "message":null,
        //         "dataVersion":"fc521161aebe506178b8588cd2adb598eaf1018e",
        //         "data":{
        //             "BTC_VND":{
        //                 "base_id":1,
        //                 "quote_id":0,
        //                 "last_price":"411119457",
        //                 "max_price":"419893173.0000000000",
        //                 "min_price":"401292577.0000000000",
        //                 "open_price":null,
        //                 "base_volume":"10.5915050000",
        //                 "quote_volume":"4367495977.4484430060",
        //                 "isFrozen":0
        //             },
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        const ticker = this.safeValue (data, market['id']);
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        //
        //     {
        //         "message":null,
        //         "dataVersion":"fc521161aebe506178b8588cd2adb598eaf1018e",
        //         "data":{
        //             "BTC_VND":{
        //                 "base_id":1,
        //                 "quote_id":0,
        //                 "last_price":"411119457",
        //                 "max_price":"419893173.0000000000",
        //                 "min_price":"401292577.0000000000",
        //                 "open_price":null,
        //                 "base_volume":"10.5915050000",
        //                 "quote_volume":"4367495977.4484430060",
        //                 "isFrozen":0
        //             },
        //         }
        //     }
        //
        const result = {};
        const data = this.safeValue (response, 'data');
        const marketIds = Object.keys (data);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId, undefined, '_');
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (data[marketId], market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "trade_id":181509285,
        //         "price":"415933022.0000000000",
        //         "base_volume":"0.0022080000",
        //         "quote_volume":"918380.1125760000",
        //         "trade_timestamp":1605842150357,
        //         "type":"buy",
        //     }
        //
        // private fetchMyTrades
        //
        //     ...
        //
        const timestamp = this.safeInteger (trade, 'trade_timestamp');
        const symbol = (market === undefined) ? undefined : market['symbol'];
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'base_volume');
        const cost = this.safeFloat (trade, 'quote_volume');
        const side = this.safeString (trade, 'type');
        const id = this.safeString (trade, 'trade_id');
        return {
            'info': trade,
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_pair': market['id'],
            // 'type': 'buy', // 'sell'
            // 'count': limit, // default 500, max 1000
        };
        if (limit !== undefined) {
            request['count'] = Math.min (1000, limit);
        }
        const response = await this.publicGetTradesMarketPair (this.extend (request, params));
        //
        //     {
        //         "message":null,
        //         "dataVersion":"1f811b533143f739008a3e4ecaaab2ec82ea50d4",
        //         "data":[
        //             {
        //                 "trade_id":181509285,
        //                 "price":"415933022.0000000000",
        //                 "base_volume":"0.0022080000",
        //                 "quote_volume":"918380.1125760000",
        //                 "trade_timestamp":1605842150357,
        //                 "type":"buy",
        //             },
        //         ],
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTrades (data, market, since, limit);
    }

    parseMyTrade (trade, market) {
        const timestamp = this.safeValue (trade, 'created_at');
        let symbol = undefined;
        if (!market) {
            const base = this.safeCurrencyCode (trade, 'coin');
            const quote = this.safeCurrencyCode (trade, 'currency');
            symbol = base + '/' + quote;
        } else {
            symbol = market['symbol'];
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'quantity');
        const side = this.safeString (trade, 'trade_type');
        return {
            'info': trade,
            'id': undefined,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['code'].toLowerCase ();
            request['type'] = 'deposit';
            request['limit'] = limit > 1000 ? 1000 : limit;
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.privateGetTransactions (this.extend (request, params));
        const dataResponse = this.safeValue (response, 'data');
        const data = this.safeValue (dataResponse, 'data');
        return this.parseTransactions (data, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['code'].toLowerCase ();
            request['type'] = 'withdraw';
            request['limit'] = limit > 1000 ? 1000 : limit;
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.privateGetTransactions (this.extend (request, params));
        const dataResponse = this.safeValue (response, 'data');
        const data = this.safeValue (dataResponse, 'data');
        return this.parseTransactions (data, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'id');
        const timestamp = this.safeValue (transaction, 'created_at');
        const updated = this.safeValue (transaction, 'updated_at');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const amount = this.safeFloat (transaction, 'amount');
        const address = this.safeString (transaction, 'blockchain_address');
        const txid = this.safeString (transaction, 'transaction_id');
        const tag = this.safeString (transaction, 'destination_tag');
        let fee = undefined;
        const feeCost = this.safeFloat (transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        const type = amount > 0 ? 'deposit' : 'withdrawal';
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': tag,
            'type': type,
            'amount': Math.abs (amount),
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'pending': 'pending',
            'error': 'failed',
            'success': 'ok',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type) {
        const types = {
            'deposit': 'deposit',
            'withdraw': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        amount = parseFloat (amount);
        const ceiling = this.safeValue (params, 'ceiling');
        const request = {
            'coin': market['base'].toLowerCase (),
            'currency': market['quote'].toLowerCase (),
            'trade_type': side,
            'type': type,
        };
        if (type === 'ceiling_market' && !ceiling) {
            throw new InvalidOrder ('Ceiling is required for ceiling_market order');
        }
        if (!price && type === 'limit') {
            throw new InvalidOrder ('Price is required for limit order');
        }
        if (ceiling) {
            request['ceiling'] = ceiling;
        }
        if (type === 'limit') {
            request['quantity'] = this.amountToPrecision (symbol, amount);
        }
        if (price) {
            request['price'] = price;
        }
        const is_stop = this.safeValue (params, 'is_stop');
        const stop_price = this.safeValue (params, 'stop_price');
        const stop_condition = this.safeValue (params, 'stop_condition');
        if (is_stop) {
            request['is_stop'] = 1;
            if (!stop_price || !stop_condition) {
                throw new InvalidOrder ('Stop price and stop condition is required for stop order');
            }
            request['stop_price'] = stop_price;
            request['stop_condition'] = stop_condition;
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const order = this.parseOrder (response);
        if (order['status'] === 'rejected') {
            throw new InvalidOrder (this.id + ' order was rejected by the exchange ' + this.json (order));
        }
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privatePutOrdersOrderIdCancel (this.extend (request, params));
        return this.parseOrder (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            'pending': 'open',
            'stopping': 'open',
            'executing': 'open',
            'executed': 'closed',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const created = this.safeValue (order, 'created_at');
        const updated = this.safeValue (order, 'updated_at');
        const base = this.safeString (order, 'coin');
        const quote = this.safeString (order, 'currency');
        const marketId = base + '/' + quote;
        market = this.safeMarket (marketId, market, '/');
        const symbol = market['symbol'];
        const amount = this.safeFloat (order, 'quantity');
        const filled = this.safeFloat (order, 'executed_quantity');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString (order, 'id');
        let price = this.safeFloat (order, 'price');
        // in case of market order
        if (!price) {
            price = this.safeFloat (order, 'executed_price');
        }
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = amount - filled;
            }
        }
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'trade_type');
        const fee = {
            'currency': this.safeCurrencyCode (quote),
            'cost': this.safeFloat (order, 'fee'),
            'rate': undefined,
        };
        return {
            'id': id,
            'clientOrderId': id,
            'timestamp': created,
            'datetime': this.iso8601 (created),
            'lastTradeTimestamp': updated,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': undefined,
            'amount': amount,
            'cost': undefined,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
            'trades': undefined,
            'info': order,
        };
    }

    parseMyTrades (trades, market = undefined, since = undefined, limit = undefined, params = {}) {
        let result = [];
        const tradeList = Object.values (trades);
        for (let i = 0; i < tradeList.length; i++) {
            const trade = tradeList[i];
            result.push (this.extend (this.parseMyTrade (trade, market), params));
        }
        result = this.sortBy (result, 'timestamp');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetOrdersOrderId (this.extend (request, params));
        const order = this.safeValue (response, 'data');
        if (!order) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (order);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'limit': !limit || limit > 1000 ? 1000 : limit,
            'start_date': since,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['coin'] = this.safeStringLower (market, 'base');
            request['currency'] = this.safeStringLower (market, 'quote');
        }
        const response = await this.privateGetOrdersOpen (this.extend (request, params));
        const responseData = this.safeValue (response, 'data');
        const data = this.safeValue (responseData, 'data');
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'limit': !limit || limit > 1000 ? 1000 : limit,
            'start_date': since,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['coin'] = this.safeStringLower (market, 'base');
            request['currency'] = this.safeStringLower (market, 'quote');
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        const responseData = this.safeValue (response, 'data');
        const data = this.safeValue (responseData, 'data');
        return this.parseOrders (data, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'limit': !limit || limit > 1000 ? 1000 : limit,
            'start_date': since,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['coin'] = this.safeStringLower (market, 'base');
            request['currency'] = this.safeStringLower (market, 'quote');
        }
        const response = await this.privateGetOrdersTrades (this.extend (request, params));
        // [
        //     {
        //         "trade_type":"sell",
        //         "fee":"0.0284700000",
        //         "created_at":1557625985566,
        //         "currency":"usdt",
        //         "coin":"neo",
        //         "price":"9.4900000000",
        //         "quantity":"1.0000000000",
        //         "amount":"9.4900000000"
        //     }
        // ]
        const responseData = this.safeValue (response, 'data');
        const data = this.safeValue (responseData, 'data');
        return this.parseMyTrades (data, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['code'].toLowerCase (),
        };
        const response = await this.privateGetDepositAddress (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const status = this.safeString (data, 'status');
        if (status === 'REQUESTED') {
            return {
                'info': data,
            };
        }
        const address = this.safeString (data, 'blockchain_address');
        this.checkAddress (address);
        const tag = this.safeString (data, 'blockchain_tag');
        return {
            'currency': this.safeStringUpper (data, 'currency'),
            'address': address,
            'tag': tag,
            'info': data,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            if (method !== 'GET') {
                body = this.json (query);
            }
            const auth = method + ' ' + url;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            headers = {
                'Authorization': 'Bearer ' + this.apiKey,
                'Content-Type': 'application/json',
                'timestamp': timestamp,
                'signature': signature,
            };
        }
        url = this.urls['api'][api] + '/' + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {"message":"Unauthenticated."} // wrong api key
        //     {"message":"The given data was invalid.","errors":{"signature":["HMAC signature is invalid"]}}
        //     {"code":504,"message":"Gateway Timeout","description":""}
        //     {"code":429,"message":"Too many requests","description":"Too many requests"}
        //
        const message = this.safeString (response, 'message');
        if (message !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
