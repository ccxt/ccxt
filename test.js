"use strict";

/*  ------------------------------------------------------------------------ */

const keys = ['--es6']
const [processPath, , marketId = null, marketSymbol = null] = process.argv.filter (x => !keys.includes (x))
const ccxtFile = process.argv.includes ('--es6') ? 'ccxt.js' : 'ccxt.es5.js'

/*  ------------------------------------------------------------------------ */

const ccxt      = require ('./' + ccxtFile)
const countries = require ('./countries')

/*  ------------------------------------------------------------------------ */

const asTable   = require ('as-table')
const util      = require ('util')
const log       = require ('ololog')
const ansi      = require ('ansicolor').nice;
const fs        = require ('fs')

/*  ------------------------------------------------------------------------ */

process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

/*  ------------------------------------------------------------------------ */

log.bright ('\nTESTING', ccxtFile.magenta, { market: marketId || 'all', symbol: marketSymbol || 'all' }, '\n')

/*  ------------------------------------------------------------------------ */

let markets = {}
let proxies = [
    '',
    'https://cors-anywhere.herokuapp.com/',
    'https://crossorigin.me/',
    // 'http://cors-proxy.htmldriven.com/?url=', // we don't want this for now
]

// instantiate all markets
ccxt.markets.forEach (id => {
    markets[id] = new (ccxt)[id] ({ verbose: true })
})

// load api keys from config
let config = JSON.parse (fs.readFileSync ('./keys.json', 'utf8'))

// set up api keys appropriately
for (let id in config)
    for (let key in config[id])
        markets[id][key] = config[id][key]

// move gdax to sandbox
markets['gdax'].urls['api'] = 'https://api-public.sandbox.gdax.com'

//-----------------------------------------------------------------------------

var countryName = function (code) {
    return ((typeof countries[code] !== 'undefined') ? countries[code] : code)
}

//-----------------------------------------------------------------------------

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));

//-----------------------------------------------------------------------------

let testMarketSymbolTicker = async (market, symbol) => {
    await sleep (market.rateLimit)
    let ticker = await market.fetchTicker (symbol)
    log (market.id.green, symbol, 'ticker', ticker,
        ticker['datetime'],
        'high: '    + ticker['high'],
        'low: '     + ticker['low'],
        'bid: '     + ticker['bid'],
        'ask: '     + ticker['ask'],
        'volume: '  + ticker['quoteVolume'])

    if (ticker['bid'] > ticker['ask'])
        log (this.id, symbol, 'ticker', 'bid is greater than ask!')

    return ticker;
}

//-----------------------------------------------------------------------------

let testMarketSymbolOrderbook = async (market, symbol) => {
    await sleep (market.rateLimit) 
    let orderbook = await market.fetchOrderBook (symbol)
    log (market.id.green, symbol, 'order book',
        orderbook['datetime'],
        'bid: '       + ((orderbook.bids.length > 0) ? orderbook.bids[0][0] : 'N/A'), 
        'bidVolume: ' + ((orderbook.bids.length > 0) ? orderbook.bids[0][1] : 'N/A'),
        'ask: '       + ((orderbook.asks.length > 0) ? orderbook.asks[0][0] : 'N/A'),
        'askVolume: ' + ((orderbook.asks.length > 0) ? orderbook.asks[0][1] : 'N/A'))

    let bids = orderbook.bids
    if (bids.length > 1) {
        let first = 0
        let last = bids.length - 1
        if (bids[first][0] < bids[last][0])
            log (market.id, symbol, 'bids reversed!'.red.bright, bids[first][0], bids[last][0])
        else if (bids[first][0] > bids[last][0])
            log (market.id, symbol, 'bids ok')
    }
    let asks = orderbook.asks
    if (asks.length > 1) {
        let first = 0
        let last = asks.length - 1
        if (asks[first][0] > asks[last][0])
            log (market.id, symbol, 'asks reversed!'.red.bright, asks[first][0], asks[last][0])
        else if (asks[first][0] < asks[last][0])
            log (market.id, symbol, 'asks ok')
    }

    if (bids.length && asks.length)
        if (bids[0][0] > asks[0][0])
            log (this.id, symbol, 'order book', 'bid is greater than ask!'.red.bright)

    return orderbook
}

//-----------------------------------------------------------------------------

let testMarketSymbolTrades = async (market, symbol) => {
    let trades = await market.fetchTrades (symbol)
    log (market.id, symbol, 'trades', Object.values (trades).length)
    return trades
}

//-----------------------------------------------------------------------------

let testMarketSymbol = async (market, symbol) => {
    await sleep (market.rateLimit) 
    await testMarketSymbolTicker (market, symbol)
    if (market.id == 'coinmarketcap') {
        // log (await market.fetchTickers ());
        log (await market.fetchGlobal ());
    } else {
        await testMarketSymbolOrderbook (market, symbol)
        if ([ '_1broker', 'xbtce', 'btcexchange', 'anxpro' ].indexOf (market.id) < 0) {
            await testMarketSymbolTrades (market, symbol)
        }
    }
}

