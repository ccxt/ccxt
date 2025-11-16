import ccxt from '../../js/ccxt.js';

(async () => {
    const exchange = new ccxt.pro.aster({
        'enableRateLimit': true,
    });
    const symbol = process.argv[2] || 'BTC/USDT:USDT';
    console.log(`Watching trades for ${symbol} on Aster DEX...`);
    console.log('Press Ctrl+C to exit\n');
    try {
        while (true) {
            const trades = await exchange.watchTrades(symbol);
            const trade = trades[trades.length - 1];
            console.log(exchange.iso8601(trade.timestamp), trade.symbol, trade.side, trade.amount, '@', trade.price);
        }
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await exchange.close();
    }
})();
