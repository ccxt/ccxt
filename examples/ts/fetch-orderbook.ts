import { binance } from '../../ts/ccxt.js'

async function main() {
    const exchange = new binance();
    const ob = await exchange.fetchOrderBook('BTC/USDT')
    const asks = ob.asks;
    const bids = ob.bids;
    console.log(asks);
    console.log(bids);
}

main();