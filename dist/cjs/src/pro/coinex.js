'use strict';

var coinex$1 = require('../coinex.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class coinex extends coinex$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchBidsAsks': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchMyTrades': true,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
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
                    'limits': [5, 10, 20, 50],
                    'defaultLimit': 50,
                    'aggregations': ['1000', '100', '10', '1', '0', '0.1', '0.01', '0.001', '0.0001', '0.00001', '0.000001', '0.0000001', '0.00000001', '0.000000001', '0.0000000001', '0.00000000001'],
                    'defaultAggregation': '0',
                },
            },
            'streaming': {},
            'exceptions': {
                'exact': {
                    '20001': errors.BadRequest,
                    '20002': errors.NotSupported,
                    '21001': errors.AuthenticationError,
                    '21002': errors.AuthenticationError,
                    '23001': errors.RequestTimeout,
                    '23002': errors.RateLimitExceeded,
                    '24001': errors.ExchangeError,
                    '24002': errors.ExchangeNotAvailable,
                    '30001': errors.BadRequest,
                    '30002': errors.NotSupported,
                    '31001': errors.AuthenticationError,
                    '31002': errors.AuthenticationError,
                    '33001': errors.RequestTimeout,
                    '33002': errors.RateLimitExceeded,
                    '34001': errors.ExchangeError,
                    '34002': errors.ExchangeNotAvailable, // Service unavailable temporarily
                },
                'broad': {},
            },
        });
    }
    requestId() {
        const requestId = this.sum(this.safeInteger(this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }
    handleTicker(client, message) {
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
        const defaultType = this.safeString(this.options, 'defaultType');
        const data = this.safeDict(message, 'data', {});
        const rawTickers = this.safeList(data, 'state_list', []);
        const newTickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            const entry = rawTickers[i];
            const marketId = this.safeString(entry, 'market');
            const symbol = this.safeSymbol(marketId, undefined, undefined, defaultType);
            const market = this.safeMarket(marketId, undefined, undefined, defaultType);
            const parsedTicker = this.parseWSTicker(entry, market);
            this.tickers[symbol] = parsedTicker;
            newTickers.push(parsedTicker);
        }
        const messageHashes = this.findMessageHashes(client, 'tickers::');
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
        client.resolve(newTickers, 'tickers');
    }
    parseWSTicker(ticker, market = undefined) {
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
        const defaultType = this.safeString(this.options, 'defaultType');
        const marketId = this.safeString(ticker, 'market');
        return this.safeTicker({
            'symbol': this.safeSymbol(marketId, market, undefined, defaultType),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': undefined,
            'bidVolume': this.safeString(ticker, 'volume_buy'),
            'ask': undefined,
            'askVolume': this.safeString(ticker, 'volume_sell'),
            'vwap': undefined,
            'open': this.safeString(ticker, 'open'),
            'close': this.safeString(ticker, 'close'),
            'last': this.safeString(ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'volume'),
            'quoteVolume': this.safeString(ticker, 'value'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name coinex#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.coinex.com/api/v2/assets/balance/ws/spot_balance
     * @see https://docs.coinex.com/api/v2/assets/balance/ws/futures_balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params, 'spot');
        await this.authenticate(type);
        const url = this.urls['api']['ws'][type];
        // coinex throws a closes the websocket when subscribing over 1422 currencies, therefore we filter out inactive currencies
        const activeCurrencies = this.filterBy(this.currencies_by_id, 'active', true);
        const activeCurrenciesById = this.indexBy(activeCurrencies, 'id');
        let currencies = Object.keys(activeCurrenciesById);
        if (currencies === undefined) {
            currencies = [];
        }
        let messageHash = 'balances';
        if (type === 'spot') {
            messageHash += ':spot';
        }
        else {
            messageHash += ':swap';
        }
        const subscribe = {
            'method': 'balance.subscribe',
            'params': { 'ccy_list': currencies },
            'id': this.requestId(),
        };
        const request = this.deepExtend(subscribe, params);
        return await this.watch(url, messageHash, request, messageHash);
    }
    handleBalance(client, message) {
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
        if (this.balance === undefined) {
            this.balance = {};
        }
        const data = this.safeDict(message, 'data', {});
        const balances = this.safeList(data, 'balance_list', []);
        const firstEntry = balances[0];
        const updated = this.safeInteger(firstEntry, 'updated_at');
        const unrealizedPnl = this.safeString(firstEntry, 'unrealized_pnl');
        const isSpot = (updated !== undefined);
        const isSwap = (unrealizedPnl !== undefined);
        let info = undefined;
        let account = undefined;
        let rawBalances = [];
        if (isSpot) {
            account = 'spot';
            for (let i = 0; i < balances.length; i++) {
                rawBalances = this.arrayConcat(rawBalances, balances);
            }
            info = rawBalances;
        }
        if (isSwap) {
            account = 'swap';
            for (let i = 0; i < balances.length; i++) {
                rawBalances = this.arrayConcat(rawBalances, balances);
            }
            info = rawBalances;
        }
        for (let i = 0; i < rawBalances.length; i++) {
            const entry = rawBalances[i];
            this.parseWsBalance(entry, account);
        }
        let messageHash = undefined;
        if (account !== undefined) {
            if (this.safeValue(this.balance, account) === undefined) {
                this.balance[account] = {};
            }
            this.balance[account]['info'] = info;
            this.balance[account] = this.safeBalance(this.balance[account]);
            messageHash = 'balances:' + account;
            client.resolve(this.balance[account], messageHash);
        }
    }
    parseWsBalance(balance, accountType = undefined) {
        //
        // spot
        //
        //     {
        //         "margin_market": "BTCUSDT",
        //         "ccy": "BTC",
        //         "available": "44.62207740",
        //         "frozen": "0.00000000",
        //         "updated_at": 1689152421692
        //     }
        //
        // swap
        //
        //     {
        //         "ccy": "USDT",
        //         "available": "97.92470982756335000001",
        //         "frozen": "0.00000000000000000000",
        //         "margin": "0.61442700000000000000",
        //         "transferrable": "97.92470982756335000001",
        //         "unrealized_pnl": "-0.00807000000000000000",
        //         "equity": "97.92470982756335000001"
        //     }
        //
        const account = this.account();
        const currencyId = this.safeString(balance, 'ccy');
        const code = this.safeCurrencyCode(currencyId);
        account['free'] = this.safeString(balance, 'available');
        account['used'] = this.safeString(balance, 'frozen');
        if (accountType !== undefined) {
            if (this.safeValue(this.balance, accountType) === undefined) {
                this.balance[accountType] = {};
            }
            this.balance[accountType][code] = account;
        }
        else {
            this.balance[code] = account;
        }
    }
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
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchMyTrades', market, params, 'spot');
        await this.authenticate(type);
        const url = this.urls['api']['ws'][type];
        const subscribedSymbols = [];
        let messageHash = 'myTrades';
        if (market !== undefined) {
            messageHash += ':' + symbol;
            subscribedSymbols.push(market['id']);
        }
        else {
            if (type === 'spot') {
                messageHash += ':spot';
            }
            else {
                messageHash += ':swap';
            }
        }
        const message = {
            'method': 'user_deals.subscribe',
            'params': { 'market_list': subscribedSymbols },
            'id': this.requestId(),
        };
        const request = this.deepExtend(message, params);
        const trades = await this.watch(url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleMyTrades(client, message) {
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
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 'market');
        const isSpot = client.url.indexOf('spot') > -1;
        const defaultType = isSpot ? 'spot' : 'swap';
        const market = this.safeMarket(marketId, undefined, undefined, defaultType);
        const symbol = market['symbol'];
        const messageHash = 'myTrades:' + symbol;
        const messageWithType = 'myTrades:' + market['type'];
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const parsed = this.parseWsTrade(data, market);
        stored.append(parsed);
        this.trades[symbol] = stored;
        client.resolve(this.trades[symbol], messageWithType);
        client.resolve(this.trades[symbol], messageHash);
    }
    handleTrades(client, message) {
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
        const data = this.safeDict(message, 'data', {});
        const trades = this.safeList(data, 'deal_list', []);
        const marketId = this.safeString(data, 'market');
        const isSpot = client.url.indexOf('spot') > -1;
        const defaultType = isSpot ? 'spot' : 'swap';
        const market = this.safeMarket(marketId, undefined, undefined, defaultType);
        const symbol = market['symbol'];
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const parsed = this.parseWsTrade(trade, market);
            stored.append(parsed);
        }
        this.trades[symbol] = stored;
        client.resolve(this.trades[symbol], messageHash);
    }
    parseWsTrade(trade, market = undefined) {
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
        const timestamp = this.safeInteger(trade, 'created_at');
        const isSpot = ('margin_market' in trade);
        const defaultType = isSpot ? 'spot' : 'swap';
        const marketId = this.safeString(trade, 'market');
        market = this.safeMarket(marketId, market, undefined, defaultType);
        let fee = {};
        const feeCost = this.omitZero(this.safeString(trade, 'fee'));
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString(trade, 'fee_ccy', market['quote']);
            fee = {
                'currency': this.safeCurrencyCode(feeCurrencyId),
                'cost': feeCost,
            };
        }
        return this.safeTrade({
            'id': this.safeString(trade, 'deal_id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': this.safeSymbol(marketId, market, undefined, defaultType),
            'order': this.safeString(trade, 'order_id'),
            'type': undefined,
            'side': this.safeString(trade, 'side'),
            'takerOrMaker': this.safeString(trade, 'role'),
            'price': this.safeString(trade, 'price'),
            'amount': this.safeString(trade, 'amount'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }
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
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const tickers = await this.watchTickers([symbol], params);
        return tickers[market['symbol']];
    }
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
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const marketIds = this.marketIds(symbols);
        let market = undefined;
        const messageHashes = [];
        const symbolsDefined = (symbols !== undefined);
        if (symbolsDefined) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                market = this.market(symbol);
                messageHashes.push('tickers::' + market['symbol']);
            }
        }
        else {
            messageHashes.push('tickers');
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchTickers', market, params);
        const url = this.urls['api']['ws'][type];
        const subscriptionHashes = ['all@ticker'];
        const subscribe = {
            'method': 'state.subscribe',
            'params': { 'market_list': marketIds },
            'id': this.requestId(),
        };
        const result = await this.watchMultiple(url, messageHashes, this.deepExtend(subscribe, params), subscriptionHashes);
        if (this.newUpdates) {
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
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
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        params['callerMethodName'] = 'watchTrades';
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name coinex#watchTradesForSymbols
     * @description watch the most recent trades for a list of symbols
     * @see https://docs.coinex.com/api/v2/spot/market/ws/market-deals
     * @see https://docs.coinex.com/api/v2/futures/market/ws/market-deals
     * @param {string[]} symbols unified symbols of the markets to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const subscribedSymbols = [];
        const messageHashes = [];
        let market = undefined;
        let callerMethodName = undefined;
        [callerMethodName, params] = this.handleParamString(params, 'callerMethodName', 'watchTradesForSymbols');
        const symbolsDefined = (symbols !== undefined);
        if (symbolsDefined) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                market = this.market(symbol);
                subscribedSymbols.push(market['id']);
                messageHashes.push('trades:' + market['symbol']);
            }
        }
        else {
            messageHashes.push('trades');
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams(callerMethodName, market, params);
        const url = this.urls['api']['ws'][type];
        const subscriptionHashes = ['trades'];
        const subscribe = {
            'method': 'deals.subscribe',
            'params': { 'market_list': subscribedSymbols },
            'id': this.requestId(),
        };
        const trades = await this.watchMultiple(url, messageHashes, this.deepExtend(subscribe, params), subscriptionHashes);
        if (this.newUpdates) {
            return trades;
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name coinex#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.coinex.com/api/v2/spot/market/ws/market-depth
     * @see https://docs.coinex.com/api/v2/futures/market/ws/market-depth
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        await this.loadMarkets();
        const watchOrderBookSubscriptions = {};
        const messageHashes = [];
        let market = undefined;
        let type = undefined;
        let callerMethodName = undefined;
        [callerMethodName, params] = this.handleParamString(params, 'callerMethodName', 'watchOrderBookForSymbols');
        [type, params] = this.handleMarketTypeAndParams(callerMethodName, undefined, params);
        const options = this.safeDict(this.options, 'watchOrderBook', {});
        const limits = this.safeList(options, 'limits', []);
        if (limit === undefined) {
            limit = this.safeInteger(options, 'defaultLimit', 50);
        }
        if (!this.inArray(limit, limits)) {
            throw new errors.NotSupported(this.id + ' watchOrderBookForSymbols() limit must be one of ' + limits.join(', '));
        }
        const defaultAggregation = this.safeString(options, 'defaultAggregation', '0');
        const aggregations = this.safeList(options, 'aggregations', []);
        const aggregation = this.safeString(params, 'aggregation', defaultAggregation);
        if (!this.inArray(aggregation, aggregations)) {
            throw new errors.NotSupported(this.id + ' watchOrderBookForSymbols() aggregation must be one of ' + aggregations.join(', '));
        }
        params = this.omit(params, 'aggregation');
        const symbolsDefined = (symbols !== undefined);
        if (symbolsDefined) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                market = this.market(symbol);
                messageHashes.push('orderbook:' + market['symbol']);
                watchOrderBookSubscriptions[symbol] = [market['id'], limit, aggregation, true];
            }
        }
        else {
            messageHashes.push('orderbook');
        }
        const marketList = Object.values(watchOrderBookSubscriptions);
        const subscribe = {
            'method': 'depth.subscribe',
            'params': { 'market_list': marketList },
            'id': this.requestId(),
        };
        const subscriptionHashes = this.hash(this.encode(this.json(watchOrderBookSubscriptions)), sha256.sha256);
        const url = this.urls['api']['ws'][type];
        const orderbooks = await this.watchMultiple(url, messageHashes, this.deepExtend(subscribe, params), subscriptionHashes);
        if (this.newUpdates) {
            return orderbooks;
        }
        return orderbooks.limit();
    }
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
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        params['callerMethodName'] = 'watchOrderBook';
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    handleDelta(bookside, delta) {
        const bidAsk = this.parseBidAsk(delta, 0, 1);
        bookside.storeArray(bidAsk);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    handleOrderBook(client, message) {
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
        const defaultType = this.safeString(this.options, 'defaultType');
        const data = this.safeDict(message, 'data', {});
        const depth = this.safeDict(data, 'depth', {});
        const marketId = this.safeString(data, 'market');
        const market = this.safeMarket(marketId, undefined, undefined, defaultType);
        const symbol = market['symbol'];
        const name = 'orderbook';
        const messageHash = name + ':' + symbol;
        const timestamp = this.safeInteger(depth, 'updated_at');
        const currentOrderBook = this.safeValue(this.orderbooks, symbol);
        const fullOrderBook = this.safeBool(data, 'is_full', false);
        if (fullOrderBook) {
            const snapshot = this.parseOrderBook(depth, symbol, timestamp);
            if (currentOrderBook === undefined) {
                this.orderbooks[symbol] = this.orderBook(snapshot);
            }
            else {
                const orderbook = this.orderbooks[symbol];
                orderbook.reset(snapshot);
            }
        }
        else {
            const asks = this.safeList(depth, 'asks', []);
            const bids = this.safeList(depth, 'bids', []);
            this.handleDeltas(currentOrderBook['asks'], asks);
            this.handleDeltas(currentOrderBook['bids'], bids);
            currentOrderBook['nonce'] = timestamp;
            currentOrderBook['timestamp'] = timestamp;
            currentOrderBook['datetime'] = this.iso8601(timestamp);
            this.orderbooks[symbol] = currentOrderBook;
        }
        // this.checkOrderBookChecksum (this.orderbooks[symbol]);
        client.resolve(this.orderbooks[symbol], messageHash);
    }
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
     * @param {bool} [params.trigger] if the orders to watch are trigger orders or not
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const trigger = this.safeBool2(params, 'trigger', 'stop');
        params = this.omit(params, ['trigger', 'stop']);
        let messageHash = 'orders';
        let market = undefined;
        let marketList = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchOrders', market, params, 'spot');
        await this.authenticate(type);
        if (symbol !== undefined) {
            marketList = [market['id']];
            messageHash += ':' + symbol;
        }
        else {
            marketList = [];
            if (type === 'spot') {
                messageHash += ':spot';
            }
            else {
                messageHash += ':swap';
            }
        }
        let method = undefined;
        if (trigger) {
            method = 'stop.subscribe';
        }
        else {
            method = 'order.subscribe';
        }
        const message = {
            'method': method,
            'params': { 'market_list': marketList },
            'id': this.requestId(),
        };
        const url = this.urls['api']['ws'][type];
        const request = this.deepExtend(message, params);
        const orders = await this.watch(url, messageHash, request, messageHash, request);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrders(client, message) {
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
        const data = this.safeDict(message, 'data', {});
        const order = this.safeDict2(data, 'order', 'stop', {});
        const parsedOrder = this.parseWsOrder(order);
        const symbol = parsedOrder['symbol'];
        const market = this.market(symbol);
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const orders = this.orders;
        orders.append(parsedOrder);
        let messageHash = 'orders';
        const messageWithType = messageHash + ':' + market['type'];
        client.resolve(this.orders, messageWithType);
        messageHash += ':' + symbol;
        client.resolve(this.orders, messageHash);
    }
    parseWsOrder(order, market = undefined) {
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
        const timestamp = this.safeInteger(order, 'created_at');
        const marketId = this.safeString(order, 'market');
        const status = this.safeString(order, 'status');
        const isSpot = ('margin_market' in order);
        const defaultType = isSpot ? 'spot' : 'swap';
        market = this.safeMarket(marketId, market, undefined, defaultType);
        let fee = undefined;
        const feeCost = this.omitZero(this.safeString2(order, 'fee', 'quote_ccy_fee'));
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString(order, 'fee_ccy', market['quote']);
            fee = {
                'currency': this.safeCurrencyCode(feeCurrencyId),
                'cost': feeCost,
            };
        }
        return this.safeOrder({
            'info': order,
            'id': this.safeString2(order, 'order_id', 'stop_id'),
            'clientOrderId': this.safeString(order, 'client_id'),
            'datetime': this.iso8601(timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': this.safeInteger(order, 'updated_at'),
            'symbol': market['symbol'],
            'type': this.safeString(order, 'type'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString(order, 'side'),
            'price': this.safeString(order, 'price'),
            'stopPrice': this.safeString(order, 'trigger_price'),
            'triggerPrice': this.safeString(order, 'trigger_price'),
            'amount': this.safeString(order, 'amount'),
            'filled': this.safeString2(order, 'filled_amount', 'fill_value'),
            'remaining': this.safeString2(order, 'unfilled_amount', 'unfill_amount'),
            'cost': undefined,
            'average': undefined,
            'status': this.parseWsOrderStatus(status),
            'fee': fee,
            'trades': undefined,
        }, market);
    }
    parseWsOrderStatus(status) {
        const statuses = {
            'active_success': 'open',
            'active_fail': 'canceled',
            'cancel': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name coinex#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.coinex.com/api/v2/spot/market/ws/market-bbo
     * @see https://docs.coinex.com/api/v2/futures/market/ws/market-bbo
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const marketIds = this.marketIds(symbols);
        const messageHashes = [];
        let market = undefined;
        const symbolsDefined = (symbols !== undefined);
        if (symbolsDefined) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                market = this.market(symbol);
                messageHashes.push('bidsasks:' + market['symbol']);
            }
        }
        else {
            messageHashes.push('bidsasks');
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchBidsAsks', market, params);
        const url = this.urls['api']['ws'][type];
        const subscriptionHashes = ['all@bidsasks'];
        const subscribe = {
            'method': 'bbo.subscribe',
            'params': { 'market_list': marketIds },
            'id': this.requestId(),
        };
        const result = await this.watchMultiple(url, messageHashes, this.deepExtend(subscribe, params), subscriptionHashes);
        if (this.newUpdates) {
            return result;
        }
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    handleBidAsk(client, message) {
        //
        //     {
        //         "method": "bbo.update",
        //         "data": {
        //             "market": "BTCUSDT",
        //             "updated_at": 1656660154,
        //             "best_bid_price": "20000",
        //             "best_bid_size": "0.1",
        //             "best_ask_price": "20001",
        //             "best_ask_size": "0.15"
        //         },
        //         "id": null
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const parsedTicker = this.parseWsBidAsk(data);
        const symbol = parsedTicker['symbol'];
        this.bidsasks[symbol] = parsedTicker;
        const messageHash = 'bidsasks:' + symbol;
        client.resolve(parsedTicker, messageHash);
    }
    parseWsBidAsk(ticker, market = undefined) {
        //
        //     {
        //         "market": "BTCUSDT",
        //         "updated_at": 1656660154,
        //         "best_bid_price": "20000",
        //         "best_bid_size": "0.1",
        //         "best_ask_price": "20001",
        //         "best_ask_size": "0.15"
        //     }
        //
        const defaultType = this.safeString(this.options, 'defaultType');
        const marketId = this.safeString(ticker, 'market');
        market = this.safeMarket(marketId, market, undefined, defaultType);
        const timestamp = this.safeInteger(ticker, 'updated_at');
        return this.safeTicker({
            'symbol': this.safeSymbol(marketId, market, undefined, defaultType),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'ask': this.safeNumber(ticker, 'best_ask_price'),
            'askVolume': this.safeNumber(ticker, 'best_ask_size'),
            'bid': this.safeNumber(ticker, 'best_bid_price'),
            'bidVolume': this.safeNumber(ticker, 'best_bid_size'),
            'info': ticker,
        }, market);
    }
    handleMessage(client, message) {
        const method = this.safeString(message, 'method');
        const error = this.safeString(message, 'message');
        if (error !== undefined) {
            this.handleErrors(undefined, undefined, client.url, method, undefined, this.json(error), message, undefined, undefined);
        }
        const handlers = {
            'state.update': this.handleTicker,
            'balance.update': this.handleBalance,
            'deals.update': this.handleTrades,
            'user_deals.update': this.handleMyTrades,
            'depth.update': this.handleOrderBook,
            'order.update': this.handleOrders,
            'stop.update': this.handleOrders,
            'bbo.update': this.handleBidAsk,
        };
        const handler = this.safeValue(handlers, method);
        if (handler !== undefined) {
            handler.call(this, client, message);
            return;
        }
        this.handleSubscriptionStatus(client, message);
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        //
        //     { "id": 1, "code": 20001, "message": "invalid argument" }
        //     { "id": 2, "code": 21001, "message": "require auth" }
        //     { "id": 1, "code": 21002, "message": "Signature Incorrect" }
        //
        const message = this.safeStringLower(response, 'message');
        const isErrorMessage = (message !== undefined) && (message !== 'ok');
        const errorCode = this.safeString(response, 'code');
        const isErrorCode = (errorCode !== undefined) && (errorCode !== '0');
        if (isErrorCode || isErrorMessage) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
    handleAuthenticationMessage(client, message) {
        //
        // success
        //
        //     {
        //         "id": 1,
        //         "code": 0,
        //         "message": "OK"
        //     }
        //
        // fail
        //
        //     {
        //         "id": 1,
        //         "code": 21002,
        //         "message": ""
        //     }
        //
        const status = this.safeStringLower(message, 'message');
        const errorCode = this.safeString(message, 'code');
        const messageHash = 'authenticated';
        if ((status === 'ok') || (errorCode === '0')) {
            const future = this.safeValue(client.futures, messageHash);
            future.resolve(true);
        }
        else {
            const error = new errors.AuthenticationError(this.json(message));
            client.reject(error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
    }
    handleSubscriptionStatus(client, message) {
        const id = this.safeInteger(message, 'id');
        const subscription = this.safeValue(client.subscriptions, id);
        if (subscription !== undefined) {
            const futureIndex = this.safeString(subscription, 'future');
            const future = this.safeValue(client.futures, futureIndex);
            if (future !== undefined) {
                future.resolve(true);
            }
            delete client.subscriptions[id];
        }
    }
    async authenticate(type) {
        const url = this.urls['api']['ws'][type];
        const client = this.client(url);
        const time = this.milliseconds();
        const timestamp = time.toString();
        const messageHash = 'authenticated';
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated !== undefined) {
            return await future;
        }
        const requestId = this.requestId();
        const subscribe = {
            'id': requestId,
            'future': messageHash,
        };
        const hmac = this.hmac(this.encode(timestamp), this.encode(this.secret), sha256.sha256, 'hex');
        const request = {
            'id': requestId,
            'method': 'server.sign',
            'params': {
                'access_id': this.apiKey,
                'signed_str': hmac.toLowerCase(),
                'timestamp': time,
            },
        };
        this.watch(url, messageHash, request, requestId, subscribe);
        client.subscriptions[messageHash] = true;
        return await future;
    }
}

module.exports = coinex;
