
//  ---------------------------------------------------------------------------

import bullishRest from '../bullish.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type { Int, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
// import { ArgumentsRequired, AuthenticationError, ExchangeError } from '../base/errors.js';
// import { OHLCV, Order, Position, Str } from '../base/types.js';
// import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';

//  ---------------------------------------------------------------------------

export default class bullish extends bullishRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': false,
                'watchTickers': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchTrades': true,
                'watchPositions': false,
                'watchMyTrades': false,
                'watchBalance': false,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api.exchange.bullish.com',
                        'private': 'wss://api.exchange.bullish.com',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://api.simnext.bullish-test.com',
                        'private': 'wss://api.simnext.bullish-test.com',
                    },
                },
            },
            'options': {},
            'streaming': {
                'ping': this.ping,
                'keepAlive': 299000,
            },
        });
    }

    async watchPublic (url: string, messageHash: string, request = {}, params = {}): Promise<any> {
        const message = {
            'jsonrpc': '2.0',
            'type': 'command',
            'method': 'subscribe',
            'params': request,
            'id': this.milliseconds (),
        };
        const fullUrl = this.urls['api']['ws']['public'] + url;
        return await this.watch (fullUrl, messageHash, this.deepExtend (message, params), messageHash);
    }

    /**
     * @method
     * @name bullish#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--unified-anonymous-trades-websocket-unauthenticated
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'trades::' + market['symbol'];
        const url = '/trading-api/v1/market-data/trades';
        const request: any = {
            'topic': 'anonymousTrades',
            'symbol': market['id'],
        };
        const trades = await this.watchPublic (url, messageHash, request, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         "type": "snapshot",
        //         "dataType": "V1TAAnonymousTradeUpdate",
        //         "data": {
        //             "trades": [
        //                 {
        //                     "tradeId": "100086000000609304",
        //                     "isTaker": true,
        //                     "price": "104889.2063",
        //                     "createdAtTimestamp": "1749124509118",
        //                     "quantity": "0.01000000",
        //                     "publishedAtTimestamp": "1749124531466",
        //                     "side": "BUY",
        //                     "createdAtDatetime": "2025-06-05T11:55:09.118Z",
        //                     "symbol": "BTCUSDC"
        //                 }
        //             ],
        //             "createdAtTimestamp": "1749124509118",
        //             "publishedAtTimestamp": "1749124531466",
        //             "symbol": "BTCUSDC"
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const market = this.market (symbol);
        const rawTrades = this.safeList (data, 'trades', []);
        const trades = this.parseTrades (rawTrades, market);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const tradesArrayCache = new ArrayCache (limit);
            this.trades[symbol] = tradesArrayCache;
        }
        const tradesArray = this.trades[symbol];
        for (let i = 0; i < trades.length; i++) {
            tradesArray.append (trades[i]);
        }
        this.trades[symbol] = tradesArray;
        const messageHash = 'trades::' + market['symbol'];
        client.resolve (tradesArray, messageHash);
    }

    handleMessage (client: Client, message) {
        const dataType = this.safeString (message, 'dataType');
        if (dataType !== undefined) {
            if (dataType === 'V1TAAnonymousTradeUpdate') {
                this.handleTrades (client, message);
            }
        }
    }
}
