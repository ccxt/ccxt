'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, DDoSProtection, InvalidOrder, AuthenticationError, PermissionDenied } = require ('./base/errors');
const Precise = require ('./base/Precise');

module.exports = class tidex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tidex',
            'name': 'Tidex',
            'countries': [ 'UK' ],
            'rateLimit': 2000,
            'version': '3',
            'userAgent': this.userAgents['chrome'],
            'has': {
                'cancelOrder': true,
                'CORS': undefined,
                'createMarketOrder': undefined,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg',
                'api': {
                    'web': 'https://gate.tidex.com/api',
                    'public': 'https://api.tidex.com/api/3',
                    'private': 'https://api.tidex.com/tapi',
                },
                'www': 'https://tidex.com',
                'doc': 'https://tidex.com/exchange/public-api',
                'referral': 'https://tidex.com/exchange/?ref=57f5638d9cd7',
                'fees': [
                    'https://tidex.com/exchange/assets-spec',
                    'https://tidex.com/exchange/pairs-spec',
                ],
            },
            'api': {
                'web': {
                    'get': [
                        'currency',
                        'pairs',
                        'tickers',
                        'orders',
                        'ordershistory',
                        'trade-data',
                        'trade-data/{id}',
                    ],
                },
                'public': {
                    'get': [
                        'info',
                        'ticker/{pair}',
                        'depth/{pair}',
                        'trades/{pair}',
                    ],
                },
                'private': {
                    'post': [
                        'getInfoExt',
                        'getInfo',
                        'Trade',
                        'ActiveOrders',
                        'OrderInfo',
                        'CancelOrder',
                        'TradeHistory',
                        'getDepositAddress',
                        'createWithdraw',
                        'getWithdraw',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0.001'),
                },
            },
            'commonCurrencies': {
                'DSH': 'DASH',
                'EMGO': 'MGO',
                'MGO': 'WMGO',
            },
            'exceptions': {
                'exact': {
                    '803': InvalidOrder, // "Count could not be less than 0.001." (selling below minAmount)
                    '804': InvalidOrder, // "Count could not be more than 10000." (buying above maxAmount)
                    '805': InvalidOrder, // "price could not be less than X." (minPrice violation on buy & sell)
                    '806': InvalidOrder, // "price could not be more than X." (maxPrice violation on buy & sell)
                    '807': InvalidOrder, // "cost could not be less than X." (minCost violation on buy & sell)
                    '831': InsufficientFunds, // "Not enougth X to create buy order." (buying with balance.quote < order.cost)
                    '832': InsufficientFunds, // "Not enougth X to create sell order." (selling with balance.base < order.amount)
                    '833': OrderNotFound, // "Order with id X was not found." (cancelling non-existent, closed and cancelled order)
                },
                'broad': {
                    'Invalid pair name': ExchangeError, // {"success":0,"error":"Invalid pair name: btc_eth"}
                    'invalid api key': AuthenticationError,
                    'invalid sign': AuthenticationError,
                    'api key dont have trade permission': AuthenticationError,
                    'invalid parameter': InvalidOrder,
                    'invalid order': InvalidOrder,
                    'Requests too often': DDoSProtection,
                    'not available': ExchangeNotAvailable,
                    'data unavailable': ExchangeNotAvailable,
                    'external service unavailable': ExchangeNotAvailable,
                    'IP restricted': PermissionDenied, // {"success":0,"code":0,"error":"IP restricted (223.xxx.xxx.xxx)"}
                },
            },
            'options': {
                'fetchTickersMaxLength': 2048,
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
        //                 "NeedMemo":false
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
            const visible = this.safeValue (currency, 'visible');
            let active = visible === true;
            const withdrawEnable = this.safeValue (currency, 'withdrawEnable');
            const depositEnable = this.safeValue (currency, 'depositEnable');
            const canWithdraw = withdrawEnable === true;
            const canDeposit = depositEnable === true;
            if (!canWithdraw || !canDeposit) {
                active = false;
            }
            const name = this.safeString (currency, 'name');
            const fee = this.safeNumber (currency, 'withdrawFee');
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': active,
                'precision': precision,
                'funding': {
                    'withdraw': {
                        'active': canWithdraw,
                        'fee': fee,
                    },
                    'deposit': {
                        'active': canDeposit,
                        'fee': this.parseNumber ('0'),
                    },
                },
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
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetInfo (params);
        //
        //     {
        //         "server_time":1615861869,
        //         "pairs":{
        //             "ltc_btc":{
        //                 "decimal_places":8,
        //                 "min_price":0.00000001,
        //                 "max_price":3.0,
        //                 "min_amount":0.001,
        //                 "max_amount":1000000.0,
        //                 "min_total":0.0001,
        //                 "hidden":0,
        //                 "fee":0.1,
        //             },
        //         },
        //     }
        //
        const markets = response['pairs'];
        const keys = Object.keys (markets);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'decimal_places'),
                'price': this.safeInteger (market, 'decimal_places'),
            };
            const limits = {
                'amount': {
                    'min': this.safeNumber (market, 'min_amount'),
                    'max': this.safeNumber (market, 'max_amount'),
                },
                'price': {
                    'min': this.safeNumber (market, 'min_price'),
                    'max': this.safeNumber (market, 'max_price'),
                },
                'cost': {
                    'min': this.safeNumber (market, 'min_total'),
                },
            };
            const hidden = this.safeInteger (market, 'hidden');
            const active = (hidden === 0);
            let takerFeeString = this.safeString (market, 'fee');
            takerFeeString = Precise.stringDiv (takerFeeString, '100');
            const takerFee = this.parseNumber (takerFeeString);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': true,
                'active': active,
                'taker': takerFee,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetInfoExt (params);
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
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 150, max = 2000
        }
        const response = await this.publicGetDepthPair (this.extend (request, params));
        const market_id_in_reponse = (market['id'] in response);
        if (!market_id_in_reponse) {
            throw new ExchangeError (this.id + ' ' + market['symbol'] + ' order book is empty or not available');
        }
        const orderbook = response[market['id']];
        return this.parseOrderBook (orderbook, symbol);
    }

    async fetchOrderBooks (symbols = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = undefined;
        if (symbols === undefined) {
            ids = this.ids.join ('-');
            // max URL length is 2083 symbols, including http schema, hostname, tld, etc...
            if (ids.length > 2048) {
                const numIds = this.ids.length;
                throw new ExchangeError (this.id + ' has ' + numIds.toString () + ' symbols exceeding max URL length, you are required to specify a list of symbols in the first argument to fetchOrderBooks');
            }
        } else {
            ids = this.marketIds (symbols);
            ids = ids.join ('-');
        }
        const request = {
            'pair': ids,
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 150, max = 2000
        }
        const response = await this.publicGetDepthPair (this.extend (request, params));
        const result = {};
        ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const symbol = this.safeSymbol (id);
            result[symbol] = this.parseOrderBook (response[id]);
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //   {    high: 0.03497582,
        //         low: 0.03248474,
        //         avg: 0.03373028,
        //         vol: 120.11485715062999,
        //     vol_cur: 3572.24914074,
        //        last: 0.0337611,
        //         buy: 0.0337442,
        //        sell: 0.03377798,
        //     updated: 1537522009          }
        //
        let timestamp = this.safeTimestamp (ticker, 'updated');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            if (!market['active']) {
                timestamp = undefined;
            }
        }
        const last = this.safeNumber (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeNumber (ticker, 'avg'),
            'baseVolume': this.safeNumber (ticker, 'vol_cur'),
            'quoteVolume': this.safeNumber (ticker, 'vol'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = this.ids;
        if (symbols === undefined) {
            const numIds = ids.length;
            ids = ids.join ('-');
            // max URL length is 2048 symbols, including http schema, hostname, tld, etc...
            if (ids.length > this.options['fetchTickersMaxLength']) {
                const maxLength = this.safeInteger (this.options, 'fetchTickersMaxLength', 2048);
                throw new ArgumentsRequired (this.id + ' has ' + numIds.toString () + ' markets exceeding max URL length for this endpoint (' + maxLength.toString () + ' characters), please, specify a list of symbols of interest in the first argument to fetchTickers');
            }
        } else {
            ids = this.marketIds (symbols);
            ids = ids.join ('-');
        }
        const request = {
            'pair': ids,
        };
        const response = await this.publicGetTickerPair (this.extend (request, params));
        const result = {};
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = this.safeMarket (id);
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (response[id], market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        const tickers = await this.fetchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        let side = this.safeString (trade, 'type');
        if (side === 'ask') {
            side = 'sell';
        } else if (side === 'bid') {
            side = 'buy';
        }
        const priceString = this.safeString2 (trade, 'rate', 'price');
        const id = this.safeString2 (trade, 'trade_id', 'tid');
        const orderId = this.safeString (trade, 'order_id');
        const marketId = this.safeString (trade, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        const amountString = this.safeString (trade, 'amount');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const type = 'limit'; // all trades are still limit trades
        let takerOrMaker = undefined;
        let fee = undefined;
        const feeCost = this.safeNumber (trade, 'commission');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'commissionCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const isYourOrder = this.safeValue (trade, 'is_your_order');
        if (isYourOrder !== undefined) {
            takerOrMaker = 'taker';
            if (isYourOrder) {
                takerOrMaker = 'maker';
            }
            if (fee === undefined) {
                fee = this.calculateFee (symbol, type, side, amount, price, takerOrMaker);
            }
        }
        return {
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTradesPair (this.extend (request, params));
        if (Array.isArray (response)) {
            const numElements = response.length;
            if (numElements === 0) {
                return [];
            }
        }
        return this.parseTrades (response[market['id']], market, since, limit);
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
        return this.safeOrder2 ({
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
        return this.safeOrder2 ({
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
                'method': path,
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
                const message = this.safeString (response, 'error');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
