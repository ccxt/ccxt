'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class btcchina extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcchina',
            'name': 'BTCChina',
            'countries': [ 'CN' ],
            'rateLimit': 1500,
            'version': 'v1',
            'has': {
                'CORS': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766368-465b3286-5ed6-11e7-9a11-0f6467e1d82b.jpg',
                'api': {
                    'plus': 'https://plus-api.btcchina.com/market',
                    'public': 'https://data.btcchina.com/data',
                    'private': 'https://api.btcchina.com/api_trade_v1.php',
                },
                'www': 'https://www.btcchina.com',
                'doc': 'https://www.btcchina.com/apidocs',
            },
            'api': {
                'plus': {
                    'get': [
                        'orderbook',
                        'ticker',
                        'trade',
                    ],
                },
                'public': {
                    'get': [
                        'historydata',
                        'orderbook',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'BuyIcebergOrder',
                        'BuyOrder',
                        'BuyOrder2',
                        'BuyStopOrder',
                        'CancelIcebergOrder',
                        'CancelOrder',
                        'CancelStopOrder',
                        'GetAccountInfo',
                        'getArchivedOrder',
                        'getArchivedOrders',
                        'GetDeposits',
                        'GetIcebergOrder',
                        'GetIcebergOrders',
                        'GetMarketDepth',
                        'GetMarketDepth2',
                        'GetOrder',
                        'GetOrders',
                        'GetStopOrder',
                        'GetStopOrders',
                        'GetTransactions',
                        'GetWithdrawal',
                        'GetWithdrawals',
                        'RequestWithdrawal',
                        'SellIcebergOrder',
                        'SellOrder',
                        'SellOrder2',
                        'SellStopOrder',
                    ],
                },
            },
            'markets': {
                'BTC/CNY': { 'id': 'btccny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', 'api': 'public', 'plus': false },
                'LTC/CNY': { 'id': 'ltccny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY', 'api': 'public', 'plus': false },
                'LTC/BTC': { 'id': 'ltcbtc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'api': 'public', 'plus': false },
                'BCH/CNY': { 'id': 'bcccny', 'symbol': 'BCH/CNY', 'base': 'BCH', 'quote': 'CNY', 'api': 'plus', 'plus': true },
                'ETH/CNY': { 'id': 'ethcny', 'symbol': 'ETH/CNY', 'base': 'ETH', 'quote': 'CNY', 'api': 'plus', 'plus': true },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const request = {
            'market': 'all',
        };
        const markets = await this.publicGetTicker (this.extend (request, params));
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = markets[key];
            const parts = key.split ('_');
            const id = parts[1];
            const baseId = id.slice (0, 3);
            const quoteId = id.slice (3, 6);
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetAccountInfo (params);
        const balances = this.safeValue (response, 'result');
        const result = { 'info': balances };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const account = this.account ();
            const currencyId = currency['id'];
            if (currencyId in balances['balance']) {
                account['total'] = parseFloat (balances['balance'][currencyId]['amount']);
            }
            if (currencyId in balances['frozen']) {
                account['used'] = parseFloat (balances['frozen'][currencyId]['amount']);
            }
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    createMarketRequest (market) {
        const request = {};
        const field = (market['plus']) ? 'symbol' : 'market';
        request[field] = market['id'];
        return request;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['api'] + 'GetOrderbook';
        const request = this.createMarketRequest (market);
        const response = await this[method] (this.extend (request, params));
        const timestamp = this.safeTimestamp (response, 'date');
        return this.parseOrderBook (response, timestamp);
    }

    parseTicker (ticker, market) {
        const timestamp = this.safeTimestamp (ticker, 'date');
        const last = this.safeFloat (ticker, 'last');
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'ask': this.safeFloat (ticker, 'sell'),
            'vwap': this.safeFloat (ticker, 'vwap'),
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTickerPlus (ticker, market) {
        const timestamp = this.safeInteger (ticker, 'Timestamp');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'High'),
            'low': this.safeFloat (ticker, 'Low'),
            'bid': this.safeFloat (ticker, 'BidPrice'),
            'ask': this.safeFloat (ticker, 'AskPrice'),
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'Open'),
            'last': this.safeFloat (ticker, 'Last'),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'Volume24H'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['api'] + 'GetTicker';
        const request = this.createMarketRequest (market);
        const response = await this[method] (this.extend (request, params));
        const ticker = this.safeValue (response, 'ticker');
        if (market['plus']) {
            return this.parseTickerPlus (ticker, market);
        }
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        const timestamp = this.safeTimestamp (trade, 'date');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        const id = this.safeString (trade, 'tid');
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
        };
    }

    parseTradePlus (trade, market) {
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        const side = this.safeStringLower (trade, 'side');
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
        };
    }

    parseTradesPlus (trades, market = undefined) {
        const result = [];
        for (let i = 0; i < trades.length; i++) {
            result.push (this.parseTradePlus (trades[i], market));
        }
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = market['api'] + 'GetTrade';
        const request = this.createMarketRequest (market);
        if (market['plus']) {
            const now = this.milliseconds ();
            request['start_time'] = now - 86400000;
            request['end_time'] = now;
        } else {
            method += 's'; // trades vs trade
        }
        const response = await this[method] (this.extend (request, params));
        if (market['plus']) {
            return this.parseTradesPlus (response['trades'], market);
        }
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = 'privatePost' + this.capitalize (side) + 'Order2';
        const request = {};
        const id = market['id'].toUpperCase ();
        if (type === 'market') {
            request['params'] = [ undefined, amount, id ];
        } else {
            request['params'] = [ price, amount, id ];
        }
        const response = await this[method] (this.extend (request, params));
        const orderId = this.safeString (response, 'id');
        return {
            'info': response,
            'id': orderId,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = params['market']; // TODO fixme
        const request = {
            'params': [ id, market ],
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    nonce () {
        return this.microseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let p = [];
            if ('params' in params) {
                p = params['params'];
            }
            const nonce = this.nonce ();
            const request = {
                'method': path,
                'id': nonce,
                'params': p,
            };
            p = p.join (',');
            body = this.json (request);
            const query = [
                'tonce=' + nonce,
                'accesskey=' + this.apiKey,
                'requestmethod=' + method.toLowerCase (),
                'id=' + nonce,
                'method=' + path,
                'params=' + p,
            ].join ('&');
            const signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha1');
            const auth = this.encode (this.apiKey + ':' + signature);
            headers = {
                'Authorization': 'Basic ' + this.stringToBase64 (auth),
                'Json-Rpc-Tonce': nonce,
            };
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
