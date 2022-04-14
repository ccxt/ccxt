self.importScripts('https://unpkg.com/ccxt@1.79.2/dist/ccxt.browser.js');

console.log("Loaded ccxt version:", self.ccxt.version);

var exchangeInstance = undefined;

// handler of received messages
self.onmessage = async function handler(msg) {
  await handleMessageFromMain(msg)
}

// get messages from the main script
async function handleMessageFromMain(msg) {
  console.log(msg.data);
  var [exchange, symbol, interval] = msg.data;
  console.log('Worker received:', symbol,exchange, interval)
  interval = parseInt(interval)
  await processTicker(symbol, exchange)  
  // schedule process ticker execution
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
  var baseVolume = result['baseVolume']
  var ourTimestamp = Date.now()
  // send the data back to the main script
  postMessage([symbol, last, baseVolume, timestamp, ourTimestamp]);
}

async function fetchTicker(symbol){
  // use ccxt to fetch ticker info
  var result = await exchangeInstance.fetchTicker(symbol)
  return result;
}