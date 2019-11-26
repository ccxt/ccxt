'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const {
    ExchangeNotAvailable,
    AuthenticationError,
    InvalidOrder,
    InsufficientFunds,
    DDoSProtection,
    BadRequest,
    ExchangeError,
} = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class delta extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'delta',
            'name': 'Delta Exchange',
            'countries': [ 'VCT' ],
            'version': 'v1',
            'userAgent': 'CCXT',
            'rateLimit': 200,
            'has': {
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': true,            // Cancel order
                'createDepositAddress': false,
                'createOrder': true,            // Create order
                'deposit': false,
                'fetchBalance': true,           // Fetch wallet balance
                'fetchClosedOrders': true,      // Fetch closed/cancelled orders
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchMarkets': true,           // Fetch all live contracts
                'fetchMyTrades': true,          // Fetch my fills
                'fetchOHLCV': true,             // Fetch OHLCV for a symbol
                'fetchOpenOrders': true,        // Fetch my open orders
                'fetchOrder': false,
                'fetchOrderBook': true,         // Fetch l2 orderbook
                'fetchOrders': true,            // Fetch all orders
                'fetchTicker': true,            // Fetch 24 hr ticket for a symbol
                'fetchTickers': false,
                'fetchBidsAsks': false,
                'fetchTrades': true,            // Fetch recent trades of a contract
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '60m': '60',
                '120m': '120',
                '240m': '240',
                '360m': '360',
                '1d': 'D',
                '7d': '7D',
                '30d': '30D',
                '1w': '1W',
                '2w': '2W',
            },
            'urls': {
                'test': 'https://testnet-api.delta.exchange',
                'logo': 'https://docs.delta.exchange/images/delta-logo-with-text.png',
                'api': 'https://api.delta.exchange',
                'www': 'https://www.delta.exchange/app',
                'doc': 'https://docs.delta.exchange/',
                'fees': 'https://www.delta.exchange/fees/',
                'referral': 'https://www.delta.exchange/referral-program/',
            },
            'api': {
                'public': {
                    'get': ['products', 'orderbook/{id}/l2', 'products/ticker/24hr', 'chart/history'],
                },
                'private': {
                    'get': ['positions', 'orders', 'orders/leverage', 'orders/history', 'fills', 'wallet/balances', 'wallet/transactions'],
                    'post': ['orders', 'orders/leverage', 'positions/change_margin'],
                    'delete': ['orders'],
                    'put': ['orders'],
                },
            },
            'exceptions': {
                'exact': {
                    'ServerOverload': ExchangeNotAvailable,
                    'Timeout': ExchangeNotAvailable,
                    'UnauthorizedApiAccess': AuthenticationError,
                    'InvalidOrder': InvalidOrder,
                    'InsufficientMargin': InsufficientFunds,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetProducts ();
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = market['id'];
            const symbol = market['symbol'];
            const tickSize = this.safeFloat (market, 'tick_size');
            const active = market['trading_status'] === 'operational';
            const limits = {
                'amount': {
                    'min': 1,
                },
                'price': {
                    'min': tickSize,
                },
            };
            const precision = {
                'amount': 1,
                'price': tickSize,
            };
            result.push ({
                'active': active,
                'base': market['underlying_asset']['symbol'],
                'future': true,
                'id': id,
                'info': market,
                'limits': limits,
                'precision': precision,
                'quote': market['quoting_asset']['symbol'],
                'spot': false,
                'symbol': symbol,
                'type': 'future',
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        const id = this.marketId (symbol);
        const response = await this.publicGetOrderbookIdL2 (this.extend ({ 'id': id }, params));
        const orderbook = this.parseOrderBook (response, undefined, 'buy_book', 'sell_book', 'price', 'size');
        return orderbook;
    }

    async fetchTicker (symbol, params = {}) {
        const ticker = await this.publicGetProductsTicker24hr (this.extend (
            {
                'symbol': symbol,
            },
            params
        ));
        return this.parseTicker (ticker);
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetOrderbookIdL2 (this.extend ({ 'id': market['id'] }, params));
        return this.parseTrades (response['recent_trades'], market, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const currentTime = this.seconds ();
        const request = this.extend ({
            'symbol': symbol,
            'resolution': this.timeframes[timeframe],
            'to': currentTime,
            'from': currentTime - 86400,
        }, params);
        const response = await this.publicGetChartHistory (request);
        if (response['s'] === 'ok') {
            return this.parseTradingViewOHLCV (response, undefined, timeframe, since, limit);
        } else {
            return [];
        }
    }

    async fetchBalance (params = {}) {
        const wallets = await this.privateGetWalletBalances ();
        const response = {};
        for (let i = 0; i < wallets.length; i++) {
            const wallet = wallets[i];
            const total = parseFloat (wallet['balance']);
            const used = parseFloat (wallet['order_margin']) + parseFloat (wallet['position_margin']) + parseFloat (wallet['commission']);
            response[wallet['asset']['symbol']] = {
                'free': total - used,
                'used': used,
                'total': total,
            };
        }
        return this.parseBalance (response);
    }

    async getOrders (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const market = this.market (symbol);
        request.product_id = market['id'];
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.getOrders (
            symbol,
            this.extend (
                {
                    'state': 'open',
                },
                params
            )
        );
        return response;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.getOrders (
            symbol,
            this.extend (
                {
                    'state': 'closed',
                },
                params
            )
        );
        return response;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_id': market['id'],
            'order_type': this.getOrderType (type),
            'side': side,
            'size': amount,
        };
        if (price !== undefined) {
            request['limit_price'] = price;
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const order = this.parseOrder (response, market);
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.privateDeleteOrders (this.extend (
            {
                'id': id,
                'product_id': market['id'],
            },
            params
        ));
        const order = this.parseOrder (response, market);
        return order;
    }

    async fetchPositions () {
        const response = await this.privateGetPositions ();
        return response;
    }

    async fetchOrderLeverage (symbol) {
        await this.loadMarkets ();
        const response = await this.privateGetOrdersLeverage ({
            'product_id': this.marketId (symbol),
        });
        return response;
    }

    async changePositionMargin (symbol, deltaMargin) {
        await this.loadMarkets ();
        const response = await this.privatePostPositionsChangeMargin ({
            'product_id': this.marketId (symbol),
            'delta_margin': deltaMargin,
        });
        return response;
    }

    async changeOrderLeverage (symbol, leverage) {
        await this.loadMarkets ();
        const response = await this.privatePostOrdersLeverage ({
            'product_id': this.marketId (symbol),
            'leverage': leverage,
        });
        return response;
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code === 429) {
            throw new DDoSProtection (this.id + ' ' + body);
        }
        if (code >= 400) {
            let error = '';
            if (response['error']) {
                error = this.safeString (response, 'error');
            } else if (response['errors']) {
                const errors = [];
                for (let i = 0; i < response['errors'].length; i++) {
                    errors.push (this.safeString (response['errors'][i], 'msg'));
                }
                error = errors.join (', ');
            }
            const feedback = this.id + ' ' + error;
            const exact = this.exceptions['exact'];
            if (error in exact) {
                throw new exact[error] (feedback);
            }
            if (code === 400) {
                throw new BadRequest (feedback);
            }
            throw new ExchangeError (feedback);
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['test'] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                }
            }
            const timestamp = this.seconds ();
            let signatureData = method + timestamp;
            if (path[0] === '/') {
                signatureData += path;
            } else {
                signatureData += '/' + path;
            }
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    signatureData += '?' + this.urlencode (query);
                }
            }
            if (body !== undefined) {
                signatureData += body;
            }
            const signature = this.hmac (
                this.encode (signatureData),
                this.encode (this.secret)
            );
            headers = {
                'Content-Type': 'application/json',
                'api-key': this.apiKey,
                'timestamp': timestamp,
                'signature': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    parseTicker (ticker) {
        const timestamp = this.safeInteger (ticker, 'timestamp') * 1000;
        const iso8601 = this.iso8601 (timestamp);
        const symbol = this.safeString (ticker, 'symbol');
        const last = this.safeFloat (ticker, 'close');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': iso8601,
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': last,    // for now we are considering bid as last, we will fix this in delta v2 (our next version)
            'bidVolume': undefined,
            'ask': last,    // for now we are considering ask as last, we will fix this in delta v2 (our next version)
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        const timestamp = parseInt (this.safeInteger (trade, 'timestamp') / 1000);
        const iso8601 = this.iso8601 (timestamp);
        const symbol = market['symbol'];
        const side = trade['buyer_role'] === 'taker' ? 'buy' : 'sell';
        const size = this.safeInteger (trade, 'size');
        const price = this.safeFloat (trade, 'price');
        const cost = this.getNotional (size, price, market);
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': iso8601,
            'symbol': symbol,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': size,
            'takerOrMaker': 'taker',
            'cost': cost,
            'fee': undefined,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'closed': 'closed',
        };
        if (status in statuses) {
            return statuses[status];
        }
        return status;
    }

    getOrderType (order_type) {
        const order_types = {
            'limit': 'limit_order',
            'market': 'market_order',
        };
        if (order_type in order_types) {
            return order_types[order_type];
        }
        return order_type;
    }

    parseOrderType (order_type) {
        const order_types = {
            'limit_order': 'limit',
            'market_order': 'market',
        };
        if (order_type in order_types) {
            return order_types[order_type];
        }
        return order_type;
    }

    parseOrder (order, market) {
        const created_at = this.safeString (order, 'created_at');
        const timestamp = this.parse8601 (created_at);
        const id = this.safeString (order, 'id');
        const price = this.safeFloat (order, 'limit_price');
        const average = this.safeFloat (order, 'avg_fill_price');
        const amount = this.safeInteger (order, 'size');
        const filled = this.safeInteger (order, 'size') - this.safeInteger (order, 'unfilled_size');
        const remaining = amount - filled;
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const side = this.safeString (order, 'side');
        const type = this.parseOrderType (this.safeString (order, 'order_type'));
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined, // todo: parse trades
        };
    }

    getNotional (size, price, market) {
        const contract_value = this.safeFloat (market['info'], 'contract_value');
        if (market['info']['product_type'] === 'inverse_future') {
            return size * contract_value / price;
        } else {
            return size * contract_value * price;
        }
    }
};
