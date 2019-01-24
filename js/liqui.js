'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, DDoSProtection, InvalidOrder, AuthenticationError } = require ('./base/errors');

module.exports = class liqui extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'liqui',
            'name': 'Liqui',
            'countries': [ 'UA' ],
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
                'exact': {
                    '803': InvalidOrder, // "Count could not be less than 0.001." (selling below minAmount)
                    '804': InvalidOrder, // "Count could not be more than 10000." (buying above maxAmount)
                    '805': InvalidOrder, // "price could not be less than X." (minPrice violation on buy & sell)
                    '806': InvalidOrder, // "price could not be more than X." (maxPrice violation on buy & sell)
                    '807': InvalidOrder, // "cost could not be less than X." (minCost violation on buy & sell)
                    '831': InsufficientFunds, // "Not enougth X to create buy order." (buying with balance.quote < order.cost)
                    '832': InsufficientFunds, // "Not enougth X to create sell order." (selling with balance.base < order.amount)
                    '833': OrderNotFound, // "Order with id X was not found." (cancelling non-existent, closed and cancelled order)
                },
                'broad': {
                    'Invalid pair name': ExchangeError, // {"success":0,"error":"Invalid pair name: btc_eth"}
                    'invalid api key': AuthenticationError,
                    'invalid sign': AuthenticationError,
                    'api key dont have trade permission': AuthenticationError,
                    'invalid parameter': InvalidOrder,
                    'invalid order': InvalidOrder,
                    'Requests too often': DDoSProtection,
                    'not available': ExchangeNotAvailable,
                    'data unavailable': ExchangeNotAvailable,
                    'external service unavailable': ExchangeNotAvailable,
                },
            },
            'options': {
                'fetchOrderMethod': 'privatePostOrderInfo',
                'fetchMyTradesMethod': 'privatePostTradeHistory',
                'cancelOrderMethod': 'privatePostCancelOrder',
                'fetchTickersMaxLength': 2048,
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

    async fetchMarkets (params = {}) {
        let response = await this.publicGetInfo ();
        let markets = response['pairs'];
        let keys = Object.keys (markets);
        let result = [];
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let market = markets[id];
            let [ baseId, quoteId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
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
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'taker': market['fee'] / 100,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
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
        if (limit !== undefined) {
            request['limit'] = limit; // default = 150, max = 2000
        }
        let response = await this.publicGetDepthPair (this.extend (request, params));
        let market_id_in_reponse = (market['id'] in response);
        if (!market_id_in_reponse) {
            throw new ExchangeError (this.id + ' ' + market['symbol'] + ' order book is empty or not available');
        }
        let orderbook = response[market['id']];
        return this.parseOrderBook (orderbook);
    }

    async fetchOrderBooks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = undefined;
        if (symbols === undefined) {
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
        //
        //   {    high: 0.03497582,
        //         low: 0.03248474,
        //         avg: 0.03373028,
        //         vol: 120.11485715062999,
        //     vol_cur: 3572.24914074,
        //        last: 0.0337611,
        //         buy: 0.0337442,
        //        sell: 0.03377798,
        //     updated: 1537522009          }
        //
        let timestamp = ticker['updated'] * 1000;
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
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
        let ids = this.ids;
        if (symbols === undefined) {
            let numIds = ids.length;
            ids = ids.join ('-');
            let maxLength = this.safeInteger (this.options, 'fetchTickersMaxLength', 2048);
            // max URL length is 2048 symbols, including http schema, hostname, tld, etc...
            if (ids.length > this.options['fetchTickersMaxLength']) {
                throw new ArgumentsRequired (this.id + ' has ' + numIds.toString () + ' markets exceeding max URL length for this endpoint (' + maxLength.toString () + ' characters), please, specify a list of symbols of interest in the first argument to fetchTickers');
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
        let timestamp = this.safeInteger (trade, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
        let side = this.safeString (trade, 'type');
        if (side === 'ask') {
            side = 'sell';
        } else if (side === 'bid') {
            side = 'buy';
        }
        let price = this.safeFloat2 (trade, 'rate', 'price');
        let id = this.safeString2 (trade, 'trade_id', 'tid');
        let order = this.safeString (trade, this.getOrderIdKey ());
        if ('pair' in trade) {
            let marketId = this.safeString (trade, 'pair');
            market = this.safeValue (this.markets_by_id, marketId, market);
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let amount = this.safeFloat (trade, 'amount');
        let type = 'limit'; // all trades are still limit trades
        let takerOrMaker = undefined;
        let fee = undefined;
        let feeCost = this.safeFloat (trade, 'commission');
        if (feeCost !== undefined) {
            let feeCurrencyId = this.safeString (trade, 'commissionCurrency');
            feeCurrencyId = feeCurrencyId.toUpperCase ();
            let feeCurrency = this.safeValue (this.currencies_by_id, feeCurrencyId);
            let feeCurrencyCode = undefined;
            if (feeCurrency !== undefined) {
                feeCurrencyCode = feeCurrency['code'];
            } else {
                feeCurrencyCode = this.commonCurrencyCode (feeCurrencyId);
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        let isYourOrder = this.safeValue (trade, 'is_your_order');
        if (isYourOrder !== undefined) {
            takerOrMaker = 'taker';
            if (isYourOrder) {
                takerOrMaker = 'maker';
            }
            if (fee === undefined) {
                fee = this.calculateFee (symbol, type, side, amount, price, takerOrMaker);
            }
        }
        return {
            'id': id,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
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
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this.publicGetTradesPair (this.extend (request, params));
        if (Array.isArray (response)) {
            let numElements = response.length;
            if (numElements === 0) {
                return [];
            }
        }
        return this.parseTrades (response[market['id']], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
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
        let request = {};
        let idKey = this.getOrderIdKey ();
        request[idKey] = id;
        let method = this.options['cancelOrderMethod'];
        let response = await this[method] (this.extend (request, params));
        if (id in this.orders) {
            this.orders[id]['status'] = 'canceled';
        }
        return response;
    }

    parseOrderStatus (status) {
        let statuses = {
            '0': 'open',
            '1': 'closed',
            '2': 'canceled',
            '3': 'canceled', // or partially-filled and still open? https://github.com/ccxt/ccxt/issues/1594
        };
        if (status in statuses) {
            return statuses[status];
        }
        return status;
    }

    parseOrder (order, market = undefined) {
        let id = order['id'].toString ();
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let timestamp = parseInt (order['timestamp_created']) * 1000;
        let symbol = undefined;
        if (market === undefined) {
            market = this.markets_by_id[order['pair']];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
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
        if (amount !== undefined) {
            if (remaining !== undefined) {
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
        let request = {};
        let idKey = this.getOrderIdKey ();
        request[idKey] = parseInt (id);
        let method = this.options['fetchOrderMethod'];
        let response = await this[method] (this.extend (request, params));
        id = id.toString ();
        let newOrder = this.parseOrder (this.extend ({ 'id': id }, response['return'][id]));
        let oldOrder = (id in this.orders) ? this.orders[id] : {};
        this.orders[id] = this.extend (oldOrder, newOrder);
        return this.orders[id];
    }

    updateCachedOrders (openOrders, symbol) {
        // update local cache with open orders
        // this will add unseen orders and overwrite existing ones
        for (let j = 0; j < openOrders.length; j++) {
            const id = openOrders[j]['id'];
            this.orders[id] = openOrders[j];
        }
        let openOrdersIndexedById = this.indexBy (openOrders, 'id');
        let cachedOrderIds = Object.keys (this.orders);
        for (let k = 0; k < cachedOrderIds.length; k++) {
            // match each cached order to an order in the open orders array
            // possible reasons why a cached order may be missing in the open orders array:
            // - order was closed or canceled -> update cache
            // - symbol mismatch (e.g. cached BTC/USDT, fetched ETH/USDT) -> skip
            let cachedOrderId = cachedOrderIds[k];
            let cachedOrder = this.orders[cachedOrderId];
            if (!(cachedOrderId in openOrdersIndexedById)) {
                // cached order is not in open orders array
                // if we fetched orders by symbol and it doesn't match the cached order -> won't update the cached order
                if (symbol !== undefined && symbol !== cachedOrder['symbol'])
                    continue;
                // cached order is absent from the list of open orders -> mark the cached order as closed
                if (cachedOrder['status'] === 'open') {
                    cachedOrder = this.extend (cachedOrder, {
                        'status': 'closed', // likewise it might have been canceled externally (unnoticed by "us")
                        'cost': undefined,
                        'filled': cachedOrder['amount'],
                        'remaining': 0.0,
                    });
                    if (cachedOrder['cost'] === undefined) {
                        if (cachedOrder['filled'] !== undefined) {
                            cachedOrder['cost'] = cachedOrder['filled'] * cachedOrder['price'];
                        }
                    }
                    this.orders[cachedOrderId] = cachedOrder;
                }
            }
        }
        return this.toArray (this.orders);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if ('fetchOrdersRequiresSymbol' in this.options)
            if (this.options['fetchOrdersRequiresSymbol'])
                if (symbol === undefined)
                    throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol !== undefined) {
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
        // some derived classes use camelcase notation for request fields
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
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['count'] = parseInt (limit);
        }
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        let method = this.options['fetchMyTradesMethod'];
        let response = await this[method] (this.extend (request, params));
        let trades = [];
        if ('return' in response) {
            trades = response['return'];
        }
        return this.parseTrades (trades, market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'coinName': currency['id'],
            'amount': parseFloat (amount),
            'address': address,
        };
        // no docs on the tag, yet...
        if (tag !== undefined) {
            throw new ExchangeError (this.id + ' withdraw() does not support the tag argument yet due to a lack of docs on withdrawing with tag/memo on behalf of the exchange.');
        }
        let response = await this.privatePostWithdrawCoin (this.extend (request, params));
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

    getPrivatePath (path, params) {
        return '';
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            url += this.getPrivatePath (path, params);
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

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (!this.isJsonEncodedObject (body))
            return; // fallback to default error handler
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
                const exact = this.exceptions['exact'];
                if (code in exact) {
                    throw new exact[code] (feedback);
                }
                const broad = this.exceptions['broad'];
                const broadKey = this.findBroadlyMatchedKey (broad, message);
                if (broadKey !== undefined) {
                    throw new broad[broadKey] (feedback);
                }
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
