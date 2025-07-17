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
    try {
        await exchange.createLimitBuyOrder(symbol, 0, 0);
        assert(false);
    }
    catch (e) {
        if (e instanceof ccxt.InvalidOrder) {
            console.log('InvalidOrder thrown as expected');
        }
        else {
            console.log('InvalidOrder failed, exception follows:');
            throw e;
        }
    }
};
