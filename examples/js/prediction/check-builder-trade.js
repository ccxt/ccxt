// @NO_AUTO_TRANSPILE
import ccxt from '../../../js/ccxt.js';
async function main() {
    const exchange = new ccxt.prediction.polymarket({});
    try {
        const builderWallet = exchange.options['builder'].toLowerCase().replace('0x', '');
        const builderCode = '0x' + builderWallet.padStart(64, '0');
        console.log('builder wallet:', exchange.options['builder']);
        console.log('builder code:  ', builderCode);
        const attributed = await exchange.clobPublicGetBuilderTrades({ 'builder_code': builderCode });
        let volume = 0;
        let fees = 0;
        for (const trade of attributed['data']) {
            volume += parseFloat(trade['sizeUsdc']);
            fees += parseFloat(trade['builderFee']);
        }
        console.log('Total trades', attributed['data'].length, 'Total volume (USDC)', volume);
        console.log('Total fees (USDC)', fees);
    }
    finally {
        await exchange.close();
    }
}
await main();
