"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class btcturk extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcturk',
            'name': 'BTCTurk',
            'countries': 'TR', // Turkey
            'rateLimit': 1000,
            'hasCORS': true,
            'hasFetchTickers': true,
            'hasFetchOHLCV': true,
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
                        'buy',
                        'cancelOrder',
                        'sell',
                    ],
                },
            },
            'markets': {
                'BTC/TRY': { 'id': 'BTCTRY', 'symbol': 'BTC/TRY', 'base': 'BTC', 'quote': 'TRY', 'maker': 0.002, 'taker': 0.0035 },
                'ETH/TRY': { 'id': 'ETHTRY', 'symbol': 'ETH/TRY', 'base': 'ETH', 'quote': 'TRY', 'maker': 0.002, 'taker': 0.0035 },
                'ETH/BTC': { 'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'maker': 0.002, 'taker': 0.0035 },
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

    async fetchOrderBook (symbol, params = {}) {
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
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': parseFloat (ticker['open']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': parseFloat (ticker['average']),
            'baseVolume': parseFloat (ticker['volume']),
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
        return this.parseTrades (response, market);
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
        if (limit)
            request['last'] = limit;
        let response = await this.publicGetOhlcdata (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'Type': (side == 'buy') ? 'BuyBtc' : 'SelBtc',
            'IsMarketOrder': (type == 'market') ? 1 : 0,
        };
        if (type == 'market') {
            if (side == 'buy')
                order['Total'] = amount;
            else
                order['Amount'] = amount;
        } else {
            order['Price'] = price;
            order['Amount'] = amount;
        }
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder ({ 'id': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (this.id == 'btctrader')
            throw new ExchangeError (this.id + ' is an abstract base API for BTCExchange, BTCTurk');
        let url = this.urls['api'] + '/' + path;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString;
            body = this.urlencode (params);
            let secret = this.base64ToString (this.secret);
            let auth = this.apiKey + nonce;
            headers = {
                'X-PCK': this.apiKey,
                'X-Stamp': nonce.toString (),
                'X-Signature': this.hmac (this.encode (auth), secret, 'sha256', 'base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
