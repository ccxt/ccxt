// ----------------------------------------------------------------------------
// @ts-nocheck
import assert from 'assert';
import ccxt from '../../../ccxt.js';
// ----------------------------------------------------------------------------
export default async (exchange, symbol) => {
    if (!exchange.has.createOrder) {
        console.log('createOrder() is not supported');
        return;
    }
    const id = 1;
    try {
        await exchange.cancelOrder(id, symbol);
        console.log('test failed');
        assert(false);
    }
    catch (e) {
        if (e instanceof ccxt.OrderNotFound) {
            console.log('OrderNotFound thrown as expected');
        }
        else {
            console.log('OrderNotFound test failed');
            throw e;
        }
    }
};
