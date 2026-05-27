'use strict';
import ccxt from '../../js/ccxt.js';
// eslint-disable-next-line import/no-named-as-default-member
console.log('CCXT Version:', ccxt.version);
async function watchTrades(exchange, symbol) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const trades = await exchange.watchTrades(symbol);
            console.log(new Date(), exchange.id, symbol, trades.length, 'trades');
        }
        catch (e) {
            console.log(e);
        }
    }
}
async function main() {
    const symbols = ['USDT/THB', 'BTC/THB', 'ETH/THB'];
    // eslint-disable-next-line import/no-named-as-default-member
    const exchange = new ccxt.pro.bitmex({
        'newUpdates': true,
    });
    await exchange.loadMarkets();
    exchange.verbose = true;
    await Promise.all(symbols.map((symbol) => watchTrades(exchange, symbol)));
}
main();
