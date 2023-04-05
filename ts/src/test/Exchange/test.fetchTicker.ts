
import testTicker from './test.ticker.js';

async function testFetchTicker (exchange, symbol) {
    const method = 'fetchTicker';
    const ticker = await exchange[method] (symbol);
    console.log (exchange.id, method, 'fetched succesfully, asserting now ...');
    testTicker (exchange, method, ticker, symbol);
}

export default testFetchTicker;
