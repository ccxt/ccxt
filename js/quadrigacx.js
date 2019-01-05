'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class quadrigacx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'quadrigacx',
            'name': 'QuadrigaCX',
            'countries': [ 'CA' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'fetchDepositAddress': true,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchMyTrades': true,
                'fetchTransactions': true,
                'CORS': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766825-98a6d0de-5ee7-11e7-9fa4-38e11a2c6f52.jpg',
                'api': 'https://api.quadrigacx.com',
                'www': 'https://www.quadrigacx.com',
                'doc': 'https://www.quadrigacx.com/api_info',
                'referral': 'https://www.quadrigacx.com/?ref=laiqgbp6juewva44finhtmrk',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'get': [
                        'order_book',
                        'ticker',
                        'transactions',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'bitcoin_deposit_address',
                        'bitcoin_withdrawal',
                        'bitcoincash_deposit_address',
                        'bitcoincash_withdrawal',
                        'bitcoingold_deposit_address',
                        'bitcoingold_withdrawal',
                        'buy',
                        'cancel_order',
                        'ether_deposit_address',
                        'ether_withdrawal',
                        'litecoin_deposit_address',
                        'litecoin_withdrawal',
                        'lookup_order',
                        'open_orders',
                        'sell',
                        'user_transactions',
                    ],
                },
            },
            'markets': {
                'BTC/CAD': { 'id': 'btc_cad', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD', 'baseId': 'btc', 'quoteId': 'cad', 'maker': 0.005, 'taker': 0.005 },
                'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'btc', 'quoteId': 'usd', 'maker': 0.005, 'taker': 0.005 },
                'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc', 'maker': 0.002, 'taker': 0.002 },
                'ETH/CAD': { 'id': 'eth_cad', 'symbol': 'ETH/CAD', 'base': 'ETH', 'quote': 'CAD', 'baseId': 'eth', 'quoteId': 'cad', 'maker': 0.005, 'taker': 0.005 },
                'LTC/CAD': { 'id': 'ltc_cad', 'symbol': 'LTC/CAD', 'base': 'LTC', 'quote': 'CAD', 'baseId': 'ltc', 'quoteId': 'cad', 'maker': 0.005, 'taker': 0.005 },
                'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc', 'maker': 0.005, 'taker': 0.005 },
                'BCH/CAD': { 'id': 'bch_cad', 'symbol': 'BCH/CAD', 'base': 'BCH', 'quote': 'CAD', 'baseId': 'bch', 'quoteId': 'cad', 'maker': 0.005, 'taker': 0.005 },
                'BCH/BTC': { 'id': 'bch_btc', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'baseId': 'bch', 'quoteId': 'btc', 'maker': 0.005, 'taker': 0.005 },
                'BTG/CAD': { 'id': 'btg_cad', 'symbol': 'BTG/CAD', 'base': 'BTG', 'quote': 'CAD', 'baseId': 'btg', 'quoteId': 'cad', 'maker': 0.005, 'taker': 0.005 },
                'BTG/BTC': { 'id': 'btg_btc', 'symbol': 'BTG/BTC', 'base': 'BTG', 'quote': 'BTC', 'baseId': 'btg', 'quoteId': 'btc', 'maker': 0.005, 'taker': 0.005 },
            },
            'exceptions': {
                '101': AuthenticationError,
                '106': OrderNotFound, // { 'code':106, 'message': 'Cannot perform request - not found' }
            },
        });
    }

    async fetchBalance (params = {}) {
        let balances = await this.privatePostBalance ();
        let result = { 'info': balances };
        let currencyIds = Object.keys (this.currencies_by_id);
        for (let i = 0; i < currencyIds.length; i++) {
            let currencyId = currencyIds[i];
            let currency = this.currencies_by_id[currencyId];
            let code = currency['code'];
            result[code] = {
                'free': this.safeFloat (balances, currencyId + '_available'),
                'used': this.safeFloat (balances, currencyId + '_reserved'),
                'total': this.safeFloat (balances, currencyId + '_balance'),
            };
        }
        return this.parseBalance (result);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['book'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this.privatePostUserTransactions (this.extend (request, params));
        let trades = this.filterBy (response, 'type', 2);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTransactions (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['book'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this.privatePostUserTransactions (this.extend (request, params));
        let user_transactions = this.filterByArray (response, 'type', [0, 1], false);
        // return user_transactions;
        return this.parseTransactions (user_transactions, market, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         "btc":"0.99985260",
        //         "method":"Bitcoin",
        //         "fee":"0.00000000",
        //         "type":0,
        //         "datetime":"2018-10-08 05:26:23"
        //     }
        //
        //     {
        //         "btc":"-0.50000000",
        //         "method":"Bitcoin",
        //         "fee":"0.00000000",
        //         "type":1,
        //         "datetime":"2018-08-27 13:50:10"
        //     }
        //
        let code = undefined;
        let amount = undefined;
        let omitted = this.omit (transaction, [ 'datetime', 'type', 'method', 'fee' ]);
        let keys = Object.keys (omitted);
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] in this.currencies_by_id) {
                code = keys[i];
            }
        }
        if (code !== undefined) {
            amount = this.safeString (transaction, code);
        }
        let timestamp = this.parse8601 (this.safeString (transaction, 'datetime'));
        let status = 'ok';
        const fee = this.safeFloat (transaction, 'fee');
        let type = this.safeInteger (transaction, 'type');
        type = (type === 1) ? 'withdrawal' : 'deposit';
        return {
            'info': transaction,
            'id': undefined,
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'tag': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': {
                'currency': code,
                'cost': fee,
            },
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let request = {
            'id': id,
        };
        let response = await this.privatePostLookupOrder (this.extend (request, params));
        return this.parseOrders (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            '-1': 'canceled',
            '0': 'open',
            '1': 'open',
            '2': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        let id = this.safeString (order, 'id');
        let price = this.safeFloat (order, 'price');
        let amount = undefined;
        let filled = undefined;
        let remaining = this.safeFloat (order, 'amount');
        let cost = undefined;
        let symbol = undefined;
        let marketId = this.safeString (order, 'book');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        } else {
            let [ baseId, quoteId ] = marketId.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            symbol = base + '/' + quote;
        }
        let side = this.safeString (order, 'type');
        if (side === '0') {
            side = 'buy';
        } else {
            side = 'sell';
        }
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let timestamp = this.parse8601 (this.safeString (order, 'created'));
        let lastTradeTimestamp = this.parse8601 (this.safeString (order, 'updated'));
        let type = (price === 0.0) ? 'market' : 'limit';
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        if (status === 'closed') {
            amount = remaining;
            filled = remaining;
            remaining = 0;
        }
        if ((type === 'limit') && (price !== undefined)) {
            if (filled !== undefined) {
                cost = price * filled;
            }
        }
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let orderbook = await this.publicGetOrderBook (this.extend ({
            'book': this.marketId (symbol),
        }, params));
        let timestamp = parseInt (orderbook['timestamp']) * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        let response = await this.publicGetTicker (this.extend ({
            'book': 'all',
        }, params));
        let ids = Object.keys (response);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let symbol = id;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                let [ baseId, quoteId ] = id.split ('_');
                let base = baseId.toUpperCase ();
                let quote = quoteId.toUpperCase ();
                base = this.commonCurrencyCode (base);
                quote = this.commonCurrencyCode (base);
                symbol = base + '/' + quote;
                market = {
                    'symbol': symbol,
                };
            }
            result[symbol] = this.parseTicker (response[id], market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTicker (this.extend ({
            'book': market['id'],
        }, params));
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market !== undefined)
            symbol = market['symbol'];
        let timestamp = parseInt (ticker['timestamp']) * 1000;
        let vwap = this.safeFloat (ticker, 'vwap');
        let baseVolume = this.safeFloat (ticker, 'volume');
        let quoteVolume = undefined;
        if (baseVolume !== undefined && vwap !== undefined)
            quoteVolume = baseVolume * vwap;
        let last = this.safeFloat (ticker, 'last');
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
            'vwap': vwap,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {"amount":"2.26252009","date":"1541355778","price":"0.03300000","tid":3701722,"side":"sell"}
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "datetime": "2018-01-01T00:00:00", // date and time
        //         "id": 123, // unique identifier (only for trades)
        //         "type": 2, // transaction type (0 - deposit; 1 - withdrawal; 2 - trade)
        //         "method": "...", // deposit or withdrawal method
        //         "(minor currency code)" – the minor currency amount
        //         "(major currency code)" – the major currency amount
        //         "order_id": "...", // a 64 character long hexadecimal string representing the order that was fully or partially filled (only for trades)
        //         "fee": 123.45, // transaction fee
        //         "rate": 54.321, // rate per btc (only for trades)
        //     }
        //
        let id = this.safeString2 (trade, 'tid', 'id');
        let timestamp = this.parse8601 (this.safeString (trade, 'datetime'));
        if (timestamp === undefined) {
            timestamp = this.safeInteger (trade, 'date');
            if (timestamp !== undefined) {
                timestamp *= 1000;
            }
        }
        let symbol = undefined;
        let omitted = this.omit (trade, [ 'datetime', 'id', 'type', 'method', 'order_id', 'fee', 'rate' ]);
        let keys = Object.keys (omitted);
        let rate = this.safeFloat (trade, 'rate');
        for (let i = 0; i < keys.length; i++) {
            let marketId = keys[i];
            let floatValue = this.safeFloat (trade, marketId);
            if (floatValue === rate) {
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                } else {
                    let currencyIds = marketId.split ('_');
                    let numCurrencyIds = currencyIds.length;
                    if (numCurrencyIds === 2) {
                        let baseId = currencyIds[0];
                        let quoteId = currencyIds[1];
                        let base = baseId.toUpperCase ();
                        let quote = quoteId.toUpperCase ();
                        base = this.commonCurrencyCode (base);
                        quote = this.commonCurrencyCode (base);
                        symbol = base + '/' + quote;
                    }
                }
            }
        }
        let orderId = this.safeString (trade, 'order_id');
        let side = this.safeString (trade, 'side');
        let price = this.safeFloat (trade, 'price', rate);
        let amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            let baseId = market['baseId'];
            let quoteId = market['quoteId'];
            if (amount === undefined) {
                amount = this.safeFloat (trade, baseId);
                if (amount !== undefined) {
                    amount = Math.abs (amount);
                }
            }
            cost = this.safeFloat (trade, quoteId);
            if (cost !== undefined) {
                cost = Math.abs (cost);
            }
            if (side === undefined) {
                let baseValue = this.safeFloat (trade, market['baseId']);
                if ((baseValue !== undefined) && (baseValue > 0)) {
                    side = 'buy';
                } else {
                    side = 'sell';
                }
            }
        }
        if (cost === undefined) {
            if (price !== undefined) {
                if (amount !== undefined) {
                    cost = amount * price;
                }
            }
        }
        let fee = undefined;
        let feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            let feeCurrency = undefined;
            if (market !== undefined) {
                feeCurrency = (side === 'buy') ? market['base'] : market['quote'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTransactions (this.extend ({
            'book': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'amount': amount,
            'book': this.marketId (symbol),
        };
        if (type === 'limit')
            order['price'] = price;
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder (this.extend ({
            'id': id,
        }, params));
    }

    async fetchDepositAddress (code, params = {}) {
        let method = 'privatePost' + this.getCurrencyName (code) + 'DepositAddress';
        let response = await this[method] (params);
        // [E|e]rror
        if (response.indexOf ('rror') >= 0) {
            throw new ExchangeError (this.id + ' ' + response);
        }
        this.checkAddress (response);
        return {
            'currency': code,
            'address': response,
            'tag': undefined,
            'info': response,
        };
    }

    getCurrencyName (code) {
        const currencies = {
            'ETH': 'Ether',
            'BTC': 'Bitcoin',
            'LTC': 'Litecoin',
            'BCH': 'Bitcoincash',
            'BTG': 'Bitcoingold',
        };
        return currencies[code];
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let request = {
            'amount': amount,
            'address': address,
        };
        let method = 'privatePost' + this.getCurrencyName (code) + 'Withdrawal';
        let response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api === 'public') {
            url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let request = [ nonce.toString (), this.uid, this.apiKey ].join ('');
            let signature = this.hmac (this.encode (request), this.encode (this.secret));
            let query = this.extend ({
                'key': this.apiKey,
                'nonce': nonce,
                'signature': signature,
            }, params);
            body = this.json (query);
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (statusCode, statusText, url, method, headers, body, response) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return;
        if ((body[0] === '{') || (body[0] === '[')) {
            let error = this.safeValue (response, 'error');
            if (error !== undefined) {
                //
                // {"error":{"code":101,"message":"Invalid API Code or Invalid Signature"}}
                //
                const code = this.safeString (error, 'code');
                const feedback = this.id + ' ' + this.json (response);
                const exceptions = this.exceptions;
                if (code in exceptions) {
                    throw new exceptions[code] (feedback);
                } else {
                    throw new ExchangeError (this.id + ' unknown "error" value: ' + this.json (response));
                }
            }
        }
    }
};
