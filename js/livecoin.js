'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, NotSupported, InvalidOrder, OrderNotFound, ExchangeNotAvailable, DDoSProtection, InsufficientFunds } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class livecoin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'livecoin',
            'name': 'LiveCoin',
            'countries': [ 'US', 'UK', 'RU' ],
            'rateLimit': 1000,
            'userAgent': this.userAgents['chrome'],
            'has': {
                'fetchDepositAddress': true,
                'CORS': false,
                'fetchTickers': true,
                'fetchCurrencies': true,
                'fetchTradingFees': true,
                'fetchOrders': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': true,
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
            'commonCurrencies': {
                'BTCH': 'Bithash',
                'CPC': 'CapriCoin',
                'CRC': 'CryCash',
                'EDR': 'E-Dinar Coin', // conflicts with EDR for Endor Protocol and EDRCoin
                'eETT': 'EETT',
                'FirstBlood': '1ST',
                'FORTYTWO': '42',
                'ORE': 'Orectic',
                'RUR': 'RUB',
                'SCT': 'SpaceCoin',
                'TPI': 'ThaneCoin',
                'wETT': 'WETT',
                'XBT': 'Bricktox',
            },
            'exceptions': {
                '1': ExchangeError,
                '10': AuthenticationError,
                '100': ExchangeError, // invalid parameters
                '101': AuthenticationError,
                '102': AuthenticationError,
                '103': InvalidOrder, // invalid currency
                '104': InvalidOrder, // invalid amount
                '105': InvalidOrder, // unable to block funds
                '11': AuthenticationError,
                '12': AuthenticationError,
                '2': AuthenticationError, // "User not found"
                '20': AuthenticationError,
                '30': AuthenticationError,
                '31': NotSupported,
                '32': ExchangeError,
                '429': DDoSProtection,
                '503': ExchangeNotAvailable,
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
            let [ baseId, quoteId ] = symbol.split ('/');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
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
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
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
            let precision = 8; // default precision, todo: fix "magic constants"
            let active = (currency['walletStatus'] === 'normal');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'fee': currency['withdrawFee'], // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': currency['minOrderAmount'],
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': currency['minOrderAmount'],
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currency['minWithdrawAmount'],
                        'max': Math.pow (10, precision),
                    },
                    'deposit': {
                        'min': currency['minDepositAmount'],
                        'max': undefined,
                    },
                },
            };
        }
        result = this.appendFiatCurrencies (result);
        return result;
    }

    appendFiatCurrencies (result) {
        let precision = 8;
        let defaults = {
            'info': undefined,
            'active': true,
            'fee': undefined,
            'precision': precision,
            'limits': {
                'withdraw': { 'min': undefined, 'max': undefined },
                'deposit': { 'min': undefined, 'max': undefined },
                'amount': { 'min': undefined, 'max': undefined },
                'cost': { 'min': undefined, 'max': undefined },
                'price': {
                    'min': Math.pow (10, -precision),
                    'max': Math.pow (10, precision),
                },
            },
        };
        let currencies = [
            { 'id': 'USD', 'code': 'USD', 'name': 'US Dollar' },
            { 'id': 'EUR', 'code': 'EUR', 'name': 'Euro' },
            // { 'id': 'RUR', 'code': 'RUB', 'name': 'Russian ruble' },
        ];
        currencies.push ({
            'id': 'RUR',
            'code': this.commonCurrencyCode ('RUR'),
            'name': 'Russian ruble',
        });
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let code = currency['code'];
            result[code] = this.extend (defaults, currency);
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
            if (balance['type'] === 'total')
                account['total'] = parseFloat (balance['value']);
            if (balance['type'] === 'available')
                account['free'] = parseFloat (balance['value']);
            if (balance['type'] === 'trade')
                account['used'] = parseFloat (balance['value']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetExchangeCommissionCommonInfo (params);
        const commission = this.safeFloat (response, 'commission');
        return {
            'info': response,
            'maker': commission,
            'taker': commission,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'currencyPair': this.marketId (symbol),
            'groupByPrice': 'false',
        };
        if (typeof limit !== 'undefined')
            request['depth'] = limit; // 100
        let orderbook = await this.publicGetExchangeOrderBook (this.extend (request, params));
        let timestamp = orderbook['timestamp'];
        return this.parseOrderBook (orderbook, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let vwap = this.safeFloat (ticker, 'vwap');
        let baseVolume = this.safeFloat (ticker, 'volume');
        let quoteVolume = baseVolume * vwap;
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'best_ask'),
            'askVolume': undefined,
            'vwap': this.safeFloat (ticker, 'vwap'),
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
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

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'orderId': id,
        };
        let response = await this.privateGetExchangeOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            'OPEN': 'open',
            'PARTIALLY_FILLED': 'open',
            'EXECUTED': 'closed',
            'CANCELLED': 'canceled',
            'PARTIALLY_FILLED_AND_CANCELLED': 'canceled',
        };
        if (status in statuses)
            return statuses[status];
        return status;
    }

    parseOrder (order, market = undefined) {
        let timestamp = undefined;
        let datetime = undefined;
        if ('lastModificationTime' in order) {
            timestamp = this.safeString (order, 'lastModificationTime');
            if (typeof timestamp !== 'undefined') {
                if (timestamp.indexOf ('T') >= 0) {
                    timestamp = this.parse8601 (timestamp);
                } else {
                    timestamp = this.safeInteger (order, 'lastModificationTime');
                }
            }
        }
        if (timestamp) {
            datetime = this.iso8601 (timestamp);
        }
        // TODO currently not supported by livecoin
        // let trades = this.parseTrades (order['trades'], market, since, limit);
        let trades = undefined;
        let status = this.safeString (order, 'status');
        status = this.safeString (order, 'orderStatus', status);
        status = this.parseOrderStatus (status);
        let symbol = undefined;
        if (typeof market === 'undefined') {
            let marketId = this.safeString (order, 'currencyPair');
            marketId = this.safeString (order, 'symbol', marketId);
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
        }
        let type = undefined;
        let side = undefined;
        if ('type' in order) {
            let lowercaseType = order['type'].toLowerCase ();
            let orderType = lowercaseType.split ('_');
            type = orderType[0];
            side = orderType[1];
        }
        let price = this.safeFloat (order, 'price');
        // of the next two lines the latter overrides the former, if present in the order structure
        let remaining = this.safeFloat (order, 'remainingQuantity');
        remaining = this.safeFloat (order, 'remaining_quantity', remaining);
        let amount = this.safeFloat (order, 'quantity', remaining);
        let filled = undefined;
        if (typeof remaining !== 'undefined') {
            filled = amount - remaining;
        }
        let cost = undefined;
        if (typeof filled !== 'undefined' && typeof price !== 'undefined') {
            cost = filled * price;
        }
        const feeRate = this.safeFloat (order, 'commission_rate');
        let feeCost = undefined;
        if (typeof cost !== 'undefined' && typeof feeRate !== 'undefined') {
            feeCost = cost * feeRate;
        }
        let feeCurrency = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        }
        return {
            'info': order,
            'id': order['id'],
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': {
                'cost': feeCost,
                'currency': feeCurrency,
                'rate': feeRate,
            },
        };
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['currencyPair'] = market['id'];
        }
        if (typeof since !== 'undefined')
            request['issuedFrom'] = parseInt (since);
        if (typeof limit !== 'undefined')
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
        if (type === 'limit')
            order['price'] = this.priceToPrecision (symbol, price);
        let response = await this[method] (this.extend (order, params));
        const result = {
            'info': response,
            'id': response['orderId'].toString (),
        };
        const success = this.safeValue (response, 'success');
        if (success) {
            result['status'] = 'open';
        }
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (typeof symbol === 'undefined')
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
                    return {
                        'status': 'canceled',
                        'info': response,
                    };
                } else {
                    throw new OrderNotFound (message);
                }
            }
        }
        throw new ExchangeError (this.id + ' cancelOrder() failed: ' + this.json (response));
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        // Sometimes the response with be { key: null } for all keys.
        // An example is if you attempt to withdraw more than is allowed when withdrawal fees are considered.
        await this.loadMarkets ();
        this.checkAddress (address);
        let wallet = address;
        if (typeof tag !== 'undefined')
            wallet += '::' + tag;
        let withdrawal = {
            'amount': this.truncate (amount, this.currencies[currency]['precision']), // throws an error when amount is too precise
            'currency': this.commonCurrencyCode (currency),
            'wallet': wallet,
        };
        let response = await this.privatePostPaymentOutCoin (this.extend (withdrawal, params));
        let id = this.safeInteger (response, 'id');
        if (typeof id === 'undefined')
            throw new InsufficientFunds (this.id + ' insufficient funds to cover requested withdrawal amount post fees ' + this.json (response));
        return {
            'info': response,
            'id': id,
        };
    }

    async fetchDepositAddress (currency, params = {}) {
        let request = {
            'currency': currency,
        };
        let response = await this.privateGetPaymentGetAddress (this.extend (request, params));
        let address = this.safeString (response, 'wallet');
        let tag = undefined;
        if (address.indexOf (':') >= 0) {
            let parts = address.split (':');
            address = parts[0];
            tag = parts[2];
        }
        this.checkAddress (address);
        return {
            'currency': currency,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        let query = this.urlencode (this.keysort (params));
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + query;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'POST')
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
        if (typeof body !== 'string')
            return;
        if (body[0] === '{') {
            let response = JSON.parse (body);
            if (code >= 300) {
                let errorCode = this.safeString (response, 'errorCode');
                if (errorCode in this.exceptions) {
                    let ExceptionClass = this.exceptions[errorCode];
                    throw new ExceptionClass (this.id + ' ' + body);
                } else {
                    throw new ExchangeError (this.id + ' ' + body);
                }
            }
            // returns status code 200 even if success === false
            let success = this.safeValue (response, 'success', true);
            if (!success) {
                const message = this.safeString (response, 'message');
                if (typeof message !== 'undefined') {
                    if (message.indexOf ('Cannot find order') >= 0) {
                        throw new OrderNotFound (this.id + ' ' + body);
                    }
                }
                const exception = this.safeString (response, 'exception');
                if (typeof exception !== 'undefined') {
                    if (exception.indexOf ('Minimal amount is') >= 0) {
                        throw new InvalidOrder (this.id + ' ' + body);
                    }
                }
                throw new ExchangeError (this.id + ' ' + body);
            }
        }
    }
};
