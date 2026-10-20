// ---------------------------------------------------------------------------
import { sha256 } from '@noble/hashes/sha2.js';
import Exchange from './abstract/quotetrade.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Balances, Dict, Int, int, Market, Num, Order, OrderSide, OrderType, Position, Status, Str, Strings, Ticker, NullableDict } from './base/types.js';
import { AuthenticationError, BadSymbol, ExchangeError, InsufficientFunds, InvalidNonce, InvalidOrder, NotSupported, OrderNotFound, PermissionDenied, RateLimitExceeded } from './base/errors.js';

/**
 * @class quotetrade
 * @augments Exchange
 */
export default class quotetrade extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'quotetrade',
            'name': 'Quote.Trade',
            'countries': [],
            'rateLimit': 250,
            'headers': { 'Accept': 'application/json, text/event-stream' },
            'certified': false,
            'pro': true,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createTriggerOrder': false,
                'editOrder': false,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchFundingRate': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchPositions': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': false,
                'setLeverage': false,
                'withdraw': false,
            },
            'urls': {
                'api': { 'public': 'https://app.quote.trade/api', 'private': 'https://app.quote.trade/api', 'publicV2': 'https://app.quote.trade/api/v2', 'privateV2': 'https://app.quote.trade/api/v2', 'privateV3': 'https://app.quote.trade/api/v3', 'mcp': 'https://quote.trade/mcp' },
                'www': 'https://quote.trade',
                'doc': [ 'https://doc.quote.trade', 'https://quote.trade/mcp/discovery', 'https://quote.trade/trading-reference/' ],
            },
            'api': {
                'public': { 'get': { 'status': 1, 'getInstrumentPairs': 1, 'exchangeInfo': 1, 'ticker': 1, 'depth': 1 }},
                'private': { 'get': { 'account': 1, 'positions': 1 }, 'post': { 'getRisk': 1, 'getOrders': 1, 'orderStatus': 1, 'getOrderHistory': 1, 'getUserHistory': 1, 'order': 1, 'cancelOrder': 1 }},
                'publicV2': { 'get': { 'getInstrumentPairs': 1, 'exchangeInfo': 1, 'getTime': 1, 'getOrderBookSnap': 1, 'getTradeHistory': 1, 'getFundingRateHistory': 1 }},
                'privateV2': { 'get': { 'account': 1, 'positions': 1 }, 'post': { 'getUserProfile': 1, 'getRisk': 1, 'getOrders': 1, 'orderStatus': 1, 'getOrderHistory': 1, 'getUserHistory': 1, 'order': 1, 'cancelOrder': 1 }},
                'privateV3': { 'get': { 'orderList': 1, 'openOrderList': 1, 'allOrderList': 1, 'openOrders': 1 }, 'post': { 'orderList/oco': 1, 'orderList/oto': 1, 'orderList/otoco': 1, 'order/oco': 1 }, 'delete': { 'orderList': 1, 'openOrders': 1 }},
            },
            'requiredCredentials': { 'apiKey': true, 'secret': true, 'uid': false },
            'precisionMode': TICK_SIZE,
            'options': { 'defaultType': 'swap', 'disableLeverage': true, 'mcpSendSecret': false },
            'features': {
                'default': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': { 'GTC': false, 'IOC': false, 'FOK': true, 'PO': false, 'GTD': false },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                },
                'swap': { 'linear': { 'extends': 'default' }, 'inverse': undefined },
                'spot': undefined,
                'future': { 'linear': undefined, 'inverse': undefined },
            },
            'exceptions': {
                'exact': {
                    'requestUser not found': AuthenticationError,
                    '-1022': AuthenticationError,
                    '-2015': AuthenticationError,
                    '-2010': InsufficientFunds,
                    '-1003': RateLimitExceeded,
                    'Paper orders are immediately filled and cannot be canceled.': InvalidOrder,
                    'Unable to price paper order. Price too low.': InvalidOrder,
                    'Unable to price paper order. Price too high.': InvalidOrder,
                },
                'broad': {
                    'signature failed': AuthenticationError,
                    'requestUser not found': AuthenticationError,
                    'user not authorized': PermissionDenied,
                    'invalid nonce': InvalidNonce,
                    'Insufficient balance': InsufficientFunds,
                    'symbol not found': BadSymbol,
                    'invalid symbol': BadSymbol,
                    'not found': OrderNotFound,
                    'rate limit': RateLimitExceeded,
                },
            },
        });
    }

    /** @ignore */
    isOptionMarketId (marketId: Str): boolean {
        if (marketId === undefined) {
            return false;
        }
        const nativeId = marketId.split ('/')[0];
        const parts = nativeId.split ('-');
        const optionType = this.safeString (parts, 3);
        return ((optionType === 'C') || (optionType === 'P')) && (this.safeString (parts, 4) === undefined);
    }

    /** @ignore */
    override parseMarket (entry: Dict): Market {
        const marketId = this.safeString (entry, 'symbol');
        const base = this.safeCurrencyCode (marketId);
        const amountScale = this.safeInteger2 (entry, 'minOrderQuantityScale', 'quantityScale', 6);
        const executionScale = this.safeInteger (entry, 'executionQuantityScale', 6);
        const amountPrecision = this.parseNumber (this.parsePrecision (this.numberToString (Math.min (amountScale, executionScale))));
        return this.safeMarketStructure ({
            'id': marketId,
            'symbol': base + '/USD:USD',
            'base': base,
            'quote': 'USD',
            'settle': 'USD',
            'baseId': marketId,
            'quoteId': 'USD',
            'settleId': 'USD',
            'type': 'swap',
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': undefined,
            'contract': true,
            'contractSize': 1,
            'linear': true,
            'inverse': false,
            // The order parser accepts price_scale=8; chartPriceScale is a different field.
            'precision': { 'amount': amountPrecision, 'price': 0.00000001 },
            'limits': { 'cost': { 'min': this.safeNumber (entry, 'minimumNotionalUsd') }},
            'info': entry,
        });
    }

    /**
     * @method
     * @name quotetrade#fetchMarkets
     * @description fetch non-option USD-settled perpetual exposure markets
     * @see https://quote.trade/mcp/discovery
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of market structures
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        if ((this.safeInteger (params, 'skip', 0) !== 0) || (this.safeInteger (params, 'limit', 0) !== 0)) {
            throw new NotSupported (this.id + ' fetchMarkets requires the complete unpaginated catalogue');
        }
        const response = await this.quoteTradeRequest ('getInstrumentPairs', 'public', 'GET', params);
        const entries = this.safeList (response, 'instrumentPairs', []);
        const result: Market[] = [];
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const marketId = this.safeString (entry, 'symbol');
            if (marketId === undefined) {
                continue;
            }
            if (this.isOptionMarketId (marketId)) {
                continue;
            }
            result.push (this.parseMarket (entry));
        }
        return result;
    }

    /**
     * @method
     * @name quotetrade#fetchTime
     * @description fetch the server time in milliseconds
     * @see https://quote.trade/mcp/discovery
     * @param {object} [params] extra exchange-specific parameters
     * @returns {int} server time in milliseconds
     */
    override async fetchTime (params = {}): Promise<Int> {
        const response = await this.quoteTradeRequest ('status', 'public', 'GET', params);
        return this.safeInteger (response, 'serverTime');
    }

    /**
     * @method
     * @name quotetrade#fetchStatus
     * @description fetch exchange availability
     * @see https://quote.trade/mcp/discovery
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a status structure
     */
    override async fetchStatus (params = {}): Promise<Status> {
        const response = await this.quoteTradeRequest ('status', 'public', 'GET', params);
        const system = this.safeString (response, 'system');
        const statuses = { 'operational': 'ok', 'maintenance': 'maintenance', 'down': 'shutdown' };
        return { 'status': this.safeString (statuses, system, 'error'), 'updated': this.safeInteger (response, 'serverTime'), 'eta': undefined, 'url': undefined, 'info': response };
    }

    /** @ignore */
    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'symbol');
        const timestamp = this.safeInteger (ticker, 'lastUpdateId');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market, undefined, 'swap'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'bid': this.safeString (ticker, 'bid'),
            'ask': this.safeString (ticker, 'ask'),
            // price is a reference quote, not proof of a last executed trade.
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name quotetrade#fetchTicker
     * @description fetch bid and ask reference quotes without inventing trade statistics
     * @see https://quote.trade/mcp/discovery
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a ticker structure
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.quoteTradeRequest ('ticker', 'public', 'GET', this.extend (params, { 'symbol': market['id'] }));
        return this.parseTicker (response, market);
    }

    /**
     * @method
     * @name quotetrade#fetchBalance
     * @description fetch funding-asset quantities without treating synthetic positions as cash
     * @see https://quote.trade/trading-reference/
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a balance structure
     */
    override async fetchBalance (params = {}): Promise<Balances> {
        const response = await this.quoteTradeRequest ('positions', 'private', 'GET', params);
        return this.parseQuoteTradeBalance (response);
    }

    /** @ignore */
    // Same source records and cash units for REST and WebSocket snapshots.
    parseQuoteTradeBalance (response: Dict): Balances {
        const timestamp = this.safeInteger (response, 'E');
        const accountData = this.safeDict (response, 'a', {});
        const entries = this.safeList (accountData, 'B', []);
        const result: Dict = { 'info': response, 'timestamp': timestamp, 'datetime': this.iso8601 (timestamp) };
        const fundingAssets = [ 'USD', 'USDC', 'USDT', 'XUSDC' ];
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const currencyId = this.safeString (entry, 'a');
            if (this.inArray (currencyId, fundingAssets)) {
                const account = this.account ();
                account['total'] = this.safeString (entry, 'wb');
                account['free'] = this.safeString (entry, 'aq');
                const code = this.safeCurrencyCode (currencyId);
                if (code !== undefined) {
                    result[code] = account;
                }
            }
        }
        return this.safeBalance (result);
    }

    /** @ignore */
    override parsePosition (position: Dict, market: Market = undefined): Position {
        const marketId = this.safeString (position, 'a');
        const marketDefinition = this.safeMarket (marketId, market, undefined, 'swap');
        const quantity = this.safeString (position, 'wb');
        const markPrice = this.safeString (position, 'm');
        const timestamp = this.safeInteger (position, 'E');
        const contracts = Precise.stringAbs (quantity);
        return this.safePosition ({
            'info': position,
            'symbol': marketDefinition['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'side': (Precise.stringLt (quantity, '0')) ? 'short' : 'long',
            'contracts': this.parseNumber (contracts),
            'contractSize': 1,
            'entryPrice': this.safeNumber (position, 'uacb'),
            'markPrice': this.parseNumber (markPrice),
            'notional': this.parseNumber (Precise.stringMul (contracts, markPrice)),
            'unrealizedPnl': this.safeNumber (position, 'up'),
        });
    }

    /**
     * @method
     * @name quotetrade#fetchPositions
     * @description fetch nonzero perpetual positions in underlying units
     * @see https://quote.trade/trading-reference/
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} position structures
     */
    override async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const response = await this.quoteTradeRequest ('positions', 'private', 'GET', params);
        return this.parseQuoteTradePositions (response, symbols);
    }

    /** @ignore */
    // Full cached account snapshot, parsed without modifying source records.
    parseQuoteTradePositions (response: Dict, symbols: Strings = undefined): Position[] {
        const marketSymbols = this.marketSymbols (symbols);
        const accountData = this.safeDict (response, 'a', {});
        const entries = this.safeList (accountData, 'B', []);
        const result: Position[] = [];
        for (let i = 0; i < entries.length; i++) {
            const entry = this.safeDict (entries, i, {});
            const marketId = this.safeString (entry, 'a');
            const quantity = this.safeString (entry, 'wb', '0');
            const markets = this.safeList (this.markets_by_id, marketId);
            if ((markets === undefined) || Precise.stringEq (quantity, '0') || this.inArray (marketId, [ 'USD', 'USDC', 'USDT', 'XUSDC' ])) {
                continue;
            }
            const position = this.parsePosition (this.extend ({ 'E': this.safeInteger (response, 'E') }, entry), this.safeMarket (marketId, undefined, undefined, 'swap'));
            if ((marketSymbols === undefined) || this.inArray (position['symbol'], marketSymbols)) {
                result.push (position);
            }
        }
        return result;
    }

    /** @ignore */
    parseOrderStatus (status: Str): Str {
        const statuses = { 'PENDING_NEW': 'open', '0': 'open', '1': 'open', '2': 'closed', '4': 'canceled', '8': 'rejected', 'C': 'expired', 'NEW': 'open', 'PARTIALLY_FILLED': 'open', 'FILLED': 'closed', 'CANCELED': 'canceled', 'CANCELLED': 'canceled', 'REJECTED': 'rejected', 'EXPIRED': 'expired', 'DONE_FOR_DAY': 'expired', 'PENDING': undefined, 'PENDING_CANCEL': undefined };
        return this.safeString (statuses, status);
    }

    /** @ignore */
    parseScaledOrderField (entry: Dict, field: string, scaleField: string): Str {
        const value = this.safeString (entry, field);
        const scale = this.safeString (entry, scaleField);
        if ((value !== undefined) && (scale !== undefined)) {
            return Precise.stringMul (value, this.parsePrecision (scale));
        }
        return value;
    }

    /** @ignore */
    parseOrderTimestampString (entry: NullableDict): Str {
        const transactTime = this.safeString2 (entry, 'transactTime', 'updateTime');
        if (transactTime !== undefined) {
            return transactTime;
        }
        const value = this.safeString2 (entry, 'timeStamp', 'timestamp', this.safeString (entry, 'time'));
        if (value === undefined) {
            return undefined;
        }
        if ((value.length >= 17) && (value.indexOf ('-') === 8)) {
            const iso = value.slice (0, 4) + '-' + value.slice (4, 6) + '-' + value.slice (6, 8) + 'T' + value.slice (9) + 'Z';
            const timestamp = this.parse8601 (iso);
            return (timestamp === undefined) ? undefined : this.numberToString (timestamp);
        }
        return value;
    }

    /** @ignore */
    override parseOrder (entry: Dict, market: Market = undefined): Order {
        let marketId = this.safeString (entry, 'symbol');
        if (this.isOptionMarketId (marketId)) {
            throw new NotSupported (this.id + ' option orders are unsupported');
        }
        if (marketId !== undefined) {
            const parts = marketId.split ('/');
            marketId = parts[0];
        }
        const timestampString = this.parseOrderTimestampString (entry);
        const timestamp = (timestampString === undefined) ? undefined : this.parseToInt (timestampString);
        const amount = this.safeString2 (entry, 'origQty', 'quoteQty', this.parseScaledOrderField (entry, 'quantity', 'quantity_scale'));
        const filled = this.safeString (entry, 'executedQty', this.parseScaledOrderField (entry, 'cumQty', 'cumQty_scale'));
        const price = this.safeString (entry, 'orderPrice', this.parseScaledOrderField (entry, 'price', 'price_scale'));
        const nativeType = this.safeStringUpper2 (entry, 'type', 'ordType');
        const nativeSide = this.safeStringUpper (entry, 'side');
        const orderTypes = { '2': 'limit', 'LIMIT': 'limit', 'SYNTHETIC_LIMIT': 'limit', 'ICEBERG': 'limit', 'STOP_LIMIT': 'limit', 'STOP_LOSS_LIMIT': 'limit', 'TAKE_PROFIT_LIMIT': 'limit', 'TRAILING_STOP_LIMIT': 'limit', 'STOP': 'market', 'STOP_MARKET': 'market', 'TAKE_PROFIT': 'market', 'TAKE_PROFIT_MARKET': 'market', 'TRAILING_STOP_MARKET': 'market', '1': 'market', 'MARKET': 'market' };
        const sides = { '1': 'buy', '2': 'sell', 'BUY': 'buy', 'SELL': 'sell' };
        const timeInForce = this.safeString (entry, 'timeInForce');
        const timeInForces = { 'GTC': 'GTC', 'GTD': 'GTD', '4': 'FOK', 'FILL_OR_KILL': 'FOK', 'FOK': 'FOK', '3': 'IOC', 'IMMEDIATE_OR_CANCEL': 'IOC', 'IOC': 'IOC' };
        return this.safeOrder ({
            'info': entry,
            'id': this.safeString (entry, 'orderId'),
            'clientOrderId': this.safeString2 (entry, 'clientOrderId', 'clOrdId'),
            'symbol': this.safeSymbol (marketId, market, undefined, 'swap'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': this.safeInteger (entry, 'updateTime'),
            'type': this.safeString (orderTypes, nativeType),
            'timeInForce': this.safeString (timeInForces, timeInForce),
            'side': this.safeString (sides, nativeSide),
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': this.parseScaledOrderField (entry, 'leavesQty', 'leavesQty_scale'),
            'average': this.safeString (entry, 'avgPrice', this.parseScaledOrderField (entry, 'avgPx', 'avgPx_scale')),
            'status': this.parseOrderStatus (this.safeStringUpper2 (entry, 'status', 'ordStatus')),
        }, market);
    }

    /** @ignore */
    parseOrderSnapshots (entries: Dict[]): Order[] {
        const latest: Dict = {};
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const orderId = this.safeString (entry, 'orderId');
            if ((orderId === undefined) || this.isOptionMarketId (this.safeString (entry, 'symbol'))) {
                continue;
            }
            const previous = this.safeDict (latest, orderId);
            const timestampString = this.parseOrderTimestampString (entry);
            const previousTimestampString = this.parseOrderTimestampString (previous);
            const latestTime = (timestampString === undefined) ? 0 : this.parseToInt (timestampString);
            const previousTime = (previousTimestampString === undefined) ? 0 : this.parseToInt (previousTimestampString);
            if ((previous === undefined) || (latestTime > previousTime) || ((latestTime === previousTime) && Precise.stringGe (this.safeString2 (entry, 'updateSeq', 'orderUpdateSeq', '0'), this.safeString2 (previous, 'updateSeq', 'orderUpdateSeq', '0')))) {
                latest[orderId] = entry;
            }
        }
        return this.parseOrders (this.toArray (latest));
    }

    /**
     * @method
     * @name quotetrade#fetchOrder
     * @description fetch the latest order snapshot without treating submission as a final fill
     * @see https://quote.trade/trading-reference/
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} an order structure
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        let market: Market = undefined;
        const request: Dict = { 'orderId': id };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.quoteTradeRequest ('orderStatus', 'private', 'POST', this.extend (params, request));
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name quotetrade#fetchOpenOrders
     * @description fetch and filter open order snapshots
     * @see https://quote.trade/trading-reference/
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] earliest update timestamp in milliseconds
     * @param {int} [limit] maximum number of orders
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} order structures
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        if (this.safeBool (params, 'apiManaged', false) || (this.safeString (params, 'apiVersion') === 'v3')) {
            const managed = await this.fetchOrders (symbol, since, limit, this.extend (params, { 'apiManaged': true, 'includeHistory': false }));
            const filtered: Order[] = [];
            for (let i = 0; i < managed.length; i++) {
                if (managed[i]['status'] === 'open') {
                    filtered.push (managed[i]);
                }
            }
            return filtered;
        }
        const request: Dict = {};
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let response: Dict = {};
        try {
            response = await this.quoteTradeRequest ('getOrders', 'private', 'POST', this.extend (params, request));
        } catch (e) {
            if (e instanceof OrderNotFound) {
                return [];
            }
            throw e;
        }
        const orders = this.parseOrderSnapshots (this.safeList (response, 'orders', []));
        const result: Order[] = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] === 'open') {
                result.push (orders[i]);
            }
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    /**
     * @method
     * @name quotetrade#fetchClosedOrders
     * @description fetch filled orders, deduplicating historical state updates by order id
     * @see https://quote.trade/trading-reference/
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] earliest latest-update timestamp in milliseconds
     * @param {int} [limit] maximum number of orders
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} order structures
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        if (this.safeBool (params, 'apiManaged', false) || (this.safeString (params, 'apiVersion') === 'v3')) {
            const managed = await this.fetchOrders (symbol, since, limit, this.extend (params, { 'apiManaged': true, 'includeHistory': true }));
            const filtered: Order[] = [];
            for (let i = 0; i < managed.length; i++) {
                if (managed[i]['status'] === 'closed') {
                    filtered.push (managed[i]);
                }
            }
            return filtered;
        }
        const request: Dict = this.extend (params, { 'type': 'order' });
        if (symbol !== undefined) {
            request['symbol'] = this.marketId (symbol);
        }
        if (since !== undefined) {
            request['timestamp'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 10000);
        }
        // getOrderHistory is a single-order audit route, not an account list.
        const response = await this.quoteTradeRequest ('getUserHistory', 'private', 'POST', request);
        const parsed = this.parseOrderHistoryCsv (response);
        const result: Order[] = [];
        for (let i = 0; i < parsed.length; i++) {
            if (parsed[i]['status'] === 'closed') {
                result.push (parsed[i]);
            }
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    /** @ignore */
    parseOrderHistoryCsv (csv: any): Order[] {
        if (typeof csv !== 'string') {
            throw new ExchangeError (this.id + ' expected the native CSV order export');
        }
        const header = 'accountId,time,symbol,side,lastPrice,qty,fee,feeAsset,ordType,ordStatus,execType,maker,orderId,tradeId,quoteQty,clOrdId,targetStrategy,leavesQty,cumQty,avgPx,orderPrice,LastQty,StopPx,Price2,timeInForce,expireTimeMillis,settleChange';
        // Decode control characters through a helper supported by every transpiler.
        const newline = this.binaryToString (this.base64ToBinary ('Cg=='));
        const carriageReturn = this.binaryToString (this.base64ToBinary ('DQ=='));
        const lines: string[] = csv.split (newline);
        const firstLine = this.safeString (lines, 0, '').replace (carriageReturn, '');
        if (firstLine !== header) {
            throw new ExchangeError (this.id + ' unexpected native order export header');
        }
        const names = header.split (',');
        const entries: Dict[] = [];
        const numLines = lines.length;
        for (let i = 1; i < numLines; i++) {
            const index = numLines - i;
            const line = lines[index].replace (carriageReturn, '');
            if (line === '') {
                continue;
            }
            const values = line.split (',');
            // The native exporter does not quote embedded delimiters. Reject
            // ambiguous records instead of shifting ids or quantity columns.
            if ((this.safeString (values, 26) === undefined) || (this.safeString (values, 27) !== undefined)) {
                throw new ExchangeError (this.id + ' malformed native order export row');
            }
            const entry: Dict = {};
            for (let j = 0; j < 27; j++) {
                entry[names[j]] = values[j];
            }
            // Export rows are newest first; ties must retain the first row.
            entries.push (entry);
        }
        return this.parseOrderSnapshots (entries);
    }

    /**
     * @method
     * @name quotetrade#createOrder
     * @description submit an immediate FOK limit order in underlying units
     * @see https://quote.trade/trading-reference/
     * @param {string} symbol unified market symbol
     * @param {string} type limit only
     * @param {string} side buy or sell
     * @param {float} amount underlying quantity
     * @param {float} price execution price constraint
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.account] account id, otherwise exchange.uid
     * @param {boolean} [params.disableLeverage] defaults to true
     * @param {string} [params.paymentCurrency] USD only for USD-quoted perpetual orders
     * @param {string} [params.clientOrderId] client order id
     * @param {int} [params.timestamp] request timestamp in milliseconds, defaults to the current time
     * @param {string} [params.timeInForce] FOK only
     * @param {boolean} [params.postOnly] unsupported
     * @param {boolean} [params.reduceOnly] unsupported
     * @returns {object} an order snapshot; reconcile final fills with fetchOrder
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        const response = await this.quoteTradeRequest ('order', 'private', 'POST', request);
        return this.parseOrder (response, this.market (symbol));
    }

    /** @ignore */
    // Shared validated request for REST and WS; never submits an order.
    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Dict {
        if (this.safeBool (params, 'apiManaged', false)) {
            return this.createManagedOrderRequest (symbol, type, side, amount, price, params);
        }
        const market = this.market (symbol);
        if ((type !== 'limit') || ((side !== 'buy') && (side !== 'sell')) || (price === undefined) || (price <= 0) || (amount <= 0)) {
            throw new InvalidOrder (this.id + ' requires a positive amount, price and buy/sell limit order');
        }
        if (this.safeBool (params, 'postOnly', false) || this.safeBool (params, 'reduceOnly', false) || (this.safeStringUpper (params, 'timeInForce', 'FOK') !== 'FOK')) {
            throw new NotSupported (this.id + ' supports immediate FOK limit orders without post-only or reduce-only');
        }
        const unsupported = [ 'triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice', 'stopLoss', 'takeProfit', 'trailingPercent', 'trailingAmount', 'hedged', 'marginMode', 'leverage', 'instrumentId' ];
        for (let i = 0; i < unsupported.length; i++) {
            if (this.safeValue (params, unsupported[i]) !== undefined) {
                throw new NotSupported (this.id + ' createOrder does not support ' + unsupported[i]);
            }
        }
        const accountId = this.safeString (params, 'account', this.uid);
        const account = this.parseToInt (accountId);
        if ((accountId === undefined) || (account === undefined) || (account <= 0) || (account > 2147483647) || (this.numberToString (account) !== accountId)) {
            throw new AuthenticationError (this.id + ' createOrder requires uid or params.account');
        }
        const amountString = this.amountToPrecision (symbol, amount);
        const priceString = this.priceToPrecision (symbol, price);
        if (!Precise.stringEq (amountString, this.numberToString (amount)) || !Precise.stringEq (priceString, this.numberToString (price))) {
            throw new InvalidOrder (this.id + ' amount or price exceeds the supported precision');
        }
        // Native quantity and price are signed 64-bit integers scaled by 6 and 8.
        if (Precise.stringGt (Precise.stringMul (amountString, '1000000'), '9223372036854775807') || Precise.stringGt (Precise.stringMul (priceString, '100000000'), '9223372036854775807')) {
            throw new InvalidOrder (this.id + ' amount or price exceeds the native integer range');
        }
        const minimumNotional = this.safeString (market['limits']['cost'], 'min');
        if ((minimumNotional !== undefined) && Precise.stringLt (Precise.stringMul (amountString, priceString), minimumNotional)) {
            throw new InvalidOrder (this.id + ' order is below the minimum USD notional');
        }
        const paymentCurrency = this.safeString (params, 'paymentCurrency', 'USD');
        if (paymentCurrency !== 'USD') {
            throw new NotSupported (this.id + ' unsupported paymentCurrency');
        }
        let requestParams: Dict = params;
        let disableLeverage = true;
        [ disableLeverage, requestParams ] = this.handleOptionAndParams (requestParams, 'createOrder', 'disableLeverage', true);
        const request: Dict = {
            'liquidityOrder': 1,
            'account': account,
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'type': 'LIMIT',
            'timeInForce': 'FOK',
            'price': priceString,
            'quantity': amountString,
            'disableLeverage': (disableLeverage) ? 1 : 0,
            'paymentCurrency': paymentCurrency,
            'timestamp': this.safeInteger (params, 'timestamp', this.milliseconds ()),
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['newClientOrderId'] = clientOrderId;
        }
        requestParams = this.omit (requestParams, [ 'account', 'clientOrderId', 'postOnly', 'reduceOnly' ]);
        return this.extend (requestParams, request);
    }

    /**
     * @method
     * @name quotetrade#cancelOrder
     * @description request cancellation of one order without assuming the acknowledgement is final
     * @see https://quote.trade/trading-reference/
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.account] account id, otherwise exchange.uid
     * @returns {object} a minimal order acknowledgement; reconcile with fetchOrder
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new BadSymbol (this.id + ' cancelOrder requires a symbol');
        }
        const market = this.market (symbol);
        const accountId = this.safeString (params, 'account', this.uid);
        const account = this.parseToInt (accountId);
        if ((accountId === undefined) || (account === undefined) || (account <= 0) || (account > 2147483647) || (this.numberToString (account) !== accountId)) {
            throw new AuthenticationError (this.id + ' cancelOrder requires uid or params.account');
        }
        const response = await this.quoteTradeRequest ('cancelOrder', 'private', 'POST', this.extend (params, { 'account': account, 'symbol': market['id'], 'orderId': id }));
        // The legacy cancellation acknowledgement lacks scale fields for numeric quantities.
        // Return only reliable identifiers/state; fetchOrder obtains a scaled final snapshot.
        return this.safeOrder ({ 'id': this.safeString (response, 'orderId', id), 'symbol': symbol, 'status': this.parseOrderStatus (this.safeStringUpper (response, 'status')), 'info': response }, market);
    }

    /** @ignore */
    // Select an explicit API version without retrying a write on another route.
    async quoteTradeRequest (path: string, scope: string, method: string, params: Dict = {}): Promise<any> {
        const version = this.safeString (params, 'apiVersion', this.safeString (this.options, 'apiVersion', 'legacy'));
        if (!this.inArray (version, [ 'legacy', 'v2', 'v3' ])) {
            throw new NotSupported (this.id + ' unsupported apiVersion');
        }
        const api = (version === 'v2') ? scope + 'V2' : scope;
        const request: Dict = this.extend ({}, this.omit (params, [ 'apiVersion' ]));
        const response = await this.request (path, [ api ], method, request);
        if ((response === '') || (response === undefined)) {
            throw new ExchangeError (this.id + ' empty API response; no alternate-route retry was attempted');
        }
        return response;
    }

    /** @ignore */
    // Reused by REST and WebSocket order placement.
    createManagedOrderRequest (symbol: string, type: string, side: string, amount: number, price: Num = undefined, params: Dict = {}): Dict {
        const market = this.market (symbol);
        const unsupported = [ 'disableLeverage', 'paymentCurrency', 'leverage', 'instrumentId', 'hedged', 'marginMode' ];
        for (let i = 0; i < unsupported.length; i++) {
            if (this.safeValue (params, unsupported[i]) !== undefined) {
                throw new NotSupported (this.id + ' managed orders do not accept ' + unsupported[i]);
            }
        }
        if ((side !== 'buy') && (side !== 'sell')) {
            throw new InvalidOrder (this.id + ' requires a buy or sell side');
        }
        const accountId = this.safeString (params, 'account', this.uid);
        const account = this.parseToInt (accountId);
        if ((accountId === undefined) || (account === undefined) || (account <= 0) || (account > 2147483647) || (this.numberToString (account) !== accountId)) {
            throw new AuthenticationError (this.id + ' managed orders require uid or params.account');
        }
        if ((amount <= 0) || ((price !== undefined) && (price <= 0))) {
            throw new InvalidOrder (this.id + ' requires positive quantity and supplied price');
        }
        const amountString = this.amountToPrecision (symbol, amount);
        if (!Precise.stringEq (amountString, this.numberToString (amount)) || Precise.stringGt (Precise.stringMul (amountString, '1000000'), '9223372036854775807')) {
            throw new InvalidOrder (this.id + ' unsupported quantity precision or range');
        }
        const nativeType = this.safeStringUpper (params, 'nativeType', (type === 'limit') ? 'SYNTHETIC_LIMIT' : 'MARKET');
        const supported = [ 'SYNTHETIC_LIMIT', 'STOP', 'STOP_MARKET', 'STOP_LIMIT', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT', 'TAKE_PROFIT_MARKET', 'TAKE_PROFIT_LIMIT', 'TRAILING_STOP_MARKET', 'TRAILING_STOP_LIMIT', 'LIMIT_MAKER', 'POST_ONLY', 'ICEBERG', 'TWAP', 'VWAP', 'POV' ];
        if (!this.inArray (nativeType, supported)) {
            throw new NotSupported (this.id + ' unsupported API-managed type; use params.nativeType');
        }
        const lifetime = this.safeStringUpper (params, 'timeInForce', 'GTC');
        if (!this.inArray (lifetime, [ 'GTC', 'GTD' ])) {
            throw new InvalidOrder (this.id + ' managed parent timeInForce must be GTC or GTD');
        }
        const request: Dict = {
            'account': account,
            'symbol': market['id'] + '/USD',
            'side': side.toUpperCase (),
            'type': nativeType,
            'quantity': amountString,
            'apiManaged': true,
            'timeInForce': lifetime,
            'timestamp': this.safeInteger (params, 'timestamp', this.milliseconds ()),
        };
        if (price !== undefined) {
            const priceString = this.priceToPrecision (symbol, price);
            if (!Precise.stringEq (priceString, this.numberToString (price)) || Precise.stringGt (Precise.stringMul (priceString, '100000000'), '9223372036854775807')) {
                throw new InvalidOrder (this.id + ' unsupported price precision or range');
            }
            request['price'] = priceString;
        }
        if ((nativeType === 'SYNTHETIC_LIMIT') && (price === undefined)) {
            throw new InvalidOrder (this.id + ' persistent limit requires a price');
        }
        const clientId = this.safeString (params, 'clientOrderId');
        if (clientId !== undefined) {
            request['newClientOrderId'] = clientId;
        }
        // Legacy payment/leverage flags select unrelated execution contexts.
        const omitted = [ 'nativeType', 'clientOrderId', 'disableLeverage', 'paymentCurrency', 'postOnly', 'apiVersion' ];
        return this.extend (this.omit (params, omitted), request);
    }

    /** @ignore */
    // Bounded managed-parent page; preserve nextOrderId in the returned native response.
    async fetchManagedOrders (params: Dict = {}): Promise<Dict> {
        const request: Dict = { 'apiManaged': true, 'newestFirst': true, 'limit': 100, 'afterOrderId': '0', 'nonce': this.nonce () };
        return await this.privateV3GetOpenOrders (this.extend (request, this.omit (params, [ 'apiVersion', 'symbol' ])));
    }

    /**
     * @method
     * @name quotetrade#fetchOrders
     * @description Fetch all states from one bounded managed-parent page. The legacy API has no all-states order list, so has['fetchOrders'] is false and this method requires params.apiManaged=true or params.apiVersion='v3'.
     * @param {string} symbol unified market symbol
     * @param {int} since earliest timestamp in milliseconds
     * @param {int} limit maximum results
     * @param {object} params exchange-specific parameters
     * @param {boolean} [params.apiManaged] must be true unless params.apiVersion is 'v3'
     * @param {string} [params.apiVersion] 'v3' selects the managed-parent order list
     * @returns {object} native response or unified result as documented
     */
    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        if (!this.safeBool (params, 'apiManaged', false) && (this.safeString (params, 'apiVersion') !== 'v3')) {
            throw new NotSupported (this.id + ' fetchOrders requires apiManaged=true or apiVersion=v3');
        }
        const request: Dict = this.extend ({ 'includeHistory': true }, params);
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        const response = await this.fetchManagedOrders (request);
        const orders = this.parseOrderSnapshots (this.safeList (response, 'orders', []));
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    /**
     * @method
     * @name quotetrade#createOrderList
     * @description Create OCO, OTO or OTOCO with one portable flat request object.
     * @param {object} params flat native fields; create requests include unified symbol and kind
     * @returns {object} native linked-order response
     */
    async createOrderList (params: Dict = {}): Promise<Dict> {
        await this.loadMarkets ();
        const symbol = this.safeString (params, 'symbol');
        const kind = this.safeString (params, 'kind');
        if ((symbol === undefined) || !this.inArray (kind, [ 'oco', 'oto', 'otoco' ])) {
            throw new NotSupported (this.id + ' linked creation requires symbol and kind=oco, oto or otoco');
        }
        const market = this.market (symbol);
        const accountId = this.safeString (params, 'account', this.uid);
        const account = this.parseToInt (accountId);
        if ((accountId === undefined) || (account === undefined) || (account <= 0) || (account > 2147483647) || (this.numberToString (account) !== accountId)) {
            throw new AuthenticationError (this.id + ' linked orders require uid or params.account');
        }
        const request: Dict = this.extend (this.omit (params, [ 'apiVersion', 'kind' ]), { 'symbol': market['id'] + '/USD', 'account': account, 'nonce': this.milliseconds () });
        return await this.request ('orderList/' + kind, [ 'privateV3' ], 'POST', request);
    }

    /**
     * @method
     * @name quotetrade#fetchOrderList
     * @description Read or cancel one linked list using orderListId or its native client id.
     * @param {object} params flat native fields; create requests include unified symbol and kind
     * @returns {object} native linked-order response
     */
    async fetchOrderList (params: Dict = {}): Promise<Dict> {
        return await this.privateV3GetOrderList (this.extend (params, { 'nonce': this.milliseconds () }));
    }

    /**
     * @method
     * @name quotetrade#cancelOrderList
     * @description Read or cancel one linked list using orderListId or its native client id.
     * @param {object} params flat native fields; create requests include unified symbol and kind
     * @returns {object} native linked-order response
     */
    async cancelOrderList (params: Dict = {}): Promise<Dict> {
        return await this.privateV3DeleteOrderList (this.extend (params, { 'nonce': this.milliseconds () }));
    }

    /**
     * @method
     * @name quotetrade#fetchOrderLists
     * @description Bounded linked-list history; use the native cursor fields for later pages.
     * @param {object} params exchange-specific parameters
     * @returns {object} native response or unified result as documented
     */
    async fetchOrderLists (params: Dict = {}): Promise<Dict> {
        return await this.privateV3GetAllOrderList (this.extend ({ 'nonce': this.nonce () }, params));
    }

    /**
     * @method
     * @name quotetrade#cancelManagedOrders
     * @description Explicit account-wide managed cancellation. No symbol-scoped alias is advertised.
     * @param {object} params exchange-specific parameters
     * @returns {object} native response or unified result as documented
     */
    async cancelManagedOrders (params: Dict = {}): Promise<Dict> {
        return await this.privateV3DeleteOpenOrders (this.extend (params, { 'apiManaged': true, 'nonce': this.nonce () }));
    }

    /**
     * @method
     * @name quotetrade#initializeMcp
     * @description Initialize the native hosted MCP. The server is stateless; no browser login is needed.
     * @returns {object} native response or unified result as documented
     */
    async initializeMcp (): Promise<Dict> {
        return await this.mcpRpc ('initialize', { 'protocolVersion': '2024-11-05', 'capabilities': {}, 'clientInfo': { 'name': 'ccxt-quotetrade', 'version': '1.0.0' }});
    }

    /**
     * @method
     * @name quotetrade#fetchMcpTools
     * @description Read the current native MCP schemas before calling version-sensitive tools.
     * @returns {object} native response or unified result as documented
     */
    async fetchMcpTools (): Promise<Dict> {
        return await this.mcpRpc ('tools/list', {});
    }

    /**
     * @method
     * @name quotetrade#callMcpTool
     * @description Native MCP call. Returns the documented native structured result, not a fabricated unified structure. The hosted MCP signs private tools on the caller's behalf, so it must receive the raw API secret; private tools therefore require the explicit opt-in options['mcpSendSecret'] = true (default false). Public tools never send credentials.
     * @see https://quote.trade/mcp/discovery
     * @param {string} name native MCP tool name
     * @param {object} args arguments from the live MCP tool schema
     * @returns {object} native response or unified result as documented
     */
    async callMcpTool (name: string, args: Dict = {}): Promise<Dict> {
        const publicTools = [ 'quote_trade_api_discovery', 'quote_trade_api_manifest', 'quote_trade_get_challenge', 'quote_trade_logon', 'quote_trade_status', 'quote_trade_exchange_info', 'quote_trade_instruments', 'quote_trade_ticker', 'quote_trade_depth', 'quote_trade_order_preview', 'quote_trade_withdraw_preview' ];
        const authenticated = !this.inArray (name, publicTools);
        const result = await this.mcpRpc ('tools/call', { 'name': name, 'arguments': args }, authenticated);
        let content = this.safeDict (result, 'structuredContent');
        if (content === undefined) {
            const blocks = this.safeList (result, 'content', []);
            const block = this.safeDict (blocks, 0, {});
            const value = this.safeString (block, 'text');
            if (value !== undefined) {
                content = this.parseJson (value);
            }
        }
        if (content === undefined) {
            throw new ExchangeError (this.id + ' MCP tool returned no structured content');
        }
        const body = this.safeValue (content, 'body', content);
        this.handleErrors (200, '', '', 'POST', {}, '', body, {}, '');
        if (this.safeBool (result, 'isError', false)) {
            throw new ExchangeError (this.id + ' MCP tool failed: ' + name);
        }
        return content;
    }

    /** @ignore */
    // Private MCP calls send the raw API secret only to the configured MCP host, and only after options.mcpSendSecret opt-in.
    async mcpRpc (method: string, params: Dict, authenticated = false): Promise<Dict> {
        const next = this.safeInteger (this.options, 'mcpRequestId', 0) + 1;
        this.options['mcpRequestId'] = next;
        const request: Dict = { 'jsonrpc': '2.0', 'id': next, 'method': method, 'params': params, '_authenticated': authenticated };
        const response = await this.request ('', [ 'mcp' ], 'POST', request);
        if (this.safeString (response, 'id') !== this.numberToString (next)) {
            throw new ExchangeError (this.id + ' mismatched MCP response id');
        }
        const result = this.safeDict (response, 'result');
        if (result === undefined) {
            throw new ExchangeError (this.id + ' invalid MCP JSON-RPC response');
        }
        return result;
    }

    /** @ignore */
    override sign (path: string, api: string[] = [ 'public' ], method = 'GET', params: Dict = {}): Dict {
        const scope = api[0];
        if (scope === 'mcp') {
            const authenticated = this.safeBool (params, '_authenticated', false);
            const mcpHeaders: Dict = { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' };
            if (authenticated) {
                this.checkRequiredCredentials ();
                if (!this.safeBool (this.options, 'mcpSendSecret', false)) {
                    throw new NotSupported (this.id + ' private MCP tools send the raw API secret to the MCP host; set options.mcpSendSecret = true to allow it, or use the HMAC-signed REST and WebSocket methods');
                }
                mcpHeaders['X-MBX-APIKEY'] = this.apiKey;
                mcpHeaders['X-MBX-APISECRET'] = this.secret;
            }
            return { 'url': this.urls['api']['mcp'], 'method': method, 'body': this.json (this.omit (params, [ '_authenticated' ])), 'headers': mcpHeaders };
        }
        let headers: Dict = {};
        let body: Str = undefined;
        let url = this.urls['api'][scope] + '/' + path;
        let query = '';
        if ((method === 'GET') || (path === 'getUserHistory')) {
            // The CSV export reads servlet query parameters even on POST.
            query = this.urlencode (params);
            if (query.length > 0) {
                url += '?' + query;
            }
            if (method !== 'GET') {
                body = '{}';
                headers = { 'Content-Type': 'application/json' };
            }
        } else {
            body = this.json (params);
            headers = { 'Content-Type': 'application/json' };
        }
        if ((scope === 'private') || (scope === 'privateV2') || (scope === 'privateV3')) {
            this.checkRequiredCredentials ();
            let payload = query;
            if (body !== undefined) {
                payload += body;
            }
            headers['X-MBX-APIKEY'] = this.apiKey;
            headers['signature'] = this.hmac (this.encode (payload), this.encode (this.secret), sha256);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    /** @ignore */
    override handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        const error = this.safeString (response, 'error');
        const code = this.safeInteger (response, 'code', 0);
        if ((error !== undefined) || (code < 0)) {
            const message = this.safeString2 (response, 'error', 'msg', 'API request failed');
            const feedback = this.id + ' ' + message;
            this.throwExactlyMatchedException (this.exceptions['exact'], this.numberToString (code), feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
