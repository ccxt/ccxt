"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, InsufficientFunds, OrderNotFound, OrderNotCached } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class poloniex extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'poloniex',
            'name': 'Poloniex',
            'countries': 'US',
            'rateLimit': 1000, // up to 6 calls per second
            'hasCORS': true,
            // obsolete metainfo interface
            'hasFetchMyTrades': true,
            'hasFetchOrder': true,
            'hasFetchOrders': true,
            'hasFetchOpenOrders': true,
            'hasFetchClosedOrders': true,
            'hasFetchTickers': true,
            'hasWithdraw': true,
            'hasFetchOHLCV': true,
            // new metainfo interface
            'has': {
                'fetchOHLCV': true,
                'fetchMyTrades': true,
                'fetchOrder': 'emulated',
                'fetchOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchClosedOrders': 'emulated',
                'fetchTickers': true,
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
                'funding': 0.0,
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
        });
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side == 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    commonCurrencyCode (currency) {
        if (currency == 'BTM')
            return 'Bitmark';
        return currency;
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            ohlcv['date'] * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['volume'],
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
        if (limit)
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
                'lot': this.limits['amount']['min'],
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

    async fetchFees (params = {}) {
        await this.loadMarkets ();
        let fees = await this.privatePostReturnFeeInfo ();
        return {
            'info': fees,
            'maker': parseFloat (fees['makerFee']),
            'taker': parseFloat (fees['takerFee']),
            'withdraw': 0.0,
        };
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetReturnOrderBook (this.extend ({
            'currencyPair': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high24hr']),
            'low': parseFloat (ticker['low24hr']),
            'bid': parseFloat (ticker['highestBid']),
            'ask': parseFloat (ticker['lowestAsk']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': parseFloat (ticker['percentChange']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['quoteVolume']),
            'quoteVolume': parseFloat (ticker['baseVolume']),
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
        if ((!market) && ('currencyPair' in trade))
            market = this.markets_by_id[trade['currencyPair']]['symbol'];
        if (market)
            symbol = market['symbol'];
        let side = trade['type'];
        let fee = undefined;
        if ('fee' in trade) {
            let currency = (side == 'buy') ? market['base'] : market['quote'];
            fee = {
                'cost': parseFloat (trade['fee']),
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
            'price': parseFloat (trade['rate']),
            'amount': parseFloat (trade['amount']),
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'currencyPair': market['id'],
        };
        if (since) {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.seconds (); // last 50000 trades by default
        }
        let trades = await this.publicGetReturnTradeHistory (this.extend (request, params));
        return this.parseTrades (trades, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol)
            market = this.market (symbol);
        let pair = market ? market['id'] : 'all';
        let request = { 'currencyPair': pair };
        if (since) {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.seconds ();
        }
        // limit is disabled (does not really work as expected)
        // if (limit)
        //     request['limit'] = parseInt (limit);
        let response = await this.privatePostReturnTradeHistory (this.extend (request, params));
        let result = [];
        if (market) {
            result = this.parseTrades (response, market);
        } else {
            if (response) {
                let ids = Object.keys (response);
                for (let i = 0; i < ids.length; i++) {
                    let id = ids[i];
                    let market = this.markets_by_id[id];
                    let symbol = market['symbol'];
                    let trades = this.parseTrades (response[id], market);
                    for (let j = 0; j < trades.length; j++) {
                        result.push (trades[j]);
                    }
                }
            }
        }
        return result;
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
        let price = parseFloat (order['price']);
        let cost = this.safeFloat (order, 'total', 0.0);
        let remaining = this.safeFloat (order, 'amount');
        let amount = this.safeFloat (order, 'startingAmount', remaining);
        let filled = amount - remaining;
        return {
            'info': order,
            'id': order['orderNumber'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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
                if (order['status'] == 'open') {
                    this.orders[id] = this.extend (order, {
                        'status': 'closed',
                        'cost': order['amount'] * order['price'],
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                }
            }
            let order = this.orders[id];
            if (market) {
                if (order['symbol'] == symbol)
                    result.push (order);
            } else {
                result.push (order);
            }
        }
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['id'] == id)
                return orders[i];
        }
        throw OrderNotCached (this.id + ' order id ' + id.toString () + ' not found in cache');
    }

    filterOrdersByStatus (orders, status) {
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] == status)
                result.push (orders[i]);
        }
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        return this.filterOrdersByStatus (orders, 'open');
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        return this.filterOrdersByStatus (orders, 'closed');
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
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
        amount = parseFloat (amount);
        let request = {
            'orderNumber': id,
            'rate': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
        };
        let response = await this.privatePostMoveOrder (this.extend (request, params));
        let result = undefined;
        if (id in this.orders) {
            this.orders[id] = this.extend (this.orders[id], {
                'price': price,
                'amount': amount,
            });
            result = this.extend (this.orders[id], { 'info': response });
        } else {
            result = {
                'info': response,
                'id': response['orderNumber'],
            };
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
            if (id in this.orders)
                this.orders[id]['status'] = 'canceled';
        } catch (e) {
            if (this.last_http_response) {
                if (this.last_http_response.indexOf ('Invalid order') >= 0)
                    throw new OrderNotFound (this.id + ' cancelOrder() error: ' + this.last_http_response);
            }
            throw e;
        }
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

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let result = await this.privatePostWithdraw (this.extend ({
            'currency': currency,
            'amount': amount,
            'address': address,
        }, params));
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
        if (api == 'public') {
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

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response) {
            let error = this.id + ' ' + this.json (response);
            let failed = response['error'].indexOf ('Not enough') >= 0;
            if (failed)
                throw new InsufficientFunds (error);
            throw new ExchangeError (error);
        }
        return response;
    }
}
