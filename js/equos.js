'use strict';

//  ---------------------------------------------------------------------------
const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, BadRequest, BadSymbol, OrderNotFound } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');
const string = require('./base/functions/string');
const { safeFloat, safeInteger, safeString } = require('./base/functions/type');
//  ---------------------------------------------------------------------------

module.exports = class equos extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'equos',
            'name': 'Equos',
            'countries': ['US', 'SG'],
            'rateLimit': 10,
            'certified': false,
            'has': {
                'CORS': false,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTradingLimits': false,
                'fetchTradingFees': true,
                'fetchFundingLimits': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
                'fetchBalance': true,
                'fetchAccounts': false,
                'createOrder': true,
                'cancelOrder': true,
                'editOrder': 'emulated',
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchAllOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchCancelledOrders': true,
                'fetchMyTrades': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': true,
                'withdraw': true,
                'fetchLedger': true,
            },
            'timeframes': {
                '1m': 1,
                '5m': 2,
                '15m': 3,
                '1h': 4,
                '6h': 5,
                '1d': 6,
                '7d': 7,
            },
            'urls': {
                'logo': 'https://equos.io/assets/img/logo.svg',
                'api': {
                    'public': 'https://equos.io/api/',
                    'private': 'https://equos.io/api/',
                },
                'test': {
                    'public': 'https://testnet.equos.io/api/',
                    'private': 'https://testnet.equos.io/api/',
                },
                'www': 'https://equos.io/',
                'doc': [
                    'https://developer.equos.io/',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'getInstrumentPairs',
                        'getInstruments',
                        'getChart',
                        'getOrderBook',
                        'getTradeHistory',
                        'getExchangeInfo',
                    ],
                },
                'private': {
                    'post': [
                        'getPositions',
                        'order',
                        'getOrderStatus',
                        'getOrders',
                        'cancelOrder',
                        'cancelReplaceOrder',
                        'getDepositAddresses',
                        'getDepositHistory',
                        'getWithdrawRequests',
                        'sendWithdrawRequest',
                        'getUserHistory',
                        'getOrderHistory',
                        'userTrades',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
                'login': false,
                'password': false,
                'twofa': false, // 2-factor authentication (one-time password key)
                'privateKey': false, // a "0x"-prefixed hexstring private key for a wallet
                'walletAddress': false, // the wallet address "0x"-prefixed hexstring
                'token': false, // reserved for HTTP auth in some cases
            },
        });
    }

    async fetchMarkets (params = {}) {
        // we need currency to parse market
        if (this.currencies_by_id === undefined) {
            await this.fetchCurrencies ();
        }
        const response = await this.publicGetGetInstrumentPairs (params);
        const markets = [];
        const results = this.safeValue (response, 'instrumentPairs', []);
        for (let i = 0; i < results.length; i++) {
            const marketResult = this.parseMarket (results[i]);
            markets.push (marketResult);
        }
        return markets;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetGetInstruments (params);
        const currencies = {};
        const results = this.safeValue (response, 'instruments', []);
        for (let i = 0; i < results.length; i++) {
            const currency = this.parseCurrency (results[i]);
            const code = currency['code'];

            currencies[code] = currency;
        }
        // we need this to parse Markets
        this.currencies = currencies;
        this.currencies_by_id = this.indexBy (currencies, 'id');
        return currencies;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.extend ({
            'pairId': market['id'],
            'timespan': 1,
        }, params);
        const response = await this.publicGetGetChart (this.extend (request, params));
        const charts = this.safeValue (response, 'chart', []);
        const chart = this.safeValue (charts, 0);
        // let volume = undefined;
        if (chart !== undefined) {
            const ticker = this.parseTicker (chart, market);
            return {
                "symbol": ticker["symbol"],
                "info": ticker["info"],
                "timestamp": undefined,
                "datetime": undefined,
                "high": undefined,
                "low": undefined,
                "bid": undefined,
                "bidVolume": undefined,
                "ask": undefined,
                "askVolume": undefined,
                "vwap": undefined,
                "open": undefined,
                "close": undefined,
                "last": ticker["last"],
                "previousClose": undefined,
                "change": undefined,
                "percentage": undefined,
                "average": undefined,
                "baseVolume": undefined,
                "quoteVolume": undefined,
            }
        } else {
            return this.parseTicker (undefined, market);
        }
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (this.timeframes[timeframe] === undefined) {
            throw new BadRequest (this.id + ': timeframe ' + timeframe + ' is not supported'); // eslint-disable-line quotes
        }
        const request = this.extend ({
            'pairId': market['id'],
            'timespan': this.timeframes[timeframe],
        }, params);
        const response = await this.publicGetGetChart (this.extend (request, params));
        const results = this.safeValue (response, 'chart', []);
        return this.parseOHLCVs (results, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = this.extend ({
            'pairId': market['id'],
        }, params);
        // apply limit though does not work with API
        if (limit !== undefined) {
            request = this.extend ({ 'limit': limit }, request);
        }
        const response = await this.publicGetGetOrderBook (this.extend (request, params));
        // we need to tranform response here as parseOrderBook - parseBidAsk does not have market param
        if (response !== undefined) {
            const orderBook = {
                'bids': [],
                'asks': [],
            };
            const bidData = this.safeValue (response, 'bids');
            const askData = this.safeValue (response, 'asks');
            if (bidData !== undefined) {
                for (let i = 0; i < bidData.length; i++) {
                    if (bidData[i] !== undefined) {
                        const price = this.convertFromScale (bidData[i][0], market['precision']['price']);
                        const amount = this.convertFromScale (bidData[i][1], market['precision']['amount']);
                        if (price > 0 && amount > 0) {
                            orderBook['bids'].push ({
                                'price': price,
                                'amount': amount,
                            });
                        }
                    }
                }
            }
            if (askData !== undefined) {
                for (let i = 0; i < askData.length; i++) {
                    if (askData[i] !== undefined) {
                        const price = this.convertFromScale (askData[i][0], market['precision']['price']);
                        const amount = this.convertFromScale (askData[i][1], market['precision']['amount']);
                        if (price > 0 && amount > 0) {
                            orderBook['asks'].push ({
                                'price': price,
                                'amount': amount,
                            });
                        }
                    }
                }
            }
            return this.parseOrderBook (orderBook, undefined, 'bids', 'asks', 'price', 'amount');
        }
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = this.extend ({
            'pairId': market['id'],
        }, params);
        // apply limit though does not work with API
        if (limit !== undefined) {
            request = this.extend ({ 'limit': limit }, request);
        }
        const response = await this.publicGetGetTradeHistory (request);
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit, params);
    }

    async fetchBalance (params = {}) {
        const response = await this.privatePostGetPositions (params);
        const positions = this.safeValue (response, 'positions', []);
        const balance = {};
        balance['info'] = response;
        balance['free'] = {};
        balance['used'] = {};
        balance['total'] = {};
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            if (position['assetType'] === 'ASSET') {
                const symbol = position['symbol'];
                const quantity = position['quantity'];
                const availableQuantity = position['availableQuantity'];
                const scale = position['quantity_scale'];
                const free = this.convertFromScale (availableQuantity, scale);
                const total = this.convertFromScale (quantity, scale);
                const used = parseFloat (this.decimalToPrecision (total - free, ROUND, scale));
                if (!this.safeValue (balance, symbol)) {
                    balance[symbol] = this.account ();
                }
                balance[symbol]['free'] = free;
                balance[symbol]['used'] = used;
                balance[symbol]['total'] = this.sum (free, used);
            }
        }
        return this.parseBalance (balance);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (type === undefined || side === undefined || amount === undefined) {
            throw new ArgumentsRequired (this.id + ': Order does not have enough arguments');
        }
        const request = this.createOrderRequest (market, type, side, amount, price, params);
        const order = await this.privatePostOrder (request);
        const orderDetails = {
            'info': order,
            'id': this.safeInteger (order, 'id'),
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': this.safeString (order, 'status'),
            'fee': undefined,
        };

        // returns clOrderId but not orderId
        // HACK: to call twice, will not get merged by kroitor it seems
        // TODO: Remove before making a pull request
        for (let i = 0; i < 10; i++) {
            try {
                const fetchedOrders = await this.fetchOrders(symbol);
                const fetchedOrderDetails = fetchedOrders.find(o => o['info']['clOrdId'] === order['clOrdId']);

                if (fetchedOrderDetails !== undefined) {
                    return fetchedOrderDetails;
                }
            } catch (err) {}
        }

        throw new OrderNotFound("clOrdId %o cannot be found.", order['clOrdId']);
    }

    createOrderRequest (market, type, side, amount, price = undefined, params = {}) {
        if (price === undefined) {
            price = 0;
        }
        const amount_scale = this.getScale (amount);
        const price_scale = this.getScale (price);
        let ordType = 1;
        let requestSide = 1;
        if (type === 'limit') {
            ordType = 2;
        }
        if (side === 'sell') {
            requestSide = 2;
        }
        const request = {
            'id': 0,
            'instrumentId': market['id'],
            'symbol': market['symbol'],
            'side': requestSide,
            'ordType': ordType,
            'price': this.convertToScale (price, price_scale),
            'price_scale': price_scale,
            'quantity': this.convertToScale (amount, amount_scale),
            'quantity_scale': amount_scale,
        };
        return this.extend (request, params);
    }

    createEditOrderRequest (orgOrder, market, type, side, amount, price = undefined, params = {}) {
        if (price === undefined) {
            price = 0;
        }
        const amount_scale = this.getScale (amount);
        const price_scale = this.getScale (price);
        let ordType = 1;
        let requestSide = 1;
        if (type === 'limit') {
            ordType = 2;
        }
        if (side === 'sell') {
            requestSide = 2;
        }
        const request = {
            'id': 0,
            'origOrderId': this.safeValue (orgOrder, 'info'),
            'clOrdId': this.safeValue (orgOrder, 'clOrdId'),
            'instrumentId': market['id'],
            'symbol': market['symbol'],
            'side': requestSide,
            'ordType': ordType,
            'price': this.safeValue (orgOrder, 'price'),
            'price_scale': this.safeValue (orgOrder, 'price_scale'),
            'quantity': this.safeValue (orgOrder, 'quantity'),
            'quantity_scale': this.safeValue (orgOrder, 'quantity_scale'),
            'price2': this.convertToScale (price, price_scale),
            'price2_scale': price_scale,
            'quantity2': this.convertToScale (amount, amount_scale),
            'quantity2_scale': amount_scale,
        };
        return this.extend (request, params);
    }

    async cancelOrder (id, symbol, params = {}) {

        // NOTE: We need to fetch order because we need to call the 
        const order = await this.fetchOrder (id, symbol, params);
        if (this.safeString (order, 'status') !== 'open') {
            throw new OrderNotFound (this.id + ': order id ' + id + ' is not found in open order');
        }
        console.log("[cancelOrder] order is: %o", order);

        await this.loadMarkets();

        const clientOrderId = order['info']['orders'][0]['clOrdId'];

        // Equos' API requires the clOrdId and clOrdId
        const request = {};
        request['clOrdId'] = clientOrderId;
        request['instrumentId'] = this.market(symbol)['id'];

        // The API gives back the wrong response without proper id, price, etc.
        // Therefore, we just return the ID
        // It will throw an error if it is not cancellable
        await this.privatePostCancelOrder (this.extend (request, params));
        return id;
    }

    // async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {

    //     // We are throwing this out because when an order is replaced,
    //     // It doesn't return the clientOrderId or similar.
    //     // Thus we have no way of tracking the order

    //     const order = await this.fetchOrder (id, symbol, params);
    //     if (this.safeString (order, 'status') !== 'open') {
    //         throw new OrderNotFound (this.id + ': order id ' + id + ' is not found in open order');
    //     }
    //     const market = this.market (symbol);
    //     if (type === undefined || side === undefined || amount === undefined) {
    //         throw new ArgumentsRequired (this.id + ': Order does not have enough arguments');
    //     }
    //     const orgOrder = this.safeValue (order, 'info');
    //     const newOrderRequest = this.createEditOrderRequest (orgOrder, market, type, side, amount, price, params);
    //     const response = await this.privatePostCancelReplaceOrder (this.extend (newOrderRequest));
    //     return this.extend ({ 'info': response });
    // }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        request['orderId'] = id;
        let orderHistoryResponse = await this.privatePostGetOrderHistory (this.extend (request, params));

        const order = this.parseOrder (orderHistoryResponse, market);
        return order;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();

        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrumentId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostGetOrders (this.extend (request, params));
        const orders = this.parseOrders (this.safeValue (response, 'orders', []), market, since, limit, params);
        return orders;
    }

    async fetchAllOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        const openOrders = this.filterByValueSinceLimit (orders, 'status', 'open', since, limit);
        return openOrders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        const closeOrders = this.filterByValueSinceLimit (orders, 'status', 'closed', since, limit);
        return closeOrders;
    }

    async fetchCancelledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        const canceledOrders = this.filterByValueSinceLimit (orders, 'status', 'canceled', since, limit);
        return canceledOrders;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request["instrumentId"] = market["id"];
        }
        if (since !== undefined) {
            request['timestamp'] = since;
        }

        const response = this.privatePostUserTrades(this.extend(request, params));
        let result = [];

        for (const trade in response["trades"]) {
            const timestamp = this.safeInteger(trade, "time");

            // Deal with side
            let side = this.safeString(trade, "side");
            if (side === "BUY") {
                side = "buy";
            } else if (side === "SELL") {
                side = "sell";
            } else {
                side = undefined;
            }

            let takerOrMaker = undefined;

            if (aggressorIndicator === true) {
                takerOrMaker = "taker";
            } else if (maker === false) {
                takerOrMaker = "maker";
            }

            // price and qty may have extraneous decimal places
            const price = this.safeFloat(trade, "price");
            const amount = this.safeFloat(trade, "qty");

            const feeCost = this.safeFloat(trade, "commission");
            const feeCurrency = this.safeFloat(trade, "commCurrency");

            result.push({
                "info": trade,
                "id": this.safeString(trade, "execId"),
                "timestamp": timestamp,
                "datetime": this.iso8601(timestamp),
                "symbol": this.safeString(market, "symbol"),
                "order": this.safeString(trade, "orderId"),
                "type": undefined,
                "side": side,
                "takerOrMaker": takerOrMaker,
                "price": price,
                "amount": amount,
                "cost": amount * price,
                "fee": {
                    "cost": feeCost,
                    "currency": feeCurrency,
                    "rate": undefined,
                },
            })
        }

        result = this.sortBy(result, "timestamp");
        return this.filterBySymbolSinceLimit(result, symbol, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.getCurrencyByCode (code);
        const request = {
            'instrumentId': currency['id'],
        };
        const response = await this.privatePostGetDepositAddresses (this.extend (request, params));
        const addresses = this.safeValue (response, 'addresses', []);
        return this.parseDepositAddress (addresses);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.getCurrencyByCode (code);
            request['instrumentId'] = currency['id'];
        }
        const response = await this.privatePostGetDepositHistory (this.extend (request, params));
        const deposits = this.safeValue (response, 'deposits', []);
        for (let i = 0; i < deposits.length; i++) {
            const deposit = deposits[i];
            deposit['type'] = 'deposit';
        }
        return this.parseTransactions (deposits, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.getCurrencyByCode (code);
            request['instrumentId'] = currency['id'];
        }
        // getWithdrawRequests
        const response = await this.privatePostGetWithdrawRequests (this.extend (request, params));
        const withdrawals = this.safeValue (response, 'addresses', []);
        for (let i = 0; i < withdrawals.length; i++) {
            const deposit = withdrawals[i];
            deposit['type'] = 'withdrawal';
        }
        return this.parseTransactions (withdrawals, currency, since, limit);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        const deposits = await this.fetchDeposits (code, since, undefined, params);
        const withdrawals = await this.fetchWithdrawals (code, since, undefined, params);
        let transactions = this.arrayConcat (deposits, withdrawals);
        // sort combined array result, latest first
        transactions = this.sortBy (transactions, 'timestamp', true);
        // lets apply limit on combined array
        if (limit !== undefined) {
            return this.filterBySinceLimit (transactions, since, limit);
        }
        return transactions;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.getCurrencyByCode (code);
        const scale = this.getScale (amount);
        const quantity = this.convertToScale (amount, scale);
        const instrumentId = currency['id'];
        const symbol = currency['code'];
        const request = {
            'instrumentId': instrumentId,
            'symbol': symbol,
            'quantity': quantity,
            'quantity_scale': scale,
            'address': address,
        };
        // sendWithdrawRequest
        const response = await this.privatePostSendWithdrawRequest (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    async fetchTradingFees (params = {}) {
        // getExchangeInfo
        const response = await this.publicGetGetExchangeInfo (params);
        const tradingFees = this.safeValue (response, 'spotFees', []);
        const taker = {};
        const maker = {};
        for (let i = 0; i < tradingFees.length; i++) {
            const tradingFee = tradingFees[i];
            if (this.safeString (tradingFee, 'tier') !== undefined) {
                taker[tradingFee['tier']] = this.safeFloat (tradingFee, 'taker');
                maker[tradingFee['tier']] = this.safeFloat (tradingFee, 'maker');
            }
        }
        return {
            'info': tradingFees,
            'tierBased': true,
            'maker': maker,
            'taker': taker,
        };
    }

    async fetchTradingLimits (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        // getExchangeInfo
        const response = await this.publicGetGetExchangeInfo (params);
        const tradingLimits = this.safeValue (response, 'tradingLimits', []);
        // To-do parsing response when available
        return {
            'info': tradingLimits,
            'limits': {
                'amount': {
                    'min': undefined,
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
            },
        };
    }

    async fetchFundingLimits (params = {}) {
        // getExchangeInfo
        const response = await this.publicGetGetExchangeInfo (params);
        const withdrawLimits = this.safeValue (response, 'withdrawLimits', []);
        // TO-DO parse response when available
        return {
            'info': withdrawLimits,
            'withdraw': undefined,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.getCurrencyByCode (code);
            request['instrumentId'] = currency['id'];
        }
        const _format = {};
        _format['format'] = 'json';
        _format['type'] = 'position';
        request['_format'] = _format;
        // getUserHistory
        const response = await this.privatePostGetUserHistory (this.extend (request, params));
        const positions = this.safeValue (response, 'postionHistory', []);
        return this.parseLedger (positions, undefined, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    getCurrencyByCode (code) {
        const currency = this.currencies[code];
        if (currency === undefined) {
            throw new BadSymbol (this.id + ': code ' + code + ' is not listed');
        }
        return currency;
    }

    parseOrder (order, market = undefined) {
        const status = this.parseOrderStatus (order);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            const marketId = this.safeString (order, 'instrumentId');
            if (this.safeValue (this.markets_by_id, marketId) !== undefined) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        const timestamp = this.parse8601 (this.convertToISO8601Date (this.safeString (order, 'timeStamp')));
        const lastTradeTimestamp = timestamp;

        // Filled price is lastPx. Should use price instead of fillPrice
        let price = this.convertFromScale (this.safeInteger (order, 'price', 0), this.safeInteger (order, 'price_scale', 0));
        const amount = this.convertFromScale (this.safeInteger (order, 'quantity', 0), this.safeInteger (order, 'quantity_scale', 0));
        const filled = this.convertFromScale (this.safeInteger (order, 'cumQty', 0), this.safeInteger (order, 'cumQty_scale', 0));
        const remaining = this.convertFromScale (this.safeInteger (order, 'leavesQty', 0), this.safeInteger (order, 'leavesQty_scale', 0));
        const average = this.convertFromScale (this.safeInteger (order, 'avgPx', 0), this.safeInteger (order, 'avgPx_scale', 0));

        const cost = price * filled;

        let currencyCode = undefined;
        const currencyId = this.safeInteger (order, 'feeInstrumentId');
        if (currencyId !== undefined) {
            const currency = this.safeValue (this.currencies_by_id, currencyId);
            if (currency !== undefined) {
                currencyCode = currency['code'];
            }
        }
        let feeTotal = undefined;
        if (this.safeInteger (order, 'feeTotal') !== undefined && this.safeInteger (order, 'fee_scale') !== undefined) {
            feeTotal = Math.abs (this.convertFromScale (this.safeInteger (order, 'feeTotal'), this.safeInteger (order, 'fee_scale')));
        }
        const fee = {                         // fee info, if available
            'currency': currencyCode,        // which currency the fee is (usually quote)
            'cost': feeTotal,           // the fee amount in that currency
            'rate': undefined,           // the fee rate (if available)
        };
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clOrdId');
        const type = this.parseOrderType (this.safeStringLower (order, 'ordType'));
        const side = this.parserOrderSide (this.safeStringLower (order, 'side'));
        const trades = this.parseTrades (this.safeValue (order, 'trades', []));

        const orderResult =  {
            'id': id,
            'average': average,
            'clientOrderId': clientOrderId,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': trades,
            'fee': fee,
            'info': order,
        };

        const orderUpdateSeq = this.safeValue(order, 'orderUpdateSeq');
        const execType = this.safeValue(order, 'execType');

        if (orderUpdateSeq === 0) {
            orderResult['lastTradeTimestamp'] = undefined;
        } else if (execType === 'F') {
            orderResult['datetime'] = undefined;
            orderResult['timestamp'] = undefined;
        } else {
            orderResult['datetime'] = undefined;
            orderResult['timestamp'] = undefined;
            orderResult['lastTradeTimestamp'] = undefined;
        }

        if (symbol === undefined) {
            const instrumentId = this.safeValue(order, 'instrumentId')
            if (instrumentId in this.marketsById){
                orderResult["symbol"] = this.markets_by_id[instrumentId]["symbol"]
            }
        }
        
        return orderResult;
    }

    parseMarket (market) {
        const id = market[0]; // instrumentId
        const symbol = market[1]; // symbol
        const splitSymbol = symbol.split ('/');
        let base = splitSymbol[0].toLowerCase ();
        let quote = splitSymbol[1].toLowerCase ();
        const baseId = market[3]; // baseId
        const quoteId = market[2]; // quotedId
        const baseCurrency = this.safeValue (this.currencies_by_id, baseId);
        const quoteCurrency = this.safeValue (this.currencies_by_id, quoteId);
        if (baseCurrency !== undefined) {
            base = baseCurrency['code'];
        }
        if (quoteCurrency !== undefined) {
            quote = quoteCurrency['code'];
        }
        // status
        let active = false;
        if (market[6] === 1) {
            active = true;
        }

        const precision = {
            'amount': market[5], // quantity_scale
            'price': market[4], // price_scale
            'cost': undefined,
        };

        const limits = {
            'amount': {
                'min': undefined,
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
        };

        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': active,
            'precision': precision,
            'limits': limits,
            'info': market,
        };
    }

    parseCurrency (currency) {
        const id = currency[0]; // instrumentId
        const code = currency[1]; // symbol
        const name = currency[6]; // name
        let active = false;
        // status
        if (currency[4] === 1) {
            active = true;
        }

        // const fee = currency[5]; // withdraw_fee
        // HACK: Fee is 0 during promotional periods
        // However, it is currently a percentage and the absolute
        // amount has to be updated in the API side
        const fee = null;

        // HACK: Precision is 6, as shown on the exchange.
        // May need more updates if this changes
        // const precision = currency[2]; // price_scale
        const precision = this.safeInteger(currency, 3);

        const limits = {
            'amount': {
                'min': undefined,
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
                'min': undefined,
                'max': undefined,
            },
        };
        return {
            'id': id,
            'code': code,
            'name': name,
            'active': active,
            'precision': precision,
            'limits': limits,
            'fee': fee,
            'info': currency,
        };
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = undefined;
        let datetime = undefined;
        let open = undefined;
        let high = undefined;
        let low = undefined;
        let close = undefined;
        // let volume = undefined;
        if (ticker !== undefined) {
            timestamp = ticker[0];
            datetime = this.iso8601 (timestamp);
            open = this.convertFromScale (ticker[1], market['precision']['price']);
            high = this.convertFromScale (ticker[2], market['precision']['price']);
            low = this.convertFromScale (ticker[3], market['precision']['price']);
            close = this.convertFromScale (ticker[4], market['precision']['price']);
            // volume = this.convertToScale (chart[5], market['precision']['amount'])
        }
        return {
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': datetime,
            'bid': undefined,
            'ask': undefined,
            'last': close,
            'high': high,
            'low': low,
            'bidVolume': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        const timestamp = ohlcv[0];
        const open = this.convertFromScale (ohlcv[1], market['precision']['price']);
        const high = this.convertFromScale (ohlcv[2], market['precision']['price']);
        const low = this.convertFromScale (ohlcv[3], market['precision']['price']);
        const close = this.convertFromScale (ohlcv[4], market['precision']['price']);
        const volume = this.convertFromScale (ohlcv[5], market['precision']['amount']);
        // volume = ohlcv[5];
        return [timestamp, open, high, low, close, volume];
    }

    parseTrade (trade, market) {
        const price = this.convertFromScale (this.safeInteger (trade, 0), market['precision']['price']);
        const amount = this.convertFromScale (this.safeInteger (trade, 1), market['precision']['amount']);
        const date = this.convertToISO8601Date (this.safeString (trade, 2));
        const timestamp = this.parse8601 (date);
        const dateTime = this.iso8601 (timestamp);
        const seqNumber = this.safeString (trade, 3);
        return {
            'info': { 'trade': trade },                    // the original decoded JSON as is
            'id': seqNumber,  // string trade id
            'timestamp': timestamp,              // Unix timestamp in milliseconds
            'datetime': dateTime,  // ISO8601 datetime with milliseconds
            'symbol': market['symbol'],                  // symbol
            'order': undefined,  // string order id or undefined/None/null
            'type': undefined,                    // order type, 'market', 'limit' or undefined/None/null
            'side': undefined,                      // direction of the trade, 'buy' or 'sell'
            'takerOrMaker': undefined,                    // string, 'taker' or 'maker'
            'price': price,                 // float price in quote currency
            'amount': amount,                        // amount of base currency
            'cost': undefined,                 // total cost (including fees), `price * amount`
            'fee': {                           // provided by exchange or calculated by ccxt
                'cost': undefined,                        // float
                'currency': undefined,                      // usually base currency for buys, quote currency for sells
                'rate': undefined,                          // the fee rate (if available)
            },
        };
    }

    isOpenOrder (order) {
        let conditionOne = false;
        let conditionTwo = false;
        const execType = this.safeValue (order, 'execType');
        const leavesQty = this.safeValue (order, 'leavesQty');
        const ordType = this.safeValue (order, 'ordType');
        const ordStatus = this.safeValue (order, 'ordStatus');
        if (execType === 'F' && leavesQty !== 0 && ordType !== '1') {
            conditionOne = true;
        }
        if (execType !== 'F' && execType !== '4' && execType !== '8' && execType !== 'B' && execType !== 'C' && ordType !== '1') {
            conditionTwo = true;
        }
        if ((conditionOne || conditionTwo) && ordStatus !== '8') {
            return true;
        } else {
            return false;
        }
    }

    isClosedOrder (order) {
        let conditionOne = false;
        let conditionTwo = false;
        const execType = this.safeValue (order, 'execType');
        const ordType = this.safeValue (order, 'ordType');
        const ordStatus = this.safeValue (order, 'ordStatus');
        const cumQty = this.safeValue (order, 'cumQty');
        if (execType !== '4' && execType !== '8' && ordStatus !== '8' && ordType === '1') {
            conditionOne = true;
        }
        if (execType === 'F' || execType === 'B' || execType === 'C') {
            conditionTwo = true;
        }
        if (conditionOne || (conditionTwo && cumQty !== 0)) {
            return true;
        } else {
            return false;
        }
    }

    isCancelledOrder (order) {
        let conditionOne = false;
        let conditionTwo = false;
        const execType = this.safeValue (order, 'execType');
        const ordStatus = this.safeValue (order, 'ordStatus');
        const cumQty = this.safeValue (order, 'cumQty');
        if (execType === '4' || execType === '8' || ordStatus === '8') {
            conditionOne = true;
        }
        if ((execType === 'B' || execType === 'C') && cumQty === 0) {
            conditionTwo = true;
        }
        if (conditionOne || conditionTwo) {
            return true;
        } else {
            return false;
        }
    }

    parseOrderStatus (order) {
        if (this.isOpenOrder (order)) {
            return 'open';
        } else if (this.isClosedOrder (order)) {
            return 'closed';
        } else if (this.isCancelledOrder (order)) {
            return 'canceled';
        } else {
            return undefined;
        }
        // const statuses = {
        //     '0': 'open',
        //     '1': 'partially filled',
        //     '2': 'filled',
        //     '3': 'done for day',
        //     '4': 'cancelled',
        //     '5': 'replaced',
        //     '6': 'pending cancel',
        //     '7': 'stopped',
        //     '8': 'rejected',
        //     '9': 'suspended',
        //     'A': 'pending New',
        //     'B': 'calculated',
        //     'C': 'expired',
        //     'D': ' accepted for bidding',
        //     'E': 'pending Replace',
        //     'F': 'trade', // (partial fill or fill)
        // };
        // return this.safeString (statuses, status, status);
    }

    parserOrderSide (side) {
        const sides = {
            '1': 'buy',
            '2': 'sell',
        };
        return this.safeString (sides, side, side);
    }

    parseOrderType (type) {
        const types = {
            '1': 'market',
            '2': 'limit',
            '3': 'stop',
            '4': 'stop limit',
        };
        return this.safeString (types, type, type);
    }

    parseDepositAddress (addresses) {
        const address = {
            'currency': undefined, // currency code
            'address': undefined,   // address in terms of requested currency
            'tag': undefined,           // tag / memo / paymentId for particular currencies (XRP, XMR, ...)
            'info': undefined,     // raw unparsed data as returned from the exchange
        };
        const addressesLength = addresses.length;
        if (addresses && addressesLength > 0) {
            address['currency'] = this.safeString (addresses[0], 'symbol');
            address['address'] = this.safeString (addresses[0], 'address');
            address['info'] = addresses[0];
        }
        return address;
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'transactionId');
        const datetime = this.convertToISO8601Date (this.safeString (transaction, 'timestamp', ' '));
        const timestamp = this.parse8601 (datetime);
        const address = this.safeString (transaction, 'address');
        const type = this.safeString (transaction, 'type');
        const amount = this.safeFloat (transaction, 'balance_change');
        const code = this.safeString (transaction, 'symbol');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        return {
            'info': transaction,    // the JSON response from the exchange as is
            'id': id,    // exchange-specific transaction id, string
            'txid': txid,
            'timestamp': timestamp,             // timestamp in milliseconds
            'datetime': datetime, // ISO8601 string of the timestamp
            'addressFrom': undefined, // sender
            'address': address, // "from" or "to"
            'addressTo': undefined, // receiver
            'tagFrom': undefined, // "tag" or "memo" or "payment_id" associated with the sender
            'tag': undefined, // "tag" or "memo" or "payment_id" associated with the address
            'tagTo': undefined, // "tag" or "memo" or "payment_id" associated with the receiver
            'type': type,   // or 'withdrawal', string
            'amount': amount,     // float (does not include the fee)
            'currency': code,       // a common unified currency code, string
            'status': status,   // 'ok', 'failed', 'canceled', string
            'updated': undefined,  // UTC timestamp of most recent status change in ms
            'comment': undefined,
            'fee': {                 // the entire fee structure may be undefined
                'currency': undefined,   // a unified fee currency code
                'cost': undefined,      // float
                'rate': undefined,   // approximately, fee['cost'] / amount, float
            },
        };
    }

    parseLedgerEntry (entry, currency = undefined) {
        const id = this.safeString (entry, 'reportid');
        const currencyId = this.safeInteger (entry, 'instrumentId1');
        const referenceId = this.safeString (entry, 'transactionid');
        const timestamp = this.safeInteger (entry, 'publishtime');
        const txnType = this.safeString (entry, 'txnType');
        const execId = this.safeInteger (entry, 'execId');
        const orderId = this.safeInteger (entry, 'orderId');
        const type = this.parseLedgerEntryType (txnType, execId, orderId);
        let currencyCode = undefined;
        let direction = undefined;
        let amount = 0;
        let before = 0;
        let after = 0;
        if (currencyId !== undefined) {
            const currency = this.currencies_by_id[currencyId];
            if (currency !== undefined) {
                currencyCode = currency['code'];
                amount = this.convertFromScale (this.safeInteger (entry, 'change1', 0), currency['precision']);
                after = this.convertFromScale (this.safeInteger (entry, 'qty1', 0), currency['precision']);
            }
            before = after - amount;
            if (amount < 0) {
                direction = 'out';
                amount = -amount;
            } else {
                direction = 'in';
            }
        }
        return {
            'id': id,
            'direction': direction,
            'account': undefined,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'type': type,
            'currency': currencyCode,
            'amount': amount,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': before,
            'after': after,
            'status': 'ok',
            'fee': undefined,
            'info': entry,
        };
    }

    parseLedgerEntryType (type, execId, orderId) {
        if ((execId > 0 && orderId > 0) || type === '4019') {
            return 'trade';
        }
        const types = {
            '4011': 'deposit', // TX_DEPOSIT
            '4012': 'withdraw', // TX_WITHDRAW
            '4013': 'deposit', // TX_ADMIN_DEPOSIT
            '4014': 'withdraw', // TX_ADMIN_WITHDRAW
            '4015': 'fee', // TX_FEE
            '4016': 'transaction', // TX_ADJUSTMENT
            '4017': 'transaction', // TX_INVEST_FUND
            '4018': 'transaction', // TX_DIVEST_FUND
            '4019': 'transaction', // TX_TRADE_FILL
            '4020': 'transaction', // TX_FUNDING_RATE
            '4021': 'transaction', // TX_RESTAT
            '4022': 'transaction', // TX_COLLATERAL_SWAP
            '4023': 'transaction', // TX_COLLATRAL_SWAP_ADJ
            '4024': 'transaction', // TX_ADMIN_WITHDRAW_REJECTED
            '4025': 'transaction', // TX_FROM_BANKRUPT_REMAINDER
            '4026': 'transaction', // TX_TO_BANKRUPT_REMAINDER
            '4027': 'transaction', // TX_BALANCE_ADMIN_INVALID_USER_REJECTED
            '4028': 'transaction', // TX_EXPIRE_SETTLED
        };
        return this.safeString (types, type, type);
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined, params = {}) {

        let result = Object.values (orders).map ((order) => this.extend (this.parseOrder (order, market), params))
        // Use id to sort, timestamp is not guaranteed
        // HOWEVER. id is a string and not a number
        // So I need to convert back and forth
        for (let i = 0; i < result.length; i++) {
            result['id'] = this.safeInteger (result[i], 'id');
        }

        result = this.sortBy (result, 'id')

        for (let i = 0; i < result.length; i++) {
            result['id'] = this.safeString(result[i], 'id');
        }

        const symbol = (market !== undefined) ? market['symbol'] : undefined
        const filterred = this.filterBySymbolSinceLimit (result, symbol, since, limit)
        return filterred;
    }

    parseTransactionStatus (status) {
        return status;
    }

    convertToISO8601Date (dateString) {
        if (dateString !== undefined) {
            // '20200328-10:31:01.575' -> '2020-03-28 12:42:48.000'
            const splits = dateString.split ('-');
            const partOne = this.safeString (splits, 0);
            const PartTwo = this.safeString (splits, 1);
            if (partOne === undefined || PartTwo === undefined) {
                return undefined;
            }
            if (partOne.length !== 8) {
                return undefined;
            }
            const date = partOne.slice (0, 4) + '-' + partOne.slice (4, 6) + '-' + partOne.slice (6, 8);
            const datetime = date + ' ' + PartTwo;
            return datetime;
        } else {
            return '';
        }
    }

    convertFromScale (number, scale) {
        return this.fromWei (number, scale);
    }

    getScale (num) {
        const s = this.numberToString (num);
        return this.precisionFromString (s);
    }

    convertToScale (number, scale) {
        return parseInt (this.toWei (number, scale));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                query += '?' + this.urlencode (params);
            }
        } else if (method === 'POST') {
            const format = this.safeValue (params, '_format');
            if (format !== undefined) {
                query += '?' + this.urlencode (format);
                params = this.omit (params, '_format');
            }
            headers = {
                'Content-Type': 'application/json',
            };
            params['nonce'] = this.nonce ();
            if (api === 'private') {
                this.checkRequiredCredentials ();
                headers['requestToken'] = this.apiKey;
                params['userId'] = this.uid;
                body = this.json (params);
                const signature = this.hmac (this.encode (body), this.encode (this.secret), 'sha384');
                headers['signature'] = signature;
            }
            if (body === undefined) {
                body = this.json (params);
            }
        }
        const url = this.urls['api'][api] + query;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};