'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const {
    AuthenticationError,
    ExchangeError,
    BadRequest,
} = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class nexus extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'nexus',
            'name': 'Nexus',
            'countries': [ 'VC' ],
            'enableRateLimit': false,
            'has': {
                'signIn': true,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchBalance': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchDepositAddresses': true,
                'fetchTransactions': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'urls': {
                'test': {
                    'auth': 'https://sandbox.shiftmarkets.com/v2/authentication',
                    'eds': 'https://sandbox.shiftmarkets.com/v2/exchange',
                    'trade': 'https://trade-service-sls.cryptosrvc.com/v1',
                    'nexusPay': 'https://nexus-pay.cryptosrvc.com/api/v1',
                },
                'api': {
                    'auth': 'https://api.cryptosrvc.com/v2/authentication',
                    'eds': 'https://api.cryptosrvc.com/v2/exchange',
                    'trade': 'https://trade-service-sls.cryptosrvc.com/v1',
                    'nexusPay': 'https://nexus-pay.cryptosrvc.com/api/v1',
                },
                'www': 'https://www.nexus.trade',
            },
            'api': {
                'auth': {
                    'post': [
                        'user_authentication/exchangeToken',
                    ],
                },
                'eds': {
                    'get': [
                        'instruments',
                        'currencies',
                        'quotes',
                        'trades',
                        'bars',
                    ],
                },
                'trade': {
                    'get': [
                        'orderbook/snapshot/{exchange}/{instrument}',
                        'trade/accounts',
                        'trade/order/{id}',
                        'trade/orders/open',
                        'trade/orders/closed',
                    ],
                    'post': [
                        'trade/order',
                    ],
                    'delete': [
                        'trade/order/{id}',
                    ],
                },
                'nexusPay': {
                    'get': [
                        'wallet/{currency}/addresses',
                        'transfers',
                    ],
                    'post': [
                        'wallet/{currency}/address',
                        'transfer/{currency}/withdrawal',
                        'withdraw',
                    ],
                },
            },
            'options': {
                'env': 'api',
                'exchangeName': 'NEXUS',
                'accessToken': '',
            },
        });
    }

    async signIn (params = {}) {
        params = this.extend (params, { 'exchange': this.options['exchangeName'] });
        const response = await this.authPostUserAuthenticationExchangeToken (params);
        if (response['result'] === 'success') {
            this.options['accessToken'] = response['client_access_token'];
        } else {
            throw new AuthenticationError (response['message']);
        }
    }

    parseMarket (instrument) {
        const precision = {
            'amount': this.safeNumber (instrument, 'quantity_decimals'),
            'price': this.safeNumber (instrument, 'price_decimals'),
        };
        return {
            'id': this.safeString (instrument, 'id'),
            'symbol': this.safeString (instrument, 'name'),
            'base': this.safeString (instrument, 'base_product'),
            'quote': this.safeString (instrument, 'quote_product'),
            'baseId': this.safeStringLower (instrument, 'base_product'),
            'quoteId': this.safeStringLower (instrument, 'quote_product'),
            'active': true,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': this.safeNumber (instrument, 'min_quantity'),
                    'max': this.safeNumber (instrument, 'max_quantity'),
                },
                'price': {
                    'min': Math.pow (10, -this.safeNumber (precision, 'price')),
                    'max': undefined,
                },
            },
            'info': instrument,
        };
    }

    async fetchMarkets (params = {}) {
        params = this.extend (params, { 'exchange': this.options['exchangeName'] });
        const response = await this.edsGetInstruments (params);
        const instruments = response['instruments'];
        const result = [];
        for (let i = 0; i < instruments.length; i++) {
            result.push (this.parseMarket (instruments[i]));
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        params = this.extend (params, { 'exchange': this.options['exchangeName'] });
        const response = await this.edsGetCurrencies (params);
        const currencies = response['currencies'];
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeStringLower (currency, 'id');
            result[this.safeString (currency, 'id')] = {
                'id': id,
                'code': this.safeCurrencyCode (id),
                'active': true,
                'precision': this.safeNumber (currency, 'precision'),
                'limits': {
                    'withdraw': {
                        'max': this.safeNumber (currency, 'daily_withdrawal_limit'),
                    },
                },
                'type': this.safeString (currency, 'type'),
                'info': currency,
            };
        }
        return result;
    }

    parseTicker (ticker, market) {
        const symbol = this.safeSymbol (market['id']);
        return this.safeTicker ({
            'symbol': symbol,
            'datetime': this.iso8601 (ticker['timestamp']),
            'timestamp': this.safeNumber (ticker, 'timestamp'),
            'ask': this.safeNumber (ticker, 'close_ask'),
            'bid': this.safeNumber (ticker, 'close_bid'),
            'high': this.safeNumber (ticker, 'high_ask'),
            'low': this.safeNumber (ticker, 'low_bid'),
            'info': ticker,
            'bidVolume': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const ts = this.nonce () * 1000;
        const msInDay = 24 * 3600 * 1000;
        params = this.extend (params, {
            'exchange': this.safeString (this.options, 'exchangeName'),
            'instrument': market['id'],
            'start_time': ts - ts % msInDay,
            'periodicity': 'day',
        });
        const response = await this.edsGetBars (params);
        return this.parseTicker (response['bars'][1]['aggregated_bar'], market);
    }

    async fetchTickers (symbols, params = {}) {
        await this.loadMarkets ();
        const result = {};
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            const ticker = await this.fetchTicker (market['id'], params);
            result[market['id']] = ticker;
        }
        return result;
    }

    parseOrderBookItem (order) {
        return [
            this.safeNumber (order, 'price'),
            this.safeNumber (order, 'volume'),
        ];
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderbook = await this.tradeGetOrderbookSnapshotExchangeInstrument ({
            'exchange': this.safeString (this.options, 'exchangeName'),
            'instrument': market['id'],
        });
        const nonce = this.nonce ();
        const ts = nonce * 1000;
        const result = {
            'bids': [],
            'asks': [],
            'datetime': this.iso8601 (ts),
            'timestamp': ts,
            'nonce': nonce,
        };
        for (let i = 0; i < orderbook['buy'].length; i++) {
            result['bids'].push (this.parseOrderBookItem (orderbook['buy'][i]));
        }
        for (let i = 0; i < orderbook['sell'].length; i++) {
            result['asks'].push (this.parseOrderBookItem (orderbook['sell'][i]));
        }
        return result;
    }

    parseTrade (trade, market) {
        const marketId = this.safeString (trade, 'instrument');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'timestamp': this.safeNumber (trade, 'timestamp'),
            'symbol': symbol,
            'side': this.safeString (trade, 'side'),
            'price': this.safeNumber (trade, 'price'),
            'amount': this.safeNumber (trade, 'quantity'),
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        params = this.extend (params, {
            'exchange': this.safeString (this.options, 'exchangeName'),
            'instrument': market['id'],
            'limit': limit,
        });
        const response = await this.edsGetTrades (params);
        const trades = response['trades'];
        const result = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = this.parseTrade (trades[i], market['id']);
            if (this.safeNumber (trade, 'timestamp') > since) {
                result.push (trade);
            }
        }
        return result;
    }

    async fetchBalance (params = {}) {
        const balances = await this.tradeGetTradeAccounts (params);
        const result = {
            'free': {},
            'used': {},
            'total': {},
            'info': balances,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const total = this.safeNumber (balance['balance'], 'trade');
            const free = this.safeNumber (balance['balance'], 'withdraw');
            const used = total - free;
            if (total > 0) {
                result['free'][this.safeString (balance, 'product')] = free;
                result['used'][this.safeString (balance, 'product')] = used;
                result['total'][this.safeString (balance, 'product')] = total;
                result[this.safeString (balance, 'product')] = {
                    'free': free,
                    'used': used,
                    'total': total,
                };
            }
        }
        return result;
    }

    parseOrder (order) {
        const marketId = this.safeString (order, 'instrument_id');
        const symbol = this.safeSymbool (marketId);
        const amount = this.safeNumber (order, 'quantity');
        const filled = this.safeNumber (order, 'executed_quantity');
        let price = 0;
        if (order['type'] === 'limit') {
            price = this.safeNumber (order, 'limit_price');
        } else {
            price = this.safeNumber (order, 'stop_price');
        }
        const cost = filled * price;
        const result = {
            'id': order['id'],
            'timestamp': this.safeNumber (order, 'open_time'),
            'status': this.safeString (order, 'status'),
            'symbol': symbol,
            'type': this.safeString (order, 'type'),
            'timeInForce': this.safeStringUpper (order, 'status'),
            'side': this.safeString (order, 'side'),
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': amount - filled,
            'cost': cost,
            'info': order,
        };
        return result;
    }

    async fetchOrder (orderId, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        params = this.extend (params, { 'id': orderId });
        const response = await this.tradeGetTradeOrderId (params);
        const order = this.parseOrder (response);
        if (order['symbol'] === market['id']) {
            return order;
        } else {
            throw new BadRequest ('Order not found');
        }
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const openOrders = await this.fetchOpenOrders (market['id'], since, limit, params);
        const closedOrders = await this.fetchClosedOrders (market['id'], since, limit, params);
        const allOrders = openOrders;
        for (let i = 0; i < closedOrders.length; i++) {
            allOrders.push (closedOrders[i]);
        }
        return allOrders;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['id']) {
            params['instrument'] = market['id'];
        }
        if (since) {
            params['fromTimestamp'] = this.iso8601 (since);
        }
        if (limit) {
            params['limit'] = limit;
        }
        const response = await this.tradeGetTradeOrdersOpen (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            result.push (this.parseOrder (response[i]));
        }
        return result;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['id']) {
            params['instrument'] = market['id'];
        }
        if (since) {
            params['filter_date_from'] = this.iso8601 (since);
        }
        if (limit) {
            params['limit'] = limit;
        }
        const response = await this.tradeGetTradeOrdersClosed (params);
        const orders = response['items'];
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            result.push (this.parseOrder (orders[i]));
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        params = this.extend (params, {
            'instrument': market['id'],
            'type': type,
            'side': side,
            'quantity': amount,
            'limit_price': price,
            'stop_price': price,
        });
        const response = await this.tradePostTradeOrder (params);
        return await this.fetchOrder (
            this.safeString (response, 'order_id'),
            this.safeString (response, 'symbol')
        );
    }

    async cancelOrder (orderId, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        await this.tradeDeleteTradeOrderId ({ 'id': orderId });
        return await this.fetchOrder (orderId, market['id']);
    }

    parseAddress (address) {
        return {
            'currency': this.safeString (address, 'currency'),
            'address': this.safeString (address, 'address'),
            'tag': this.safeStringUpper (address, 'currency'),
            'info': address,
        };
    }

    async fetchDepositAddresses (currency) {
        const response = await this.nexusPayGetWalletCurrencyAddresses ({ 'currency': currency });
        const addresses = response.items;
        const result = [];
        for (let i = 0; i < addresses.length; i++) {
            result.push (this.parseAddress (addresses[i]));
        }
        return result;
    }

    parseTransaction (transaction) {
        return {
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'txid_hash'),
            'timestamp': this.safeNumber (transaction, 'created_at'),
            'address': this.safeString (transaction, 'address'),
            'type': this.safeStringLower (transaction, 'type'),
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': this.safeStringUpper (transaction, 'currency'),
            'status': this.safeStringLower (transaction, 'status'),
            'info': transaction,
        };
    }

    async fetchTransactions (currency = undefined, since = undefined, limit = undefined, params = {}) {
        if (currency) {
            params['currency'] = currency;
        }
        if (since) {
            params['fromTimestamp'] = since;
        }
        if (limit) {
            params['limit'] = limit;
        }
        const response = await this.nexusPayGetTransfers (params);
        const transactions = response.items;
        const result = [];
        for (let i = 0; i < transactions.length; i++) {
            result.push (this.parseTransaction (transactions[i]));
        }
        return result;
    }

    async fetchDeposits (currency = undefined, since = undefined, limit = undefined, params = {}) {
        params = this.extend (params, { 'type': 'DEPOSIT' });
        return await this.fetchTransactions (currency, since, limit, params);
    }

    async fetchWithdrawals (currency = undefined, since = undefined, limit = undefined, params = {}) {
        params = this.extend (params, { 'type': 'WITHDRAWAL' });
        return await this.fetchTransactions (currency, since, limit, params);
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        params = this.extend (params, {
            'currency': currency,
            'amount': amount,
            'address': address,
        });
        const response = await this.nexusPayPostWithdraw (params);
        return this.parseTransaction (response);
    }

    sign (path, api = 'trade', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls[this.options['env']][api] + '/' + this.implodeParams (path, params);
        if (method !== 'GET') {
            headers = this.extend (headers, {
                'Content-Type': 'application/json',
            });
            body = this.json (params);
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (this.options['accessToken']) {
            headers = this.extend (headers, {
                'Authorization': 'Bearer ' + this.options.accessToken,
            });
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code >= 200 && code < 300) {
            return;
        }
        let error = 'An error occured during this operation';
        if (response.message) {
            error = response.message;
        }
        if (response.error) {
            error = response.error;
        }
        throw new ExchangeError (error);
    }
};
