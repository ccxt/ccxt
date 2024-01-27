
// ---------------------------------------------------------------------------

import Exchange from './abstract/bl3p.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import type { Balances, Int, Market, OrderBook, OrderSide, OrderType, Str, Ticker, Trade, IndexType } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class bl3p
 * @augments Exchange
 */
export default class bl3p extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bl3p',
            'name': 'BL3P',
            'countries': [ 'NL' ], // Netherlands
            'rateLimit': 1000,
            'version': '1',
            'comment': 'An exchange market by BitonicNL',
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLeverage': false,
                'fetchMarginMode': false,
                'fetchMarkOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOrderBook': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'ws': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg',
                'api': {
                    'rest': 'https://api.bl3p.eu',
                },
                'www': 'https://bl3p.eu', // 'https://bitonic.nl'
                'doc': [
                    'https://github.com/BitonicNL/bl3p-api/tree/master/docs',
                    'https://bl3p.eu/api',
                    'https://bitonic.nl/en/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{market}/ticker',
                        '{market}/orderbook',
                        '{market}/trades',
                    ],
                },
                'private': {
                    'post': [
                        '{market}/money/depth/full',
                        '{market}/money/order/add',
                        '{market}/money/order/cancel',
                        '{market}/money/order/result',
                        '{market}/money/orders',
                        '{market}/money/orders/history',
                        '{market}/money/trades/fetch',
                        'GENMKT/money/info',
                        'GENMKT/money/deposit_address',
                        'GENMKT/money/new_deposit_address',
                        'GENMKT/money/wallet/history',
                        'GENMKT/money/withdraw',
                    ],
                },
            },
            'markets': {
                'BTC/EUR': this.safeMarketStructure ({ 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'baseId': 'BTC', 'quoteId': 'EUR', 'maker': 0.0025, 'taker': 0.0025, 'type': 'spot', 'spot': true }),
            },
            'precisionMode': TICK_SIZE,
        });
    }

    parseBalance (response): Balances {
        const data = this.safeValue (response, 'data', {});
        const wallets = this.safeValue (data, 'wallets', {});
        const result = { 'info': data };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const currencyId = currency['id'];
            const wallet = this.safeValue (wallets, currencyId, {});
            const available = this.safeValue (wallet, 'available', {});
            const balance = this.safeValue (wallet, 'balance', {});
            const account = this.account ();
            account['free'] = this.safeString (available, 'value');
            account['total'] = this.safeString (balance, 'value');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name bl3p#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostGENMKTMoneyInfo (params);
        return this.parseBalance (response);
    }

    parseBidAsk (bidask, priceKey: IndexType = 0, amountKey: IndexType = 1, countOrIdKey: IndexType = 2) {
        const price = this.safeString (bidask, priceKey);
        const size = this.safeString (bidask, amountKey);
        return [
            this.parseNumber (Precise.stringDiv (price, '100000.0')),
            this.parseNumber (Precise.stringDiv (size, '100000000.0')),
        ];
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name bl3p#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketOrderbook (this.extend (request, params));
        const orderbook = this.safeValue (response, 'data');
        return this.parseOrderBook (orderbook, market['symbol'], undefined, 'bids', 'asks', 'price_int', 'amount_int');
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        // {
        //     "currency":"BTC",
        //     "last":32654.55595,
        //     "bid":32552.3642,
        //     "ask":32703.58231,
        //     "high":33500,
        //     "low":31943,
        //     "timestamp":1643372789,
        //     "volume":{
        //         "24h":2.27372413,
        //         "30d":320.79375456
        //     }
        // }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        const last = this.safeString (ticker, 'last');
        const volume = this.safeValue (ticker, 'volume', {});
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (volume, '24h'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name bl3p#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const ticker = await this.publicGetMarketTicker (this.extend (request, params));
        //
        // {
        //     "currency":"BTC",
        //     "last":32654.55595,
        //     "bid":32552.3642,
        //     "ask":32703.58231,
        //     "high":33500,
        //     "low":31943,
        //     "timestamp":1643372789,
        //     "volume":{
        //         "24h":2.27372413,
        //         "30d":320.79375456
        //     }
        // }
        //
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        //
        // fetchTrades
        //
        //     {
        //         "trade_id": "2518789",
        //         "date": "1694348697745",
        //         "amount_int": "2959153",
        //         "price_int": "2416231440"
        //     }
        //
        const id = this.safeString (trade, 'trade_id');
        const timestamp = this.safeInteger (trade, 'date');
        const price = this.safeString (trade, 'price_int');
        const amount = this.safeString (trade, 'amount_int');
        market = this.safeMarket (undefined, market);
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': Precise.stringDiv (price, '100000'),
            'amount': Precise.stringDiv (amount, '100000000'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name bl3p#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        const market = this.market (symbol);
        const response = await this.publicGetMarketTrades (this.extend ({
            'market': market['id'],
        }, params));
        //
        //    {
        //        "result": "success",
        //        "data": {
        //            "trades": [
        //                {
        //                    "trade_id": "2518789",
        //                    "date": "1694348697745",
        //                    "amount_int": "2959153",
        //                    "price_int": "2416231440"
        //                },
        //            ]
        //        }
        //     }
        const result = this.parseTrades (response['data']['trades'], market, since, limit);
        return result;
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name bl3p#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.privatePostGENMKTMoneyInfo (params);
        //
        //     {
        //         "result": "success",
        //         "data": {
        //             "user_id": "13396",
        //             "wallets": {
        //                 "BTC": {
        //                     "balance": {
        //                         "value_int": "0",
        //                         "display": "0.00000000 BTC",
        //                         "currency": "BTC",
        //                         "value": "0.00000000",
        //                         "display_short": "0.00 BTC"
        //                     },
        //                     "available": {
        //                         "value_int": "0",
        //                         "display": "0.00000000 BTC",
        //                         "currency": "BTC",
        //                         "value": "0.00000000",
        //                         "display_short": "0.00 BTC"
        //                     }
        //                 },
        //                 ...
        //             },
        //             "trade_fee": "0.25"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const feeString = this.safeString (data, 'trade_fee');
        const fee = this.parseNumber (Precise.stringDiv (feeString, '100'));
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': data,
                'symbol': symbol,
                'maker': fee,
                'taker': fee,
                'percentage': true,
                'tierBased': false,
            };
        }
        return result;
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bl3p#createOrder
         * @description create a trade order
         * @see https://github.com/BitonicNL/bl3p-api/blob/master/examples/nodejs/example.md#21---create-an-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {int} [params.amount_funds] maximal EUR amount to spend (*1e5)
         * @param {string} [params.fee_currency] 'EUR' or 'BTC'
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const market = this.market (symbol);
        const amountString = this.numberToString (amount);
        const priceString = this.numberToString (price);
        const order = {
            'market': market['id'],
            'amount_int': parseInt (Precise.stringMul (amountString, '100000000')),
            'fee_currency': market['quote'],
            'type': (side === 'buy') ? 'bid' : 'ask',
        };
        if (type === 'limit') {
            order['price_int'] = parseInt (Precise.stringMul (priceString, '100000.0'));
        }
        const response = await this.privatePostMarketMoneyOrderAdd (this.extend (order, params));
        const orderId = this.safeString (response['data'], 'order_id');
        return this.safeOrder ({
            'info': response,
            'id': orderId,
        }, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name bl3p#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'order_id': id,
        };
        return await this.privatePostMarketMoneyOrderCancel (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.implodeParams (path, params);
        let url = this.urls['api']['rest'] + '/' + this.version + '/' + request;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, query));
            const secret = this.base64ToBinary (this.secret);
            // eslint-disable-next-line quotes
            const auth = request + "\0" + body;
            const signature = this.hmac (this.encode (auth), secret, sha512, 'base64');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Rest-Key': this.apiKey,
                'Rest-Sign': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
