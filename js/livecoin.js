"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, AuthenticationError, NotSupported, InvalidOrder, OrderNotFound } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class livecoin extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'livecoin',
            'name': 'LiveCoin',
            'countries': [ 'US', 'UK', 'RU' ],
            'rateLimit': 1000,
            'hasCORS': false,
            // obsolete metainfo interface
            'hasFetchTickers': true,
            'hasFetchCurrencies': true,
            // new metainfo interface
            'has': {
                'fetchTickers': true,
                'fetchCurrencies': true,
            },
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
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.18 / 100,
                    'taker': 0.18 / 100,
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
            let coinRestrictions = this.safeValue (restrictionsById, symbol);
            let precision = {
                'price': 5,
                'amount': 8,
                'cost': 8,
            };
            let limits = {
                'amount': {
                    'min': Math.pow (10, -precision['amount']),
                    'max': Math.pow (10, precision['amount']),
                },
            };
            if (coinRestrictions) {
                precision['price'] = this.safeInteger (coinRestrictions, 'priceScale', 5);
                limits['amount']['min'] = this.safeFloat (coinRestrictions, 'minLimitQuantity', limits['amount']['min']);
            }
            limits['price'] = {
                'min': Math.pow (10, -precision['price']),
                'max': Math.pow (10, precision['price']),
            };
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'precision': precision,
                'limits': limits,
                'info': market,
            }));
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetInfoCoinInfo (params);
        let currencies = response['info'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['symbol'];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            let code = this.commonCurrencyCode (id);
            let precision = {
                'amount': 8, // default precision, todo: fix "magic constants"
                'price': 5,
            };
            let active = (currency['walletStatus'] == 'normal');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'status': 'ok',
                'fee': currency['withdrawFee'], // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': currency['minOrderAmount'],
                        'max': Math.pow (10, precision['amount']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': Math.pow (10, precision['price']),
                    },
                    'cost': {
                        'min': currency['minOrderAmount'],
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currency['minWithdrawAmount'],
                        'max': Math.pow (10, precision['amount']),
                    },
                    'deposit': {
                        'min': currency['minDepostAmount'],
                        'max': undefined,
                    },
                },
            };
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
            'quantity': this.amountToPrecision (symbol, amount),
            'currencyPair': market['id'],
        };
        if (type == 'limit')
            order['price'] = this.priceToPrecision (symbol, price);
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
        let currencyPair = market['id'];
        let response = await this.privatePostExchangeCancellimit (this.extend ({
            'orderId': id,
            'currencyPair': currencyPair,
        }, params));
        let message = this.safeString (response, 'message', this.json (response));
        if ('success' in response) {
            if (!response['success']) {
                throw new InvalidOrder (message);
            } else if ('cancelled' in response) {
                if (response['cancelled']) {
                    return response;
                } else {
                    throw new OrderNotFound (message);
                }
            }
        }
        throw new ExchangeError (this.id + ' cancelOrder() failed: ' + this.json (response));
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

    handleErrors (code, reason, url, method, headers, body) {
        if (code >= 300) {
            if (body[0] == "{") {
                let response = JSON.parse (body);
                if ('errorCode' in response) {
                    let error = response['errorCode'];
                    if (error == 1) {
                        throw new ExchangeError (this.id + ' ' + this.json (response));
                    } else if (error == 2) {
                        if ('errorMessage' in response) {
                            if (response['errorMessage'] == 'User not found')
                                throw new AuthenticationError (this.id + ' ' + response['errorMessage']);
                        } else {
                            throw new ExchangeError (this.id + ' ' + this.json (response));
                        }
                    } else if ((error == 10) || (error == 11) || (error == 12) || (error == 20) || (error == 30) || (error == 101) || (error == 102)) {
                        throw new AuthenticationError (this.id + ' ' + this.json (response));
                    } else if (error == 31) {
                        throw new NotSupported (this.id + ' ' + this.json (response));
                    } else if (error == 32) {
                        throw new ExchangeError (this.id + ' ' + this.json (response));
                    } else if (error == 100) {
                        throw new ExchangeError (this.id + ': Invalid parameters ' + this.json (response));
                    } else if (error == 103) {
                        throw new InvalidOrder (this.id + ': Invalid currency ' + this.json (response));
                    } else if (error == 104) {
                        throw new InvalidOrder (this.id + ': Invalid amount ' + this.json (response));
                    } else if (error == 105) {
                        throw new InvalidOrder (this.id + ': Unable to block funds ' + this.json (response));
                    } else {
                        throw new ExchangeError (this.id + ' ' + this.json (response));
                    }
                }
            }
            throw new ExchangeError (this.id + ' ' + body);
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response) {
            if (!response['success']) {
                throw new ExchangeError (this.id + ' error: ' + this.json (response));
            }
        }
        return response;
    }
}
