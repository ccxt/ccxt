'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, InsufficientFunds, OrderNotFound, NotSupported } = require ('./base/errors');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class kuna extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kuna',
            'name': 'Kuna',
            'countries': [ 'UA' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchL3OrderBook': true,
                'fetchLeverage': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setPositionMode': false,
                'withdraw': undefined,
            },
            'timeframes': undefined,
            'urls': {
                'extension': '.json',
                'referral': 'https://kuna.io?r=kunaid-gvfihe8az7o4',
                'logo': 'https://user-images.githubusercontent.com/51840849/87153927-f0578b80-c2c0-11ea-84b6-74612568e9e1.jpg',
                'api': {
                    'xreserve': 'https://api.xreserve.fund',
                    'v3': 'https://api.kuna.io',
                    'public': 'https://kuna.io', // v2
                    'private': 'https://kuna.io', // v2
                },
                'www': 'https://kuna.io',
                'doc': 'https://kuna.io/documents/api',
                'fees': 'https://kuna.io/documents/api',
            },
            'api': {
                'xreserve': {
                    'get': {
                        'nonce': 1,
                        'fee': 1,
                        'delegated-transactions': 1,
                    },
                    'post': {
                        'delegate-transfer': 1,
                    },
                },
                'v3': {
                    'public': {
                        'get': {
                            'timestamp': 1,
                            'currencies': 1,
                            'markets': 1,
                            'tickers': 1,
                            'k': 1,
                            'trades_history': 1,
                            'fees': 1,
                            'exchange-rates': 1,
                            'exchange-rates/currency': 1,
                            'book/market': 1,
                            'kuna_codes/code/check': 1,
                            'landing_page_statistic': 1,
                            'translations/locale': 1,
                            'trades/market/hist': 1,
                        },
                        'post': {
                            'http_test': 1,
                            'deposit_channels': 1,
                            'withdraw_channels': 1,
                            'subscription_plans': 1,
                            'send_to': 1,
                            'confirm_token': 1,
                            'kunaid': 1,
                            'withdraw/prerequest': 1,
                            'deposit/prerequest': 1,
                            'deposit/exchange-rates': 1,
                        },
                    },
                    'sign': {
                        'get': {
                            'reset_password/token': 1,
                        },
                        'post': {
                            'signup/google': 1,
                            'signup/resend_confirmation': 1,
                            'signup': 1,
                            'signin': 1,
                            'signin/two_factor': 1,
                            'signin/resend_confirm_device': 1,
                            'signin/confirm_device': 1,
                            'reset_password': 1,
                            'cool-signin': 1,
                        },
                        'put': {
                            'reset_password/token': 1,
                            'signup/code/confirm': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'auth/w/order/submit': 1,
                            'auth/r/orders': 1,
                            'auth/r/orders/market': 1,
                            'auth/r/orders/markets': 1,
                            'auth/api_tokens/delete': 1,
                            'auth/api_tokens/create': 1,
                            'auth/api_tokens': 1,
                            'auth/signin_history/uniq': 1,
                            'auth/signin_history': 1,
                            'auth/disable_withdraw_confirmation': 1,
                            'auth/change_password': 1,
                            'auth/deposit_address': 1,
                            'auth/announcements/accept': 1,
                            'auth/announcements/unaccepted': 1,
                            'auth/otp/deactivate': 1,
                            'auth/otp/activate': 1,
                            'auth/otp/secret': 1,
                            'auth/r/order/market/:order_id/trades': 1,
                            'auth/r/orders/market/hist': 1,
                            'auth/r/orders/hist': 1,
                            'auth/r/orders/hist/markets': 1,
                            'auth/r/orders/details': 1,
                            'auth/assets-history': 1,
                            'auth/assets-history/withdraws': 1,
                            'auth/assets-history/deposits': 1,
                            'auth/r/wallets': 1,
                            'auth/markets/favorites': 1,
                            'auth/markets/favorites/list': 1,
                            'auth/me/update': 1,
                            'auth/me': 1,
                            'auth/fund_sources': 1,
                            'auth/fund_sources/list': 1,
                            'auth/withdraw/resend_confirmation': 1,
                            'auth/withdraw': 1,
                            'auth/withdraw/details': 1,
                            'auth/withdraw/info': 1,
                            'auth/payment_addresses': 1,
                            'auth/deposit/prerequest': 1,
                            'auth/deposit/exchange-rates': 1,
                            'auth/deposit': 1,
                            'auth/deposit/details': 1,
                            'auth/deposit/info': 1,
                            'auth/kuna_codes/count': 1,
                            'auth/kuna_codes/details': 1,
                            'auth/kuna_codes/edit': 1,
                            'auth/kuna_codes/send-pdf': 1,
                            'auth/kuna_codes': 1,
                            'auth/kuna_codes/redeemed-by-me': 1,
                            'auth/kuna_codes/issued-by-me': 1,
                            'auth/payment_requests/invoice': 1,
                            'auth/payment_requests/type': 1,
                            'auth/referral_program/weekly_earnings': 1,
                            'auth/referral_program/stats': 1,
                            'auth/merchant/payout_services': 1,
                            'auth/merchant/withdraw': 1,
                            'auth/merchant/payment_services': 1,
                            'auth/merchant/deposit': 1,
                            'auth/verification/auth_token': 1,
                            'auth/kunaid_purchase/create': 1,
                            'auth/devices/list': 1,
                            'auth/sessions/list': 1,
                            'auth/subscriptions/reactivate': 1,
                            'auth/subscriptions/cancel': 1,
                            'auth/subscriptions/prolong': 1,
                            'auth/subscriptions/create': 1,
                            'auth/subscriptions/list': 1,
                            'auth/kuna_ids/list': 1,
                            'order/cancel/multi': 1,
                            'order/cancel': 1,
                        },
                        'put': {
                            'auth/fund_sources/id': 1,
                            'auth/kuna_codes/redeem': 1,
                        },
                        'delete': {
                            'auth/markets/favorites': 1,
                            'auth/fund_sources': 1,
                            'auth/devices': 1,
                            'auth/devices/list': 1,
                            'auth/sessions/list': 1,
                            'auth/sessions': 1,
                        },
                    },
                },
                'public': {
                    'get': [
                        'depth', // Get depth or specified market Both asks and bids are sorted from highest price to lowest.
                        'k_with_pending_trades', // Get K data with pending trades, which are the trades not included in K data yet, because there's delay between trade generated and processed by K data generator
                        'k', // Get OHLC(k line) of specific market
                        'markets', // Get all available markets
                        'order_book', // Get the order book of specified market
                        'order_book/{market}',
                        'tickers', // Get ticker of all markets
                        'tickers/{market}', // Get ticker of specific market
                        'timestamp', // Get server current time, in seconds since Unix epoch
                        'trades', // Get recent trades on market, each trade is included only once Trades are sorted in reverse creation order.
                        'trades/{market}',
                    ],
                },
                'private': {
                    'get': [
                        'members/me', // Get your profile and accounts info
                        'deposits', // Get your deposits history
                        'deposit', // Get details of specific deposit
                        'deposit_address', // Where to deposit The address field could be empty when a new address is generating (e.g. for bitcoin), you should try again later in that case.
                        'orders', // Get your orders, results is paginated
                        'order', // Get information of specified order
                        'trades/my', // Get your executed trades Trades are sorted in reverse creation order.
                        'withdraws', // Get your cryptocurrency withdraws
                        'withdraw', // Get your cryptocurrency withdraw
                    ],
                    'post': [
                        'orders', // Create a Sell/Buy order
                        'orders/multi', // Create multiple sell/buy orders
                        'orders/clear', // Cancel all my orders
                        'order/delete', // Cancel an order
                        'withdraw', // Create a withdraw
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0025'),
                    'maker': this.parseNumber ('0.0025'),
                },
                'funding': {
                    'withdraw': {
                        'UAH': '1%',
                        'BTC': 0.001,
                        'BCH': 0.001,
                        'ETH': 0.01,
                        'WAVES': 0.01,
                        'GOL': 0.0,
                        'GBG': 0.0,
                        // 'RMC': 0.001 BTC
                        // 'ARN': 0.01 ETH
                        // 'R': 0.01 ETH
                        // 'EVR': 0.01 ETH
                    },
                    'deposit': {
                        // 'UAH': (amount) => amount * 0.001 + 5
                    },
                },
            },
            'commonCurrencies': {
                'PLA': 'Plair',
            },
            'exceptions': {
                '2002': InsufficientFunds,
                '2003': OrderNotFound,
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTimestamp (params);
        //
        //     1594911427
        //
        return response * 1000;
    }

    async fetchMarkets (params = {}) {
        const quotes = [ 'btc', 'rub', 'uah', 'usd', 'usdt', 'usdc' ];
        const markets = [];
        const response = await this.publicGetTickers (params);
        //
        //    {
        //        shibuah: {
        //            at: '1644463685',
        //            ticker: {
        //                buy: '0.000911',
        //                sell: '0.00092',
        //                low: '0.000872',
        //                high: '0.000963',
        //                last: '0.000911',
        //                vol: '1539278096.0',
        //                price: '1434244.211249'
        //            }
        //        }
        //    }
        //
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            for (let j = 0; j < quotes.length; j++) {
                const quoteId = quotes[j];
                // usd gets matched before usdt in usdtusd USDT/USD
                // https://github.com/ccxt/ccxt/issues/9868
                const slicedId = id.slice (1);
                const index = slicedId.indexOf (quoteId);
                const slice = slicedId.slice (index);
                if ((index > 0) && (slice === quoteId)) {
                    // usd gets matched before usdt in usdtusd USDT/USD
                    // https://github.com/ccxt/ccxt/issues/9868
                    const baseId = id[0] + slicedId.replace (quoteId, '');
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    markets.push ({
                        'id': id,
                        'symbol': base + '/' + quote,
                        'base': base,
                        'quote': quote,
                        'settle': undefined,
                        'baseId': baseId,
                        'quoteId': quoteId,
                        'settleId': undefined,
                        'type': 'spot',
                        'spot': true,
                        'margin': false,
                        'swap': false,
                        'future': false,
                        'option': false,
                        'active': undefined,
                        'contract': false,
                        'linear': undefined,
                        'inverse': undefined,
                        'contractSize': undefined,
                        'expiry': undefined,
                        'expiryDatetime': undefined,
                        'strike': undefined,
                        'optionType': undefined,
                        'precision': {
                            'amount': undefined,
                            'price': undefined,
                        },
                        'limits': {
                            'leverage': {
                                'min': undefined,
                                'max': undefined,
                            },
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
                        },
                        'info': undefined,
                    });
                }
            }
        }
        return markets;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 300
        }
        const orderbook = await this.publicGetDepth (this.extend (request, params));
        const timestamp = this.safeTimestamp (orderbook, 'timestamp');
        return this.parseOrderBook (orderbook, symbol, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeTimestamp (ticker, 'at');
        ticker = ticker['ticker'];
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let market = undefined;
            let symbol = id;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                let base = id.slice (0, 3);
                let quote = id.slice (3, 6);
                base = base.toUpperCase ();
                quote = quote.toUpperCase ();
                base = this.safeCurrencyCode (base);
                quote = this.safeCurrencyCode (quote);
                symbol = base + '/' + quote;
            }
            result[symbol] = this.parseTicker (response[id], market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTickersMarket (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchL3OrderBook (symbol, limit = undefined, params = {}) {
        return await this.fetchOrderBook (symbol, limit, params);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        let side = this.safeString2 (trade, 'side', 'trend');
        if (side !== undefined) {
            const sideMap = {
                'ask': 'sell',
                'bid': 'buy',
            };
            side = this.safeString (sideMap, side, side);
        }
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'volume');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        let cost = this.safeNumber (trade, 'funds');
        if (cost === undefined) {
            cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        }
        const orderId = this.safeString (trade, 'order_id');
        const id = this.safeString (trade, 'id');
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'order': orderId,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const trades = await this.fetchTrades (symbol, since, limit, params);
        const ohlcvc = this.buildOHLCVC (trades, timeframe, since, limit);
        const result = [];
        for (let i = 0; i < ohlcvc.length; i++) {
            const ohlcv = ohlcvc[i];
            result.push ([
                ohlcv[0],
                ohlcv[1],
                ohlcv[2],
                ohlcv[3],
                ohlcv[4],
                ohlcv[5],
            ]);
        }
        return result;
    }

    parseBalance (response) {
        const balances = this.safeValue (response, 'accounts');
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetMembersMe (params);
        return this.parseBalance (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            'side': side,
            'volume': amount.toString (),
            'ord_type': type,
        };
        if (type === 'limit') {
            request['price'] = price.toString ();
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const marketId = this.safeValue (response, 'market');
        const market = this.safeValue (this.markets_by_id, marketId);
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privatePostOrderDelete (this.extend (request, params));
        const order = this.parseOrder (response);
        const status = order['status'];
        if (status === 'closed' || status === 'canceled') {
            throw new OrderNotFound (this.id + ' ' + this.json (order));
        }
        return order;
    }

    parseOrderStatus (status) {
        const statuses = {
            'done': 'closed',
            'wait': 'open',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const marketId = this.safeString (order, 'market');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const id = this.safeString (order, 'id');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString (order, 'price'),
            'stopPrice': undefined,
            'amount': this.safeString (order, 'volume'),
            'filled': this.safeString (order, 'executed_volume'),
            'remaining': this.safeString (order, 'remaining_volume'),
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'cost': undefined,
            'average': undefined,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': parseInt (id),
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.privateGetOrders (this.extend (request, params));
        // todo emulation of fetchClosedOrders, fetchOrders, fetchOrder
        // with order cache + fetchOpenOrders
        // as in BTC-e, Liqui, Yobit, DSX, Tidex, WEX
        return this.parseOrders (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.privateGetTradesMy (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    encodeParams (params) {
        if ('orders' in params) {
            const orders = params['orders'];
            let query = this.urlencode (this.keysort (this.omit (params, 'orders')));
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                const keys = Object.keys (order);
                for (let k = 0; k < keys.length; k++) {
                    const key = keys[k];
                    const value = order[key];
                    query += '&orders%5B%5D%5B' + key + '%5D=' + value.toString ();
                }
            }
            return query;
        }
        return this.urlencode (this.keysort (params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = undefined;
        if (Array.isArray (api)) {
            const [ version, access ] = api;
            url = this.urls['api'][version] + '/' + version + '/' + this.implodeParams (path, params);
            if (access === 'public') {
                if (method === 'GET') {
                    if (Object.keys (params).length) {
                        url += '?' + this.urlencode (params);
                    }
                } else if ((method === 'POST') || (method === 'PUT')) {
                    headers = { 'Content-Type': 'application/json' };
                    body = this.json (params);
                }
            } else if (access === 'private') {
                throw new NotSupported (this.id + ' private v3 API is not supported yet');
            }
        } else {
            let request = '/api/' + this.version + '/' + this.implodeParams (path, params);
            if ('extension' in this.urls) {
                request += this.urls['extension'];
            }
            const query = this.omit (params, this.extractParams (path));
            url = this.urls['api'][api] + request;
            if (api === 'public') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                this.checkRequiredCredentials ();
                const nonce = this.nonce ().toString ();
                const query = this.encodeParams (this.extend ({
                    'access_key': this.apiKey,
                    'tonce': nonce,
                }, params));
                const auth = method + '|' + request + '|' + query;
                const signed = this.hmac (this.encode (auth), this.encode (this.secret));
                const suffix = query + '&signature=' + signed;
                if (method === 'GET') {
                    url += '?' + suffix;
                } else {
                    body = suffix;
                    headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code === 400) {
            const error = this.safeValue (response, 'error');
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + this.json (response);
            this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
            // fallback to default error handler
        }
    }
};
