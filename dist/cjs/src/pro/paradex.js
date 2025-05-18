'use strict';

var paradex$1 = require('../paradex.js');
var Cache = require('../base/ws/Cache.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class paradex extends paradex$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchOrderBook': true,
                'watchOrders': false,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchBalance': false,
                'watchOHLCV': false,
            },
            'urls': {
                'logo': 'https://x.com/tradeparadex/photo',
                'api': {
                    'ws': 'wss://ws.api.prod.paradex.trade/v1',
                },
                'test': {
                    'ws': 'wss://ws.api.testnet.paradex.trade/v1',
                },
                'www': 'https://www.paradex.trade/',
                'doc': 'https://docs.api.testnet.paradex.trade/',
                'fees': 'https://docs.paradex.trade/getting-started/trading-fees',
                'referral': '',
            },
            'options': {},
            'streaming': {},
        });
    }
    /**
     * @method
     * @name paradex#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.api.testnet.paradex.trade/#sub-trades-market_symbol-operation
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let messageHash = 'trades.';
        if (symbol !== undefined) {
            const market = this.market(symbol);
            messageHash += market['id'];
        }
        else {
            messageHash += 'ALL';
        }
        const url = this.urls['api']['ws'];
        const request = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': {
                'channel': messageHash,
            },
        };
        const trades = await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrade(client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "trades.ALL",
        //             "data": {
        //                 "id": "1718179273230201709233240002",
        //                 "market": "kBONK-USD-PERP",
        //                 "side": "BUY",
        //                 "size": "34028",
        //                 "price": "0.028776",
        //                 "created_at": 1718179273230,
        //                 "trade_type": "FILL"
        //             }
        //         }
        //     }
        //
        const params = this.safeDict(message, 'params', {});
        const data = this.safeDict(params, 'data', {});
        const parsedTrade = this.parseTrade(data);
        const symbol = parsedTrade['symbol'];
        const messageHash = this.safeString(params, 'channel');
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            stored = new Cache.ArrayCache(this.safeInteger(this.options, 'tradesLimit', 1000));
            this.trades[symbol] = stored;
        }
        stored.append(parsedTrade);
        client.resolve(stored, messageHash);
        return message;
    }
    /**
     * @method
     * @name paradex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.api.testnet.paradex.trade/#sub-order_book-market_symbol-snapshot-15-refresh_rate-operation
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'order_book.' + market['id'] + '.snapshot@15@100ms';
        const url = this.urls['api']['ws'];
        const request = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': {
                'channel': messageHash,
            },
        };
        const orderbook = await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "order_book.BTC-USD-PERP.snapshot@15@50ms",
        //             "data": {
        //                 "seq_no": 14127815,
        //                 "market": "BTC-USD-PERP",
        //                 "last_updated_at": 1718267837265,
        //                 "update_type": "s",
        //                 "inserts": [
        //                     {
        //                         "side": "BUY",
        //                         "price": "67629.7",
        //                         "size": "0.992"
        //                     },
        //                     {
        //                         "side": "SELL",
        //                         "price": "69378.6",
        //                         "size": "3.137"
        //                     }
        //                 ],
        //                 "updates": [],
        //                 "deletes": []
        //             }
        //         }
        //     }
        //
        const params = this.safeDict(message, 'params', {});
        const data = this.safeDict(params, 'data', {});
        const marketId = this.safeString(data, 'market');
        const market = this.safeMarket(marketId);
        const timestamp = this.safeInteger(data, 'last_updated_at');
        const symbol = market['symbol'];
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook();
        }
        const orderbookData = {
            'bids': [],
            'asks': [],
        };
        const inserts = this.safeList(data, 'inserts');
        for (let i = 0; i < inserts.length; i++) {
            const insert = this.safeDict(inserts, i);
            const side = this.safeString(insert, 'side');
            const price = this.safeString(insert, 'price');
            const size = this.safeString(insert, 'size');
            if (side === 'BUY') {
                orderbookData['bids'].push([price, size]);
            }
            else {
                orderbookData['asks'].push([price, size]);
            }
        }
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook(orderbookData, symbol, timestamp, 'bids', 'asks');
        snapshot['nonce'] = this.safeNumber(data, 'seq_no');
        orderbook.reset(snapshot);
        const messageHash = this.safeString(params, 'channel');
        client.resolve(orderbook, messageHash);
    }
    /**
     * @method
     * @name paradex#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.api.testnet.paradex.trade/#sub-markets_summary-operation
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const channel = 'markets_summary';
        const url = this.urls['api']['ws'];
        const request = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': {
                'channel': channel,
            },
        };
        const messageHash = channel + '.' + symbol;
        return await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
    }
    /**
     * @method
     * @name paradex#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.api.testnet.paradex.trade/#sub-markets_summary-operation
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const channel = 'markets_summary';
        const url = this.urls['api']['ws'];
        const request = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': {
                'channel': channel,
            },
        };
        const messageHashes = [];
        if (Array.isArray(symbols)) {
            for (let i = 0; i < symbols.length; i++) {
                const messageHash = channel + '.' + symbols[i];
                messageHashes.push(messageHash);
            }
        }
        else {
            messageHashes.push(channel);
        }
        const newTickers = await this.watchMultiple(url, messageHashes, this.deepExtend(request, params), messageHashes);
        if (this.newUpdates) {
            const result = {};
            result[newTickers['symbol']] = newTickers;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    handleTicker(client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "markets_summary",
        //             "data": {
        //                 "symbol": "ORDI-USD-PERP",
        //                 "oracle_price": "49.80885481",
        //                 "mark_price": "49.80885481",
        //                 "last_traded_price": "62.038",
        //                 "bid": "49.822",
        //                 "ask": "58.167",
        //                 "volume_24h": "0",
        //                 "total_volume": "54542628.66054200416",
        //                 "created_at": 1718334307698,
        //                 "underlying_price": "47.93",
        //                 "open_interest": "6999.5",
        //                 "funding_rate": "0.03919997509811",
        //                 "price_change_rate_24h": ""
        //             }
        //         }
        //     }
        //
        const params = this.safeDict(message, 'params', {});
        const data = this.safeDict(params, 'data', {});
        const marketId = this.safeString(data, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const channel = this.safeString(params, 'channel');
        const messageHash = channel + '.' + symbol;
        const ticker = this.parseTicker(data, market);
        this.tickers[symbol] = ticker;
        client.resolve(ticker, channel);
        client.resolve(ticker, messageHash);
        return message;
    }
    handleErrorMessage(client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 0,
        //         "error": {
        //             "code": -32600,
        //             "message": "invalid subscribe request",
        //             "data": "invalid channel"
        //         },
        //         "usIn": 1718179125962419,
        //         "usDiff": 76,
        //         "usOut": 1718179125962495
        //     }
        //
        const error = this.safeDict(message, 'error');
        if (error === undefined) {
            return true;
        }
        else {
            const errorCode = this.safeString(error, 'code');
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + this.json(error);
                this.throwExactlyMatchedException(this.exceptions['exact'], '-32600', feedback);
                const messageString = this.safeValue(error, 'message');
                if (messageString !== undefined) {
                    this.throwBroadlyMatchedException(this.exceptions['broad'], messageString, feedback);
                }
            }
            return false;
        }
    }
    handleMessage(client, message) {
        if (!this.handleErrorMessage(client, message)) {
            return;
        }
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "trades.ALL",
        //             "data": {
        //                 "id": "1718179273230201709233240002",
        //                 "market": "kBONK-USD-PERP",
        //                 "side": "BUY",
        //                 "size": "34028",
        //                 "price": "0.028776",
        //                 "created_at": 1718179273230,
        //                 "trade_type": "FILL"
        //             }
        //         }
        //     }
        //
        const data = this.safeDict(message, 'params');
        if (data !== undefined) {
            const channel = this.safeString(data, 'channel');
            const parts = channel.split('.');
            const name = this.safeString(parts, 0);
            const methods = {
                'trades': this.handleTrade,
                'order_book': this.handleOrderBook,
                'markets_summary': this.handleTicker,
                // ...
            };
            const method = this.safeValue(methods, name);
            if (method !== undefined) {
                method.call(this, client, message);
            }
        }
    }
}

module.exports = paradex;
