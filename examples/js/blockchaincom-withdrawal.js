"use strict";

const ccxt = require('../../ccxt.js')
const asTable = require('as-table')
const log = require('ololog').configure({ locate: false })


const exchange = new ccxt.blockchaincom({
    'secret': 'SECRET',
})

// blockchaincom specific internal beneficiary id
const withdrawal_beneficiary = 'WITHDRAWAL_BENEFICIARY'



require('ansicolor').nice

; (async () => {

    const markets = await exchange.loadMarkets ()

    try {
        const code = 'USDT'
        const amount = 5

        // fetch withdrawal beneficiary ids
        const whiteList = await exchange.privateGetWhitelistCurrency({'currency': code})
        log('Withdrawl Whitelist'.green, whiteList)

        // withdrawal
        let withdrawal = await exchange.withdraw(code, amount, undefined, undefined, { 'beneficiary': withdrawal_beneficiary })
        log('Withdrawal'.green, withdrawal)

    } catch (e) {
        if (e instanceof ccxt.DDoSProtection || e.message.includes('ECONNRESET')) {
            log.bright.yellow('[DDoS Protection] ' + e.message)
        } else if (e instanceof ccxt.RequestTimeout) {
            log.bright.yellow('[Request Timeout] ' + e.message)
        } else if (e instanceof ccxt.AuthenticationError) {
            log.bright.yellow('[Authentication Error] ' + e.message)
        } else if (e instanceof ccxt.ExchangeNotAvailable) {
            log.bright.yellow('[Exchange Not Available Error] ' + e.message)
        } else if (e instanceof ccxt.ExchangeError) {
            log.bright.yellow('[Exchange Error] ' + e.message)
        } else if (e instanceof ccxt.NetworkError) {
            log.bright.yellow('[Network Error] ' + e.message)
        } else {
            throw e;
        }
    }

})()
