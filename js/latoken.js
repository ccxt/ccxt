'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, AccountSuspended, InvalidNonce, DDoSProtection, NotSupported, BadRequest, AuthenticationError } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');
//  ---------------------------------------------------------------------------

module.exports = class latoken extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'latoken',
            'name': 'Latoken',
            'countries': [ 'VG' ],
            'version': 'v1',
            'rateLimit': 1500,
            'certified': false,
            // new metainfo interface
            'has': {
                'CORS': false,
                'publicAPI': true,
                'pivateAPI': true,
                'cancelOrder': true,
                'cancelAllOrders': true,
                'createLimitOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'createDepositAddress': false,
                'deposit': false,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchTradingFees': false,
                'fetchFundingFees': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchAllActiveOrders': true,
                'fetchOrdersByStatus': true,
                'fetchOrdersByOrderId': true,
                'fetchActiveOrders': true,
                'fetchCancelledOrders': true,
                'fetchFilledOrders': true,
                'fetchPartiallyFilledOrders': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchTransactions': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/6286552/54519214-0f693600-4977-11e9-9ff4-6ea2f62875b0.png',
                'api': {
                    'v1': 'https://api.latoken.com/api/v1',
                },
                'www': 'https://www.latoken.com',
                'doc': [
                    'https://api.latoken.com/',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'exchangeInfo/time',
                        'exchangeInfo/limits',
                        'exchangeInfo/pairs',
                        'exchangeInfo/currencies',
                        'marketData/orderBook',
                        'marketData/trades',
                        'marketData/ticker',
                    ],
                },
                'private': {
                    'get': [
                        'account/balances',
                        'order/trades',
                        'order/status',
                        'order/active',
                        'order/get_order',
                    ],
                    'post': [
                        'order/new',
                        'order/cancel',
                        'order/cancel_all',
                    ],
                    'delete': [
                        'account/order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
            },
            'options': {
                'timeframe': 5 * 1000, // 5 sec, default
            },
            'exceptions': {
                'order_not_exist': OrderNotFound, // {"code":"order_not_exist","msg":"order_not_exist"} ¯\_(ツ)_/¯
                'order_not_exist_or_not_allow_to_cancel': InvalidOrder, // {"code":"400100","msg":"order_not_exist_or_not_allow_to_cancel"}
                'Order size below the minimum requirement.': InvalidOrder, // {"code":"400100","msg":"Order size below the minimum requirement."}
                'The withdrawal amount is below the minimum requirement.': ExchangeError, // {"code":"400100","msg":"The withdrawal amount is below the minimum requirement."}
                '400': BadRequest,
                '401': AuthenticationError,
                '403': NotSupported,
                '404': NotSupported,
                '405': NotSupported,
                '429': DDoSProtection,
                '500': ExchangeError,
                '503': ExchangeNotAvailable,
                '200004': InsufficientFunds,
                '260100': InsufficientFunds, // {"code":"260100","msg":"account.noBalance"}
                '300000': InvalidOrder,
                '400001': AuthenticationError,
                '400002': InvalidNonce,
                '400003': AuthenticationError,
                '400004': AuthenticationError,
                '400005': AuthenticationError,
                '400006': AuthenticationError,
                '400007': AuthenticationError,
                '400008': NotSupported,
                '400100': ArgumentsRequired,
                '411100': AccountSuspended,
                '500000': ExchangeError,
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    async currentTime () {
        const response = await this.publicGetExchangeInfoTime ();
        let time = this.safeString (response, 'time');
        let timeSeconds = this.safeInteger (response, 'unixTimeSeconds');
        let timeMiliseconds = this.safeInteger (response, 'unixTimeMiliseconds');
        return {
            'time': time,
            'timeSeconds': timeSeconds,
            'timeMiliseconds': timeMiliseconds,
        };
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetExchangeInfoPairs (params);
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['pairId'];
            let baseId = market['baseCurrency'];
            let quoteId = market['quotedCurrency'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = market['symbol'];
            let precision = {
                'price': market['pricePrecision'],
                'amount': market['amountPrecision'],
            };
            let limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minQty'),
                    'max': undefined,
                },
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': undefined,
                },
            };
            limits['cost'] = {
                'min': market['amountPrecision'],
                'max': undefined,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    calculateFee (symbol, side, amount, price, takerOrMaker = 'taker') {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = amount * rate;
        let precision = market['precision']['price'];
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
            precision = market['precision']['amount'];
        }
        cost = this.decimalToPrecision (cost, ROUND, precision, this.precisionMode);
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (cost),
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        if (Object.keys (params).length) {
            let balance = await this.privateGetAccountBalances (params);
            let result = {};
            result.currencyId = balance['currencyId'];
            result.symbol = balance['symbol'];
            result.name = balance['name'];
            result.amount = balance['amount'];
            result.available = balance['available'];
            result.frozen = balance['frozen'];
            result.pending = balance['pending'];
            return {
                'id': result.currencyId,
                'symbol': result.symbol,
                'name': result.name,
                'amount': result.amount,
                'available': result.available,
                'frozen': result.frozen,
                'pending': result.pending,
            };
        }
        let balances = await this.privateGetAccountBalances (params);
        let result = [];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currencyId = balance['currencyId'];
            let symbol = balance['symbol'];
            let name = balance['name'];
            let amount = this.safeFloat (balance, 'amount');
            let available = this.safeFloat (balance, 'available');
            let frozen = this.safeValue (balance, 'frozen');
            let pending = this.safeValue (balance, 'pending');
            result.push ({
                'currencyId': currencyId,
                'symbol': symbol,
                'name': name,
                'amount': amount,
                'available': available,
                'frozen': frozen,
                'pending': pending,
            });
        }
        return result;
    }

    parseBidAsk (bidask) {
        let price = parseFloat (bidask['price']);
        let amount = parseFloat (bidask['amount']);
        return {
            'price': price,
            'amount': amount,
        };
    }

    parseBidsAsks (bidasks) {
        let res = [];
        for (let i = 0; i < bidasks.length; i++) {
            res.push (this.parseBidAsk (bidasks[i]));
        }
        return res;
    }

    parseOrderBook (orderbook, asksKey = 'asks', bidsKey = 'bids') {
        return {
            'pairId': orderbook['pairId'],
            'symbol': orderbook['symbol'],
            'spread': orderbook['spread'],
            'asks': (asksKey in orderbook) ? this.parseBidsAsks (orderbook[asksKey]) : 'empty',
            'bids': (bidsKey in orderbook) ? this.parseBidsAsks (orderbook[bidsKey]) : 'empty',
        };
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['symbol'],
        };
        let response = await this.publicGetMarketDataOrderBook (this.extend (request, params));
        let orderbook = this.parseOrderBook (response);
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = this.findSymbol (this.safeString (ticker, 'symbol'), market);
        return {
            'id': this.safeValue (ticker, 'pairId'),
            'symbol': symbol,
            'volume': this.safeFloat (ticker, 'volume'),
            'openPrice': this.safeFloat (ticker, 'open'),
            'lowPrice': this.safeFloat (ticker, 'low'),
            'highPrice': this.safeFloat (ticker, 'high'),
            'closePrice': this.safeFloat (ticker, 'close'),
            'priceChange': this.safeFloat (ticker, 'priceChange'),
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketDataTicker (this.extend ({
            'symbol': market['symbol'],
        }, params));
        return this.parseTicker (response, market);
    }

    async fetchCurrencies (params = {}) {
        if (Object.keys (params).length) {
            const currencies = await this.publicGetExchangeInfoCurrencies (params);
            let id = currencies['currencyId'];
            let symbol = currencies['symbol'];
            let name = currencies['name'];
            let precision = currencies['precission'];
            let type = currencies['type'];
            let fee = currencies['fee'];
            return {
                'id': id,
                'symbol': symbol,
                'name': name,
                'precision': precision,
                'type': type,
                'fee': fee,
            };
        }
        const currencies = await this.publicGetExchangeInfoCurrencies ();
        let result = [];
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['currencyId'];
            let symbol = currency['symbol'];
            let name = currency['name'];
            let precision = currency['precission'];
            let type = currency['type'];
            let fee = currency['fee'];
            result.push ({
                'id': id,
                'symbol': symbol,
                'name': name,
                'precision': precision,
                'type': type,
                'fee': fee,
            });
        }
        return result;
    }

    parseOneTrade (trade) {
        let side = this.safeString (trade, 'side');
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['amount']);
        let timestamp = this.safeValue (trade, 'timestamp');
        return {
            'side': side,
            'price': price,
            'amount': amount,
            'timestamp': timestamp,
        };
    }

    parseEachTrade (trades) {
        let res = [];
        for (let i = 0; i < trades.length; i++) {
            res.push (this.parseOneTrade (trades[i]));
        }
        return res;
    }

    parseTrade (trades, tradeKey = 'trades') {
        return {
            'pairId': trades['pairId'],
            'symbol': trades['symbol'],
            'tradeCount': trades['tradeCount'],
            'trades': (tradeKey in trades) ? this.parseEachTrade (trades[tradeKey]) : 'empty',
        };
    }

    async fetchTrades (symbol, limit = 100, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let resp = {
            'symbol': market['symbol'],
            'limit': limit,
        };
        let response = await this.publicGetMarketDataTrades (this.extend (resp, params));
        let trades = this.parseTrade (response);
        return trades;
    }

    parseOneOrderTrade (trade) {
        let id = this.safeString (trade, 'id');
        let orderId = this.safeString (trade, 'orderId');
        let commision = parseFloat (trade['commision']);
        let side = this.safeString (trade, 'side');
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let time = this.safeValue (trade, 'timestamp');
        return {
            'id': id,
            'orderId': orderId,
            'commision': commision,
            'side': side,
            'price': price,
            'amount': amount,
            'time': time,
        };
    }

    parseOrderTrades (trades) {
        let res = [];
        for (let i = 0; i < trades.length; i++) {
            res.push (this.parseOneOrderTrade (trades[i]));
        }
        return res;
    }

    parseOrderTrade (trades, tradeKey = 'trades') {
        return {
            'pairId': trades['pairId'],
            'symbol': trades['symbol'],
            'tradeCount': trades['tradeCount'],
            'trades': (tradeKey in trades) ? this.parseOrderTrades (trades[tradeKey]) : 'empty',
        };
    }

    async fetchMyTrades (symbol = undefined, params = {}, limit = 10) {
        await this.loadMarkets ();
        let request = {
            'symbol': symbol,
            'limit': limit,
        };
        let response = await this.privateGetOrderTrades (this.extend (request, params));
        return this.parseOrderTrade (response);
    }

    parseOrderStatus (status) {
        let statuses = {
            'active': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrder (response) {
        let orderId = response['orderId'];
        let cliOrdId = response['cliOrdId'];
        let pairId = this.safeValue (response, 'pairId');
        let symbol = response['symbol'];
        let side = response['side'];
        let orderType = response['orderType'];
        let price = this.safeFloat (response, 'price');
        let amount = this.safeFloat (response, 'amount');
        let orderStatus = response['orderStatus'];
        let executedAmount = this.safeFloat (response, 'executedAmount');
        let reaminingAmount = this.safeFloat (response, 'reaminingAmount');
        let timeCreated = this.safeValue (response, 'timeCreated');
        let timeFilled = this.safeValue (response, 'timeFilled');
        return {
            'orderId': orderId,
            'cliOrdId': cliOrdId,
            'pairId': pairId,
            'symbol': symbol,
            'side': side,
            'orderType': orderType,
            'price': price,
            'amount': amount,
            'orderStatus': orderStatus,
            'executedAmount': executedAmount,
            'reaminingAmount': reaminingAmount,
            'timeCreated': timeCreated,
            'timeFilled': timeFilled,
        };
    }

    async fetchActiveOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        return this.fetchOrdersByStatus (symbol, 'active', since, limit, params);
    }

    async fetchCancelledOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        return this.fetchOrdersByStatus (symbol, 'cancelled', since, limit, params);
    }

    async fetchFilledOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        return this.fetchOrdersByStatus (symbol, 'filled', since, limit, params);
    }

    async fetchPartiallyFilledOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        return this.fetchOrdersByStatus (symbol, 'partiallyFilled', since, limit, params);
    }

    async fetchOrdersByStatus (symbol, status, since = undefined, limit = 100, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {
            'status': status,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['symbol'];
        }
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.privateGetOrderStatus (this.extend (request, params));
        let orders = this.parseOrders (response);
        return orders;
    }

    async fetchAllActiveOrders (symbol, limit = 50, params = {}) {
        await this.loadMarkets ();
        let request = {
            'symbol': symbol,
            'limit': limit,
        };
        request['timestamp'] = this.nonce ();
        let response = await this.privateGetOrderActive (this.extend (request, params));
        let orders = this.parseOrders (response);
        return orders;
    }

    async fetchOrder (id, params = {}) {
        await this.loadMarkets ();
        let request = {
            'orderId': id,
        };
        let response = await this.privateGetOrderGetOrder (this.extend (request, params));
        return (this.parseOrder (response));
    }

    parseNewOrder (response) {
        return ({
            'orderId': response['orderId'],
            'cliOrdId': response['cliOrdId'],
            'pairId': this.safeValue (response, 'pairId'),
            'symbol': response['symbol'],
            'side': response['side'],
            'orderType': response['orderType'],
            'price': this.safeFloat (response, 'price'),
            'amount': this.safeFloat (response, 'amount'),
        });
    }

    async createOrder (symbol, cliOrdId, side, price, amount, orderType, timeAlive, params = {}) {
        let order = {
            'symbol': symbol,
            'cliOrdId': cliOrdId,
            'side': side,
            'price': price,
            'amount': amount,
            'orderType': orderType,
            'timeAlive': timeAlive,
        };
        let result = await this.privatePostOrderNew (this.extend (order, params));
        return this.parseNewOrder (result);
    }

    async cancelOrder (id, params = {}) {
        await this.loadMarkets ();
        if (id === undefined)
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a id argument');
        await this.loadMarkets ();
        let response = await this.privatePostOrderCancel (this.extend ({
            'orderId': id,
        }, params));
        return this.parseOrder (response);
    }

    parseAllOrders (orders) {
        let pairId = orders['pairId'];
        let symbol = orders['symbol'];
        let canceledOrders = [];
        for (let i = 0; i < orders.cancelledOrders.length; i++) {
            canceledOrders.push (orders.cancelledOrders[i]);
        }
        let result = {
            'pairId': pairId,
            'symbol': symbol,
            'cancelledOrders': canceledOrders,
        };
        return result;
    }

    async cancelAllOrders (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderCancelAll (this.extend ({
            'symbol': symbol,
        }, params));
        return this.parseAllOrders (response);
    }

    sign (path, api = 'public', method = 'GET', params = undefined, headers = undefined, body = undefined) {
        let url = this.urls['api']['v1'];
        url += '/' + path;
        if (api === 'public') {
            headers = {
                'Content-type': 'application/json',
                'x-lat-timestamp': this.nonce (),
                'x-lat-timeframe': this.options['timeframe'],
            };
            if ((path === 'exchangeInfo/pairs' || 'exchangeInfo/currencies') && (typeof (params) === 'string')) {
                url += '/' + params;
            }
            url += '?' + this.urlencode (params);
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            if (path === 'account/balances' && (typeof (params) === 'string')) {
                url += '/' + params;
                let param = {
                    'timestamp': this.nonce (),
                };
                let query1 = '?' + this.urlencode (param);
                let dataToSign = '/api/v1/' + path + '/' + params;
                let signature = this.hmac (this.encode (dataToSign + query1), this.encode (this.secret), 'sha256');
                url += query1;
                headers = {
                    'X-LA-KEY': this.apiKey,
                    'X-LA-SIGNATURE': signature,
                };
            } else {
                params['timestamp'] = this.nonce ();
                let query1 = '?' + this.urlencode (params);
                let dataToSign = '/api/v1/' + path;
                let signature = this.hmac (this.encode (dataToSign + query1), this.encode (this.secret), 'sha256');
                url += query1;
                headers = {
                    'X-LA-KEY': this.apiKey,
                    'X-LA-SIGNATURE': signature,
                };
            }
            body = this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (!response) {
            return;
        }
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        const ExceptionClass = this.safeValue2 (this.exceptions, message, errorCode);
        if (ExceptionClass !== undefined) {
            throw new ExceptionClass (this.id + ' ' + message);
        }
    }
};
