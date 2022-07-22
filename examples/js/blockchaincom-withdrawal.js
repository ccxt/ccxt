"use strict";

const ccxt = require('../../ccxt.js')
const asTable = require('as-table')
const log = require('ololog').configure({ locate: false })


const exchange = new ccxt.blockchaincom({
    'secret': 'YOUR_API_SECRET',
})

// blockchaincom specific internal beneficiary id
const withdrawal_beneficiary = 'WITHDRAWAL_BENEFICIARY';


(async () => {

    const markets = await exchange.loadMarkets ()

    try {
        const code = 'USDT'
        const amount = 5

        // fetch withdrawal beneficiary ids
        const whiteList = await exchange.privateGetWhitelistCurrency({'currency': code})
        log('Withdrawl Whitelist', whiteList)

        // withdrawal
        let withdrawal = await exchange.withdraw(code, amount, undefined, undefined, { 'beneficiary': withdrawal_beneficiary })
        log('Withdrawal', withdrawal)

    } catch (e) {
        if (e instanceof ccxt.DDoSProtection || e.message.includes('ECONNRESET')) {
            log('[DDoS Protection] ' + e.message)
        } else if (e instanceof ccxt.RequestTimeout) {
            log('[Request Timeout] ' + e.message)
        } else if (e instanceof ccxt.AuthenticationError) {
            log('[Authentication Error] ' + e.message)
        } else if (e instanceof ccxt.ExchangeNotAvailable) {
            log('[Exchange Not Available Error] ' + e.message)
        } else if (e instanceof ccxt.ExchangeError) {
            log('[Exchange Error] ' + e.message)
        } else if (e instanceof ccxt.NetworkError) {
            log('[Network Error] ' + e.message)
        } else {
            throw e;
        }
    }

})()
