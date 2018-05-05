'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class itbit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'itbit',
            'name': 'itBit',
            'countries': 'US',
            'rateLimit': 2000,
            'version': 'v1',
            'has': {
                'CORS': true,
                'createMarketOrder': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg',
                'api': 'https://api.itbit.com',
                'www': 'https://www.itbit.com',
                'doc': [
                    'https://api.itbit.com/docs',
                    'https://www.itbit.com/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'markets/{symbol}/ticker',
                        'markets/{symbol}/order_book',
                        'markets/{symbol}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'wallets',
                        'wallets/{walletId}',
                        'wallets/{walletId}/balances/{currencyCode}',
                        'wallets/{walletId}/funding_history',
                        'wallets/{walletId}/trades',
                        'wallets/{walletId}/orders/{id}',
                    ],
                    'post': [
                        'wallet_transfers',
                        'wallets',
                        'wallets/{walletId}/cryptocurrency_deposits',
                        'wallets/{walletId}/cryptocurrency_withdrawals',
                        'wallets/{walletId}/orders',
                        'wire_withdrawal',
                    ],
                    'delete': [
                        'wallets/{walletId}/orders/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'XBTUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
                'BTC/SGD': { 'id': 'XBTSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
                'BTC/EUR': { 'id': 'XBTEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
            },
            'fees': {
                'trading': {
                    'maker': 0,
                    'taker': 0.2 / 100,
                },
            },
        });
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let orderbook = await this.publicGetMarketsSymbolOrderBook (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetMarketsSymbolTicker (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        let serverTimeUTC = ('serverTimeUTC' in ticker);
        if (!serverTimeUTC)
            throw new ExchangeError (this.id + ' fetchTicker returned a bad response: ' + this.json (ticker));
        let timestamp = this.parse8601 (ticker['serverTimeUTC']);
        let vwap = this.safeFloat (ticker, 'vwap24h');
        let baseVolume = this.safeFloat (ticker, 'volume24h');
        let quoteVolume = undefined;
        if (typeof baseVolume !== 'undefined' && typeof vwap !== 'undefined')
            quoteVolume = baseVolume * vwap;
        let last = this.safeFloat (ticker, 'lastPrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24h'),
            'low': this.safeFloat (ticker, 'low24h'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeFloat (ticker, 'openToday'),
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
        let timestamp = this.parse8601 (trade['timestamp']);
        let id = trade['matchNumber'].toString ();
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': id,
            'type': undefined,
            'side': undefined,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amount'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetMarketsSymbolTrades (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response['recentTrades'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        let response = await this.privateGetBalances ();
        let balances = response['balances'];
        let result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let account = {
                'free': parseFloat (balance['availableBalance']),
                'used': 0.0,
                'total': parseFloat (balance['totalBalance']),
            };
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    fetchWallets () {
        return this.privateGetWallets ();
    }

    nonce () {
        return this.milliseconds ();
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let walletIdInParams = ('walletId' in params);
        if (!walletIdInParams)
            throw new ExchangeError (this.id + ' createOrder requires a walletId parameter');
        amount = amount.toString ();
        price = price.toString ();
        let market = this.market (symbol);
        let order = {
            'side': side,
            'type': type,
            'currency': market['base'],
            'amount': amount,
            'display': amount,
            'price': price,
            'instrument': market['id'],
        };
        let response = await this.privatePostTradeAdd (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let walletIdInParams = ('walletId' in params);
        if (!walletIdInParams)
            throw new ExchangeError (this.id + ' cancelOrder requires a walletId parameter');
        return await this.privateDeleteWalletsWalletIdOrdersId (this.extend ({
            'id': id,
        }, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            if (Object.keys (query).length)
                body = this.json (query);
            else
                body = '';
            let nonce = this.nonce ().toString ();
            let timestamp = nonce;
            let auth = [ method, url, body, nonce, timestamp ];
            let message = nonce + this.json (auth);
            let hash = this.hash (this.encode (message), 'sha256', 'binary');
            let binhash = this.binaryConcat (url, hash);
            let signature = this.hmac (binhash, this.encode (this.secret), 'sha512', 'base64');
            headers = {
                'Authorization': this.apiKey + ':' + signature,
                'Content-Type': 'application/json',
                'X-Auth-Timestamp': timestamp,
                'X-Auth-Nonce': nonce,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('code' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
};
