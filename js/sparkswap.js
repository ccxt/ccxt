'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class sparkswap extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'sparkswap',
            'name': 'sparkswap',
            'countries': [ 'US' ],
            // 10k calls per hour
            'rateLimit': 400,
            'enableRateLimit': true,
            'version': 'v1',
            'userAgent': this.userAgents['chrome'],
            'headers': {},
            'timeout': 10000, // number in milliseconds
            'verbose': false, // boolean, output error details
            'requiredCredentials': {
                'uid': true,
                'password': true,
                'apiKey': false,
                'secret': false,
            },
            'has': {
                // We do not support CORS w/ headers
                'CORS': false,
                // Sparkswap exchange has both private and public APIs
                'private': false,
                'public': false,
                // Methods that we support for sparkswap
                'cancelOrder': 'emulated',
                'createDepositAddress': 'emulated',
                'createOrder': 'emulated',
                'deposit': 'emulated',
                'fetchBalance': 'emulated',
                'fetchMarkets': 'emulated',
                'fetchOrder': 'emulated',
                'fetchOrderBook': 'emulated',
                'fetchOrders': 'emulated',
                'fetchTicker': 'emulated',
                'fetchTrades': 'emulated',
                'withdraw': 'emulated',
                'commit': 'emulated',
                'release': 'emulated',
                // Unsupported methods for sparkswap
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchTickers': false,
                'fetchBidsAsks': false,
                'fetchTransactions': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg',
                'www': 'https://www.sparkswap.com',
                'doc': 'https://docs.sparkswap.com',
            },
            'api': {
                'public': {
                    'get': [],
                },
                'private': {
                    'get': [
                        'v1/admin/healthcheck',
                        'v1/markets', // get supported markets
                        'v1/market_stats', // get market stats for a specific market
                        'v1/order/{id}', // grab a single order
                        'v1/orderbook', // get orderbook by market
                        'v1/orders', // get orders by market
                        'v1/trades', // get all trades for a specific market
                        'v1/wallet/balances', // get balances for a specified wallet
                    ],
                    'post': [
                        'v1/orders/{id}', // create an order
                        'v1/wallet/address', // generate a wallet address
                        'v1/wallet/commit', // commit a balance to the exchange
                        'v1/wallet/release', // release your balance from the exchange
                        'v1/wallet/withdraw', // withdraw funds to an external address
                    ],
                    'put': [],
                    'delete': [
                        'v1/orders/{id}', // cancel an order
                    ],
                },
            },
            'exceptions': {},
            'options': {},
            // While sparkswap is still in alpha, we will have payment network channel
            // limits specified for each currency
            'channelLimits': {
                'BTC': '0.16777215',
                'LTC': '10.06632900',
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            body = this.json (query);
            headers = {
                'Content-Type': 'application/json',
            };
            // Once authentication is enabled for CCXT w/ the grpc proxy, we can
            // add the basic auth header to these params.
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        throw new ExchangeError ('Not Implemented');
    }

    async createDepositAddress (symbol, params = {}) {
        let res = await this.privatePostV1WalletAddress ({ symbol });
        return res.address;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        throw new ExchangeError ('Not Implemented');
    }

    async deposit () {
        throw new ExchangeError ('Not Implemented');
    }

    async fetchBalance (params = {}) {
        let res = await this.privateGetV1WalletBalances ();
        let balances = (res) ? res.balances : [];
        // The format that is returned from the sparkswap API does not match what
        // needs to be returned from ccxt. We modify the sparkswap response to
        // fit: https://github.com/ccxt/ccxt/wiki/Manual#querying-account-balance
        let free = {};
        let used = {};
        let total = {};
        let response = {
            'info': { balances },
            'free': free,
            'used': used,
            'total': total,
        };
        for (let i = 0; i < balances.length; i++) {
            const balanceTotal = (
                this.safeFloat (balances[i], 'total_channel_balance') +
                this.safeFloat (balances[i], 'uncommitted_balance') +
                this.safeFloat (balances[i], 'total_pending_channel_balance') +
                this.safeFloat (balances[i], 'uncommitted_pending_balance')
            );
            const usedTotal = (
                this.safeFloat (balances[i], 'total_channel_balance') +
                this.safeFloat (balances[i], 'total_pending_channel_balance') +
                this.safeFloat (balances[i], 'uncommitted_pending_balance')
            );
            const freeTotal = this.safeFloat (balances[i], 'uncommitted_balance');
            response.free[balances[i].symbol] = freeTotal;
            response.used[balances[i].symbol] = usedTotal;
            response.total[balances[i].symbol] = balanceTotal;
            response[balances[i].symbol] = {
                'free': freeTotal,
                'used': usedTotal,
                'total': balanceTotal,
            };
        }
        return response;
    }

    async fetchMarkets () {
        let response = await this.privateGetV1Markets ();
        let markets = response['supported_markets'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = market['id'];
            const symbolParts = id.split ('/');
            const baseId = symbolParts[0];
            const quoteId = symbolParts[1];
            const base = baseId.toUpperCase ();
            const quote = quoteId.toUpperCase ();
            const active = true;
            const precision = {
                'amount': this.safeInteger (market, 'amountPrecision'),
                'price': this.safeInteger (market, 'amountPrecision'),
            };
            const limits = {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result.push ({
                'id': id,
                'symbol': id,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        return this.privateGetV1OrderId ({ id });
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        // This call will return the correct information that CCXT will expect, however
        // we need to modify the payload to convert nanosecond timestamps to miliseconds
        //
        const res = await this.privateGetV1Orderbook ({ 'market': this.marketId (symbol) });
        // We remove the nanoseconds from the millisecond timestamp to fit the CCXT
        // format
        const millisecondTimestamp = res.timestamp.substring (0, res.timestamp.length - 6);
        // We remove the nanoseconds (4 characters) from the ISO nanosecond timestamp to fit
        // the ccxt format
        const millisecondDatetime = res.datetime.substring (0, res.datetime.length - 5) + 'Z';
        return {
            'asks': res.asks,
            'bids': res.bids,
            'timestamp': millisecondTimestamp,
            'datetime': millisecondDatetime,
        };
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new ExchangeError ('Not Implemented');
    }

    async fetchTicker () {
        throw new ExchangeError ('Not Implemented');
    }

    async fetchTrades () {
        throw new ExchangeError ('Not Implemented');
    }

    async withdraw () {
        throw new ExchangeError ('Not Implemented');
    }

    async commit (code = '', balance = '', market = '', params = {}) {
        let limit = this.safeFloat (this.channelLimits, code);
        if (limit < parseFloat (balance)) {
            throw new BadRequest ('Balance exceeds channel limit for currency, the maximum balance you can commit for ' + code + ' is: ' + limit);
        }
        return this.privatePostV1WalletCommit ({
            'symbol': code.toString (),
            'balance': balance.toString (),
            'market': market.toString (),
        });
    }

    async release () {
        throw new ExchangeError ('Not Implemented');
    }
};
