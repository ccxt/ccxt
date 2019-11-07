'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, PermissionDenied, ArgumentsRequired, BadRequest, InvalidNonce, DDoSProtection, OnMaintenance } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class tokens extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tokensnet',
            'name': 'Tokens.net',
            'countries': [ 'GB' ],
            'rateLimit': 1000,
            'certified': false,
            'has': {
                'fetchMarkets': true,
                'fetchTickers': true,
                'fetchTicker': true,
                'fetchCurrencies': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchBalance': true,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchStatus': false,
                'fetchOrders': false,
                'fetchClosedOrders': false,
            },
            'urls': {
                'api': 'https://api.tokens.net/',
                'doc': 'https://www.tokens.net/api/',
                'logo': 'https://user-images.githubusercontent.com/4224211/52278879-67fcea80-2958-11e9-9cec-94a7333a9d7e.png',
                'www': 'https://www.tokens.net',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'public/trading-pairs/get/all/',
                        'public/ticker/all/',
                        'public/ticker/{pair}/',
                        'public/currency/all/',
                        'public/order-book/{pair}/',
                        'public/trades/hour/{pair}/',
                    ],
                },
                'private': {
                    'get': [
                        'private/balance/all/',
                        'private/orders/get/all/',
                        'private/orders/get/{pair}/',
                        'private/orders/get/{id}/',
                        'private/trades/all/{page}/',
                        'private/trades/{pair}/{page}/',
                    ],
                    'post': [
                        'private/orders/add/limit/',
                        'private/orders/cancel/{id}/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.2 / 100,
                    'maker': 0,
                },
            },
            'exceptions': {
                '100': ArgumentsRequired,
                '101': ArgumentsRequired,
                '102': ArgumentsRequired,
                '110': InvalidNonce,
                '111': InvalidNonce,
                '120': PermissionDenied,
                '121': PermissionDenied,
                '122': PermissionDenied,
                '123': BadRequest,
                '124': BadRequest,
                '130': BadRequest,
                '131': BadRequest,
                '140': BadRequest,
                '150': BadRequest,
                '151': BadRequest,
                '152': BadRequest,
                '160': BadRequest,
                '161': BadRequest,
                '429': DDoSProtection,
                '503': OnMaintenance,
            },
        });
    }

    /* Public fetch functions */

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetPublicTradingPairsGetAll (params);
        // {
        //     "xtzeurs": {
        //         "counterCurrency": "eurs",
        //         "priceDecimals": 4,
        //         "baseCurrency": "xtz",
        //         "amountDecimals": 6,
        //         "minAmount": "1",
        //         "title": "XTZ/EURS"
        //     },
        //     ...
        // }
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i += 1) {
            const market = markets[keys[i]];
            const id = keys[i];
            const baseId = this.safeStringUpper (market, 'baseCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quoteId = this.safeStringUpper (market, 'counterCurrency');
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'price': market['priceDecimals'],
                'amount': market['amountDecimals'],
                'cost': market['amountDecimals'],
            };
            const cost = this.safeFloat (market, 'minAmount');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': parseFloat (cost),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetPublicTickerAll (params);
        // {
        //     "status": "ok",
        //     "timestamp": 1572945773,
        //     "btcusdt": {
        //         "last": "9381.24",
        //         "volume_usdt": "272264.02067160",
        //         "open": "9616.58",
        //         "volume": "28.54974563",
        //         "ask": "9381.25",
        //         "low": "9340.37",
        //         "bid": "9371.87",
        //         "vwap": "9536.47798478",
        //         "high": "9702.76"
        //     },
        //     ...
        // }
        const result = [];
        const keys = Object.keys (tickers);
        for (let i = 0; i < keys.length; i += 1) {
            const symbolId = keys[i];
            const ticker = tickers[symbolId];
            if (symbolId !== 'status' && symbolId !== 'timestamp') {
                const symbol = this.findSymbol (symbolId);
                const market = this.markets[symbol];
                result.push (this.parseTicker (ticker, market));
            }
        }
        return this.indexBy (result, 'symbol');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.markets[symbol];
        const ticker = await this.publicGetPublicTickerPair (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        // {
        //     "vwap": "9536.47798478",
        //     "volume_usdt": "272264.02067160",
        //     "open": "9616.58",
        //     "ask": "9381.25",
        //     "status": "ok",
        //     "high": "9702.76",
        //     "timestamp": 1572265101,
        //     "volume": "28.54974563",
        //     "bid": "9371.87",
        //     "last": "9381.24",
        //     "low": "9340.37"
        // }
        return this.parseTicker (ticker, market);
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetPublicCurrencyAll (params);
        // {
        //     "status": "ok",
        //     "timestamp": 1572945773,
        //     "currencies": {
        //         "BTC": {
        //             "canWithdraw": true,
        //             "ethValue": "50.00000000",
        //             "namePlural": "Bitcoins",
        //             "minimalOrder": "0.0001",
        //             "withdrawalFee": "0.0003",
        //             "btcValue": "1.00000000",
        //             "decimals": 8,
        //             "name": "Bitcoin",
        //             "usdtValue": "9302.93000000"
        //         },
        //         ...
        //     },
        // },
        const currencies = this.safeValue (response, 'currencies', []);
        // Currencies are returned as a dict (historical reasons)
        const keys = Object.keys (currencies);
        const result = {};
        for (let i = 0; i < keys.length; i += 1) {
            const currencySymbol = keys[i];
            const currency = currencies[currencySymbol];
            result[currencySymbol] = {
                'id': currencySymbol,
                'name': this.safeString (currency, 'name'),
                'code': currencySymbol,
                'precision': this.safeInteger (currency, 'decimals'),
                'info': currency,
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderbook = await this.publicGetPublicOrderBookPair (this.extend ({
            'pair': market['id'],
        }, params));
        // {
        //     "timestamp":1573031500,
        //     "status":"ok",
        //     "asks":[
        //         [
        //             "0.02126453",
        //             "192.94"
        //         ],
        //         [
        //             "0.02322024",
        //             "192.95"
        //         ],
        //         ...
        //     ],
        //     "bids":[
        //         [
        //             "0.00486816",
        //             "192.75"
        //         ],
        //         [
        //             "0.02811401",
        //             "192.56"
        //         ],
        //         ...
        //     ]
        // }
        const timestamp = this.safeTimestamp (orderbook, 'timestamp');
        const parsedOrderbook = this.parseOrderBook (orderbook, timestamp);
        parsedOrderbook['nonce'] = this.nonce ();
        return parsedOrderbook;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetPublicTradesHourPair (this.extend ({
            'pair': market['id'],
        }, params));
        // {
        //     "timestamp":1573031391,
        //     "trades":[
        //         {
        //             "datetime":1573028240,
        //             "price":"192.93",
        //             "id":3655654,
        //             "amount":"1.51166933",
        //             "type":"buy"
        //         },
        //         ...
        //     ],
        //     "status":"ok"
        // }
        return this.parseTrades (response['trades'], market, since, limit);
    }

    /* Private fetch functions */

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetPrivateBalanceAll (params);
        // {
        //   timestamp: 1573045496,
        //   status: 'ok',
        //   balances: {
        //     BTC: {
        //       available: '0.00009176',
        //       usdtValue: '40.60',
        //       btcValue: '0.00433932',
        //       total: '0.00433932'
        //     },
        //     ...
        // }
        const balances = this.safeValue (response, 'balances', []);
        const keys = Object.keys (balances);
        const result = { 'info': null };
        for (let i = 0; i < keys.length; i += 1) {
            const currencySymbol = keys[i];
            const balance = balances[currencySymbol];
            const code = this.safeCurrencyCode (currencySymbol);
            const total = this.safeFloat (balance, 'total', 0);
            const available = this.safeFloat (balance, 'available', 0);
            const account = this.account ();
            account['free'] = available;
            account['used'] = total - available;
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        if (symbol === undefined) {
            response = await this.privateGetPrivateOrdersGetAll ();
        } else {
            response = await this.privateGetPrivateOrdersGetPair ();
        }
        // {
        //   timestamp: 1573045496,
        //   status: 'ok',
        //   openOrders: [
        //     {
        //       id: '682aeee9-2826-416c-a15a-7e95c1645495',
        //       price: '0.00000448',
        //       type: 'sell',
        //       takeProfit: null,
        //       created: 1571145633,
        //       currencyPair: 'dtrbtc',
        //       remainingAmount: '30.00000000',
        //       amount: '30.00000000'
        //     },
        //     ...
        //     ],
        // }
        const orders = this.safeValue (response, 'openOrders', []);
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            const orderExchange = response['openOrders'][i];
            this.extend (orderExchange, {
                'status': 'open',
            });
            const order = await this.parseOrder (orderExchange);
            result.push (order);
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetPrivateOrdersGetId (this.extend ({
            'id': id,
        }, params));
        // {
        //   id: '821e4178-5b97-4ead-8f29-85cd16d3f891',
        //   price: '0.00000444',
        //   amount: '30.00000000',
        //   timestamp: 1573129169,
        //   status: 'ok',
        //   takeProfit: '0.00000448',
        //   type: 'buy',
        //   remainingAmount: '0.00000000',
        //   currencyPair: 'dtrbtc',
        //   orderStatus: 'filled',
        //   created: 1571145631,
        //   trades: [
        //     {
        //       value: '0.00013320',
        //       type: 'sell',
        //       price: '0.00000444',
        //       amount: '30.00000000',
        //       datetime: 1571145632,
        //       id: 3509679
        //     }
        //   ]
        // }
        return this.parseOrder (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'tradingPair': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'side': side,
            'type': type,
            'price': this.priceToPrecision (symbol, price),
        };
        // !!! takeProfit = forms.DecimalField(required=False, max_digits=30, decimal_places=8)
        // !!! expireDate = forms.IntegerField(required=False)
        const response = await this.privatePostPrivateOrdersAddLimit (this.extend (request, params));
        const order = {
            'id': this.safeString (response, 'orderId'),
            'currencyPair': market['id'],
            'created': this.safeInteger (response, 'timestamp'),
            'status': 'open',
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'remainingAmount': 0,
            'info': response,
        };
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const response = await this.privatePostPrivateOrdersCancelId (this.extend ({
            'id': id,
        }, params));
        return response;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let response = undefined;
        if (symbol === undefined) {
            response = await this.privateGetPrivateTradesAllPage (this.extend ({
                'page': '1',
            }, params));
        } else {
            market = this.market (symbol);
            response = await this.privateGetPrivateTradesPairPage (this.extend ({
                'pair': market['id'],
                'page': '1',
            }, params));
        }
        // {
        //   trades: [
        //     {
        //       id: 3625965,
        //       datetime: 1572720454,
        //       type: 'sell',
        //       amount: '30.00000000',
        //       currencyPair: 'dtrbtc',
        //       price: '0.00000311',
        //       fee: '0.00000000'
        //     },
        //     ...
        //   ],
        //   timestamp: 1573134052,
        //   page: 1,
        //   status: 'ok',
        //   pages: 9
        // }
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }
    /* Helper functions */

    parseTicker (ticker, market = undefined) {
        const symbol = this.findSymbol (this.safeString (market, 'symbol'));
        const lastPrice = this.safeFloat (ticker, 'last');
        const openPrice = this.safeFloat (ticker, 'open');
        const change = lastPrice - openPrice;
        let percentage = 0;
        if (openPrice !== 0) {
            percentage = (change / openPrice) * 100;
        }
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': this.safeFloat (ticker, 'vwap'),
            'open': openPrice,
            'close': lastPrice,
            'last': lastPrice,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'datetime');
        const id = this.safeString (trade, 'id');
        const side = this.safeString (trade, 'type');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = this.safeString (market, 'symbol');
        }
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': id,
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'info': trade,
            'order': undefined,
            'takerOrMaker': undefined,
            'type': undefined,
            'fee': undefined,
        };
    }

    // {
    //   timestamp: 1573045496,
    //   status: 'ok',
    //   openOrders: [
    //     {
    //       id: '682aeee9-2826-416c-a15a-7e95c1645495',
    //       price: '0.00000448',
    //       type: 'sell',
    //       takeProfit: null,
    //       created: 1571145633,
    //       currencyPair: 'dtrbtc',
    //       remainingAmount: '30.00000000',
    //       amount: '30.00000000'
    //     },
    //     ...
    //     ],
    // }
    async parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'id');
        const timestamp = this.safeTimestamp (order, 'created');
        const status = this.parseOrderStatus ('open');
        const type = 'limit';
        const side = this.safeStringLower (order, 'type');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const remaining = this.safeFloat (order, 'remainingAmount');
        const filled = amount - remaining;
        market = this.markets_by_id[order['currencyPair']];
        const symbol = this.safeString (market, 'symbol');
        const cost = price * remaining;
        let trades = undefined;
        const tradeExchange = this.safeValue (order, 'trades');
        if (tradeExchange !== undefined) {
            trades = this.parseTrades (tradeExchange, market);
        }
        return {
            'id': id,
            'symbol': symbol,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'remaining': remaining,
            'cost': cost,
            'filled': filled,
            'trades': trades,
            'info': order,
            'fee': undefined,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
            'expired': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        url += this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const auth = nonce + this.apiKey;
            const signature = this.encode (this.hmac (this.encode (auth), this.encode (this.secret)));
            if (method !== 'GET') {
                body = this.urlencode (query);
            }
            headers = {
                'key': this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        // 100 API Key is missing
        // 101 Nonce is missing
        // 102 Signature is missing
        // 110 Nonce has to be integer
        // 111 Provided nonce is less or equal to the last nonce
        // 120 Invalid API key
        // 121 Signature is invalid
        // 122 Insufficient permissions
        // 123 IP address not allowed
        // 124 API key not confirmed by e-mail
        // 130 Invalid trading pair
        // 131 Invalid order id
        // 140 Only opened orders can be canceled
        // 150 Parameter {parameter} is invalid with error: {error}
        // 151 Invalid input short
        // 152 General error: {}
        // 160 Invalid currency code
        // 161 Invalid {}
        // 429 API rate limit exceeded
        // 503 API is down for maintenance
        if (typeof body !== 'string') {
            return;
        }
        if (body.length === 0) {
            return;
        }
        if (body[0] !== '{') {
            return;
        }
        const status = this.safeString (response, 'status');
        if (status === 'error') {
            const errorCode = this.safeString (response, 'errorCode');
            const reason = this.safeString (response, 'reason');
            const exceptions = this.exceptions;
            if (errorCode in exceptions) {
                throw new exceptions[errorCode] (reason);
            }
            throw new ExchangeError (reason);
        }
    }
};
