// ----------------------------------------------------------------------------
// @ts-nocheck
import ccxt from '../../../ccxt.js';
// ----------------------------------------------------------------------------
export default async (exchange, symbol) => {
    console.log('AuthenticationError (bad nonce) test...');
    const hasFetchBalance = exchange.has.fetchBalance;
    const hasFetchMyTrades = exchange.has.fetchMyTrades;
    const hasFetchOrders = exchange.has.fetchOrders;
    if (hasFetchBalance || hasFetchMyTrades || hasFetchOrders) {
        // save the nonce temporarily and replace it with a fake one
        const nonce = exchange.nonce;
        exchange.nonce = () => 1;
        try {
            // check if handleErrors() throws AuthenticationError if an exchange
            // responds with an error on a bad nonce
            // (still, some exchanges that require nonce silently eat bad nonce w/o an error)
            if (hasFetchBalance) {
                await exchange.fetchBalance();
            }
            else if (hasFetchMyTrades) {
                await exchange.fetchMyTrades(symbol, 0);
            }
            else {
                await exchange.fetchOrders(symbol);
            }
            // restore the nonce so the caller may proceed in case bad nonce was accepted by an exchange
            exchange.nonce = nonce;
            console.log(exchange.id + ': AuthenticationError: bad nonce swallowed');
        }
        catch (e) {
            // restore the nonce so the caller may proceed in case the test failed
            exchange.nonce = nonce;
            if (e instanceof ccxt.AuthenticationError || e instanceof ccxt.InvalidNonce) {
                // it has thrown the exception as expected
                console.log('AuthenticationError test passed');
            }
            else {
                // rethrow an unexpected error if any
                throw e;
            }
        }
    }
    else {
        console.log(exchange.id + ' has no means of testing for bad nonce');
    }
};
