'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, InsufficientFunds, OrderNotFound } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

// ---------------------------------------------------------------------------

module.exports = class dsx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dsx',
            'name': 'DSX',
            'countries': [ 'UK' ],
            'rateLimit': 100,
            'has': {
                'CORS': false,
                'cancelOrder': true,
                'createLimitOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchL2OrderBook': true,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTrades': false,
                'fetchMyTrades': true,
                'fetchDepositAddress': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/76909626-cb2bb100-68bc-11ea-99e0-28ba54f04792.jpg',
                'api': {
                    'public': 'https://api.dsxglobal.com/api/2/public',
                    'private': 'https://api.dsxglobal.com/api/2',
                },
                'www': 'http://dsxglobal.com',
                'doc': [
                    'https://api.dsxglobal.com',
                ],
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.15 / 100,
                    'taker': 0.25 / 100,
                },
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '1w': 'D7',
                '1M': '1M',
            },
            'api': {
                // market data (public)
                'public': {
                    'get': [
                        'currency',
                        'currency/{currency}',
                        'symbol',
                        'symbol/{symbol}',
                        'ticker',
                        'ticker/{symbol}',
                        'trades',
                        'trades/{symbol}',
                        'orderbook',
                        'orderbook/{symbol}',
                        'candles',
                        'candles/{symbol}',
                    ],
                },
                // trading (private)
                'private': {
                    'get': [
                        'trading/balance',
                        'account/balance',
                        'account/crypto/address/{currency}',
                        'account/crypto/is-mine/{address}',
                        'account/transactions',
                        'account/transactions/{id}',
                        'sub-acc​/balance​/{subAccountUserID}',
                        'sub-acc',
                        'sub-acc​/acl',
                        'trading/fee/{symbol}',
                        'history/order',
                        'history/trades',
                        'history/order/{orderId}/trades',
                        'order',
                        'order/{clientOrderId}',
                    ],
                    'post': [
                        'order',
                        'account/crypto/address/{currency}',
                        'account/crypto/withdraw',
                        'account/crypto/transfer-convert',
                        'account/transfer',
                        'sub-acc​/freeze',
                        'sub-acc​/activate',
                        'sub-acc​/transfer',
                    ],
                    'put': [
                        'order/{clientOrderId}',
                        'account/crypto/withdraw/{id}',
                        'sub-acc​/acl​/{subAccountUserId}',
                    ],
                    'delete': [
                        'order',
                        'order/{clientOrderId}',
                        'account/crypto/withdraw/{id}',
                    ],
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'Insufficient funds': InsufficientFunds,
                    'Symbol not found': BadRequest,
                    'Price not a valid number': BadRequest,
                    'Quantity too low': BadRequest,
                    'Order not found': OrderNotFound,
                    'Validation error': OrderNotFound,
                },
                'broad': {
                },
            },
            'options': {
                'fetchTickersMaxLength': 250,
            },
            'commonCurrencies': {
                'DSH': 'DASH',
            },
        });
    }

    async fetchCurrenciesFromCache (params = {}) {
        const options = this.safeValue (this.options, 'fetchCurrencies', {});
        const timestamp = this.safeInteger (options, 'timestamp');
        const expires = this.safeInteger (options, 'expires', 1000);
        const now = this.milliseconds ();
        if ((timestamp === undefined) || ((now - timestamp) > expires)) {
            const currencies = await this.publicGetCurrency (params);
            this.options['fetchCurrencies'] = this.extend (options, {
                'currencies': currencies,
                'timestamp': now,
            });
        }
        return this.safeValue (this.options, 'fetchCurrencies', {});
    }

    async fetchCurrencies (params = {}) {
        const response = await this.fetchCurrenciesFromCache (params);
        const currencies = this.safeValue (response, 'currencies', {});
        //   [ { id: 'BCH',
        //     fullName: 'Bitcoin Cash',
        //     crypto: true,
        //     payinEnabled: true,
        //     payinPaymentId: false,
        //     payinConfirmations: 2,
        //     payoutEnabled: true,
        //     payoutIsPaymentId: false,
        //     transferEnabled: true,
        //     delisted: false,
        //     payoutFee: '0.000500000000' }, ...
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const name = this.safeString (currency, 'fullName');
            const code = this.safeCurrencyCode (id, name);
            const transferEnabled = currency['transferEnabled'];
            const delisted = currency['delisted'];
            // payoutEnabled means that API support withdrawals in thsi currency
            const active = !delisted && transferEnabled;
            const fee = this.safeFloat (currency, 'payoutFee');
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': active,
                'fee': fee,
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetSymbol (params);
        //
        //     [
        //         {
        //             "id":"BTCUSDT",
        //             "baseCurrency":"BTC",
        //             "quoteCurrency":"USDT",
        //             "quantityIncrement":"0.00001",
        //             "tickSize":"0.01",
        //             "takeLiquidityRate":"0.0025",
        //             "provideLiquidityRate":"0.0015",
        //             "feeCurrency":"USDT"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const maker = this.safeFloat (market, 'provideLiquidityRate');
            const taker = this.safeFloat (market, 'takeLiquidityRate');
            const precision = {
                'price': this.safeFloat (market, 'tickSize'),
                'amount': this.safeFloat (market, 'quantityIncrement'),
            };
            const active = undefined;
            const lowercaseBaseId = this.safeStringLower (market, 'baseCurrency');
            const lowercaseQuoteId = this.safeStringLower (market, 'quoteCurrency');
            const lowercaseId = lowercaseBaseId + lowercaseQuoteId;
            result.push ({
                'id': id,
                // https://github.com/ccxt/ccxt/pull/5786
                'lowercaseId': lowercaseId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'maker': maker,
                'taker': taker,
                // 'feeCurrency': this.safeString (market, 'feeCurrency'),
                'active': active,
                'precision': precision,
                'info': market,
            });
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetTicker (params);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const id = this.safeString (ticker, 'symbol');
            const market = this.markets_by_id[id];
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //   { symbol: 'BSVUSD',
        //     ask: '100000.000',
        //     bid: '0.207',
        //     last: null,
        //     open: null,
        //     low: '0',
        //     high: '0',
        //     volume: '0',
        //     volumeQuote: '0',
        //     timestamp: '2020-03-27T10:31:08.583Z' }
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        const symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'volumeQuote'),
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        // the API docs are wrong - all orderbooks get returned if no symbol is present so we can implement fetchOrderbooks using publicGetOrderbook()
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const orderbook = await this.publicGetOrderbookSymbol (this.extend (request, params));
        const timestamp = this.parse8601 (this.safeString (orderbook, 'timestamp'));
        return this.parseOrderBook (orderbook, timestamp, 'bid', 'ask', 'price', 'size');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        return [
            this.parse8601 (this.safeString (ohlcv, 'timestamp')),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'max'),
            this.safeFloat (ohlcv, 'min'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetCandlesSymbol (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const type = this.safeString (params, 'type', 'trading');
        const method = 'privateGet' + this.capitalize (type) + 'Balance';
        const query = this.omit (params, 'type');
        const response = await this[method] (query);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'reserved');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetAccountCryptoAddressCurrency (this.extend (request, params));
        // xrp ->  {"address":"rwpMsdkfjskdjf","paymentId":"1483475384577"}
        return {
            'currency': code,
            'address': this.safeString (response, 'address'),
            'tag': this.safeString (response, '1444344687'),
            'info': response,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAccountTransactions (this.extend (request, params));
        return this.parseTransactions (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'side': side,
            'quantity': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'clientOrderId': id,
        };
        const response = await this.privateDeleteOrderClientOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrders (response);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'clientOrderId': id,
        };
        const response = await this.privateGetHistoryOrder (this.extend (request, params));
        return this.parseOrders (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        const response = await this.privateGetHistoryOrder (this.extend (request, params));
        return this.parseOrders (response);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        const response = await this.privateGetHistoryTrades (this.extend (request, params));
        return this.parseTrades (response);
    }

    parseTrade (trade, market = undefined) {
        //   { id: 809014577,
        //     clientOrderId: '2c7d66b38a095603797b8b260ffa5f33',
        //     orderId: 226958186479,
        //     symbol: 'ETHBTC',
        //     side: 'sell',
        //     quantity: '0.1000',
        //     price: '0.020504',
        //     fee: '0.000005126000',
        //     timestamp: '2020-03-27T15:48:00.315Z' }
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        market = this.parseMarket (this.safeString (trade, 'symbol'));
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'quantity');
        return {
            'id': this.safeString (trade, 'id'),
            'order': this.safeString (trade, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': {
                'cost': this.safeFloat (trade, 'fee'),
                'currency': this.safeString (market, 'feeCurrency'),
            },
            'info': trade,
        };
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
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
            'cost': cost,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'new': 'open',
            'suspended': 'open',
            'partiallyFilled': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
            'expired': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseMarket (id) {
        if (id in this.markets_by_id) {
            return this.markets_by_id[id];
        } else {
            // the following is a fix for
            // https://github.com/ccxt/ccxt/pull/5786
            // https://github.com/ccxt/ccxt/issues/5770
            let markets_by_other_id = this.safeValue (this.options, 'markets_by_other_id');
            if (markets_by_other_id === undefined) {
                this.options['markets_by_other_id'] = this.indexBy (this.markets, 'otherId');
                markets_by_other_id = this.options['markets_by_other_id'];
            }
            if (id in markets_by_other_id) {
                return markets_by_other_id[id];
            }
        }
        return undefined;
    }

    parseOrder (order, market = undefined) {
        //   cancelOrder response
        //   { id: 226952257529,
        //     clientOrderId: '2241bed127c1756240641b6159a05d33',
        //     symbol: 'ETHBTC',
        //     side: 'sell',
        //     status: 'new',
        //     type: 'limit',
        //     timeInForce: 'GTC',
        //     price: '1.000000',
        //     quantity: '0.1000',
        //     postOnly: false,
        //     cumQuantity: '0',
        //     createdAt: '2020-03-27T15:20:41.427Z',
        //     updatedAt: '2020-03-27T15:20:41.427Z' }
        //
        const id = this.safeString (order, 'clientOrderId');
        const clientOrderId = id;
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timestamp = this.parse8601 (this.safeString (order, 'createdAt'));
        const marketId = this.safeString (order, 'symbol');
        market = this.parseMarket (marketId);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const filled = this.safeFloat (order, 'cumQuantity');
        const amount = this.safeFloat (order, 'quantity');
        const price = this.safeFloat (order, 'price');
        const remaining = amount - filled;
        const orderType = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        return {
            'id': id,
            'clientOrderId': clientOrderId,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': orderType,
            'side': side,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': undefined,
            'trades': undefined,
            'average': undefined,
            'info': order,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'created': 'pending',
            'pending': 'pending',
            'failed': 'failed',
            'success': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (status) {
        // bankToExchange and exchangeToBank are internal movements
        const statuses = {
            'payout': 'withdrawal',
            'payin': 'deposit',
            'deposit': 'deposit',
            'withdraw': 'withdrawal',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //   {
        //     "id": "73443ee9f54c",
        //     "fee": "0.001",
        //     "hash": "3f077268b8dda69",
        //     "type": "payout",
        //     "index": 5430881244,
        //     "amount": "6.999000000000000000000000",
        //     "status": "success",
        //     "address": "L45PsQU7VoqaNa5G336Z68umhG",
        //     "currency": "LTC",
        //     "createdAt": "2020-05-15T20:39:47.140Z",
        //     "updatedAt": "2020-05-15T21:34:58.887Z",
        //     "confirmations": 5
        //   }
        const id = this.safeString (transaction, 'id');
        const timestamp = this.parse8601 (this.safeString (transaction, 'createdAt'));
        const updated = this.parse8601 (this.safeString (transaction, 'updatedAt'));
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const amount = this.safeFloat (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const txid = this.safeString (transaction, 'hash');
        let fee = undefined;
        const feeCost = this.safeFloat (transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        const type = this.parseTransactionType (this.safeString (transaction, 'type'));
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        url += '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            const auth = this.apiKey + ':' + this.secret;
            headers = {
                'Authorization': 'Basic ' + this.stringToBase64 (auth),
            };
            if (method === 'POST' || method === 'PUT') {
                if (Object.keys (query).length) {
                    headers['Content-Type'] = 'application/json';
                    body = this.json (query);
                }
            } else if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('error' in response) {
            // {"error":{"code":20001,"message":"Insufficient funds","description":"Check that the funds are sufficient, given commissions"}}
            const error = response['error'];
            const code = this.safeString (error, 'code');
            const message = this.safeString (error, 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
