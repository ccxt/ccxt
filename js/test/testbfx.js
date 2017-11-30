'use strict';

const ccxt = require('../../ccxt');
const keys = require('../../zero-balance-keys.json');
const ex = 'bitfinex';
const bfx = new ccxt[ex](keys[ex]);


async function main() {
  await bfx.loadMarkets();
  try {
    await bfx.createLimitBuyOrder('BTC/USD', 1000, 1000);
  } catch (e) {
    if (e instanceof ccxt.InsufficientFunds) {
      // swallow
    } else {
      throw e;
    }
  }
}

main();

