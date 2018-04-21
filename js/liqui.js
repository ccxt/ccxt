'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, OrderNotFound, DDoSProtection, InvalidOrder, AuthenticationError } = require ('./base/errors');

module.exports = class liqui extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'liqui',
            'name': 'Liqui',
            'countries': 'UA',
            'rateLimit': 3000,
            'version': '3',
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': false,
                'createMarketOrder': false,
                'fetchOrderBooks': true,
                'fetchOrder': true,
                'fetchOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchClosedOrders': 'emulated',
                'fetchTickers': true,
                'fetchMyTrades': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg',
                'api': {
                    'public': 'https://api.liqui.io/api',
                    'private': 'https://api.liqui.io/tapi',
                    'web': 'https://liqui.io',
                    'cacheapi': 'https://cacheapi.liqui.io/Market',
                    'webapi': 'https://webapi.liqui.io/Market',
                    'charts': 'https://charts.liqui.io/chart',
                },
                'www': 'https://liqui.io',
                'doc': 'https://liqui.io/api',
                'fees': 'https://liqui.io/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'info',
                        'ticker/{pair}',
                        'depth/{pair}',
                        'trades/{pair}',
                    ],
                },
                'private': {
                    'post': [
                        'getInfo',
                        'Trade',
                        'ActiveOrders',
                        'OrderInfo',
                        'CancelOrder',
                        'TradeHistory',
                        'CoinDepositAddress',
                        'WithdrawCoin',
                        'CreateCoupon',
                        'RedeemCoupon',
                    ],
                },
                'web': {
                    'get': [
                        'User/Balances',
                    ],
                    'post': [
                        'User/Login/',
                        'User/Session/Activate/',
                    ],
                },
                'cacheapi': {
                    'get': [
                        'Pairs',
                        'Currencies',
                        'depth', // ?id=228
                        'Tickers',
                    ],
                },
                'webapi': {
                    'get': [
                        'Last', // ?id=228
                        'Info',
                    ],
                },
                'charts': {
                    'get': [
                        'config',
                        'history', // ?symbol=228&resolution=15&from=1524002997&to=1524011997'
                        'symbols', // ?symbol=228
                        'time',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.001,
                    'taker': 0.0025,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'commonCurrencies': {
                'DSH': 'DASH',
            },
            'exceptions': {
                '803': InvalidOrder, // "Count could not be less than 0.001." (selling below minAmount)
                '804': InvalidOrder, // "Count could not be more than 10000." (buying above maxAmount)
                '805': InvalidOrder, // "price could not be less than X." (minPrice violation on buy & sell)
                '806': InvalidOrder, // "price could not be more than X." (maxPrice violation on buy & sell)
                '807': InvalidOrder, // "cost could not be less than X." (minCost violation on buy & sell)
                '831': InsufficientFunds, // "Not enougth X to create buy order." (buying with balance.quote < order.cost)
                '832': InsufficientFunds, // "Not enougth X to create sell order." (selling with balance.base < order.amount)
                '833': OrderNotFound, // "Order with id X was not found." (cancelling non-existent, closed and cancelled order)
            },
        });
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': cost,
        };
    }

    getBaseQuoteFromMarketId (id) {
        let uppercase = id.toUpperCase ();
        let [ base, quote ] = uppercase.split ('_');
        base = this.commonCurrencyCode (base);
        quote = this.commonCurrencyCode (quote);
        return [ base, quote ];
    }

    async fetchMarkets () {
        let response = await this.publicGetInfo ();
        let markets = response['pairs'];
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let market = markets[id];
            let [ base, quote ] = this.getBaseQuoteFromMarketId (id);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': this.safeInteger (market, 'decimal_places'),
                'price': this.safeInteger (market, 'decimal_places'),
            };
            let amountLimits = {
                'min': this.safeFloat (market, 'min_amount'),
                'max': this.safeFloat (market, 'max_amount'),
            };
            let priceLimits = {
                'min': this.safeFloat (market, 'min_price'),
                'max': this.safeFloat (market, 'max_price'),
            };
            let costLimits = {
                'min': this.safeFloat (market, 'min_total'),
            };
            let limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': costLimits,
            };
            let hidden = this.safeInteger (market, 'hidden');
            let active = (hidden === 0);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'taker': market['fee'] / 100,
                'lot': amountLimits['min'],
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchMarketsFromCache () {
        let markets = await this.cacheapiGetPairs ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            //
            //  {              Id:  249,
            //              Order:  62,
            //     BaseCurrencyId:  110,
            //    QuoteCurrencyId:  35,
            //            IsTrade:  true,
            //          IsVisible:  true,
            //           MinTotal:  1,
            //           MinPrice:  0.00001,
            //           MaxPrice:  1000,
            //         PricePoint:  8,
            //          MinAmount:  1e-8,
            //          MaxAmount:  1000000,
            //        AmountPoint:  8,
            //         DisableFee:  false,
            //           MakerFee:  0.001,
            //           TakerFee:  0.0025,
            //           BaseName: "ENJ",
            //          QuoteName: "USDT",
            //               Name: "ENJ/USDT" }
            //
            let baseId = market['BaseName'];
            let quoteId = market['QuoteName'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let id = baseId.toLowerCase () + '_' + quoteId.toLowerCase ();
            let symbol = base + '/' + quote;
            let precision = {
                'amount': this.safeInteger (market, 'AmountPoint'),
                'price': this.safeInteger (market, 'PricePoint'),
            };
            let amountLimits = {
                'min': this.safeFloat (market, 'MinAmount'),
                'max': this.safeFloat (market, 'MaxAmount'),
            };
            let priceLimits = {
                'min': this.safeFloat (market, 'MinPrice'),
                'max': this.safeFloat (market, 'MaxPrice'),
            };
            let costLimits = {
                'min': this.safeFloat (market, 'MinTotal'),
            };
            let limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': costLimits,
            };
            let isTrading = this.safeValue (market, 'IsTrade');
            let isVisible = this.safeValue (market, 'IsVisible');
            let active = (isTrading && isVisible);
            result.push ({
                'id': id,
                'marketId': market['Id'],
                'baseNumericId': market['BaseCurrencyId'],
                'quoteNumericId': market['QuoteCurrencyId'],
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'taker': market['TakerFee'],
                'maker': market['MakerFee'],
                'lot': amountLimits['min'],
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrenciesFromCache (params = {}) {
        let currencies = await this.cacheapiGetCurrencies (params);
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            //
            //  {               Id:    12,
            //              Symbol:   "ETH",
            //                Type:    2,
            //                Name:   "Ethereum",
            //               Order:    9,
            //         AmountPoint:    8,
            //       DepositEnable:    true,
            //    DepositMinAmount:    0.05,
            //      WithdrawEnable:    true,
            //         WithdrawFee:    0.01,
            //    WithdrawMinAmout:    0.01,
            //            Settings: {        Blockchain: "https://etherscan.io/",
            //                                    TxUrl: "https://etherscan.io/tx/{0}",
            //                                  AddrUrl: "https://etherscan.io/address/{0}",
            //                        ConfirmationCount:  30,
            //                                 NeedMemo:  false                              },
            //
            let id = currency['Symbol'];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            let code = this.commonCurrencyCode (id);
            let precision = currency['AmountPoint']; // default precision, todo: fix "magic constants"
            let active = currency['DepositEnable'] && currency['WithdrawEnable'] && currency['Visible'];
            result[code] = {
                'id': id,
                'code': code,
                'numericId': currency['Id'],
                'info': currency,
                'name': currency['Name'],
                'active': active,
                'status': 'ok',
                'type': 'crypto',
                'fee': currency['WithdrawFee'], // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': currency['DepositMinAmount'],
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
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchBalanceFromWeb (params = {}) {
        // this is an alternative implementation of Liqui website balances
        // for use with numeric currency ids from their cache API
        await this.loadMarkets ();
        if (!('currenciesByNumericId' in this.options))
            this.options['currenciesByNumericId'] = this.indexBy (this.currencies, 'numericId');
        let balances = await this.webGetUserBalances (params);
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            //
            //  { CurrencyId: 12,
            //         Value: 1.1990027336966798,
            //      InOrders: 0.11752418,
            //    InInterest: 0,
            //       Changes: 0                   }
            //
            let numericId = balance['CurrencyId'];
            let code = numericId.toString ();
            if (numericId in this.options['currenciesByNumericId']) {
                code = this.options['currenciesByNumericId'][numericId]['code'];
            }
            let used = this.sum (balance['InOrders'], balance['InInterest']);
            let total = balance['Value'];
            let free = total - used;
            let account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetInfo ();
        let balances = response['return'];
        let result = { 'info': balances };
        let funds = balances['funds'];
        let currencies = Object.keys (funds);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let uppercase = currency.toUpperCase ();
            uppercase = this.commonCurrencyCode (uppercase);
            let total = undefined;
            let used = undefined;
            if (balances['open_orders'] === 0) {
                total = funds[currency];
                used = 0.0;
            }
            let account = {
                'free': funds[currency],
                'used': used,
                'total': total,
            };
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
        };
        if (typeof limit !== 'undefined')
            request['limit'] = limit; // default = 150, max = 2000
        let response = await this.publicGetDepthPair (this.extend (request, params));
        let market_id_in_reponse = (market['id'] in response);
        if (!market_id_in_reponse)
            throw new ExchangeError (this.id + ' ' + market['symbol'] + ' order book is empty or not available');
        let orderbook = response[market['id']];
        return this.parseOrderBook (orderbook);
    }

    async fetchOrderBooks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = undefined;
        if (!symbols) {
            ids = this.ids.join ('-');
            // max URL length is 2083 symbols, including http schema, hostname, tld, etc...
            if (ids.length > 2048) {
                let numIds = this.ids.length;
                throw new ExchangeError (this.id + ' has ' + numIds.toString () + ' symbols exceeding max URL length, you are required to specify a list of symbols in the first argument to fetchOrderBooks');
            }
        } else {
            ids = this.marketIds (symbols);
            ids = ids.join ('-');
        }
        let response = await this.publicGetDepthPair (this.extend ({
            'pair': ids,
        }, params));
        let result = {};
        ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let symbol = id;
            if (id in this.markets_by_id) {
                let market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
            result[symbol] = this.parseOrderBook (response[id]);
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['updated'] * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last');
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
            'average': this.safeFloat (ticker, 'avg'),
            'baseVolume': this.safeFloat (ticker, 'vol_cur'),
            'quoteVolume': this.safeFloat (ticker, 'vol'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = undefined;
        if (!symbols) {
            ids = this.ids.join ('-');
            // max URL length is 2083 symbols, including http schema, hostname, tld, etc...
            if (ids.length > 2048) {
                let numIds = this.ids.length;
                throw new ExchangeError (this.id + ' has ' + numIds.toString () + ' symbols exceeding max URL length, you are required to specify a list of symbols in the first argument to fetchTickers');
            }
        } else {
            ids = this.marketIds (symbols);
            ids = ids.join ('-');
        }
        let tickers = await this.publicGetTickerPair (this.extend ({
            'pair': ids,
        }, params));
        let result = {};
        let keys = Object.keys (tickers);
        for (let k = 0; k < keys.length; k++) {
            let id = keys[k];
            let ticker = tickers[id];
            let symbol = id;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        let tickers = await this.fetchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    parseTrade (trade, market = undefined) {
        let timestamp = parseInt (trade['timestamp']) * 1000;
        let side = trade['type'];
        if (side === 'ask')
            side = 'sell';
        if (side === 'bid')
            side = 'buy';
        let price = this.safeFloat (trade, 'price');
        if ('rate' in trade)
            price = this.safeFloat (trade, 'rate');
        let id = this.safeString (trade, 'tid');
        if ('trade_id' in trade)
            id = this.safeString (trade, 'trade_id');
        let order = this.safeString (trade, this.getOrderIdKey ());
        if ('pair' in trade) {
            let marketId = trade['pair'];
            market = this.markets_by_id[marketId];
        }
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let amount = trade['amount'];
        let type = 'limit'; // all trades are still limit trades
        let isYourOrder = this.safeValue (trade, 'is_your_order');
        let takerOrMaker = 'taker';
        if (typeof isYourOrder !== 'undefined')
            if (isYourOrder)
                takerOrMaker = 'maker';
        let fee = this.calculateFee (symbol, type, side, amount, price, takerOrMaker);
        return {
            'id': id,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'fee': fee,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
        };
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let response = await this.publicGetTradesPair (this.extend (request, params));
        return this.parseTrades (response[market['id']], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
            'type': side,
            'amount': this.amountToPrecision (symbol, amount),
            'rate': this.priceToPrecision (symbol, price),
        };
        price = parseFloat (price);
        amount = parseFloat (amount);
        let response = await this.privatePostTrade (this.extend (request, params));
        let id = undefined;
        let status = 'open';
        let filled = 0.0;
        let remaining = amount;
        if ('return' in response) {
            id = this.safeString (response['return'], this.getOrderIdKey ());
            if (id === '0') {
                id = this.safeString (response['return'], 'init_order_id');
                status = 'closed';
            }
            filled = this.safeFloat (response['return'], 'received', 0.0);
            remaining = this.safeFloat (response['return'], 'remains', amount);
        }
        let timestamp = this.milliseconds ();
        let order = {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * filled,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
        };
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    getOrderIdKey () {
        return 'order_id';
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        let request = {};
        let idKey = this.getOrderIdKey ();
        request[idKey] = id;
        response = await this.privatePostCancelOrder (this.extend (request, params));
        if (id in this.orders)
            this.orders[id]['status'] = 'canceled';
        return response;
    }

    parseOrderStatus (status) {
        let statuses = {
            '0': 'open',
            '1': 'closed',
            '2': 'canceled',
            '3': 'canceled', // or partially-filled and still open? https://github.com/ccxt/ccxt/issues/1594
        };
        if (status in statuses)
            return statuses[status];
        return status;
    }

    parseOrder (order, market = undefined) {
        let id = order['id'].toString ();
        let status = this.safeString (order, 'status');
        if (status !== 'undefined')
            status = this.parseOrderStatus (status);
        let timestamp = parseInt (order['timestamp_created']) * 1000;
        let symbol = undefined;
        if (!market)
            market = this.markets_by_id[order['pair']];
        if (market)
            symbol = market['symbol'];
        let remaining = undefined;
        let amount = undefined;
        let price = this.safeFloat (order, 'rate');
        let filled = undefined;
        let cost = undefined;
        if ('start_amount' in order) {
            amount = this.safeFloat (order, 'start_amount');
            remaining = this.safeFloat (order, 'amount');
        } else {
            remaining = this.safeFloat (order, 'amount');
            if (id in this.orders)
                amount = this.orders[id]['amount'];
        }
        if (typeof amount !== 'undefined') {
            if (typeof remaining !== 'undefined') {
                filled = amount - remaining;
                cost = price * filled;
            }
        }
        let fee = undefined;
        let result = {
            'info': order,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': 'limit',
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined) {
        let ids = Object.keys (orders);
        let result = [];
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let order = orders[id];
            let extended = this.extend (order, { 'id': id });
            result.push (this.parseOrder (extended, market));
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderInfo (this.extend ({
            'order_id': parseInt (id),
        }, params));
        id = id.toString ();
        let newOrder = this.parseOrder (this.extend ({ 'id': id }, response['return'][id]));
        let oldOrder = (id in this.orders) ? this.orders[id] : {};
        this.orders[id] = this.extend (oldOrder, newOrder);
        return this.orders[id];
    }

    updateCachedOrders (openOrders, symbol) {
        // update local cache with open orders
        for (let j = 0; j < openOrders.length; j++) {
            const id = openOrders[j]['id'];
            this.orders[id] = openOrders[j];
        }
        let openOrdersIndexedById = this.indexBy (openOrders, 'id');
        let cachedOrderIds = Object.keys (this.orders);
        let result = [];
        for (let k = 0; k < cachedOrderIds.length; k++) {
            // match each cached order to an order in the open orders array
            // possible reasons why a cached order may be missing in the open orders array:
            // - order was closed or canceled -> update cache
            // - symbol mismatch (e.g. cached BTC/USDT, fetched ETH/USDT) -> skip
            let id = cachedOrderIds[k];
            let order = this.orders[id];
            result.push (order);
            if (!(id in openOrdersIndexedById)) {
                // cached order is not in open orders array
                // if we fetched orders by symbol and it doesn't match the cached order -> won't update the cached order
                if (typeof symbol !== 'undefined' && symbol !== order['symbol'])
                    continue;
                // order is cached but not present in the list of open orders -> mark the cached order as closed
                if (order['status'] === 'open') {
                    order = this.extend (order, {
                        'status': 'closed', // likewise it might have been canceled externally (unnoticed by "us")
                        'cost': undefined,
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                    if (typeof order['cost'] === 'undefined') {
                        if (typeof order['filled'] !== 'undefined')
                            order['cost'] = order['filled'] * order['price'];
                    }
                    this.orders[id] = order;
                }
            }
        }
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if ('fetchOrdersRequiresSymbol' in this.options)
            if (this.options['fetchOrdersRequiresSymbol'])
                if (typeof symbol === 'undefined')
                    throw new ExchangeError (this.id + ' fetchOrders requires a symbol argument');
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (typeof symbol !== 'undefined') {
            let market = this.market (symbol);
            request['pair'] = market['id'];
        }
        let response = await this.privatePostActiveOrders (this.extend (request, params));
        // liqui etc can only return 'open' orders (i.e. no way to fetch 'closed' orders)
        let openOrders = [];
        if ('return' in response)
            openOrders = this.parseOrders (response['return'], market);
        let allOrders = this.updateCachedOrders (openOrders, symbol);
        let result = this.filterBySymbol (allOrders, symbol);
        return this.filterBySinceLimit (result, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'open');
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {
            // 'from': 123456789, // trade ID, from which the display starts numerical 0 (test result: liqui ignores this field)
            // 'count': 1000, // the number of trades for display numerical, default = 1000
            // 'from_id': trade ID, from which the display starts numerical 0
            // 'end_id': trade ID on which the display ends numerical ∞
            // 'order': 'ASC', // sorting, default = DESC (test result: liqui ignores this field, most recent trade always goes last)
            // 'since': 1234567890, // UTC start time, default = 0 (test result: liqui ignores this field)
            // 'end': 1234567890, // UTC end time, default = ∞ (test result: liqui ignores this field)
            // 'pair': 'eth_btc', // default = all markets
        };
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (typeof limit !== 'undefined')
            request['count'] = parseInt (limit);
        if (typeof since !== 'undefined')
            request['since'] = parseInt (since / 1000);
        let response = await this.privatePostTradeHistory (this.extend (request, params));
        let trades = [];
        if ('return' in response)
            trades = response['return'];
        return this.parseTrades (trades, market, since, limit);
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let response = await this.privatePostWithdrawCoin (this.extend ({
            'coinName': currency,
            'amount': parseFloat (amount),
            'address': address,
        }, params));
        return {
            'info': response,
            'id': response['return']['tId'],
        };
    }

    signBodyWithSecret (body) {
        return this.hmac (this.encode (body), this.encode (this.secret), 'sha512');
    }

    getVersionString () {
        return '/' + this.version;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'nonce': nonce,
                'method': path,
            }, query));
            let signature = this.signBodyWithSecret (body);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': signature,
            };
        } else if (api === 'public') {
            url += this.getVersionString () + '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            url += '/' + this.implodeParams (path, params);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    headers = {
                        'Content-Type': 'application/json',
                    };
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            if ('success' in response) {
                //
                // 1 - Liqui only returns the integer 'success' key from their private API
                //
                //     { "success": 1, ... } httpCode === 200
                //     { "success": 0, ... } httpCode === 200
                //
                // 2 - However, exchanges derived from Liqui, can return non-integers
                //
                //     It can be a numeric string
                //     { "sucesss": "1", ... }
                //     { "sucesss": "0", ... }, httpCode >= 200 (can be 403, 502, etc)
                //
                //     Or just a string
                //     { "success": "true", ... }
                //     { "success": "false", ... }, httpCode >= 200
                //
                //     Or a boolean
                //     { "success": true, ... }
                //     { "success": false, ... }, httpCode >= 200
                //
                // 3 - Oversimplified, Python PEP8 forbids comparison operator (===) of different types
                //
                // 4 - We do not want to copy-paste and duplicate the code of this handler to other exchanges derived from Liqui
                //
                // To cover points 1, 2, 3 and 4 combined this handler should work like this:
                //
                let success = this.safeValue (response, 'success', false);
                if (typeof success === 'string') {
                    if ((success === 'true') || (success === '1'))
                        success = true;
                    else
                        success = false;
                }
                if (!success) {
                    const code = this.safeString (response, 'code');
                    const message = this.safeString (response, 'error');
                    const feedback = this.id + ' ' + this.json (response);
                    const exceptions = this.exceptions;
                    if (code in exceptions) {
                        throw new exceptions[code] (feedback);
                    }
                    // need a second error map for these messages, apparently...
                    // in fact, we can use the same .exceptions with string-keys to save some loc here
                    if (message === 'invalid api key') {
                        throw new AuthenticationError (feedback);
                    } else if (message === 'api key dont have trade permission') {
                        throw new AuthenticationError (feedback);
                    } else if (message.indexOf ('invalid parameter') >= 0) { // errorCode 0, returned on buy(symbol, 0, 0)
                        throw new InvalidOrder (feedback);
                    } else if (message === 'invalid order') {
                        throw new InvalidOrder (feedback);
                    } else if (message === 'Requests too often') {
                        throw new DDoSProtection (feedback);
                    } else if (message === 'not available') {
                        throw new DDoSProtection (feedback);
                    } else if (message === 'data unavailable') {
                        throw new DDoSProtection (feedback);
                    } else if (message === 'external service unavailable') {
                        throw new DDoSProtection (feedback);
                    } else {
                        throw new ExchangeError (this.id + ' unknown "error" value: ' + this.json (response));
                    }
                }
            }
        }
    }
};
