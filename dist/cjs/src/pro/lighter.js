'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Precise = require('../base/Precise.js');
var Cache = require('../base/ws/Cache.js');
var lighter$1 = require('../lighter.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class lighter extends lighter$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchMarkPrice': true,
                'watchMarkPrices': true,
                'watchTickers': true,
                'watchBidsAsks': false,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchOrderBookForSymbols': false,
                'watchBalance': true,
                'watchLiquidations': true,
                'watchLiquidationsForSymbols': false,
                'watchMyLiquidations': false,
                'watchMyLiquidationsForSymbols': false,
                'watchOHLCV': false,
                'watchOHLCVForSymbols': false,
                'watchOrders': true,
                'watchMyTrades': true,
                'watchPositions': false,
                'watchFundingRate': false,
                'watchFundingRates': false,
                'unWatchOrderBook': true,
                'unWatchTicker': true,
                'unWatchTickers': true,
                'unWatchTrades': true,
                'unWatchMyTrades': true,
                'unWatchMarkPrice': true,
                'unWatchMarkPrices': true,
                'unWatchOrders': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://mainnet.zklighter.elliot.ai/stream',
                },
                'test': {
                    'ws': 'wss://testnet.zklighter.elliot.ai/stream',
                },
            },
            'options': {},
        });
    }
    getMessageHash(unifiedChannel, symbol = undefined, extra = undefined) {
        let hash = unifiedChannel;
        if (symbol !== undefined) {
            hash += '::' + symbol;
        }
        else {
            hash += 's'; // tickers, orderbooks, ohlcvs ...
        }
        if (extra !== undefined) {
            hash += '::' + extra;
        }
        return hash;
    }
    async subscribePublic(messageHash, params = {}) {
        const url = this.urls['api']['ws'];
        const request = {
            'type': 'subscribe',
        };
        const subscription = {
            'messageHash': messageHash,
            'params': params,
        };
        return await this.watch(url, messageHash, this.extend(request, params), messageHash, subscription);
    }
    async subscribePublicMultiple(messageHashes, params = {}) {
        const url = this.urls['api']['ws'];
        const request = {
            'type': 'subscribe',
        };
        const subscription = {
            'messageHashes': messageHashes,
            'params': params,
        };
        return await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes, subscription);
    }
    async unsubscribe(messageHash, params = {}) {
        const url = this.urls['api']['ws'];
        const request = {
            'type': 'unsubscribe',
        };
        const subscription = {
            'messageHash': messageHash,
            'params': params,
        };
        return await this.watch(url, messageHash, this.extend(request, params), messageHash, subscription);
    }
    async subscribePrivate(messageHash, params = {}) {
        await this.preLoadLighterLibrary();
        params['auth'] = this.createAuth(params);
        return await this.subscribePublic(messageHash, params);
    }
    handleDelta(bookside, delta) {
        const price = this.safeFloat(delta, 'price');
        const amount = this.safeFloat(delta, 'size');
        bookside.store(price, amount);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    handleOrderBookMessage(client, message, orderbook) {
        const data = this.safeDict(message, 'order_book', {});
        this.handleDeltas(orderbook['asks'], this.safeList(data, 'asks', []));
        this.handleDeltas(orderbook['bids'], this.safeList(data, 'bids', []));
        orderbook['nonce'] = this.safeInteger(data, 'offset');
        const timestamp = this.safeInteger(message, 'timestamp');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        return orderbook;
    }
    handleOrderBook(client, message) {
        //
        // {
        //     "channel": "order_book:0",
        //     "offset": 11413309,
        //     "order_book": {
        //         "code": 0,
        //         "asks": [
        //             {
        //                 "price": "2979.64",
        //                 "size": "61.9487"
        //             }
        //         ],
        //         "bids": [
        //             {
        //                 "price": "2979.36",
        //                 "size": "0.0000"
        //             }
        //         ],
        //         "offset": 11413309,
        //         "nonce": 3107818665
        //     },
        //     "timestamp": 1763448665923,
        //     "type": "update/order_book"
        // }
        //
        const data = this.safeDict(message, 'order_book', {});
        const channel = this.safeString(message, 'channel', '');
        const parts = channel.split(':');
        const marketId = parts[1];
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger(message, 'timestamp');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook();
        }
        const orderbook = this.orderbooks[symbol];
        const type = this.safeString(message, 'type', '');
        if (type === 'subscribed/order_book') {
            const parsed = this.parseOrderBook(data, symbol, timestamp, 'bids', 'asks', 'price', 'size');
            parsed['nonce'] = this.safeInteger(data, 'offset');
            orderbook.reset(parsed);
        }
        else if (type === 'update/order_book') {
            this.handleOrderBookMessage(client, message, orderbook);
        }
        const messageHash = this.getMessageHash('orderbook', symbol);
        client.resolve(orderbook, messageHash);
    }
    /**
     * @method
     * @name lighter#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'channel': 'order_book/' + market['id'],
        };
        const messageHash = this.getMessageHash('orderbook', symbol);
        const orderbook = await this.subscribePublic(messageHash, this.extend(request, params));
        return orderbook.limit();
    }
    /**
     * @method
     * @name lighter#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#order-book
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'channel': 'order_book/' + market['id'],
        };
        const messageHash = this.getMessageHash('unsubscribe', symbol);
        return await this.unsubscribe(messageHash, this.extend(request, params));
    }
    handleTicker(client, message) {
        //
        // watchTicker
        //     {
        //         "channel": "market_stats:0",
        //         "market_stats": {
        //             "market_id": 0,
        //             "index_price": "3015.56",
        //             "mark_price": "3013.91",
        //             "open_interest": "122736286.659423",
        //             "open_interest_limit": "72057594037927936.000000",
        //             "funding_clamp_small": "0.0500",
        //             "funding_clamp_big": "4.0000",
        //             "last_trade_price": "3013.13",
        //             "current_funding_rate": "0.0012",
        //             "funding_rate": "0.0012",
        //             "funding_timestamp": 1763532000004,
        //             "daily_base_token_volume": 643235.2763,
        //             "daily_quote_token_volume": 1983505435.673896,
        //             "daily_price_low": 2977.42,
        //             "daily_price_high": 3170.81,
        //             "daily_price_change": -0.3061987051035322
        //         },
        //         "type": "update/market_stats"
        //     }
        //
        // watchTickers
        // {
        //     "channel": "market_stats:all",
        //     "market_stats": {
        //         "96": {
        //             "market_id": 96,
        //             "index_price": "1.15901",
        //             "mark_price": "1.15954",
        //             "open_interest": "19392952.260530",
        //             "open_interest_limit": "50000000000000.000000",
        //             "funding_clamp_small": "0.0500",
        //             "funding_clamp_big": "4.0000",
        //             "last_trade_price": "1.15955",
        //             "current_funding_rate": "0.0000",
        //             "funding_rate": "0.0000",
        //             "funding_timestamp": 1763532000004,
        //             "daily_base_token_volume": 117634224.1,
        //             "daily_quote_token_volume": 136339744.383989,
        //             "daily_price_low": 1.15774,
        //             "daily_price_high": 1.16105,
        //             "daily_price_change": -0.004311757299805109
        //         }
        //     },
        //     "type": "update/market_stats"
        // }
        //
        const data = this.safeDict(message, 'market_stats', {});
        const channel = this.safeString(message, 'channel');
        if (channel === 'market_stats:all') {
            const marketIds = Object.keys(data);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const market = this.safeMarket(marketId);
                const symbol = market['symbol'];
                const ticker = this.parseTicker(data[marketId], market);
                this.tickers[symbol] = ticker;
                client.resolve(ticker, this.getMessageHash('ticker', symbol));
                client.resolve(ticker, this.getMessageHash('ticker'));
            }
        }
        else {
            const marketId = this.safeString(data, 'market_id');
            const market = this.safeMarket(marketId);
            const symbol = market['symbol'];
            const ticker = this.parseTicker(data, market);
            this.tickers[symbol] = ticker;
            client.resolve(ticker, this.getMessageHash('ticker', symbol));
        }
    }
    /**
     * @method
     * @name lighter#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'channel': 'market_stats/' + market['id'],
        };
        const messageHash = this.getMessageHash('ticker', symbol);
        return await this.subscribePublic(messageHash, this.extend(request, params));
    }
    /**
     * @method
     * @name lighter#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'channel': 'market_stats/' + market['id'],
        };
        const messageHash = this.getMessageHash('unsubscribe', symbol);
        return await this.unsubscribe(messageHash, this.extend(request, params));
    }
    /**
     * @method
     * @name lighter#watchTickers
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {
            'channel': 'market_stats/all',
        };
        const messageHashes = [];
        let symbolsLength = 0;
        if (symbols !== undefined) {
            symbolsLength = symbols.length;
        }
        if (symbolsLength === 0) {
            messageHashes.push(this.getMessageHash('ticker'));
        }
        else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push(this.getMessageHash('ticker', symbol));
            }
        }
        const newTicker = await this.subscribePublicMultiple(messageHashes, this.extend(request, params));
        if (this.newUpdates) {
            const result = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    /**
     * @method
     * @name lighter#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'channel': 'market_stats/all',
        };
        const messageHash = this.getMessageHash('unsubscribe');
        return await this.unsubscribe(messageHash, this.extend(request, params));
    }
    /**
     * @method
     * @name lighter#watchMarkPrice
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description watches a mark price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchMarkPrice(symbol, params = {}) {
        return await this.watchTicker(symbol, params);
    }
    /**
     * @method
     * @name lighter#watchMarkPrices
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description watches mark prices
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchMarkPrices(symbols = undefined, params = {}) {
        return await this.watchTickers(symbols, params);
    }
    /**
     * @method
     * @name lighter#unWatchMarkPrice
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description unWatches a mark price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchMarkPrice(symbol, params = {}) {
        return await this.unWatchTicker(symbol, params);
    }
    /**
     * @method
     * @name lighter#unWatchMarkPrices
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description unWatches mark prices
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchMarkPrices(symbols = undefined, params = {}) {
        return await this.unWatchTickers(symbols, params);
    }
    parseWsTrade(trade, market = undefined) {
        //
        //     {
        //         "trade_id": 526801155,
        //         "tx_hash": "1998d9df580acb7540aa141cc369d6ef926d003b3062196d2007bca15f978ab208e0caae4ac5872b",
        //         "type": "trade",
        //         "market_id": 0,
        //         "size": "0.0346",
        //         "price": "3028.85",
        //         "usd_amount": "104.798210",
        //         "ask_id": 281475673670566,
        //         "bid_id": 562949291740362,
        //         "ask_client_id": 76303170,
        //         "bid_client_id": 27601,
        //         "ask_account_id": 99349,
        //         "bid_account_id": 243008,
        //         "is_maker_ask": false,
        //         "block_height": 102322769,
        //         "timestamp": 1763623734215,
        //         "taker_position_size_before": "0.0346",
        //         "taker_entry_quote_before": "104.359926",
        //         "taker_initial_margin_fraction_before": 500,
        //         "taker_position_sign_changed": true,
        //         "maker_fee": 20,
        //         "maker_position_size_before": "2.1277",
        //         "maker_entry_quote_before": "6444.179555",
        //         "maker_initial_margin_fraction_before": 200
        //     }
        //
        const timestamp = this.safeInteger(trade, 'timestamp');
        const tradeId = this.safeString(trade, 'trade_id');
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString(trade, 'size');
        const isMakerAsk = this.safeBool(trade, 'is_maker_ask');
        const side = isMakerAsk ? 'buy' : 'sell';
        return this.safeTrade({
            'info': trade,
            'id': tradeId,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': this.safeSymbol(undefined, market),
            'type': undefined,
            'side': side,
            'takerOrMaker': 'taker',
            'price': priceString,
            'amount': amountString,
            'cost': this.safeString(trade, 'usd_amount'),
            'fee': undefined,
        }, market);
    }
    handleTrades(client, message) {
        //
        //     {
        //         "channel": "trade:0",
        //         "liquidation_trades": [],
        //         "nonce": 3159738569,
        //         "trades": [
        //             {
        //                 "trade_id": 526801155,
        //                 "tx_hash": "1998d9df580acb7540aa141cc369d6ef926d003b3062196d2007bca15f978ab208e0caae4ac5872b",
        //                 "type": "trade",
        //                 "market_id": 0,
        //                 "size": "0.0346",
        //                 "price": "3028.85",
        //                 "usd_amount": "104.798210",
        //                 "ask_id": 281475673670566,
        //                 "bid_id": 562949291740362,
        //                 "ask_client_id": 76303170,
        //                 "bid_client_id": 27601,
        //                 "ask_account_id": 99349,
        //                 "bid_account_id": 243008,
        //                 "is_maker_ask": false,
        //                 "block_height": 102322769,
        //                 "timestamp": 1763623734215,
        //                 "taker_position_size_before": "0.0346",
        //                 "taker_entry_quote_before": "104.359926",
        //                 "taker_initial_margin_fraction_before": 500,
        //                 "taker_position_sign_changed": true,
        //                 "maker_fee": 20,
        //                 "maker_position_size_before": "2.1277",
        //                 "maker_entry_quote_before": "6444.179555",
        //                 "maker_initial_margin_fraction_before": 200
        //             }
        //         ],
        //         "type": "subscribed/trade"
        //     }
        //
        const liquidationData = this.safeList(message, 'liquidation_trades', []);
        const liquidationDataLength = liquidationData.length;
        if (liquidationDataLength > 0) {
            this.handleLiquidation(client, message);
        }
        const data = this.safeList(message, 'trades', []);
        const channel = this.safeString(message, 'channel', '');
        const parts = channel.split(':');
        const marketId = parts[1];
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            const iReversed = dataLength - 1 - i;
            const trade = this.parseWsTrade(data[iReversed], market);
            stored.append(trade);
        }
        const messageHash = this.getMessageHash('trade', symbol);
        client.resolve(stored, messageHash);
    }
    /**
     * @method
     * @name lighter#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'channel': 'trade/' + market['id'],
        };
        const messageHash = this.getMessageHash('trade', market['symbol']);
        const trades = await this.subscribePublic(messageHash, this.extend(request, params));
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name lighter#unWatchTrades
     * @description unsubscribe from the trades channel
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchTrades(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'channel': 'trade/' + market['id'],
        };
        const messageHash = this.getMessageHash('unsubscribe', symbol);
        return await this.unsubscribe(messageHash, this.extend(request, params));
    }
    parseWsOrderTrade(trade, market = undefined) {
        //
        //     {
        //         "trade_id": 526801155,
        //         "tx_hash": "1998d9df580acb7540aa141cc369d6ef926d003b3062196d2007bca15f978ab208e0caae4ac5872b",
        //         "type": "trade",
        //         "market_id": 0,
        //         "size": "0.0346",
        //         "price": "3028.85",
        //         "usd_amount": "104.798210",
        //         "ask_id": 281475673670566,
        //         "bid_id": 562949291740362,
        //         "ask_client_id": 76303170,
        //         "bid_client_id": 27601,
        //         "ask_account_id": 99349,
        //         "bid_account_id": 243008,
        //         "is_maker_ask": false,
        //         "block_height": 102322769,
        //         "timestamp": 1763623734215,
        //         "taker_position_size_before": "0.0346",
        //         "taker_entry_quote_before": "104.359926",
        //         "taker_initial_margin_fraction_before": 500,
        //         "taker_position_sign_changed": true,
        //         "maker_fee": 20,
        //         "maker_position_size_before": "2.1277",
        //         "maker_entry_quote_before": "6444.179555",
        //         "maker_initial_margin_fraction_before": 200
        //     }
        //
        const timestamp = this.safeInteger(trade, 'timestamp');
        const tradeId = this.safeString(trade, 'trade_id');
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString(trade, 'size');
        const costString = this.safeString(trade, 'usd_amount');
        const isMakerAsk = this.safeBool(trade, 'is_maker_ask');
        const side = isMakerAsk ? 'buy' : 'sell';
        const accountIndex = this.safeInteger(trade, 'accountIndex');
        let order = undefined;
        let takerOrMaker = undefined;
        if (accountIndex !== undefined) {
            if (this.safeInteger(trade, 'bid_account_id') === accountIndex) {
                order = this.safeString(trade, 'bid_id');
                takerOrMaker = isMakerAsk ? 'taker' : 'maker';
            }
            else if (this.safeInteger(trade, 'ask_account_id') === accountIndex) {
                order = this.safeString(trade, 'ask_id');
                takerOrMaker = isMakerAsk ? 'maker' : 'taker';
            }
        }
        let fee = undefined;
        if (takerOrMaker !== undefined) {
            const feeRateRaw = (takerOrMaker === 'maker') ? this.safeString(trade, 'maker_fee') : this.safeString(trade, 'taker_fee');
            const feeRate = (feeRateRaw !== undefined) ? Precise["default"].stringDiv(feeRateRaw, '1000000') : '0';
            const feeAmount = Precise["default"].stringMul(costString, feeRate);
            fee = {
                'cost': feeAmount,
                'currency': 'USDC',
                'rate': feeRate,
            };
        }
        return this.safeTrade({
            'info': trade,
            'id': tradeId,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': this.safeSymbol(undefined, market),
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }
    handleMyTrades(client, message) {
        //
        //     {
        //         "channel": "account_all_trades:723310",
        //         "trades": {
        //              13: [{
        //                  "trade_id": 526801155,
        //                  "tx_hash": "1998d9df580acb7540aa141cc369d6ef926d003b3062196d2007bca15f978ab208e0caae4ac5872b",
        //                  "type": "trade",
        //                  "market_id": 0,
        //                  "size": "0.0346",
        //                  "price": "3028.85",
        //                  "usd_amount": "104.798210",
        //                  "ask_id": 281475673670566,
        //                  "bid_id": 562949291740362,
        //                  "ask_client_id": 76303170,
        //                  "bid_client_id": 27601,
        //                  "ask_account_id": 99349,
        //                  "bid_account_id": 243008,
        //                  "is_maker_ask": false,
        //                  "block_height": 102322769,
        //                  "timestamp": 1763623734215,
        //                  "taker_position_size_before": "0.0346",
        //                  "taker_entry_quote_before": "104.359926",
        //                  "taker_initial_margin_fraction_before": 500,
        //                  "taker_position_sign_changed": true,
        //                  "maker_fee": 20,
        //                  "maker_position_size_before": "2.1277",
        //                  "maker_entry_quote_before": "6444.179555",
        //                  "maker_initial_margin_fraction_before": 200
        //              }]
        //         },
        //         "type": "update/account_all_trades"
        //     }
        //
        const channel = this.safeString(message, 'channel', '');
        const parts = channel.split(':');
        const accountIndex = parts[1];
        const data = this.safeDict(message, 'trades', {});
        const marketIds = Object.keys(data);
        const idsLength = marketIds.length;
        if (idsLength === 0) {
            return false; // nothing to process
        }
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCache(limit);
        }
        const stored = this.myTrades;
        const messageHash = this.getMessageHash('myTrades');
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket(marketId);
            const trades = this.safeList(data, marketId, []);
            const tradesLength = trades.length;
            for (let j = 0; j < tradesLength; j++) {
                const jReversed = tradesLength - 1 - j;
                const tradeRaw = trades[jReversed];
                tradeRaw['accountIndex'] = accountIndex;
                const trade = this.parseWsOrderTrade(tradeRaw, market);
                stored.append(trade);
                const symbol = trade['symbol'];
                if (symbol !== undefined) {
                    const symbolSpecificMessageHash = this.getMessageHash('myTrades', symbol);
                    client.resolve(stored, symbolSpecificMessageHash);
                }
            }
        }
        client.resolve(stored, messageHash);
        return true;
    }
    /**
     * @method
     * @name lighter#watchMyTrades
     * @description subscribe to recent trades of an account.
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#account-all-trades
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'watchMyTrades', 'accountIndex', 'account_index');
        let messageHash = this.getMessageHash('myTrades');
        if (symbol !== undefined) {
            const market = this.market(symbol);
            symbol = market['symbol'];
            messageHash = this.getMessageHash('myTrades', symbol);
        }
        const request = {
            'channel': 'account_all_trades/' + this.numberToString(accountIndex),
        };
        const trades = await this.subscribePublic(messageHash, this.extend(request, params));
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    /**
     * @method
     * @name lighter#unWatchMyTrades
     * @description unsubscribe from the account trades channel
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#account-all-trades
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchMyTrades(symbol = undefined, params = {}) {
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'unWatchMyTrades', 'accountIndex', 'account_index');
        let messageHash = this.getMessageHash('unsubscribe', 'myTrades');
        if (symbol !== undefined) {
            await this.loadMarkets();
            const market = this.market(symbol);
            symbol = market['symbol'];
            messageHash = this.getMessageHash('unsubscribe', symbol);
        }
        const request = {
            'channel': 'account_all_trades/' + accountIndex,
        };
        return await this.unsubscribe(messageHash, this.extend(request, params));
    }
    parseWsLiquidation(liquidation, market = undefined) {
        //
        //     {
        //         "trade_id": 526801155,
        //         "tx_hash": "1998d9df580acb7540aa141cc369d6ef926d003b3062196d2007bca15f978ab208e0caae4ac5872b",
        //         "type": "liquidation",
        //         "market_id": 0,
        //         "size": "0.0346",
        //         "price": "3028.85",
        //         "usd_amount": "104.798210",
        //         "ask_id": 281475673670566,
        //         "bid_id": 562949291740362,
        //         "ask_client_id": 76303170,
        //         "bid_client_id": 27601,
        //         "ask_account_id": 99349,
        //         "bid_account_id": 243008,
        //         "is_maker_ask": false,
        //         "block_height": 102322769,
        //         "timestamp": 1763623734215,
        //         "taker_position_size_before": "0.0346",
        //         "taker_entry_quote_before": "104.359926",
        //         "taker_initial_margin_fraction_before": 500,
        //         "taker_position_sign_changed": true,
        //         "maker_fee": 20,
        //         "maker_position_size_before": "2.1277",
        //         "maker_entry_quote_before": "6444.179555",
        //         "maker_initial_margin_fraction_before": 200
        //     }
        //
        const timestamp = this.safeInteger(liquidation, 'timestamp');
        const isMakerAsk = this.safeBool(liquidation, 'is_maker_ask');
        const side = isMakerAsk ? 'buy' : 'sell';
        const contracts = this.safeString(liquidation, 'size');
        const contractSize = this.safeString(market, 'contractSize');
        const price = this.safeString(liquidation, 'price');
        const baseValue = Precise["default"].stringMul(contracts, contractSize);
        const quoteValue = Precise["default"].stringMul(baseValue, price);
        return this.safeLiquidation({
            'info': liquidation,
            'symbol': market['symbol'],
            'contracts': contracts,
            'contractSize': contractSize,
            'price': price,
            'side': side,
            'baseValue': baseValue,
            'quoteValue': quoteValue,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        });
    }
    handleLiquidation(client, message) {
        //
        //     {
        //         "channel": "trade:0",
        //         "liquidation_trades": [],
        //         "nonce": 3159738569,
        //         "trades": [
        //             {
        //                 "trade_id": 526801155,
        //                 "tx_hash": "1998d9df580acb7540aa141cc369d6ef926d003b3062196d2007bca15f978ab208e0caae4ac5872b",
        //                 "type": "trade",
        //                 "market_id": 0,
        //                 "size": "0.0346",
        //                 "price": "3028.85",
        //                 "usd_amount": "104.798210",
        //                 "ask_id": 281475673670566,
        //                 "bid_id": 562949291740362,
        //                 "ask_client_id": 76303170,
        //                 "bid_client_id": 27601,
        //                 "ask_account_id": 99349,
        //                 "bid_account_id": 243008,
        //                 "is_maker_ask": false,
        //                 "block_height": 102322769,
        //                 "timestamp": 1763623734215,
        //                 "taker_position_size_before": "0.0346",
        //                 "taker_entry_quote_before": "104.359926",
        //                 "taker_initial_margin_fraction_before": 500,
        //                 "taker_position_sign_changed": true,
        //                 "maker_fee": 20,
        //                 "maker_position_size_before": "2.1277",
        //                 "maker_entry_quote_before": "6444.179555",
        //                 "maker_initial_margin_fraction_before": 200
        //             }
        //         ],
        //         "type": "subscribed/trade"
        //     }
        //
        const data = this.safeList(message, 'liquidation_trades', []);
        const channel = this.safeString(message, 'channel', '');
        const parts = channel.split(':');
        const marketId = parts[1];
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue(this.liquidations, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'liquidationsLimit', 1000);
            this.liquidations = new Cache.ArrayCache(limit);
            stored = this.liquidations;
        }
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            const iReversed = dataLength - 1 - i;
            const liquidation = this.parseWsLiquidation(data[iReversed], market);
            stored.append(liquidation);
        }
        const messageHash = this.getMessageHash('liquidations', symbol);
        client.resolve(stored, messageHash);
    }
    /**
     * @method
     * @name lighter#watchLiquidations
     * @description watch the public liquidations of a trading pair
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchLiquidations(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'channel': 'trade/' + market['id'],
        };
        const messageHash = this.getMessageHash('liquidations', symbol);
        return await this.subscribePublic(messageHash, this.extend(request, params));
    }
    /**
     * @method
     * @name lighter#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#account-all-assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', default is 'swap'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        const defaultType = this.safeString2(this.options, 'watchBalance', 'defaultType', 'spot');
        let type = undefined;
        [type, params] = this.handleParamString(params, 'type', defaultType);
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'watchBalance', 'accountIndex', 'account_index');
        const messageHash = this.getMessageHash('balances', undefined, type);
        const request = {};
        if (type === 'spot') {
            request['channel'] = 'account_all_assets/' + this.numberToString(accountIndex);
            return await this.subscribePrivate(messageHash, this.extend(request, params));
        }
        else {
            request['channel'] = 'user_stats/' + this.numberToString(accountIndex);
            return await this.subscribePublic(messageHash, this.extend(request, params));
        }
    }
    handleBalance(client, message) {
        //
        //    spot balance
        //    {
        //        "assets": {
        //              "1": {
        //                    "symbol": "ETH",
        //                    "asset_id": 1,
        //                    "balance": "7.1072",
        //                    "locked_balance": "0.0000"
        //              },
        //              "3": {
        //                    "symbol": "USDC",
        //                    "asset_id": 3,
        //                    "balance": "6343.581906",
        //                    "locked_balance": "297.000000"
        //              }
        //        },
        //        "channel": "account_all_assets:1234",
        //        "timestamp": 1773158679717,
        //        "type": "update/account_all_assets"
        //    }
        //
        //    swap balance
        //    {
        //        "channel": "user_stats:10",
        //        "stats": {
        //            "collateral": "5000.00",
        //            "portfolio_value": "15000.00",
        //            "leverage": "3.0",
        //            "available_balance": "2000.00",
        //            "margin_usage": "0.80",
        //            "buying_power": "4000.00",
        //            "account_trading_mode": 1,
        //            "cross_stats":{
        //               "collateral":"0.000000",
        //               "portfolio_value":"0.000000",
        //               "leverage":"0.00",
        //               "available_balance":"0.000000",
        //               "margin_usage":"0.00",
        //               "buying_power":"0"
        //            },
        //            "total_stats":{
        //               "collateral":"0.000000",
        //               "portfolio_value":"0.000000",
        //               "leverage":"0.00",
        //               "available_balance":"0.000000",
        //               "margin_usage":"0.00",
        //               "buying_power":"0"
        //            }
        //        },
        //        "timestamp": 1773158679717,
        //        "type": "update/user_stats"
        //    }
        //
        const channel = this.safeString(message, 'channel', '');
        let type = 'spot';
        if (channel.indexOf('user_stats:') >= 0) {
            type = 'swap';
        }
        const balance = this.safeDict(this.balance, type, {});
        if (type === 'spot') {
            const assets = this.safeDict(message, 'assets', {});
            const assetIds = Object.keys(assets);
            for (let i = 0; i < assetIds.length; i++) {
                const assetId = assetIds[i];
                const asset = assets[assetId];
                const codeId = this.safeString(asset, 'symbol');
                const code = this.safeCurrencyCode(codeId);
                const account = this.account();
                account['used'] = this.safeString(asset, 'locked_balance');
                account['total'] = this.safeString(asset, 'balance');
                balance[code] = account;
            }
        }
        else {
            const stats = this.safeDict(message, 'stats', {});
            const account = this.account();
            account['free'] = this.safeString(stats, 'available_balance');
            account['total'] = this.safeString(stats, 'collateral');
            account['info'] = stats;
            balance['USDC'] = account;
        }
        const timestamp = this.safeInteger(message, 'timestamp');
        balance['timestamp'] = timestamp;
        balance['datetime'] = this.iso8601(timestamp);
        this.balance[type] = this.safeBalance(balance);
        const messageHash = this.getMessageHash('balances', undefined, type);
        client.resolve(this.balance[type], messageHash);
        return true;
    }
    /**
     * @name lighter#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#account-all-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'watchOrders', 'accountIndex', 'account_index');
        let messageHash = undefined;
        const request = {};
        if (symbol !== undefined) {
            const market = this.market(symbol);
            messageHash = this.getMessageHash('orders', market['symbol']);
            request['channel'] = 'account_orders/' + market['id'] + '/' + this.numberToString(accountIndex);
        }
        else {
            messageHash = this.getMessageHash('orders');
            request['channel'] = 'account_all_orders/' + this.numberToString(accountIndex);
        }
        const orders = await this.subscribePrivate(messageHash, this.extend(request, params));
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    /**
     * @method
     * @name lighter#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#account-all-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async unWatchOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        let accountIndex = undefined;
        [accountIndex, params] = await this.handleAccountIndex(params, 'watchOrders', 'accountIndex', 'account_index');
        let messageHash = undefined;
        const request = {};
        if (symbol !== undefined) {
            const market = this.market(symbol);
            messageHash = this.getMessageHash('orders', market['symbol']);
            request['channel'] = 'account_orders/' + market['id'] + '/' + this.numberToString(accountIndex);
        }
        else {
            messageHash = this.getMessageHash('orders');
            request['channel'] = 'account_all_orders/' + this.numberToString(accountIndex);
        }
        return await this.unsubscribe(messageHash, this.extend(request, params));
    }
    handleOrders(client, message) {
        //
        //    {
        //        "account": {ACCOUNT_INDEX},
        //        "channel": "account_orders:{MARKET_INDEX}",
        //        "nonce": INTEGER,
        //        "orders": {
        //            "{MARKET_INDEX}": [Order] // the only present market index will be the one provided
        //        },
        //        "type": "update/account_orders"
        //    }
        //
        //    {
        //        "channel": "account_all_orders:{ACCOUNT_ID}",
        //        "orders": {
        //            "{MARKET_INDEX}": [Order]
        //        },
        //        "type": "update/account_all_orders"
        //    }
        //
        const data = this.safeDict(message, 'orders', {});
        const marketIds = Object.keys(data);
        const idsLength = marketIds.length;
        if (idsLength === 0) {
            return false; // nothing to process
        }
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCache(limit);
        }
        const stored = this.orders;
        const messageHash = this.getMessageHash('orders');
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket(marketId);
            const orders = this.safeList(data, marketId, []);
            for (let j = 0; j < orders.length; j++) {
                const order = this.parseOrder(orders[j], market);
                stored.append(order);
                const symbol = order['symbol'];
                if (symbol !== undefined) {
                    const symbolSpecificMessageHash = this.getMessageHash('orders', symbol);
                    client.resolve(stored, symbolSpecificMessageHash);
                }
            }
        }
        client.resolve(stored, messageHash);
        return true;
    }
    handleErrorMessage(client, message) {
        //
        //     {
        //         "error": {
        //             "code": 30005,
        //             "message": "Invalid Channel:  (marketId)"
        //         }
        //     }
        //
        const error = this.safeDict(message, 'error');
        try {
            if (error !== undefined) {
                const code = this.safeString(error, 'code');
                if (code !== undefined) {
                    const feedback = this.id + ' ' + this.json(message);
                    this.throwExactlyMatchedException(this.exceptions['exact'], code, feedback);
                }
            }
        }
        catch (e) {
            client.reject(e);
        }
        return true;
    }
    handleMessage(client, message) {
        if (!this.handleErrorMessage(client, message)) {
            return;
        }
        const type = this.safeString(message, 'type', '');
        if (type === 'ping') {
            this.handlePing(client, message);
            return;
        }
        const channel = this.safeString(message, 'channel', '');
        if (channel.indexOf('order_book:') >= 0) {
            this.handleOrderBook(client, message);
            return;
        }
        if (channel.indexOf('market_stats:') >= 0) {
            this.handleTicker(client, message);
            return;
        }
        if (channel.indexOf('trade:') >= 0) {
            this.handleTrades(client, message);
            return;
        }
        if (channel.indexOf('account_all_trades:') >= 0) {
            this.handleMyTrades(client, message);
            return;
        }
        if (channel.indexOf('account_all_assets:') >= 0) {
            this.handleBalance(client, message);
            return;
        }
        if (channel.indexOf('user_stats:') >= 0) {
            this.handleBalance(client, message);
            return;
        }
        if (channel.indexOf('account_orders:') >= 0) {
            this.handleOrders(client, message);
            return;
        }
        if (channel.indexOf('account_all_orders:') >= 0) {
            this.handleOrders(client, message);
            return;
        }
        if (channel === '') {
            this.handleSubscriptionStatus(client, message);
        }
    }
    handleSubscriptionStatus(client, message) {
        //
        //     {
        //         "session_id": "8d354239-80e0-4b77-8763-87b6fef2f768",
        //         "type": "connected"
        //     }
        //
        //     {
        //         "type": "unsubscribed",
        //         "channel": "order_book:0"
        //     }
        //
        const type = this.safeString(message, 'type', '');
        const id = this.safeString(message, 'session_id');
        const subscriptionsById = this.indexBy(client.subscriptions, 'id');
        const subscription = this.safeDict(subscriptionsById, id, {});
        if (type === 'unsubscribed') {
            this.handleUnSubscription(client, subscription);
        }
        return message;
    }
    handleUnSubscription(client, subscription) {
        const messageHashes = this.safeList(subscription, 'messageHashes', []);
        const subMessageHashes = this.safeList(subscription, 'subMessageHashes', []);
        for (let i = 0; i < messageHashes.length; i++) {
            const unsubHash = messageHashes[i];
            const subHash = subMessageHashes[i];
            this.cleanUnsubscription(client, subHash, unsubHash);
        }
        this.cleanCache(subscription);
    }
    handlePing(client, message) {
        //
        //     { "type": "ping" }
        //
        this.spawn(this.pong, client, message);
    }
    async pong(client, message) {
        const request = {
            'type': 'pong',
        };
        await client.send(request);
    }
}

exports["default"] = lighter;
