"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, NotSupported } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class bithumb extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bithumb',
            'name': 'Bithumb',
            'countries': 'KR', // South Korea
            'rateLimit': 500,
            'hasCORS': true,
            'hasFetchTickers': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg',
                'api': {
                    'public': 'https://api.bithumb.com/public',
                    'private': 'https://api.bithumb.com',
                },
                'www': 'https://www.bithumb.com',
                'doc': 'https://www.bithumb.com/u1/US127',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker/{currency}',
                        'ticker/all',
                        'orderbook/{currency}',
                        'orderbook/all',
                        'recent_transactions/{currency}',
                        'recent_transactions/all',
                    ],
                },
                'private': {
                    'post': [
                        'info/account',
                        'info/balance',
                        'info/wallet_address',
                        'info/ticker',
                        'info/orders',
                        'info/user_transactions',
                        'trade/place',
                        'info/order_detail',
                        'trade/cancel',
                        'trade/btc_withdrawal',
                        'trade/krw_deposit',
                        'trade/krw_withdrawal',
                        'trade/market_buy',
                        'trade/market_sell',
                    ],
                },
            },
            'markets': {
                'BTC/KRW': { 'id': 'BTC', 'symbol': 'BTC/KRW', 'base': 'BTC', 'quote': 'KRW' },
                'ETH/KRW': { 'id': 'ETH', 'symbol': 'ETH/KRW', 'base': 'ETH', 'quote': 'KRW' },
                'LTC/KRW': { 'id': 'LTC', 'symbol': 'LTC/KRW', 'base': 'LTC', 'quote': 'KRW' },
                'ETC/KRW': { 'id': 'ETC', 'symbol': 'ETC/KRW', 'base': 'ETC', 'quote': 'KRW' },
                'XRP/KRW': { 'id': 'XRP', 'symbol': 'XRP/KRW', 'base': 'XRP', 'quote': 'KRW' },
                'BCH/KRW': { 'id': 'BCH', 'symbol': 'BCH/KRW', 'base': 'BCH', 'quote': 'KRW' },
                'XMR/KRW': { 'id': 'XMR', 'symbol': 'XMR/KRW', 'base': 'XMR', 'quote': 'KRW' },
                'ZEC/KRW': { 'id': 'ZEC', 'symbol': 'ZEC/KRW', 'base': 'ZEC', 'quote': 'KRW' },
                'DASH/KRW': { 'id': 'DASH', 'symbol': 'DASH/KRW', 'base': 'DASH', 'quote': 'KRW' },
                'QTUM/KRW': { 'id': 'QTUM', 'symbol': 'QTUM/KRW', 'base': 'QTUM', 'quote': 'KRW' },
            },
            'fees': {
                'trading': {
                    'maker': 0.15 / 100,
                    'taker': 0.15 / 100,
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostInfoBalance (this.extend ({
            'currency': 'ALL',
        }, params));
        let result = { 'info': response };
        let balances = response['data'];
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            let lowercase = currency.toLowerCase ();
            account['total'] = this.safeFloat (balances, 'total_' + lowercase);
            account['used'] = this.safeFloat (balances, 'in_use_' + lowercase);
            account['free'] = this.safeFloat (balances, 'available_' + lowercase);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetOrderbookCurrency (this.extend ({
            'count': 50, // max = 50
            'currency': market['base'],
        }, params));
        let orderbook = response['data'];
        let timestamp = parseInt (orderbook['timestamp']);
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = parseInt (ticker['date']);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'max_price'),
            'low': this.safeFloat (ticker, 'min_price'),
            'bid': this.safeFloat (ticker, 'buy_price'),
            'ask': this.safeFloat (ticker, 'sell_price'),
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'opening_price'),
            'close': this.safeFloat (ticker, 'closing_price'),
            'first': undefined,
            'last': this.safeFloat (ticker, 'last_trade'),
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'average_price'),
            'baseVolume': this.safeFloat (ticker, 'volume_1day'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        let response = await this.publicGetTickerAll (params);
        let result = {};
        let timestamp = response['data']['date'];
        let tickers = this.omit (response['data'], 'date');
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            ticker['date'] = timestamp;
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTickerCurrency (this.extend ({
            'currency': market['base'],
        }, params));
        return this.parseTicker (response['data'], market);
    }

    parseTrade (trade, market) {
        // a workaround for their bug in date format, hours are not 0-padded
        let [ transaction_date, transaction_time ] = trade['transaction_date'].split (' ');
        let transaction_time_short = transaction_time.length < 8;
        if (transaction_time_short)
            transaction_time = '0' + transaction_time;
        let timestamp = this.parse8601 (transaction_date + ' ' + transaction_time);
        let side = (trade['type'] == 'ask') ? 'sell' : 'buy';
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['units_traded']),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetRecentTransactionsCurrency (this.extend ({
            'currency': market['base'],
            'count': 100, // max = 100
        }, params));
        return this.parseTrades (response['data'], market);
    }

    createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        throw new NotSupported (this.id + ' private API not implemented yet');
        //     let prefix = '';
        //     if (type == 'market')
        //         prefix = 'market_';
        //     let order = {
        //         'pair': this.marketId (symbol),
        //         'quantity': amount,
        //         'price': price || 0,
        //         'type': prefix + side,
        //     };
        //     let response = await this.privatePostOrderCreate (this.extend (order, params));
        //     return {
        //         'info': response,
        //         'id': response['order_id'].toString (),
        //     };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let side = ('side' in params);
        if (!side)
            throw new ExchangeError (this.id + ' cancelOrder requires a side parameter (sell or buy)');
        side = (side == 'buy') ? 'purchase' : 'sales';
        let currency = ('currency' in params);
        if (!currency)
            throw new ExchangeError (this.id + ' cancelOrder requires a currency parameter');
        return await this.privatePostTradeCancel ({
            'order_id': id,
            'type': params['side'],
            'currency': params['currency'],
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'endpoint': endpoint,
            }, query));
            let nonce = this.nonce ().toString ();
            let auth = endpoint + "\0" + body + "\0" + nonce;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512');
            headers = {
                'Api-Key': this.apiKey,
                'Api-Sign': this.decode (this.stringToBase64 (this.encode (signature))),
                'Api-Nonce': nonce,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('status' in response) {
            if (response['status'] == '0000')
                return response;
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }
}
