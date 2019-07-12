'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class mercado extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mercado',
            'name': 'Mercado Bitcoin',
            'countries': [ 'BR' ], // Brazil
            'rateLimit': 1000,
            'version': 'v3',
            'has': {
                'CORS': true,
                'createMarketOrder': true,
                'fetchOrder': true,
                'withdraw': true,
                'fetchOHLCV': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchTicker': true,
                'fetchTickers': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '2w': '2w',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg',
                'api': {
                    'public': 'https://www.mercadobitcoin.net/api',
                    'private': 'https://www.mercadobitcoin.net/tapi',
                    'v4Public': 'https://www.mercadobitcoin.com.br/v4',
                },
                'www': 'https://www.mercadobitcoin.com.br',
                'doc': [
                    'https://www.mercadobitcoin.com.br/api-doc',
                    'https://www.mercadobitcoin.com.br/trade-api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{coin}/orderbook/', // last slash critical
                        '{coin}/ticker/',
                        '{coin}/trades/',
                        '{coin}/trades/{from}/',
                        '{coin}/trades/{from}/{to}',
                        '{coin}/day-summary/{year}/{month}/{day}/',
                    ],
                },
                'private': {
                    'post': [
                        'cancel_order',
                        'get_account_info',
                        'get_order',
                        'get_withdrawal',
                        'list_system_messages',
                        'list_orders',
                        'list_orderbook',
                        'place_buy_order',
                        'place_sell_order',
                        'place_market_buy_order',
                        'place_market_sell_order',
                        'withdraw_coin',
                    ],
                },
                'v4Public': {
                    'get': [
                        '{coin}/candle/',
                    ],
                },
            },
            'markets': {
                'BTC/BRL': { 'id': 'BRLBTC', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'precision': { 'amount': 8, 'price': 5 }, 'suffix': 'Bitcoin' },
                'LTC/BRL': { 'id': 'BRLLTC', 'symbol': 'LTC/BRL', 'base': 'LTC', 'quote': 'BRL', 'precision': { 'amount': 8, 'price': 5 }, 'suffix': 'Litecoin' },
                'BCH/BRL': { 'id': 'BRLBCH', 'symbol': 'BCH/BRL', 'base': 'BCH', 'quote': 'BRL', 'precision': { 'amount': 8, 'price': 5 }, 'suffix': 'BCash' },
                'XRP/BRL': { 'id': 'BRLXRP', 'symbol': 'XRP/BRL', 'base': 'XRP', 'quote': 'BRL', 'precision': { 'amount': 8, 'price': 5 }, 'suffix': 'Ripple' },
                'ETH/BRL': { 'id': 'BRLETH', 'symbol': 'ETH/BRL', 'base': 'ETH', 'quote': 'BRL', 'precision': { 'amount': 8, 'price': 5 }, 'suffix': 'Ethereum' },
            },
            'fees': {
                'trading': {
                    'maker': 0.3 / 100,
                    'taker': 0.7 / 100,
                },
            },
        });
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin': market['base'],
        };
        const response = await this.publicGetCoinOrderbook (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin': market['base'],
        };
        const response = await this.publicGetCoinTicker (this.extend (request, params));
        const ticker = this.safeValue (response, 'ticker', {});
        let timestamp = this.safeInteger (ticker, 'date');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
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
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.safeInteger (trade, 'date');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (trade, 'tid');
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
            'order': undefined,
            'type': type,
            'side': side,
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
        let method = 'publicGetCoinTrades';
        const request = {
            'coin': market['base'],
        };
        if (since !== undefined) {
            method += 'From';
            request['from'] = parseInt (since / 1000);
        }
        const to = this.safeInteger (params, 'to');
        if (to !== undefined) {
            method += 'To';
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetAccountInfo (params);
        const data = this.safeValue (response, 'response_data', {});
        const balances = this.safeValue (data, 'balance', {});
        const result = { 'info': response };
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            if (currencyId in balances) {
                const balance = this.safeValue (balances, currencyId, {});
                const account = this.account ();
                account['free'] = this.safeFloat (balance, 'available');
                account['total'] = this.safeFloat (balance, 'total');
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'coin_pair': this.marketId (symbol),
        };
        let method = this.capitalize (side) + 'Order';
        if (type === 'limit') {
            method = 'privatePostPlace' + method;
            request['limit_price'] = this.priceToPrecision (symbol, price);
            request['quantity'] = this.amountToPrecision (symbol, amount);
        } else {
            method = 'privatePostPlaceMarket' + method;
            if (side === 'buy') {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + ' createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount');
                }
                request['cost'] = this.priceToPrecision (symbol, amount * price);
            } else {
                request['quantity'] = this.amountToPrecision (symbol, amount);
            }
        }
        const response = await this[method] (this.extend (request, params));
        // TODO: replace this with a call to parseOrder for unification
        return {
            'info': response,
            'id': response['response_data']['order']['order_id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder () requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin_pair': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostCancelOrder (this.extend (request, params));
        //
        //     {
        //         response_data: {
        //             order: {
        //                 order_id: 2176769,
        //                 coin_pair: 'BRLBCH',
        //                 order_type: 2,
        //                 status: 3,
        //                 has_fills: false,
        //                 quantity: '0.10000000',
        //                 limit_price: '1996.15999',
        //                 executed_quantity: '0.00000000',
        //                 executed_price_avg: '0.00000',
        //                 fee: '0.00000000',
        //                 created_timestamp: '1536956488',
        //                 updated_timestamp: '1536956499',
        //                 operations: []
        //             }
        //         },
        //         status_code: 100,
        //         server_unix_timestamp: '1536956499'
        //     }
        //
        const responseData = this.safeValue (response, 'response_data', {});
        const order = this.safeValue (responseData, 'order', {});
        return this.parseOrder (order, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            '2': 'open',
            '3': 'canceled',
            '4': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "order_id": 4,
        //         "coin_pair": "BRLBTC",
        //         "order_type": 1,
        //         "status": 2,
        //         "has_fills": true,
        //         "quantity": "2.00000000",
        //         "limit_price": "900.00000",
        //         "executed_quantity": "1.00000000",
        //         "executed_price_avg": "900.00000",
        //         "fee": "0.00300000",
        //         "created_timestamp": "1453838494",
        //         "updated_timestamp": "1453838494",
        //         "operations": [
        //             {
        //                 "operation_id": 1,
        //                 "quantity": "1.00000000",
        //                 "price": "900.00000",
        //                 "fee_rate": "0.30",
        //                 "executed_timestamp": "1453838494",
        //             },
        //         ],
        //     }
        //
        const id = this.safeString (order, 'order_id');
        let side = undefined;
        if ('order_type' in order) {
            side = (order['order_type'] === 1) ? 'buy' : 'sell';
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (order, 'coin_pair');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = this.safeInteger (order, 'created_timestamp');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
        const fee = {
            'cost': this.safeFloat (order, 'fee'),
            'currency': market['quote'],
        };
        const price = this.safeFloat (order, 'limit_price');
        // price = this.safeFloat (order, 'executed_price_avg', price);
        const average = this.safeFloat (order, 'executed_price_avg');
        const amount = this.safeFloat (order, 'quantity');
        const filled = this.safeFloat (order, 'executed_quantity');
        const remaining = amount - filled;
        const cost = filled * average;
        let lastTradeTimestamp = this.safeInteger (order, 'updated_timestamp');
        if (lastTradeTimestamp !== undefined) {
            lastTradeTimestamp = lastTradeTimestamp * 1000;
        }
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined, // todo parse trades (operations)
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder () requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin_pair': market['id'],
            'order_id': parseInt (id),
        };
        const response = await this.privatePostGetOrder (this.extend (request, params));
        const responseData = this.safeValue (response, 'response_data', {});
        const order = this.safeValue (responseData, 'order');
        return this.parseOrder (order, market);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
            'quantity': amount.toFixed (10),
            'address': address,
        };
        if (code === 'BRL') {
            const account_ref = ('account_ref' in params);
            if (!account_ref) {
                throw new ExchangeError (this.id + ' requires account_ref parameter to withdraw ' + code);
            }
        } else if (code !== 'LTC') {
            const tx_fee = ('tx_fee' in params);
            if (!tx_fee) {
                throw new ExchangeError (this.id + ' requires tx_fee parameter to withdraw ' + code);
            }
            if (code === 'XRP') {
                if (tag === undefined) {
                    if (!('destination_tag' in params)) {
                        throw new ExchangeError (this.id + ' requires a tag argument or destination_tag parameter to withdraw ' + code);
                    }
                } else {
                    request['destination_tag'] = tag;
                }
            }
        }
        const response = await this.privatePostWithdrawCoin (this.extend (request, params));
        return {
            'info': response,
            'id': response['response_data']['withdrawal']['id'],
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        let timestamp = this.safeInteger (ohlcv, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
        return [
            timestamp,
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'precision': this.timeframes[timeframe],
            'coin': market['id'].toLowerCase (),
        };
        if (limit !== undefined && since !== undefined) {
            request['from'] = parseInt (since / 1000);
            request['to'] = this.sum (request['from'], limit * this.parseTimeframe (timeframe));
        } else if (since !== undefined) {
            request['from'] = parseInt (since / 1000);
            request['to'] = this.sum (this.seconds (), 1);
        } else if (limit !== undefined) {
            request['to'] = this.seconds ();
            request['from'] = request['to'] - (limit * this.parseTimeframe (timeframe));
        }
        const response = await this.v4PublicGetCoinCandle (this.extend (request, params));
        const candles = this.safeValue (response, 'candles', []);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders () requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin_pair': market['id'],
        };
        const response = await this.privatePostListOrders (this.extend (request, params));
        const responseData = this.safeValue (response, 'response_data', {});
        const orders = this.safeValue (responseData, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public' || (api === 'v4Public')) {
            url += this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            url += this.version + '/';
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'tapi_method': path,
                'tapi_nonce': nonce,
            }, params));
            const auth = '/tapi/' + this.version + '/' + '?' + body;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'TAPI-ID': this.apiKey,
                'TAPI-MAC': this.hmac (this.encode (auth), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error_message' in response) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }
};
