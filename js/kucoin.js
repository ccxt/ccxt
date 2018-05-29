'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidNonce, InvalidOrder, AuthenticationError, InsufficientFunds, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class kucoin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kucoin',
            'name': 'Kucoin',
            'countries': 'HK', // Hong Kong
            'version': 'v1',
            'rateLimit': 2000,
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': false,
                'cancelOrders': true,
                'createMarketOrder': false,
                'fetchDepositAddress': true,
                'fetchTickers': true,
                'fetchOHLCV': true, // see the method implementation below
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': 'emulated', // this method is to be deleted, see implementation and comments below
                'fetchCurrencies': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '8h': 480,
                '1d': 'D',
                '1w': 'W',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/33795655-b3c46e48-dcf6-11e7-8abe-dc4588ba7901.jpg',
                'api': {
                    'public': 'https://api.kucoin.com',
                    'private': 'https://api.kucoin.com',
                    'kitchen': 'https://kitchen.kucoin.com',
                    'kitchen-2': 'https://kitchen-2.kucoin.com',
                },
                'www': 'https://www.kucoin.com',
                'referral': 'https://www.kucoin.com/?r=E5wkqe',
                'doc': 'https://kucoinapidocs.docs.apiary.io',
                'fees': 'https://news.kucoin.com/en/fee',
            },
            'api': {
                'kitchen': {
                    'get': [
                        'open/chart/history',
                    ],
                },
                'public': {
                    'get': [
                        'open/chart/config',
                        'open/chart/history',
                        'open/chart/symbol',
                        'open/currencies',
                        'open/deal-orders',
                        'open/kline',
                        'open/lang-list',
                        'open/orders',
                        'open/orders-buy',
                        'open/orders-sell',
                        'open/tick',
                        'market/open/coin-info',
                        'market/open/coins',
                        'market/open/coins-trending',
                        'market/open/symbols',
                    ],
                },
                'private': {
                    'get': [
                        'account/balance',
                        'account/{coin}/wallet/address',
                        'account/{coin}/wallet/records',
                        'account/{coin}/balance',
                        'account/promotion/info',
                        'account/promotion/sum',
                        'deal-orders',
                        'order/active',
                        'order/active-map',
                        'order/dealt',
                        'order/detail',
                        'referrer/descendant/count',
                        'user/info',
                    ],
                    'post': [
                        'account/{coin}/withdraw/apply',
                        'account/{coin}/withdraw/cancel',
                        'account/promotion/draw',
                        'cancel-order',
                        'order',
                        'order/cancel-all',
                        'user/change-lang',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.001,
                    'taker': 0.001,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'KCS': 2.0,
                        'BTC': 0.0005,
                        'USDT': 10.0,
                        'ETH': 0.01,
                        'LTC': 0.001,
                        'NEO': 0.0,
                        'GAS': 0.0,
                        'KNC': 0.5,
                        'BTM': 5.0,
                        'QTUM': 0.1,
                        'EOS': 0.5,
                        'CVC': 3.0,
                        'OMG': 0.1,
                        'PAY': 0.5,
                        'SNT': 20.0,
                        'BHC': 1.0,
                        'HSR': 0.01,
                        'WTC': 0.1,
                        'VEN': 2.0,
                        'MTH': 10.0,
                        'RPX': 1.0,
                        'REQ': 20.0,
                        'EVX': 0.5,
                        'MOD': 0.5,
                        'NEBL': 0.1,
                        'DGB': 0.5,
                        'CAG': 2.0,
                        'CFD': 0.5,
                        'RDN': 0.5,
                        'UKG': 5.0,
                        'BCPT': 5.0,
                        'PPT': 0.1,
                        'BCH': 0.0005,
                        'STX': 2.0,
                        'NULS': 1.0,
                        'GVT': 0.1,
                        'HST': 2.0,
                        'PURA': 0.5,
                        'SUB': 2.0,
                        'QSP': 5.0,
                        'POWR': 1.0,
                        'FLIXX': 10.0,
                        'LEND': 20.0,
                        'AMB': 3.0,
                        'RHOC': 2.0,
                        'R': 2.0,
                        'DENT': 50.0,
                        'DRGN': 1.0,
                        'ACT': 0.1,
                    },
                    'deposit': {},
                },
            },
            // exchange-specific options
            'options': {
                'fetchOrderBookWarning': true, // raises a warning on null response in fetchOrderBook
                'timeDifference': 0, // the difference between system clock and Kucoin clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async loadTimeDifference () {
        const response = await this.publicGetOpenTick ();
        const after = this.milliseconds ();
        this.options['timeDifference'] = parseInt (after - response['timestamp']);
        return this.options['timeDifference'];
    }

    async fetchMarkets () {
        let response = await this.publicGetMarketOpenSymbols ();
        if (this.options['adjustForTimeDifference'])
            await this.loadTimeDifference ();
        let markets = response['data'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['symbol'];
            let base = market['coinType'];
            let quote = market['coinTypePair'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let active = market['trading'];
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'taker': this.safeFloat (market, 'feeRate'),
                'maker': this.safeFloat (market, 'feeRate'),
                'info': market,
                'lot': Math.pow (10, -precision['amount']),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privateGetAccountCoinWalletAddress (this.extend ({
            'coin': currency['id'],
        }, params));
        let data = response['data'];
        let address = this.safeString (data, 'address');
        this.checkAddress (address);
        let tag = this.safeString (data, 'userOid');
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'status': 'ok',
            'info': response,
        };
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetMarketOpenCoins (params);
        let currencies = response['data'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['coin'];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            let code = this.commonCurrencyCode (id);
            let precision = currency['tradePrecision'];
            let deposit = currency['enableDeposit'];
            let withdraw = currency['enableWithdraw'];
            let active = (deposit && withdraw);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'status': 'ok',
                'fee': currency['withdrawMinFee'], // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currency['withdrawMinAmount'],
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetAccountBalance (this.extend ({
        }, params));
        let balances = response['data'];
        let result = { 'info': balances };
        let indexed = this.indexBy (balances, 'coinType');
        let keys = Object.keys (indexed);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let currency = this.commonCurrencyCode (id);
            let account = this.account ();
            let balance = indexed[id];
            let used = parseFloat (balance['freezeBalance']);
            let free = parseFloat (balance['balance']);
            let total = this.sum (free, used);
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetOpenOrders (this.extend ({
            'symbol': market['id'],
            'limit': limit,
        }, params));
        let dataInResponse = ('data' in response);
        let orderbook = undefined;
        let timestamp = undefined;
        if (!dataInResponse) {
            if (this.options['fetchOrderBookWarning'])
                throw new ExchangeError (this.id + " fetchOrderBook returned an null response. Set exchange.options['fetchOrderBookWarning'] = false to silence this warning");
            orderbook = {
                'BUY': [],
                'SELL': [],
            };
        } else {
            orderbook = response['data'];
            timestamp = response['data']['timestamp'];
        }
        return this.parseOrderBook (orderbook, timestamp, 'BUY', 'SELL');
    }

    parseOrder (order, market = undefined) {
        let side = this.safeValue (order, 'direction');
        if (typeof side === 'undefined')
            side = order['type'];
        if (typeof side !== 'undefined')
            side = side.toLowerCase ();
        let orderId = this.safeString (order, 'orderOid');
        if (typeof orderId === 'undefined')
            orderId = this.safeString (order, 'oid');
        // do not confuse trades with orders
        let trades = undefined;
        if ('dealOrders' in order)
            trades = this.safeValue (order['dealOrders'], 'datas');
        if (typeof trades !== 'undefined') {
            trades = this.parseTrades (trades, market);
            for (let i = 0; i < trades.length; i++) {
                trades[i]['side'] = side;
                trades[i]['order'] = orderId;
            }
        }
        let symbol = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        } else {
            symbol = order['coinType'] + '/' + order['coinTypePair'];
        }
        let timestamp = this.safeValue (order, 'createdAt');
        let remaining = this.safeFloat (order, 'pendingAmount');
        let status = this.safeValue (order, 'status');
        let filled = this.safeFloat (order, 'dealAmount');
        let amount = this.safeFloat (order, 'amount');
        let cost = this.safeFloat (order, 'dealValue');
        if (typeof cost === 'undefined')
            cost = this.safeFloat (order, 'dealValueTotal');
        if (typeof status === 'undefined') {
            if (typeof remaining !== 'undefined')
                if (remaining > 0)
                    status = 'open';
                else
                    status = 'closed';
        }
        if (typeof filled === 'undefined') {
            if (typeof status !== 'undefined')
                if (status === 'closed')
                    filled = this.safeFloat (order, 'amount');
        } else if (filled === 0.0) {
            if (typeof trades !== 'undefined') {
                cost = 0;
                for (let i = 0; i < trades.length; i++) {
                    filled += trades[i]['amount'];
                    cost += trades[i]['cost'];
                }
            }
        }
        // kucoin price and amount fields have varying names
        // thus the convoluted spaghetti code below
        let price = undefined;
        if (typeof filled !== 'undefined') {
            // if the order was filled at least for some part
            if (filled > 0.0) {
                price = this.safeFloat (order, 'price');
                if (typeof price === 'undefined')
                    price = this.safeFloat (order, 'dealPrice');
                if (typeof price === 'undefined')
                    price = this.safeFloat (order, 'dealPriceAverage');
            } else {
                // it's an open order, not filled yet, use the initial price
                price = this.safeFloat (order, 'orderPrice');
                if (typeof price === 'undefined')
                    price = this.safeFloat (order, 'price');
            }
            if (typeof price !== 'undefined') {
                if (typeof cost === 'undefined')
                    cost = price * filled;
            }
            if (typeof amount === 'undefined') {
                if (typeof remaining !== 'undefined')
                    amount = this.sum (filled, remaining);
            } else if (typeof remaining === 'undefined') {
                remaining = amount - filled;
            }
        }
        if (status === 'open') {
            if ((typeof cost === 'undefined') || (cost === 0.0))
                if (typeof price !== 'undefined')
                    if (typeof amount !== 'undefined')
                        cost = amount * price;
        }
        let feeCurrency = undefined;
        if (typeof market !== 'undefined') {
            feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
        } else {
            let feeCurrencyField = (side === 'sell') ? 'coinTypePair' : 'coinType';
            let feeCurrency = this.safeString (order, feeCurrencyField);
            if (typeof feeCurrency !== 'undefined') {
                if (feeCurrency in this.currencies_by_id)
                    feeCurrency = this.currencies_by_id[feeCurrency]['code'];
            }
        }
        let feeCost = this.safeFloat (order, 'fee');
        let fee = {
            'cost': this.safeFloat (order, 'feeTotal', feeCost),
            'rate': this.safeFloat (order, 'feeRate'),
            'currency': feeCurrency,
        };
        let result = {
            'info': order,
            'id': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol argument');
        let orderType = this.safeValue (params, 'type');
        if (typeof orderType === 'undefined')
            throw new ExchangeError (this.id + ' fetchOrder requires a type parameter ("BUY" or "SELL")');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'type': orderType,
            'orderOid': id,
        };
        let response = await this.privateGetOrderDetail (this.extend (request, params));
        if (!response['data'])
            throw new OrderNotFound (this.id + ' ' + this.json (response));
        //
        // the caching part to be removed
        //
        //     let order = this.parseOrder (response['data'], market);
        //     let orderId = order['id'];
        //     if (orderId in this.orders)
        //         order['status'] = this.orders[orderId]['status'];
        //     this.orders[orderId] = order;
        //
        return this.parseOrder (response['data'], market);
    }

    parseOrdersByStatus (orders, market, since, limit, status) {
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            let order = this.parseOrder (this.extend (orders[i], {
                'status': status,
            }), market);
            result.push (order);
        }
        let symbol = (typeof market !== 'undefined') ? market['symbol'] : undefined;
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        let response = await this.privateGetOrderActiveMap (this.extend (request, params));
        let sell = this.safeValue (response['data'], 'SELL');
        if (typeof sell === 'undefined')
            sell = [];
        let buy = this.safeValue (response['data'], 'BUY');
        if (typeof buy === 'undefined')
            buy = [];
        let orders = this.arrayConcat (sell, buy);
        //
        // the caching part to be removed
        //
        //     for (let i = 0; i < orders.length; i++) {
        //         let order = this.parseOrder (this.extend (orders[i], {
        //             'status': 'open',
        //         }), market);
        //         let orderId = order['id'];
        //         if (orderId in this.orders)
        //             if (this.orders[orderId]['status'] !== 'open')
        //                 order['status'] = this.orders[orderId]['status'];
        //         this.orders[order['id']] = order;
        //     }
        //     let openOrders = this.filterBy (this.orders, 'status', 'open');
        //     return this.filterBySymbolSinceLimit (openOrders, symbol, since, limit);
        //
        return this.parseOrdersByStatus (orders, market, since, limit, 'open');
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 20, params = {}) {
        let request = {};
        await this.loadMarkets ();
        let market = undefined;
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (typeof since !== 'undefined')
            request['since'] = since;
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let response = await this.privateGetOrderDealt (this.extend (request, params));
        let orders = response['data']['datas'];
        //
        // the caching part to be removed
        //
        //     for (let i = 0; i < orders.length; i++) {
        //         let order = this.parseOrder (this.extend (orders[i], {
        //             'status': 'closed',
        //         }), market);
        //         let orderId = order['id'];
        //         if (orderId in this.orders)
        //             if (this.orders[orderId]['status'] === 'canceled')
        //                 order['status'] = this.orders[orderId]['status'];
        //         this.orders[order['id']] = order;
        //     }
        //     let closedOrders = this.filterBy (this.orders, 'status', 'closed');
        //     return this.filterBySymbolSinceLimit (closedOrders, symbol, since, limit);
        //
        return this.parseOrdersByStatus (orders, market, since, limit, 'closed');
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let quote = market['quote'];
        let base = market['base'];
        let request = {
            'symbol': market['id'],
            'type': side.toUpperCase (),
            'price': this.truncate (price, this.currencies[quote]['precision']),
            'amount': this.truncate (amount, this.currencies[base]['precision']),
        };
        price = parseFloat (price);
        amount = parseFloat (amount);
        let cost = price * amount;
        let response = await this.privatePostOrder (this.extend (request, params));
        let orderId = this.safeString (response['data'], 'orderOid');
        let timestamp = this.safeInteger (response, 'timestamp');
        let iso8601 = undefined;
        if (typeof timestamp !== 'undefined')
            iso8601 = this.iso8601 (timestamp);
        let order = {
            'info': response,
            'id': orderId,
            'timestamp': timestamp,
            'datetime': iso8601,
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'price': price,
            'cost': cost,
            'status': 'open',
            'fee': undefined,
            'trades': undefined,
        };
        this.orders[orderId] = order;
        return order;
    }

    async cancelOrders (symbol = undefined, params = {}) {
        // https://kucoinapidocs.docs.apiary.io/#reference/0/trading/cancel-all-orders
        // docs say symbol is required, but it seems to be optional
        // you can cancel all orders, or filter by symbol or type or both
        let request = {};
        if (symbol) {
            await this.loadMarkets ();
            let market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if ('type' in params) {
            request['type'] = params['type'].toUpperCase ();
            params = this.omit (params, 'type');
        }
        //
        // the caching part to be removed
        //
        //     let response = await this.privatePostOrderCancelAll (this.extend (request, params));
        //     let openOrders = this.filterBy (this.orders, 'status', 'open');
        //     for (let i = 0; i < openOrders.length; i++) {
        //         let order = openOrders[i];
        //         let orderId = order['id'];
        //         this.orders[orderId]['status'] = 'canceled';
        //     }
        //     return response;
        //
        return await this.privatePostOrderCancelAll (this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' cancelOrder requires a symbol');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'orderOid': id,
        };
        if ('type' in params) {
            request['type'] = params['type'].toUpperCase ();
            params = this.omit (params, 'type');
        } else {
            throw new ExchangeError (this.id + ' cancelOrder requires parameter type=["BUY"|"SELL"]');
        }
        //
        // the caching part to be removed
        //
        //     let response = await this.privatePostCancelOrder (this.extend (request, params));
        //     if (id in this.orders) {
        //         this.orders[id]['status'] = 'canceled';
        //     } else {
        //         // store it in cache for further references
        //         let timestamp = this.milliseconds ();
        //         let side = request['type'].toLowerCase ();
        //         this.orders[id] = {
        //             'id': id,
        //             'timestamp': timestamp,
        //             'datetime': this.iso8601 (timestamp),
        //             'type': undefined,
        //             'side': side,
        //             'symbol': symbol,
        //             'status': 'canceled',
        //         };
        //     }
        //     return response;
        //
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['datetime'];
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            symbol = ticker['coinType'] + '/' + ticker['coinTypePair'];
        }
        // TNC coin doesn't have changerate for some reason
        let change = this.safeFloat (ticker, 'change');
        let last = this.safeFloat (ticker, 'lastDealPrice');
        let open = undefined;
        if (typeof last !== 'undefined')
            if (typeof change !== 'undefined')
                open = last - change;
        let changePercentage = this.safeFloat (ticker, 'changeRate');
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
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': changePercentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'volValue'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        let response = await this.publicGetMarketOpenSymbols (params);
        let tickers = response['data'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = this.parseTicker (tickers[t]);
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetOpenTick (this.extend ({
            'symbol': market['id'],
        }, params));
        let ticker = response['data'];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let id = undefined;
        let order = undefined;
        let info = trade;
        let timestamp = undefined;
        let type = undefined;
        let side = undefined;
        let price = undefined;
        let cost = undefined;
        let amount = undefined;
        let fee = undefined;
        if (Array.isArray (trade)) {
            timestamp = trade[0];
            type = 'limit';
            if (trade[1] === 'BUY') {
                side = 'buy';
            } else if (trade[1] === 'SELL') {
                side = 'sell';
            }
            price = trade[2];
            amount = trade[3];
        } else {
            timestamp = this.safeValue (trade, 'createdAt');
            order = this.safeString (trade, 'orderOid');
            id = this.safeString (trade, 'oid');
            side = this.safeString (trade, 'direction');
            if (typeof side !== 'undefined')
                side = side.toLowerCase ();
            price = this.safeFloat (trade, 'dealPrice');
            amount = this.safeFloat (trade, 'amount');
            cost = this.safeFloat (trade, 'dealValue');
            let feeCurrency = undefined;
            if (typeof market !== 'undefined') {
                feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
            } else {
                let feeCurrencyField = (side === 'sell') ? 'coinTypePair' : 'coinType';
                let feeCurrency = this.safeString (order, feeCurrencyField);
                if (typeof feeCurrency !== 'undefined') {
                    if (feeCurrency in this.currencies_by_id)
                        feeCurrency = this.currencies_by_id[feeCurrency]['code'];
                }
            }
            fee = {
                'cost': this.safeFloat (trade, 'fee'),
                'currency': feeCurrency,
            };
        }
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        return {
            'id': id,
            'order': order,
            'info': info,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetOpenDealOrders (this.extend ({
            'symbol': market['id'],
            'limit': limit,
        }, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // todo: this method is deprecated and to be deleted shortly
        // it improperly mimics fetchMyTrades with closed orders
        // kucoin does not have any means of fetching personal trades at all
        // this will effectively simplify current convoluted implementations of parseOrder and parseTrade
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchMyTrades is deprecated and requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let response = await this.privateGetDealOrders (this.extend (request, params));
        return this.parseTrades (response['data']['datas'], market, since, limit);
    }

    parseTradingViewOHLCV (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        let result = this.convertTradingViewToOHLCV (ohlcvs);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let end = this.seconds ();
        let resolution = this.timeframes[timeframe];
        // convert 'resolution' to minutes in order to calculate 'from' later
        let minutes = resolution;
        if (minutes === 'D') {
            if (typeof limit === 'undefined')
                limit = 30; // 30 days, 1 month
            minutes = 1440;
        } else if (minutes === 'W') {
            if (typeof limit === 'undefined')
                limit = 52; // 52 weeks, 1 year
            minutes = 10080;
        } else if (typeof limit === 'undefined') {
            // last 1440 periods, whatever the duration of the period is
            // for 1m it equals 1 day (24 hours)
            // for 5m it equals 5 days
            // ...
            limit = 1440;
        }
        let start = end - limit * minutes * 60;
        // if 'since' has been supplied by user
        if (typeof since !== 'undefined') {
            start = parseInt (since / 1000); // convert milliseconds to seconds
            end = Math.min (end, this.sum (start, limit * minutes * 60));
        }
        let request = {
            'symbol': market['id'],
            'resolution': resolution,
            'from': start,
            'to': end,
        };
        let response = await this.publicGetOpenChartHistory (this.extend (request, params));
        return this.parseTradingViewOHLCV (response, market, timeframe, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        this.checkAddress (address);
        let response = await this.privatePostAccountCoinWithdrawApply (this.extend ({
            'coin': currency['id'],
            'amount': amount,
            'address': address,
        }, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            // their nonce is always a calibrated synched milliseconds-timestamp
            let nonce = this.nonce ();
            let queryString = '';
            nonce = nonce.toString ();
            if (Object.keys (query).length) {
                queryString = this.rawencode (this.keysort (query));
                url += '?' + queryString;
                if (method !== 'GET') {
                    body = queryString;
                }
            }
            let auth = endpoint + '/' + nonce + '/' + queryString;
            let payload = this.stringToBase64 (this.encode (auth));
            // payload should be "encoded" as returned from stringToBase64
            let signature = this.hmac (payload, this.encode (this.secret), 'sha256');
            headers = {
                'KC-API-KEY': this.apiKey,
                'KC-API-NONCE': nonce,
                'KC-API-SIGNATURE': signature,
            };
        } else {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    throwExceptionOnError (response) {
        //
        // API endpoints return the following formats
        //     { success: false, code: "ERROR", msg: "Min price:100.0" }
        //     { success: true,  code: "OK",    msg: "Operation succeeded." }
        //
        // Web OHLCV endpoint returns this:
        //     { s: "ok", o: [], h: [], l: [], c: [], v: [] }
        //
        // This particular method handles API responses only
        //
        if (!('success' in response))
            return;
        if (response['success'] === true)
            return; // not an error
        if (!('code' in response) || !('msg' in response))
            throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        const feedback = this.id + ' ' + this.json (response);
        if (code === 'UNAUTH') {
            if (message === 'Invalid nonce')
                throw new InvalidNonce (feedback);
            throw new AuthenticationError (feedback);
        } else if (code === 'ERROR') {
            if (message.indexOf ('The precision of amount') >= 0)
                throw new InvalidOrder (feedback); // amount violates precision.amount
            if (message.indexOf ('Min amount each order') >= 0)
                throw new InvalidOrder (feedback); // amount < limits.amount.min
            if (message.indexOf ('Min price:') >= 0)
                throw new InvalidOrder (feedback); // price < limits.price.min
            if (message.indexOf ('Max price:') >= 0)
                throw new InvalidOrder (feedback); // price > limits.price.max
            if (message.indexOf ('The precision of price') >= 0)
                throw new InvalidOrder (feedback); // price violates precision.price
        } else if (code === 'NO_BALANCE') {
            if (message.indexOf ('Insufficient balance') >= 0)
                throw new InsufficientFunds (feedback);
        }
        throw new ExchangeError (this.id + ': unknown response: ' + this.json (response));
    }

    handleErrors (code, reason, url, method, headers, body, response = undefined) {
        if (typeof response !== 'undefined') {
            // JS callchain parses body beforehand
            this.throwExceptionOnError (response);
        } else if (body && (body[0] === '{')) {
            // Python/PHP callchains don't have json available at this step
            this.throwExceptionOnError (JSON.parse (body));
        }
    }
};
