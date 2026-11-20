// ---------------------------------------------------------------------------

import reyaRest from '../reya.js';
import { ArgumentsRequired, BadRequest, ExchangeError, NetworkError, NotSupported, RateLimitExceeded } from '../base/errors.js';
import { ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';
import type { Balances, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Trade } from '../base/types.js';
import type { WsOrderBook } from '../base/ws/OrderBook.js';

export default class reya extends reyaRest {
    override describe (): Dict {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'cancelAllOrdersWs': true,
                'cancelOrderWs': true,
                'createOrderWs': true,
                'editOrderWs': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTrades': true,
            },
            'urls': {
                // public: the market and wallet streams; exec: order entry, with the request bodies and signatures of REST
                'api': {
                    'ws': {
                        'public': 'wss://ws.reya.xyz',
                        'exec': 'wss://ws-exec.reya.xyz',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://websocket-devnet.reya-cronos.network',
                        'exec': 'wss://ws-exec-devnet.reya-cronos.network',
                    },
                },
            },
            'options': { 'tradesLimit': 1000, 'ordersLimit': 1000, 'OHLCVLimit': 1000 },
            'streaming': { 'keepAlive': 15000 },
            'exceptions': {
                'exact': {
                    // order-entry framing errors
                    'MALFORMED_JSON': BadRequest,
                    'UNKNOWN_TYPE': BadRequest,
                    'DUPLICATE_REQUEST_ID': BadRequest,
                    'TOO_MANY_INFLIGHT': RateLimitExceeded,
                    'SERVER_SHUTTING_DOWN': NetworkError,
                    'INTERNAL': ExchangeError,
                },
            },
        });
    }

    /** @ignore */
    override ping (client: Client): Dict {
        return { 'type': 'ping' };
    }

    /** @ignore */
    async subscribeReyaChannel (channel: string, params: Dict = {}, messageHash: Str = undefined): Promise<any> {
        const url = this.urls['api']['ws']['public'];
        const request = this.extend (params, { 'type': 'subscribe', 'channel': channel });
        const hash = (messageHash === undefined) ? channel : messageHash;
        return await this.watch (url, hash, request, channel);
    }

    /** @ignore */
    reyaWalletChannel (resource: string, params: Dict = {}, marketType: Str = undefined): string {
        // wallet channels are public reads keyed by the owner address; they stream the configured account of the
        // market type: options.accountId for perpetuals, options.spotAccountId for spot
        const optionKey = (marketType === 'spot') ? 'spotAccountId' : 'accountId';
        const accountId = this.numberToString (this.reyaAccountId (params, marketType));
        if (accountId !== this.safeString (this.options, optionKey)) {
            throw new NotSupported (this.id + ' watch methods stream options.' + optionKey + '; set options.' + optionKey + ' to ' + accountId);
        }
        const address = this.reyaWalletAddress ();
        return '/v2/wallet/' + address.toLowerCase () + '/' + resource;
    }

    /** @ignore */
    reyaStreamAccounts (): Dict {
        // the configured accounts whose orders and fills the wallet channels deliver to the watchers
        const accounts: Dict = {};
        const perpAccount = this.safeString (this.options, 'accountId');
        const spotAccount = this.safeString (this.options, 'spotAccountId');
        if (perpAccount !== undefined) {
            accounts[perpAccount] = true;
        }
        if (spotAccount !== undefined) {
            accounts[spotAccount] = true;
        }
        return accounts;
    }

    /**
     * @method
     * @name reya#watchOrderBook
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch the bounded top-100 order book; each connection starts with a fresh snapshot
     * @param {string} symbol unified market symbol
     * @param {int} [limit] the supported subscription depth is 100
     * @param {object} [params] extra subscription parameters
     * @returns {object} an order book structure
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        if (limit !== undefined && limit !== 100) {
            throw new BadRequest (this.id + ' watchOrderBook supports a fixed depth of 100');
        }
        const market = this.market (symbol);
        const channel = '/v2/market/' + market['id'] + '/depth';
        const request = this.extend (params, { 'type': 'subscribe', 'channel': channel });
        const orderbook: WsOrderBook = await this.watch (this.urls['api']['ws']['public'], channel, request, channel);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name reya#watchTicker
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch market statistics: mark and index prices for a perpetual, the oracle price for spot
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra subscription parameters
     * @returns {object} a ticker structure
     */
    override async watchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const kind = (market['spot']) ? 'spotMarket' : 'perpMarket';
        return await this.subscribeReyaChannel ('/v2/' + kind + '/' + market['id'] + '/summary', params);
    }

    /**
     * @method
     * @name reya#watchTrades
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch settled public executions
     * @param {string} symbol unified market symbol
     * @param {int} [since] earliest timestamp in milliseconds
     * @param {int} [limit] maximum trades
     * @param {object} [params] extra subscription parameters
     * @returns {object[]} trade structures
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resource = (market['spot']) ? 'spotExecutions' : 'perpExecutions';
        const trades = await this.subscribeReyaChannel ('/v2/market/' + market['id'] + '/' + resource, params);
        let tradeLimit = limit;
        if (this.newUpdates) {
            tradeLimit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (trades, since, tradeLimit, 'timestamp', true);
    }

    /**
     * @method
     * @name reya#watchOHLCV
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch the newest candle as it forms; the stream carries merged candles (fill prices, else the mark price), the series fetchOHLCV returns with params.priceSource = 'merged'
     * @param {string} symbol unified market symbol
     * @param {string} [timeframe] candle interval
     * @param {int} [since] earliest candle timestamp in milliseconds
     * @param {int} [limit] maximum candles
     * @param {object} [params] extra subscription parameters
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resolution = this.safeString (this.timeframes, timeframe, timeframe);
        const ohlcv = await this.subscribeReyaChannel ('/v2/candles/' + market['id'] + '/' + resolution, params);
        let limitResolved = limit;
        if (this.newUpdates) {
            limitResolved = ohlcv.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limitResolved, 0, true);
    }

    /**
     * @method
     * @name reya#watchBalance
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch the rUSD margin of the account in options.accountId, in the structure fetchBalance returns; the subscription is refused while Reya cannot value the account, and a later call subscribes again. With params.type spot, watch the balances of the SPOT account in options.spotAccountId, each all free
     * @param {object} [params] extra subscription parameters
     * @param {string} [params.type] swap (default) or spot
     * @param {int} [params.accountId] must equal options.accountId, or options.spotAccountId for spot
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    override async watchBalance (params: Dict = {}): Promise<Balances> {
        await this.loadMarkets ();
        const [ marketType, query ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        const resource = (marketType === 'spot') ? 'accountBalances' : 'accountSummaries';
        const channel = this.reyaWalletChannel (resource, query, marketType);
        return await this.subscribeReyaChannel (channel, this.omit (query, 'accountId'));
    }

    /**
     * @method
     * @name reya#watchPositions
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch the valued open positions of the account in options.accountId; each update returns all of its open positions, in the structure fetchPositions returns
     * @param {string[]} [symbols] unified market symbols
     * @param {int} [since] earliest valuation timestamp in milliseconds
     * @param {int} [limit] maximum positions
     * @param {object} [params] extra subscription parameters
     * @param {int} [params.accountId] must equal options.accountId
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    override async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const marketSymbols = this.marketSymbols (symbols);
        const channel = this.reyaWalletChannel ('positionRisk', params);
        const positions = await this.subscribeReyaChannel (channel, this.omit (params, 'accountId'));
        return this.filterBySymbolsSinceLimit (positions, marketSymbols, since, limit, true);
    }

    /**
     * @method
     * @name reya#watchOrders
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch the orders of the configured accounts (options.accountId and options.spotAccountId), starting with their open orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] earliest order timestamp in milliseconds
     * @param {int} [limit] maximum orders
     * @param {object} [params] extra subscription parameters
     * @param {int} [params.accountId] must equal the configured account of the market's type
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        const channel = this.reyaWalletChannel ('orderChanges', query, marketType);
        const symbolResolved = (market === undefined) ? undefined : market['symbol'];
        const messageHash = (symbolResolved === undefined) ? channel : channel + '::' + symbolResolved;
        const orders = await this.subscribeReyaChannel (channel, this.omit (query, 'accountId'), messageHash);
        let limitResolved = limit;
        if (this.newUpdates) {
            limitResolved = orders.getLimit (symbolResolved, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbolResolved, since, limitResolved, true);
    }

    /**
     * @method
     * @name reya#watchMyTrades
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch the settled executions of the account of the market's type, as fetchMyTrades returns them: perpetual fills of options.accountId, or spot fills of options.spotAccountId
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] earliest trade timestamp in milliseconds
     * @param {int} [limit] maximum trades
     * @param {object} [params] extra subscription parameters
     * @param {string} [params.type] swap or spot without a symbol, defaults to options.defaultType
     * @param {int} [params.accountId] must equal the configured account of the market's type
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('watchMyTrades', market, params);
        const resource = (marketType === 'spot') ? 'spotExecutions' : 'perpExecutions';
        const channel = this.reyaWalletChannel (resource, query, marketType);
        const symbolResolved = (market === undefined) ? undefined : market['symbol'];
        const messageHash = (symbolResolved === undefined) ? channel : channel + '::' + symbolResolved;
        const trades = await this.subscribeReyaChannel (channel, this.omit (query, 'accountId'), messageHash);
        let limitResolved = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (symbolResolved, limit);
        }
        const result = this.filterBySymbolSinceLimit (trades, symbolResolved, since, limitResolved, true);
        if (symbolResolved !== undefined) {
            return result;
        }
        // perpetual and spot fills share the cache: keep the fills of this channel's market type
        const typed = [];
        const resultLength = result.length;
        for (let i = 0; i < resultLength; i++) {
            const tradeMarket = this.safeDict (this.markets, result[i]['symbol']);
            if (this.safeString (tradeMarket, 'type') === marketType) {
                typed.push (result[i]);
            }
        }
        return typed;
    }

    /** @ignore */
    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        return [
            this.safeTimestamp (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    /** @ignore */
    handleOHLCV (client: Client, channel: string, data: any) {
        // channel: /v2/candles/{symbol}/{resolution}
        const parts = channel.split ('/');
        const market = this.safeMarket (this.safeString (parts, 3));
        const symbol = market['symbol'];
        const timeframe = this.findTimeframe (this.safeString (parts, 4));
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!((timeframe as string) in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][(timeframe as string)] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][(timeframe as string)];
        // candles arrive in ascending t; a candle replaces the stored one with the same t
        const rows = (Array.isArray (data)) ? data : this.safeList (data, 'data', []);
        for (let i = 0; i < rows.length; i++) {
            stored.append (this.parseOHLCV (rows[i], market));
        }
        client.resolve (stored, channel);
    }

    /** @ignore */
    handleBalance (client: Client, channel: string, data: any) {
        // a frame carries only the accounts that were recalculated
        const rows = (Array.isArray (data)) ? data : this.safeList (data, 'data', []);
        const account = this.numberToString (this.reyaAccountId ());
        for (let i = 0; i < rows.length; i++) {
            const summary = rows[i];
            if (this.safeString (summary, 'accountId') === account) {
                const timestamp = this.safeInteger (summary, 'updatedAt');
                const result: Dict = {
                    'info': summary,
                    'RUSD': this.parseReyaMargin (summary),
                    'timestamp': timestamp,
                    'datetime': this.iso8601 (timestamp),
                };
                client.resolve (this.safeBalance (result), channel);
            }
        }
    }

    /** @ignore */
    handleSpotBalance (client: Client, channel: string, data: any) {
        // realized balances of the SPOT account; resting spot orders reserve nothing, so each balance is all free
        const rows = (Array.isArray (data)) ? data : this.safeList (data, 'data', []);
        const account = this.safeString (this.options, 'spotAccountId');
        let changed = false;
        for (let i = 0; i < rows.length; i++) {
            const entry = rows[i];
            const code = this.safeCurrencyCode (this.safeString (entry, 'asset'));
            if ((this.safeString (entry, 'accountId') === account) && (code !== undefined)) {
                const realBalance = this.safeString (entry, 'realBalance');
                const balance = this.account ();
                balance['total'] = realBalance;
                balance['free'] = realBalance;
                balance['used'] = '0';
                this.balance[code] = balance;
                changed = true;
            }
        }
        if (changed) {
            this.balance['info'] = rows;
            this.balance = this.safeBalance (this.balance);
            client.resolve (this.balance, channel);
        }
    }

    /** @ignore */
    handlePositions (client: Client, channel: string, message: Dict, data: any) {
        // the snapshot holds every account's rows; each live frame replaces the rows of one account
        const account = this.numberToString (this.reyaAccountId ());
        const frameAccount = this.safeString (message, 'accountId');
        if (frameAccount !== undefined && frameAccount !== account) {
            return;
        }
        const rows = (Array.isArray (data)) ? data : this.safeList (data, 'data', []);
        const positions = [];
        for (let i = 0; i < rows.length; i++) {
            if (this.safeString (rows[i], 'accountId') === account) {
                positions.push (this.parsePosition (rows[i]));
            }
        }
        client.resolve (positions, channel);
    }

    /** @ignore */
    handleOrders (client: Client, channel: string, data: any) {
        // the snapshot holds the open orders; updates carry every later order event, in order
        const rows = (Array.isArray (data)) ? data : this.safeList (data, 'data', []);
        const accounts = this.reyaStreamAccounts ();
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.orders;
        const symbols: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            // a FEED_RESET row asks to rebuild the order view; it does not mean the order was cancelled
            if (this.safeBool (accounts, this.safeString (row, 'accountId'), false) && (this.safeString (row, 'cancelReason') !== 'FEED_RESET')) {
                const order = this.parseOrder (row);
                stored.append (order);
                const symbol = order['symbol'];
                if (symbol !== undefined) {
                    symbols[symbol] = true;
                }
            }
        }
        const changed = Object.keys (symbols);
        this.resolveReyaBySymbol (client, channel, stored, changed);
    }

    /** @ignore */
    resolveReyaBySymbol (client: Client, channel: string, stored: any, symbols: string[]) {
        // resolve only when the account's rows changed: for every market, and for each market that changed
        const symbolsLength = symbols.length;
        if (symbolsLength > 0) {
            client.resolve (stored, channel);
            for (let i = 0; i < symbolsLength; i++) {
                client.resolve (stored, channel + '::' + symbols[i]);
            }
        }
    }

    /** @ignore */
    handleMyTrades (client: Client, channel: string, data: any) {
        const rows = (Array.isArray (data)) ? data : this.safeList (data, 'data', []);
        const accounts = this.reyaStreamAccounts ();
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.myTrades;
        const symbols: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const taker = this.safeString (row, 'takerAccountId');
            const maker = this.safeString (row, 'makerAccountId');
            let own = undefined;
            if (this.safeBool (accounts, taker, false)) {
                own = taker;
            } else if (this.safeBool (accounts, maker, false)) {
                own = maker;
            }
            if (own !== undefined) {
                const trade = this.parseReyaTrade (row, undefined, own);
                stored.append (trade);
                const symbol = trade['symbol'];
                if (symbol !== undefined) {
                    symbols[symbol] = true;
                }
            }
        }
        const changed = Object.keys (symbols);
        this.resolveReyaBySymbol (client, channel, stored, changed);
    }

    /** @ignore */
    handleOrderBook (client: Client, channel: string, data: Dict) {
        const symbol = this.safeSymbol (this.safeString (data, 'symbol'));
        const snapshot = this.safeString (data, 'type') === 'SNAPSHOT';
        if (!(symbol in this.orderbooks)) {
            if (!snapshot) {
                return;
            }
            this.orderbooks[symbol] = this.orderBook ({}, 100);
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.safeInteger (data, 'updatedAt');
        if (snapshot) {
            orderbook.reset (this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'px', 'qty'));
        } else {
            this.handleReyaDeltas (orderbook['bids'], this.safeList (data, 'bids', []));
            this.handleReyaDeltas (orderbook['asks'], this.safeList (data, 'asks', []));
            // updatedAt is not a sequence: different updates may share a millisecond.
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        client.resolve (orderbook, channel);
    }

    /** @ignore */
    handleReyaDeltas (bookSide: any, levels: any[]) {
        for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            bookSide.store (this.safeNumber (level, 'px'), this.safeNumber (level, 'qty'));
        }
    }

    /** @ignore */
    handleTrades (client: Client, channel: string, data: any) {
        const rows = (Array.isArray (data)) ? data : this.safeList (data, 'data', []);
        const symbols: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const trade = this.parseTrade (rows[i]);
            const symbol = trade['symbol'];
            if (symbol === undefined) {
                continue;
            }
            if (!(symbol in this.trades)) {
                const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                this.trades[symbol] = new ArrayCacheBySymbolById (tradesLimit);
            }
            const stored = this.trades[symbol];
            stored.append (trade);
            symbols[symbol] = true;
        }
        const keys = Object.keys (symbols);
        for (let i = 0; i < keys.length; i++) {
            client.resolve (this.trades[keys[i]], channel);
        }
    }

    /** @ignore */
    handleExecResponse (client: Client, message: Dict) {
        // an order-entry reply carries ok with the operation's REST response or its REST error
        const requestId = this.safeString (message, 'id');
        if (this.safeBool (message, 'ok') === true) {
            client.resolve (this.safeDict (message, 'payload', {}), requestId);
        } else {
            this.rejectReyaExecError (client, this.safeDict (message, 'error', {}), requestId);
        }
        this.clearReyaExecRequest (client, requestId);
    }

    /** @ignore */
    clearReyaExecRequest (client: Client, requestId: Str) {
        if ((requestId !== undefined) && (requestId in client.subscriptions)) {
            delete client.subscriptions[requestId];
        }
    }

    /** @ignore */
    rejectReyaExecError (client: Client, error: Dict, requestId: Str) {
        const code = this.safeString (error, 'error');
        const feedback = this.id + ' ' + this.json (error);
        try {
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            throw new ExchangeError (feedback);
        } catch (e) {
            if (requestId === undefined) {
                // the server could not tell which request failed: none of the requests in flight has a known outcome
                client.reject (e);
            } else {
                client.reject (e, requestId);
            }
        }
        this.clearReyaExecRequest (client, requestId);
    }

    /** @ignore */
    async reyaExecRequest (operation: string, request: Dict): Promise<Dict> {
        const url = this.urls['api']['ws']['exec'];
        const signed = this.reyaSignPayload (operation, this.extend ({}, request));
        // a signed request carries a fresh nonce, so the nonce also correlates the reply
        const requestId = this.safeString (signed, 'nonce');
        const message: Dict = { 'type': operation, 'id': requestId, 'payload': signed };
        const response = await this.watch (url, requestId, message, requestId);
        return response;
    }

    /**
     * @method
     * @name reya#createOrderWs
     * @description create a perpetual or spot order over the order-entry WebSocket, with the request and signature of createOrder
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-exec-v2.yaml
     * @param {string} symbol unified market symbol
     * @param {string} type limit or market
     * @param {string} side buy or sell
     * @param {float} amount quantity in base units
     * @param {float} [price] limit price, or worst execution price for a market order
     * @param {object} [params] the parameters of createOrder
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const market = this.market (symbol);
        const request = await this.reyaCreateOrderRequest (symbol, type, side, amount, price, params);
        const response = await this.reyaExecRequest ('createOrder', request);
        const parsed = this.parseOrder (this.reyaMergeOrderResponse (request, response), market);
        parsed['type'] = type;
        return parsed;
    }

    /**
     * @method
     * @name reya#editOrderWs
     * @description modify a resting limit order in place over the order-entry WebSocket, with the request and signature of editOrder
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-exec-v2.yaml
     * @param {string} id exchange order id, or an empty string to target params.clientOrderId
     * @param {string} symbol unified market symbol
     * @param {string} type 'limit'
     * @param {string} side 'buy' or 'sell'; it must match the resting order
     * @param {float} [amount] new total quantity, including any part already filled
     * @param {float} [price] new limit price
     * @param {object} [params] the parameters of editOrder
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async editOrderWs (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const market = this.market (symbol);
        const built = await this.reyaEditOrderRequest (id, symbol, type, side, amount, price, params);
        const request: Dict = built['request'];
        const resting: Dict = built['resting'];
        const response = await this.reyaExecRequest ('modifyOrder', request);
        return this.parseOrder (this.reyaMergeOrderResponse (request, response, resting), market);
    }

    /**
     * @method
     * @name reya#cancelOrderWs
     * @description cancel an order over the order-entry WebSocket
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-exec-v2.yaml
     * @param {string} id exchange order id
     * @param {string} symbol unified market symbol
     * @param {object} [params] the parameters of cancelOrder
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async cancelOrderWs (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrderWs requires symbol');
        }
        const market = this.market (symbol);
        const request = this.reyaCancelOrderRequest (id, symbol, params);
        const response = await this.reyaExecRequest ('cancelOrder', request);
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name reya#cancelAllOrdersWs
     * @description cancel all orders of one account over the order-entry WebSocket, optionally restricted to a market
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-exec-v2.yaml
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] the parameters of cancelAllOrders
     * @returns {object[]} an order structure containing the raw cancellation count
     */
    override async cancelAllOrdersWs (symbol: Str = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        const request = this.reyaCancelAllOrdersRequest (symbol, params);
        const response = await this.reyaExecRequest ('cancelAll', request);
        return [ this.parseOrder (response, market) ];
    }

    /** @ignore */
    override handleMessage (client: Client, message: Dict) {
        const type = this.safeString (message, 'type');
        if (type === 'pong') {
            client.lastPong = this.milliseconds ();
            return;
        }
        if (this.safeBool (message, 'ok') !== undefined) {
            this.handleExecResponse (client, message);
            return;
        }
        const channel = this.safeString (message, 'channel');
        if (type === 'error') {
            const execError = this.safeDict (message, 'error');
            if (execError !== undefined) {
                // an order-entry framing error, for the request it names or, unparsed, for every request on the connection
                this.rejectReyaExecError (client, execError, this.safeString (message, 'id'));
                return;
            }
            if (channel === undefined) {
                client.reject (new ExchangeError (this.id + ' ' + this.safeString (message, 'message')));
                return;
            }
            // the server ends a subscription it cannot serve, such as a valuation channel while a required
            // price is stale (a NetworkError: retry after backing off); reject every watcher of the channel
            // and let the next watch call subscribe again
            const messageHashes = this.findMessageHashes (client, channel);
            for (let i = 0; i < messageHashes.length; i++) {
                if (channel.endsWith ('/accountSummaries') || channel.endsWith ('/positionRisk')) {
                    client.reject (new NetworkError (this.id + ' ' + this.safeString (message, 'message')), messageHashes[i]);
                } else {
                    client.reject (new ExchangeError (this.id + ' ' + this.safeString (message, 'message')), messageHashes[i]);
                }
            }
            if (channel in client.subscriptions) {
                delete client.subscriptions[channel];
            }
            return;
        }
        if (type === 'disconnectNotice') {
            // the order-entry socket stops taking requests closeInMs after the notice: retire its client so the next
            // request opens a new connection, while this one still settles the requests it carries. A stream
            // connection is closed by the server (code 1012) and the next watch call reconnects
            if (client.url === this.urls['api']['ws']['exec']) {
                delete this.clients[client.url];
            }
            return;
        }
        if (channel === undefined || (type !== 'subscribed' && type !== 'channel_data')) {
            return;
        }
        const data = this.safeValue (message, (type === 'subscribed') ? 'contents' : 'data');
        if (data === undefined) {
            return;
        }
        if (channel.startsWith ('/v2/wallet/')) {
            if (channel.endsWith ('/accountSummaries')) {
                this.handleBalance (client, channel, data);
            } else if (channel.endsWith ('/accountBalances')) {
                this.handleSpotBalance (client, channel, data);
            } else if (channel.endsWith ('/positionRisk')) {
                this.handlePositions (client, channel, message, data);
            } else if (channel.endsWith ('/orderChanges')) {
                this.handleOrders (client, channel, data);
            } else if (channel.endsWith ('/perpExecutions') || channel.endsWith ('/spotExecutions')) {
                this.handleMyTrades (client, channel, data);
            }
        } else if (channel.startsWith ('/v2/candles/')) {
            this.handleOHLCV (client, channel, data);
        } else if (channel.endsWith ('/depth')) {
            this.handleOrderBook (client, channel, data);
        } else if (channel.endsWith ('/summary')) {
            const ticker = this.parseTicker (data);
            const symbol = ticker['symbol'];
            if (symbol !== undefined) {
                this.tickers[symbol] = ticker;
            }
            client.resolve (ticker, channel);
        } else if (channel.endsWith ('/perpExecutions') || channel.endsWith ('/spotExecutions')) {
            this.handleTrades (client, channel, data);
        }
    }
}
