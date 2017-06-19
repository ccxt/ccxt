"use strict";

const ccxt      = require ('./ccxt')
const countries = require ('./countries')
const asTable   = require ('as-table')
const util      = require ('util')

let verbose = true
let markets

try {

    markets = require ('./config')

} catch (e) {

    markets = { // defaults

        // _1broker:   { verbose, apiKey: '', token: '', },
        _1btcxe:    { verbose, apiKey: '', secret: '', },
        bit2c:      { verbose, apiKey: '', secret: '', },
        bitbay:     { verbose, apiKey: '', secret: '', },
        bitcoid:    { verbose, apiKey: '', secret: '', },
        bitfinex:   { verbose, apiKey: '', secret: '', },
        bitlish:    { verbose, apiKey: '', login: '', password: '', },
        bitmarket:  { verbose, apiKey: '', secret: '', },    
        bitmex:     { verbose, apiKey: '', secret: '', },
        bitso:      { verbose, apiKey: '', secret: '', },
        bittrex:    { verbose, apiKey: '', secret: '', },
        btcx:       { verbose, apiKey: '', secret: '', },    
        bxinth:     { verbose, apiKey: '', secret: '', },    
        ccex:       { verbose, apiKey: '', secret: '', },
        cex:        { verbose, apiKey: '', secret: '', uid: '', }, 
        coincheck:  { verbose, apiKey: '', secret: '', },
        coinsecure: { verbose, apiKey: '', },
        exmo:       { verbose, apiKey: '', secret: '', },
        fybse:      { verbose, apiKey: '', secret: '', },
        fybsg:      { verbose, apiKey: '', secret: '', }, 
        hitbtc:     { verbose, apiKey: '', secret: '', },
        huobi:      { verbose, apiKey: '', secret: '', },    
        jubi:       { verbose, apiKey: '', secret: '', },    
        kraken:     { verbose, apiKey: '', secret: '', },    
        luno:       { verbose, apiKey: '', secret: '', },
        okcoinusd:  { verbose, apiKey: '', secret: '', },
        okcoincny:  { verbose, apiKey: '', secret: '', },
        poloniex:   { verbose, apiKey: '', secret: '', },
        quadrigacx: { verbose, apiKey: '', secret: '', uid: 123, },    
        quoine:     { verbose, apiKey: '', secret: '', },    
        therock:    { verbose, apiKey: '', secret: '', },    
        vaultoro:   { verbose, apiKey: '', secret: '', },
        virwox:     { verbose, apiKey: '', login: '', password: '', },
        yobit:      { verbose, apiKey: '', secret: '', },
        zaif:       { verbose, apiKey: '', secret: '', },
    }
}

var countryName = function (code) {
    return ((typeof countries[code] !== 'undefined') ? countries[code] : code)
}

for (let id in markets)
    markets[id] = new (ccxt)[id] (markets[id])

console.log (Object.values (ccxt).length)

let delay = ms => new Promise (resolve => setTimeout (resolve, ms))

let testMarket = market => new Promise (async resolve => {

    let products  = await market.loadProducts ()
    // Object.values (market.products).map (x => console.log (market.id, x.id))
    // console.log (market.id, 'products', market.products)
    console.log (market.id, 'symbols', Object.keys (market.products).join (', '))

    // await delay (1000)

    // let orderbook = await market.fetchOrderBook (Object.keys (market.products)[0])
    // console.log (market.id, orderbook)

    // await delay (1000)

    // let ticker = await market.fetchTicker ('BTC/SLL')
    // let ticker = await market.fetchTicker (Object.keys (market.products)[0])
    // console.log (market.id, ticker)
    
    // await delay (1000)
    
    // let trades = await market.fetchTrades (Object.keys (market.products)[0])
    // console.log (market.id, trades)

    // await delay (1000)

    // let balance = await market.fetchBalance ()
    // console.log (market.id, 'balance', balance)

    // await delay (1000)

    // try {

    //     let marketSellOrder = await market.sell (Object.keys (market.products)[0], 1)
    //     console.log (market.id, 'ok', marketSellOrder)

    // } catch (e) {

    //     console.log (market.id, 'error', 'market sell', e)
    // }

    // await delay (1000)

    // try {

    //     let marketBuyOrder = await market.buy (Object.keys (market.products)[0], 1)
    //     console.log (market.id, 'ok', marketBuyOrder)

    // } catch (e) {

    //     console.log (market.id, 'error', 'market buy', e)
    // }

    // await delay (1000)

    // try {

    //     let limitSellOrder = await market.sell (Object.keys (market.products)[0], 1, 3000)
    //     console.log (market.id, 'ok', limitSellOrder)

    // } catch (e) {

    //     console.log (market.id, 'error', 'limit sell', e)
    // }

    // await delay (1000)

    // try {

    //     let limitBuyOrder = await market.buy (Object.keys (market.products)[0], 1, 3000)
    //     console.log (market.id, 'ok', limitBuyOrder)

    // } catch (e) {

    //     console.log (market.id, 'error', 'limit buy', e)
    // }

    // let order = await market.sell ('BTC/USD', 1, 3000)
    // console.log (market.id, order)

})

//-----------------------------------------------------------------------------

var test = async function () {

    //-------------------------------------------------------------------------
    // list all supported exchanges

    console.log (asTable.configure ({ delimiter: ' | ' }) (Object.values (markets).map (market => {

        let website = Array.isArray (market.urls.www) ? market.urls.www[0] : market.urls.www
        let countries = Array.isArray (market.countries) ? market.countries.map (countryName).join (', ') : countryName (market.countries)

        return {
            ' ': '',
            'id':        market.id,
            'name':      '[' + market.name + '](' + website + ')',  
            'countries': countries,
            // 'notes':     'Full support',
            '  ': '',
        }
    })))

    // Object.keys (markets).forEach (async id => {

        var market = markets.zaif //markets[id]

        try {

            await testMarket (market)


        } catch (e) {

            console.log (market.id, e)
            process.exit ()   
        }

        await delay (1000)

    // })

} ()
