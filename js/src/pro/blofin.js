//  ---------------------------------------------------------------------------
import blofinRest from '../blofin.js';
import { ArrayCache } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';
//  ---------------------------------------------------------------------------
export default class blofin extends blofinRest {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'swap': {
                            'public': 'wss://openapi.blofin.com/ws/public',
                            'public': 'wss://openapi.blofin.com/ws/private',
                        }
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
            },
        });
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name blofin#watchTrades
         * @see https://docs.blofin.com/index.html#ws-trades-channel
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const trades = await this.watchPublic(symbol, 'trade');
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmart#watchTradesForSymbols
         * @see https://docs.blofin.com/index.html#ws-trades-channel
         * @description get the list of most recent trades for a list of symbols
         * @param {string[]} symbols unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        const trades = await this.watchMultipleSymbols('trades', 'watchTradesForSymbols', symbols, limit, params);
        if (this.newUpdates) {
            const first = this.safeDict(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    async watchMultipleSymbols(channelName, methodName, symbols, limit = undefined, params = {}) {
        let market = undefined;
        symbols = this.marketSymbols(symbols, undefined, true, true);
        if (symbols !== undefined) {
            market = this.market(symbols[0]);
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams(methodName, market, params);
        // const length = symbols.length;
        // if (length > 20) {
        //     throw new NotSupported (this.id + ' ' + methodName + '() accepts a maximum of 20 symbols in one request');
        // }
        const rawSubscriptions = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market(symbols[i]);
            const message = {
                'channel': channelName,
                'instId': market['id'],
            };
            rawSubscriptions.push(message);
            messageHashes.push(channelName + ':' + market['symbol']);
        }
        const request = {
            "op": "subscribe",
            "args": rawSubscriptions,
        };
        return await this.watchMultiple(url, messageHashes, this.deepExtend(request, params), messageHashes);
    }
}
{
    "op";
    "subscribe",
        "args";
    [
        {
            "channel": "trades",
            "instId": "ETH-USDT"
        }
    ];
}
const url = this.implodeHostname(this.urls['api']['ws'][marketType]['public']);
async;
watchPublic(symbol, string, channel, params = {});
{
    await this.loadMarkets();
    const market = this.market(symbol);
    symbol = market['symbol'];
    const marketId = market['id'];
    const url = this.urls['api']['ws'];
    this.options[channel] = this.safeValue(this.options, channel, {});
    this.options[channel][symbol] = true;
    const symbols = Object.keys(this.options[channel]);
    const marketIds = this.marketIds(symbols);
    const request = [
        {
            'ticket': this.uuid(),
        },
        {
            'type': channel,
            'codes': marketIds,
            // 'isOnlySnapshot': false,
            // 'isOnlyRealtime': false,
        },
    ];
    const messageHash = channel + ':' + marketId;
    return await this.watch(url, messageHash, request, messageHash);
}
handleMessage(client, Client, message);
{
    const methods = {
        'ticker': this.handleTicker,
        'orderbook': this.handleOrderBook,
        'trade': this.handleTrades,
    };
    const methodName = this.safeString(message, 'type');
    const method = this.safeValue(methods, methodName);
    if (method) {
        method.call(this, client, message);
    }
}
handleTrades(client, Client, message);
{
    // { type: "trade",
    //   "code": "KRW-BTC",
    //   "timestamp": 1584508285812,
    //   "trade_date": "2020-03-18",
    //   "trade_time": "05:11:25",
    //   "trade_timestamp": 1584508285000,
    //   "trade_price": 6747000,
    //   "trade_volume": 0.06499468,
    //   "ask_bid": "ASK",
    //   "prev_closing_price": 6774000,
    //   "change": "FALL",
    //   "change_price": 27000,
    //   "sequential_id": 1584508285000002,
    //   "stream_type": "REALTIME" }
    const trade = this.parseTrade(message);
    const symbol = trade['symbol'];
    let stored = this.safeValue(this.trades, symbol);
    if (stored === undefined) {
        const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
        stored = new ArrayCache(limit);
        this.trades[symbol] = stored;
    }
    stored.append(trade);
    const marketId = this.safeString(message, 'code');
    const messageHash = 'trade:' + marketId;
    client.resolve(stored, messageHash);
}
