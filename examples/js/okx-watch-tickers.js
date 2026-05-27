'use strict';
import ccxt from '../../js/ccxt.js';
console.log('CCXT Version:', ccxt.version); // eslint-disable-line import/no-named-as-default-member
async function main() {
    const exchange = new ccxt.pro.okx(); // eslint-disable-line import/no-named-as-default-member
    await exchange.loadMarkets();
    // exchange.verbose = true
    while (true) { // eslint-disable-line no-constant-condition
        try {
            // don't do this, specify a list of symbols to watch for watchTickers
            // or a very large subscription message will crash your WS connection
            // const tickers = await exchange.watchTickers ()
            // do this instead
            let symbols = [
                'ETH/BTC',
                'BTC/USDT',
                'ETH/USDT',
                // ...
            ];
            const tickers = await exchange.watchTickers(symbols);
            symbols = Object.keys(tickers);
            console.log(new Date(), 'received', symbols.length, 'symbols', ...symbols.slice(0, 5).join(', '), '...');
        }
        catch (e) {
            console.log(e);
            break;
        }
    }
}
main();
