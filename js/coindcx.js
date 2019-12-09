'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coindcx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coindcx',
            'name': 'CoinDCX',
            'countries': ['IN'], // india
            'urls': {
                'api': {
                    'general': 'https://api.coindcx.com',
                    'public': 'https://public.coindcx.com',
                    'private': 'https://api.coindcx.com',
                },
                'www': 'https://coindcx.com/',
                'doc': 'https://coindcx-official.github.io/rest-api/',
                'fees': 'https://coindcx.com/fees',
            },
            'version': 'v1',
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'token': false,
            },
            'api': {
                'general': {
                    'get': [
                        'exchange/ticker',
                        'exchange/v1/markets',
                        'exchange/v1/markets_details',
                    ],
                },
                'public': {
                    'get': [
                        'market_data/trade_history',
                        'market_data/orderbook',
                        'market_data/candles',
                    ],
                },
                'private': {
                    'post': [
                        'exchange/v1/users/balances',
                        'exchange/v1/orders/create',
                        'exchange/v1/orders/status',
                        'exchange/v1/orders/active_orders',
                        'exchange/v1/orders/trade_history',
                        'exchange/v1/orders/cancel',
                        'exchange/v1/orders/cancel_all',
                    ],
                },
            },
            'has': {
                'fetchTicker': 'emulated',
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchOrderBook': true,
                'fetchOHLCV': true,
                'fetchBalance': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'cancelOrder': true,
                'cancelAllOrders': true,
                'editOrder': false,
                'fetchStatus': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'timeout': 10000,
            'rateLimit': 2000,
        });
    }

    async fetchMarkets (params = {}) {
        // answer example https://coindcx-official.github.io/rest-api/?javascript#markets-details
        const details = await this.generalGetExchangeV1MarketsDetails (params);
        const result = [];
        for (let i = 0; i < details.length; i++) {
            const market = details[i];
            const id = this.safeString (market, 'symbol');
            const quoteId = this.safeString (market, 'base_currency_short_name');
            const quote = this.safeCurrencyCode (quoteId);
            const baseId = this.safeString (market, 'target_currency_short_name');
            const base = this.safeCurrencyCode (baseId);
            const symbol = base + '/' + quote;
            let active = false;
            if (market['status'] === 'active') {
                active = true;
            }
            const precision = {
                'amount': this.safeInteger (market, 'base_currency_precision'),
                'price': this.safeInteger (market, 'target_currency_precision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'min_quantity'),
                    'max': this.safeFloat (market, 'max_quantity'),
                },
                'price': {
                    'min': this.safeFloat (market, 'min_price'),
                    'max': this.safeFloat (market, 'max_price'),
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.generalGetExchangeTicker (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTicker requires a `symbol` argument');
        }
        await this.loadMarkets ();
        if (!(symbol in this.markets)) {
            throw new ExchangeError (this.id + ' has no symbol ' + symbol);
        }
        const response = await this.generalGetExchangeTicker (params);
        const market = this.findMarket (symbol);
        const marketId = this.safeValue (market, 'id');
        let result = {};
        for (let i = 0; i < response.length; i++) {
            if (response[i]['market'] !== marketId) {
                continue;
            }
            result = this.parseTicker (response[i]);
            break;
        }
        return result;
    }

    parseTicker (ticker) {
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        const symbol = this.findSymbol (this.safeString (ticker, 'market'));
        const last = this.safeFloat (ticker, 'last_price');
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'change_24_hour'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 500, params = {}) {
        // https://coindcx-official.github.io/rest-api/?shell#candles
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV requires a `symbol` argument');
        }
        await this.loadMarkets ();
        if (!(symbol in this.markets)) {
            throw new ExchangeError (this.id + ' has no symbol ' + symbol);
        }
        if (limit < 0) {
            limit = 500; // coindcx default
        }
        if (limit > 1000) {
            limit = 1000; // coindcx limitation
        }
        const market = this.market (symbol);
        const marketInfo = this.safeValue (market, 'info');
        const coindcxPair = this.safeString (marketInfo, 'pair');
        if (coindcxPair === undefined) {
            throw new ExchangeError (this.id + ' has no pair (look at market\'s info) value for ' + symbol);
        }
        const coindcxTimeframe = this.timeframes[timeframe];
        if (coindcxTimeframe === undefined) {
            throw new ExchangeError (this.id + ' has no "' + timeframe + '" timeframe');
        }
        const request = {
            'pair': coindcxPair,
            'interval': coindcxTimeframe,
            'limit': limit,
        };
        const response = await this.publicGetMarketDataCandles (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchTrades (symbol, since = undefined, limit = 30, params = {}) {
        // https://coindcx-official.github.io/rest-api/?shell#trades
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades requires a `symbol` argument');
        }
        await this.loadMarkets ();
        if (!(symbol in this.markets)) {
            throw new ExchangeError (this.id + ' has no symbol ' + symbol);
        }
        const market = this.market (symbol);
        const marketInfo = this.safeValue (market, 'info');
        const coindcxPair = this.safeString (marketInfo, 'pair');
        if (coindcxPair === undefined) {
            throw new ExchangeError (this.id + ' has no pair (look at market\'s info) value for ' + symbol);
        }
        if (limit < 0) {
            limit = 30; // coindcx default
        }
        if (limit > 500) {
            limit = 500; // coindcx limitation
        }
        const request = {
            'pair': coindcxPair,
            'limit': limit,
        };
        const response = await this.publicGetMarketDataTradeHistory (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = 500, params = {}) {
        // https://coindcx-official.github.io/rest-api/?javascript#account-trade-history
        await this.loadMarkets ();
        if (limit < 0) {
            limit = 500;
        }
        if (limit > 1000) {
            limit = 1000;
        }
        const request = {
            'timestamp': this.milliseconds (),
            'limit': limit,
        };
        const response = await this.privatePostExchangeV1OrdersTradeHistory (this.extend (request, params));
        return this.parseTrades (response, undefined, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger2 (trade, 't', 'timestamp');
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString2 (trade, 's', 'symbol');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let takerOrMaker = undefined;
        if ('m' in trade) {
            takerOrMaker = trade['m'] ? 'maker' : 'taker';
        }
        const price = this.safeFloat2 (trade, 'p', 'price');
        const amount = this.safeFloat2 (trade, 'q', 'quantity');
        return {
            'id': this.safeString (trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': this.safeString (trade, 'side'),
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': this.safeFloat (trade, 'fee_amount'),
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        // https://coindcx-official.github.io/rest-api/?shell#order-book
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook requires a `symbol` argument');
        }
        await this.loadMarkets ();
        if (!(symbol in this.markets)) {
            throw new ExchangeError (this.id + ' has no symbol ' + symbol);
        }
        const market = this.market (symbol);
        const marketInfo = this.safeValue (market, 'info');
        const coindcxPair = this.safeString (marketInfo, 'pair');
        if (coindcxPair === undefined) {
            throw new ExchangeError (this.id + ' has no pair (look at market\'s info) value for ' + symbol);
        }
        const request = {
            'pair': coindcxPair,
        };
        const response = await this.publicGetMarketDataOrderbook (this.extend (request, params));
        return this.parseOrderBookData (response);
    }

    parseOrderBookData (orderBook) {
        const bids = this.safeValue (orderBook, 'bids', {});
        const asks = this.safeValue (orderBook, 'asks', {});
        return {
            'bids': this.sortBy (this.parseBidAskData (bids), 0, true),
            'asks': this.sortBy (this.parseBidAskData (asks), 0),
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
    }

    parseBidAskData (bidsOrAsks) {
        const priceKeys = Object.keys (bidsOrAsks);
        const parsedData = [];
        for (let i = 0; i < priceKeys.length; i++) {
            const key = priceKeys[i];
            const price = parseFloat (key);
            const amount = parseFloat (bidsOrAsks[key]);
            parsedData.push ([price, amount]);
        }
        return parsedData;
    }

    async fetchBalance (params = {}) {
        // https://coindcx-official.github.io/rest-api/?javascript#get-balances
        await this.loadMarkets ();
        const request = {
            'timestamp': this.milliseconds (),
        };
        const response = await this.privatePostExchangeV1UsersBalances (this.extend (request, params));
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            if (!(code in result)) {
                const account = this.account ();
                const free = this.safeFloat (balance, 'balance');
                const used = this.safeFloat (balance, 'locked_balance');
                const total = parseFloat (free + used);
                account['free'] = free;
                account['used'] = used;
                account['total'] = total;
                result[code] = account;
            }
        }
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        // https://coindcx-official.github.io/rest-api/?javascript#account-trade-history
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires an `id` argument');
        }
        await this.loadMarkets ();
        const request = {
            'id': String (id),
        };
        const response = await this.privatePostExchangeV1OrdersStatus (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a `symbol` argument');
        }
        await this.loadMarkets ();
        if (!(symbol in this.markets)) {
            throw new ExchangeError (this.id + ' has no symbol ' + symbol);
        }
        const market = this.market (symbol);
        const request = {
            'market': this.safeValue (market, 'id'),
            'timestamp': this.milliseconds (),
        };
        const response = await this.privatePostExchangeV1OrdersActiveOrders (this.extend (request, params));
        const orders = this.safeValue (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // https://coindcx-official.github.io/rest-api/?javascript#new-order
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a `symbol` argument');
        }
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a `type` argument');
        }
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a `side` argument');
        }
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires an `amount` argument');
        }
        if (type === 'limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder requires a `price` argument for limit order');
            }
        }
        await this.loadMarkets ();
        if (!(symbol in this.markets)) {
            throw new ExchangeError (this.id + ' has no symbol ' + symbol);
        }
        const market = this.market (symbol);
        const marketInfo = this.safeValue (market, 'info');
        let orderType = 'limit_order';
        if (type === 'market') {
            orderType = 'market_order';
        }
        const request = {
            'market': this.safeValue (marketInfo, 'symbol'),
            'total_quantity': amount,
            'side': side,
            'order_type': orderType,
            'timestamp': this.milliseconds (),
        };
        if (orderType === 'limit_order') {
            request['price_per_unit'] = price;
        }
        const response = await this.privatePostExchangeV1OrdersCreate (this.extend (request, params));
        const orders = this.safeValue (response, 'orders', []);
        return this.parseOrder (orders[0], market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires an `id` argument');
        }
        await this.loadMarkets ();
        const request = {
            'id': id,
            'timestamp': this.milliseconds (),
        };
        return await this.privatePostExchangeV1OrdersCancel (this.extend (request, params));
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders requires a `symbol` argument');
        }
        await this.loadMarkets ();
        if (!(symbol in this.markets)) {
            throw new ExchangeError (this.id + ' has no symbol ' + symbol);
        }
        const market = this.market (symbol);
        const marketInfo = this.safeValue (market, 'info');
        const request = {
            'market': this.safeValue (marketInfo, 'symbol'),
            'timestamp': this.milliseconds (),
        };
        return await this.privatePostExchangeV1OrdersCancelAll (this.extend (request, params));
    }

    parseOrder (order, market = undefined) {
        // console.log (order, market);
        const id = this.safeString (order, 'id');
        let timestamp = this.safeValue (order, 'created_at');
        if (this.isString (timestamp)) {
            timestamp = this.parseDate (timestamp);
        }
        let lastTradeTimestamp = this.safeValue (order, 'updated_at');
        if (this.isString (lastTradeTimestamp)) {
            lastTradeTimestamp = this.parseDate (lastTradeTimestamp);
        }
        let status = this.safeString (order, 'status');
        if (status === 'partially_filled') {
            status = 'open';
        } else if (status === 'filled') {
            status = 'closed';
        } else if (status === 'cancelled') {
            status = 'canceled';
        } else if (status === 'rejected') {
            status = 'canceled';
        } else if (status === 'partially_cancelled') {
            status = 'canceled';
        } else if (status === 'partially_cancelled') {
            status = 'open';
        }
        const marketId = this.safeString (market, 'symbol');
        if (market === undefined) {
            market = this.safeValue (this.markets_by_id, marketId);
        }
        let symbol = undefined;
        let quoteSymbol = undefined;
        let fee = undefined;
        if (market !== undefined) {
            symbol = this.safeString (market, 'symbol');
            quoteSymbol = this.safeString (market, 'quote');
            if (quoteSymbol !== undefined) {
                fee = {
                    'currency': quoteSymbol,
                    'rate': this.safeFloat (order, 'fee'),
                    'cost': this.safeFloat (order, 'fee_amount'),
                };
            }
        }
        let type = this.safeString (order, 'order_type');
        if (type === 'market_order') {
            type = 'market';
        } else if (type === 'limit_order') {
            type = 'limit';
        }
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': this.safeString (order, 'side'),
            'price': this.safeFloat2 (order, 'price', 'price_per_unit'),
            'amount': this.safeFloat (order, 'total_quantity'),
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': fee,
            'info': order,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // console.log (path, api, method, params, headers, body);
        const base = this.urls['api'][api];
        const request = '/' + this.implodeParams (path, params);
        let url = base + request;
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                const suffix = '?' + this.urlencode (query);
                url += suffix;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            body = this.json (query);
            const signature = this.hmac (this.encode (body), this.encode (this.secret));
            headers = {
                'X-AUTH-APIKEY': this.apiKey,
                'X-AUTH-SIGNATURE': signature,
            };
        }
        console.log (url, method, body, headers);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
