
import bithumb from './ts/src/bithumb.js';

async function main() {
    const exchange = new bithumb();
    
    // Manual market mock similar to static/markets/bithumb.json
    const market = {
        "id": "BTC",
        "symbol": "BTC/KRW",
        "base": "BTC",
        "quote": "KRW",
        "baseId": "BTC",
        "quoteId": "KRW",
    };
    exchange.setMarkets([market]);
    
    // Request gen
    const request = {
        'markets': market['quote'] + '-' + market['base'],
    };
    console.log('Computed markets:', request['markets']);
}

main();
