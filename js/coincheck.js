'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coincheck extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coincheck',
            'name': 'coincheck',
            'countries': [ 'JP', 'ID' ],
            'rateLimit': 1500,
            'has': {
                'CORS': false,
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766464-3b5c3c74-5ed9-11e7-840e-31b32968e1da.jpg',
                'api': 'https://coincheck.com/api',
                'www': 'https://coincheck.com',
                'doc': 'https://coincheck.com/documents/exchange/api',
                'fees': [
                    'https://coincheck.com/exchange/fee',
                    'https://coincheck.com/info/fee',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/orders/rate',
                        'order_books',
                        'rate/{pair}',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'accounts/balance',
                        'accounts/leverage_balance',
                        'bank_accounts',
                        'deposit_money',
                        'exchange/orders/opens',
                        'exchange/orders/transactions',
                        'exchange/orders/transactions_pagination',
                        'exchange/leverage/positions',
                        'lending/borrows/matches',
                        'send_money',
                        'withdraws',
                    ],
                    'post': [
                        'bank_accounts',
                        'deposit_money/{id}/fast',
                        'exchange/orders',
                        'exchange/transfers/to_leverage',
                        'exchange/transfers/from_leverage',
                        'lending/borrows',
                        'lending/borrows/{id}/repay',
                        'send_money',
                        'withdraws',
                    ],
                    'delete': [
                        'bank_accounts/{id}',
                        'exchange/orders/{id}',
                        'withdraws/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/JPY': { 'id': 'btc_jpy', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY', 'baseId': 'btc', 'quoteId': 'jpy' }, // the only real pair
                // 'ETH/JPY': { 'id': 'eth_jpy', 'symbol': 'ETH/JPY', 'base': 'ETH', 'quote': 'JPY', 'baseId': 'eth', 'quoteId': 'jpy' },
                // 'ETC/JPY': { 'id': 'etc_jpy', 'symbol': 'ETC/JPY', 'base': 'ETC', 'quote': 'JPY', 'baseId': 'etc', 'quoteId': 'jpy' },
                // 'DAO/JPY': { 'id': 'dao_jpy', 'symbol': 'DAO/JPY', 'base': 'DAO', 'quote': 'JPY', 'baseId': 'dao', 'quoteId': 'jpy' },
                // 'LSK/JPY': { 'id': 'lsk_jpy', 'symbol': 'LSK/JPY', 'base': 'LSK', 'quote': 'JPY', 'baseId': 'lsk', 'quoteId': 'jpy' },
                // 'FCT/JPY': { 'id': 'fct_jpy', 'symbol': 'FCT/JPY', 'base': 'FCT', 'quote': 'JPY', 'baseId': 'fct', 'quoteId': 'jpy' },
                // 'XMR/JPY': { 'id': 'xmr_jpy', 'symbol': 'XMR/JPY', 'base': 'XMR', 'quote': 'JPY', 'baseId': 'xmr', 'quoteId': 'jpy' },
                // 'REP/JPY': { 'id': 'rep_jpy', 'symbol': 'REP/JPY', 'base': 'REP', 'quote': 'JPY', 'baseId': 'rep', 'quoteId': 'jpy' },
                // 'XRP/JPY': { 'id': 'xrp_jpy', 'symbol': 'XRP/JPY', 'base': 'XRP', 'quote': 'JPY', 'baseId': 'xrp', 'quoteId': 'jpy' },
                // 'ZEC/JPY': { 'id': 'zec_jpy', 'symbol': 'ZEC/JPY', 'base': 'ZEC', 'quote': 'JPY', 'baseId': 'zec', 'quoteId': 'jpy' },
                // 'XEM/JPY': { 'id': 'xem_jpy', 'symbol': 'XEM/JPY', 'base': 'XEM', 'quote': 'JPY', 'baseId': 'xem', 'quoteId': 'jpy' },
                // 'LTC/JPY': { 'id': 'ltc_jpy', 'symbol': 'LTC/JPY', 'base': 'LTC', 'quote': 'JPY', 'baseId': 'ltc', 'quoteId': 'jpy' },
                // 'DASH/JPY': { 'id': 'dash_jpy', 'symbol': 'DASH/JPY', 'base': 'DASH', 'quote': 'JPY', 'baseId': 'dash', 'quoteId': 'jpy' },
                // 'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc' },
                // 'ETC/BTC': { 'id': 'etc_btc', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC', 'baseId': 'etc', 'quoteId': 'btc' },
                // 'LSK/BTC': { 'id': 'lsk_btc', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC', 'baseId': 'lsk', 'quoteId': 'btc' },
                // 'FCT/BTC': { 'id': 'fct_btc', 'symbol': 'FCT/BTC', 'base': 'FCT', 'quote': 'BTC', 'baseId': 'fct', 'quoteId': 'btc' },
                // 'XMR/BTC': { 'id': 'xmr_btc', 'symbol': 'XMR/BTC', 'base': 'XMR', 'quote': 'BTC', 'baseId': 'xmr', 'quoteId': 'btc' },
                // 'REP/BTC': { 'id': 'rep_btc', 'symbol': 'REP/BTC', 'base': 'REP', 'quote': 'BTC', 'baseId': 'rep', 'quoteId': 'btc' },
                // 'XRP/BTC': { 'id': 'xrp_btc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'xrp', 'quoteId': 'btc' },
                // 'ZEC/BTC': { 'id': 'zec_btc', 'symbol': 'ZEC/BTC', 'base': 'ZEC', 'quote': 'BTC', 'baseId': 'zec', 'quoteId': 'btc' },
                // 'XEM/BTC': { 'id': 'xem_btc', 'symbol': 'XEM/BTC', 'base': 'XEM', 'quote': 'BTC', 'baseId': 'xem', 'quoteId': 'btc' },
                // 'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc' },
                // 'DASH/BTC': { 'id': 'dash_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'dash', 'quoteId': 'btc' },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0,
                    'taker': 0,
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        let balances = await this.privateGetAccountsBalance ();
        let result = { 'info': balances };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            if (lowercase in balances)
                account['free'] = parseFloat (balances[lowercase]);
            let reserved = lowercase + '_reserved';
            if (reserved in balances)
                account['used'] = parseFloat (balances[reserved]);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // Only BTC/JPY is meaningful
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privateGetExchangeOrdersOpens (params);
        const rawOrders = this.safeValue (response, 'orders', []);
        const parsedOrders = this.parseOrders (rawOrders, market, since, limit);
        const result = [];
        for (let i = 0; i < parsedOrders.length; i++) {
            result.push (this.extend (parsedOrders[i], { 'status': 'open' }));
        }
        return result;
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOpenOrders
        //
        //     {                        id:  202835,
        //                      order_type: "buy",
        //                            rate:  26890,
        //                            pair: "btc_jpy",
        //                  pending_amount: "0.5527",
        //       pending_market_buy_amount:  null,
        //                  stop_loss_rate:  null,
        //                      created_at: "2015-01-10T05:55:38.000Z" }
        //
        // todo: add formats for fetchOrder, fetchClosedOrders here
        //
        const id = this.safeString (order, 'id');
        const side = this.safeString (order, 'order_type');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const amount = this.safeFloat (order, 'pending_amount');
        const remaining = this.safeFloat (order, 'pending_amount');
        const price = this.safeFloat (order, 'rate');
        let filled = undefined;
        let cost = undefined;
        if (remaining !== undefined) {
            if (amount !== undefined) {
                filled = Math.max (amount - remaining, 0);
                if (price !== undefined) {
                    cost = filled * price;
                }
            }
        }
        const status = undefined;
        const marketId = this.safeString (order, 'pair');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.commonCurrencyCode (baseId);
                const quote = this.commonCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'side': side,
            'type': undefined,
            'status': status,
            'symbol': symbol,
            'price': price,
            'cost': cost,
            'fee': undefined,
            'info': order,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        if (symbol !== 'BTC/JPY')
            throw new NotSupported (this.id + ' fetchOrderBook () supports BTC/JPY only');
        let orderbook = await this.publicGetOrderBooks (params);
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        if (symbol !== 'BTC/JPY')
            throw new NotSupported (this.id + ' fetchTicker () supports BTC/JPY only');
        let ticker = await this.publicGetTicker (params);
        let timestamp = ticker['timestamp'] * 1000;
        let last = this.safeFloat (ticker, 'last');
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
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        const id = this.safeString (trade, 'id');
        const price = this.safeFloat (trade, 'rate');
        const marketId = this.safeString (trade, 'pair');
        market = this.safeValue (this.markets_by_id, marketId, market);
        let symbol = undefined;
        let baseId = undefined;
        let quoteId = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                baseId = market['baseId'];
                quoteId = market['quoteId'];
                symbol = market['symbol'];
            } else {
                const ids = marketId.split ('_');
                baseId = ids[0];
                quoteId = ids[1];
                const base = this.commonCurrencyCode (baseId);
                const quote = this.commonCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        let takerOrMaker = undefined;
        let amount = undefined;
        let cost = undefined;
        let side = undefined;
        let fee = undefined;
        let orderId = undefined;
        if ('liquidity' in trade) {
            if (this.safeString (trade, 'liquidity') === 'T') {
                takerOrMaker = 'taker';
            } else if (this.safeString (trade, 'liquidity') === 'M') {
                takerOrMaker = 'maker';
            }
            const funds = this.safeValue (trade, 'funds', {});
            amount = this.safeFloat (funds, baseId);
            cost = this.safeFloat (funds, quoteId);
            fee = {
                'currency': this.safeString (trade, 'fee_currency'),
                'cost': this.safeFloat (trade, 'fee'),
            };
            side = this.safeString (trade, 'side');
            orderId = this.safeString (trade, 'order_id');
        } else {
            amount = this.safeFloat (trade, 'amount');
            side = this.safeString (trade, 'order_type');
        }
        if (cost === undefined) {
            if (amount !== undefined) {
                if (price !== undefined) {
                    cost = amount * price;
                }
            }
        }
        return {
            'id': id,
            'info': trade,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'order': orderId,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const market = this.market (symbol);
        const response = await this.privateGetExchangeOrdersTransactions (this.extend ({}, params));
        const transactions = this.safeValue (response, 'transactions', []);
        return this.parseTrades (transactions, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        if (symbol !== 'BTC/JPY') {
            throw new NotSupported (this.id + ' fetchTrades () supports BTC/JPY only');
        }
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let order = {
            'pair': this.marketId (symbol),
        };
        if (type === 'market') {
            let order_type = type + '_' + side;
            order['order_type'] = order_type;
            let prefix = (side === 'buy') ? (order_type + '_') : '';
            order[prefix + 'amount'] = amount;
        } else {
            order['order_type'] = side;
            order['rate'] = price;
            order['amount'] = amount;
        }
        let response = await this.privatePostExchangeOrders (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privateDeleteExchangeOrdersId ({ 'id': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let queryString = '';
            if (method === 'GET') {
                if (Object.keys (query).length)
                    url += '?' + this.urlencode (this.keysort (query));
            } else {
                if (Object.keys (query).length) {
                    body = this.urlencode (this.keysort (query));
                    queryString = body;
                }
            }
            let auth = nonce + url + queryString;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'ACCESS-KEY': this.apiKey,
                'ACCESS-NONCE': nonce,
                'ACCESS-SIGNATURE': this.hmac (this.encode (auth), this.encode (this.secret)),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (api === 'public')
            return response;
        if ('success' in response)
            if (response['success'])
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
