

import ccxt from '../../js/ccxt.js';

(async function main () {

    const exchange = new ccxt.binance ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    })

    await exchange.loadMarkets ()

    // exchange.verbose = true // uncomment for debugging

    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    let startTime = exchange.parse8601 ('2018-01-01T00:00:00')
    const now = exchange.milliseconds ()
    const currencyCode = undefined // any currency

    let allTransactions = []

    while (startTime < now) {

        const endTime = startTime + ninetyDays

        const transactions = await exchange.fetchDeposits (currencyCode, startTime, undefined, {
            'endTime': endTime,
        })
        if (transactions.length) {
            const lastTransaction = transactions[transactions.length - 1]
            startTime = lastTransaction['timestamp'] + 1
            allTransactions = allTransactions.concat (transactions)
        } else {
            startTime = endTime;
        }
    }

    console.log ('Fetched', allTransactions.length, 'transactions')
    for (let i = 0; i < allTransactions.length; i++) {
        const transaction = allTransactions[i]
        console.log (i, transaction['datetime'], transaction['txid'], transaction['currency'], transaction['amount'])
    }

}) ()