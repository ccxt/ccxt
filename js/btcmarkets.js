'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, OrderNotFound, ArgumentsRequired, InvalidOrder, DDoSProtection } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class btcmarkets extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcmarkets',
            'name': 'BTC Markets',
            'countries': [ 'AU' ], // Australia
            'rateLimit': 1000, // market data cached for 1 second (trades cached for 2 seconds)
            'has': {
                'cancelOrder': true,
                'cancelOrders': true,
                'CORS': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': 'emulated',
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTransactions': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29142911-0e1acfc2-7d5c-11e7-98c4-07d9532b29d7.jpg',
                'api': {
                    'public': 'https://api.btcmarkets.net',
                    'private': 'https://api.btcmarkets.net',
                    'privateV3': 'https://api.btcmarkets.net/v3',
                    'web': 'https://btcmarkets.net/data',
                },
                'www': 'https://btcmarkets.net',
                'doc': [
                    'https://api.btcmarkets.net/doc/v3#section/API-client-libraries',
                    'https://github.com/BTCMarkets/API',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'market/{id}/tick',
                        'market/{id}/orderbook',
                        'market/{id}/trades',
                        'v2/market/{id}/tickByTime/{timeframe}',
                        'v2/market/{id}/trades',
                        'v2/market/active',
                        'v3/markets',
                        'v3/markets/{marketId}/ticker',
                        'v3/markets/{marketId}/trades',
                        'v3/markets/{marketId}/orderbook',
                        'v3/markets/{marketId}/candles',
                        'v3/markets/tickers',
                        'v3/markets/orderbooks',
                        'v3/time',
                    ],
                },
                'private': {
                    'get': [
                        'account/balance',
                        'account/{id}/tradingfee',
                        'fundtransfer/history',
                        'v2/order/open',
                        'v2/order/open/{id}',
                        'v2/order/history/{instrument}/{currency}/',
                        'v2/order/trade/history/{id}',
                        'v2/transaction/history/{currency}',
                    ],
                    'post': [
                        'fundtransfer/withdrawCrypto',
                        'fundtransfer/withdrawEFT',
                        'order/create',
                        'order/cancel',
                        'order/history',
                        'order/open',
                        'order/trade/history',
                        'order/createBatch', // they promise it's coming soon...
                        'order/detail',
                    ],
                },
                'privateV3': {
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
                'web': {
                    'get': [
                        'market/BTCMarkets/{id}/tickByTime',
                    ],
                },
            },
            'timeframes': {
                '1m': 'minute',
                '1h': 'hour',
                '1d': 'day',
            },
            'exceptions': {
                '3': InvalidOrder,
                '6': DDoSProtection,
            },
            'fees': {
                'percentage': true,
                'tierBased': true,
                'maker': -0.05 / 100,
                'taker': 0.20 / 100,
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

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.privateGetFundtransferHistory (this.extend (request, params));
        const transactions = response['fundTransfers'];
        return this.parseTransactions (transactions, undefined, since, limit);
    }

    parseTransactionStatus (status) {
        // todo: find more statuses
        const statuses = {
            'Complete': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (item, currency = undefined) {
        //
        //     {
        //         status: 'Complete',
        //         fundTransferId: 1904311906,
        //         description: 'ETH withdraw from [me@email.com] to Address: 0xF123aa44FadEa913a7da99cc2eE202Db684Ce0e3 amount: 8.28965701 fee: 0.00000000',
        //         creationTime: 1529418358525,
        //         currency: 'ETH',
        //         amount: 828965701,
        //         fee: 0,
        //         transferType: 'WITHDRAW',
        //         errorMessage: null,
        //         lastUpdate: 1529418376754,
        //         cryptoPaymentDetail: {
        //             address: '0xF123aa44FadEa913a7da99cc2eE202Db684Ce0e3',
        //             txId: '0x8fe483b6f9523559b9ebffb29624f98e86227d2660d4a1fd4785d45e51c662c2'
        //         }
        //     }
        //
        //     {
        //         status: 'Complete',
        //         fundTransferId: 494077500,
        //         description: 'BITCOIN Deposit, B 0.1000',
        //         creationTime: 1501077601015,
        //         currency: 'BTC',
        //         amount: 10000000,
        //         fee: 0,
        //         transferType: 'DEPOSIT',
        //         errorMessage: null,
        //         lastUpdate: 1501077601133,
        //         cryptoPaymentDetail: null
        //     }
        //
        //     {
        //         "fee": 0,
        //         "amount": 56,
        //         "status": "Complete",
        //         "currency": "BCHABC",
        //         "lastUpdate": 1542339164044,
        //         "description": "BitcoinCashABC Deposit, P 0.00000056",
        //         "creationTime": 1542339164003,
        //         "errorMessage": null,
        //         "transferType": "DEPOSIT",
        //         "fundTransferId": 2527326972,
        //         "cryptoPaymentDetail": null
        //     }
        //
        const timestamp = this.safeInteger (item, 'creationTime');
        const lastUpdate = this.safeInteger (item, 'lastUpdate');
        const transferType = this.safeString (item, 'transferType');
        const cryptoPaymentDetail = this.safeValue (item, 'cryptoPaymentDetail', {});
        const address = this.safeString (cryptoPaymentDetail, 'address');
        const txid = this.safeString (cryptoPaymentDetail, 'txId');
        let type = undefined;
        if (transferType === 'DEPOSIT') {
            type = 'deposit';
        } else if (transferType === 'WITHDRAW') {
            type = 'withdrawal';
        } else {
            type = transferType;
        }
        const fee = this.safeFloat (item, 'fee');
        const status = this.parseTransactionStatus (this.safeString (item, 'status'));
        const ccy = this.safeString (item, 'currency');
        const code = this.safeCurrencyCode (ccy);
        // todo: this logic is duplicated below
        let amount = this.safeFloat (item, 'amount');
        if (amount !== undefined) {
            amount = amount * 1e-8;
        }
        return {
            'id': this.safeString (item, 'fundTransferId'),
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': lastUpdate,
            'fee': {
                'currency': code,
                'cost': fee,
            },
            'info': item,
        };
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetV3Markets (params);
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
            const pricePrecision = this.safeFloat (market, 'priceDecimals');
            const amountPrecision = this.safeFloat (market, 'amountDecimals');
            const minAmount = this.safeFloat (market, 'minOrderAmount');
            const maxAmount = this.safeFloat (market, 'maxOrderAmount');
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
                'active': undefined,
                'maker': fees['maker'],
                'taker': fees['taker'],
                'limits': limits,
                'precision': precision,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privateGetAccountBalance (params);
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const multiplier = 100000000;
            let total = this.safeFloat (balance, 'balance');
            if (total !== undefined) {
                total /= multiplier;
            }
            let used = this.safeFloat (balance, 'pendingFunds');
            if (used !== undefined) {
                used /= multiplier;
            }
            const account = this.account ();
            account['used'] = used;
            account['total'] = total;
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "timestamp":1572307200000,
        //         "open":1962218,
        //         "high":1974850,
        //         "low":1962208,
        //         "close":1974850,
        //         "volume":305211315,
        //     }
        //
        const multiplier = 100000000; // for price and volume
        const keys = [ 'open', 'high', 'low', 'close', 'volume' ];
        const result = [
            this.safeInteger (ohlcv, 'timestamp'),
        ];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            let value = this.safeFloat (ohlcv, key);
            if (value !== undefined) {
                value = value / multiplier;
            }
            result.push (value);
        }
        return result;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.load_markets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
            'timeframe': this.timeframes[timeframe],
            // set to true to see candles more recent than the timestamp in the
            // since parameter, if a since parameter is used, default is false
            'indexForward': true,
            // set to true to see the earliest candles first in the list of
            // returned candles in chronological order, default is false
            'sortForward': true,
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default is 3000
        }
        const response = await this.publicGetV2MarketIdTickByTimeTimeframe (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "paging":{
        //             "newer":"/v2/market/ETH/BTC/tickByTime/day?indexForward=true&since=1572307200000",
        //             "older":"/v2/market/ETH/BTC/tickByTime/day?since=1457827200000"
        //         },
        //         "ticks":[
        //             {"timestamp":1572307200000,"open":1962218,"high":1974850,"low":1962208,"close":1974850,"volume":305211315},
        //             {"timestamp":1572220800000,"open":1924700,"high":1951276,"low":1909328,"close":1951276,"volume":1086067595},
        //             {"timestamp":1572134400000,"open":1962155,"high":1962734,"low":1900905,"close":1930243,"volume":790141098},
        //         ],
        //     }
        //
        const ticks = this.safeValue (response, 'ticks', []);
        return this.parseOHLCVs (ticks, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetMarketIdOrderbook (this.extend (request, params));
        const timestamp = this.safeTimestamp (response, 'timestamp');
        return this.parseOrderBook (response, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'lastPrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'bestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'bestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume24h'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetMarketIdTick (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'date');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (trade, 'tid');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        return {
            'info': trade,
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
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
            // 'since': 59868345231,
            'id': market['id'],
        };
        const response = await this.publicGetMarketIdTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.ordered ({
            'marketId': market.id,
            'price': type === 'limit' ? this.priceToPrecision (symbol, price) : "",
            'amount': this.priceToPrecision (symbol, amount),
            'type': type === 'limit' ? "Limit" : "Market",
            'side': side === 'buy' ? 'Bid' : 'Ask',
            'clientOrderId': this.safeValue( params, 'clientOrderId'),
        });
        // todo: add support for "Stop Limit" "Stop" "Take Profit" order types
        const response = await this.privateV3PostOrders (this.extend (request, params));
        const id = this.safeString (response, 'orderId');
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        for (let i = 0; i < ids.length; i++) {
            ids[i] = parseInt (ids[i]);
        }
        const request = {
            'ids': ids,
        };
        return await this.privateV3DeleteBatchordersIds (this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.cancelOrders ([ id ]);
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

    parseMyTrade (trade, market) {
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        const side = (this.safeFloat (trade, 'side') === 'Bid') ? 'buy' : 'sell';
        // BTCMarkets always charge in AUD for AUD-related transactions.
        let feeCurrencyCode = undefined;
        const marketId = this.safeString (trade, 'marketId');
        if (market === undefined) {
            market = this.markets_by_id[marketId];
        }
        let symbol;
        if (market === undefined) {
            // happens for some markets like BCH-BTC
            const [baseId, quoteId] = marketId.split("-");
            symbol = this.safeCurrencyCode (baseId, baseId) + "/" + this.safeCurrencyCode (quoteId, quoteId);
            feeCurrencyCode = (quoteId === 'AUD') ? market['quote'] : market['base'];
        } else {
            symbol = market['symbol'];
            feeCurrencyCode = (market['quote'] === 'AUD') ? market['quote'] : market['base'];
        }
        const id = this.safeString (trade, 'id');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        const feeCost = this.safeFloat (trade, 'fee');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        const orderId = this.safeString (trade, 'orderId');
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': orderId,
            'symbol': symbol,
            'type': price === undefined ? 'market' : 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': {
                'currency': feeCurrencyCode,
                'cost': feeCost,
            },
            'takerOrMaker': undefined,
        };
    }

    parseMyTrades (trades, market = undefined, since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = this.parseMyTrade (trades[i], market);
            result.push (trade);
        }
        return result;
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

    parseV3Order(order, market = undefined) {
        // a v3 api order
        const timestamp = this.parse8601 (this.safeString (order, 'creationTime'));
        const marketId = this.safeString (order, 'marketId');
        if (market === undefined) {
            market = this.markets_by_id[marketId];
        }
        let symbol;
        if (market === undefined) {
            // happens for some markets like BCH-BTC
            const [baseId, quoteId] = marketId.split("-");
            symbol = this.safeCurrencyCode (baseId, baseId) + "/" + this.safeCurrencyCode (quoteId, quoteId)
        } else {
            symbol = market['symbol'];
        }
        const side = (this.safeString (order, 'side') === 'Bid') ? 'buy' : 'sell';
        const type = this.safeString (order, 'type').toLowerCase ();
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const remaining = this.safeFloat (order, 'openAmount');
        const filled = amount - remaining;
        const status = this.parseOrderStatus(this.safeString (order, 'status'));
        return {
            'info': order,
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': undefined,
            'status': status,
            'trades': undefined,
            'fee': undefined,
        };
    }

    parseOrder (order, market = undefined) {
        if (order['orderId']) {
            return this.parseV3Order(order, market);
        }
        const multiplier = 100000000;
        const side = (order['orderSide'] === 'Bid') ? 'buy' : 'sell';
        const type = (order['ordertype'] === 'Limit') ? 'limit' : 'market';
        const timestamp = this.safeInteger (order, 'creationTime');
        if (market === undefined) {
            market = this.market (order['instrument'] + '/' + order['currency']);
        }
        let status = 'open';
        if (order['status'] === 'Failed' || order['status'] === 'Cancelled' || order['status'] === 'Partially Cancelled' || order['status'] === 'Error') {
            status = 'canceled';
        } else if (order['status'] === 'Fully Matched' || order['status'] === 'Partially Matched') {
            status = 'closed';
        }
        const price = this.safeFloat (order, 'price') / multiplier;
        const amount = this.safeFloat (order, 'volume') / multiplier;
        const remaining = this.safeFloat (order, 'openVolume', 0.0) / multiplier;
        const filled = amount - remaining;
        const trades = this.parseMyTrades (order['trades'], market);
        const numTrades = trades.length;
        let cost = filled * price;
        let average = undefined;
        let lastTradeTimestamp = undefined;
        if (numTrades > 0) {
            cost = 0;
            for (let i = 0; i < numTrades; i++) {
                const trade = trades[i];
                cost = this.sum (cost, trade['cost']);
            }
            if (filled > 0) {
                average = cost / filled;
            }
            lastTradeTimestamp = trades[numTrades - 1]['timestamp'];
        }
        const id = this.safeString (order, 'id');
        const clientOrderId = this.safeString (order, 'clientRequestId');
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': average,
            'status': status,
            'trades': trades,
            'fee': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateV3GetOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (!params['status']) {
            request['status'] = 'all';
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let market;
        if (symbol) {
            market = this.market(symbol);
            request['marketId'] = market.id;
        }
        if (since) {
            request['after'] = since;
        }
        const response = await this.privateV3GetOrders(this.extend (request, params));
        return this.parseOrders (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend ({'status': 'open'}, params))
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let market;
        if (symbol) {
            market = this.market(symbol);
            request['marketId'] = market.id;
        }
        if (since) {
            request['after'] = since;
        }
        const response = await this.privateV3GetTrades(this.extend (request, params));
        return this.parseMyTrades (response);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const uri = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + uri;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let auth = undefined;
            headers = {
                'apikey': this.apiKey,
                'timestamp': nonce,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                auth = uri + "\n" + nonce + "\n"; // eslint-disable-line quotes
                body = this.json (params);
                auth += body;
            } else {
                const query = this.keysort (this.omit (params, this.extractParams (path)));
                let queryString = '';
                if (Object.keys (query).length) {
                    queryString = this.urlencode (query);
                    url += '?' + queryString;
                    queryString += "\n"; // eslint-disable-line quotes
                }
                auth = uri + "\n" + queryString + nonce + "\n"; // eslint-disable-line quotes
            }
            const secret = this.base64ToBinary (this.secret);
            const signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers['signature'] = this.decode (signature);
        } else if (api === 'privateV3') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const secret = this.base64ToBinary (this.secret); // or stringToBase64
            const pathWithLeadingSlash = '/v3' + uri;
            if (method !== 'GET') {
                body = this.json (params);
            } else {
                body = "";
            }
            const auth = method + pathWithLeadingSlash + nonce + body;
            const signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers = {
                'Accept': 'application/json',
                'Accept-Charset': 'UTF-8',
                'Content-Type': 'application/json',
                'BM-AUTH-APIKEY': this.apiKey,
                'BM-AUTH-TIMESTAMP': nonce,
                'BM-AUTH-SIGNATURE': signature,
            };
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
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
    }
};
