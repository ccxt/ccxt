
import ccxt from 'ccxt';

async function main() {
    console.log('[ESM] Version', ccxt.version);
    console.log('[ESM] number of exchanges:', Object.keys(ccxt.exchanges).length)
    const exchange = new ccxt['binance']({})
    console.log(exchange.version)
}

main ()
