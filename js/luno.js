'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class luno extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'luno',
            'name': 'luno',
            'countries': [ 'GB', 'SG', 'ZA' ],
            'rateLimit': 1000,
            'version': '1',
            'has': {
                'CORS': false,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
            },
            'urls': {
                'referral': 'https://www.luno.com/invite/44893A',
                'logo': 'https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg',
                'api': 'https://api.mybitx.com/api',
                'www': 'https://www.luno.com',
                'doc': [
                    'https://www.luno.com/en/api',
                    'https://npmjs.org/package/bitx',
                    'https://github.com/bausmeier/node-bitx',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'orderbook',
                        'orderbook_top',
                        'ticker',
                        'tickers',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/{id}/pending',
                        'accounts/{id}/transactions',
                        'balance',
                        'fee_info',
                        'funding_address',
                        'listorders',
                        'listtrades',
                        'orders/{id}',
                        'quotes/{id}',
                        'withdrawals',
                        'withdrawals/{id}',
                    ],
                    'post': [
                        'accounts',
                        'postorder',
                        'marketorder',
                        'stoporder',
                        'funding_address',
                        'withdrawals',
                        'send',
                        'quotes',
                        'oauth2/grant',
                    ],
                    'put': [
                        'quotes/{id}',
                    ],
                    'delete': [
                        'quotes/{id}',
                        'withdrawals/{id}',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetTickers (params);
        const result = [];
        for (let i = 0; i < response['tickers'].length; i++) {
            const market = response['tickers'][i];
            const id = market['pair'];
            const baseId = id.slice (0, 3);
            const quoteId = id.slice (3, 6);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
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

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        const wallets = this.safeValue (response, 'balance', []);
        const result = { 'info': response };
        for (let i = 0; i < wallets.length; i++) {
            const wallet = wallets[i];
            const currencyId = this.safeString (wallet, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const reserved = this.safeFloat (wallet, 'reserved');
            const unconfirmed = this.safeFloat (wallet, 'unconfirmed');
            const balance = this.safeFloat (wallet, 'balance');
            const account = this.account ();
            account['used'] = this.sum (reserved, unconfirmed);
            account['total'] = this.sum (balance, unconfirmed);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'publicGetOrderbook';
        if (limit !== undefined) {
            if (limit <= 100) {
                method += 'Top'; // get just the top of the orderbook when limit is low
            }
        }
        const request = {
            'pair': this.marketId (symbol),
        };
        const response = await this[method] (this.extend (request, params));
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, timestamp, 'bids', 'asks', 'price', 'volume');
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.safeInteger (order, 'creation_timestamp');
        const status = (order['state'] === 'PENDING') ? 'open' : 'closed';
        const side = (order['type'] === 'ASK') ? 'sell' : 'buy';
        const marketId = this.safeString (order, 'pair');
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat (order, 'limit_price');
        const amount = this.safeFloat (order, 'limit_volume');
        const quoteFee = this.safeFloat (order, 'fee_counter');
        const baseFee = this.safeFloat (order, 'fee_base');
        const filled = this.safeFloat (order, 'base');
        const cost = this.safeFloat (order, 'counter');
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = Math.max (0, amount - filled);
            }
        }
        const fee = { 'currency': undefined };
        if (quoteFee) {
            fee['cost'] = quoteFee;
            if (market !== undefined) {
                fee['currency'] = market['quote'];
            }
        } else {
            fee['cost'] = baseFee;
            if (market !== undefined) {
                fee['currency'] = market['base'];
            }
        }
        const id = this.safeString (order, 'order_id');
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'cost': cost,
            'remaining': remaining,
            'trades': undefined,
            'fee': fee,
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrdersByState (state = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (state !== undefined) {
            request['state'] = state;
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privateGetListorders (this.extend (request, params));
        const orders = this.safeValue (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState (undefined, symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState ('PENDING', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState ('COMPLETE', symbol, since, limit, params);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'timestamp');
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last_trade');
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
            'baseVolume': this.safeFloat (ticker, 'rolling_24_hour_volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const tickers = this.indexBy (response['tickers'], 'pair');
        const ids = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.markets_by_id[id];
            const symbol = market['symbol'];
            const ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market) {
        // For public trade data (is_buy === True) indicates 'buy' side but for private trade data
        // is_buy indicates maker or taker. The value of "type" (ASK/BID) indicate sell/buy side.
        // Private trade data includes ID field which public trade data does not.
        const orderId = this.safeString (trade, 'order_id');
        let takerOrMaker = undefined;
        let side = undefined;
        if (orderId !== undefined) {
            side = (trade['type'] === 'ASK') ? 'sell' : 'buy';
            if (side === 'sell' && trade['is_buy']) {
                takerOrMaker = 'maker';
            } else if (side === 'buy' && !trade['is_buy']) {
                takerOrMaker = 'maker';
            } else {
                takerOrMaker = 'taker';
            }
        } else {
            side = trade['is_buy'] ? 'buy' : 'sell';
        }
        const feeBase = this.safeFloat (trade, 'fee_base');
        const feeCounter = this.safeFloat (trade, 'fee_counter');
        let feeCurrency = undefined;
        let feeCost = undefined;
        if (feeBase !== undefined) {
            if (feeBase !== 0.0) {
                feeCurrency = market['base'];
                feeCost = feeBase;
            }
        } else if (feeCounter !== undefined) {
            if (feeCounter !== 0.0) {
                feeCurrency = market['quote'];
                feeCost = feeCounter;
            }
        }
        const timestamp = this.safeInteger (trade, 'timestamp');
        return {
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'volume'),
            // Does not include potential fee costs
            'cost': this.safeFloat (trade, 'counter'),
            'fee': {
                'cost': feeCost,
                'currency': feeCurrency,
            },
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetListtrades (this.extend (request, params));
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetFeeInfo (params);
        return {
            'info': response,
            'maker': this.safeFloat (response, 'maker_fee'),
            'taker': this.safeFloat (response, 'taker_fee'),
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePost';
        const request = {
            'pair': this.marketId (symbol),
        };
        if (type === 'market') {
            method += 'Marketorder';
            request['type'] = side.toUpperCase ();
            if (side === 'buy') {
                request['counter_volume'] = amount;
            } else {
                request['base_volume'] = amount;
            }
        } else {
            method += 'Postorder';
            request['volume'] = amount;
            request['price'] = price;
            request['type'] = (side === 'buy') ? 'BID' : 'ASK';
        }
        const response = await this[method] (this.extend (request, params));
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
        return await this.privatePostStoporder (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let auth = this.encode (this.apiKey + ':' + this.secret);
            auth = this.stringToBase64 (auth);
            headers = { 'Authorization': 'Basic ' + this.decode (auth) };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }
};
