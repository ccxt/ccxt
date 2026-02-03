// ----------------------------------------------------------------------------

import aftermathRest from '../aftermath.js';
import { AuthenticationError, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import type { Int, Strings, OrderBook, Trade, Position, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';

// ----------------------------------------------------------------------------

export default class aftermath extends aftermathRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrders': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchBidsAsks': false,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'swap': 'wss://aftermath.finance/iperps-api/ccxt/stream',
                    },
                },
                'test': {
                    'ws': {
                        'swap': 'wss://testnet.aftermath.finance/iperps-api/ccxt/stream',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'watchPositions': {
                    'fetchPositionsSnapshot': true, // or false
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
            },
            'streaming': {
                'keepAlive': 59000,
            },
            'exceptions': {
            },
        });
    }

    async watchPublic (suffix, messageHash, message) {
        const url = this.urls['api']['ws']['swap'] + '/' + suffix;
        return await this.watch (url, messageHash, this.json (message), messageHash, message);
    }

    async watchPublicMultiple (suffix, messageHashes, message) {
        const url = this.urls['api']['ws']['swap'] + '/' + suffix;
        return await this.watchMultiple (url, messageHashes, this.json (message), messageHashes, message);
    }

    /**
     * @method
     * @name aftermath#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://testnet.aftermath.finance/docs/#/CCXT/service%3A%3Ahandlers%3A%3Accxt%3A%3Astream%3A%3Atrades
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = market['id'] + '@trade';
        const request: Dict = {
            'chId': market['id'],
        };
        const message = this.extend (request, params);
        const trades = await this.watchPublic ('trades', topic, message);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleTrade (client: Client, message) {
        //
        // {
        //     "amount": 0.1,
        //     "cost": 0.1,
        //     "datetime": "string",
        //     "fee": null,
        //     "id": "string",
        //     "order": "string",
        //     "price": 0.1,
        //     "side": null,
        //     "symbol": "string",
        //     "takerOrMaker": null,
        //     "timestamp": null,
        //     "type": "string"
        // }
        //
        const trade = this.parseTrade (message);
        const symbol = trade['symbol'];
        const market = this.market (symbol);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const messageHash = market['id'] + '@trade';
        const trades = this.trades[symbol];
        trades.append (trade);
        this.trades[symbol] = trades;
        client.resolve (trades, messageHash);
    }

    /**
     * @method
     * @name aftermath#watchOrderBook
     * @see https://testnet.aftermath.finance/docs/#/CCXT/service%3A%3Ahandlers%3A%3Accxt%3A%3Astream%3A%3Aorderbook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = market['id'] + '@orderbook';
        const request: Dict = {
            'chId': market['id'],
        };
        const message = this.extend (request, params);
        const orderbook = await this.watchPublic ('orderbook', topic, message);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        // {
        //     "asks": [
        //       []
        //     ],
        //     "bids": [
        //       []
        //     ],
        //     "datetime": "string",
        //     "nonce": 9007199254740991,
        //     "symbol": "string",
        //     "timestamp": 9007199254740991
        // }
        //
        const symbol = this.safeString (message, 'symbol');
        const market = this.market (symbol);
        const topic = market['id'] + '@orderbook';
        if (!(symbol in this.orderbooks)) {
            const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
            const subscription = client.subscriptions[topic];
            const limit = this.safeInteger (subscription, 'limit', defaultLimit);
            this.orderbooks[symbol] = this.orderBook ({}, limit);
            subscription['limit'] = limit;
            this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
        } else {
            const orderbook = this.orderbooks[symbol];
            const prevNonce = this.safeInteger (orderbook, 'nonce');
            const nonce = this.safeInteger (message, 'nonce');
            if (nonce === (prevNonce + 1)) {
                this.handleOrderBookMessage (client, message, orderbook);
                client.resolve (orderbook, topic);
            }
        }
    }

    async fetchOrderBookSnapshot (client, message, subscription) {
        const symbol = this.safeString (message, 'symbol');
        const market = this.market (symbol);
        const messageHash = market['id'] + '@orderbook';
        try {
            const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
            const limit = this.safeInteger (subscription, 'limit', defaultLimit);
            const params = this.safeDict (subscription, 'params');
            const snapshot = await this.fetchRestOrderBookSafe (symbol, limit, params);
            if (this.safeValue (this.orderbooks, symbol) === undefined) {
                // if the orderbook is dropped before the snapshot is received
                return;
            }
            const orderbook = this.orderbooks[symbol];
            orderbook.reset (snapshot);
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        } catch (e) {
            delete client.subscriptions[messageHash];
            client.reject (e, messageHash);
        }
    }

    handleOrderBookMessage (client: Client, message, orderbook) {
        this.handleDeltas (orderbook['asks'], this.safeValue (message, 'asks', []));
        this.handleDeltas (orderbook['bids'], this.safeValue (message, 'bids', []));
        const timestamp = this.safeInteger (message, 'timestamp');
        const nonce = this.safeInteger (message, 'nonce');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['nonce'] = nonce;
        return orderbook;
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat2 (delta, 'price', 0);
        const amount = this.safeFloat2 (delta, 'quantity', 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    /**
     * @method
     * @name aftermath#watchPositions
     * @see https://testnet.aftermath.finance/docs/#/CCXT/service%3A%3Ahandlers%3A%3Accxt%3A%3Astream%3A%3Apositions
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of position structures to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountNumber] account number to query orders for, required
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const messageHashes = [];
        symbols = this.marketSymbols (symbols);
        if (!this.isEmpty (symbols)) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push ('positions::' + symbol);
            }
        } else {
            messageHashes.push ('positions');
        }
        const accountNumber = this.safeNumber (params, 'accountNumber');
        const request = {
            'accountNumber': accountNumber,
        };
        const message = this.extend (request, params);
        const suffix = 'positions';
        const url = this.urls['api']['ws']['swap'] + '/' + suffix;
        const client = this.client (url);
        this.setPositionsCache (client, symbols, params);
        const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.handleOption ('watchPositions', 'awaitPositionsSnapshot', true);
        if (fetchPositionsSnapshot && awaitPositionsSnapshot && this.positions === undefined) {
            const snapshot = await client.future ('fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit (snapshot, symbols, since, limit, true);
        }
        const newPositions = await this.watchPublicMultiple (suffix, messageHashes, message);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbols, since, limit, true);
    }

    setPositionsCache (client: Client, symbols: Strings = undefined, params: Dict = {}) {
        const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', false);
        if (fetchPositionsSnapshot) {
            const messageHash = 'fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future (messageHash);
                this.spawn (this.loadPositionsSnapshot, client, messageHash, symbols, params);
            }
        } else {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
    }

    async loadPositionsSnapshot (client, messageHash, symbols, params) {
        const positions = await this.fetchPositions (symbols, params);
        this.positions = new ArrayCacheBySymbolBySide ();
        const cache = this.positions;
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            cache.append (position);
        }
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve (cache);
        client.resolve (cache, 'positions');
    }

    handlePositions (client, message) {
        //
        // {
        //     "collateral": 0.1,
        //     "contractSize": 0.1,
        //     "contracts": 0.1,
        //     "datetime": "string",
        //     "entryPrice": 0.1,
        //     "id": "0x895037c09dd1025a136b5a5789c4ea2481176adf4c3b0c3521d5d2039bdfc3ba:123",
        //     "initialMargin": 0.1,
        //     "initialMarginPercentage": 0.1,
        //     "leverage": 0.1,
        //     "liquidationPrice": 0.1,
        //     "maintenanceMargin": 0.1,
        //     "maintenanceMarginPercentage": 0.1,
        //     "marginMode": "cross",
        //     "marginRatio": 0.1,
        //     "notional": 0.1,
        //     "side": "long",
        //     "symbol": "BTC/USD:USDC",
        //     "timestamp": 9007199254740991,
        //     "unrealizedPnl": 0.1
        // }
        //
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
        const cache = this.positions;
        const symbol = this.safeString (message, 'symbol');
        const market = this.safeMarket (symbol);
        const position = this.parsePosition (message, market);
        cache.append (position);
        const messageHash = 'positions::' + market['symbol'];
        client.resolve (position, messageHash);
        client.resolve ([ position ], 'positions');
    }

    handleErrorMessage (client: Client, message) {
        //
        // User error: Expected Message::Text from client, got Ping(b\"\")
        //
        if (typeof message === 'string') {
            if (message.indexOf ('error') >= 0) {
                try {
                    const feedback = this.id + ' ' + message;
                    this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                    throw new ExchangeError (message);
                } catch (error) {
                    if (error instanceof AuthenticationError) {
                        const messageHash = 'authenticated';
                        client.reject (error, messageHash);
                        if (messageHash in client.subscriptions) {
                            delete client.subscriptions[messageHash];
                        }
                    } else {
                        client.reject (error);
                    }
                    return true;
                }
            }
        }
        return false;
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        // const methods: Dict = {
        //     'trade': this.handleTrade,
        // };
        if ('asks' in message) {
            this.handleOrderBook (client, message);
        } else if ('notional' in message) {
            this.handlePositions (client, message);
        } else {
            this.handleTrade (client, message);
        }
    }
}
