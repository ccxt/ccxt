
import testTradingFee from './test.tradingFee.js';

async function testFetchTradingFees (exchange) {
    const method = 'fetchTradingFees';
    const fees = await exchange[method] ();
    const symbols = Object.keys (fees);
    console.log (exchange.id, method, 'fetched', symbols.length, 'entries');
    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        testTradingFee (exchange, method, symbol, fees[symbol]);
    }
}

export default testFetchTradingFees;
