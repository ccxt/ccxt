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

async function createPostOnlyOrder (symbol, type, side, amount, price, params = {}) {
    if (!this.has['createPostOnlyOrder']) {
        throw new NotSupported (this.id + 'createPostOnlyOrder() is not supported yet');
    }
    const query = this.extend (params, { 'postOnly': true });
    return await this.createOrder (symbol, type, side, amount, price, query);
}

async function createReduceOnlyOrder (symbol, type, side, amount, price, params = {}) {
    if (!this.has['createReduceOnlyOrder']) {
        throw new NotSupported (this.id + 'createReduceOnlyOrder() is not supported yet');
    }
    const query = this.extend (params, { 'reduceOnly': true });
    return await this.createOrder (symbol, type, side, amount, price, query);
}

async function createStopOrder (symbol, type, side, amount, price = undefined, stopPrice = undefined, params = {}) {
    if (!this.has['createStopOrder']) {
        throw new NotSupported (this.id + ' createStopOrder() is not supported yet');
    }
    if (stopPrice === undefined) {
        throw new ArgumentsRequired (this.id + ' create_stop_order() requires a stopPrice argument');
    }
    const query = this.extend (params, { 'stopPrice': stopPrice });
    return await this.createOrder (symbol, type, side, amount, price, query);
}

async function createStopLimitOrder (symbol, side, amount, price, stopPrice, params = {}) {
    if (!this.has['createStopLimitOrder']) {
        throw new NotSupported (this.id + ' createStopLimitOrder() is not supported yet');
    }
    const query = this.extend (params, { 'stopPrice': stopPrice });
    return this.createOrder (symbol, 'limit', side, amount, price, query);
}

async function createStopMarketOrder (symbol, side, amount, stopPrice, params = {}) {
    if (!this.has['createStopMarketOrder']) {
        throw new NotSupported (this.id + ' createStopMarketOrder() is not supported yet');
    }
    const query = this.extend (params, { 'stopPrice': stopPrice });
    return this.createOrder (symbol, 'market', side, amount, undefined, query);
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

function isPostOnly (type, timeInForce = undefined, exchangeSpecificOption = undefined, params = {}) {
    /**
     * @ignore
     * @method
     * @param {string} type Order type
     * @param {string} timeInForce
     * @param {boolean} exchangeSpecificOption True if the exchange specific post only setting is set
     * @param {dict} params Exchange specific params
     * @returns {boolean} true if a post only order, false otherwise
     */
    let postOnly = this.safeValue2 (params, 'postOnly', 'post_only', false);
    params = this.omit (params, [ 'post_only', 'postOnly' ]);
    const timeInForceUpper = (timeInForce !== undefined) ? timeInForce.toUpperCase () : undefined;
    const typeLower = type.toLowerCase ();
    const ioc = timeInForceUpper === 'IOC';
    const fok = timeInForceUpper === 'FOK';
    const timeInForcePostOnly = timeInForceUpper === 'PO';
    const isMarket = typeLower === 'market';
    postOnly = postOnly || (typeLower === 'postonly') || timeInForcePostOnly || exchangeSpecificOption;
    if (postOnly) {
        if (ioc || fok) {
            throw new InvalidOrder (this.id + ' postOnly orders cannot have timeInForce equal to ' + timeInForce);
        } else if (isMarket) {
            throw new InvalidOrder (this.id + ' postOnly orders cannot have type ' + type);
        } else {
            timeInForce = timeInForcePostOnly ? undefined : timeInForce;
            return [ 'limit', true, timeInForce, params ];
        }
    } else {
        return [ type, false, timeInForce, params ];
    }
}

module.exports = {
    handleMarketTypeAndParams,
    handleWithdrawTagAndParams,
    createPostOnlyOrder,
    createReduceOnlyOrder,
    createStopOrder,
    createStopLimitOrder,
    createStopMarketOrder,
    fetchMarkOHLCV,
    fetchIndexOHLCV,
    fetchPremiumIndexOHLCV,
    fetchFundingRate,
    isPostOnly,
};
