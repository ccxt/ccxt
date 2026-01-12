import fs from 'fs';
import { pro } from '../../js/ccxt.js';

async function example () {
    const exchange = new pro.bitget ({
        'options': {
            'uta': true,
        },
    });
    exchange.verbose = true;
    await exchange.loadMarkets ();

    while (true) {
        const book = await exchange.watchOrderBook ('BTCUSDT', 1);
        console.log (book);
    }
}
example ();
