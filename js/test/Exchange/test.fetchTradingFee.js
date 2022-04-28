import testTradingFee from './test.tradingFee.js';

export default async (exchange, symbol) => {
    const skippedExchanges = []
    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchTradingFee...')
        return
    }
    if (exchange.has.fetchTradingFee) {
        const fee = await exchange.fetchTradingFee (symbol)
        testTradingFee (exchange, symbol, fee)
        return fee
    } else {
        console.log ('fetching trading fees not supported')
    }
};
