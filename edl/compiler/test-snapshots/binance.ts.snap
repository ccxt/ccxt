import { Exchange } from './base/Exchange.js';
import type { Dict, Int, Num, Str, Ticker, Trade, Order, Balances, Market } from './base/types.js';

export default class Binance extends Exchange {

    /**
     * Returns the exchange description object
     *
     * @returns {object} Exchange configuration
     */
    describe (): object {
        return this.deepExtend (super.describe (), {
            'id': 'binance',
            'name': 'Binance',
            'countries': [],
            'rateLimit': 50,
            'version': 'v3',
            'certified': true,
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api': {
                    'public': 'https://api.binance.com/api/v3',
                    'private': 'https://api.binance.com/api/v3',
                    'sapi': 'https://api.binance.com/sapi/v1',
                    'fapiPublic': 'https://fapi.binance.com/fapi/v1',
                    'fapiPrivate': 'https://fapi.binance.com/fapi/v1',
                    'dapiPublic': 'https://dapi.binance.com/dapi/v1',
                    'dapiPrivate': 'https://dapi.binance.com/dapi/v1',
                    'eapiPublic': 'https://eapi.binance.com/eapi/v1',
                    'eapiPrivate': 'https://eapi.binance.com/eapi/v1',
                },
                'test': {
                    'public': 'https://testnet.binance.vision/api/v3',
                    'private': 'https://testnet.binance.vision/api/v3',
                    'fapiPublic': 'https://testnet.binancefuture.com/fapi/v1',
                    'fapiPrivate': 'https://testnet.binancefuture.com/fapi/v1',
                    'dapiPublic': 'https://testnet.binancefuture.com/dapi/v1',
                    'dapiPrivate': 'https://testnet.binancefuture.com/dapi/v1',
                },
                'www': 'https://www.binance.com',
                'doc': ['https://binance-docs.github.io/apidocs/spot/en'],
                'fees': 'https://www.binance.com/en/fee/trading',
                'referral': 'https://www.binance.com/en/register?ref=D7YA7CLY',
            },
            'api': {
                'public': {
                    'get': [
                        'ping',
                        'time',
                        'exchangeInfo',
                        'depth',
                        'trades',
                        'historicalTrades',
                        'aggTrades',
                        'klines',
                        'avgPrice',
                        'ticker/24hr',
                        'ticker/tradingDay',
                        'ticker/price',
                        'ticker/bookTicker',
                        'ticker',
                    ],
                },
                'private': {
                    'get': ['account', 'myTrades', 'openOrders', 'allOrders', 'order'],
                    'post': ['order', 'order/test'],
                    'delete': ['order', 'openOrders'],
                },
            },
            'has': {
                'CORS': null,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': true,
                'fetchTicker': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchDepositAddress': true,
                'fetchTime': true,
                'fetchOrderBook': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'cancelAllOrders': true,
                'publicAPI': true,
                'privateAPI': true,
                'sandbox': true,
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchStatus': true,
                'fetchBidsAsks': true,
                'fetchLastPrices': true,
                'fetchMarkPrice': true,
                'fetchIndexPrice': true,
                'fetchFundingRate': true,
                'fetchFundingRates': true,
                'fetchFundingRateHistory': true,
                'fetchFundingHistory': true,
                'createOrders': true,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createTakeProfitOrder': true,
                'createOrderWs': true,
                'cancelOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrderWs': true,
                'editOrder': true,
                'fetchBalanceWs': true,
                'fetchAccountPositions': true,
                'fetchPositions': true,
                'fetchPositionsRisk': true,
                'fetchOpenOrdersWs': true,
                'fetchClosedOrders': true,
                'fetchOrderWs': true,
                'fetchMyTradesWs': true,
                'fetchTransactions': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': true,
                'withdraw': true,
                'transfer': true,
                'fetchTransfers': true,
                'fetchBorrowRates': true,
                'fetchBorrowRate': true,
                'fetchBorrowInterest': true,
                'borrowMargin': true,
                'repayMargin': true,
                'setMarginMode': true,
                'setLeverage': true,
                'fetchLeverage': true,
                'fetchLeverages': true,
                'addMargin': true,
                'reduceMargin': true,
            },
            'timeframes': {
                '1s': '1s',
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': false,
                'login': false,
                'password': false,
                'twofa': false,
                'privateKey': false,
                'walletAddress': false,
                'token': false,
            },
        });
    }

    /**
     * Parse ticker response
     *
     * @param {object} response API response
     * @returns {object} Parsed ticker
     */
    parseTicker (response: any, market?: any) {
        const rawData = response;
        const marketId = market ? market.id : undefined;
        const marketType = market ? market.type : undefined;
        const data = response;
        const result = {
            'timestamp': this.safeInteger (data, 'closeTime'),
            'high': this.safeNumber (data, 'highPrice'),
            'low': this.safeNumber (data, 'lowPrice'),
            'bid': this.safeNumber (data, 'bidPrice'),
            'bidVolume': this.safeNumber (data, 'bidQty'),
            'ask': this.safeNumber (data, 'askPrice'),
            'askVolume': this.safeNumber (data, 'askQty'),
            'vwap': this.safeNumber (data, 'weightedAvgPrice'),
            'open': this.safeNumber (data, 'openPrice'),
            'close': this.safeNumber (data, 'lastPrice'),
            'last': this.safeNumber (data, 'lastPrice'),
            'previousClose': this.safeNumber (data, 'prevClosePrice'),
            'change': this.safeNumber (data, 'priceChange'),
            'percentage': this.safeNumber (data, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeNumber (data, 'volume'),
            'quoteVolume': this.safeNumber (data, 'quoteVolume'),
            'info': response,
        };
        result.symbol = this.safeSymbol(marketId, market, undefined, marketType);
        result.datetime = this.iso8601(result.timestamp);
        return result;
    }

    /**
     * Parse order response
     *
     * @param {object} response API response
     * @returns {object} Parsed order
     */
    parseOrder (response: any, market?: any) {
        const rawData = response;
        const marketId = market ? market.id : undefined;
        const marketType = market ? market.type : undefined;
        const data = response;
        const result = {
            'id': this.safeString (data, 'orderId'),
            'clientOrderId': (this.safeValue (data, 'clientOrderId') !== undefined ? this.safeValue (data, 'clientOrderId') : null),
            'timestamp': this.safeInteger (data, 'time'),
            'lastTradeTimestamp': this.safeInteger (data, 'updateTime'),
            'type': this.safeStringLower (data, 'type'),
            'timeInForce': (this.safeValue (data, 'timeInForce') !== undefined ? this.safeValue (data, 'timeInForce') : null),
            'side': this.safeStringLower (data, 'side'),
            'price': this.safeNumber (data, 'price'),
            'stopPrice': this.safeNumber (data, 'stopPrice'),
            'triggerPrice': this.safeNumber (data, 'stopPrice'),
            'amount': this.safeNumber (data, 'origQty'),
            'cost': this.safeNumber (data, 'cummulativeQuoteQty'),
            'average': this.safeNumber (data, 'avgPrice'),
            'filled': this.safeNumber (data, 'executedQty'),
            'status': this.safeString ({
                ''NEW'': 'open',
                ''PARTIALLY_FILLED'': 'open',
                ''FILLED'': 'closed',
                ''CANCELED'': 'canceled',
                ''PENDING_CANCEL'': 'canceled',
                ''REJECTED'': 'rejected',
                ''EXPIRED'': 'expired',
                ''EXPIRED_IN_MATCH'': 'expired',
            }, (this.safeValue (data, 'status') !== undefined ? this.safeValue (data, 'status') : null)),
            'fee': undefined,
            'trades': undefined,
            'reduceOnly': (this.safeValue (data, 'reduceOnly') !== undefined ? this.safeValue (data, 'reduceOnly') : null),
            'info': response,
        };
        result.datetime = this.iso8601(result.timestamp);
        result.symbol = this.safeSymbol(marketId, market, undefined, marketType);
        result.postOnly = (result.type === 'limit_maker') || (result.timeInForce === 'PO');
        result.remaining = result.amount - result.filled;
        return result;
    }

    /**
     * Parse trade response
     *
     * @param {object} response API response
     * @returns {object} Parsed trade
     */
    parseTrade (response: any, market?: any) {
        const rawData = response;
        const marketId = market ? market.id : undefined;
        const marketType = market ? market.type : undefined;
        const data = response;
        const result = {
            'id': this.safeString (data, 'id'),
            'order': this.safeString (data, 'orderId'),
            'timestamp': this.safeInteger (data, 'time'),
            'type': undefined,
            'side': (this.safeValue (data, 'isBuyer') !== undefined ? this.safeValue (data, 'isBuyer') : null) ? 'buy' : 'sell',
            'takerOrMaker': (this.safeValue (data, 'isMaker') !== undefined ? this.safeValue (data, 'isMaker') : null) ? 'maker' : 'taker',
            'price': this.safeNumber (data, 'price'),
            'amount': this.safeNumber (data, 'qty'),
            'cost': this.safeNumber (data, 'quoteQty'),
            'fee': this.safeNumber (data, 'commission'),
            'feeCurrency': (this.safeCurrencyCode (this.safeValue (data, 'commissionAsset')) !== undefined ? this.safeCurrencyCode (this.safeValue (data, 'commissionAsset')) : null),
            'info': response,
        };
        result.datetime = this.iso8601(result.timestamp);
        result.symbol = this.safeSymbol(marketId, market, undefined, marketType);
        return result;
    }

    /**
     * Parse balance response
     *
     * @param {object} response API response
     * @returns {object} Parsed balance
     */
    parseBalance (response: any, market?: any) {
        const rawData = response;
        const data = this.safeValue (response, 'balances', {});
        const items = Array.isArray (data) ? data : data == null ? [] : [data];
        const balances = items.map ((item) => {
            const entry = {
                'currency': (this.safeCurrencyCode (this.safeValue (item, 'asset')) !== undefined ? this.safeCurrencyCode (this.safeValue (item, 'asset')) : null),
                'free': this.safeNumber (item, 'free'),
                'used': this.safeNumber (item, 'locked'),
            };
            entry.total = entry.free + entry.used;
            return entry;
        });
        const result = { 'info': rawData, 'timestamp': null, 'datetime': null };
        for (const balance of balances) {
            const currency = balance.currency;
            result[currency] = { 'free': balance.free, 'used': balance.used, 'total': balance.total };
        }
        return this.safeBalance (result);
    }

    /**
     * Parse market response
     *
     * @param {object} response API response
     * @returns {object} Parsed market
     */
    parseMarket (response: any, market?: any) {
        const rawData = response;
        const data = this.safeValue (response, 'symbols', {});
        const items = Array.isArray (data) ? data : data == null ? [] : [data];
        const results = items.map ((item) => {
            const entry = {
                'id': (this.safeValue (item, 'symbol') !== undefined ? this.safeValue (item, 'symbol') : null),
                'base': (this.safeCurrencyCode (this.safeValue (item, 'baseAsset')) !== undefined ? this.safeCurrencyCode (this.safeValue (item, 'baseAsset')) : null),
                'quote': (this.safeCurrencyCode (this.safeValue (item, 'quoteAsset')) !== undefined ? this.safeCurrencyCode (this.safeValue (item, 'quoteAsset')) : null),
                'baseId': (this.safeValue (item, 'baseAsset') !== undefined ? this.safeValue (item, 'baseAsset') : null),
                'quoteId': (this.safeValue (item, 'quoteAsset') !== undefined ? this.safeValue (item, 'quoteAsset') : null),
                'active': this.safeString ({ ''TRADING'': true }, (this.safeValue (item, 'status') !== undefined ? this.safeValue (item, 'status') : false)),
                'type': 'spot',
                'spot': true,
                'margin': (this.safeValue (item, 'isMarginTradingAllowed') !== undefined ? this.safeValue (item, 'isMarginTradingAllowed') : null),
                'swap': false,
                'future': false,
                'option': false,
                'contract': false,
                'settle': null,
                'settleId': null,
                'contractSize': null,
                'linear': null,
                'inverse': null,
                'expiry': null,
                'expiryDatetime': null,
                'strike': null,
                'optionType': null,
                'precision': {},
                'limits': { 'amount': {}, 'price': {}, 'cost': { 'max': null } },
                'info': item,
            };
            entry.symbol = entry.base + '/' + entry.quote;
            entry.precision.amount = this.parseNumber(this.safeString(item, 'stepSize') || this.safeString(item.filters?.find(f => f.filterType === 'LOT_SIZE'), 'stepSize'));
            entry.precision.price = this.parseNumber(this.safeString(item, 'tickSize') || this.safeString(item.filters?.find(f => f.filterType === 'PRICE_FILTER'), 'tickSize'));
            entry.limits.amount.min = this.parseNumber(this.safeString(item, 'minQty') || this.safeString(item.filters?.find(f => f.filterType === 'LOT_SIZE'), 'minQty'));
            entry.limits.amount.max = this.parseNumber(this.safeString(item, 'maxQty') || this.safeString(item.filters?.find(f => f.filterType === 'LOT_SIZE'), 'maxQty'));
            entry.limits.price.min = this.parseNumber(this.safeString(item, 'minPrice') || this.safeString(item.filters?.find(f => f.filterType === 'PRICE_FILTER'), 'minPrice'));
            entry.limits.price.max = this.parseNumber(this.safeString(item, 'maxPrice') || this.safeString(item.filters?.find(f => f.filterType === 'PRICE_FILTER'), 'maxPrice'));
            entry.limits.cost.min = this.parseNumber(this.safeString(item, 'minNotional') || this.safeString(item.filters?.find(f => f.filterType === 'MIN_NOTIONAL'), 'minNotional'));
            return entry;
        });
        return results;
    }

    /**
     * Parse deposit response
     *
     * @param {object} response API response
     * @returns {object} Parsed deposit
     */
    parseDeposit (response: any, market?: any) {
        const rawData = response;
        const data = response;
        const result = {
            'id': (this.safeValue (data, 'orderNo') !== undefined ? this.safeValue (data, 'orderNo') : null),
            'type': 'deposit',
            'currency': this.safeCurrencyCode (this.safeValue2 (data, 'coin', 'fiatCurrency')),
            'amount': this.safeNumber (data, 'amount'),
            'status': this.safeString ({ ''0'': 'pending', ''1'': 'ok', ''3'': 'failed', ''6'': 'ok', ''Failed'': 'failed', ''Successful'': 'ok' }, (this.safeValue (data, 'status') !== undefined ? this.safeValue (data, 'status') : null)),
            'address': (this.safeValue (data, 'address') !== undefined ? this.safeValue (data, 'address') : null),
            'addressTo': (this.safeValue (data, 'address') !== undefined ? this.safeValue (data, 'address') : null),
            'addressFrom': null,
            'tagFrom': null,
            'network': (this.safeValue (data, 'network') !== undefined ? this.safeValue (data, 'network') : null),
            'comment': null,
            'info': data,
        };
        result.txid = this.parseTxId(this.safeString(data, 'txId'));
        result.tag = this.parseTag(this.safeString(data, 'addressTag'));
        result.tagTo = this.parseTag(this.safeString(data, 'addressTag'));
        result.timestamp = this.safeInteger2(data, 'insertTime', 'createTime');
        result.datetime = this.iso8601(result.timestamp);
        result.updated = (this.safeInteger2(data, 'successTime', 'updateTime') !== undefined ? (this.safeInteger2(data, 'successTime', 'updateTime') : null);
        result.internal = this.parseInternal(this.safeInteger(data, 'transferType'));
        result.fee = this.parseTransactionFee(this.safeNumber2(data, 'transactionFee', 'totalFee'), result.currency);
        return result;
    }

    /**
     * Parse withdrawal response
     *
     * @param {object} response API response
     * @returns {object} Parsed withdrawal
     */
    parseWithdrawal (response: any, market?: any) {
        const rawData = response;
        const data = response;
        const result = {
            'id': (this.safeValue2 (data, 'id', 'orderNo') !== undefined ? this.safeValue2 (data, 'id', 'orderNo') : null),
            'type': 'withdrawal',
            'currency': this.safeCurrencyCode (this.safeValue2 (data, 'coin', 'fiatCurrency')),
            'amount': this.safeNumber (data, 'amount'),
            'status': this.safeString ({
                ''0'': 'pending',
                ''1'': 'canceled',
                ''2'': 'pending',
                ''3'': 'failed',
                ''4'': 'pending',
                ''5'': 'failed',
                ''6'': 'ok',
                ''Successful'': 'ok',
                ''Failed'': 'failed',
            }, (this.safeValue (data, 'status') !== undefined ? this.safeValue (data, 'status') : null)),
            'address': (this.safeValue (data, 'address') !== undefined ? this.safeValue (data, 'address') : null),
            'addressTo': (this.safeValue (data, 'address') !== undefined ? this.safeValue (data, 'address') : null),
            'addressFrom': null,
            'tagFrom': null,
            'network': (this.safeValue (data, 'network') !== undefined ? this.safeValue (data, 'network') : null),
            'comment': null,
            'info': data,
        };
        result.txid = this.parseTxId(this.safeString(data, 'txId'));
        result.tag = this.parseTag(this.safeString(data, 'addressTag'));
        result.tagTo = this.parseTag(this.safeString(data, 'addressTag'));
        result.timestamp = this.parseTransactionTimestamp(this.safeInteger2(data, 'insertTime', 'createTime'), this.safeString(data, 'applyTime'));
        result.datetime = this.iso8601(result.timestamp);
        result.updated = (this.safeInteger2(data, 'successTime', 'updateTime') !== undefined ? (this.safeInteger2(data, 'successTime', 'updateTime') : null);
        result.internal = this.parseInternal(this.safeInteger(data, 'transferType'));
        result.fee = this.parseTransactionFee(this.safeNumber2(data, 'transactionFee', 'totalFee'), result.currency);
        return result;
    }

    /**
     * Parse depositAddress response
     *
     * @param {object} response API response
     * @returns {object} Parsed depositAddress
     */
    parseDepositAddress (response: any, market?: any) {
        const rawData = response;
        const data = response;
        const result = {
            'currency': (this.safeCurrencyCode (this.safeValue (data, 'coin')) !== undefined ? this.safeCurrencyCode (this.safeValue (data, 'coin')) : null),
            'address': (this.safeValue (data, 'address') !== undefined ? this.safeValue (data, 'address') : null),
            'tag': (this.safeValue (data, 'tag') !== undefined ? this.safeValue (data, 'tag') : null),
            'network': (this.safeValue (data, 'network') !== undefined ? this.safeValue (data, 'network') : null),
            'info': response,
        };
        return result;
    }

    /**
     * Fetch ticker for a symbol
     *
     * @param {string} symbol Unified symbol
     * @param {object} params Extra parameters
     * @returns {Ticker} Ticker structure
     */
    async fetchTicker (symbol: string, params: object = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = { 'symbol': market.id };
        const response = await this.publicGetTicker24hr (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    /**
     * Fetch recent trades for a symbol
     *
     * @param {string} symbol Unified symbol
     * @param {number} since Timestamp in ms
     * @param {number} limit Max number of trades
     * @param {object} params Extra parameters
     * @returns {Trade[]} Array of trades
     */
    async fetchTrades (symbol: string, since?: number, limit?: number, params: object = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = { 'symbol': market.id };
        const response = await this.privateGetMyTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * Calls the public GET ping endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetPing (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('ping', 'public', 'GET', params, undefined, undefined, { 'cost': 0.2 }, context);
    }

    /**
     * Calls the public GET time endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetTime (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('time', 'public', 'GET', params, undefined, undefined, { 'cost': 0.2 }, context);
    }

    /**
     * Calls the public GET exchangeInfo endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetExchangeInfo (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('exchangeInfo', 'public', 'GET', params, undefined, undefined, { 'cost': 4 }, context);
    }

    /**
     * Calls the public GET depth endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetDepth (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('publicGetDepth', params.symbol, 'symbol');
        return await this.request ('depth', 'public', 'GET', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the public GET trades endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetTrades (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('publicGetTrades', params.symbol, 'symbol');
        return await this.request ('trades', 'public', 'GET', params, undefined, undefined, { 'cost': 2 }, context);
    }

    /**
     * Calls the public GET historicalTrades endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetHistoricalTrades (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('publicGetHistoricalTrades', params.symbol, 'symbol');
        return await this.request ('historicalTrades', 'public', 'GET', params, undefined, undefined, { 'cost': 10 }, context);
    }

    /**
     * Calls the public GET aggTrades endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetAggTrades (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('publicGetAggTrades', params.symbol, 'symbol');
        return await this.request ('aggTrades', 'public', 'GET', params, undefined, undefined, { 'cost': 2 }, context);
    }

    /**
     * Calls the public GET klines endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetKlines (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('publicGetKlines', params.symbol, 'symbol');
        this.checkRequiredArgument ('publicGetKlines', params.interval, 'interval');
        return await this.request ('klines', 'public', 'GET', params, undefined, undefined, { 'cost': 2 }, context);
    }

    /**
     * Calls the public GET avgPrice endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetAvgPrice (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('publicGetAvgPrice', params.symbol, 'symbol');
        return await this.request ('avgPrice', 'public', 'GET', params, undefined, undefined, { 'cost': 0.2 }, context);
    }

    /**
     * Calls the public GET ticker/24hr endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetTicker24hr (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('ticker/24hr', 'public', 'GET', params, undefined, undefined, { 'cost': 0.4 }, context);
    }

    /**
     * Calls the public GET ticker/tradingDay endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetTickerTradingDay (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('ticker/tradingDay', 'public', 'GET', params, undefined, undefined, { 'cost': 0.8 }, context);
    }

    /**
     * Calls the public GET ticker/price endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetTickerPrice (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('ticker/price', 'public', 'GET', params, undefined, undefined, { 'cost': 0.2 }, context);
    }

    /**
     * Calls the public GET ticker/bookTicker endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetTickerBookTicker (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('ticker/bookTicker', 'public', 'GET', params, undefined, undefined, { 'cost': 0.2 }, context);
    }

    /**
     * Calls the public GET ticker endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetTicker (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('ticker', 'public', 'GET', params, undefined, undefined, { 'cost': 0.4 }, context);
    }

    /**
     * Calls the private GET account endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privateGetAccount (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('account', 'private', 'GET', params, undefined, undefined, { 'cost': 4 }, context);
    }

    /**
     * Calls the private GET myTrades endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privateGetMyTrades (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privateGetMyTrades', params.symbol, 'symbol');
        return await this.request ('myTrades', 'private', 'GET', params, undefined, undefined, { 'cost': 4 }, context);
    }

    /**
     * Calls the private GET openOrders endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privateGetOpenOrders (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('openOrders', 'private', 'GET', params, undefined, undefined, { 'cost': 1.2 }, context);
    }

    /**
     * Calls the private GET allOrders endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privateGetAllOrders (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privateGetAllOrders', params.symbol, 'symbol');
        return await this.request ('allOrders', 'private', 'GET', params, undefined, undefined, { 'cost': 4 }, context);
    }

    /**
     * Calls the private GET order endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privateGetOrder (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privateGetOrder', params.symbol, 'symbol');
        return await this.request ('order', 'private', 'GET', params, undefined, undefined, { 'cost': 0.8 }, context);
    }

    /**
     * Calls the private POST order endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostOrder (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostOrder', params.symbol, 'symbol');
        this.checkRequiredArgument ('privatePostOrder', params.side, 'side');
        this.checkRequiredArgument ('privatePostOrder', params.type, 'type');
        if (["LIMIT", "STOP_LOSS_LIMIT", "TAKE_PROFIT_LIMIT"].includes(params.type)) {
            this.checkRequiredArgument ('privatePostOrder', params.price, 'price');
        }
        if (["STOP_LOSS", "STOP_LOSS_LIMIT", "TAKE_PROFIT", "TAKE_PROFIT_LIMIT"].includes(params.type)) {
            this.checkRequiredArgument ('privatePostOrder', params.stopPrice, 'stopPrice');
        }
        return await this.request ('order', 'private', 'POST', params, undefined, undefined, { 'cost': 0.2 }, context);
    }

    /**
     * Calls the private POST order/test endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostOrderTest (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostOrderTest', params.symbol, 'symbol');
        this.checkRequiredArgument ('privatePostOrderTest', params.side, 'side');
        this.checkRequiredArgument ('privatePostOrderTest', params.type, 'type');
        return await this.request ('order/test', 'private', 'POST', params, undefined, undefined, { 'cost': 0.2 }, context);
    }

    /**
     * Calls the private DELETE order endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privateDeleteOrder (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privateDeleteOrder', params.symbol, 'symbol');
        return await this.request ('order', 'private', 'DELETE', params, undefined, undefined, { 'cost': 0.2 }, context);
    }

    /**
     * Calls the private DELETE openOrders endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privateDeleteOpenOrders (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privateDeleteOpenOrders', params.symbol, 'symbol');
        return await this.request ('openOrders', 'private', 'DELETE', params, undefined, undefined, { 'cost': 0.2 }, context);
    }

    /**
     * @method
     * @name binance#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'future', 'delivery', 'savings', 'funding', or 'spot' or 'papi'
     * @param {string} [params.marginMode] 'cross' or 'isolated', for margin trading
     * @param {string[]|undefined} [params.symbols] unified market symbols, only used in isolated margin mode
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the balance for a portfolio margin account
     * @param {string} [params.subType] 'linear' or 'inverse'
     * @returns {object} a balance structure
     */
    async fetchBalance ( params = {}): Promise<Balances> {
        await this.loadMarkets();
        const defaultType = this.safeString2(this.options, 'fetchBalance', 'defaultType', 'spot');
        let type = this.safeString(params, 'type', defaultType);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchBalance', undefined, params);
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchBalance', 'papi', 'portfolioMargin', false);
        let marginMode = undefined;
        let query = undefined;
        [marginMode, query] = this.handleMarginModeAndParams('fetchBalance', params);
        query = this.omit(query, 'type');
        let response = undefined;
        const request: Dict = {};

        // Route to appropriate endpoint based on type
        if (isPortfolioMargin || (type === 'papi')) {
            if (this.isLinear(type, subType)) {
                type = 'linear';
            } else if (this.isInverse(type, subType)) {
                type = 'inverse';
            }
            isPortfolioMargin = true;
            response = await this.papiGetBalance(this.extend(request, query));
        } else if (this.isLinear(type, subType)) {
            type = 'linear';
            let useV2 = undefined;
            [useV2, params] = this.handleOptionAndParams(params, 'fetchBalance', 'useV2', false);
            params = this.extend(request, query);
            if (!useV2) {
                response = await this.fapiPrivateV3GetAccount(params);
            } else {
                response = await this.fapiPrivateV2GetAccount(params);
            }
        } else if (this.isInverse(type, subType)) {
            type = 'inverse';
            response = await this.dapiPrivateGetAccount(this.extend(request, query));
        } else if (marginMode === 'isolated') {
            const paramSymbols = this.safeList(params, 'symbols');
            query = this.omit(query, 'symbols');
            if (paramSymbols !== undefined) {
                let symbols = '';
                if (Array.isArray(paramSymbols)) {
                    symbols = this.marketId(paramSymbols[0]);
                    for (let i = 1; i < paramSymbols.length; i++) {
                        const symbol = paramSymbols[i];
                        const id = this.marketId(symbol);
                        symbols += ',' + id;
                    }
                } else {
                    symbols = paramSymbols;
                }
                request['symbols'] = symbols;
            }
            response = await this.sapiGetMarginIsolatedAccount(this.extend(request, query));
        } else if ((type === 'margin') || (marginMode === 'cross')) {
            response = await this.sapiGetMarginAccount(this.extend(request, query));
        } else if (type === 'savings') {
            response = await this.sapiGetLendingUnionAccount(this.extend(request, query));
        } else if (type === 'funding') {
            response = await this.sapiPostAssetGetFundingAsset(this.extend(request, query));
        } else {
            response = await this.privateGetAccount(this.extend(request, query));
        }

        return this.parseBalanceCustom(response, type, marginMode, isPortfolioMargin);
    }

    /**
     * @method
     * @name binance#sign
     * @description sign API request with authentication credentials
     * @param {string} path endpoint path
     * @param {string} api api type (public/private/sapi/etc)
     * @param {string} method HTTP method
     * @param {object} params request parameters
     * @param {object} headers request headers
     * @param {object} body request body
     * @returns {object} signed request
     */
    sign (
        path: string,
        api = 'public',
        method = 'GET',
        params = {},
        headers: any = undefined,
        body: any = undefined
    ) {
        if (!(api in this.urls['api'])) {
            throw new this.NotSupported(this.id + ' does not have a testnet/sandbox URL for ' + api + ' endpoints');
        }
        let url = this.urls['api'][api];
        url += '/' + path;

        // Special handling for historicalTrades endpoint
        if (path === 'historicalTrades') {
            if (this.apiKey) {
                headers = {
                    'X-MBX-APIKEY': this.apiKey,
                };
            } else {
                throw new this.AuthenticationError(this.id + ' historicalTrades endpoint requires `apiKey` credential');
            }
        }

        // Special handling for userDataStream endpoints
        const userDataStream = (path === 'userDataStream') || (path === 'listenKey');
        if (userDataStream) {
            if (this.apiKey) {
                headers = {
                    'X-MBX-APIKEY': this.apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
                if (method !== 'GET') {
                    body = this.urlencode(params);
                }
            } else {
                throw new this.AuthenticationError(this.id + ' userDataStream endpoint requires `apiKey` credential');
            }
        } else if ((api === 'private') || (api === 'sapi' && path !== 'system/status') ||
                   (api === 'sapiV2') || (api === 'sapiV3') || (api === 'sapiV4') ||
                   (api === 'dapiPrivate') || (api === 'dapiPrivateV2') ||
                   (api === 'fapiPrivate') || (api === 'fapiPrivateV2') || (api === 'fapiPrivateV3') ||
                   (api === 'papi') || (api === 'papiV2' && path !== 'ping') ||
                   (api === 'eapiPrivate')) {
            this.checkRequiredCredentials();

            let query = undefined;
            const defaultRecvWindow = this.safeInteger(this.options, 'recvWindow');
            let extendedParams = this.extend({
                'timestamp': this.nonce(),
            }, params);

            if (defaultRecvWindow !== undefined) {
                extendedParams['recvWindow'] = defaultRecvWindow;
            }
            const recvWindow = this.safeInteger(params, 'recvWindow');
            if (recvWindow !== undefined) {
                extendedParams['recvWindow'] = recvWindow;
            }

            query = this.urlencode(extendedParams);

            // Generate signature - supports RSA, EdDSA, and HMAC
            let signature = undefined;
            if (this.secret.indexOf('PRIVATE KEY') > -1) {
                // RSA or EdDSA signature
                if (this.secret.length > 120) {
                    // RSA signature
                    signature = this.encodeURIComponent(this.rsa(query, this.secret, 'sha256'));
                } else {
                    // EdDSA signature
                    signature = this.encodeURIComponent(this.eddsa(this.encode(query), this.secret, 'ed25519'));
                }
            } else {
                // HMAC signature
                signature = this.hmac(this.encode(query), this.encode(this.secret), 'sha256');
            }

            query += '&signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };

            if ((method === 'GET') || (method === 'DELETE')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            // Public endpoints
            if (Object.keys(params).length) {
                url += '?' + this.urlencode(params);
            }
        }

        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    /**
     * @method
     * @name binance#parseTxId
     * @description Parse transaction ID, stripping 'Internal transfer ' prefix if present
     * @param {string|undefined} txid transaction ID from API
     * @returns {string|null} cleaned transaction ID
     */
    parseTxId ( txid: string | undefined): string | null {
        if (txid !== undefined && txid.indexOf('Internal transfer ') >= 0) {
            return txid.slice(18);
        }
        return txid !== undefined ? txid : null;
    }

    /**
     * @method
     * @name binance#parseTag
     * @description Parse address tag, returning null for empty strings
     * @param {string|undefined} tag address tag from API
     * @returns {string|null} tag or null if empty
     */
    parseTag ( tag: string | undefined): string | null {
        return (tag !== undefined && tag.length > 0) ? tag : null;
    }

    /**
     * @method
     * @name binance#parseInternal
     * @description Parse internal transfer flag from transferType
     * @param {number|undefined} transferType transfer type from API
     * @returns {boolean|null} true if internal transfer, false if external, null if unknown
     */
    parseInternal ( transferType: number | undefined): boolean | null {
        return transferType !== undefined ? (transferType !== 0) : null;
    }

    /**
     * @method
     * @name binance#parseTransactionFee
     * @description Parse transaction fee into fee object
     * @param {number|undefined} feeCost fee cost from API
     * @param {string} currency currency code
     * @returns {object|null} fee object with currency and cost, or null if undefined
     */
    parseTransactionFee ( feeCost: number | undefined, currency: string): { currency: string, cost: number } | null {
        if (feeCost !== undefined) {
            return { currency: currency, cost: feeCost };
        }
        return null;
    }

    /**
     * @method
     * @name binance#parseTransactionTimestamp
     * @description Parse transaction timestamp with fallback to applyTime
     * @param {number|undefined} timestamp timestamp in milliseconds
     * @param {string|undefined} applyTime ISO8601 timestamp string
     * @returns {number|undefined} timestamp in milliseconds
     */
    parseTransactionTimestamp ( timestamp: number | undefined, applyTime: string | undefined): number | undefined {
        if (timestamp === undefined) {
            return this.parse8601(applyTime);
        }
        return timestamp;
    }
}
