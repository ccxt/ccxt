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
                'referral': 'https://www.coingi.com/?r=XTPPMC',
                'logo': 'https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg',
                'api': {
                    'www': 'https://coingi.com',
                    'current': 'https://api.coingi.com',
                    'user': 'https://api.coingi.com',
                },
                'www': 'https://coingi.com',
                'doc': 'https://coingi.docs.apiary.io',
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
        const response = await this.wwwGet (params);
        const parts = response.split ('do=currencyPairSelector-selectCurrencyPair" class="active">');
        const currencyParts = parts[1].split ('<div class="currency-pair-label">');
        const result = [];
        for (let i = 1; i < currencyParts.length; i++) {
            const currencyPart = currencyParts[i];
            const idParts = currencyPart.split ('</div>');
            let id = idParts[0];
            id = id.replace ('/', '-');
            id = id.toLowerCase ();
            const [ baseId, quoteId ] = id.split ('-');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': 8,
                'price': 8,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
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
        const lowercaseCurrencies = [];
        const currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            lowercaseCurrencies.push (currency.toLowerCase ());
        }
        const request = {
            'currencies': lowercaseCurrencies.join (','),
        };
        const response = await this.userPostBalance (this.extend (request, params));
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance['currency'], 'name');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = balance['available'];
            account['used'] = balance['blocked'] + balance['inOrders'] + balance['withdrawing'];
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = 512, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'depth': 32, // maximum number of depth range steps 1-32
            'askCount': limit, // maximum returned number of asks 1-512
            'bidCount': limit, // maximum returned number of bids 1-512
        };
        const orderbook = await this.currentGetOrderBookPairAskCountBidCountDepth (this.extend (request, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'baseAmount');
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume'),
            'quoteVolume': this.safeFloat (ticker, 'counterVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.currentGet24hourRollingAggregation (params);
        const result = {};
        for (let t = 0; t < response.length; t++) {
            const ticker = response[t];
            const base = ticker['currencyPair']['base'].toUpperCase ();
            const quote = ticker['currencyPair']['counter'].toUpperCase ();
            const symbol = base + '/' + quote;
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
        const tickers = await this.fetchTickers (undefined, params);
        if (symbol in tickers) {
            return tickers[symbol];
        }
        throw new ExchangeError (this.id + ' return did not contain ' + symbol);
    }

    parseTrade (trade, market = undefined) {
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        const timestamp = this.safeInteger (trade, 'timestamp');
        const id = this.safeString (trade, 'id');
        const marketId = this.safeString (trade, 'currencyPair');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': undefined, // type
            'order': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'maxCount': 128,
        };
        const response = await this.currentGetTransactionsPairMaxCount (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currencyPair': this.marketId (symbol),
            'volume': amount,
            'price': price,
            'orderType': (side === 'buy') ? 0 : 1,
        };
        const response = await this.userPostAddOrder (this.extend (request, params));
        return {
            'info': response,
            'id': response['result'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        return await this.userPostCancelOrder (this.extend (request, params));
    }

    sign (path, api = 'current', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api !== 'www') {
            url += '/' + api + '/' + this.implodeParams (path, params);
        }
        const query = this.omit (params, this.extractParams (path));
        if (api === 'current') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'user') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const request = this.extend ({
                'token': this.apiKey,
                'nonce': nonce,
            }, query);
            const auth = nonce.toString () + '$' + this.apiKey;
            request['signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
            body = this.json (request);
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'current', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if (typeof response !== 'string') {
            if ('errors' in response) {
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
    }
};
