"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, InvalidNonce, AuthenticationError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class kucoin extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kucoin',
            'name': 'Kucoin',
            'countries': 'HK', // Hong Kong
            'version': 'v1',
            'rateLimit': 2000,
            'hasCORS': false,
            // obsolete metainfo interface
            'hasFetchTickers': true,
            'hasFetchOHLCV': false, // see the method implementation below
            'hasFetchOrder': true,
            'hasFetchOrders': true,
            'hasFetchClosedOrders': true,
            'hasFetchOpenOrders': true,
            'hasFetchMyTrades': false,
            'hasFetchCurrencies': true,
            'hasWithdraw': true,
            // new metainfo interface
            'has': {
                'fetchTickers': true,
                'fetchOHLCV': true, // see the method implementation below
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchClosedOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchMyTrades': false,
                'fetchCurrencies': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '8h': '480',
                '1d': 'D',
                '1w': 'W',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/33795655-b3c46e48-dcf6-11e7-8abe-dc4588ba7901.jpg',
                'api': 'https://api.kucoin.com',
                'www': 'https://kucoin.com',
                'doc': 'https://kucoinapidocs.docs.apiary.io',
                'fees': 'https://news.kucoin.com/en/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'open/chart/config',
                        'open/chart/history',
                        'open/chart/symbol',
                        'open/currencies',
                        'open/deal-orders',
                        'open/kline',
                        'open/lang-list',
                        'open/orders',
                        'open/orders-buy',
                        'open/orders-sell',
                        'open/tick',
                        'market/open/coin-info',
                        'market/open/coins',
                        'market/open/coins-trending',
                        'market/open/symbols',
                    ],
                },
                'private': {
                    'get': [
                        'account/balance',
                        'account/{coin}/wallet/address',
                        'account/{coin}/wallet/records',
                        'account/{coin}/balance',
                        'account/promotion/info',
                        'account/promotion/sum',
                        'deal-orders',
                        'order/active',
                        'order/dealt',
                        'referrer/descendant/count',
                        'user/info',
                    ],
                    'post': [
                        'account/{coin}/withdraw/apply',
                        'account/{coin}/withdraw/cancel',
                        'cancel-order',
                        'order',
                        'user/change-lang',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0010,
                    'taker': 0.0010,
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetMarketOpenSymbols ();
        let markets = response['data'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['symbol'];
            let base = market['coinType'];
            let quote = market['coinTypePair'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let active = market['trading'];
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'info': market,
                'lot': Math.pow (10, -precision['amount']),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            }));
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetMarketOpenCoins (params);
        let currencies = response['data'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['coin'];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            let code = this.commonCurrencyCode (id);
            let precision = {
                'amount': currency['tradePrecision'],
                'price': currency['tradePrecision'],
            };
            let deposit = currency['enableDeposit'];
            let withdraw = currency['enableWithdraw'];
            let active = (deposit && withdraw);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'status': 'ok',
                'fee': currency['withdrawFeeRate'], // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': Math.pow (10, precision['amount']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': Math.pow (10, precision['price']),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currency['withdrawMinAmount'],
                        'max': Math.pow (10, precision['amount']),
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetAccountBalance (this.extend ({
            'limit': 12,
            'page': 1,
        }, params));
        let balances = response['data'];
        let result = { 'info': balances };
        let indexed = this.indexBy (balances, 'coinType');
        let keys = Object.keys (indexed);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let currency = this.commonCurrencyCode (id);
            let account = this.account ();
            let balance = indexed[id];
            let total = parseFloat (balance['balance']);
            let used = parseFloat(balance['freezeBalance']);
            let free = total - used;
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetOpenOrders (this.extend ({
            'symbol': market['id'],
        }, params));
        let orderbook = response['data'];
        return this.parseOrderBook (orderbook, undefined, 'BUY', 'SELL');
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            symbol = order['coinType'] + '/' + order['coinTypePair'];
        }
        let timestamp = order['createdAt'];
        let price = parseFloat (order['price']);
        let amount = parseFloat (order['pendingAmount']);
        let filled = parseFloat (order['dealAmount']);
        let remaining = Math.max (amount - filled, 0.0);
        let result = {
            'info': order,
            'id': order['oid'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': order['type'].toLowerCase (),
            'side': order['direction'].toLowerCase (),
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'filled': filled,
            'remaining': remaining,
            'status': undefined,
            'fee': undefined,
        };
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id']
        };
        let response = await this.privateGetOrderActive (this.extend (request, params));
        return this.parseOrders (response['data']['SELL'].concat(response['data']['BUY']), market, since, limit);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['datetime'];
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            symbol = ticker['coinType'] + '/' + ticker['coinTypePair'];
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'ask': this.safeFloat (ticker, 'sell'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'lastDealPrice'),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'volValue'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        let response = await this.publicGetMarketOpenSymbols (params);
        let tickers = response['data'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = this.parseTicker (tickers[t]);
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetOpenTick (this.extend ({
            'symbol': market['id'],
        }, params));
        let ticker = response['data'];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade[0];
        let side = undefined;
        if (trade[1] == 'BUY') {
            side = 'buy';
        } else if (trade[1] == 'SELL') {
            side = 'sell';
        }
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': 'limit',
            'side': side,
            'price': trade[2],
            'amount': trade[3],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetOpenDealOrders (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        let timestamp = this.parse8601 (ohlcv['T']);
        return [
            timestamp,
            ohlcv['O'],
            ohlcv['H'],
            ohlcv['L'],
            ohlcv['C'],
            ohlcv['V'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let to = this.seconds ();
        let request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
            'from': to - 86400,
            'to': to,
        };
        if (since) {
            request['from'] = parseInt (since / 1000);
        }
        // limit is not documented in api call, and not respected
        if (limit) {
            request['limit'] = limit;
        }
        let response = await this.publicGetOpenChartHistory (this.extend (request, params));
        // we need buildOHLCV
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'] + endpoint;
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            // their nonce is always a calibrated synched milliseconds-timestamp
            let nonce = this.milliseconds ();
            let queryString = '';
            nonce = nonce.toString ();
            if (Object.keys (query).length) {
                queryString = this.rawencode (this.keysort (query));
                if (method == 'GET') {
                    url += '?' + queryString;
                } else {
                    body = queryString;
                }
            }
            let auth = endpoint + '/' + nonce + '/' + queryString;
            let payload = this.stringToBase64 (this.encode (auth));
            // payload should be "encoded" as returned from stringToBase64
            let signature = this.hmac (payload, this.encode (this.secret), 'sha256');
            headers = {
                'KC-API-KEY': this.apiKey,
                'KC-API-NONCE': nonce,
                'KC-API-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code >= 400) {
            if (body[0] == "{") {
                let response = JSON.parse (body);
                if ('success' in response) {
                    if (!response['success']) {
                        if ('code' in response) {
                            if (response['code'] == 'UNAUTH') {
                                if (response['msg'] == 'Invalid nonce') {
                                    throw new InvalidNonce (this.id + ' ' + this.json (response));
                                }
                                throw new AuthenticationError (this.id + ' ' + this.json (response));
                            }
                        }
                        throw new ExchangeError (this.id + ' ' + this.json (response));
                    }
                }
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        return response;
    }
}
