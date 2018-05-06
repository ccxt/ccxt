'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

// ---------------------------------------------------------------------------

module.exports = class vaultoro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'vaultoro',
            'name': 'Vaultoro',
            'countries': 'CH',
            'rateLimit': 1000,
            'version': '1',
            'has': {
                'CORS': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766880-f205e870-5ee9-11e7-8fe2-0d5b15880752.jpg',
                'api': 'https://api.vaultoro.com',
                'www': 'https://www.vaultoro.com',
                'doc': 'https://api.vaultoro.com',
            },
            'commonCurrencies': {
                'GLD': 'Gold',
            },
            'api': {
                'public': {
                    'get': [
                        'bidandask',
                        'buyorders',
                        'latest',
                        'latesttrades',
                        'markets',
                        'orderbook',
                        'sellorders',
                        'transactions/day',
                        'transactions/hour',
                        'transactions/month',
                    ],
                },
                'private': {
                    'get': [
                        'balance',
                        'mytrades',
                        'orders',
                    ],
                    'post': [
                        'buy/{symbol}/{type}',
                        'cancel/{id}',
                        'sell/{symbol}/{type}',
                        'withdraw',
                    ],
                },
            },
        });
    }

    async fetchMarkets () {
        let result = [];
        let markets = await this.publicGetMarkets ();
        let market = markets['data'];
        let baseId = market['BaseCurrency'];
        let quoteId = market['MarketCurrency'];
        let base = this.commonCurrencyCode (baseId);
        let quote = this.commonCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        let id = market['MarketName'];
        result.push ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
        });
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalance ();
        let balances = response['data'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currencyId = balance['currency_code'].toUpperCase ();
            let code = currencyId;
            if (currencyId in this.currencies_by_id[currencyId])
                code = this.currencies_by_id[currencyId]['code'];
            let free = balance['cash'];
            let used = balance['reserved'];
            let total = this.sum (free, used);
            let account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetOrderbook (params);
        let orderbook = {
            'bids': response['data'][0]['b'],
            'asks': response['data'][1]['s'],
        };
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'Gold_Price', 'Gold_Amount');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let quote = await this.publicGetBidandask (params);
        let bidsLength = quote['bids'].length;
        let bid = quote['bids'][bidsLength - 1];
        let ask = quote['asks'][0];
        let response = await this.publicGetMarkets (params);
        let ticker = response['data'];
        let timestamp = this.milliseconds ();
        let last = parseFloat (ticker['LastPrice']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['24hHigh']),
            'low': parseFloat (ticker['24hLow']),
            'bid': bid[0],
            'bidVolume': undefined,
            'ask': ask[0],
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['24hVolume']),
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        let timestamp = this.parse8601 (trade['Time']);
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'price': trade['Gold_Price'],
            'amount': trade['Gold_Amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTransactionsDay (params);
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost' + this.capitalize (side) + 'SymbolType';
        let response = await this[method] (this.extend ({
            'symbol': market['quoteId'].toLowerCase (),
            'type': type,
            'gld': amount,
            'price': price || 1,
        }, params));
        return {
            'info': response,
            'id': response['data']['Order_ID'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelId (this.extend ({
            'id': id,
        }, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/';
        if (api === 'public') {
            url += path;
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            url += this.version + '/' + this.implodeParams (path, params);
            let query = this.extend ({
                'nonce': nonce,
                'apikey': this.apiKey,
            }, this.omit (params, this.extractParams (path)));
            url += '?' + this.urlencode (query);
            headers = {
                'Content-Type': 'application/json',
                'X-Signature': this.hmac (this.encode (url), this.encode (this.secret)),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
