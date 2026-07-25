const ccxt = require ('../../ccxt.js');

const walutomat = new ccxt.walutomat({
    apiKey: "",
    secret: ""
});

(async () => {
    
    const orderBookBest = await walutomat.fetchOrderBook("EUR/PLN");
    console.log(orderBookBest);

    const balances = await walutomat.fetchBalance();
    console.log(balances);

    const trades = await walutomat.fetchTrades();
    console.log(trades);

    const orders = await walutomat.fetchOrders();
    console.log(orders);

    const createOrder = await walutomat.createOrder("EUR/PLN", null, "buy", 1, 5, {
        submitId: "GUID"
    });
    console.log(createOrder);

    const cancelOrder = await walutomat.cancelOrder("GUID");
    console.log(cancelOrder);
    
})();


