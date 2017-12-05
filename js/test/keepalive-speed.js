'use strict';

const ccxt = require('../../ccxt');
const config = require('../../keys');

const name = process.argv[2];
const wait = (process.argv[3] == 'wait') ? true : false;

const exchange = new ccxt[name](config[name]);
exchange.enableRateLimit = true;

console.log(`Exchange: ${exchange.id}`);

async function main() {
  const startTime = Date.now();
  const all = [];
  for (let i = 0; i < 5; i++) {
    const p = exchange.fetchOrderBook('BTC/USD');
    if (wait) {
      await p;
    }
    all.push(p);
  }
  await Promise.all(all);
  const endTime = Date.now();
  console.log(`Elapsed: ${endTime - startTime}ms`);
}

main();
