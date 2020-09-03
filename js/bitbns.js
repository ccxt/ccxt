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
            'verbose': false,
            // 'proxy': '',
            'apiKey': '',
            'secret': '',
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '';
        if (api === 'private1' || api === 'private') {
            if (api === 'private1') {
                // Generate complete url
                url = this.urls['api'][api] + '/' + path + '/' + this.safeString (params, 'symbol');
            }
            if (api === 'private') {
                url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
            }
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
        const data = await this.publicGetFetchTickers (params);
        if (symbols === undefined) {
            return data;
        }
        const result = {};
        for (let i = 0; i < symbols.length; i++) {
            result[symbols[i]] = this.safeValue (data, symbols[i]);
        }
        return result;
    }

    async fetchTicker (symbol = undefined, params = {}) {
        const tickers = await this.fetchTickers (undefined, params);
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
                const keyVal = this.safeString (trades[i], keys[k]);
                if (keyVal.length === 0) {
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
        return await this.publicGetFetchOrderBook (this.extend (request, params));
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
        return await this.privatePostCancel (this.extend (request, params));
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        // Determine status (string)
        const orderStatus = this.safeInteger (order, 'status');
        let status = undefined;
        if (orderStatus === 0) {
            status = 'open';
        } else if (orderStatus === -1) {
            status = 'canceled';
        } else if (orderStatus === 2) {
            status = 'closed';
        }
        // Determine fee
        const orderFee = this.safeFloat (order, 'fee');
        let fee = undefined;
        if (orderFee !== undefined) {
            fee = {
                'currency': '',
                'cost': orderFee,
                'rate': 0.0025,
            };
        }
        const datetime = this.safeString (order, 'time');
        const id = this.safeString (order, 'entry_id');
        const orderObj = {
            'id': id, // string
            'clientOrderId': undefined,
            'datetime': datetime, // ISO8601 datetime of 'timestamp' with milliseconds
            'timestamp': this.parse8601 (datetime),
            'lastTradeTimestamp': undefined, // Unix timestamp of the most recent trade on this order
            'status': status,
            'symbol': symbol,      // symbol
            'type': 'limit',        // 'market', 'limit'
            'side': this.safeString (order, 'side'),          // 'buy', 'sell'
            'price': this.safeFloat (order, 'rate'),    // float price in quote currency
            'amount': this.safeFloat (order, 'amount'),           // ordered amount of base currency
            'filled': this.safeFloat (order, 'filled'),           // filled amount of base currency
            'remaining': this.safeFloat (order, 'remaining'), // remaining amount to fill
            'cost': this.safeFloat (order, 'filled') * this.safeFloat (order, 'avg_cost'),   // 'filled' * 'price' (filling price used where available)
            'trades': undefined,         // a list of order trades/executions
            'fee': fee,
            'info': order,              // the original unparsed order structure as is
        };
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
        const order = this.safeValue (resp, 'data')[0];
        return this.parseOrder (order, market);
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
        return this.parseOrders (orders, market, since, limit);
        // const openOrders = [];
        // for (let i = 0; i < orders.length; i++) {
        //     const orderObj = {
        //         // 'id': this.safeString (orders[i], 'entry_id'), // string
        //         // 'datetime': this.safeString (orders[i], 'time'), // ISO8601 datetime of 'timestamp' with milliseconds
        //         // 'timestamp': this.parse8601 (this.safeString (orders[i], 'time')),
        //         // 'lastTradeTimestamp': undefined, // Unix timestamp of the most recent trade on this order
        //         // 'symbol': symbol,      // symbol
        //         // 'type': 'limit',        // 'market', 'limit'
        //         'side': undefined,          // 'buy', 'sell'
        //         'price': this.safeValue (orders[i], 'rate'),    // float price in quote currency
        //         'amount': undefined,           // ordered amount of base currency
        //         'filled': undefined,           // filled amount of base currency
        //         'remaining': this.safeValue (orders[i], 'btc'), // remaining amount to fill
        //         'cost': undefined,   // 'filled' * 'price' (filling price used where available)
        //         // 'trades': undefined,         // a list of order trades/executions
        //         // 'fee': undefined,
        //         // 'info': resp,              // the original unparsed order structure as is
        //     };
        //     const status = this.safeInteger (orders[i], 'status');
        //     if (status === 0) {
        //         orderObj['status'] = 'open';
        //     } else if (status === -1) {
        //         orderObj['status'] = 'canceled';
        //     } else if (status === 2) {
        //         orderObj['status'] = 'closed';
        //     }
        //     orderObj['side'] = this.safeString (orders[i], 'type') === 1 ? 'sell' : 'buy';
        //     orderObj['amount'] = orderObj['price'] * orderObj['remaining'];
        //     openOrders.push (orderObj);
        // }
        // return openOrders;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const codes = Object.keys (this.omit (this.currencies, ['INR']));
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
        if ((freefiat !== undefined) || (usedfiat !== undefined)) {
            balances['INR'] = {
                'free': freefiat,
                'used': usedfiat,
            };
        }
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const currencyId = currency['id'];
            const availableOrderString = 'availableorder' + currencyId;
            const free = this.safeFloat (currencybalances, availableOrderString);
            const inorderString = 'inorder' + currencyId;
            const used = this.safeFloat (currencybalances, inorderString);
            if ((free !== undefined) || (used !== undefined)) {
                balances[code] = {
                    'free': free,
                    'used': used,
                };
            }
        }
        return this.parseBalance (balances);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const date = this.safeString (trade, 'date');
        const price = this.safeFloat (trade, 'rate');
        const crypto = this.safeFloat (trade, 'crypto');
        const factor = this.safeFloat (trade, 'factor');
        const fee = this.safeFloat (trade, 'fee');
        const amount = crypto / factor;
        const cost = this.sum ((amount * price), fee);
        const tradeObj = {
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'timestamp': this.parse8601 (date),
            'datetime': date,
            'symbol': symbol,
            'order': undefined,
            'type': 'limit',
            'side': undefined,
            'takerOrMaker': undefined,
            'price': price, // float price in quote currency (like INR for BTC/INR)
            'amount': amount, // amount of base currency (like BTC for BTC/INR)
            'cost': cost,
            'fee': {
                'cost': fee,
                'currency': '',
                'rate': '0.0025',
            },
        };
        return tradeObj;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['id'];
        const request = {
            'symbol': tradingSymbol,
            'page': 0,
        };
        if (since !== undefined) {
            since = this.iso8601 (since);
            request['since'] = since;
        }
        const resp = await this.private1PostListExecutedOrders (this.extend (request, params));
        const trades = this.safeValue (resp, 'data');
        return this.parseTrades (trades, market, since, limit);
    }
};
