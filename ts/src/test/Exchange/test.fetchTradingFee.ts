import testTradingFee from './test.tradingFee.js';

export default async (exchange, symbol) => {
    const method = 'fetchTradingFee';
    const skippedExchanges = [];
    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...');
        return;
    }
    if (exchange.has[method]) {
        const fee = await exchange[method] (symbol);
        testTradingFee (symbol, fee);
        return fee;
    } else {
        console.log (method + '() is not supported');
    }
};
