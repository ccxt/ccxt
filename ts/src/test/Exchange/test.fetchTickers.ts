
import assert from 'assert';
import testTicker from './test.ticker.js';

async function testFetchTickers (exchange, symbol) {
    const method = 'fetchTickers';
    // log ('fetching all tickers at once...')
    let tickers = undefined;
    let checkedSymbol = undefined;
    try {
        tickers = await exchange[method] ();
    } catch (e) {
        tickers = await exchange[method] ([ symbol ]);
        checkedSymbol = symbol;
    }
    assert (typeof tickers === 'object', exchange.id + ' ' + method + ' ' + checkedSymbol + ' must return an object. ' + exchange.json (tickers));
    const values = Object.values (tickers);
    for (let i = 0; i < values.length; i++) {
        const ticker = values[i];
        testTicker (exchange, method, ticker, checkedSymbol);
    }
}

export default testFetchTickers;
