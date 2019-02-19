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
async function subscribeOrderBook(id, apiKey, secret, limit, symbols, eventSymbols) {
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

  console.log('subscribe: ' + symbols.join(','));
  await exchange.websocketSubscribeAll(eventSymbols);
  console.log('subscribed: ' + symbols.join(','));
  await sleep(10 * 1000);

  console.log('unsubscribe: ' + symbols.slice(0,1).join(','));
  await exchange.websocketUnsubscribeAll(eventSymbols.slice(0,1));
  console.log('unsubscribed: ' + symbols.slice(0,1).join(','));
  await sleep(10 * 1000);

  console.log('unsubscribe: ' + symbols.slice(1).join(','));
  await exchange.websocketUnsubscribeAll(eventSymbols.slice(1));
  console.log('unsubscribed: ' + symbols.slice(1).join(','));
  await sleep(2 * 1000);

}

(async function main() {
  try {
    if (process.argv.length > 6) {
      const id = process.argv[2]
      const apiKey = process.argv[3]
      const secret = process.argv[4]
      const limit = parseInt (process.argv[5])
      const symbols = [];
      const eventSymbols = [];
      for (let i = 6 ; i < process.argv.length; i++) {
          symbols.push (process.argv[i].toUpperCase ())
          eventSymbols.push({
              "event": "ob",
              "symbol": process.argv[i],
              "params": {
                  'limit': limit  
              }
          });
      }
      //
      // this call gets live orderbook 
      const ob = await subscribeOrderBook(id, apiKey, secret, limit, symbols, eventSymbols);
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
