'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, InvalidNonce, OrderNotFound, InvalidOrder, InsufficientFunds, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class liquid extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'liquid',
            'name': 'Liquid',
            'countries': [ 'JP', 'CN', 'TW' ],
            'version': '2',
            'rateLimit': 1000,
            'has': {
                'CORS': false,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/45798859-1a872600-bcb4-11e8-8746-69291ce87b04.jpg',
                'api': 'https://api.liquid.com',
                'www': 'https://www.liquid.com',
                'doc': [
                    'https://developers.quoine.com',
                    'https://developers.quoine.com/v2',
                ],
                'fees': 'https://help.liquid.com/getting-started-with-liquid/the-platform/fee-structure',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'products',
                        'products/{id}',
                        'products/{id}/price_levels',
                        'executions',
                        'ir_ladders/{currency}',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/balance',
                        'accounts/main_asset',
                        'crypto_accounts',
                        'executions/me',
                        'fiat_accounts',
                        'loan_bids',
                        'loans',
                        'orders',
                        'orders/{id}',
                        'orders/{id}/trades',
                        'orders/{id}/executions',
                        'trades',
                        'trades/{id}/loans',
                        'trading_accounts',
                        'trading_accounts/{id}',
                        'transactions',
                    ],
                    'post': [
                        'fiat_accounts',
                        'loan_bids',
                        'orders',
                    ],
                    'put': [
                        'loan_bids/{id}/close',
                        'loans/{id}',
                        'orders/{id}',
                        'orders/{id}/cancel',
                        'trades/{id}',
                        'trades/{id}/close',
                        'trades/close_all',
                        'trading_accounts/{id}',
                    ],
                },
            },
            'skipJsonOnStatusCodes': [401],
            'exceptions': {
                'messages': {
                    'API Authentication failed': AuthenticationError,
                    'Nonce is too small': InvalidNonce,
                    'Order not found': OrderNotFound,
                    'Can not update partially filled order': OrderNotFound,
                    'Can not update non-live order': OrderNotFound,
                    'user': {
                        'not_enough_free_balance': InsufficientFunds,
                    },
                    'price': {
                        'must_be_positive': InvalidOrder,
                    },
                    'quantity': {
                        'less_than_order_size': InvalidOrder,
                    },
                },
            },
            'commonCurrencies': {
                'WIN': 'WCOIN',
            },
        });
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetCurrencies (params);
        //
        //     [
        //         {
        //             currency_type: 'fiat',
        //             currency: 'USD',
        //             symbol: '$',
        //             assets_precision: 2,
        //             quoting_precision: 5,
        //             minimum_withdrawal: '15.0',
        //             withdrawal_fee: 5,
        //             minimum_fee: null,
        //             minimum_order_quantity: null,
        //             display_precision: 2,
        //             depositable: true,
        //             withdrawable: true,
        //             discount_fee: 0.5,
        //         },
        //     ]
        //
        let result = {};
        for (let i = 0; i < response.length; i++) {
            let currency = response[i];
            let id = this.safeString (currency, 'currency');
            let code = this.commonCurrencyCode (id);
            let active = currency['depositable'] && currency['withdrawable'];
            let amountPrecision = this.safeInteger (currency, 'display_precision');
            let pricePrecision = this.safeInteger (currency, 'quoting_precision');
            let precision = Math.max (amountPrecision, pricePrecision);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': code,
                'active': active,
                'fee': this.safeFloat (currency, 'withdrawal_fee'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -amountPrecision),
                        'max': Math.pow (10, amountPrecision),
                    },
                    'price': {
                        'min': Math.pow (10, -pricePrecision),
                        'max': Math.pow (10, pricePrecision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minimum_withdrawal'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets () {
        let markets = await this.publicGetProducts ();
        //
        //     [
        //         {
        //             id: '7',
        //             product_type: 'CurrencyPair',
        //             code: 'CASH',
        //             name: ' CASH Trading',
        //             market_ask: 8865.79147,
        //             market_bid: 8853.95988,
        //             indicator: 1,
        //             currency: 'SGD',
        //             currency_pair_code: 'BTCSGD',
        //             symbol: 'S$',
        //             btc_minimum_withdraw: null,
        //             fiat_minimum_withdraw: null,
        //             pusher_channel: 'product_cash_btcsgd_7',
        //             taker_fee: 0,
        //             maker_fee: 0,
        //             low_market_bid: '8803.25579',
        //             high_market_ask: '8905.0',
        //             volume_24h: '15.85443468',
        //             last_price_24h: '8807.54625',
        //             last_traded_price: '8857.77206',
        //             last_traded_quantity: '0.00590974',
        //             quoted_currency: 'SGD',
        //             base_currency: 'BTC',
        //             disabled: false,
        //         },
        //     ]
        //
        let currencies = await this.fetchCurrencies ();
        let currenciesByCode = this.indexBy (currencies, 'code');
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['id'].toString ();
            let baseId = market['base_currency'];
            let quoteId = market['quoted_currency'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let maker = this.safeFloat (market, 'maker_fee');
            let taker = this.safeFloat (market, 'taker_fee');
            let active = !market['disabled'];
            let baseCurrency = this.safeValue (currenciesByCode, base);
            let quoteCurrency = this.safeValue (currenciesByCode, quote);
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let minAmount = undefined;
            if (baseCurrency !== undefined) {
                minAmount = this.safeFloat (baseCurrency['info'], 'minimum_order_quantity');
                precision['amount'] = this.safeInteger (baseCurrency['info'], 'quoting_precision');
            }
            let minPrice = undefined;
            if (quoteCurrency !== undefined) {
                precision['price'] = this.safeInteger (quoteCurrency['info'], 'display_precision');
                minPrice = Math.pow (10, -precision['price']);
            }
            let minCost = undefined;
            if (minPrice !== undefined) {
                if (minAmount !== undefined) {
                    minCost = minPrice * minAmount;
                }
            }
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
                    'min': minCost,
                    'max': undefined,
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'maker': maker,
                'taker': taker,
                'limits': limits,
                'precision': precision,
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAccountsBalance (params);
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currencyId = balance['currency'];
            let code = currencyId;
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            }
            let total = parseFloat (balance['balance']);
            let account = {
                'free': total,
                'used': undefined,
                'total': total,
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetProductsIdPriceLevels (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'buy_price_levels', 'sell_price_levels');
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let last = undefined;
        if ('last_traded_price' in ticker) {
            if (ticker['last_traded_price']) {
                let length = ticker['last_traded_price'].length;
                if (length > 0)
                    last = this.safeFloat (ticker, 'last_traded_price');
            }
        }
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (ticker, 'id');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                let baseId = this.safeString (ticker, 'base_currency');
                let quoteId = this.safeString (ticker, 'quoted_currency');
                if (symbol in this.markets) {
                    market = this.markets[symbol];
                } else {
                    symbol = this.commonCurrencyCode (baseId) + '/' + this.commonCurrencyCode (quoteId);
                }
            }
        }
        if (market !== undefined)
            symbol = market['symbol'];
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        let open = this.safeFloat (ticker, 'last_price_24h');
        if (open !== undefined && last !== undefined) {
            change = last - open;
            average = this.sum (last, open) / 2;
            if (open > 0) {
                percentage = change / open * 100;
            }
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high_market_ask'),
            'low': this.safeFloat (ticker, 'low_market_bid'),
            'bid': this.safeFloat (ticker, 'market_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'market_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'volume_24h'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetProducts (params);
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = this.parseTicker (tickers[t]);
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetProductsId (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        // {             id:  12345,
        //         quantity: "6.789",
        //            price: "98765.4321",
        //       taker_side: "sell",
        //       created_at:  1512345678,
        //          my_side: "buy"           }
        let timestamp = trade['created_at'] * 1000;
        let orderId = this.safeString (trade, 'order_id');
        // 'taker_side' gets filled for both fetchTrades and fetchMyTrades
        let takerSide = this.safeString (trade, 'taker_side');
        // 'my_side' gets filled for fetchMyTrades only and may differ from 'taker_side'
        let mySide = this.safeString (trade, 'my_side');
        let side = (mySide !== undefined) ? mySide : takerSide;
        let takerOrMaker = undefined;
        if (mySide !== undefined)
            takerOrMaker = (takerSide === mySide) ? 'taker' : 'maker';
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'quantity'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'product_id': market['id'],
        };
        if (limit !== undefined)
            request['limit'] = limit;
        if (since !== undefined) {
            // timestamp should be in seconds, whereas we use milliseconds in since and everywhere
            request['timestamp'] = parseInt (since / 1000);
        }
        let response = await this.publicGetExecutions (this.extend (request, params));
        let result = (since !== undefined) ? response : response['models'];
        return this.parseTrades (result, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        // the `with_details` param is undocumented - it adds the order_id to the results
        let request = {
            'product_id': market['id'],
            'with_details': true,
        };
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.privateGetExecutionsMe (this.extend (request, params));
        return this.parseTrades (response['models'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'order_type': type,
            'product_id': this.marketId (symbol),
            'side': side,
            'quantity': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit') {
            order['price'] = this.priceToPrecision (symbol, price);
        }
        let response = await this.privatePostOrders (this.extend (order, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let result = await this.privatePutOrdersIdCancel (this.extend ({
            'id': id,
        }, params));
        let order = this.parseOrder (result);
        if (order['status'] === 'closed')
            throw new OrderNotFound (this.id + ' ' + this.json (order));
        return order;
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder requires the price argument');
        }
        let order = {
            'order': {
                'quantity': this.amountToPrecision (symbol, amount),
                'price': this.priceToPrecision (symbol, price),
            },
        };
        let result = await this.privatePutOrdersId (this.extend ({
            'id': id,
        }, order));
        return this.parseOrder (result);
    }

    parseOrder (order, market = undefined) {
        let orderId = order['id'].toString ();
        let timestamp = order['created_at'] * 1000;
        let marketId = this.safeString (order, 'product_id');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
        }
        let status = undefined;
        if ('status' in order) {
            if (order['status'] === 'live') {
                status = 'open';
            } else if (order['status'] === 'filled') {
                status = 'closed';
            } else if (order['status'] === 'cancelled') { // 'll' intended
                status = 'canceled';
            }
        }
        let amount = this.safeFloat (order, 'quantity');
        let filled = this.safeFloat (order, 'filled_quantity');
        let price = this.safeFloat (order, 'price');
        let symbol = undefined;
        let feeCurrency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        }
        let type = order['order_type'];
        let executedQuantity = 0;
        let totalValue = 0;
        let averagePrice = this.safeFloat (order, 'average_price');
        let trades = undefined;
        if ('executions' in order) {
            trades = this.parseTrades (order['executions'], market);
            for (let i = 0; i < trades.length; i++) {
                let trade = trades[i];
                trade.order = orderId;
                trade.type = type;
                executedQuantity += trade.amount;
                let cost = trade.price * trade.amount;
                totalValue += cost;
            }
            if (!averagePrice && trades.length > 0) {
                averagePrice = totalValue / executedQuantity;
            }
        }
        let cost = filled * averagePrice;
        return {
            'id': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': type,
            'status': status,
            'symbol': symbol,
            'side': order['side'],
            'price': price,
            'amount': amount,
            'filled': filled,
            'cost': cost,
            'remaining': amount - filled,
            'trades': trades,
            'fee': {
                'currency': feeCurrency,
                'cost': this.safeFloat (order, 'order_fee'),
            },
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let order = await this.privateGetOrdersId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        let status = this.safeValue (params, 'status');
        if (status) {
            params = this.omit (params, 'status');
            if (status === 'open') {
                request['status'] = 'live';
            } else if (status === 'closed') {
                request['status'] = 'filled';
            } else if (status === 'canceled') {
                request['status'] = 'cancelled';
            }
        }
        if (limit !== undefined)
            request['limit'] = limit;
        let result = await this.privateGetOrders (this.extend (request, params));
        let orders = result['models'];
        return this.parseOrders (orders, market, since, limit);
    }

    fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend ({ 'status': 'open' }, params));
    }

    fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend ({ 'status': 'closed' }, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        headers = {
            'X-Quoine-API-Version': this.version,
            'Content-Type': 'application/json',
        };
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                if (Object.keys (query).length)
                    url += '?' + this.urlencode (query);
            } else if (Object.keys (query).length) {
                body = this.json (query);
            }
            let nonce = this.nonce ();
            let request = {
                'path': url,
                'nonce': nonce,
                'token_id': this.apiKey,
                'iat': Math.floor (nonce / 1000), // issued at
            };
            headers['X-Quoine-Auth'] = this.jwt (request, this.secret);
        } else {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response = undefined) {
        if (code >= 200 && code <= 299)
            return;
        const messages = this.exceptions['messages'];
        if (code === 401) {
            // expected non-json response
            if (body in messages)
                throw new messages[body] (this.id + ' ' + body);
            else
                return;
        }
        if (response === undefined)
            if ((body[0] === '{') || (body[0] === '['))
                response = JSON.parse (body);
            else
                return;
        const feedback = this.id + ' ' + this.json (response);
        if (code === 404) {
            // { "message": "Order not found" }
            const message = this.safeString (response, 'message');
            if (message in messages)
                throw new messages[message] (feedback);
        } else if (code === 422) {
            // array of error messages is returned in 'user' or 'quantity' property of 'errors' object, e.g.:
            // { "errors": { "user": ["not_enough_free_balance"] }}
            // { "errors": { "quantity": ["less_than_order_size"] }}
            if ('errors' in response) {
                const errors = response['errors'];
                const errorTypes = ['user', 'quantity', 'price'];
                for (let i = 0; i < errorTypes.length; i++) {
                    const errorType = errorTypes[i];
                    if (errorType in errors) {
                        const errorMessages = errors[errorType];
                        for (let j = 0; j < errorMessages.length; j++) {
                            const message = errorMessages[j];
                            if (message in messages[errorType])
                                throw new messages[errorType][message] (feedback);
                        }
                    }
                }
            }
        }
    }
};
