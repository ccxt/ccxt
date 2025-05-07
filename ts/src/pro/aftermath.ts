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
                'watchOrderBook': false,
                'watchOrders': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchBidsAsks': false,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchPositions': false,
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
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'accountId': true,
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
        //     amount: 0.00184,
        //     datetime: '2025-05-06 12:54:24.632 UTC',
        //     order: '17333914944033433863997077096',
        //     price: 93967.3412,
        //     timestamp: 1746536064632,
        //     side: 'sell',
        //     symbol: 'BTC/USD:USDC',
        //     takerOrMaker: 'maker'
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
        if ('asks' in message) {} else {
            this.handleTrade (client, message);
        }
    }
}
