'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, RequestTimeout, AuthenticationError, DDoSProtection, InsufficientFunds, OrderNotFound, OrderNotCached, InvalidOrder, CancelPending, InvalidNonce } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class poloniex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'poloniex',
            'name': 'Poloniex',
            'countries': 'US',
            'rateLimit': 1000, // up to 6 calls per second
            'has': {
                'createDepositAddress': true,
                'fetchDepositAddress': true,
                'CORS': false,
                'editOrder': true,
                'createMarketOrder': false,
                'fetchOHLCV': true,
                'fetchMyTrades': true,
                'fetchOrder': 'emulated',
                'fetchOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchClosedOrders': 'emulated',
                'fetchTickers': true,
                'fetchTradingFees': true,
                'fetchCurrencies': true,
                'withdraw': true,
            },
            'timeframes': {
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '2h': 7200,
                '4h': 14400,
                '1d': 86400,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
                'api': {
                    'public': 'https://poloniex.com/public',
                    'private': 'https://poloniex.com/tradingApi',
                },
                'www': 'https://poloniex.com',
                'doc': [
                    'https://poloniex.com/support/api/',
                    'http://pastebin.com/dMX7mZE0',
                ],
                'fees': 'https://poloniex.com/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'return24hVolume',
                        'returnChartData',
                        'returnCurrencies',
                        'returnLoanOrders',
                        'returnOrderBook',
                        'returnTicker',
                        'returnTradeHistory',
                    ],
                },
                'private': {
                    'post': [
                        'buy',
                        'cancelLoanOffer',
                        'cancelOrder',
                        'closeMarginPosition',
                        'createLoanOffer',
                        'generateNewAddress',
                        'getMarginPosition',
                        'marginBuy',
                        'marginSell',
                        'moveOrder',
                        'returnActiveLoans',
                        'returnAvailableAccountBalances',
                        'returnBalances',
                        'returnCompleteBalances',
                        'returnDepositAddresses',
                        'returnDepositsWithdrawals',
                        'returnFeeInfo',
                        'returnLendingHistory',
                        'returnMarginAccountSummary',
                        'returnOpenLoanOffers',
                        'returnOpenOrders',
                        'returnOrderTrades',
                        'returnTradableBalances',
                        'returnTradeHistory',
                        'sell',
                        'toggleAutoRenew',
                        'transferBalance',
                        'withdraw',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0015,
                    'taker': 0.0025,
                },
                'funding': {},
            },
            'limits': {
                'amount': {
                    'min': 0.00000001,
                    'max': 1000000000,
                },
                'price': {
                    'min': 0.00000001,
                    'max': 1000000000,
                },
                'cost': {
                    'min': 0.00000000,
                    'max': 1000000000,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'commonCurrencies': {
                'BTM': 'Bitmark',
                'STR': 'XLM',
                'BCC': 'BTCtalkcoin',
            },
        });
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            ohlcv['date'] * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['quoteVolume'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (!since)
            since = 0;
        let request = {
            'currencyPair': market['id'],
            'period': this.timeframes[timeframe],
            'start': parseInt (since / 1000),
        };
        if (typeof limit !== 'undefined')
            request['end'] = this.sum (request['start'], limit * this.timeframes[timeframe]);
        let response = await this.publicGetReturnChartData (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchMarkets () {
        let markets = await this.publicGetReturnTicker ();
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let market = markets[id];
            let [ quote, base ] = id.split ('_');
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': true,
                'precision': {
                    'amount': 8,
                    'price': 8,
                },
                'limits': {
                    'amount': {
                        'min': 0.00000001,
                        'max': 1000000000,
                    },
                    'price': {
                        'min': 0.00000001,
                        'max': 1000000000,
                    },
                    'cost': {
                        'min': 0.00000000,
                        'max': 1000000000,
                    },
                },
                'info': market,
            }));
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privatePostReturnCompleteBalances (this.extend ({
            'account': 'all',
        }, params));
        let result = { 'info': balances };
        let currencies = Object.keys (balances);
        for (let c = 0; c < currencies.length; c++) {
            let id = currencies[c];
            let balance = balances[id];
            let currency = this.commonCurrencyCode (id);
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['onOrders']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        let fees = await this.privatePostReturnFeeInfo ();
        return {
            'info': fees,
            'maker': this.safeFloat (fees, 'makerFee'),
            'taker': this.safeFloat (fees, 'takerFee'),
            'withdraw': {},
            'deposit': {},
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'currencyPair': this.marketId (symbol),
        };
        if (typeof limit !== 'undefined')
            request['depth'] = limit; // 100
        let response = await this.publicGetReturnOrderBook (this.extend (request, params));
        let orderbook = this.parseOrderBook (response);
        orderbook['nonce'] = this.safeInteger (response, 'sec');
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let open = undefined;
        let change = undefined;
        let average = undefined;
        let last = this.safeFloat (ticker, 'last');
        let relativeChange = this.safeFloat (ticker, 'percentChange');
        if (relativeChange !== -1) {
            open = last / this.sum (1, relativeChange);
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24hr'),
            'low': this.safeFloat (ticker, 'low24hr'),
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
            'percentage': relativeChange * 100,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'quoteVolume'),
            'quoteVolume': this.safeFloat (ticker, 'baseVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetReturnTicker (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let currencies = await this.publicGetReturnCurrencies (params);
        let ids = Object.keys (currencies);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let currency = currencies[id];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            let precision = 8; // default precision, todo: fix "magic constants"
            let code = this.commonCurrencyCode (id);
            let active = (currency['delisted'] === 0);
            let status = (currency['disabled']) ? 'disabled' : 'ok';
            if (status !== 'ok')
                active = false;
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'status': status,
                'fee': this.safeFloat (currency, 'txFee'), // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currency['txFee'],
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let tickers = await this.publicGetReturnTicker (params);
        let ticker = tickers[market['id']];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['date']);
        let symbol = undefined;
        let base = undefined;
        let quote = undefined;
        if ((!market) && ('currencyPair' in trade)) {
            let currencyPair = trade['currencyPair'];
            if (currencyPair in this.markets_by_id) {
                market = this.markets_by_id[currencyPair];
            } else {
                let parts = currencyPair.split ('_');
                quote = parts[0];
                base = parts[1];
                symbol = base + '/' + quote;
            }
        }
        if (market) {
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        }
        let side = trade['type'];
        let fee = undefined;
        let cost = this.safeFloat (trade, 'total');
        let amount = this.safeFloat (trade, 'amount');
        if ('fee' in trade) {
            let rate = this.safeFloat (trade, 'fee');
            let feeCost = undefined;
            let currency = undefined;
            if (side === 'buy') {
                currency = base;
                feeCost = amount * rate;
            } else {
                currency = quote;
                if (typeof cost !== 'undefined')
                    feeCost = cost * rate;
            }
            fee = {
                'type': undefined,
                'rate': rate,
                'cost': feeCost,
                'currency': currency,
            };
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'tradeID'),
            'order': this.safeString (trade, 'orderNumber'),
            'type': 'limit',
            'side': side,
            'price': this.safeFloat (trade, 'rate'),
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'currencyPair': market['id'],
        };
        if (typeof since !== 'undefined') {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.seconds (); // last 50000 trades by default
        }
        let trades = await this.publicGetReturnTradeHistory (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol)
            market = this.market (symbol);
        let pair = market ? market['id'] : 'all';
        let request = { 'currencyPair': pair };
        if (typeof since !== 'undefined') {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.seconds ();
        }
        // limit is disabled (does not really work as expected)
        if (limit)
            request['limit'] = parseInt (limit);
        let response = await this.privatePostReturnTradeHistory (this.extend (request, params));
        let result = [];
        if (market) {
            result = this.parseTrades (response, market);
        } else {
            if (response) {
                let ids = Object.keys (response);
                for (let i = 0; i < ids.length; i++) {
                    let id = ids[i];
                    let market = undefined;
                    if (id in this.markets_by_id)
                        market = this.markets_by_id[id];
                    let trades = this.parseTrades (response[id], market);
                    for (let j = 0; j < trades.length; j++) {
                        result.push (trades[j]);
                    }
                }
            }
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    parseOrder (order, market = undefined) {
        let timestamp = this.safeInteger (order, 'timestamp');
        if (!timestamp)
            timestamp = this.parse8601 (order['date']);
        let trades = undefined;
        if ('resultingTrades' in order)
            trades = this.parseTrades (order['resultingTrades'], market);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let price = this.safeFloat (order, 'price');
        let remaining = this.safeFloat (order, 'amount');
        let amount = this.safeFloat (order, 'startingAmount', remaining);
        let filled = undefined;
        let cost = 0;
        if (typeof amount !== 'undefined') {
            if (typeof remaining !== 'undefined') {
                filled = amount - remaining;
                if (typeof price !== 'undefined')
                    cost = filled * price;
            }
        }
        if (typeof filled === 'undefined') {
            if (typeof trades !== 'undefined') {
                filled = 0;
                cost = 0;
                for (let i = 0; i < trades.length; i++) {
                    let trade = trades[i];
                    let tradeAmount = trade['amount'];
                    let tradePrice = trade['price'];
                    filled = this.sum (filled, tradeAmount);
                    cost += tradePrice * tradeAmount;
                }
            }
        }
        return {
            'info': order,
            'id': order['orderNumber'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': order['status'],
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': undefined,
        };
    }

    parseOpenOrders (orders, market, result = []) {
        for (let i = 0; i < orders.length; i++) {
            let order = orders[i];
            let extended = this.extend (order, {
                'status': 'open',
                'type': 'limit',
                'side': order['type'],
                'price': order['rate'],
            });
            result.push (this.parseOrder (extended, market));
        }
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol)
            market = this.market (symbol);
        let pair = market ? market['id'] : 'all';
        let response = await this.privatePostReturnOpenOrders (this.extend ({
            'currencyPair': pair,
        }));
        let openOrders = [];
        if (market) {
            openOrders = this.parseOpenOrders (response, market, openOrders);
        } else {
            let marketIds = Object.keys (response);
            for (let i = 0; i < marketIds.length; i++) {
                let marketId = marketIds[i];
                let orders = response[marketId];
                let m = this.markets_by_id[marketId];
                openOrders = this.parseOpenOrders (orders, m, openOrders);
            }
        }
        for (let j = 0; j < openOrders.length; j++) {
            this.orders[openOrders[j]['id']] = openOrders[j];
        }
        let openOrdersIndexedById = this.indexBy (openOrders, 'id');
        let cachedOrderIds = Object.keys (this.orders);
        let result = [];
        for (let k = 0; k < cachedOrderIds.length; k++) {
            let id = cachedOrderIds[k];
            if (id in openOrdersIndexedById) {
                this.orders[id] = this.extend (this.orders[id], openOrdersIndexedById[id]);
            } else {
                let order = this.orders[id];
                if (order['status'] === 'open') {
                    order = this.extend (order, {
                        'status': 'closed',
                        'cost': undefined,
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                    if (typeof order['cost'] === 'undefined') {
                        if (typeof order['filled'] !== 'undefined')
                            order['cost'] = order['filled'] * order['price'];
                    }
                    this.orders[id] = order;
                }
            }
            let order = this.orders[id];
            if (market) {
                if (order['symbol'] === symbol)
                    result.push (order);
            } else {
                result.push (order);
            }
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let since = this.safeValue (params, 'since');
        let limit = this.safeValue (params, 'limit');
        let request = this.omit (params, [ 'since', 'limit' ]);
        let orders = await this.fetchOrders (symbol, since, limit, request);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['id'] === id)
                return orders[i];
        }
        throw new OrderNotCached (this.id + ' order id ' + id.toString () + ' is not in "open" state and not found in cache');
    }

    filterOrdersByStatus (orders, status) {
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] === status)
                result.push (orders[i]);
        }
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterOrdersByStatus (orders, 'open');
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterOrdersByStatus (orders, 'closed');
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let method = 'privatePost' + this.capitalize (side);
        let market = this.market (symbol);
        price = parseFloat (price);
        amount = parseFloat (amount);
        let response = await this[method] (this.extend ({
            'currencyPair': market['id'],
            'rate': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
        }, params));
        let timestamp = this.milliseconds ();
        let order = this.parseOrder (this.extend ({
            'timestamp': timestamp,
            'status': 'open',
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
        }, response), market);
        let id = order['id'];
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        price = parseFloat (price);
        let request = {
            'orderNumber': id,
            'rate': this.priceToPrecision (symbol, price),
        };
        if (typeof amount !== 'undefined') {
            amount = parseFloat (amount);
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        let response = await this.privatePostMoveOrder (this.extend (request, params));
        let result = undefined;
        if (id in this.orders) {
            this.orders[id]['status'] = 'canceled';
            let newid = response['orderNumber'];
            this.orders[newid] = this.extend (this.orders[id], {
                'id': newid,
                'price': price,
                'status': 'open',
            });
            if (typeof amount !== 'undefined')
                this.orders[newid]['amount'] = amount;
            result = this.extend (this.orders[newid], { 'info': response });
        } else {
            let market = undefined;
            if (symbol)
                market = this.market (symbol);
            result = this.parseOrder (response, market);
            this.orders[result['id']] = result;
        }
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.privatePostCancelOrder (this.extend ({
                'orderNumber': id,
            }, params));
        } catch (e) {
            if (e instanceof CancelPending) {
                // A request to cancel the order has been sent already.
                // If we then attempt to cancel the order the second time
                // before the first request is processed the exchange will
                // throw a CancelPending exception. Poloniex won't show the
                // order in the list of active (open) orders and the cached
                // order will be marked as 'closed' (see #1801 for details).
                // To avoid that we proactively mark the order as 'canceled'
                // here. If for some reason the order does not get canceled
                // and still appears in the active list then the order cache
                // will eventually get back in sync on a call to `fetchOrder`.
                if (id in this.orders)
                    this.orders[id]['status'] = 'canceled';
            }
            throw e;
        }
        if (id in this.orders)
            this.orders[id]['status'] = 'canceled';
        return response;
    }

    async fetchOrderStatus (id, symbol = undefined) {
        await this.loadMarkets ();
        let orders = await this.fetchOpenOrders (symbol);
        let indexed = this.indexBy (orders, 'id');
        return (id in indexed) ? 'open' : 'closed';
    }

    async fetchOrderTrades (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let trades = await this.privatePostReturnOrderTrades (this.extend ({
            'orderNumber': id,
        }, params));
        return this.parseTrades (trades);
    }

    async createDepositAddress (code, params = {}) {
        let currency = this.currency (code);
        let response = await this.privatePostGenerateNewAddress ({
            'currency': currency['id'],
        });
        let address = undefined;
        if (response['success'] === 1)
            address = this.safeString (response, 'response');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        let currency = this.currency (code);
        let response = await this.privatePostReturnDepositAddresses ();
        let currencyId = currency['id'];
        let address = this.safeString (response, currencyId);
        this.checkAddress (address);
        let status = address ? 'ok' : 'none';
        return {
            'currency': code,
            'address': address,
            'status': status,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag)
            request['paymentId'] = tag;
        let result = await this.privatePostWithdraw (this.extend (request, params));
        return {
            'info': result,
            'id': result['response'],
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.extend ({ 'command': path }, params);
        if (api === 'public') {
            url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            query['nonce'] = this.nonce ();
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        let response = undefined;
        try {
            response = JSON.parse (body);
        } catch (e) {
            // syntax error, resort to default error handler
            return;
        }
        if ('error' in response) {
            const error = response['error'];
            const feedback = this.id + ' ' + this.json (response);
            if (error === 'Invalid order number, or you are not the person who placed the order.') {
                throw new OrderNotFound (feedback);
            } else if (error === 'Connection timed out. Please try again.') {
                throw new RequestTimeout (feedback);
            } else if (error === 'Internal error. Please try again.') {
                throw new ExchangeNotAvailable (feedback);
            } else if (error === 'Order not found, or you are not the person who placed it.') {
                throw new OrderNotFound (feedback);
            } else if (error === 'Invalid API key/secret pair.') {
                throw new AuthenticationError (feedback);
            } else if (error === 'Please do not make more than 8 API calls per second.') {
                throw new DDoSProtection (feedback);
            } else if (error.indexOf ('Total must be at least') >= 0) {
                throw new InvalidOrder (feedback);
            } else if (error.indexOf ('Not enough') >= 0) {
                throw new InsufficientFunds (feedback);
            } else if (error.indexOf ('Nonce must be greater') >= 0) {
                throw new InvalidNonce (feedback);
            } else if (error.indexOf ('You have already called cancelOrder or moveOrder on this order.') >= 0) {
                throw new CancelPending (feedback);
            } else {
                throw new ExchangeError (this.id + ': unknown error: ' + this.json (response));
            }
        }
    }
};
