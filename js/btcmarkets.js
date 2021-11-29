'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, ExchangeError, OrderNotFound, InvalidOrder, InsufficientFunds, DDoSProtection, BadRequest } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class btcmarkets extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcmarkets',
            'name': 'BTC Markets',
            'countries': [ 'AU' ], // Australia
            'rateLimit': 1000, // market data cached for 1 second (trades cached for 2 seconds)
            'version': 'v3',
            'has': {
                'cancelOrder': true,
                'cancelOrders': true,
                'CORS': undefined,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': 'emulated',
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/89731817-b3fb8480-da52-11ea-817f-783b08aaf32b.jpg',
                'api': {
                    'public': 'https://api.btcmarkets.net',
                    'private': 'https://api.btcmarkets.net',
                },
                'www': 'https://btcmarkets.net',
                'doc': [
                    'https://api.btcmarkets.net/doc/v3',
                    'https://github.com/BTCMarkets/API',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'markets/{marketId}/ticker',
                        'markets/{marketId}/trades',
                        'markets/{marketId}/orderbook',
                        'markets/{marketId}/candles',
                        'markets/tickers',
                        'markets/orderbooks',
                        'time',
                    ],
                },
                'private': {
                    'get': [
                        'orders',
                        'orders/{id}',
                        'batchorders/{ids}',
                        'trades',
                        'trades/{id}',
                        'withdrawals',
                        'withdrawals/{id}',
                        'deposits',
                        'deposits/{id}',
                        'transfers',
                        'transfers/{id}',
                        'addresses',
                        'withdrawal-fees',
                        'assets',
                        'accounts/me/trading-fees',
                        'accounts/me/withdrawal-limits',
                        'accounts/me/balances',
                        'accounts/me/transactions',
                        'reports/{id}',
                    ],
                    'post': [
                        'orders',
                        'batchorders',
                        'withdrawals',
                        'reports',
                    ],
                    'delete': [
                        'orders',
                        'orders/{id}',
                        'batchorders/{ids}',
                    ],
                    'put': [
                        'orders/{id}',
                    ],
                },
            },
            'timeframes': {
                '1m': '1m',
                '1h': '1h',
                '1d': '1d',
            },
            'exceptions': {
                '3': InvalidOrder,
                '6': DDoSProtection,
                'InsufficientFund': InsufficientFunds,
                'InvalidPrice': InvalidOrder,
                'InvalidAmount': InvalidOrder,
                'MissingArgument': InvalidOrder,
                'OrderAlreadyCancelled': InvalidOrder,
                'OrderNotFound': OrderNotFound,
                'OrderStatusIsFinal': InvalidOrder,
                'InvalidPaginationParameter': BadRequest,
            },
            'fees': {
                'percentage': true,
                'tierBased': true,
                'maker': this.parseNumber ('-0.0005'),
                'taker': this.parseNumber ('0.0020'),
            },
            'options': {
                'fees': {
                    'AUD': {
                        'maker': 0.85 / 100,
                        'taker': 0.85 / 100,
                    },
                },
            },
        });
    }

    async fetchTransactionsWithMethod (method, code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['after'] = since;
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsWithMethod ('privateGetTransfers', code, since, limit, params);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsWithMethod ('privateGetDeposits', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsWithMethod ('privateGetWithdrawals', code, since, limit, params);
    }

    parseTransactionStatus (status) {
        // todo: find more statuses
        const statuses = {
            'Complete': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type) {
        const statuses = {
            'Withdraw': 'withdrawal',
            'Deposit': 'deposit',
        };
        return this.safeString (statuses, type, type);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //    {
        //         "id": "6500230339",
        //         "assetName": "XRP",
        //         "amount": "500",
        //         "type": "Deposit",
        //         "creationTime": "2020-07-27T07:52:08.640000Z",
        //         "status": "Complete",
        //         "description": "RIPPLE Deposit, XRP 500",
        //         "fee": "0",
        //         "lastUpdate": "2020-07-27T07:52:08.665000Z",
        //         "paymentDetail": {
        //             "txId": "lsjflsjdfljsd",
        //             "address": "kjasfkjsdf?dt=873874545"
        //         }
        //    }
        //
        //    {
        //         "id": "500985282",
        //         "assetName": "BTC",
        //         "amount": "0.42570126",
        //         "type": "Withdraw",
        //         "creationTime": "2017-07-29T12:49:03.931000Z",
        //         "status": "Complete",
        //         "description": "BTC withdraw from [nick-btcmarkets@snowmonkey.co.uk] to Address: 1B9DsnSYQ54VMqFHVJYdGoLMCYzFwrQzsj amount: 0.42570126 fee: 0.00000000",
        //         "fee": "0.0005",
        //         "lastUpdate": "2017-07-29T12:52:20.676000Z",
        //         "paymentDetail": {
        //             "txId": "fkjdsfjsfljsdfl",
        //             "address": "a;daddjas;djas"
        //         }
        //    }
        //
        //    {
        //         "id": "505102262",
        //         "assetName": "XRP",
        //         "amount": "979.836",
        //         "type": "Deposit",
        //         "creationTime": "2017-07-31T08:50:01.053000Z",
        //         "status": "Complete",
        //         "description": "Ripple Deposit, X 979.8360",
        //         "fee": "0",
        //         "lastUpdate": "2017-07-31T08:50:01.290000Z"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (transaction, 'creationTime'));
        const lastUpdate = this.parse8601 (this.safeString (transaction, 'lastUpdate'));
        let type = this.parseTransactionType (this.safeStringLower (transaction, 'type'));
        if (type === 'withdraw') {
            type = 'withdrawal';
        }
        const cryptoPaymentDetail = this.safeValue (transaction, 'paymentDetail', {});
        const txid = this.safeString (cryptoPaymentDetail, 'txId');
        let address = this.safeString (cryptoPaymentDetail, 'address');
        let tag = undefined;
        if (address !== undefined) {
            const addressParts = address.split ('?dt=');
            const numParts = addressParts.length;
            if (numParts > 1) {
                address = addressParts[0];
                tag = addressParts[1];
            }
        }
        const addressTo = address;
        const tagTo = tag;
        const addressFrom = undefined;
        const tagFrom = undefined;
        const fee = this.safeNumber (transaction, 'fee');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const currencyId = this.safeString (transaction, 'assetName');
        const code = this.safeCurrencyCode (currencyId);
        let amount = this.safeNumber (transaction, 'amount');
        if (fee) {
            amount -= fee;
        }
        return {
            'id': this.safeString (transaction, 'id'),
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': tag,
            'tagTo': tagTo,
            'tagFrom': tagFrom,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': lastUpdate,
            'fee': {
                'currency': code,
                'cost': fee,
            },
            'info': transaction,
        };
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     [
        //         {
        //             "marketId":"COMP-AUD",
        //             "baseAssetName":"COMP",
        //             "quoteAssetName":"AUD",
        //             "minOrderAmount":"0.00007",
        //             "maxOrderAmount":"1000000",
        //             "amountDecimals":"8",
        //             "priceDecimals":"2"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const baseId = this.safeString (market, 'baseAssetName');
            const quoteId = this.safeString (market, 'quoteAssetName');
            const id = this.safeString (market, 'marketId');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const fees = this.safeValue (this.safeValue (this.options, 'fees', {}), quote, this.fees);
            const pricePrecision = this.safeInteger (market, 'priceDecimals');
            const amountPrecision = this.safeInteger (market, 'amountDecimals');
            const minAmount = this.safeNumber (market, 'minOrderAmount');
            const maxAmount = this.safeNumber (market, 'maxOrderAmount');
            let minPrice = undefined;
            if (quote === 'AUD') {
                minPrice = Math.pow (10, -pricePrecision);
            }
            const precision = {
                'amount': amountPrecision,
                'price': pricePrecision,
            };
            const limits = {
                'amount': {
                    'min': minAmount,
                    'max': maxAmount,
                },
                'price': {
                    'min': minPrice,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result.push ({
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': true,
                'active': undefined,
                'maker': fees['maker'],
                'taker': fees['taker'],
                'limits': limits,
                'precision': precision,
            });
        }
        return result;
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //     {
        //         "timestamp": "2019-09-01T18:34:27.045000Z"
        //     }
        //
        return this.parse8601 (this.safeString (response, 'timestamp'));
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccountsMeBalances (params);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'assetName');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeString (balance, 'locked');
            account['total'] = this.safeString (balance, 'balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         "2020-09-12T18:30:00.000000Z",
        //         "14409.45", // open
        //         "14409.45", // high
        //         "14403.91", // low
        //         "14403.91", // close
        //         "0.01571701" // volume
        //     ]
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 0)),
            this.safeNumber (ohlcv, 1), // open
            this.safeNumber (ohlcv, 2), // high
            this.safeNumber (ohlcv, 3), // low
            this.safeNumber (ohlcv, 4), // close
            this.safeNumber (ohlcv, 5), // volume
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            'timeWindow': this.timeframes[timeframe],
            // 'from': this.iso8601 (since),
            // 'to': this.iso8601 (this.milliseconds ()),
            // 'before': 1234567890123,
            // 'after': 1234567890123,
            // 'limit': limit, // default 10, max 200
        };
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default is 10, max 200
        }
        const response = await this.publicGetMarketsMarketIdCandles (this.extend (request, params));
        //
        //     [
        //         ["2020-09-12T18:30:00.000000Z","14409.45","14409.45","14403.91","14403.91","0.01571701"],
        //         ["2020-09-12T18:21:00.000000Z","14409.45","14409.45","14409.45","14409.45","0.0035"],
        //         ["2020-09-12T18:03:00.000000Z","14361.37","14361.37","14361.37","14361.37","0.00345221"],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
        };
        const response = await this.publicGetMarketsMarketIdOrderbook (this.extend (request, params));
        //
        //     {
        //         "marketId":"BTC-AUD",
        //         "snapshotId":1599936148941000,
        //         "asks":[
        //             ["14459.45","0.00456475"],
        //             ["14463.56","2"],
        //             ["14470.91","0.98"],
        //         ],
        //         "bids":[
        //             ["14421.01","0.52"],
        //             ["14421","0.75"],
        //             ["14418","0.3521"],
        //         ]
        //     }
        //
        const timestamp = this.safeIntegerProduct (response, 'snapshotId', 0.001);
        const orderbook = this.parseOrderBook (response, symbol, timestamp);
        orderbook['nonce'] = this.safeInteger (response, 'snapshotId');
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "marketId":"BAT-AUD",
        //         "bestBid":"0.3751",
        //         "bestAsk":"0.377",
        //         "lastPrice":"0.3769",
        //         "volume24h":"56192.97613335",
        //         "volumeQte24h":"21179.13270465",
        //         "price24h":"0.0119",
        //         "pricePct24h":"3.26",
        //         "low24h":"0.3611",
        //         "high24h":"0.3799",
        //         "timestamp":"2020-08-09T18:28:23.280000Z"
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'marketId');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        const last = this.safeNumber (ticker, 'lastPrice');
        const baseVolume = this.safeNumber (ticker, 'volume24h');
        const quoteVolume = this.safeNumber (ticker, 'volumeQte24h');
        const vwap = this.vwap (baseVolume, quoteVolume);
        const change = this.safeNumber (ticker, 'price24h');
        const percentage = this.safeNumber (ticker, 'pricePct24h');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high24h'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bestBid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'bestAsk'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
        };
        const response = await this.publicGetMarketsMarketIdTicker (this.extend (request, params));
        //
        //     {
        //         "marketId":"BAT-AUD",
        //         "bestBid":"0.3751",
        //         "bestAsk":"0.377",
        //         "lastPrice":"0.3769",
        //         "volume24h":"56192.97613335",
        //         "volumeQte24h":"21179.13270465",
        //         "price24h":"0.0119",
        //         "pricePct24h":"3.26",
        //         "low24h":"0.3611",
        //         "high24h":"0.3799",
        //         "timestamp":"2020-08-09T18:28:23.280000Z"
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTicker2 (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetMarketIdTick (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "id":"6191646611",
        //         "price":"539.98",
        //         "amount":"0.5",
        //         "timestamp":"2020-08-09T15:21:05.016000Z",
        //         "side":"Ask"
        //     }
        //
        // private fetchMyTrades
        //
        //     {
        //         "id": "36014819",
        //         "marketId": "XRP-AUD",
        //         "timestamp": "2019-06-25T16:01:02.977000Z",
        //         "price": "0.67",
        //         "amount": "1.50533262",
        //         "side": "Ask",
        //         "fee": "0.00857285",
        //         "orderId": "3648306",
        //         "liquidityType": "Taker",
        //         "clientOrderId": "48"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        const marketId = this.safeString (trade, 'marketId');
        let symbol = undefined;
        let base = undefined;
        let quote = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                base = this.safeCurrencyCode (baseId);
                quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        }
        let feeCurrencyCode = undefined;
        if (quote === 'AUD') {
            feeCurrencyCode = quote;
        } else {
            feeCurrencyCode = base;
        }
        let side = this.safeString (trade, 'side');
        if (side === 'Bid') {
            side = 'buy';
        } else if (side === 'Ask') {
            side = 'sell';
        }
        const id = this.safeString (trade, 'id');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const orderId = this.safeString (trade, 'orderId');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        const takerOrMaker = this.safeStringLower (trade, 'liquidityType');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': orderId,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'since': 59868345231,
            'marketId': market['id'],
        };
        const response = await this.publicGetMarketsMarketIdTrades (this.extend (request, params));
        //
        //     [
        //         {"id":"6191646611","price":"539.98","amount":"0.5","timestamp":"2020-08-09T15:21:05.016000Z","side":"Ask"},
        //         {"id":"6191646610","price":"539.99","amount":"0.5","timestamp":"2020-08-09T15:21:05.015000Z","side":"Ask"},
        //         {"id":"6191646590","price":"540","amount":"0.00233785","timestamp":"2020-08-09T15:21:04.171000Z","side":"Bid"},
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            // 'price': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
            // 'type': 'Limit', // "Limit", "Market", "Stop Limit", "Stop", "Take Profit"
            'side': (side === 'buy') ? 'Bid' : 'Ask',
            // 'triggerPrice': this.priceToPrecision (symbol, triggerPrice), // required for Stop, Stop Limit, Take Profit orders
            // 'targetAmount': this.amountToPrecision (symbol, targetAmount), // target amount when a desired target outcome is required for order execution
            // 'timeInForce': 'GTC', // GTC, FOK, IOC
            // 'postOnly': false, // boolean if this is a post-only order
            // 'selfTrade': 'A', // A = allow, P = prevent
            // 'clientOrderId': this.uuid (),
        };
        const lowercaseType = type.toLowerCase ();
        const orderTypes = this.safeValue (this.options, 'orderTypes', {
            'limit': 'Limit',
            'market': 'Market',
            'stop': 'Stop',
            'stop limit': 'Stop Limit',
            'take profit': 'Take Profit',
        });
        request['type'] = this.safeString (orderTypes, lowercaseType, type);
        let priceIsRequired = false;
        let triggerPriceIsRequired = false;
        if (lowercaseType === 'limit') {
            priceIsRequired = true;
        // } else if (lowercaseType === 'market') {
        //     ...
        // }
        } else if (lowercaseType === 'stop limit') {
            triggerPriceIsRequired = true;
            priceIsRequired = true;
        } else if (lowercaseType === 'take profit') {
            triggerPriceIsRequired = true;
        } else if (lowercaseType === 'stop') {
            triggerPriceIsRequired = true;
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for a ' + type + 'order');
            } else {
                request['price'] = this.priceToPrecision (symbol, price);
            }
        }
        if (triggerPriceIsRequired) {
            const triggerPrice = this.safeNumber (params, 'triggerPrice');
            params = this.omit (params, 'triggerPrice');
            if (triggerPrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a triggerPrice parameter for a ' + type + 'order');
            } else {
                request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
            }
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        }
        params = this.omit (params, 'clientOrderId');
        const response = await this.privatePostOrders (this.extend (request, params));
        //
        //     {
        //         "orderId": "7524",
        //         "marketId": "BTC-AUD",
        //         "side": "Bid",
        //         "type": "Limit",
        //         "creationTime": "2019-08-30T11:08:21.956000Z",
        //         "price": "100.12",
        //         "amount": "1.034",
        //         "openAmount": "1.034",
        //         "status": "Accepted",
        //         "clientOrderId": "1234-5678",
        //         "timeInForce": "IOC",
        //         "postOnly": false,
        //         "selfTrade": "P",
        //         "triggerAmount": "105",
        //         "targetAmount": "1000"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        for (let i = 0; i < ids.length; i++) {
            ids[i] = parseInt (ids[i]);
        }
        const request = {
            'ids': ids,
        };
        return await this.privateDeleteBatchordersIds (this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        return await this.privateDeleteOrdersId (this.extend (request, params));
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        const rate = market[takerOrMaker];
        let currency = undefined;
        let cost = undefined;
        if (market['quote'] === 'AUD') {
            currency = market['quote'];
            cost = parseFloat (this.costToPrecision (symbol, amount * price));
        } else {
            currency = market['base'];
            cost = parseFloat (this.amountToPrecision (symbol, amount));
        }
        return {
            'type': takerOrMaker,
            'currency': currency,
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, rate * cost)),
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'Accepted': 'open',
            'Placed': 'open',
            'Partially Matched': 'open',
            'Fully Matched': 'closed',
            'Cancelled': 'canceled',
            'Partially Cancelled': 'canceled',
            'Failed': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "orderId": "7524",
        //         "marketId": "BTC-AUD",
        //         "side": "Bid",
        //         "type": "Limit",
        //         "creationTime": "2019-08-30T11:08:21.956000Z",
        //         "price": "100.12",
        //         "amount": "1.034",
        //         "openAmount": "1.034",
        //         "status": "Accepted",
        //         "clientOrderId": "1234-5678",
        //         "timeInForce": "IOC",
        //         "postOnly": false,
        //         "selfTrade": "P",
        //         "triggerAmount": "105",
        //         "targetAmount": "1000"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (order, 'creationTime'));
        const marketId = this.safeString (order, 'marketId');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        let side = this.safeString (order, 'side');
        if (side === 'Bid') {
            side = 'buy';
        } else if (side === 'Ask') {
            side = 'sell';
        }
        const type = this.safeStringLower (order, 'type');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'amount');
        const remaining = this.safeString (order, 'openAmount');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const timeInForce = this.safeString (order, 'timeInForce');
        const stopPrice = this.safeNumber (order, 'triggerPrice');
        const postOnly = this.safeValue (order, 'postOnly');
        return this.safeOrder2 ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'cost': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': remaining,
            'average': undefined,
            'status': status,
            'trades': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'status': 'all',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['marketId'] = market['id'];
        }
        if (since !== undefined) {
            request['after'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = { 'status': 'open' };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['marketId'] = market['id'];
        }
        if (since !== undefined) {
            request['after'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "36014819",
        //             "marketId": "XRP-AUD",
        //             "timestamp": "2019-06-25T16:01:02.977000Z",
        //             "price": "0.67",
        //             "amount": "1.50533262",
        //             "side": "Ask",
        //             "fee": "0.00857285",
        //             "orderId": "3648306",
        //             "liquidityType": "Taker",
        //             "clientOrderId": "48"
        //         },
        //         {
        //             "id": "3568960",
        //             "marketId": "GNT-AUD",
        //             "timestamp": "2019-06-20T08:44:04.488000Z",
        //             "price": "0.1362",
        //             "amount": "0.85",
        //             "side": "Bid",
        //             "fee": "0.00098404",
        //             "orderId": "3543015",
        //             "liquidityType": "Maker"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    lookupSymbolFromMarketId (marketId) {
        let market = undefined;
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        return symbol;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.keysort (this.omit (params, this.extractParams (path)));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const secret = this.base64ToBinary (this.encode (this.secret));
            let auth = method + request + nonce;
            if ((method === 'GET') || (method === 'DELETE')) {
                if (Object.keys (query).length) {
                    request += '?' + this.urlencode (query);
                }
            } else {
                body = this.json (query);
                auth += body;
            }
            const signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers = {
                'Accept': 'application/json',
                'Accept-Charset': 'UTF-8',
                'Content-Type': 'application/json',
                'BM-AUTH-APIKEY': this.apiKey,
                'BM-AUTH-TIMESTAMP': nonce,
                'BM-AUTH-SIGNATURE': signature,
            };
        } else if (api === 'public') {
            if (Object.keys (query).length) {
                request += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'][api] + request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('success' in response) {
            if (!response['success']) {
                const error = this.safeString (response, 'errorCode');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions, error, feedback);
                throw new ExchangeError (feedback);
            }
        }
        // v3 api errors
        if (code >= 400) {
            const errorCode = this.safeString (response, 'code');
            const message = this.safeString (response, 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
            this.throwExactlyMatchedException (this.exceptions, message, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
