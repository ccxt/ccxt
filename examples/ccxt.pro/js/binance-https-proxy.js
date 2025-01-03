'use strict';

const ccxt = require ('../../../ccxt')

console.log ('CCXT Version:', ccxt.version)

let HttpsProxyAgent = undefined

try {
    HttpsProxyAgent = require ('https-proxy-agent')
} catch (e) {
    console.log (e.constructor.name, e.message)
    console.log ("\nCould not load the HTTPS proxy agent")
    console.log ("\nPlease, run this command to make sure it's properly installed:")
    console.log ("\nnpm install https-proxy-agent\n")
    process.exit ()
}

async function main () {

    console.log ('Using proxy server', httpsProxyUrl);

    // adjust for your HTTPS proxy URL
    const httpsProxyUrl = process.env.https_proxy || 'https://username:password@your-proxy.com'
        , httpsAgent = new HttpsProxyAgent (httpsProxyUrl)
        , exchange = new ccxt.binance ({
            httpsAgent: httpsAgent, // ←--------------------- httpsAgent here
            options: {
                'ws': {
                    'options': { agent: httpsAgent }, // ←--- httpsAgent here
                },
            },
        })

    const symbol = 'BTC/USDT'
    await exchange.loadMarkets ()
    console.log ('Markets loaded')
    while (true) {
        try {
            const orderbook = await exchange.watchOrderBook (symbol)
            console.log (exchange.iso8601 (exchange.milliseconds()), symbol, orderbook['asks'][0], orderbook['bids'][0])
        } catch (e) {
            console.log (e.constructor.name, e.message)
        }
    }
}

main ()
