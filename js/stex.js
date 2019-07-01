'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, PermissionDenied } = require ('./base/errors');

module.exports = class stex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'stex',
            'name': 'Stex',
            'version': 'v2',
            'countries': [ 'EE' ],
            'rateLimit': 1000,
            'has': {
                'createOrder': true,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'createDepositAddress': true,
                'deposit': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchBalance': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchCanceledOrders': true,
                'fetchMyTrades': true,
                'withdraw': true,
                'fetchTransactions': true,
                'fetchDepositAddress': true,
            },
            'timeframes': {
                '1d': '1D',
                '1m': '1M',
                '3m': '3M',
                '1y': '1Y',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38046312-0b450aac-32c8-11e8-99ab-bc6b136b6cc7.jpg',
                'api': {
                    'public': 'https://app.stex.com/api2',
                    'private': 'https://app.stex.com/api2',
                },
                'www': 'https://app.stex.com',
                'doc': 'https://help.stex.com/api-integration',
                'fees': 'https://app.stex.com/en/pairs-specification',
            },
            'api': {
                // market: Unique market id. It's always in the form of xxxyyy, where xxx is the base currency code, yyy is the quote currency code, e.g. 'btccny'. All available markets can be found at /api/v2/markets.
                'public': {
                    'get': [
                        'currencies',
                        'markets',
                        'market_summary',
                        'ticker',
                        'prices',
                        'trades',
                        'orderbook',
                        'graficPublic',
                    ],
                },
                'private': {
                    'post': [
                        'GetInfo',
                        'ActiveOrders',
                        'Trade',
                        'CancelOrder',
                        'TradeHistory',
                        'TransHistory',
                        'Deposit',
                        'Withdraw',
                        'GenerateWallets',
                        'Grafic',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'maker': 0.05,
                    'taker': 0.05,
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

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets ();
        const markets = response;
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = markets[key];
            const id = market['market_name'];
            const baseId = market['currency'];
            const quoteId = market['partner'];
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = market['active'];
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeFloat (ticker, 'updated_time');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const symbol = market['symbol'];
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
            'percentage': this.safeFloat (ticker, 'spread'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const symbols = { symbol };
        return await this.fetchTickers (symbols, params);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetTicker (params);
        const ids = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let market = undefined;
            let symbol = id;
            const ticker = tickers[id];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                const symbolParts = ticker['market_name'].split ('_');
                let base = symbolParts[0].toUpperCase ();
                let quote = symbolParts[1].toUpperCase ();
                base = this.commonCurrencyCode (base);
                quote = this.commonCurrencyCode (quote);
                symbol = base + '/' + quote;
            }
            result[symbol] = this.parseTicker (ticker, market);
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
            'pair': this.marketId (symbol),
            'limit': limit.toString (),
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
        return this.parseOrderBook (response['result'], undefined, 'buy', 'sell', 'Rate', 'Quantity');
    }

    parseTrade (trade, market = undefined) {
        // this method parses both public and private trades
        const timestamp = this.safeInteger (trade, 'timestamp') * 1000;
        const tradeId = this.safeString (trade, 'id');
        const orderId = undefined;
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'quantity');
        let symbol = this.safeString (trade, 'pair');
        if (price === undefined) {
            let rate = undefined;
            if ('rates' in trade) {
                rate = Object.keys (trade['rates']);
            }
            if (rate !== undefined) {
                price = this.safeFloat (rate, 0);
            }
        }
        if (amount === undefined) {
            amount = this.safeFloat (trade, 'original_amount');
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let side = this.safeString (trade, 'type');
        const cost = parseFloat (price * amount);
        if (side === 'BUY') {
            side = 'buy';
        } else if (side === 'SELL') {
            side = 'sell';
        }
        const myorder = this.safeString (trade, 'is_your_order');
        let takerOrMaker = undefined;
        if (myorder === '1' && side === 'buy') {
            takerOrMaker = 'maker';
        } else if (myorder === '1' && side === 'sell') {
            takerOrMaker = 'taker';
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': tradeId,
            'order': orderId,
            'type': 'limit',
            'side': side,
            'takerOrMaker': takerOrMaker,
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
            'pair': market['id'],
            'limit': limit,
        }, params));
        return this.parseTrades (this.getdatafromresponse (response), market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            this.parseDate (this.safeString (ohlcv, 'date')),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100;
        }
        if (since !== undefined) {
            params['since'] = since;
        }
        const response = await this.privatePostGrafic (this.extend ({
            'pair': market['id'],
            'interval': this.timeframes[timeframe],
            'page': 1,
            'count': limit,
        }, params));
        const data = this.getdatafromresponse (response);
        return this.parseOHLCVs (this.getdatafromresponse (data), market, timeframe, since, limit);
    }

    async createDepositAddress (code, params = {}) {
        const response = await this.privatePostGenerateWallets (this.extend ({
            'currency': code,
        }, params));
        const data = this.getdatafromresponse (response);
        let address = undefined;
        if (data !== undefined) {
            address = this.safeString (data, 'address');
            this.checkAddress (address);
        }
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        const response = await this.privatePostGetInfo ();
        const data = this.getdatafromresponse (response);
        let address = undefined;
        let tag = undefined;
        if ('wallets_addresses' in data) {
            if (code in data['wallets_addresses']) {
                address = data['wallets_addresses'][code];
                this.checkAddress (address);
            }
        }
        if ('publick_key' in data) {
            if (code in data['publick_key']) {
                tag = data['publick_key'][code];
            }
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': address,
        };
    }

    processTransactionHelper (data = undefined, txtype = undefined) {
        const result = {};
        const ids = Object.keys (data[txtype]);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            result.push (this.extend ({ 'id': id, 'type': txtype.toLowerCase () }, data[txtype][id]));
        }
        return result;
    }

    async fetchTransactionsHelper (code = undefined, since = undefined, limit = undefined, only = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 50;
        }
        if (code === undefined || code === 'ALL') {
            throw new ArgumentsRequired (this.id + ' fetchTransactions() requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'].toUpperCase (),
            'count': limit,
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        const status = this.safeString (params, 'status');
        let data = undefined;
        if (status === undefined) {
            data = await this.privatePostTransHistory (this.extend ({ 'status': 'FINISHED' }, request));
        } else {
            data = await this.privatePostTransHistory (this.extend ({ 'status': status }, request));
        }
        data = this.getdatafromresponse (data);
        let deposits = {};
        let withdrawals = {};
        if ('DEPOSIT' in data) {
            if (only === undefined || only === 'deposits') {
                deposits = this.processTransactionHelper (data, 'DEPOSIT');
            }
        }
        if ('WITHDRAWAL' in data) {
            if (only === undefined || only === 'withdrawals') {
                withdrawals = this.processTransactionHelper (data, 'WITHDRAWAL');
            }
        }
        return this.arrayConcat (deposits, withdrawals);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchTransactionsHelper (code, since, limit, undefined, params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchTransactionsHelper (code, since, limit, 'withdrawals', params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchTransactionsHelper (code, since, limit, 'deposits', params);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        let timestamp = this.safeFloat (transaction, 'Date');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp * 1000);
        }
        let code = this.safeString (transaction, 'Currency');
        if (code !== undefined) {
            code = currency['id'];
        }
        const type = this.safeString (transaction, 'type'); // DEPOSIT or WITHDRAWAL
        const status = this.parseTransactionStatus (this.safeString (transaction, 'Status'));
        const getfee = transaction['Deposit_fee'].split (code);
        let fee = undefined;
        if (getfee[0] !== undefined) {
            fee = getfee[0];
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'TX_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'tag': undefined, // refix it properly for the tag from description
            'type': type,
            'amount': this.safeFloat (transaction, 'Amount'),
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': {
                'currency': code,
                'cost': fee,
                'rate': undefined,
            },
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'pending': 'pending',
            'failed': 'failed',
            'Finished': 'ok',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrderStatus (status) {
        const statuses = {
            'wait': 'open',
            'closed': 'closed',
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
            'closed': 'closed',
            'canceled': 'cancel',
        };
        if (status in statuses) {
            return statuses[status];
        }
        return status;
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined) {
        const result = [];
        const ids = Object.keys (orders);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const order = this.extend ({ 'id': id }, orders[id]);
            result.push (this.parseOrder (order, market));
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.safeInteger (order, 'timestamp') * 1000;
        let price = this.safeString (order, 'rate');
        if (price === undefined) {
            const keys = Object.keys (order['rates']);
            for (let i = 0; i < keys.length; i++) {
                price = keys[i];
            }
        }
        let amount = this.safeFloat (order, 'amount');
        if (amount === undefined) {
            amount = this.safeFloat (order, 'original_amount');
        }
        let filled = undefined;
        const buy_amount = this.safeFloat (order, 'buy_amount');
        const sell_amount = this.safeFloat (order, 'sell_amount');
        if (buy_amount !== undefined) {
            filled = buy_amount;
        } else if (sell_amount !== undefined) {
            filled = sell_amount;
        }
        const marketId = this.safeString (order, 'pair');
        market = this.safeValue (this.markets_by_id, marketId);
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const type = this.safeString (order, 'type');
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': this.safeString (market, 'symbol'),
            'type': type,
            'side': undefined,
            'price': price,
            'cost': undefined,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'trades': undefined,
            'fee': {
                'currency': undefined,
                'cost': undefined,
            },
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.extend ({
            'pair': market['id'],
            'from_id': id,
            'to_id': id,
            'type': 'ALL',
            'owner': 'ALL',
        }, params);
        let result = [];
        const response = await this.privatePostActiveOrders (request);
        const data = this.getdatafromresponse (response);
        const orders = this.parseOrders (data, market);
        for (let i = 0; i < orders.length; i++) {
            const thisid = this.safeString (orders[i], 'id');
            if (thisid === id) {
                result = orders[i];
            }
        }
        return result;
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let response = {};
        if (status !== undefined) {
            if (status === 'wait') {
                response = await this.fetchTradeHistory (symbol, since, limit, 1, params);
            } else if (status === 'closed') {
                response = await this.fetchTradeHistory (symbol, since, limit, 3, params);
            } else if (status === 'canceled') {
                response = await this.fetchTradeHistory (symbol, since, limit, 4, params);
            }
        } else {
            response = await this.fetchTradeHistory (symbol, since, limit, 3, params);
        }
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.fetchTradeHistory (symbol, since, limit, 1, params);
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.fetchTradeHistory (symbol, since, limit, 1, params);
        return this.parseOrders (response, market, since, limit);
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.fetchTradeHistory (symbol, since, limit, 4, params);
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.fetchTradeHistory (symbol, since, limit, 3, params);
        return this.parseOrders (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (price === undefined) {
            price = 0.0;
        }
        const request = {
            'type': side.toUpperCase (),
            'pair': this.safeString (market, 'id'),
            'amount': this.amountToPrecision (symbol, amount),
            'rate': price,
        };
        const response = await this.privatePostTrade (this.extend (request, params));
        const data = this.getdatafromresponse (response);
        const id = this.safeString (data, 'order_id');
        return {
            'id': id,
            'info': data,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostCancelOrder (this.extend ({
            'order_id': id,
        }, params));
        const data = this.getdatafromresponse (response);
        return {
            'id': id,
            'info': data,
        };
    }

    async fetchTradeHistory (symbol = undefined, since = undefined, limit = undefined, status = undefined, params = {}) {
        await this.loadMarkets ();
        if (status === undefined) {
            status = 3;
        }
        if (limit === undefined) {
            limit = 50;
        }
        const request = {
            'count': limit,
            'status': status,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (since !== undefined) {
            request['since'] = market['id'];
        }
        const result = {};
        const tradehist = await this.privatePostTradeHistory (this.extend (request, params));
        const data = this.getdatafromresponse (tradehist);
        const ids = Object.keys (data);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            result.push (this.extend ({ 'id': id, 'status': this.parseTradeHistoryStatus (status) }, data[id]));
        }
        return result;
    }

    parseTradeHistoryStatus (status) {
        const statuses = {
            '1': 'wait',
            '2': 'wait',
            '3': 'closed',
            '4': 'cancel',
        };
        if (status in statuses) {
            return statuses[status];
        }
        return status;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        params = this.extend ({ 'owner': 'OWN' }, params);
        const finish = await this.fetchTradeHistory (symbol, since, limit, 3, params);
        return this.parseTrades (finish, market, since, limit);
    }

    getdatafromresponse (response) {
        if ('data' in response) {
            return response['data'];
        } else if ('result' in response) {
            return response['result'];
        } else if ('graf' in response) {
            return response['graf'];
        } else {
            return response;
        }
    }

    checkforstatus (status, array) {
        if (status in array) {
            return true;
        } else {
            return false;
        }
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetInfo ();
        const data = this.getdatafromresponse (response);
        const funds = data['funds'];
        const holdfunds = data['hold_funds'];
        const fkeys = Object.keys (funds);
        const result = { 'info': data };
        for (let i = 0; i < fkeys.length; i++) {
            const id = fkeys[i];
            const currency = this.commonCurrencyCode (id);
            const account = this.account ();
            const free = this.safeFloat (funds, id);
            const used = this.safeFloat (holdfunds, id);
            account['free'] = free;
            account['used'] = used;
            account['total'] = this.sum (free, used);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'address': address,
            'amount': amount,
        };
        if (tag !== undefined) {
            request['paymentid'] = tag;
        }
        const response = await this.privatePostWithdraw (this.extend (request, params));
        const data = this.getdatafromresponse (response);
        const msg = this.safeString (data, 'message');
        if (msg !== undefined) {
            if (msg === 'This method is currently disabled') {
                throw new ExchangeError (msg);
            }
        }
        return {
            'info': data,
            'id': undefined,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/';
        if (api === 'public') {
            url += path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            body = this.urlencode (this.extend ({ 'nonce': nonce, 'method': path }, params));
            const signature = this.hmac (body, this.secret, 'sha512');
            headers = {
                'Key': this.apiKey,
                'Sign': this.decode (signature),
            };
        } else {
            url += path;
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response) {
            if (this.safeInteger (response, 'success') === 0) {
                const error = this.safeString (response, 'error');
                if (error === 'No data found') {
                    return response;
                } else if (error === 'Login from this IP is forbidden') {
                    throw new PermissionDenied (error);
                } else {
                    throw new ExchangeError (error);
                }
            }
        }
        return response;
    }
};
