'use strict';

// ----------------------------------------------------------------------------------------------------------------------------
// This file contains all methods part of the Exchange instance that do not have an exchange-specific implementation
// thus they can be transpiled to the other languages. Since they are part of the Exchange instance (at runtime), 
// they can make use of the 'this' and access everything that is part of the Exchange instance (options, defined method, etc).
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

module.exports = {
    handleMarketTypeAndParams
}