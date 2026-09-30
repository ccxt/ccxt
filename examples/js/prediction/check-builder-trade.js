// @NO_AUTO_TRANSPILE
import ccxt from '../../../js/ccxt.js';
async function main() {
    const exchange = new ccxt.prediction.polymarket({});
    try {
        const builderWallet = exchange.options['builder'].toLowerCase().replace('0x', '');
        const builderCode = '0x' + builderWallet.padStart(64, '0');
        console.log('builder wallet:', exchange.options['builder']);
        console.log('builder code:  ', builderCode);
        let volume = 0;
        let fees = 0;
        let totalTrades = 0;
        let cursor = undefined;
        while (true) {
            const request = { 'builder_code': builderCode };
            if (cursor !== undefined) {
                request['next_cursor'] = cursor;
            }
            const attributed = await exchange.clobPublicGetBuilderTrades(request);
            const data = attributed['data'] ?? [];
            for (const trade of data) {
                volume += parseFloat(trade['sizeUsdc']);
                fees += parseFloat(trade['builderFee']);
            }
            totalTrades += data.length;
            console.log('fetched page of', data.length, 'trades, next_cursor:', attributed['next_cursor']);
            cursor = attributed['next_cursor'];
            // 'LTE=' (base64 "-1") marks the final page of the CLOB cursor pagination
            if (data.length === 0 || cursor === undefined || cursor === '' || cursor === 'LTE=') {
                break;
            }
        }
        console.log('Total trades', totalTrades, 'Total volume (USDC)', volume);
        console.log('Total fees (USDC)', fees);
    }
    finally {
        await exchange.close();
    }
}
await main();
