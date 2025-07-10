import { hibachi } from '../../js/ccxt.js';
import fs from 'fs';

async function example () {
    const keys = JSON.parse(fs.readFileSync('keys.local.json', 'utf-8'));
    const exchange = new hibachi (keys.hibachi);
    exchange.verbose = true;

    const markets = await exchange.fetchMarkets();
    console.log ('fetchMarkets', markets.length, markets[0]);

    const currencies = await exchange.fetchCurrencies();
    console.dir (currencies, { depth: null, colors: true });

    const balance = await exchange.fetchBalance();
    console.dir (balance, { depth: null, colors: true });
    
}
example ();
