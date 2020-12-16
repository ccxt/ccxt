'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { sortBy } = require ('./base/functions');
const { ArgumentsRequired, ExchangeNotAvailable, OrderNotFound, NotSupported, BadRequest, AuthenticationError, RateLimitExceeded } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class xcalibra extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'xcalibra',
            'name': 'Xcalibra',
            'countries': [ 'BVI' ],
            'version': 'v1',
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchOHLCV': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchMyTrades': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'minute',
                '5m': 'minutes_5',
                '15m': 'minutes_15',
                '30m': 'minutes_30',
                '1h': 'hour',
                '1d': 'day',
                '1w': 'week',
            },
            'options': {
                // cannot withdraw/deposit these
                'inactiveCurrencies': [ 'RSD' ],
            },
            'exceptions': {
                'exact': {
                    'OrderNotFoundError': OrderNotFound,
                    '400': BadRequest,
                    '401': AuthenticationError,
                    '403': NotSupported,
                    '404': NotSupported,
                    '405': NotSupported,
                    '429': RateLimitExceeded,
                    '500': ExchangeNotAvailable,
                    '503': ExchangeNotAvailable,
                },
            },
            'urls': {
                'logo': 'https://api-docs.xcalibra.com/logo.6f814a24.png',
                'api': {
                    'public': 'https://app.xcalibra.com/api/public',
                    'private': 'https://app.xcalibra.com/api/private',
                },
                'www': 'https://xcalibra.com',
                'doc': 'https://api-docs.xcalibra.com',
                'fees': 'https://xcalibra.com/status',
            },
            'api': {
                'public': {
                    'get': [
                        'status',
                        'instruments',
                        'tickers',
                        'tickers/{pair}',
                        'order-book/{pair}',
                        'trade-history/{pair}',
                        'price-history/{pair}',
                        'pairs',
                    ],
                },
                'private': {
                    'get': [
                        'wallet',
                        'trades/{ts}',
                        'trades/history',
                        'orders/for-pair/{pair}',
                        'orders/{oid}',
                        'withdrawals',
                        'deposits',
                    ],
                    'post': [
                        'orders',
                        'withdrawals',
                    ],
                    'delete': [
                        'orders/{oid}',
                        'withdrawals/{wid}',
                    ],
                },
            },
        });
    }

    async fetchStatus (params = {}) {
        const response = await this.publicGetStatus (params);
        //   {
        //     "state": "running",
        //     "name": "xcalibra-backend",
        //     "version": "1.15.0",
        //     "artifact": "1.15.0-1606927512"
        //   }
        let status = this.safeString (response, 'state');
        if (status !== undefined) {
            status = (status === 'running') ? 'ok' : 'maintenance';
            this.status = this.extend (this.status, {
                'status': status,
                'updated': this.milliseconds (),
            });
        }
        return this.status;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetPairs (params);
        const pairs = Object.keys (response);
        const result = [];
        for (let i = 0; i < pairs.length; i++) {
            const market = this.safeValue (response, pairs[i]);
            const id = this.safeString (market, 'pair');
            const [ quoteId, baseId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const symbol = quote + '/' + base;
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'min_order'),
                },
            };
            const disabled = this.safeValue (market, 'disable_orders');
            const precision = {
                'amount': market['quote_decimals'],
                'price': market['base_decimals'],
            };
            result.push (this.extend ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'limits': limits,
                'precision': precision,
                'active': !disabled,
            }));
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetInstruments (params);
        const currencies = response;
        const ids = Object.keys (currencies);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = currencies[id];
            const active = !currency.disable_deposits && !currency.disable_withdrawals;
            result[id] = {
                'id': id,
                'info': currency,
                'name': currency.name,
                'active': active,
                'fee': currency.withdrawal_fee_abs,
                'limits': {
                    'withdraw': {
                        'min': currency.min_withdrawal,
                    },
                },
            };
        }
        return result;
    }

    parseOHLCV (ohlcv) {
        //
        //     {
        //         timestamp:  1584950100,
        //         quantity: "329.196",
        //         count:  81,
        //         open: "0.021155",
        //         close: "0.021158",
        //         low: "0.021144",
        //         high: "0.021161",
        //         volume: "6.963557767"
        //     }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'timestamp')),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 150;
        }
        const request = {
            'pair': market['id'],
            'interval': this.timeframes[timeframe],
            'limit': limit,
        };
        const response = await this.publicGetPriceHistoryPair (this.extend (request, params));
        return this.parseOHLCVs (response);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'bidVolume': undefined,
            'ask': parseFloat (ticker['sell']),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': this.safeFloat (ticker, 'close'),
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers () {
        await this.loadMarkets ();
        const tickers = await this.publicGetTickers ();
        const ids = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.markets_by_id[id];
            const symbol = market['symbol'];
            const ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', this.symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const ticker = await this.publicGetTickersPair (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderBookPair (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'buy', 'sell', 0, 1);
    }

    parseTrade (trade, market = undefined) {
        return {
            'id': this.safeString (trade, 'signature'),
            'order': undefined,
            'info': trade,
            'timestamp': this.parse8601 (this.safeString (trade, 'timestamp')),
            'datetime': this.safeString (trade, 'timestamp'),
            'symbol': market && market['symbol'],
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'quantity'),
            'cost': undefined,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, limit = undefined, params = {}) {
        if (!symbol) {
            throw new ArgumentsRequired (this.id + 'fetchTrades requires symbol');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request = {
            'pair': id,
            'limit': limit,
        };
        const trades = await this.publicGetTradeHistoryPair (this.extend (request, params));
        const length = trades.length;
        if (length <= 0) {
            return [];
        }
        return this.parseTrades (trades, market, null, limit);
    }

    async fetchMyTrades () {
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetTradesHistory (request);
        const trades = response['items'];
        return this.parseTrades (trades);
    }

    async fetchBalance (params = {}) {
        const wallet = await this.privateGetWallet (params);
        const instruments = this.safeValue (wallet, 'instruments', {});
        const result = { 'info': wallet };
        const currencyIds = Object.keys (instruments);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeFloat (this.safeValue (instruments, currencyId), 'total');
            account['used'] = this.safeFloat (this.safeValue (instruments, currencyId), 'reserved');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        const description = this.safeValue (order, 'order');
        const marketId = this.safeString (description, 'pair');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.parse8601 (this.safeString (description, 'timestamp'));
        const amount = this.safeFloat (description, 'quantity');
        const remaining = this.safeFloat (order, 'remaining_quantity');
        let filled = undefined;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = Math.max (0, amount - remaining);
            }
        }
        return {
            'id': this.safeString (description, 'id'),
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': this.safeString (description, 'type'),
            'timeInForce': undefined,
            'side': this.safeStringLower (description, 'side'),
            'price': this.safeFloat (description, 'price'),
            'stopPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'filled': filled,
            'remaining': remaining,
            'average': undefined,
            'fee': this.safeFloat (description, 'fee'),
            'trades': this.safeValue (order, 'trades'),
        };
    }

    parseOrders (orders, market) {
        let result = Object.values (orders).map ((order) => this.parseOrder ({ 'order': order }, market));
        result = sortBy (result, 'timestamp');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        return this.filterBySymbolSinceLimit (result, symbol);
    }

    async createOrder (symbol, type, side, quantity, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': type,
            'side': side,
            'quantity': this.amountToPrecision (symbol, quantity),
        };
        const priceIsDefined = (price !== undefined);
        const marketOrder = (type === 'market');
        const limitOrder = (type === 'limit');
        const shouldIncludePrice = limitOrder || (!marketOrder && priceIsDefined);
        if (shouldIncludePrice) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const order = await this.privatePostOrders (this.extend (request, params));
        return this.parseOrder (order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateDeleteOrdersOid (this.extend ({
            'oid': id,
        }, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'oid': id,
        };
        const response = await this.privateGetOrdersOid (this.extend (request, params));
        const order = this.parseOrder ({ 'order': response });
        return order;
    }

    async fetchOrders (symbol = undefined) {
        if (!symbol) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires symbol');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.privateGetOrdersForPairPair (request);
        const orders = [...response.buy_list, ...response.sell_list];
        return this.parseOrders (orders, market);
    }

    parseTransactionStatus (transaction) {
        const finalized_at = this.safeString (transaction, 'finalized_at');
        const completed_at = this.safeString (transaction, 'completed_at');
        const failure_code = this.safeString (transaction, 'failure_code');
        let status = undefined;
        if (!finalized_at && !completed_at) {
            status = 'pending';
        } else if (failure_code) {
            status = 'failed';
        } else {
            status = 'ok';
        }
        return status;
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        // {
        //     "id": "D_PATHWX",
        //     "transaction_id": "d5b8924b1a8bc774f5b53a6983fe2d9cb93c8c955df6c666674b68492a263083",
        //     "target_address": "16ftSEQ4ctQFDtVZiUBusQUjRrGhM3JYwe",
        //     "instrument": "BTC",
        //     "quantity": "249",
        //     "confirmations_received": 2,
        //     "confirmations_required": 6,
        //     "fee_abs": "0",
        //     "fee_pct": 0,
        //     "fee_total": "0",
        //     "created_at": "2019-06-19T01:51:56.312Z",
        //     "finalized_at": null,
        //     "failure_code": null
        //   }                                                      }
        //
        // fetchWithdrawals
        //
        // {
        //     "id": "W_JGU3XR",
        //     "transaction_id": null,
        //     "target_address": "1MvYASoHjqynMaMnP7SBmenyEWiLsTqoU6",
        //     "instrument": "BTC",
        //     "quantity": "0.05",
        //     "fee_abs": "0",
        //     "fee_pct": 0,
        //     "fee_total": "0",
        //     "created_at": "2019-07-23T13:12:03.312Z",
        //     "confirmed_at": null,
        //     "taken_at": null,
        //     "completed_at": null,
        //     "more_info": null,
        //     "failure_code": null,
        //     "cancelled_at": null
        //   }                                                            }
        //
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'transaction_id');
        const timestamp = this.parse8601 (this.safeString (transaction, 'created_at'));
        const currencyId = this.safeString (transaction, 'instrument');
        const code = this.currency (currencyId);
        const address = this.safeString (transaction, 'target_address');
        const amount = this.safeFloat (transaction, 'quantity');
        const status = this.parseTransactionStatus (transaction);
        const type = this.safeString (transaction, 'type'); // injected from the outside
        let feeCost = this.safeFloat (transaction, 'fee_total');
        if (feeCost === undefined) {
            if (type === 'deposit') {
                feeCost = 0;
            }
        }
        return {
            'info': this.omit (transaction, ['type']),
            'id': id,
            'currency': code['id'],
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code['id'],
                'cost': feeCost,
            },
        };
    }

    parseTransactionsByType (type, transactions, code = undefined, since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < transactions.length; i++) {
            const transaction = this.parseTransaction (this.extend ({
                'type': type,
            }, transactions[i]));
            result.push (transaction);
        }
        return result;
    }

    async fetchDeposits (codes = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetDeposits (this.extend (request, params));
        return this.parseTransactionsByType ('deposit', response['items']);
    }

    async fetchWithdrawals (codes = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetWithdrawals (this.extend (request, params));
        return this.parseTransactionsByType ('withdrawal', response['items']);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'instrument': currency['id'],
            'quantity': amount,
            'target_address': address,
        };
        const response = await this.privatePostWithdrawals (this.extend (request, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let urlPath = '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                urlPath += '?' + this.urlencode (query);
            }
        }
        if (method === 'POST' && Object.keys (query).length) {
            body = this.json (query);
        }
        const url = this.urls['api'][api] + urlPath;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const request = [ method.toLowerCase (), '/api/' + api + urlPath, nonce ].join ('');
            const signature = this.hmac (this.encode (request), this.encode (this.secret));
            headers = {
                'Authorization': 'Bearer ' + this.apiKey,
                'Content-Type': 'application/json',
                'XC-Signature': signature,
                'XC-Nonce': nonce,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const name = this.safeString (response, 'name');
        const message = this.safeString (response, 'message');
        this.throwExactlyMatchedException (this.exceptions['exact'], name, message);
        this.throwExactlyMatchedException (this.exceptions['exact'], code, message);
    }
};
