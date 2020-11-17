'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, OrderNotFound, InvalidOrder } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class vcc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'vcc',
            'name': 'VCC Exchange',
            'countries': [ 'VN' ],
            'rateLimit': 1000,
            'version': '1',
            'has': {
                'cancelOrder': true,
                'CORS': true,
                'createOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 60000,
                '5m': 300000,
                '15m': 900000,
                '30m': 1800000,
                '1h': 3600000,
                '2h': 7200000,
                '4h': 14400000,
                '6h': 21600000,
                '12h': 43200000,
                '1d': 86400000,
                '1w': 604800000,
            },
            'urls': {
                'logo': 'https://vcc.exchange/images/home-page/branding/logo-header.svg',
                'api': {
                    'public': 'https://api.vcc.exchange/v3',
                    'private': 'https://api.vcc.exchange/v3',
                },
                'www': 'https://vcc.exchange',
                'doc': [
                    'https://vcc.exchange/api/',
                ],
                'fees': [
                    'https://support.vcc.exchange/hc/en-us/articles/360016401754',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'exchange_info',
                        'assets', // Available Currencies
                        'ticker', // Ticker list for all symbols
                        'trades/{market_pair}', // Recent trades
                        'orderbook/{market_pair}', // Orderbook
                        'chart/bars', // Candles
                    ],
                },
                'private': {
                    'get': [
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
            'orders': {}, // orders cache / emulation
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetExchangeInfo (params);
        //     [
        // {
        //     "id": "btcvnd",
        //     "symbol": "BTC/VND",
        //     "coin": "btc",   // base
        //     "currency": "vnd", // quote
        //     "baseId": 1,
        //     "quoteId": 0,
        //     "active": true,
        //     "base_precision": "0.0000010000",
        //     "quote_precision": "1.0000000000",
        //     "minimum_quantity": "0.0000010000",
        //     "minimum_amount": "250000.0000000000",
        //     "precision": {
        //       "price": 0,
        //       "amount": 6,
        //       "cost": 6
        //     },
        //     "limits": {
        //       "amount": {
        //         "min": "0.0000010000"
        //       },
        //       "price": {
        //         "min": "1.0000000000"
        //       },
        //       "cost": {
        //         "min": "250000.0000000000"
        //       }
        //     }
        //   }
        //     ]
        //
        const result = [];
        const data = this.safeValue (response, 'data');
        const symbols = this.safeValue (data, 'symbols');
        for (let i = 0; i < symbols.length; i++) {
            const market = this.safeValue (symbols, i);
            const id = this.safeString (market, 'id');
            const symbol = this.safeString (market, 'symbol');
            const base = this.safeStringUpper (market, 'coin');
            const quote = this.safeStringUpper (market, 'currency');
            const baseId = this.safeString (market, 'baseId');
            const quoteId = this.safeString (market, 'quoteId');
            const active = market['active'];
            const precision = {
                'price': this.safeFloat (market['precision'], 'price'),
                'amount': this.safeFloat (market['precision'], 'amount'),
            };
            const entry = {
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market['limits']['amount'], 'min'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeFloat (market['limits']['price'], 'min'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeFloat (market['limits']['cost'], 'min'),
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
        // {
        //     "BTC":{
        //         "name":"Bitcoin",
        //         "unified_cryptoasset_id":1,
        //         "can_withdraw":true,
        //         "can_deposit":true,
        //         "min_withdraw":"0.0020000000",
        //         "max_withdraw":"100.0000000000",
        //         "maker_fee":"0.002",
        //         "taker_fee":"0.002"
        //     }
        // }
        const result = {};
        const data = this.safeValue (response, 'data');
        const ids = Object.keys (data);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const entryValue = this.safeValue (data, id);
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'name': this.safeString (entryValue, 'name'),
                'active': this.safeValue (entryValue, 'can_withdraw'),
                'fee': this.safeFloat (entryValue, 'withdrawal_fee'),
                'precision': this.safeInteger (entryValue, 'decimal'),
                'limits': {
                    'withdraw': {
                        'min': this.safeFloat (entryValue, 'min_withdraw'),
                        'max': this.safeFloat (entryValue, 'max_withdraw'),
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
        const response = await this.privateGetBalance ();
        const data = this.safeValue (response, 'data');
        const result = { 'info': data };
        const currencies = Object.keys (data);
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const code = this.safeCurrencyCode (currency);
            const balanceData = this.safeValue (data, currency);
            const account = this.account ();
            account['free'] = this.safeFloat (balanceData, 'available_balance');
            account['total'] = this.safeFloat (balanceData, 'balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "timestamp":"2015-08-20T19:01:00.000Z",
        //         "open":"0.006",
        //         "close":"0.006",
        //         "min":"0.006",
        //         "max":"0.006",
        //         "volume":"0.003",
        //         "volumeQuote":"0.000018"
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
        const resolution = this.timeframes[timeframe];
        const request = {
            'coin': market['base'].toLowerCase (),
            'currency': market['quote'].toLowerCase (),
            'resolution': resolution,
        };
        if (since !== undefined) {
            request['from'] = Math.floor (since / 1000);
            if (limit === undefined) {
                limit = 100; // max = 100
            }
            const size = (limit - 1) * resolution;
            request['to'] = Math.floor (this.sum (size, since) / 1000);
        }
        const response = await this.publicGetChartBars (this.extend (request, params));
        //
        // [
        //      { "low": 0, "high": 0, "open": 0, "close": 0, "volume": "0", "time": 874454400000, "opening_time": 874454400000, "closing_time": 874454400000 },
        //      { "low": 0, "high": 0, "open": 0, "close": 0, "volume": "0", "time": 874540800000, "opening_time": 874540800000, "closing_time": 874540800000 },
        //      { "low": 0, "high": 0, "open": 0, "close": 0, "volume": "0", "time": 874627200000, "opening_time": 874627200000, "closing_time": 874627200000 }
        // ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_pair': market['symbol'].replace ('/', '_'),
            'level': 3,
        };
        const response = await this.publicGetOrderbookMarketPair (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrderBook (data, this.safeValue (data, 'timestamp'), 'bids', 'asks', 0, 1);
    }

    parseTicker (ticker, symbol = undefined) {
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
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
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

    async fetchTickers (symbols = undefined, params = {}) {
        const response = await this.publicGetTicker (params);
        // {
        // "ETH_BTC":{
        //     "base_id":1027,
        //     "quote_id":1,
        //     "last_price":"0.0218771300",
        //     "base_volume":"4042.2638948900",
        //     "quote_volume":"87.9219942331",
        //     "isFrozen":0
        //     }
        // }
        const result = {};
        const data = this.safeValue (response, 'data');
        const symbolList = Object.keys (data);
        for (let i = 0; i < symbolList.length; i++) {
            const symbol = symbolList[i];
            const ticker = this.safeValue (data, symbol);
            result[symbol] = this.parseTicker (ticker, symbol);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTrade (trade, market) {
        const timestamp = this.safeValue (trade, 'trade_timestamp');
        const symbol = market['symbol'];
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'base_volume');
        const cost = this.safeFloat (trade, 'quote_volume');
        const side = this.safeString (trade, 'type');
        const id = this.safeString (trade, 'id');
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

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_pair': market['symbol'].replace ('/', '_'),
        };
        if (limit !== undefined) {
            request['limit'] = limit > 1000 ? 1000 : limit;
        }
        const response = await this.publicGetTradesMarketPair (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseTrades (data, market, since, limit);
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
        let url = '/';
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            url += this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            url += this.implodeParams (path, params);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (Object.keys (query).length) {
                body = this.json (query);
                url += '?' + this.urlencode (query);
            }
            const auth = method + ' v3' + url;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            headers = {
                'Authorization': 'Bearer ' + this.apiKey,
                'Content-Type': 'application/json',
                'timestamp': this.milliseconds (),
                'signature': signature,
            };
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code >= 400) {
            const feedback = this.id + ' ' + body;
            // {"code":504,"message":"Gateway Timeout","description":""}
            if ((code === 503) || (code === 504)) {
                throw new ExchangeNotAvailable (feedback);
            }
            // fallback to default error handler on rate limit errors
            // {"code":429,"message":"Too many requests","description":"Too many requests"}
            if (code === 429) {
                return;
            }
            throw new ExchangeError (feedback);
        }
    }
};
