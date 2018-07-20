'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class mercado extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mercado',
            'name': 'Mercado Bitcoin',
            'countries': [ 'BR' ], // Brazil
            'rateLimit': 1000,
            'version': 'v3',
            'has': {
                'CORS': true,
                'createMarketOrder': false,
                'fetchOrder': true,
                'withdraw': true,
            },
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
            'fees': {
                'trading': {
                    'maker': 0.3 / 100,
                    'taker': 0.7 / 100,
                },
            },
        });
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
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
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
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
        let method = 'publicGetCoinTrades';
        let request = {
            'coin': market['base'],
        };
        if (typeof since !== 'undefined') {
            method += 'From';
            request['from'] = parseInt (since / 1000);
        }
        let to = this.safeInteger (params, 'to');
        if (typeof to !== 'undefined')
            method += 'To';
        let response = await this[method] (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['response_data']['balance'];
        let result = { 'info': response };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
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
        if (type === 'market')
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
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' cancelOrder() requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        return await this.privatePostCancelOrder (this.extend ({
            'coin_pair': market['id'],
            'order_id': id,
        }, params));
    }

    parseOrder (order, market = undefined) {
        let side = undefined;
        if ('order_type' in order)
            side = (order['order_type'] === 1) ? 'buy' : 'sell';
        let status = order['status'];
        let symbol = undefined;
        if (typeof market === 'undefined') {
            if ('coin_pair' in order)
                if (order['coin_pair'] in this.markets_by_id)
                    market = this.markets_by_id[order['coin_pair']];
        }
        if (market)
            symbol = market['symbol'];
        let timestamp = undefined;
        if ('created_timestamp' in order)
            timestamp = parseInt (order['created_timestamp']) * 1000;
        if ('updated_timestamp' in order)
            timestamp = parseInt (order['updated_timestamp']) * 1000;
        let fee = {
            'cost': this.safeFloat (order, 'fee'),
            'currency': market['quote'],
        };
        let price = this.safeFloat (order, 'limit_price');
        // price = this.safeFloat (order, 'executed_price_avg', price);
        let average = this.safeFloat (order, 'executed_price_avg');
        let amount = this.safeFloat (order, 'quantity');
        let filled = this.safeFloat (order, 'executed_quantity');
        let remaining = amount - filled;
        let cost = amount * average;
        let result = {
            'info': order,
            'id': order['order_id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' cancelOrder() requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = undefined;
        response = await this.privatePostGetOrder (this.extend ({
            'coin_pair': market['id'],
            'order_id': parseInt (id),
        }, params));
        return this.parseOrder (response['response_data']['order']);
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let request = {
            'coin': currency,
            'quantity': amount.toFixed (10),
            'address': address,
        };
        if (currency === 'BRL') {
            let account_ref = ('account_ref' in params);
            if (!account_ref)
                throw new ExchangeError (this.id + ' requires account_ref parameter to withdraw ' + currency);
        } else if (currency !== 'LTC') {
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
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            url += this.implodeParams (path, params);
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
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
};
