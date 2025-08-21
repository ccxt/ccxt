//  ---------------------------------------------------------------------------

import cexRest from '../cex.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import type { Int, OrderSide, OrderType, Strings, Str, OrderBook, Trade, Ticker, Tickers, OHLCV, Order, Balances, Num, Dict, Bool } from '../base/types.js';
import { ArgumentsRequired, ExchangeError, BadRequest } from '../base/errors.js';
import { Precise } from '../base/Precise.js';
import { ArrayCacheBySymbolById, ArrayCacheByTimestamp, ArrayCache } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class cex extends cexRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchMyTrades': true,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
                'watchPosition': undefined,
                'createOrderWs': true,
                'editOrderWs': true,
                'cancelOrderWs': true,
                'cancelOrdersWs': true,
                'fetchOrderWs': true,
                'fetchOpenOrdersWs': true,
                'fetchTickerWs': true,
                'fetchBalanceWs': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.cex.io/ws',
                },
            },
            'options': {
                'orderbook': {},
            },
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId.toString ();
    }

    /**
     * @method
     * @name cex#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://cex.io/websocket-api#get-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance (params = {}): Promise<Balances> {
        await this.authenticate (params);
        const messageHash = this.requestId ();
        const url = this.urls['api']['ws'];
        const subscribe: Dict = {
            'e': 'get-balance',
            'data': {},
            'oid': this.requestId (),
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash, request);
    }

    handleBalance (client: Client, message) {
        //
        //     {
        //         "e": "get-balance",
        //         "data": {
        //             "balance": {
        //                 "BTC": "0.00000000",
        //                 "USD": "0.00",
        //                 ...
        //             },
        //             "obalance": {
        //                 "BTC": "0.00000000",
        //                 "USD": "0.00",
        //                 ...
        //             },
        //             "time": 1663761159605
        //         },
        //         "oid": 1,
        //         "ok": "ok"
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const freeBalance = this.safeValue (data, 'balance', {});
        const usedBalance = this.safeValue (data, 'obalance', {});
        const result: Dict = {
            'info': data,
        };
        const currencyIds = Object.keys (freeBalance);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const account = this.account ();
            account['free'] = this.safeString (freeBalance, currencyId);
            account['used'] = this.safeString (usedBalance, currencyId);
            const code = this.safeCurrencyCode (currencyId);
            result[code] = account;
        }
        this.balance = this.safeBalance (result);
        const messageHash = this.safeString (message, 'oid');
        client.resolve (this.balance, messageHash);
    }

    /**
     * @method
     * @name cex#watchTrades
     * @description get the list of most recent trades for a particular symbol. Note: can only watch one symbol at a time.
     * @see https://cex.io/websocket-api#old-pair-room
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const messageHash = 'trades';
        const subscriptionHash = 'old:' + symbol;
        this.options['currentWatchTradeSymbol'] = symbol; // exchange supports only 1 symbol for this watchTrades channel
        const client = this.safeValue (this.clients, url);
        if (client !== undefined) {
            const subscriptionKeys = Object.keys (client.subscriptions);
            for (let i = 0; i < subscriptionKeys.length; i++) {
                let subscriptionKey = subscriptionKeys[i];
                if (subscriptionKey === subscriptionHash) {
                    continue;
                }
                subscriptionKey = subscriptionKey.slice (0, 3);
                if (subscriptionKey === 'old') {
                    throw new ExchangeError (this.id + ' watchTrades() only supports watching one symbol at a time.');
                }
            }
        }
        const message: Dict = {
            'e': 'subscribe',
            'rooms': [ 'pair-' + market['base'] + '-' + market['quote'] ],
        };
        const request = this.deepExtend (message, params);
        const trades = await this.watch (url, messageHash, request, subscriptionHash);
        // assing symbol to the trades as message does not contain symbol information
        for (let i = 0; i < trades.length; i++) {
            trades[i]['symbol'] = symbol;
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTradesSnapshot (client: Client, message) {
        //
        //     {
        //         "e": "history",
        //         "data": [
        //            'buy:1710255706095:444444:71222.2:14892622'
        //            'sell:1710255658251:42530:71300:14892621'
        //            'buy:1710252424241:87913:72800:14892620'
        //            ... timestamp descending
        //         ]
        //     }
        //
        const data = this.safeList (message, 'data', []);
        const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
        const stored = new ArrayCache (limit);
        const symbol = this.safeString (this.options, 'currentWatchTradeSymbol');
        if (symbol === undefined) {
            return;
        }
        const market = this.market (symbol);
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            const index = dataLength - 1 - i;
            const rawTrade = data[index];
            const parsed = this.parseWsOldTrade (rawTrade, market);
            stored.append (parsed);
        }
        const messageHash = 'trades';
        this.trades = stored as any; // trades don't have symbol
        client.resolve (this.trades, messageHash);
    }

    parseWsOldTrade (trade, market = undefined) {
        //
        //  snapshot trade
        //    "sell:1665467367741:3888551:19058.8:14541219"
        //  update trade
        //    ['buy', '1665467516704', '98070', "19057.7", "14541220"]
        //
        if (!Array.isArray (trade)) {
            trade = trade.split (':');
        }
        const side = this.safeString (trade, 0);
        const timestamp = this.safeInteger (trade, 1);
        const amount = this.safeString (trade, 2);
        const price = this.safeString (trade, 3);
        const id = this.safeString (trade, 4);
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeString (market, 'symbol'),
            'type': undefined,
            'side': side,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    handleTrade (client: Client, message) {
        //
        //     {
        //         "e": "history-update",
        //         "data": [
        //             ['buy', '1665467516704', '98070', "19057.7", "14541220"]
        //         ]
        //     }
        //
        const data = this.safeValue (message, 'data', []);
        const stored = this.trades as any; // to do fix this, this.trades is not meant to be used like this
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            const index = dataLength - 1 - i;
            const rawTrade = data[index];
            const parsed = this.parseWsOldTrade (rawTrade);
            stored.append (parsed);
        }
        const messageHash = 'trades';
        this.trades = stored;
        client.resolve (this.trades, messageHash);
    }

    /**
     * @method
     * @name cex#watchTicker
     * @see https://cex.io/websocket-api#ticker-subscription
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] public or private
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const messageHash = 'ticker:' + symbol;
        const method = this.safeString (params, 'method', 'private'); // default to private because the specified ticker is received quicker
        let message = {
            'e': 'subscribe',
            'rooms': [
                'tickers',
            ],
        } as any;
        let subscriptionHash = 'tickers';
        if (method === 'private') {
            await this.authenticate ();
            message = {
                'e': 'ticker',
                'data': [
                    market['baseId'], market['quoteId'],
                ],
                'oid': this.requestId (),
            };
            subscriptionHash = 'ticker:' + symbol;
        }
        const request = this.deepExtend (message, params);
        return await this.watch (url, messageHash, request, subscriptionHash);
    }

    /**
     * @method
     * @name cex#watchTickers
     * @see https://cex.io/websocket-api#ticker-subscription
     * @description watches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const url = this.urls['api']['ws'];
        const messageHash = 'tickers';
        const message: Dict = {
            'e': 'subscribe',
            'rooms': [
                'tickers',
            ],
        };
        const request = this.deepExtend (message, params);
        const ticker = await this.watch (url, messageHash, request, messageHash);
        const tickerSymbol = ticker['symbol'];
        if (symbols !== undefined && !this.inArray (tickerSymbol, symbols)) {
            return await this.watchTickers (symbols, params);
        }
        if (this.newUpdates) {
            const result: Dict = {};
            result[tickerSymbol] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name cex#fetchTickerWs
     * @see https://docs.cex.io/#ws-api-ticker-deprecated
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickerWs (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = this.requestId ();
        const request = this.extend ({
            'e': 'ticker',
            'oid': messageHash,
            'data': [ market['base'], market['quote'] ],
        }, params);
        return await this.watch (url, messageHash, request, messageHash) as Ticker;
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "e": "tick",
        //         "data": {
        //             "symbol1": "LRC",
        //             "symbol2": "USD",
        //             "price": "0.305",
        //             "open24": "0.301",
        //             "volume": "241421.641700"
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const ticker = this.parseWsTicker (data);
        const symbol = ticker['symbol'];
        if (symbol === undefined) {
            return;
        }
        this.tickers[symbol] = ticker;
        let messageHash = 'ticker:' + symbol;
        client.resolve (ticker, messageHash);
        client.resolve (ticker, 'tickers');
        messageHash = this.safeString (message, 'oid');
        if (messageHash !== undefined) {
            client.resolve (ticker, messageHash);
        }
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //  public
        //    {
        //        "symbol1": "LRC",
        //        "symbol2": "USD",
        //        "price": "0.305",
        //        "open24": "0.301",
        //        "volume": "241421.641700"
        //    }
        //  private
        //    {
        //        "timestamp": "1663764969",
        //        "low": "18756.3",
        //        "high": "19200",
        //        "last": "19200",
        //        "volume": "0.94735907",
        //        "volume30d": "64.61299999",
        //        "bid": 19217.2,
        //        "ask": 19247.5,
        //        "priceChange": "44.3",
        //        "priceChangePercentage": "0.23",
        //        "pair": ["BTC", "USDT"]
        //    }
        const pair = this.safeValue (ticker, 'pair', []);
        let baseId = this.safeString (ticker, 'symbol1');
        if (baseId === undefined) {
            baseId = this.safeString (pair, 0);
        }
        let quoteId = this.safeString (ticker, 'symbol2');
        if (quoteId === undefined) {
            quoteId = this.safeString (pair, 1);
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        let timestamp = this.safeInteger (ticker, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open24'),
            'close': undefined,
            'last': this.safeString2 (ticker, 'price', 'last'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': this.safeString (ticker, 'priceChangePercentage'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeString (ticker, 'volume'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name cex#fetchBalanceWs
     * @see https://docs.cex.io/#ws-api-get-balance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalanceWs (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        await this.authenticate ();
        const url = this.urls['api']['ws'];
        const messageHash = this.requestId ();
        const request = this.extend ({
            'e': 'get-balance',
            'oid': messageHash,
        }, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    /**
     * @method
     * @name cex#watchOrders
     * @description get the list of orders associated with the user. Note: In CEX.IO system, orders can be present in trade engine or in archive database. There can be time periods (~2 seconds or more), when order is done/canceled, but still not moved to archive database. That means, you cannot see it using calls: archived-orders/open-orders.
     * @see https://docs.cex.io/#ws-api-open-orders
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate (params);
        const url = this.urls['api']['ws'];
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orders:' + symbol;
        const message: Dict = {
            'e': 'open-orders',
            'data': {
                'pair': [
                    market['baseId'],
                    market['quoteId'],
                ],
            },
            'oid': symbol,
        };
        const request = this.deepExtend (message, params);
        const orders = await this.watch (url, messageHash, request, messageHash, request);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    /**
     * @method
     * @name cex#watchMyTrades
     * @description get the list of trades associated with the user. Note: In CEX.IO system, orders can be present in trade engine or in archive database. There can be time periods (~2 seconds or more), when order is done/canceled, but still not moved to archive database. That means, you cannot see it using calls: archived-orders/open-orders.
     * @see https://docs.cex.io/#ws-api-open-orders
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate (params);
        const url = this.urls['api']['ws'];
        const market = this.market (symbol);
        const messageHash = 'myTrades:' + market['symbol'];
        const subscriptionHash = 'orders:' + market['symbol'];
        const message: Dict = {
            'e': 'open-orders',
            'data': {
                'pair': [
                    market['baseId'],
                    market['quoteId'],
                ],
            },
            'oid': market['symbol'],
        };
        const request = this.deepExtend (message, params);
        const orders = await this.watch (url, messageHash, request, subscriptionHash, request);
        return this.filterBySymbolSinceLimit (orders, market['symbol'], since, limit);
    }

    handleTransaction (client: Client, message) {
        const data = this.safeValue (message, 'data');
        const symbol2 = this.safeString (data, 'symbol2');
        if (symbol2 === undefined) {
            return;
        }
        this.handleOrderUpdate (client, message);
        this.handleMyTrades (client, message);
    }

    handleMyTrades (client: Client, message) {
        //
        //     {
        //         "e": "tx",
        //         "data": {
        //             "d": "order:59091012956:a:USD",
        //             "c": "user:up105393824:a:USD",
        //             "a": "0.01",
        //             "ds": 0,
        //             "cs": "15.27",
        //             "user": "up105393824",
        //             "symbol": "USD",
        //             "order": 59091012956,
        //             "amount": "-18.49",
        //             "type": "buy",
        //             "time": "2022-09-24T19:36:18.466Z",
        //             "balance": "15.27",
        //             "id": "59091012966"
        //         }
        //     }
        //     {
        //         "e": "tx",
        //         "data": {
        //             "d": "order:59091012956:a:BTC",
        //             "c": "user:up105393824:a:BTC",
        //             "a": "0.00096420",
        //             "ds": 0,
        //             "cs": "0.00096420",
        //             "user": "up105393824",
        //             "symbol": "BTC",
        //             "symbol2": "USD",
        //             "amount": "0.00096420",
        //             "buy": 59091012956,
        //             "order": 59091012956,
        //             "sell": 59090796005,
        //             "price": 19135,
        //             "type": "buy",
        //             "time": "2022-09-24T19:36:18.466Z",
        //             "balance": "0.00096420",
        //             "fee_amount": "0.05",
        //             "id": "59091012962"
        //         }
        //     }
        const data = this.safeValue (message, 'data', {});
        let stored = this.myTrades;
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCacheBySymbolById (limit);
            this.myTrades = stored;
        }
        const trade = this.parseWsTrade (data);
        stored.append (trade);
        const messageHash = 'myTrades:' + trade['symbol'];
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         "d": "order:59091012956:a:BTC",
        //         "c": "user:up105393824:a:BTC",
        //         "a": "0.00096420",
        //         "ds": 0,
        //         "cs": "0.00096420",
        //         "user": "up105393824",
        //         "symbol": "BTC",
        //         "symbol2": "USD",
        //         "amount": "0.00096420",
        //         "buy": 59091012956,
        //         "order": 59091012956,
        //         "sell": 59090796005,
        //         "price": 19135,
        //         "type": "buy",
        //         "time": "2022-09-24T19:36:18.466Z",
        //         "balance": "0.00096420",
        //         "fee_amount": "0.05",
        //         "id": "59091012962"
        //     }
        // Note symbol and symbol2 are inverse on sell and ammount is in symbol currency.
        //
        const side = this.safeString (trade, 'type');
        const price = this.safeString (trade, 'price');
        const datetime = this.safeString (trade, 'time');
        const baseId = this.safeString (trade, 'symbol');
        const quoteId = this.safeString (trade, 'symbol2');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        let amount = this.safeString (trade, 'amount');
        if (side === 'sell') {
            symbol = quote + '/' + base;
            amount = Precise.stringDiv (amount, price); // due to rounding errors amount in not exact to trade
        }
        const parsedTrade: Dict = {
            'id': this.safeString (trade, 'id'),
            'order': this.safeString (trade, 'order'),
            'info': trade,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'fee': undefined,
        };
        const fee = this.safeString (trade, 'fee_amount');
        if (fee !== undefined) {
            parsedTrade['fee'] = {
                'cost': fee,
                'currency': quote,
                'rate': undefined,
            };
        }
        return this.safeTrade (parsedTrade, market);
    }

    handleOrderUpdate (client: Client, message) {
        //
        //  partialExecution
        //     {
        //         "e": "order",
        //         "data": {
        //             "id": "150714937",
        //             "remains": "1000000",
        //             "price": "17513",
        //             "amount": 2000000, As Precision
        //             "time": "1654506118448",
        //             "type": "buy",
        //             "pair": {
        //                 "symbol1": "BTC",
        //                 "symbol2": "USD"
        //             },
        //             "fee": "0.15"
        //         }
        //     }
        //  canceled order
        //     {
        //         "e": "order",
        //         "data": {
        //             "id": "6310857",
        //             "remains": "200000000"
        //             "fremains": "2.00000000"
        //             "cancel": true,
        //             "pair": {
        //                 "symbol1": "BTC",
        //                 "symbol2": "USD"
        //             }
        //         }
        //     }
        //  fulfilledOrder
        //     {
        //         "e": "order",
        //         "data": {
        //             "id": "59098421630",
        //             "remains": "0",
        //             "pair": {
        //                 "symbol1": "BTC",
        //                 "symbol2": "USD"
        //             }
        //         }
        //     }
        //     {
        //         "e": "tx",
        //         "data": {
        //             "d": "order:59425993014:a:BTC",
        //             "c": "user:up105393824:a:BTC",
        //             "a": "0.00098152",
        //             "ds": 0,
        //             "cs": "0.00098152",
        //             "user": "up105393824",
        //             "symbol": "BTC",
        //             "symbol2": "USD",
        //             "amount": "0.00098152",
        //             "buy": 59425993014,
        //             "order": 59425993014,
        //             "sell": 59425986168,
        //             "price": 19306.6,
        //             "type": "buy",
        //             "time": "2022-10-02T01:11:15.148Z",
        //             "balance": "0.00098152",
        //             "fee_amount": "0.05",
        //             "id": "59425993020"
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const isTransaction = this.safeString (message, 'e') === 'tx';
        const orderId = this.safeString2 (data, 'id', 'order');
        let remains = this.safeString (data, 'remains');
        let baseId = this.safeString (data, 'symbol');
        let quoteId = this.safeString (data, 'symbol2');
        const pair = this.safeValue (data, 'pair');
        if (pair !== undefined) {
            baseId = this.safeString (pair, 'symbol1');
            quoteId = this.safeString (pair, 'symbol2');
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const market = this.safeMarket (symbol);
        remains = this.currencyFromPrecision (base, remains);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const storedOrders = this.orders;
        const ordersBySymbol = this.safeValue (storedOrders.hashmap, symbol, {});
        let order = this.safeValue (ordersBySymbol, orderId);
        if (order === undefined) {
            order = this.parseWsOrderUpdate (data, market);
        }
        order['remaining'] = remains;
        const canceled = this.safeBool (data, 'cancel', false);
        if (canceled) {
            order['status'] = 'canceled';
        }
        if (isTransaction) {
            order['status'] = 'closed';
        }
        const fee = this.safeNumber (data, 'fee');
        if (fee !== undefined) {
            order['fee'] = {
                'cost': fee,
                'currency': quote,
                'rate': undefined,
            };
        }
        const timestamp = this.safeInteger (data, 'time');
        order['timestamp'] = timestamp;
        order['datetime'] = this.iso8601 (timestamp);
        order = this.safeOrder (order);
        storedOrders.append (order);
        const messageHash = 'orders:' + symbol;
        client.resolve (storedOrders, messageHash);
    }

    parseWsOrderUpdate (order, market = undefined) {
        //
        //      {
        //          "id": "150714937",
        //          "remains": "1000000",
        //          "price": "17513",
        //          "amount": 2000000, As Precision
        //          "time": "1654506118448",
        //          "type": "buy",
        //          "pair": {
        //              "symbol1": "BTC",
        //              "symbol2": "USD"
        //          },
        //          "fee": "0.15"
        //      }
        //  transaction
        //      {
        //           "d": "order:59425993014:a:BTC",
        //           "c": "user:up105393824:a:BTC",
        //           "a": "0.00098152",
        //           "ds": 0,
        //           "cs": "0.00098152",
        //           "user": "up105393824",
        //           "symbol": "BTC",
        //           "symbol2": "USD",
        //           "amount": "0.00098152",
        //           "buy": 59425993014,
        //           "order": 59425993014,
        //           "sell": 59425986168,
        //           "price": 19306.6,
        //           "type": "buy",
        //           "time": "2022-10-02T01:11:15.148Z",
        //           "balance": "0.00098152",
        //           "fee_amount": "0.05",
        //           "id": "59425993020"
        //       }
        //
        const isTransaction = this.safeValue (order, 'd') !== undefined;
        const remainsPrecision = this.safeString (order, 'remains');
        let remaining = undefined;
        if (remainsPrecision !== undefined) {
            remaining = this.currencyFromPrecision (market['base'], remainsPrecision);
        }
        const amount = this.safeString (order, 'amount');
        if (!isTransaction) {
            this.currencyFromPrecision (market['base'], amount);
        }
        let baseId = this.safeString (order, 'symbol');
        let quoteId = this.safeString (order, 'symbol2');
        const pair = this.safeValue (order, 'pair');
        if (pair !== undefined) {
            baseId = this.safeString (order, 'symbol1');
            quoteId = this.safeString (order, 'symbol2');
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = undefined;
        if (base !== undefined && quote !== undefined) {
            symbol = base + '/' + quote;
        }
        market = this.safeMarket (symbol, market);
        const time = this.safeInteger (order, 'time', this.milliseconds ());
        let timestamp = time;
        if (isTransaction) {
            timestamp = this.parse8601 (time);
        }
        const canceled = this.safeBool (order, 'cancel', false);
        let status = 'open';
        if (canceled) {
            status = 'canceled';
        } else if (isTransaction) {
            status = 'closed';
        }
        const parsedOrder: Dict = {
            'id': this.safeString2 (order, 'id', 'order'),
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString (order, 'type'),
            'price': this.safeNumber (order, 'price'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'average': undefined,
            'cost': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': remaining,
            'fee': {
                'cost': this.safeNumber2 (order, 'fee', 'fee_amount'),
                'currency': quote,
                'rate': undefined,
            },
            'trades': undefined,
        };
        if (isTransaction) {
            parsedOrder['trades'] = this.parseWsTrade (order, market);
        }
        return this.safeOrder (parsedOrder, market);
    }

    fromPrecision (amount, scale) {
        if (amount === undefined) {
            return undefined;
        }
        const precise = new Precise (amount);
        precise.decimals = this.sum (precise.decimals, scale);
        precise.reduce ();
        return precise.toString ();
    }

    currencyFromPrecision (currency, amount) {
        const scale = this.safeInteger (this.currencies[currency], 'precision', 0);
        return this.fromPrecision (amount, scale);
    }

    handleOrdersSnapshot (client: Client, message) {
        //
        //     {
        //         "e": "open-orders",
        //         "data": [{
        //             "id": "59098421630",
        //             "time": "1664062285425",
        //             "type": "buy",
        //             "price": "18920",
        //             "amount": "0.00100000",
        //             "pending": "0.00100000"
        //         }],
        //         "oid": 1,
        //         "ok": "ok"
        //     }
        //
        const symbol = this.safeString (message, 'oid'); // symbol is set as requestId in watchOrders
        const rawOrders = this.safeValue (message, 'data', []);
        let myOrders = this.orders;
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            myOrders = new ArrayCacheBySymbolById (limit);
        }
        for (let i = 0; i < rawOrders.length; i++) {
            const rawOrder = rawOrders[i];
            const market = this.safeMarket (symbol);
            const order = this.parseOrder (rawOrder, market);
            order['status'] = 'open';
            myOrders.append (order);
        }
        this.orders = myOrders;
        const messageHash = 'orders:' + symbol;
        const ordersLength = myOrders.length;
        if (ordersLength > 0) {
            client.resolve (myOrders, messageHash);
        }
    }

    /**
     * @method
     * @name cex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://cex.io/websocket-api#orderbook-subscribe
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const messageHash = 'orderbook:' + symbol;
        const depth = (limit === undefined) ? 0 : limit;
        const subscribe: Dict = {
            'e': 'order-book-subscribe',
            'data': {
                'pair': [
                    market['baseId'],
                    market['quoteId'],
                ],
                'subscribe': true,
                'depth': depth,
            },
            'oid': this.requestId (),
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit ();
    }

    handleOrderBookSnapshot (client: Client, message) {
        //
        //     {
        //         "e": "order-book-subscribe",
        //         "data": {
        //             "timestamp": 1663762032,
        //             "timestamp_ms": 1663762031680,
        //             "bids": [
        //                 [ 241.947, 155.91626 ],
        //                 [ 241, 154 ],
        //             ],
        //             "asks": [
        //                 [ 242.947, 155.91626 ],
        //                 [ 243, 154 ],    ],
        //             "pair": "BTC:USDT",
        //             "id": 616267120,
        //             "sell_total": "13.59066946",
        //             "buy_total": "163553.625948"
        //         },
        //         "oid": "1",
        //         "ok": "ok"
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const pair = this.safeString (data, 'pair');
        const symbol = this.pairToSymbol (pair);
        const messageHash = 'orderbook:' + symbol;
        const timestamp = this.safeInteger2 (data, 'timestamp_ms', 'timestamp');
        const incrementalId = this.safeInteger (data, 'id');
        const orderbook = this.orderBook ({});
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
        snapshot['nonce'] = incrementalId;
        orderbook.reset (snapshot);
        this.options['orderbook'][symbol] = {
            'incrementalId': incrementalId,
        };
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    pairToSymbol (pair) {
        const parts = pair.split (':');
        const baseId = this.safeString (parts, 0);
        const quoteId = this.safeString (parts, 1);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        return symbol;
    }

    handleOrderBookUpdate (client: Client, message) {
        //
        //     {
        //         "e": "md_update",
        //         "data": {
        //             "id": 616267121,
        //             "pair": "BTC:USDT",
        //             "time": 1663762031719,
        //             "bids": [],
        //             "asks": [
        //                 [122, 23]
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const incrementalId = this.safeInteger (data, 'id');
        const pair = this.safeString (data, 'pair', '');
        const symbol = this.pairToSymbol (pair);
        const storedOrderBook = this.safeValue (this.orderbooks, symbol);
        const messageHash = 'orderbook:' + symbol;
        if (incrementalId !== storedOrderBook['nonce'] + 1) {
            delete client.subscriptions[messageHash];
            client.reject (this.id + ' watchOrderBook() skipped a message', messageHash);
            return;
        }
        const timestamp = this.safeInteger (data, 'time');
        const asks = this.safeValue (data, 'asks', []);
        const bids = this.safeValue (data, 'bids', []);
        this.handleDeltas (storedOrderBook['asks'], asks);
        this.handleDeltas (storedOrderBook['bids'], bids);
        storedOrderBook['timestamp'] = timestamp;
        storedOrderBook['datetime'] = this.iso8601 (timestamp);
        storedOrderBook['nonce'] = incrementalId;
        client.resolve (storedOrderBook, messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 0, 1);
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    /**
     * @method
     * @name cex#watchOHLCV
     * @see https://cex.io/websocket-api#minute-data
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market. It will return the last 120 minutes with the selected timeframe and then 1m candle updates after that.
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents.
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'ohlcv:' + symbol;
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'e': 'init-ohlcv',
            'i': timeframe,
            'rooms': [
                'pair-' + market['baseId'] + '-' + market['quoteId'],
            ],
        };
        const ohlcv = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleInitOHLCV (client: Client, message) {
        //
        //     {
        //         "e": "init-ohlcv-data",
        //         "data": [
        //             [
        //                 1663660680,
        //                 "19396.4",
        //                 "19396.4",
        //                 "19396.4",
        //                 "19396.4",
        //                 "1262861"
        //             ],
        //             ...
        //         ],
        //         "pair": "BTC:USDT"
        //     }
        //
        const pair = this.safeString (message, 'pair');
        const parts = pair.split (':');
        const baseId = this.safeString (parts, 0);
        const quoteId = this.safeString (parts, 1);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const market = this.safeMarket (symbol);
        const messageHash = 'ohlcv:' + symbol;
        const data = this.safeValue (message, 'data', []);
        const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
        const stored = new ArrayCacheByTimestamp (limit);
        const sorted = this.sortBy (data, 0);
        for (let i = 0; i < sorted.length; i++) {
            stored.append (this.parseOHLCV (sorted[i], market));
        }
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        this.ohlcvs[symbol]['unknown'] = stored;
        client.resolve (stored, messageHash);
    }

    handleOHLCV24 (client: Client, message) {
        //
        //     {
        //         "e": "ohlcv24",
        //         "data": [ '18793.2', '19630', '18793.2', "19104.1", "314157273" ],
        //         "pair": "BTC:USDT"
        //     }
        //
        return message;
    }

    handleOHLCV1m (client: Client, message) {
        //
        //     {
        //         "e": "ohlcv1m",
        //         "data": {
        //             "pair": "BTC:USD",
        //             "time": "1665436800",
        //             "o": "19279.6",
        //             "h": "19279.6",
        //             "l": "19266.7",
        //             "c": "19266.7",
        //             "v": 3343884,
        //             "d": 3343884
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const pair = this.safeString (data, 'pair');
        const symbol = this.pairToSymbol (pair);
        const messageHash = 'ohlcv:' + symbol;
        const ohlcv = [
            this.safeTimestamp (data, 'time'),
            this.safeNumber (data, 'o'),
            this.safeNumber (data, 'h'),
            this.safeNumber (data, 'l'),
            this.safeNumber (data, 'c'),
            this.safeNumber (data, 'v'),
        ];
        const stored = this.safeValue (this.ohlcvs, symbol);
        stored.append (ohlcv);
        client.resolve (stored, messageHash);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "e": "ohlcv",
        //         "data": [
        //             [1665461100, '19068.2', '19068.2', '19068.2', "19068.2", 268478]
        //         ],
        //         "pair": "BTC:USD"
        //     }
        //
        const data = this.safeValue (message, 'data', []);
        const pair = this.safeString (message, 'pair');
        const symbol = this.pairToSymbol (pair);
        const messageHash = 'ohlcv:' + symbol;
        // const stored = this.safeValue (this.ohlcvs, symbol);
        const stored = this.ohlcvs[symbol]['unknown'];
        for (let i = 0; i < data.length; i++) {
            const ohlcv = [
                this.safeTimestamp (data[i], 0),
                this.safeNumber (data[i], 1),
                this.safeNumber (data[i], 2),
                this.safeNumber (data[i], 3),
                this.safeNumber (data[i], 4),
                this.safeNumber (data[i], 5),
            ];
            stored.append (ohlcv);
        }
        const dataLength = data.length;
        if (dataLength > 0) {
            client.resolve (stored, messageHash);
        }
    }

    /**
     * @method
     * @name cex#fetchOrderWs
     * @description fetches information on an order made by the user
     * @see https://docs.cex.io/#ws-api-get-order
     * @param {string} id the order id
     * @param {string} symbol not used by cex fetchOrder
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrderWs (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        await this.authenticate ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const data = this.extend ({
            'order_id': id.toString (),
        }, params);
        const url = this.urls['api']['ws'];
        const messageHash = this.requestId ();
        const request: Dict = {
            'e': 'get-order',
            'oid': messageHash,
            'data': data,
        };
        const response = await this.watch (url, messageHash, request, messageHash);
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name cex#fetchOpenOrdersWs
     * @see https://docs.cex.io/#ws-api-open-orders
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrdersWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrdersWs requires a symbol.');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = this.requestId ();
        const data = this.extend ({
            'pair': [ market['baseId'], market['quoteId'] ],
        }, params);
        const request: Dict = {
            'e': 'open-orders',
            'oid': messageHash,
            'data': data,
        };
        const response = await this.watch (url, messageHash, request, messageHash);
        return this.parseOrders (response, market, since, limit, params);
    }

    /**
     * @method
     * @name cex#createOrderWs
     * @see https://docs.cex.io/#ws-api-order-placement
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the kraken api endpoint
     * @param {boolean} [params.maker_only] Optional, maker only places an order only if offers best sell (<= max) or buy(>= max) price for this pair, if not order placement will be rejected with an error - "Order is not maker"
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        if (price === undefined) {
            throw new BadRequest (this.id + ' createOrderWs requires a price argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = this.requestId ();
        const data = this.extend ({
            'pair': [ market['baseId'], market['quoteId'] ],
            'amount': amount,
            'price': price,
            'type': side,
        }, params);
        const request: Dict = {
            'e': 'place-order',
            'oid': messageHash,
            'data': data,
        };
        const rawOrder = await this.watch (url, messageHash, request, messageHash);
        return this.parseOrder (rawOrder, market);
    }

    /**
     * @method
     * @name cex#editOrderWs
     * @description edit a trade order
     * @see https://docs.cex.io/#ws-api-cancel-replace
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float|undefined} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    async editOrderWs (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires a amount argument');
        }
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires a price argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        const data = this.extend ({
            'pair': [ market['baseId'], market['quoteId'] ],
            'type': side,
            'amount': amount,
            'price': price,
            'order_id': id,
        }, params);
        const messageHash = this.requestId ();
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'e': 'cancel-replace-order',
            'oid': messageHash,
            'data': data,
        };
        const response = await this.watch (url, messageHash, request, messageHash, messageHash);
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name cex#cancelOrderWs
     * @see https://docs.cex.io/#ws-api-order-cancel
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol not used by cex cancelOrder ()
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrderWs (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        await this.authenticate ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const data = this.extend ({
            'order_id': id,
        }, params);
        const messageHash = this.requestId ();
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'e': 'cancel-order',
            'oid': messageHash,
            'data': data,
        };
        const response = await this.watch (url, messageHash, request, messageHash, messageHash);
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name cex#cancelOrdersWs
     * @description cancel multiple orders
     * @see https://docs.cex.io/#ws-api-mass-cancel-place
     * @param {string[]} ids order ids
     * @param {string} symbol not used by cex cancelOrders()
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrdersWs (ids: string[], symbol: Str = undefined, params = {}) {
        if (symbol !== undefined) {
            throw new BadRequest (this.id + ' cancelOrderWs does not allow filtering by symbol');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const messageHash = this.requestId ();
        const data = this.extend ({
            'cancel-orders': ids,
        }, params);
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'e': 'mass-cancel-place-orders',
            'oid': messageHash,
            'data': data,
        };
        const response = await this.watch (url, messageHash, request, messageHash, messageHash);
        //
        //    {
        //        "cancel-orders": [{
        //            "order_id": 69202557979,
        //            "fremains": "0.15000000"
        //        }],
        //        "place-orders": [],
        //        "placed-cancelled": []
        //    }
        //
        const canceledOrders = this.safeValue (response, 'cancel-orders');
        return this.parseOrders (canceledOrders, undefined, undefined, undefined, params);
    }

    resolveData (client: Client, message) {
        //
        //    "e": "open-orders",
        //    "data": [
        //       {
        //          "id": "2477098",
        //          "time": "1435927928618",
        //          "type": "buy",
        //          "price": "241.9477",
        //          "amount": "0.02000000",
        //          "pending": "0.02000000"
        //       },
        //       ...
        //    ],
        //    "oid": "1435927928274_9_open-orders",
        //    "ok": "ok"
        //    }
        //
        const data = this.safeValue (message, 'data');
        const messageHash = this.safeString (message, 'oid');
        client.resolve (data, messageHash);
    }

    handleConnected (client: Client, message) {
        //
        //     {
        //         "e": "connected"
        //     }
        //
        return message;
    }

    handleErrorMessage (client: Client, message): Bool {
        //
        //     {
        //         "e": "get-balance",
        //         "data": { error: "Please Login" },
        //         "oid": 1,
        //         "ok": "error"
        //     }
        //
        try {
            const data = this.safeValue (message, 'data', {});
            const error = this.safeString (data, 'error');
            const event = this.safeString (message, 'e', '');
            const feedback = this.id + ' ' + event + ' ' + error;
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback);
        } catch (error) {
            const messageHash = this.safeString (message, 'oid');
            const future = this.safeValue (client['futures'], messageHash);
            if (future !== undefined) {
                client.reject (error, messageHash);
                return true;
            } else {
                throw error;
            }
        }
    }

    handleMessage (client: Client, message) {
        const ok = this.safeString (message, 'ok');
        if (ok === 'error') {
            this.handleErrorMessage (client, message);
            return;
        }
        const event = this.safeString (message, 'e');
        const handlers: Dict = {
            'auth': this.handleAuthenticationMessage,
            'connected': this.handleConnected,
            'tick': this.handleTicker,
            'ticker': this.handleTicker,
            'init-ohlcv-data': this.handleInitOHLCV,
            'ohlcv24': this.handleOHLCV24,
            'ohlcv1m': this.handleOHLCV1m,
            'ohlcv': this.handleOHLCV,
            'get-balance': this.handleBalance,
            'order-book-subscribe': this.handleOrderBookSnapshot,
            'md_update': this.handleOrderBookUpdate,
            'open-orders': this.resolveData,
            'order': this.handleOrderUpdate,
            'history-update': this.handleTrade,
            'history': this.handleTradesSnapshot,
            'tx': this.handleTransaction,
            'place-order': this.resolveData,
            'cancel-replace-order': this.resolveData,
            'cancel-order': this.resolveData,
            'mass-cancel-place-orders': this.resolveData,
            'get-order': this.resolveData,
        };
        const handler = this.safeValue (handlers, event);
        if (handler !== undefined) {
            handler.call (this, client, message);
        }
    }

    handleAuthenticationMessage (client: Client, message) {
        //
        //     {
        //         "e": "auth",
        //         "data": {
        //             "ok": "ok"
        //         },
        //         "ok": "ok",
        //         "timestamp":1448034593
        //     }
        //
        const future = this.safeValue (client.futures, 'authenticated');
        if (future !== undefined) {
            future.resolve (true);
        }
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.future ('authenticated');
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            this.checkRequiredCredentials ();
            const nonce = this.seconds ().toString ();
            const auth = nonce + this.apiKey;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
            const request: Dict = {
                'e': 'auth',
                'auth': {
                    'key': this.apiKey,
                    'signature': signature.toUpperCase (),
                    'timestamp': nonce,
                },
            };
            await this.watch (url, messageHash, this.extend (request, params), messageHash);
        }
        return await future;
    }
}

