'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class anxpro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'anxpro',
            'name': 'ANXPro',
            'countries': [ 'JP', 'SG', 'HK', 'NZ' ],
            'version': '2',
            'rateLimit': 1500,
            'has': {
                'CORS': false,
                'fetchOHLCV': false,
                'fetchTrades': false,
                'fetchOpenOrders': true,
                'fetchDepositAddress': true,
                'createDepositAddress': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg',
                'api': 'https://anxpro.com/api',
                'www': 'https://anxpro.com',
                'doc': [
                    'http://docs.anxv2.apiary.io',
                    'https://anxpro.com/pages/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{currency_pair}/money/ticker',
                        '{currency_pair}/money/depth/full',
                        '{currency_pair}/money/trade/fetch', // disabled by ANXPro
                    ],
                },
                'private': {
                    'post': [
                        '{currency_pair}/money/order/add',
                        '{currency_pair}/money/order/cancel',
                        '{currency_pair}/money/order/quote',
                        '{currency_pair}/money/order/result',
                        '{currency_pair}/money/orders',
                        'money/{currency}/address',
                        'money/{currency}/send_simple',
                        'money/info',
                        'money/trade/list',
                        'money/wallet/history',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'BTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'multiplier': 100000 },
                'BTC/HKD': { 'id': 'BTCHKD', 'symbol': 'BTC/HKD', 'base': 'BTC', 'quote': 'HKD', 'multiplier': 100000 },
                'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'multiplier': 100000 },
                'BTC/CAD': { 'id': 'BTCCAD', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD', 'multiplier': 100000 },
                'BTC/AUD': { 'id': 'BTCAUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD', 'multiplier': 100000 },
                'BTC/SGD': { 'id': 'BTCSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD', 'multiplier': 100000 },
                'BTC/JPY': { 'id': 'BTCJPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY', 'multiplier': 100000 },
                'BTC/GBP': { 'id': 'BTCGBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP', 'multiplier': 100000 },
                'BTC/NZD': { 'id': 'BTCNZD', 'symbol': 'BTC/NZD', 'base': 'BTC', 'quote': 'NZD', 'multiplier': 100000 },
                'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'multiplier': 100000 },
                'STR/BTC': { 'id': 'STRBTC', 'symbol': 'STR/BTC', 'base': 'STR', 'quote': 'BTC', 'multiplier': 100000000 },
                'XRP/BTC': { 'id': 'XRPBTC', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'multiplier': 100000000 },
                'DOGE/BTC': { 'id': 'DOGEBTC', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC', 'multiplier': 100000000 },
            },
            'fees': {
                'trading': {
                    'maker': 0.3 / 100,
                    'taker': 0.6 / 100,
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostMoneyInfo ();
        let balance = response['data'];
        let currencies = Object.keys (balance['Wallets']);
        let result = { 'info': balance };
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let account = this.account ();
            if (currency in balance['Wallets']) {
                let wallet = balance['Wallets'][currency];
                account['free'] = parseFloat (wallet['Available_Balance']['value']);
                account['total'] = parseFloat (wallet['Balance']['value']);
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let response = await this.publicGetCurrencyPairMoneyDepthFull (this.extend ({
            'currency_pair': this.marketId (symbol),
        }, params));
        let orderbook = response['data'];
        let t = parseInt (orderbook['dataUpdateTime']);
        let timestamp = parseInt (t / 1000);
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetCurrencyPairMoneyTicker (this.extend ({
            'currency_pair': this.marketId (symbol),
        }, params));
        let ticker = response['data'];
        let t = parseInt (ticker['dataUpdateTime']);
        let timestamp = parseInt (t / 1000);
        let bid = this.safeFloat (ticker['buy'], 'value');
        let ask = this.safeFloat (ticker['sell'], 'value');
        let baseVolume = parseFloat (ticker['vol']['value']);
        let last = parseFloat (ticker['last']['value']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']['value']),
            'low': parseFloat (ticker['low']['value']),
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': parseFloat (ticker['avg']['value']),
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        throw new ExchangeError (this.id + ' switched off the trades endpoint, see their docs at http://docs.anxv2.apiary.io/reference/market-data/currencypairmoneytradefetch-disabled');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        const request = {
            'currency_pair': market['id'],
        };
        // ANXPro will return all symbol pairs regardless of what is specified in request
        const response = await this.privatePostCurrencyPairMoneyOrders (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "data": [
        //             {
        //                 "oid": "e74305c7-c424-4fbc-a8a2-b41d8329deb0",
        //                 "currency": "HKD",
        //                 "item": "BTC",
        //                 "type": "offer",
        //                 "amount": {
        //                     "currency": "BTC",
        //                     "display": "10.00000000 BTC",
        //                     "display_short": "10.00 BTC",
        //                     "value": "10.00000000",
        //                     "value_int": "1000000000"
        //                 },
        //                 "effective_amount": {
        //                     "currency": "BTC",
        //                     "display": "10.00000000 BTC",
        //                     "display_short": "10.00 BTC",
        //                     "value": "10.00000000",
        //                     "value_int": "1000000000"
        //                 },
        //                 "price": {
        //                     "currency": "HKD",
        //                     "display": "412.34567 HKD",
        //                     "display_short": "412.35 HKD",
        //                     "value": "412.34567",
        //                     "value_int": "41234567"
        //                 },
        //                 "status": "open",
        //                 "date": 1393411075000,
        //                 "priority": 1393411075000000,
        //                 "actions": []
        //             },
        //            ...
        //         ]
        //     }
        //
        return this.parseOrders (this.safeValue (response, 'data', {}), symbol, since, limit);
    }

    parseOrders (orders, symbol = undefined, since = undefined, limit = undefined) {
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            let order = this.parseOrder (orders[i]);
            result.push (order);
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //       "oid": "e74305c7-c424-4fbc-a8a2-b41d8329deb0",
        //       "currency": "HKD",
        //       "item": "BTC",
        //       "type": "offer",  <-- bid/offer
        //       "amount": {
        //         "currency": "BTC",
        //         "display": "10.00000000 BTC",
        //         "display_short": "10.00 BTC",
        //         "value": "10.00000000",
        //         "value_int": "1000000000"
        //       },
        //       "effective_amount": {
        //         "currency": "BTC",
        //         "display": "10.00000000 BTC",
        //         "display_short": "10.00 BTC",
        //         "value": "10.00000000",
        //         "value_int": "1000000000"
        //       },
        //       "price": {
        //         "currency": "HKD",
        //         "display": "412.34567 HKD",
        //         "display_short": "412.35 HKD",
        //         "value": "412.34567",
        //         "value_int": "41234567"
        //       },
        //       "status": "open",
        //       "date": 1393411075000,
        //       "priority": 1393411075000000,
        //       "actions": []
        //     }
        //
        let id = this.safeString (order, 'oid');
        let status = this.safeString (order, 'status');
        let timestamp = this.safeInteger (order, 'date');
        let marketId = this.safeString (order, 'item') + '/' + this.safeString (order, 'currency');
        market = this.safeValue (this.markets_by_id, marketId, market);
        let symbol = undefined;
        let remaining = undefined;
        let amount = undefined;
        let price = undefined;
        let filled = undefined;
        let cost = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        }
        let amount_info = this.safeValue (order, 'amount', []);
        let effective_info = this.safeValue (order, 'effective_amount', []);
        let price_info = this.safeValue (order, 'price', []);
        if (typeof amount_info !== 'undefined') {
            amount = this.safeFloat (amount_info, 'volume');
        }
        if (typeof effective_info !== 'undefined') {
            remaining = this.safeFloat (effective_info, 'value');
        }
        if (typeof price_info !== 'undefined') {
            price = this.safeFloat (price_info, 'value');
        }
        if (typeof amount !== 'undefined') {
            if (typeof remaining !== 'undefined') {
                filled = amount - remaining;
                cost = price * filled;
            }
        }
        let orderType = 'limit';
        let side = this.safeString (order, 'type');
        if (side === 'offer') {
            side = 'sell';
        } else {
            side = 'buy';
        }
        let fee = undefined;
        let trades = undefined;
        let lastTradeTimestamp = undefined;
        return {
            'info': order,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'type': orderType,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let market = this.market (symbol);
        let order = {
            'currency_pair': market['id'],
            'amount_int': parseInt (amount * 100000000), // 10^8
        };
        if (type === 'limit') {
            order['price_int'] = parseInt (price * market['multiplier']); // 10^5 or 10^8
        }
        order['type'] = (side === 'buy') ? 'bid' : 'ask';
        let result = await this.privatePostCurrencyPairMoneyOrderAdd (this.extend (order, params));
        return {
            'info': result,
            'id': result['data'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCurrencyPairMoneyOrderCancel ({ 'oid': id });
    }

    getAmountMultiplier (code) {
        const multipliers = {
            'BTC': 100000000,
            'LTC': 100000000,
            'STR': 100000000,
            'XRP': 100000000,
            'DOGE': 100000000,
        };
        const defaultValue = 100;
        return this.safeInteger (multipliers, code, defaultValue);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let multiplier = this.getAmountMultiplier (code);
        let request = {
            'currency': currency,
            'amount_int': parseInt (amount * multiplier),
            'address': address,
        };
        if (tag !== undefined) {
            request['destinationTag'] = tag;
        }
        let response = await this.privatePostMoneyCurrencySendSimple (this.extend (request, params));
        return {
            'info': response,
            'id': response['data']['transactionId'],
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'currency': currency['id'],
        };
        let response = await this.privatePostMoneyCurrencyAddress (this.extend (request, params));
        let result = response['data'];
        let address = this.safeString (result, 'addr');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'info': response,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + this.version + '/' + request;
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, query));
            let secret = this.base64ToBinary (this.secret);
            // eslint-disable-next-line quotes
            let auth = request + "\0" + body;
            let signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Rest-Key': this.apiKey,
                'Rest-Sign': this.decode (signature),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (response !== undefined)
            if ('result' in response)
                if (response['result'] === 'success')
                    return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
