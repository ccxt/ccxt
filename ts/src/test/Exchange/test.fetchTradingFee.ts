
import assert from 'assert';
import testTradingFee from './test.tradingFee';

async function testFetchTradingFee (exchange, symbol) {
    const method = 'fetchTradingFee';
    const fee = await exchange[method] (symbol);
    assert (typeof fee === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (fee));
    console.log (exchange.id, method, 'fetched succesfully, asserting now ...');
    testTradingFee (exchange, method, symbol, fee);
}

export default testFetchTradingFee;