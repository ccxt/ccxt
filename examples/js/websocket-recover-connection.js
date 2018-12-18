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
let notRecoverableError = false;
let nextRecoverableErrorTimeout = null;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function doUnsubscribe(exchange, symbols, params) {
    for (let i = 0; i < symbols.length; i++) {
        let symbol = symbols[i];
        console.log('unsubscribe: ' + symbol);
        await exchange.websocketUnsubscribe('ob', symbol, params);
        console.log('unsubscribed: ' + symbol);
    }
}
async function doSubscribe(exchange, symbols, params) {
    for (let i = 0; i < symbols.length; i++) {
        if (notRecoverableError) return;
        let symbol = symbols[i];
        console.log('subscribe: ' + symbol);
        await exchange.websocketSubscribe('ob', symbol, params);
        console.log('subscribed: ' + symbol);
    }
    /* hack to emit websocket error */
    const seconds2wait = getRandomInt(5,10);
    console.log("NEXT PROGRAMATED WEBSOCKET ERROR AFTER " + seconds2wait + " seconds");
    nextRecoverableErrorTimeout = setTimeout (function(){
        const keys = Object.keys(exchange.websocketContexts);
        const keyIndex = getRandomInt(0, keys.length-1);
        const contextId = keys[keyIndex];
        exchange.websocketContexts[contextId]['conx'].conx.emit('err','recoverable error');
    }, seconds2wait * 1000);
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

          var exchange = new ccxt[id]({
            apiKey: apiKey,
            secret: secret,
            enableRateLimit: true,
            verbose: false,
            // agent: agent
          });
          exchange.on('err', (err, conxid) => {
            try {
                console.log("error in contextid: " + conxid);
                console.log(err);
                exchange.websocketClose(conxid);
                if (err instanceof ccxt.NetworkError){
                    console.log("waiting 5 seconds ...");
                    sleep(5 * 1000).then(async ()=>{
                        try {
                            if (notRecoverableError) return;
                            console.log("subscribing again ...");
                            await doSubscribe (exchange, symbols, {
                            // contract_type: 'next_week',
                            'limit': limit,
                            });
                        } catch (ex){
                            console.log(ex);
                        }
                    });
                } else {
                    console.log("unsubscribing all ...");
                    notRecoverableError = true;
                    clearTimeout(nextRecoverableErrorTimeout);
                    doUnsubscribe(exchange, symbols)
                    .then(() => console.log("unsubscribed all"))
                    .catch((ex)=>{
                        console.log(ex);
                    });
                }
            } catch (ex) {
              console.log(ex);
            }
          });
          exchange.on('ob', (market, ob) => {
            console.log('ob received: ', market, ob);
            // console.log (ob);
          });
          await exchange.loadMarkets();
          setTimeout (function(){
            const keys = Object.keys(exchange.websocketContexts);
            const keyIndex = getRandomInt(0, keys.length-1);
            const contextId = keys[keyIndex];
            exchange.emit('err', new ccxt.ExchangeError ('not recoverable error'), contextId);
        }, 30 * 1000);
          await doSubscribe (exchange, symbols, {
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
})();