//-----------------------------------------------------------------------------

let testMarketBalance = async (market, symbol) => {
    await sleep (market.rateLimit) 
    let balance = await market.fetchBalance ()
    log (market.id.green, 'balance', balance)
}

//-----------------------------------------------------------------------------

let loadMarket = async market => {
    let products  = await market.loadProducts ()
    log (market.id.green, market.symbols.length, 'symbols', market.symbols.join (', '))
}

//-----------------------------------------------------------------------------

let testMarket = async market => {

    let delay = market.rateLimit
    let symbol = market.symbols[0]
    let symbols = [
        'BTC/USD',
        'BTC/CNY',
        'BTC/ETH',
        'ETH/BTC',
        'BTC/JPY',
        'LTC/BTC',
    ]
    for (let s in symbols) {
        if (market.symbols.includes (symbols[s])) {
            symbol = symbols[s]
            break
        }
    }

    log.green ('SYMBOL:', symbol)
    if ((symbol.indexOf ('.d') < 0)) {
        await testMarketSymbol (market, symbol)
    }

    if (!market.apiKey || (market.apiKey.length < 1))
        return true

    await testMarketBalance (market)

    // sleep (delay)
    // try {
    //     let marketSellOrder = 
    //         await market.createMarketSellOrder (market.symbols[0], 1)
    //     console.log (market.id, 'ok', marketSellOrder)
    // } catch (e) {
    //     console.log (market.id, 'error', 'market sell', e)
    // }

    // sleep (delay)
    // try {
    //     let marketBuyOrder = await market.createMarketBuyOrder (market.symbols[0], 1)
    //     console.log (market.id, 'ok', marketBuyOrder)
    // } catch (e) {
    //     console.log (market.id, 'error', 'market buy', e)
    // }

    // sleep (delay)
    // try {
    //     let limitSellOrder = await market.createLimitSellOrder (market.symbols[0], 1, 3000)
    //     console.log (market.id, 'ok', limitSellOrder)
    // } catch (e) {
    //     console.log (market.id, 'error', 'limit sell', e)
    // }

    // sleep (delay)
    // try {
    //     let limitBuyOrder = await market.createLimitBuyOrder (market.symbols[0], 1, 3000)
    //     console.log (market.id, 'ok', limitBuyOrder)
    // } catch (e) {
    //     console.log (market.id, 'error', 'limit buy', e)
    // }

}

//-----------------------------------------------------------------------------

let printExchangesTable = function () {
    let astable = asTable.configure ({ delimiter: ' | ' }) 
    console.log (astable (Object.values (markets).map (market => {
        let website = Array.isArray (market.urls.www) ? 
            market.urls.www[0] :
            market.urls.www
        let countries = Array.isArray (market.countries) ? 
            market.countries.map (countryName).join (', ') :
            countryName (market.countries)
        let doc = Array.isArray (market.urls.doc) ? 
            market.urls.doc[0] :
            market.urls.doc
        return {
            'id':        market.id,
            'name':      market.name,
            'countries': countries,
        }        
    })))
}

//-----------------------------------------------------------------------------

let tryAllProxies = async function (market, proxies) {

    let currentProxy = 0
    let maxRetries   = proxies.length
    
    for (let numRetries = 0; numRetries < maxRetries; numRetries++) {

        try {

            market.proxy = proxies[currentProxy]
            await loadMarket (market)
            await testMarket (market)
            break

        } catch (e) {

            currentProxy = ++currentProxy % proxies.length
            if (e instanceof ccxt.DDoSProtectionError) {
                log.bright.yellow (market.id, '[DDoS Protection Error] ' + e.message)
            } else if (e instanceof ccxt.TimeoutError) {
                log.bright.yellow (market.id, '[Timeout Error] ' + e.message)
            } else if (e instanceof ccxt.AuthenticationError) {
                log.bright.yellow (market.id, '[Authentication Error] ' + e.message)
            } else if (e instanceof ccxt.MarketNotAvailableError) {
                log.bright.yellow (market.id, '[Market Not Available Error] ' + e.message)
            } else if (e instanceof ccxt.EndpointNotAvailableError) {
                log.bright.yellow (market.id, '[Endpoint Not Available Error] ' + e.message)
            } else {
                throw e;
            }
        }

    }
}

//-----------------------------------------------------------------------------

var test = async function () {
  
    // printExchangesTable ()   

    if (marketId) {

        const market = markets[marketId]
        
        if (!market)
            throw new Error ('Market `' + marketId + '` not found')
                
        if (marketSymbol) {
        
            await (marketSymbol == 'balance') ? 
                testMarketBalance (market) :
                testMarketSymbol (market, marketSymbol)
        
        } else {
        
            await tryAllProxies (market, proxies)
        }

    } else {

        for (const id of Object.keys (markets)) {
    
            log.bright.green ('MARKET:', id)
            const market = markets[id]
            await tryAllProxies (market, proxies)

        }
    }

} ()
