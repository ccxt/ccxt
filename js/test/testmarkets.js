'use strict'

const ccxt = require('./ccxt');
const liqui = new ccxt['liqui'];

async function main() {
  await liqui.loadMarkets();

  const market = liqui.getMarket('BTC/USDT');

  const amount = market.amountToPrecision(1.123456789);
  console.log(amount); // should truncate to 1.12345678
  console.log(market.market);
}

main();
