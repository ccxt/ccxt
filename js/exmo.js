'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, ExchangeError, ExchangeNotAvailable, OrderNotFound, AuthenticationError, InsufficientFunds, InvalidOrder, InvalidNonce } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class exmo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'exmo',
            'name': 'EXMO',
            'countries': [ 'ES', 'RU' ], // Spain, Russia
            'rateLimit': 350, // once every 350 ms ≈ 180 requests per minute ≈ 3 requests per second
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchClosedOrders': 'emulated',
                'fetchDepositAddress': true,
                'fetchOpenOrders': true,
                'fetchOrder': 'emulated',
                'fetchOrders': 'emulated',
                'fetchOrderTrades': true,
                'fetchOrderBooks': true,
                'fetchMyTrades': true,
                'fetchTickers': true,
                'withdraw': true,
                'fetchTradingFees': true,
                'fetchFundingFees': true,
                'fetchCurrencies': true,
                'fetchTransactions': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg',
                'api': {
                    'public': 'https://api.exmo.com',
                    'private': 'https://api.exmo.com',
                    'web': 'https://exmo.me',
                },
                'www': 'https://exmo.me',
                'referral': 'https://exmo.me/?ref=131685',
                'doc': [
                    'https://exmo.me/en/api_doc?ref=131685',
                    'https://github.com/exmo-dev/exmo_api_lib/tree/master/nodejs',
                ],
                'fees': 'https://exmo.com/en/docs/fees',
            },
            'api': {
                'web': {
                    'get': [
                        'ctrl/feesAndLimits',
                        'en/docs/fees',
                    ],
                },
                'public': {
                    'get': [
                        'currency',
                        'order_book',
                        'pair_settings',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'user_info',
                        'order_create',
                        'order_cancel',
                        'user_open_orders',
                        'user_trades',
                        'user_cancelled_orders',
                        'order_trades',
                        'required_amount',
                        'deposit_address',
                        'withdraw_crypt',
                        'withdraw_get_txid',
                        'excode_create',
                        'excode_load',
                        'wallet_history',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false, // fixed funding fees for crypto, see fetchFundingFees below
                },
            },
            'exceptions': {
                '40005': AuthenticationError, // Authorization error, incorrect signature
                '40009': InvalidNonce, //
                '40015': ExchangeError, // API function do not exist
                '40016': ExchangeNotAvailable, // Maintenance work in progress
                '40017': AuthenticationError, // Wrong API Key
                '50052': InsufficientFunds,
                '50054': InsufficientFunds,
                '50304': OrderNotFound, // "Order was not found '123456789'" (fetching order trades for an order that does not have trades yet)
                '50173': OrderNotFound, // "Order with id X was not found." (cancelling non-existent, closed and cancelled order)
                '50319': InvalidOrder, // Price by order is less than permissible minimum for this pair
                '50321': InvalidOrder, // Price by order is more than permissible maximum for this pair
            },
        });
    }

    async fetchTradingFees (params = {}) {
        let response = await this.webGetEnDocsFees (params);
        let parts = response.split ('<td class="th_fees_2" colspan="2">');
        let numParts = parts.length;
        if (numParts !== 2) {
            throw new ExchangeError (this.id + ' fetchTradingFees format has changed');
        }
        const rest = parts[1];
        parts = rest.split ('</td>');
        numParts = parts.length;
        if (numParts < 2) {
            throw new ExchangeError (this.id + ' fetchTradingFees format has changed');
        }
        const fee = parseFloat (parts[0].replace ('%', '')) * 0.01;
        let taker = fee;
        let maker = fee;
        return {
            'info': response,
            'maker': maker,
            'taker': taker,
        };
    }

    parseFixedFloatValue (input) {
        if ((input === undefined) || (input === '-')) {
            return undefined;
        }
        let isPercentage = (input.indexOf ('%') >= 0);
        let parts = input.split (' ');
        let value = parts[0].replace ('%', '');
        let result = parseFloat (value);
        if ((result > 0) && isPercentage) {
            throw new ExchangeError (this.id + ' parseFixedFloatValue detected an unsupported non-zero percentage-based fee ' + input);
        }
        return result;
    }

    async fetchFundingFees (params = {}) {
        const response = await this.webGetCtrlFeesAndLimits (params);
        //
        //     { success:    1,
        //          ctlr:   "feesAndLimits",
        //         error:   "",
        //          data: { limits: [ {  pair: "BTC/USD",
        //                              min_q: "0.001",
        //                              max_q: "100",
        //                              min_p: "1",
        //                              max_p: "30000",
        //                              min_a: "1",
        //                              max_a: "200000"   },
        //                            {  pair: "KICK/ETH",
        //                              min_q: "100",
        //                              max_q: "200000",
        //                              min_p: "0.000001",
        //                              max_p: "1",
        //                              min_a: "0.0001",
        //                              max_a: "100"       }    ],
        //                    fees: [ { group:   "crypto",
        //                              title:   "Криптовалюта",
        //                              items: [ { prov: "BTC", dep: "0%", wd: "0.0005 BTC" },
        //                                       { prov: "LTC", dep: "0%", wd: "0.01 LTC" },
        //                                       { prov: "DOGE", dep: "0%", wd: "1 Doge" },
        //                                       { prov: "DASH", dep: "0%", wd: "0.01 DASH" },
        //                                       { prov: "ETH", dep: "0%", wd: "0.01 ETH" },
        //                                       { prov: "WAVES", dep: "0%", wd: "0.001 WAVES" },
        //                                       { prov: "ZEC", dep: "0%", wd: "0.001 ZEC" },
        //                                       { prov: "USDT", dep: "5 USDT", wd: "5 USDT" },
        //                                       { prov: "NEO", dep: "0%", wd: "0%" },
        //                                       { prov: "GAS", dep: "0%", wd: "0%" },
        //                                       { prov: "ZRX", dep: "0%", wd: "1 ZRX" },
        //                                       { prov: "GNT", dep: "0%", wd: "1 GNT" } ] },
        //                            { group:   "usd",
        //                              title:   "USD",
        //                              items: [ { prov: "AdvCash", dep: "1%", wd: "3%" },
        //                                       { prov: "Perfect Money", dep: "-", wd: "1%" },
        //                                       { prov: "Neteller", dep: "3.5% + 0.29 USD, wd: "1.95%" },
        //                                       { prov: "Wire Transfer", dep: "0%", wd: "1% + 20 USD" },
        //                                       { prov: "CryptoCapital", dep: "0.5%", wd: "1.9%" },
        //                                       { prov: "Skrill", dep: "3.5% + 0.36 USD", wd: "3%" },
        //                                       { prov: "Payeer", dep: "1.95%", wd: "3.95%" },
        //                                       { prov: "Visa/MasterCard (Simplex)", dep: "6%", wd: "-" } ] },
        //                            { group:   "eur",
        //                              title:   "EUR",
        //                              items: [ { prov: "CryptoCapital", dep: "0%", wd: "-" },
        //                                       { prov: "SEPA", dep: "25 EUR", wd: "1%" },
        //                                       { prov: "Perfect Money", dep: "-", wd: "1.95%" },
        //                                       { prov: "Neteller", dep: "3.5%+0.25 EUR", wd: "1.95%" },
        //                                       { prov: "Payeer", dep: "2%", wd: "1%" },
        //                                       { prov: "AdvCash", dep: "1%", wd: "3%" },
        //                                       { prov: "Skrill", dep: "3.5% + 0.29 EUR", wd: "3%" },
        //                                       { prov: "Rapid Transfer", dep: "1.5% + 0.29 EUR", wd: "-" },
        //                                       { prov: "MisterTango SEPA", dep: "5 EUR", wd: "1%" },
        //                                       { prov: "Visa/MasterCard (Simplex)", dep: "6%", wd: "-" } ] },
        //                            { group:   "rub",
        //                              title:   "RUB",
        //                              items: [ { prov: "Payeer", dep: "2.45%", wd: "5.95%" },
        //                                       { prov: "Yandex Money", dep: "4.5%", wd: "-" },
        //                                       { prov: "AdvCash", dep: "1.45%", wd: "5.45%" },
        //                                       { prov: "Qiwi", dep: "4.95%", wd: "-" },
        //                                       { prov: "Visa/Mastercard", dep: "-", wd: "6.95% + 100 RUB"  } ] },
        //                            { group:   "pln",
        //                              title:   "PLN",
        //                              items: [ { prov: "Neteller", dep: "3.5% + 4 PLN", wd: "-" },
        //                                       { prov: "Rapid Transfer", dep: "1.5% + 1.21 PLN", wd: "-" },
        //                                       { prov: "CryptoCapital", dep: "20 PLN", wd: "-" },
        //                                       { prov: "Skrill", dep: "3.5% + 1.21 PLN", wd: "-" },
        //                                       { prov: "Visa/MasterCard (Simplex)", dep: "6%", wd: "-" } ] },
        //                            { group:   "uah",
        //                              title:   "UAH",
        //                              items: [ { prov: "AdvCash", dep: "1%", wd: "6%" },
        //                                       { prov: "Visa/MasterCard", dep: "2.6%", wd: "8% + 30 UAH" } ] } ] } }
        //
        //
        // the code below assumes all non-zero crypto fees are fixed (for now)
        const withdraw = {};
        const deposit = {};
        const groups = this.safeValue (response['data'], 'fees');
        const groupsByGroup = this.indexBy (groups, 'group');
        const items = groupsByGroup['crypto']['items'];
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let code = this.commonCurrencyCode (this.safeString (item, 'prov'));
            let withdrawalFee = this.safeString (item, 'wd');
            let depositFee = this.safeString (item, 'dep');
            if (withdrawalFee !== undefined) {
                if (withdrawalFee.length > 0) {
                    withdraw[code] = this.parseFixedFloatValue (withdrawalFee);
                }
            }
            if (depositFee !== undefined) {
                if (depositFee.length > 0) {
                    deposit[code] = this.parseFixedFloatValue (depositFee);
                }
            }
        }
        // sets fiat fees to undefined
        const fiatGroups = this.toArray (this.omit (groupsByGroup, 'crypto'));
        for (let i = 0; i < fiatGroups.length; i++) {
            const code = this.commonCurrencyCode (this.safeString (fiatGroups[i], 'title'));
            withdraw[code] = undefined;
            deposit[code] = undefined;
        }
        const result = {
            'info': response,
            'withdraw': withdraw,
            'deposit': deposit,
        };
        // cache them for later use
        this.options['fundingFees'] = result;
        return result;
    }

    async fetchCurrencies (params = {}) {
        let fees = await this.fetchFundingFees (params);
        // todo redesign the 'fee' property in currencies
        let ids = Object.keys (fees['withdraw']);
        let limitsByMarketId = this.indexBy (fees['info']['data']['limits'], 'pair');
        let marketIds = Object.keys (limitsByMarketId);
        let minAmounts = {};
        let minPrices = {};
        let minCosts = {};
        let maxAmounts = {};
        let maxPrices = {};
        let maxCosts = {};
        for (let i = 0; i < marketIds.length; i++) {
            let marketId = marketIds[i];
            let limit = limitsByMarketId[marketId];
            let [ baseId, quoteId ] = marketId.split ('/');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let maxAmount = this.safeFloat (limit, 'max_q');
            let maxPrice = this.safeFloat (limit, 'max_p');
            let maxCost = this.safeFloat (limit, 'max_a');
            let minAmount = this.safeFloat (limit, 'min_q');
            let minPrice = this.safeFloat (limit, 'min_p');
            let minCost = this.safeFloat (limit, 'min_a');
            minAmounts[base] = Math.min (this.safeFloat (minAmounts, base, minAmount), minAmount);
            maxAmounts[base] = Math.max (this.safeFloat (maxAmounts, base, maxAmount), maxAmount);
            minPrices[quote] = Math.min (this.safeFloat (minPrices, quote, minPrice), minPrice);
            minCosts[quote] = Math.min (this.safeFloat (minCosts, quote, minCost), minCost);
            maxPrices[quote] = Math.max (this.safeFloat (maxPrices, quote, maxPrice), maxPrice);
            maxCosts[quote] = Math.max (this.safeFloat (maxCosts, quote, maxCost), maxCost);
        }
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let code = this.commonCurrencyCode (id);
            let fee = this.safeValue (fees['withdraw'], code);
            let active = true;
            result[code] = {
                'id': id,
                'code': code,
                'name': code,
                'active': active,
                'fee': fee,
                'precision': 8,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (minAmounts, code),
                        'max': this.safeFloat (maxAmounts, code),
                    },
                    'price': {
                        'min': this.safeFloat (minPrices, code),
                        'max': this.safeFloat (maxPrices, code),
                    },
                    'cost': {
                        'min': this.safeFloat (minCosts, code),
                        'max': this.safeFloat (maxCosts, code),
                    },
                },
                'info': id,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        let fees = await this.fetchTradingFees ();
        let markets = await this.publicGetPairSettings ();
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let market = markets[id];
            let symbol = id.replace ('_', '/');
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': true,
                'taker': fees['taker'],
                'maker': fees['maker'],
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'min_quantity'),
                        'max': this.safeFloat (market, 'max_quantity'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'min_price'),
                        'max': this.safeFloat (market, 'max_price'),
                    },
                    'cost': {
                        'min': this.safeFloat (market, 'min_amount'),
                        'max': this.safeFloat (market, 'max_amount'),
                    },
                },
                'precision': {
                    'amount': 8,
                    'price': 8,
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostUserInfo (params);
        let result = { 'info': response };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let account = this.account ();
            if (currency in response['balances'])
                account['free'] = parseFloat (response['balances'][currency]);
            if (currency in response['reserved'])
                account['used'] = parseFloat (response['reserved'][currency]);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = this.extend ({
            'pair': market['id'],
        }, params);
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.publicGetOrderBook (request);
        let result = response[market['id']];
        return this.parseOrderBook (result, undefined, 'bid', 'ask');
    }

    async fetchOrderBooks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = undefined;
        if (symbols === undefined) {
            ids = this.ids.join (',');
            // max URL length is 2083 symbols, including http schema, hostname, tld, etc...
            if (ids.length > 2048) {
                let numIds = this.ids.length;
                throw new ExchangeError (this.id + ' has ' + numIds.toString () + ' symbols exceeding max URL length, you are required to specify a list of symbols in the first argument to fetchOrderBooks');
            }
        } else {
            ids = this.marketIds (symbols);
            ids = ids.join (',');
        }
        let response = await this.publicGetOrderBook (this.extend ({
            'pair': ids,
        }, params));
        let result = {};
        ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let symbol = this.findSymbol (id);
            result[symbol] = this.parseOrderBook (response[id], undefined, 'bid', 'ask');
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['updated'] * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        const last = this.safeFloat (ticker, 'last_trade');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy_price'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell_price'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'avg'),
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'vol_curr'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTicker (params);
        let result = {};
        let ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = response[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTicker (params);
        let market = this.market (symbol);
        return this.parseTicker (response[market['id']], market);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['date'] * 1000;
        let fee = undefined;
        let symbol = undefined;
        let id = this.safeString (trade, 'trade_id');
        let orderId = this.safeString (trade, 'order_id');
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'quantity');
        let cost = this.safeFloat (trade, 'amount');
        let side = this.safeString (trade, 'type');
        let type = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            if (market['taker'] !== market['maker']) {
                throw new ExchangeError (this.id + ' parseTrade can not deduce proper fee costs, taker and maker fees now differ');
            }
            if ((side === 'buy') && (amount !== undefined)) {
                fee = {
                    'currency': market['base'],
                    'cost': amount * market['taker'],
                    'rate': market['taker'],
                };
            } else if ((side === 'sell') && (cost !== undefined)) {
                fee = {
                    'currency': market['quote'],
                    'cost': cost * market['taker'],
                    'rate': market['taker'],
                };
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTrades (response[market['id']], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // their docs does not mention it, but if you don't supply a symbol
        // their API will return an empty response as if you don't have any trades
        // therefore we make it required here as calling it without a symbol is useless
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this.privatePostUserTrades (this.extend (request, params));
        if (market !== undefined)
            response = response[market['id']];
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let prefix = (type === 'market') ? (type + '_') : '';
        let market = this.market (symbol);
        if ((type === 'market') && (price === undefined)) {
            price = 0;
        }
        let request = {
            'pair': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'type': prefix + side,
            'price': this.priceToPrecision (symbol, price),
        };
        let response = await this.privatePostOrderCreate (this.extend (request, params));
        let id = this.safeString (response, 'order_id');
        let timestamp = this.milliseconds ();
        amount = parseFloat (amount);
        price = parseFloat (price);
        let status = 'open';
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
            'cost': price * amount,
            'amount': amount,
            'remaining': amount,
            'filled': 0.0,
            'fee': undefined,
            'trades': undefined,
        };
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderCancel ({ 'order_id': id });
        if (id in this.orders)
            this.orders[id]['status'] = 'canceled';
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        try {
            let response = await this.privatePostOrderTrades ({
                'order_id': id.toString (),
            });
            return this.parseOrder (response);
        } catch (e) {
            if (e instanceof OrderNotFound) {
                if (id in this.orders)
                    return this.orders[id];
            }
        }
        throw new OrderNotFound (this.id + ' fetchOrder order id ' + id.toString () + ' not found in cache.');
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        if (symbol !== undefined)
            market = this.market (symbol);
        let response = await this.privatePostOrderTrades (this.extend ({
            'order_id': id.toString (),
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    updateCachedOrders (openOrders, symbol) {
        // update local cache with open orders
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
            let id = cachedOrderIds[k];
            let order = this.orders[id];
            if (!(id in openOrdersIndexedById)) {
                // cached order is not in open orders array
                // if we fetched orders by symbol and it doesn't match the cached order -> won't update the cached order
                if (symbol !== undefined && symbol !== order['symbol'])
                    continue;
                // order is cached but not present in the list of open orders -> mark the cached order as closed
                if (order['status'] === 'open') {
                    order = this.extend (order, {
                        'status': 'closed', // likewise it might have been canceled externally (unnoticed by "us")
                        'cost': undefined,
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                    if (order['cost'] === undefined) {
                        if (order['filled'] !== undefined)
                            order['cost'] = order['filled'] * order['price'];
                    }
                    this.orders[id] = order;
                }
            }
        }
        return this.toArray (this.orders);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostUserOpenOrders (params);
        let marketIds = Object.keys (response);
        let orders = [];
        for (let i = 0; i < marketIds.length; i++) {
            let marketId = marketIds[i];
            let market = undefined;
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
            let parsedOrders = this.parseOrders (response[marketId], market);
            orders = this.arrayConcat (orders, parsedOrders);
        }
        this.updateCachedOrders (orders, symbol);
        return this.filterBySymbolSinceLimit (this.toArray (this.orders), symbol, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.fetchOrders (symbol, since, limit, params);
        let orders = this.filterBy (this.orders, 'status', 'open');
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.fetchOrders (symbol, since, limit, params);
        let orders = this.filterBy (this.orders, 'status', 'closed');
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    parseOrder (order, market = undefined) {
        let id = this.safeString (order, 'order_id');
        let timestamp = this.safeInteger (order, 'created');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        let symbol = undefined;
        let side = this.safeString (order, 'type');
        if (market === undefined) {
            let marketId = undefined;
            if ('pair' in order) {
                marketId = order['pair'];
            } else if (('in_currency' in order) && ('out_currency' in order)) {
                if (side === 'buy')
                    marketId = order['in_currency'] + '_' + order['out_currency'];
                else
                    marketId = order['out_currency'] + '_' + order['in_currency'];
            }
            if ((marketId !== undefined) && (marketId in this.markets_by_id))
                market = this.markets_by_id[marketId];
        }
        let amount = this.safeFloat (order, 'quantity');
        if (amount === undefined) {
            let amountField = (side === 'buy') ? 'in_amount' : 'out_amount';
            amount = this.safeFloat (order, amountField);
        }
        let price = this.safeFloat (order, 'price');
        let cost = this.safeFloat (order, 'amount');
        let filled = 0.0;
        let trades = [];
        let transactions = this.safeValue (order, 'trades');
        let feeCost = undefined;
        if (transactions !== undefined) {
            if (Array.isArray (transactions)) {
                for (let i = 0; i < transactions.length; i++) {
                    let trade = this.parseTrade (transactions[i], market);
                    if (id === undefined) {
                        id = trade['order'];
                    }
                    if (timestamp === undefined) {
                        timestamp = trade['timestamp'];
                    }
                    if (timestamp > trade['timestamp']) {
                        timestamp = trade['timestamp'];
                    }
                    filled += trade['amount'];
                    if (feeCost === undefined) {
                        feeCost = 0.0;
                    }
                    feeCost += trade['fee']['cost'];
                    if (cost === undefined) {
                        cost = 0.0;
                    }
                    cost += trade['cost'];
                    trades.push (trade);
                }
            }
        }
        let remaining = undefined;
        if (amount !== undefined) {
            remaining = amount - filled;
        }
        let status = this.safeString (order, 'status'); // in case we need to redefine it for canceled orders
        if (filled >= amount) {
            status = 'closed';
        } else {
            status = 'open';
        }
        if (market === undefined) {
            market = this.getMarketFromTrades (trades);
        }
        let feeCurrency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        }
        if (cost === undefined) {
            if (price !== undefined)
                cost = price * filled;
        } else if (price === undefined) {
            if (filled > 0)
                price = cost / filled;
        }
        let fee = {
            'cost': feeCost,
            'currency': feeCurrency,
        };
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
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

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostDepositAddress (params);
        let depositAddress = this.safeString (response, code);
        let address = undefined;
        let tag = undefined;
        if (depositAddress) {
            let addressAndTag = depositAddress.split (',');
            address = addressAndTag[0];
            let numParts = addressAndTag.length;
            if (numParts > 1) {
                tag = addressAndTag[1];
            }
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    getMarketFromTrades (trades) {
        let tradesBySymbol = this.indexBy (trades, 'pair');
        let symbols = Object.keys (tradesBySymbol);
        let numSymbols = symbols.length;
        if (numSymbols === 1)
            return this.markets[symbols[0]];
        return undefined;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        let key = 'quote';
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'amount': amount,
            'currency': currency['id'],
            'address': address,
        };
        if (tag !== undefined) {
            request['invoice'] = tag;
        }
        let result = await this.privatePostWithdrawCrypt (this.extend (request, params));
        return {
            'info': result,
            'id': result['task_id'],
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'transferred': 'ok',
            'paid': 'ok',
            'pending': 'pending',
            'processing': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchTransactions
        //
        //          {
        //            "dt": 1461841192,
        //            "type": "deposit",
        //            "curr": "RUB",
        //            "status": "processing",
        //            "provider": "Qiwi (LA) [12345]",
        //            "amount": "1",
        //            "account": "",
        //            "txid": "ec46f784ad976fd7f7539089d1a129fe46...",
        //          }
        //
        let timestamp = this.safeFloat (transaction, 'dt');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
        let amount = this.safeFloat (transaction, 'amount');
        if (amount !== undefined) {
            amount = Math.abs (amount);
        }
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const txid = this.safeString (transaction, 'txid');
        const type = this.safeString (transaction, 'type');
        let code = this.safeString (transaction, 'curr');
        if (currency === undefined) {
            currency = this.safeValue (this.currencies_by_id, code);
        }
        if (currency !== undefined) {
            code = currency['code'];
        } else {
            code = this.commonCurrencyCode (code);
        }
        let address = this.safeString (transaction, 'account');
        if (address !== undefined) {
            const parts = address.split (':');
            let numParts = parts.length;
            if (numParts === 2) {
                address = parts[1];
            }
        }
        let fee = undefined;
        // fixed funding fees only (for now)
        if (!this.fees['funding']['percentage']) {
            let key = (type === 'withdrawal') ? 'withdraw' : 'deposit';
            let feeCost = this.safeFloat (this.options['fundingFees'][key], code);
            // users don't pay for cashbacks, no fees for that
            const provider = this.safeString (transaction, 'provider');
            if (provider === 'cashback') {
                feeCost = 0;
            }
            if (feeCost !== undefined) {
                // withdrawal amount includes the fee
                if (type === 'withdrawal') {
                    amount = amount - feeCost;
                }
                fee = {
                    'cost': feeCost,
                    'currency': code,
                    'rate': undefined,
                };
            }
        }
        return {
            'info': transaction,
            'id': undefined,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined, // refix it properly
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['date'] = parseInt (since / 1000);
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        let response = await this.privatePostWalletHistory (this.extend (request, params));
        //
        //     {
        //       "result": true,
        //       "error": "",
        //       "begin": "1493942400",
        //       "end": "1494028800",
        //       "history": [
        //          {
        //            "dt": 1461841192,
        //            "type": "deposit",
        //            "curr": "RUB",
        //            "status": "processing",
        //            "provider": "Qiwi (LA) [12345]",
        //            "amount": "1",
        //            "account": "",
        //            "txid": "ec46f784ad976fd7f7539089d1a129fe46...",
        //          },
        //          {
        //            "dt": 1463414785,
        //            "type": "withdrawal",
        //            "curr": "USD",
        //            "status": "paid",
        //            "provider": "EXCODE",
        //            "amount": "-1",
        //            "account": "EX-CODE_19371_USDda...",
        //            "txid": "",
        //          },
        //       ],
        //     }
        //
        return this.parseTransactions (response['history'], currency, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        if (api !== 'web') {
            url += this.version + '/';
        }
        url += path;
        if ((api === 'public') || (api === 'web')) {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    nonce () {
        return this.milliseconds ();
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (response === undefined)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            if ('result' in response) {
                //
                //     {"result":false,"error":"Error 50052: Insufficient funds"}
                //
                let success = this.safeValue (response, 'result', false);
                if (typeof success === 'string') {
                    if ((success === 'true') || (success === '1'))
                        success = true;
                    else
                        success = false;
                }
                if (!success) {
                    let code = undefined;
                    const message = this.safeString (response, 'error');
                    const errorParts = message.split (':');
                    let numParts = errorParts.length;
                    if (numParts > 1) {
                        const errorSubParts = errorParts[0].split (' ');
                        let numSubParts = errorSubParts.length;
                        code = (numSubParts > 1) ? errorSubParts[1] : errorSubParts[0];
                    }
                    const feedback = this.id + ' ' + this.json (response);
                    const exceptions = this.exceptions;
                    if (code in exceptions) {
                        throw new exceptions[code] (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
    }
};
