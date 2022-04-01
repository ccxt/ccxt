'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadSymbol, ExchangeError, NotSupported } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bitstamp1 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitstamp1',
            'name': 'Bitstamp',
            'countries': [ 'GB' ],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTrades': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
                'api': 'https://www.bitstamp.net/api',
                'www': 'https://www.bitstamp.net',
                'doc': 'https://www.bitstamp.net/api',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'ticker_hour',
                        'order_book',
                        'transactions',
                        'eur_usd',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'user_transactions',
                        'open_orders',
                        'order_status',
                        'cancel_order',
                        'cancel_all_orders',
                        'buy',
                        'sell',
                        'bitcoin_deposit_address',
                        'unconfirmed_btc',
                        'ripple_withdrawal',
                        'ripple_address',
                        'withdrawal_requests',
                        'bitcoin_withdrawal',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'btcusd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'btc', 'quoteId': 'usd', 'maker': 0.005, 'taker': 0.005, 'type': 'spot', 'spot': true },
                'BTC/EUR': { 'id': 'btceur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'baseId': 'btc', 'quoteId': 'eur', 'maker': 0.005, 'taker': 0.005, 'type': 'spot', 'spot': true },
                'EUR/USD': { 'id': 'eurusd', 'symbol': 'EUR/USD', 'base': 'EUR', 'quote': 'USD', 'baseId': 'eur', 'quoteId': 'usd', 'maker': 0.005, 'taker': 0.005, 'type': 'spot', 'spot': true },
                'XRP/USD': { 'id': 'xrpusd', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD', 'baseId': 'xrp', 'quoteId': 'usd', 'maker': 0.005, 'taker': 0.005, 'type': 'spot', 'spot': true },
                'XRP/EUR': { 'id': 'xrpeur', 'symbol': 'XRP/EUR', 'base': 'XRP', 'quote': 'EUR', 'baseId': 'xrp', 'quoteId': 'eur', 'maker': 0.005, 'taker': 0.005, 'type': 'spot', 'spot': true },
                'XRP/BTC': { 'id': 'xrpbtc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'xrp', 'quoteId': 'btc', 'maker': 0.005, 'taker': 0.005, 'type': 'spot', 'spot': true },
                'LTC/USD': { 'id': 'ltcusd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD', 'baseId': 'ltc', 'quoteId': 'usd', 'maker': 0.005, 'taker': 0.005, 'type': 'spot', 'spot': true },
                'LTC/EUR': { 'id': 'ltceur', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR', 'baseId': 'ltc', 'quoteId': 'eur', 'maker': 0.005, 'taker': 0.005, 'type': 'spot', 'spot': true },
                'LTC/BTC': { 'id': 'ltcbtc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc', 'maker': 0.005, 'taker': 0.005, 'type': 'spot', 'spot': true },
                'ETH/USD': { 'id': 'ethusd', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD', 'baseId': 'eth', 'quoteId': 'usd', 'maker': 0.005, 'taker': 0.005, 'type': 'spot', 'spot': true },
                'ETH/EUR': { 'id': 'etheur', 'symbol': 'ETH/EUR', 'base': 'ETH', 'quote': 'EUR', 'baseId': 'eth', 'quoteId': 'eur', 'maker': 0.005, 'taker': 0.005, 'type': 'spot', 'spot': true },
                'ETH/BTC': { 'id': 'ethbtc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc', 'maker': 0.005, 'taker': 0.005, 'type': 'spot', 'spot': true },
            },
        });
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        if (symbol !== 'BTC/USD') {
            throw new ExchangeError (this.id + ' ' + this.version + " fetchOrderBook doesn't support " + symbol + ', use it for BTC/USD only');
        }
        await this.loadMarkets ();
        const orderbook = await this.publicGetOrderBook (params);
        const timestamp = this.safeTimestamp (orderbook, 'timestamp');
        return this.parseOrderBook (orderbook, symbol, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        //
        // {
        //     "volume": "2836.47827985",
        //     "last": "36544.93",
        //     "timestamp": "1643372072",
        //     "bid": "36535.79",
        //     "vwap":"36594.20",
        //     "high": "37534.15",
        //     "low": "35511.32",
        //     "ask": "36548.47",
        //     "open": 37179.62
        // }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        const vwap = this.safeString (ticker, 'vwap');
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = Precise.stringMul (baseVolume, vwap);
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
        if (symbol !== 'BTC/USD') {
            throw new ExchangeError (this.id + ' ' + this.version + " fetchTicker doesn't support " + symbol + ', use it for BTC/USD only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const ticker = await this.publicGetTicker (params);
        //
        // {
        //     "volume": "2836.47827985",
        //     "last": "36544.93",
        //     "timestamp": "1643372072",
        //     "bid": "36535.79",
        //     "vwap":"36594.20",
        //     "high": "37534.15",
        //     "low": "35511.32",
        //     "ask": "36548.47",
        //     "open": 37179.62
        // }
        //
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp2 (trade, 'date', 'datetime');
        const side = (trade['type'] === 0) ? 'buy' : 'sell';
        const orderId = this.safeString (trade, 'order_id');
        const id = this.safeString (trade, 'tid');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        const marketId = this.safeString (trade, 'currency_pair');
        market = this.safeMarket (marketId, market);
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        if (symbol !== 'BTC/USD') {
            throw new BadSymbol (this.id + ' ' + this.version + " fetchTrades doesn't support " + symbol + ', use it for BTC/USD only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'time': 'minute',
        };
        const response = await this.publicGetTransactions (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseBalance (response) {
        const result = { 'info': response };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const currencyId = currency['id'];
            const account = this.account ();
            account['free'] = this.safeString (response, currencyId + '_available');
            account['used'] = this.safeString (response, currencyId + '_reserved');
            account['total'] = this.safeString (response, currencyId + '_balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        const response = await this.privatePostBalance (params);
        return this.parseBalance (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' ' + this.version + ' accepts limit orders only');
        }
        if (symbol !== 'BTC/USD') {
            throw new ExchangeError (this.id + ' v1 supports BTC/USD orders only');
        }
        await this.loadMarkets ();
        const method = 'privatePost' + this.capitalize (side);
        const request = {
            'amount': amount,
            'price': price,
        };
        const response = await this[method] (this.extend (request, params));
        const id = this.safeString (response, 'id');
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder ({ 'id': id });
    }

    parseOrderStatus (status) {
        const statuses = {
            'In Queue': 'open',
            'Open': 'open',
            'Finished': 'closed',
            'Canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchOrderStatus (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privatePostOrderStatus (this.extend (request, params));
        return this.parseOrderStatus (response);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const pair = market ? market['id'] : 'all';
        const request = {
            'id': pair,
        };
        const response = await this.privatePostOpenOrdersId (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrder is not implemented yet');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const auth = nonce + this.uid + this.apiKey;
            const signature = this.encode (this.hmac (this.encode (auth), this.encode (this.secret)));
            query = this.extend ({
                'key': this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce,
            }, query);
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const status = this.safeString (response, 'status');
        if (status === 'error') {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
    }
};
