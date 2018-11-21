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
    'event',
    'symbol',
    '[param:value ...]'
  );
}
let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
(async function main() {
    try {
      if (process.argv.length > 4) {
        const id = process.argv[2];
        const apiKey = process.env.API_KEY;
        const secret = process.env.SECRET;
        const event = process.argv[3];
        const symbol = process.argv[4];
        const params = {};
        for (var i=5;i<process.argv.length;i++){
            const parts = process.argv[i].split(':',2);
            params[parts[0]] = parts[1];
        }

        let exchange = new ccxt[id]({
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
          exchange.on(event, (market, data) => {
            console.log(event, ' received: ', market, data);
            // console.log (ob);
          });
          await exchange.loadMarkets();
        
        await exchange.websocketSubscribe(event, symbol, params);
        console.log('subscribed: ' + symbol);
        //await sleep(3000);
        //await exchange.websocketUnsubscribe(event, symbol);
        //console.log('unsubscribed: ' + symbol);

    } else {
        printUsage ()
      }
    } catch (ex){
        console.log(ex);
    }
})();
