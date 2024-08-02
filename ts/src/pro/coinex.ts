
//  ---------------------------------------------------------------------------

import coinexRest from '../coinex.js';
import { AuthenticationError, BadRequest, ExchangeNotAvailable, NotSupported, RequestTimeout, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, Balances, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class coinex extends coinexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchMyTrades': true,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': false,
                'fetchOHLCVWs': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://socket.coinex.com/v2/spot/',
                        'swap': 'wss://socket.coinex.com/v2/futures/',
                    },
                },
            },
            'options': {
                'ws': {
                    'gunzip': true,
                },
                'timeframes': {
                    '1m': 60,
                    '3m': 180,
                    '5m': 300,
                    '15m': 900,
                    '30m': 1800,
                    '1h': 3600,
                    '2h': 7200,
                    '4h': 14400,
                    '6h': 21600,
                    '12h': 43200,
                    '1d': 86400,
                    '3d': 259200,
                    '1w': 604800,
                },
                'account': 'spot',
                'watchOrderBook': {
                    'limits': [ 5, 10, 20, 50 ],
                    'defaultLimit': 50,
                    'aggregations': [ '1000', '100', '10', '1', '0', '0.1', '0.01', '0.001', '0.0001', '0.00001', '0.000001', '0.0000001', '0.00000001', '0.000000001', '0.0000000001', '0.00000000001' ],
                    'defaultAggregation': '0',
                },
            },
            'streaming': {
            },
            'exceptions': {
                'codes': {
                    '1': BadRequest, // Parameter error
                    '2': ExchangeError, // Internal error
                    '3': ExchangeNotAvailable, // Service unavailable
                    '4': NotSupported, // Method unavailable
                    '5': RequestTimeout, // Service timeout
                    '6': AuthenticationError, // Permission denied
                },
            },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    handleTicker (client: Client, message) {
        //
        //  spot
        //
        //     {
        //         "method": "state.update",
        //         "data": {
        //             "state_list": [
        //                 {
        //                     "market": "LATUSDT",
        //                     "last": "0.008157",
        //                     "open": "0.008286",
        //                     "close": "0.008157",
        //                     "high": "0.008390",
        //                     "low": "0.008106",
        //                     "volume": "807714.49139758",
        //                     "volume_sell": "286170.69645599",
        //                     "volume_buy": "266161.23236408",
        //                     "value": "6689.21644207",
        //                     "period": 86400
        //                 },
        //             ]
        //         },
        //         "id": null
        //     }
        //
        //  swap
        //
        //     {
        //         "method": "state.update",
        //         "data": {
        //             "state_list": [
        //                 {
        //                     "market": "ETHUSD_SIGNPRICE",
        //                     "last": "1892.29",
        //                     "open": "1884.62",
        //                     "close": "1892.29",
        //                     "high": "1894.09",
        //                     "low": "1863.72",
        //                     "volume": "0",
        //                     "value": "0",
        //                     "volume_sell": "0",
        //                     "volume_buy": "0",
        //                     "open_interest_size": "0",
        //                     "insurance_fund_size": "0",
        //                     "latest_funding_rate": "0",
        //                     "next_funding_rate": "0",
        //                     "latest_funding_time": 0,
        //                     "next_funding_time": 0,
        //                     "period": 86400
        //                 },
        //             ]
        //         ],
        //         "id": null
        //     }
        //
        const defaultType = this.safeString (this.options, 'defaultType');
        const data = this.safeDict (message, 'data', {});
        const rawTickers = this.safeList (data, 'state_list', []);
        const newTickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            const entry = rawTickers[i];
            const marketId = this.safeString (entry, 'market');
            const symbol = this.safeSymbol (marketId, undefined, undefined, defaultType);
            const market = this.safeMarket (marketId, undefined, undefined, defaultType);
            const parsedTicker = this.parseWSTicker (entry, market);
            this.tickers[symbol] = parsedTicker;
            newTickers.push (parsedTicker);
        }
        const messageHashes = this.findMessageHashes (client, 'tickers::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split ('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split (',');
            const tickers = this.filterByArray (newTickers, 'symbol', symbols);
            const tickersSymbols = Object.keys (tickers);
            const numTickers = tickersSymbols.length;
            if (numTickers > 0) {
                client.resolve (tickers, messageHash);
            }
        }
        client.resolve (newTickers, 'tickers');
    }

    parseWSTicker (ticker, market = undefined) {
        //
        //  spot
        //
        //     {
        //         "market": "LATUSDT",
        //         "last": "0.008157",
        //         "open": "0.008286",
        //         "close": "0.008157",
        //         "high": "0.008390",
        //         "low": "0.008106",
        //         "volume": "807714.49139758",
        //         "volume_sell": "286170.69645599",
        //         "volume_buy": "266161.23236408",
        //         "value": "6689.21644207",
        //         "period": 86400
        //     }
        //
        //  swap
        //
        //     {
        //         "market": "ETHUSD_SIGNPRICE",
        //         "last": "1892.29",
        //         "open": "1884.62",
        //         "close": "1892.29",
        //         "high": "1894.09",
        //         "low": "1863.72",
        //         "volume": "0",
        //         "value": "0",
        //         "volume_sell": "0",
        //         "volume_buy": "0",
        //         "open_interest_size": "0",
        //         "insurance_fund_size": "0",
        //         "latest_funding_rate": "0",
        //         "next_funding_rate": "0",
        //         "latest_funding_time": 0,
        //         "next_funding_time": 0,
        //         "period": 86400
        //     }
        //
        const defaultType = this.safeString (this.options, 'defaultType');
        const marketId = this.safeString (ticker, 'market');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market, undefined, defaultType),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': this.safeString (ticker, 'volume_buy'),
            'ask': undefined,
            'askVolume': this.safeString (ticker, 'volume_sell'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': this.safeString (ticker, 'close'),
            'last': this.safeString (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'value'),
            'info': ticker,
        }, market);
    }

    async watchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name coinex#watchBalance
         * @description watch balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.coinex.com/api/v2/assets/balance/ws/spot_balance
         * @see https://docs.coinex.com/api/v2/assets/balance/ws/futures_balance
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        await this.authenticate (params);
        const messageHash = 'balance';
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        const url = this.urls['api']['ws'][type];
        let currencies = Object.keys (this.currencies_by_id);
        if (currencies === undefined) {
            currencies = [];
        }
        const subscribe: Dict = {
            'method': 'balance.subscribe',
            'params': { 'ccy_list': currencies },
            'id': this.requestId (),
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleBalance (client: Client, message) {
        //
        // spot
        //
        //     {
        //         "method": "balance.update",
        //         "data": {
        //             "balance_list": [
        //                 {
        //                     "margin_market": "BTCUSDT",
        //                     "ccy": "BTC",
        //                     "available": "44.62207740",
        //                     "frozen": "0.00000000",
        //                     "updated_at": 1689152421692
        //                 },
        //             ]
        //         },
        //         "id": null
        //     }
        //
        // swap
        //
        //     {
        //         "method": "balance.update",
        //         "data": {
        //             "balance_list": [
        //                 {
        //                     "ccy": "USDT",
        //                     "available": "97.92470982756335000001",
        //                     "frozen": "0.00000000000000000000",
        //                     "margin": "0.61442700000000000000",
        //                     "transferrable": "97.92470982756335000001",
        //                     "unrealized_pnl": "-0.00807000000000000000",
        //                     "equity": "97.92470982756335000001"
        //                 },
        //             ]
        //         },
        //         "id": null
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const balances = this.safeList (data, 'balance_list', []);
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            this.balance['info'] = entry;
            const currencyId = this.safeString (entry, 'ccy');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (entry, 'available');
            account['used'] = this.safeString (entry, 'frozen');
            this.balance[code] = account;
            this.balance = this.safeBalance (this.balance);
        }
        const messageHash = 'balance';
        client.resolve (this.balance, messageHash);
    }

    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coinex#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @see https://docs.coinex.com/api/v2/spot/deal/ws/user-deals
         * @see https://docs.coinex.com/api/v2/futures/deal/ws/user-deals
         * @param {string} [symbol] unified symbol of the market the trades were made in
         * @param {int} [since] the earliest time in ms to watch trades
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchMyTrades', market, params);
        const url = this.urls['api']['ws'][type];
        const subscribedSymbols = [];
        let messageHash = 'myTrades';
        if (market !== undefined) {
            messageHash += ':' + symbol;
            subscribedSymbols.push (market['id']);
        }
        const message: Dict = {
            'method': 'user_deals.subscribe',
            'params': { 'market_list': subscribedSymbols },
            'id': this.requestId (),
        };
        const request = this.deepExtend (message, params);
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrades (client: Client, message) {
        //
        //     {
        //         "method": "user_deals.update",
        //         "data": {
        //             "deal_id": 3514376759,
        //             "created_at": 1689152421692,
        //             "market": "BTCUSDT",
        //             "side": "buy",
        //             "order_id": 8678890,
        //             "margin_market": "BTCUSDT",
        //             "price": "30718.42",
        //             "amount": "0.00000325",
        //             "role": "taker",
        //             "fee": "0.0299",
        //             "fee_ccy": "USDT"
        //         },
        //         "id": null
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'market');
        const defaultType = this.safeString (this.options, 'defaultType');
        const market = this.safeMarket (marketId, undefined, undefined, defaultType);
        const symbol = market['symbol'];
        const messageHash = 'myTrades:' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const parsed = this.parseWsTrade (data, market);
        stored.append (parsed);
        this.trades[symbol] = stored;
        client.resolve (this.trades[symbol], messageHash);
    }

    handleTrades (client: Client, message) {
        //
        // spot
        //
        //     {
        //         "method": "deals.update",
        //         "data": {
        //             "market": "BTCUSDT",
        //             "deal_list": [
        //                 {
        //                     "deal_id": 3514376759,
        //                     "created_at": 1689152421692,
        //                     "side": "buy",
        //                     "price": "30718.42",
        //                     "amount": "0.00000325"
        //                 },
        //             ]
        //         },
        //         "id": null
        //     }
        //
        // swap
        //
        //     {
        //         "method": "deals.update",
        //         "data": {
        //             "market": "BTCUSDT",
        //             "deal_list": [
        //                 {
        //                     "deal_id": 3514376759,
        //                     "created_at": 1689152421692,
        //                     "side": "buy",
        //                     "price": "30718.42",
        //                     "amount": "0.00000325"
        //                 },
        //             ]
        //         },
        //         "id": null
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const trades = this.safeList (data, 'deal_list', []);
        const marketId = this.safeString (data, 'market');
        const defaultType = this.safeString (this.options, 'defaultType');
        const market = this.safeMarket (marketId, undefined, undefined, defaultType);
        const symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const parsed = this.parseWsTrade (trade, market);
            stored.append (parsed);
        }
        this.trades[symbol] = stored;
        client.resolve (this.trades[symbol], messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        // spot watchTrades
        //
        //     {
        //         "deal_id": 3514376759,
        //         "created_at": 1689152421692,
        //         "side": "buy",
        //         "price": "30718.42",
        //         "amount": "0.00000325"
        //     }
        //
        // swap watchTrades
        //
        //     {
        //         "deal_id": 3514376759,
        //         "created_at": 1689152421692,
        //         "side": "buy",
        //         "price": "30718.42",
        //         "amount": "0.00000325"
        //     }
        //
        // spot and swap watchMyTrades
        //
        //     {
        //         "deal_id": 3514376759,
        //         "created_at": 1689152421692,
        //         "market": "BTCUSDT",
        //         "side": "buy",
        //         "order_id": 8678890,
        //         "margin_market": "BTCUSDT",
        //         "price": "30718.42",
        //         "amount": "0.00000325",
        //         "role": "taker",
        //         "fee": "0.0299",
        //         "fee_ccy": "USDT"
        //     }
        //
        const timestamp = this.safeInteger (trade, 'created_at');
        const defaultType = this.safeString (this.options, 'defaultType');
        const marketId = this.safeString (trade, 'market');
        market = this.safeMarket (marketId, market, undefined, defaultType);
        let fee: Dict = {};
        const feeCost = this.omitZero (this.safeString (trade, 'fee'));
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_ccy', market['quote']);
            fee = {
                'currency': this.safeCurrencyCode (feeCurrencyId),
                'cost': feeCost,
            };
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'deal_id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (marketId, market, undefined, defaultType),
            'order': this.safeString (trade, 'order_id'),
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': this.safeString (trade, 'role'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name coinex#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.coinex.com/api/v2/spot/market/ws/market
         * @see https://docs.coinex.com/api/v2/futures/market/ws/market-state
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const tickers = await this.watchTickers ([ symbol ], params);
        return this.safeValue (tickers, symbol);
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name coinex#watchTickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @see https://docs.coinex.com/api/v2/spot/market/ws/market
         * @see https://docs.coinex.com/api/v2/futures/market/ws/market-state
         * @param {string[]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        let marketIds = this.marketIds (symbols);
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchTickers', undefined, params);
        const url = this.urls['api']['ws'][type];
        let messageHash = 'tickers';
        if (marketIds !== undefined) {
            messageHash = 'tickers::' + symbols.join (',');
        } else {
            marketIds = [];
        }
        const subscribe: Dict = {
            'method': 'state.subscribe',
            'params': { 'market_list': marketIds },
            'id': this.requestId (),
        };
        const request = this.deepExtend (subscribe, params);
        const newTickers = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            return newTickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coinex#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.coinex.com/api/v2/spot/market/ws/market-deals
         * @see https://docs.coinex.com/api/v2/futures/market/ws/market-deals
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchTrades', market, params);
        const url = this.urls['api']['ws'][type];
        const messageHash = 'trades:' + symbol;
        const subscriptionHash = 'trades';
        const subscribedSymbols = this.safeList (this.options, 'watchTradesSubscriptions', []);
        subscribedSymbols.push (market['id']);
        const message: Dict = {
            'method': 'deals.subscribe',
            'params': { 'market_list': subscribedSymbols },
            'id': this.requestId (),
        };
        this.options['watchTradesSubscriptions'] = subscribedSymbols;
        const request = this.deepExtend (message, params);
        const trades = await this.watch (url, messageHash, request, subscriptionHash);
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coinex#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.coinex.com/api/v2/spot/market/ws/market-depth
         * @see https://docs.coinex.com/api/v2/futures/market/ws/market-depth
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchOrderBook', market, params);
        const url = this.urls['api']['ws'][type];
        const name = 'orderbook';
        const messageHash = name + ':' + symbol;
        const options = this.safeDict (this.options, 'watchOrderBook', {});
        const limits = this.safeList (options, 'limits', []);
        if (limit === undefined) {
            limit = this.safeInteger (options, 'defaultLimit', 50);
        }
        if (!this.inArray (limit, limits)) {
            throw new NotSupported (this.id + ' watchOrderBook() limit must be one of ' + limits.join (', '));
        }
        const defaultAggregation = this.safeString (options, 'defaultAggregation', '0');
        const aggregations = this.safeList (options, 'aggregations', []);
        const aggregation = this.safeString (params, 'aggregation', defaultAggregation);
        if (!this.inArray (aggregation, aggregations)) {
            throw new NotSupported (this.id + ' watchOrderBook() aggregation must be one of ' + aggregations.join (', '));
        }
        params = this.omit (params, 'aggregation');
        const watchOrderBookSubscriptions = this.safeValue (this.options, 'watchOrderBookSubscriptions', {});
        watchOrderBookSubscriptions[symbol] = [ market['id'], limit, aggregation, true ];
        const marketList = Object.values (watchOrderBookSubscriptions);
        const subscribe: Dict = {
            'method': 'depth.subscribe',
            'params': { 'market_list': marketList },
            'id': this.requestId (),
        };
        this.options['watchOrderBookSubscriptions'] = watchOrderBookSubscriptions;
        const subscriptionHash = this.hash (this.encode (this.json (watchOrderBookSubscriptions)), sha256);
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, subscriptionHash, request);
        return orderbook.limit ();
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

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "method": "depth.update",
        //         "data": {
        //             "market": "BTCUSDT",
        //             "is_full": true,
        //             "depth": {
        //                 "asks": [
        //                     [
        //                         "30740.00",
        //                         "0.31763545"
        //                     ],
        //                 ],
        //                 "bids": [
        //                     [
        //                         "30736.00",
        //                         "0.04857373"
        //                     ],
        //                 ],
        //                 "last": "30746.28",
        //                 "updated_at": 1689152421692,
        //                 "checksum": 2578768879
        //             }
        //         },
        //         "id": null
        //     }
        //
        const defaultType = this.safeString (this.options, 'defaultType');
        const data = this.safeDict (message, 'data', {});
        const depth = this.safeValue (data, 'depth', {});
        const marketId = this.safeString (data, 'market');
        const market = this.safeMarket (marketId, undefined, undefined, defaultType);
        const symbol = market['symbol'];
        const name = 'orderbook';
        const messageHash = name + ':' + symbol;
        const timestamp = this.safeInteger (depth, 'updated_at');
        const currentOrderBook = this.safeValue (this.orderbooks, symbol);
        const fullOrderBook = this.safeBool (data, 'is_full', false);
        let orderbook = depth;
        if (fullOrderBook) {
            const snapshot = this.parseOrderBook (orderbook, symbol, timestamp);
            if (currentOrderBook === undefined) {
                orderbook = this.orderBook (snapshot);
                this.orderbooks[symbol] = orderbook;
            } else {
                orderbook = this.orderbooks[symbol];
                orderbook.reset (snapshot);
            }
        } else {
            const asks = this.safeList (depth, 'asks', []);
            const bids = this.safeList (depth, 'bids', []);
            this.handleDeltas (currentOrderBook['asks'], asks);
            this.handleDeltas (currentOrderBook['bids'], bids);
            currentOrderBook['nonce'] = timestamp;
            currentOrderBook['timestamp'] = timestamp;
            currentOrderBook['datetime'] = this.iso8601 (timestamp);
            this.orderbooks[symbol] = currentOrderBook;
        }
        // this.checkOrderBookChecksum (this.orderbooks[symbol]);
        client.resolve (this.orderbooks[symbol], messageHash);
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name coinex#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.coinex.com/api/v2/spot/order/ws/user-order
         * @see https://docs.coinex.com/api/v2/futures/order/ws/user-order
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.stop] if the orders to watch are stop orders or not
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const stop = this.safeBool (params, 'stop');
        params = this.omit (params, 'stop');
        await this.authenticate (params);
        let messageHash = 'orders';
        let market = undefined;
        let marketList = undefined;
        const [ type, query ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            marketList = [ market['id'] ];
            messageHash += ':' + symbol;
        } else {
            marketList = [];
        }
        let method = undefined;
        if (stop) {
            method = 'stop.subscribe';
        } else {
            method = 'order.subscribe';
        }
        const message: Dict = {
            'method': method,
            'params': { 'market_list': marketList },
            'id': this.requestId (),
        };
        const url = this.urls['api']['ws'][type];
        const request = this.deepExtend (message, query);
        const orders = await this.watch (url, messageHash, request, messageHash, request);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client: Client, message) {
        //
        // spot
        //
        //     {
        //         "method": "order.update",
        //         "data": {
        //             "event": "put",
        //             "order": {
        //                 "order_id": 12750,
        //                 "market": "BTCUSDT",
        //                 "margin_market": "BTCUSDT",
        //                 "type": "limit",
        //                 "side": "buy",
        //                 "price": "5999.00",
        //                 "amount": "1.50000000",
        //                 "unfill_amount": "1.50000000",
        //                 "fill_value": "1.50000000",
        //                 "taker_fee_rate": "0.0001",
        //                 "maker_fee_rate": "0.0001",
        //                 "base_ccy_fee": "0.0001",
        //                 "quote_ccy_fee": "0.0001",
        //                 "discount_ccy_fee": "0.0001",
        //                 "last_fill_amount": "0",
        //                 "last_fill_price": "0",
        //                 "client_id": "buy1_1234",
        //                 "created_at": 1689152421692,
        //                 "updated_at": 1689152421692,
        //             }
        //         },
        //         "id": null
        //     }
        //
        // spot stop
        //
        //     {
        //         "method": "stop.update",
        //         "data": {
        //             "event": 1,
        //             "stop": {
        //                 "stop_id": 102067022299,
        //                 "market": "BTCUSDT",
        //                 "margin_market": "BTCUSDT",
        //                 "type": "limit",
        //                 "side": "buy",
        //                 "price": "20000.00",
        //                 "amount": "0.10000000",
        //                 "trigger_price": "20000.00",
        //                 "trigger_direction": "lower",
        //                 "taker_fee_rate": "0.0016",
        //                 "maker_fee_rate": "0.0016",
        //                 "status": "active_success",
        //                 "client_id": "",
        //                 "created_at": 1689152996689,
        //                 "updated_at": 1689152996689,
        //             }
        //         },
        //         "id": null
        //     }
        //
        // swap
        //
        //     {
        //         "method": "order.update",
        //         "data": {
        //             "event": "put",
        //             "order": {
        //                 "order_id": 98388656341,
        //                 "stop_id": 0,
        //                 "market": "BTCUSDT",
        //                 "side": "buy",
        //                 "type": "limit",
        //                 "amount": "0.0010",
        //                 "price": "50000.00",
        //                 "unfilled_amount": "0.0010",
        //                 "filled_amount": "0",
        //                 "filled_value": "0",
        //                 "fee": "0",
        //                 "fee_ccy": "USDT",
        //                 "taker_fee_rate": "0.00046",
        //                 "maker_fee_rate": "0.00000000000000000000",
        //                 "client_id": "",
        //                 "last_filled_amount": "0.0010",
        //                 "last_filled_price": "30721.35",
        //                 "created_at": 1689145715129,
        //                 "updated_at": 1689145715129
        //             }
        //         },
        //         "id": null
        //     }
        //
        // swap stop
        //
        //     {
        //         "method": "stop.update",
        //         "data": {
        //             "event": "put",
        //             "stop": {
        //                 "stop_id": 98389557871,
        //                 "market": "BTCUSDT",
        //                 "side": "sell",
        //                 "type": "limit",
        //                 "price": "20000.00",
        //                 "amount": "0.0100",
        //                 "trigger_price": "20000.00",
        //                 "trigger_direction": "higer",
        //                 "trigger_price_type": "index_price",
        //                 "taker_fee_rate": "0.00046",
        //                 "maker_fee_rate": "0.00026",
        //                 "client_id": "",
        //                 "created_at": 1689146382674,
        //                 "updated_at": 1689146382674
        //             }
        //         },
        //         "id": null
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const order = this.safeDict2 (data, 'order', 'stop', {});
        const parsedOrder = this.parseWsOrder (order);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (parsedOrder);
        let messageHash = 'orders';
        client.resolve (this.orders, messageHash);
        messageHash += ':' + parsedOrder['symbol'];
        client.resolve (this.orders, messageHash);
    }

    parseWsOrder (order, market = undefined) {
        //
        // spot
        //
        //     {
        //         "order_id": 12750,
        //         "market": "BTCUSDT",
        //         "margin_market": "BTCUSDT",
        //         "type": "limit",
        //         "side": "buy",
        //         "price": "5999.00",
        //         "amount": "1.50000000",
        //         "unfill_amount": "1.50000000",
        //         "fill_value": "1.50000000",
        //         "taker_fee_rate": "0.0001",
        //         "maker_fee_rate": "0.0001",
        //         "base_ccy_fee": "0.0001",
        //         "quote_ccy_fee": "0.0001",
        //         "discount_ccy_fee": "0.0001",
        //         "last_fill_amount": "0",
        //         "last_fill_price": "0",
        //         "client_id": "buy1_1234",
        //         "created_at": 1689152421692,
        //         "updated_at": 1689152421692,
        //     }
        //
        // spot stop
        //
        //     {
        //         "stop_id": 102067022299,
        //         "market": "BTCUSDT",
        //         "margin_market": "BTCUSDT",
        //         "type": "limit",
        //         "side": "buy",
        //         "price": "20000.00",
        //         "amount": "0.10000000",
        //         "trigger_price": "20000.00",
        //         "trigger_direction": "lower",
        //         "taker_fee_rate": "0.0016",
        //         "maker_fee_rate": "0.0016",
        //         "status": "active_success",
        //         "client_id": "",
        //         "created_at": 1689152996689,
        //         "updated_at": 1689152996689,
        //     }
        //
        // swap
        //
        //     {
        //         "order_id": 98388656341,
        //         "stop_id": 0,
        //         "market": "BTCUSDT",
        //         "side": "buy",
        //         "type": "limit",
        //         "amount": "0.0010",
        //         "price": "50000.00",
        //         "unfilled_amount": "0.0010",
        //         "filled_amount": "0",
        //         "filled_value": "0",
        //         "fee": "0",
        //         "fee_ccy": "USDT",
        //         "taker_fee_rate": "0.00046",
        //         "maker_fee_rate": "0.00000000000000000000",
        //         "client_id": "",
        //         "last_filled_amount": "0.0010",
        //         "last_filled_price": "30721.35",
        //         "created_at": 1689145715129,
        //         "updated_at": 1689145715129
        //     }
        //
        // swap stop
        //
        //     {
        //         "stop_id": 98389557871,
        //         "market": "BTCUSDT",
        //         "side": "sell",
        //         "type": "limit",
        //         "price": "20000.00",
        //         "amount": "0.0100",
        //         "trigger_price": "20000.00",
        //         "trigger_direction": "higer",
        //         "trigger_price_type": "index_price",
        //         "taker_fee_rate": "0.00046",
        //         "maker_fee_rate": "0.00026",
        //         "client_id": "",
        //         "created_at": 1689146382674,
        //         "updated_at": 1689146382674
        //     }
        //
        const timestamp = this.safeInteger (order, 'created_at');
        const marketId = this.safeString (order, 'market');
        const status = this.safeString (order, 'status');
        const defaultType = this.safeString (this.options, 'defaultType');
        market = this.safeMarket (marketId, market, undefined, defaultType);
        let fee = undefined;
        const feeCost = this.omitZero (this.safeString2 (order, 'fee', 'quote_ccy_fee'));
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (order, 'fee_ccy', market['quote']);
            fee = {
                'currency': this.safeCurrencyCode (feeCurrencyId),
                'cost': feeCost,
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString2 (order, 'order_id', 'stop_id'),
            'clientOrderId': this.safeString (order, 'client_id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': this.safeInteger (order, 'updated_at'),
            'symbol': market['symbol'],
            'type': this.safeString (order, 'type'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString (order, 'side'),
            'price': this.safeString (order, 'price'),
            'stopPrice': this.safeString (order, 'trigger_price'),
            'triggerPrice': this.safeString (order, 'trigger_price'),
            'amount': this.safeString (order, 'amount'),
            'filled': this.safeString2 (order, 'filled_amount', 'fill_value'),
            'remaining': this.safeString2 (order, 'unfilled_amount', 'unfill_amount'),
            'cost': undefined,
            'average': undefined,
            'status': this.parseWsOrderStatus (status),
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    parseWsOrderStatus (status) {
        const statuses: Dict = {
            'active_success': 'open',
            'active_fail': 'canceled',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    handleMessage (client: Client, message) {
        const error = this.safeValue (message, 'error');
        if (error !== undefined) {
            throw new ExchangeError (this.id + ' ' + this.json (error));
        }
        const method = this.safeString (message, 'method');
        const handlers: Dict = {
            'state.update': this.handleTicker,
            'balance.update': this.handleBalance,
            'deals.update': this.handleTrades,
            'user_deals.update': this.handleMyTrades,
            'depth.update': this.handleOrderBook,
            'order.update': this.handleOrders,
            'stop.update': this.handleOrders,
        };
        const handler = this.safeValue (handlers, method);
        if (handler !== undefined) {
            handler.call (this, client, message);
            return;
        }
        this.handleSubscriptionStatus (client, message);
    }

    handleAuthenticationMessage (client: Client, message) {
        //
        //     {
        //         "error": null,
        //         "result": {
        //             "status": "success"
        //         },
        //         "id": 1
        //     }
        //
        const messageHashSpot = 'authenticated:spot';
        const messageHashSwap = 'authenticated:swap';
        // client.resolve (message, messageHashSpot);
        // client.resolve (message, messageHashSwap);
        const spotFuture = this.safeValue (client.futures, messageHashSpot);
        spotFuture.resolve (true);
        const swapFutures = this.safeValue (client.futures, messageHashSwap);
        swapFutures.resolve (true);
        return message;
    }

    handleSubscriptionStatus (client: Client, message) {
        const id = this.safeInteger (message, 'id');
        const subscription = this.safeValue (client.subscriptions, id);
        if (subscription !== undefined) {
            const futureIndex = this.safeString (subscription, 'future');
            const future = this.safeValue (client.futures, futureIndex);
            if (future !== undefined) {
                future.resolve (true);
            }
            delete client.subscriptions[id];
        }
    }

    async authenticate (params = {}) {
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('authenticate', undefined, params);
        const url = this.urls['api']['ws'][type];
        const client = this.client (url);
        const time = this.milliseconds ();
        const timestamp = time.toString ();
        const isSpot = (type === 'spot');
        const spotMessageHash = 'authenticated:spot';
        const swapMessageHash = 'authenticated:swap';
        const messageHash = isSpot ? spotMessageHash : swapMessageHash;
        const future = client.future (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated !== undefined) {
            return await future;
        }
        const requestId = this.requestId ();
        const subscribe: Dict = {
            'id': requestId,
            'future': spotMessageHash,
        };
        const hmac = this.hmac (this.encode (timestamp), this.encode (this.secret), sha256, 'hex');
        const request: Dict = {
            'id': requestId,
            'method': 'server.sign',
            'params': {
                'access_id': this.apiKey,
                'signed_str': hmac.toLowerCase (),
                'timestamp': time,
            },
        };
        this.watch (url, messageHash, request, requestId, subscribe);
        client.subscriptions[messageHash] = true;
        return await future;
    }
}
