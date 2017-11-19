"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class mercado extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mercado',
            'name': 'Mercado Bitcoin',
            'countries': 'BR', // Brazil
            'rateLimit': 1000,
            'version': 'v3',
            'hasCORS': true,
            'hasWithdraw': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg',
                'api': {
                    'public': 'https://www.mercadobitcoin.net/api',
                    'private': 'https://www.mercadobitcoin.net/tapi',
                },
                'www': 'https://www.mercadobitcoin.com.br',
                'doc': [
                    'https://www.mercadobitcoin.com.br/api-doc',
                    'https://www.mercadobitcoin.com.br/trade-api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{coin}/orderbook/', // last slash critical
                        '{coin}/ticker/',
                        '{coin}/trades/',
                        '{coin}/trades/{from}/',
                        '{coin}/trades/{from}/{to}',
                        '{coin}/day-summary/{year}/{month}/{day}/',
                    ],
                },
                'private': {
                    'post': [
                        'cancel_order',
                        'get_account_info',
                        'get_order',
                        'get_withdrawal',
                        'list_system_messages',
                        'list_orders',
                        'list_orderbook',
                        'place_buy_order',
                        'place_sell_order',
                        'withdraw_coin',
                    ],
                },
            },
            'markets': {
                'BTC/BRL': { 'id': 'BRLBTC', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'suffix': 'Bitcoin' },
                'LTC/BRL': { 'id': 'BRLLTC', 'symbol': 'LTC/BRL', 'base': 'LTC', 'quote': 'BRL', 'suffix': 'Litecoin' },
                'BCH/BRL': { 'id': 'BRLBCH', 'symbol': 'BCH/BRL', 'base': 'BCH', 'quote': 'BRL', 'suffix': 'BCash' },
            },
        });
    }

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let orderbook = await this.publicGetCoinOrderbook (this.extend ({
            'coin': market['base'],
        }, params));
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetCoinTicker (this.extend ({
            'coin': market['base'],
        }, params));
        let ticker = response['ticker'];
        let timestamp = parseInt (ticker['date']) * 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['vol']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': trade['tid'].toString (),
            'order': undefined,
            'type': undefined,
            'side': trade['type'],
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetCoinTrades (this.extend ({
            'coin': market['base'],
        }, params));
        return this.parseTrades (response, market);
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['response_data']['balance'];
        let result = { 'info': response };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            if (lowercase in balances) {
                account['free'] = parseFloat (balances[lowercase]['available']);
                account['total'] = parseFloat (balances[lowercase]['total']);
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let method = 'privatePostPlace' + this.capitalize (side) + 'Order';
        let order = {
            'coin_pair': this.marketId (symbol),
            'quantity': amount,
            'limit_price': price,
        };
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['response_data']['order']['order_id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder (this.extend ({
            'order_id': id,
        }, params));
    }

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let request = {
            'coin': currency,
            'quantity': amount.toFixed (10),
            'address': address,
        };
        if (currency == 'BRL') {
            let account_ref = ('account_ref' in params);
            if (!account_ref)
                throw new ExchangeError (this.id + ' requires account_ref parameter to withdraw ' + currency);
        } else if (currency != 'LTC') {
            let tx_fee = ('tx_fee' in params);
            if (!tx_fee)
                throw new ExchangeError (this.id + ' requires tx_fee parameter to withdraw ' + currency);
        }
        let response = await this.privatePostWithdrawCoin (this.extend (request, params));
        return {
            'info': response,
            'id': response['response_data']['withdrawal']['id'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        if (api == 'public') {
            url += this.implodeParams (path, params);
        } else {
            this.checkRequiredCredentials ();
            url += this.version + '/';
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'tapi_method': path,
                'tapi_nonce': nonce,
            }, params));
            let auth = '/tapi/' + this.version + '/' + '?' + body;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'TAPI-ID': this.apiKey,
                'TAPI-MAC': this.hmac (this.encode (auth), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error_message' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
}
