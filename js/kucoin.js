"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidNonce, InvalidOrder, AuthenticationError } = require ('./base/errors');

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
            'userAgent': this.userAgents['chrome'],
            // obsolete metainfo interface
            'hasFetchTickers': true,
            'hasFetchOHLCV': true,
            'hasFetchOrder': false,
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
                'fetchOrder': false,
                'fetchOrders': true,
                'fetchClosedOrders': true,
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
                        'order/active-map',
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
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'KCS': 2.0,
                        'BTC': 0.0005,
                        'USDT': 10.0,
                        'ETH': 0.01,
                        'LTC': 0.001,
                        'NEO': 0.0,
                        'GAS': 0.0,
                        'KNC': 0.5,
                        'BTM': 5.0,
                        'QTUM': 0.1,
                        'EOS': 0.5,
                        'CVC': 3.0,
                        'OMG': 0.1,
                        'PAY': 0.5,
                        'SNT': 20.0,
                        'BHC': 1.0,
                        'HSR': 0.01,
                        'WTC': 0.1,
                        'VEN': 2.0,
                        'MTH': 10.0,
                        'RPX': 1.0,
                        'REQ': 20.0,
                        'EVX': 0.5,
                        'MOD': 0.5,
                        'NEBL': 0.1,
                        'DGB': 0.5,
                        'CAG': 2.0,
                        'CFD': 0.5,
                        'RDN': 0.5,
                        'UKG': 5.0,
                        'BCPT': 5.0,
                        'PPT': 0.1,
                        'BCH': 0.0005,
                        'STX': 2.0,
                        'NULS': 1.0,
                        'GVT': 0.1,
                        'HST': 2.0,
                        'PURA': 0.5,
                        'SUB': 2.0,
                        'QSP': 5.0,
                        'POWR': 1.0,
                        'FLIXX': 10.0,
                        'LEND': 20.0,
                        'AMB': 3.0,
                        'RHOC': 2.0,
                        'R': 2.0,
                        'DENT': 50.0,
                        'DRGN': 1.0,
                        'ACT': 0.1,
                    },
                    'deposit': 0.00,
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
            let precision = currency['tradePrecision'];
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
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currency['withdrawMinAmount'],
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetAccountBalance (this.extend ({
            'limit': 20, // default 12, max 20
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
            let used = parseFloat (balance['freezeBalance']);
            let free = parseFloat (balance['balance']);
            let total = this.sum (free, used);
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
        let price = this.safeValue (order, 'price');
        if (typeof price === 'undefined')
            price = this.safeValue (order, 'dealPrice');
        let amount = this.safeValue (order, 'amount');
        let filled = this.safeValue (order, 'dealAmount', 0);
        let remaining = this.safeValue (order, 'pendingAmount');
        if (typeof amount === 'undefined')
            if (typeof filled !== 'undefined')
                if (typeof remaining !== 'undefined')
                    amount = this.sum (filled, remaining);
        let side = order['direction'].toLowerCase ();
        let fee = undefined;
        if ('fee' in order) {
            fee = {
                'cost': this.safeFloat (order, 'fee'),
                'rate': this.safeFloat (order, 'feeRate'),
            };
            if (market)
                fee['currency'] = market['base'];
        }
        let status = this.safeValue (order, 'status');
        let result = {
            'info': order,
            'id': this.safeString (order, 'oid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * filled,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        let response = await this.privateGetOrderActiveMap (this.extend (request, params));
        let orders = this.arrayConcat (response['data']['SELL'], response['data']['BUY']);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            result.push (this.extend (orders[i], { 'status': 'open' }));
        }
        return this.parseOrders (result, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let request = {};
        await this.loadMarkets ();
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since) {
            request['since'] = since;
        }
        if (limit) {
            request['limit'] = limit;
        }
        let response = await this.privateGetOrderDealt (this.extend (request, params));
        let orders = response['data']['datas'];
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            result.push (this.extend (orders[i], { 'status': 'closed' }));
        }
        return this.parseOrders (result, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type != 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let base = market['base'];
        let order = {
            'symbol': market['id'],
            'type': side.toUpperCase (),
            'price': this.priceToPrecision (symbol, price),
            'amount': this.truncate (amount, this.currencies[base]['precision']),
        };
        let response = await this.privatePostOrder (this.extend (order, params));
        return {
            'info': response,
            'id': this.safeString (response['data'], 'orderOid'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' cancelOrder requires symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'orderOid': id,
        };
        if ('type' in params) {
            request['type'] = params['type'].toUpperCase ();
        } else {
            throw new ExchangeError (this.id + ' cancelOrder requires type (BUY or SELL) param');
        }
        let response = await this.privatePostCancelOrder (this.extend (request, params));
        return response;
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
        if (trade[1] === 'BUY') {
            side = 'buy';
        } else if (trade[1] === 'SELL') {
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

    parseTradingViewOHLCVs (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        let result = [];
        for (let i = 0; i < ohlcvs['t'].length; i++) {
            result.push ([
                ohlcvs['t'][i],
                ohlcvs['o'][i],
                ohlcvs['h'][i],
                ohlcvs['l'][i],
                ohlcvs['c'][i],
                ohlcvs['v'][i],
            ]);
        }
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let end = this.seconds ();
        let resolution = this.timeframes[timeframe];
        // convert 'resolution' to minutes in order to calculate 'from' later
        let minutes = resolution;
        if (minutes == 'D') {
            if (!limit)
                limit = 30; // 30 days, 1 month
            minutes = 1440;
        } else if (minutes == 'W') {
            if (!limit)
                limit = 52; // 52 weeks, 1 year
            minutes = 10080;
        } else if (!limit) {
            limit = 1440;
            minutes = 1440;
        }
        let start = end - minutes * 60 * limit;
        if (since) {
            start = parseInt (since / 1000);
            end = this.sum (start, minutes * 60 * limit);
        }
        let request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
            'resolution': resolution,
            'from': start,
            'to': end,
        };
        let response = await this.publicGetOpenChartHistory (this.extend (request, params));
        return this.parseTradingViewOHLCVs (response, market, timeframe, since, limit);
    }

    async withdraw (code, amount, address, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostAccountCoinWithdrawApply (this.extend ({
            'coin': currency['id'],
            'amount': amount,
            'address': address,
        }, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'] + endpoint;
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
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
                url += '?' + queryString;
                if (method !== 'GET') {
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

    throwExceptionOnError (response) {
        if ('success' in response) {
            if (!response['success']) {
                if ('code' in response) {
                    let message = this.safeString (response, 'msg');
                    if (response['code'] === 'UNAUTH') {
                        if (message === 'Invalid nonce')
                            throw new InvalidNonce (this.id + ' ' + message);
                        throw new AuthenticationError (this.id + ' ' + this.json (response));
                    } else if (response['code'] === 'ERROR') {
                        if (message.indexOf ('precision of amount') >= 0)
                            throw new InvalidOrder (this.id + ' ' + message);
                        if (message.indexOf ('Min amount each order') >= 0)
                            throw new InvalidOrder (this.id + ' ' + message);
                    }
                }
            }
        }
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (body && (body[0] === '{')) {
            let response = JSON.parse (body);
            this.throwExceptionOnError (response);
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        this.throwExceptionOnError (response);
        return response;
    }
}
