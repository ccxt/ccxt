'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, AuthenticationError } = require ('./base/errors');

module.exports = class graviex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'graviex',
            'name': 'Graviex',
            'version': 'v3',
            'countries': [ 'MT', 'RU' ],
            'rateLimit': 1000,
            'has': {
                'createOrder': true,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'createDepositAddress': true,
                'deposit': true,
                'fetchDepositAddress': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchBalance': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://graviex.net/api',
                    'private': 'https://graviex.net/api',
                },
                'www': 'https://graviex.net',
                'doc': 'https://graviex.net/documents/api_v3',
                'fees': 'https://graviex.net/documents/fees-and-discounts',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'order_book',
                        'depth',
                        'trades',
                        'trades_simple',
                        'k',
                        'k_with_pending_trades',
                        'currency/info',
                        'timestamp',
                    ],
                },
                'private': {
                    'get': [
                        'account/history',
                        'members/me',
                        'deposits',
                        'deposit',
                        'deposit_address',
                        'fund_sources',
                        'gen_deposit_address',
                        'withdraws',
                        'orders',
                        'orders/history',
                        'order',
                        'trades/my',
                        'trades/history',
                        'settings/get',
                        'strategies/list',
                        'strategies/my',
                    ],
                    'post': [
                        'create_fund_source',
                        'remove_fund_source',
                        'members/me/register_device',
                        'members/me/update_preferences',
                        'orders',
                        'orders/multi',
                        'orders/clear',
                        'order/delete',
                        'create_withdraw',
                        'settings/store',
                        'strategy/cancel',
                        'strategy/create',
                        'strategy/update',
                        'strategy/activate',
                        'strategy/deactivate',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'maker': 0.0,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.0004,
                        'ETH': 0.0055,
                        'DOGE': 2.0,
                        'NYC': 1.0,
                        'XMR': 0.02,
                        'PIVX': 0.2,
                        'NEM': 0.05,
                        'SCAVO': 5.0,
                        'SEDO': 5.0,
                        'USDT': 3.0,
                        'GDM': 0.3,
                        'PIRL': 0.005,
                        'PK': 0.1,
                        'ORM': 10,
                        'NCP': 10,
                        'ETM': 10,
                        'USD': 0,
                        'EUR': 0,
                        'RUB': 0,
                        'other': 0.002,
                    },
                },
            },
            'limits': {
                'amount': {
                    'min': 0.001,
                    'max': undefined,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    async fetchCurrency (code, params = {}) {
        await this.loadMarkets ();
        // CHK - Might need a better solution.
        const currency = this.currency (code);
        const currencyId = this.safeString (currency, 'code');
        return await this.fetchCurrencyById (currencyId.toLowerCase (), params);
    }

    async fetchCurrencyById (id, params = {}) {
        const request = {
            'currency': id,
        };
        const response = await this.publicGetCurrencyInfo (this.extend (request, params));
        const delisting = this.safeValue (response, 'delisting');
        const state = this.safeString (response, 'state');
        const name = this.safeString (response, 'key');
        const withdraw = this.safeValue (response, 'withdraw');
        const fee = this.safeFloat (withdraw, 'fee');
        const inuse = this.safeValue (withdraw, 'inuse');
        let active = true;
        if (state === 'offline') {
            active = false;
        } else if (delisting === true) {
            active = false;
        } else if (!inuse) {
            active = false;
        }
        const maxWithdrawLimit = this.safeFloat (withdraw, 'max');
        const precision = undefined;
        const currencyId = this.safeString (response, 'code');
        const code = this.commonCurrencyCode (currencyId);
        return {
            'info': response,
            'id': currencyId,
            'code': code,
            'name': name,
            'active': active,
            'fee': fee,
            'precision': precision,
            'funding': {
                'withdraw': {
                    'active': inuse,
                    'fee': fee,
                },
                'deposit': {
                    'active': active,
                    'fee': 0,
                },
            },
            'limits': {
                'withdraw': {
                    'min': undefined,
                    'max': maxWithdrawLimit,
                },
            },
        };
    }

    async fetchMarkets (params = {}) {
        // let markets = await this.publicGetMarkets ();
        // Using tickers instead, much more detailed and ability to decide if market is active.
        const response = await this.publicGetTickers (params);
        const ids = Object.keys (response);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = response[id];
            const api = this.safeValue (market, 'api');
            const wstatus = this.safeString (market, 'wstatus');
            let active = false;
            if (api === true && wstatus === 'on') {
                active = true;
            }
            const minamount = this.safeFloat (market, 'base_min');
            const baseId = this.safeString (market, 'base_unit').toUpperCase ();
            const quoteId = this.safeString (market, 'quote_unit').toUpperCase ();
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = this.safeString (market, 'name');
            result.push (this.extend (this.fees['trading'], {
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'taker': undefined,
                'maker': undefined,
                'limits': {
                    'amount': {
                        'min': minamount,
                        'max': undefined,
                    },
                },
            }));
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const symbol = this.safeString (market, 'symbol');
        let timestamp = this.safeInteger (ticker, 'at');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp * 1000);
        }
        const info = ticker;
        const last = this.safeFloat (ticker, 'last');
        const open = this.safeFloat (ticker, 'open');
        let percentage = undefined;
        let average = undefined;
        let change = undefined;
        if ((last !== undefined) && (open !== undefined)) {
            change = last - open;
            if (open > 0 && change > 0) {
                percentage = (change / open) * 100;
            }
            average = this.sum (open, last) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'volume2'),
            'info': info,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const symbols = { symbol };
        return await this.fetchTickers (symbols, params);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.markets_by_id[id];
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (response[id], market);
        }
        if (symbols !== undefined) {
            const symresult = {};
            const lenght = symbols.length;
            for (let i = 0; i < lenght; i++) {
                const ticker = this.safeValue (result, symbols[i]);
                if (ticker !== undefined) {
                    if (lenght === 1) {
                        return ticker;
                    } else {
                        symresult[symbols[i]] = ticker;
                    }
                }
            }
            return symresult;
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 20; // default
        }
        const request = {
            'market': this.marketId (symbol),
            'limit': limit,
        };
        const response = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    parseTrade (trade, market = undefined) {
        // this method parses both public and private trades
        let timestamp = this.safeInteger (trade, 'at');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp * 1000);
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'volume');
        const marketId = this.safeString (trade, 'market');
        market = this.safeValue (this.markets_by_id, marketId, market);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const cost = parseFloat (this.costToPrecision (symbol, price * amount));
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'id'),
            'order': this.safeString (trade, 'order_id'),
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 20; // default
        }
        const response = await this.publicGetTrades (this.extend ({
            'market': market['id'],
            'limit': limit,
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'limit': limit,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['since'] = market['id'];
        }
        const response = await this.privateGetTradesMy (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'market': market['id'],
            'period': this.timeframes[timeframe],
            'limit': limit,
        };
        if (since !== undefined) {
            request['timestamp'] = since;
        }
        const response = await this.publicGetK (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        const response = await this.privateGetDepositAddress (this.extend ({
            'currency': code.toLowerCase (),
        }, params));
        let address = JSON.parse (response);
        address = JSON.parse (address);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async createDepositAddress (code, params = {}) {
        const response = await this.privateGetGenDepositAddress (this.extend ({
            'currency': code.toLowerCase (),
        }, params));
        let address = JSON.parse (response);
        address = JSON.parse (address);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'].toLowerCase ();
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetDeposits (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'].toLowerCase ();
        } else {
            throw new ExchangeError ('Currency required for withdrawal information');
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetWithdraws (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransactions (transactions, currency = undefined, since = undefined, limit = undefined, params = {}) {
        const result = {};
        for (let i = 0; i < transactions.length; i++) {
            const trx = this.parseTransaction (transactions[i], currency);
            result.push (trx);
        }
        return this.sortBy (result, 'id', true);
    }

    parseTransaction (transaction, currency = undefined) {
        let timestamp = this.safeFloat (transaction, 'done_at');
        if (timestamp !== undefined && timestamp !== 'NULL') {
            timestamp = parseInt (timestamp * 1000);
        } else {
            timestamp = this.parse8601 (transaction['created_at']);
        }
        let updated = this.safeFloat (transaction, 'done_at');
        if (updated !== undefined) {
            updated = parseInt (updated * 1000);
        }
        let code = undefined;
        if (currency === undefined) {
            const currencyId = this.safeString (transaction, 'currency');
            if (currencyId in this.currencies_by_id) {
                currency = this.currencies_by_id[currencyId];
            } else {
                code = this.commonCurrencyCode (currencyId);
            }
        } else {
            code = currency['code'];
        }
        const type = ('provider' in transaction) ? 'withdrawal' : 'deposit';
        const feeCost = this.safeFloat (transaction, 'fee');
        const amount = this.safeFloat (transaction, 'amount');
        let feeRate = undefined;
        if (feeCost > 0 && amount > 0) {
            feeRate = feeCost / amount;
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'txid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'tag': undefined, // refix it properly for the tag from description
            'type': type,
            'amount': amount,
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'state')),
            'updated': updated,
            'fee': {
                'currency': code,
                'cost': feeCost,
                'rate': feeRate,
            },
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'accepted': 'ok',
            'done': 'ok',
            'submitted': 'pending',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrderStatus (status) {
        const statuses = {
            'wait': 'open',
            'done': 'closed',
            'cancel': 'canceled',
        };
        if (status in statuses) {
            return statuses[status];
        }
        return status;
    }

    parseOrderStatusRe (status) {
        const statuses = {
            'open': 'wait',
            'closed': 'done',
            'canceled': 'cancel',
        };
        if (status in statuses) {
            return statuses[status];
        }
        return status;
    }

    parseOrder (order, market = undefined) {
        let timestamp = this.safeInteger (order, 'at');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp * 1000);
        }
        let symbol = undefined;
        const marketId = this.safeString (order, 'market');
        market = this.safeValue (this.markets_by_id, marketId);
        let feeCurrency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            if (feeCurrency === undefined) {
                feeCurrency = market['quote'];
            }
        }
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'state')),
            'symbol': symbol,
            'type': this.safeString (order, 'ord_type'),
            'side': this.safeString (order, 'side'),
            'price': this.safeFloat (order, 'price'),
            'cost': undefined,
            'average': this.safeFloat (order, 'avg_price'),
            'amount': this.safeFloat (order, 'volume'),
            'filled': this.safeFloat (order, 'executed_volume'),
            'remaining': this.safeFloat (order, 'remaining_volume'),
            'trades': this.safeInteger (order, 'trades_count'),
            'fee': {
                'currency': feeCurrency,
                'cost': undefined,
            },
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.privateGetOrder (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (response, market);
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const pstatus = this.parseOrderStatusRe (status);
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'page': 1,
            'limit': limit,
            'state': pstatus,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus ('open', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus ('closed', symbol, since, limit, params);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const method = 'privatePostOrders';
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'volume': this.amountToPrecision (symbol, amount),
            'side': side,
        };
        if (price !== undefined) {
            request['price'] = price;
        }
        if (type !== 'NULL' || type !== undefined) {
            request['ord_type'] = type;
        }
        const response = await this[method] (this.extend (request, params));
        const order = this.parseOrder (response, market);
        const id = this.safeString (order, 'id');
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.privatePostOrderDelete (this.extend ({
            'id': id,
        }, params));
        return this.fetchOrder (id, symbol);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetMembersMe ();
        const result = { 'info': response };
        const balances = response['accounts_filtered'];
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency').toUpperCase ();
            let currency = undefined;
            if (currencyId in this.currencies_by_id) {
                currency = this.currencies_by_id[currencyId]['code'];
            } else {
                currency = this.commonCurrencyCode (currencyId);
            }
            const free = this.safeFloat (balance, 'balance');
            const used = this.safeFloat (balance, 'locked');
            const total = this.sum (free, used);
            result[currency] = {
                'free': free,
                'used': used,
                'total': total,
            };
        }
        return this.parseBalance (result);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const host = this.urls['api'][api];
        let url = host + '/' + this.version + '/' + path;
        const tonce = this.nonce ();
        params['tonce'] = tonce;
        if (this.apiKey !== undefined) {
            params['access_key'] = this.apiKey;
        }
        const sorted = this.keysort (params);
        if (api !== 'public') {
            const sign_str = method + '|' + path + '|' + this.urlencode (sorted);
            const signature = this.hmac (this.encode (sign_str), this.encode (this.secret), 'sha256');
            sorted['signature'] = signature;
        }
        const paramencoded = this.urlencode (sorted);
        if (method === 'POST') {
            body = paramencoded;
        } else {
            url += '?' + paramencoded;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        let msg = 'Unknown error';
        if (code === 503 || code === 502) {
            throw new ExchangeError ('Exchange Overloaded');
        }
        if ('error' in response) {
            const errorcode = this.safeInteger (response['error'], 'code');
            if (errorcode !== undefined) {
                msg = this.safeString (response['error'], 'message');
                if (errorcode === 2002) {
                    throw new InsufficientFunds (msg);
                } else if (errorcode === 2005 || errorcode === 2007) {
                    throw new AuthenticationError (msg);
                } else if (errorcode === 1001) {
                    throw new ExchangeError (msg);
                }
            }
        }
        if (code !== 200) {
            throw new ExchangeError ('Invalid response from exchange: ' + msg);
        }
        return response;
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        return response;
    }
};
