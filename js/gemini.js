'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class gemini extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gemini',
            'name': 'Gemini',
            'countries': [ 'US' ],
            'rateLimit': 1500, // 200 for private API
            'version': 'v1',
            'has': {
                'fetchDepositAddress': false,
                'createDepositAddress': true,
                'CORS': false,
                'fetchBidsAsks': false,
                'fetchTickers': false,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': false,
                'createMarketOrder': false,
                'withdraw': true,
                'fetchTransactions': true,
                'fetchWithdrawals': false,
                'fetchDeposits': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg',
                'api': 'https://api.gemini.com',
                'www': 'https://gemini.com',
                'doc': [
                    'https://docs.gemini.com/rest-api',
                    'https://docs.sandbox.gemini.com',
                ],
                'test': 'https://api.sandbox.gemini.com',
                'fees': [
                    'https://gemini.com/fee-schedule/',
                    'https://gemini.com/transfer-fees/',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'symbols',
                        'pubticker/{symbol}',
                        'book/{symbol}',
                        'trades/{symbol}',
                        'auction/{symbol}',
                        'auction/{symbol}/history',
                    ],
                },
                'private': {
                    'post': [
                        'order/new',
                        'order/cancel',
                        'order/cancel/session',
                        'order/cancel/all',
                        'order/status',
                        'orders',
                        'mytrades',
                        'tradevolume',
                        'transfers',
                        'balances',
                        'deposit/{currency}/newAddress',
                        'withdraw/{currency}',
                        'heartbeat',
                        'transfers',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.0035,
                    'maker': 0.001,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetSymbols (params);
        let result = [];
        for (let i = 0; i < response.length; i++) {
            const id = response[i];
            const market = id;
            const baseId = id.slice (0, 3);
            const quoteId = id.slice (3, 6);
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit_bids'] = limit;
            request['limit_asks'] = limit;
        }
        const response = await this.publicGetBookSymbol (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const ticker = await this.publicGetPubtickerSymbol (this.extend (request, params));
        const timestamp = this.safeInteger (ticker['volume'], 'timestamp');
        const baseVolume = this.safeFloat (market, 'base');
        const quoteVolume = this.safeFloat (market, 'quote');
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker['volume'], baseVolume),
            'quoteVolume': this.safeFloat (ticker['volume'], quoteVolume),
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        const timestamp = this.safeInteger (trade, 'timestampms');
        const id = this.safeString (trade, 'tid');
        const orderId = this.safeString (trade, 'order_id');
        let fee = this.safeFloat (trade, 'fee_amount');
        if (fee !== undefined) {
            let currency = this.safeString (trade, 'fee_currency');
            if (currency !== undefined) {
                if (currency in this.currencies_by_id) {
                    currency = this.currencies_by_id[currency]['code'];
                }
                currency = this.commonCurrencyCode (currency);
            }
            fee = {
                'cost': this.safeFloat (trade, 'fee_amount'),
                'currency': currency,
            };
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        return {
            'id': id,
            'order': orderId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'].toLowerCase (),
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTradesSymbol (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostBalances (params);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.commonCurrencyCode (currencyId);
            const account = {
                'free': this.safeFloat (balance, 'available'),
                'used': 0.0,
                'total': this.safeFloat (balance, 'amount'),
            };
            account['used'] = account['total'] - account['free'];
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.safeInteger (order, 'timestampms');
        const amount = this.safeFloat (order, 'original_amount');
        const remaining = this.safeFloat (order, 'remaining_amount');
        const filled = this.safeFloat (order, 'executed_amount');
        let status = 'closed';
        if (order['is_live']) {
            status = 'open';
        }
        if (order['is_cancelled']) {
            status = 'canceled';
        }
        const price = this.safeFloat (order, 'price');
        const average = this.safeFloat (order, 'avg_execution_price');
        let cost = undefined;
        if (filled !== undefined) {
            if (average !== undefined) {
                cost = filled * average;
            }
        }
        let type = this.safeString (order, 'type');
        if (type === 'exchange limit') {
            type = 'limit';
        } else if (type === 'market buy' || type === 'market sell') {
            type = 'market';
        } else {
            type = order['type'];
        }
        let fee = undefined;
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (order, 'symbol');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (order, 'order_id');
        return {
            'id': id,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': order['side'].toLowerCase (),
            'price': price,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privatePostOrderStatus (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostOrders (params);
        let orders = this.parseOrders (response, undefined, since, limit);
        if (symbol !== undefined) {
            const market = this.market (symbol); // throws on non-existent symbol
            orders = this.filterBySymbol (orders, market['symbol']);
        }
        return orders;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        const nonce = this.nonce ();
        const request = {
            'client_order_id': nonce.toString (),
            'symbol': this.marketId (symbol),
            'amount': amount.toString (),
            'price': price.toString (),
            'side': side,
            'type': 'exchange limit', // gemini allows limit orders only
        };
        const response = await this.privatePostOrderNew (this.extend (request, params));
        return {
            'info': response,
            'id': response['order_id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        return await this.privatePostOrderCancel (this.extend (request, params));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit_trades'] = limit;
        }
        if (since !== undefined) {
            request['timestamp'] = parseInt (since / 1000);
        }
        const response = await this.privatePostMytrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        const response = await this.privatePostWithdrawCurrency (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'txHash'),
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit_transfers'] = limit;
        }
        if (since !== undefined) {
            request['timestamp'] = since;
        }
        const response = await this.privatePostTransfers (this.extend (request, params));
        return this.parseTransactions (response);
    }

    parseTransaction (transaction, currency = undefined) {
        const timestamp = this.safeInteger (transaction, 'timestampms');
        let code = undefined;
        if (currency === undefined) {
            let currencyId = this.safeString (transaction, 'currency');
            if (currencyId in this.currencies_by_id) {
                currency = this.currencies_by_id[currencyId];
            }
        }
        if (currency !== undefined) {
            code = currency['code'];
        }
        const address = this.safeString (transaction, 'destination');
        let type = this.safeString (transaction, 'type');
        if (type !== undefined) {
            type = type.toLowerCase ();
        }
        let status = 'pending';
        // When deposits show as Advanced or Complete they are available for trading.
        if (transaction['status']) {
            status = 'ok';
        }
        let fee = undefined;
        const feeAmount = this.safeFloat (transaction, 'feeAmount');
        if (feeAmount !== undefined) {
            fee = {
                'cost': feeAmount,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'eid'),
            'txid': this.safeString (transaction, 'txHash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': undefined, // or is it defined?
            'type': type, // direction of the transaction, ('deposit' | 'withdraw')
            'amount': this.safeFloat (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const request = this.extend ({
                'request': url,
                'nonce': nonce,
            }, query);
            let payload = this.json (request);
            payload = this.stringToBase64 (this.encode (payload));
            const signature = this.hmac (payload, this.encode (this.secret), 'sha384');
            headers = {
                'Content-Type': 'text/plain',
                'X-GEMINI-APIKEY': this.apiKey,
                'X-GEMINI-PAYLOAD': this.decode (payload),
                'X-GEMINI-SIGNATURE': signature,
            };
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if ('result' in response) {
            if (response['result'] === 'error') {
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostDepositCurrencyNewAddress (this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }
};
