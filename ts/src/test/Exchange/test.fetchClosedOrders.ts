
// ----------------------------------------------------------------------------

import assert from 'assert';
import testOrder from './test.order.js';

// ----------------------------------------------------------------------------

export default async (exchange, symbol) => {
    const method = 'fetchClosedOrders';
    if (exchange.has[method]) {
        const orders = await exchange[method] (symbol);
        console.log ('fetched', orders.length, 'closed orders, testing each');
        assert (orders instanceof Array);
        const now = Date.now ();
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            testOrder (exchange, order, symbol, now);
            assert (order.status === 'closed' || order.status === 'canceled');
        }
    } else {
        console.log (method + '() is not supported');
    }
};
