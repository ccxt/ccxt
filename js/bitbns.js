'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class bitbns extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbns',
            'name': 'BitBns Exchange',
            'countries': ['IN'],
            'version': '1.0',
            'has': {
                // 'CORS': false,
                'fetchCurrencies': false,
                'fetchTicker': true, // Can be emulated on fetchTickers if necessary
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFees': false,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'fetchDepositAddress': false,
                'fetchWithdrawals': false,
                'fetchDeposits': false,
                'fetchClosedOrders': false,
                'fetchL2OrderBook': false,
                'fetchOHLCV': 'emulated',
                'fetchOrder': true,
                'editOrder': false,
                'fetchTransactions': false,
                'fetchLedger': false,
                'withdraw': false,
                'fetchMarkets': true,
                'fetchOrderBook': true,
            },
            'urls': {
                'logo': 'https://bitbns.com/assets/img/logos/bitbns.svg',
                'api': {
                    'public': 'https://bitbns.com/order/',
                    'private': 'https://api.bitbns.com/api/trade/v2',
                    'private1': 'https://api.bitbns.com/api/trade/v1',
                },
                'www': 'https://bitbns.com/',
                'doc': 'https://github.com/bitbns-official/node-bitbns-api',
                'fees': 'https://bitbns.com/fees/',
            },
            'api': {
                'public': { 'get': [
                    'fetchOrderBook',
                    'fetchMarkets',
                    'fetchTickers',
                    'fetchTrades',
                ] },
                'private': { 'post': [
                    'orders',
                    'cancel',
                    'getordersnew',
                ] },
                'private1': { 'post': [
                    'orderStatus',
                    'listOpenOrders',
                    'currentCoinBalance',
                    'listExecutedOrders',
                ] },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0025,
                    'taker': 0.0025,
                },
            },
            'verbose': true,
            // 'proxy': '',
            'apiKey': '',
            'secret': '',
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '';
        if (api === 'private1') {
            // Generate complete url
            url = this.urls['api'][api] + '/' + path + '/' + this.safeString (params, 'symbol');
            if (method === 'POST') {
                body = this.json (params);
            }
            // Generate payload
            const timeStamp_nonce = this.milliseconds ();
            const data = {
                'symbol': '/' + path + '/' + this.safeString (params, 'symbol'),
                'timeStamp_nonce': timeStamp_nonce,
                'body': body,
            };
            const payload = this.stringToBase64 (this.encode (this.json (data)));
            // Generate signature from payload
            const signature = this.hmac (payload, this.encode (this.secret), 'sha512', 'hex');
            // Init headers
            headers = {};
            // Attach headers
            headers['X-BITBNS-APIKEY'] = this.apiKey;
            headers['X-BITBNS-PAYLOAD'] = this.decode (payload);
            headers['X-BITBNS-SIGNATURE'] = signature;
            headers['Accept'] = 'application/json';
            headers['Accept-Charset'] = 'utf-8';
            headers['content-type'] = 'application/x-www-form-urlencoded';
        } else if (api === 'private') {
            // Generate complete url
            url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
            // console.log (method, url);
            // console.log ('Signing Privately !!!');
            if (method === 'POST') {
                body = this.json (params);
            }
            // Generate payload
            const timeStamp_nonce = this.milliseconds ();
            // const timeStamp_nonce = '1571663667098';
            const data = {
                'symbol': '/' + path + '/' + this.safeString (params, 'symbol'),
                'timeStamp_nonce': timeStamp_nonce,
                'body': body,
            };
            // console.log("ccxt data:", data);
            const payload = this.stringToBase64 (this.json (data));
            // console.log("ccxt payload:", payload);
            // Generate signature from payload
            const signature = this.hmac (payload, this.secret, 'sha512', 'hex');
            // console.log("ccxt sign:", signature);
            // Init headers
            headers = {};
            // Attach headers
            headers['X-BITBNS-APIKEY'] = this.apiKey;
            headers['X-BITBNS-PAYLOAD'] = payload;
            headers['X-BITBNS-SIGNATURE'] = signature;
            headers['Accept'] = 'application/json';
            headers['Accept-Charset'] = 'utf-8';
            headers['content-type'] = 'application/x-www-form-urlencoded';
        } else {
            url = this.urls['api'][api] + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets (params = {}) {
        const data = await this.publicGetFetchMarkets (params);
        for (let i = 0; i < data.length; i++) {
            if (data[i]['quote'] === 'USDT') {
                data[i]['us_symbol'] = data[i]['base'] + '_' + data[i]['quote'];
            }
        }
        return data;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        return await this.publicGetFetchTickers (params);
    }

    async fetchTicker (symbol = undefined, params = {}) {
        const tickers = await this.fetchTickers (params);
        return this.safeValue (tickers, symbol);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const excgSymbol = market['id'];
        const request = {
            'symbol': excgSymbol,
            'since': since,
            'limit': limit,
        };
        const trades = await this.publicGetFetchTrades (this.extend (request, params));
        for (let i = 0; i < trades.length; i++) {
            trades[i]['symbol'] = symbol;
            trades[i]['id'] = this.safeString (trades[i], 'id');
            const keys = Object.keys (trades[i]);
            for (let k = 0; k < keys.length; k++) {
                if (!this.safeString (trades[i], keys[k])) {
                    trades[i][keys[k]] = undefined;
                }
            }
        }
        return trades;
    }

    async fetchOrderBook (symbol = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const excgSymbol = market['id'];
        const request = {
            'symbol': excgSymbol,
            'limit': limit,
        };
        const ob = await this.publicGetFetchOrderBook (this.extend (request, params));
        return ob;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['id'];
        const request = {
            'symbol': tradingSymbol,
            'side': side.toUpperCase (),
            'quantity': amount,
            'rate': price,
        };
        if (market['quote'] === 'USDT') {
            request['symbol'] = market['us_symbol'];
        }
        const resp = await this.privatePostOrders (this.extend (request, params));
        return {
            'info': resp,
            'id': this.safeString (resp, 'id'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['id'];
        const request = {
            'symbol': tradingSymbol,
            'entry_id': id,
        };
        if (market['quote'] === 'USDT') {
            request['symbol'] = market['us_symbol'];
        }
        if (market['quote'] === 'USDT') {
            request['side'] = 'usdtcancelOrder';
        } else {
            request['side'] = 'cancelOrder';
        }
        const resp = await this.privatePostCancel (this.extend (request, params));
        return resp;
    }

    parseOrder (order, market = undefined) {
        const orderData = this.safeValue (order, 'data')[0];
        const orderObj = {
            'id': this.safeString (orderData, 'entry_id'), // string
            'datetime': this.safeString (orderData, 'time'), // ISO8601 datetime of 'timestamp' with milliseconds
            'timestamp': this.parse8601 (this.safeString (orderData, 'time')),
            'lastTradeTimestamp': undefined, // Unix timestamp of the most recent trade on this order
            'symbol': this.safeString (market, 'symbol'),      // symbol
            'type': 'limit',        // 'market', 'limit'
            'side': this.safeString (orderData, 'side'),          // 'buy', 'sell'
            'price': this.safeFloat (orderData, 'rate'),    // float price in quote currency
            'amount': this.safeFloat (orderData, 'amount'),           // ordered amount of base currency
            'filled': this.safeFloat (orderData, 'filled'),           // filled amount of base currency
            'remaining': this.safeFloat (orderData, 'remaining'), // remaining amount to fill
            'cost': this.safeFloat (orderData, 'filled') * this.safeFloat (orderData, 'avg_cost'),   // 'filled' * 'price' (filling price used where available)
            'trades': undefined,         // a list of order trades/executions
            'fee': this.safeFloat (orderData, 'fee'),
            'info': order,              // the original unparsed order structure as is
        };
        const status = this.safeInteger (orderData, 'status');
        if (status === 0) {
            orderObj['status'] = 'open';
        } else if (status === -1) {
            orderObj['status'] = 'canceled';
        } else if (status === 2) {
            orderObj['status'] = 'closed';
        }
        return orderObj;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['id'];
        const request = {
            'symbol': tradingSymbol,
            'entry_id': id,
        };
        const resp = await this.private1PostOrderStatus (this.extend (request, params));
        const order = this.parseOrder (resp, market);
        return order;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['id'];
        const request = {
            'symbol': tradingSymbol,
            'page': 0,
        };
        if (market['quote'] === 'USDT') {
            request['symbol'] = market['us_symbol'];
        }
        if (market['quote'] === 'USDT') {
            request['side'] = 'usdtListOpenOrders';
        } else {
            request['side'] = 'listOpenOrders';
        }
        const resp = await this.privatePostGetordersnew (this.extend (request, params));
        const orders = this.safeValue (resp, 'data');
        const openOrders = [];
        for (let i = 0; i < orders.length; i++) {
            const orderObj = {
                'id': this.safeString (orders[i], 'entry_id'), // string
                'datetime': this.safeString (orders[i], 'time'), // ISO8601 datetime of 'timestamp' with milliseconds
                'timestamp': this.parse8601 (this.safeString (orders[i], 'time')),
                'lastTradeTimestamp': undefined, // Unix timestamp of the most recent trade on this order
                'symbol': symbol,      // symbol
                'type': 'limit',        // 'market', 'limit'
                'side': undefined,          // 'buy', 'sell'
                'price': this.safeValue (orders[i], 'rate'),    // float price in quote currency
                'amount': undefined,           // ordered amount of base currency
                'filled': undefined,           // filled amount of base currency
                'remaining': this.safeValue (orders[i], 'btc'), // remaining amount to fill
                'cost': undefined,   // 'filled' * 'price' (filling price used where available)
                'trades': undefined,         // a list of order trades/executions
                'fee': undefined,
                'info': resp,              // the original unparsed order structure as is
            };
            const status = this.safeInteger (orders[i], 'status');
            if (status === 0) {
                orderObj['status'] = 'open';
            } else if (status === -1) {
                orderObj['status'] = 'canceled';
            } else if (status === 2) {
                orderObj['status'] = 'closed';
            }
            orderObj['side'] = orders[i].type === 1 ? 'sell' : 'buy';
            orderObj['amount'] = orderObj['price'] * orderObj['remaining'];
            openOrders.push (orderObj);
        }
        return openOrders;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const symbols = Object.keys (this.omit (this.currencies, ['INR']));
        // Body for the balance API request
        const request = {
            'symbol': 'EVERYTHING',
        };
        // Make the API call for balance
        const data = await this.private1PostCurrentCoinBalance (this.extend (request, params));
        const balances = {};
        balances['info'] = data;
        const currencybalances = this.safeValue (data, 'data');
        const freefiat = this.safeFloat (currencybalances, 'availableorderMoney');
        const usedfiat = this.safeFloat (currencybalances, 'inorderMoney');
        balances['INR'] = {
            'free': freefiat,
            'used': usedfiat,
        };
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const availableOrderString = 'availableorder' + symbol;
            const free = this.safeFloat (currencybalances, availableOrderString);
            const inorderString = 'inorder' + symbol;
            const used = this.safeFloat (currencybalances, inorderString);
            balances[symbol] = {
                'free': free,
                'used': used,
            };
        }
        return this.parseBalance (balances);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['id'];
        if (limit === undefined) {
            limit = 0;
        }
        if (since !== undefined) {
            since = this.iso8601 (since);
        }
        const request = {
            'symbol': tradingSymbol,
            'page': 0,
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        const resp = await this.private1PostListExecutedOrders (this.extend (request, params));
        const trades = this.safeValue (resp, 'data');
        const result = [];
        let numOfTrades = trades.length;
        if (limit && trades.length > limit) {
            numOfTrades = limit;
        }
        for (let i = 0; i < numOfTrades; i++) {
            const tradeObj = {
                'info': trades[i],
                'id': trades[i]['id'],
                'timestamp': trades[i]['date'],
                'datetime': this.parse8601 (trades[i]['date']),
                'symbol': symbol,
                'order': undefined,
                'type': 'limit',
                'side': undefined,
                'takerOrMaker': undefined,
                'price': trades[i]['rate'],
                'amount': trades[i]['amount'],
                'fee': trades[i]['fee'],
            };
            result.push (tradeObj);
        }
        return result;
    }
};
