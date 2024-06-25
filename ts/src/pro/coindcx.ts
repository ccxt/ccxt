
//  ---------------------------------------------------------------------------

import coindcxRest from '../coindcx.js';
// import { ArgumentsRequired, AuthenticationError, BadRequest } from '../base/errors.js';
import type { Dict, Int, Market, Trade } from '../base/types.js';
// import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { ArrayCache } from '../base/ws/Cache.js';
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
                    'ws': 'wss://stream.coindcx.com',
                    'test': 'wss://stream.coindcx.com',
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
         * @param {int|string} [params.tag] If given it will be echoed in the reply and the max size of tag is 32
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        let marketId = market['id'];
        let suffix = '@trades';
        if (market['spot']) {
            const marketInfo = this.safeDict (market, 'info');
            marketId = this.safeString (marketInfo, 'pair');
            suffix = '@trades';
        }
        const channelName = marketId + suffix;
        const messageHash = 'trades:' + symbol;
        const request: Dict = {
            'channelName': channelName,
        };
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleMessage (client: Client, message) {
        return message;
    }
}
