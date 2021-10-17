'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InvalidOrder } = require ('./base/errors');
const Precise = require ('./base/Precise');

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
                'cancelOrder': true,
                'CORS': true,
                'createMarketOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchMyTrades': 'emulated',
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': undefined,
                'fetchTrades': true,
                'withdraw': true,
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
                        'coins',
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
            'fees': {
                'trading': {
                    'maker': 0.003,
                    'taker': 0.007,
                },
            },
            'options': {
                'limits': {
                    'BTC': 0.001,
                    'BCH': 0.001,
                    'ETH': 0.01,
                    'LTC': 0.01,
                    'XRP': 0.1,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetCoins (params);
        //
        //     [
        //         "BCH",
        //         "BTC",
        //         "ETH",
        //         "LTC",
        //         "XRP",
        //         "MBPRK01",
        //         "MBPRK02",
        //         "MBPRK03",
        //         "MBPRK04",
        //         "MBCONS01",
        //         "USDC",
        //         "WBX",
        //         "CHZ",
        //         "MBCONS02",
        //         "PAXG",
        //         "MBVASCO01",
        //         "LINK"
        //     ]
        //
        const result = [];
        const amountLimits = this.safeValue (this.options, 'limits', {});
        for (let i = 0; i < response.length; i++) {
            const coin = response[i];
            const baseId = coin;
            const quoteId = 'BRL';
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const id = quote + base;
            const precision = {
                'amount': 8,
                'price': 5,
            };
            const priceLimit = '1e-5';
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': true,
                'active': undefined,
                'info': coin,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (amountLimits, baseId),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.parseNumber (priceLimit),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin': market['base'],
        };
        const response = await this.publicGetCoinOrderbook (this.extend (request, params));
        return this.parseOrderBook (response, symbol);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin': market['base'],
        };
        const response = await this.publicGetCoinTicker (this.extend (request, params));
        const ticker = this.safeValue (response, 'ticker', {});
        const timestamp = this.safeTimestamp (ticker, 'date');
        const last = this.safeNumber (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp2 (trade, 'date', 'executed_timestamp');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString2 (trade, 'tid', 'operation_id');
        const type = undefined;
        const side = this.safeString (trade, 'type');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString2 (trade, 'amount', 'quantity');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const feeCost = this.safeNumber (trade, 'fee_rate');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
            };
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
            'fee': fee,
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
                account['free'] = this.safeString (balance, 'available');
                account['total'] = this.safeString (balance, 'total');
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
        const order_type = this.safeString (order, 'order_type');
        let side = undefined;
        if ('order_type' in order) {
            side = (order_type === '1') ? 'buy' : 'sell';
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'coin_pair');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeTimestamp (order, 'created_timestamp');
        const fee = {
            'cost': this.safeNumber (order, 'fee'),
            'currency': market['quote'],
        };
        const price = this.safeNumber (order, 'limit_price');
        // price = this.safeNumber (order, 'executed_price_avg', price);
        const average = this.safeNumber (order, 'executed_price_avg');
        const amount = this.safeNumber (order, 'quantity');
        const filled = this.safeNumber (order, 'executed_quantity');
        const lastTradeTimestamp = this.safeTimestamp (order, 'updated_timestamp');
        const rawTrades = this.safeValue (order, 'operations', []);
        const trades = this.parseTrades (rawTrades, market, undefined, undefined, {
            'side': side,
            'order': id,
        });
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': market['symbol'],
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': undefined,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': trades,
        });
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
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
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
                throw new ArgumentsRequired (this.id + ' withdraw() requires account_ref parameter to withdraw ' + code);
            }
        } else if (code !== 'LTC') {
            const tx_fee = ('tx_fee' in params);
            if (!tx_fee) {
                throw new ArgumentsRequired (this.id + ' withdraw() requires tx_fee parameter to withdraw ' + code);
            }
            if (code === 'XRP') {
                if (tag === undefined) {
                    if (!('destination_tag' in params)) {
                        throw new ArgumentsRequired (this.id + ' withdraw() requires a tag argument or destination_tag parameter to withdraw ' + code);
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

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeTimestamp (ohlcv, 'timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
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

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders () requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin_pair': market['id'],
            'status_list': '[2]', // open only
        };
        const response = await this.privatePostListOrders (this.extend (request, params));
        const responseData = this.safeValue (response, 'response_data', {});
        const orders = this.safeValue (responseData, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades () requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin_pair': market['id'],
            'has_fills': true,
        };
        const response = await this.privatePostListOrders (this.extend (request, params));
        const responseData = this.safeValue (response, 'response_data', {});
        const ordersRaw = this.safeValue (responseData, 'orders', []);
        const orders = this.parseOrders (ordersRaw, market, since, limit);
        const trades = this.ordersToTrades (orders);
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit);
    }

    ordersToTrades (orders) {
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            const trades = this.safeValue (orders[i], 'trades', []);
            for (let y = 0; y < trades.length; y++) {
                result.push (trades[y]);
            }
        }
        return result;
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

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        // todo add a unified standard handleErrors with this.exceptions in describe()
        //
        //     {"status":503,"message":"Maintenancing, try again later","result":null}
        //
        const errorMessage = this.safeValue (response, 'error_message');
        if (errorMessage !== undefined) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
    }
};
