'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, NullResponse, InvalidOrder, NotSupported, InsufficientFunds, InvalidNonce, OrderNotFound, RateLimitExceeded, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class cex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cex',
            'name': 'CEX.IO',
            'countries': [ 'GB', 'EU', 'CY', 'RU' ],
            'rateLimit': 1500,
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
            },
            'timeframes': {
                '1m': '1m',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg',
                'api': 'https://cex.io/api',
                'www': 'https://cex.io',
                'doc': 'https://cex.io/cex-api',
                'fees': [
                    'https://cex.io/fee-schedule',
                    'https://cex.io/limits-commissions',
                ],
                'referral': 'https://cex.io/r/0/up105393824/0/',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'get': [
                        'currency_profile',
                        'currency_limits/',
                        'last_price/{pair}/',
                        'last_prices/{currencies}/',
                        'ohlcv/hd/{yyyymmdd}/{pair}',
                        'order_book/{pair}/',
                        'ticker/{pair}/',
                        'tickers/{currencies}/',
                        'trade_history/{pair}/',
                    ],
                    'post': [
                        'convert/{pair}',
                        'price_stats/{pair}',
                    ],
                },
                'private': {
                    'post': [
                        'active_orders_status/',
                        'archived_orders/{pair}/',
                        'balance/',
                        'cancel_order/',
                        'cancel_orders/{pair}/',
                        'cancel_replace_order/{pair}/',
                        'close_position/{pair}/',
                        'get_address/',
                        'get_myfee/',
                        'get_order/',
                        'get_order_tx/',
                        'open_orders/{pair}/',
                        'open_orders/',
                        'open_position/{pair}/',
                        'open_positions/{pair}/',
                        'place_order/{pair}/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.16 / 100,
                    'taker': 0.25 / 100,
                },
                'funding': {
                    'withdraw': {
                        // 'USD': undefined,
                        // 'EUR': undefined,
                        // 'RUB': undefined,
                        // 'GBP': undefined,
                        'BTC': 0.001,
                        'ETH': 0.01,
                        'BCH': 0.001,
                        'DASH': 0.01,
                        'BTG': 0.001,
                        'ZEC': 0.001,
                        'XRP': 0.02,
                    },
                    'deposit': {
                        // 'USD': amount => amount * 0.035 + 0.25,
                        // 'EUR': amount => amount * 0.035 + 0.24,
                        // 'RUB': amount => amount * 0.05 + 15.57,
                        // 'GBP': amount => amount * 0.035 + 0.2,
                        'BTC': 0.0,
                        'ETH': 0.0,
                        'BCH': 0.0,
                        'DASH': 0.0,
                        'BTG': 0.0,
                        'ZEC': 0.0,
                        'XRP': 0.0,
                        'XLM': 0.0,
                    },
                },
            },
            'exceptions': {
                'exact': {},
                'broad': {
                    'Insufficient funds': InsufficientFunds,
                    'Nonce must be incremented': InvalidNonce,
                    'Invalid Order': InvalidOrder,
                    'Order not found': OrderNotFound,
                    'Rate limit exceeded': RateLimitExceeded,
                    'Invalid API key': AuthenticationError,
                    'There was an error while placing your order': InvalidOrder,
                    'Sorry, too many clients already': DDoSProtection,
                },
            },
            'options': {
                'fetchOHLCVWarning': true,
                'createMarketBuyOrderRequiresPrice': true,
                'order': {
                    'status': {
                        'c': 'canceled',
                        'd': 'closed',
                        'cd': 'canceled',
                        'a': 'open',
                    },
                },
            },
        });
    }

    async fetchCurrenciesFromCache (params = {}) {
        // this method is now redundant
        // currencies are now fetched before markets
        const options = this.safeValue (this.options, 'fetchCurrencies', {});
        const timestamp = this.safeInteger (options, 'timestamp');
        const expires = this.safeInteger (options, 'expires', 1000);
        const now = this.milliseconds ();
        if ((timestamp === undefined) || ((now - timestamp) > expires)) {
            const response = await this.publicGetCurrencyProfile (params);
            this.options['fetchCurrencies'] = this.extend (options, {
                'response': response,
                'timestamp': now,
            });
        }
        return this.safeValue (this.options['fetchCurrencies'], 'response');
    }

    async fetchCurrencies (params = {}) {
        const response = await this.fetchCurrenciesFromCache (params);
        this.options['currencies'] = {
            'timestamp': this.milliseconds (),
            'response': response,
        };
        //
        //     {
        //         "e":"currency_profile",
        //         "ok":"ok",
        //         "data":{
        //             "symbols":[
        //                 {
        //                     "code":"GHS",
        //                     "contract":true,
        //                     "commodity":true,
        //                     "fiat":false,
        //                     "description":"CEX.IO doesn't provide cloud mining services anymore.",
        //                     "precision":8,
        //                     "scale":0,
        //                     "minimumCurrencyAmount":"0.00000001",
        //                     "minimalWithdrawalAmount":-1
        //                 },
        //                 {
        //                     "code":"BTC",
        //                     "contract":false,
        //                     "commodity":false,
        //                     "fiat":false,
        //                     "description":"",
        //                     "precision":8,
        //                     "scale":0,
        //                     "minimumCurrencyAmount":"0.00000001",
        //                     "minimalWithdrawalAmount":0.002
        //                 },
        //                 {
        //                     "code":"ETH",
        //                     "contract":false,
        //                     "commodity":false,
        //                     "fiat":false,
        //                     "description":"",
        //                     "precision":8,
        //                     "scale":2,
        //                     "minimumCurrencyAmount":"0.00000100",
        //                     "minimalWithdrawalAmount":0.01
        //                 }
        //             ],
        //             "pairs":[
        //                 {
        //                     "symbol1":"BTC",
        //                     "symbol2":"USD",
        //                     "pricePrecision":1,
        //                     "priceScale":"/1000000",
        //                     "minLotSize":0.002,
        //                     "minLotSizeS2":20
        //                 },
        //                 {
        //                     "symbol1":"ETH",
        //                     "symbol2":"USD",
        //                     "pricePrecision":2,
        //                     "priceScale":"/10000",
        //                     "minLotSize":0.1,
        //                     "minLotSizeS2":20
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const currencies = this.safeValue (data, 'symbols', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'code');
            const code = this.safeCurrencyCode (id);
            const precision = this.safeInteger (currency, 'precision');
            const active = true;
            result[code] = {
                'id': id,
                'code': code,
                'name': id,
                'active': active,
                'precision': precision,
                'fee': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'minimumCurrencyAmount'),
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
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minimalWithdrawalAmount'),
                        'max': undefined,
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const currenciesResponse = await this.fetchCurrenciesFromCache (params);
        const currenciesData = this.safeValue (currenciesResponse, 'data', {});
        const currencies = this.safeValue (currenciesData, 'symbols', []);
        const currenciesById = this.indexBy (currencies, 'code');
        const pairs = this.safeValue (currenciesData, 'pairs', []);
        const response = await this.publicGetCurrencyLimits (params);
        //
        //     {
        //         "e":"currency_limits",
        //         "ok":"ok",
        //         "data": {
        //             "pairs":[
        //                 {
        //                     "symbol1":"BTC",
        //                     "symbol2":"USD",
        //                     "minLotSize":0.002,
        //                     "minLotSizeS2":20,
        //                     "maxLotSize":30,
        //                     "minPrice":"1500",
        //                     "maxPrice":"35000"
        //                 },
        //                 {
        //                     "symbol1":"BCH",
        //                     "symbol2":"EUR",
        //                     "minLotSize":0.1,
        //                     "minLotSizeS2":20,
        //                     "maxLotSize":null,
        //                     "minPrice":"25",
        //                     "maxPrice":"8192"
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = [];
        const markets = this.safeValue (response['data'], 'pairs');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseId = this.safeString (market, 'symbol1');
            const quoteId = this.safeString (market, 'symbol2');
            const id = baseId + '/' + quoteId;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const baseCurrency = this.safeValue (currenciesById, baseId, {});
            const quoteCurrency = this.safeValue (currenciesById, quoteId, {});
            let pricePrecision = this.safeInteger (quoteCurrency, 'precision', 8);
            for (let j = 0; j < pairs.length; j++) {
                const pair = pairs[j];
                if ((pair['symbol1'] === baseId) && (pair['symbol2'] === quoteId)) {
                    // we might need to account for `priceScale` here
                    pricePrecision = this.safeInteger (pair, 'pricePrecision', pricePrecision);
                }
            }
            const baseCcyPrecision = this.safeInteger (baseCurrency, 'precision', 8);
            const baseCcyScale = this.safeInteger (baseCurrency, 'scale', 0);
            const amountPrecision = baseCcyPrecision - baseCcyScale;
            const precision = {
                'amount': amountPrecision,
                'price': pricePrecision,
            };
            result.push ({
                'id': id,
                'info': market,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minLotSize'),
                        'max': this.safeFloat (market, 'maxLotSize'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'minPrice'),
                        'max': this.safeFloat (market, 'maxPrice'),
                    },
                    'cost': {
                        'min': this.safeFloat (market, 'minLotSizeS2'),
                        'max': undefined,
                    },
                },
                'active': undefined,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostBalance (params);
        const result = { 'info': response };
        const ommited = [ 'username', 'timestamp' ];
        const balances = this.omit (response, ommited);
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const balance = this.safeValue (balances, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            // https://github.com/ccxt/ccxt/issues/5484
            account['used'] = this.safeFloat (balance, 'orders', 0.0);
            const code = this.safeCurrencyCode (currencyId);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetOrderBookPair (this.extend (request, params));
        const timestamp = this.safeTimestamp (response, 'timestamp');
        return this.parseOrderBook (response, timestamp);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1591403940,
        //         0.024972,
        //         0.024972,
        //         0.024969,
        //         0.024969,
        //         0.49999900
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeFloat (ohlcv, 1),
            this.safeFloat (ohlcv, 2),
            this.safeFloat (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (since === undefined) {
            since = this.milliseconds () - 86400000; // yesterday
        } else {
            if (this.options['fetchOHLCVWarning']) {
                throw new ExchangeError (this.id + " fetchOHLCV warning: CEX can return historical candles for a certain date only, this might produce an empty or null reply. Set exchange.options['fetchOHLCVWarning'] = false or add ({ 'options': { 'fetchOHLCVWarning': false }}) to constructor params to suppress this warning message.");
            }
        }
        let ymd = this.ymd (since);
        ymd = ymd.split ('-');
        ymd = ymd.join ('');
        const request = {
            'pair': market['id'],
            'yyyymmdd': ymd,
        };
        try {
            const response = await this.publicGetOhlcvHdYyyymmddPair (this.extend (request, params));
            //
            //     {
            //         "time":20200606,
            //         "data1m":"[[1591403940,0.024972,0.024972,0.024969,0.024969,0.49999900]]",
            //     }
            //
            const key = 'data' + this.timeframes[timeframe];
            const data = this.safeString (response, key);
            const ohlcvs = JSON.parse (data);
            return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
        } catch (e) {
            if (e instanceof NullResponse) {
                return [];
            }
        }
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        const volume = this.safeFloat (ticker, 'volume');
        const high = this.safeFloat (ticker, 'high');
        const low = this.safeFloat (ticker, 'low');
        const bid = this.safeFloat (ticker, 'bid');
        const ask = this.safeFloat (ticker, 'ask');
        const last = this.safeFloat (ticker, 'last');
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': volume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const currencies = Object.keys (this.currencies);
        const request = {
            'currencies': currencies.join ('/'),
        };
        const response = await this.publicGetTickersCurrencies (this.extend (request, params));
        const tickers = response['data'];
        const result = {};
        for (let t = 0; t < tickers.length; t++) {
            const ticker = tickers[t];
            const symbol = ticker['pair'].replace (':', '/');
            const market = this.markets[symbol];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const ticker = await this.publicGetTickerPair (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'date');
        const id = this.safeString (trade, 'tid');
        const type = undefined;
        const side = this.safeString (trade, 'type');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'id': id,
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
        const response = await this.publicGetTradeHistoryPair (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // for market buy it requires the amount of quote currency to spend
        if ((type === 'market') && (side === 'buy')) {
            if (this.options['createMarketBuyOrderRequiresPrice']) {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                } else {
                    amount = amount * price;
                }
            }
        }
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
            'type': side,
            'amount': amount,
        };
        if (type === 'limit') {
            request['price'] = price;
        } else {
            request['order_type'] = type;
        }
        const response = await this.privatePostPlaceOrderPair (this.extend (request, params));
        //
        //     {
        //         "id": "12978363524",
        //         "time": 1586610022259,
        //         "type": "buy",
        //         "price": "0.033934",
        //         "amount": "0.10722802",
        //         "pending": "0.10722802",
        //         "complete": false
        //     }
        //
        const placedAmount = this.safeFloat (response, 'amount');
        const remaining = this.safeFloat (response, 'pending');
        const timestamp = this.safeValue (response, 'time');
        const complete = this.safeValue (response, 'complete');
        const status = complete ? 'closed' : 'open';
        let filled = undefined;
        if ((placedAmount !== undefined) && (remaining !== undefined)) {
            filled = Math.max (placedAmount - remaining, 0);
        }
        return {
            'id': this.safeString (response, 'id'),
            'info': response,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': type,
            'side': this.safeString (response, 'type'),
            'symbol': symbol,
            'status': status,
            'price': this.safeFloat (response, 'price'),
            'amount': placedAmount,
            'cost': undefined,
            'average': undefined,
            'remaining': remaining,
            'filled': filled,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    parseOrder (order, market = undefined) {
        // Depending on the call, 'time' can be a unix int, unix string or ISO string
        // Yes, really
        let timestamp = this.safeValue (order, 'time');
        if (typeof timestamp === 'string' && timestamp.indexOf ('T') >= 0) {
            // ISO8601 string
            timestamp = this.parse8601 (timestamp);
        } else {
            // either integer or string integer
            timestamp = parseInt (timestamp);
        }
        let symbol = undefined;
        if (market === undefined) {
            const baseId = this.safeString (order, 'symbol1');
            const quoteId = this.safeString (order, 'symbol2');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
            if (symbol in this.markets) {
                market = this.market (symbol);
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'amount');
        // sell orders can have a negative amount
        // https://github.com/ccxt/ccxt/issues/5338
        if (amount !== undefined) {
            amount = Math.abs (amount);
        }
        const remaining = this.safeFloat2 (order, 'pending', 'remains');
        const filled = amount - remaining;
        let fee = undefined;
        let cost = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            cost = this.safeFloat (order, 'ta:' + market['quote']);
            if (cost === undefined) {
                cost = this.safeFloat (order, 'tta:' + market['quote']);
            }
            const baseFee = 'fa:' + market['base'];
            const baseTakerFee = 'tfa:' + market['base'];
            const quoteFee = 'fa:' + market['quote'];
            const quoteTakerFee = 'tfa:' + market['quote'];
            let feeRate = this.safeFloat (order, 'tradingFeeMaker');
            if (!feeRate) {
                feeRate = this.safeFloat (order, 'tradingFeeTaker', feeRate);
            }
            if (feeRate) {
                feeRate /= 100.0; // convert to mathematically-correct percentage coefficients: 1.0 = 100%
            }
            if ((baseFee in order) || (baseTakerFee in order)) {
                const baseFeeCost = this.safeFloat2 (order, baseFee, baseTakerFee);
                fee = {
                    'currency': market['base'],
                    'rate': feeRate,
                    'cost': baseFeeCost,
                };
            } else if ((quoteFee in order) || (quoteTakerFee in order)) {
                const quoteFeeCost = this.safeFloat2 (order, quoteFee, quoteTakerFee);
                fee = {
                    'currency': market['quote'],
                    'rate': feeRate,
                    'cost': quoteFeeCost,
                };
            }
        }
        if (!cost) {
            cost = price * filled;
        }
        const side = order['type'];
        let trades = undefined;
        const orderId = order['id'];
        if ('vtx' in order) {
            trades = [];
            for (let i = 0; i < order['vtx'].length; i++) {
                const item = order['vtx'][i];
                const tradeSide = this.safeString (item, 'type');
                if (tradeSide === 'cancel') {
                    // looks like this might represent the cancelled part of an order
                    //   { id: '4426729543',
                    //     type: 'cancel',
                    //     time: '2017-09-22T00:24:30.476Z',
                    //     user: 'up106404164',
                    //     c: 'user:up106404164:a:BCH',
                    //     d: 'order:4426728375:a:BCH',
                    //     a: '0.09935956',
                    //     amount: '0.09935956',
                    //     balance: '0.42580261',
                    //     symbol: 'BCH',
                    //     order: '4426728375',
                    //     buy: null,
                    //     sell: null,
                    //     pair: null,
                    //     pos: null,
                    //     cs: '0.42580261',
                    //     ds: 0 }
                    continue;
                }
                const tradePrice = this.safeFloat (item, 'price');
                if (tradePrice === undefined) {
                    // this represents the order
                    //   {
                    //     "a": "0.47000000",
                    //     "c": "user:up106404164:a:EUR",
                    //     "d": "order:6065499239:a:EUR",
                    //     "cs": "1432.93",
                    //     "ds": "476.72",
                    //     "id": "6065499249",
                    //     "buy": null,
                    //     "pos": null,
                    //     "pair": null,
                    //     "sell": null,
                    //     "time": "2018-04-22T13:07:22.152Z",
                    //     "type": "buy",
                    //     "user": "up106404164",
                    //     "order": "6065499239",
                    //     "amount": "-715.97000000",
                    //     "symbol": "EUR",
                    //     "balance": "1432.93000000" }
                    continue;
                }
                // todo: deal with these
                if (tradeSide === 'costsNothing') {
                    continue;
                }
                // --
                // if (side !== tradeSide)
                //     throw new Error (JSON.stringify (order, null, 2));
                // if (orderId !== item['order'])
                //     throw new Error (JSON.stringify (order, null, 2));
                // --
                // partial buy trade
                //   {
                //     "a": "0.01589885",
                //     "c": "user:up106404164:a:BTC",
                //     "d": "order:6065499239:a:BTC",
                //     "cs": "0.36300000",
                //     "ds": 0,
                //     "id": "6067991213",
                //     "buy": "6065499239",
                //     "pos": null,
                //     "pair": null,
                //     "sell": "6067991206",
                //     "time": "2018-04-22T23:09:11.773Z",
                //     "type": "buy",
                //     "user": "up106404164",
                //     "order": "6065499239",
                //     "price": 7146.5,
                //     "amount": "0.01589885",
                //     "symbol": "BTC",
                //     "balance": "0.36300000",
                //     "symbol2": "EUR",
                //     "fee_amount": "0.19" }
                // --
                // trade with zero amount, but non-zero fee
                //   {
                //     "a": "0.00000000",
                //     "c": "user:up106404164:a:EUR",
                //     "d": "order:5840654423:a:EUR",
                //     "cs": 559744,
                //     "ds": 0,
                //     "id": "5840654429",
                //     "buy": "5807238573",
                //     "pos": null,
                //     "pair": null,
                //     "sell": "5840654423",
                //     "time": "2018-03-15T03:20:14.010Z",
                //     "type": "sell",
                //     "user": "up106404164",
                //     "order": "5840654423",
                //     "price": 730,
                //     "amount": "0.00000000",
                //     "symbol": "EUR",
                //     "balance": "5597.44000000",
                //     "symbol2": "BCH",
                //     "fee_amount": "0.01" }
                // --
                // trade which should have an amount of exactly 0.002BTC
                //   {
                //     "a": "16.70000000",
                //     "c": "user:up106404164:a:GBP",
                //     "d": "order:9927386681:a:GBP",
                //     "cs": "86.90",
                //     "ds": 0,
                //     "id": "9927401610",
                //     "buy": "9927401601",
                //     "pos": null,
                //     "pair": null,
                //     "sell": "9927386681",
                //     "time": "2019-08-21T15:25:37.777Z",
                //     "type": "sell",
                //     "user": "up106404164",
                //     "order": "9927386681",
                //     "price": 8365,
                //     "amount": "16.70000000",
                //     "office": "UK",
                //     "symbol": "GBP",
                //     "balance": "86.90000000",
                //     "symbol2": "BTC",
                //     "fee_amount": "0.03"
                //   }
                const tradeTimestamp = this.parse8601 (this.safeString (item, 'time'));
                const tradeAmount = this.safeFloat (item, 'amount');
                const feeCost = this.safeFloat (item, 'fee_amount');
                let absTradeAmount = (tradeAmount < 0) ? -tradeAmount : tradeAmount;
                let tradeCost = undefined;
                if (tradeSide === 'sell') {
                    tradeCost = absTradeAmount;
                    absTradeAmount = this.sum (feeCost, tradeCost) / tradePrice;
                } else {
                    tradeCost = absTradeAmount * tradePrice;
                }
                trades.push ({
                    'id': this.safeString (item, 'id'),
                    'timestamp': tradeTimestamp,
                    'datetime': this.iso8601 (tradeTimestamp),
                    'order': orderId,
                    'symbol': symbol,
                    'price': tradePrice,
                    'amount': absTradeAmount,
                    'cost': tradeCost,
                    'side': tradeSide,
                    'fee': {
                        'cost': feeCost,
                        'currency': market['quote'],
                    },
                    'info': item,
                    'type': undefined,
                    'takerOrMaker': undefined,
                });
            }
        }
        return {
            'id': orderId,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': (price === undefined) ? 'market' : 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': fee,
            'info': order,
            'average': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let method = 'privatePostOpenOrders';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
            method += 'Pair';
        }
        const orders = await this[method] (this.extend (request, params));
        for (let i = 0; i < orders.length; i++) {
            orders[i] = this.extend (orders[i], { 'status': 'open' });
        }
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const method = 'privatePostArchivedOrdersPair';
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = { 'pair': market['id'] };
        const response = await this[method] (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id.toString (),
        };
        const response = await this.privatePostGetOrderTx (this.extend (request, params));
        return this.parseOrder (response['data']);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'limit': limit,
            'pair': market['id'],
            'dateFrom': since,
        };
        const response = await this.privatePostArchivedOrdersPair (this.extend (request, params));
        const results = [];
        for (let i = 0; i < response.length; i++) {
            // cancelled (unfilled):
            //    { id: '4005785516',
            //     type: 'sell',
            //     time: '2017-07-18T19:08:34.223Z',
            //     lastTxTime: '2017-07-18T19:08:34.396Z',
            //     lastTx: '4005785522',
            //     pos: null,
            //     status: 'c',
            //     symbol1: 'ETH',
            //     symbol2: 'GBP',
            //     amount: '0.20000000',
            //     price: '200.5625',
            //     remains: '0.20000000',
            //     'a:ETH:cds': '0.20000000',
            //     tradingFeeMaker: '0',
            //     tradingFeeTaker: '0.16',
            //     tradingFeeUserVolumeAmount: '10155061217',
            //     orderId: '4005785516' }
            // --
            // cancelled (partially filled buy):
            //    { id: '4084911657',
            //     type: 'buy',
            //     time: '2017-08-05T03:18:39.596Z',
            //     lastTxTime: '2019-03-19T17:37:46.404Z',
            //     lastTx: '8459265833',
            //     pos: null,
            //     status: 'cd',
            //     symbol1: 'BTC',
            //     symbol2: 'GBP',
            //     amount: '0.05000000',
            //     price: '2241.4692',
            //     tfacf: '1',
            //     remains: '0.03910535',
            //     'tfa:GBP': '0.04',
            //     'tta:GBP': '24.39',
            //     'a:BTC:cds': '0.01089465',
            //     'a:GBP:cds': '112.26',
            //     'f:GBP:cds': '0.04',
            //     tradingFeeMaker: '0',
            //     tradingFeeTaker: '0.16',
            //     tradingFeeUserVolumeAmount: '13336396963',
            //     orderId: '4084911657' }
            // --
            // cancelled (partially filled sell):
            //    { id: '4426728375',
            //     type: 'sell',
            //     time: '2017-09-22T00:24:20.126Z',
            //     lastTxTime: '2017-09-22T00:24:30.476Z',
            //     lastTx: '4426729543',
            //     pos: null,
            //     status: 'cd',
            //     symbol1: 'BCH',
            //     symbol2: 'BTC',
            //     amount: '0.10000000',
            //     price: '0.11757182',
            //     tfacf: '1',
            //     remains: '0.09935956',
            //     'tfa:BTC': '0.00000014',
            //     'tta:BTC': '0.00007537',
            //     'a:BCH:cds': '0.10000000',
            //     'a:BTC:cds': '0.00007537',
            //     'f:BTC:cds': '0.00000014',
            //     tradingFeeMaker: '0',
            //     tradingFeeTaker: '0.18',
            //     tradingFeeUserVolumeAmount: '3466715450',
            //     orderId: '4426728375' }
            // --
            // filled:
            //    { id: '5342275378',
            //     type: 'sell',
            //     time: '2018-01-04T00:28:12.992Z',
            //     lastTxTime: '2018-01-04T00:28:12.992Z',
            //     lastTx: '5342275393',
            //     pos: null,
            //     status: 'd',
            //     symbol1: 'BCH',
            //     symbol2: 'BTC',
            //     amount: '0.10000000',
            //     kind: 'api',
            //     price: '0.17',
            //     remains: '0.00000000',
            //     'tfa:BTC': '0.00003902',
            //     'tta:BTC': '0.01699999',
            //     'a:BCH:cds': '0.10000000',
            //     'a:BTC:cds': '0.01699999',
            //     'f:BTC:cds': '0.00003902',
            //     tradingFeeMaker: '0.15',
            //     tradingFeeTaker: '0.23',
            //     tradingFeeUserVolumeAmount: '1525951128',
            //     orderId: '5342275378' }
            // --
            // market order (buy):
            //    { "id": "6281946200",
            //     "pos": null,
            //     "time": "2018-05-23T11:55:43.467Z",
            //     "type": "buy",
            //     "amount": "0.00000000",
            //     "lastTx": "6281946210",
            //     "status": "d",
            //     "amount2": "20.00",
            //     "orderId": "6281946200",
            //     "remains": "0.00000000",
            //     "symbol1": "ETH",
            //     "symbol2": "EUR",
            //     "tfa:EUR": "0.05",
            //     "tta:EUR": "19.94",
            //     "a:ETH:cds": "0.03764100",
            //     "a:EUR:cds": "20.00",
            //     "f:EUR:cds": "0.05",
            //     "lastTxTime": "2018-05-23T11:55:43.467Z",
            //     "tradingFeeTaker": "0.25",
            //     "tradingFeeUserVolumeAmount": "55998097" }
            // --
            // market order (sell):
            //   { "id": "6282200948",
            //     "pos": null,
            //     "time": "2018-05-23T12:42:58.315Z",
            //     "type": "sell",
            //     "amount": "-0.05000000",
            //     "lastTx": "6282200958",
            //     "status": "d",
            //     "orderId": "6282200948",
            //     "remains": "0.00000000",
            //     "symbol1": "ETH",
            //     "symbol2": "EUR",
            //     "tfa:EUR": "0.07",
            //     "tta:EUR": "26.49",
            //     "a:ETH:cds": "0.05000000",
            //     "a:EUR:cds": "26.49",
            //     "f:EUR:cds": "0.07",
            //     "lastTxTime": "2018-05-23T12:42:58.315Z",
            //     "tradingFeeTaker": "0.25",
            //     "tradingFeeUserVolumeAmount": "56294576" }
            const order = response[i];
            const status = this.parseOrderStatus (this.safeString (order, 'status'));
            const baseId = this.safeString (order, 'symbol1');
            const quoteId = this.safeString (order, 'symbol2');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const side = this.safeString (order, 'type');
            const baseAmount = this.safeFloat (order, 'a:' + baseId + ':cds');
            const quoteAmount = this.safeFloat (order, 'a:' + quoteId + ':cds');
            const fee = this.safeFloat (order, 'f:' + quoteId + ':cds');
            const amount = this.safeFloat (order, 'amount');
            const price = this.safeFloat (order, 'price');
            const remaining = this.safeFloat (order, 'remains');
            const filled = amount - remaining;
            let orderAmount = undefined;
            let cost = undefined;
            let average = undefined;
            let type = undefined;
            if (!price) {
                type = 'market';
                orderAmount = baseAmount;
                cost = quoteAmount;
                average = orderAmount / cost;
            } else {
                const ta = this.safeFloat (order, 'ta:' + quoteId, 0);
                const tta = this.safeFloat (order, 'tta:' + quoteId, 0);
                const fa = this.safeFloat (order, 'fa:' + quoteId, 0);
                const tfa = this.safeFloat (order, 'tfa:' + quoteId, 0);
                if (side === 'sell') {
                    cost = this.sum (this.sum (ta, tta), this.sum (fa, tfa));
                } else {
                    cost = this.sum (ta, tta) - this.sum (fa, tfa);
                }
                type = 'limit';
                orderAmount = amount;
                average = cost / filled;
            }
            const time = this.safeString (order, 'time');
            const lastTxTime = this.safeString (order, 'lastTxTime');
            const timestamp = this.parse8601 (time);
            results.push ({
                'id': this.safeString (order, 'id'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'lastUpdated': this.parse8601 (lastTxTime),
                'status': status,
                'symbol': symbol,
                'side': side,
                'price': price,
                'amount': orderAmount,
                'average': average,
                'type': type,
                'filled': filled,
                'cost': cost,
                'remaining': remaining,
                'fee': {
                    'cost': fee,
                    'currency': quote,
                },
                'info': order,
            });
        }
        return results;
    }

    parseOrderStatus (status) {
        return this.safeString (this.options['order']['status'], status, status);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder requires a amount argument');
        }
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder requires a price argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // see: https://cex.io/rest-api#/definitions/CancelReplaceOrderRequest
        const request = {
            'pair': market['id'],
            'type': side,
            'amount': amount,
            'price': price,
            'order_id': id,
        };
        const response = await this.privatePostCancelReplaceOrderPair (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchDepositAddress (code, params = {}) {
        if (code === 'XRP' || code === 'XLM') {
            // https://github.com/ccxt/ccxt/pull/2327#issuecomment-375204856
            throw new NotSupported (this.id + ' fetchDepositAddress does not support XRP and XLM addresses yet (awaiting docs from CEX.io)');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostGetAddress (this.extend (request, params));
        const address = this.safeString (response, 'data');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const auth = nonce + this.uid + this.apiKey;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            body = this.json (this.extend ({
                'key': this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce,
            }, query));
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (Array.isArray (response)) {
            return response; // public endpoints may return []-arrays
        }
        if (body === 'true') {
            return;
        }
        if (response === undefined) {
            throw new NullResponse (this.id + ' returned ' + this.json (response));
        }
        if ('e' in response) {
            if ('ok' in response) {
                if (response['ok'] === 'ok') {
                    return;
                }
            }
        }
        if ('error' in response) {
            const message = this.safeString (response, 'error');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
