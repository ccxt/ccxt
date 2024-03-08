/* eslint-disable no-console */
/* Get your list of trades on Binance, up to 500. More trades can be obtained, but I don't have an account with more trades to test against.

Note that Binance forces you to get trades *by symbol*:
https://github.com/binance-exchange/binance-official-api-docs/pull/6

This means that if you want to make sure you get *all* your trades, you need to run fetchMyTrades for all markets (233 as of Jan 2018). This will take a long time. To get results faster, you can specify a list of bases you remember having traded. Don't include quote currencies BTC, ETH or BNB in that list, because many markets have them as the quote currency, and that will make the script slower. Do include USDT if you've traded it.
 */
import ccxt from 'ccxt';
import fs from 'fs';
import { csvFormat } from 'd3-dsv';
import Big from 'big.js';

// Replace with '' if you don't remember all the coins you've traded, but the script will take minutes to run
const basesYouRememberTrading = 'LTC|TRX';  // do NOT include quote symbols BTC, ETH, and BNB
const binance = new ccxt.binance({
  apiKey: 'REPLACE_ME',
  secret: 'REPLACE_ME',
});

/**
 * Convert `YYYY-MM-DD HH:MM:SS.mmmZ` string to the local time zone in a format parsable by spreadsheets
 * @param {String} d - The datetime
 * @return {String} `YYYY-MM-DD HH:MM:SS` string in the local timezone
 */
function time2local(d) {
  d = new Date(d);
  return new Date(d - d.getTimezoneOffset() * 60000)  // the offset is in minutes
    .toISOString().slice(0, -5)  // drop the .milliseconds and 'Z'
    .replace('T', ' ');  // so that spreadsheets can parse it as a date
}

/**
 * Add a value to an accumulator expression by using + or -. Return a spreadsheet expression.
 * tackOn(1, 2) => `=1+2`
 * tackOn('=1.5+2.3', 3) => `=1.5+2.3+3`
 * tackOn('=-1', -2) => `=-1-2`
 * @param {String|Number} accumulator - What to add to
 * @param {String|Number} value - What to add
 * @returns {String} Spreadsheet expression summing up the accumulator and the value
 */
function tackOn(accumulator, value) {
  return `${accumulator}+${value}`.replace(/^(?!=)/, '=').replace('+-', '-');
}


(async function main() {
  const filename = process.argv[2] || 'binance-trades.csv';
  // Quote symbols are only BTC, ETH, BNB, USDT and the bogus "456"
  const markets = await binance.loadMarkets();
  const symbolsPossiblyTraded = [];
  for (const market of Object.keys(markets))
    if (new RegExp(String.raw`\b(${basesYouRememberTrading})\b`).test(market))
      symbolsPossiblyTraded.push(market);

  const trades = [];
  let lastOrder;
  for (const symbol of symbolsPossiblyTraded) {
    const symbolTrades = await binance.fetchMyTrades(symbol);
    for (const t of symbolTrades) {

      // Convert to Big numbers, overwriting ccxt's fields
      t.amount = Big(t.info.qty);
      t.cost = t.amount.times(t.info.price);  // Binance doesn't provide the cost in .info
      t.fee.cost = Big(t.info.commission);
      t.price = Big(t.info.price);

      // Swap the buy and sell sides to keep the Input negative
      let inAmount, inCurrency, outAmount, outCurrency;
      if (t.side === 'buy') {
        // buy ADA/BTC means buy ADA with BTC, i.e. sell BTC to get ADA, so minus BTC as input, plus ADA as output
        [inAmount, inCurrency] = [Big(0).minus(t.cost), t.symbol.match('(.*)/(.*)')[2]];  // cost is in the quote currency
        [outAmount, outCurrency] = [t.amount, t.symbol.match('(.*)/(.*)')[1]];  // amount is in the base currency
      } else {
        // sell ADA/BTC means minus ADA, plus BTC
        [inAmount, inCurrency] = [Big(0).minus(t.amount), t.symbol.match('(.*)/(.*)')[1]];
        [outAmount, outCurrency] = [t.cost, t.symbol.match('(.*)/(.*)')[2]];
      }

      const lastTrade = trades.length && trades[trades.length - 1];
      if (lastTrade && lastOrder === t.order) {
        lastTrade.Date = time2local(t.datetime);  // use the latest of the trade fills
        lastTrade.Input = tackOn(lastTrade.Input, inAmount);
        lastTrade.Output = tackOn(lastTrade.Output, outAmount);
        lastTrade.Fee = tackOn(lastTrade.Fee, t.fee.cost);  // t.fee.cost after https://github.com/ccxt/ccxt/issues/522
        lastTrade.Notes = `order ${t.order} - multiple fills`;
        if (lastTrade.CurrencyFee !== t.fee.currency)
          throw new Error(`Fee charged in different currencies for order ${t.order}. Please file an issue.`);
      } else {
        trades.push({
          Date: time2local(t.datetime),
          Input: inAmount,
          CurrencyIn: inCurrency,
          Output: outAmount,
          CurrencyOut: outCurrency,
          Fee: t.fee.cost,
          CurrencyFee: t.fee.currency,
          ExchangeRate: t.price,
          Notes: `trade ${t.id} of ${t.side} order ${t.order}`,
        });
      }
      lastOrder = t.order;
    }
    console.log(`Fetched ${symbolTrades.length} trades for ${symbol}`);
  }

  trades.sort((a, b) => a.Date.localeCompare(b.Date));
  return fs.writeFileSync(filename, csvFormat(trades));

}());
