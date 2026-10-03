// ----------------------------------------------------------------------------

import deriveRest from '../derive.js';
import { Precise } from '../base/Precise.js';
import { ExchangeError, AuthenticationError, UnsubscribeError } from '../base/errors.js';
import { ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, ArrayCache } from '../base/ws/Cache.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, Balances, Position, Dict, Bool, List } from '../base/types.js';
import Client from '../base/ws/Client.js';
import type { WsOrderBook } from '../base/ws/OrderBook.js';

// ----------------------------------------------------------------------------

export default class derive extends deriveRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchBidsAsks': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.derive.xyz/v3/ws',
                },
                'test': {
                    'ws': 'wss://testnet.api.derive.xyz/v3/ws',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'requestId': {},
            },
            'streaming': {
                'keepAlive': 9000,
            },
            'exceptions': {
                'ws': {
                    'exact': {},
                },
            },
        });
    }

    requestId (url: string): number {
        const options = this.safeDict (this.options, 'requestId', {});
        const previousValue = this.safeInteger (options, url, 0);
        const newValue = this.sum (previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }

    async watchPublic (messageHash: string, message: Dict, subscription: Dict) {
        const url = this.urls['api']['ws'];
        const requestId = this.requestId (url);
        const request = this.extend (message, {
            'id': requestId,
        });
        const subscriptionExtended: Dict = this.extend (subscription, {
            'id': requestId,
            'method': 'subscribe',
        });
        return await this.watch (url, messageHash, request, messageHash, subscriptionExtended);
    }

    /**
     * @method
     * @name derive#watchOrderBook
     * @see https://docs.derive.xyz/api-reference/channels/orderbook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const limitResolved: Int = (limit === undefined) ? 10 : limit;
        const market = this.market (symbol);
        const topic = 'orderbook.' + market['id'] + '.10.' + this.numberToString (limitResolved);
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription: Dict = {
            'name': topic,
            'symbol': symbol,
            'limit': limitResolved,
            'params': params,
        };
        const orderbook: WsOrderBook = await this.watchPublic (topic, request, subscription);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message: Dict) {
        //
        // {
        //     method: 'subscription',
        //     params: {
        //       channel: 'orderbook.BTC-PERP.10.1',
        //       data: {
        //         timestamp: 1738331231506,
        //         instrument_name: 'BTC-PERP',
        //         publish_id: 628419,
        //         bids: [ [ '104669', '40' ] ],
        //         asks: [ [ '104736', '40' ] ]
        //       }
        //     }
        // }
        //
        const params = this.safeDict (message, 'params');
        const data = this.safeDict (params, 'data', {});
        const marketId = this.safeString (data, 'instrument_name');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const topic = this.safeString (params, 'channel');
        if (!(symbol in this.orderbooks)) {
            const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
            const subscription = (topic === undefined) ? undefined : client.subscriptions[topic];
            const limit = this.safeInteger (subscription, 'limit', defaultLimit);
            this.orderbooks[symbol] = this.orderBook ({}, limit);
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.safeInteger (data, 'timestamp');
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
        orderbook.reset (snapshot);
        client.resolve (orderbook, topic);
    }

    /**
     * @method
     * @name derive#watchTicker
     * @see https://docs.derive.xyz/api-reference/channels/tickerslim
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const topic = 'ticker_slim.' + market['id'] + '.100'; // v3 removed the fat ticker channel, ticker_slim is the only ticker feed
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription: Dict = {
            'name': topic,
            'symbol': symbol,
            'params': params,
        };
        return await this.watchPublic (topic, request, subscription);
    }

    /**
     * @method
     * @name derive#unWatchTicker
     * @description unsubscribe from the ticker channel; note that the bid ask feed of the same symbol shares the channel and stops as well
     * @see https://docs.derive.xyz/api-reference/channels/tickerslim
     * @param {string} symbol unified symbol of the market to unwatch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    override async unWatchTicker (symbol: string, params: Dict = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const topic = 'ticker_slim.' + market['id'] + '.100';
        const messageHash = 'unwatch' + topic;
        const request: Dict = {
            'method': 'unsubscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription: Dict = {
            'name': topic,
        };
        return await this.unWatchPublic (messageHash, request, subscription);
    }

    /**
     * @method
     * @name derive#watchBidsAsks
     * @description watches best bid & ask for symbols; the data is sourced from the same ticker_slim channel the ticker uses
     * @see https://docs.derive.xyz/api-reference/channels/tickerslim
     * @param {string[]} symbols unified symbols of the markets to fetch the bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchBidsAsks (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsResolved = this.marketSymbols (symbols, undefined, false);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsResolved.length; i++) {
            const market = this.market (symbolsResolved[i]);
            topics.push ('ticker_slim.' + market['id'] + '.100');
            messageHashes.push ('bidask:' + market['symbol']);
        }
        const url = this.urls['api']['ws'];
        const requestId = this.requestId (url);
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'channels': topics,
            },
            'id': requestId,
        };
        const subscription: Dict = {
            'id': requestId,
            'method': 'subscribe',
        };
        const ticker = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes, subscription);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbolsResolved);
    }

    handleTicker (client: Client, message: Dict): Dict {
        //
        //     {
        //         "method": "subscription",
        //         "params": {
        //             "channel": "ticker_slim.BTC-PERP.100",
        //             "data": {
        //                 "timestamp": 1790879819285,
        //                 "instrument_ticker": {
        //                     "t": 1790879819268,
        //                     "A": "0.278",
        //                     "a": "84214.6",
        //                     "B": "0.213",
        //                     "b": "84205.4",
        //                     "f": "0.000012500",
        //                     "option_pricing": null,
        //                     "I": "84210.9",
        //                     "M": "84210.2",
        //                     "stats": {
        //                         "c": "16.41",
        //                         "v": "1377350.271",
        //                         "pr": "1377095.872",
        //                         "n": 98,
        //                         "oi": "0",
        //                         "h": "84282",
        //                         "l": "83661.8",
        //                         "p": "0"
        //                     },
        //                     "minp": "82526.1",
        //                     "maxp": "85894.9"
        //                 }
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params');
        const rawData = this.safeDict (params, 'data');
        const data = this.safeDict (rawData, 'instrument_ticker', {});
        const topic = this.safeString (params, 'channel', '');
        // the slim payload does not carry the instrument name, so the symbol is recovered from the channel: ticker_slim.BTC-PERP.100
        const parts = topic.split ('.');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const ticker = this.parseTicker (data, market);
        const tickerSymbol = ticker['symbol'];
        if (tickerSymbol !== undefined) {
            this.tickers[tickerSymbol] = ticker;
            const bidAsk = this.safeTicker ({
                'symbol': tickerSymbol,
                'timestamp': this.safeInteger (ticker, 'timestamp'),
                'datetime': this.safeString (ticker, 'datetime'),
                'bid': this.safeNumber (ticker, 'bid'),
                'bidVolume': this.safeNumber (ticker, 'bidVolume'),
                'ask': this.safeNumber (ticker, 'ask'),
                'askVolume': this.safeNumber (ticker, 'askVolume'),
                'info': data,
            }, market);
            this.bidsasks[tickerSymbol] = bidAsk;
            client.resolve (bidAsk, 'bidask:' + tickerSymbol);
        }
        client.resolve (ticker, topic);
        return message;
    }

    /**
     * @method
     * @name derive#unWatchOrderBook
     * @description unsubscribe from the orderbook channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async unWatchOrderBook (symbol: string, params: Dict = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let limit = this.safeInteger (params, 'limit');
        if (limit === undefined) {
            limit = 10;
        }
        const market = this.market (symbol);
        const topic = 'orderbook.' + market['id'] + '.10.' + this.numberToString (limit);
        const messageHash = 'unwatch' + topic;
        const request: Dict = {
            'method': 'unsubscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription: Dict = {
            'name': topic,
        };
        return await this.unWatchPublic (messageHash, request, subscription);
    }

    /**
     * @method
     * @name derive#unWatchTrades
     * @description unsubscribe from the trades channel
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    override async unWatchTrades (symbol: string, params: Dict = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const topic = 'trades.' + market['id'];
        const messageHah = 'unwatch' + topic;
        const request: Dict = {
            'method': 'unsubscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription: Dict = {
            'name': topic,
        };
        return await this.unWatchPublic (messageHah, request, subscription);
    }

    async unWatchPublic (messageHash: string, message: Dict, subscription: Dict) {
        const url = this.urls['api']['ws'];
        const requestId = this.requestId (url);
        const request = this.extend (message, {
            'id': requestId,
        });
        const subscriptionExtended: Dict = this.extend (subscription, {
            'id': requestId,
            'method': 'unsubscribe',
        });
        return await this.watch (url, messageHash, request, messageHash, subscriptionExtended);
    }

    handleOrderBookUnSubscription (client: Client, topic: string) {
        const parsedTopic = topic.split ('.');
        const marketId = this.safeString (parsedTopic, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.cleanUnsubscription (client, topic, 'unwatch' + topic);
    }

    handleTradesUnSubscription (client: Client, topic: string) {
        const parsedTopic = topic.split ('.');
        const marketId = this.safeString (parsedTopic, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (symbol in this.trades) {
            delete this.trades[symbol];
        }
        this.cleanUnsubscription (client, topic, 'unwatch' + topic);
    }

    handleTickerUnSubscription (client: Client, topic: string) {
        const parsedTopic = topic.split ('.');
        const marketId = this.safeString (parsedTopic, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (symbol in this.tickers) {
            delete this.tickers[symbol];
        }
        if (symbol in this.bidsasks) {
            delete this.bidsasks[symbol];
        }
        // the bid ask stream shares the ticker_slim channel, so its waiters must not be left hanging either
        const bidAskHash = 'bidask:' + symbol;
        if (bidAskHash in client.futures) {
            const error = new UnsubscribeError (this.id + ' ' + bidAskHash);
            client.reject (error, bidAskHash);
        }
        this.cleanUnsubscription (client, topic, 'unwatch' + topic);
    }

    handleOrdersUnSubscription (client: Client, topic: string) {
        this.orders = undefined;
        this.cleanUnsubscription (client, topic, 'unwatch' + topic, true);
    }

    handleMyTradesUnSubscription (client: Client, topic: string) {
        this.myTrades = undefined;
        this.cleanUnsubscription (client, topic, 'unwatch' + topic, true);
    }

    handleUnSubscribe (client: Client, message: Dict): Dict {
        //
        //     {
        //         "id": 1,
        //         "result": {
        //             "status": { "orderbook.BTC-PERP.10.10": "ok" },
        //             "remaining_subscriptions": []
        //         }
        //     }
        //
        const result = this.safeDict (message, 'result');
        const status = this.safeDict (result, 'status');
        if (status !== undefined) {
            const topics = Object.keys (status);
            for (let i = 0; i < topics.length; i++) {
                const topic = topics[i];
                const parsedTopic = topic.split ('.');
                const suffix = this.safeString (parsedTopic, 1);
                if (topic.indexOf ('orderbook') === 0) {
                    this.handleOrderBookUnSubscription (client, topic);
                } else if (topic.indexOf ('ticker_slim') === 0) {
                    this.handleTickerUnSubscription (client, topic);
                } else if (topic.indexOf ('trades') === 0) {
                    this.handleTradesUnSubscription (client, topic);
                } else if (suffix === 'orders') {
                    this.handleOrdersUnSubscription (client, topic);
                } else if (suffix === 'trades') {
                    this.handleMyTradesUnSubscription (client, topic);
                }
            }
        }
        return message;
    }

    /**
     * @method
     * @name derive#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.derive.xyz/api-reference/channels/tradesbyinstrument
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const topic = 'trades.' + market['id'];
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription: Dict = {
            'name': topic,
            'symbol': symbol,
            'params': params,
        };
        const trades = await this.watchPublic (topic, request, subscription);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limitResolved, true);
    }

    handleTrade (client: Client, message: Dict) {
        //
        //
        const params = this.safeDict (message, 'params');
        const data = this.safeDict (params, 'data', {});
        const topic = this.safeString (params, 'channel', '');
        const parsedTopic = topic.split ('.');
        const marketId = this.safeString (parsedTopic, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
        }
        for (let i = 0; i < (data as List).length; i++) {
            const trade = this.parseTrade (data[i]);
            tradesArray.append (trade);
        }
        this.trades[symbol] = tradesArray;
        client.resolve (tradesArray, topic);
    }

    async authenticate (params: Dict = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.reusableFuture (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const requestId = this.requestId (url);
            const now = this.numberToString (this.nonce ());
            const signature = this.signMessage (now, this.privateKey);
            let deriveWalletAddress = this.safeString (this.options, 'deriveWalletAddress');
            if ((deriveWalletAddress === undefined) || (deriveWalletAddress === '')) {
                deriveWalletAddress = this.walletAddress; // v3: the owner wallet is the user's own EOA
            }
            const request: Dict = {
                'id': requestId,
                'method': 'public/login',
                'params': {
                    'wallet': deriveWalletAddress,
                    'timestamp': now,
                    'signature': signature,
                },
            };
            // const subscription: Dict = {
            //     'name': topic,
            //     'symbol': symbol,
            //     'params': params,
            // };
            const message = this.extend (request, params);
            this.watch (url, messageHash, message, messageHash, message);
        }
        return await future;
    }

    async watchPrivate (messageHash: string, message: Dict, subscription: Dict) {
        await this.authenticate ();
        const url = this.urls['api']['ws'];
        const requestId = this.requestId (url);
        const request = this.extend (message, {
            'id': requestId,
        });
        const subscriptionExtended: Dict = this.extend (subscription, {
            'id': requestId,
            'method': 'subscribe',
        });
        return await this.watch (url, messageHash, request, messageHash, subscriptionExtended);
    }

    /**
     * @method
     * @name derive#watchOrders
     * @see https://docs.derive.xyz/api-reference/channels/subaccountorders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('watchOrders', params);
        const topic = this.numberToString (subaccountId) + '.orders';
        let messageHash = topic;
        const symbolResolved: Str = (symbol !== undefined) ? this.symbol (symbol) : symbol;
        if (symbolResolved !== undefined) {
            messageHash += ':' + symbolResolved;
        }
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription: Dict = {
            'name': topic,
            'params': paramsDeriveSubaccountId,
        };
        const message = this.extend (request, paramsDeriveSubaccountId);
        const orders = await this.watchPrivate (messageHash, message, subscription);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = orders.getLimit (symbolResolved, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbolResolved, since, limitResolved, true);
    }

    handleOrder (client: Client, message: Dict) {
        //
        // {
        //     method: 'subscription',
        //     params: {
        //         channel: '130837.orders',
        //         data: [
        //             {
        //                 subaccount_id: 130837,
        //                 order_id: '1f44c564-5658-4b69-b8c4-4019924207d5',
        //                 instrument_name: 'BTC-PERP',
        //                 direction: 'buy',
        //                 label: 'test1234',
        //                 quote_id: null,
        //                 creation_timestamp: 1738578974146,
        //                 last_update_timestamp: 1738578974146,
        //                 limit_price: '10000',
        //                 amount: '0.01',
        //                 filled_amount: '0',
        //                 average_price: '0',
        //                 order_fee: '0',
        //                 order_type: 'limit',
        //                 time_in_force: 'post_only',
        //                 order_status: 'untriggered',
        //                 max_fee: '219',
        //                 signature_expiry_sec: 1746354973,
        //                 nonce: 1738578973570,
        //                 signer: '0x30CB7B06AdD6749BbE146A6827502B8f2a79269A',
        //                 signature: '0xc6927095f74a0d3b1aeef8c0579d120056530479f806e9d2e6616df742a8934c69046361beae833b32b25c0145e318438d7d1624bb835add956f63aa37192f571c',
        //                 cancel_reason: '',
        //                 mmp: false,
        //                 is_transfer: false,
        //                 replaced_order_id: null,
        //                 trigger_type: 'stoploss',
        //                 trigger_price_type: 'mark',
        //                 trigger_price: '102800',
        //                 trigger_reject_message: null
        //             }
        //         ]
        //     }
        // }
        //
        const params = this.safeDict (message, 'params');
        const topic = this.safeString (params, 'channel');
        const rawOrders: Dict[] = this.safeList (params, 'data', []);
        for (let i = 0; i < rawOrders.length; i++) {
            const data = rawOrders[i];
            const parsed = this.parseOrder (data);
            const symbol = this.safeString (parsed, 'symbol');
            const orderId = this.safeString (parsed, 'id');
            if (symbol !== undefined) {
                if (this.orders === undefined) {
                    const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                    this.orders = new ArrayCacheBySymbolById (limit);
                }
                const cachedOrders = this.orders;
                const orders = this.safeDict (cachedOrders.hashmap, symbol, {});
                const order = (orderId === undefined) ? undefined : this.safeDict (orders, orderId);
                if (order !== undefined) {
                    const fee = this.safeDict (order, 'fee');
                    if (fee !== undefined) {
                        (parsed as Dict)['fee'] = fee;
                    }
                    const fees = this.safeList (order, 'fees');
                    if (fees !== undefined) {
                        (parsed as Dict)['fees'] = fees;
                    }
                    (parsed as Dict)['trades'] = this.safeList (order, 'trades');
                    parsed['timestamp'] = this.safeInteger (order, 'timestamp');
                    parsed['datetime'] = this.safeString (order, 'datetime');
                }
                cachedOrders.append (parsed);
                if (topic !== undefined) {
                    const messageHashSymbol = topic + ':' + symbol;
                    client.resolve (this.orders, messageHashSymbol);
                }
            }
        }
        client.resolve (this.orders, topic);
    }

    /**
     * @method
     * @name derive#unWatchOrders
     * @description unsubscribe from the orders channel
     * @see https://docs.derive.xyz/api-reference/channels/subaccountorders
     * @param {string} [symbol] not used by derive unWatchOrders, the whole subaccount channel is unsubscribed
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {any} status of the unwatch request
     */
    override async unWatchOrders (symbol: Str = undefined, params: Dict = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('unWatchOrders', params);
        const topic = this.numberToString (subaccountId) + '.orders';
        const messageHash = 'unwatch' + topic;
        const request: Dict = {
            'method': 'unsubscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription: Dict = {
            'name': topic,
        };
        const message = this.extend (request, paramsDeriveSubaccountId);
        return await this.unWatchPublic (messageHash, message, subscription);
    }

    /**
     * @method
     * @name derive#watchMyTrades
     * @see https://docs.derive.xyz/api-reference/channels/subaccounttrades
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('watchMyTrades', params);
        const topic = this.numberToString (subaccountId) + '.trades';
        let messageHash = topic;
        const symbolResolved: Str = (symbol !== undefined) ? this.symbol (symbol) : symbol;
        if (symbolResolved !== undefined) {
            messageHash += ':' + symbolResolved;
        }
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription: Dict = {
            'name': topic,
            'params': paramsDeriveSubaccountId,
        };
        const message = this.extend (request, paramsDeriveSubaccountId);
        const trades = await this.watchPrivate (messageHash, message, subscription);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (symbolResolved, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbolResolved, since, limitResolved, true);
    }

    handleMyTrade (client: Client, message: Dict) {
        //
        //
        let myTrades = this.myTrades;
        if (myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            myTrades = new ArrayCacheBySymbolById (limit);
            this.myTrades = myTrades;
        }
        const params = this.safeDict (message, 'params');
        const topic = this.safeString (params, 'channel');
        const rawTrades = this.safeList (params, 'data', []);
        for (let i = 0; i < rawTrades.length; i++) {
            const trade = this.parseTrade (rawTrades[i]);
            myTrades.append (trade);
            client.resolve (myTrades, topic);
            if (topic !== undefined) {
                const messageHash = topic + ':' + this.safeString (trade, 'symbol', '');
                client.resolve (myTrades, messageHash);
            }
        }
    }

    /**
     * @method
     * @name derive#unWatchMyTrades
     * @description unsubscribe from the my trades channel
     * @see https://docs.derive.xyz/api-reference/channels/subaccounttrades
     * @param {string} [symbol] not used by derive unWatchMyTrades, the whole subaccount channel is unsubscribed
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {any} status of the unwatch request
     */
    override async unWatchMyTrades (symbol: Str = undefined, params: Dict = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('unWatchMyTrades', params);
        const topic = this.numberToString (subaccountId) + '.trades';
        const messageHash = 'unwatch' + topic;
        const request: Dict = {
            'method': 'unsubscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription: Dict = {
            'name': topic,
        };
        const message = this.extend (request, paramsDeriveSubaccountId);
        return await this.unWatchPublic (messageHash, message, subscription);
    }

    /**
     * @method
     * @name derive#watchBalance
     * @description watches balance updates for a single subaccount, the returned structure is scoped to the watched subaccount
     * @see https://docs.derive.xyz/api-reference/channels/subaccountbalances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @param {boolean} [params.fetchBalanceSnapshot] default true, the channel only streams changed totals, so an initial snapshot is loaded over rest before subscribing
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async watchBalance (params: Dict = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ fetchSnapshot, paramsSnapshot ] = this.handleOptionBoolAndParams (params, 'watchBalance', 'fetchBalanceSnapshot', true);
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('watchBalance', paramsSnapshot);
        if (this.balance === undefined) {
            const emptyBalances: Dict = {};
            this.balance = emptyBalances;
        }
        // the balance state and the snapshot are tracked per subaccount, mirroring the subaccount-scoped channel and fetchBalance (params.subaccount_id)
        const subaccountIdKey = this.numberToString (subaccountId) as string;
        if (fetchSnapshot && !(subaccountIdKey in this.balance)) {
            const snapshotRequest: Dict = {
                'subaccount_id': subaccountId,
            };
            const snapshotParams = this.extend (snapshotRequest, paramsDeriveSubaccountId);
            const snapshot = await this.fetchBalance (snapshotParams);
            const emptyBalance: Dict = {}; // hoisted: an inline literal on the right side of a property assignment derails the rust transpiler
            const seeded = this.extend (snapshot, emptyBalance); // the extra extend keeps the csharp assignment dictionary-typed (CS0266 otherwise)
            this.balance[subaccountIdKey] = seeded;
        }
        const topic = this.numberToString (subaccountId) + '.balances';
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription: Dict = {
            'name': topic,
            'params': paramsDeriveSubaccountId,
        };
        const message = this.extend (request, paramsDeriveSubaccountId);
        return await this.watchPrivate (topic, message, subscription);
    }

    /**
     * @method
     * @name derive#watchPositions
     * @description watch all open positions; the sizes stream over the balances channel, while entry price, pnl and margin fields stay from the rest snapshot until the next one
     * @see https://docs.derive.xyz/api-reference/channels/subaccountbalances
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @param {boolean} [params.fetchPositionsSnapshot] default true, the channel only streams size changes, so an initial snapshot is loaded over rest before subscribing
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    override async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Position[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsResolved = this.marketSymbols (symbols, undefined, true);
        const [ fetchSnapshot, paramsSnapshot ] = this.handleOptionBoolAndParams (params, 'watchPositions', 'fetchPositionsSnapshot', true);
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('watchPositions', paramsSnapshot);
        if (this.positions === undefined) {
            const emptyCaches: Dict = {};
            this.positions = emptyCaches;
            const emptySnapshots: Dict = {};
            this.options['loadedPositionsSnapshots'] = emptySnapshots;
        }
        // the cache and the snapshot are tracked per subaccount, so subaccounts holding the same instrument and side do not overwrite each other
        const subaccountIdKey = this.numberToString (subaccountId) as string;
        if (!(subaccountIdKey in this.positions)) {
            this.positions[subaccountIdKey] = new ArrayCacheBySymbolBySide ();
        }
        const loadedSnapshots = this.safeDict (this.options, 'loadedPositionsSnapshots', {});
        if (fetchSnapshot && !(subaccountIdKey in loadedSnapshots)) {
            const snapshotRequest: Dict = {
                'subaccount_id': subaccountId,
            };
            const snapshotParams = this.extend (snapshotRequest, paramsDeriveSubaccountId);
            const positionsSnapshot = await this.fetchPositions (undefined, snapshotParams);
            const cache = this.positions[subaccountIdKey];
            for (let i = 0; i < positionsSnapshot.length; i++) {
                cache.append (positionsSnapshot[i]);
            }
            loadedSnapshots[subaccountIdKey] = true;
            this.options['loadedPositionsSnapshots'] = loadedSnapshots;
        }
        const topic = this.numberToString (subaccountId) + '.balances';
        const messageHash = 'positions:' + topic;
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription: Dict = {
            'name': topic,
            'params': paramsDeriveSubaccountId,
        };
        const message = this.extend (request, paramsDeriveSubaccountId);
        const newPositions = await this.watchPrivate (messageHash, message, subscription);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (this.positions[subaccountIdKey], symbolsResolved, since, limit, true);
    }

    handlePositionDelta (subaccountIdKey: string, entry: Dict): Position {
        const marketId = this.safeString (entry, 'name');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const newSize = this.safeString (entry, 'new_balance', '0');
        const isShort = Precise.stringLt (newSize, '0');
        const side = isShort ? 'short' : 'long';
        const contracts = Precise.stringAbs (newSize);
        const cache = this.positions[subaccountIdKey];
        const symbolPositions = this.safeDict (cache.hashmap, symbol, {});
        // a fill through zero flattens the opposite side first
        const oppositeSide = isShort ? 'long' : 'short';
        const opposite = this.safeDict (symbolPositions, oppositeSide);
        if (opposite !== undefined) {
            const oppositeContracts = this.safeString (opposite, 'contracts');
            if ((oppositeContracts !== undefined) && (oppositeContracts !== '0')) {
                (opposite as Dict)['contracts'] = this.parseNumber ('0');
                (opposite as Dict)['lastUpdateTimestamp'] = this.milliseconds ();
                cache.append (opposite as Position);
            }
        }
        let position = this.safeDict (symbolPositions, side);
        if (position === undefined) {
            // the position is freshly opened by the current fill, so the local clock approximates the open time
            const timestamp = this.milliseconds ();
            position = this.safePosition ({
                'symbol': symbol,
                'side': side,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'info': entry,
            });
        }
        (position as Dict)['contracts'] = this.parseNumber (contracts);
        (position as Dict)['side'] = side;
        (position as Dict)['lastUpdateTimestamp'] = this.milliseconds ();
        (position as Dict)['info'] = entry;
        cache.append (position as Position);
        return position as Position;
    }

    handleBalance (client: Client, message: Dict) {
        //
        //     {
        //         "method": "subscription",
        //         "params": {
        //             "channel": "86815.balances",
        //             "data": [
        //                 {
        //                     "name": "USDC",
        //                     "new_balance": "8427.545482",
        //                     "previous_balance": "8428.545482",
        //                     "update_type": "trade"
        //                 }
        //             ]
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params');
        const topic = this.safeString (params, 'channel');
        const topicParts = (topic as string).split ('.');
        const subaccountIdKey = this.safeString (topicParts, 0) as string;
        const data = this.safeList (params, 'data', []);
        if (this.balance === undefined) {
            this.balance = {};
        }
        let subBalance = this.safeDict (this.balance, subaccountIdKey);
        if (subBalance === undefined) {
            const emptySubBalance: Dict = {};
            subBalance = emptySubBalance;
        }
        let updated = false;
        const positionUpdates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = this.safeDict (data, i, {});
            const name = this.safeString (entry, 'name', '');
            if (name.indexOf ('-') >= 0) {
                // position deltas carry instrument names and do not belong into the balance structure
                if ((this.positions !== undefined) && (subaccountIdKey in this.positions)) {
                    const position = this.handlePositionDelta (subaccountIdKey, entry);
                    positionUpdates.push (position);
                }
                continue;
            }
            const code = this.safeCurrencyCode (name);
            if (code === undefined) {
                continue;
            }
            let account = this.safeDict (subBalance, code);
            if (account === undefined) {
                account = this.account ();
            }
            // the channel and the balance state are both subaccount-scoped, so the streamed new_balance is the authoritative absolute total
            // todo: check on main net
            account['total'] = this.safeString (entry, 'new_balance');
            // the margin requirements the rest free/used model needs are not part of the stream, so stale snapshot values are dropped instead of reporting free + used != total
            account['free'] = undefined;
            account['used'] = undefined;
            subBalance[code] = account;
            updated = true;
        }
        if (updated) {
            this.balance[subaccountIdKey] = this.safeBalance (subBalance as any);
            client.resolve (this.balance[subaccountIdKey], topic);
        }
        const positionUpdatesLength = positionUpdates.length;
        if (positionUpdatesLength > 0) {
            client.resolve (positionUpdates, 'positions:' + topic);
        }
    }

    handleErrorMessage (client: Client, message: Dict): Bool {
        //
        // {
        //     id: '690c6276-0fc6-4121-aafa-f28bf5adedcb',
        //     error: { code: -32600, message: 'Invalid Request' }
        // }
        //
        if (!('error' in message)) {
            return false;
        }
        const errorMessage = this.safeDict (message, 'error');
        const errorCode = this.safeString (errorMessage, 'code');
        try {
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                throw new ExchangeError (feedback);
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

    override handleMessage (client: Client, message: Dict) {
        if (this.handleErrorMessage (client, message) === true) {
            return;
        }
        const methods: Dict = {
            'orderbook': this.handleOrderBook,
            'ticker': this.handleTicker,
            'ticker_slim': this.handleTicker,
            'trades': this.handleTrade,
            'orders': this.handleOrder,
            'mytrades': this.handleMyTrade,
            'balances': this.handleBalance,
        };
        let event: Str = undefined;
        const params = this.safeDict (message, 'params');
        if (params !== undefined) {
            const channel = this.safeString (params, 'channel');
            if (channel !== undefined) {
                const parsedChannel = channel.split ('.');
                if ((channel.indexOf ('orders') >= 0) || (channel.indexOf ('trades') > 0) || (channel.indexOf ('balances') > 0)) {
                    event = this.safeString (parsedChannel, 1);
                    // {subaccount_id}.trades
                    if (event === 'trades') {
                        event = 'mytrades';
                    }
                } else {
                    event = this.safeString (parsedChannel, 0);
                }
            }
        }
        const method = (event === undefined) ? undefined : this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
            return;
        }
        if ('id' in message) {
            const id = this.safeString (message, 'id');
            // the subscriptions are scanned with safeString comparisons: an indexBy over the integer ids would need an integer lookup key in python while the object keys are always strings in javascript
            const subscriptionKeys = Object.keys (client.subscriptions);
            for (let i = 0; i < subscriptionKeys.length; i++) {
                const subscription = this.safeDict (client.subscriptions, subscriptionKeys[i], {});
                const subscriptionId = this.safeString (subscription, 'id');
                if ((subscriptionId !== undefined) && (subscriptionId === id)) {
                    const subscriptionMethod = this.safeString (subscription, 'method');
                    if (subscriptionMethod === 'public/login') {
                        this.handleAuth (client, message);
                    } else if (subscriptionMethod === 'unsubscribe') {
                        this.handleUnSubscribe (client, message);
                    }
                    // could handleSubscribe
                }
            }
        }
    }

    handleAuth (client: Client, message: Dict) {
        //
        // {
        //     id: 1,
        //     result: [ 130837 ]
        // }
        //
        const messageHash = 'authenticated';
        const ids = this.safeList (message, 'result', []);
        const idsLength = ids.length;
        if (idsLength > 0) {
            // client.resolve (message, messageHash);
            const future = this.safeValue (client.futures, 'authenticated');
            future.resolve (true);
        } else {
            const error = new AuthenticationError (this.json (message));
            client.reject (error, messageHash);
            // allows further authentication attempts
            if (messageHash in client.subscriptions) {
                delete client.subscriptions['authenticated'];
            }
        }
    }
}
