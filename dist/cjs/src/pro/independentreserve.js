'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var independentreserve$1 = require('../independentreserve.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class independentreserve extends independentreserve$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchMyTrades': false,
                'watchOrders': false,
                'watchOrderBook': true,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://websockets.independentreserve.com',
                },
            },
            'options': {
                'watchOrderBook': {
                    'checksum': true, // TODO: currently only working for snapshot
                },
            },
            'streaming': {},
            'exceptions': {},
        });
    }
    /**
     * @method
     * @name independentreserve#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'] + '?subscribe=ticker-' + market['base'] + '-' + market['quote'];
        const messageHash = 'trades:' + symbol;
        const trades = await this.watch(url, messageHash, undefined, messageHash);
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        //    {
        //        "Channel": "ticker-btc-usd",
        //        "Nonce": 130,
        //        "Data": {
        //          "TradeGuid": "7a669f2a-d564-472b-8493-6ef982eb1e96",
        //          "Pair": "btc-aud",
        //          "TradeDate": "2023-02-12T10:04:13.0804889+11:00",
        //          "Price": 31640,
        //          "Volume": 0.00079029,
        //          "BidGuid": "ba8a78b5-be69-4d33-92bb-9df0daa6314e",
        //          "OfferGuid": "27d20270-f21f-4c25-9905-152e70b2f6ec",
        //          "Side": "Buy"
        //        },
        //        "Time": 1676156653111,
        //        "Event": "Trade"
        //    }
        //
        const data = this.safeValue(message, 'Data', {});
        const marketId = this.safeString(data, 'Pair');
        const symbol = this.safeSymbol(marketId, undefined, '-');
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const trade = this.parseWsTrade(data);
        stored.append(trade);
        this.trades[symbol] = stored;
        client.resolve(this.trades[symbol], messageHash);
    }
    parseWsTrade(trade, market = undefined) {
        //
        //    {
        //        "TradeGuid": "2f316718-0d0b-4e33-a30c-c2c06f3cfb34",
        //        "Pair": "xbt-aud",
        //        "TradeDate": "2023-02-12T09:22:35.4207494+11:00",
        //        "Price": 31573.8,
        //        "Volume": 0.05,
        //        "BidGuid": "adb63d74-4c02-47f9-9cc3-f287e3b48ab6",
        //        "OfferGuid": "b94d9bc4-addd-4633-a18f-69cf7e1b6f47",
        //        "Side": "Buy"
        //    }
        //
        const datetime = this.safeString(trade, 'TradeDate');
        const marketId = this.safeString(market, 'Pair');
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'TradeGuid'),
            'order': this.safeString(trade, 'orderNo'),
            'symbol': this.safeSymbol(marketId, market, '-'),
            'side': this.safeStringLower(trade, 'Side'),
            'type': undefined,
            'takerOrMaker': undefined,
            'price': this.safeString(trade, 'Price'),
            'amount': this.safeString(trade, 'Volume'),
            'cost': undefined,
            'fee': undefined,
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
        }, market);
    }
    /**
     * @method
     * @name independentreserve#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        if (limit === undefined) {
            limit = 100;
        }
        const limitString = this.numberToString(limit);
        const url = this.urls['api']['ws'] + '/orderbook/' + limitString + '?subscribe=' + market['base'] + '-' + market['quote'];
        const messageHash = 'orderbook:' + symbol + ':' + limitString;
        const subscription = {
            'receivedSnapshot': false,
        };
        const orderbook = await this.watch(url, messageHash, undefined, messageHash, subscription);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //    {
        //        "Channel": "orderbook/1/eth/aud",
        //        "Data": {
        //          "Bids": [
        //            {
        //              "Price": 2198.09,
        //              "Volume": 0.16143952,
        //            },
        //          ],
        //          "Offers": [
        //            {
        //              "Price": 2201.25,
        //              "Volume": 15,
        //            },
        //          ],
        //          "Crc32": 1519697650,
        //        },
        //        "Time": 1676150558254,
        //        "Event": "OrderBookSnapshot",
        //    }
        //
        const event = this.safeString(message, 'Event');
        const channel = this.safeString(message, 'Channel');
        const parts = channel.split('/');
        const depth = this.safeString(parts, 1);
        const baseId = this.safeString(parts, 2);
        const quoteId = this.safeString(parts, 3);
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const symbol = base + '/' + quote;
        const orderBook = this.safeDict(message, 'Data', {});
        const messageHash = 'orderbook:' + symbol + ':' + depth;
        const subscription = this.safeValue(client.subscriptions, messageHash, {});
        const receivedSnapshot = this.safeBool(subscription, 'receivedSnapshot', false);
        const timestamp = this.safeInteger(message, 'Time');
        // let orderbook = this.safeValue (this.orderbooks, symbol);
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook({});
        }
        const orderbook = this.orderbooks[symbol];
        if (event === 'OrderBookSnapshot') {
            const snapshot = this.parseOrderBook(orderBook, symbol, timestamp, 'Bids', 'Offers', 'Price', 'Volume');
            orderbook.reset(snapshot);
            subscription['receivedSnapshot'] = true;
        }
        else {
            const asks = this.safeList(orderBook, 'Offers', []);
            const bids = this.safeList(orderBook, 'Bids', []);
            this.handleDeltas(orderbook['asks'], asks);
            this.handleDeltas(orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601(timestamp);
        }
        const checksum = this.handleOption('watchOrderBook', 'checksum', true);
        if (checksum && receivedSnapshot) {
            const storedAsks = orderbook['asks'];
            const storedBids = orderbook['bids'];
            const asksLength = storedAsks.length;
            const bidsLength = storedBids.length;
            let payload = '';
            for (let i = 0; i < 10; i++) {
                if (i < bidsLength) {
                    payload = payload + this.valueToChecksum(storedBids[i][0]) + this.valueToChecksum(storedBids[i][1]);
                }
            }
            for (let i = 0; i < 10; i++) {
                if (i < asksLength) {
                    payload = payload + this.valueToChecksum(storedAsks[i][0]) + this.valueToChecksum(storedAsks[i][1]);
                }
            }
            const calculatedChecksum = this.crc32(payload, true);
            const responseChecksum = this.safeInteger(orderBook, 'Crc32');
            if (calculatedChecksum !== responseChecksum) {
                const error = new errors.ChecksumError(this.id + ' ' + this.orderbookChecksumMessage(symbol));
                delete client.subscriptions[messageHash];
                delete this.orderbooks[symbol];
                client.reject(error, messageHash);
                return;
            }
        }
        if (receivedSnapshot) {
            client.resolve(orderbook, messageHash);
        }
    }
    valueToChecksum(value) {
        let result = value.toFixed(8);
        result = result.replace('.', '');
        // remove leading zeros
        result = this.parseNumber(result);
        result = this.numberToString(result);
        return result;
    }
    handleDelta(bookside, delta) {
        const bidAsk = this.parseBidAsk(delta, 'Price', 'Volume');
        bookside.storeArray(bidAsk);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    handleHeartbeat(client, message) {
        //
        //    {
        //        "Time": 1676156208182,
        //        "Event": "Heartbeat"
        //    }
        //
        return message;
    }
    handleSubscriptions(client, message) {
        //
        //    {
        //        "Data": [ "ticker-btc-sgd" ],
        //        "Time": 1676157556223,
        //        "Event": "Subscriptions"
        //    }
        //
        return message;
    }
    handleMessage(client, message) {
        const event = this.safeString(message, 'Event');
        const handlers = {
            'Subscriptions': this.handleSubscriptions,
            'Heartbeat': this.handleHeartbeat,
            'Trade': this.handleTrades,
            'OrderBookSnapshot': this.handleOrderBook,
            'OrderBookChange': this.handleOrderBook,
        };
        const handler = this.safeValue(handlers, event);
        if (handler !== undefined) {
            handler.call(this, client, message);
            return;
        }
        throw new errors.NotSupported(this.id + ' received an unsupported message: ' + this.json(message));
    }
}

exports["default"] = independentreserve;
