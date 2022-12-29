'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class coinspot extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinspot',
            'name': 'CoinSpot',
            'countries': [ 'AU' ], // Australia
            'rateLimit': 1000,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createMarketOrder': undefined,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
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
                'fetchMarkOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOrderBook': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg',
                'api': {
                    'public': 'https://www.coinspot.com.au/pubapi',
                    'private': 'https://www.coinspot.com.au/api',
                },
                'www': 'https://www.coinspot.com.au',
                'doc': 'https://www.coinspot.com.au/api',
                'referral': 'https://www.coinspot.com.au/register?code=PJURCU',
            },
            'api': {
                'public': {
                    'get': [
                        'latest',
                    ],
                },
                'private': {
                    'post': [
                        'orders',
                        'orders/history',
                        'my/coin/deposit',
                        'my/coin/send',
                        'quote/buy',
                        'quote/sell',
                        'my/balances',
                        'my/orders',
                        'my/buy',
                        'my/sell',
                        'my/buy/cancel',
                        'my/sell/cancel',
                        'ro/my/balances',
                        'ro/my/balances/{cointype}',
                        'ro/my/deposits',
                        'ro/my/withdrawals',
                        'ro/my/transactions',
                        'ro/my/transactions/{cointype}',
                        'ro/my/transactions/open',
                        'ro/my/transactions/{cointype}/open',
                        'ro/my/sendreceive',
                        'ro/my/affiliatepayments',
                        'ro/my/referralpayments',
                    ],
                },
            },
            'markets': {
                'ADA/AUD': { 'id': 'ada', 'symbol': 'ADA/AUD', 'base': 'ADA', 'quote': 'AUD', 'baseId': 'ada', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
                'BTC/AUD': { 'id': 'btc', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD', 'baseId': 'btc', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
                'ETH/AUD': { 'id': 'eth', 'symbol': 'ETH/AUD', 'base': 'ETH', 'quote': 'AUD', 'baseId': 'eth', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
                'XRP/AUD': { 'id': 'xrp', 'symbol': 'XRP/AUD', 'base': 'XRP', 'quote': 'AUD', 'baseId': 'xrp', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
                'LTC/AUD': { 'id': 'ltc', 'symbol': 'LTC/AUD', 'base': 'LTC', 'quote': 'AUD', 'baseId': 'ltc', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
                'DOGE/AUD': { 'id': 'doge', 'symbol': 'DOGE/AUD', 'base': 'DOGE', 'quote': 'AUD', 'baseId': 'doge', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
                'RFOX/AUD': { 'id': 'rfox', 'symbol': 'RFOX/AUD', 'base': 'RFOX', 'quote': 'AUD', 'baseId': 'rfox', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
                'POWR/AUD': { 'id': 'powr', 'symbol': 'POWR/AUD', 'base': 'POWR', 'quote': 'AUD', 'baseId': 'powr', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
                'NEO/AUD': { 'id': 'neo', 'symbol': 'NEO/AUD', 'base': 'NEO', 'quote': 'AUD', 'baseId': 'neo', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
                'TRX/AUD': { 'id': 'trx', 'symbol': 'TRX/AUD', 'base': 'TRX', 'quote': 'AUD', 'baseId': 'trx', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
                'EOS/AUD': { 'id': 'eos', 'symbol': 'EOS/AUD', 'base': 'EOS', 'quote': 'AUD', 'baseId': 'eos', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
                'XLM/AUD': { 'id': 'xlm', 'symbol': 'XLM/AUD', 'base': 'XLM', 'quote': 'AUD', 'baseId': 'xlm', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
                'RHOC/AUD': { 'id': 'rhoc', 'symbol': 'RHOC/AUD', 'base': 'RHOC', 'quote': 'AUD', 'baseId': 'rhoc', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
                'GAS/AUD': { 'id': 'gas', 'symbol': 'GAS/AUD', 'base': 'GAS', 'quote': 'AUD', 'baseId': 'gas', 'quoteId': 'aud', 'type': 'spot', 'spot': true },
            },
            'commonCurrencies': {
                'DRK': 'DASH',
            },
            'options': {
                'fetchBalance': 'private_post_my_balances',
            },
            'precisionMode': TICK_SIZE,
        });
    }

    parseBalance (response) {
        const result = { 'info': response };
        const balances = this.safeValue2 (response, 'balance', 'balances');
        if (Array.isArray (balances)) {
            for (let i = 0; i < balances.length; i++) {
                const currencies = balances[i];
                const currencyIds = Object.keys (currencies);
                for (let j = 0; j < currencyIds.length; j++) {
                    const currencyId = currencyIds[j];
                    const balance = currencies[currencyId];
                    const code = this.safeCurrencyCode (currencyId);
                    const account = this.account ();
                    account['total'] = this.safeString (balance, 'balance');
                    result[code] = account;
                }
            }
        } else {
            const currencyIds = Object.keys (balances);
            for (let i = 0; i < currencyIds.length; i++) {
                const currencyId = currencyIds[i];
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['total'] = this.safeString (balances, currencyId);
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name coinspot#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the coinspot api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const method = this.safeString (this.options, 'fetchBalance', 'private_post_my_balances');
        const response = await this[method] (params);
        //
        // read-write api keys
        //
        //     ...
        //
        // read-only api keys
        //
        //     {
        //         "status":"ok",
        //         "balances":[
        //             {
        //                 "LTC":{"balance":0.1,"audbalance":16.59,"rate":165.95}
        //             }
        //         ]
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinspot#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the coinspot api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'cointype': market['id'],
        };
        const orderbook = await this.privatePostOrders (this.extend (request, params));
        return this.parseOrderBook (orderbook, market['symbol'], undefined, 'buyorders', 'sellorders', 'rate', 'amount');
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "btc":{
        //             "bid":"51970",
        //             "ask":"53000",
        //             "last":"52806.47"
        //         }
        //     }
        //
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
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
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name coinspot#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the coinspot api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetLatest (params);
        let id = market['id'];
        id = id.toLowerCase ();
        const prices = this.safeValue (response, 'prices');
        //
        //     {
        //         "status":"ok",
        //         "prices":{
        //             "btc":{
        //                 "bid":"52732.47000022",
        //                 "ask":"53268.0699976",
        //                 "last":"53284.03"
        //             }
        //         }
        //     }
        //
        const ticker = this.safeValue (prices, id);
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name coinspot#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://www.coinspot.com.au/api#latestprices
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the coinspot api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetLatest (params);
        //
        //    {
        //        "status": "ok",
        //        "prices": {
        //        "btc": {
        //        "bid": "25050",
        //        "ask": "25370",
        //        "last": "25234"
        //        },
        //        "ltc": {
        //        "bid": "79.39192993",
        //        "ask": "87.98",
        //        "last": "87.95"
        //        }
        //      }
        //    }
        //
        const result = {};
        const prices = this.safeValue (response, 'prices');
        const ids = Object.keys (prices);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.safeMarket (id);
            if (market['spot']) {
                const symbol = market['symbol'];
                const ticker = prices[id];
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name coinspot#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the coinspot api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'cointype': market['id'],
        };
        const response = await this.privatePostOrdersHistory (this.extend (request, params));
        //
        //     {
        //         "status":"ok",
        //         "orders":[
        //             {"amount":0.00102091,"rate":21549.09999991,"total":21.99969168,"coin":"BTC","solddate":1604890646143,"market":"BTC/AUD"},
        //         ],
        //     }
        //
        const trades = this.safeValue (response, 'orders', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "amount":0.00102091,
        //         "rate":21549.09999991,
        //         "total":21.99969168,
        //         "coin":"BTC",
        //         "solddate":1604890646143,
        //         "market":"BTC/AUD"
        //     }
        //
        const priceString = this.safeString (trade, 'rate');
        const amountString = this.safeString (trade, 'amount');
        const costString = this.safeNumber (trade, 'total');
        const timestamp = this.safeInteger (trade, 'solddate');
        const marketId = this.safeString (trade, 'market');
        const symbol = this.safeSymbol (marketId, market, '/');
        return this.safeTrade ({
            'info': trade,
            'id': undefined,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name coinspot#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the coinspot api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const method = 'privatePostMy' + this.capitalize (side);
        if (type === 'market') {
            throw new ExchangeError (this.id + ' createOrder() allows limit orders only');
        }
        const market = this.market (symbol);
        const request = {
            'cointype': market['id'],
            'amount': amount,
            'rate': price,
        };
        return await this[method] (this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name coinspot#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by coinspot cancelOrder ()
         * @param {object} params extra parameters specific to the coinspot api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const side = this.safeString (params, 'side');
        if (side !== 'buy' && side !== 'sell') {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a side parameter, "buy" or "sell"');
        }
        params = this.omit (params, 'side');
        const method = 'privatePostMy' + this.capitalize (side) + 'Cancel';
        const request = {
            'id': id,
        };
        return await this[method] (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.urls['api'][api] + '/' + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.json (this.extend ({ 'nonce': nonce }, params));
            headers = {
                'Content-Type': 'application/json',
                'key': this.apiKey,
                'sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
