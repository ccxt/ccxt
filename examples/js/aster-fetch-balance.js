import ccxt from '../../js/ccxt.js';

// IMPORTANT: Set your API credentials as environment variables:
// export ASTER_API_KEY='your-api-key'
// export ASTER_SECRET='your-secret-key'

(async () => {
    const exchange = new ccxt.aster({
        'apiKey': process.env.ASTER_API_KEY,
        'secret': process.env.ASTER_SECRET,
        'enableRateLimit': true,
    });
    if (!exchange.apiKey || !exchange.secret) {
        console.error('Error: API credentials not set.');
        console.error('Please set ASTER_API_KEY and ASTER_SECRET environment variables.');
        console.error('Example:');
        console.error('  export ASTER_API_KEY="your-api-key"');
        console.error('  export ASTER_SECRET="your-secret-key"');
        process.exit(1);
    }
    try {
        console.log('Fetching account balance from Aster DEX...');
        const balance = await exchange.fetchBalance();
        console.log('\nTotal balances:');
        for (const [currency, bal] of Object.entries(balance.total)) {
            if (parseFloat(bal) > 0) {
                console.log(`  ${currency}: ${bal} (free: ${balance.free[currency]}, used: ${balance.used[currency]})`);
            }
        }
        console.log('\nFetching open positions...');
        const positions = await exchange.fetchPositions();
        console.log(`Total positions: ${positions.length}`);
        for (const position of positions) {
            if (parseFloat(position.contracts) !== 0) {
                console.log(`  ${position.symbol}: ${position.contracts} contracts @ ${position.entryPrice}`);
                console.log(`    Unrealized PnL: ${position.unrealizedPnl}`);
                console.log(`    Margin mode: ${position.marginMode}`);
            }
        }
        console.log('\nFetching open orders...');
        const orders = await exchange.fetchOpenOrders();
        console.log(`Total open orders: ${orders.length}`);
        for (const order of orders) {
            console.log(`  ${order.symbol}: ${order.side} ${order.amount} @ ${order.price} (${order.status})`);
        }
    } catch (e) {
        console.error('Error:', e.message);
        if (e.message.includes('INVALID_SIGNATURE') || e.message.includes('INVALID_API_KEY')) {
            console.error('\nPlease check your API credentials.');
        }
    } finally {
        await exchange.close();
    }
})();
