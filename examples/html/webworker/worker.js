self.importScripts('ccxt.browser.js');

console.log("Loaded ccxt version:", self.ccxt.version);

var exchangeInstance = undefined;


self.onmessage = async function handler(msg) {
  await handleMessageFromMain(msg)
}

async function handleMessageFromMain(msg) {
  console.log(msg.data);
  var [exchange, symbol, interval] = msg.data;
  console.log('Worker received:', symbol,exchange, interval)
  interval = parseInt(interval)
  await processTicker(symbol, exchange)  
  setInterval (async () => {
    await processTicker(symbol, exchange)  
  }, interval)
}

async function processTicker(symbol, exchangeId) {
  if (exchangeInstance === undefined) {
    exchangeInstance = new ccxt[exchangeId]
  }
  var result = await fetchTicker(symbol)
  var symbol = result['symbol']
  var last = result['last']
  var timestamp = result['timestamp']
  var ourTimestamp = Date.now()
  postMessage([symbol, last, timestamp, ourTimestamp]);
}

async function fetchTicker(symbol){
  var result = await exchangeInstance.fetchTicker(symbol)
  return result;
}
