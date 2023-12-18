import { blofin } from './ts/ccxt.js'

async function example () {
    const exchange = new blofin ({});
    const ob = await exchange.fetchMarkets ({});
    console.log (ob);
}
example();