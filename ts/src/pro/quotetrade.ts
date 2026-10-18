// ---------------------------------------------------------------------------
import quotetradeRest from '../quotetrade.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { Precise } from '../base/Precise.js';
import { ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { AuthenticationError, ExchangeError, InvalidOrder, NotSupported, RequestTimeout } from '../base/errors.js';
import type { Balances, Dict, Int, Num, Order, OrderSide, OrderType, Position, Str, Strings, Ticker, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

export default class quotetrade extends quotetradeRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'pro': true,
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchOrderBook': false,
                'watchTrades': false,
                'watchBalance': true,
                'watchPositions': true,
                'watchOrders': true,
                'watchMyTrades': true,
                'createOrderWs': true,
                'fetchOrderWs': 'emulated',
                'cancelOrderWs': 'emulated',
            },
            'urls': { 'api': { 'ws': { 'public': 'wss://app.quote.trade/ws/liquidity', 'private': 'wss://app.quote.trade/ws/listenKey' }}},
            'options': { 'ordersLimit': 1000, 'tradesLimit': 1000, 'wsRequestId': 0, 'requestTimeout': 10000, 'orderSequences': {}},
            'streaming': { 'keepAlive': 20000 },
        });
    }

    /**
     * @method
     * @name quotetrade#watchTicker
     * @description Stream bid/ask quotes. Native depth quantities are cumulative size quotes.
     * @param {string} symbol unified market symbol
     * @param {object} params exchange-specific parameters
     * @returns {object} native response or unified result as documented
     */
    override async watchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const hash = 'ticker:' + market['symbol'];
        const request: Dict = { 'symbol': market['id'], 'unsubscribe': 0 };
        return await this.watch (this.urls['api']['ws']['public'], hash, request, hash);
    }

    /**
     * @method
     * @name quotetrade#watchLiquidity
     * @description Native cumulative liquidity, kept separate from CCXT marginal order books.
     * @param {object} params includes the unified symbol in params.symbol
     * @returns {object} native response or unified result as documented
     */
    async watchLiquidity (params: Dict = {}): Promise<Dict> {
        await this.loadMarkets ();
        const symbol = this.safeString (params, 'symbol');
        if (symbol === undefined) {
            throw new NotSupported (this.id + ' watchLiquidity requires params.symbol');
        }
        const market = this.market (symbol);
        const hash = 'liquidity:' + market['symbol'];
        const request: Dict = { 'symbol': market['id'], 'unsubscribe': 0 };
        return await this.watch (this.urls['api']['ws']['public'], hash, request, 'ticker:' + market['symbol']);
    }

    /** @ignore */
    // One private account per exchange instance; reauthenticate after reconnect.
    privateStreamRequest (params: Dict = {}): Dict {
        this.checkRequiredCredentials ();
        const configuredAccount = this.safeString (this.options, 'account', this.uid);
        const accountId = this.safeString (params, 'account', this.safeString (this.options, 'account', this.uid));
        if ((accountId === undefined) || (accountId !== configuredAccount)) {
            throw new AuthenticationError (this.id + ' private streams require uid and one account per instance');
        }
        const account = this.parseToInt (accountId);
        if ((account === undefined) || (account <= 0) || (account > 2147483647) || (this.numberToString (account) !== accountId)) {
            throw new AuthenticationError (this.id + ' invalid private stream account');
        }
        return { 'account': accountId, 'unsubscribe': 0, 'requestToken': this.apiKey };
    }

    /** @ignore */
    async authenticate (params: Dict = {}) {
        const request = this.privateStreamRequest (params);
        const url = this.urls['api']['ws']['private'];
        const client = this.client (url);
        if (this.safeBool (client.subscriptions, 'authenticated', false)) {
            return;
        }
        await this.watch (url, 'authenticated', request, 'authenticated');
    }

    /** @ignore */
    // Register the data hash before sending the single account subscription.
    async watchPrivate (hash: string, params: Dict = {}): Promise<any> {
        const request = this.privateStreamRequest (params);
        return await this.watch (this.urls['api']['ws']['private'], hash, request, 'authenticated');
    }

    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const hash = (symbol === undefined) ? 'orders' : 'orders:' + this.market (symbol)['symbol'];
        await this.watchPrivate (hash, params);
        return this.filterBySymbolSinceLimit (this.orders, symbol, since, limit, true);
    }

    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const hash = (symbol === undefined) ? 'myTrades' : 'myTrades:' + this.market (symbol)['symbol'];
        await this.watchPrivate (hash, params);
        return this.filterBySymbolSinceLimit (this.myTrades, symbol, since, limit, true);
    }

    override async watchBalance (params: Dict = {}): Promise<Balances> {
        await this.loadMarkets ();
        const result = await this.watchPrivate ('balance', params);
        return result;
    }

    override async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        await this.watchPrivate ('positions', params);
        return this.filterByArrayPositions (this.positions, 'symbol', this.marketSymbols (symbols));
    }

    /**
     * @method
     * @name quotetrade#watchRisk
     * @description Native cached risk data. No pre-trade REST/authentication round trip.
     * @param {object} params exchange-specific parameters
     * @returns {object} native response or unified result as documented
     */
    async watchRisk (params: Dict = {}): Promise<Dict> {
        await this.loadMarkets ();
        const result = await this.watchPrivate ('risk', params);
        return result;
    }

    /** @ignore */
    // Alphabetical, unescaped key=value signing used by the native WS API.
    signWsParams (params: Dict): Dict {
        this.checkRequiredCredentials ();
        const request = this.keysort (this.extend (params, { 'apiKey': this.apiKey }));
        const keys = Object.keys (request);
        const pairs: string[] = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const entry = request[key];
            let value = this.safeString (request, key);
            if (typeof entry === 'boolean') {
                value = entry ? 'true' : 'false';
            }
            if ((value === undefined) || (typeof entry === 'object')) {
                throw new InvalidOrder (this.id + ' WebSocket params must be scalar');
            }
            pairs.push (key + '=' + value);
        }
        const payload = pairs.join ('&');
        request['signature'] = this.hmac (this.encode (payload), this.encode (this.secret), sha256);
        return request;
    }

    /** @ignore */
    // A request is sent once. A timeout requires reconciliation, never automatic REST resubmission.
    async wsRequest (method: string, params: Dict = {}): Promise<Dict> {
        const next = this.safeInteger (this.options, 'wsRequestId', 0) + 1;
        this.options['wsRequestId'] = next;
        const id = this.numberToString (next);
        const requestParams = this.extend ({ 'timestamp': this.milliseconds () }, this.omit (params, [ 'apiVersion' ]));
        const request: Dict = { 'id': id, 'method': method, 'params': this.signWsParams (requestParams) };
        const url = this.urls['api']['ws']['private'];
        const hash = 'request:' + id;
        const client = this.client (url);
        const timeout = this.safeInteger (this.options, 'requestTimeout', this.timeout);
        const deadline = this.milliseconds () + timeout;
        const interval = this.parseToInt (Math.min (250, timeout));
        this.delay (interval, this.handleWsRequestTimeout, client, hash, deadline);
        return await this.watch (url, hash, request, hash);
    }

    /** @ignore */
    async handleWsRequestTimeout (client: Client, hash: string, deadline: number) {
        if (!(hash in client.futures)) {
            return;
        }
        const remaining = deadline - this.milliseconds ();
        if (remaining > 0) {
            const interval = this.parseToInt (Math.min (250, remaining));
            this.delay (interval, this.handleWsRequestTimeout, client, hash, deadline);
            return;
        }
        delete client.subscriptions[hash];
        client.reject (new RequestTimeout (this.id + ' WS response timed out; reconcile the client order id before another submission'), hash);
    }

    override async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const requestParams = this.extend ({ 'clientOrderId': 'ccxt-' + this.uuid16 () }, params);
        const request = this.createOrderRequest (symbol, type, side, amount, price, requestParams);
        const response = await this.wsRequest ('order.place', request);
        const order = this.parseOrder (response, this.market (symbol));
        if ((order['id'] === undefined) || (order['id'] === '0')) {
            return await this.resolveWsOrderByClientId (request['newClientOrderId'], symbol);
        }
        return order;
    }

    /** @ignore */
    // Legacy paper ACKs can contain id=0 and account status. Reconcile the unique client id; never resubmit.
    async resolveWsOrderByClientId (clientId: string, symbol: string): Promise<Order> {
        const cached = this.orders;
        if (cached !== undefined) {
            for (let i = 0; i < cached.length; i++) {
                if ((this.safeString (cached[i], 'clientOrderId') === clientId) && (this.safeString (cached[i], 'id', '0') !== '0')) {
                    return cached[i];
                }
            }
        }
        const recent = await this.fetchClosedOrders (symbol, undefined, 200);
        for (let i = 0; i < recent.length; i++) {
            const orderId = this.safeString (recent[i], 'id');
            if ((recent[i]['clientOrderId'] === clientId) && (orderId !== undefined) && (orderId !== '0')) {
                return await this.fetchOrder (orderId, symbol);
            }
        }
        throw new ExchangeError (this.id + ' WS order acknowledgement has no usable id; reconcile client order id before another submission');
    }

    /**
     * @method
     * @name quotetrade#fetchOrderWs
     * @description The documented WS surface has no single-order status method; use its canonical REST transport.
     * @param {string} id native identifier, kept as a string
     * @param {string} symbol unified market symbol
     * @param {object} params exchange-specific parameters
     * @returns {object} native response or unified result as documented
     */
    override async fetchOrderWs (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        return await this.fetchOrder (id, symbol, params);
    }

    /**
     * @method
     * @name quotetrade#cancelOrderWs
     * @description The documented WS surface has no single-order cancel method; use its canonical REST transport.
     * @param {string} id native identifier, kept as a string
     * @param {string} symbol unified market symbol
     * @param {object} params exchange-specific parameters
     * @returns {object} native response or unified result as documented
     */
    override async cancelOrderWs (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        return await this.cancelOrder (id, symbol, params);
    }

    /**
     * @method
     * @name quotetrade#fetchManagedOrdersWs
     * @description Native V3 managed-parent page over WebSocket.
     * @param {object} params exchange-specific parameters
     * @returns {object} native response or unified result as documented
     */
    async fetchManagedOrdersWs (params: Dict = {}): Promise<Dict> {
        return await this.wsRequest ('openOrders.status', this.extend ({ 'apiManaged': true, 'includeHistory': true, 'newestFirst': true, 'limit': 100, 'afterOrderId': '0' }, params));
    }

    /**
     * @method
     * @name quotetrade#createOrderListWs
     * @description Create a V3 linked order using flat symbol, kind and leg fields.
     * @param {object} params native fields including unified symbol and kind=oco, oto or otoco
     * @returns {object} native linked-order response
     */
    async createOrderListWs (params: Dict = {}): Promise<Dict> {
        await this.loadMarkets ();
        const symbol = this.safeString (params, 'symbol');
        const kind = this.safeString (params, 'kind');
        if ((symbol === undefined) || !this.inArray (kind, [ 'oco', 'oto', 'otoco' ])) {
            throw new NotSupported (this.id + ' linked creation requires symbol and kind=oco, oto or otoco');
        }
        const market = this.market (symbol);
        const request = this.extend (this.omit (params, [ 'kind' ]), { 'symbol': market['id'] + '/USD' });
        return await this.wsRequest ('orderList.place.' + kind, request);
    }

    /**
     * @method
     * @name quotetrade#fetchOrderListWs
     * @description Read one linked list through its native WebSocket RPC.
     * @param {object} params native list identifier fields
     * @returns {object} native linked-order response
     */
    async fetchOrderListWs (params: Dict = {}): Promise<Dict> {
        return await this.wsRequest ('orderList.status', params);
    }

    /**
     * @method
     * @name quotetrade#cancelOrderListWs
     * @description Read or cancel one linked list through its native WebSocket RPC.
     * @param {object} params flat native fields; create requests include unified symbol and kind
     * @returns {object} native linked-order response
     */
    async cancelOrderListWs (params: Dict = {}): Promise<Dict> {
        return await this.wsRequest ('orderList.cancel', params);
    }

    async cancelManagedOrdersWs (params: Dict = {}): Promise<Dict> {
        return await this.wsRequest ('openOrders.cancelAll', this.extend (params, { 'apiManaged': true }));
    }

    /** @ignore */
    handleLiquidity (client: Client, message: Dict) {
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId, undefined, undefined, 'swap');
        if (market['symbol'] === undefined) {
            return;
        }
        const bids = this.safeList (message, 'bids', []);
        const asks = this.safeList (message, 'asks', []);
        const bid = this.safeDict (bids, 0, {});
        const ask = this.safeDict (asks, 0, {});
        const ticker = this.parseTicker ({ 'symbol': marketId, 'bid': this.safeString (bid, 'p'), 'ask': this.safeString (ask, 'p') }, market);
        ticker['info'] = message;
        this.tickers[market['symbol']] = ticker;
        client.resolve (ticker, 'ticker:' + market['symbol']);
        client.resolve (message, 'liquidity:' + market['symbol']);
    }

    /** @ignore */
    handleOrderStream (client: Client, message: Dict) {
        const raw = this.safeDict (message, 'o', {});
        const id = this.safeString (raw, 'i');
        const marketId = this.safeString (raw, 's');
        if ((id === undefined) || (marketId === undefined)) {
            return;
        }
        const sequence = this.safeString (raw, 'us');
        const sequences = this.safeDict (this.options, 'orderSequences', {});
        const previous = this.safeString (sequences, id);
        if ((sequence !== undefined) && (previous !== undefined) && Precise.stringLt (sequence, previous)) {
            return;
        }
        if (sequence !== undefined) {
            if (previous === undefined) {
                const sequenceIds = Object.keys (sequences);
                const numSequences = sequenceIds.length;
                if (numSequences >= this.safeInteger (this.options, 'ordersLimit', 1000)) {
                    delete sequences[sequenceIds[0]];
                }
            }
            sequences[id] = sequence;
            this.options['orderSequences'] = sequences;
        }
        if (this.isOptionMarketId (marketId)) {
            return;
        }
        const market = this.safeMarket (marketId.split ('/')[0], undefined, undefined, 'swap');
        const normalized: Dict = {
            'orderId': id, 'clientOrderId': this.safeString (raw, 'c'), 'symbol': market['id'],
            'side': this.safeString (raw, 'S'), 'type': this.safeString (raw, 'o'), 'status': this.safeString (raw, 'X'),
            'timeInForce': this.safeString (raw, 'f'), 'origQty': this.safeString (raw, 'q'),
            'executedQty': this.safeString (raw, 'z'), 'price': this.safeString (raw, 'p'),
            'avgPrice': this.safeString (raw, 'ap'), 'leavesQty': this.safeString (raw, 'lv'),
            'updateTime': this.safeInteger (message, 'E'), 'transactTime': this.safeInteger (raw, 'T', this.safeInteger (message, 'E')),
        };
        const nativeOrder = this.safeDict (message, 'order', normalized);
        const order = this.parseOrder (nativeOrder, market);
        order['info'] = message;
        if (this.orders === undefined) {
            const orderCacheSize = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (orderCacheSize);
        }
        this.orders.append (order);
        client.resolve (this.orders, 'orders');
        client.resolve (this.orders, 'orders:' + order['symbol']);
        const lastQty = this.safeString (raw, 'l', '0');
        const tradeId = this.safeString (raw, 't');
        if ((this.safeString (raw, 'x') !== 'F') || (tradeId === undefined) || !Precise.stringGt (lastQty, '0')) {
            return;
        }
        const trade = this.safeTrade ({
            'id': tradeId, 'order': id, 'info': message, 'symbol': order['symbol'],
            'timestamp': this.safeInteger (raw, 'T'), 'side': order['side'], 'type': order['type'],
            'amount': lastQty, 'price': this.safeString (raw, 'L'),
            'takerOrMaker': this.safeBool (raw, 'm', false) ? 'maker' : 'taker',
            'fee': { 'cost': this.safeString (raw, 'n') },
        }, market);
        if (this.myTrades === undefined) {
            const tradeCacheSize = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (tradeCacheSize);
        }
        this.myTrades.append (trade);
        client.resolve (this.myTrades, 'myTrades');
        client.resolve (this.myTrades, 'myTrades:' + trade['symbol']);
    }

    /** @ignore */
    // Private account messages are complete cached snapshots.
    handleAccountStream (client: Client, message: Dict) {
        const emptyBalance: Dict = {};
        const parsedBalance = this.parseQuoteTradeBalance (message);
        this.balance = this.deepExtend (emptyBalance, parsedBalance);
        client.resolve (this.balance, 'balance');
        this.positions = this.parseQuoteTradePositions (message);
        client.resolve (this.positions, 'positions');
    }

    override handleMessage (client: Client, message: Dict) {
        const id = this.safeString (message, 'id');
        if (id !== undefined) {
            const hash = 'request:' + id;
            delete client.subscriptions[hash];
            const error = this.safeDict (message, 'error');
            if (error !== undefined) {
                const code = this.safeString (error, 'code');
                const text = this.safeString (error, 'msg', 'WebSocket request failed');
                try {
                    this.throwExactlyMatchedException (this.exceptions['exact'], text, this.id + ' ' + text);
                    this.throwExactlyMatchedException (this.exceptions['exact'], code, this.id + ' ' + text);
                    this.throwBroadlyMatchedException (this.exceptions['broad'], text, this.id + ' ' + text);
                    throw new ExchangeError (this.id + ' ' + text);
                } catch (e) {
                    client.reject (e, hash);
                }
            } else {
                client.resolve (this.safeDict (message, 'result', {}), hash);
            }
            return;
        }
        if (this.safeString (message, 'listenKey') !== undefined) {
            if (this.safeString (message, 'userId') !== this.safeString (this.options, 'account', this.uid)) {
                client.reject (new AuthenticationError (this.id + ' private stream account mismatch'));
                return;
            }
            client.subscriptions['authenticated'] = true;
            client.resolve (message, 'authenticated');
            return;
        }
        const privateError = this.safeString (message, 'error');
        if (privateError !== undefined) {
            client.reject (new AuthenticationError (this.id + ' private stream rejected: ' + privateError));
            return;
        }
        const event = this.safeString (message, 'e');
        if (event === 'ORDER_TRADE_UPDATE') {
            this.handleOrderStream (client, message);
        } else if (event === 'ACCOUNT_UPDATE') {
            this.handleAccountStream (client, message);
        } else if (event === 'RISK_UPDATE') {
            client.resolve (message, 'risk');
        } else if (this.safeList (message, 'bids') !== undefined) {
            this.handleLiquidity (client, message);
        }
    }
}
