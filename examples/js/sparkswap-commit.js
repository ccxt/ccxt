'use strict'

const ccxt = require('../../ccxt')
const log = require('ololog').configure ({ locate: false })

require ('ansicolor').nice

const SPARKSWAP_UID = process.env_SPARKSWAP_UID || 'sparkswap'
const SPARKSWAP_PASSWORD = process.env.SPARKSWAP_PASSWORD || 'sparkswap'
const SPARKSWAP_HOST = process.env.SPARKSWAP_HOST || 'http://localhost:27592'

;(async () => {

  // Instantiate the exchange. All object arguments below ARE REQUIRED to use the
  // sparkswap ccxt class.
  //
  // uid - the username set on your broker daemon
  // password - the password set on your broker daemon
  // url - the url of your broker daemon
  let exchange = new ccxt.sparkswap({
      'uid': SPARKSWAP_UID,
      'password': SPARKSWAP_PASSWORD,
      'urls': {
        'api': SPARKSWAP_HOST,
      }
  });

  // The following example shows you how to programmitcally commit funds to the
  // sparkswap exchange.
  try {
    const market = 'BTC/LTC'
    const symbol = 'BTC'

    // Create a deposit address
    const depositAddress = await exchange.createDepositAddress(symbol)
    log(`Deposit your ${symbol} funds into: ${depositAddress}`)

    // IMPORTANT: Make sure to wait for funds to drop, this may take between 3-5
    // block confirmations (30 min to 1 hour)

    // Grab the balance once funds have been deposited
    const balances = await exchange.fetchBalance()
    const balanceToCommit = balances[symbol].free

    log(balances)
    log(`Balance to commit: ${balanceToCommit}`)

    // Once funds are deposited, you can then commit the balance to a specific
    // market
    await exchange.commit(symbol, balanceToCommit, market)
    log('Committed balance successfully')
  } catch(e) {
    log.bright.yellow('Failed to commit balance: ' + e.message)
  }
})()
