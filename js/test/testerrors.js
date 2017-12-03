'use strict';

const ccxt = require('../../ccxt');
const keys = require('../../../mm/config');

const argv = process.argv;

const [/* node */, script, exchangeId] = argv;
if (!exchangeId) {
  console.error(`Usage: node ${script} exchangeId`);
  return;
}

const exchange = new ccxt[exchangeId](keys[exchangeId]);

async function main() {
  await exchange.loadMarkets();
  try {
    await exchange.createLimitBuyOrder('BTC/USD', 1000, 1000);
  } catch (e) {
    if (e instanceof ccxt.InsufficientFunds) {
      // swallow
    } else {
      throw e;
    }
  }

  try {
    await exchange.cancelOrder(1);
  } catch (e) {
    if (e instanceof ccxt.OrderNotFound) {
      // swallow
    } else {
      throw e;
    }
  }

  await exchange.fetchOpenOrders('BTC/USD');
}

main();
