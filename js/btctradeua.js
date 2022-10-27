'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class btctradeua extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btctradeua',
            'name': 'BTC Trade UA',
            'countries': [ 'UA' ], // Ukraine,
            'rateLimit': 3000,
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
                'fetchMarginMode': false,
                'fetchMarkOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': true,
            },
            'urls': {
                'referral': 'https://btc-trade.com.ua/registration/22689',
                'logo': 'https://user-images.githubusercontent.com/1294454/27941483-79fc7350-62d9-11e7-9f61-ac47f28fcd96.jpg',
                'api': {
                    'rest': 'https://btc-trade.com.ua/api',
                },
                'www': 'https://btc-trade.com.ua',
                'doc': 'https://docs.google.com/document/d/1ocYA0yMy_RXd561sfG3qEPZ80kyll36HUxvCRe5GbhE/edit',
            },
            'api': {
                'public': {
                    'get': [
                        'deals/{symbol}',
                        'trades/sell/{symbol}',
                        'trades/buy/{symbol}',
                        'japan_stat/high/{symbol}',
                    ],
                },
                'private': {
                    'post': [
                        'auth',
                        'ask/{symbol}',
                        'balance',
                        'bid/{symbol}',
                        'buy/{symbol}',
                        'my_orders/{symbol}',
                        'order/status/{id}',
                        'remove/order/{id}',
                        'sell/{symbol}',
                    ],
                },
            },
            'precisionMode': TICK_SIZE,
            'markets': {
                'BCH/UAH': { 'id': 'bch_uah', 'symbol': 'BCH/UAH', 'base': 'BCH', 'quote': 'UAH', 'baseId': 'bch', 'quoteId': 'uah', 'type': 'spot', 'spot': true },
                'BTC/UAH': { 'id': 'btc_uah', 'symbol': 'BTC/UAH', 'base': 'BTC', 'quote': 'UAH', 'baseId': 'btc', 'quoteId': 'uah', 'precision': { 'price': this.parseNumber ('1e-1') }, 'limits': { 'amount': { 'min': this.parseNumber ('1e-10') }}, 'type': 'spot', 'spot': true },
                'DASH/BTC': { 'id': 'dash_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'dash', 'quoteId': 'btc', 'type': 'spot', 'spot': true },
                'DASH/UAH': { 'id': 'dash_uah', 'symbol': 'DASH/UAH', 'base': 'DASH', 'quote': 'UAH', 'baseId': 'dash', 'quoteId': 'uah', 'type': 'spot', 'spot': true },
                'DOGE/BTC': { 'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC', 'baseId': 'doge', 'quoteId': 'btc', 'type': 'spot', 'spot': true },
                'DOGE/UAH': { 'id': 'doge_uah', 'symbol': 'DOGE/UAH', 'base': 'DOGE', 'quote': 'UAH', 'baseId': 'doge', 'quoteId': 'uah', 'type': 'spot', 'spot': true },
                'ETH/UAH': { 'id': 'eth_uah', 'symbol': 'ETH/UAH', 'base': 'ETH', 'quote': 'UAH', 'baseId': 'eth', 'quoteId': 'uah', 'type': 'spot', 'spot': true },
                'ITI/UAH': { 'id': 'iti_uah', 'symbol': 'ITI/UAH', 'base': 'ITI', 'quote': 'UAH', 'baseId': 'iti', 'quoteId': 'uah', 'type': 'spot', 'spot': true },
                'KRB/UAH': { 'id': 'krb_uah', 'symbol': 'KRB/UAH', 'base': 'KRB', 'quote': 'UAH', 'baseId': 'krb', 'quoteId': 'uah', 'type': 'spot', 'spot': true },
                'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc', 'type': 'spot', 'spot': true },
                'LTC/UAH': { 'id': 'ltc_uah', 'symbol': 'LTC/UAH', 'base': 'LTC', 'quote': 'UAH', 'baseId': 'ltc', 'quoteId': 'uah', 'type': 'spot', 'spot': true },
                'NVC/BTC': { 'id': 'nvc_btc', 'symbol': 'NVC/BTC', 'base': 'NVC', 'quote': 'BTC', 'baseId': 'nvc', 'quoteId': 'btc', 'type': 'spot', 'spot': true },
                'NVC/UAH': { 'id': 'nvc_uah', 'symbol': 'NVC/UAH', 'base': 'NVC', 'quote': 'UAH', 'baseId': 'nvc', 'quoteId': 'uah', 'type': 'spot', 'spot': true },
                'PPC/BTC': { 'id': 'ppc_btc', 'symbol': 'PPC/BTC', 'base': 'PPC', 'quote': 'BTC', 'baseId': 'ppc', 'quoteId': 'btc', 'type': 'spot', 'spot': true },
                'SIB/UAH': { 'id': 'sib_uah', 'symbol': 'SIB/UAH', 'base': 'SIB', 'quote': 'UAH', 'baseId': 'sib', 'quoteId': 'uah', 'type': 'spot', 'spot': true },
                'XMR/UAH': { 'id': 'xmr_uah', 'symbol': 'XMR/UAH', 'base': 'XMR', 'quote': 'UAH', 'baseId': 'xmr', 'quoteId': 'uah', 'type': 'spot', 'spot': true },
                'ZEC/UAH': { 'id': 'zec_uah', 'symbol': 'ZEC/UAH', 'base': 'ZEC', 'quote': 'UAH', 'baseId': 'zec', 'quoteId': 'uah', 'type': 'spot', 'spot': true },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
            },
        });
    }

    async signIn (params = {}) {
        /**
         * @method
         * @name btctradeua#signIn
         * @description sign in, must be called prior to using other authenticated methods
         * @param {object} params extra parameters specific to the btctradeua api endpoint
         * @returns response from exchange
         */
        return await this.privatePostAuth (params);
    }

    parseBalance (response) {
        const result = { 'info': response };
        const balances = this.safeValue (response, 'accounts', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name btctradeua#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the btctradeua api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostBalance (params);
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name btctradeua#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the btctradeua api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const bids = await this.publicGetTradesBuySymbol (this.extend (request, params));
        const asks = await this.publicGetTradesSellSymbol (this.extend (request, params));
        const orderbook = {
            'bids': [],
            'asks': [],
        };
        if (bids) {
            if ('list' in bids) {
                orderbook['bids'] = bids['list'];
            }
        }
        if (asks) {
            if ('list' in asks) {
                orderbook['asks'] = asks['list'];
            }
        }
        return this.parseOrderBook (orderbook, market['symbol'], undefined, 'bids', 'asks', 'price', 'currency_trade');
    }

    parseTicker (ticker, market = undefined) {
        //
        // [
        //     [1640789101000, 1292663.0, 1311823.61303, 1295794.252, 1311823.61303, 0.030175],
        //     [1640790902000, 1311823.61303, 1310820.96, 1290000.0, 1290000.0, 0.042533],
        // ],
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.milliseconds ();
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
        const tickerLength = ticker.length;
        if (tickerLength > 0) {
            const start = Math.max (tickerLength - 48, 0);
            for (let i = start; i < ticker.length; i++) {
                const candle = ticker[i];
                if (result['open'] === undefined) {
                    result['open'] = this.safeString (candle, 1);
                }
                const high = this.safeString (candle, 2);
                if ((result['high'] === undefined) || ((high !== undefined) && Precise.stringLt (result['high'], high))) {
                    result['high'] = high;
                }
                const low = this.safeString (candle, 3);
                if ((result['low'] === undefined) || ((low !== undefined) && Precise.stringLt (result['low'], low))) {
                    result['low'] = low;
                }
                const baseVolume = this.safeString (candle, 5);
                if (result['baseVolume'] === undefined) {
                    result['baseVolume'] = baseVolume;
                } else {
                    result['baseVolume'] = Precise.stringAdd (result['baseVolume'], baseVolume);
                }
            }
            const last = tickerLength - 1;
            result['last'] = this.safeString (ticker[last], 4);
            result['close'] = result['last'];
        }
        return this.safeTicker (result, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name btctradeua#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the btctradeua api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetJapanStatHighSymbol (this.extend (request, params));
        const ticker = this.safeValue (response, 'trades');
        //
        // {
        //     "status": true,
        //     "volume_trade": "0.495703",
        //     "trades": [
        //         [1640789101000, 1292663.0, 1311823.61303, 1295794.252, 1311823.61303, 0.030175],
        //         [1640790902000, 1311823.61303, 1310820.96, 1290000.0, 1290000.0, 0.042533],
        //     ],
        // }
        //
        return this.parseTicker (ticker, market);
    }

    convertMonthNameToString (cyrillic) {
        const months = {
            'Jan': '01',
            'Feb': '02',
            'Mar': '03',
            'Apr': '04',
            'May': '05',
            'Jun': '06',
            'Jul': '07',
            'Aug': '08',
            'Sept': '09',
            'Oct': '10',
            'Nov': '11',
            'Dec': '12',
        };
        return this.safeString (months, cyrillic);
    }

    parseExchangeSpecificDatetime (cyrillic) {
        const parts = cyrillic.split (' ');
        let month = parts[0];
        let day = parts[1].replace (',', '');
        if (day.length < 2) {
            day = '0' + day;
        }
        const year = parts[2].replace (',', '');
        month = month.replace (',', '');
        month = month.replace ('.', '');
        month = this.convertMonthNameToString (month);
        if (!month) {
            throw new ExchangeError (this.id + ' parseTrade() unrecognized month name: ' + cyrillic);
        }
        const hms = parts[3];
        const hmsParts = hms.split (':');
        let h = this.safeString (hmsParts, 0);
        let m = '00';
        const ampm = this.safeString (parts, 4);
        if (h === 'noon') {
            h = '12';
        } else {
            let intH = parseInt (h);
            if ((ampm !== undefined) && (ampm[0] === 'p')) {
                intH = 12 + intH;
                if (intH > 23) {
                    intH = 0;
                }
            }
            h = intH.toString ();
            if (h.length < 2) {
                h = '0' + h;
            }
            m = this.safeString (hmsParts, 1, '00');
            if (m.length < 2) {
                m = '0' + m;
            }
        }
        const ymd = [ year, month, day ].join ('-');
        const ymdhms = ymd + 'T' + h + ':' + m + ':00';
        const timestamp = this.parse8601 (ymdhms);
        // server reports local time, adjust to UTC
        // a special case for DST
        // subtract 2 hours during winter
        const intM = parseInt (m);
        if (intM < 11 || intM > 2) {
            return timestamp - 7200000;
        }
        // subtract 3 hours during summer
        return timestamp - 10800000;
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parseExchangeSpecificDatetime (this.safeString (trade, 'pub_date'));
        const id = this.safeString (trade, 'id');
        const type = 'limit';
        const side = this.safeString (trade, 'type');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amnt_trade');
        market = this.safeMarket (undefined, market);
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name btctradeua#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the btctradeua api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetDealsSymbol (this.extend (request, params));
        // they report each trade twice (once for both of the two sides of the fill)
        // deduplicate trades for that reason
        const trades = [];
        for (let i = 0; i < response.length; i++) {
            const id = this.safeInteger (response[i], 'id');
            if (id % 2) {
                trades.push (response[i]);
            }
        }
        return this.parseTrades (trades, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name btctradeua#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the btctradeua api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (type === 'market') {
            throw new ExchangeError (this.id + ' createOrder() allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = 'privatePost' + this.capitalize (side) + 'Id';
        const request = {
            'count': amount,
            'currency1': market['quoteId'],
            'currency': market['baseId'],
            'price': price,
        };
        return this[method] (this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name btctradeua#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by btctradeua cancelOrder ()
         * @param {object} params extra parameters specific to the btctradeua api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'id': id,
        };
        return await this.privatePostRemoveOrderId (this.extend (request, params));
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.milliseconds ();
        const symbol = this.safeSymbol (undefined, market);
        const side = this.safeString (order, 'type');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'amnt_trade');
        const remaining = this.safeString (order, 'amnt_trade');
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': undefined,
            'timestamp': timestamp, // until they fix their timestamp
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': symbol,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': remaining,
            'trades': undefined,
            'info': order,
            'cost': undefined,
            'average': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name btctradeua#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the btctradeua api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privatePostMyOrdersSymbol (this.extend (request, params));
        const orders = this.safeValue (response, 'your_open_orders');
        return this.parseOrders (orders, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += this.implodeParams (path, query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'out_order_id': nonce,
                'nonce': nonce,
            }, query));
            const auth = body + this.secret;
            headers = {
                'public-key': this.apiKey,
                'api-sign': this.hash (this.encode (auth), 'sha256'),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
