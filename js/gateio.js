'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, ArgumentsRequired, InvalidAddress, OrderNotFound, NotSupported, DDoSProtection, InsufficientFunds, InvalidOrder } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class gateio extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gateio',
            'name': 'Gate.io',
            'countries': [ 'CN' ],
            'version': '2',
            'rateLimit': 1000,
            'pro': true,
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createDepositAddress': true,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 60,
                '5m': 300,
                '10m': 600,
                '15m': 900,
                '30m': 1800,
                '1h': 3600,
                '2h': 7200,
                '4h': 14400,
                '6h': 21600,
                '12h': 43200,
                '1d': 86400,
                '1w': 604800,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg',
                'api': {
                    'public': 'https://data.gate.io/api',
                    'private': 'https://data.gate.io/api',
                },
                'www': 'https://gate.io/',
                'doc': 'https://gate.io/api2',
                'fees': [
                    'https://gate.io/fee',
                    'https://support.gate.io/hc/en-us/articles/115003577673',
                ],
                'referral': 'https://www.gate.io/signup/2436035',
            },
            'api': {
                'public': {
                    'get': [
                        'candlestick2/{id}',
                        'pairs',
                        'coininfo',
                        'marketinfo',
                        'marketlist',
                        'coininfo',
                        'tickers',
                        'ticker/{id}',
                        'orderBook/{id}',
                        'trade/{id}',
                        'tradeHistory/{id}',
                        'tradeHistory/{id}/{tid}',
                    ],
                },
                'private': {
                    'post': [
                        'balances',
                        'depositAddress',
                        'newAddress',
                        'depositsWithdrawals',
                        'buy',
                        'sell',
                        'cancelOrder',
                        'cancelAllOrders',
                        'getOrder',
                        'openOrders',
                        'tradeHistory',
                        'feelist',
                        'withdraw',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.002,
                    'taker': 0.002,
                },
            },
            'exceptions': {
                'exact': {
                    '4': DDoSProtection,
                    '5': AuthenticationError, // { result: "false", code:  5, message: "Error: invalid key or sign, please re-generate it from your account" }
                    '6': AuthenticationError, // { result: 'false', code: 6, message: 'Error: invalid data  ' }
                    '7': NotSupported,
                    '8': NotSupported,
                    '9': NotSupported,
                    '15': DDoSProtection,
                    '16': OrderNotFound,
                    '17': OrderNotFound,
                    '20': InvalidOrder,
                    '21': InsufficientFunds,
                },
                // https://gate.io/api2#errCode
                'errorCodeNames': {
                    '1': 'Invalid request',
                    '2': 'Invalid version',
                    '3': 'Invalid request',
                    '4': 'Too many attempts',
                    '5': 'Invalid sign',
                    '6': 'Invalid sign',
                    '7': 'Currency is not supported',
                    '8': 'Currency is not supported',
                    '9': 'Currency is not supported',
                    '10': 'Verified failed',
                    '11': 'Obtaining address failed',
                    '12': 'Empty params',
                    '13': 'Internal error, please report to administrator',
                    '14': 'Invalid user',
                    '15': 'Cancel order too fast, please wait 1 min and try again',
                    '16': 'Invalid order id or order is already closed',
                    '17': 'Invalid orderid',
                    '18': 'Invalid amount',
                    '19': 'Not permitted or trade is disabled',
                    '20': 'Your order size is too small',
                    '21': 'You don\'t have enough fund',
                },
            },
            'options': {
                'limits': {
                    'cost': {
                        'min': {
                            'BTC': 0.0001,
                            'ETH': 0.001,
                            'USDT': 1,
                        },
                    },
                },
            },
            'commonCurrencies': {
                'BOX': 'DefiBox',
                'BTCBEAR': 'BEAR',
                'BTCBULL': 'BULL',
                'TNC': 'Trinity Network Credit',
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCoininfo (params);
        //
        //     {
        //         "result":"true",
        //         "coins":[
        //             {
        //                 "CNYX":{
        //                     "delisted":0,
        //                     "withdraw_disabled":1,
        //                     "withdraw_delayed":0,
        //                     "deposit_disabled":0,
        //                     "trade_disabled":0
        //                 }
        //             },
        //             {
        //                 "USDT_ETH":{
        //                     "delisted":0,
        //                     "withdraw_disabled":1,
        //                     "withdraw_delayed":0,
        //                     "deposit_disabled":0,
        //                     "trade_disabled":1
        //                 }
        //             }
        //         ]
        //     }
        //
        const coins = this.safeValue (response, 'coins');
        if (!coins) {
            throw new ExchangeError (this.id + ' fetchCurrencies got an unrecognized response');
        }
        const result = {};
        for (let i = 0; i < coins.length; i++) {
            const coin = coins[i];
            const ids = Object.keys (coin);
            for (let j = 0; j < ids.length; j++) {
                const id = ids[j];
                const currency = coin[id];
                const code = this.safeCurrencyCode (id);
                const delisted = this.safeValue (currency, 'delisted', 0);
                const withdrawDisabled = this.safeValue (currency, 'withdraw_disabled', 0);
                const depositDisabled = this.safeValue (currency, 'deposit_disabled', 0);
                const tradeDisabled = this.safeValue (currency, 'trade_disabled', 0);
                const listed = (delisted === 0);
                const withdrawEnabled = (withdrawDisabled === 0);
                const depositEnabled = (depositDisabled === 0);
                const tradeEnabled = (tradeDisabled === 0);
                const active = listed && withdrawEnabled && depositEnabled && tradeEnabled;
                result[code] = {
                    'id': id,
                    'code': code,
                    'active': active,
                    'info': currency,
                    'name': undefined,
                    'fee': undefined,
                    'precision': undefined,
                    'limits': {
                        'amount': {
                            'min': undefined,
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
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
            }
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarketinfo (params);
        //
        //     {
        //         "result":"true",
        //         "pairs":[
        //             {
        //                 "usdt_cnyx":{
        //                     "decimal_places":3,
        //                     "amount_decimal_places":3,
        //                     "min_amount":1,
        //                     "min_amount_a":1,
        //                     "min_amount_b":3,
        //                     "fee":0.02,
        //                     "trade_disabled":0,
        //                     "buy_disabled":0,
        //                     "sell_disabled":0
        //                 }
        //             },
        //         ]
        //     }
        //
        const markets = this.safeValue (response, 'pairs');
        if (!markets) {
            throw new ExchangeError (this.id + ' fetchMarkets got an unrecognized response');
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const keys = Object.keys (market);
            const id = this.safeString (keys, 0);
            const details = market[id];
            // all of their symbols are separated with an underscore
            // but not boe_eth_eth (BOE_ETH/ETH) which has two underscores
            // https://github.com/ccxt/ccxt/issues/4894
            const parts = id.split ('_');
            const numParts = parts.length;
            let baseId = parts[0];
            let quoteId = parts[1];
            if (numParts > 2) {
                baseId = parts[0] + '_' + parts[1];
                quoteId = parts[2];
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (details, 'amount_decimal_places'),
                'price': this.safeInteger (details, 'decimal_places'),
            };
            const amountLimits = {
                'min': this.safeFloat (details, 'min_amount'),
                'max': undefined,
            };
            const priceLimits = {
                'min': Math.pow (10, -precision['price']),
                'max': undefined,
            };
            const defaultCost = amountLimits['min'] * priceLimits['min'];
            const minCost = this.safeFloat (this.options['limits']['cost']['min'], quote, defaultCost);
            const costLimits = {
                'min': minCost,
                'max': undefined,
            };
            const limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': costLimits,
            };
            const disabled = this.safeValue (details, 'trade_disabled');
            const active = !disabled;
            const uppercaseId = id.toUpperCase ();
            const fee = this.safeFloat (details, 'fee');
            result.push ({
                'id': id,
                'uppercaseId': uppercaseId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'maker': fee / 100,
                'taker': fee / 100,
                'precision': precision,
                'limits': limits,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostBalances (params);
        const result = { 'info': response };
        let available = this.safeValue (response, 'available', {});
        if (Array.isArray (available)) {
            available = {};
        }
        const locked = this.safeValue (response, 'locked', {});
        const currencyIds = Object.keys (available);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (available, currencyId);
            account['used'] = this.safeFloat (locked, currencyId);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': this.marketId (symbol),
        };
        const response = await this.publicGetOrderBookId (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    parseOHLCV (ohlcv, market = undefined) {
        // they return [ Timestamp, Volume, Close, High, Low, Open ]
        return [
            this.safeInteger (ohlcv, 0), // t
            this.safeFloat (ohlcv, 5), // o
            this.safeFloat (ohlcv, 3), // h
            this.safeFloat (ohlcv, 4), // l
            this.safeFloat (ohlcv, 2), // c
            this.safeFloat (ohlcv, 1), // v
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
            'group_sec': this.timeframes[timeframe],
        };
        // max limit = 1001
        if (limit !== undefined) {
            const periodDurationInSeconds = this.parseTimeframe (timeframe);
            const hours = parseInt ((periodDurationInSeconds * limit) / 3600);
            request['range_hour'] = Math.max (0, hours - 1);
        }
        const response = await this.publicGetCandlestick2Id (this.extend (request, params));
        //
        //     {
        //         "elapsed": "15ms",
        //         "result": "true",
        //         "data": [
        //             [ "1553930820000", "1.005299", "4081.05", "4086.18", "4081.05", "4086.18" ],
        //             [ "1553930880000", "0.110923277", "4095.2", "4095.23", "4091.15", "4091.15" ],
        //             ...
        //             [ "1553934420000", "0", "4089.42", "4089.42", "4089.42", "4089.42" ],
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        const percentage = this.safeFloat (ticker, 'percentChange');
        let open = undefined;
        let change = undefined;
        let average = undefined;
        if ((last !== undefined) && (percentage !== undefined)) {
            const relativeChange = percentage / 100;
            open = last / this.sum (1, relativeChange);
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        open = this.safeFloat (ticker, 'open', open);
        change = this.safeFloat (ticker, 'change', change);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat2 (ticker, 'high24hr', 'high'),
            'low': this.safeFloat2 (ticker, 'low24hr', 'low'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'quoteVolume'), // gateio has them reversed
            'quoteVolume': this.safeFloat (ticker, 'baseVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const result = {};
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.safeMarket (id, undefined, '_');
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (response[id], market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const ticker = await this.publicGetTickerId (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        // {
        //     "tradeID": 3175762,
        //     "date": "2017-08-25 07:24:28",
        //     "type": "sell",
        //     "rate": 29011,
        //     "amount": 0.0019,
        //     "total": 55.1209,
        //     "fee": "0",
        //     "fee_coin": "btc",
        //     "gt_fee":"0",
        //     "point_fee":"0.1213",
        // },
        let timestamp = this.safeTimestamp2 (trade, 'timestamp', 'time_unix');
        timestamp = this.safeTimestamp (trade, 'time', timestamp);
        const id = this.safeString2 (trade, 'tradeID', 'id');
        // take either of orderid or orderId
        const orderId = this.safeString2 (trade, 'orderid', 'orderNumber');
        const price = this.safeFloat2 (trade, 'rate', 'price');
        const amount = this.safeFloat (trade, 'amount');
        const type = this.safeString (trade, 'type');
        const takerOrMaker = this.safeString (trade, 'role');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let fee = undefined;
        let feeCurrency = this.safeCurrencyCode (this.safeString (trade, 'fee_coin'));
        let feeCost = this.safeFloat (trade, 'point_fee');
        if ((feeCost === undefined) || (feeCost === 0)) {
            feeCost = this.safeFloat (trade, 'gt_fee');
            if ((feeCost === undefined) || (feeCost === 0)) {
                feeCost = this.safeFloat (trade, 'fee');
            } else {
                feeCurrency = this.safeCurrencyCode ('GT');
            }
        } else {
            feeCurrency = this.safeCurrencyCode ('POINT');
        }
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': type,
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
            'id': market['id'],
        };
        let method = undefined;
        if ('tid' in params) {
            method = 'publicGetTradeHistoryIdTid';
        } else {
            method = 'publicGetTradeHistoryId';
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.privatePostOpenOrders (params);
        return this.parseOrders (response['orders'], undefined, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderNumber': id,
            'currencyPair': this.marketId (symbol),
        };
        const response = await this.privatePostGetOrder (this.extend (request, params));
        return this.parseOrder (response['order']);
    }

    parseOrderStatus (status) {
        const statuses = {
            'cancelled': 'canceled',
            // 'closed': 'closed', // these two statuses aren't actually needed
            // 'open': 'open', // as they are mapped one-to-one
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //        "fee": "0 ZEC",
        //         "code": 0,
        //         "rate": "0.0055",
        //         "side": 2,
        //         "type": "buy",
        //         "ctime": 1586460839.138,
        //         "market": "ZEC_BTC",
        //         "result": "true",
        //         "status": "open",
        //         "iceberg": "0",
        //         "message": "Success",
        //         "feeValue": "0",
        //         "filledRate": "0.005500000",
        //         "leftAmount": "0.60607456",
        //         "feeCurrency": "ZEC",
        //         "orderNumber": 10755887009,
        //         "filledAmount": "0",
        //         "feePercentage": 0.002,
        //         "initialAmount": "0.60607456"
        //     }
        //
        //     {
        //         'amount': '0.00000000',
        //         'currencyPair': 'xlm_usdt',
        //         'fee': '0.0113766632239302 USDT',
        //         'feeCurrency': 'USDT',
        //         'feePercentage': 0.18,
        //         'feeValue': '0.0113766632239302',
        //         'filledAmount': '30.14004987',
        //         'filledRate': 0.2097,
        //         'initialAmount': '30.14004987',
        //         'initialRate': '0.2097',
        //         'left': 0,
        //         'orderNumber': '998307286',
        //         'rate': '0.2097',
        //         'status': 'closed',
        //         'timestamp': 1531158583,
        //         'type': 'sell'
        //     }
        //
        //     {
        //         "orderNumber": 10802237760,
        //         "orderType": 1,
        //         "type": "buy",
        //         "rate": "0.54250000",
        //         "amount": "45.55638518",
        //         "total": "24.71433896",
        //         "initialRate": "0.54250000",
        //         "initialAmount": "45.55638518",
        //         "filledRate": "0.54250000",
        //         "filledAmount": "0",
        //         "currencyPair": "nano_usdt",
        //         "timestamp": 1586556143,
        //         "status": "open"
        //     }
        //
        const id = this.safeString2 (order, 'orderNumber', 'id');
        const marketId = this.safeString (order, 'currencyPair');
        const symbol = this.safeSymbol (marketId, market, '_');
        const timestamp = this.safeTimestamp2 (order, 'timestamp', 'ctime');
        const lastTradeTimestamp = this.safeTimestamp (order, 'mtime');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let side = this.safeString (order, 'type');
        // handling for order.update messages
        if (side === '1') {
            side = 'sell';
        } else if (side === '2') {
            side = 'buy';
        }
        const price = this.safeFloat2 (order, 'initialRate', 'rate');
        const average = this.safeFloat (order, 'filledRate');
        const amount = this.safeFloat2 (order, 'initialAmount', 'amount');
        const filled = this.safeFloat (order, 'filledAmount');
        // In the order status response, this field has a different name.
        let remaining = this.safeFloat2 (order, 'leftAmount', 'left');
        if (remaining === undefined) {
            remaining = amount - filled;
        }
        const feeCost = this.safeFloat (order, 'feeValue');
        const feeCurrencyId = this.safeString (order, 'feeCurrency');
        const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
        let feeRate = this.safeFloat (order, 'feePercentage');
        if (feeRate !== undefined) {
            feeRate = feeRate / 100;
        }
        return {
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': average,
            'trades': undefined,
            'fee': {
                'cost': feeCost,
                'currency': feeCurrencyCode,
                'rate': feeRate,
            },
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const method = 'privatePost' + this.capitalize (side);
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
            'rate': price,
            'amount': amount,
        };
        const response = await this[method] (this.extend (request, params));
        return this.parseOrder (this.extend ({
            'status': 'open',
            'type': side,
            'initialAmount': amount,
        }, response), market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            'orderNumber': id,
            'currencyPair': this.marketId (symbol),
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async queryDepositAddress (method, code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        method = 'privatePost' + method + 'Address';
        const request = {
            'currency': currency['id'],
        };
        const response = await this[method] (this.extend (request, params));
        let address = this.safeString (response, 'addr');
        let tag = undefined;
        if ((address !== undefined) && (address.indexOf ('address') >= 0)) {
            throw new InvalidAddress (this.id + ' queryDepositAddress ' + address);
        }
        if (code === 'XRP') {
            const parts = address.split (' ');
            address = parts[0];
            tag = parts[1];
        }
        return {
            'currency': currency,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async createDepositAddress (code, params = {}) {
        return await this.queryDepositAddress ('New', code, params);
    }

    async fetchDepositAddress (code, params = {}) {
        return await this.queryDepositAddress ('Deposit', code, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privatePostOpenOrders (params);
        return this.parseOrders (response['orders'], market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
            'orderNumber': id,
        };
        const response = await this.privatePostTradeHistory (this.extend (request, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
        };
        const response = await this.privatePostTradeHistory (this.extend (request, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address, // Address must exist in you AddressBook in security settings
        };
        if (tag !== undefined) {
            request['address'] += ' ' + tag;
        }
        const response = await this.privatePostWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    async fetchTransactionsByType (type = undefined, code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.privatePostDepositsWithdrawals (this.extend (request, params));
        let transactions = undefined;
        if (type === undefined) {
            const deposits = this.safeValue (response, 'deposits', []);
            const withdrawals = this.safeValue (response, 'withdraws', []);
            transactions = this.arrayConcat (deposits, withdrawals);
        } else {
            transactions = this.safeValue (response, type, []);
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (transactions, currency, since, limit);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType (undefined, code, since, limit, params);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('deposits', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('withdraws', code, since, limit, params);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // deposit
        //
        //     {
        //         'id': 'd16520849',
        //         'currency': 'NEO',
        //         'address': False,
        //         'amount': '1',
        //         'txid': '01acf6b8ce4d24a....',
        //         'timestamp': '1553125968',
        //         'status': 'DONE',
        //         'type': 'deposit'
        //     }
        //
        // withdrawal
        //
        //     {
        //         'id': 'w5864259',
        //         'currency': 'ETH',
        //         'address': '0x72632f462....',
        //         'amount': '0.4947',
        //         'txid': '0x111167d120f736....',
        //         'timestamp': '1553123688',
        //         'status': 'DONE',
        //         'type': 'withdrawal'
        //     }
        //
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'txid');
        const amount = this.safeFloat (transaction, 'amount');
        let address = this.safeString (transaction, 'address');
        if (address === 'false') {
            address = undefined;
        }
        const timestamp = this.safeTimestamp (transaction, 'timestamp');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const type = this.parseTransactionType (id[0]);
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': type,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'PEND': 'pending',
            'REQUEST': 'pending',
            'DMOVE': 'pending',
            'CANCEL': 'failed',
            'DONE': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type) {
        const types = {
            'd': 'deposit',
            'w': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const resultString = this.safeString (response, 'result', '');
        if (resultString !== 'false') {
            return;
        }
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'message', body);
        if (errorCode !== undefined) {
            const feedback = this.safeString (this.exceptions['errorCodeNames'], errorCode, message);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const prefix = (api === 'private') ? (api + '/') : '';
        let url = this.urls['api'][api] + this.version + '/1/' + prefix + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const request = { 'nonce': nonce };
            body = this.rawencode (this.extend (request, query));
            // gateio does not like the plus sign in the URL query
            // https://github.com/ccxt/ccxt/issues/4529
            body = body.replace ('+', ' ');
            const signature = this.hmac (this.encode (body), this.encode (this.secret), 'sha512');
            headers = {
                'Key': this.apiKey,
                'Sign': signature,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
