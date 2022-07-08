
// ----------------------------------------------------------------------------

import testOrderBook from './test.orderbook.js';

// ----------------------------------------------------------------------------

export default async (exchange, symbol) => {
    const method = 'fetchOrderBook';
    if (exchange.has[method]) {
        const orderbook = await exchange[method] (symbol);
        testOrderBook (exchange, orderbook, method, symbol);
        return orderbook;
    } else {
        console.log (method + '() is not supported');
    }
};
