'use strict';

var krakenfutures$1 = require('../krakenfutures.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var Precise = require('../base/Precise.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');
var sha512 = require('../static_dependencies/noble-hashes/sha512.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class krakenfutures extends krakenfutures$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'cancelAllOrdersWs': false,
                'cancelOrdersWs': false,
                'cancelOrderWs': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'fetchBalanceWs': false,
                'fetchOpenOrdersWs': false,
                'fetchOrderWs': false,
                'fetchTradesWs': false,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchBalance': true,
                // 'watchStatus': true, // https://docs.futures.kraken.com/#websocket-api-public-feeds-heartbeat
                'watchOrders': true,
                'watchMyTrades': true,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://futures.kraken.com/ws/v1',
                },
                'test': {
                    'ws': 'wss://demo-futures.kraken.com/ws/v1',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'connectionLimit': 100,
                'requestLimit': 100,
                'fetchBalance': {
                    'type': undefined,
                },
            },
            'streaming': {
                'keepAlive': 30000,
            },
        });
    }
    /**
     * @ignore
     * @method
     * @description authenticates the user to access private web socket channels
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-challenge
     * @returns {object} response from exchange
     */
    async authenticate(params = {}) {
        this.checkRequiredCredentials();
        // Hash the challenge with the SHA-256 algorithm
        // Base64-decode your api_secret
        // Use the result of step 2 to hash the result of step 1 with the HMAC-SHA-512 algorithm
        // Base64-encode the result of step 3
        const url = this.urls['api']['ws'];
        const messageHash = 'challenge';
        const client = this.client(url);
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const request = {
                'event': 'challenge',
                'api_key': this.apiKey,
            };
            const message = this.extend(request, params);
            this.watch(url, messageHash, message, messageHash);
        }
        return await future;
    }
    /**
     * @method
     * @name krakenfutures#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-challenge
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        const orderbook = await this.watchMultiHelper('orderbook', 'book', symbols, { 'limit': limit }, params);
        return orderbook.limit();
    }
    /**
     * @ignore
     * @method
     * @description Connects to a websocket channel
     * @param {string} name name of the channel
     * @param {string[]} symbols CCXT market symbols
     * @param {object} [params] extra parameters specific to the krakenfutures api
     * @returns {object} data from the websocket stream
     */
    async subscribePublic(name, symbols, params = {}) {
        await this.loadMarkets();
        const url = this.urls['api']['ws'];
        const subscribe = {
            'event': 'subscribe',
            'feed': name,
        };
        const marketIds = [];
        let messageHash = name;
        if (symbols === undefined) {
            symbols = [];
        }
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            marketIds.push(this.marketId(symbol));
        }
        const length = symbols.length;
        if (length === 1) {
            const market = this.market(marketIds[0]);
            messageHash = messageHash + ':' + market['symbol'];
        }
        subscribe['product_ids'] = marketIds;
        const request = this.extend(subscribe, params);
        return await this.watch(url, messageHash, request, messageHash);
    }
    /**
     * @ignore
     * @method
     * @description Connects to a websocket channel
     * @param {string} name name of the channel
     * @param {string} messageHash unique identifier for the message
     * @param {object} [params] extra parameters specific to the krakenfutures api
     * @returns {object} data from the websocket stream
     */
    async subscribePrivate(name, messageHash, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        const url = this.urls['api']['ws'];
        const subscribe = {
            'event': 'subscribe',
            'feed': name,
            'api_key': this.apiKey,
            'original_challenge': this.options['challenge'],
            'signed_challenge': this.options['signedChallenge'],
        };
        const request = this.extend(subscribe, params);
        return await this.watch(url, messageHash, request, messageHash);
    }
    /**
     * @method
     * @name krakenfutures#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const tickers = await this.watchTickers([symbol], params);
        return tickers[symbol];
    }
    /**
     * @method
     * @name krakenfutures#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-ticker
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const ticker = await this.watchMultiHelper('ticker', 'ticker', symbols, undefined, params);
        if (this.newUpdates) {
            const result = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    /**
     * @method
     * @name krakenfutures#watchBidsAsks
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-ticker-lite
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        const ticker = await this.watchMultiHelper('bidask', 'ticker_lite', symbols, undefined, params);
        if (this.newUpdates) {
            const result = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    /**
     * @method
     * @name krakenfutures#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name krakenfutures#watchTradesForSymbols
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-trade
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        const trades = await this.watchMultiHelper('trade', 'trade', symbols, undefined, params);
        if (this.newUpdates) {
            const first = this.safeList(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name krakenfutures#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.futures.kraken.com/#websocket-api-public-feeds-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] not used by krakenfutures watchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    /**
     * @method
     * @name krakenfutures#watchPositions
     * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-open-positions
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param since
     * @param limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let messageHash = '';
        symbols = this.marketSymbols(symbols);
        if (!this.isEmpty(symbols)) {
            messageHash = '::' + symbols.join(',');
        }
        messageHash = 'positions' + messageHash;
        const newPositions = await this.subscribePrivate('open_positions', messageHash, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(this.positions, symbols, since, limit, true);
    }
    handlePositions(client, message) {
        //
        //    {
        //        feed: 'open_positions',
        //        account: '3b111acc-4fcc-45be-a622-57e611fe9f7f',
        //        positions: [
        //            {
        //                instrument: 'PF_LTCUSD',
        //                balance: 0.5,
        //                pnl: -0.8628305877699987,
        //                entry_price: 70.53,
        //                mark_price: 68.80433882446,
        //                index_price: 68.8091,
        //                liquidation_threshold: 0,
        //                effective_leverage: 0.007028866753648637,
        //                return_on_equity: -1.2233525985679834,
        //                unrealized_funding: 0.0000690610530935388,
        //                initial_margin: 0.7053,
        //                initial_margin_with_orders: 0.7053,
        //                maintenance_margin: 0.35265,
        //                pnl_currency: 'USD'
        //            }
        //        ],
        //        seq: 0,
        //        timestamp: 1698608414910
        //    }
        //
        if (this.positions === undefined) {
            this.positions = new Cache.ArrayCacheBySymbolById();
        }
        const cache = this.positions;
        const rawPositions = this.safeValue(message, 'positions', []);
        const newPositions = [];
        for (let i = 0; i < rawPositions.length; i++) {
            const rawPosition = rawPositions[i];
            const position = this.parseWsPosition(rawPosition);
            const timestamp = this.safeInteger(message, 'timestamp');
            position['timestamp'] = timestamp;
            position['datetime'] = this.iso8601(timestamp);
            newPositions.push(position);
            cache.append(position);
        }
        const messageHashes = this.findMessageHashes(client, 'positions::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split(',');
            const positions = this.filterByArray(newPositions, 'symbol', symbols, false);
            if (!this.isEmpty(positions)) {
                client.resolve(positions, messageHash);
            }
        }
        client.resolve(newPositions, 'positions');
    }
    parseWsPosition(position, market = undefined) {
        //
        //        {
        //            instrument: 'PF_LTCUSD',
        //            balance: 0.5,
        //            pnl: -0.8628305877699987,
        //            entry_price: 70.53,
        //            mark_price: 68.80433882446,
        //            index_price: 68.8091,
        //            liquidation_threshold: 0,
        //            effective_leverage: 0.007028866753648637,
        //            return_on_equity: -1.2233525985679834,
        //            unrealized_funding: 0.0000690610530935388,
        //            initial_margin: 0.7053,
        //            initial_margin_with_orders: 0.7053,
        //            maintenance_margin: 0.35265,
        //            pnl_currency: 'USD'
        //        }
        //
        const marketId = this.safeString(position, 'instrument');
        const hedged = 'both';
        const balance = this.safeNumber(position, 'balance');
        const side = (balance > 0) ? 'long' : 'short';
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': this.safeSymbol(marketId),
            'notional': undefined,
            'marginMode': undefined,
            'liquidationPrice': this.safeNumber(position, 'liquidation_threshold'),
            'entryPrice': this.safeNumber(position, 'entry_price'),
            'unrealizedPnl': this.safeNumber(position, 'pnl'),
            'percentage': this.safeNumber(position, 'return_on_equity'),
            'contracts': this.parseNumber(Precise["default"].stringAbs(this.numberToString(balance))),
            'contractSize': undefined,
            'markPrice': this.safeNumber(position, 'mark_price'),
            'side': side,
            'hedged': hedged,
            'timestamp': undefined,
            'datetime': undefined,
            'maintenanceMargin': this.safeNumber(position, 'maintenance_margin'),
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': this.safeNumber(position, 'initial_margin'),
            'initialMarginPercentage': undefined,
            'leverage': undefined,
            'marginRatio': undefined,
        });
    }
    /**
     * @method
     * @name krakenfutures#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-open-orders
     * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-open-orders-verbose
     * @param {string} symbol not used by krakenfutures watchOrders
     * @param {int} [since] not used by krakenfutures watchOrders
     * @param {int} [limit] not used by krakenfutures watchOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const name = 'open_orders';
        let messageHash = 'orders';
        if (symbol !== undefined) {
            const market = this.market(symbol);
            messageHash += ':' + market['symbol'];
        }
        const orders = await this.subscribePrivate(name, messageHash, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(orders, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name krakenfutures#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-fills
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const name = 'fills';
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            const market = this.market(symbol);
            messageHash += ':' + market['symbol'];
        }
        const trades = await this.subscribePrivate(name, messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name krakenfutures#watchBalance
     * @description watches information on the user's account balance
     * @see https://docs.futures.kraken.com/#websocket-api-private-feeds-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] can be either 'futures' or 'flex_futures'
     * @returns {object} a object of wallet types each with a balance structure {@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        const name = 'balances';
        let messageHash = name;
        let account = undefined;
        [account, params] = this.handleOptionAndParams(params, 'watchBalance', 'account');
        if (account !== undefined) {
            if (account !== 'futures' && account !== 'flex_futures') {
                throw new errors.ArgumentsRequired(this.id + ' watchBalance account must be either \'futures\' or \'flex_futures\'');
            }
            messageHash += ':' + account;
        }
        return await this.subscribePrivate(name, messageHash, params);
    }
    handleTrade(client, message) {
        //
        // snapshot
        //
        //    {
        //        "feed": "trade_snapshot",
        //        "product_id": "PI_XBTUSD",
        //        "trades": [
        //            {
        //                "feed": "trade",
        //                "product_id": "PI_XBTUSD",
        //                "uid": "caa9c653-420b-4c24-a9f1-462a054d86f1",
        //                "side": "sell",
        //                "type": "fill",
        //                "seq": 655508,
        //                "time": 1612269657781,
        //                "qty": 440,
        //                "price": 34893
        //            },
        //            ...
        //        ]
        //    }
        //
        // update
        //
        //    {
        //        "feed": "trade",
        //        "product_id": "PI_XBTUSD",
        //        "uid": "05af78ac-a774-478c-a50c-8b9c234e071e",
        //        "side": "sell",
        //        "type": "fill",
        //        "seq": 653355,
        //        "time": 1612266317519,
        //        "qty": 15000,
        //        "price": 34969.5
        //    }
        //
        const channel = this.safeString(message, 'feed');
        const marketId = this.safeString(message, 'product_id');
        if (marketId !== undefined) {
            const market = this.market(marketId);
            const symbol = market['symbol'];
            const messageHash = this.getMessageHash('trade', undefined, symbol);
            if (this.safeList(this.trades, symbol) === undefined) {
                const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
                this.trades[symbol] = new Cache.ArrayCache(tradesLimit);
            }
            const tradesArray = this.trades[symbol];
            if (channel === 'trade_snapshot') {
                const trades = this.safeList(message, 'trades', []);
                const length = trades.length;
                for (let i = 0; i < length; i++) {
                    const index = length - 1 - i; // need reverse to correct chronology
                    const item = trades[index];
                    const trade = this.parseWsTrade(item);
                    tradesArray.append(trade);
                }
            }
            else {
                const trade = this.parseWsTrade(message);
                tradesArray.append(trade);
            }
            client.resolve(tradesArray, messageHash);
        }
    }
    parseWsTrade(trade, market = undefined) {
        //
        //    {
        //        "feed": "trade",
        //        "product_id": "PI_XBTUSD",
        //        "uid": "caa9c653-420b-4c24-a9f1-462a054d86f1",
        //        "side": "sell",
        //        "type": "fill",
        //        "seq": 655508,
        //        "time": 1612269657781,
        //        "qty": 440,
        //        "price": 34893
        //    }
        //
        const marketId = this.safeString(trade, 'product_id');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(trade, 'time');
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'uid'),
            'symbol': this.safeString(market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'order': undefined,
            'type': this.safeString(trade, 'type'),
            'side': this.safeString(trade, 'side'),
            'takerOrMaker': 'taker',
            'price': this.safeString(trade, 'price'),
            'amount': this.safeString(trade, 'qty'),
            'cost': undefined,
            'fee': {
                'rate': undefined,
                'cost': undefined,
                'currency': undefined,
            },
        }, market);
    }
    parseWsOrderTrade(trade, market = undefined) {
        //
        //    {
        //        "symbol": "BTC_USDT",
        //        "type": "LIMIT",
        //        "quantity": "1",
        //        "orderId": "32471407854219264",
        //        "tradeFee": "0",
        //        "clientOrderId": "",
        //        "accountType": "SPOT",
        //        "feeCurrency": "",
        //        "eventType": "place",
        //        "source": "API",
        //        "side": "BUY",
        //        "filledQuantity": "0",
        //        "filledAmount": "0",
        //        "matchRole": "MAKER",
        //        "state": "NEW",
        //        "tradeTime": 0,
        //        "tradeAmount": "0",
        //        "orderAmount": "0",
        //        "createTime": 1648708186922,
        //        "price": "47112.1",
        //        "tradeQty": "0",
        //        "tradePrice": "0",
        //        "tradeId": "0",
        //        "ts": 1648708187469
        //    }
        //
        const timestamp = this.safeInteger(trade, 'tradeTime');
        const marketId = this.safeString(trade, 'symbol');
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'tradeId'),
            'symbol': this.safeSymbol(marketId, market),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'order': this.safeString(trade, 'orderId'),
            'type': this.safeStringLower(trade, 'type'),
            'side': this.safeString(trade, 'side'),
            'takerOrMaker': this.safeString(trade, 'matchRole'),
            'price': this.safeString(trade, 'price'),
            'amount': this.safeString(trade, 'tradeAmount'),
            'cost': undefined,
            'fee': {
                'rate': undefined,
                'cost': this.safeString(trade, 'tradeFee'),
                'currency': this.safeString(trade, 'feeCurrency'),
            },
        }, market);
    }
    handleOrder(client, message) {
        //
        //  update (verbose)
        //
        //    {
        //        "feed": "open_orders_verbose",
        //        "order": {
        //            "instrument": "PI_XBTUSD",
        //            "time": 1567597581495,
        //            "last_update_time": 1567597581495,
        //            "qty": 102.0,
        //            "filled": 0.0,
        //            "limit_price": 10601.0,
        //            "stop_price": 0.0,
        //            "type": "limit",
        //            "order_id": "fa9806c9-cba9-4661-9f31-8c5fd045a95d",
        //            "direction": 0,
        //            "reduce_only": false
        //        },
        //        "is_cancel": true,
        //        "reason": "post_order_failed_because_it_would_be_filled"
        //    }
        //
        // update
        //
        //    {
        //        "feed": "open_orders",
        //        "order": {
        //          "instrument": "PI_XBTUSD",
        //          "time": 1567702877410,
        //          "last_update_time": 1567702877410,
        //          "qty": 304.0,
        //          "filled": 0.0,
        //          "limit_price": 10640.0,
        //          "stop_price": 0.0,
        //          "type": "limit",
        //          "order_id": "59302619-41d2-4f0b-941f-7e7914760ad3",
        //          "direction": 1,
        //          "reduce_only": true
        //        },
        //        "is_cancel": false,
        //        "reason": "new_placed_order_by_user"
        //    }
        //    {
        //        "feed": "open_orders",
        //        "order_id": "ea8a7144-37db-449b-bb4a-b53c814a0f43",
        //        "is_cancel": true,
        //        "reason": "cancelled_by_user"
        //    }
        //
        //     {
        //         "feed": 'open_orders',
        //         "order": {
        //         "instrument": 'PF_XBTUSD',
        //         "time": 1698159920097,
        //         "last_update_time": 1699835622988,
        //         "qty": 1.1,
        //         "filled": 0,
        //         "limit_price": 20000,
        //         "stop_price": 0,
        //         "type": 'limit',
        //         "order_id": '0eaf02b0-855d-4451-a3b7-e2b3070c1fa4',
        //         "direction": 0,
        //         "reduce_only": false
        //         },
        //         "is_cancel": false,
        //         "reason": 'edited_by_user'
        //     }
        //
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit');
            orders = new Cache.ArrayCacheBySymbolById(limit);
            this.orders = orders;
        }
        const order = this.safeValue(message, 'order');
        if (order !== undefined) {
            const marketId = this.safeString(order, 'instrument');
            const messageHash = 'orders';
            const symbol = this.safeSymbol(marketId);
            const orderId = this.safeString(order, 'order_id');
            const previousOrders = this.safeValue(orders.hashmap, symbol, {});
            const previousOrder = this.safeValue(previousOrders, orderId);
            const reason = this.safeString(message, 'reason');
            if ((previousOrder === undefined) || (reason === 'edited_by_user')) {
                const parsed = this.parseWsOrder(order);
                orders.append(parsed);
                client.resolve(orders, messageHash);
                client.resolve(orders, messageHash + ':' + symbol);
            }
            else {
                const trade = this.parseWsTrade(order);
                if (previousOrder['trades'] === undefined) {
                    previousOrder['trades'] = [];
                }
                previousOrder['trades'].push(trade);
                previousOrder['lastTradeTimestamp'] = trade['timestamp'];
                let totalCost = '0';
                let totalAmount = '0';
                const trades = previousOrder['trades'];
                for (let i = 0; i < trades.length; i++) {
                    const currentTrade = trades[i];
                    totalCost = Precise["default"].stringAdd(totalCost, this.numberToString(currentTrade['cost']));
                    totalAmount = Precise["default"].stringAdd(totalAmount, this.numberToString(currentTrade['amount']));
                }
                if (Precise["default"].stringGt(totalAmount, '0')) {
                    previousOrder['average'] = Precise["default"].stringDiv(totalCost, totalAmount);
                }
                previousOrder['cost'] = totalCost;
                if (previousOrder['filled'] !== undefined) {
                    const stringOrderFilled = this.numberToString(previousOrder['filled']);
                    previousOrder['filled'] = Precise["default"].stringAdd(stringOrderFilled, this.numberToString(trade['amount']));
                    if (previousOrder['amount'] !== undefined) {
                        previousOrder['remaining'] = Precise["default"].stringSub(this.numberToString(previousOrder['amount']), stringOrderFilled);
                    }
                }
                if (previousOrder['fee'] === undefined) {
                    previousOrder['fee'] = {
                        'rate': undefined,
                        'cost': '0',
                        'currency': this.numberToString(trade['fee']['currency']),
                    };
                }
                if ((previousOrder['fee']['cost'] !== undefined) && (trade['fee']['cost'] !== undefined)) {
                    const stringOrderCost = this.numberToString(previousOrder['fee']['cost']);
                    const stringTradeCost = this.numberToString(trade['fee']['cost']);
                    previousOrder['fee']['cost'] = Precise["default"].stringAdd(stringOrderCost, stringTradeCost);
                }
                // update the newUpdates count
                orders.append(this.safeOrder(previousOrder));
                client.resolve(orders, messageHash + ':' + symbol);
                client.resolve(orders, messageHash);
            }
        }
        else {
            const isCancel = this.safeValue(message, 'is_cancel');
            if (isCancel) {
                // get order without symbol
                for (let i = 0; i < orders.length; i++) {
                    const currentOrder = orders[i];
                    if (currentOrder['id'] === message['order_id']) {
                        orders[i] = this.extend(currentOrder, {
                            'status': 'canceled',
                        });
                        client.resolve(orders, 'orders');
                        client.resolve(orders, 'orders:' + currentOrder['symbol']);
                        break;
                    }
                }
            }
        }
        return message;
    }
    handleOrderSnapshot(client, message) {
        //
        // verbose
        //
        //    {
        //        "feed": "open_orders_verbose_snapshot",
        //        "account": "0f9c23b8-63e2-40e4-9592-6d5aa57c12ba",
        //        "orders": [
        //            {
        //                "instrument": "PI_XBTUSD",
        //                "time": 1567428848005,
        //                "last_update_time": 1567428848005,
        //                "qty": 100.0,
        //                "filled": 0.0,
        //                "limit_price": 8500.0,
        //                "stop_price": 0.0,
        //                "type": "limit",
        //                "order_id": "566942c8-a3b5-4184-a451-622b09493129",
        //                "direction": 0,
        //                "reduce_only": false
        //            },
        //            ...
        //        ]
        //    }
        //
        // regular
        //
        //    {
        //        "feed": "open_orders_snapshot",
        //        "account": "e258dba9-4dd4-4da5-bfef-75beb91c098e",
        //        "orders": [
        //            {
        //                "instrument": "PI_XBTUSD",
        //                "time": 1612275024153,
        //                "last_update_time": 1612275024153,
        //                "qty": 1000,
        //                "filled": 0,
        //                "limit_price": 34900,
        //                "stop_price": 13789,
        //                "type": "stop",
        //                "order_id": "723ba95f-13b7-418b-8fcf-ab7ba6620555",
        //                "direction": 1,
        //                "reduce_only": false,
        //                "triggerSignal": "last"
        //            },
        //            ...
        //        ]
        //    }
        const orders = this.safeValue(message, 'orders', []);
        const limit = this.safeInteger(this.options, 'ordersLimit');
        this.orders = new Cache.ArrayCacheBySymbolById(limit);
        const symbols = {};
        const cachedOrders = this.orders;
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const parsed = this.parseWsOrder(order);
            const symbol = parsed['symbol'];
            symbols[symbol] = true;
            cachedOrders.append(parsed);
        }
        const length = this.orders.length;
        if (length > 0) {
            client.resolve(this.orders, 'orders');
            const keys = Object.keys(symbols);
            for (let i = 0; i < keys.length; i++) {
                const symbol = keys[i];
                const messageHash = 'orders:' + symbol;
                client.resolve(this.orders, messageHash);
            }
        }
    }
    parseWsOrder(order, market = undefined) {
        //
        // update
        //
        //    {
        //        "feed": "open_orders_verbose",
        //        "order": {
        //            "instrument": "PI_XBTUSD",
        //            "time": 1567597581495,
        //            "last_update_time": 1567597581495,
        //            "qty": 102.0,
        //            "filled": 0.0,
        //            "limit_price": 10601.0,
        //            "stop_price": 0.0,
        //            "type": "limit",
        //            "order_id": "fa9806c9-cba9-4661-9f31-8c5fd045a95d",
        //            "direction": 0,
        //            "reduce_only": false
        //        },
        //        "is_cancel": true,
        //        "reason": "post_order_failed_because_it_would_be_filled"
        //    }
        //
        // snapshot
        //
        //    {
        //        "instrument": "PI_XBTUSD",
        //        "time": 1567597581495,
        //        "last_update_time": 1567597581495,
        //        "qty": 102.0,
        //        "filled": 0.0,
        //        "limit_price": 10601.0,
        //        "stop_price": 0.0,
        //        "type": "limit",
        //        "order_id": "fa9806c9-cba9-4661-9f31-8c5fd045a95d",
        //        "direction": 0,
        //        "reduce_only": false
        //    }
        //
        const isCancelled = this.safeValue(order, 'is_cancel');
        let unparsedOrder = order;
        let status = undefined;
        if (isCancelled !== undefined) {
            unparsedOrder = this.safeValue(order, 'order');
            if (isCancelled === true) {
                status = 'cancelled';
            }
        }
        const marketId = this.safeString(unparsedOrder, 'instrument');
        const timestamp = this.safeString(unparsedOrder, 'time');
        const direction = this.safeInteger(unparsedOrder, 'direction');
        return this.safeOrder({
            'info': order,
            'symbol': this.safeSymbol(marketId, market),
            'id': this.safeString(unparsedOrder, 'order_id'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'type': this.safeString(unparsedOrder, 'type'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': (direction === 0) ? 'buy' : 'sell',
            'price': this.safeString(unparsedOrder, 'limit_price'),
            'stopPrice': this.safeString(unparsedOrder, 'stop_price'),
            'triggerPrice': this.safeString(unparsedOrder, 'stop_price'),
            'amount': this.safeString(unparsedOrder, 'qty'),
            'cost': undefined,
            'average': undefined,
            'filled': this.safeString(unparsedOrder, 'filled'),
            'remaining': undefined,
            'status': status,
            'fee': {
                'rate': undefined,
                'cost': undefined,
                'currency': undefined,
            },
            'trades': undefined,
        });
    }
    handleTicker(client, message) {
        //
        //    {
        //        "time": 1680811086487,
        //        "product_id": "PI_XBTUSD",
        //        "funding_rate": 7.792297e-12,
        //        "funding_rate_prediction": -4.2671095e-11,
        //        "relative_funding_rate": 2.18013888889e-7,
        //        "relative_funding_rate_prediction": -0.0000011974,
        //        "next_funding_rate_time": 1680811200000,
        //        "feed": "ticker",
        //        "bid": 28060,
        //        "ask": 28070,
        //        "bid_size": 2844,
        //        "ask_size": 1902,
        //        "volume": 19628180,
        //        "dtm": 0,
        //        "leverage": "50x",
        //        "index": 28062.14,
        //        "premium": 0,
        //        "last": 28053.5,
        //        "change": -0.7710945651981715,
        //        "suspended": false,
        //        "tag": "perpetual",
        //        "pair": "XBT:USD",
        //        "openInterest": 28875946,
        //        "markPrice": 28064.92082724592,
        //        "maturityTime": 0,
        //        "post_only": false,
        //        "volumeQuote": 19628180
        //    }
        //
        const marketId = this.safeString(message, 'product_id');
        if (marketId !== undefined) {
            const ticker = this.parseWsTicker(message);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            const messageHash = this.getMessageHash('ticker', undefined, symbol);
            client.resolve(ticker, messageHash);
        }
    }
    handleBidAsk(client, message) {
        //
        //    {
        //        "feed": "ticker_lite",
        //        "product_id": "FI_ETHUSD_210625",
        //        "bid": 1753.45,
        //        "ask": 1760.35,
        //        "change": 13.448175559936647,
        //        "premium": 9.1,
        //        "volume": 6899673.0,
        //        "tag": "semiannual",
        //        "pair": "ETH:USD",
        //        "dtm": 141,
        //        "maturityTime": 1624633200000,
        //        "volumeQuote": 6899673.0
        //    }
        //
        const marketId = this.safeString(message, 'product_id');
        if (marketId !== undefined) {
            const ticker = this.parseWsTicker(message);
            const symbol = ticker['symbol'];
            this.bidsasks[symbol] = ticker;
            const messageHash = this.getMessageHash('bidask', undefined, symbol);
            client.resolve(ticker, messageHash);
        }
    }
    parseWsTicker(ticker, market = undefined) {
        //
        //    {
        //        "time": 1680811086487,
        //        "product_id": "PI_XBTUSD",
        //        "funding_rate": 7.792297e-12,
        //        "funding_rate_prediction": -4.2671095e-11,
        //        "relative_funding_rate": 2.18013888889e-7,
        //        "relative_funding_rate_prediction": -0.0000011974,
        //        "next_funding_rate_time": 1680811200000,
        //        "feed": "ticker",
        //        "bid": 28060,
        //        "ask": 28070,
        //        "bid_size": 2844,
        //        "ask_size": 1902,
        //        "volume": 19628180,
        //        "dtm": 0,
        //        "leverage": "50x",
        //        "index": 28062.14,
        //        "premium": 0,
        //        "last": 28053.5,
        //        "change": -0.7710945651981715,
        //        "suspended": false,
        //        "tag": "perpetual",
        //        "pair": "XBT:USD",
        //        "openInterest": 28875946,
        //        "markPrice": 28064.92082724592,
        //        "maturityTime": 0,
        //        "post_only": false,
        //        "volumeQuote": 19628180
        //    }
        //
        // ticker_lite
        //
        //    {
        //        "feed": "ticker_lite",
        //        "product_id": "FI_ETHUSD_210625",
        //        "bid": 1753.45,
        //        "ask": 1760.35,
        //        "change": 13.448175559936647,
        //        "premium": 9.1,
        //        "volume": 6899673.0,
        //        "tag": "semiannual",
        //        "pair": "ETH:USD",
        //        "dtm": 141,
        //        "maturityTime": 1624633200000,
        //        "volumeQuote": 6899673.0
        //    }
        //
        const marketId = this.safeString(ticker, 'product_id');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.parse8601(this.safeString(ticker, 'lastTime'));
        const last = this.safeString(ticker, 'last');
        return this.safeTicker({
            'info': ticker,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString(ticker, 'bid'),
            'bidVolume': this.safeString(ticker, 'bid_size'),
            'ask': this.safeString(ticker, 'ask'),
            'askVolume': this.safeString(ticker, 'ask_size'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString(ticker, 'change'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'volume'),
            'quoteVolume': this.safeString(ticker, 'volumeQuote'),
            'markPrice': this.safeString(ticker, 'markPrice'),
            'indexPrice': this.safeString(ticker, 'index'),
        });
    }
    handleOrderBookSnapshot(client, message) {
        //
        //    {
        //        "feed": "book_snapshot",
        //        "product_id": "PI_XBTUSD",
        //        "timestamp": 1612269825817,
        //        "seq": 326072249,
        //        "tickSize": null,
        //        "bids": [
        //            {
        //                "price": 34892.5,
        //                "qty": 6385
        //            },
        //            {
        //                "price": 34892,
        //                "qty": 10924
        //            },
        //        ],
        //        "asks": [
        //            {
        //                "price": 34911.5,
        //                "qty": 20598
        //            },
        //            {
        //                "price": 34912,
        //                "qty": 2300
        //            },
        //        ]
        //    }
        //
        const marketId = this.safeString(message, 'product_id');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const messageHash = this.getMessageHash('orderbook', undefined, symbol);
        const subscription = this.safeDict(client.subscriptions, messageHash, {});
        const limit = this.safeInteger(subscription, 'limit');
        const timestamp = this.safeInteger(message, 'timestamp');
        this.orderbooks[symbol] = this.orderBook({}, limit);
        const orderbook = this.orderbooks[symbol];
        const bids = this.safeList(message, 'bids');
        const asks = this.safeList(message, 'asks');
        for (let i = 0; i < bids.length; i++) {
            const bid = bids[i];
            const price = this.safeNumber(bid, 'price');
            const qty = this.safeNumber(bid, 'qty');
            const bidsSide = orderbook['bids'];
            bidsSide.store(price, qty);
        }
        for (let i = 0; i < asks.length; i++) {
            const ask = asks[i];
            const price = this.safeNumber(ask, 'price');
            const qty = this.safeNumber(ask, 'qty');
            const asksSide = orderbook['asks'];
            asksSide.store(price, qty);
        }
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        orderbook['symbol'] = symbol;
        client.resolve(orderbook, messageHash);
    }
    handleOrderBook(client, message) {
        //
        //    {
        //        "feed": "book",
        //        "product_id": "PI_XBTUSD",
        //        "side": "sell",
        //        "seq": 326094134,
        //        "price": 34981,
        //        "qty": 0,
        //        "timestamp": 1612269953629
        //    }
        //
        const marketId = this.safeString(message, 'product_id');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const messageHash = this.getMessageHash('orderbook', undefined, symbol);
        const orderbook = this.orderbooks[symbol];
        const side = this.safeString(message, 'side');
        const price = this.safeNumber(message, 'price');
        const qty = this.safeNumber(message, 'qty');
        const timestamp = this.safeInteger(message, 'timestamp');
        if (side === 'sell') {
            const asks = orderbook['asks'];
            asks.store(price, qty);
        }
        else {
            const bids = orderbook['bids'];
            bids.store(price, qty);
        }
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        client.resolve(orderbook, messageHash);
    }
    handleBalance(client, message) {
        //
        // snapshot
        //
        //    {
        //        "feed": "balances_snapshot",
        //        "account": "4a012c31-df95-484a-9473-d51e4a0c4ae7",
        //        "holding": {
        //            "USDT": 4997.5012493753,
        //            "XBT": 0.1285407184,
        //            ...
        //        },
        //        "futures": {
        //            "F-ETH:EUR": {
        //                "name": "F-ETH:EUR",
        //                "pair": "ETH/EUR",
        //                "unit": "EUR",
        //                "portfolio_value": 0.0,
        //                "balance": 0.0,
        //                "maintenance_margin": 0.0,
        //                "initial_margin": 0.0,
        //                "available": 0.0,
        //                "unrealized_funding": 0.0,
        //                "pnl": 0.0
        //            },
        //            ...
        //        },
        //        "flex_futures": {
        //            "currencies": {
        //                "USDT": {
        //                    "quantity": 0.0,
        //                    "value": 0.0,
        //                    "collateral_value": 0.0,
        //                    "available": 0.0,
        //                    "haircut": 0.0,
        //                    "conversion_spread": 0.0
        //                },
        //                ...
        //            },
        //            "balance_value":0.0,
        //            "portfolio_value":0.0,
        //            "collateral_value":0.0,
        //            "initial_margin":0.0,
        //            "initial_margin_without_orders":0.0,
        //            "maintenance_margin":0.0,
        //            "pnl":0.0,
        //            "unrealized_funding":0.0,
        //            "total_unrealized":0.0,
        //            "total_unrealized_as_margin":0.0,
        //            "margin_equity":0.0,
        //            "available_margin":0.0
        //            "isolated":{
        //            },
        //            "cross":{
        //                "balance_value":9963.66,
        //                "portfolio_value":9963.66,
        //                "collateral_value":9963.66,
        //                "initial_margin":0.0,
        //                "initial_margin_without_orders":0.0,
        //                "maintenance_margin":0.0,
        //                "pnl":0.0,
        //                "unrealized_funding":0.0,
        //                "total_unrealized":0.0,
        //                "total_unrealized_as_margin":0.0,
        //                "margin_equity":9963.66,
        //                "available_margin":9963.66,
        //                "effective_leverage":0.0
        //            },
        //        },
        //        "timestamp":1640995200000,
        //        "seq":0
        //    }
        //
        // update
        //
        //    Holding Wallet
        //
        //    {
        //        "feed": "balances",
        //        "account": "7a641082-55c7-4411-a85f-930ec2e09617",
        //        "holding": {
        //            "USD": 5000.0
        //        },
        //        "futures": {},
        //        "timestamp": 1640995200000,
        //        "seq": 83
        //    }
        //
        //    Multi-Collateral
        //
        //    {
        //        "feed": "balances"
        //        "account": "7a641082-55c7-4411-a85f-930ec2e09617"
        //        "flex_futures": {
        //            "currencies": {
        //                "USDT": {
        //                    "quantity": 0.0,
        //                    "value": 0.0,
        //                    "collateral_value": 0.0,
        //                    "available": 0.0,
        //                    "haircut": 0.0,
        //                    "conversion_spread": 0.0
        //                },
        //                ...
        //            },
        //            "balance_value": 5000.0,
        //            "portfolio_value": 5000.0,
        //            "collateral_value": 5000.0,
        //            "initial_margin": 0.0,
        //            "initial_margin_without_orders": 0.0,
        //            "maintenance_margin": 0.0,
        //            "pnl": 0.0,
        //            "unrealized_funding": 0.0,
        //            "total_unrealized": 0.0,
        //            "total_unrealized_as_margin": 0.0,
        //            "margin_equity": 5000.0,
        //            "available_margin": 5000.0
        //        },
        //        "timestamp": 1640995200000,
        //        "seq": 1
        //    }
        //
        //    Sample Single-Collateral Balance Delta
        //
        //    {
        //        "feed": "balances",
        //        "account": "7a641082-55c7-4411-a85f-930ec2e09617",
        //        "holding": {},
        //        "futures": {
        //            "F-XBT:USD": {
        //                "name": "F-XBT:USD",
        //                "pair": "XBT/USD",
        //                "unit": "XBT",
        //                "portfolio_value": 0.1219368845,
        //                "balance": 0.1219368845,
        //                "maintenance_margin": 0.0,
        //                "initial_margin": 0.0,
        //                "available": 0.1219368845,
        //                "unrealized_funding": 0.0,
        //                "pnl": 0.0
        //            }
        //        },
        //        "timestamp": 1640995200000,
        //        "seq": 2
        //    }
        //
        const holding = this.safeValue(message, 'holding');
        const futures = this.safeValue(message, 'futures');
        const flexFutures = this.safeValue(message, 'flex_futures');
        const messageHash = 'balances';
        const timestamp = this.safeInteger(message, 'timestamp');
        if (holding !== undefined) {
            const holdingKeys = Object.keys(holding); // cashAccount
            const holdingResult = {
                'info': message,
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            };
            for (let i = 0; i < holdingKeys.length; i++) {
                const key = holdingKeys[i];
                const code = this.safeCurrencyCode(key);
                const newAccount = this.account();
                newAccount['total'] = this.safeString(holding, key);
                holdingResult[code] = newAccount;
            }
            this.balance['cash'] = holdingResult;
            this.balance['cash'] = this.safeBalance(this.balance['cash']);
            client.resolve(holdingResult, messageHash);
        }
        if (futures !== undefined) {
            const futuresKeys = Object.keys(futures); // marginAccount
            const futuresResult = {
                'info': message,
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            };
            for (let i = 0; i < futuresKeys.length; i++) {
                const key = futuresKeys[i];
                const symbol = this.safeSymbol(key);
                const newAccount = this.account();
                const future = this.safeValue(futures, key);
                const currencyId = this.safeString(future, 'unit');
                const code = this.safeCurrencyCode(currencyId);
                newAccount['free'] = this.safeString(future, 'available');
                newAccount['used'] = this.safeString(future, 'initial_margin');
                newAccount['total'] = this.safeString(future, 'balance');
                futuresResult[symbol] = {};
                futuresResult[symbol][code] = newAccount;
            }
            this.balance['margin'] = futuresResult;
            this.balance['margin'] = this.safeBalance(this.balance['margin']);
            client.resolve(this.balance['margin'], messageHash + 'futures');
        }
        if (flexFutures !== undefined) {
            const flexFutureCurrencies = this.safeValue(flexFutures, 'currencies', {});
            const flexFuturesKeys = Object.keys(flexFutureCurrencies); // multi-collateral margin account
            const flexFuturesResult = {
                'info': message,
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            };
            for (let i = 0; i < flexFuturesKeys.length; i++) {
                const key = flexFuturesKeys[i];
                const flexFuture = this.safeValue(flexFutureCurrencies, key);
                const code = this.safeCurrencyCode(key);
                const newAccount = this.account();
                newAccount['free'] = this.safeString(flexFuture, 'available');
                newAccount['used'] = this.safeString(flexFuture, 'collateral_value');
                newAccount['total'] = this.safeString(flexFuture, 'quantity');
                flexFuturesResult[code] = newAccount;
            }
            this.balance['flex'] = flexFuturesResult;
            this.balance['flex'] = this.safeBalance(this.balance['flex']);
            client.resolve(this.balance['flex'], messageHash + 'flex_futures');
        }
        client.resolve(this.balance, messageHash);
    }
    handleMyTrades(client, message) {
        //
        //    {
        //        "feed": "fills_snapshot",
        //        "account": "DemoUser",
        //        "fills": [
        //            {
        //                "instrument": "FI_XBTUSD_200925",
        //                "time": 1600256910739,
        //                "price": 10937.5,
        //                "seq": 36,
        //                "buy": true,
        //                "qty": 5000.0,
        //                "order_id": "9e30258b-5a98-4002-968a-5b0e149bcfbf",
        //                "cli_ord_id": "8b58d9da-fcaf-4f60-91bc-9973a3eba48d", // only on update, not on snapshot
        //                "fill_id": "cad76f07-814e-4dc6-8478-7867407b6bff",
        //                "fill_type": "maker",
        //                "fee_paid": -0.00009142857,
        //                "fee_currency": "BTC",
        //                "taker_order_type": "ioc",
        //                "order_type": "limit"
        //            },
        //            ...
        //        ]
        //    }
        //
        const trades = this.safeValue(message, 'fills', []);
        let stored = this.myTrades;
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCacheBySymbolById(limit);
            this.myTrades = stored;
        }
        const tradeSymbols = {};
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const parsedTrade = this.parseWsMyTrade(trade);
            tradeSymbols[parsedTrade['symbol']] = true;
            stored.append(parsedTrade);
        }
        const tradeSymbolKeys = Object.keys(tradeSymbols);
        for (let i = 0; i < tradeSymbolKeys.length; i++) {
            const symbol = tradeSymbolKeys[i];
            const messageHash = 'myTrades:' + symbol;
            client.resolve(stored, messageHash);
        }
        client.resolve(stored, 'myTrades');
    }
    parseWsMyTrade(trade, market = undefined) {
        //
        //    {
        //        "instrument": "FI_XBTUSD_200925",
        //        "time": 1600256910739,
        //        "price": 10937.5,
        //        "seq": 36,
        //        "buy": true,
        //        "qty": 5000.0,
        //        "order_id": "9e30258b-5a98-4002-968a-5b0e149bcfbf",
        //        "cli_ord_id": "8b58d9da-fcaf-4f60-91bc-9973a3eba48d", // only on update, not on snapshot
        //        "fill_id": "cad76f07-814e-4dc6-8478-7867407b6bff",
        //        "fill_type": "maker",
        //        "fee_paid": -0.00009142857,
        //        "fee_currency": "BTC",
        //        "taker_order_type": "ioc",
        //        "order_type": "limit"
        //    }
        //
        const timestamp = this.safeInteger(trade, 'time');
        const marketId = this.safeString(trade, 'instrument');
        market = this.safeMarket(marketId, market);
        const isBuy = this.safeValue(trade, 'buy');
        const feeCurrencyId = this.safeString(trade, 'fee_currency');
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'fill_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': this.safeString(market, 'symbol'),
            'order': this.safeString(trade, 'order_id'),
            'type': this.safeString(trade, 'type'),
            'side': isBuy ? 'buy' : 'sell',
            'takerOrMaker': this.safeString(trade, 'fill_type'),
            'price': this.safeString(trade, 'price'),
            'amount': this.safeString(trade, 'qty'),
            'cost': undefined,
            'fee': {
                'currency': this.safeCurrencyCode(feeCurrencyId),
                'cost': this.safeString(trade, 'fee_paid'),
                'rate': undefined,
            },
        });
    }
    async watchMultiHelper(unifiedName, channelName, symbols = undefined, subscriptionArgs = undefined, params = {}) {
        await this.loadMarkets();
        // symbols are required
        symbols = this.marketSymbols(symbols, undefined, false, true, false);
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            messageHashes.push(this.getMessageHash(unifiedName, undefined, this.symbol(symbols[i])));
        }
        const marketIds = this.marketIds(symbols);
        const request = {
            'event': 'subscribe',
            'feed': channelName,
            'product_ids': marketIds,
        };
        const url = this.urls['api']['ws'];
        return await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes, subscriptionArgs);
    }
    getMessageHash(unifiedElementName, subChannelName = undefined, symbol = undefined) {
        // unifiedElementName can be : orderbook, trade, ticker, bidask ...
        // subChannelName only applies to channel that needs specific variation (i.e. depth_50, depth_100..) to be selected
        const withSymbol = symbol !== undefined;
        let messageHash = unifiedElementName;
        if (!withSymbol) {
            messageHash += 's';
        }
        else {
            messageHash += ':' + symbol;
        }
        if (subChannelName !== undefined) {
            messageHash += '#' + subChannelName;
        }
        return messageHash;
    }
    handleErrorMessage(client, message) {
        //
        //    {
        //        event: 'alert',
        //        message: 'Failed to subscribe to authenticated feed'
        //    }
        //
        const errMsg = this.safeString(message, 'message');
        try {
            throw new errors.ExchangeError(this.id + ' ' + errMsg);
        }
        catch (error) {
            client.reject(error);
        }
    }
    handleMessage(client, message) {
        const event = this.safeString(message, 'event');
        if (event === 'challenge') {
            this.handleAuthenticate(client, message);
        }
        else if (event === 'alert') {
            this.handleErrorMessage(client, message);
        }
        else if (event === 'pong') {
            client.lastPong = this.milliseconds();
        }
        else if (event === undefined) {
            const feed = this.safeString(message, 'feed');
            const methods = {
                'ticker': this.handleTicker,
                'ticker_lite': this.handleBidAsk,
                'trade': this.handleTrade,
                'trade_snapshot': this.handleTrade,
                // 'heartbeat': this.handleStatus,
                'book': this.handleOrderBook,
                'book_snapshot': this.handleOrderBookSnapshot,
                'open_orders_verbose': this.handleOrder,
                'open_orders_verbose_snapshot': this.handleOrderSnapshot,
                'fills': this.handleMyTrades,
                'fills_snapshot': this.handleMyTrades,
                'open_orders': this.handleOrder,
                'open_orders_snapshot': this.handleOrderSnapshot,
                'balances': this.handleBalance,
                'balances_snapshot': this.handleBalance,
                'open_positions': this.handlePositions,
            };
            const method = this.safeValue(methods, feed);
            if (method !== undefined) {
                method.call(this, client, message);
            }
        }
    }
    handleAuthenticate(client, message) {
        /**
         * @ignore
         * @method
         * @see https://docs.futures.kraken.com/#websocket-api-websocket-api-introduction-sign-challenge-challenge
         */
        //
        //    {
        //        "event": "challenge",
        //        "message": "226aee50-88fc-4618-a42a-34f7709570b2"
        //    }
        //
        const event = this.safeValue(message, 'event');
        const messageHash = 'challenge';
        if (event !== 'error') {
            const challenge = this.safeValue(message, 'message');
            const hashedChallenge = this.hash(this.encode(challenge), sha256.sha256, 'binary');
            const base64Secret = this.base64ToBinary(this.secret);
            const signature = this.hmac(hashedChallenge, base64Secret, sha512.sha512, 'base64');
            this.options['challenge'] = challenge;
            this.options['signedChallenge'] = signature;
            const future = this.safeValue(client.futures, messageHash);
            future.resolve(true);
        }
        else {
            const error = new errors.AuthenticationError(this.id + ' ' + this.json(message));
            client.reject(error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
        return message;
    }
}

module.exports = krakenfutures;
