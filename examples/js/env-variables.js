"use strict";

// ----------------------------------------------------------------------------

const ccxt = require("../../ccxt.js"),
    log = require ('ololog').handleNodeErrors (),
    asTable = require("as-table").configure({ delimiter: " | " });

// ----------------------------------------------------------------------------

(async () => {

    const exchange = new ccxt.coinbase ({
        verbose: process.argv.includes ('--verbose'),
        timeout: 60000,
        apiKey: process.env.KEY,
        secret: process.env.SECRET
    });

    const balance = await exchange.fetchBalance ()
    log.green (balance)

})()
