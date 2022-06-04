'use strict'

// ----------------------------------------------------------------------------

const testOpenInterest = require('./test.openInterest.js');

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {
    const method = 'fetchOpenInterestHistory';
    if (exchange.has[method]) {
        const openInterestHistory = await exchange[method] (symbol);
        console.log ('fetched ', openInterestHistory.length, ' records of open interest');
        for (let i = 0; i < openInterestHistory.length; i++) {
            const openInterest = openInterestHistory[i];
            testOpenInterest (exchange, openInterest, method)
        }
        return openInterestHistory;
    } else {
        console.log ('fetching open interest history not supported');
    }
}
