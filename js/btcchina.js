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

    async fetchMarkets () {
        let markets = await this.publicGetTicker ({
            'market': 'all',
        });
        let result = [];
        let keys = Object.keys (markets);
        for (let p = 0; p < keys.length; p++) {
            let key = keys[p];
            let market = markets[key];
            let parts = key.split ('_');
            let id = parts[1];
            let base = id.slice (0, 3);
            let quote = id.slice (3, 6);
            base = base.toUpperCase ();
            quote = quote.toUpperCase ();
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
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['result'];
        let result = { 'info': balances };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            if (lowercase in balances['balance'])
                account['total'] = parseFloat (balances['balance'][lowercase]['amount']);
            if (lowercase in balances['frozen'])
                account['used'] = parseFloat (balances['frozen'][lowercase]['amount']);
            account['free'] = account['total'] - account['used'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    createMarketRequest (market) {
        let request = {};
        let field = (market['plus']) ? 'symbol' : 'market';
        request[field] = market['id'];
        return request;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = market['api'] + 'GetOrderbook';
        let request = this.createMarketRequest (market);
        let orderbook = await this[method] (this.extend (request, params));
        let timestamp = orderbook['date'] * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    }

    parseTicker (ticker, market) {
        let timestamp = ticker['date'] * 1000;
        let last = this.safeFloat (ticker, 'last');
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
        let timestamp = ticker['Timestamp'];
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
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
        let market = this.market (symbol);
        let method = market['api'] + 'GetTicker';
        let request = this.createMarketRequest (market);
        let tickers = await this[method] (this.extend (request, params));
        let ticker = tickers['ticker'];
        if (market['plus'])
            return this.parseTickerPlus (ticker, market);
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000;
        return {
            'id': trade['tid'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    parseTradePlus (trade, market) {
        let timestamp = this.parse8601 (trade['timestamp']);
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['side'].toLowerCase (),
            'price': trade['price'],
            'amount': trade['size'],
        };
    }

    parseTradesPlus (trades, market = undefined) {
        let result = [];
        for (let i = 0; i < trades.length; i++) {
            result.push (this.parseTradePlus (trades[i], market));
        }
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = market['api'] + 'GetTrade';
        let request = this.createMarketRequest (market);
        if (market['plus']) {
            let now = this.milliseconds ();
            request['start_time'] = now - 86400 * 1000;
            request['end_time'] = now;
        } else {
            method += 's'; // trades vs trade
        }
        let response = await this[method] (this.extend (request, params));
        if (market['plus']) {
            return this.parseTradesPlus (response['trades'], market);
        }
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost' + this.capitalize (side) + 'Order2';
        let order = {};
        let id = market['id'].toUpperCase ();
        if (type === 'market') {
            order['params'] = [ undefined, amount, id ];
        } else {
            order['params'] = [ price, amount, id ];
        }
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = params['market']; // TODO fixme
        return await this.privatePostCancelOrder (this.extend ({
            'params': [ id, market ],
        }, params));
    }

    nonce () {
        return this.microseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let p = [];
            if ('params' in params)
                p = params['params'];
            let nonce = this.nonce ();
            let request = {
                'method': path,
                'id': nonce,
                'params': p,
            };
            p = p.join (',');
            body = this.json (request);
            let query = (
                'tonce=' + nonce +
                '&accesskey=' + this.apiKey +
                '&requestmethod=' + method.toLowerCase () +
                '&id=' + nonce +
                '&method=' + path +
                '&params=' + p
            );
            let signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha1');
            let auth = this.encode (this.apiKey + ':' + signature);
            headers = {
                'Authorization': 'Basic ' + this.stringToBase64 (auth),
                'Json-Rpc-Tonce': nonce,
            };
        } else {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
