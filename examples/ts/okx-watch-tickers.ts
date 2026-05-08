import ccxt from '../../../js/ccxt.js';

async function main() {
    const exchange = new ccxt.pro.okx()
    await exchange.loadMarkets()
    // exchange.verbose = true
    while (true) {
        try {

            // don't do this, specify a list of symbols to watch for watchTickers
            // or a very large subscription message will crash your WS connection
            // const tickers = await exchange.watchTickers ()

            // do this instead
            const symbols = [
                'ETH/BTC',
                'BTC/USDT',
                'ETH/USDT',
                // ...
            ]
            const tickers = await exchange.watchTickers (symbols)
            symbols = Object.keys(tickers)
            console.log (new Date(), 'received', symbols.length, 'symbols', ... symbols.slice(0,5).join(', '), '...')
        } catch (e) {
            console.log (new Date(), e.constructor.name, e.message)
            break
        }
    }
}

main()
