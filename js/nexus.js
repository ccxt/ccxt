'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const {
    AuthenticationError,
    ExchangeError,
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
                    'auth': 'https://authentication-service.cryptosrvc-staging.com/api',
                    'eds': 'https://exchange-data-service.cryptosrvc-staging.com/v1',
                    'trade': 'https://trade-service-sls.cryptosrvc.com/v1',
                    'nexusPay': 'https://nexus-pay.cryptosrvc.com/api/v1',
                },
                'api': {
                    'auth': 'https://authentication-service.cryptosrvc.com/api',
                    'eds': 'https://exchange-data-service.cryptosrvc.com/v1',
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
                    ],
                },
                'trade': {
                    'get': [
                        'orderbook/snapshot/{exchange}/{instrument}',
                        'trade/accounts',
                        'trade/order/{id}',
                        'trade/orders/open',
                        'trade/orders/closed',
                        'trade/transactions',
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

    async fetchMarkets () {
        const response = await this.edsGetInstruments ({ 'exchange': this.options['exchangeName'] });
        const markets = response['instruments'];
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const precision = {
                'amount': this.safeNumber (market, 'quantity_decimals'),
                'price': this.safeNumber (market, 'price_decimals'),
            };
            result.push ({
                'id': market['id'],
                'symbol': market['name'],
                'base': market['base_product'],
                'quote': market['quote_product'],
                'baseId': this.safeStringLower (market, 'base_product'),
                'quoteId': this.safeStringLower (market, 'quote_product'),
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (market, 'min_quantity'),
                        'max': this.safeNumber (market, 'max_quantity'),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies () {
        const response = await this.edsGetCurrencies ({ 'exchange': this.options['exchangeName'] });
        const currencies = response['currencies'];
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeStringLower (currency, 'id');
            result[currency['id']] = {
                'id': id,
                'code': this.safeCurrencyCode (id),
                'active': true,
                'precision': this.safeNumber (currency, 'precision'),
                'limits': {
                    'withdraw': {
                        'max': this.safeNumber (currency, 'daily_withdrawal_limit'),
                    },
                },
                'type': currency['type'],
                'info': currency,
            };
        }
        return result;
    }

    parseTicker (ticker) {
        return {
            'symbol': ticker['pair'],
            'datetime': ticker['date_ts'],
            'ask': ticker['ask'],
            'bid': ticker['bid'],
            'info': ticker,
        };
    }

    async fetchTicker (symbol) {
        symbol = symbol.replace ('/', '');
        const ticker = await this.edsGetQuotes ({ 'exchange': this.options['exchangeName'], 'instrument': symbol });
        return this.parseTicker (ticker);
    }

    async fetchTickers () {
        const tickers = await this.edsGetQuotes ({ 'exchange': this.options['exchangeName'] });
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            result.push (this.parseTicker (tickers[i]));
        }
        return result;
    }

    parseOrderBookItem (order) {
        return [
            order['price'],
            order['volume'],
        ];
    }

    async fetchOrderBook (symbol) {
        const instrument = symbol.replace ('/', '');
        const orderbook = await this.tradeGetOrderbookSnapshotExchangeInstrument ({
            'exchange': this.options['exchangeName'],
            'instrument': instrument,
        });
        const result = {
            'bids': [],
            'asks': [],
            'symbol': symbol,
        };
        for (let i = 0; i < orderbook['buy'].length; i++) {
            result['bids'].push (this.parseOrderBookItem (orderbook['buy'][i]));
        }
        for (let i = 0; i < orderbook['sell'].length; i++) {
            result['asks'].push (this.parseOrderBookItem (orderbook['sell'][i]));
        }
        return result;
    }

    parseTrade (trade, instrument) {
        return {
            'timestamp': this.safeNumber (trade, 'timestamp'),
            'symbol': instrument,
            'side': trade['side'],
            'price': this.safeNumber (trade, 'price'),
            'amount': this.safeNumber (trade, 'quantity'),
            'info': trade,
        };
    }

    async fetchTrades (symbol) {
        const instrument = symbol.replace ('/', '');
        const response = await this.edsGetTrades ({ 'exchange': this.options['exchangeName'], 'instrument': instrument });
        const trades = response['trades'];
        const result = [];
        for (let i = 0; i < trades.length; i++) {
            result.push (this.parseTrade (trades[i], symbol));
        }
        return result;
    }

    async fetchBalance () {
        const balances = await this.tradeGetTradeAccounts ();
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
                result['free'][balance['product']] = free;
                result['used'][balance['product']] = used;
                result['total'][balance['product']] = total;
                result[balance['product']] = {
                    'free': free,
                    'used': used,
                    'total': total,
                };
            }
        }
        return result;
    }

    parseOrder (order) {
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
            'status': order['status'],
            'symbol': order['instrument_id'],
            'type': order['type'],
            'timeInForce': this.safeStringUpper (order, 'status'),
            'side': order['side'],
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': amount - filled,
            'cost': cost,
            'info': order,
        };
        return result;
    }

    async fetchOrder (orderId) {
        const response = await this.tradeGetTradeOrderId ({ 'id': orderId });
        return this.parseOrder (response);
    }

    async fetchOrders () {
        const openOrders = await this.fetchOpenOrders ();
        const closedOrders = await this.fetchClosedOrders ();
        const allOrders = openOrders;
        for (let i = 0; i < closedOrders.length; i++) {
            allOrders.push (closedOrders[i]);
        }
        return allOrders;
    }

    async fetchOpenOrders (params = {}) {
        const response = await this.tradeGetTradeOrdersOpen (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            result.push (this.parseOrder (response[i]));
        }
        return result;
    }

    async fetchClosedOrders (params = {}) {
        const response = await this.tradeGetTradeOrdersClosed (params);
        const orders = response['items'];
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            result.push (this.parseOrder (orders[i]));
        }
        return result;
    }

    async createOrder (params) {
        const response = await this.tradePostTradeOrder (params);
        return await this.fetchOrder (response['order_id']);
    }

    async cancelOrder (orderId) {
        await this.tradeDeleteTradeOrderId ({ 'id': orderId });
        return await this.fetchOrder (orderId);
    }

    parseAddress (address) {
        return {
            'currency': address['currency'],
            'address': address['address'],
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
            'id': transaction['id'],
            'txid': transaction['txid_hash'],
            'timestamp': this.safeNumber (transaction, 'created_at'),
            'address': transaction['address'],
            'type': this.safeStringLower (transaction, 'type'),
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': this.safeStringUpper (transaction, 'currency'),
            'status': this.safeStringLower (transaction, 'status'),
            'info': transaction,
        };
    }

    async fetchTransactions () {
        const response = await this.nexusPayGetTransfers ();
        const transactions = response.items;
        const result = [];
        for (let i = 0; i < transactions.length; i++) {
            result.push (this.parseTransaction (transactions[i]));
        }
        return result;
    }

    async fetchDeposits () {
        const transactions = await this.fetchTransactions ();
        const result = [];
        for (let i = 0; i < transactions.length; i++) {
            const transaction = transactions[i];
            if (transaction['type'] === 'deposit') {
                result.push (transaction);
            }
        }
        return result;
    }

    async fetchWithdrawals () {
        const transactions = await this.fetchTransactions ();
        const result = [];
        for (let i = 0; i < transactions.length; i++) {
            const transaction = transactions[i];
            if (transaction['type'] === 'withdrawal') {
                result.push (transaction);
            }
        }
        return result;
    }

    async withdraw (params = {}) {
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
