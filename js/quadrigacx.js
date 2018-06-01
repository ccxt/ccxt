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
            'countries': 'CA',
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'fetchDepositAddress': true,
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
                'BTC/CAD': { 'id': 'btc_cad', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD', 'maker': 0.005, 'taker': 0.005 },
                'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'maker': 0.005, 'taker': 0.005 },
                'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'maker': 0.002, 'taker': 0.002 },
                'ETH/CAD': { 'id': 'eth_cad', 'symbol': 'ETH/CAD', 'base': 'ETH', 'quote': 'CAD', 'maker': 0.005, 'taker': 0.005 },
                'LTC/CAD': { 'id': 'ltc_cad', 'symbol': 'LTC/CAD', 'base': 'LTC', 'quote': 'CAD', 'maker': 0.005, 'taker': 0.005 },
                'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'maker': 0.005, 'taker': 0.005 },
                'BCH/CAD': { 'id': 'bch_cad', 'symbol': 'BCH/CAD', 'base': 'BCH', 'quote': 'CAD', 'maker': 0.005, 'taker': 0.005 },
                'BCH/BTC': { 'id': 'bch_btc', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'maker': 0.005, 'taker': 0.005 },
                'BTG/CAD': { 'id': 'btg_cad', 'symbol': 'BTG/CAD', 'base': 'BTG', 'quote': 'CAD', 'maker': 0.005, 'taker': 0.005 },
                'BTG/BTC': { 'id': 'btg_btc', 'symbol': 'BTG/BTC', 'base': 'BTG', 'quote': 'BTC', 'maker': 0.005, 'taker': 0.005 },
            },
        });
    }

    async fetchBalance (params = {}) {
        let balances = await this.privatePostBalance ();
        let result = { 'info': balances };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let lowercase = currency.toLowerCase ();
            let account = {
                'free': parseFloat (balances[lowercase + '_available']),
                'used': parseFloat (balances[lowercase + '_reserved']),
                'total': parseFloat (balances[lowercase + '_balance']),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let orderbook = await this.publicGetOrderBook (this.extend ({
            'book': this.marketId (symbol),
        }, params));
        let timestamp = parseInt (orderbook['timestamp']) * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    }

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetTicker (this.extend ({
            'book': this.marketId (symbol),
        }, params));
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

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000;
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': trade['tid'].toString (),
            'order': undefined,
            'type': undefined,
            'side': trade['side'],
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amount'),
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

    async fetchDepositAddress (currency, params = {}) {
        let method = 'privatePost' + this.getCurrencyName (currency) + 'DepositAddress';
        let response = await this[method] (params);
        let address = undefined;
        let status = undefined;
        // [E|e]rror
        if (response.indexOf ('rror') >= 0) {
            status = 'error';
        } else {
            address = response;
            status = 'ok';
        }
        this.checkAddress (address);
        return {
            'currency': currency,
            'address': address,
            'status': status,
            'info': this.last_http_response,
        };
    }

    getCurrencyName (currency) {
        const currencies = {
            'ETH': 'Ether',
            'BTC': 'Bitcoin',
            'LTC': 'Litecoin',
            'BCH': 'Bitcoincash',
            'BTG': 'Bitcoingold',
        };
        return currencies[currency];
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let request = {
            'amount': amount,
            'address': address,
        };
        let method = 'privatePost' + this.getCurrencyName (currency) + 'Withdrawal';
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
        // Here is a sample QuadrigaCX response in case of authentication failure:
        // {"error":{"code":101,"message":"Invalid API Code or Invalid Signature"}}
        if (statusCode === 200 && body.indexOf ('Invalid API Code or Invalid Signature') >= 0) {
            throw new AuthenticationError (this.id + ' ' + body);
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (typeof response === 'string')
            return response;
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
};
