- [Huobipro Market Buy Sell Fetch Trading Limits](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js';
import ololog from 'ololog'

const log = ololog.configure .unlimited.handleNodeErrors (),
      { NotSupported } = ccxt,
      enableRateLimit = true,
      symbol = 'ADA/BTC',
      side = 'buy',
      // set createMarketBuyOrderRequiresPrice to true or false to see the difference
      type = 'market',
      // default is true
      createMarketBuyOrderRequiresPrice = true,
      amount = 191.03,
      price = 0.000011,
      options = { createMarketBuyOrderRequiresPrice },
      exchange = new ccxt.huobipro ({ enableRateLimit, options });

// This is an example that demonstrates the issues discussed here:
// https://github.com/ccxt/ccxt/issues/564
// https://github.com/ccxt/ccxt/issues/3427
// https://github.com/ccxt/ccxt/issues/3460
// https://github.com/ccxt/ccxt/issues/4799

log.green ('CCXT', ccxt.version)

;(async () => {

    // preload them first
    await exchange.loadMarkets ()

    // huobipro has this
    if (!exchange.has['fetchTradingLimits']) {
        throw new NotSupported (exchange.id + ' does not have fetchTradingLimits() yet, make sure your version of CCXT is up to date');
    }

    // In this particular case it requires an array of symbols
    // otherwise it will load all of them one by one.
    // Loading all limits without specifying
    // the array of symbols might take a lot of time.

    // The array of symbols will contain just one symbol of interest.
    const arrayOfSymbols = [ symbol ]

    const allLimits = await exchange.fetchTradingLimits (arrayOfSymbols)

    // { 'ADA/BTC': {   info: {                                  symbol: "adabtc",
    //                                       'buy-limit-must-less-than':  1.1,
    //                                   'sell-limit-must-greater-than':  0.9,
    //                                  'limit-order-must-greater-than':  0.1,
    //                                     'limit-order-must-less-than':  5000000,
    //                             'market-buy-order-must-greater-than':  0.0001,
    //                                'market-buy-order-must-less-than':  100,
    //                            'market-sell-order-must-greater-than':  0.1,
    //                               'market-sell-order-must-less-than':  500000,
    //                           'limit-order-before-open-greater-than':  999999999,
    //                              'limit-order-before-open-less-than':  0,
    //                                'circuit-break-when-greater-than':  10000,
    //                                   'circuit-break-when-less-than':  10,
    //                          'market-sell-order-rate-must-less-than':  0.1,
    //                           'market-buy-order-rate-must-less-than':  0.1        },
    //                limits: { amount: { min: 0.1, max: 5000000 } }                    } }

    const limits = allLimits[symbol]
    log.yellow (symbol, 'limits:')
    log.yellow (limits)

    // To make things a bit more complicated huobipro specifies
    // different minimums for market and limit orders
    // and different minimums for buy/sell directions
    // therefore we have to work with it in an exchange-specific way
    // using the 'info' field from the response – that is
    // until this aspect is completely unified in ccxt.

    const info = limits['info']
    const typeSide = type + '-' + side

    const min = info[typeSide + '-order-must-greater-than']
    const max = info[typeSide + '-order-must-less-than']

    // huobipro requires the amount in quote currency for market sell orders
    // huobipro requires the cost in quote currency for market buy orders
    // cost = amount * price

    const cost = createMarketBuyOrderRequiresPrice ? (amount * price) : amount

    let color = 'red'

    if ((min !== undefined) && (cost < min)) {
        log[color] ('The cost is below minimum:', cost, '<', min)
    } else if ((max !== undefined) && (cost > max)) {
        log[color] ('The cost is above maximum:', cost, '>', max)
    } else {
        color = 'green'
    }

    log[color] ({ min, max, cost })

}) () 
```