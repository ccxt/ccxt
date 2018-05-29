'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class btcturk extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcturk',
            'name': 'BTCTurk',
            'countries': 'TR', // Turkey
            'rateLimit': 1000,
            'has': {
                'CORS': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
            },
            'timeframes': {
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg',
                'api': 'https://www.btcturk.com/api',
                'www': 'https://www.btcturk.com',
                'doc': 'https://github.com/BTCTrader/broker-api-docs',
            },
            'api': {
                'public': {
                    'get': [
                        'ohlcdata', // ?last=COUNT
                        'orderbook',
                        'ticker',
                        'trades',   // ?last=COUNT (max 50)
                    ],
                },
                'private': {
                    'get': [
                        'balance',
                        'openOrders',
                        'userTransactions', // ?offset=0&limit=25&sort=asc
                    ],
                    'post': [
                        'exchange',
                        'cancelOrder',
                    ],
                },
            },
            'markets': {
                'BTC/TRY': { 'id': 'BTCTRY', 'symbol': 'BTC/TRY', 'base': 'BTC', 'quote': 'TRY', 'maker': 0.002 * 1.18, 'taker': 0.0035 * 1.18 },
                'ETH/TRY': { 'id': 'ETHTRY', 'symbol': 'ETH/TRY', 'base': 'ETH', 'quote': 'TRY', 'maker': 0.002 * 1.18, 'taker': 0.0035 * 1.18 },
                'XRP/TRY': { 'id': 'XRPTRY', 'symbol': 'XRP/TRY', 'base': 'XRP', 'quote': 'TRY', 'maker': 0.002 * 1.18, 'taker': 0.0035 * 1.18 },
                'ETH/BTC': { 'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'maker': 0.002 * 1.18, 'taker': 0.0035 * 1.18 },
            },
        });
    }

    async fetchBalance (params = {}) {
        let response = await this.privateGetBalance ();
        let result = { 'info': response };
        let base = {
            'free': response['bitcoin_available'],
            'used': response['bitcoin_reserved'],
            'total': response['bitcoin_balance'],
        };
        let quote = {
            'free': response['money_available'],
            'used': response['money_reserved'],
            'total': response['money_balance'],
        };
        let symbol = this.symbols[0];
        let market = this.markets[symbol];
        result[market['base']] = base;
        result[market['quote']] = quote;
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let orderbook = await this.publicGetOrderbook (this.extend ({
            'pairSymbol': market['id'],
        }, params));
        let timestamp = parseInt (orderbook['timestamp'] * 1000);
        return this.parseOrderBook (orderbook, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let timestamp = parseInt (ticker['timestamp']) * 1000;
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'average'),
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (params);
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let symbol = ticker['pair'];
            let market = undefined;
            if (symbol in this.markets_by_id) {
                market = this.markets_by_id[symbol];
                symbol = market['symbol'];
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.fetchTickers ();
        let result = undefined;
        if (symbol in tickers)
            result = tickers[symbol];
        return result;
    }

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
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

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        // let maxCount = 50;
        let response = await this.publicGetTrades (this.extend ({
            'pairSymbol': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        let timestamp = this.parse8601 (ohlcv['Time']);
        return [
            timestamp,
            ohlcv['Open'],
            ohlcv['High'],
            ohlcv['Low'],
            ohlcv['Close'],
            ohlcv['Volume'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {};
        if (typeof limit !== 'undefined')
            request['last'] = limit;
        let response = await this.publicGetOhlcdata (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'PairSymbol': this.marketId (symbol),
            'OrderType': (side === 'buy') ? 0 : 1,
            'OrderMethod': (type === 'market') ? 1 : 0,
        };
        if (type === 'market') {
            if (!('Total' in params))
                throw new ExchangeError (this.id + ' createOrder requires the "Total" extra parameter for market orders (amount and price are both ignored)');
        } else {
            order['Price'] = price;
            order['Amount'] = amount;
        }
        let response = await this.privatePostExchange (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder ({ 'id': id });
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (this.id === 'btctrader')
            throw new ExchangeError (this.id + ' is an abstract base API for BTCExchange, BTCTurk');
        let url = this.urls['api'] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            body = this.urlencode (params);
            let secret = this.base64ToBinary (this.secret);
            let auth = this.apiKey + nonce;
            headers = {
                'X-PCK': this.apiKey,
                'X-Stamp': nonce,
                'X-Signature': this.stringToBase64 (this.hmac (this.encode (auth), secret, 'sha256', 'binary')),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
