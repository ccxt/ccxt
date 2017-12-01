"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class bitso extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitso',
            'name': 'Bitso',
            'countries': 'MX', // Mexico
            'rateLimit': 2000, // 30 requests per minute
            'version': 'v3',
            'hasCORS': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766335-715ce7aa-5ed5-11e7-88a8-173a27bb30fe.jpg',
                'api': 'https://api.bitso.com',
                'www': 'https://bitso.com',
                'doc': 'https://bitso.com/api_info',
            },
            'api': {
                'public': {
                    'get': [
                        'available_books',
                        'ticker',
                        'order_book',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'account_status',
                        'balance',
                        'fees',
                        'fundings',
                        'fundings/{fid}',
                        'funding_destination',
                        'kyc_documents',
                        'ledger',
                        'ledger/trades',
                        'ledger/fees',
                        'ledger/fundings',
                        'ledger/withdrawals',
                        'mx_bank_codes',
                        'open_orders',
                        'order_trades/{oid}',
                        'orders/{oid}',
                        'user_trades',
                        'user_trades/{tid}',
                        'withdrawals/',
                        'withdrawals/{wid}',
                    ],
                    'post': [
                        'bitcoin_withdrawal',
                        'debit_card_withdrawal',
                        'ether_withdrawal',
                        'orders',
                        'phone_number',
                        'phone_verification',
                        'phone_withdrawal',
                        'spei_withdrawal',
                    ],
                    'delete': [
                        'orders/{oid}',
                        'orders/all',
                    ],
                },
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetAvailableBooks ();
        let result = [];
        for (let i = 0; i < markets['payload'].length; i++) {
            let market = markets['payload'][i];
            let id = market['book'];
            let symbol = id.toUpperCase ().replace ('_', '/');
            let [ base, quote ] = symbol.split ('/');
            let limits = {
                'amount': {
                    'min': parseFloat (market['minimum_amount']),
                    'max': parseFloat (market['maximum_amount']),
                },
                'price': {
                    'min': parseFloat (market['minimum_price']),
                    'max': parseFloat (market['maximum_price']),
                },
                'cost': {
                    'min': parseFloat (market['minimum_value']),
                    'max': parseFloat (market['maximum_value']),
                },
            };
            let precision = {
                'amount': this.precisionFromString (market['minimum_amount']),
                'price': this.precisionFromString (market['minimum_price']),
            };
            let lot = limits['amount']['min'];
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'lot': lot,
                'limits': limits,
                'precision': precision,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalance ();
        let balances = response['payload']['balances'];
        let result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'].toUpperCase ();
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['locked']),
                'total': parseFloat (balance['total']),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetOrderBook (this.extend ({
            'book': this.marketId (symbol),
        }, params));
        let orderbook = response['payload'];
        let timestamp = this.parse8601 (orderbook['updated_at']);
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTicker (this.extend ({
            'book': this.marketId (symbol),
        }, params));
        let ticker = response['payload'];
        let timestamp = this.parse8601 (ticker['created_at']);
        let vwap = parseFloat (ticker['vwap']);
        let baseVolume = parseFloat (ticker['volume']);
        let quoteVolume = baseVolume * vwap;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': vwap,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['created_at']);
        let symbol = undefined;
        if (!market) {
            if ('book' in trade)
                market = this.markets_by_id[trade['book']];
        }
        if (market)
            symbol = market['symbol'];
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': trade['maker_side'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'book': market['id'],
        }, params));
        return this.parseTrades (response['payload'], market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'book': this.marketId (symbol),
            'side': side,
            'type': type,
            'major': this.amountToPrecision (symbol, amount),
        };
        if (type == 'limit')
            order['price'] = this.priceToPrecision (symbol, price);
        let response = await this.privatePostOrders (this.extend (order, params));
        return {
            'info': response,
            'id': response['payload']['oid'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteOrders ({ 'oid': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'] + query;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let request = [ nonce, method, query ].join ('');
            if (Object.keys (params).length) {
                body = this.json (params);
                request += body;
            }
            let signature = this.hmac (this.encode (request), this.encode (this.secret));
            let auth = this.apiKey + ':' + nonce + ':' + signature;
            headers = {
                'Authorization': "Bitso " + auth,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response)
            if (response['success'])
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
}
