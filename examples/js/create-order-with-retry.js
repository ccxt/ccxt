// @NO_AUTO_TRANSPILE
import ccxt from '../../js/ccxt.js';
// ----------------------------------------------------------------------------
const tryToCreateOrder = async function (exchange, symbol, type, side, amount, price, params) {
    try {
        const order = await exchange.createOrder(symbol, type, side, amount, price, params);
        return order;
    }
    catch (e) {
        console.log(e.constructor.name, e.message);
        if (e instanceof ccxt.NetworkError) {
            // retry on networking errors
            return false;
        }
        else {
            throw e; // break on all other exceptions
        }
    }
};
// ----------------------------------------------------------------------------
const exchange = new ccxt.okx({
    'apiKey': 'YOUR_API_KEY', // edit here
    'secret': 'YOUR_SECRET', // edit here
    'password': 'YOUR_PASSWORD', // edit here
});
const symbol = 'XRP/USDT'; // edit here
const type = 'limit '; // edit here
const side = 'buy'; // edit here
const amount = 10; // edit here
const price = 1; // edit here
const params = {} // edit here
;
(async () => {
    let order = false;
    while (true) {
        order = await tryToCreateOrder(exchange, symbol, type, side, amount, price, params);
        if (order !== false) {
            break;
        }
    }
    console.log(order);
})();
