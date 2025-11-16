import ccxt from '../../js/ccxt.js';

(async () => {
    const exchange = new ccxt.aster({
        'enableRateLimit': true,
    });
    try {
        console.log('Fetching markets from Aster DEX...');
        const markets = await exchange.fetchMarkets();
        console.log('Total markets:', markets.length);
        console.log('\nFirst 10 markets:');
        for (let i = 0; i < Math.min(10, markets.length); i++) {
            const market = markets[i];
            console.log(`  ${market.symbol} (${market.type}) - ${market.active ? 'active' : 'inactive'}`);
        }
        console.log('\nFetching ticker for first market...');
        if (markets.length > 0) {
            const ticker = await exchange.fetchTicker(markets[0].symbol);
            console.log('Ticker:', {
                symbol: ticker.symbol,
                last: ticker.last,
                bid: ticker.bid,
                ask: ticker.ask,
                volume: ticker.baseVolume,
            });
        }
        console.log('\nFetching order book...');
        if (markets.length > 0) {
            const orderbook = await exchange.fetchOrderBook(markets[0].symbol);
            console.log('Order book:', {
                symbol: markets[0].symbol,
                bids: orderbook.bids.length,
                asks: orderbook.asks.length,
                timestamp: orderbook.timestamp,
            });
            if (orderbook.bids.length > 0) {
                console.log('  Best bid:', orderbook.bids[0]);
            }
            if (orderbook.asks.length > 0) {
                console.log('  Best ask:', orderbook.asks[0]);
            }
        }
    } catch (e) {
        console.error('Error:', e.message);
        console.error('Stack:', e.stack);
    }
    await exchange.close();
})();
