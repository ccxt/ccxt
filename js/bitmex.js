"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class bitmex extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmex',
            'name': 'BitMEX',
            'countries': 'SC', // Seychelles
            'version': 'v1',
            'rateLimit': 1500,
            'hasCORS': false,
            'hasFetchOHLCV': true,
            'hasWithdraw': true,
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'test': 'https://testnet.bitmex.com',
                'logo': 'https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg',
                'api': 'https://www.bitmex.com',
                'www': 'https://www.bitmex.com',
                'doc': [
                    'https://www.bitmex.com/app/apiOverview',
                    'https://github.com/BitMEX/api-connectors/tree/master/official-http',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'announcement',
                        'announcement/urgent',
                        'funding',
                        'instrument',
                        'instrument/active',
                        'instrument/activeAndIndices',
                        'instrument/activeIntervals',
                        'instrument/compositeIndex',
                        'instrument/indices',
                        'insurance',
                        'leaderboard',
                        'liquidation',
                        'orderBook',
                        'orderBook/L2',
                        'quote',
                        'quote/bucketed',
                        'schema',
                        'schema/websocketHelp',
                        'settlement',
                        'stats',
                        'stats/history',
                        'trade',
                        'trade/bucketed',
                    ],
                },
                'private': {
                    'get': [
                        'apiKey',
                        'chat',
                        'chat/channels',
                        'chat/connected',
                        'execution',
                        'execution/tradeHistory',
                        'notification',
                        'order',
                        'position',
                        'user',
                        'user/affiliateStatus',
                        'user/checkReferralCode',
                        'user/commission',
                        'user/depositAddress',
                        'user/margin',
                        'user/minWithdrawalFee',
                        'user/wallet',
                        'user/walletHistory',
                        'user/walletSummary',
                    ],
                    'post': [
                        'apiKey',
                        'apiKey/disable',
                        'apiKey/enable',
                        'chat',
                        'order',
                        'order/bulk',
                        'order/cancelAllAfter',
                        'order/closePosition',
                        'position/isolate',
                        'position/leverage',
                        'position/riskLimit',
                        'position/transferMargin',
                        'user/cancelWithdrawal',
                        'user/confirmEmail',
                        'user/confirmEnableTFA',
                        'user/confirmWithdrawal',
                        'user/disableTFA',
                        'user/logout',
                        'user/logoutAll',
                        'user/preferences',
                        'user/requestEnableTFA',
                        'user/requestWithdrawal',
                    ],
                    'put': [
                        'order',
                        'order/bulk',
                        'user',
                    ],
                    'delete': [
                        'apiKey',
                        'order',
                        'order/all',
                    ],
                },
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetInstrumentActiveAndIndices ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let active = (market['state'] != 'Unlisted');
            let id = market['symbol'];
            let base = market['underlying'];
            let quote = market['quoteCurrency'];
            let type = undefined;
            let future = false;
            let prediction = false;
            let basequote = base + quote;
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let swap = (id == basequote);
            let symbol = id;
            if (swap) {
                type = 'swap';
                symbol = base + '/' + quote;
            } else if (id.indexOf ('B_') >= 0) {
                prediction = true;
                type = 'prediction';
            } else {
                future = true;
                type = 'future';
            }
            let maker = market['makerFee'];
            let taker = market['takerFee'];
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'taker': taker,
                'maker': maker,
                'type': type,
                'spot': false,
                'swap': swap,
                'future': future,
                'prediction': prediction,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetUserMargin ({ 'currency': 'all' });
        let result = { 'info': response };
        for (let b = 0; b < response.length; b++) {
            let balance = response[b];
            let currency = balance['currency'].toUpperCase ();
            currency = this.commonCurrencyCode (currency);
            let account = {
                'free': balance['availableMargin'],
                'used': 0.0,
                'total': balance['amount'],
            };
            if (currency == 'BTC') {
                account['free'] = account['free'] * 0.00000001;
                account['total'] = account['total'] * 0.00000001;
            }
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderBookL2 (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        for (let o = 0; o < orderbook.length; o++) {
            let order = orderbook[o];
            let side = (order['side'] == 'Sell') ? 'asks' : 'bids';
            let amount = order['size'];
            let price = order['price'];
            result[side].push ([ price, amount ]);
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (!market['active'])
            throw new ExchangeError (this.id + ': symbol ' + symbol + ' is delisted');
        let request = this.extend ({
            'symbol': market['id'],
            'binSize': '1d',
            'partial': true,
            'count': 1,
            'reverse': true,
        }, params);
        let quotes = await this.publicGetQuoteBucketed (request);
        let quotesLength = quotes.length;
        let quote = quotes[quotesLength - 1];
        let tickers = await this.publicGetTradeBucketed (request);
        let ticker = tickers[0];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (quote['bidPrice']),
            'ask': parseFloat (quote['askPrice']),
            'vwap': parseFloat (ticker['vwap']),
            'open': undefined,
            'close': parseFloat (ticker['close']),
            'first': undefined,
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['homeNotional']),
            'quoteVolume': parseFloat (ticker['foreignNotional']),
            'info': ticker,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        let timestamp = this.parse8601 (ohlcv['timestamp']);
        return [
            timestamp,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['volume'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // send JSON key/value pairs, such as {"key": "value"}
        // filter by individual fields and do advanced queries on timestamps
        // let filter = { 'key': 'value' };
        // send a bare series (e.g. XBU) to nearest expiring contract in that series
        // you can also send a timeframe, e.g. XBU:monthly
        // timeframes: daily, weekly, monthly, quarterly, and biquarterly
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'binSize': this.timeframes[timeframe],
            'partial': true,     // true == include yet-incomplete current bins
            // 'filter': filter, // filter by individual fields and do advanced queries
            // 'columns': [],    // will return all columns if omitted
            // 'start': 0,       // starting point for results (wtf?)
            // 'reverse': false, // true == newest first
            // 'endTime': '',    // ending date filter for results
        };
        if (since) {
            let ymdhms = this.YmdHMS (since);
            let ymdhm = ymdhms.slice (0, 16);
            request['startTime'] = ymdhm; // starting date filter for results
        }
        if (limit)
            request['count'] = limit; // default 100
        let response = await this.publicGetTradeBucketed (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['timestamp']);
        let symbol = undefined;
        if (!market) {
            if ('symbol' in trade)
                market = this.markets_by_id[trade['symbol']];
        }
        if (market)
            symbol = market['symbol'];
        return {
            'id': trade['trdMatchID'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': trade['side'].toLowerCase (),
            'price': trade['price'],
            'amount': trade['size'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrade (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'symbol': this.marketId (symbol),
            'side': this.capitalize (side),
            'orderQty': amount,
            'ordType': this.capitalize (type),
        };
        if (type == 'limit')
            order['price'] = price;
        let response = await this.privatePostOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['orderID'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteOrder ({ 'orderID': id });
    }

    isFiat (currency) {
        if (currency == 'EUR')
            return true;
        if (currency == 'PLN')
            return true;
        return false;
    }

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        if (currency != 'BTC')
            throw new ExchangeError (this.id + ' supoprts BTC withdrawals only, other currencies coming soon...');
        let request = {
            'currency': 'XBt', // temporarily
            'amount': amount,
            'address': address,
            // 'otpToken': '123456', // requires if two-factor auth (OTP) is enabled
            // 'fee': 0.001, // bitcoin network fee
        };
        let response = await this.privatePostUserRequestWithdrawal (this.extend (request, params));
        return {
            'info': response,
            'id': response['transactID'],
        };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code == 400) {
            if (body[0] == "{") {
                let response = JSON.parse (body);
                if ('error' in response) {
                    if ('message' in response['error']) {
                        throw new ExchangeError (this.id + ' ' + this.json (response));
                    }
                }
            }
            throw new ExchangeError (this.id + ' ' + body);
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/api' + '/' + this.version + '/' + path;
        if (Object.keys (params).length)
            query += '?' + this.urlencode (params);
        let url = this.urls['api'] + query;
        if (api == 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            if (method == 'POST')
                if (Object.keys (params).length)
                    body = this.json (params);
            let request = [ method, query, nonce, body || ''].join ('');
            headers = {
                'Content-Type': 'application/json',
                'api-nonce': nonce,
                'api-key': this.apiKey,
                'api-signature': this.hmac (this.encode (request), this.encode (this.secret)),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
