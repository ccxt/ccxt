"use strict";

const ccxt = require ('../../ccxt.js')
    , log  = require ('ololog').noLocate // npm install ololog
    , fs   = require ('fs')

    // the numWorkers constant defines the number of concurrent workers
    // those aren't really threads in terms of the async environment
    // set this to the number of cores in your CPU * 2
    // or play with this number to find a setting that works best for you
    , numWorkers = 8

;(async () => {

    // make an array of all exchanges
    const exchanges = ccxt.exchanges

        // filter coinmarketcap and theocean
        // coinmarketcap isn't really an exchange
        // theocean requires web3 dependencies to be installed

        .filter (id => ![ 'coinmarketcap', 'theocean' ].includes (id))

        // instantiate each exchange and save it to the exchanges list

        .map (id => new ccxt[id] ())

    // the worker function for each "async thread"
    const worker = async function () {

        // while the array of all exchanges is not empty
        while (exchanges.length > 0) {

            // pop one exchange from the array
            const exchange = exchanges.pop ()

            // check if it has the necessary method implemented
            if (exchange.has['fetchTickers']) {

                // try to do "the work" and handle errors if any
                try {

                    // fetch the response for all tickers from the exchange
                    const tickers = await exchange.fetchTickers ()

                    // make a filename from exchange id
                    const filename = exchange.id + '.json'

                    // save the response to a file
                    fs.writeFileSync (filename, JSON.stringify ({ tickers }));

                    // print out a message on success
                    log.green (exchange.id, 'tickers saved to', filename)

                } catch (e) {

                    // in case of error - print it out and ignore it further
                    log.red (e.constructor.name, e.message)
                }

            } else {

                log.red (exchange.id, "has['fetchTickers'] = false");
            }
        }
    }

    // create numWorkers "threads" (they aren't really threads)
    const workers = [ ... Array (numWorkers) ].map (_ => worker ())

    // wait for all of them to execute or fail
    await Promise.all (workers)

}) ()
