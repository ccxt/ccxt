'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidOrder } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class mushino extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mushino',
            'name': 'mushino',
            'countries': [ 'SC' ],
            'rateLimit': 500,
            'version': 'v1',
            'has': {
                'fetchDepositAddress': true,
                'CORS': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'fetchBidsAsks': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': true,
                'fetchFundingFees': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': false,
            },
            'timeframes': {
                '1m':'1min',
                '5m': '5min',
                '15m': '15min',
                '1h': '60min',
                '6h': '360min'
            },
            'urls': {
                'logo': 'https://mushino.com/img/wolf_512x512.png',
                'api': 'https://api.mushino.com',
                'test': 'https://api.testnet.mushino.com',
                'www': 'https://www.mushino.com',
                'doc': [
                    'https://docs.mushino.com',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'ping',
                        'time',
                        'pairs',
                        'ticker',
                        'depth',
                        'ohlcv',
                        'trades',
                        'assets',
                    ],
                },
                'private': {
                    'get': [
                        'order',
                        'orders',
                        'active_orders',
                        'completed_orders',
                        'cancelled_orders',
                        'filled_orders',
                        'triggers',
                        'position',
                        'completed_positions',
                        'personal',
                        'fills',
                        'balances',
                        'deposits',
                        'withdrawals',
                    ],
                    'post': [
                        'draw',
                        'fund',
                        'leverage',
                        'auth/withdraw',
                        'auth/order',
                        'auth/close',
                        'auth/cancel',
                        'auth/order/bulk',
                        'auth/cancel/bulk',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.0075,
                    'maker': -0.0025,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'options': {
                'recvWindow': 15 * 1000,
                'timeDifference': 0,
                'adjustForTimeDifference': false,
            },
            'exceptions': {
                '401': ExchangeError,
                '500': ExchangeError,
            },
            'commonCurrencies': {},
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async loadTimeDifference () {
        const response = await this.publicGetTime ();
        const after = this.milliseconds ();
        this.options['timeDifference'] = parseInt (after - response['result']);
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetPairs (this.extend ({}, params));
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const markets = response['result'];
        const result = [];
        const pairs = Object.keys (markets);
        for (let i = 0; i < pairs.length; i++) {
            const id = pairs[i];
            const market = markets[id];
            const base = market['base'];
            const quote = market['quote'];
            const baseId = base;
            const quoteId = quote;
            const symbol = base + '/' + quote;
            const filters = this.indexBy (market['filters'], 'filter_type');
            const precision = {
                'base': market['base_precision'],
                'quote': market['quote_precision'],
                'amount': market['base_precision'],
                'price': market['quote_precision'],
            };
            const active = (market['status'] === 'TRADING');
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
            };
            if ('PRICE_FILTER' in filters) {
                const filter = filters['PRICE_FILTER'];
                entry['limits']['price'] = {
                    'min': this.safeFloat (filter, 'min_price'),
                    'max': undefined,
                };
                const maxPrice = this.safeFloat (filter, 'max_price');
                if ((maxPrice !== undefined) && (maxPrice > 0)) {
                    entry['limits']['price']['max'] = maxPrice;
                }
                entry['precision']['price'] = filter['tick_size'];
            }
            if ('LOT_SIZE' in filters) {
                const filter = filters['LOT_SIZE'];
                entry['precision']['amount'] = filter['tick_size'];
                entry['limits']['amount'] = {
                    'min': this.safeFloat (filter, 'min_qty'),
                    'max': this.safeFloat (filter, 'max_qty'),
                };
            }
            result.push (entry);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const response = await this.publicGetTicker (this.extend ({}, params));
        const ticker = response[id];
        return this.parseTicker (ticker, symbol);
    }

    parseTicker (ticker, symbol) {
        const timestamp = this.safeInteger (ticker, 'close_time');
        const last = this.safeFloat (ticker, 'last_price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high_price'),
            'low': this.safeFloat (ticker, 'low_price'),
            'bid': this.safeFloat (ticker, 'bid_price'),
            'bidVolume': this.safeFloat (ticker, 'bid_qty'),
            'ask': this.safeFloat (ticker, 'ask_price'),
            'askVolume': this.safeFloat (ticker, 'ask_qty'),
            'open': this.safeFloat (ticker, 'open_price'),
            'close': last,
            'last': last,
            'change': this.safeFloat (ticker, 'price_change'),
            'percentage': this.safeFloat (ticker, 'price_change_percent'),
            'baseVolume': this.safeFloat (ticker, 'base_volume'),
            'quoteVolume': this.safeFloat (ticker, 'quote_volume'),
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'].replace ('/', '_'),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        const orderbook = this.parseOrderBook (response['result'], undefined, 'bids', 'asks', 'price', 'qty');
        return orderbook;
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv.open_time,
            parseFloat (ohlcv['open']),
            parseFloat (ohlcv['high']),
            parseFloat (ohlcv['low']),
            parseFloat (ohlcv['close']),
            parseFloat (ohlcv['base_volume']),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOhlcv (this.extend (request, params));
        return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger (trade, 'time');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'qty');
        const id = this.safeString (trade, 'id');
        const is_buyer_maker = this.safeString (trade, 'is_buyer_maker');
        const side = is_buyer_maker ? 'sell' : 'buy';
        const symbol = this.safeString (trade, 'pair').replace ('_', '/');
        const fee = {
            'cost': this.safeFloat (trade, 'net_commission'),
            'currency': this.commonCurrencyCode (trade['net_commission_asset']),
        };
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'fee': fee,
            'price': price,
            'side': side,
            'amount': amount,
            'cost': price * amount,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response['result'], market['symbol'], since, limit);
    }

    parseStatus (status) {
        const statuses = {
            'ACTIVE': 'open',
            'COMPLETED': 'closed',
            'CANCELLED': 'canceled',
            'REJECTED': 'rejected',
            'PENDING': 'open',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrder (order, market = undefined) {
        const status = this.parseStatus (this.safeString (order, 'status'));
        const symbol = this.findSymbol (this.safeString (order, 'pair'), market);
        const timestamp = order['time'];
        let price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'qty_orig');
        const remaining = this.safeFloat (order, 'qty_remaining');
        const filled = amount - remaining;
        const cost = price * amount;
        const id = this.safeString (order, 'id');
        const type = this.safeString (order, 'type').toLowerCase ();
        const side = this.safeString (order, 'side').toLowerCase ();
        const fills = this.safeValue (order, 'fills');
        const trades = this.parseTrades (fills || [], market);
        let average = price;
        if (trades && trades.length > 0) {
            let sum = 0;
            for (let i = 0; i < trades.length; i++) {
                const trade = trades[i];
                sum += trade['price'];
            }
            average = sum / trades.length;
        }
        price = average;
        const result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'trades': trades,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrder (response['result']);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol).id;
            request['pair'] = market;
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response['result'], market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol).id;
            request['pair'] = market;
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetActiveOrders (this.extend (request, params));
        return this.parseOrders (response['result'], market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol).id;
            request['pair'] = market;
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetCompletedOrders (this.extend (request, params));
        return this.parseOrders (response['result'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol).id;
            request['pair'] = market;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.privateGetFills (this.extend (request, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetDeposits (this.extend (request, params));
        return this.parseTransactions (response['result'], undefined, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetWithdrawals (this.extend (request, params));
        return this.parseTransactions (response['result'], undefined, since, limit);
    }

    async fetchFundingFees (codes = undefined, params = {}) {
        const response = await this.publicGetAssets ();
        const detail = this.safeValue (response, 'result');
        const ids = Object.keys (detail);
        const depositFees = {};
        const withdrawFees = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const code = this.commonCurrencyCode (id);
            const asset = this.safeValue (detail, id);
            const fees = this.safeValue (asset, 'fees');
            withdrawFees[code] = this.safeFloat (fees, 'withdrawal');
            depositFees[code] = this.safeFloat (fees, 'deposit');
        }
        return {
            'withdraw': withdrawFees,
            'deposit': depositFees,
            'info': detail,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const request = {
            'asset': code,
            'address': address,
            'qty': parseFloat (amount),
        };
        const response = await this.privatePostAuthWithdraw (this.extend (request, params));
        return {
            'info': response['result'],
            'id': this.safeString (response['result'], 'id'),
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const stopPrice = this.safeFloat (params, 'stopPrice');
        const uppercaseType = type.toUpperCase ();
        let priceIsRequired = false;
        let triggerPriceIsRequired = false;
        const method = 'privatePostAuthOrder';
        const order = {
            'pair': market['id'],
            'qty': this.amountToPrecision (symbol, amount),
            'side': side.toUpperCase (),
        };
        if (uppercaseType === 'LIMIT') {
            order['price'] = price;
            priceIsRequired = true;
        } else if (uppercaseType === 'STOP_LOSS') {
            order['trigger_price'] = stopPrice;
            triggerPriceIsRequired = true;
        } else if (uppercaseType === 'STOP_LOSS_LIMIT') {
            order['trigger_price'] = stopPrice;
            order['price'] = price;
            triggerPriceIsRequired = true;
            priceIsRequired = true;
        } else if (uppercaseType === 'TAKE_PROFIT') {
            order['trigger_price'] = stopPrice;
            triggerPriceIsRequired = true;
        } else if (uppercaseType === 'TAKE_PROFIT_LIMIT') {
            order['trigger_price'] = stopPrice;
            order['price'] = price;
            triggerPriceIsRequired = true;
            priceIsRequired = true;
        }
        if (priceIsRequired && price === undefined) {
            throw new InvalidOrder ('createOrder method requires a price argument for a ' + type + ' order');
        }
        if (triggerPriceIsRequired && stopPrice === undefined) {
            throw new InvalidOrder ('createOrder method requires a trigger_price as an extra param for a ' + type + ' order');
        }
        const response = await this[method] (this.extend (order, params));
        return this.parseOrder (response['result']['order'], market);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetBalances (this.extend (request, params));
        const balances = response['result'];
        const result = { 'info': balances };
        const currencies = Object.keys (balances);
        for (let i = 0; i < currencies.length; i++) {
            const currencyId = currencies[i];
            const balance = balances[currencyId];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const free_cash = this.safeFloat (balance, 'free');
            const locked_cash = this.safeFloat (balance, 'locked');
            const withdrawn_cash = this.safeFloat (balance, 'withdrawn');
            const free_margin = this.safeFloat (balance, 'margin');
            const free_total = free_cash + (free_margin || 0);
            const used_total = locked_cash + withdrawn_cash;
            const total = free_total + used_total;
            account['free'] = free_total;
            account['used'] = used_total;
            account['total'] = total;
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostAuthCancel (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (response['result']);
    }

    async cancelOrders (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostAuthCancelBulk (this.extend ({
        }, params));
        return this.parseOrders (response['result'], undefined, undefined, undefined);
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'id');
        const address = this.safeString (transaction, 'address');
        const tx = this.safeValue (transaction, 'transaction');
        const txHash = this.safeString (tx, 'hash');
        const timestamp = this.safeInteger (transaction, 'time');
        const currencyId = this.safeString (transaction, 'asset');
        const type = id.indexOf (currencyId) !== -1 ? 'deposit' : 'withdrawal';
        const status = this.parseStatus (this.safeString (transaction, 'status'));
        const amount = this.safeFloat (transaction, 'net');
        const gross = this.safeFloat (transaction, 'qty');
        const code = this.commonCurrencyCode (currencyId);
        const fee = {
            'cost': gross - amount,
            'currency': code,
        };
        return {
            'info': transaction,
            'id': id,
            'txid': txHash,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        if (method === 'GET' && Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
        headers = { 'Content-Type': 'application/json' };
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const query = this.urlencode (this.extend ({
                'timestamp': this.nonce (),
                'recv_window': this.options['recvWindow'],
            }, params));
            const signature = this.hmac (query, this.secret, 'sha256', 'base64');
            headers = {
                'x-api-key': this.apiKey,
                'x-signature': signature,
            };
            body = method !== 'GET' ? this.encode (query) : undefined;
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
        let cost = amount * rate;
        let precision = market['precision']['price'];
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
            precision = market['precision']['amount'];
        }
        cost = this.decimalToPrecision (cost, ROUND, precision, this.precisionMode);
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (cost),
        };
    }
};
