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

module.exports = {
    handleMarketTypeAndParams,
    handleWithdrawTagAndParams,
    createPostOnlyOrder,
    createReduceOnlyOrder,
    createStopOrder,
    createStopLimitOrder,
    createStopMarketOrder,
};
