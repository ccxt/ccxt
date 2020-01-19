'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, OrderNotFound, ArgumentsRequired, InvalidOrder, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class btcmarkets extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcmarkets',
            'name': 'BTC Markets',
            'countries': [ 'AU' ], // Australia
            'rateLimit': 1000, // market data cached for 1 second (trades cached for 2 seconds)
            'has': {
                'CORS': false,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchClosedOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'cancelOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29142911-0e1acfc2-7d5c-11e7-98c4-07d9532b29d7.jpg',
                'api': {
                    'public': 'https://api.btcmarkets.net',
                    'private': 'https://api.btcmarkets.net',
                    'web': 'https://btcmarkets.net/data',
                },
                'www': 'https://btcmarkets.net',
                'doc': 'https://github.com/BTCMarkets/API',
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
        const response = await this.publicGetV2MarketActive (params);
        const result = [];
        const markets = this.safeValue (response, 'markets');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseId = this.safeString (market, 'instrument');
            const quoteId = this.safeString (market, 'currency');
            const id = baseId + '/' + quoteId;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const fees = this.safeValue (this.safeValue (this.options, 'fees', {}), quote, this.fees);
            let pricePrecision = 2;
            let amountPrecision = 4;
            const minAmount = 0.001; // where does it come from?
            let minPrice = undefined;
            if (quote === 'AUD') {
                if ((base === 'XRP') || (base === 'OMG')) {
                    pricePrecision = 4;
                }
                amountPrecision = -Math.log10 (minAmount);
                minPrice = Math.pow (10, -pricePrecision);
            }
            const precision = {
                'amount': amountPrecision,
                'price': pricePrecision,
            };
            const limits = {
                'amount': {
                    'min': minAmount,
                    'max': undefined,
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

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
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
        const timestamp = this.safeTimestamp (trade, 'timestamp');
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
        const multiplier = 100000000; // for price and volume
        const orderSide = (side === 'buy') ? 'Bid' : 'Ask';
        const request = this.ordered ({
            'currency': market['quote'],
        });
        request['currency'] = market['quote'];
        request['instrument'] = market['base'];
        request['price'] = parseInt (price * multiplier);
        request['volume'] = parseInt (amount * multiplier);
        request['orderSide'] = orderSide;
        request['ordertype'] = this.capitalize (type);
        request['clientRequestId'] = this.nonce ().toString ();
        const response = await this.privatePostOrderCreate (this.extend (request, params));
        const id = this.safeString (response, 'id');
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
            'orderIds': ids,
        };
        return await this.privatePostOrderCancel (this.extend (request, params));
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
        const multiplier = 100000000;
        const timestamp = this.safeInteger (trade, 'creationTime');
        let side = this.safeFloat (trade, 'side');
        side = (side === 'Bid') ? 'buy' : 'sell';
        // BTCMarkets always charge in AUD for AUD-related transactions.
        let feeCurrencyCode = undefined;
        let symbol = undefined;
        if (market !== undefined) {
            feeCurrencyCode = (market['quote'] === 'AUD') ? market['quote'] : market['base'];
            symbol = market['symbol'];
        }
        const id = this.safeString (trade, 'id');
        let price = this.safeFloat (trade, 'price');
        if (price !== undefined) {
            price /= multiplier;
        }
        let amount = this.safeFloat (trade, 'volume');
        if (amount !== undefined) {
            amount /= multiplier;
        }
        let feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            feeCost /= multiplier;
        }
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
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': {
                'currency': feeCurrencyCode,
                'cost': feeCost,
            },
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

    parseOrder (order, market = undefined) {
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
        return {
            'info': order,
            'id': id,
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
        const ids = [ parseInt (id) ];
        const request = {
            'orderIds': ids,
        };
        const response = await this.privatePostOrderDetail (this.extend (request, params));
        const numOrders = response['orders'].length;
        if (numOrders < 1) {
            throw new OrderNotFound (this.id + ' No matching order found: ' + id);
        }
        const order = response['orders'][0];
        return this.parseOrder (order);
    }

    createPaginatedRequest (market, since = undefined, limit = undefined) {
        limit = (limit === undefined) ? 100 : limit;
        since = (since === undefined) ? 0 : since;
        const request = this.ordered ({
            'currency': market['quoteId'],
            'instrument': market['baseId'],
            'limit': limit,
            'since': since,
        });
        return request;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ': fetchOrders requires a `symbol` argument.');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.createPaginatedRequest (market, since, limit);
        const response = await this.privatePostOrderHistory (this.extend (request, params));
        return this.parseOrders (response['orders'], market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ': fetchOpenOrders requires a `symbol` argument.');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.createPaginatedRequest (market, since, limit);
        const response = await this.privatePostOrderOpen (this.extend (request, params));
        return this.parseOrders (response['orders'], market);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ': fetchMyTrades requires a `symbol` argument.');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.createPaginatedRequest (market, since, limit);
        const response = await this.privatePostOrderTradeHistory (this.extend (request, params));
        return this.parseMyTrades (response['trades'], market);
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
