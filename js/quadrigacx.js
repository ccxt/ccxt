'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError } = require ('./base/errors');

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
                'CORS': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766825-98a6d0de-5ee7-11e7-9fa4-38e11a2c6f52.jpg',
                'api': 'https://api.quadrigacx.com',
                'www': 'https://www.quadrigacx.com',
                'doc': 'https://www.quadrigacx.com/api_info',
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
        let book = undefined;
        if (symbol !== undefined) {
            book = this.marketId (symbol);
        }
        let request = { 'book': book, 'limit': limit };
        let transactions = await this.privatePostUserTransactions (this.extend (request, params));
        let trades = [];
        for (let i = 0; i < transactions.length; i++) {
            const transaction = transactions[i];
            if (transaction['type'] === 2) {
                trades.push (this.parseMyTrade (transaction));
            }
        }
        return trades;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let request = {
            'id': id,
        };
        let response = await this.privatePostLookupOrder (this.extend (request, params));
        return this.parseOrders (response);
    }

    parseOrder (order) {
        let price = this.safeFloat (order, 'price');
        let responseAmount = this.safeFloat (order, 'amount');
        let market = this.getMarketById (this.safeString (order, 'book'));
        let side = this.safeString (order, 'type') === '0' ? 'buy' : 'sell';
        let status = undefined;
        let responseStatus = this.safeString (order, 'status');
        if (responseStatus === '-1') {
            status = 'canceled';
        } else if (responseStatus === '0' || responseStatus === '1') {
            status = 'open';
        } else if (responseStatus === '2') {
            status = 'closed';
        }
        let timestamp = this.parse8601 (this.safeString (order, 'created'));
        let result = {
            'info': order,
            'id': this.safeString (order, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastorderTimestamp': this.parse8601 (this.safeString (order, 'updated')),
            'symbol': market['symbol'],
            'type': price === 0 ? 'market' : 'limit',
            'side': side,
            'price': price,
            'cost': undefined,
            'average': undefined,
            'amount': status === 'closed' ? responseAmount : undefined,
            'filled': status === 'closed' ? responseAmount : undefined,
            'remaining': status === 'closed' ? 0 : responseAmount,
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
        let quoteVolume = baseVolume * vwap;
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

    getMarketById (id) {
        let market = undefined;
        if (id in this.markets_by_id) {
            market = this.markets_by_id[id];
        } else {
            let [ baseId, quoteId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (base);
            market = {
                'symbol': base + '/' + quote,
            };
        }
        return market;
    }

    parseMyTrade (trade) {
        let id = this.safeString (trade, 'id');
        let timestamp = this.parse8601 (this.safeString (trade, 'datetime'));
        let market = {};
        let keys = Object.keys (trade);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (trade[key] === trade['rate'] && key !== 'rate') {
                market = this.getMarketById (key);
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let orderId = this.safeString (trade, 'order_id');
        let side = this.safeFloat (trade, market['base']) > 0 ? 'buy' : 'sell';
        let price = this.safeFloat (trade, 'rate');
        let amount = Math.abs (this.safeFloat (trade, market['base'].toLowerCase ()));
        let cost = Math.abs (this.safeFloat (trade, market['quote'].toLowerCase ()));
        let fee = {
            'cost': this.safeFloat (trade, 'fee'),
            'currency': side === 'buy' ? market['base'] : market['quote'],
            'rate': market['maker'],
        };
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

    parseTrade (trade, market = undefined) {
        let id = this.safeString (trade, 'tid');
        let timestamp = parseInt (trade['date']) * 1000;
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let orderId = undefined;
        let side = this.safeString (trade, 'side');
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        let fee = undefined;
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

    handleErrors (statusCode, statusText, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return;
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
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
