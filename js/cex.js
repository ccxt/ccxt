'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, NullResponse, InvalidOrder, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class cex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cex',
            'name': 'CEX.IO',
            'countries': [ 'GB', 'EU', 'CY', 'RU' ],
            'rateLimit': 1500,
            'has': {
                'CORS': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'fetchOrders': true,
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
            'options': {
                'fetchOHLCVWarning': true,
                'createMarketBuyOrderRequiresPrice': true,
                'order': {
                    'status': {
                        'c': 'canceled',
                        'd': 'closed',
                        'cd': 'closed',
                        'a': 'open',
                    },
                },
            },
        });
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
            const item = response[i];
            const status = this.parseOrderStatus (this.safeString (item, 'status'));
            const baseId = item['symbol1'];
            const quoteId = item['symbol2'];
            const side = item['type'];
            const baseAmount = this.safeFloat (item, 'a:' + baseId + ':cds');
            const quoteAmount = this.safeFloat (item, 'a:' + quoteId + ':cds');
            const fee = this.safeFloat (item, 'f:' + quoteId + ':cds');
            const amount = this.safeFloat (item, 'amount');
            const price = this.safeFloat (item, 'price');
            const remaining = this.safeFloat (item, 'remains');
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
                const ta = this.safeFloat (item, 'ta:' + quoteId, 0);
                const tta = this.safeFloat (item, 'tta:' + quoteId, 0);
                const fa = this.safeFloat (item, 'fa:' + quoteId, 0);
                const tfa = this.safeFloat (item, 'tfa:' + quoteId, 0);
                if (side === 'sell') {
                    cost = ta + tta + (fa + tfa);
                } else {
                    cost = ta + tta - (fa + tfa);
                }
                type = 'limit';
                orderAmount = amount;
                average = cost / filled;
            }
            const time = this.safeString (item, 'time');
            const lastTxTime = this.safeString (item, 'lastTxTime');
            const timestamp = this.parse8601 (time);
            results.push ({
                'id': item['id'],
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'lastUpdated': this.parse8601 (lastTxTime),
                'status': status,
                'symbol': this.findSymbol (baseId + '/' + quoteId),
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
                    'currency': this.currencyId (quoteId),
                },
                'info': item,
            });
        }
        return results;
    }

    parseOrderStatus (status) {
        return this.safeString (this.options['order']['status'], status, status);
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetCurrencyLimits (params);
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
            result.push ({
                'id': id,
                'info': market,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': {
                    'price': this.precisionFromString (this.safeString (market, 'minPrice')),
                    'amount': this.precisionFromString (this.safeString (market, 'minLotSize')),
                },
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
        const timestamp = response['timestamp'] * 1000;
        return this.parseOrderBook (response, timestamp);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            ohlcv[1],
            ohlcv[2],
            ohlcv[3],
            ohlcv[4],
            ohlcv[5],
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
            const key = 'data' + this.timeframes[timeframe];
            const ohlcvs = JSON.parse (response[key]);
            return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
        } catch (e) {
            if (e instanceof NullResponse) {
                return [];
            }
        }
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = undefined;
        if ('timestamp' in ticker) {
            timestamp = parseInt (ticker['timestamp']) * 1000;
        }
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
        return result;
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
        let timestamp = this.safeInteger (trade, 'date');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
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
        if (type === 'market') {
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                if (this.options['createMarketBuyOrderRequiresPrice']) {
                    if (price === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                    } else {
                        amount = amount * price;
                    }
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
        return {
            'info': response,
            'id': response['id'],
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
                if (item['type'] === 'cancel') {
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
                if (!item['price']) {
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
                // if (item['type'] === 'costsNothing')
                //     console.log (item);
                // todo: deal with these
                if (item['type'] === 'costsNothing') {
                    continue;
                }
                // --
                // if (side !== tradeSide)
                //     throw Error (JSON.stringify (order, null, 2));
                // if (orderId !== item['order'])
                //     throw Error (JSON.stringify (order, null, 2));
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
                const tradeTime = this.safeString (item, 'time');
                const tradeTimestamp = this.parse8601 (tradeTime);
                const tradeAmount = this.safeFloat (item, 'amount');
                const tradePrice = this.safeFloat (item, 'price');
                let absTradeAmount = tradeAmount < 0 ? -tradeAmount : tradeAmount;
                let tradeCost = undefined;
                if (tradeSide === 'sell') {
                    tradeCost = absTradeAmount;
                    absTradeAmount = tradeCost / tradePrice;
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
                        'cost': this.safeFloat (item, 'fee_amount'),
                        'currency': market['quote'],
                    },
                    'info': item,
                });
            }
        }
        return {
            'id': orderId,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': fee,
            'info': order,
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

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if (Array.isArray (response)) {
            return response; // public endpoints may return []-arrays
        }
        if (!response) {
            throw new NullResponse (this.id + ' returned ' + this.json (response));
        } else if (response === true || response === 'true') {
            return response;
        } else if ('e' in response) {
            if ('ok' in response) {
                if (response['ok'] === 'ok') {
                    return response;
                }
            }
            throw new ExchangeError (this.id + ' ' + this.json (response));
        } else if ('error' in response) {
            if (response['error']) {
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
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
};
