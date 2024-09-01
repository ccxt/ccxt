//
// Usage:
//
//   tsx ./utils/update-static-json.ts binance BTC/USDT ETH/USDT
//
import fs from 'fs';
import { platform } from 'process'
import ccxt from '../ts/ccxt.js';

const [,, ...args] = process.argv;

let __dirname = new URL('.', import.meta.url).pathname;
if (platform === 'win32' && __dirname[0] === '/') {
    __dirname = __dirname.substring (1);
}
const rootDir = __dirname + '/../';

function write (filename, data) {
    return fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}
function die (errorMessage = undefined, code = 1) {
    console.log (errorMessage || 'Please specify correct format, e.g. `node ./utils/update-static-json.js binance BTC/USDT ETH/USDT` (you can also pass a CurrencyCode instead of a symbol)');
    process.exit(code);
}

const exchangeId = args[0];
const filePathForMarkets = rootDir + `/ts/src/test/static/markets/${exchangeId}.json`;
const marketsJson = JSON.parse (fs.readFileSync(filePathForMarkets, "utf8"));
const filePathForCurrencies = rootDir + `/ts/src/test/static/currencies/${exchangeId}.json`;
const currenciesJson = JSON.parse (fs.readFileSync(filePathForCurrencies, "utf8"));

if (!exchangeId) {
    die ();
}

// remove first item
args.shift ();
const symbolsOrCurrencies = args;

async function main () {
    try {
        const exchange = new ccxt[exchangeId]();
        await exchange.loadMarkets();

        for (const symbolOrCurrency of symbolsOrCurrencies) {

            if (!symbolOrCurrency) {
                die ();
            }
            if (!ccxt.exchanges.includes(exchangeId)) {
                console.log('Exchange id ' + exchangeId + ' not found in exchanges.json');
                process.exit(1);
            }
            // check whether it's market or currency
            const isMarketOrCurrency = symbolOrCurrency.includes('/');

            const targetObject = isMarketOrCurrency ? exchange.markets[symbolOrCurrency] : exchange.currencies[symbolOrCurrency];
            if (!targetObject) {
                // @ts-expect-error
                die ('Symbol or Currency not found in ' + exchangeId, 1);
            }
            // write to file
            if (isMarketOrCurrency) {
                // if it's market, then write market object and currencies too
                // market object
                marketsJson[symbolOrCurrency] = targetObject;
                write (filePathForMarkets, marketsJson);
                // base & quote currency objects
                const base = targetObject.base;
                const quote = targetObject.quote;
                const baseCurrency = exchange.currencies[base];
                const quoteCurrency = exchange.currencies[quote];
                currenciesJson[base] = baseCurrency;
                currenciesJson[quote] = quoteCurrency;
                write (filePathForCurrencies, currenciesJson);
            } else {
                // if currency, then only write currency object
                currenciesJson[symbolOrCurrency] = targetObject;
                write(filePathForCurrencies, currenciesJson);
            }
        }
        // @ts-expect-error
        die ('Finished! ' + exchangeId + ' > ' + JSON.stringify (symbolsOrCurrencies), 0);
    } catch (e) {
        // @ts-expect-error
        die ('Static data write error: ' + e.stack.toString (), 1);
    }
}

main();
