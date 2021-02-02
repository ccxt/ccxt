'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InsufficientFunds, InvalidOrder, OrderNotFound, AuthenticationError, BadSymbol } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class indodax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'indodax',
            'name': 'INDODAX',
            'countries': [ 'ID' ], // Indonesia
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'withdraw': true,
            },
            'version': '2.0', // as of 9 April 2018
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87070508-9358c880-c221-11ea-8dc5-5391afbbb422.jpg',
                'api': {
                    'public': 'https://indodax.com/api',
                    'private': 'https://indodax.com/tapi',
                },
                'www': 'https://www.indodax.com',
                'doc': 'https://github.com/btcid/indodax-official-api-docs',
                'referral': 'https://indodax.com/ref/testbitcoincoid/1',
            },
            'api': {
                'public': {
                    'get': [
                        'server_time',
                        'pairs',
                        '{pair}/ticker',
                        '{pair}/trades',
                        '{pair}/depth',
                    ],
                },
                'private': {
                    'post': [
                        'getInfo',
                        'transHistory',
                        'trade',
                        'tradeHistory',
                        'getOrder',
                        'openOrders',
                        'cancelOrder',
                        'orderHistory',
                        'withdrawCoin',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0,
                    'taker': 0.003,
                },
            },
            'exceptions': {
                'exact': {
                    'invalid_pair': BadSymbol, // {"error":"invalid_pair","error_description":"Invalid Pair"}
                    'Insufficient balance.': InsufficientFunds,
                    'invalid order.': OrderNotFound,
                    'Invalid credentials. API not found or session has expired.': AuthenticationError,
                    'Invalid credentials. Bad sign.': AuthenticationError,
                },
                'broad': {
                    'Minimum price': InvalidOrder,
                    'Minimum order': InvalidOrder,
                },
            },
            // exchange-specific options
            'options': {
                'recvWindow': 5 * 1000, // default 5 sec
                'timeDifference': 0, // the difference between system clock and exchange clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
            },
            'commonCurrencies': {
                'STR': 'XLM',
                'BCHABC': 'BCH',
                'BCHSV': 'BSV',
                'DRK': 'DASH',
                'NEM': 'XEM',
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetServerTime (params);
        //
        //     {
        //         "timezone": "UTC",
        //         "server_time": 1571205969552
        //     }
        //
        return this.safeInteger (response, 'server_time');
    }

    async loadTimeDifference (params = {}) {
        const serverTime = await this.fetchTime (params);
        const after = this.milliseconds ();
        this.options['timeDifference'] = after - serverTime;
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetPairs (params);
        //
        //     [
        //         {
        //             "id": "btcidr",
        //             "symbol": "BTCIDR",
        //             "base_currency": "idr",
        //             "traded_currency": "btc",
        //             "traded_currency_unit": "BTC",
        //             "description": "BTC/IDR",
        //             "ticker_id": "btc_idr",
        //             "volume_precision": 0,
        //             "price_precision": 1000,
        //             "price_round": 8,
        //             "pricescale": 1000,
        //             "trade_min_base_currency": 10000,
        //             "trade_min_traded_currency": 0.00007457,
        //             "has_memo": false,
        //             "memo_name": false,
        //             "has_payment_id": false,
        //             "trade_fee_percent": 0.3,
        //             "url_logo": "https://indodax.com/v2/logo/svg/color/btc.svg",
        //             "url_logo_png": "https://indodax.com/v2/logo/png/color/btc.png",
        //             "is_maintenance": 0
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'ticker_id');
            const baseId = this.safeString (market, 'traded_currency');
            const quoteId = this.safeString (market, 'base_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const taker = this.safeFloat (market, 'trade_fee_percent');
            const isMaintenance = this.safeInteger (market, 'is_maintenance');
            const active = (isMaintenance) ? false : true;
            const pricePrecision = this.safeInteger (market, 'price_round');
            const precision = {
                'amount': 8,
                'price': pricePrecision,
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'trade_min_traded_currency'),
                    'max': undefined,
                },
                'price': {
                    'min': this.safeFloat (market, 'trade_min_base_currency'),
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'taker': taker,
                'percentage': true,
                'precision': precision,
                'limits': limits,
                'info': market,
                'active': active,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetInfo (params);
        const balances = this.safeValue (response, 'return', {});
        const free = this.safeValue (balances, 'balance', {});
        const used = this.safeValue (balances, 'balance_hold', {});
        const result = { 'info': response };
        const currencyIds = Object.keys (free);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (free, currencyId);
            account['used'] = this.safeFloat (used, currencyId);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const orderbook = await this.publicGetPairDepth (this.extend (request, params));
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetPairTicker (this.extend (request, params));
        //
        //     {
        //         "ticker": {
        //             "high":"0.01951",
        //             "low":"0.01877",
        //             "vol_eth":"39.38839319",
        //             "vol_btc":"0.75320886",
        //             "last":"0.01896",
        //             "buy":"0.01896",
        //             "sell":"0.019",
        //             "server_time":1565248908
        //         }
        //     }
        //
        const ticker = response['ticker'];
        const timestamp = this.safeTimestamp (ticker, 'server_time');
        const baseVolume = 'vol_' + market['baseId'].toLowerCase ();
        const quoteVolume = 'vol_' + market['quoteId'].toLowerCase ();
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, baseVolume),
            'quoteVolume': this.safeFloat (ticker, quoteVolume),
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'date');
        const id = this.safeString (trade, 'tid');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const type = undefined;
        const side = this.safeString (trade, 'type');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetPairTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "order_id": "12345",
        //         "submit_time": "1392228122",
        //         "price": "8000000",
        //         "type": "sell",
        //         "order_ltc": "100000000",
        //         "remain_ltc": "100000000"
        //     }
        //
        let side = undefined;
        if ('type' in order) {
            side = order['type'];
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status', 'open'));
        let symbol = undefined;
        let cost = undefined;
        const price = this.safeFloat (order, 'price');
        let amount = undefined;
        let remaining = undefined;
        let filled = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            let quoteId = market['quoteId'];
            let baseId = market['baseId'];
            if ((market['quoteId'] === 'idr') && ('order_rp' in order)) {
                quoteId = 'rp';
            }
            if ((market['baseId'] === 'idr') && ('remain_rp' in order)) {
                baseId = 'rp';
            }
            cost = this.safeFloat (order, 'order_' + quoteId);
            if (cost) {
                amount = cost / price;
                const remainingCost = this.safeFloat (order, 'remain_' + quoteId);
                if (remainingCost !== undefined) {
                    remaining = remainingCost / price;
                    filled = amount - remaining;
                }
            } else {
                amount = this.safeFloat (order, 'order_' + baseId);
                cost = price * amount;
                remaining = this.safeFloat (order, 'remain_' + baseId);
                filled = amount - remaining;
            }
        }
        let average = undefined;
        if (filled) {
            average = cost / filled;
        }
        const timestamp = this.safeInteger (order, 'submit_time');
        const fee = undefined;
        const id = this.safeString (order, 'order_id');
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostGetOrder (this.extend (request, params));
        const orders = response['return'];
        const order = this.parseOrder (this.extend ({ 'id': id }, orders['order']), market);
        return this.extend ({ 'info': response }, order);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privatePostOpenOrders (this.extend (request, params));
        const rawOrders = response['return']['orders'];
        // { success: 1, return: { orders: null }} if no orders
        if (!rawOrders) {
            return [];
        }
        // { success: 1, return: { orders: [ ... objects ] }} for orders fetched by symbol
        if (symbol !== undefined) {
            return this.parseOrders (rawOrders, market, since, limit);
        }
        // { success: 1, return: { orders: { marketid: [ ... objects ] }}} if all orders are fetched
        const marketIds = Object.keys (rawOrders);
        let exchangeOrders = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const marketOrders = rawOrders[marketId];
            market = this.markets_by_id[marketId];
            const parsedOrders = this.parseOrders (marketOrders, market, since, limit);
            exchangeOrders = this.arrayConcat (exchangeOrders, parsedOrders);
        }
        return exchangeOrders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privatePostOrderHistory (this.extend (request, params));
        let orders = this.parseOrders (response['return']['orders'], market);
        orders = this.filterBy (orders, 'status', 'closed');
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': side,
            'price': price,
        };
        const currency = market['baseId'];
        if (side === 'buy') {
            request[market['quoteId']] = amount * price;
        } else {
            request[market['baseId']] = amount;
        }
        request[currency] = amount;
        const result = await this.privatePostTrade (this.extend (request, params));
        const data = this.safeValue (result, 'return', {});
        const id = this.safeString (data, 'order_id');
        return {
            'info': result,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        const side = this.safeValue (params, 'side');
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires an extra "side" param');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'pair': market['id'],
            'type': side,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        // Custom string you need to provide to identify each withdrawal.
        // Will be passed to callback URL (assigned via website to the API key)
        // so your system can identify the request and confirm it.
        // Alphanumeric, max length 255.
        const requestId = this.milliseconds ();
        // Alternatively:
        // let requestId = this.uuid ();
        const request = {
            'currency': currency['id'],
            'withdraw_amount': amount,
            'withdraw_address': address,
            'request_id': requestId.toString (),
        };
        if (tag) {
            request['withdraw_memo'] = tag;
        }
        const response = await this.privatePostWithdrawCoin (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "status": "approved",
        //         "withdraw_currency": "xrp",
        //         "withdraw_address": "rwWr7KUZ3ZFwzgaDGjKBysADByzxvohQ3C",
        //         "withdraw_amount": "10000.00000000",
        //         "fee": "2.00000000",
        //         "amount_after_fee": "9998.00000000",
        //         "submit_time": "1509469200",
        //         "withdraw_id": "xrp-12345",
        //         "txid": "",
        //         "withdraw_memo": "123123"
        //     }
        //
        let id = undefined;
        if (('txid' in response) && (response['txid'].length > 0)) {
            id = response['txid'];
        }
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'public') {
            url += '/' + this.implodeParams (path, params);
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'method': path,
                'timestamp': this.nonce (),
                'recvWindow': this.options['recvWindow'],
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        // { success: 0, error: "invalid order." }
        // or
        // [{ data, ... }, { ... }, ... ]
        if (Array.isArray (response)) {
            return; // public endpoints may return []-arrays
        }
        const error = this.safeValue (response, 'error', '');
        if (!('success' in response) && error === '') {
            return; // no 'success' property on public responses
        }
        if (this.safeInteger (response, 'success', 0) === 1) {
            // { success: 1, return: { orders: [] }}
            if (!('return' in response)) {
                throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
            } else {
                return;
            }
        }
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
        throw new ExchangeError (feedback); // unknown message
    }
};
