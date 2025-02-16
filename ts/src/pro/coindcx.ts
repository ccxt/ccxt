
//  ---------------------------------------------------------------------------

import coindcxRest from '../coindcx.js';
import { AuthenticationError } from '../base/errors.js';
import type { Dict, Int, Trade } from '../base/types.js';
// import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { ArrayCache } from '../base/ws/Cache.js';
// import { Precise } from '../base/Precise.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class coindcx extends coindcxRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchOrderBook': false,
                'watchOrderBookForSymbols': false,
                'watchOHLCV': false,
                'watchOHLCVForSymbols': false,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchBalance': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://stream-native.coindcx.com',
                },
            },
            'options': {
                'timeframes': {
                    '1m': '60s',
                    '3m': '180s',
                    '5m': '300s',
                    '15m': '900s',
                    '30m': '1800s',
                    '1h': '3600s',
                    '2h': '7200s',
                    '4h': '14400s',
                    '6h': '21600s',
                    '12h': '43200s',
                    '1d': '86400s',
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 50000,
            },
        });
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coindcx#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://docs.coindcx.com/#get-new-trade
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const marketId = market['id'];
        const suffix = '@trades';
        const channelName = marketId + suffix;
        const messageHash = 'new-trade:' + symbol;
        const request: Dict = {
            'type': 'subscribe',
            'channelName': channelName,
        };
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client: Client, message) {
        //
        //     "event": 'new-trade',
        //     "data": {
        //         "T": 1739735609567,
        //         "m": 1,
        //         "p": '2683.63',
        //         "pr": 'spot',
        //         "q": '0.0084',
        //         "s": 'B-ETH_USDT'
        //     }
        //
        const data = this.safeDict (message, 'data');
        const timestamp = this.safeInteger (data, 'T');
        const marketId = this.safeString (data, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'new-trade:' + symbol;
        const trade = this.parseWsTrade (this.extend (data, { 'timestamp': timestamp }), market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
            this.trades[symbol] = tradesArray;
        }
        tradesArray.append (trade);
        client.resolve (tradesArray, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         "T": 1739735609567,
        //         "m": 1,
        //         "p": '2683.63',
        //         "pr": 'spot',
        //         "q": '0.0084',
        //         "s": 'B-ETH_USDT'
        //     }
        //
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString (trade, 'p');
        const amount = this.safeString (trade, 'q');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const makerOrTakerIndex = this.safeString (trade, 'm');
        let takerOrMaker = 'taker';
        if (makerOrTakerIndex === '1') {
            takerOrMaker = 'maker';
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'tradeId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'order': undefined,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const event = this.safeString (message, 'event');
        const methods: Dict = {
            'new-trade': this.handleTrade,
        };
        if (event in methods) {
            const method = methods[event];
            method.call (this, client, message);
        }
    }

    handleErrorMessage (client: Client, message) {
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
}
