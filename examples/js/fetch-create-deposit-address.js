// ----------------------------------------------------------------------------
// setup

import ccxt from '../../js/ccxt.js';

// ----------------------------------------------------------------------------
// setup

const // change me
      defaultCurrencyCode = 'BTC',
      // change me
      //                                  currency code specified in commandline args ↓
      // you can call this script like node examples/js/fetch-create-deposit-address ETH
      exchangeId = 'poloniex',
      currencyCode = process.argv[3] || defaultCurrencyCode,
      exchange = new ccxt[exchangeId] ({

              'apiKey': 'YOUR_API_KEY',
              'secret': 'YOUR_SECRET',

              'enableRateLimit': true, // ←- required! https://github.com/ccxt/ccxt/wiki/Manual#rate-limit

              // 'verbose': true, // ←- uncomment this for verbose output

              // additional credentials might be required in exchange-specific cases:
              // uid or password for Coinbase Pro, etc...
          });

// ----------------------------------------------------------------------------

if (!exchange.has['fetchDepositAddress']) {

    console.log ('The exchange does not support fetchDepositAddress() yet')
    process.exit ()
}

// ----------------------------------------------------------------------------

;(async () => {

    try {

        console.log ('Trying to fetch deposit address for ' + currencyCode + ' from ' + exchangeId + '...')

        let fetchResult = await exchange.fetchDepositAddress (currencyCode)

        console.log ('Successfully fetched deposit address for ' + currencyCode)
        console.log (fetchResult)

    } catch (e) {

        // never skip proper error handling, whatever it is you're building
        // actually, with crypto error handling should be the largest part of your code

        if (e instanceof ccxt.InvalidAddress) {

            console.log ('The address for ' + currencyCode + ' does not exist yet')

            if (exchange.has['createDepositAddress']) {

                console.log ('Attempting to create a deposit address for ' + currencyCode + '...')

                try {

                    const createResult = await exchange.createDepositAddress (currencyCode)

                    // console.log (createResult) // for debugging

                    console.log ('Successfully created a deposit address for ' + currencyCode + ', fetching the deposit address now...')

                    try {

                        let fetchResult = await exchange.fetchDepositAddress (currencyCode)

                        console.log ('Successfully fetched deposit address for ' + currencyCode)
                        console.log (fetchResult);


                    } catch (e) {

                        console.log ('Failed to fetch deposit address for ' + currencyCode, e.constructor.name, e.message)
                    }

                } catch (e) {

                    console.log ('Failed to create deposit address for ' + currencyCode, e.constructor.name, e.message)

                }

            } else {

                console.log ('The exchange does not support createDepositAddress()')
            }

        } else {

            console.log ('There was an error while fetching deposit address for ' + currencyCode, e.constructor.name, e.message)
        }
    }

}) ()