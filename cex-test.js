const ccxt = require ('./ccxt.js')
let exchange = new ccxt.pro.cex () // default id

async function main () {
while (true) {
    try{
        const btc = await exchange.watchTrades ('BTC/USD');
        const eth = await exchange.watchTrades ('ETH/USD');
    }
    catch (e) {
        console.log (e)
    }
}
}
main()
