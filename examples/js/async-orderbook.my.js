'use strict';

const asTable = require('as-table'),
  log = require('ololog').noLocate,
  ansi = require('ansicolor').nice,
  ccxt = require('../../ccxt.js'),
  cex = require('../../js/cex');
const HttpsProxyAgent = require('https-proxy-agent');

function printUsage() {
  log(
    'Usage: node',
    process.argv[1],
    'exchange',
    'apiKey',
    'secret',
    'depth',
    'symbol',
    '...'
  );
}
let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let exchange;
async function fetchOrderBook(id, apiKey, secret, depth, symbols, params) {
  const proxy = process.env.http_proxy || 'http://localhost:7080'; // HTTP/HTTPS proxy to connect to（only local http proxy work at "here"）
  const agent = new HttpsProxyAgent(proxy);
  exchange = new ccxt[id]({
    apiKey: apiKey,
    secret: secret,
    enableRateLimit: true,
    verbose: true,
    agent: agent
  });
  exchange.on('err', (err, conxid) => {
    try {
      console.log(err);
      exchange.asyncClose(conxid);
    } catch (ex) {
      console.log(ex);
    }
  });
  exchange.on('ob', (market, ob) => {
    console.log('ob received: ', market, ob);
    // console.log (ob);
  });
  await exchange.loadMarkets();

  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < symbols.length; i++) {
      let symbol = symbols[i];
      console.log('subscribe: ' + symbol);
      await exchange.asyncSubscribe('ob', symbol, params);
      console.log('subscribed: ' + symbol);
      let ob = await exchange.asyncFetchOrderBook(symbol, depth);
      console.log('ob fetched: ' + symbol, ob);
      // console.log (ob);
      await sleep(5 * 1000);
    }

    for (let i = 0; i < symbols.length; i++) {
      let symbol = symbols[i];
      console.log('unsubscribe: ' + symbol);
      await exchange.asyncUnsubscribe('ob', symbol, params);
      console.log('unsubscribed: ' + symbol);
      await sleep(5 * 1000);
    }
  }
}

(async function main() {
  try {
    const ob = await fetchOrderBook('okex', '', '', 5, ['BTC/USDT'], {
      contract_type: 'next_week',
      depth: 20
    });
  } catch (ex) {
    log('Error:'.red, ex);
    log(ex.stack);
    exchange.asyncClose();
  }
  // process.exit ()
})();
