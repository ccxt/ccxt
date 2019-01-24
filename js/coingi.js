'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coingi extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coingi',
            'name': 'Coingi',
            'rateLimit': 1000,
            'countries': [ 'PA', 'BG', 'CN', 'US' ], // Panama, Bulgaria, China, US
            'has': {
                'CORS': false,
                'fetchTickers': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg',
                'api': {
                    'www': 'https://coingi.com',
                    'current': 'https://api.coingi.com',
                    'user': 'https://api.coingi.com',
                },
                'www': 'https://coingi.com',
                'doc': 'http://docs.coingi.apiary.io/',
            },
            'api': {
                'www': {
                    'get': [
                        '',
                    ],
                },
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
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.2 / 100,
                    'maker': 0.2 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.001,
                        'LTC': 0.01,
                        'DOGE': 2,
                        'PPC': 0.02,
                        'VTC': 0.2,
                        'NMC': 2,
                        'DASH': 0.002,
                        'USD': 10,
                        'EUR': 10,
                    },
                    'deposit': {
                        'BTC': 0,
                        'LTC': 0,
                        'DOGE': 0,
                        'PPC': 0,
                        'VTC': 0,
                        'NMC': 0,
                        'DASH': 0,
                        'USD': 5,
                        'EUR': 1,
                    },
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        let response = await this.wwwGet ();
        let parts = response.split ('do=currencyPairSelector-selectCurrencyPair" class="active">');
        let currencyParts = parts[1].split ('<div class="currency-pair-label">');
        let result = [];
        for (let i = 1; i < currencyParts.length; i++) {
            let currencyPart = currencyParts[i];
            let idParts = currencyPart.split ('</div>');
            let id = idParts[0];
            let symbol = id;
            id = id.replace ('/', '-');
            id = id.toLowerCase ();
            let [ base, quote ] = symbol.split ('/');
            let precision = {
                'amount': 8,
                'price': 8,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': id,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': Math.pow (10, precision['amount']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let lowercaseCurrencies = [];
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            lowercaseCurrencies.push (currency.toLowerCase ());
        }
        let balances = await this.userPostBalance ({
            'currencies': lowercaseCurrencies.join (','),
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

    async fetchOrderBook (symbol, limit = 512, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.currentGetOrderBookPairAskCountBidCountDepth (this.extend ({
            'pair': market['id'],
            'depth': 32, // maximum number of depth range steps 1-32
            'askCount': limit, // maximum returned number of asks 1-512
            'bidCount': limit, // maximum returned number of bids 1-512
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
            'bidVolume': undefined,
            'ask': ticker['lowestAsk'],
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': ticker['baseVolume'],
            'quoteVolume': ticker['counterVolume'],
            'info': ticker,
        };
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
            let market = undefined;
            if (symbol in this.markets) {
                market = this.markets[symbol];
            }
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
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'currencyPair': this.marketId (symbol),
            'volume': amount,
            'price': price,
            'orderType': (side === 'buy') ? 0 : 1,
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

    sign (path, api = 'current', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api !== 'www') {
            url += '/' + api + '/' + this.implodeParams (path, params);
        }
        let query = this.omit (params, this.extractParams (path));
        if (api === 'current') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else if (api === 'user') {
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

    async request (path, api = 'current', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (typeof response !== 'string') {
            if ('errors' in response)
                throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }
};
