'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bxinth extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bxinth',
            'name': 'BX.in.th',
            'countries': 'TH', // Thailand
            'rateLimit': 1500,
            'has': {
                'CORS': false,
                'fetchTickers': true,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766412-567b1eb4-5ed7-11e7-94a8-ff6a3884f6c5.jpg',
                'api': 'https://bx.in.th/api',
                'www': 'https://bx.in.th',
                'doc': 'https://bx.in.th/info/api',
            },
            'api': {
                'public': {
                    'get': [
                        '', // ticker
                        'options',
                        'optionbook',
                        'orderbook',
                        'pairing',
                        'trade',
                        'tradehistory',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'biller',
                        'billgroup',
                        'billpay',
                        'cancel',
                        'deposit',
                        'getorders',
                        'history',
                        'option-issue',
                        'option-bid',
                        'option-sell',
                        'option-myissue',
                        'option-mybid',
                        'option-myoptions',
                        'option-exercise',
                        'option-cancel',
                        'option-history',
                        'order',
                        'withdrawal',
                        'withdrawal-history',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.25 / 100,
                    'maker': 0.25 / 100,
                },
            },
            'commonCurrencies': {
                'DAS': 'DASH',
                'DOG': 'DOGE',
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetPairing ();
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let market = markets[keys[p]];
            let id = market['pairing_id'].toString ();
            let base = market['secondary_currency'];
            let quote = market['primary_currency'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostBalance ();
        let balance = response['balance'];
        let result = { 'info': balance };
        let currencies = Object.keys (balance);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let code = this.commonCurrencyCode (currency);
            let account = {
                'free': parseFloat (balance[currency]['available']),
                'used': 0.0,
                'total': parseFloat (balance[currency]['total']),
            };
            account['used'] = account['total'] - account['free'];
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderbook (this.extend ({
            'pairing': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last_price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['orderbook']['bids']['highbid']),
            'bidVolume': undefined,
            'ask': parseFloat (ticker['orderbook']['asks']['highbid']),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'change'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume_24hours'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGet (params);
        let result = {};
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let ticker = tickers[id];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let tickers = await this.publicGet (this.extend ({
            'pairing': market['id'],
        }, params));
        let id = market['id'].toString ();
        let ticker = tickers[id];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        let timestamp = this.parse8601 (trade['trade_date']);
        return {
            'id': trade['trade_id'],
            'info': trade,
            'order': trade['order_id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['trade_type'],
            'price': this.safeFloat (trade, 'rate'),
            'amount': this.safeFloat (trade, 'amount'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrade (this.extend ({
            'pairing': market['id'],
        }, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrder (this.extend ({
            'pairing': this.marketId (symbol),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params));
        return {
            'info': response,
            'id': response['order_id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let pairing = undefined; // TODO fixme
        return await this.privatePostCancel ({
            'order_id': id,
            'pairing': pairing,
        });
    }

    async parseOrder (order, market = undefined) {
        let side = this.safeString (order, 'order_type');
        let symbol = undefined;
        if (typeof market === 'undefined') {
            let marketId = this.safeString (order, 'pairing_id');
            if (typeof marketId !== 'undefined')
                if (marketId in this.markets_by_id)
                    market = this.markets_by_id[marketId];
        }
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let timestamp = this.parse8601 (order['date']);
        let price = this.safeFloat (order, 'rate');
        let amount = this.safeFloat (order, 'amount');
        return {
            'info': order,
            'id': order['order_id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['pairing'] = market['id'];
        }
        let response = this.privatePostGetorders (this.extend (request, params));
        let orders = this.parseOrders (response['orders'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/';
        if (path)
            url += path + '/';
        if (Object.keys (params).length)
            url += '?' + this.urlencode (params);
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let auth = this.apiKey + nonce.toString () + this.secret;
            let signature = this.hash (this.encode (auth), 'sha256');
            body = this.urlencode (this.extend ({
                'key': this.apiKey,
                'nonce': nonce,
                'signature': signature,
                // twofa: this.twofa,
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (api === 'public')
            return response;
        if ('success' in response)
            if (response['success'])
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
