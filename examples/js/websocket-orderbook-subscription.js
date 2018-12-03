'use strict';

const asTable = require('as-table'),
  log = require('ololog').noLocate,
  ansi = require('ansicolor').nice,
  ccxt = require('../../ccxt.js'),
  cex = require('../../js/cex');
//const HttpsProxyAgent = require('https-proxy-agent');

function printUsage() {
  log(
    'Usage: node',
    process.argv[1],
    'exchange',
    'apiKey',
    'secret',
    'limit',
    'symbol',
    '...'
  );
}
let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let exchange;
async function fetchOrderBook(id, apiKey, secret, limit, symbols, params) {
  // const proxy = process.env.http_proxy || 'http://localhost:7080'; // HTTP/HTTPS proxy to connect to（only local http proxy work at "here"）
  // const agent = new HttpsProxyAgent(proxy);
  exchange = new ccxt[id]({
    apiKey: apiKey,
    secret: secret,
    enableRateLimit: true,
    verbose: true,
    // agent: agent
  });
  exchange.on('err', (err, conxid) => {
    try {
      console.log(err);
      exchange.websocketClose(conxid);
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
      await exchange.websocketSubscribe('ob', symbol, params);
      console.log('subscribed: ' + symbol);
      let ob = await exchange.websocketFetchOrderBook(symbol, limit);
      console.log('ob fetched: ' + symbol, ob);
      // console.log (ob);
      await sleep(5 * 1000);
    }

    for (let i = 0; i < symbols.length; i++) {
      let symbol = symbols[i];
      console.log('unsubscribe: ' + symbol);
      await exchange.websocketUnsubscribe('ob', symbol, params);
      console.log('unsubscribed: ' + symbol);
      await sleep(5 * 1000);
    }
  }
}

(async function main() {
  try {
    if (process.argv.length > 6) {
      const id = process.argv[2]
      const apiKey = process.argv[3]
      const secret = process.argv[4]
      const limit = parseInt (process.argv[5])
      const symbols = [];
      for (let i = 6 ; i < process.argv.length; i++) {
          symbols.push (process.argv[i].toUpperCase ())
      }
      //
      // this call gets live orderbook 
      const ob = await fetchOrderBook(id, apiKey, secret, limit, symbols, {
        // contract_type: 'next_week',
        'limit': limit,
      });
    } else {
      printUsage ()
    }
  } catch (ex) {
    log('Error:'.red, ex);
    log(ex.stack);
    exchange.websocketClose();
  }
  // process.exit ()
})();
