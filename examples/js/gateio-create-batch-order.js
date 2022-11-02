const ccxt = require ('../../ccxt');
const keys = require ('../../keys.local.json');

console.log ('CCXT Version:', ccxt.version);

async function main () {

    const exchange = new ccxt.gateio (keys.gateio);
    await exchange.loadMarkets ();

    const ada = exchange.market ('ADA/USDT');
    const xrp = exchange.market ('XRP/USDT');

    const orders = await exchange.privateSpotPostBatchOrders (
        [
            {
                text: "t-123456",
                currency_pair: ada['id'],
                type: "limit",
                account: "spot",
                side: "buy",
                amount: "3",
                price: "0.4",
            },
            {
                text: "t-123456",
                currency_pair: xrp['id'],
                type: "limit",
                account: "spot",
                side: "buy",
                amount: "3",
                price: "0.47",
            },
        ]
    );

    console.log (orders);

};

main ();