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
            'rateLimit': 10000,
            'version': '1',
            'has': {
                'CORS': false,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchTradingFees': true,
            },
            'urls': {
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

    async fetchMarkets () {
        let markets = await this.publicGetTickers ();
        let result = [];
        for (let p = 0; p < markets['tickers'].length; p++) {
            let market = markets['tickers'][p];
            let id = market['pair'];
            let base = id.slice (0, 3);
            let quote = id.slice (3, 6);
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalance ();
        let wallets = response['balance'];
        let result = { 'info': response };
        for (let b = 0; b < wallets.length; b++) {
            let wallet = wallets[b];
            let currency = this.commonCurrencyCode (wallet['asset']);
            let reserved = parseFloat (wallet['reserved']);
            let unconfirmed = parseFloat (wallet['unconfirmed']);
            let balance = parseFloat (wallet['balance']);
            let account = {
                'free': 0.0,
                'used': this.sum (reserved, unconfirmed),
                'total': this.sum (balance, unconfirmed),
            };
            account['free'] = account['total'] - account['used'];
            result[currency] = account;
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
        let orderbook = await this[method] (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        let timestamp = orderbook['timestamp'];
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'volume');
    }

    parseOrder (order, market = undefined) {
        let timestamp = order['creation_timestamp'];
        let status = (order['state'] === 'PENDING') ? 'open' : 'closed';
        let side = (order['type'] === 'ASK') ? 'sell' : 'buy';
        if (market === undefined)
            market = this.findMarket (order['pair']);
        let symbol = market['symbol'];
        let price = this.safeFloat (order, 'limit_price');
        let amount = this.safeFloat (order, 'limit_volume');
        let quoteFee = this.safeFloat (order, 'fee_counter');
        let baseFee = this.safeFloat (order, 'fee_base');
        let filled = this.safeFloat (order, 'base');
        let cost = this.safeFloat (order, 'counter');
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = Math.max (0, amount - filled);
            }
        }
        let fee = { 'currency': undefined };
        if (quoteFee) {
            fee['side'] = 'quote';
            fee['cost'] = quoteFee;
        } else {
            fee['side'] = 'base';
            fee['cost'] = baseFee;
        }
        return {
            'id': order['order_id'],
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
        let response = await this.privateGetOrdersId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (response);
    }

    async fetchOrdersByState (state = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (state !== undefined) {
            request['state'] = state;
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        let response = await this.privateGetListorders (this.extend (request, params));
        let orders = this.safeValue (response, 'orders', []);
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
        let timestamp = ticker['timestamp'];
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last_trade');
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
        let response = await this.publicGetTickers (params);
        let tickers = this.indexBy (response['tickers'], 'pair');
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
        let ticker = await this.publicGetTicker (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        // For public trade data (is_buy === True) indicates 'buy' side but for private trade data
        // is_buy indicates maker or taker. The value of "type" (ASK/BID) indicate sell/buy side.
        // Private trade data includes ID field which public trade data does not.
        let order = this.safeString (trade, 'order_id');
        let takerOrMaker = undefined;
        let side = undefined;
        if (order !== undefined) {
            side = (trade['type'] === 'ASK') ? 'sell' : 'buy';
            if (side === 'sell' && trade['is_buy']) {
                takerOrMaker = 'maker';
            } else if (side === 'buy' && !trade['is_buy']) {
                takerOrMaker = 'maker';
            } else {
                takerOrMaker = 'taker';
            }
        } else {
            side = (trade['is_buy']) ? 'buy' : 'sell';
        }
        let feeBase = this.safeFloat (trade, 'fee_base');
        let feeCounter = this.safeFloat (trade, 'fee_counter');
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
        return {
            'info': trade,
            'id': undefined,
            'timestamp': trade['timestamp'],
            'datetime': this.iso8601 (trade['timestamp']),
            'symbol': market['symbol'],
            'order': order,
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
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
        };
        if (since !== undefined)
            request['since'] = since;
        let response = await this.publicGetTrades (this.extend (request, params));
        let trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
        };
        if (since !== undefined)
            request['since'] = since;
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.privateGetListtrades (this.extend (request, params));
        let trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetFeeInfo (params);
        return {
            'info': response,
            'maker': this.safeFloat (response, 'maker_fee'),
            'taker': this.safeFloat (response, 'taker_fee'),
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePost';
        let order = { 'pair': this.marketId (symbol) };
        if (type === 'market') {
            method += 'Marketorder';
            order['type'] = side.toUpperCase ();
            if (side === 'buy')
                order['counter_volume'] = amount;
            else
                order['base_volume'] = amount;
        } else {
            method += 'Postorder';
            order['volume'] = amount;
            order['price'] = price;
            if (side === 'buy')
                order['type'] = 'BID';
            else
                order['type'] = 'ASK';
        }
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['order_id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostStoporder ({ 'order_id': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length)
            url += '?' + this.urlencode (query);
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let auth = this.encode (this.apiKey + ':' + this.secret);
            auth = this.stringToBase64 (auth);
            headers = { 'Authorization': 'Basic ' + this.decode (auth) };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
};
