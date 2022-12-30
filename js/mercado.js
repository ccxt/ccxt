'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InvalidOrder } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

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
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': 'emulated',
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': undefined,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': true,
            },
            'timeframes': {
                '15m': '15m',
                '1h': '1h',
                '3h': '3h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg',
                'api': {
                    'public': 'https://www.mercadobitcoin.net/api',
                    'private': 'https://www.mercadobitcoin.net/tapi',
                    'v4Public': 'https://www.mercadobitcoin.com.br/v4',
                    'v4PublicNet': 'https://api.mercadobitcoin.net/api/v4',
                },
                'www': 'https://www.mercadobitcoin.com.br',
                'doc': [
                    'https://www.mercadobitcoin.com.br/api-doc',
                    'https://www.mercadobitcoin.com.br/trade-api',
                    'https://api.mercadobitcoin.net/api/v4/docs/',
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
                'v4PublicNet': {
                    'get': [
                        'candles',
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
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name mercado#fetchMarkets
         * @description retrieves data on all markets for mercado
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
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
            const id = quote + base;
            result.push ({
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
                    'amount': this.parseNumber ('1e-8'),
                    'price': this.parseNumber ('1e-5'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (amountLimits, baseId),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.parseNumber ('1e-5'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': coin,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name mercado#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the mercado api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin': market['base'],
        };
        const response = await this.publicGetCoinOrderbook (this.extend (request, params));
        return this.parseOrderBook (response, market['symbol']);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "high":"103.96000000",
        //         "low":"95.00000000",
        //         "vol":"2227.67806598",
        //         "last":"97.91591000",
        //         "buy":"95.52760000",
        //         "sell":"97.91475000",
        //         "open":"99.79955000",
        //         "date":1643382606
        //     }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.safeTimestamp (ticker, 'date');
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
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name mercado#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the mercado api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin': market['base'],
        };
        const response = await this.publicGetCoinTicker (this.extend (request, params));
        const ticker = this.safeValue (response, 'ticker', {});
        //
        //     {
        //         "ticker": {
        //             "high":"1549.82293000",
        //             "low":"1503.00011000",
        //             "vol":"81.82827101",
        //             "last":"1533.15000000",
        //             "buy":"1533.21018000",
        //             "sell":"1540.09000000",
        //             "open":"1524.71089000",
        //             "date":1643691671
        //         }
        //     }
        //
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp2 (trade, 'date', 'executed_timestamp');
        market = this.safeMarket (undefined, market);
        const id = this.safeString2 (trade, 'tid', 'operation_id');
        const type = undefined;
        const side = this.safeString (trade, 'type');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString2 (trade, 'amount', 'quantity');
        const feeCost = this.safeString (trade, 'fee_rate');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mercado#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the mercado api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
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

    parseBalance (response) {
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
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name mercado#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the mercado api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostGetAccountInfo (params);
        return this.parseBalance (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name mercado#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the mercado api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coin_pair': market['id'],
        };
        let method = this.capitalize (side) + 'Order';
        if (type === 'limit') {
            method = 'privatePostPlace' + method;
            request['limit_price'] = this.priceToPrecision (market['symbol'], price);
            request['quantity'] = this.amountToPrecision (market['symbol'], amount);
        } else {
            method = 'privatePostPlaceMarket' + method;
            if (side === 'buy') {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + ' createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount');
                }
                request['cost'] = this.priceToPrecision (market['symbol'], amount * price);
            } else {
                request['quantity'] = this.amountToPrecision (market['symbol'], amount);
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
        /**
         * @method
         * @name mercado#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the mercado api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
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
            'cost': this.safeString (order, 'fee'),
            'currency': market['quote'],
        };
        const price = this.safeString (order, 'limit_price');
        // price = this.safeNumber (order, 'executed_price_avg', price);
        const average = this.safeString (order, 'executed_price_avg');
        const amount = this.safeString (order, 'quantity');
        const filled = this.safeString (order, 'executed_quantity');
        const lastTradeTimestamp = this.safeTimestamp (order, 'updated_timestamp');
        const rawTrades = this.safeValue (order, 'operations', []);
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
            'trades': rawTrades,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name mercado#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the mercado api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
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
        /**
         * @method
         * @name mercado#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the mercado api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
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
        //
        //     {
        //         "response_data": {
        //             "withdrawal": {
        //                 "id": 1,
        //                 "coin": "BRL",
        //                 "quantity": "300.56",
        //                 "net_quantity": "291.68",
        //                 "fee": "8.88",
        //                 "account": "bco: 341, ag: 1111, cta: 23456-X",
        //                 "status": 1,
        //                 "created_timestamp": "1453912088",
        //                 "updated_timestamp": "1453912088"
        //             }
        //         },
        //         "status_code": 100,
        //         "server_unix_timestamp": "1453912088"
        //     }
        //
        const responseData = this.safeValue (response, 'response_data', {});
        const withdrawal = this.safeValue (responseData, 'withdrawal');
        return this.parseTransaction (withdrawal, currency);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         "id": 1,
        //         "coin": "BRL",
        //         "quantity": "300.56",
        //         "net_quantity": "291.68",
        //         "fee": "8.88",
        //         "account": "bco: 341, ag: 1111, cta: 23456-X",
        //         "status": 1,
        //         "created_timestamp": "1453912088",
        //         "updated_timestamp": "1453912088"
        //     }
        //
        currency = this.safeCurrency (undefined, currency);
        return {
            'id': this.safeString (transaction, 'id'),
            'txid': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'amount': undefined,
            'type': undefined,
            'currency': currency['code'],
            'status': undefined,
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'fee': undefined,
            'info': transaction,
        };
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '15m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mercado#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the mercado api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'resolution': this.timeframes[timeframe],
            'symbol': market['base'] + '-' + market['quote'], // exceptional endpoint, that needs custom symbol syntax
        };
        if (limit === undefined) {
            limit = 100; // set some default limit, as it's required if user doesn't provide it
        }
        if (since !== undefined) {
            request['from'] = parseInt (since / 1000);
            request['to'] = this.sum (request['from'], limit * this.parseTimeframe (timeframe));
        } else {
            request['to'] = this.seconds ();
            request['from'] = request['to'] - (limit * this.parseTimeframe (timeframe));
        }
        const response = await this.v4PublicNetGetCandles (this.extend (request, params));
        const candles = this.convertTradingViewToOHLCV (response, 't', 'o', 'h', 'l', 'c', 'v');
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name mercado#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the mercado api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
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
        /**
         * @method
         * @name mercado#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the mercado api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
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
        /**
         * @method
         * @name mercado#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the mercado api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
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
        return this.filterBySymbolSinceLimit (trades, market['symbol'], since, limit);
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
        if ((api === 'public') || (api === 'v4Public') || (api === 'v4PublicNet')) {
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
