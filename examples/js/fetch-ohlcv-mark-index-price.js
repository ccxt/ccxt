const ccxt = require('../../ccxt')

// -----------------------------------------------------------------------------

console.log('CCXT Version:', ccxt.__version__)

// -----------------------------------------------------------------------------

const exchange = new ccxt.binance({
  "options": {
    "defaultType": "future"
  }}
)

// -----------------------------------------------------------------------------

const markPriceKlines = async () => {
  markKlines = await exchange.fetchOHLCV(
    symbol='ADA/USDT', 
    timeframe='1h', 
    undefined, 
    undefined, 
    params={price: 'mark'}
  );
  console.log(markKlines);
}

markPriceKlines();

// Convenience methods -------------------------------------------------------

const markAndIndexPriceKlines = async () => {
  markKlines = await exchange.fetchMarkOHLCV(
    symbol='ADA/USDT',
    timeframe='1h',
  );
  indexKlines = await exchange.fetchIndexOHLCV(
    symbol='ADA/USDT',
    timeframe='1h',
  );
  console.log(markKlines);
  console.log(indexKlines);
}

markAndIndexPriceKlines();