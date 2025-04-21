'use strict';

var coinbaseinternational$1 = require('../coinbaseinternational.js');
var errors = require('../base/errors.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');
var Cache = require('../base/ws/Cache.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class coinbaseinternational extends coinbaseinternational$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchTicker': true,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': false,
                'watchOrders': false,
                'watchOrdersForSymbols': false,
                'watchPositions': false,
                'watchTickers': true,
                'createOrderWs': false,
                'editOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
                'cancelAllOrdersWs': false,
                'fetchOrderWs': false,
                'fetchOrdersWs': false,
                'fetchBalanceWs': false,
                'fetchMyTradesWs': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws-md.international.coinbase.com',
                },
                'test': {
                    'ws': 'wss://ws-md.n5e2.coinbase.com',
                },
            },
            'options': {
                'watchTicker': {
                    'channel': 'LEVEL1', // 'INSTRUMENTS' or 'RISK'
                },
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'myTradesLimit': 1000,
                'timeframes': {
                    '1m': 'CANDLES_ONE_MINUTE',
                    '5m': 'CANDLES_FIVE_MINUTES',
                    '30m': 'CANDLES_THIRTY_MINUTES',
                    '1h': 'CANDLES_ONE_HOUR',
                    '2h': 'CANDLES_TWO_HOURS',
                    '1d': 'CANDLES_ONE_DAY',
                },
            },
            'exceptions': {
                'exact': {
                    'Unable to authenticate': errors.AuthenticationError,
                },
            },
        });
    }
    /**
     * @ignore
     * @method
     * @description subscribes to a websocket channel
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-overview#subscribe
     * @param {string} name the name of the channel
     * @param {string[]} [symbols] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} subscription to a websocket channel
     */
    async subscribe(name, symbols = undefined, params = {}) {
        await this.loadMarkets();
        this.checkRequiredCredentials();
        let market = undefined;
        let messageHash = name;
        let productIds = undefined;
        if (symbols === undefined) {
            symbols = this.getActiveSymbols();
        }
        const symbolsLength = symbols.length;
        const messageHashes = [];
        if (symbolsLength > 1) {
            const parsedSymbols = this.marketSymbols(symbols);
            const marketIds = this.marketIds(parsedSymbols);
            productIds = marketIds;
            for (let i = 0; i < parsedSymbols.length; i++) {
                messageHashes.push(name + '::' + parsedSymbols[i]);
            }
            // messageHash = messageHash + '::' + parsedSymbols.join (',');
        }
        else if (symbolsLength === 1) {
            market = this.market(symbols[0]);
            messageHash = name + '::' + market['symbol'];
            productIds = [market['id']];
        }
        const url = this.urls['api']['ws'];
        if (url === undefined) {
            throw new errors.NotSupported(this.id + ' is not supported in sandbox environment');
        }
        const timestamp = this.nonce().toString();
        const auth = timestamp + this.apiKey + 'CBINTLMD' + this.password;
        const signature = this.hmac(this.encode(auth), this.base64ToBinary(this.secret), sha256.sha256, 'base64');
        const subscribe = {
            'type': 'SUBSCRIBE',
            // 'product_ids': productIds,
            'channels': [name],
            'time': timestamp,
            'key': this.apiKey,
            'passphrase': this.password,
            'signature': signature,
        };
        if (productIds !== undefined) {
            subscribe['product_ids'] = productIds;
        }
        if (symbolsLength > 1) {
            return await this.watchMultiple(url, messageHashes, this.extend(subscribe, params), messageHashes);
        }
        return await this.watch(url, messageHash, this.extend(subscribe, params), messageHash);
    }
    /**
     * @ignore
     * @method
     * @description subscribes to a websocket channel using watchMultiple
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-overview#subscribe
     * @param {string} name the name of the channel
     * @param {string|string[]} [symbols] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} subscription to a websocket channel
     */
    async subscribeMultiple(name, symbols = undefined, params = {}) {
        await this.loadMarkets();
        this.checkRequiredCredentials();
        if (this.isEmpty(symbols)) {
            symbols = this.symbols;
        }
        else {
            symbols = this.marketSymbols(symbols);
        }
        const messageHashes = [];
        const productIds = [];
        for (let i = 0; i < symbols.length; i++) {
            const marketId = this.marketId(symbols[i]);
            const symbol = this.symbol(marketId);
            productIds.push(marketId);
            messageHashes.push(name + '::' + symbol);
        }
        const url = this.urls['api']['ws'];
        if (url === undefined) {
            throw new errors.NotSupported(this.id + ' is not supported in sandbox environment');
        }
        const timestamp = this.numberToString(this.seconds());
        const auth = timestamp + this.apiKey + 'CBINTLMD' + this.password;
        const signature = this.hmac(this.encode(auth), this.base64ToBinary(this.secret), sha256.sha256, 'base64');
        const subscribe = {
            'type': 'SUBSCRIBE',
            'time': timestamp,
            'product_ids': productIds,
            'channels': [name],
            'key': this.apiKey,
            'passphrase': this.password,
            'signature': signature,
        };
        return await this.watchMultiple(url, messageHashes, this.extend(subscribe, params), messageHashes);
    }
    /**
     * @method
     * @name coinbaseinternational#watchFundingRate
     * @description watch the current funding rate
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#funding-channel
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async watchFundingRate(symbol, params = {}) {
        await this.loadMarkets();
        return await this.subscribe('RISK', [symbol], params);
    }
    /**
     * @method
     * @name coinbaseinternational#watchFundingRates
     * @description watch the funding rate for multiple markets
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#funding-channel
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
     */
    async watchFundingRates(symbols, params = {}) {
        await this.loadMarkets();
        const fundingRate = await this.subscribeMultiple('RISK', symbols, params);
        const symbol = this.safeString(fundingRate, 'symbol');
        if (this.newUpdates) {
            const result = {};
            result[symbol] = fundingRate;
            return result;
        }
        return this.filterByArray(this.fundingRates, 'symbol', symbols);
    }
    /**
     * @method
     * @name coinbaseinternational#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#instruments-channel
     * @param {string} [symbol] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to watch, 'LEVEL1' or 'INSTRUMENTS', default is 'LEVEL1'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        let channel = undefined;
        [channel, params] = this.handleOptionAndParams(params, 'watchTicker', 'channel', 'LEVEL1');
        return await this.subscribe(channel, [symbol], params);
    }
    getActiveSymbols() {
        const symbols = this.symbols;
        const output = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.markets[symbol];
            if (market['active']) {
                output.push(symbol);
            }
        }
        return output;
    }
    /**
     * @method
     * @name coinbaseinternational#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#instruments-channel
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to watch, 'LEVEL1' or 'INSTRUMENTS', default is 'INSTLEVEL1UMENTS'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let channel = undefined;
        [channel, params] = this.handleOptionAndParams(params, 'watchTickers', 'channel', 'LEVEL1');
        const ticker = await this.subscribe(channel, symbols, params);
        if (this.newUpdates) {
            const result = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    handleInstrument(client, message) {
        //
        //    {
        //        "sequence": 1,
        //        "product_id": "ETH-PERP",
        //        "instrument_type": "PERP",
        //        "base_asset_name": "ETH",
        //        "quote_asset_name": "USDC",
        //        "base_increment": "0.0001",
        //        "quote_increment": "0.01",
        //        "avg_daily_quantity": "43.0",
        //        "avg_daily_volume": "80245.2",
        //        "total_30_day_quantity":"1443.0",
        //        "total_30_day_volume":"3040449.0",
        //        "total_24_hour_quantity":"48.1",
        //        "total_24_hour_volume":"101348.3",
        //        "base_imf": "0.2",
        //        "min_quantity": "0.0001",
        //        "position_size_limit": "500",
        //        "funding_interval": "60000000000",
        //        "trading_state": "trading",
        //        "last_update_time": "2023-05-04T11:16:33.016Z",
        //        "time": "2023-05-10T14:58:47.000Z",
        //        "channel":"INSTRUMENTS",
        //        "type":"SNAPSHOT"
        //    }
        const ticker = this.parseWsInstrument(message);
        const channel = this.safeString(message, 'channel');
        client.resolve(ticker, channel);
        client.resolve(ticker, channel + '::' + ticker['symbol']);
    }
    parseWsInstrument(ticker, market = undefined) {
        //
        //    {
        //        "sequence": 1,
        //        "product_id": "ETH-PERP",
        //        "instrument_type": "PERP",
        //        "base_asset_name": "ETH",
        //        "quote_asset_name": "USDC",
        //        "base_increment": "0.0001",
        //        "quote_increment": "0.01",
        //        "avg_daily_quantity": "43.0",
        //        "avg_daily_volume": "80245.2",
        //        "total_30_day_quantity":"1443.0",
        //        "total_30_day_volume":"3040449.0",
        //        "total_24_hour_quantity":"48.1",
        //        "total_24_hour_volume":"101348.3",
        //        "base_imf": "0.2",
        //        "min_quantity": "0.0001",
        //        "position_size_limit": "500",
        //        "funding_interval": "60000000000",
        //        "trading_state": "trading",
        //        "last_update_time": "2023-05-04T11:16:33.016Z",
        //        "time": "2023-05-10T14:58:47.000Z",
        //        "channel":"INSTRUMENTS",
        //        "type":"SNAPSHOT"
        //    }
        // instruments
        //   {
        //       sequence: 0,
        //       instrument_type: 'PERP',
        //       instrument_mode: 'standard',
        //       base_asset_name: 'BTC',
        //       quote_asset_name: 'USDC',
        //       base_increment: '0.0001',
        //       quote_increment: '0.1',
        //       avg_daily_quantity: '502.8845',
        //       avg_daily_volume: '3.1495242961566668E7',
        //       total30_day_quantity: '15086.535',
        //       total30_day_volume: '9.44857288847E8',
        //       total24_hour_quantity: '5.0',
        //       total24_hour_volume: '337016.5',
        //       base_imf: '0.1',
        //       min_quantity: '0.0001',
        //       position_size_limit: '800',
        //       funding_interval: '3600000000000',
        //       trading_state: 'trading',
        //       last_updated_time: '2024-07-30T15:00:00Z',
        //       default_initial_margin: '0.2',
        //       base_asset_multiplier: '1.0',
        //       channel: 'INSTRUMENTS',
        //       type: 'SNAPSHOT',
        //       time: '2024-07-30T15:26:56.766Z',
        //   }
        //
        const marketId = this.safeString(ticker, 'product_id');
        const datetime = this.safeString(ticker, 'time');
        return this.safeTicker({
            'info': ticker,
            'symbol': this.safeSymbol(marketId, market, '-'),
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString2(ticker, 'total_24_hour_quantity', 'total24_hour_quantity'),
            'quoteVolume': this.safeString2(ticker, 'total_24_hour_volume', 'total24_hour_volume'),
        });
    }
    handleTicker(client, message) {
        //
        // snapshot
        //    {
        //        "sequence": 0,
        //        "product_id": "BTC-PERP",
        //        "time": "2023-05-10T14:58:47.000Z",
        //        "bid_price": "28787.8",
        //        "bid_qty": "0.466", // One side book
        //        "channel": "LEVEL1",
        //        "type": "SNAPSHOT"
        //    }
        // update
        //    {
        //       "sequence": 1,
        //       "product_id": "BTC-PERP",
        //       "time": "2023-05-10T14:58:47.547Z",
        //       "bid_price": "28787.8",
        //       "bid_qty": "0.466",
        //       "ask_price": "28788.8",
        //       "ask_qty": "1.566",
        //       "channel": "LEVEL1",
        //       "type": "UPDATE"
        //    }
        //
        const ticker = this.parseWsTicker(message);
        const channel = this.safeString(message, 'channel');
        client.resolve(ticker, channel);
        client.resolve(ticker, channel + '::' + ticker['symbol']);
    }
    parseWsTicker(ticker, market = undefined) {
        //
        //    {
        //       "sequence": 1,
        //       "product_id": "BTC-PERP",
        //       "time": "2023-05-10T14:58:47.547Z",
        //       "bid_price": "28787.8",
        //       "bid_qty": "0.466",
        //       "ask_price": "28788.8",
        //       "ask_qty": "1.566",
        //       "channel": "LEVEL1",
        //       "type": "UPDATE"
        //    }
        //
        const datetime = this.safeString(ticker, 'time');
        const marketId = this.safeString(ticker, 'product_id');
        return this.safeTicker({
            'info': ticker,
            'symbol': this.safeSymbol(marketId, market),
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'bid': this.safeNumber(ticker, 'bid_price'),
            'bidVolume': this.safeNumber(ticker, 'bid_qty'),
            'ask': this.safeNumber(ticker, 'ask_price'),
            'askVolume': this.safeNumber(ticker, 'ask_qty'),
            'high': undefined,
            'low': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'vwap': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'previousClose': undefined,
        });
    }
    /**
     * @method
     * @name coinbaseinternational#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.cdp.coinbase.com/intx/docs/websocket-channels#candles-channel
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const options = this.safeDict(this.options, 'timeframes', {});
        const interval = this.safeString(options, timeframe, timeframe);
        const ohlcv = await this.subscribe(interval, [symbol], params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    handleOHLCV(client, message) {
        //
        // {
        //     "sequence": 0,
        //     "product_id": "BTC-PERP",
        //     "channel": "CANDLES_ONE_MINUTE",
        //     "type": "SNAPSHOT",
        //     "candles": [
        //       {
        //           "time": "2023-05-10T14:58:47.000Z",
        //           "low": "28787.8",
        //           "high": "28788.8",
        //           "open": "28788.8",
        //           "close": "28787.8",
        //           "volume": "0.466"
        //        },
        //     ]
        //  }
        //
        const messageHash = this.safeString(message, 'channel');
        const marketId = this.safeString(message, 'product_id');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const timeframe = this.findTimeframe(messageHash);
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        if (this.safeValue(this.ohlcvs[symbol], timeframe) === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new Cache.ArrayCacheByTimestamp(limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        const data = this.safeList(message, 'candles', []);
        for (let i = 0; i < data.length; i++) {
            const tick = data[i];
            const parsed = this.parseOHLCV(tick, market);
            stored.append(parsed);
        }
        client.resolve(stored, messageHash + '::' + symbol);
    }
    /**
     * @method
     * @name coinbaseinternational#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#match-channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name coinbaseinternational#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true, true);
        const trades = await this.subscribeMultiple('MATCH', symbols, params);
        if (this.newUpdates) {
            const first = this.safeDict(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrade(client, message) {
        //
        //    {
        //       "sequence": 0,
        //       "product_id": "BTC-PERP",
        //       "time": "2023-05-10T14:58:47.002Z",
        //       "match_id": "177101110052388865",
        //       "trade_qty": "0.006",
        //       "aggressor_side": "BUY",
        //       "trade_price": "28833.1",
        //       "channel": "MATCH",
        //       "type": "UPDATE"
        //    }
        //
        const trade = this.parseWsTrade(message);
        const symbol = trade['symbol'];
        const channel = this.safeString(message, 'channel');
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            const tradesArrayCache = new Cache.ArrayCache(limit);
            this.trades[symbol] = tradesArrayCache;
        }
        const tradesArray = this.trades[symbol];
        tradesArray.append(trade);
        this.trades[symbol] = tradesArray;
        client.resolve(tradesArray, channel);
        client.resolve(tradesArray, channel + '::' + trade['symbol']);
        return message;
    }
    parseWsTrade(trade, market = undefined) {
        //
        //    {
        //       "sequence": 0,
        //       "product_id": "BTC-PERP",
        //       "time": "2023-05-10T14:58:47.002Z",
        //       "match_id": "177101110052388865",
        //       "trade_qty": "0.006",
        //       "aggressor_side": "BUY",
        //       "trade_price": "28833.1",
        //       "channel": "MATCH",
        //       "type": "UPDATE"
        //    }
        const marketId = this.safeString2(trade, 'symbol', 'product_id');
        const datetime = this.safeString(trade, 'time');
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'match_id'),
            'order': undefined,
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'symbol': this.safeSymbol(marketId, market),
            'type': undefined,
            'side': this.safeStringLower(trade, 'agressor_side'),
            'takerOrMaker': undefined,
            'price': this.safeString(trade, 'trade_price'),
            'amount': this.safeString(trade, 'trade_qty'),
            'cost': undefined,
            'fee': undefined,
        });
    }
    /**
     * @method
     * @name coinbaseinternational#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#level2-channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    /**
     * @method
     * @name coinbaseinternational#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#level2-channel
     * @param {string[]} symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        await this.loadMarkets();
        return await this.subscribeMultiple('LEVEL2', symbols, params);
    }
    handleOrderBook(client, message) {
        //
        // snapshot
        //    {
        //       "sequence": 0,
        //       "product_id": "BTC-PERP",
        //       "time": "2023-05-10T14:58:47.000Z",
        //       "bids": [
        //           ["29100", "0.02"],
        //           ["28950", "0.01"],
        //           ["28900", "0.01"]
        //       ],
        //       "asks": [
        //           ["29267.8", "18"],
        //           ["29747.6", "18"],
        //           ["30227.4", "9"]
        //       ],
        //       "channel": "LEVEL2",
        //       "type": "SNAPSHOT",
        //    }
        // update
        //    {
        //       "sequence": 1,
        //       "product_id": "BTC-PERP",
        //       "time": "2023-05-10T14:58:47.375Z",
        //       "changes": [
        //           [
        //               "BUY",
        //               "28787.7",
        //               "6"
        //           ]
        //       ],
        //       "channel": "LEVEL2",
        //       "type": "UPDATE"
        //    }
        //
        const type = this.safeString(message, 'type');
        const marketId = this.safeString(message, 'product_id');
        const symbol = this.safeSymbol(marketId);
        const datetime = this.safeString(message, 'time');
        const channel = this.safeString(message, 'channel');
        if (!(symbol in this.orderbooks)) {
            const limit = this.safeInteger(this.options, 'watchOrderBookLimit', 1000);
            this.orderbooks[symbol] = this.orderBook({}, limit);
        }
        const orderbook = this.orderbooks[symbol];
        if (type === 'SNAPSHOT') {
            const parsedSnapshot = this.parseOrderBook(message, symbol, undefined, 'bids', 'asks');
            orderbook.reset(parsedSnapshot);
            orderbook['symbol'] = symbol;
        }
        else {
            const changes = this.safeList(message, 'changes', []);
            this.handleDeltas(orderbook, changes);
        }
        orderbook['nonce'] = this.safeInteger(message, 'sequence');
        orderbook['datetime'] = datetime;
        orderbook['timestamp'] = this.parse8601(datetime);
        this.orderbooks[symbol] = orderbook;
        client.resolve(orderbook, channel + '::' + symbol);
    }
    handleDelta(orderbook, delta) {
        const rawSide = this.safeStringLower(delta, 0);
        const side = (rawSide === 'buy') ? 'bids' : 'asks';
        const price = this.safeFloat(delta, 1);
        const amount = this.safeFloat(delta, 2);
        const bookside = orderbook[side];
        bookside.store(price, amount);
    }
    handleDeltas(orderbook, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(orderbook, deltas[i]);
        }
    }
    handleSubscriptionStatus(client, message) {
        //
        //    {
        //       "channels": [
        //           {
        //               "name": "MATCH",
        //               "product_ids": [
        //                   "BTC-PERP",
        //                   "ETH-PERP"
        //               ]
        //           },
        //           {
        //               "name": "INSTRUMENTS",
        //               "product_ids": [
        //                   "BTC-PERP",
        //                   "ETH-PERP"
        //               ]
        //           }
        //       ],
        //       "authenticated": true,
        //       "channel": "SUBSCRIPTIONS",
        //       "type": "SNAPSHOT",
        //       "time": "2023-05-30T16:53:46.847Z"
        //    }
        //
        return message;
    }
    handleFundingRate(client, message) {
        //
        // snapshot
        //    {
        //       "sequence": 0,
        //       "product_id": "BTC-PERP",
        //       "time": "2023-05-10T14:58:47.000Z",
        //       "funding_rate": "0.001387",
        //       "is_final": true,
        //       "channel": "FUNDING",
        //       "type": "SNAPSHOT"
        //    }
        // update
        //    {
        //       "sequence": 1,
        //       "product_id": "BTC-PERP",
        //       "time": "2023-05-10T15:00:00.000Z",
        //       "funding_rate": "0.001487",
        //       "is_final": false,
        //       "channel": "FUNDING",
        //       "type": "UPDATE"
        //    }
        //
        const channel = this.safeString(message, 'channel');
        const fundingRate = this.parseFundingRate(message);
        this.fundingRates[fundingRate['symbol']] = fundingRate;
        client.resolve(fundingRate, channel + '::' + fundingRate['symbol']);
    }
    handleErrorMessage(client, message) {
        //
        //    {
        //        message: 'Failed to subscribe',
        //        reason: 'Unable to authenticate',
        //        channel: 'SUBSCRIPTIONS',
        //        type: 'REJECT'
        //    }
        //
        const type = this.safeString(message, 'type');
        if (type !== 'REJECT') {
            return false;
        }
        const reason = this.safeString(message, 'reason');
        const errMsg = this.safeString(message, 'message');
        try {
            const feedback = this.id + ' ' + errMsg + reason;
            this.throwExactlyMatchedException(this.exceptions['exact'], reason, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], reason, feedback);
            throw new errors.ExchangeError(feedback);
        }
        catch (e) {
            client.reject(e);
        }
        return true;
    }
    handleMessage(client, message) {
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        const channel = this.safeString(message, 'channel', '');
        const methods = {
            'SUBSCRIPTIONS': this.handleSubscriptionStatus,
            'INSTRUMENTS': this.handleInstrument,
            'LEVEL1': this.handleTicker,
            'MATCH': this.handleTrade,
            'LEVEL2': this.handleOrderBook,
            'FUNDING': this.handleFundingRate,
            'RISK': this.handleTicker,
        };
        const type = this.safeString(message, 'type');
        if (type === 'error') {
            const errorMessage = this.safeString(message, 'message');
            throw new errors.ExchangeError(errorMessage);
        }
        if (channel.indexOf('CANDLES') > -1) {
            this.handleOHLCV(client, message);
        }
        const method = this.safeValue(methods, channel);
        if (method !== undefined) {
            method.call(this, client, message);
        }
    }
}

module.exports = coinbaseinternational;
