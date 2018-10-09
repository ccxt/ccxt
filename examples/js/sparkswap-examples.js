'use strict'

const https = require ('https');
const ccxt = require('../../ccxt')
const log = require('ololog').configure ({ locate: false })

require ('ansicolor').nice

const SPARKSWAP_UID = process.env.SPARKSWAP_UID || 'sparkswap'
const SPARKSWAP_PASSWORD = process.env.SPARKSWAP_PASSWORD || 'sparkswap'
const SPARKSWAP_HOST = process.env.SPARKSWAP_HOST || 'https://localhost:27592'

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
      },
      // Since we're using self-signed certificates, there won't be a match with your built-in CAs,
      // so by default the connection would be rejected because it cannot verify the server
      // is who they say they are. Since the sparkswap daemon is owned by us, we will simply
      // disable this check. The connection will still be encrypted.
      'agent': new https.Agent ({ 'rejectUnauthorized': false })
  });

  ////////////////////////////
  // Creating a Deposit Address
  ////////////////////////////
  try {
    const code = 'BTC'
    log('Creating new deposit address', { code })
    var address = await exchange.createDepositAddress(code)
    log('Created new deposit address', { address })
  } catch(e) {
    log.bright.yellow('Failed to createDepositAddress: ' + e.message)
  }

  ////////////////////////////
  // Commit funds to the sparkswap exchange
  ////////////////////////////
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

  ////////////////////////////
  // View your wallet balances
  ////////////////////////////
  try {
    var balances = await exchange.fetchBalance()
    log(balances)
  } catch(e) {
    log.bright.yellow('Failed to fetchBalance: ' + e.message)
  }


  ////////////////////////////
  // View the orderbook for a particular market
  ////////////////////////////
  try {
    const symbol = 'BTC/LTC'
    log('Fetching orderbook', { symbol })
    const response = await exchange.fetchOrderBook(symbol)
    log('Fetched orderbook', {symbol, datetime: response['datetime']})
    log(response)
  } catch(e) {
    log.bright.yellow('Failed to fetchOrderBook: ' + e.message)
  }

  ////////////////////////////
  // Create a market order on the sparkswap exchange
  ////////////////////////////
  try {
    const symbol = 'BTC/LTC'
    const type = 'market'
    const side = 'buy'
    const amount = 0.1
    log('Attempting to create order')
    const res = await exchange.createOrder(symbol, type, side, amount)
    log('Successfully created order', { id: res['id'] }) // my-order-id

  } catch(e) {
    log.bright.yellow('Failed to createOrder: ' + e.message)
  }

  ////////////////////////////
  // View information on a specific order
  ////////////////////////////
  try {
    const orderId = 'my-order-id'
    var order = await exchange.fetchOrder(orderId)
    log(order)
  } catch(e) {
    log.bright.yellow('Failed to fetchBalance: ' + e.message)
  }


  ////////////////////////////
  // Cancel an order
  ////////////////////////////
  try {
    const id = 'your-order-id'
    log(`Attempting to cancel order: id: ${id}`)
    await exchange.cancelOrder(id)
    log(`Successfully cancelled order: id: ${id}`)
  } catch(e) {
    log.bright.yellow('Failed to cancelOrder: ' + e.message)
  }

  ////////////////////////////
  // Release funds on a particular market from the sparkswap exchange
  ////////////////////////////
  try {
    const symbol = 'BTC/LTC'
    await exchange.release (symbol)
    log('Released funds successfully')
  } catch(e) {
    log.bright.yellow('Failed to release channels: ' + e.message)
  }

  ////////////////////////////
  // Withdraw unused funds from your wallet on the sparkswap exchange
  ////////////////////////////
  try {
    const code = 'BTC'
    const amount = 2.0
    const address = 'deposit-wallet-address'
    log(`Attempting to withdraw ${amount} ${code} from wallet to ${address}`)
    var response = await exchange.withdraw(code, amount, address)
    log(`Successfully withdrew ${amount} ${code} from wallet to ${address}, id: ${response['id']}`)
  } catch(e) {
    log.bright.yellow('Failed to withdraw: ' + e.message)
  }
})()
