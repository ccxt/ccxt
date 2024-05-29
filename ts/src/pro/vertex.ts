// ----------------------------------------------------------------------------

import vertexRest from '../vertex.js';
import { AuthenticationError, NotSupported } from '../base/errors.js';
import { ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCache, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { eddsa } from '../base/functions/crypto.js';
import { ed25519 } from '../static_dependencies/noble-curves/ed25519.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Balances, Position } from '../base/types.js';
import Client from '../base/ws/Client.js';

// ----------------------------------------------------------------------------

export default class vertex extends vertexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': true,
                'watchPositions': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://gateway.prod.vertexprotocol.com/v1/subscribe',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://gateway.sepolia-test.vertexprotocol.com/v1/subscribe',
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'requestId': {},
                'watchPositions': {
                    'fetchPositionsSnapshot': true, // or false
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
            },
            'streaming': {
                // 'ping': this.ping,
                'keepAlive': 30000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Auth is needed.': AuthenticationError,
                    },
                },
            },
        });
    }

    requestId (url) {
        const options = this.safeDict (this.options, 'requestId', {});
        const previousValue = this.safeInteger (options, url, 0);
        const newValue = this.sum (previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }

    async watchPublic (messageHash, message) {
        const url = this.urls['api']['ws']['public'];
        const requestId = this.requestId (url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend (subscribe, message);
        return await this.watch (url, messageHash, request, messageHash, subscribe);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name vertex#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = market['id'] + '@trade';
        const request = {
            'method': 'subscribe',
            'stream': {
                'type': 'trade',
                'product_id': this.parseToNumeric (market['id']),
            },
        };
        const message = this.extend (request, params);
        const trades = await this.watchPublic (topic, message);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleTrade (client: Client, message) {
        //
        // {
        //     "type": "trade",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     "price": "1000", // price the trade happened at, multiplied by 1e18
        //     // both taker_qty and maker_qty have the same value;
        //     // set to filled amount (min amount of taker and maker) when matching against book
        //     // set to matched amm base amount when matching against amm
        //     "taker_qty": "1000",
        //     "maker_qty": "1000",
        //     "is_taker_buyer": true,
        //     "is_maker_amm": true // true when maker is amm
        // }
        //
        const timestamp = this.safeInteger (message, 'timestamp');
        const marketId = this.safeString (message, 'product_id');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const trade = this.parseWsTrade (this.extend (message, { 'timestamp': timestamp }), market);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const trades = this.trades[symbol];
        trades.append (trade);
        this.trades[symbol] = trades;
        client.resolve (trades, marketId + '@trade');
    }

    parseWsTrade (trade, market = undefined) {
        //
        // {
        //     "type": "trade",
        //     "timestamp": "1676151190656903000", // timestamp of the event in nanoseconds
        //     "product_id": 1,
        //     "price": "1000", // price the trade happened at, multiplied by 1e18
        //     // both taker_qty and maker_qty have the same value;
        //     // set to filled amount (min amount of taker and maker) when matching against book
        //     // set to matched amm base amount when matching against amm
        //     "taker_qty": "1000",
        //     "maker_qty": "1000",
        //     "is_taker_buyer": true,
        //     "is_maker_amm": true // true when maker is amm
        // }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.convertFromX18 (this.safeString (trade, 'price'));
        const amount = this.convertFromX18 (this.safeString (trade, 'taker_qty'));
        const cost = Precise.stringMul (price, amount);
        const timestamp = Precise.stringDiv (this.safeString (trade, 'timestamp'), '1000000');
        return this.safeTrade ({
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': undefined,
            'takerOrMaker': undefined,
            'type': this.safeStringLower (trade, 'type'),
            'fee': undefined,
            'info': trade,
        }, market);
    }

    handleErrorMessage (client: Client, message) {
        //
        //
        if (!('success' in message)) {
            return false;
        }
        const success = this.safeBool (message, 'success');
        if (success) {
            return false;
        }
        const errorMessage = this.safeString (message, 'errorMsg');
        try {
            if (errorMessage !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorMessage, feedback);
            }
            return false;
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

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const methods = {
            'trade': this.handleTrade,
        };
        const event = this.safeString (message, 'type');
        let method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
            return;
        }
    }
}
