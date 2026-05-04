'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var kucoin$1 = require('../kucoin.js');
var errors = require('../base/errors.js');
var Precise = require('../base/Precise.js');
var Cache = require('../base/ws/Cache.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class kucoin extends kucoin$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'createOrderWs': false,
                'editOrderWs': false,
                'fetchOpenOrdersWs': false,
                'fetchOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
                'cancelAllOrdersWs': false,
                'watchBidsAsks': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchPosition': true,
                'watchPositions': false,
                'watchMyTrades': true,
                'watchTickers': true,
                'watchTicker': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBookForSymbols': true,
                'watchBalance': true,
                'watchOHLCV': true,
                'unWatchTicker': true,
                'unWatchOHLCV': true,
                'unWatchOrderBook': true,
                'unWatchTrades': true,
                'unWatchhTradesForSymbols': true,
            },
            'urls': {
                // only for pro (uta) accounts
                'api': {
                    'ws': {
                        'spot': 'wss://x-push-spot.kucoin.com',
                        'futures': 'wss://x-push-futures.kucoin.com',
                        'private': 'wss://wsapi-push.kucoin.com',
                    },
                },
            },
            'options': {
                'utaToken': undefined,
                'utaTokenLastUpdate': 0,
                'utaTokenRefreshInterval': 1000 * 60 * 60 * 24,
                'tradesLimit': 1000,
                'watchTicker': {
                    'spotMethod': '/market/snapshot', // '/market/ticker'
                },
                'watchOrderBook': {
                    'snapshotDelay': 5,
                    'snapshotMaxRetries': 3,
                    'utaDepth': 'increment',
                    'spotMethod': '/market/level2',
                    'contractMethod': '/contractMarket/level2', // '/contractMarket/level2Depth5' or '/contractMarket/level2Depth20'
                },
                'watchMyTrades': {
                    'spotMethod': '/spotMarket/tradeOrders', // or '/spot/tradeFills'
                },
                'watchBalance': {
                    'fetchBalanceSnapshot': true,
                    'awaitBalanceSnapshot': true, // whether to wait for the balance snapshot before providing updates
                },
                'watchPosition': {
                    'fetchPositionSnapshot': true,
                    'awaitPositionSnapshot': true, // whether to wait for the position snapshot before providing updates
                },
                'watchPositions': {
                    'fetchPositionsSnapshot': true,
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
            },
            'streaming': {
                // kucoin does not support built-in ws protocol-level ping-pong
                // instead it requires a custom json-based text ping-pong
                // https://docs.kucoin.com/#ping
                'ping': this.ping,
            },
        });
    }
    async negotiate(privateChannel, isFuturesMethod = false, params = {}) {
        let connectId = privateChannel ? 'private' : 'public';
        if (isFuturesMethod) {
            connectId += 'Futures';
        }
        const urls = this.safeDict(this.options, 'urls', {});
        let future = this.safeValue(urls, connectId);
        if (future !== undefined) {
            return await future;
        }
        // we store an awaitable to the url
        // so that multiple calls don't asynchronously
        // fetch different urls and overwrite each other
        urls[connectId] = this.spawn(this.negotiateHelper, privateChannel, connectId, params);
        this.options['urls'] = urls;
        future = urls[connectId];
        return await future;
    }
    async negotiateHelper(privateChannel, connectId, params = {}) {
        let response = undefined;
        try {
            if (connectId === 'private') {
                response = await this.privatePostBulletPrivate(params);
                //
                //     {
                //         "code": "200000",
                //         "data": {
                //             "instanceServers": [
                //                 {
                //                     "pingInterval":  50000,
                //                     "endpoint": "wss://push-private.kucoin.com/endpoint",
                //                     "protocol": "websocket",
                //                     "encrypt": true,
                //                     "pingTimeout": 10000
                //                 }
                //             ],
                //             "token": "2neAiuYvAU61ZDXANAGAsiL4-iAExhsBXZxftpOeh_55i3Ysy2q2LEsEWU64mdzUOPusi34M_wGoSf7iNyEWJ1UQy47YbpY4zVdzilNP-Bj3iXzrjjGlWtiYB9J6i9GjsxUuhPw3BlrzazF6ghq4Lzf7scStOz3KkxjwpsOBCH4=.WNQmhZQeUKIkh97KYgU0Lg=="
                //         }
                //     }
                //
            }
            else if (connectId === 'public') {
                response = await this.publicPostBulletPublic(params);
            }
            else if (connectId === 'privateFutures') {
                response = await this.futuresPrivatePostBulletPrivate(params);
            }
            else {
                response = await this.futuresPublicPostBulletPublic(params);
            }
            const data = this.safeDict(response, 'data', {});
            const instanceServers = this.safeList(data, 'instanceServers', []);
            const firstInstanceServer = this.safeDict(instanceServers, 0);
            const pingInterval = this.safeInteger(firstInstanceServer, 'pingInterval');
            const endpoint = this.safeString(firstInstanceServer, 'endpoint');
            const token = this.safeString(data, 'token');
            const result = endpoint + '?' + this.urlencode({
                'token': token,
                'privateChannel': privateChannel,
                'connectId': connectId,
            });
            const client = this.client(result);
            client.keepAlive = pingInterval;
            return result;
        }
        catch (e) {
            const future = this.safeValue(this.options['urls'], connectId);
            future.reject(e);
            delete this.options['urls'][connectId];
        }
        return undefined;
    }
    requestId() {
        this.lockId();
        const requestId = this.sum(this.safeInteger(this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        this.unlockId();
        return requestId;
    }
    async subscribe(url, messageHash, subscriptionHash, params = {}, subscription = undefined) {
        const requestId = this.requestId().toString();
        const request = {
            'id': requestId,
            'type': 'subscribe',
            'topic': subscriptionHash,
            'response': true,
        };
        const message = this.extend(request, params);
        const client = this.client(url);
        if (!(subscriptionHash in client.subscriptions)) {
            client.subscriptions[requestId] = subscriptionHash;
        }
        return await this.watch(url, messageHash, message, subscriptionHash, subscription);
    }
    async subscribePublicUta(messageHash, channel, symbol, params = {}, subscription = undefined) {
        const requestId = this.requestId().toString();
        const market = this.market(symbol);
        const urlType = market['contract'] ? 'futures' : 'spot';
        const tradeType = urlType.toUpperCase();
        let action = 'subscribe';
        if (subscription !== undefined) {
            const unsubscribe = this.safeBool(subscription, 'unsubscribe', false);
            action = unsubscribe ? 'unsubscribe' : action;
        }
        const request = {
            'id': requestId,
            'action': action,
            'channel': channel,
            'tradeType': tradeType,
            'symbol': market['id'],
        };
        const message = this.extend(request, params);
        const url = this.safeString(this.urls['api']['ws'], urlType);
        const client = this.client(url);
        if (!(messageHash in client.subscriptions)) {
            client.subscriptions[requestId] = messageHash;
        }
        return await this.watch(url, messageHash, message, messageHash, subscription);
    }
    async subscribePrivateUta(messageHashes, subscribeHash, channel, symbol = undefined, params = {}, subscription = undefined) {
        this.checkRequiredCredentials();
        const requestId = this.requestId().toString();
        let action = 'subscribe';
        if (subscription !== undefined) {
            const unsubscribe = this.safeBool(subscription, 'unsubscribe', false);
            action = unsubscribe ? 'unsubscribe' : action;
        }
        const request = {
            'id': requestId,
            'action': action,
            'channel': channel,
        };
        if (symbol !== undefined) {
            const market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        const message = this.extend(request, params);
        const url = await this.getUtaUrl();
        const client = this.client(url);
        if (!(subscribeHash in client.subscriptions)) {
            client.subscriptions[requestId] = subscribeHash;
        }
        return await this.watchMultiple(url, messageHashes, message, [subscribeHash], subscription);
    }
    async getUtaUrl() {
        const utaToken = await this.authenticateUta();
        return this.urls['api']['ws']['private'] + '?token=' + utaToken;
    }
    async authenticateUta() {
        this.checkRequiredCredentials();
        const utaToken = this.safeValue(this.options, 'utaToken');
        const lastUpdate = this.safeInteger(this.options, 'utaTokenLastUpdate', 0);
        let refreshInterval = 1000 * 60 * 60 * 24; // 24 hours
        refreshInterval = this.safeInteger(this.options, 'utaTokenRefreshInterval', refreshInterval);
        const now = this.milliseconds();
        const expired = (now - lastUpdate) >= refreshInterval;
        const messageHash = 'utaToken';
        const url = this.urls['api']['ws']['private'];
        const client = this.client(url);
        if ((utaToken === undefined) || expired) {
            if (messageHash in client.futures) {
                // wait the existing future if it's already being fetched by another call
                await client.future(messageHash);
            }
            else {
                // fetch new token and store the future to the .futures to prevent concurrent fetches
                client.future(messageHash);
                try {
                    const response = await this.privatePostBulletPrivate({ 'version': 'v2' });
                    const data = this.safeDict(response, 'data', {});
                    const utaTokenString = this.safeString(data, 'token');
                    this.options['utaTokenLastUpdate'] = now;
                    this.options['utaToken'] = utaTokenString;
                    client.resolve(utaTokenString, messageHash);
                }
                catch (e) {
                    this.options['utaToken'] = undefined;
                    client.reject(e, messageHash);
                }
            }
        }
        return this.safeString(this.options, 'utaToken');
    }
    async unSubscribe(url, messageHash, topic, subscriptionHash, params = {}, subscription = undefined) {
        return await this.unSubscribeMultiple(url, [messageHash], topic, [subscriptionHash], params, subscription);
    }
    async subscribeMultiple(url, messageHashes, topic, subscriptionHashes, params = {}, subscription = undefined) {
        const requestId = this.requestId().toString();
        const request = {
            'id': requestId,
            'type': 'subscribe',
            'topic': topic,
            'response': true,
        };
        const message = this.extend(request, params);
        const client = this.client(url);
        for (let i = 0; i < subscriptionHashes.length; i++) {
            const subscriptionHash = subscriptionHashes[i];
            if (!(subscriptionHash in client.subscriptions)) {
                client.subscriptions[requestId] = subscriptionHash;
            }
        }
        return await this.watchMultiple(url, messageHashes, message, subscriptionHashes, subscription);
    }
    async unSubscribeMultiple(url, messageHashes, topic, subscriptionHashes, params = {}, subscription = undefined) {
        const requestId = this.requestId().toString();
        const request = {
            'id': requestId,
            'type': 'unsubscribe',
            'topic': topic,
            'response': true,
        };
        const message = this.extend(request, params);
        if (subscription !== undefined) {
            subscription[requestId] = requestId;
        }
        const client = this.client(url);
        for (let i = 0; i < subscriptionHashes.length; i++) {
            const subscriptionHash = subscriptionHashes[i];
            if (!(subscriptionHash in client.subscriptions)) {
                client.subscriptions[requestId] = subscriptionHash;
            }
        }
        return await this.watchMultiple(url, messageHashes, message, subscriptionHashes, subscription);
    }
    /**
     * @method
     * @name kucoin#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.kucoin.com/docs-new/3470063w0
     * @see https://www.kucoin.com/docs-new/3470081w0
     * @see https://www.kucoin.com/docs-new/3470222w0
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        let messageHash = 'ticker:' + symbol;
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'watchTicker', 'uta', uta);
        if (uta) {
            messageHash = 'uta:' + messageHash;
            const channel = 'ticker';
            return await this.subscribePublicUta(messageHash, channel, symbol, params);
        }
        const isFuturesMethod = market['contract'];
        const url = await this.negotiate(false, isFuturesMethod);
        let method = '/market/snapshot';
        if (isFuturesMethod) {
            method = '/contractMarket/ticker';
        }
        else {
            [method, params] = this.handleOptionAndParams(params, 'watchTicker', 'spotMethod', method);
        }
        const topic = method + ':' + market['id'];
        return await this.subscribe(url, messageHash, topic, params);
    }
    /**
     * @method
     * @name kucoin#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.kucoin.com/docs-new/3470063w0
     * @see https://www.kucoin.com/docs-new/3470081w0
     * @see https://www.kucoin.com/docs-new/3470222w0
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const isFuturesMethod = market['contract'];
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'unWatchTicker', 'uta', uta);
        const subscription = {
            'symbols': [symbol],
            'topic': 'ticker',
            'unsubscribe': true,
        };
        let subMessageHash = 'ticker:' + symbol;
        if (uta) {
            subMessageHash = 'uta:' + subMessageHash;
            subscription['subMessageHashes'] = [subMessageHash];
            const utaMessageHash = 'unsubscribe:' + subMessageHash;
            subscription['messageHashes'] = [utaMessageHash];
            return await this.subscribePublicUta(utaMessageHash, 'ticker', symbol, params, subscription);
        }
        else {
            const url = await this.negotiate(false, isFuturesMethod);
            let method = '/market/snapshot';
            if (isFuturesMethod) {
                method = '/contractMarket/ticker';
            }
            else {
                [method, params] = this.handleOptionAndParams(params, 'watchTicker', 'spotMethod', method);
            }
            const topic = method + ':' + market['id'];
            const messageHash = 'unsubscribe:' + subMessageHash;
            // we have to add the topic to the messageHashes and subMessageHashes
            // because handleSubscriptionStatus needs them to remove the subscription from the client
            // without them subscription would never be removed and re-subscribe would fail because of duplicate subscriptionHash
            subscription['messageHashes'] = [messageHash, topic];
            subscription['subMessageHashes'] = [subMessageHash, topic];
            return await this.unSubscribe(url, messageHash, topic, subMessageHash, params, subscription);
        }
    }
    /**
     * @method
     * @name kucoin#watchTickers
     * @see https://www.kucoin.com/docs-new/3470063w0
     * @see https://www.kucoin.com/docs-new/3470064w0
     * @see https://www.kucoin.com/docs-new/3470081w0
     * @see https://www.kucoin.com/docs-new/3470222w0
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] *spot markets only* either '/market/snapshot' or '/market/ticker' default is '/market/ticker'
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, true, true);
        const firstMarket = this.getMarketFromSymbols(symbols);
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('watchTickers', firstMarket, params);
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'watchTickers', 'uta', uta);
        const isFuturesMethod = (marketType !== 'spot') && (marketType !== 'margin');
        if ((isFuturesMethod || uta) && symbols === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' watchTickers() requires a list of symbols for ' + marketType + ' markets and unified trading account (uta)');
        }
        const messageHash = 'tickers';
        let method = '/market/ticker';
        if (isFuturesMethod) {
            method = '/contractMarket/ticker';
        }
        else {
            [method, params] = this.handleOptionAndParams2(params, 'watchTickers', 'method', 'spotMethod', method);
        }
        const messageHashes = [];
        const topics = [];
        if (symbols !== undefined) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push('ticker:' + symbol);
                const market = this.market(symbol);
                topics.push(method + ':' + market['id']);
            }
        }
        const url = await this.negotiate(false, isFuturesMethod);
        let tickers = undefined;
        if (symbols === undefined) {
            const allTopic = method + ':all';
            tickers = await this.subscribe(url, messageHash, allTopic, params);
            if (this.newUpdates) {
                return tickers;
            }
        }
        else {
            const marketIds = this.marketIds(symbols);
            const symbolsTopic = method + ':' + marketIds.join(',');
            tickers = await this.subscribeMultiple(url, messageHashes, symbolsTopic, topics, params);
            if (this.newUpdates) {
                const newDict = {};
                newDict[tickers['symbol']] = tickers;
                return newDict;
            }
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    async subscribePublicMultipleUta(messageHashes, channel, symbols, params = {}, subscription = undefined) {
        const requestId = this.requestId().toString();
        const market = this.getMarketFromSymbols(symbols);
        const urlType = market['contract'] ? 'futures' : 'spot';
        const tradeType = urlType.toUpperCase();
        let action = 'subscribe';
        if (subscription !== undefined) {
            const unsubscribe = this.safeBool(subscription, 'unsubscribe', false);
            action = unsubscribe ? 'unsubscribe' : action;
        }
        const request = {
            'id': requestId,
            'action': action,
            'channel': channel,
            'tradeType': tradeType,
            'symbols': this.marketIds(symbols),
        };
        const message = this.extend(request, params);
        const url = this.safeString(this.urls['api']['ws'], urlType);
        const client = this.client(url);
        const messageHashWithSymbols = channel + ':' + symbols.join(',');
        if (!(messageHashWithSymbols in client.subscriptions)) {
            client.subscriptions[requestId] = messageHashWithSymbols;
        }
        return await this.watchMultiple(url, messageHashes, message, messageHashes, subscription);
    }
    async watchUtaTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true);
        const messageHash = 'uta:ticker';
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = this.safeString(symbols, i);
            const market = this.market(symbol);
            const subMessageHash = messageHash + ':' + market['symbol'];
            messageHashes.push(subMessageHash);
        }
        const tickers = await this.subscribePublicMultipleUta(messageHashes, 'ticker', symbols, params);
        if (this.newUpdates) {
            return tickers;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    handleTicker(client, message) {
        //
        // market/snapshot
        //
        // updates come in every 2 sec unless there
        // were no changes since the previous update
        //
        //     {
        //         "data": {
        //             "sequence": "1545896669291",
        //             "data": {
        //                 "trading": true,
        //                 "symbol": "KCS-BTC",
        //                 "buy": 0.00011,
        //                 "sell": 0.00012,
        //                 "sort": 100,
        //                 "volValue": 3.13851792584, // total
        //                 "baseCurrency": "KCS",
        //                 "market": "BTC",
        //                 "quoteCurrency": "BTC",
        //                 "symbolCode": "KCS-BTC",
        //                 "datetime": 1548388122031,
        //                 "high": 0.00013,
        //                 "vol": 27514.34842,
        //                 "low": 0.0001,
        //                 "changePrice": -1.0e-5,
        //                 "changeRate": -0.0769,
        //                 "lastTradedPrice": 0.00012,
        //                 "board": 0,
        //                 "mark": 0
        //             }
        //         },
        //         "subject": "trade.snapshot",
        //         "topic": "/market/snapshot:KCS-BTC",
        //         "type": "message"
        //     }
        //
        // market/ticker
        //
        //     {
        //         "type": "message",
        //         "topic": "/market/ticker:BTC-USDT",
        //         "subject": "trade.ticker",
        //         "data": {
        //             "bestAsk": "62163",
        //             "bestAskSize": "0.99011388",
        //             "bestBid": "62162.9",
        //             "bestBidSize": "0.04794181",
        //             "price": "62162.9",
        //             "sequence": "1621383371852",
        //             "size": "0.00832274",
        //             "time": 1634641987564
        //         }
        //     }
        //
        // futures
        //    {
        //     "subject": "ticker",
        //     "topic": "/contractMarket/ticker:XBTUSDM",
        //     "data": {
        //         "symbol": "XBTUSDM", //Market of the symbol
        //         "sequence": 45, //Sequence number which is used to judge the continuity of the pushed messages
        //         "side": "sell", //Transaction side of the last traded taker order
        //         "price": "3600.0", //Filled price
        //         "size": 16, //Filled quantity
        //         "tradeId": "5c9dcf4170744d6f5a3d32fb", //Order ID
        //         "bestBidSize": 795, //Best bid size
        //         "bestBidPrice": "3200.0", //Best bid
        //         "bestAskPrice": "3600.0", //Best ask size
        //         "bestAskSize": 284, //Best ask
        //         "ts": 1553846081210004941 //Filled time - nanosecond
        //     }
        //    }
        //
        const topic = this.safeString(message, 'topic');
        if (topic.indexOf('contractMarket') < 0) {
            let market = undefined;
            if (topic !== undefined) {
                const parts = topic.split(':');
                const first = this.safeString(parts, 1);
                let marketId = undefined;
                if (first === 'all') {
                    marketId = this.safeString(message, 'subject');
                }
                else {
                    marketId = first;
                }
                market = this.safeMarket(marketId, market, '-');
            }
            const data = this.safeDict(message, 'data', {});
            const rawTicker = this.safeDict(data, 'data', data);
            const ticker = this.parseSpotOrUtaTicker(rawTicker, market);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            const messageHash = 'ticker:' + symbol;
            client.resolve(ticker, messageHash);
            // watchTickers
            const allTickers = {};
            allTickers[symbol] = ticker;
            client.resolve(allTickers, 'tickers');
        }
        else {
            this.handleContractTicker(client, message);
        }
    }
    handleContractTicker(client, message) {
        //
        // ticker (v1)
        //
        //    {
        //     "subject": "ticker",
        //     "topic": "/contractMarket/ticker:XBTUSDM",
        //     "data": {
        //         "symbol": "XBTUSDM", //Market of the symbol
        //         "sequence": 45, //Sequence number which is used to judge the continuity of the pushed messages
        //         "side": "sell", //Transaction side of the last traded taker order
        //         "price": "3600.0", //Filled price
        //         "size": 16, //Filled quantity
        //         "tradeId": "5c9dcf4170744d6f5a3d32fb", //Order ID
        //         "bestBidSize": 795, //Best bid size
        //         "bestBidPrice": "3200.0", //Best bid
        //         "bestAskPrice": "3600.0", //Best ask size
        //         "bestAskSize": 284, //Best ask
        //         "ts": 1553846081210004941 //Filled time - nanosecond
        //     }
        //    }
        //
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 'symbol');
        const market = this.safeMarket(marketId, undefined, '-');
        const ticker = this.parseTicker(data, market);
        this.tickers[market['symbol']] = ticker;
        const messageHash = 'ticker:' + market['symbol'];
        client.resolve(ticker, messageHash);
    }
    handleUtaTicker(client, message) {
        //
        //     {
        //         "T": "ticker.SPOT",
        //         "P": "1774100940787520626",
        //         "d": {
        //             "A": "0.5972689",
        //             "B": "23.3114947",
        //             "E": 20310552932,
        //             "M": "1774100940780000000",
        //             "S": "SELL",
        //             "a": "2155.55",
        //             "b": "2155.54",
        //             "l": "2155.54",
        //             "q": "0.0001529",
        //             "s": "ETH-USDT"
        //         }
        //     }
        //
        const data = this.safeDict(message, 'd', {});
        const marketId = this.safeString(data, 's');
        const market = this.safeMarket(marketId);
        const ticker = this.parseWsUtaTicker(data, market);
        this.tickers[market['symbol']] = ticker;
        const messageHash = 'uta:ticker:' + market['symbol'];
        client.resolve(ticker, messageHash);
    }
    parseWsUtaTicker(ticker, market = undefined) {
        const symbol = this.safeString(market, 'symbol');
        market = this.safeMarket(symbol, market);
        const timestamp = this.safeIntegerProduct(ticker, 'M', 0.000001);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString(ticker, 'a'),
            'bidVolume': this.safeString(ticker, 'A'),
            'ask': this.safeString(ticker, 'b'),
            'askVolume': this.safeString(ticker, 'B'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeString(ticker, 'l'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'markPrice': undefined,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name kucoin#watchBidsAsks
     * @see https://www.kucoin.com/docs-new/3470067w0
     * @see https://www.kucoin.com/docs-new/3470080w0
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true, false);
        const firstMarket = this.getMarketFromSymbols(symbols);
        const isFuturesMethod = firstMarket['contract'];
        let channelName = '/spotMarket/level1:';
        if (isFuturesMethod) {
            channelName = '/contractMarket/tickerV2:';
        }
        const ticker = await this.watchMultiHelper('watchBidsAsks', channelName, symbols, params);
        if (this.newUpdates) {
            const tickers = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    async watchMultiHelper(methodName, channelName, symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true, false);
        const length = symbols.length;
        if (length > 100) {
            throw new errors.ArgumentsRequired(this.id + ' ' + methodName + '() accepts a maximum of 100 symbols');
        }
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            messageHashes.push('bidask@' + market['symbol']);
        }
        const url = await this.negotiate(false);
        const marketIds = this.marketIds(symbols);
        const joined = marketIds.join(',');
        const requestId = this.requestId().toString();
        const request = {
            'id': requestId,
            'type': 'subscribe',
            'topic': channelName + joined,
            'response': true,
        };
        const message = this.extend(request, params);
        return await this.watchMultiple(url, messageHashes, message, messageHashes);
    }
    handleBidAsk(client, message) {
        //
        // arrives one symbol dict
        //
        //     {
        //         topic: '/spotMarket/level1:ETH-USDT',
        //         type: 'message',
        //         data: {
        //             asks: [ '3347.42', '2.0778387' ],
        //             bids: [ '3347.41', '6.0411697' ],
        //             timestamp: 1712231142085
        //         },
        //         subject: 'level1'
        //     }
        //
        // futures
        // {
        //   "subject": "tickerV2",
        //   "topic": "/contractMarket/tickerV2:XBTUSDM",
        //   "data": {
        //     "symbol": "XBTUSDM", //Market of the symbol
        //     "bestBidSize": 795, // Best bid size
        //     "bestBidPrice": 3200.0, // Best bid
        //     "bestAskPrice": 3600.0, // Best ask
        //     "bestAskSize": 284, // Best ask size
        //     "ts": 1553846081210004941 // Filled time - nanosecond
        //   }
        // }
        //
        const parsedTicker = this.parseWsBidAsk(message);
        const symbol = parsedTicker['symbol'];
        this.bidsasks[symbol] = parsedTicker;
        const messageHash = 'bidask@' + symbol;
        client.resolve(parsedTicker, messageHash);
    }
    parseWsBidAsk(ticker, market = undefined) {
        const topic = this.safeString(ticker, 'topic');
        if (topic.indexOf('contractMarket') < 0) {
            const parts = topic.split(':');
            const marketId = parts[1];
            market = this.safeMarket(marketId, market);
            const symbol = this.safeString(market, 'symbol');
            const data = this.safeDict(ticker, 'data', {});
            const ask = this.safeList(data, 'asks', []);
            const bid = this.safeList(data, 'bids', []);
            const timestamp = this.safeInteger(data, 'timestamp');
            return this.safeTicker({
                'symbol': symbol,
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'ask': this.safeNumber(ask, 0),
                'askVolume': this.safeNumber(ask, 1),
                'bid': this.safeNumber(bid, 0),
                'bidVolume': this.safeNumber(bid, 1),
                'info': ticker,
            }, market);
        }
        else {
            // futures
            const data = this.safeDict(ticker, 'data', {});
            const marketId = this.safeString(data, 'symbol');
            market = this.safeMarket(marketId, market);
            const symbol = this.safeString(market, 'symbol');
            const timestamp = this.safeIntegerProduct(data, 'ts', 0.000001);
            return this.safeTicker({
                'symbol': symbol,
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'ask': this.safeNumber(data, 'bestAskPrice'),
                'askVolume': this.safeNumber(data, 'bestAskSize'),
                'bid': this.safeNumber(data, 'bestBidPrice'),
                'bidVolume': this.safeNumber(data, 'bestBidSize'),
                'info': ticker,
            }, market);
        }
    }
    /**
     * @method
     * @name kucoin#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.kucoin.com/docs-new/3470071w0
     * @see https://www.kucoin.com/docs-new/3470086w0
     * @see https://www.kucoin.com/docs-new/3470223w0
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const period = this.safeString(this.timeframes, timeframe, timeframe);
        let messageHash = 'candles:' + symbol + ':' + timeframe;
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'watchOHLCV', 'uta', uta);
        let ohlcv = undefined;
        if (uta) {
            const channel = 'kline';
            messageHash = 'uta:' + messageHash;
            const extendedParams = {
                'interval': period,
            };
            params = this.extend(extendedParams, params);
            ohlcv = await this.subscribePublicUta(messageHash, channel, symbol, this.extend(extendedParams, params));
        }
        else {
            const isFuturesMethod = market['contract'];
            const url = await this.negotiate(false, isFuturesMethod);
            let channelName = '/market/candles:';
            if (isFuturesMethod) {
                channelName = '/contractMarket/limitCandle:';
            }
            const topic = channelName + market['id'] + '_' + period;
            ohlcv = await this.subscribe(url, messageHash, topic, params);
        }
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    /**
     * @method
     * @name kucoin#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.kucoin.com/docs-new/3470071w0
     * @see https://www.kucoin.com/docs-new/3470086w0
     * @see https://www.kucoin.com/docs-new/3470223w0
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV(symbol, timeframe = '1m', params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'unWatchOHLCV', 'uta', uta);
        const period = this.safeString(this.timeframes, timeframe, timeframe);
        const symbolAndTimeframe = [symbol, timeframe];
        const subscription = {
            'symbols': [symbol],
            'symbolsAndTimeframes': [symbolAndTimeframe],
            'topic': 'ohlcv',
            'unsubscribe': true,
        };
        let subMessageHash = 'candles:' + symbol + ':' + timeframe;
        if (uta) {
            subMessageHash = 'uta:' + subMessageHash;
            subscription['subMessageHashes'] = [subMessageHash];
            const utaMessageHash = 'unsubscribe:' + subMessageHash;
            subscription['messageHashes'] = [utaMessageHash];
            const extendedParams = {
                'interval': period,
            };
            return await this.subscribePublicUta(utaMessageHash, 'kline', symbol, this.extend(extendedParams, params), subscription);
        }
        else {
            const isFuturesMethod = market['contract'];
            const url = await this.negotiate(false, isFuturesMethod);
            let channelName = '/market/candles:';
            if (isFuturesMethod) {
                channelName = '/contractMarket/limitCandle:';
            }
            const messageHash = 'unsubscribe:' + subMessageHash;
            const topic = channelName + market['id'] + '_' + period;
            // we have to add the topic to the messageHashes and subMessageHashes
            // because handleSubscriptionStatus needs them to remove the subscription from the client
            // without them subscription would never be removed and re-subscribe would fail because of duplicate subscriptionHash
            subscription['messageHashes'] = [messageHash, topic];
            subscription['subMessageHashes'] = [subMessageHash, topic];
            return await this.unSubscribe(url, messageHash, topic, messageHash, params, subscription);
        }
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "data": {
        //             "symbol": "BTC-USDT",
        //             "candles": [
        //                 "1624881240",
        //                 "34138.8",
        //                 "34121.6",
        //                 "34138.8",
        //                 "34097.9",
        //                 "3.06097133",
        //                 "104430.955068564"
        //             ],
        //             "time": 1624881284466023700
        //         },
        //         "subject": "trade.candles.update",
        //         "topic": "/market/candles:BTC-USDT_1min",
        //         "type": "message"
        //     }
        //
        // futures
        //    {
        //        "topic":"/contractMarket/limitCandle:LTCUSDTM_1min",
        //        "type":"message",
        //        "data":{
        //            "symbol":"LTCUSDTM",
        //            "candles":[
        //                "1715470980",
        //                "81.38",
        //                "81.38",
        //                "81.38",
        //                "81.38",
        //                "61.0", - Note value 5 is incorrect and will be fixed in subsequent versions of kucoin
        //                "61"
        //            ],
        //            "time":1715470994801
        //        },
        //        "subject":"candle.stick"
        //    }
        //
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 'symbol');
        const candles = this.safeList(data, 'candles', []);
        const topic = this.safeString(message, 'topic');
        const parts = topic.split('_');
        const interval = this.safeString(parts, 1);
        // use a reverse lookup in a static map instead
        const timeframe = this.findTimeframe(interval);
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const messageHash = 'candles:' + symbol + ':' + timeframe;
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const isContractMarket = (topic.indexOf('contractMarket') >= 0);
        const baseVolumeIndex = isContractMarket ? 6 : 5; // Note value 5 is incorrect and will be fixed in subsequent versions of kucoin
        const parsed = [
            this.safeTimestamp(candles, 0),
            this.safeNumber(candles, 1),
            this.safeNumber(candles, 3),
            this.safeNumber(candles, 4),
            this.safeNumber(candles, 2),
            this.safeNumber(candles, baseVolumeIndex),
        ];
        stored.append(parsed);
        client.resolve(stored, messageHash);
    }
    handleUtaOHLCV(client, message) {
        //
        //     {
        //         "T": "kline.SPOT",
        //         "P": "1774621652314890314",
        //         "d": {
        //             "a": "195333.419819132",
        //             "s": "ETH-USDT",
        //             "C": 1774621680,
        //             "c": "1973.4",
        //             "S": false,
        //             "v": "98.941095",
        //             "h": "1974.97",
        //             "i": "1min",
        //             "l": "1973.4",
        //             "O": 1774621620,
        //             "o": "1974.34"
        //         }
        //     }
        //
        const data = this.safeDict(message, 'd', {});
        const marketId = this.safeString(data, 's');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const interval = this.safeString(data, 'i');
        const timeframe = this.findTimeframe(interval);
        const messageHash = 'uta:candles:' + symbol + ':' + timeframe;
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const parsed = [
            this.safeIntegerProduct(data, 'O', 1000),
            this.safeNumber(data, 'o'),
            this.safeNumber(data, 'h'),
            this.safeNumber(data, 'l'),
            this.safeNumber(data, 'c'),
            this.safeNumber(data, 'v'),
        ];
        stored.append(parsed);
        client.resolve(stored, messageHash);
    }
    /**
     * @method
     * @name kucoin#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.kucoin.com/docs-new/3470072w0
     * @see https://www.kucoin.com/docs-new/3470084w0
     * @see https://www.kucoin.com/docs-new/3470224w0
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'watchTrades', 'uta', uta);
        if (uta) {
            await this.loadMarkets();
            const market = this.market(symbol);
            symbol = market['symbol'];
            const messageHash = 'uta:trades:' + symbol;
            const channel = 'trade';
            const trades = await this.subscribePublicUta(messageHash, channel, symbol, params);
            if (this.newUpdates) {
                const first = this.safeValue(trades, 0);
                const tradeSymbol = this.safeString(first, 'symbol');
                limit = trades.getLimit(tradeSymbol, limit);
            }
            return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
        }
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name kucoin#watchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.kucoin.com/docs-new/3470072w0
     * @see https://www.kucoin.com/docs-new/3470084w0
     * @param {string[]} symbols
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new errors.ArgumentsRequired(this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols(symbols);
        const isFuturesMethod = firstMarket['contract'];
        const marketIds = this.marketIds(symbols);
        const url = await this.negotiate(false, isFuturesMethod);
        const messageHashes = [];
        const subscriptionHashes = [];
        let channelName = '/market/match:';
        if (isFuturesMethod) {
            channelName = '/contractMarket/execution:';
        }
        const topic = channelName + marketIds.join(',');
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            messageHashes.push('trades:' + symbol);
            const marketId = marketIds[i];
            subscriptionHashes.push(channelName + marketId);
        }
        const trades = await this.subscribeMultiple(url, messageHashes, topic, subscriptionHashes, params);
        if (this.newUpdates) {
            const first = this.safeValue(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name kucoin#unWatchTradesForSymbols
     * @description unWatches trades stream
     * @see https://www.kucoin.com/docs-new/3470072w0
     * @see https://www.kucoin.com/docs-new/3470084w0
     * @param {string} symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async unWatchTradesForSymbols(symbols, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true);
        const marketIds = this.marketIds(symbols);
        const firstMarket = this.getMarketFromSymbols(symbols);
        const isFuturesMethod = firstMarket['contract'];
        const url = await this.negotiate(false, isFuturesMethod);
        const messageHashes = [];
        const subscriptionHashes = [];
        let channelName = '/market/match:';
        if (isFuturesMethod) {
            channelName = '/contractMarket/execution:';
        }
        const topic = channelName + marketIds.join(',');
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            messageHashes.push('unsubscribe:trades:' + symbol);
            subscriptionHashes.push('trades:' + symbol);
        }
        // we have to add the topic to the messageHashes and subMessageHashes
        // because handleSubscriptionStatus needs them to remove the subscription from the client
        // without them subscription would never be removed and re-subscribe would fail because of duplicate subscriptionHash
        messageHashes.push(topic);
        subscriptionHashes.push(topic);
        const subscription = {
            'messageHashes': messageHashes,
            'subMessageHashes': subscriptionHashes,
            'topic': 'trades',
            'unsubscribe': true,
            'symbols': symbols,
        };
        return await this.unSubscribeMultiple(url, messageHashes, topic, messageHashes, params, subscription);
    }
    /**
     * @method
     * @name kucoin#unWatchTrades
     * @description unWatches trades stream
     * @see https://www.kucoin.com/docs-new/3470072w0
     * @see https://www.kucoin.com/docs-new/3470084w0
     * @see https://www.kucoin.com/docs-new/3470224w0
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async unWatchTrades(symbol, params = {}) {
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'watchTrades', 'uta', uta);
        if (uta) {
            await this.loadMarkets();
            const market = this.market(symbol);
            symbol = market['symbol'];
            const subMessageHash = 'uta:trades:' + symbol;
            const messageHash = 'unsubscribe:' + subMessageHash;
            const channel = 'trade';
            const subscription = {
                'messageHashes': [messageHash],
                'subMessageHashes': [subMessageHash],
                'topic': 'trades',
                'unsubscribe': true,
                'symbols': [symbol],
            };
            return await this.subscribePublicUta(messageHash, channel, symbol, params, subscription);
        }
        return await this.unWatchTradesForSymbols([symbol], params);
    }
    handleTrade(client, message) {
        //
        //     {
        //         "data": {
        //             "sequence": "1568787654360",
        //             "symbol": "BTC-USDT",
        //             "side": "buy",
        //             "size": "0.00536577",
        //             "price": "9345",
        //             "takerOrderId": "5e356c4a9f1a790008f8d921",
        //             "time": "1580559434436443257",
        //             "type": "match",
        //             "makerOrderId": "5e356bffedf0010008fa5d7f",
        //             "tradeId": "5e356c4aeefabd62c62a1ece"
        //         },
        //         "subject": "trade.l3match",
        //         "topic": "/market/match:BTC-USDT",
        //         "type": "message"
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 'symbol');
        const market = this.safeMarket(marketId);
        const trade = this.parseTrade(data, market);
        const symbol = trade['symbol'];
        const messageHash = 'trades:' + symbol;
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            const stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const cache = this.trades[symbol];
        cache.append(trade);
        client.resolve(cache, messageHash);
    }
    handleUtaTrade(client, message) {
        //
        //     {
        //         "T": "trade.SPOT",
        //         "P": "1774618231151398133",
        //         "d": {
        //             "E": "20745928670070784",
        //             "M": "1774618231141000000",
        //             "S": "buy",
        //             "p": "1995.49",
        //             "q": "0.3142324",
        //             "s": "ETH-USDT",
        //             "ti": "20745928670070784"
        //         }
        //     }
        //
        const data = this.safeDict(message, 'd', {});
        const marketId = this.safeString(data, 'symbol');
        const market = this.safeMarket(marketId);
        const trade = this.parseWsUtaTrade(data, market);
        const symbol = trade['symbol'];
        const messageHash = 'uta:trades:' + symbol;
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            const stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const cache = this.trades[symbol];
        cache.append(trade);
        client.resolve(cache, messageHash);
    }
    parseWsUtaTrade(trade, market = undefined) {
        // trades
        //     {
        //         "E": "20745928670070784",
        //         "M": "1774618231141000000",
        //         "S": "buy",
        //         "p": "1995.49",
        //         "q": "0.3142324",
        //         "s": "ETH-USDT",
        //         "ti": "20745928670070784"
        //     }
        //
        // myTrades
        //     {
        //         "E": "1774977429843000000",
        //         "S": "SELL",
        //         "p": "0.09211",
        //         "q": "10",
        //         "s": "DOGE-USDT",
        //         "lR": "TAKER",
        //         "oT": "MARKET",
        //         "oi": "428507829452754944",
        //         "ti": 20801647764195330
        //     }
        //
        const marketId = this.safeString(trade, 's');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeIntegerProduct2(trade, 'M', 'E', 0.000001);
        let fee = undefined;
        const feeCost = this.safeString(trade, 'f');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString(trade, 'fC');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'ti'),
            'order': this.safeString(trade, 'oi'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': this.safeStringLower(trade, 'oT'),
            'side': this.safeStringLower(trade, 'S'),
            'takerOrMaker': this.safeStringLower(trade, 'lR'),
            'price': this.safeString(trade, 'p'),
            'amount': this.safeString(trade, 'q'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name kucoin#watchOrderBook
     * @see https://www.kucoin.com/docs-new/3470069w0 // spot level 5
     * @see https://www.kucoin.com/docs-new/3470070w0 // spot level 50
     * @see https://www.kucoin.com/docs-new/3470068w0 // spot incremental
     * @see https://www.kucoin.com/docs-new/3470083w0 // futures level 5
     * @see https://www.kucoin.com/docs-new/3470097w0 // futures level 50
     * @see https://www.kucoin.com/docs-new/3470082w0 // futures incremental
     * @see https://www.kucoin.com/docs-new/3470221w0 // uta
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @param {string} [params.method] either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        //
        // https://docs.kucoin.com/#level-2-market-data
        //
        // 1. After receiving the websocket Level 2 data flow, cache the data.
        // 2. Initiate a REST request to get the snapshot data of Level 2 order book.
        // 3. Playback the cached Level 2 data flow.
        // 4. Apply the new Level 2 data flow to the local snapshot to ensure that
        // the sequence of the new Level 2 update lines up with the sequence of
        // the previous Level 2 data. Discard all the message prior to that
        // sequence, and then playback the change to snapshot.
        // 5. Update the level2 full data based on sequence according to the
        // size. If the price is 0, ignore the messages and update the sequence.
        // If the size=0, update the sequence and remove the price of which the
        // size is 0 out of level 2. Fr other cases, please update the price.
        //
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'watchOrderBook', 'uta', uta);
        if (uta) {
            await this.loadMarkets();
            const market = this.market(symbol);
            symbol = market['symbol'];
            let depth = 'increment'; // '1', '5', '50' or 'increment'
            [depth, params] = this.handleOptionAndParams(params, 'watchOrderBook', 'utaDepth', depth);
            const messageHash = 'uta:orderbook:' + symbol + ':depth:' + depth;
            const channel = 'obu';
            let subscription = {};
            if ((depth === 'increment')) { // other streams return the entire orderbook, so we don't need to fetch the snapshot through REST
                subscription = {
                    'method': this.handleOrderBookSubscription,
                    'symbols': [symbol],
                    'limit': limit,
                };
            }
            params = this.extend(params, {
                'depth': depth,
            });
            const orderbook = await this.subscribePublicUta(messageHash, channel, symbol, params, subscription);
            return orderbook.limit();
        }
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    /**
     * @method
     * @name kucoin#unWatchOrderBook
     * @see https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level1-bbo-market-data
     * @see https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-market-data
     * @see https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-5-best-ask-bid-orders
     * @see https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-50-best-ask-bid-orders
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @param {string} [params.method] either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook(symbol, params = {}) {
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'unWatchOrderBook', 'uta', uta);
        if (uta) {
            await this.loadMarkets();
            const market = this.market(symbol);
            symbol = market['symbol'];
            let depth = 'increment'; // '1', '5', '50' or 'increment'
            [depth, params] = this.handleOptionAndParams(params, 'watchOrderBook', 'utaDepth', depth);
            params = this.extend(params, {
                'depth': depth,
            });
            const subMessageHash = 'uta:orderbook:' + symbol + ':depth:' + depth;
            const messageHash = 'unsubscribe:' + subMessageHash;
            const channel = 'obu';
            const subscription = {
                'messageHashes': [messageHash],
                'subMessageHashes': [subMessageHash],
                'topic': 'orderbook',
                'unsubscribe': true,
                'symbols': [symbol],
            };
            return await this.subscribePublicUta(messageHash, channel, symbol, params, subscription);
        }
        return await this.unWatchOrderBookForSymbols([symbol], params);
    }
    /**
     * @method
     * @name kucoin#watchOrderBookForSymbols
     * @see https://www.kucoin.com/docs-new/3470069w0 // spot level 5
     * @see https://www.kucoin.com/docs-new/3470070w0 // spot level 50
     * @see https://www.kucoin.com/docs-new/3470068w0 // spot incremental
     * @see https://www.kucoin.com/docs-new/3470083w0 // futures level 5
     * @see https://www.kucoin.com/docs-new/3470097w0 // futures level 50
     * @see https://www.kucoin.com/docs-new/3470082w0 // futures incremental
     * @see https://www.kucoin.com/docs-new/3470221w0 // uta
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new errors.ArgumentsRequired(this.id + ' watchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        if (limit !== undefined) {
            if ((limit !== 20) && (limit !== 100) && (limit !== 50) && (limit !== 5)) {
                throw new errors.ExchangeError(this.id + " watchOrderBook 'limit' argument must be undefined, 5, 20, 50 or 100");
            }
        }
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const marketIds = this.marketIds(symbols);
        const firstMarket = this.getMarketFromSymbols(symbols);
        const isFuturesMethod = firstMarket['contract'];
        const url = await this.negotiate(false, isFuturesMethod);
        let method = isFuturesMethod ? '/contractMarket/level2' : '/market/level2';
        const optionName = isFuturesMethod ? 'contractMethod' : 'spotMethod';
        [method, params] = this.handleOptionAndParams2(params, 'watchOrderBook', optionName, 'method', method);
        if (method.indexOf('Depth') === -1) {
            if ((limit === 5) || (limit === 50)) {
                if (!isFuturesMethod) {
                    method = '/spotMarket/level2';
                }
                method += 'Depth' + limit.toString();
            }
        }
        const topic = method + ':' + marketIds.join(',');
        const messageHashes = [];
        const subscriptionHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            messageHashes.push('orderbook:' + symbol);
            const marketId = marketIds[i];
            subscriptionHashes.push(method + ':' + marketId);
        }
        let subscription = {};
        if ((method === '/market/level2') || (method === '/contractMarket/level2')) { // other streams return the entire orderbook, so we don't need to fetch the snapshot through REST
            subscription = {
                'method': this.handleOrderBookSubscription,
                'symbols': symbols,
                'limit': limit,
            };
        }
        const orderbook = await this.subscribeMultiple(url, messageHashes, topic, subscriptionHashes, params, subscription);
        return orderbook.limit();
    }
    /**
     * @method
     * @name kucoin#unWatchOrderBookForSymbols
     * @see https://www.kucoin.com/docs-new/3470069w0 // spot level 5
     * @see https://www.kucoin.com/docs-new/3470070w0 // spot level 50
     * @see https://www.kucoin.com/docs-new/3470068w0 // spot incremental
     * @see https://www.kucoin.com/docs-new/3470083w0 // futures level 5
     * @see https://www.kucoin.com/docs-new/3470097w0 // futures level 50
     * @see https://www.kucoin.com/docs-new/3470082w0 // futures incremental
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' or '/contractMarket/level2' or '/contractMarket/level2Depth5' or '/contractMarket/level2Depth50' default is '/market/level2' for spot and '/contractMarket/level2' for futures
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBookForSymbols(symbols, params = {}) {
        const limit = this.safeInteger(params, 'limit');
        params = this.omit(params, 'limit');
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false, true);
        const marketIds = this.marketIds(symbols);
        const firstMarket = this.getMarketFromSymbols(symbols);
        const isFuturesMethod = firstMarket['contract'];
        const url = await this.negotiate(false, isFuturesMethod);
        let method = isFuturesMethod ? '/contractMarket/level2' : '/market/level2';
        const optionName = isFuturesMethod ? 'contractMethod' : 'spotMethod';
        [method, params] = this.handleOptionAndParams2(params, 'watchOrderBook', optionName, 'method', method);
        if (method.indexOf('Depth') === -1) {
            if ((limit === 5) || (limit === 50)) {
                if (!isFuturesMethod) {
                    method = '/spotMarket/level2';
                }
                method += 'Depth' + limit.toString();
            }
        }
        const topic = method + ':' + marketIds.join(',');
        const messageHashes = [];
        const subscriptionHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            messageHashes.push('unsubscribe:orderbook:' + symbol);
            subscriptionHashes.push('orderbook:' + symbol);
        }
        // we have to add the topic to the messageHashes and subMessageHashes
        // because handleSubscriptionStatus needs them to remove the subscription from the client
        // without them subscription would never be removed and re-subscribe would fail because of duplicate subscriptionHash
        messageHashes.push(topic);
        subscriptionHashes.push(topic);
        const subscription = {
            'messageHashes': messageHashes,
            'symbols': symbols,
            'unsubscribe': true,
            'topic': 'orderbook',
            'subMessageHashes': subscriptionHashes,
        };
        return await this.unSubscribeMultiple(url, messageHashes, topic, messageHashes, params, subscription);
    }
    handleOrderBook(client, message) {
        //
        // initial snapshot is fetched with ccxt's fetchOrderBook
        // the feed does not include a snapshot, just the deltas
        //
        //     {
        //         "type":"message",
        //         "topic":"/market/level2:BTC-USDT",
        //         "subject":"trade.l2update",
        //         "data":{
        //             "sequenceStart":1545896669105,
        //             "sequenceEnd":1545896669106,
        //             "symbol":"BTC-USDT",
        //             "changes": {
        //                 "asks": [["6","1","1545896669105"]], // price, size, sequence
        //                 "bids": [["4","1","1545896669106"]]
        //             }
        //         }
        //     }
        //
        //     {
        //         "topic": "/spotMarket/level2Depth5:BTC-USDT",
        //         "type": "message",
        //         "data": {
        //             "asks": [
        //                 [
        //                     "42815.6",
        //                     "1.24016245"
        //                 ]
        //             ],
        //             "bids": [
        //                 [
        //                     "42815.5",
        //                     "0.08652716"
        //                 ]
        //             ],
        //             "timestamp": 1707204474018
        //         },
        //         "subject": "level2"
        //     }
        //
        const data = this.safeDict(message, 'data');
        const topic = this.safeString(message, 'topic');
        const topicParts = topic.split(':');
        const topicSymbol = this.safeString(topicParts, 1);
        const topicChannel = this.safeString(topicParts, 0);
        const marketId = this.safeString(data, 'symbol', topicSymbol);
        const symbol = this.safeSymbol(marketId, undefined, '-');
        const messageHash = 'orderbook:' + symbol;
        // let orderbook = this.safeDict (this.orderbooks, symbol);
        if (topic.indexOf('Depth') >= 0) {
            if (!(symbol in this.orderbooks)) {
                this.orderbooks[symbol] = this.orderBook();
            }
            else {
                const orderbook = this.orderbooks[symbol];
                orderbook.reset();
            }
            this.orderbooks[symbol]['symbol'] = symbol;
        }
        else {
            if (!(symbol in this.orderbooks)) {
                this.orderbooks[symbol] = this.orderBook();
            }
            const orderbook = this.orderbooks[symbol];
            const nonce = this.safeInteger(orderbook, 'nonce');
            const deltaEnd = this.safeInteger2(data, 'sequenceEnd', 'timestamp');
            if (nonce === undefined) {
                const cacheLength = orderbook.cache.length;
                const subscriptions = Object.keys(client.subscriptions);
                let subscription = undefined;
                for (let i = 0; i < subscriptions.length; i++) {
                    const key = subscriptions[i];
                    if ((key.indexOf(topicSymbol) >= 0) && (key.indexOf(topicChannel) >= 0)) {
                        subscription = client.subscriptions[key];
                        break;
                    }
                }
                const limit = this.safeInteger(subscription, 'limit');
                const snapshotDelay = this.handleOption('watchOrderBook', 'snapshotDelay', 5);
                if (cacheLength === snapshotDelay) {
                    this.spawn(this.loadOrderBook, client, messageHash, symbol, limit, {});
                }
                orderbook.cache.push(data);
                return;
            }
            else if (nonce >= deltaEnd) {
                return;
            }
        }
        this.handleDelta(this.orderbooks[symbol], data);
        client.resolve(this.orderbooks[symbol], messageHash);
    }
    handleUtaOrderBook(client, message) {
        //
        // snapshot
        //     {
        //         "T": "obu.SPOT",
        //         "dp": "50",
        //         "t": "snapshot",
        //         "P": "1774624848680504909",
        //         "d": {
        //             "C": 20452522782,
        //             "M": "1774624848673000000",
        //             "O": 20452522782,
        //             "a": [ [ "66532.5", "0.46243848" ] ],
        //             "b": [ [ "66532.4", "0.09489" ] ],
        //             "s": "ETH-USDT"
        //         }
        //     }
        //
        const type = this.safeString(message, 't');
        const data = this.safeDict(message, 'd', {});
        const marketId = this.safeString(data, 's');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerProduct(data, 'M', 0.000001);
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook();
        }
        const orderbook = this.orderbooks[symbol];
        const depth = this.safeString(message, 'dp');
        const messageHash = 'uta:orderbook:' + symbol + ':depth:' + depth;
        if (type === 'snapshot') {
            const parsed = this.parseOrderBook(data, symbol, timestamp, 'b', 'a', 0, 1);
            parsed['nonce'] = this.safeInteger(data, 'O');
            orderbook.reset(parsed);
            this.orderbooks[symbol] = orderbook;
        }
        else {
            const nonce = this.safeInteger(orderbook, 'nonce');
            const deltaEnd = this.safeInteger(data, 'C');
            if (nonce === undefined) {
                const cacheLength = orderbook.cache.length;
                const subscription = this.safeValue(client.subscriptions, messageHash, {});
                const limit = this.safeInteger(subscription, 'limit');
                const snapshotDelay = this.handleOption('watchOrderBook', 'snapshotDelay', 5);
                const utaParams = {
                    'uta': true,
                };
                if (cacheLength === snapshotDelay) {
                    this.spawn(this.loadOrderBook, client, messageHash, symbol, limit, utaParams);
                }
                orderbook.cache.push(data);
                return;
            }
            else if (nonce >= deltaEnd) {
                return;
            }
        }
        this.handleDelta(this.orderbooks[symbol], data);
        client.resolve(this.orderbooks[symbol], messageHash);
    }
    getCacheIndex(orderbook, cache) {
        const firstDelta = this.safeValue(cache, 0);
        const nonce = this.safeInteger(orderbook, 'nonce');
        const firstDeltaStart = this.safeInteger2(firstDelta, 'sequenceStart', 'sequence');
        if (nonce < firstDeltaStart - 1) {
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            const deltaStart = this.safeInteger2(delta, 'sequenceStart', 'sequence');
            const deltaEnd = this.safeInteger2(delta, 'sequenceEnd', 'timestamp'); // todo check
            if ((nonce >= deltaStart - 1) && (nonce < deltaEnd)) {
                return i;
            }
        }
        return cache.length;
    }
    handleDelta(orderbook, delta) {
        let timestamp = this.safeIntegerProduct(delta, 'M', 0.000001);
        if (timestamp === undefined) {
            timestamp = this.safeInteger2(delta, 'time', 'timestamp');
        }
        orderbook['nonce'] = this.safeIntegerN(delta, ['sequenceEnd', 'sequence', 'C'], timestamp);
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        const change = this.safeString(delta, 'change');
        const changes = this.safeDict(delta, 'changes', delta);
        const storedBids = orderbook['bids'];
        const storedAsks = orderbook['asks'];
        if (change !== undefined) {
            // handling futures orderbook update
            const splitChange = change.split(',');
            const price = this.safeNumber(splitChange, 0);
            const side = this.safeString(splitChange, 1);
            const quantity = this.safeNumber(splitChange, 2);
            const type = (side === 'buy') ? 'bids' : 'asks';
            const value = [price, quantity];
            if (type === 'bids') {
                storedBids.storeArray(value);
            }
            else {
                storedAsks.storeArray(value);
            }
        }
        else if (changes !== undefined) {
            const bids = this.safeList(changes, 'bids', []);
            const asks = this.safeList(changes, 'asks', []);
            this.handleBidAsks(storedBids, bids);
            this.handleBidAsks(storedAsks, asks);
        }
        else {
            const bids = this.safeList2(delta, 'bids', 'b', []);
            const asks = this.safeList2(delta, 'asks', 'a', []);
            this.handleBidAsks(storedBids, bids);
            this.handleBidAsks(storedAsks, asks);
        }
    }
    handleBidAsks(bookSide, bidAsks) {
        for (let i = 0; i < bidAsks.length; i++) {
            const bidAsk = this.parseBidAsk(bidAsks[i]);
            bookSide.storeArray(bidAsk);
        }
    }
    handleOrderBookSubscription(client, message, subscription) {
        const limit = this.safeInteger(subscription, 'limit');
        const symbols = this.safeList(subscription, 'symbols');
        if (symbols === undefined) {
            const symbol = this.safeString(subscription, 'symbol');
            this.orderbooks[symbol] = this.orderBook({}, limit);
        }
        else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                this.orderbooks[symbol] = this.orderBook({}, limit);
            }
        }
        // moved snapshot initialization to handleOrderBook to fix
        // https://github.com/ccxt/ccxt/issues/6820
        // the general idea is to fetch the snapshot after the first delta
        // but not before, because otherwise we cannot synchronize the feed
    }
    handleSubscriptionStatus(client, message) {
        //
        // classic
        //     {
        //         "id": "1578090438322",
        //         "type": "ack"
        //     }
        //
        // uta
        //     {
        //         "id": "1",
        //         "result": true
        //     }
        //
        const id = this.safeString(message, 'id');
        if (!(id in client.subscriptions)) {
            return;
        }
        const subscriptionHash = this.safeString(client.subscriptions, id);
        const subscription = this.safeValue(client.subscriptions, subscriptionHash);
        delete client.subscriptions[id];
        const method = this.safeValue(subscription, 'method');
        if (method !== undefined) {
            method.call(this, client, message, subscription);
        }
        const isUnSub = this.safeBool(subscription, 'unsubscribe', false);
        if (isUnSub) {
            const messageHashes = this.safeList(subscription, 'messageHashes', []);
            const subMessageHashes = this.safeList(subscription, 'subMessageHashes', []);
            for (let i = 0; i < messageHashes.length; i++) {
                const messageHash = messageHashes[i];
                const subHash = subMessageHashes[i];
                this.cleanUnsubscription(client, subHash, messageHash);
            }
            this.cleanCache(subscription);
        }
    }
    handleSystemStatus(client, message) {
        //
        // todo: answer the question whether handleSystemStatus should be renamed
        // and unified as handleStatus for any usage pattern that
        // involves system status and maintenance updates
        //
        //     {
        //         "id": "1578090234088", // connectId
        //         "type": "welcome",
        //     }
        //
        // uta
        //     {
        //         "sessionId": "ddfb0cbd-f7a7-40c2-9129-445bbb830c54",
        //         "message": "welcome",
        //         "pingInterval": 18000
        //     }
        //
        const pingInterval = this.safeInteger(message, 'pingInterval');
        if (pingInterval !== undefined) {
            client.keepAlive = pingInterval;
        }
        return message;
    }
    /**
     * @method
     * @name kucoin#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.kucoin.com/docs-new/3470074w0 // spot regular orders
     * @see https://www.kucoin.com/docs-new/3470139w0 // spot trigger orders
     * @see https://www.kucoin.com/docs-new/3470090w0 // contract regular orders
     * @see https://www.kucoin.com/docs-new/3470091w0 // contract trigger orders
     * @see https://www.kucoin.com/docs-new/3470228w0 // uta orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta)
     * @param {boolean} [params.trigger] trigger orders are watched if true
     * @param {string} [params.type] 'spot' or 'swap' (default is 'spot' if symbol is not provided)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'watchOrders', 'uta', uta);
        let market = undefined;
        let messageHash = 'orders';
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        let orders = undefined;
        if (uta) {
            params = this.extend(params, {
                'tradeType': 'UNIFIED',
            });
            messageHash = 'uta:' + messageHash;
            let channel = 'order';
            if (symbol === undefined) {
                channel += 'All';
            }
            orders = await this.subscribePrivateUta([messageHash], messageHash, channel, symbol, params);
        }
        else {
            const trigger = this.safeBool2(params, 'stop', 'trigger');
            params = this.omit(params, ['stop', 'trigger']);
            let marketType = undefined;
            [marketType, params] = this.handleMarketTypeAndParams('watchOrders', market, params);
            const isFuturesMethod = ((marketType !== 'spot') && (marketType !== 'margin'));
            const url = await this.negotiate(true, isFuturesMethod);
            let topic = trigger ? '/spotMarket/advancedOrders' : '/spotMarket/tradeOrders';
            if (isFuturesMethod) {
                topic = trigger ? '/contractMarket/advancedOrders' : '/contractMarket/tradeOrders';
            }
            if (symbol === undefined) {
                const suffix = this.getOrdersMessageHashSuffix(topic);
                messageHash += suffix;
            }
            const request = {
                'privateChannel': true,
            };
            orders = await this.subscribe(url, messageHash, topic, this.extend(request, params));
        }
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    getOrdersMessageHashSuffix(topic) {
        let suffix = '-spot';
        if (topic === '/spotMarket/advancedOrders') {
            suffix += '-trigger';
        }
        else if (topic === '/contractMarket/tradeOrders') {
            suffix = '-contract';
        }
        else if (topic === '/contractMarket/advancedOrders') {
            suffix = '-contract-trigger';
        }
        return suffix;
    }
    parseWsOrderStatus(status) {
        const statuses = {
            'open': 'open',
            'filled': 'closed',
            'match': 'open',
            'update': 'open',
            'canceled': 'canceled',
            'cancel': 'canceled',
            'TRIGGERED': 'triggered',
        };
        return this.safeString(statuses, status, status);
    }
    parseWsOrder(order, market = undefined) {
        //
        // /spotMarket/tradeOrders
        //
        //    {
        //        "symbol": "XCAD-USDT",
        //        "orderType": "limit",
        //        "side": "buy",
        //        "orderId": "6249167327218b000135e749",
        //        "type": "canceled",
        //        "orderTime": 1648957043065280224,
        //        "size": "100.452",
        //        "filledSize": "0",
        //        "price": "2.9635",
        //        "clientOid": "buy-XCAD-USDT-1648957043010159",
        //        "remainSize": "0",
        //        "status": "done",
        //        "ts": 1648957054031001037
        //    }
        //
        // /spotMarket/advancedOrders
        //
        //    {
        //        "createdAt": 1589789942337,
        //        "orderId": "5ec244f6a8a75e0009958237",
        //        "orderPrice": "0.00062",
        //        "orderType": "stop",
        //        "side": "sell",
        //        "size": "1",
        //        "stop": "entry",
        //        "stopPrice": "0.00062",
        //        "symbol": "KCS-BTC",
        //        "tradeType": "TRADE",
        //        "triggerSuccess": true,
        //        "ts": 1589790121382281286,
        //        "type": "triggered"
        //    }
        //
        // futures
        //     {
        //         "symbol": "ETHUSDTM",
        //         "orderType": "market",
        //         "side": "buy",
        //         "canceledSize": "0",
        //         "orderId": "416204113500479490",
        //         "positionSide": "LONG",
        //         "liquidity": "taker",
        //         "marginMode": "ISOLATED",
        //         "type": "match",
        //         "feeType": "takerFee",
        //         "orderTime": "1772043995356345762",
        //         "size": "1",
        //         "filledSize": "1",
        //         "price": "0",
        //         "matchPrice": "2068.55",
        //         "matchSize": "1",
        //         "remainSize": "0",
        //         "tradeId": "1815302608109",
        //         "clientOid": "9f7a2be0-effe-45bd-bdc8-1614715a583a",
        //         "tradeType": "trade",
        //         "status": "match",
        //         "ts": 1772043995362000000
        //     }
        //
        const rawType = this.safeString(order, 'type');
        let status = this.parseWsOrderStatus(rawType);
        let timestamp = this.safeInteger2(order, 'orderTime', 'createdAt');
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        if (market['contract']) {
            timestamp = this.safeIntegerProduct(order, 'orderTime', 0.000001);
        }
        const triggerPrice = this.safeString(order, 'stopPrice');
        const triggerSuccess = this.safeBool(order, 'triggerSuccess');
        const triggerFail = (triggerSuccess !== true) && (triggerSuccess !== undefined); // TODO: updated to triggerSuccess === False once transpiler transpiles it correctly
        if ((status === 'triggered') && triggerFail) {
            status = 'canceled';
        }
        return this.safeOrder({
            'info': order,
            'symbol': market['symbol'],
            'id': this.safeString(order, 'orderId'),
            'clientOrderId': this.safeString(order, 'clientOid'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'type': this.safeStringLower(order, 'orderType'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeStringLower(order, 'side'),
            'price': this.safeString2(order, 'price', 'orderPrice'),
            'stopPrice': triggerPrice,
            'triggerPrice': triggerPrice,
            'amount': this.safeString(order, 'size'),
            'cost': undefined,
            'average': undefined,
            'filled': this.safeString(order, 'filledSize'),
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }
    parseWsUtaOrder(order, market = undefined) {
        //
        //     {
        //         "tT": "FUTURES",
        //         "oi": "427737326394129559",
        //         "ci": "",
        //         "os": 5,
        //         "eT": "CANCEL",
        //         "s": "DOGEUSDTM",
        //         "S": "SELL",
        //         "oT": "MARKET",
        //         "lR": "",
        //         "oS": "USER",
        //         "p": "",
        //         "ti": "",
        //         "q": "1",
        //         "qU": "UNIT",
        //         "fS": "0",
        //         "lS": "0",
        //         "ls": "0",
        //         "aP": "0",
        //         "f": "0",
        //         "fC": "USDT",
        //         "t": "0",
        //         "cR": "USER",
        //         "cS": "1",
        //         "rS": "0",
        //         "tD": "DOWN",
        //         "tP": "0.01",
        //         "tPT": "MP",
        //         "pP": "",
        //         "pPT": "",
        //         "lP": "",
        //         "lPT": "",
        //         "toi": "427737326102335488",
        //         "stp": "",
        //         "rO": true,
        //         "tIF": "GTC",
        //         "pO": false,
        //         "O": "1774793727626043888",
        //         "U": 1774794309608959200
        //     }
        //
        const timestamp = this.safeIntegerProduct(order, 'O', 0.000001);
        const rawStatus = this.safeString(order, 'os');
        const marketId = this.safeString(order, 's');
        const rawTimeInForce = this.safeString(order, 'tIF');
        const remainSize = this.safeString(order, 'rS');
        const canceledSize = this.safeString(order, 'cS');
        const remaining = Precise["default"].stringAdd(remainSize, canceledSize);
        market = this.safeMarket(marketId, market);
        const fee = {
            'cost': this.safeString(order, 'f'),
            'currency': this.safeCurrencyCode(this.safeString(order, 'fC')),
        };
        // todo check amount for other qU values
        return this.safeOrder({
            'info': order,
            'id': this.safeString(order, 'oi'),
            'clientOrderId': this.safeString(order, 'ci'),
            'datetime': this.iso8601(timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeIntegerProduct(order, 'U', 0.000001),
            'status': this.parseOrderStatus(rawStatus),
            'symbol': market['symbol'],
            'type': this.safeStringLower(order, 'oT'),
            'timeInForce': this.parseOrderTimeInForce(rawTimeInForce),
            'side': this.safeStringLower(order, 'S'),
            'price': this.safeString(order, 'p'),
            'average': this.safeString(order, 'aP'),
            'amount': this.safeString(order, 'q'),
            'filled': this.safeString(order, 'fS'),
            'remaining': remaining,
            'triggerPrice': this.safeString(order, 'tP'),
            'takeProfitPrice': this.safeString(order, 'pP'),
            'stopLossPrice': this.safeString(order, 'lP'),
            'cost': this.safeString(order, 'c'),
            'trades': undefined,
            'fee': fee,
            'reduceOnly': this.safeBool(order, 'rO'),
            'postOnly': this.safeBool(order, 'pO'),
        }, market);
    }
    handleOrder(client, message) {
        //
        // Trigger Orders
        //
        //    {
        //        "createdAt": 1692745706437,
        //        "error": "Balance insufficient!",       // not always there
        //        "orderId": "vs86kp757vlda6ni003qs70v",
        //        "orderPrice": "0.26",
        //        "orderType": "stop",
        //        "side": "sell",
        //        "size": "5",
        //        "stop": "loss",
        //        "stopPrice": "0.26",
        //        "symbol": "ADA-USDT",
        //        "tradeType": "TRADE",
        //        "triggerSuccess": false,                // not always there
        //        "ts": "1692745706442929298",
        //        "type": "open"
        //    }
        //
        const data = this.safeDict(message, 'data');
        const tradeId = this.safeString(data, 'tradeId');
        if (tradeId !== undefined) {
            this.handleMyTrade(client, message);
        }
        const parsed = this.parseWsOrder(data);
        const symbol = this.safeString(parsed, 'symbol');
        const orderId = this.safeString(parsed, 'id');
        const triggerPrice = this.safeString(parsed, 'triggerPrice');
        const isTriggerOrder = (triggerPrice !== undefined);
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
            this.triggerOrders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const cachedOrders = isTriggerOrder ? this.triggerOrders : this.orders;
        const orders = this.safeValue(cachedOrders.hashmap, symbol, {});
        const order = this.safeValue(orders, orderId);
        if (order !== undefined) {
            // todo add others to calculate average etc
            if (order['status'] === 'closed') {
                parsed['status'] = 'closed';
            }
        }
        cachedOrders.append(parsed);
        const messageHash = 'orders';
        const topic = this.safeString(message, 'topic');
        const suffix = this.getOrdersMessageHashSuffix(topic);
        const typeSpecificMessageHash = messageHash + suffix;
        client.resolve(cachedOrders, typeSpecificMessageHash);
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve(cachedOrders, symbolSpecificMessageHash);
    }
    handleUtaOrder(client, message) {
        //
        //     {
        //         "T": "orderAll.UNIFIED",
        //         "P": "1774794309609274499",
        //         "d": {
        //             "tT": "FUTURES",
        //             "oi": "427737326394129559",
        //             "ci": "",
        //             "os": 5,
        //             "eT": "CANCEL",
        //             "s": "DOGEUSDTM",
        //             "S": "SELL",
        //             "oT": "MARKET",
        //             "lR": "",
        //             "oS": "USER",
        //             "p": "",
        //             "ti": "",
        //             "q": "1",
        //             "qU": "UNIT",
        //             "fS": "0",
        //             "lS": "0",
        //             "ls": "0",
        //             "aP": "0",
        //             "f": "0",
        //             "fC": "USDT",
        //             "t": "0",
        //             "cR": "USER",
        //             "cS": "1",
        //             "rS": "0",
        //             "tD": "DOWN",
        //             "tP": "0.01",
        //             "tPT": "MP",
        //             "pP": "",
        //             "pPT": "",
        //             "lP": "",
        //             "lPT": "",
        //             "toi": "427737326102335488",
        //             "stp": "",
        //             "rO": true,
        //             "tIF": "GTC",
        //             "pO": false,
        //             "O": "1774793727626043888",
        //             "U": 1774794309608959200
        //         }
        //     }
        //
        const data = this.safeDict(message, 'd', {});
        const parsed = this.parseWsUtaOrder(data);
        const symbol = this.safeString(parsed, 'symbol');
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const cachedOrders = this.orders;
        cachedOrders.append(parsed);
        const messageHash = 'uta:orders';
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve(cachedOrders, symbolSpecificMessageHash);
        client.resolve(cachedOrders, messageHash);
    }
    /**
     * @method
     * @name kucoin#watchMyTrades
     * @description watches information on multiple trades made by the user on spot
     * @see https://www.kucoin.com/docs-new/3470074w0
     * @see https://www.kucoin.com/docs-new/3470090w0
     * @see https://www.kucoin.com/docs-new/3470264w0
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta)
     * @param {string} [params.method] *classic (non-uta) account only* '/spotMarket/tradeOrders' or '/spot/tradeFills' or '/contractMarket/tradeOrders', default is '/spotMarket/tradeOrders'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let messageHash = 'myTrades';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + market['symbol'];
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('watchMyTrades', market, params);
        const isFuturesMethod = ((marketType !== 'spot') && (marketType !== 'margin'));
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'watchMyTrades', 'uta', uta);
        let trades = undefined;
        if (uta) {
            params = this.extend(params, {
                'tradeType': 'UNIFIED',
            });
            messageHash = 'uta:' + messageHash;
            const channel = 'execution.lite';
            trades = await this.subscribePrivateUta([messageHash], channel, channel, undefined, params);
        }
        else {
            const url = await this.negotiate(true, isFuturesMethod);
            let topic = isFuturesMethod ? '/contractMarket/tradeOrders' : '/spotMarket/tradeOrders';
            const optionName = isFuturesMethod ? 'contractMethod' : 'spotMethod';
            [topic, params] = this.handleOptionAndParams2(params, 'watchMyTrades', optionName, 'method', topic);
            const request = {
                'privateChannel': true,
            };
            if (symbol === undefined) {
                const suffix = this.getMyTradesMessageHashSuffix(topic);
                messageHash += suffix;
            }
            trades = await this.subscribe(url, messageHash, topic, this.extend(request, params));
        }
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    getMyTradesMessageHashSuffix(topic) {
        let suffix = '-spot';
        if (topic.indexOf('contractMarket') >= 0) {
            suffix = '-contract';
        }
        return suffix;
    }
    handleMyTrade(client, message) {
        //
        //     {
        //         "type": "message",
        //         "topic": "/spotMarket/tradeOrders",
        //         "subject": "orderChange",
        //         "channelType": "private",
        //         "data": {
        //             "symbol": "KCS-USDT",
        //             "orderType": "limit",
        //             "side": "sell",
        //             "orderId": "5efab07953bdea00089965fa",
        //             "liquidity": "taker",
        //             "type": "match",
        //             "feeType": "takerFee",
        //             "orderTime": 1670329987026,
        //             "size": "0.1",
        //             "filledSize": "0.1",
        //             "price": "0.938",
        //             "matchPrice": "0.96738",
        //             "matchSize": "0.1",
        //             "tradeId": "5efab07a4ee4c7000a82d6d9",
        //             "clientOid": "1593487481000313",
        //             "remainSize": "0",
        //             "status": "match",
        //             "ts": 1670329987311000000
        //         }
        //     }
        //
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
        }
        const data = this.safeDict(message, 'data');
        const parsed = this.parseWsTrade(data);
        const myTrades = this.myTrades;
        myTrades.append(parsed);
        const messageHash = 'myTrades';
        const topic = this.safeString(message, 'topic');
        const suffix = this.getMyTradesMessageHashSuffix(topic);
        const typeSpecificMessageHash = messageHash + suffix;
        client.resolve(this.myTrades, typeSpecificMessageHash);
        const symbolSpecificMessageHash = messageHash + ':' + parsed['symbol'];
        client.resolve(this.myTrades, symbolSpecificMessageHash);
    }
    handleUtaMyTrade(client, message) {
        //
        //     {
        //         "T": "execution.lite.UNIFIED",
        //         "P": "1774977429844510434",
        //         "d": {
        //             "E": "1774977429843000000",
        //             "S": "SELL",
        //             "p": "0.09211",
        //             "q": "10",
        //             "s": "DOGE-USDT",
        //             "lR": "TAKER",
        //             "oT": "MARKET",
        //             "oi": "428507829452754944",
        //             "ti": 20801647764195330
        //         }
        //     }
        //
        const data = this.safeDict(message, 'd', {});
        const marketId = this.safeString(data, 's');
        const market = this.safeMarket(marketId);
        const trade = this.parseWsUtaTrade(data, market);
        const symbol = trade['symbol'];
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
        }
        const cache = this.myTrades;
        cache.append(trade);
        const messageHash = 'uta:myTrades';
        const symbolMessageHash = messageHash + ':' + symbol;
        client.resolve(this.myTrades, messageHash);
        client.resolve(cache, symbolMessageHash);
    }
    parseWsTrade(trade, market = undefined) {
        //
        // /spotMarket/tradeOrders
        //
        //     {
        //         "symbol": "KCS-USDT",
        //         "orderType": "limit",
        //         "side": "sell",
        //         "orderId": "5efab07953bdea00089965fa",
        //         "liquidity": "taker",
        //         "type": "match",
        //         "feeType": "takerFee",
        //         "orderTime": 1670329987026,
        //         "size": "0.1",
        //         "filledSize": "0.1",
        //         "price": "0.938",
        //         "matchPrice": "0.96738",
        //         "matchSize": "0.1",
        //         "tradeId": "5efab07a4ee4c7000a82d6d9",
        //         "clientOid": "1593487481000313",
        //         "remainSize": "0",
        //         "status": "match",
        //         "ts": 1670329987311000000
        //     }
        //
        // /spot/tradeFills
        //
        //    {
        //        "fee": 0.00262148,
        //        "feeCurrency": "USDT",
        //        "feeRate": 0.001,
        //        "orderId": "62417436b29df8000183df2f",
        //        "orderType": "market",
        //        "price": 131.074,
        //        "side": "sell",
        //        "size": 0.02,
        //        "symbol": "LTC-USDT",
        //        "time": "1648456758734571745",
        //        "tradeId": "624174362e113d2f467b3043"
        //    }
        //
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market, '-');
        const symbol = market['symbol'];
        const type = this.safeString(trade, 'orderType');
        const side = this.safeString(trade, 'side');
        const tradeId = this.safeString(trade, 'tradeId');
        let price = this.safeString(trade, 'matchPrice');
        let amount = this.safeString(trade, 'matchSize');
        if (price === undefined) {
            // /spot/tradeFills
            price = this.safeString(trade, 'price');
            amount = this.safeString(trade, 'size');
        }
        const order = this.safeString(trade, 'orderId');
        const timestamp = this.safeIntegerProduct2(trade, 'ts', 'time', 0.000001);
        const feeCurrency = market['quote'];
        const feeRate = this.safeString(trade, 'feeRate');
        const feeCost = this.safeString(trade, 'fee');
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'id': tradeId,
            'order': order,
            'type': type,
            'takerOrMaker': this.safeString(trade, 'liquidity'),
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': {
                'cost': feeCost,
                'rate': feeRate,
                'currency': feeCurrency,
            },
        }, market);
    }
    /**
     * @method
     * @name kucoin#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.kucoin.com/docs-new/3470075w0 // spot balance
     * @see https://www.kucoin.com/docs-new/3470092w0 // contract balance
     * @see https://www.kucoin.com/docs-new/3470231w0 // uta balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta)
     * @param {string} [params.type] *classic (non-uta) account only* 'spot' or 'swap' (default is 'spot')
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'watchBalance', 'uta', uta);
        let defaultType = uta ? 'unified' : 'spot';
        let type = defaultType;
        if (!uta) {
            defaultType = this.safeString(this.options, 'defaultType', defaultType);
            type = this.safeString(params, 'type', defaultType);
        }
        params = this.omit(params, 'type');
        const accountsByType = this.safeDict(this.options, 'accountsByType', {});
        const uniformType = this.safeString(accountsByType, type, type);
        const isClassicFuturesMethod = (uniformType === 'contract');
        let subscriptionHash = isClassicFuturesMethod ? '/contractAccount/wallet' : '/account/balance';
        let url = undefined;
        if (uta) {
            url = await this.getUtaUrl();
            subscriptionHash = uniformType;
        }
        else {
            url = await this.negotiate(true, isClassicFuturesMethod);
        }
        const client = this.client(url);
        this.setBalanceCache(client, uniformType);
        const options = this.safeDict(this.options, 'watchBalance');
        const fetchBalanceSnapshot = this.safeBool(options, 'fetchBalanceSnapshot', false);
        const awaitBalanceSnapshot = this.safeBool(options, 'awaitBalanceSnapshot', true);
        if (fetchBalanceSnapshot && awaitBalanceSnapshot) {
            await client.future(uniformType + ':fetchBalanceSnapshot');
        }
        const messageHash = uniformType + ':balance';
        if (uta) {
            const extendedParams = {
                'accountType': uniformType,
            };
            const channel = 'balance';
            return await this.subscribePrivateUta([messageHash], subscriptionHash, channel, undefined, this.extend(extendedParams, params));
        }
        else {
            const requestId = this.requestId().toString();
            const request = {
                'id': requestId,
                'type': 'subscribe',
                'topic': subscriptionHash,
                'response': true,
                'privateChannel': true,
            };
            const message = this.extend(request, params);
            if (!(subscriptionHash in client.subscriptions)) {
                client.subscriptions[requestId] = subscriptionHash;
            }
            return await this.watch(url, messageHash, message, uniformType);
        }
    }
    setBalanceCache(client, type) {
        if ((type in client.subscriptions) && (type in this.balance)) {
            return;
        }
        const options = this.safeDict(this.options, 'watchBalance');
        const fetchBalanceSnapshot = this.safeBool(options, 'fetchBalanceSnapshot', false);
        if (fetchBalanceSnapshot) {
            const messageHash = type + ':fetchBalanceSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadBalanceSnapshot, client, messageHash, type);
            }
        }
        else {
            this.balance[type] = {};
        }
    }
    async loadBalanceSnapshot(client, messageHash, type) {
        const uta = (type === 'unified');
        const params = {
            'type': type,
            'uta': uta,
        };
        const response = await this.fetchBalance(params);
        this.balance[type] = this.extend(response, this.safeValue(this.balance, type, {}));
        // don't remove the future from the .futures cache
        if (messageHash in client.futures) {
            const future = client.futures[messageHash];
            future.resolve();
            client.resolve(this.balance[type], type + ':balance');
        }
    }
    handleBalance(client, message) {
        //
        // {
        //     "id":"6217a451294b030001e3a26a",
        //     "type":"message",
        //     "topic":"/account/balance",
        //     "userId":"6217707c52f97f00012a67db",
        //     "channelType":"private",
        //     "subject":"account.balance",
        //     "data":{
        //        "accountId":"62177fe67810720001db2f18",
        //        "available":"89",
        //        "availableChange":"-30",
        //        "currency":"USDT",
        //        "hold":"0",
        //        "holdChange":"0",
        //        "relationContext":{
        //        },
        //        "relationEvent":"main.transfer",
        //        "relationEventId":"6217a451294b030001e3a26a",
        //        "time":"1645716561816",
        //        "total":"89"
        //     }
        //
        // futures
        //    {
        //        "id": "6375553193027a0001f6566f",
        //        "type": "message",
        //        "topic": "/contractAccount/wallet",
        //        "userId": "613a896885d8660006151f01",
        //        "channelType": "private",
        //        "subject": "availableBalance.change",
        //        "data": {
        //            "currency": "USDT",
        //            "holdBalance": "0.0000000000",
        //            "availableBalance": "14.0350281903",
        //            "timestamp": "1668633905657"
        //        }
        //    }
        //
        //     {
        //         "topic": "/contractAccount/wallet",
        //         "type": "message",
        //         "subject": "walletBalance.change",
        //         "id": "699f586d4416a80001df3804",
        //         "userId": "64f99aced178640001306e6e",
        //         "channelType": "private",
        //         "data": {
        //             "crossPosMargin": "0",
        //             "isolatedOrderMargin": "0",
        //             "holdBalance": "0",
        //             "equity": "49.50050236",
        //             "version": "2874",
        //             "availableBalance": "28.67180236",
        //             "isolatedPosMargin": "20.7308",
        //             "maxWithdrawAmount": "28.67180236",
        //             "walletBalance": "49.40260236",
        //             "isolatedFundingFeeMargin": "0",
        //             "crossUnPnl": "0",
        //             "totalCrossMargin": "28.67180236",
        //             "currency": "USDT",
        //             "isolatedUnPnl": "0.0979",
        //             "availableMargin": "28.67180236",
        //             "crossOrderMargin": "0",
        //             "timestamp": "1772050541214"
        //         }
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const currencyId = this.safeString(data, 'currency');
        const relationEvent = this.safeString(data, 'relationEvent');
        let requestAccountType = undefined;
        if (relationEvent !== undefined) {
            const relationEventParts = relationEvent.split('.');
            requestAccountType = this.safeString(relationEventParts, 0);
        }
        const topic = this.safeString(message, 'topic');
        if (topic === '/contractAccount/wallet') {
            requestAccountType = 'contract';
        }
        const accountsByType = this.safeDict(this.options, 'accountsByType');
        const uniformType = this.safeString(accountsByType, requestAccountType, 'trade');
        if (!(uniformType in this.balance)) {
            this.balance[uniformType] = {};
        }
        this.balance[uniformType]['info'] = data;
        const timestamp = this.safeInteger2(data, 'time', 'timestamp');
        this.balance[uniformType]['timestamp'] = timestamp;
        this.balance[uniformType]['datetime'] = this.iso8601(timestamp);
        const code = this.safeCurrencyCode(currencyId);
        const account = this.account();
        let used = this.safeString2(data, 'hold', 'holdBalance');
        const isolatedPosMargin = this.omitZero(this.safeString(data, 'isolatedPosMargin'));
        if (isolatedPosMargin !== undefined) {
            used = Precise["default"].stringAdd(used, isolatedPosMargin);
        }
        account['free'] = this.safeString2(data, 'available', 'availableBalance');
        account['used'] = used;
        account['total'] = this.safeString(data, 'total');
        this.balance[uniformType][code] = account;
        this.balance[uniformType] = this.safeBalance(this.balance[uniformType]);
        const messageHash = uniformType + ':balance';
        client.resolve(this.balance[uniformType], messageHash);
    }
    handleUtaBalance(client, message) {
        //
        //     {
        //         "T": "balance.UNIFIED",
        //         "P": "1774982552507478380",
        //         "d": {
        //             "c": "USDT",
        //             "e": "100.0030439507",
        //             "b": "100.0030439507",
        //             "a": "89.9930439507",
        //             "h": "10.0100000000",
        //             "U": "1774982552505000000",
        //             "l": "0.0000000000"
        //         }
        //     }
        //
        const type = 'unified';
        const data = this.safeDict(message, 'd', {});
        const currencyId = this.safeString(data, 'c');
        const code = this.safeCurrencyCode(currencyId);
        if (!(type in this.balance)) {
            this.balance[type] = {};
        }
        this.balance[type]['info'] = data;
        const timestamp = this.safeIntegerProduct(data, 'U', 0.000001);
        this.balance[type]['timestamp'] = timestamp;
        this.balance[type]['datetime'] = this.iso8601(timestamp);
        const account = this.account();
        account['free'] = this.safeString(data, 'a');
        account['used'] = this.safeString(data, 'h');
        account['total'] = this.safeString(data, 'b');
        this.balance[type][code] = account;
        this.balance[type] = this.safeBalance(this.balance[type]);
        const messageHash = type + ':balance';
        client.resolve(this.balance[type], messageHash);
    }
    /**
     * @method
     * @name kucoin#watchPosition
     * @description watch open positions for a specific symbol
     * @see https://www.kucoin.com/docs-new/3470093w0
     * @param {string|undefined} symbol unified market symbol
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPosition(symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' watchPosition() requires a symbol argument');
        }
        await this.loadMarkets();
        const url = await this.negotiate(true);
        const market = this.market(symbol);
        const topic = '/contract/position:' + market['id'];
        const request = {
            'privateChannel': true,
        };
        const messageHash = 'position:' + market['symbol'];
        const client = this.client(url);
        this.setPositionCache(client, symbol);
        const fetchPositionSnapshot = this.handleOption('watchPosition', 'fetchPositionSnapshot', true);
        const awaitPositionSnapshot = this.handleOption('watchPosition', 'awaitPositionSnapshot', true);
        const currentPosition = this.getCurrentPosition(symbol);
        if (fetchPositionSnapshot && awaitPositionSnapshot && currentPosition === undefined) {
            const snapshot = await client.future('fetchPositionSnapshot:' + symbol);
            return snapshot;
        }
        return await this.subscribe(url, messageHash, topic, this.extend(request, params));
    }
    /**
     * @method
     * @name kucoin#watchPositions
     * @see https://www.kucoin.com/docs-new/3470233w0
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta)
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'watchPositions', 'uta', uta);
        const tradeType = uta ? 'UNIFIED' : 'TRADE';
        const messageHash = 'positions';
        const messageHashes = [];
        symbols = this.marketSymbols(symbols);
        if (symbols === undefined) {
            messageHashes.push(messageHash);
        }
        else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push(messageHash + ':' + symbol);
            }
        }
        const url = await this.getUtaUrl();
        const client = this.client(url);
        this.setPositionsCache(client, uta);
        const fetchPositionSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionSnapshot = this.handleOption('watchPositions', 'awaitPositionsSnapshot', true);
        const cache = this.positions;
        if (fetchPositionSnapshot && awaitPositionSnapshot && cache === undefined) {
            const snapshot = await client.future('fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit(snapshot, symbols, since, limit, true);
        }
        const channel = 'positionAll';
        params = this.extend(params, {
            'tradeType': tradeType,
        });
        const newPositions = await this.subscribePrivateUta(messageHashes, channel, channel, undefined, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(cache, symbols, since, limit, true);
    }
    getCurrentPosition(symbol) {
        if (this.positions === undefined) {
            return undefined;
        }
        const cache = this.positions.hashmap;
        const symbolCache = this.safeValue(cache, symbol, {});
        const values = Object.values(symbolCache);
        return this.safeValue(values, 0);
    }
    setPositionsCache(client, uta) {
        if (!(this.isEmpty(this.positions))) {
            return;
        }
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', false);
        if (fetchPositionsSnapshot) {
            const messageHash = 'fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadPositionsSnapshot, client, messageHash, uta);
            }
        }
        else {
            this.positions = new Cache.ArrayCacheBySymbolById();
        }
    }
    async loadPositionsSnapshot(client, messageHash, uta) {
        const positions = await this.fetchPositions(undefined, { 'uta': uta });
        this.positions = new Cache.ArrayCacheBySymbolById();
        const cache = this.positions;
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const contracts = this.safeNumber(position, 'contracts', 0);
            if (contracts > 0) {
                cache.append(position);
            }
        }
        // don't remove the future from the .futures cache
        if (messageHash in client.futures) {
            const future = client.futures[messageHash];
            future.resolve(cache);
            client.resolve(cache, 'positions');
        }
    }
    setPositionCache(client, symbol) {
        const fetchPositionSnapshot = this.handleOption('watchPosition', 'fetchPositionSnapshot', false);
        if (fetchPositionSnapshot) {
            const messageHash = 'fetchPositionSnapshot:' + symbol;
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadPositionSnapshot, client, messageHash, symbol);
            }
        }
    }
    async loadPositionSnapshot(client, messageHash, symbol) {
        const position = await this.fetchPosition(symbol);
        this.positions = new Cache.ArrayCacheBySymbolById();
        const cache = this.positions;
        cache.append(position);
        // don't remove the future from the .futures cache
        if (messageHash in client.futures) {
            const future = client.futures[messageHash];
            future.resolve(cache);
            client.resolve(position, 'position:' + symbol);
        }
    }
    handlePosition(client, message) {
        //
        // Position Changes Caused Operations
        //    {
        //        "type": "message",
        //        "userId": "5c32d69203aa676ce4b543c7", // Deprecated, will detele later
        //        "channelType": "private",
        //        "topic": "/contract/position:XBTUSDM",
        //        "subject": "position.change",
        //        "data": {
        //            "realisedGrossPnl": 0E-8, //Accumulated realised profit and loss
        //            "symbol": "XBTUSDM", //Symbol
        //            "crossMode": false, //Cross mode or not
        //            "liquidationPrice": 1000000.0, //Liquidation price
        //            "posLoss": 0E-8, //Manually added margin amount
        //            "avgEntryPrice": 7508.22, //Average entry price
        //            "unrealisedPnl": -0.00014735, //Unrealised profit and loss
        //            "markPrice": 7947.83, //Mark price
        //            "posMargin": 0.00266779, //Position margin
        //            "autoDeposit": false, //Auto deposit margin or not
        //            "riskLimit": 100000, //Risk limit
        //            "unrealisedCost": 0.00266375, //Unrealised value
        //            "posComm": 0.00000392, //Bankruptcy cost
        //            "posMaint": 0.00001724, //Maintenance margin
        //            "posCost": 0.00266375, //Position value
        //            "maintMarginReq": 0.005, //Maintenance margin rate
        //            "bankruptPrice": 1000000.0, //Bankruptcy price
        //            "realisedCost": 0.00000271, //Currently accumulated realised position value
        //            "markValue": 0.00251640, //Mark value
        //            "posInit": 0.00266375, //Position margin
        //            "realisedPnl": -0.00000253, //Realised profit and losts
        //            "maintMargin": 0.00252044, //Position margin
        //            "realLeverage": 1.06, //Leverage of the order
        //            "changeReason": "positionChange", //changeReason:marginChange、positionChange、liquidation、autoAppendMarginStatusChange、adl
        //            "currentCost": 0.00266375, //Current position value
        //            "openingTimestamp": 1558433191000, //Open time
        //            "currentQty": -20, //Current position
        //            "delevPercentage": 0.52, //ADL ranking percentile
        //            "currentComm": 0.00000271, //Current commission
        //            "realisedGrossCost": 0E-8, //Accumulated reliased gross profit value
        //            "isOpen": true, //Opened position or not
        //            "posCross": 1.2E-7, //Manually added margin
        //            "currentTimestamp": 1558506060394, //Current timestamp
        //            "unrealisedRoePcnt": -0.0553, //Rate of return on investment
        //            "unrealisedPnlPcnt": -0.0553, //Position profit and loss ratio
        //            "settleCurrency": "XBT" //Currency used to clear and settle the trades
        //        }
        //    }
        // Position Changes Caused by Mark Price
        //    {
        //        "userId": "5cd3f1a7b7ebc19ae9558591", // Deprecated, will detele later
        //        "topic": "/contract/position:XBTUSDM",
        //        "subject": "position.change",
        //          "data": {
        //              "markPrice": 7947.83,                   //Mark price
        //              "markValue": 0.00251640,                 //Mark value
        //              "maintMargin": 0.00252044,              //Position margin
        //              "realLeverage": 10.06,                   //Leverage of the order
        //              "unrealisedPnl": -0.00014735,           //Unrealised profit and lost
        //              "unrealisedRoePcnt": -0.0553,           //Rate of return on investment
        //              "unrealisedPnlPcnt": -0.0553,            //Position profit and loss ratio
        //              "delevPercentage": 0.52,             //ADL ranking percentile
        //              "currentTimestamp": 1558087175068,      //Current timestamp
        //              "settleCurrency": "XBT"                 //Currency used to clear and settle the trades
        //          }
        //    }
        //  Funding Settlement
        //    {
        //        "userId": "xbc453tg732eba53a88ggyt8c", // Deprecated, will detele later
        //        "topic": "/contract/position:XBTUSDM",
        //        "subject": "position.settlement",
        //        "data": {
        //            "fundingTime": 1551770400000,          //Funding time
        //            "qty": 100,                            //Position siz
        //            "markPrice": 3610.85,                 //Settlement price
        //            "fundingRate": -0.002966,             //Funding rate
        //            "fundingFee": -296,                   //Funding fees
        //            "ts": 1547697294838004923,             //Current time (nanosecond)
        //            "settleCurrency": "XBT"                //Currency used to clear and settle the trades
        //        }
        //    }
        // Adjustmet result of risk limit level
        //     {
        //         "userId": "xbc453tg732eba53a88ggyt8c",
        //         "topic": "/contract/position:ADAUSDTM",
        //         "subject": "position.adjustRiskLimit",
        //         "data": {
        //           "success": true, // Successful or not
        //           "riskLimitLevel": 1, // Current risk limit level
        //           "msg": "" // Failure reason
        //         }
        //     }
        //
        const topic = this.safeString(message, 'topic', '');
        const parts = topic.split(':');
        const marketId = this.safeString(parts, 1);
        const symbol = this.safeSymbol(marketId, undefined, '');
        const cache = this.positions;
        const currentPosition = this.getCurrentPosition(symbol);
        const messageHash = 'position:' + symbol;
        const data = this.safeDict(message, 'data', {});
        const newPosition = this.parsePosition(data);
        const keys = Object.keys(newPosition);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (newPosition[key] === undefined) {
                delete newPosition[key];
            }
        }
        const position = this.extend(currentPosition, newPosition);
        cache.append(position);
        client.resolve(position, messageHash);
    }
    handleUtaPosition(client, message) {
        //
        //     {
        //         "T": "positionAll.UNIFIED",
        //         "P": "1774805155993190995",
        //         "d": {
        //             "pi": "30000000000084845",
        //             "s": "DOGEUSDTM",
        //             "mM": "CROSS",
        //             "q": "3",
        //             "eP": "0.09038666666666666666",
        //             "pV": "27.021",
        //             "mP": "0.09007",
        //             "lP": "0.00001",
        //             "bP": "0.00001",
        //             "l": "4.5",
        //             "uPL": "-0.095",
        //             "rPL": "-0.01473705",
        //             "iM": "6.0046666666666666666",
        //             "mmr": "0.007",
        //             "mtM": "0.189147",
        //             "U": "1774805155988000000",
        //             "O": 1774793727585000000
        //         }
        //     }
        //
        if (this.positions === undefined) {
            this.positions = new Cache.ArrayCacheBySymbolById();
        }
        const data = this.safeDict(message, 'd', {});
        const marketId = this.safeString(data, 's');
        const symbol = this.safeSymbol(marketId);
        const cache = this.positions;
        const currentPosition = this.getCurrentPosition(symbol);
        const newPosition = this.parseWsUtaPosition(data);
        const keys = Object.keys(newPosition);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (newPosition[key] === undefined) {
                delete newPosition[key];
            }
        }
        const position = this.extend(currentPosition, newPosition);
        cache.append(position);
        const messageHash = 'positions';
        const symbolMessageHash = messageHash + ':' + symbol;
        client.resolve(this.positions, messageHash);
        client.resolve(this.positions, symbolMessageHash);
    }
    parseWsUtaPosition(position, market = undefined) {
        //
        //     {
        //         "pi": "30000000000084845",
        //         "s": "DOGEUSDTM",
        //         "mM": "CROSS",
        //         "q": "3",
        //         "eP": "0.09038666666666666666",
        //         "pV": "27.021",
        //         "mP": "0.09007",
        //         "lP": "0.00001",
        //         "bP": "0.00001",
        //         "l": "4.5",
        //         "uPL": "-0.095",
        //         "rPL": "-0.01473705",
        //         "iM": "6.0046666666666666666",
        //         "mmr": "0.007",
        //         "mtM": "0.189147",
        //         "U": "1774805155988000000",
        //         "O": 1774793727585000000
        //     }
        //
        const marketId = this.safeString(position, 's');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerProduct(position, 'O', 0.000001);
        const amountString = this.safeString(position, 'q');
        const size = Precise["default"].stringAbs(amountString);
        const side = Precise["default"].stringGt(amountString, '0') ? 'long' : 'short';
        return this.safePosition({
            'info': position,
            'id': this.safeString(position, 'pi'),
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': this.safeIntegerProduct(position, 'U', 0.000001),
            'initialMargin': this.safeNumber(position, 'iM'),
            'initialMarginPercentage': undefined,
            'maintenanceMargin': this.safeNumber(position, 'mtM'),
            'maintenanceMarginPercentage': this.safeNumber(position, 'mmr'),
            'entryPrice': this.safeNumber(position, 'eP'),
            'notional': this.safeNumber(position, 'pV'),
            'leverage': this.safeNumber(position, 'l'),
            'unrealizedPnl': this.safeNumber(position, 'uPL'),
            'contracts': this.parseNumber(size),
            'contractSize': this.safeNumber(market, 'contractSize'),
            'realizedPnl': this.safeNumber(position, 'rPL'),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber(position, 'lP'),
            'markPrice': this.safeNumber(position, 'mP'),
            'lastPrice': undefined,
            'collateral': undefined,
            'marginMode': this.safeStringLower(position, 'mM'),
            'side': side,
            'percentage': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    handleSubject(client, message) {
        //
        //     {
        //         "type":"message",
        //         "topic":"/market/level2:BTC-USDT",
        //         "subject":"trade.l2update",
        //         "data":{
        //             "sequenceStart":1545896669105,
        //             "sequenceEnd":1545896669106,
        //             "symbol":"BTC-USDT",
        //             "changes": {
        //                 "asks": [["6","1","1545896669105"]], // price, size, sequence
        //                 "bids": [["4","1","1545896669106"]]
        //             }
        //         }
        //     }
        //
        const topic = this.safeString(message, 'topic');
        if (topic === '/market/ticker:all') {
            this.handleTicker(client, message);
            return;
        }
        const subject = this.safeString2(message, 'subject', 'T');
        const methods = {
            'level1': this.handleBidAsk,
            'level2': this.handleOrderBook,
            'trade.l2update': this.handleOrderBook,
            'trade.ticker': this.handleTicker,
            'trade.snapshot': this.handleTicker,
            'trade.l3match': this.handleTrade,
            'trade.candles.update': this.handleOHLCV,
            'account.balance': this.handleBalance,
            'orderChange': this.handleOrder,
            'stopOrder': this.handleOrder,
            '/spot/tradeFills': this.handleMyTrade,
            // futures messages
            'ticker': this.handleTicker,
            'tickerV2': this.handleBidAsk,
            'candle.stick': this.handleOHLCV,
            'match': this.handleTrade,
            'orderUpdated': this.handleOrder,
            'symbolOrderChange': this.handleOrder,
            'availableBalance.change': this.handleBalance,
            'walletBalance.change': this.handleBalance,
            'position.change': this.handlePosition,
            'position.settlement': this.handlePosition,
            'position.adjustRiskLimit': this.handlePosition,
            // uta messages
            'ticker.SPOT': this.handleUtaTicker,
            'ticker.FUTURES': this.handleUtaTicker,
            'trade.SPOT': this.handleUtaTrade,
            'trade.FUTURES': this.handleUtaTrade,
            'kline.SPOT': this.handleUtaOHLCV,
            'kline.FUTURES': this.handleUtaOHLCV,
            'obu.SPOT': this.handleUtaOrderBook,
            'obu.FUTURES': this.handleUtaOrderBook,
            'order.UNIFIED': this.handleUtaOrder,
            'order.SPOT': this.handleUtaOrder,
            'order.FUTURES': this.handleUtaOrder,
            'order.CROSS': this.handleUtaOrder,
            'order.ISOLATED': this.handleUtaOrder,
            'orderAll.UNIFIED': this.handleUtaOrder,
            'orderAll.SPOT': this.handleUtaOrder,
            'orderAll.FUTURES': this.handleUtaOrder,
            'orderAll.CROSS': this.handleUtaOrder,
            'orderAll.ISOLATED': this.handleUtaOrder,
            'execution.UNIFIED': this.handleUtaMyTrade,
            'execution.SPOT': this.handleUtaMyTrade,
            'execution.FUTURES': this.handleUtaMyTrade,
            'execution.CROSS': this.handleUtaMyTrade,
            'execution.ISOLATED': this.handleUtaMyTrade,
            'execution.lite.UNIFIED': this.handleUtaMyTrade,
            'execution.lite.SPOT': this.handleUtaMyTrade,
            'execution.lite.FUTURES': this.handleUtaMyTrade,
            'execution.lite.CROSS': this.handleUtaMyTrade,
            'execution.lite.ISOLATED': this.handleUtaMyTrade,
            'position.UNIFIED': this.handleUtaPosition,
            'position.FUTURES': this.handleUtaPosition,
            'positionAll.UNIFIED': this.handleUtaPosition,
            'positionAll.FUTURES': this.handleUtaPosition,
            'balance.UNIFIED': this.handleUtaBalance,
        };
        const method = this.safeValue(methods, subject);
        if (method !== undefined) {
            method.call(this, client, message);
        }
    }
    ping(client) {
        // kucoin does not support built-in ws protocol-level ping-pong
        // instead it requires a custom json-based text ping-pong
        // https://docs.kucoin.com/#ping
        const id = this.requestId().toString();
        return {
            'id': id,
            'type': 'ping',
        };
    }
    handlePong(client, message) {
        client.lastPong = this.milliseconds();
        // https://docs.kucoin.com/#ping
    }
    handleErrorMessage(client, message) {
        //
        //    {
        //        "id": "1",
        //        "type": "error",
        //        "code": 415,
        //        "data": "type is not supported"
        //    }
        //
        // uta
        //     {
        //         "id": "1",
        //         "result": false,
        //         "reason": "missing `symbol` for topic: Position"
        //     }
        //
        const data = this.safeString2(message, 'data', 'reason', '');
        if (data === 'token is expired') {
            let type = 'public';
            if (client.url.indexOf('connectId=private') >= 0) {
                type = 'private';
            }
            this.options['urls'][type] = undefined;
        }
        this.handleErrors(1, '', client.url, '', {}, data, message, {}, {});
        return false;
    }
    handleMessage(client, message) {
        const type = this.safeString2(message, 'type', 'message');
        const methods = {
            // 'heartbeat': this.handleHeartbeat,
            'welcome': this.handleSystemStatus,
            'ack': this.handleSubscriptionStatus,
            'message': this.handleSubject,
            'pong': this.handlePong,
            'error': this.handleErrorMessage,
        };
        const method = this.safeValue(methods, type);
        if (method !== undefined) {
            method.call(this, client, message);
        }
        else if ('T' in message) { // uta messages
            this.handleSubject(client, message);
        }
        else if ('result' in message) { // subscription uta messages
            const result = this.safeBool(message, 'result', true);
            if (!result) {
                this.handleErrorMessage(client, message);
            }
            this.handleSubscriptionStatus(client, message);
        }
    }
    getMessageHash(elementName, symbol = undefined) {
        // method from kucoinfutures
        // elementName can be 'ticker', 'bidask', ...
        if (symbol !== undefined) {
            return elementName + ':' + symbol;
        }
        else {
            return elementName + 's@all';
        }
    }
}

exports["default"] = kucoin;
