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
                'fetchMyTrades': true,
                'withdraw': true,
                'fetchTransactions': true,
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
                        'grafic_public',
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
        let response = await this.publicGetMarkets ();
        let markets = response;
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['market_name'];
            let baseId = market['currency'];
            let quoteId = market['partner'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let active = market['active'];
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
            timestamp = parseInt (timestamp * 1000);
        }
        let symbol = undefined;
        if (market !== undefined)
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last');
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
        const tickers = await this.fetchTickers (undefined, params); // Cannot find a public method of retriving specific ticker on STEX, fetching all instead.
        const ticker = this.safeValue (tickers, symbol);
        if (ticker === undefined) {
            throw new ExchangeError (this.id + ' ' + symbol + ' ticker not found');
        }
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (params);
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let market = undefined;
            let ticker = tickers[i];
            let symbol = undefined;
            let id = this.safeString (ticker, 'market_name');
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                let symbolParts = id.split ('_');
                let base = symbolParts[0].toUpperCase ();
                let quote = symbolParts[1].toUpperCase ();
                base = this.commonCurrencyCode (base);
                quote = this.commonCurrencyCode (quote);
                symbol = base + '/' + quote;
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    checkforRates (trade) {
        let rate = undefined;
        if ('rates' in trade) {
            rate = Object.keys (trade['rates']);
        }
        if (rate !== undefined)
            return this.safeFloat (rate, 0);
        return rate;
    }

    parseTrade (trade, market = undefined) {
        // this method parses both public and private trades
        let timestamp = this.safeInteger (trade, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp * 1000);
        }
        let tradeId = this.safeString (trade, 'id');
        let orderId = undefined;
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'quantity');
        let symbol = this.safeString (trade, 'pair');
        if (price === undefined)
            price = this.checkforRates (trade);
        if (amount === undefined)
            amount = this.safeFloat (trade, 'original_amount');
        if (market !== undefined)
            symbol = market['symbol'];
        let side = this.safeString (trade, 'type');
        let cost = parseFloat (this.costToPrecision (symbol, price * amount));
        if (side === 'BUY')
            side = 'buy';
        else if (side === 'SELL')
            side = 'sell';
        let myorder = this.safeString (trade, 'is_your_order');
        let takerOrMaker = undefined;
        if (myorder === '1' && side === 'buy')
            takerOrMaker = 'maker';
        else if (myorder === '1' && side === 'sell')
            takerOrMaker = 'taker';
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
        let market = this.market (symbol);
        if (limit === undefined)
            limit = 20; // default
        let response = await this.publicGetTrades (this.extend ({
            'pair': market['id'],
            'limit': limit,
        }, params));
        return this.parseTrades (response, market, since, limit);
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
        let market = this.market (symbol);
        if (limit !== undefined) {
            params['count'] = limit;
        }
        if (since !== undefined) {
            params['since'] = since;
        }
        params = this.extend ({
            'pair': market['id'],
            'interval': this.timeframes[timeframe],
            'page': 1,
        }, params);
        let response = await this.publicGetGraficPublic (params);
        return this.parseOHLCVs (response['graf'], market, timeframe, since, limit);
    }

    async createDepositAddress (code, params = {}) {
        let response = await this.privatePostGenerateWallets (this.extend ({
            'currency': code,
        }, params));
        let address = undefined;
        if (response !== undefined) {
            let address = this.safeString (response, 'address');
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
        let response = await this.privatePostGetInfo ();
        let address = undefined;
        let tag = undefined;
        if ('wallets_addresses' in response) {
            if (code in response['wallets_addresses'])
                address = response['wallets_addresses'][code];
        }
        if ('publick_key' in response) {
            if (code in response['publick_key'])
                tag = response['publick_key'][code];
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    processTransactionHelper (response = undefined, txtype = undefined) {
        let result = {};
        let ids = Object.keys (response[txtype]);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            result.push (this.extend ({ 'id': id, 'type': txtype.toLowerCase () }, response[txtype][id]));
        }
        return result;
    }

    async fetchTransHistory (request, type = undefined) {
        if (type === 'extended') {
            let response1 = await this.privatePostTransHistory (this.extend ({ 'status': 'FINISHED' }, request));
            let response2 = await this.privatePostTransHistory (this.extend ({ 'status': 'AWAITING_CONFIRMATIONS' }, request));
            let response3 = await this.privatePostTransHistory (this.extend ({ 'status': 'EMAIL_SENT' }, request));
            let response4 = await this.privatePostTransHistory (this.extend ({ 'status': 'CANCELED_BY_USER' }, request));
            let response5 = await this.privatePostTransHistory (this.extend ({ 'status': 'AWAITING_APPROVAL' }, request));
            let response6 = await this.privatePostTransHistory (this.extend ({ 'status': 'APPROVED' }, request));
            let response7 = await this.privatePostTransHistory (this.extend ({ 'status': 'PROCESSING' }, request));
            let response8 = await this.privatePostTransHistory (this.extend ({ 'status': 'WITHDRAWAL_ERROR' }, request));
            let response9 = await this.privatePostTransHistory (this.extend ({ 'status': 'CANCELED_BY_ADMIN' }, request));
            return this.extend (response1, response2, response3, response4, response5, response6, response7, response8, response9);
        } else if (type === 'closed' || type === undefined) {
            let response = await this.privatePostTransHistory (this.extend ({ 'status': 'FINISHED' }, request));
            return response;
        } else if (type === 'open') {
            let response = await this.privatePostTransHistory (this.extend ({ 'status': 'AWAITING_CONFIRMATIONS' }, request));
            return response;
        }
    }

    async fetchTransactionsHelper (code = undefined, since = undefined, limit = undefined, only = undefined, params = {}) {
        if (code === undefined || code === 'ALL') {
            throw new ArgumentsRequired (this.id + ' fetchTransactions() requires a currency code argument');
        }
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 50;
        }
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'currency': currency['id'].toUpperCase (),
            'count': limit,
        };
        if (since !== undefined)
            request['since'] = since;
        let data = await this.fetchTransHistory (this.extend (request, params));
        let deposits = {};
        let withdrawals = {};
        if ('DEPOSIT' in data)
            if (only === undefined || only === 'deposits')
                deposits = this.processTransactionHelper (data, 'DEPOSIT');
        if ('WITHDRAWAL' in data)
            if (only === undefined || only === 'withdrawals')
                withdrawals = this.processTransactionHelper (data, 'WITHDRAWAL');
        return this.arrayConcat (deposits, withdrawals);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        let response = await this.fetchTransactionsHelper (code, since, limit, undefined, params);
        let currency = undefined;
        if (code !== undefined)
            currency = this.currency (code);
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        let response = await this.fetchTransactionsHelper (code, since, limit, 'withdrawals', params);
        let currency = undefined;
        if (code !== undefined)
            currency = this.currency (code);
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        let response = await this.fetchTransactionsHelper (code, since, limit, 'deposits', params);
        let currency = undefined;
        if (code !== undefined)
            currency = this.currency (code);
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        let timestamp = this.safeFloat (transaction, 'Date');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp * 1000);
        }
        let code = this.safeString (transaction, 'Currency');
        if (code !== undefined)
            code = currency['id'];
        const type = this.safeString (transaction, 'type'); // DEPOSIT or WITHDRAWAL
        const status = this.parseTransactionStatus (this.safeString (transaction, 'Status'));
        let getfee = transaction['Deposit_fee'].split (code);
        let fee = undefined;
        if (getfee[0] !== undefined)
            fee = getfee[0];
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
        let statuses = {
            'pending': 'pending',
            'failed': 'failed',
            'Finished': 'ok',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrderStatus (status) {
        let statuses = {
            'wait': 'open',
            'closed': 'closed',
            'cancel': 'canceled',
        };
        if (status in statuses)
            return statuses[status];
        return status;
    }

    parseOrder (order, market = undefined) {
        let timestamp = this.safeInteger (order, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp * 1000);
        }
        let price = this.safeString (order, 'rate');
        if (price === undefined) {
            let keys = Object.keys (order['rates']);
            for (let i = 0; i < keys.length; i++) {
                price = keys[i];
            }
        }
        let amount = this.safeFloat (order, 'amount');
        if (amount === undefined)
            amount = this.safeFloat (order, 'original_amount');
        let marketId = this.safeString (order, 'pair');
        market = this.safeValue (this.markets_by_id, marketId);
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let type = this.safeString (order, 'type');
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
            'filled': undefined,
            'remaining': undefined,
            'trades': undefined,
            'fee': {
                'currency': undefined,
                'cost': undefined,
            },
            'info': order,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined)
            limit = 20; // default
        const request = {
            'pair': this.marketId (symbol),
            'limit': limit.toString (),
        };
        let response = await this.publicGetOrderbook (this.extend (request, params));
        return this.parseOrderBook (response, undefined, undefined, undefined, 'Rate', 'Quantity');
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = this.extend ({
            'pair': market['id'],
            'from_id': id,
            'to_id': id,
            'type': 'ALL',
            'owner': 'ALL',
        }, params);
        let data = await this.privatePostActiveOrders (request);
        if (id in data) {
            return this.parseOrder (data[id], market);
        } else {
            let pending = await this.fetchTradeHistory (symbol, undefined, undefined, 1, params);
            let peids = Object.keys (pending);
            for (let i = 0; i < peids.length; i++) {
                let thisid = this.safeString (pending[i], 'id');
                if (thisid === id)
                    return pending[i];
            }
            let processing = await this.fetchTradeHistory (symbol, undefined, undefined, 2, params);
            let prids = Object.keys (processing);
            for (let i = 0; i < prids.length; i++) {
                let thisid = this.safeString (processing[i], 'id');
                if (thisid === id)
                    return processing[i];
            }
            let finish = await this.fetchTradeHistory (symbol, undefined, undefined, 3, params);
            let fids = Object.keys (finish);
            for (let i = 0; i < fids.length; i++) {
                let thisid = this.safeString (finish[i], 'id');
                if (thisid === id)
                    return finish[i];
            }
            let canceled = await this.fetchTradeHistory (symbol, undefined, undefined, 4, params);
            let cids = Object.keys (canceled);
            for (let i = 0; i < cids.length; i++) {
                let thisid = this.safeString (canceled[i], 'id');
                if (thisid === id)
                    return canceled[i];
            }
        }
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
                let res1 = await this.fetchTradeHistory (symbol, since, limit, 1, params);
                let res2 = await this.fetchTradeHistory (symbol, since, limit, 2, params);
                response = this.extend (res1, res2);
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
        let res1 = await this.fetchTradeHistory (symbol, since, limit, 1, params);
        let res2 = await this.fetchTradeHistory (symbol, since, limit, 2, params);
        let res3 = await this.fetchTradeHistory (symbol, since, limit, 3, params);
        let res4 = await this.fetchTradeHistory (symbol, since, limit, 4, params);
        let response = this.extend (res1, res2, res3, res4);
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let pending = await this.fetchTradeHistory (symbol, since, limit, 1, params);
        let processing = await this.fetchTradeHistory (symbol, since, limit, 2, params);
        let combined = this.extend (pending, processing);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrders (combined, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let finish = await this.fetchTradeHistory (symbol, since, limit, 3, params);
        let canceled = await this.fetchTradeHistory (symbol, since, limit, 4, params);
        let combined = this.extend (finish, canceled);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrders (combined, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePostTrade';
        let market = this.market (symbol);
        if (price === undefined)
            price = 0.0;
        let request = {
            'type': side.toUpperCase (),
            'pair': this.safeString (market, 'id'),
            'amount': this.amountToPrecision (symbol, amount),
            'rate': price,
        };
        let response = await this[method] (this.extend (request, params));
        let id = this.safeString (response, 'order_id');
        let order = await this.fetchOrder (id, symbol);
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.privatePostCancelOrder (this.extend ({
            'order_id': id,
        }, params));
        return this.fetchOrder (id, symbol);
    }

    async fetchTradeHistory (symbol = undefined, since = undefined, limit = undefined, status = undefined, params = {}) {
        await this.loadMarkets ();
        if (status === undefined)
            status = 3;
        if (limit === undefined)
            limit = 50;
        let request = {
            'count': limit,
            'status': status,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (since !== undefined)
            request['since'] = market['id'];
        let result = {};
        let response = await this.privatePostTradeHistory (this.extend (request, params));
        let ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            result.push (this.extend ({ 'id': id, 'status': this.parseTradeHistoryStatus (status) }, response[id]));
        }
        return result;
    }

    parseTradeHistoryStatus (status) {
        let statuses = {
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
        if (symbol !== undefined)
            market = this.market (symbol);
        params = this.extend ({ 'owner': 'OWN' }, params);
        let finish = await this.fetchTradeHistory (symbol, since, limit, 3, params);
        return this.parseTrades (finish, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetInfo ();
        let funds = response['funds'];
        let holdfunds = response['hold_funds'];
        let fkeys = Object.keys (funds);
        let result = { 'info': response };
        for (let i = 0; i < fkeys.length; i++) {
            let id = fkeys[i];
            let currency = this.commonCurrencyCode (id);
            let account = this.account ();
            let free = this.safeFloat (funds, id);
            let used = this.safeFloat (holdfunds, id);
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
        let currency = this.currency (code);
        let request = {
            'currency': currency['id'],
            'address': address,
            'amount': amount,
        };
        if (tag !== undefined)
            request['paymentid'] = tag;
        let response = await this.privatePostWithdraw (this.extend (request, params));
        let msg = this.safeString (response, 'message');
        if (msg !== undefined) {
            if (msg === 'This method is currently disabled')
                throw new ExchangeError (msg);
        }
        return {
            'info': response,
            'id': undefined,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else if (api === 'private') {
            url = '/';
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            body = this.urlencode (this.extend ({ 'nonce': nonce, 'method': path }, params));
            let signature = this.hmac (body, this.secret, 'sha512');
            headers = {
                'Key': this.apiKey,
                'Sign': this.decode (signature),
            };
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response) {
            if (this.safeInteger (response, 'success') === 0) {
                let error = this.safeString (response, 'error');
                if (error === 'No data found') {
                    return response;
                } else if (error === 'Login from this IP is forbidden') {
                    throw new PermissionDenied (error);
                } else {
                    throw new ExchangeError (error);
                }
            } else {
                if ('data' in response) {
                    return response['data'];
                } else if ('result' in response) {
                    return response['result'];
                }
            }
        }
        return response;
    }
};
