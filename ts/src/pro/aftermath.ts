// ----------------------------------------------------------------------------

import aftermathRest from '../aftermath.js';
import { AuthenticationError, NotSupported, ExchangeError } from '../base/errors.js';
import { ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCache, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { eddsa } from '../base/functions/crypto.js';
import { ed25519 } from '../static_dependencies/noble-curves/ed25519.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Balances, Position, Dict } from '../base/types.js';
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
                        'public': 'wss://aftermath.finance/iperps-api/ccxt/stream',
                        'private': 'wss://aftermath.finance/iperps-api/ccxt/stream',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://testnet.aftermath.finance/iperps-api/ccxt/stream',
                        'private': 'wss://testnet.aftermath.finance/iperps-api/ccxt/stream',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
            },
            'streaming': {
                // 'ping': this.ping,
                'keepAlive': false,
            },
            'exceptions': {
            },
        });
    }

    async watchPublic (suffix, messageHash, message) {
        const url = this.urls['api']['ws']['public'] + '/' + suffix;
        return await this.watch (url, messageHash, this.json (message), messageHash, message);
    }

    /**
     * @method
     * @name aftermath#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Stream/iperps_api%3A%3Accxt%3A%3Astream%3A%3Atrades
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
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Stream/iperps_api%3A%3Accxt%3A%3Astream%3A%3Aorderbook
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
        const timestamp = this.safeInteger (message, 'timestamp');
        const nonce = this.safeInteger (message, 'nonce');
        const market = this.market (symbol);
        const snapshot = this.parseOrderBook (message, symbol, timestamp);
        snapshot['nonce'] = nonce;
        const topic = market['id'] + '@orderbook';
        if (!(symbol in this.orderbooks)) {
            const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
            const subscription = client.subscriptions[topic];
            const limit = this.safeInteger (subscription, 'limit', defaultLimit);
            this.orderbooks[symbol] = this.orderBook ({}, limit);
        }
        const orderbook = this.orderbooks[symbol];
        orderbook.reset (snapshot);
        client.resolve (orderbook, topic);
    }

    /**
     * @method
     * @name aftermath#watchPositions
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Stream/iperps_api%3A%3Accxt%3A%3Astream%3A%3Apositions
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
        // const url = this.urls['api']['ws']['private'] + '/' + this.uid;
        // const client = this.client (url);
        // this.setPositionsCache (client, symbols);
        // const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', true);
        // const awaitPositionsSnapshot = this.handleOption ('watchPositions', 'awaitPositionsSnapshot', true);
        // if (fetchPositionsSnapshot && awaitPositionsSnapshot && this.positions === undefined) {
        //     const snapshot = await client.future ('fetchPositionsSnapshot');
        //     return this.filterBySymbolsSinceLimit (snapshot, symbols, since, limit, true);
        // }
        // const request: Dict = {
        //     'event': 'subscribe',
        //     'topic': 'position',
        // };
        // const topic = market['id'] + '@orderbook';
        // const request: Dict = {
        //     'chId': market['id'],
        // };
        const accountNumber = this.safeNumber (params, 'accountNumber');
        params = this.omit (params, 'accountNumber');
        const request = {
            'accountNumber': accountNumber,
        };
        const message = this.extend (request, params);
        const newPositions = await this.watchPublic ('positions', messageHashes[0], message);
        // const newPositions = await this.watchPrivateMultiple (messageHashes, request, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbols, since, limit, true);
    }

    handlePositions (client, message) {
        //
        //
        const data = this.safeValue (message, 'data', {});
        const rawPositions = this.safeValue (data, 'positions', {});
        const postitionsIds = Object.keys (rawPositions);
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
        const cache = this.positions;
        const newPositions = [];
        for (let i = 0; i < postitionsIds.length; i++) {
            const marketId = postitionsIds[i];
            const market = this.safeMarket (marketId);
            const rawPosition = rawPositions[marketId];
            const position = this.parsePosition (rawPosition, market);
            newPositions.push (position);
            cache.append (position);
            const messageHash = 'positions::' + market['symbol'];
            client.resolve (position, messageHash);
        }
        client.resolve (newPositions, 'positions');
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
                    throw new ExchangeError(message);
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
        } else if ('trades' in message) {
            this.handlePositions (client, message);
        } else {
            this.handleTrade (client, message);
        }
    }
}
