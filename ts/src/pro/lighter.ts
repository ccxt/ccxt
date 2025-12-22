//  ---------------------------------------------------------------------------

import Precise from '../base/Precise.js';
import type { Dict, Int, Liquidation, OrderBook, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import { ArrayCache } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';
import lighterRest from '../lighter.js';

//  ---------------------------------------------------------------------------

export default class lighter extends lighterRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
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
                'watchBalance': false,
                'watchLiquidations': true,
                'watchLiquidationsForSymbols': false,
                'watchMyLiquidations': false,
                'watchMyLiquidationsForSymbols': false,
                'watchOHLCV': false,
                'watchOHLCVForSymbols': false,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchPositions': false,
                'watchFundingRate': false,
                'watchFundingRates': false,
                'unWatchOrderBook': true,
                'unWatchTicker': true,
                'unWatchTickers': true,
                'unWatchTrades': true,
                'unWatchMarkPrice': true,
                'unWatchMarkPrices': true,
                'unWatchLiquidations': true,
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

    getMessageHash (unifiedChannel: string, symbol: Str = undefined, extra: Str = undefined) {
        let hash = unifiedChannel;
        if (symbol !== undefined) {
            hash += '::' + symbol;
        } else {
            hash += 's'; // tickers, orderbooks, ohlcvs ...
        }
        if (extra !== undefined) {
            hash += '::' + extra;
        }
        return hash;
    }

    async subscribePublic (messageHash, params = {}) {
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'type': 'subscribe',
        };
        const subscription: Dict = {
            'messageHash': messageHash,
            'params': params,
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
    }

    async subscribePublicMultiple (messageHashes, params = {}) {
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'type': 'subscribe',
        };
        const subscription: Dict = {
            'messageHashes': messageHashes,
            'params': params,
        };
        return await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes, subscription);
    }

    async unsubscribePublic (messageHash, params = {}) {
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'type': 'unsubscribe',
        };
        const subscription: Dict = {
            'messageHash': messageHash,
            'params': params,
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 'price');
        const amount = this.safeFloat (delta, 'size');
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBookMessage (client: Client, message, orderbook) {
        const data = this.safeDict (message, 'order_book', {});
        this.handleDeltas (orderbook['asks'], this.safeList (data, 'asks', []));
        this.handleDeltas (orderbook['bids'], this.safeList (data, 'bids', []));
        orderbook['nonce'] = this.safeInteger (data, 'offset');
        const timestamp = this.safeInteger (message, 'timestamp');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    handleOrderBook (client: Client, message) {
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
        const data = this.safeDict (message, 'order_book', {});
        const channel = this.safeString (message, 'channel', '');
        const parts = channel.split (':');
        const marketId = parts[1];
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (message, 'timestamp');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        const type = this.safeString (message, 'type', '');
        if (type === 'subscribed/order_book') {
            const parsed = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'size');
            parsed['nonce'] = this.safeInteger (data, 'offset');
            orderbook.reset (parsed);
        } else if (type === 'update/order_book') {
            this.handleOrderBookMessage (client, message, orderbook);
        }
        const messageHash = this.getMessageHash ('orderbook', symbol);
        client.resolve (orderbook, messageHash);
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
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'channel': 'order_book/' + market['id'],
        };
        const messageHash = this.getMessageHash ('orderbook', symbol);
        const orderbook = await this.subscribePublic (messageHash, this.extend (request, params));
        return orderbook.limit ();
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
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'channel': 'order_book/' + market['id'],
        };
        const messageHash = this.getMessageHash ('unsubscribe', symbol);
        return await this.unsubscribePublic (messageHash, this.extend (request, params));
    }

    handleTicker (client: Client, message) {
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
        const data = this.safeDict (message, 'market_stats', {});
        const channel = this.safeString (message, 'channel');
        if (channel === 'market_stats:all') {
            const marketIds = Object.keys (data);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const market = this.safeMarket (marketId);
                const symbol = market['symbol'];
                const ticker = this.parseTicker (data[marketId], market);
                this.tickers[symbol] = ticker;
                client.resolve (ticker, this.getMessageHash ('ticker', symbol));
                client.resolve (ticker, this.getMessageHash ('ticker'));
            }
        } else {
            const marketId = this.safeString (data, 'market_id');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const ticker = this.parseTicker (data, market);
            this.tickers[symbol] = ticker;
            client.resolve (ticker, this.getMessageHash ('ticker', symbol));
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
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'channel': 'market_stats/' + market['id'],
        };
        const messageHash = this.getMessageHash ('ticker', symbol);
        return await this.subscribePublic (messageHash, this.extend (request, params));
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
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'channel': 'market_stats/' + market['id'],
        };
        const messageHash = this.getMessageHash ('unsubscribe', symbol);
        return await this.unsubscribePublic (messageHash, this.extend (request, params));
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
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request: Dict = {
            'channel': 'market_stats/all',
        };
        const messageHashes = [];
        if (symbols === undefined || symbols.length === 0) {
            messageHashes.push (this.getMessageHash ('ticker'));
        } else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push (this.getMessageHash ('ticker', symbol));
            }
        }
        const newTicker = await this.subscribePublicMultiple (messageHashes, this.extend (request, params));
        if (this.newUpdates) {
            const result = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
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
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        const request: Dict = {
            'channel': 'market_stats/all',
        };
        const messageHash = this.getMessageHash ('unsubscribe');
        return await this.unsubscribePublic (messageHash, this.extend (request, params));
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
    async watchMarkPrice (symbol: string, params = {}): Promise<Ticker> {
        return await this.watchTicker (symbol, params);
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
    async watchMarkPrices (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        return await this.watchTickers (symbols, params);
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
    async unWatchMarkPrice (symbol: string, params = {}): Promise<any> {
        return await this.unWatchTicker (symbol, params);
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
    async unWatchMarkPrices (symbols: Strings = undefined, params = {}): Promise<any> {
        return await this.unWatchTickers (symbols, params);
    }

    parseWsTrade (trade, market = undefined) {
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
        const timestamp = this.safeInteger (trade, 'timestamp');
        const tradeId = this.safeString (trade, 'trade_id');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'size');
        const isMakerAsk = this.safeBool (trade, 'is_maker_ask');
        const side = (isMakerAsk === true) ? 'sell' : 'buy';
        const makerFeeRate = this.safeString (market, 'maker_fee');
        const maker = Precise.stringDiv (makerFeeRate, '100');
        const feeAmount = Precise.stringMul (maker, makerFeeRate);
        return this.safeTrade ({
            'info': trade,
            'id': tradeId,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'type': undefined,
            'side': side,
            'takerOrMaker': 'maker',
            'price': priceString,
            'amount': amountString,
            'cost': this.safeString (trade, 'usd_amount'),
            'fee': {
                'cost': feeAmount,
                'currency': 'USDC',
            },
        }, market);
    }

    handleTrades (client: Client, message) {
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
        const liquidationData = this.safeList (message, 'liquidation_trades', []);
        if (liquidationData.length > 0) {
            this.handleLiquidation (client, message);
        }
        const data = this.safeList (message, 'trades', []);
        const channel = this.safeString (message, 'channel', '');
        const parts = channel.split (':');
        const marketId = parts[1];
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseWsTrade (data[i], market);
            stored.append (trade);
        }
        const messageHash = this.getMessageHash ('trade', symbol);
        client.resolve (stored, messageHash);
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
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'channel': 'trade/' + market['id'],
        };
        const messageHash = this.getMessageHash ('trade', symbol);
        return await this.subscribePublic (messageHash, this.extend (request, params));
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
    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'channel': 'trade/' + market['id'],
        };
        const messageHash = this.getMessageHash ('unsubscribe', symbol);
        return await this.unsubscribePublic (messageHash, this.extend (request, params));
    }

    parseWsLiquidation (liquidation, market = undefined) {
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
        const timestamp = this.safeInteger (liquidation, 'timestamp');
        return this.safeLiquidation ({
            'info': liquidation,
            'symbol': market['symbol'],
            'contracts': undefined,
            'contractSize': undefined,
            'price': this.safeString (liquidation, 'price'),
            'side': this.safeString (liquidation, 'size'),
            'baseValue': undefined,
            'quoteValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        });
    }

    handleLiquidation (client: Client, message) {
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
        const data = this.safeList (message, 'liquidation_trades', []);
        const channel = this.safeString (message, 'channel', '');
        const parts = channel.split (':');
        const marketId = parts[1];
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.liquidations, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'liquidationsLimit', 1000);
            stored = new ArrayCache (limit);
            this.liquidations[symbol] = stored;
        }
        for (let i = 0; i < data.length; i++) {
            const liquidation = this.parseWsLiquidation (data[i], market);
            stored.append (liquidation);
        }
        const messageHash = this.getMessageHash ('liquidations', symbol);
        client.resolve (stored, messageHash);
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
    async watchLiquidations (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Liquidation[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'channel': 'trade/' + market['id'],
        };
        const messageHash = this.getMessageHash ('liquidations', symbol);
        return await this.subscribePublic (messageHash, this.extend (request, params));
    }

    /**
     * @method
     * @name lighter#unWatchLiquidations
     * @description unWatch the public liquidations of a trading pair
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    // TODO: check UnWatchLiquidationsOptions in go
    // async unWatchLiquidations (symbol: string, params = {}): Promise<any> {
    //     await this.loadMarkets ();
    //     const market = this.market (symbol);
    //     const request: Dict = {
    //         'channel': 'trade/' + market['id'],
    //     };
    //     const messageHash = this.getMessageHash ('unsubscribe', symbol);
    //     return await this.unsubscribePublic (messageHash, this.extend (request, params));
    // }

    handleErrorMessage (client, message) {
        //
        //     {
        //         "error": {
        //             "code": 30005,
        //             "message": "Invalid Channel:  (marketId)"
        //         }
        //     }
        //
        const error = this.safeDict (message, 'error');
        try {
            if (error !== undefined) {
                const code = this.safeString (message, 'code');
                if (code !== undefined) {
                    const feedback = this.id + ' ' + this.json (message);
                    this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                }
            }
        } catch (e) {
            client.reject (e);
        }
        return true;
    }

    handleMessage (client: Client, message) {
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        const type = this.safeString (message, 'type', '');
        if (type === 'ping') {
            this.handlePing (client, message);
            return;
        }
        const channel = this.safeString (message, 'channel', '');
        if (channel.indexOf ('order_book:') >= 0) {
            this.handleOrderBook (client, message);
            return;
        }
        if (channel.indexOf ('market_stats:') >= 0) {
            this.handleTicker (client, message);
            return;
        }
        if (channel.indexOf ('trade:') >= 0) {
            this.handleTrades (client, message);
            return;
        }
        if (channel === '') {
            this.handleSubscriptionStatus (client, message);
        }
    }

    handleSubscriptionStatus (client: Client, message) {
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
        const type = this.safeString (message, 'type', '');
        const id = this.safeString (message, 'session_id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeDict (subscriptionsById, id, {});
        if (type === 'unsubscribed') {
            this.handleUnSubscription (client, subscription);
        }
        return message;
    }

    handleUnSubscription (client: Client, subscription: Dict) {
        const messageHashes = this.safeList (subscription, 'messageHashes', []);
        const subMessageHashes = this.safeList (subscription, 'subMessageHashes', []);
        for (let i = 0; i < messageHashes.length; i++) {
            const unsubHash = messageHashes[i];
            const subHash = subMessageHashes[i];
            this.cleanUnsubscription (client, subHash, unsubHash);
        }
        this.cleanCache (subscription);
    }

    handlePing (client: Client, message) {
        //
        //     { "type": "ping" }
        //
        this.spawn (this.pong, client, message);
    }

    async pong (client, message) {
        const request: Dict = {
            'type': 'pong',
        };
        await client.send (request);
    }
}
