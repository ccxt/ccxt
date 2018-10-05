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
                        'v1/orders/{id}', // grab a single order
                        'v1/orderbook', // get orderbook by market
                        'v1/orders', // get orders by market
                        'v1/trades', // get all trades for a specific market
                        'v1/wallet/balances', // get balances for a specified wallet
                    ],
                    'post': [
                        'v1/orders', // create an order
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
            'options': {
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
            },
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
        const CONSTANTS = {
            'ORDER_TYPES': {
                'LIMIT': 'limit',
                'MARKET': 'market',
            },
            'SIDES': {
                'BUY': 'buy',
                'SELL': 'sell',
                'BID': 'BID',
                'ASK': 'ASK',
            },
        };
        await this.loadMarkets ();
        let orderType = undefined;
        if (side === CONSTANTS.SIDES.BUY) {
            orderType = CONSTANTS.SIDES.BID;
        } else if (side === CONSTANTS.SIDES.SELL) {
            orderType = CONSTANTS.SIDES.ASK;
        }
        const order = {
            'market': this.marketId (symbol),
            'amount': amount.toString (),
            'side': orderType,
        };
        const marketOrder = (type === CONSTANTS.ORDER_TYPES.MARKET);
        const limitOrder = (type === CONSTANTS.ORDER_TYPES.LIMIT);
        if (limitOrder) {
            if (price === undefined) {
                throw new BadRequest (this.id + ' createOrder method requires a price argument for a ' + type + ' order');
            }
            order['limit_price'] = price.toString ();
            order['time_in_force'] = this.options['defaultTimeInForce']; // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
        }
        if (marketOrder) {
            order['is_market_order'] = true;
        }
        const response = await this.privatePostV1Orders (order, params);
        return {
            'info': response,
            'id': response['block_order_id'],
        };
    }

    async deposit () {
        throw new ExchangeError ('Not Implemented');
    }

    async fetchBalance (params = {}) {
        let res = await this.privateGetV1WalletBalances ();
        let balances = (res) ? res.balances : [];
        // The format that is returned from the sparkswap API does not match what
        // needs to be returned from ccxt. We modify the sparkswap response to
        // fit ccxt: https://github.com/ccxt/ccxt/wiki/Manual#querying-account-balance
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
        const CONSTANTS = {
            'STATUSES': {
                'ACTIVE': 'ACTIVE',
                'CANCELLED': 'CANCELLED',
                'COMPLETED': 'COMPLETED',
                'FAILED': 'FAILED',
                'NONE': 'NONE',
            },
            'SIDES': {
                'ASK': 'ASK',
                'BID': 'BID',
                'BUY': 'buy',
                'SELL': 'sell',
                'NONE': 'none',
            },
            'TYPES': {
                'LIMIT': 'limit',
                'MARKET': 'market',
            },
        };
        const order = await this.privateGetV1OrdersId ({ id });
        // CCXT requires declaration (defaults) of variables, so we set status to
        // `NONE` is there is an un-identified order status returned
        let status = CONSTANTS.STATUSES.NONE;
        if (order.status === CONSTANTS.STATUSES.CANCELLED || order.status === CONSTANTS.STATUSES.FAILED) {
            status = 'cancelled';
        }
        if (order.status === CONSTANTS.STATUSES.COMPLETED) {
            status = 'closed';
        }
        if (order.status === CONSTANTS.STATUSES.ACTIVE) {
            status = 'open';
        }
        // An order can either be market or limit
        let type = CONSTANTS.TYPES.LIMIT;
        if (order.is_market_order) {
            type = CONSTANTS.TYPES.MARKET;
        }
        // CCXT requires declaration (defaults) of variables, so we set status to
        // `NONE` if there is an un-identified order side returned
        let side = CONSTANTS.SIDES.NONE;
        if (order.side === CONSTANTS.SIDES.ASK) {
            side = CONSTANTS.SIDES.SELL;
        } else if (order.side === CONSTANTS.SIDES.BID) {
            side = CONSTANTS.SIDES.BUY;
        }
        const millisecondTimestamp = this.nanoToMillisecondTimestamp (order.timestamp);
        const millisecondDatetime = this.nanoToMillisecondDatetime (order.datetime);
        // The format that is returned from the sparkswap API does not match what
        // needs to be returned from ccxt. We modify the sparkswap response to
        // fit ccxt: https://github.com/ccxt/ccxt/wiki/Manual#order-structure
        const response = {
            'id': id,
            'datetime': millisecondDatetime,
            'timestamp': millisecondTimestamp,
            'status': status,
            'symbol': order.market,
            'type': type,
            'side': side,
            'price': (this.safeFloat (order, 'amount') * this.safeFloat (order, 'limit_price')).toFixed (16),
            'amount': this.safeFloat (order, 'amount'),
            'filled': this.safeFloat (order, 'fill_amount') || 0,
            'cost': this.safeFloat (order, 'fill_amount') * this.safeFloat (order, 'price') || 0,
            'trades': [],
            'info': order,
        };
        // Trades structure can be found here: https://github.com/ccxt/ccxt/wiki/Manual#trade-structure
        for (let i = 0; i < order.open_orders.length; i++) {
            response.trades.push ({
                'id': order.open_orders[i].order_id,
                'symbol': order.market,
                'order': id,
                'amount': this.safeFloat (order.open_orders[i], 'amount'),
                'price': this.safeFloat (order.open_orders[i], 'price'),
                'info': order.open_orders[i],
            });
        }
        for (let y = 0; y < order.fills.length; y++) {
            response.trades.push ({
                'id': order.fills[y].order_id,
                'symbol': order.market,
                'order': id,
                'amount': this.safeFloat (order.fills[y], 'amount'),
                'price': this.safeFloat (order.fills[y], 'price'),
                'info': order.fills[y],
            });
        }
        return response;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        // The call to v1/orderbook will return the correct information that CCXT will
        // expect, however we need to modify the payload to convert nanosecond timestamps
        // to miliseconds
        const res = await this.privateGetV1Orderbook ({ 'market': this.marketId (symbol) });
        const millisecondTimestamp = this.nanoToMillisecondTimestamp (res.timestamp);
        const millisecondDatetime = this.nanoToMillisecondDatetime (res.datetime);
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

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        // The call to v1/market_stats will return the correct information that CCXT will
        // expect, however we need to modify the payload to convert nanosecond timestamps
        // to miliseconds
        const res = await this.privateGetV1MarketStats ({ 'market': this.marketId (symbol) });
        const millisecondTimestamp = this.nanoToMillisecondTimestamp (res.timestamp);
        const millisecondDatetime = this.nanoToMillisecondDatetime (res.datetime);
        return {
            'symbol': res.symbol,
            'timestamp': millisecondTimestamp,
            'datetime': millisecondDatetime,
            'high': res.high,
            'low': res.low,
            'bid': res.bid,
            'bidVolume': res.bidVolume,
            'ask': res.ask,
            'askVolume': res.askVolume,
            'vwap': res.vwap,
            'baseVolume': res.baseVolume,
            'counterVolume': res.counterVolume,
        };
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

    async release (symbol) {
        await this.loadMarkets ();
        return this.privatePostV1WalletRelease ({
            'market': this.marketId (symbol),
        });
    }

    nanoToMillisecondTimestamp (nano) {
        if (!nano) {
            return undefined;
        }
        // We remove the nanoseconds from the millisecond timestamp to fit the CCXT
        // format
        return nano.substring (0, nano.length - 6);
    }

    nanoToMillisecondDatetime (nanoISO8601) {
        if (!nanoISO8601) {
            return undefined;
        }
        const ZERO_OFFSET = 'Z';
        // We remove the nanoseconds (4 characters + Z) from the ISO nanosecond timestamp to fit
        // the ccxt format
        return nanoISO8601.substring (0, nanoISO8601.length - 5) + ZERO_OFFSET;
    }
};
