"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, InsufficientFunds, OrderNotFound } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class binance extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binance',
            'name': 'Binance',
            'countries': 'CN', // China
            'rateLimit': 500,
            'version': 'v1',
            'hasCORS': false,
            // obsolete metainfo interface
            'hasFetchTickers': true,
            'hasFetchOHLCV': true,
            'hasFetchMyTrades': true,
            'hasFetchOrder': true,
            'hasFetchOrders': true,
            'hasFetchOpenOrders': true,
            'hasWithdraw': true,
            // new metainfo interface
            'has': {
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api': {
                    'web': 'https://www.binance.com',
                    'wapi': 'https://www.binance.com/wapi',
                    'public': 'https://api.binance.com/api',
                    'private': 'https://api.binance.com/api',
                },
                'www': 'https://www.binance.com',
                'doc': 'https://www.binance.com/restapipub.html',
                'fees': 'https://binance.zendesk.com/hc/en-us/articles/115000429332',
            },
            'api': {
                'web': {
                    'get': [
                        'exchange/public/product',
                    ],
                },
                'wapi': {
                    'post': [
                        'withdraw',
                        'getDepositHistory',
                        'getWithdrawHistory',
                    ],
                },
                'public': {
                    'get': [
                        'ping',
                        'time',
                        'depth',
                        'aggTrades',
                        'klines',
                        'ticker/24hr',
                        'ticker/allPrices',
                        'ticker/allBookTickers',
                    ],
                },
                'private': {
                    'get': [
                        'order',
                        'openOrders',
                        'allOrders',
                        'account',
                        'myTrades',
                    ],
                    'post': [
                        'order',
                        'order/test',
                        'userDataStream',
                    ],
                    'put': [
                        'userDataStream'
                    ],
                    'delete': [
                        'order',
                        'userDataStream',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.001,
                    'maker': 0.001,
                },
                'funding': {
                    'withdraw': {
                        'BNB': 1.0,
                        'BTC': 0.0005,
                        'ETH': 0.005,
                        'LTC': 0.001,
                        'NEO': 0.0,
                        'QTUM': 0.01,
                        'SNT': 50.0,
                        'BNT': 0.6,
                        'EOS': 2.0,
                        'BCH': 0.0005,
                        'GAS': 0.0,
                        'USDT': 5.0,
                        'OAX': 2.0,
                        'DNT': 30.0,
                        'MCO': 0.15,
                        'ICN': 0.5,
                        'WTC': 0.2,
                        'OMG': 0.1,
                        'ZRX': 5.0,
                        'STRAT': 0.1,
                        'SNGLS': 8.0,
                        'BQX': 2.0,
                        'KNC': 1.0,
                        'FUN': 50.0,
                        'SNM': 10.0,
                        'LINK': 5.0,
                        'XVG': 0.1,
                        'CTR': 1.0,
                        'SALT': 0.3,
                        'IOTA': 0.0,
                        'MDA': 0.5,
                        'MTL': 0.15,
                        'SUB': 10.0,
                        'ETC': 0.01,
                        'MTH': 10.0,
                        'ENG': 2.0,
                        'AST': 4.0,
                        'BTG': undefined,
                        'DASH': 0.002,
                        'EVX': 1.0,
                        'REQ': 30.0,
                        'LRC': 7.0,
                        'VIB': 7.0,
                        'HSR': 0.0001,
                        'TRX': 500.0,
                        'POWR': 15.0,
                        'ARK': 0.1,
                        'YOYO': 30.0,
                        'XRP': 0.15,
                        'MOD': 1.0,
                        'ENJ': 1.0,
                        'STORJ': 2.0,
                    },
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.webGetExchangePublicProduct ();
        let markets = response['data'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['symbol'];
            let base = this.commonCurrencyCode (market['baseAsset']);
            let quote = this.commonCurrencyCode (market['quoteAsset']);
            let symbol = base + '/' + quote;
            let lot = parseFloat (market['minTrade']);
            let tickSize = parseFloat (market['tickSize']);
            let logTickSize = parseInt (-Math.log10 (tickSize));
            let precision = {
                'amount': logTickSize,
                'price': logTickSize,
            };
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'lot': lot,
                'active': market['active'],
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': undefined,
                    },
                    'price': {
                        'min': tickSize,
                        'max': undefined,
                    },
                    'cost': {
                        'min': lot,
                        'max': undefined,
                    },
                },
            }));
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side == 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetAccount (params);
        let result = { 'info': response };
        let balances = response['balances'];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let asset = balance['asset'];
            let currency = this.commonCurrencyCode (asset);
            let account = {
                'free': parseFloat (balance['free']),
                'used': parseFloat (balance['locked']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicGetDepth (this.extend ({
            'symbol': market['id'],
            'limit': 100, // default = maximum = 100
        }, params));
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market) {
        let timestamp = this.safeInteger (ticker, 'closeTime');
        if (typeof timestamp == 'undefined')
            timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': this.safeFloat (ticker, 'bidPrice'),
            'ask': this.safeFloat (ticker, 'askPrice'),
            'vwap': this.safeFloat (ticker, 'weightedAvgPrice'),
            'open': this.safeFloat (ticker, 'openPrice'),
            'close': this.safeFloat (ticker, 'prevClosePrice'),
            'first': undefined,
            'last': this.safeFloat (ticker, 'lastPrice'),
            'change': this.safeFloat (ticker, 'priceChangePercent'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTicker24hr (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTickerAllBookTickers (params);
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let id = ticker['symbol'];
            if (id in this.markets_by_id) {
                let market = this.markets_by_id[id];
                let symbol = market['symbol'];
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return result;
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
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
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        request['limit'] = (limit) ? limit : 500; // default == max == 500
        if (since)
            request['startTime'] = since;
        let response = await this.publicGetKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestampField = ('T' in trade) ? 'T' : 'time';
        let timestamp = trade[timestampField];
        let priceField = ('p' in trade) ? 'p' : 'price';
        let price = parseFloat (trade[priceField]);
        let amountField = ('q' in trade) ? 'q' : 'qty';
        let amount = parseFloat (trade[amountField]);
        let idField = ('a' in trade) ? 'a' : 'id';
        let id = trade[idField].toString ();
        let side = undefined;
        let order = undefined;
        if ('orderId' in trade)
            order = trade['orderId'].toString ();
        if ('m' in trade) {
            side = trade['m'] ? 'sell' : 'buy'; // this is reversed intentionally
        } else {
            side = (trade['isBuyer']) ? 'buy' : 'sell'; // this is a true side
        }
        let fee = undefined;
        if ('commission' in trade) {
            fee = {
                'cost': parseFloat (trade['commission']),
                'currency': this.commonCurrencyCode (trade['commissionAsset']),
            };
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': order,
            'type': undefined,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (since)
            request['startTime'] = since;
        if (limit)
            request['limit'] = limit;
        // 'fromId': 123,    // ID to get aggregate trades from INCLUSIVE.
        // 'startTime': 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
        // 'endTime': 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
        // 'limit': 500,     // default = maximum = 500
        let response = await this.publicGetAggTrades (this.extend (request, params));
        return this.parseTrades (response, market);
    }

    parseOrderStatus (status) {
        if (status == 'NEW')
            return 'open';
        if (status == 'PARTIALLY_FILLED')
            return 'partial';
        if (status == 'FILLED')
            return 'closed';
        if (status == 'CANCELED')
            return 'canceled';
        return status.toLowerCase ();
    }

    parseOrder (order, market = undefined) {
        let status = this.parseOrderStatus (order['status']);
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            let id = order['symbol'];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
        }
        let timestamp = order['time'];
        let price = parseFloat (order['price']);
        let amount = parseFloat (order['origQty']);
        let filled = this.safeFloat (order, 'executedQty', 0.0);
        let remaining = Math.max (amount - filled, 0.0);
        let result = {
            'info': order,
            'id': order['orderId'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': order['type'].toLowerCase (),
            'side': order['side'].toLowerCase (),
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'symbol': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'type': type.toUpperCase (),
            'side': side.toUpperCase (),
        };
        if (type == 'limit') {
            order = this.extend (order, {
                'price': this.priceToPrecision (symbol, price),
                'timeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
            });
        }
        let response = await this.privatePostOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['orderId'].toString (),
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateGetOrder (this.extend ({
            'symbol': market['id'],
            'orderId': parseInt (id),
        }, params));
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let response = await this.privateGetAllOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateGetOpenOrders (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseOrders (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' cancelOrder requires a symbol param');
        let market = this.market (symbol);
        let response = undefined;
        try {
            response = await this.privateDeleteOrder (this.extend ({
                'symbol': market['id'],
                'orderId': parseInt (id),
                // 'origClientOrderId': id,
            }, params));
        } catch (e) {
            if (this.last_http_response.indexOf ('UNKNOWN_ORDER') >= 0)
                throw new OrderNotFound (this.id + ' cancelOrder() error: ' + this.last_http_response);
            throw e;
        }
        return response;
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchMyTrades requires a symbol');
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let response = await this.privateGetMyTrades (this.extend (request, params));
        return this.parseTrades (response, market);
    }

    commonCurrencyCode (currency) {
        if (currency == 'BCC')
            return 'BCH';
        return currency;
    }

    currencyId (currency) {
        if (currency == 'BCH')
            return 'BCC';
        return currency;
    }

    async withdraw (currency, amount, address, params = {}) {
        let response = await this.wapiPostWithdraw (this.extend ({
            'asset': this.currencyId (currency),
            'address': address,
            'amount': parseFloat (amount),
            'recvWindow': 10000000,
        }, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api != 'web')
            url += '/' + this.version;
        url += '/' + path;
        if (api == 'wapi')
            url += '.html';
        if ((api == 'private') || (api == 'wapi')) {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let query = this.urlencode (this.extend ({ 'timestamp': nonce }, params));
            let signature = undefined;
            if (api != 'wapi') {
                let auth = this.secret + '|' + query;
                signature = this.hash (this.encode (auth), 'sha256'); // v1
            } else {
                signature = this.hmac (this.encode (query), this.encode (this.secret)); // v3
            }
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method == 'GET') || (api == 'wapi')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('code' in response) {
            if (response['code'] < 0) {
                if (response['code'] == -2010)
                    throw new InsufficientFunds (this.id + ' ' + this.json (response));
                if (response['code'] == -2011)
                    throw new OrderNotFound (this.id + ' ' + this.json (response));
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
    }
}
