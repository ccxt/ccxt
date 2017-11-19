"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class bxinth extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bxinth',
            'name': 'BX.in.th',
            'countries': 'TH', // Thailand
            'rateLimit': 1500,
            'hasCORS': false,
            'hasFetchTickers': true,
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

    commonCurrencyCode (currency) {
        // why would they use three letters instead of four for currency codes
        if (currency == 'DAS')
            return 'DASH';
        if (currency == 'DOG')
            return 'DOGE';
        return currency;
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

    async fetchOrderBook (symbol, params = {}) {
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
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['orderbook']['bids']['highbid']),
            'ask': parseFloat (ticker['orderbook']['asks']['highbid']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last_price']),
            'change': parseFloat (ticker['change']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume_24hours']),
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
            'price': parseFloat (trade['rate']),
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrade (this.extend ({
            'pairing': market['id'],
        }, params));
        return this.parseTrades (response['trades'], market);
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/';
        if (path)
            url += path + '/';
        if (Object.keys (params).length)
            url += '?' + this.urlencode (params);
        if (api == 'private') {
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
        if (api == 'public')
            return response;
        if ('success' in response)
            if (response['success'])
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
}
