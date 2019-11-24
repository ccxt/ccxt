'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest } = require ('./base/errors');
const { TRUNCATE, DECIMAL_PLACES } = require ('./base/functions/number');

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
                'private': true,
                'public': false,
                // Methods that we support for sparkswap
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'withdraw': true,
                'commit': true,
                'release': true,
                // Unsupported methods for sparkswap
                'deposit': false,
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
                'www': 'https://sparkswap.com',
                'doc': 'https://sparkswap.com/docs',
            },
            'api': {
                'public': {
                    'get': [],
                },
                'private': {
                    'get': [
                        'admin/healthcheck',
                        'markets', // get supported markets
                        'market_stats', // get market stats for a specific market
                        'orders/{id}', // grab a single order
                        'orderbook', // get orderbook by market
                        'orders', // get orders by market
                        'trades', // get all trades for a specific market
                        'wallet/balances', // get balances for a specified wallet
                    ],
                    'post': [
                        'orders', // create an order
                        'wallet/address', // generate a wallet address
                        'wallet/commit', // commit a balance to the exchange
                        'wallet/release', // release your balance from the exchange
                        'wallet/withdraw', // withdraw funds to an external address
                    ],
                    'delete': [
                        'orders/{id}', // cancel an order
                    ],
                },
            },
            'exceptions': {},
            'options': {
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
                'defaultCurrencyPrecision': 16,
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
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            body = this.json (query);
        }
        headers = { 'Content-Type': 'application/json' };
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let auth = this.uid + ':' + this.password;
            let signature = this.stringToBase64 (auth);
            headers['Authorization'] = 'Basic ' + signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateDeleteOrdersId (this.extend (request, params));
        return response;
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
        };
        const response = await this.privatePostWalletAddress (this.extend (request, params));
        const address = this.safeString (response, 'address');
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
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
            'amount': this.decimalToPrecision (amount, TRUNCATE, this.options['defaultCurrencyPrecision'], DECIMAL_PLACES),
            'side': orderType,
        };
        const marketOrder = (type === CONSTANTS.ORDER_TYPES.MARKET);
        const limitOrder = (type === CONSTANTS.ORDER_TYPES.LIMIT);
        if (limitOrder) {
            if (price === undefined) {
                throw new BadRequest (this.id + ' createOrder method requires a price argument for a ' + type + ' order');
            }
            order['limit_price'] = this.decimalToPrecision (price, TRUNCATE, this.options['defaultCurrencyPrecision'], DECIMAL_PLACES);
            order['time_in_force'] = this.options['defaultTimeInForce']; // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
        }
        if (marketOrder) {
            order['is_market_order'] = true;
        }
        const response = await this.privatePostOrders (order, params);
        return {
            'info': response,
            'id': response['block_order_id'],
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetWalletBalances (params);
        let balances = (response) ? this.safeValue (response, 'balances', []) : [];
        let result = {};
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const totalChannelBalance = this.safeFloat (balance, 'total_channel_balance');
            const free = this.safeFloat (balance, 'uncommitted_balance');
            const totalPendingChannelBalance = this.safeFloat (balance, 'total_pending_channel_balance');
            const uncommittedPendingBalance = this.safeFloat (balance, 'uncommitted_pending_balance');
            const used = this.sum (totalChannelBalance, totalPendingChannelBalance, uncommittedPendingBalance);
            const total = this.sum (used, free);
            const currencyId = this.safeString (balance, 'symbol');
            const currency = this.safeValue (this.currencies_by_id, currencyId);
            let code = (currency !== undefined) ? currency['code'] : this.commonCurrencyCode (currencyId);
            result[code] = {
                'free': free,
                'used': used,
                'total': total,
            };
        }
        return this.parseBalance (response);
    }

    async fetchMarkets () {
        let response = await this.privateGetMarkets ();
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

    parseOrderStatus (status) {
        const statuses = {
            'ACTIVE': 'open',
            'CANCELLED': 'canceled',
            'COMPLETED': 'closed',
            'FAILED': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        let marketId = this.safeString (order, 'market');
        if (market === undefined) {
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            let [ baseId, quoteId ] = marketId.split ('/');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        }
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        // An order can either be market or limit
        let isMarketOrder = this.safeValue (order, 'is_market_order');
        let type = (isMarketOrder) ? 'market' : 'limit';
        let side = this.safeString (order, 'side');
        side = (side === 'ask') ? 'sell' : 'buy';
        const timestamp = this.nanoToMillisecondTimestamp (this.safeInteger (order, 'timestamp'));
        const price = this.safeFloat (order, 'limit_price');
        const average = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'fill_amount');
        let remaining = undefined;
        let cost = undefined;
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
            }
            if (price !== undefined) {
                cost = price * filled;
            } else if (average !== undefined) {
                cost = average * filled;
            }
        }
        const response = {
            'info': order,
            'id': order.order_id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': undefined,
            'fee': undefined,
        };
        // todo rewrite to conform to https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes
        // Trades structure can be found here: https://github.com/ccxt/ccxt/wiki/Manual#trade-structure
        for (let i = 0; i < order.open_orders.length; i++) {
            response.trades.push ({
                'id': order.open_orders[i].order_id,
                'symbol': order.market,
                'order': order.order_id,
                'amount': this.safeFloat (order.open_orders[i], 'amount'),
                'price': this.safeFloat (order.open_orders[i], 'price'),
                'info': order.open_orders[i],
            });
        }
        for (let y = 0; y < order.fills.length; y++) {
            response.trades.push ({
                'id': order.fills[y].order_id,
                'symbol': order.market,
                'order': order.order_id,
                'amount': this.safeFloat (order.fills[y], 'amount'),
                'price': this.safeFloat (order.fills[y], 'price'),
                'info': order.fills[y],
            });
        }
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // The call to orderbook endpoint will return the correct information that CCXT will
        // expect, however we need to modify the payload to convert nanosecond timestamps
        // to miliseconds
        const request = {
            'market': this.marketId (symbol),
        };
        const response = await this.privateGetOrderbook (this.extend (request, params));
        const millisecondTimestamp = this.nanoToMillisecondTimestamp (response['timestamp']);
        return this.parseOrderBook (response, millisecondTimestamp);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const CONSTANTS = {
            'STATUSES': {
                'ACTIVE': 'ACTIVE',
                'CANCELLED': 'CANCELLED',
                'COMPLETED': 'COMPLETED',
                'FAILED': 'FAILED',
            },
            'SIDES': {
                'ASK': 'ASK',
                'BID': 'BID',
                'BUY': 'buy',
                'SELL': 'sell',
            },
            'TYPES': {
                'LIMIT': 'limit',
                'MARKET': 'market',
            },
        };
        await this.loadMarkets ();
        const res = await this.privateGetOrders ({ 'market': this.marketId (symbol) });
        const rawOrders = res.block_orders;
        let orders = [];
        for (let i = 0; i < rawOrders.length; i++) {
            let status = undefined;
            if (rawOrders[i].status === CONSTANTS.STATUSES.CANCELLED || rawOrders[i].status === CONSTANTS.STATUSES.FAILED) {
                status = 'cancelled';
            }
            if (rawOrders[i].status === CONSTANTS.STATUSES.COMPLETED) {
                status = 'closed';
            }
            if (rawOrders[i].status === CONSTANTS.STATUSES.ACTIVE) {
                status = 'open';
            }
            // An rawOrders[i] can either be market or limit
            let type = CONSTANTS.TYPES.LIMIT;
            if (rawOrders[i].is_market_order) {
                type = CONSTANTS.TYPES.MARKET;
            }
            let side = undefined;
            if (rawOrders[i].side === CONSTANTS.SIDES.ASK) {
                side = CONSTANTS.SIDES.SELL;
            } else if (rawOrders[i].side === CONSTANTS.SIDES.BID) {
                side = CONSTANTS.SIDES.BUY;
            }
            const millisecondTimestamp = this.nanoToMillisecondTimestamp (rawOrders[i].timestamp);
            const millisecondDatetime = this.nanoToMillisecondDatetime (rawOrders[i].datetime);
            // The format that is returned from the sparkswap API does not match what
            // needs to be returned from ccxt. We modify the sparkswap response to
            // fit ccxt: https://github.com/ccxt/ccxt/wiki/Manual#order-structure
            orders.push ({
                'id': rawOrders[i].block_order_id,
                'datetime': millisecondDatetime,
                'timestamp': millisecondTimestamp,
                'status': status,
                'symbol': rawOrders[i].market,
                'type': type,
                'side': side,
                'price': (this.safeFloat (rawOrders[i], 'amount') * this.safeFloat (rawOrders[i], 'limit_price')).toFixed (16),
                'amount': this.safeFloat (rawOrders[i], 'amount'),
                'info': rawOrders[i],
            });
        }
        return orders;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        // The call to market_stats endpoint will return the correct information that CCXT will
        // expect, however we need to modify the payload to convert nanosecond timestamps
        // to miliseconds
        const res = await this.privateGetMarketStats ({ 'market': this.marketId (symbol) });
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

    parseTrade (trade, market = undefined) {
        const id = this.safeString (trade, 'id');
        let timestamp = this.nanoToMillisecondTimestamp (this.safeInteger (trade, 'timestamp'));
        const orderId = this.safeString (trade, 'order');
        const marketId = this.safeString (trade, 'market');
        market = this.safeValue (this.markets_by_id, marketId, market);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            let [ baseId, quoteId ] = marketId.split ('/');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        }
        const type = this.safeString (trade, 'type');
        const side = this.safeString (trade, 'side');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': orderId,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': undefined,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this.privateGetTrades (this.extend (request, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
            'amount': this.decimalToPrecision (amount, TRUNCATE, this.options['defaultCurrencyPrecision'], DECIMAL_PLACES),
            'address': address,
        };
        const response = await this.privatePostWalletWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': response['txid'],
        };
    }

    async commit (code, balance, symbol, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let market = this.market (symbol);
        let limit = this.safeFloat (this.channelLimits, code, 0);
        if (limit < balance) {
            throw new BadRequest (this.id + ' balance exceeds channel limit for currency, the maximum balance you can commit for ' + code + ' is: ' + limit.toString ());
        }
        const request = {
            'symbol': currency['id'],
            'balance': this.decimalToPrecision (balance, TRUNCATE, this.options['defaultCurrencyPrecision'], DECIMAL_PLACES),
            'market': market['id'],
        };
        const result = await this.privatePostWalletCommit (this.extend (request, params));
        return result;
    }

    async release (symbol) {
        await this.loadMarkets ();
        return this.privatePostWalletRelease ({
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
