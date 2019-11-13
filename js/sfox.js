'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

// ----------------------------------------------------------------------------

module.exports = class sfox extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'sfox',
            'name': 'SFOX',
            'countries': [ 'US' ],
            'version': 'v1',
            'userAget': this.userAgents['chrome'],
            'has': {
                'cancelAllOrders': false,
                'CORS': false,
                'deposit': true,
                'fetchAccounts': false,
                'fetchClosedOrders': false,
                'createDepositAddress': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderTrades': false,
                'fetchOrders': false,
                'fetchTime': false,
                'fetchTransactions': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://avatars1.githubusercontent.com/u/16494179?s=200&v=4',
                'api': 'https://api.sfox.com',
                'www': 'https://sfox.com',
                'doc': 'https://www.sfox.com/developers/',
                'fees': 'https://www.sfox.com/algos.html',
                'referral': '',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'api': {
                'public': {
                    'get': [
                        'offer/buy',
                        'offer/sell',
                        'markets/orderbook',
                        'markets/orderbook/{pair}',
                    ],
                },
                'private': {
                    'get': [
                        'account/transactions',
                        'markets/currency-pairs',
                        'orders',
                        'orders/{order_id}',
                        'user/balance',
                        'user/deposit/address/{currency}',
                    ],
                    'post': [
                        'markets/currency-pairs',
                        'orders/buy',
                        'orders/sell',
                        'user/bank/deposit',
                        'user/deposit/address/{currency}',
                        'user/withdraw',
                    ],
                    'delete': [
                        'orders/{order_id}',
                    ],
                },
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let fullPath = '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                fullPath += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'] + fullPath;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            headers = {
                'Authorization': 'Bearer ' + this.apiKey,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets () {
        return [
            {
                'id': 'bchbtc',
                'symbol': 'bchbtc',
                'base': 'BCH',
                'quote': 'BTC',
            },
            {
                'id': 'bchusd',
                'symbol': 'bchusd',
                'base': 'BCH',
                'quote': 'USD',
            },
            {
                'id': 'bsvbtc',
                'symbol': 'bsvbtc',
                'base': 'BSV',
                'quote': 'BTC',
            },
            {
                'id': 'btcusd',
                'symbol': 'btcusd',
                'base': 'BTC',
                'quote': 'USD',
            },
            {
                'id': 'etcbtc',
                'symbol': 'etcbtc',
                'base': 'ETC',
                'quote': 'BTC',
            },
            {
                'id': 'etcusd',
                'symbol': 'etcusd',
                'base': 'ETC',
                'quote': 'USD',
            },
            {
                'id': 'ethbtc',
                'symbol': 'ethbtc',
                'base': 'ETH',
                'quote': 'BTC',
            },
            {
                'id': 'ethusd',
                'symbol': 'ethusd',
                'base': 'ETH',
                'quote': 'USD',
            },
            {
                'id': 'ltcbtc',
                'symbol': 'ltcbtc',
                'base': 'LTC',
                'quote': 'BTC',
            },
            {
                'id': 'ltcusd',
                'symbol': 'ltcusd',
                'base': 'LTC',
                'quote': 'USD',
            },
        ];
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        const response = await this.publicGetMarketsOrderbook ({ 'pair': symbol });
        const timestamp = this.safeInteger (response, 'lastupdated');
        return this.parseOrderBook (response, timestamp);
    }

    async fetchBalance (params = {}) {
        const response = await this.privateGetUserBalance ();
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            result[code] = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'available'),
                'total': this.safeFloat (balance, 'balance'),
            };
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'quantity': amount,
            'currency_pair': this.marketId (symbol),
        };
        if (type === 'limit') {
            request['algo_id'] = 200;  // smart routing
            request['price'] = price;
        }
        let order = undefined;
        if (side === 'sell') {
            order = await this.privatePostOrdersSell (this.extend (request, params));
        } else {
            order = await this.privatePostOrdersBuy (this.extend (request, params));
        }
        return this.parseOrder (order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const order = await this.privateDeleteOrdersOrderId ({ 'order_id': id });
        return this.parseOrder (order);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const order = await this.privateGetOrdersOrderId ({ 'order_id': id });
        return this.parseOrder (order);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.privateGetOrders ();
        return this.parseOrders (orders);
    }

    async deposit (code, amount, address, params = {}) {
        if (code === 'usd') {
            const request = {
                'amount': amount,
            };
            const result = await this.privatePostUserBankDeposit (request);
            return {
                'info': result,
                'currency': 'usd',
                'id': result['tx_status'],
            };
        }
    }

    async createDepositAddress (code, params = {}) {
        const response = await this.privatePostUserDepositAddressCurrency ({ 'currency': code });
        const address = this.safeString (response, 'address');
        return {
            'currency': code,
            'address': address,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const addresses = await this.privateGetUserDepositAddressCurrency ({ 'currency': code });
        const numAddresses = addresses.length;
        if (numAddresses === 0) {
            return {};
        }
        const address = addresses.pop ();
        return {
            'currency': this.safeString (address, 'currency'),
            'address': this.safeString (address, 'address'),
            'info': addresses,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        const request = {
            'amount': amount,
            'address': address,
            'currency': code,
        };
        return this.privatePostUserWithdraw (request);
    }

    parseOrder (order, market = undefined) {
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timestamp = this.safeString (order, 'dateupdated');
        const filled = this.safeFloat (order, 'filled');
        const quantity = this.safeFloat (order, 'quantity');
        return {
            'id': order['id'],
            'info': order,
            'timestamp': this.parse8601 (timestamp),
            'datetime': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': this.safeString (order, 'pair'),
            'type': this.safeString (order, 'action'),
            'side': this.safeString (order, 'action'),
            'price': this.safeFloat (order, 'price'),
            'cost': this.safeFloat (order, 'net_proceeds'),
            'filled': filled,
            'remaining': quantity - filled,
            'fee': this.safeFloat (order, 'fees'),
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'Done': 'closed',
            'Started': 'open',
            'Pending': 'open',
            'Moving': 'open',
            'Canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }
};
