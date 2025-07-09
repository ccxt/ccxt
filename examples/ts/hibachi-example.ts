import { hibachi } from '../../js/ccxt.js';

async function example () {
    const exchange = new hibachi ({});
    exchange.verbose = true;

    const markets = await exchange.fetchMarkets();
    console.log ('fetchMarkets', markets.length, markets[0]);

    const currencies = await exchange.fetchCurrencies();
    console.dir (currencies, { depth: null, colors: true });
}
example ();
