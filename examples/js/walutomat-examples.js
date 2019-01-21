const ccxt = require ('../../ccxt.js');

const walutomat = new ccxt.walutomat();

(async () => {
    const orderBookBest = await walutomat.fetchOrderBook("EUR/PLN");

    console.log(orderBookBest)
})();


