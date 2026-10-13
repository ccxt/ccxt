
//  ---------------------------------------------------------------------------

import paradexRest from '../paradex.js';
import Precise from '../base/Precise.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Int, Str, Trade, Order, Dict, OrderBook, Ticker, Strings, Tickers, Bool, Market, FundingRate, FundingRates } from '../base/types.js';
import Client from '../base/ws/Client.js';
import type { WsOrderBook } from '../base/ws/OrderBook.js';

//  ---------------------------------------------------------------------------

export default class paradex extends paradexRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchFundingRate': true,
                'watchFundingRates': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchOrderBook': true,
                'watchOrders': true,
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
            'options': {
                // SBE (Simple Binary Encoding) frames on the data channels, see parseSbeMessage. the
                // servers answer a connect without it with a 400, false keeps the JSON feed for any
                // environment that still serves it
                'sbe': true,
                // SBE frames must reach handleMessage as raw bytes, the JSON feed only sends text frames
                'decompressBinary': false,
            },
            'streaming': {},
        });
    }

    getWsUrl (): string {
        const url = this.urls['api']['ws'];
        if (!this.safeBool (this.options, 'sbe', true)) {
            return url;
        }
        // schema 1:2 is what every environment serves: asking for a version above the
        // server cap fails the connect with a 400 rather than downgrading
        return url + '?sbeSchemaId=1&sbeSchemaVersion=2';
    }

    getOrderBookChannel (marketId: Str): string {
        return 'order_book.' + marketId + '.snapshot@15@100ms';
    }

    requestId (): number {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    async authenticate (params: Dict = {}) {
        const url = this.getWsUrl ();
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.reusableFuture ('authenticated');
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const token = await this.authenticateRest ();
            const request: Dict = {
                'jsonrpc': '2.0',
                'id': this.requestId (),
                'method': 'auth',
                'params': {
                    'bearer': token,
                },
            };
            this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
        }
        return await future;
    }

    handleAuthenticationMessage (client: Client, message: Dict) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 1,
        //         "result": { "node_id": "73cf456f7cb78d59" }
        //     }
        //
        const result = this.safeDict (message, 'result');
        if (result !== undefined) {
            // client.resolve (true, messageHash);
            const future = this.safeValue (client.futures, 'authenticated');
            if (future !== undefined) {
                future.resolve (true);
            }
        }
    }

    /**
     * @method
     * @name paradex#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.paradex.trade/ws/web-socket-channels/trades/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let messageHash = 'trades.';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            messageHash += market['id'];
        } else {
            messageHash += 'ALL';
        }
        const url = this.getWsUrl ();
        const request: Dict = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': {
                'channel': messageHash,
            },
        };
        const trades: ArrayCache = await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limitResolved, 'timestamp', true);
    }

    handleTrade (client: Client, message: Dict): Dict {
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
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const parsedTrade = this.parseTrade (data);
        const symbol = parsedTrade['symbol'];
        const messageHash = this.safeString (params, 'channel');
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            stored = new ArrayCache (this.safeInteger (this.options, 'tradesLimit', 1000));
            this.trades[(symbol as string)] = stored;
        }
        stored.append (parsedTrade);
        client.resolve (stored, messageHash);
        // an SBE frame names its market but not the subscription it was sent for,
        // so the trades.ALL subscription is resolved from the per-market channel too
        const isSbe = this.safeBool (message, 'sbe', false);
        if (isSbe && (messageHash !== 'trades.ALL')) {
            client.resolve (stored, 'trades.ALL');
        }
        return message;
    }

    /**
     * @method
     * @name paradex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.paradex.trade/ws/web-socket-channels/order-book/order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const messageHash = this.getOrderBookChannel (market['id']);
        const url = this.getWsUrl ();
        const request: Dict = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': {
                'channel': messageHash,
            },
        };
        const orderbook: WsOrderBook = await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message: Dict) {
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
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const marketId = this.safeString (data, 'market');
        const market = this.safeMarket (marketId);
        const timestamp = this.safeInteger (data, 'last_updated_at');
        const symbol = market['symbol'];
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        // levels go into local arrays first: pushing into orderbookData['bids'] appends to a copy in go
        const bids = [];
        const asks = [];
        const inserts = this.safeList (data, 'inserts');
        for (let i = 0; i < (inserts as any[]).length; i++) {
            const insert = this.safeDict (inserts, i);
            const side = this.safeString (insert, 'side');
            const price = this.safeString (insert, 'price');
            const size = this.safeString (insert, 'size');
            if (side === 'BUY') {
                bids.push ([ price, size ]);
            } else {
                asks.push ([ price, size ]);
            }
        }
        const orderbookData: Dict = {
            'bids': bids,
            'asks': asks,
        };
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook (orderbookData, symbol, timestamp, 'bids', 'asks');
        snapshot['nonce'] = this.safeInteger (data, 'seq_no');
        orderbook.reset (snapshot);
        const messageHash = this.safeString (params, 'channel');
        client.resolve (orderbook, messageHash);
    }

    /**
     * @method
     * @name paradex#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary/markets-summary
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        // the per-market channel: the all-markets one carries a summary for every listed
        // option too, thousands of messages a second, all decoded only to be filtered out
        const channel = 'markets_summary.' + market['id'];
        const url = this.getWsUrl ();
        const request: Dict = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': {
                'channel': channel,
            },
        };
        const messageHash = 'markets_summary.' + market['symbol'];
        return await this.watch (url, messageHash, this.deepExtend (request, params), channel);
    }

    /**
     * @method
     * @name paradex#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary/markets-summary
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsNormalized: Strings = this.marketSymbols (symbols);
        const channel = 'markets_summary';
        const url = this.getWsUrl ();
        const request: Dict = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': {
                'channel': channel,
            },
        };
        const messageHashes: string[] = [];
        if (symbolsNormalized !== undefined && Array.isArray (symbolsNormalized)) {
            for (let i = 0; i < symbolsNormalized.length; i++) {
                const messageHash = channel + '.' + symbolsNormalized[i];
                messageHashes.push (messageHash);
            }
        } else {
            messageHashes.push (channel);
        }
        const newTicker = await this.watchMultiple (url, messageHashes, this.deepExtend (request, params), messageHashes);
        if (this.newUpdates) {
            const result: Dict = {};
            const newTickerSymbol = this.safeString (newTicker, 'symbol');
            if (newTickerSymbol !== undefined) {
                result[newTickerSymbol] = newTicker;
            }
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbolsNormalized);
    }

    /**
     * @method
     * @name paradex#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.paradex.trade/ws/web-socket-channels/orders/orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        await this.authenticate ();
        let messageHash = 'orders';
        let channel = 'orders.';
        const symbolResolved: Str = (symbol !== undefined) ? this.symbol (symbol) : symbol;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            channel += market['id'];
            messageHash += ':' + symbolResolved;
        } else {
            channel += 'ALL';
        }
        const url = this.getWsUrl ();
        const request: Dict = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': {
                'channel': channel,
            },
        };
        const orders: ArrayCache = await this.watch (url, messageHash, this.deepExtend (request, params), channel);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = orders.getLimit (symbolResolved, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbolResolved, since, limitResolved, true);
    }

    handleOrder (client: Client, message: Dict) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "orders.ALL",
        //             "data": {
        //                 "account": "0x4638e3041366aa71720be63e32e53e1223316c7f0d56f7aa617542ed1e7512x",
        //                 "avg_fill_price": "26000",
        //                 "client_id": "x1234",
        //                 "cancel_reason": "",
        //                 "created_at": 1681493746016,
        //                 "flags": ["REDUCE_ONLY"],
        //                 "id": "123456",
        //                 "instruction": "GTC",
        //                 "last_updated_at": 1681493746016,
        //                 "market": "BTC-USD-PERP",
        //                 "price": "26000",
        //                 "remaining_size": "0",
        //                 "side": "BUY",
        //                 "size": "0.05",
        //                 "status": "NEW",
        //                 "type": "LIMIT"
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const parsed = this.parseOrder (data);
        const symbol = this.safeString (parsed, 'symbol');
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        this.orders.append (parsed);
        const messageHash = 'orders';
        client.resolve (this.orders, messageHash);
        if (symbol !== undefined) {
            const symbolMessageHash = messageHash + ':' + symbol;
            client.resolve (this.orders, symbolMessageHash);
        }
    }

    handleTicker (client: Client, message: Dict): Dict {
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
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const channel = this.safeString (params, 'channel');
        const ticker = this.parseTicker (data, market);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, channel);
        // watchTicker waits on the symbol whichever channel, per-market or all, carried it
        const messageHash = 'markets_summary.' + symbol;
        client.resolve (ticker, messageHash);
        return message;
    }

    /**
     * @method
     * @name paradex#watchFundingRate
     * @description watch the current funding rate for a symbol
     * @see https://docs.paradex.trade/ws/web-socket-channels/funding-data-market-symbol/funding-data-market-symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    override async watchFundingRate (symbol: string, params: Dict = {}): Promise<FundingRate> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolValue: string = this.symbol (symbol);
        const channel = 'funding_data';
        const url = this.getWsUrl ();
        const request: Dict = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': {
                'channel': channel,
            },
        };
        const messageHash = channel + '.' + symbolValue;
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    /**
     * @method
     * @name paradex#watchFundingRates
     * @description watch the funding rate for multiple markets
     * @see https://docs.paradex.trade/ws/web-socket-channels/markets-summary/markets-summary
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    override async watchFundingRates (symbols: Strings = undefined, params: Dict = {}): Promise<FundingRates> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsNormalized: Strings = this.marketSymbols (symbols);
        const channel = 'funding_data';
        const url = this.getWsUrl ();
        const request: Dict = {
            'jsonrpc': '2.0',
            'method': 'subscribe',
            'params': {
                'channel': channel,
            },
        };
        const messageHashes: string[] = [];
        if (symbolsNormalized !== undefined) {
            const symbolsLength = symbolsNormalized.length;
            if (symbolsLength > 0) {
                for (let i = 0; i < symbolsNormalized.length; i++) {
                    const messageHash = channel + '.' + symbolsNormalized[i];
                    messageHashes.push (messageHash);
                }
            } else {
                messageHashes.push (channel); // if an empty array is passed, subscribe to all funding rates
            }
        } else {
            messageHashes.push (channel);
        }
        const newFundingRates = await this.watchMultiple (url, messageHashes, this.deepExtend (request, params), messageHashes);
        if (this.newUpdates) {
            const result: Dict = {};
            const newFundingRatesSymbol = this.safeString (newFundingRates, 'symbol');
            if (newFundingRatesSymbol !== undefined) {
                result[newFundingRatesSymbol] = newFundingRates;
            }
            return result;
        }
        return this.filterByArray (this.fundingRates, 'symbol', symbolsNormalized);
    }

    handleFundingRate (client: Client, message: Dict) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "funding_data",
        //             "data": {
        //                 "market": "TRUMP-USD-PERP",
        //                 "funding_index": "-0.551694014226244835",
        //                 "funding_premium": "-0.000509914923994872836",
        //                 "funding_rate": "-0.00014969570582",
        //                 "funding_rate_8h": "-0.00014969",
        //                 "funding_period_hours": 8,
        //                 "created_at": 1771506636154
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const data = this.safeDict (params, 'data', {});
        const fundingRate = this.parseFundingRateWs (data);
        const symbol = fundingRate['symbol'];
        this.fundingRates[(symbol as string)] = fundingRate;
        const channel = this.safeString (params, 'channel');
        // watchFundingRates without symbols waits on the bare channel
        client.resolve (fundingRate, channel);
        if (channel !== undefined) {
            const messageHash = channel + '.' + symbol;
            client.resolve (fundingRate, messageHash);
        }
    }

    parseFundingRateWs (contract: Dict, market: Market = undefined): FundingRate {
        //
        //     {
        //         "market": "TRUMP-USD-PERP",
        //         "funding_index": "-0.551694014226244835",
        //         "funding_premium": "-0.000509914923994872836",
        //         "funding_rate": "-0.00014969570582",
        //         "funding_rate_8h": "-0.00014969",
        //         "funding_period_hours": 8,
        //         "created_at": 1771506636154
        //     }
        //
        const marketId = this.safeString (contract, 'market');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (contract, 'created_at');
        const fundingPeriod = this.safeString (contract, 'funding_period_hours');
        let interval: Str = undefined;
        if (fundingPeriod !== undefined) {
            interval = fundingPeriod + 'h';
        }
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.parseNumber ('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'funding_rate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': interval,
        } as FundingRate;
    }

    parseSbeMessage (message: any): any {
        //
        // Paradex SBE schema 1:2 (https://docs.paradex.trade), little-endian. Every frame is an 8-byte
        // header (blockLength, templateId, schemaId, version as uint16) followed by a fixed block of
        // blockLength bytes, then repeating groups and length-prefixed strings. The frame is rebuilt in
        // the shape of the matching JSON subscription message, so the JSON handlers parse both.
        // Requests, subscribe acks and errors stay JSON text frames.
        //
        // Returns undefined for frames that carry nothing to route: heartbeats, binary acks, template
        // ids this decoder does not know (the schema says to skip them), and malformed frames.
        //
        const frameHex = this.binaryToBase16 (message);
        const frameLength = this.parseToInt (frameHex.length / 2);
        if (frameLength < 8) {
            return undefined;
        }
        const blockLength = this.sbeReadUint (frameHex, 0, 2);
        const templateId = this.sbeReadUint (frameHex, 2, 2);
        const schemaId = this.sbeReadUint (frameHex, 4, 2);
        if ((schemaId !== 1) || (frameLength < this.sum (blockLength, 8))) {
            return undefined;
        }
        let channel: Str = undefined;
        let data: any = undefined;
        if (templateId === 1) {
            data = this.parseSbeTrade (frameHex, blockLength, frameLength);
            if (data !== undefined) {
                channel = 'trades.' + data['market'];
            }
        } else if (templateId === 3) {
            data = this.parseSbeOrderBook (frameHex, blockLength, frameLength);
            if (data !== undefined) {
                channel = this.getOrderBookChannel (data['market']);
            }
        } else if (templateId === 4) {
            data = this.parseSbeMarketSummary (frameHex, blockLength, frameLength);
            channel = 'markets_summary';
        } else if (templateId === 5) {
            data = this.parseSbeFundingData (frameHex, blockLength, frameLength);
            channel = 'funding_data';
        } else if (templateId === 20) {
            data = this.parseSbeOrder (frameHex, blockLength, frameLength);
            if (data !== undefined) {
                channel = 'orders.' + data['market'];
            }
        }
        if (data === undefined) {
            return undefined;
        }
        return {
            'sbe': true,
            'params': {
                'channel': channel,
                'data': data,
            },
        };
    }

    sbeReadUint (frameHex: string, offset: number, length: number): any {
        // a little-endian unsigned integer of at most 4 bytes, so that it stays exact in every language
        const digits = '0123456789abcdef';
        let result = 0;
        let factor = 1;
        let position = offset * 2;
        for (let i = 0; i < length; i++) {
            // plain variables as slice bounds, php gets end - start unparenthesized
            const middle = position + 1;
            const next = position + 2;
            const high = digits.indexOf (frameHex.slice (position, middle));
            const low = digits.indexOf (frameHex.slice (middle, next));
            result = this.sum (result, high * 16 * factor, low * factor);
            factor = factor * 256;
            position = next;
        }
        return result;
    }

    sbeReadInt64 (frameHex: string, offset: number): Str {
        // a signed int64 as a decimal string, undefined for INT64_MIN which the schema uses as null
        const low = this.sbeReadUint (frameHex, offset, 4);
        const high = this.sbeReadUint (frameHex, offset + 4, 4);
        if ((high === 2147483648) && (low === 0)) {
            return undefined;
        }
        if (high === 0) {
            return this.numberToString (low);
        }
        let result = Precise.stringAdd (Precise.stringMul (this.numberToString (high), '4294967296'), this.numberToString (low));
        if (high >= 2147483648) {
            result = Precise.stringSub (result, '18446744073709551616');
        }
        return result;
    }

    sbeReadDecimal (frameHex: string, offset: number): Str {
        // prices, sizes and rates are int64 mantissas with a fixed exponent of -8
        const mantissa = this.sbeReadInt64 (frameHex, offset);
        if (mantissa === undefined) {
            return undefined;
        }
        return Precise.stringDiv (mantissa, '100000000', 8);
    }

    sbeReadTimestamp (frameHex: string, offset: number): Int {
        // timestamps are microseconds, truncated to milliseconds with Precise: a float
        // quotient like 1791906071000.999 is rounded up when php converts it to an int
        const microseconds = this.sbeReadInt64 (frameHex, offset);
        if (microseconds === undefined) {
            return undefined;
        }
        return this.parseToInt (Precise.stringDiv (microseconds, '1000', 0));
    }

    sbeReadEnum (frameHex: string, offset: number, values: Dict): Str {
        const value = this.sbeReadUint (frameHex, offset, 1);
        return this.safeString (values, this.numberToString (value));
    }

    sbeReadString (frameHex: string, offset: number, length: number): string {
        const start = offset * 2;
        const end = this.sum (start, length * 2);
        return this.binaryToString (this.base16ToBinary (frameHex.slice (start, end)));
    }

    sbeReadAddress (frameHex: string, offset: number): string {
        // a 32-byte big-endian account address, printed without leading zeros like the JSON feed
        const rawStart = offset * 2;
        const rawEnd = rawStart + 64;
        const raw = frameHex.slice (rawStart, rawEnd);
        let start = 0;
        let next = 1;
        while ((start < 63) && (raw.slice (start, next) === '0')) {
            start = next;
            next = start + 1;
        }
        return '0x' + raw.slice (start, 64);
    }

    sbeReadVarStrings (frameHex: string, offset: number, count: number, frameLength: number): any {
        // the var-data section: count strings, each prefixed with a uint8 length. Returns undefined
        // when the frame ends before all of them, and only the strings present when a trailing one is
        // absent, which is how a field appended to var-data reads on a frame from before it
        const result: string[] = [];
        let position = offset;
        for (let i = 0; i < count; i++) {
            if (position >= frameLength) {
                return result;
            }
            const length = this.sbeReadUint (frameHex, position, 1);
            if (this.sum (position, 1, length) > frameLength) {
                return undefined;
            }
            result.push (this.sbeReadString (frameHex, position + 1, length));
            position = this.sum (position, 1, length);
        }
        return result;
    }

    parseSbeTrade (frameHex: string, blockLength: number, frameLength: number): any {
        //
        // TradeEvent (templateId 1), 50-byte block
        //
        //     ts int64, seq int64, tradeId int64 (deprecated, truncated), side uint8, price int64,
        //     size int64, createdAt int64, tradeType uint8, then market and tradeIdStr strings
        //
        if (blockLength < 50) {
            return undefined;
        }
        const strings = this.sbeReadVarStrings (frameHex, this.sum (blockLength, 8), 2, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 1) {
            return undefined;
        }
        const sides: Dict = { '1': 'BUY', '2': 'SELL' };
        const tradeTypes: Dict = { '1': 'FILL', '2': 'LIQUIDATION', '3': 'UNWIND_TRANSFER', '4': 'SETTLE_MARKET', '5': 'RPI', '6': 'BLOCK_TRADE' };
        return {
            // the full trade id, absent only on frames that predate it, the int64 tradeId cannot hold it
            'id': this.safeString (strings, 1),
            'market': strings[0],
            'side': this.sbeReadEnum (frameHex, 32, sides),
            'size': this.sbeReadDecimal (frameHex, 41),
            'price': this.sbeReadDecimal (frameHex, 33),
            'created_at': this.sbeReadTimestamp (frameHex, 49),
            'trade_type': this.sbeReadEnum (frameHex, 57, tradeTypes),
        };
    }

    parseSbeOrderBook (frameHex: string, blockLength: number, frameLength: number): any {
        //
        // BookEvent (templateId 3), 89-byte block
        //
        //     ts int64, seq int64, pkgType uint8, nine best bid/ask int64 fields, then the bids and asks
        //     groups of (price int64, size int64) entries and the market string
        //
        if (blockLength < 17) {
            return undefined;
        }
        // watchOrderBook subscribes to the snapshot channel, a delta would need a book to apply it to
        const pkgType = this.sbeReadUint (frameHex, 24, 1);
        if (pkgType !== 0) {
            return undefined;
        }
        const inserts: Dict[] = [];
        const sides = [ 'BUY', 'SELL' ];
        let position = this.sum (blockLength, 8);
        for (let i = 0; i < sides.length; i++) {
            if (position + 4 > frameLength) {
                return undefined;
            }
            const entryLength = this.sbeReadUint (frameHex, position, 2);
            const numInGroup = this.sbeReadUint (frameHex, position + 2, 2);
            position = position + 4;
            if ((entryLength < 16) || (this.sum (position, numInGroup * entryLength) > frameLength)) {
                return undefined;
            }
            for (let j = 0; j < numInGroup; j++) {
                inserts.push ({
                    'side': sides[i],
                    'price': this.sbeReadDecimal (frameHex, position),
                    'size': this.sbeReadDecimal (frameHex, position + 8),
                });
                position = this.sum (position, entryLength);
            }
        }
        const strings = this.sbeReadVarStrings (frameHex, position, 1, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 1) {
            return undefined;
        }
        return {
            'seq_no': this.sbeReadInt64 (frameHex, 16),
            'market': strings[0],
            'last_updated_at': this.sbeReadTimestamp (frameHex, 8),
            'update_type': 's',
            'inserts': inserts,
            'updates': [],
            'deletes': [],
        };
    }

    parseSbeMarketSummary (frameHex: string, blockLength: number, frameLength: number): any {
        //
        // MarketSummaryEvent (templateId 4), 240-byte block, of which the first 12 int64 fields are read
        //
        //     ts, seq, markPrice, indexPrice, lastPrice, volumeUsd24h, openInterest, fundingRate, bid,
        //     ask, totalVolume, priceChangeRate24h, ... then the market string
        //
        if (blockLength < 96) {
            return undefined;
        }
        const strings = this.sbeReadVarStrings (frameHex, this.sum (blockLength, 8), 1, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 1) {
            return undefined;
        }
        return {
            'symbol': strings[0],
            'mark_price': this.sbeReadDecimal (frameHex, 24),
            'last_traded_price': this.sbeReadDecimal (frameHex, 40),
            'bid': this.sbeReadDecimal (frameHex, 72),
            'ask': this.sbeReadDecimal (frameHex, 80),
            'volume_24h': this.sbeReadDecimal (frameHex, 48),
            // saturates at the int64 maximum, 92233720368.54775807 once scaled
            'total_volume': this.sbeReadDecimal (frameHex, 88),
            'created_at': this.sbeReadTimestamp (frameHex, 8),
            'open_interest': this.sbeReadDecimal (frameHex, 56),
            'funding_rate': this.sbeReadDecimal (frameHex, 64),
            'price_change_rate_24h': this.sbeReadDecimal (frameHex, 96),
        };
    }

    parseSbeFundingData (frameHex: string, blockLength: number, frameLength: number): any {
        //
        // FundingDataEvent (templateId 5), 66-byte block
        //
        //     ts int64, seq int64, fundingRate int64, fundingIndex int64, createdAt int64,
        //     fundingPremium int64, fundingRate8h int64, fundingPeriodHours int16, ... then the market
        //
        if (blockLength < 58) {
            return undefined;
        }
        const strings = this.sbeReadVarStrings (frameHex, this.sum (blockLength, 8), 1, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 1) {
            return undefined;
        }
        return {
            'market': strings[0],
            'funding_index': this.sbeReadDecimal (frameHex, 32),
            'funding_premium': this.sbeReadDecimal (frameHex, 48),
            'funding_rate': this.sbeReadDecimal (frameHex, 24),
            'funding_rate_8h': this.sbeReadDecimal (frameHex, 56),
            'funding_period_hours': this.sbeReadUint (frameHex, 64, 2),
            'created_at': this.sbeReadTimestamp (frameHex, 40),
        };
    }

    parseSbeOrder (frameHex: string, blockLength: number, frameLength: number): any {
        //
        // OrderEvent (templateId 20), 128-byte block (126 before the 1:2 request fields)
        //
        //     ts int64, seq int64, status uint8, side uint8, orderType uint8, timeInForce uint8,
        //     price int64, triggerPrice int64, size int64, sizeOpen int64, avgFillPrice int64,
        //     createdAt int64, updatedAt int64, account [32]byte, receivedAt int64, publishedAt int64,
        //     stp uint8, flags uint8, ... then the orderId, clientOrderId, market and cancelReason strings
        //
        if (blockLength < 126) {
            return undefined;
        }
        const strings = this.sbeReadVarStrings (frameHex, this.sum (blockLength, 8), 4, frameLength);
        const stringsLength = (strings === undefined) ? 0 : strings.length;
        if (stringsLength < 4) {
            return undefined;
        }
        const statuses: Dict = { '1': 'NEW', '2': 'UNTRIGGERED', '3': 'OPEN', '4': 'CLOSED' };
        const sides: Dict = { '1': 'BUY', '2': 'SELL' };
        const orderTypes: Dict = { '1': 'LIMIT', '2': 'MARKET', '3': 'STOP_LIMIT', '4': 'STOP_MARKET', '5': 'TAKE_PROFIT_LIMIT', '6': 'TAKE_PROFIT_MARKET', '7': 'STOP_LOSS_LIMIT', '8': 'STOP_LOSS_MARKET' };
        const timeInForces: Dict = { '1': 'GTC', '2': 'IOC', '3': 'POST_ONLY', '4': 'RPI' };
        const stpModes: Dict = { '0': 'NONE', '1': 'EXPIRE_MAKER', '2': 'EXPIRE_TAKER', '3': 'EXPIRE_BOTH' };
        const flagNames = [ 'REDUCE_ONLY', 'STOP_CONDITION_BELOW_TRIGGER', 'STOP_CONDITION_ABOVE_TRIGGER', 'INTERACTIVE', 'TARGET_STRATEGY_VWAP', 'MMP' ];
        const flags: string[] = [];
        let flagBits = this.sbeReadUint (frameHex, 133, 1);
        for (let i = 0; i < flagNames.length; i++) {
            const bit = this.parseToInt (flagBits % 2);
            if (bit === 1) {
                flags.push (flagNames[i]);
            }
            flagBits = this.parseToInt ((flagBits - bit) / 2);
        }
        const order: Dict = {
            'account': this.sbeReadAddress (frameHex, 84),
            'avg_fill_price': this.sbeReadDecimal (frameHex, 60),
            'client_id': strings[1],
            'created_at': this.sbeReadTimestamp (frameHex, 68),
            'flags': flags,
            'id': strings[0],
            'instruction': this.sbeReadEnum (frameHex, 27, timeInForces),
            'last_updated_at': this.sbeReadTimestamp (frameHex, 76),
            'market': strings[2],
            'price': this.sbeReadDecimal (frameHex, 28),
            'published_at': this.sbeReadTimestamp (frameHex, 124),
            'received_at': this.sbeReadTimestamp (frameHex, 116),
            'remaining_size': this.sbeReadDecimal (frameHex, 52),
            'seq_no': this.sbeReadInt64 (frameHex, 16),
            'side': this.sbeReadEnum (frameHex, 25, sides),
            'size': this.sbeReadDecimal (frameHex, 44),
            'status': this.sbeReadEnum (frameHex, 24, statuses),
            'stp': this.sbeReadEnum (frameHex, 132, stpModes),
            'timestamp': this.sbeReadTimestamp (frameHex, 8),
            'trigger_price': this.sbeReadDecimal (frameHex, 36),
            'type': this.sbeReadEnum (frameHex, 26, orderTypes),
        };
        // an empty cancel reason is sent for every live order, parseOrder reads any reason as canceled
        if (strings[3] !== '') {
            order['cancel_reason'] = strings[3];
        }
        return order;
    }

    handleErrorMessage (client: Client, message: Dict): Bool {
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
        const error = this.safeDict (message, 'error');
        if (error === undefined) {
            return true;
        } else {
            const errorCode = this.safeString (error, 'code');
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + this.json (error);
                this.throwExactlyMatchedException (this.exceptions['exact'], '-32600', feedback);
                const messageString = this.safeString (error, 'message');
                if (messageString !== undefined) {
                    this.throwBroadlyMatchedException (this.exceptions['broad'], messageString, feedback);
                }
            }
            return false;
        }
    }

    override handleMessage (client: Client, message: any) {
        let parsedMessage: Dict = message;
        if (this.isBinaryMessage (message)) {
            parsedMessage = this.parseSbeMessage (message);
            if (parsedMessage === undefined) {
                return;
            }
        }
        if (this.handleErrorMessage (client, parsedMessage) !== true) {
            return;
        }
        //
        // auth response
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 1,
        //         "result": { "node_id": "73cf456f7cb78d59" }
        //     }
        //
        // subscription message
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
        const result = this.safeDict (parsedMessage, 'result');
        if (result !== undefined) {
            this.handleAuthenticationMessage (client, parsedMessage);
            return;
        }
        const data = this.safeDict (parsedMessage, 'params');
        if (data !== undefined) {
            const channel = this.safeString (data, 'channel');
            const parts = (channel as string).split ('.');
            const name = this.safeString (parts, 0);
            const methods: Dict = {
                'trades': this.handleTrade,
                'order_book': this.handleOrderBook,
                'markets_summary': this.handleTicker,
                'orders': this.handleOrder,
                'funding_data': this.handleFundingRate,
            };
            const method = this.safeValue (methods, name);
            if (method !== undefined) {
                method.call (this, client, parsedMessage);
            }
        }
    }
}
