'use strict';

// ----------------------------------------------------------------------------------------------------------------------------
// This file contains all methods part of the Exchange instance that do not have an exchange-specific implementation
// thus can be transpiled to the other languages. Since they are part of the Exchange instance (at runtime),
// they can make use of the 'this' and access everything that defined in the Exchange class (options, methods, etc).
//
// Warning: Every method here needs to have the 'function' identifier in the signature.
// Warning: Do not declare classes or global variables in here
// Warning: Every time a method is added, don't forget to add it to module.exports as well
// -----------------------------------------------------------------------------------------------------------------------------

const { ArgumentsRequired, BadSymbol, NotSupported, NullResponse, InvalidOrder } = require ('../errors');

function handleMarketTypeAndParams (methodName, market = undefined, params = {}) {
    const defaultType = this.safeString2 (this.options, 'defaultType', 'type', 'spot');
    const methodOptions = this.safeValue (this.options, methodName);
    let methodType = defaultType;
    if (methodOptions !== undefined) {
        if (typeof methodOptions === 'string') {
            methodType = methodOptions;
        } else {
            methodType = this.safeString2 (methodOptions, 'defaultType', 'type', methodType);
        }
    }
    const marketType = (market === undefined) ? methodType : market['type'];
    const type = this.safeString2 (params, 'defaultType', 'type', marketType);
    params = this.omit (params, [ 'defaultType', 'type' ]);
    return [ type, params ];
}

function handleWithdrawTagAndParams (tag, params) {
    if (typeof tag === 'object') {
        params = this.extend (tag, params);
        tag = undefined;
    }
    if (tag === undefined) {
        tag = this.safeString (params, 'tag');
        if (tag !== undefined) {
            params = this.omit (params, 'tag');
        }
    }
    return [ tag, params ];
}

async function fetchFundingRate (symbol, params = {}) {
    if (this.has['fetchFundingRates']) {
        const market = await this.market (symbol);
        if (!market['contract']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() supports contract markets only');
        }
        const rates = await this.fetchFundingRates ([ symbol ], params);
        const rate = this.safeValue (rates, symbol);
        if (rate === undefined) {
            throw new NullResponse (this.id + ' fetchFundingRate () returned no data for ' + symbol);
        } else {
            return rate;
        }
    } else {
        throw new NotSupported (this.id + ' fetchFundingRate () is not supported yet');
    }
}

async function fetchMarkOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
    /**
     * @description fetches historical mark price candlestick data containing the open, high, low, and close price of a market
     * @param {str} symbol unified symbol of the market to fetch OHLCV data for
     * @param {str} timeframe the length of time each candle represents
     * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
     * @param {int|undefined} limit the maximum amount of candles to fetch
     * @param {dict} params extra parameters specific to the exchange api endpoint
     * @returns {[[int|float]]} A list of candles ordered as timestamp, open, high, low, close, undefined
     */
    if (this.has['fetchMarkOHLCV']) {
        const request = {
            'price': 'mark',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    } else {
        throw new NotSupported (this.id + ' fetchMarkOHLCV () is not supported yet');
    }
}

async function fetchIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
    /**
     * @description fetches historical index price candlestick data containing the open, high, low, and close price of a market
     * @param {str} symbol unified symbol of the market to fetch OHLCV data for
     * @param {str} timeframe the length of time each candle represents
     * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
     * @param {int|undefined} limit the maximum amount of candles to fetch
     * @param {dict} params extra parameters specific to the exchange api endpoint
     * @returns {[[int|float]]} A list of candles ordered as timestamp, open, high, low, close, undefined
     */
    if (this.has['fetchIndexOHLCV']) {
        const request = {
            'price': 'index',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    } else {
        throw new NotSupported (this.id + ' fetchIndexOHLCV () is not supported yet');
    }
}

async function fetchPremiumIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
    /**
     * @description fetches historical premium index price candlestick data containing the open, high, low, and close price of a market
     * @param {str} symbol unified symbol of the market to fetch OHLCV data for
     * @param {str} timeframe the length of time each candle represents
     * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
     * @param {int|undefined} limit the maximum amount of candles to fetch
     * @param {dict} params extra parameters specific to the exchange api endpoint
     * @return {[[int|float]]} A list of candles ordered as timestamp, open, high, low, close, undefined
     */
    if (this.has['fetchPremiumIndexOHLCV']) {
        const request = {
            'price': 'premiumIndex',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    } else {
        throw new NotSupported (this.id + ' fetchPremiumIndexOHLCV () is not supported yet');
    }
}

function isPostOnly (isMarketOrder, exchangeSpecificParam, params = {}) {
    /**
     * @ignore
     * @method
     * @param {string} type Order type
     * @param {boolean} exchangeSpecificParam exchange specific postOnly
     * @param {dict} params exchange specific params
     * @returns {boolean} true if a post only order, false otherwise
     */
    const timeInForce = this.safeStringUpper (params, 'timeInForce');
    let postOnly = this.safeValue2 (params, 'postOnly', 'post_only', false);
    // we assume timeInForce is uppercase from safeStringUpper (params, 'timeInForce')
    const ioc = timeInForce === 'IOC';
    const fok = timeInForce === 'FOK';
    const timeInForcePostOnly = timeInForce === 'PO';
    postOnly = postOnly || timeInForcePostOnly || exchangeSpecificParam;
    if (postOnly) {
        if (ioc || fok) {
            throw new InvalidOrder (this.id + ' postOnly orders cannot have timeInForce equal to ' + timeInForce);
        } else if (isMarketOrder) {
            throw new InvalidOrder (this.id + ' market orders cannot be postOnly');
        } else {
            return true;
        }
    } else {
        return false;
    }
}

async function loadTimeDifference (params = {}) {
    const serverTime = await this.fetchTime (params);
    const after = this.milliseconds ();
    this.options['timeDifference'] = after - serverTime;
    return this.options['timeDifference'];
}

function checkOrderArguments (market, type, side, amount, price, params) {
    if (price === undefined) {
        if (type === 'limit') {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for a limit order');
        }
    }
    if (amount <= 0) {
        throw new ArgumentsRequired (this.id + ' createOrder() amount should be above 0');
    }
}

function parseBorrowInterests (response, market = undefined) {
    const interest = [];
    for (let i = 0; i < response.length; i++) {
        const row = response[i];
        interest.push (this.parseBorrowInterest (row, market));
    }
    return interest;
}

function parseFundingRateHistories (response, market = undefined, since = undefined, limit = undefined) {
    const rates = [];
    for (let i = 0; i < response.length; i++) {
        const entry = response[i];
        rates.push (this.parseFundingRateHistory (entry, market));
    }
    const sorted = this.sortBy (rates, 'timestamp');
    const symbol = (market === undefined) ? undefined : market['symbol'];
    return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
}

function parseOpenInterests (response, market = undefined, since = undefined, limit = undefined) {
    const interests = [];
    for (let i = 0; i < response.length; i++) {
        const entry = response[i];
        const interest = this.parseOpenInterest (entry, market);
        interests.push (interest);
    }
    const sorted = this.sortBy (interests, 'timestamp');
    const symbol = this.safeString (market, 'symbol');
    return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
}

module.exports = {
    handleMarketTypeAndParams,
    handleWithdrawTagAndParams,
    fetchMarkOHLCV,
    fetchIndexOHLCV,
    fetchPremiumIndexOHLCV,
    fetchFundingRate,
    isPostOnly,
    loadTimeDifference,
    checkOrderArguments,
    parseBorrowInterests,
    parseFundingRateHistories,
    parseOpenInterests,
};
