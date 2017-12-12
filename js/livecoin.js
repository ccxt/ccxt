"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class livecoin extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'livecoin',
            'name': 'LiveCoin',
            'countries': [ 'US', 'UK', 'RU' ],
            'rateLimit': 1000,
            'hasCORS': false,
            'hasFetchTickers': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27980768-f22fc424-638a-11e7-89c9-6010a54ff9be.jpg',
                'api': 'https://api.livecoin.net',
                'www': 'https://www.livecoin.net',
                'doc': 'https://www.livecoin.net/api?lang=en',
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/all/order_book',
                        'exchange/last_trades',
                        'exchange/maxbid_minask',
                        'exchange/order_book',
                        'exchange/restrictions',
                        'exchange/ticker', // omit params to get all tickers at once
                        'info/coinInfo',
                    ],
                },
                'private': {
                    'get': [
                        'exchange/client_orders',
                        'exchange/order',
                        'exchange/trades',
                        'exchange/commission',
                        'exchange/commissionCommonInfo',
                        'payment/balances',
                        'payment/balance',
                        'payment/get/address',
                        'payment/history/size',
                        'payment/history/transactions',
                    ],
                    'post': [
                        'exchange/buylimit',
                        'exchange/buymarket',
                        'exchange/cancellimit',
                        'exchange/selllimit',
                        'exchange/sellmarket',
                        'payment/out/capitalist',
                        'payment/out/card',
                        'payment/out/coin',
                        'payment/out/okpay',
                        'payment/out/payeer',
                        'payment/out/perfectmoney',
                        'payment/voucher/amount',
                        'payment/voucher/make',
                        'payment/voucher/redeem',
                    ],
                },
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetExchangeTicker ();
        let restrictions = await this.publicGetExchangeRestrictions ();
        let restrictionsById = this.indexBy (restrictions['restrictions'], 'currencyPair');
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['symbol'];
            let symbol = id;
            let [ base, quote ] = symbol.split ('/');
            let commission = 0.18 / 100;
            let coinRestrictions = this.safeValue (restrictionsById, symbol);
            let pricePrecision = undefined;
            let amountMin = undefined;
            if (coinRestrictions) {
                let pricePrecision = this.safeInteger (coinRestrictions, 'priceScale', 5);
                let amountMin = this.safeFloat (coinRestrictions, 'minLimitQuantity', 0.00000001);
                amountMin *= (1 + commission);
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'precision': {
                    'price': pricePrecision,
                    'amount': 8,
                    'cost': 8,
                },
                'limits': {
                    'amount': {
                        'min': amountMin,
                        'max': 1000000000,
                    },
                    'price': {
                        'min': 0.00000001,
                        'max': 1000000000,
                    },
                },
                'maker': commission,
                'taker': commission,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetPaymentBalances ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let account = undefined;
            if (currency in result)
                account = result[currency];
            else
                account = this.account ();
            if (balance['type'] == 'total')
                account['total'] = parseFloat (balance['value']);
            if (balance['type'] == 'available')
                account['free'] = parseFloat (balance['value']);
            if (balance['type'] == 'trade')
                account['used'] = parseFloat (balance['value']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchFees (params = {}) {
        await this.loadMarkets ();
        let commissionInfo = await this.privateGetExchangeCommissionCommonInfo ();
        let commission = this.safeFloat (commissionInfo, 'commission');
        return {
            'info': commissionInfo,
            'maker': commission,
            'taker': commission,
            'withdraw': 0.0,
        };
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetExchangeOrderBook (this.extend ({
            'currencyPair': this.marketId (symbol),
            'groupByPrice': 'false',
            'depth': 100,
        }, params));
        let timestamp = orderbook['timestamp'];
        return this.parseOrderBook (orderbook, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let vwap = parseFloat (ticker['vwap']);
        let baseVolume = parseFloat (ticker['volume']);
        let quoteVolume = baseVolume * vwap;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['best_bid']),
            'ask': parseFloat (ticker['best_ask']),
            'vwap': parseFloat (ticker['vwap']),
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetExchangeTicker (params);
        let tickers = this.indexBy (response, 'symbol');
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetExchangeTicker (this.extend ({
            'currencyPair': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        let timestamp = trade['time'] * 1000;
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': trade['id'].toString (),
            'order': undefined,
            'type': undefined,
            'side': trade['type'].toLowerCase (),
            'price': trade['price'],
            'amount': trade['quantity'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetExchangeLastTrades (this.extend ({
            'currencyPair': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        let timestamp = this.safeInteger (order, 'lastModificationTime');
        if (!timestamp)
            timestamp = this.parse8601 (order['lastModificationTime']);
        let trades = undefined;
        if ('trades' in order)
            // TODO currently not supported by livecoin
            // trades = this.parseTrades (order['trades'], market, since, limit);
            trades = undefined;
        let status = undefined;
        if (order['orderStatus'] == 'OPEN' || order['orderStatus'] == 'PARTIALLY_FILLED') {
            status = 'open';
        } else if (order['orderStatus'] == 'EXECUTED' || order['orderStatus'] == 'PARTIALLY_FILLED_AND_CANCELLED') {
            status = 'closed';
        } else {
            status = 'canceled';
        }
        let symbol = order['currencyPair'];
        let [ base, quote ] = symbol.split ('/');
        let type = undefined;
        let side = undefined;
        if (order['type'].indexOf ('MARKET') >= 0) {
            type = 'market';
        } else {
            type = 'limit';
        }
        if (order['type'].indexOf ('SELL') >= 0) {
            side = 'sell';
        } else {
            side = 'buy';
        }
        let price = this.safeFloat (order, 'price', 0.0);
        let cost = this.safeFloat (order, 'commissionByTrade', 0.0);
        let remaining = this.safeFloat (order, 'remainingQuantity', 0.0);
        let amount = this.safeFloat (order, 'quantity', remaining);
        let filled = amount - remaining;
        return {
            'info': order,
            'id': order['id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': {
                'cost': cost,
                'currency': quote,
            },
        };
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol)
            market = this.market (symbol);
        let pair = market ? market['id'] : undefined;
        let request = {};
        if (pair)
            request['currencyPair'] = pair;
        if (since)
            request['issuedFrom'] = parseInt (since);
        if (limit)
            request['endRow'] = limit - 1;
        let response = await this.privateGetExchangeClientOrders (this.extend (request, params));
        let result = [];
        let rawOrders = [];
        if (response['data'])
            rawOrders = response['data'];
        for (let i = 0; i < rawOrders.length; i++) {
            let order = rawOrders[i];
            result.push (this.parseOrder (order, market));
        }
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let result = await this.fetchOrders (symbol, since, limit, this.extend ({
            'openClosed': 'OPEN',
        }, params));
        return result;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let result = await this.fetchOrders (symbol, since, limit, this.extend ({
            'openClosed': 'CLOSED',
        }, params));
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePostExchange' + this.capitalize (side) + type;
        let market = this.market (symbol);
        let order = {
            'quantity': amount,
            'currencyPair': market['id'],
        };
        if (type == 'limit')
            order['price'] = price;
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['orderId'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' cancelOrder requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        return await this.privatePostExchangeCancellimit (this.extend ({
            'orderId': id,
            'currencyPair': market['id'],
        }, params));
    }

    async fetchDepositAddress (currency, params = {}) {
        let request = {
            'currency': currency,
        };
        let response = await this.privateGetPaymentGetAddress (this.extend (request, params));
        let address = this.safeString (response, 'wallet');
        return {
            'currency': currency,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        let query = this.urlencode (this.keysort (params));
        if (method == 'GET') {
            if (Object.keys (params).length) {
                url += '?' + query;
            }
        }
        if (api == 'private') {
            this.checkRequiredCredentials ();
            if (method == 'POST')
                body = query;
            let signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha256');
            headers = {
                'Api-Key': this.apiKey,
                'Sign': signature.toUpperCase (),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response)
            if (!response['success'])
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
}
