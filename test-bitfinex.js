let ccxt = require ('./ccxt.js')

let bitfinex = new ccxt.bitfinex2({
    'apiKey': 'N2riVgFz9FGV2ZzY5xVhsVmeYJNZpljMBni78iUCpcO',
    'secret': 'pm9J0XdjIaHlm5tktg8YJvBXdrX7QU8ydlPNQhfHMJn',
    'verbose': true,
})

async function test () {
    console.log (await bitfinex.create_market_buy_order ('BTC/USD', 1))
}

test ()
