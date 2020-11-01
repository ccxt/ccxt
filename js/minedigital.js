'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { OrderNotFound, ExchangeError, ExchangeNotAvailable, BadRequest, InsufficientFunds, PermissionDenied, InvalidOrder, InvalidNonce } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class minedigital extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'minedigital',
            'name': 'MineDigitalExchange',
            'countries': [ 'AU', 'NZ' ], // Australia, New Zealand
            'rateLimit': 1000,
            'version': '0',
            'has': {
                'CORS': false,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchOrderBook': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchClosedOrders': false,
                'fetchTrades': false,
                'fetchOHLCV': false,
                'fetchTickers': false,
                'fetchCurrencies': false,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchDepositAddress': true,
                'createDepositAddress': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/58685766/96388338-ec0e0900-11f3-11eb-84b3-cca7c3dbe527.jpeg',
                'api': 'https://trade.minedigital.exchange/api',
                'www': 'https://minedigital.exchange',
                'doc': 'https://minedigitalexchange.docs.apiary.io',
            },
            'api': {
                'v2': {
                    'get': [
                        '{symbol}/money/ticker', // Get the most recent ticker for a currency pair
                        '{symbol}/money/depth/full', // Get order book on a particular currency pair
                    ],
                },
                'public': {
                    'get': [
                        'currencyStatic', // Obtain supported currency and currency pair
                    ],
                },
                'private': {
                    'post': [
                        'account', // Get account information
                        'send', // Create a withdraw
                        'receive/create', // Create a deposit address of a given token
                        'receive', // Obtain a deposit address of a given token
                        'transfer', // Move funds from available to exchange accounts for trading
                        'order/new', // Create or replace an order
                        'order/cancel', // Cancel a list of orders
                        'transaction/list', // Get your transactions
                        'order/info', // Get order status
                        'order/list', // Get list of orders
                        'trade/list', // Get trade history list of filled trades
                    ],
                },
            },
            'exceptions': {
                'ORDER_NOT_FOUND': OrderNotFound,
                'INVALID_PARAMETERS': BadRequest,
                'INSUFFICIENT_BALANCE': InsufficientFunds,
                'INSUFFICIENT_AVAILABLE_BALANCE': InsufficientFunds,
                'TOO_MANY_OPEN_ORDERS': InvalidOrder,
                'TOO_SMALL': InvalidOrder,
                'USER_NOT_VERIFIED': PermissionDenied,
                'SYSTEM_ERROR': ExchangeError,
                'ENGINE_NOT_AVAILABLE': ExchangeNotAvailable,
                'USER_ACTIVITY_RESTRICTED': PermissionDenied,
                'UNAUTHORISED': PermissionDenied,
                'OK_PARTIAL': OrderNotFound,
                'ERROR_ORDER_STATUS_SET_NO_CANCEL_CANCELLED': OrderNotFound,
                'ERROR_ORDER_STATUS_SET_NO_CANCEL_AMENDED': OrderNotFound,
                'ERROR_ORDER_STATUS_SET_NO_CANCEL_MATCHED': OrderNotFound,
                'INVALID_NONCE_OR_TONCE': InvalidNonce,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'options': {
                'orderTypes': {
                    'limit': 'LIMIT',
                    'market': 'MARKET',
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetCurrencyStatic (params);
        const pairs = Object.keys (markets['currencyStatic']['currencyPairs']);
        const keys = Object.keys (markets['currencyStatic']['currencies']);
        const conflict_currency = this.safeString (markets['currencyStatic']['currencies']['USD'], 'displayUnit');
        const result = [];
        let end_index = 3;
        for (let i = 0; i < pairs.length; i++) {
            const id = pairs[i];
            for (let n = 0; n < keys.length; n++) {
                const code = id.slice (0, 4);
                const index = code.indexOf (keys[n]);
                if (index === 0) {
                    if (id.slice (0, 3) === conflict_currency && id.length > 6) {
                        end_index = 4;
                    } else {
                        end_index = keys[n].length;
                    }
                    const baseId = id.slice (index, end_index);
                    const base = this.safeCurrencyCode (baseId);
                    const quoteId = id.slice (end_index, id.length);
                    const quote = this.safeCurrencyCode (quoteId);
                    const symbol = baseId + '/' + quoteId;
                    const precision = {
                        'price': this.safeInteger (markets['currencyStatic']['currencyPairs'][id], 'priceDecimals'),
                        'amount': undefined,
                    };
                    const limits = {
                        'amount': {
                            'min': this.safeFloat (markets['currencyStatic']['currencyPairs'][id], 'minOrderRate'),
                            'max': this.safeFloat (markets['currencyStatic']['currencyPairs'][id], 'maxOrderRate'),
                        },
                        'price': {
                            'min': undefined,
                            'max': undefined,
                        },
                    };
                    limits['cost'] = {
                        'min': undefined,
                        'max': undefined,
                    };
                    result.push ({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'baseId': baseId,
                        'quoteId': quoteId,
                        'precision': precision,
                        'limits': limits,
                        'active': undefined,
                        'info': id,
                    });
                }
            }
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const ticker = await this.v2GetSymbolMoneyTicker (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = parseFloat (ticker['data']['dataUpdateTime']);
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker['data']['high'], 'value'),
            'low': this.safeFloat (ticker['data']['low'], 'value'),
            'bid': this.safeFloat (ticker['data']['buy'], 'value'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker['data']['sell'], 'value'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (ticker['data']['last'], 'value'),
            'last': this.safeFloat (ticker['data']['last'], 'value'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker['data']['vol'], 'value'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        const response = await this.v2GetSymbolMoneyDepthFull (this.extend (request, params));
        const orderbook = response['data'];
        const timestamp = this.safeString (response['data'], 'now');
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privatePostAccount (params);
        const wallets = Object.keys (balances['data']['Wallets']);
        const result = { 'info': balances };
        for (let i = 0; i < wallets.length; i++) {
            const currencyId = wallets[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balances['data']['Wallets'][currencyId]['Available_Balance'], 'value');
            account['total'] = this.safeFloat (balances['data']['Wallets'][currencyId]['Balance'], 'value');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (side === 'buy') {
            side = true;
        } else {
            side = false;
        }
        const request = {
            'order': {
                'orderType': this.safeString (this.options['orderTypes'], type, type),
                'buyTradedCurrency': side,
                'settlementCurrency': market['quoteId'],
                'tradedCurrency': market['baseId'],
                'tradedCurrencyAmount': amount,
            },
        };
        if (type === 'limit') {
            request['order']['limitPriceInSettlementCurrency'] = price;
        }
        const response = await this.privatePostOrderNew (this.extend (request, params));
        return {
            'id': response['orderId'],
            'info': response,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderIds': [id],
        };
        return await this.privatePostOrderCancel (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privatePostOrderInfo (this.extend (request, params));
        return this.parseOrder (response['order']);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 20, params = {}) {
        await this.loadMarkets ();
        const open_orders = [];
        let offset = 0;
        const offsetInParams = ('offset' in params);
        if (limit === undefined) {
            limit = 20;
        }
        if (offsetInParams) {
            offset = parseInt (params['offset']);
            params = {};
        }
        if (limit === undefined) {
            limit = 20;
        }
        const request = this.ordered ({
            'offset': offset,
            'max': limit,
        });
        const response = await this.privatePostOrderList (this.extend (request, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        for (let i = 0; i < response['orders'].length; i++) {
            open_orders.push (this.parseOrder (response['orders'][i], market));
        }
        return open_orders;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = 20, params = {}) {
        await this.loadMarkets ();
        const trades = [];
        let offset = 0;
        const offsetInParams = ('offset' in params);
        if (limit === undefined) {
            limit = 20;
        }
        if (offsetInParams) {
            offset = parseInt (params['offset']);
            params = {};
        }
        if (limit === undefined) {
            limit = 20;
        }
        const request = this.ordered ({
            'offset': offset,
            'max': limit,
        });
        const response = await this.privatePostTradeList (this.extend (request, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        if (!response['trades']) {
            return [];
        }
        for (let i = 0; i < response['trades'].length; i++) {
            trades.push (this.parseTrade (response['trades'][i], market));
        }
        return trades;
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        const marketId = this.safeString (trade, 'ccyPair');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeString (trade, 'timestamp');
        const id = this.safeString (trade, 'tradeId');
        const orderId = this.safeString (trade, 'orderId');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat2 (trade, 'settlementCurrencyFillAmountUnrounded');
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        };
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        let side = undefined;
        let base = undefined;
        let quote = undefined;
        const baseId = this.safeString (order, 'tradedCurrency');
        const quoteId = this.safeString (order, 'settlementCurrency');
        const timestamp = this.safeString (order, 'timestamp');
        if ((baseId !== undefined) && (quoteId !== undefined)) {
            base = this.safeCurrencyCode (baseId);
            quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        } else if (market !== undefined) {
            symbol = market['symbol'];
        }
        if (order['buyTradedCurrency']) {
            side = 'buy';
        } else {
            side = 'sell';
        }
        const amount = this.safeFloat (order, 'tradedCurrencyAmount');
        const remaining = this.safeFloat (order, 'tradedCurrencyAmountOutstanding');
        const filled = amount - remaining;
        return {
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': this.safeString (order, 'orderType'),
            'side': side,
            'price': this.safeFloat (order, 'limitPriceInSettlementCurrency'),
            'cost': undefined,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': this.safeString (order, 'orderStatus'),
            'fee': undefined,
            'trades': this.safeString (order, 'trades'),
            'info': order,
        };
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'ccy': currency['id'],
        };
        const response = await this.privatePostReceiveCreate (this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'currency': currency,
            'address': address,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'ccy': currency['id'],
        };
        const response = await this.privatePostReceive (this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'currency': currency,
            'address': address,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.implodeParams (path, params);
        let url = this.urls['api'] + '/' + '3' + request;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const secret = this.base64ToBinary (this.secret);
            params['nonce'] = nonce;
            body = this.json (params);
            const auth = 'api/3' + request + '\0' + body;
            const signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers = {
                'Content-Type': 'application/json',
                'Rest-Key': this.apiKey,
                'Rest-Sign': signature,
            };
        } else {
            url = this.urls['api'] + '/' + '2' + request;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        let error = undefined;
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if (code >= 400) {
            const message = this.safeString (response, 'resultCode');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions, message, feedback);
            throw new ExchangeError (feedback);
        }
        if ('resultCode' in response) {
            if (response['resultCode'] in this.exceptions) {
                error = this.safeString (response, 'resultCode');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions, error, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
