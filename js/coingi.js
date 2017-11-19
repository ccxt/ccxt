"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class coingi extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coingi',
            'name': 'Coingi',
            'rateLimit': 1000,
            'countries': [ 'PA', 'BG', 'CN', 'US' ], // Panama, Bulgaria, China, US
            'hasFetchTickers': true,
            'hasCORS': false,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg',
                'api': 'https://api.coingi.com',
                'www': 'https://coingi.com',
                'doc': 'http://docs.coingi.apiary.io/',
            },
            'api': {
                'current': {
                    'get': [
                        'order-book/{pair}/{askCount}/{bidCount}/{depth}',
                        'transactions/{pair}/{maxCount}',
                        '24hour-rolling-aggregation',
                    ],
                },
                'user': {
                    'post': [
                        'balance',
                        'add-order',
                        'cancel-order',
                        'orders',
                        'transactions',
                        'create-crypto-withdrawal',
                    ],
                },
            },
            // todo add fetchMarkets
            'markets': {
                'LTC/BTC': { 'id': 'ltc-btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
                'PPC/BTC': { 'id': 'ppc-btc', 'symbol': 'PPC/BTC', 'base': 'PPC', 'quote': 'BTC' },
                'DOGE/BTC': { 'id': 'doge-btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC' },
                'VTC/BTC': { 'id': 'vtc-btc', 'symbol': 'VTC/BTC', 'base': 'VTC', 'quote': 'BTC' },
                'FTC/BTC': { 'id': 'ftc-btc', 'symbol': 'FTC/BTC', 'base': 'FTC', 'quote': 'BTC' },
                'NMC/BTC': { 'id': 'nmc-btc', 'symbol': 'NMC/BTC', 'base': 'NMC', 'quote': 'BTC' },
                'DASH/BTC': { 'id': 'dash-btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC' },
            },
            'fees': {
                'trading': {
                    'taker': 0.2 / 100,
                    'maker': 0.2 / 100,
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let currencies = [];
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c].toLowerCase ();
            currencies.push (currency);
        }
        let balances = await this.userPostBalance ({
            'currencies': currencies.join (',')
        });
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency']['name'];
            currency = currency.toUpperCase ();
            let account = {
                'free': balance['available'],
                'used': balance['blocked'] + balance['inOrders'] + balance['withdrawing'],
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.currentGetOrderBookPairAskCountBidCountDepth (this.extend ({
            'pair': market['id'],
            'askCount': 512, // maximum returned number of asks 1-512
            'bidCount': 512, // maximum returned number of bids 1-512
            'depth': 32, // maximum number of depth range steps 1-32
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'baseAmount');
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
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': ticker['highestBid'],
            'ask': ticker['lowestAsk'],
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': ticker['baseVolume'],
            'quoteVolume': ticker['counterVolume'],
            'info': ticker,
        };
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.currentGet24hourRollingAggregation (params);
        let result = {};
        for (let t = 0; t < response.length; t++) {
            let ticker = response[t];
            let base = ticker['currencyPair']['base'].toUpperCase ();
            let quote = ticker['currencyPair']['counter'].toUpperCase ();
            let symbol = base + '/' + quote;
            let market = this.markets[symbol];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.fetchTickers (undefined, params);
        if (symbol in tickers)
            return tickers[symbol];
        throw new ExchangeError (this.id + ' return did not contain ' + symbol);
    }

    parseTrade (trade, market = undefined) {
        if (!market)
            market = this.markets_by_id[trade['currencyPair']];
        return {
            'id': trade['id'],
            'info': trade,
            'timestamp': trade['timestamp'],
            'datetime': this.iso8601 (trade['timestamp']),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined, // type
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.currentGetTransactionsPairMaxCount (this.extend ({
            'pair': market['id'],
            'maxCount': 128,
        }, params));
        return this.parseTrades (response, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'currencyPair': this.marketId (symbol),
            'volume': amount,
            'price': price,
            'orderType': (side == 'buy') ? 0 : 1,
        };
        let response = await this.userPostAddOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['result'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.userPostCancelOrder ({ 'orderId': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + api + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'current') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let request = this.extend ({
                'token': this.apiKey,
                'nonce': nonce,
            }, query);
            let auth = nonce.toString () + '$' + this.apiKey;
            request['signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
            body = this.json (request);
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('errors' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
}
