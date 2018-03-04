const ccxt      = require ('../../ccxt.js')

const btcTrade = new ccxt.btctrade();

btcTrade.fetchOrderBook('BTC/BRL')
  .then(e => console.log(e))
  .catch(e => console.log(e));