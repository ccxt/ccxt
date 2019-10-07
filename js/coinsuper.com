'use strict';

// ---------------------------------------------------------------------------

const Exchange = require('ccxt/js/base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, DDoSProtection, ExchangeNotAvailable, InvalidOrder, InvalidNonce, OrderNotFound, PermissionDenied, InsufficientFunds } = require('ccxt/js/base/errors');


// ---------------------------------------------------------------------------

module.exports = class coinsuper extends Exchange {
    //#region Describe
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'coinsuper',
            'name': 'CoinSuper',
            'countries': ['CN'],
            'rateLimit': 200,
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchTrades': true,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': false,
                'fetchOHLCV': true,
                'fetchBalance': true,
                'cancelOrder': true,
                'cancelOrders': true,
            },
            'timeframes': {
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '6h': '6hour',
                '12h': '12hour',
                '1d': '1day'
            },
            'urls': {
                'logo': 'https://www.coinsuper.com/api/docs/v1/images/logo.png',
                'api': {
                    'public': 'https://api.coinsuper.com',
                    'private': 'https://api.coinsuper.com/api'
                },
                'www': 'https://coinsuper.com',
                'doc': 'https://www.coinsuper.com/api/docs/v1/api_en.html',
                'fees': 'https://support.coinsuper.info/hc/en-gb/articles/360020538154-Fees-Schedule'
            },

            'api': {
                'public': {
                    'get': [
                    ]
                },
                'private': {
                    'post': [
                        'market/orderBook',
                        'market/kline',
                        'market/tickers',
                        'market/symbolList',
                        'order/buy',
                        'order/sell',
                        'order/cancel',
                        'order/batchCancel',
                        'asset/userAssetInfo',
                        'order/list',
                        'order/details',
                        'order/clList',
                        'order/openList',
                        'order/history',
                        'order/tradeHistory'
                    ]
                },
                'options': {
                    //'defaultTimeInForce': 'FOK'
                }
            },
            'exceptions': {
                '2000': ExchangeNotAvailable, //'system upgrading',
                '2001': 'system internal error',
                '2002': 'interface is unavailability',
                '2003': DDoSProtection, //request is too frequently,
                '2004': PermissionDenied, //fail to check sign
                '2005': ArgumentsRequired, //parameter is invalid,
                '2006': 'request failure',
                '2007': PermissionDenied, //'accesskey has been forbidden',
                '2008': 'user not exist',
                '3001': InsufficientFunds, //'account balance is not enough',
                '3002': OrderNotFound, //'orderNo is not exist',
                '3003': 'price is invalid',
                '3004': 'symbol is invalid',
                '3005': 'quantity is invalid',
                '3006': 'ordertype is invalid',
                '3007': 'action is invalid',
                '3008': 'state is invalid',
                '3009': InvalidNonce, //'num is invalid',
                '3010': 'amount is invalid',
                '3011': 'cancel order failure',
                '3012': 'create order failure',
                '3013': 'orderList is invalid',
                '3014': 'symbol not trading',
                '3015': 'order amount or quantity less than min setting',
                '3016': 'price greater than max setting',
                '3017': AuthenticationError, //'user account forbidden',
                '3018': 'order has execute',
                '3019': 'orderNo num is more than the max setting',
                '3020': 'price out of range',
                '3021': 'order has canceled',
                '3027': 'this symbols API trading channel is not available',
                '3028': 'duplicate clientOrderId',
                '3029': 'Market price deviation is too large, market order is not recommended',
                '3030': 'Market price deviation is too large, market order is not recommended',
                '3031': 'batch create order more or less than limit',
                '3032': 'batch create order symbol not unique',
                '3033': 'batch create order action not unique',
                '3034': 'clientOrderIdList and orderNoList should and only pass one',
                '3035': 'order cancel param error',
                '3036': 'not usual ip'
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true
            }
        });
    }
    //#endregion

    //#region Get Market Data
    async fetchMarkets(params = {}) {
        const response = await this.privatePostMarketSymbolList(params);
        const markets = this.safeValue(response['data'], 'result')
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString(market, 'symbol');
            const [baseId, quoteId] = id.split('/');
            let base = baseId.toUpperCase();
            let quote = quoteId.toUpperCase();
            base = this.safeCurrencyCode(base);
            quote = this.safeCurrencyCode(quote);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger(market, 'quantityScale'),
                'price': this.safeInteger(market, 'priceScale'),
                'totalPrice': this.safeInteger(market, 'amountScale')
            };
            const amountLimits = {
                'min': this.safeFloat(market, 'quantityMin'),
                'max': this.safeFloat(market, 'quantityMax')
            };
            const marketTotalLimits = {
                'min': this.safeFloat(market, 'priceMin'),
                'max': this.safeFloat(market, 'priceMax')
            };
            const deviationRatio = {
                'deviation': this.safeFloat(market, 'deviationRatio')
            };
            const limits = {
                'amount': amountLimits,
                'Market Total price': marketTotalLimits,
                'deviationRatio': deviationRatio
            };
            result.push({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': limits,
                'info': market
            });
        }
        return result;
    }

    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.privatePostAssetUserAssetInfo(params);
        const result = { 'info': response };
        const balances = this.safeValue(response['data']['result'], 'asset', {});
        const currencyIds = Object.keys(balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const balance = this.safeValue(balances, currencyId, {});
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeFloat(balance, 'available');
            account['total'] = this.safeFloat(balance, 'total');
            result[code] = account;
        }
        return this.parseBalance(result);
    }

    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' fetchOrderBook requires a `symbol` argument');
        }
        const market = this.market (symbol);
        await this.loadMarkets();
        if (limit === undefined || limit > 50) {
            limit = 50;
        }
        let request = {
            'symbol': market['id'],
            'num': limit
        };

        const response = await this.privatePostMarketOrderBook(this.extend(request, params));
        const orderbook = this.safeValue(response['data'], 'result', {});
        const timeStamp = this.safeValue(response['data'], 'timestamp', {});
        return this.parseOrderBook(orderbook, timeStamp, 'bids', 'asks', 'limitPrice', 'quantity');
    }

    async fetchOHLCV(symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' fetchOHLCV requires a `symbol` argument');
        }
        await this.loadMarkets();
        const market = this.market (symbol);
        if (limit === undefined || limit > 300) {
            limit = 300;
        }
        const request = {
            'symbol': market['id'],
            'range': this.timeframes[timeframe],
            'num': limit
        };
        const response = await this.privatePostMarketKline(this.extend(request, params));
        const data = this.safeValue(response['data'], 'result', {});
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }

    async fetchTrades(symbol, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' fetchMyTrades requires a `symbol` argument');
        }
        const market = this.market (symbol);
        await this.loadMarkets();
        const request = {
            'symbol': market['id']
        };
        const response = await this.privatePostMarketTickers(this.extend(request, params));
        const data = this.safeValue(response['data'], 'result', {});
        return this.parseTrades(data, market);
    }

    async fetchOpenOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            "symbol": this.marketId(symbol),
            "num": "1000"
        };
        const response = await this.privatePostOrderOpenList(this.extend(request, params));
        const data = this.safeValue(response['data'], 'result', []);
        const orderInfo = await this.fetchOrders(data, symbol);
        return orderInfo;
    }

    async fetchOrder(ordersId, params = {}) {
        if (ordersId === undefined) {
            throw new ArgumentsRequired(this.id + ' fetchOrder requires a `ordersId` argument');
        }
        return this.fetchOrders(ordersId, params);
    }

    async fetchOrders(ordersId, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (ordersId === undefined) {
            throw new ArgumentsRequired(this.id + ' fetchOrders requires a `ordersId` argument');
        }
        await this.loadMarkets();
        let preformatedOrderID = [];
        let result = [];
        for (let i = 0; i < ordersId.length; i += 50) {
            preformatedOrderID.push(ordersId.slice(i, i + 50));
        }
        for (let i = 0; i < preformatedOrderID.length; i++) {
            const request = {
                "orderNoList": preformatedOrderID[i].toString()
            };
            const response = await this.privatePostOrderList(this.extend(request, params));
            let market;
            if (symbol !== undefined) {
                market = this.market(symbol);
                request['pair'] = market['id'];
            }
            const data = this.safeValue(response['data'], 'result', []);
            const orders = this.parseOrders(data, market);
            result = result.concat(orders);
        }
        const filteredResult = this.filterBySymbol(result, symbol);
        return this.filterBySinceLimit(filteredResult, since, limit);
    }
    //#endregion

    //#region Order Management
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' createOrder requires a `symbol` argument');
        }
        let method = 'privatePostOrder' + this.capitalize(side);
        let request = undefined;
        const market = this.market (symbol);
        if (type === 'limit') {
            if (price === undefined || amount === undefined) {
                throw new ArgumentsRequired(this.id + ' Limit Create Order requires a `price` and `amount` arguments');
            }
            request = {
                'orderType': 'LMT',
                'symbol': market['id'],
                "priceLimit": this.priceToPrecision(symbol, price),
                "amount": '0',
                "quantity": this.amountToPrecision(symbol, amount)
            };
        } else if (type === 'market') {
            if (amount === undefined) {
                throw new ArgumentsRequired(this.id + ' Market Create Order requires an `amount` in quote cur. for BUY and in base cur. for SALE');
            }
            request = {
                'orderType': 'MKT',
                'symbol': symbol,
                "priceLimit": '0',
                "amount": amount.toString(),
                "quantity": '0'
            };
        }
        const response = await this[method](this.extend(request, params));
        const data = this.safeValue(response['data'], 'result', {});
        data['priceLimit'] = price;
        data['quantity'] = amount;
        data['quantityRemaining'] = amount;
        data['orderType'] = type;
        data['action'] = side;
        data['timestamp'] = this.safeValue(response['data'], 'timestamp');
        const order = this.parseOrder(data, market);
        return order;
    }

    async cancelOrder(id, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired(this.id + ' cancelOrder requires a `id` argument');
        }
        await this.loadMarkets();
        const request = {
            'orderNo': id
        };
        const response = await this.privatePostOrderCancel(this.extend(request, params));
        const data = this.safeValue(response['data'], 'result', {});
        data['timestamp'] = this.safeValue(response['data'], 'timestamp');
        data['id'] = id;
        data['info'] = response;
        return data;
    }

    async cancelOrders(id, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired(this.id + ' cancelOrder requires a `id` argument');
        }
        await this.loadMarkets();
        const request = {
            'orderNoList': id.toString()
        };
        const response = await this.privatePostOrderBatchCancel(this.extend(request, params));
        const data = this.safeValue(response['data'], 'result', {});
        data['timestamp'] = this.safeValue(response['data'], 'timestamp');
        data['info'] = response;
        return data;
    }
    //#endregion

    //#region Parse Response
    parseOrderStatus(status) {
        const statuses = {
            'UNDEAL': 'open',
            'PARTDEAL': 'Partially filled',
            'DEAL': 'closed',
            'CANCEL': 'canceled'
        };
        return this.safeString(statuses, status);
    }

    parseOrderType(type) {
        const types = {
            'LMT': 'limit',
            'MKT': 'market'
        };
        return this.safeString(types, type, type);
    }

    parseOrder(order, market = undefined) {
        let timestamp = this.safeInteger(order, 'timestamp');
        timestamp = this.safeInteger(order, 'utcCreate', timestamp);
        let lastTradeTimestamp = this.safeInteger(order, 'utcUpdate');
        if (timestamp === undefined) {
            timestamp = this.nonce();
        }
        let symbol = undefined;
        if (market === undefined) {
            market = this.markets_by_id[order['symbol']];
        }
        const status = this.parseOrderStatus(this.safeString(order, 'state'));
        let type = this.parseOrderType(this.safeString(order, 'orderType'));

        let price = this.safeFloat(order, 'priceLimit');
        let amount = this.safeFloat(order, 'quantity');
        //amount = this.safeFloat(order, 'quantity', amount);
        let remaining = this.safeFloat(order, 'quantityRemaining');
        let id = this.safeString(order, 'orderNo');
        let side = this.safeStringLower(order, 'action');
        let feeCost = this.safeFloat(order, 'fee');
        let feeCurrency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        }
        const fee = {
            'cost': feeCost,
            'currency': feeCurrency,
            'rate': undefined
        };
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }

        return {
            'id': id,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'fee': fee
        };
    }

    parseTrade(trade, market = undefined) {
        let timestamp = this.safeInteger(trade, 'timestamp');
        let side = this.safeStringLower(trade, 'tradeType');
        const price = this.safeFloat2(trade, 'rate', 'price');
        const id = this.safeString2(trade, 'trade_id', 'tid');
        const order = this.safeString(trade, 'order_id');
        if ('pair' in trade) {
            const marketId = this.safeString(trade, 'pair');
            market = this.safeValue(this.markets_by_id, marketId, market);
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const amount = this.safeFloat(trade, 'volume');
        const type = 'limit'; // all trades are still limit trades
        let takerOrMaker = undefined;
        let fee = undefined;
        const feeCost = this.safeFloat(trade, 'commission');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString(trade, 'commissionCurrency');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode
            };
        }
        const isYourOrder = this.safeValue(trade, 'is_your_order');
        if (isYourOrder !== undefined) {
            takerOrMaker = 'taker';
            if (isYourOrder) {
                takerOrMaker = 'maker';
            }
            if (fee === undefined) {
                fee = this.calculateFee(symbol, type, side, amount, price, takerOrMaker);
            }
        }
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        return {
            'id': id,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
            'info': trade
        };
    }
    //#endregion

    //#region Sign and Error
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.version + '/' + path;
        if (api === 'public') {
            url += '?' + this.urlencode(params);
            headers = { 'Content-Type': 'application/json' };
        } else {
            this.checkRequiredCredentials();
            const nonce = this.nonce();
            let signature = this.extend({
                'timestamp': nonce,
                'accesskey': this.apiKey,
                'secretkey': this.secret
            }, params);
            signature = this.rawencode(this.keysort(signature));
            signature = this.hash(signature, 'md5');
            body = this.extend({
                'common': {
                    'accesskey': this.apiKey,
                    'sign': signature,
                    'timestamp': nonce
                },
                'data': params
            });
            headers = { 'Content-Type': 'application/json' };
            if (body !== undefined) {
                body = this.json(body, { 'convertArraysToObjects': true });
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors(code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return;
        }
        if ('code' in response) {
            if (response['code'] != 1000) {
                const code = this.safeString(response['code']);
                const feedback = this.id + ' ' + body;
                const exceptions = this.exceptions;
                if (code in exceptions) {
                    throw new exceptions[code](feedback);
                } else {
                    throw new ExchangeError(feedback);
                }
            }
        }
        if (!('result' in response['data'])) {
            throw new ExchangeError(this.id + ' ' + body);
        }
    }

    handleRestResponse(response, url, method = 'GET', requestHeaders = undefined, requestBody = undefined) {
        return response.text().then((responseBody) => {
            let toBigNum = responseBody.replace(/:(\d{19,})/g, `:"$1"`)
            const json = this.parseJson(toBigNum)

            const responseHeaders = this.getResponseHeaders(response)

            if (this.enableLastResponseHeaders) {
                this.last_response_headers = responseHeaders
            }

            if (this.enableLastHttpResponse) {
                this.last_http_response = responseBody // FIXME: for those classes that haven't switched to handleErrors yet
            }

            if (this.enableLastJsonResponse) {
                this.last_json_response = json         // FIXME: for those classes that haven't switched to handleErrors yet
            }

            if (this.verbose)
                console.log("handleRestResponse:\n", this.id, method, url, response.status, response.statusText, "\nResponse:\n", responseHeaders, "\n", responseBody, "\n")

            this.handleErrors(response.status, response.statusText, url, method, responseHeaders, responseBody, json, requestHeaders, requestBody)
            this.defaultErrorHandler(response.status, response.statusText, url, method, responseHeaders, responseBody, json)

            return json || responseBody
        })
    }
    //#endregion 
};
