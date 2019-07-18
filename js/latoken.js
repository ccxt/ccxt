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
                'fetchTickers': true,
                'fetchTime': true,
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
                'api': 'https://api.latoken.com',
                'www': 'https://www.latoken.com',
                'doc': [
                    'https://api.latoken.com',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'ExchangeInfo/time',
                        'ExchangeInfo/limits',
                        'ExchangeInfo/pairs',
                        'ExchangeInfo/pairs/{currency}',
                        'ExchangeInfo/pair',
                        'ExchangeInfo/currencies',
                        'ExchangeInfo/currencies/{symbol}',
                        'MarketData/ticker',
                        'MarketData/ticker/{symbol}',
                        'MarketData/orderBook/{symbol}',
                        'MarketData/trades/{symbol}/{limit}',
                    ],
                },
                'private': {
                    'get': [
                        'Account/balances',
                        'Account/balances/{currency}',
                        'Order/status',
                        'Order/active',
                        'Order/get_order',
                        'Order/trades',
                    ],
                    'post': [
                        'Order/new',
                        'Order/test-order',
                        'Order/cancel',
                        'Order/cancel_all',
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

    async fetchTime (params = {}) {
        const response = await this.publicGetExchangeInfoTime (params);
        return this.safeInteger (response, 'unixTimeMiliseconds');
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetExchangeInfoPairs (params);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = market['pairId'];
            const baseId = market['baseCurrency'];
            const quoteId = market['quotedCurrency'];
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = market['symbol'];
            const precision = {
                'price': market['pricePrecision'],
                'amount': market['amountPrecision'],
            };
            const limits = {
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
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
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

    async fetchBalance (currency = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currency': currency,
        };
        const response = await this.privateGetAccountBalances (this.extend (request, params));
        const result = {
            'info': response,
        };
        if (currency !== undefined) {
            const currency = response['symbol'];
            const account = {
                'free': parseFloat (response['available']),
                'used': parseFloat (response['frozen']),
                'total': parseFloat (response['amount']),
            };
            result[currency] = account;
            return this.parseBalance (result);
        }
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currency = balance['symbol'];
            const account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['frozen']),
                'total': parseFloat (balance['amount']),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'],
        };
        const timestamp = this.nonce ();
        const response = await this.publicGetMarketDataOrderBook (this.extend (request, params));
        const orderbook = this.parseOrderBook (response, timestamp, 'bids', 'asks', 'price', 'amount');
        orderbook['nonce'] = this.nonce ();
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        const symbol = this.findSymbol (this.safeString (ticker, 'symbol'), market);
        const open = this.safeFloat (ticker, 'open');
        const priceChange = this.safeFloat (ticker, 'priceChange');
        const priceChangePercent = (open / this.sum (open, priceChange)) * 100;
        const timestamp = this.nonce ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'low': this.safeFloat (ticker, 'low'),
            'high': this.safeFloat (ticker, 'high'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': this.safeFloat (ticker, 'close'),
            'last': undefined,
            'previousClose': undefined,
            'change': priceChange,
            'percentage': priceChangePercent,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.symbol + 'fetchTicker requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'],
        };
        const response = await this.publicGetMarketDataTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarketDataTicker (params);
        return this.parseTicker (response);
    }

    async fetchCurrencies (symbol = undefined, params = {}) {
        const request = {
            'symbol': symbol,
        };
        if (symbol !== undefined) {
            const currencies = await this.publicGetExchangeInfoCurrencies (this.extend (request, params));
            const id = currencies['currencyId'];
            const symbol = currencies['symbol'];
            const name = currencies['name'];
            const precision = currencies['precission'];
            const type = currencies['type'];
            const fee = currencies['fee'];
            return {
                'id': id,
                'symbol': symbol,
                'name': name,
                'precision': precision,
                'type': type,
                'fee': fee,
            };
        }
        const currencies = await this.publicGetExchangeInfoCurrencies (params);
        const result = [];
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = currency['currencyId'];
            const symbol = currency['symbol'];
            const name = currency['name'];
            const precision = currency['precission'];
            const type = currency['type'];
            const fee = currency['fee'];
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

    parseTrade (trade, market = undefined) {
        const info = trade;
        const type = undefined;
        const fee = undefined;
        return {
            'info': info,
            'timestamp': trade['timestamp'],
            'datetime': this.iso8601 (trade['timestamp']),
            'symbol': trade['symbol'],
            'pairId': trade['pairId'],
            'id': trade['id'],
            'order': trade['orderId'],
            'type': type,
            'side': trade['side'],
            'price': trade['price'],
            'amount': trade['amount'],
            'cost': trade['price'] * trade['amount'],
            'commision': trade['commision'],
            'fee': fee,
        };
    }

    async fetchTrades (symbol, limit = 100, params = {}) {
        // argument list is ↑↑↑ not unified here
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resp = {
            'symbol': market['symbol'],
            'limit': limit,
        };
        const response = await this.publicGetMarketDataTrades (this.extend (resp, params));
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades); // ← this should be parseTrades (trades, market, since, limit)
    }

    async fetchMyTrades (symbol = undefined, params = {}, limit = 10) {
        await this.loadMarkets ();
        const market = undefined;
        const request = {
            'symbol': symbol,
        };
        const response = await this.privateGetOrderTrades (this.extend (request, params));
        const rawTrades = this.safeValue (response, 'trades', []);
        const trades = this.parseTrades (rawTrades, market);
        return trades;
    }

    parseOrder (order) {
        const symbol = order['symbol'];
        const side = order['side'];
        const orderType = order['orderType'];
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const orderStatus = order['orderStatus'];
        const executedAmount = this.safeFloat (order, 'executedAmount');
        const reaminingAmount = this.safeFloat (order, 'reaminingAmount');
        const timeCreated = this.safeValue (order, 'timeCreated');
        return {
            'id': order['orderId'],
            'info': order,
            'timestamp': timeCreated,
            'datetime': this.iso8601 (timeCreated),
            'lastTradeTimestamp': undefined,
            'status': orderStatus,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'filled': executedAmount,
            'average': price,
            'remaining': reaminingAmount,
            'fee': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        return this.fetchOrdersByStatus (symbol, 'active', since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        return this.fetchOrdersByStatus (symbol, 'cancelled', since, limit, params);
    }

    async fetchOrdersByStatus (symbol, status, since = undefined, limit = 100, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'status': status,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['symbol'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrderStatus (this.extend (request, params));
        const orders = this.parseOrders (response);
        return orders;
    }

    async fetchAllActiveOrders (symbol, limit = 50, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': symbol,
            'limit': limit,
        };
        request['timestamp'] = this.nonce ();
        const response = await this.privateGetOrderActive (this.extend (request, params));
        const orders = this.parseOrders (response);
        return orders;
    }

    async fetchOrder (id, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOrderGetOrder (this.extend (request, params));
        return (this.parseOrder (response));
    }

    async createOrder (symbol, cliOrdId, side, price, amount, orderType, timeAlive, params = {}) {
        const order = {
            'symbol': symbol,
            'cliOrdId': cliOrdId,
            'side': side,
            'price': price,
            'amount': amount,
            'orderType': orderType,
            'timeAlive': timeAlive,
        };
        const result = await this.privatePostOrderNew (this.extend (order, params));
        return this.parseOrder (result);
    }

    async cancelOrder (id, params = {}) {
        await this.loadMarkets ();
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a id argument');
        }
        await this.loadMarkets ();
        const response = await this.privatePostOrderCancel (this.extend ({
            'orderId': id,
        }, params));
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbol, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.symbol + ' cancelAllOrders requires a symbol argument');
        }
        const response = await this.privatePostOrderCancelAll (this.extend ({
            'symbol': symbol,
        }, params));
        const result = [];
        for (let i = 0; i < response.cancelledOrders.length; i++) {
            const resp = response.cancelledOrders[i];
            result.push ({
                'pairId': response['pairId'],
                'symbol': response['symbol'],
                'cancelledOrder': resp,
            });
        }
        const orders = this.parseTrades (result);
        return orders;
    }

    sign (path, api = 'public', method = 'GET', params = undefined, headers = undefined, body = undefined) {
        let url = this.urls['api']['v1'];
        url += '/' + path;
        if (api === 'public') {
            headers = {
                'Content-type': 'application/json',
            };
            if (path === 'exchangeInfo/pairs' && Object.keys (params).length) {
                url += '/' + params['currency'];
            } else if (path === 'exchangeInfo/currencies' && Object.keys (params).length) {
                url += '/' + params['symbol'];
            } else if (path === 'marketData/ticker' && Object.keys (params).length) {
                url += '/' + params['symbol'];
            } else if (path === 'marketData/orderBook' && Object.keys (params).length) {
                url += '/' + params['symbol'];
            } else if (path === 'marketData/trades' && Object.keys (params).length) {
                url += '/' + params['symbol'] + '/' + params['limit'];
            } else {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            if (path === 'account/balances' && params['currency']) {
                url += '/' + params;
                const param = {
                    'timestamp': this.nonce (),
                };
                const query1 = '?' + this.urlencode (param);
                const dataToSign = '/api/v1/' + path + '/' + params['currency'];
                const signature = this.hmac (this.encode (dataToSign + query1), this.encode (this.secret), 'sha256');
                url += query1;
                headers = {
                    'X-LA-KEY': this.apiKey,
                    'X-LA-SIGNATURE': signature,
                };
            } else {
                params['timestamp'] = this.nonce ();
                const query1 = '?' + this.urlencode (params);
                const dataToSign = '/api/v1/' + path;
                const signature = this.hmac (this.encode (dataToSign + query1), this.encode (this.secret), 'sha256');
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
