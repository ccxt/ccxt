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
        });
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined)
            request['limit'] = limit;
        if (since !== undefined)
            request['since'] = since;
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
        if (transferType === 'DEPOSIT')
            type = 'deposit';
        else if (transferType === 'WITHDRAW') {
            type = 'withdrawal';
        } else {
            type = transferType;
        }
        const fee = this.safeFloat (item, 'fee');
        const status = this.parseTransactionStatus (this.safeString (item, 'status'));
        const ccy = this.safeString (item, 'currency');
        const code = this.commonCurrencyCode (ccy);
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
        let response = await this.publicGetV2MarketActive ();
        let result = [];
        let markets = response['markets'];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let baseId = market['instrument'];
            let quoteId = market['currency'];
            let id = baseId + '/' + quoteId;
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            // todo: refactor this
            let fee = (quote === 'AUD') ? 0.0085 : 0.0022;
            let pricePrecision = 2;
            let amountPrecision = 4;
            let minAmount = 0.001; // where does it come from?
            let minPrice = undefined;
            if (quote === 'AUD') {
                if ((base === 'XRP') || (base === 'OMG')) {
                    pricePrecision = 4;
                }
                amountPrecision = -Math.log10 (minAmount);
                minPrice = Math.pow (10, -pricePrecision);
            }
            let precision = {
                'amount': amountPrecision,
                'price': pricePrecision,
            };
            let limits = {
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
                'maker': fee,
                'taker': fee,
                'limits': limits,
                'precision': precision,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAccountBalance ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let multiplier = 100000000;
            let total = parseFloat (balance['balance'] / multiplier);
            let used = parseFloat (balance['pendingFunds'] / multiplier);
            let free = total - used;
            let account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        let multiplier = 100000000; // for price and volume
        return [
            ohlcv[0],
            parseFloat (ohlcv[1]) / multiplier,
            parseFloat (ohlcv[2]) / multiplier,
            parseFloat (ohlcv[3]) / multiplier,
            parseFloat (ohlcv[4]) / multiplier,
            parseFloat (ohlcv[5]) / multiplier,
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.load_markets ();
        let market = this.market (symbol);
        let request = {
            'id': market['id'],
            'timeWindow': this.timeframes[timeframe],
        };
        if (since !== undefined)
            request['since'] = since;
        let response = await this.webGetMarketBTCMarketsIdTickByTime (this.extend (request, params));
        return this.parseOHLCVs (response['ticks'], market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicGetMarketIdOrderbook (this.extend ({
            'id': market['id'],
        }, params));
        let timestamp = orderbook['timestamp'] * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['timestamp'] * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'lastPrice');
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
        let market = this.market (symbol);
        let ticker = await this.publicGetMarketIdTick (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'info': trade,
            'id': trade['tid'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketIdTrades (this.extend ({
            // 'since': 59868345231,
            'id': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let multiplier = 100000000; // for price and volume
        let orderSide = (side === 'buy') ? 'Bid' : 'Ask';
        let order = this.ordered ({
            'currency': market['quote'],
        });
        order['currency'] = market['quote'];
        order['instrument'] = market['base'];
        order['price'] = parseInt (price * multiplier);
        order['volume'] = parseInt (amount * multiplier);
        order['orderSide'] = orderSide;
        order['ordertype'] = this.capitalize (type);
        order['clientRequestId'] = this.nonce ().toString ();
        let response = await this.privatePostOrderCreate (order);
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        for (let i = 0; i < ids.length; i++) {
            ids[i] = parseInt (ids[i]);
        }
        return await this.privatePostOrderCancel ({ 'orderIds': ids });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.cancelOrders ([ id ]);
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let rate = market[takerOrMaker];
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
        let multiplier = 100000000;
        let timestamp = trade['creationTime'];
        let side = (trade['side'] === 'Bid') ? 'buy' : 'sell';
        // BTCMarkets always charge in AUD for AUD-related transactions.
        let currency = (market['quote'] === 'AUD') ? market['quote'] : market['base'];
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': trade['price'] / multiplier,
            'fee': {
                'currency': currency,
                'cost': trade['fee'] / multiplier,
            },
            'amount': trade['volume'] / multiplier,
            'order': this.safeString (trade, 'orderId'),
        };
    }

    parseMyTrades (trades, market = undefined, since = undefined, limit = undefined) {
        let result = [];
        for (let i = 0; i < trades.length; i++) {
            let trade = this.parseMyTrade (trades[i], market);
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
                cost = this.sum (cost, trade[i]['cost']);
            }
            if (filled > 0) {
                average = cost / filled;
            }
            lastTradeTimestamp = trades[numTrades - 1]['timestamp'];
        }
        let result = {
            'info': order,
            'id': order['id'].toString (),
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
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = [ parseInt (id) ];
        let response = await this.privatePostOrderDetail (this.extend ({
            'orderIds': ids,
        }, params));
        let numOrders = response['orders'].length;
        if (numOrders < 1)
            throw new OrderNotFound (this.id + ' No matching order found: ' + id);
        let order = response['orders'][0];
        return this.parseOrder (order);
    }

    createPaginatedRequest (market, since = undefined, limit = undefined) {
        let request = this.ordered ({
            'currency': market['quoteId'],
            'instrument': market['baseId'],
        });
        if (limit !== undefined)
            request['limit'] = limit;
        else
            request['limit'] = 100;
        if (since !== undefined)
            request['since'] = since;
        else
            request['since'] = 0;
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
        let uri = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + uri;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let auth = undefined;
            headers = {
                'apikey': this.apiKey,
                'timestamp': nonce,
            };
            if (method === 'post') {
                headers['Content-Type'] = 'application/json';
                auth = uri + "\n" + nonce + "\n"; // eslint-disable-line quotes
                body = this.json (params);
                auth += body;
            } else {
                let query = this.ksort (this.omit (params, this.extractParams (path)));
                let queryString = '';
                if (Object.keys (query).length) {
                    queryString = this.urlencode (query);
                    url += '?' + queryString;
                    queryString += "\n"; // eslint-disable-line quotes
                }
                auth = uri + "\n" + queryString + nonce + "\n"; // eslint-disable-line quotes
            }
            let secret = this.base64ToBinary (this.secret);
            let signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers['signature'] = this.decode (signature);
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (body.length < 2)
            return; // fallback to default error handler
        if (body[0] === '{') {
            if ('success' in response) {
                if (!response['success']) {
                    let error = this.safeString (response, 'errorCode');
                    let message = this.id + ' ' + this.json (response);
                    if (error in this.exceptions) {
                        let ExceptionClass = this.exceptions[error];
                        throw new ExceptionClass (message);
                    } else {
                        throw new ExchangeError (message);
                    }
                }
            }
        }
    }
};
