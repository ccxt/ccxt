'use strict';

var okx$1 = require('../okx.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class okx extends okx$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBookForSymbols': true,
                'watchBalance': true,
                'watchLiquidations': 'emulated',
                'watchLiquidationsForSymbols': true,
                'watchMyLiquidations': 'emulated',
                'watchMyLiquidationsForSymbols': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrders': true,
                'watchMyTrades': true,
                'watchPositions': true,
                'watchFundingRate': true,
                'watchFundingRates': true,
                'createOrderWs': true,
                'editOrderWs': true,
                'cancelOrderWs': true,
                'cancelOrdersWs': true,
                'cancelAllOrdersWs': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.okx.com:8443/ws/v5',
                },
                'test': {
                    'ws': 'wss://wspap.okx.com:8443/ws/v5',
                },
            },
            'options': {
                'watchOrderBook': {
                    //
                    // bbo-tbt
                    // 1. Newly added channel that sends tick-by-tick Level 1 data
                    // 2. All API users can subscribe
                    // 3. Public depth channel, verification not required
                    //
                    // books-l2-tbt
                    // 1. Only users who're VIP5 and above can subscribe
                    // 2. Identity verification required before subscription
                    //
                    // books50-l2-tbt
                    // 1. Only users who're VIP4 and above can subscribe
                    // 2. Identity verification required before subscription
                    //
                    // books
                    // 1. All API users can subscribe
                    // 2. Public depth channel, verification not required
                    //
                    // books5
                    // 1. All API users can subscribe
                    // 2. Public depth channel, verification not required
                    // 3. Data feeds will be delivered every 100ms (vs. every 200ms now)
                    //
                    'depth': 'books',
                },
                'watchBalance': 'spot',
                'watchTicker': {
                    'channel': 'tickers', // tickers, sprd-tickers, index-tickers, block-tickers
                },
                'watchTickers': {
                    'channel': 'tickers', // tickers, sprd-tickers, index-tickers, block-tickers
                },
                'watchOrders': {
                    'type': 'ANY', // SPOT, MARGIN, SWAP, FUTURES, OPTION, ANY
                },
                'watchMyTrades': {
                    'type': 'ANY', // SPOT, MARGIN, SWAP, FUTURES, OPTION, ANY
                },
                'createOrderWs': {
                    'op': 'batch-orders', // order, batch-orders
                },
                'editOrderWs': {
                    'op': 'amend-order', // amend-order, batch-amend-orders
                },
                'ws': {
                // 'inflate': true,
                },
                'checksum': true,
            },
            'streaming': {
                // okex does not support built-in ws protocol-level ping-pong
                // instead it requires a custom text-based ping-pong
                'ping': this.ping,
                'keepAlive': 20000,
            },
        });
    }
    getUrl(channel, access = 'public') {
        // for context: https://www.okx.com/help-center/changes-to-v5-api-websocket-subscription-parameter-and-url
        const isSandbox = this.options['sandboxMode'];
        const sandboxSuffix = isSandbox ? '?brokerId=9999' : '';
        const isBusiness = (access === 'business');
        const isPublic = (access === 'public');
        const url = this.urls['api']['ws'];
        if (isBusiness || (channel.indexOf('candle') > -1) || (channel === 'orders-algo')) {
            return url + '/business' + sandboxSuffix;
        }
        else if (isPublic) {
            return url + '/public' + sandboxSuffix;
        }
        return url + '/private' + sandboxSuffix;
    }
    async subscribeMultiple(access, channel, symbols = undefined, params = {}) {
        await this.loadMarkets();
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        symbols = this.marketSymbols(symbols);
        const url = this.getUrl(channel, access);
        let messageHash = channel;
        const args = [];
        messageHash += '::' + symbols.join(',');
        for (let i = 0; i < symbols.length; i++) {
            const marketId = this.marketId(symbols[i]);
            const arg = {
                'channel': channel,
                'instId': marketId,
            };
            args.push(this.extend(arg, params));
        }
        const request = {
            'op': 'subscribe',
            'args': args,
        };
        return await this.watch(url, messageHash, request, messageHash);
    }
    async subscribe(access, messageHash, channel, symbol, params = {}) {
        await this.loadMarkets();
        const url = this.getUrl(channel, access);
        const firstArgument = {
            'channel': channel,
        };
        if (symbol !== undefined) {
            const market = this.market(symbol);
            messageHash += ':' + market['id'];
            firstArgument['instId'] = market['id'];
        }
        const request = {
            'op': 'subscribe',
            'args': [
                this.deepExtend(firstArgument, params),
            ],
        };
        return await this.watch(url, messageHash, request, messageHash);
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#watchTradesForSymbols
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new errors.ArgumentsRequired(this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const channel = 'trades';
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            messageHashes.push(channel + ':' + symbol);
            const marketId = this.marketId(symbol);
            const topic = {
                'channel': channel,
                'instId': marketId,
            };
            topics.push(topic);
        }
        const request = {
            'op': 'subscribe',
            'args': topics,
        };
        const url = this.getUrl(channel, 'public');
        const trades = await this.watchMultiple(url, messageHashes, request, messageHashes);
        if (this.newUpdates) {
            const first = this.safeValue(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        //     {
        //         "arg": { channel: "trades", instId: "BTC-USDT" },
        //         "data": [
        //             {
        //                 "instId": "BTC-USDT",
        //                 "tradeId": "216970876",
        //                 "px": "31684.5",
        //                 "sz": "0.00001186",
        //                 "side": "buy",
        //                 "ts": "1626531038288"
        //             }
        //         ]
        //     }
        //
        const arg = this.safeValue(message, 'arg', {});
        const channel = this.safeString(arg, 'channel');
        const marketId = this.safeString(arg, 'instId');
        const symbol = this.safeSymbol(marketId);
        const data = this.safeValue(message, 'data', []);
        const tradesLimit = this.safeInteger(this.options, 'tradesLimit', 1000);
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseTrade(data[i]);
            const messageHash = channel + ':' + symbol;
            let stored = this.safeValue(this.trades, symbol);
            if (stored === undefined) {
                stored = new Cache.ArrayCache(tradesLimit);
                this.trades[symbol] = stored;
            }
            stored.append(trade);
            client.resolve(stored, messageHash);
        }
    }
    async watchFundingRate(symbol, params = {}) {
        /**
         * @method
         * @name okx#watchFundingRate
         * @description watch the current funding rate
         * @see https://www.okx.com/docs-v5/en/#public-data-websocket-funding-rate-channel
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        symbol = this.symbol(symbol);
        const fr = await this.watchFundingRates([symbol], params);
        return fr[symbol];
    }
    async watchFundingRates(symbols, params = {}) {
        /**
         * @method
         * @name coinbaseinternational#watchFundingRates
         * @description watch the funding rate for multiple markets
         * @see https://www.okx.com/docs-v5/en/#public-data-websocket-funding-rate-channel
         * @param {string[]} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const channel = 'funding-rate';
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            messageHashes.push(channel + ':' + symbol);
            const marketId = this.marketId(symbol);
            const topic = {
                'channel': channel,
                'instId': marketId,
            };
            topics.push(topic);
        }
        const request = {
            'op': 'subscribe',
            'args': topics,
        };
        const url = this.getUrl(channel, 'public');
        const fundingRate = await this.watchMultiple(url, messageHashes, request, messageHashes);
        if (this.newUpdates) {
            const symbol = this.safeString(fundingRate, 'symbol');
            const result = {};
            result[symbol] = fundingRate;
            return result;
        }
        return this.filterByArray(this.fundingRates, 'symbol', symbols);
    }
    handleFundingRate(client, message) {
        //
        // "data":[
        //     {
        //        "fundingRate":"0.0001875391284828",
        //        "fundingTime":"1700726400000",
        //        "instId":"BTC-USD-SWAP",
        //        "instType":"SWAP",
        //        "method": "next_period",
        //        "maxFundingRate":"0.00375",
        //        "minFundingRate":"-0.00375",
        //        "nextFundingRate":"0.0002608059239328",
        //        "nextFundingTime":"1700755200000",
        //        "premium": "0.0001233824646391",
        //        "settFundingRate":"0.0001699799259033",
        //        "settState":"settled",
        //        "ts":"1700724675402"
        //     }
        // ]
        //
        const data = this.safeList(message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const rawfr = data[i];
            const fundingRate = this.parseFundingRate(rawfr);
            const symbol = fundingRate['symbol'];
            this.fundingRates[symbol] = fundingRate;
            client.resolve(fundingRate, 'funding-rate' + ':' + fundingRate['symbol']);
        }
    }
    async watchTicker(symbol, params = {}) {
        /**
         * @method
         * @name okx#watchTicker
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-tickers-channel
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        let channel = undefined;
        [channel, params] = this.handleOptionAndParams(params, 'watchTicker', 'channel', 'tickers');
        params['channel'] = channel;
        const ticker = await this.watchTickers([symbol], params);
        return this.safeValue(ticker, symbol);
    }
    async watchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name okx#watchTickers
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-tickers-channel
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        if (this.isEmpty(symbols)) {
            throw new errors.ArgumentsRequired(this.id + ' watchTickers requires a list of symbols');
        }
        let channel = undefined;
        [channel, params] = this.handleOptionAndParams(params, 'watchTickers', 'channel', 'tickers');
        const newTickers = await this.subscribeMultiple('public', channel, symbols, params);
        if (this.newUpdates) {
            return newTickers;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    handleTicker(client, message) {
        //
        //     {
        //         "arg": { channel: "tickers", instId: "BTC-USDT" },
        //         "data": [
        //             {
        //                 "instType": "SPOT",
        //                 "instId": "BTC-USDT",
        //                 "last": "31500.1",
        //                 "lastSz": "0.00001754",
        //                 "askPx": "31500.1",
        //                 "askSz": "0.00998144",
        //                 "bidPx": "31500",
        //                 "bidSz": "3.05652439",
        //                 "open24h": "31697",
        //                 "high24h": "32248",
        //                 "low24h": "31165.6",
        //                 "sodUtc0": "31385.5",
        //                 "sodUtc8": "32134.9",
        //                 "volCcy24h": "503403597.38138519",
        //                 "vol24h": "15937.10781721",
        //                 "ts": "1626526618762"
        //             }
        //         ]
        //     }
        //
        const arg = this.safeValue(message, 'arg', {});
        const channel = this.safeString(arg, 'channel');
        const data = this.safeValue(message, 'data', []);
        const newTickers = [];
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseTicker(data[i]);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            newTickers.push(ticker);
        }
        const messageHashes = this.findMessageHashes(client, channel + '::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split(',');
            const tickers = this.filterByArray(newTickers, 'symbol', symbols);
            const tickersSymbols = Object.keys(tickers);
            const numTickers = tickersSymbols.length;
            if (numTickers > 0) {
                client.resolve(tickers, messageHash);
            }
        }
        return message;
    }
    async watchLiquidationsForSymbols(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#watchLiquidationsForSymbols
         * @description watch the public liquidations of a trading pair
         * @see https://www.okx.com/docs-v5/en/#public-data-websocket-liquidation-orders-channel
         * @param {string} symbol unified CCXT market symbol
         * @param {int} [since] the earliest time in ms to fetch liquidations for
         * @param {int} [limit] the maximum number of liquidation structures to retrieve
         * @param {object} [params] exchange specific parameters for the okx api endpoint
         * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, true, true);
        let messageHash = 'liquidations';
        if (symbols !== undefined) {
            messageHash += '::' + symbols.join(',');
        }
        const market = this.getMarketFromSymbols(symbols);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchliquidationsForSymbols', market, params);
        const channel = 'liquidation-orders';
        if (type === 'spot') {
            type = 'SWAP';
        }
        else if (type === 'future') {
            type = 'futures';
        }
        const uppercaseType = type.toUpperCase();
        const request = {
            'instType': uppercaseType,
        };
        const newLiquidations = await this.subscribe('public', messageHash, channel, undefined, this.extend(request, params));
        if (this.newUpdates) {
            return newLiquidations;
        }
        return this.filterBySymbolsSinceLimit(this.liquidations, symbols, since, limit, true);
    }
    handleLiquidation(client, message) {
        //
        //    {
        //        "arg": {
        //            "channel": "liquidation-orders",
        //            "instType": "SWAP"
        //        },
        //        "data": [
        //            {
        //                "details": [
        //                    {
        //                        "bkLoss": "0",
        //                        "bkPx": "0.007831",
        //                        "ccy": "",
        //                        "posSide": "short",
        //                        "side": "buy",
        //                        "sz": "13",
        //                        "ts": "1692266434010"
        //                    }
        //                ],
        //                "instFamily": "IOST-USDT",
        //                "instId": "IOST-USDT-SWAP",
        //                "instType": "SWAP",
        //                "uly": "IOST-USDT"
        //            }
        //        ]
        //    }
        //
        const rawLiquidations = this.safeList(message, 'data', []);
        for (let i = 0; i < rawLiquidations.length; i++) {
            const rawLiquidation = rawLiquidations[i];
            const liquidation = this.parseWsLiquidation(rawLiquidation);
            const symbol = this.safeString(liquidation, 'symbol');
            let liquidations = this.safeValue(this.liquidations, symbol);
            if (liquidations === undefined) {
                const limit = this.safeInteger(this.options, 'liquidationsLimit', 1000);
                liquidations = new Cache.ArrayCache(limit);
            }
            liquidations.append(liquidation);
            this.liquidations[symbol] = liquidations;
            client.resolve([liquidation], 'liquidations');
            client.resolve([liquidation], 'liquidations::' + symbol);
        }
    }
    async watchMyLiquidationsForSymbols(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#watchMyLiquidationsForSymbols
         * @description watch the private liquidations of a trading pair
         * @see https://www.okx.com/docs-v5/en/#trading-account-websocket-balance-and-position-channel
         * @param {string} symbol unified CCXT market symbol
         * @param {int} [since] the earliest time in ms to fetch liquidations for
         * @param {int} [limit] the maximum number of liquidation structures to retrieve
         * @param {object} [params] exchange specific parameters for the okx api endpoint
         * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
         */
        await this.loadMarkets();
        const isStop = this.safeValue2(params, 'stop', 'trigger', false);
        params = this.omit(params, ['stop', 'trigger']);
        await this.authenticate({ 'access': isStop ? 'business' : 'private' });
        symbols = this.marketSymbols(symbols, undefined, true, true);
        let messageHash = 'myLiquidations';
        if (symbols !== undefined) {
            messageHash += '::' + symbols.join(',');
        }
        const channel = 'balance_and_position';
        const newLiquidations = await this.subscribe('private', messageHash, channel, undefined, params);
        if (this.newUpdates) {
            return newLiquidations;
        }
        return this.filterBySymbolsSinceLimit(this.liquidations, symbols, since, limit, true);
    }
    handleMyLiquidation(client, message) {
        //
        //    {
        //        "arg": {
        //            "channel": "balance_and_position",
        //            "uid": "77982378738415879"
        //        },
        //        "data": [{
        //            "pTime": "1597026383085",
        //            "eventType": "snapshot",
        //            "balData": [{
        //                "ccy": "BTC",
        //                "cashBal": "1",
        //                "uTime": "1597026383085"
        //            }],
        //            "posData": [{
        //                "posId": "1111111111",
        //                "tradeId": "2",
        //                "instId": "BTC-USD-191018",
        //                "instType": "FUTURES",
        //                "mgnMode": "cross",
        //                "posSide": "long",
        //                "pos": "10",
        //                "ccy": "BTC",
        //                "posCcy": "",
        //                "avgPx": "3320",
        //                "uTIme": "1597026383085"
        //            }],
        //            "trades": [{
        //                "instId": "BTC-USD-191018",
        //                "tradeId": "2",
        //            }]
        //        }]
        //    }
        //
        const rawLiquidations = this.safeList(message, 'data', []);
        for (let i = 0; i < rawLiquidations.length; i++) {
            const rawLiquidation = rawLiquidations[i];
            const eventType = this.safeString(rawLiquidation, 'eventType');
            if (eventType !== 'liquidation') {
                return;
            }
            const liquidation = this.parseWsMyLiquidation(rawLiquidation);
            const symbol = this.safeString(liquidation, 'symbol');
            let liquidations = this.safeValue(this.liquidations, symbol);
            if (liquidations === undefined) {
                const limit = this.safeInteger(this.options, 'myLiquidationsLimit', 1000);
                liquidations = new Cache.ArrayCache(limit);
            }
            liquidations.append(liquidation);
            this.liquidations[symbol] = liquidations;
            client.resolve([liquidation], 'myLiquidations');
            client.resolve([liquidation], 'myLiquidations::' + symbol);
        }
    }
    parseWsMyLiquidation(liquidation, market = undefined) {
        //
        //    {
        //        "pTime": "1597026383085",
        //        "eventType": "snapshot",
        //        "balData": [{
        //            "ccy": "BTC",
        //            "cashBal": "1",
        //            "uTime": "1597026383085"
        //        }],
        //        "posData": [{
        //            "posId": "1111111111",
        //            "tradeId": "2",
        //            "instId": "BTC-USD-191018",
        //            "instType": "FUTURES",
        //            "mgnMode": "cross",
        //            "posSide": "long",
        //            "pos": "10",
        //            "ccy": "BTC",
        //            "posCcy": "",
        //            "avgPx": "3320",
        //            "uTIme": "1597026383085"
        //        }],
        //        "trades": [{
        //            "instId": "BTC-USD-191018",
        //            "tradeId": "2",
        //        }]
        //    }
        //
        const posData = this.safeList(liquidation, 'posData', []);
        const firstPosData = this.safeDict(posData, 0, {});
        const marketId = this.safeString(firstPosData, 'instId');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(firstPosData, 'uTIme');
        return this.safeLiquidation({
            'info': liquidation,
            'symbol': this.safeSymbol(marketId, market),
            'contracts': this.safeNumber(firstPosData, 'pos'),
            'contractSize': this.safeNumber(market, 'contractSize'),
            'price': this.safeNumber(liquidation, 'avgPx'),
            'baseValue': undefined,
            'quoteValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        });
    }
    parseWsLiquidation(liquidation, market = undefined) {
        //
        // public liquidation
        //    {
        //        "details": [
        //            {
        //                "bkLoss": "0",
        //                "bkPx": "0.007831",
        //                "ccy": "",
        //                "posSide": "short",
        //                "side": "buy",
        //                "sz": "13",
        //                "ts": "1692266434010"
        //            }
        //        ],
        //        "instFamily": "IOST-USDT",
        //        "instId": "IOST-USDT-SWAP",
        //        "instType": "SWAP",
        //        "uly": "IOST-USDT"
        //    }
        //
        const details = this.safeList(liquidation, 'details', []);
        const liquidationDetails = this.safeDict(details, 0, {});
        const marketId = this.safeString(liquidation, 'instId');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(liquidationDetails, 'ts');
        return this.safeLiquidation({
            'info': liquidation,
            'symbol': this.safeSymbol(marketId, market),
            'contracts': this.safeNumber(liquidationDetails, 'sz'),
            'contractSize': this.safeNumber(market, 'contractSize'),
            'price': this.safeNumber(liquidationDetails, 'bkPx'),
            'baseValue': undefined,
            'quoteValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        });
    }
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        symbol = this.symbol(symbol);
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const name = 'candle' + interval;
        const ohlcv = await this.subscribe('public', name, name, symbol, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    async watchOHLCVForSymbols(symbolsAndTimeframes, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#watchOHLCVForSymbols
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray(symbolsAndTimeframes[0])) {
            throw new errors.ArgumentsRequired(this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]");
        }
        await this.loadMarkets();
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const sym = symbolAndTimeframe[0];
            const tf = symbolAndTimeframe[1];
            const marketId = this.marketId(sym);
            const interval = this.safeString(this.timeframes, tf, tf);
            const channel = 'candle' + interval;
            const topic = {
                'channel': channel,
                'instId': marketId,
            };
            topics.push(topic);
            messageHashes.push('multi:' + channel + ':' + sym);
        }
        const request = {
            'op': 'subscribe',
            'args': topics,
        };
        const url = this.getUrl('candle', 'public');
        const [symbol, timeframe, candles] = await this.watchMultiple(url, messageHashes, request, messageHashes);
        if (this.newUpdates) {
            limit = candles.getLimit(symbol, limit);
        }
        const filtered = this.filterBySinceLimit(candles, since, limit, 0, true);
        return this.createOHLCVObject(symbol, timeframe, filtered);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "arg": { channel: "candle1m", instId: "BTC-USDT" },
        //         "data": [
        //             [
        //                 "1626690720000",
        //                 "31334",
        //                 "31334",
        //                 "31334",
        //                 "31334",
        //                 "0.0077",
        //                 "241.2718"
        //             ]
        //         ]
        //     }
        //
        const arg = this.safeValue(message, 'arg', {});
        const channel = this.safeString(arg, 'channel');
        const data = this.safeValue(message, 'data', []);
        const marketId = this.safeString(arg, 'instId');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const interval = channel.replace('candle', '');
        // use a reverse lookup in a static map instead
        const timeframe = this.findTimeframe(interval);
        for (let i = 0; i < data.length; i++) {
            const parsed = this.parseOHLCV(data[i], market);
            this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
            let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
                stored = new Cache.ArrayCacheByTimestamp(limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append(parsed);
            const messageHash = channel + ':' + market['id'];
            client.resolve(stored, messageHash);
            // for multiOHLCV we need special object, as opposed to other "multi"
            // methods, because OHLCV response item does not contain symbol
            // or timeframe, thus otherwise it would be unrecognizable
            const messageHashForMulti = 'multi:' + channel + ':' + symbol;
            client.resolve([symbol, timeframe, stored], messageHashForMulti);
        }
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#watchOrderBook
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-order-book-channel
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.depth] okx order book depth, can be books, books5, books-l2-tbt, books50-l2-tbt, bbo-tbt
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        //
        // bbo-tbt
        // 1. Newly added channel that sends tick-by-tick Level 1 data
        // 2. All API users can subscribe
        // 3. Public depth channel, verification not required
        //
        // books-l2-tbt
        // 1. Only users who're VIP5 and above can subscribe
        // 2. Identity verification required before subscription
        //
        // books50-l2-tbt
        // 1. Only users who're VIP4 and above can subscribe
        // 2. Identity verification required before subscription
        //
        // books
        // 1. All API users can subscribe
        // 2. Public depth channel, verification not required
        //
        // books5
        // 1. All API users can subscribe
        // 2. Public depth channel, verification not required
        // 3. Data feeds will be delivered every 100ms (vs. every 200ms now)
        //
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#watchOrderBookForSymbols
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-order-book-channel
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string[]} symbols unified array of symbols
         * @param {int} [limit] 1,5, 400, 50 (l2-tbt, vip4+) or 40000 (vip5+) the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.depth] okx order book depth, can be books, books5, books-l2-tbt, books50-l2-tbt, bbo-tbt
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        let depth = undefined;
        [depth, params] = this.handleOptionAndParams(params, 'watchOrderBook', 'depth', 'books');
        if (limit !== undefined) {
            if (limit === 1) {
                depth = 'bbo-tbt';
            }
            else if (limit > 1 && limit <= 5) {
                depth = 'books5';
            }
            else if (limit === 50) {
                depth = 'books50-l2-tbt'; // Make sure you have VIP4 and above
            }
            else if (limit === 400) {
                depth = 'books';
            }
        }
        if ((depth === 'books-l2-tbt') || (depth === 'books50-l2-tbt')) {
            if (!this.checkRequiredCredentials(false)) {
                throw new errors.AuthenticationError(this.id + ' watchOrderBook/watchOrderBookForSymbols requires authentication for this depth. Add credentials or change the depth option to books or books5');
            }
            await this.authenticate({ 'access': 'public' });
        }
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            messageHashes.push(depth + ':' + symbol);
            const marketId = this.marketId(symbol);
            const topic = {
                'channel': depth,
                'instId': marketId,
            };
            topics.push(topic);
        }
        const request = {
            'op': 'subscribe',
            'args': topics,
        };
        const url = this.getUrl(depth, 'public');
        const orderbook = await this.watchMultiple(url, messageHashes, request, messageHashes);
        return orderbook.limit();
    }
    handleDelta(bookside, delta) {
        //
        //     [
        //         "31685", // price
        //         "0.78069158", // amount
        //         "0", // liquidated orders
        //         "17" // orders
        //     ]
        //
        const price = this.safeFloat(delta, 0);
        const amount = this.safeFloat(delta, 1);
        bookside.store(price, amount);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    handleOrderBookMessage(client, message, orderbook, messageHash) {
        //
        //     {
        //         "asks": [
        //             [ '31738.3', '0.05973179', "0", "3" ],
        //             [ '31738.5', '0.11035404', "0", "2" ],
        //             [ '31739.6', '0.01', "0", "1" ],
        //         ],
        //         "bids": [
        //             [ '31738.2', '0.67557666', "0", "9" ],
        //             [ '31738', '0.02466947', "0", "2" ],
        //             [ '31736.3', '0.01705046', "0", "2" ],
        //         ],
        //         "instId": "BTC-USDT",
        //         "ts": "1626537446491"
        //     }
        //
        const asks = this.safeValue(message, 'asks', []);
        const bids = this.safeValue(message, 'bids', []);
        const storedAsks = orderbook['asks'];
        const storedBids = orderbook['bids'];
        this.handleDeltas(storedAsks, asks);
        this.handleDeltas(storedBids, bids);
        const marketId = this.safeString(message, 'instId');
        const symbol = this.safeSymbol(marketId);
        const checksum = this.safeBool(this.options, 'checksum', true);
        if (checksum) {
            const asksLength = storedAsks.length;
            const bidsLength = storedBids.length;
            const payloadArray = [];
            for (let i = 0; i < 25; i++) {
                if (i < bidsLength) {
                    payloadArray.push(this.numberToString(storedBids[i][0]));
                    payloadArray.push(this.numberToString(storedBids[i][1]));
                }
                if (i < asksLength) {
                    payloadArray.push(this.numberToString(storedAsks[i][0]));
                    payloadArray.push(this.numberToString(storedAsks[i][1]));
                }
            }
            const payload = payloadArray.join(':');
            const responseChecksum = this.safeInteger(message, 'checksum');
            const localChecksum = this.crc32(payload, true);
            if (responseChecksum !== localChecksum) {
                const error = new errors.InvalidNonce(this.id + ' invalid checksum');
                delete client.subscriptions[messageHash];
                delete this.orderbooks[symbol];
                client.reject(error, messageHash);
            }
        }
        const timestamp = this.safeInteger(message, 'ts');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        return orderbook;
    }
    handleOrderBook(client, message) {
        //
        // snapshot
        //
        //     {
        //         "arg": { channel: 'books-l2-tbt', instId: "BTC-USDT" },
        //         "action": "snapshot",
        //         "data": [
        //             {
        //                 "asks": [
        //                     [ '31685', '0.78069158', "0", "17" ],
        //                     [ '31685.1', '0.0001', "0", "1" ],
        //                     [ '31685.6', '0.04543165', "0", "1" ],
        //                 ],
        //                 "bids": [
        //                     [ '31684.9', '0.01', "0", "1" ],
        //                     [ '31682.9', '0.0001', "0", "1" ],
        //                     [ '31680.7', '0.01', "0", "1" ],
        //                 ],
        //                 "ts": "1626532416403",
        //                 "checksum": -1023440116
        //             }
        //         ]
        //     }
        //
        // update
        //
        //     {
        //         "arg": { channel: 'books-l2-tbt', instId: "BTC-USDT" },
        //         "action": "update",
        //         "data": [
        //             {
        //                 "asks": [
        //                     [ '31657.7', '0', "0", "0" ],
        //                     [ '31659.7', '0.01', "0", "1" ],
        //                     [ '31987.3', '0.01', "0", "1" ]
        //                 ],
        //                 "bids": [
        //                     [ '31642.9', '0.50296385', "0", "4" ],
        //                     [ '31639.9', '0', "0", "0" ],
        //                     [ '31638.7', '0.01', "0", "1" ],
        //                 ],
        //                 "ts": "1626535709008",
        //                 "checksum": 830931827
        //             }
        //         ]
        //     }
        //
        // books5
        //
        //     {
        //         "arg": { channel: "books5", instId: "BTC-USDT" },
        //         "data": [
        //             {
        //                 "asks": [
        //                     [ '31738.3', '0.05973179', "0", "3" ],
        //                     [ '31738.5', '0.11035404', "0", "2" ],
        //                     [ '31739.6', '0.01', "0", "1" ],
        //                 ],
        //                 "bids": [
        //                     [ '31738.2', '0.67557666', "0", "9" ],
        //                     [ '31738', '0.02466947', "0", "2" ],
        //                     [ '31736.3', '0.01705046', "0", "2" ],
        //                 ],
        //                 "instId": "BTC-USDT",
        //                 "ts": "1626537446491"
        //             }
        //         ]
        //     }
        //
        // bbo-tbt
        //
        //     {
        //         "arg":{
        //             "channel":"bbo-tbt",
        //             "instId":"BTC-USDT"
        //         },
        //         "data":[
        //             {
        //                 "asks":[["36232.2","1.8826134","0","17"]],
        //                 "bids":[["36232.1","0.00572212","0","2"]],
        //                 "ts":"1651826598363"
        //             }
        //         ]
        //     }
        //
        const arg = this.safeDict(message, 'arg', {});
        const channel = this.safeString(arg, 'channel');
        const action = this.safeString(message, 'action');
        const data = this.safeList(message, 'data', []);
        const marketId = this.safeString(arg, 'instId');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const depths = {
            'bbo-tbt': 1,
            'books': 400,
            'books5': 5,
            'books-l2-tbt': 400,
            'books50-l2-tbt': 50,
        };
        const limit = this.safeInteger(depths, channel);
        const messageHash = channel + ':' + symbol;
        if (action === 'snapshot') {
            for (let i = 0; i < data.length; i++) {
                const update = data[i];
                const orderbook = this.orderBook({}, limit);
                this.orderbooks[symbol] = orderbook;
                orderbook['symbol'] = symbol;
                this.handleOrderBookMessage(client, update, orderbook, messageHash);
                client.resolve(orderbook, messageHash);
            }
        }
        else if (action === 'update') {
            if (symbol in this.orderbooks) {
                const orderbook = this.orderbooks[symbol];
                for (let i = 0; i < data.length; i++) {
                    const update = data[i];
                    this.handleOrderBookMessage(client, update, orderbook, messageHash);
                    client.resolve(orderbook, messageHash);
                }
            }
        }
        else if ((channel === 'books5') || (channel === 'bbo-tbt')) {
            if (!(symbol in this.orderbooks)) {
                this.orderbooks[symbol] = this.orderBook({}, limit);
            }
            const orderbook = this.orderbooks[symbol];
            for (let i = 0; i < data.length; i++) {
                const update = data[i];
                const timestamp = this.safeInteger(update, 'ts');
                const snapshot = this.parseOrderBook(update, symbol, timestamp, 'bids', 'asks', 0, 1);
                orderbook.reset(snapshot);
                client.resolve(orderbook, messageHash);
            }
        }
        return message;
    }
    async authenticate(params = {}) {
        this.checkRequiredCredentials();
        const access = this.safeString(params, 'access', 'private');
        params = this.omit(params, ['access']);
        const url = this.getUrl('users', access);
        const messageHash = 'authenticated';
        const client = this.client(url);
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const timestamp = this.seconds().toString();
            const method = 'GET';
            const path = '/users/self/verify';
            const auth = timestamp + method + path;
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256, 'base64');
            const operation = 'login';
            const request = {
                'op': operation,
                'args': [
                    {
                        'apiKey': this.apiKey,
                        'passphrase': this.password,
                        'timestamp': timestamp,
                        'sign': signature,
                    },
                ],
            };
            const message = this.extend(request, params);
            this.watch(url, messageHash, message, messageHash);
        }
        return await future;
    }
    async watchBalance(params = {}) {
        /**
         * @method
         * @name okx#watchBalance
         * @description watch balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets();
        await this.authenticate();
        return await this.subscribe('private', 'account', 'account', undefined, params);
    }
    handleBalanceAndPosition(client, message) {
        this.handleMyLiquidation(client, message);
    }
    handleBalance(client, message) {
        //
        //     {
        //         "arg": { channel: "account" },
        //         "data": [
        //             {
        //                 "adjEq": '',
        //                 "details": [
        //                     {
        //                         "availBal": '',
        //                         "availEq": "8.21009913",
        //                         "cashBal": "8.21009913",
        //                         "ccy": "USDT",
        //                         "coinUsdPrice": "0.99994",
        //                         "crossLiab": '',
        //                         "disEq": "8.2096065240522",
        //                         "eq": "8.21009913",
        //                         "eqUsd": "8.2096065240522",
        //                         "frozenBal": "0",
        //                         "interest": '',
        //                         "isoEq": "0",
        //                         "isoLiab": '',
        //                         "liab": '',
        //                         "maxLoan": '',
        //                         "mgnRatio": '',
        //                         "notionalLever": "0",
        //                         "ordFrozen": "0",
        //                         "twap": "0",
        //                         "uTime": "1621927314996",
        //                         "upl": "0"
        //                     },
        //                 ],
        //                 "imr": '',
        //                 "isoEq": "0",
        //                 "mgnRatio": '',
        //                 "mmr": '',
        //                 "notionalUsd": '',
        //                 "ordFroz": '',
        //                 "totalEq": "22.1930992296832",
        //                 "uTime": "1626692120916"
        //             }
        //         ]
        //     }
        //
        const arg = this.safeValue(message, 'arg', {});
        const channel = this.safeString(arg, 'channel');
        const type = 'spot';
        const balance = this.parseTradingBalance(message);
        const oldBalance = this.safeValue(this.balance, type, {});
        const newBalance = this.deepExtend(oldBalance, balance);
        this.balance[type] = this.safeBalance(newBalance);
        client.resolve(this.balance[type], channel);
    }
    orderToTrade(order, market = undefined) {
        const info = this.safeValue(order, 'info', {});
        const timestamp = this.safeInteger(info, 'fillTime');
        const feeMarketId = this.safeString(info, 'fillFeeCcy');
        const isTaker = this.safeString(info, 'execType', '') === 'T';
        return this.safeTrade({
            'info': info,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': this.safeString(order, 'symbol'),
            'id': this.safeString(info, 'tradeId'),
            'order': this.safeString(order, 'id'),
            'type': this.safeString(order, 'type'),
            'takerOrMaker': (isTaker) ? 'taker' : 'maker',
            'side': this.safeString(order, 'side'),
            'price': this.safeNumber(info, 'fillPx'),
            'amount': this.safeNumber(info, 'fillSz'),
            'cost': this.safeNumber(order, 'cost'),
            'fee': {
                'cost': this.safeNumber(info, 'fillFee'),
                'currency': this.safeCurrencyCode(feeMarketId),
            },
        }, market);
    }
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-order-channel
         * @param {string} [symbol] unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.stop] true if fetching trigger or conditional trades
         * @param {string} [params.type] 'spot', 'swap', 'future', 'option', 'ANY', 'SPOT', 'MARGIN', 'SWAP', 'FUTURES' or 'OPTION'
         * @param {string} [params.marginMode] 'cross' or 'isolated', for automatically setting the type to spot margin
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure
         */
        // By default, receive order updates from any instrument type
        let type = undefined;
        [type, params] = this.handleOptionAndParams(params, 'watchMyTrades', 'type', 'ANY');
        const isStop = this.safeBool(params, 'stop', false);
        params = this.omit(params, ['stop']);
        await this.loadMarkets();
        await this.authenticate({ 'access': isStop ? 'business' : 'private' });
        const channel = isStop ? 'orders-algo' : 'orders';
        let messageHash = channel + '::myTrades';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            type = market['type'];
            messageHash = messageHash + '::' + symbol;
        }
        if (type === 'future') {
            type = 'futures';
        }
        let uppercaseType = type.toUpperCase();
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('watchMyTrades', params);
        if (uppercaseType === 'SPOT') {
            if (marginMode !== undefined) {
                uppercaseType = 'MARGIN';
            }
        }
        const request = {
            'instType': uppercaseType,
        };
        const orders = await this.subscribe('private', messageHash, channel, undefined, this.extend(request, params));
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#watchPositions
         * @see https://www.okx.com/docs-v5/en/#trading-account-websocket-positions-channel
         * @description watch all open positions
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets();
        await this.authenticate(params);
        symbols = this.marketSymbols(symbols);
        const request = {
            'instType': 'ANY',
        };
        const channel = 'positions';
        let newPositions = undefined;
        if (symbols === undefined) {
            const arg = {
                'channel': 'positions',
                'instType': 'ANY',
            };
            const args = [arg];
            const nonSymbolRequest = {
                'op': 'subscribe',
                'args': args,
            };
            const url = this.getUrl(channel, 'private');
            newPositions = await this.watch(url, channel, nonSymbolRequest, channel);
        }
        else {
            newPositions = await this.subscribeMultiple('private', channel, symbols, this.extend(request, params));
        }
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(this.positions, symbols, since, limit, true);
    }
    handlePositions(client, message) {
        //
        //    {
        //        arg: {
        //            channel: 'positions',
        //            instType: 'ANY',
        //            instId: 'XRP-USDT-SWAP',
        //            uid: '464737184507959869'
        //        },
        //        data: [{
        //            adl: '1',
        //            availPos: '',
        //            avgPx: '0.52668',
        //            baseBal: '',
        //            baseBorrowed: '',
        //            baseInterest: '',
        //            bizRefId: '',
        //            bizRefType: '',
        //            cTime: '1693151444408',
        //            ccy: 'USDT',
        //            closeOrderAlgo: [],
        //            deltaBS: '',
        //            deltaPA: '',
        //            gammaBS: '',
        //            gammaPA: '',
        //            idxPx: '0.52683',
        //            imr: '17.564000000000004',
        //            instId: 'XRP-USDT-SWAP',
        //            instType: 'SWAP',
        //            interest: '',
        //            last: '0.52691',
        //            lever: '3',
        //            liab: '',
        //            liabCcy: '',
        //            liqPx: '0.3287514731020614',
        //            margin: '',
        //            markPx: '0.52692',
        //            mgnMode: 'cross',
        //            mgnRatio: '69.00363001456147',
        //            mmr: '0.26346',
        //            notionalUsd: '52.68620388000001',
        //            optVal: '',
        //            pTime: '1693151906023',
        //            pendingCloseOrdLiabVal: '',
        //            pos: '1',
        //            posCcy: '',
        //            posId: '616057041198907393',
        //            posSide: 'net',
        //            quoteBal: '',
        //            quoteBorrowed: '',
        //            quoteInterest: '',
        //            spotInUseAmt: '',
        //            spotInUseCcy: '',
        //            thetaBS: '',
        //            thetaPA: '',
        //            tradeId: '138745402',
        //            uTime: '1693151444408',
        //            upl: '0.0240000000000018',
        //            uplLastPx: '0.0229999999999952',
        //            uplRatio: '0.0013670539986328',
        //            uplRatioLastPx: '0.001310093415356',
        //            usdPx: '',
        //            vegaBS: '',
        //            vegaPA: ''
        //        }]
        //    }
        //
        const arg = this.safeValue(message, 'arg', {});
        const channel = this.safeString(arg, 'channel', '');
        const data = this.safeValue(message, 'data', []);
        if (this.positions === undefined) {
            this.positions = new Cache.ArrayCacheBySymbolBySide();
        }
        const cache = this.positions;
        const newPositions = [];
        for (let i = 0; i < data.length; i++) {
            const rawPosition = data[i];
            const position = this.parsePosition(rawPosition);
            newPositions.push(position);
            cache.append(position);
        }
        const messageHashes = this.findMessageHashes(client, channel + '::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split(',');
            const positions = this.filterByArray(newPositions, 'symbol', symbols, false);
            if (!this.isEmpty(positions)) {
                client.resolve(positions, messageHash);
            }
        }
        client.resolve(newPositions, channel);
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-order-channel
         * @param {string} [symbol] unified market symbol of the market the orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.stop] true if fetching trigger or conditional orders
         * @param {string} [params.type] 'spot', 'swap', 'future', 'option', 'ANY', 'SPOT', 'MARGIN', 'SWAP', 'FUTURES' or 'OPTION'
         * @param {string} [params.marginMode] 'cross' or 'isolated', for automatically setting the type to spot margin
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        let type = undefined;
        // By default, receive order updates from any instrument type
        [type, params] = this.handleOptionAndParams(params, 'watchOrders', 'type', 'ANY');
        const isStop = this.safeValue2(params, 'stop', 'trigger', false);
        params = this.omit(params, ['stop', 'trigger']);
        await this.loadMarkets();
        await this.authenticate({ 'access': isStop ? 'business' : 'private' });
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            type = market['type'];
        }
        if (type === 'future') {
            type = 'futures';
        }
        let uppercaseType = type.toUpperCase();
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('watchOrders', params);
        if (uppercaseType === 'SPOT') {
            if (marginMode !== undefined) {
                uppercaseType = 'MARGIN';
            }
        }
        const request = {
            'instType': uppercaseType,
        };
        const channel = isStop ? 'orders-algo' : 'orders';
        const orders = await this.subscribe('private', channel, channel, symbol, this.extend(request, params));
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrders(client, message, subscription = undefined) {
        //
        //     {
        //         "arg":{
        //             "channel":"orders",
        //             "instType":"SPOT"
        //         },
        //         "data":[
        //             {
        //                 "accFillSz":"0",
        //                 "amendResult":"",
        //                 "avgPx":"",
        //                 "cTime":"1634548275191",
        //                 "category":"normal",
        //                 "ccy":"",
        //                 "clOrdId":"e847386590ce4dBC330547db94a08ba0",
        //                 "code":"0",
        //                 "execType":"",
        //                 "fee":"0",
        //                 "feeCcy":"USDT",
        //                 "fillFee":"0",
        //                 "fillFeeCcy":"",
        //                 "fillNotionalUsd":"",
        //                 "fillPx":"",
        //                 "fillSz":"0",
        //                 "fillTime":"",
        //                 "instId":"ETH-USDT",
        //                 "instType":"SPOT",
        //                 "lever":"",
        //                 "msg":"",
        //                 "notionalUsd":"451.4516256",
        //                 "ordId":"370257534141235201",
        //                 "ordType":"limit",
        //                 "pnl":"0",
        //                 "posSide":"",
        //                 "px":"60000",
        //                 "rebate":"0",
        //                 "rebateCcy":"ETH",
        //                 "reqId":"",
        //                 "side":"sell",
        //                 "slOrdPx":"",
        //                 "slTriggerPx":"",
        //                 "state":"live",
        //                 "sz":"0.007526",
        //                 "tag":"",
        //                 "tdMode":"cash",
        //                 "tgtCcy":"",
        //                 "tpOrdPx":"",
        //                 "tpTriggerPx":"",
        //                 "tradeId":"",
        //                 "uTime":"1634548275191"
        //             }
        //         ]
        //     }
        //
        this.handleMyTrades(client, message);
        const arg = this.safeValue(message, 'arg', {});
        const channel = this.safeString(arg, 'channel');
        const orders = this.safeValue(message, 'data', []);
        const ordersLength = orders.length;
        if (ordersLength > 0) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            if (this.orders === undefined) {
                this.orders = new Cache.ArrayCacheBySymbolById(limit);
                this.triggerOrders = new Cache.ArrayCacheBySymbolById(limit);
            }
            const stored = (channel === 'orders-algo') ? this.triggerOrders : this.orders;
            const marketIds = [];
            const parsed = this.parseOrders(orders);
            for (let i = 0; i < parsed.length; i++) {
                const order = parsed[i];
                stored.append(order);
                const symbol = order['symbol'];
                const market = this.market(symbol);
                marketIds.push(market['id']);
            }
            client.resolve(stored, channel);
            for (let i = 0; i < marketIds.length; i++) {
                const messageHash = channel + ':' + marketIds[i];
                client.resolve(stored, messageHash);
            }
        }
    }
    handleMyTrades(client, message) {
        //
        //     {
        //         "arg":{
        //             "channel":"orders",
        //             "instType":"SPOT"
        //         },
        //         "data":[
        //             {
        //                 "accFillSz":"0",
        //                 "amendResult":"",
        //                 "avgPx":"",
        //                 "cTime":"1634548275191",
        //                 "category":"normal",
        //                 "ccy":"",
        //                 "clOrdId":"e847386590ce4dBC330547db94a08ba0",
        //                 "code":"0",
        //                 "execType":"",
        //                 "fee":"0",
        //                 "feeCcy":"USDT",
        //                 "fillFee":"0",
        //                 "fillFeeCcy":"",
        //                 "fillNotionalUsd":"",
        //                 "fillPx":"",
        //                 "fillSz":"0",
        //                 "fillTime":"",
        //                 "instId":"ETH-USDT",
        //                 "instType":"SPOT",
        //                 "lever":"",
        //                 "msg":"",
        //                 "notionalUsd":"451.4516256",
        //                 "ordId":"370257534141235201",
        //                 "ordType":"limit",
        //                 "pnl":"0",
        //                 "posSide":"",
        //                 "px":"60000",
        //                 "rebate":"0",
        //                 "rebateCcy":"ETH",
        //                 "reqId":"",
        //                 "side":"sell",
        //                 "slOrdPx":"",
        //                 "slTriggerPx":"",
        //                 "state":"live",
        //                 "sz":"0.007526",
        //                 "tag":"",
        //                 "tdMode":"cash",
        //                 "tgtCcy":"",
        //                 "tpOrdPx":"",
        //                 "tpTriggerPx":"",
        //                 "tradeId":"",
        //                 "uTime":"1634548275191"
        //             }
        //         ]
        //     }
        //
        const arg = this.safeValue(message, 'arg', {});
        const channel = this.safeString(arg, 'channel');
        const rawOrders = this.safeValue(message, 'data', []);
        const filteredOrders = [];
        // filter orders with no last trade id
        for (let i = 0; i < rawOrders.length; i++) {
            const rawOrder = rawOrders[i];
            const tradeId = this.safeString(rawOrder, 'tradeId', '');
            if (tradeId.length > 0) {
                const order = this.parseOrder(rawOrder);
                filteredOrders.push(order);
            }
        }
        const tradesLength = filteredOrders.length;
        if (tradesLength === 0) {
            return;
        }
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
        }
        const myTrades = this.myTrades;
        const symbols = {};
        for (let i = 0; i < filteredOrders.length; i++) {
            const rawTrade = filteredOrders[i];
            const trade = this.orderToTrade(rawTrade);
            myTrades.append(trade);
            const symbol = trade['symbol'];
            symbols[symbol] = true;
        }
        const messageHash = channel + '::myTrades';
        client.resolve(this.myTrades, messageHash);
        const tradeSymbols = Object.keys(symbols);
        for (let i = 0; i < tradeSymbols.length; i++) {
            const symbolMessageHash = messageHash + '::' + tradeSymbols[i];
            client.resolve(this.orders, symbolMessageHash);
        }
    }
    async createOrderWs(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name okx#createOrderWs
         * @see https://www.okx.com/docs-v5/en/#websocket-api-trade-place-order
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} params.test test order, default false
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        await this.authenticate();
        const url = this.getUrl('private', 'private');
        const messageHash = this.nonce().toString();
        let op = undefined;
        [op, params] = this.handleOptionAndParams(params, 'createOrderWs', 'op', 'batch-orders');
        const args = this.createOrderRequest(symbol, type, side, amount, price, params);
        const ordType = this.safeString(args, 'ordType');
        if ((ordType === 'trigger') || (ordType === 'conditional') || (type === 'oco') || (type === 'move_order_stop') || (type === 'iceberg') || (type === 'twap')) {
            throw new errors.BadRequest(this.id + ' createOrderWs() does not support algo trading. this.options["createOrderWs"]["op"] must be either order or batch-order');
        }
        if ((op !== 'order') && (op !== 'batch-orders')) {
            throw new errors.BadRequest(this.id + ' createOrderWs() does not support algo trading. this.options["createOrderWs"]["op"] must be either order or privatePostTradeOrder or privatePostTradeOrderAlgo');
        }
        const request = {
            'id': messageHash,
            'op': op,
            'args': [args],
        };
        return await this.watch(url, messageHash, request, messageHash);
    }
    handlePlaceOrders(client, message) {
        //
        //  batch-orders/order/cancel-order
        //    {
        //        "id": "1689281055",
        //        "op": "batch-orders",
        //        "code": "0",
        //        "msg": '',
        //        "data": [{
        //            "tag": "e847386590ce4dBC",
        //            "ordId": "599823446566084608",
        //            "clOrdId": "e847386590ce4dBCb939511604f394b0",
        //            "sCode": "0",
        //            "sMsg": "Order successfully placed."
        //        },
        //        ...
        //        ]
        //    }
        //
        const messageHash = this.safeString(message, 'id');
        let args = this.safeValue(message, 'data', []);
        // filter out partial errors
        args = this.filterBy(args, 'sCode', '0');
        // if empty means request failed and handle error
        if (this.isEmpty(args)) {
            const method = this.safeString(message, 'op');
            const stringMsg = this.json(message);
            this.handleErrors(undefined, undefined, client.url, method, undefined, stringMsg, stringMsg, undefined, undefined);
        }
        const orders = this.parseOrders(args, undefined, undefined, undefined);
        const first = this.safeDict(orders, 0, {});
        client.resolve(first, messageHash);
    }
    async editOrderWs(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name okx#editOrderWs
         * @description edit a trade order
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-amend-order
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-amend-multiple-orders
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of the currency you want to trade in units of the base currency
         * @param {float|undefined} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        await this.authenticate();
        const url = this.getUrl('private', 'private');
        const messageHash = this.nonce().toString();
        let op = undefined;
        [op, params] = this.handleOptionAndParams(params, 'editOrderWs', 'op', 'amend-order');
        const args = this.editOrderRequest(id, symbol, type, side, amount, price, params);
        const request = {
            'id': messageHash,
            'op': op,
            'args': [args],
        };
        return await this.watch(url, messageHash, this.extend(request, params), messageHash);
    }
    async cancelOrderWs(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name okx#cancelOrderWs
         * @see https://okx-docs.github.io/apidocs/websocket_api/en/#cancel-order-trade
         * @description cancel multiple orders
         * @param {string} id order id
         * @param {string} symbol unified market symbol, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.clOrdId] client order id
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.BadRequest(this.id + ' cancelOrderWs() requires a symbol argument');
        }
        await this.loadMarkets();
        await this.authenticate();
        const url = this.getUrl('private', 'private');
        const messageHash = this.nonce().toString();
        const clientOrderId = this.safeString2(params, 'clOrdId', 'clientOrderId');
        params = this.omit(params, ['clientOrderId', 'clOrdId']);
        const arg = {
            'instId': this.marketId(symbol),
        };
        if (clientOrderId !== undefined) {
            arg['clOrdId'] = clientOrderId;
        }
        else {
            arg['ordId'] = id;
        }
        const request = {
            'id': messageHash,
            'op': 'cancel-order',
            'args': [this.extend(arg, params)],
        };
        return await this.watch(url, messageHash, request, messageHash);
    }
    async cancelOrdersWs(ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name okx#cancelOrdersWs
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-mass-cancel-order
         * @description cancel multiple orders
         * @param {string[]} ids order ids
         * @param {string} symbol unified market symbol, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const idsLength = ids.length;
        if (idsLength > 20) {
            throw new errors.BadRequest(this.id + ' cancelOrdersWs() accepts up to 20 ids at a time');
        }
        if (symbol === undefined) {
            throw new errors.BadRequest(this.id + ' cancelOrdersWs() requires a symbol argument');
        }
        await this.loadMarkets();
        await this.authenticate();
        const url = this.getUrl('private', 'private');
        const messageHash = this.nonce().toString();
        const args = [];
        for (let i = 0; i < idsLength; i++) {
            const arg = {
                'instId': this.marketId(symbol),
                'ordId': ids[i],
            };
            args.push(arg);
        }
        const request = {
            'id': messageHash,
            'op': 'batch-cancel-orders',
            'args': args,
        };
        return await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
    }
    async cancelAllOrdersWs(symbol = undefined, params = {}) {
        /**
         * @method
         * @name okx#cancelAllOrdersWs
         * @see https://docs.okx.com/websockets/#message-cancelAll
         * @description cancel all open orders of a type. Only applicable to Option in Portfolio Margin mode, and MMP privilege is required.
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.BadRequest(this.id + ' cancelAllOrdersWs() requires a symbol argument');
        }
        await this.loadMarkets();
        await this.authenticate();
        const market = this.market(symbol);
        if (market['type'] !== 'option') {
            throw new errors.BadRequest(this.id + 'cancelAllOrdersWs is only applicable to Option in Portfolio Margin mode, and MMP privilege is required.');
        }
        const url = this.getUrl('private', 'private');
        const messageHash = this.nonce().toString();
        const request = {
            'id': messageHash,
            'op': 'mass-cancel',
            'args': [this.extend({
                    'instType': 'OPTION',
                    'instFamily': market['id'],
                }, params)],
        };
        return await this.watch(url, messageHash, request, messageHash);
    }
    handleCancelAllOrders(client, message) {
        //
        //    {
        //        "id": "1512",
        //        "op": "mass-cancel",
        //        "data": [
        //            {
        //                "result": true
        //            }
        //        ],
        //        "code": "0",
        //        "msg": ""
        //    }
        //
        const messageHash = this.safeString(message, 'id');
        const data = this.safeValue(message, 'data', []);
        client.resolve(data, messageHash);
    }
    handleSubscriptionStatus(client, message) {
        //
        //     { event: 'subscribe', arg: { channel: "tickers", instId: "BTC-USDT" } }
        //
        // const channel = this.safeString (message, "channel");
        // client.subscriptions[channel] = message;
        return message;
    }
    handleAuthenticate(client, message) {
        //
        //     { event: "login", success: true }
        //
        const future = this.safeValue(client.futures, 'authenticated');
        future.resolve(true);
    }
    ping(client) {
        // okex does not support built-in ws protocol-level ping-pong
        // instead it requires custom text-based ping-pong
        return 'ping';
    }
    handlePong(client, message) {
        client.lastPong = this.milliseconds();
        return message;
    }
    handleErrorMessage(client, message) {
        //
        //     { event: 'error', msg: "Illegal request: {"op":"subscribe","args":["spot/ticker:BTC-USDT"]}", code: "60012" }
        //     { event: 'error", msg: "channel:ticker,instId:BTC-USDT doesn"t exist", code: "60018" }
        //
        const errorCode = this.safeString(message, 'code');
        try {
            if (errorCode && errorCode !== '0') {
                const feedback = this.id + ' ' + this.json(message);
                this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
                const messageString = this.safeValue(message, 'msg');
                if (messageString !== undefined) {
                    this.throwBroadlyMatchedException(this.exceptions['broad'], messageString, feedback);
                }
                throw new errors.ExchangeError(feedback);
            }
        }
        catch (e) {
            client.reject(e);
            return false;
        }
        return message;
    }
    handleMessage(client, message) {
        if (!this.handleErrorMessage(client, message)) {
            return;
        }
        //
        //     { event: 'subscribe', arg: { channel: "tickers", instId: "BTC-USDT" } }
        //     { event: 'login", msg: '", code: "0" }
        //
        //     {
        //         "arg": { channel: "tickers", instId: "BTC-USDT" },
        //         "data": [
        //             {
        //                 "instType": "SPOT",
        //                 "instId": "BTC-USDT",
        //                 "last": "31500.1",
        //                 "lastSz": "0.00001754",
        //                 "askPx": "31500.1",
        //                 "askSz": "0.00998144",
        //                 "bidPx": "31500",
        //                 "bidSz": "3.05652439",
        //                 "open24h": "31697",
        //                 "high24h": "32248",
        //                 "low24h": "31165.6",
        //                 "sodUtc0": "31385.5",
        //                 "sodUtc8": "32134.9",
        //                 "volCcy24h": "503403597.38138519",
        //                 "vol24h": "15937.10781721",
        //                 "ts": "1626526618762"
        //             }
        //         ]
        //     }
        //
        //     { event: 'error', msg: "Illegal request: {"op":"subscribe","args":["spot/ticker:BTC-USDT"]}", code: "60012" }
        //     { event: 'error", msg: "channel:ticker,instId:BTC-USDT doesn"t exist", code: "60018" }
        //     { event: 'error', msg: "Invalid OK_ACCESS_KEY", code: "60005" }
        //     {
        //         "event": "error",
        //         "msg": "Illegal request: {"op":"login","args":["de89b035-b233-44b2-9a13-0ccdd00bda0e","7KUcc8YzQhnxBE3K","1626691289","H57N99mBt5NvW8U19FITrPdOxycAERFMaapQWRqLaSE="]}",
        //         "code": "60012"
        //     }
        //
        //
        //
        if (message === 'pong') {
            this.handlePong(client, message);
            return;
        }
        // const table = this.safeString (message, 'table');
        // if (table === undefined) {
        const event = this.safeString2(message, 'event', 'op');
        if (event !== undefined) {
            const methods = {
                // 'info': this.handleSystemStatus,
                // 'book': 'handleOrderBook',
                'login': this.handleAuthenticate,
                'subscribe': this.handleSubscriptionStatus,
                'order': this.handlePlaceOrders,
                'batch-orders': this.handlePlaceOrders,
                'amend-order': this.handlePlaceOrders,
                'batch-amend-orders': this.handlePlaceOrders,
                'cancel-order': this.handlePlaceOrders,
                'mass-cancel': this.handleCancelAllOrders,
            };
            const method = this.safeValue(methods, event);
            if (method !== undefined) {
                method.call(this, client, message);
            }
        }
        else {
            const arg = this.safeValue(message, 'arg', {});
            const channel = this.safeString(arg, 'channel');
            const methods = {
                'bbo-tbt': this.handleOrderBook,
                'books': this.handleOrderBook,
                'books5': this.handleOrderBook,
                'books50-l2-tbt': this.handleOrderBook,
                'books-l2-tbt': this.handleOrderBook,
                'tickers': this.handleTicker,
                'positions': this.handlePositions,
                'index-tickers': this.handleTicker,
                'sprd-tickers': this.handleTicker,
                'block-tickers': this.handleTicker,
                'trades': this.handleTrades,
                'account': this.handleBalance,
                'funding-rate': this.handleFundingRate,
                // 'margin_account': this.handleBalance,
                'orders': this.handleOrders,
                'orders-algo': this.handleOrders,
                'liquidation-orders': this.handleLiquidation,
                'balance_and_position': this.handleBalanceAndPosition,
            };
            const method = this.safeValue(methods, channel);
            if (method === undefined) {
                if (channel.indexOf('candle') === 0) {
                    this.handleOHLCV(client, message);
                }
            }
            else {
                method.call(this, client, message);
            }
        }
    }
}

module.exports = okx;
