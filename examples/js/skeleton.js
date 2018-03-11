'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class binance extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'exchange',
            'name': 'Exchange',
            'countries': [ 'US', 'EU' ],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchBidsAsks': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'fetchMyTrades': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '1h': '1h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api': {
                    'public': 'https://api.example.com/public',
                    'private': 'https://api.example.com/private',
                },
                'www': 'https://www.example.com',
                'doc': 'https://doc.example.com',
            },
            'api': {
                'public': {
                    'get': [
                        'exchangeInfo',
                        'ping',
                        'time',
                        'depth',
                        'aggTrades',
                        'klines',
                        'ticker/24hr',
                        'ticker/allPrices',
                        'ticker/allBookTickers',
                        'ticker/price',
                        'ticker/bookTicker',
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
                    ],
                    'delete': [
                        'order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.001,
                        'ETH': 0.01,
                    },
                    'deposit': {},
                },
            },
            // exchange-specific options
            'options': {
                'foo': 'bar',
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetExchangeInfo ();
        let markets = response['symbols'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['symbol'];
            // "123456" is a "test symbol/market"
            if (id === '123456')
                continue;
            let baseId = market['baseAsset'];
            let quoteId = market['quoteAsset'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': market['baseAssetPrecision'],
                'price': market['quotePrecision'],
            };
            let active = (market['status'] === 'TRADING');
            let entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': lot,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
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
            let currency = balance['asset'];
            if (currency in this.currencies_by_id)
                currency = this.currencies_by_id[currency]['code'];
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (typeof limit !== 'undefined')
            request['limit'] = limit; // default = maximum = 100
        let orderbook = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeInteger (ticker, 'closeTime');
        if (typeof timestamp === 'undefined')
            timestamp = this.milliseconds ();
        let symbol = this.findSymbol (this.safeString (ticker, 'symbol'), market);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': this.safeFloat (ticker, 'bidVolume'),
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': this.safeFloat (ticker, 'askVolume'),
            'vwap': this.safeFloat (ticker, 'vwap'),
            'open': this.safeFloat (ticker, 'open'),
            'close': this.safeFloat (ticker, 'close'),
            'first': undefined,
            'last': this.safeFloat (ticker, 'lastPrice'),
            'change': this.safeFloat (ticker, 'priceChange'),
            'percentage': this.safeFloat (ticker, 'priceChangePercentage'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volumeInBaseCurrency'),
            'quoteVolume': this.safeFloat (ticker, 'volumeInQuoteCurrency'),
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

    parseTickers (rawTickers, symbols = undefined) {
        let tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let rawTickers = await this.publicGetTicker24hr (params);
        return this.parseTickers (rawTickers, symbols);
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

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 500, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
            'limit': limit, // default == max == 500
        };
        if (typeof since !== 'undefined')
            request['startTime'] = since;
        let response = await this.publicGetKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market) {
        let timestamp = parseInt (parseFloat (trade['timestamp'])) * 1000;
        let side = trade['type'].toLowerCase ();
        let orderId = this.safeString (trade, 'order_id');
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['amount']);
        let cost = price * amount;
        let fee = undefined;
        if ('fee_amount' in trade) {
            let feeCost = this.safeFloat (trade, 'fee_amount');
            let feeCurrency = this.safeString (trade, 'fee_currency');
            if (feeCurrency in this.currencies_by_id)
                feeCurrency = this.currencies_by_id[feeCurrency]['code'];
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'order': orderId,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 500, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'limit': limit, // default = maximum = 500
        };
        if (typeof since !== 'undefined')
            request['startTime'] = since;
        let response = await this.publicGetAggTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrderStatus (status) {
        let statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
        };
        if (status in statuses)
            return statuses[status];
        return status;
    }

    parseOrder (order, market = undefined) {
        let status = this.safeValue (order, 'status');
        if (typeof status !== 'undefined')
            status = this.parseOrderStatus (status);
        let symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
        let timestamp = order['time'];
        let price = parseFloat (order['price']);
        let amount = parseFloat (order['origQty']);
        let filled = this.safeFloat (order, 'executedQty', 0.0);
        let remaining = Math.max (amount - filled, 0.0);
        let cost = undefined;
        if (typeof price !== 'undefined')
            if (typeof filled !== 'undefined')
                cost = price * filled;
        let result = {
            'info': order,
            'id': order['orderId'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': order['type'].toLowerCase (), // "limit" or "market"
            'side': order['side'].toLowerCase (), // "buy" or "sell"
            'price': price,
            'amount': amount,
            'cost': cost,
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
            'quantity': this.amountToString (symbol, amount),
            'type': type.toUpperCase (),
            'side': side.toUpperCase (),
        };
        if (type === 'limit') {
            order = this.extend (order, {
                'price': this.priceToPrecision (symbol, price),
                // 'timeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel, 'FOK' = Fill Or Kill
            });
        }
        let response = await this.privatePostOrder (this.extend (order, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' cancelOrder requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateDeleteOrder (this.extend ({
            'symbol': market['id'],
            'orderId': parseInt (id),
        }, params));
        return response;
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
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (typeof since !== 'undefined')
            request['since'] = parseInt (since / 1000);
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let response = await this.privateGetAllOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let response = await this.privateGetOpenOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let response = await this.privateGetMyTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    commonCurrencyCode (currency) {
        const currencies = {
            'YOYO': 'YOYOW',
            'BCC': 'BCH',
            'NANO': 'XRB',
        };
        if (currency in currencies)
            return currencies[currency];
        return currency;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.wapiGetDepositAddress (this.extend ({
            'asset': currency['id'],
        }, params));
        if ('success' in response) {
            if (response['success']) {
                let address = this.safeString (response, 'address');
                let tag = this.safeString (response, 'addressTag');
                return {
                    'currency': code,
                    'address': address,
                    'tag': tag,
                    'status': 'ok',
                    'info': response,
                };
            }
        }
        throw new ExchangeError (this.id + ' fetchDepositAddress failed: ' + this.last_http_response);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        let currency = this.currency (code);
        let name = address.slice (0, 20);
        let request = {
            'asset': currency['id'],
            'address': address,
            'amount': parseFloat (amount),
            'name': name,
        };
        if (tag)
            request['addressTag'] = tag;
        let response = await this.wapiPostWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'id'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        url += '/' + path;
        if (api === 'wapi')
            url += '.html';
        // v1 special case for userDataStream
        if (path === 'userDataStream') {
            body = this.urlencode (params);
            headers = {
                'X-MBX-APIKEY': this.apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        } else if ((api === 'private') || (api === 'wapi')) {
            this.checkRequiredCredentials ();
            let query = this.urlencode (this.extend ({
                'timestamp': this.milliseconds (),
                'recvWindow': this.options['recvWindow'],
            }, params));
            let signature = this.hmac (this.encode (query), this.encode (this.secret));
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (api === 'wapi')) {
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

    handleErrors (code, reason, url, method, headers, body) {
        if (code >= 400) {
            if ((code === 418) || (code === 429))
                throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
            if (body.indexOf ('Price * QTY is zero or less') >= 0)
                throw new InvalidOrder (this.id + ' order cost = amount * price is zero or less ' + body);
            if (body.indexOf ('MIN_NOTIONAL') >= 0)
                throw new InvalidOrder (this.id + ' order cost = amount * price is too small ' + body);
            if (body.indexOf ('LOT_SIZE') >= 0)
                throw new InvalidOrder (this.id + ' order amount should be evenly divisible by lot size, use this.amountToLots (symbol, amount) ' + body);
            if (body.indexOf ('PRICE_FILTER') >= 0)
                throw new InvalidOrder (this.id + ' order price exceeds allowed price precision or invalid, use this.priceToPrecision (symbol, amount) ' + body);
            if (body.indexOf ('Order does not exist') >= 0)
                throw new OrderNotFound (this.id + ' ' + body);
        }
        if (typeof body === 'string') {
            if (body.length > 0) {
                if (body[0] === '{') {
                    let response = JSON.parse (body);
                    let error = this.safeValue (response, 'code');
                    if (typeof error !== 'undefined') {
                        if (error === -2010) {
                            throw new InsufficientFunds (this.id + ' ' + this.json (response));
                        } else if (error === -2011) {
                            throw new OrderNotFound (this.id + ' ' + this.json (response));
                        } else if (error === -1013) { // Invalid quantity
                            throw new InvalidOrder (this.id + ' ' + this.json (response));
                        }
                    }
                }
            }
        }
    }
};
