'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class hibtc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hibtc',
            'name': 'HiBTC',
            'countries': [ 'MT' ], // Malta
            'certified': true,
            'version': 'v1',
            'has': {
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchTickers': false, // will be true, shortly, because they have the endpoint for all tickers
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrders': true,
            },
            'timeframes': {
                '1m': '1MIN',
                '5m': '5MIN',
                '15m': '15MIN',
                '30m': '30MIN',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '6h': '6H',
                '12h': '12H',
                '1d': 'D',
                '3d': '2D',
                '1w': 'W',
                '1M': 'MONTH',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/47399591-df0fc980-d741-11e8-94aa-be2d444ede86.jpg',
                'api': {
                    'public': 'https://api.hibtc.com',
                    'private': 'https://api.hibtc.com',
                },
                'doc': 'https://www.hibtc.com/hbrhtml/API_file/en-us/readme.html',
                'www': 'https://www.hibtc.com',
                'fees': 'https://support.hibtc.com/hc/en-us/articles/360007165494-Fee-standard',
                'referral': 'https://hibtc.com/#/act/register?invite=1JxDPIiNCds',
            },
            'api': {
                'public': {
                    'get': [
                        'kline', // https://www.hibtc.com/hbrhtml/API_file/en-us/r-pub-1.html
                        'depth', // https://www.hibtc.com/hbrhtml/API_file/en-us/r-pub-2.html
                        'ticker', // https://www.hibtc.com/hbrhtml/API_file/en-us/r-pub-3.html
                        'trades', // https://www.hibtc.com/hbrhtml/API_file/en-us/r-pub-4.html
                    ],
                },
                'private': {
                    'post': [
                        'make/order', // https://www.hibtc.com/hbrhtml/API_file/en-us/r-pri-1.html
                        'cancel/order', // https://www.hibtc.com/hbrhtml/API_file/en-us/r-pri-2.html
                        'query/orders', // https://www.hibtc.com/hbrhtml/API_file/en-us/r-pri-4.html
                        'query/trades', // https://www.hibtc.com/hbrhtml/API_file/en-us/r-pri-5.html
                        'auth/orders',
                    ],
                    'get': [
                        'auth/wallet', // https://www.hibtc.com/hbrhtml/API_file/en-us/wallet.html
                        'detail/order', // https://www.hibtc.com/hbrhtml/API_file/en-us/order%20detail.html
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.001,
                    'taker': 0.001,
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetTicker ();
        //     {    date:   "1540347643779",
        //        ticker: [ {     dchange: "-102.05",
        //                           high: "6730.86",
        //                            vol: "9533.63",
        //                           last: "6535.35",
        //                            low: "6436.05",
        //                            buy: "6499.11",
        //                           sell: "6650.00",
        //                    dchange_pec: "-1.50",
        //                           pair: "BTC_USDT",
        //                      timestamp: "1540347643773" },
        //                  ...
        //                  {     dchange: "0.0000",
        //                           high: "0.0015",
        //                            vol: "2.6458",
        //                           last: "0.0015",
        //                            low: "0.0015",
        //                            buy: "0.0014",
        //                           sell: "0.0032",
        //                    dchange_pec: "0.00",
        //                           pair: "LBOX_USDT",
        //                      timestamp: "1540347643779" }  ],
        //          code:    0,
        //       channel:   "ticker"                             }
        let markets = this.safeValue (response, 'ticker', []);
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = this.safeString (market, 'pair');
            let [ baseId, quoteId ] = id.split ('_');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let active = true;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
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
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = this.safeInteger (ticker, 'timestamp');
        let bid = this.safeFloat (ticker, 'buy');
        let ask = this.safeFloat (ticker, 'sell');
        let high = this.safeFloat (ticker, 'high');
        let low = this.safeFloat (ticker, 'low');
        let bidVolume = undefined;
        let askVolume = undefined;
        let open = undefined;
        let close = this.safeFloat (ticker, 'last');
        let change = this.safeFloat (ticker, 'dchange');
        let average = undefined;
        let percentage = this.safeFloat (ticker, 'dchangepec');
        let baseVolume = this.safeFloat (ticker, 'dchangepec');
        let quoteVolume = undefined;
        let vwap = undefined;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': vwap,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTicker (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTicker (response['data'], market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (limit === undefined) {
            limit = 20;
        }
        let request = {
            'pair': market['id'],
            'prec': 0,
            'depth': limit - 1,
        };
        let response = await this.publicGetDepth (this.extend (request, params));
        let orderbook = response['data'];
        let timestamp = parseInt (orderbook['timestamp']);
        return this.parseOrderBook (orderbook, timestamp);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            parseInt (ohlcv[0]),
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
            'type': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['last'] = limit; // default === 100; max === 2000
        }
        let response = await this.publicGetKline (this.extend (request, params));
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let isbid = (side === 'buy') ? 'true' : 'false';
        let order = {
            'pair': market['id'],
            'isbid': isbid,
            'amount': this.amountToPrecision (symbol, amount),
            'order_type': type.toUpperCase (),
        };
        let stopPriceIsRequired = false;
        let priceIsRequired = true;
        if (type === 'limit') {
            stopPriceIsRequired = false;
            priceIsRequired = true;
        } else if (type === 'market') {
            priceIsRequired = false;
        } else if (type === 'stop-limit') {
            stopPriceIsRequired = false;
        }
        if (priceIsRequired) {
            if (typeof price === 'undefined') {
                throw new InvalidOrder (this.id + ' createOrder method requires a price argument for a ' + type + ' order');
            }
            order['price'] = this.priceToPrecision (symbol, price);
        } else {
            order['price'] = '0';
        }
        if (stopPriceIsRequired) {
            let stop_price = this.safeString (params, 'stop_price');
            if (typeof stop_price === 'undefined') {
                throw new InvalidOrder (this.id + ' createOrder method requires a stopPrice extra param for a ' + type + ' order');
            } else {
                order['stop_price'] = stop_price;
            }
        } else {
            order['stop_price'] = '0';
        }
        let response = await this.privatePostMakeOrder (this.extend (order, params));
        let timestamp = this.milliseconds ();
        return {
            'info': response,
            'id': this.safeString (response['data'], 'orderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    parseOrderStatus (status) {
        // Order status:  1-Start \  2-Partially Executed \ 3-Executed \ 4-Cancelled
        let statuses = {
            '1': 'open',
            '2': 'open',
            '3': 'closed',
            '4': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        let side = undefined;
        let order_id = undefined;
        let timestamp = undefined;
        let filled = undefined;
        let amount = undefined;
        let price = undefined;
        let cost = undefined;
        let remaining = undefined;
        let average = undefined;
        let type = undefined;
        let status = undefined;
        if (Array.isArray (order)) {
            order_id = order[0];
            if (order[1] in this.markets_by_id) {
                market = this.markets_by_id[order[1]];
                if (market !== undefined) {
                    symbol = market['symbol'];
                }
            }
            timestamp = parseInt (order[2]);
            filled = parseFloat (order[3]);
            amount = parseFloat (order[4]);
            if (parseFloat (order[5]) > 0) {
                side = 'buy';
            } else {
                side = 'sell';
            }
            price = Math.abs (parseFloat (order[5]));
            cost = parseFloat (order[6]);
            remaining = amount - filled;
            average = 0;
            if (filled > 0) {
                average = cost / filled;
            }
            type = order[7].toLowerCase ();
            status = this.parseOrderStatus (order[9]);
        }
        return {
            'info': order,
            'id': order_id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetDetailOrder ({
            'order_id': id,
        });
        return this.parseOrder (response['data']);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostCancelOrder ({
            'order_id': id,
            'pair': market['id'],
        });
        return this.parseOrder (response['data']['detail']);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market !== undefined)
            symbol = market['symbol'];
        let timestamp = parseInt (trade[3]);
        let price = parseFloat (trade[1]);
        let amount = parseFloat (trade[2]);
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        let fee = undefined;
        let order = undefined;
        let type = undefined;
        let _side = trade[4];
        let side = undefined;
        if (_side === 'false') {
            side = 'sell';
        } else if (_side === 'true') {
            side = 'buy';
        }
        return {
            'info': trade,
            'id': trade[0],
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
        };
        if (limit === undefined) {
            limit = 10;
        }
        request['last'] = limit;
        let response = await this.publicGetTrades (this.extend (request, params));
        let data = response['data'];
        let result = [];
        for (let i = 0; i < data.length; i++) {
            let _trade = data[i];
            let trade = this.parseTrade (_trade, market);
            result.push (trade);
        }
        result = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetAuthWallet (params);
        let balances = response['data'];
        let result = { 'info': balances };
        let free_currencies = Object.keys (balances['free']);
        let freezed_currencies = Object.keys (balances['freezed']);
        let currencies = this.arrayConcat (free_currencies, freezed_currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let account = {
                'free': this.safeFloat (balances['free'], currency),
                'used': this.safeFloat (balances['freezed'], currency),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseMyTrade (trade, market = undefined) {
        let timestamp = parseInt (trade[2]);
        let symbol = this.findSymbol (trade[1], market);
        let side = undefined;
        let amount = parseFloat (trade[5]);
        if (parseFloat (trade[7]) > 0) {
            side = 'buy';
        } else {
            side = 'sell';
        }
        let price = parseFloat (trade[3]);
        let type = trade[6].toLowerCase ();
        let fee = parseFloat (trade[8]);
        return {
            'info': trade,
            'id': trade[0],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': fee,
            'order': undefined,
        };
    }

    parseMyTrades (trades, market = undefined, since = undefined, limit = undefined) {
        let result = [];
        for (let i = 0; i < trades.length; i++) {
            let trade = this.parseMyTrade (trades[i], market);
            result.push (trade);
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 10;
        }
        let request = {
            'page_size': limit,
            'page_index': 1,
        };
        let response = await this.privatePostQueryTrades (this.extend (request, params));
        let trades = this.parseMyTrades (response['data'], undefined, since, limit);
        if (symbol !== undefined) {
            let market = this.market (symbol);
            trades = this.filterBySymbol (trades, market['symbol']);
        }
        return trades;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        let response = await this.privatePostAuthOrders (params);
        return this.parseOrders (response['data'], market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (limit === undefined)
            limit = 10;
        let request = {
            'page_index': 1,
            'page_size': limit,
        };
        let response = await this.privatePostQueryOrders (this.extend (request, params));
        return this.parseOrders (response['data'], market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let _timestamp = this.microseconds () / 1000000;
            let timestamp = _timestamp.toString ();
            let query = this.keysort (this.extend ({
                'api_key': this.apiKey,
                'auth_nonce': timestamp,
            }, params));
            let hash_keys = [];
            if (method === 'GET') {
                hash_keys = ['api_key', 'auth_nonce'];
            } else {
                hash_keys = Object.keys (query);
            }
            let _q = '';
            for (let i = 0; i < hash_keys.length; i++) {
                let _key = hash_keys[i];
                _q += this.safeString (query, _key);
            }
            query['auth_sign'] = this.hash (this.encode (_q + this.secret));
        }
        if (Object.keys (query).length)
            url += '?' + this.urlencode (query);
        url = this.urls['api'][api] + url;
        return {
            'url': url,
            'method': method,
            'body': body,
            'headers': headers,
        };
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (!this.isJsonEncodedObject (body)) {
            return; // fallback to default error handler
        }
        let response = JSON.parse (body);
        if ('code' in response) {
            // {"code":-1,"msg":"fail"}
            let code = response['code'];
            if (code < 0 || code === 5000) {
                throw new ExchangeError (this.safeString (response, 'msg_code', 'fail'));
            }
        }
        if ('data' in response) {
            //
            // {
            //   data: {
            //     result: false,
            //     orderId: "441346014116890624"
            //   },
            //   channel: "auth-cancel-order"
            //  }
            //
            let result = response['data'];
            if (result === 'false') {
                throw new ExchangeError ();
            }
        }
    }
};
